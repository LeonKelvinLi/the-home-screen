/* Batch 74, Glenn's 28 October sends: four businesses, eleven films, Ramen and the new Dumplings page. Read-only on BASE. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { openSync, readFileSync, mkdirSync, readdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const live=process.env.BASE
const db=live?null:await freshTestDb('batch74')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const logPath='.verify/batch74-server.log'
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync(logPath,'w'),openSync(logPath,'a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`
const b=await chromium.launch();const p=await b.newPage({viewport:{width:393,height:852}});const fails=[]
const check=(name,ok)=>{console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
const where=()=>p.locator('.page-dots [aria-current="page"]').getAttribute('aria-label')
const open=async id=>{await p.goto(`${base}/?b=${id}`,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:25000});await p.waitForTimeout(650)}
const grid=()=>p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
const dots=()=>p.locator('.page-dots .dot').evaluateAll(a=>a.map(d=>d.getAttribute('aria-label')))
const goDot=async i=>{await p.evaluate(n=>document.querySelectorAll('.page-dots .dot')[n]?.click(),i);await p.waitForTimeout(700)}
/* Every screen of a BEASTY sheet: More eats runs on past 24, under the same name. */
const sheet=async name=>{const all=[];const ds=await dots();for(let i=0;i<ds.length;i++){if(ds[i]?.endsWith(`BEASTY, ${name}`)){await goDot(i);all.push(...await grid())}}return all}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const data=readdirSync('research/roster/b74').filter(f=>f.endsWith('.json')).sort().map(f=>JSON.parse(readFileSync('research/roster/b74/'+f,'utf8')))
 for(const d of data){
  await open(d.id)
  check(`${d.facts.name} opens`,(await p.locator('.brand-body').innerText()).includes(d.facts.tagline))
  check(`${d.id} direct link keeps Home`,(await p.locator('.nav-back').textContent()).includes('Home'))
  const badImages=await p.locator('.brand-body img').evaluateAll(a=>a.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src))
  check(`${d.id} images load`,badImages.length===0)
  if(d.facts.clip){
   await p.locator('.brand-clip-drop .menu-picks-bar').click()
   const v=p.locator('.brand-clip-drop video');await v.waitFor({timeout:10000});await v.scrollIntoViewIfNeeded()
   await p.waitForFunction(()=>{const v=document.querySelector('.brand-clip-drop video');return v&&v.readyState>=1},{},{timeout:20000})
   check(`${d.id} film decodes`,await v.evaluate(v=>v.videoWidth===540&&v.duration>0))
   check(`${d.id} film credited`,(await p.locator('.brand-clip-drop').innerText()).includes(d.facts.clip.credit))
  }
 }
 for(const d of data){
  await open(d.id)
  const place=p.locator('.nav-place')
  if(await place.count()){
   await place.first().click();await p.waitForTimeout(800)
   const labels=await grid()
   check(`${d.id} sits on its city grid (${await where()})`,labels.some(l=>l.includes(d.facts.label)||l.includes(d.facts.name)))
  }
 }
 /* The priced menus are all there behind the Menu bar. */
 for(const d of data){
  const want=(d.facts.sections||[]).reduce((n,s)=>n+s.items.length,0)
  if(!want)continue
  await open(d.id)
  await p.locator('.brand-menu-drop .menu-picks-bar').click()
  await p.waitForTimeout(500)
  const rows=await p.locator('.menu-row').count()
  check(`${d.id} shows all ${want} menu items (${rows})`,rows===want)
  if(d.facts.quoteOnly)check(`${d.id} cannot be ordered from`,await p.locator('.menu-row.is-quote').count()===want&&await p.locator('button.menu-row').count()===0)
  if(!live)await p.screenshot({path:`.verify/batch74-${d.facts.slug}.png`})
 }
 const panel=async(id,head)=>{await open(id);await p.locator('.brand-panel-head',{hasText:head}).click();await p.waitForTimeout(300);return p.locator('.brand-panel.is-open .brand-panel-body').innerText().catch(()=>'')}
 const txt=await panel('b_dindingdumplinghousefremont','Both shops')
 check('Din Ding lists both shops',txt.includes('3768 Capitol')&&txt.includes('1779 Decoto'))
 /* Each page's foodie reviews, Glenn's heavy hitter, mediocre and newbie: at most four films a page. */
 const extra={b_kajikensanmateo:['eatswithkath','eatswithfoodie'],b_tasteofshaxian:['thesnacksensei','jensintec','snackateriansf'],b_dindingdumplinghousefremont:['thesnacksensei','apoorva_sharma1']}
 for(const [id,bys] of Object.entries(extra)){
  await open(id)
  const list=p.locator('.foodie-reviews[aria-label="Foodie reviews"]')
  check(`${id} lists its foodie reviews`,await list.count()===1)
  const text=await list.innerText()
  for(const by of bys)check(`${id} lists @${by}`,text.includes('@'+by))
  const rows=list.locator('.foodie-review')
  const films=new Set(await p.locator('.brand-clip-drop video').evaluateAll(a=>a.map(v=>v.getAttribute('src'))))
  for(let i=0;i<await rows.count();i++){
   const row=rows.nth(i)
   const head=await row.locator('.foodie-review-head').innerText()
   if(!bys.some(by=>head.includes('@'+by)))continue
   await row.locator('.foodie-review-head').click()
   const v=row.locator('video');await v.waitFor({timeout:10000});await v.scrollIntoViewIfNeeded()
   await v.evaluate(v=>{v.preload='metadata';v.load()})
   await p.waitForFunction(el=>el.readyState>=1,await v.elementHandle(),{timeout:20000})
   films.add(await v.getAttribute('src'))
   check(`${id} review ${i+1} decodes`,await v.evaluate(v=>v.videoWidth===540&&v.duration>0))
   await row.locator('.foodie-review-head').click()
  }
  check(`${id} has at most 4 distinct films`, films.size<=4)
 }
 for(const f of data.map(d=>d.facts.icon))check(`${f} icon is served`,(await fetch(base+'/icons/'+f+'.webp')).headers.get('content-type')?.includes('webp'))
 check('the Dumplings wallpaper is served',(await fetch(base+'/wallpapers/cat-dimsum.webp')).headers.get('content-type')?.includes('webp'))
 /* BEASTY's own sheets, from Home. */
 await open(data[0].id);await p.click('.nav-back');await p.waitForTimeout(900)
 const on=async(name,ids)=>{const g=await sheet(name);for(const id of ids){const d=data.find(x=>x.id===id)||{facts:{name:id,label:id}};check(`${id} is on BEASTY • ${name}`,g.some(l=>l.includes(d.facts.label)||l.includes(d.facts.name)))}}
 /* Extra category pages require membership. Check their computed seats here; the separate
    category audit exercises signed-in navigation against the local test database. */
 for(const [kind,id] of [['ramen','b_kajikensanmateo'],['ramen','b_tasteofshaxian'],['dimsum','b_dindingdumplinghousefremont'],['dimsum','b_tasteofshaxian']])
  check(`${id} has its ${kind} category seat in the release data`,Object.entries(ALL_PLACEMENTS).some(([seat,brand])=>seat.startsWith(`beasty-${kind}-`)&&brand===id))
 await on('More eats',['b_thienlyhouse'])
 check('Ramen has nine occupied seats',Object.keys(ALL_PLACEMENTS).filter(s=>s.startsWith('beasty-ramen-')).length===9)
 check('Dumplings has twelve occupied seats',Object.keys(ALL_PLACEMENTS).filter(s=>s.startsWith('beasty-dimsum-')).length===12)
 const {OTHER_REVIEWS}=await tsImport('../src/data/foodies.ts',import.meta.url)
 const held=OTHER_REVIEWS.find(r=>r.reel.includes('DfDGnnGPsYp'))
 check('Manila Inasal is a Los Angeles source-only Foodie entry',held?.city==='Los Angeles'&&!held.brand&&!held.clip)
 const sweet=OTHER_REVIEWS.filter(r=>r.reel.includes('DU9GimFkmVj'))
 check('the resent firstdibs reel is not duplicated in extra reviews',sweet.length===0)

}catch(e){fails.push(e.message);console.log('FAIL',e.stack)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.log(`FAIL: ${fails.length} batch 74 checks`);process.exit(1)}
console.log('PASS: batch 74: four pages, eleven films, full menus, city seats, icons, reviews, both shops, Ramen and Dumplings.')
