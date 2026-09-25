/*
  FRIENDS, THE MYSPACE WAY. Glenn, 2026-09-24: "top 3 friends", "exactly like
  myspace concept". Members send requests; once accepted they are friends, and
  each member picks and orders a Top 3 from their friends. The design is
  docs/superpowers/specs/2026-09-25-top-friends-design.md.

  A DECLINE IS SILENT. The asker keeps seeing "Request sent" and cannot ask
  again for 30 days, which is how the big networks do it: a decline that
  announces itself is a small public rejection, and the point of this is to
  be friendly. After 30 days the asker may ask again.

  Signed-in members only, like Contacts. Photos never come here: a member's
  picture for other members is the pet they built, or the one Contacts draws
  from their id.
*/
import type { Express, Request, RequestHandler } from 'express'
import { db } from './db/schema'
import { track } from './analytics'
import { SPECIES, COATS, BACKDROPS, ACCESSORIES } from '../src/data/pets'

export const DECLINE_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000
export const REQUESTS_PER_DAY = 30
export const TOP_SIZE = 3

export type Relation = 'none' | 'sent' | 'received' | 'friends' | 'me'

export interface Pet {
  species: string
  coat: string
  backdrop: string
  accessory: string
}

interface Member {
  id: string
  name: string
}

interface Row {
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined'
  requester_hidden: boolean
  created_at: number | string
  responded_at: number | string | null
}

const PAIR = `((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))`
const pairArgs = (a: string, b: string) => [a, b, b, a]

async function pairRow(a: string, b: string, lock = false): Promise<Row | undefined> {
  return db
    .prepare(`SELECT * FROM member_friendships WHERE ${PAIR}${lock ? ' FOR UPDATE' : ''}`)
    .get<Row>(...pairArgs(a, b))
}

/** Where `me` stands with `other`, as the button on other's page shows it. */
export function relationFrom(me: string, other: string, row: Row | undefined, now = Date.now()): Relation {
  if (me === other) return 'me'
  if (!row) return 'none'
  if (row.status === 'accepted') return 'friends'
  if (row.status === 'pending') return row.requester_id === me ? 'sent' : 'received'
  /* declined: the asker sees their request as still sent, until they withdraw
     it or 30 days pass; the one who declined sees nothing between them. */
  if (row.requester_id === me) {
    const fresh = now - Number(row.responded_at ?? row.created_at) < DECLINE_COOLDOWN_MS
    return fresh && !row.requester_hidden ? 'sent' : 'none'
  }
  return 'none'
}

export async function relationOf(me: string, other: string): Promise<Relation> {
  if (me === other) return 'me'
  return relationFrom(me, other, await pairRow(me, other))
}

/** A pet as it may be kept: every part one the drawing knows, or nothing. */
export function cleanPet(v: unknown): Pet | null {
  if (!v || typeof v !== 'object') return null
  const p = v as Record<string, unknown>
  const species = SPECIES.find((s) => s.key === p.species)?.key
  const coat = COATS.find((c) => c.toLowerCase() === String(p.coat ?? '').toLowerCase())
  const backdrop = BACKDROPS.find((c) => c.toLowerCase() === String(p.backdrop ?? '').toLowerCase())
  const accessory = ACCESSORIES.find((a) => a.key === (p.accessory ?? ''))?.key
  if (!species || !coat || !backdrop || accessory === undefined) return null
  return { species, coat, backdrop, accessory }
}

/** The pets these members built, by id. A member with none is left out. */
export async function petsFor(ids: string[]): Promise<Map<string, Pet>> {
  const out = new Map<string, Pet>()
  if (!ids.length) return out
  const rows = await db
    .prepare('SELECT member_id, species, coat, backdrop, accessory FROM member_avatars WHERE member_id = ANY(?)')
    .all<Pet & { member_id: string }>(ids)
  for (const r of rows) out.set(r.member_id, { species: r.species, coat: r.coat, backdrop: r.backdrop, accessory: r.accessory })
  return out
}

export async function friendCount(id: string): Promise<number> {
  const r = await db
    .prepare(`SELECT COUNT(*)::int AS n FROM member_friendships WHERE status = 'accepted' AND (requester_id = ? OR addressee_id = ?)`)
    .get<{ n: number }>(id, id)
  return r?.n ?? 0
}

