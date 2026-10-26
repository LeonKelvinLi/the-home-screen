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
  SCHEDULE_A_FIELDS,
  compactSchedule,
  isShown,
  scheduleChanges,
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
const compactScheduleText = (t: Terms = DEFAULT_TERMS) => Object.values(compactSchedule(t)).map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ')
const hard = (t: Terms) => flagsFor(t).filter((f) => f.severity === 'hard').map((f) => f.rule)
const soft = (t: Terms) => flagsFor(t).filter((f) => f.severity === 'soft').map((f) => f.rule)

/* ---------------------------------------------- the agreed figures, checked */

/* The percentage model, as agreed before 26 October: still the arithmetic for one affiliate's own terms. */
const P = (over: Partial<Terms> = {}): Terms => T({ rewardKind: 'percent', pointsPerUser: 3, pointsPerBusiness: 9, bonusThreshold: 300, ...over })
const d = derive(P())
eq('defaults are the thread’s figures', [DEFAULT_TERMS.initiationFee, DEFAULT_TERMS.monthlyFee, DEFAULT_TERMS.foundationAmount, DEFAULT_TERMS.promoPaidMonths, DEFAULT_TERMS.promoFreeMonths, DEFAULT_TERMS.commissionRate, DEFAULT_TERMS.pointValue, DEFAULT_TERMS.minRedemption, DEFAULT_TERMS.promoDayMultiplier, DEFAULT_TERMS.bonusMultiplier], [99, 39, 9, 3, 9, 10, 1, 100, 3, 2])
/* Glenn, 26 October: set points each month, cash-outs in $50 steps, 96 a city, no saved-points bonus, a $60 recruiter upgrade to discuss. */
const g = derive(DEFAULT_TERMS)
eq('Glenn’s 26 Oct figures', [DEFAULT_TERMS.rewardKind, DEFAULT_TERMS.pointsPerUser, DEFAULT_TERMS.userMonthsBiggie, DEFAULT_TERMS.userMonthsBeasty, DEFAULT_TERMS.pointsPerBusiness, DEFAULT_TERMS.businessMonths, DEFAULT_TERMS.redemptionStep, DEFAULT_TERMS.promoCap, DEFAULT_TERMS.bonusThreshold, DEFAULT_TERMS.payoutFrequency, DEFAULT_TERMS.recruiterFee], ['monthly_points', 10, 2, 3, 10, 6, 50, 96, 0, 'on_request', 60])
eq('a business: 10 points a month for 6 months = $60', g.businessTotal, 60)
eq('a member: $20 on a BIGGIE PASS, $30 on a BEASTY PASS', [g.userTotalBiggie, g.userTotalBeasty], [20, 30])
eq('a FIRST48 business pays 3 months, so its affiliate is credited 3 × $10 before the free months', g.promoCommission, 30)
ok('Schedule A says what a referral earns, in $50 cash-out steps', compactScheduleText().includes('10 points a month for its first 6 paid months ($60.00)') && compactScheduleText().includes('in steps of 50 points'))
ok('the percentage questions are hidden in Glenn’s model', !isShown(FIELDS.find((f) => f.id === 'commissionRate')!, DEFAULT_TERMS) && isShown(FIELDS.find((f) => f.id === 'commissionRate')!, P()))
eq('FIRST48: $99 + 3 × $39 = $216 paid', d.promoYearPaid, 216)
eq('FIRST48: nine free months save $351', d.promoSaving, 351)
eq('FIRST48: $216 ÷ 12 = $18.00 a month', d.promoEffectiveMonthly, 18)
eq('10% of ($39 − $9) = $3.00, Glenn’s 3 points', [d.commissionMonthly, d.userReward], [3, 3])
eq('10% of ($99 − $9) = $9.00, and 9 points', [d.commissionInitiation, d.businessReward], [9, 9])
eq('100 points redeem for $100', d.minRedemptionValue, 100)
eq('saving 300 points and doubling pays 300 more ($300)', [d.bonusPoints, d.bonusValue], [300, 300])
eq('a FIRST48 business earns its affiliate $9 + 3 × $3 = $18', d.promoCommission, 18)

const gross = FIELDS.find((f) => f.id === 'commissionBase')!.preview!(T({ commissionBase: 'full_price' }))
ok('before the $9 the preview reads “10% of $39.00 = $3.90/member/month”', gross === '10% of $39.00 = $3.90/member/month')
ok('the rate preview names both payments', FIELDS.find((f) => f.id === 'commissionRate')!.preview!(P()).includes('10% of $30.00 = $3.00/member/month · 10% of $90.00 = $9.00 per initiation'))
eq('initiation-only $9 leaves the full $39 to share', derive(T({ foundationApplies: 'initiation_only' })).netMonthly, 39)

