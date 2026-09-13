/*
  THE KITCHEN SCREEN AND ITS KEYS.

  Until 13 September 2026 no kitchen could see an order: there was no screen and
  no way to give a kitchen a credential, so in production every ticket either
  sat at "queued" or was moved by a timer. This proves the whole loop:

    - the operator issues a key; only its hash is stored; the key is shown once
    - the key sees that kitchen's tickets and nobody else's, with the customer's
      name and number and without the platform's total
    - a kitchen with a live key is left alone by the demo timer, and the
      customer's screen stops calling its statuses a demonstration
    - the kitchen moves its own tickets, can turn one down with a reason, and
      the customer sees that reason
    - the same key checks a member's pass at the counter
    - turning the key off signs the screen out at once
    - in production the old boot-seeded vendor tokens open nothing
    - /kitchen, in a browser: signed in from the link, the key wiped from the
      address bar, a new order on the board, Start and Can't make it working,
      and a member pass read by the CAMERA through a fake video feed

  The camera step needs ffmpeg to turn a QR into a video; without it that step
  is reported as not run rather than passed.
*/
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync, mkdtempSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import pg from 'pg'
import QRCode from 'qrcode'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('kitchen')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const LOG = '/tmp/audit-kitchen.log'
const PROD_LOG = '/tmp/audit-kitchen-prod.log'
for (const f of [LOG, PROD_LOG]) { try { rmSync(f, { force: true }) } catch {} }
const OPERATOR = 'op-kitchen-' + 'x'.repeat(24)
const SECRET = 'audit-kitchen-secret-that-is-long-enough'

const boot = async (logFile, extra) => {
  const port = await freePort()
  const out = openSync(logFile, 'a')
  const proc = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: {
    ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS: '1',
    PASS_SECRET: SECRET, OPERATOR_TOKEN: OPERATOR, ...extra,
  } })
  const base = `http://localhost:${port}`
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(base + '/api/health', { headers: { 'x-forwarded-proto': 'https' } })).ok) break } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  return { proc, base }
}

const dev = await boot(LOG, { NODE_ENV: 'development', SIMULATE_KITCHEN: '1' })
const B = dev.base
let prod = null

const fails = []
const notes = []
const check = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) fails.push(msg) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const done = async (code) => { dev.proc.kill(); prod?.proc.kill(); await TESTDB.drop?.(); process.exit(code) }

