/*
  CANCELLING, ORDERS ON THE ACCOUNT, THE MEMBER COUNT AND THE REGISTER CODE.

  Four things built on 13 September 2026, each with a way to go quietly wrong:

  CANCEL. Only the customer may cancel, and only before any kitchen starts.
  The order id is not enough: every kitchen on a shared cart holds it, so the
  right to cancel is a key handed to the customer alone (or the signed-in
  account that placed the order). All or nothing — never half an order.

  ORDERS ON THE ACCOUNT. A member's orders follow them to another phone, and
  nobody else's do.

  THE COUNT. Contacts shows a signed-out visitor how many members there are.
  It must be the real number.

  THE REGISTER CODE. A card on a business's counter carries
  /?b=<business>&via=qr. A sign-up that starts from it is credited to that
  business, and only a real business gets credit. Proved here from the card's
  own PNG, through the landing page's camera (a fake video feed of the card),
  to a sign-up in the same tab, to the count the operator and the kitchen see.
*/
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync, mkdtempSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import QRCode from 'qrcode'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('orders_account')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = '/tmp/audit-orders-account.log'
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const OPERATOR = 'op-orders-' + 'x'.repeat(24)
const srv = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: {
  ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, ALLOW_MOCK_PAYMENTS: '1', NODE_ENV: 'development',
  PASS_SECRET: 'audit-orders-secret-that-is-long-enough', OPERATOR_TOKEN: OPERATOR, SIMULATE_KITCHEN: '0',
} })
const B = `http://localhost:${port}`
for (let i = 0; i < 120; i++) { try { if ((await fetch(B + '/api/health')).ok) break } catch {} await new Promise((r) => setTimeout(r, 250)) }

const fails = []
const notes = []
const check = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) fails.push(msg) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const dirs = []
const done = async (code) => { srv.kill(); for (const d of dirs) rmSync(d, { recursive: true, force: true }); await TESTDB.drop?.(); process.exit(code) }

