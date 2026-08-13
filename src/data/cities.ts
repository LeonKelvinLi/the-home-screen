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
    The second wave, from the operator's own placements: Vallejo (The Grind
    Café, Bula Pies), Benicia, Walnut Creek and Pleasant Hill (The Hangout, Pet
    Butler's territory), Napa (The Model Bakery), Petaluma (Town Futurist).
    None has a photograph yet except Walnut Creek, so the rest draw the neutral
    placeholder rather than another city's landmark.
  */
  'Vallejo',
  'Benicia',
  'Walnut Creek',
  'Pleasant Hill',
  'Napa',
  'Petaluma',
  /* Larb Thai's home, sent 2026-08-10 — and uBreakiFix's nearest store
     already sat here waiting for the page to exist. */
  'El Cerrito',
  /*
    The 2026-08-11 run, each one opened by a business the operator sent with
    the city already written next to it: Mimi's Chocolates for Dublin, One
    House Bistro for San Ramon, Majestic Boutique for Crockett, INTL Kitchen
    for Milpitas, Banh Mi Xpress and Emy's Cannoli for Vacaville.

    Dublin also closes an open loop. Pippāl has been seated at dublin-goods-3
    since his earlier list, on a key that resolved to nothing because the city
    had no page — the placement was left in deliberately, waiting for exactly
    this. It renders from today.

    He sent landmark photographs for Vacaville (the Nut Tree) and Crockett (the
    C&H sugar refinery); neither is on disk yet, so both draw the neutral
    placeholder rather than another town's landmark.
  */
  'Dublin',
  'San Ramon',
  'Crockett',
  'Milpitas',
  'Vacaville',
  /*
    The 2026-08-12 run — a single evening in which his Instagram algorithm,
    in his words, "is just giving me exactly what I need". Six more cities,
    each opened by a business he sent with the city written beside the link:
    Polly Ann and House of Thai for San Francisco, Lavanta and Kaisen Don for
    San Leandro, The Sandwich Monkey for Foster City, Bober Tea for Martinez,
    Great Impasta for Danville, Sola Salons for Pleasanton.

    San Francisco is a city page now as well as the fallback wallpaper. Those
    are different jobs and it is worth being clear they do not collide: the
    Golden Gate is what someone sees when we do NOT know their city, and it
    goes on being that. This just means the Bay's biggest city can finally hold
    businesses of its own rather than only standing in for everywhere else.
  */
  'San Francisco',
  'San Leandro',
  'Pleasanton',
  'Foster City',
  'Martinez',
  'Danville',
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
/*
  12, not 13. It went stale the moment The Yard was made quoteOnly to keep its
  cocktails out of a delivery cart — LISTED_KITCHENS excludes quoteOnly, so the
  real figure dropped and this constant did not follow. The dev-only guard in
  Shell.tsx caught it; production had been printing 13.

  Worth knowing WHY it undercounts rather than just matching the number. That
  exclusion was written to keep a software studio out of a list a food truck is
  invited to join, and The Yard is a burger restaurant that simply takes its
  orders at the counter. So the honest figure for "local businesses" is arguably
  13, and this says 12 — understating, which is the direction the comment on
  LISTED_KITCHENS explicitly asks for, because overstating the size of the
  network to someone deciding whether to join is the worst way to be wrong here.
*/
export const PARTNER_COUNT = 12
