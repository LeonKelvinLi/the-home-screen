/* Batch 83: production mode is read-only. Local server uses a disposable DB. */
import { chromium, webkit, devices } from 'playwright'
import { PNG } from 'pngjs'
import { PDFDocument, PDFName, PDFArray, PDFDict, decodePDFRawStream } from 'pdf-lib'
import jsQR from 'jsqr'
import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createServer } from 'node:net'
import { readFileSync, openSync, mkdirSync } from 'node:fs'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const {BRANDS,brandById}=await tsImport('../src/data/brands.ts',import.meta.url)
const {REELS}=await tsImport('../src/data/clips.ts',import.meta.url)
const {MORE_FOODIE_PAGES}=await tsImport('../src/data/foodies.ts',import.meta.url)
const {pageOfFoodie,reviewsBy}=await tsImport('../src/data/foodieIndex.ts',import.meta.url)
const {PROMOTIONS,withPromotions}=await tsImport('../src/data/promotions.ts',import.meta.url)
const {BEASTY_CATEGORIES}=await tsImport('../src/data/categories.ts',import.meta.url)
const m=JSON.parse(readFileSync('research/roster/batch83.json'))
const live=process.env.BASE,db=live?null:await freshTestDb('batch83')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch83-server.log','w'),openSync('.verify/batch83-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const iphone=process.env.BROWSER==='webkit'
const engine=iphone?webkit:chromium
const base=live||'http://127.0.0.1:'+port,b=await engine.launch(iphone?{}:{args:['--autoplay-policy=no-user-gesture-required']}),p=await b.newPage({...(iphone?devices['iPhone 13']:{}),viewport:{width:393,height:852}}),fails=[],errors=[]
let checks=0;const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
p.on('pageerror',e=>errors.push(String(e)))
p.on('crash',()=>errors.push('browser process crashed'))
// Browser-only member fixture for gated navigation, including BASE mode.
// No account or cookie is created on either server.
await p.route('**/api/members/me', route => route.fulfill({status:200,json:{
 id:'batch83-browser-fixture',name:'Batch 83 QA',email:null,phone:null,instagram:null,
 joinedAt:0,referralCode:'',tier:'pass',tierStatus:'active',tierInterval:'month',
 referrals:0,raffleTickets:{total:0,unused:0},rewards:{milestones:0,raffleTickets:0,discount:0,toNextTicket:1,discountCapped:false},
 paymentsConfigured:false,passWindowMs:60000,
}}))

