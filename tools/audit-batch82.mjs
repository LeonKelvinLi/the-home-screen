/* Real rendered pixels: the upper fold reveals the original icon, not white paint. */
import { chromium } from 'playwright'
import { PNG } from 'pngjs'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync } from 'node:fs'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const live=process.env.BASE,db=live?null:await freshTestDb('batch82')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/batch82-server.log','w'),openSync('.verify/batch82-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||'http://127.0.0.1:'+port,b=await chromium.launch(),p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:1}),fails=[]
let checks=0;const errors=[]
p.on('pageerror',e=>errors.push(String(e)))
const check=(name,ok)=>{checks++;console.log((ok?'ok ':'FAIL ')+name);if(!ok)fails.push(name)}
const pixel=(im,x,y)=>Array.from(im.data.slice((y*im.width+x)*4,(y*im.width+x)*4+3))
const near=(a,b,tolerance=8)=>a.every((v,i)=>Math.abs(v-b[i])<=tolerance)
const shot=async name=>{if(process.env.BATCH_SHOTS){mkdirSync(process.env.BATCH_SHOTS,{recursive:true});await p.screenshot({path:process.env.BATCH_SHOTS+'/'+name+'.png'})}}
const open=async id=>{await p.goto(base+'/?b='+id,{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(700)}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 const rows=Object.entries(ALL_PLACEMENTS).sort(([a],[b])=>a.localeCompare(b))
 check('all 1500 seats remain unchanged',rows.length===1500&&createHash('sha256').update(JSON.stringify(rows)).digest('hex')==='b6a853e7c0bf4c5a7255707d2eb61f902b0a2905369ff6c44eb9e51604c181f1')
 await open('b_sansanteahouse');await p.locator('.nav-back').click();await p.waitForTimeout(800)
 check('all 24 category fold windows are transparent',await p.locator('.home-page:not([inert]) .beasty-page-fold').evaluateAll(a=>a.length===24&&a.every(g=>getComputedStyle(g.lastElementChild).fill==='none')))
 check('all four visible dock fold windows are transparent',await p.locator('.dock .beasty-page-fold').evaluateAll(a=>a.length===4&&a.every(g=>getComputedStyle(g.lastElementChild).fill==='none')))
 check('black fold edges remain visible',await p.locator('.home-page:not([inert]) .beasty-page-fold').evaluateAll(a=>a.every(g=>getComputedStyle(g.firstElementChild).fill==='rgb(21, 21, 21)')))
 await shot('home')
 for(const [id,name,tone] of [['b_sansanteahouse','San San Tea House','pink'],['b_chichasanchenberkeley','CHICHA San Chen — Berkeley','light'],['b_hungrycow','Hungry Cow','dark']]){
  await open(id);await p.locator('.nav-place').click();await p.waitForTimeout(800)
  const tile=p.locator('.home-page:not([inert])').getByRole('button',{name:new RegExp('^'+name+'(?:,|$)')}).locator('.icon-tile')
  await tile.waitFor({state:'visible'})
  check(name+' keeps a transparent fold window',await tile.locator('.beasty-page-fold path').last().evaluate(e=>getComputedStyle(e).fill==='none'))
  const im=PNG.sync.read(await tile.screenshot()),x=Math.floor(im.width*.9),y=Math.floor(im.height*.05)
  const reference=await tile.evaluate(async(e,{w,h,x,y})=>{
   const img=new Image();img.src=e.querySelector('image').getAttribute('href');await img.decode()
   const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h)
   return Array.from(c.getContext('2d').getImageData(x,y,1,1).data).slice(0,3)
  },{w:im.width,h:im.height,x,y})
  const actual=pixel(im,x,y)
  check(name+' shows its original '+tone+' artwork through the fold',near(actual,reference))
  console.log('  fold pixel:',actual,'original:',reference)
  const dark=pixel(im,Math.floor(im.width*.83),Math.floor(im.height*.17))
  check(name+' retains the black lower triangle',near(dark,[21,21,21],5))
  if(tone==='pink'){
   check('the pink icon is no longer painted white',actual[0]>actual[1]+15&&actual[0]>actual[2]+5)
   const blank=p.locator('.home-page:not([inert]) .icon-tile').filter({has:p.locator('.slot-icon')}).first()
   const bi=PNG.sync.read(await blank.screenshot()),by=Math.floor(bi.height*.05)
   check('open spots reveal their existing tile colour through the fold',near(pixel(bi,Math.floor(bi.width*.9),by),pixel(bi,Math.floor(bi.width*.7),by),12))
   await shot('pink-and-open-spots')
  }
  await shot(tone+'-icons')
 }
 check('phone layout has no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 check('no JavaScript errors during icon navigation',errors.length===0)
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: '+checks+' Batch 82 checks, including original-artwork pixel comparisons.')
