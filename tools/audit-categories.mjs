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
/* node --import tsx, as the batch audits do: a bare 'npx' is npx.cmd on Windows and spawns ENOENT. */
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: ['ignore', log, log], env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' } })
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
/* One name per page, a page that runs on to a second screen counted once. */
const sections = run.map((l) => l?.replace(/^Page \d+ of \d+, BEASTY, /, '')).filter((x, i, a) => x !== a[i - 1])
/* 2026-10-05: BEASTY • Pages first (Glenn: "make the Home Screen BEASTY •
   Pages"), then the nine: Sweets after Eats, AYCE after Sweets, Whips renamed
   Automotive. */
/* And its yellow page, More pages, for the categories past the 24 tiles (Glenn, 2026-10-05). */
const want = ['Pages', 'More pages', 'Eats', 'Sweets', 'AYCE', 'Goods', 'Services', 'Online', 'Individuals', 'Tattoo', 'Automotive']
step('the home screen opens on BEASTY • Pages', (await where(p))?.endsWith('BEASTY, Pages'), await where(p))
step('then the nine category pages, in order', want.every((w, i) => sections[i] === w), sections.slice(0, 11).join(', '))
step('then the yellow sheets', sections.includes('More eats') && sections.includes('More services'), sections.slice(11).join(', '))
await goDot(p, await (async () => (await dots(p)).findIndex((l) => l.endsWith('BEASTY, More pages')))())
const more = await p.evaluate(() => [...(document.querySelector('.home-page:not([inert])')?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label')))
step('More pages holds the categories past the 24, then room for new ones', more.includes('BEASTY • Dancers') && more.includes('BEASTY • Media') && more.some((l) => /coming soon/.test(l)), more.slice(0, 7).join(' | '))
step('B•P is left of the gallery button and turns to BEASTY • Pages', (await p.locator('.spotlight-pages').count()) === 1)
await p.locator('.spotlight-pages').click()
step('B•P lands on BEASTY • Pages', !!(await waitWhere(p, 'BEASTY, Pages'))?.endsWith('BEASTY, Pages'))
const pagesAtHome = await total(p)
step('the whole swipe is short: no city pages in it', pagesAtHome > 0 && pagesAtHome <= 20, `${pagesAtHome} pages`)

// ---- a category page ------------------------------------------------------
const dotOf = async (name) => (await dots(p)).findIndex((l) => l.endsWith(`BEASTY, ${name}`))
/* BEASTY • Pages: a tile per category, each opening its page. */
const tiles = await p.evaluate(() => [...(document.querySelector('.home-page:not([inert])')?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label')))
step('BEASTY • Pages is a tile per category', tiles.length >= 12 && tiles.includes('BEASTY • Eats') && tiles.includes('BEASTY • Cafe'), `${tiles.length}: ${tiles.slice(0, 5).join(', ')} …`)
await shot(p, '0-pages')
/* Signed out, a tile on the swipe turns to its page; one off the swipe asks
   to sign up first, as Search does (checked again signed in, below). */
await p.locator('.home-page:not([inert]) button[aria-label="BEASTY • Tattoo"]').first().click()
const viaTile = await waitWhere(p, 'BEASTY, Tattoo')
step('a tile for a category on the swipe turns to its page', !!viaTile?.endsWith('BEASTY, Tattoo'), viaTile)
await goDot(p, 0)
await p.locator('.home-page:not([inert]) button[aria-label="BEASTY • Cafe"]').first().click()
await p.waitForTimeout(600)
step('signed out, a category off the swipe asks to sign up first', (await p.locator('.gate[role="dialog"]').count()) === 1)
await p.locator('.gate-scrim').first().click().catch(() => {})
await p.waitForTimeout(400)
await goDot(p, await dotOf('Eats'))
const eats = await p.evaluate(() => [...(document.querySelector('.home-page:not([inert])')?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label')))
/* Udon's open spot went to Empire State Pizza on Glenn's word (2026-10-21, "the
   open spots on BEASTY • Eats"), and Jamaican's to The Yard (2026-10-24, "bump
   them to BEASTY • Eats page in the empty spot"). */
step('BEASTY • Eats: one restaurant per cuisine, open ones named for theirs', eats.some((l) => /^Downtown BBQ/.test(l)) && eats.some((l) => /^The Yard/.test(l)) && eats.some((l) => /^Empire State/.test(l)) && !eats.some((l) => /^Midnite Theories|^Jazz Braids|^Cravingz/.test(l)), eats.slice(0, 6).join(' | '))
await goDot(p, await dotOf('Sweets'))
const sweets = await p.evaluate(() => [...(document.querySelector('.home-page:not([inert])')?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label')))
step('BEASTY • Sweets carries the dessert shops', sweets.some((l) => /^Meadowlark/.test(l)) && sweets.some((l) => /^Cravingz/.test(l)), sweets.slice(0, 6).join(' | '))
await goDot(p, await dotOf('Tattoo'))
step('BEASTY • Tattoo is on the swipe', (await where(p))?.endsWith('BEASTY, Tattoo'), await where(p))
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
step('an open spot opens Reserve a Spot', await p.locator('.ios-section-header', { hasText: 'What you get' }).count() > 0)
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
const back = await waitWhere(p, 'BEASTY, Pages')
step('Home goes back to BEASTY • Pages', !!back?.endsWith('BEASTY, Pages'), back)

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
await p.locator('.home-page:not([inert]) button[aria-label="BEASTY • Cafe"]').first().click()
const coffee = await waitWhere(p, 'BEASTY, Cafe')
step('signed in, a tile for a category off the swipe opens its page', !!coffee?.endsWith('BEASTY, Cafe'), coffee)
await openSearch()
step('Search has a Categories button and a Cities button', (await p.locator('.search-drop-btn', { hasText: 'Categories' }).count()) === 1 && (await p.locator('.search-drop-btn', { hasText: 'Cities' }).count()) === 1)
await p.locator('.search-drop-btn', { hasText: 'Categories' }).click()
const cats = await p.locator('#search-drop-categories .search-brand strong').allTextContents()
step('Categories lists every BEASTY page, including Games, Health/Beauty, Breakfast/Diner, FROYO, Catering and Steakhouse', cats.length === 49 && cats.includes('BEASTY • Games') && cats.includes('BEASTY • Health/Beauty') && cats.includes('BEASTY • Breakfast/Diner') && cats.includes('BEASTY • FROYO') && cats.includes('BEASTY • Catering') && cats.includes('BEASTY • Steakhouse') && cats.includes('BEASTY • Ramen') && cats.includes('BEASTY • Dim Sum') && cats.includes('BEASTY • Hot Pot') && cats.includes('BEASTY • BBQ') && cats.includes('BEASTY • Vegan') && cats.every((c) => c.startsWith('BEASTY • ')), `${cats.length}: ${cats.slice(0, 6).join(', ')} …`)
step('Search has a Share button', (await p.locator('.chrome-pill.is-share', { hasText: 'Share' }).count()) >= 1)
step('A to Z', cats.every((c, i) => i === 0 || cats[i - 1].localeCompare(c) <= 0))
const thumbs = await p.evaluate(() => [...document.querySelectorAll('#search-drop-categories .search-cat-thumb .cat-icon')].filter((t) => /url\(/.test(t.style.backgroundImage)).length)
step('each with a piece of its background', thumbs === cats.length, `${thumbs} of ${cats.length}`)
await shot(p, '3-categories')
await p.locator('#search-drop-categories .search-brand', { hasText: 'BEASTY • Ramen' }).click()
step('Ramen opens from Categories', (await waitWhere(p, 'BEASTY, Ramen'))?.endsWith('BEASTY, Ramen'))
const ramenTiles = await p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a => a.map(x => x.getAttribute('aria-label')))
step('Ramen holds nine shops including Garlic High', ramenTiles.filter(t => !/spot available/.test(t)).length === 9 && ramenTiles.some(t => /Garlic High/.test(t)), ramenTiles.join(' | '))
step('Ramen draws its own wallpaper', /cat-ramen\.webp/.test(await wallIs(p, /cat-ramen\.webp/)))
await openSearch()
await p.locator('.search-drop-btn', { hasText: 'Categories' }).click()
await p.locator('#search-drop-categories .search-brand', { hasText: 'BEASTY • Dim Sum' }).click()
step('Dim Sum opens from Categories', (await waitWhere(p, 'BEASTY, Dim Sum'))?.endsWith('BEASTY, Dim Sum'))
const dimsumTiles = await p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a => a.map(x => x.getAttribute('aria-label')))
step('Dim Sum holds twelve shops including Din Ding and Taste of Shaxian', dimsumTiles.filter(t => !/spot available/.test(t)).length === 12 && dimsumTiles.some(t => /Din Ding/.test(t)) && dimsumTiles.some(t => /Taste of Shaxian/.test(t)))
step('Dim Sum draws its own wallpaper', /cat-dimsum\.webp/.test(await wallIs(p, /cat-dimsum\.webp/)))
for (const [heading,kind,label] of [['Hot Pot','hotpot','Mumu'],['BBQ','bbq','Wooga'],['Vegan','vegan','Laughing Monk']]) {
 await openSearch()
 await p.locator('.search-drop-btn', {hasText:'Categories'}).click()
 await p.locator('#search-drop-categories .search-brand', {hasText:'BEASTY • '+heading}).click()
 step(heading+' opens from Categories', (await waitWhere(p, 'BEASTY, '+heading))?.endsWith('BEASTY, '+heading))
 const tiles=await p.locator('.home-page:not([inert]) .home-grid button[aria-label]').evaluateAll(a=>a.map(x=>x.getAttribute('aria-label')))
 step(heading+' includes '+label,tiles.some(t=>t.includes(label)))
 step(heading+' draws its own wallpaper',(await wallIs(p,new RegExp('cat-'+kind+'\\.webp'))).includes('cat-'+kind+'.webp'))
}
await openSearch()
await p.locator('.search-drop-btn', { hasText: 'Categories' }).click()
await p.locator('#search-drop-categories .search-brand', { hasText: 'BEASTY • Realtors' }).click()
const realtors = await waitWhere(p, 'BEASTY, Realtors')
step('a category not on the home screen opens from the list', !!realtors?.endsWith('BEASTY, Realtors'), realtors)
const realtorTiles = await p.evaluate(() => [...(document.querySelector('.home-page:not([inert])')?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label')))
step('with its businesses on it', realtorTiles.some((l) => /Claire Anderson|1850 Properties/.test(l)), realtorTiles.slice(0, 3).join(' | '))
const realtorWall = await wallIs(p, /cat-realtors\.webp/)
step('and its own background', /cat-realtors\.webp/.test(realtorWall), realtorWall)
await shot(p, '4-realtors')

/* Glenn, 2026-10-05: "place these cars from the center and work your way out
   & also put Meter SF in the center". The centre is seat 9, the third row's
   second tile; the next car sits beside it. */
await openSearch()
await p.locator('.search-drop-btn', { hasText: 'Categories' }).click()
await p.locator('#search-drop-categories .search-brand', { hasText: 'BEASTY • Whips' }).click()
const whips = await waitWhere(p, 'BEASTY, Whips')
step('BEASTY • Whips opens from the list', !!whips?.endsWith('BEASTY, Whips'), whips)
const whipTiles = await p.evaluate(() => [...(document.querySelector('.home-page:not([inert])')?.querySelectorAll('.home-grid button[aria-label]') ?? [])].map((x) => x.getAttribute('aria-label')))
step('MeterSF sits in the centre of Whips, MrCheeze408 beside it', /^MeterSF/.test(whipTiles[9] ?? '') && /^MrCheeze408/.test(whipTiles[10] ?? ''), `9: ${whipTiles[9]} | 10: ${whipTiles[10]}`)
step('and the spots round them are open', whipTiles.slice(0, 9).every((l) => /spot available/.test(l ?? '')), whipTiles.slice(0, 2).join(' | '))
await p.waitForTimeout(1200)
await shot(p, '4b-whips')

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

for (const query of ['dumplings', 'dim sum']) {
  await p.fill('input[aria-label="Dishes, businesses, categories, cities"]', query)
  await p.waitForTimeout(400)
  step(`"${query}" finds Dim Sum`, (await p.locator('.search-brand.is-cat strong').allTextContents()).includes('BEASTY • Dim Sum'))
}
await p.locator('.search-brand.is-cat', { hasText: 'BEASTY • Dim Sum' }).click()
step('the dim sum search result opens Dim Sum', (await waitWhere(p, 'BEASTY, Dim Sum'))?.endsWith('BEASTY, Dim Sum'))

await b.close()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} step(s) — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: nine category pages on the home screen, every category and city from Search.')
