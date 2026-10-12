/*
  AFFILIATE ONBOARDING (server/onboarding.ts, src/join). Glenn, 2026-10-10:
  "add our own form on the website ... Call it BEASTY forms": basic info, SSN,
  bank numbers and an ID, then the agreement signed and countersigned.

  Run against a fresh test database in test mode (AFFILIATE_PROVIDERS=mock),
  which stands in for Stripe Connect and DocuSeal. Proves, through the API and
  then in a phone-sized browser:
  - an invite link from the CRM opens the portal; it is single-use, expires,
    can be cancelled, and a resend kills the old link;
  - the application is the member's own: nobody else can read or change it;
  - autosave is revision-checked: a stale save cannot overwrite newer typing;
  - submit is refused until the profile, payouts and the signed agreement are
    all done, and the application locks once it is in;
  - approval waits for BEASTY's countersignature; the decisions follow their
    rules; every step lands on the record;
  - the DocuSeal webhook rejects a bad secret and ignores a replay;
  - nothing payout-sensitive leaves the server, and the invite pages are
    neither indexed nor leak their token as a Referer.
  Synthetic people only.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { openSync, readFileSync, mkdirSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('onboarding')
const TOKEN = `op_${randomBytes(16).toString('hex')}`
const HOOK = `whsec_${randomBytes(16).toString('hex')}`
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
let port = await freePort()
let LOG = `/tmp/audit-onboarding-${port}.log`
let srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', openSync(LOG, 'w'), openSync(LOG, 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', OPERATOR_TOKEN: TOKEN, RESEND_API_KEY: '', LEAD_EMAIL: '', AFFILIATE_PROVIDERS: 'mock', DOCUSEAL_WEBHOOK_SECRET: HOOK },
})
let base = `http://localhost:${port}`
let up = false
for (let i = 0; i < 240 && !up; i++) { try { up = (await fetch(base + '/api/health')).ok } catch { await new Promise((r) => setTimeout(r, 250)) } }
if (!up) { console.log('FAIL: server never came up'); srv.kill(); process.exit(1) }

const fails = []
const check = (name, ok, detail = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${name}${detail ? `   ${detail}` : ''}`); if (!ok) fails.push(name) }

/* A cookie jar per person, and its own IP so the per-IP limits don't collide. */
let ipn = 10
function person() {
  const jar = new Map()
  const ip = `10.9.0.${ipn++}`
  return {
    jar,
    async call(method, path, body, headers = {}) {
      const r = await fetch(base + path, {
        method,
        redirect: 'manual',
        headers: { 'x-forwarded-for': ip, ...(body !== undefined ? { 'content-type': 'application/json' } : {}), cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; '), ...headers },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
      for (const c of r.headers.getSetCookie?.() ?? []) { const [kv] = c.split(';'); const i = kv.indexOf('='); jar.set(kv.slice(0, i), kv.slice(i + 1)) }
      const text = await r.text()
      let json = null
      try { json = JSON.parse(text) } catch {}
      return { status: r.status, body: json, text, headers: r.headers }
    },
  }
}
const codeFor = async (email) => {
  for (let i = 0; i < 40; i++) {
    const c = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
    if (c) return c
    await new Promise((r) => setTimeout(r, 200))
  }
  return null
}
async function member(name) {
  const p = person()
  const email = `${name.toLowerCase().replace(/\W+/g, '')}-${port}@audit.beastypages.dev`
  await p.call('POST', '/api/members/start', { name, email })
  const v = await p.call('POST', '/api/members/verify', { email, code: await codeFor(email) })
  p.email = email
  p.ok = v.status < 300
  return p
}
const tokenOf = (link) => link.split('/join/')[1]

/* ---- the CRM side: who may invite ---- */
const anon = person()
check('the CRM list needs the key', (await anon.call('GET', '/api/crm/onboarding')).status === 401)
const admin = person()
check('the operator key opens a CRM session', (await admin.call('POST', '/api/crm/session', { token: TOKEN })).status === 200)
check('an invite needs an email', (await admin.call('POST', '/api/crm/onboarding/invites', { email: 'nope' })).status === 400)
const inv = await admin.call('POST', '/api/crm/onboarding/invites', { email: 'ally.tester@audit.beastypages.dev', name: 'Ally Tester' })
check('Glenn can invite an affiliate', inv.status === 201 && /\/join\/[A-Za-z0-9_-]{30,}$/.test(inv.body?.link ?? ''), inv.body?.link)
const tok = tokenOf(inv.body.link)

/* ---- the invite link ---- */
const pv = await anon.call('GET', `/api/onboarding/invite/${tok}`)
check('the invite previews its name, and only a hint of the email', pv.body?.state === 'open' && pv.body?.name === 'Ally Tester' && /^a•+@audit\.beastypages\.dev$/.test(pv.body?.emailHint ?? '') && !pv.text.includes('ally.tester'), pv.text)
check('a made-up token is unknown', (await anon.call('GET', `/api/onboarding/invite/${'x'.repeat(32)}`)).status === 404)
const page = await anon.call('GET', `/join/${tok}`)
check('the invite page is not indexed and never sends its token on', /noindex/.test(page.headers.get('x-robots-tag') ?? '') && page.headers.get('referrer-policy') === 'no-referrer')
check('redeeming needs a signed-in member', (await anon.call('POST', `/api/onboarding/invite/${tok}/redeem`)).status === 401)

const ally = await member('Ally Tester')
check('Ally signs in with the usual BEASTY code', ally.ok)
const red = await ally.call('POST', `/api/onboarding/invite/${tok}/redeem`)
check('the invite becomes her application', red.status === 201 && red.body?.status === 'in_progress' && red.body?.profile?.email === 'ally.tester@audit.beastypages.dev' && red.body?.profile?.legalFirst === 'Ally', JSON.stringify(red.body?.profile))
check('opening it again is harmless', (await ally.call('POST', `/api/onboarding/invite/${tok}/redeem`)).status === 200)
const mallory = await member('Mallory Other')
check('nobody else can use her invite', (await mallory.call('POST', `/api/onboarding/invite/${tok}/redeem`)).status === 409)
check('and nobody else has an application to read', (await mallory.call('GET', '/api/onboarding/me')).status === 404)
check('a member cannot reach the CRM list', (await mallory.call('GET', '/api/crm/onboarding')).status === 401)

/* ---- autosave ---- */
let rev = red.body.revision
const s1 = await ally.call('PUT', '/api/onboarding/me/profile', { revision: rev, profile: { ...red.body.profile, legalLast: 'Tester', state: 'ca', promote: ['instagram', 'hacking'], line1: 'x'.repeat(500) } })
check('a save lands and moves the revision on', s1.status === 200 && s1.body?.revision === rev + 1)
const me1 = await ally.call('GET', '/api/onboarding/me')
check('the saved draft is cleaned: state upper-cased, unknown choices dropped, long text cut', me1.body?.profile?.state === 'CA' && JSON.stringify(me1.body?.profile?.promote) === '["instagram"]' && me1.body?.profile?.line1?.length === 100)
const stale = await ally.call('PUT', '/api/onboarding/me/profile', { revision: rev, profile: { legalFirst: 'Overwritten' } })
check('a stale save from another tab is refused with the newer version', stale.status === 409 && stale.body?.revision === rev + 1 && stale.body?.profile?.legalLast === 'Tester')
rev = rev + 1

/* ---- the steps, in the wrong order first ---- */
check('the agreement waits for her information', (await ally.call('POST', '/api/onboarding/me/agreement/sign')).status === 409)
const early = await ally.call('POST', '/api/onboarding/me/submit')
check('submit names what is still missing', early.status === 409 && /your information/.test(early.body?.error ?? '') && /payout/.test(early.body?.error ?? '') && /agreement/.test(early.body?.error ?? ''), early.body?.error)
const full = { legalFirst: 'Ally', legalLast: 'Tester', email: 'ally.tester@audit.beastypages.dev', phone: '(510) 555-0142', line1: '100 Example St', city: 'Oakland', state: 'CA', zip: '94612', kind: 'individual', promote: ['instagram', 'in_person'], instagram: '@allytester' }
const s2 = await ally.call('PUT', '/api/onboarding/me/profile', { revision: rev, profile: full })
check('her information is complete', s2.status === 200 && Object.keys(s2.body?.problems ?? { x: 1 }).length === 0)
rev = s2.body.revision

const pl = await ally.call('POST', '/api/onboarding/me/payouts/link')
check('payout setup sends her to the (test) Stripe page', pl.status === 200 && /\/join\?mock=payouts$/.test(pl.body?.url ?? ''), pl.body?.url)
const sg = await ally.call('POST', '/api/onboarding/me/agreement/sign')
check('the agreement opens on the (test) signing page', sg.status === 200 && /\/join\?mock=sign$/.test(sg.body?.url ?? ''), `${sg.status} ${sg.text}`)
const before = await ally.call('GET', '/api/onboarding/me?refresh=1')
check('nothing is marked done before the providers say so', before.body?.steps?.payouts?.complete === false && before.body?.steps?.agreement?.affiliateSigned === false)
check('the test payout page finishes', (await ally.call('POST', '/api/onboarding/me/mock/payouts')).status === 200)
check('the test signing page finishes', (await ally.call('POST', '/api/onboarding/me/mock/sign')).status === 200)
const after = await ally.call('GET', '/api/onboarding/me?refresh=1')
check('payouts and her signature now read as done', after.body?.steps?.payouts?.complete === true && after.body?.steps?.payouts?.bankLast4 === '0000' && after.body?.steps?.agreement?.affiliateSigned === true && after.body?.steps?.agreement?.status === 'pending_countersignature', JSON.stringify(after.body?.steps))
check('the Stripe account id never reaches her page', !JSON.stringify(after.body).includes('acct_'))
const sub = await ally.call('POST', '/api/onboarding/me/submit')
check('she submits', sub.status === 200 && sub.body?.status === 'submitted')
check('and it locks: no more edits', (await ally.call('PUT', '/api/onboarding/me/profile', { revision: rev, profile: full })).status === 409)
check('submitting twice is refused', (await ally.call('POST', '/api/onboarding/me/submit')).status === 409)

/* ---- Glenn reviews ---- */
const list = await admin.call('GET', '/api/crm/onboarding')
const row = list.body?.applications?.find((a) => a.email === 'ally.tester@audit.beastypages.dev')
check('the CRM lists her as submitted', row?.status === 'submitted' && row?.payouts === 'complete' && row?.agreement === 'pending_countersignature' && list.body?.counts?.submitted === 1, JSON.stringify(row))
check('the CRM says which providers are live', list.body?.providers?.payouts === 'mock' && list.body?.providers?.signing === 'mock')
const det = await admin.call('GET', `/api/crm/onboarding/${row.id}`)
check('her record opens, without the Stripe account id', det.status === 200 && det.body?.countersignAvailable === true && !JSON.stringify(det.body).includes('acct_'))
const kinds = (det.body?.events ?? []).map((e) => e.kind)
check('every step is on the record', ['started', 'profile_completed', 'payouts_started', 'agreement_sent', 'payouts_completed', 'agreement_signed', 'submitted', 'admin_viewed'].every((k) => kinds.includes(k)), kinds.join(' '))
check('approval waits for BEASTY’s countersignature', (await admin.call('POST', `/api/crm/onboarding/${row.id}/decision`, { action: 'approve' })).status === 409)
check('a rejection needs a reason', (await admin.call('POST', `/api/crm/onboarding/${row.id}/decision`, { action: 'reject' })).status === 400)
check('an unknown action is refused', (await admin.call('POST', `/api/crm/onboarding/${row.id}/decision`, { action: 'delete' })).status === 400)
check('Glenn countersigns', (await admin.call('POST', `/api/crm/onboarding/${row.id}/countersign`)).status === 200)
const ap = await admin.call('POST', `/api/crm/onboarding/${row.id}/decision`, { action: 'approve' })
check('and approves her', ap.status === 200 && ap.body?.status === 'approved')
const mine = await ally.call('GET', '/api/onboarding/me')
check('she sees she is approved and the agreement is countersigned', mine.body?.status === 'approved' && mine.body?.steps?.agreement?.countersigned === true)
check('suspend and reinstate follow their rules', (await admin.call('POST', `/api/crm/onboarding/${row.id}/decision`, { action: 'reinstate' })).status === 409 && (await admin.call('POST', `/api/crm/onboarding/${row.id}/decision`, { action: 'suspend', note: 'test' })).status === 200 && (await admin.call('POST', `/api/crm/onboarding/${row.id}/decision`, { action: 'reinstate' })).status === 200)

/* ---- invites that expire, get cancelled, or get resent ---- */
const db = new pg.Client({ connectionString: TESTDB.url })
await db.connect()
const i2 = await admin.call('POST', '/api/crm/onboarding/invites', { email: 'late.tester@audit.beastypages.dev', name: 'Late Tester' })
await db.query('UPDATE onboarding_invites SET expires_at = $1 WHERE id = $2', [Date.now() - 1000, i2.body.id])
check('an expired invite says so', (await anon.call('GET', `/api/onboarding/invite/${tokenOf(i2.body.link)}`)).body?.state === 'expired')
const late = await member('Late Tester')
check('and cannot be redeemed', (await late.call('POST', `/api/onboarding/invite/${tokenOf(i2.body.link)}/redeem`)).status === 410)
const rs = await admin.call('POST', `/api/crm/onboarding/invites/${i2.body.id}/resend`)
check('a resend makes a new link', rs.status === 200 && rs.body?.link !== i2.body.link)
check('the old link stops working', (await anon.call('GET', `/api/onboarding/invite/${tokenOf(i2.body.link)}`)).status === 404)
check('the new one opens', (await anon.call('GET', `/api/onboarding/invite/${tokenOf(rs.body.link)}`)).body?.state === 'open')
check('Glenn can cancel it', (await admin.call('POST', `/api/crm/onboarding/invites/${i2.body.id}/revoke`)).status === 200)
check('a cancelled invite says so', (await anon.call('GET', `/api/onboarding/invite/${tokenOf(rs.body.link)}`)).body?.state === 'revoked')
check('and cannot be redeemed', (await late.call('POST', `/api/onboarding/invite/${tokenOf(rs.body.link)}/redeem`)).status === 410)

/* ---- the DocuSeal webhook ---- */
const evt = { event_type: 'form.completed', timestamp: '2026-10-10T12:00:00Z', data: { id: 1, submission_id: 999 } }
check('a webhook without the secret is refused', (await anon.call('POST', '/api/onboarding/webhooks/docuseal', evt)).status === 401)
check('a webhook with a wrong secret is refused', (await anon.call('POST', '/api/onboarding/webhooks/docuseal', evt, { 'x-beasty-webhook-secret': HOOK.replace(/.$/, 'x') })).status === 401)
const w1 = await anon.call('POST', '/api/onboarding/webhooks/docuseal', evt, { 'x-beasty-webhook-secret': HOOK })
const w2 = await anon.call('POST', '/api/onboarding/webhooks/docuseal', evt, { 'x-beasty-webhook-secret': HOOK })
check('a signed webhook is taken once, and a replay is ignored', w1.status === 200 && !w1.body?.duplicate && w2.status === 200 && w2.body?.duplicate === true)

/* ---- the portal itself, on a phone ---- */
const i3 = await admin.call('POST', '/api/crm/onboarding/invites', { email: 'phone.tester@audit.beastypages.dev', name: 'Phone Tester' })
const SHOTS = process.env.ONBOARDING_SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const shot = async (p, n) => { if (SHOTS) await p.screenshot({ path: `${SHOTS}/${n}.png`, fullPage: true }) }
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, extraHTTPHeaders: { 'x-forwarded-for': '10.9.1.1' } })
const p = await ctx.newPage()
const noScroll = async () => p.evaluate(() => document.querySelector('.onb').scrollWidth <= window.innerWidth + 1)
await p.goto(i3.body.link, { waitUntil: 'networkidle' })
check('the invite opens on the welcome, with her name', await p.getByRole('heading', { name: 'Join the BEASTY affiliate program' }).isVisible() && (await p.textContent('.onb-hello'))?.includes('Phone'))
check('the welcome fits the phone', await noScroll())
await shot(p, '1-welcome')
await p.getByRole('button', { name: 'Get started' }).click()
await p.getByRole('button', { name: 'Email me' }).click()
await p.fill('#j-dest', 'phone.tester@audit.beastypages.dev')
await p.getByRole('button', { name: 'Send my code' }).click()
await p.waitForSelector('#j-code')
await p.fill('#j-code', await codeFor('phone.tester@audit.beastypages.dev'))
await shot(p, '2-code')
await p.getByRole('button', { name: 'Continue' }).click()
await p.waitForSelector('#s0', { timeout: 15000 }).catch(() => {})
check('after the code, step 1 opens', await p.isVisible('#s0'))
check('her invite name is already filled in', (await p.inputValue('#p-legalFirst')) === 'Phone')
check('and the token is gone from the address bar', new URL(p.url()).pathname === '/join')
await p.getByRole('button', { name: 'Continue' }).click()
check('Continue with gaps shows what is missing', await p.isVisible('.onb-err'))
await p.fill('#p-legalLast', 'Tester')
await p.fill('#p-phone', '415 555 0199')
await p.fill('#p-line1', '200 Sample Ave')
await p.fill('#p-city', 'San Francisco')
await p.fill('#p-state', 'ca')
await p.fill('#p-zip', '94103')
await p.getByRole('button', { name: 'An individual' }).click()
await p.getByRole('button', { name: 'TikTok' }).click()
await p.waitForSelector('.onb-save[data-state="saved"]', { timeout: 10000 }).catch(() => {})
check('the bar says the changes are saved', (await p.textContent('.onb-save'))?.includes('All changes saved'))
await shot(p, '3-information')
check('step 1 fits the phone', await noScroll())
/* A real swipe, not Playwright's scroll-into-view: on 10 Oct the page could not be
   scrolled on a phone at all because the app's body does not scroll. */
await p.mouse.move(196, 600)
await p.mouse.wheel(0, 1500)
await p.waitForTimeout(400)
const swiped = await p.evaluate(() => document.querySelector('.onb').scrollTop)
check('step 1 scrolls with a swipe, as a phone does', swiped > 200, String(swiped))
check('and Continue stays docked on screen while it does', await p.evaluate(() => { const r = document.querySelector('.onb-dock').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1 }))
await p.reload({ waitUntil: 'networkidle' })
await p.waitForSelector('#s1', { timeout: 15000 }).catch(() => {})
check('a reload resumes at her first unfinished step', await p.isVisible('#s1'))
await p.getByRole('button', { name: 'Back to Your information' }).click()
await p.waitForSelector('#p-zip')
check('and Back shows everything she typed, kept', (await p.inputValue('#p-zip')) === '94103' && (await p.inputValue('#p-city')) === 'San Francisco')
await p.getByRole('button', { name: 'Continue' }).click()
await p.waitForSelector('#s1')
check('step 2 explains Stripe and what BEASTY never sees', (await p.textContent('#s1 ~ .onb-trust, .onb-trust'))?.includes('never sees'))
await shot(p, '4-get-paid')
await p.getByRole('button', { name: 'Set up payouts with Stripe' }).click()
await p.waitForSelector('.onb-standin')
check('test mode says plainly that it stands in for Stripe', (await p.textContent('.onb-standin'))?.includes('Stripe’s payout setup would open here'))
await p.getByRole('button', { name: 'Finish test payout setup' }).click()
await p.waitForSelector('#s1, #s2', { timeout: 15000 })
check('back from Stripe, payouts read as done', (await p.textContent('.onb-rows'))?.includes('Account ending 0000'))
await p.getByRole('button', { name: 'Continue' }).click()
await p.waitForSelector('#s2')
await shot(p, '5-agreement')
await p.getByRole('button', { name: 'Review and sign' }).click()
await p.waitForSelector('.onb-standin')
await p.getByRole('button', { name: 'Sign test agreement' }).click()
await p.waitForSelector('#s2, #s3', { timeout: 15000 })
check('back from signing, her signature reads as done', (await p.textContent('.onb-rows'))?.includes('Signed. Thank you.'))
await p.getByRole('button', { name: 'Continue' }).click()
await p.waitForSelector('#s3')
await shot(p, '6-review')
await p.getByRole('button', { name: 'Submit application' }).click()
await p.waitForSelector('.onb-status', { timeout: 15000 })
check('after submitting, the dashboard says it is under review', (await p.textContent('.onb-status'))?.includes('Under review'))
check('the dashboard fits the phone', await noScroll())
await shot(p, '7-dashboard')

/* ---- Glenn's side, in the CRM: find her, countersign, approve, invite the next ---- */
for (const [w, h, label] of [[1280, 900, 'computer'], [393, 852, 'phone']]) {
  const gctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, extraHTTPHeaders: { 'x-forwarded-for': `10.9.2.${w % 250}` } })
  const g = await gctx.newPage()
  g.on('dialog', (d) => d.accept())
  await g.goto(`${base}/crm`, { waitUntil: 'networkidle' })
  await g.fill('input[type="password"]', TOKEN)
  await g.click('button:has-text("Open the CRM")')
  await g.waitForSelector('.crm-tabbar, .crm-bar', { timeout: 15000 })
  await g.goto(`${base}/crm#/referrers`)
  await g.waitForSelector('a.crm-btn:has-text("Affiliates")', { timeout: 15000 })
  await g.click('a.crm-btn:has-text("Affiliates")')
  await g.waitForSelector('.crm-row:has-text("Phone Tester")', { timeout: 15000 }).catch(() => {})
  /* The CRM scrolls inside .crm; the chip row scrolls sideways on its own, by design. */
  const fits = async () => g.evaluate(() => [...document.querySelectorAll('.crm')].every((el) => el.scrollWidth <= el.clientWidth + 1) && document.documentElement.scrollWidth <= window.innerWidth + 1)
  if (label === 'computer') {
    check('CRM: People links to Affiliates, where she waits for Glenn', (await g.textContent('.crm-row:has-text("Phone Tester")'))?.includes('Waiting for you'))
    check('CRM: the list says it is test mode', (await g.textContent('.crm-aff-notice'))?.includes('Test mode'))
    await shot(g, '8-crm-list')
    await g.click('.crm-row:has-text("Phone Tester")')
    await g.waitForSelector('.crm-aff-decide', { timeout: 15000 })
    check('CRM: her page shows all three steps', (await g.locator('.crm-aff-step').count()) === 3)
    check('CRM: approve waits for the countersignature', await g.locator('.crm-aff-decide button.is-good').isDisabled())
    check('CRM: her page shows no account number or SSN field', !/acct_|routing|social security number:/i.test(await g.textContent('.crm-aff-main')))
    await shot(g, '9-crm-detail')
    await g.click('.crm-aff-decide button:has-text("Countersign")')
    await g.waitForSelector(".crm-aff-decide button.is-good:enabled", { timeout: 15000 }).catch(() => {})
    check('CRM: after countersigning, Approve opens', await g.locator('.crm-aff-decide button.is-good').isEnabled())
    await g.click('.crm-aff-decide button.is-good')
    await g.waitForSelector('.crm-lead-head .crm-stage.is-green', { timeout: 15000 }).catch(() => {})
    check('CRM: approving turns her Approved', (await g.textContent('.crm-lead-head'))?.includes('Approved'))
    check('CRM: the history shows the countersignature and the approval', /Agreement countersigned[\s\S]*Approved/.test(await g.textContent('.crm-timeline')))
    await shot(g, '10-crm-approved')
    await g.click('.crm-back')
    await g.click('button:has-text("Invite someone")')
    await g.fill('.crm-aff-invite input[type="email"]', 'next.one@audit.beastypages.dev')
    await g.click('button:has-text("Send invite")')
    await g.waitForSelector('.crm-aff-link', { timeout: 15000 }).catch(() => {})
    check('CRM: an invite comes back as a link to copy', /\/join\/[A-Za-z0-9_-]{20,}/.test((await g.textContent('.crm-aff-link-url').catch(() => '')) ?? ''))
    await g.waitForSelector('.crm-row:has-text("next.one@audit.beastypages.dev")', { timeout: 15000 }).catch(() => {})
    check('CRM: and it lists under invites not used yet', await g.isVisible('.crm-row:has-text("next.one@audit.beastypages.dev")'))
  } else {
    await shot(g, '11a-crm-phone-list')
    check('CRM: the Affiliates list fits a phone', await fits())
    await g.click('.crm-row:has-text("Phone Tester")')
    await g.waitForSelector('.crm-aff-decide', { timeout: 15000 })
    check('CRM: her page fits a phone', await fits())
    await shot(g, '11b-crm-phone-detail')
  }
  await gctx.close()
}
await b.close()

