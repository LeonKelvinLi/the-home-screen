/*
  THE CRM'S READS. Filtering, counting and summing happen in SQL, with
  pagination, so the screen never loads every lead or every activity to draw a
  number. Revenue is always read from crm_deals, whose prices were copied at
  the time of sale, never from today's offer prices.
*/
import { db } from '../db/schema'
import { DAY_MS, OPEN_STAGES, STAGES, stageOf } from '../../src/crm/model'
import { businessById, researchNotes } from './directory'
import type { DealRow, OppRow, PersonRow } from './core'
import { CrmError } from './core'

/* ------------------------------------------------------------------ bits */

const ph = (n: number) => Array.from({ length: n }, () => '?').join(',')
const OPEN = `(${OPEN_STAGES.map((s) => `'${s}'`).join(',')})`
/** How far along the funnel a stage is, as SQL. Built from the shared list, so it cannot drift. */
export const rankSql = (col: string) =>
  `(CASE ${col} ${STAGES.filter((s) => s.rank !== null)
    .map((s) => `WHEN '${s.key}' THEN ${s.rank}`)
    .join(' ')} ELSE NULL END)`
const likeArg = (q: string) => `%${q.toLowerCase().replace(/[\\%_]/g, (m) => `\\${m}`)}%`
/**
 * Free-text match on a lead. Phones are stored as digits, so a number typed
 * the way people write it, "(510) 894-3975", also matches on its digits.
 */
function textMatch(col: string, q: string): { sql: string; args: unknown[] } {
  const digits = q.replace(/\D/g, '')
  if (digits.length >= 7 && /^[\d\s().+-]+$/.test(q.trim())) {
    return { sql: `(${col} ILIKE ? ESCAPE '\\' OR ${col} LIKE ?)`, args: [likeArg(q), `%${digits.slice(-10)}%`] }
  }
  return { sql: `${col} ILIKE ? ESCAPE '\\'`, args: [likeArg(q)] }
}
const num = (v: unknown) => Number(v ?? 0)

export const actorLabel = (actor: string, people: Map<string, string>) => {
  if (actor === 'operator') return 'Glenn'
  if (actor.startsWith('person:')) return people.get(actor.slice(7)) ?? 'Someone'
  if (actor === 'system:backfill') return 'Import'
  if (actor === 'system:referral-link') return 'Referral link'
  if (actor.startsWith('system:')) return 'System'
  return actor
}

export async function peopleNames(): Promise<Map<string, string>> {
  const rows = await db.prepare('SELECT id, name FROM crm_people').all<{ id: string; name: string }>()
  return new Map(rows.map((r) => [r.id, r.name]))
}

/* ------------------------------------------------------------ lead lists */

export interface LeadFilters {
  q?: string
  stage?: string[]
  city?: string
  category?: string
  referrer?: string
  assigned?: string
  websiteStatus?: string[]
  type?: string
  source?: string
  family?: string
  since?: number
  hasPhone?: boolean
  hasEmail?: boolean
  hasInstagram?: boolean
  overdue?: boolean
  uncontacted?: boolean
  /** true: only leads the import created; false: only leads that arrived otherwise. */
  imported?: boolean
  attention?: string
  sort?: string
  limit?: number
  offset?: number
}

type LeadRow = OppRow & { referrer_name: string | null; assignee_name: string | null }

function whereFor(f: LeadFilters, t: number): { sql: string; args: unknown[] } {
  const w: string[] = []
  const a: unknown[] = []
  if (f.q) {
    const m = textMatch('o.search_text', f.q)
    w.push(m.sql)
    a.push(...m.args)
  }
  if (f.stage?.length) {
    w.push(`o.stage IN (${ph(f.stage.length)})`)
    a.push(...f.stage)
  }
  if (f.websiteStatus?.length) {
    w.push(`o.website_status IN (${ph(f.websiteStatus.length)})`)
    a.push(...f.websiteStatus)
  }
  for (const [col, v] of [
    ['o.city', f.city],
    ['o.category', f.category],
    ['o.opportunity_type', f.type],
    ['o.source_type', f.source],
    ['o.family_key', f.family],
  ] as const) {
    if (v) {
      w.push(`${col} = ?`)
      a.push(v)
    }
  }
  for (const [col, v] of [
    ['o.referrer_id', f.referrer],
    ['o.assigned_to', f.assigned],
  ] as const) {
    if (v === 'none') w.push(`${col} IS NULL`)
    else if (v) {
      w.push(`${col} = ?`)
      a.push(v)
    }
  }
  if (f.since) {
    w.push('o.created_at >= ?')
    a.push(f.since)
  }
  for (const [col, v] of [
    ['o.phone', f.hasPhone],
    ['o.email', f.hasEmail],
    ['o.instagram', f.hasInstagram],
  ] as const) {
    if (v === true) w.push(`COALESCE(${col}, '') <> ''`)
    if (v === false) w.push(`COALESCE(${col}, '') = ''`)
  }
  if (f.overdue) {
    w.push('o.next_followup_at < ?')
    a.push(t)
  }
  if (f.uncontacted) w.push(`o.first_contacted_at IS NULL AND o.stage IN ${OPEN}`)
  if (f.imported === true) w.push('o.backfill_run_id IS NOT NULL')
  if (f.imported === false) w.push('o.backfill_run_id IS NULL')
  switch (f.attention) {
    case 'uncontacted_referrals':
      w.push(`o.referrer_id IS NOT NULL AND NOT o.referral_default AND o.first_contacted_at IS NULL AND o.stage IN ${OPEN}`)
      break
    case 'overdue':
      w.push('o.next_followup_at < ?')
      a.push(t)
      break
    case 'interested_no_next':
      w.push(`o.stage IN ('interested','meeting','proposal_sent') AND o.next_followup_at IS NULL`)
      break
    case 'stale_proposals':
      w.push(`o.stage = 'proposal_sent' AND COALESCE(o.last_activity_at, o.stage_changed_at) < ?`)
      a.push(t - 5 * DAY_MS)
      break
    case 'missing_contact':
      w.push(`o.stage IN ${OPEN} AND COALESCE(o.phone,'') = '' AND COALESCE(o.email,'') = '' AND COALESCE(o.instagram,'') = ''`)
      break
    case 'no_next_action':
      w.push(`o.stage IN ${OPEN} AND o.next_followup_at IS NULL`)
      break
  }
  return { sql: w.length ? `WHERE ${w.join(' AND ')}` : '', args: a }
}

