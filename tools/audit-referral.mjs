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
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const DB='/tmp/audit-ref.db', LOG='/tmp/audit-ref.log'
for (const f of [DB,DB+'-wal',DB+'-shm',LOG]) { try { rmSync(f,{force:true}) } catch {} }
const out=openSync(LOG,'a')
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out,out],env:{...process.env,
  PORT:String(port), DATABASE_PATH:DB, ALLOW_MOCK_PAYMENTS:'1', NODE_ENV:'development'}})
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
  await p.click('[aria-label="Enter BEASTY"]'); await p.waitForTimeout(2500)
  await p.click('.spotlight'); await p.waitForTimeout(400)
  await p.click('.gate-card .btn-primary'); await p.waitForTimeout(900)
  await p.fill('.join-field:nth-of-type(1) input', name)
  await p.fill('.join-field:nth-of-type(2) input', email)
  await p.click('form.join button[type=submit]')
  await p.waitForSelector('.join-code',{timeout:15000})
  const code = codeFor(email)
  if (!code) throw new Error(`no code logged for ${email}`)
  await p.fill('.join-code', code)
  await p.click('form.join button[type=submit]')
  await p.waitForTimeout(1600)
  const a = await p.evaluate(async()=>{const r=await fetch('/api/members/me',{credentials:'same-origin'});return r.ok?await r.json():null})
  return { ctx, p, a }
}

const owner = await join(base, 'Rae Okafor', 'rae@example.com')
if (!owner.a) { console.log('FAIL: the referrer never signed up'); await b.close(); srv.kill(); process.exit(1) }
console.log('referrer         :', owner.a.name, '| code', owner.a.referralCode)
const link = `${base}/?ref=${owner.a.referralCode}`

for (const [n,e] of [['Friend One','one@example.com'],['Friend Two','two@example.com'],['Friend Three','three@example.com']]) {
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
