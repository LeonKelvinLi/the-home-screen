import type { GlyphName } from './glyphs'
import { LOCAL_SEED } from './localBrands'
import { ROSTER_SEED } from './roster'

/**
 * Catalogue ported from the operator's existing hub at goodneighborbuilder.com.
 *
 * Every brand name, tagline, brand colour, menu item, description and price
 * below is transcribed from that site — not invented. The icon art is their
 * own, served from /public/icons.
 *
 * Seven entries have been removed rather than carried over: five whose names
 * state a trade their menu contradicts (Tax Technician, The Credit Brothers,
 * Tony's Style, Gifted Kicks, Print On Demand) and two confirmed non-food
 * businesses (Midnite Theories, a skate shop; Sin City Pits, a dog breeder).
 * Listing a tax preparer as a soul-food kitchen is a claim about someone
 * else's trade that we cannot stand behind. Jenuine Fitness, BEASTmode and Sharetasking
 * were removed in a second pass at the operator's direction: a fitness brand
 * and a gig-work platform, whose food menus are plausible but unverified.
 *
 * Sharetasking was the dock's "Gig Work" destination, so the dock is now three
 * icons rather than four. That is valid — iOS docks hold up to four, not
 * exactly four — but it is a deliberate consequence, not an oversight.
 *
 * Two things were deliberately NOT carried over:
 *  - Ratings. The old site has none, and inventing review counts for real
 *    businesses would be fabricating evidence about someone else's trade.
 *  - Contact details and ordering links. They do not exist anywhere in the old
 *    site's data model, so there was nothing to port. `prepMinutes` below is an
 *    operational estimate by category, not sourced.
 *
 * Multi-tenant from day one: each business is its own vendor and gets paid
 * separately. That matches what this actually is — independent local operators
 * sharing one home screen, not one company's brand portfolio.
 */

export type LogoTemplate = 'monogram' | 'badge' | 'glyph-word' | 'wordmark' | 'band'

export interface Logo {
  /** Vendor-supplied square artwork. Wins over the generated mark below. */
  imageUrl?: string
  /** Tile background. Either a solid or an `a|b` linear pair. */
  bg: string
  fg: string
  accent?: string
  /* Generated-mark fallback, for a vendor who joins without artwork. */
  template?: LogoTemplate
  glyph?: GlyphName
  initials?: string
  lines?: string[]
  face?: 'grotesk' | 'slab' | 'script' | 'condensed'
}

export interface MenuItem {
  id: string
  name: string
  desc: string
  /** Cents. */
  price: number
  /**
   * What to PRINT instead of the price.
   *
   * A service quoted at "$2,000-10,000+" has no single price. `price` still
   * holds the low bound so the data stays sortable and comparable, but showing
   * it alone would read as a fixed fee and understate the job by a factor of
   * five.
   */
  priceLabel?: string
  popular?: boolean
  tags?: string[]
  options?: MenuOptionGroup[]
  /**
   * Picture of the dish, saved locally under /food.
   *
   * Two provenances, and the difference is declared rather than hidden:
   *  - the vendor's OWN photo, taken from their own listing (default)
   *  - a generated illustration, where the vendor publishes no photo at all
   *
   * A generated image is built from research into how THAT restaurant actually
   * plates THAT dish, but it is still not a photograph of the plate a customer
   * will be handed. So it is labelled in the UI. Passing one off as the
   * vendor's own would be the same class of wrong as an invented price.
   */
  imageUrl?: string
  /** True when imageUrl is a generated illustration, not the vendor's photo. */
  imageIsIllustration?: boolean
}