const callAt = (base, extraHeaders = {}) => async (method, path, body, headers = {}) => {
  for (let i = 0; i < 12; i++) {
    const r = await fetch(base + path, { method, headers: { ...extraHeaders, ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
    if (r.status === 429) { await sleep(5500); continue }
    const text = await r.text()
    let json = {}
    try { json = JSON.parse(text) } catch {}
    return { status: r.status, body: json, text, headers: r.headers, cookie: r.headers.get('set-cookie') }
  }
  throw new Error('rate limited for the whole run')
}
const call = callAt(B)
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
const bearer = (t) => ({ authorization: `Bearer ${t}` })

try {
  const stamp = String(Date.now()).slice(-4)

  /* Two kitchens that can take an order, each with an item that needs no choice. */
  const cat = (await call('GET', '/api/catalogue')).body
  const simple = (b) => b.menu.flatMap((c) => c.items).find((i) => !(i.options || []).some((g) => g.required))
  const orderable = cat.brands.filter((b) => !b.quoteOnly && !b.contactOnly && simple(b))
  const A = orderable[0]
  const Bk = orderable.find((b) => b.vendorId !== A.vendorId)
  if (!A || !Bk) throw new Error('the catalogue has fewer than two orderable kitchens')
  console.log(`  kitchens: ${A.name} (${A.vendorId}) and ${Bk.name} (${Bk.vendorId})`)
  const line = (b, qty = 1) => ({ itemId: simple(b).id, qty, options: [] })
  const customer = { name: 'Kit Chen', phone: `+1510600${stamp}` }
  const order = async (lines, extra = {}) => {
    const r = await call('POST', '/api/orders', { lines, fulfilment: 'pickup', tipBps: 0, customer, ...extra })
    if (r.status !== 201) throw new Error(`order ${r.status} ${r.text}`)
    return r.body
  }

  /* ---- issuing a key ---------------------------------------------------- */
  check((await call('POST', `/api/vendors/${A.vendorId}/tokens`, {})).status === 401, 'nobody but the operator can issue a kitchen key')
  check((await call('POST', `/api/vendors/${A.vendorId}/tokens`, {}, bearer('op-wrong-' + 'y'.repeat(24)))).status === 401, 'a wrong operator token issues nothing')
  check((await call('POST', '/api/vendors/v_no_such_kitchen/tokens', {}, op)).status === 404, 'a key for a kitchen that does not exist is refused')
  const issued = await call('POST', `/api/vendors/${A.id}/tokens`, { label: 'Front counter iPad' }, op)
  const key = issued.body.token
  check(issued.status === 201 && /^kt_[A-Za-z0-9_-]{43}$/.test(key || ''), 'the operator gets a kt_ key (a b_ id names the same kitchen)')
  check(issued.body.vendorId === A.vendorId && issued.body.name && issued.body.label === 'Front counter iPad', 'the key names its kitchen and its label')
  check(issued.body.kitchenUrl === `${B}/kitchen#k=${key}`, 'the link carries the key in the #fragment, which no request line or log sees')
  check(issued.headers.get('cache-control') === 'no-store', 'the key is never cached')

  const db = new pg.Client({ connectionString: TESTDB.url })
  /* The database is dropped at the end with this client possibly still open;
     that disconnect is expected and must not crash the audit. */
  db.on('error', () => {})
  await db.connect()
  const rows = (await db.query('SELECT token_hash FROM vendor_tokens WHERE vendor_id = $1', [A.vendorId])).rows
  check(rows.length === 1 && rows[0].token_hash === createHash('sha256').update(key).digest('hex'), 'only the SHA-256 of the key is stored')
  const dump = JSON.stringify((await db.query('SELECT * FROM vendor_tokens')).rows)
  check(!dump.includes(key), 'the key itself is nowhere in the table')

  const listed = await call('GET', `/api/vendors/${A.vendorId}/tokens`, null, op)
  check(listed.status === 200 && listed.body.length === 1 && listed.body[0].id === issued.body.id && !listed.text.includes(key) && !('token' in listed.body[0]), 'the key list shows ids and dates, never a key')
  check((await call('GET', `/api/vendors/${A.vendorId}/tokens`)).status === 401, 'the key list is the operator\'s alone')

  /* ---- what the key opens ----------------------------------------------- */
  const me = await call('GET', '/api/kitchen/me', null, bearer(key))
  check(me.status === 200 && me.body.vendorId === A.vendorId && me.body.signupsFromRegisterCode === 0 && me.body.brands.some((b) => b.id === A.id), 'the kitchen screen learns whose key it holds')
  check((await call('GET', '/api/kitchen/me', null, bearer('kt_' + 'z'.repeat(43)))).status === 401, 'a made-up key opens nothing')
  check((await call('GET', '/api/kitchen/me')).status === 401, 'no key opens nothing')

  /* ---- a two-kitchen order, one kitchen live ---------------------------- */
  const o1 = await order([line(A), line(Bk)])
  const ticketA = o1.tickets.find((t) => t.vendorId === A.vendorId)
  const ticketB = o1.tickets.find((t) => t.vendorId === Bk.vendorId)
  check(!!ticketA && !!ticketB && ticketA.kitchenLive === true && ticketB.kitchenLive === false, 'each ticket says whether its kitchen has a live screen')
  check(o1.simulated === true, 'an order that includes an unconnected kitchen is still flagged as partly simulated')

  const queue = await call('GET', '/api/orders', null, bearer(key))
  const mine = queue.body.find?.((o) => o.id === o1.id)
  check(queue.status === 200 && !!mine, 'the kitchen\'s queue has the order')
  check(mine?.tickets.length === 1 && mine.tickets[0].vendorId === A.vendorId, 'and only its own ticket, not the other kitchen\'s')
  check(mine?.customer?.name === customer.name && mine?.customer?.phone === customer.phone, 'with the customer\'s name and number, so it can call them')
  check(mine && !('total' in mine), 'and without the order total, which would expose the other kitchen\'s sales')
  check((await call('GET', '/api/orders')).status === 401, 'the queue needs a key')

  const o2 = await order([line(A)])
  check(o2.simulated === false && o2.tickets[0].kitchenLive === true, 'an order only for the live kitchen is not called a demonstration')

  /* ---- the demo timer leaves a live kitchen alone ------------------------ */
  let movedB = false
  for (let i = 0; i < 12 && !movedB; i++) {
    await sleep(2500)
    const now = await call('GET', `/api/orders/${o1.id}`)
    movedB = now.body.tickets?.find((t) => t.vendorId === Bk.vendorId)?.state !== 'queued'
    if (movedB) check(now.body.tickets.find((t) => t.vendorId === A.vendorId)?.state === 'queued', 'the timer moved the unconnected kitchen\'s ticket and left the live kitchen\'s alone')
  }
  check(movedB, 'the demo timer is running for kitchens without a screen')

  /* ---- the kitchen works its own tickets ---------------------------------- */
  const move = (id, state, extra = {}, auth = bearer(key)) => call('POST', `/api/tickets/${id}/state`, { state, ...extra }, auth)
  check((await move(ticketB.id, 'cooking')).status === 403, 'a kitchen cannot touch another kitchen\'s ticket')
  check((await move(ticketA.id, 'ready')).status === 409, 'a ticket cannot skip cooking')
  check((await move(ticketA.id, 'cooking')).status === 200, 'Start: queued to cooking')
  check((await move(ticketA.id, 'ready')).status === 200, 'Ready: cooking to ready')
  check((await move(ticketA.id, 'cancelled', { reason: 'Sold out' })).status === 409, 'a ready ticket is the customer\'s food and cannot be cancelled')
  check((await move(ticketA.id, 'collected')).status === 200, 'Picked up: ready to collected')
  check((await move(ticketA.id, 'cooking')).status === 409, 'nothing moves backwards')

  const refused = o2.tickets[0]
  const long = 'Sold out of the brisket for today, sorry. '.repeat(6)
  check((await move(refused.id, 'cancelled', { reason: long })).status === 200, 'Can\'t make it: a kitchen turns a ticket down')
  const seen = await call('GET', `/api/orders/${o2.id}`)
  const t2 = seen.body.tickets?.[0]
  check(t2?.state === 'cancelled' && t2.cancelledBy === 'kitchen', 'the customer sees the kitchen cancelled it')
  check(typeof t2?.cancelReason === 'string' && t2.cancelReason.startsWith('Sold out of the brisket') && t2.cancelReason.length <= 140, 'with the kitchen\'s reason, capped at 140 characters')
  check((await move(refused.id, 'cooking')).status === 409, 'a cancelled ticket stays cancelled')

  /* ---- the same key checks a member's pass --------------------------------- */
  const rae = await signUp('Rae Counter', `+1510601${stamp}`)
  const pass = await call('GET', '/api/members/pass', null, { cookie: rae.cookie })
  const pv = await call('POST', '/api/pass/verify', { token: pass.body.token }, bearer(key))
  check(pv.status === 200 && pv.body.member?.name === 'Rae C.', 'the kitchen key checks a member pass at the counter')
  check((await call('POST', '/api/pass/verify', { token: pass.body.token }, bearer(key))).status === 409, 'and that pass is spent')

  /* ---- the screen, in a browser ------------------------------------------ */
  const headersOk = await fetch(`${B}/kitchen`)
  check(/camera=\(self\)/.test(headersOk.headers.get('permissions-policy') || ''), 'the camera is allowed for this site (camera=() refused it before anyone was asked)')
  const html = await headersOk.text()
  check(headersOk.status === 200 && html.includes('id="root"'), '/kitchen is served')

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(issued.body.kitchenUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('.kitchen-bar h1', { timeout: 20000 })
  check(!page.url().includes('#k=') && !page.url().includes(key), 'the key is wiped from the address bar as soon as the screen opens')
  check((await page.evaluate(() => localStorage.getItem('fb.kitchen.v1'))) === key, 'and kept on this device')
  await page.waitForFunction((name) => document.querySelector('.kitchen-bar h1')?.textContent === name, me.body.name, { timeout: 10000 }).catch(() => {})
  check((await page.textContent('.kitchen-bar h1')) === me.body.name, 'the bar names the kitchen')
  check((await page.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute('content'))) === 'noindex, nofollow', 'the kitchen page asks not to be indexed')
  check((await page.locator('.dialer, .device').count()) === 0, 'the customer app does not load behind the kitchen board')

  const o3 = await order([line(A, 2)])
  const onBoard = await page.waitForFunction((code) => [...document.querySelectorAll('.kitchen-column[aria-label="New"] .kitchen-code')].some((e) => e.textContent === code), o3.code, { timeout: 15000 }).then(() => true).catch(() => false)
  check(onBoard, 'a new order appears under New within a poll')
  check(await page.locator('.kitchen-new').isVisible().catch(() => false), 'with a new-order banner')
  check(/New order/.test(await page.title()), 'and the tab title says so')
  const card = page.locator('.kitchen-ticket', { has: page.locator('.kitchen-code', { hasText: o3.code }) })
  check(/2×/.test(await card.textContent()) && (await card.textContent()).includes(customer.name), 'the card shows the quantity and who it is for')
  await card.getByRole('button', { name: 'Start' }).click()
  const cooking = await page.waitForFunction((code) => [...document.querySelectorAll('.kitchen-column[aria-label="Cooking"] .kitchen-code')].some((e) => e.textContent === code), o3.code, { timeout: 10000 }).then(() => true).catch(() => false)
  check(cooking, 'Start moves the card to Cooking')
  check((await call('GET', `/api/orders/${o3.id}`)).body.tickets?.[0]?.state === 'cooking', 'and the customer\'s order says cooking')

  const cardNow = page.locator('.kitchen-ticket', { has: page.locator('.kitchen-code', { hasText: o3.code }) })
  await cardNow.getByRole('button', { name: /Can.t make it/ }).click()
  await cardNow.getByRole('button', { name: 'Closing early' }).click()
  await cardNow.getByRole('button', { name: 'Cancel ticket' }).click()
  await page.waitForFunction((code) => ![...document.querySelectorAll('.kitchen-board .kitchen-code')].some((e) => e.textContent === code), o3.code, { timeout: 10000 }).catch(() => {})
  const after = (await call('GET', `/api/orders/${o3.id}`)).body.tickets?.[0]
  check(after?.state === 'cancelled' && after.cancelReason === 'Closing early', 'Can\'t make it, with a chosen reason, reaches the customer')

  /* ---- the camera reads a member pass ------------------------------------ */
  let cameraRan = false
  let ffmpeg = null
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); ffmpeg = 'ffmpeg' } catch {}
  if (!ffmpeg) {
    notes.push('camera decode not run: no ffmpeg on this machine')
  } else {
    const dir = mkdtempSync(join(tmpdir(), 'kitchen-cam-'))
    const png = join(dir, 'pass.png')
    const video = join(dir, 'pass.y4m')
    const ivy = await signUp('Ivy Scanner', `+1510602${stamp}`)
    const ivyPass = await call('GET', '/api/members/pass', null, { cookie: ivy.cookie })
    await QRCode.toFile(png, ivyPass.body.token, { width: 420, margin: 4, errorCorrectionLevel: 'M' })
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-i', png, '-vf', 'scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2:white,format=yuv420p', '-t', '2', '-r', '10', video])
    if (existsSync(video)) {
      const cam = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${video}`] })
      const cctx = await cam.newContext({ viewport: { width: 1024, height: 768 }, permissions: ['camera'] })
      const cpage = await cctx.newPage()
      await cpage.goto(`${B}/kitchen`, { waitUntil: 'domcontentloaded' })
      await cpage.evaluate((k) => localStorage.setItem('fb.kitchen.v1', k), key)
      await cpage.goto(`${B}/kitchen`, { waitUntil: 'networkidle' })
      await cpage.getByRole('button', { name: 'Scan a member pass' }).click()
      const verdict = await cpage.waitForSelector('.kitchen-pass-name, .kitchen-pass-none', { timeout: 25000 }).then(() => true).catch(() => false)
      const text = verdict ? await cpage.textContent('.kitchen-modal-card') : ''
      cameraRan = verdict
      check(verdict && text.includes('Ivy S.') && /No paid membership/.test(text), `the camera reads a member's pass and names them (${text.slice(0, 80).replace(/\s+/g, ' ')})`)
      const spent = await call('POST', '/api/pass/verify', { token: ivyPass.body.token }, bearer(key))
      check(spent.status === 409, 'the pass the camera read is now spent')
      await cam.close()
    } else {
      notes.push('camera decode not run: ffmpeg made no video')
    }
    rmSync(dir, { recursive: true, force: true })
  }

  /* ---- turning a key off --------------------------------------------------- */
  check((await call('DELETE', `/api/vendor-tokens/${issued.body.id}`)).status === 401, 'nobody but the operator can turn a key off')
  check((await call('DELETE', `/api/vendor-tokens/${issued.body.id}`, null, op)).status === 204, 'the operator turns the key off')
  check((await call('DELETE', `/api/vendor-tokens/${issued.body.id}`, null, op)).status === 404, 'turning it off twice says there is no live key')
  check((await call('GET', '/api/orders', null, bearer(key))).status === 401, 'a key that is off opens no queue')
  check((await call('POST', '/api/pass/verify', { token: 'bp1.x.1.y' }, bearer(key))).status === 401, 'and checks no pass')
  const signedOut = await page.waitForSelector('.kitchen-signin .kitchen-warn', { timeout: 15000 }).then(() => true).catch(() => false)
  check(signedOut && /turned off/.test(await page.textContent('.kitchen-signin')), 'the open screen signs itself out and says why')
  check((await page.evaluate(() => localStorage.getItem('fb.kitchen.v1'))) === null, 'and forgets the key')
  const o4 = await order([line(A)])
  check(o4.simulated === true && o4.tickets[0].kitchenLive === false, 'with no live key, that kitchen\'s orders are called a demonstration again')
  check(errors.length === 0, `no script errors on the kitchen page${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await browser.close()

  /* ---- ten live keys, then no more ---------------------------------------- */
  for (let i = 0; i < 10; i++) {
    const r = await call('POST', `/api/vendors/${Bk.vendorId}/tokens`, { label: `device ${i + 1}` }, op)
    if (r.status !== 201) { check(false, `key ${i + 1} of 10 was refused (${r.status})`); break }
  }
  check((await call('POST', `/api/vendors/${Bk.vendorId}/tokens`, {}, op)).status === 409, 'an eleventh live key is refused until one is turned off')

  /* ---- production: only issued keys ---------------------------------------- */
  const legacy = readFileSync(LOG, 'utf8').match(/^\s+(v_\S+)\s+(vt_\S+)$/m)
  check(!!legacy, 'development still prints the boot-seeded vendor tokens for the audits')
  check(legacy && (await call('GET', '/api/kitchen/me', null, bearer(legacy[2]))).status === 200, 'in development an old vendor token still works')
  await db.end()
  dev.proc.kill()
  prod = await boot(PROD_LOG, { NODE_ENV: 'production' })
  const pcall = callAt(prod.base, { 'x-forwarded-proto': 'https' })
  check(!/vendor tokens \(dev only\)/.test(readFileSync(PROD_LOG, 'utf8')), 'production prints no vendor tokens')
  check(legacy && (await pcall('GET', '/api/kitchen/me', null, bearer(legacy[2]))).status === 401, 'IN PRODUCTION an old boot-seeded vendor token opens nothing')
  const pk = await pcall('POST', `/api/vendors/${A.vendorId}/tokens`, {}, op)
  check(pk.status === 201 && pk.body.kitchenUrl.startsWith('https://'), 'production issues keys, with an https link')
  check((await pcall('GET', '/api/kitchen/me', null, bearer(pk.body.token))).status === 200, 'and an issued key works there')
} catch (e) {
  console.log('FAIL: ' + (e?.stack || e))
  await done(1)
}

for (const n of notes) console.log(`  NOTE ${n}`)
if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); await done(1) }
console.log(`\nPASS: kitchen keys are issued once, hashed, scoped and revocable; the board, the timer, Can't make it and the pass check all hold${notes.length ? ' (' + notes.join('; ') + ')' : ''}.`)
await done(0)
