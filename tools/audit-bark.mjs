/*
  BARK POINTS, END TO END (server/bark.ts). Leon, 2026-10-26: "paying the $60 opens the /join paperwork,
  points credit monthly while recruiting is active, and cash-outs only after Glenn approves the packet."

  Runs against a local server with a LOCAL webhook secret and made-up prices, so it needs no Stripe key
  and never touches real money. Webhooks are signed by hand, as in audit-membership-manage.

    1. Before paying, a member has no paperwork and earns nothing for the friend who joined then.
    2. Paying the $60 makes them a recruiter AND opens their /join application, with no invite.
    3. A referred member's paid months credit their referrer: 2 on BIGGIE PASS, 3 on BEASTY PASS, once
       per invoice, nothing for a $0 month, a proration, the recruiter's own fee, or a friend who joined
       while recruiting was paused. A first invoice that beats its checkout is credited when it lands.
    4. A refund or dispute takes the month's points back.
    5. Businesses: the team records paid months in the CRM, up to 6, only for a business referred while
       recruiting with its initiation paid.
    6. Cash-outs: refused before the packet is approved; then from 100 in steps of 50, one at a time;
       the CRM marks it paid; a refund after payout comes off the next one, never below zero.
    7. Cancelling the $60 stops new credits; what was earned stays.
    8. The screens: Members, the Affiliate dashboard and /join at phone size, and the CRM page.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { createHmac, randomBytes } from 'node:crypto'
import { readFileSync, openSync, rmSync, mkdirSync } from 'node:fs'
import pg from 'pg'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const WHSEC = 'whsec_local_audit_only'
const LINK = { pass: 'https://buy.stripe.com/test_pass', diamond: 'https://buy.stripe.com/test_diamond', recruiter: 'https://buy.stripe.com/test_recruiter' }
const PRICE = { pass: 'price_audit_pass', diamond: 'price_audit_diamond', recruiter: 'price_audit_recruiter' }
const OPERATOR = `op_${randomBytes(16).toString('hex')}`

const LOG = '/tmp/beasty-bark-audit.log'
try { rmSync(LOG) } catch {}
mkdirSync('.verify', { recursive: true })
const out = openSync(LOG, 'a')
const TESTDB = await freshTestDb('bark')
const port = await new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: {
    ...process.env,
    PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: WHSEC, OPERATOR_TOKEN: OPERATOR, RESEND_API_KEY: '', LEAD_EMAIL: '',
    STRIPE_PAYMENT_LINK_PASS: LINK.pass, STRIPE_PAYMENT_LINK_DIAMOND: LINK.diamond, STRIPE_PAYMENT_LINK_RECRUITER: LINK.recruiter,
    STRIPE_PORTAL_URL: 'https://billing.stripe.com/p/login/test_portal',
    STRIPE_PRICE_PASS: PRICE.pass, STRIPE_PRICE_DIAMOND: PRICE.diamond, STRIPE_PRICE_RECRUITER: PRICE.recruiter,
  },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 160; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }
const sql = new pg.Client({ connectionString: TESTDB.url })
await sql.connect()

const fails = []
const ok = (m) => console.log(' ok  ', m)
const bad = (m) => { console.log(' FAIL', m); fails.push(m) }
const check = (m, c) => (c ? ok(m) : bad(m))
let browser
const done = async (code) => { await browser?.close(); await sql.end().catch(() => {}); srv.kill(); await TESTDB.drop?.(); process.exit(code) }
const pause = (ms) => new Promise((r) => setTimeout(r, ms))

let ipN = 1
function person() {
  const jar = new Map()
  const ip = `10.7.0.${ipN++}`
  return {
    jar,
    async call(path, body, method) {
      const r = await fetch(base + path, {
        method: method ?? (body === undefined ? 'GET' : 'POST'),
        headers: { 'x-forwarded-for': ip, 'content-type': 'application/json', ...(jar.size ? { cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      for (const c of r.headers.getSetCookie?.() ?? []) { const [pair] = c.split(';'); const i = pair.indexOf('='); jar.set(pair.slice(0, i), pair.slice(i + 1)) }
      return { status: r.status, body: await r.json().catch(() => null) }
    },
  }
}
async function signUp(name, ref) {
  const p = person()
  const email = `${name.toLowerCase().replace(/\W/g, '')}-${port}@audit.beastypages.dev`
  await p.call('/api/members/start', { name, email, ...(ref ? { ref } : {}) })
  let code
  for (let i = 0; i < 50 && !code; i++) {
    code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
    if (!code) await pause(100)
  }
  const me = await p.call('/api/members/verify', { email, code })
  p.id = me.body?.id
  p.code = me.body?.referralCode
  p.email = email
  await pause(30)
  return p
}

const sign = (payload) => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=${createHmac('sha256', WHSEC).update(`${t}.${payload}`).digest('hex')}` }
const hook = async (type, object) => {
  const payload = JSON.stringify({ id: `evt_${randomBytes(6).toString('hex')}`, object: 'event', type, data: { object } })
  const r = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': sign(payload) }, body: payload })
  await pause(150)
  return r.status
}
/* An invoice as API 2020-08-27 sends it (the webhook's version). */
const invoice = (id, customer, price, { reason = 'subscription_cycle', amount = 2999, pi = `pi_${id}` } = {}) => ({
  object: 'invoice', id, customer, amount_paid: amount, billing_reason: reason, payment_intent: pi,
  status_transitions: { paid_at: Math.floor(Date.now() / 1000) }, lines: { data: [{ price: { id: price } }] },
})
const bark = async (p) => (await p.call('/api/affiliate/bark')).body
const pointsOf = async (memberId) => Number((await sql.query("SELECT COALESCE(SUM(points),0) AS n FROM bark_points WHERE member_id = $1 AND status = 'earned'", [memberId])).rows[0].n)

