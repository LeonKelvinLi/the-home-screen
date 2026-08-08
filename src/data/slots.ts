/**
 * The spots on a city's pages, and what each one is for.
 *
 * TWO pages per city, not one: goods on the first, services on the second.
 * That is the operator's own line — "Supply of Goods, Services & awesome
 * Company" — and it is also the split a customer already has in their head. A
 * page holding sushi, a gym and a tattoo shop asks them to scan twenty-four
 * unrelated tiles; two pages ask them to answer one question first, am I buying
 * something or booking someone, and then scan twelve.
 *
 * The operator's twenty-four are all still here, in his order within each page.
 * Nineteen of them are goods and only five are services, so the services page
 * is mostly new: the additions are the trades a small Bay Area city actually
 * has and a customer actually goes looking for, not variations on the ones he
 * already listed. His food shops (ice cream, bakery, coffee) moved up next to
 * the kitchens, because his sense of order is food first.
 *
 * Every city gets the same forty-eight in the same order, which is the point of
 * it: a customer who has learned that goods 2 is Mexican food in Oakland knows
 * where to look in Richmond, and a business owner being pitched can be shown
 * the exact tile that would be theirs.
 *
 * `label` is what fits under a 66px tile — the grid truncates anything longer
 * with an ellipsis, and "Mediterranean" under a tile is a row of dots. `name`
 * is the full category, used as the tile's accessible name and carried into the
 * Reserve screen so the operator can see which spot was tapped.
 *
 * NONE OF THESE IS A CLAIM. A slot is an empty space with a category on it, not
 * an assertion that such a business exists in that city or has agreed to
 * anything. That distinction is why the tiles stay drawn as dashed outlines
 * rather than as real icons with a name under them.
 */

export interface SlotCategory {
  /**
   * 1-24, as the operator numbers them, counted within its own page.
   *
   * It has to match the position in the list: a slot's id carries its INDEX,
   * and that is what the tile is looked up by. Reordering a list renumbers the
   * spots on it, which is a thing to do deliberately — a business pitched "the
   * number 9 spot" is being shown a position, not a promise.
   */
  n: number
  /** Full category name. */
  name: string
  /** Short enough to sit under a tile without truncating. */
  label: string
}

/**
 * Page one of a city: things you buy.
 *
 * His eleven kitchens first, then the everyday food shops, then the food you
 * take home, then the boutiques in the order he listed them. The five that are
 * not his — grocery, butcher, liquor, thrift, books — are the independent shops
 * these cities are actually full of, and each is somewhere a customer walks to
 * on purpose rather than a near-neighbour of a tile that already exists.
 */
export const GOODS_CATEGORIES: SlotCategory[] = [
  { n: 1, name: 'Burgers and hot dogs', label: 'Burgers' },
  { n: 2, name: 'Mexican food', label: 'Mexican' },
  { n: 3, name: 'Asian food', label: 'Asian' },
  { n: 4, name: 'Indian food', label: 'Indian' },
  { n: 5, name: 'Sushi', label: 'Sushi' },
  { n: 6, name: 'Italian', label: 'Italian' },
  { n: 7, name: 'Sandwiches', label: 'Sandwiches' },
  { n: 8, name: 'Korean and ramen', label: 'Korean' },
  { n: 9, name: 'Chicken wings', label: 'Wings' },
  { n: 10, name: 'Mediterranean', label: 'Medi' },
  { n: 11, name: 'Filipino food', label: 'Filipino' },
  { n: 12, name: 'Ice cream shop', label: 'Ice cream' },
  { n: 13, name: 'Bakery', label: 'Bakery' },
  { n: 14, name: 'Coffee shop', label: 'Coffee' },
  { n: 15, name: 'Grocery and market', label: 'Grocery' },
  { n: 16, name: 'Butcher and seafood', label: 'Butcher' },
  { n: 17, name: 'Liquor and wine', label: 'Liquor' },
  { n: 18, name: 'Dog boutique', label: 'Dog shop' },
  { n: 19, name: 'Art gallery', label: 'Art' },
  { n: 20, name: 'Clothing brand or boutique', label: 'Clothing' },
  { n: 21, name: 'Shoe boutique', label: 'Shoes' },
  { n: 22, name: 'Skate and bike shop', label: 'Skate' },
  { n: 23, name: 'Thrift and vintage', label: 'Thrift' },
  { n: 24, name: 'Bookshop', label: 'Books' },
]

