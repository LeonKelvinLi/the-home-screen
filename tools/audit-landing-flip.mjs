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
for(let i=0;i<14;i++){
  const s=await p.evaluate(()=>{
    const on=[...document.querySelectorAll('.dialer-photo.is-on')].map(n=>n.style.backgroundImage.replace(/^url\(|\)$|"/g,'').split('/').pop())
    const half=document.querySelector('.dialer-domain-half.is-dark')
    const cs=half?getComputedStyle(half):null
    return {on, ink:cs?cs.color:null, plate:cs?cs.backgroundColor:null, photo:document.querySelector('.dialer.is-photo')!==null}
  })
  seen.add(s.on[0]??'YELLOW'); if(s.ink) pagesInk.add(`${s.photo?'photo':'yellow'}:${s.ink}`)
  await p.waitForTimeout(1000)
}
console.log('states seen:', [...seen].join(' | '))
console.log('PAGES ink by state:', [...pagesInk].join('   '))
console.log('failed /landing/ requests:', bad.length?bad:'none')
await b.close(); srv.kill()
