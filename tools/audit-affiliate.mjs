/*
  The affiliate dashboard (server/affiliate.ts, docs/AFFILIATE.md): every
  definition proven against a fresh database, then the screens on a phone and
  a desktop.

    click       once per device per day; never the owner's own device, a
                signed-in member, a robot or an unknown code
    person      a new account made with the code; not on the owner's device
    active      the ACTIVATION test (a like here)
    business    a Reserve a Spot request after the owner's /r/ link
    conversion  active people + businesses that signed

  AFF_SHOTS=<dir> saves the screenshots there.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync, readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('affiliate')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-affiliate-${port}.log`
const TOKEN = `op_${randomBytes(16).toString('hex')}`
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', openSync(LOG, 'w'), openSync(LOG, 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', OPERATOR_TOKEN: TOKEN, RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 240; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }
const db = new pg.Client({ connectionString: TESTDB.url })
await db.connect()
const q = async (sql, args = []) => (await db.query(sql, args)).rows
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const SHOTS = process.env.AFF_SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail !== '' ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }

/* A device: a cookie jar with its own address (the limiter is per IP) and a browser's user agent. */
let ipn = 1
class Device {
  constructor() { this.jar = new Map(); this.ip = `10.88.${(ipn >> 8) & 255}.${ipn++ & 255}` }
  headers(extra = {}) {
    const cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join('; ')
    return { 'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 audit-affiliate', 'x-forwarded-for': this.ip, ...(cookie ? { cookie } : {}), ...extra }
  }
  keep(res) {
    for (const c of res.headers.getSetCookie()) { const [kv] = c.split(';'); const i = kv.indexOf('='); this.jar.set(kv.slice(0, i), kv.slice(i + 1)) }
    return res
  }
  async call(method, path, body, raw = false) {
    const res = this.keep(await fetch(base + path, { method, redirect: 'manual', headers: this.headers(body === undefined ? {} : { 'content-type': 'application/json' }), body: body === undefined ? undefined : JSON.stringify(body) }))
    if (raw) return res
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch {}
    return { status: res.status, body: json }
  }
  /** The same phone after signing out: the device cookie stays, the session goes. */
  signedOut() { const d = new Device(); d.ip = this.ip; d.jar = new Map([...this.jar].filter(([k]) => k !== 'beasty_member')); return d }
}

const codeFor = async (email) => {
  for (let i = 0; i < 60; i++) {
    const c = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
    if (c) return c
    await wait(200)
  }
  throw new Error(`no code for ${email}`)
}
/* Through the real two steps, on a device, with a code if given. */
const signUp = async (dev, name, email, ref) => {
  const s = await dev.call('POST', '/api/members/start', { name, email, ...(ref ? { ref } : {}) })
  if (s.status >= 300) throw new Error(`start ${s.status} ${JSON.stringify(s.body)}`)
  const v = await dev.call('POST', '/api/members/verify', { email, code: await codeFor(email) })
  if (v.status >= 300) throw new Error(`verify ${v.status} ${JSON.stringify(v.body)}`)
  return v.body
}
const tag = randomBytes(3).toString('hex')
const email = (who) => `${who}-${tag}@audit.beastypages.dev`
const me = async (dev) => (await dev.call('GET', '/api/affiliate/me')).body
const click = async (dev, code) => (await dev.call('POST', '/api/affiliate/click?wait=1', { code, landing: '/' })).body?.counted

/* ---------------------------------------------------------------- the rules */

const phoneA = new Device()
await phoneA.call('GET', '/', undefined, true) // the device cookie, as a first page gives it
const A = await signUp(phoneA, 'Ava Affiliate', email('ava'))
step('Ava signs up and has a code', /^[0-9A-Z]{8}$/.test(A.referralCode ?? ''), A.referralCode)

const out = await new Device().call('GET', '/api/affiliate/me')
step('signed out, the dashboard is refused', out.status === 401)

let d = await me(phoneA)
step('a brand-new affiliate starts at zero, with nothing invented', d.lifetime.users === 0 && d.lifetime.businesses === 0 && d.lifetime.clicks === 0 && d.rewards.cash.paidCents === 0 && d.program.cashRewards === false)
step('she has a friend link and a business link', d.affiliate.links.user === `${base}/?ref=${A.referralCode}` && d.affiliate.links.business === `${base}/r/${A.referralCode.toLowerCase()}`, JSON.stringify(d.affiliate.links))
step('her status and start date are her account’s', d.affiliate.status === 'Active' && typeof d.affiliate.since === 'number' && d.affiliate.since > 0)

