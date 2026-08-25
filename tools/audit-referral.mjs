/* A shared QR link must credit the person who shared it — the whole mechanic. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync } from 'node:fs'
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
for (const f of ['/tmp/r.db','/tmp/r.db-wal','/tmp/r.db-shm']) { try { rmSync(f,{force:true}) } catch {} }
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:'ignore',env:{...process.env,PORT:String(port),DATABASE_PATH:'/tmp/r.db',ALLOW_MOCK_PAYMENTS:'1',NODE_ENV:'development'}})
const base=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()

const join = async (ctxUrl, name, email) => {
  const ctx = await b.newContext({viewport:{width:393,height:852}})
  const p = await ctx.newPage()
  await p.goto(ctxUrl,{waitUntil:'networkidle'})
  await p.click('[aria-label="Enter BEASTY"]'); await p.waitForTimeout(2500)
  await p.click('.spotlight'); await p.waitForTimeout(400)
  await p.click('.gate-card .btn-primary'); await p.waitForTimeout(900)
  await p.fill('.join-field:nth-of-type(1) input', name)
  await p.fill('.join-field:nth-of-type(2) input', email)
  await p.click('form.join button[type=submit]'); await p.waitForTimeout(1500)
  const a = await p.evaluate(async()=>{const r=await fetch('/api/members/me',{credentials:'same-origin'});return r.ok?await r.json():null})
  return { ctx, p, a }
}

const owner = await join(base, 'Rae Okafor', 'rae@example.com')
console.log('referrer         :', owner.a.name, '| code', owner.a.referralCode)
const link = `${base}/?ref=${owner.a.referralCode}`
console.log('shared link      :', link.replace(base,''))

// Two friends arrive through the QR link and sign up.
for (const [n,e] of [['Friend One','one@example.com'],['Friend Two','two@example.com']]) {
  const f = await join(link, n, e)
  await f.ctx.close()
}
await owner.p.reload({waitUntil:'networkidle'}); await owner.p.waitForTimeout(900)
const after = await owner.p.evaluate(async()=>{const r=await fetch('/api/members/me',{credentials:'same-origin'});return await r.json()})
console.log('referrals credited:', after.referrals, '(expected 2)')
console.log('tickets           :', after.raffleTickets.unused, '(expected 0 — needs 3)')

const f3 = await join(link, 'Friend Three', 'three@example.com'); await f3.ctx.close()
const fin = await owner.p.evaluate(async()=>{const r=await fetch('/api/members/me',{credentials:'same-origin'});return await r.json()})
console.log('after the 3rd     :', fin.referrals, 'referrals ->', fin.raffleTickets.unused, 'ticket (expected 1)')
await b.close(); srv.kill()
if (fin.referrals!==3 || fin.raffleTickets.unused!==1) { console.log('\nFAIL: the referral chain did not credit or did not mint'); process.exit(1) }
console.log('\nPASS: the QR link credits the sharer and mints at 3.')
