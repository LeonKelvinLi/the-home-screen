/* The About page: closed chapters that open, the picture, and the sign-off.
   Hit-tested by clicking the real row, because a heading that renders and does
   not respond is exactly the failure this is for. */
import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { freshTestDb } from './pgtest.mjs'
const TESTDB = await freshTestDb('about')
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const srv=spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:'ignore',env:{...process.env,PORT:String(port),DATABASE_URL: TESTDB.url,NODE_ENV:'development'}})
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
/*
  WAIT FOR THE THING, NOT FOR A NUMBER.

  These were fixed sleeps, and they held right up until the audits started
  running four and six at a time: six chromiums and six node servers on a busy
  machine pushed a 500ms animation past 500ms and this audit reported that
  tapping a chapter opened nothing. That was the clock, not the app. Every wait
  below is now a condition with a ceiling, so a slow machine waits longer and a
  broken one still fails.
*/
await p.click('[aria-label="1"]')
await p.waitForSelector('[aria-label="1. ABOUT"]', { timeout: 15000 })
await p.click('[aria-label="1. ABOUT"]')
await p.waitForSelector('.panel-chapter-head', { timeout: 15000 })
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
/* The chapter's body, and the picture inside it actually decoded — an <img>
   that exists but has not loaded is what the flake reported as a missing file. */
await p.waitForFunction(() => {
  const img = document.querySelector('.panel-figure img')
  return !!img && img.complete && img.naturalWidth > 0
}, null, { timeout: 15000 }).catch(() => {})
const opened = await p.evaluate(()=>{
  const img=document.querySelector('.panel-figure img')
  return { bodies: document.querySelectorAll('.panel-chapter-body').length,
           expandedCount: [...document.querySelectorAll('.panel-chapter-head')].filter(h=>h.getAttribute('aria-expanded')==='true').length,
           imgLoaded: !!img && img.complete && img.naturalWidth>0,
           imgAlt: (img?.getAttribute('alt')||'').slice(0,40),
           caption: document.querySelector('.panel-figure figcaption')?.textContent?.trim() ?? null }
})
console.log('after tap     :', JSON.stringify(opened))

/*
  IT HAS TO STILL BE OPEN A MOMENT LATER.

  Glenn: "when you tap a drop-down, it doesn't stay on." Everything above this
  passed while that was true, because it all reads aria-expanded in the same
  breath as the click. The chapter did open. It closed itself about three
  seconds later, when the landing screen swapped its photo, re-rendered the
  panel, and remounted the chapters with empty state.

  So this waits for a re-render to actually happen — the .dialer class toggles
  is-photo on every swap, which is the parent re-rendering where we can see it
  — and only then asks whether the chapter survived. If no swap arrives the
  check reports that instead of quietly passing on a page that never moved.
*/
const before = await p.evaluate(()=>document.querySelector('.dialer')?.className ?? '')
const rerendered = await p.waitForFunction(
  (was)=>((document.querySelector('.dialer')?.className ?? '').includes('is-photo')) !== was.includes('is-photo'),
  before, { timeout: 9000 },
).then(()=>true).catch(()=>false)
const survived = await p.evaluate(()=>({
  expandedCount: [...document.querySelectorAll('.panel-chapter-head')].filter(h=>h.getAttribute('aria-expanded')==='true').length,
  bodies: document.querySelectorAll('.panel-chapter-body').length,
}))
console.log('after a re-render:', JSON.stringify({rerendered, ...survived}))

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
  const marks=[...document.querySelectorAll('.dialer-panel-mark, .dialer-panel-head h2, .dialer-panel-close')]
    .map(n=>{const r=n.getBoundingClientRect(); return {x:Math.floor(r.left-hr.left)-3, y:Math.floor(r.top-hr.top)-3,
                                                       w:Math.ceil(r.width)+6, h:Math.ceil(r.height)+6}})
  return { gap: Math.round(hr.top - pr.top), above,
           box: {x:Math.round(hr.left), y:Math.round(hr.top), w:Math.round(hr.width), h:Math.round(hr.height)},
           marks }
})
console.log('above title   :', JSON.stringify({gap:header.gap, above:header.above}))

/*
  DOES THE TITLE ACTUALLY PAINT OVER WHAT SCROLLS UNDER IT?

  This used to ask elementFromPoint whether the header was on top, and it always
  said yes — hit-testing does not care about alpha. So a header whose background
  was a white gradient fading to transparent passed this audit while a whole
  paragraph read straight through "About BEASTY". He found it; the audit did
  not. It measures pixels now.

  The header strip is captured with a long chapter scrolled under it and every
  pixel outside the mark, the title and the close button must be the card's own
  white. Text bleeding through drops those pixels well below the threshold.
*/
const strip = PNG.sync.read(await p.screenshot({clip: {x: header.box.x, y: header.box.y, width: header.box.w, height: header.box.h}}))
const scale = strip.width / header.box.w
let darkest = 255, dark = 0
/*
  Two exclusions, and neither is slack in the threshold.

  The card's rounded corners are page background showing past the card, and its
  left and right edges are three antialiased pixels blending card into page.
  Both are the card's own outline. His copy starts 20px inside it, so anything
  bleeding through lands nowhere near either.
*/
const R = 24 * scale, EDGE = 3 * scale
const masked = (x, y) =>
  x < EDGE || x > strip.width - EDGE ||
  (y < R && (x < R || x > strip.width - R)) ||
  header.marks.some(m =>
    x >= m.x*scale && x <= (m.x+m.w)*scale && y >= m.y*scale && y <= (m.y+m.h)*scale)
