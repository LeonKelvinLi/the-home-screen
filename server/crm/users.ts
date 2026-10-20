/*
  USERS: THE PEOPLE WITH A BEASTY ACCOUNT, as the CRM's Home counts them.

  A user is a row in members: somebody who signed up on beastypages.com. Not
  a lead (a business the team is selling a website to) and not the team.
  Accounts an admin marked as ours, and accounts with a reserved address or a
  fictional 555-01xx number, are left out of every number here and counted
  separately so the screen can say how many were left out.

  What each number rests on (definitions shown on the screen too):
    New sign-ups   accounts created in the period, Pacific time.
    Active         did something MEANINGFUL (server/analytics.ts) in the
                   period. Only events recorded since tracking began count, so
                   for any stretch before that the answer is "not tracked",
                   never zero.
    Returning      active in the period, signed up before it began.
    Activated      did a CORE thing at any time since signing up. Core actions
                   were stored before this layer existed too (likes, saves and
                   shares, orders, pass scans, friends who joined), so this one
                   reaches back to the first member.

  Everything is counted in SQL. Only the sign-up list returns rows, one page at
  a time, and only to an admin: it is the one place names and contacts appear.
*/
import { db } from '../db/schema'
import { ACTIVATION, EVENTS, MEANINGFUL } from '../analytics'
import { CrmError } from './core'

const PT = 'America/Los_Angeles'
const DAY = 864e5
const num = (v: unknown) => Number(v ?? 0)
const list = (xs: readonly string[]) => xs.map((x) => `'${x}'`).join(',')

export type Unit = 'day' | 'week' | 'month'

export interface Range {
  period: string
  /** Inclusive start and exclusive end, in ms. */
  since: number
  until: number
  /** The stretch just before, of the same length, to compare with. */
  prev: [number, number] | null
  unit: Unit
}

/** Accounts that are people, not us and not a test. `m` is members. */
export const REAL_USER = `NOT EXISTS (SELECT 1 FROM crm_member_flags f WHERE f.member_id = m.id AND f.internal)
  AND COALESCE(m.email, '') !~* '@(example\\.(com|org|net)|[a-z0-9.-]+\\.(test|invalid|example))$'
  AND COALESCE(m.phone, '') !~ '^\\+1[0-9]{3}55501[0-9]{2}$'`

/** Did a core thing: as an event, or in the table that kept it before events existed. `m` is members. */
const ACTIVATED = `(EXISTS (SELECT 1 FROM analytics_events e WHERE e.member_id = m.id AND e.name IN (${list(ACTIVATION.events)}))
  OR EXISTS (SELECT 1 FROM brand_signals s WHERE s.member_id = m.id)
  OR EXISTS (SELECT 1 FROM orders o WHERE o.member_id = m.id)
  OR EXISTS (SELECT 1 FROM pass_scans p WHERE p.member_id = m.id)
  OR EXISTS (SELECT 1 FROM members f WHERE f.referred_by = m.id))`

/**
 * Where a member came from, as one word. A friend's code and a business's
 * register code are recorded facts; the rest is read from the visit that led
 * to the sign-up. Members from before that was kept are "unknown", never a
 * guess.
 */
