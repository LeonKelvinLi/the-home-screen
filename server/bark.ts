/*
  BARK POINTS: WHAT A RECRUITER EARNS, AND CASHING IT OUT.

  Leon, 2026-10-26: "paying the $60 opens the /join paperwork, points credit monthly while recruiting
  is active, and cash-outs only after Glenn approves the packet." The rules are Schedule A's
  (shared/affiliate-terms.ts), read from the affiliate's own terms when they have an application:

    a referral counts     only if it was made while its referrer was recruiting (active, not paused
                          and not before they paid). A member's referral is made when they open their
                          account with the code; a business's when it asks for a spot through the link.
    a month is credited   when it is paid, and only then. A member's month is a Stripe invoice for their
                          pass (invoice.paid, with money in it); a business's month is recorded by the
                          team in the CRM, because businesses pay BEASTY outside Stripe.
    how many months       userMonthsBiggie (BIGGIE PASS) or userMonthsBeasty (BEASTY PASS) for a member,
                          businessMonths for a business; pointsPerUser / pointsPerBusiness each month.
    after a pause         months still owed on earlier referrals keep being credited.
    after cancelling      nothing more is credited.
    a refund or dispute   within 60 days removes that month's points. Taken from points already paid
                          out, it comes off the next cash-out: the balance shown never goes below zero.
    cashing out           from minRedemption points in steps of redemptionStep, one request at a time,
                          and only once their packet is approved. The team pays it by direct deposit
                          and marks it paid in the CRM.

  Nothing here moves money. A cash-out is a request the team pays by hand from the signed packet.
*/
import type { Express, NextFunction, Request, Response } from 'express'
import { randomBytes } from 'node:crypto'
import { db } from './db/schema'
import { track } from './analytics'
import { requireCrm, type CrmDeps } from './crm/auth'
import type { EmailResult } from './email'
import { DEFAULT_TERMS, type Terms } from '../shared/affiliate-terms'
import { latestVersion, termsForApplication } from './affiliate-terms'

const DAY = 24 * 60 * 60 * 1000
/** Schedule A's clawback window: a refund or chargeback within 60 days of the payment. */
export const CLAWBACK_DAYS = 60

const num = (v: unknown) => (v == null ? 0 : Number(v))
const newId = (p: string) => `${p}_${randomBytes(9).toString('base64url')}`

export type RecruiterStatus = 'none' | 'pending' | 'active' | 'paused' | 'cancelled'

/* ------------------------------------------------------------------ recruiting over time */

/** Every change of a member's recruiter status, so "were they recruiting then?" has an answer. */
export async function recordRecruiter(memberId: string, status: RecruiterStatus, at = Date.now()) {
  await db.prepare('INSERT INTO recruiter_history (member_id, status, at) VALUES (?, ?, ?)').run(memberId, status, at)
}

/** Whether the member was an active recruiter (paid, not paused) at that moment. */
export async function recruitingAt(memberId: string, at: number): Promise<boolean> {
  const row = await db
    .prepare('SELECT status FROM recruiter_history WHERE member_id = ? AND at <= ? ORDER BY at DESC, id DESC LIMIT 1')
    .get<{ status: string }>(memberId, at)
  return row?.status === 'active'
}

/** Still owed months are credited to an active or paused recruiter; a cancelled one gets nothing more. */
async function stillCredited(memberId: string): Promise<boolean> {
  const m = await db.prepare('SELECT recruiter_status FROM members WHERE id = ?').get<{ recruiter_status: string }>(memberId)
  return m?.recruiter_status === 'active' || m?.recruiter_status === 'paused'
}

/** The Schedule A the affiliate signed up to: their application's terms, else the latest published, else the defaults. */
export async function termsOf(memberId: string): Promise<Terms> {
  const a = await db.prepare('SELECT id FROM onboarding_applications WHERE member_id = ?').get<{ id: string }>(memberId)
  if (a) {
    const t = await termsForApplication(a.id)
    if (t) return t.terms
  }
  return (await latestVersion())?.terms ?? DEFAULT_TERMS
}

/* ------------------------------------------------------------------ crediting */

export type CreditResult = { credited: false; why: string } | { credited: true; id: string; memberId: string; points: number; month: number }

