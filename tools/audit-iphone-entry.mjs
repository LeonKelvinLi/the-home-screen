/* iPhone regression: delayed app module, direct entry, return/enter cycles and bounded photos. */
import {webkit,devices} from 'playwright'
import {spawn} from 'node:child_process'
import {createServer} from 'node:net'
import {openSync,mkdirSync} from 'node:fs'
import {freshTestDb} from './pgtest.mjs'
const live=process.env.BASE,db=live?null:await freshTestDb('iphoneentry')
const port=live?0:await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>r(n))})})
mkdirSync('.verify',{recursive:true})
const srv=live?null:spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:['ignore',openSync('.verify/iphone-entry-server.log','w'),openSync('.verify/iphone-entry-server.log','a')],env:{...process.env,PORT:String(port),DATABASE_URL:db.url,NODE_ENV:'development',RESEND_API_KEY:'',LEAD_EMAIL:''}})
const base=live||`http://127.0.0.1:${port}`,browser=await webkit.launch(),context=await browser.newContext({...devices['iPhone 13'],viewport:{width:393,height:675},reducedMotion:'no-preference'}),page=await context.newPage(),fails=[]
let docs=0,errors=[],checks=0,release
const ready=new Promise(r=>{release=r})
const check=(name,ok)=>{checks++;console.log(`${ok?'ok':'FAIL'} ${name}`);if(!ok)fails.push(name)}
page.on('pageerror',e=>errors.push(String(e)));page.on('crash',()=>errors.push('web process crashed'));page.on('request',r=>{if(r.resourceType()==='document')docs++})
await context.route(/\/assets\/Shell-[\w-]+\.js(?:\?.*)?$/,async route=>{await ready;await route.continue()})
try{
 if(srv)for(let i=0;i<120;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 await page.goto(base,{waitUntil:'domcontentloaded'})
 await page.getByRole('button',{name:'Enter BEASTY',exact:true}).waitFor({timeout:20000})
 check('WebKit uses an iPhone user agent',await page.evaluate(()=>/iPhone/.test(navigator.userAgent)))
 check('landing photo layers stay at two',await page.locator('.dialer-photo').evaluateAll(a=>a.filter(x=>x.style.backgroundImage).length===2))
 check('landing does not pin a full-screen filter surface',(await page.locator('.dialer-crt').evaluate(e=>getComputedStyle(e).willChange))==='auto')
 await page.getByRole('button',{name:'Enter BEASTY',exact:true}).click()
 check('iPhone releases the landing screen before app loading',await page.locator('.dialer').count()===0)
 check('a delayed app module leaves a visible yellow screen',await page.locator('.shell-loading').isVisible()&&await page.locator('.shell-loading').evaluate(e=>getComputedStyle(e).backgroundColor)==='rgb(246, 216, 0)')
 release()
 await page.locator('.home').waitFor({timeout:20000})
 check('Enter reaches the actual category grid',await page.getByRole('button',{name:'BEASTY • Eats',exact:true}).count()>0)
 check('iPhone skips the simultaneous full-screen crossfade',await page.locator('.shell-enter.is-arriving').count()===0)
 for(let i=0;i<3;i++){
  await page.goBack();await page.getByRole('button',{name:'Enter BEASTY',exact:true}).waitFor()
  await page.getByRole('button',{name:'Enter BEASTY',exact:true}).click();await page.locator('.home').waitFor()
  check('return and re-enter '+(i+1)+' keeps the home screen',await page.locator('.dialer').count()===0)
 }
 check('entry never reloads the document',docs===1)
 check('entry has no JavaScript error or process crash',errors.length===0)
 check('iPhone viewport fits',await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth))
 if(!live)await page.screenshot({path:'.verify/iphone-entry-home.png'})
}catch(e){fails.push(e.stack||String(e));console.error(e)}finally{release();await browser.close();srv?.kill();await db?.drop()}
if(fails.length){console.error('\nFAIL '+fails.join('\n'));process.exit(1)}
console.log(`\nPASS: ${checks} iPhone WebKit entry checks, including a stalled module and repeated entry.`)
