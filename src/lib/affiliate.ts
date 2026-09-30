/*
  THE AFFILIATE DASHBOARD'S DATA (server/affiliate.ts, docs/AFFILIATE.md).

  Every number here is computed by the server from recorded facts. The page
  only picks which window to show; it never adds, rounds away or estimates.
*/

export type WindowKey = '7d' | '30d' | '90d' | 'all'

export const WINDOW_TABS: { key: WindowKey; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'all', label: 'All time' },
]

export interface Bucket {
  key: string
  label: string
  clicks: number
  joined: number
  qualified: number
  businesses: number
}

export interface AffiliateWindow {
  since: number
  clicks: { user: number; business: number; total: number }
  users: { joined: number; qualified: number }
  businesses: { referred: number; converted: number; wonInWindow: number }
  conversions: number
  /** 0 to 1, or null when nobody has opened the link in the window. */
  userConversion: number | null
  businessConversion: number | null
  series: Bucket[]
}

export interface ReferredUser {
  label: string
  joinedAt: number
  qualified: boolean
  qualifiedAt: number | null
  reward: string
}

export interface ReferredBusiness {
  name: string
  city: string | null
  referredAt: number
  status: string
  bucket: 'pending' | 'converted' | 'closed'
  page: string
  listing: string | null
  reward: string
}

export interface Affiliate {
  affiliate: {
    code: string
    since: number
    status: string
    links: { user: string; business: string }
  }
  program: {
    perTicket: number
    discountPerMilestone: number
    discountCap: number
    tierName: string | null
    cashRewards: boolean
    clicksCountedFrom: number
  }
  lifetime: {
    users: number
    qualified: number
    pendingUsers: number
    businesses: number
    businessesConverted: number
    pendingBusinesses: number
    conversions: number
    clicks: number
  }
  windows: Record<WindowKey, AffiliateWindow>
  users: ReferredUser[]
  businesses: ReferredBusiness[]
  rewards: {
    tickets: { earned: number; unused: number }
    toNextTicket: number
    discountDollars: number
    discountCapped: boolean
    cash: { pendingCents: number; earnedCents: number; paidCents: number }
  }
  activity: { at: number; kind: string; text: string }[]
  /** $9 a month per paying member or business brought in (server/affiliate.ts FOUNDATION). */
  foundation: {
    name: string
    perMonthCents: number
    payingMembers: number
    payingBusinesses: number
    monthlyCents: number
  }
}

export async function fetchAffiliate(): Promise<Affiliate> {
  const r = await fetch('/api/affiliate/me', { credentials: 'same-origin', cache: 'no-store' })
  const data = (await r.json().catch(() => ({}))) as Affiliate & { error?: string }
  if (!r.ok) throw new Error(data.error || 'Your dashboard did not load. Try again.')
  return data
}

const SENT_KEY = 'fb.refclick.v1'

/**
 * A member's link was opened: tell the server once per code per visit. The
 * server decides whether it counts (a new device today, not the owner, not a
 * signed-in member), so this may be called freely.
 */
export function sendReferralClick(search = window.location.search): void {
  try {
    const code = new URLSearchParams(search).get('ref')?.toUpperCase()
    if (!code || !/^[0-9A-Z]{4,16}$/.test(code)) return
    const sent = new Set<string>(JSON.parse(sessionStorage.getItem(SENT_KEY) ?? '[]'))
    if (sent.has(code)) return
    sent.add(code)
    sessionStorage.setItem(SENT_KEY, JSON.stringify([...sent]))
    void fetch('/api/affiliate/click', {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, landing: window.location.pathname.slice(0, 80) }),
    }).catch(() => {})
  } catch {
    /* storage blocked or offline: a click not counted, never a page broken */
  }
}

/** "12%" for a 0-to-1 share; a dash when there is nothing to divide. */
export const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`)

export const money = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`

const DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
export const dateOf = (ms: number) => DATE.format(new Date(ms))

/** "2h ago", "Yesterday", "Sep 12" — how a feed says when. */
export function when(ms: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ms) / 1000))
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2 * 86400) return 'Yesterday'
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`
  return SHORT.format(new Date(ms))
}