async function nextMonth(kind: 'user' | 'business', sourceId: string) {
  const r = await db
    .prepare(`SELECT COALESCE(MAX(month), 0) AS last, COUNT(*) FILTER (WHERE status = 'earned') AS earned FROM bark_points WHERE source_kind = ? AND source_id = ?`)
    .get<{ last: number; earned: number }>(kind, sourceId)
  return { month: num(r?.last) + 1, earned: num(r?.earned) }
}

async function insertPoints(row: {
  memberId: string
  kind: 'user' | 'business'
  sourceId: string
  month: number
  points: number
  paymentRef: string | null
  paymentIntent: string | null
  paidAt: number
  note: string
}): Promise<string | null> {
  const id = newId('bp')
  const r = await db
    .prepare(
      `INSERT INTO bark_points (id, member_id, source_kind, source_id, month, points, payment_ref, payment_intent, status, note, paid_at, created_at)
       VALUES (?,?,?,?,?,?,?,?, 'earned', ?, ?, ?)
       ON CONFLICT DO NOTHING`,
    )
    .run(id, row.memberId, row.kind, row.sourceId, row.month, row.points, row.paymentRef, row.paymentIntent, row.note, row.paidAt, Date.now())
  return (r.changes ?? 0) > 0 ? id : null
}

/**
 * A member paid for a month of their pass (Stripe's invoice.paid). Credits their referrer the
 * month's points if every rule above holds; otherwise says why not, for the log and the audit.
 * The invoice id makes it once only: Stripe retries, and a retry credits nothing twice.
 */
export async function creditPaidInvoice(inv: {
  invoiceId: string
  customer: string
  tier: 'pass' | 'diamond' | 'recruiter' | null
  amountPaid: number
  billingReason: string
  paidAt: number
  paymentIntent: string | null
}): Promise<CreditResult> {
  if (!inv.invoiceId || !inv.customer) return { credited: false, why: 'no invoice or customer' }
  if (inv.tier !== 'pass' && inv.tier !== 'diamond') return { credited: false, why: 'not a pass (the recruiter fee earns no points for anyone)' }
  if (!(inv.amountPaid > 0)) return { credited: false, why: 'nothing was paid' }
  /* A new month: the first invoice or a renewal. A proration from switching passes is not a month. */
  if (inv.billingReason !== 'subscription_create' && inv.billingReason !== 'subscription_cycle') return { credited: false, why: `not a month (${inv.billingReason || 'no reason'})` }
  const payer = await db
    .prepare('SELECT id, referred_by, created_at FROM members WHERE stripe_customer = ? ORDER BY created_at ASC LIMIT 1')
    .get<{ id: string; referred_by: string | null; created_at: number }>(inv.customer)
  if (!payer) {
    /* Stripe does not promise order: a first invoice can arrive before the checkout that links its
       customer to a member. Kept, and tried again when that checkout arrives (creditWaiting). */
    await db
      .prepare('INSERT INTO bark_waiting_invoices (invoice_id, customer, invoice, created_at) VALUES (?, ?, ?::jsonb, ?) ON CONFLICT DO NOTHING')
      .run(inv.invoiceId, inv.customer, JSON.stringify(inv), Date.now())
    return { credited: false, why: 'no member for this customer yet (kept for their checkout)' }
  }
  const referrer = payer.referred_by
  if (!referrer) return { credited: false, why: 'not referred' }
  if (!(await recruitingAt(referrer, num(payer.created_at)))) return { credited: false, why: 'the referrer was not recruiting when they joined' }
  if (!(await stillCredited(referrer))) return { credited: false, why: 'the referrer is no longer a recruiter' }
  const t = await termsOf(referrer)
  if (t.rewardKind !== 'monthly_points') return { credited: false, why: 'this affiliate is not on monthly points' }
  const cap = inv.tier === 'diamond' ? t.userMonthsBeasty : t.userMonthsBiggie
  const { month, earned } = await nextMonth('user', payer.id)
  if (earned >= cap) return { credited: false, why: `all ${cap} months already credited` }
  const points = Math.round(t.pointsPerUser)
  if (!(points > 0)) return { credited: false, why: 'no points a month in these terms' }
  const id = await insertPoints({
    memberId: referrer,
    kind: 'user',
    sourceId: payer.id,
    month,
    points,
    paymentRef: inv.invoiceId,
    paymentIntent: inv.paymentIntent,
    paidAt: inv.paidAt,
    note: `${inv.tier === 'diamond' ? 'BEASTY PASS' : 'BIGGIE PASS'} month ${earned + 1} of ${cap}`,
  })
  return id ? { credited: true, id, memberId: referrer, points, month } : { credited: false, why: 'already credited' }
}

