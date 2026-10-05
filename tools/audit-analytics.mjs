/*
  The intelligence layer's foundation, proven against the rows it writes.

  Leon's validation list of 2026-09-24, as far as the foundation reaches:
  anonymous visits, a returning visitor, a signed-in member, the device linked
  on sign-up, duplicate events, bots, the team's own devices, Global Privacy
  Control, refused and malformed events, and the site working with tracking
  blocked. Every check reads the database, not the page's word for it.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync, readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import pg from 'pg'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('intel')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-intel-${port}.log`
const SECRET = 'intel-audit-secret-' + port
const WHSEC = 'whsec_intel_audit_' + port
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', openSync(LOG, 'w'), openSync(LOG, 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', PASS_SECRET: SECRET, RESEND_API_KEY: '', LEAD_EMAIL: '', STRIPE_WEBHOOK_SECRET: WHSEC },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 120; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }
const db = new pg.Client({ connectionString: TESTDB.url })
await db.connect()
const q = async (sql, args = []) => (await db.query(sql, args)).rows
const one = async (sql, args = []) => (await q(sql, args))[0]
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail !== '' ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }

/* A jar per "device", so fetch calls carry that device's cookies. */
const jar = () => new Map()
const send = async (j, path, init = {}) => {
  const headers = { ...(init.headers ?? {}) }
  if (j.size) headers.cookie = [...j.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
  const r = await fetch(base + path, { ...init, headers, redirect: 'manual' })
  for (const c of r.headers.getSetCookie?.() ?? []) { const [kv] = c.split(';'); const i = kv.indexOf('='); j.set(kv.slice(0, i), kv.slice(i + 1)) }
  return r
}
const batch = (j, body, headers = {}) => send(j, '/api/t/events?wait=1', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'text/plain', 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari', ...headers } }).then((r) => r.json())
const rid = () => Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8)

/* ------------------------------------------------ 1. a page load, in a browser */
const b = await chromium.launch()
/* An ordinary phone's user agent: headless Chrome names itself, and the site
   rightly treats that as a bot and sets it no cookie. */
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, userAgent: IPHONE })
const p = await ctx.newPage()
const pageErrors = []
p.on('pageerror', (e) => pageErrors.push(e.message))
await p.goto(`${base}/?utm_source=instagram&utm_medium=social&utm_campaign=fall`, { waitUntil: 'domcontentloaded' })
await wait(1500)
const device = (await ctx.cookies()).find((c) => c.name === 'beasty_device')
step('the first page sets the device cookie, not the beacon', !!device && device.httpOnly)
await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')) })
let s1
for (let i = 0; i < 40 && !s1; i++) { await wait(250); s1 = await one("SELECT * FROM analytics_sessions ORDER BY started_at LIMIT 1") }
step('an anonymous visit is a session, on the phone it was', !!s1 && s1.device === 'phone' && s1.platform === 'ios' && !s1.is_bot, s1 ? `${s1.entry_type}, ${s1.device}, ${s1.platform}, v ${s1.app_version}` : 'none')
step('with what brought it: the campaign', s1?.entry_type === 'campaign' && s1?.utm_source === 'instagram' && s1?.utm_campaign === 'fall')
const v1 = s1 && await one('SELECT * FROM analytics_visitors WHERE anon_id = $1', [s1.anon_id])
step('and a visitor whose first touch is kept', v1?.first_touch?.utm_source === 'instagram' && v1?.first_touch?.entry === 'campaign')
const started = s1 && await one("SELECT COUNT(*)::int n FROM analytics_events WHERE name = 'session_started' AND session_id = $1", [s1.session_id])
step('a session_started event carries the session', started?.n === 1)

/* ------------------------------------------ 2. the same device, a later visit */
await p.evaluate(() => { const k = 'fb.session.v1'; const s = JSON.parse(localStorage.getItem(k)); s.last = Date.now() - 31 * 60 * 1000; localStorage.setItem(k, JSON.stringify(s)) })
await p.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
await wait(800)
await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')) })
let sessions = []
for (let i = 0; i < 40 && sessions.length < 2; i++) { await wait(250); sessions = await q('SELECT * FROM analytics_sessions ORDER BY started_at') }
step('after 30 idle minutes the same device starts a second visit', sessions.length === 2 && sessions[0].anon_id === sessions[1].anon_id, `${sessions.length} sessions`)
step('which arrived direct, and did not overwrite the first touch', sessions[1]?.entry_type === 'direct' && (await one('SELECT first_touch FROM analytics_visitors WHERE anon_id = $1', [s1?.anon_id]))?.first_touch?.utm_source === 'instagram')

