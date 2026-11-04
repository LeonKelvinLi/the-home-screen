/*
  SWITCH, MANAGE, CANCEL AND THE RECRUITER UPGRADE (Glenn, 2026-10-26: "We also have to create that
  upgrade and cancel membership button"; "they can cancel any time or pause their recruitment status").

  Runs against a local server with a LOCAL webhook secret and made-up links and prices, so it needs no
  Stripe key and never touches real money. Webhooks are signed by hand, as in audit-membership-billing.

    1. A member paying for one pass who taps the other is sent to Stripe's portal, not a second
       checkout, and nothing changes until Stripe says so.
    2. customer.subscription.updated with the other pass's price switches their tier.
    3. The recruiter upgrade: its own link (client_reference_id rc_<member>), pending until paid,
       active on payment, pause and resume, and cancelled by its own subscription's end, which leaves
       the pass alone. The pass's end leaves the recruiter alone.
    4. The page: "Switch to", "Manage or cancel", and the recruiter card's button in each state.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { createHmac } from 'node:crypto'
import { readFileSync, openSync, rmSync } from 'node:fs'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const WHSEC = 'whsec_local_audit_only'
const LINK = { pass: 'https://buy.stripe.com/test_pass', diamond: 'https://buy.stripe.com/test_diamond', recruiter: 'https://buy.stripe.com/test_recruiter' }
const PORTAL = 'https://billing.stripe.com/p/login/test_portal'
const PRICE = { pass: 'price_audit_pass', diamond: 'price_audit_diamond', recruiter: 'price_audit_recruiter' }
const LEGACY_PRICE = { pass: 'price_audit_pass_legacy', diamond: 'price_audit_diamond_legacy' }

const LOG = '/tmp/beasty-manage-audit.log'
try { rmSync(LOG) } catch {}
const out = openSync(LOG, 'a')
const TESTDB = await freshTestDb('manage')
const port = await new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: {
    ...process.env,
    PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: WHSEC,
    STRIPE_PAYMENT_LINK_PASS: LINK.pass, STRIPE_PAYMENT_LINK_DIAMOND: LINK.diamond, STRIPE_PAYMENT_LINK_RECRUITER: LINK.recruiter,
    STRIPE_PORTAL_URL: PORTAL,
    STRIPE_PRICE_PASS: PRICE.pass, STRIPE_PRICE_DIAMOND: PRICE.diamond, STRIPE_PRICE_RECRUITER: PRICE.recruiter,
    STRIPE_PRICE_PASS_LEGACY: LEGACY_PRICE.pass, STRIPE_PRICE_DIAMOND_LEGACY: LEGACY_PRICE.diamond,
  },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 120; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const fails = []
const ok = (m) => console.log(' ok  ', m)
const bad = (m) => { console.log(' FAIL', m); fails.push(m) }
const check = (m, c) => (c ? ok(m) : bad(m))
let browser
const done = async (code) => { await browser?.close(); srv.kill(); await TESTDB.drop?.(); process.exit(code) }

const jar = []
const call = async (path, body) => {
  const r = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', ...(jar.length ? { cookie: jar.join('; ') } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  for (const c of r.headers.getSetCookie?.() ?? []) jar.push(c.split(';')[0])
  return { status: r.status, body: await r.json().catch(() => null) }
}
const email = `manage-${port}@audit.beastypages.dev`
await call('/api/members/start', { name: 'Manage Check', email })
let code
for (let i = 0; i < 40 && !code; i++) {
  code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
  if (!code) await new Promise((r) => setTimeout(r, 100))
}
const me0 = await call('/api/members/verify', { email, code })
const memberId = me0.body?.id
if (!memberId) { bad('sign-in returned no member id'); await done(1) }
ok(`signed in as ${memberId}`)

const sign = (payload) => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=${createHmac('sha256', WHSEC).update(`${t}.${payload}`).digest('hex')}` }
const hook = async (type, object) => {
  const payload = JSON.stringify({ id: `evt_${Math.random().toString(36).slice(2)}`, object: 'event', type, data: { object } })
  const r = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': sign(payload) }, body: payload })
  await new Promise((res) => setTimeout(res, 300))
  return r.status
}
const me = async () => (await call('/api/members/me')).body
const sub = (customer, price, status = 'active') => ({ object: 'subscription', customer, status, items: { data: [{ price: { id: price } }] } })

/* ---- 1. pay for BIGGIE PASS ---- */
const chose = await call('/api/members/tier', { tier: 'pass' })
check('choosing BIGGIE PASS gives its own checkout', chose.body?.paymentLink?.startsWith(LINK.pass) && !chose.body?.switching)
const CUS_PASS = `cus_pass_${port}`
check('the checkout webhook is accepted', (await hook('checkout.session.completed', { client_reference_id: memberId, customer: CUS_PASS })) === 200)
let a = await me()
check('BIGGIE PASS is active after payment', a.tier === 'pass' && a.tierStatus === 'active')
check('the manage link is Stripe’s portal with their email', a.manageLink?.startsWith(PORTAL) && new URL(a.manageLink).searchParams.get('prefilled_email') === email)

