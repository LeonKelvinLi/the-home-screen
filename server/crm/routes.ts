/*
  THE CRM'S HTTP SURFACE. Same conventions as server/index.ts: JSON in and out,
  a rate limiter on every route, validation before any write, and errors as
  { error } with a meaningful status. Every /api/crm route except the session
  exchange requires a CRM role, checked on the server by requireCrm.
*/
import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import type { Express, NextFunction, Request, RequestHandler, Response } from 'express'
import { db } from '../db/schema'
import {
  DEFAULT_SOURCE_TYPES,
  FOLLOWUP_TYPES,
  MANUAL_ACTIVITY_TYPES,
  OPPORTUNITY_KEYS,
  OPPORTUNITY_TYPES,
  PRIORITIES,
  STAGES,
  WEBSITE_STATUSES,
  familyKey,
  isStage,
  normEmail,
  normInstagram,
  normPhone,
} from '../../src/crm/model'
import { crmActor, endCrmSession, requireCrm, startCrmSession } from './auth'
import type { CrmDeps } from './auth'
import {
  CrmError,
  changeStage,
  completeFollowup,
  createDeal,
  createFollowup,
  createOpportunity,
  getOpp,
  GLENN_ID,
  markDealLost,
  markDealWon,
  now,
  refreshSearchText,
  setAssignee,
  setClosedBy,
  setRecurring,
  setReferral,
  addActivity,
} from './core'
import type { OfferRow, PersonRow } from './core'
import { businessById, seatedBusinesses } from './directory'
import {
  analytics,
  families,
  filterOptions,
  followupView,
  leadDetail,
  listLeads,
  overview,
  partnerView,
  pipelineSummary,
  referrerDetail,
  referrerList,
  revenue,
  search,
} from './queries'
import type { LeadFilters } from './queries'
import { createFromApplication, runBackfill } from './backfill'

type Limiter = (perMinute: number, burst: number) => RequestHandler

/* -------------------------------------------------------------- helpers */

const str = (v: unknown, max = 200): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const optStr = (v: unknown, max = 200): string | null => {
  const s = str(v, max)
  return s ? s : null
}
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const cents = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 100_000_000) throw new CrmError(400, 'Amounts are whole cents between 0 and $1,000,000.')
  return Math.round(n)
}
const ms = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 946684800000 || n > 4102444800000) throw new CrmError(400, 'Dates are milliseconds since 1970.')
  return Math.round(n)
}
const list = (v: unknown): string[] =>
  (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [])
    .map((x) => String(x).trim())
    .filter(Boolean)
    .slice(0, 30)
const bool = (v: unknown): boolean | undefined => (v === '1' || v === 'true' || v === true ? true : v === '0' || v === 'false' || v === false ? false : undefined)

/** Wrap a handler so thrown CrmErrors become JSON and anything else reaches the app's error handler. */
const h =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof CrmError) return res.status(err.status).json({ error: err.message, ...(err.extra ?? {}) })
      const code = (err as { code?: string }).code
      if (code === '23505') return res.status(409).json({ error: 'That already exists.' })
      next(err)
    }
  }

const actorOf = (req: Request) => req.crm?.actor ?? 'unknown'

/** "7d", "30d", "month", "year" or "all" as a start time. Month and year are Pacific. */
export function periodStart(period: unknown, t = now()): number {
  const p = typeof period === 'string' ? period : 'all'
  if (p === '7d') return t - 7 * 864e5
  if (p === '30d') return t - 30 * 864e5
  if (p === 'month' || p === 'year') {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit' }).formatToParts(new Date(t))
    const y = Number(parts.find((x) => x.type === 'year')?.value)
    const m = Number(parts.find((x) => x.type === 'month')?.value)
    // 08:00 UTC is midnight Pacific in winter and 1am in summer: close enough for a filter.
    return Date.UTC(y, p === 'month' ? m - 1 : 0, 1, 8)
  }
  return 0
}

/* ------------------------------------------------------- referral cookie */

export const REF_COOKIE = 'beasty_crm_ref'
const REF_DAYS = 90

let DEPS: CrmDeps | null = null

