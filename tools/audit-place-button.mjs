/*
  The button at the top right of a business page that goes to the page its
  tile is on. Glenn, 2026-09-23, with a mockup of The Une's page reading
  "Union City • Goods >" opposite "< Home": "a button that would go to the
  page that the spot is on rather than going to the main homescreen. This will
  be helpful for those that search a business and want to see the whole
  cities page that that business is in."

  Checked the way he meets it: a business opened from Search, not from its
  tile, so the home screen behind it is on some other page. Each case taps the
  real button and reads where the home screen landed from its current page
  dot ("Page 293 of 347, Union City, Services"), not from the label it tapped.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync, readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('place')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
/* The server's log is where a sign-in code lands when no mail is set up. */
const LOG = `/tmp/audit-place-${port}.log`
const log = openSync(LOG, 'w')
const srv = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', log, log], env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' } })
const base = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const b = await chromium.launch()
const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }

const page = async () => {
  const p = await b.newPage({ viewport: { width: 375, height: 812 } })
  return p
}
/* Where the home screen is, in its own words: the current page's dot carries
   "Page 293 of 347, Union City, Services" as its label. */
const where = (p) => p.evaluate(() => document.querySelector('[aria-current="page"][aria-label^="Page "]')?.getAttribute('aria-label') ?? null)
const waitWhere = async (p, want) => {
  for (let i = 0; i < 60; i++) {
    const w = await where(p)
    if (w && w.endsWith(want)) return w
    await p.waitForTimeout(250)
  }
  return await where(p)
}

/* Open a business from its own link, which is what arriving from Search is to
   the home screen: it stays on whatever page it was. */
const open = async (p, id) => {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('.nav-place', { timeout: 20000 }).catch(() => {})
}
const label = (p) => p.evaluate(() => document.querySelector('.nav-place')?.textContent?.trim() ?? null)

const cases = [
  ['a Goods seat', 'b_zadnagrill', 'Redwood City • Goods', 'Redwood City, Goods'],
  ['a Services seat', 'b_thecompanybarber', 'Fremont • Services', 'Fremont, Services'],
  ['a yellow sheet', 'b_goldbeandurant', 'Berkeley • More goods', 'Berkeley, More goods'],
  ['BEASTY only', 'b_siacollective', 'BEASTY • Online', 'BEASTY, Online'],
  /* 2026-09-30: BEASTY's first sheet is Eats, and a new Goods sheet for boutiques follows it. */
  ['BEASTY Eats', 'b_topdog', 'BEASTY • Eats', 'BEASTY, Eats'],
  ['the new BEASTY Goods', 'b_elemonkey', 'BEASTY • Goods', 'BEASTY, Goods'],
  ['moved to BEASTY Services', 'b_bustdowncobeasty', 'BEASTY • Services', 'BEASTY, Services'],
]
for (const [what, id, want, lands] of cases) {
  const p = await page()
  await open(p, id)
  const l = await label(p)
  step(`${what}: the button names its page`, l === want, `${l}`)
  const rows = await p.evaluate(() => document.querySelectorAll('.brand-city').length)
  step(`${what}: no city rows on a one-city page`, rows === 0, `${rows} rows`)
  if (l) {
    await p.click('.nav-place')
    const w = await waitWhere(p, lands)
    step(`${what}: it lands on that page`, !!w && w.endsWith(lands), `${w}`)
  }
  await p.close()
}

/* A business in seven cities: the button names the first in his city order
   and a row per city stays under the address. */
{
  const p = await page()
  await open(p, 'b_butterpecan')
  const l = await label(p)
  const rows = await p.evaluate(() => [...document.querySelectorAll('.brand-city strong')].map((s) => s.textContent.trim()))
  step('several cities: the button names one of them', !!l && / • /.test(l), `${l}`)
  step('several cities: a row for each', rows.length >= 2, rows.join(' | '))
  await p.close()
}

/* The long case must not push the bar off a phone: the longest name on a
   yellow sheet, with the bar collapsed so the title shows between them. */
{
  const p = await page()
  await open(p, 'b_goldenbayseafoodharbor')
  await p.evaluate(() => { const s = document.querySelector('.nav-scroll'); if (s) s.scrollTop = 600 })
  await p.waitForTimeout(500)
  const fit = await p.evaluate(() => {
    const row = document.querySelector('.nav-bar-row')
    const btn = document.querySelector('.nav-place')
    const back = document.querySelector('.nav-back')
    if (!row || !btn || !back) return null
    const r = row.getBoundingClientRect(), bb = btn.getBoundingClientRect(), kb = back.getBoundingClientRect()
    return { inside: bb.right <= r.right + 0.5 && bb.left >= r.left - 0.5, apart: kb.right <= bb.left, rowOverflow: row.scrollWidth - row.clientWidth }
  })
  step('a long name fits the bar', !!fit && fit.inside && fit.apart && fit.rowOverflow <= 0, JSON.stringify(fit))
  await p.close()
}

/* HOME IS BEASTY • GOODS, from any business page. Glenn, 2026-09-24: "when
   you tap HOME on anyone's page it goes directly to BEASTY • Goods as the HOME
   page". Checked from the hardest case: a business opened from its own tile
   on its city page, where Home used to return to that city page. */
{
  const p = await page()
  await open(p, 'b_zadnagrill')
  await p.click('.nav-place')
  await waitWhere(p, 'Redwood City, Goods')
  await p.locator('button[aria-label^="Zadna Grill"]').first().click()
  await p.waitForSelector('.nav-back', { timeout: 20000 }).catch(() => {})
  await p.waitForTimeout(800)
  await p.click('.nav-back')
  const w = await waitWhere(p, 'BEASTY, Eats')
  step('Home goes to BEASTY • Eats (the first page), even from a city tile', !!w && /^Page 1 of \d+, BEASTY, Eats$/.test(w), `${w}`)
  await p.close()
}

/* His exact path: Search, a business, the button. Search is for members, so
   this one signs in first, the way the site does it. */
{
  const p = await page()
  await open(p, 'b_zadnagrill')
  const email = `place-${port}@audit.beastypages.dev`
  await p.evaluate((e) => fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Place Test', email: e }) }), email)
  let code
  for (let i = 0; i < 40 && !code; i++) {
    await p.waitForTimeout(250)
    code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
  }
  const signed = await p.evaluate(async ({ e, c }) => (await fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: e, code: c }) })).status, { e: email, c: code })
  step('a member signs in, so Search is open to them', signed < 300, `${signed}`)
  await open(p, 'b_zadnagrill')
  await p.click('.nav-back')
  await p.waitForTimeout(800)
  const before = await where(p)
  await p.locator('button', { hasText: /^Search$/ }).first().click()
  await p.fill('input[aria-label="Dishes, kitchens, cities"]', 'Zadna')
  await p.locator('.search-brand', { hasText: 'Zadna Grill' }).first().click()
  await p.waitForSelector('.nav-place', { timeout: 20000 }).catch(() => {})
  const l = await label(p)
  step('from Search: the page has the button', l === 'Redwood City • Goods', `${l}`)
  await p.click('.nav-place')
  const w = await waitWhere(p, 'Redwood City, Goods')
  step('from Search: it lands on the city page, not where Home would', !!w && w.endsWith('Redwood City, Goods') && w !== before, `${before} -> ${w}`)
  await p.close()
}

await b.close()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} step(s) — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: the button names the page its tile is on and lands there, from a link and from Search.')
