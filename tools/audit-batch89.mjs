/* Batch 89: production mode is read-only. Local server uses a disposable DB. */
import { chromium, webkit, devices } from 'playwright'
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'
import { readFileSync, openSync, mkdirSync } from 'node:fs'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const {BRANDS,brandById}=await tsImport('../src/data/brands.ts',import.meta.url)
const {REELS}=await tsImport('../src/data/clips.ts',import.meta.url)
const {MORE_FOODIE_PAGES,OTHER_REVIEWS}=await tsImport('../src/data/foodies.ts',import.meta.url)
const {pageOfFoodie,reviewsBy}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
const m=JSON.parse(readFileSync('research/roster/batch89.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch89')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch89-server.log','w'),openSync('.verify/batch89-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch89-browser-fixture',name:'Batch 89 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});const fig=v.locator('xpath=ancestor::figure');if(await fig.count())await fig.getByRole('button',{name:'Turn the sound on',exact:true}).click();else if(iphone)await v.click();else await v.press('Space');await p.waitForFunction(v=>v.readyState>=2&&v.currentTime>.05&&!v.paused,await v.elementHandle(),{timeout:30000});const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));if(d.w!==540||d.h!==960)console.log('film dimensions',d);return d.w===540&&d.h===960&&d.d>0}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1665 earlier seats unchanged',Object.keys(m.baseline.seats).length===1665&&Object.entries(m.baseline.seats).every(([k,v])=>ALL_PLACEMENTS[k]===v))
 for(const [s,id]of Object.entries(m.new_seats))check(s+' reaches '+id,ALL_PLACEMENTS[s]===id)
 check('all 177 previous overflow Foodies retain order',m.baseline.more.every((h,i)=>MORE_FOODIE_PAGES[i].handle===h)&&MORE_FOODIE_PAGES.length===184)
 const coverage=JSON.parse(readFileSync('research/roster/b86-b89-coverage.json'))
 const refs=[...BRANDS.flatMap(b=>[b.clip,...(b.clips??[])].filter(Boolean).map(c=>({url:c.href,src:c.src}))),...OTHER_REVIEWS.map(r=>({url:r.reel,src:r.clip?'/clips/review-'+/\/reel\/([^/]+)\//.exec(r.reel)?.[1]+'.mp4':undefined}))]
 check('all 64 unique sent posts reconciled with no missing IDs',coverage.post_count===64&&coverage.local_count===52&&coverage.source_only_count===12&&coverage.missing.length===0)
 for(const x of coverage.posts){const matches=refs.filter(r=>r.url&&new RegExp('/(?:reel|p)/'+x.code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:/|$)').test(r.url));check(x.code+' original referenced',matches.length>0);if(x.slug)check(x.code+' local film remains once in Watch',matches.some(r=>r.src==='/clips/'+x.slug+'.mp4')&&REELS.filter(r=>r.src==='/clips/'+x.slug+'.mp4').length===1)}
 for(const x of m.businesses){const id='b_'+x.slug.replace(/-/g,''),brand=brandById(id);await open(id);check(x.name+' heading and 393px layout',await p.locator('h1').innerText()===x.name&&await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));check(x.name+' published menu model',brand.menu.length===x.menu_sections&&brand.menu.reduce((n,s)=>n+s.items.length,0)===x.menu_rows);check(x.name+' verified call and address',await p.locator('a[href="tel:'+x.phone.replace(/\D/g,'')+'"]').count()===1&&(await p.locator('.brand-body').innerText()).includes(x.address));await p.locator('.brand-menu-drop > .menu-picks-bar').click();check(x.name+' entire menu visible',await p.locator('.brand-menu-body .menu-row').count()===x.menu_rows);await p.locator('.brand-menu-drop > .menu-picks-bar').click();for(const panel of x.panels){await p.getByRole('button',{name:panel.head,exact:true}).click();const text=await p.locator('.brand-body').innerText();check(x.name+' '+panel.head+' opens',panel.body.every(l=>text.includes(l)));await p.getByRole('button',{name:panel.head,exact:true}).click()};await p.locator('.brand-logo-zoom-trigger').click();check(x.name+' original logo decodes',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512&&e.naturalHeight===512}));await p.locator('.brand-logo-close').click();await shot(x.slug);await p.setViewportSize({width:320,height:568});await p.locator('.brand-menu-drop > .menu-picks-bar').click();check(x.name+' complete menu fits 320px',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await p.setViewportSize({width:393,height:852})}
 const naya=brandById('b_nayadessertcafe');check('NaYa separates both 83-row SF menus and correct primary email',naya.menu.filter(s=>s.name.startsWith('Octavia')).reduce((n,s)=>n+s.items.length,0)===83&&naya.menu.filter(s=>s.name.startsWith('Geary')).reduce((n,s)=>n+s.items.length,0)===83&&naya.email==='nayacafeoctavia@gmail.com'&&naya.orderUrl==='https://order.nayadessertcafe-octavia.com/')
 check('NaYa fills the previously open Shaved ice spot',ALL_PLACEMENTS['beasty-sweets-5']===naya.id)
 check('Matzip keeps weekday break and full 55-row own menu',brandById('b_matzipunioncity').hours.includes('2:30pm, 5')&&brandById('b_matzipunioncity').menu.reduce((n,s)=>n+s.items.length,0)===55)
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){await open(f.brand??pageOfFoodie(f.by));let row;if(f.role==='main'){row=p.locator('.brand-clip-drop');await row.locator('.menu-picks-bar').click()}else{row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:f.brand?'@'+f.by:f.place})});await row.locator('.foodie-review-head').click()};check(f.code+' requested film advances',await film(row.locator('video')));check(f.code+' full attribution visible',(await row.innerText()).includes(f.credit));const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,sample_aspect_ratio','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']));check(f.code+' original audio, square pixels and bounded excerpt',probe.streams.some(s=>s.codec_type==='audio')&&probe.streams.some(s=>s.codec_type==='video'&&s.sample_aspect_ratio==='1:1')&&Math.abs(+probe.format.duration-(f.end-f.start))<.2);check(f.code+' source and date credited',credits.includes(f.source)&&credits.includes(f.posted_pacific));if(f.role==='review'&&f.brand){await open(pageOfFoodie(f.by));const r=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:f.place})});await r.locator('.foodie-review-head').click();check(f.by+' own page correct review target',await r.locator('video[src="/clips/'+f.slug+'.mp4"]').count()===1)}}
 for(const f of m.source_links){await open(f.brand);const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click();check(f.by+' held copy keeps original and credit',await row.locator('a[href="'+f.source+'"]').count()===1&&await row.locator('video').count()===0&&(await row.innerText()).includes(f.credit));await open(pageOfFoodie(f.by));const r=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'Bibim Grill'})});await r.locator('.foodie-review-head').click();check(f.by+' creator original retained',await r.locator('a[href="'+f.source+'"]').count()===1)}
 const {reviewsOf}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
 check('Bibim has four local films and four original links',reviewsOf('b_bibimgrill').filter(r=>r.src).length===4&&reviewsOf('b_bibimgrill').length===8)
 check('Slice House Castro Valley is not attached to Brentwood',REELS.find(r=>r.src==='/clips/review-DfQBdF-BDY5.mp4')?.brandId===pageOfFoodie('mukbangyourmama')&&!reviewsOf('b_slicehousebrentwood').some(r=>r.href.includes('DfQBdF-BDY5')))
 check('Binge retains both Berkeley locations',brandById('b_bingecoffeehouse').panels.some(x=>x.body.some(l=>l.includes('2528A Durant'))))
 check('cancelled unnamed portrait creates no person page',m.research.cancelled_attachments[0].file==='IMG_8927.png'&&!m.icons.some(a=>String(a.source).includes('IMG_8927')))
 check('all 483 Watch sources unique and all 475 prior films retained',REELS.length===483&&new Set(REELS.map(r=>r.src)).size===483&&m.baseline.watch.every(s=>REELS.some(r=>r.src===s)))
 for(const handle of m.portraits){await open(pageOfFoodie(handle));await p.locator('.brand-logo-zoom-trigger').click();check(handle+' original requested artwork decodes',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512&&e.getAttribute('src').includes('-v89.webp')}));await p.locator('.brand-logo-close').click();await shot('portrait-'+handle)}
 const{BEASTY_CATEGORIES}=await tsImport('../src/data/categories.ts',import.meta.url),{CATEGORY_GLYPHS,PAGES_TILES}=await tsImport('../src/data/categoryGlyphs.ts',import.meta.url)
 check('original 24 home category tiles retain order',JSON.stringify(PAGES_TILES)===JSON.stringify(['eats','sweets','ayce','coffee','bakery','foodtrucks','boutiques','services','online','individuals','tattoo','barbershops','salons','gyms','automotive','whips','realtors','photographers','djs','artists','cooks','foodies','ai','athletes']))
 check('Korean has own definition/glyph and 18 real seats',BEASTY_CATEGORIES.find(c=>c.kind==='korean')?.heading==='Korean'&&!!CATEGORY_GLYPHS.korean&&Object.keys(ALL_PLACEMENTS).filter(k=>k.startsWith('beasty-korean-')).length===18)
 for(const suffix of ['','-thumb'])check('Korean wallpaper'+suffix+' serves',(await fetch(base+'/wallpapers/cat-korean'+suffix+'.webp')).ok)
 await open('b_matzipunioncity');await p.locator('.nav-back').click();await p.waitForTimeout(650);await p.getByRole('button',{name:'Search',exact:true}).click();await p.getByPlaceholder('Dishes, businesses, categories, cities').fill('Korean');await p.locator('.search-brand.is-cat',{hasText:'BEASTY • Korean'}).click();await p.waitForTimeout(650);const names=Object.entries(ALL_PLACEMENTS).filter(([k])=>k.startsWith('beasty-korean-')).map(([,id])=>brandById(id).name);const labels=await p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));check('Korean search opens every real category seat',names.every(n=>labels.some(l=>l===n||l.startsWith(n+','))));await shot('korean');await p.setViewportSize({width:320,height:568});check('Korean fits 320px phone',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await p.setViewportSize({width:393,height:852})
 await p.getByRole('button',{name:'BEASTY • Pages',exact:true}).click();await p.waitForTimeout(500);const dots=await p.locator('.page-dots .dot').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));let found=false
 for(let i=0;i<dots.length;i++){if(!dots[i]?.endsWith('BEASTY, More pages'))continue;await p.locator('.page-dots .dot').nth(i).click();await p.waitForTimeout(350);const tile=p.locator('.home-page:not([inert]) button[aria-label="BEASTY • Korean"]');if(await tile.count()){found=true;await tile.click();break}}
 check('Korean reachable from More pages',found);await p.waitForTimeout(500);await p.locator('.home-page:not([inert]) button[aria-label^="Matzip — Union City"]').click();await p.locator('.brand-body').waitFor();check('Korean tile opens Matzip',await p.locator('h1').innerText()==='Matzip — Union City')
 check('no JavaScript error or process crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 89 checks: 64-post coverage, complete Matzip and separate NaYa menus, eight films, held sources, Korean and unchanged seats.')