/* ---- the live set-up: Stripe Connect and DocuSeal not switched on yet ----
   An affiliate sends what they can, BEASTY receives it, and approval waits for the
   signed agreement. Same database, a second server with no test providers. */
srv.kill()
await new Promise((r) => setTimeout(r, 800))
port = await freePort()
LOG = `/tmp/audit-onboarding-off-${port}.log`
srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', openSync(LOG, 'w'), openSync(LOG, 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', OPERATOR_TOKEN: TOKEN, RESEND_API_KEY: '', LEAD_EMAIL: '', AFFILIATE_PROVIDERS: '', AFFILIATE_PAYOUTS: '', STRIPE_SECRET_KEY: '', DOCUSEAL_API_KEY: '', DOCUSEAL_WEBHOOK_SECRET: HOOK },
})
base = `http://localhost:${port}`
up = false
for (let i = 0; i < 240 && !up; i++) { try { up = (await fetch(base + '/api/health')).ok } catch { await new Promise((r) => setTimeout(r, 250)) } }
check('LIVE SET-UP: the server comes up with no payout or signing service', up)
const glenn = person()
await glenn.call('POST', '/api/crm/session', { token: TOKEN })
const liveInv = await glenn.call('POST', '/api/crm/onboarding/invites', { email: 'live.tester@audit.beastypages.dev', name: 'Live Tester' })
const live = await member('Live Tester')
const lr = await live.call('POST', `/api/onboarding/invite/${tokenOf(liveInv.body.link)}/redeem`)
check('LIVE SET-UP: the invite opens an application', lr.status === 201)
check('LIVE SET-UP: payouts and signing say they are not open', lr.body?.steps?.payouts?.available === false && lr.body?.steps?.agreement?.available === false)
check('LIVE SET-UP: Stripe is not reachable yet', (await live.call('POST', '/api/onboarding/me/payouts/link')).status === 503)
const setup = await live.call('GET', '/api/onboarding/setup')
check('LIVE SET-UP: the public setup says payouts are off', setup.status === 200 && setup.body?.payouts === false, setup.text)
const liveEarly = await live.call('POST', '/api/onboarding/me/submit')
check('LIVE SET-UP: an unfinished form still cannot be sent', liveEarly.status === 409 && /your information/.test(liveEarly.body?.error ?? ''), liveEarly.body?.error)
const liveFull = { ...lr.body.profile, legalLast: 'Tester', phone: '(415) 555-0100', line1: '1 Market St', city: 'San Francisco', state: 'CA', zip: '94105', kind: 'individual', promote: ['instagram'] }
check('LIVE SET-UP: the details save', (await live.call('PUT', '/api/onboarding/me/profile', { revision: lr.body.revision, profile: liveFull })).status === 200)
const sent = await live.call('POST', '/api/onboarding/me/submit')
check('LIVE SET-UP: with details done, the application can be sent', sent.status === 200 && sent.body?.status === 'submitted', sent.text.slice(0, 160))
const glist = await glenn.call('GET', '/api/crm/onboarding')
const liveRow = glist.body?.applications?.find((x) => x.email === 'live.tester@audit.beastypages.dev')
check('LIVE SET-UP: Glenn receives it in the CRM, waiting for him', liveRow?.status === 'submitted', JSON.stringify(liveRow))
const gd = await glenn.call('GET', `/api/crm/onboarding/${liveRow?.id}`)
check('LIVE SET-UP: his page knows signing is not open', gd.body?.steps?.agreement?.available === false && gd.body?.countersignAvailable === false && gd.body?.events?.some((e) => e.kind === 'submitted'))
check('LIVE SET-UP: approval still waits for the signed agreement', (await glenn.call('POST', `/api/crm/onboarding/${liveRow?.id}/decision`, { action: 'approve' })).status === 409)

