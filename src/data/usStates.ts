/*
  THE STATE A MEMBER LIVES IN, by its postal code. Glenn, 2026-10-19: "add City
  and State when people sign up to appear here. That way people can befriend
  people in their same city if they want to. It is also good to add to our
  analytics." Read by the sign-up form, the Profile editor and the server,
  which refuses anything not on this list.
*/
export const US_STATES: [code: string, name: string][] = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['PR', 'Puerto Rico'],
]

const CODES = new Set(US_STATES.map(([c]) => c))

/** Almost every member is in the Bay Area, so the picker starts here. */
export const DEFAULT_STATE = 'CA'

export const CITY_MAX = 40

/** A city name as a person types it, tidied; '' for blank, null for refused. */
export function cleanCity(v: unknown): string | null {
  /* Absent is blank: an older client, the CRM's sign-in card and a sign-in
     from before the form asked all send no city at all. */
  if (v === undefined || v === null) return ''
  if (typeof v !== 'string') return null
  const s = v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!s) return ''
  if (s.length > CITY_MAX) return null
  /* Letters, spaces and the marks real place names carry (St. Helena,
     Lake Forest Park, Coeur d'Alene, Winston-Salem). No digits: a street
     address does not belong here. */
  if (!/^[\p{L}][\p{L} .'’-]*$/u.test(s)) return null
  /* "san jose" -> "San Jose", while "McKinleyville" keeps its own capitals. */
  return s.replace(/(^|[\s-])(\p{Ll})/gu, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
}

/** A postal code from the list, upper-cased; '' for blank, null for refused. */
export function cleanState(v: unknown): string | null {
  if (v === undefined || v === null) return ''
  if (typeof v !== 'string') return null
  const s = v.trim().toUpperCase()
  if (!s) return ''
  return CODES.has(s) ? s : null
}

/** "Concord, CA", or '' when they have not said. */
export function placeLine(city?: string | null, state?: string | null): string {
  if (city && state) return `${city}, ${state}`
  return city || state || ''
}