const SOURCE = `(CASE
  WHEN m.referred_by IS NOT NULL THEN 'friend'
  WHEN m.joined_via IS NOT NULL THEN 'register'
  WHEN m.signup_attribution IS NULL THEN 'unknown'
  WHEN lower(COALESCE(m.signup_attribution->>'utm_medium', '')) IN ('cpc','ppc','paid','paid_social','paidsocial','ads','ad','display') THEN 'paid'
  WHEN lower(COALESCE(m.signup_attribution->>'utm_medium', '')) IN ('email','newsletter','sms','text') THEN 'email'
  WHEN lower(COALESCE(m.signup_attribution->>'utm_medium', '')) IN ('social','social-media','organic_social')
    OR lower(COALESCE(m.signup_attribution->>'utm_source', '') || ' ' || COALESCE(m.signup_attribution->>'referrer', ''))
       ~ '(instagram|facebook|^fb|tiktok|twitter|x\\.com|t\\.co|youtube|snapchat|linkedin|reddit|threads|pinterest)' THEN 'social'
  WHEN COALESCE(m.signup_attribution->>'referrer', '') ~ '(google\\.|bing\\.|duckduckgo\\.|yahoo\\.|ecosia\\.|baidu\\.|yandex\\.|brave\\.)' THEN 'search'
  WHEN COALESCE(m.signup_attribution->>'utm_source', '') <> '' THEN 'campaign'
  WHEN COALESCE(m.signup_attribution->>'referrer', '') <> '' THEN 'website'
  ELSE 'direct' END)`

export const SOURCES: Record<string, string> = {
  friend: 'A friend’s invite',
  register: 'A register code at a business',
  social: 'Social media',
  search: 'Search',
  paid: 'Paid ads',
  email: 'Email or text',
  campaign: 'Another campaign link',
  website: 'Another website',
  direct: 'Came straight to BEASTY',
  unknown: 'Unknown',
}

/** Days, weeks (Monday first) or months, in Pacific time, as SQL. */
export const bucketSql = (col: string, unit: Unit) =>
  unit === 'day'
    ? `to_char(to_timestamp(${col} / 1000.0) AT TIME ZONE '${PT}', 'YYYY-MM-DD')`
    : `to_char(date_trunc('${unit}', to_timestamp(${col} / 1000.0) AT TIME ZONE '${PT}'), 'YYYY-MM-DD')`

/** When tracking began, from the one row the migration writes. */
export async function trackingStart(): Promise<number> {
  const r = await db.prepare(`SELECT occurred_at FROM analytics_events WHERE id = 'ev_tracking_started'`).get<{ occurred_at: number }>()
  return num(r?.occurred_at) || Date.now()
}

/* ------------------------------------------------------------- overview */

