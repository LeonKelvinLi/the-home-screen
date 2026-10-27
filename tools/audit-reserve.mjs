/*
  RESERVE A SPOT, AS GLENN REWROTE IT ON 2026-09-22.

  His markup of the page: "What you get" is Your own icon, Business
  information and Business description in his words, and the boxes ask for
  the hours, an address, a phone and an email (each in its own box) and
  Instagram. This proves the page says it, that a request made through it
  keeps every box and reaches him by email with Reply going to the business,
  that one sent from a page opened before the change still goes through, and
  that neither a missing nor an unusable way to reach the business is taken.

  Resend is never called: a preload swaps fetch for api.resend.com in the
  server under test and writes the request to the log instead.

      node tools/audit-reserve.mjs
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('reserve')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-reserve-${port}.log`
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const TOKEN = `op_${randomBytes(20).toString('hex')}`
const LEADS = 'leads@example.invalid'
const stubDir = mkdtempSync(join(tmpdir(), 'reserve-audit-'))
const stub = join(stubDir, 'fake-resend.mjs')
writeFileSync(stub, `
const real = globalThis.fetch
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith('https://api.resend.com/')) {
    console.log('[fake-resend] ' + String(init?.body ?? ''))
    return new Response(JSON.stringify({ id: 'audit' }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  return real(url, init)
}
`)
const srv = spawn('node', ['--import', 'tsx', '--import', stub, 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: {
    ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', ALLOW_MOCK_PAYMENTS: '1', SIMULATE_KITCHEN: '0',
    OPERATOR_TOKEN: TOKEN, LEAD_EMAIL: LEADS, RESEND_API_KEY: 're_audit_not_a_key', OTP_FROM_EMAIL: 'BEASTY <audit@example.invalid>', LEAD_WEBHOOK_URL: '',
  },
})
const base = `http://localhost:${port}`
let up = false
for (let i = 0; i < 120; i++) { try { if ((await fetch(base + '/api/health')).ok) { up = true; break } } catch {} await new Promise((r) => setTimeout(r, 250)) }
let browser
const finish = async (code) => {
  try { await browser?.close() } catch {}
  srv.kill()
  rmSync(stubDir, { recursive: true, force: true })
  try { await TESTDB.drop?.() } catch {}
  process.exit(code)
}
if (!up) { console.log('FAIL: server never came up'); console.log(readFileSync(LOG, 'utf8').slice(-2000)); await finish(1) }

const results = []
const notes = []
const check = (name, cond, detail = '') => {
  results.push(!!cond)
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
/* The form's route allows three quick requests and then one every ten
   seconds; a request that meets the limit waits its turn, as a person would. */
let lastPost = 0
async function post(body) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`${base}/api/applications`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    lastPost = Date.now()
    if (r.status !== 429) return r.status
    await sleep(10500)
  }
  return 429
}
const leads = async () => (await fetch(`${base}/api/applications`, { headers: { authorization: `Bearer ${TOKEN}` } })).json()
const mails = () => readFileSync(LOG, 'utf8').split('\n').filter((l) => l.startsWith('[fake-resend] ')).map((l) => JSON.parse(l.slice(14)))

/* ---- through the API ---- */
check('a request with the new boxes is taken', (await post({ business: 'Audit Nails Studio', hours: 'Tue–Sat 10am–6pm', address: '1 Test Way, Hayward, CA', phone: '(510) 555-0142', email: 'Studio@Example.invalid', social: '@auditnails' })) === 201)
check('so is one from a page opened before the change', (await post({ business: 'Audit Old Form Cafe', cuisine: 'Sandwiches', contact: 'old@example.invalid', city: 'Oakland', social: '' })) === 201)
check('a request with no way to reach them is refused', (await post({ business: 'Audit Nobody', hours: '9–5' })) === 400)
check('and so is one whose only ways are unusable', (await post({ business: 'Audit Typo', phone: '555', email: 'gmail' })) === 400)

const rows = await leads()
const fresh = rows.find((r) => r.business === 'Audit Nails Studio')
check('every new box is kept', fresh && fresh.hours === 'Tue–Sat 10am–6pm' && fresh.address === '1 Test Way, Hayward, CA' && fresh.phone === '(510) 555-0142' && fresh.email === 'studio@example.invalid' && fresh.social === '@auditnails', JSON.stringify(fresh ?? null))
check('and the old contact column still names both ways in', fresh?.contact === '(510) 555-0142 · studio@example.invalid', fresh?.contact)
const old = rows.find((r) => r.business === 'Audit Old Form Cafe')
check('the old form’s boxes land where they always did', old && old.contact === 'old@example.invalid' && old.cuisine === 'Sandwiches' && old.city === 'Oakland' && old.hours === null, JSON.stringify(old ?? null))
check('nothing refused was saved', !rows.some((r) => /Audit (Nobody|Typo)/.test(r.business)))

