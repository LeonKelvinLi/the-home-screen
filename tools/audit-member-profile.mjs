/*
  A MEMBER'S PAGE FROM CONTACTS: what they starred and liked, and nothing else.

  Glenn, 2026-09-06: "make sure people on contact list we can go into their
  profile and see what they liked." Two halves. The server half: a member
  reads another member's page and sees the businesses that member liked and
  starred while signed in — and never their number, address or handle. The
  screen half: a row in Contacts actually opens that page, because a working
  endpoint with no way to reach it looks exactly like a finished feature from
  the server side.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('profile')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = '/tmp/audit-profile.log'
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const srv = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: {
  ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS: '1', NODE_ENV: 'development',
} })
const B = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(B + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const fails = []
const check = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) fails.push(msg) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const done = async (code) => { srv.kill(); await TESTDB.drop?.(); process.exit(code) }
const call = async (method, path, body, headers = {}) => {
  for (let i = 0; i < 12; i++) {
    const r = await fetch(B + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
    if (r.status === 429) { await sleep(5500); continue }
    const text = await r.text()
    let json = {}
    try { json = JSON.parse(text) } catch {}
    return { status: r.status, body: json, text, cookie: r.headers.get('set-cookie') }
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

try {
  const stamp = String(Date.now()).slice(-4)
  const ada = await signUp('Ada Okoye', `+1510591${stamp}`)
  const bo = await signUp('Bo Lindqvist', `+1510592${stamp}`)
  const as = (m) => ({ cookie: m.cookie })

  /* Ada likes two places and stars one, then changes her mind about one like. */
  check((await call('POST', '/api/brands/b_topdog/signals/like', {}, as(ada))).status === 200, 'Ada likes top dog')
  check((await call('POST', '/api/brands/b_pawddle/signals/like', {}, as(ada))).status === 200, 'Ada likes a second place')
  check((await call('POST', '/api/brands/b_pawddle/signals/favourite', {}, as(ada))).status === 200, 'Ada stars it')
  check((await call('POST', '/api/brands/b_pawddle/signals/like', {}, as(ada))).status === 200, 'Ada unlikes the second place')

  check((await call('GET', `/api/members/${ada.account.id}/profile`)).status === 401, 'signed out, nobody\'s page is readable')
  const dir = await call('GET', '/api/members/directory', null, as(bo))
  check(dir.status === 200 && dir.body.members.some((m) => m.id === ada.account.id), 'Bo sees Ada in Contacts')

  const prof = await call('GET', `/api/members/${ada.account.id}/profile`, null, as(bo))
  check(prof.status === 200 && prof.body.name === 'Ada O.', 'Bo opens Ada\'s page and sees a first name and an initial')
  check(Array.isArray(prof.body.likes) && prof.body.likes.includes('b_topdog') && !prof.body.likes.includes('b_pawddle'), 'her likes are what she liked and still likes')
  check(Array.isArray(prof.body.favourites) && prof.body.favourites.includes('b_pawddle'), 'her favourites are what she starred')
  check(!('email' in prof.body) && !('phone' in prof.body) && !('instagram' in prof.body), 'no number, no address, no handle')
  check(prof.body.me === false && typeof prof.body.since === 'number', 'it is not Bo\'s own page, and it says when she joined')
  const mine = await call('GET', `/api/members/${bo.account.id}/profile`, null, as(bo))
  check(mine.status === 200 && mine.body.me === true, 'a member\'s own page knows it is theirs')
  check((await call('GET', '/api/members/m_nobody_at_all/profile', null, as(bo))).status === 404, 'a made-up id is a 404, not an empty page')

  /* The screen: Contacts → Ada's row → her page, with what she liked on it. */
  const b = await chromium.launch()
  const page = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  await page.goto(B, { waitUntil: 'domcontentloaded' })
  const phone = `+1510592${stamp}`
  const started = await page.evaluate(async (f) => (await fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(f) })).status, { name: 'Bo Lindqvist', phone })
  if (started !== 202) throw new Error(`browser start ${started}`)
  const code = codeFor(phone)
  await page.evaluate(async ({ phone, code }) => fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ phone, code }) }), { phone, code })
  await page.goto(B, { waitUntil: 'networkidle' })
  const enter = page.locator('[aria-label="Enter BEASTY"]').first()
  try { await enter.waitFor({ state: 'visible', timeout: 15000 }); await enter.click(); await page.waitForTimeout(2600) } catch { await page.waitForTimeout(1200) }
  if (await page.locator('[aria-label="Enter BEASTY"]').count()) { await enter.click().catch(() => {}); await page.waitForTimeout(2600) }
  await page.evaluate(() => { const x = [...document.querySelectorAll('.dock-switch-btn')].find((e) => /^Help,/.test(e.getAttribute('aria-label') || '')); x?.click() })
  await page.waitForTimeout(500)
  await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find((e) => /^Phone\b/.test(e.getAttribute('aria-label') || e.textContent || '')); x?.click() })
  const listed = await page.waitForSelector('.contacts-count', { timeout: 15000 }).then(() => true).catch(() => false)
  check(listed, 'Contacts lists real members for a signed-in member')
  await page.locator('text=Ada O.').first().click({ timeout: 15000 }).catch(() => {})
  const opened = await page.waitForSelector('.member-page', { timeout: 15000 }).then(() => true).catch(() => false)
  check(opened, 'tapping her row opens her page')
  await page.waitForFunction(() => !!document.querySelector('.member-page .prof-chiprow, .member-page .prof-grid'), null, { timeout: 15000 }).catch(() => {})
  const shown = await page.evaluate(() => ({
    liked: [...document.querySelectorAll('.member-page .prof-chiprow .prof-chip')].map((e) => e.textContent?.trim()),
    starred: [...document.querySelectorAll('.member-page .prof-grid .prof-tile[aria-label]')].map((e) => e.getAttribute('aria-label')),
    text: document.querySelector('.member-page')?.textContent ?? '',
  }))
  console.log('  page shows    :', JSON.stringify(shown.liked), JSON.stringify(shown.starred))
  check(shown.liked.some((n) => /top dog/i.test(n || '')), 'her page shows top dog under Liked')
  check(shown.starred.length === 1, 'her page shows the one business she starred')
  check(/Member since/.test(shown.text) && !/\+1510/.test(shown.text), 'it says when she joined and shows no phone number')
  await b.close()
} catch (e) {
  console.log('FAIL: ' + (e?.stack || e))
  await done(1)
}

if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); await done(1) }
console.log('\nPASS: a member\'s page opens from Contacts with what they starred and liked, and nothing private.')
await done(0)
