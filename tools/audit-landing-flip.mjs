/* Does the landing actually flip, and does the wordmark answer it? */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const srv=spawn('npx',['vite','preview','--strictPort','--port',String(port)],{stdio:'ignore'})
const base=`http://localhost:${port}`
for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
const bad=[]
p.on('response',r=>{if(r.url().includes('/landing/')&&r.status()>=400)bad.push(`${r.status()} ${r.url().split('/').pop()}`)})
await p.goto(base,{waitUntil:'networkidle'})
for(let i=0;i<60;i++){ if(await p.$('.dialer.is-beasty')) break; await p.waitForTimeout(300) }
const seen=new Set(); const pagesInk=new Set()
/*
  RUNS UNTIL IT HAS SEEN EVERY PICTURE, not for a fixed count.

  The first version stopped after fourteen samples and reported three of the
  four — which looked like a pass, since he asked for "at least 3", and was
  really the audit running out of patience one photograph early. A rotation is
  only proved by watching it come all the way round, and the last slot is
  exactly where a lazy-loaded file would fail to arrive.
*/
const want = await p.evaluate(()=>document.querySelectorAll('.dialer-photo').length)
for(let i=0;i<90 && seen.size < want+1;i++){
  const s=await p.evaluate(()=>{
    const on=[...document.querySelectorAll('.dialer-photo.is-on')].map(n=>n.style.backgroundImage.replace(/^url\(|\)$|"/g,'').split('/').pop())
    const half=document.querySelector('.dialer-domain-half.is-dark')
    const cs=half?getComputedStyle(half):null
    return {on, ink:cs?cs.color:null, plate:cs?cs.backgroundColor:null, photo:document.querySelector('.dialer.is-photo')!==null}
  })
  seen.add(s.on[0]??'YELLOW')
  /*
    Only record the ink once the 420ms cross-fade has finished. Sampling on a
    fixed 1s beat against a 2s cycle lands mid-fade about as often as not, and
    every one of those samples is a half-mixed colour that belongs to neither
    state — the list came out eight entries long with two real ones in it.
  */
  await p.waitForTimeout(600)
  const settled = await p.evaluate(()=>{
    const half=document.querySelector('.dialer-domain-half.is-dark')
    return half ? {ink:getComputedStyle(half).color, photo:document.querySelector('.dialer.is-photo')!==null} : null
  })
  if(settled) pagesInk.add(`${settled.photo?'photo':'yellow'}:${settled.ink}`)
  await p.waitForTimeout(400)
}
console.log(`states seen (${seen.size} of ${want+1} expected):`, [...seen].join(' | '))
console.log('PAGES ink by state:', [...pagesInk].join('   '))
console.log('failed /landing/ requests:', bad.length?bad:'none')
const missing = want+1 - seen.size
if(missing>0 || bad.length){
  console.log(`\nFAIL: ${missing>0?`${missing} state(s) never appeared`:''}${missing>0&&bad.length?'; ':''}${bad.length?`${bad.length} request(s) failed`:''}`)
  await b.close(); srv.kill(); process.exit(1)
}
console.log('\nPASS: every picture appears, the wordmark answers each state, nothing 404s.')
await b.close(); srv.kill()
