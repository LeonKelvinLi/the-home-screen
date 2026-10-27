/* Glenn's 27 October 7:21-7:32 am sends (batch 71): Cali K9 (film, VIP clients gallery) and Legend Hotpot & Grill (film, Uber Eats price list, second and third films). Read-only on BASE. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { openSync, readFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { freshTestDb } from './pgtest.mjs'
const live=process.env.BASE
const db=live?null:await freshTestDb('batch71')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const logPath='.verify/batch71-server.log'
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
 const data=JSON.parse(readFileSync('research/roster/batch71.json','utf8'))
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
   if(d.facts.clip.by)check(`${d.id} creator credited`,(await p.locator('.brand-clip-drop').innerText()).includes('@'+d.facts.clip.by))
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
  /* The Breakfast Club is not open: its rows are a price list, not buttons that start an order. */
  if(d.facts.quoteOnly)check(`${d.id} cannot be ordered from`,await p.locator('.menu-row.is-quote').count()===want&&await p.locator('button.menu-row').count()===0)
  if(!live)await p.screenshot({path:`.verify/batch71-${d.facts.slug}.png`})
 }
 /* Cali K9's VIP clients: the titled strip of five pictures, every one loading. */
 await open('b_calik9')
 const strip=p.locator('.brand-photos')
 check('b_calik9 shows its VIP clients title',(await strip.locator('.brand-photos-title').innerText().catch(()=>'')).includes('VIP clients'))
 check('b_calik9 has 5 client pictures',await strip.locator('img').count()===5)
 const imgs=strip.locator('img');for(let i=0;i<await imgs.count();i++){await imgs.nth(i).scrollIntoViewIfNeeded().catch(()=>{});}
 await p.waitForTimeout(800)
 check('b_calik9 client pictures all load',await strip.locator('img').evaluateAll(a=>a.every(i=>i.complete&&i.naturalWidth>0)))
 check('b_calik9 shows its phone and email',(await p.locator('.brand-body').innerText()).includes('(510) 890-0298'))
 /* Legend's second and third films, each decoding under its page's film. */
 const extra={b_legendhotpotgrill:['bestbayareafood','victoria.pham17']}
 for(const [id,bys] of Object.entries(extra)){
  await open(id)
  const list=p.locator('.foodie-reviews[aria-label="Foodie reviews"]')
  check(`${id} lists its other films`,await list.count()===1)
  const text=await list.innerText()
  for(const by of bys)check(`${id} lists @${by}`,text.includes('@'+by))
  const rows=list.locator('.foodie-review')
  check(`${id} has at most 3 films`,await rows.count()<=3)
  for(let i=0;i<await rows.count();i++){
   const row=rows.nth(i)
   const head=await row.locator('.foodie-review-head').innerText()
   if(!bys.some(by=>head.includes('@'+by)))continue
   await row.locator('.foodie-review-head').click()
   const v=row.locator('video');await v.waitFor({timeout:10000});await v.scrollIntoViewIfNeeded()
   await v.evaluate(v=>{v.preload='metadata';v.load()})
   await p.waitForFunction(el=>el.readyState>=1,await v.elementHandle(),{timeout:20000})
   check(`${id} film ${i+1} decodes`,await v.evaluate(v=>v.videoWidth===540&&v.duration>0))
   await row.locator('.foodie-review-head').click()
  }
 }
 for(const f of ['cali-k9','legend-hotpot-grill'])check(`${f} icon is served`,(await fetch(base+'/icons/'+f+'.webp')).headers.get('content-type')?.includes('webp'))
 /* BEASTY's own sheets, from Home. */
 await open(data[0].id);await p.click('.nav-back');await p.waitForTimeout(900)
/* Youth, Catering and Food Trucks open only from a signed-in Search, so their seats (Youth 3, Catering 7, Food Trucks 12) are checked in the seat diff, not here. */
 const more=await sheet('More eats')
 for(const d of data.filter(d=>d.placements.some(s=>s.startsWith('beasty-goods2-'))))
  check(`${d.id} is on BEASTY • More eats`,more.some(l=>l.includes(d.facts.label)||l.includes(d.facts.name)))
}catch(e){fails.push(e.message);console.log('FAIL',e.stack)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.log(`FAIL: ${fails.length} batch 71 checks`);process.exit(1)}
console.log('PASS: batch 71: Cali K9 and Legend Hotpot & Grill pages, films, gallery, price list, city seats and icons.')
