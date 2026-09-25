/*
  Glenn's four asks of 2026-09-25, from his Notes:
    1. "Put a moving glow on the search bar like the share button"
    2. "Make the 'sign in' button flip back-and-forth to 'sign up - sign in'
       just like the enter button"
    3. "Make all the icons on the landing page spin just a tiny bit slower"
    4. "When users 1st visit the Home Screen, after a few seconds have a
       context bubble appear", in his words.

  The bubble skips automated browsers so it never sits over the tiles other
  checks tap; this one tells the page it is not automated to see it.
  LANDING_SHOTS=<dir> saves screenshots.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('landingasks')
const port = await new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const LOG = `/tmp/audit-landing-asks-${port}.log`
const srv = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', openSync(LOG, 'w'), openSync(LOG, 'a')], env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', RESEND_API_KEY: '' } })
const base = `http://localhost:${port}`
for (let i = 0; i < 160; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }
const SHOTS = process.env.LANDING_SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail !== '' ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
/* A person, not a script: the bubble is for first-time visitors. */
await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }))
const p = await ctx.newPage()
const errors = []
p.on('pageerror', (e) => errors.push(e.message))

/* ---------------------------------------------------- the landing page */
await p.goto(base + '/', { waitUntil: 'domcontentloaded' })
await p.waitForSelector('[aria-label="0. SIGN IN"]', { timeout: 30000 })
await wait(2500)
const landing = await p.evaluate(() => {
  const key = document.querySelector('[aria-label="0. SIGN IN"]')
  const flip = key?.querySelector('.dialer-key-flip')
  const cs = flip && getComputedStyle(flip)
  const enter = getComputedStyle(document.querySelector('.dialer-call-flip'))
  const digit = getComputedStyle(document.querySelector('.dialer-key-digit'))
  return {
    words: [flip?.querySelector('.is-word')?.textContent, key?.querySelector('.dialer-key-sub')?.textContent],
    icon: !!flip?.querySelector('.is-icon svg'),
    anim: cs && `${cs.animationName} ${cs.animationDuration} ${cs.animationDelay} ${cs.animationIterationCount}`,
    enter: `${enter.animationName} ${enter.animationDuration} ${enter.animationDelay}`,
    spin: `${digit.animationName} ${digit.animationDuration}`,
  }
})
step('the Sign in key flips from its icon to SIGN UP, over its SIGN IN label', landing.icon && landing.words.join('/') === 'SIGN UP/SIGN IN', landing.words.join('/'))
step('it flips like ENTER: the same six-second flip, half a cycle apart', landing.anim === 'call-flip 6s -3s infinite' && landing.enter.startsWith('call-flip 6s'), `${landing.anim} | enter ${landing.enter}`)
step('the landing icons spin a little slower: 760ms, up from 620ms', landing.spin === 'key-spin 0.76s', landing.spin)
if (SHOTS) await p.screenshot({ path: `${SHOTS}/1-landing.png` })
/* Mid-flip frame: the words showing. */
await p.evaluate(() => { const f = document.querySelector('.dialer-key-flip'); f.style.animation = 'none'; f.style.transform = 'rotateY(180deg)' })
await wait(200)
if (SHOTS) await p.screenshot({ path: `${SHOTS}/2-landing-sign-up.png` })
await p.evaluate(() => { const f = document.querySelector('.dialer-key-flip'); f.style.animation = ''; f.style.transform = '' })

/* ------------------------------------------------------- the home screen */
await p.click('.dialer-call')
await p.waitForSelector('.spotlight', { timeout: 30000 })
const sweep = await p.evaluate(() => {
  const s = document.querySelector('.spotlight .spotlight-sweep')
  const a = s && getComputedStyle(s, '::after')
  const hit = getComputedStyle(document.querySelector('.spotlight'), '::after')
  return { anim: a && `${a.animationName} ${a.animationDuration}`, clipped: s && getComputedStyle(s).clipPath, hit: hit.height }
})
step('Search has the moving glow, the same sweep as Share & Scan, clipped to the pill', sweep.anim === 'clip-sweep 4.2s' && /inset/.test(sweep.clipped || ''), JSON.stringify(sweep))
step('and its tap area is still 44px tall', sweep.hit === '44px', sweep.hit)
await wait(1500)
step('no bubble in the first seconds', (await p.locator('.home-hint').count()) === 0)
await p.waitForSelector('.home-hint', { timeout: 6000 }).catch(() => {})
const bubble = await p.evaluate(() => {
  const h = document.querySelector('.home-hint')
  const s = document.querySelector('.spotlight')
  if (!h || !s) return null
  const hr = h.getBoundingClientRect(), sr = s.getBoundingClientRect()
  return { text: h.innerText, above: hr.bottom <= sr.top, inside: hr.left >= 0 && hr.right <= innerWidth }
})
step('after a few seconds the bubble appears, in his words', !!bubble && /Type the city in the search bar below/.test(bubble.text) && /Just Tap Away\.™/.test(bubble.text), bubble?.text.replace(/\n+/g, ' / ').slice(0, 90))
step('above the Search pill it points at, inside the screen', !!bubble && bubble.above && bubble.inside, JSON.stringify(bubble && { above: bubble.above, inside: bubble.inside }))
if (SHOTS) await p.screenshot({ path: `${SHOTS}/3-home-bubble.png` })
await p.click('.home-hint-close')
await wait(300)
step('Close takes it away', (await p.locator('.home-hint').count()) === 0)
await p.reload({ waitUntil: 'domcontentloaded' })
await p.waitForSelector('.spotlight', { timeout: 30000 })
await wait(4500)
step('and it does not come back on the next visit', (await p.locator('.home-hint').count()) === 0)
step('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '))

/* An automated browser never sees it, so it never covers the tiles other checks tap. */
const bot = await b.newPage({ viewport: { width: 393, height: 852 } })
await bot.goto(base + '/?b=b_zadnagrill', { waitUntil: 'domcontentloaded' })
await bot.waitForSelector('.nav-back', { timeout: 30000 })
await bot.click('.nav-back')
await wait(4500)
step('an automated browser is not shown the bubble', (await bot.locator('.home-hint').count()) === 0)

await b.close()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} — ${fails.join('; ')}`); process.exit(1) }
console.log("\nPASS: Glenn's four asks of 25 September hold: the Sign in flip, the slower spin, the glow on Search and the first-visit bubble.")
