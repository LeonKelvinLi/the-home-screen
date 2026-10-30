/* BASE production mode never creates an account. Local member checks use a disposable DB. */
import { chromium } from 'playwright'
import { renderToStaticMarkup } from 'react-dom/server'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync, readFileSync } from 'node:fs'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const opts={parentURL:import.meta.url,tsconfig:'tsconfig.app.json'}
const {ALL_APPS,DOCK_SETS,makeSlot}=await tsImport('../src/apps/registry.tsx',opts)
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',opts)
const {ALL_BEASTY_PAGES}=await tsImport('../src/data/slots.ts',opts)
const live=process.env.BASE,db=live?null:await freshTestDb('batch81')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const log='.verify/batch81-server.log'
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync(log,'w'),openSync(log,'a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||'http://127.0.0.1:'+port,browser=await chromium.launch(),p=await browser.newPage({viewport:{width:393,height:852}})
const fails=[];let checks=0
const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
const where=()=>p.locator('.page-dots [aria-current="page"]').getAttribute('aria-label')
const fit=()=>p.evaluate(()=>document.documentElement.scrollWidth===innerWidth)
const shot=async name=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
const openBrand=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(700)}
const home=async()=>{await openBrand('b_sansanteahouse');await p.locator('.nav-back').click();await p.waitForTimeout(800)}
const currentIcons=()=>p.locator('.home-page:not([inert]) .icon-tile')
const folded=icons=>icons.evaluateAll(els=>els.every(e=>!!e.querySelector('.beasty-page-fold')||!!e.querySelector('.slot-icon')?.style.backgroundImage.includes('beasty-page-fold')))
const search=async()=>{await p.locator('button.spotlight').click();await p.locator('.search-drops').waitFor({timeout:15000})}

async function deployedBundles(){
 const html=await(await fetch(base)).text(),queue=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>new URL(m[1],base).href),seen=new Set(),texts=[]
 while(queue.length){
  const url=queue.shift();if(seen.has(url))continue;seen.add(url)
  if(seen.size>100)throw new Error('unexpected asset graph')
  const response=await fetch(url);if(!response.ok)throw new Error('asset '+response.status+' '+url)
  const text=await response.text();texts.push(text)
  for(const m of text.matchAll(/["']([^"'\s]+\.js)["']/g)){
   const next=new URL(m[1],url)
   if(next.origin===new URL(base).origin&&next.pathname.startsWith('/assets/')&&!seen.has(next.href))queue.push(next.href)
  }
 }
 return texts.join('\n')
}

