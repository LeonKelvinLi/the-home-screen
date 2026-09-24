/*
  THE CRM'S VOCABULARY, shared by the server (server/crm) and the /crm screen.

  One list of stages, activity types and website statuses, imported by both
  sides, so "Interested" or "Square Online" can never mean one thing in the
  database and another on the screen. Nothing here touches the network or the
  database; it is plain data and pure functions.
*/

/* ---------------------------------------------------------------- stages */

export type StageGroup = 'open' | 'won' | 'closed'

/**
 * The pipeline, in order. `rank` is how far along the funnel a stage is, used
 * to answer "how many were ever contacted / replied / became interested" from
 * the stage history. The alternate endings (no response, not interested, bad
 * lead, closed/lost) have no rank: they say how it ended, not how far it got.
 */
export const STAGES = [
  { key: 'new_lead', label: 'New lead', group: 'open', rank: 0 },
  { key: 'need_contact_info', label: 'Need contact info', group: 'open', rank: 0 },
  { key: 'ready_to_contact', label: 'Ready to contact', group: 'open', rank: 1 },
  { key: 'contacted', label: 'Contacted', group: 'open', rank: 2 },
  { key: 'replied', label: 'Replied', group: 'open', rank: 3 },
  { key: 'interested', label: 'Interested', group: 'open', rank: 4 },
  { key: 'meeting', label: 'Meeting / follow-up', group: 'open', rank: 5 },
  { key: 'proposal_sent', label: 'Proposal sent', group: 'open', rank: 6 },
  { key: 'won', label: 'Won', group: 'won', rank: 7 },
  { key: 'onboarding', label: 'Onboarding', group: 'won', rank: 8 },
  { key: 'active_customer', label: 'Active customer', group: 'won', rank: 9 },
  { key: 'no_response', label: 'No response', group: 'closed', rank: null },
  { key: 'not_interested', label: 'Not interested', group: 'closed', rank: null },
  { key: 'bad_lead', label: 'Bad lead', group: 'closed', rank: null },
  { key: 'closed_lost', label: 'Closed / lost', group: 'closed', rank: null },
] as const satisfies readonly { key: string; label: string; group: StageGroup; rank: number | null }[]

export type StageKey = (typeof STAGES)[number]['key']

export const STAGE_KEYS: readonly string[] = STAGES.map((s) => s.key)
export const isStage = (v: unknown): v is StageKey => typeof v === 'string' && STAGE_KEYS.includes(v)
export const stageOf = (key: string) => STAGES.find((s) => s.key === key)
export const stageLabel = (key: string | null | undefined) => (key ? stageOf(key)?.label ?? key : '—')
export const stageRank = (key: string | null | undefined): number | null =>
  (key ? stageOf(key)?.rank ?? null : null)

/** Stages where the lead is still being worked (not won, not closed). */
export const OPEN_STAGES: readonly string[] = STAGES.filter((s) => s.group === 'open').map((s) => s.key)
/** Everything at or past Contacted on the funnel. */
export const CONTACTED_OR_LATER: readonly string[] = STAGES.filter((s) => s.rank !== null && s.rank >= 2).map((s) => s.key)

/** Funnel ranks the analytics count "ever reached". */
export const FUNNEL = {
  contacted: 2,
  replied: 3,
  interested: 4,
  proposal: 6,
  won: 7,
} as const

/* ------------------------------------------------------ opportunity types */

export const OPPORTUNITY_TYPES = [
  { key: 'website', label: 'Website' },
  { key: 'seo', label: 'SEO' },
  { key: 'beasty_program', label: 'BEASTY program' },
  { key: 'website_redesign', label: 'Website redesign' },
  { key: 'hosting', label: 'Hosting / maintenance' },
  { key: 'other', label: 'Other' },
] as const

export const OPPORTUNITY_KEYS: readonly string[] = OPPORTUNITY_TYPES.map((o) => o.key)
export const opportunityLabel = (key: string | null | undefined) =>
  OPPORTUNITY_TYPES.find((o) => o.key === key)?.label ?? key ?? '—'

/* --------------------------------------------------------- activity types */

/**
 * Types a person logs by hand. The column itself is free text, so the system
 * types below and any future ones need no migration; the server only lets a
 * person write these.
 */
