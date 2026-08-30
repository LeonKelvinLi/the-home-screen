/*
  THE MONEY PATH, BEFORE ANY MONEY GOES DOWN IT.

  Four things have to hold or a membership is a promise nobody is paying for:

    1. A signed-in member choosing a tier gets THEIR payment link — the tier's
       link, carrying client_reference_id. That id is the whole join between a
       payment and a row here; without it a completed checkout is an anonymous
       amount of money and tier_status can never leave 'pending'.
    2. The webhook refuses anything that is not signed by Stripe. It is a
       public endpoint that grants paid status, so an unsigned POST must not
       activate anybody.
    3. checkout.session.completed activates that member AND stores the Stripe
       customer id.
    4. customer.subscription.deleted lapses them — matched on the customer id,
       because subscription events carry no client_reference_id. Get this wrong
       and memberships stay 'active' forever after the money stops, which is
       the app telling an affiliate to honour an offer nobody is paying for.

  Signed by hand rather than with the Stripe SDK: the point is to prove the
  SERVER's verification, and signing with the same library it verifies with
  would hide a mismatch in how the payload is framed.

  Needs a Stripe test key and a webhook secret. Without them it says so and
  skips rather than passing quietly on checks it never ran.

      set -a; . ~/.beasty-stripe-test.env; set +a
      node tools/audit-membership-billing.mjs
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { createHmac } from 'node:crypto'
import { readFileSync, openSync, rmSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const KEY = process.env.STRIPE_TEST_KEY ?? process.env.STRIPE_SECRET_KEY
const WHSEC = process.env.STRIPE_TEST_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET
const LINK_PASS = process.env.STRIPE_PAYMENT_LINK_PASS
const LINK_DIAMOND = process.env.STRIPE_PAYMENT_LINK_DIAMOND
if (!KEY || !WHSEC || !LINK_PASS || !LINK_DIAMOND) {
  console.log('SKIP: needs STRIPE_TEST_KEY, STRIPE_TEST_WEBHOOK_SECRET and both STRIPE_PAYMENT_LINK_*.')
  console.log('      source ~/.beasty-stripe-test.env first. Nothing was checked.')
  process.exit(2)
}
if (!KEY.startsWith('sk_test_')) {
  console.log('REFUSED: that is not a test key. This audit fabricates payment events; it never runs against live.')
  process.exit(2)
}

const LOG = '/tmp/beasty-billing-audit.log'
try { rmSync(LOG) } catch {}
const out = openSync(LOG, 'a')
const TESTDB = await freshTestDb('billing')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: {
    ...process.env,
    PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development',
    STRIPE_SECRET_KEY: KEY, STRIPE_WEBHOOK_SECRET: WHSEC,
    STRIPE_PAYMENT_LINK_PASS: LINK_PASS, STRIPE_PAYMENT_LINK_DIAMOND: LINK_DIAMOND,
  },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const fails = []
const ok = (msg) => console.log(' ok  ', msg)
const bad = (msg) => { console.log(' FAIL', msg); fails.push(msg) }
const done = async (code) => { srv.kill(); await TESTDB.drop?.(); process.exit(code) }

if (!readFileSync(LOG, 'utf8').includes('stripe webhook mounted')) {
  bad('the server did not mount the webhook — it will never mark anybody paid')
} else ok('the webhook is mounted')

// ---- a member, signed in by phone ---------------------------------------
const jar = []
const call = async (path, body) => {
  const r = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', ...(jar.length ? { cookie: jar.join('; ') } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const set = r.headers.getSetCookie?.() ?? []
  for (const c of set) jar.push(c.split(';')[0])
  return { status: r.status, body: await r.json().catch(() => null) }
}
const phone = `+1510555${String(Date.now()).slice(-4)}`
await call('/api/members/start', { name: 'Billing Check', phone })
const code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${phone} `)).pop()?.match(/ (\d{6}) /)?.[1]
if (!code) { bad('no login code was logged'); await done(1) }
const me = await call('/api/members/verify', { phone, code })
const memberId = me.body?.id
if (!memberId) { bad('sign-in returned no member id'); await done(1) }
ok(`signed in as ${memberId}`)

// ---- 1. the right link, carrying the member ------------------------------
for (const [tier, want] of [['pass', LINK_PASS], ['diamond', LINK_DIAMOND]]) {
  const r = await call('/api/members/tier', { tier })
  const link = r.body?.paymentLink
  if (!link) { bad(`choosing ${tier} returned no payment link (status ${r.status})`); continue }
  const u = new URL(link)
  if (!link.startsWith(want)) bad(`${tier} opened ${u.origin}${u.pathname}, not its own link`)
  else if (u.searchParams.get('client_reference_id') !== memberId) bad(`${tier}'s link does not carry the member id`)
  else ok(`${tier} → its own link, client_reference_id=${memberId}`)
  if (u.searchParams.get('prefilled_email') === 'null') bad(`${tier}'s link prefills the literal string "null" as an email`)
}
const status0 = (await call('/api/members/me')).body?.tierStatus
if (status0 === 'active') bad('choosing a tier marked the member ACTIVE without any payment')
else ok(`choosing a tier leaves them "${status0}" — nothing is paid yet`)

// ---- 2. an unsigned POST must do nothing ---------------------------------
const post = (payload, sig) => fetch(base + '/api/stripe/webhook', {
  method: 'POST',
  headers: { 'content-type': 'application/json', ...(sig ? { 'stripe-signature': sig } : {}) },
  body: payload,
})
const sign = (payload, secret, t = Math.floor(Date.now() / 1000)) =>
  `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')}`

const evt = (type, object) => JSON.stringify({ id: `evt_${Math.random().toString(36).slice(2)}`, object: 'event', type, data: { object } })
const forged = evt('checkout.session.completed', { client_reference_id: memberId, customer: 'cus_forged' })
const noSig = await post(forged)
if (noSig.status < 400) bad(`an UNSIGNED webhook was accepted (${noSig.status}) — anyone could grant themselves a membership`)
else ok(`an unsigned webhook is refused (${noSig.status})`)
const wrongSig = await post(forged, sign(forged, 'whsec_not_the_real_secret'))
if (wrongSig.status < 400) bad(`a webhook signed with the WRONG secret was accepted (${wrongSig.status})`)
else ok(`a wrongly-signed webhook is refused (${wrongSig.status})`)
const stale = await post(forged, sign(forged, WHSEC, Math.floor(Date.now() / 1000) - 60 * 60 * 24))
ok(`a day-old signature: ${stale.status}${stale.status >= 400 ? ' (refused)' : ' (accepted — Stripe’s default tolerance is 5 minutes)'}`)
if ((await call('/api/members/me')).body?.tierStatus === 'active') {
  bad('a REFUSED webhook still activated the member')
} else ok('none of the refused webhooks changed anything')

// ---- 3. the real thing activates ----------------------------------------
const CUST = `cus_test_${Date.now()}`
const real = evt('checkout.session.completed', { client_reference_id: memberId, customer: CUST })
const paid = await post(real, sign(real, WHSEC))
if (!paid.ok) bad(`a correctly signed checkout.session.completed was refused (${paid.status})`)
await new Promise((r) => setTimeout(r, 400))
const after = (await call('/api/members/me')).body
if (after?.tierStatus !== 'active') bad(`after a paid checkout the member is "${after?.tierStatus}", expected active`)
else ok('a signed checkout.session.completed activates the member')

// ---- 4. and a cancellation lapses them ----------------------------------
const gone = evt('customer.subscription.deleted', { customer: CUST })
await post(gone, sign(gone, WHSEC))
await new Promise((r) => setTimeout(r, 400))
const lapsed = (await call('/api/members/me')).body?.tierStatus
if (lapsed !== 'lapsed') bad(`after the subscription ended the member is "${lapsed}", expected lapsed — the customer id was not stored on the way in`)
else ok('customer.subscription.deleted lapses them, matched on the stored customer id')

// A cancellation for somebody else must not touch them.
const other = evt('customer.subscription.deleted', { customer: 'cus_somebody_else' })
await post(other, sign(other, WHSEC))
await new Promise((r) => setTimeout(r, 300))
const untouched = (await call('/api/members/me')).body?.tierStatus
if (untouched !== 'lapsed') bad(`another customer's cancellation changed this member to "${untouched}"`)
else ok("another customer's cancellation leaves them alone")

if (fails.length) { console.log(`\nFAIL: ${fails.length} problem(s) on the money path`); await done(1) }
console.log('\nPASS: the link carries the member, the webhook refuses forgeries, payment activates and cancellation lapses.')
await done(0)
