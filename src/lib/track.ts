/*
  WHAT PEOPLE DO ON BEASTY, reported by the page: a visit, the pages and
  businesses they see and open, what they search for, and the calls,
  directions and websites they go on to. docs/INTELLIGENCE.md has the design;
  server/intel.ts decides what is kept.

  IT CAN NEVER GET IN THE WAY. track() only pushes onto a queue and returns;
  the queue goes out every few seconds and when the page is hidden, by
  sendBeacon or a keepalive fetch, and nothing ever waits on it. Blocked,
  offline or failing, events are simply lost and the page carries on. No
  keystrokes: a search is reported when it is used, not as it is typed.

  A VISIT is a session: its id lives in localStorage with the time of the last
  thing done, and 30 idle minutes, or arriving on a new campaign link, starts a
  new one. The first event of a visit carries what brought it (entry type,
  landing path, referring host, campaign), read from the address BEFORE the
  referral and QR helpers tidy it.
*/

export type TrackEvent =
  | 'session_started'
  | 'page_viewed'
  | 'tile_impression'
  | 'business_opened'
  | 'business_closed'
  | 'search_started'
  | 'search_submitted'
  | 'search_result_clicked'
  | 'outbound_clicked'
  | 'share_clicked'
  | 'place_navigated'
  | 'gate_shown'
  | 'clip_played'
  | 'reserve_started'

export type TrackProps = Partial<{
  brand: string
  city: string
  page_kind: string
  seat: string
  surface: string
  position: number
  query: string
  kind: string
  count: number
  dwell_ms: number
  door: string
}>

interface Queued {
  e: TrackEvent
  id: string
  t: number
  p?: TrackProps
}

const SESSION_KEY = 'fb.session.v1'
const IDLE_MS = 30 * 60 * 1000
const ENDPOINT = '/api/t/events'
const VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'

const queue: Queued[] = []
let timer: number | null = null
let started = false
let ctx: Record<string, string> | null = null
let session: { id: string; last: number; campaign: string } | null = null
/* The first batch of a visit carries how it arrived. */
let ctxPending = false

const rid = (n = 16) => {
  const a = new Uint8Array(n)
  try {
    crypto.getRandomValues(a)
  } catch {
    for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256)
  }
  return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave|baidu|yandex)\./
const SOCIAL = /(^|\.)(instagram|facebook|fb|tiktok|t\.co|x\.com|twitter|linktr\.ee|threads\.net|snapchat|youtube|reddit|linkedin|pinterest)/

/** How this visit arrived, from the address and the referrer, before anything tidies them. */
function arrival(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const u = new URL(window.location.href)
    const q = u.searchParams
    out.landing = u.pathname.slice(0, 80)
    const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
    if (ref && ref !== u.hostname && !/(^|\.)beastypages\.com$|onrender\.com$/.test(ref)) out.referrer = ref
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
      const v = q.get(k)
      if (v) out[k] = v.slice(0, 80)
    }
    out.entry = q.get('b') && q.get('via') === 'qr'
      ? 'register_qr'
      : q.get('b')
        ? 'shared_business'
        : q.get('ref')
          ? 'member_ref'
          : q.get('from') === 'r'
            ? 'crm_ref'
            : out.utm_source
              ? 'campaign'
              : /^\/(collab|money|members|contacts)$/.test(u.pathname)
                ? 'shared_page'
                : out.referrer && SEARCH.test(out.referrer)
                  ? 'search_engine'
                  : out.referrer && SOCIAL.test(out.referrer)
                    ? 'social'
                    : out.referrer
                      ? 'referral'
                      : 'direct'
    out.device = window.innerWidth >= 1024 ? 'desktop' : window.innerWidth >= 700 ? 'tablet' : 'phone'
  } catch {
    /* an odd address: arrive as direct */
  }
  return out
}

function readSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    if (s && typeof s.id === 'string' && typeof s.last === 'number') return s as { id: string; last: number; campaign: string }
  } catch {
    /* storage blocked: a session per page load */
  }
  return null
}