function signRef(parts: string[], secret: string) {
  return createHmac('sha256', secret).update(`crm-ref|${parts.join('|')}`).digest('base64url').slice(0, 32)
}

interface RefCookie {
  personId: string
  at: number
  via: string
  campaign: string
  nonce: string
}

/** A referral cookie, verified: a forged or edited one reads as none at all. */
export function readRef(req: Request, deps: CrmDeps): RefCookie | null {
  const raw = deps.readCookie(req, REF_COOKIE)
  if (!raw) return null
  const parts = raw.split('.')
  if (parts.length !== 6) return null
  const [personId, at, via, campaign, nonce, sig] = parts
  const want = signRef([personId, at, via, campaign, nonce], deps.secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(want)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  const t = Number(at)
  if (!Number.isFinite(t) || now() - t > REF_DAYS * 864e5) return null
  return { personId, at: t, via, campaign, nonce }
}

/**
 * A Reserve-a-spot request becomes a CRM lead, credited to whoever's link
 * brought the visitor (first touch), or marked organic. Best-effort by design:
 * the request is already saved, and nothing here may fail it.
 */
export async function crmOnApplication(
  req: Request,
  a: { id: string; business: string; cuisine: string | null; contact: string; city: string | null; social: string | null; created_at: number },
): Promise<void> {
  try {
    const ref = DEPS ? readRef(req, DEPS) : null
    let referrerId: string | null = null
    if (ref) {
      const p = await db.prepare('SELECT id FROM crm_people WHERE id = ? AND active').get<{ id: string }>(ref.personId)
      referrerId = p?.id ?? null
    }
    await createFromApplication(a, {
      actor: 'system:referral-link',
      referrerId,
      sourceType: referrerId ? ref?.via ?? 'referral_link' : 'organic',
      campaign: referrerId ? ref?.campaign || null : null,
      referredAt: referrerId ? ref?.at ?? a.created_at : a.created_at,
    })
  } catch (err) {
    console.error('crm: could not create a lead from an application:', String((err as Error).message ?? err).slice(0, 200))
  }
}

/* ----------------------------------------------------------------- mount */

export function mountCrm(app: Express, deps: CrmDeps, rateLimiter: Limiter) {
  DEPS = deps
  const team = requireCrm(deps, 'team')
  const admin = requireCrm(deps, 'admin')
  const partner = requireCrm(deps, 'partner')
  /* Generous for reads: the board alone asks for eight columns at once, and a
     person flicking between pages must never see a 429. Writes stay tighter. */
  const read = rateLimiter(900, 180)
  const write = rateLimiter(120, 30)

  /* ---- session ---- */

  app.post(
    '/api/crm/session',
    rateLimiter(10, 5),
    h(async (req, res) => {
      const token = isObj(req.body) ? str(req.body.token, 500) : ''
      if (!deps.isOperatorToken(token)) return res.status(401).json({ error: 'That key is not right.' })
      await startCrmSession(res, deps)
      res.json({ ok: true })
    }),
  )

  app.delete(
    '/api/crm/session',
    rateLimiter(20, 10),
    h(async (req, res) => {
      await endCrmSession(req, res, deps)
      res.json({ ok: true })
    }),
  )

  app.get(
    '/api/crm/me',
    read,
    h(async (req, res) => {
      res.set('Cache-Control', 'no-store')
      const who = await crmActor(req, deps)
      const member = who ? null : await deps.memberFromRequest(req)
      res.json({ actor: who, member: member ? { name: member.name } : null })
    }),
  )

  /* ---- reference data ---- */

  app.get(
    '/api/crm/meta',
    read,
    team,
    h(async (_req, res) => {
      const people = await db.prepare('SELECT * FROM crm_people ORDER BY name').all<PersonRow>()
      const offers = await db.prepare('SELECT * FROM crm_offers ORDER BY sort, name').all<OfferRow>()
      res.json({
        stages: STAGES,
        opportunityTypes: OPPORTUNITY_TYPES,
        websiteStatuses: WEBSITE_STATUSES,
        followupTypes: FOLLOWUP_TYPES,
        priorities: PRIORITIES,
        activityTypes: MANUAL_ACTIVITY_TYPES,
        people: people.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sourceType: p.source_type,
          role: p.role,
          isTeam: p.is_team,
          brandId: p.brand_id,
          icon: businessById(p.brand_id)?.icon ?? null,
          linked: !!p.member_id,
          active: p.active,
        })),
        offers: offers.map(offerOut),
        ...(await filterOptions()),
      })
    }),
  )

  /* ---- dashboard ---- */

  app.get('/api/crm/overview', read, team, h(async (_req, res) => void res.json(await overview())))
  app.get('/api/crm/pipeline', read, team, h(async (_req, res) => void res.json(await pipelineSummary())))

  /* ---- leads ---- */

  const filtersOf = (q: Record<string, unknown>): LeadFilters => ({
    q: optStr(q.q, 80) ?? undefined,
    stage: list(q.stage).filter(isStage),
    city: optStr(q.city) ?? undefined,
    category: optStr(q.category) ?? undefined,
    referrer: optStr(q.referrer, 60) ?? undefined,
    assigned: optStr(q.assigned, 60) ?? undefined,
    websiteStatus: list(q.websiteStatus),
    type: optStr(q.type, 40) ?? undefined,
    source: optStr(q.source, 40) ?? undefined,
    family: optStr(q.family, 120) ?? undefined,
    since: ms(q.since) ?? undefined,
    hasPhone: bool(q.hasPhone),
    hasEmail: bool(q.hasEmail),
    hasInstagram: bool(q.hasInstagram),
    overdue: bool(q.overdue),
    uncontacted: bool(q.uncontacted),
    imported: bool(q.imported),
    attention: optStr(q.attention, 40) ?? undefined,
    sort: optStr(q.sort, 20) ?? undefined,
    limit: Number(q.limit ?? 50) || 50,
    offset: Number(q.offset ?? 0) || 0,
  })

  app.get('/api/crm/leads', read, team, h(async (req, res) => void res.json(await listLeads(filtersOf(req.query as Record<string, unknown>)))))

  app.get('/api/crm/leads/:id', read, team, h(async (req, res) => void res.json(await leadDetail(String(req.params.id)))))

  /**
   * A new lead. For a listed business, pass its brand id: the listing is the
   * record. For a prospect not on BEASTY yet, pass its name and whatever
   * contact is known; if it looks like a business already on BEASTY or already
   * in the CRM, the request is refused with the candidates unless `force`.
   */
  app.post(
    '/api/crm/leads',
    write,
    team,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const b = req.body
      const brandId = optStr(b.brandId, 80)
      const type = str(b.opportunityType, 40) || 'website'
      if (!OPPORTUNITY_KEYS.includes(type)) throw new CrmError(400, 'Unknown opportunity type.')
      if (brandId && !businessById(brandId)) throw new CrmError(400, 'No such business on BEASTY.')
      if (!brandId && !b.force) {
        const name = str(b.businessName, 120)
        const fam = familyKey(name)
        const phone = normPhone(str(b.phone))
        const email = normEmail(str(b.email))
        const ig = normInstagram(str(b.instagram))
        const listed = seatedBusinesses()
          .filter(
            (x) =>
              x.familyKey === fam ||
              (phone && x.channels.phone === phone) ||
              (email && x.channels.email === email) ||
              (ig && x.channels.instagram === ig),
          )
          .slice(0, 10)
          .map((x) => ({ brandId: x.id, name: x.name, city: x.city }))
        const inCrm = await db
          .prepare(
            `SELECT id, business_name, city FROM crm_opportunities
             WHERE family_key = ? OR (? <> '' AND phone = ?) OR (? <> '' AND email = ?) OR (? <> '' AND instagram = ?) LIMIT 10`,
          )
          .all<{ id: string; business_name: string; city: string | null }>(fam, phone, phone, email, email, ig, ig)
        if (listed.length || inCrm.length) {
          throw new CrmError(409, 'This looks like a business BEASTY already has. Use it, or send force to create a separate prospect.', {
            candidates: { listed, leads: inCrm.map((x) => ({ id: x.id, name: x.business_name, city: x.city })) },
          })
        }
      }
      const referrerId = optStr(b.referrerId, 60)
      const sourceType = optStr(b.sourceType, 40)
      if (sourceType) {
        const st = await db.prepare('SELECT key FROM crm_source_types WHERE key = ?').get(sourceType)
        if (!st) throw new CrmError(400, 'Unknown source type.')
      }
      const offer = await db
        .prepare('SELECT * FROM crm_offers WHERE opportunity_type = ? AND active ORDER BY sort LIMIT 1')
        .get<OfferRow>(type === 'website_redesign' ? 'website' : type)
      const id = await createOpportunity(
        {
          brandId,
          businessName: str(b.businessName, 120),
          city: optStr(b.city, 80),
          category: optStr(b.category, 80),
          phone: optStr(b.phone, 40),
          email: optStr(b.email, 120),
          instagram: optStr(b.instagram, 120),
          opportunityType: type,
          stage: isStage(b.stage) ? b.stage : 'new_lead',
          referrerId,
          sourceType,
          campaign: optStr(b.campaign, 60),
          referredAt: ms(b.referredAt),
          referralNote: optStr(b.referralNote, 500),
          assignedTo: optStr(b.assignedTo, 60),
          contactName: optStr(b.contactName, 120),
          potentialCents: cents(b.potentialCents) ?? offer?.one_time_cents ?? 0,
          note: optStr(b.note, 500),
        },
        actorOf(req),
      )
      res.status(201).json({ id })
    }),
  )

  app.patch(
    '/api/crm/leads/:id',
    write,
    team,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const id = String(req.params.id)
      const b = req.body
      const o = await getOpp(id)
      const who = req.crm!
      if ('assignedTo' in b) await setAssignee(id, optStr(b.assignedTo, 60), who.actor)
      if ('closedBy' in b) await setClosedBy(id, optStr(b.closedBy, 60), who.actor)
      const sets: string[] = []
      const args: unknown[] = []
      if ('contactName' in b) {
        sets.push('contact_name = ?')
        args.push(optStr(b.contactName, 120))
      }
      if ('preferredChannel' in b) {
        const c = optStr(b.preferredChannel, 20)
        if (c && !['phone', 'text', 'email', 'instagram'].includes(c)) throw new CrmError(400, 'Unknown channel.')
        sets.push('preferred_channel = ?')
        args.push(c)
      }
      if ('priority' in b) {
        const p = str(b.priority, 10)
        if (!(PRIORITIES as readonly string[]).includes(p)) throw new CrmError(400, 'Unknown priority.')
        sets.push('priority = ?')
        args.push(p)
      }
      if ('potentialCents' in b) {
        sets.push('potential_cents = ?')
        args.push(cents(b.potentialCents) ?? 0)
      }
      if ('opportunityType' in b) {
        const t = str(b.opportunityType, 40)
        if (!OPPORTUNITY_KEYS.includes(t)) throw new CrmError(400, 'Unknown opportunity type.')
        sets.push('opportunity_type = ?')
        args.push(t)
      }
      if ('familyKey' in b || 'brandId' in b) {
        if (who.role !== 'admin') throw new CrmError(403, 'Only an admin can regroup or relink a business.')
        if ('familyKey' in b) {
          const k = familyKey(str(b.familyKey, 120))
          if (!k) throw new CrmError(400, 'A family key is required.')
          sets.push('family_key = ?')
          args.push(k)
        }
        if ('brandId' in b) {
          const bid = optStr(b.brandId, 80)
          if (o.brand_id) throw new CrmError(409, 'This lead is already linked to a listing.')
          const biz = businessById(bid)
          if (!biz) throw new CrmError(400, 'No such business on BEASTY.')
          sets.push('brand_id = ?', 'business_name = ?', 'family_key = ?', 'city = ?', 'category = ?', 'website_status = ?')
          args.push(biz.id, biz.name, biz.familyKey, biz.city, biz.category, biz.websiteStatus)
        }
      }
      if (sets.length) {
        sets.push('updated_at = ?')
        args.push(now())
        await db.prepare(`UPDATE crm_opportunities SET ${sets.join(', ')} WHERE id = ?`).run(...args, id)
        if ('brandId' in b) await addActivity(id, 'SYSTEM', who.actor, 'Linked to its BEASTY listing', { brandId: b.brandId })
        await refreshSearchText(id)
      }
      res.json(await leadDetail(id))
    }),
  )

  app.post(
    '/api/crm/leads/:id/stage',
    write,
    team,
    h(async (req, res) => {
      const stage = isObj(req.body) ? req.body.stage : null
      if (!isStage(stage)) throw new CrmError(400, 'Unknown stage.')
      const r = await changeStage(String(req.params.id), stage, actorOf(req), isObj(req.body) ? optStr(req.body.note, 500) : null)
      res.json(r)
    }),
  )

  app.post(
    '/api/crm/leads/:id/referral',
    write,
    team,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const b = req.body
      await setReferral(
        String(req.params.id),
        {
          referrerId: optStr(b.referrerId, 60),
          sourceType: optStr(b.sourceType, 40),
          campaign: optStr(b.campaign, 60),
          note: optStr(b.note, 500),
          referredAt: ms(b.referredAt),
        },
        actorOf(req),
        { allowed: !!b.override && req.crm?.role === 'admin', reason: optStr(b.reason, 300) },
      )
      res.json({ ok: true })
    }),
  )

  app.post(
    '/api/crm/leads/:id/activities',
    write,
    team,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const type = str(req.body.type, 20)
      if (!(MANUAL_ACTIVITY_TYPES as readonly string[]).includes(type)) throw new CrmError(400, 'Unknown activity type.')
      const body = optStr(req.body.body, 2000)
      if (type === 'NOTE' && !body) throw new CrmError(400, 'A note needs some text.')
      const id = String(req.params.id)
      await getOpp(id)
      const occurred = ms(req.body.occurredAt) ?? now()
      if (occurred > now() + 60_000) throw new CrmError(400, 'An activity cannot be in the future.')
      const activityId = await addActivity(id, type, actorOf(req), body, null, occurred)
      res.status(201).json({ id: activityId })
    }),
  )

  /* ---- follow-ups ---- */

  app.post(
    '/api/crm/leads/:id/followups',
    write,
    team,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const b = req.body
      const dueAt = ms(b.dueAt)
      if (!dueAt) throw new CrmError(400, 'A due date is required.')
      const type = str(b.type, 20) || 'other'
      if (!(FOLLOWUP_TYPES as readonly string[]).includes(type)) throw new CrmError(400, 'Unknown follow-up type.')
      const priority = str(b.priority, 10) || 'normal'
      if (!(PRIORITIES as readonly string[]).includes(priority)) throw new CrmError(400, 'Unknown priority.')
      const id = await createFollowup(
        String(req.params.id),
        { dueAt, ownerId: optStr(b.ownerId, 60) ?? req.crm?.personId ?? GLENN_ID, priority, type, notes: optStr(b.notes, 1000) },
        actorOf(req),
      )
      res.status(201).json({ id })
    }),
  )

  app.post(
    '/api/crm/followups/:id/complete',
    write,
    team,
    h(async (req, res) => {
      await completeFollowup(String(req.params.id), actorOf(req), isObj(req.body) ? optStr(req.body.outcome, 1000) : null)
      res.json({ ok: true })
    }),
  )

  app.get(
    '/api/crm/followups',
    read,
    team,
    h(async (req, res) => {
      const t = now()
      const end = ms(req.query.end) ?? t + 864e5
      res.json(await followupView(str(req.query.view, 30) || 'overdue', { end: Math.max(end, t) }, t))
    }),
  )

  /* ---- deals ---- */

  app.post(
    '/api/crm/leads/:id/deals',
    write,
    team,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const offerId = str(req.body.offerId, 60)
      if (!offerId) throw new CrmError(400, 'Pick an offer.')
      const id = await createDeal(
        String(req.params.id),
        { offerId, quotedCents: cents(req.body.quotedCents), monthlyCents: cents(req.body.monthlyCents) },
        actorOf(req),
      )
      res.status(201).json({ id })
    }),
  )

  app.post(
    '/api/crm/deals/:id/won',
    write,
    team,
    h(async (req, res) => {
      const b = isObj(req.body) ? req.body : {}
      await markDealWon(
        String(req.params.id),
        { soldCents: cents(b.soldCents), closedBy: optStr(b.closedBy, 60) ?? req.crm?.personId ?? GLENN_ID, recurring: bool(b.recurring) },
        actorOf(req),
      )
      res.json({ ok: true })
    }),
  )

  app.post(
    '/api/crm/deals/:id/lost',
    write,
    team,
    h(async (req, res) => {
      const reason = isObj(req.body) ? str(req.body.reason, 300) : ''
      if (reason.length < 2) throw new CrmError(400, 'Say why it was lost.')
      await markDealLost(String(req.params.id), reason, actorOf(req))
      res.json({ ok: true })
    }),
  )

  app.post(
    '/api/crm/deals/:id/recurring',
    write,
    team,
    h(async (req, res) => {
      const active = isObj(req.body) ? bool(req.body.active) : undefined
      if (active === undefined) throw new CrmError(400, 'Say whether recurring revenue is active.')
      await setRecurring(String(req.params.id), active, actorOf(req))
      res.json({ ok: true })
    }),
  )

  /* ---- analytics ---- */

  app.get('/api/crm/referrers', read, team, h(async (req, res) => void res.json({ referrers: await referrerList(periodStart(req.query.period)) })))
  app.get('/api/crm/referrers/:id', read, team, h(async (req, res) => void res.json(await referrerDetail(String(req.params.id), periodStart(req.query.period)))))
  app.get('/api/crm/revenue', read, team, h(async (req, res) => void res.json(await revenue(periodStart(req.query.period)))))
  app.get('/api/crm/analytics', read, team, h(async (_req, res) => void res.json(await analytics())))
  app.get(
    '/api/crm/search',
    read,
    team,
    h(async (req, res) => {
      const q = str(req.query.q, 80)
      res.json(q.length < 2 ? { leads: [], people: [] } : await search(q))
    }),
  )
  app.get(
    '/api/crm/businesses',
    read,
    team,
    h(async (req, res) => void res.json(await families(optStr(req.query.q, 80) ?? undefined, Number(req.query.limit ?? 50) || 50, Number(req.query.offset ?? 0) || 0))),
  )

  /* ---- offers (admin edits; deals keep their own copies) ---- */

  app.get('/api/crm/offers', read, team, h(async (_req, res) => void res.json({ offers: (await db.prepare('SELECT * FROM crm_offers ORDER BY sort, name').all<OfferRow>()).map(offerOut) })))

  app.post(
    '/api/crm/offers',
    write,
    admin,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const b = req.body
      const id = familyKey(str(b.id, 60) || str(b.name, 60)).replace(/-/g, '_')
      const name = str(b.name, 120)
      const type = str(b.opportunityType, 40)
      if (!id || name.length < 2) throw new CrmError(400, 'An offer needs a name.')
      if (!OPPORTUNITY_KEYS.includes(type)) throw new CrmError(400, 'Unknown opportunity type.')
      const t = now()
      await db
        .prepare(
          `INSERT INTO crm_offers (id, name, opportunity_type, one_time_cents, monthly_cents, active, sort, created_at, updated_at)
           VALUES (?,?,?,?,?,TRUE,?,?,?)`,
        )
        .run(id, name, type, cents(b.oneTimeCents) ?? 0, cents(b.monthlyCents) ?? 0, Math.trunc(Number(b.sort ?? 100)) || 100, t, t)
      res.status(201).json({ id })
    }),
  )

  app.patch(
    '/api/crm/offers/:id',
    write,
    admin,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const b = req.body
      const sets: string[] = []
      const args: unknown[] = []
      if ('name' in b) {
        const n = str(b.name, 120)
        if (n.length < 2) throw new CrmError(400, 'An offer needs a name.')
        sets.push('name = ?')
        args.push(n)
      }
      if ('oneTimeCents' in b) {
        sets.push('one_time_cents = ?')
        args.push(cents(b.oneTimeCents) ?? 0)
      }
      if ('monthlyCents' in b) {
        sets.push('monthly_cents = ?')
        args.push(cents(b.monthlyCents) ?? 0)
      }
      if ('active' in b) {
        sets.push('active = ?')
        args.push(!!b.active)
      }
      if (!sets.length) throw new CrmError(400, 'Nothing to change.')
      sets.push('updated_at = ?')
      args.push(now())
      const r = await db.prepare(`UPDATE crm_offers SET ${sets.join(', ')} WHERE id = ?`).run(...args, String(req.params.id))
      if (!r.changes) throw new CrmError(404, 'No such offer.')
      res.json({ ok: true })
    }),
  )

  /* ---- people ---- */

  app.post(
    '/api/crm/people',
    write,
    admin,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const p = await personInput(req.body, true)
      const t = now()
      const id = `p_${randomBytes(6).toString('hex')}`
      await db
        .prepare(
          `INSERT INTO crm_people (id, slug, name, source_type, role, is_team, brand_id, member_id, active, created_at, updated_at, created_by)
           VALUES (?,?,?,?,?,?,?,?,TRUE,?,?,?)`,
        )
        .run(id, p.slug, p.name, p.sourceType, p.role, p.isTeam, p.brandId, p.memberId, t, t, actorOf(req))
      res.status(201).json({ id })
    }),
  )

  app.patch(
    '/api/crm/people/:id',
    write,
    admin,
    h(async (req, res) => {
      if (!isObj(req.body)) throw new CrmError(400, 'Body must be an object.')
      const id = String(req.params.id)
      const cur = await db.prepare('SELECT * FROM crm_people WHERE id = ?').get<PersonRow>(id)
      if (!cur) throw new CrmError(404, 'No such person.')
      const p = await personInput({ ...personAsInput(cur), ...req.body }, false)
      await db
        .prepare(
          `UPDATE crm_people SET slug = ?, name = ?, source_type = ?, role = ?, is_team = ?, brand_id = ?, member_id = ?, active = ?, updated_at = ?
           WHERE id = ?`,
        )
        .run(p.slug, p.name, p.sourceType, p.role, p.isTeam, p.brandId, p.memberId, p.active, now(), id)
      res.json({ ok: true })
    }),
  )

  app.get(
    '/api/crm/people/:id/qr.svg',
    read,
    partner,
    h(async (req, res) => {
      /* A partner prints their own code; the team can print anyone's. */
      if (req.crm?.role === 'partner' && req.crm.personId !== String(req.params.id)) throw new CrmError(403, 'That is not your code.')
      const p = await db.prepare('SELECT slug FROM crm_people WHERE id = ?').get<{ slug: string }>(String(req.params.id))
      if (!p) throw new CrmError(404, 'No such person.')
      const host = String(req.get('host') ?? '').replace(/[^A-Za-z0-9.:-]/g, '') || 'beastypages.com'
      const origin = deps.prod ? `https://${host}` : `${req.protocol}://${host}`
      const { toString } = await import('qrcode')
      const svg = await toString(`${origin}/r/${p.slug}?via=qr`, { type: 'svg', margin: 2, errorCorrectionLevel: 'M' })
      res.type('image/svg+xml').set('Cache-Control', 'private, max-age=3600').send(svg)
    }),
  )

  /* ---- backfill ---- */

  app.post(
    '/api/crm/backfill',
    admin,
    rateLimiter(6, 3),
    h(async (req, res) => {
      const dryRun = !(isObj(req.body) && req.body.dryRun === false)
      res.json(await runBackfill({ dryRun, actor: actorOf(req) }))
    }),
  )

  app.get(
    '/api/crm/backfill/runs',
    read,
    admin,
    h(async (_req, res) => {
      res.json({ runs: await db.prepare('SELECT * FROM crm_backfill_runs ORDER BY started_at DESC LIMIT 50').all() })
    }),
  )

  /* ---- partner ---- */

  app.get(
    '/api/crm/partner/me',
    read,
    partner,
    h(async (req, res) => {
      if (!req.crm?.personId) throw new CrmError(403, 'Only a linked person has a referral view.')
      res.json(await partnerView(req.crm.personId))
    }),
  )

  /* ---- the referral link ---- */

  /**
   * beastypages.com/r/janelle: remember who sent this visitor (first touch,
   * signed cookie, 90 days), count the click, and land on the page that sells
   * a tile. ?via=qr marks the printed code; ?c= names a campaign.
   */
  app.get(
    '/r/:slug',
    rateLimiter(60, 20),
    h(async (req, res) => {
      const slug = str(req.params.slug, 60).toLowerCase()
      const person = /^[a-z0-9-]{2,60}$/.test(slug)
        ? await db.prepare('SELECT id FROM crm_people WHERE slug = ? AND active').get<{ id: string }>(slug)
        : undefined
      res.set('Cache-Control', 'no-store')
      if (!person) return res.redirect(302, '/')
      const via = req.query.via === 'qr' ? 'qr_code' : 'referral_link'
      const campaign = str(req.query.c, 40).toLowerCase().replace(/[^a-z0-9_-]/g, '')
      let ref = readRef(req, deps)
      if (!ref) {
        const fresh = { personId: person.id, at: now(), via, campaign, nonce: randomBytes(12).toString('base64url') }
        const parts = [fresh.personId, String(fresh.at), fresh.via, fresh.campaign, fresh.nonce]
        const bits = [
          `${REF_COOKIE}=${[...parts, signRef(parts, deps.secret)].join('.')}`,
          'HttpOnly',
          'SameSite=Lax',
          `Max-Age=${REF_DAYS * 86400}`,
          'Path=/',
        ]
        if (deps.prod) bits.push('Secure')
        res.append('Set-Cookie', bits.join('; '))
        ref = fresh
      }
      await db
        .prepare('INSERT INTO crm_referral_visits (id, person_id, via, campaign, visitor, created_at) VALUES (?,?,?,?,?,?)')
        .run(
          `rv_${randomBytes(8).toString('hex')}`,
          person.id,
          via,
          campaign || null,
          createHash('sha256').update(ref.nonce).digest('hex').slice(0, 32),
          now(),
        )
      res.redirect(302, '/money')
    }),
  )
}

