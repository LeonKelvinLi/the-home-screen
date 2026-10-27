/*
  AFFILIATE ONBOARDING: invite, sign up, get paid, sign, submit, review.

  Glenn, 2026-10-10: "do you think you can add our own form on the website?
  Call it BEASTY forms", for affiliates: basic info, Social Security number,
  checking routing and account numbers, a picture of their ID. Leon: "I can
  build the full onboarding flow so affiliates receive a secure link, fill out
  their information, upload their ID and required documents, and electronically
  sign everything through DocuSeal. We can then countersign."

  The journey (docs/AFFILIATE-ONBOARDING.md has the long form):
    1. Glenn invites someone from the CRM: a one-time link, /join/<token>.
    2. They sign in or sign up with the usual BEASTY phone/email code, and the
       link becomes their application (one per member).
    3. Your information: name, contact, address, individual or business, how
       they will promote BEASTY. Saved as they type, with a revision number so
       a stale save from another tab never overwrites newer typing.
    4. Forms & agreement: one DocuSeal packet with the W-9 (SSN or EIN), the
       direct-deposit form (bank account), a photo of their ID and the
       affiliate agreement, signed by them, then countersigned by BEASTY.
       Status comes from DocuSeal, never from a button press.
    5. Review and submit; Glenn approves in the CRM once he has countersigned,
       and pays affiliates himself from the forms in the signed packet.

  NO STRIPE FOR AFFILIATES, FOR NOW. Leon, 2026-10-11: "lets not have stripe set
  up and have that running for now". The Stripe Connect step (Get paid) is still
  here, behind AFFILIATE_PAYOUTS, and appears only when that is set; with it off
  the journey is three steps and the tax, bank and ID details travel in the
  DocuSeal packet instead.

  Nothing sensitive is stored here, logged, or emailed: no SSN, no bank number,
  no ID image. They are typed into DocuSeal's own page and stay in DocuSeal. The
  profile holds contact details only.
*/
import type { Express, Request, Response, NextFunction } from 'express'
import type { EmailResult } from './email'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { db } from './db/schema'
import { requireCrm, type CrmDeps } from './crm/auth'
import { makeProviders, mockControls, providerModes, ProviderOff, type PayoutState, type Providers } from './onboarding-providers'
import { approvedManualTemplate, docusealLink, manualEvidence, type ManualEvidence } from './onboarding-manual'
import { onboardingPrefill } from '../shared/onboarding-prefill'
import { termsForApplication } from './affiliate-terms'


/* ------------------------------------------------------------- profile ---- */

export const PROMOTE = ['instagram', 'tiktok', 'youtube', 'facebook', 'website', 'in_person', 'email', 'other'] as const
const US_STATES = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR'.split(' '))
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface Profile {
  legalFirst?: string
  legalLast?: string
  preferredName?: string
  email?: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  kind?: 'individual' | 'business'
  businessName?: string
  website?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  promote?: string[]
  promoteNote?: string
}

const LIMITS: Record<string, number> = {
  legalFirst: 60, legalLast: 60, preferredName: 60, email: 120, phone: 24,
  line1: 100, line2: 100, city: 60, state: 2, zip: 10, businessName: 100,
  website: 200, instagram: 60, tiktok: 60, youtube: 80, promoteNote: 300,
}

/** Keep what fits; drop what doesn't. A draft can be half-finished, never malformed. */
export function cleanProfile(raw: unknown): Profile {
  const p: Profile = {}
  if (!raw || typeof raw !== 'object') return p
  const r = raw as Record<string, unknown>
  for (const [k, max] of Object.entries(LIMITS)) {
    const v = r[k]
    if (typeof v === 'string') (p as Record<string, string>)[k] = v.replace(/[\u0000-\u001f]/g, ' ').slice(0, max).trimStart()
  }
  if (p.state) p.state = p.state.toUpperCase()
  if (r.kind === 'individual' || r.kind === 'business') p.kind = r.kind
  if (Array.isArray(r.promote)) p.promote = [...new Set(r.promote.filter((x): x is string => typeof x === 'string' && (PROMOTE as readonly string[]).includes(x)))]
  return p
}

/** Field-by-field problems with a profile meant to be complete; empty when it is. */
export function profileProblems(p: Profile): Record<string, string> {
  const e: Record<string, string> = {}
  const t = (s?: string) => (s ?? '').trim()
  if (!t(p.legalFirst)) e.legalFirst = 'Your legal first name, as on your ID.'
  if (!t(p.legalLast)) e.legalLast = 'Your legal last name, as on your ID.'
  if (!EMAIL.test(t(p.email))) e.email = 'An email address we can reach you at.'
  const digits = t(p.phone).replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) e.phone = 'A phone number with area code.'
  if (!t(p.line1)) e.line1 = 'Street address.'
  if (!t(p.city)) e.city = 'City.'
  if (!US_STATES.has(t(p.state))) e.state = 'Two-letter state, like CA.'
  if (!/^\d{5}(-?\d{4})?$/.test(t(p.zip))) e.zip = 'Five-digit ZIP code.'
  if (p.kind !== 'individual' && p.kind !== 'business') e.kind = 'Choose individual or business.'
  if (p.kind === 'business' && !t(p.businessName)) e.businessName = 'The business’s legal name.'
  if (!p.promote?.length) e.promote = 'Pick at least one way you’ll share BEASTY.'
  return e
}

/* --------------------------------------------------------------- shape ---- */

export type AppStatus = 'in_progress' | 'submitted' | 'changes_requested' | 'approved' | 'rejected' | 'suspended'

interface AppRow {
  id: string
  member_id: string
  invite_id: string | null
  status: AppStatus
  revision: number
  profile: Profile
  payout_ref: string | null
  payout_state: PayoutState | null
  payout_checked: number | null
  submitted_at: number | null
  decided_at: number | null
  decided_by: string | null
  decision_note: string
  created_at: number
  updated_at: number
}

interface DocRow {
  id: string
  application_id: string
  category: string
  template_version: string
  provider: string
  provider_ref: string
  status: string
  affiliate_url: string
  company_url: string
  affiliate_signed_at: number | null
  company_signed_at: number | null
  completed_at: number | null
  checked_at: number | null
  created_at: number
  updated_at: number
  submission_url: string
  manual_revision: number
  manual_evidence: Partial<ManualEvidence>
  verified_by: string | null
  review_requested_at: number | null
}

const newId = (p: string) => `${p}_${randomBytes(9).toString('base64url')}`
const sha = (t: string) => createHash('sha256').update(t).digest('hex')
const INVITE_DAYS = 14

