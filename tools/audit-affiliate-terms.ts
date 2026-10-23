/*
  Schedule A — the affiliate money terms (shared/affiliate-terms.ts,
  server/affiliate-terms.ts, src/crm/affiliate-terms.tsx).

    node --import tsx tools/audit-affiliate-terms.ts            model, PDF and API
    node --import tsx tools/audit-affiliate-terms.ts --model    model and PDF only

  The model half needs nothing. The API half starts the server on a fresh
  Postgres database (tools/pgtest.mjs, the local beasty-pg) with synthetic
  people only, and makes no DocuSeal call: nothing is sent to anyone.
*/
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync, readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { PDFDocument, PDFArray, PDFRawStream, decodePDFRawStream, PDFName } from 'pdf-lib'
import {
  CHAPTERS,
  DEFAULT_TERMS,
  FIELDS,
  PER_AFFILIATE,
  PUBLISHED_INITIATION,
  RULES,
  agreementFields,
  DOCUSEAL_FIELDS,
  docusealValues,
  check,
  cleanOverrides,
  cleanTerms,
  derive,
  effectiveTerms,
  flagsFor,
  schedule,
  scheduleText,
  termsCode,
  type Terms,
} from '../shared/affiliate-terms'
import { schedulePdf, winAnsi } from '../server/affiliate-terms-pdf'
import { AFFILIATE_FEES } from '../src/data/affiliateTiers'

