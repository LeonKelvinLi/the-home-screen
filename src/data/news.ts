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
    /*
      FROM THEIR OWN POSTS: ThirsTea San Leandro's Instagram, in his
      screenshots of 2026-09-16. The eventDate puts the soft opening on the
      calendar.
    */
    date: '2026-09-16',
    kind: 'opening',
    headline: 'ThirsTea opens in San Leandro on Thursday',
    body:
      'A new boba shop at 1383 MacArthur Blvd, Suite 1. Soft opening Thursday 17 September, ' +
      '1 to 7pm. Grand opening Saturday 19 September, 11am to 8pm: buy two drinks, get one, and a ' +
      'souvenir for the first 50 customers. Sunday 20 September, 11am to 8pm: buy three, get one.',
    eventDate: '2026-09-17',
    brands: ['b_thirsteasanleandro'],
  },
  {
    /* From the banner on their own site: "Reopening Wednesday, September 16". */
    date: '2026-09-16',
    kind: 'opening',
    headline: 'Delage reopens in Old Oakland',
    body:
      'The sushi and omakase counter on 9th Street, founded by Chef Chikara Ono and carried ' +
      'forward by Chef Kyle Itani, reopens on Wednesday 16 September. Lunch and dinner, Monday ' +
      'to Saturday.',
    eventDate: '2026-09-16',
    brands: ['b_delageoakland'],
  },
  {
    /*
      A REAL DATE, FROM THEIR OWN HOMEPAGE. A modal on
      homeofchickenandwaffles.com reads "We are closing on August 31st!" — his
      spec lists "upcoming openings/closures" as exactly the kind of thing this
      page carries, and it is the most useful thing the directory can tell
      somebody this week.

      It is also what proved the calendar wiring: it was the first post with an
      eventDate, so it had to appear on the calendar as well.
      The restaurant itself is seeded and deliberately not seated — a tile for a
      room that shuts on Sunday would be wrong by Monday — but a dated notice
      that it is closing is right either way.
    */
    date: '2026-08-28',
    kind: 'closure',
    headline: 'Home of Chicken and Waffles closes on Sunday',
    body:
      'Their own site says 31 August. A long-running Oakland soul food room near ' +
      'Jack London Square, founded by Derreck B Johnson, with every plate named after ' +
      'family or a friend. Open 11am to 10pm until then, closed Wednesday.',
    eventDate: '2026-08-31',
    brands: ['b_homeofchickenandwaffles'],
  },
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

/**
 * "Today", "Yesterday" and "Tomorrow" earn their own words; everything else is
 * its date.
 *
 * FUTURE DATES ARE THE POINT OF THE THIRD ONE. This function is used for the
 * day a post landed AND for the day an event happens, and the first version
 * collapsed everything not in the past to "Today" — so a closure on the 31st
 * read as "Today" on the 29th, on a card whose whole job was to say when.
 */
export function dayLabel(iso: string, now: number = Date.now()): string {
  const d = new Date(now)
  const today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const days = Math.round((today - toUtc(iso)) / dayMs)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days === -1) return 'Tomorrow'
  return newsDate(iso, now)
}