export async function usersOverview(r: Range) {
  const tracked = await trackingStart()
  const [b0, b1] = r.prev ?? [0, 0]
  const c = await db
    .prepare(
      `SELECT COUNT(*) FILTER (WHERE ${REAL_USER}) AS total,
              COUNT(*) FILTER (WHERE NOT (${REAL_USER})) AS left_out,
              COUNT(*) FILTER (WHERE ${REAL_USER} AND m.created_at >= ? AND m.created_at < ?) AS added,
              COUNT(*) FILTER (WHERE ${REAL_USER} AND m.created_at >= ? AND m.created_at < ?) AS added_before,
              COUNT(*) FILTER (WHERE ${REAL_USER} AND m.created_at < ?) AS at_start,
              COUNT(*) FILTER (WHERE ${REAL_USER} AND m.created_at < ?) AS at_end,
              MIN(m.created_at) FILTER (WHERE ${REAL_USER}) AS first,
              MAX(m.created_at) FILTER (WHERE ${REAL_USER}) AS latest
       FROM members m`,
    )
    .get<Record<string, number | null>>(r.since, r.until, b0, b1, r.since, r.until)

  const perBucket = async (from: number, to: number) =>
    (
      await db
        .prepare(`SELECT ${bucketSql('m.created_at', r.unit)} AS b, COUNT(*) AS n FROM members m WHERE ${REAL_USER} AND m.created_at >= ? AND m.created_at < ? GROUP BY b ORDER BY b`)
        .all<{ b: string; n: number }>(from, to)
    ).map((x) => ({ bucket: x.b, count: num(x.n) }))

  /* Active and returning: tracked events only, and only for the part of the
     period tracking covered. A stretch before tracking began is null. */
  const activeIn = async (from: number, to: number, signedUpBefore: number) => {
    const lo = Math.max(from, tracked)
    if (lo >= to) return null
    const a = await db
      .prepare(
        `SELECT COUNT(DISTINCT e.member_id) AS active,
                COUNT(DISTINCT e.member_id) FILTER (WHERE m.created_at < ?) AS returning
         FROM analytics_events e JOIN members m ON m.id = e.member_id
         WHERE e.name IN (${list(MEANINGFUL)}) AND e.occurred_at >= ? AND e.occurred_at < ? AND ${REAL_USER}`,
      )
      .get<{ active: number; returning: number }>(signedUpBefore, lo, to)
    return { active: num(a?.active), returning: num(a?.returning), since: lo, whole: lo === from }
  }
  const now = await activeIn(r.since, r.until, r.since)
  const before = r.prev && r.prev[0] >= tracked ? await activeIn(r.prev[0], r.prev[1], r.prev[0]) : null

  const act = await db
    .prepare(`SELECT COUNT(*) AS signed_up, COUNT(*) FILTER (WHERE ${ACTIVATED}) AS activated FROM members m WHERE ${REAL_USER} AND m.created_at >= ? AND m.created_at < ?`)
    .get<{ signed_up: number; activated: number }>(r.since, r.until)

  const sources = await db
    .prepare(`SELECT ${SOURCE} AS k, COUNT(*) AS n FROM members m WHERE ${REAL_USER} AND m.created_at >= ? AND m.created_at < ? GROUP BY k ORDER BY n DESC`)
    .all<{ k: string; n: number }>(r.since, r.until)

  /* WHERE THEY LIVE, all members (not just the period's sign-ups): Glenn,
     2026-10-19, asking for City and State at sign-up, "It is also good to
     add to our analytics." Members from before then have none until they
     add it on Profile or sign in again. */
  const homes = await db
    .prepare(
      `SELECT CASE WHEN m.city IS NULL OR m.city = '' THEN '' ELSE m.city || COALESCE(', ' || m.state, '') END AS k, COUNT(*) AS n
       FROM members m WHERE ${REAL_USER} GROUP BY k ORDER BY n DESC LIMIT 15`,
    )
    .all<{ k: string; n: number }>()

  /* The sign-up funnel, over the part of the period tracking covered, so
     every step counts the same days. */
  const lo = Math.max(r.since, tracked)
  const funnel =
    lo < r.until
      ? await db
          .prepare(
            `SELECT
               (SELECT COUNT(DISTINCT actor) FROM analytics_events WHERE name = 'site_visited' AND occurred_at >= ? AND occurred_at < ?) AS visitors,
               (SELECT COUNT(DISTINCT actor) FROM analytics_events WHERE name = 'signup_started' AND occurred_at >= ? AND occurred_at < ?) AS started,
               COUNT(*) AS accounts,
               COUNT(*) FILTER (WHERE ${ACTIVATED}) AS activated,
               COUNT(*) FILTER (WHERE EXISTS (
                 SELECT 1 FROM analytics_events e WHERE e.member_id = m.id AND e.name IN (${list(MEANINGFUL)})
                   AND e.occurred_at >= m.created_at + ${DAY} AND e.occurred_at < m.created_at + ${7 * DAY})) AS returned
             FROM members m WHERE ${REAL_USER} AND m.created_at >= ? AND m.created_at < ?`,
          )
          .get<Record<string, number>>(lo, r.until, lo, r.until, lo, r.until)
      : null

  const engagement =
    lo < r.until
      ? (
          await db
            .prepare(
              `SELECT e.name, COUNT(*) AS times, COUNT(DISTINCT e.member_id) AS people
               FROM analytics_events e JOIN members m ON m.id = e.member_id
               WHERE e.name IN (${list([...MEANINGFUL, 'app_opened'])}) AND e.occurred_at >= ? AND e.occurred_at < ? AND ${REAL_USER}
               GROUP BY e.name ORDER BY people DESC, times DESC`,
            )
            .all<{ name: keyof typeof EVENTS; times: number; people: number }>(lo, r.until)
        ).map((x) => ({ name: x.name, label: EVENTS[x.name]?.label ?? x.name, times: num(x.times), people: num(x.people) }))
      : null

  return {
    trackingSince: tracked,
    activation: ACTIVATION.text,
    total: num(c?.total),
    leftOut: num(c?.left_out),
    first: c?.first ? num(c.first) : null,
    latest: c?.latest ? num(c.latest) : null,
    added: num(c?.added),
    addedBefore: r.prev ? num(c?.added_before) : null,
    growth: { atStart: num(c?.at_start), added: num(c?.added), atEnd: num(c?.at_end) },
    series: await perBucket(r.since, r.until),
    prevSeries: r.prev ? await perBucket(r.prev[0], r.prev[1]) : [],
    active: now ? { n: now.active, returning: now.returning, fresh: now.active - now.returning, since: now.since, whole: now.whole } : null,
    activeBefore: before?.whole ? { n: before.active, returning: before.returning } : null,
    activated: { signedUp: num(act?.signed_up), n: num(act?.activated) },
    sources: sources.map((x) => ({ key: x.k, label: SOURCES[x.k] ?? x.k, count: num(x.n) })),
    homes: homes.map((x) => ({ key: x.k || 'unknown', label: x.k || 'Not given yet', count: num(x.n) })),
    funnel: funnel
      ? {
          since: lo,
          steps: [
            { key: 'visitors', label: 'Visited BEASTY', count: num(funnel.visitors) },
            { key: 'started', label: 'Asked for a sign-up code', count: num(funnel.started) },
            { key: 'accounts', label: 'Created an account', count: num(funnel.accounts) },
            { key: 'activated', label: 'Did a core thing', count: num(funnel.activated) },
            { key: 'returned', label: 'Came back within a week', count: num(funnel.returned) },
          ],
        }
      : null,
    engagement: engagement ? { since: lo, rows: engagement } : null,
  }
}

