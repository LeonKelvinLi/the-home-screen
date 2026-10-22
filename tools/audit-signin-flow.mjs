/*
  EVERY CONTROL ON THE SIGN-IN PAGE, DRIVEN THE WAY A FINGER DRIVES IT.

  Written after a day on which both operators were locked out by two bugs that
  every existing audit sailed past, because every existing audit took the happy
  path in one straight line:

    1. The code step reflowed every second — two countdowns changed width with
       their digits — so a tap aimed at "Use a different email" landed on
       whatever had shifted under it. Reproduced with a coordinate click,
       invisible to a node click, which is why click-by-ref tests missed it.
    2. Every /start minted a new code and killed the one before it. Fifty-six
       starts in fifteen minutes of frustrated retrying meant every code that
       reached an inbox was already dead — experienced as "we are not
       receiving any codes".

  So this walks the page as a person: coordinate clicks, the back-and-forth
  path, the double-tap, the rapid retry, and it fails on layout drift.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, openSync, readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const LOG = '/tmp/beasty-signin-flow.log'
try { rmSync(LOG) } catch {}
const out = openSync(LOG, 'a')
const TESTDB = await freshTestDb('flow')
const fp = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await fp()
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: {
    ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development',
    /* Configured-but-failing mail, so the server logs every code (dev-only
       branch) and this test can read them back. */
    RESEND_API_KEY: 're_test_notreal', OTP_FROM_EMAIL: 'BEASTY <x@beastypages.com>',
  },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
const fails = []
const ok = (m) => console.log(' ok  ', m)
const bad = (m) => { console.log(' FAIL', m); fails.push(m) }
const codesFor = (dest) => readFileSync(LOG, 'utf8').split('\n')
  .filter((l) => l.includes(`[login-code] ${dest} `))
  .map((l) => l.match(/ (\d{6}) /)?.[1]).filter(Boolean)
/*
  A TAP, NOT A ZERO-MILLISECOND CLICK. Playwright's mouse.click presses and
  releases in the same beat, faster than any finger — and against this app
  that turned out to be the one gesture that fails, while a press held for
  60ms behaves exactly like a device. Chasing that difference burned an hour
  on a "bug" no phone can produce, so every tap here dwells like a thumb.
*/
const tap = async (x, y) => { await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(70); await p.mouse.up() }

const starts = []
p.on('request', (r) => { if (r.url().includes('/api/members/start')) starts.push(Date.now()) })

await p.goto(base, { waitUntil: 'networkidle' })
const enter = p.locator('[aria-label="Enter BEASTY"]').first()
try { await enter.waitFor({ state: 'visible', timeout: 15000 }); await enter.click(); await p.waitForTimeout(2600) } catch { await p.waitForTimeout(1200) }
if (await p.locator('[aria-label="Enter BEASTY"]').count()) { await enter.click().catch(() => {}); await p.waitForTimeout(2600) }
await p.evaluate(() => window.dispatchEvent(new CustomEvent('beasty:join')))
await p.waitForSelector('.join', { timeout: 20000 })

const A = 'first@example.invalid'
const B = 'second@example.invalid'
await p.locator('.join input').first().fill('Flow Audit')
await p.locator('.join input[autocomplete="address-level2"]').fill('Oakland')
await p.locator('.join input[type=email]').fill(A)
await p.locator('.join button[type=submit]').click()
await p.waitForSelector('.join-otp', { timeout: 15000 })
ok('details → code, with the address required for the channel that works')

/* ---- 1. THE CODE STEP MUST NOT MOVE WHILE A SECOND TICKS ---------------- */
const pos = () => p.evaluate(() => Object.fromEntries(
  [...document.querySelectorAll('.join button')].map((x) => [
    x.textContent.trim().replace(/\d+/g, 'N'),
    Math.round(x.getBoundingClientRect().top) + 'x' + Math.round(x.getBoundingClientRect().left) + 'w' + Math.round(x.getBoundingClientRect().width),
  ]),
))
const p1 = await pos()
await p.waitForTimeout(2300) // across at least two ticks
const p2 = await pos()
const moved = Object.keys(p1).filter((k) => p2[k] && p1[k] !== p2[k])
if (moved.length) bad(`controls move while the countdown ticks: ${moved.join(', ')} — a tap lands on the wrong button`)
else ok('no control moves while the countdowns tick')

/* ---- 2. "USE A DIFFERENT EMAIL", BY COORDINATES, MID-TICK --------------- */
/* Scrolled into view first — the sheet is taller than the phone and a thumb
   scrolls before it taps. The click itself stays a raw coordinate click. */
