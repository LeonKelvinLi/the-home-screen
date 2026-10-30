/* Batch 80: production BASE is read-only; local checks use a disposable DB. */
import {chromium} from 'playwright'
import {spawn,execFileSync} from 'node:child_process'
import {openSync,readFileSync,mkdirSync} from 'node:fs'
import {createServer} from 'node:net'
import {tsImport} from 'tsx/esm/api'
import {freshTestDb} from './pgtest.mjs'
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const {brandById}=await tsImport('../src/data/brands.ts',import.meta.url)
const {reviewsBy,pageOfFoodie}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
const {MORE_FOODIE_PAGES}=await tsImport('../src/data/foodies.ts',import.meta.url)
const {SEAT_RE}=await tsImport('../src/data/slots.ts',import.meta.url)
const manifest=JSON.parse(readFileSync('research/roster/b80-foodies.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch80')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch80-server.log','w'),openSync('.verify/batch80-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||'http://127.0.0.1:'+port,b=await chromium.launch(),p=await b.newPage({viewport:{width:393,height:852}}),fails=[]
let checks=0
const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(600)}
const where=()=>p.locator('.page-dots [aria-current="page"]').getAttribute('aria-label')
const grid=()=>p.locator('.home-page:not([inert]) .home-grid button').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
const film=async v=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});await p.waitForFunction(v=>v.readyState>=1,await v.elementHandle(),{timeout:25000});return v.evaluate(v=>v.videoWidth===540&&v.videoHeight===960&&v.duration>0)}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('138 additional creators have unique handles',MORE_FOODIE_PAGES.length===138&&new Set(MORE_FOODIE_PAGES.map(f=>f.handle)).size===138)
 for(const [i,f] of manifest.original_top_24.entries())check('original Foodies seat '+i+' stays with '+f.handle,ALL_PLACEMENTS['beasty-foodies-'+i]===(f.brand||'b_foodie'+f.handle.replace(/[^a-z0-9]/g,'')))
 for(const [i,f] of MORE_FOODIE_PAGES.entries()){
  const id=pageOfFoodie(f.handle),seat='beasty-foodies2-'+i
  check(f.handle+' has its own page and reviews',!!id&&!!brandById(id)&&reviewsBy(f.handle).length>0)
  check(f.handle+' holds stable overflow seat '+i,SEAT_RE.test(seat)&&ALL_PLACEMENTS[seat]===id)
 }
 for(const h of Object.keys(manifest.excluded_posting_accounts))check(h+' is not invented as a Foodie',!MORE_FOODIE_PAGES.some(f=>f.handle===h))
 await open('b_sansanteahouse')
 check('San San opens with its exact name',await p.locator('h1').innerText()==='San San Tea House')
 check('San San fits the phone',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 check('current own pink icon decodes',await p.evaluate(async()=>{const i=new Image();i.src='/icons/san-san-tea-house.webp';await i.decode();return i.naturalWidth===512&&i.naturalHeight===512}))
 check('published business number is callable',await p.locator('a[href="tel:4153223333"]').count()===1)
 check('San San Instagram footer uses the correct profile URL',await p.locator('a[href="https://www.instagram.com/sansanteahouse/"]').count()===1)
 check('winter hours supersede the older profile',/Daily 11am–7pm/.test(await p.locator('.brand-body').innerText()))
 await p.getByRole('button',{name:'Winter hours',exact:true}).click()
 check('dated own hours source is linked',await p.locator('a[href="https://www.instagram.com/p/Dezx7S_y-jU/"]').count()===1)
 check('unverified prices are held',await p.locator('.brand-menu-drop').count()===0)
 check('expired April discount is not offered',!/10%|SL EATS|4\/13/.test(await p.locator('.brand-body').innerText()))
 await p.locator('.brand-clip-drop .menu-picks-bar').click()
 check('requested Watch film decodes',await film(p.locator('.brand-clip-drop video')))
 check('Watch credits the actual reviewer',(await p.locator('.brand-clip-drop').innerText()).includes('@sanleandroeats'))
 const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@feed_happiness_'})})
 await row.locator('.foodie-review-head').click()
 check('Heavy Hitter review decodes',await film(row.locator('video')))
 for(const seat of ['san-leandro-goods2-1','beasty-goods2-94','beasty-bakery-15'])check('San San seat '+seat,ALL_PLACEMENTS[seat]==='b_sansanteahouse')
 check('prior San Leandro Boba member stays',ALL_PLACEMENTS['san-leandro-goods-14']==='b_thirsteasanleandro')
 check('prior flagship Boba member stays',ALL_PLACEMENTS['beasty-sweets-3']==='b_cravingz')
 check('San San leads the explicitly requested tea category',ALL_PLACEMENTS['beasty-teas-0']==='b_sansanteahouse')
 await p.locator('.nav-place').click();await p.waitForTimeout(700)
 check('San Leandro button reaches San San on yellow',(await grid()).includes('San San Tea House')&&/San Leandro, More goods$/.test(await where()))
 await open('b_chichasanchenberkeley')
 check('CHICHA Berkeley opens',await p.locator('h1').innerText()==='CHICHA San Chen — Berkeley')
 check('CHICHA has the verified Berkeley address',(await p.locator('.brand-body').innerText()).includes('2400A Bancroft Way'))
 check('CHICHA Instagram footer uses the correct profile URL',await p.locator('a[href="https://www.instagram.com/chichasanchen.norcal/"]').count()===1)
 check('regional phone is labeled separately',(await p.locator('.brand-body').innerText()).includes('Regional contact'))
 await p.getByRole('button',{name:'NorCal contact',exact:true}).click()
 check('regional phone does not masquerade as a branch number',await p.getByRole('link',{name:'NorCal team: (408) 792-9045',exact:true}).count()===1)
 check('Berkeley menu uses the branch-specific official link',await p.locator('a[href="https://order.snackpass.co/chichasanchenberkeley"]').count()===1)
 check('CHICHA unverified prices are held',await p.locator('.brand-menu-drop').count()===0)
 await p.locator('.brand-clip-drop .menu-picks-bar').click()
 check('CHICHA own Watch decodes',await film(p.locator('.brand-clip-drop video')))
 check('CHICHA company film uses a posted-by credit',(await p.locator('.brand-clip-drop').innerText()).includes('Posted by @chichasanchen.norcal'))
 for(const [by,note] of [['eatswithkath',''],['sierra.eats.8','BOGO offer has ended'],['hungere.for.diy','Pleasanton location']]){
  const r=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+by})});await r.locator('.foodie-review-head').click()
  check(by+' CHICHA requested film decodes',await film(r.locator('video')))
  if(note){check(by+' location/context is visible',(await r.innerText()).includes(note));check(by+' context appears before playback',await r.locator('.foodie-review-body > :first-child').evaluate(e=>e.classList.contains('foodie-review-credit')))}
  await r.locator('.foodie-review-head').click()
 }
 check('CHICHA keeps the four-film maximum',await p.locator('.foodie-review-head').count()===3&&await p.locator('.brand-clip-drop video').count()===1)
 for(const seat of ['berkeley-goods-14','beasty-goods2-95','beasty-teas-1'])check('CHICHA seat '+seat,ALL_PLACEMENTS[seat]==='b_chichasanchenberkeley')
 for(const [handle,place,city] of [['sierra.eats.8','CHICHA San Chen — Fremont','Fremont'],['hungere.for.diy','CHICHA San Chen — Pleasanton','Pleasanton']]){
  await open(pageOfFoodie(handle))
  await p.getByRole('button',{name:place+' '+city,exact:true}).click()
  const link=p.getByRole('button',{name:'Open CHICHA San Chen — Berkeley on BEASTY',exact:true})
  check(handle+' business link names the actual Berkeley destination',await link.count()===1)
  await link.click()
  await p.waitForTimeout(600)
  check(handle+' business link reaches Berkeley',await p.locator('h1').innerText()==='CHICHA San Chen — Berkeley')
 }
 for(const h of [MORE_FOODIE_PAGES[0].handle,'bayarea.foodie.adventures','feed_happiness_','moniica.michelle','sanleandroeats']){
  await open(pageOfFoodie(h));check(h+' page renders its review list',/Their reviews/i.test(await p.locator('.foodie-reviews-h').innerText())&&await p.locator('.foodie-review-head').count()>0)
  check(h+' page fits',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 }
 await p.locator('.nav-place').click();await p.waitForTimeout(700)
 check('last creator opens its own More foodies sheet',/BEASTY, More foodies$/.test(await where())&&(await grid()).some(n=>n.startsWith('San Leandro Eats')))
 const dots=await p.locator('.page-dots .dot').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
 check('Foodies and six yellow continuations travel together',dots.length===7&&dots.some(x=>/BEASTY, Foodies$/.test(x))&&dots.filter(x=>/BEASTY, More foodies$/.test(x)).length===6)
 const seen=new Set()
 for(const label of dots){
  await p.getByRole('button',{name:label,exact:true}).click();await p.waitForTimeout(500)
  const names=await grid()
  if(/More foodies$/.test(label)){
   names.forEach(x=>seen.add(x));check(label+' uses yellow paper',await p.locator('.home-page:not([inert]).is-yellow').count()===1)
  }else check('original top 24 still render together',names.length===24&&manifest.original_top_24.every(f=>names.some(x=>x===f.name||x.startsWith(f.name+','))))
  check(label+' fits',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 }
 check('all 138 additional creators are reachable on yellow',MORE_FOODIE_PAGES.every(f=>[...seen].some(x=>x===f.name||x.startsWith(f.name+',')))&&seen.size===138)
 if(!live)await p.screenshot({path:'.verify/batch80-more-foodies.png'})
 await p.setViewportSize({width:393,height:675});await open(pageOfFoodie('sanleandroeats'));await p.locator('.nav-place').click();await p.waitForTimeout(700)
 check('short iPhone reaches seat 137 directly',(await grid()).some(n=>n.startsWith('San Leandro Eats'))&&/More foodies$/.test(await where()))
 check('short iPhone sheet fits',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 await p.setViewportSize({width:393,height:852});await open('b_sansanteahouse');await p.locator('.nav-back').click();await p.waitForTimeout(500)
 const more=await p.locator('.page-dots .dot').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')).filter(x=>/BEASTY, More pages$/.test(x)))
 check('25 overflow categories have two More pages sheets',more.length===2)
 const categories=new Set()
 for(const label of more){await p.getByRole('button',{name:label,exact:true}).click();await p.waitForTimeout(500);(await grid()).filter(n=>n.startsWith('BEASTY •')).forEach(n=>categories.add(n))}
 check('tea tile is reachable without losing earlier categories',categories.size>=25&&categories.has('BEASTY • Teas/Boba/Matcha')&&categories.has('BEASTY • Yakitori')&&categories.has('BEASTY • Vegan'))
 for(const file of ['cat-teas.webp','cat-teas-thumb.webp'])check(file+' is served',(await fetch(base+'/wallpapers/'+file)).headers.get('content-type')?.includes('webp'))
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of JSON.parse(readFileSync('research/roster/b80-films.json'))){
  check(f.code+' has visible source and excerpt credit',credits.includes(f.slug+'.mp4')&&credits.includes(f.source)&&credits.includes(f.account))
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type','-of','json','public/clips/'+f.slug+'.mp4']))
  check(f.code+' retains an audio stream',probe.streams.some(s=>s.codec_type==='audio'))
 }
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 80 checks: both shops, all six films, current hours, preserved seats, Teas and extended Foodies pages.')