/** A member's checkout has linked their Stripe customer: credit any paid invoice that arrived first. */
export async function creditWaiting(customer: string): Promise<CreditResult[]> {
  if (!customer) return []
  const waiting = await db
    .prepare('SELECT invoice_id, invoice FROM bark_waiting_invoices WHERE customer = ? ORDER BY created_at ASC')
    .all<{ invoice_id: string; invoice: Parameters<typeof creditPaidInvoice>[0] }>(customer)
  const out: CreditResult[] = []
  for (const w of waiting) {
    await db.prepare('DELETE FROM bark_waiting_invoices WHERE invoice_id = ?').run(w.invoice_id)
    out.push(await creditPaidInvoice(w.invoice))
  }
  return out
}

/** The won deal behind a business a member referred, with what the rules need to know about it. */
async function businessDeal(dealId: string) {
  return db
    .prepare(
      `SELECT d.id, d.status, d.sold_cents, d.won_at, o.business_name,
              COALESCE(o.referred_at, o.created_at) AS referred_at, p.member_id
       FROM crm_deals d
       JOIN crm_opportunities o ON o.id = d.opportunity_id
       LEFT JOIN crm_people p ON p.id = o.referrer_id
       WHERE d.id = ?`,
    )
    .get<{ id: string; status: string; sold_cents: number | null; won_at: number | null; business_name: string; referred_at: number; member_id: string | null }>(dealId)
}

/**
 * The team recorded that a referred business paid another month. A business counts once it has
 * paid its initiation fee (a won deal with money on it) after asking through the affiliate's link.
 */
export async function creditBusinessMonth(dealId: string, actor: string, paidAt = Date.now()): Promise<CreditResult> {
  const d = await businessDeal(dealId)
  if (!d) return { credited: false, why: 'no such deal' }
  if (!d.member_id) return { credited: false, why: 'this business was not referred by a member' }
  if (d.status !== 'won' || !(num(d.sold_cents) > 0)) return { credited: false, why: 'the initiation fee is not recorded as paid' }
  if (!(await recruitingAt(d.member_id, num(d.referred_at)))) return { credited: false, why: 'the referrer was not recruiting when the business asked' }
  if (!(await stillCredited(d.member_id))) return { credited: false, why: 'the referrer is no longer a recruiter' }
  const t = await termsOf(d.member_id)
  if (t.rewardKind !== 'monthly_points') return { credited: false, why: 'this affiliate is not on monthly points' }
  const { month, earned } = await nextMonth('business', d.id)
  if (earned >= t.businessMonths) return { credited: false, why: `all ${t.businessMonths} months already credited` }
  const points = Math.round(t.pointsPerBusiness)
  if (!(points > 0)) return { credited: false, why: 'no points a month in these terms' }
  const id = await insertPoints({
    memberId: d.member_id,
    kind: 'business',
    sourceId: d.id,
    month,
    points,
    paymentRef: null,
    paymentIntent: null,
    paidAt,
    note: `${d.business_name}, paid month ${earned + 1} of ${t.businessMonths} (recorded by ${actor})`,
  })
  return id ? { credited: true, id, memberId: d.member_id, points, month } : { credited: false, why: 'already credited' }
}

/* ------------------------------------------------------------------ taking points back */

/**
 * A refunded or disputed charge (charge.refunded with the whole amount back, or charge.dispute.created).
 * Removes the points that payment earned if it was paid within the last 60 days. Matched by the
 * invoice the charge paid, or its payment intent.
 */
