/*
  WHAT BROUGHT THIS VISITOR, and one visit a day for the numbers.

  The UTM fields of a campaign link, the site that sent them (its host only,
  never the page, which can carry somebody's search) and the path they landed
  on. Kept in localStorage for 90 days so it is still there when they sign up
  a week later; a new campaign link replaces it, anything else leaves the
  first one standing. Sent with the sign-up (account.ts), which is how a new
  member's "where did they come from" is known.

  The visit itself goes out once a day per device with sendBeacon, which never
  holds up the page. The server drops crawlers and signed-in members, and
  keeps no IP address (server/analytics.ts).
*/
export interface Attribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
  landing?: string
  at?: number
}

const KEY = 'fb.attribution.v1'
const SENT = 'fb.visit.v1'
const KEEP_MS = 90 * 864e5
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

function read(): Attribution | null {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Attribution | null
    return a && typeof a === 'object' && Date.now() - (a.at ?? 0) < KEEP_MS ? a : null
  } catch {
    return null
  }
}

/** The referring site's host, when it is not BEASTY itself. */
function referrerHost(ref: string): string | undefined {
  try {
    if (!ref) return undefined
    const host = new URL(ref).hostname.replace(/^www\./, '')
    return host && host !== window.location.hostname.replace(/^www\./, '') ? host : undefined
  } catch {
    return undefined
  }
}

/** Keep what brought this visit, if it is the first in 90 days or a new campaign link. */
export function captureAttribution(loc: Location = window.location, ref = document.referrer): Attribution | null {
  const kept = read()
  try {
    const q = new URLSearchParams(loc.search)
    const utm: Attribution = {}
    for (const k of UTM) {
      const v = q.get(k)?.trim().slice(0, 100)
      if (v) utm[k] = v
    }
    if (kept && !Object.keys(utm).length) return kept
    const host = referrerHost(ref)
    const fresh: Attribution = { ...utm, ...(host ? { referrer: host } : {}), landing: loc.pathname.slice(0, 120), at: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(fresh))
    return fresh
  } catch {
    return kept
  }
}

/** What to send with a sign-up. */
export const pendingAttribution = (): Attribution | null => read()

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })

/** One visit a day per device, without holding up the page. */
export function sendVisit(): void {
  try {
    if (localStorage.getItem(SENT) === today()) return
    const body = JSON.stringify({ attribution: read() ?? { landing: window.location.pathname } })
    const sent = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/t/visit', body)
    if (!sent) void fetch('/api/t/visit', { method: 'POST', body, keepalive: true, credentials: 'same-origin' }).then((r) => r.body?.cancel()).catch(() => {})
    localStorage.setItem(SENT, today())
  } catch {
    /* private mode: no visit is counted, and nothing breaks */
  }
}
