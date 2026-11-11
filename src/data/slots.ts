import { BEASTY_CATEGORIES, CATEGORY_SPOTS } from './categories'
import { MORE_FOODIE_PAGES } from './foodies'

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
  /**
   * On BEASTY's named sheets (Eats, Sweets): which businesses can fill this
   * spot on their own, read from their type line. A spot set by hand wins.
   * See categorySeats.ts.
   */
  test?: RegExp
  not?: RegExp
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
  { n: 15, name: 'Boba shop', label: 'Boba' },
  { n: 16, name: 'Cookie shop', label: 'Cookies' },
  { n: 17, name: 'Donut shop', label: 'Donuts' },
  /* Widened from "Dog boutique" to seat a breeder without renumbering the
     list — see data/placements.ts. The label under the tile is unchanged. */
  { n: 18, name: 'Dog boutique and breeder', label: 'Dog shop' },
  { n: 19, name: 'Art gallery', label: 'Art' },
  { n: 20, name: 'Clothing brand or boutique', label: 'Clothing' },
  { n: 21, name: 'Shoe boutique', label: 'Shoes' },
  { n: 22, name: 'Skate and bike shop', label: 'Skate' },
  { n: 23, name: 'Thrift and vintage', label: 'Thrift' },
  { n: 24, name: 'Toy shop', label: 'Toys' },
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
  /* Widened from "Tattoo shop" on 2026-09-16 to seat a piercing studio (hone,
     San Jose) the same way the dog boutique took a breeder: body art is one
     errand, and the label under the tile is unchanged. */
  { n: 4, name: 'Tattoo and piercing', label: 'Tattoo' },
  { n: 5, name: 'Gym', label: 'Gym' },
  { n: 6, name: 'Mechanics and smog', label: 'Mechanic' },
  { n: 7, name: 'Car audio', label: 'Car Audio' },
  { n: 8, name: 'Auto detailing', label: 'Detailer' },
  { n: 9, name: 'Phone and device repair', label: 'Phone fix' },
  { n: 10, name: 'Dry cleaning', label: 'Dry clean' },
  { n: 11, name: 'Tailor and alterations', label: 'Tailor' },
  { n: 12, name: 'Local print shop', label: 'Print' },
  { n: 13, name: 'Photo and video', label: 'Photo/Video' },
  { n: 14, name: 'Florist', label: 'Flowers' },
  /* Widened from "Pet grooming" to seat a dog walker without renumbering the
     list — the same move n=18 on the goods page made for a breeder. The label
     is unchanged because a label is only ever read on an UNCLAIMED spot: a
     seated business draws its own name. */
  { n: 15, name: 'Pet grooming and walking', label: 'Grooming' },
  { n: 16, name: 'Veterinary clinic', label: 'Vet' },
  { n: 17, name: 'Massage', label: 'Massage' },
  { n: 18, name: 'DJ', label: 'DJ' },
  { n: 19, name: 'Dog breeder', label: 'Breeder' },
  { n: 20, name: 'Event coordinator', label: 'Events' },
  { n: 21, name: 'House cleaning', label: 'Cleaning' },
  { n: 22, name: 'Gardener', label: 'Gardener' },
  { n: 23, name: 'Handyman and home repair', label: 'Handyman' },
  { n: 24, name: 'Contractor', label: 'Contractor' },
]

/**
 * BEASTY · Online — the third numbered sheet, and only on his own pages.
 *
 * His idea, in his words: "we need to create maybe an BEASTY • Online page
 * after BEASTY • Services dedicated to brands that ship products. We can charge
 * them less for their spot. The idea is to fill the 24 spots with well known
 * brands that will give our platform clout."
 *
 * WHY IT IS NOT A CITY PAGE. A brand that ships has no city, which is the whole
 * point of it — seating one in Oakland would be a claim that it is in Oakland.
 * Every city keeps its 48 numbered spots and its two yellow sheets exactly as
 * they are, so "the first 48 spots are the first two pages" survives untouched.
 * This sheet exists once, on the pages he sells from.
 *
 * Categorised like the other two rather than left as bare numbers, for the same
 * reason: a spot is pitchable when it is "the sneakers spot" and not when it is
 * "number nine". These twenty-four are the things a small brand actually ships.
 */
