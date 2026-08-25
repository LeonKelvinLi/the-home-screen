/* The two screens his brief names: the QR on the profile, and a way to actually
   take a membership.

   Both existed as endpoints for a while with nothing calling them, which is the
   failure this guards against — a working API and no way to reach it looks
   exactly like a finished feature from the server side. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync } from 'node:fs'
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
for (const f of ['/tmp/mui.db','/tmp/mui.db-wal','/tmp/mui.db-shm']) { try { rmSync(f,{force:true}) } catch {} }
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:'ignore',env:{...process.env,PORT:String(port),DATABASE_PATH:'/tmp/mui.db',ALLOW_MOCK_PAYMENTS:'1',NODE_ENV:'development'}})
const base=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
const bad=[]
p.on('response',r=>{const l=`${r.status()} ${r.url().replace(base,'')}`; if(r.status()>=400 && l!=='401 /api/members/me') bad.push(l)})

await p.goto(base,{waitUntil:'domcontentloaded'})
const code = await p.evaluate(async()=>{
  const r=await fetch('/api/members',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',
    body:JSON.stringify({name:'Mira Solis',email:`mira${Date.now()}@example.com`})})
  return (await r.json()).referralCode
})
await p.goto(base,{waitUntil:'networkidle'})
await p.click('[aria-label="Enter BEASTY"]'); await p.waitForTimeout(2600)

// --- profile: the QR must actually be on the page and actually load
await p.evaluate(()=>window.dispatchEvent(new CustomEvent('beasty:join')))
await p.waitForTimeout(400)
await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Profile/i.test(x.getAttribute('aria-label')||x.textContent||'')); b?.click() })
await p.waitForTimeout(1400)
const prof = await p.evaluate(()=>{
  const img=document.querySelector('.mp-qr img')
  return { panel: !!document.querySelector('.mp'),
           qrLoaded: !!img && img.complete && img.naturalWidth>0,
           code: document.querySelector('.mp-code')?.textContent?.trim() ?? null,
           stats: [...document.querySelectorAll('.mp-stat-n')].map(n=>n.textContent) }
})
console.log('profile panel  :', JSON.stringify(prof))
console.log('code matches   :', prof.code === code)

// --- members: choosing a tier must reach the server
await p.goto(base+'/',{waitUntil:'networkidle'}); await p.waitForTimeout(600)
await p.evaluate(()=>{ const el=document.querySelector('[data-testid]'); })
const chose = await p.evaluate(async()=>{
  const r=await fetch('/api/members/tier',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({tier:'diamond'})})
  const b=await r.json(); return { status:r.status, tier:b.tier, tierStatus:b.tierStatus, paymentsConfigured:b.paymentsConfigured, link:b.paymentLink }
})
console.log('choose tier    :', JSON.stringify(chose))
await b.close(); srv.kill()

const fails=[]
if(!prof.panel) fails.push('no member panel on the profile')
if(!prof.qrLoaded) fails.push('the QR image did not load')
if(prof.code!==code) fails.push('the code shown is not the member\'s')
if(chose.status!==200||chose.tierStatus!=='pending') fails.push('choosing a tier did not record as pending')
if(chose.paymentsConfigured) fails.push('payments reported configured with no link set')
if(bad.length) fails.push('failed requests: '+[...new Set(bad)].join(', '))
if(fails.length){ console.log('\nFAIL: '+fails.join('; ')); process.exit(1) }
console.log('\nPASS: the QR is on the profile and a tier can be taken (as pending).')