/* ---- 1. before paying ---- */
const ana = await signUp('Ana Recruiter')
check('the referrer signed in', !!ana.id && !!ana.code)
const early = await signUp('Early Friend', ana.code)
check('a friend joined with her code before she recruits', !!early.id)
check('before paying she has no paperwork', (await ana.call('/api/onboarding/me')).status === 404)
let b = await bark(ana)
check('…and her BARK card invites her to become a recruiter', b.recruiter === 'none' && b.balance.earned === 0 && b.choices.length === 0)
await hook('checkout.session.completed', { client_reference_id: early.id, customer: 'cus_early' })
await hook('invoice.paid', invoice('in_early_1', 'cus_early', PRICE.pass, { reason: 'subscription_create' }))
check('the early friend paying earns her nothing: she was not recruiting when they joined', (await pointsOf(ana.id)) === 0)

/* ---- 2. paying the $60 ---- */
check('choosing the upgrade hands back its checkout', (await ana.call('/api/members/recruiter', {})).body?.paymentLink?.startsWith(LINK.recruiter))
await hook('checkout.session.completed', { client_reference_id: `rc_${ana.id}`, customer: 'cus_ana_rec' })
let me = (await ana.call('/api/members/me')).body
check('paying makes her a recruiter', me.recruiterStatus === 'active')
const appRes = await ana.call('/api/onboarding/me')
check('…and opens her /join paperwork with no invite', appRes.status === 200 && appRes.body?.status === 'in_progress')
check('…filled in from her account', appRes.body?.profile?.email === ana.email && appRes.body?.profile?.legalFirst === 'Ana')
check('…and the member payload says so', me.paperworkStatus === 'in_progress')
const appId = (await sql.query('SELECT id FROM onboarding_applications WHERE member_id = $1', [ana.id])).rows[0]?.id
check('the CRM history records how it opened', (await sql.query("SELECT 1 FROM onboarding_events WHERE application_id = $1 AND kind = 'opened_by_recruiter'", [appId])).rowCount === 1)
await hook('checkout.session.completed', { client_reference_id: `rc_${ana.id}`, customer: 'cus_ana_rec' })
check('a retried payment does not open a second application', Number((await sql.query('SELECT COUNT(*) AS n FROM onboarding_applications WHERE member_id = $1', [ana.id])).rows[0].n) === 1)
const nobody = await signUp('Not Recruiting')
check('someone who never paid still gets the "become a recruiter first" page', (await nobody.call('/api/onboarding/me')).status === 404)

