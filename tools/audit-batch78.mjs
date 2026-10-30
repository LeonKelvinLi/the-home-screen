/* Batch 78: SCP Argos. BASE is read-only; membership checks use a disposable local DB. */
import {chromium} from 'playwright'
import {spawn} from 'node:child_process'
import {createServer} from 'node:net'
import {openSync,readFileSync,mkdirSync} from 'node:fs'
import {tsImport} from 'tsx/esm/api'
import {freshTestDb} from './pgtest.mjs'
const {ALL_PLACEMENTS}=await tsImport('../src/data/categorySeats.ts',import.meta.url)
const live=process.env.BASE,db=live?null:await freshTestDb('batch78')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true});const logPath='.verify/batch78-server.log'
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync(logPath,'w'),openSync(logPath,'a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`,b=await chromium.launch(),p=await b.newPage({viewport:{width:393,height:852}}),fails=[]
const check=(name,ok)=>{console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
const open=async()=>{await p.goto(base+'/?b=b_scpargos',{waitUntil:'domcontentloaded'});await p.locator('.brand-body').waitFor({timeout:30000});await p.waitForTimeout(500)}
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 await open()
 check('SCP Argos page opens',(await p.locator('h1').innerText())==='SCP Argos')
 check('profile describes Argos’s own adventures',(await p.locator('.brand-body').innerText()).includes('Adventures with Argos'))
 check('Home remains available',(await p.locator('.nav-back').innerText()).includes('Home'))
 check('category navigation identifies Pit’s',(await p.locator('.nav-place').innerText()).includes("Pit's"))
 check('own photograph loads',(await p.locator('.brand-hero-mark image').getAttribute('href'))==='/icons/scp-argos.webp'&&await p.evaluate(async()=>{const i=new Image();i.src='/icons/scp-argos.webp';try{await i.decode();return i.naturalWidth===512}catch{return false}}))
 check('phone layout has no horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 check('Instagram button has the correct profile',(await p.getByRole('link',{name:'Open Instagram',exact:true}).getAttribute('href'))==='https://www.instagram.com/scp_argos/')
 check('no menu or commercial film invented',await p.locator('.brand-menu-drop,.brand-clip-drop').count()===0)
 check('no phone or city address invented',await p.locator('a[href^="tel:"],a[href*="maps.apple.com"]').count()===0)
 await p.locator('.brand-panel-head',{hasText:'From his profile'}).click()
 check('bio names are attributed to the profile',(await p.locator('.brand-panel.is-open').innerText()).includes('His Instagram bio names SCP Shady × SCP Lilith'))
 check('Sade relationship is not an unverified public claim',!(await p.locator('.brand-body').innerText()).includes('Sade'))
 check('Argos appends Pit’s seat 2',ALL_PLACEMENTS['beasty-pits-2']==='b_scpargos')
 check('Sin City and Gem City seats preserved',ALL_PLACEMENTS['beasty-pits-0']==='b_sincitypits'&&ALL_PLACEMENTS['beasty-pits-1']==='b_gemcitykennels')
 check('icon served as WebP',(await fetch(base+'/icons/scp-argos.webp')).headers.get('content-type')?.includes('webp'))
 if(!live){
  await p.screenshot({path:'.verify/batch78-scp-argos.png'})
  const email='batch78-'+port+'@audit.beastypages.dev'
  await p.evaluate(email=>fetch('/api/members/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Batch 78 Test',email})}),email)
  let code;for(let i=0;i<40&&!code;i++){await p.waitForTimeout(250);code=readFileSync(logPath,'utf8').split('\n').filter(l=>l.includes('[login-code] '+email+' ')).pop()?.match(/ (\d{6}) /)?.[1]}
  const status=await p.evaluate(async({email,code})=>(await fetch('/api/members/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,code})})).status,{email,code})
  check('isolated member can open category',status<300)
  await open();await p.locator('.nav-place').click();await p.waitForTimeout(800)
  const labels=await p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
  check('Pit’s grid has Sin City, Gem City and SCP Argos',labels.includes('SCP Argos')&&labels.some(x=>x.includes('Sin City'))&&labels.some(x=>x.includes('Gem City')))
  await p.getByRole('button',{name:'SCP Argos',exact:true}).click();await p.locator('h1').waitFor()
  check('Argos tile opens its own page',(await p.locator('h1').innerText())==='SCP Argos')
 }
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{await b.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL: '+fails.join('\n'));process.exit(1)}
console.log('\nPASS: Batch 78 SCP Argos profile, photograph, Instagram, Pit’s placement and honest contact-only content.')