const ORDER: Record<string, string> = {
  next: 'o.next_followup_at ASC NULLS LAST, o.updated_at DESC',
  updated: 'o.updated_at DESC',
  created: 'o.created_at DESC',
  name: 'o.business_name ASC',
  value: 'o.potential_cents DESC, o.updated_at DESC',
  stage: `(CASE o.stage ${STAGES.map((s, i) => `WHEN '${s.key}' THEN ${i}`).join(' ')} END) ASC, o.updated_at DESC`,
}

/** One row of a list: the listing's live details where there is a listing. */
export function summarize(o: LeadRow) {
  const biz = businessById(o.brand_id)
  return {
    id: o.id,
    brandId: o.brand_id,
    applicationId: o.application_id,
    name: biz?.name ?? o.business_name,
    icon: biz?.icon ?? null,
    familyKey: o.family_key,
    city: biz?.city ?? o.city,
    category: biz?.category ?? o.category,
    websiteStatus: biz?.websiteStatus ?? o.website_status,
    freeListing: biz?.freeListing ?? false,
    channels: biz ? biz.channels : { phone: o.phone ?? '', email: o.email ?? '', instagram: o.instagram ?? '' },
    stage: o.stage,
    stageChangedAt: o.stage_changed_at,
    opportunityType: o.opportunity_type,
    potentialCents: o.potential_cents,
    referrer: o.referrer_id ? { id: o.referrer_id, name: o.referrer_name ?? '' } : null,
    referralDefault: !!o.referral_default,
    sourceType: o.source_type,
    assignee: o.assigned_to ? { id: o.assigned_to, name: o.assignee_name ?? '' } : null,
    priority: o.priority,
    lastActivityAt: o.last_activity_at,
    nextFollowupAt: o.next_followup_at,
    firstContactedAt: o.first_contacted_at,
    createdAt: o.created_at,
  }
}