/* Clicks */
const v1 = new Device()
const v2 = new Device()
step('a new device opening her link is a click', (await click(v1, A.referralCode)) === true)
step('the same device again the same day is not', (await click(v1, A.referralCode)) === false)
step('a second device is', (await click(v2, A.referralCode)) === true)
step('her own phone signed in is not', (await click(phoneA, A.referralCode)) === false)
step('her own phone signed out is not', (await click(phoneA.signedOut(), A.referralCode)) === false)
step('a code that belongs to nobody is not', (await click(new Device(), 'ZZZZZZZZ')) === false)
const robot = new Device()
const botRes = await fetch(base + '/api/affiliate/click?wait=1', { method: 'POST', headers: { ...robot.headers(), 'user-agent': 'Googlebot/2.1', 'content-type': 'application/json' }, body: JSON.stringify({ code: A.referralCode }) })
step('a search robot is not', (await botRes.json()).counted === false)
const rows = await q('SELECT COUNT(*)::int AS n FROM referral_clicks WHERE member_id = $1', [A.id])
step('two clicks are kept', rows[0].n === 2, rows[0].n)

/* People */
const F1 = await signUp(v1, 'Finn First', email('finn'), A.referralCode)
const F2 = await signUp(v2, 'Gia Second', email('gia'), A.referralCode)
const credited = await q('SELECT COUNT(*)::int AS n FROM members WHERE referred_by = $1', [A.id])
step('two friends who join with her code are hers', credited[0].n === 2, credited[0].n)
const selfTry = await signUp(phoneA.signedOut(), 'Ava Again', email('ava2'), A.referralCode)
const selfRow = await q('SELECT referred_by FROM members WHERE id = $1', [selfTry.id])
step('an account made on her own phone with her code is not hers', selfRow[0].referred_by === null)
const flags = await q('SELECT kind FROM referral_flags WHERE member_id = $1', [A.id])
step('and the attempt is kept for the admin', flags.length === 1 && flags[0].kind === 'self_signup')

/* Active: Finn likes a business. */
const phoneF1 = v1
const like = await phoneF1.call('POST', '/api/brands/b_zadnagrill/signals/like')
step('Finn likes a business', like.status < 300, like.status)

d = await me(phoneA)
step('the dashboard counts two people, one active', d.lifetime.users === 2 && d.lifetime.qualified === 1 && d.lifetime.pendingUsers === 1, JSON.stringify(d.lifetime))
step('and two link clicks', d.lifetime.clicks === 2 && d.windows['7d'].clicks.user === 2)
step('the sign-up rate is joins over clicks', d.windows['7d'].userConversion === 1, d.windows['7d'].userConversion)
step('conversions are the active people', d.lifetime.conversions === 1 && d.windows['7d'].conversions === 1)
const text = JSON.stringify(d)
step('no name, email or phone of a friend reaches her', !/Finn|Gia|Second|First/.test(text) && !text.includes('@audit.beastypages.dev') && !text.includes(F1.id) && !text.includes(F2.id))
step('friends are shown by first initial', d.users.map((u) => u.label).sort().join(',') === 'F•••,G•••', d.users.map((u) => u.label).join(','))
step('the activity says who joined and who became active', d.activity.some((a) => a.kind === 'user_joined') && d.activity.some((a) => a.kind === 'user_qualified' && a.text.startsWith('F•••')))

/* Businesses: through her business link to Reserve a Spot. */
const shop = new Device()
const r = await shop.call('GET', `/r/${A.referralCode.toLowerCase()}`, undefined, true)
step('her business link lands on the page that sells a tile', r.status === 302 && r.headers.get('location') === '/money?from=r', `${r.status} ${r.headers.get('location')}`)
const person = await q("SELECT role, source_type, member_id FROM crm_people WHERE member_id = $1", [A.id])
step('its first click makes her a referrer the CRM knows, with no CRM access', person.length === 1 && person[0].role === 'none' && person[0].source_type === 'member')
const ap = await shop.call('POST', '/api/applications', { business: 'Affiliate Test Tacos', contact: 'owner@affiliate-test.invalid', city: 'Oakland' })
step('the business asks for a spot', ap.status === 201, ap.status)
await wait(800)
d = await me(phoneA)
const biz = d.businesses[0]
step('the business is hers, received and waiting', d.lifetime.businesses === 1 && biz?.name === 'Affiliate Test Tacos' && biz.city === 'Oakland' && biz.status === 'Received' && biz.bucket === 'pending', JSON.stringify(biz))
step('its click counts as a business click', d.windows['7d'].clicks.business === 1 && d.lifetime.clicks === 3, `${d.windows['7d'].clicks.business} / ${d.lifetime.clicks}`)
step('its reward says it is not paying yet', biz?.reward === 'Not paying yet')

