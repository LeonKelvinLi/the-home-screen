/**
 * BEASTY News.
 *
 * HIS SPEC, 2026-08-28: "public for all users and affiliates to view. Only
 * BEASTY Affiliates can access and use this feature. Affiliates can post any
 * important news they like… upcoming events, upcoming sales, upcoming
 * openings/closures, upcoming collaborations or any news pertaining to their
 * business. Each entry/post will be chronicled by date and should be archived
 * after 30 days. We will use this to post upcoming raffles, new affiliates
 * joining the directory or any BEASTY related events."
 *
 * READING IS PUBLIC AND POSTING IS NOT. That asymmetry is the whole design: the
 * page is a reason to sign up rather than something kept behind signing up, and
 * the gate on the dock has an explicit exception for it.
 *
 * WHAT IS NOT BUILT YET is the posting itself — an affiliate composing a post
 * needs a server route that checks their tier, and there is none. Everything
 * below is BEASTY's own, and every entry names its author so that an affiliate
 * post drops in beside them without the screen changing shape.
 */
export type NewsKind = 'event' | 'sale' | 'opening' | 'closure' | 'collab' | 'raffle' | 'affiliate' | 'beasty'

export interface NewsItem {
  /** ISO date. What "chronicled by date" means, and what the archive cuts on. */
  date: string
  kind: NewsKind
  headline: string
  body: string
  /** The brand whose news this is, or undefined when it is BEASTY's own. */
  authorId?: string
  /** Brand ids to show as a row of icons beneath the item. */
  brands?: string[]
  /**
   * When the thing being announced actually happens. An event with one of
   * these is what belongs on the calendar — his "when an affiliate posts news
   * about an upcoming future event, that event will be posted on the calendar".
   */
  eventDate?: string
}

/** What each kind is called on screen, and the colour it carries. */
export const KIND_LABEL: Record<NewsKind, string> = {
  event: 'Event',
  sale: 'Sale',
  opening: 'Opening',
  closure: 'Closing',
  collab: 'Collaboration',
  raffle: 'Raffle',
  affiliate: 'New affiliate',
  beasty: 'BEASTY',
}

const ITEMS: NewsItem[] = [
  {
    date: '2026-08-28',
    kind: 'affiliate',
    headline: 'Seventeen businesses joined this week',
    body:
      'Escape rooms at the Palace of Fine Arts, a mural studio, three gyms, a Pittsburg ' +
      'hibachi kitchen, a soul food room with two doors on First Street, a bottle shop ' +
      'and a salon bus that parks in five different towns.',
    brands: [
      'b_palacegames',
      'b_sugarmurals',
      'b_beatdropfitness',
      'b_citybachi',
      'b_jackiesplace',
      'b_pacificpetgrooming',
      'b_underdogscantina',
      'b_biryaniz',
    ],
  },
  {
    date: '2026-08-28',
    kind: 'beasty',
    headline: 'Seven more cities are open',
    body:
      'Pacifica, San Bruno, South San Francisco, Burlingame, Menlo Park, Los Gatos and ' +
      'Sausalito, plus Rohnert Park — the first city on BEASTY north of the Golden Gate.',
    brands: ['b_foursmedia'],
  },
  {
    date: '2026-08-27',
    kind: 'beasty',
    headline: 'Membership is open',
    body:
      'Two tiers, the BIGGIE PASS and the BEASTY PASS, honoured at every participating ' +
      'affiliate. Signing up is free; the pass is the paid part.',
  },
  {
    date: '2026-08-26',
    kind: 'beasty',
    headline: 'beastypages.com',
    body:
      'The directory has its own address. The QR under Share & Scan points at it, so a ' +
      'phone camera opens this same home screen with nothing to install.',
  },
]

/**
 * HIS THIRTY DAYS, measured from a date passed in rather than from the clock.
 *
 * `Date.now()` inside a module makes a screen that renders differently
 * depending on when a test happens to run, and an archive rule is exactly the
 * kind of thing that is only ever wrong on the boundary. The caller supplies
 * "now", the tests supply a fixed day, and the rule itself has one definition.
 */
export const ARCHIVE_DAYS = 30

const dayMs = 86_400_000
const toUtc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Live posts, newest first. Older than thirty days is archived, not deleted. */
export function currentNews(now: number = Date.now()): NewsItem[] {
  const cut = now - ARCHIVE_DAYS * dayMs
  return sorted(ITEMS.filter((i) => toUtc(i.date) >= cut))
}

/** Everything past the cut, newest first. Reachable, just not on the front. */
export function archivedNews(now: number = Date.now()): NewsItem[] {
  const cut = now - ARCHIVE_DAYS * dayMs
  return sorted(ITEMS.filter((i) => toUtc(i.date) < cut))
}

/**
 * Newest first, and stable within a day.
 *
 * `sort` is not required to be stable for equal keys everywhere, so same-day
 * entries fall back to the order they were written — which is the order the
 * operator would expect to read them.
 */
function sorted(list: NewsItem[]): NewsItem[] {
  return list
    .map((item, i) => ({ item, i }))
    .sort((a, b) => (a.item.date === b.item.date ? a.i - b.i : a.item.date < b.item.date ? 1 : -1))
    .map(({ item }) => item)
}

/** Everything with a date in the future — what the calendar is for. */
export function upcoming(now: number = Date.now()): NewsItem[] {
  return ITEMS.filter((i) => i.eventDate && toUtc(i.eventDate) >= now - dayMs).sort((a, b) =>
    (a.eventDate ?? '') < (b.eventDate ?? '') ? -1 : 1,
  )
}

/** "28 August" this year, "28 August 2025" otherwise. A feed of 08/28 reads as a receipt. */
export function newsDate(iso: string, now: number = Date.now()): string {
  const [y, m, d] = iso.split('-').map(Number)
  const sameYear = new Date(now).getUTCFullYear() === y
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  })
}

/** "Today" and "Yesterday" earn their own words; everything else is its date. */
export function dayLabel(iso: string, now: number = Date.now()): string {
  const days = Math.round((Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate()) - toUtc(iso)) / dayMs)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return newsDate(iso, now)
}
