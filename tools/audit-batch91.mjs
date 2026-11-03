/* Batch 91: production mode is read-only. Local server uses a disposable DB. */
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
const m=JSON.parse(readFileSync('research/roster/batch91.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch91')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch91-server.log','w'),openSync('.verify/batch91-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch91-browser-fixture',name:'Batch 91 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{
 await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});const handle=await v.elementHandle()
 try{
  await p.waitForFunction(v=>v.readyState>=1,handle,{timeout:30000,polling:100})
  const fig=v.locator('xpath=ancestor::figure')
  if(await fig.count())await fig.getByRole('button',{name:'Turn the sound on',exact:true}).click()
  else if(await v.evaluate(v=>v.paused)){if(iphone)await v.click();else await v.press('Space')}
  await p.waitForFunction(v=>v.readyState>=2&&v.currentTime>.05&&!v.paused,handle,{timeout:30000,polling:100})
 }catch(e){console.log('media diagnostic',await v.evaluate(v=>({src:v.currentSrc,ready:v.readyState,network:v.networkState,paused:v.paused,time:v.currentTime,error:v.error?.message,rect:{y:v.getBoundingClientRect().y,h:v.getBoundingClientRect().height}})));await shot('media-failure');throw e}
 const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));return d.w===540&&d.h===960&&d.d>0
}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1699 previous seats unchanged',Object.keys(m.baseline.seats).length===1699&&Object.entries(m.baseline.seats).every(([s,id])=>ALL_PLACEMENTS[s]===id))
 check('six appended seats bring total to 1705',Object.keys(ALL_PLACEMENTS).length===1705&&Object.keys(m.new_seats).length===6)
 for(const [s,id]of Object.entries(m.new_seats))check(s+' opens El Chacho',ALL_PLACEMENTS[s]===id)
 check('all 187 previous overflow Foodie positions unchanged',MORE_FOODIE_PAGES.length===187&&m.baseline.more.every((h,i)=>MORE_FOODIE_PAGES[i].handle===h))
 for(const old of m.baseline.brands)check(old.name+' full business model unchanged',JSON.stringify(brandById(old.id))===JSON.stringify(old))
 const coverage=JSON.parse(readFileSync('research/roster/b86-b91-coverage.json'))
 const refs=[...BRANDS.flatMap(b=>[b.clip,...(b.clips??[])].filter(Boolean).map(c=>({url:c.href,src:c.src}))),...OTHER_REVIEWS.map(r=>({url:r.reel,src:r.clip?'/clips/review-'+/\/reel\/([^/]+)\//.exec(r.reel)?.[1]+'.mp4':undefined}))]
 check('all 71 supplied posts reconciled: 58 local and 13 original',coverage.post_count===71&&coverage.local_count===58&&coverage.source_only_count===13&&coverage.missing.length===0)
 for(const x of coverage.posts){const matches=refs.filter(r=>r.url&&new RegExp('/(?:reel|p)/'+x.code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:/|$)').test(r.url));check(x.code+' original retained',matches.length>0);if(x.slug)check(x.code+' local film once in Watch',matches.some(r=>r.src==='/clips/'+x.slug+'.mp4')&&REELS.filter(r=>r.src==='/clips/'+x.slug+'.mp4').length===1)}
 const x=m.businesses[0],s=x.seed,id='b_taqueriaelchacho',brand=brandById(id)
 await open(id);check('El Chacho heading and 393px layout',await p.locator('h1').innerText()===s.name&&await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 check('verified truck phone, Oakland address and daily hours',await p.locator('a[href="tel:3239755948"]').count()===1&&(await p.locator('.brand-body').innerText()).includes(s.address)&&brand.hours===s.hours)
 check('all three own sections and 11 rows modeled',brand.menu.length===3&&brand.menu.reduce((n,c)=>n+c.items.length,0)===11)
 check('catering package totals and guest counts exact',JSON.stringify(brand.menu[1].items.map(i=>[i.name,i.price]))===JSON.stringify(s.sections[1].items.map(i=>[i[0],i[2]])))
 check('all three optional 5-gallon drinks retain $100 price',brand.menu[2].items.length===3&&brand.menu[2].items.every(i=>i.price===10000&&i.name.includes('5-gallon')))
 check('street-food prices held without fake $2 regular price',brand.menu[0].items.length===5&&brand.menu[0].items.every(i=>i.price===0&&i.priceLabel==='Ask'))
 check('catering form is direct inquiry link, no individual ordering URL',brand.site===s.site&&!brand.orderUrl&&brand.quoteOnly&&s.needsSite===true)
 await p.locator('.brand-menu-drop > .menu-picks-bar').click();check('all 11 menu and package rows visible',await p.locator('.brand-menu-body .menu-row').count()===11)
 const prices=await p.locator('.brand-menu-body .menu-row-price').allTextContents();check('UI shows five Ask rows and whole-event prices',prices.slice(0,5).every(x=>x==='Ask')&&prices[5].includes('1,500')&&prices[6].includes('2,000')&&prices[7].includes('3,000'))
 check('quoted event catalogue never offers cart buttons',await p.locator('.brand-menu-body .menu-row-add').count()===0&&await p.locator('.brand-menu-body button.menu-row').count()===0)
 await p.setViewportSize({width:320,height:568});check('complete menu fits smallest 320px phone',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await p.setViewportSize({width:393,height:852});await p.locator('.brand-menu-drop > .menu-picks-bar').click()
 for(const panel of s.panels){await p.getByRole('button',{name:panel.head,exact:true}).click();const text=await p.locator('.brand-body').innerText();check(panel.head+' full published details visible',panel.body.every(l=>text.includes(l)));await p.getByRole('button',{name:panel.head,exact:true}).click()}
 check('direct catering inquiry button visible',await p.getByRole('link',{name:'Catering request form',exact:true}).count()===1);await shot('el-chacho')
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){await open(f.brand);let row;if(f.role==='main'){row=p.locator('.brand-clip-drop');await row.locator('.menu-picks-bar').click()}else{row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click()}
 check(f.code+' film advances with correct target',await film(row.locator('video')));check(f.code+' exact branch and source credit visible',(await row.innerText()).includes(f.credit));const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,sample_aspect_ratio','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']));check(f.code+' audio, square pixels and exact excerpt',probe.streams.some(s=>s.codec_type==='audio')&&probe.streams.some(s=>s.codec_type==='video'&&s.sample_aspect_ratio==='1:1')&&Math.abs(+probe.format.duration-(f.end-f.start))<.2);check(f.code+' source and date credited',credits.includes(f.source)&&credits.includes(f.posted_pacific));if(f.role==='review'){await open(pageOfFoodie(f.by));const r=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:f.place})});await r.locator('.foodie-review-head').click();check(f.by+' own page links exact business review',await r.locator('video[src="/clips/'+f.slug+'.mp4"]').count()===1&&(await r.innerText()).includes(f.city))}}
 for(const a of m.icons){await open(a.handle==='taqueriaelchacho'?id:pageOfFoodie(a.handle));await p.locator('.brand-logo-zoom-trigger').click();check(a.handle+' original artwork decodes at 512px',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512&&e.naturalHeight===512}));await p.locator('.brand-logo-close').click();await shot('art-'+a.handle)}
 check('all 489 Watch films unique and earlier 485 retained',REELS.length===489&&new Set(REELS.map(r=>r.src)).size===489&&m.baseline.watch.every(src=>REELS.some(r=>r.src===src)))
 check('earlier Aztec Ed review still retained',OTHER_REVIEWS.some(r=>r.by==='aztec.ed'&&r.reel.includes('DXDFiGkAbCn')))
 for(const heading of ['Food Trucks','Catering','Chefs']){await open(id);await p.locator('.nav-back').click();await p.waitForTimeout(600);await p.getByRole('button',{name:'Search',exact:true}).click();await p.getByPlaceholder('Dishes, businesses, categories, cities').fill(heading);await p.locator('.search-brand.is-cat',{hasText:'BEASTY • '+heading}).click();await p.waitForTimeout(600);const tile=p.locator('.home-page:not([inert]) button[aria-label^="Taqueria El Chacho"]');await tile.waitFor({state:'visible',timeout:15000}).catch(async e=>{console.log('category diagnostic',heading,await p.locator('.home-page:not([inert])').innerText().catch(()=>''));await shot('category-failure-'+heading);throw e});check(heading+' reaches El Chacho tile',await tile.count()===1);await tile.click();await p.locator('.brand-body').waitFor();check(heading+' tile opens correct page',await p.locator('h1').innerText()==='Taqueria El Chacho')}
 check('no JavaScript error or browser crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 91 checks: 71-post coverage, complete El Chacho catalogue, four films, original artwork and unchanged earlier content.')
