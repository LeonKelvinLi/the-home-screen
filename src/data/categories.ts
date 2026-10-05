/*
  BEASTY CATEGORY PAGES — "a multitude of BEASTY pages as its own individual
  categories". Glenn, 2026-09-30:

    "These categories will be searchable and the best 24 of each category will
    hold their spot."
    "BEASTY • Tatoo. The top 24 tattooist in the Bay Area. No matter what city
    they are in … And each affiliate will be on their own cities page as well."
    "Now repeat that idea for every category page."
    "we will limit the amount of pages on the home screen to let's say 9
    categories … all of these extra categories are searchable."

  Plain data, like slots.ts: no BRANDS import here, so anything that only needs
  the names (the landing page, the server's kind check) stays light. Which
  businesses sit on each page is worked out in categorySeats.ts.

  HOW A PAGE FILLS. A seat set by hand (`beasty-tattoo-0` in placements.ts)
  always wins and keeps its number: that is a spot somebody has been sold or
  promised. The rest of the twenty-four fill from businesses already on
  BEASTY whose own type line (`cuisine`) says they belong, in the order they
  joined, one tile per business however many locations it has. The seat a
  business holds on a city page does NOT decide it: those seats were filled
  wherever there was room, so the Barber seats also hold a brew boat and a
  vineyard.

  `test` reads the business's type line only. `not` takes out the near misses
  a test would otherwise pull in ("Custom cakes" is not a whip).
*/

export interface BeastyCategory {
  /** The word in a seat id: `beasty-tattoo-5`. Lower case letters only. */
  kind: string
  /** Follows BEASTY on the page heading: BEASTY · Tattoo. */
  heading: string
  /** One line for the Categories list in Search. */
  about: string
  /** Its own background, public/wallpapers/cat-<kind>.webp (tools/make-category-walls.py). */
  wall: string
  /** Which businesses belong, read from their type line. */
  test?: RegExp
  not?: RegExp
}

const wall = (kind: string) => `/wallpapers/cat-${kind}.webp`

/** In the order Glenn listed them on 2026-09-30, with Tattoo from his example. */
export const BEASTY_CATEGORIES: BeastyCategory[] = [
  { kind: 'tattoo', heading: 'Tattoo', about: 'Tattoo artists and studios', wall: wall('tattoo'), test: /tattoo/i },
  { kind: 'athletes', heading: 'Athletes', about: 'Athletes and the brands they run', wall: wall('athletes'), test: /\bathlete/i },
  { kind: 'ai', heading: 'AI', about: 'AI products and the people building them', wall: wall('ai'), test: /\bAI\b|artificial intelligence/ },
  { kind: 'artists', heading: 'Artists', about: 'Painters, muralists and musicians', wall: wall('artists'), test: /\bartist\b|mural|vinyl art|custom art/i, not: /tattoo/i },
  { kind: 'dancers', heading: 'Dancers', about: 'Dancers and dance crews', wall: wall('dancers'), test: /\bdancers?\b|dance crew/i },
  { kind: 'donations', heading: 'Donations', about: 'Causes and foundations to give to', wall: wall('donations'), test: /foundation|non-?profit|charity/i },
  { kind: 'djs', heading: "DJ's", about: 'DJs for parties and events', wall: wall('djs'), test: /\bDJ\b/ },
  { kind: 'cooks', heading: 'Cooks', about: 'Caterers and private chefs', wall: wall('cooks'), test: /catering|private chef|personal chef/i },
  { kind: 'foodies', heading: 'Foodies', about: 'Food reviewers and creators', wall: wall('foodies'), test: /food (reviewer|creator|blogger)/i },
  { kind: 'realtors', heading: 'Realtors', about: 'Real estate agents', wall: wall('realtors'), test: /real estate|realtor|realty/i },
  { kind: 'media', heading: 'Media', about: 'Media companies and creators', wall: wall('media'), test: /media company|creative agency|\bpodcast|\bmagazine/i },
  { kind: 'photographers', heading: 'Photographers', about: 'Photographers, videographers and photo booths', wall: wall('photographers'), test: /photo|videograph|video production/i },
  { kind: 'automotive', heading: 'Automotive', about: 'Mechanics, detailing, tint, wraps and car audio', wall: wall('automotive'), test: /mechanic|car audio|auto (detail|spa|design)|detailing|tint|paint protection|\bppf\b|car wash|vinyl wrap/i, not: /cake|jewel/i },
  { kind: 'whips', heading: 'Whips', about: 'Cars and the people behind them', wall: wall('whips'), test: /car enthusiast|car showcase/i },
  { kind: 'sweets', heading: 'Sweets', about: 'Ice cream, bakeries and desserts', wall: wall('sweets'), test: /ice cream|gelato|bakery|dessert|dairy|cookies?|donuts?|pastries|cakes?|cannoli/i },
  { kind: 'ayce', heading: 'AYCE', about: 'All-you-can-eat restaurants', wall: wall('ayce'), test: /\bAYCE\b|all.you.can.eat|buffet/i },
  { kind: 'coffee', heading: 'Coffee', about: 'Coffee shops and cafés', wall: wall('coffee'), test: /coffee|caf[eé]/i },
  { kind: 'pits', heading: "Pit's", about: 'Pit bull kennels and breeders', wall: wall('pits'), test: /pit ?bull/i },
  { kind: 'models', heading: 'Models', about: 'Models and modeling agencies', wall: wall('models'), test: /\bmodel(s|ing)?\b/i },
  { kind: 'meats', heading: 'Meats', about: 'Independent ranchers and butchers', wall: wall('meats'), test: /rancher|\branch\b|butcher/i },
  { kind: 'gyms', heading: 'Gyms', about: 'Gyms, studios and climbing walls', wall: wall('gyms'), test: /\bgym\b|fitness|crossfit|boxing|climbing|yoga|barre|martial arts|pilates/i },
  { kind: 'barbershops', heading: 'Barbershops', about: 'Barbers, cuts and shaves', wall: wall('barbershops'), test: /barber/i },
  { kind: 'salons', heading: 'Salons', about: 'Hair, nails, braids and beauty', wall: wall('salons'), test: /salon|braid|\bnails?\b|beauty|lash/i, not: /barber/i },
]

/** Every category page holds his twenty-four. */
export const CATEGORY_SPOTS = 24

export const CATEGORY_KINDS: string[] = BEASTY_CATEGORIES.map((c) => c.kind)

export const categoryByKind = (kind: string | undefined): BeastyCategory | undefined =>
  BEASTY_CATEGORIES.find((c) => c.kind === kind)