export async function listLeads(f: LeadFilters, t = Date.now()) {
  const { sql, args } = whereFor(f, t)
  const limit = Math.min(Math.max(Math.trunc(f.limit ?? 50), 1), 200)
  const offset = Math.max(Math.trunc(f.offset ?? 0), 0)
  const order = ORDER[f.sort ?? 'next'] ?? ORDER.next
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM crm_opportunities o ${sql}`).get<{ n: number }>(...args)
  const rows = await db
    .prepare(
      `SELECT o.*, rp.name AS referrer_name, ap.name AS assignee_name
       FROM crm_opportunities o
       LEFT JOIN crm_people rp ON rp.id = o.referrer_id
       LEFT JOIN crm_people ap ON ap.id = o.assigned_to
       ${sql} ORDER BY ${order} LIMIT ? OFFSET ?`,
    )
    .all<LeadRow>(...args, limit, offset)
  return { total: num(total?.n), limit, offset, leads: rows.map(summarize) }
}

/** The distinct values the lead filters offer, from what actually exists. */
export async function filterOptions() {
  const cities = await db.prepare('SELECT city, COUNT(*) AS n FROM crm_opportunities WHERE city IS NOT NULL GROUP BY city ORDER BY city').all<{ city: string; n: number }>()
  const categories = await db
    .prepare('SELECT category, COUNT(*) AS n FROM crm_opportunities WHERE category IS NOT NULL AND category <> \'\' GROUP BY category ORDER BY category')
    .all<{ category: string; n: number }>()
  const sources = await db.prepare('SELECT key, label, is_person FROM crm_source_types ORDER BY sort, label').all<{ key: string; label: string; is_person: boolean }>()
  return {
    cities: cities.map((r) => ({ value: r.city, count: num(r.n) })),
    categories: categories.map((r) => ({ value: r.category, count: num(r.n) })),
    sources: sources.map((s) => ({ key: s.key, label: s.label, isPerson: s.is_person })),
  }
}

/* ------------------------------------------------------------ lead detail */

export async function leadDetail(id: string) {
  const o = await db
    .prepare(
      `SELECT o.*, rp.name AS referrer_name, ap.name AS assignee_name, cp.name AS closer_name, st.label AS source_label
       FROM crm_opportunities o
       LEFT JOIN crm_people rp ON rp.id = o.referrer_id
       LEFT JOIN crm_people ap ON ap.id = o.assigned_to
       LEFT JOIN crm_people cp ON cp.id = o.closed_by
       LEFT JOIN crm_source_types st ON st.key = o.source_type
       WHERE o.id = ?`,
    )
    .get<LeadRow & { closer_name: string | null; source_label: string | null }>(id)
  if (!o) throw new CrmError(404, 'No such lead.')
  const people = await peopleNames()
  const biz = businessById(o.brand_id)
  const application = o.application_id
    ? await db.prepare('SELECT id, business, cuisine, contact, city, social, created_at FROM applications WHERE id = ?').get(o.application_id)
    : null
  const history = await db
    .prepare('SELECT * FROM crm_stage_history WHERE opportunity_id = ? ORDER BY changed_at, id')
    .all<{ id: string; from_stage: string | null; to_stage: string; changed_at: number; changed_by: string; note: string | null }>(id)
  const activities = await db
    .prepare('SELECT * FROM crm_activities WHERE opportunity_id = ? ORDER BY occurred_at DESC, created_at DESC LIMIT 200')
    .all<{ id: string; type: string; body: string | null; data: Record<string, unknown> | null; actor: string; occurred_at: number }>(id)
  const followups = await db
    .prepare(
      `SELECT f.*, p.name AS owner_name FROM crm_followups f LEFT JOIN crm_people p ON p.id = f.owner_id
       WHERE f.opportunity_id = ? ORDER BY f.completed_at IS NOT NULL, f.due_at`,
    )
    .all<{
      id: string
      due_at: number
      owner_id: string | null
      owner_name: string | null
      priority: string
      type: string
      notes: string | null
      completed_at: number | null
      completed_by: string | null
    }>(id)
  const deals = await db
    .prepare(
      `SELECT d.*, p.name AS closer_name FROM crm_deals d LEFT JOIN crm_people p ON p.id = d.closed_by
       WHERE d.opportunity_id = ? ORDER BY d.created_at DESC`,
    )
    .all<DealRow & { closer_name: string | null }>(id)
  const family = await db
    .prepare('SELECT id, business_name, city, stage FROM crm_opportunities WHERE family_key = ? AND id <> ? ORDER BY city')
    .all<{ id: string; business_name: string; city: string | null; stage: string }>(o.family_key, id)
  return {
    lead: {
      ...summarize(o),
      contactName: o.contact_name,
      preferredChannel: o.preferred_channel,
      campaign: o.campaign,
      referredAt: o.referred_at,
      referralNote: o.referral_note,
      sourceLabel: o.source_label,
      closedBy: o.closed_by ? { id: o.closed_by, name: o.closer_name ?? '' } : null,
      wonAt: o.won_at,
      lostAt: o.lost_at,
      createdBy: actorLabel(o.created_by, people),
    },
    business: biz
      ? {
          id: biz.id,
          name: biz.name,
          tagline: biz.tagline,
          cuisine: biz.cuisine,
          city: biz.city,
          category: biz.category,
          address: biz.address,
          hours: biz.hours,
          site: biz.site,
          websiteStatus: biz.websiteStatus,
          freeListing: biz.freeListing,
          seats: biz.seats,
          pageUrl: biz.pageUrl,
          phone: biz.phone,
          email: biz.email,
          instagram: biz.instagram,
          isIndividual: biz.isIndividual,
          notes: researchNotes(biz.id),
        }
      : null,
    application,
    history: history.map((h) => ({ ...h, changedBy: actorLabel(h.changed_by, people) })),
    activities: activities.map((a) => ({
      id: a.id,
      type: a.type,
      body: a.body,
      data: a.data,
      actor: actorLabel(a.actor, people),
      occurredAt: a.occurred_at,
    })),
    followups: followups.map((f) => ({
      id: f.id,
      dueAt: f.due_at,
      owner: f.owner_id ? { id: f.owner_id, name: f.owner_name ?? '' } : null,
      priority: f.priority,
      type: f.type,
      notes: f.notes,
      completedAt: f.completed_at,
      completedBy: f.completed_by ? actorLabel(f.completed_by, people) : null,
    })),
    deals: deals.map((d) => ({
      id: d.id,
      offerId: d.offer_id,
      offerName: d.offer_name,
      quotedCents: d.quoted_cents,
      soldCents: d.sold_cents,
      monthlyCents: d.monthly_cents,
      status: d.status,
      recurringActive: d.recurring_active,
      wonAt: d.won_at,
      lostAt: d.lost_at,
      lossReason: d.loss_reason,
      closedBy: d.closed_by ? { id: d.closed_by, name: d.closer_name ?? '' } : null,
      createdAt: d.created_at,
    })),
    family,
  }
}

/* --------------------------------------------------------------- overview */

export async function overview(t = Date.now()) {
  const c = await db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE created_at >= ? AND backfill_run_id IS NULL) AS new_week,
         COUNT(*) FILTER (WHERE stage = 'need_contact_info') AS need_contact,
         COUNT(*) FILTER (WHERE stage = 'ready_to_contact') AS ready,
         COUNT(*) FILTER (WHERE stage IN ('contacted','replied')) AS contacted,
         COUNT(*) FILTER (WHERE stage IN ('interested','meeting')) AS interested,
         COUNT(*) FILTER (WHERE stage = 'proposal_sent') AS proposals,
         COUNT(*) FILTER (WHERE opportunity_type IN ('website','website_redesign') AND stage IN ${OPEN}) AS need_websites,
         COALESCE(SUM(potential_cents) FILTER (WHERE stage IN ${OPEN}), 0) AS pipeline_cents,
         COUNT(*) FILTER (WHERE referrer_id IS NOT NULL AND NOT referral_default AND first_contacted_at IS NULL AND stage IN ${OPEN}) AS uncontacted_referrals,
         COUNT(*) FILTER (WHERE stage IN ('interested','meeting','proposal_sent') AND next_followup_at IS NULL) AS interested_no_next,
         COUNT(*) FILTER (WHERE stage = 'proposal_sent' AND COALESCE(last_activity_at, stage_changed_at) < ?) AS stale_proposals,
         COUNT(*) FILTER (WHERE stage IN ${OPEN} AND COALESCE(phone,'') = '' AND COALESCE(email,'') = '' AND COALESCE(instagram,'') = '') AS missing_contact,
         COUNT(*) FILTER (WHERE next_followup_at < ?) AS overdue_leads
       FROM crm_opportunities`,
    )
    .get<Record<string, number>>(t - 7 * DAY_MS, t - 5 * DAY_MS, t)
  const d = await db
    .prepare(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'won') AS won,
         COALESCE(SUM(sold_cents) FILTER (WHERE status = 'won'), 0) AS one_time,
         COALESCE(SUM(monthly_cents) FILTER (WHERE status = 'won' AND recurring_active), 0) AS mrr,
         COUNT(*) FILTER (WHERE status = 'open') AS open_deals
       FROM crm_deals`,
    )
    .get<Record<string, number>>()
  const overdue = await db
    .prepare('SELECT COUNT(*) AS n FROM crm_followups WHERE completed_at IS NULL AND due_at < ?')
    .get<{ n: number }>(t)
  const row = c ?? {}
  const say = (n: number, one: string, many: string) => ({ count: n, text: n === 1 ? one : many })
  return {
    counts: {
      total: num(row.total),
      newThisWeek: num(row.new_week),
      needContactInfo: num(row.need_contact),
      readyToContact: num(row.ready),
      contacted: num(row.contacted),
      interested: num(row.interested),
      proposalsOutstanding: num(row.proposals),
      dealsWon: num(d?.won),
      openDeals: num(d?.open_deals),
      needWebsites: num(row.need_websites),
    },
    money: {
      oneTimeCents: num(d?.one_time),
      mrrCents: num(d?.mrr),
      arrCents: num(d?.mrr) * 12,
      pipelineCents: num(row.pipeline_cents),
    },
    attention: [
      { key: 'uncontacted_referrals', ...say(num(row.uncontacted_referrals), 'referral has not been contacted', 'referrals have not been contacted') },
      { key: 'overdue', ...say(num(overdue?.n), 'follow-up is overdue', 'follow-ups are overdue'), leads: num(row.overdue_leads) },
      { key: 'interested_no_next', ...say(num(row.interested_no_next), 'interested business has no next action', 'interested businesses have no next action') },
      { key: 'stale_proposals', ...say(num(row.stale_proposals), 'proposal has had no activity for 5+ days', 'proposals have had no activity for 5+ days') },
      { key: 'missing_contact', ...say(num(row.missing_contact), 'business is missing contact information', 'businesses are missing contact information') },
    ],
  }
}

/* -------------------------------------------------------------- follow-ups */

export async function followupView(view: string, bounds: { end: number }, t = Date.now()) {
  if (view === 'no_next_action') return { kind: 'leads' as const, ...(await listLeads({ attention: 'no_next_action', sort: 'updated', limit: 100 }, t)) }
  let cond = ''
  const args: unknown[] = []
  let order = 'f.due_at ASC'
  switch (view) {
    case 'overdue':
      cond = 'f.completed_at IS NULL AND f.due_at < ?'
      args.push(t)
      break
    case 'due_today':
      cond = 'f.completed_at IS NULL AND f.due_at >= ? AND f.due_at < ?'
      args.push(t, bounds.end)
      break
    case 'upcoming':
      cond = 'f.completed_at IS NULL AND f.due_at >= ? AND f.due_at < ?'
      args.push(bounds.end, bounds.end + 14 * DAY_MS)
      break
    case 'recent':
      cond = 'f.completed_at >= ?'
      args.push(t - 7 * DAY_MS)
      order = 'f.completed_at DESC'
      break
    default:
      throw new CrmError(400, 'Unknown follow-up view.')
  }
  const people = await peopleNames()
  const rows = await db
    .prepare(
      `SELECT f.*, p.name AS owner_name, o.business_name, o.brand_id, o.stage, o.city, o.phone, o.email, o.instagram
       FROM crm_followups f
       JOIN crm_opportunities o ON o.id = f.opportunity_id
       LEFT JOIN crm_people p ON p.id = f.owner_id
       WHERE ${cond} ORDER BY ${order} LIMIT 200`,
    )
    .all<{
      id: string
      opportunity_id: string
      due_at: number
      priority: string
      type: string
      notes: string | null
      owner_id: string | null
      owner_name: string | null
      completed_at: number | null
      completed_by: string | null
      business_name: string
      brand_id: string | null
      stage: string
      city: string | null
      phone: string | null
      email: string | null
      instagram: string | null
    }>(...args)
  return {
    kind: 'followups' as const,
    followups: rows.map((r) => {
      const biz = businessById(r.brand_id)
      return {
        id: r.id,
        leadId: r.opportunity_id,
        name: biz?.name ?? r.business_name,
        icon: biz?.icon ?? null,
        city: biz?.city ?? r.city,
        stage: r.stage,
        channels: biz ? biz.channels : { phone: r.phone ?? '', email: r.email ?? '', instagram: r.instagram ?? '' },
        dueAt: r.due_at,
        priority: r.priority,
        type: r.type,
        notes: r.notes,
        owner: r.owner_id ? { id: r.owner_id, name: r.owner_name ?? '' } : null,
        completedAt: r.completed_at,
        completedBy: r.completed_by ? actorLabel(r.completed_by, people) : null,
      }
    }),
  }
}

/* --------------------------------------------------------------- referrers */

interface FunnelRow {
  person_id: string
  leads: number
  contacted: number
  replied: number
  interested: number
  proposals: number
  won: number
}

/**
 * The funnel for referrers: how far each of their businesses EVER got, read
 * from the stage history (a lead that was interested and then went quiet
 * still counts as interested). Leads count by when they were referred; money
 * counts won deals by when they were won; MRR is what is active now.
 */
async function referrerFunnel(since: number, personId?: string): Promise<FunnelRow[]> {
  const args: unknown[] = [since]
  let only = ''
  if (personId) {
    only = 'AND o.referrer_id = ?'
    args.push(personId)
  }
  return db
    .prepare(
      `WITH reach AS (
         SELECT o.id, o.referrer_id AS person_id,
                GREATEST(COALESCE(MAX(${rankSql('h.to_stage')}), 0), COALESCE(${rankSql('o.stage')}, 0)) AS r
         FROM crm_opportunities o
         LEFT JOIN crm_stage_history h ON h.opportunity_id = o.id
         WHERE o.referrer_id IS NOT NULL AND COALESCE(o.referred_at, o.created_at) >= ? ${only}
         GROUP BY o.id
       )
       SELECT person_id,
              COUNT(*) AS leads,
              COUNT(*) FILTER (WHERE r >= 2) AS contacted,
              COUNT(*) FILTER (WHERE r >= 3) AS replied,
              COUNT(*) FILTER (WHERE r >= 4) AS interested,
              COUNT(*) FILTER (WHERE r >= 6) AS proposals,
              COUNT(*) FILTER (WHERE r >= 7) AS won
       FROM reach GROUP BY person_id`,
    )
    .all<FunnelRow>(...args)
}

async function referrerMoney(since: number, personId?: string) {
  const args: unknown[] = [since]
  let only = ''
  if (personId) {
    only = 'AND o.referrer_id = ?'
    args.push(personId)
  }
  return db
    .prepare(
      `SELECT o.referrer_id AS person_id,
              COALESCE(SUM(d.sold_cents) FILTER (WHERE d.status = 'won' AND d.won_at >= ?), 0) AS one_time,
              COALESCE(SUM(d.monthly_cents) FILTER (WHERE d.status = 'won' AND d.recurring_active), 0) AS mrr
       FROM crm_deals d JOIN crm_opportunities o ON o.id = d.opportunity_id
       WHERE o.referrer_id IS NOT NULL ${only}
       GROUP BY o.referrer_id`,
    )
    .all<{ person_id: string; one_time: number; mrr: number }>(...args)
}

function metricsFor(p: PersonRow, f?: FunnelRow, m?: { one_time: number; mrr: number }, visits = 0) {
  const leads = num(f?.leads)
  const won = num(f?.won)
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sourceType: p.source_type,
    role: p.role,
    isTeam: p.is_team,
    brandId: p.brand_id,
    linked: !!p.member_id,
    active: p.active,
    leads,
    contacted: num(f?.contacted),
    replied: num(f?.replied),
    interested: num(f?.interested),
    proposals: num(f?.proposals),
    won,
    conversion: leads ? won / leads : 0,
    oneTimeCents: num(m?.one_time),
    mrrCents: num(m?.mrr),
    visits,
  }
}

export async function referrerList(since: number) {
  const people = await db.prepare('SELECT * FROM crm_people ORDER BY name').all<PersonRow>()
  const funnel = new Map((await referrerFunnel(since)).map((r) => [r.person_id, r]))
  const money = new Map((await referrerMoney(since)).map((r) => [r.person_id, r]))
  const visits = new Map(
    (
      await db
        .prepare('SELECT person_id, COUNT(*) AS n FROM crm_referral_visits WHERE created_at >= ? GROUP BY person_id')
        .all<{ person_id: string; n: number }>(since)
    ).map((r) => [r.person_id, num(r.n)]),
  )
  return people
    .map((p) => metricsFor(p, funnel.get(p.id), money.get(p.id), visits.get(p.id) ?? 0))
    .sort((a, b) => b.leads - a.leads || b.oneTimeCents - a.oneTimeCents || a.name.localeCompare(b.name))
}

export async function referrerDetail(personId: string, since: number) {
  const p = await db.prepare('SELECT * FROM crm_people WHERE id = ?').get<PersonRow>(personId)
  if (!p) throw new CrmError(404, 'No such person.')
  const [f] = await referrerFunnel(since, personId)
  const [m] = await referrerMoney(since, personId)
  const v = await db
    .prepare('SELECT COUNT(*) AS n FROM crm_referral_visits WHERE person_id = ? AND created_at >= ?')
    .get<{ n: number }>(personId, since)
  const rows = await db
    .prepare(
      `SELECT o.*, rp.name AS referrer_name, ap.name AS assignee_name,
              (SELECT row_to_json(d) FROM (
                 SELECT offer_name, quoted_cents, sold_cents, monthly_cents, status, recurring_active
                 FROM crm_deals WHERE opportunity_id = o.id ORDER BY (status = 'won') DESC, created_at DESC LIMIT 1
               ) d) AS deal
       FROM crm_opportunities o
       LEFT JOIN crm_people rp ON rp.id = o.referrer_id
       LEFT JOIN crm_people ap ON ap.id = o.assigned_to
       WHERE o.referrer_id = ? AND COALESCE(o.referred_at, o.created_at) >= ?
       ORDER BY o.referred_at DESC NULLS LAST, o.created_at DESC LIMIT 500`,
    )
    .all<LeadRow & { deal: Record<string, unknown> | null }>(personId, since)
  return {
    person: metricsFor(p, f, m, num(v?.n)),
    businesses: rows.map((r) => ({ ...summarize(r), deal: r.deal })),
  }
}

/** What a referral partner may see: their own numbers and, per business, only name, city and a stage bucket. */
export async function partnerView(personId: string) {
  const { person, businesses } = await referrerDetail(personId, 0)
  const bucket = (stage: string) => {
    const g = stageOf(stage)?.group
    return g === 'won' ? 'Customer' : g === 'closed' ? 'Closed' : 'In progress'
  }
  return {
    person: {
      name: person.name,
      slug: person.slug,
      leads: person.leads,
      contacted: person.contacted,
      replied: person.replied,
      interested: person.interested,
      proposals: person.proposals,
      won: person.won,
      conversion: person.conversion,
      oneTimeCents: person.oneTimeCents,
      mrrCents: person.mrrCents,
      visits: person.visits,
    },
    businesses: businesses.map((b) => ({ name: b.name, city: b.city, status: bucket(b.stage) })),
  }
}

/* ----------------------------------------------------------------- revenue */

const MONTH_SQL = `to_char(to_timestamp(d.won_at / 1000.0) AT TIME ZONE 'America/Los_Angeles', 'YYYY-MM')`

export async function revenue(since: number) {
  const totals = await db
    .prepare(
      `SELECT
         COALESCE(SUM(sold_cents) FILTER (WHERE status = 'won' AND won_at >= ?), 0) AS one_time,
         COUNT(*) FILTER (WHERE status = 'won' AND won_at >= ?) AS won,
         COALESCE(SUM(monthly_cents) FILTER (WHERE status = 'won' AND recurring_active), 0) AS mrr
       FROM crm_deals`,
    )
    .get<Record<string, number>>(since, since)
  const pipeline = await db
    .prepare(`SELECT COALESCE(SUM(potential_cents), 0) AS v, COUNT(*) AS n FROM crm_opportunities WHERE stage IN ${OPEN}`)
    .get<{ v: number; n: number }>()
  const breakdown = async (keyExpr: string, labelExpr: string, join = '') =>
    (
      await db
        .prepare(
          `SELECT ${keyExpr} AS key, ${labelExpr} AS label,
                  COUNT(*) AS deals,
                  COALESCE(SUM(d.sold_cents), 0) AS one_time,
                  COALESCE(SUM(d.monthly_cents) FILTER (WHERE d.recurring_active), 0) AS mrr
           FROM crm_deals d JOIN crm_opportunities o ON o.id = d.opportunity_id ${join}
           WHERE d.status = 'won' AND d.won_at >= ?
           GROUP BY 1, 2 ORDER BY one_time DESC, deals DESC`,
        )
        .all<{ key: string | null; label: string | null; deals: number; one_time: number; mrr: number }>(since)
    ).map((r) => ({ key: r.key ?? 'none', label: r.label ?? '—', deals: num(r.deals), oneTimeCents: num(r.one_time), mrrCents: num(r.mrr) }))
  return {
    oneTimeCents: num(totals?.one_time),
    dealsWon: num(totals?.won),
    mrrCents: num(totals?.mrr),
    arrCents: num(totals?.mrr) * 12,
    pipelineCents: num(pipeline?.v),
    openLeads: num(pipeline?.n),
    byReferrer: await breakdown('o.referrer_id', 'COALESCE(rp.name, \'No referrer\')', 'LEFT JOIN crm_people rp ON rp.id = o.referrer_id'),
    bySalesperson: await breakdown(
      'COALESCE(d.closed_by, o.closed_by, o.assigned_to)',
      "COALESCE(sp.name, 'Unassigned')",
      'LEFT JOIN crm_people sp ON sp.id = COALESCE(d.closed_by, o.closed_by, o.assigned_to)',
    ),
    byCity: await breakdown('o.city', 'o.city'),
    byCategory: await breakdown('o.category', 'o.category'),
    byOffer: await breakdown('d.offer_name', 'd.offer_name'),
    byMonth: (await breakdown(MONTH_SQL, MONTH_SQL)).sort((a, b) => a.key.localeCompare(b.key)),
  }
}

/* --------------------------------------------------------------- analytics */

export async function analytics(t = Date.now()) {
  const funnel = await db
    .prepare(
      `WITH reach AS (
         SELECT o.id, GREATEST(COALESCE(MAX(${rankSql('h.to_stage')}), 0), COALESCE(${rankSql('o.stage')}, 0)) AS r
         FROM crm_opportunities o LEFT JOIN crm_stage_history h ON h.opportunity_id = o.id GROUP BY o.id
       )
       SELECT COUNT(*) AS leads,
              COUNT(*) FILTER (WHERE r >= 1) AS ready,
              COUNT(*) FILTER (WHERE r >= 2) AS contacted,
              COUNT(*) FILTER (WHERE r >= 3) AS replied,
              COUNT(*) FILTER (WHERE r >= 4) AS interested,
              COUNT(*) FILTER (WHERE r >= 6) AS proposals,
              COUNT(*) FILTER (WHERE r >= 7) AS won
       FROM reach`,
    )
    .get<Record<string, number>>()
  const timing = await db
    .prepare(
      `SELECT
         AVG(first_contacted_at - created_at) FILTER (WHERE first_contacted_at IS NOT NULL) AS to_first_contact,
         COUNT(*) FILTER (WHERE first_contacted_at IS NOT NULL) AS contacted_n,
         AVG(won_at - created_at) FILTER (WHERE won_at IS NOT NULL) AS to_close,
         COUNT(*) FILTER (WHERE won_at IS NOT NULL) AS won_n
       FROM crm_opportunities`,
    )
    .get<Record<string, number | null>>()
  const inStage = await db
    .prepare(
      `SELECT to_stage AS stage, AVG(COALESCE(next_at, ?) - changed_at) AS avg_ms, COUNT(*) AS n
       FROM (
         SELECT to_stage, changed_at, LEAD(changed_at) OVER (PARTITION BY opportunity_id ORDER BY changed_at, id) AS next_at
         FROM crm_stage_history
       ) s GROUP BY to_stage`,
    )
    .all<{ stage: string; avg_ms: number; n: number }>(t)
  const last30 = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM crm_opportunities WHERE created_at >= ? AND backfill_run_id IS NULL) AS new_leads,
         (SELECT COUNT(*) FROM crm_deals WHERE status = 'won' AND won_at >= ?) AS won,
         (SELECT COALESCE(SUM(sold_cents), 0) FROM crm_deals WHERE status = 'won' AND won_at >= ?) AS won_cents`,
    )
    .get<Record<string, number>>(t - 30 * DAY_MS, t - 30 * DAY_MS, t - 30 * DAY_MS)
  const f = funnel ?? {}
  return {
    funnel: [
      { key: 'leads', label: 'Leads', count: num(f.leads) },
      { key: 'ready', label: 'Ready to contact', count: num(f.ready) },
      { key: 'contacted', label: 'Contacted', count: num(f.contacted) },
      { key: 'replied', label: 'Replied', count: num(f.replied) },
      { key: 'interested', label: 'Interested', count: num(f.interested) },
      { key: 'proposals', label: 'Proposal sent', count: num(f.proposals) },
      { key: 'won', label: 'Won', count: num(f.won) },
    ],
    avgMsToFirstContact: timing?.to_first_contact == null ? null : num(timing.to_first_contact),
    firstContactSample: num(timing?.contacted_n),
    avgMsToClose: timing?.to_close == null ? null : num(timing.to_close),
    closeSample: num(timing?.won_n),
    timeInStage: STAGES.map((s) => {
      const r = inStage.find((x) => x.stage === s.key)
      return { stage: s.key, avgMs: r ? num(r.avg_ms) : null, samples: r ? num(r.n) : 0 }
    }),
    last30: { newLeads: num(last30?.new_leads), won: num(last30?.won), wonCents: num(last30?.won_cents) },
  }
}