export interface MenuOptionGroup {
  id: string
  name: string
  required?: boolean
  max?: number
  choices: { id: string; name: string; price: number }[]
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export interface Brand {
  id: string
  vendorId: string
  name: string
  /** Home-screen label, as it appears on the operator's existing hub. */
  iconLabel: string
  cuisine: string
  tagline: string
  logo: Logo
  /** Estimate by category. Not sourced from the operator. */
  prepMinutes: number
  menu: MenuCategory[]
  /** Their own site, where one exists. */
  site?: string
  /** A real ordering link (Toast, their own checkout), where one exists. */
  orderUrl?: string
  phone?: string
  address?: string
  /** Set when a whole menu is triangulated rather than published at source. */
  pricesEstimated?: string
  /**
   * Set when no menu is published anywhere. The brand still gets an icon and a
   * page, but shows how to reach them instead of an invented menu — and three
   * of these are not restaurants at all.
   */
  contactOnly?: string
  /**
   * Set where the business name and the ported menu plainly disagree — the old
   * site tagged all 25 as `kind:"food"`, so a tax-prep firm and a sneaker brand
   * both ended up with restaurant menus. Surfaced in the UI rather than hidden,
   * because shipping a credit-repair company selling brisket would embarrass
   * the operator in front of his own tenants.
   */
  needsOwnerReview?: string
  /**
   * Priced work that is QUOTED, not bought. Suppresses add-to-cart everywhere:
   * a $650 website must never end up in a cart next to a hot dog, and the
   * checkout must never try to charge one. The string explains how to start.
   */
  quoteOnly?: string
  clip?: { src?: string; poster?: string; href?: string; credit: string; platform?: string }
  /** A name-only seat from the operator's roster. Kept off the catalogue page. */
  rosterOnly?: boolean
  /** Published contact address, where the business publishes one. */
  email?: string
  /** What this business gives BEASTY members. See the Seed note. */
  offers?: { welcome?: string; loyalty?: string; mock?: boolean }
  /**
   * Line above the menu. Every partner carries one: the list is a curated
   * selection, not their full menu, and the customer should be told that
   * before they wonder where the rest went.
   */
  menuNote?: string
  /**
   * Replaces the generic "they also take orders on X" footer. Per-brand
   * because the reason to visit a partner's own site differs — only one of
   * them ships frozen pies.
   */
  siteNote?: string
  /** Button label on a contact-only brand. Defaults to "Open their page". */
  siteCta?: string
  /**
   * Dietary descriptors the kitchen states about itself — "Halal", "Vegan",
   * "Gluten free".
   *
   * These are the kitchen's own description and are rendered as plain tags.
   * They must NEVER be rendered as a certification seal, and no certifying
   * body may be named here. A customer who keeps halal or has an allergy is
   * relying on this, and a stock "CERTIFIED" badge over an uncertified kitchen
   * is the one kind of wrong that actually hurts someone. If a kitchen ever
   * does hold a real certificate, that needs its own field carrying the
   * certifier's name so it can be checked, not this one.
   */
  dietary?: string[]
  /**
   * A partner perk — a discount this business honours for customers who came
   * from here.
   *
   * `headline` must state what EVERY customer is guaranteed. A range like
   * "10-25% off" reads as 25% to everyone, and whoever gets 10% feels
   * short-changed at the counter — which lands on the partner, not on us. Lead
   * with the floor and put the upside in `detail`.
   */
  perk?: { headline: string; detail: string }
}

export interface Vendor {
  id: string
  name: string
  /** Populated once the vendor finishes Stripe Connect onboarding. */
  stripeAccountId: string | null
  payoutsEnabled: boolean
  /**
   * Sales tax charged on this vendor's food, in basis points.
   *
   * California charges prepared-food tax at the SELLER's location, not the
   * buyer's, so this belongs to the vendor and not to the order. A cart
   * spanning Berkeley and Vallejo is genuinely taxed at two different rates.
   */
  taxBps: number
  /**
   * Their posted prices already contain sales tax. Checkout must not add it a
   * second time — doing so overcharges the customer on every line.
   */
  taxIncluded: boolean
}

/**
 * Combined state + county + district rates by city, in basis points.
 *
 * THESE ARE FROM CDTFA. Every rate below is transcribed from "California City &
 * County Sales & Use Tax Rates", effective 1 July 2026, and each was read at the
 * source twice by different people before it went in — last confirmed
 * 2026-08-09. The "confirm before turning payments on" gate this comment used to
 * carry is met, for these cities only.
 *
 * Two of the four rates this table already held were wrong, both in the
 * direction that costs the vendor: Oakland sat at 1025 against a real 1075, and
 * Pinole at 975 against a real 1025. Every Oakland and Pinole order would have
 * under-collected. That is why a plausible-looking rate is not good enough here
 * — the shortfall is the vendor's liability, not ours, and nothing in the app
 * surfaces it.
 *
 * They expire. CDTFA republishes quarterly and district taxes change by local
 * vote, so a rate that is right in July is not self-evidently right in October.
 * Re-read the source; do not carry these forward on trust.
 *
 * A city NOT listed here still falls to `DEFAULT_TAX_BPS`, the California
 * statewide minimum, and so still under-collects — for most Bay Area cities by
 * two to three points. That is deliberately the safest wrong answer for a vendor
 * whose rate we do not hold: it shows up as a shortfall the operator can settle,
 * rather than as an overcharge already taken off a customer's card. Guessing a
 * city in would trade that for the one error we cannot undo.
 */
/*
  ONE definition, exported, because there were three.

  This, FALLBACK_TAX_BPS in lib/tax.ts and another in server/index.ts all read
  725 independently, and none imported the others — so if the California
  statewide minimum ever moved, two of the three would have gone stale in
  silence, and the stale one that matters is the server's, because that is the
  copy that charges a card. It lives here because lib/tax already imports from
  this file; the reverse would be a cycle.
*/
export const DEFAULT_TAX_BPS = 725
const CITY_TAX_BPS: Record<string, number> = {
  Berkeley: 1025,
  Oakland: 1075,
  Vallejo: 925,
  Pinole: 1025,
  Brentwood: 875,
  Livermore: 1025,
  'San Jose': 1000,
  Pittsburg: 925,
  Dublin: 1025,
  /*
    Matching is by substring, so a STREET can impersonate a city. The live risk
    is the Las Vegas partner in LOCAL_SEED: Las Vegas's best-known street is
    Fremont Street, and an address on it would be taxed at Fremont, California's
    rate — on a vendor California cannot tax at all. No Nevada key can catch
    that, because the address would genuinely contain "Fremont".
  */
  Fremont: 1025,
  Sunnyvale: 975,
  Richmond: 975,
  Hayward: 1075,
  'San Leandro': 1075,
  /*
    Alameda is LAST and the position is load-bearing. `taxBpsFor` returns the
    first key the address contains, and "Alameda" is a county name and a street
    name ("The Alameda", San Jose) as well as a city. Checked early it would bill
    a San Jose address at Alameda's 10.75% — an overcharge, the direction this
    file exists to avoid. Every other Alameda County city sits above it and takes
    the match first.
  */
  Alameda: 1075,
}

function taxBpsFor(address?: string): number {
  if (!address) return DEFAULT_TAX_BPS
  for (const [city, bps] of Object.entries(CITY_TAX_BPS)) {
    if (address.includes(city)) return bps
  }
  return DEFAULT_TAX_BPS
}

interface Seed {
  logoTemplate?: LogoTemplate
  logoGlyph?: GlyphName
  logoLines?: string[]
  logoFace?: 'grotesk' | 'slab' | 'script' | 'condensed'
  logoAccent?: string
  logoInitials?: string
  slug: string
  name: string
  label: string
  cuisine: string
  tagline: string
  color: string
  icon: string
  prep: number
  category: string
  items: [string, string, number, string?][]
  review?: string
  /** A page of theirs that actually resolves. Verified before it goes in. */
  site?: string
  /** Stocked subset, by item name. Omit to offer the whole menu. */
  offer?: string[]
  /** Replaces the generic "they also take orders on X" footer. */
  siteNote?: string
  /** Button label on a contact-only brand. */
  siteCta?: string
  /** Posted prices already contain sales tax. */
  taxIncluded?: boolean
  /** Kitchen's own dietary description. Never a certification claim. */
  dietary?: string[]
  /** Partner discount. Headline states the guaranteed floor. */
  perk?: { headline: string; detail: string }
  /**
   * What this business gives BEASTY members.
   *
   * `welcome` is once, on a customer's first visit. `loyalty` is every visit,
   * for as long as their membership is active. Both are the business's own
   * commitment, so both stay empty until that business has actually agreed one
   * — an offer printed on a partner's page is a promise made in their name.
   */
  offers?: { welcome?: string; loyalty?: string; mock?: boolean }
  groups?: ServiceGroup[]
  /**
   * Priced work that is QUOTED, not bought. Suppresses add-to-cart everywhere:
   * a $650 website must never end up in a cart next to a hot dog, and the
   * checkout must never try to charge one. The string is shown to explain how
   * to actually start.
   */
  quoteOnly?: string
  clip?: { src?: string; poster?: string; href?: string; credit: string; platform?: string }
}

/** name, description, low bound in cents, printed range. */
type ServiceItem = [string, string, number, string]

interface ServiceGroup {
  name: string
  items: ServiceItem[]
}

/** Straight transcription of the source hub. Prices are cents. */
const SEED: Seed[] = [
  {
    slug: 'dingdongtogo', name: 'DingDongtogo', label: 'DingDongtogo',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Delivery bundles', tagline: 'Delivery from the kitchen to your door',
    color: '#F26B21', icon: 'dingdongtogo', prep: 20, category: 'Bundles',
    items: [
      ['Family Dinner Bundle', 'Entrée, two sides, four drinks', 4800],
      ['Lunch Special', 'Entrée, side, drink', 1400],
      ['Wing Party Pack', '24 wings, two sauces', 3600],
      ['Dessert Add-On', "Chef's choice sweet", 700],
    ],
  },
  {
    slug: 'share-scan', name: 'Share & Scan', label: 'Share & Scan',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Grab-and-go deli', tagline: 'Grab-and-go bites and cold drinks',
    color: '#3B82F6', icon: 'share-scan', prep: 6, category: 'Grab & Go',
    items: [
      ['Chicken Caesar Wrap', 'Romaine, parmesan, garlic dressing', 1100],
      ['Turkey Club Box', 'Sandwich, chips, cookie', 1300],
      ['Fruit Cup', 'Seasonal, fresh cut', 600],
      ['Bottled Lemonade', 'House made, 16 oz', 400],
    ],
  },
  {
    slug: 'lol-catering', name: 'LOL Catering', label: 'LOL Catering',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Event catering', tagline: 'Catering for parties, offices, and pop-ups',
    color: '#7B2FF7', icon: 'lol-catering-featured', prep: 48, category: 'Catering',
    items: [
      ['Taco Bar — 25 Guests', 'Three proteins, all the fixings', 42500],
      ['Soul Food Tray — 15 Guests', 'Entrée plus three sides', 30000],
      ['Breakfast Spread — 20 Guests', 'Pastries, fruit, egg trays, coffee', 26000],
      ['Dessert Table', 'Assorted sweets for 25', 17500],
    ],
  },
  {
    slug: 'hotboys-chicken', name: 'HotBoys Chicken', label: 'HotBoys Chicken',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Nashville hot chicken', tagline: 'Nashville-style hot chicken, fried to order',
    color: '#F2B705', icon: 'hotboys', prep: 15, category: 'Menu',
    items: [
      ['Hot Chicken Sandwich', 'Buttermilk thigh, slaw, comeback sauce', 1350],
      ['3 Piece Tender Combo', 'Tenders, fries, choice of heat', 1500],
      ['Loaded Hot Fries', 'Chopped chicken, cheese, ranch drizzle', 1100],
      ['Mac & Cheese', 'Baked, four cheese', 600],
    ],
  },
  {
    slug: 'butter-pecan',    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: 'Buy a dozen and get half a dozen free.',
      loyalty: 'Buy 2, get 1 cookie free, every visit.',
    },
    site: 'https://www.butterpecanbakeshop.com/',
 name: 'Butter Pecan', label: 'Butter Pecan',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Ice cream & cobbler', tagline: 'Small-batch ice cream and cobblers',
    color: '#8A5A2B', icon: 'butter-pecan', prep: 6, category: 'Sweets',
    items: [
      ['Butter Pecan Pint', 'The house classic, roasted pecans', 1200],
      ['Peach Cobbler Cup', 'Warm cobbler, vanilla scoop', 900],
      ['Banana Pudding', 'Wafers, fresh banana, whipped cream', 800],
      ['Two Scoop Waffle Cone', 'Any two flavors', 750],
    ],
  },
  {
    slug: 'baked-blooms', name: 'Baked Blooms', label: 'Baked Blooms',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Bakery & flowers', tagline: 'Fresh bakes and flower boxes',
    color: '#D06A8C', icon: 'baked-blooms', prep: 20, category: 'Bakery',
    items: [
      ['Bloom Box + 6 Cookies', 'Seasonal blooms with warm cookies', 4500],
      ['Half Dozen Cupcakes', "Baker's choice frosting", 2400],
      ['Cinnamon Roll Tray', 'Four jumbo rolls, cream cheese glaze', 1800],
      ['Brownie Flight', 'Fudge, walnut, cheesecake swirl', 1200],
    ],
  },
  {
    slug: 'wildfork-foods', name: 'WildFork Foods', label: 'WildFork Foods',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Butcher', tagline: 'Butcher-cut proteins, ready to cook',
    color: '#C0392B', icon: 'wildfork', prep: 12, category: 'Butcher',
    items: [
      ['Ribeye 2-Pack', '12 oz each, hand cut', 3200],
      ['Chicken Breast Family Pack', '4 lb, boneless skinless', 1900],
      ['Wild Caught Salmon', 'Two 6 oz fillets', 2100],
      ['Shrimp Skewers', 'Six garlic herb skewers', 1600],
    ],
  },
  {
    slug: 'vegan-mob', name: 'Vegan Mob', label: 'Vegan Mob',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Plant-based BBQ', tagline: 'Plant-based BBQ and soul food',
    color: '#3C9D3C', icon: 'vegan-mob', prep: 16, category: 'Menu',
    items: [
      ['Mobfather Burrito', 'BBQ jackfruit, mac, greens', 1700],
      ['Smoked Brisket Plate', 'Two sides, cornbread', 2200],
      ['Vegan Gumbo', 'Okra, mushroom sausage, rice', 1500],
      ['Mac & Greens', 'Cashew cheese mac, collards', 1100],
    ],
  },
  {
    slug: 'boss-burgers', name: 'Boss.Burgers', label: 'Boss.Burgers',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Smash burgers', tagline: 'Smash burgers with attitude',
    color: '#B3261E', icon: 'boss-burgers', prep: 12, category: 'Burgers',
    items: [
      ['Boss Double Smash', 'Two patties, American, boss sauce', 1400],
      ['Bacon Jam Burger', 'Smoked bacon jam, aged cheddar', 1600],
      ['Crispy Chicken Burger', 'Pickles, spicy mayo', 1300],
      ['Seasoned Fries', 'Large, house seasoning', 550],
    ],
  },
  {
    slug: 'ally-virtual', name: 'Ally Virtual', label: 'Ally Virtual',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'All-day breakfast', tagline: 'Breakfast all day, coffee bar included',
    color: '#5A4FCF', icon: 'ally-virtual', prep: 12, category: 'Breakfast',
    items: [
      ['Steak & Egg Burrito', 'Potatoes, cheese, salsa roja', 1300],
      ['Pancake Stack', 'Three buttermilk cakes, whipped butter', 1100],
      ['Breakfast Sandwich', 'Egg, bacon, cheddar, brioche', 900],
      ['Iced Latte', 'Double shot, 16 oz', 550],
    ],
  },
  {
    slug: 'gao-viet-kitchen', name: 'Gao Viet Kitchen', label: 'Gao Viet Kitc…',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Vietnamese', tagline: 'Vietnamese comfort, made fresh daily',
    color: '#1E7A6B', icon: 'gao-viet', prep: 16, category: 'Menu',
    items: [
      ['Phở Tái', 'Rare steak, 12-hour broth', 1600],
      ['Bánh Mì Thịt', 'Grilled pork, pâté, pickled veg', 1100],
      ['Bún Chả', 'Grilled pork, vermicelli, herbs', 1700],
      ['Fresh Spring Rolls', 'Two rolls, peanut sauce', 800],
    ],
  },
  /*
    BEASTY H20 CO — THE OPERATOR'S OWN BUSINESS, AND ITS MENU HERE IS INVENTED.

    Researched 2026-08-05. Nothing below was ever published by them:

    - Their Instagram is @beastyh2oco (1,334 followers, 7,340 following, bio
      "Changing lives with Kangen"). It is a REPURPOSED PERSONAL ACCOUNT — the
      reachable grid runs Jan 2019 to Mar 2022 and not one post mentions water,
      Kangen, bottles, gallons, bowls or a price. There are no product
      photographs anywhere, which is why none were added.
    - beastyh2oco.com is registered but DEAD: every path 301s away to unrelated
      sites. Only the homepage was ever archived, and its checkout carried a
      Stripe TEST key, so it never took a real payment.
    - No price of any kind exists on any source. "Case of 12", "5 Gallon
      Refill", "Pet Bowl Bundle" and "Single Bottle" came from the original
      scaffold, not from them. Their own word for the product is "bags".
    - The tagline "Alkaline water for you and your dog" also appears nowhere in
      their material.
    - Their archived site says they serve EAST Contra Costa — Bay Point,
      Pittsburg, Antioch, Oakley, Brentwood, Discovery Bay — not Richmond.
      Richmond is the owner's own origin, not the stated service area.

    It is an Enagic/Kangen business, and their marketing makes health claims
    ("the best and healthiest option for drinking water", "many beneficial
    health properties") that are NOT established. None of it is reproduced
    here, and none of it should be: it would be this app asserting a health
    claim on a real company's behalf.

    Left in place with the prices flagged rather than deleted, because it is the
    operator's own company and he is the one who knows the real numbers.
  */
  {
    slug: 'beasty-h20', name: 'Beasty H20 Co', label: 'Beasty H20 Co',
    cuisine: 'Alkaline water', tagline: 'Kangen water, delivered',
    color: '#2C8ED6', icon: 'beasty-h20', prep: 5, category: 'Water',
    // The only page of theirs that resolves. beastyh2oco.com is dead.
    site: 'https://www.instagram.com/beastyh2oco/',
    siteNote: 'See Beasty H20 on Instagram (@beastyh2oco)',
    review:
      'these prices and item names were never published by Beasty H20 and need confirming. Their own word for the product is "bags", and no price appears on their site or Instagram.',
    items: [
      ['Case of 12', '500ml bottles', 2800],
      ['5 Gallon Refill', 'Bring your jug or buy one', 1500],
      ['Pet Bowl Bundle', 'Travel bowl plus 6 bottles', 2400],
      ['Single Bottle', 'Grab and go', 300],
    ],
  },
  {
    slug: 'winkydinkydogs', name: 'WinkyDinkyDogs', label: 'WinkyDinkyD…',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Hot dogs', tagline: 'Gourmet hot dogs, loaded up',
    color: '#E8452C', icon: 'winky-dinky', prep: 10, category: 'Dogs',
    items: [
      ['Winky Classic', 'All beef dog, mustard, onions', 800],
      ['Chili Cheese Dog', 'House chili, cheddar, jalapeño', 1100],
      ['Bacon Wrapped Street Dog', 'Peppers, onions, crema', 1200],
      ['Chili Cheese Fries', 'Full basket', 900],
    ],
  },
  {
    slug: 'boba', name: 'Boba', label: 'Boba',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Boba tea', tagline: 'Milk teas, fruit teas, and toppings',
    color: '#9C6644', icon: 'boba', prep: 8, category: 'Drinks',
    items: [
      ['Classic Milk Tea', 'Black tea, tapioca pearls', 650],
      ['Taro Milk Tea', 'Real taro, creamy', 700],
      ['Mango Green Tea', 'Fresh mango, popping boba', 700],
      ['Brown Sugar Latte', 'Fresh milk, warm pearls', 750],
    ],
  },
  {
    slug: 'masa',    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: 'A free tamale or street taco with each $15 or more spent. Unlimited on your first visit.',
      loyalty: 'A free can of soda with any purchase, any visit.',
    },
    site: 'https://www.ordermasatamalesandtacos.com/',
 name: 'Masa', label: 'Masa',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Mexican', tagline: 'Handmade tortillas and street tacos',
    color: '#D97706', icon: 'masa', prep: 12, category: 'Menu',
    items: [
      ['Taco Trio', 'Three tacos, choice of meat', 1300],
      ['Quesabirria Plate', 'Three tacos with consomé', 1700],
      ['Burrito', 'Rice, beans, salsa verde', 1400],
      ['Chips & Salsa', 'Fresh fried, two salsas', 600],
    ],
  },
  {
    slug: 'waffles-cream', name: 'Waffles & Cream', label: 'Waffles & Cr…',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Waffles & ice cream', tagline: 'Waffles, cones, and cold scoops',
    color: '#EAB308', icon: 'waffles-cream', prep: 12, category: 'Menu',
    items: [
      ['Chicken & Waffles', 'Crispy tender, maple butter', 1600],
      ['Waffle Sundae', 'Two scoops, whipped cream', 1200],
      ['Strawberry Waffle', 'Fresh berries, cream', 1100],
      ['Milkshake', 'Hand spun, any flavor', 800],
    ],
  },
  {
    slug: 'high-scores', name: 'High Scores', label: 'High Scores',
    review:
      'These prices and items were transcribed from goodneighborbuilder.com, which this file itself calls placeholder-looking, and have never been confirmed with the business. Treat the menu as a draft of what they might sell, not as their prices \u2014 including any ingredient or dietary wording, which nobody here has verified with the kitchen.',
    cuisine: 'Arcade snacks', tagline: 'Arcade snacks, pizza, and slushies',
    color: '#6D28D9', icon: 'high-scores', prep: 10, category: 'Snacks',
    items: [
      ['Pepperoni Personal Pizza', 'Eight inch, crispy crust', 1100],
      ['Corn Dog Basket', 'Two dogs, curly fries', 1000],
      ['Soft Pretzel', 'Warm, salted, cheese dip', 700],
      ['Blue Raspberry Slushie', '24 oz, extra cold', 500],
    ],
  },
]