export const ONLINE_CATEGORIES: SlotCategory[] = [
  { n: 1, name: 'Streetwear and apparel', label: 'Apparel' },
  { n: 2, name: 'Sneakers and footwear', label: 'Sneakers' },
  { n: 3, name: 'Hats and headwear', label: 'Hats' },
  { n: 4, name: 'Bags and luggage', label: 'Bags' },
  { n: 5, name: 'Jewellery', label: 'Jewellery' },
  { n: 6, name: 'Eyewear', label: 'Eyewear' },
  { n: 7, name: 'Watches', label: 'Watches' },
  { n: 8, name: 'Skincare and beauty', label: 'Skincare' },
  { n: 9, name: 'Grooming and barber supply', label: 'Grooming' },
  { n: 10, name: 'Supplements and nutrition', label: 'Supplements' },
  /* Widened on 2026-09-03 to "Coffee, drinks and vending" to seat Vending
     Enterprise, and put back on 2026-09-21 when it moved to BEASTY • Services
     on his word. The seat is open. */
  { n: 11, name: 'Coffee and tea', label: 'Coffee' },
  { n: 12, name: 'Hot sauce and condiments', label: 'Sauces' },
  { n: 13, name: 'Snacks and sweets', label: 'Snacks' },
  { n: 14, name: 'Car parts and performance', label: 'Car parts' },
  { n: 15, name: 'Moto and cycling gear', label: 'Moto' },
  { n: 16, name: 'Skate and surf', label: 'Skate' },
  { n: 17, name: 'Fitness equipment', label: 'Fitness' },
  { n: 18, name: 'Pet goods', label: 'Pet goods' },
  { n: 19, name: 'Home and candles', label: 'Home' },
  { n: 20, name: 'Art prints and posters', label: 'Art' },
  { n: 21, name: 'Music and vinyl', label: 'Vinyl' },
  { n: 22, name: 'Games and collectibles', label: 'Games' },
  { n: 23, name: 'Tools and hardware', label: 'Tools' },
  /* Widened 2026-09-03 for Overly Hiphop, a media company: none of the
     twenty-four was a media seat and his ask was this sheet. */
  { n: 24, name: 'Media, tech and accessories', label: 'Tech' },
]

/**
 * The open spots on a yellow page. No categories on purpose: the operator's
 * pitch is that page one is the numbered, categorised real estate and the
 * yellow pages behind it hold "the businesses that didn't act in time" —
 * unlimited, uncategorised, first come first served.
 */
/* Forty-eight, not twenty-four: "unlimited" in his words, and on 2026-09-24
   BEASTY's own More services had seated all twenty-four when Glenn added 1850
   Properties. Blanks still stop at one page's worth (HomeScreen), so only a
   sheet with businesses past the twenty-fourth grows a page.
   Seventy-two from 2026-10-23: BEASTY's More eats had seated all forty-eight
   (Sugar Plum, then Powder Keg Pub) when My O My Berkeley came in, and San
   Francisco's More goods was full the day before. Same reasoning, one more
   page's worth; still no extra blank page anywhere. Ninety-six from
   2026-10-25: Batch 65 brought ten more for More eats, which stood at 63.
   2026-10-31: Batch 83 fills spot 96; extend to 120, preserving every seat. */
export const OPEN_SPOTS: SlotCategory[] = Array.from({ length: 120 }, (_, i) => ({
  n: i + 1,
  name: 'Open spot',
  label: 'Available',
}))

/*
  BEASTY • INDIVIDUALS — twenty-four numbered spots for people, not shops.

  His ask of 2026-08-27: "I want to start finding artists and support their
  work … Artists need help being recognized for their work and selling their
  art", and the page goes "after BEASTY • Online".

  NUMBERED BUT NOT CATEGORISED, and that is deliberate rather than lazy. The
  goods and services sheets carry his twenty-four trades because he sells "the
  Mexican spot in Oakland"; he has named no list of artistic disciplines, and
  inventing one — painter, sculptor, poet — would be putting a product
  structure in his mouth. A numbered spot still sells the same way.

  NOT YELLOW: this is a page-one sheet he is recruiting onto, not an overflow
  page of what nobody claimed in time.
*/
export const INDIVIDUAL_SPOTS: SlotCategory[] = Array.from({ length: 24 }, (_, i) => ({
  n: i + 1,
  name: 'Open spot',
  label: 'Available',
}))

/*
  BEASTY • Goods, the boutique sheet. Glenn, 2026-09-30: "change BEASTY • Goods
  to say BEASTY • Eats. Then create a BEASTY • Goods page to follow it right
  before BEASTY • Services, this is dedicated for small boutiques; etc now."
  Twenty-four open spots, like Individuals, until he names categories.
*/
export const BOUTIQUE_SPOTS: SlotCategory[] = Array.from({ length: 24 }, (_, i) => ({
  n: i + 1,
  name: 'Open spot',
  label: 'Available',
}))

