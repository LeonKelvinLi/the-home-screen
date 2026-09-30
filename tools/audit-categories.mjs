/*
  THE BEASTY CATEGORY PAGES. Glenn, 2026-09-30:

    "we will limit the amount of pages on the home screen to let's say 9
    categories … all of these extra categories are searchable. As soon as they
    tap on one particular category, their search for that page will pop up.
    You won't be able to scroll for cities unless you just search for that city
    to get on that page."
    "Once all these extra BEASTY pages are made, create a category button on
    the search page to list them all."

  Checked in a phone-sized browser against a fresh test database:
  - the swipe holds the nine category pages and the yellow sheets, no cities;
  - a category page draws its own background and its businesses, with open
    spots that open Reserve for that page;
  - a city comes into the swipe only when visited, and Home takes it out again;
  - Search's Categories and Cities drop-downs list them all and land on the
    page picked, and typing a category finds it.

  CAT_SHOTS=<dir> saves screenshots along the way.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync, readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('categories')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-categories-${port}.log`
const log = openSync(LOG, 'w')
const srv = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', log, log], env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' } })
const base = `http://localhost:${port}`
let up = false
for (let i = 0; i < 120 && !up; i++) { try { up = (await fetch(base + '/api/health')).ok } catch { await new Promise((r) => setTimeout(r, 250)) } }
if (!up) { console.log('FAIL: server never came up'); srv.kill(); process.exit(1) }

const SHOTS = process.env.CAT_SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const shot = async (p, name) => { if (SHOTS) await p.screenshot({ path: `${SHOTS}/${name}.png` }) }

const b = await chromium.launch()
const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }

/* Every page in the swipe, as its dot names it: "Page 6 of 13, BEASTY, Tattoo". */
const dots = (p) => p.evaluate(() => [...document.querySelectorAll('.page-dots .dot')].map((d) => d.getAttribute('aria-label')))
const where = (p) => p.evaluate(() => document.querySelector('.page-dots [aria-current="page"]')?.getAttribute('aria-label') ?? null)
const total = async (p) => Number(/ of (\d+)/.exec((await where(p)) ?? '')?.[1] ?? 0)
const waitWhere = async (p, want) => {
  for (let i = 0; i < 60; i++) {
    const w = await where(p)
    if (w && w.endsWith(want)) return w
    await p.waitForTimeout(250)
  }
  return await where(p)
}
/* The wallpaper cross-fades (Wallpaper.tsx, 900ms after the picture decodes),
   so wait for the base layer to become the one asked for. */
const wallIs = async (p, re) => {
  let w = ''
  for (let i = 0; i < 40; i++) {
    w = await p.evaluate(() => document.querySelector('.home-wallpaper-layer')?.style.backgroundImage ?? '')
    if (re.test(w)) return w
    await p.waitForTimeout(250)
  }
  return w
}
const goDot = async (p, i) => {
  await p.evaluate((n) => document.querySelectorAll('.page-dots .dot')[n]?.click(), i)
  await p.waitForTimeout(700)
}
const toHome = async (p) => {
  await p.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('.nav-back', { timeout: 20000 }).catch(() => {})
  await p.click('.nav-back')
  await p.waitForTimeout(900)
}

const p = await b.newPage({ viewport: { width: 393, height: 852 } })
await toHome(p)

// ---- the swipe ------------------------------------------------------------
const run = await dots(p)
const sections = run.map((l) => l?.replace(/^Page \d+ of \d+, BEASTY, /, ''))
const want = ['Eats', 'Goods', 'Services', 'Online', 'Individuals', 'Tattoo', 'Whips', 'Gyms', 'Salons']
step('the home screen opens on BEASTY • Eats', (await where(p))?.endsWith('BEASTY, Eats'), await where(p))
step('nine category pages, in order', want.every((w, i) => sections[i] === w), sections.slice(0, 9).join(', '))
step('then the yellow sheets', sections.includes('More eats') && sections.includes('More services'), sections.slice(9).join(', '))
const pagesAtHome = await total(p)
step('the whole swipe is short: no city pages in it', pagesAtHome > 0 && pagesAtHome <= 20, `${pagesAtHome} pages`)

