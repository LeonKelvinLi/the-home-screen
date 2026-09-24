/*
  No database here on purpose, like open.ts: the rule can be checked on its
  own (tools/audit-crm.mjs does).
*/
import { CITY_PAGES } from '../../src/data/cities'

/*
  THE CITY IN AN ADDRESS, when it is one BEASTY has pages for. Reserve a Spot
  asks for an address instead of a city since Glenn's revision of 2026-09-22,
  and a lead is grouped by city. Read from the end, after the state and ZIP
  are dropped, so a street named for a city ("San Pablo Ave, Oakland") gives
  the city it is in; the longest name is tried first, so South San Francisco
  is not taken for San Francisco. Anything else is left blank, not guessed.
*/
const CITY_NAMES = [...CITY_PAGES].sort((x, y) => y.length - x.length)
export function cityFromAddress(address: string | null | undefined): string | null {
  const head = String(address ?? '')
    .trim()
    /* The state and the ZIP, each only after a space or a comma, so a city
       that ends in "ca" (Pacifica) keeps its last letters. */
    .replace(/(?:[\s,]+(?:CA|Calif\.?|California))?(?:[\s,]+\d{5}(?:-\d{4})?)?[\s,]*$/i, '')
    .toLowerCase()
  if (!head) return null
  for (const c of CITY_NAMES) {
    if (!head.endsWith(c.toLowerCase())) continue
    const before = head.slice(0, head.length - c.length)
    if (!before || /[\s,]$/.test(before)) return c
  }
  return null
}
