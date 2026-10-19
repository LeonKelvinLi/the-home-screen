/* Glenn's 18 October additions (batch 54) and the Health/Beauty page: every page, film, credit and city seat. Read-only on BASE. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { openSync, readFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { freshTestDb } from './pgtest.mjs'
const live=process.env.BASE
const db=live?null:await freshTestDb('batch54')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const logPath='.verify/batch54-server.log'
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync(logPath,'w'),openSync(logPath,'a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`
const b=await chromium.launch();const p=await b.newPage({viewport:{width:393,height:852}});const fails=[]
const check=(name,ok)=>{console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
const where=()=>p.locator('.page-dots [aria-current="page"]').getAttribute('aria-label')
const open=async id=>{await p.goto(`${base}/?b=${id}`,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:25000});await p.waitForTimeout(650)}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const data=JSON.parse(readFileSync('research/roster/batch54.json','utf8'))
 for(const d of data){
  await open(d.id)
  check(`${d.facts.name} opens`,(await p.locator('.brand-body').innerText()).includes(d.facts.tagline))
  check(`${d.id} direct link keeps Home`,(await p.locator('.nav-back').textContent()).includes('Home'))
  const badImages=await p.locator('.brand-body img').evaluateAll(a=>a.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src))
  check(`${d.id} images load`,badImages.length===0)
  if(d.facts.clip){
   await p.locator('.brand-clip-drop .menu-picks-bar').click()
   const v=p.locator('.brand-clip-drop video');await v.waitFor({timeout:10000})
   await p.waitForFunction(()=>{const v=document.querySelector('.brand-clip-drop video');return v&&v.readyState>=1},{},{timeout:20000})
   check(`${d.id} film decodes`,await v.evaluate(v=>v.videoWidth===540&&v.duration>0))
   if(d.facts.clip.by)check(`${d.id} creator credited`,(await p.locator('.brand-clip-drop').innerText()).includes('@'+d.facts.clip.by))
  }
 }
 for(const d of data){
  await open(d.id)
  const place=p.locator('.nav-place')
  if(await place.count()){
   await place.first().click();await p.waitForTimeout(800)
   const labels=await p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
   check(`${d.id} sits on its city grid (${await where()})`,labels.some(l=>l.includes(d.facts.label)||l.includes(d.facts.name)))
  }
 }
 await open('b_jackiesplace');const jb=p.locator('.brand-clip-drop .menu-picks-bar');check('Jackie’s Place receives its Foodie review',await jb.count()===1)
 if(await jb.count()){await jb.click();await p.waitForFunction(()=>document.querySelector('.brand-clip-drop video')?.readyState>=1,{},{timeout:20000})
  check('Jackie’s Place review decodes',await p.locator('.brand-clip-drop video').evaluate(v=>v.videoWidth===540&&v.duration>0))
  check('Jackie’s Place review credits @daeatzwitbri',(await p.locator('.brand-clip-drop').innerText()).includes('@daeatzwitbri'))}
 await open('b_radiantmedspa');await p.getByRole('button',{name:'Home'}).first().click().catch(()=>{});await p.waitForTimeout(600)
 await p.getByRole('button',{name:'Search',exact:true}).first().click();await p.locator('.search-drop-btn',{hasText:'Categories'}).click()
 const hb=p.locator('#search-drop-categories .search-brand',{hasText:'BEASTY • Health/Beauty'});check('Search lists BEASTY • Health/Beauty',await hb.count()===1)
 if(await hb.count()){await hb.click();await p.waitForTimeout(800);check('Health/Beauty grid opens',/Health\/Beauty$/.test(await where()))
  check('Radiant Med Spa holds Health/Beauty spot 1',((await p.locator('.home-page:not([inert]) .home-grid button').first().getAttribute('aria-label'))||'').includes('Radiant'))}
}catch(e){fails.push(e.message);console.log('FAIL',e.stack)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.log(`FAIL: ${fails.length} batch 54 checks`);process.exit(1)}
console.log('PASS: batch 54 business pages, films, credits and city seats.')
