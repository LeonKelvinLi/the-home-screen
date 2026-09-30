/*
  WHO HOLDS EACH SPOT ON THE BEASTY CATEGORY PAGES.

  Glenn, 2026-09-30: "Those affiliates in each category will hold a spot in that
  category as well as their City's pages category." So a tattoo studio seated in
  Oakland is also on BEASTY · Tattoo, without anybody having to remember to put
  it there.

  Two sources, in this order:
  1. A seat set by hand in placements.ts (`beasty-tattoo-0`) keeps its number.
  2. Every business whose type line passes the page's test (categories.ts)
     fills the lowest open number, in the order it joined BEASTY. A business
     with several locations takes one spot, the first one it joined with.

  Joining order keeps numbers steady: a new business lands after the ones
  already there instead of pushing them along. A sold spot is fixed the other
  way, by writing it into placements.ts.
*/
import { BRANDS } from './brands'
import { CITY_PLACEMENTS } from './placements'
import { BEASTY_CATEGORIES, CATEGORY_SPOTS } from './categories'

/** Same rule as the CRM's familyKey: one business, however many locations. */
const family = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const nameOf = new Map(BRANDS.map((b) => [b.id, b.name]))

function seatCategory(kind: string, test: RegExp | undefined, not: RegExp | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  const taken = new Set<number>()
  const families = new Set<string>()
  /* By hand first: these are spots somebody chose. */
  for (const [seat, id] of Object.entries(CITY_PLACEMENTS)) {
    const m = /^beasty-([a-z]+)-(\d+)$/.exec(seat)
    if (!m || m[1] !== kind) continue
    const i = Number(m[2])
    if (i >= CATEGORY_SPOTS) continue
    out[seat] = id
    taken.add(i)
    families.add(family(nameOf.get(id) ?? id))
  }
  if (!test) return out
  let next = 0
  for (const b of BRANDS) {
    if (!test.test(b.cuisine) || not?.test(b.cuisine)) continue
    const f = family(b.name)
    if (families.has(f)) continue
    while (taken.has(next)) next++
    if (next >= CATEGORY_SPOTS) break
    out[`beasty-${kind}-${next}`] = b.id
    taken.add(next)
    families.add(f)
  }
  return out
}

/** Seat id to business id, for every filled spot on every category page. */
export const CATEGORY_PLACEMENTS: Record<string, string> = Object.assign(
  {},
  ...BEASTY_CATEGORIES.map((c) => seatCategory(c.kind, c.test, c.not)),
)

/** Every filled spot anywhere: the city pages and BEASTY's own sheets, then the category pages. */
export const ALL_PLACEMENTS: Record<string, string> = { ...CITY_PLACEMENTS, ...CATEGORY_PLACEMENTS }

/** How many of a category page's twenty-four are taken. */
export const takenOn = (kind: string): number =>
  Object.keys(CATEGORY_PLACEMENTS).filter((s) => s.startsWith(`beasty-${kind}-`)).length
