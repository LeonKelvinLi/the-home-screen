/*
  THE AFFILIATE DASHBOARD. Every member is an affiliate: they have had a
  referral code since the day they joined. This module answers "what have I
  brought to BEASTY" from the records the app already keeps, and adds the
  three it did not: a click on a member's link, a flag when someone refers
  themselves, and a ledger for rewards that pay (empty until BEASTY pays).
  The definitions are in docs/AFFILIATE.md; every number here follows them.

    affiliate -> code -> click (referral_clicks) -> sign-up (members.referred_by)
              -> qualified (ACTIVATION, server/analytics.ts)
    affiliate -> business link /r/<slug> -> visit (crm_referral_visits)
              -> Reserve a Spot (crm_opportunities.referrer_id) -> won
    either    -> reward (raffle_tickets today; affiliate_rewards when cash starts)

  Nothing here is invented: a number that is not recorded is shown as not
  recorded, and a reward that is not switched on says so.
*/
import type { Express, Request, RequestHandler, Response } from 'express'
import { randomBytes } from 'node:crypto'
import { db } from './db/schema'
import { ACTIVATION } from './analytics'
import { STAGES } from '../src/crm/model'
import { BRANDS } from '../src/data/brands'
import { CITY_PLACEMENTS } from '../src/data/placements'
import { DISCOUNT_PER_MILESTONE, PER_MILESTONE_REFERRALS, TIERS, rewardsFor } from '../src/data/membership'

/** Clicks on a member's link are counted from the day this shipped; before it nothing was recorded. */
export const CLICKS_COUNTED_FROM = Date.UTC(2026, 8, 30, 7) // 30 September 2026, midnight in California

const DAY = 24 * 60 * 60 * 1000
const CODE = /^[0-9A-Z]{4,16}$/

export const WINDOWS = [
  { key: '7d', days: 7, label: '7D' },
  { key: '30d', days: 30, label: '30D' },
  { key: '90d', days: 90, label: '90D' },
  { key: 'all', days: 0, label: 'All time' },
] as const
export type WindowKey = (typeof WINDOWS)[number]['key']

const PT = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' })
/** A California calendar day, "2026-09-30": the unit a click is counted in. */
export const ptDay = (ms: number) => PT.format(new Date(ms))

const num = (v: unknown) => (v == null ? 0 : Number(v))
const list = (xs: readonly string[]) => xs.map((x) => `'${x}'`).join(',')

/* ------------------------------------------------------------------ the links */

interface MemberLite {
  id: string
  name: string
  referral_code: string
  tier: string
  tier_status: string
  created_at: number | string
}

/** The CRM person that stands for this member as a business referrer, if one exists yet. */
async function personOf(memberId: string) {
  return db
    .prepare('SELECT id, slug, role FROM crm_people WHERE member_id = ? AND active')
    .get<{ id: string; slug: string; role: string }>(memberId)
}

/**
 * The slug of a member's business link. Their own CRM row's slug when they
 * have one (a partner keeps the link they already print); otherwise their code
 * in lower case, or `m-<code>` if a person somewhere already owns that word.
 * Nothing is written: the row appears on the first real click (ensurePerson).
 */
export async function businessSlug(m: Pick<MemberLite, 'id' | 'referral_code'>): Promise<string> {
  const p = await personOf(m.id)
  if (p) return p.slug
  const plain = m.referral_code.toLowerCase()
  const taken = await db.prepare('SELECT 1 FROM crm_people WHERE slug = ?').get(plain)
  return taken ? `m-${plain}` : plain
}

/**
 * /r/<slug> for a member who has no CRM row yet: find them by the code in the
 * slug and make the row, role "none" (it grants nothing in the CRM), so the
 * visit and the Reserve a Spot request that follows are credited to them the
 * way every referrer's are. Returns the person id, or null for no such member.
 */
export async function ensurePerson(slug: string): Promise<string | null> {
  const m = /^(?:m-)?([a-z2-9]{4,16})$/.exec(slug)
  if (!m) return null
  const member = await db
    .prepare('SELECT id, name, referral_code FROM members WHERE referral_code = ?')
    .get<{ id: string; name: string; referral_code: string }>(m[1].toUpperCase())
  if (!member) return null
  const existing = await personOf(member.id)
  if (existing) return existing.id
  const now = Date.now()
  await db
    .prepare(
      `INSERT INTO crm_people (id, slug, name, source_type, role, is_team, member_id, active, created_at, updated_at, created_by)
       VALUES (?,?,?,'member','none',FALSE,?,TRUE,?,?,'system:affiliate')
       ON CONFLICT DO NOTHING`,
    )
    .run(`p_${randomBytes(6).toString('hex')}`, slug, shortName(member.name), member.id, now, now)
  return (await personOf(member.id))?.id ?? null
}