/* ---- 3. a referred member's paid months ---- */
await pause(20)
const cara = await signUp('Cara Biggie', ana.code)
/* Her first invoice arrives before her checkout does. */
await hook('invoice.paid', invoice('in_cara_1', 'cus_cara', PRICE.pass, { reason: 'subscription_create' }))
check('a first invoice that beats its checkout waits instead of being lost', (await pointsOf(ana.id)) === 0 && (await sql.query("SELECT 1 FROM bark_waiting_invoices WHERE invoice_id = 'in_cara_1'")).rowCount === 1)
await hook('checkout.session.completed', { client_reference_id: cara.id, customer: 'cus_cara' })
check('…and is credited when the checkout lands: 10 points', (await pointsOf(ana.id)) === 10)
await hook('invoice.paid', invoice('in_cara_1', 'cus_cara', PRICE.pass, { reason: 'subscription_create' }))
check('a retried invoice credits nothing twice', (await pointsOf(ana.id)) === 10)
await hook('invoice.paid', invoice('in_cara_p', 'cus_cara', PRICE.pass, { reason: 'subscription_update', amount: 500 }))
check('a proration is not a month', (await pointsOf(ana.id)) === 10)
await hook('invoice.paid', invoice('in_cara_0', 'cus_cara', PRICE.pass, { amount: 0 }))
check('a $0 month earns nothing', (await pointsOf(ana.id)) === 10)
await hook('invoice.paid', invoice('in_cara_2', 'cus_cara', PRICE.pass))
await hook('invoice.paid', invoice('in_cara_3', 'cus_cara', PRICE.pass))
check('BIGGIE PASS: 2 months, 20 points, and a third month earns nothing', (await pointsOf(ana.id)) === 20)
await hook('invoice.paid', invoice('in_ana_rec', 'cus_ana_rec', PRICE.recruiter, { reason: 'subscription_create', amount: 6000 }))
check('her own $60 earns nobody points', (await pointsOf(ana.id)) === 20)

check('pausing works', (await ana.call('/api/members/recruiter/pause', { paused: true })).body?.recruiterStatus === 'paused')
const dan = await signUp('Dan Paused', ana.code)
await hook('checkout.session.completed', { client_reference_id: dan.id, customer: 'cus_dan' })
await hook('invoice.paid', invoice('in_dan_1', 'cus_dan', PRICE.pass, { reason: 'subscription_create' }))
check('a friend who joined while she was paused earns her nothing', (await pointsOf(ana.id)) === 20)
check('resuming works', (await ana.call('/api/members/recruiter/pause', { paused: false })).body?.recruiterStatus === 'active')

const eve = await signUp('Eve Beasty', ana.code)
await hook('checkout.session.completed', { client_reference_id: eve.id, customer: 'cus_eve' })
await hook('invoice.paid', invoice('in_eve_1', 'cus_eve', PRICE.diamond, { reason: 'subscription_create', amount: 3999 }))
check('a paused-then-resumed recruiter is credited again', (await pointsOf(ana.id)) === 30)
await ana.call('/api/members/recruiter/pause', { paused: true })
await hook('invoice.paid', invoice('in_eve_2', 'cus_eve', PRICE.diamond, { amount: 3999 }))
check('a pause does not stop the months still owed on an earlier referral', (await pointsOf(ana.id)) === 40)
await ana.call('/api/members/recruiter/pause', { paused: false })
await hook('invoice.paid', invoice('in_eve_3', 'cus_eve', PRICE.diamond, { amount: 3999 }))
await hook('invoice.paid', invoice('in_eve_4', 'cus_eve', PRICE.diamond, { amount: 3999 }))
check('BEASTY PASS: 3 months, and a fourth earns nothing', (await pointsOf(ana.id)) === 50)

