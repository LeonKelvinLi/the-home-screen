/**
 * The cities the operator is opening in, in his order.
 *
 * Plain data in its own module, deliberately. It used to live in
 * apps/registry.tsx, and the landing page imported it from there just to print
 * a count — which dragged the registry, every app icon, the glyph set and the
 * whole brand catalogue into the first response, for one number.
 *
 * Each of these gets a home-screen page that starts EMPTY: a grid of blank
 * tiles waiting for the businesses recruited there. A city page with nothing on
 * it is an honest statement that nobody has signed up yet, and it is the thing
 * he shows a prospective business to say "this space is yours".
 *
 * The rest of his list — San Rafael, Pinole, Hercules, Hayward, Fremont,
 * Dublin, Walnut Creek, San Mateo, Daly City, Milpitas, Palo Alto, Sunnyvale,
 * Pleasanton, Pittsburg, Oakley, El Cerrito — goes in here when he says.
 */
export const CITY_PAGES = [
  'Oakland',
  'Richmond',
  'Berkeley',
  'Albany',
  'Concord',
  'San Jose',
  'Livermore',
  'Antioch',
  'Brentwood',
] as const

/**
 * How many researched partners are listed, for the landing page's pitch.
 *
 * A NUMBER rather than `LISTED_KITCHENS.length`, because reading that length
 * costs the landing page the entire catalogue. Shell checks it against the real
 * list on mount and complains in the console if they ever drift, so this cannot
 * quietly go stale.
 */
export const PARTNER_COUNT = 12