/**
 * Page two of a city: things people do for you.
 *
 * The operator gave five — barber and salon, gym, mechanics, tattoo, print —
 * and they set the shape of the rest: hands-on trades on a high street, not
 * agencies. So the page runs personal care, then the car, then the things you
 * drop off and collect, then the appointments, then the trades that come to
 * your house.
 *
 * Barber and salon leads it. He numbered it last, at the tail of a list that
 * began with food, but on a page of services it is the one everybody has and
 * everybody books — and it is the word he uses himself when he describes the
 * range this covers.
 */
export const SERVICE_CATEGORIES: SlotCategory[] = [
  { n: 1, name: 'Barber and salon', label: 'Barber' },
  { n: 2, name: 'Nail salon', label: 'Nails' },
  { n: 3, name: 'Massage and spa', label: 'Spa' },
  { n: 4, name: 'Tattoo shop', label: 'Tattoo' },
  { n: 5, name: 'Gym', label: 'Gym' },
  { n: 6, name: 'Mechanics and smog', label: 'Mechanic' },
  { n: 7, name: 'Auto body and paint', label: 'Auto body' },
  { n: 8, name: 'Car wash and detailing', label: 'Car wash' },
  { n: 9, name: 'Phone and device repair', label: 'Phone fix' },
  { n: 10, name: 'Dry cleaning and laundry', label: 'Laundry' },
  { n: 11, name: 'Tailor and alterations', label: 'Tailor' },
  { n: 12, name: 'Local print shop', label: 'Print' },
  { n: 13, name: 'Photo and video studio', label: 'Photo' },
  { n: 14, name: 'Florist', label: 'Flowers' },
  { n: 15, name: 'Pet grooming', label: 'Grooming' },
  { n: 16, name: 'Veterinary clinic', label: 'Vet' },
  { n: 17, name: 'Pharmacy', label: 'Pharmacy' },
  { n: 18, name: 'Optician and eyewear', label: 'Optician' },
  { n: 19, name: 'Dentist', label: 'Dentist' },
  { n: 20, name: 'Locksmith', label: 'Locksmith' },
  { n: 21, name: 'House cleaning', label: 'Cleaning' },
  { n: 22, name: 'Landscaping and gardening', label: 'Garden' },
  { n: 23, name: 'Handyman and home repair', label: 'Handyman' },
  { n: 24, name: 'Movers and hauling', label: 'Movers' },
]

/** Which of a city's two pages a set of spots belongs to. */
export type SlotPageKind = 'goods' | 'services'

export interface SlotPage {
  /**
   * Sits in the middle of a slot id — `oakland-services-5`.
   *
   * A tile is synthesised from its id on lookup, with nothing else to go on, so
   * the id is the only place the page can be recorded. Reading a bare trailing
   * number would land on whichever list happened to be first and label a
   * barber's spot "Mexican".
   */
  kind: SlotPageKind
  /** Follows the city on the page heading: OAKLAND · SERVICES. */
  heading: string
  categories: SlotCategory[]
}

/**
 * A city's pages, in the order they are swiped through.
 *
 * One list rather than two loose exports because both the home screen (drawing
 * the pages) and the registry (reading a tapped tile back) have to agree on the
 * order and on the word in the id, and they are in different files.
 */
export const SLOT_PAGES: SlotPage[] = [
  { kind: 'goods', heading: 'Goods', categories: GOODS_CATEGORIES },
  { kind: 'services', heading: 'Services', categories: SERVICE_CATEGORIES },
]

/** The categories on a city page, or nothing if the id names no known page. */
export const categoriesFor = (kind: string | undefined): SlotCategory[] | undefined =>
  SLOT_PAGES.find((p) => p.kind === kind)?.categories

/**
 * The most spots a single city page holds — his twenty-four.
 *
 * Read from the lists rather than written down, and from the LONGER of the two:
 * the home screen sizes a city page's tiles to fit this many, and sizing to the
 * shorter list would push the last row of the other one off the bottom of the
 * screen. A page never paginates, so this is a number the grid has to obey
 * rather than one it gets to choose.
 */
export const SPOTS_PER_PAGE = Math.max(...SLOT_PAGES.map((p) => p.categories.length))