/* ---------------------- 3. the ingest's rules, straight at the endpoint */
const d = jar()
await send(d, '/', { headers: { 'user-agent': 'Mozilla/5.0 (iPhone) Safari' } })
const sid = rid() + rid()
const brand = 'b_zadnagrill'
const r1 = await batch(d, {
  v: 'test', sid, ctx: { entry: 'shared_business', landing: '/?b=b_zadnagrill&x=secret', referrer: 'https://www.instagram.com/some/path?q=1' },
  events: [
    { e: 'business_opened', id: rid(), t: Date.now(), p: { brand, city: 'Redwood City', page_kind: 'goods', seat: 'redwood-city-goods-9', surface: 'search_result', position: 2, query: 'Lebanese  FOOD!!' } },
    { e: 'business_opened', id: rid(), t: Date.now(), p: { brand: 'b_notarealbusiness' } },
    { e: 'made_up_event', id: rid(), t: Date.now(), p: {} },
    { e: 'search_submitted', id: rid(), t: Date.now(), p: { query: 'call me 510 555 1234', count: 3 } },
    { e: 'outbound_clicked', id: rid(), t: Date.now(), p: { brand, kind: 'directions', secret: 'dropped' } },
  ],
})
step('a batch keeps what is valid and refuses the rest', r1.stored === 3 && r1.refused === 2, JSON.stringify(r1))
const opened = await one("SELECT * FROM analytics_events WHERE name = 'business_opened' AND session_id = $1", [sid])
step('an open carries its business, city, page, seat, surface and position', opened?.brand_id === brand && opened?.city === 'Redwood City' && opened?.page_kind === 'goods' && opened?.seat === 'redwood-city-goods-9' && opened?.surface === 'search_result' && opened?.position === 2)
step('a search is kept normalized', opened?.query_norm === 'lebanese food', opened?.query_norm)
const phoneSearch = await one("SELECT query_norm, metadata FROM analytics_events WHERE name = 'search_submitted' AND session_id = $1", [sid])
step('a search that looks like a phone number keeps no words', phoneSearch && phoneSearch.query_norm === null && phoneSearch.metadata?.count === 3)
const out = await one("SELECT metadata FROM analytics_events WHERE name = 'outbound_clicked' AND session_id = $1", [sid])
step('an unknown property is dropped, not stored', out && out.metadata?.kind === 'directions' && !('secret' in out.metadata))
const sess = await one('SELECT * FROM analytics_sessions WHERE session_id = $1', [sid])
step('a landing path keeps no query and a referrer only its host', sess?.landing === '/' && sess?.referrer === 'instagram.com', `${sess?.landing} ${sess?.referrer}`)
const leaked = await one("SELECT COUNT(*)::int n FROM analytics_events WHERE metadata::text ~ '@|secret|555'")
step('nothing personal reaches an event', leaked.n === 0)

/* ------------------------------------------------------------ 4. duplicates */
const same = rid()
await batch(d, { v: 'test', sid, events: [{ e: 'share_clicked', id: same, t: Date.now(), p: { brand, surface: 'business_page' } }] })
await batch(d, { v: 'test', sid, events: [{ e: 'share_clicked', id: same, t: Date.now(), p: { brand, surface: 'business_page' } }] })
const shares = await one("SELECT COUNT(*)::int n FROM analytics_events WHERE name = 'share_clicked' AND session_id = $1", [sid])
step('a batch sent twice is counted once', shares.n === 1, `${shares.n}`)
const imp = (id) => ({ e: 'tile_impression', id, t: Date.now(), p: { brand, city: 'Redwood City', page_kind: 'goods', seat: 'redwood-city-goods-9', surface: 'home_tile', position: 9 } })
await batch(d, { v: 'test', sid, events: [imp(rid()), imp(rid()), imp(rid())] })
const imps = await one("SELECT COUNT(*)::int n FROM analytics_events WHERE name = 'tile_impression' AND session_id = $1", [sid])
step('a tile seen again in the same visit is one impression', imps.n === 1, `${imps.n}`)