export async function voidForCharge(opts: { invoiceId: string | null; paymentIntent: string | null; why: string; now?: number }): Promise<number> {
  const now = opts.now ?? Date.now()
  if (!opts.invoiceId && !opts.paymentIntent) return 0
  const r = await db
    .prepare(
      `UPDATE bark_points SET status = 'void', voided_at = ?, voided_by = 'stripe', void_note = ?
       WHERE status = 'earned' AND paid_at >= ?
         AND ((?::text IS NOT NULL AND payment_ref = ?) OR (?::text IS NOT NULL AND payment_intent = ?))`,
    )
    .run(now, opts.why, now - CLAWBACK_DAYS * DAY, opts.invoiceId, opts.invoiceId, opts.paymentIntent, opts.paymentIntent)
  return r.changes ?? 0
}

/** The team removes a credit by hand: a business refund, a mistake. A reason is required. */
export async function voidPoints(id: string, actor: string, note: string): Promise<boolean> {
  const r = await db
    .prepare("UPDATE bark_points SET status = 'void', voided_at = ?, voided_by = ?, void_note = ? WHERE id = ? AND status = 'earned'")
    .run(Date.now(), actor, note.slice(0, 300), id)
  return (r.changes ?? 0) > 0
}

/* ------------------------------------------------------------------ the balance and cash-outs */

export interface Balance {
  earned: number
  /** Requested or paid out. */
  cashedOut: number
  /** What can be asked for: never below zero, even after a clawback. */
  available: number
  /** Points taken back after they were paid out, coming off the next cash-out. */
  owed: number
}

export async function balanceOf(memberId: string): Promise<Balance> {
  const r = await db
    .prepare(
      `SELECT (SELECT COALESCE(SUM(points), 0) FROM bark_points WHERE member_id = ? AND status = 'earned') AS earned,
              (SELECT COALESCE(SUM(points), 0) FROM bark_cashouts WHERE member_id = ? AND status IN ('requested','paid')) AS out`,
    )
    .get<{ earned: number; out: number }>(memberId, memberId)
  const earned = num(r?.earned)
  const cashedOut = num(r?.out)
  return { earned, cashedOut, available: Math.max(0, earned - cashedOut), owed: Math.max(0, cashedOut - earned) }
}

/** The approved paperwork a cash-out needs: their application, approved by the team. */
async function paperworkOf(memberId: string) {
  return db
    .prepare('SELECT id, status FROM onboarding_applications WHERE member_id = ?')
    .get<{ id: string; status: string }>(memberId)
}

/** The amounts they may ask for right now: minRedemption, then each step up to what they have. */
export function cashoutChoices(available: number, t: Pick<Terms, 'minRedemption' | 'redemptionStep'>): number[] {
  const min = Math.max(1, Math.round(t.minRedemption))
  const step = Math.max(1, Math.round(t.redemptionStep))
  const out: number[] = []
  for (let p = min; p <= available && out.length < 200; p += step) out.push(p)
  return out
}

export type CashoutResult = { ok: true; id: string } | { ok: false; status: number; error: string }

export async function requestCashout(memberId: string, points: number): Promise<CashoutResult> {
  const app = await paperworkOf(memberId)
  if (app?.status !== 'approved') return { ok: false, status: 409, error: 'Cash-outs open once BEASTY approves your signed paperwork.' }
  const t = await termsOf(memberId)
  const { available } = await balanceOf(memberId)
  if (!Number.isInteger(points) || !cashoutChoices(available, t).includes(points)) {
    return { ok: false, status: 400, error: `Cash out from ${t.minRedemption} points, in steps of ${t.redemptionStep}, up to the ${available} you have.` }
  }
  const id = newId('co')
  const cents = Math.round(points * t.pointValue * 100)
  const r = await db
    .prepare(
      `INSERT INTO bark_cashouts (id, member_id, points, cents, status, requested_at)
       VALUES (?, ?, ?, ?, 'requested', ?) ON CONFLICT DO NOTHING`,
    )
    .run(id, memberId, points, cents, Date.now())
  if (!(r.changes ?? 0)) return { ok: false, status: 409, error: `You already have a cash-out waiting. BEASTY pays it within ${t.payoutDays} days.` }
  return { ok: true, id }
}