/* ------------------------------------------------------------------ the guards */

/**
 * The same device the referrer signed in on. A sign-up there with their code
 * is them making a second account, or someone at their elbow; either way it
 * earns nothing, and the attempt is kept for the admin to see.
 */
export async function isOwnDevice(visitor: string | null, memberId: string): Promise<boolean> {
  if (!visitor) return false
  const row = await db
    .prepare('SELECT 1 FROM analytics_visitors WHERE anon_id = ? AND member_id = ?')
    .get(visitor, memberId)
  return !!row
}

export async function flagReferral(memberId: string, kind: 'self_signup', detail: Record<string, unknown>) {
  await db
    .prepare('INSERT INTO referral_flags (id, member_id, kind, detail, created_at) VALUES (?,?,?,?::jsonb,?)')
    .run(`rf_${randomBytes(8).toString('hex')}`, memberId, kind, JSON.stringify(detail), Date.now())
}

/**
 * A click: one device opening a member's ?ref= link, counted once per device
 * per California day. Not counted: crawlers, a browser asking not to be
 * tracked (no device to count), a signed-in member, and the owner's own
 * devices. Returns whether a new click was recorded.
 */
export async function recordClick(opts: {
  code: string
  visitor: string | null
  signedIn: boolean
  landing?: string
  now?: number
}): Promise<boolean> {
  const code = String(opts.code ?? '').trim().toUpperCase()
  if (!CODE.test(code) || !opts.visitor || opts.signedIn) return false
  const owner = await db.prepare('SELECT id FROM members WHERE referral_code = ?').get<{ id: string }>(code)
  if (!owner) return false
  if (await isOwnDevice(opts.visitor, owner.id)) return false
  const now = opts.now ?? Date.now()
  const r = await db
    .prepare(
      `INSERT INTO referral_clicks (member_id, visitor, day, landing, created_at) VALUES (?,?,?,?,?)
       ON CONFLICT (member_id, visitor, day) DO NOTHING`,
    )
    .run(owner.id, opts.visitor, ptDay(now), String(opts.landing ?? '').slice(0, 80) || null, now)
  return (r.changes ?? 0) > 0
}

/* ------------------------------------------------------------------ the numbers */

const CORE = list(ACTIVATION.events)

/**
 * When a member first did one of the things that make them "activated"
 * (server/analytics.ts ACTIVATION, the same test the CRM uses). Null if never.
 */
const QUALIFIED_AT = `LEAST(
  (SELECT MIN(e.occurred_at) FROM analytics_events e WHERE e.member_id = m.id AND e.name IN (${CORE})),
  (SELECT MIN(s.created_at) FROM brand_signals s WHERE s.member_id = m.id),
  (SELECT MIN(o.created_at) FROM orders o WHERE o.member_id = m.id),
  (SELECT MIN(p.created_at) FROM pass_scans p WHERE p.member_id = m.id),
  (SELECT MIN(f.created_at) FROM members f WHERE f.referred_by = m.id)
)`

const STAGE = new Map(STAGES.map((s) => [s.key as string, s]))

/** What the affiliate is told about a business's progress: plain words, no pipeline jargon. */
export function businessStatus(stage: string): { label: string; bucket: 'pending' | 'converted' | 'closed' } {
  const s = STAGE.get(stage)
  if (!s) return { label: 'Received', bucket: 'pending' }
  if (s.group === 'won') return { label: stage === 'active_customer' ? 'Active customer' : 'Signed with BEASTY', bucket: 'converted' }
  if (s.group === 'closed') return { label: 'Closed', bucket: 'closed' }
  if (s.rank >= 4) return { label: 'Interested', bucket: 'pending' }
  if (s.rank >= 2) return { label: 'In talks', bucket: 'pending' }
  return { label: 'Received', bucket: 'pending' }
}

const SEATED = new Set(Object.values(CITY_PLACEMENTS as Record<string, string>))
const BRAND = new Map(BRANDS.map((b) => [b.id, b]))