/* ------------------------------------------------ 5. bots, GPC, the team */
const bot = jar()
await batch(bot, { v: 'test', sid: rid() + rid(), events: [{ e: 'business_opened', id: rid(), t: Date.now(), p: { brand } }] }, { 'user-agent': 'Googlebot/2.1' })
const botRow = await one("SELECT is_bot FROM analytics_events WHERE name = 'business_opened' AND is_bot ORDER BY occurred_at DESC LIMIT 1")
step('a crawler is kept apart, marked as a bot', botRow?.is_bot === true)
const g = jar()
const gsid = rid() + rid()
await batch(g, { v: 'test', sid: gsid, events: [{ e: 'business_opened', id: rid(), t: Date.now(), p: { brand } }] }, { 'sec-gpc': '1' })
const gRow = await one("SELECT anon_id, session_id, member_id FROM analytics_events WHERE name = 'business_opened' AND anon_id IS NULL AND NOT is_bot ORDER BY occurred_at DESC LIMIT 1")
step('Global Privacy Control: counted, with no visitor, session or member', !!gRow && gRow.session_id === null && gRow.member_id === null && !g.has('beasty_device') && !(await one('SELECT 1 x FROM analytics_sessions WHERE session_id = $1', [gsid])))
const team = jar()
const token = createHmac('sha256', SECRET).update('beasty-team-device').digest('base64url').slice(0, 22)
const tr = await send(team, `/t/team/${token}`)
step('the team link marks the device and goes home', tr.status === 302 && tr.headers.get('location') === '/?team=1')
await batch(team, { v: 'test', sid: rid() + rid(), events: [{ e: 'business_opened', id: rid(), t: Date.now(), p: { brand } }] })
const teamRow = await one("SELECT is_internal FROM analytics_events WHERE name = 'business_opened' AND is_internal LIMIT 1")
step("and the team's own browsing is marked internal", teamRow?.is_internal === true)
const wrong = await send(jar(), '/t/team/not-the-token')
step('a wrong team link just goes home', wrong.status === 302 && wrong.headers.get('location') === '/')