const call = async (method, path, body, headers = {}) => {
  for (let i = 0; i < 14; i++) {
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
const signUp = async (name, phone, extra = {}) => {
  const s = await call('POST', '/api/members/start', { name, phone, ...extra })
  if (s.status !== 202) throw new Error(`start ${s.status} ${s.text}`)
  const code = codeFor(phone)
  if (!code) throw new Error(`no code logged for ${phone}`)
  const v = await call('POST', '/api/members/verify', { phone, code })
  if (v.status >= 300) throw new Error(`verify ${v.status} ${v.text}`)
  return { account: v.body, cookie: (v.cookie || '').split(';')[0] }
}
const op = { authorization: `Bearer ${OPERATOR}` }
const bearer = (t) => ({ authorization: `Bearer ${t}` })
const signups = async () => (await call('GET', '/api/register-signups', null, op)).body

try {
  const stamp = String(Date.now()).slice(-4)
  const cat = (await call('GET', '/api/catalogue')).body
  const simple = (b) => b.menu.flatMap((c) => c.items).find((i) => !(i.options || []).some((g) => g.required))
  const orderable = cat.brands.filter((b) => !b.quoteOnly && !b.contactOnly && (b.tier ?? 3) >= 3 && simple(b))
  const A = orderable[0]
  const Bk = orderable.find((b) => b.vendorId !== A.vendorId)
  if (!A || !Bk) throw new Error('fewer than two orderable kitchens')
  const tokens = Object.fromEntries([...readFileSync(LOG, 'utf8').matchAll(/^\s+(v_\S+)\s+(vt_\S+)$/gm)].map((m) => [m[1], m[2]]))
  const kitchenA = bearer(tokens[A.vendorId])
  const kitchenB = bearer(tokens[Bk.vendorId])
  if (!tokens[A.vendorId] || !tokens[Bk.vendorId]) throw new Error('the dev log printed no vendor tokens for the two kitchens')
  const line = (b) => ({ itemId: simple(b).id, qty: 1, options: [] })
  const customer = { name: 'Can Celler', phone: `+1510610${stamp}` }
  const order = async (lines, headers = {}, extra = {}) => {
    const r = await call('POST', '/api/orders', { lines, fulfilment: 'pickup', tipBps: 0, customer, ...extra }, headers)
    if (r.status !== 201) throw new Error(`order ${r.status} ${r.text}`)
    return r.body
  }
  const cancel = (id, body = {}, headers = {}) => call('POST', `/api/orders/${id}/cancel`, body, headers)
  const move = (ticketId, state, auth) => call('POST', `/api/tickets/${ticketId}/state`, { state }, auth)

  /* ---- the cancel key ----------------------------------------------------- */
  const o1 = await order([line(A)])
  check(typeof o1.cancelKey === 'string' && o1.cancelKey.length === 32, 'placing an order hands the customer a cancel key')
  const lookup = await call('GET', `/api/orders/${o1.id}`)
  check(lookup.status === 200 && !lookup.text.includes(o1.cancelKey), 'looking the order up by id never returns the key')
  const queue = await call('GET', '/api/orders', null, kitchenA)
  check(queue.status === 200 && !queue.text.includes(o1.cancelKey) && queue.body.some((o) => o.id === o1.id), 'nor does the kitchen\'s queue')

  check((await cancel(o1.id)).status === 403, 'no key, no cancel')
  check((await cancel(o1.id, { cancelKey: 'x'.repeat(32) })).status === 403, 'a wrong key of the right length is refused')
  check((await cancel(o1.id, { cancelKey: 'short' })).status === 403, 'a short key is refused')
  check((await cancel(o1.id, {}, kitchenA)).status === 403, 'a KITCHEN holding the order id cannot cancel it')
  check((await cancel('o_no_such_order', { cancelKey: o1.cancelKey })).status === 404, 'a made-up order is a 404')
  const o0 = await order([line(A)])
  check((await cancel(o0.id, { cancelKey: o1.cancelKey })).status === 403, 'one order\'s key does not cancel another')

  const c1 = await cancel(o1.id, { cancelKey: o1.cancelKey })
  check(c1.status === 200 && c1.body.tickets.every((t) => t.state === 'cancelled' && t.cancelledBy === 'customer'), 'the key cancels the order, marked as the customer\'s doing')
  check(!('cancelKey' in c1.body) && !c1.text.includes('platformFee'), 'the answer is the customer\'s view, without the key or the platform\'s cut')
  check((await cancel(o1.id, { cancelKey: o1.cancelKey })).status === 200, 'cancelling twice is harmless')
  check((await move(o1.tickets[0].id, 'cooking', kitchenA)).status === 409, 'a kitchen cannot start a cancelled ticket')

  /* ---- not once a kitchen has started ------------------------------------- */
  const o2 = await order([line(A)])
  check((await move(o2.tickets[0].id, 'cooking', kitchenA)).status === 200, 'the kitchen starts an order')
  const late = await cancel(o2.id, { cancelKey: o2.cancelKey })
  check(late.status === 409 && /already started/.test(late.body.error || ''), 'the customer is told a kitchen has already started')
  check((await call('GET', `/api/orders/${o2.id}`)).body.tickets[0].state === 'cooking', 'and the ticket is still cooking')

  const o3 = await order([line(A), line(Bk)])
  const tB = o3.tickets.find((t) => t.vendorId === Bk.vendorId)
  const tA = o3.tickets.find((t) => t.vendorId === A.vendorId)
  check((await move(tB.id, 'cooking', kitchenB)).status === 200, 'one of two kitchens starts')
  check((await cancel(o3.id, { cancelKey: o3.cancelKey })).status === 409, 'the customer cannot cancel a shared order one kitchen has started')
  check((await call('GET', `/api/orders/${o3.id}`)).body.tickets.find((t) => t.id === tA.id)?.state === 'queued', 'and the other kitchen\'s ticket was not cancelled on its own — never half an order')

  const idem = `idem-${stamp}-audit`
  const r1 = await call('POST', '/api/orders', { lines: [line(A)], fulfilment: 'pickup', tipBps: 0, customer, idempotencyKey: idem })
  const r2 = await call('POST', '/api/orders', { lines: [line(A)], fulfilment: 'pickup', tipBps: 0, customer, idempotencyKey: idem })
  check(r1.status === 201 && r2.status === 200 && r2.body.id === r1.body.id && r2.body.cancelKey === r1.body.cancelKey, 'a retried submission gets back the same order and the same key')

  /* ---- orders on the account ---------------------------------------------- */
  check((await call('GET', '/api/members/orders')).status === 401, 'signed out, there is no account order list')
  const before = (await call('GET', '/api/members/count')).body.count
  const ada = await signUp('Ada Orders', `+1510611${stamp}`)
  const adaAt = Date.now()
  const bo = await signUp('Bo Orders', `+1510612${stamp}`)
  const count = await call('GET', '/api/members/count')
  check(count.status === 200 && count.body.count === before + 2 && count.headers.get('cache-control') === 'no-store', `the public member count is the real number (${count.body.count})`)
  check(Object.keys(count.body).join() === 'count', 'and it is only a number: no names, no ids')

  const o4 = await order([line(A)], { cookie: ada.cookie })
  const adaList = await call('GET', '/api/members/orders', null, { cookie: ada.cookie })
  check(adaList.status === 200 && adaList.body.orders.some((o) => o.id === o4.id), 'an order placed while signed in is on the account')
  check(!adaList.body.orders.some((o) => o.id === o1.id || o.id === o2.id), 'orders placed signed out are not')
  check(!adaList.text.includes('platformFee') && !adaList.text.includes('vendorPayout') && !adaList.text.includes(customer.phone), 'the account view carries no platform cut and no phone number')
  const boList = await call('GET', '/api/members/orders', null, { cookie: bo.cookie })
  check(boList.status === 200 && !boList.body.orders.some((o) => o.id === o4.id), 'another member does not see it')
  check((await cancel(o4.id, {}, { cookie: bo.cookie })).status === 403, 'another member cannot cancel it')
  const own = await cancel(o4.id, {}, { cookie: ada.cookie })
  check(own.status === 200 && own.body.tickets.every((t) => t.state === 'cancelled'), 'the member who placed it cancels it from any phone, with no key')
  check((await call('GET', '/api/members/orders', null, { cookie: ada.cookie })).body.orders.find((o) => o.id === o4.id)?.tickets[0].state === 'cancelled', 'and the account shows it cancelled')

  /* ---- the register code, by the API ---------------------------------------- */
  check((await call('GET', '/api/register-signups')).status === 401, 'register-code counts are the operator\'s')
  check((await signups()).length === 0, 'nobody has joined from a register code yet')
  await signUp('Via Real', `+1510613${stamp}`, { via: A.id })
  let s = await signups()
  check(s.length === 1 && s[0].brandId === A.id && s[0].signups === 1 && s[0].name === A.name, 'a sign-up that names a real business is credited to it')
  await signUp('Via Fake', `+1510614${stamp}`, { via: 'b_nosuchbusiness' })
  await signUp('Via Junk', `+1510615${stamp}`, { via: 'DROP TABLE members' })
  s = await signups()
  check(s.length === 1 && s[0].signups === 1, 'a made-up or malformed business gets no credit')
  /* Past the resend window, so this start mints a fresh code rather than
     reusing the one Ada already spent, and the sign-in genuinely happens. */
  await sleep(Math.max(0, adaAt + 26_000 - Date.now()))
  const again = await call('POST', '/api/members/start', { name: 'Ada Orders', phone: `+1510611${stamp}`, via: Bk.id })
  const againIn = await call('POST', '/api/members/verify', { phone: `+1510611${stamp}`, code: codeFor(`+1510611${stamp}`) })
  s = await signups()
  check(again.status === 202 && !again.body.reused && againIn.status === 200 && againIn.body.id === ada.account.id, 'an existing member signs in again from a card')
  check(!s.some((r) => r.brandId === Bk.id), 'and is not re-credited to that business')
  const key = await call('POST', `/api/vendors/${A.vendorId}/tokens`, {}, op)
  const kme = await call('GET', '/api/kitchen/me', null, bearer(key.body.token))
  check(kme.status === 200 && kme.body.signupsFromRegisterCode === 1, 'the business sees its own count on its kitchen screen')

  /* ---- the card itself -------------------------------------------------------- */
  const cardDir = mkdtempSync(join(tmpdir(), 'register-card-'))
  dirs.push(cardDir)
  execFileSync('npx', ['tsx', '--tsconfig', 'tsconfig.app.json', 'tools/make-register-cards.ts', '--only', A.id, '--out', cardDir], { stdio: 'pipe' })
  const png = join(cardDir, `${A.id}.png`)
  const pdf = join(cardDir, `${A.id}.pdf`)
  check(existsSync(png) && existsSync(pdf) && existsSync(join(cardDir, 'all-cards.pdf')), 'the card tool writes a PNG, a PDF and the combined PDF')
  check(/\/MediaBox\s*\[\s*0\s+0\s+288(\.0+)?\s+432(\.0+)?\s*\]/.test(readFileSync(pdf, 'latin1')), 'the PDF page is exactly 4 x 6 inches')

  const browser = await chromium.launch()
  const decoder = await browser.newPage()
  await decoder.addScriptTag({ path: 'node_modules/jsqr/dist/jsQR.js' })
  const decoded = await decoder.evaluate(async (src) => {
    const img = new Image()
    img.src = src
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, c.width, c.height)
    return { size: [c.width, c.height], text: window.jsQR(data.data, c.width, c.height)?.data ?? null }
  }, `data:image/png;base64,${readFileSync(png).toString('base64')}`)
  check(decoded.size[0] === 1200 && decoded.size[1] === 1800, 'the PNG is 1200 x 1800, 300 dpi at 4 x 6')
  check(decoded.text === `https://beastypages.com/?b=${A.id}&via=qr`, `the printed QR reads back as this business's register link (${decoded.text})`)
  await browser.close()

  /* ---- the landing page's camera, pointed at that card ------------------------ */
  let ffmpeg = true
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }) } catch { ffmpeg = false }
  if (!ffmpeg) {
    notes.push('camera steps not run: no ffmpeg on this machine')
  } else {
    const camDir = mkdtempSync(join(tmpdir(), 'register-cam-'))
    dirs.push(camDir)
    const video = (name, pngFile) => {
      const y4m = join(camDir, `${name}.y4m`)
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-i', pngFile, '-vf', 'scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2:white,format=yuv420p', '-t', '2', '-r', '10', y4m])
      return y4m
    }
    /* The card's QR, cropped to just the code as a camera held to it would see. */
    const qrOnly = join(camDir, 'card-qr.png')
    await QRCode.toFile(qrOnly, decoded.text, { width: 420, margin: 4 })
    const foreignPng = join(camDir, 'foreign.png')
    await QRCode.toFile(foreignPng, `https://example.com/?b=${A.id}&via=qr`, { width: 420, margin: 4 })

    const scanWith = async (y4m, fn) => {
      const cam = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${y4m}`] })
      const ctx = await cam.newContext({ viewport: { width: 393, height: 852 }, permissions: ['camera'] })
      const page = await ctx.newPage()
      try { return await fn(page) } finally { await cam.close() }
    }
    const openScan = async (page) => {
      await page.goto(B, { waitUntil: 'networkidle' })
      await page.locator('[aria-label="Enter BEASTY"]').first().waitFor({ state: 'visible', timeout: 90000 })
      await page.locator('[aria-label="Scan"]').first().click()
      await page.getByRole('button', { name: 'Start the camera' }).click()
    }

    await scanWith(video('foreign', foreignPng), async (page) => {
      await openScan(page)
      const refused = await page.waitForSelector('text=That code is not a BEASTY code', { timeout: 25000 }).then(() => true).catch(() => false)
      check(refused && new URL(page.url()).search === '', 'the landing camera refuses a code for any other site, and goes nowhere')
    })

    await scanWith(video('card', qrOnly), async (page) => {
      await openScan(page)
      const went = await page.waitForURL((u) => u.searchParams.get('b') === A.id && u.searchParams.get('via') === 'qr', { timeout: 25000 }).then(() => true).catch(() => false)
      check(went && new URL(page.url()).host === new URL(B).host, 'the landing camera reads the card and opens that business here, on this site')
      await page.waitForLoadState('networkidle')
      check((await page.evaluate(() => sessionStorage.getItem('fb.via.v1'))) === A.id, 'the tab remembers which counter the visitor came from')

      /* And then they join, in the same tab, the ordinary way. */
      const phone = `+1510616${stamp}`
      await page.goto(B, { waitUntil: 'networkidle' })
      await page.click('[aria-label="Enter BEASTY"]', { timeout: 90000 })
      await page.waitForTimeout(2500)
      await page.click('.spotlight')
      await page.waitForTimeout(400)
      await page.click('.gate-card .btn-primary')
      await page.waitForTimeout(900)
      await page.fill('.join-field:nth-of-type(1) input', 'Card Scanner')
      await page.fill('.join-field input[type="tel"]', phone)
      await page.fill('.join-field input[type="email"]', `${phone.replace(/\D/g, '')}@example.invalid`).catch(() => {})
      await page.click('form.join button[type=submit]')
      await page.waitForSelector('.join-code', { timeout: 20000 })
      await page.fill('.join-code', codeFor(phone) || '')
      await page.click('form.join button[type=submit]')
      let joined = false
      for (let i = 0; i < 22 && !joined; i++) {
        joined = await page.evaluate(async () => (await fetch('/api/members/me', { credentials: 'same-origin' })).ok).catch(() => false)
        if (!joined) await page.waitForTimeout(1000)
      }
      check(joined, 'the visitor signs up through the ordinary form')
      const after = await signups()
      check(after.find((r) => r.brandId === A.id)?.signups === 2, 'and the business the card came from is credited with them')
      check((await page.evaluate(() => sessionStorage.getItem('fb.via.v1'))) === null, 'the credit is used once and cleared')
    })
  }

  /* ---- the Orders screen: cancel, confirm, cancelled -------------------------- */
  const ui = await chromium.launch()
  const page = await ui.newPage({ viewport: { width: 393, height: 852 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(`${B}/?b=${A.id}`, { waitUntil: 'networkidle' })
  await page.locator('.brand-menu-drop .menu-picks-bar').first().click({ timeout: 30000 })
  await page.locator('.menu-row').first().click()
  await page.locator('.sheet-foot .btn-primary').click()
  await page.locator('.cartbar').first().click({ timeout: 15000 })
  await page.locator('.cartbar.is-solid').click({ timeout: 15000 })
  await page.fill('[aria-label="Name for the order"]', 'Screen Tester')
  await page.fill('[aria-label="Mobile number"]', '5105550199')
  await page.getByRole('button', { name: 'Place order' }).click()
  await page.getByRole('button', { name: 'Track order' }).click({ timeout: 15000 })
  await page.waitForSelector('.order-card', { timeout: 15000 })
  await page.locator('.order-cancel').first().click()
  check(await page.locator('.order-cancel-confirm').isVisible(), 'Cancel order asks first: a stray tap does not throw away lunch')
  await page.getByRole('button', { name: 'Keep it' }).click()
  check((await page.locator('.order-cancel-confirm').count()) === 0 && (await page.locator('.order-cancelled-chip').count()) === 0, 'Keep it keeps it')
  await page.locator('.order-cancel').first().click()
  await page.locator('.order-cancel-go').click()
  const chip = await page.waitForSelector('.order-cancelled-chip', { timeout: 10000 }).then(() => true).catch(() => false)
  check(chip && (await page.locator('.order-cancel').count()) === 0, 'confirming marks the order Cancelled, and the button goes away')
  check((await page.locator('.ticket-state.is-cancelled').count()) > 0, 'each ticket reads cancelled')
  check(errors.length === 0, `no script errors on the way${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ui.close()
} catch (e) {
  console.log('FAIL: ' + (e?.stack || e))
  await done(1)
}

for (const n of notes) console.log(`  NOTE ${n}`)
if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); await done(1) }
console.log(`\nPASS: only the customer cancels and only before a kitchen starts; orders follow the account; the count is real; a register card credits its business${notes.length ? ' (' + notes.join('; ') + ')' : ''}.`)
await done(0)
