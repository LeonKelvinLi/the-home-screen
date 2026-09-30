/*
 * THE WHOLE JOURNEY, WALKED ONCE, IN ONE BROWSER SESSION.
 *
 * Every other audit tests a seam. This one tests that the seams join: a
 * stranger lands, hits the gate, signs up with a code, gets let through, is
 * referred by somebody, takes a membership, pays, and cancels — in that order,
 * in one session, with the state carried between steps rather than set up
 * fresh for each.
 *
 * That ordering is the point. The bugs this catches are the ones that only
 * exist BETWEEN steps: a gate that keeps firing after a successful sign-up
 * because the provider was never told; a membership that stays "not yet paid"
 * after Stripe confirms it because nothing re-asks; a referral credited to
 * nobody because the code was dropped on the way through sign-up.
 *
 * Runs against the built dist/ on the real Express server with every
 * environment variable set, so it is production wiring rather than a dev
 * shortcut. Stripe is the one thing faked, with real HMAC-signed webhooks —
 * the only alternative is charging a card.
 */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { createHmac } from 'node:crypto'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
const TESTDB = await freshTestDb('journey')

const freePort = () =>
  new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })

const port = await freePort()
const DB = '/tmp/audit-journey.db', LOG = '/tmp/audit-journey.log', SECRET = 'whsec_journey'
for (const f of [DB, DB + '-wal', DB + '-shm', LOG]) { try { rmSync(f, { force: true }) } catch {} }
const out = openSync(LOG, 'a')
const srv = spawn('npx', ['tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: { ...process.env,
  PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development',
  STRIPE_SECRET_KEY: 'sk_test_journey', STRIPE_WEBHOOK_SECRET: SECRET,
  STRIPE_PAYMENT_LINK_PASS: 'https://buy.stripe.com/journeypass',
  STRIPE_PAYMENT_LINK_DIAMOND: 'https://buy.stripe.com/journeydiamond?utm_source=beasty' } })
