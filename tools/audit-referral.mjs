/* A shared QR link must credit the person who shared it — the whole mechanic.
 *
 * Driven through the REAL sign-up form in three separate browser contexts, not
 * through the API: the referral code is captured from the URL on arrival and has
 * to survive a form being filled in minutes later, which is a client-side
 * journey no server test can stand in for. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

/* NINETY SECONDS ON THE DOOR, not the default thirty.

   The landing screen counts down before it draws its Enter button, and under
   the suite's parallelism on a loaded machine that countdown outruns a 30s
   auto-wait. Both of these passed standalone and failed inside audit-all.sh,
   which is the signature of a timeout rather than a defect. */
const TESTDB = await freshTestDb('referral')
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const DB='/tmp/audit-ref.db', LOG='/tmp/audit-ref.log'
for (const f of [DB,DB+'-wal',DB+'-shm',LOG]) { try { rmSync(f,{force:true}) } catch {} }
const out=openSync(LOG,'a')
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out,out],env:{...process.env,
  PORT:String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS:'1', NODE_ENV:'development'}})
const base=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()

const codeFor=(email)=>{
  const line=readFileSync(LOG,'utf8').split('\n').filter(l=>l.includes(`[login-code] ${email} `)).pop()
  return line && line.match(/ (\d{6}) /)?.[1]
}

/** The whole journey: land, hit a gate, fill the form, enter the emailed code. */
const join = async (url, name, email) => {
  const ctx = await b.newContext({viewport:{width:393,height:852}})
  const p = await ctx.newPage()
  await p.goto(url,{waitUntil:'networkidle'})
  await p.click('[aria-label="Enter BEASTY"]', { timeout: 90000 }); await p.waitForTimeout(2500)
  await p.click('.spotlight'); await p.waitForTimeout(400)
  await p.click('.gate-card .btn-primary'); await p.waitForTimeout(900)
  await p.fill('.join-field input[autocomplete="name"]', name)
  await p.fill('.join-field input[autocomplete="address-level2"]', 'Oakland')
  /* By TYPE, not by position, and both of them. Which field is required now
     follows what the deployment can deliver, and nth-of-type(2) silently means
     a different box the moment the form's order changes. */
  await p.fill('.join-field input[type="tel"]', email)
  await p.fill('.join-field input[type="email"]', `${email.replace(/\D/g, '')}@example.invalid`)
  await p.click('form.join button[type=submit]')
  await p.waitForSelector('.join-code',{timeout:15000})
  const code = codeFor(email)
  if (!code) throw new Error(`no code logged for ${email}`)
  await p.fill('.join-code', code)
  await p.click('form.join button[type=submit]')
  /*
    POLL FROM NODE, NOT FROM THE PAGE.

    Two wrong versions before this one. A flat 1600ms sleep failed under the
    parallel suite whenever sign-up took longer, reporting that a member who
    signed up never did. Replacing it with page.waitForFunction was worse:
    signing in re-renders, that destroys the execution context, waitForFunction
    rejects instantly and the check ran EARLIER than the sleep it replaced.
    And polling it at 300ms out-ran /api/members/me's own rate limit, so the
    poll manufactured the 429s it then read as a failed sign-up.

    A loop of separate evaluate() calls survives a re-render, and one a second
    stays inside the limiter. If it never arrives, `a` is null and the caller
    asserts on it exactly as before.
  */
  let a = null
  for (let i = 0; i < 22; i++) {
    a = await p
      .evaluate(async () => {
        const r = await fetch('/api/members/me', { credentials: 'same-origin' })
        return r.ok ? await r.json() : null
      })
      .catch(() => null)
    if (a) break
    await p.waitForTimeout(1000)
  }
  return { ctx, p, a }
}

/* Field two on the join form is the mobile number now, and this fills by
   position, so it only needed the values to change. */
const stamp = String(Date.now()).slice(-4)
const owner = await join(base, 'Rae Okafor', `+1510557${stamp}`)
if (!owner.a) { console.log('FAIL: the referrer never signed up'); await b.close(); srv.kill(); process.exit(1) }
console.log('referrer         :', owner.a.name, '| code', owner.a.referralCode)
const link = `${base}/?ref=${owner.a.referralCode}`

for (const [n,e] of [['Friend One',`+1510558${stamp}`],['Friend Two',`+1510559${stamp}`],['Friend Three',`+1510560${stamp}`]]) {
  const f = await join(link, n, e)
  if (!f.a) { console.log(`FAIL: ${n} never signed up`); await b.close(); srv.kill(); process.exit(1) }
  await f.ctx.close()
}
const fin = await owner.p.evaluate(async()=>{const r=await fetch('/api/members/me',{credentials:'same-origin'});return await r.json()})
console.log('after three      :', fin.referrals, 'referrals ->', fin.raffleTickets.unused, 'ticket')
await b.close(); srv.kill()
if (fin.referrals!==3 || fin.raffleTickets.unused!==1) {
  console.log('\nFAIL: the referral chain did not credit or did not mint'); process.exit(1)
}
console.log('\nPASS: the QR link credits the sharer and mints at 3.')
