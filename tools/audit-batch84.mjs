/* Batch 84: production mode is read-only. Local server uses a disposable DB. */
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
const m=JSON.parse(readFileSync('research/roster/batch84.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch84')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch84-server.log','w'),openSync('.verify/batch84-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch84-browser-fixture',name:'Batch 84 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});await p.waitForFunction(v=>v.readyState>=1,await v.elementHandle(),{timeout:30000});const d=await v.evaluate(v=>({w:v.videoWidth,h:v.videoHeight,d:v.duration}));if(d.w!==540||d.h!==960)console.log('film dimensions',d);return d.w===540&&d.h===960&&d.d>0}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
try {
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 check('all 1518 earlier seats retain their business',Object.keys(m.baseline.seats).length===1518&&Object.entries(m.baseline.seats).every(([k,v])=>ALL_PLACEMENTS[k]===v))
 for(const [seat,id]of Object.entries(m.new_seats))check(seat+' reaches '+id,ALL_PLACEMENTS[seat]===id)
 check('FoodWookie appends after all 142 More foodies',MORE_FOODIE_PAGES.length===143&&MORE_FOODIE_PAGES[142].handle==='foodwookie')
 check('Grand-O retains original existing page',pageOfFoodie('thesnacksensei')==='b_grando')
 for(const x of m.businesses){
  const id='b_'+x.slug.replace(/-/g,''),brand=brandById(id)
  await open(id)
  check(x.name+' heading and phone layout',await p.locator('h1').innerText()===x.name&&await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
  check(x.name+' original artwork decodes',await p.evaluate(async src=>{const im=new Image();im.src=src;await im.decode();return im.naturalWidth===512&&im.naturalHeight===512},'/icons/'+x.icon+'.webp'))
  if(x.phone)check(x.name+' phone link',await p.locator(`a[href="tel:${x.phone.replace(/\D/g,'')}"]`).count()===1)
  if(x.slug==='subs-inc')await p.getByRole('button',{name:'Contact',exact:true}).click()
  if(x.email)check(x.name+' email link',await p.locator(`a[href="mailto:${x.email}"]`).count()===1)
  if(x.address)check(x.name+' verified address',(await p.locator('.brand-body').innerText()).includes(x.address))
  if(x.hours)check(x.name+' current hours',(await p.locator('.brand-body').innerText()).includes(x.hours))
  if(x.menu_rows){
   check(x.name+' entire published menu model',brand.menu.length===x.menu_sections&&brand.menu.reduce((n,c)=>n+c.items.length,0)===x.menu_rows)
   await p.locator('.brand-menu-drop > .menu-picks-bar').click()
   check(x.name+' all menu rows render',await p.locator('.brand-menu-body .menu-row').count()===x.menu_rows)
   await p.locator('.brand-menu-drop > .menu-picks-bar').click()
  }
  const trigger=p.getByRole('button',{name:`Enlarge ${x.name} logo`,exact:true})
  await trigger.click();await p.getByRole('dialog',{name:x.name+' logo',exact:true}).waitFor()
  check(x.name+' enlarged original artwork and focus isolation',await p.locator('.brand-logo-large img').evaluate(e=>e.naturalWidth===512&&e.getBoundingClientRect().width>280)&&await p.evaluate(()=>document.querySelector('dialog')===document.activeElement.closest('dialog')))
  await shot('zoom-'+x.slug)
  await p.getByRole('button',{name:`Restore ${x.name} logo size`,exact:true}).click()
  check(x.name+' second tap restores page and trigger focus',await p.locator('.brand-logo-dialog').count()===0&&await trigger.evaluate(e=>e===document.activeElement))
  await trigger.click();await p.locator('dialog[open]').waitFor();await p.getByRole('button',{name:`Close enlarged ${x.name} logo`,exact:true}).click()
  check(x.name+' close button returns safely',await p.locator('dialog').count()===0)
  await shot(x.slug)
  if(!['ismail-seval','m-omer-farooq'].includes(x.slug)){await p.locator('.nav-place').click();await p.waitForTimeout(650);const tile=p.locator('.home-page:not([inert])').getByRole('button',{name:new RegExp('^'+x.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:,|$)')});check(x.name+' city sheet exposes its icon',await tile.count()===1);await tile.click();await p.locator('.brand-body').waitFor();check(x.name+' grid tap opens page directly',await p.locator('h1').innerText()===x.name&&await p.locator('dialog').count()===0)}
 }
 const ink=brandById('b_inkwallco'),lovitt=brandById('b_lovittsbjj')
 check('Ink has no invented address, hours or menu prices',!ink.address&&!ink.hours&&ink.menu.every(c=>c.items.length===0))
 check('Lovitt discrepant hours held and enrollment not sold here',!lovitt.hours&&!!lovitt.quoteOnly)
 await open('b_lovittsbjj');await p.getByRole('button',{name:'Class schedule',exact:true}).click()
 check('Lovitt hours conflict visible before visiting',(await p.locator('.brand-panel-body').innerText()).includes('disagree')&&await p.locator('a[href="https://www.lovittsbjj.com/schedule"]').count()===1)
 await open('b_subsinc');await p.locator('.brand-menu-drop > .menu-picks-bar').click()
 check('Subs sold out items excluded',!(await p.locator('.brand-menu-body').innerText()).match(/Super Gobbler|Greek Salad|Kinder Bueno|Apple Juice/i))
 check('Subs variable prices remain floors',(await p.locator('.brand-menu-body').innerText()).includes('from $'))
 await p.locator('.brand-menu-drop > .menu-picks-bar').click()
 for(const [id,slugs]of [['b_subsinc',['subs-inc']],['b_rywire',['rywire','rywire-toyo-sema','rywire-sema-startup']],['b_ismailseval',['ismail-seval']],['b_lovittsbjj',['lovitts-bjj']],['b_momerfarooq',['m-omer-farooq']]]){
  await open(id);await p.locator('.brand-clip-drop > .menu-picks-bar').click()
  for(const slug of slugs)check(slug+' actual business film decodes',slug==='rywire'?await (async()=>{const v=p.locator('.brand-clip-drop video[src="/clips/rywire.mp4"]');await film(v);return v.evaluate(v=>v.videoWidth===960&&v.videoHeight===540)})():await film(p.locator(`.brand-clip-drop video[src="/clips/${slug}.mp4"]`)))
  if(['b_ismailseval','b_momerfarooq'].includes(id))check('AI origin disclosed before playback',(await p.locator('.brand-clip-drop').innerText()).includes('AI-generated'))
  if(id==='b_lovittsbjj')check('Lovitt archived age bands disclosed before playback',(await p.locator('.brand-clip-drop').innerText()).includes('age bands differ'))
  if(id==='b_rywire')check('both car posts credited as own accounts',(await p.locator('.brand-clip-drop').innerText()).includes('@toyotires')&&(await p.locator('.brand-clip-drop').innerText()).includes('@rywire_motorsport'))
 }
 await open('b_subsinc')
 const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@thesnacksensei'})});await row.locator('.foodie-review-head').click()
 check('Subs Heavy Hitter review is playable',await film(row.locator('video')))
 for(const h of ['foodwookie','thesnacksensei'])check(h+' review reaches its existing or appended creator page',!!brandById(pageOfFoodie(h))&&reviewsBy(h).some(r=>r.brand?.id==='b_subsinc'))
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']))
  check(f.code+' bounded excerpt and original audio',probe.streams.some(s=>s.codec_type==='audio')&&Math.abs(+probe.format.duration-(f.end-f.start))<.2)
  check(f.code+' creator source excerpt credited',credits.includes(f.source)&&credits.includes(f.account)&&credits.includes(f.slug+'.mp4'))
  check(f.code+' once in Watch',REELS.filter(r=>r.src==='/clips/'+f.slug+'.mp4').length===1)
 }
 check('all 406 Watch films unique',REELS.length===406&&new Set(REELS.map(r=>r.src)).size===406)
 // Repeat the new modal on artwork variants and the smallest phone. No app reload.
 for(const id of ['b_bulapies','b_butterpecan','b_foodiefoodwookie','b_marinabaymedia']){
  await open(id);const trigger=p.locator('.brand-logo-zoom-trigger'),before=await p.evaluate(()=>performance.timeOrigin)
  for(let i=0;i<3;i++){await trigger.click();await p.locator('dialog[open]').waitFor();await p.locator('.brand-logo-close').press('Escape');await p.locator('dialog').waitFor({state:'detached'})}
  check(id+' repeated Escape leaves page and document intact',await trigger.evaluate(e=>e===document.activeElement)&&await p.evaluate(()=>performance.timeOrigin)===before)
 }
 await p.setViewportSize({width:320,height:568});await open('b_subsinc');await p.locator('.brand-logo-zoom-trigger').click();await p.locator('dialog[open]').waitFor()
 check('small phone viewer fits width and height',await p.locator('.brand-logo-large').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}))
 await p.locator('dialog').click({position:{x:5,y:100}});check('backdrop tap closes viewer',await p.locator('dialog').count()===0)
 await p.setViewportSize({width:393,height:852});await open('b_subsinc');await p.locator('.nav-back').click();await p.waitForTimeout(700)
 await p.getByRole('button',{name:'Watch',exact:true}).click();await p.locator('.reels').waitFor();await p.waitForTimeout(1000)
 check('Watch retains at most four materialized players',await p.locator('.reels video').count()<=4)
 const ad=p.locator('.reel').nth(8);await ad.scrollIntoViewIfNeeded();await ad.locator('.reel-promo').waitFor();await p.waitForTimeout(500)
 check('ninth-page promotion still pauses all players',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.every(v=>v.paused)))
 const next=p.locator('.reel').nth(9);await next.scrollIntoViewIfNeeded();await next.locator('video').waitFor();await p.waitForTimeout(800)
 check('film after promotion resumes within decoder budget',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.filter(v=>!v.paused).length===1))
 check('no JavaScript or browser crash',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 84 checks: new pages, seven films, all earlier seats, complete menus and phone logo viewer.')
