/*
  THE PAYMENT PATH, END TO END, WITHOUT STRIPE.

  Stripe itself needs the operator's account: keys, a bank account, two Payment
  Links. None of that is here, and none of it is ours to create. What IS ours is
  everything either side of Stripe, and this proves that half works so the day
  the real keys are pasted in is not the day the bugs are found.

  Four things it asserts:
    1. A tier choice hands back the operator's Payment Link, carrying the member
       id as client_reference_id — without that the webhook cannot know who paid.
    2. A correctly signed checkout.session.completed marks that member active.
    3. A cancellation lapses them again, matched on the Stripe customer id.
    4. A WRONGLY signed event is refused and changes nothing — because this
       endpoint is the only thing in the codebase that can mark a member paid,
       and an unverified one would let anybody who can POST JSON do it.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { createHmac } from 'node:crypto'
import { rmSync, readFileSync, openSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
const TESTDB = await freshTestDb('stripe')

const WEBHOOK_SECRET = 'whsec_audit_only_not_a_real_secret'
const fail = []
const ok = (c, m) => (c ? console.log(`  PASS  ${m}`) : (fail.push(m), console.log(`  FAIL  ${m}`)))

const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
for (const f of ['/tmp/stripe-audit.db', '/tmp/stripe-audit.db-wal', '/tmp/stripe-audit.db-shm']) { try { rmSync(f, { force: true }) } catch {} }
const LOG = '/tmp/audit-stripe.log'
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')

const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: {
    ...process.env,
    PORT: String(port),
    DATABASE_URL: TESTDB.url,
    NODE_ENV: 'development',
    ALLOW_MOCK_PAYMENTS: '1',
    /* Test-shaped values. The secret key is only ever used to construct the
       Stripe client for signature verification, which makes no network call. */
    STRIPE_SECRET_KEY: 'sk_test_audit_only_not_a_real_key',
    STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    STRIPE_PAYMENT_LINK_PASS: 'https://buy.stripe.com/test_pass?utm_source=beasty',
    STRIPE_PAYMENT_LINK_DIAMOND: 'https://buy.stripe.com/test_diamond',
  },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 100; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const jar = []
const keep = (r) => { const s = r.headers.getSetCookie?.() ?? []; for (const c of s) jar.push(c.split(';')[0]); return r }
const cookie = () => jar.join('; ')
const post = (p, body, hdrs = {}) => fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json', cookie: cookie(), ...hdrs }, body: JSON.stringify(body) }).then(keep)
const get = (p) => fetch(base + p, { headers: { cookie: cookie() } }).then(keep)

try {
  // --- sign a member in through the real flow -----------------------------
  const email = `payer${Date.now()}@example.com`
  const started = await post('/api/members/start', { name: 'Ada Payer', email })
  if (started.status !== 202) throw new Error(`start ${started.status}`)
  const line = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()
  const code = line && line.match(/ (\d{6}) /)?.[1]
  if (!code) throw new Error('no login code logged')
  const acct = await (await post('/api/members/verify', { email, code })).json()
  const memberId = acct?.id ?? acct?.member?.id
  ok(!!memberId, `signed in, member id present`)

  // --- 1. choosing a tier returns the link, carrying the member id ---------
  const chosen = await (await post('/api/members/tier', { tier: 'pass' })).json()
  const link = chosen?.paymentLink ?? ''
  ok(link.startsWith('https://buy.stripe.com/test_pass'), 'tier choice returns the operator Payment Link')
  ok(new URL(link).searchParams.get('client_reference_id') === memberId,
     'the link carries client_reference_id — the webhook can tell who paid')
  ok(new URL(link).searchParams.get('prefilled_email') === email, 'the link prefills their email')
  ok(new URL(link).searchParams.get('utm_source') === 'beasty',
     "a link's own query string survives (URL, not string concatenation)")
  const me1 = await (await get('/api/members/me')).json()
  ok((me1.tierStatus ?? me1.member?.tierStatus) === 'pending',
     'choosing a tier does NOT mark them paid')

  // --- 2. a correctly signed payment activates them -----------------------
  const send = async (event, secret = WEBHOOK_SECRET) => {
    const payload = JSON.stringify(event)
    const t = Math.floor(Date.now() / 1000)
    const sig = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')
    return fetch(base + '/api/stripe/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': `t=${t},v1=${sig}` },
      body: payload,
    })
  }
  const CUSTOMER = 'cus_audit_0001'
  const paid = await send({
    id: 'evt_1', type: 'checkout.session.completed',
    data: { object: { client_reference_id: memberId, customer: CUSTOMER } },
  })
  ok(paid.status === 200, 'a signed checkout.session.completed is accepted')
  const me2 = await (await get('/api/members/me')).json()
  ok((me2.tierStatus ?? me2.member?.tierStatus) === 'active', 'the member is now ACTIVE')

  // --- 3. a cancellation lapses them, matched on the customer id ----------
  const gone = await send({
    id: 'evt_2', type: 'customer.subscription.deleted',
    data: { object: { customer: CUSTOMER } },
  })
  ok(gone.status === 200, 'a signed cancellation is accepted')
  const me3 = await (await get('/api/members/me')).json()
  ok((me3.tierStatus ?? me3.member?.tierStatus) === 'lapsed',
     'the member LAPSES — the customer id survived activation')

  // --- 4. a forged event must change nothing ------------------------------
  const forged = await send({
    id: 'evt_3', type: 'checkout.session.completed',
    data: { object: { client_reference_id: memberId, customer: CUSTOMER } },
  }, 'whsec_wrong_secret')
  ok(forged.status >= 400, 'a WRONGLY signed event is refused')
  const me4 = await (await get('/api/members/me')).json()
  ok((me4.tierStatus ?? me4.member?.tierStatus) === 'lapsed',
     'and it did NOT mark them paid')
} finally {
  srv.kill()
}

console.log(fail.length ? `\n${fail.length} failed` : '\nPASS: the payment path works end to end; only Stripe credentials are missing.')
process.exit(fail.length ? 1 : 0)