/* ------------------------------------------------------------ small parts */

function offerOut(o: OfferRow) {
  return {
    id: o.id,
    name: o.name,
    opportunityType: o.opportunity_type,
    oneTimeCents: o.one_time_cents,
    monthlyCents: o.monthly_cents,
    active: o.active,
    sort: o.sort,
  }
}

function personAsInput(p: PersonRow): Record<string, unknown> {
  return {
    slug: p.slug,
    name: p.name,
    sourceType: p.source_type,
    role: p.role,
    isTeam: p.is_team,
    brandId: p.brand_id,
    memberId: p.member_id,
    active: p.active,
  }
}

/**
 * Validate a person. memberEmail links their BEASTY account (they must have
 * signed up already); the link is what lets them sign in to the CRM.
 */
async function personInput(b: Record<string, unknown>, creating: boolean) {
  const name = str(b.name, 80)
  if (name.length < 2) throw new CrmError(400, 'A name is required.')
  const slug = (str(b.slug, 60) || familyKey(name)).toLowerCase()
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) throw new CrmError(400, 'The link name can use letters, numbers and dashes.')
  const sourceType = str(b.sourceType, 40) || 'other'
  const known = DEFAULT_SOURCE_TYPES.some((s) => s.key === sourceType) || !!(await db.prepare('SELECT 1 FROM crm_source_types WHERE key = ?').get(sourceType))
  if (!known) throw new CrmError(400, 'Unknown source type.')
  const role = str(b.role, 10) || 'none'
  if (!['admin', 'team', 'partner', 'none'].includes(role)) throw new CrmError(400, 'Unknown role.')
  const brandId = optStr(b.brandId, 80)
  if (brandId && !businessById(brandId)) throw new CrmError(400, 'No such BEASTY page.')
  let memberId = optStr(b.memberId, 80)
  const memberEmail = normEmail(str(b.memberEmail, 120))
  if (memberEmail) {
    const m = await db.prepare('SELECT id FROM members WHERE LOWER(email) = ?').get<{ id: string }>(memberEmail)
    if (!m) throw new CrmError(400, 'No BEASTY account uses that email yet. They need to sign up first.')
    memberId = m.id
  }
  if ('memberEmail' in b && b.memberEmail === '') memberId = null
  return {
    name,
    slug,
    sourceType,
    role,
    isTeam: b.isTeam === undefined ? role === 'admin' || role === 'team' : !!b.isTeam,
    brandId,
    memberId,
    active: creating ? true : b.active === undefined ? true : !!b.active,
  }
}