/* -------------------------------------- 6. sign-up links the device's past */
const email = `intel-${port}@audit.beastypages.dev`
await send(d, '/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Intel Test', email }) })
let code
for (let i = 0; i < 40 && !code; i++) { await wait(250); code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1] }
const vr = await send(d, '/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, code }) })
const member = await one('SELECT id FROM members WHERE email = $1', [email])
step('a visitor signs up', vr.status === 201 && !!member, `${vr.status}`)
const linked = await one('SELECT member_id FROM analytics_visitors WHERE anon_id = $1', [sess?.anon_id])
step('the device they joined on is linked to them', linked?.member_id === member?.id)
const history = await one(`SELECT COUNT(*)::int n FROM analytics_events e JOIN analytics_visitors v ON v.anon_id = e.anon_id WHERE v.member_id = $1 AND e.member_id IS NULL`, [member?.id])
step('and what that device did before joining reads as their history, unrewritten', history.n >= 3, `${history.n} earlier events`)
const signedUp = await one("SELECT actor FROM analytics_events WHERE name = 'user_signed_up' AND member_id = $1", [member?.id])
step('the sign-up event carries the device too', signedUp?.actor === sess?.anon_id)
await batch(d, { v: 'test', sid, events: [{ e: 'business_opened', id: rid(), t: Date.now(), p: { brand } }] })
const asMember = await one("SELECT actor_type, member_id FROM analytics_events WHERE name = 'business_opened' AND member_id IS NOT NULL LIMIT 1")
step('once signed in, events carry the member', asMember?.member_id === member?.id && asMember?.actor_type === 'member')

/* ------------------------------------- 7. the directory's day and its seats */
const days = await one('SELECT COUNT(*)::int n FROM analytics_brand_days')
const seats = await one('SELECT COUNT(*)::int n FROM analytics_placements WHERE to_at IS NULL')
step("today's snapshot of every business, and every seat's holder", days.n > 400 && seats.n > 400, `${days.n} businesses, ${seats.n} seats`)

/* ------------------------- 8. deleting a member keeps the numbers standing */
await db.query('DELETE FROM members WHERE id = $1', [member.id])
const kept = await one("SELECT COUNT(*)::int n FROM analytics_events WHERE name = 'user_signed_up' AND actor = $1", [sess?.anon_id])
step("a deleted member's events stay, with the link cleared", kept.n === 1)

/* ------------------------------- 9. tracking blocked: the site still works */
const blocked = await b.newContext({ viewport: { width: 393, height: 852 } })
const bp = await blocked.newPage()
const blockedErrors = []
bp.on('pageerror', (e) => blockedErrors.push(e.message))
await blocked.route('**/api/t/**', (r) => r.abort())
await bp.goto(`${base}/?b=${brand}`, { waitUntil: 'domcontentloaded' })
const opens = await bp.waitForSelector('.brand-body', { timeout: 20000 }).then(() => true, () => false)
step('with tracking blocked, a business page still opens, with no page errors', opens && blockedErrors.length === 0, blockedErrors.slice(0, 2).join(' | '))
step('and nothing on the ordinary page load threw', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '))

/* --------------------------------- 10. a visit, tapped through on a phone
   Every event the page reports, from the rows: a shared link, the home
   screen's pages and tiles, a tile tapped, a business's buttons, Search, the
   sign-up prompt, Reserve a Spot, and the app switcher's previews, which are
   drawings of a page and must not count as opening it. */
const jc = await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, userAgent: IPHONE })
const jp = await jc.newPage()
const jErrors = []
jp.on('pageerror', (e) => jErrors.push(e.message))
/* The tap on a call or a website is what is counted; leaving the page is not needed. */
await jp.addInitScript(() => document.addEventListener('click', (e) => { const a = e.target.closest?.('a[href]'); if (a && !a.href.startsWith(location.origin)) e.preventDefault() }, true))
const jflush = () => jp.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
})
const jsid = () => jp.evaluate(() => JSON.parse(localStorage.getItem('fb.session.v1') ?? 'null')?.id ?? null)
const rows = async (name, extra = '', args = []) => { const s = await jsid(); return q(`SELECT * FROM analytics_events WHERE session_id = $1 AND name = $2 ${extra} ORDER BY occurred_at, id`, [s, name, ...args]) }
const until = async (name, n = 1, extra = '', args = []) => { let r = []; for (let i = 0; i < 40; i++) { await jflush(); await wait(250); r = await rows(name, extra, args); if (r.length >= n) break } return r }
/* The tiles of the page in front: the pages to either side are inert. */
const frontTiles = () => jp.evaluate(() => [...document.querySelectorAll('.home-pager button[aria-label]')].filter((x) => !x.closest('[inert]')).map((x) => x.getAttribute('aria-label')))

await jp.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
await jp.waitForSelector('.nav-back', { timeout: 20000 }).catch(() => {})
let [sharedOpen] = await until('business_opened')
step('a shared link: the business it opens is credited to the link', sharedOpen?.brand_id === 'b_zadnagrill' && sharedOpen?.surface === 'share_link', `${sharedOpen?.brand_id} ${sharedOpen?.surface}`)
await jp.waitForTimeout(600)
await jp.click('.nav-back')
let [closed] = await until('business_closed')
step('leaving it reports how long it was open', closed?.brand_id === 'b_zadnagrill' && closed?.metadata?.dwell_ms > 300, `${closed?.metadata?.dwell_ms} ms`)

await jp.waitForTimeout(1600)
const [pagesView] = await until('page_viewed', 1, "AND city = 'BEASTY'")
step('the first page in front is reported, as BEASTY • Pages', pagesView?.page_kind === 'pages' && pagesView?.position === 1, `${pagesView?.city} ${pagesView?.page_kind} ${pagesView?.position}`)
/* BEASTY • Eats follows BEASTY • Pages (2026-10-05): turn to it. */
await jp.evaluate(() => {
  const dots = [...document.querySelectorAll('.page-dots .dot')]
  dots.find((d) => /BEASTY, Eats$/.test(d.getAttribute('aria-label') ?? ''))?.click()
})
await jp.waitForTimeout(1600)
const [pv] = await until('page_viewed', 1, "AND city = 'BEASTY' AND page_kind = 'eats'")
step('turning to BEASTY • Eats is reported, with its place in the swipe', pv?.page_kind === 'eats' && pv?.position >= 2, `${pv?.city} ${pv?.page_kind} ${pv?.position}`)
const tiles = await until('tile_impression', 6)
const first = tiles.find((t) => t.position === 1)
step('with an impression for each business tile on it, seat and position', tiles.length >= 6 && tiles.every((t) => t.surface === 'home_tile' && t.city === 'BEASTY' && /^beasty-eats-\d+$/.test(t.seat ?? '')) && !!first, `${tiles.length} tiles, first ${first?.brand_id} at ${first?.seat}`)

