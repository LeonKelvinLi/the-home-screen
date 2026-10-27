/*
  THE DOCUSEAL FORMS LINK (server/onboarding.ts issueFormsLink, server/onboarding-manual.ts formsLink).
  Leon, 2026-10-26: "https://docuseal.com/d/PEgA3FohHQ4VMz also make this built in inside beasty for
  affiliates link so they get this link on their email when they want to sign up and sign all docs".

  Runs a local server in manual signing mode with a local stand-in for Resend, so every email it would
  send (sign-in codes, the forms link, the team's notices) is read here and nothing leaves the machine.
  Stripe webhooks are signed by hand with a local secret; no key, no real money.

    1. Paying the $60 opens the paperwork AND emails the forms link, with their email filled in. Once.
    2. Redeeming one of Glenn's invites emails it too.
    3. /join hands back the same link, without waiting on their details, and says what to do.
    4. "I finished" tells the team; the CRM attaches their DocuSeal submission (checked, once per
       submission) and records the review as before.
    5. The screens: /join at phone size opens their link; the CRM page says where the link went.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { createServer as createHttp } from 'node:http'
import { createHmac, randomBytes } from 'node:crypto'
import { openSync, rmSync, mkdirSync } from 'node:fs'
import pg from 'pg'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const LINK = 'https://docuseal.com/d/PEgA3FohHQ4VMz'
const WHSEC = 'whsec_local_audit_only'
const PRICE = { pass: 'price_audit_pass', diamond: 'price_audit_diamond', recruiter: 'price_audit_recruiter' }
const OPERATOR = `op_${randomBytes(16).toString('hex')}`
const LEAD = 'team@audit.beastypages.dev'

const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })

/* The Resend stand-in: keeps every email the server sends. */
const mail = []
const mailPort = await freePort()
const mailer = createHttp((req, res) => {
  let body = ''
  req.on('data', (c) => { body += c })
  req.on('end', () => {
    try { mail.push(JSON.parse(body)) } catch { /* not JSON: ignore */ }
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ id: `em_${mail.length}` }))
  })
}).listen(mailPort)
const to = (email) => mail.filter((m) => (m.to ?? []).includes(email))

const LOG = '/tmp/beasty-forms-link-audit.log'
try { rmSync(LOG) } catch {}
mkdirSync('.verify', { recursive: true })
const TESTDB = await freshTestDb('formslink')
const port = await freePort()
const base = `http://localhost:${port}`
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: ['ignore', openSync(LOG, 'a'), openSync(LOG, 'a')],
  env: {
    ...process.env,
    PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', PUBLIC_URL: base,
    OPERATOR_TOKEN: OPERATOR, LEAD_EMAIL: LEAD,
    RESEND_API_KEY: 're_audit_local', OTP_FROM_EMAIL: 'BEASTY <codes@audit.beastypages.dev>', RESEND_API_URL: `http://localhost:${mailPort}/emails`,
    AFFILIATE_PROVIDERS: '', AFFILIATE_SIGNING: 'manual', AFFILIATE_PAYOUTS: '', DOCUSEAL_API_KEY: '', DOCUSEAL_AFFILIATE_TEMPLATE_ID: '', DOCUSEAL_MANUAL_TEMPLATE_ID: '', DOCUSEAL_FORMS_LINK: '',
    STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: WHSEC,
    STRIPE_PAYMENT_LINK_PASS: 'https://buy.stripe.com/test_pass', STRIPE_PAYMENT_LINK_DIAMOND: 'https://buy.stripe.com/test_diamond', STRIPE_PAYMENT_LINK_RECRUITER: 'https://buy.stripe.com/test_recruiter',
    STRIPE_PRICE_PASS: PRICE.pass, STRIPE_PRICE_DIAMOND: PRICE.diamond, STRIPE_PRICE_RECRUITER: PRICE.recruiter,
  },
})
for (let i = 0; i < 160; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }
/* DOCUSEAL_FORMS_LINK is set empty above so the built-in default is what gets tested. */
const sql = new pg.Client({ connectionString: TESTDB.url })
await sql.connect()

const fails = []
const ok = (m) => console.log(' ok  ', m)
const bad = (m) => { console.log(' FAIL', m); fails.push(m) }
const check = (m, c) => (c ? ok(m) : bad(m))
let browser
const done = async (code) => { await browser?.close(); await sql.end().catch(() => {}); srv.kill(); mailer.close(); await TESTDB.drop?.(); process.exit(code) }
const pause = (ms) => new Promise((r) => setTimeout(r, ms))