async function event(applicationId: string | null, actor: string, kind: string, detail: Record<string, unknown> = {}, inviteId: string | null = null) {
  await db
    .prepare('INSERT INTO onboarding_events (application_id, invite_id, actor, kind, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(applicationId, inviteId, actor, kind, JSON.stringify(detail), Date.now())
}

/**
 * PAYING FOR THE RECRUITER UPGRADE IS THE INVITATION (Leon, 2026-10-26: "paying the $60 opens the
 * /join paperwork"). Makes their application from what the member record already knows, so /join
 * opens on step 1 instead of "by invitation". An application they already have (an earlier invite,
 * a second payment) is kept as it is. Returns its id, or null for no such member.
 */
export async function openRecruiterApplication(memberId: string, actor = 'stripe'): Promise<string | null> {
  const existing = await db.prepare('SELECT id FROM onboarding_applications WHERE member_id = ?').get<{ id: string }>(memberId)
  if (existing) return existing.id
  const m = await db.prepare('SELECT name, email, phone FROM members WHERE id = ?').get<{ name: string | null; email: string | null; phone: string | null }>(memberId)
  if (!m) return null
  const [first, ...rest] = (m.name || '').trim().split(/\s+/)
  const profile: Profile = { email: m.email ?? '', phone: m.phone ?? '', legalFirst: first ?? '', legalLast: rest.join(' ') }
  const id = newId('app')
  const now = Date.now()
  const r = await db
    .prepare(
      `INSERT INTO onboarding_applications (id, member_id, invite_id, status, revision, profile, created_at, updated_at)
       VALUES (?, ?, NULL, 'in_progress', 0, ?, ?, ?) ON CONFLICT (member_id) DO NOTHING`,
    )
    .run(id, memberId, JSON.stringify(cleanProfile(profile)), now, now)
  if (!(r.changes ?? 0)) return (await db.prepare('SELECT id FROM onboarding_applications WHERE member_id = ?').get<{ id: string }>(memberId))?.id ?? null
  await event(id, actor, 'opened_by_recruiter')
  return id
}

function maskEmail(e: string): string {
  const [u, d] = e.split('@')
  if (!d) return ''
  return `${u.slice(0, 1)}${'•'.repeat(Math.max(1, Math.min(6, u.length - 1)))}@${d}`
}

/** What the steps look like right now, for the portal and the CRM alike. */
function stepsOf(app: AppRow, doc: DocRow | null, modes: { payouts: string; signing: string }) {
  const problems = profileProblems(app.profile)
  const payout = app.payout_state
  const payoutsDone = !!payout?.detailsSubmitted && !!payout?.payoutsEnabled
  const signed = !!doc?.affiliate_signed_at
  return {
    profile: { complete: Object.keys(problems).length === 0, problems },
    payouts: {
      available: modes.payouts !== 'off',
      started: !!app.payout_ref,
      complete: payoutsDone,
      identity: payout?.identity ?? 'needed',
      tax: payout?.tax ?? 'needed',
      bank: payout?.bank ?? 'needed',
      bankLast4: payout?.bankLast4 ?? null,
    },
    agreement: {
      available: modes.signing !== 'off',
      mode: modes.signing,
      linkReady: !!doc?.affiliate_url,
      reviewRequested: !!doc?.review_requested_at,
      status: doc?.status ?? 'not_started',
      affiliateSigned: signed,
      countersigned: !!doc?.company_signed_at,
      completedAt: doc?.completed_at ?? null,
    },
  }
}

/* ---------------------------------------------------------------- mount ---- */

export interface OnboardingDeps {
  memberFromRequest(req: Request): Promise<{ id: string; name: string; email: string; phone?: string | null } | null>
  rateLimiter(perMinute: number, burst: number): (req: Request, res: Response, next: NextFunction) => void
  origin(req: Request): string
  /** The public site's origin, for invite links made from the CRM's own address. */
  publicUrl: string
  sendEmail(to: string | undefined, subject: string, text: string, replyTo?: string): Promise<EmailResult>
  leadEmail: string | undefined
  crm: CrmDeps
  prod: boolean
}

export function mountOnboarding(app: Express, deps: OnboardingDeps, providers: Providers = makeProviders(deps.prod)) {
  const modes = providerModes(deps.prod)
  console.log(`onboarding: payouts ${providers.payouts}, signing ${providers.signing}${modes.refusedMock ? ' (AFFILIATE_PROVIDERS=mock ignored in production)' : ''}`)
  const read = deps.rateLimiter(240, 60)
  const write = deps.rateLimiter(60, 20)
  /* Invite tokens are 192 random bits, so these limits are hygiene, not the
     defence: roomy enough for a real person clicking through on a shared
     carrier IP, tight enough to keep a script honest. */
  const inviteLimit = deps.rateLimiter(30, 10)
  const strict = deps.rateLimiter(40, 20)
  const site = (req: Request) => deps.publicUrl || deps.origin(req)

  /* The portal's pages carry a private invite token in the address until it is
     redeemed: never indexed, and never sent onward as a Referer. */
  app.use((req, res, next) => {
    if (req.method === 'GET' && /^\/join(\/|$)/.test(req.path)) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow')
      res.setHeader('Referrer-Policy', 'no-referrer')
      res.setHeader('Cache-Control', 'no-store')
    }
    next()
  })
  const asyncH = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next)
  }

  async function appOf(memberId: string) {
    return db.prepare('SELECT * FROM onboarding_applications WHERE member_id = ?').get<AppRow>(memberId)
  }
  async function latestDoc(applicationId: string): Promise<DocRow | null> {
    const row = await db
      .prepare("SELECT * FROM onboarding_documents WHERE application_id = ? AND category = 'affiliate_agreement' ORDER BY created_at DESC LIMIT 1")
      .get<DocRow>(applicationId)
    return row ?? null
  }

  /** Ask Stripe how the payout account stands, at most once a minute per application. */
  async function refreshPayouts(app: AppRow, force = false): Promise<AppRow> {
    if (!app.payout_ref || providers.payouts === 'off') return app
    if (!force && app.payout_checked && Date.now() - app.payout_checked < 60_000) return app
    try {
      const st = await providers.payoutState(app.payout_ref)
      const was = !!app.payout_state?.payoutsEnabled && !!app.payout_state?.detailsSubmitted
      await db
        .prepare('UPDATE onboarding_applications SET payout_state = ?, payout_checked = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(st), Date.now(), Date.now(), app.id)
      if (!was && st.payoutsEnabled && st.detailsSubmitted) await event(app.id, 'stripe', 'payouts_completed')
      return { ...app, payout_state: st, payout_checked: Date.now() }
    } catch (err) {
      console.error('onboarding: payout refresh failed:', String(err).slice(0, 160))
      return app
    }
  }

  /** API packets reconcile with DocuSeal; manual packets require admin review. */
  async function refreshDoc(doc: DocRow | null, force = false): Promise<DocRow | null> {
    if (!doc || doc.provider === 'manual' || providers.signing === 'off' || doc.status === 'completed') return doc
    if (!force && doc.checked_at && Date.now() - doc.checked_at < 30_000) return doc
    try {
      const st = await providers.signingState(doc.provider_ref)
      const now = Date.now()
      const aff = st.affiliateSigned ? doc.affiliate_signed_at ?? now : null
      const co = st.companySigned ? doc.company_signed_at ?? now : null
      const status = st.declined ? 'declined' : st.expired ? 'expired' : aff && co ? 'completed' : aff ? 'pending_countersignature' : 'pending_signature'
      await db
        .prepare('UPDATE onboarding_documents SET status = ?, affiliate_signed_at = ?, company_signed_at = ?, completed_at = ?, checked_at = ?, updated_at = ? WHERE id = ?')
        .run(status, aff, co, status === 'completed' ? doc.completed_at ?? now : null, now, now, doc.id)
      if (aff && !doc.affiliate_signed_at) await event(doc.application_id, 'docuseal', 'agreement_signed')
      if (co && !doc.company_signed_at) await event(doc.application_id, 'docuseal', 'agreement_countersigned')
      if (status !== doc.status && (status === 'declined' || status === 'expired')) await event(doc.application_id, 'docuseal', `agreement_${status}`)
      return { ...doc, status, affiliate_signed_at: aff, company_signed_at: co, completed_at: status === 'completed' ? doc.completed_at ?? now : null, checked_at: now }
    } catch (err) {
      console.error('onboarding: signing refresh failed:', String(err).slice(0, 160))
      return doc
    }
  }

  function bundle(app: AppRow, doc: DocRow | null) {
    return {
      id: app.id,
      status: app.status,
      revision: app.revision,
      profile: app.profile,
      steps: stepsOf(app, doc, providers),
      submittedAt: app.submitted_at,
      decidedAt: app.decided_at,
      decisionNote: app.status === 'changes_requested' || app.status === 'rejected' ? app.decision_note : '',
      testMode: providers.payouts === 'mock' || providers.signing === 'mock',
      updatedAt: app.updated_at,
    }
  }

  async function requestManualPacket(a: AppRow, actor: string): Promise<{ doc: DocRow; created: boolean }> {
    return db.transaction(async () => {
      // The application lock also serializes request/attach/verify/approval.
      await db.prepare('SELECT id FROM onboarding_applications WHERE id = ? FOR UPDATE').get(a.id)
      const existing = await latestDoc(a.id)
      if (existing) return { doc: existing, created: false }
      const now = Date.now()
      await db.prepare(`INSERT INTO onboarding_documents
        (id, application_id, category, template_version, provider, provider_ref, status, created_at, updated_at)
        VALUES (?, ?, 'affiliate_agreement', '', 'manual', '', 'requested', ?, ?)`)
        .run(newId('doc'), a.id, now, now)
      await db.prepare('UPDATE onboarding_applications SET updated_at = ? WHERE id = ?').run(now, a.id)
      await event(a.id, actor, 'packet_requested')
      return { doc: (await latestDoc(a.id))!, created: true }
    })()
  }

  const member = async (req: Request, res: Response) => {
    const m = await deps.memberFromRequest(req)
    if (!m) {
      res.status(401).json({ error: 'Sign in first.' })
      return null
    }
    res.set('Cache-Control', 'no-store')
    return m
  }

  /* ---- which steps are switched on (public): the welcome page counts them ---- */
  app.get('/api/onboarding/setup', (_req, res) => {
    res.json({ payouts: providers.payouts !== 'off', signing: providers.signing !== 'off', signingMode: providers.signing })
  })

  /* ---- invite: preview (public) and redeem (signed in) ---- */

  async function inviteByToken(token: string) {
    if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) return null
    return db.prepare('SELECT * FROM onboarding_invites WHERE token_hash = ?').get<{
      id: string; email: string; name: string; expires_at: number; redeemed_at: number | null; redeemed_by: string | null; revoked_at: number | null
    }>(sha(token))
  }

  app.get('/api/onboarding/invite/:token', inviteLimit, asyncH(async (req, res) => {
    res.set('Cache-Control', 'no-store')
    const inv = await inviteByToken(String(req.params.token))
    if (!inv) return res.status(404).json({ state: 'unknown' })
    const state = inv.revoked_at ? 'revoked' : inv.redeemed_at ? 'redeemed' : inv.expires_at < Date.now() ? 'expired' : 'open'
    res.json({ state, name: inv.name, emailHint: maskEmail(inv.email) })
  }))

  app.post('/api/onboarding/invite/:token/redeem', inviteLimit, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    const inv = await inviteByToken(String(req.params.token))
    if (!inv) return res.status(404).json({ error: 'This invite link isn’t valid.' })
    if (inv.revoked_at) return res.status(410).json({ error: 'This invite was cancelled. Ask BEASTY for a new one.' })
    const existing = await appOf(m.id)
    if (inv.redeemed_at) {
      if (inv.redeemed_by === m.id && existing) return res.json(bundle(existing, await latestDoc(existing.id)))
      return res.status(409).json({ error: 'This invite has already been used.' })
    }
    if (inv.expires_at < Date.now()) return res.status(410).json({ error: 'This invite has expired. Ask BEASTY for a new one.' })
    const now = Date.now()
    const run = db.transaction(async () => {
      const claimed = await db
        .prepare('UPDATE onboarding_invites SET redeemed_at = ?, redeemed_by = ? WHERE id = ? AND redeemed_at IS NULL AND revoked_at IS NULL')
        .run(now, m.id, inv.id)
      if (!claimed.changes) throw Object.assign(new Error('raced'), { status: 409 })
      if (existing) {
        await db.prepare('UPDATE onboarding_applications SET invite_id = COALESCE(invite_id, ?), updated_at = ? WHERE id = ?').run(inv.id, now, existing.id)
        return existing.id
      }
      const id = newId('app')
      const [first, ...rest] = (inv.name || m.name || '').trim().split(/\s+/)
      const profile: Profile = { email: inv.email || m.email, phone: m.phone ?? '', legalFirst: first ?? '', legalLast: rest.join(' ') }
      await db
        .prepare('INSERT INTO onboarding_applications (id, member_id, invite_id, status, revision, profile, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)')
        .run(id, m.id, inv.id, 'in_progress', JSON.stringify(cleanProfile(profile)), now, now)
      return id
    })
    let appId: string
    try {
      appId = await run()
    } catch (err) {
      if ((err as { status?: number }).status === 409) return res.status(409).json({ error: 'This invite has already been used.' })
      throw err
    }
    await event(appId, `member:${m.id}`, 'started', {}, inv.id)
    const a = (await appOf(m.id))!
    res.status(201).json(bundle(a, await latestDoc(a.id)))
  }))

  /* ---- the affiliate's own application ---- */

  app.get('/api/onboarding/me', read, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    let a = await appOf(m.id)
    if (!a) {
      /* A recruiter whose paperwork was not opened by the webhook (paid before this shipped, or the
         event is still on its way) gets it here rather than "by invitation". */
      const r = await db.prepare('SELECT recruiter_status FROM members WHERE id = ?').get<{ recruiter_status: string }>(m.id)
      if (r?.recruiter_status === 'active' || r?.recruiter_status === 'paused') {
        await openRecruiterApplication(m.id, `member:${m.id}`)
        a = await appOf(m.id)
      }
    }
    if (!a) return res.status(404).json({ state: 'none' })
    a = await refreshPayouts(a, req.query.refresh === '1')
    const d = await refreshDoc((await latestDoc(a.id)) ?? null, req.query.refresh === '1')
    res.json(bundle(a, d))
  }))

  app.put('/api/onboarding/me/profile', write, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    const a = await appOf(m.id)
    if (!a) return res.status(404).json({ error: 'No application yet.' })
    if (a.status !== 'in_progress' && a.status !== 'changes_requested') {
      return res.status(409).json({ error: 'Your application is with BEASTY now, so it can’t be edited.', revision: a.revision })
    }
    const body = req.body as { revision?: unknown; profile?: unknown }
    const rev = Number(body?.revision)
    if (!Number.isInteger(rev)) return res.status(400).json({ error: 'Missing revision.' })
    const profile = cleanProfile(body.profile)
    /* Optimistic concurrency: the save lands only on the revision it was typed
       against. A late save from an older tab gets 409 and the newer profile. */
    const r = await db
      .prepare('UPDATE onboarding_applications SET profile = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND revision = ?')
      .run(JSON.stringify(profile), Date.now(), a.id, rev)
    if (!r.changes) {
      const now = (await appOf(m.id))!
      return res.status(409).json({ error: 'Updated somewhere else.', revision: now.revision, profile: now.profile })
    }
    const wasComplete = Object.keys(profileProblems(a.profile)).length === 0
    const isComplete = Object.keys(profileProblems(profile)).length === 0
    if (!wasComplete && isComplete) await event(a.id, `member:${m.id}`, 'profile_completed')
    res.json({ revision: rev + 1, problems: profileProblems(profile) })
  }))

  app.post('/api/onboarding/me/payouts/link', strict, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    const a = await appOf(m.id)
    if (!a) return res.status(404).json({ error: 'No application yet.' })
    if (a.status !== 'in_progress' && a.status !== 'changes_requested' && a.status !== 'submitted' && a.status !== 'approved') {
      return res.status(409).json({ error: 'Your application is closed.' })
    }
    try {
      const base = `${site(req)}/join`
      const { accountRef, url } = await providers.payoutLink({
        accountRef: a.payout_ref,
        email: a.profile.email || m.email,
        business: a.profile.kind === 'business',
        returnUrl: `${base}?payouts=return`,
        refreshUrl: `${base}?payouts=refresh`,
      })
      if (accountRef !== a.payout_ref) {
        await db.prepare('UPDATE onboarding_applications SET payout_ref = ?, updated_at = ? WHERE id = ?').run(accountRef, Date.now(), a.id)
        await event(a.id, `member:${m.id}`, 'payouts_started')
      }
      res.json({ url })
    } catch (err) {
      if (err instanceof ProviderOff) return res.status(503).json({ error: 'Payout setup isn’t open yet.', code: 'not_configured' })
      throw err
    }
  }))

  app.post('/api/onboarding/me/agreement/sign', strict, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    const a = await appOf(m.id)
    if (!a) return res.status(404).json({ error: 'No application yet.' })
    /* Submitted is allowed: an affiliate who sent their application before signing opened signs afterwards. */
    if (a.status !== 'in_progress' && a.status !== 'changes_requested' && a.status !== 'submitted') return res.status(409).json({ error: 'Your application is closed.' })
    if (Object.keys(profileProblems(a.profile)).length) return res.status(409).json({ error: 'Finish your information first; the agreement is filled in from it.' })
    let doc = await refreshDoc((await latestDoc(a.id)) ?? null, true)
    if (providers.signing === 'manual') {
      const requested = await requestManualPacket(a, `member:${m.id}`)
      doc = requested.doc
      if (doc.provider !== 'manual') return res.status(409).json({ error: 'This packet needs BEASTY to review its signing setup.' })
      if (doc.affiliate_signed_at) return res.status(409).json({ error: 'Your signature has already been verified.' })
      if (doc.affiliate_url) return res.json({ url: doc.affiliate_url })
      if (requested.created) void deps.sendEmail(deps.leadEmail, 'BEASTY affiliate forms requested',
        `An affiliate has requested their forms. Create their approved packet in DocuSeal, then attach its private signing link in CRM under People → Affiliates.\n\nApplication: ${a.id}`)
      return res.json({ requested: true })
    }
    if (doc && (doc.status === 'pending_signature') && doc.affiliate_url) return res.json({ url: doc.affiliate_url })
    if (doc && (doc.status === 'pending_countersignature' || doc.status === 'completed')) return res.status(409).json({ error: 'You’ve already signed.' })
    try {
      const p = a.profile
      const name = `${p.legalFirst ?? ''} ${p.legalLast ?? ''}`.trim()
      const created = await providers.createAgreement({
        applicationId: a.id,
        name,
        email: p.email || m.email,
        returnUrl: `${site(req)}/join?agreement=return`,
        prefill: onboardingPrefill(p),
      })
      const now = Date.now()
      const id = newId('doc')
      await db
        .prepare(`INSERT INTO onboarding_documents (id, application_id, category, template_version, provider, provider_ref, status, affiliate_url, company_url, created_at, updated_at)
                  VALUES (?, ?, 'affiliate_agreement', ?, ?, ?, 'pending_signature', ?, ?, ?, ?)`)
        .run(id, a.id, process.env.DOCUSEAL_AFFILIATE_TEMPLATE_ID ?? 'test', providers.signing, created.submissionRef, created.affiliateUrl, created.companyUrl, now, now)
      await event(a.id, `member:${m.id}`, 'agreement_sent')
      doc = await latestDoc(a.id) ?? null
      res.json({ url: created.affiliateUrl })
    } catch (err) {
      if (err instanceof ProviderOff) return res.status(503).json({ error: 'The agreement isn’t ready to sign yet.', code: 'not_configured' })
      throw err
    }
  }))

  app.post('/api/onboarding/me/agreement/review', strict, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    const a = await appOf(m.id)
    if (!a) return res.status(404).json({ error: 'No application yet.' })
    if (!['in_progress', 'changes_requested', 'submitted'].includes(a.status)) return res.status(409).json({ error: 'Your application is closed.' })
    const d = await latestDoc(a.id)
    if (providers.signing !== 'manual' || d?.provider !== 'manual' || !d.affiliate_url) return res.status(409).json({ error: 'BEASTY has not attached your signing request yet.' })
    const now = Date.now()
    const updated = await db.prepare(`UPDATE onboarding_documents SET review_requested_at = ?, status = 'pending_review', updated_at = ?
      WHERE id = ? AND status IN ('pending_signature', 'pending_review') AND review_requested_at IS NULL AND affiliate_signed_at IS NULL`).run(now, now, d.id)
    if (updated.changes) {
      await event(a.id, `member:${m.id}`, 'packet_review_requested')
      void deps.sendEmail(deps.leadEmail, 'BEASTY affiliate packet ready for review',
        `An affiliate reports they finished their packet. Check their signatures, W-9, bank form and ID inside DocuSeal before recording verification in CRM.\n\nApplication: ${a.id}`)
    }
    res.json(bundle(a, await latestDoc(a.id)))
  }))

  app.post('/api/onboarding/me/submit', strict, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    let a = await appOf(m.id)
    if (!a) return res.status(404).json({ error: 'No application yet.' })
    if (a.status !== 'in_progress' && a.status !== 'changes_requested') return res.status(409).json({ error: 'Already submitted.' })
    a = await refreshPayouts(a, true)
    let d = await refreshDoc((await latestDoc(a.id)) ?? null, true)
    const s = stepsOf(a, d, providers)
    /* A step whose service is not switched on yet (Stripe Connect, DocuSeal) cannot be
       finished, so it does not hold the application back: the affiliate sends what they
       can, BEASTY receives it, and the step is done after submitting once it opens.
       Approval still needs the agreement signed by both (the decision route). */
    const missing = [
      !s.profile.complete && 'your information',
      s.payouts.available && !s.payouts.complete && 'payout setup',
      providers.signing !== 'manual' && s.agreement.available && !s.agreement.affiliateSigned && 'the signed agreement',
    ].filter(Boolean)
    if (missing.length) return res.status(409).json({ error: `Still needed: ${missing.join(', ')}.`, steps: s })
    if (providers.signing === 'manual') d = (await requestManualPacket(a, `member:${m.id}`)).doc
    /* Only steps that exist: with payouts off there is no payout step to come, and
       the agreement step is the whole packet of forms. */
    const later = [
      s.payouts.available && !s.payouts.complete && 'payout setup',
      !s.agreement.affiliateSigned && (s.payouts.available ? 'the agreement' : 'your forms and agreement'),
    ].filter(Boolean) as string[]
    const many = later.length > 1 || later[0] === 'your forms and agreement'
    const now = Date.now()
    const submitted = await db.prepare("UPDATE onboarding_applications SET status = 'submitted', submitted_at = ?, updated_at = ? WHERE id = ? AND status IN ('in_progress', 'changes_requested')").run(now, now, a.id)
    if (!submitted.changes) return res.status(409).json({ error: 'Already submitted.' })
    await event(a.id, `member:${m.id}`, a.status === 'changes_requested' ? 'resubmitted' : 'submitted')
    const name = `${a.profile.legalFirst ?? ''} ${a.profile.legalLast ?? ''}`.trim()
    const contact = [a.profile.email, a.profile.phone].filter(Boolean).join(' · ')
    void deps.sendEmail(
      deps.leadEmail,
      `New affiliate application: ${name}`,
      `${name} has submitted their BEASTY affiliate application.\n\n${contact}\n${[a.profile.city, a.profile.state].filter(Boolean).join(', ')}\n${later.length ? `\nStill needed: ${later.join(' and ')}.\n` : ''}\nReview it in the CRM under People → Affiliates.`,
    )
    void deps.sendEmail(
      a.profile.email,
      'Your BEASTY affiliate application is in',
      `Hi ${a.profile.preferredName || a.profile.legalFirst || ''},\n\nThanks for applying to the BEASTY affiliate program. We have your application and will let you know when it's reviewed.${later.length ? providers.signing === 'manual' ? `\n\nBEASTY will prepare your forms on DocuSeal. We will email you when they are ready. Complete them and request review at ${site(req)}/join.` : `\n\nOne more thing to come: ${later.join(' and ')} ${many ? 'open' : 'opens'} soon, and you'll finish ${many ? 'them' : 'it'} at ${site(req)}/join.` : ''}\n\nYou can check where it stands any time at ${site(req)}/join.\n\nBEASTY Pages`,
    )
    a = (await appOf(m.id))!
    res.json(bundle(a, d))
  }))

  /* ---- signed agreement, for the affiliate ---- */

  app.get('/api/onboarding/me/agreement.pdf', strict, asyncH(async (req, res) => {
    const m = await member(req, res)
    if (!m) return
    const a = await appOf(m.id)
    const d = a ? await latestDoc(a.id) : null
    if (!a || !d || d.status !== 'completed' || providers.signing === 'off') return res.status(404).json({ error: 'No signed agreement yet.' })
    if (d.provider === 'manual') return res.redirect(302, d.affiliate_url)
    const st = await providers.signingState(d.provider_ref)
    if (!st.documentUrls[0]) return res.status(404).json({ error: 'No signed agreement yet.' })
    res.redirect(302, st.documentUrls[0])
  }))

  /* ---- test mode: stand-ins for Stripe's and DocuSeal's hosted pages ---- */

  if (providers.payouts === 'mock' || providers.signing === 'mock') {
    app.post('/api/onboarding/me/mock/payouts', strict, asyncH(async (req, res) => {
      const m = await member(req, res)
      if (!m) return
      const a = await appOf(m.id)
      if (!a?.payout_ref || !mockControls.completePayouts(a.payout_ref)) return res.status(404).json({ error: 'Start payout setup first.' })
      await refreshPayouts(a, true)
      res.json({ ok: true })
    }))
    app.post('/api/onboarding/me/mock/sign', strict, asyncH(async (req, res) => {
      const m = await member(req, res)
      if (!m) return
      const a = await appOf(m.id)
      const d = a ? await latestDoc(a.id) : null
      if (!a || !d || !mockControls.sign(d.provider_ref, 'affiliate')) return res.status(404).json({ error: 'Open the agreement first.' })
      await refreshDoc(d, true)
      res.json({ ok: true })
    }))
  }

  /* ---- DocuSeal webhook: verified, idempotent, then reconciled from the API ---- */

  app.post('/api/onboarding/webhooks/docuseal', deps.rateLimiter(120, 40), asyncH(async (req, res) => {
    const secret = (process.env.DOCUSEAL_WEBHOOK_SECRET ?? '').trim()
    const header = (process.env.DOCUSEAL_WEBHOOK_HEADER ?? 'x-beasty-webhook-secret').toLowerCase()
    const sent = String(req.get(header) ?? '')
    const ok = secret.length >= 16 && sent.length === secret.length && timingSafeEqual(Buffer.from(sent), Buffer.from(secret))
    if (!ok) return res.status(401).json({ error: 'Bad signature.' })
    const body = req.body as { event_type?: string; timestamp?: string; data?: { id?: number; submission_id?: number; submission?: { id?: number }; status?: string } }
    const subId = String(body?.data?.submission_id ?? body?.data?.submission?.id ?? (body?.event_type?.startsWith('submission') ? body?.data?.id : '') ?? '')
    if (!subId) return res.json({ ok: true, ignored: true })
    const key = `${body.event_type ?? 'event'}:${body.data?.id ?? subId}:${body.timestamp ?? ''}`
    const fresh = await db
      .prepare('INSERT INTO onboarding_webhook_events (provider, event_key, received_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING')
      .run('docuseal', key.slice(0, 200), Date.now())
    if (!fresh.changes) return res.json({ ok: true, duplicate: true })
    const doc = await db.prepare("SELECT * FROM onboarding_documents WHERE provider = 'live' AND provider_ref = ?").get<DocRow>(subId)
    if (doc) await refreshDoc(doc, true)
    res.json({ ok: true })
  }))

  /* ================================================================ CRM ==== */

  const team = requireCrm(deps.crm, 'team')
  const admin = requireCrm(deps.crm, 'admin')
  const crmRead = deps.rateLimiter(600, 120)
  const crmWrite = deps.rateLimiter(120, 30)

  app.get('/api/crm/onboarding', crmRead, team, asyncH(async (req, res) => {
    const status = String(req.query.status ?? '')
    const q = String(req.query.q ?? '').trim().toLowerCase().slice(0, 80)
    const rows = await db
      .prepare(`SELECT a.*, (SELECT status FROM onboarding_documents d WHERE d.application_id = a.id ORDER BY created_at DESC LIMIT 1) AS doc_status
                FROM onboarding_applications a ORDER BY a.updated_at DESC LIMIT 500`)
      .all<AppRow & { doc_status: string | null }>()
    const counts: Record<string, number> = {}
    for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1
    const shaped = rows
      .filter((r) => !status || r.status === status)
      .filter((r) => !q || `${r.profile.legalFirst ?? ''} ${r.profile.legalLast ?? ''} ${r.profile.email ?? ''} ${r.profile.businessName ?? ''}`.toLowerCase().includes(q))
      .map((r) => ({
        id: r.id,
        name: `${r.profile.legalFirst ?? ''} ${r.profile.legalLast ?? ''}`.trim() || '(not given yet)',
        email: r.profile.email ?? '',
        business: r.profile.kind === 'business' ? r.profile.businessName ?? '' : '',
        status: r.status,
        profileComplete: Object.keys(profileProblems(r.profile)).length === 0,
        payouts: r.payout_state?.payoutsEnabled && r.payout_state?.detailsSubmitted ? 'complete' : r.payout_ref ? 'started' : 'not_started',
        agreement: r.doc_status ?? 'not_started',
        submittedAt: r.submitted_at,
        updatedAt: r.updated_at,
      }))
    const invites = await db
      .prepare('SELECT id, email, name, created_at, expires_at, redeemed_at, revoked_at, sent_count FROM onboarding_invites ORDER BY created_at DESC LIMIT 200')
      .all<{ id: string; email: string; name: string; created_at: number; expires_at: number; redeemed_at: number | null; revoked_at: number | null; sent_count: number }>()
    res.json({
      providers: { payouts: providers.payouts, signing: providers.signing },
      counts,
      total: rows.length,
      applications: shaped,
      invites: invites.map((i) => ({
        ...i,
        state: i.revoked_at ? 'revoked' : i.redeemed_at ? 'redeemed' : i.expires_at < Date.now() ? 'expired' : 'open',
      })),
    })
  }))

  app.get('/api/crm/onboarding/:id', crmRead, team, asyncH(async (req, res) => {
    let a = await db.prepare('SELECT * FROM onboarding_applications WHERE id = ?').get<AppRow>(String(req.params.id))
    if (!a) return res.status(404).json({ error: 'No such application.' })
    a = await refreshPayouts(a)
    const d = await refreshDoc((await latestDoc(a.id)) ?? null)
    /* Opening a record is itself on the record, once per ten minutes per person. */
    const lastView = await db
      .prepare("SELECT created_at FROM onboarding_events WHERE application_id = ? AND kind = 'admin_viewed' AND actor = ? ORDER BY created_at DESC LIMIT 1")
      .get<{ created_at: number }>(a.id, req.crm!.actor)
    if (!lastView || Date.now() - lastView.created_at > 10 * 60_000) await event(a.id, req.crm!.actor, 'admin_viewed')
    const events = await db
      .prepare('SELECT actor, kind, detail, created_at FROM onboarding_events WHERE application_id = ? ORDER BY created_at ASC, id ASC LIMIT 300')
      .all<{ actor: string; kind: string; detail: Record<string, unknown>; created_at: number }>(a.id)
    const memberRow = await db.prepare('SELECT name, referral_code, created_at FROM members WHERE id = ?').get<{ name: string; referral_code: string; created_at: number }>(a.member_id)
    res.json({
      ...bundle(a, d),
      decisionNote: a.decision_note,
      member: memberRow ? { name: memberRow.name, code: memberRow.referral_code, joinedAt: memberRow.created_at } : null,
      payoutState: a.payout_state ? { ...a.payout_state, accountRef: undefined } : null,
      events,
      manualPacket: providers.signing === 'manual' && req.crm!.role === 'admin' ? {
        revision: d?.manual_revision ?? 0,
        submissionUrl: d?.submission_url ?? '',
        affiliateUrl: d?.affiliate_url ?? '',
        companyUrl: d?.company_url ?? '',
        evidence: d?.manual_evidence ?? {},
        verifiedBy: d?.verified_by ?? null,
        checkedAt: d?.checked_at ?? null,
        approvedTemplateUrl: approvedManualTemplate() ? `https://docuseal.com/templates/${approvedManualTemplate()}` : null,
      } : null,
      countersignAvailable: !!d && d.status === 'pending_countersignature' && (providers.signing === 'mock' || !!d.company_url || !!d.submission_url),
    })
  }))

  app.post('/api/crm/onboarding/invites', crmWrite, admin, asyncH(async (req, res) => {
    const b = (req.body ?? {}) as { email?: unknown; name?: unknown; note?: unknown }
    const email = String(b.email ?? '').trim().toLowerCase().slice(0, 120)
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'An email address, please.' })
    const name = String(b.name ?? '').trim().slice(0, 80)
    const note = String(b.note ?? '').trim().slice(0, 300)
    const token = randomBytes(24).toString('base64url')
    const id = newId('inv')
    const now = Date.now()
    await db
      .prepare('INSERT INTO onboarding_invites (id, token_hash, email, name, note, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, sha(token), email, name, note, req.crm!.actor, now, now + INVITE_DAYS * 86_400_000)
    await event(null, req.crm!.actor, 'invited', { email }, id)
    const link = `${site(req)}/join/${token}`
    const emailStatus = await deps.sendEmail(email, 'You’re invited to the BEASTY affiliate program', `${name ? `Hi ${name},\n\n` : ''}You've been invited to join the BEASTY affiliate program.\n\nStart here (the link is just for you and works for ${INVITE_DAYS} days):\n${link}\n\nBEASTY Pages`)
    res.status(201).json({ id, link, expiresAt: now + INVITE_DAYS * 86_400_000, emailStatus })
  }))

  app.post('/api/crm/onboarding/invites/:id/resend', crmWrite, admin, asyncH(async (req, res) => {
    const inv = await db.prepare('SELECT * FROM onboarding_invites WHERE id = ?').get<{ id: string; email: string; name: string; redeemed_at: number | null; revoked_at: number | null }>(String(req.params.id))
    if (!inv) return res.status(404).json({ error: 'No such invite.' })
    if (inv.redeemed_at) return res.status(409).json({ error: 'Already used; they can sign in at /join.' })
    /* A fresh token: the old link stops working the moment a new one exists. */
    const token = randomBytes(24).toString('base64url')
    const now = Date.now()
    await db
      .prepare('UPDATE onboarding_invites SET token_hash = ?, expires_at = ?, revoked_at = NULL, sent_count = sent_count + 1 WHERE id = ?')
      .run(sha(token), now + INVITE_DAYS * 86_400_000, inv.id)
    await event(null, req.crm!.actor, 'invite_resent', { email: inv.email }, inv.id)
    const link = `${site(req)}/join/${token}`
    const emailStatus = await deps.sendEmail(inv.email, 'Your BEASTY affiliate invite', `${inv.name ? `Hi ${inv.name},\n\n` : ''}Here's a fresh link to join the BEASTY affiliate program:\n${link}\n\nBEASTY Pages`)
    res.json({ link, emailStatus })
  }))

  app.post('/api/crm/onboarding/invites/:id/revoke', crmWrite, admin, asyncH(async (req, res) => {
    const r = await db.prepare('UPDATE onboarding_invites SET revoked_at = ? WHERE id = ? AND redeemed_at IS NULL AND revoked_at IS NULL').run(Date.now(), String(req.params.id))
    if (!r.changes) return res.status(409).json({ error: 'Already used or cancelled.' })
    await event(null, req.crm!.actor, 'invite_revoked', {}, String(req.params.id))
    res.json({ ok: true })
  }))

  app.post('/api/crm/onboarding/:id/countersign', crmWrite, admin, asyncH(async (req, res) => {
    const a = await db.prepare('SELECT * FROM onboarding_applications WHERE id = ?').get<AppRow>(String(req.params.id))
    if (!a) return res.status(404).json({ error: 'No such application.' })
    const d = await refreshDoc((await latestDoc(a.id)) ?? null, true)
    if (!d || d.status !== 'pending_countersignature') return res.status(409).json({ error: 'Nothing to countersign yet.' })
    if (providers.signing === 'mock') {
      mockControls.sign(d.provider_ref, 'company')
      await refreshDoc(d, true)
      return res.json({ ok: true })
    }
    const url = d.company_url || (d.provider === 'manual' ? d.submission_url : '')
    if (!url) return res.status(409).json({ error: 'Countersign it in DocuSeal.' })
    res.json({ url })
  }))

  /* Free plan: the admin creates a request in DocuSeal's dashboard. Links and
     review flags are the only data stored here; no vendor API or file fetch. */
  app.post('/api/crm/onboarding/:id/packet', crmWrite, admin, asyncH(async (req, res) => {
    if (providers.signing !== 'manual') return res.status(409).json({ error: 'Manual signing is not enabled.' })
    const template = approvedManualTemplate()
    if (!template) return res.status(503).json({ error: 'Finalize and approve the agreement with Glenn before linking applicant packets.' })
    const b = (req.body ?? {}) as Record<string, unknown>
    if (b.templateVersion !== template) return res.status(409).json({ error: 'Use the approved DocuSeal template shown in CRM.' })
    if (b.termsApproved !== true || b.recipientConfirmed !== true) return res.status(400).json({ error: 'Confirm approved terms and the correct applicant and signer roles.' })
    const submissionUrl = docusealLink(b.submissionUrl, 'submission')
    const affiliateUrl = docusealLink(b.affiliateUrl, 'signer')
    const companyUrl = b.companyUrl === '' || b.companyUrl == null ? '' : docusealLink(b.companyUrl, 'signer')
    if (!submissionUrl || !affiliateUrl || companyUrl === null || affiliateUrl === companyUrl) return res.status(400).json({ error: 'Use separate, private DocuSeal signing links and the request’s DocuSeal dashboard address.' })
    if (!Number.isInteger(b.revision) || Number(b.revision) < 0) return res.status(400).json({ error: 'Missing packet revision. Refresh the record.' })
    let outcome
    try {
      outcome = await db.transaction(async () => {
        const a = await db.prepare('SELECT * FROM onboarding_applications WHERE id = ? FOR UPDATE').get<AppRow>(String(req.params.id))
        if (!a) return { error: 'No such application.', status: 404 }
        if (!['in_progress', 'submitted', 'changes_requested'].includes(a.status)) return { error: 'This application is closed; its packet cannot be replaced.', status: 409 }
        if (Object.keys(profileProblems(a.profile)).length) return { error: 'The applicant must finish their details first.', status: 409 }
        const d = await latestDoc(a.id)
        if (d && d.provider !== 'manual') return { error: 'This application has an API signing packet. Review its setup first.', status: 409 }
        if ((d?.manual_revision ?? 0) !== b.revision) return { error: 'The packet changed elsewhere. Refresh before saving.', status: 409 }
        if (d?.provider_ref === submissionUrl.split('/').pop()) return { error: 'This request is already attached. Create a new request to replace it.', status: 409 }
        if (d?.affiliate_signed_at && b.replaceVerified !== true) return { error: 'Confirm that replacing this packet requires new signatures and review.', status: 409 }
        const now = Math.max(Date.now(), (d?.created_at ?? 0) + 1)
        /* Which Schedule A figures this packet went out with (server/affiliate-terms.ts). */
        const terms = await termsForApplication(a.id)
        const snapshot = terms ? { version: terms.version, code: terms.code } : null
        if (d) await db.prepare("UPDATE onboarding_documents SET status = 'superseded', updated_at = ? WHERE id = ?").run(now, d.id)
        await db.prepare(`INSERT INTO onboarding_documents
          (id, application_id, category, template_version, provider, provider_ref, status,
           affiliate_url, company_url, submission_url, manual_revision, terms_snapshot, created_at, updated_at)
          VALUES (?, ?, 'affiliate_agreement', ?, 'manual', ?, 'pending_signature', ?, ?, ?, ?, ?, ?, ?)`)
          .run(newId('doc'), a.id, template, submissionUrl.split('/').pop(), affiliateUrl, companyUrl, submissionUrl, (d?.manual_revision ?? 0) + 1, snapshot ? JSON.stringify(snapshot) : null, now, now)
        await event(a.id, req.crm!.actor, 'packet_linked', { templateVersion: template, replaced: !!d?.provider_ref, ...(snapshot ? { termsCode: snapshot.code } : {}) })
        await db.prepare('UPDATE onboarding_applications SET updated_at = ? WHERE id = ?').run(now, a.id)
        return { application: a }
      })()
    } catch (err) {
      if ((err as { code?: string }).code === '23505') return res.status(409).json({ error: 'This DocuSeal request is already attached to an application.' })
      throw err
    }
    if (outcome.error) return res.status(outcome.status!).json({ error: outcome.error })
    const a = outcome.application!
    const emailStatus = await deps.sendEmail(a.profile.email, 'Your BEASTY forms are ready',
      `Hi ${a.profile.preferredName || a.profile.legalFirst || ''},\n\nYour forms are ready. Open ${site(req)}/join, complete your W-9 and bank form, upload your ID on DocuSeal and sign the agreement. Then return to BEASTY and request review.\n\nDo not email taxpayer numbers, bank details or ID photos.\n\nBEASTY Pages`)
    res.json({ ok: true, emailStatus })
  }))

  app.post('/api/crm/onboarding/:id/packet/verify', crmWrite, admin, asyncH(async (req, res) => {
    if (providers.signing !== 'manual') return res.status(409).json({ error: 'Manual signing is not enabled.' })
    const b = (req.body ?? {}) as Record<string, unknown>
    const evidence = manualEvidence(b)
    if (!evidence) return res.status(400).json({ error: 'Check the applicant’s signature, W-9, bank form, ID upload and audit trail in DocuSeal first.' })
    if (!Number.isInteger(b.revision)) return res.status(400).json({ error: 'Missing packet revision. Refresh the record.' })
    const outcome = await db.transaction(async () => {
      const a = await db.prepare('SELECT * FROM onboarding_applications WHERE id = ? FOR UPDATE').get<AppRow>(String(req.params.id))
      if (!a) return { error: 'No such application.', status: 404 }
      if (!['in_progress', 'submitted', 'changes_requested'].includes(a.status)) return { error: 'This application is closed.', status: 409 }
      const d = await latestDoc(a.id)
      if (d?.provider !== 'manual' || !d.submission_url || !d.affiliate_url) return { error: 'Attach the DocuSeal request first.', status: 409 }
      if (d.manual_revision !== b.revision) return { error: 'The packet changed elsewhere. Refresh before recording review.', status: 409 }
      if (d.company_signed_at && !evidence.companySigned) return { error: 'A completed packet cannot lose its countersignature. Replace the packet if it needs correction.', status: 409 }
      if (d.affiliate_signed_at && !!d.company_signed_at === evidence.companySigned) return { application: a, changed: false }
      const now = Date.now()
      await db.prepare(`UPDATE onboarding_documents SET status = ?, affiliate_signed_at = ?, company_signed_at = ?, completed_at = ?,
        checked_at = ?, manual_revision = manual_revision + 1, manual_evidence = ?, verified_by = ?, updated_at = ? WHERE id = ?`)
        .run(evidence.companySigned ? 'completed' : 'pending_countersignature', d.affiliate_signed_at ?? now,
          evidence.companySigned ? d.company_signed_at ?? now : null, evidence.companySigned ? now : null,
          now, JSON.stringify(evidence), req.crm!.actor, now, d.id)
      await event(a.id, req.crm!.actor, 'packet_verified', { ...evidence, source: 'operator_review' })
      await db.prepare('UPDATE onboarding_applications SET updated_at = ? WHERE id = ?').run(now, a.id)
      return { application: a, changed: true }
    })()
    if (outcome.error) return res.status(outcome.status!).json({ error: outcome.error })
    const a = outcome.application!
    const emailStatus = outcome.changed ? await deps.sendEmail(a.profile.email,
      evidence.companySigned ? 'Your BEASTY packet is signed by both parties' : 'Your BEASTY forms have been checked',
      `Hi ${a.profile.preferredName || a.profile.legalFirst || ''},\n\n${evidence.companySigned ? 'BEASTY has checked your packet and both signatures. The completed packet is available from your dashboard.' : 'BEASTY has reviewed your signed forms. Your packet is waiting for BEASTY’s countersignature.'}\n\nCheck your application at ${site(req)}/join.\n\nBEASTY Pages`) : undefined
    res.json({ ok: true, emailStatus })
  }))

  app.post('/api/crm/onboarding/:id/decision', crmWrite, admin, asyncH(async (req, res) => {
    const b = (req.body ?? {}) as { action?: unknown; note?: unknown }
    const action = String(b.action ?? '')
    const note = String(b.note ?? '').trim().slice(0, 600)
    const allowed: Record<string, { from: AppStatus[]; to: AppStatus }> = {
      approve: { from: ['submitted'], to: 'approved' },
      request_changes: { from: ['submitted'], to: 'changes_requested' },
      reject: { from: ['submitted', 'changes_requested'], to: 'rejected' },
      suspend: { from: ['approved'], to: 'suspended' },
      reinstate: { from: ['suspended'], to: 'approved' },
    }
    const outcome = await db.transaction(async () => {
      const a = await db.prepare('SELECT * FROM onboarding_applications WHERE id = ? FOR UPDATE').get<AppRow>(String(req.params.id))
      if (!a) return { error: 'No such application.', code: 404 }
      const rule = allowed[action]
      if (!rule) return { error: 'Unknown action.', code: 400 }
      if (!rule.from.includes(a.status)) return { error: `Can’t ${action.replace('_', ' ')} an application that is ${a.status.replace('_', ' ')}.`, code: 409 }
      const d = await refreshDoc((await latestDoc(a.id)) ?? null, true)
      if (action === 'approve' && d?.status !== 'completed') return { error: 'Countersign the agreement first.', code: 409 }
      if ((action === 'request_changes' || action === 'reject') && !note) return { error: 'Add a note so they know why.', code: 400 }
      const now = Date.now()
      await db
        .prepare('UPDATE onboarding_applications SET status = ?, decided_at = ?, decided_by = ?, decision_note = ?, updated_at = ? WHERE id = ?')
        .run(rule.to, now, req.crm!.actor, note, now, a.id)
      await event(a.id, req.crm!.actor, action === 'approve' ? 'approved' : action === 'request_changes' ? 'changes_requested' : action === 'reject' ? 'rejected' : action === 'suspend' ? 'suspended' : 'reinstated', note ? { note } : {})
      return { application: a, status: rule.to }
    })()
    // Respond and notify only after the transaction has committed.
    if (outcome.error) return res.status(outcome.code!).json({ error: outcome.error })
    const a = outcome.application!
    const first = a.profile.preferredName || a.profile.legalFirst || ''
    const msg: Record<string, [string, string]> = {
      approve: ['You’re approved: welcome to BEASTY', `Hi ${first},\n\nYou're approved as a BEASTY affiliate. Your dashboard is at ${site(req)}/join.\n\nBEASTY Pages`],
      request_changes: ['Your BEASTY application needs a change', `Hi ${first},\n\nWe need a change before we can approve your application:\n\n${note}\n\nUpdate it at ${site(req)}/join.\n\nBEASTY Pages`],
      reject: ['Your BEASTY affiliate application', `Hi ${first},\n\nThanks for applying. We aren't able to approve your application right now.\n\n${note}\n\nBEASTY Pages`],
    }
    if (msg[action]) void deps.sendEmail(a.profile.email, msg[action][0], msg[action][1])
    res.json({ ok: true, status: outcome.status })
  }))
}