const labels = await frontTiles()
await jp.evaluate((l) => [...document.querySelectorAll('.home-pager button[aria-label]')].find((x) => !x.closest('[inert]') && x.getAttribute('aria-label') === l)?.click(), labels[0])
await jp.waitForSelector('.nav-place', { timeout: 20000 }).catch(() => {})
const tileOpens = await until('business_opened', 1, "AND surface = 'home_tile'")
const tileOpen = tileOpens[0]
const seen = tiles.find((t) => t.brand_id === tileOpen?.brand_id)
step('a tile tapped: the open names the tile it was, seat, page and place', !!tileOpen && !!seen && tileOpen.seat === seen.seat && tileOpen.position === seen.position && tileOpen.page_kind === 'eats' && tileOpen.city === 'BEASTY', `${labels[0]} -> ${tileOpen?.brand_id} ${tileOpen?.seat} #${tileOpen?.position}`)

const outs = await jp.evaluate(() => [...document.querySelectorAll('.brand-body a[href^="tel:"], .brand-body a[href*="maps"], .brand-body a[target="_blank"]')].length)
if (outs) {
  await jp.evaluate(() => (document.querySelector('.brand-body a[href^="tel:"]') ?? document.querySelector('.brand-body a[href*="maps"]') ?? document.querySelector('.brand-body a[target="_blank"]')).click())
  const [o] = await until('outbound_clicked')
  step('a call, directions or website tap is reported, with which', o?.brand_id === tileOpen?.brand_id && ['call', 'directions', 'website', 'order', 'booking', 'instagram', 'email'].includes(o?.metadata?.kind), `${o?.metadata?.kind}`)
} else step('a call, directions or website tap is reported, with which', false, 'no outbound link on that page')
await jp.click('.nav-place')
const [nav] = await until('place_navigated')
/* The button names the business's first page: its city where it has one (BEASTY • Eats
   now holds restaurants seated in their cities too), else BEASTY. */
step("Glenn's button is reported, from the page it was pressed on", nav?.brand_id === tileOpen?.brand_id && nav?.surface === 'nav_place' && !!nav?.city && !!nav?.page_kind, `${nav?.city} ${nav?.page_kind}`)

/* Signed out, Search asks them to join first. */
await jp.waitForTimeout(900)
await jp.locator('button', { hasText: /^Search$/ }).first().click()
const [gate] = await until('gate_shown')
step('the sign-up prompt is reported, with the door it guarded', gate?.metadata?.door === 'search', `${gate?.metadata?.door}`)
await jp.keyboard.press('Escape')