/* ------------------------------------------------------------------ search */

export async function search(q: string) {
  const arg = likeArg(q)
  const m = textMatch('o.search_text', q)
  const leads = await db
    .prepare(
      `SELECT o.*, rp.name AS referrer_name, ap.name AS assignee_name FROM crm_opportunities o
       LEFT JOIN crm_people rp ON rp.id = o.referrer_id LEFT JOIN crm_people ap ON ap.id = o.assigned_to
       WHERE ${m.sql} ORDER BY o.updated_at DESC LIMIT 8`,
    )
    .all<LeadRow>(...m.args)
  const people = await db
    .prepare(
      `SELECT p.id, p.name, p.slug, p.source_type,
              (SELECT COUNT(*) FROM crm_opportunities o WHERE o.referrer_id = p.id) AS leads
       FROM crm_people p WHERE LOWER(p.name) LIKE ? ESCAPE '\\' OR p.slug LIKE ? ESCAPE '\\' ORDER BY p.name LIMIT 5`,
    )
    .all<{ id: string; name: string; slug: string; source_type: string; leads: number }>(arg, arg)
  return {
    leads: leads.map(summarize),
    people: people.map((p) => ({ id: p.id, name: p.name, slug: p.slug, sourceType: p.source_type, leads: num(p.leads) })),
  }
}