/* ---- 4. refunds and disputes ---- */
await hook('charge.refunded', { object: 'charge', id: 'ch_eve_3', invoice: 'in_eve_3', payment_intent: 'pi_in_eve_3', refunded: false, amount_refunded: 100 })
check('a partial refund leaves the month alone', (await pointsOf(ana.id)) === 50)
await hook('charge.refunded', { object: 'charge', id: 'ch_eve_3', invoice: 'in_eve_3', payment_intent: 'pi_in_eve_3', refunded: true })
check('a full refund takes that month back', (await pointsOf(ana.id)) === 40)
await hook('charge.dispute.created', { object: 'dispute', id: 'dp_1', charge: 'ch_eve_2', payment_intent: 'pi_in_eve_2' })
check('a dispute takes that month back too, matched by its payment', (await pointsOf(ana.id)) === 30)
b = await bark(ana)
check('her card shows the removed months struck through with why', b.ledger.filter((r) => r.status === 'void').length === 2 && b.ledger.some((r) => r.voidNote === 'Payment refunded'))

/* ---- 5. businesses: months recorded in the CRM ---- */
const admin = person()
check('the operator signs into the CRM', (await admin.call('/api/crm/session', { token: OPERATOR })).status === 200)
const now = Date.now()
const personId = `p_${randomBytes(5).toString('hex')}`
await sql.query("INSERT INTO crm_people (id, slug, name, source_type, role, is_team, member_id, active, created_at, updated_at, created_by) VALUES ($1,$2,'Ana R.','member','none',FALSE,$3,TRUE,$4,$4,'audit')", [personId, ana.code.toLowerCase(), ana.id, now])
const recruitedAt = Number((await sql.query("SELECT MIN(at) AS at FROM recruiter_history WHERE member_id = $1 AND status = 'active'", [ana.id])).rows[0].at)
async function business(name, referredAt, sold) {
  const opp = `o_${randomBytes(5).toString('hex')}`
  const deal = `d_${randomBytes(5).toString('hex')}`
  await sql.query(
    "INSERT INTO crm_opportunities (id, business_name, family_key, opportunity_type, stage, stage_changed_at, referrer_id, referred_at, won_at, created_at, updated_at, created_by) VALUES ($1,$2,$3,'listing','won',$4,$5,$6,$4,$6,$4,'audit')",
    [opp, name, name.toLowerCase(), now, personId, referredAt],
  )
  await sql.query(
    "INSERT INTO crm_deals (id, opportunity_id, offer_name, quoted_cents, sold_cents, monthly_cents, status, recurring_active, won_at, created_at, updated_at, created_by) VALUES ($1,$2,'BEASTY listing',9900,$3,3900,'won',TRUE,$4,$4,$4,'audit')",
    [deal, opp, sold, now],
  )
  return deal
}
const taco = await business('Taco Audit', recruitedAt + 1000, 9900)
const before = await business('Before She Recruited', recruitedAt - 60_000, 9900)
const unpaid = await business('No Initiation Yet', recruitedAt + 2000, 0)
const month = (deal) => admin.call(`/api/crm/onboarding/${appId}/bark/business-month`, { dealId: deal })
let crm = (await admin.call(`/api/crm/onboarding/${appId}/bark`)).body
check('the CRM lists the businesses she referred', crm.businesses.length === 3)
check('…saying why one asked before she recruited cannot earn', crm.businesses.find((x) => x.dealId === before)?.blocked.includes('not recruiting'))
check('…and why one without its initiation fee cannot', crm.businesses.find((x) => x.dealId === unpaid)?.blocked.includes('initiation'))
check('recording a month for those is refused', (await month(before)).status === 409 && (await month(unpaid)).status === 409)
for (let i = 0; i < 6; i++) await month(taco)
check('six paid months credit 60 points', (await pointsOf(ana.id)) === 90)
check('a seventh is refused', (await month(taco)).status === 409)
check('a business from another affiliate is refused', (await admin.call(`/api/crm/onboarding/${appId}/bark/business-month`, { dealId: 'd_nope' })).status === 404)
check('a member cannot record months', (await ana.call(`/api/crm/onboarding/${appId}/bark/business-month`, { dealId: taco })).status === 401)

