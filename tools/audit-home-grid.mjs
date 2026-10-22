/*
  The home screen's grid has room to breathe on every iPhone.

  Leon, 2026-09-23, looking at it on his phone: "on iPhone the app looks too
  tight". Measured in Safari's visible area, a 15 Pro drew five rows of 56px
  tiles with 6px between one row's labels and the next row's icons, while a 13
  mini drew four rows of 66px tiles with room around them: the bigger phone
  looked the more cramped. A home screen never shrinks its icons to fit one
  more row (Glenn's own words when icons first got small: "if needed remove
  the last row, so that it behaves like an iPhone home screen").

  So, at each size: the tiles are at least 60px, a label sits at least 12px
  above the next row's icon, and no label is cut off by the row below it.
  WebKit, with each phone's own Safari height, and the installed height too.
*/
import { webkit } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('grid')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: 'ignore', env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development' } })
const base = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const PHONES = [
  ['iPhone SE (3rd gen), Safari', 375, 548],
  ['iPhone 13 mini, Safari', 375, 629],
  ['iPhone 15 Pro, Safari', 393, 659],
  ['iPhone 15 Pro Max, Safari', 430, 739],
  ['iPhone 15 Pro, installed', 393, 852],
]
const fails = []
const b = await webkit.launch()
for (const [name, w, h] of PHONES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  /* Arrive on a business and press Home: the home screen, past the landing. */
  await p.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('.nav-back', { timeout: 20000 })
  await p.click('.nav-back')
  await p.waitForTimeout(1500)
  const m = await p.evaluate(() => {
    /* The page on screen: BEASTY • Goods, a city-style page of numbered spots. */
    const page = [...document.querySelectorAll('.home-page')]
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0)
      .sort((a, b) => Math.abs(a.r.left) - Math.abs(b.r.left))[0]?.el
    if (!page) return null
    const tiles = [...page.querySelectorAll('.icon-tile')].map((t) => t.getBoundingClientRect())
    const labels = [...page.querySelectorAll('.icon-label')].map((l) => l.getBoundingClientRect())
    if (tiles.length < 5) return { tiles: tiles.length }
    const rows = [...new Set(tiles.map((t) => Math.round(t.top)))].sort((a, b) => a - b)
    const firstRowLabelBottom = Math.max(...labels.filter((l, i) => Math.round(tiles[i]?.top) === rows[0]).map((l) => l.bottom))
    return { tiles: tiles.length, rows: rows.length, tile: Math.round(tiles[0].width), gap: rows[1] !== undefined ? Math.round(rows[1] - firstRowLabelBottom) : null }
  })
  if (!m || !m.rows) { fails.push(`${name}: no grid found (${JSON.stringify(m)})`); console.log('FAIL', name, JSON.stringify(m)); await ctx.close(); continue }
  const ok = m.tile >= 60 && (m.gap === null || m.gap >= 12)
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${name.padEnd(28)} ${m.rows} rows of ${m.tile}px tiles, ${m.gap}px from a label to the next row (${m.tiles} tiles)`)
  if (!ok) fails.push(`${name}: ${m.tile}px tiles, ${m.gap}px gap`)
  await ctx.close()
}
await b.close()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: on every iPhone the home grid keeps 60px tiles and at least 12px between rows.')
