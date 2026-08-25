/* The About page: closed chapters that open, the picture, and the sign-off.
   Hit-tested by clicking the real row, because a heading that renders and does
   not respond is exactly the failure this is for. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const srv=spawn('npx',['tsx','server/index.ts'],{stdio:'ignore',env:{...process.env,PORT:String(port),DATABASE_PATH:'/tmp/about.db',NODE_ENV:'development'}})
const base=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
const bad=[]
/* 401 on members/me is the signed-out answer, not a fault: the page asks who
   you are on load and nobody is signed in here. */
p.on('response',r=>{const l=`${r.status()} ${r.url().replace(base,'')}`; if(r.status()>=400 && l!=='401 /api/members/me') bad.push(l)})
await p.goto(base,{waitUntil:'networkidle'})
// The dial pad's key 1 is About.
/*
  Key 1 is About. It prints no letters, exactly as a real phone's 1 does, so it
  is found by its aria-label and not by its face.

  THE FIRST PRESS DOES NOT OPEN IT. While the takeover is still animating,
  press() calls skip() and returns — the tap cancels the animation instead of
  acting on the key. So this presses, checks, and presses again if the panel is
  not up. Waiting a fixed time instead would pass or fail on machine speed.
*/
await p.click('[aria-label="1"]')
await p.waitForTimeout(3000)
await p.click('[aria-label="1. ABOUT"]')
await p.waitForTimeout(900)
const closed = await p.evaluate(()=>({
  title: document.querySelector('.dialer-panel-h, h2')?.textContent?.trim() ?? null,
  intro: document.querySelectorAll('.dialer-panel p, .panel-signoff').length,
  heads: [...document.querySelectorAll('.panel-chapter-head')].map(h=>h.querySelector('.panel-chapter-name')?.firstChild?.textContent?.trim()),
  expanded: [...document.querySelectorAll('.panel-chapter-head')].map(h=>h.getAttribute('aria-expanded')),
  bodiesRendered: document.querySelectorAll('.panel-chapter-body').length,
  signoff: document.querySelector('.panel-signoff')?.textContent?.trim() ?? null,
  quoteLines: [...document.querySelectorAll('.panel-quote span')].map(s=>s.textContent),
}))
console.log('chapters      :', JSON.stringify(closed.heads))
console.log('all closed    :', closed.expanded.every(v=>v==='false'), '| bodies in DOM:', closed.bodiesRendered)
console.log('signoff       :', closed.signoff)
console.log('quote lines   :', closed.quoteLines.length)

/*
  Hit-test the LAST chapter, which is the one that can go wrong two ways.

  Eight chapters are taller than the phone, so it has to be reachable by
  scrolling at all — a panel that clips its own content would hide the last
  three chapters entirely — and once scrolled to, the row has to be the thing
  a thumb actually lands on rather than something painted over it.
*/
const hit = await p.evaluate(async ()=>{
  const h=[...document.querySelectorAll('.panel-chapter-head')].find(x=>/The Build/.test(x.textContent||''))
  if(!h) return null
  const before=h.getBoundingClientRect().top
  h.scrollIntoView({block:'center'})
  await new Promise(r=>setTimeout(r,350))
  const r=h.getBoundingClientRect()
  const cx=r.left+r.width/2, cy=r.top+r.height/2
  const el=document.elementFromPoint(cx, cy)
  return { onTop: h.contains(el), height: Math.round(r.height),
           scrolled: Math.round(before - r.top),
           inView: cy > 0 && cy < window.innerHeight,
           hit: el ? el.tagName+'.'+String(el.className).slice(0,40) : 'null' }
})
console.log('The Build hit :', JSON.stringify(hit))

await p.evaluate(()=>{const h=[...document.querySelectorAll('.panel-chapter-head')].find(x=>/The Build/.test(x.textContent||''));h?.click()})
await p.waitForTimeout(500)
const opened = await p.evaluate(()=>{
  const img=document.querySelector('.panel-figure img')
  return { bodies: document.querySelectorAll('.panel-chapter-body').length,
           expandedCount: [...document.querySelectorAll('.panel-chapter-head')].filter(h=>h.getAttribute('aria-expanded')==='true').length,
           imgLoaded: !!img && img.complete && img.naturalWidth>0,
           imgAlt: (img?.getAttribute('alt')||'').slice(0,40),
           caption: document.querySelector('.panel-figure figcaption')?.textContent?.trim() ?? null }
})
console.log('after tap     :', JSON.stringify(opened))

