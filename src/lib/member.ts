/**
 * The member: their code, their points, and what they have redeemed.
 *
 * A SIMULATION. Everything here lives in this browser's localStorage — there is
 * no account, no server record, and no business-facing app to scan anything.
 * The operator asked for the loop to be built now and wired later, and this is
 * the loop: a code you can show, points you can earn, an offer you can spend.
 * Every screen that uses it says which parts are not connected.
 *
 * WHY THE CODE IS TWO INITIALS AND FOUR DIGITS
 *
 * The operator offered this as the fallback if per-user QR codes proved too
 * complicated. It is not the fallback — it is the better primitive, and the QR
 * is a rendering of it:
 *
 *   - It survives a camera that will not focus, a cracked lens, a flat battery
 *     on the till side, and a shop with no phone at all. It can be read aloud.
 *   - It is short enough to be typed by a member of staff in a queue.
 *   - It is the same string whether it arrives by camera or by voice, so the
 *     scan path and the manual path cannot drift apart.
 *
 * It is NOT a secret and must never be treated as one. Two initials and four
 * digits is roughly a million combinations before you account for names being
 * unevenly distributed — fine as a name badge, useless as a password. Nothing
 * that costs money may ever be authorised by this code alone.
 */

const KEY = 'fb.member.v1'

export interface MemberState {
  /** BEASTY-XX-1234. Stable once set. */
  code: string
  /** What the customer typed, kept so the code can be explained back to them. */
  initials: string
  last4: string
  joinedAt: number
  /** One per visit, capped at one a day per business. */
  points: number
  /** `${brandId}:${YYYY-MM-DD}` for every check-in, so the cap is enforceable. */
  checkIns: string[]
  /** Brand ids whose welcome offer has been used. Welcome offers are once. */
  welcomeUsed: string[]
  /** Businesses this member introduced, for the referral credit. */
  referrals: string[]
}

const EMPTY: MemberState = {
  code: '',
  initials: '',
  last4: '',
  joinedAt: 0,
  points: 0,
  checkIns: [],
  welcomeUsed: [],
  referrals: [],
}

function read(): MemberState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!raw || typeof raw.code !== 'string') return EMPTY
    return {
      ...EMPTY,
      ...raw,
      checkIns: Array.isArray(raw.checkIns) ? raw.checkIns : [],
      welcomeUsed: Array.isArray(raw.welcomeUsed) ? raw.welcomeUsed : [],
      referrals: Array.isArray(raw.referrals) ? raw.referrals : [],
    }
  } catch {
    return EMPTY
  }
}

function write(next: MemberState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode / quota — the simulation just will not persist */
  }
}

export function member(): MemberState {
  return read()
}

export function isMember(): boolean {
  return read().code.length > 0
}

/** Local date, so "once a day" means the customer's day, not UTC's. */
export function today(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Build the code. Letters only from the initials, digits only from the phone,
 * because a code read down a phone line has to be unambiguous.
 */
export function makeCode(initials: string, phone: string): string {
  const letters = initials.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase()
  const digits = phone.replace(/\D/g, '').slice(-4)
  return `BEASTY-${letters}-${digits}`
}

export function canJoin(initials: string, phone: string): boolean {
  return initials.replace(/[^a-z]/gi, '').length >= 2 && phone.replace(/\D/g, '').length >= 4
}

export function join(initials: string, phone: string): MemberState {
  const next: MemberState = {
    ...read(),
    code: makeCode(initials, phone),
    initials: initials.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase(),
    last4: phone.replace(/\D/g, '').slice(-4),
    joinedAt: Date.now(),
  }
  write(next)
  return next
}

export function leave() {
  write(EMPTY)
}

export type CheckInResult =
  | { ok: true; points: number }
  | { ok: false; reason: 'not-member' | 'already-today' }

/**
 * A visit. One point, once a day, per business.
 *
 * The cap is per BUSINESS per day rather than per day overall, so a customer
 * who eats lunch at one partner and dinner at another earns for both — which is
 * the behaviour the programme is trying to encourage. It stops the same person
 * standing outside one shop scanning its code twenty times.
 */
export function checkIn(brandId: string): CheckInResult {
  const m = read()
  if (!m.code) return { ok: false, reason: 'not-member' }
  const key = `${brandId}:${today()}`
  if (m.checkIns.includes(key)) return { ok: false, reason: 'already-today' }
  const next = { ...m, points: m.points + 1, checkIns: [...m.checkIns, key].slice(-400) }
  write(next)
  return { ok: true, points: next.points }
}

export function checkedInToday(brandId: string): boolean {
  return read().checkIns.includes(`${brandId}:${today()}`)
}

/** A welcome offer is once per business, ever — that is what makes it a welcome. */
export function welcomeAvailable(brandId: string): boolean {
  const m = read()
  return m.code.length > 0 && !m.welcomeUsed.includes(brandId)
}

export function useWelcome(brandId: string): boolean {
  const m = read()
  if (!m.code || m.welcomeUsed.includes(brandId)) return false
  write({ ...m, welcomeUsed: [...m.welcomeUsed, brandId] })
  return true
}

/**
 * Record that this member introduced a business.
 *
 * NOTHING IS OWED BY THIS. The operator has talked about a commission for a
 * referral and has not agreed one, so this stores the fact and no rate — a
 * number here would be a promise the app made on his behalf.
 */
export function recordReferral(name: string) {
  const m = read()
  if (!m.code || m.referrals.includes(name)) return
  write({ ...m, referrals: [...m.referrals, name] })
}
