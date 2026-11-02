/* Batch 90: production mode is read-only. Local server uses a disposable DB. */
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
const m=JSON.parse(readFileSync('research/roster/batch90.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch90')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch90-server.log','w'),openSync('.verify/batch90-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch90-browser-fixture',name:'Batch 90 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});const fig=v.locator('xpath=ancestor::figure');if(await fig.count())await fig.getByRole('button',{name:'Turn the sound on',exact:true}).click();else if(iphone)await v.click();else await v.press('Space');await p.waitForFunction(v=>v.readyState>=2&&v.currentTime>.05&&!v.paused,await v.elementHandle(),{timeout:30000});const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));if(d.w!==540||d.h!==960)console.log('film dimensions',d);return d.w===540&&d.h===960&&d.d>0}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
import { existsSync } from 'node:fs'
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1696 earlier seats unchanged',Object.keys(m.baseline.seats).length===1696&&Object.entries(m.baseline.seats).every(([k,v])=>ALL_PLACEMENTS[k]===v))
 for(const [s,id]of Object.entries(m.new_seats))check(s+' reaches '+id,ALL_PLACEMENTS[s]===id)
 check('all 184 previous overflow Foodies retain order',m.baseline.more.every((h,i)=>MORE_FOODIE_PAGES[i].handle===h)&&MORE_FOODIE_PAGES.length===187)
 check('NaYa menus, branches and primary contact unchanged',JSON.stringify(brandById('b_nayadessertcafe'))===JSON.stringify(m.baseline.naya))
 const coverage=JSON.parse(readFileSync('research/roster/b86-b90-coverage.json'))
 const refs=[...BRANDS.flatMap(b=>[b.clip,...(b.clips??[])].filter(Boolean).map(c=>({url:c.href,src:c.src}))),...OTHER_REVIEWS.map(r=>({url:r.reel,src:r.clip?'/clips/review-'+/\/reel\/([^/]+)\//.exec(r.reel)?.[1]+'.mp4':undefined}))]
 check('all 67 supplied posts reconciled with no missing IDs',coverage.post_count===67&&coverage.local_count===54&&coverage.source_only_count===13&&coverage.missing.length===0)
 for(const x of coverage.posts){const matches=refs.filter(r=>r.url&&new RegExp('/(?:reel|p)/'+x.code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:/|$)').test(r.url));check(x.code+' original referenced',matches.length>0);if(x.slug)check(x.code+' local film remains once in Watch',matches.some(r=>r.src==='/clips/'+x.slug+'.mp4')&&REELS.filter(r=>r.src==='/clips/'+x.slug+'.mp4').length===1)}
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){await open(f.brand);const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+f.by})});await row.locator('.foodie-review-head').click();check(f.code+' business review advances',await film(row.locator('video')));check(f.code+' exact branch credit visible',(await row.innerText()).includes(f.credit));const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,sample_aspect_ratio','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']));check(f.code+' audio, square pixels and bounded excerpt',probe.streams.some(s=>s.codec_type==='audio')&&probe.streams.some(s=>s.codec_type==='video'&&s.sample_aspect_ratio==='1:1')&&Math.abs(+probe.format.duration-(f.end-f.start))<.2);check(f.code+' source/date credited',credits.includes(f.source)&&credits.includes(f.posted_pacific));await open(pageOfFoodie(f.by));const r=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'NaYa Dessert Cafe'})});await r.locator('.foodie-review-head').click();check(f.by+' own page correct source/city',await r.locator('video[src="/clips/'+f.slug+'.mp4"]').count()===1&&(await r.innerText()).includes(f.city))}
 const held=m.source_links[0];await open(held.brand);const original=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+held.by})});await original.locator('.foodie-review-head').click();check('Hee Jin business review keeps original without local copy',await original.locator('a[href="'+held.source+'"]').count()===1&&await original.locator('video').count()===0&&(await original.innerText()).includes(held.credit))
 await open(pageOfFoodie(held.by));check('Hee Jin preferred name and original profile link',await p.locator('h1').innerText()==='Hee Jin'&&await p.locator('a[href="https://www.instagram.com/hungryhungryheejin/"]').count()>0);const heldRow=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'NaYa Dessert Cafe'})});await heldRow.locator('.foodie-review-head').click();check('Hee Jin creator page original retained',await heldRow.locator('a[href="'+held.source+'"]').count()===1&&await heldRow.locator('video').count()===0);check('permission-held portrait and film are not published',!brandById(pageOfFoodie(held.by)).logo.imageUrl&&!existsSync('public/clips/review-De8TxUbOfCI.mp4')&&!existsSync('public/icons/foodie-hungryhungryheejin-v90.webp'));await shot('hee-jin-original')
 for(const a of m.icons){await open(pageOfFoodie(a.handle));await p.locator('.brand-logo-zoom-trigger').click();check(a.handle+' original artwork decodes',await p.locator('.brand-logo-large img').evaluate(async e=>{await e.decode();return e.naturalWidth===512&&e.getAttribute('src').includes('-v90.webp')}));await p.locator('.brand-logo-close').click();await shot('portrait-'+a.handle)}
 for(const f of m.new_foodies){await open(pageOfFoodie(f.handle));check(f.handle+' exact creator heading',await p.locator('h1').innerText()===f.name);await p.setViewportSize({width:320,height:568});check(f.handle+' fits smallest phone',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await p.setViewportSize({width:393,height:852})}
 const{reviewsOf}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
 check('NaYa has two local films plus the permission-held original',reviewsOf('b_nayadessertcafe').length===3&&reviewsOf('b_nayadessertcafe').filter(r=>r.src).length===2)
 check('all 485 Watch sources unique and all 483 prior films retained',REELS.length===485&&new Set(REELS.map(r=>r.src)).size===485&&m.baseline.watch.every(s=>REELS.some(r=>r.src===s)))
 check('held Hee Jin film never enters Watch',!REELS.some(r=>r.href===held.source))
 check('no JavaScript error or process crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 90 checks: 67-post coverage, late NaYa films, original permission hold, artwork and unchanged earlier seats/menus.')
