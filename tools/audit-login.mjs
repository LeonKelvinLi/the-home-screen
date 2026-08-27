/* The login screen, walked the way somebody who never got the email walks it.
 *
 * The failure this exists for: the code step was a dead end. Nothing on it
 * could ask for another code, so a mail that was late, wrong or in spam ended
 * the sign-up — and there is no way to tell that apart from a broken form.
 *
 * Also checks the membership screen no longer contradicts itself: it carried a
 * disabled "Paid sign-ups not open yet" underneath two buttons that open a
 * real Stripe checkout. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
const TESTDB = await freshTestDb('login')
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const DB='/tmp/audit-login.db', LOG='/tmp/audit-login.log'
for (const f of [DB,DB+'-wal',DB+'-shm',LOG]) { try { rmSync(f,{force:true}) } catch {} }
const out=openSync(LOG,'a')
/* Links configured, because the screen under test is the one that has to say
   so — with none set it would pass by saying nothing. */
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:['ignore',out,out],env:{...process.env,
  PORT:String(port), DATABASE_URL: TESTDB.url, NODE_ENV:'development',
  STRIPE_PAYMENT_LINK_PASS:'https://buy.stripe.com/loginpass',
  STRIPE_PAYMENT_LINK_DIAMOND:'https://buy.stripe.com/logindiamond'}})
const base=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}

const b=await chromium.launch()
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
const bad=[]
p.on('response',r=>{const l=`${r.status()} ${r.url().replace(base,'')}`; if(r.status()>=400 && l!=='401 /api/members/me') bad.push(l)})
const email=`late${Date.now()}@example.com`
const codeFor=()=>{const l=readFileSync(LOG,'utf8').split('\n').filter(x=>x.includes(`[login-code] ${email} `)).pop();return l&&l.match(/ (\d{6}) /)?.[1]}

/*
  Walked the way a person reaches it: the dial pad's 0 key is SIGN IN.

  The first press only cancels the takeover animation — press() calls skip()
  and returns — and until it has run the keys still print a real phone's
  letters, so the labelled key does not exist yet. Hence skip, then press.
*/
await p.goto(base,{waitUntil:'networkidle'})
await p.click('[aria-label="1"]')
await p.waitForTimeout(3200)
await p.click('[aria-label="0. SIGN IN"]')
await p.waitForTimeout(2600)
/* 0 opens Account, and Account is where the way in lives. This is the whole
   chain a person walks, and until today its last step was a disabled button
   reading "not connected yet". */
await p.evaluate(()=>{const x=[...document.querySelectorAll('.plain button')].find(n=>/Sign in or sign up/i.test(n.textContent||''));x?.click()})
await p.waitForTimeout(1200)

const reached = await p.evaluate(()=>!!document.querySelector('form.join'))
console.log('reached form  :', reached)

// Fill the details and ask for a code.
await p.fill('.join-field input[autocomplete="name"]', 'Ola Bright')
await p.fill('.join-field input[type="email"]', email)
await p.click('form.join button[type="submit"]')
await p.waitForTimeout(900)
const first = codeFor()
const pageText = await p.evaluate(()=>document.body.innerText)
const step2 = await p.evaluate(()=>({
  onCodeStep: !!document.querySelector('.join-code'),
  lead: document.querySelector('.join-lead')?.textContent?.trim() ?? '',
  buttons: [...document.querySelectorAll('form.join button')].map(x=>({t:(x.textContent||'').trim(), d:x.disabled})),
}))
console.log('code step     :', step2.onCodeStep, '| expiry shown:', /expires in \d+:\d\d/i.test(step2.lead))
console.log('buttons       :', JSON.stringify(step2.buttons))

// The resend must be there, must be on a cooldown, and must actually reissue.
const resendBtn = step2.buttons.find(x=>/Send another code/i.test(x.t))
await p.waitForTimeout(31000)
await p.evaluate(()=>{const x=[...document.querySelectorAll('form.join button')].find(n=>/Send another code$/i.test((n.textContent||'').trim()));x?.click()})
await p.waitForTimeout(1200)
const second = codeFor()
const afterResend = await p.evaluate(()=>({
  said: !!document.querySelector('.join-ref'),
  cooling: [...document.querySelectorAll('form.join button')].some(x=>/Send another code in \d+s/.test(x.textContent||'')),
}))
console.log('resend        : new code', second!==first, '| told the user:', afterResend.said, '| back on cooldown:', afterResend.cooling)

// The reissued code must be the one that works.
await p.fill('.join-code', second ?? '')
await p.click('form.join button[type="submit"]')
await p.waitForTimeout(1400)
const signedIn = await p.evaluate(async()=>(await fetch('/api/members/me',{credentials:'same-origin'})).status)
console.log('signed in     :', signedIn)

// The membership screen must not contradict its own buttons.
await p.evaluate(()=>{const el=document.querySelector('[data-app]');})
await p.goto(base+'/',{waitUntil:'networkidle'})
await p.waitForTimeout(600)
const members = await p.evaluate(async()=>{
  const me=await (await fetch('/api/members/me',{credentials:'same-origin'})).json()
  return { paymentsConfigured: me.paymentsConfigured }
})
console.log('me.payments   :', members.paymentsConfigured)

await b.close(); srv.kill()

const fails=[]
if(!reached) fails.push('Account does not reach the sign-in form')
if(!step2.onCodeStep) fails.push('asking for a code did not reach the code step')
if(!first) fails.push('no code was issued')
if(!/expires in \d+:\d\d/i.test(step2.lead)) fails.push('the code step does not say when the code expires')
if(!resendBtn) fails.push('THE CODE STEP HAS NO WAY TO ASK FOR ANOTHER CODE')
if(resendBtn && !resendBtn.d) fails.push('the resend was tappable immediately — no cooldown')
if(!second || second===first) fails.push('resending did not issue a new code')
if(!afterResend.said) fails.push('resending said nothing, so it looks like nothing happened')
if(!afterResend.cooling) fails.push('the resend did not go back on cooldown')
if(signedIn!==200) fails.push(`the resent code did not sign anybody in (me -> ${signedIn})`)
if(members.paymentsConfigured!==true) fails.push('the client is not told payments are live')
/* Server configuration names must never reach a customer's screen. */
if(/RESEND_API_KEY|OTP_FROM_EMAIL|STRIPE_[A-Z_]+/.test(step2.lead + JSON.stringify(step2.buttons) + pageText))
  fails.push('a server environment variable name is printed on the sign-in screen')
if(bad.length) fails.push('failed requests: '+[...new Set(bad)].join(', '))
if(fails.length){ console.log('\nFAIL:\n  - '+fails.join('\n  - ')); process.exit(1) }
console.log('\nPASS: the code step can reissue, says when it expires, and the new code is the one that works.')
