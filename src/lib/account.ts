/**
 * The signed-in BEASTY member — the SERVER-BACKED account.
 *
 * NOT THE SAME THING as lib/member.ts, and the two are deliberately left apart.
 * That one is the loyalty-card simulation: a code you can show, points in this
 * browser, nothing on a server. This one is a real row in the database with a
 * referral graph and a membership tier hanging off it.
 *
 * Merging them would mean either putting the simulated points on the server
 * (inventing data nobody earned) or moving the account into localStorage (where
 * a member's referral credit could be edited with the dev tools). They stay
 * separate until the loyalty loop is itself real.
 *
 * THE SESSION IS AN httpOnly COOKIE, so there is nothing to keep here and
 * nothing a script can steal. Every call goes out with credentials and the
 * server decides who is asking.
 */
import { drain, drainNull } from './http'
import { pendingAttribution } from './attribution'
import type { FriendPerson, FriendPet, Relation } from './friends'

export interface Rewards {
  milestones: number
  raffleTickets: number
  discount: number
  toNextTicket: number
  discountCapped: boolean
}

export interface Account {
  id: string
  name: string
  /* Whichever one they signed in with. A member who joined by SMS has a phone
     and no email; one who joined before the change has the reverse. */
  email: string | null
  phone: string | null
  instagram: string | null
  /** Epoch ms they joined, from the server. */
  joinedAt: number
  referralCode: string
  tier: 'free' | 'pass' | 'diamond'
  tierStatus: 'none' | 'pending' | 'active' | 'lapsed'
  referrals: number
  raffleTickets: { total: number; unused: number }
  rewards: Rewards
  /** Whether the server has a Payment Link to send anybody to. */
  paymentsConfigured: boolean
  /** month or year — how the chosen tier is billed. Month until a yearly price exists. */
  tierInterval: 'month' | 'year'
  /** How often the pass on the member card rotates, so the card can count down. */
  passWindowMs: number
  /** Friend requests waiting for this member's answer: the red number on Profile. */
  friendRequests?: number
}

export interface SignUp {
  name: string
  /*
    A MOBILE NUMBER IS WHAT THE SCREEN ASKS FOR NOW — "we want only SMS".
    `email` stays on the type and stays optional because the accounts that
    existed before the change were created with one and no number, and the
    server still accepts it so those people can get back in.
  */
  phone?: string
  email?: string
  instagram?: string
}

const json = { 'content-type': 'application/json' }

/**
 * Who referred whoever is looking at this page.
 *
 * Read from ?ref= and kept in sessionStorage rather than used immediately,
 * because a QR is scanned long before anybody fills in a form — usually on the
 * home screen, minutes earlier. Losing it between those two moments loses the
 * referrer their credit, which is the entire mechanic.
 *
 * sessionStorage, not localStorage: a referral belongs to this visit. A code
 * captured in March should not still be crediting somebody in June.
 */
const REF_KEY = 'fb.ref.v1'

export function captureReferral(search = window.location.search): void {
  try {
    const ref = new URLSearchParams(search).get('ref')
    if (ref && /^[0-9A-Z]{4,16}$/i.test(ref)) sessionStorage.setItem(REF_KEY, ref.toUpperCase())
  } catch {
    /* private mode — the referral is simply not carried */
  }
}

/**
 * WHICH BUSINESS'S REGISTER CODE brought this visitor, if one did.
 *
 * A register card encodes `/?b=<business>&via=qr`. The business is kept for the
 * visit, exactly as a member's referral code is, and sent with the sign-up so
 * the business that put the code on its counter is credited for the member it
 * produced. A shared link to a business page carries no `via` and credits
 * nobody: sharing a page is not a register.
 */
const VIA_KEY = 'fb.via.v1'

export function captureVia(search = window.location.search): void {
  try {
    const q = new URLSearchParams(search)
    const b = q.get('b')
    if (q.get('via') === 'qr' && b && /^b_[a-z0-9]{2,40}$/.test(b)) sessionStorage.setItem(VIA_KEY, b)
  } catch {
    /* private mode — the credit is simply not carried */
  }
}

export function pendingVia(): string | null {
  try {
    return sessionStorage.getItem(VIA_KEY)
  } catch {
    return null
  }
}

function clearVia(): void {
  try {
    sessionStorage.removeItem(VIA_KEY)
  } catch {
    /* nothing to clear */
  }
}

export function pendingReferral(): string | null {
  try {
    return sessionStorage.getItem(REF_KEY)
  } catch {
    return null
  }
}

function clearReferral(): void {
  try {
    sessionStorage.removeItem(REF_KEY)
  } catch {
    /* nothing to clear */
  }
}

