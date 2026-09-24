/*
  BRINGING EXISTING BUSINESSES INTO THE CRM, safely.

  runBackfill scans every seated business once and creates a website
  opportunity only where the listing itself says there is no real site. It is
  idempotent (an existing opportunity is skipped, never touched), auditable
  (every run is stored with its full report), non-destructive (it only
  inserts) and cautious: a person on the Individuals sheet is a person, not a
  shop, so they go to manual review instead of becoming a website lead, and two
  different businesses sharing a phone, email or Instagram are reported, never
  merged.
*/
import { db } from '../db/schema'
import { DEFAULT_OFFERS, hasChannel, normEmail, normInstagram, normPhone, qualifiesForWebsite } from '../../src/crm/model'
import { createOpportunity, fillGlennDefaults, nid, now, searchTextOf } from './core'
import { businessById, seatedBusinesses } from './directory'
import { cityFromAddress } from './city'

export interface BackfillReport {
  runId: string
  dryRun: boolean
  scanned: number
  qualifying: number
  created: number
  skippedExisting: number
  skippedHasSite: number
  skippedOwner: number
  applications: { scanned: number; created: number; skippedExisting: number; skippedCollab: number }
  duplicates: { key: string; value: string; businesses: { id: string; name: string }[] }[]
  manualReview: { id: string; name: string; reason: string }[]
  errors: { id: string; error: string }[]
  createdIds: string[]
  /** Blanks filled with Glenn after the run (referrals, owners). */
  filledDefaults?: { referrals: number; owners: number }
}

const WEBSITE_POTENTIAL = DEFAULT_OFFERS.find((o) => o.id === 'website_build')?.oneTimeCents ?? 0

