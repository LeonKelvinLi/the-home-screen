/*
  City and State, Find friends and the slimmer Contacts — Glenn's asks of
  19 October 2026:
    "add City and State when people sign up to appear here. That way people
     can befriend people in their same city if they want to. It is also good
     to add to our analytics."
    "I just got this message from one of those apps Beli. We should do
     something very similar but change it to something referring to the 💎
     points."
    "can you make the owners a button that will drop down the 3 contacts",
    one line each with a phone and an email icon, the note as a bubble after
    two seconds, and a drop-down per set of letters (A–H, I–Q, R–Z).

  The rules on the server first, then a member on a phone.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync, readFileSync } from 'node:fs'
import pg from 'pg'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('cityfriends')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-city-friends-${port}.log`
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', openSync(LOG, 'w'), openSync(LOG, 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 160; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }
const db = new pg.Client({ connectionString: TESTDB.url })
await db.connect()
const q = async (sql, args = []) => (await db.query(sql, args)).rows
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail !== '' ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }

let ipn = 1
const ip = () => ({ 'x-forwarded-for': `10.78.${(ipn >> 8) & 255}.${ipn++ & 255}` })
const codeFor = async (email) => {
  for (let i = 0; i < 60; i++) {
    const c = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
    if (c) return c
    await wait(200)
  }
  throw new Error(`no code for ${email}`)
}
const start = (body) => fetch(base + '/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json', ...ip() }, body: JSON.stringify(body) })
const signUp = async (name, email, extra = {}) => {
  const s = await start({ name, email, ...extra })
  if (s.status >= 300) throw new Error(`start ${s.status}`)
  const code = await codeFor(email)
  const v = await fetch(base + '/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json', ...ip() }, body: JSON.stringify({ email, code }) })
  if (v.status >= 300) throw new Error(`verify ${v.status}`)
  const cookie = v.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')
  const body = await v.json()
  return { id: body.id, name, email, cookie, status: v.status, body }
}
const as = (m) => async (method, path, body) => {
  const r = await fetch(base + path, { method, headers: { ...ip(), ...(m ? { cookie: m.cookie } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, body: await r.json().catch(() => ({})) }
}
const tag = String(port)
/* CITY_SHOTS=<dir> saves the phone screenshots there. */
const SHOTS = process.env.CITY_SHOTS
const shot = async (pg, name) => { if (SHOTS) await pg.screenshot({ path: `${SHOTS}/${name}.png` }) }

