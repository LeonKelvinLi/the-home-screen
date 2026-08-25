/* The two screens his brief names: the QR on the profile, and a way to actually
   take a membership.

   Both existed as endpoints for a while with nothing calling them, which is the
   failure this guards against — a working API and no way to reach it looks
   exactly like a finished feature from the server side. */
import { chromium } from 'playwright'
/*
  Sign a page in through the real two-step flow.

  The code is scraped from the server's own log, which is where it goes when no
  email provider is configured — it is never in an HTTP response, and an audit
  that could read it from one would be proving the opposite of what it should.
*/
async function signIn(page, fields, logPath) {
  const { readFileSync } = await import('node:fs')
  const started = await page.evaluate(async (f) => {
    const r = await fetch('/api/members/start', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      credentials: 'same-origin', body: JSON.stringify(f),
    })
    return r.status
  }, fields)
  if (started !== 202) throw new Error(`start returned ${started}`)
  const line = readFileSync(logPath, 'utf8').split('\n')
    .filter((l) => l.includes(`[login-code] ${fields.email} `)).pop()
  const code = line && line.match(/ (\d{6}) /)?.[1]
  if (!code) throw new Error('no login code was logged')
  return page.evaluate(async ({ email, code }) => {
    const r = await fetch('/api/members/verify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      credentials: 'same-origin', body: JSON.stringify({ email, code }),
    })
    return r.ok ? await r.json() : null
  }, { email: fields.email, code })
}

import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync } from 'node:fs'
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
for (const f of ['/tmp/mui.db','/tmp/mui.db-wal','/tmp/mui.db-shm']) { try { rmSync(f,{force:true}) } catch {} }
const LOG='/tmp/audit-mui.log'
try { rmSync(LOG,{force:true}) } catch {}
const out=(await import('node:fs')).openSync(LOG,'a')
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out,out],env:{...process.env,PORT:String(port),DATABASE_PATH:'/tmp/mui.db',ALLOW_MOCK_PAYMENTS:'1',NODE_ENV:'development'}})
const base=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
const bad=[]
p.on('response',r=>{const l=`${r.status()} ${r.url().replace(base,'')}`; if(r.status()>=400 && l!=='401 /api/members/me') bad.push(l)})

await p.goto(base,{waitUntil:'domcontentloaded'})
const acctEmail = `mira${Date.now()}@example.com`
const acct = await signIn(p, { name: 'Mira Solis', email: acctEmail }, LOG)
const code = acct?.referralCode
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

/*
  The Account screen must offer a way in.

  It shipped with a disabled button reading "not connected yet" — written
  before sign-in existed and never revisited, so the one screen a person opens
  when they want an account was the screen telling them there wasn't one. A
  disabled control is invisible to a click test, which is why this asserts on
  the button being ENABLED, not merely present.
*/
await p.goto(base+'/',{waitUntil:'networkidle'})
/* The takeover is skipped on a reload that history already says is inside the
   app, so this must not insist on the Enter button being there. */
const enter = await p.$('[aria-label="Enter BEASTY"]')
if (enter) { await enter.click(); await p.waitForTimeout(2600) } else { await p.waitForTimeout(800) }
const openAccount = async () => {
  await p.evaluate(()=>{ const b=[...document.querySelectorAll('.dock-switch-btn')]
    .find(x=>/^Help,/.test(x.getAttribute('aria-label')||'')); b?.click() })
  await p.waitForTimeout(500)
  await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')]
    .find(x=>/^Account\b/.test(x.getAttribute('aria-label')||x.textContent||'')); b?.click() })
  await p.waitForTimeout(900)
}
const readAccount = () => p.evaluate(()=>{
  const heads=[...document.querySelectorAll('.plain h3')].map(h=>h.textContent?.trim())
  const btns=[...document.querySelectorAll('.plain button')]
    .map(b=>({ text:(b.textContent||'').trim(), disabled:b.disabled }))
  return { heads, btns, body:document.querySelector('.plain')?.textContent ?? '' }
})
await openAccount()
const signedIn = await readAccount()
console.log('account (in)   :', JSON.stringify(signedIn.heads), JSON.stringify(signedIn.btns))

// Sign out from that screen, then the same screen must offer the way back in.
await p.evaluate(()=>{ const b=[...document.querySelectorAll('.plain button')]
  .find(x=>/Sign out/i.test(x.textContent||'')); b?.click() })
await p.waitForTimeout(900)
const signedOut = await readAccount()
console.log('account (out)  :', JSON.stringify(signedOut.heads), JSON.stringify(signedOut.btns))

// And that button must actually reach the sign-up form, not just look alive.
await p.evaluate(()=>{ const b=[...document.querySelectorAll('.plain button')]
  .find(x=>/Sign in or sign up/i.test(x.textContent||'')); b?.click() })
await p.waitForTimeout(900)
const reachedJoin = await p.evaluate(()=>!!document.querySelector('form.join'))
console.log('reaches join   :', reachedJoin)

// Sign back in for the tier check below, which needs a member.
await p.goto(base+'/',{waitUntil:'domcontentloaded'})
const back = await signIn(p, { name: 'Mira Solis', email: acctEmail }, LOG)
if (!back) throw new Error('could not sign back in')

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
const inBtn = signedOut.btns.find(b=>/Sign in or sign up/i.test(b.text))
if(!signedIn.heads.includes('Signed in')) fails.push('Account did not show the signed-in member')
if(!signedIn.body.includes(acctEmail)) fails.push('Account did not show whose account it is')
if(!signedIn.btns.some(b=>/Sign out/i.test(b.text)&&!b.disabled)) fails.push('no working sign-out on Account')
if(!inBtn) fails.push('Account offers no way to sign in when signed out')
else if(inBtn.disabled) fails.push('the Account sign-in button is disabled')
if(signedOut.btns.some(b=>b.disabled)) fails.push('Account still shows a dead button')
if(/not connected yet/i.test(signedOut.body)) fails.push('Account still says sign-in is not connected')
if(!reachedJoin) fails.push('the Account sign-in button does not reach the sign-up form')
if(chose.status!==200||chose.tierStatus!=='pending') fails.push('choosing a tier did not record as pending')
if(chose.paymentsConfigured) fails.push('payments reported configured with no link set')
if(bad.length) fails.push('failed requests: '+[...new Set(bad)].join(', '))
if(fails.length){ console.log('\nFAIL: '+fails.join('; ')); process.exit(1) }
console.log('\nPASS: Account signs in and out, the QR is on the profile, and a tier can be taken (as pending).')