export async function decideCashout(id: string, decision: 'paid' | 'declined', actor: string, note: string): Promise<boolean> {
  const r = await db
    .prepare("UPDATE bark_cashouts SET status = ?, decided_at = ?, decided_by = ?, note = ? WHERE id = ? AND status = 'requested'")
    .run(decision, Date.now(), actor, note.slice(0, 300), id)
  return (r.changes ?? 0) > 0
}

/* ------------------------------------------------------------------ what each side sees */

const maskName = (name: string) => {
  const first = String(name ?? '').trim().charAt(0).toUpperCase()
  return first ? `${first}•••` : 'Member'
}

interface PointRow {
  id: string
  source_kind: 'user' | 'business'
  source_id: string
  month: number
  points: number
  status: 'earned' | 'void'
  note: string | null
  void_note: string | null
  paid_at: number
  created_at: number
  who: string | null
}

async function pointsOf(memberId: string): Promise<PointRow[]> {
  return (
    await db
      .prepare(
        `SELECT b.id, b.source_kind, b.source_id, b.month, b.points, b.status, b.note, b.void_note, b.paid_at, b.created_at,
                CASE WHEN b.source_kind = 'user' THEN (SELECT name FROM members WHERE id = b.source_id)
                     ELSE (SELECT o.business_name FROM crm_deals d JOIN crm_opportunities o ON o.id = d.opportunity_id WHERE d.id = b.source_id) END AS who
         FROM bark_points b WHERE b.member_id = ? ORDER BY b.created_at DESC LIMIT 300`,
      )
      .all<PointRow>(memberId)
  ).map((r) => ({ ...r, month: num(r.month), points: num(r.points), paid_at: num(r.paid_at), created_at: num(r.created_at) }))
}

async function cashoutsOf(memberId: string) {
  return (
    await db
      .prepare('SELECT id, points, cents, status, requested_at, decided_at, note FROM bark_cashouts WHERE member_id = ? ORDER BY requested_at DESC LIMIT 100')
      .all<{ id: string; points: number; cents: number; status: string; requested_at: number; decided_at: number | null; note: string | null }>(memberId)
  ).map((c) => ({ id: c.id, points: num(c.points), cents: num(c.cents), status: c.status, requestedAt: num(c.requested_at), decidedAt: c.decided_at == null ? null : num(c.decided_at), note: c.note ?? '' }))
}

/** The member's own view, for the Affiliate dashboard. Referred members' names stay masked. */
export async function barkForMember(memberId: string) {
  const m = await db.prepare('SELECT recruiter_status, recruiter_since FROM members WHERE id = ?').get<{ recruiter_status: string; recruiter_since: number | null }>(memberId)
  const t = await termsOf(memberId)
  const balance = await balanceOf(memberId)
  const app = await paperworkOf(memberId)
  const cashouts = await cashoutsOf(memberId)
  const open = cashouts.find((c) => c.status === 'requested') ?? null
  const approved = app?.status === 'approved'
  return {
    recruiter: (m?.recruiter_status ?? 'none') as RecruiterStatus,
    recruiterSince: m?.recruiter_since == null ? null : num(m.recruiter_since),
    paperwork: (app?.status ?? 'none') as string,
    balance,
    pointValue: t.pointValue,
    minRedemption: t.minRedemption,
    redemptionStep: t.redemptionStep,
    payoutDays: t.payoutDays,
    choices: approved && !open ? cashoutChoices(balance.available, t) : [],
    openCashout: open,
    cashouts,
    ledger: (await pointsOf(memberId)).map((r) => ({
      id: r.id,
      at: r.created_at,
      points: r.points,
      status: r.status,
      text: r.source_kind === 'user' ? `${maskName(r.who ?? '')} paid their ${r.note ?? 'pass'}` : (r.note ?? 'A business you referred paid a month').replace(/ \(recorded by .*\)$/, ''),
      voidNote: r.void_note ?? '',
    })),
  }
}