const fee = AFFILIATE_FEES.lines[0].match(/\$(\d+) initiation/)
ok('the Members-page initiation the model compares against is still the one printed', fee && Number(fee[1]) === PUBLISHED_INITIATION)

/* ------------------------------------------------------------- validation */

const c0 = check(DEFAULT_TERMS)
ok('defaults have no field problems', Object.keys(c0.problems).length === 0)
eq('defaults raise no hard flag', hard(DEFAULT_TERMS), [])
eq('defaults raise no soft flag', soft(DEFAULT_TERMS), [])
ok('6 points against $9.00 of commission is asked about', soft(P({ pointsPerBusiness: 6 })).includes('business_points_vs_commission'))
ok('defaults are publishable', !c0.blocked)
ok('unsettled terms are listed, settled ones are not', c0.unsettled.includes('recruiterFee') && !c0.unsettled.includes('initiationFee') && !c0.unsettled.includes('pointsPerBusiness'))

ok('payout minimum below 100 points is refused', check(T({ minRedemption: 99 })).problems.minRedemption?.includes('100'))
ok('payout minimum of exactly 100 is fine', !check(T({ minRedemption: 100 })).problems.minRedemption)
ok('a rate over 100% is refused', check(P({ commissionRate: 101 })).problems.commissionRate)
ok('half a point is refused', check(T({ pointsPerUser: 2.5 })).problems.pointsPerUser === 'A whole number.')
ok('fractions of a cent are refused', check(T({ monthlyFee: 39.005 })).problems.monthlyFee)
ok('an empty clause is refused', check(T({ clawback: '  ' })).problems.clawback)
ok('a hidden field is not judged', !check(P({ commissionDuration: 'while_active', commissionMonths: 0 })).problems.commissionMonths)
ok('a shown one is', check(P({ commissionDuration: 'first_months', commissionMonths: 0 })).problems.commissionMonths)

ok('shares over 100% of what is left after the $9 are a hard stop', hard(P({ commissionRate: 95, otherShareRate: 10, otherShareLabel: 'Reviewer' })).includes('shares_over_net'))
ok('shares at exactly 100% are allowed', !hard(P({ commissionRate: 60, otherShareRate: 40, otherShareLabel: 'Reviewer', pointsPerUser: 18, pointsPerBusiness: 36 })).includes('shares_over_net'))
ok('a percentage of the full price can still eat past the $9', hard(P({ commissionRate: 80, commissionBase: 'full_price', otherShareRate: 0 })).includes('shares_over_net'))
ok('a $9 larger than the payment is a hard stop', hard(T({ foundationAmount: 45 })).includes('foundation_over_payment'))
ok('points worth more than BEASTY keeps are a hard stop', hard(T({ pointsPerUser: 31 })).includes('user_points_over_net') && hard(T({ pointsPerBusiness: 31 })).includes('business_points_over_net') && hard(P({ pointsPerBusiness: 91 })).includes('business_points_over_net'))
ok('an unnamed other share is a hard stop', hard(T({ otherShareRate: 5 })).includes('other_share_unnamed'))
ok('points that disagree with the commission arithmetic are asked about, not blocked', soft(P({ pointsPerUser: 5 })).includes('user_points_vs_commission') && !check(P({ pointsPerUser: 5 })).blocked)
ok('a promo that is no longer a year is asked about', soft(T({ promoFreeMonths: 6 })).includes('promo_not_a_year'))
ok('cash-out steps that the minimum is not a multiple of are asked about', soft(T({ redemptionStep: 30 })).includes('cashout_step_vs_minimum'))
ok('a bonus goal under the minimum is asked about', soft(T({ bonusThreshold: 50 })).includes('bonus_below_minimum'))
ok('every rule names real fields', RULES.every((r) => r.fields.every((id) => id in DEFAULT_TERMS)))

const six = P({ pointsPerBusiness: 6 })
const flag = flagsFor(six)[0]
const acked = { [flag.rule]: flag.signature }
ok('an accepted soft flag stays accepted', flagsFor(six, acked).length === 0)
ok('…until one of its figures changes', flagsFor(P({ pointsPerBusiness: 7 }), acked).some((f) => f.rule === flag.rule))
ok('a hard flag cannot be accepted away', flagsFor(T({ foundationAmount: 45 }), { foundation_over_payment: 'anything' }).some((f) => f.rule === 'foundation_over_payment'))

/* ------------------------------------------------------- cleaning, overrides */