/**
 * Who is signed in.
 *
 * THREE ANSWERS, NOT TWO, and the third is the one that matters:
 *
 *   an Account — signed in.
 *   null       — definitely signed out. The server said 401.
 *   'offline'  — we could not ask. The API is down, or this is a static
 *                preview with no server behind it at all.
 *
 * Collapsing 'offline' into null locks every visitor out of the directory the
 * moment the API blips, because the gate cannot tell "you are not a member"
 * from "I could not check". A 401 is a fact; a failed fetch is an absence of
 * one, and the gate must not punish somebody for it.
 */
export type AccountState = Account | null | 'offline'

export async function fetchAccount(): Promise<AccountState> {
  try {
    const r = await fetch('/api/members/me', { credentials: 'same-origin' })
    /* The body is read even when the answer is no — see lib/http drain(). */
    if (!r.ok) {
      await drain(r)
      return r.status === 401 ? null : 'offline'
    }
    return (await r.json()) as Account
  } catch {
    return 'offline'
  }
}

export type StartResult =
  | { ok: true; delivered: boolean; minutes: number; channel: 'sms' | 'email' }
  | { ok: false; error: string }

/** Which ways in can actually deliver. See /api/members/channels. */
export type LoginChannels = { sms: boolean; email: boolean }

/**
 * Ask before showing the form which field to ask for.
 *
 * Fails OPEN to email, because that is the one this deployment has always had
 * configured and a sign-up screen that renders nothing is worse than one that
 * asks for the wrong thing.
 */
export async function loginChannels(): Promise<LoginChannels> {
  try {
    const r = await fetch('/api/members/channels', { credentials: 'same-origin' })
    if (!r.ok) {
      await drain(r)
      return { sms: false, email: true }
    }
    const b = await r.json()
    return { sms: !!b.sms, email: !!b.email }
  } catch {
    return { sms: false, email: true }
  }
}

/**
 * Step one: ask for a code.
 *
 * ONE CALL FOR BOTH SIGNING UP AND SIGNING BACK IN, and the answer is the same
 * either way. The server knows which it was; saying so would let anybody type
 * addresses in and learn who is a BEASTY member.
 *
 * `delivered: false` means the server could not send it — no SMS provider
 * configured, or the carrier refused it. The code exists and nobody received it. That has to be shown, not swallowed:
 * a code screen that can never be satisfied is worse than an honest failure.
 */
export async function startSignUp(fields: SignUp): Promise<StartResult> {
  try {
    const r = await fetch('/api/members/start', {
      method: 'POST',
      headers: json,
      credentials: 'same-origin',
      body: JSON.stringify({
        ...fields,
        ref: pendingReferral() ?? undefined,
        via: pendingVia() ?? undefined,
        attribution: pendingAttribution() ?? undefined,
      }),
    })
    const body = await r.json().catch(() => ({}))
    if (!r.ok) return { ok: false, error: body?.error ?? 'Could not send a code just now.' }
    /* The channel the server ACTUALLY used, not the one the form assumed. The
       screen names the destination the code went to, and it was naming the
       email while the code went by text. */
    return {
      ok: true,
      delivered: !!body.delivered,
      minutes: body.minutes ?? 10,
      channel: body.channel === 'email' ? 'email' : 'sms',
    }
  } catch {
    return { ok: false, error: 'No connection. Try again in a moment.' }
  }
}

export type VerifyResult = { ok: true; account: Account } | { ok: false; error: string }

/** Step two: prove the number. This is the only call that creates a member. */
export async function verifyCode(destination: string, code: string): Promise<VerifyResult> {
  try {
    const r = await fetch('/api/members/verify', {
      method: 'POST',
      headers: json,
      credentials: 'same-origin',
      /*
        A NUMBER GOES BACK AS `phone` AND AN ADDRESS AS `email`, because the
        server looks the member up in a different column for each. Told apart
        by the @ rather than by a flag threaded through three components: the
        two are never ambiguous and a flag can be passed wrong.
      */
      body: JSON.stringify(
        destination.includes('@') ? { email: destination, code } : { phone: destination, code },
      ),
    })
    const body = await r.json().catch(() => ({}))
    if (!r.ok) return { ok: false, error: body?.error ?? 'That code did not work.' }
    clearReferral()
    clearVia()
    return { ok: true, account: body as Account }
  } catch {
    return { ok: false, error: 'No connection. Try again in a moment.' }
  }
}

/** One row of the Contacts list: a first name, a last initial, the day they joined. */
export interface DirectoryMember {
  id: string
  name: string
  since: number
  me: boolean
  /** The pet they built, or null. */
  pet?: FriendPet | null
}

/**
 * Everyone who has signed up, for the Phone app's Contacts. Null when signed
 * out or when the server cannot be reached, so the screen can say so rather
 * than show an empty list as though nobody had joined.
 */