try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const rows=Object.entries(ALL_PLACEMENTS).sort(([a],[b])=>a.localeCompare(b))
 check('all 1500 pre-batch seats remain exactly unchanged',rows.length===1500&&createHash('sha256').update(JSON.stringify(rows)).digest('hex')==='b6a853e7c0bf4c5a7255707d2eb61f902b0a2905369ff6c44eb9e51604c181f1')
 check('B i P has no invented entries',!rows.some(([seat])=>seat.startsWith('beasty-bip-')))
 check('B i P retains Glenn’s exact name and expansion',ALL_BEASTY_PAGES.some(x=>x.kind==='bip'&&x.heading==='B i P'&&x.about==='BEAST in PEACE'))
 const icons=[...new Map([...ALL_APPS,...DOCK_SETS.flatMap(x=>x.apps),makeSlot('beasty-bip-0')].map(a=>[a.id,a])).values()]
 const missing=icons.filter(a=>!renderToStaticMarkup(a.icon).includes('beasty-page-fold'))
 check('all '+icons.length+' registered app and open-spot icons have the fold',missing.length===0)
 if(missing.length)console.error('Missing folds:',missing.map(x=>x.id))
 const bundles=await deployedBundles()
 check('deployed contact data omits Janelle’s mailbox',!bundles.includes('janellenicole@beastypages.com'))
 check('deployed contact data omits Janelle’s owner phone',!bundles.includes('510-674-8011'))
 check('Glenn and Leon’s contact roles remain',bundles.includes('CEO/Founder')&&bundles.includes('CTO/Co-Founder')&&bundles.includes('leon@beastypages.com'))
 check('deployed category includes B i P and BEAST in PEACE',bundles.includes('B i P')&&bundles.includes('BEAST in PEACE'))
 check('fold geometry ships in the public app',bundles.includes('beasty-page-fold')&&bundles.includes('M78 .75H99.25V22Z'))
 for(const file of ['cat-bip.webp','cat-bip-thumb.webp']){
  check(file+' is served as WebP',(await fetch(base+'/wallpapers/'+file)).headers.get('content-type')?.includes('webp'))
 }
 await home()
 check('all 24 home category tiles have a fold',await currentIcons().count()===24&&await folded(currentIcons()))
 check('home icons retain their accessible category names',await p.getByRole('button',{name:'BEASTY • Eats',exact:true}).count()===1)
 check('home fits the phone',await fit())
 await shot('home')
 check('the visible dock folds all four icons',await p.locator('.dock .icon-tile').count()===4&&await folded(p.locator('.dock .icon-tile')))
 check('the Scan sweep does not round off its page corner',await p.locator('.dock .app-icon[aria-label^="Share & Scan"] .icon-tile').evaluate(e=>getComputedStyle(e).borderTopRightRadius==='0px'))
 await p.locator('.dock-switch-btn').nth(1).click();await p.waitForTimeout(400)
 check('switching the dock retains the signed-out gate',await p.locator('.gate[role="dialog"]').count()===1)
 await p.getByRole('button',{name:'Not now',exact:true}).click()
 const dots=await p.locator('.page-dots .dot').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')).filter(x=>/BEASTY, More pages$/.test(x)))
 await p.getByRole('button',{name:dots.at(-1),exact:true}).click();await p.waitForTimeout(600)
 check('new category is on the existing second More pages sheet',dots.length===2&&await p.getByRole('button',{name:'BEASTY • B i P',exact:true}).count()===1)
 check('More pages and its remaining placeholders all have folds',await folded(currentIcons()))
 await shot('more-pages')
 await p.getByRole('button',{name:'BEASTY • B i P',exact:true}).click();await p.waitForTimeout(500)
 check('new off-home category keeps the existing signed-out gate',await p.locator('.gate[role="dialog"]').count()===1)
 await p.getByRole('button',{name:'Not now',exact:true}).click()
 await openBrand('b_sansanteahouse');await p.locator('.nav-place').click();await p.waitForTimeout(800)
 check('city affiliate and open-spot tiles all have folds',await folded(currentIcons()))
 check('city navigation still reaches San San’s yellow sheet',/San Leandro, More goods$/.test(await where()))
 await shot('city')
 await p.goto(base+'/contacts',{waitUntil:'domcontentloaded'});await p.waitForTimeout(1200)
 if(await p.locator('.owners-head').count()){
  await p.locator('.owners-head').click()
  const names=await p.locator('.owner-name').allTextContents()
  check('public Owner’s contacts shows only Glenn and Leon',names.join('|')==='Glenn|Leon')
  check('Owner’s contacts count is two',await p.locator('.owners-count').innerText()==='2')
  check('Janelle has no owner call or mail action',await p.locator('a[href="mailto:janellenicole@beastypages.com"],button[aria-label="Call or text Janelle"]').count()===0)
  await shot('owners')
 }else check('signed-out Contacts uses the existing gate',await p.locator('.gate[role="dialog"]').count()===1)
 if(!live){
  // Only the isolated local database gets a member. No mail/SMS provider is configured.
  await p.goto(base,{waitUntil:'domcontentloaded'})
  const email='batch81-'+port+'@audit.beastypages.dev'
  const started=await p.evaluate(async email=>(await fetch('/api/members/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Batch 81 Test',email})})).status,email)
  let code;for(let i=0;i<40&&!code;i++){await p.waitForTimeout(250);code=readFileSync(log,'utf8').split('\n').filter(x=>x.includes('[login-code] '+email+' ')).pop()?.match(/ (\d{6}) /)?.[1]}
  const signed=await p.evaluate(async({email,code})=>(await fetch('/api/members/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,code})})).status,{email,code})
  check('disposable local member signs in',started===202&&[200,201].includes(signed))
  await p.goto(base+'/contacts',{waitUntil:'domcontentloaded'});await p.locator('.owners-head').waitFor({timeout:20000});await p.locator('.owners-head').click()
  check('signed-in Owner’s contacts also shows only Glenn and Leon',(await p.locator('.owner-name').allTextContents()).join('|')==='Glenn|Leon')
  await shot('owners-member')
  await home()
  for(let i=0;i<3;i++){
   await p.locator('.dock-switch-btn').nth(i).click();await p.waitForTimeout(300)
   check('signed-in dock set '+(i+1)+' folds all four icons',await p.locator('.dock .icon-tile').count()===4&&await folded(p.locator('.dock .icon-tile')))
  }
  await search();await p.getByRole('button',{name:'Categories',exact:true}).click()
  check('Search lists all 53 pages including B i P',await p.locator('#search-drop-categories .search-brand').count()===53&&await p.locator('#search-drop-categories .search-brand',{hasText:'BEASTY • B i P'}).count()===1)
  check('Search category thumbnails all carry the page fold',await p.locator('#search-drop-categories .beasty-page-fold').count()===53)
  await shot('search-categories')
  await p.locator('#search-drop-categories .search-brand',{hasText:'BEASTY • B i P'}).click();await p.waitForTimeout(1200)
  check('B i P opens from Search',/BEASTY, B i P$/.test(await where()))
  check('B i P has 24 open spots rather than guessed affiliates',await currentIcons().count()===24&&(await p.locator('.home-page:not([inert]) .home-grid button').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))).every(x=>x.startsWith('B i P — spot available')))
  check('B i P uses its own wallpaper',await p.locator('.home-wallpaper-layer').first().evaluate(e=>e.style.backgroundImage.includes('cat-bip.webp')))
  check('all B i P open spots use the new fold',await folded(currentIcons()))
  await shot('bip')
  for(const query of ['bip','b i p','BEAST in PEACE']){
   await search();await p.locator('input[aria-label="Dishes, businesses, categories, cities"]').fill(query);await p.waitForTimeout(400)
   check('Search finds the category by '+query,(await p.locator('.search-brand.is-cat strong').allTextContents()).includes('BEASTY • B i P'))
   await p.locator('.search-brand.is-cat',{hasText:'BEASTY • B i P'}).click();await p.waitForTimeout(600)
  }
  await p.setViewportSize({width:393,height:675})
  check('B i P fits a short phone',await fit())
  await p.setViewportSize({width:1024,height:768})
  check('B i P fits the tablet layout',await fit())
 }
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await browser.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 81 checks'+(live?' (production read-only; signed-in category checks run locally)':'')+'.')