/* ---- 6. cash-outs ---- */
await hook('invoice.paid', invoice('in_extra', 'cus_cara_none', PRICE.pass)) // a customer nobody has: kept, harmless
const fred = await signUp('Fred Biggie', ana.code)
await hook('checkout.session.completed', { client_reference_id: fred.id, customer: 'cus_fred' })
await hook('invoice.paid', invoice('in_fred_1', 'cus_fred', PRICE.pass, { reason: 'subscription_create' }))
await hook('invoice.paid', invoice('in_fred_2', 'cus_fred', PRICE.pass))
check('110 points earned in all', (await pointsOf(ana.id)) === 110)
let co = await ana.call('/api/affiliate/cashout', { points: 100 })
check('cashing out before the packet is approved is refused', co.status === 409 && /approves/.test(co.body?.error ?? ''))
b = await bark(ana)
check('…and the card says to finish the paperwork, offering no amounts', b.paperwork === 'in_progress' && b.choices.length === 0)
await sql.query("UPDATE onboarding_applications SET status = 'approved', decided_at = $2 WHERE id = $1", [appId, Date.now()])
b = await bark(ana)
check('once approved she may ask for 100 (not 110: steps of 50)', JSON.stringify(b.choices) === '[100]')
check('an amount off the steps is refused', (await ana.call('/api/affiliate/cashout', { points: 110 })).status === 400)
check('more than she has is refused', (await ana.call('/api/affiliate/cashout', { points: 150 })).status === 400)
co = await ana.call('/api/affiliate/cashout', { points: 100 })
check('100 points is asked for', co.status === 201 && co.body?.openCashout?.points === 100 && co.body?.openCashout?.cents === 10000)
check('…leaving 10 to cash out', co.body?.balance?.available === 10)
await sql.query("UPDATE bark_points SET points = points WHERE FALSE") // no-op: keep the client warm
check('a second request while one is open is refused', (await ana.call('/api/affiliate/cashout', { points: 100 })).status !== 201)
check('the CRM lists the open request', (await admin.call('/api/crm/bark/cashouts')).body?.open?.some((c) => c.applicationId === appId && c.points === 100))
const coId = co.body.openCashout.id
check('declining needs a reason', (await admin.call(`/api/crm/onboarding/${appId}/bark/cashouts/${coId}`, { decision: 'declined' })).status === 400)
crm = (await admin.call(`/api/crm/onboarding/${appId}/bark/cashouts/${coId}`, { decision: 'paid', note: 'Direct deposit, audit' })).body
check('the team marks it paid', crm?.cashouts?.find((c) => c.id === coId)?.status === 'paid')
check('…once only', (await admin.call(`/api/crm/onboarding/${appId}/bark/cashouts/${coId}`, { decision: 'paid' })).status === 409)
await hook('charge.refunded', { object: 'charge', id: 'ch_fred_2', invoice: 'in_fred_2', payment_intent: 'pi_in_fred_2', refunded: true })
b = await bark(ana)
check('a refund after payout leaves 0 to cash out, never below', b.balance.available === 0 && b.balance.owed === 0 && b.balance.earned === 100)
await hook('charge.refunded', { object: 'charge', id: 'ch_fred_1', invoice: 'in_fred_1', payment_intent: 'pi_in_fred_1', refunded: true })
b = await bark(ana)
check('…and one more is owed, off her next cash-out, still never below zero', b.balance.available === 0 && b.balance.owed === 10)
await sql.query("UPDATE bark_points SET paid_at = paid_at - $2 WHERE payment_ref = $1", ['in_cara_2', 61 * 864e5])
await hook('charge.refunded', { object: 'charge', id: 'ch_cara_2', invoice: 'in_cara_2', payment_intent: 'pi_in_cara_2', refunded: true })
check('a refund more than 60 days after the payment takes nothing back', (await pointsOf(ana.id)) === 90)
const voidable = (await sql.query("SELECT id FROM bark_points WHERE member_id = $1 AND status = 'earned' AND source_kind = 'business' ORDER BY month DESC LIMIT 1", [ana.id])).rows[0].id
check('removing points in the CRM needs a reason', (await admin.call(`/api/crm/onboarding/${appId}/bark/points/${voidable}/void`, {})).status === 400)
check('…and works with one', (await admin.call(`/api/crm/onboarding/${appId}/bark/points/${voidable}/void`, { note: 'Business refunded month 6' })).status === 200 && (await pointsOf(ana.id)) === 80)

