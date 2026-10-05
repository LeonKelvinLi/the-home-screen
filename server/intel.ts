/*
  THE INTELLIGENCE LAYER'S FOUNDATION: visitors, sessions, and the events the
  page reports about itself. docs/INTELLIGENCE.md has the whole design; this
  file is the part that decides what gets stored.

  WHAT THE PAGE MAY REPORT is the list below and nothing else. Each event names
  the few properties it may carry, and each property has one rule: a business
  id that exists, a city BEASTY has a page for, a seat in the shape the home
  screen uses, a search's words normalized and dropped if they look like a
  phone number or an address. Anything else in a batch is refused and counted,
  never stored. No names, contacts, IP addresses, full URLs or keystrokes.

  WHO: a visitor is the hash of the httpOnly device cookie (the same anon id
  the old visit beacon used), a session is minted by the page and ends after
  30 idle minutes, and a member is linked to the devices they sign in on. A
  browser sending Global Privacy Control is counted anonymously: its events
  carry no visitor, session or member at all.

  NOTHING HERE CAN BREAK THE SITE. The route answers before it writes, every
  write is caught, and a malformed batch is simply dropped.
*/
import { createHmac } from 'node:crypto'
import { pool } from './db/schema'
import { BRANDS } from '../src/data/brands'
import { ALL_PLACEMENTS } from '../src/data/categorySeats'
import { CITY_PAGES } from '../src/data/cities'
import { seatsOf } from '../src/data/seats'
import { PAGE_KINDS as ALL_PAGE_KINDS, SEAT_RE } from '../src/data/slots'
import { isBot } from './analytics'

type Prop = 'brand' | 'city' | 'page_kind' | 'seat' | 'surface' | 'position' | 'query' | 'kind' | 'count' | 'dwell_ms' | 'door'

/** Everything the page may report, with the properties each may carry. */
export const CLIENT_EVENTS: Record<string, { label: string; props: Prop[] }> = {
  session_started: { label: 'Started a visit', props: [] },
  page_viewed: { label: 'Looked at a home screen page', props: ['city', 'page_kind', 'position'] },
  tile_impression: { label: 'Saw a business tile', props: ['brand', 'city', 'page_kind', 'seat', 'surface', 'position'] },
  business_opened: { label: 'Opened a business', props: ['brand', 'city', 'page_kind', 'seat', 'surface', 'position', 'query'] },
  business_closed: { label: 'Left a business page', props: ['brand', 'dwell_ms'] },
  search_started: { label: 'Opened search', props: [] },
  search_submitted: { label: 'Searched', props: ['query', 'count'] },
  search_result_clicked: { label: 'Opened a search result', props: ['query', 'brand', 'city', 'position', 'kind'] },
  outbound_clicked: { label: 'Called, got directions or went to their site', props: ['brand', 'kind'] },
  share_clicked: { label: 'Shared', props: ['brand', 'surface'] },
  place_navigated: { label: 'Went to the page a business is on', props: ['brand', 'city', 'page_kind', 'surface'] },
  gate_shown: { label: 'Was asked to sign up', props: ['door'] },
  clip_played: { label: 'Watched a clip', props: ['brand'] },
  reserve_started: { label: 'Opened Reserve a Spot', props: ['seat', 'city', 'page_kind'] },
  category_opened: { label: 'Opened a BEASTY category', props: ['page_kind', 'surface'] },
  button_tapped: { label: 'Tapped a home-screen button', props: ['kind'] },
}

