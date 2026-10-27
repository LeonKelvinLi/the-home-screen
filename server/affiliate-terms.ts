/*
  SCHEDULE A: the affiliate agreement's money terms, filled in from the CRM.

  The standard schedule is one working draft that saves on every change (like
  the TDS app's answers), plus numbered versions once an admin publishes it.
  Every change is a row in affiliate_terms_events with the old value next to
  the new one and whether it was tapped or talked through. An affiliate's own
  changes live on their application (terms_overrides) and are checked against
  the same rules. The shared model is shared/affiliate-terms.ts; the long form
  is docs/AFFILIATE-TERMS-FORM.md.

  Nothing here talks to DocuSeal. On the free plan the figures reach the
  packet by hand: the approved PDF is uploaded into the template, and an
  affiliate's own figures are pasted into a sender field from the CRM's copy
  button. terms_snapshot on a manual packet records which code it went out with.
*/
import type { Express, Request, Response, NextFunction } from 'express'
import { db } from './db/schema'
import { requireCrm, type CrmDeps } from './crm/auth'
import { schedulePdf } from './affiliate-terms-pdf'
import {
  DEFAULT_TERMS,
  FIELDS_BY_ID,
  PER_AFFILIATE,
  RULES,
  agreementFields,
  scheduleChanges,
  SCHEDULE_A_FIELDS,
  check,
  confirmKey,
  cleanOverrides,
  cleanTerms,
  coerce,
  effectiveTerms,
  scheduleText,
  signatureOf,
  termsCode,
  derive,
  type Overrides,
  type TermId,
  type Terms,
} from '../shared/affiliate-terms'

interface VersionRow {
  number: number
  terms: Terms
  code: string
  note: string
  created_by: string
  created_at: number
}

interface DraftRow {
  id: string
  terms: Terms
  acknowledged: Record<string, string>
  revision: number
  updated_by: string
  updated_at: number
}

interface AppTermsRow {
  id: string
  profile: { legalFirst?: string; legalLast?: string; kind?: string; businessName?: string }
  terms_overrides: Overrides
  terms_acknowledged: Record<string, string>
  updated_at: number
}

const DRAFT = 'standard'

export async function latestVersion(): Promise<VersionRow | null> {
  const v = await db.prepare('SELECT * FROM affiliate_terms_versions ORDER BY number DESC LIMIT 1').get<VersionRow>()
  return v ? { ...v, terms: cleanTerms(v.terms) } : null
}

/** The Schedule A in force for one application right now, or null before any version is published. */
export async function termsForApplication(applicationId: string): Promise<{ version: number; code: string; terms: Terms; overrides: Overrides } | null> {
  const v = await latestVersion()
  if (!v) return null
  const a = await db.prepare('SELECT terms_overrides FROM onboarding_applications WHERE id = ?').get<{ terms_overrides: Overrides }>(applicationId)
  const overrides = cleanOverrides(a?.terms_overrides ?? {}, v.terms)
  const terms = effectiveTerms(v.terms, overrides)
  return { version: v.number, code: termsCode(terms), terms, overrides }
}

const legalName = (p: AppTermsRow['profile']) =>
  p.kind === 'business' && p.businessName ? p.businessName : `${p.legalFirst ?? ''} ${p.legalLast ?? ''}`.trim() || 'this affiliate'

const dateText = (t: number) => new Date(t).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Los_Angeles' })

function openQuestions(t: Terms, acknowledged: Record<string, string> = {}): string[] {
  return check(t, acknowledged).unsettled.map((id) => `${FIELDS_BY_ID[id].prompt}: ${FIELDS_BY_ID[id].source}`)
}