/* ---- 2. switching is the portal, not a second checkout ---- */
const sw = await call('/api/members/tier', { tier: 'diamond' })
check('tapping BEASTY PASS while paying for BIGGIE opens the portal, not a checkout', sw.body?.switching === true && sw.body?.manageLink?.startsWith(PORTAL) && !sw.body?.paymentLink)
a = await me()
check('…and changes nothing until Stripe confirms', a.tier === 'pass' && a.tierStatus === 'active')
await hook('customer.subscription.updated', sub(CUS_PASS, PRICE.diamond))
a = await me()
check('Stripe’s switch makes them BEASTY PASS, still active', a.tier === 'diamond' && a.tierStatus === 'active')
await hook('customer.subscription.updated', sub(CUS_PASS, LEGACY_PRICE.pass))
check('an older BIGGIE price still maps to BIGGIE PASS', (await me()).tier === 'pass')
await hook('customer.subscription.updated', sub(CUS_PASS, LEGACY_PRICE.diamond))
check('an older BEASTY price still maps to BEASTY PASS', (await me()).tier === 'diamond')
await hook('customer.subscription.updated', sub('cus_somebody_else', PRICE.pass))
check('another customer’s switch leaves them alone', (await me()).tier === 'diamond')

/* ---- 3. the recruiter upgrade ---- */
check('recruiter checkout exists', (await me()).recruiterConfigured === true)
const rec = await call('/api/members/recruiter', {})
const recLink = rec.body?.paymentLink ? new URL(rec.body.paymentLink) : null
check('becoming a recruiter gives the recruiter link with rc_ + member id', recLink && rec.body.paymentLink.startsWith(LINK.recruiter) && recLink.searchParams.get('client_reference_id') === `rc_${memberId}`)
check('…and leaves them pending, not active', (await me()).recruiterStatus === 'pending')
const CUS_REC = `cus_rec_${port}`
await hook('checkout.session.completed', { client_reference_id: `rc_${memberId}`, customer: CUS_REC })
a = await me()
check('paying makes them a recruiter, and the pass is untouched', a.recruiterStatus === 'active' && a.tier === 'diamond' && a.tierStatus === 'active')
check('pausing works', (await call('/api/members/recruiter/pause', { paused: true })).body?.recruiterStatus === 'paused')
check('resuming works', (await call('/api/members/recruiter/pause', { paused: false })).body?.recruiterStatus === 'active')
check('a non-boolean pause is refused', (await call('/api/members/recruiter/pause', { paused: 'yes' })).status === 400)
check('buying recruiter again while active hands back no checkout', (await call('/api/members/recruiter', {})).body?.paymentLink === null)

/* ---- 4. the page, at phone size ---- */
browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
await ctx.addCookies(jar.map((c) => { const i = c.indexOf('='); return { name: c.slice(0, i), value: c.slice(i + 1), url: base } }))
const page = await ctx.newPage()
await page.goto(`${base}/members`, { waitUntil: 'domcontentloaded' })
await page.locator('.members-plans').waitFor({ timeout: 20000 }).catch(() => {})
await page.locator('.members-recruiter').scrollIntoViewIfNeeded().catch(() => {})
await page.waitForTimeout(800)
const text = await page.locator('body').innerText()
check('the page shows BEASTY PASS active with a Change pass or cancel button', /BEASTY PASS active/.test(text) && /Change pass or cancel/.test(text))
check('…offers to switch to BIGGIE PASS, not to buy it', /Switch to BIGGIE PASS/.test(text))
check('…and the recruiter card offers Pause recruiting and Cancel or change card', /Pause recruiting/.test(text) && /Cancel or change card/.test(text))
await page.locator('.members-plans').screenshot({ path: '.verify/members-plans.png' }).catch(() => {})
await page.locator('.members-recruiter').screenshot({ path: '.verify/members-recruiter.png' }).catch(() => {})

/* ---- 5. cancellations stay apart ---- */
await hook('customer.subscription.deleted', sub(CUS_REC, PRICE.recruiter, 'canceled'))
a = await me()
check('cancelling the $60 ends recruiting and leaves the pass active', a.recruiterStatus === 'cancelled' && a.tierStatus === 'active')
await hook('customer.subscription.deleted', sub(CUS_PASS, PRICE.diamond, 'canceled'))
a = await me()
check('cancelling the pass lapses it', a.tierStatus === 'lapsed')
await page.reload({ waitUntil: 'domcontentloaded' })
await page.locator('.members-plans').waitFor({ timeout: 20000 }).catch(() => {})
await page.waitForTimeout(1500)
const text2 = await page.locator('body').innerText()
check('after both end, the page offers Restart and Become a recruiter again', /Restart BEASTY PASS/.test(text2) && /Become a recruiter again/.test(text2))

if (fails.length) { console.log(`\nFAIL: ${fails.length} membership-management checks`); await done(1) }
console.log('\nPASS: switching goes through Stripe’s portal, the recruiter upgrade pays, pauses and cancels on its own, and the page says which button does what.')
await done(0)