/**
 * Which of a city's pages a set of spots belongs to. A BEASTY category page
 * (tattoo, gyms, …) is named by its own word from categories.ts.
 */
export type SlotPageKind =
  | 'goods'
  | 'goods2'
  | 'services'
  | 'services2'
  | 'online'
  | 'individuals'
  | 'boutiques'
  | (string & {})

export interface SlotPage {
  /** A yellow continuation that travels with this category. */
  parent?: string
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
  /**
   * A BEASTY PAGES overflow page: yellow wallpaper, dark ink, open spots.
   * The yellow is the brand claim — every page after a city's two numbered
   * ones reads as a page of BEASTYpages.com, and the colour is what tells a
   * customer at a glance that the spots on it are still available.
   */
  yellow?: true
  /** A BEASTY category page's own background, in place of the city photograph. */
  wall?: string
  /** One line saying what the page is for, shown in Search's Categories list. */
  about?: string
}

/**
 * A city's pages, in the order they are swiped through.
 *
 * One list rather than two loose exports because both the home screen (drawing
 * the pages) and the registry (reading a tapped tile back) have to agree on the
 * order and on the word in the id, and they are in different files.
 */
export const SLOT_PAGES: SlotPage[] = [
  /*
    BOTH NUMBERED PAGES FIRST, then both yellow ones.

    The yellow page used to ride directly behind the page it overflowed —
    Goods, more goods, Services, more services — on the reasoning that a
    customer swiping past a full Goods page should land on where the latecomers
    go. That reasoning was about the customer, and it broke the operator's
    pitch, which is the thing these pages exist for.

    He sells "the first 48 spots in your city". Interleaved, those 48 spots
    spanned pages one, THREE and a bit, with a page of blanks in the middle — so
    the number he quotes did not correspond to anything a business owner could
    be shown. Goods then Services makes the first 48 spots exactly the first two
    pages, and everything after them is openly marked available.
  */
  { kind: 'goods', heading: 'Goods', categories: GOODS_CATEGORIES },
  { kind: 'services', heading: 'Services', categories: SERVICE_CATEGORIES },
  /*
    One yellow page each for now, by his instruction ("only include the next
    page blank"); more get added when a city actually fills.
  */
  { kind: 'goods2', heading: 'More goods', categories: OPEN_SPOTS, yellow: true },
  { kind: 'services2', heading: 'More services', categories: OPEN_SPOTS, yellow: true },
]

/**
 * The flagship's own run: the two numbered sheets, then ONLINE, then the yellow
 * pages. "After BEASTY • Services", which is where he asked for it.
 *
 * A separate list rather than a flag on SLOT_PAGES, because the difference is
 * real: a city sells 48 local spots and this sells 24 more that belong to
 * nowhere. Cities are untouched by it.
 */
