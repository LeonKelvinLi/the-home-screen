/* Batch 79: production BASE is read-only; local server uses a disposable database. */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import {openSync,readFileSync,readdirSync,mkdirSync} from 'node:fs'
import {createServer} from 'node:net'
import {tsImport} from 'tsx/esm/api'
import {freshTestDb} from './pgtest.mjs'
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const {OTHER_REVIEWS}=await tsImport('../src/data/foodies.ts',import.meta.url)
const live=process.env.BASE,db=live?null:await freshTestDb('batch79')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch79-server.log','w'),openSync('.verify/batch79-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`,b=await chromium.launch(),p=await b.newPage({viewport:{width:393,height:852}}),fails=[]
let checks=0
const check=(name,ok)=>{checks++;console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
const open=async id=>{await p.goto(`${base}/?b=${id}`,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(350)}
const grid=()=>p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
const film=async(v)=>{await v.waitFor({timeout:15000});await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});await p.waitForFunction(v=>v.readyState>=1,await v.elementHandle(),{timeout:25000});return v.evaluate(v=>v.videoWidth===540&&v.duration>0)}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const data=readdirSync('research/roster/b79').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync('research/roster/b79/'+f)))
 for(const d of data){
  await open(d.id)
  check(d.facts.name+' opens',(await p.locator('h1').innerText())===d.facts.name)
  check(d.id+' keeps Home',(await p.locator('.nav-back').innerText()).includes('Home'))
  check(d.id+' phone layout fits',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
  check(d.id+' own logo decodes',await p.evaluate(async src=>{const i=new Image();i.src=src;try{await i.decode();return i.naturalWidth===512}catch{return false}},'/icons/'+d.facts.icon+'.webp'))
  if(d.facts.clip){
   await p.locator('.brand-clip-drop .menu-picks-bar').click()
   const clips=[d.facts.clip,...(d.facts.clips||[])]
   check(d.id+' has all '+clips.length+' business videos',await p.locator('.brand-clip-drop video').count()===clips.length)
   for(let i=0;i<clips.length;i++){
    const v=p.locator('.brand-clip-drop video').nth(i)
    check(d.id+' film '+i+' decodes',await film(v))
    check(d.id+' film '+i+' credit',(await p.locator('.brand-clip-drop').innerText()).includes(clips[i].credit))
   }
  }
  const count=(d.facts.sections||[]).reduce((n,s)=>n+s.items.length,0)
  if(count){await p.locator('.brand-menu-drop .menu-picks-bar').click();check(d.id+' all '+count+' menu rows',await p.locator('.menu-row').count()===count)}
  else if(!d.facts.items?.length&&d.id!=='b_kiyomicaphe')check(d.id+' no invented priced food',await p.locator('.brand-menu-drop').count()===0)
  if(d.facts.quoteOnly)check(d.id+' own menu is read-only',await p.locator('button.menu-row').count()===0)
  const reviews=OTHER_REVIEWS.filter(r=>r.brand===d.id&&r.clip)
  for(const r of reviews){
   const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+r.by})})
   check(d.id+' lists @'+r.by,await row.count()===1)
   await row.locator('.foodie-review-head').click();check(d.id+' @'+r.by+' film decodes',await film(row.locator('video')));if(r.credit)check(d.id+' source note is visible',(await row.innerText()).includes(r.credit));await row.locator('.foodie-review-head').click()
  }
  check(d.id+' four-film maximum',reviews.length+(d.facts.clip?1:0)+(d.facts.clips?.length||0)<=4)
  for(const seat of d.placements)check(d.id+' seat '+seat,ALL_PLACEMENTS[seat]===d.id)
  if(d.id==='b_yakitoritoriman'){await p.locator('.nav-place').click();await p.waitForTimeout(600);check('Capitola city grid opens Toriman',(await grid()).some(n=>n.includes('Toriman')))}
 }
 await open('b_thesweetspot')
 check('Sweet Spot uses fresh flat-pink original',(await p.locator('.brand-hero-mark image').getAttribute('href'))==='/icons/the-sweet-spot-20261030.webp')
 check('Sweet Spot retains all three earlier reviews',OTHER_REVIEWS.filter(r=>r.brand==='b_thesweetspot'&&r.clip).length===3)
 for(const [id,by] of [['b_phohoa','ryanbyryanchua'],['b_unitedmexicanbarandgrill','thesnacksensei']]){
  await open(id);const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+by})});await row.locator('.foodie-review-head').click()
  check(id+' unavailable download stays linked',await row.locator('a[href*="instagram.com/reel/"]').count()===1&&await row.locator('video').count()===0)
  if(id==='b_phohoa')check('Pho Hoa chain location uncertainty remains visible',(await row.innerText()).includes('does not identify a location'))
 }
 await open('b_royalrootcafe');await p.locator('.brand-menu-drop .menu-picks-bar').click()
 check('Royal Root current cookie price is $7',(await p.locator('.menu-row',{hasText:'UBE Cookies with UBE Halaya filling'}).innerText()).includes('$7.00'))
 check('Royal Root lasagna says from $18',(await p.locator('.menu-row',{hasText:'Beef Cheesy Lasagna'}).innerText()).includes('from $18.00'))
 check('Royal Root excludes unavailable Red Velvet',await p.locator('.menu-row',{hasText:'Red Velvet'}).count()===0)
 check('Royal Root order link is exact',(await p.getByRole('link',{name:'Order on their menu',exact:true}).getAttribute('href'))==='https://royalrootcafe.com/order')
 await open('b_tapsilogexpress')
 check('Tapsilog order link selects verified San Leandro store',(await p.getByRole('link',{name:'Order on their menu',exact:true}).getAttribute('href'))==='https://order.online/business/29378/store/149103?pickup=true&redirected=true')
 check('Tapsilog HR address is not an order inbox',await p.locator('a[href="mailto:hr@tapsilogexpress.com"]').count()===0)
 await open('b_ramenshop');await p.locator('.brand-menu-drop .menu-picks-bar').click()
 check('Ramen Shop October 29 chicken bowl is $30',(await p.locator('.menu-row',{hasText:'Chicken Shoyu Ramen'}).innerText()).includes('$30.00'))
 check('Ramen Shop source date visible',(await p.locator('.brand-body').innerText()).includes('October 29, 2026'))
 check('Ramen Shop uses its actual reservation URL',(await p.getByRole('link',{name:'Reserve a table',exact:true}).getAttribute('href'))==='https://resy.com/cities/oak/ramen-shop-oak')
 await open('b_nokaramen');await p.locator('.brand-menu-drop .menu-picks-bar').click()
 check('NōKA current burger is $35',(await p.locator('.menu-row',{hasText:'Nōka Burger'}).innerText()).includes('$35.00'))
 check('NōKA Ramen Lab floor remains from $25',(await p.locator('.menu-row',{hasText:'Ramen Lab'}).innerText()).includes('from $25.00'))
 for(const id of ['b_sincitypits','b_gemcitykennels','b_scpargos']){await open(id);check(id+' business video is not labeled Foodie reviews',await p.locator('.foodie-reviews').count()===0)}
 const films=JSON.parse(readFileSync('research/roster/b79-films.json')),credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of films)check(f.code+' source and excerpt credited',credits.includes(f.slug+'.mp4')&&credits.includes(f.source)&&credits.includes(f.account))
 for(const asset of ['cat-yakitori.webp','cat-yakitori-thumb.webp'])check('Yakitori '+asset+' served',(await fetch(base+'/wallpapers/'+asset)).headers.get('content-type')?.includes('webp'))
 check('Cafe remains full with all prior members',Object.keys(ALL_PLACEMENTS).filter(s=>s.startsWith('beasty-coffee-')).length===24&&!Object.entries(ALL_PLACEMENTS).some(([s,id])=>s.startsWith('beasty-coffee-')&&id==='b_royalrootcafe'))
 check('Macondo original is attributed to @melsotel',OTHER_REVIEWS.some(r=>r.by==='melsotel'&&r.place==='Macondo Colombian Fusion'&&r.city==='Alameda'&&r.reel.endsWith('/Dexe7_gxwLe/')))
 await p.locator('.nav-back').click();await p.waitForTimeout(500)
 const ds=await p.locator('.page-dots .dot').evaluateAll(a=>a.map(d=>d.getAttribute('aria-label'))),at=ds.findIndex(x=>x.endsWith('BEASTY, More pages'))
 await p.locator('.page-dots .dot').nth(at).click();await p.waitForTimeout(500)
 check('More pages shows Yakitori without dropping Vegan',(await grid()).includes('BEASTY • Yakitori')&&(await grid()).includes('BEASTY • Vegan'))
 check('More pages has 24 category tiles',(await grid()).length===24)
 if(!live)await p.screenshot({path:'.verify/batch79-more-pages.png'})
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log(`\nPASS: ${checks} Batch 79 checks: pages, menus, own and review films, credits, held sources, city seats, Sweet Spot and Yakitori.`)