function saveSession() {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* storage blocked */
  }
}

/** The current visit, starting a new one after 30 idle minutes or on a new campaign link. */
function currentSession(now: number): string {
  const campaign = ctx?.utm_campaign || ctx?.utm_source || ''
  if (!session) session = readSession()
  const fresh = !session || now - session.last > IDLE_MS || (campaign && campaign !== session.campaign)
  if (fresh) {
    /* A visit that timed out and restarted on this same page did not arrive
       by the link that opened the page: it is a direct return. */
    if (session && started && ctx) ctx = { entry: 'direct', landing: window.location.pathname.slice(0, 80), ...(ctx.device ? { device: ctx.device } : {}) }
    session = { id: rid(18), last: now, campaign }
    queue.unshift({ e: 'session_started', id: rid(), t: now })
    ctxPending = true
  } else if (session) {
    session.last = now
  }
  saveSession()
  return session!.id
}

function flush(useBeacon: boolean) {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
  if (!queue.length) return
  try {
    const now = Date.now()
    const sid = currentSession(now)
    const events = queue.splice(0, 40)
    const body = JSON.stringify({ v: VERSION, sid, ...(ctxPending && ctx ? { ctx } : {}), events })
    ctxPending = false
    const blob = new Blob([body], { type: 'text/plain' })
    if (useBeacon && navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob)) {
      /* handed to the browser */
    } else {
      void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, credentials: 'same-origin', headers: { 'content-type': 'text/plain' } }).catch(() => {})
    }
    if (queue.length) schedule()
  } catch {
    queue.length = 0
  }
}

function schedule() {
  if (timer === null) timer = window.setTimeout(() => flush(false), 4000)
}

/**
 * Report one thing that happened. Returns at once; never throws.
 */
export function track(e: TrackEvent, p?: TrackProps): void {
  try {
    if (!started) startTracking()
    queue.push({ e, id: rid(), t: Date.now(), ...(p ? { p } : {}) })
    if (queue.length >= 30) flush(false)
    else schedule()
  } catch {
    /* never in the way */
  }
}

/**
 * Read how this visit arrived and open (or continue) the session. Called once,
 * first thing, before the referral and QR helpers rewrite the address.
 */
export function startTracking(): void {
  if (started) return
  started = true
  try {
    ctx = arrival()
    currentSession(Date.now())
    schedule()
    const bye = () => {
      if (document.visibilityState === 'hidden') flush(true)
    }
    document.addEventListener('visibilitychange', bye)
    window.addEventListener('pagehide', () => flush(true))
  } catch {
    /* never in the way */
  }
}

/*
  WHERE AN OPEN CAME FROM. Whatever opens a business (a tile, a search result,
  a city row) notes it here a moment before; the business page takes it when
  it opens. Ten seconds, and only for the same business, so a stale note can
  never be pinned on a later open.
*/
export interface Origin {
  brand: string
  surface: string
  seat?: string
  city?: string
  page_kind?: string
  position?: number
  query?: string
}

let origin: (Origin & { at: number }) | null = null
/* The first business opened on a visit that arrived by a shared link is that link's. */
let firstOpenTaken = false

export function noteOrigin(o: Origin): void {
  origin = { ...o, at: Date.now() }
}

/** The note for this business, once; otherwise how the visit arrived. */
export function takeOrigin(brand: string): Omit<Origin, 'brand'> {
  const o = origin
  origin = null
  if (o && o.brand === brand && Date.now() - o.at < 10_000) {
    const { brand: _b, at: _a, ...rest } = o
    return rest
  }
  const arrived = ctx?.entry
  if (!firstOpenTaken && (arrived === 'shared_business' || arrived === 'register_qr')) {
    firstOpenTaken = true
    return { surface: 'share_link' }
  }
  firstOpenTaken = true
  return { surface: 'other' }
}