const BRAND_IDS = new Set(BRANDS.map((b) => b.id))
const CITIES = new Set([...CITY_PAGES, 'BEASTY'])
/* 'pages' is BEASTY • Pages, the grid of category tiles, and 'pages2' the yellow page behind it; neither has seats. */
const PAGE_KINDS = new Set([...ALL_PAGE_KINDS, 'pages', 'pages2'])
const SURFACES = new Set(['home_tile', 'search_result', 'search_list', 'city_row', 'nav_place', 'reel', 'share_link', 'recents', 'favorites', 'news', 'gallery', 'dock', 'business_page', 'landing', 'members', 'other'])
const KINDS = new Set(['call', 'text', 'email', 'directions', 'website', 'order', 'menu', 'instagram', 'clip', 'booking', 'brand', 'item', 'city', 'category', 'gallery', 'watch', 'news', 'calendar', 'scan', 'contacts', 'search'])
export const ENTRY_TYPES = new Set(['direct', 'shared_business', 'register_qr', 'member_ref', 'crm_ref', 'campaign', 'search_engine', 'social', 'referral', 'shared_page'])
const DEVICES = new Set(['phone', 'tablet', 'desktop'])

const int = (v: unknown, max: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? (v as number) : null)

/**
 * A search as it may be kept: lowercase words, no punctuation beyond what food
 * and places use, at most 60 characters, and nothing at all if it looks like
 * a phone number or an email address.
 */
export function normalizeQuery(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}&' -]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)
  if (s.length < 2) return null
  if (/@/.test(v) || (v.match(/\d/g) ?? []).length >= 7) return null
  return s
}

/** One property, checked against its rule; null means "not kept". */
function clean(prop: Prop, v: unknown): string | number | null {
  switch (prop) {
    case 'brand':
      return typeof v === 'string' && BRAND_IDS.has(v) ? v : null
    case 'city':
      return typeof v === 'string' && CITIES.has(v) ? v : null
    case 'page_kind':
      return typeof v === 'string' && PAGE_KINDS.has(v) ? v : null
    case 'seat':
      return typeof v === 'string' && v.length <= 80 && /^[a-z0-9-]+$/.test(v) && SEAT_RE.test(v) ? v : null
    case 'surface':
      return typeof v === 'string' && SURFACES.has(v) ? v : null
    case 'kind':
      return typeof v === 'string' && KINDS.has(v) ? v : null
    case 'door':
      return typeof v === 'string' && /^[a-z_]{2,30}$/.test(v) ? v : null
    case 'query':
      return normalizeQuery(v)
    case 'position':
      return int(v, 100000)
    case 'count':
      return int(v, 100000)
    case 'dwell_ms':
      return int(v, 86_400_000)
  }
}

export const deviceOf = (ua: string, hint?: unknown): string =>
  typeof hint === 'string' && DEVICES.has(hint) ? hint : /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? 'tablet' : /iPhone|iPod|Android.*Mobile|Mobile/i.test(ua) ? 'phone' : 'desktop'

export const platformOf = (ua: string): string =>
  /iPhone|iPad|iPod/i.test(ua) ? 'ios' : /Android/i.test(ua) ? 'android' : /Macintosh|Mac OS X/i.test(ua) ? 'mac' : /Windows/i.test(ua) ? 'windows' : /Linux|CrOS/i.test(ua) ? 'linux' : 'other'

