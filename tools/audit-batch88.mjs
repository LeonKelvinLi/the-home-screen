/* Batch 88: production mode is read-only. Local server uses a disposable DB. */
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
const m=JSON.parse(readFileSync('research/roster/batch88.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch88')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch88-server.log','w'),openSync('.verify/batch88-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch88-browser-fixture',name:'Batch 88 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});const fig=v.locator('xpath=ancestor::figure');if(await fig.count())await fig.getByRole('button',{name:'Turn the sound on',exact:true}).click();else if(iphone)await v.click();else await v.press('Space');await p.waitForFunction(v=>v.readyState>=2&&v.currentTime>.05&&!v.paused,await v.elementHandle(),{timeout:30000});const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));if(d.w!==540||d.h!==960)console.log('film dimensions',d);return d.w===540&&d.h===960&&d.d>0}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1659 earlier seats unchanged',Object.keys(m.baseline.seats).length===1659&&Object.entries(m.baseline.seats).every(([k,v])=>ALL_PLACEMENTS[k]===v))
 for(const [s,id]of Object.entries(m.new_seats))check(s+' reaches '+id,ALL_PLACEMENTS[s]===id)
 check('all 173 previous overflow Foodies retain order',m.baseline.more.every((h,i)=>MORE_FOODIE_PAGES[i].handle===h)&&MORE_FOODIE_PAGES.length===177)
 for(const [id,old]of Object.entries(m.baseline.businesses)){const now=brandById(id);check(id+' previous address/menu/films unchanged',JSON.stringify({name:now.name,address:now.address,menu:now.menu,clip:now.clip,clips:now.clips})===JSON.stringify(old))}
 const coverage=JSON.parse(readFileSync('research/roster/b86-b88-coverage.json'))
 const refs=[...BRANDS.flatMap(b=>[b.clip,...(b.clips??[])].filter(Boolean).map(c=>({url:c.href,src:c.src}))),...OTHER_REVIEWS.map(r=>({url:r.reel,src:r.clip?'/clips/review-'+/\/reel\/([^/]+)\//.exec(r.reel)?.[1]+'.mp4':undefined}))]
 check('all 52 sent posts reconciled with no missing IDs',coverage.post_count===52&&coverage.local_count===44&&coverage.source_only_count===8&&coverage.missing.length===0)
 for(const x of coverage.posts){const matches=refs.filter(r=>r.url&&new RegExp('/(?:reel|p)/'+x.code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:/|$)').test(r.url));check(x.code+' original referenced',matches.length>0);if(x.slug)check(x.code+' requested local film remains once in Watch',matches.some(r=>r.src==='/clips/'+x.slug+'.mp4')&&REELS.filter(r=>r.src==='/clips/'+x.slug+'.mp4').length===1)}
 const bibim=brandById('b_bibimgrill');await open(bibim.id)
 check('Bibim heading and 393px layout',await p.locator('h1').innerText()==='Bibim Grill'&&await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 check('Bibim verified address, hours and phone',await p.locator('a[href="tel:9252482281"]').count()===1&&(await p.locator('.brand-body').innerText()).includes('Daily 11am–9pm')&&bibim.address==='3742 Fallon Rd, Dublin, CA 94568')
 check('all 12 published menu rows and 3 sections',bibim.menu.length===3&&bibim.menu.reduce((n,s)=>n+s.items.length,0)===12)
 await p.locator('.brand-menu-drop > .menu-picks-bar').click();check('all 12 menu rows visible',await p.locator('.brand-menu-body .menu-row').count()===12);check('BYO base clearly labeled',(await p.locator('.brand-menu-body').innerText()).includes('$11.50 base'));await p.locator('.brand-menu-drop > .menu-picks-bar').click()
 for(const panel of m.businesses[0].panels){await p.getByRole('button',{name:panel.head,exact:true}).click();const text=await p.locator('.brand-body').innerText();check('Bibim '+panel.head+' opens',panel.body.every(x=>text.includes(x)));await p.getByRole('button',{name:panel.head,exact:true}).click()}
 check('no guessed email or global halal claim',!bibim.email&&!/halal/i.test(bibim.cuisine))
 await p.locator('.brand-logo-zoom-trigger').click();check('Bibim original logo decodes',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512}));await p.locator('.brand-logo-close').click();await shot('bibim-grill')
 await p.setViewportSize({width:320,height:568});await p.locator('.brand-menu-drop > .menu-picks-bar').click();check('Bibim complete menu fits 320px',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await p.setViewportSize({width:393,height:852})
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){await open(f.brand);const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click();check(f.code+' business review advances',await film(row.locator('video')));check(f.code+' source and full credit visible',(await row.innerText()).includes(f.credit)&&await row.locator('a[href="'+f.source+'"]').count()===1);await row.locator('.foodie-review-head').click();const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,sample_aspect_ratio','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']));check(f.code+' audio, square pixels and bounded excerpt',probe.streams.some(s=>s.codec_type==='audio')&&probe.streams.some(s=>s.codec_type==='video'&&s.sample_aspect_ratio==='1:1')&&Math.abs(+probe.format.duration-(f.end-f.start))<.2);check(f.code+' source/date/excerpt credited',credits.includes(f.source)&&credits.includes(f.posted_pacific)&&credits.includes(f.slug+'.mp4'));await open(pageOfFoodie(f.by));const r=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:f.place})});await r.locator('.foodie-review-head').click();check(f.by+' creator page retains review target',await r.locator('video[src="/clips/'+f.slug+'.mp4"]').count()===1&&(await r.innerText()).includes(f.city))}
 for(const f of m.source_links){await open(f.brand);const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click();check(f.by+' held copy keeps business original/credit',await row.locator('a[href="'+f.source+'"]').count()===1&&await row.locator('video').count()===0&&(await row.innerText()).includes(f.credit));await open(pageOfFoodie(f.by));const r=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'Soulsip'})});await r.locator('.foodie-review-head').click();check(f.by+' own page original retained',await r.locator('a[href="'+f.source+'"]').count()===1)}
 const {reviewsOf}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
 check('SoulSip keeps four local films and two held originals',reviewsOf('b_soulsip').filter(r=>r.src).length===4&&reviewsOf('b_soulsip').length===6)
 check('all 475 Watch sources unique; all 467 prior films retained',REELS.length===475&&new Set(REELS.map(r=>r.src)).size===475&&m.baseline.watch.every(s=>REELS.some(r=>r.src===s)))
 for(const handle of m.portraits){await open(pageOfFoodie(handle));await p.locator('.brand-logo-zoom-trigger').click();check(handle+' original requested portrait decodes',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512&&e.getAttribute('src').includes('-v88.webp')}));await p.locator('.brand-logo-close').click();await shot('portrait-'+handle)}
 await open('b_bibimgrill');await p.locator('.nav-back').click();await p.waitForTimeout(650);await p.getByRole('button',{name:'Search',exact:true}).click();await p.getByPlaceholder('Dishes, businesses, categories, cities').fill('Bibim Grill');const result=p.locator('.search-brand',{hasText:'Bibim Grill'});check('Bibim searchable',await result.count()===1);await result.click();await p.locator('.brand-body').waitFor();check('search opens Bibim',await p.locator('h1').innerText()==='Bibim Grill')
 check('no JavaScript error or process crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 88 checks: 52-post coverage, 8 films, two held originals, portraits, complete Bibim menu and unchanged earlier seats.')