export const MANUAL_ACTIVITY_TYPES = ['NOTE', 'CALL', 'TEXT', 'EMAIL', 'INSTAGRAM_DM', 'PROPOSAL'] as const
export const SYSTEM_ACTIVITY_TYPES = [
  'REFERRAL',
  'STAGE_CHANGE',
  'FOLLOW_UP',
  'DEAL_WON',
  'DEAL_LOST',
  'ASSIGNMENT',
  'SYSTEM',
] as const

export const ACTIVITY_LABELS: Record<string, string> = {
  NOTE: 'Note',
  CALL: 'Call',
  TEXT: 'Text',
  EMAIL: 'Email',
  INSTAGRAM_DM: 'Instagram DM',
  PROPOSAL: 'Proposal',
  REFERRAL: 'Referral',
  STAGE_CHANGE: 'Stage change',
  FOLLOW_UP: 'Follow-up',
  DEAL_WON: 'Deal won',
  DEAL_LOST: 'Deal lost',
  ASSIGNMENT: 'Assignment',
  SYSTEM: 'System',
}

/** Outreach that counts as contacting the business (sets first_contacted_at). */
export const CONTACT_ACTIVITY_TYPES: readonly string[] = ['CALL', 'TEXT', 'EMAIL', 'INSTAGRAM_DM']

export const FOLLOWUP_TYPES = ['call', 'text', 'email', 'instagram', 'meeting', 'other'] as const
export const PRIORITIES = ['low', 'normal', 'high'] as const

/* ---------------------------------------------------------- source types */

/** The seed list. Stored in crm_source_types, so more can be added as rows. */
export const DEFAULT_SOURCE_TYPES = [
  { key: 'celebrity', label: 'Celebrity', isPerson: true },
  { key: 'individual', label: 'BEASTY Individual', isPerson: true },
  { key: 'influencer', label: 'Influencer', isPerson: true },
  { key: 'glenn', label: 'Glenn', isPerson: true },
  { key: 'leon', label: 'Leon', isPerson: true },
  { key: 'team', label: 'Team member', isPerson: true },
  { key: 'business', label: 'Existing business', isPerson: true },
  { key: 'organic', label: 'Organic', isPerson: false },
  { key: 'instagram', label: 'Instagram', isPerson: false },
  { key: 'cold_outreach', label: 'Cold outreach', isPerson: false },
  { key: 'referral_link', label: 'Referral link', isPerson: false },
  { key: 'qr_code', label: 'QR code', isPerson: false },
  { key: 'other', label: 'Other', isPerson: false },
] as const

/* -------------------------------------------------------- website status */

export const WEBSITE_STATUSES = [
  { key: 'none', label: 'No website', qualifies: true },
  { key: 'instagram_only', label: 'Instagram only', qualifies: true },
  { key: 'linktree', label: 'Linktree', qualifies: true },
  { key: 'wix_placeholder', label: 'Wix placeholder', qualifies: true },
  { key: 'square_online', label: 'Square Online', qualifies: true },
  { key: 'toast_page', label: 'Toast ordering page', qualifies: true },
  { key: 'clover_page', label: 'Clover ordering page', qualifies: true },
  { key: 'ordering_only', label: 'Ordering-only page', qualifies: true },
  { key: 'hosted_placeholder', label: 'Hosted placeholder', qualifies: true },
  { key: 'other_stopgap', label: 'Stopgap link only', qualifies: true },
  { key: 'needs_work', label: 'Existing site needs work', qualifies: true },
  { key: 'has_site', label: 'Has a website', qualifies: false },
] as const

export type WebsiteStatus = (typeof WEBSITE_STATUSES)[number]['key']
export const websiteStatusLabel = (key: string | null | undefined) =>
  WEBSITE_STATUSES.find((w) => w.key === key)?.label ?? (key || '—')

const STOPGAP_PATTERNS: [RegExp, WebsiteStatus][] = [
  [/(^|\.)instagram\.com$/, 'instagram_only'],
  [/(^|\.)linktr\.ee$/, 'linktree'],
  [/\.wixsite\.com$/, 'wix_placeholder'],
  [/(\.square\.site|(^|\.)squareup\.com)$/, 'square_online'],
  [/((^|\.)toasttab\.com|\.toast\.site)$/, 'toast_page'],
  [/\.cloveronline\.com$/, 'clover_page'],
  [/((^|\.)poweredbydmp\.com|\.godaddysites\.com|(^|\.)beacons\.ai)$/, 'hosted_placeholder'],
  [/((^|\.)chowbus\.com|(^|\.)menufy\.com|(^|\.)order\.online|(^|\.)owner\.com|(^|\.)ordersakana\.com)$/, 'ordering_only'],
  [
    /((^|\.)gofundme\.com|(^|\.)youtube\.com|(^|\.)yelp\.com|(^|\.)sites\.google\.com|\.myshopify\.com|(^|\.)doordash\.com|(^|\.)styleseat\.com|(^|\.)facebook\.com|\.tumblr\.com|(^|\.)tiktok\.com)$/,
    'other_stopgap',
  ],
]

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

