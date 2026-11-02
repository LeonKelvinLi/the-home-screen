/* Batch 86: production mode is read-only. Local server uses a disposable DB. */
import { chromium, webkit, devices } from 'playwright'
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'
import { readFileSync, openSync, mkdirSync } from 'node:fs'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const {brandById}=await tsImport('../src/data/brands.ts',import.meta.url)
const {REELS}=await tsImport('../src/data/clips.ts',import.meta.url)
const {MORE_FOODIE_PAGES}=await tsImport('../src/data/foodies.ts',import.meta.url)
const {pageOfFoodie,reviewsBy}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
const m=JSON.parse(readFileSync('research/roster/batch86.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch86')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch86-server.log','w'),openSync('.verify/batch86-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch86-browser-fixture',name:'Batch 86 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});const fig=v.locator('xpath=ancestor::figure');if(await fig.count())await fig.getByRole('button',{name:'Turn the sound on',exact:true}).click();else if(iphone)await v.click();else await v.press('Space');await p.waitForFunction(v=>v.readyState>=2&&v.currentTime>.05&&!v.paused,await v.elementHandle(),{timeout:30000});const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));if(d.w!==540||d.h!==960)console.log('film dimensions',d);return d.w===540&&d.h===960&&d.d>0}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1573 earlier seats retain their business',Object.keys(m.baseline.seats).length===1573&&Object.entries(m.baseline.seats).every(([k,v])=>ALL_PLACEMENTS[k]===v))
 for(const [seat,id]of Object.entries(m.new_seats))check(seat+' reaches '+id,ALL_PLACEMENTS[seat]===id)
 check('all 150 earlier overflow Foodie seats stay in order',m.baseline.more_foodie_handles.every((h,i)=>MORE_FOODIE_PAGES[i].handle===h)&&MORE_FOODIE_PAGES.length===172)
 check('Andrew old and current handles share one page and all prior reviews',pageOfFoodie('seekeasyeats')==='b_foodieseekeasyeats'&&pageOfFoodie('whofedandrew')===pageOfFoodie('seekeasyeats')&&reviewsBy('whofedandrew').length===m.baseline.andrew_reviews)
 for(const x of m.businesses){
  const id='b_'+x.slug.replace(/-/g,''),brand=brandById(id)
  await open(id)
  check(x.name+' heading and phone width',await p.locator('h1').innerText()===x.name&&await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
  check(x.name+' original icon decodes',await p.evaluate(async src=>{const im=new Image();im.src=src;await im.decode();return im.naturalWidth===512&&im.naturalHeight===512},'/icons/'+x.icon+'.webp'))
  if(x.phone)check(x.name+' phone link',await p.locator(`a[href="tel:${x.phone.replace(/\D/g,'')}"]`).count()===1)
  if(x.address)check(x.name+' verified address',(await p.locator('.brand-body').innerText()).includes(x.address))
  if(x.hours)check(x.name+' published hours',(await p.locator('.brand-body').innerText()).includes(x.hours))
  check(x.name+' complete menu model',brand.menu.length===x.menu_sections&&brand.menu.reduce((n,c)=>n+c.items.length,0)===x.menu_rows)
  if(x.menu_rows){await p.locator('.brand-menu-drop > .menu-picks-bar').click();check(x.name+' complete menu visible',await p.locator('.brand-menu-body .menu-row').count()===x.menu_rows);await p.locator('.brand-menu-drop > .menu-picks-bar').click()}
  for(const panel of x.panels??[]){await p.getByRole('button',{name:panel.head,exact:true}).click();const text=await p.locator('.brand-body').innerText();check(x.name+' '+panel.head+' panel opens',panel.body.every(line=>text.includes(line)));await p.getByRole('button',{name:panel.head,exact:true}).click()}
  const trigger=p.getByRole('button',{name:`Enlarge ${x.name} logo`,exact:true});await trigger.click();await p.locator('dialog[open]').waitFor();check(x.name+' logo viewer shows original',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512}));await p.getByRole('button',{name:`Restore ${x.name} logo size`,exact:true}).click();check(x.name+' returns without reload',await p.locator('dialog').count()===0);await shot(x.slug)
 }
 const byBrand=Map.groupBy(m.films,f=>f.brand)
 for(const [id,films]of byBrand){
  await open(id)
  const own=films.filter(f=>f.role!=='review')
  if(own.length){await p.locator('.brand-clip-drop > .menu-picks-bar').click();for(const f of own){check(f.code+' business film visibly advances',await film(p.locator(`.brand-clip-drop video[src="/clips/${f.slug}.mp4"]`)));if(f.note)check(f.code+' note visible before playback',(await p.locator('.brand-clip-drop').innerText()).includes(f.note))}}
  for(const f of films.filter(f=>f.role==='review')){
   const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click();check(f.code+' attributed review visibly advances',await film(row.locator('video')));if(f.note)check(f.code+' review warning visible',(await row.innerText()).includes(f.note));await row.locator('.foodie-review-head').click()
  }
 }
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']))
  check(f.code+' bounded excerpt and original audio',probe.streams.some(s=>s.codec_type==='audio')&&Math.abs(+probe.format.duration-(f.end-f.start))<.2)
  check(f.code+' source and excerpt credited',credits.includes(f.source)&&credits.includes(f.account)&&credits.includes(f.slug+'.mp4'))
  check(f.code+' once in Watch',REELS.filter(r=>r.src==='/clips/'+f.slug+'.mp4').length===1)
 }
 check('all 465 Watch films unique',REELS.length===465&&new Set(REELS.map(r=>r.src)).size===465)
 const {reviewsOf}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
 for(const id of ['b_monsterpho','b_simplycakebakery','b_pollyann','b_chezmaeju']){const brand=brandById(id);check(id+' keeps four local films',Number(!!brand.clip?.src)+(brand.clips??[]).filter(c=>c.src).length+reviewsOf(id).filter(r=>r.src&&r.src!==brand.clip?.src).length===4)}
 check('existing AI page retains old film and gains labeled fictional film',brandById('b_omerarielyai').clip.src==='/clips/omer-ariely-ai.mp4'&&brandById('b_omerarielyai').clips.some(c=>c.src==='/clips/this-aint-canon-v86.mp4'&&c.credit.includes('AI-generated fictional')))
 check('Sisig old photos removed while menu and new own film remain',!brandById('b_senorsisig').photos?.length&&brandById('b_senorsisig').clip.src==='/clips/senor-sisig-plo-v86.mp4')
 for(const h of m.portraits){const id=pageOfFoodie(h);await open(id);const src=brandById(id).logo.imageUrl;await p.locator('.brand-logo-zoom-trigger').click();await p.locator('dialog[open]').waitFor();check(h+' requested portrait is attached and decodes',src.includes('-v86.webp')&&await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.complete&&e.naturalWidth===512}));if(['whofedandrew','fedoramaelle','hallojessa'].includes(h))await shot('portrait-'+h);await p.locator('.brand-logo-close').click()}
 for(const [id,icon]of [['b_pollyann','polly-ann-v86'],['b_omerarielyai','this-aint-canon-v86']]){await open(id);check(id+' requested original artwork attached',brandById(id).logo.imageUrl==='/icons/'+icon+'.webp')}
 await open('b_foodieseekeasyeats');check('Andrew current name and canonical profile displayed',await p.locator('h1').innerText()==='Andrew Greenstein'&&await p.locator('a[href="https://www.instagram.com/whofedandrew/"]').count()>0)
 for(const f of m.source_links){
   if(f.brand){await open(f.brand);const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click();check(f.code+' held copy keeps original credited link',await row.locator('a[href="https://www.instagram.com/reel/'+f.code+'/"]').count()>0&&await row.locator('video').count()===0)}
   else {await open(pageOfFoodie(f.by));const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:f.place})});await row.locator('.foodie-review-head').click();check(f.code+' Foodie-only source link seated',await row.locator('a[href="https://www.instagram.com/reel/'+f.code+'/"]').count()>0)}
 }
 await open('b_holyshredpaloalto');await p.locator('.brand-clip-drop > .menu-picks-bar').click();check('Palo Alto shares own HolyShred film and advances',await film(p.locator('.brand-clip-drop video[src="/clips/holyshred.mp4"]')))
 check('HolyShred uses separate branch menus and ordering URLs',brandById('b_holyshredsf').orderUrl.includes('doordash')&&brandById('b_holyshredpaloalto').orderUrl.includes('/50216')&&brandById('b_holyshredsf').menu.reduce((n,s)=>n+s.items.length,0)===6&&brandById('b_holyshredpaloalto').menu.reduce((n,s)=>n+s.items.length,0)===39)
 check('Monster is Oakland and distinct Ginzas stay separate',brandById('b_monsterpho').address.includes('Oakland')&&brandById('b_ginzasushisf').address.includes('1793 Haight')&&brandById('b_ginzasushi').address.includes('San Jose'))
 const {BEASTY_CATEGORIES}=await tsImport('../src/data/categories.ts',import.meta.url),{CATEGORY_GLYPHS,PAGES_TILES}=await tsImport('../src/data/categoryGlyphs.ts',import.meta.url)
 check('original home category order stays',JSON.stringify(PAGES_TILES)===JSON.stringify(['eats','sweets','ayce','coffee','bakery','foodtrucks','boutiques','services','online','individuals','tattoo','barbershops','salons','gyms','automotive','whips','realtors','photographers','djs','artists','cooks','foodies','ai','athletes']))
 for(const c of m.categories){
  const def=BEASTY_CATEGORIES.find(x=>x.kind===c.kind);check(c.heading+' heading and own glyph',def?.heading===c.heading&&!!CATEGORY_GLYPHS[c.kind])
  for(const suffix of ['','-thumb'])check(c.heading+' wallpaper'+suffix+' serves',(await fetch(base+'/wallpapers/cat-'+c.kind+suffix+'.webp')).ok)
  await open(c.primary);await p.locator('.nav-back').click();await p.waitForTimeout(650);await p.getByRole('button',{name:'Search',exact:true}).click();await p.getByPlaceholder('Dishes, businesses, categories, cities').fill(c.heading)
  const row=p.locator('.search-brand.is-cat',{hasText:'BEASTY • '+c.heading});check(c.heading+' is searchable',await row.count()===1);await row.click();await p.waitForFunction(heading=>document.querySelector('.page-dots [aria-current="page"]')?.getAttribute('aria-label')?.endsWith('BEASTY, '+heading),c.heading)
  const expect=Object.entries(ALL_PLACEMENTS).filter(([s])=>s.startsWith('beasty-'+c.kind+'-')).map(([,id])=>brandById(id).name);const labels=await p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));check(c.heading+' displays its real category seats',expect.every(n=>labels.some(l=>l.startsWith(n+',')||l===n)))
  await p.getByPlaceholder('Dishes, businesses, categories, cities').waitFor({state:'detached'});await p.waitForFunction(kind=>document.querySelector('.home-wallpaper-layer')?.style.backgroundImage.includes('cat-'+kind+'.webp'),c.kind);await p.waitForTimeout(700);await shot(c.kind)
  await p.setViewportSize({width:320,height:568});check(c.heading+' fits smallest phone',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await p.setViewportSize({width:393,height:852})
  await p.getByRole('button',{name:'BEASTY • Pages',exact:true}).click();await p.waitForTimeout(500);const dots=await p.locator('.page-dots .dot').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));let found=false;
  for(let i=0;i<dots.length;i++){if(!dots[i]?.endsWith('BEASTY, More pages'))continue;await p.locator('.page-dots .dot').nth(i).click();await p.waitForTimeout(350);const tile=p.locator('.home-page:not([inert]) button[aria-label="BEASTY • '+c.heading+'"]');if(await tile.count()){found=true;await tile.click();break}}
  check(c.heading+' reachable from More pages',found);await p.waitForTimeout(500);await p.locator('.home-page:not([inert])').getByRole('button',{name:new RegExp('^'+brandById(c.primary).name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:,|$)')}).click();await p.locator('.brand-body').waitFor();check(c.heading+' tile opens correct page',await p.locator('h1').innerText()===brandById(c.primary).name)
 }
 await open('b_monsterpho');await p.locator('.nav-back').click();await p.waitForTimeout(700);await p.getByRole('button',{name:'Watch',exact:true}).click();await p.locator('.reels').waitFor();await p.waitForTimeout(800)
 check('Watch mounts at most four players',await p.locator('.reels video').count()<=4)
 const ad=p.locator('.reel').nth(8);await ad.scrollIntoViewIfNeeded();await ad.locator('.reel-promo').waitFor();await p.waitForTimeout(400);check('promotion pauses mounted players',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.every(v=>v.paused)))
 const next=p.locator('.reel').nth(9);await next.scrollIntoViewIfNeeded();await next.locator('video').waitFor();await p.waitForTimeout(700);check('next Watch film resumes within decoder budget',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.filter(v=>!v.paused).length===1))
 check('no JavaScript error or browser crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 86 checks: 10 pages, 34 advancing films, full published menus, 1573 unchanged seats, portraits and bounded phone playback.')