/* BEASTY signs it (what the CRM's Won does). */
const opp = (await q("SELECT o.id FROM crm_opportunities o JOIN crm_people p ON p.id = o.referrer_id WHERE p.member_id = $1", [A.id]))[0]
const nowMs = Date.now()
await q("UPDATE crm_opportunities SET stage = 'won', stage_changed_at = $2, won_at = $2 WHERE id = $1", [opp.id, nowMs])
await q("INSERT INTO crm_stage_history (id, opportunity_id, from_stage, to_stage, changed_at, changed_by) VALUES ($1,$2,'new_lead','won',$3,'audit')", [`sh_${tag}`, opp.id, nowMs])
d = await me(phoneA)
step('a signed business counts as a conversion', d.lifetime.businessesConverted === 1 && d.lifetime.conversions === 2 && d.windows['30d'].conversions === 2 && d.businesses[0].status === 'Signed with BEASTY')
step('the business win rate is signed over referred', d.windows['30d'].businessConversion === 1)
step('the activity says it signed', d.activity.some((a) => a.kind === 'business_won' && a.text === 'Affiliate Test Tacos signed with BEASTY'))

/* A third friend earns a raffle ticket, the reward that exists today. */
const v3 = new Device()
await click(v3, A.referralCode)
await signUp(v3, 'Hal Third', email('hal'), A.referralCode)
d = await me(phoneA)
step('three friends earn a raffle ticket, on the dashboard too', d.rewards.tickets.earned === 1 && d.users.filter((u) => u.reward === 'Counted toward raffle ticket 1').length === 3 && d.activity.some((a) => a.kind === 'ticket'))

/* The numbers agree with themselves. */
const sum = (w, k) => d.windows[w].series.reduce((a, b) => a + b[k], 0)
step('the 7-day chart adds up to the 7-day numbers', sum('7d', 'joined') === d.windows['7d'].users.joined && sum('7d', 'clicks') === d.windows['7d'].clicks.total && sum('7d', 'businesses') === d.windows['7d'].businesses.referred, `${sum('7d', 'joined')}/${sum('7d', 'clicks')}/${sum('7d', 'businesses')}`)
step('all time adds up to the lifetime numbers', sum('all', 'joined') === d.lifetime.users && sum('all', 'clicks') === d.lifetime.clicks && sum('all', 'qualified') === d.lifetime.qualified)

/* Only her own. */
const phoneB = new Device()
await signUp(phoneB, 'Bea Other', email('bea'))
const dB = await me(phoneB)
step('another member sees only their own dashboard', dB.lifetime.users === 0 && dB.businesses.length === 0 && dB.affiliate.code !== A.referralCode)

/* The QR for the business link. */
const qr = await phoneA.call('GET', '/api/members/qr.svg?for=business', undefined, true)
step('a QR code for the business link is drawn', qr.status === 200 && /svg/.test(qr.headers.get('content-type') ?? ''))

/* The admin's read. */
const adminNo = await new Device().call('GET', '/api/admin/affiliates')
step('the admin list is refused without the operator key', adminNo.status === 401)
const adminRes = await fetch(base + '/api/admin/affiliates', { headers: { authorization: `Bearer ${TOKEN}` } })
const admin = await adminRes.json()
const rowA = admin.affiliates?.find((x) => x.id === A.id)
step('with it, every affiliate, their numbers and the flags', rowA?.users === 3 && rowA?.businesses === 1 && rowA?.flags === 1 && admin.flags.some((f) => f.memberId === A.id && f.kind === 'self_signup'), JSON.stringify(rowA))

/* ---------------------------------------------------------------- the screens */