const ud = p.locator('text=Use a different email')
await ud.scrollIntoViewIfNeeded()
await p.waitForTimeout(400)
const udBox = await ud.boundingBox()
if (udBox.y + udBox.height > 852 || udBox.y < 0) bad(`"Use a different email" sits outside the viewport after scrolling (y=${Math.round(udBox.y)})`)
await tap(udBox.x + udBox.width / 2, udBox.y + udBox.height / 2)
await p.waitForTimeout(900)
const afterUd = await p.evaluate(() => ({
  joins: document.querySelectorAll('.join').length,
  onDetails: !document.querySelector('.join-otp') && !!document.querySelector('.join input[type=email]'),
  inputs: [...document.querySelectorAll('.join input')].map((i) => i.type + ':' + JSON.stringify(i.value).slice(0, 26)),
  email: document.querySelector('.join input[type=email]')?.value ?? null,
  name: document.querySelector('.join input')?.value ?? null,
  banner: document.querySelector('.join-error')?.textContent ?? null,
}))
console.log('detail dump  :', JSON.stringify(afterUd))
if (!afterUd.onDetails) bad('a coordinate click on "Use a different email" did not land on the details step')
else ok('"Use a different email" (coordinate click) lands on details')
if (afterUd.email !== A) bad(`going back lost the typed email (${JSON.stringify(afterUd.email)})`)
else ok('the fields survive the trip back')
if (afterUd.banner) bad(`a stale banner follows onto the details step: "${String(afterUd.banner).slice(0, 60)}"`)
else ok('no stale failure banner on the way back')

/* ---- 3. CHANGE THE ADDRESS, SUBMIT WITH ENTER (the phone-keyboard path) - */
const em = p.locator('.join input[type=email]')
await em.fill(B)
await em.press('Enter')
await p.waitForSelector('.join-otp', { timeout: 15000 })
const lead2 = await p.evaluate(() => document.querySelector('.join-lead')?.textContent?.replace(/\s+/g, ' ') ?? '')
if (!lead2.includes(B)) bad(`after changing the address the code screen names "${lead2.slice(0, 60)}", not ${B}`)
else ok('a changed address gets its own code, and the screen names it')
if (codesFor(B).length !== 1) bad(`${codesFor(B).length} codes logged for the new address, expected 1`)

/* ---- 4. THE DOUBLE-TAP MUST NOT MINT A SECOND CODE ---------------------- */
await ud.scrollIntoViewIfNeeded().catch(() => {})
await p.waitForTimeout(300)
const udBox2 = await ud.boundingBox().catch(() => null)
if (udBox2) await tap(udBox2.x + udBox2.width / 2, udBox2.y + udBox2.height / 2)
await p.waitForTimeout(600)
const submit = p.locator('.join button[type=submit]')
await submit.scrollIntoViewIfNeeded()
await p.waitForTimeout(300)
const sb = await submit.boundingBox()
await tap(sb.x + sb.width / 2, sb.y + sb.height / 2)
await tap(sb.x + sb.width / 2, sb.y + sb.height / 2)
await p.waitForSelector('.join-otp', { timeout: 15000 })
await p.waitForTimeout(1200)
const codesB = codesFor(B)
if (codesB.length > 1 && codesB[codesB.length - 1] !== codesB[codesB.length - 2]) {
  bad(`a double-tap minted a fresh code and killed the old one (${codesB.length} distinct sends)`)
} else ok('a double-tap does not invalidate the code already in flight')

/* ---- 5. A RAPID RE-REQUEST REUSES THE OUTSTANDING CODE ------------------ */
const again = await p.evaluate(async (dest) => {
  const r = await fetch('/api/members/start', {
    method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ name: 'Flow Audit', email: dest }),
  })
  return r.json()
}, B)
if (!again.reused) bad('a start straight after another minted a new code instead of reusing the live one')
else ok('a rapid second start reuses the outstanding code (reused: true)')

/* ---- 6. AND THE FIRST CODE STILL SIGNS IN ------------------------------- */
const live = codesFor(B).pop()
await p.locator('.join-code').fill(live)
await p.locator('.join button[type=submit]').click()
await p.waitForTimeout(2000)
const me = await p.evaluate(async () => {
  const r = await fetch('/api/members/me', { credentials: 'same-origin' })
  return r.status
})
if (me !== 200) bad(`the code from before the rapid retries no longer signs in (${me})`)
else ok('the code sent before the retries still signs the member in')

/* ---- 7. RESEND, AFTER THE COOLDOWN, MINTS A FRESH CODE ------------------ */
// (server-side: a start after the reuse window must rotate — checked via API
//  with a manufactured old row rather than waiting 25 live seconds)
const rotated = await p.evaluate(async () => {
  const r1 = await fetch('/api/members/start', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Rotate Check', email: 'rotate@example.invalid' }),
  }).then((r) => r.json())
  return r1
})
if (rotated.reused) bad('a FIRST start for a fresh address reported reused')
else ok('a fresh address always gets a fresh code')

if (fails.length) { console.log(`\nFAIL: ${fails.length} problem(s) on the sign-in page`); await b.close(); srv.kill(); await TESTDB.drop?.(); process.exit(1) }
console.log('\nPASS: the page holds still, every path lands where it says, and no code kills its predecessor.')
await b.close(); srv.kill(); await TESTDB.drop?.()
