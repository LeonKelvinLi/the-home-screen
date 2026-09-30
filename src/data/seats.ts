/**
 * Which home-screen pages a business's tile sits on, for the button at the top
 * right of its page that goes there.
 *
 * Glenn, 2026-09-23, with a mockup of The Une's page reading "Union City •
 * Goods >" opposite "< Home": "a button that would go to the page that the
 * spot is on rather than going to the main homescreen. This will be helpful
 * for those that search a business and want to see the whole cities page that
 * that business is in."
 *
 * Read from the seats, not from the address: a business belongs to the pages
 * it is seated on, and an address can name a town with no page. The page name
 * is the heading the home screen draws over it (Goods, Services, More goods,
 * More services, Online, Individuals), so the button and the page it opens say
 * the same thing.
 */
import { CITY_PLACEMENTS } from './placements'
import { CITY_PAGES } from './cities'
import { BEASTY_SHEETS, SLOT_PAGES } from './slots'

export interface Seat {
  /** The city's name as its page is named, or 'BEASTY' for the flagship sheets. */
  city: string
  /** The heading of the page the tile is on. */
  page: string
  /** The page's kind, as in the seat id (goods, services, boutiques, …). */
  kind: string
}

const citySlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const CITY_BY_SLUG = new Map(CITY_PAGES.map((c, i) => [citySlug(c), { name: c, order: i }]))
/* BEASTY's sheets have their own headings (its first sheet is Eats since
   2026-09-30), so a city's Goods and BEASTY's Eats are looked up apart. */
const CITY_HEADING = new Map<string, string>(SLOT_PAGES.map((p) => [p.kind, p.heading]))
const BEASTY_HEADING = new Map<string, string>(BEASTY_SHEETS.map((p) => [p.kind, p.heading]))
const KIND_ORDER = new Map<string, number>(BEASTY_SHEETS.map((p, i) => [p.kind, i]))

/**
 * Every page the business is seated on: its cities first, in his city order,
 * then BEASTY's own sheets, because Home already answers "take me to BEASTY".
 * Empty for a business with no seat anywhere.
 */
export function seatsOf(brandId: string): Seat[] {
  const found: { seat: Seat; order: number; kind: number }[] = []
  for (const [slot, id] of Object.entries(CITY_PLACEMENTS)) {
    if (id !== brandId) continue
    const m = slot.match(/^(.+)-([a-z0-9]+)-\d+$/)
    if (!m) continue
    const [, where, kind] = m
    const page = (where === 'beasty' ? BEASTY_HEADING : CITY_HEADING).get(kind)
    if (!page) continue
    const city = where === 'beasty' ? { name: 'BEASTY', order: CITY_PAGES.length } : CITY_BY_SLUG.get(where)
    if (!city) continue
    if (found.some((f) => f.seat.city === city.name && f.seat.page === page)) continue
    found.push({ seat: { city: city.name, page, kind }, order: city.order, kind: KIND_ORDER.get(kind) ?? 0 })
  }
  return found.sort((a, b) => a.order - b.order || a.kind - b.kind).map((f) => f.seat)
}

/** The cities (not BEASTY) a business is seated in, each once, in his order. */
export const citiesOf = (brandId: string): string[] => [
  ...new Set(seatsOf(brandId).filter((s) => s.city !== 'BEASTY').map((s) => s.city)),
]