/* A host as it may be kept: the name only, never a path. */
const hostOnly = (v: unknown) => {
  if (typeof v !== 'string') return null
  const h = v.toLowerCase().replace(/^[a-z]+:\/\//, '').split(/[/?#:]/)[0].replace(/^www\./, '')
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(h) ? h.slice(0, 100) : null
}
const shortText = (v: unknown, max: number) =>
  typeof v === 'string' && v.trim() ? v.normalize('NFKC').replace(/[^\p{L}\p{N} ._\-+:/]/gu, '').trim().slice(0, max) || null : null

export interface IngestWho {
  /** The visitor's anon id, or null for a browser that sent Global Privacy Control. */
  anon: string | null
  memberId: string | null
  ua: string
  gpc: boolean
  now?: number
}

export interface IngestResult {
  stored: number
  refused: number
  reason?: string
}

/**
 * One batch from the page: {v, sid, ctx?, events: [{e, id, t, p}]}. Returns
 * what was kept and what was refused, for the audit; the route never waits
 * for it.
 */
export async function ingest(raw: unknown, who: IngestWho): Promise<IngestResult> {
  const now = who.now ?? Date.now()
  let body = raw
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return { stored: 0, refused: 0, reason: 'not JSON' }
    }
  }
  if (typeof body !== 'object' || body === null) return { stored: 0, refused: 0, reason: 'not an object' }
  const b = body as Record<string, unknown>
  const list = Array.isArray(b.events) ? b.events.slice(0, 40) : []
  if (!list.length) return { stored: 0, refused: 0, reason: 'no events' }
  const sid = !who.gpc && typeof b.sid === 'string' && /^[A-Za-z0-9_-]{16,40}$/.test(b.sid) ? b.sid : null
  const version = typeof b.v === 'string' && /^[A-Za-z0-9._-]{1,24}$/.test(b.v) ? b.v : null
  const ctx = (typeof b.ctx === 'object' && b.ctx !== null ? b.ctx : {}) as Record<string, unknown>
  const bot = isBot(who.ua)
  const device = deviceOf(who.ua, ctx.device)
  const platform = platformOf(who.ua)
  const memberId = who.gpc ? null : who.memberId
  const anon = who.gpc ? null : who.anon

  let internal = false
  try {
    if (anon) {
      const touch = {
        entry: typeof ctx.entry === 'string' && ENTRY_TYPES.has(ctx.entry) ? ctx.entry : undefined,
        landing: typeof ctx.landing === 'string' && ctx.landing.startsWith('/') ? shortText(ctx.landing.split(/[?#]/)[0], 80) : undefined,
        referrer: hostOnly(ctx.referrer) ?? undefined,
        utm_source: shortText(ctx.utm_source, 60) ?? undefined,
        utm_medium: shortText(ctx.utm_medium, 60) ?? undefined,
        utm_campaign: shortText(ctx.utm_campaign, 80) ?? undefined,
        at: now,
      }
      const r = await pool.query<{ is_internal: boolean }>(
        `INSERT INTO analytics_visitors (anon_id, first_seen, last_seen, first_touch, member_id, linked_at)
         VALUES ($1, $2, $2, $3::jsonb, $4, CASE WHEN $4::text IS NULL THEN NULL ELSE $2::bigint END)
         ON CONFLICT (anon_id) DO UPDATE SET
           last_seen = GREATEST(analytics_visitors.last_seen, EXCLUDED.last_seen),
           member_id = COALESCE(analytics_visitors.member_id, EXCLUDED.member_id),
           linked_at = COALESCE(analytics_visitors.linked_at, EXCLUDED.linked_at)
         RETURNING is_internal`,
        [anon, now, JSON.stringify(touch), memberId],
      )
      internal = !!r.rows[0]?.is_internal
    }
    if (!internal && memberId) {
      const f = await pool.query('SELECT 1 FROM crm_member_flags WHERE member_id = $1 AND internal', [memberId]).catch(() => ({ rowCount: 0 }))
      internal = (f.rowCount ?? 0) > 0
    }
    if (sid) {
      await pool.query(
        `INSERT INTO analytics_sessions
           (session_id, anon_id, member_id, started_at, last_at, entry_type, landing, referrer, utm_source, utm_medium, utm_campaign,
            device, platform, app_version, events, is_bot, is_internal)
         VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (session_id) DO UPDATE SET
           last_at = GREATEST(analytics_sessions.last_at, EXCLUDED.last_at),
           events = analytics_sessions.events + EXCLUDED.events,
           member_id = COALESCE(analytics_sessions.member_id, EXCLUDED.member_id),
           is_internal = analytics_sessions.is_internal OR EXCLUDED.is_internal`,
        [
          sid,
          anon,
          memberId,
          now,
          typeof ctx.entry === 'string' && ENTRY_TYPES.has(ctx.entry) ? ctx.entry : null,
          typeof ctx.landing === 'string' && ctx.landing.startsWith('/') ? shortText(ctx.landing.split(/[?#]/)[0], 80) : null,
          hostOnly(ctx.referrer),
          shortText(ctx.utm_source, 60),
          shortText(ctx.utm_medium, 60),
          shortText(ctx.utm_campaign, 80),
          device,
          platform,
          version,
          list.length,
          bot,
          internal,
        ],
      )
    }
  } catch (err) {
    console.warn('[intel] visitor/session not recorded:', String((err as Error)?.message ?? err).slice(0, 160))
  }

  const rows: unknown[][] = []
  let refused = 0
  for (const x of list) {
    if (typeof x !== 'object' || x === null) {
      refused++
      continue
    }
    const ev = x as Record<string, unknown>
    const name = typeof ev.e === 'string' ? ev.e : ''
    const spec = CLIENT_EVENTS[name]
    const eid = typeof ev.id === 'string' && /^[A-Za-z0-9_-]{8,40}$/.test(ev.id) ? ev.id : null
    if (!spec || !eid) {
      refused++
      continue
    }
    const p = (typeof ev.p === 'object' && ev.p !== null ? ev.p : {}) as Record<string, unknown>
    const kept: Partial<Record<Prop, string | number>> = {}
    let bad = false
    for (const [k, v] of Object.entries(p)) {
      if (!spec.props.includes(k as Prop)) continue
      const c = clean(k as Prop, v)
      if (c === null) {
        /* A business that does not exist is a refused event, not a stripped
           one: it is the property the whole event is about. */
        if (k === 'brand') bad = true
        continue
      }
      kept[k as Prop] = c
    }
    if (bad) {
      refused++
      continue
    }
    const clientAt = Number.isFinite(ev.t) && Math.abs((ev.t as number) - now) < 7 * 864e5 ? Math.round(ev.t as number) : null
    /* Once per session per seat for an impression; otherwise once per event id. */
    const dedupe =
      name === 'tile_impression' && sid && kept.brand ? `imp|${sid}|${kept.seat ?? ''}|${kept.brand}` : `c|${eid}`
    const meta: Record<string, string | number> = {}
    if (kept.kind !== undefined) meta.kind = kept.kind
    if (kept.count !== undefined) meta.count = kept.count
    if (kept.dwell_ms !== undefined) meta.dwell_ms = kept.dwell_ms
    if (kept.door !== undefined) meta.door = kept.door
    rows.push([
      `ev_${eid.slice(0, 16)}${now.toString(36)}`.slice(0, 40),
      name,
      memberId ? 'member' : 'visitor',
      memberId,
      anon,
      kept.brand ? 'brand' : null,
      (kept.brand as string) ?? null,
      sid,
      'web',
      JSON.stringify(meta),
      dedupe,
      now,
      anon,
      (kept.brand as string) ?? null,
      (kept.city as string) ?? null,
      (kept.page_kind as string) ?? null,
      (kept.seat as string) ?? null,
      (kept.surface as string) ?? null,
      (kept.position as number) ?? null,
      (kept.query as string) ?? null,
      device,
      platform,
      version,
      internal,
      bot,
      clientAt,
    ])
  }
  if (!rows.length) return { stored: 0, refused }
  const cols = 26
  const values = rows.map((_, i) => `(${Array.from({ length: cols }, (_, j) => `$${i * cols + j + 1}`).join(',')})`).join(',')
  try {
    const r = await pool.query(
      `INSERT INTO analytics_events
         (id, name, actor_type, member_id, actor, entity_type, entity_id, session_id, source, metadata, dedupe_key, occurred_at,
          anon_id, brand_id, city, page_kind, seat, surface, position, query_norm, device, platform, app_version, is_internal, is_bot, client_at)
       VALUES ${values}
       ON CONFLICT DO NOTHING`,
      rows.flat(),
    )
    return { stored: r.rowCount ?? 0, refused }
  } catch (err) {
    console.warn('[intel] events not recorded:', String((err as Error)?.message ?? err).slice(0, 160))
    return { stored: 0, refused, reason: 'insert failed' }
  }
}

/**
 * A device signed in or up: from now on it is that member's, and everything
 * it did before joining becomes readable as their history. Earlier rows are
 * not rewritten; the link is the join.
 */
export async function linkVisitor(anon: string | null, memberId: string, now = Date.now()): Promise<void> {
  if (!anon) return
  try {
    await pool.query(
      `INSERT INTO analytics_visitors (anon_id, first_seen, last_seen, member_id, linked_at)
       VALUES ($1, $2, $2, $3, $2)
       ON CONFLICT (anon_id) DO UPDATE SET
         member_id = COALESCE(analytics_visitors.member_id, EXCLUDED.member_id),
         linked_at = COALESCE(analytics_visitors.linked_at, EXCLUDED.linked_at),
         last_seen = GREATEST(analytics_visitors.last_seen, EXCLUDED.last_seen)`,
      [anon, now, memberId],
    )
  } catch (err) {
    console.warn('[intel] link not recorded:', String((err as Error)?.message ?? err).slice(0, 160))
  }
}

/** The private link that marks a phone as the team's, so its browsing is left out. */
export const teamToken = (secret: string) => createHmac('sha256', secret).update('beasty-team-device').digest('base64url').slice(0, 22)

export async function markInternal(anon: string): Promise<void> {
  await pool.query(
    `INSERT INTO analytics_visitors (anon_id, first_seen, last_seen, is_internal) VALUES ($1, $2, $2, TRUE)
     ON CONFLICT (anon_id) DO UPDATE SET is_internal = TRUE`,
    [anon, Date.now()],
  )
}

const PT_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' })

/**
 * What every business was today, and which seats changed hands since the last
 * boot. Run at boot on the public service; the first run of a Pacific day
 * writes the day, and later boots that day refresh it.
 */
export async function snapshotDirectory(now = Date.now()): Promise<{ brands: number; opened: number; closed: number }> {
  const day = PT_DAY.format(new Date(now))
  const rows = BRANDS.map((b) => {
    const seats = seatsOf(b.id)
    return [day, b.id, b.name, b.tier ?? 3, b.cuisine ?? null, seats[0]?.city ?? null, JSON.stringify(seats), !!b.site]
  })
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200)
    const values = chunk.map((_, k) => `(${Array.from({ length: 8 }, (_, j) => `$${k * 8 + j + 1}`).join(',')})`).join(',')
    await pool.query(
      `INSERT INTO analytics_brand_days (pt_date, brand_id, name, tier, category, city, seats, has_site) VALUES ${values}
       ON CONFLICT (pt_date, brand_id) DO UPDATE SET name = EXCLUDED.name, tier = EXCLUDED.tier, category = EXCLUDED.category,
         city = EXCLUDED.city, seats = EXCLUDED.seats, has_site = EXCLUDED.has_site`,
      chunk.flat(),
    )
  }
  const open = await pool.query<{ seat: string; brand_id: string }>('SELECT seat, brand_id FROM analytics_placements WHERE to_at IS NULL')
  const was = new Map(open.rows.map((r) => [r.seat, r.brand_id]))
  let opened = 0
  let closed = 0
  for (const [seat, brand] of was) {
    if (ALL_PLACEMENTS[seat] !== brand) {
      await pool.query('UPDATE analytics_placements SET to_at = $3 WHERE seat = $1 AND brand_id = $2 AND to_at IS NULL', [seat, brand, now])
      closed++
    }
  }
  /* Category-page seats included: a tattoo studio holds BEASTY · Tattoo as well as its city seat. */
  for (const [seat, brand] of Object.entries(ALL_PLACEMENTS)) {
    if (was.get(seat) === brand) continue
    await pool.query('INSERT INTO analytics_placements (seat, brand_id, from_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [seat, brand, now])
    opened++
  }
  return { brands: rows.length, opened, closed }
}

/** Raw events older than the retention window go; rollups and markers stay. */
export async function prune(days: number, now = Date.now()): Promise<number> {
  if (!Number.isFinite(days) || days < 30) return 0
  const before = now - days * 864e5
  const r = await pool.query(`DELETE FROM analytics_events WHERE occurred_at < $1 AND name <> 'tracking_started'`, [before])
  await pool.query('DELETE FROM analytics_sessions WHERE last_at < $1', [before])
  return r.rowCount ?? 0
}
