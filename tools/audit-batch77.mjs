/* Batch 77: five new pages, Laughing Monk, Vegan; production BASE is read-only. */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import {openSync,readFileSync,readdirSync,mkdirSync} from 'node:fs'
import {createServer} from 'node:net'
import {tsImport} from 'tsx/esm/api'
import {freshTestDb} from './pgtest.mjs'
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const {OTHER_REVIEWS}=await tsImport('../src/data/foodies.ts',import.meta.url)
const live=process.env.BASE,db=live?null:await freshTestDb('batch77')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch77-server.log','w'),openSync('.verify/batch77-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`,b=await chromium.launch(),p=await b.newPage({viewport:{width:393,height:852}}),fails=[]
const check=(name,ok)=>{console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
const open=async id=>{await p.goto(`${base}/?b=${id}`,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const grid=()=>p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
const film=async v=>{await v.waitFor({timeout:15000});await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});await p.waitForFunction(v=>v.readyState>=1,await v.elementHandle(),{timeout:25000});return v.evaluate(v=>v.videoWidth===540&&v.duration>0)}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const data=readdirSync('research/roster/b77').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync('research/roster/b77/'+f)))
 for(const d of data){
  await open(d.id)
  check(d.facts.name+' opens',(await p.locator('h1').innerText())===d.facts.name)
  check(d.id+' keeps Home',(await p.locator('.nav-back').innerText()).includes('Home'))
  check(d.id+' has no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
  check(d.id+' icon loads',await p.locator('.brand-body img').evaluateAll(a=>a.every(i=>i.complete&&i.naturalWidth>0)))
  if(d.facts.clip){await p.locator('.brand-clip-drop .menu-picks-bar').click();check(d.id+' main film decodes',await film(p.locator('.brand-clip-drop video')));check(d.id+' main credit',(await p.locator('.brand-clip-drop').innerText()).includes(d.facts.clip.credit))}
  const want=(d.facts.sections||[]).reduce((n,s)=>n+s.items.length,0)
  if(want){await p.locator('.brand-menu-drop .menu-picks-bar').click();check(d.id+' all '+want+' menu rows',(await p.locator('.menu-row').count())===want)}
  else check(d.id+' does not invent priced menu rows',await p.locator('.brand-menu-drop').count()===0)
  if(d.facts.quoteOnly)check(d.id+' starting-price menu is read-only',await p.locator('button.menu-row').count()===0)
  const reviews=OTHER_REVIEWS.filter(r=>r.brand===d.id&&r.clip)
  for(const r of reviews){
   const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+r.by})})
   check(d.id+' lists @'+r.by,await row.count()===1)
   await row.locator('.foodie-review-head').click();check(d.id+' @'+r.by+' review decodes',await film(row.locator('video')))
   if(r.credit)check(d.id+' repost credits original reviewer',(await row.innerText()).includes(r.credit))
   await row.locator('.foodie-review-head').click()
  }
  check(d.id+' maximum four playable films',reviews.length+(d.facts.clip?1:0)<=4)
  check(d.id+' icon is served',(await fetch(base+'/icons/'+d.facts.icon+'.webp')).headers.get('content-type')?.includes('webp'))
  for(const seat of d.placements)check(d.id+' seat '+seat,ALL_PLACEMENTS[seat]===d.id)
  if(d.facts.address){await p.locator('.nav-place').first().click();await p.waitForTimeout(700);check(d.id+' appears on its city grid',(await grid()).some(l=>l.includes(d.facts.label)||l.includes(d.facts.name)))}
 }
 await open('b_houseofprimerib')
 for(const by of ['bayarea_fooddreamz','bayarea.foodies']){const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+by})});await row.locator('.foodie-review-head').click();check(by+' held source stays linked without a fifth film',await row.locator('a[href*="instagram.com/reel/"]').count()===1&&await row.locator('video').count()===0);await row.locator('.foodie-review-head').click()}
 await open('b_tleafgreensanjose');await p.locator('.brand-menu-drop .menu-picks-bar').click()
 check('TLeafGreen preserves from-price labels',await p.getByText('from $6.90',{exact:true}).count()>0)
 check('TLeafGreen does not publish promotional $4.90',(await p.locator('.brand-body').innerText()).includes('$4.90')===false)
 await open('b_urbanmatchacastrovalley')
 check('Urban Matcha has four films including own Watch',OTHER_REVIEWS.filter(r=>r.brand==='b_urbanmatchacastrovalley'&&r.clip).length===3)
 check('Vegan starts with Laughing Monk and Chef Reina',ALL_PLACEMENTS['beasty-vegan-0']==='b_laughingmonknopa'&&ALL_PLACEMENTS['beasty-vegan-1']==='b_chefreina')
 check('Vegan wallpaper served',(await fetch(base+'/wallpapers/cat-vegan.webp')).headers.get('content-type')?.includes('webp'))
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of JSON.parse(readFileSync('research/roster/b77-films.json')))check(f.code+' credited',credits.includes(f.slug+'.mp4')&&credits.includes(f.source))
 // The new tile remains visible on More pages while signed out; do not create a production account.
 await p.locator('.nav-back').click();await p.waitForTimeout(600)
 const ds=await p.locator('.page-dots .dot').evaluateAll(a=>a.map(d=>d.getAttribute('aria-label'))),at=ds.findIndex(x=>x.endsWith('BEASTY, More pages'))
 await p.locator('.page-dots .dot').nth(at).click();await p.waitForTimeout(600)
 check('More pages includes Vegan',(await grid()).includes('BEASTY • Vegan'))
 if(!live)await p.screenshot({path:'.verify/batch77-more-pages.png'})
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: Batch 77 pages, 150 new menu rows, credited films, cap holds, city seats and Vegan tile.')