/*
  BEASTY • EATS, one restaurant per cuisine. Glenn, 2026-09-30: "BEASTY • Eats
  will showcase 24 of the best variety of cuisine. No two cuisines alike on this
  page. Only one sushi, only one Chinese, only one Mexican, etc… Basically, the
  first who signs up holds a spot", with his list of the 24 that evening, and
  "Any forgotten varieties of food will push over to the second yellow pages".
  His order. A spot seated by hand (BEASTY_EATS_ROSTER) keeps it; an open one
  fills with the first business on BEASTY whose type line fits.
*/
export const EATS_CATEGORIES: SlotCategory[] = [
  { n: 1, name: 'BBQ', label: 'BBQ', test: /\bbbq\b|barbecue|barbeque|smoked meat|smokehouse/i, not: /korean|hibachi|vegan|plant-based|grill(s)? (and|&)|caterer|catering/i },
  { n: 2, name: 'Korean', label: 'Korean', test: /korean/i },
  { n: 3, name: 'Chinese', label: 'Chinese', test: /chinese|dim sum|szechuan|sichuan|cantonese|dumpling/i, not: /bakery|dessert/i },
  { n: 4, name: 'Sushi', label: 'Sushi', test: /sushi/i },
  { n: 5, name: 'Mexican', label: 'Mexican', test: /mexican|taco|taquer|burrito|tamale/i, not: /bakery|pastr|panader|hibachi/i },
  { n: 6, name: 'Filipino food', label: 'Filipino', test: /filipino/i, not: /dessert|bakery/i },
  { n: 7, name: 'Indian food', label: 'Indian', test: /indian/i, not: /pizza|dessert|sweets/i },
  { n: 8, name: 'Greek food', label: 'Greek', test: /greek|gyro/i },
  { n: 9, name: 'Italian food', label: 'Italian', test: /italian|pasta|trattoria/i, not: /pizza|ice|gelato|cannoli|pastr|dessert|deli|sausage|sandwich/i },
  { n: 10, name: 'French cuisine', label: 'French', test: /french|crêpe|crepe|brasserie/i, not: /fries|toast|bakery|pastr|patisserie/i },
  { n: 11, name: 'Udon', label: 'Udon', test: /udon/i },
  { n: 12, name: 'Pho', label: 'Pho', test: /\bpho\b|vietnamese/i, not: /banh mi|sandwich|coffee|dessert/i },
  { n: 13, name: 'Ramen', label: 'Ramen', test: /ramen/i },
  { n: 14, name: 'Fijian food', label: 'Fijian', test: /fiji/i },
  { n: 15, name: 'Jamaican food', label: 'Jamaican', test: /jamaican|caribbean|jerk/i },
  { n: 16, name: 'Burger', label: 'Burger', test: /burger/i, not: /vegan|plant-based|ice cream/i },
  { n: 17, name: 'Chicken sandwich', label: 'Chicken sand.', test: /chicken sandwich/i },
  { n: 18, name: 'Sandwiches', label: 'Sandwiches', test: /sandwich|\bdeli\b|\bsubs?\b/i, not: /chicken sandwich|banh mi/i },
  { n: 19, name: 'Banh mi', label: 'Banh mi', test: /banh mi/i },
  { n: 20, name: 'Steakhouse', label: 'Steakhouse', test: /steak ?house|steakhouse|\bsteaks?\b/i, not: /cheesesteak/i },
  { n: 21, name: 'Hot pot', label: 'Hot pot', test: /hot ?pot|shabu/i },
  { n: 22, name: 'Fried chicken', label: 'Fried chicken', test: /fried chicken|hot chicken|\bwings\b/i, not: /sandwich/i },
  { n: 23, name: 'Hot dogs', label: 'Hot dogs', test: /hot ?dog|sausage/i },
  { n: 24, name: 'Pizza', label: 'Pizza', test: /pizz/i, not: /oven/i },
]

/*
  BEASTY • SWEETS, "anything dessert", after Eats. Glenn, 2026-09-30: "I forgot
  that I wanted to add BEASTY • Sweets after BEASTY • Eats. This will be a great
  category in itself and it will create more space on the EATS page", and his
  list of 24, "in no special order". One shop per kind, filled like Eats.
*/
export const SWEETS_CATEGORIES: SlotCategory[] = [
  { n: 1, name: 'Cakes', label: 'Cakes', test: /\bcakes?\b|cake shop/i, not: /cheesecake|cupcake|pancake|crab ?cake|class|decorating/i },
  { n: 2, name: 'Donuts', label: 'Donuts', test: /donut|doughnut/i },
  { n: 3, name: 'Boba', label: 'Boba', test: /boba|bubble tea|milk tea/i },
  { n: 4, name: 'Ice cream', label: 'Ice cream', test: /ice cream|creamery/i, not: /waffle/i },
  { n: 5, name: 'Waffles and pancakes', label: 'Waffles', test: /waffle|pancake/i },
  { n: 6, name: 'Shaved ice', label: 'Shaved ice', test: /shaved ice|shave ice|bingsu|snow ice/i },
  { n: 7, name: 'Cookies', label: 'Cookies', test: /cookie/i },
  { n: 8, name: 'Pastries', label: 'Pastries', test: /pastr|bakery|bake ?shop|croissant|patisserie/i, not: /mexican|cookie|dog|cake shop/i },
  { n: 9, name: 'Milkshakes', label: 'Milkshakes', test: /milkshake/i },
  { n: 10, name: 'Smoothies', label: 'Smoothies', test: /smoothie|juice bar|acai|açaí/i },
  { n: 11, name: 'Pies', label: 'Pies', test: /\bpies?\b/i, not: /meat|pizza|savory/i },
  { n: 12, name: 'Cheesecakes', label: 'Cheesecake', test: /cheesecake/i },
  { n: 13, name: 'Custard and flan', label: 'Custard', test: /custard|\bflan\b/i },
  { n: 14, name: 'Cupcakes', label: 'Cupcakes', test: /cupcake/i },
  { n: 15, name: 'Tarts', label: 'Tarts', test: /\btarts?\b/i },
  { n: 16, name: 'Mochi', label: 'Mochi', test: /mochi/i },
  { n: 17, name: 'Gelato', label: 'Gelato', test: /gelato/i },
  { n: 18, name: 'Soft serve', label: 'Soft serve', test: /soft[- ]?serve|frozen yogurt|froyo/i },
  { n: 19, name: 'Dirty soda', label: 'Dirty soda', test: /dirty soda|soda shop/i },
  { n: 20, name: 'Asian desserts', label: 'Asian', test: /asian dessert|taiyaki|hong kong|chinese bakery|japanese dessert|korean dessert/i },
  { n: 21, name: 'Filipino desserts', label: 'Filipino', test: /filipino (dessert|bakery|sweets)|\bube\b|halo[- ]halo/i },
  { n: 22, name: 'Indian desserts', label: 'Indian', test: /indian (dessert|sweets)|mithai/i },
  { n: 23, name: 'Mexican pastries', label: 'Mexican', test: /panader|mexican (pastr|bakery|dessert)|concha|churro|paleta/i },
  { n: 24, name: 'Candy shop', label: 'Candy', test: /candy|chocolat|confection/i, not: /ice cream/i },
]

