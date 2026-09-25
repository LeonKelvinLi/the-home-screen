/*
  WHAT PEOPLE DO ON BEASTY, as one list of named events.

  Every place that records an action calls track() with a name from EVENTS, so
  names cannot drift between call sites and the CRM's Home can say exactly what
  it counts. The list also carries the two definitions every user number rests
  on, kept here and nowhere else:

    ACTIVE     did something with BEASTY in the period: a MEANINGFUL event.
               Opening the app is recorded but is not enough on its own.
    ACTIVATED  did one of the core things BEASTY is for, beyond signing up:
               a CORE event (or the same action in the tables that recorded
               it before this layer existed).

  Three kinds of actor. A MEMBER is a person with a BEASTY account (members):
  these are "users" everywhere on the Home screen. A VISITOR has no account:
  a hash of the device cookie, never an IP. The TEAM is Glenn and whoever
  works the CRM with him; their actions are logged so the CRM itself can be
  measured, and they are never counted as users.

  PRIVACY. No names, emails, phone numbers, addresses, IP addresses or full
  URLs go into an event. Metadata is a few short labels: which kind of
  signal, a UTM campaign, how many items an order had.

  AN EVENT NEVER BREAKS WHAT IT MEASURES. track() swallows its own failures,
  and it always writes through the pool rather than the caller's transaction:
  a failed insert inside a Postgres transaction would abort the order or
  sign-up it was recording.
*/
import { createHash, randomBytes } from 'node:crypto'
import { pool } from './db/schema'

export type ActorType = 'member' | 'visitor' | 'team' | 'system'

interface EventSpec {
  actor: ActorType
  label: string
  /** Counts toward "active": something a person did with BEASTY. */
  meaningful?: boolean
  /** Counts toward "activated": one of the core things BEASTY is for. */
  core?: boolean
  /** A repeat inside this window adds nothing, so only the first is kept. */
  once?: 'day' | 'day-entity'
}

export const EVENTS = {
  /* members: people with a BEASTY account */
  user_signed_up: { actor: 'member', label: 'Signed up' },
  user_signed_in: { actor: 'member', label: 'Signed in', meaningful: true },
  user_signed_out: { actor: 'member', label: 'Signed out' },
  app_opened: { actor: 'member', label: 'Opened BEASTY', once: 'day' },
  business_viewed: { actor: 'member', label: 'Looked at a business', meaningful: true, once: 'day-entity' },
  business_liked: { actor: 'member', label: 'Liked a business', meaningful: true, core: true },
  business_unliked: { actor: 'member', label: 'Took back a like' },
  business_saved: { actor: 'member', label: 'Saved a business', meaningful: true, core: true },
  business_unsaved: { actor: 'member', label: 'Took back a save' },
  business_shared: { actor: 'member', label: 'Shared a business', meaningful: true, core: true },
  order_placed: { actor: 'member', label: 'Placed an order', meaningful: true, core: true },
  pass_opened: { actor: 'member', label: 'Opened their pass', meaningful: true, once: 'day' },
  pass_scanned: { actor: 'member', label: 'Used their pass at a shop', meaningful: true, core: true },
  friend_joined: { actor: 'member', label: 'Brought a friend', meaningful: true, core: true },
  membership_chosen: { actor: 'member', label: 'Chose a paid membership', meaningful: true },
  /* From Stripe: the payment that makes it real, and the one that stops it.
     A retried webhook is the same Stripe event, so one a day per event. */
  membership_activated: { actor: 'member', label: 'Paid for a membership', meaningful: true, once: 'day-entity' },
  membership_lapsed: { actor: 'member', label: 'Membership payments stopped', once: 'day-entity' },
  /* Friends, the MySpace way (server/friends.ts). */
  friend_requested: { actor: 'member', label: 'Sent a friend request', meaningful: true },
  friend_accepted: { actor: 'member', label: 'Accepted a friend request', meaningful: true },
  friend_removed: { actor: 'member', label: 'Removed a friend' },

  /* visitors: no account yet */
  site_visited: { actor: 'visitor', label: 'Visited BEASTY', once: 'day' },
  signup_started: { actor: 'visitor', label: 'Asked for a sign-up code' },
  guest_order_placed: { actor: 'visitor', label: 'Ordered without an account' },
  lead_submitted: { actor: 'visitor', label: 'Asked to reserve a spot' },

  /* the BEASTY team, in the CRM */
  crm_lead_created: { actor: 'team', label: 'Added a lead' },
  crm_lead_updated: { actor: 'team', label: 'Changed a lead' },
  crm_stage_changed: { actor: 'team', label: 'Moved a lead to another step' },
  crm_contact_logged: { actor: 'team', label: 'Logged a call, text, email, DM or note' },
  crm_followup_created: { actor: 'team', label: 'Set a reminder' },
  crm_followup_completed: { actor: 'team', label: 'Finished a reminder' },
  crm_deal_created: { actor: 'team', label: 'Wrote a quote' },
  crm_deal_won: { actor: 'team', label: 'Recorded a sale' },
  crm_leads_imported: { actor: 'team', label: 'Imported leads' },

  /* one row, the moment this layer first ran: nothing before it was tracked */
  tracking_started: { actor: 'system', label: 'Tracking started' },
} as const satisfies Record<string, EventSpec>

