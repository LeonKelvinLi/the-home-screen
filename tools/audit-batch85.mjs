/* Batch 85: production mode is read-only. Local server uses a disposable DB. */
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
const m=JSON.parse(readFileSync('research/roster/batch85.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch85')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch85-server.log','w'),openSync('.verify/batch85-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch85-browser-fixture',name:'Batch 85 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});const fig=v.locator('xpath=ancestor::figure');if(await fig.count())await fig.getByRole('button',{name:'Turn the sound on',exact:true}).click();else if(iphone)await v.click();else await v.press('Space');await p.waitForFunction(v=>v.readyState>=2&&v.currentTime>.05&&!v.paused,await v.elementHandle(),{timeout:30000});const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));if(d.w!==540||d.h!==960)console.log('film dimensions',d);return d.w===540&&d.h===960&&d.d>0}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1532 earlier seats retain their business',Object.keys(m.baseline.seats).length===1532&&Object.entries(m.baseline.seats).every(([k,v])=>ALL_PLACEMENTS[k]===v))
 for(const [seat,id]of Object.entries(m.new_seats))check(seat+' reaches '+id,ALL_PLACEMENTS[seat]===id)
 check('More foodies preserves first 143 and appends seven',MORE_FOODIE_PAGES.length===150&&MORE_FOODIE_PAGES[142].handle==='foodwookie'&&MORE_FOODIE_PAGES[149].handle==='peterlyagent')
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
  const trigger=p.getByRole('button',{name:`Enlarge ${x.name} logo`,exact:true});await trigger.click();await p.locator('dialog[open]').waitFor();check(x.name+' logo viewer shows original',await p.locator('.brand-logo-large img').evaluate(e=>e.naturalWidth===512));await p.getByRole('button',{name:`Restore ${x.name} logo size`,exact:true}).click();check(x.name+' returns without reload',await p.locator('dialog').count()===0);await shot(x.slug)
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
 check('all 431 Watch films unique',REELS.length===431&&new Set(REELS.map(r=>r.src)).size===431)
 check('old Downtown film retired from page and Watch',brandById('b_downtownbbq').clip.src==='/clips/downtown-bbq-bts-v85.mp4'&&!REELS.some(r=>r.src==='/clips/downtown-bbq.mp4'))
 check('El Portal AYCE and original menu retained',brandById('b_elportalsanleandro').cuisine.includes('AYCE')&&brandById('b_elportalsanleandro').menu.reduce((n,c)=>n+c.items.length,0)===172)
 for(const h of m.portraits){const id=pageOfFoodie(h);await open(id);const src=brandById(id).logo.imageUrl;await p.locator('.brand-logo-zoom-trigger').click();await p.locator('dialog[open]').waitFor();check(h+' requested portrait is attached and decodes',src.includes('-v85.webp')&&await p.locator('.brand-logo-large img').evaluate(e=>e.complete&&e.naturalWidth===512));await shot('portrait-'+h.replaceAll('.','-'));await p.locator('.brand-logo-close').click()}
 await open('b_kingswcpizza');check('Kings supplied original badge',brandById('b_kingswcpizza').logo.imageUrl==='/icons/kings-wc-pizza-v85.webp')
 await open('b_peekaboofactoryrc');await p.getByRole('button',{name:'Shanna’s visit',exact:true}).click();check('Tag Shanna direct profile credit',await p.locator('a[href="https://www.instagram.com/outdoorideaswithkids/"]').count()>0)
 await open('b_downtownbbq');await p.locator('.brand-clip-drop > .menu-picks-bar').click();check('held Downtown copy keeps credited original link',await p.locator('a[href="https://www.instagram.com/reel/DEfXWJAS-TT/"]').count()>0)
 await open('b_therichmondbackyard');const held=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@bayarea_fooddreamz'})});await held.locator('.foodie-review-head').click();check('held Backyard review keeps original link',await held.locator('a[href="https://www.instagram.com/reel/CwD8utAosUv/"]').count()>0)
 const {BEASTY_CATEGORIES}=await tsImport('../src/data/categories.ts',import.meta.url),{CATEGORY_GLYPHS}=await tsImport('../src/data/categoryGlyphs.ts',import.meta.url)
 const parks=BEASTY_CATEGORIES.find(c=>c.kind==='parks');check('Parks category registered with heading and glyph',parks.heading==='Parks/Playgrounds'&&!!CATEGORY_GLYPHS.parks)
 for(const suffix of ['','-thumb'])check('Parks wallpaper'+suffix+' serves', (await fetch(base+'/wallpapers/cat-parks'+suffix+'.webp')).ok)
 await open('b_jinpotshabuhouse');await p.locator('.nav-back').click();await p.waitForTimeout(700);await p.getByRole('button',{name:'Watch',exact:true}).click();await p.locator('.reels').waitFor();await p.waitForTimeout(800)
 check('Watch mounts at most four players',await p.locator('.reels video').count()<=4)
 const ad=p.locator('.reel').nth(8);await ad.scrollIntoViewIfNeeded();await ad.locator('.reel-promo').waitFor();await p.waitForTimeout(400);check('promotion pauses mounted players',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.every(v=>v.paused)))
 const next=p.locator('.reel').nth(9);await next.scrollIntoViewIfNeeded();await next.locator('video').waitFor();await p.waitForTimeout(700);check('next Watch film resumes within decoder budget',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.filter(v=>!v.paused).length===1))
 check('no JavaScript error or browser crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 85 checks: 14 pages, 26 advancing films, full menus, 1532 unchanged seats, portraits and bounded phone playback.')
