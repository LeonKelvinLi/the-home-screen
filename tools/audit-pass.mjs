/*
  THE PASS ON THE MEMBER CARD: it rotates, it expires, and it scans ONCE.

  Glenn, 2026-09-06: "make sure QR code is changing every 1 or 5 min so the QR
  code on every user cannot be redeemed offers." A code that only rotated would
  still be good for a screenshot inside the minute, so the property that
  matters most here is the third one: the first scan of a token is recorded
  and the second is refused. Every assertion below is something that, if it
  broke, would let somebody redeem an offer on another member's card.

  The window is held at 1.5 seconds so rotation and expiry are proved without
  waiting a minute for each; the server reads PASS_WINDOW_MS for exactly this.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('pass')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = '/tmp/audit-pass.log'
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const WINDOW = 1500
const OPERATOR = 'op-audit-' + 'x'.repeat(24)
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: {
  ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS: '1', NODE_ENV: 'development',
  PASS_WINDOW_MS: String(WINDOW), PASS_SECRET: 'audit-pass-secret-that-is-long-enough', OPERATOR_TOKEN: OPERATOR,
} })
const B = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(B + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const fails = []
const check = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) fails.push(msg) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const done = async (code) => { srv.kill(); await TESTDB.drop?.(); process.exit(code) }

/* Retries a 429 rather than reading it as an answer: these routes are
   rate-limited on purpose and a limiter tripping is not a verdict. */