export async function waitingCount(id: string): Promise<number> {
  const r = await db
    .prepare(`SELECT COUNT(*)::int AS n FROM member_friendships WHERE status = 'pending' AND addressee_id = ?`)
    .get<{ n: number }>(id)
  return r?.n ?? 0
}

export interface Person {
  id: string
  name: string
  pet: Pet | null
}

/** A member's Top 3, in order, as other members see it. */
export async function topOf(id: string, shortName: (n: string) => string): Promise<(Person & { position: number })[]> {
  const rows = await db
    .prepare(
      `SELECT t.position, m.id, m.name FROM member_top_friends t JOIN members m ON m.id = t.friend_id
       WHERE t.member_id = ? ORDER BY t.position`,
    )
    .all<{ position: number; id: string; name: string }>(id)
  const pets = await petsFor(rows.map((r) => r.id))
  return rows.map((r) => ({ position: Number(r.position), id: r.id, name: shortName(r.name), pet: pets.get(r.id) ?? null }))
}

/** What a member's page adds for friends: their pet, count, Top 3, and where the viewer stands. */
export async function profileExtras(viewer: string, id: string, shortName: (n: string) => string) {
  const [pets, count, top3, relation] = await Promise.all([petsFor([id]), friendCount(id), topOf(id, shortName), relationOf(viewer, id)])
  return { pet: pets.get(id) ?? null, friendCount: count, top3, relation }
}

class Refused extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

/** Ask to be friends. Asking someone who already asked you accepts them. */
export async function sendRequest(me: string, to: string, now = Date.now()): Promise<Relation> {
  if (me === to) throw new Refused(400, 'That is you.')
  const exists = await db.prepare('SELECT 1 AS x FROM members WHERE id = ?').get(to)
  if (!exists) throw new Refused(404, 'No such member.')
  const outcome = await db.transaction(async () => {
    const row = await pairRow(me, to, true)
    if (!row) {
      const sent = await db
        .prepare(`SELECT COUNT(*)::int AS n FROM member_friendships WHERE requester_id = ? AND created_at > ?`)
        .get<{ n: number }>(me, now - 24 * 60 * 60 * 1000)
      if ((sent?.n ?? 0) >= REQUESTS_PER_DAY) throw new Refused(429, 'That is a lot of requests for one day. Try again tomorrow.')
      await db
        .prepare(`INSERT INTO member_friendships (requester_id, addressee_id, status, created_at) VALUES (?, ?, 'pending', ?)`)
        .run(me, to, now)
      return { relation: 'sent' as Relation, event: 'friend_requested' as const }
    }
    if (row.status === 'accepted') return { relation: 'friends' as Relation }
    if (row.status === 'pending') {
      if (row.requester_id === me) return { relation: 'sent' as Relation }
      await db
        .prepare(`UPDATE member_friendships SET status = 'accepted', responded_at = ? WHERE ${PAIR}`)
        .run(now, ...pairArgs(me, to))
      return { relation: 'friends' as Relation, event: 'friend_accepted' as const }
    }
    /* declined */
    if (row.requester_id === me && now - Number(row.responded_at ?? row.created_at) < DECLINE_COOLDOWN_MS) {
      /* Still inside the 30 days: it reads as sent again, and nothing reaches them. */
      await db.prepare(`UPDATE member_friendships SET requester_hidden = FALSE WHERE ${PAIR}`).run(...pairArgs(me, to))
      return { relation: 'sent' as Relation }
    }
    /* The 30 days are over, or the one who declined is now asking: a fresh request. */
    await db
      .prepare(
        `UPDATE member_friendships SET requester_id = ?, addressee_id = ?, status = 'pending', requester_hidden = FALSE,
           created_at = ?, responded_at = NULL WHERE ${PAIR}`,
      )
      .run(me, to, now, ...pairArgs(me, to))
    return { relation: 'sent' as Relation, event: 'friend_requested' as const }
  })()
  if (outcome.event) await track(outcome.event, { memberId: me, entityType: 'member', entityId: to })
  return outcome.relation
}