await sleep(500)
const mail = mails().find((m) => m.subject === 'BEASTY: new spot request from Audit Nails Studio')
check('Glenn gets the request by email', !!mail && JSON.stringify(mail.to) === JSON.stringify([LEADS]))
check('with every box, the ways to reach them first', !!mail?.text?.includes('Phone: (510) 555-0142\nEmail: studio@example.invalid\nHours: Tue–Sat 10am–6pm\nAddress: 1 Test Way, Hayward, CA\nInstagram: @auditnails\n'), JSON.stringify(mail?.text))
check('and Reply goes to the business', mail?.reply_to === 'studio@example.invalid', mail?.reply_to)
const oldMail = mails().find((m) => m.subject === 'BEASTY: new spot request from Audit Old Form Cafe')
check('an old-form request reads as it always did', !!oldMail?.text?.includes('Contact: old@example.invalid\nWhat they do: Sandwiches\nCity: Oakland\n'), JSON.stringify(oldMail?.text))
const logged = readFileSync(LOG, 'utf8').split('\n').find((l) => l.startsWith('NEW VENDOR LEAD  Audit Nails Studio'))
check('the server log names the request but keeps its address out', !!logged && !logged.includes('1 Test Way'), logged)

/* ---- on the page ---- */
/* 555-01xx is the reserved fictional exchange: right in a test, wrong in production. */
async function signIn(page, fields) {
  const started = await page.evaluate(async (f) => {
    const r = await fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(f) })
    return r.status
  }, fields)
  if (started !== 202) throw new Error(`start returned ${started}`)
  let code
  for (let i = 0; i < 20 && !code; i++) {
    await sleep(250)
    const line = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${fields.phone} `)).pop()
    code = line?.match(/ (\d{6}) /)?.[1]
  }
  if (!code) throw new Error('no login code was logged')
  return page.evaluate(async ({ phone, code }) => {
    const r = await fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ phone, code }) })
    return r.ok
  }, { phone: fields.phone, code })
}

try {
  browser = await chromium.launch()
  const p = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  const bad = []
  p.on('response', (r) => { const l = `${r.status()} ${r.url().replace(base, '')}`; if (r.status() >= 400 && l !== '401 /api/members/me') bad.push(l) })
  await p.goto(base, { waitUntil: 'domcontentloaded' })
  check('a member can sign in', await signIn(p, { name: 'Rhea Audit', phone: `+151055501${String(Date.now()).slice(-2)}` }))
  await p.goto(base, { waitUntil: 'networkidle' })
  await p.click('[aria-label="Enter BEASTY"]')
  await p.waitForTimeout(2600)

  /* The way a business finds the form: an empty spot on a page, tapped. The
     first pages are full, so step along until one is drawn. */
  let tapped = null
  for (let i = 0; i < 16 && !tapped; i++) {
    tapped = await p.evaluate(() => {
      const t = [...document.querySelectorAll('button[aria-label]')].find((b) => /spot available$|^Reserve a Spot$/.test(b.getAttribute('aria-label') || ''))
      t?.click()
      return t?.getAttribute('aria-label') ?? null
    })
    if (tapped || (await p.isDisabled('.page-step.is-next').catch(() => true))) break
    await p.click('.page-step.is-next')
    await p.waitForTimeout(260)
  }
  /* The window opens with an animation, slower on a busy machine. */
  const opened = await p.waitForSelector('.ios-section-header >> text=What you get', { timeout: 20000 }).then(() => true).catch(() => false)
  check('an empty spot opens Reserve a Spot', !!tapped && opened, tapped ?? 'no empty spot on the home screen')

  const shown = await p.evaluate(() => {
    const sec = [...document.querySelectorAll('.ios-section')].find((s) => s.querySelector('.ios-section-header')?.textContent?.trim() === 'What you get')
    return {
      rows: [...(sec?.querySelectorAll('.ios-row') ?? [])].map((r) => [
        r.querySelector('.ios-row-label')?.textContent?.trim() ?? '',
        r.querySelector('.ios-row-detail')?.textContent?.trim() ?? '',
      ]),
      infoTile: getComputedStyle(sec?.querySelectorAll('.ios-row-icon')[1] ?? document.body).backgroundColor,
      boxes: [...document.querySelectorAll('input.co-input')].map((i) => i.placeholder),
      text: document.body.innerText,
    }
  })
  /* Labels only since Leon's 27 October "no need for a product" cut of the explanations. */
  const WANT_ROWS = [
    ['Your own icon', ''],
    ['Business information', ''],
    ['Business description', ''],
  ]
  check('What you get is in his words', JSON.stringify(shown.rows) === JSON.stringify(WANT_ROWS), JSON.stringify(shown.rows))
  check('Business information wears the info mark on its lighter blue', shown.infoTile === 'rgb(50, 173, 230)', shown.infoTile)
  const WANT_BOXES = ['Business name', 'List your hours', 'Address', 'Phone', 'Email', 'Instagram (optional)']
  check('the boxes are his, in his order', JSON.stringify(shown.boxes) === JSON.stringify(WANT_BOXES), JSON.stringify(shown.boxes))
  const gone = ['What you cook', 'Phone or email', 'Your prices, your menu', 'A shared cart', 'One cart and one checkout', 'opening straight into your menu'].filter((s) => shown.text.includes(s))
  check('and the old wording is gone', gone.length === 0, gone.join(', '))

  const disabled = () => p.$eval('.cartbar.is-solid', (b) => b.disabled)
  await p.fill('input[aria-label="Business name"]', 'Audit UI Bakery')
  const nameOnly = await disabled()
  await p.fill('input[aria-label="Phone"]', '510 555 0199')
  const withPhone = await disabled()
  check('a name alone is not enough, a name and a phone is', nameOnly === true && withPhone === false)
  await p.fill('input[aria-label="Phone"]', '')
  await p.fill('input[aria-label="Email"]', 'bakery@example.invalid')
  check('and so is a name and an email', (await disabled()) === false)
  await p.fill('input[aria-label="List your hours"]', 'Daily 7am–3pm')
  await p.fill('input[aria-label="Address"]', '2 Audit Ave, San Leandro, CA')
  await p.fill('input[aria-label="Phone"]', '510 555 0199')
  await p.fill('input[aria-label="Instagram (optional)"]', '@auditbakery')
  /* The route's one-every-ten-seconds allowance, after the requests above. */
  await sleep(Math.max(0, lastPost + 11000 - Date.now()))
  await p.click('.cartbar.is-solid')
  const sent = await p.waitForSelector('text=Request sent', { timeout: 30000 }).then(() => true).catch(() => false)
  check('sending it says so', sent)

  /*
    WHICH BUILD IS THIS. Render builds with VITE_ORDERING=live and the form
    posts to the server; a bundle built without it keeps the request on the
    phone, like every other form in the app. Both are checked for what they
    do, and a kept request is then sent by hand so the server half still runs.
  */
  const kept = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('fb.applications.v1') || '[]') } catch { return [] } })
  if (kept.length) {
    notes.push('this bundle was built without VITE_ORDERING=live, so the form kept the request on the phone and it was sent by hand; build with VITE_ORDERING=live to drive it from the form')
    const { at, ...k } = kept[0]
    check('the phone kept every box as typed', k.business === 'Audit UI Bakery' && k.hours === 'Daily 7am–3pm' && k.address === '2 Audit Ave, San Leandro, CA' && k.phone === '510 555 0199' && k.email === 'bakery@example.invalid' && k.social === '@auditbakery', JSON.stringify(k))
    check('and the server takes it as it is', (await post(k)) === 201)
  }
  const ui = (await leads()).find((r) => r.business === 'Audit UI Bakery')
  check('the request carries every box from the page', ui && ui.hours === 'Daily 7am–3pm' && ui.address === '2 Audit Ave, San Leandro, CA' && ui.phone === '510 555 0199' && ui.email === 'bakery@example.invalid' && ui.social === '@auditbakery', JSON.stringify(ui ?? null))
  check('with no failed requests along the way', bad.length === 0, bad.join(', '))
} catch (err) {
  check('the page part ran to the end', false, String(err?.message ?? err).split('\n')[0].slice(0, 200))
}

for (const n of notes) console.log(`note ${n}`)
const failed = results.filter((x) => !x).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
if (failed) { console.log('FAIL'); await finish(1) }
console.log('\nPASS: Reserve a Spot asks for what Glenn wrote, keeps all of it and sends it to him.')
await finish(0)