export type EventName = keyof typeof EVENTS

const names = (pick: (s: EventSpec) => boolean | undefined) =>
  (Object.keys(EVENTS) as EventName[]).filter((k) => pick(EVENTS[k] as EventSpec))

/** Member events that count toward "active". */
export const MEANINGFUL = names((s) => s.meaningful)
/** Member events that count toward "activated". */
export const CORE = names((s) => s.core)

/**
 * WHEN A MEMBER COUNTS AS ACTIVATED. One place, so changing it changes every
 * number that uses it. `text` is how the screen says it.
 */
export const ACTIVATION = {
  events: CORE,
  text: 'liked, saved or shared a business, ordered, used their pass at a shop, or brought a friend',
}

/** A short, one-way name for a session or device token: enough to group events, useless as a credential. */
export const shortHash = (v: string) => createHash('sha256').update(`beasty-analytics|${v}`).digest('hex').slice(0, 24)

const PT_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' })

/**
 * A sign-up destination that is plainly a test: a reserved address
 * (example.com, .test, .invalid) or a fictional 555-01xx number. The CRM
 * leaves these accounts out of every user number (server/crm/users.ts), so
 * their sign-up requests stay out of the funnel too.
 */
export const isTestDestination = (d: string) =>
  /@(example\.(com|org|net)|[a-z0-9.-]+\.(test|invalid|example))$/i.test(d) || /^\+1\d{3}55501\d{2}$/.test(d)

/** Crawlers and link previews are not visitors. */
export const isBot = (ua: string | undefined) =>
  !ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|node-fetch|axios/i.test(ua)

export interface Track {
  memberId?: string | null
  /** A visitor's hashed device, or a CRM person's id. */
  actor?: string | null
  entityType?: string
  entityId?: string
  sessionId?: string | null
  source?: 'web' | 'server' | 'crm'
  metadata?: Record<string, string | number | boolean | null | undefined>
  at?: number
}

/** Record one event. Never throws, and never joins the caller's transaction. */
export async function track(name: EventName, e: Track = {}): Promise<void> {
  try {
    const spec = EVENTS[name] as EventSpec
    const at = e.at ?? Date.now()
    const who = e.memberId ?? e.actor ?? ''
    const day = PT_DAY.format(new Date(at))
    const dedupe =
      spec.once === 'day' ? `${name}|${who}|${day}` : spec.once === 'day-entity' ? `${name}|${who}|${e.entityId ?? ''}|${day}` : null
    const meta = Object.fromEntries(
      Object.entries(e.metadata ?? {})
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k.slice(0, 40), typeof v === 'string' ? v.slice(0, 120) : v]),
    )
    await pool.query(
      `INSERT INTO analytics_events
         (id, name, actor_type, member_id, actor, entity_type, entity_id, session_id, source, metadata, dedupe_key, occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)
       ON CONFLICT DO NOTHING`,
      [
        `ev_${randomBytes(8).toString('hex')}`,
        name,
        spec.actor,
        e.memberId ?? null,
        e.actor ?? null,
        e.entityType ?? null,
        e.entityId ?? null,
        e.sessionId ?? null,
        e.source ?? 'server',
        JSON.stringify(meta),
        dedupe,
        at,
      ],
    )
  } catch (err) {
    console.warn(`[analytics] ${name} not recorded:`, String((err as Error)?.message ?? err).slice(0, 160))
  }
}

/* ---------------------------------------------------------- attribution */

export interface Attribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  /** The site that sent them, as a host name only. */
  referrer?: string
  /** The path they landed on, without its query string. */
  landing?: string
  /** When the visit was first seen, by the browser's clock. */
  at?: number
}

const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.normalize('NFKC').replace(/[^\p{L}\p{N} ._\-+:/@]/gu, '').trim().slice(0, max) : ''

/**
 * What a browser says brought it here, reduced to what is safe to keep: the
 * five UTM fields, the referring HOST (never its path, which can carry
 * somebody's search), and the landing path without its query string. Our own
 * host is not a referrer. Anything else in the object is dropped.
 */
export function cleanAttribution(v: unknown, ownHosts: string[] = []): Attribution | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null
  const o = v as Record<string, unknown>
  const out: Attribution = {}
  for (const k of UTM) {
    const s = clean(o[k], 100)
    if (s) out[k] = s
  }
  // Cut at the query and fragment BEFORE anything else: they are where searches and ids live.
  const beforeQuery = (v: unknown) => (typeof v === 'string' ? v.split(/[?#]/)[0] : '')
  const ref = clean(beforeQuery(o.referrer), 200).toLowerCase()
  const host = ref.replace(/^[a-z]+:\/\//, '').split(/[/:]/)[0].replace(/^www\./, '')
  if (host && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) && !ownHosts.some((h) => host === h || host.endsWith(`.${h}`))) out.referrer = host
  const landing = clean(beforeQuery(o.landing), 120)
  if (landing.startsWith('/')) out.landing = landing
  const at = Number(o.at)
  if (Number.isFinite(at) && at > 1.6e12 && at < 4e12) out.at = Math.round(at)
  return Object.keys(out).length ? out : { landing: '/' }
}