/** Take back a request you sent. */
export async function cancelRequest(me: string, to: string): Promise<Relation> {
  const row = await pairRow(me, to)
  if (!row || row.requester_id !== me) return relationFrom(me, to, row)
  if (row.status === 'pending') {
    await db.prepare(`DELETE FROM member_friendships WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'`).run(me, to)
    return 'none'
  }
  if (row.status === 'declined') {
    /* Already declined, silently: withdrawing it hides it, and the 30 days stand. */
    await db.prepare(`UPDATE member_friendships SET requester_hidden = TRUE WHERE requester_id = ? AND addressee_id = ?`).run(me, to)
    return 'none'
  }
  return relationFrom(me, to, row)
}

/** Answer a request someone sent you. */
export async function answerRequest(me: string, from: string, accept: boolean, now = Date.now()): Promise<Relation> {
  const r = await db
    .prepare(
      `UPDATE member_friendships SET status = ?, responded_at = ?, requester_hidden = FALSE
       WHERE requester_id = ? AND addressee_id = ? AND status = 'pending'`,
    )
    .run(accept ? 'accepted' : 'declined', now, from, me)
  if (!r.changes) throw new Refused(404, 'That request is not waiting any more.')
  if (accept) await track('friend_accepted', { memberId: me, entityType: 'member', entityId: from })
  return accept ? 'friends' : 'none'
}

/** No longer friends: gone from both lists and both Top 3s at once. */
export async function removeFriend(me: string, other: string): Promise<void> {
  const removed = await db.transaction(async () => {
    const r = await db.prepare(`DELETE FROM member_friendships WHERE status = 'accepted' AND ${PAIR}`).run(...pairArgs(me, other))
    await db
      .prepare(`DELETE FROM member_top_friends WHERE (member_id = ? AND friend_id = ?) OR (member_id = ? AND friend_id = ?)`)
      .run(me, other, other, me)
    return r.changes
  })()
  if (removed) await track('friend_removed', { memberId: me, entityType: 'member', entityId: other })
}

/** Set my Top 3, in order: accepted friends only, no repeats, at most three. */
export async function setTop(me: string, ids: unknown): Promise<string[]> {
  if (!Array.isArray(ids) || ids.length > TOP_SIZE || !ids.every((x) => typeof x === 'string'))
    throw new Refused(400, `Pick up to ${TOP_SIZE} friends.`)
  const list = ids as string[]
  if (new Set(list).size !== list.length) throw new Refused(400, 'Each friend can only be in your Top 3 once.')
  await db.transaction(async () => {
    for (const id of list) {
      const row = await pairRow(me, id)
      if (!row || row.status !== 'accepted') throw new Refused(400, 'Only your friends can be in your Top 3.')
    }
    await db.prepare('DELETE FROM member_top_friends WHERE member_id = ?').run(me)
    for (let i = 0; i < list.length; i++) {
      await db.prepare('INSERT INTO member_top_friends (member_id, position, friend_id) VALUES (?, ?, ?)').run(me, i + 1, list[i])
    }
  })()
  return list
}

/** My friends, the requests waiting for me, and my Top 3. */
export async function myFriends(me: string, shortName: (n: string) => string) {
  const friends = await db
    .prepare(
      `SELECT m.id, m.name, f.responded_at AS since FROM member_friendships f
       JOIN members m ON m.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
       WHERE f.status = 'accepted' AND (f.requester_id = ? OR f.addressee_id = ?)
       ORDER BY LOWER(m.name)`,
    )
    .all<{ id: string; name: string; since: number | string | null }>(me, me, me)
  const waiting = await db
    .prepare(
      `SELECT m.id, m.name, f.created_at AS at FROM member_friendships f JOIN members m ON m.id = f.requester_id
       WHERE f.addressee_id = ? AND f.status = 'pending' ORDER BY f.created_at DESC`,
    )
    .all<{ id: string; name: string; at: number | string }>(me)
  const pets = await petsFor([...friends.map((f) => f.id), ...waiting.map((w) => w.id)])
  const top = await db
    .prepare('SELECT friend_id FROM member_top_friends WHERE member_id = ? ORDER BY position')
    .all<{ friend_id: string }>(me)
  return {
    friends: friends.map((f) => ({ id: f.id, name: shortName(f.name), pet: pets.get(f.id) ?? null, since: Number(f.since ?? 0) })),
    requests: waiting.map((w) => ({ id: w.id, name: shortName(w.name), pet: pets.get(w.id) ?? null, at: Number(w.at) })),
    top: top.map((t) => t.friend_id),
  }
}