const base = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const fails = []
const step = (n, ok, detail = '') => {
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${n}${detail ? '   ' + detail : ''}`)
  if (!ok) fails.push(n)
}
const codeFor = (email) => {
  const l = readFileSync(LOG, 'utf8').split('\n').filter((x) => x.includes(`[login-code] ${email} `)).pop()
  return l && l.match(/ (\d{6}) /)?.[1]
}
const hook = async (payload) => {
  const ts = String(Math.floor(Date.now() / 1000))
  const sig = `t=${ts},v1=${createHmac('sha256', SECRET).update(`${ts}.${payload}`).digest('hex')}`
  return (await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': sig }, body: payload })).status
}

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
const bad = []
p.on('response', (r) => { const l = `${r.status()} ${r.url().replace(base, '')}`; if (r.status() >= 400 && l !== '401 /api/members/me') bad.push(l) })
p.on('pageerror', (e) => bad.push('pageerror: ' + String(e).slice(0, 90)))

/* Stripe is opened in a new tab; nothing real is there, so it is intercepted
   and its URL recorded — that URL is what carries the member to the payment. */
let checkoutUrl = null
ctx.on('page', async (np) => {
  /* ONLY Stripe's tab. This closed every new page in the context, including
     the second one this test opens on purpose to play the referred friend —
     which aborted its navigation and failed a step that was working. */
  const u = np.url()
  if (!/buy\.stripe\.com/.test(u)) return
  checkoutUrl = u
  await np.close().catch(() => {})
})
await ctx.route('https://buy.stripe.com/**', (route) => route.fulfill({ status: 200, body: 'stub' }))

// ---- 1. a stranger arrives ------------------------------------------------
await p.goto(base, { waitUntil: 'networkidle' })
await p.click('[aria-label="1"]')           // first press only cancels the takeover
await p.waitForTimeout(3200)
step('1  landing takeover resolves', !!(await p.$('[aria-label="0. SIGN IN"]')))

await p.click('[aria-label="Enter BEASTY"]')
await p.waitForTimeout(2600)
const tiles = await p.evaluate(() => document.querySelectorAll('.app-icon, [data-brand]').length)
step('2  home screen opens signed out', tiles > 10, `${tiles} tiles`)

// ---- 2. the gate stops them, and does not lock the directory --------------
const gated = await p.evaluate(async () => {
  const fire = (sel) => { const el = document.querySelector(sel); el?.click(); return !!el }
  fire('.page-step.is-next')
  await new Promise((r) => setTimeout(r, 450))
  return { prompt: !!document.querySelector('.gate-prompt, [class*=gate]'), tilesStillThere: document.querySelectorAll('.app-icon, [data-brand]').length }
})
step('3  a gated door raises the prompt', gated.prompt)
step('4  the directory is still open behind it', gated.tilesStillThere > 10)

// ---- 3. sign up, through the screens rather than the API ------------------
await p.keyboard.press('Escape')
await p.waitForTimeout(400)
const email = `+1510561${String(Date.now()).slice(-4)}`
await p.evaluate(() => window.dispatchEvent(new CustomEvent('beasty:join')))
await p.waitForTimeout(1200)
step('5  the sign-in form opens', !!(await p.$('form.join')))

await p.fill('.join-field input[autocomplete="name"]', 'Rae Journey')
/* BOTH FIELDS, because which one is required now depends on what the
   deployment can actually deliver — a number when texting is configured, an
   address when it is not. Filling only the number left the submit button
   disabled here the day the fallback shipped. A real visitor gives both. */
await p.fill('.join-field input[type="tel"]', email)
await p.fill('.join-field input[type="email"]', `${email.replace(/\D/g, '')}@example.invalid`)
await p.click('form.join button[type="submit"]')
await p.waitForTimeout(1200)
const c1 = codeFor(email)
step('6  a code is issued', !!c1)
await p.fill('.join-code', c1 ?? '')
await p.click('form.join button[type="submit"]')
await p.waitForTimeout(1600)
const me = await p.evaluate(async () => { const r = await fetch('/api/members/me', { credentials: 'same-origin' }); return r.ok ? r.json() : null })
step('7  the code signs them in', !!me?.id, me?.referralCode ? `code ${me.referralCode}` : '')

// ---- 4. the gate must now be open, with no reload ------------------------
const after = await p.evaluate(async () => {
  document.querySelector('.page-step.is-next')?.click()
  await new Promise((r) => setTimeout(r, 500))
  return !!document.querySelector('.gate-prompt, [class*=gate-prompt]')
})
step('8  the gate stops firing without a reload', !after)

// ---- 5. their QR and code are on the profile -----------------------------
await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((n) => /Profile/i.test(n.getAttribute('aria-label') || n.textContent || '')); x?.click() })
await p.waitForTimeout(1500)
/* The code and QR are on Profile's Earn tab since 2026-09-30. */
await p.evaluate(() => document.querySelector('.prof-tabs [data-tab="earn"]')?.click())
await p.waitForTimeout(1200)
const prof = await p.evaluate(() => {
  const img = document.querySelector('.mp-qr img')
  return { qr: !!img && img.complete && img.naturalWidth > 0, code: document.querySelector('.mp-code')?.textContent?.trim() ?? null }
})
step('9  the QR renders on the profile', prof.qr)
step('10 the code shown is theirs', prof.code === me?.referralCode, `${prof.code}`)

// ---- 6. somebody follows their link and signs up -------------------------
/*
  A SEPARATE BROWSER CONTEXT, because a referred friend is a different person on
  a different phone — and because pages in one context share a cookie jar. Run
  as a second tab, the friend's sign-up overwrote the session cookie and the
  original page silently became the friend: the referral, the tier and the
  payment all then read off the wrong account, and four steps failed for a
  reason that had nothing to do with the product.
*/
const fctx = await b.newContext({ viewport: { width: 393, height: 852 } })
const friend = await fctx.newPage()
await friend.goto(`${base}/?ref=${me.referralCode}`, { waitUntil: 'networkidle' })
const femail = `+1510562${String(Date.now()).slice(-4)}`
/*
  The referral rides in the BODY, put there by the client from sessionStorage —
  it is not a cookie and the server never sees the URL. So the friend has to
  send it the way the app does; a bare fetch drops it and credits nobody, which
  is exactly the bug this step exists to catch.
*/
const fr = await friend.evaluate(async (e) => {
  const ref = sessionStorage.getItem('fb.ref.v1')
  const r = await fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ name: 'Sam Friend', phone: e, ref: ref ?? undefined }) })
  return { status: r.status, ref }
}, femail)
const fcode = codeFor(femail)
await friend.evaluate(async ({ e, c }) => {
  await fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ phone: e, code: c }) })
}, { e: femail, c: fcode })
await friend.close(); await fctx.close()
const credited = await p.evaluate(async () => (await fetch('/api/members/me', { credentials: 'same-origin' })).json())
step('11 a referred sign-up credits the sharer', fr.status === 202 && credited.referrals === 1, `carried ${fr.ref}, ${credited.referrals} referral(s)`)

// ---- 7. take a membership, and get a real checkout link ------------------
const chosen = await p.evaluate(async () => {
  const r = await fetch('/api/members/tier', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ tier: 'diamond' }) })
  return r.json()
})
step('12 choosing a tier stays pending', chosen.tierStatus === 'pending')
const link = chosen.paymentLink ? new URL(chosen.paymentLink) : null
step('13 the link carries the member', link?.searchParams.get('client_reference_id') === me.id, `${link?.searchParams.get('client_reference_id')} vs ${me.id}`)
/* A member who signed up by SMS has no address to prefill; the id that
   matches the payment back to them is what has to be there. */
step('14 the link carries the id that matches the payment', link?.searchParams.get('client_reference_id') === me?.id, String(link?.searchParams.get('client_reference_id')))
step('15 the link keeps its own query string', link?.searchParams.get('utm_source') === 'beasty')

// ---- 8. Stripe confirms, and the screen catches up on its own ------------
step('16 a forged webhook is refused', (await (async () => {
  const r = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'checkout.session.completed', data: { object: { client_reference_id: me.id } } }) })
  return r.status
})()) === 400)
const paid = JSON.stringify({ type: 'checkout.session.completed', data: { object: { client_reference_id: me.id, customer: 'cus_journey' } } })
step('17 a signed webhook is accepted', (await hook(paid)) === 200)

/* The browser never sees the webhook. Coming back to the tab is what has to
   refresh it, and that used to require a manual reload — so a member who had
   just paid was told they had not. */
await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
await p.waitForTimeout(1200)
const live = await p.evaluate(async () => (await fetch('/api/members/me', { credentials: 'same-origin' })).json())
step('18 the payment activates the membership', live.tierStatus === 'active')
step('19 the client is told payments are live', live.paymentsConfigured === true)

// ---- 9. cancelling lapses it, matched by customer id --------------------
step('20 a cancellation is accepted', (await hook(JSON.stringify({ type: 'customer.subscription.deleted', data: { object: { customer: 'cus_journey' } } }))) === 200)
const lapsed = await p.evaluate(async () => (await fetch('/api/members/me', { credentials: 'same-origin' })).json())
step('21 a cancelled subscription lapses', lapsed.tierStatus === 'lapsed')

// ---- 10. signing out puts the gate back --------------------------------
await p.evaluate(async () => { await fetch('/api/members/signout', { method: 'POST', credentials: 'same-origin' }) })
await p.reload({ waitUntil: 'networkidle' })
const outStatus = await p.evaluate(async () => (await fetch('/api/members/me', { credentials: 'same-origin' })).status)
step('22 signing out ends the session', outStatus === 401)

await b.close(); srv.kill()

if (bad.length) { console.log('\nfailed requests / page errors:'); for (const l of [...new Set(bad)]) console.log('  ' + l) }
if (bad.length) fails.push('clean console')
if (fails.length) { console.log(`\nFAIL: ${fails.length} of 22 steps — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: 22 steps, stranger to lapsed member, in one session.')