const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
const film=async(v)=>{await v.scrollIntoViewIfNeeded();await v.evaluate(v=>{v.preload='metadata';v.load()});await p.waitForFunction(v=>v.readyState>=1,await v.elementHandle(),{timeout:30000});return v.evaluate(v=>v.videoWidth===540&&v.videoHeight===960&&v.duration>0)}
const shot=async(name)=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
const newSeats={
 'san-jose-goods2-27':'b_saigonsocialcafe','hayward-goods2-3':'b_nobibihayward','san-francisco-goods2-64':'b_magicdonuts','san-jose-goods2-28':'b_insomnibar',
 'beasty-goods2-96':'b_saigonsocialcafe','beasty-goods2-97':'b_nobibihayward','beasty-goods2-98':'b_magicdonuts','beasty-goods2-99':'b_insomnibar',
 'beasty-foodies2-138':'b_foodiebroitsva','beasty-foodies2-139':'b_foodiefatashfoodie','beasty-foodies2-140':'b_foodiefoodieshots','beasty-foodies2-141':'b_foodiekitkatvales',
 'beasty-cooks-16':'b_insomnibar','beasty-catering-11':'b_insomnibar','beasty-teas-22':'b_saigonsocialcafe','beasty-teas-23':'b_insomnibar','beasty-bakery-16':'b_saigonsocialcafe','beasty-bakery-17':'b_magicdonuts',
}
try{
 if(srv)for(let i=0;i<160;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const old=Object.entries(ALL_PLACEMENTS).filter(([k])=>!(k in newSeats)).sort(([a],[b])=>a.localeCompare(b))
 check('all 1500 original seats are unchanged',old.length===1500&&createHash('sha256').update(JSON.stringify(old)).digest('hex')===m.baseline.sha256)
 for(const [seat,id]of Object.entries(newSeats))check(seat+' reaches '+id,ALL_PLACEMENTS[seat]===id)
 const coffee=BEASTY_CATEGORIES.find(c=>c.kind==='coffee')
 check('Coffee/teas recognizes tea without matching steak',coffee.heading==='Coffee/teas'&&coffee.test.test('Milk tea & boba')&&!coffee.test.test('Steakhouse'))
 check('four new Foodies append without changing the prior 138',MORE_FOODIE_PAGES.length===142&&m.new_foodies.every((h,i)=>MORE_FOODIE_PAGES[138+i].handle===h))
 for(const x of m.businesses){
  const id='b_'+x.slug.replace(/-/g,''),brand=brandById(id)
  await open(id)
  check(x.name+' opens with verified address',await p.locator('h1').innerText()===x.name&&(await p.locator('.brand-body').innerText()).includes(x.address))
  check(x.name+' own Instagram link',await p.locator(`a[href="https://www.instagram.com/${x.instagram}/"]`).count()===1)
  check(x.name+' current hours',(await p.locator('.brand-body').innerText()).includes(x.hours))
  check(x.name+' artwork decodes',await p.evaluate(async src=>{const im=new Image();im.src=src;await im.decode();return im.naturalWidth===512&&im.naturalHeight===512},'/icons/'+x.icon+'.webp'))
  check(x.name+' phone layout fits',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
  if(x.phone)check(x.name+' callable number',await p.locator(`a[href="tel:${x.phone.replace(/\D/g,'')}"]`).count()===1)
  if(x.menu_rows){
   check(x.name+' entire available menu model',brand.menu.length===x.menu_sections&&brand.menu.reduce((n,c)=>n+c.items.length,0)===x.menu_rows)
   await p.locator('.brand-menu-drop > .menu-picks-bar').click()
   check(x.name+' all menu rows render',await p.locator('.brand-menu-body .menu-row').count()===x.menu_rows)
   check(x.name+' every menu section has a tab',await p.locator('.brand-menu-body .cat-tab').count()===x.menu_sections)
   await p.locator('.brand-menu-drop > .menu-picks-bar').click()
  }else{
   check('Magic prices are held rather than invented',brand.menu.every(c=>c.items.length===0)&&await p.locator('.brand-menu-drop').count()===0)
   await p.getByRole('button',{name:'Donuts and coffee',exact:true}).click()
   check('Magic full unpriced flavor list is visible',(await p.locator('.brand-panel-body').innerText()).includes('Raspberry Lemonade')&&/cold-brew/i.test(await p.locator('.brand-panel-body').innerText()))
  }
  await shot(x.slug)
  await p.locator('.nav-place').click();await p.waitForTimeout(650)
  check(x.name+' reaches its city yellow sheet',await p.locator('.home-page:not([inert]).is-yellow').count()===1&&await p.locator('.home-page:not([inert])').getByRole('button',{name:new RegExp('^'+x.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:,|$)')}).count()===1)
 }
 // Each requested file is played from its actual business panel, not only fetched.
 for(const [id,slug]of [['b_saigonsocialcafe','saigon-social-cafe'],['b_insomnibar','insomnibar'],['b_tajmahallivermore','taj-mahal-livermore'],['b_yosushivacaville','yo-sushi-own']]){
  await open(id);await p.locator('.brand-clip-drop > .menu-picks-bar').click()
  check(slug+' requested film visibly decodes',await film(p.locator(`.brand-clip-drop video[src="/clips/${slug}.mp4"]`)))
  if(id==='b_yosushivacaville')check('Yo Sushi retains the earlier review',await p.locator('.brand-clip-drop video[src="/clips/yo-sushi.mp4"]').count()===1)
  if(id==='b_tajmahallivermore')check('Taj own repost is credited honestly',(await p.locator('.brand-clip-drop').innerText()).includes('Posted by @tajmahal.livermore'))
 }
 for(const [id,code,by]of [['b_saigonsocialcafe','De0Lg8tNNAn','orangeginger'],['b_saigonsocialcafe','Dd_xBfBBTT2','fat_ash_foodie'],['b_carabao','Dbjt-T3Prbf','eighty6ix_'],['b_carabao','DLVTjIlpLGo','eatwithsie'],['b_insomnibar','Dd7H1N0Su7F','cestalmoco'],['b_insomnibar','DdzgPZ1y1XV','_foodieshots_'],['b_insomnibar','Ddp1yP8SqXK','kitkatvales']]){
  await open(id)
  const row=p.locator('.foodie-review',{has:p.locator('.foodie-review-head',{hasText:'@'+by})})
  await row.locator('.foodie-review-head').click()
  check(code+' is playable on its correct business',await film(row.locator('video')))
  if(code==='Dbjt-T3Prbf')check('ended Carabao event is disclosed before playback',(await row.locator('.foodie-review-body > :first-child').innerText()).includes('event has ended'))
 }
 await open('b_foodiebroitsva');await p.getByRole('button',{name:'Polynesian Island Luau',exact:true}).click()
 check('Foodie-only send opens its actual original',await p.locator('a[href="https://www.instagram.com/reel/DeLKrmkManh/"]').count()===1&&await p.locator('.foodie-review video').count()===0)
 for(const h of m.new_foodies)check(h+' has a seated creator page and review',!!brandById(pageOfFoodie(h))&&reviewsBy(h).length>0)
 const credits=await(await fetch(base+'/clips/CREDITS.md')).text()
 for(const f of m.films){
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height','-show_entries','format=duration','-of','json','public/clips/'+f.slug+'.mp4']))
  check(f.code+' original audio and bounded excerpt',probe.streams.some(s=>s.codec_type==='audio')&&Math.abs(+probe.format.duration-(f.end-f.start))<.2)
  check(f.code+' source, creator and excerpt credited',credits.includes(f.source)&&credits.includes(f.account)&&credits.includes(f.slug+'.mp4'))
  check(f.code+' appears once in Watch',REELS.filter(r=>r.src==='/clips/'+f.slug+'.mp4').length===1)
 }
 // All rendered fold variants: no upper stroke, including serialized open spots.
 await open('b_butterpecan');await p.locator('.nav-place').click();await p.waitForTimeout(650)
 for(const [id,name,paper]of [['b_butterpecan','Butter Pecan Bakeshop',true],['b_bakedblooms','Baked Blooms',true],['b_sansanteahouse','San San Tea House',false],['b_chichasanchenberkeley','CHICHA San Chen — Berkeley',false],['b_hungrycow','Hungry Cow',false]]){
  await open(id);await p.locator('.nav-place').click();await p.waitForTimeout(650)
  const tile=p.locator('.home-page:not([inert])').getByRole('button',{name:new RegExp('^'+name+'(?:,|$)')}).locator('.icon-tile')
  check(name+' has only the reverse black triangle',await tile.locator('.beasty-page-fold').evaluate(g=>g.children.length===1&&getComputedStyle(g.firstElementChild).stroke==='none'&&getComputedStyle(g.firstElementChild).fill==='rgb(21, 21, 21)'))
  const im=PNG.sync.read(await tile.screenshot()),at=(x,y)=>Array.from(im.data.slice((Math.floor(im.height*y)*im.width+Math.floor(im.width*x))*4,(Math.floor(im.height*y)*im.width+Math.floor(im.width*x))*4+3))
  check(name+' retains the dark lower fold',at(.83,.17).every(c=>Math.abs(c-21)<8))
  if(paper)check(name+' curved source corner becomes square paper',at(.98,.02).every(c=>c>230))
  else {
   const original=await tile.evaluate(async(e)=>{const im=new Image();im.src=e.querySelector('image').getAttribute('href');await im.decode();const c=document.createElement('canvas');c.width=100;c.height=100;c.getContext('2d').drawImage(im,0,0,100,100);return [...c.getContext('2d').getImageData(90,5,1,1).data].slice(0,3)})
   check(name+' original colored corner remains',at(.9,.05).every((v,i)=>Math.abs(v-original[i])<10))
  }
 }
 await shot('corrected-folds')
 await open('b_saigonsocialcafe');await p.locator('.nav-back').click();await p.waitForTimeout(650)
 check('category and dock folds have no box outline',await p.locator('.home-page:not([inert]) .beasty-page-fold, .dock .beasty-page-fold').evaluateAll(es=>es.length>=28&&es.every(g=>g.children.length===1)))
 await p.getByRole('button',{name:'BEASTY • Eats',exact:true}).click();await p.waitForTimeout(650)
 const more=await p.locator('.page-dots .dot').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')).filter(s=>/BEASTY, More eats$/.test(s)))
 check('More eats grows a fifth sheet instead of dropping new shops',more.length===5)
 await p.getByRole('button',{name:more.at(-1),exact:true}).click();await p.waitForTimeout(650)
 check('all four new shops appear together on the fifth yellow sheet',await p.locator('.home-page:not([inert]).is-yellow .home-grid button').evaluateAll((es,names)=>names.every(n=>es.some(e=>e.getAttribute('aria-label')===n)),m.businesses.map(x=>x.name)))
 await shot('new-yellow-sheet')
 // Feed cadence and organic integrity for full and short lists.
 for(const count of [0,1,7,8,9,16,17,24,399]){
  const films=Array.from({length:count},(_,i)=>({src:String(i)})),feed=withPromotions(films)
  check('cadence and no dropped/duplicated films, length '+count,feed.filter(x=>x.kind==='film').map(x=>x.reel.src).join()===films.map(x=>x.src).join()&&feed.every((x,i)=>((i+1)%9===0)===(x.kind==='promotion')))
 }
 await p.getByRole('button',{name:'Watch',exact:true}).click();await p.locator('.reels').waitFor();await p.waitForTimeout(1000)
 check('all 399 organic films are represented once',REELS.length===399&&new Set(REELS.map(x=>x.src)).size===399&&await p.locator('.reels .reel').count()===withPromotions(REELS).length)
 const first=p.locator('.reel').nth(0)
 await first.locator('.reel-sound').click();await p.waitForTimeout(400)
 const labels=await p.locator('.reel').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')))
 await first.locator('.reel-like').click()
 check('interacting does not reshuffle the feed',JSON.stringify(labels)===JSON.stringify(await p.locator('.reel').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')))))
 for(const [index,promo]of [[8,PROMOTIONS[0]],[17,PROMOTIONS[1]],[26,PROMOTIONS[0]]]){
  const ad=p.locator('.reel').nth(index);await ad.scrollIntoViewIfNeeded();await ad.locator('.reel-promo').waitFor();await p.waitForTimeout(500)
  check('page '+(index+1)+' shows the correct marked promotion',(await ad.innerText()).includes(promo.price)&&/BEASTY promotion/i.test(await ad.innerText()))
  check('page '+(index+1)+' has no video or fake review controls',await ad.locator('video,.reel-like,.reel-share,.reel-sound').count()===0)
  check('page '+(index+1)+' pauses every neighboring player',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.every(v=>v.paused)))
  check('page '+(index+1)+' all ad content fits phone width',await ad.locator('.reel-promo').evaluate(e=>e.scrollWidth===e.clientWidth))
  await shot('promotion-'+(index+1))
 }
 const next=p.locator('.reel').nth(27);await next.scrollIntoViewIfNeeded();await next.locator('video').waitFor();await p.waitForTimeout(1000)
 check('video resumes after an ad with at most one playing and four mounted',await p.locator('.reels video').evaluateAll(es=>es.length<=4&&es.filter(v=>!v.paused).length===1))
 // The CTA opens existing Designs without submitting anything.
 const designsAd=p.locator('.reel').nth(17);await designsAd.scrollIntoViewIfNeeded();await designsAd.getByRole('button',{name:'Explore BEASTY Designs ↗',exact:true}).click()
 await p.getByRole('button',{name:'Get in touch',exact:true}).waitFor()
 check('Designs ad reaches real existing services',await p.getByText('from $650',{exact:true}).count()===1)
 await p.getByRole('button',{name:'Get in touch',exact:true}).click();check('contact fields are available without a submission',await p.getByPlaceholder('Your name',{exact:true}).count()===1&&await p.getByRole('button',{name:'Send',exact:true}).isDisabled())
 await p.goto(base+'/designs',{waitUntil:'domcontentloaded'});await p.getByRole('button',{name:'Get in touch',exact:true}).waitFor()
 check('print flyer Designs link opens directly',await p.getByText('Websites, apps and online ordering for local businesses.',{exact:true}).count()===1)
 for(const promo of PROMOTIONS){
  const res=await fetch(base+'/promos/'+promo.id+'.pdf'),bytes=new Uint8Array(await res.arrayBuffer()),doc=await PDFDocument.load(bytes)
  const ann=doc.getPage(0).node.lookup(PDFName.of('Annots'),PDFArray),a=ann.lookup(0,PDFDict).lookup(PDFName.of('A'),PDFDict)
  check(promo.id+' is a one-page PDF with the actual action link',res.ok&&doc.getPageCount()===1&&a.get(PDFName.of('URI')).decodeText()===promo.href)
  const images=doc.getPage(0).node.Resources().lookup(PDFName.of('XObject'),PDFDict)
  const qrCodes=[]
  for(const [,ref]of images.entries()){
   const stream=doc.context.lookup(ref),w=stream.dict.get(PDFName.of('Width')).asNumber(),h=stream.dict.get(PDFName.of('Height')).asNumber(),raw=decodePDFRawStream(stream).decode()
   if(raw.length!==w*h*3)continue
   const rgba=new Uint8ClampedArray(w*h*4)
   for(let i=0;i<w*h;i++){rgba[i*4]=raw[i*3];rgba[i*4+1]=raw[i*3+1];rgba[i*4+2]=raw[i*3+2];rgba[i*4+3]=255}
   qrCodes.push(jsQR(rgba,w,h)?.data)
  }
  check(promo.id+' embedded print QR scans to the real destination',qrCodes.includes(promo.href))
 }
 await p.setViewportSize({width:393,height:675});await open('b_insomnibar');await p.locator('.nav-place').click();await p.waitForTimeout(600)
 check('short iPhone still reaches late city seats',await p.locator('.home-page:not([inert])').getByRole('button',{name:'Insomnibar',exact:true}).count()===1)
 check('no JavaScript exceptions during new page and feed navigation',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 83 checks: shops, films, preserved seats, corners, Coffee/teas, flyers and bounded ninth-page promotions.')
