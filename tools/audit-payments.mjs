/* Membership payments, end to end and adversarially.
 *
 * The two failures this guards against both LOOK FINE from one side:
 *
 *   - A forged webhook being accepted would grant paid memberships to anybody
 *     who can POST JSON.
 *   - A correctly signed webhook being REJECTED leaves every real payment stuck
 *     at 'pending' forever. That was a live bug: a global express.json() ate the
 *     raw body before signature verification could see it, and a test that only
 *     checked forged calls were refused passed happily throughout.
 *
 * So both directions are asserted, and the whole lifecycle after them. */
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { createHmac } from 'node:crypto'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
const TESTDB = await freshTestDb('payments')
const TESTDB1 = await freshTestDb('payments1')
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const DB='/tmp/audit-pay.db', LOG='/tmp/audit-pay.log', SECRET='whsec_audit'
for (const f of [DB,DB+'-wal',DB+'-shm',LOG]) { try { rmSync(f,{force:true}) } catch {} }
const out=openSync(LOG,'a')
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out,out],env:{...process.env,
  PORT:String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS:'1', NODE_ENV:'development',
  STRIPE_SECRET_KEY:'sk_test_audit', STRIPE_WEBHOOK_SECRET:SECRET,
  STRIPE_PAYMENT_LINK_PASS:'https://buy.stripe.com/auditpass',
  /* Deliberately carries a query string already — Stripe's dashboard hands
     links out that way, and string concatenation turns it into
     `?utm_source=beasty?client_reference_id=...`, one value Stripe cannot
     read and a payment that can never be matched to a member. */
  STRIPE_PAYMENT_LINK_DIAMOND:'https://buy.stripe.com/auditdiamond?utm_source=beasty'}})
const B=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(B+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}

const fails=[]; const check=(c,m)=>{ if(!c) fails.push(m) }
const post=async(p,body,cookie)=>{
  for(let i=0;i<12;i++){
    const h={'content-type':'application/json'}; if(cookie) h.cookie=cookie
    const r=await fetch(B+p,{method:'POST',headers:h,body:JSON.stringify(body)})
    if(r.status===429){ await new Promise(x=>setTimeout(x,5500)); continue }
    return {status:r.status, body:await r.json().catch(()=>({})), cookie:r.headers.get('set-cookie')}
  }
  throw new Error('rate limited for the whole run')
}
const hook=async(payload,sign=true)=>{
  const ts=String(Math.floor(Date.now()/1000))
  const h={'content-type':'application/json'}
  if(sign) h['stripe-signature']=`t=${ts},v1=${createHmac('sha256',SECRET).update(`${ts}.${payload}`).digest('hex')}`
  const r=await fetch(B+'/api/stripe/webhook',{method:'POST',headers:h,body:payload})
  return r.status
}

// a member, verified by code
await post('/api/members/start',{name:'Pat Osei',email:'pat@example.com'})
const line=readFileSync(LOG,'utf8').split('\n').filter(l=>l.includes('[login-code] pat@example.com ')).pop()
const code=line && line.match(/ (\d{6}) /)?.[1]
check(!!code,'no login code was issued')
const v=await post('/api/members/verify',{email:'pat@example.com',code})
check(v.status===201,'the member was not created')
const jar=(v.cookie||'').split(';')[0]
const id=v.body.id

// choosing a tier must hand back a link carrying the join, and stay pending
const t=await post('/api/members/tier',{tier:'diamond'},jar)
check(t.body.tierStatus==='pending','choosing a tier did not stay pending')
check(t.body.paymentsConfigured===true,'payments were not reported configured')
check(String(t.body.paymentLink).includes(`client_reference_id=${id}`),
  'the payment link carries no client_reference_id — a payment could never be matched to a member')
/*
  THE LINK IS A URL, and it has to survive being one.

  Built by concatenation it was `${base}?client_reference_id=...`, which loses
  a Payment Link that already carries a query string — Stripe's own dashboard
  hands those out — and produces `?a=b?client_reference_id=c`, where Stripe
  reads the whole tail as one value and the webhook can never match a member.
*/
const link=new URL(t.body.paymentLink)
check(link.searchParams.get('client_reference_id')===id,'client_reference_id does not parse out of the link')
check(link.searchParams.get('prefilled_email')==='pat@example.com',
  'the checkout does not prefill the address the member already proved')
check(link.searchParams.get('utm_source')==='beasty',
  'the link\u2019s own query string was destroyed by appending ours')