/* The same on a phone: the steps that are not open say so, and Submit opens. */
const ph = await (await chromium.launch()).newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, extraHTTPHeaders: { 'x-forwarded-for': '10.9.3.1' } })
const q = await ph.newPage()
const liveInv2 = await glenn.call('POST', '/api/crm/onboarding/invites', { email: 'phone.live@audit.beastypages.dev', name: 'Phone Live' })
await q.goto(liveInv2.body.link, { waitUntil: 'networkidle' })
/* No Stripe for affiliates (Leon, 2026-10-11): three steps, the forms ride with the agreement. */
const welcome = await q.textContent('.onb-hero')
check('LIVE SET-UP (phone): the welcome counts three steps, with forms and no Get paid', welcome?.includes('Three steps') && welcome?.includes('Forms & agreement') && welcome?.includes('W-9') && !welcome?.includes('Get paid') && !welcome?.includes('Stripe'), welcome?.slice(0, 300))
await q.getByRole('button', { name: 'Get started' }).click()
await q.getByRole('button', { name: 'Email me' }).click()
await q.fill('#j-dest', 'phone.live@audit.beastypages.dev')
await q.getByRole('button', { name: 'Send my code' }).click()
await q.waitForSelector('#j-code')
await q.fill('#j-code', await codeFor('phone.live@audit.beastypages.dev'))
await q.getByRole('button', { name: 'Continue' }).click()
await q.waitForSelector('#s0', { timeout: 15000 }).catch(() => {})
await q.fill('#p-legalLast', 'Live')
await q.fill('#p-phone', '415 555 0142')
await q.fill('#p-line1', '1 Market St')
await q.fill('#p-city', 'San Francisco')
await q.fill('#p-state', 'CA')
await q.fill('#p-zip', '94105')
await q.getByRole('button', { name: 'An individual' }).click()
await q.getByRole('button', { name: 'Instagram', exact: true }).click()
await q.waitForSelector('.onb-save[data-state="saved"]', { timeout: 10000 }).catch(() => {})
await q.getByRole('button', { name: 'Continue' }).click()
await q.waitForSelector('#s2')
const forms = await q.textContent('.onb')
check('LIVE SET-UP (phone): details go straight to the forms, step 2 of 3', forms?.includes('Step 2 of 3') && (await q.textContent('#s2'))?.includes('Your forms and agreement') && (await q.locator('.onb-keys li').count()) === 3, forms?.slice(0, 200))
check('LIVE SET-UP (phone): the packet lists the W-9, direct deposit, ID and agreement', ['Form W-9', 'Direct deposit', 'photo of your', 'affiliate agreement'].every((t) => forms?.includes(t)) && forms?.includes('The forms are being finalized'))
check('LIVE SET-UP (phone): no Stripe anywhere on the way', !forms?.includes('Stripe'))
await shot(q, '12-live-forms')
await q.getByRole('button', { name: 'Continue' }).click()
await q.waitForSelector('#s3')
const review = await q.textContent('.onb-rows')
check('LIVE SET-UP (phone): review lists forms & agreement, no payout setup', review?.includes('Forms & agreement') && !review?.includes('Payout setup'), review)
check('LIVE SET-UP (phone): Submit is open with the details done', await q.getByRole('button', { name: 'Submit application' }).isEnabled())
await shot(q, '13-live-review')
await q.getByRole('button', { name: 'Submit application' }).click()
await q.waitForSelector('.onb-status', { timeout: 15000 })
const dash = await q.textContent('.onb-sheet')
check('LIVE SET-UP (phone): the dashboard says under review and what is still to come', (await q.textContent('.onb-status'))?.includes('Under review') && dash?.includes('Still to do') && dash?.includes('Forms & agreement') && !dash?.includes('Payout setup'))
check('LIVE SET-UP (phone): BEASTY pays by direct deposit, not Stripe', dash?.includes('BEASTY, by direct deposit') && dash?.includes('Tax form (W-9)') && !dash?.includes('Stripe'), dash?.slice(0, 400))
check('LIVE SET-UP (phone): fits the phone', await q.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
await shot(q, '14-live-dashboard')
await ph.browser()?.close()

await db.end()
srv.kill()
await TESTDB.drop?.()
if (fails.length) { console.log(`\nFAIL: ${fails.length} step(s) — ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: affiliates join by invite, finish every step, submit, and Glenn countersigns and approves; with payouts off it is three steps with the W-9, direct deposit and ID in the DocuSeal packet and no Stripe, and with signing not yet switched on they can still send their details and Glenn receives them; nothing sensitive leaves the server.')
