/* What the online search found (src/data/onlineFills.ts): every filled menu shows all its items, a menu priced from a delivery app, a listing or a photo says so, and every filled hours line is on its page. Read-only on BASE. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { openSync, readFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { freshTestDb } from './pgtest.mjs'
const live=process.env.BASE
const db=live?null:await freshTestDb('online-fills')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const logPath='.verify/online-fills-server.log'
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync(logPath,'w'),openSync(logPath,'a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`
const b=await chromium.launch();const p=await b.newPage({viewport:{width:393,height:852}});const fails=[]
const check=(name,ok)=>{console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
const where=()=>p.locator('.page-dots [aria-current="page"]').getAttribute('aria-label')
const open=async id=>{await p.goto(`${base}/?b=${id}`,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:25000});await p.waitForTimeout(650)}
const grid=()=>p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
const dots=()=>p.locator('.page-dots .dot').evaluateAll(a=>a.map(d=>d.getAttribute('aria-label')))
const goDot=async i=>{await p.evaluate(n=>document.querySelectorAll('.page-dots .dot')[n]?.click(),i);await p.waitForTimeout(700)}
/* Every screen of a BEASTY sheet: More eats runs on past 24, under the same name. */
const sheet=async name=>{const all=[];const ds=await dots();for(let i=0;i<ds.length;i++){if(ds[i]?.endsWith(`BEASTY, ${name}`)){await goDot(i);all.push(...await grid())}}return all}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const rec=JSON.parse(readFileSync('research/online-fills.json','utf8'))
 const src=readFileSync('src/data/onlineFills.ts','utf8')
 const est=new Set([...src.matchAll(/^  '([^']+)': \{[\s\S]*?^  \},/gm)].filter(m=>/pricesEstimated:/.test(m[0])).map(m=>m[1]))
 const hoursOf=Object.fromEntries([...src.matchAll(/^  '([^']+)': \{[\s\S]*?^  \},/gm)].map(m=>[m[1],/hours: "([^"]+)"/.exec(m[0])?.[1]]).filter(x=>x[1]))
 for(const [slug,r] of Object.entries(rec)){
  if(!r.filled.length)continue
  const id='b_'+slug.replace(/-/g,'')
  await open(id)
  const text=await p.locator('.brand-body').innerText()
  if(hoursOf[slug])check(`${slug} shows its hours`,text.includes(hoursOf[slug]))
  /* A free (tier 1) page shows no menu by design (affiliateTiers.ts); its menu waits for an upgrade. */
  if(r.items&&await p.locator('.brand-free').count())check(`${slug} is a free page, menu held for an upgrade`,await p.locator('.brand-menu-drop').count()===0)
  else if(r.items){
   await p.locator('.brand-menu-drop .menu-picks-bar').click();await p.waitForTimeout(400)
   const rows=await p.locator('.menu-row').count()
   check(`${slug} shows all ${r.items} items (${rows})`,rows===r.items)
   if(est.has(slug))check(`${slug} says its prices need confirming`,(await p.locator('.brand-body').innerText()).includes('Prices need confirming'))
  }
 }
}catch(e){fails.push(e.message);console.log('FAIL',e.stack)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.log(`FAIL: ${fails.length} online-fill checks`);process.exit(1)}
console.log('PASS: every page the search filled shows its menu, its price note and its hours.')