/** One line, every partner. Curated menus are the whole model here. */
export const MENU_NOTE = "Choose from this week's favorites!"

const fromSeed = (s: Seed): Brand => ({
  id: `b_${s.slug.replace(/-/g, '')}`,
  vendorId: `v_${s.slug.replace(/-/g, '')}`,
  name: s.name,
  iconLabel: s.label,
  cuisine: s.cuisine,
  tagline: s.tagline,
  logo: s.icon
    ? { imageUrl: `/icons/${s.icon}.webp`, bg: s.color, fg: '#ffffff' }
    : // No verifiable artwork: draw a generated mark rather than link a
      // missing file. Seeds may art-direct it (template, face, glyph, lines);
      // the untouched default stays the plain monogram.
      {
        bg: s.color,
        fg: '#ffffff',
        template: (s.logoTemplate ?? 'monogram') as LogoTemplate,
        glyph: s.logoGlyph as GlyphName | undefined,
        lines: s.logoLines,
        accent: s.logoAccent,
        initials:
          s.logoInitials ??
          s.name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
        face: (s.logoFace ?? 'grotesk') as NonNullable<Logo['face']>,
      },
  prepMinutes: s.prep,
  needsOwnerReview: s.review,
  site: s.site,
  siteNote: s.siteNote,
  quoteOnly: s.quoteOnly,
  clip: s.clip,
  // "This week's favourites" is a food line. A service catalogue is not a
  // rotating special, and nothing about it changes weekly.
  //
  // Nor is it a line to put over a menu the business never published: on a
  // brand flagged for owner review it sat directly above items invented for
  // scaffolding, presenting them as this week's picks.
  menuNote:
    s.quoteOnly || s.review ? undefined : s.items.length > 0 ? MENU_NOTE : undefined,
  /*
    Offers travel from the seed here too, not only from the roster and local
    lists. Without this the operator's sheets for Butter Pecan and Masa were set
    in the data and rendered nowhere — the same silent gap `address` and the
    roster's own `offers` each had, which is three times now that a field has
    been added to a seed and forgotten in one of the three mappings.
  */
  offers: s.offers,
  menu: s.groups
    ? s.groups.map((g, gi) => ({
        id: `c_${s.slug.replace(/-/g, '')}_${gi + 1}`,
        name: g.name,
        items: g.items
          .map(([name, desc, price, priceLabel], i) => ({
            id: `i_${s.slug.replace(/-/g, '')}_${gi + 1}_${i + 1}`,
            name,
            desc,
            price,
            priceLabel,
          }))
          /*
            The stock list applies here too.

            This filter existed only on the `items` branch below, so any brand
            using `groups` silently offered its ENTIRE menu no matter what
            `offer` said. That is not a cosmetic difference: it put six of The
            Yard's cocktails into a shared delivery cart with no age check, from
            a business whose own licence in this file is type 47 — on-premises.
          */
          .filter((it) => !s.offer || s.offer.includes(it.name)),
      }))
    : [
    {
      id: `c_${s.slug.replace(/-/g, '')}`,
      name: s.category,
      /*
        `offer` is the stocked subset. The full researched menu stays in the
        data on purpose — it was read off each business's own site and is
        expensive to reproduce — so widening the offer later is a one-line
        change rather than another round of research. Item ids stay tied to
        the item's position in the FULL list, so trimming the offer never
        silently repoints an id at a different dish.
      */
      items: s.items
        .map(([name, desc, price, photo], i) => ({
          id: `i_${s.slug.replace(/-/g, '')}_${i + 1}`,
          name,
          desc,
          price,
          imageUrl: photo ? `/food/${photo.replace(/^~/, '')}.webp` : undefined,
        // A leading ~ in the seed marks the picture as an illustration.
        imageIsIllustration: photo ? photo.startsWith('~') : undefined,
        }))
        .filter((it) => !s.offer || s.offer.includes(it.name)),
    },
  ],
})