/** A first letter and dots: enough to tell two friends apart, nothing to find them by. */
export const maskName = (name: string) => {
  const first = String(name ?? '').trim().charAt(0).toUpperCase()
  return first ? `${first}•••` : 'Member'
}

const shortName = (full: string) => {
  const parts = String(full || 'Member').trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return parts[0] || 'Member'
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

interface Referred {
  id: string
  name: string
  created_at: number
  qualified_at: number | null
}

interface BizRow {
  id: string
  business_name: string
  city: string | null
  brand_id: string | null
  stage: string
  referred_at: number
  won_at: number | null
  deal_status: string | null
  sold_cents: number | null
  monthly_cents: number | null
}

export interface Bucket {
  key: string
  label: string
  clicks: number
  joined: number
  qualified: number
  businesses: number
}

/** Day buckets for a window, or weeks/months for "all time", oldest first. */
function buckets(days: number, sinceAll: number, now: number): { key: string; label: string; start: number }[] {
  const out: { key: string; label: string; start: number }[] = []
  if (days > 0) {
    for (let i = days - 1; i >= 0; i--) {
      const t = now - i * DAY
      const key = ptDay(t)
      out.push({ key, label: key.slice(5).replace('-', '/'), start: t })
    }
    return out
  }
  const span = Math.max(1, Math.ceil((now - sinceAll) / DAY))
  const step = span > 26 * 7 ? 30 : 7
  const n = Math.min(26, Math.max(1, Math.ceil(span / step)))
  for (let i = n - 1; i >= 0; i--) {
    const t = now - i * step * DAY
    out.push({ key: `b${n - 1 - i}`, label: ptDay(t - (step - 1) * DAY).slice(5).replace('-', '/'), start: t - step * DAY })
  }
  return out
}

/** The whole dashboard for one member. */
export async function affiliateStats(m: MemberLite, origin: string, now = Date.now()) {
  const memberSince = num(m.created_at)
  const person = await personOf(m.id)
  const slug = await businessSlug(m)

  const referred = (
    await db
      .prepare(
        `SELECT m.id, m.name, m.created_at, ${QUALIFIED_AT} AS qualified_at
         FROM members m WHERE m.referred_by = ? ORDER BY m.created_at ASC LIMIT 2000`,
      )
      .all<Referred>(m.id)
  ).map((r) => ({ ...r, created_at: num(r.created_at), qualified_at: r.qualified_at == null ? null : num(r.qualified_at) }))

  const clickDays = (
    await db
      .prepare('SELECT day, COUNT(*) AS n, MIN(created_at) AS first FROM referral_clicks WHERE member_id = ? GROUP BY day')
      .all<{ day: string; n: number; first: number }>(m.id)
  ).map((r) => ({ day: r.day, n: num(r.n), first: num(r.first) }))

  const bizClickDays = person
    ? (
        await db
          .prepare(
            `SELECT day, COUNT(*) AS n, MIN(created_at) AS first FROM (
               SELECT DISTINCT visitor, to_char(to_timestamp(created_at / 1000.0) AT TIME ZONE 'America/Los_Angeles', 'YYYY-MM-DD') AS day,
                      MIN(created_at) OVER (PARTITION BY visitor, to_char(to_timestamp(created_at / 1000.0) AT TIME ZONE 'America/Los_Angeles', 'YYYY-MM-DD')) AS created_at
               FROM crm_referral_visits WHERE person_id = ?
             ) v GROUP BY day`,
          )
          .all<{ day: string; n: number; first: number }>(person.id)
      ).map((r) => ({ day: r.day, n: num(r.n), first: num(r.first) }))
    : []

  const biz = person
    ? (
        await db
          .prepare(
            `SELECT o.id, o.business_name, o.city, o.brand_id, o.stage,
                    COALESCE(o.referred_at, o.created_at) AS referred_at, o.won_at,
                    d.status AS deal_status, d.sold_cents, d.monthly_cents
             FROM crm_opportunities o
             LEFT JOIN LATERAL (
               SELECT status, sold_cents, monthly_cents FROM crm_deals
               WHERE opportunity_id = o.id ORDER BY (status = 'won') DESC, created_at DESC LIMIT 1
             ) d ON TRUE
             WHERE o.referrer_id = ?
             ORDER BY COALESCE(o.referred_at, o.created_at) DESC LIMIT 500`,
          )
          .all<BizRow>(person.id)
      ).map((r) => ({ ...r, referred_at: num(r.referred_at), won_at: r.won_at == null ? null : num(r.won_at) }))
    : []

  const history = person && biz.length
    ? (
        await db
          .prepare(
            `SELECT h.opportunity_id, h.to_stage, h.changed_at FROM crm_stage_history h
             JOIN crm_opportunities o ON o.id = h.opportunity_id
             WHERE o.referrer_id = ? ORDER BY h.changed_at DESC LIMIT 200`,
          )
          .all<{ opportunity_id: string; to_stage: string; changed_at: number }>(person.id)
      ).map((h) => ({ ...h, changed_at: num(h.changed_at) }))
    : []

  const tickets = (
    await db
      .prepare('SELECT serial, earned_at_referral, created_at, used_at FROM raffle_tickets WHERE member_id = ? ORDER BY serial')
      .all<{ serial: number; earned_at_referral: number; created_at: number; used_at: number | null }>(m.id)
  ).map((t) => ({ ...t, serial: num(t.serial), created_at: num(t.created_at) }))

  const ledger = (
    await db
      .prepare('SELECT kind, amount, status, note, created_at, paid_at FROM affiliate_rewards WHERE member_id = ? ORDER BY created_at DESC')
      .all<{ kind: string; amount: number; status: string; note: string | null; created_at: number; paid_at: number | null }>(m.id)
  ).map((r) => ({ ...r, amount: num(r.amount), created_at: num(r.created_at) }))

  /* ---- windows ---- */
  const firstActivity = Math.min(
    memberSince || now,
    ...referred.map((r) => r.created_at),
    ...biz.map((b) => b.referred_at),
    ...clickDays.map((c) => c.first),
  )

  const windows = Object.fromEntries(
    WINDOWS.map((w) => {
      const since = w.days ? now - w.days * DAY : 0
      const clickSince = Math.max(since, CLICKS_COUNTED_FROM)
      const inWin = (t: number | null) => t != null && t >= since
      const userClicks = clickDays.filter((c) => c.first >= since).reduce((a, c) => a + c.n, 0)
      const businessClicks = bizClickDays.filter((c) => c.first >= since).reduce((a, c) => a + c.n, 0)
      const joined = referred.filter((r) => inWin(r.created_at)).length
      const joinedSinceClicks = referred.filter((r) => r.created_at >= clickSince).length
      const qualified = referred.filter((r) => inWin(r.qualified_at)).length
      const bizIn = biz.filter((b) => inWin(b.referred_at))
      const converted = bizIn.filter((b) => businessStatus(b.stage).bucket === 'converted').length
      const wonInWindow = biz.filter((b) => inWin(b.won_at)).length
      const series: Bucket[] = buckets(w.days, firstActivity, now).map((b, i, all) => {
        const end = i + 1 < all.length ? all[i + 1].start : now + 1
        const between = (t: number | null) => t != null && (w.days ? ptDay(t) === b.key : t >= b.start && t < end)
        const clickIn = (c: { day: string; first: number }) => (w.days ? c.day === b.key : c.first >= b.start && c.first < end)
        return {
          key: b.key,
          label: b.label,
          clicks: clickDays.filter(clickIn).reduce((a, c) => a + c.n, 0) + bizClickDays.filter(clickIn).reduce((a, c) => a + c.n, 0),
          joined: referred.filter((r) => between(r.created_at)).length,
          qualified: referred.filter((r) => between(r.qualified_at)).length,
          businesses: biz.filter((x) => between(x.referred_at)).length,
        }
      })
      return [
        w.key,
        {
          since,
          clicks: { user: userClicks, business: businessClicks, total: userClicks + businessClicks },
          users: { joined, qualified },
          businesses: { referred: bizIn.length, converted, wonInWindow },
          conversions: qualified + wonInWindow,
          /* Of the devices that opened the link since clicks were counted, how many made an account. */
          userConversion: userClicks > 0 ? Math.min(1, joinedSinceClicks / userClicks) : null,
          /* Of the businesses referred in the window, how many signed. */
          businessConversion: bizIn.length > 0 ? converted / bizIn.length : null,
          series,
        },
      ]
    }),
  ) as Record<WindowKey, unknown>

  /* ---- lifetime ---- */
  const qualifiedAll = referred.filter((r) => r.qualified_at != null).length
  const convertedAll = biz.filter((b) => businessStatus(b.stage).bucket === 'converted').length
  const pendingBiz = biz.filter((b) => businessStatus(b.stage).bucket === 'pending').length
  const tier = TIERS.find((t) => t.id === m.tier)
  const rewards = rewardsFor(referred.length, tier)
  const cents = (status: string) => ledger.filter((r) => r.kind === 'cash' && r.status === status).reduce((a, r) => a + r.amount, 0)

  const users = [...referred]
    .map((r, i) => {
      const n = i + 1
      const ticket = Math.ceil(n / PER_MILESTONE_REFERRALS)
      const earned = ticket <= rewards.milestones
      return {
        label: maskName(r.name),
        joinedAt: r.created_at,
        qualified: r.qualified_at != null,
        qualifiedAt: r.qualified_at,
        reward: earned
          ? `Counted toward raffle ticket ${ticket}`
          : `${n - (ticket - 1) * PER_MILESTONE_REFERRALS} of ${PER_MILESTONE_REFERRALS} toward your next ticket`,
      }
    })
    .reverse()

  const businesses = biz.map((b) => {
    const s = businessStatus(b.stage)
    const brand = b.brand_id ? BRAND.get(b.brand_id) : undefined
    const live = !!(b.brand_id && SEATED.has(b.brand_id))
    const paid = b.deal_status === 'won' && (num(b.sold_cents) > 0 || num(b.monthly_cents) > 0)
    return {
      name: b.business_name,
      city: b.city,
      referredAt: b.referred_at,
      status: s.label,
      bucket: s.bucket,
      page: live ? 'Live on BEASTY' : 'No page yet',
      listing: paid ? 'Paid' : live ? (brand?.tier === 1 ? 'Free listing' : 'Full page') : null,
      reward: 'Not paying yet',
    }
  })

  /* ---- activity ---- */
  const nameOf = new Map(biz.map((b) => [b.id, b.business_name]))
  type Act = { at: number; kind: string; text: string }
  const activity: Act[] = []
  for (const r of referred) {
    activity.push({ at: r.created_at, kind: 'user_joined', text: `${maskName(r.name)} joined BEASTY with your link` })
    if (r.qualified_at != null) activity.push({ at: r.qualified_at, kind: 'user_qualified', text: `${maskName(r.name)} became an active member` })
  }
  for (const t of tickets) activity.push({ at: t.created_at, kind: 'ticket', text: `You earned raffle ticket #${t.serial}` })
  for (const b of biz) activity.push({ at: b.referred_at, kind: 'business_referred', text: `${b.business_name} asked for a spot through your link` })
  for (const h of history) {
    const name = nameOf.get(h.opportunity_id) ?? 'A business'
    const s = STAGE.get(h.to_stage)
    if (!s) continue
    if (h.to_stage === 'contacted') activity.push({ at: h.changed_at, kind: 'business_contacted', text: `BEASTY reached out to ${name}` })
    else if (h.to_stage === 'won') activity.push({ at: h.changed_at, kind: 'business_won', text: `${name} signed with BEASTY` })
    else if (h.to_stage === 'active_customer') activity.push({ at: h.changed_at, kind: 'business_active', text: `${name} is now an active customer` })
  }
  for (const r of ledger) {
    const amount = r.kind === 'cash' ? `$${(r.amount / 100).toFixed(2)}` : `${r.amount} points`
    activity.push({ at: r.created_at, kind: `reward_${r.status}`, text: `${amount} reward ${r.status === 'paid' ? 'paid' : r.status === 'pending' ? 'pending' : 'earned'}` })
  }
  activity.sort((a, b) => b.at - a.at)

  return {
    affiliate: {
      code: m.referral_code,
      since: memberSince,
      status: person?.role === 'partner' ? 'Partner' : 'Active',
      links: {
        user: `${origin}/?ref=${m.referral_code}`,
        business: `${origin}/r/${slug}`,
      },
    },
    program: {
      perTicket: PER_MILESTONE_REFERRALS,
      discountPerMilestone: DISCOUNT_PER_MILESTONE,
      discountCap: tier?.discountCap ?? 0,
      tierName: tier?.name ?? null,
      cashRewards: false,
      clicksCountedFrom: CLICKS_COUNTED_FROM,
    },
    lifetime: {
      users: referred.length,
      qualified: qualifiedAll,
      pendingUsers: referred.length - qualifiedAll,
      businesses: biz.length,
      businessesConverted: convertedAll,
      pendingBusinesses: pendingBiz,
      conversions: qualifiedAll + convertedAll,
      clicks: clickDays.reduce((a, c) => a + c.n, 0) + bizClickDays.reduce((a, c) => a + c.n, 0),
    },
    windows,
    users,
    businesses,
    rewards: {
      tickets: { earned: tickets.length, unused: tickets.filter((t) => t.used_at == null).length },
      toNextTicket: rewards.toNextTicket,
      discountDollars: rewards.discount,
      discountCapped: rewards.discountCapped,
      cash: { pendingCents: cents('pending'), earnedCents: cents('earned'), paidCents: cents('paid') },
    },
    activity: activity.slice(0, 30),
  }
}

/** Every affiliate with anything to show, for the admin screen to come. Operator only. */
export async function affiliateList() {
  const rows = await db
    .prepare(
      `SELECT m.id, m.name, m.referral_code, m.created_at,
              (SELECT COUNT(*) FROM members f WHERE f.referred_by = m.id) AS users,
              (SELECT COUNT(*) FROM referral_clicks c WHERE c.member_id = m.id) AS clicks,
              (SELECT COUNT(*) FROM crm_opportunities o JOIN crm_people p ON p.id = o.referrer_id WHERE p.member_id = m.id) AS businesses,
              (SELECT COUNT(*) FROM referral_flags r WHERE r.member_id = m.id) AS flags
       FROM members m
       WHERE EXISTS (SELECT 1 FROM members f WHERE f.referred_by = m.id)
          OR EXISTS (SELECT 1 FROM referral_clicks c WHERE c.member_id = m.id)
          OR EXISTS (SELECT 1 FROM crm_people p WHERE p.member_id = m.id)
          OR EXISTS (SELECT 1 FROM referral_flags r WHERE r.member_id = m.id)
       ORDER BY users DESC, clicks DESC LIMIT 1000`,
    )
    .all<{ id: string; name: string; referral_code: string; created_at: number; users: number; clicks: number; businesses: number; flags: number }>()
  const flags = await db
    .prepare('SELECT member_id, kind, detail, created_at FROM referral_flags ORDER BY created_at DESC LIMIT 200')
    .all<{ member_id: string; kind: string; detail: unknown; created_at: number }>()
  return {
    affiliates: rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.referral_code,
      since: num(r.created_at),
      users: num(r.users),
      clicks: num(r.clicks),
      businesses: num(r.businesses),
      flags: num(r.flags),
    })),
    flags: flags.map((f) => ({ memberId: f.member_id, kind: f.kind, detail: f.detail, at: num(f.created_at) })),
  }
}