/* Every member response must say whether a checkout exists, not only the one
   that hands out a link — the membership screen has to know before a tap. */
const meCfg=await fetch(B+'/api/members/me',{headers:{cookie:jar}}).then(r=>r.json())
check(meCfg.paymentsConfigured===true,'/api/members/me does not report that payments are live')

// forged webhook refused
const forged=JSON.stringify({type:'checkout.session.completed',data:{object:{client_reference_id:id,customer:'cus_x'}}})
check(await hook(forged,false)===400,'AN UNSIGNED WEBHOOK WAS ACCEPTED')
const me1=await fetch(B+'/api/members/me',{headers:{cookie:jar}}).then(r=>r.json())
check(me1.tierStatus==='pending','a forged webhook changed the membership')

// correctly signed webhook accepted, and it activates
check(await hook(forged,true)===200,'A CORRECTLY SIGNED WEBHOOK WAS REJECTED — check the raw body')
const me2=await fetch(B+'/api/members/me',{headers:{cookie:jar}}).then(r=>r.json())
check(me2.tierStatus==='active','payment did not activate the membership')

// cancellation lapses it, matched by customer id
check(await hook(JSON.stringify({type:'customer.subscription.deleted',data:{object:{customer:'cus_x'}}}),true)===200,'the cancellation event was rejected')
const me3=await fetch(B+'/api/members/me',{headers:{cookie:jar}}).then(r=>r.json())
check(me3.tierStatus==='lapsed','a cancelled subscription left the membership active')

srv.kill()

/*
  AND THE SAME SERVER WITH NO LINKS SET, because the honest-when-unconfigured
  path is the one that ships until the operator pastes his Stripe links in. It
  must report false and hand back no link rather than a half-built URL.
*/
const port2=await freePort()
const DB2='/tmp/audit-pay2.db'
for (const f of [DB2,DB2+'-wal',DB2+'-shm']) { try { rmSync(f,{force:true}) } catch {} }
const LOG2='/tmp/audit-pay2.log'
try { rmSync(LOG2,{force:true}) } catch {}
const out2=openSync(LOG2,'a')
const env2={...process.env, PORT:String(port2), DATABASE_URL: TESTDB1.url, NODE_ENV:'development'}
delete env2.STRIPE_PAYMENT_LINK_PASS; delete env2.STRIPE_PAYMENT_LINK_DIAMOND
delete env2.STRIPE_SECRET_KEY; delete env2.STRIPE_WEBHOOK_SECRET
const srv2=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out2,out2],env:env2})
const B2=`http://localhost:${port2}`
for(let i=0;i<80;i++){try{if((await fetch(B2+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const post2=async(p,body,cookie)=>{
  for(let i=0;i<12;i++){
    const h={'content-type':'application/json'}; if(cookie) h.cookie=cookie
    const r=await fetch(B2+p,{method:'POST',headers:h,body:JSON.stringify(body)})
    if(r.status===429){ await new Promise(x=>setTimeout(x,5500)); continue }
    return {status:r.status, body:await r.json().catch(()=>({})), cookie:r.headers.get('set-cookie')}
  }
  throw new Error('rate limited for the whole run')
}
await post2('/api/members/start',{name:'Sam Reyes',email:'sam@example.com'})
const l2=readFileSync(LOG2,'utf8').split('\n').filter(l=>l.includes('[login-code] sam@example.com ')).pop()
const c2=l2 && l2.match(/ (\d{6}) /)?.[1]
const v2=await post2('/api/members/verify',{email:'sam@example.com',code:c2})
const jar2=(v2.cookie||'').split(';')[0]
const t2=await post2('/api/members/tier',{tier:'pass'},jar2)
check(t2.body.paymentLink===null,'a payment link was handed out with none configured')
check(t2.body.paymentsConfigured===false,'payments reported configured with no link set')
check(t2.body.tierStatus==='pending','the choice was not recorded without payments')

/* And with no webhook secret the route must not exist at all — an unverified
   webhook is a public endpoint that grants paid memberships. */
const w=await fetch(B2+'/api/stripe/webhook',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})
check(w.status===404,`the webhook answered ${w.status} with no signing secret set — it must not exist`)
srv2.kill()

if(fails.length){ console.log('FAIL:\n  - '+fails.join('\n  - ')); process.exit(1) }
console.log('PASS: links carry the member and prefill the address; unconfigured stays honest; pending -> active -> lapsed.')