let browser
try {
  /* ------------------------------------------------ 1. sign-up keeps the place */
  const A = await signUp('Ava Alpha', `a-${tag}@audit.beastypages.dev`, { city: 'concord', state: 'ca' })
  step('a new account answers 201, so the form knows to open Find friends', A.status === 201)
  step('sign-up stores the city tidied and the state as its code', A.body.city === 'Concord' && A.body.state === 'CA', `${A.body.city}, ${A.body.state}`)
  step('a street address is refused as a city', (await start({ name: 'Bad Street', email: `x-${tag}@audit.beastypages.dev`, city: '123 Main St', state: 'CA' })).status === 400)
  step('a made-up state is refused', (await start({ name: 'Bad State', email: `y-${tag}@audit.beastypages.dev`, city: 'Oakland', state: 'ZZ' })).status === 400)
  step('an older client that sends no city still signs up', (await start({ name: 'Old Client', email: `z-${tag}@audit.beastypages.dev` })).status === 202)

  /* B joins with A's code, so A has real 💎 points; C lives in Concord too. */
  const B = await signUp('Ben Bravo', `b-${tag}@audit.beastypages.dev`, { city: 'Vallejo', state: 'CA', ref: A.body.referralCode })
  const C = await signUp('Cal Charlie', `c-${tag}@audit.beastypages.dev`, { city: 'Concord', state: 'CA' })
  const D = await signUp('Dee Delta', `d-${tag}@audit.beastypages.dev`)
  const ev = await q(`SELECT metadata FROM analytics_events WHERE name = 'user_signed_up' AND member_id = $1`, [C.id])
  step('the sign-up event carries city and state for the analytics', ev[0]?.metadata?.city === 'Concord' && ev[0]?.metadata?.state === 'CA')

  /* ------------------------------------- 2. a member from before adds theirs */
  step('a member with no city starts blank', D.body.city === '' && D.body.state === '')
  const d = as(D)
  step('Profile refuses a city with numbers', (await d('PUT', '/api/members/me/place', { city: 'Unit 4', state: 'CA' })).status === 400)
  const saved = await d('PUT', '/api/members/me/place', { city: 'antioch', state: 'CA' })
  step('Profile saves a city and state', saved.status === 200 && saved.body.city === 'Antioch', JSON.stringify(saved.body))
  /* A sign-in never overwrites a city already set. */
  await start({ name: 'Dee Delta', email: D.email, city: 'Fresno', state: 'CA' })
  const code = await codeFor(D.email)
  await fetch(base + '/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json', ...ip() }, body: JSON.stringify({ email: D.email, code }) })
  step('signing in again never overwrites a city already set', (await q('SELECT city FROM members WHERE id = $1', [D.id]))[0].city === 'Antioch')

  /* --------------------------------------------- 3. the directory and pages */
  const dir = await as(C)('GET', '/api/members/directory')
  const row = dir.body.members.find((m) => m.id === A.id)
  step('Contacts carries "Concord, CA" beside the name', row?.place === 'Concord, CA', row?.place)
  const page = await as(C)('GET', `/api/members/${A.id}/profile`)
  step("a member's page carries their place", page.body.place === 'Concord, CA')

  /* ---------------------------------------- 4. Find friends, with 💎 points */
  const sug = await as(C)('GET', '/api/friends/suggested')
  const people = sug.body.people ?? []
  step('Find friends never suggests yourself', !people.some((p) => p.id === C.id))
  step('people in your own city come first', people[0]?.id === A.id && people[0]?.sameCity === true, people.map((p) => p.name).join(', '))
  step('points are 3 for each real referral', people.find((p) => p.id === A.id)?.points === 3 && people.find((p) => p.id === B.id)?.points === 0)
  step('your own points are counted the same way', (await as(A)('GET', '/api/friends/suggested')).body.myPoints === 3)
  step('a stranger cannot read suggestions', (await as(null)('GET', '/api/friends/suggested')).status === 401)
  await as(C)('POST', '/api/friends/requests', { to: A.id })
  step('someone already asked drops off the list', !(await as(C)('GET', '/api/friends/suggested')).body.people.some((p) => p.id === A.id))

  /* --------------------------------------------------- 5. on a phone, for real */
  browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  await ctx.addCookies(B.cookie.split('; ').map((kv) => { const i = kv.indexOf('='); return { name: kv.slice(0, i), value: kv.slice(i + 1), url: base } }))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto(`${base}/contacts`, { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('.contacts-letter-head', { timeout: 20000 })
  const marks = await p.$$eval('.contacts-letter-mark', (m) => m.map((e) => e.textContent?.trim()))
  step('the list groups names A–H, I–Q and R–Z', marks.every((m) => ['A–H', 'I–Q', 'R–Z', '#'].includes(m)) && marks.includes('A–H'), marks.join(' '))
  step('the owners start closed and the bubble is not up yet', (await p.locator('.owner-line').count()) === 0 && (await p.locator('.owners-bubble.is-shown').count()) === 0)
  await p.waitForSelector('.owners-bubble.is-shown', { timeout: 5000 })
  step('the owners bubble rises in after two seconds', true)
  await p.waitForTimeout(400)
  await shot(p, '1-contacts-bubble')
  await p.locator('.owners-head').click()
  step('the Owners button drops down three one-line owners', (await p.locator('.owner-line').count()) === 3)
  await p.locator('.contacts-letter-head', { has: p.locator('.contacts-letter-mark', { hasText: 'A–H' }) }).click()
  const ava = p.locator('.ios-row', { hasText: 'Ava A.' }).first()
  step('a row shows Member since and the town', (await ava.innerText()).includes('Concord, CA'))
  await shot(p, '2-contacts-open')

  await p.locator('.contacts-find').click()
  await p.waitForSelector('.ff-row', { timeout: 15000 })
  step('Find friends opens from Contacts with points on each row', (await p.locator('.ff-row').first().innerText()).includes('point'))
  step('Find friends shows your own points', (await p.locator('.ff-mine').innerText()).includes('0 points'))
  const rows = await p.locator('.ff-row').count()
  await p.waitForTimeout(1500)
  await shot(p, '3-find-friends')
  step('up to five are ticked to start, like Beli', (await p.locator('.ff-row.is-on').count()) === Math.min(5, rows))
  /* With five or fewer, all start ticked and the button reads Clear all. */
  if ((await p.locator('.ff-all').innerText()) === 'Clear all') {
    await p.locator('.ff-all').click()
    step('Clear all unticks everyone', (await p.locator('.ff-row.is-on').count()) === 0)
  }
  await p.locator('.ff-all').click()
  step('Select all ticks everyone', (await p.locator('.ff-row.is-on').count()) === rows)
  await p.locator('.ff-add').click()
  await p.waitForSelector('.ff-done', { timeout: 15000 })
  const sent = (await q(`SELECT COUNT(*)::int n FROM member_friendships WHERE requester_id = $1`, [B.id]))[0].n
  step('Add sends a real friend request to each one picked', sent === rows, `${sent} of ${rows}`)

  /* Three quiet seconds on the home screen open the reels (Glenn, 19 Oct),
     once a visit; activity keeps the home screen. The automation flag is
     cleared here, as the landing audit does, because the real thing is off
     for automated browsers. */
  const hctx = await browser.newContext({ viewport: { width: 393, height: 852 } })
  await hctx.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false })
    try { localStorage.setItem('fb.homeHint.v1', '1') } catch {}
  })
  await hctx.addCookies(B.cookie.split('; ').map((kv) => { const i = kv.indexOf('='); return { name: kv.slice(0, i), value: kv.slice(i + 1), url: base } }))
  const h = await hctx.newPage()
  h.on('pageerror', (e) => errors.push(e.message))
  await h.goto(base + '/', { waitUntil: 'domcontentloaded' })
  await h.waitForSelector('.dialer-call', { timeout: 30000 })
  await wait(3500)
  /* The first press skips the intro if it is still running; the next enters. */
  for (let i = 0; i < 4 && !(await h.locator('.spotlight').count()); i++) {
    await h.evaluate(() => document.querySelector('.dialer-call')?.click())
    await wait(1500)
  }
  await h.waitForSelector('.spotlight', { timeout: 30000 })
  for (let i = 0; i < 5; i++) { await h.mouse.move(100 + i * 20, 400); await wait(1000) }
  step('a busy home screen stays put', (await h.locator('.reels').count()) === 0)
  await h.waitForSelector('.reels', { timeout: 6000 }).catch(() => {})
  step('three quiet seconds on the home screen open the reels', (await h.locator('.reels').count()) === 1)
  step('the reels bubble is gone from the home screen', (await h.locator('.spotlight-watch-wrap .reel-hint').count()) === 0)
  await h.locator('.nav-back, .reels-close, [aria-label="Close"]').first().click().catch(() => {})
  await h.waitForSelector('.spotlight', { timeout: 15000 }).catch(() => {})
  await wait(4500)
  step('once a visit: back on the home screen, it does not open again', (await h.locator('.reels').count()) === 0)

  /* Sign-up form: City and State, and a new member lands on Find friends. */
  const p2 = await (await browser.newContext({ viewport: { width: 393, height: 852 } })).newPage()
  p2.on('pageerror', (e) => errors.push(e.message))
  /* Signed out, Contacts asks you in: the way a visitor reaches the form. */
  await p2.goto(`${base}/contacts`, { waitUntil: 'domcontentloaded' })
  await p2.locator('.contacts-join .btn-primary').click({ timeout: 20000 })
  await p2.waitForSelector('.join-field input[autocomplete="address-level2"]', { timeout: 15000 })
  step('the sign-up form asks for City and State', (await p2.locator('.join-field select[autocomplete="address-level1"]').inputValue()) === 'CA')
  await p2.waitForTimeout(1500)
  await shot(p2, '4-join-form')
  const email = `e-${tag}@audit.beastypages.dev`
  await p2.fill('.join-field input[autocomplete="name"]', 'Eve Echo')
  await p2.fill('.join-field input[autocomplete="address-level2"]', 'Concord')
  await p2.fill('.join-field input[type="email"]', email)
  await p2.locator('form.join button[type="submit"]').click()
  await p2.waitForSelector('.join-code', { timeout: 15000 })
  await p2.locator('.join-code').fill(await codeFor(email))
  await p2.locator('form.join button[type="submit"]').click()
  await p2.waitForSelector('.ff', { timeout: 15000 })
  step('a brand-new member goes straight to Find friends', (await p2.locator('.ff-title').innerText()).includes('people you trust'))
  step('Find friends puts the other Concord members first for her', (await p2.locator('.ff-row').first().innerText()).includes('Near you'))
  await p2.waitForTimeout(1500)
  await shot(p2, '5-new-member-find-friends')
  step('no page errors', errors.length === 0, errors.join(' | '))
} catch (e) {
  fails.push(e.message)
  console.log('FAIL', e.stack)
} finally {
  await browser?.close()
  await db.end()
  srv.kill()
  await TESTDB.drop()
}
if (fails.length) { console.log(`FAIL: ${fails.length} city, Find friends and Contacts checks`); process.exit(1) }
console.log('PASS: city and state at sign-up and on Profile, Find friends with real points, and the slimmer Contacts.')
