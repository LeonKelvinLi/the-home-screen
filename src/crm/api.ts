/*
  The CRM screen's only way to the server. Same-origin cookies carry the
  session (the operator's CRM session or the member's own); no token ever
  lives in the page.
*/

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: Record<string, unknown> = {},
  ) {
    super(message)
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? 'GET',
    credentials: 'same-origin',
    headers: init.body === undefined ? undefined : { 'content-type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    /* not JSON: the message below says so */
  }
  if (!res.ok) throw new ApiError(res.status, String(data.error ?? `Request failed (${res.status})`), data)
  return data as T
}

/* ------------------------------------------------------------------ types */

export interface Ref {
  id: string
  name: string
}

export interface Channels {
  phone: string
  email: string
  instagram: string
}

export interface LeadSummary {
  id: string
  brandId: string | null
  applicationId: string | null
  name: string
  /** The listing's tile, /icons/<icon>.webp, when it has one. */
  icon: string | null
  familyKey: string
  city: string | null
  category: string | null
  websiteStatus: string | null
  freeListing: boolean
  channels: Channels
  /** The person who runs the business, when someone has written it down. */
  contactName: string | null
  stage: string
  stageChangedAt: number
  opportunityType: string
  potentialCents: number
  referrer: Ref | null
  /** Glenn only because nobody else was recorded. */
  referralDefault: boolean
  sourceType: string | null
  assignee: Ref | null
  priority: string
  lastActivityAt: number | null
  nextFollowupAt: number | null
  firstContactedAt: number | null
  createdAt: number
}

export interface Person {
  id: string
  name: string
  slug: string
  sourceType: string
  role: 'admin' | 'team' | 'partner' | 'none'
  isTeam: boolean
  brandId: string | null
  /** Their BEASTY page's tile, if they have one: a face for the avatar. */
  icon: string | null
  linked: boolean
  active: boolean
}

export interface Offer {
  id: string
  name: string
  opportunityType: string
  oneTimeCents: number
  monthlyCents: number
  active: boolean
  sort: number
}

export interface Meta {
  stages: { key: string; label: string; group: string; rank: number | null }[]
  opportunityTypes: { key: string; label: string }[]
  websiteStatuses: { key: string; label: string; qualifies: boolean }[]
  followupTypes: string[]
  priorities: string[]
  activityTypes: string[]
  people: Person[]
  offers: Offer[]
  cities: { value: string; count: number }[]
  categories: { value: string; count: number }[]
  sources: { key: string; label: string; isPerson: boolean }[]
}

export interface Actor {
  actor: string
  role: 'admin' | 'team' | 'partner'
  personId: string | null
  name: string
  /** How they got in: the operator key, their member account, or open mode. */
  via: 'operator' | 'member' | 'open'
}

export interface ReferrerMetrics {
  id: string
  name: string
  slug: string
  sourceType: string
  role: string
  isTeam: boolean
  brandId: string | null
  linked: boolean
  active: boolean
  leads: number
  contacted: number
  replied: number
  interested: number
  proposals: number
  won: number
  conversion: number
  oneTimeCents: number
  mrrCents: number
  visits: number
}