/* Signed in, Search opens: what was searched for, and what was chosen. */
const jemail = `journey-${port}@audit.beastypages.dev`
await jp.evaluate((e) => fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Journey Test', email: e }) }), jemail)
let jcode
for (let i = 0; i < 40 && !jcode; i++) { await wait(250); jcode = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${jemail} `)).pop()?.match(/ (\d{6}) /)?.[1] }
await jp.evaluate(({ e, c }) => fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: e, code: c }) }), { e: jemail, c: jcode })
await jp.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
await jp.waitForSelector('.nav-back', { timeout: 20000 }).catch(() => {})
await jp.click('.nav-back')
await jp.waitForTimeout(900)
await jp.locator('button', { hasText: /^Search$/ }).first().click()
await jp.fill('input[aria-label="Dishes, businesses, categories, cities"]', 'Zad')
await jp.waitForTimeout(300)
await jp.fill('input[aria-label="Dishes, businesses, categories, cities"]', 'Zadna')
await jp.waitForTimeout(1700)
const searched = await until('search_submitted')
step('a search is reported once typing settles, not per letter', searched.length === 1 && searched[0].query_norm === 'zadna' && searched[0].metadata?.count >= 1, searched.map((r) => `${r.query_norm}:${r.metadata?.count}`).join(', '))
step('opening Search is reported', (await rows('search_started')).length >= 1)
await jp.locator('.search-brand', { hasText: 'Zadna Grill' }).first().click()
await jp.waitForSelector('.nav-place', { timeout: 20000 }).catch(() => {})
const [picked] = await until('search_result_clicked')
step('the result chosen: which one, at what place in the list', picked?.brand_id === 'b_zadnagrill' && picked?.metadata?.kind === 'brand' && picked?.position === 1 && picked?.query_norm === 'zadna', `${picked?.brand_id} #${picked?.position}`)
const [fromSearch] = await until('business_opened', 1, "AND surface = 'search_result'")
step('and the business it opened is credited to that search', fromSearch?.brand_id === 'b_zadnagrill' && fromSearch?.query_norm === 'zadna' && fromSearch?.position === 1)

/* The app switcher draws the open apps, business pages included, and a
   drawing is not an open. Paused mid-swipe up from the bottom edge. */
const opensBefore = (await rows('business_opened')).length
const zone = await jp.locator('.home-indicator-zone').boundingBox()
if (zone) {
  const x = zone.x + zone.width / 2, y = zone.y + zone.height / 2
  await jp.mouse.move(x, y)
  await jp.mouse.down()
  for (let i = 1; i <= 20; i++) { await jp.mouse.move(x, y - i * 9); await wait(16) }
  await wait(400)
  await jp.mouse.move(x, y - 181)
  await wait(120)
  await jp.mouse.up()
}
const switcherShown = await jp.waitForSelector('.switcher', { timeout: 3000 }).then(() => true, () => false)
await wait(1200)
await jflush()
await wait(1500)
const opensAfter = (await rows('business_opened')).length
step('the app switcher, showing a business page, counts no open', switcherShown && opensAfter === opensBefore, `${switcherShown ? 'switcher open' : 'switcher did not open'}, ${opensBefore} -> ${opensAfter}`)
await jp.keyboard.press('Escape')

/* A city from Search, then Reserve a Spot from one of its blank tiles: which seat. */
await jp.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
await jp.waitForSelector('.nav-back', { timeout: 20000 }).catch(() => {})
await jp.click('.nav-back')
await jp.waitForTimeout(900)
await jp.locator('button', { hasText: /^Search$/ }).first().click()
await jp.fill('input[aria-label="Dishes, businesses, categories, cities"]', 'Crockett')
await jp.locator('.search-brand.is-city').first().click()
/* A city is added to the swipe before the page turns to it: wait until it has. */
for (let i = 0; i < 40; i++) {
  const here = await jp.evaluate(() => document.querySelector('.page-dots [aria-current="page"]')?.getAttribute('aria-label') ?? '')
  if (/Crockett, Goods$/.test(here)) break
  await wait(250)
}
await jp.waitForTimeout(600)
const [cityPick] = await until('search_result_clicked', 1, "AND metadata->>'kind' = 'city'")
step('a city chosen in Search is reported as a city', cityPick?.city === 'Crockett' && cityPick?.query_norm === 'crockett', `${cityPick?.city}`)
const slotSeat = await jp.evaluate(() => {
  const x = [...document.querySelectorAll('.home-pager button[aria-label*="spot available"]')].find((y) => !y.closest('[inert]'))
  x?.click()
  return x?.getAttribute('aria-label') ?? null
})
const [rs] = slotSeat ? await until('reserve_started') : []
step('Reserve a Spot, from a blank tile, is reported with its seat', !!rs && /^[a-z0-9-]+-[a-z0-9]+-\d+$/.test(rs.seat ?? '') && !!rs.page_kind, `${slotSeat} -> ${rs?.seat} ${rs?.city ?? ''}`)

const strays = await one("SELECT COUNT(*)::int n FROM analytics_events WHERE name IN ('business_opened','search_submitted','search_result_clicked') AND metadata::text ~ '@|login|code'")
step('none of it carries anything personal', strays.n === 0)
step('and nothing on the visit threw', jErrors.length === 0, jErrors.slice(0, 2).join(' | '))
await jc.close()

/* ------------- 11. what the server sees: a Reserve request, a guest order,
   and a membership paid for and stopped, from Stripe's own messages */
const guest = jar()
await send(guest, '/', { headers: { 'user-agent': IPHONE } })
const gs = rid() + rid()
await batch(guest, { v: 'test', sid: gs, events: [{ e: 'reserve_started', id: rid(), t: Date.now(), p: { seat: 'union-city-goods-3', page_kind: 'goods', city: 'Union City' } }] })
const gAnon = (await one('SELECT anon_id FROM analytics_sessions WHERE session_id = $1', [gs]))?.anon_id
const app = await send(guest, '/api/applications', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': IPHONE }, body: JSON.stringify({ business: 'Audit Tacos', phone: '5105550100' }) })
const lead = await one("SELECT actor, entity_id FROM analytics_events WHERE name = 'lead_submitted' ORDER BY occurred_at DESC LIMIT 1")
step('a Reserve a Spot request is recorded against the device that asked', app.status < 300 && !!gAnon && lead?.actor === gAnon, `${app.status} ${lead?.actor === gAnon ? 'same device' : 'different device'}`)
const rs0 = await one("SELECT COUNT(*)::int n FROM analytics_events WHERE name = 'reserve_started' AND anon_id = $1", [gAnon])
step('so the request and the Reserve screen that led to it are one visitor', rs0.n === 1)

const cat = await (await fetch(base + '/api/catalogue')).json()
const simple = (bb) => bb.menu.flatMap((c) => c.items).find((i) => !(i.options || []).some((g) => g.required))
const kitchen = cat.brands.find((bb) => !bb.quoteOnly && !bb.contactOnly && (bb.tier ?? 3) >= 3 && simple(bb))
const ord = await send(guest, '/api/orders', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': IPHONE }, body: JSON.stringify({ lines: [{ itemId: simple(kitchen).id, qty: 1, options: [] }], fulfilment: 'pickup', tipBps: 0, customer: { name: 'Guest Audit', phone: '+15105550142' } }) })
const gOrder = await one("SELECT actor, metadata FROM analytics_events WHERE name = 'guest_order_placed' ORDER BY occurred_at DESC LIMIT 1")
step('an order without an account is recorded, against the device, with no name or number', ord.status === 201 && gOrder?.actor === gAnon && !/Guest|5105550142/.test(JSON.stringify(gOrder?.metadata)), `${ord.status}`)

const hook = async (evt) => {
  const payload = JSON.stringify(evt)
  const ts = Math.floor(Date.now() / 1000)
  const sig = `t=${ts},v1=${createHmac('sha256', WHSEC).update(`${ts}.${payload}`).digest('hex')}`
  return (await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': sig }, body: payload })).status
}
const payer = jar()
const pemail = `payer-${port}@audit.beastypages.dev`
await send(payer, '/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Payer Test', email: pemail }) })
let pcode
for (let i = 0; i < 40 && !pcode; i++) { await wait(250); pcode = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${pemail} `)).pop()?.match(/ (\d{6}) /)?.[1] }
await send(payer, '/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: pemail, code: pcode }) })
const payerId = (await one('SELECT id FROM members WHERE email = $1', [pemail]))?.id
const paid = { id: 'evt_paid_' + port, type: 'checkout.session.completed', data: { object: { client_reference_id: payerId, customer: 'cus_audit_' + port } } }
const h1 = await hook(paid)
await hook(paid)
const acts = await one("SELECT COUNT(*)::int n FROM analytics_events WHERE name = 'membership_activated' AND member_id = $1", [payerId])
step("Stripe's payment makes a membership_activated, once however often Stripe retries", h1 === 200 && acts.n === 1, `${h1}, ${acts.n}`)
await hook({ id: 'evt_stop_' + port, type: 'customer.subscription.deleted', data: { object: { customer: 'cus_audit_' + port } } })
await hook({ id: 'evt_fail_' + port, type: 'invoice.payment_failed', data: { object: { customer: 'cus_audit_' + port } } })
const lapses = await q("SELECT metadata FROM analytics_events WHERE name = 'membership_lapsed' AND member_id = $1", [payerId])
step('and its cancellation one membership_lapsed, not one per failed invoice after', lapses.length === 1 && lapses[0].metadata?.why === 'cancelled', lapses.map((l) => l.metadata?.why).join(', '))

await b.close()
await db.end()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: visits, visitors, members, links, duplicates, bots, the team, GPC, blocked tracking, a tapped-through visit and the server events all hold, read from the rows.')