/* -------------------------------------------------------------- cohorts */

/**
 * Sign-up cohorts, newest first: who joined in each week (Monday first) or
 * month, how many are activated, and how many did something meaningful in
 * each later week or month of their own time on BEASTY (week 1 is days 7 to
 * 13 after each person's sign-up). Week 0 is the sign-up itself.
 *
 * A cell is only a number when it is over for everyone in the cohort and
 * tracking was on for all of it; otherwise it says which of the two it is
 * waiting for. Nothing is filled in.
 */
export async function cohorts(unit: 'week' | 'month', t = Date.now()) {
  const tracked = await trackingStart()
  const len = unit === 'week' ? 7 * DAY : 30 * DAY
  const cols = unit === 'week' ? 6 : 4
  const key = bucketSql('m.created_at', unit)
  const rows = await db
    .prepare(
      `SELECT ${key} AS c, COUNT(*) AS size, MIN(m.created_at) AS first, MAX(m.created_at) AS last,
              COUNT(*) FILTER (WHERE ${ACTIVATED}) AS activated
       FROM members m WHERE ${REAL_USER} GROUP BY c ORDER BY c DESC LIMIT 12`,
    )
    .all<{ c: string; size: number; first: number; last: number; activated: number }>()
  const hits = await db
    .prepare(
      `SELECT ${key} AS c, FLOOR((e.occurred_at - m.created_at) / ${len}.0)::int AS k, COUNT(DISTINCT m.id) AS n
       FROM analytics_events e JOIN members m ON m.id = e.member_id
       WHERE e.name IN (${list(MEANINGFUL)}) AND e.occurred_at >= m.created_at + ${len} AND e.occurred_at < m.created_at + ${len * (cols + 1)}
         AND ${REAL_USER}
       GROUP BY c, k`,
    )
    .all<{ c: string; k: number; n: number }>()
  const hit = new Map(hits.map((h) => [`${h.c}|${h.k}`, num(h.n)]))
  return {
    unit,
    trackingSince: tracked,
    columns: Array.from({ length: cols + 1 }, (_, k) => k),
    rows: rows.map((r) => {
      const size = num(r.size)
      return {
        key: r.c,
        size,
        activated: num(r.activated),
        cells: Array.from({ length: cols + 1 }, (_, k) => {
          if (k === 0) return { k, state: 'ok' as const, n: size, share: 1 }
          if (num(r.last) + (k + 1) * len > t) return { k, state: 'waiting' as const, n: null, share: null }
          if (num(r.first) + k * len < tracked) return { k, state: 'untracked' as const, n: null, share: null }
          const n = hit.get(`${r.c}|${k}`) ?? 0
          return { k, state: 'ok' as const, n, share: size ? n / size : 0 }
        }),
      }
    }),
  }
}