/* ---- 7. cancelling ---- */
const gus = await signUp('Gus Late', ana.code)
await hook('customer.subscription.deleted', { object: 'subscription', customer: 'cus_ana_rec', status: 'canceled', items: { data: [{ price: { id: PRICE.recruiter } }] } })
me = (await ana.call('/api/members/me')).body
check('cancelling the $60 ends recruiting', me.recruiterStatus === 'cancelled')
await hook('checkout.session.completed', { client_reference_id: gus.id, customer: 'cus_gus' })
await hook('invoice.paid', invoice('in_gus_1', 'cus_gus', PRICE.pass, { reason: 'subscription_create' }))
check('…so nothing more is credited, even for a friend from before', (await pointsOf(ana.id)) === 80)
check('…and the CRM will not record more business months', (await month(taco)).status === 409)
b = await bark(ana)
check('what she earned stays on her card', b.recruiter === 'cancelled' && b.balance.earned === 80)

/* ---- 8. the screens ---- */
/* A second recruiter with points and approved paperwork, for the cash-out button. */
const hana = await signUp('Hana Shown')
await hook('checkout.session.completed', { client_reference_id: `rc_${hana.id}`, customer: 'cus_hana_rec' })
for (const n of ['Ivy One', 'Jon Two']) {
  const f = await signUp(n, hana.code)
  const cus = `cus_${n.split(' ')[0].toLowerCase()}`
  await hook('checkout.session.completed', { client_reference_id: f.id, customer: cus })
  for (let i = 1; i <= 3; i++) await hook('invoice.paid', invoice(`in_${cus}_${i}`, cus, PRICE.diamond, { reason: i === 1 ? 'subscription_create' : 'subscription_cycle', amount: 3999 }))
}
const hanaApp = (await sql.query('SELECT id FROM onboarding_applications WHERE member_id = $1', [hana.id])).rows[0]?.id
check('the second recruiter has 60 points and paperwork open', (await pointsOf(hana.id)) === 60)

browser = await chromium.launch()
const phone = async (who) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await ctx.addCookies([...who.jar].map(([name, value]) => ({ name, value, url: base })))
  return ctx.newPage()
}
let page = await phone(hana)
await page.goto(`${base}/members`, { waitUntil: 'domcontentloaded' })
await page.locator('.members-recruiter').waitFor({ timeout: 20000 }).catch(() => {})
await page.locator('.members-recruiter').scrollIntoViewIfNeeded().catch(() => {})
await page.waitForTimeout(700)
let text = await page.locator('body').innerText()
check('Members: a paid recruiter is sent to their paperwork', /Do your paperwork to get paid/.test(text))
await page.locator('.members-recruiter').screenshot({ path: '.verify/bark-members-recruiter.png' }).catch(() => {})