const browser = await chromium.launch()
const open = async (dev, viewport) => {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 })
  await ctx.addCookies([...dev.jar].map(([name, value]) => ({ name, value, url: base })))
  const p = await ctx.newPage()
  p.errors = []
  p.on('pageerror', (e) => p.errors.push(e.message))
  await p.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('.nav-back', { timeout: 30000 })
  await p.click('.nav-back')
  await p.waitForTimeout(1200)
  await p.evaluate(() => [...document.querySelectorAll('button[aria-label]')].find((x) => /^Profile/.test(x.getAttribute('aria-label')))?.click())
  await p.waitForSelector('.aff-entry', { timeout: 20000 })
  return p
}
const shot = async (p, name) => { if (SHOTS) await p.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }) }

const phone = await open(phoneA, { width: 393, height: 852 })
await phone.waitForFunction(() => /\b3\b/.test(document.querySelector('.aff-entry-stats')?.textContent ?? ''), null, { timeout: 15000 }).catch(() => {})
const entry = await phone.locator('.aff-entry-stats').textContent()
step('Profile shows her numbers on the way in, in plain English', /3\s*people/.test(entry) && /1\s*business(?!es)/.test(entry) && /2\s*conversions/.test(entry), entry)
const order = await phone.evaluate(() => {
  const e = document.querySelector('.aff-entry'); const mp = document.querySelector('.mp')
  return !!(e && mp && e.compareDocumentPosition(mp) & Node.DOCUMENT_POSITION_FOLLOWING)
})
step('and keeps her code and QR below it', order)
await shot(phone, '1-profile-card')
await phone.click('.aff-entry')
await phone.waitForSelector('.aff-hero', { timeout: 20000 })
await phone.waitForTimeout(500)
await shot(phone, '2-dashboard-top')
const hero = await phone.locator('.aff-hero-line').textContent()
step('the dashboard opens on what she has brought', /3 people and 1 business/.test(hero), hero)
step('eight numbers, then the chart', (await phone.locator('.aff-kpi').count()) === 8 && (await phone.locator('.aff-chart-svg, .aff-chart-empty').count()) === 1)
await phone.locator('.aff-seg button', { hasText: 'All time' }).click()
await phone.locator('.aff-seg-small button', { hasText: 'Joined' }).first().click()
await phone.waitForTimeout(300)
step('all time, joined: three columns worth of people', (await phone.locator('.aff-chart-tip').textContent()).includes('3'))
const widths = await phone.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: window.innerWidth, over: [...document.querySelectorAll('.aff *')].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).length }))
step('nothing runs off a phone screen', widths.over === 0 && widths.doc <= widths.view, JSON.stringify(widths))
await phone.locator('.aff-list').first().scrollIntoViewIfNeeded()
await shot(phone, '3-dashboard-lists')
const lists = await phone.locator('.aff').textContent()
step('the lists show the business and the friends by initial only', lists.includes('Affiliate Test Tacos') && lists.includes('F•••') && !/Finn|Gia|Hal/.test(lists))
step('no errors on the page', phone.errors.length === 0, phone.errors.join(' | '))

const desk = await open(phoneA, { width: 1280, height: 900 })
await desk.click('.aff-entry')
await desk.waitForSelector('.aff-kpi', { timeout: 20000 })
const cols = await desk.evaluate(() => getComputedStyle(document.querySelector('.aff-kpis')).gridTemplateColumns.split(' ').length)
await shot(desk, '4-dashboard-desktop')
step('on a wide screen the numbers sit four across', cols === 4 || (await desk.evaluate(() => window.innerWidth)) < 700, cols)

const fresh = await open(phoneB, { width: 393, height: 852 })
await fresh.click('.aff-entry')
await fresh.waitForSelector('.aff-hero', { timeout: 20000 })
await fresh.waitForTimeout(400)
await shot(fresh, '5-new-affiliate')
step('a new affiliate is told how to start, not shown zeros as news', /Share your link to start/.test(await fresh.locator('.aff-hero-line').textContent()) && (await fresh.locator('.aff-empty').count()) >= 3)

await browser.close()
await db.end()
srv.kill()
console.log(fails.length ? `\n${fails.length} failed` : '\nPASS: clicks, people, businesses, conversions and rewards count by the rules, only for their owner, and the screens show them.')
process.exit(fails.length ? 1 : 0)