/* ------------------------------------------------------ the sign-up list */

export interface UserFilters {
  q?: string
  source?: string
  from?: number
  to?: number
  cohort?: string
  unit?: 'week' | 'month'
  sort?: string
  dir?: string
  limit: number
  offset: number
}

const ORDER: Record<string, string> = {
  signup: 'm.created_at',
  name: 'lower(m.name)',
  active: 'last_active',
  source: 'source',
}

/** One page of accounts, newest first by default, with what each has done. Admins only (the route checks). */
export async function userList(f: UserFilters) {
  const tracked = await trackingStart()
  const w: string[] = [REAL_USER]
  const a: unknown[] = []
  if (f.q) {
    const like = `%${f.q.toLowerCase().replace(/[\\%_]/g, (x) => `\\${x}`)}%`
    const digits = f.q.replace(/\D/g, '')
    w.push(`(lower(m.name) LIKE ? OR lower(COALESCE(m.email, '')) LIKE ? ${digits.length >= 4 ? 'OR COALESCE(m.phone, \'\') LIKE ?' : ''})`)
    a.push(like, like)
    if (digits.length >= 4) a.push(`%${digits}%`)
  }
  if (f.source) {
    if (!SOURCES[f.source]) throw new CrmError(400, 'Unknown source.')
    w.push(`${SOURCE} = ?`)
    a.push(f.source)
  }
  if (f.from) {
    w.push('m.created_at >= ?')
    a.push(f.from)
  }
  if (f.to) {
    w.push('m.created_at < ?')
    a.push(f.to)
  }
  if (f.cohort) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.cohort)) throw new CrmError(400, 'A cohort is a date like 2026-09-21.')
    w.push(`${bucketSql('m.created_at', f.unit === 'month' ? 'month' : 'week')} = ?`)
    a.push(f.cohort)
  }
  const where = `WHERE ${w.join(' AND ')}`
  const col = ORDER[f.sort ?? 'signup'] ?? ORDER.signup
  const dir = f.dir === 'asc' ? 'ASC' : 'DESC'
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM members m ${where}`).get<{ n: number }>(...a)
  const rows = await db
    .prepare(
      `SELECT m.id, m.name, m.email, m.phone, m.created_at, m.tier, m.tier_status, ${SOURCE} AS source,
              r.name AS referrer_name, m.joined_via,
              ${ACTIVATED} AS activated,
              GREATEST(ev.last_at, sg.last_at, od.last_at, ps.last_at) AS last_active,
              COALESCE(ev.n, 0) + COALESCE(sg.n, 0) + COALESCE(od.n, 0) + COALESCE(ps.n, 0) AS actions,
              ev.first_name, ev.first_at, sg.first_at AS signal_first, od.first_at AS order_first, ps.first_at AS scan_first
       FROM members m
       LEFT JOIN members r ON r.id = m.referred_by
       LEFT JOIN LATERAL (
         SELECT MAX(occurred_at) AS last_at, COUNT(*) AS n, MIN(occurred_at) AS first_at,
                (ARRAY_AGG(name ORDER BY occurred_at))[1] AS first_name
         FROM analytics_events WHERE member_id = m.id AND name IN (${list(MEANINGFUL)})
       ) ev ON TRUE
       LEFT JOIN LATERAL (SELECT MAX(created_at) AS last_at, MIN(created_at) AS first_at, COUNT(*) FILTER (WHERE created_at < ${tracked}) AS n FROM brand_signals WHERE member_id = m.id) sg ON TRUE
       LEFT JOIN LATERAL (SELECT MAX(created_at) AS last_at, MIN(created_at) AS first_at, COUNT(*) FILTER (WHERE created_at < ${tracked}) AS n FROM orders WHERE member_id = m.id) od ON TRUE
       LEFT JOIN LATERAL (SELECT MAX(created_at) AS last_at, MIN(created_at) AS first_at, COUNT(*) FILTER (WHERE created_at < ${tracked}) AS n FROM pass_scans WHERE member_id = m.id) ps ON TRUE
       ${where}
       ORDER BY ${col} ${dir} NULLS LAST, m.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all<Record<string, unknown>>(...a, Math.min(Math.max(f.limit, 1), 100), Math.max(f.offset, 0))
  return {
    total: num(total?.n),
    trackingSince: tracked,
    users: rows.map((x) => {
      const firsts = [
        [x.first_at, EVENTS[x.first_name as keyof typeof EVENTS]?.label],
        [x.signal_first, 'Liked, saved or shared a business'],
        [x.order_first, 'Placed an order'],
        [x.scan_first, 'Used their pass at a shop'],
      ]
        .filter(([at]) => at)
        .sort((p, q) => num(p[0]) - num(q[0]))
      return {
        id: String(x.id),
        name: String(x.name),
        email: (x.email as string | null) ?? null,
        phone: (x.phone as string | null) ?? null,
        signedUpAt: num(x.created_at),
        tier: String(x.tier),
        tierStatus: String(x.tier_status),
        source: String(x.source),
        sourceLabel: SOURCES[String(x.source)] ?? String(x.source),
        referrerName: (x.referrer_name as string | null) ?? null,
        joinedVia: (x.joined_via as string | null) ?? null,
        activated: !!x.activated,
        lastActiveAt: x.last_active ? num(x.last_active) : null,
        actions: num(x.actions),
        firstAction: firsts.length ? { at: num(firsts[0][0]), label: String(firsts[0][1] ?? 'Did something') } : null,
      }
    }),
  }
}