/** The team's view of one affiliate: everything above, real names, and the businesses whose months they record. */
export async function barkForCrm(memberId: string) {
  const own = await barkForMember(memberId)
  const t = await termsOf(memberId)
  const ledger = (await pointsOf(memberId)).map((r) => ({
    id: r.id,
    kind: r.source_kind,
    who: r.who ?? '',
    month: r.month,
    points: r.points,
    status: r.status,
    note: r.note ?? '',
    voidNote: r.void_note ?? '',
    at: r.created_at,
  }))
  const deals = (
    await db
      .prepare(
        `SELECT d.id, o.business_name, d.status, d.sold_cents, d.won_at, COALESCE(o.referred_at, o.created_at) AS referred_at,
                (SELECT COUNT(*) FROM bark_points b WHERE b.source_kind = 'business' AND b.source_id = d.id AND b.status = 'earned') AS months
         FROM crm_deals d
         JOIN crm_opportunities o ON o.id = d.opportunity_id
         JOIN crm_people p ON p.id = o.referrer_id
         WHERE p.member_id = ? AND d.status = 'won'
         ORDER BY d.won_at DESC NULLS LAST LIMIT 200`,
      )
      .all<{ id: string; business_name: string; status: string; sold_cents: number | null; won_at: number | null; referred_at: number; months: number }>(memberId)
  )
  const businesses = []
  for (const d of deals) {
    const recruiting = await recruitingAt(memberId, num(d.referred_at))
    const initiation = num(d.sold_cents) > 0
    businesses.push({
      dealId: d.id,
      name: d.business_name,
      wonAt: d.won_at == null ? null : num(d.won_at),
      months: num(d.months),
      of: t.businessMonths,
      /* Why a month cannot be recorded, or '' when it can. */
      blocked: !initiation
        ? 'Its initiation fee is not recorded on the deal.'
        : !recruiting
          ? 'They were not recruiting when it asked for a spot.'
          : num(d.months) >= t.businessMonths
            ? `All ${t.businessMonths} months are credited.`
            : own.recruiter !== 'active' && own.recruiter !== 'paused'
              ? 'They are no longer a recruiter.'
              : '',
    })
  }
  return { ...own, ledger, businesses, pointsPerBusiness: t.pointsPerBusiness }
}

/** Open cash-out requests across every affiliate, for the CRM's Affiliates list. */
export async function openCashouts() {
  return (
    await db
      .prepare(
        `SELECT c.id, c.member_id, c.points, c.cents, c.requested_at, a.id AS application_id, m.name
         FROM bark_cashouts c JOIN members m ON m.id = c.member_id
         LEFT JOIN onboarding_applications a ON a.member_id = c.member_id
         WHERE c.status = 'requested' ORDER BY c.requested_at ASC LIMIT 200`,
      )
      .all<{ id: string; member_id: string; points: number; cents: number; requested_at: number; application_id: string | null; name: string }>()
  ).map((c) => ({ id: c.id, applicationId: c.application_id, name: c.name, points: num(c.points), cents: num(c.cents), requestedAt: num(c.requested_at) }))
}

/* ------------------------------------------------------------------ routes */

