/* Every materialized film has a share button, it copies that BUSINESS's deep link, and
   tapping it does not toggle the sound.

   That last one is the whole reason this exists. The sound toggle covers every
   pixel of the reel, so any control added on top of it is one z-index away from
   being unreachable — and it would still look perfectly correct in a
   screenshot. The check is a real hit-test at each button's own centre. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { VITE } from './bin.mjs'
import { tsImport } from 'tsx/esm/api'
const {REELS}=await tsImport('../src/data/clips.ts',import.meta.url)
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const srv=spawn(process.execPath,[VITE,'preview','--strictPort','--port',String(port)],{stdio:'ignore'})
const base=`http://localhost:${port}`
for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']})
const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:2,permissions:['clipboard-read','clipboard-write']})
const p=await ctx.newPage()
await p.goto(base,{waitUntil:'networkidle'})
await p.click('[aria-label="Enter BEASTY"]'); await p.waitForTimeout(2600)
await (await p.$('[aria-label*="Watch"]')).click(); await p.waitForTimeout(1800)

// Only near-window films have controls; advertisements and offscreen placeholders do not.
// A real tap must still land on Share rather than on the sound layer.
console.log(JSON.stringify(await p.evaluate(()=>{
  const at=el=>{const r=el.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return h?(h.className||h.tagName):null}
  const reel=document.querySelector('.reel')
  return { reels:document.querySelectorAll('.reel').length,
           shareButtons:document.querySelectorAll('.reel-share').length,
           tapOnShare:at(reel.querySelector('.reel-share')),
           tapOnSpeaker:at(reel.querySelector('.reel-sound-badge')),
           tapOnName:at(reel.querySelector('.reel-name')) }
}),null,1))
await p.click('.reel-share'); await p.waitForTimeout(700)
const copied=await p.evaluate(()=>navigator.clipboard.readText())
const source=await p.locator('.reel video').first().getAttribute('src')
const expected=REELS.find(r=>r.src===source)
console.log('clipboard :', copied)
console.log('toast     :', await p.textContent('.reel-share-toast').catch(()=>'none'))
// sound must NOT have toggled
console.log('still muted after share tap:', await p.evaluate(()=>document.querySelector('.reel video').muted))
const ok = await p.evaluate(()=>{
  const at=el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)}
  const reel=document.querySelector('.reel')
  const share=reel.querySelector('.reel-share')
  const name=reel.querySelector('.reel-name')
  return { share: share.contains(at(share)) || at(share)===share,
           name:  name.contains(at(name))  || at(name)===name,
           count: document.querySelectorAll('.reels video').length > 0 &&
             document.querySelectorAll('.reels video').length <= 4 &&
             [...document.querySelectorAll('.reel')].every(r=>r.querySelectorAll('.reel-share').length === (r.querySelector('video') ? 1 : 0)) }
})
const muted = await p.evaluate(()=>document.querySelector('.reel video').muted)
await b.close(); srv.kill()
const fails=[]
if(!ok.count) fails.push('each materialized film needs exactly one share button; ads and placeholders need none')
if(!expected || copied!==`${base}/?b=${encodeURIComponent(expected.brandId)}`) fails.push('the copied link does not open the actual film’s business')
if(!ok.share) fails.push('the share button is not the top element at its own centre')
if(!ok.name)  fails.push('the business name is not tappable')
if(!muted)    fails.push('sharing toggled the sound')
if(fails.length){ console.log('\nFAIL: '+fails.join('; ')); process.exit(1) }
console.log('\nPASS: share on every materialized film, none on ads/placeholders, copies the actual business link and leaves sound alone.')