const cleaned = cleanTerms({ commissionRate: '12%', monthlyFee: '$39.00', commissionBase: 'sideways', promoDays: 'yes', bogus: 1, clawback: 'a\r\n  b' })
eq('typed figures are read, bad choices and unknown keys dropped', [cleaned.commissionRate, cleaned.monthlyFee, cleaned.commissionBase, cleaned.promoDays, 'bogus' in cleaned, cleaned.clawback], [12, 39, 'after_foundation', true, false, 'a\n b'])
const over = cleanOverrides({ pointsPerBusiness: 12, pointsPerUser: 10, foundationAmount: 5, specialTerms: 'Paid weekly in launch month.' }, DEFAULT_TERMS)
eq('overrides keep per-affiliate changes only, and only real changes', over, { pointsPerBusiness: 12, specialTerms: 'Paid weekly in launch month.' })
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
for (const needle of ['$99.00', '$39.00', '$9.00', '10 points / month', '6 paid months = $60.00', '2 months = $20.00', '3 months = $30.00', '100 points', 'steps of 50 points', 'first 96', 'FIRST48', '$216.00', '$18.00', '$351.00', '3x', '$60.00', 'pause or cancel', code]) ok(`the schedule text prints ${needle}`, text.includes(needle))
ok('an affiliate’s changed figures are starred and explained', scheduleText(eff, { version: 'v1', code: 'X', overrides: over }).includes('12 points / month *') && scheduleText(eff, { version: 'v1', code: 'X', overrides: over }).includes('Agreed for this Affiliate'))
ok('special terms print as their own section', schedule(eff, over).at(-1)!.text === 'Paid weekly in launch month.')
const af = agreementFields(DEFAULT_TERMS)
eq('the review agreement’s six reward fields are filled', Object.keys(af).sort(), ['Business reward', 'Minimum payout', 'Payout schedule', 'Point value', 'Reward basis', 'User reward'])
ok('…with the figures', af['User reward'] === '10 points ($10.00)' && af['Reward basis'].startsWith('10 points a month per business for 6 paid months') && af['Minimum payout'] === '100 points ($100.00)')
const cs = compactSchedule(DEFAULT_TERMS)
eq('the printed fee table is five rows', cs.fees.map((f) => [f.label, f.amount]), [['Initiation fee', '$99.00'], ['Membership fee', '$39.00'], ['Foundation contribution', '$9.00'], ['Recruiter upgrade', '$60.00'], ['FIRST48 offer', '$216.00']])
ok('commission is one sentence with both worked figures', cs.commission.startsWith('For each referred business the Affiliate is credited 10 points a month for its first 6 paid months ($60.00); for each referred member, 10 points a month for 2 months on a BIGGIE PASS ($20.00) or 3 on a BEASTY PASS ($30.00)'))
ok('the percentage sentence is still there for an affiliate on it', compactSchedule(P()).commission.startsWith('The Affiliate earns 10% of what BEASTY keeps after the Foundation contribution: $3.00 per member per month and $9.00 per initiation'))
ok('BARK is one sentence', cs.bark === '1 point = $1.00. Cash out any time from 100 points, in steps of 50 points; points may be saved as long as the Affiliate likes.')
ok('promotion days are the fine print, and the dropped bonus is gone', cs.barkFine.includes('up to 3x') && !cs.barkFine.includes('saves'))
ok('the bonus still prints if it is turned back on', compactSchedule(P()).barkFine.includes('receives 300 points more, once'))
eq('DocuSeal gets two fields only', Object.values(SCHEDULE_A_FIELDS), ['Schedule A Changes', 'Schedule A Initials'])
eq('the standard schedule has no changes', scheduleChanges(DEFAULT_TERMS, {}), 'None')
eq('an affiliate’s changes are written out with their code', scheduleChanges(DEFAULT_TERMS, over), `Points per business: 12 points (standard 10 points); Paid weekly in launch month. Code ${termsCode(eff)}.`)
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
for (const needle of ['$99.00', '$39.00', '$9.00', '10 points a month', '$60.00', '$20.00', '$30.00', 'steps of 50 points', 'Recruiter upgrade', 'FIRST48 offer', '$216.00', `Code ${code}`, 'Not yet agreed with Glenn']) ok(`the PDF prints ${needle}`, parsed.out.includes(needle))
ok('the standard schedule is one page', (await PDFDocument.load(await schedulePdf(DEFAULT_TERMS, { heading: 'Standard terms', subheading: 'Audit', code, fields: 'empty' }))).getPageCount() === 1)
const longPdf = await schedulePdf(T({ qualifying: 'Long clause. '.repeat(400).trim() }), { heading: 'Overflow', subheading: 'Audit', code: 'X' })
ok('a long clause runs onto further pages instead of off the page', (await PDFDocument.load(longPdf)).getPageCount() > 1)

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
  ok('…with no question left open', s.check.flags.length === 0 && !s.check.blocked)

  let r = await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 0, changes: { commissionRate: 12 }, channel: 'tap' })
  ok('an answer saves', r.status === 200 && r.data.draft.terms.commissionRate === 12 && r.data.draft.revision === 1)
  ok('a stale revision gets the latest back instead of overwriting it', (r = await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 0, changes: { commissionRate: 15 } })).status === 409 && r.data.draft.terms.commissionRate === 12)
  ok('an unknown term is refused', (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 1, changes: { bonusForLeon: 1 } })).status === 400)
  ok('a figure of the wrong type is refused', (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 1, changes: { commissionBase: 'sideways' } })).status === 400)
  s = (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: 1, changes: { commissionRate: 10, pointsPerUser: 40 } })).data
  ok('a contradiction is saved but blocks publishing', s.check.blocked && s.check.flags.some((f: any) => f.rule === 'user_points_over_net'))
  ok('publishing a blocked schedule is refused', (await admin.call('POST', '/api/crm/affiliate-terms/publish', { revision: s.draft.revision })).status === 409)
  ok('the draft PDF still opens, marked not final', (r = await admin.call('GET', '/api/crm/affiliate-terms/schedule.pdf')).status === 200 && r.type === 'application/pdf' && (await pdfText(r.buf)).out.includes('NOT FINAL'))
  s = (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: s.draft.revision, changes: { rewardKind: 'percent', pointsPerUser: 3, pointsPerBusiness: 6 }, channel: 'talk' })).data
  ok('a hard check cannot be accepted', (await admin.call('POST', '/api/crm/affiliate-terms/acknowledge', { rule: 'shares_over_net' })).status === 409)
  s = (await admin.call('POST', '/api/crm/affiliate-terms/acknowledge', { rule: 'business_points_vs_commission' })).data
  ok('a soft check accepted at review stays accepted', s.check.flags.length === 0)
  s = (await admin.call('PUT', '/api/crm/affiliate-terms/draft', { revision: s.draft.revision, changes: { rewardKind: 'monthly_points', pointsPerUser: 10, pointsPerBusiness: 10 } })).data
  r = await admin.call('POST', '/api/crm/affiliate-terms/publish', { revision: s.draft.revision, note: 'Audit' })
  ok('a clean schedule publishes as version 1', r.status === 200 && r.data.published.number === 1 && !r.data.unpublishedChanges && r.data.published.code === termsCode(DEFAULT_TERMS))
  ok('publishing the same figures twice is refused', (await admin.call('POST', '/api/crm/affiliate-terms/publish', { revision: r.data.draft.revision })).status === 409)
  ok('version 1 prints as a PDF', (r = await admin.call('GET', '/api/crm/affiliate-terms/schedule.pdf?version=1')).status === 200 && (await pdfText(r.buf)).out.includes('Standard terms, version 1'))
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
  r = await admin.call('PUT', path, { overrides: { pointsPerBusiness: 12, pointsPerUser: 3.6, specialTerms: 'First month paid weekly.' } })
  ok('…and a half-point override is refused', r.status === 400)
  r = await admin.call('PUT', path, { overrides: { pointsPerBusiness: 12, minRedemption: 150, specialTerms: 'First month paid weekly.' } })
  ok('an affiliate’s own figures save', r.status === 200 && r.data.terms.pointsPerBusiness === 12 && r.data.terms.minRedemption === 150 && r.data.version === 'standard v1 with 3 changes')
  ok('their code differs from the standard', r.data.code !== r.data.standard.code)
  ok('their schedule text names them', r.data.text.includes('Affiliate: Terms QA'))
  ok('…and stars them', r.data.text.includes('12 points / month *') && r.data.text.includes('150 points *') && r.data.text.includes('First month paid weekly.'))
  ok('their DocuSeal changes line follows their figures', r.data.docusealFields['Schedule A Changes'].startsWith('Points per business: 12 points (standard 10 points)') && r.data.docusealFields['Schedule A Changes'].includes(r.data.code))
  ok('the change is in their history', (await admin.call('GET', `/api/crm/onboarding/${appId}`)).data.events.some((e: any) => e.kind === 'terms_changed'))
  ok('their Schedule A prints their figures and their changes', (r = await admin.call('GET', `/api/crm/onboarding/${appId}/schedule.pdf`)).status === 200 && (await pdfText(r.buf)).out.includes('12 points a month') && (await pdfText(r.buf)).out.includes('(standard 10 points)'))
  r = await admin.call('PUT', path, { overrides: {} })
  ok('clearing overrides puts them back on the standard', r.status === 200 && r.data.code === r.data.standard.code)
} finally {
  try { process.kill(-server.pid!, 'SIGTERM') } catch { /* gone */ }
  await new Promise((r) => setTimeout(r, 300))
  await testdb.drop?.()
}
console.log(`\n${count} checks passed.`)