/**
 * Verified local businesses first — they are the real ones, so they take the
 * front of the grid. The ported hub entries follow.
 */
export const BRANDS: Brand[] = [
  /*
    Roster seeds and researched seeds are BOTH LocalSeed, so they go through one
    mapping. They used to have two, listing the passthrough fields separately,
    and the drift was not hypothetical: `address` was missing from the roster
    list for weeks while X Noodles carried a published street address that never
    reached its page, `offers` was missing until Breaktime Tea's happy hour
    rendered nowhere, and `siteCta` was missing when Magic Juan's "Book on
    Booksy" button came out reading "Open their page".

    Three of the same bug in one file is a sign the shape is wrong rather than
    that people keep being careless, so there is one list now. A roster brand
    differs from a researched one by `rosterOnly` and by nothing else.
  */
  ...[
    ...ROSTER_SEED.map((s) => [s, true] as const),
    ...LOCAL_SEED.map((s) => [s, false] as const),
  ].map(([s, rosterOnly]) => ({
    ...fromSeed(s as unknown as Seed),
    site: s.site,
    orderUrl: s.orderUrl,
    phone: s.phone,
    address: s.address,
    pricesEstimated: s.pricesEstimated,
    contactOnly: s.contactOnly,
    siteNote: s.siteNote,
    siteCta: s.siteCta,
    dietary: s.dietary,
    perk: s.perk,
    email: s.email,
    offers: s.offers,
    ...(rosterOnly ? { rosterOnly: true as const } : {}),
  })),
  ...SEED.map(fromSeed),
]

