/**
 * What is new on BEASTY.
 *
 * A directory's news is the directory changing: a city opening, businesses
 * joining, the page getting its own address. Nothing here is written in a
 * brand voice and nothing is announced that has not already happened — every
 * entry below is a fact you can check by opening the page it names.
 *
 * ONE ENTRY IS ONE LINE PLUS A DATE. Adding one is meant to be trivial, so the
 * operator can post without touching a component. `brands` is optional and
 * draws that row of icons under the item; the ids are brand ids, and an id that
 * no longer exists is skipped rather than crashing the screen.
 *
 * NEWEST FIRST is enforced at the bottom of this file rather than trusted,
 * because the obvious mistake is to append a new entry to the end and have it
 * appear at the bottom of the feed for a week before anyone notices.
 */
export interface NewsItem {
  /** ISO date, the day it actually happened. */
  date: string
  headline: string
  body: string
  /** Brand ids to show as a row of icons beneath the item. */
  brands?: string[]
}

const ITEMS: NewsItem[] = [
  {
    date: '2026-08-28',
    headline: 'Rohnert Park opens',
    body:
      'The first city on BEASTY north of the Golden Gate. Fours Media, a creative and ' +
      'performance agency on Valley House Drive, takes the first spot on it.',
    brands: ['b_foursmedia'],
  },
  {
    date: '2026-08-28',
    headline: 'Fourteen more businesses',
    body:
      'Escape rooms at the Palace of Fine Arts, a mural studio, two gyms, a Pittsburg ' +
      'hibachi kitchen, a soul food room with two doors on First Street, and a bottle ' +
      'shop among them.',
    brands: [
      'b_palacegames',
      'b_sugarmurals',
      'b_beatdropfitness',
      'b_citybachi',
      'b_jackiesplace',
      'b_crossfitsweatshop',
    ],
  },
  {
    date: '2026-08-27',
    headline: 'Alameda and Daly City open',
    body:
      'Two more city pages, each opened by the first business to take a spot on it — ' +
      'a pedal-powered cycleboat on the estuary, and a pizza room in Daly City.',
    brands: ['b_bayareabrewboat'],
  },
  {
    date: '2026-08-27',
    headline: 'Membership opens',
    body:
      'Two tiers, the BIGGIE PASS and the BEASTY PASS, with a Welcome offer and a ' +
      'Loyalty offer at the businesses that run them. Signing up is free; the pass is ' +
      'the paid part.',
  },
  {
    date: '2026-08-26',
    headline: 'beastypages.com',
    body:
      'The page has its own address now. The QR under Share & Scan points at it, so a ' +
      'phone camera opens this same home screen with nothing to install.',
  },
]

/**
 * Newest first, and stable within a day.
 *
 * `sort` is not stable across every engine for equal keys, so same-day entries
 * are ordered by their position in the list above — which is the order they
 * were written, and the order the operator would expect to read them.
 */
export const NEWS: NewsItem[] = ITEMS.map((item, i) => ({ item, i }))
  .sort((a, b) => (a.item.date === b.item.date ? a.i - b.i : a.item.date < b.item.date ? 1 : -1))
  .map(({ item }) => item)

/** "28 August 2026" — spelled out, because a feed of 08/28 reads as a receipt. */
export function newsDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
