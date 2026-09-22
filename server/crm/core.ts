/*
  THE CRM'S WRITES. Every mutation that touches more than one row runs in one
  transaction, so a stage change can never exist without its history row, a
  won deal without its opportunity update, or a follow-up without the lead's
  next-follow-up date moving with it.
*/
import { randomBytes } from 'node:crypto'
import { db } from '../db/schema'
import {
  CONTACT_ACTIVITY_TYPES,
  familyKey,
  fmtMoney,
  isStage,
  normEmail,
  normInstagram,
  normPhone,
  stageOf,
  stageRank,
} from '../../src/crm/model'
import { businessById } from './directory'

export const nid = (prefix: string) => `${prefix}_${randomBytes(9).toString('base64url')}`
export const now = () => Date.now()

export class CrmError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message)
  }
}

/* ------------------------------------------------------------------ rows */

export interface OppRow {
  id: string
  brand_id: string | null
  application_id: string | null
  business_name: string
  family_key: string
  city: string | null
  category: string | null
  website_status: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  opportunity_type: string
  stage: string
  stage_changed_at: number
  referrer_id: string | null
  source_type: string | null
  campaign: string | null
  referred_at: number | null
  referral_note: string | null
  assigned_to: string | null
  closed_by: string | null
  contact_name: string | null
  preferred_channel: string | null
  priority: string
  potential_cents: number
  next_followup_at: number | null
  last_activity_at: number | null
  first_contacted_at: number | null
  won_at: number | null
  lost_at: number | null
  search_text: string
  backfill_run_id: string | null
  created_at: number
  updated_at: number
  created_by: string
}

export interface PersonRow {
  id: string
  slug: string
  name: string
  source_type: string
  role: 'admin' | 'team' | 'partner' | 'none'
  is_team: boolean
  brand_id: string | null
  member_id: string | null
  active: boolean
  created_at: number
  updated_at: number
  created_by: string
}

export interface DealRow {
  id: string
  opportunity_id: string
  offer_id: string | null
  offer_name: string
  quoted_cents: number
  sold_cents: number | null
  monthly_cents: number
  status: 'open' | 'won' | 'lost'
  recurring_active: boolean
  won_at: number | null
  lost_at: number | null
  loss_reason: string | null
  closed_by: string | null
  created_at: number
  updated_at: number
  created_by: string
}

export interface OfferRow {
  id: string
  name: string
  opportunity_type: string
  one_time_cents: number
  monthly_cents: number
  active: boolean
  sort: number
}

export async function getOpp(id: string): Promise<OppRow> {
  const row = await db.prepare('SELECT * FROM crm_opportunities WHERE id = ?').get<OppRow>(id)
  if (!row) throw new CrmError(404, 'No such lead.')
  return row
}

export async function getPerson(id: string | null | undefined): Promise<PersonRow | null> {
  if (!id) return null
  return (await db.prepare('SELECT * FROM crm_people WHERE id = ?').get<PersonRow>(id)) ?? null
}

async function requirePerson(id: string, opts: { team?: boolean } = {}): Promise<PersonRow> {
  const p = await getPerson(id)
  if (!p || !p.active) throw new CrmError(400, 'No such person.')
  if (opts.team && !p.is_team) throw new CrmError(400, `${p.name} is not on the team, so cannot own a lead or a deal.`)
  return p
}

/* ------------------------------------------------------------ search text */

/** What the lead search matches: name, city, category, contact, referrer. */
export function searchTextOf(o: {
  business_name: string
  city?: string | null
  category?: string | null
  phone?: string | null
  email?: string | null
  instagram?: string | null
  contact_name?: string | null
  referrer_name?: string | null
}): string {
  return [o.business_name, o.city, o.category, o.phone, o.email, o.instagram ? `@${o.instagram}` : '', o.contact_name, o.referrer_name]
    .filter(Boolean)
    .join(' | ')
    .toLowerCase()
}

export async function refreshSearchText(oppId: string): Promise<void> {
  const o = await db
    .prepare(
      `SELECT o.*, p.name AS referrer_name FROM crm_opportunities o
       LEFT JOIN crm_people p ON p.id = o.referrer_id WHERE o.id = ?`,
    )
    .get<OppRow & { referrer_name: string | null }>(oppId)
  if (!o) return
  await db.prepare('UPDATE crm_opportunities SET search_text = ? WHERE id = ?').run(searchTextOf(o), oppId)
}

/* ------------------------------------------------------------- activities */

