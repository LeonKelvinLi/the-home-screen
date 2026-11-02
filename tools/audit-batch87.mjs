/* Batch 87: production mode is read-only. Local server uses a disposable DB. */
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
const m=JSON.parse(readFileSync('research/roster/batch87.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch87')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch87-server.log','w'),openSync('.verify/batch87-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch87-browser-fixture',name:'Batch 87 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});const fig=v.locator('xpath=ancestor::figure');if(await fig.count())await fig.getByRole('button',{name:'Turn the sound on',exact:true}).click();else if(iphone)await v.click();else await v.press('Space');await p.waitForFunction(v=>v.readyState>=2&&v.currentTime>.05&&!v.paused,await v.elementHandle(),{timeout:30000});const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));if(d.w!==540||d.h!==960)console.log('film dimensions',d);return d.w===540&&d.h===960&&d.d>0}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1647 earlier seats stay',Object.keys(m.baseline.seats).length===1647&&Object.entries(m.baseline.seats).every(([k,v])=>ALL_PLACEMENTS[k]===v))
 for(const [seat,id]of Object.entries(m.new_seats))check(seat+' reaches '+id,ALL_PLACEMENTS[seat]===id)
 check('all 172 prior overflow Foodies stay in order',m.baseline.more_foodie_handles.every((h,i)=>MORE_FOODIE_PAGES[i].handle===h)&&MORE_FOODIE_PAGES.length===173)
 check('new Maya is distinct from Maya Kay',pageOfFoodie('maya_munches')==='b_foodiemayamunches'&&pageOfFoodie('mayakay.official')!=='b_foodiemayamunches')
 check('Dan keeps his earlier Hotpot Bay review',reviewsBy('dchangshangry').some(r=>r.brand?.id==='b_hotpotbay')&&reviewsBy('dchangshangry').some(r=>r.brand?.id==='b_easybreezy'))
 const norm=s=>s.replace(/\s+/g,' ').trim()
 for(const x of m.businesses){
  const id='b_'+x.slug.replace(/-/g,''),brand=brandById(id)
  await open(id)
  check(x.name+' heading and phone width',await p.locator('h1').innerText()===x.name&&await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
  check(x.name+' complete menu model',brand.menu.length===x.menu_sections&&brand.menu.reduce((n,s)=>n+s.items.length,0)===x.menu_rows)
  if(x.phone)check(x.name+' correct call target',await p.locator('a[href="tel:'+x.phone.replace(/\D/g,'')+'"]').count()===1)
  if(x.menu_rows){await p.locator('.brand-menu-drop > .menu-picks-bar').click();check('all six shop products visible',await p.locator('.brand-menu-body .menu-row').count()===6);check('gift card is a published starting price',(await p.locator('.brand-menu-body').innerText()).includes('from $25'));await p.locator('.brand-menu-drop > .menu-picks-bar').click()}
  for(const panel of x.panels??[]){await p.getByRole('button',{name:panel.head,exact:true}).click();const text=norm(await p.locator('.brand-body').innerText());check(x.name+' '+panel.head+' opens',panel.body.every(l=>text.includes(norm(l))));await p.getByRole('button',{name:panel.head,exact:true}).click()}
  await p.locator('.brand-logo-zoom-trigger').click();check(x.name+' original icon decodes',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512&&e.naturalHeight===512}));await p.locator('.brand-logo-close').click();check(x.name+' logo restores without navigation',await p.locator('dialog').count()===0&&await p.locator('h1').innerText()===x.name);await shot(x.slug)
 }
 const kennel=brandById('b_grandekennels'),easy=brandById('b_easybreezy')
 check('kennel keeps unknown address and phone empty',!kennel.address&&!kennel.phone&&!kennel.menu.some(s=>s.items.length))
 check('kennel makes no invented credential claims',!/certified|AKC|ICCF|OFA|Vet Med/i.test(kennel.tagline+' '+kennel.contactOnly))
 check('all six exact locations and eight rotating flavor cards researched',m.research.menu.locations.length===6&&m.research.menu.flavors.length===8)
 check('no yogurt prices or unverified order URL invented',easy.menu.every(s=>s.name==='Online shop — gift cards & merchandise')&&!easy.orderUrl)
 await open('b_grandekennels');await p.getByRole('button',{name:'About Grande Kennels',exact:true}).click();check('Cynthia crosslink points to her existing page',await p.locator('a[href="/?b=b_foodielagrandedelabanda"]').count()===1)
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){
  await open('b_easybreezy');const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click();check(f.code+' attributed review advances',await film(row.locator('video')));check(f.code+' correct branch visible',(await row.innerText()).includes(f.credit));await row.locator('.foodie-review-head').click()
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height,sample_aspect_ratio','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']))
  check(f.code+' bounded audio and square pixels',probe.streams.some(s=>s.codec_type==='audio')&&probe.streams.some(s=>s.codec_type==='video'&&s.sample_aspect_ratio==='1:1')&&Math.abs(+probe.format.duration-15)<.2)
  check(f.code+' original source and date credited',credits.includes(f.source)&&credits.includes(f.posted_pacific)&&credits.includes(f.slug+'.mp4'))
  check(f.code+' appears once in Watch',REELS.filter(r=>r.src==='/clips/'+f.slug+'.mp4').length===1)
  await open(pageOfFoodie(f.by));const review=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'Easy Breezy'})});await review.locator('.foodie-review-head').click();check(f.by+' own page has correct review and city',(await review.innerText()).includes(f.city)&&await review.locator('video[src="/clips/'+f.slug+'.mp4"]').count()===1)
 }
 check('all 467 Watch films unique',REELS.length===467&&new Set(REELS.map(r=>r.src)).size===467)
 for(const handle of m.portraits){await open(pageOfFoodie(handle));await p.locator('.brand-logo-zoom-trigger').click();check(handle+' requested portrait decodes',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512&&e.getAttribute('src').includes('-v87.webp')}));await p.locator('.brand-logo-close').click();await shot('portrait-'+handle)}
 const {BEASTY_CATEGORIES}=await tsImport('../src/data/categories.ts',import.meta.url),{CATEGORY_GLYPHS,PAGES_TILES}=await tsImport('../src/data/categoryGlyphs.ts',import.meta.url)
 check('original 24 home categories stay in order',JSON.stringify(PAGES_TILES)===JSON.stringify(['eats','sweets','ayce','coffee','bakery','foodtrucks','boutiques','services','online','individuals','tattoo','barbershops','salons','gyms','automotive','whips','realtors','photographers','djs','artists','cooks','foodies','ai','athletes']))
 check('Kennels has its own glyph and all-breed definition',BEASTY_CATEGORIES.find(c=>c.kind==='kennels')?.about==='Dog kennels and breeders of every breed'&&!!CATEGORY_GLYPHS.kennels)
 for(const suffix of ['','-thumb'])check('Kennels wallpaper'+suffix+' serves',(await fetch(base+'/wallpapers/cat-kennels'+suffix+'.webp')).ok)
 const category=async name=>{await open('b_easybreezy');await p.locator('.nav-back').click();await p.waitForTimeout(650);await p.getByRole('button',{name:'Search',exact:true}).click();await p.getByPlaceholder('Dishes, businesses, categories, cities').fill(name);await p.locator('.search-brand.is-cat',{hasText:'BEASTY • '+name}).click();await p.waitForTimeout(650)}
 await category('Kennels');check('Kennels searchable and shows all four real kennels',await p.locator('.home-page:not([inert]) .home-grid button').filter({hasText:'Grande Kennels'}).count()===1&&Object.keys(ALL_PLACEMENTS).filter(k=>k.startsWith('beasty-kennels-')).length===4);await shot('kennels')
 await p.setViewportSize({width:320,height:568});check('Kennels fits smallest phone',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await p.setViewportSize({width:393,height:852})
 await p.getByRole('button',{name:'BEASTY • Pages',exact:true}).click();await p.waitForTimeout(500);const dots=await p.locator('.page-dots .dot').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));let found=false
 for(let i=0;i<dots.length;i++){if(!dots[i]?.endsWith('BEASTY, More pages'))continue;await p.locator('.page-dots .dot').nth(i).click();await p.waitForTimeout(350);const tile=p.locator('.home-page:not([inert]) button[aria-label="BEASTY • Kennels"]');if(await tile.count()){found=true;await tile.click();break}}
 check('Kennels reachable from More pages',found);await p.waitForTimeout(500);await p.locator('.home-page:not([inert]) button[aria-label^="Grande Kennels"]').click();await p.locator('.brand-body').waitFor();check('Kennels tile opens Grande page',await p.locator('h1').innerText()==='Grande Kennels')
 await category('Pets');await p.locator('.page-dots .dot[aria-label$="BEASTY, More pets"]').click();await p.waitForTimeout(500);check('Pets continuation retains requested Grande tile',await p.locator('.home-page:not([inert]) button[aria-label^="Grande Kennels"]').count()===1);await shot('more-pets');await p.locator('.home-page:not([inert]) button[aria-label^="Grande Kennels"]').click();await p.locator('.brand-body').waitFor();check('More pets opens correct page',await p.locator('h1').innerText()==='Grande Kennels')
 check('no JavaScript error or browser crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 87 checks: new pages, two advancing films, menus, artwork, Kennels/Pets and all 1647 earlier seats.')