export async function runBackfill(opts: { dryRun: boolean; actor: string }): Promise<BackfillReport> {
  const runId = nid('bf')
  const startedAt = now()
  const report: BackfillReport = {
    runId,
    dryRun: opts.dryRun,
    scanned: 0,
    qualifying: 0,
    created: 0,
    skippedExisting: 0,
    skippedHasSite: 0,
    skippedOwner: 0,
    applications: { scanned: 0, created: 0, skippedExisting: 0, skippedCollab: 0 },
    duplicates: [],
    manualReview: [],
    errors: [],
    createdIds: [],
  }
  if (!opts.dryRun) {
    await db
      .prepare('INSERT INTO crm_backfill_runs (id, actor, dry_run, started_at) VALUES (?,?,?,?)')
      .run(runId, opts.actor, false, startedAt)
  }

  const businesses = seatedBusinesses()
  const existing = new Set(
    (await db.prepare('SELECT brand_id, opportunity_type FROM crm_opportunities WHERE brand_id IS NOT NULL').all<{ brand_id: string; opportunity_type: string }>()).map(
      (r) => `${r.brand_id}|${r.opportunity_type}`,
    ),
  )

  /* Possible duplicates: the same contact on two businesses that are not
     locations of one family. Reported for a person to look at; never merged. */
  const byContact = new Map<string, { id: string; name: string; family: string }[]>()
  for (const b of businesses) {
    for (const [key, value] of [
      ['phone', b.channels.phone],
      ['email', b.channels.email],
      ['instagram', b.channels.instagram],
    ] as const) {
      if (!value) continue
      const list = byContact.get(`${key}|${value}`) ?? []
      list.push({ id: b.id, name: b.name, family: b.familyKey })
      byContact.set(`${key}|${value}`, list)
    }
  }
  for (const [k, list] of byContact) {
    if (new Set(list.map((x) => x.family)).size < 2) continue
    const [key, value] = k.split('|')
    report.duplicates.push({ key, value, businesses: list.map(({ id, name }) => ({ id, name })) })
  }

  for (const b of businesses) {
    report.scanned++
    if (b.beastyOwner) {
      report.skippedOwner++
      continue
    }
    if (!qualifiesForWebsite(b.websiteStatus)) {
      report.skippedHasSite++
      continue
    }
    report.qualifying++
    const type = b.websiteStatus === 'needs_work' ? 'website_redesign' : 'website'
    if (existing.has(`${b.id}|${type}`) || existing.has(`${b.id}|website`) || existing.has(`${b.id}|website_redesign`)) {
      report.skippedExisting++
      continue
    }
    if (b.isIndividual) {
      report.manualReview.push({ id: b.id, name: b.name, reason: 'On BEASTY • Individuals: a person, not assumed to be a website lead' })
      continue
    }
    if (opts.dryRun) {
      report.created++
      continue
    }
    try {
      const id = await createOpportunity(
        {
          brandId: b.id,
          opportunityType: type,
          stage: hasChannel(b.channels) ? 'ready_to_contact' : 'need_contact_info',
          /* NO SOURCE GIVEN, so createOpportunity makes Glenn the referrer
             BY DEFAULT: he sent every one of these businesses, and a default
             does not lock out the real first referrer (Janelle, for Jazz
             Braids) when someone who knows records it. The run id marks the
             import. */
          sourceType: null,
          potentialCents: WEBSITE_POTENTIAL,
          backfillRunId: runId,
          note: `Imported from the BEASTY listing (website status: ${b.websiteStatus})`,
        },
        'system:backfill',
      )
      existing.add(`${b.id}|${type}`)
      report.created++
      report.createdIds.push(id)
    } catch (err) {
      report.errors.push({ id: b.id, error: String((err as Error).message ?? err).slice(0, 200) })
    }
  }

  /* Reserve-a-spot requests are businesses asking to be on BEASTY. Creator
     (Collab) requests are people, not businesses, and stay out. */
  const apps = await db
    .prepare('SELECT id, business, cuisine, contact, city, social, phone, email, address, hours, created_at FROM applications ORDER BY created_at')
    .all<Parameters<typeof createFromApplication>[0]>()
  const appsDone = new Set(
    (await db.prepare('SELECT application_id FROM crm_opportunities WHERE application_id IS NOT NULL').all<{ application_id: string }>()).map((r) => r.application_id),
  )
  for (const a of apps) {
    report.applications.scanned++
    if (/collab/i.test(a.cuisine ?? '')) {
      report.applications.skippedCollab++
      continue
    }
    if (appsDone.has(a.id)) {
      report.applications.skippedExisting++
      continue
    }
    if (opts.dryRun) {
      report.applications.created++
      continue
    }
    try {
      const id = await createFromApplication(a, { actor: 'system:backfill', runId })
      report.applications.created++
      report.createdIds.push(id)
    } catch (err) {
      report.errors.push({ id: a.id, error: String((err as Error).message ?? err).slice(0, 200) })
    }
  }

  if (!opts.dryRun) {
    /* Leads from before the Glenn rule, or added by hand with blanks. */
    const filled = await fillGlennDefaults()
    report.filledDefaults = filled
    await db
      .prepare('UPDATE crm_backfill_runs SET finished_at = ?, report = ? WHERE id = ?')
      .run(now(), JSON.stringify({ ...report, createdIds: report.createdIds.length }), runId)
  }
  return report
}

