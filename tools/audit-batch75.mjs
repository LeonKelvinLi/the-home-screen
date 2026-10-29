/* Batch 75: nine businesses, four updated pages, 21 new films, Hot Pot and BBQ. Read-only on BASE. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { openSync, readFileSync, mkdirSync, readdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const live=process.env.BASE
const db=live?null:await freshTestDb('batch75')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const logPath='.verify/batch75-server.log'
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
 const data=readdirSync('research/roster/b75').filter(f=>f.endsWith('.json')).sort().map(f=>JSON.parse(readFileSync('research/roster/b75/'+f,'utf8')))
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
   check(`${d.id} sits on its requested grid (${await where()})`,labels.some(l=>l.includes(d.facts.label)||l.includes(d.facts.name)))
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
  if(!live)await p.screenshot({path:`.verify/batch75-${d.facts.slug}.png`})
 }
 const panel=async(id,head)=>{await open(id);await p.locator('.brand-panel-head',{hasText:head}).click();await p.waitForTimeout(300);return p.locator('.brand-panel.is-open .brand-panel-body').innerText().catch(()=>'')}
 const txt=await panel('b_bingecoffeehouse','Berkeley cafes')
 check('Binge lists both Berkeley cafes',txt.includes('2199 Bancroft')&&txt.includes('2528A Durant'))
 const selections=await panel('b_mumuhotpotsunnyvale','Soup bases & add-ons')
 check('Mumu lists unpriced soup and add-on choices honestly',selections.includes('Yuzu Shio')&&selections.includes('not published'))
 /* Each page's foodie reviews, Glenn's heavy hitter, mediocre and newbie: at most four films a page. */
 const extra={b_originlabcoffeematcha:['andreweatsinsf'],b_parekoylutongpinoy:['bayarea_fooddreamz'],b_yamibowl:['volha_creative','yourglobalfoodiebff','boba._.addict'],b_wikiwikihawaiianbbq:['wthellydanyelly','feed_happiness_'],b_oceanoysterbarunioncity:['booziebrunch'],b_oceanoysterbarredwoodcity:['ruthannesturman'],b_luckythreeseven:['thetastebud','mayakay.official','larryjunetfm'],b_houseofphin:['eileenhuynher']}

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
 for(const kind of ['hotpot','bbq'])check(kind+' wallpaper is served',(await fetch(base+'/wallpapers/cat-'+kind+'.webp')).headers.get('content-type')?.includes('webp'))
 for(const [kind,id] of [['coffee','b_originlabcoffeematcha'],['coffee','b_bingecoffeehouse'],['coffee','b_houseofphin'],['pits','b_gemcitykennels'],['hotpot','b_mumuhotpotsunnyvale'],['bbq','b_woogakoreanbbq']])
  check(id+' has its '+kind+' seat',Object.entries(ALL_PLACEMENTS).some(([seat,brand])=>seat.startsWith('beasty-'+kind+'-')&&brand===id))
 check('Hot Pot has at least five occupied seats',Object.keys(ALL_PLACEMENTS).filter(s=>s.startsWith('beasty-hotpot-')).length>=5)
 check('BBQ has twenty-four occupied seats',Object.keys(ALL_PLACEMENTS).filter(s=>s.startsWith('beasty-bbq-')).length===24)
 await open('b_parekoylutongpinoy');await p.click('.nav-back');await p.waitForTimeout(900)
 const g=await sheet('More eats')
 for(const label of ['Parekoy','Yami Bowl','Wikiwiki'])check(label+' is on BEASTY More eats',g.some(l=>l.includes(label)))
 const {REELS}=await tsImport('../src/data/clips.ts',import.meta.url)
 const {reviewsOf}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
 for(const d of data){
  const sources=new Set([...(d.facts.clip?[d.facts.clip.src]:[]),...reviewsOf(d.id).filter(r=>r.src).map(r=>r.src)])
  check(d.id+' respects four-film limit',sources.size<=4)
 }
 check('Redwood hero shows Redwood City',data.find(d=>d.id==='b_oceanoysterbarredwoodcity').facts.clip.href.includes('DWIGk2_j-fX'))
 check('Union City review stays in Union City',reviewsOf('b_oceanoysterbarunioncity').some(r=>r.href.includes('DfDb-kFSieE'))&&!reviewsOf('b_oceanoysterbarredwoodcity').some(r=>r.href.includes('DfDb-kFSieE')))
 check('Larry tasting credits the actual posting account',REELS.some(r=>r.href?.includes('DUg0QAHEgY4')&&r.credit.startsWith('Posted by @lucky777oakland')))
 check('Lucky keeps four distinct films',new Set([data.find(d=>d.id==='b_luckythreeseven').facts.clip.src,...reviewsOf('b_luckythreeseven').map(r=>r.src).filter(Boolean)]).size===4)

}catch(e){fails.push(e.message);console.log('FAIL',e.stack)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.log(`FAIL: ${fails.length} batch 75 checks`);process.exit(1)}
console.log('PASS: batch 75: nine new businesses, four updated pages, 458 menu rows, 21 new films plus retained Lucky excerpt, placements, icons, Hot Pot and BBQ.')
