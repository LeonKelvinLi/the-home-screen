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
  referralCode: string
  tier: 'free' | 'pass' | 'diamond'
  tierStatus: 'none' | 'pending' | 'active' | 'lapsed'
  referrals: number
  raffleTickets: { total: number; unused: number }
  rewards: Rewards
  /** Whether the server has a Payment Link to send anybody to. */
  paymentsConfigured: boolean
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
    if (r.status === 401) return null
    if (!r.ok) return 'offline'
    return (await r.json()) as Account
  } catch {
    return 'offline'
  }
}

export type StartResult =
  | { ok: true; delivered: boolean; minutes: number }
  | { ok: false; error: string }

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
      body: JSON.stringify({ ...fields, ref: pendingReferral() ?? undefined }),
    })
    const body = await r.json().catch(() => ({}))
    if (!r.ok) return { ok: false, error: body?.error ?? 'Could not send a code just now.' }
    return { ok: true, delivered: !!body.delivered, minutes: body.minutes ?? 10 }
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
    return { ok: true, account: body as Account }
  } catch {
    return { ok: false, error: 'No connection. Try again in a moment.' }
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
export async function chooseTier(tier: 'pass' | 'diamond'): Promise<TierResult | null> {
  try {
    const r = await fetch('/api/members/tier', {
      method: 'POST',
      headers: json,
      credentials: 'same-origin',
      body: JSON.stringify({ tier }),
    })
    if (!r.ok) return null
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
