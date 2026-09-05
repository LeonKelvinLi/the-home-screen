import type { GlyphName } from './glyphs'
import { LOCAL_SEED } from './localBrands'
import type { BrandPanel } from './localBrands'
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
  /**
   * A wide wordmark to head the page with, INSTEAD of the square icon.
   *
   * His ask for Marina Bay Media: "put that on their page on the top the whole
   * thing that says Marina Bay media rather than the icon on the page". A tile
   * has to be square and their lockup is 6:1, so the icon can only ever carry
   * the MBM monogram — the page has room for the name and the strapline, and a
   * business shown their own page should see the whole thing.
   */
  pageMark?: string
  /** Their own site, where one exists. */
  site?: string
  /**
   * Still wanted: a real website, even though `site` points somewhere.
   *
   * The red outline is the operator's PROSPECT LIST — "the ones without a web
   * presence" — so it has to survive a stopgap link. Lucky Three Seven's only
   * link is a GoFundMe he asked to attach "for now", and he followed it with
   * "They need a website. Note". Deriving the outline from `!site` alone would
   * have quietly taken them off the list the moment the stopgap went in.
   */
  needsSite?: true
  /** The paid icon glow. See LocalSeed.glow. */
  glow?: true
  /** One photograph of the place, ours to serve. See LocalSeed.photo. */
  photo?: { src: string; credit: string; alt: string }
  /** Several, swiped through. See LocalSeed.photos. */
  photos?: { src: string; credit: string; alt: string }[]
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
   * Their Instagram handle, without the @, and only where he has approved it.
   *
   * HIS ASK, 2026-08-29: "do you think these pages should have a direct
   * Instagram link? If so, we can make it an extra feature on a higher tier
   * membership... You don't have to do it to all of them. We just need to put
   * it on a few good ones as an example."
   *
   * So this is DELIBERATELY SPARSE. It is a paid feature he sells, not a field
   * to fill in everywhere the research happened to turn up a handle — several
   * seeds mention one in siteNote and do not carry this, which is the
   * difference between knowing a handle and having sold the button.
   */
  instagram?: string
  /** Drop-downs on their page: pictures, or a list of shops. */
  panels?: BrandPanel[]
  /** Opening hours, one line, as published. See localBrands.ts. */
  hours?: string
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
  /** A wide wordmark to head the page with, instead of the square icon. */
  pageMark?: string
  /** Keep them on the red-outline prospect list even though `site` is set. */
  needsSite?: true
  /** The paid icon glow. See LocalSeed.glow. */
  glow?: true
  /** Stocked subset, by item name. Omit to offer the whole menu. */
  offer?: string[]
  /** Replaces the generic "they also take orders on X" footer. */
  siteNote?: string
  /** Their Instagram handle, without the @. See the Brand type above. */
  instagram?: string
  /** Drop-downs on their page: pictures, or a list of shops. */
  panels?: BrandPanel[]
  /** Opening hours, one line, as published. See localBrands.ts. */
  hours?: string
  /** Overrides the picks bar and forces it to render. See localBrands.ts. */
  menuNote?: string
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
  /** One photograph of the place. See LocalSeed.photo. */
  photo?: { src: string; credit: string; alt: string }
  /**
   * Several photographs, shown one at a time and swiped through — the first
   * is what you see, the rest are "when you scroll to the right", which is
   * how Glenn described where a second picture should go (2026-09-02, Sin
   * City Pits). Their own posts, ours to serve, same rule as `photo`.
   */
  photos?: { src: string; credit: string; alt: string }[]
  /*
    A STREET ADDRESS AND A PHONE, which Brand has carried all along and Seed
    could not set. It came up when he asked to "update page with address and
    link tree" for a kitchen in this file rather than in localBrands, and the
    first attempt wrote a `links` array that TypeScript accepted in one file
    and rejected in this one — the local seeds are not checked for excess
    properties and these are.
  */
  address?: string
  phone?: string
  /** Published contact address, where the business publishes one. */
  email?: string
  /** Their own site prices nothing: the page shows how to reach them instead of a menu. */
  contactOnly?: string
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
    slug: 'hotboys-chicken', name: 'World Famous Hotboys', label: 'HotBoys Chicken',
    site: 'https://worldfamoushotboys.com/',
    /*
      REDONE FROM THEIR OWN SITE, 2026-09-02. The four priced items that sat
      here were ported from goodneighborbuilder.com and never confirmed; their
      own site prices NOTHING — every menu favourite is a name and a
      description, and the prices live on their ordering platforms only. So
      the fiction is gone and the page says what they publish.

      "Nashville hot chicken" was our label. Theirs is "Oakland's Original
      Spicy Hot Fried Chicken", with "a nod to Nashville" — so the descriptor
      is theirs now. Seven locations, Oakland the flagship; the others are
      Sacramento, Walnut Creek, Hayward, Novato, and Carmel and Indianapolis
      in Indiana.
    */
    cuisine: 'Hot fried chicken', tagline: 'Oakland’s original spicy hot fried chicken',
    color: '#F2B705', icon: 'hotboys', prep: 15, category: 'Menu',
    address: '1601 San Pablo Ave, Oakland, CA 94612',
    email: 'dm@worldfamoushotboys.com',
    instagram: 'worldfamoushotboys',
    hours: 'Sun–Wed 9am–10pm, Thu 9am–midnight, Fri–Sat 9am–2am',
    contactOnly:
      'Oakland’s original spicy hot fried chicken — the sandwich, tenders, chicken and waffles, loaded fries and bonuts, at your heat level from Southern to HOT. Their own site publishes no prices; those are on their ordering page.',
    items: [],
  },
  {
    slug: 'baked-blooms', name: 'Baked Blooms', label: 'Baked Blooms',
    site: 'https://bakedblooms.com/',
    /*
      REDONE FROM THEIR OWN SITE, 2026-09-02. "Bakery & flowers" was wrong:
      the blooms are buttercream. They are a San Rafael "bouCAKEry" making
      cupcake bouquets, and the four ported items — cinnamon roll trays,
      brownie flights — do not exist on their menu. Their tiers are on their
      homepage and match their store's prices exactly.

      Their hours block is titled WINTER HOURS on a page selling a Summer
      Collection, read in September; the schedule is carried, the label is not.
      A visible theme error prints at the foot of every page — worth telling
      them. A second phone is published as a cell: 415.378.5020.
    */
    cuisine: 'Cupcake bouquets', tagline: 'Art you can eat — bespoke cupcake bouquets',
    color: '#D06A8C', icon: 'baked-blooms', prep: 20, category: 'Bakery',
    address: '2100 4th Street, Suite A, San Rafael, CA 94901',
    phone: '(415) 419-2646',
    email: 'sarah@bakedblooms.com',
    instagram: 'bakedblooms',
    hours: 'Tue–Sat 10am–2pm, Sun 10am–noon, closed Mon',
    items: [
      ['Small BouCAKE', 'Seven cupcakes', 5000],
      ['Medium BouCAKE', 'Twelve cupcakes', 7000],
      ['Large BouCAKE', 'Nineteen cupcakes', 11000],
      ['Extra Large BouCAKE', 'Twenty-four cupcakes', 13000],
      ['Dozen, boxed', '', 6500],
      ['Custom Arrangement', '', 5500, null, 'from $55'],
    ],
    siteNote: 'Local delivery Tue–Fri up to twenty miles, priced at checkout.',
  },
  {
    slug: 'wildfork-foods', name: 'Wild Fork Foods', label: 'WildFork Foods',
    site: 'https://wildforkfoods.com/',
    /*
      REDONE FROM THEIR OWN SITE, 2026-09-02. Not a butcher: a national
      frozen meat and seafood chain that ships, with stores behind a locator.
      The four ported items were never theirs. Their catalogue prices render
      only in the browser and several are per pound with the final price by
      weight, so the two here carry that as their label. No address is
      published on the site itself.
    */
    cuisine: 'Meat and seafood', tagline: 'Frozen meat and seafood, shipped',
    color: '#8B1E2D', icon: 'wildfork', prep: 5, category: 'Menu',
    phone: '(833) 300-9453',
    email: 'talk@wildforkfoods.com',
    instagram: 'wildforkfoods',
    items: [
      ['Dry 10/20 Sea Scallops', 'Ten to twenty pieces, one pound', 2398, null, '$23.98 / lb'],
      ['USDA Choice Center Cut Filet Mignon', 'Two pieces, about 0.85 lb; final price by weight', 3698, null, '$36.98 / lb'],
    ],
    siteNote: 'A national chain; find a store or order for delivery on their site.',
  },
  {
    slug: 'vegan-mob', name: 'Vegan Mob', label: 'Vegan Mob',
    site: 'https://veganmob.biz/',
    /*
      THESE ARE NOW THEIR OWN PRICES. What was here before was transcribed from
      goodneighborbuilder.com and this file said so — four dishes and four
      numbers nobody had ever checked. Every line below is off veganmob.biz's
      own menu page, read on 2026-08-28.

      HE FILED THIS ONE "NEEDS WEBSITE", AND IT WAS THE FIFTH SUCH LABEL THIS
      WEEK THAT WAS WRONG. veganmob.biz is live; it sits behind a Cloudflare
      managed challenge that returns 403 to anything with a browser user-agent
      and 200 to a plain curl one. Anyone checking a site the obvious way sees a
      403 and concludes it is dead. That is almost certainly what happened to
      the other four, and it is worth checking a "dead" site both ways before
      telling him it is dead.

      NO ADDRESS IS CARRIED HERE, and it would be wrong if it were: their header
      and structured data say 9 Grand Ave, Oakland; the About paragraph on the
      same page says 1199 El Camino Real, San Bruno; their Instagram says 496
      Lake Park Ave, Oakland. Three addresses, one business, and the ordering
      flow names the entity VEGAN MOB SAN BRUNO LLC. Somebody has to ask them.

      Their three five-star testimonials cite no platform at all and are not
      reproduced.
    */
    /*
      "Update page with address and link tree" — his instruction, 2026-08-28,
      and it was read as the line above it and lost.

      THE ADDRESS IS THE ONE THEY PUBLISH THEMSELVES ON INSTAGRAM, which is
      what he was looking at when he asked. It is not the only one they give:
      their website's header and structured data say 9 Grand Ave, Oakland, the
      About paragraph on that same page says 1199 El Camino Real in San Bruno,
      and the ordering flow calls the entity VEGAN MOB SAN BRUNO LLC. Three
      addresses, one business. His is shown and the disagreement is said out
      loud rather than hidden behind a choice nobody can check.
    */
    address: '496 Lake Park Ave, Oakland, CA 94610',
    phone: '(415) 513-5120',
    /*
      THE LINKTREE GOES IN siteNote, because `links` is not a field.

      It was written as `links: [{ label, href }]` first and TypeScript said
      nothing — the seed arrays are not checked for excess properties, so an
      invented field compiles, renders nothing, and looks done. The house
      pattern for a second address is a sentence in siteNote; Pawddle carries
      its Linktree the same way.
    */
    siteNote:
      'Their links also live at linktr.ee/veganmob1. Their own site gives two other addresses — 9 Grand Ave, Oakland and 1199 El Camino Real, San Bruno — so it is worth asking which room is open.',
    cuisine: 'Plant-based BBQ', tagline: 'Plant-based BBQ and soul food',
    color: '#3C9D3C', icon: 'vegan-mob', prep: 16, category: 'Menu',
    items: [
      ['Mob Plate', 'Their published price, from', 2530],
      ['Combo Plate', 'Their published price', 4400],
      ['Mob Burger with Fries', 'Their published price', 2090],
      ['Barbequito', 'Their published price', 1870],
      ["Da' Renz Po' Boy", 'Their published price', 1760],
      ['Brisket', 'Their published price', 1430],
      ['Smackaroni', 'Their published price', 1210],
      ['Mob Fries', 'Their published price', 770],
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
    /* GLOW: the second paid Tier 3 sample, his ask of 2026-09-03. */
    glow: true,
    slug: 'gao-viet-kitchen', name: 'Gao Viet Kitchen', label: 'Gao Viet Kitchen',
    site: 'https://gaovietkitchen.com/',
    /*
      REDONE FROM THEIR OWN SITE, 2026-09-02, from their San Francisco menu.
      The ported items are gone. In their words: "We blend traditional
      Vietnamese flavors with a modern, high-energy dining experience built
      around creativity, cocktails, and good times."

      NO HOURS, and it is their page's doing: the summary line reads "Friday,
      Saturday, Sunday — 11:30 PM - 10:00 PM" (a PM typo) while the detail
      block on the same page says lunch 11:30–3 and dinner 5–10. A second
      restaurant is in San Mateo, 313 South San Mateo Drive, (650) 477-2524,
      and a San Jose one is "coming 2026".
    */
    cuisine: 'Vietnamese', tagline: 'Vietnamese flavours, cocktails and good times',
    color: '#0F5132', icon: 'gao-viet', prep: 15, category: 'Menu',
    address: '1900 Irving Street, San Francisco, CA 94122',
    phone: '(415) 610-4631',
    instagram: 'gaovietkitchen',
    items: [
      ['Bánh Hỏi Sharing Set', 'Woven vermicelli platters with herbs, lettuce, pickles and fish sauce', 5000],
      ['Wrap & Roll', 'Build-your-own fresh rolls: BBQ shrimp, grilled beef, nem nướng, crispy egg roll', 4200],
      ['Gao Roll Sampler', 'Phở roll, nem nướng rolls, shrimp rolls, tofu rolls, imperial rolls', 3400],
      ['Bánh Xèo', 'Turmeric coconut crêpe with five-spice pork belly, shrimp, jicama', 2700],
      ['Gỏi Cuốn Tôm', 'Shrimp spring rolls with peanut sauce', 1500],
      ['Phở Roll', 'Wok-tossed ribeye, garlic, ginger, onion, in a rice noodle sheet', 1800],
      ['Chả Giò', 'Imperial rolls: pork, wood ear mushroom, vermicelli, taro', 1600],
      ['Fish Sauce Chicken Wings', 'With Vietnamese coriander, garlic, chilli, jalapeño', 1700],
    ],
    offer: ['Bánh Xèo', 'Gỏi Cuốn Tôm', 'Phở Roll', 'Fish Sauce Chicken Wings'],
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
    slug: 'winkydinkydogs', name: 'Winky Dinky Dogs', label: 'WinkyDinkyDogs',
    site: 'https://winkydinkydogs.com/',
    /*
      REDONE FROM THEIR OWN SITE, 2026-09-02. Their whole menu is one JPEG —
      fourteen items and drinks, not a price on it — so the four ported prices
      were never theirs and are gone. Their address is published with no ZIP,
      and it is carried exactly as they write it rather than filled in.
    */
    cuisine: 'Hot dogs', tagline: 'Fresh. Delicious. Oakland.',
    color: '#C81E1E', icon: 'winkydinky', prep: 10, category: 'Menu',
    address: '325 19th Street, Oakland, CA',
    phone: '(510) 817-4673',
    email: 'info@winkydinkydogs.com',
    instagram: 'thewinkydinkydogs',
    hours: 'Mon–Fri 11am–8pm, Sat–Sun noon–6pm',
    contactOnly:
      'Dogs in beef, chicken, pork or vegan — the Original, the Mac N Chz, the Oaklandish with their chilli — plus a smash burger, a chicken sandwich, gumbo and loaded fries. Their menu is published without prices.',
    items: [],
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
    name: 'Masa Tamales & Taqueria', label: 'Masa',
    /*
      REDONE FROM THEIR OWN ORDERING SITE, 2026-09-02. The ported items are
      gone; these are their carryout menu. A trailing plus on their prices
      means it rises with the protein or option, so those carry a label. Their
      site is a Menufy ordering domain rather than one of their own, which is
      why needsSite — and its banner reads "Online Ordering Coming Soon!" on
      what is itself the ordering site, so checkout may be off.
    */
    cuisine: 'Mexican', tagline: 'Hand-crafted tamales and taqueria, El Cerrito',
    color: '#D97706', icon: 'masa', prep: 12, category: 'Menu',
    address: '10409 San Pablo Ave, El Cerrito, CA 94530',
    phone: '(510) 778-1463',
    hours: 'Daily 10am–10pm',
    needsSite: true,
    items: [
      ['Quesabirria', 'Three corn tortillas dipped in consommé, melted cheese, shredded beef, onion, cilantro', 1450, null, '$14.50+'],
      ['Street Taco', 'One taco on a handmade corn tortilla, your protein, onion and cilantro', 399, null, '$3.99+'],
      ['Baja Tacos', 'Beer-battered fish or shrimp, slaw, chipotle sour cream', 550],
      ['Burrito', 'Your protein with rice, beans, cheese, sour cream, guacamole', 1500, null, '$15.00+'],
      ['Combo Plate, Tamales', 'Two tamales or a protein with four tortillas, rice, beans, pico, guacamole', 1600, null, '$16.00+'],
      ['Wet Tamale', 'One tamale under warm red or green salsa, cotija and sour cream', 599, null, '$5.99+'],
      ['Pizza Birria', 'A thirteen-inch tortilla dipped in consommé, stuffed with birria and cheese', 2600, null, '$26.00+'],
    ],
    offer: ['Quesabirria', 'Street Taco', 'Burrito', 'Wet Tamale'],
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
    slug: 'high-scores', name: 'High Scores Arcade', label: 'High Scores',
    site: 'https://www.highscoresarcade.com/',
    /*
      REDONE FROM THEIR OWN SITE, 2026-09-02. "Arcade snacks, pizza, and
      slushies" was invented: they say outright "we do not have a kitchen or a
      commercial sink". They sell beer and seltzer and nothing else to eat; the
      ported menu is gone. What they price is admission — a wristband puts
      every game on freeplay — and private parties, so those are the quoted
      list here. A second arcade is at 459 Alvarado St, Monterey.

      NO HOURS: their Visit page publishes Alameda's for only some days and
      Monterey's with a broken time ("1a:30"). The phone is a New Jersey
      number; they began in Burlington, NJ and moved west in 2012.
    */
    cuisine: 'Classic arcade', tagline: 'Classic gaming in a retro arcade, all on freeplay',
    color: '#2D2A6E', icon: 'high-scores', prep: 0, category: 'Menu',
    address: '1414 Park St, Alameda, CA 94501',
    phone: '(609) 468-3083',
    quoteOnly:
      'An all-ages classic arcade — an interactive arcade museum, in their words — where a wristband sets every game to freeplay. No kitchen; beer and seltzer only, and parties bring their own refreshments.',
    groups: [
      {
        name: 'Admission',
        items: [
          ['Unlimited gaming', 'Every game on freeplay', 1000, null, '$10 an hour'],
          ['All day, in and out', '', 2200, null, '$22 all day'],
          ['Private party, two hours, 15 guests', 'Guests beyond the package are $20 each', 30000, null, '$300'],
          ['Private party, two hours, 20 guests', '', 40000, null, '$400'],
        ],
      },
    ],
    items: [],
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
  pageMark: s.pageMark,
  site: s.site,
  address: s.address,
  phone: s.phone,
  email: s.email,
  contactOnly: s.contactOnly,
  needsSite: s.needsSite,
  glow: s.glow,
  siteNote: s.siteNote,
  instagram: s.instagram,
  panels: s.panels,
  hours: s.hours,
  quoteOnly: s.quoteOnly,
  clip: s.clip,
  photo: s.photo,
  photos: s.photos,
  // "This week's favourites" is a food line. A service catalogue is not a
  // rotating special, and nothing about it changes weekly.
  //
  // Nor is it a line to put over a menu the business never published: on a
  // brand flagged for owner review it sat directly above items invented for
  // scaffolding, presenting them as this week's picks.
  /* A seed's own line wins, and brings the bar with it — see `menuNote` in
     localBrands.ts for the one case that needs it. `review` still silences
     everything, because those items are scaffolding, not a menu. */
  menuNote: s.review
    ? undefined
    : (s.menuNote ?? (s.quoteOnly ? undefined : s.items.length > 0 || s.sections?.length ? MENU_NOTE : undefined)),
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
    : s.sections?.length
    ? s.sections.map((sec, gi) => ({
        id: `c_${s.slug.replace(/-/g, '')}_${gi + 1}`,
        name: sec.name,
        items: sec.items.map(([name, desc, price, photo, priceLabel], i) => ({
          id: `i_${s.slug.replace(/-/g, '')}_${gi + 1}_${i + 1}`,
          name,
          desc,
          price,
          priceLabel: priceLabel ?? undefined,
          imageUrl: photo ? `/food/${photo.replace(/^~/, '')}.webp` : undefined,
          imageIsIllustration: photo ? photo.startsWith('~') : undefined,
        })),
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
        .map(([name, desc, price, photo, priceLabel], i) => ({
          id: `i_${s.slug.replace(/-/g, '')}_${i + 1}`,
          name,
          desc,
          price,
          priceLabel: priceLabel ?? undefined,
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
    pageMark: s.pageMark,
    needsSite: s.needsSite,
    glow: s.glow,
    orderUrl: s.orderUrl,
    phone: s.phone,
    address: s.address,
    pricesEstimated: s.pricesEstimated,
    contactOnly: s.contactOnly,
    siteNote: s.siteNote,
    instagram: s.instagram,
    panels: s.panels,
    hours: s.hours,
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