export function mountAffiliateTerms(app: Express, deps: { rateLimiter(perMinute: number, burst: number): (req: Request, res: Response, next: NextFunction) => void; crm: CrmDeps }) {
  const team = requireCrm(deps.crm, 'team')
  const admin = requireCrm(deps.crm, 'admin')
  const read = deps.rateLimiter(600, 120)
  const write = deps.rateLimiter(240, 60)
  const asyncH = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next)
  }

  async function logChanges(scope: string, before: Partial<Terms>, after: Partial<Terms>, ids: TermId[], channel: string, actor: string) {
    const now = Date.now()
    for (const id of ids) {
      if (JSON.stringify(before[id]) === JSON.stringify(after[id])) continue
      await db
        .prepare('INSERT INTO affiliate_terms_events (scope, field, old_value, new_value, channel, actor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(scope, id, JSON.stringify(before[id] ?? null), JSON.stringify(after[id] ?? null), channel, actor, now)
    }
  }

  async function draftRow(): Promise<DraftRow> {
    const d = await db.prepare('SELECT * FROM affiliate_terms_draft WHERE id = ?').get<DraftRow>(DRAFT)
    if (d) return { ...d, terms: cleanTerms(d.terms) }
    const v = await latestVersion()
    return { id: DRAFT, terms: v?.terms ?? DEFAULT_TERMS, acknowledged: {}, revision: 0, updated_by: '', updated_at: 0 }
  }

  async function standardState() {
    const d = await draftRow()
    const v = await latestVersion()
    const versions = await db
      .prepare('SELECT number, code, note, created_by, created_at FROM affiliate_terms_versions ORDER BY number DESC LIMIT 30')
      .all<Omit<VersionRow, 'terms'>>()
    const code = termsCode(d.terms)
    return {
      draft: { terms: d.terms, revision: d.revision, acknowledged: d.acknowledged, updatedBy: d.updated_by, updatedAt: d.updated_at, code },
      check: check(d.terms, d.acknowledged),
      published: v ? { number: v.number, code: v.code, createdBy: v.created_by, createdAt: v.created_at, note: v.note } : null,
      unpublishedChanges: !v || v.code !== code,
      versions: versions.map((r) => ({ number: r.number, code: r.code, note: r.note, createdBy: r.created_by, createdAt: r.created_at })),
      defaults: DEFAULT_TERMS,
    }
  }

  app.get('/api/crm/affiliate-terms', read, team, asyncH(async (_req, res) => {
    res.json(await standardState())
  }))

  /* Every answer saves the moment it changes. A stale revision gets the current
     state back with a 409, so a second tab never silently loses to the first. */
  app.put('/api/crm/affiliate-terms/draft', write, admin, asyncH(async (req, res) => {
    const b = (req.body ?? {}) as { revision?: unknown; changes?: unknown; channel?: unknown }
    const changes = (b.changes && typeof b.changes === 'object' ? b.changes : null) as Record<string, unknown> | null
    if (!changes || !Object.keys(changes).length) return res.status(400).json({ error: 'Nothing to save.' })
    const channel = b.channel === 'talk' ? 'talk' : 'tap'
    const ids = Object.keys(changes) as TermId[]
    for (const id of ids) {
      const f = FIELDS_BY_ID[id]
      if (!f) return res.status(400).json({ error: `Unknown term: ${id}.` })
      if (coerce(f, changes[id]) === undefined) return res.status(400).json({ error: `“${f.prompt}” cannot be ${JSON.stringify(changes[id])}.` })
    }
    const outcome = await db.transaction(async () => {
      let d = await db.prepare('SELECT * FROM affiliate_terms_draft WHERE id = ? FOR UPDATE').get<DraftRow>(DRAFT)
      if (!d) {
        const start = await draftRow()
        await db
          .prepare('INSERT INTO affiliate_terms_draft (id, terms, acknowledged, revision, updated_by, updated_at) VALUES (?, ?, ?, 0, ?, ?) ON CONFLICT (id) DO NOTHING')
          .run(DRAFT, JSON.stringify(start.terms), '{}', req.crm!.actor, Date.now())
        d = await db.prepare('SELECT * FROM affiliate_terms_draft WHERE id = ? FOR UPDATE').get<DraftRow>(DRAFT)
      }
      if (d!.revision !== b.revision) return { conflict: true }
      const before = cleanTerms(d!.terms)
      const after = cleanTerms(changes, before)
      /* Whoever changes an answer has decided it: it counts as checked, at its new value. */
      const acknowledged = { ...(d!.acknowledged ?? {}) }
      for (const id of ids) acknowledged[confirmKey(id)] = JSON.stringify(after[id])
      await db
        .prepare('UPDATE affiliate_terms_draft SET terms = ?, acknowledged = ?, revision = revision + 1, updated_by = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(after), JSON.stringify(acknowledged), req.crm!.actor, Date.now(), DRAFT)
      await logChanges(DRAFT, before, after, ids, channel, req.crm!.actor)
      return { conflict: false }
    })()
    const state = await standardState()
    if (outcome.conflict) return res.status(409).json({ error: 'The terms changed in another window. Showing the latest.', ...state })
    res.json(state)
  }))

  /* "Both are right, leave them" — soft flags only, and only for the figures
     it was raised on: change one of them and the question comes back. */
  /* "Looks right" on one answer nobody had agreed: checked, at the value on screen. */
  app.post('/api/crm/affiliate-terms/confirm', write, admin, asyncH(async (req, res) => {
    const f = FIELDS_BY_ID[String((req.body ?? {}).field ?? '') as TermId]
    if (!f) return res.status(400).json({ error: 'Unknown term.' })
    const d = await draftRow()
    const acknowledged = { ...d.acknowledged, [confirmKey(f.id)]: JSON.stringify(d.terms[f.id]) }
    await db
      .prepare(`INSERT INTO affiliate_terms_draft (id, terms, acknowledged, revision, updated_by, updated_at) VALUES (?, ?, ?, 1, ?, ?)
                ON CONFLICT (id) DO UPDATE SET acknowledged = EXCLUDED.acknowledged, revision = affiliate_terms_draft.revision + 1, updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at`)
      .run(DRAFT, JSON.stringify(d.terms), JSON.stringify(acknowledged), req.crm!.actor, Date.now())
    await db
      .prepare('INSERT INTO affiliate_terms_events (scope, field, old_value, new_value, channel, actor, created_at) VALUES (?, ?, NULL, ?, ?, ?, ?)')
      .run(DRAFT, `confirm:${f.id}`, JSON.stringify(d.terms[f.id]), 'tap', req.crm!.actor, Date.now())
    res.json(await standardState())
  }))

  app.post('/api/crm/affiliate-terms/acknowledge', write, admin, asyncH(async (req, res) => {
    const rule = RULES.find((r) => r.id === String((req.body ?? {}).rule ?? ''))
    if (!rule) return res.status(400).json({ error: 'Unknown check.' })
    if (rule.severity === 'hard') return res.status(409).json({ error: 'This one has to be fixed, not accepted.' })
    const d = await draftRow()
    if (!rule.when(d.terms, derive(d.terms))) return res.json(await standardState())
    const acknowledged = { ...d.acknowledged, [rule.id]: signatureOf(rule, d.terms) }
    await db
      .prepare(`INSERT INTO affiliate_terms_draft (id, terms, acknowledged, revision, updated_by, updated_at) VALUES (?, ?, ?, 1, ?, ?)
                ON CONFLICT (id) DO UPDATE SET acknowledged = EXCLUDED.acknowledged, revision = affiliate_terms_draft.revision + 1, updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at`)
      .run(DRAFT, JSON.stringify(d.terms), JSON.stringify(acknowledged), req.crm!.actor, Date.now())
    await db
      .prepare('INSERT INTO affiliate_terms_events (scope, field, old_value, new_value, channel, actor, created_at) VALUES (?, ?, NULL, ?, ?, ?, ?)')
      .run(DRAFT, `check:${rule.id}`, JSON.stringify('accepted'), 'tap', req.crm!.actor, Date.now())
    res.json(await standardState())
  }))

  app.post('/api/crm/affiliate-terms/publish', write, admin, asyncH(async (req, res) => {
    const b = (req.body ?? {}) as { revision?: unknown; note?: unknown }
    const note = String(b.note ?? '').trim().slice(0, 300)
    const outcome = await db.transaction(async () => {
      const d = await db.prepare('SELECT * FROM affiliate_terms_draft WHERE id = ? FOR UPDATE').get<DraftRow>(DRAFT)
      if (!d) return { status: 409, error: 'Answer the questions first.' }
      if (d.revision !== b.revision) return { status: 409, error: 'The terms changed in another window. Review them again.' }
      const terms = cleanTerms(d.terms)
      const c = check(terms, d.acknowledged)
      if (c.blocked) return { status: 409, error: 'Fix the figures marked at review before publishing.' }
      const code = termsCode(terms)
      const last = await db.prepare('SELECT number, code FROM affiliate_terms_versions ORDER BY number DESC LIMIT 1').get<{ number: number; code: string }>()
      if (last?.code === code) return { status: 409, error: `Version ${last.number} already has exactly these figures.` }
      const number = (last?.number ?? 0) + 1
      await db
        .prepare('INSERT INTO affiliate_terms_versions (number, terms, code, note, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(number, JSON.stringify(terms), code, note, req.crm!.actor, Date.now())
      await db
        .prepare('INSERT INTO affiliate_terms_events (scope, field, old_value, new_value, channel, actor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(DRAFT, 'published', JSON.stringify(last?.number ?? null), JSON.stringify(number), 'tap', req.crm!.actor, Date.now())
      return { status: 200 }
    })()
    if (outcome.error) return res.status(outcome.status).json({ error: outcome.error, ...(await standardState()) })
    res.json(await standardState())
  }))

  /* Throw away unpublished changes: the draft goes back to the latest version. */
  app.post('/api/crm/affiliate-terms/discard', write, admin, asyncH(async (req, res) => {
    const v = await latestVersion()
    const d = await draftRow()
    const back = v?.terms ?? DEFAULT_TERMS
    await db
      .prepare(`INSERT INTO affiliate_terms_draft (id, terms, acknowledged, revision, updated_by, updated_at) VALUES (?, ?, '{}', 1, ?, ?)
                ON CONFLICT (id) DO UPDATE SET terms = EXCLUDED.terms, acknowledged = '{}', revision = affiliate_terms_draft.revision + 1, updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at`)
      .run(DRAFT, JSON.stringify(back), req.crm!.actor, Date.now())
    await logChanges(DRAFT, d.terms, back, Object.keys(FIELDS_BY_ID) as TermId[], 'discard', req.crm!.actor)
    res.json(await standardState())
  }))

  app.get('/api/crm/affiliate-terms/history', read, team, asyncH(async (req, res) => {
    const scope = String(req.query.scope ?? DRAFT).slice(0, 80)
    const rows = await db
      .prepare('SELECT field, old_value, new_value, channel, actor, created_at FROM affiliate_terms_events WHERE scope = ? ORDER BY created_at DESC, id DESC LIMIT 200')
      .all(scope)
    res.json({ events: rows })
  }))

  const sendPdf = async (res: Response, terms: Terms, meta: Parameters<typeof schedulePdf>[1], filename: string) => {
    const bytes = await schedulePdf(terms, meta)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-store')
    res.end(Buffer.from(bytes))
  }

  /* ?version=N prints a published version; without it, the working draft. */
  app.get('/api/crm/affiliate-terms/schedule.pdf', read, team, asyncH(async (req, res) => {
    if (req.query.version !== undefined) {
      const n = Number(req.query.version)
      const v = Number.isInteger(n) ? await db.prepare('SELECT * FROM affiliate_terms_versions WHERE number = ?').get<VersionRow>(n) : undefined
      if (!v) return res.status(404).json({ error: 'No such version.' })
      const terms = cleanTerms(v.terms)
      return sendPdf(res, terms, {
        heading: `Standard terms, version ${v.number}`,
        subheading: `Published ${dateText(v.created_at)} by ${v.created_by}`,
        code: v.code,
      }, `BEASTY-Schedule-A-v${v.number}.pdf`)
    }
    const d = await draftRow()
    const c = check(d.terms, d.acknowledged)
    const v = await latestVersion()
    const code = termsCode(d.terms)
    await sendPdf(res, d.terms, {
      heading: v && v.code === code ? `Standard terms, version ${v.number}` : `Standard terms, working draft${v ? ` (after version ${v.number})` : ''}`,
      subheading: d.updated_at ? `Last changed ${dateText(d.updated_at)} by ${d.updated_by}` : 'Defaults from the September thread',
      code,
      draft: c.blocked ? `Not final: ${c.flags.filter((f) => f.severity === 'hard').length + Object.keys(c.problems).length} to fix` : v && v.code === code ? undefined : 'Draft',
      openQuestions: openQuestions(d.terms, d.acknowledged),
    }, 'BEASTY-Schedule-A-draft.pdf')
  }))

  /* ------------------------------------------------------ one affiliate ---- */

  async function affiliateState(id: string) {
    const a = await db.prepare('SELECT id, profile, terms_overrides, terms_acknowledged, updated_at FROM onboarding_applications WHERE id = ?').get<AppTermsRow>(id)
    if (!a) return null
    const v = await latestVersion()
    const doc = await db
      .prepare("SELECT terms_snapshot FROM onboarding_documents WHERE application_id = ? AND status <> 'superseded' ORDER BY created_at DESC LIMIT 1")
      .get<{ terms_snapshot: { version: number; code: string } | null }>(id)
    if (!v) return { application: a, standard: null, packet: doc?.terms_snapshot ?? null }
    const overrides = cleanOverrides(a.terms_overrides, v.terms)
    const terms = effectiveTerms(v.terms, overrides)
    const code = termsCode(terms)
    const version = `standard v${v.number}${Object.keys(overrides).length ? ` with ${Object.keys(overrides).length} change${Object.keys(overrides).length === 1 ? '' : 's'}` : ''}`
    return {
      application: a,
      standard: { number: v.number, code: v.code, terms: v.terms },
      overrides,
      terms,
      code,
      version,
      check: check(terms, a.terms_acknowledged),
      text: scheduleText(terms, { version, code, overrides, affiliate: legalName(a.profile) }),
      agreementFields: agreementFields(terms),
      docusealFields: { [SCHEDULE_A_FIELDS.changes]: scheduleChanges(v.terms, overrides) },
      packet: doc?.terms_snapshot ?? null,
    }
  }

  const shapeAffiliate = (s: NonNullable<Awaited<ReturnType<typeof affiliateState>>>) => {
    const { application, ...rest } = s
    return { ...rest, updatedAt: application.updated_at, perAffiliate: PER_AFFILIATE.map((f) => f.id) }
  }

  app.get('/api/crm/onboarding/:id/terms', read, team, asyncH(async (req, res) => {
    const s = await affiliateState(String(req.params.id))
    if (!s) return res.status(404).json({ error: 'No such application.' })
    res.json(shapeAffiliate(s))
  }))

  app.put('/api/crm/onboarding/:id/terms', write, admin, asyncH(async (req, res) => {
    const b = (req.body ?? {}) as { overrides?: unknown }
    const raw = (b.overrides && typeof b.overrides === 'object' ? b.overrides : {}) as Record<string, unknown>
    for (const id of Object.keys(raw)) {
      if (!PER_AFFILIATE.some((f) => f.id === id)) return res.status(400).json({ error: `“${FIELDS_BY_ID[id as TermId]?.prompt ?? id}” is the same for every affiliate. Change it in the standard schedule.` })
    }
    const outcome = await db.transaction(async () => {
      const a = await db.prepare('SELECT id, profile, terms_overrides, terms_acknowledged, updated_at FROM onboarding_applications WHERE id = ? FOR UPDATE').get<AppTermsRow>(String(req.params.id))
      if (!a) return { status: 404, error: 'No such application.' }
      const v = await latestVersion()
      if (!v) return { status: 409, error: 'Publish the standard schedule first.' }
      const overrides = cleanOverrides(raw, v.terms)
      const terms = effectiveTerms(v.terms, overrides)
      const c = check(terms, a.terms_acknowledged)
      if (c.blocked) return { status: 400, error: 'These figures contradict each other. Fix them first.', check: c }
      const before = effectiveTerms(v.terms, cleanOverrides(a.terms_overrides, v.terms))
      await db.prepare('UPDATE onboarding_applications SET terms_overrides = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(overrides), Date.now(), a.id)
      await logChanges(a.id, before, terms, PER_AFFILIATE.map((f) => f.id), 'tap', req.crm!.actor)
      const changed = PER_AFFILIATE.filter((f) => JSON.stringify(before[f.id]) !== JSON.stringify(terms[f.id])).map((f) => f.id)
      if (changed.length) {
        await db
          .prepare('INSERT INTO onboarding_events (application_id, invite_id, actor, kind, detail, created_at) VALUES (?, NULL, ?, ?, ?, ?)')
          .run(a.id, req.crm!.actor, 'terms_changed', JSON.stringify({ fields: changed, code: termsCode(terms) }), Date.now())
      }
      return { status: 200 }
    })()
    if (outcome.error) return res.status(outcome.status).json({ error: outcome.error, check: outcome.check })
    res.json(shapeAffiliate((await affiliateState(String(req.params.id)))!))
  }))

  app.post('/api/crm/onboarding/:id/terms/acknowledge', write, admin, asyncH(async (req, res) => {
    const rule = RULES.find((r) => r.id === String((req.body ?? {}).rule ?? ''))
    if (!rule || rule.severity === 'hard') return res.status(400).json({ error: 'Only a soft check can be accepted.' })
    const s = await affiliateState(String(req.params.id))
    if (!s) return res.status(404).json({ error: 'No such application.' })
    if (!s.standard) return res.status(409).json({ error: 'Publish the standard schedule first.' })
    const acknowledged = { ...s.application.terms_acknowledged, [rule.id]: signatureOf(rule, s.terms) }
    await db.prepare('UPDATE onboarding_applications SET terms_acknowledged = ? WHERE id = ?').run(JSON.stringify(acknowledged), s.application.id)
    res.json(shapeAffiliate((await affiliateState(s.application.id))!))
  }))

  app.get('/api/crm/onboarding/:id/schedule.pdf', read, team, asyncH(async (req, res) => {
    const s = await affiliateState(String(req.params.id))
    if (!s) return res.status(404).json({ error: 'No such application.' })
    if (!s.standard) return res.status(409).json({ error: 'Publish the standard schedule first.' })
    await sendPdf(res, s.terms!, {
      heading: `Terms for ${legalName(s.application.profile)} · ${s.version}`,
      subheading: `Standard version ${s.standard.number}, code ${s.standard.code}`,
      code: s.code!,
      overrides: s.overrides,
      changes: scheduleChanges(s.standard.terms, s.overrides!),
      draft: s.check!.blocked ? 'Not final' : undefined,
    }, `BEASTY-Schedule-A-${s.code}.pdf`)
  }))
}

