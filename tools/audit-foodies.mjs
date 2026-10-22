/*
  BEASTY • FOODIES. Glenn, 2026-10-03: each foodie's page has "a drop-down list
  of Restaurant names with video clips of that restaurant", and "if a
  restaurant had five different foodies review it … will they be able to see
  the five different foodies that reviewed that restaurant on a list?"

  Checked from shared links, signed out, on a phone-sized page:
  - a foodie's page lists the places reviewed; one opens to its film and one
    to the business on BEASTY;
  - Grand-O's existing page carries @thesnacksensei's reviews;
  - a business reviewed twice lists both reviewers, and a row leads to the
    foodie's page.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('foodies')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const log = openSync(`/tmp/audit-foodies-${port}.log`, 'w')
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: ['ignore', log, log], env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' } })
const base = `http://localhost:${port}`
let up = false
for (let i = 0; i < 120 && !up; i++) { try { up = (await fetch(base + '/api/health')).ok } catch { await new Promise((r) => setTimeout(r, 250)) } }
if (!up) { console.log('FAIL: server never came up'); srv.kill(); process.exit(1) }

const b = await chromium.launch()
const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }
const p = await b.newPage({ viewport: { width: 393, height: 852 } })
const open = async (id) => {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('.brand-body', { timeout: 20000 }).catch(() => {})
  await p.waitForTimeout(600)
}
const rows = () => p.evaluate(() => [...document.querySelectorAll('.foodie-review-head strong')].map((x) => x.textContent?.trim()))
const heading = () => p.evaluate(() => document.querySelector('.foodie-reviews-h')?.textContent?.trim() ?? null)
const row = (name) => p.locator('.foodie-review-head', { hasText: name }).first()

// ---- a foodie's page ------------------------------------------------------
await open('b_foodiefestusfeasts')
const festus = await rows()
step("a foodie's page lists the places reviewed", (await heading()) === 'Their reviews' && festus.includes('Cali Alley') && festus.includes('Terracotta Warriors') && festus.length >= 4, festus.join(' | '))
await row('Terracotta Warriors').click()
const film = await p.evaluate(() => document.querySelector('.foodie-review.is-open video')?.getAttribute('src') ?? null)
step('a place not on BEASTY opens to the film', film === '/clips/review-DduKTl4hokY.mp4', `${film}`)
step('with the post on Instagram beside it', (await p.locator('.foodie-review.is-open a[href*="instagram.com/reel/DduKTl4hokY"]').count()) === 1)
await row('Cali Alley').click()
const toBiz = p.locator('.foodie-review.is-open button', { hasText: 'Open Cali Alley on BEASTY' })
step('a place on BEASTY offers its page', (await toBiz.count()) === 1)
await toBiz.click()
await p.waitForTimeout(1500)
const title = await p.evaluate(() => [...document.querySelectorAll('.nav-title, .app-chrome-title, h1')].map((x) => x.textContent?.trim()).find((t) => t && /Cali Alley/.test(t)) ?? document.title)
step('and goes there', /Cali Alley/.test(title ?? ''), `${title}`)

// ---- Grand-O's existing page ----------------------------------------------
await open('b_grando')
const grando = await rows()
step("Grand-O's page carries @thesnacksensei's reviews", grando.includes('Hungry Cow') && grando.includes("Tony's Pizza Napoletana"), grando.join(' | '))

// ---- a business reviewed twice --------------------------------------------
await open('b_deliboard')
const deli = await rows()
step('a business reviewed twice lists both reviewers', (await heading()) === 'Foodie reviews' && deli.length === 2, deli.join(' | '))
await p.locator('.foodie-review-head').first().click()
const toFoodie = p.locator('.foodie-review.is-open button', { hasText: /page$/ })
step("a reviewer with a page links to it", (await toFoodie.count()) === 1, await toFoodie.first().textContent().catch(() => ''))

// ---- reviewed once: the page's own film is enough ------------------------------
await open('b_calialley')
step('a business reviewed once shows no list (its film is the review)', (await p.locator('.foodie-reviews').count()) === 0)

await b.close()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} step(s) — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: foodies list what they reviewed, businesses list who reviewed them, and each leads to the other.')