await page.goto(`${base}/affiliate`, { waitUntil: 'domcontentloaded' })
await page.locator('.aff-bark').waitFor({ timeout: 20000 }).catch(() => {})
await page.waitForTimeout(600)
text = await page.locator('.aff-bark').innerText().catch(() => '')
check('Affiliate dashboard: the card shows 60 points and the paperwork step', /60/.test(text) && /Finish your paperwork/.test(text))
await page.locator('.aff-bark').screenshot({ path: '.verify/bark-card-paperwork.png' }).catch(() => {})

await sql.query("UPDATE onboarding_applications SET status = 'approved' WHERE id = $1", [hanaApp])
await page.reload({ waitUntil: 'domcontentloaded' })
await page.locator('.aff-bark-cash').waitFor({ timeout: 20000 }).catch(() => {})
text = await page.locator('.aff-bark').innerText().catch(() => '')
check('…with approved paperwork but under 100 it says how many to go', /40 to go/.test(text))
for (let i = 4; i <= 7; i++) await sql.query("INSERT INTO bark_points (id, member_id, source_kind, source_id, month, points, status, note, paid_at, created_at) VALUES ($1,$2,'business',$3,$4,10,'earned','Taco Audit, paid month',$5,$5)", [`bp_audit_${i}`, hana.id, 'd_shown', i, Date.now()])
await page.reload({ waitUntil: 'domcontentloaded' })
await page.locator('.aff-bark-cash').waitFor({ timeout: 20000 }).catch(() => {})
await page.waitForTimeout(400)
text = await page.locator('.aff-bark').innerText().catch(() => '')
check('…and at 100 it offers the cash-out', /Cash out 100 points/.test(text))
await page.locator('.aff-bark').screenshot({ path: '.verify/bark-card-cashout.png' }).catch(() => {})
await page.getByRole('button', { name: 'Cash out 100 points' }).click()
await page.waitForTimeout(800)
text = await page.locator('.aff-bark').innerText().catch(() => '')
check('…and tapping it records the ask', /You asked for 100 points/.test(text))
await page.locator('.aff-bark').screenshot({ path: '.verify/bark-card-asked.png' }).catch(() => {})

page = await phone(nobody)
await page.goto(`${base}/join`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
text = await page.locator('body').innerText()
check('/join for a member who never paid says to become a recruiter first', /Become a recruiter first/.test(text))

const desk = await browser.newContext({ viewport: { width: 1280, height: 900 } })
await desk.addCookies([...admin.jar].map(([name, value]) => ({ name, value, url: base })))
page = await desk.newPage()
await page.goto(`${base}/crm#/affiliate/${hanaApp}`, { waitUntil: 'domcontentloaded' })
await page.locator('.crm-bark').waitFor({ timeout: 20000 }).catch(() => {})
await page.waitForTimeout(800)
text = await page.locator('.crm-bark').innerText().catch(() => '')
check('CRM: the affiliate page shows the cash-out to pay and the credits', /Cash-out asked for: 100 points, \$100\.00/.test(text) && /Mark paid/.test(text) && /BEASTY PASS month 3 of 3/.test(text))
await page.locator('.crm-bark').screenshot({ path: '.verify/bark-crm.png' }).catch(() => {})
await page.goto(`${base}/crm#/affiliates`, { waitUntil: 'domcontentloaded' })
await page.locator('.crm-bark-due').waitFor({ timeout: 20000 }).catch(() => {})
text = await page.locator('.crm-bark-due').innerText().catch(() => '')
check('CRM: the Affiliates list leads with the cash-out to pay', /1 cash-out request to pay/.test(text) && /Hana/.test(text))

if (fails.length) { console.log(`\nFAIL: ${fails.length} BARK checks (server log: ${LOG})`); await done(1) }
console.log('\nPASS: the $60 opens the paperwork, paid months credit points while recruiting, refunds take them back, and cash-outs wait for an approved packet.')
await done(0)
