/*
  MONTHLY OR YEARLY — and no yearly price invented while there is none.

  Leon asked for a yearly option on 2026-09-06 ("add yearly if you can"). The
  price is Glenn's to name, so until a tier in membership.ts carries one the
  contract is: the server refuses a yearly choice, the screen shows no switch
  and no yearly figure, and a monthly choice records as month. The day a
  yearly price is written in, this audit flips to expecting the switch, and
  the server to accepting the year — read off the same file the screen uses.
*/
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('interval')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = '/tmp/audit-interval.log'
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const srv = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: {
  ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS: '1', NODE_ENV: 'development',
} })
const B = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(B + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const tiers = JSON.parse(execFileSync('npx', ['tsx', '-e', `
  import { TIERS } from './src/data/membership'
  process.stdout.write(JSON.stringify(TIERS.map(t => ({ id: t.id, monthly: t.monthly, yearly: t.yearly ?? null }))))
`], { encoding: 'utf8' }))
const yearly = tiers.filter((t) => t.yearly)
console.log('  tiers with a yearly price:', yearly.length ? yearly.map((t) => `${t.id} $${t.yearly}`).join(', ') : 'none (as expected until Glenn names one)')

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

try {
  const stamp = String(Date.now()).slice(-4)
  const phone = `+1510621${stamp}`
  const s = await call('POST', '/api/members/start', { name: 'Yara Quint', phone })
  if (s.status !== 202) throw new Error(`start ${s.status}`)
  const v = await call('POST', '/api/members/verify', { phone, code: codeFor(phone) })
  const me = { cookie: (v.cookie || '').split(';')[0] }

  const month = await call('POST', '/api/members/tier', { tier: 'pass' }, me)
  check(month.status === 200 && month.body.tierInterval === 'month', 'a choice with no interval records as monthly')
  const explicit = await call('POST', '/api/members/tier', { tier: 'pass', interval: 'month' }, me)
  check(explicit.status === 200 && explicit.body.tierInterval === 'month', 'an explicit month records as monthly')
  check((await call('POST', '/api/members/tier', { tier: 'diamond', interval: 'week' }, me)).status === 400, 'anything but month or year is refused')
  for (const t of tiers) {
    const r = await call('POST', '/api/members/tier', { tier: t.id, interval: 'year' }, me)
    if (t.yearly) check(r.status === 200 && r.body.tierInterval === 'year', `${t.id}: a year is accepted because a yearly price exists`)
    else check(r.status === 400 && /yearly/i.test(r.body.error || ''), `${t.id}: a year is refused while it has no yearly price`)
  }
  const acct = await call('GET', '/api/members/me', null, me)
  check(['month', 'year'].includes(acct.body.tierInterval), 'the account carries the interval')

  /*
    The screen — as a FRESH member. The route to the Members page runs through
    the profile's "become a member" link, which a member who has already
    chosen a tier does not see (they get "Member since" instead). Yara chose
    one above, so the walk uses somebody who has not.
  */
  const b = await chromium.launch()
  const page = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  await page.goto(B, { waitUntil: 'domcontentloaded' })
  const phone2 = `+1510622${stamp}`
  const s2 = await page.evaluate(async (f) => (await fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(f) })).status, { name: 'Zed Marlow', phone: phone2 })
  if (s2 !== 202) throw new Error(`browser start ${s2}`)
  await page.evaluate(async ({ phone, code }) => fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ phone, code }) }), { phone: phone2, code: codeFor(phone2) })
  await page.goto(B, { waitUntil: 'networkidle' })
  const enter = page.locator('[aria-label="Enter BEASTY"]').first()
  try { await enter.waitFor({ state: 'visible', timeout: 15000 }); await enter.click(); await page.waitForTimeout(2600) } catch { await page.waitForTimeout(1200) }
  if (await page.locator('[aria-label="Enter BEASTY"]').count()) { await enter.click().catch(() => {}); await page.waitForTimeout(2600) }
  await page.locator('[aria-label="Profile"]').first().click({ timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1200)
  await page.locator('text=/become a member/i').first().click({ timeout: 15000 }).catch(() => {})
  const plans = await page.waitForSelector('.members-plan', { timeout: 15000 }).then(() => true).catch(() => false)
  check(plans, 'the Members page opens')
  const shape = await page.evaluate(() => ({
    toggle: !!document.querySelector('.members-interval'),
    prices: [...document.querySelectorAll('.members-plan-price')].map((e) => e.textContent?.replace(/\s+/g, ' ').trim()),
  }))
  console.log('  screen        :', JSON.stringify(shape))
  if (yearly.length) {
    check(shape.toggle, 'a yearly price exists, so the Monthly / Yearly switch is on the page')
  } else {
    check(!shape.toggle, 'no yearly price exists, so there is no switch to a price nobody named')
    check(shape.prices.length === tiers.length && shape.prices.every((p) => /\/month/.test(p) && !/\/year/.test(p)), 'every price on the page is the monthly one')
  }
  await b.close()
} catch (e) {
  console.log('FAIL: ' + (e?.stack || e))
  await done(1)
}

if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); await done(1) }
console.log('\nPASS: monthly records as month, yearly is refused until a price exists, and the screen invents nothing.')
await done(0)