export async function fetchDirectory(): Promise<{ count: number; members: DirectoryMember[] } | null> {
  try {
    const r = await fetch('/api/members/directory', { credentials: 'same-origin' })
    if (!r.ok) return drainNull(r)
    return (await r.json()) as { count: number; members: DirectoryMember[] }
  } catch {
    return null
  }
}

/**
 * How many members there are — the number, for anybody, with no names. Null
 * when it cannot be read, so a screen never shows a zero it did not check.
 */
export async function fetchMemberCount(): Promise<number | null> {
  try {
    const r = await fetch('/api/members/count', { credentials: 'same-origin' })
    if (!r.ok) return drainNull(r)
    const b = (await r.json()) as { count?: unknown }
    return typeof b.count === 'number' ? b.count : null
  } catch {
    return null
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/members/signout', { method: 'POST', credentials: 'same-origin' })
  } catch {
    /* already gone as far as the user is concerned */
  }
}

export interface TierResult {
  account: Account
  paymentLink: string | null
  paymentsConfigured: boolean
}

/**
 * Choose a membership.
 *
 * The server records the choice as PENDING and hands back a payment link, or
 * null when none is configured. It never reports somebody paid — only a payment
 * provider may do that — so a null link has to be shown as "not connected yet"
 * rather than swallowed.
 */
export async function chooseTier(
  tier: 'pass' | 'diamond',
  interval: 'month' | 'year' = 'month',
): Promise<TierResult | null> {
  try {
    const r = await fetch('/api/members/tier', {
      method: 'POST',
      headers: json,
      credentials: 'same-origin',
      body: JSON.stringify({ tier, interval }),
    })
    if (!r.ok) return drainNull(r)
    const b = await r.json()
    return { account: b as Account, paymentLink: b.paymentLink, paymentsConfigured: b.paymentsConfigured }
  } catch {
    return null
  }
}

/** The link a member shares. Same string the QR encodes, so both can be shown. */
export function shareLink(code: string): string {
  return `${window.location.origin}/?ref=${encodeURIComponent(code)}`
}

/**
 * THE PASS: a signed token that changes every minute.
 *
 * Glenn's worry, 2026-09-06: a member's QR could be screenshotted and the
 * picture used to redeem offers by somebody who never paid. So the code on the
 * member card is no longer the referral code, which is meant to be shared, but
 * a token the server signs for THIS member and THIS minute. A shop verifies it
 * once; the second scan of the same picture is refused. Nothing here can mint
 * one — the server needs the session to know whose it is.
 */
export interface Pass {
  token: string
  /** Epoch ms after which this token stops verifying (a scanner allows one
      window of grace on top, for a screen that was already up). */
  expiresAt: number
  windowMs: number
}

export async function fetchPass(): Promise<Pass | null> {
  try {
    const r = await fetch('/api/members/pass', { credentials: 'same-origin', cache: 'no-store' })
    if (!r.ok) return drainNull(r)
    return (await r.json()) as Pass
  } catch {
    return null
  }
}

/**
 * Another member's page, from Contacts: what they starred and liked.
 *
 * Glenn, 2026-09-06: "make sure people on contact list we can go into their
 * profile and see what they liked." The server answers only to a signed-in
 * member, and only with what that person did on business pages — never a
 * number, an address or a handle.
 */
export interface MemberProfile {
  id: string
  name: string
  since: number
  /** Brand ids, newest first. */
  likes: string[]
  favourites: string[]
  me: boolean
  /* Friends, the MySpace way (lib/friends.ts). Optional so an older server's
     answer still reads. */
  pet?: FriendPet | null
  friendCount?: number
  top3?: (FriendPerson & { position: number })[]
  relation?: Relation
}

export async function fetchMemberProfile(id: string): Promise<MemberProfile | null> {
  try {
    const r = await fetch(`/api/members/${encodeURIComponent(id)}/profile`, {
      credentials: 'same-origin',
    })
    if (!r.ok) return drainNull(r)
    return (await r.json()) as MemberProfile
  } catch {
    return null
  }
}

/** One raffle ticket, as the member holds it: numbered, dated, spent or not. */
export interface RaffleTicket {
  id: string
  serial: number
  /** The referral count that earned it: 3, 6, 9 … */
  earnedAtReferral: number
  earnedAt: number
  usedAt: number | null
  usedFor: string | null
}

export async function fetchTickets(): Promise<RaffleTicket[] | null> {
  try {
    const r = await fetch('/api/members/tickets', { credentials: 'same-origin' })
    if (!r.ok) return drainNull(r)
    const b = (await r.json()) as { tickets: RaffleTicket[] }
    return Array.isArray(b.tickets) ? b.tickets : []
  } catch {
    return null
  }
}