/** A Reserve-a-spot request as a lead: the only record of that business. */
export async function createFromApplication(
  a: {
    id: string
    business: string
    cuisine: string | null
    contact: string
    city: string | null
    social: string | null
    created_at: number
    /* The boxes of Glenn's revision, 2026-09-22; absent on older requests. */
    phone?: string | null
    email?: string | null
    address?: string | null
    hours?: string | null
  },
  opts: { actor: string; runId?: string; referrerId?: string | null; sourceType?: string | null; campaign?: string | null; referredAt?: number | null },
): Promise<string> {
  /* An older request has one box for both, to pull them out of. */
  const email = a.email || (/[^\s@]+@[^\s@]+\.[^\s@]+/.exec(a.contact)?.[0] ?? '')
  const phone = a.phone || a.contact.replace(email, '')
  /* A lead has no place for hours or an address of its own, so they go in
     the note that opens its history, where the team reads them. */
  const said = [a.hours ? `Hours: ${a.hours}` : '', a.address ? `Address: ${a.address}` : ''].filter(Boolean).join('. ')
  const note = opts.runId ? 'Imported from a Reserve-a-spot request' : 'Reserve-a-spot request'
  return createOpportunity(
    {
      applicationId: a.id,
      businessName: a.business,
      city: a.city || cityFromAddress(a.address),
      category: a.cuisine,
      phone: normPhone(phone) || null,
      email: normEmail(email) || null,
      instagram: normInstagram(a.social) || null,
      opportunityType: 'beasty_program',
      stage: 'new_lead',
      referrerId: opts.referrerId ?? null,
      /* A request arriving now with no referral cookie is organic; an old one
         imported by the backfill has no recorded source at all. */
      sourceType: opts.sourceType ?? (opts.runId ? null : 'organic'),
      campaign: opts.campaign ?? null,
      referredAt: opts.referredAt ?? a.created_at,
      backfillRunId: opts.runId ?? null,
      note: said ? `${note}. ${said}` : note,
    },
    opts.actor,
  )
}

/**
 * Refresh every listed opportunity's snapshot columns from BRANDS. Run at
 * boot, so a renamed business, a new phone number or a seat move shows up in
 * CRM search and filters after the next deploy. Only the derived columns are
 * written; stage, attribution, ownership and history are never touched.
 */
export async function syncSnapshots(): Promise<{ checked: number; updated: number; missing: string[] }> {
  const rows = await db
    .prepare(
      `SELECT o.id, o.brand_id, o.business_name, o.city, o.category, o.website_status, o.phone, o.email, o.instagram,
              o.contact_name, o.found_phone, o.found_email, o.found_instagram, o.search_text, p.name AS referrer_name
       FROM crm_opportunities o LEFT JOIN crm_people p ON p.id = o.referrer_id
       WHERE o.brand_id IS NOT NULL`,
    )
    .all<{
      id: string
      brand_id: string
      business_name: string
      city: string | null
      category: string | null
      website_status: string | null
      phone: string | null
      email: string | null
      instagram: string | null
      contact_name: string | null
      found_phone: string | null
      found_email: string | null
      found_instagram: string | null
      search_text: string
      referrer_name: string | null
    }>()
  let updated = 0
  const missing: string[] = []
  for (const r of rows) {
    const b = businessById(r.brand_id)
    if (!b) {
      missing.push(r.brand_id)
      continue
    }
    const next = {
      business_name: b.name,
      city: b.city,
      category: b.category,
      website_status: b.websiteStatus,
      phone: b.channels.phone || null,
      email: b.channels.email || null,
      instagram: b.channels.instagram || null,
    }
    const text = searchTextOf({
      ...next,
      contact_name: r.contact_name,
      referrer_name: r.referrer_name,
      found_phone: r.found_phone,
      found_email: r.found_email,
      found_instagram: r.found_instagram,
    })
    if (
      next.business_name === r.business_name &&
      next.city === r.city &&
      next.category === r.category &&
      next.website_status === r.website_status &&
      next.phone === r.phone &&
      next.email === r.email &&
      next.instagram === r.instagram &&
      text === r.search_text
    ) {
      continue
    }
    await db
      .prepare(
        `UPDATE crm_opportunities SET business_name = ?, city = ?, category = ?, website_status = ?,
           phone = ?, email = ?, instagram = ?, search_text = ? WHERE id = ?`,
      )
      .run(next.business_name, next.city, next.category, next.website_status, next.phone, next.email, next.instagram, text, r.id)
    updated++
  }
  return { checked: rows.length, updated, missing }
}
