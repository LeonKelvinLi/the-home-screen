/*
  BEASTY COLLAB: the Collab key's creator form, end to end.

  Glenn, 16 September 2026: put his invitation to food creators on the Collab
  button, "keep it really simple and ask for their basic information like name,
  phone number, email address [and] IG handle." So this proves:

  - the panel carries his text, proofread, and no "still to supply" note;
  - the form asks for exactly those four things, can be reached and filled on
    a phone, and will not send until all four are real;
  - a send lands in the operator's lead list with the handle cleaned up;
  - the lead email goes to LEAD_EMAIL with Reply set to the creator, and the
    server log keeps the creator's number and address out;
  - the endpoint refuses what the form would refuse;
  - beastypages.com/collab, the link Glenn sends to creators' DMs, carries its
    own title and preview, opens straight onto the invitation, and the panel's
    Share button hands that link to the share sheet (or copies it);
  - the other two pages he asked to share the next morning do the same:
    /money opens MAKE $ and /members opens the membership screen in the app.

  Resend is never called: a preload swaps fetch for api.resend.com in the
  server under test and writes the request to the log instead.
*/
import { spawn } from 'node:child_process'
import http from 'node:http'
import { createServer } from 'node:net'
import { rmSync, readFileSync, openSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('collab')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = '/tmp/audit-collab.log'
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const OPERATOR = 'op-collab-' + 'x'.repeat(24)
const LEADS = 'leads@example.invalid'

const stubDir = mkdtempSync(join(tmpdir(), 'collab-audit-'))
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

const srv = spawn('node', ['--import', 'tsx', '--import', stub, 'server/index.ts'], { stdio: ['ignore', out, out], env: {
  ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', SIMULATE_KITCHEN: '0',
  OPERATOR_TOKEN: OPERATOR, LEAD_EMAIL: LEADS, RESEND_API_KEY: 're_audit_not_a_key', OTP_FROM_EMAIL: 'BEASTY <audit@example.invalid>',
} })
const B = `http://localhost:${port}`
for (let i = 0; i < 120; i++) { try { if ((await fetch(B + '/api/health')).ok) break } catch {} await new Promise((r) => setTimeout(r, 250)) }

const fails = []
const notes = []
const check = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) fails.push(msg) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const done = async (code) => { srv.kill(); rmSync(stubDir, { recursive: true, force: true }); await TESTDB.drop?.(); process.exit(code) }

const call = async (method, path, body, headers = {}) => {
  for (let i = 0; i < 14; i++) {
    const r = await fetch(B + path, { method, headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...headers }, body: body !== undefined ? JSON.stringify(body) : undefined })
    if (r.status === 429) { await sleep(5500); continue }
    const text = await r.text()
    let json = {}
    try { json = JSON.parse(text) } catch {}
    return { status: r.status, body: json, text }
  }
  throw new Error('rate limited for the whole run')
}
const leads = async () => (await call('GET', '/api/applications', undefined, { authorization: `Bearer ${OPERATOR}` })).body
const mails = () => readFileSync(LOG, 'utf8').split('\n').filter((l) => l.startsWith('[fake-resend] ')).map((l) => JSON.parse(l.slice(14)))