export function mountBark(
  app: Express,
  deps: {
    memberFromRequest(req: Request): Promise<{ id: string; name: string } | null>
    rateLimiter(perMinute: number, burst: number): (req: Request, res: Response, next: NextFunction) => void
    crm: CrmDeps
    sendEmail(to: string | undefined, subject: string, text: string, replyTo?: string): Promise<EmailResult>
    leadEmail: string | undefined
  },
) {
  const team = requireCrm(deps.crm, 'team')
  const admin = requireCrm(deps.crm, 'admin')
  const read = deps.rateLimiter(240, 60)
  /* A member asks for a cash-out now and then; the team records a business's six months in a row. */
  const write = deps.rateLimiter(30, 10)
  const crmWrite = deps.rateLimiter(240, 60)
  const asyncH = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next)
  }
  const body = (req: Request) => (req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>) : {})

  /* The member's own points, cash-outs and what they can do next. */
  app.get('/api/affiliate/bark', read, asyncH(async (req, res) => {
    const m = await deps.memberFromRequest(req)
    if (!m) return res.status(401).json({ error: 'Not signed in.' })
    res.set('Cache-Control', 'no-store')
    res.json(await barkForMember(m.id))
  }))

  app.post('/api/affiliate/cashout', write, asyncH(async (req, res) => {
    const m = await deps.memberFromRequest(req)
    if (!m) return res.status(401).json({ error: 'Not signed in.' })
    const points = Number(body(req).points)
    const r = await requestCashout(m.id, points)
    if (!r.ok) return res.status(r.status).json({ error: r.error })
    await track('bark_cashout_requested', { memberId: m.id, metadata: { points } })
    const appRow = await paperworkOf(m.id)
    const t = await termsOf(m.id)
    void deps.sendEmail(
      deps.leadEmail,
      `BEASTY: ${m.name} asked to cash out ${points} BARK points`,
      `${m.name} asked to cash out ${points} BARK points ($${(points * t.pointValue).toFixed(2)}).\n\n` +
        `Pay it by direct deposit to the account on their signed packet within ${t.payoutDays} days, then mark it paid in the CRM: ` +
        `People, Affiliates${appRow ? `, their page (${appRow.id})` : ''}.`,
    )
    res.status(201).json(await barkForMember(m.id))
  }))

  /* ---- the CRM: one affiliate's points, by their application ---- */
  const memberOfApp = async (id: string) =>
    (await db.prepare('SELECT member_id FROM onboarding_applications WHERE id = ?').get<{ member_id: string }>(id))?.member_id ?? null

  app.get('/api/crm/onboarding/:id/bark', read, team, asyncH(async (req, res) => {
    const memberId = await memberOfApp(String(req.params.id))
    if (!memberId) return res.status(404).json({ error: 'No such application.' })
    res.json(await barkForCrm(memberId))
  }))

  app.get('/api/crm/bark/cashouts', read, team, asyncH(async (_req, res) => {
    res.json({ open: await openCashouts() })
  }))

  /* A referred business paid another month: credit its referrer, if the rules allow. */
  app.post('/api/crm/onboarding/:id/bark/business-month', crmWrite, admin, asyncH(async (req, res) => {
    const memberId = await memberOfApp(String(req.params.id))
    if (!memberId) return res.status(404).json({ error: 'No such application.' })
    const dealId = String(body(req).dealId ?? '')
    const d = await businessDeal(dealId)
    if (!d || d.member_id !== memberId) return res.status(404).json({ error: 'That business was not referred by this affiliate.' })
    const r = await creditBusinessMonth(dealId, req.crm!.name ?? req.crm!.actor)
    if (!r.credited) return res.status(409).json({ error: `Not credited: ${r.why}.` })
    await track('bark_points_credited', { memberId, actor: req.crm!.actor, metadata: { points: r.points, month: r.month, business: dealId } })
    res.json(await barkForCrm(memberId))
  }))

  app.post('/api/crm/onboarding/:id/bark/points/:pointId/void', crmWrite, admin, asyncH(async (req, res) => {
    const memberId = await memberOfApp(String(req.params.id))
    if (!memberId) return res.status(404).json({ error: 'No such application.' })
    const note = String(body(req).note ?? '').trim()
    if (!note) return res.status(400).json({ error: 'Say why these points are removed.' })
    const own = await db.prepare('SELECT 1 FROM bark_points WHERE id = ? AND member_id = ?').get(String(req.params.pointId), memberId)
    if (!own || !(await voidPoints(String(req.params.pointId), req.crm!.actor, note))) return res.status(409).json({ error: 'Those points are already removed.' })
    res.json(await barkForCrm(memberId))
  }))

  app.post('/api/crm/onboarding/:id/bark/cashouts/:cashoutId', crmWrite, admin, asyncH(async (req, res) => {
    const memberId = await memberOfApp(String(req.params.id))
    if (!memberId) return res.status(404).json({ error: 'No such application.' })
    const decision = body(req).decision
    const note = String(body(req).note ?? '').trim()
    if (decision !== 'paid' && decision !== 'declined') return res.status(400).json({ error: 'decision must be paid or declined.' })
    if (decision === 'declined' && !note) return res.status(400).json({ error: 'Say why it is declined; they will see it.' })
    const own = await db.prepare('SELECT 1 FROM bark_cashouts WHERE id = ? AND member_id = ?').get(String(req.params.cashoutId), memberId)
    if (!own || !(await decideCashout(String(req.params.cashoutId), decision, req.crm!.actor, note))) return res.status(409).json({ error: 'That cash-out is already decided.' })
    res.json(await barkForCrm(memberId))
  }))
}