/* ------------------------------------------------------------------ routes */

export function mountAffiliate(
  app: Express,
  deps: {
    memberFromRequest: (req: Request) => Promise<MemberLite | null>
    rateLimiter: (max: number, perSec: number) => RequestHandler
    deviceOf: (req: Request, res: Response) => string | null
    isOperator: (req: Request) => boolean
    origin: (req: Request) => string
  },
) {
  /* The dashboard. Signed-in members only, and only ever their own. */
  app.get('/api/affiliate/me', deps.rateLimiter(30, 10), async (req, res) => {
    const m = await deps.memberFromRequest(req)
    if (!m) return res.status(401).json({ error: 'Not signed in.' })
    res.set('Cache-Control', 'no-store')
    res.json(await affiliateStats(m, deps.origin(req)))
  })

  /* A click on a member's link, sent once by the page that opened it. */
  app.post('/api/affiliate/click', deps.rateLimiter(30, 10), async (req, res) => {
    const signedIn = !!(await deps.memberFromRequest(req))
    const visitor = deps.deviceOf(req, res)
    const body = (req.body ?? {}) as { code?: unknown; landing?: unknown }
    const counted = await recordClick({ code: String(body.code ?? ''), visitor, signedIn, landing: String(body.landing ?? '') })
    /* ?wait=1 outside production lets the audits read the outcome. */
    if (req.query.wait === '1' && process.env.NODE_ENV !== 'production') return res.json({ counted })
    res.status(204).end()
  })

  /* Every affiliate, for the admin dashboard that will read this. Operator only. */
  app.get('/api/admin/affiliates', deps.rateLimiter(20, 5), async (req, res) => {
    if (!deps.isOperator(req)) return res.status(401).json({ error: 'Operator only.' })
    res.set('Cache-Control', 'no-store')
    res.json(await affiliateList())
  })
}
