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
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const DB='/tmp/audit-pay.db', LOG='/tmp/audit-pay.log', SECRET='whsec_audit'
for (const f of [DB,DB+'-wal',DB+'-shm',LOG]) { try { rmSync(f,{force:true}) } catch {} }
const out=openSync(LOG,'a')
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out,out],env:{...process.env,
  PORT:String(port), DATABASE_PATH:DB, ALLOW_MOCK_PAYMENTS:'1', NODE_ENV:'development',
  STRIPE_SECRET_KEY:'sk_test_audit', STRIPE_WEBHOOK_SECRET:SECRET,
  STRIPE_PAYMENT_LINK_PASS:'https://buy.stripe.com/auditpass',
  STRIPE_PAYMENT_LINK_DIAMOND:'https://buy.stripe.com/auditdiamond'}})
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
if(fails.length){ console.log('FAIL:\n  - '+fails.join('\n  - ')); process.exit(1) }
console.log('PASS: pending -> active -> lapsed, forgeries refused, real events accepted.')
