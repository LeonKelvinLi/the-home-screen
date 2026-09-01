/* One-time codes: the security properties, not just the happy path.
 *
 * Every assertion here is something that, if it broke, would be invisible from
 * the outside until somebody lost an account. The code never reaching the
 * client, no member existing before the address is proved, no oracle telling an
 * attacker who is a member, and a lockout that survives the real code arriving
 * afterwards. */
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
const TESTDB = await freshTestDb('otp')
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const DB='/tmp/audit-otp.db', LOG='/tmp/audit-otp.log'
for (const f of [DB,DB+'-wal',DB+'-shm',LOG]) { try { rmSync(f,{force:true}) } catch {} }
const out=(await import('node:fs')).openSync(LOG,'a')
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out,out],env:{...process.env,PORT:String(port),DATABASE_URL: TESTDB.url,ALLOW_MOCK_PAYMENTS:'1',NODE_ENV:'development',
  /* Rotation is what this audit is about, so the rapid-reuse window is held
     SHUT: with it open a back-to-back resend correctly reuses the live code,
     which audit-signin-flow covers. Here every resend must rotate and the old
     code must die — the after-cooldown contract, tested without the wait. */
  RESEND_REUSE_MS:'0'}})
const B=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(B+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}

/*
  Retries a 429 rather than counting it as an answer. The server rate-limits
  these endpoints on purpose, and an audit that mistakes "too many requests" for
  "wrong code" reports a lockout working when only three of five guesses ever
  landed — which is exactly what the first run of this file did.
*/
const post=async(p,body)=>{
  for (let i=0;i<12;i++) {
    const r=await fetch(B+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})
    if (r.status===429) { await new Promise(x=>setTimeout(x,5500)); continue }
    return {status:r.status, body:await r.json().catch(()=>({})), cookie:r.headers.get('set-cookie')}
  }
  throw new Error('rate limited for the whole run')
}
const codeFor = (email) => {
  // Plain string scan rather than a built regex: the email contains characters
  // a RegExp constructor treats as syntax, and escaping them through a template
  // literal is how the first version ended up with a broken character class.
  const lines = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `))
  const last = lines.pop()
  const m = last && last.match(/ (\d{6}) /)
  return m ? m[1] : null
}
/*
  THREE NUMBERS, EACH USED THROUGHOUT — "we want only SMS", 2026-08-29.

  Named constants rather than literals repeated at every call site, because the
  identity has to be the SAME string in the start body, in the log scan and in
  the verify body; a fresh one per call silently turns every assertion into a
  test of an account that does not exist. 555-01xx is the reserved fictional
  exchange: right in a test, wrong in production.
*/
const stamp = String(Date.now()).slice(-5)
const ADA = `+1510555${stamp.slice(-4)}`
const BO = `+1510554${stamp.slice(-4)}`
const RESEND = `+1510553${stamp.slice(-4)}`
/* Still an address, on purpose: the oracle check needs a destination that is
   certainly not a member, and the email path stays open for the accounts that
   predate the change. */
const STRANGER = 'nobody-here@example.com'

const fails=[]
const check=(cond,msg)=>{ if(!cond) fails.push(msg) }

// 1. the code never reaches the client
const start=await post('/api/members/start',{name:'Ada Vance',phone:ADA})
check(start.status===202,'start did not accept')
check(!JSON.stringify(start.body).match(/\d{6}/),'THE CODE WAS RETURNED TO THE CLIENT')

// 2. nothing exists until it is proved
const before=await fetch(B+'/api/members/me').then(r=>r.status)
check(before===401,'a session existed before the code was confirmed')

// 3. a wrong code is refused, the right one works
const wrong=await post('/api/members/verify',{phone:ADA,code:'000000'})
check(wrong.status===400,'a wrong code was accepted')
const real=codeFor(ADA)
check(!!real,'no code was generated')
const good=await post('/api/members/verify',{phone:ADA,code:real})
check(good.status===201,'the real code did not sign her up')
check(!!good.cookie,'no session cookie was set')

// 4. single use
const replay=await post('/api/members/verify',{phone:ADA,code:real})
check(replay.status===400,'THE CODE WAS REUSABLE')

// 5. no membership oracle
// A ONE-CHARACTER NAME, deliberately: the difference used to show up only for
// an invalid name, where one path demanded it and the other did not.
const known=await post('/api/members/start',{name:'x',phone:ADA})
const unknown=await post('/api/members/start',{name:'x',email:STRANGER})
check(known.status===unknown.status && JSON.stringify(known.body)===JSON.stringify(unknown.body),
  'the response reveals who is already a member')

// 6. lockout, and it survives the real code arriving after
await post('/api/members/start',{name:'Bo Reed',phone:BO})
const boReal=codeFor(BO)
for(let i=0;i<5;i++) await post('/api/members/verify',{phone:BO,code:'11111'+i})
const afterLock=await post('/api/members/verify',{phone:BO,code:boReal})
check(afterLock.status===400,'THE REAL CODE STILL WORKED AFTER FIVE WRONG GUESSES')

/*
  7. RESENDING, which the code screen now offers and which has to actually
  replace the code rather than issue a second working one.

  A screen with a Resend button that leaves the old code valid quietly doubles
  every guess an attacker gets, and one that issues nothing leaves the member
  exactly as stuck as before the button existed.
*/
await post('/api/members/start',{name:'Ada Vance',phone:RESEND})
const first=codeFor(RESEND)
await post('/api/members/start',{name:'Ada Vance',phone:RESEND})
const second=codeFor(RESEND)
check(!!second && second!==first,'resending did not issue a new code')
const oldOne=await post('/api/members/verify',{phone:RESEND,code:first})
check(oldOne.status===400,'THE PREVIOUS CODE STILL WORKED AFTER A RESEND')
const newOne=await post('/api/members/verify',{phone:RESEND,code:second})
check(newOne.status===201,'the resent code did not work')

srv.kill()
if(fails.length){ console.log('FAIL:\n  - '+fails.join('\n  - ')); process.exit(1) }
console.log('PASS: codes are private, single-use, non-revealing, rate-limited, and a resend replaces the last one.')