/** Each business is independent and is paid separately. */
export const VENDORS: Vendor[] = [...LOCAL_SEED, ...SEED].map((s) => ({
  id: `v_${s.slug.replace(/-/g, '')}`,
  name: s.name,
  stripeAccountId: null,
  payoutsEnabled: false,
  taxBps: taxBpsFor((s as { address?: string }).address),
  taxIncluded: (s as { taxIncluded?: boolean }).taxIncluded === true,
}))

/*
  Kitchens we can point a PROSPECTIVE PARTNER at.

  Researched entries only — LOCAL_SEED, the businesses whose menus and prices
  were sourced from their own published material. The ported hub entries are
  excluded on purpose: counting them takes the figure from 11 to 27 and more
  than doubles the size of the network in a pitch, on the strength of menus
  nobody confirmed. Overstating that to someone deciding whether to join is the
  one number here it would be worst to get wrong.

  Shared so the Reserve screen and the landing page count the same way — two
  places quoting different figures is the kind of thing a partner notices.
*/
const RESEARCHED = new Set(LOCAL_SEED.map((s) => `b_${s.slug.replace(/-/g, '')}`))

export const LISTED_KITCHENS = BRANDS.filter(
  (b) =>
    RESEARCHED.has(b.id) &&
    !b.contactOnly &&
    // A software practice quoting projects is not a business a food truck is
    // being invited to stand alongside.
    !b.quoteOnly &&
    b.menu.some((c) => c.items.length > 0),
)

export const brandById = (id: string) => BRANDS.find((b) => b.id === id)
/* Look one up by its seed slug. Ids are derived (`b_` + de-hyphenated slug), so
   spelling one out by hand elsewhere silently breaks if a slug ever changes. */
export const brandIdBySlug = (slug: string) =>
  BRANDS.find((b) => b.id === `b_${slug.replace(/-/g, '')}`)?.id ?? null
export const vendorById = (id: string) => VENDORS.find((v) => v.id === id)
