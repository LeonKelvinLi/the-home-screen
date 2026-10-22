/* The signed-out gate: six doors shut, the directory still open.

   His "New Users" note is the spec — a visitor keeps the first two flagship
   pages and every business on them, and six controls raise the sign-up prompt.
   Both halves matter equally: a gate that also shut the 48 business tiles would
   pass a "is it locked" test and destroy the thing the app is for. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
const TESTDB = await freshTestDb('gate')
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
for (const f of ['/tmp/gate.db','/tmp/gate.db-wal','/tmp/gate.db-shm']) { try { rmSync(f,{force:true}) } catch {} }
const srv=spawn(process.execPath,['--import','tsx','server/index.ts'],{stdio:'ignore',env:{...process.env,PORT:String(port),DATABASE_URL: TESTDB.url,ALLOW_MOCK_PAYMENTS:'1',NODE_ENV:'development'}})
const base=`http://localhost:${port}`
for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
await p.goto(base,{waitUntil:'networkidle'})
await p.click('[aria-label="Enter BEASTY"]'); await p.waitForTimeout(2600)

const gateShows = async (sel,label) => {
  await p.click(sel).catch(()=>{})
  await p.waitForTimeout(500)
  const up = await p.$('.gate-card')
  console.log(`  ${label.padEnd(22)} prompt: ${up?'YES':'no'}`)
  if (up) await p.click('.gate-later')
  await p.waitForTimeout(300)
  return !!up
}
console.log('SIGNED OUT — the six doors, and the one that is not a door:')
const r = {}
r.cities = await gateShows('.page-step.is-next','right arrow')
r.watch  = await gateShows('[aria-label*="Watch"]','watch tab')
r.gallery= await gateShows('.spotlight-glass.is-gallery','gallery tab')
r.dock   = await gateShows('.dock-switch-btn:nth-child(2)','dock 2')
r.search = await gateShows('.spotlight','search bar')
/*
  A GATED DOCK BUTTON, NAMED RATHER THAN COUNTED.

  This was `.dock .icon-tile`, the first tile in the row — which was true until
  2026-08-28, when his revised order put News in slot 1 and News is the one
  tile in that row he asked to be public. The audit then reported the app
  broken for doing exactly what he asked.

  Profile is the gated one it tests now, and News gets its own assertion below,
  so both of his rules are held rather than one of them being an accident of
  which tile happens to be first.
*/
r.lower  = await gateShows('[aria-label="Profile"]','a lower dock button')

/*
  "This will be public for all users and affiliates to view." News is the
  exception in that row and it has to STAY the exception: a gate that creeps
  back onto it puts the one page built to bring people back daily behind the
  thing it exists to sell.
*/
await p.click('[aria-label="News"]').catch(()=>{})
await p.waitForTimeout(700)
r.newsOpen = !(await p.$('.gate-card')) && !!(await p.$('.news-feed, .news-calendar'))
console.log(`  ${'News is public'.padEnd(22)} opens: ${r.newsOpen?'YES':'no'}`)
const backHome = await p.$('button:has-text("Home")')
if (backHome) { await backHome.click(); await p.waitForTimeout(800) }

console.log('\nSIGNED OUT — what must STILL work:')
const tiles = await p.$$('.home-page .icon-tile')
console.log('  business tiles on page 1:', tiles.length)
await p.click('.home-page .icon-tile'); await p.waitForTimeout(900)
console.log('  a business page opens:', await p.evaluate(()=>!!document.querySelector('.brand-body')))
await b.close(); srv.kill()
const missed = Object.entries(r).filter(([,v])=>!v).map(([k])=>k)
const openTiles = tiles.length
if (missed.length) { console.log(`\nFAIL: no prompt on ${missed.join(', ')}`); process.exit(1) }
if (openTiles < 40) { console.log(`\nFAIL: only ${openTiles} business tiles reachable signed out`); process.exit(1) }
console.log('\nPASS: six doors gated, the directory still open.')