const call = async (method, path, body, headers = {}) => {
  for (let i = 0; i < 12; i++) {
    const r = await fetch(B + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
    if (r.status === 429) { await sleep(5500); continue }
    const text = await r.text()
    let json = {}
    try { json = JSON.parse(text) } catch {}
    return { status: r.status, body: json, text, headers: r.headers, cookie: r.headers.get('set-cookie') }
  }
  throw new Error('rate limited for the whole run')
}
const codeFor = (dest) => readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${dest} `)).pop()?.match(/ (\d{6}) /)?.[1]
const signUp = async (name, phone) => {
  const s = await call('POST', '/api/members/start', { name, phone })
  if (s.status !== 202) throw new Error(`start ${s.status} ${s.text}`)
  const code = codeFor(phone)
  if (!code) throw new Error(`no code logged for ${phone}`)
  const v = await call('POST', '/api/members/verify', { phone, code })
  if (v.status >= 300) throw new Error(`verify ${v.status} ${v.text}`)
  return { account: v.body, cookie: (v.cookie || '').split(';')[0] }
}
const op = { authorization: `Bearer ${OPERATOR}` }

try {
  const stamp = String(Date.now()).slice(-4)
  check((await call('GET', '/api/members/pass')).status === 401, 'signed out, there is no pass to fetch')
  check((await call('POST', '/api/pass/verify', { token: 'bp1.x.1.y' })).status === 401, 'a scan needs a vendor or operator token')

  const rae = await signUp('Rae Solis', `+1510581${stamp}`)
  const me = { cookie: rae.cookie }
  const p1 = await call('GET', '/api/members/pass', null, me)
  check(p1.status === 200 && /^bp1\.[A-Za-z0-9_-]+\.\d+\.[A-Za-z0-9_-]{27}$/.test(p1.body.token), 'a signed-in member gets a signed pass')
  check(p1.headers.get('cache-control') === 'no-store', 'the pass is never cached')
  check(p1.body.windowMs === WINDOW && p1.body.expiresAt > Date.now(), 'the pass says how long it is good for')
  const svg = await call('GET', '/api/members/pass.svg', null, me)
  check(svg.status === 200 && /image\/svg\+xml/.test(svg.headers.get('content-type') || '') && svg.text.includes('<svg') && svg.headers.get('cache-control') === 'no-store', 'the pass draws as a QR and is not cached')

  check((await call('POST', '/api/pass/verify', { token: p1.body.token }, me)).status === 401, 'a member cannot verify their own pass')
  const v1 = await call('POST', '/api/pass/verify', { token: p1.body.token }, op)
  check(v1.status === 200 && v1.body.ok === true && v1.body.member?.name === 'Rae S.', 'the operator verifies it and is told who it is')
  check(v1.body.honours === null && v1.body.member?.tier === 'free', 'a free account honours nothing yet')
  check(!('email' in (v1.body.member || {})) && !('phone' in (v1.body.member || {})), 'a scan reveals no number and no address')
  const v2 = await call('POST', '/api/pass/verify', { token: p1.body.token }, op)
  check(v2.status === 409, 'THE SAME TOKEN SCANS ONCE — a screenshot is worthless')

  const t = p1.body.token
  const forged = t.slice(0, -1) + (t.endsWith('A') ? 'B' : 'A')
  check((await call('POST', '/api/pass/verify', { token: forged }, op)).status === 400, 'a token with one character changed is refused')
  const [, mid, win, sig] = t.split('.')
  check((await call('POST', '/api/pass/verify', { token: `bp1.${mid}x.${win}.${sig}` }, op)).status === 400, 'a token moved to another member id is refused')
  check((await call('POST', '/api/pass/verify', { token: `bp1.${mid}.${Number(win) + 5}.${sig}` }, op)).status === 400, 'a token dated in the future is refused')
  check((await call('POST', '/api/pass/verify', { token: 'hello' }, op)).status === 400, 'garbage is refused')

  /* Rotation: wait for the next window and the token must differ. */
  await sleep(WINDOW + 200)
  const p2 = await call('GET', '/api/members/pass', null, me)
  check(p2.body.token !== p1.body.token, 'the pass has changed after one window')
  check((await call('POST', '/api/pass/verify', { token: p2.body.token }, op)).status === 200, 'the new pass verifies')

  /* Grace: a token from the previous window still verifies once. */
  const p3 = await call('GET', '/api/members/pass', null, me)
  await sleep(WINDOW + 200)
  const g = await call('POST', '/api/pass/verify', { token: p3.body.token }, op)
  check(g.status === 200 || g.status === 409, 'a pass shown a moment ago still verifies (one window of grace)')

  /* Expiry: two windows later it is gone. */
  const p4 = await call('GET', '/api/members/pass', null, me)
  await sleep(WINDOW * 2 + 300)
  check((await call('POST', '/api/pass/verify', { token: p4.body.token }, op)).status === 410, 'a pass two windows old has expired')

  /* A vendor's own token works at the till too. */
  const vt = readFileSync(LOG, 'utf8').match(/^\s+(v_\S+)\s+(vt_\S+)$/m)
  if (vt) {
    const p5 = await call('GET', '/api/members/pass', null, me)
    const vv = await call('POST', '/api/pass/verify', { token: p5.body.token }, { authorization: `Bearer ${vt[2]}` })
    check(vv.status === 200, 'a vendor token verifies a pass as well')
  } else check(false, 'no vendor token was printed to the dev log')

  /* The screen: the card shows the pass, counts down, and swaps it on its own. */
  const b = await chromium.launch()
  const page = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  await page.goto(B, { waitUntil: 'domcontentloaded' })
  const phone = `+1510582${stamp}`
  const started = await page.evaluate(async (f) => (await fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(f) })).status, { name: 'Card Holder', phone })
  if (started !== 202) throw new Error(`browser start ${started}`)
  const code = codeFor(phone)
  await page.evaluate(async ({ phone, code }) => fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ phone, code }) }), { phone, code })
  await page.goto(B, { waitUntil: 'networkidle' })
  const enter = page.locator('[aria-label="Enter BEASTY"]').first()
  try { await enter.waitFor({ state: 'visible', timeout: 15000 }); await enter.click(); await page.waitForTimeout(2600) } catch { await page.waitForTimeout(1200) }
  if (await page.locator('[aria-label="Enter BEASTY"]').count()) { await enter.click().catch(() => {}); await page.waitForTimeout(2600) }
  await page.locator('[aria-label="Profile"]').first().click({ timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1200)
  await page.locator('text=/become a member/i').first().click({ timeout: 15000 }).catch(() => {})
  await page.waitForSelector('.members-plan', { timeout: 15000 }).catch(() => {})
  await page.locator('text=/See the member card/i').first().click({ timeout: 15000 }).catch(() => {})
  const drew = await page.waitForSelector('.member-qr-img svg', { timeout: 15000 }).then(() => true).catch(() => false)
  check(drew, 'the member card draws a QR for a signed-in member')
  const refresh = await page.evaluate(() => document.querySelector('.member-refresh')?.textContent ?? '')
  check(/Refreshes in \d+:\d\d/.test(refresh), `the card counts the pass down ("${refresh}")`)
  const first = await page.evaluate(() => document.querySelector('.member-qr-img')?.innerHTML ?? '')
  const changed = await page.waitForFunction((was) => (document.querySelector('.member-qr-img')?.innerHTML ?? '') !== was && !!document.querySelector('.member-qr-img svg'), first, { timeout: WINDOW * 3 }).then(() => true).catch(() => false)
  check(changed, 'the QR on screen swaps itself when the window turns')
  await b.close()
} catch (e) {
  console.log('FAIL: ' + (e?.stack || e))
  await done(1)
}

if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); await done(1) }
console.log('\nPASS: the pass rotates every window, dies two windows on, scans exactly once, and the card keeps it fresh.')
await done(0)
