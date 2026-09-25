/*
  Friends, the MySpace way: every rule proven on the server, then two members
  on two phones doing it for real. Glenn, 2026-09-24: "top 3 friends",
  "exactly like myspace concept"; the design is
  docs/superpowers/specs/2026-09-25-top-friends-design.md.

  FRIENDS_SHOTS=<dir> saves the phone screenshots there.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync, readFileSync } from 'node:fs'
import pg from 'pg'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('friends')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-friends-${port}.log`
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
const SHOTS = process.env.FRIENDS_SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const fails = []
const step = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail !== '' ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }

/* Each call from its own address: the per-minute limiter is per IP and this
   whole audit is one machine, so without this it would trip long before the
   daily limit this checks. The server trusts one proxy hop, as on Render. */
let ipn = 1
const ip = () => ({ 'x-forwarded-for': `10.77.${(ipn >> 8) & 255}.${ipn++ & 255}` })

/* A member is a cookie jar that signed up through the real two-step flow. */
const codeFor = async (email) => {
  for (let i = 0; i < 60; i++) {
    const c = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
    if (c) return c
    await wait(200)
  }
  throw new Error(`no code for ${email}`)
}
const signUp = async (name, email) => {
  const s = await fetch(base + '/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json', ...ip() }, body: JSON.stringify({ name, email }) })
  if (s.status >= 300) throw new Error(`start ${s.status}`)
  const code = await codeFor(email)
  const v = await fetch(base + '/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json', ...ip() }, body: JSON.stringify({ email, code }) })
  if (v.status >= 300) throw new Error(`verify ${v.status}`)
  const cookie = v.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')
  const body = await v.json()
  return { id: body.id, name, email, cookie }
}
const as = (m) => async (method, path, body) => {
  const r = await fetch(base + path, { method, headers: { ...ip(), ...(m ? { cookie: m.cookie } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, body: await r.json().catch(() => ({})) }
}
const tag = String(port)
const A = await signUp('Ava Alpha', `a-${tag}@audit.beastypages.dev`)
const B = await signUp('Ben Bravo', `b-${tag}@audit.beastypages.dev`)
const C = await signUp('Cal Charlie', `c-${tag}@audit.beastypages.dev`)
const D = await signUp('Dee Delta', `d-${tag}@audit.beastypages.dev`)
const a = as(A), b = as(B), c = as(C), d = as(D), anon = as(null)
const rel = async (viewer, id) => (await viewer('GET', `/api/members/${id}/profile`)).body.relation
const waiting = async (viewer) => (await viewer('GET', '/api/members/me')).body.friendRequests

/* ------------------------------------------------------------ 1. doors */
step('signed out, the friends list is closed', (await anon('GET', '/api/friends')).status === 401)
step('signed out, no request can be sent', (await anon('POST', '/api/friends/requests', { to: A.id })).status === 401)
step('asking yourself is refused', (await a('POST', '/api/friends/requests', { to: A.id })).status === 400)
step('asking a member who does not exist is a 404', (await a('POST', '/api/friends/requests', { to: 'm_nobody' })).status === 404)

/* ------------------------------------------------------ 2. ask, cancel */
let r = await a('POST', '/api/friends/requests', { to: B.id })
step('A asks B: A sees Request sent', r.status === 200 && r.body.relation === 'sent', JSON.stringify(r.body))
step('B sees it waiting: the badge count is 1, and A is in the list', (await waiting(b)) === 1 && (await b('GET', '/api/friends')).body.requests?.[0]?.id === A.id)
step("on each other's pages: A sees sent, B sees received", (await rel(a, B.id)) === 'sent' && (await rel(b, A.id)) === 'received')
step('asking twice changes nothing', (await a('POST', '/api/friends/requests', { to: B.id })).body.relation === 'sent' && (await waiting(b)) === 1)
r = await a('DELETE', `/api/friends/requests/${B.id}`)
step('A cancels: nothing between them, and B has nothing waiting', r.body.relation === 'none' && (await waiting(b)) === 0 && (await rel(b, A.id)) === 'none')

/* ------------------------------------------------ 3. a silent decline */
await a('POST', '/api/friends/requests', { to: B.id })
r = await b('POST', `/api/friends/requests/${A.id}/decline`)
step('B declines: B sees nothing between them', r.status === 200 && (await rel(b, A.id)) === 'none' && (await waiting(b)) === 0)
step('A is not told: A still sees Request sent', (await rel(a, B.id)) === 'sent')
await a('POST', '/api/friends/requests', { to: B.id })
step('A asking again inside 30 days reaches nobody', (await waiting(b)) === 0 && (await rel(a, B.id)) === 'sent')
await a('DELETE', `/api/friends/requests/${B.id}`)
step('A withdrawing it clears their button', (await rel(a, B.id)) === 'none')
await a('POST', '/api/friends/requests', { to: B.id })
step('and asking once more still reaches nobody inside the 30 days', (await waiting(b)) === 0 && (await rel(a, B.id)) === 'sent')
await db.query(`UPDATE member_friendships SET responded_at = $1 WHERE requester_id = $2 AND addressee_id = $3`, [Date.now() - 31 * 86400000, A.id, B.id])
await a('POST', '/api/friends/requests', { to: B.id })
step('after 30 days A may ask again, and B sees it', (await waiting(b)) === 1 && (await rel(b, A.id)) === 'received')
r = await b('POST', `/api/friends/requests/${A.id}/accept`)
step('B accepts: friends both ways, one friend each', r.body.relation === 'friends' && (await rel(a, B.id)) === 'friends' && (await rel(b, A.id)) === 'friends' && (await a('GET', `/api/members/${A.id}/profile`)).body.friendCount === 1)
step('answering a request that is no longer waiting is a 404', (await b('POST', `/api/friends/requests/${A.id}/accept`)).status === 404)

/* ------------------------------------------------- 4. crossed requests */
await c('POST', '/api/friends/requests', { to: A.id })
r = await a('POST', '/api/friends/requests', { to: C.id })
step('C asked A; A asking C back makes them friends', r.body.relation === 'friends' && (await rel(c, A.id)) === 'friends' && (await waiting(a)) === 0)

/* --------------------------------------------------------- 5. the Top 3 */
r = await a('PUT', '/api/friends/top', { ids: [C.id, B.id] })
step('A sets a Top 3 of C then B', r.status === 200 && JSON.stringify(r.body.top) === JSON.stringify([C.id, B.id]))
const seen = (await d('GET', `/api/members/${A.id}/profile`)).body
step("anyone signed in sees A's Top 3, in order, with names and ranks", seen.top3?.map((x) => `${x.position}:${x.id}`).join(',') === `1:${C.id},2:${B.id}` && seen.top3[0].name === 'Cal C.', JSON.stringify(seen.top3))
step('someone who is not a friend cannot go in the Top 3', (await a('PUT', '/api/friends/top', { ids: [D.id] })).status === 400)
step('the same friend twice is refused', (await a('PUT', '/api/friends/top', { ids: [B.id, B.id] })).status === 400)
step('more than three is refused', (await a('PUT', '/api/friends/top', { ids: [B.id, C.id, D.id, A.id] })).status === 400)
step('D, a friend of nobody, cannot put A in theirs', (await d('PUT', '/api/friends/top', { ids: [A.id] })).status === 400)
step("a refused change leaves A's Top 3 as it was", (await a('GET', '/api/friends')).body.top?.join(',') === `${C.id},${B.id}`)
await b('PUT', '/api/friends/top', { ids: [A.id] })

/* ----------------------------------------------------------- 6. remove */
r = await a('DELETE', `/api/friends/${B.id}`)
const aTop = (await a('GET', '/api/friends')).body.top
const bTop = (await b('GET', '/api/friends')).body.top
step('A removes B: gone from both lists, and from both Top 3s', r.status === 200 && (await rel(a, B.id)) === 'none' && aTop.join(',') === C.id && bTop.length === 0, `${aTop} / ${bTop}`)

/* -------------------------------------------------------------- 7. pets */
step('a pet that cannot be drawn is refused', (await a('PUT', '/api/members/me/avatar', { kind: 'pet', pet: { species: 'dragon', coat: '#C98A4B', backdrop: '#FFE9A8', accessory: '' } })).status === 400)
r = await a('PUT', '/api/members/me/avatar', { kind: 'pet', pet: { species: 'cat', coat: '#3B3B3F', backdrop: '#CDE8FF', accessory: 'shades' } })
const dir = (await d('GET', '/api/members/directory')).body.members.find((m) => m.id === A.id)
step("A's built pet reaches the account, Contacts and their page", r.status === 200 && dir?.pet?.species === 'cat' && (await d('GET', `/api/members/${A.id}/profile`)).body.pet?.accessory === 'shades')
await a('PUT', '/api/members/me/avatar', { kind: 'none' })
step('choosing a photo clears it: no picture of theirs is stored', !(await d('GET', `/api/members/${A.id}/profile`)).body.pet)
const cols = (await q(`SELECT column_name FROM information_schema.columns WHERE table_name = 'member_avatars'`)).map((x) => x.column_name)
step('the avatar table has nowhere to put a photo', !cols.some((x) => /photo|image|data/.test(x)), cols.join(','))

/* --------------------------------------------------------- 8. the limit */
const fakes = []
for (let i = 0; i < 31; i++) fakes.push(`m_fake_${tag}_${i}`)
for (const id of fakes) await db.query(`INSERT INTO members (id, name, email, referral_code, created_at) VALUES ($1, 'Fake Person', $2, $3, $4)`, [id, `${id}@audit.beastypages.dev`, `F${tag}${fakes.indexOf(id)}`.slice(0, 16), Date.now()])
let last
for (const id of fakes) last = await d('POST', '/api/friends/requests', { to: id })
const sent = (await q(`SELECT COUNT(*)::int n FROM member_friendships WHERE requester_id = $1`, [D.id]))[0].n
step('thirty new requests a day, and the next is refused', last.status === 429 && sent === 30, `${last.status}, ${sent} stored`)

/* ---------------------------------------------------- 9. deleted member */
await db.query('DELETE FROM members WHERE id = $1', [C.id])
const left = (await q(`SELECT COUNT(*)::int n FROM member_friendships WHERE requester_id = $1 OR addressee_id = $1`, [C.id]))[0].n
step("a deleted member's friendships and Top 3 places go with them", left === 0 && (await a('GET', '/api/friends')).body.top.length === 0)

/* ---------------------------------------------- 10. events for the CRM */
const ev = (await q(`SELECT name, COUNT(*)::int n FROM analytics_events WHERE name LIKE 'friend_%' GROUP BY name`)).reduce((o, x) => ({ ...o, [x.name]: x.n }), {})
step('requests, accepts and removals are counted for the CRM', ev.friend_requested >= 2 && ev.friend_accepted >= 2 && ev.friend_removed >= 1, JSON.stringify(ev))

/* ------------------------------------ 11. two members, two phones, for real */
const F = await signUp('Fay Fox', `f-${tag}@audit.beastypages.dev`)
const G = await signUp('Gus Gale', `g-${tag}@audit.beastypages.dev`)
await as(G)('PUT', '/api/members/me/avatar', { kind: 'pet', pet: { species: 'rabbit', coat: '#F2F2F4', backdrop: '#FFD9E0', accessory: 'bow' } })
const browser = await chromium.launch()
const phone = async (m) => {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  await ctx.addCookies(m.cookie.split('; ').map((kv) => { const i = kv.indexOf('='); return { name: kv.slice(0, i), value: kv.slice(i + 1), url: base } }))
  const p = await ctx.newPage()
  p.errors = []
  p.on('pageerror', (e) => p.errors.push(e.message))
  return p
}
const shot = async (p, name) => { if (SHOTS) await p.screenshot({ path: `${SHOTS}/${name}.png` }) }
const openContactsOn = async (p, letter, who) => {
  await p.goto(`${base}/contacts`, { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('.contacts-letter-head', { timeout: 20000 })
  await p.locator('.contacts-letter-head', { hasText: letter }).first().click()
  await p.locator('.contact-row', { hasText: who }).first().click()
  await p.waitForSelector('.member-page .prof-name', { timeout: 20000 })
  await p.waitForTimeout(600)
}
const gus = await phone(G)
const fay = await phone(F)

await openContactsOn(gus, 'F', 'Fay F.')
step("on Fay's page Gus sees Add friend and 0 friends", (await gus.locator('.friend-btn').first().textContent()) === 'Add friend' && (await gus.locator('.member-friends').textContent()).includes('0 friends'))
/* Every face drawn has its colours: a hash past 2^31 once gave half of all
   members no backdrop and no coat, drawn as a black disc (FriendFace.tsx). */
const facesOk = async (p) =>
  p.evaluate(() => [...document.querySelectorAll('.pet-art')].every((svg) => !!svg.querySelector('circle')?.getAttribute('fill') && !!svg.querySelector('ellipse')?.getAttribute('fill')))
step('every face on her page has its colours', await facesOk(gus))
step('with no Top 3 yet, her page says so instead of empty circles', (await gus.locator('.member-page .top3').count()) === 0 && /not picked a Top 3 yet/.test(await gus.locator('.member-page').textContent()))
await shot(gus, '1-gus-sees-fay')
await gus.locator('.friend-btn', { hasText: 'Add friend' }).click()
await gus.waitForTimeout(800)
step('Gus taps Add friend: the button says Request sent', (await gus.locator('.friend-btn').first().textContent()) === 'Request sent')
await shot(gus, '2-gus-request-sent')

await fay.goto(`${base}/?b=b_zadnagrill`, { waitUntil: 'domcontentloaded' })
await fay.waitForSelector('.nav-back', { timeout: 20000 })
await fay.click('.nav-back')
await fay.waitForTimeout(1500)
const badge = await fay.evaluate(() => [...document.querySelectorAll('button[aria-label]')].find((x) => /^Profile/.test(x.getAttribute('aria-label')))?.getAttribute('aria-label') ?? null)
step("Fay's Profile tile shows the request", /1 friend request\b/.test(badge ?? ''), badge)
await shot(fay, '3-fay-home-badge')
await fay.evaluate(() => [...document.querySelectorAll('button[aria-label]')].find((x) => /^Profile/.test(x.getAttribute('aria-label')))?.click())
await fay.waitForSelector('.friend-requests', { timeout: 20000 })
await fay.waitForTimeout(600)
await shot(fay, '4-fay-profile-request')
await fay.locator('.friend-requests .friend-mini', { hasText: 'Accept' }).click()
await fay.waitForSelector('.friend-requests', { state: 'detached', timeout: 10000 }).catch(() => {})
await fay.waitForTimeout(800)
step('Fay accepts: the request is gone and Gus is a friend', (await fay.locator('.friend-requests').count()) === 0 && (await fay.locator('.friend-all').textContent()).includes('(1)'))
await fay.locator('.prof-top3 .prof-edit').click()
await fay.locator('.top3-pick', { hasText: 'Gus G.' }).click()
step('picking fills the Top 3 row as it happens, before saving', /#1\s*Gus G\./.test(await fay.locator('.prof-top3 .top3-slot').first().textContent()))
await shot(fay, '5-fay-picks-top3')
await fay.locator('.friend-btn', { hasText: 'Save Top 3' }).click()
await fay.waitForTimeout(800)
const topRow = await fay.locator('.prof-top3 .top3-slot').first().textContent()
step('Fay puts Gus at #1 on her Top 3', /#1/.test(topRow) && /Gus G\./.test(topRow), topRow)
await fay.locator('.prof-top3').scrollIntoViewIfNeeded()
await shot(fay, '6-fay-top3')

await openContactsOn(gus, 'F', 'Fay F.')
const gusView = await gus.evaluate(() => ({
  btn: document.querySelector('.friend-btn')?.textContent,
  count: document.querySelector('.member-friends')?.textContent,
  top: [...document.querySelectorAll('.prof-top3 .top3-slot')].map((x) => x.textContent).join(' | '),
}))
await gus.locator('.nav-back, button', { hasText: 'Contacts' }).first().click().catch(() => {})
await gus.waitForTimeout(500)
for (const head of await gus.locator('.contacts-letter-head').all()) await head.click()
step('every face in the Contacts list has its colours', await facesOk(gus), String(await gus.locator('.contact-row .pet-art').count()) + ' faces')
await openContactsOn(gus, 'F', 'Fay F.')
step("Gus sees Friends, 1 friend, and himself at #1 in Fay's Top 3", gusView.btn === 'Friends ✓' && /1 friend/.test(gusView.count) && /#1Gus G\./.test(gusView.top), JSON.stringify(gusView))
await shot(gus, '7-gus-sees-top3')

/* "Share my page": the link opens that member's page for a signed-in member. */
await gus.goto(`${base}/contacts?m=${F.id}&ref=X`, { waitUntil: 'domcontentloaded' })
await gus.waitForSelector('.member-page .prof-name', { timeout: 20000 }).catch(() => {})
step("Fay's shared page link opens Fay's page", /Fay F\./.test((await gus.locator('.member-page .prof-name').first().textContent().catch(() => '')) ?? ''))

step('no page errors on either phone', gus.errors.length === 0 && fay.errors.length === 0, [...gus.errors, ...fay.errors].slice(0, 2).join(' | '))

await browser.close()
await db.end()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: friend requests, silent declines, the Top 3, removal, pets and the daily limit hold on the server, and two members did it on two phones.')
