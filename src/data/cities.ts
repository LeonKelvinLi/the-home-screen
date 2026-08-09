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
  /*
    The South Bay and Peninsula run, added from the operator's own landmark
    list: Shoreline for Mountain View, Great America for Santa Clara, Hoover
    Tower for Palo Alto. None of them has a photograph on disk yet, so each
    draws the neutral placeholder rather than another city's landmark — see
    ios/Wallpaper.tsx.
  */
  'Sunnyvale',
  'Cupertino',
  'Santa Clara',
  'Mountain View',
  'Palo Alto',
  'Saratoga',
  'Redwood City',
  'San Mateo',
  /*
    THE FIRST CITY OUTSIDE THE BAY AREA, and outside California.

    Every other page on this list is within about an hour of Richmond, which is
    what made "the Bay Area cities on Glenn's list" a true sentence. It is not
    one any more, and the copy that said it has been changed rather than left to
    quietly mislead a business owner reading it in Nevada.
  */
  'Las Vegas',
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