let count = 0
const ok = (name: string, value: unknown) => {
  assert.ok(value, name)
  count++
  console.log('PASS:', name)
}
const eq = (name: string, actual: unknown, expected: unknown) => {
  assert.deepEqual(actual, expected, `${name}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
  count++
  console.log('PASS:', name)
}
const T = (over: Partial<Terms> = {}): Terms => ({ ...DEFAULT_TERMS, ...over })
const hard = (t: Terms) => flagsFor(t).filter((f) => f.severity === 'hard').map((f) => f.rule)
const soft = (t: Terms) => flagsFor(t).filter((f) => f.severity === 'soft').map((f) => f.rule)

/* ---------------------------------------------- the agreed figures, checked */

const d = derive(DEFAULT_TERMS)
eq('defaults are the thread’s figures', [DEFAULT_TERMS.initiationFee, DEFAULT_TERMS.monthlyFee, DEFAULT_TERMS.foundationAmount, DEFAULT_TERMS.promoPaidMonths, DEFAULT_TERMS.promoFreeMonths, DEFAULT_TERMS.commissionRate, DEFAULT_TERMS.pointsPerUser, DEFAULT_TERMS.pointsPerBusiness, DEFAULT_TERMS.pointValue, DEFAULT_TERMS.minRedemption, DEFAULT_TERMS.promoDayMultiplier, DEFAULT_TERMS.bonusThreshold, DEFAULT_TERMS.bonusMultiplier], [69, 39, 9, 3, 9, 10, 3, 6, 1, 100, 3, 300, 2])
eq('FIRST48: $69 + 3 × $39 = $186 paid', d.promoYearPaid, 186)
eq('FIRST48: nine free months save $351', d.promoSaving, 351)
eq('FIRST48: $186 ÷ 12 = $15.50 a month', d.promoEffectiveMonthly, 15.5)
eq('10% of ($39 − $9) = $3.00, Glenn’s 3 points', [d.commissionMonthly, d.userReward], [3, 3])
eq('10% of ($69 − $9) = $6.00, Glenn’s 6 points', [d.commissionInitiation, d.businessReward], [6, 6])
eq('100 points redeem for $100', d.minRedemptionValue, 100)
eq('saving 300 points and doubling pays 300 more ($300)', [d.bonusPoints, d.bonusValue], [300, 300])
eq('a FIRST48 business earns its affiliate $6 + 3 × $3 = $15', d.promoCommission, 15)

const gross = FIELDS.find((f) => f.id === 'commissionBase')!.preview!(T({ commissionBase: 'full_price' }))
ok('before the $9 the preview reads “10% of $39.00 = $3.90/member/month”', gross === '10% of $39.00 = $3.90/member/month')
ok('the rate preview names both payments', FIELDS.find((f) => f.id === 'commissionRate')!.preview!(DEFAULT_TERMS).includes('10% of $30.00 = $3.00/member/month · 10% of $60.00 = $6.00 per initiation'))
eq('initiation-only $9 leaves the full $39 to share', derive(T({ foundationApplies: 'initiation_only' })).netMonthly, 39)

const fee = AFFILIATE_FEES.lines[0].match(/\$(\d+) initiation/)
ok('the Members-page initiation the model compares against is still the one printed', fee && Number(fee[1]) === PUBLISHED_INITIATION)

/* ------------------------------------------------------------- validation */

const c0 = check(DEFAULT_TERMS)
ok('defaults have no field problems', Object.keys(c0.problems).length === 0)
eq('defaults raise no hard flag', hard(DEFAULT_TERMS), [])
eq('defaults raise exactly one soft flag: $69 against the Members page’s $99', soft(DEFAULT_TERMS), ['initiation_vs_members_page'])
ok('defaults are publishable', !c0.blocked)
ok('unsettled terms are listed, settled ones are not', c0.unsettled.includes('commissionDuration') && c0.unsettled.includes('initiationFee') && !c0.unsettled.includes('commissionRate'))

ok('payout minimum below 100 points is refused', check(T({ minRedemption: 99 })).problems.minRedemption?.includes('100'))
ok('payout minimum of exactly 100 is fine', !check(T({ minRedemption: 100 })).problems.minRedemption)
ok('a rate over 100% is refused', check(T({ commissionRate: 101 })).problems.commissionRate)
ok('half a point is refused', check(T({ pointsPerUser: 2.5 })).problems.pointsPerUser === 'A whole number.')
ok('fractions of a cent are refused', check(T({ monthlyFee: 39.005 })).problems.monthlyFee)
ok('an empty clause is refused', check(T({ clawback: '  ' })).problems.clawback)
ok('a hidden field is not judged', !check(T({ commissionDuration: 'while_active', commissionMonths: 0 })).problems.commissionMonths)
ok('a shown one is', check(T({ commissionDuration: 'first_months', commissionMonths: 0 })).problems.commissionMonths)

ok('shares over 100% of what is left after the $9 are a hard stop', hard(T({ commissionRate: 95, otherShareRate: 10, otherShareLabel: 'Reviewer' })).includes('shares_over_net'))
ok('shares at exactly 100% are allowed', !hard(T({ commissionRate: 60, otherShareRate: 40, otherShareLabel: 'Reviewer', pointsPerUser: 18, pointsPerBusiness: 36 })).includes('shares_over_net'))
ok('a percentage of the full price can still eat past the $9', hard(T({ commissionRate: 80, commissionBase: 'full_price', otherShareRate: 0 })).includes('shares_over_net'))
ok('a $9 larger than the payment is a hard stop', hard(T({ foundationAmount: 45 })).includes('foundation_over_payment'))
ok('points worth more than BEASTY keeps are a hard stop', hard(T({ pointsPerUser: 31 })).includes('user_points_over_net') && hard(T({ pointsPerBusiness: 61 })).includes('business_points_over_net'))
ok('an unnamed other share is a hard stop', hard(T({ otherShareRate: 5 })).includes('other_share_unnamed'))
ok('points that disagree with the commission arithmetic are asked about, not blocked', soft(T({ pointsPerUser: 5 })).includes('user_points_vs_commission') && !check(T({ pointsPerUser: 5 })).blocked)
ok('a promo that is no longer a year is asked about', soft(T({ promoFreeMonths: 6 })).includes('promo_not_a_year'))
ok('a bonus goal under the minimum is asked about', soft(T({ bonusThreshold: 50 })).includes('bonus_below_minimum'))
ok('every rule names real fields', RULES.every((r) => r.fields.every((id) => id in DEFAULT_TERMS)))

const flag = flagsFor(DEFAULT_TERMS)[0]
const acked = { [flag.rule]: flag.signature }
ok('an accepted soft flag stays accepted', flagsFor(DEFAULT_TERMS, acked).length === 0)
ok('…until one of its figures changes', flagsFor(T({ initiationFee: 79 }), acked).some((f) => f.rule === flag.rule))
ok('a hard flag cannot be accepted away', flagsFor(T({ foundationAmount: 45 }), { foundation_over_payment: 'anything' }).some((f) => f.rule === 'foundation_over_payment'))

/* ------------------------------------------------------- cleaning, overrides */

const cleaned = cleanTerms({ commissionRate: '12%', monthlyFee: '$39.00', commissionBase: 'sideways', promoDays: 'yes', bogus: 1, clawback: 'a\r\n  b' })
eq('typed figures are read, bad choices and unknown keys dropped', [cleaned.commissionRate, cleaned.monthlyFee, cleaned.commissionBase, cleaned.promoDays, 'bogus' in cleaned, cleaned.clawback], [12, 39, 'after_foundation', true, false, 'a\n b'])
const over = cleanOverrides({ commissionRate: 12, pointsPerUser: 3, foundationAmount: 5, specialTerms: 'Paid weekly in launch month.' }, DEFAULT_TERMS)
eq('overrides keep per-affiliate changes only, and only real changes', over, { commissionRate: 12, specialTerms: 'Paid weekly in launch month.' })
ok('foundation, fees and promo are the same for everyone', !PER_AFFILIATE.some((f) => ['foundationAmount', 'monthlyFee', 'initiationFee', 'promoCode', 'pointValue'].includes(f.id)))
const eff = effectiveTerms(DEFAULT_TERMS, over)
ok('an affiliate’s override is checked by the same rules', check(effectiveTerms(DEFAULT_TERMS, cleanOverrides({ pointsPerUser: 40 }, DEFAULT_TERMS))).blocked)

/* -------------------------------------------------------------- the code */

ok('the code is stable', termsCode(DEFAULT_TERMS) === termsCode({ ...DEFAULT_TERMS }))
ok('the code changes with any figure', termsCode(DEFAULT_TERMS) !== termsCode(T({ pointsPerUser: 4 })) && termsCode(DEFAULT_TERMS) !== termsCode(eff))

/* -------------------------------------------------------- the interview */

ok('every chapter but review has questions', CHAPTERS.filter((c) => c.id !== 'review').every((c) => FIELDS.some((f) => f.chapter === c.id)))
ok('every question belongs to a chapter', FIELDS.every((f) => CHAPTERS.some((c) => c.id === f.chapter)))
ok('every question explains itself and says where its default came from', FIELDS.every((f) => f.explain && (f.source || f.id === 'otherShareLabel')))
ok('figures are tapped, never dictated', FIELDS.filter((f) => ['money', 'percent', 'count', 'points'].includes(f.kind)).every((f) => f.lane === 'tap'))
ok('clauses are talked through', FIELDS.filter((f) => f.kind === 'longtext').every((f) => f.lane === 'talk'))
ok('every talked-through question carries an example', FIELDS.filter((f) => f.lane === 'talk').every((f) => f.example))
ok('every number field has a range', FIELDS.filter((f) => ['money', 'percent', 'count', 'points', 'multiplier'].includes(f.kind)).every((f) => f.min !== undefined && f.max !== undefined))

/* -------------------------------------------------- what prints, and where */

const code = termsCode(DEFAULT_TERMS)
const text = scheduleText(DEFAULT_TERMS, { version: 'standard v1', code })
for (const needle of ['$69.00', '$39.00', '$9.00', '10%', '3 points', '6 points', '100 points', 'FIRST48', '$186.00', '$15.50', '$351.00', '3x', code]) ok(`the schedule text prints ${needle}`, text.includes(needle))
ok('an affiliate’s changed figures are starred and explained', scheduleText(eff, { version: 'v1', code: 'X', overrides: over }).includes('12% *') && scheduleText(eff, { version: 'v1', code: 'X', overrides: over }).includes('Agreed for this Affiliate'))
ok('special terms print as their own section', schedule(eff, over).at(-1)!.text === 'Paid weekly in launch month.')
const af = agreementFields(DEFAULT_TERMS)
eq('the review agreement’s six reward fields are filled', Object.keys(af).sort(), ['Business reward', 'Minimum payout', 'Payout schedule', 'Point value', 'Reward basis', 'User reward'])
ok('…with the figures', af['User reward'] === '3 points ($3.00)' && af['Minimum payout'] === '100 points ($100.00)')
const ds = docusealValues(DEFAULT_TERMS)
ok('the DocuSeal Schedule A fields have unique names', new Set(DOCUSEAL_FIELDS.map((f) => f.name)).size === DOCUSEAL_FIELDS.length)
ok('…and carry the figures', ds['Commission Per Member'] === '$3.00 (10% of $30.00)' && ds['Points Per User'] === '3 points ($3.00)' && ds['Minimum Redemption'] === '100 points ($100.00)' && ds['Schedule A Code'] === code && ds['Promo Offer'].includes('$186.00'))
ok('an affiliate’s override reaches their DocuSeal values', docusealValues(eff)['Commission Rate'].startsWith('12%') && docusealValues(eff)['Special Terms'] === 'Paid weekly in launch month.')
ok('the PDF encoding keeps the schedule’s punctuation', winAnsi('’ “ ” — × ÷ · •') === '’ “ ” — × ÷ · •' && winAnsi('−$1 → ≤') === '-$1 -> <=')

async function pdfText(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes)
  let out = ''
  for (const page of doc.getPages()) {
    const contents = page.node.get(PDFName.of('Contents'))
    const refs = contents instanceof PDFArray ? contents.asArray() : [contents]
    for (const ref of refs) {
      const stream = doc.context.lookup(ref)
      if (!(stream instanceof PDFRawStream)) continue
      const raw = Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1')
      for (const m of raw.matchAll(/<([0-9A-Fa-f]*)> Tj/g)) out += Buffer.from(m[1], 'hex').toString('latin1') + '\n'
    }
  }
  return { doc, out }
}

const pdf = await schedulePdf(DEFAULT_TERMS, { heading: 'Standard schedule, version 1', subheading: 'Audit', code, openQuestions: ['How long commission lasts: not discussed.'] })
const parsed = await pdfText(pdf)
ok('the PDF opens', parsed.doc.getPageCount() >= 1 && Buffer.from(pdf.slice(0, 5)).toString() === '%PDF-')
for (const needle of ['$69.00', '$39.00 / month', '$9.00', '10%', '$3.00', '$6.00', '100 points', 'FIRST48', '$186.00', '$15.50', `Code ${code}`, 'Not agreed with Glenn yet']) ok(`the PDF prints ${needle}`, parsed.out.includes(needle))
const longPdf = await schedulePdf(T({ specialTerms: 'Long clause. '.repeat(400).trim() }), { heading: 'Overflow', subheading: 'Audit', code: 'X' })
ok('a long clause runs onto further pages instead of off the page', (await PDFDocument.load(longPdf)).getPageCount() > 2)

/* ---------------------------------------------------------------- API ---- */

if (process.argv.includes('--model')) {
  console.log(`\n${count} checks passed (model and PDF only).`)
  process.exit(0)
}

const { freshTestDb } = await import('./pgtest.mjs')
const testdb = await freshTestDb('affiliate_terms')
const listener = createServer()
await new Promise<void>((r) => listener.listen(0, '127.0.0.1', r))
const port = (listener.address() as { port: number }).port
await new Promise<void>((r) => listener.close(() => r()))
mkdirSync('.verify', { recursive: true })
const log = `.verify/terms-${port}.log`
const operator = `op_${randomBytes(16).toString('hex')}`
const server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  detached: true,
  stdio: ['ignore', openSync(log, 'w'), openSync(log, 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: testdb.url, NODE_ENV: 'development', OPERATOR_TOKEN: operator, RESEND_API_KEY: '', LEAD_EMAIL: '', AFFILIATE_PROVIDERS: '', AFFILIATE_SIGNING: 'manual', AFFILIATE_PAYOUTS: '', DOCUSEAL_API_KEY: '', DOCUSEAL_AFFILIATE_TEMPLATE_ID: '', DOCUSEAL_MANUAL_TEMPLATE_ID: '7777777', CRM_MEMBER_SIGNIN: '1' },
})
const base = `http://localhost:${port}`
let ipN = 40
function person() {
  const cookies = new Map<string, string>()
  const ip = `10.9.0.${ipN++}`
  return {
    async call(method: string, path: string, body?: unknown) {
      const r = await fetch(base + path, {
        method,
        redirect: 'manual',
        headers: { 'x-forwarded-for': ip, cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '), ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      for (const raw of r.headers.getSetCookie()) {
        const [pair] = raw.split(';')
        const i = pair.indexOf('=')
        cookies.set(pair.slice(0, i), pair.slice(i + 1))
      }
      const buf = Buffer.from(await r.arrayBuffer())
      let data: any
      try { data = JSON.parse(buf.toString()) } catch { /* a PDF */ }
      return { status: r.status, data, buf, type: r.headers.get('content-type') ?? '' }
    },
  }
}
async function signIn(p: ReturnType<typeof person>, email: string, name: string) {
  await p.call('POST', '/api/members/start', { email, name })
  let code: string | undefined
  for (let i = 0; i < 40 && !code; i++) {
    code = readFileSync(log, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
    if (!code) await new Promise((r) => setTimeout(r, 100))
  }
  return (await p.call('POST', '/api/members/verify', { email, code })).status < 300
}

try {
  let ready = false
  for (let i = 0; i < 160 && !ready; i++) {
    try { ready = (await fetch(base + '/api/health')).ok } catch { /* starting */ }
    if (!ready) await new Promise((r) => setTimeout(r, 200))
  }
  ok('server starts', ready)
  const anon = person(), admin = person(), member = person()
  ok('the terms are not public', (await anon.call('GET', '/api/crm/affiliate-terms')).status === 401)
  ok('operator signs into the CRM', (await admin.call('POST', '/api/crm/session', { token: operator })).status === 200)

  let s = (await admin.call('GET', '/api/crm/affiliate-terms')).data
  ok('a fresh database starts from the thread’s defaults, unpublished', s.draft.revision === 0 && s.draft.terms.commissionRate === 10 && s.published === null && s.unpublishedChanges)
  ok('…with its one soft question', s.check.flags.length === 1 && !s.check.blocked)

  let r = await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 0, changes: { commissionRate: 12 }, channel: 'tap' })
  ok('an answer saves', r.status === 200 && r.data.draft.terms.commissionRate === 12 && r.data.draft.revision === 1)
  ok('a stale revision gets the latest back instead of overwriting it', (r = await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 0, changes: { commissionRate: 15 } })).status === 409 && r.data.draft.terms.commissionRate === 12)
  ok('an unknown term is refused', (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 1, changes: { bonusForLeon: 1 } })).status === 400)
  ok('a figure of the wrong type is refused', (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 1, changes: { commissionBase: 'sideways' } })).status === 400)
  s = (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 1, changes: { commissionRate: 10, pointsPerUser: 40 } })).data
  ok('a contradiction is saved but blocks publishing', s.check.blocked && s.check.flags.some((f: any) => f.rule === 'user_points_over_net'))
  ok('publishing a blocked schedule is refused', (await admin.call('POST', '/api/crm/affiliate-terms/publish', { revision: s.draft.revision })).status === 409)
  ok('the draft PDF still opens, marked not final', (r = await admin.call('GET', '/api/crm/affiliate-terms/schedule.pdf')).status === 200 && r.type === 'application/pdf' && (await pdfText(r.buf)).out.includes('NOT FINAL'))
  s = (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: s.draft.revision, changes: { pointsPerUser: 3 }, channel: 'talk' })).data
  ok('a hard check cannot be accepted', (await admin.call('POST', '/api/crm/affiliate-terms/acknowledge', { rule: 'shares_over_net' })).status === 409)
  s = (await admin.call('POST', '/api/crm/affiliate-terms/acknowledge', { rule: 'initiation_vs_members_page' })).data
  ok('a soft check accepted at review stays accepted', s.check.flags.length === 0)
  r = await admin.call('POST', '/api/crm/affiliate-terms/publish', { revision: s.draft.revision, note: 'Audit' })
  ok('a clean schedule publishes as version 1', r.status === 200 && r.data.published.number === 1 && !r.data.unpublishedChanges && r.data.published.code === termsCode(DEFAULT_TERMS))
  ok('publishing the same figures twice is refused', (await admin.call('POST', '/api/crm/affiliate-terms/publish', { revision: r.data.draft.revision })).status === 409)
  ok('version 1 prints as a PDF', (r = await admin.call('GET', '/api/crm/affiliate-terms/schedule.pdf?version=1')).status === 200 && (await pdfText(r.buf)).out.includes('Standard schedule, version 1'))
  const hist = (await admin.call('GET', '/api/crm/affiliate-terms/history')).data.events
  ok('every change is on the record with old and new values and its channel', hist.some((e: any) => e.field === 'commissionRate' && e.old_value === 10 && e.new_value === 12) && hist.some((e: any) => e.field === 'pointsPerUser' && e.channel === 'talk') && hist.some((e: any) => e.field === 'published'))

  /* One affiliate. */
  const email = `terms-${port}@example.invalid`
  const invite = await admin.call('POST', '/api/crm/onboarding/invites', { name: 'Terms QA', email })
  ok('signs in a synthetic applicant', await signIn(member, email, 'Terms QA'))
  const redeemed = await member.call('POST', `/api/onboarding/invite/${invite.data.link.split('/join/')[1]}/redeem`)
  const appId = redeemed.data.id
  await member.call('PUT', '/api/onboarding/me/profile', { revision: redeemed.data.revision, profile: { legalFirst: 'Terms', legalLast: 'QA', email, phone: '5105550142', line1: '100 Example St', city: 'Oakland', state: 'CA', zip: '94612', kind: 'individual', promote: ['instagram'] } })
  const path = `/api/crm/onboarding/${appId}/terms`
  ok('an applicant cannot read the terms admin', (await member.call('GET', path)).status === 401)
  r = await admin.call('GET', path)
  ok('a new affiliate is on the standard schedule', r.status === 200 && r.data.standard.number === 1 && Object.keys(r.data.overrides).length === 0 && r.data.code === r.data.standard.code)
  ok('a standard-only term cannot be changed for one affiliate', (await admin.call('PUT', path, { overrides: { foundationAmount: 5 } })).status === 400)
  ok('a contradictory override is refused', (await admin.call('PUT', path, { overrides: { pointsPerUser: 40 } })).status === 400)
  r = await admin.call('PUT', path, { overrides: { commissionRate: 12, pointsPerUser: 3.6, specialTerms: 'First month paid weekly.' } })
  ok('…and a half-point override is refused', r.status === 400)
  r = await admin.call('PUT', path, { overrides: { commissionRate: 12, minRedemption: 150, specialTerms: 'First month paid weekly.' } })
  ok('an affiliate’s own figures save', r.status === 200 && r.data.terms.commissionRate === 12 && r.data.terms.minRedemption === 150 && r.data.version === 'standard v1 with 3 changes')
  ok('their code differs from the standard', r.data.code !== r.data.standard.code)
  ok('their schedule text names them', r.data.text.includes('Affiliate: Terms QA'))
  ok('…and stars them', r.data.text.includes('12% *') && r.data.text.includes('150 points *') && r.data.text.includes('First month paid weekly.'))
  ok('their DocuSeal values follow their figures', r.data.docusealFields['Commission Rate'].startsWith('12%') && r.data.docusealFields['Schedule A Code'] === r.data.code)
  ok('the change is in their history', (await admin.call('GET', `/api/crm/onboarding/${appId}`)).data.events.some((e: any) => e.kind === 'terms_changed'))
  ok('their Schedule A prints', (r = await admin.call('GET', `/api/crm/onboarding/${appId}/schedule.pdf`)).status === 200 && (await pdfText(r.buf)).out.includes('12% *'))
  r = await admin.call('PUT', path, { overrides: {} })
  ok('clearing overrides puts them back on the standard', r.status === 200 && r.data.code === r.data.standard.code)
} finally {
  try { process.kill(-server.pid!, 'SIGTERM') } catch { /* gone */ }
  await new Promise((r) => setTimeout(r, 300))
  await testdb.drop?.()
}
console.log(`\n${count} checks passed.`)