export const BEASTY_SHEETS: SlotPage[] = [
  /* BEASTY's first sheet is food, one restaurant per cuisine; seats are
     `beasty-eats-N` since 2026-10-05 (they were `goods`, on the city list).
     A city's first page is still Goods. */
  { kind: 'eats', heading: 'Eats', categories: EATS_CATEGORIES },
  { kind: 'sweets', heading: 'Sweets', categories: SWEETS_CATEGORIES, wall: '/wallpapers/cat-sweets.webp', about: 'Anything dessert, one shop of each kind' },
  { kind: 'boutiques', heading: 'Goods', categories: BOUTIQUE_SPOTS },
  SLOT_PAGES[1],
  { kind: 'online', heading: 'Online', categories: ONLINE_CATEGORIES },
  /* "We can create this page after BEASTY • Online" — his words, and this is
     that position. Cities are untouched by it, exactly as Online is. */
  { kind: 'individuals', heading: 'Individuals', categories: INDIVIDUAL_SPOTS },
  /* The yellow sheet behind Eats holds the food that overflowed it. */
  { ...SLOT_PAGES[2], heading: 'More eats', categories: [
    ...OPEN_SPOTS,
    ...Array.from({ length: 24 }, (_, i) => ({ n: OPEN_SPOTS.length + i + 1, name: 'Open', label: 'Available' })),
  ] },
  SLOT_PAGES[3],
]

/*
  THE CATEGORY PAGES — BEASTY · Tattoo, BEASTY · Gyms and the rest (see
  categories.ts). Twenty-four spots each, named for the page, so a blank on
  BEASTY · Tattoo opens Reserve as "Tattoo — spot available".
*/
export const CATEGORY_PAGES: SlotPage[] = BEASTY_CATEGORIES.map((c) => ({
  kind: c.kind,
  heading: c.heading,
  wall: c.wall,
  about: c.about,
  categories: Array.from({ length: CATEGORY_SPOTS }, (_, i) => ({ n: i + 1, name: c.heading, label: 'Available' })),
}))

/* Glenn, 30 Oct: yellow pages for the foodies beyond the original 24.
   Global seat indexes survive pagination and changing phone heights. */