/**
 * The same test the home screen's red ring uses (no site, or a site marked as
 * a stopgap), refined into which kind of stopgap. An own domain that is still
 * flagged (a two-page shell, a dead domain, an ordering template) is "needs
 * work": a redesign pitch rather than a missing site.
 */
export function websiteStatusOf(b: { site?: string | null; needsSite?: boolean | null; beastyOwner?: boolean | null }): WebsiteStatus {
  if (!b.site) return 'none'
  if (!b.needsSite) return 'has_site'
  const host = hostOf(b.site)
  for (const [re, status] of STOPGAP_PATTERNS) if (re.test(host)) return status
  return 'needs_work'
}

export const qualifiesForWebsite = (status: string | null | undefined) =>
  WEBSITE_STATUSES.some((w) => w.key === status && w.qualifies)

/* ----------------------------------------------------------- normalizing */

/** Digits only, US numbers without the leading 1. Never invents a number. */
export function normPhone(v: string | null | undefined): string {
  const d = String(v ?? '').replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) return d.slice(1)
  return d.length >= 7 ? d : ''
}

export const normEmail = (v: string | null | undefined) => {
  const e = String(v ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : ''
}

/** A handle from "@handle", "handle" or a profile URL; lowercase, no @. */
export function normInstagram(v: string | null | undefined): string {
  const s = String(v ?? '').trim()
  if (!s) return ''
  const m = /instagram\.com\/([A-Za-z0-9_.]+)/i.exec(s)
  const h = (m ? m[1] : s.replace(/^@/, '')).toLowerCase()
  return /^[a-z0-9_.]{1,30}$/.test(h) && !['p', 'reel', 'reels', 'explore', 'stories'].includes(h) ? h : ''
}

/**
 * The key that groups one business's locations: its name, lowercased, accents
 * and punctuation dropped. Exact on purpose: "Pho Nation" and "Pho Nation SF"
 * stay apart until someone decides they are one business. A wrong merge hides
 * a location; a missed one is a click to fix.
 */
export function familyKey(name: string): string {
  return String(name)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/* -------------------------------------------------------------- contacts */

export interface ContactSource {
  phone?: string | null
  email?: string | null
  instagram?: string | null
  site?: string | null
}

export interface Channels {
  phone: string
  email: string
  instagram: string
}

/**
 * How this business can be reached, from what is on file and nothing else.
 * An Instagram-only business whose "site" is its profile is reachable there.
 */
export function channelsOf(c: ContactSource): Channels {
  return {
    phone: normPhone(c.phone),
    email: normEmail(c.email),
    instagram: normInstagram(c.instagram) || (c.site && /instagram\.com/i.test(c.site) ? normInstagram(c.site) : ''),
  }
}

export const hasChannel = (c: Channels) => !!(c.phone || c.email || c.instagram)

export const fmtPhone = (digits: string) =>
  digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : digits

/* ----------------------------------------------------------------- money */

export const DEFAULT_OFFERS = [
  { id: 'website_build', name: 'Website Build', opportunityType: 'website', oneTimeCents: 14900, monthlyCents: 3000, sort: 10 },
  { id: 'seo', name: 'SEO', opportunityType: 'seo', oneTimeCents: 15000, monthlyCents: 3000, sort: 20 },
  {
    id: 'website_beasty_year',
    name: 'Website Build + 1 Year BEASTY Program',
    opportunityType: 'website',
    oneTimeCents: 19900,
    monthlyCents: 3000,
    sort: 30,
  },
] as const

export const fmtMoney = (cents: number | null | undefined) => {
  const v = Number(cents ?? 0) / 100
  return v % 1 === 0 ? `$${v.toLocaleString('en-US')}` : `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const DAY_MS = 86_400_000