/** Accounts an admin has marked as ours, for the list's "left out" view. */
export async function leftOut() {
  const rows = await db
    .prepare(
      `SELECT m.id, m.name, m.created_at, EXISTS (SELECT 1 FROM crm_member_flags f WHERE f.member_id = m.id AND f.internal) AS marked
       FROM members m WHERE NOT (${REAL_USER}) ORDER BY m.created_at DESC LIMIT 100`,
    )
    .all<{ id: string; name: string; created_at: number; marked: boolean }>()
  return rows.map((r) => ({ id: r.id, name: r.name, signedUpAt: num(r.created_at), marked: !!r.marked }))
}

/** Mark an account as ours (left out of the numbers), or put it back. */
export async function markTest(memberId: string, test: boolean, actor: string) {
  const m = await db.prepare('SELECT id FROM members WHERE id = ?').get(memberId)
  if (!m) throw new CrmError(404, 'No such account.')
  if (test) {
    await db
      .prepare(
        `INSERT INTO crm_member_flags (member_id, internal, set_by, updated_at) VALUES (?, TRUE, ?, ?)
         ON CONFLICT (member_id) DO UPDATE SET internal = TRUE, set_by = excluded.set_by, updated_at = excluded.updated_at`,
      )
      .run(memberId, actor, Date.now())
  } else {
    await db.prepare('DELETE FROM crm_member_flags WHERE member_id = ?').run(memberId)
  }
  return { id: memberId, test }
}