for (let y = 0; y < strip.height; y++) {
  for (let x = 0; x < strip.width; x++) {
    if (masked(x, y)) continue
    const i = (strip.width*y + x) << 2
    const lum = 0.299*strip.data[i] + 0.587*strip.data[i+1] + 0.114*strip.data[i+2]
    if (lum < darkest) darkest = Math.round(lum)
    if (lum < 232) dark++
  }
}
console.log('title pixels  : darkest', darkest, '| below 232:', dark)

await p.evaluate(()=>{const h=[...document.querySelectorAll('.panel-chapter-head')].find(x=>/The Plan/.test(x.textContent||''));h?.click()})
await p.waitForFunction(() => document.querySelectorAll('.panel-facts li').length > 0,
  null, { timeout: 15000 }).catch(() => {})
const plan = await p.evaluate(()=>({
  facts: [...document.querySelectorAll('.panel-facts li')].map(l=>l.textContent),
  after: document.querySelector('.panel-chapter-after')?.textContent?.trim() ?? null,
  stillOne: [...document.querySelectorAll('.panel-chapter-head')].filter(h=>h.getAttribute('aria-expanded')==='true').length,
  /* The intro is the page's lede and is set heavier. A chapter is body copy.
     `.dialer-panel p:first-of-type` matched BOTH, so every chapter he opened
     came up bold — his words, "a glitch with all the drop downs". */
  chapterWeight: Number(getComputedStyle(document.querySelector('.panel-chapter-body p')).fontWeight),
  introWeight: Number(getComputedStyle(document.querySelector('.dialer-panel-body > p')).fontWeight),
}))
console.log('The Plan      :', plan.facts.length, 'facts |', JSON.stringify(plan.after), '| open at once:', plan.stillOne)
console.log('weights       : intro', plan.introWeight, '| chapter', plan.chapterWeight)
await b.close(); srv.kill()

const fails=[]
/* Ten since 2026-08-26: "you can leave the universe the way it is, but can you
   please drop down the BEASTY & the prayer too?" The Universe stays as the open
   intro; the two paragraphs that followed it became the first two chapters. */
const WANT = ['The BEASTY Brand','The Prayer','The Story','The Blessing','The Gratitude',
              'The Mission','The Plan','The Future','The Build','BEASTY PAGES']
if(JSON.stringify(closed.heads)!==JSON.stringify(WANT))
  fails.push(`chapters are ${JSON.stringify(closed.heads)}, expected ${JSON.stringify(WANT)}`)
if(closed.intro!==2) fails.push(`the intro is ${closed.intro-1} paragraphs plus the sign-off, expected 1`)
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
if(!rerendered) fails.push('the landing photo never swapped in 9s \u2014 could not provoke a parent re-render, so the stays-open check proved nothing')
else if(survived.expandedCount!==1) fails.push('a chapter closed itself when the panel re-rendered \u2014 the drop-down does not stay open')
else if(survived.bodies!==1) fails.push('the opened chapter kept aria-expanded but lost its body on re-render')
if(plan.facts.length!==6) fails.push(`Biggie's pedigree is ${plan.facts.length} lines, expected 6`)
if(plan.after!=='God is Good all the time.') fails.push('his line after the pedigree is missing')
if(plan.stillOne!==1) fails.push('two chapters were open at once')
if(header?.gap !== 0) fails.push(`the title is ${header?.gap}px below the card's top edge — content shows in the gap`)
if(header?.above.length) fails.push('content is showing above the title: '+header.above.join(', '))
if(darkest < 200) fails.push(`text is showing through the title \u2014 darkest pixel ${darkest}, floor 200`)
if(dark > strip.width*strip.height*0.02) fails.push(`${dark} pixels of the title strip are tinted by content scrolling under it`)
if(plan.chapterWeight >= plan.introWeight) fails.push(`an opened chapter is set at weight ${plan.chapterWeight}, the same as the lede \u2014 the drop-downs are rendering bold`)
if(bad.length) fails.push('failed requests: '+[...new Set(bad)].join(', '))
if(fails.length){ console.log('\nFAIL: '+fails.join('; ')); process.exit(1) }
console.log('\nPASS: ten chapters, closed until tapped, an opaque title and body-weight copy.')