export async function addActivity(
  oppId: string,
  type: string,
  actor: string,
  body: string | null,
  data: Record<string, unknown> | null = null,
  occurredAt = now(),
): Promise<string> {
  const id = nid('act')
  await db
    .prepare(
      `INSERT INTO crm_activities (id, opportunity_id, type, body, data, actor, occurred_at, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
    )
    .run(id, oppId, type, body, data ? JSON.stringify(data) : null, actor, occurredAt, now())
  await db
    .prepare('UPDATE crm_opportunities SET last_activity_at = GREATEST(COALESCE(last_activity_at, 0), ?), updated_at = ? WHERE id = ?')
    .run(occurredAt, now(), oppId)
  if (CONTACT_ACTIVITY_TYPES.includes(type)) {
    await db
      .prepare('UPDATE crm_opportunities SET first_contacted_at = ? WHERE id = ? AND (first_contacted_at IS NULL OR first_contacted_at > ?)')
      .run(occurredAt, oppId, occurredAt)
  }
  return id
}

/* ----------------------------------------------------------- opportunities */

export interface NewOpportunity {
  brandId?: string | null
  applicationId?: string | null
  /** Required for a prospect that is not listed yet; ignored for a listed business. */
  businessName?: string
  city?: string | null
  category?: string | null
  phone?: string | null
  email?: string | null
  instagram?: string | null
  opportunityType: string
  stage?: string
  referrerId?: string | null
  sourceType?: string | null
  campaign?: string | null
  referredAt?: number | null
  referralNote?: string | null
  assignedTo?: string | null
  contactName?: string | null
  potentialCents?: number
  backfillRunId?: string | null
  websiteStatus?: string | null
  note?: string | null
}

/**
 * Create one opportunity with its first history row and activity, in one
 * transaction. A listed business takes its name, city, category, website
 * status and contacts from the listing; nothing passed in overrides them.
 */
export const createOpportunity = db.transaction(async (input: NewOpportunity, actor: string): Promise<string> => {
  const t = now()
  const stage = input.stage ?? 'new_lead'
  if (!isStage(stage)) throw new CrmError(400, 'Unknown stage.')
  const biz = businessById(input.brandId ?? null)
  if (input.brandId && !biz) throw new CrmError(400, 'No such business on BEASTY.')
  const name = biz?.name ?? String(input.businessName ?? '').trim()
  if (name.length < 2) throw new CrmError(400, 'A business name is required.')
  if (input.referrerId) await requirePerson(input.referrerId)
  if (input.assignedTo) await requirePerson(input.assignedTo, { team: true })
  const referrer = await getPerson(input.referrerId)
  const row = {
    business_name: name,
    city: biz?.city ?? input.city ?? null,
    category: biz?.category ?? input.category ?? null,
    phone: biz ? biz.channels.phone : normPhone(input.phone),
    email: biz ? biz.channels.email : normEmail(input.email),
    instagram: biz ? biz.channels.instagram : normInstagram(input.instagram),
  }
  const id = nid('opp')
  await db
    .prepare(
      `INSERT INTO crm_opportunities (
         id, brand_id, application_id, business_name, family_key, city, category, website_status,
         phone, email, instagram, opportunity_type, stage, stage_changed_at,
         referrer_id, source_type, campaign, referred_at, referral_note,
         assigned_to, contact_name, potential_cents, search_text, backfill_run_id,
         created_at, updated_at, created_by
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      id,
      biz?.id ?? null,
      input.applicationId ?? null,
      row.business_name,
      biz?.familyKey ?? familyKey(name),
      row.city,
      row.category,
      biz?.websiteStatus ?? input.websiteStatus ?? null,
      row.phone || null,
      row.email || null,
      row.instagram || null,
      input.opportunityType,
      stage,
      t,
      input.referrerId ?? null,
      input.sourceType ?? (input.referrerId ? referrer?.source_type ?? null : null),
      input.campaign ?? null,
      input.referrerId || input.sourceType ? input.referredAt ?? t : null,
      input.referralNote ?? null,
      input.assignedTo ?? null,
      input.contactName ?? null,
      Math.max(0, Math.round(input.potentialCents ?? 0)),
      searchTextOf({ ...row, contact_name: input.contactName, referrer_name: referrer?.name }),
      input.backfillRunId ?? null,
      t,
      t,
      actor,
    )
  await db
    .prepare(
      `INSERT INTO crm_stage_history (id, opportunity_id, from_stage, to_stage, changed_at, changed_by, note)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .run(nid('sh'), id, null, stage, t, actor, input.note ?? null)
  await addActivity(id, 'SYSTEM', actor, input.note ?? 'Lead created', { stage }, t)
  if (input.referrerId || input.sourceType) {
    await addActivity(
      id,
      'REFERRAL',
      actor,
      referrer ? `Referred by ${referrer.name}` : `Source: ${input.sourceType}`,
      { referrerId: input.referrerId ?? null, sourceType: input.sourceType ?? null, campaign: input.campaign ?? null },
      input.referredAt ?? t,
    )
  }
  return id
})

/**
 * Move a lead to another stage. The previous stage, the new one, when and by
 * whom go into crm_stage_history; won_at / lost_at / first_contacted_at are
 * stamped the first time they apply.
 */
/*
  The body without the transaction, for callers already inside one. The db
  wrapper opens a NEW connection per transaction(), so calling the wrapped
  changeStage from inside markDealWon would wait forever on the row lock the
  outer transaction holds.
*/
async function changeStageInTx(oppId: string, to: string, actor: string, note?: string | null) {
  if (!isStage(to)) throw new CrmError(400, 'Unknown stage.')
  const o = await db.prepare('SELECT * FROM crm_opportunities WHERE id = ? FOR UPDATE').get<OppRow>(oppId)
  if (!o) throw new CrmError(404, 'No such lead.')
  if (o.stage === to) return { changed: false, stage: to }
  const t = now()
  const group = stageOf(to)?.group
  const rank = stageRank(to)
  await db
    .prepare(
      `UPDATE crm_opportunities SET
         stage = ?, stage_changed_at = ?, updated_at = ?,
         won_at = CASE WHEN ? THEN COALESCE(won_at, ?) ELSE won_at END,
         lost_at = CASE WHEN ? THEN ? ELSE lost_at END,
         first_contacted_at = CASE WHEN ? AND first_contacted_at IS NULL THEN ? ELSE first_contacted_at END
       WHERE id = ?`,
    )
    .run(to, t, t, group === 'won', t, group === 'closed', t, rank !== null && rank >= 2, t, oppId)
  await db
    .prepare(
      `INSERT INTO crm_stage_history (id, opportunity_id, from_stage, to_stage, changed_at, changed_by, note)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .run(nid('sh'), oppId, o.stage, to, t, actor, note ?? null)
  await addActivity(oppId, 'STAGE_CHANGE', actor, note ?? null, { from: o.stage, to }, t)
  return { changed: true, stage: to }
}

export const changeStage = db.transaction(changeStageInTx)

/** Assign (or unassign) the person who works the lead. Never touches the referrer. */
export const setAssignee = db.transaction(async (oppId: string, personId: string | null, actor: string) => {
  const o = await getOpp(oppId)
  if (personId) await requirePerson(personId, { team: true })
  if ((o.assigned_to ?? null) === (personId ?? null)) return
  await db.prepare('UPDATE crm_opportunities SET assigned_to = ?, updated_at = ? WHERE id = ?').run(personId, now(), oppId)
  const p = await getPerson(personId)
  await addActivity(oppId, 'ASSIGNMENT', actor, p ? `Assigned to ${p.name}` : 'Unassigned', { from: o.assigned_to, to: personId })
})

/** Who closed it. Separate from both the referrer and the assignee. */
export const setClosedBy = db.transaction(async (oppId: string, personId: string | null, actor: string) => {
  const o = await getOpp(oppId)
  if (personId) await requirePerson(personId, { team: true })
  if ((o.closed_by ?? null) === (personId ?? null)) return
  await db.prepare('UPDATE crm_opportunities SET closed_by = ?, updated_at = ? WHERE id = ?').run(personId, now(), oppId)
  const p = await getPerson(personId)
  await addActivity(oppId, 'ASSIGNMENT', actor, p ? `Closed by ${p.name}` : 'Closed-by cleared', { closedByFrom: o.closed_by, closedByTo: personId })
})

/**
 * Record who brought the business. The FIRST attribution stands: once a
 * referrer or source is set, only an admin can change it, with a reason, and
 * the old values stay in the activity log.
 */
export const setReferral = db.transaction(
  async (
    oppId: string,
    input: { referrerId?: string | null; sourceType?: string | null; campaign?: string | null; note?: string | null; referredAt?: number | null },
    actor: string,
    override: { allowed: boolean; reason?: string | null } = { allowed: false },
  ) => {
    const o = await db.prepare('SELECT * FROM crm_opportunities WHERE id = ? FOR UPDATE').get<OppRow>(oppId)
    if (!o) throw new CrmError(404, 'No such lead.')
    const already = !!(o.referrer_id || o.source_type)
    if (already) {
      if (!override.allowed) {
        throw new CrmError(409, 'This lead already has its original source. Only an admin can change it, with a reason.')
      }
      if (!override.reason || override.reason.trim().length < 3) throw new CrmError(400, 'Say why the original source is being changed.')
    }
    if (input.referrerId) await requirePerson(input.referrerId)
    if (input.sourceType) {
      const st = await db.prepare('SELECT key FROM crm_source_types WHERE key = ?').get(input.sourceType)
      if (!st) throw new CrmError(400, 'Unknown source type.')
    }
    const referrer = await getPerson(input.referrerId)
    const sourceType = input.sourceType ?? referrer?.source_type ?? null
    if (!input.referrerId && !sourceType) throw new CrmError(400, 'A referrer or a source is required.')
    const t = now()
    await db
      .prepare(
        `UPDATE crm_opportunities SET referrer_id = ?, source_type = ?, campaign = ?, referral_note = ?,
           referred_at = ?, updated_at = ? WHERE id = ?`,
      )
      .run(input.referrerId ?? null, sourceType, input.campaign ?? null, input.note ?? null, input.referredAt ?? (already ? o.referred_at ?? t : t), t, oppId)
    await addActivity(
      oppId,
      'REFERRAL',
      actor,
      referrer ? `Referred by ${referrer.name}` : `Source: ${sourceType}`,
      {
        referrerId: input.referrerId ?? null,
        sourceType,
        campaign: input.campaign ?? null,
        ...(already ? { override: true, reason: override.reason, previous: { referrerId: o.referrer_id, sourceType: o.source_type, campaign: o.campaign } } : {}),
      },
    )
    await refreshSearchText(oppId)
  },
)

/* -------------------------------------------------------------- follow-ups */

async function syncNextFollowup(oppId: string) {
  await db
    .prepare(
      `UPDATE crm_opportunities SET next_followup_at =
         (SELECT MIN(due_at) FROM crm_followups WHERE opportunity_id = ? AND completed_at IS NULL)
       WHERE id = ?`,
    )
    .run(oppId, oppId)
}

export const createFollowup = db.transaction(
  async (
    oppId: string,
    f: { dueAt: number; ownerId?: string | null; priority?: string; type?: string; notes?: string | null },
    actor: string,
  ) => {
    await getOpp(oppId)
    if (f.ownerId) await requirePerson(f.ownerId, { team: true })
    const id = nid('fu')
    await db
      .prepare(
        `INSERT INTO crm_followups (id, opportunity_id, due_at, owner_id, priority, type, notes, created_at, created_by)
         VALUES (?,?,?,?,?,?,?,?,?)`,
      )
      .run(id, oppId, f.dueAt, f.ownerId ?? null, f.priority ?? 'normal', f.type ?? 'other', f.notes ?? null, now(), actor)
    await syncNextFollowup(oppId)
    const owner = await getPerson(f.ownerId)
    await addActivity(oppId, 'FOLLOW_UP', actor, f.notes ?? null, {
      followupId: id,
      dueAt: f.dueAt,
      owner: owner?.name ?? null,
      type: f.type ?? 'other',
      scheduled: true,
    })
    return id
  },
)

export const completeFollowup = db.transaction(async (followupId: string, actor: string, outcome?: string | null) => {
  const f = await db
    .prepare('SELECT * FROM crm_followups WHERE id = ? FOR UPDATE')
    .get<{ id: string; opportunity_id: string; completed_at: number | null; type: string }>(followupId)
  if (!f) throw new CrmError(404, 'No such follow-up.')
  if (f.completed_at) return
  const t = now()
  await db.prepare('UPDATE crm_followups SET completed_at = ?, completed_by = ? WHERE id = ?').run(t, actor, followupId)
  await syncNextFollowup(f.opportunity_id)
  await addActivity(f.opportunity_id, 'FOLLOW_UP', actor, outcome ?? null, { followupId, completed: true, type: f.type })
})

/* ------------------------------------------------------------------- deals */

async function requireOffer(offerId: string): Promise<OfferRow> {
  const offer = await db.prepare('SELECT * FROM crm_offers WHERE id = ?').get<OfferRow>(offerId)
  if (!offer) throw new CrmError(400, 'No such offer.')
  return offer
}

/**
 * Quote an offer. The name and both prices are COPIED onto the deal, so a
 * later edit to the offer changes future quotes and never this one.
 */
export const createDeal = db.transaction(
  async (oppId: string, d: { offerId: string; quotedCents?: number | null; monthlyCents?: number | null }, actor: string) => {
    await getOpp(oppId)
    const offer = await requireOffer(d.offerId)
    const quoted = d.quotedCents ?? offer.one_time_cents
    const monthly = d.monthlyCents ?? offer.monthly_cents
    const id = nid('deal')
    const t = now()
    await db
      .prepare(
        `INSERT INTO crm_deals (id, opportunity_id, offer_id, offer_name, quoted_cents, monthly_cents, status, created_at, updated_at, created_by)
         VALUES (?,?,?,?,?,?,'open',?,?,?)`,
      )
      .run(id, oppId, offer.id, offer.name, quoted, monthly, t, t, actor)
    await db.prepare('UPDATE crm_opportunities SET potential_cents = ?, updated_at = ? WHERE id = ?').run(quoted, t, oppId)
    await addActivity(oppId, 'PROPOSAL', actor, `${offer.name}: ${fmtMoney(quoted)}${monthly ? ` + ${fmtMoney(monthly)}/mo` : ''}`, {
      dealId: id,
      offer: offer.name,
      quotedCents: quoted,
      monthlyCents: monthly,
    })
    return id
  },
)

async function lockDeal(dealId: string): Promise<DealRow> {
  const deal = await db.prepare('SELECT * FROM crm_deals WHERE id = ? FOR UPDATE').get<DealRow>(dealId)
  if (!deal) throw new CrmError(404, 'No such deal.')
  return deal
}

/**
 * Close a deal as won: the sold price (the quote unless told otherwise), who
 * closed it, and recurring revenue switched on when there is a monthly part.
 * The lead moves to Won if it is not already won or later.
 */
export const markDealWon = db.transaction(
  async (dealId: string, w: { soldCents?: number | null; closedBy?: string | null; recurring?: boolean }, actor: string) => {
    const deal = await lockDeal(dealId)
    if (deal.status === 'won') throw new CrmError(409, 'This deal is already won.')
    if (w.closedBy) await requirePerson(w.closedBy, { team: true })
    const sold = w.soldCents ?? deal.quoted_cents
    const recurring = w.recurring ?? deal.monthly_cents > 0
    const t = now()
    await db
      .prepare(
        `UPDATE crm_deals SET status = 'won', sold_cents = ?, won_at = ?, lost_at = NULL, loss_reason = NULL,
           closed_by = ?, recurring_active = ?, updated_at = ? WHERE id = ?`,
      )
      .run(sold, t, w.closedBy ?? null, recurring, t, dealId)
    if (w.closedBy) {
      await db.prepare('UPDATE crm_opportunities SET closed_by = ? WHERE id = ?').run(w.closedBy, deal.opportunity_id)
    }
    await addActivity(deal.opportunity_id, 'DEAL_WON', actor, `${deal.offer_name} won`, {
      dealId,
      soldCents: sold,
      monthlyCents: recurring ? deal.monthly_cents : 0,
      closedBy: w.closedBy ?? null,
    })
    const o = await getOpp(deal.opportunity_id)
    if (stageOf(o.stage)?.group !== 'won') await changeStageInTx(deal.opportunity_id, 'won', actor, `${deal.offer_name} won`)
    else await db.prepare('UPDATE crm_opportunities SET won_at = COALESCE(won_at, ?) WHERE id = ?').run(t, deal.opportunity_id)
  },
)

export const markDealLost = db.transaction(async (dealId: string, reason: string, actor: string) => {
  const deal = await lockDeal(dealId)
  if (deal.status === 'lost') throw new CrmError(409, 'This deal is already lost.')
  const t = now()
  await db
    .prepare(
      `UPDATE crm_deals SET status = 'lost', lost_at = ?, loss_reason = ?, recurring_active = FALSE, updated_at = ? WHERE id = ?`,
    )
    .run(t, reason, t, dealId)
  await addActivity(deal.opportunity_id, 'DEAL_LOST', actor, reason, { dealId, reason })
})

/** Stop (or restart) the monthly part of a won deal, e.g. a cancelled plan. */
export const setRecurring = db.transaction(async (dealId: string, active: boolean, actor: string) => {
  const deal = await lockDeal(dealId)
  if (deal.status !== 'won') throw new CrmError(409, 'Only a won deal has recurring revenue.')
  await db.prepare('UPDATE crm_deals SET recurring_active = ?, updated_at = ? WHERE id = ?').run(active, now(), dealId)
  await addActivity(deal.opportunity_id, 'SYSTEM', actor, active ? 'Recurring revenue restarted' : 'Recurring revenue stopped', {
    dealId,
    recurringActive: active,
  })
})