let ipN = 1
function person() {
  const jar = new Map()
  const ip = `10.8.0.${ipN++}`
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
async function signUp(name) {
  const p = person()
  const email = `${name.toLowerCase().replace(/\W/g, '')}-${port}@audit.beastypages.dev`
  await p.call('/api/members/start', { name, email })
  let code
  for (let i = 0; i < 50 && !code; i++) {
    code = to(email).map((m) => /^(\d{6}) is your BEASTY code/.exec(m.subject ?? '')?.[1]).filter(Boolean).pop()
    if (!code) await pause(100)
  }
  const me = await p.call('/api/members/verify', { email, code })
  Object.assign(p, { id: me.body?.id, email, name })
  return p
}
const sign = (payload) => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=${createHmac('sha256', WHSEC).update(`${t}.${payload}`).digest('hex')}` }
const hook = async (type, object) => {
  const payload = JSON.stringify({ id: `evt_${randomBytes(6).toString('hex')}`, object: 'event', type, data: { object } })
  const r = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': sign(payload) }, body: payload })
  await pause(250)
  return r.status
}
const formsMail = (p) => to(p.email).filter((m) => m.subject === 'Sign your BEASTY affiliate forms')
const docOf = async (memberId) =>
  (await sql.query('SELECT d.* FROM onboarding_documents d JOIN onboarding_applications a ON a.id = d.application_id WHERE a.member_id = $1 ORDER BY d.created_at DESC LIMIT 1', [memberId])).rows[0]
const appOf = async (memberId) => (await sql.query('SELECT id FROM onboarding_applications WHERE member_id = $1', [memberId])).rows[0]?.id

/* ---- 1. paying the $60 ---- */
const ana = await signUp('Ana Forms')
check('a member signs in (her code came through the email stand-in)', !!ana.id)
await ana.call('/api/members/recruiter', {})
await hook('checkout.session.completed', { client_reference_id: `rc_${ana.id}`, customer: 'cus_ana_rec' })
const anaLink = `${LINK}?email=${encodeURIComponent(ana.email)}`
let bundle = (await ana.call('/api/onboarding/me')).body
check('paying opens her paperwork with the forms link ready', bundle?.steps?.agreement?.linkReady === true && bundle.steps.agreement.formsLink === true && bundle.steps.agreement.formsLinkOn === true)
let doc = await docOf(ana.id)
check('her packet points at the shared link with her email filled in', doc?.affiliate_url === anaLink && doc.template_version === 'forms_link' && doc.status === 'pending_signature')
const anaApp = await appOf(ana.id)
check('her history says the link was emailed', (await sql.query("SELECT 1 FROM onboarding_events WHERE application_id = $1 AND kind = 'forms_link_sent'", [anaApp])).rowCount === 1)
let fm = formsMail(ana)
check('she is emailed the link, once', fm.length === 1)
check('…the email has her link, says which email to use and where to come back', fm[0]?.text?.includes(anaLink) && /Use this email address/.test(fm[0]?.text ?? '') && fm[0]?.text?.includes(`${base}/join`))
check('…and warns never to email her SSN or bank details', /Never email your Social Security number/.test(fm[0]?.text ?? ''))
await hook('checkout.session.completed', { client_reference_id: `rc_${ana.id}`, customer: 'cus_ana_rec' })
check('a retried payment sends no second email', formsMail(ana).length === 1)

/* ---- 3. /join hands back the same link ---- */
const opened = await ana.call('/api/onboarding/me/agreement/sign', {})
check('opening her forms returns the same link, with her details still empty', opened.status === 200 && opened.body?.url === anaLink && bundle.steps.profile.complete === false)
check('…and sends no extra email', formsMail(ana).length === 1)

/* ---- 2. an invite ---- */
const admin = person()
check('the operator signs into the CRM', (await admin.call('/api/crm/session', { token: OPERATOR })).status === 200)
const bob = await signUp('Bob Invited')
const invite = await admin.call('/api/crm/onboarding/invites', { name: 'Bob Invited', email: bob.email })
const token = invite.body?.link?.split('/join/')[1]
const redeemed = await bob.call(`/api/onboarding/invite/${token}/redeem`, {})
check('an invited affiliate who starts is emailed the forms link too', redeemed.status === 201 && formsMail(bob).length === 1 && formsMail(bob)[0].text.includes(`${LINK}?email=${encodeURIComponent(bob.email)}`))
check('…and their /join says it is ready', redeemed.body?.steps?.agreement?.linkReady === true)

/* ---- 5a. the screens, before anything is checked ---- */
browser = await chromium.launch()
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await phone.addCookies([...bob.jar].map(([name, value]) => ({ name, value, url: base })))
let page = await phone.newPage()
let went = null
await page.route('https://docuseal.com/**', (route) => { went = route.request().url(); return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>DocuSeal stand-in</p>' }) })
await page.goto(`${base}/join`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
/* Bob has not filled in his details yet, so /join opens on them: go to the forms step by its key. */
await page.locator('.onb-keys button[aria-label*="forms" i]').first().click().catch(() => {})
await page.waitForTimeout(800)
let text = await page.locator('body').innerText()
check('/join says which email to use on DocuSeal', /DocuSeal/.test(text) && text.includes(bob.email))
const openBtn = page.getByRole('button', { name: 'Open my forms in DocuSeal' })
check('…with the button open though his details are not finished', (await openBtn.count()) === 1 && (await openBtn.isEnabled()))
await page.screenshot({ path: '.verify/forms-link-join.png' })
await openBtn.click()
await page.waitForTimeout(1200)
check('…and the button takes him to his own link', went === `${LINK}?email=${encodeURIComponent(bob.email)}`)

const desk = await browser.newContext({ viewport: { width: 1280, height: 900 } })
await desk.addCookies([...admin.jar].map(([name, value]) => ({ name, value, url: base })))
page = await desk.newPage()
await page.goto(`${base}/crm#/affiliate/${anaApp}`, { waitUntil: 'domcontentloaded' })
await page.getByText('forms link went to').waitFor({ timeout: 20000 }).catch(() => {})
text = await page.locator('body').innerText()
check('CRM: her page says the forms link went to her and asks for her submission', /BEASTY’s shared DocuSeal forms link went to/.test(text) && text.includes(ana.email) && /Attach their submission/.test(text))
check('CRM: her history shows the email', /Emailed their DocuSeal forms link/.test(text))
await page.locator('.crm-aff-manual').first().screenshot({ path: '.verify/forms-link-crm.png' }).catch(() => {})

/* ---- 4. "I finished", then the CRM ---- */
const review = await ana.call('/api/onboarding/me/agreement/review', {})
check('"I finished" puts her packet in review without marking it signed', review.status === 200 && review.body?.steps?.agreement?.reviewRequested === true && !review.body.steps.agreement.affiliateSigned)
/* The server sends the notice without waiting on it, so give the stand-in a moment to receive it. */
let told = false
for (let i = 0; i < 40 && !told; i++) { told = to(LEAD).some((m) => /ready for review/.test(m.subject ?? '')); if (!told) await new Promise((r) => setTimeout(r, 100)) }
check('…and tells the team', told)
let detail = (await admin.call(`/api/crm/onboarding/${anaApp}`)).body
check('the CRM record knows it was the forms link, and when', detail?.manualPacket?.formsLink === true && typeof detail.manualPacket.formsLinkSentAt === 'number')
const attach = (id, body) => admin.call(`/api/crm/onboarding/${id}/packet/submission`, body)
const rev = detail.manualPacket.revision
check('a member cannot attach a submission', (await ana.call(`/api/crm/onboarding/${anaApp}/packet/submission`, { submissionUrl: 'https://docuseal.com/submissions/111', revision: rev })).status === 401)
check('the shared link itself is refused as a submission', (await attach(anaApp, { submissionUrl: LINK, revision: rev })).status === 400)
check('an address that is not DocuSeal’s is refused', (await attach(anaApp, { submissionUrl: 'https://example.com/submissions/111', revision: rev })).status === 400)
check('a stale revision is refused', (await attach(anaApp, { submissionUrl: 'https://docuseal.com/submissions/111', revision: rev + 5 })).status === 409)
check('her submission attaches', (await attach(anaApp, { submissionUrl: 'https://docuseal.com/submissions/111', revision: rev })).status === 200)
doc = await docOf(ana.id)
check('…kept with her link', doc.submission_url === 'https://docuseal.com/submissions/111' && doc.affiliate_url === anaLink && doc.provider_ref === '111')
const bobApp = await appOf(bob.id)
const bobRev = (await admin.call(`/api/crm/onboarding/${bobApp}`)).body.manualPacket.revision
check('the same submission cannot be attached to someone else', (await attach(bobApp, { submissionUrl: 'https://docuseal.com/submissions/111', revision: bobRev })).status === 409)
detail = (await admin.call(`/api/crm/onboarding/${anaApp}`)).body
const verify = await admin.call(`/api/crm/onboarding/${anaApp}/packet/verify`, { affiliateSigned: true, companySigned: false, taxComplete: true, bankComplete: true, idUploaded: true, auditReviewed: true, revision: detail.manualPacket.revision })
check('the review is recorded as before', verify.status === 200)
bundle = (await ana.call('/api/onboarding/me')).body
check('…and her /join shows her forms as signed', bundle.steps.agreement.affiliateSigned === true)
check('…and she is emailed that they were checked', to(ana.email).some((m) => /forms have been checked/.test(m.subject ?? '')))
detail = (await admin.call(`/api/crm/onboarding/${anaApp}`)).body
check('a checked packet cannot have its submission swapped', (await attach(anaApp, { submissionUrl: 'https://docuseal.com/submissions/222', revision: detail.manualPacket.revision })).status === 409)
check('the CRM countersign button opens her submission', (await admin.call(`/api/crm/onboarding/${anaApp}/countersign`, {})).body?.url === 'https://docuseal.com/submissions/111')

if (fails.length) { console.log(`\nFAIL: ${fails.length} forms-link checks (server log: ${LOG})`); await done(1) }
console.log('\nPASS: paying the $60 or starting from an invite emails the DocuSeal forms link once, /join opens it, and the CRM attaches the signed submission and records the review.')
await done(0)