/* -------------------------------------------------------------- businesses */

/** One row per business family: its locations rolled up, so a chain reads as one line. */
export async function families(q: string | undefined, limit = 50, offset = 0) {
  const args: unknown[] = []
  let where = ''
  if (q) {
    const m = textMatch('o.search_text', q)
    where = `WHERE ${m.sql}`
    args.push(...m.args)
  }
  const total = await db.prepare(`SELECT COUNT(DISTINCT o.family_key) AS n FROM crm_opportunities o ${where}`).get<{ n: number }>(...args)
  const rows = await db
    .prepare(
      `SELECT o.family_key,
              MIN(o.business_name) AS name,
              MIN(o.brand_id) AS brand_id,
              COUNT(*) AS opportunities,
              COUNT(DISTINCT COALESCE(o.brand_id, o.id)) AS locations,
              STRING_AGG(DISTINCT o.city, ', ') AS cities,
              COUNT(*) FILTER (WHERE o.stage IN ${OPEN}) AS open,
              COUNT(*) FILTER (WHERE o.won_at IS NOT NULL) AS won,
              COALESCE(SUM(o.potential_cents) FILTER (WHERE o.stage IN ${OPEN}), 0) AS pipeline,
              COALESCE((SELECT SUM(d.sold_cents) FROM crm_deals d JOIN crm_opportunities x ON x.id = d.opportunity_id
                        WHERE x.family_key = o.family_key AND d.status = 'won'), 0) AS one_time,
              COALESCE((SELECT SUM(d.monthly_cents) FROM crm_deals d JOIN crm_opportunities x ON x.id = d.opportunity_id
                        WHERE x.family_key = o.family_key AND d.status = 'won' AND d.recurring_active), 0) AS mrr
       FROM crm_opportunities o ${where}
       GROUP BY o.family_key
       ORDER BY COUNT(DISTINCT COALESCE(o.brand_id, o.id)) DESC, MIN(o.business_name)
       LIMIT ? OFFSET ?`,
    )
    .all<{
      family_key: string
      name: string
      brand_id: string | null
      opportunities: number
      locations: number
      cities: string | null
      open: number
      won: number
      pipeline: number
      one_time: number
      mrr: number
    }>(...args, Math.min(Math.max(limit, 1), 200), Math.max(offset, 0))
  return {
    total: num(total?.n),
    families: rows.map((r) => ({
      familyKey: r.family_key,
      name: r.name,
      icon: businessById(r.brand_id)?.icon ?? null,
      opportunities: num(r.opportunities),
      locations: num(r.locations),
      cities: r.cities ?? '',
      open: num(r.open),
      won: num(r.won),
      pipelineCents: num(r.pipeline),
      oneTimeCents: num(r.one_time),
      mrrCents: num(r.mrr),
    })),
  }
}

/* ---------------------------------------------------------------- pipeline */

/** Per stage: how many leads, and what they are worth at their quote. One query. */
export async function pipelineSummary() {
  const rows = await db
    .prepare('SELECT stage, COUNT(*) AS n, COALESCE(SUM(potential_cents), 0) AS v FROM crm_opportunities GROUP BY stage')
    .all<{ stage: string; n: number; v: number }>()
  return { stages: STAGES.map((st) => { const r = rows.find((x) => x.stage === st.key); return { stage: st.key, count: num(r?.n), valueCents: num(r?.v) } }) }
}