try {
  /* ---- the page ------------------------------------------------------------ */
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  const errors = []
  const bad = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('response', (r) => { const l = `${r.status()} ${r.url().replace(B, '')}`; if (r.status() >= 400 && l !== '401 /api/members/me') bad.push(l) })
  await page.goto(B, { waitUntil: 'networkidle' })
  /* The first press can land while the takeover animates and only skips it,
     so press, wait for the lettered key, press that. */
  await page.click('[aria-label="7"]')
  await page.waitForSelector('[aria-label="7. COLLABS"]', { timeout: 15000 })
  await page.click('[aria-label="7. COLLABS"]')
  await page.waitForSelector('.dialer-panel .collab-form', { timeout: 15000 })

  const panel = await page.evaluate(() => ({
    title: document.querySelector('.dialer-panel h2')?.textContent?.trim(),
    text: document.querySelector('.dialer-panel-body')?.textContent ?? '',
    flags: document.querySelectorAll('.dialer-panel .dialer-panel-flag').length,
    labels: [...document.querySelectorAll('.collab-form .join-field > span')].map((s) => s.textContent?.trim()),
    reserve: [...document.querySelectorAll('.dialer-panel button')].some((b) => /Reserve a Spot/i.test(b.textContent || '')),
  }))
  check(panel.title === 'BEASTY Collab', `the panel is titled BEASTY Collab (${panel.title})`)
  check(/looking for foodies to collaborate with and support small businesses anywhere in the Bay Area/.test(panel.text), 'his opening line is there, proofread')
  check(/All we ask is that you present the food review on behalf of BEASTY pages, and we will cover the entire bill!/.test(panel.text), 'the ask and the offer read correctly ("Ali" and "front" fixed)')
  check(/brand ambassadors and mascots, Sade & Munchy/.test(panel.text) && /A win-win for all!/.test(panel.text), 'Sade & Munchy and the sign-off are there')
  check(!/Xollab|Ali we ask/.test(panel.text), 'none of the typos survived')
  check(panel.flags === 0, 'no "still to supply" note: the offer and the inbox now exist')
  check(!panel.reserve, 'the old detour to Reserve a Spot is gone from this panel')
  check(JSON.stringify(panel.labels) === JSON.stringify(['Name', 'Phone number', 'Email address', 'Instagram handle']), `exactly his four fields (${panel.labels.join(', ')})`)

  const send = page.locator('.collab-form button[type=submit]')
  check(await send.isDisabled(), 'Send is off with nothing filled in')

  /* Reachable by keyboard: Tab from the close button walks into the fields. */
  await page.focus('.dialer-panel-close')
  const walked = []
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab')
    walked.push(await page.evaluate(() => {
      const a = document.activeElement
      const where = a?.closest('.dialer-panel') ? 'in' : 'out'
      return `${a?.tagName}${a?.tagName === 'INPUT' ? '[' + a.getAttribute('placeholder') + ']' : ''}:${where}`
    }))
  }
  const fields = new Set(walked.filter((w) => w.startsWith('INPUT')))
  check(fields.size === 4 && walked.every((w) => w.endsWith(':in')), `Tab reaches all four fields and, with Send still off, loops inside the panel (${walked.join(' ')})`)

  const stamp = String(Date.now()).slice(-4)
  await page.fill('.collab-form input[autocomplete="name"]', 'Fifi Foodie')
  await page.fill('.collab-form input[type="tel"]', `(510) 555-${stamp}`)
  await page.fill('.collab-form input[type="email"]', 'fifi@example.invalid')
  await page.fill('.collab-form input[placeholder="@yourhandle"]', 'not a handle!')
  check(await send.isDisabled(), 'Send stays off while the handle is not a handle')
  await page.fill('.collab-form input[placeholder="@yourhandle"]', 'https://www.instagram.com/fifi.eats_bay/?hl=en')
  check(await send.isEnabled(), 'a pasted profile link counts as a handle, and Send lights up')

  /* The button has to be the thing a thumb hits, inside a scrolling panel. */
  await send.scrollIntoViewIfNeeded()
  const onTop = await send.evaluate((b) => {
    const r = b.getBoundingClientRect()
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return b === el || b.contains(el)
  })
  check(onTop, 'Send is on top where it is drawn')
  await send.click()
  const doneText = await page.waitForSelector('.collab-done', { timeout: 15000 }).then((h) => h.textContent()).catch(() => null)
  check(!!doneText && doneText.includes('@fifi.eats_bay'), `a send says it arrived, with the handle (${doneText?.trim()})`)
  check(errors.length === 0, `no script errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  check(bad.length === 0, `no failed requests${bad.length ? ': ' + bad.join(', ') : ''}`)

  /*
    WHICH BUILD IS THIS. Render builds with VITE_ORDERING=live and the form
    posts to the server; a bundle built without it keeps leads on the phone,
    like every other form in the app. Both are checked for what they do, and
    a local bundle's lead is then sent by hand so the server half still runs.
  */
  const kept = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('fb.collabs.v1') || '[]') } catch { return [] } })
  await browser.close()
  if (kept.length) {
    notes.push('this bundle was built without VITE_ORDERING=live, so the form kept the lead on the phone and the server half was sent by hand; build with VITE_ORDERING=live to drive it from the form')
    const k = kept[0]
    check(k.name === 'Fifi Foodie' && k.phone === `(510) 555-${stamp}` && k.email === 'fifi@example.invalid' && k.instagram === 'fifi.eats_bay', 'the phone kept the lead as typed, handle cleaned')
    const sentByHand = await call('POST', '/api/collabs', { name: k.name, phone: k.phone, email: k.email, instagram: k.instagram })
    check(sentByHand.status === 201, 'the same lead is accepted by the server')
  }

  /* ---- what arrived ---------------------------------------------------------- */
  const rows = await leads()
  const row = rows.find((r) => r.social === '@fifi.eats_bay')
  check(!!row, 'the lead is in the operator list')
  check(row?.business === 'Fifi Foodie' && row?.cuisine === 'BEASTY Collab — food creator', 'named, and marked as a Collab')
  check(row?.contact === `(510) 555-${stamp} · fifi@example.invalid`, `with both the number and the address (${row?.contact})`)

  await sleep(500)
  const mail = mails().find((m) => /@fifi\.eats_bay/.test(m.subject || ''))
  check(!!mail, 'a lead email was sent')
  check(JSON.stringify(mail?.to) === JSON.stringify([LEADS]), 'to LEAD_EMAIL')
  check(mail?.reply_to === 'fifi@example.invalid', 'with Reply going to the creator')
  check(/Instagram: @fifi\.eats_bay \(https:\/\/www\.instagram\.com\/fifi\.eats_bay\/\)/.test(mail?.text || '') && (mail?.text || '').includes(`Phone: (510) 555-${stamp}`) && (mail?.text || '').includes('Email: fifi@example.invalid'), 'and everything needed to reach them')
  const logged = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.startsWith('NEW COLLAB LEAD'))
  check(logged.length === 1 && logged[0].includes('@fifi.eats_bay') && !logged[0].includes(stamp) && !logged[0].includes('example.invalid'), 'the server log names them without their number or address')

  /* ---- what the endpoint refuses --------------------------------------------- */
  const good = { name: 'Rae Reviews', phone: '+44 20 7946 0000', email: 'rae@example.invalid', instagram: '@@rae.reviews' }
  const r1 = await call('POST', '/api/collabs', good)
  check(r1.status === 201, 'an international number and a doubled @ are fine')
  check((await leads()).some((r) => r.social === '@rae.reviews'), 'and the handle is stored clean')
  check((await call('POST', '/api/collabs', { ...good, name: 'R' })).status === 400, 'no name, no lead')
  check((await call('POST', '/api/collabs', { ...good, phone: '555-12' })).status === 400, 'a number nobody can call is refused')
  check((await call('POST', '/api/collabs', { ...good, email: 'rae at example' })).status === 400, 'an address nobody can write to is refused')
  check((await call('POST', '/api/collabs', { ...good, email: 'rae@example.invalid\nBcc: x@y.z' })).status === 400, 'a line break in the address is refused')
  check((await call('POST', '/api/collabs', { ...good, instagram: '' })).status === 400, 'no handle, no lead')
  check((await call('POST', '/api/collabs', { ...good, instagram: 'bad handle' })).status === 400, 'a handle with a space is refused')
  check((await call('POST', '/api/collabs', { ...good, instagram: 'x'.repeat(31) })).status === 400, 'a handle longer than Instagram allows is refused')
  check((await call('POST', '/api/collabs', ['not', 'an', 'object'])).status === 400, 'a body that is not an object is refused')
  check((await call('POST', '/api/collabs', { ...good, name: 42 })).status === 400, 'a name that is not text is refused')

  /* ---- the link Glenn shares, and the button that shares it ----------------- */
  const collabHtml = await (await fetch(B + '/collab')).text()
  const rootHtml = await (await fetch(B + '/')).text()
  check(/<title>BEASTY Collab<\/title>/.test(collabHtml) && /property="og:title" content="BEASTY Collab"/.test(collabHtml) && /property="og:image" content="http[^"]+\/icon-512\.png"/.test(collabHtml) && /We cover the bill/.test(collabHtml),
    'beastypages.com/collab carries its own title, text and picture for a DM preview')
  check(/<title>BEASTY PAGES<\/title>/.test(rootHtml) && !/og:title/.test(rootHtml), 'the home page keeps its own title')
  const forged = await new Promise((resolve) => {
    const r = http.request({ host: 'localhost', port, path: '/collab', headers: { host: 'evil.example"><script>alert(1)</script>' } }, (resp) => {
      let d = ''
      resp.on('data', (c) => { d += c })
      resp.on('end', () => resolve(d))
    })
    r.on('error', () => resolve(''))
    r.end()
  })
  check(forged.includes('BEASTY Collab') && !forged.includes('<script>alert'), 'a forged Host header cannot write into the page')

  const phone = await chromium.launch()
  const ctx = await phone.newContext({ viewport: { width: 393, height: 852 } })
  await ctx.addInitScript(() => {
    window.__shared = []
    navigator.share = async (data) => { window.__shared.push(data) }
  })
  const pg = await ctx.newPage()
  const errs = []
  pg.on('pageerror', (e) => errs.push(String(e)))
  const t0 = Date.now()
  await pg.goto(B + '/collab', { waitUntil: 'domcontentloaded' })
  const landedIn = await pg.waitForSelector('.dialer-panel .collab-form', { timeout: 8000 }).then(() => Date.now() - t0).catch(() => null)
  check(landedIn !== null, `the link opens straight onto the invitation, no key pressed${landedIn !== null ? ` (${landedIn} ms)` : ''}`)
  const focus = await pg.evaluate(() => {
    const a = document.activeElement
    return { panel: !!a?.classList.contains('dialer-panel'), outline: a ? getComputedStyle(a).outlineStyle : null }
  })
  check(focus.panel && focus.outline === 'none', `arriving by link, the dialog holds focus with no ring on anything (${JSON.stringify(focus)})`)
  await pg.keyboard.press('Tab')
  check((await pg.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Close', 'and Tab from there reaches Close first')
  await pg.getByRole('button', { name: 'Share this invitation' }).click()
  const sent = await pg.evaluate(() => window.__shared)
  check(sent.length === 1 && sent[0].url === B + '/collab' && sent[0].title === 'BEASTY Collab' && /foodies/.test(sent[0].text || ''),
    `Share this invitation hands the share sheet the Collab link (${JSON.stringify(sent)})`)
  await pg.click('.dialer-panel-close')
  check((await pg.locator('.dialer-panel').count()) === 0, 'closing it leaves the ordinary landing page')
  await pg.click('[aria-label="Enter BEASTY"]')
  await pg.waitForSelector('.shell-enter', { timeout: 20000 })
  await pg.waitForTimeout(800)
  await pg.goBack()
  await pg.locator('[aria-label="Enter BEASTY"]').first().waitFor({ state: 'visible', timeout: 20000 })
  await pg.waitForTimeout(500)
  check((await pg.locator('.dialer-panel').count()) === 0, 'coming back from the app does not reopen the invitation')
  check(errs.length === 0, `no script errors on the link${errs.length ? ': ' + errs.join(' | ') : ''}`)
  await phone.close()

  /* ---- the other two pages he asked for, 2026-09-17 ------------------------ */
  for (const [slug, title] of [['money', 'Make money with BEASTY'], ['members', 'BEASTY membership']]) {
    const html = await (await fetch(`${B}/${slug}`)).text()
    check(new RegExp(`<title>${title}</title>`).test(html) && new RegExp(`og:title" content="${title}"`).test(html) && /og:image" content="http[^"]+\/icon-512\.png"/.test(html),
      `beastypages.com/${slug} carries its own title, text and picture for a DM preview`)
  }
  const phone2 = await chromium.launch()
  const ctx2 = await phone2.newContext({ viewport: { width: 393, height: 852 } })
  await ctx2.addInitScript(() => {
    window.__shared = []
    navigator.share = async (data) => { window.__shared.push(data) }
  })
  const pg2 = await ctx2.newPage()
  const errs2 = []
  pg2.on('pageerror', (e) => errs2.push(String(e)))

  await pg2.goto(B + '/money', { waitUntil: 'domcontentloaded' })
  const moneyOpen = await pg2.waitForSelector('.dialer-panel .dialer-panel-action.is-share', { timeout: 8000 }).then(() => true).catch(() => false)
  const moneyTitle = await pg2.evaluate(() => document.querySelector('.dialer-panel h2')?.textContent?.trim())
  check(moneyOpen && moneyTitle === 'Make some money with BEASTY', `/money opens MAKE $ with its Share button (${moneyTitle})`)
  check((await pg2.locator('.dialer-panel button', { hasText: 'Claim a tile' }).count()) === 1, 'and Claim a tile is still there')
  await pg2.getByRole('button', { name: 'Share this page' }).click()
  const sentMoney = await pg2.evaluate(() => window.__shared)
  check(sentMoney.length === 1 && sentMoney[0].url === B + '/money' && sentMoney[0].title === 'Make money with BEASTY',
    `Share this page hands the sheet the MAKE $ link (${JSON.stringify(sentMoney)})`)

  await pg2.goto(B + '/members', { waitUntil: 'domcontentloaded' })
  const memberShare = await pg2.waitForSelector('.chrome-pill.is-share', { timeout: 20000 }).then(() => true).catch(() => false)
  const memberHead = await pg2.evaluate(() => document.querySelector('.nav-bar h1, .nav-title, h1')?.textContent?.trim())
  check(memberShare, `/members opens the membership screen in the app with a Share button (${memberHead})`)
  await pg2.waitForTimeout(700)
  await pg2.locator('.chrome-pill.is-share').click()
  const sentMember = await pg2.evaluate(() => window.__shared)
  /* A fresh document, so the stub's list starts empty again. */
  check(sentMember.length === 1 && sentMember[0].url === B + '/members' && sentMember[0].title === 'BEASTY membership',
    `Share on the membership screen hands the sheet its own link (${JSON.stringify(sentMember)})`)
  check(errs2.length === 0, `no script errors on either page${errs2.length ? ': ' + errs2.join(' | ') : ''}`)
  await phone2.close()

  const desk = await chromium.launch()
  const dctx = await desk.newContext({ viewport: { width: 1280, height: 900 } })
  await dctx.addInitScript(() => {
    window.__copied = []
    try { delete Navigator.prototype.share } catch {}
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (t) => { window.__copied.push(t) } }, configurable: true })
  })
  const dp = await dctx.newPage()
  await dp.goto(B + '/collab', { waitUntil: 'domcontentloaded' })
  await dp.waitForSelector('.dialer-panel .collab-form', { timeout: 8000 })
  await dp.getByRole('button', { name: 'Share this invitation' }).click()
  const said = await dp.waitForSelector('.dialer-toast', { timeout: 4000 }).then((h) => h.textContent()).catch(() => null)
  const copied = await dp.evaluate(() => window.__copied)
  check(said === 'Link copied' && copied.length === 1 && copied[0] === B + '/collab', `with no share sheet the link is copied and the page says so (${said}, ${JSON.stringify(copied)})`)
  await desk.close()
} catch (e) {
  console.log('FAIL: ' + (e?.stack || e))
  await done(1)
}

for (const n of notes) console.log(`  NOTE ${n}`)
if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); await done(1) }
console.log('\nPASS: the Collab panel carries his invitation and a four-field form that reaches the lead inbox, only real details get through, and /collab, /money and /members each open their page and share it.')
await done(0)