export const CATEGORY_OVERFLOW: SlotPage[] = [{
  /* Glenn, Nov 8: Lo Coco's joins Pizza after its original 24, preserving every seat. */
  kind: 'pizza2', parent: 'pizza', heading: 'More pizza', about: 'More pizza restaurants', yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Pizza', label: 'Available' })),
}, {
  /* The original Breakfast/Diner sheet is full; Sweet Maple joins without moving it. */
  kind: 'diner2', parent: 'diner', heading: 'More breakfast/diner', about: 'More breakfast and brunch restaurants', yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Breakfast/Diner', label: 'Available' })),
}, {
  kind: 'foodies2',
  parent: 'foodies',
  heading: 'More foodies',
  about: 'More food reviewers and creators',
  yellow: true,
  categories: Array.from({ length: Math.max(24, Math.ceil(MORE_FOODIE_PAGES.length / 24) * 24) }, (_, i) => ({ n: i + 1, name: 'Foodie', label: 'Available' })),
}, {
  /* Pets' original 24 stay; Glenn also requested Grande Kennels on Pets. */
  kind: 'pets2',
  parent: 'pets',
  heading: 'More pets',
  about: 'More pet businesses',
  yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Pets', label: 'Available' })),
}, {
  kind: 'coffee2',
  parent: 'coffee',
  heading: 'More cafes',
  about: 'More cafes and coffee shops',
  yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Café', label: 'Available' })),
}, {
  kind: 'bbq2',
  parent: 'bbq',
  heading: 'More BBQ',
  about: 'More barbecue and smokehouses',
  yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'BBQ', label: 'Available' })),
}, {
  kind: 'sushi2',
  parent: 'sushi',
  heading: 'More sushi',
  about: 'More sushi restaurants',
  yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Sushi', label: 'Available' })),
}, {
  kind: 'teas2', parent: 'teas', heading: 'More teas', about: 'More tea, boba and matcha shops', yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Teas/Boba/Matcha', label: 'Available' })),
}, {
  kind: 'sweets2', parent: 'sweets', heading: 'More sweets', about: 'More bakeries and dessert shops', yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Sweets', label: 'Available' })),
}, {
  kind: 'burgers2', parent: 'burgers', heading: 'More burgers', about: 'More burger and hot dog shops', yellow: true,
  categories: Array.from({ length: 24 }, (_, i) => ({ n: i + 1, name: 'Burgers/Hot Dogs', label: 'Available' })),
}]

/*
  WHAT THE HOME SCREEN SWIPES THROUGH. Glenn, 2026-09-30: "we will limit the
  amount of pages on the home screen to let's say 9 categories … You won't be
  able to scroll for cities unless you just search for that city".

  Nine category pages. Since 2026-10-05: Eats, then Sweets ("after BEASTY •
  Eats"), then AYCE ("put it after BEASTY • Sweets"), then Goods, Services,
  Online and Individuals in his order, then Tattoo (his example) and
  Automotive (the old Whips, the fullest page). Gyms and Salons left the swipe
  to make room; they are on BEASTY • Pages and in Search. After the nine come
  the two yellow sheets, the free listings behind Eats and Services.
*/
export const HOME_KINDS: string[] = ['eats', 'sweets', 'ayce', 'boutiques', 'services', 'online', 'individuals', 'tattoo', 'automotive']

/** Every BEASTY page there is: the flagship sheets, then the category pages. */
export const ALL_BEASTY_PAGES: SlotPage[] = [...BEASTY_SHEETS, ...CATEGORY_PAGES, ...CATEGORY_OVERFLOW]

/** The home screen's BEASTY run, in order: the nine categories, then the yellow sheets. */
export const HOME_PAGES: SlotPage[] = [
  ...HOME_KINDS.map((k) => ALL_BEASTY_PAGES.find((p) => p.kind === k)!),
  ...BEASTY_SHEETS.filter((p) => p.yellow),
]

/**
 * Every word a seat id can carry between the city and the number. The server's
 * event check, the CRM and the audits read this one list, so a new page kind is
 * added in one place.
 */
export const PAGE_KINDS: string[] = [...new Set([...SLOT_PAGES, ...ALL_BEASTY_PAGES].map((p) => p.kind))]

/** A seat id, `oakland-goods-5` or `beasty-tattoo-3`: the place, the page, the spot. Longest kind first, so `goods2` is not read as `goods`. */
export const SEAT_RE = new RegExp(`^(.+)-(${[...PAGE_KINDS].sort((a, b) => b.length - a.length).join('|')})-(\\d{1,3})$`)

/** The categories on a city page, or nothing if the id names no known page. */
export const categoriesFor = (kind: string | undefined): SlotCategory[] | undefined =>
  /* The city pages too: since BEASTY's first sheet became `eats` (2026-10-05),
     a city's `goods` is on no BEASTY sheet, and its blanks lost their names. */
  [...ALL_BEASTY_PAGES, ...SLOT_PAGES].find((p) => p.kind === kind)?.categories

/**
 * The most spots a single city page holds — his twenty-four.
 *
 * Read from the lists rather than written down, and from the LONGER of the two:
 * the home screen sizes a city page's tiles to fit this many, and sizing to the
 * shorter list would push the last row of the other one off the bottom of the
 * screen. A page never paginates, so this is a number the grid has to obey
 * rather than one it gets to choose.
 */
export const SPOTS_PER_PAGE = Math.max(...SLOT_PAGES.filter((p) => !p.yellow).map((p) => p.categories.length))
