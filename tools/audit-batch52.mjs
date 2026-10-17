/* Glenn's 15–16 October additions and the category Back regression. Read-only on BASE. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { openSync, readFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { freshTestDb } from './pgtest.mjs'
const live=process.env.BASE
const db=live?null:await freshTestDb('batch52')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const logPath='.verify/batch52-server.log'
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync(logPath,'w'),openSync(logPath,'a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`
const b=await chromium.launch();const p=await b.newPage({viewport:{width:393,height:852}});const fails=[]
const check=(name,ok)=>{console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
const where=()=>p.locator('.page-dots [aria-current="page"]').getAttribute('aria-label')
const open=async id=>{await p.goto(`${base}/?b=${id}`,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:25000});await p.waitForTimeout(650)}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const data=JSON.parse(readFileSync('research/roster/batch52.json','utf8')).filter(x=>x.facts?.slug)
 for(const d of data){
  await open(d.id)
  check(`${d.facts.name} opens`,(await p.locator('.brand-body').innerText()).includes(d.facts.tagline))
  check(`${d.id} direct link keeps Home`,(await p.locator('.nav-back').textContent()).includes('Home'))
  const badImages=await p.locator('.brand-body img').evaluateAll(a=>a.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src))
  check(`${d.id} images load`,badImages.length===0)
  if(d.facts.clip){
   await p.locator('.brand-clip-drop .menu-picks-bar').click()
   const v=p.locator('.brand-clip-drop video');await v.waitFor({timeout:10000})
   await p.waitForFunction(()=>{const v=document.querySelector('.brand-clip-drop video');return v&&v.readyState>=1},{},{timeout:20000})
   check(`${d.id} film decodes`,await v.evaluate(v=>v.videoWidth===540&&v.duration>0))
   if(d.facts.clip.by)check(`${d.id} creator credited`,(await p.locator('.brand-clip-drop').innerText()).includes('@'+d.facts.clip.by))
  }
 }
 for(const id of ['b_funcloudevents','b_yosushivacaville','b_beniciagrill','b_maymayscravings','b_acekingbbq']){
  await open(id)
  const bar=p.locator('.brand-clip-drop .menu-picks-bar')
  check(`${id} existing page receives its requested film`,await bar.count()===1)
  if(await bar.count()){
   await bar.click();await p.waitForFunction(()=>document.querySelector('.brand-clip-drop video')?.readyState>=1,{},{timeout:20000})
   check(`${id} film decodes`,await p.locator('.brand-clip-drop video').evaluate(v=>v.videoWidth===540&&v.duration>0))
  }
 }
 await open('b_wilfredslounge');check('Wilfred’s dog-friendly badge',await p.locator('.chip-dog-friendly').isVisible())
 await p.screenshot({path:'.verify/batch52-wilfreds.png'})
 await open('b_super savage games'.replaceAll(' ',''));await p.locator('.nav-place').click();await p.waitForTimeout(800)
 check('Games grid opens',/BEASTY, Games$/.test(await where()))
 check('Super Savage Games occupies first Games spot',(await p.locator('.home-page:not([inert]) .home-grid button').first().getAttribute('aria-label')).includes('Super Savage'))
 await p.locator('.home-page:not([inert]) button[aria-label="Super Savage Games"]').click();await p.waitForTimeout(700)
 check('Grid launch says Back',(await p.locator('.nav-back').textContent()).includes('Back'))
 const gridBefore=await where();await p.locator('.nav-back').click();await p.waitForTimeout(700)
 check('Back returns to the same Games grid',(await where())===gridBefore)
 await p.screenshot({path:'.verify/batch52-games.png'})
 if(!live){
  // Local throwaway member only. Live mode never creates accounts or sends messages.
  const email=`batch52-${port}@audit.beastypages.dev`
  await p.evaluate(e=>fetch('/api/members/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Batch 52 test',email:e})}),email)
  let code;for(let i=0;i<40&&!code;i++){await p.waitForTimeout(250);code=readFileSync(logPath,'utf8').split('\n').filter(l=>l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]}
  const status=await p.evaluate(async({email,code})=>(await fetch('/api/members/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,code})})).status,{email,code})
  check(`Local test member signs in (${status})`,status>=200&&status<300)
  await p.setViewportSize({width:320,height:568})
  await open('b_zadnagrill');await p.locator('.nav-back').click();await p.waitForTimeout(600)
  await p.getByRole('button',{name:'Search',exact:true}).first().click();await p.locator('.search-drop-btn',{hasText:'Categories'}).click()
  await p.locator('#search-drop-categories .search-brand',{hasText:'BEASTY • Cafe'}).click();await p.waitForTimeout(700)
  const dots=await p.locator('.page-dots .dot').evaluateAll(a=>a.map((x,i)=>({i,label:x.getAttribute('aria-label')})))
  const cafe=dots.filter(x=>/BEASTY, Cafe$/.test(x.label||''));check('Cafe has multiple screens for the pagination regression',cafe.length>1)
  if(cafe.length>1){
   await p.locator('.page-dots .dot').nth(cafe.at(-1).i).click();await p.waitForTimeout(700)
   const before=await where();const grid=p.locator('.home-page:not([inert]) .home-grid')
   const brand=grid.locator('button[aria-label]:not([aria-label*="spot available"])').first()
   await brand.click();await p.locator('.brand-body').waitFor();check('Cafe business shows Back',(await p.locator('.nav-back').textContent()).includes('Back'))
   await p.locator('.nav-back').click();await p.waitForTimeout(700);check('Back preserves the exact Cafe page index',(await where())===before)
  }
 }
}catch(e){fails.push(e.message);console.log('FAIL',e.stack)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.log(`FAIL: ${fails.length} batch 52 checks`);process.exit(1)}
console.log('PASS: batch 52 business pages, films, badge, Games and grid Back navigation.')