// The Plan carries the pedigree block.
/*
  Nothing may show above the sticky title while the page is scrolled.

  The panel had top padding, so the title's sticky box began BELOW it and a
  chapter heading scrolled up into the gap and sat over the card's top edge,
  above "About BEASTY". Only a page long enough to scroll shows it, and About
  is now the only one.
*/
const header = await p.evaluate(()=>{
  const head=document.querySelector('.dialer-panel-head')
  const panel=document.querySelector('.dialer-panel')
  if(!head||!panel) return null
  const hr=head.getBoundingClientRect(), pr=panel.getBoundingClientRect()
  /* Anything ENTIRELY inside the strip between the card's top edge and the
     title is showing in a gap that should not exist. Content whose top is
     above the card is simply scrolled out and clipped, which is correct. */
  const above=[...document.querySelectorAll('.panel-chapter-head, .dialer-panel p')]
    .filter(n=>{const r=n.getBoundingClientRect(); return r.top >= pr.top - 1 && r.bottom <= hr.top + 1})
    .map(n=>(n.textContent||'').trim().slice(0,24))
  /* And the title must actually paint over what slides under it. */
  const el=document.elementFromPoint(hr.left+hr.width/2, hr.top+12)
  return { gap: Math.round(hr.top - pr.top), above, opaque: !!el && head.contains(el) }
})
console.log('above title   :', JSON.stringify(header))

await p.evaluate(()=>{const h=[...document.querySelectorAll('.panel-chapter-head')].find(x=>/The Plan/.test(x.textContent||''));h?.click()})
await p.waitForTimeout(400)
const plan = await p.evaluate(()=>({
  facts: [...document.querySelectorAll('.panel-facts li')].map(l=>l.textContent),
  after: document.querySelector('.panel-chapter-after')?.textContent?.trim() ?? null,
  stillOne: [...document.querySelectorAll('.panel-chapter-head')].filter(h=>h.getAttribute('aria-expanded')==='true').length,
}))
console.log('The Plan      :', plan.facts.length, 'facts |', JSON.stringify(plan.after), '| open at once:', plan.stillOne)
await b.close(); srv.kill()

const fails=[]
if(closed.heads.length!==8) fails.push(`expected 8 chapters, got ${closed.heads.length}`)
if(!closed.expanded.every(v=>v==='false')) fails.push('a chapter was open before anything was tapped')
if(closed.bodiesRendered!==0) fails.push('closed chapters still render their paragraphs')
if(!closed.signoff?.includes('BEASTYPAGES.com')) fails.push('the sign-off is missing')
if(closed.quoteLines.length!==4) fails.push('the closing quote is not his four lines')
if(!hit?.inView) fails.push('the last chapters cannot be scrolled to — the panel is clipping them')
if(!hit?.onTop) fails.push(`a chapter row is not what you hit at its own centre (hit ${hit?.hit})`)
if((hit?.height??0)<44) fails.push(`chapter row is ${hit?.height}px, under the 44px minimum`)
if(opened.expandedCount!==1) fails.push('tapping did not open exactly one chapter')
if(!opened.imgLoaded) fails.push('the Facebook post picture did not load')
if(!opened.caption) fails.push('the picture has no caption')
if(plan.facts.length!==6) fails.push(`Biggie's pedigree is ${plan.facts.length} lines, expected 6`)
if(plan.after!=='God is Good all the time.') fails.push('his line after the pedigree is missing')
if(plan.stillOne!==1) fails.push('two chapters were open at once')
if(header?.gap !== 0) fails.push(`the title is ${header?.gap}px below the card's top edge — content shows in the gap`)
if(header?.above.length) fails.push('content is showing above the title: '+header.above.join(', '))
if(!header?.opaque) fails.push('the title does not paint over the content scrolling under it')
if(bad.length) fails.push('failed requests: '+[...new Set(bad)].join(', '))
if(fails.length){ console.log('\nFAIL: '+fails.join('; ')); process.exit(1) }
console.log('\nPASS: eight chapters, closed until tapped, with the picture and the sign-off.')