/** Save the pet a member built, or clear it (a photo, or nothing). */
export async function savePet(me: string, kind: unknown, pet: unknown, now = Date.now()): Promise<Pet | null> {
  if (kind !== 'pet') {
    await db.prepare('DELETE FROM member_avatars WHERE member_id = ?').run(me)
    return null
  }
  const clean = cleanPet(pet)
  if (!clean) throw new Refused(400, 'That pet cannot be drawn.')
  await db
    .prepare(
      `INSERT INTO member_avatars (member_id, species, coat, backdrop, accessory, updated_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (member_id) DO UPDATE SET species = EXCLUDED.species, coat = EXCLUDED.coat,
         backdrop = EXCLUDED.backdrop, accessory = EXCLUDED.accessory, updated_at = EXCLUDED.updated_at`,
    )
    .run(me, clean.species, clean.coat, clean.backdrop, clean.accessory, now)
  return clean
}

interface Deps {
  memberFromRequest(req: Request): Promise<Member | null>
  rateLimiter(perMinute: number, burst: number): RequestHandler
  shortName(full: string): string
}

/** The routes, mounted before the /api 404. */
export function mountFriends(app: Express, { memberFromRequest, rateLimiter, shortName }: Deps) {
  const who = async (req: Request) => memberFromRequest(req)
  const id = (v: unknown) => (typeof v === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(v) ? v : null)
  const handle =
    (fn: (me: Member, req: Request) => Promise<unknown>): RequestHandler =>
    async (req, res) => {
      const me = await who(req)
      if (!me) return void res.status(401).json({ error: 'Not signed in.' })
      try {
        res.json(await fn(me, req))
      } catch (e) {
        if (e instanceof Refused) return void res.status(e.status).json({ error: e.message })
        console.error('friends:', String(e).slice(0, 200))
        res.status(500).json({ error: 'That did not go through. Try again.' })
      }
    }
  const need = (v: unknown) => {
    const x = id(v)
    if (!x) throw new Refused(400, 'Which member?')
    return x
  }

  app.get('/api/friends', rateLimiter(60, 20), handle((me) => myFriends(me.id, shortName)))
  app.post(
    '/api/friends/requests',
    rateLimiter(30, 10),
    handle(async (me, req) => ({ relation: await sendRequest(me.id, need((req.body as { to?: unknown })?.to)) })),
  )
  app.delete(
    '/api/friends/requests/:to',
    rateLimiter(30, 10),
    handle(async (me, req) => ({ relation: await cancelRequest(me.id, need(req.params.to)) })),
  )
  app.post(
    '/api/friends/requests/:from/accept',
    rateLimiter(30, 10),
    handle(async (me, req) => ({ relation: await answerRequest(me.id, need(req.params.from), true) })),
  )
  app.post(
    '/api/friends/requests/:from/decline',
    rateLimiter(30, 10),
    handle(async (me, req) => ({ relation: await answerRequest(me.id, need(req.params.from), false) })),
  )
  app.delete(
    '/api/friends/:id',
    rateLimiter(30, 10),
    handle(async (me, req) => {
      await removeFriend(me.id, need(req.params.id))
      return { relation: 'none' }
    }),
  )
  app.put(
    '/api/friends/top',
    rateLimiter(30, 10),
    handle(async (me, req) => ({ top: await setTop(me.id, (req.body as { ids?: unknown })?.ids) })),
  )
  app.put(
    '/api/members/me/avatar',
    rateLimiter(30, 10),
    handle(async (me, req) => {
      const b = (req.body ?? {}) as { kind?: unknown; pet?: unknown }
      return { pet: await savePet(me.id, b.kind, b.pet) }
    }),
  )
}