// ---- a category page ------------------------------------------------------
await goDot(p, 5)
step('page six is BEASTY • Tattoo', (await where(p))?.endsWith('BEASTY, Tattoo'), await where(p))
const tattoo = await p.evaluate(() => {
  const page = [...document.querySelectorAll('.home-page')].find((el) => !el.hasAttribute('inert'))
  const icons = [...(page?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label'))
  return { heading: page?.querySelector('.home-page-city')?.textContent, icons }
})
tattoo.wall = await wallIs(p, /cat-tattoo\.webp/)
step('it says so at the top', tattoo.heading === 'BEASTY · Tattoo', tattoo.heading)
step('it draws its own background', /cat-tattoo\.webp/.test(tattoo.wall), tattoo.wall)
step('it holds tattoo studios from across the Bay', tattoo.icons.some((l) => /Old Crow/.test(l)) && tattoo.icons.some((l) => /Black Crown/.test(l)), tattoo.icons.slice(0, 8).join(' | '))
const blanks = tattoo.icons.filter((l) => /^Tattoo — spot available/.test(l)).length
step('the rest of its twenty-four are open spots for Tattoo', tattoo.icons.length === 24 && blanks >= 1, `${tattoo.icons.length} tiles, ${blanks} open`)
await shot(p, '1-tattoo')
await p.locator('.home-page:not([inert]) .home-grid button[aria-label^="Tattoo — spot available"]').first().click()
await p.waitForTimeout(1200)
step('an open spot opens Reserve a Spot', await p.locator('.reserve-lead').count() > 0)
await p.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
await p.waitForSelector('.nav-place', { timeout: 20000 }).catch(() => {})

// ---- a city comes in when visited, and goes when you go home ---------------
await p.click('.nav-place')
const landed = await waitWhere(p, 'Redwood City, Goods')
step('a business page\'s place button still lands on its city page', !!landed?.endsWith('Redwood City, Goods'), landed)
const cityRun = await dots(p)
step('the city\'s own pages are its dots', cityRun.length >= 4 && cityRun.every((l) => / Redwood City, /.test(l)), cityRun.map((l) => l.replace(/^Page \d+ of \d+, /, '')).join(' | '))
step('the city is added to the end of the swipe', (await total(p)) > pagesAtHome, `${pagesAtHome} -> ${await total(p)}`)
await shot(p, '2-redwood-city')
await p.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
await p.waitForSelector('.nav-back', { timeout: 20000 }).catch(() => {})
await p.click('.nav-back')
const back = await waitWhere(p, 'BEASTY, Eats')
step('Home goes back to BEASTY • Eats', !!back?.endsWith('BEASTY, Eats'), back)

// ---- Search, signed in -----------------------------------------------------
const email = `categories-${port}@audit.beastypages.dev`
await p.evaluate((e) => fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Category Test', email: e }) }), email)
let code
for (let i = 0; i < 40 && !code; i++) {
  await p.waitForTimeout(250)
  code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
}
const signed = await p.evaluate(async ({ e, c }) => (await fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: e, code: c }) })).status, { e: email, c: code })
step('a test member signs in, so Search opens', signed < 300, `${signed}`)
await toHome(p)
step('the city is gone from the swipe again', (await total(p)) === pagesAtHome, `${await total(p)} pages`)

const openSearch = async () => {
  await p.locator('button', { hasText: /^Search$/ }).first().click()
  await p.waitForSelector('.search-drops', { timeout: 10000 }).catch(() => {})
  await p.waitForTimeout(500)
}
await openSearch()
step('Search has a Categories button and a Cities button', (await p.locator('.search-drop-btn', { hasText: 'Categories' }).count()) === 1 && (await p.locator('.search-drop-btn', { hasText: 'Cities' }).count()) === 1)
await p.locator('.search-drop-btn', { hasText: 'Categories' }).click()
const cats = await p.locator('#search-drop-categories .search-brand strong').allTextContents()
step('Categories lists every BEASTY page', cats.length === 26 && cats.every((c) => c.startsWith('BEASTY • ')), `${cats.length}: ${cats.slice(0, 6).join(', ')} …`)
step('A to Z', cats.every((c, i) => i === 0 || cats[i - 1].localeCompare(c) <= 0))
const thumbs = await p.evaluate(() => [...document.querySelectorAll('#search-drop-categories .search-cat-thumb')].filter((t) => /url\(/.test(t.style.backgroundImage)).length)
step('each with a piece of its background', thumbs === cats.length, `${thumbs} of ${cats.length}`)
await shot(p, '3-categories')
await p.locator('#search-drop-categories .search-brand', { hasText: 'BEASTY • Realtors' }).click()
const realtors = await waitWhere(p, 'BEASTY, Realtors')
step('a category not on the home screen opens from the list', !!realtors?.endsWith('BEASTY, Realtors'), realtors)
const realtorTiles = await p.evaluate(() => [...(document.querySelector('.home-page:not([inert])')?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label')))
step('with its businesses on it', realtorTiles.some((l) => /Claire Anderson|1850 Properties/.test(l)), realtorTiles.slice(0, 3).join(' | '))
const realtorWall = await wallIs(p, /cat-realtors\.webp/)
step('and its own background', /cat-realtors\.webp/.test(realtorWall), realtorWall)
await shot(p, '4-realtors')

await openSearch()
await p.locator('.search-drop-btn', { hasText: 'Cities' }).click()
const cities = await p.locator('#search-drop-cities .search-brand strong').allTextContents()
step('Cities lists every city, A to Z', cities.length >= 40 && cities.includes('Oakland') && cities.every((c, i) => i === 0 || cities[i - 1].localeCompare(c) <= 0), `${cities.length} cities`)
await p.locator('#search-drop-cities .search-brand', { hasText: /^Oakland/ }).first().click()
const oak = await waitWhere(p, 'Oakland, Goods')
step('a city from the list lands on its first page', !!oak?.endsWith('Oakland, Goods'), oak)

await openSearch()
await p.fill('input[aria-label="Dishes, businesses, categories, cities"]', 'tattoo')
await p.waitForTimeout(400)
const hits = await p.locator('.search-brand.is-cat strong').allTextContents()
step('typing "tattoo" finds the category first', hits[0] === 'BEASTY • Tattoo', hits.join(', '))
await shot(p, '5-typed')
await p.locator('.search-brand.is-cat', { hasText: 'BEASTY • Tattoo' }).click()
const tt = await waitWhere(p, 'BEASTY, Tattoo')
step('and lands on it, on the home screen', !!tt?.endsWith('BEASTY, Tattoo') && (await total(p)) === pagesAtHome, `${tt}`)

await openSearch()
await p.fill('input[aria-label="Dishes, businesses, categories, cities"]', 'djs')
await p.waitForTimeout(400)
step('"djs" finds DJ\'s', (await p.locator('.search-brand.is-cat strong').allTextContents()).includes("BEASTY • DJ's"))

await b.close()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} step(s) — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: nine category pages on the home screen, every category and city from Search.')
