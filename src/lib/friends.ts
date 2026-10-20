/*
  FRIENDS, THE MYSPACE WAY, from the page's side. Glenn, 2026-09-24: "top 3
  friends", "exactly like myspace concept". The rules live on the server
  (server/friends.ts); this file only asks and says what came back.

  A request that fails says why in the reply's own words, so a screen can show
  it as it stands.
*/
import type { SharePage } from './share'

export type Relation = 'none' | 'sent' | 'received' | 'friends' | 'me'

export interface FriendPet {
  species: string
  coat: string
  backdrop: string
  accessory: string
}

export interface FriendPerson {
  id: string
  name: string
  /** The pet they built, or null: Contacts then draws one from their id. */
  pet: FriendPet | null
}

export interface MyFriends {
  friends: (FriendPerson & { since: number })[]
  requests: (FriendPerson & { at: number })[]
  /** My Top 3, in order, by id. */
  top: string[]
}

export const TOP_SIZE = 3

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = (await r.json().catch(() => ({}))) as { error?: string }
  if (!r.ok) throw new Error(data.error || 'That did not go through. Try again.')
  return data as T
}

export const fetchMyFriends = () => call<MyFriends>('GET', '/api/friends')

export const sendFriendRequest = (to: string) =>
  call<{ relation: Relation }>('POST', '/api/friends/requests', { to }).then((r) => r.relation)

export const cancelFriendRequest = (to: string) =>
  call<{ relation: Relation }>('DELETE', `/api/friends/requests/${encodeURIComponent(to)}`).then((r) => r.relation)

export const answerFriendRequest = (from: string, accept: boolean) =>
  call<{ relation: Relation }>('POST', `/api/friends/requests/${encodeURIComponent(from)}/${accept ? 'accept' : 'decline'}`).then(
    (r) => r.relation,
  )

export const removeFriend = (id: string) =>
  call<{ relation: Relation }>('DELETE', `/api/friends/${encodeURIComponent(id)}`).then((r) => r.relation)

/** My one line, under my name. Sixty characters, no links, numbers or emails. */
export const saveBio = (bio: string) => call<{ bio: string }>('PUT', '/api/members/me/bio', { bio }).then((r) => r.bio)

/** Where I live. Blank clears it; the server refuses a street or a made-up state. */
export const savePlace = (city: string, state: string) =>
  call<{ city: string; state: string }>('PUT', '/api/members/me/place', { city, state })

/* FIND FRIENDS, his Beli idea of 2026-10-19 with 💎 points (server/friends.ts). */
export interface Suggested {
  id: string
  name: string
  pet: FriendPet | null
  place: string
  points: number
  sameCity: boolean
}

export const fetchSuggested = () => call<{ myPoints: number; people: Suggested[] }>('GET', '/api/friends/suggested')

export const saveTopFriends = (ids: string[]) => call<{ top: string[] }>('PUT', '/api/friends/top', { ids }).then((r) => r.top)

/** The pet I built goes to my account; a photo or nothing clears it. Never throws. */
export function syncMyPet(kind: 'pet' | 'photo' | 'none', pet: FriendPet): void {
  void call('PUT', '/api/members/me/avatar', kind === 'pet' ? { kind: 'pet', pet } : { kind: 'none' }).catch(() => {})
}

/*
  "SHARE MY PAGE": the Contacts link with who to open and whose referral it is.
  Someone who follows it lands on Contacts; signed in, it opens this member's
  page, one tap from Add friend; signed out, joining credits the sharer.
*/
const OPEN_KEY = 'fb.openMember'

export function myPageLink(memberId: string, referralCode: string): SharePage {
  return {
    slug: `contacts?m=${encodeURIComponent(memberId)}&ref=${encodeURIComponent(referralCode)}`,
    title: 'My BEASTY page',
    text: 'Add me as a friend on BEASTY.',
  }
}

/** Keep the member a shared link asked to open, before anything tidies the address. */
export function captureMemberLink(search = window.location.search): void {
  try {
    const m = new URLSearchParams(search).get('m')
    if (m && /^[A-Za-z0-9_-]{1,64}$/.test(m)) sessionStorage.setItem(OPEN_KEY, m)
  } catch {
    /* storage blocked: the link opens Contacts, and that is all */
  }
}

/** Ask Contacts to open this member's page when it next opens. */
export function rememberMemberLink(id: string): void {
  try {
    sessionStorage.setItem(OPEN_KEY, id)
  } catch {
    /* storage blocked: Contacts opens on its list */
  }
}

/** The member to open, once. */
export function takeMemberLink(): string | null {
  try {
    const m = sessionStorage.getItem(OPEN_KEY)
    if (m) sessionStorage.removeItem(OPEN_KEY)
    return m
  } catch {
    return null
  }
}
