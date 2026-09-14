/**
 * Real Bay Area businesses, researched and verified individually.
 *
 * Kept separate from the brands ported out of goodneighborbuilder.com because
 * the provenance is different and that difference matters: those were
 * transcribed from the operator's own (placeholder-looking) hub, these were
 * read off each business's own site. Anything not confirmed at source is
 * flagged rather than smoothed over.
 *
 * Rules applied throughout:
 *  - A price is only here if it was read from the business's own menu.
 *    Where a whole menu is triangulated rather than published, the brand
 *    carries `pricesEstimated` and the UI says so.
 *  - A business with no published menu gets `contactOnly` and no invented
 *    items. Three of these are not restaurants at all.
 */

/** One drop-down on a business's page. See `panels` below. */
export type BrandPanel = {
  head: string
  /** Paragraphs, or one line per address. */
  body?: string[]
  /** Their own photographs. `src` is a basename under /food. */
  photos?: { src: string; alt: string; caption?: string }[]
}

export interface LocalSeed {
  slug: string
  name: string
  label: string
  cuisine: string
  tagline: string
  color: string
  /**
   * Basename of their artwork in /public/icons.
   *
   * OPTIONAL, because a partner can join before they send a logo — and the
   * fallback in brands.ts already draws a monogram on their own colour. What
   * must never happen is naming a file that is not there, which renders a
   * broken image on the grid: worse than no logo at all.
   */
  icon?: string
  prep: number
  category: string
  /**
   * name, description, cents, the basename of a vendor-supplied photo in
   * /food (or null when there is none but a label follows), and an optional
   * priceLabel that renders over the cents — "from $19.99" for a floor.
   *
   * The label had lived in the photo slot: the roster ingest wrote a floor's
   * label there, and the menu row dutifully asked for /food/from $19.99.webp
   * and drew a broken image next to the price. Two things, two slots.
   */
  items: [string, string, number, (string | null)?, string?][]
  /**
   * Their full menu in its own published sections, when it has more than one.
   * Same tuple as `items`; renders as tabbed categories. Used instead of
   * `items`, and never filtered by `offer` — it is the whole menu, as they
   * publish it, minus anything that needs an age check.
   */
  sections?: { name: string; items: [string, string, number, (string | null)?, string?][] }[]
  /** Real ordering link, where one exists. */
  orderUrl?: string
  /** A wide wordmark to head the page with, instead of the square icon. */
  pageMark?: string
  site?: string
  /**
   * Keep them on the red-outline prospect list even though `site` is set.
   *
   * For a business whose only link is a stopgap — a GoFundMe, a Linktree, a
   * booking widget — where the operator still wants them shown as needing a
   * real website. Without this the outline is derived from `!site` alone and a
   * placeholder link silently takes them off the list he prospects from.
   */
  needsSite?: true
  /**
   * The paid icon glow, Tier 3's "+$6" line on the Members page.
   *
   * A halo that breathes around the tile on the city grid, so a business that
   * pays for it is the one the eye lands on. Set only where the operator has
   * sold it or is using it as a sample — it means nothing if every tile has
   * one, which is the whole product.
   */
  glow?: true
  /** Which affiliate tier this page is drawn at. See brands.ts. */
  tier?: 1 | 2 | 3
  phone?: string
  address?: string
  /** Set when the whole menu is triangulated rather than published. */
  pricesEstimated?: string
  /** Set when no menu is published anywhere. No items are invented. */
  contactOnly?: string
  /**
   * The stocked subset, by item name. Everything not listed stays in `items`
   * but is not sold — three to five per partner keeps stock space and prep
   * load manageable across many kitchens. Omit to offer the whole menu.
   */
  offer?: string[]
  /** Replaces the generic "they also take orders on X" footer. */
  siteNote?: string
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
  /**
   * Things that drop down on their page: a heading, and what is under it.
   *
   * His ask for Butter Pecan, 2026-08-30: "get the top 3 cookies pictures to
   * drop down when you press the button. No need for price or anything." So a
   * panel can hold pictures with no prices attached — which is the point, and
   * why this is not another `groups`.
   *
   * It is also where a business with more than one shop lists them, because a
   * bakery with six addresses cannot put them in `address`, which is one line.
   *
   * Closed until tapped, like the About chapters. Photographs must be the
   * business's own; a stock or generated picture of a product they do not sell
   * is as much an invented fact as an invented price.
   */
  panels?: BrandPanel[]
  /**
   * Opening hours, one line, exactly as the business publishes them.
   *
   * Only set when their own site publishes a single unambiguous schedule. Two
   * schedules that disagree — a footer and a banner, a bio and a post — mean
   * NO hours here and a note in the comment, because printing either one is
   * printing the wrong one for half the week. Never inferred from a booking
   * widget, a delivery app or a search listing.
   */
  hours?: string
  /**
   * Overrides the bar over the picks drop-down, and forces it to render.
   *
   * The computed line is "Choose from this week's favorites!", suppressed on a
   * `quoteOnly` brand because a service catalogue is not a rotating special.
   * That rule also silenced a case it was never aimed at: a SHOP that publishes
   * a real menu and no prices. Hey Yogurt lists every flavour they make and a
   * price for none of them, so their menu is real, `quoteOnly` is the honest
   * way to carry it, and the operator still asked for the three-favourite bar.
   * Setting this says the line in words that fit the business.
   */
  menuNote?: string
  /** Button label on a contact-only brand. Defaults to "Open their page". */
  siteCta?: string
  /** Published contact address, where the business publishes one. */
  email?: string
  /**
   * What this business gives BEASTY members: `welcome` once on a first visit,
   * `loyalty` on every visit. Only set once THAT business has agreed it.
   *
   * `mock: true` means the operator asked to SEE the design and the business
   * has agreed nothing. The app labels those on screen rather than letting them
   * read as terms — an offer on a partner's page is a promise made in their
   * name, and a mockup that looks identical to an agreed one is how a customer
   * ends up asking a counter to honour something nobody promised.
   */
  offers?: { welcome?: string; loyalty?: string; mock?: boolean }
  /**
   * Priced work that is QUOTED, not bought. Suppresses add-to-cart everywhere.
   * The string explains how to actually start.
   */
  quoteOnly?: string
  /**
   * Several priced sections rather than one. Used instead of `items`.
   *
   * The fourth element is an optional priceLabel that OVERRIDES the formatted
   * cents — Noctilucente quotes ranges ("$2,000-10,000+") and needs it. A
   * business with exact prices does not, so it is optional here exactly as it
   * is on `items`. It was required, which forced a fake label onto every item
   * of any brand that simply had real prices.
   */
  groups?: { name: string; items: [string, string, number, string?][] }[]
  /** Kitchen's own dietary description, e.g. ['Halal']. Never a certification. */
  dietary?: string[]
  /** Partner discount. Headline states the guaranteed floor, not a range. */
  perk?: { headline: string; detail: string }
  /**
   * Their posted prices already contain sales tax, so checkout must not add it
   * again. Backed out for the vendor's records rather than ignored — they
   * still owe it, it is just already inside the price the customer sees.
   */
  taxIncluded?: boolean
  /**
   * Generated-mark art direction, for a business with no artwork yet.
   *
   * Without these every artless brand renders the same flat monogram, and a
   * page of twenty-four identical monograms is what a template looks like,
   * not what a street of small businesses looks like. The five templates and
   * four faces in BrandLogo exist exactly for this; a seed picks the mark
   * that suits the trade — script for a barbershop, a stripe band for car
   * audio, a badge for a café — and the fallback stays monogram.
   *
   * STILL NOT THEIR LOGO. These are openly generated marks in the app's own
   * system; nothing here imitates a real business's actual branding, which is
   * the line that must never be crossed.
   */
  logoTemplate?: 'monogram' | 'badge' | 'glyph-word' | 'wordmark' | 'band'
  logoGlyph?: string
  logoLines?: string[]
  logoFace?: 'grotesk' | 'slab' | 'script' | 'condensed'
  logoAccent?: string
  logoInitials?: string
  /**
   * A clip of theirs for the page. See apps/BrandClip.tsx.
   *
   * `src` is footage they gave us, sitting on our origin, and plays inline.
   * `href` alone is a post on someone else's platform, which we cannot embed
   * and do not pretend to — it draws a card that says where it goes. `credit`
   * is required either way: it is their video, and whose it is gets said.
   */
  clip?: { src?: string; poster?: string; href?: string; credit: string; platform?: string; by?: string }
  /**
   * One photograph of the business, on our own origin.
   *
   * Not a menu-item picture and not a logo — the room, the team, the queue
   * outside. `credit` is required for the same reason a clip's is: it is their
   * photograph, and whose it is gets said rather than assumed. `alt` is
   * required because a decorative empty alt would be a lie about a photo that
   * is carrying real information about the place.
   */
  photo?: { src: string; credit: string; alt: string }
  /** Several, one at a time, swiped — see Brand.photos. */
  photos?: { src: string; credit: string; alt: string }[]
}

/**
 * trycurio.app, tagged so a visit that started here is attributable.
 *
 * The landing site's own analytics.js reads utm_source / utm_medium /
 * utm_campaign / utm_content / utm_term on arrival, persists them to
 * localStorage (last non-empty touch wins) and feeds them to GA4 — so these
 * exact parameter names are what it already understands. Nothing custom is
 * needed, and inventing a different scheme would land as "direct" traffic.
 *
 * `placement` distinguishes where in this app the tap came from, so a home
 * screen icon and a future in-cart promo can be told apart without minting a
 * second campaign.
 */
export function trackedCurioLink(placement: string): string {
  const params = new URLSearchParams({
    utm_source: 'the-home-screen',
    utm_medium: 'referral',
    utm_campaign: 'food-truck',
    utm_content: placement,
  })
  return `https://trycurio.app/?${params.toString()}`
}

export const LOCAL_SEED: LocalSeed[] = [
  {
    slug: 'top-dog',
    name: 'top dog',
    label: 'top dog',
    cuisine: 'Hot dogs, sausages',
    tagline: 'Finely seasoned grilled sausages on French rolls. Berkeley, since 1966.',
    color: '#FFF33E',
    icon: 'top-dog',
    prep: 7,
    category: 'Grilled Sausages',
    /*
      http, NOT https, and that is not a typo.

      Their TLS certificate is self-signed and expired on 29 Dec 2019 — over
      https every browser stops a customer with a full-page "this connection is
      not private" warning before the site ever loads, which is a worse
      introduction to a real business than no link at all. Plain http serves
      the site fine (200). Worth telling them: their certificate has been dead
      for years and their own customers will be seeing that warning too.
    */
    site: 'http://topdoghotdogs.com',
    phone: '(510) 843-5967',
    address: '2534 Durant Ave, Berkeley',
    taxIncluded: true,
    // Deliberately no `offer`: the operator wants top dog's full menu, unlike
    // the other partners where only three to five items are stocked.
    //
    // Every sausage carries top dog's OWN studio photograph, served the way
    // they actually serve it: the sausage overhanging a French roll split into
    // two separate planks, toasted cut-side down. Nothing here is generated.
    //
    // Prices are from a photograph of their in-store board (2026-08), and the
    // item wording is their own from topdoghotdogs.com/themenu.html. Both are
    // primary sources, so these are no longer triangulated — the earlier
    // $5.00/$5.25 came off a Postmates listing and carried that platform's
    // markup. The board runs a single ditto column: $4.75 from the Garlic
    // Frankfurter down to Lemon Chicken.
    pricesEstimated:
      'Their board reads that prices INCLUDE tax, so nothing further is added at checkout. Worth confirming with the shop before taking real money. Card and contactless payments have a $5 minimum.',
    items: [
      ['top dog Frankfurter', 'All beef, kosher style', 450, 'topdog-frankfurter'],
      ['Garlic Frankfurter', 'Three-quarter beef, quarter pork, fresh garlic', 475, 'topdog-garlic-frankfurter'],
      ['Hot Link', 'Louisiana style. Beef and four kinds of pepper, h-h-hottt', 475, 'topdog-hot-link'],
      ['Smoked Chicken Apple', 'Chicken with juicy bits of apple, low salt', 475, 'topdog-smoked-chicken-apple'],
      ['Calabrese', 'Italian. Pork, paprika, chili, fennel, semi-hot', 475, 'topdog-calabrese'],
      ['Kielbasa', 'Polish. Two-thirds pork, one-third beef, hearty', 475, 'topdog-kielbasa'],
      ['Bockwurst', 'Half pork, half veal, milk and eggs', 475, 'topdog-bockwurst'],
      ['the Wienie', 'Veggie. Wheat protein, bell peppers, fennel, eggplant, fresh garlic', 475, 'topdog-wienie'],
      ['Lemon Chicken', 'Chicken, fresh lemon and garlic. Low salt, low fat, no preservatives', 475, 'topdog-lemon-chicken'],
      ['Mango with Jalapeno', 'From Chef Bruce Aidell. Chicken, mango, jalapeño pepper, cilantro and paprika', 475, 'topdog-mango-jalapeno'],
      ['Bratwurst', 'German. Pork and marjoram, genuine old world taste', 500, 'topdog-bratwurst'],
      ['Potato Salad', 'Side', 250, '~topdog-potato-salad'],
      ['Chili on any dog', 'Add chili to any sausage', 100, '~topdog-chili-on-a-dog'],
      ['Chili, 10 oz', 'Cup', 200, '~topdog-chili-10oz'],
      ['Chili, 16 oz', 'Bowl', 300, '~topdog-chili-16oz'],
    ],
  },
  {
    /*
      LARB THAI FOOD & TAPAS — EL CERRITO. Sent by the operator 2026-08-10
      ("El Cerrito • Goods"), listed from their own Instagram bio and site
      link only: name, the family-table line, and 10166 San Pablo Ave. No menu
      research has run yet, so nothing is priced here.

      Their reels carry "VOTED BEST ASIAN RESTAURANT IN EL CERRITO" — a video
      title, not a verifiable award, and it is not rendered anywhere as one.
    */
    slug: 'larb-thai-tapas',
    logoTemplate: 'wordmark',
    logoLines: ['Larb', 'THAI & TAPAS'],
    logoFace: 'script',
    name: 'Larb Thai Food & Tapas',
    label: 'Larb Thai',
    cuisine: 'Thai, Isan',
    tagline:
      'A taste of Thailand\u2019s Northeast \u2014 authentic Isan flavors, straight from our family table to yours.',
    color: '#141416|#3A2A18',
    icon: 'larb-thai-tapas',
    prep: 0,
    category: 'Thai',
    site: 'https://www.larbthaitapas.com/',
    address: '10166 San Pablo Ave, El Cerrito',
    items: [],
    /* Their whole published menu, read from https://www.larbthaitapas.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Small Bites", items: [
        ["Crispy Free Range Chicken Wings", "Served with homemade sweet garlic sauce", 1095],
        ["Deep Fried Quail", "Topped with dried garlic and black pepper", 725],
        ["Deep Fried Taro", "Served with homemade tangy garlic-chili sauce and crushed peanuts", 1095],
        ["Fried Calamari", "Served with homemade sweet garlic sauce", 1250, "larbthaitapas-fried-calamari"],
        ["Fried Cylinder Roll", "Taro, black mushroom, and glass noodles wrapped with rice paper. Serve with sweet garlic sauce.", 1095],
        ["Fried Fish Cakes", "Served with cucumber salad and crushed peanuts.", 1250],
        ["Deep Fried Tofu", "Served with homemade tangy garlic-chili sauce and crushed peanuts", 1095],
      ] },
      { name: "Skewers", items: [
        ["Grilled Coconut Sticky Rice", "", 895],
        ["Grilled Chicken Tender", "", 895],
        ["Grilled Chicken Heart", "", 895],
        ["Grilled Chicken Liver", "", 895],
        ["Raw Fermented Pork Sausage", "", 895],
        ["Isan Sausage", "pork/garlic/herbs/rice", 895],
        ["Fried Fish Balls", "w/ sweet sauce", 895],
        ["Grilled Okra", "w/ teriyaki sauce", 895],
        ["Grilled Eggplant", "w/ teriyaki sauce", 895],
        ["Grilled Mushroom", "w/ teriyaki sauce", 895],
      ] },
      { name: "Soup", items: [
        ["Chicken Spinach Soup", "Minced free range chicken and organic spinach in a clear broth", 895],
        ["Coconut Chicken Soup", "Enoki mushrooms, kaffir leaves, and yellow onion in coconut milk broth", 895],
        ["Hot & Sour Prawn Soup", "Enoki mushrooms, cherry tomatoes and yellow onions in galangal broth", 895],
      ] },
      { name: "Salad", items: [
        ["Lao Papaya Salad", "Shredded green papaya pounded with fish sauce, shredded carrots, green bean, lime juice, dried chili, peanuts, and cherry tomatoes.", 1595],
        ["Thai Papaya Salad", "Shredded green papaya pounded with fish sauce, shredded carrots, green beans, lime juice, dried chilies, peanuts and cherry tomatoes.", 1595],
        ["Crispy Rice Ball Salad", "Crispy rice tossed with ginger, fermented pork, peanuts, shallots and dried Thai chili", 1595],
        ["Tofu Crispy Rice Ball Salad", "Crispy rice tossed with ginger, crispy tofu, peanuts, shallots and dried Thai chili", 1595],
      ] },
      { name: "Larb", items: [
        ["Larb Prawn", "Grilled prawns tossed with roasted coconut meat, shallots, shredded carrots, green onions, mint, cilantro, and peanuts", 1995],
        ["Larb Beef (with Tripe)", "Ground beef and tripe tossed with shallots, mint, cilantro, onions, dried chili and homemade rice powder", 1795],
        ["Larb Chicken", "Ground free-range chicken tossed with shallots, mint, cilantro, green onions, dried chili, and homemade rice powder.", 1695],
        ["Larb Crunchy Tofu", "Fried tofu with shallots, green onion, mint, cilantro tossed with homemade toasted rice powder.", 1695],
        ["Larb Duck", "Fresh Ground Petaluma duck tossed with shallots, mint, cilantro, and ground homemade rice powder.", 1995],
        ["Larb Fish", "Fried Tilapia fillet tossed with shallots, mint, cilantro, and ground homemade rice powder.", 1995],
        ["Larb Mushroom", "Varieties of mushroom with shallots, green onions, mint, cilantro tossed with homemade toasted rice powder.", 1695],
        ["Larb Pork (with Liver)", "Ground pork, pork skin, pork liver tossed with shallots, mint, cilantro, dried chili and homemade rice powder.", 1695],
        ["Larb Pork Shoulder", "Grilled sliced pork shoulder (fatty) tossed with shallots, mint, cilantro, green onions, dried chili, and toasted rice powder", 1995],
        ["Larb Ribeye", "Larb Ribeye - $19.95 grilled sliced ribeye steak (well-marbled) / shallots / mint / cilantro / green onion / dried chili / homemade rice powder", 1995],
      ] },
      { name: "Curry", items: [
        ["Green Curry", "Your choice of meat simmered with broccoli, eggplant, green beans, and basil. Served with fried egg and Jasmine rice on the side.", 1695],
        ["Kabocha Pumpkin Curry", "Your choice of meat simmered with Kabocha pumpkin, basil, green beans and bell peppers. Served with friend egg and Jasmine rice on the side.", 1895],
        ["Red Curry", "Your choice of meat simmered with broccoli, eggplant, green beans, and basil. Served with fried egg and Jasmine rice on the side.", 1695],
        ["Yellow Curry", "Your choice of meat simmered with tomatoes, potatoes, carrots, and broccoli. Served with fried egg and Jasmine rice on the side.", 1695],
      ] },
      { name: "Rice", items: [
        ["Grilled Salmon", "Atlantic salmon fillet / homemade ginger soy sauce / mixed green salad", 2200],
        ["Pork Hock", "Slow cooked bone-in hock with skin and fatty in Soya sauce. Served with a hard-boiled egg and Chinese broccoli over Jasmin rice.", 1895],
        ["Basil", "Your choice of ground meat, wok-fried with yellow onions, basil, and bell peppers in garlic chili sauce. Served with fried egg over Jasmine rice.", 1695],
        ["Garlic & Pepper", "Your choice of meat, wok-fried in garlic sauce and black pepper. Served with fried egg over Jasmine rice.", 1695],
        ["Green Bean", "Your choice of meat, wok-fried with green beans, bell peppers, and chili paste. Served with fried egg over Jasmine rice.", 1695],
        ["Eggplant", "Your choice of meat, wok-fried with eggplant, onions, and basil in a chili black bean sauce. Served with fried egg over Jasmine rice.", 1300],
        ["Mixed Veggies", "choice of wok-fried sliced meat / broccoli / cabbage / green bean / carrot / bell pepper / bean sprouts / lite soy sauce", 1695],
        ["Thai Fried Rice", "Your choice of meat, wok-fried with egg, cherry tomatoes, yellow onions, and Chinese broccoli.", 1695],
      ] },
      { name: "Noodles & Noodle Soup", items: [
        ["Pad Thai", "Your choice of meat, wok-fried with thin rice noodles, egg, garlic chives, bean sprouts, and ground peanuts in a tamarind sauce.", 1695],
        ["Pad See Ew", "Your choice of meat, wok-fried with wide rice noodles, egg, and Chinese broccoli in a sweet soy sauce.", 1695],
        ["Drunken Noodles", "Your choice of meat, wok-fried with wide rice noodles, eggs, green beans, broccoli, bell peppers, yellow onions, cabbage and basil in chili garlic sauce.", 1695],
        ["Chicken Noodle Soup", "Thin rice noodles, sliced free-range chicken, fish balls, and bean sprouts in a clear broth.", 1695],
        ["Dry Tom Yum Noodle", "thin rice noodles / ground pork / sliced pork / pork liver (optional) / fish ball / bean sprouts / dried chili / ground peanuts / homemade sauce / clear", 1695],
        ["Khao Soi Chicken Noodle Soup", "Boiled egg noodles with sliced free-range chicken and bean sprouts in a creamy curry broth topped with crunchy egg noodles, dried onions, ground peanuts", 1795],
        ["Thai Boat Beef Noodle Soup", "Sliced beef, beef balls, and Chinese broccoli in beef broth.", 1795],
        ["Thai Boat Pork Noodle Soup", "Sliced pork, meat balls, pork liver (optional), and Chinese broccoli in pork broth.", 1795],
        ["Vermicelli Green Curry", "vermicelli noodles / sliced chicken / broccoli / eggplant / basil / green beans / green curry base", 1795],
      ] },
      { name: "Chef Paul's Recommendations", items: [
        ["Grilled Pork Shoulder", "sliced pork shoulder / homemade tangy tamarind sauce / jasmine rice / mixed green salad", 1895],
        ["Lemongrass Chicken", "grilled half chicken (bone-in) / lemongrass / garlic / black pepper / coriander / homemade tangy tamarind sauce / jasmine rice / mixed green", 1995],
      ] },
      { name: "Sides", items: [
        ["Jasmine Rice", "", 400, "larbthaitapas-jasmine-rice"],
        ["Brown Rice", "", 450],
        ["Sticky Rice", "", 450],
        ["Cucumber Salad", "", 500, "larbthaitapas-cucumber-salad"],
        ["Fried Pork Skin", "", 450],
        ["Fried Egg", "", 300],
        ["Steamed Broccoli & Carrot", "", 500],
        ["Steamed Rice Noodles", "", 400],
        ["romaine lettuce", "", 300],
      ] },
      { name: "Drinks", items: [
        ["Thai Arnold Palmer", "", 495],
        ["Thai Hibiscus Juice", "", 495],
        ["Apple Juice", "", 425],
        ["Hot Thai Tea", "", 200],
        ["S.pellegrino", "", 400],
        ["Coke", "", 250],
        ["Sprite", "", 250],
        ["Diet Coke", "", 250],
        ["Lemonade", "", 425],
        ["Strawberry Lemonade", "", 495],
        ["Thai Iced Coffee", "", 495],
        ["Thai Iced Tea", "", 495],
        ["Kombucha", "", 500],
        ["Salty Plum Soda", "", 495],
      ] },
    ],
    photos: [
      { src: '/food/larb-thai-tapas-site-0-lg.webp', alt: "", credit: "Their own photo, from larbthaitapas.com" },
      { src: '/food/larb-thai-tapas-site-1-lg.webp', alt: "", credit: "Their own photo, from larbthaitapas.com" },
      { src: '/food/larb-thai-tapas-site-2-lg.webp', alt: "", credit: "Their own photo, from larbthaitapas.com" },
      { src: '/food/larb-thai-tapas-site-5-lg.webp', alt: "", credit: "Their own photo, from larbthaitapas.com" },
    ],
    /* Their whole published menu, read from https://www.larbthaitapas.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    /*
      THE GRIND CAFÉ — VALLEJO, and not one publishable menu price.

      Their first-party menu exists at thegrindcafeorders.com and that site
      returns 403 to every automated fetch, including robots.txt — it blocks
      bots, not people. So the menu is EMPTY here rather than reconstructed
      from DoorDash-fed aggregators, whose numbers were found floating in
      search results and rejected. A human with a browser can read the real
      menu in a minute; until then, listing none is the honest state.

      Single location, checked: 402 Tuolumne St and nothing else, anywhere.
      The "707" is the area code as brand. Two collisions excluded by hand —
      The Grind Cafe on Haight St in SF is a different business, and "The
      Grind Coffee House" is a CLOSED predecessor at this same address whose
      stale listings must never be merged into this one.

      The phone is from Visit Vallejo's business-submitted restaurant-week
      page (which links their Instagram), corroborated twice — their own IG
      publishes no number. Hours below are a three-source consensus, not
      first-party, and say so on screen.

      HOURS ARE NO LONGER A GUESS. They were "by local consensus, worth
      confirming" for weeks. Their own event flyer, 2026-08-21, gives Mon-Fri
      7am-2pm and Sat 8am-1pm as the hours you can buy a ticket at the counter,
      which is first-party and matches the consensus exactly. Stated plainly now.

      Their old domain yourgrindcafe707.com is parked and "may be for sale" —
      a squatter risk worth telling the owners about, and never linked here.
    */
    slug: 'grind-cafe-707',
    logoTemplate: 'badge',
    logoGlyph: 'coffee',
    logoLines: ['THE GRIND'],
    logoFace: 'slab',
    name: 'The Grind Café',
    label: 'Grind Café',
    cuisine: 'Coffee, breakfast',
    tagline:
      'Family-owned. Specialty espressos, made-to-order breakfast burritos, hand-crafted sandwiches and homemade pastries.',
    color: '#4A2C17|#221108',
    icon: '',
    prep: 0,
    category: 'Coffee',
    site: 'https://thegrindcafeorders.com/en-US',
    siteCta: 'Order on their site',
    siteNote: 'Their own ordering site. If it will not load in-app, open it in your browser.',
    phone: '(707) 563-8320',
    address: '402 Tuolumne St, Vallejo',
    /*
      THE VIDEO IS A CARD, NOT A BACKGROUND FILM, and that is a judgement he may
      want to overrule.

      "Can you update their page with this video?" — their own reel, announcing
      Friday Nights at The Grind. It is two of them talking to camera for two
      and a half minutes and ending on the flyer. The hero film plays MUTED,
      because no mobile browser will autoplay otherwise, and a talking head with
      the sound off is a still photograph that happens to blink. There is no
      b-roll in it to cut instead — every frame is the two of them.

      So it goes where a talking video belongs: the card that opens the real
      post, with its sound and its caption. What went on the page instead is the
      thing the video is actually FOR — the date, the price and what the ticket
      buys, which this listing has been telling people to go and find on
      Instagram ever since it was written.
    */
    clip: {
      src: '/clips/grind-cafe-707.mp4',
      poster: '/clips/grind-cafe-707-poster.webp',
      href: 'https://www.instagram.com/reel/DcRs0cKSUwJ/',
      credit: 'Filmed by The Grind Café',
      platform: 'Instagram',
    },
    contactOnly:
      'A family-owned café — the famous ube iced latte is theirs. Their menu lives on their own ordering site, which blocks the tools used to build this page, so rather than copy prices from delivery apps nothing is listed here yet: order on their site or call. Mon-Fri 7am-2pm, Sat 8am-1pm, closed Sunday. FRIDAY NIGHTS AT THE GRIND — Revive Unplugged, run with Revive Ministry next door: Friday 4 September 2026, 6pm to 10pm, $45 a ticket including a buffet dinner, with a DJ, dominoes, Uno and Connect 4, and the coffee bar open all night. Smoke-free and alcohol-free. Tickets by Cash App to $TheGrindCafe or Venmo to @thegrindcafe with your full name and the number of tickets, or in person at the café. All of that is off their own flyer.',
    items: [],
  },
  {
    /*
      PET BUTLER OF WALNUT CREEK — a franchise territory, and the listing is
      strictly the TERRITORY'S facts, not the franchisor's.

      Local: the name, owner-operator Jason Varas de Valdes, the phone below,
      a 23-city service area (Walnut Creek, Concord, Pleasant Hill, Brentwood,
      Antioch, Dublin, San Ramon and more), and @petbutler_walnutcreek.
      Corporate, deliberately left out: the 800 number, info@petbutler.com,
      and the "dog walking / pet sitting" lines that appear only in the
      franchisor's sitewide template — unconfirmed as offered locally.

      NO ADDRESS ON PURPOSE. No first-party page publishes one; the Treat
      Blvd office that aggregators show is never theirs in their own words,
      and a service-area business with a pinned address on a tile reads as a
      shop you can walk into.

      Quote-only pricing is the finding, not a gap — zero dollar figures
      exist on any of their four territory pages.
    */
    slug: 'pet-butler-walnut-creek',
    logoTemplate: 'band',
    logoLines: ['PET', 'BUTLER'],
    name: 'Pet Butler of Walnut Creek',
    label: 'Pet Butler',
    cuisine: 'Pet waste removal',
    tagline: 'Residential and commercial pet waste removal. Serving Pets & Their People.',
    color: '#1D4F91|#12315B',
    icon: 'pet-butler-walnut-creek',
    prep: 0,
    category: 'Service',
    site: 'https://www.petbutler.com/locations/walnut-creek-california-pet-services/',
    siteCta: 'Get a quote',
    siteNote: 'Quotes run through the form on their own territory page.',
    phone: '(925) 291-7415',
    contactOnly:
      'A service-area business, not a shop \u2014 which is why there is no address here. They scoop yards weekly or bi-weekly and run commercial pet-waste stations, across Walnut Creek, Concord, Pleasant Hill and about twenty more East Bay cities. Pricing is quoted per yard: call, or use the form on their page.',
    items: [],
  },
  {
    /*
      THE YARD — DOWNTOWN BRENTWOOD, a burger counter on a converted gas station
      lot with a licensed cocktail bar on it.

      Every price is off their own two menu PDFs, both linked from
      brentwoodyard.com and both served from the same GoDaddy asset id as their
      logo — so they are assets of the exact site their Instagram bio links to.
      Nothing came from DoorDash, Uber Eats, Grubhub or Yelp.

      IDENTITY WAS THE RISK HERE. There is a national "The Yard" food hall brand
      and a "The Yard Milkshake Bar" franchise, and neither is this. This one is
      independent, run by the family behind Attraversiamo in the same town —
      which is why "Attra sauce" and "Attra ranch" run through the menu. The
      state licence register has exactly one Yard in Brentwood: 652897, type 47,
      at 200 Oak St.

      THE MENU IS DATED FEB 2026 AND THE COCKTAIL CARD DEC 2025. They are the
      current published versions, but they are five and eight months old, and a
      price that moved at the till since then is the one way this listing hurts
      them. Worth a call before anyone leans on these numbers.

      NO PHONE EXISTS. Not on their site, not anywhere — they take a contact
      form only, so there is no number to print. No ordering link either: they
      do take-out in person and third-party delivery, and pointing an "order
      online" button at something they do not run would send their customers
      somewhere they did not choose.

      Beer and wine are published as "MP" with no number, and the mocktails and
      brunch have no published prices at all, so none of them are listed.

      ZIP 94513 is from the state licence register, not from them.
    */
    slug: 'the-yard-brentwood',
    clip: { src: '/clips/the-yard-brentwood.mp4', poster: '/clips/the-yard-brentwood-poster.webp', href: 'https://www.instagram.com/reel/DV7TYKVCGdl/', credit: 'Filmed by @thesnacksensei', platform: 'Instagram' },
    name: 'The Yard',
    label: 'The Yard',
    cuisine: 'Smash burgers, cocktails',
    tagline: 'Burgers and a cocktail bar on the old gas station lot downtown.',
    color: '#2F2A24|#171310',
    icon: '',
    prep: 15,
    category: 'Burgers',
    site: 'https://brentwoodyard.com',
    siteCta: 'See the menu',
    siteNote:
      'Open Thursday to Monday, 11:30am to 8:30pm, and CLOSED Tuesday and Wednesday. Walk up and order \u2014 no reservations, and card only, they take no cash.',
    address: '200 Oak Street, Brentwood',
    /*
      NOTHING HERE IS ORDERABLE, and the menu is shown anyway.

      They run no online ordering of their own — their site says walk up and
      order, cash not accepted — so a cart button here would send someone's
      money down a route the business does not have. And six of these are
      cocktails from a type 47 on-premises licence: this app has no age
      verification anywhere, so putting spirits in a shared delivery cart is not
      something to fix with a filter.

      quoteOnly is the mechanism that shows the full priced menu and suppresses
      add-to-cart everywhere, client and server, so it is what this uses.
    */
    quoteOnly:
      'The Yard takes orders at the counter, not through an app \u2014 so this is their menu to read, not to order from. Walk up and order; they are card only and take no cash. The cocktails are served on the premises.',
    /*
      Their own, printed on their own menu next to the Liberty Lions mascot —
      not a mock offer and not one we invented. Quoted close to their wording.
    */
    perk: {
      headline: 'Liberty faculty and students get 10% off',
      detail: 'Printed on their own menu. Ask at the counter.',
    },
    /* Priced in `groups` below; `items` stays empty, as on every grouped brand. */
    items: [],
    groups: [
      {
        name: 'Burgers',
        items: [
          ['Liberty Smash Burger', 'Angus beef, Attra sauce, pickles, grilled onions and American cheese on a Martins potato bun', 800],
          ['Liberty Double', 'The smash burger, doubled', 1100],
          ['Liberty Smash Burger and Fries', 'The smash burger with fries', 1200],
          ['Chicken Sando', 'Double battered buttermilk brined fried chicken thighs, shredduce, pickles, Mike\u2019s hot honey, Attra ranch', 1100],
        ],
      },
      {
        name: 'Sides and plates',
        items: [
          ['Filthy Fries', 'American cheese, caramelized onions, pepperoncinis, Attra sauce, chives', 900],
          ['French Fries', '', 400],
          ['Yard Bowl', 'Brown rice, four veg and rotating add-ins', 1100],
          ['Yard Salad', 'Mixed greens and rotating add-ins', 1100],
          ['Steak Frites', 'Medium rare steak, fries, chimichurri, pickled onions, jalapenos, chives. Limited quantity', 2000],
        ],
      },
      {
        name: 'Cocktails',
        items: [
          ['Pickle Spritz', 'Gin, pickle juice, soda water, dill. Their own words: the burger\u2019s best friend', 1400],
          ['Root Beer Old Fashioned', 'Rye whiskey, housemade root beer syrup, Attra bitters blend', 1400],
          ['Pepperoncini Margarita', 'Blanco tequila, pepperoncini juice, lime, agave', 1400],
          ['Yard Smash', 'Cucumber vodka, strawberry, lemon, orange, basil', 1400],
          ['Brentwood Corn Fest', 'Vodka, lemon, jalapeno, creamed corn puree, elote rim', 1400],
          ['Basic Not Boring', 'Margarita, Old Fashioned, Moscow Mule or any well drink', 1100],
        ],
      },
    ],
  },
  {
    /*
      JONNY'S ITALIAN ICE — listed with NO MENU, on purpose.

      Their website is a "Launching Soon" placeholder with a contact form and
      nothing else. There is no ordering storefront and their Instagram has
      never posted a price. There is no first-party menu in existence online, so
      there is nothing here to list and a menu would have to be invented.

      THINGS THAT LOOK LIKE PRICES AND FACTS AND ARE NOT:
      - "starts at just $3" is from an influencer reel, not the shop. Not used.
      - "The BEST ICECREAM in the Bay Area?", "#1 ICECREAM in the Bay Area?" and
        "BREAKING NEWS THE BEST ICECREAM IN SUNNYVALE" are all video titles on
        their own account. None is a rating, ranking or award, and none is
        rendered as one here.
      - "Jelati" is what a councilmember and an influencer call the layered item,
        but it is Jeremiah's Italian Ice's own branded term and no first-party
        Jonny's source uses it. Printing a competitor's trademark on this
        owner's listing is not a small mistake, so the word does not appear.
      - "Vegan" and "dairy-free" are repeated widely and never by the business.
      - facebook.com/jonnysitalianice is a DIFFERENT shop in Ipswich. Not linked.

      No phone and no email are published anywhere, which is why neither is here.
      ZIP 94087 is not owner-published either — it comes from Apple Maps and from
      the neighbouring Falafel Stop's own site giving 1325 on the same road.

      Hours are first-party, from their Instagram bio, and Apple Maps agrees
      exactly. The soft-serve-plus-Italian-ice claim is theirs and is attributed
      to them rather than asserted.
    */
    slug: 'jonnys-italian-ice',
    name: "Jonny's Italian Ice",
    label: "Jonny's",
    cuisine: 'Italian ice, soft serve',
    /* "Organic" is a USDA-regulated term and this is their claim, not a
       verified fact, so it is attributed the way their other claim is. */
    tagline: 'Italian ice made fresh daily. They describe their soft serve as organic.',
    color: '#D6212B|#8E1119',
    icon: '',
    prep: 0,
    category: 'Ice cream',
    site: 'https://jonnysitalianice.com',
    siteCta: 'See their Instagram',
    siteNote: 'Instagram is where they post.',
    address: '1323 Sunnyvale Saratoga Rd, Sunnyvale',
    contactOnly:
      'A walk-up counter, so there is nothing to order here. They publish no menu or prices. Open Monday to Thursday noon to 11pm, and Friday to Sunday noon to midnight. They say they are the first in Sunnyvale to put soft serve and Italian ice in the same cup.',
    items: [],
  },
  {
    /*
      SIN CITY PITS, LLC — and it is not a barbecue joint.

      The name reads as BBQ and it is not: "Pits" means pit bulls. This is an
      American Pitbull Terrier kennel in Las Vegas run by Chris Cabral, breeding
      dogs and running a canine semen cryobank. Their own site has no menu, no
      food, no ordering platform and no /menu route — the navigation is
      about, gallery, breedings, puppies, males, females, ancestors, blog.
      Checked across four of their own pages before writing any of this down.

      NOT A SINGLE PRICE EXISTS ANYWHERE ON THEIR SITE. /puppies says only that
      "Payment is required to lock in your future puppy" and sends buyers to ask.
      So this is contactOnly with an empty menu — the correct outcome, not a gap
      to fill. A puppy is not a thing to put a made-up number on.

      THEIR CONTACT PAGE STILL HAS THE SITE BUILDER'S DUMMY DATA ON IT. It lists
      555-555-5555 alongside (702) 531-4960, and mymail@mailservice.com
      alongside two real-looking addresses. Only the number that is obviously
      theirs is carried over. The email is left off entirely: three are
      published, nothing indicates which is read, and a message into an
      unmonitored inbox is worse than no address at all.

      NO STREET ADDRESS IS PUBLISHED — the ZIP 89141 is all there is, consistent
      across every page. They also claim to be "home based in Las Vegas and
      Colorado" without giving the Colorado location, so neither a street line
      nor a second city is stated here.

      HOURS ARE NOT CARRIED OVER. The site says "Monday-Sunday OPEN 24hrs",
      which is template filler on a home kennel, not opening hours.

      The two Instagram links were both unreadable — Instagram blocks crawlers
      and stories expire in 24 hours — so nothing from them is recorded. The
      handle in the story URL is how the business was confirmed.
    */
    slug: 'sin-city-pits',
    icon: 'sin-city-pits',
    clip: { src: '/clips/sin-city-pits.mp4', poster: '/clips/sin-city-pits-poster.webp', href: 'https://www.instagram.com/reel/DbYsH_viR_a/', credit: 'Filmed by Sin City Pits', platform: 'Instagram' },
    name: 'Sin City Pits',
    label: 'Sin City Pits',
    cuisine: 'Pitbull kennel and breeder',
    tagline: 'American Pitbull Terrier breeder in Las Vegas. Est. 2012.',
    color: '#B3131B|#1A1A1A',
    /*
      Their own wordmark, downloaded from sincitypits.com — not redrawn. The
      distinction is the whole rule: an image model asked for a real business's
      logo returns a convincing fake of it, so a mark is either theirs or it is
      the generated monogram, never an imitation.
    */
    prep: 0,
    category: 'Service',
    site: 'https://www.sincitypits.com/',
    siteCta: 'See their dogs',
    siteNote: 'Litters, pedigrees and availability are on sincitypits.com',
    phone: '(702) 531-4960',
    address: 'Las Vegas, NV 89141',
    /*
      THEIR OWN POST, BOTH SLIDES, on Glenn's ask of 2026-09-02: "can you post
      this on Sin City Pits page? Also, the gallery. I'm starting to contact a
      lot of the affiliates on the pages to get in a legit offer to post." He
      sent the flyer and a screenshot of the post's second slide, with "crop
      this and put it when you scroll to the right on their page." Cropped to
      the pictures; nothing on them is ours. The words in the alt are read off
      the flyer.
    */
    photos: [
      {
        src: '/photos/sin-city-pits-breeder.webp',
        alt: 'Sin City Pits flyer, Breeder Opportunity: three pit bull puppies, two grey and one tan. Available females with a breeding unit, from a select list of Sin City Pits studs, only with first or second pick.',
        credit: 'Posted by Sin City Pits',
      },
      {
        src: '/photos/sin-city-pits-dogs.webp',
        alt: "Five Sin City Pits dogs composed on rocks under a stormy sky, named on the picture: SCP Disciple's Az, Melillo's Thor, SCP Az's Saint and SCP Queen Of Hearts.",
        credit: 'Posted by Sin City Pits',
      },
    ],
    contactOnly:
      'Sin City Pits breeds American Pitbull Terriers and runs a canine semen bank \u2014 not a kitchen, so there is nothing to order here. They publish no prices at all: litters, stud fees and shipping are quoted by conversation. Call them, or start on their site.',
    items: [],
  },
  {
    /*
      TEQUILA'S TAQUERÍA — LIVERMORE AVE, and the branch matters again.

      Three shops: Livermore Ave (this one), Vasco Rd, and San Jose. Each has
      its own menu PDF. Livermore Ave and Vasco Rd price identically across all
      111 shared items — but SAN JOSE differs on 34 of 38, and always cheaper:
      Super Taco 5.50 against 6.50 here, Super Botana 44.99 against 54.99.
      Every price below is off the Livermore Ave PDF specifically.

      THE $16.99 QUESABIRRIA IN THEIR INSTAGRAM POST IS THE SAN JOSE PRICE. The
      Livermore Ave menu lists it at 19.99, and without the rice and beans the
      post advertises. That single post is exactly how a listing ends up three
      dollars under the counter price.

      Nothing came from DoorDash, Uber Eats, Grubhub, Yelp or the aggregator
      sites that carry this menu.

      Their own branch page prints the ZIP as 94551. That is the Vasco Rd ZIP —
      downtown Livermore is 94550, and their homepage says so twice. Copy-paste
      on their end.

      THE MICHELADAS ARE MISSING ON PURPOSE. "La Capital de la Super Michelada"
      is their own tagline and their signature product, and the Livermore Ave
      PDF has no michelada page at all — the Vasco Rd and San Jose menus do.
      Those prices belong to other shops and are not carried over. Ask them.
    */
    slug: 'tequilas-taqueria',
    icon: 'tequilas-taqueria',
    clip: { src: '/clips/tequilas-taqueria.mp4', poster: '/clips/tequilas-taqueria-poster.webp', href: 'https://www.instagram.com/reel/DbmH3wLFV9U/', credit: 'Filmed by Tequila\u2019s Taqueria', platform: 'Instagram' },
    name: "Tequila's Taquería",
    label: "Tequila's",
    cuisine: 'Mexican, seafood, botanas',
    tagline: 'Family-run since 1996. Tacos, seafood and the botanas they are known for.',
    color: '#17773E',
    prep: 20,
    category: 'Tacos',
    site: 'https://tequilastaqueria.net',
    orderUrl: 'https://tequilastaqueria.net/livermore-ave-orders/',
    phone: '(925) 371-1191',
    address: '160 S Livermore Ave, Livermore',
    email: 'livermoreave@tequilastaqueria.net',
    offer: ['Super Taco', 'Super Burrito', 'Quesabirrias'],
    siteNote: 'Order direct at tequilastaqueria.net — pick the Livermore Ave shop.',
    items: [
      ['Soft Taco', 'One soft taco, your choice of meat', 399],
      ['Super Taco', 'Loaded soft taco, your choice of meat', 650],
      ['Fish Taco', 'One fish taco', 675],
      ['Quesabirrias', 'Three corn tortillas, barbacoa birria and melted cheese', 1999],
      ['Super Burrito', 'Rice, beans, cheese, salsa and your choice of meat', 1699],
      ['Super Burrito Mojado', 'Super burrito under sauce and melted cheese', 1799],
      ['Burrito Bowl', 'Everything in a super burrito, no tortilla', 1699],
      ['Super Quesadilla', 'Large quesadilla with meat and toppings', 1199],
      ['Super Nachos', 'Chips, beans, cheese, meat and toppings', 1699],
      ['Carne Asada', 'Grilled steak with rice, beans and tortillas', 2399],
      ['Birria', 'Slow-cooked birria with consommé', 2499],
      ['Camarones a la Diabla', 'Prawns in diabla sauce', 2499],
      ['Cocktail de Camarón', 'Prawn cocktail', 2399],
      ['Botana Especial', 'Mixed seafood botana for the table', 2699],
      ['Chilaquiles Rojos', 'Red chilaquiles', 1899],
      ['Breakfast Burrito', 'Eggs, potato and cheese', 999],
      ['Homemade Flan', 'House flan', 799],
      ['Horchata', 'Aguas frescas, regular', 425],
    ],
    photos: [
      { src: '/food/tequilas-taqueria-site-0-lg.webp', alt: "", credit: "Their own photo, from tequilastaqueria.net" },
      { src: '/food/tequilas-taqueria-site-1-lg.webp', alt: "Exterior of Tequila's Taqueria in San Jose", credit: "Their own photo, from tequilastaqueria.net" },
      { src: '/food/tequilas-taqueria-site-2-lg.webp', alt: "Exterior of Tequila's Taqueria on Vasco Road in Livermore", credit: "Their own photo, from tequilastaqueria.net" },
      { src: '/food/tequilas-taqueria-site-3-lg.webp', alt: "Exterior of Tequila's Taqueria on Livermore Avenue", credit: "Their own photo, from tequilastaqueria.net" },
    ],
  },
  {
    /*
      JOJO'S HOT CHICKEN — BRANHAM, and the branch matters.

      They run TWO San Jose locations off one domain: Branham (this one) and
      Downtown on E William St. The menus are separately priced and the prices
      embedded on their own HOMEPAGE are the DOWNTOWN set — Combo 1 at $15.99
      against Branham's $16.99, Halftime $10.99 against $11.99. Anything
      scraping the front page would list this shop wrong by a dollar on several
      items. Every price below came from their first-party menu API for the
      Branham slug specifically, on 2026-08-08.

      For the same reason none of it came from DoorDash or Uber Eats, which
      carry a 17-25% markup here: Combo 1 is $19.99 there against $16.99 direct,
      and the banana pudding is $7.99 against $5.99.

      Two things NOT copied across: 1587 Kooser Rd is their old address and is
      still live on Yelp and Uber Eats — they moved. And their own back office
      still classifies them as a food truck, a leftover from the truck days;
      Branham is a permitted fixed storefront.

      Sunday is left out of nothing because no hours are shown anywhere in this
      app, but for the record it is unresolved: their site says 11-8, their back
      office says closed, their Instagram says closed. Confirm before printing.
    */
    slug: 'jojos-hot-chicken',
    name: "Jojo's Hot Chicken",
    label: "Jojo's",
    cuisine: 'Nashville hot chicken',
    tagline: 'Nashville-style hot chicken, hand-breaded, with seven spice levels from none to Reaper.',
    color: '#C41E24',
    /*
      NO `icon`. We do not have their artwork, and pointing at a file that is
      not there renders a broken image on the grid — worse than no logo at all.
      Leaving it unset draws the monogram fallback on their own red instead.
      Swap in /icons/jojos-hot-chicken.webp the moment they send one.
    */
    prep: 15,
    category: 'Hot chicken',
    site: 'https://www.jojoshotchicken.com',
    /*
      "See if you can take this video and attach it to this Restaurant page"
      (2026-08-08). The video is @thesnacksensei's, a food reviewer, not the
      restaurant's, so it is a card that opens the post, credited to him —
      nothing re-hosted. The mock offers he asked for in the same breath are
      below.
    */
    clip: { src: '/clips/jojos-hot-chicken.mp4', poster: '/clips/jojos-hot-chicken-poster.webp', href: 'https://www.instagram.com/reel/DYlU7BcoAMi/', credit: 'Filmed by @thesnacksensei', platform: 'Instagram' },
    orderUrl: 'https://www.jojoshotchicken.com/menu',
    phone: '(408) 499-0916',
    address: '1601 Branham Ln #10, San Jose',
    email: 'Jojoshotchicken@gmail.com',
    /*
      A MOCKUP. The operator asked to see what a welcome and a loyalty offer
      would look like on a new partner's page; Jojo's has agreed neither, and
      the app says so on the page rather than letting the design pass for terms.
    */
    /*
      THE OPERATOR'S OWN EXAMPLE WORDING, and still mock.

      He asked for "a BOGO welcome offer as an example", then "free fountain
      soda with refills with any meal purchase" as the loyalty side. Both are
      his, written as a demonstration of the shape an offer takes — Jojo's has
      not agreed either of them, which is what `mock` says and why the app
      prints the caveat next to them.

      Buy-one-get-one needs a subject or it is unbounded, so it names the
      sandwich rather than the whole menu. An unqualified BOGO on a $16.99
      combo is not what anyone means by it, and this text is the thing a
      customer would hold them to.
    */
    offers: {
      mock: true,
      welcome: 'Buy one sandwich, get one free on your first visit.',
      loyalty: 'Free fountain soda, with refills, on any meal.',
    },
    siteNote: 'Order direct at jojoshotchicken.com — pick the Branham location.',
    items: [],
    /* Their whole published menu, read from https://www.jojoshotchicken.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Menu", items: [
        ["Combo 1", "", 1599, "jojoshotchicken-combo-1"],
        ["Combo 2", "", 1499, "jojoshotchicken-combo-2"],
        ["Combo 3 (Wednesday Special)", "", 1299, "jojoshotchicken-combo-3-wednesday-special"],
        ["Bowl", "", 1499, "jojoshotchicken-bowl"],
        ["Tender", "", 599, "jojoshotchicken-tender"],
        ["Fries", "", 599, "jojoshotchicken-fries"],
        ["Slider", "", 799, "jojoshotchicken-slider"],
        ["Water", "", 199, "jojoshotchicken-water"],
        ["Coca Cola", "", 299, "jojoshotchicken-coca-cola"],
        ["Coke Zero", "", 299, "jojoshotchicken-coke-zero"],
        ["Pickles", "", 299, "jojoshotchicken-pickles"],
        ["Slaw", "", 399, "jojoshotchicken-slaw"],
        ["Sprite", "", 299],
      ] },
    ],
    /* Their whole published menu, read from https://www.jojoshotchicken.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    /*
      The only partner with agreed member offers so far, from the operator's own
      mock-up. Every other partner's `offers` stays unset until they have agreed
      one — an offer on a partner's page is a promise made in their name.
    */
    /*
      THE OPERATOR'S MOCK-UP, not this business's agreement.

      The commit that introduced these said so outright — his mock-up is the
      only place the terms exist. Nothing records The Lumpia Company agreeing
      them, and the welcome offer gives away "any one of our specialty drinks"
      when they have no drinks anywhere in their menu, so it could not be
      honoured even if someone tried. Written in their first person, it read as
      their promise.

      `mock` makes the app label it as an example on screen and keeps it out of
      the count the membership screen sells against.
    */
    offers: {
      mock: true,
      welcome:
        'Choose any one of our specialty drinks to pair with each meal, free on your first visit.',
      loyalty: '10% off your entire order, any visit.',
    },
    slug: 'lumpia-company',
    name: 'The Lumpia Company',
    label: 'Lumpia Co',
    cuisine: 'Filipino lumpia, wings',
    tagline: 'Handcrafted lumpia in traditional and fusion flavours, plus twice-fried adobo wings.',
    color: '#B23132',
    icon: 'lumpia-company',
    prep: 18,
    category: 'Lumpia',
    site: 'https://thelumpiacompany.com',
    orderUrl: 'https://order.toasttab.com/online/thelumpiacompany',
    phone: '(213) 570-7497',
    address: '288 9th Avenue Suite A, Oakland',
    // Rolls only — the wings, pancit and mac-ghetti are off. Two of these three
    // are the ones their own site puts photos against; TLC Veggie is the third
    // because a shared cart across kitchens needs one vegetarian option and the
    // other rolls are all meat. Swap it for Chicken Tinola or Earl's Turkey if
    // the kitchen would rather.
    siteNote: 'See their full menu and order direct at thelumpiacompany.com',
    items: [],
    /* Their whole published menu, read from https://thelumpiacompany.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Lumpia", items: [
        ["Pork & Shrimp Shanghai", "", 1300],
        ["Mix & Match", "", 1400],
        ["Bacon Cheeseburger", "", 1400, "lumpiacompany-bacon-cheeseburger"],
        ["2AM Beef Taco", "", 1400],
        ["Chicken Shanghai", "", 1200],
        ["Chicken Tinola", "", 1300, "lumpiacompany-chicken-tinola"],
        ["Crab", "", 1400],
        ["Cubano", "", 1500],
        ["Elote", "", 1400],
        ["Lemon Pepper", "", 1400],
        ["Mamas Veggie", "", 1300],
        ["NYC Pizza", "", 1400],
        ["Turkey & Veggie w/ Swt Chili", "", 1300],
        ["Baco Cheeseburger", "", 1400, "lumpiacompany-baco-cheeseburger"],
        ["Bicol Express Pork & Shrimp", "", 1300, "lumpiacompany-bicol-express-pork-shrimp"],
        ["Earl's Turkey & Veggies", "", 1300, "lumpiacompany-earl-s-turkey-veggies"],
        ["TLC Veggie", "", 1200, "lumpiacompany-tlc-veggie"],
        ["Peach Mango Cobbler", "", 1200, null, "lumpiacompany-peach-mango-cobbler"],
      ] },
      { name: "Wings", items: [
        ["Original Seasoned Wings", "", 1300],
        ["Spicy Original Seasoned Wings", "", 1300],
        ["Garlic Parm Adobo Wings", "", 1300],
        ["Honey Buffalo Wings", "", 1300],
        ["FBBQ Wings", "", 1300],
        ["BBQ Jerk Wings", "", 1300],
        ["Adobo Seasoned", "", 1500, "lumpiacompany-adobo-seasoned"],
        ["Spicy Adobo Seasoned", "", 1500],
        ["Filipino BBQ", "", 1500, "lumpiacompany-filipino-bbq"],
        ["I Just Want Wings", "", 1300],
      ] },
      { name: "Grilled Plates", items: [
        ["BBQ Chicken Skewers", "", 1300],
      ] },
      { name: "Sides", items: [
        ["Filipino Mac-GHETTI - Regular", "", 400],
        ["Filipino Mac-GHETTI - Kuya", "", 750],
        ["CHEESY Mac - Regular", "", 300],
        ["CHEESY Mac - Kuya", "", 600],
        ["Fries - Adobo Seasoned", "", 500],
        ["Fries - Plain Salted", "", 400],
        ["Pork Belly Chips", "", 1000],
        ["Fried Shrimp (4pc)", "", 500],
        ["Cheese Sauce on the Side", "", 100],
        ["GARLIC Rice", "", 400],
        ["STEAMED Rice", "", 300],
        ["Fried Egg", "", 300],
        ["Garlic Java RIce", "", 250],
        ["1/2 Size Mac - Ghetti", "", 300],
        ["Soft Boiled Egg", "", 100],
      ] },
      { name: "Bowls", items: [
        ["Arroz Caldo Bowl", "", 1000],
        ["Bistek & Egg Bowl", "", 2000],
        ["Fried shrimp rice bowl (GARLIC RICE)", "", 1550],
        ["Fried Shrimp Rice Bowl (Steamed Rice)", "", 1500],
      ] },
      { name: "Salads", items: [
        ["Tlc Salad", "", 1000],
      ] },
      { name: "Garlic Noodles", items: [
        ["Garlic Noodle", "", 1300],
        ["Ube pancakes", "Ube 3 Stack", 800],
      ] },
      { name: "Combos", items: [
        ["Fried Shrimp + Chicken + Fries", "", 1700],
        ["Earls Combo Plate", "", 2000],
      ] },
      { name: "Brunch", items: [
        ["Ube Pancake Stack", "", 1000],
        ["Longanisa & Egg", "", 1000],
        ["Arnel Palmer Calamansi Sweet Tea", "", 450],
        ["Calamansi Limeade", "", 400, "lumpiacompany-calamansi-limeade"],
        ["Strawberry Calamansi Limeade", "", 450, "lumpiacompany-strawberry-calamansi-limeade"],
        ["Thai Iced Tea", "", 500, "lumpiacompany-thai-iced-tea"],
        ["Guava Calamansi Limeade", "", 450],
      ] },
      { name: "Drinks", items: [
        ["Free Refill Fountain Soda", "", 500],
        ["Fountain Soda - REGULAR 24OZ", "", 250],
        ["Fountain Soda - KUYA 32OZ", "", 300],
        ["Ice Cup", "", 100],
        ["(21+) Four Loko", "", 700],
        ["(21+) Mike's Harder Lemonade", "", 700],
        ["(21+) Modelo", "", 700],
        ["(21+) Steel Reserve", "", 700],
        ["(21+) White Claw", "", 500],
        ["Arizona", "", 300],
        ["Bubble Tea Can", "", 400],
        ["Bundeburg Rootbeer", "", 400],
        ["Gatorade", "", 350],
        ["Jarritos", "", 400],
        ["Mineragua Sparkling Water", "", 400],
        ["Nomsi", "", 300],
        ["Poppi", "", 350],
        ["Red Bull / Celsius", "", 450],
        ["Soda Can (Large Size)", "", 350],
        ["Soda Can (Mini Size)", "", 150],
        ["Soda Can (Regular Size)", "", 200],
        ["Soursop / Coconut Can", "", 400],
        ["Topo Chico", "", 500],
        ["Vitamin Water", "", 350],
        ["Apple / Orange Juice", "", 350],
      ] },
      { name: "Presko sugarcane drinks", items: [
        ["Pure Sugarcane", "", 800],
        ["Filipino Style Cantaloupe Sugarcane", "", 850],
        ["Mint Mojito Sugarcane", "", 850],
        ["Passion Fruit Sugarcane", "", 850],
        ["Watermelon Sugarcane", "", 850],
        ["Ginger Lemon Sugarcane", "", 850],
        ["Pineapple Sugarcane", "", 850],
        ["No Ice", "", 100],
      ] },
      { name: "Rice plates and bowls", items: [
        ["Butter Garlic Shrimp Pancit Noodles", "", 1500],
        ["Veggie Garlic Pancit Noodles", "", 1200],
        ["Garlic Shrimp Rice Bowl", "", 1400],
        ["Coke", "", 200],
        ["Sprite", "", 200],
      ] },
    ],
    /* Their whole published menu, read from https://thelumpiacompany.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    slug: 'bula-pies',    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: 'Buy 6 frozen pies to take home and get any 2 freshly baked free.',
      loyalty: 'A free specialty drink with any 2 pies, frozen or baked.',
    },
    /* His top three for the week, named in his own message. */

    name: 'Bula Pies Fiji',
    label: 'Bula Pies Fiji',
    cuisine: 'Fijian meat pies',
    tagline: 'Handmade Fijian savoury and sweet pies, sausage rolls and espresso, baked fresh.',
    color: '#9C2424',
    icon: 'bula-pies',
    prep: 12,
    category: 'Savoury Pies',
    site: 'https://bulapiesfiji.com',
    orderUrl: 'https://bulapiesfiji.com/menu',
    phone: '(707) 563-8422',
    address: '2568 Springs Rd, Vallejo',
    // Named by the operator. Their full menu stays below for when it widens.
    /*
      His top three for the week, 2026-08-16: "Minced Meat & Cheese, Pot Roast
      and BBQ Brisket Top 3."

      Two map exactly. POT ROAST DOES NOT EXIST on the menu transcribed from
      their site, and no price for one exists anywhere here, so the Beef Stew
      Pie stands in — tender beef, peas, carrots and potatoes, which is a pot
      roast in a crust. Worth him confirming, because the alternative was
      inventing an item and a price for somebody else's kitchen.
    */
    siteNote:
      'Discover more favorites and even order frozen pies shipped directly to your door by visiting bulapiesfiji.com',
    items: [],
    /* Their whole published menu, read from https://bulapiesfiji.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Savory Pies", items: [
        ["Smoked Bacon & Egg [B]", "2 Large eggs, sautéed onions and TOO much hardwood smoked bacon.", 1000, "bulapies-smoked-bacon-egg-b"],
        ["Beef Stew Pie [X]", "HALAL. Warm up your taste buds with our hearty beef stew. Made with tender ground beef, peas, carrots, and potatoes", 1000, "bulapies-beef-stew-pie-x"],
        ["Butter Chicken Pie [BC]", "Indulge in the rich and savory flavors of our butter chicken pie. This chicken pie offers a perfect balance of creamy buttery goodness with a hint of heat", 1100, "bulapies-butter-chicken-pie-bc"],
        ["Homestyle Chicken [HC]", "A hearty creamy blend of tender chicken and broccoli encased in our flaky crust.", 1000, "bulapies-homestyle-chicken-hc"],
        ["Mama's Lamb Pie [L]", "Our Mama's Lamb pie is filled with a tasty ground lamb, sweet potato and veggie stew. A mouthwatering twist on a classic dish", 1100, "bulapies-mama-s-lamb-pie-l"],
        ["Mince & Cheese Pie [M]", "HALAL. Claimed to be the 'softest cheeseburger'. Indulge in the savory delight of our mouthwatering mince and cheese pie", 1000, "bulapies-mince-cheese-pie-m"],
        ["Pot Roast Pie [PR]", "Braised beef and carrots slow-cooked in red wine. This pie knocks you straight to Sunday dinner.", 1200, "bulapies-pot-roast-pie-pr"],
        ["Veggie Curry Pie [V]", "Indulge in the ultimate comfort food with our veggie curry pie", 1000, "bulapies-veggie-curry-pie-v"],
        ["Smoked Pulled Pork [PP]", "Indulge in the ultimate comfort food with our mouthwatering Smoked BBQ Pulled Pork with our in house coleslaw.", 1200, "bulapies-smoked-pulled-pork-pp"],
      ] },
      { name: "Sausage Rolls", items: [
        ["Pork Sausage Roll", "Indulge in the savory delight of our homemade pork sausage roll encased in buttery, flaky pastry", 500, "bulapies-pork-sausage-roll"],
        ["Lamb Sausage Roll", "HALAL. Homemade lamb sausage roll encased in our buttery flaky pastry.", 500, "bulapies-lamb-sausage-roll"],
      ] },
      { name: "Dessert", items: [
        ["Chocanana Pie [O]", "Oh so good! This pie features a fudgy chocolate banana center with nutella, encased in our buttery flaky pastry.", 900, "bulapies-chocanana-pie-o"],
        ["Pineapple Pie [P]", "Indulge in the irresistible sweetness of our caramelized pineapple pie", 900, "bulapies-pineapple-pie-p"],
      ] },
      { name: "Trifle Cake Cups", items: [
        ["Banana Pudding Trifle", "Indulge in the ultimate dessert experience with our banana pudding trifle", 600, "bulapies-banana-pudding-trifle"],
        ["Guava Strawberry Ripple", "Delicious flavors of guava and tart strawberry layered with our fresh cream and custard mix with Nila wafers. So thick, so creamy!", 650, "bulapies-guava-strawberry-ripple"],
      ] },
      { name: "Espresso Drinks", items: [
        ["Latte", "Espresso and steamed milk. Available in 12oz, 16oz and 20oz", 425, "bulapies-latte"],
        ["Americano", "Espresso shots topped with hot water. Available in 12oz, 16oz and 20oz.", 400, "bulapies-americano"],
        ["Mocha", "Our espresso combined with our dark chocolate syrup and steamed milk, topped with whipped cream.", 475, "bulapies-mocha"],
        ["White Mocha", "Our espresso combined with our white chocolate syrup and steamed milk, topped with whipped cream.", 475, "bulapies-white-mocha"],
      ] },
      { name: "Specialty Drinks", items: [
        ["Kumquat Limemade", "Cool off with our homemade kumquat limemade, sweetened with organic cane sugar.", 350, "bulapies-kumquat-limemade"],
        ["Nitro Hibiscus Tea Lemonade", "Our refreshing blend of Nitro Hibiscus Tea and Lemonade with Raspberry flavor.", 445, "bulapies-nitro-hibiscus-tea-lemonade"],
        ["Nitro Cold Brew", "Cold brew infused with nitro to give you a smooth and stronger caffeinated experience.", 425, "bulapies-nitro-cold-brew"],
      ] },
      { name: "Drinks", items: [
        ["Coke 12oz", "", 150, "bulapies-coke-12oz"],
        ["Sprite 12oz", "", 150, "bulapies-sprite-12oz"],
        ["Fanta Orange 12oz", "", 150, "bulapies-fanta-orange-12oz"],
        ["Pepsi 12oz", "", 150, "bulapies-pepsi-12oz"],
        ["Pepsi Diet 12oz", "", 150, "bulapies-pepsi-diet-12oz"],
        ["Canada Dry 12oz", "", 150, "bulapies-canada-dry-12oz"],
        ["Dr Pepper 12oz", "", 150, "bulapies-dr-pepper-12oz"],
        ["Manzanita Sol Red Apple 12oz", "", 150],
        ["Mountain Dew 12oz", "", 150, "bulapies-mountain-dew-12oz"],
      ] },
    ],
    /* Their whole published menu, read from https://bulapiesfiji.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    slug: 'bread-winners',
    name: 'Bread Winners',
    label: 'Bread Winners',
    cuisine: 'Sandwiches',
    tagline: 'An Oakland sandwich company. Sandwiches, salads, juices and smoothies, Monday to Saturday.',
    color: '#E0A32E',
    icon: 'bread-winners',
    prep: 12,
    category: 'Sandwiches',
    site: 'https://www.instagram.com/breadwinnersoak/',
    orderUrl: 'https://www.doordash.com/store/bread-winners-oakland-llc-oakland-39886361/',
    address: '917 Washington St, Oakland',
    pricesEstimated:
      'These are DoorDash listing prices, which carry the platform markup. Counter prices at the shop are lower — confirm before charging.',
    // Taken from DoorDash's "Most Ordered" section, in the order it lists
    // them — actual order counts rather than a guess at what sells.
    offer: ['BYO Sandwich', 'The Breadwinner Club', 'Crab Melt', 'Tuna Sub', 'Turkey & Swiss'],
    siteNote: 'See their full menu and order direct on DoorDash',
    // Descriptions are the shop's own wording, not a paraphrase.
    items: [
      ['Crab Melt', 'Lump crab, swiss cheese, tomato, on toasted ciabatta', 2185, 'bread-winners-crab-melt'],
      ['The Breadwinner Club', 'Smoked turkey, black forest ham, applewood smoked bacon, cheddar, lettuce, tomato and garlic aioli on sourdough', 1950, 'bread-winners-club'],
      ['Tuna Sub', 'Housemade tuna salad, provolone, shredded lettuce, tomato, red onion, pickles, on a french roll', 1835, 'bread-winners-tuna-sub'],
      ['Tuna Melt', 'Housemade tuna salad, melted and pressed', 1835],
      ['Turkey & Swiss', 'Roasted turkey, swiss cheese, lettuce, tomato, chipotle aioli on sourdough', 1720, 'bread-winners-turkey-swiss'],
      ['Turkey Pesto Panini', 'Roasted turkey, provolone, tomato, spinach, pesto aioli on ciabatta', 1720, 'bread-winners-turkey-pesto'],
      ['BYO Sandwich', 'Choose your own adventure', 1610, 'bread-winners-byo'],
    ],
  },
  {
    slug: 'rains-plates',
    name: "Rain's Plates",
    label: "Rain's Plates",
    cuisine: 'Soul food, Asian fusion',
    tagline: 'Southern soul food crossed with Asian fusion, sold as pop-ups and catering.',
    color: '#E8508D',
    icon: 'rains-plates',
    prep: 25,
    category: 'Menu',
    site: 'https://www.instagram.com/rains_plates/',
    phone: '(510) 630-8739',
    address: 'Pinole',
    pricesEstimated:
      'DoorDash listing prices, which carry the platform markup — and their DoorDash store currently shows as inactive. Message @rains_plates to confirm what is on today.',
    // The three meals, plus the side that is theirs rather than generic.
    offer: ['Party Wings Meal', '2 Jumbo Shrimp Skewers Meal', 'Tender Tri Tip Meal', 'Candied Yams'],
    siteNote: 'See what is on this week at instagram.com/rains_plates',
    items: [
      ['Party Wings Meal', 'About 1 lb, marinated 24 hours, fried naked, your choice of sauce, side, bread and dip', 1950, 'rains-plates-party-wings'],
      ['2 Jumbo Shrimp Skewers Meal', '8 pieces, marinated 24 hours, pan seared, choice of sauce, side, bread and dip', 2150, 'rains-plates-shrimp-skewers'],
      ['Tender Tri Tip Meal', '7 oz marinated in 10 spices for 48 hours, choice of sauce, side, bread and dip', 2150, 'rains-plates-tri-tip'],
      ['Candied Yams', 'Side', 650, '~rains-candied-yams'],
      ['French Fries', 'Side', 600],
      ['Jasmine Rice', 'Side', 400],
    ],
  },
  {
    slug: 'elemonkey',    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: 'An invite-only 30% off your first purchase.',
      loyalty: 'Free shipping on any $100 or more online during a drop. Code BPRPFREESHIP.',
    },

    name: 'Elemonkey',
    label: 'Elemonkey',
    cuisine: 'Apparel',
    tagline: 'Constant Elevation. Streetwear out of San Francisco.',
    color: '#0A0A0A',
    icon: 'elemonkey',
    prep: 0,
    category: 'Shop',
    site: 'https://www.elemonkey.com/',
    // No menu is invented here. elemonkey.com is password-protected, so
    // nothing about what they sell or what it costs can be read at source.
    // The icon is their own mark, lifted from their site's own uploads at
    // 800x800 and composited on black — not a redraw and not a generated
    // approximation, either of which would be a different brand's identity.
    // Real products at real prices, but READ FROM AN ARCHIVED CAPTURE of their
    // storefront (Oct 2025) because they have since closed it behind an
    // invite-only gate on purpose. That is why the flag below is blunt: these
    // are not confirmed current, and the shop is not open to the public.
    pricesEstimated:
      'From their last public storefront in October 2025, not confirmed current. Elemonkey is invite-only now, so confirm with them before ordering.',
    siteNote: 'Visit elemonkey.com',
    items: [
      ['ELEMONKEY Embroidered Polo, black', 'Embroidered polo', 7000],
      ['ELEMONKEY Embroidered Polo, white', 'Embroidered polo', 7000],
      ['Elemonkey Snap Back Hat, red', 'One size', 4000],
      ['Elemonkey Snap Back Hat, white', 'One size', 4000],
      ['Elemonkey Snap Back Hat, black', 'One size', 4000],
    ],
  },
  {
    slug: 'curio',
    name: 'Curio',
    label: 'Curio',
    cuisine: 'Reading app',
    tagline: 'Turn scrolling into rabbit holes worth reading.',
    color: '#1A0B2E',
    icon: 'curio',
    prep: 0,
    category: 'App',
    site: trackedCurioLink('home-screen-icon'),
    contactOnly:
      'Curio is an iOS app, not a kitchen. Full-screen cards on psychology, mysteries, forgotten history and strange science — a better way to scroll while you wait for your order.',
    siteCta: 'Open Curio',
    items: [],
  },
  {
    slug: 'pod-dtg',
    name: 'POD DTG',
    label: 'POD DTG',
    cuisine: 'Print on demand',
    tagline: 'Print on demand.',
    color: '#0A0A0A',
    icon: 'pod-dtg',
    prep: 0,
    category: 'Shop',
    // Name and mark only, by the operator's instruction — it is a print-on-
    // demand brand and there is nothing to order through this app. Phrased as
    // settled rather than pending, so the tile does not read as unfinished.
    // This entry previously carried a wood-fired pizza menu ported from the old
    // hub, which is why it was removed once; a printer is not a pizzeria.
    contactOnly: 'POD DTG is a print-on-demand brand, not a kitchen. Nothing to order here.',
    items: [],
  },
  {
    slug: 'hybrid-workz',
    name: 'Hybrid Workz',
    label: 'Hybrid Workz',
    cuisine: 'Toyota hybrid service',
    tagline: 'Toyota hybrid service and maintenance, Fremont.',
    color: '#8C1D24',
    icon: '',
    prep: 0,
    category: 'Service',
    site: 'https://www.instagram.com/hybridworkz/',
    phone: '(510) 399-9140',
    // ADDRESS DELIBERATELY OMITS THE STREET NUMBER.
    //
    // Two conflict, and both come from surfaces the business itself controls:
    // their Instagram bio says "45554 industrial place unit 8", their
    // owner-verified Google Business Profile says "45450 Industrial Pl". Both
    // street numbers are real, about 100 m apart on the same road, and Google's
    // own map pin sits on 45450. Publishing either one sends somebody to the
    // wrong unit, so publish neither until a phone call settles it — the phone
    // number is verified and gets the customer there.
    address: 'Industrial Pl, Fremont, CA 94538',
    // No services and no prices are listed because they publish none. This was
    // checked, not assumed: all 56 of their Instagram captions were read and
    // there is not a single price on any surface they control. A repair quote
    // depends on the car, and inventing a price list for a garage would be
    // worse here than anywhere else on this home screen.
    perk: {
      headline: '10% off for BEASTY customers',
      detail:
        'Up to 25% on larger jobs, at the shop\u2019s discretion. Mention BEASTY when you book.',
    },
    contactOnly:
      'Hybrid Workz service Toyota hybrids \u2014 a garage, not a kitchen, so there is nothing to order here. They take bookings by phone or DM only. Confirm the unit number when you call: their Instagram and their Google listing give different street numbers on the same road.',
    siteCta: 'Message @hybridworkz',
    items: [],
  },
  {
    slug: 'paulo-sausage',    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: 'Buy any 3lb and get 1lb of your choice free.',
      loyalty: 'A cannoli with any purchase, every visit.',
    },

    name: 'Paulo Sausage Co',
    label: 'Paulo Sausage',
    /* "Can you please add this video to Paulo Sausage Co? Drop down plz." —
       2026-08-28. href with no src, like every other reel here: it is his post
       on his platform, and the drop-down bar opens it rather than pretending to
       embed it. He adds "I deliver for them weekly so they're definitely going
       to be on board", which is a reason to expect a yes, not a yes. */
    clip: {
      src: '/clips/paulo-sausage.mp4',
      poster: '/clips/paulo-sausage-poster.webp',
      href: 'https://www.instagram.com/reel/DaboslhTtv9/',
      credit: 'Filmed by @justmostie',
      platform: 'Instagram',
    },
    cuisine: 'Italian sandwiches, sausage',
    tagline: 'Traditionally made sausage and specialty Italian sandwiches. Pittsburg.',
    color: '#111111',
    icon: 'paulo-sausage',
    prep: 15,
    category: 'Sandwiches',
    site: 'https://www.paulosausageco.com',
    orderUrl: 'https://www.paulosausageco.com/sandwich-pre-order',
    address: '2951 Harbor Street Suite E, Pittsburg',
    // Counter prices from their OWN Square Online catalogue, not a delivery
    // platform. DoorDash adds a flat $3.00 to every overlapping item, measured
    // across six of them, so the platform figures were not used.
    siteNote: 'Pre-order sandwiches direct at paulosausageco.com',
    items: [],
    /* Their whole published menu, read from https://www.paulosausageco.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Sandwiches", items: [
        ["Italian Dip", "Savor the rich flavors of our Italian Dip Sandwich, featuring a blend of Italian pork and beef sausage, sautéed onions, roasted garlic, and mushrooms", 1500, "paulosausage-italian-dip"],
        ["Meatball Sub", "Sink your teeth into this hearty classic featuring our tender, flavorful meatballs simmered in our vodka cream tomato sauce", 1550, "paulosausage-meatball-sub"],
        ["Ham & Burrata", "Indulge in a delightful blend of flavors with our Ham & Burrata Sandwich", 1600, "paulosausage-ham-burrata"],
        ["Italian Cold Cut", "Enjoy a classic Italian cold cut sandwich stacked with capicola, salami, pepperoni, ham, and provolone all served on our freshly baked focaccia", 2000, "paulosausage-italian-cold-cut"],
        ["Salami & Stuffed Pepperoncini", "Enjoy the bold flavors of savory salami paired with cream cheese stuffed pepperoncini, fresh arugula, & ripe tomato, all balanced with a touch of creamy mayo", 1550, "paulosausage-salami-stuffed-pepperoncini"],
      ] },
    ],
    /* Their whole published menu, read from https://www.paulosausageco.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    slug: 'pippal',
    name: 'Pipp\u0101l',
    label: 'Pipp\u0101l',
    cuisine: 'Regional Indian',
    tagline: 'Regional Indian, elevated dining. Dublin.',
    color: '#9B3326',
    icon: 'pippal',
    prep: 25,
    category: 'Regional Indian',
    site: 'https://www.pippaldublin.com',
    /*
      Their own reel, sent 2026-08-03 beside their profile — the account that
      posted it is @pippaldublin. A card that opens the post; nothing copied.
    */
    clip: { src: '/clips/pippal.mp4', poster: '/clips/pippal-poster.webp', href: 'https://www.instagram.com/reel/DaBs4utDZXb/', credit: 'Filmed by Pippāl', platform: 'Instagram' },
    orderUrl: 'https://order.toasttab.com/online/pippal-dublin-4500-tassajara-rd-unit-c',
    address: '4500 Tassajara Rd, Suite C, Dublin',
    // OPEN, despite a "coming soon" post still sitting on their grid — that
    // post is stale. Dine-in list prices from their own site's menu backend.
    siteNote: 'See the full menu and book at pippaldublin.com',
    items: [],
    /* Their whole published menu, read from https://www.pippaldublin.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Biryani", items: [
        ["Lucknowi Chicken Biryani", "Lucknowi Chicken biryani, Fragrant basmati rice with tender Corniche hen, brown onions, dry fruits, accompanied by cooling raita.", 3400, "pippal-lucknowi-chicken-biryani"],
        ["Chilli Garlic Naan", "Chilli Garlic Naan – Soft, pillowy tandoor-baked bread topped with fresh garlic and herbs", 600, "pippal-chilli-garlic-naan"],
        ["Pappad Sampler", "Papad Sampler Assortment of Indian papads with chutneys.", 1400, "pippal-pappad-sampler"],
        ["Live Chaat Trolley for 2", "• Live Chaat Classic Indian chaat reimagined with papadi, dhokla, chutneys, sev, & liquid nitrogen frozen yogurt.", 2800, "pippal-live-chaat-trolley-for-2"],
        ["Quinoa Bhel", "Quinoa bhel Light and crunchy puffed rice with quinoa, pomelo, ginger, & assorted chutneys.", 1600, "pippal-quinoa-bhel"],
        ["Sprout Salad", "Sprout Salad: a healthy mix of sprouted lentils and pomelos, tossed with fresh herbs, lemon juice, and light spices for a refreshing crunch.", 1600, "pippal-sprout-salad"],
        ["Kaahmiri Rajma Salad", "Kashmiri Rajma salad Nutty rajma hummus paired with sprouts, crunchy potatoes, & pickled vegetables.", 1600, "pippal-kaahmiri-rajma-salad"],
        ["Live Chaat Trolley for 4", "Live Chaat Classic Indian chaat reimagined with papadi, dhokla, chutneys, sev, & liquid nitrogen frozen yogurt.", 4200, "pippal-live-chaat-trolley-for-4"],
      ] },
      { name: "Veg starters", items: [
        ["Mushroom MOMO", "Mushroom Momo, Soft steamed dumplings stuffed with finely chopped mushrooms, herbs, and light spices, served with tangy spicy chutney.", 1600, "pippal-mushroom-momo"],
        ["Roasted Gun Powder Idly", "Roasted gun powder idlis steamed Coin idlis tossed in roasted gunpowder, served with mustard curry leaves & tomato chutney.", 1800, "pippal-roasted-gun-powder-idly"],
        ["Mushroom Galouti", "Mushroom Galouti, Delicate mushroom mince galouti with brown cashew-apricot chutney, crispy mushrooms, and coriander khamiri.", 2000, "pippal-mushroom-galouti"],
        ["Chakri Paneer", "Chakri paneer, Aromatic paneer roomali stuffed with saffron, coriander, cashew, crispy spinach, & malai cream.", 2000, "pippal-chakri-paneer"],
        ["Arbi Ke Kebab", "Arbi ke kebab, Spiced taro root mince kebabs with coriander & carom seeds, served with khamiri roti & mint chutney.", 1800, "pippal-arbi-ke-kebab"],
        ["Veg Manchow Soup", "Veg Manchow Soup, A spicy, flavorful Indo-Chinese soup made with mixed vegetables, garlic, ginger, and soy, topped with crispy fried noodles.", 1400, "pippal-veg-manchow-soup"],
      ] },
      { name: "Non-veg starters", items: [
        ["Chicken Tikka Trio", "Chicken tikka trio Three flavorful tikka variations, classic, malai, & coriander, accompanied by mint-garlic chutney", 2200, "pippal-chicken-tikka-trio"],
        ["Fish Cutlet", "Fish cutlet Crispy fried fish with a nutty peanut-butter finish, served alongside potato chips, & pickled onion.", 2200, "pippal-fish-cutlet"],
        ["Andhra Fried Chicken", "Andhra fried chicken Spiced Andhra-style fried chicken paired with tangy pickled onion & aromatic curry leaf.", 2200, "pippal-andhra-fried-chicken"],
        ["Prawn Pepper Fry", "Prawn pepper fry Succulent prawns tossed with black pepper, curry leaf, onion-garlic tadka, & young coconut.", 2400, "pippal-prawn-pepper-fry"],
        ["Pathar Ke Kebab", "Pathar ke kebab Flavorful kebabs cooked on a stone slab, served with mint-garlic chutney, young onion, & coriander.", 2400, "pippal-pathar-ke-kebab"],
        ["Lamb CHOPS", "Lamb Chops, Juicy lamb chops marinated in yogurt and spices, slow cooked in a clay pot, then perfectly toasted for a smoky, tender finish.", 3200, "pippal-lamb-chops"],
        ["Chicken Momo", "Chicken Momo, steamed dumplings filled with juicy minced chicken, herbs, and mild spices, served with spicy chutney.", 1800, "pippal-chicken-momo"],
        ["Dal Jakhiya", "Dal jakhiya, Mix yellow lentils flavored with jakhiya seeds, fresh ginger, tomato, & ghee", 2200, "pippal-dal-jakhiya"],
        ["Asami Vegetable Coconut Curry", "Asami vegetable coconut curry, A fragrant coconut curry of seasonal vegetables, flavored with kaffir lime, galangal, and curry leaf.", 2800, "pippal-asami-vegetable-coconut-curry"],
        ["Malai Kofta", "Malai kofta, Delicate koftas in rich cashew gravy, paired with fresh fruits, cream cheese, and pan-seared asparagus.", 2800, "pippal-malai-kofta"],
        ["Paneer Parat", "Paneer Parat, Delicate six layered paneer in roasted tomato gravy, enhanced with coconut chili oil and curry leaf.", 3000, "pippal-paneer-parat"],
        ["Himalyan Jangli Mushrooms", "Himalayan jangli Mushrooms, Wild mushrooms paired with mushroom purée & drizzled with fragrant curry leaf oil.", 3000, "pippal-himalyan-jangli-mushrooms"],
        ["Litti Chokha", "Litti chokha, Wheat dough balls stuffed with Sattu, served with roasted eggplant & potato chokha, finished with ghee", 2800, "pippal-litti-chokha"],
        ["Sarson Saag", "Sarson saag, Fresh mustard greens cooked with garlic, white butter, and jaggery, served with pickled onion", 2800, "pippal-sarson-saag"],
        ["Tawa Sabzi", "Tawa Sabzi A vibrant medley of seasonal vegetables tossed on a hot iron tawa with aromatic Indian spices, fresh herbs", 2800, "pippal-tawa-sabzi"],
      ] },
      { name: "Non-veg mains", items: [
        ["Laal Mass", "Laal Mass, Spicy Rajasthani-style goat curry with fresh coriander and a drizzle of chili oil.", 3400, "pippal-laal-mass"],
        ["Kashmiri Mutton Gustaba", "Kashmiri Mutton Gustaba, Succulent mutton mince balls simmered in yogurt gravy with dry mint and crisp nadru", 3000, "pippal-kashmiri-mutton-gustaba"],
        ["East India Butter Chicken", "Butter Chicken – Tender chicken simmered in a rich, creamy tomato-butter gravy, delicately spiced and finished with aromatic herbs.", 3000, "pippal-east-india-butter-chicken"],
        ["Chicken Saoji", "Chicken Saoji – A fiery Maharashtrian specialty featuring tender chicken slow-cooked in a bold, aromatic gravy made with traditional Saoji spices.", 3200, "pippal-chicken-saoji"],
        ["Mango Alleppey Fish & Prawn Curry", "Mango Alleppey fish & prawn curry, Delicate seafood in creamy coconut-mango gravy, accented with curry leaf and chili oil.", 3600, "pippal-mango-alleppey-fish-prawn-curry"],
        ["Parsi Fish Curry", "Parsi fish curry, Delicate steamed fish served with mustard-flavored coconut and coriander gravy.", 3200, "pippal-parsi-fish-curry"],
        ["Goan crab cake", "Goan Crab Cake, Succulent crab simmered in a spiced Goan coconut-tomato sauce with mustard, curry leaf, and chili oil.", 3400, "pippal-goan-crab-cake"],
        ["Naga Chicken Curry", "Naga chicken curry, Tender chicken simmered in a fragrant Naga-style curry with tomato, galangal, lemongrass, and curry leaf.", 3000, "pippal-naga-chicken-curry"],
        ["Bhopali Pulao", "Bhopali pulao, Fragrant rice with delicate cheese dumplings.", 2400, "pippal-bhopali-pulao"],
        ["Steamed Rice", "Steamed rice, Aromatic basmati rice, delicately steamed.", 600, "pippal-steamed-rice"],
      ] },
      { name: "Breads", items: [
        ["Plain Naan", "Plain Naan – Soft and fluffy tandoor-baked flatbread with a delicate golden crust, perfect for scooping up rich curries and flavorful gravies.", 500, "pippal-plain-naan"],
        ["Butter Naan", "layered Hand-stretched naan baked in the tandoor until pillowy and lightly charred, finished with melted butter for a rich, comforting flavor.", 600, "pippal-butter-naan"],
        ["Garlic Naan", "Garlic Naan – Soft, pillowy tandoor-baked bread topped with fresh garlic and herbs", 600, "pippal-garlic-naan"],
        ["Beetroot Ki Roti", "Beetroot Roti – Soft whole wheat flatbread infused with fresh beetroot, offering a vibrant color, natural sweetness, and wholesome nutrition in every bite.", 800, "pippal-beetroot-ki-roti"],
        ["Lacha Paratha", "Laccha Paratha – Flaky, multi-layered Indian flatbread, expertly hand-rolled and cooked to golden perfection", 800, "pippal-lacha-paratha"],
        ["Bene Dosa", "Benne Dosa – A crispy, buttery Karnataka-style dosa, golden brown on the outside and soft inside,", 600, "pippal-bene-dosa"],
        ["Bread Basket", "Bread Basket – An assortment of freshly baked Indian breads, featuring a selection of naan, paratha, and roti, served warm to complement your dining experience.", 4200, "pippal-bread-basket"],
        ["Bajra Roti", "Bajra Roti – A rustic pearl millet flatbread, rich in fiber and earthy flavors", 800, "pippal-bajra-roti"],
        ["Missi Roti", "", 800, "pippal-missi-roti"],
        ["Pudina Parantha", "Layered Pudina Paratha – Flaky, multi-layered whole wheat flatbread infused with fresh mint and aromatic spices, pan-cooked to golden perfection for a crisp", 800, "pippal-pudina-parantha"],
        ["Makkai Roti", "Missi Roti – A traditional North Indian flatbread made with gram flour and whole wheat, delicately spiced and cooked to perfection for a hearty, rustic flavor.", 800, "pippal-makkai-roti"],
      ] },
      { name: "Dips", items: [
        ["Mint Chutney", "Mint Chutney – A refreshing blend of fresh mint, cilantro, green chilies, and spices", 200, "pippal-mint-chutney"],
        ["Tamrind Chutney", "Tamarind Chutney – A sweet and tangy chutney crafted from tamarind, jaggery, and aromatic spices", 200, "pippal-tamrind-chutney"],
        ["Yogurt", "Yogurt Dip – A creamy and refreshing blend of fresh yogurt, herbs, and subtle spices, offering a cool and flavorful accompaniment to breads, kebabs", 200, "pippal-yogurt"],
        ["Lemon Onion Chili", "Lemon, Onion & Chili – A classic Indian accompaniment featuring crisp onions, fresh lemon wedges, and green chilies, adding a vibrant burst of zest, heat", 200, "pippal-lemon-onion-chili"],
        ["Spicy Chutney", "Spicy Chutney – A bold and fiery blend of fresh chilies, herbs, and aromatic spices, crafted to add an intense kick and vibrant flavor to every dish.", 200, "pippal-spicy-chutney"],
        ["Cucumber Raita", "Cucumber Raita – A cooling blend of creamy yogurt, crisp cucumber, and roasted spices, offering a refreshing balance to rich and flavorful Indian dishes.", 600, "pippal-cucumber-raita"],
        ["Boondi Raita", "Boondi Raita – A refreshing yogurt-based accompaniment with crispy chickpea pearls, lightly seasoned with roasted spices for a creamy, crunchy", 600, "pippal-boondi-raita"],
      ] },
      { name: "Desserts", items: [
        ["Shahi Gola", "Shahi gola, ghee cooked balushahi paired with creamy rabri, garnished with dry fruits, saffron, and silver varq", 1500, "pippal-shahi-gola"],
        ["Moong Daal Halwa", "Moong Dal Halwa, A rich, slow-cooked lentil halwa made with ghee, sugar, and aromatic cardamom.", 1500, "pippal-moong-daal-halwa"],
        ["Daulat Ki Chaat", "Daulat ki chaat, Light, airy winter delicacy of milk topped with saffron & cardamom.", 1500, "pippal-daulat-ki-chaat"],
        ["Payasum", "Payasam, Classic South Indian pudding with milk, stuffed ice cream, a touch of sweetness from dry fruits, and cardamom.", 1500, "pippal-payasum"],
      ] },
      { name: "Celebration desserts", items: [
        ["Ghewar", "Ghewar, freshly prepared crispy honeycomb Ghewar, served warm with rich, creamy rabri", 1500, "pippal-ghewar"],
        ["French Fries Waffle", "Waffle Fries – Crispy golden waffle-cut potato fries, perfectly seasoned and served hot for a crunchy, flavorful bite.", 1400, "pippal-french-fries-waffle"],
        ["Corn Cheese", "Corn Cheese – Sweet corn kernels tossed with melted cheese, herbs, and spices, baked until warm, creamy, and irresistibly delicious.", 1400, "pippal-corn-cheese"],
        ["Chicken Nuggets", "Chicken Nuggets – Crispy golden chicken nuggets made with tender, juicy chicken and served with your favorite dipping sauce.", 1400, "pippal-chicken-nuggets"],
        ["Fried Fish", "Fried Fish – Fresh fish fillets coated in a light, crispy batter and fried to golden perfection, served with a zesty dipping sauce.", 1400, "pippal-fried-fish"],
        ["Cheese Dosa", "Cheese Dosa – A crispy South Indian dosa generously filled with melted cheese, creating the perfect blend of crunchy texture and creamy indulgence.", 1600, "pippal-cheese-dosa"],
        ["Chocolate Dosa", "Chocolate Dosa – A crispy golden dosa drizzled with rich chocolate and filled with a luscious chocolate spread for a delightful sweet treat.", 1600, "pippal-chocolate-dosa"],
        ["Butter Chicken Meal", "Butter Chicken with Butter Naan – Tender chicken simmered in a rich, creamy tomato-butter gravy, served with soft, freshly baked butter naan.", 2000, "pippal-butter-chicken-meal"],
        ["Shahi Paneer Meal", "Shahi Paneer with Butter Naan – Soft paneer cubes simmered in a rich, creamy royal gravy, served with freshly baked butter naan brushed with melted butter.", 2000, "pippal-shahi-paneer-meal"],
        ["Vanilla Ice Cream", "Vanilla Ice Cream – Smooth and creamy vanilla ice cream crafted with rich dairy and pure vanilla for a timeless, refreshing treat.", 900, "pippal-vanilla-ice-cream"],
        ["Berrries Ice Cream", "Berries Ice Cream – Creamy ice cream infused with a medley of fresh berries, offering the perfect balance of sweet and tangy flavors.", 900, "pippal-berrries-ice-cream"],
        ["Plain Idli", "", 1400, "pippal-plain-idli"],
        ["Kids Mango Lassi", "Mango Lassi – A refreshing blend of ripe mangoes and creamy yogurt, lightly sweetened for a smooth and tropical delight.", 900, "pippal-kids-mango-lassi"],
      ] },
    ],
    /* Their whole published menu, read from https://www.pippaldublin.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    slug: 'glasshouzz',
    name: 'Glasshouzz',
    label: 'Glasshouzz',
    cuisine: 'California fusion',
    tagline: 'Pizza, salad and snacks. Livermore.',
    color: '#1E2A22',
    icon: 'glasshouzz',
    prep: 20,
    category: 'Pizza & Plates',
    site: 'https://www.glasshouzzusa.com/',
    /*
      Sent 2026-08-03 beside their profile. NOT THEIR OWN FILM — the account
      that posted it is @volha_creative, a content creator — so it is credited
      to her and opened on Instagram rather than copied here. Same footing as
      the Lucky Three Seven clip, and worth him confirming with her.
    */
    clip: { src: '/clips/glasshouzz.mp4', poster: '/clips/glasshouzz-poster.webp', href: 'https://www.instagram.com/reel/DYI6AJgIFII/', credit: 'Filmed by @volha_creative', platform: 'Instagram' },
    orderUrl: 'https://glasshouzz.toast.site/order/glass-houzz-4575-livermore-outlets-drive',
    address: '4575 Livermore Outlets Drive, Livermore',
    /*
      From the operator's own "Glass Houzz x Biggie" sheet, quoted rather than
      paraphrased — the free side is tied to a 14 inch or larger pizza and the
      drink to a menu-item purchase, and both of those conditions are the whole
      offer. An unqualified "free side" is not what either party agreed.

      `mock` until Glass Houzz confirms it themselves. He has drafted this and
      the page says so; the difference between a draft he wrote and a deal they
      signed is exactly the difference this flag exists to keep visible.
    */
    offers: {
      mock: true,
      welcome: 'A free side of your choice with any 14 inch or larger pizza.',
      loyalty: 'A free fountain drink with each menu item, any visit.',
    },
    // Prices from their OWN Toast ordering site. DoorDash runs about 25% higher
    // on the same items, measured across fifteen of them, so it was not used.
    // Pizzas are sold by size; the 14 inch price is listed and named as such so
    // the figure on the tile is one a customer can actually pay.
    offer: [
      'Pepperoni Rustic, 14 inch',
      'Margherita Lovers, 14 inch',
      'Spaghetti Carbonara',
      'Lamb Roll Wrap',
      'Classic Ceasar',
    ],
    siteNote: 'Order direct on their own Toast page',
    items: [
      ['Pepperoni Rustic, 14 inch', 'Classic pepperoni with a rich tomato sauce', 2800, '~glasshouzz-pepperoni-rustic'],
      ['Margherita Lovers, 14 inch', 'Crushed San Marzano tomato, a timeless classic', 2600, '~glasshouzz-margherita'],
      ['Mushroom Truffle, 14 inch', 'Sauteed mushrooms and truffle', 2400],
      ['Spaghetti Carbonara', 'Spaghetti carbonara', 2200, '~glasshouzz-carbonara'],
      ['Penne Arrabbiata', 'Penne arrabbiata', 1800],
      ['Lamb Roll Wrap', 'Lamb roll wrap', 1800, '~glasshouzz-lamb-roll-wrap'],
      ['Classic Ceasar', 'Their spelling. Classic Caesar salad', 1200, '~glasshouzz-classic-ceasar'],
      ['GH Caprese', 'Caprese', 1200],
      ['Garlic Bread', 'Garlic bread', 600],
    ],
  },
  {
    slug: 'poof-of-alchemy',
    name: 'Poof of Alchemy',
    label: 'Poof of Alchemy',
    cuisine: 'Copper drinkware',
    tagline: 'A solid copper wand for your own bottle or glass.',
    color: '#B87333',
    icon: 'poof-of-alchemy',
    prep: 0,
    category: 'Shop',
    site: 'https://poofofalchemy.com',
    // One product, one price, read from their own Shopify storefront and
    // confirmed identical across their own products.json endpoints — so it is
    // orderable rather than contact-only. Not food, so it still sits with the
    // non-kitchen tiles.
    siteNote: 'See it on their own store at poofofalchemy.com',
    items: [
      ['Copper Water Wand', 'Two per pack. A solid copper rod for your own bottle or glass', 4100],
    ],
  },
  {
    slug: 'allis-dog-walking',
    name: "Alli's Dog Walking & Petsitting",
    label: "Alli's Dog Walking",
    cuisine: 'Dog walking, pet sitting',
    tagline: 'Dog walking and pet sitting. Philadelphia and southern New Jersey.',
    color: '#111111',
    // No icon file: their logo is not published anywhere fetchable. The
    // generated monogram is the honest placeholder — asking an image model for
    // "her logo" would produce a convincing fake of a real mark, which is a
    // worse problem than not having it yet.
    icon: '',
    prep: 0,
    category: 'Service',
    phone: '(856) 360-5288',
    address: 'Philadelphia and southern New Jersey',
    // NO WEBSITE. allisdogwalking.com no longer resolves at all (NXDOMAIN), so
    // linking it would send customers to a browser error. The phone number is
    // the only route that works, and it is verified against her Yelp listing.
    //
    // Her own description of the work is quoted as hers rather than asserted as
    // a qualification: no licence, bonding or insurance is published anywhere,
    // and care of animals with medical needs is not a claim to make on someone
    // else's behalf.
    contactOnly:
      "Alli walks dogs and pet-sits \u2014 not a kitchen, so there is nothing to order here. She describes her service as specialising in dogs with medical, behavioural and social needs. She works in Philadelphia and southern New Jersey, not the Bay Area. Call to arrange.",
    items: [],
  },
  {
    /*
      Leon Kelvin Li's own practice, added at the operator's request — he asked
      for the work and the pricing to sit on this home screen.

      Branding is taken from noctilucenty.github.io, which calls itself
      "Noctilucente", rather than invented. Every price below is his own,
      quoted verbatim as a RANGE, because that is how he quotes them.

      quoteOnly, so nothing here can reach the cart. A $650 website in the same
      basket as a $4.50 frankfurter would be absurd, and the checkout would try
      to charge it.
    */
    slug: 'noctilucente',
    name: 'Noctilucente',
    label: 'Noctilucente',
    cuisine: 'Software studio',
    tagline: 'Custom software and AI systems for businesses. Built by Leon Kelvin Li.',
    color: '#101828|#1D2939',
    icon: 'noctilucente',
    prep: 0,
    category: 'Software',
    site: 'https://noctilucenty.github.io/',
    siteCta: 'See the portfolio',
    siteNote: 'See past work and case studies at noctilucenty.github.io',
    phone: '(510) 826-7735',
    /* The domain address, as on the Designs page (Glenn, 2026-09-02: it "won't
       get mixed up with your current emails"). The number stays: this is a
       listing's contact card, like every other business on the sheet. */
    email: 'designs@beastypages.com',
    quoteOnly:
      'Every project is quoted after a conversation, so nothing here is ordered through the app. Prices are ranges because scope decides the number, not the category. The consultation is free.',
    perk: {
      headline: '10% off every service',
      detail: 'For anyone who finds him through this home screen. Applies to the whole list below.',
    },
    groups: [
      {
        name: 'AI & automation',
        items: [
          ['AI call agent', 'Answers the phone around the clock, books appointments, takes messages', 200000, '$2,000-10,000+'],
          ['AI support chatbot', 'Answers customer questions on your site instead of an inbox that waits until Monday', 100000, '$1,000-5,000+'],
          ['AI knowledge base', 'Your manuals, SOPs and PDFs become an assistant that answers with the source it used', 300000, '$3,000-15,000+'],
          ['AI assistant for staff', 'Your team asks it instead of asking each other, or guessing', 300000, '$3,000-15,000+'],
          ['AI research agent', 'Gathers and summarises what you would otherwise pay someone to read', 300000, '$3,000-20,000+'],
          ['AI sales and lead qualifier', 'Works new enquiries out of hours and hands you the ones worth calling', 250000, '$2,500-10,000+'],
          ['AI voice assistant', 'Spoken, not typed, for hands-busy work', 300000, '$3,000-15,000+'],
          ['Document processing and OCR', 'Invoices, forms and scans read into your system without retyping', 200000, '$2,000-8,000+'],
        ],
      },
      {
        name: 'Custom software',
        items: [
          ['Business management system', 'One system for the whole operation instead of five that disagree', 800000, '$8,000-50,000+'],
          ['CRM', 'Every customer, quote and follow-up in one place', 300000, '$3,000-20,000+'],
          ['Inventory management', 'Know what you actually have, without a stocktake', 300000, '$3,000-20,000+'],
          ['Booking and scheduling', 'Customers book themselves, into slots you control', 150000, '$1,500-10,000+'],
          ['Customer portal', 'Your customers check their own orders, invoices and history', 300000, '$3,000-15,000+'],
          ['Employee dashboard', 'What each person needs to do today, without being asked', 200000, '$2,000-10,000+'],
          ['Admin dashboard', 'The controls to run it all, built for whoever actually runs it', 200000, '$2,000-8,000+'],
        ],
      },
      {
        name: 'Web & mobile',
        items: [
          ['Business website', 'A site that brings in work, not a brochure nobody reads', 65000, '$650-3,000+'],
          ['Online store', 'Sell online, with payments, stock and shipping wired together', 200000, '$2,000-10,000+'],
          ['iOS and Android app', 'A real app on both stores, not a website in a wrapper', 500000, '$5,000-30,000+'],
          ['Installable web app', 'Works like an app from a link, with no store approval to wait on', 200000, '$2,000-10,000+'],
        ],
      },
      {
        name: 'Integrations',
        items: [
          ['Payments', 'Stripe and card payments wired into what you already use', 50000, '$500-3,000+'],
          ['Accounting', 'QuickBooks or Xero, kept in step without anyone exporting a spreadsheet', 100000, '$1,000-5,000+'],
          ['Google Workspace automation', 'Sheets, Drive, Calendar and Gmail doing the admin themselves', 50000, '$500-3,000+'],
          ['Messaging', 'Meta, WhatsApp and SMS connected to your own systems', 100000, '$1,000-5,000+'],
          ['Custom API', 'When two systems need to talk and nothing off the shelf does it', 100000, '$1,000-8,000+'],
        ],
      },
      {
        name: 'Business automation',
        items: [
          ['Workflow automation', 'The repetitive part of the day, done without anyone doing it', 150000, '$1,500-10,000+'],
          ['Lead generation', 'Finds and sorts prospects so you call the right ones', 200000, '$2,000-8,000+'],
          ['Automated follow-ups', 'Nobody falls through the cracks because someone forgot', 100000, '$1,000-5,000+'],
          ['Quotes and invoices', 'Raised, sent and chased on their own', 100000, '$1,000-5,000+'],
          ['Report generation', 'The report that took a morning, on a schedule', 100000, '$1,000-4,000+'],
        ],
      },
      {
        name: 'Data & analytics',
        items: [
          ['Executive dashboard', 'The numbers you actually decide on, on one screen', 200000, '$2,000-10,000+'],
          ['KPI platform', 'Targets tracked continuously instead of at month end', 300000, '$3,000-15,000+'],
          ['Customer insights', 'Who buys what, how often, and who is about to stop', 200000, '$2,000-8,000+'],
          ['AI reporting', 'Reports that explain the change, not just show it', 200000, '$2,000-10,000+'],
        ],
      },
    ],
    items: [],
  },
  {
    /*
      RICO RICO TACO — sent by the operator 2026-08-25 as "Oakland • Goods"
      and "San Ramon • Goods", with "Just opened new location in San Ramon".

      NO PRICES, and their menu is not the reason. They publish the whole thing
      — every taco, every filling, in their own words — and put a number
      against none of it. The only dollar figure anywhere on the site is a
      Chronicle pull-quote about meals under $20, which is a critic's line and
      not a price list. So the descriptions below are theirs and the menu here
      stays unpriced rather than triangulated.
    */
    slug: 'rico-rico-taco',
    logoTemplate: 'wordmark',
    logoLines: ['Rico Rico', 'TACO'],
    logoFace: 'script',
    name: 'Rico Rico Taco',
    label: 'Rico Rico',
    cuisine: 'Mexican, tacos',
    tagline: 'Un Taco Al Día es La Llave De La Alegría',
    color: '#131417|#7A1B22',
    prep: 0,
    category: 'Mexican',
    site: 'https://www.ricoricotaco.com/',
    phone: '(510) 922-8262',
    address: '3205 Lakeshore Ave, Oakland, CA 94610',
    items: [],
    /* Their whole published menu, read from https://www.ricoricotaco.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Tacos", items: [
        ["Taco Al Pastor", "one spit-roasted pork taco topped with pineapple, onion, cilantro, salsa", 525, "ricoricotaco-taco-al-pastor"],
        ["Taco de Camaron", "one sautéed shrimp taco topped with chipotle crema, pico de gallo, salsa", 575, "ricoricotaco-taco-de-camaron"],
        ["Taco de Carne Asada", "one steak taco topped with onion, cilantro, salsa", 550, "ricoricotaco-taco-de-carne-asada"],
        ["Taco de Chorizo", "one pork chorizo taco topped with pineapple, onion, cilantro, salsa", 525, "ricoricotaco-taco-de-chorizo"],
        ["Taco de Pescado", "one crispy fried fish taco topped with chipotle crema, cabbage, pico de gallo ,pickled onions", 575, "ricoricotaco-taco-de-pescado"],
        ["Taco de Hongos", "one sautéed mushroom taco topped with queso cotija, salsa", 525, "ricoricotaco-taco-de-hongos"],
        ["Taco de Nopal", "one sautéed cactus taco topped with queso cotija and salsa", 525, "ricoricotaco-taco-de-nopal"],
        ["Taco Veggie", "one rice & bean taco topped with lettuce, pico de gallo, crema, queso cotija, salsa", 525, "ricoricotaco-taco-veggie"],
        ["Burrito", "Bean, Cheese + Rice Burrito", 900],
        ["Alpastor Burrito", "spit-roasted pork, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 1400],
        ["Camaron Burrito", "sautéed shrimp with tomato & onion, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 1600],
        ["Carne Asada Burrito", "steak, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 1500],
        ["Carnitas Burrito", "crispy fried pork, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 1400],
        ["Chile Relleno Burrito", "rice, beans, queso cotija, crema , tomato sauce, salsa", 1600],
        ["Chorizo Burrito", "pork chorizo, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 1400],
        ["Hongo Burrito", "sautéed mushroom with tomato & onion, rice, beans, cheese, crema, onion, cilantro, salsa", 1400],
        ["Pescado Burrito", "crispy fried fish, rice, beans, cheese, chipotle crema, pico de gallo, cabbage, avocado sauce, salsa", 1600],
        ["Veggie Burrito", "rice, beans, lettuce, pico de gallo, crema, cheese, avocado sauce, salsa", 1300],
        ["Nopal Burrito", "sautéed cactus with onion, rice, beans, cheese, crema, onion, cilantro, salsa", 1400],
        ["20 Tacos", "", 9500],
        ["30 Tacos", "", 13500],
        ["40 Tacos", "", 17000],
        ["50 Tacos", "", 21250],
      ] },
      { name: "Burrito bowls", items: [
        ["Alpastor Bowl", "", 1425, "ricoricotaco-alpastor-bowl"],
        ["Camaron Bowl", "", 1625, "ricoricotaco-camaron-bowl"],
        ["Carne Asada Bowl", "", 1525, "ricoricotaco-carne-asada-bowl"],
        ["Carnitas Bowl", "", 1425, "ricoricotaco-carnitas-bowl"],
        ["Chorizo Bowl", "", 1425, "ricoricotaco-chorizo-bowl"],
        ["Pescado Bowl", "", 1625, "ricoricotaco-pescado-bowl"],
        ["Pollo Asado Bowl", "", 1425, "ricoricotaco-pollo-asado-bowl"],
        ["Veggie Bowl", "", 1425, "ricoricotaco-veggie-bowl"],
        ["Hongos Bowl", "", 1425, "ricoricotaco-hongos-bowl"],
        ["Nopal Bowl", "", 1425, "ricoricotaco-nopal-bowl"],
      ] },
      { name: "Quesadillas", items: [
        ["Alpastor Quesadilla", "spit-roasted quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1400, "ricoricotaco-alpastor-quesadilla"],
        ["Camaron Quesadilla", "shrimp quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1600, "ricoricotaco-camaron-quesadilla"],
        ["Carne Asada Quesadilla", "Asada quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1500, "ricoricotaco-carne-asada-quesadilla"],
        ["Carnitas Quesadilla", "crispy fried pork quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1400, "ricoricotaco-carnitas-quesadilla"],
        ["Chorizo Quesadilla", "chorizo quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1400, "ricoricotaco-chorizo-quesadilla"],
        ["Hongos Quesadilla", "mushroom quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1400, "ricoricotaco-hongos-quesadilla"],
        ["Nopal Quesadilla", "cactus quesadilla served with a side of lettuce, pico de gallo, crema, salsa", 1400, "ricoricotaco-nopal-quesadilla"],
        ["Pescado Quesadilla", "crispy fried fish quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1600, "ricoricotaco-pescado-quesadilla"],
        ["Pollo Asado Quesadilla", "flamed grilled chicken quesadilla served with a side of lettuce, pico de gallo, crema, salsa", 1400, "ricoricotaco-pollo-asado-quesadilla"],
        ["Quesadilla de Queso", "cheese quesadilla served with side of lettuce, pico de gallo, crema, salsa", 1200, "ricoricotaco-quesadilla-de-queso"],
        ["Quesadilla De Masa", "Corn quesadilla filled with your choice of protein, lettuce, queso cotija, crema, salsa", 1350],
        ["Huarachito", "handmade oval fried corn tortilla filled with refried beans, topped with choice of meat or nopales, onion, cilantro, queso cotija, salsa", 1150, "ricoricotaco-huarachito"],
      ] },
      { name: "Plates", items: [
        ["Chille Relleno", "roasted chile poblano stuffed with cheese, dipped in egg batter, served in tomato sauce, served with rice and two tortillas", 1595, "ricoricotaco-chille-relleno"],
        ["Flautas", "four crispy tortillas filled with chicken, topped with lettuce, cabbage, crema, queso cotija, pickled onions, salsa, served with rice", 1675, "ricoricotaco-flautas"],
        ["Sopes", "Two sopes topped with lettuce, cabbage, crema, queso cotija, pickled onions, tomato salsa, served with rice", 1675, "ricoricotaco-sopes"],
      ] },
      { name: "Salads", items: [
        ["House Salad", "deep fried tortilla topped with black beans, mixed greens, lettuce, radish, carrots, pico de gallo, queso cotija, salsa", 1250, "ricoricotaco-house-salad"],
        ["Chips + Avocado Sauce + Salsa", "Chips + Avocado Sauce + Salsa", 375, "ricoricotaco-chips-avocado-sauce-salsa"],
        ["Chips + Chunky Guacamole", "", 550, "ricoricotaco-chips-chunky-guacamole"],
        ["Chips & Pico De Gallo", "", 375],
        ["Chips", "", 275, "ricoricotaco-chips"],
        ["Side of Chunky Guacamole", "", 350],
        ["Side of Avocado Sauce", "", 150],
        ["Side of Pico De Gallo", "", 150],
        ["Rice", "", 275, "ricoricotaco-rice"],
        ["Beans", "", 275, "ricoricotaco-beans"],
        ["Rice & Beans", "", 500],
        ["3 Tortillas", "", 225, "ricoricotaco-3-tortillas"],
        ["Side of Avocado sauce (3) packets", "", 100],
        ["Side of Crema", "", 150],
        ["Side of Mozzarella Cheese (negro)", "", 175],
        ["Side de Cotija (clear)", "", 175],
      ] },
      { name: "Kids", items: [
        ["Kids Burrito", "", 700],
        ["Kids Quesadilla", "Flour quesadilla served with a side of sour cream", 700, "ricoricotaco-kids-quesadilla"],
        ["Pacifico", "", 425],
        ["Corona", "", 425],
        ["Modelo", "", 425],
        ["Negra Modelo", "", 425],
        ["Coors Light", "", 425],
        ["Bohemia", "", 425],
        ["Heineken Non Alcoholic", "", 475],
        ["Dos XX Ambar", "", 425],
      ] },
      { name: "Drinks", items: [
        ["Coca-Cola", "Coca-Cola Original Taste — the crisp, refreshing taste you know and love", 375, "ricoricotaco-coca-cola"],
        ["Diet Coke, Can", "Take a Diet Coke break with this refreshing, no-calorie soft drink", 200, "ricoricotaco-diet-coke-can"],
        ["Jarrito- Mandarin", "", 375],
        ["Jarrito- Tamarindo", "", 375],
        ["Jarrito - Fruit Punch", "", 375],
        ["Jarrito -Mineral Water", "Topo Chico has always been known for the legend surrounding its origins. Whether you believe in the legend or not, you'll still be able to enjoy the crisp", 375, "ricoricotaco-jarrito-mineral-water"],
        ["Squirt", "", 375],
        ["Jarrito- Lime", "", 375],
        ["Horchata", "", 460, "ricoricotaco-horchata"],
        ["Jamaica", "", 460, "ricoricotaco-jamaica"],
        ["Sandia", "", 460, "ricoricotaco-sandia"],
        ["PIÑA", "", 400],
        ["Fresa", "", 460, "ricoricotaco-fresa"],
        ["Water", "", 150, "ricoricotaco-water"],
        ["40 Flautas", "", 14000],
        ["Raglan", "", 3000],
        ["Zip-Up", "", 3200, "ricoricotaco-zip-up"],
      ] },
      { name: "Burritos", items: [
        ["20 Burritos", "Protein choice, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 26000],
        ["30 Burritos", "Protein choice, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 39000],
        ["40 Burritos", "Protein choice, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 52000],
        ["50 Burritos", "Protein choice, rice, beans, cheese, crema, onion, cilantro, avocado sauce, salsa", 65000],
      ] },
      { name: "Chips, Salsa & Avocado", items: [
        ["Chips, Salsa, Avocado Sauce (10-15)", "", 3000, "ricoricotaco-chips-salsa-avocado-sauce-10-15"],
        ["Chips + Chunky Guacamole (10-15)", "", 4500],
        ["Chunky Guacamole", "", 3000, "ricoricotaco-chunky-guacamole"],
        ["Rice (10-15)", "", 2500],
      ] },
      { name: "Beans", items: [
        ["Frijol Negro (10-15)", "", 2500, "ricoricotaco-frijol-negro-10-15"],
        ["Frijol Pinto (10-15)", "", 2500, "ricoricotaco-frijol-pinto-10-15"],
        ["Frijol Refrito (10-15)", "", 2500, "ricoricotaco-frijol-refrito-10-15"],
      ] },
      { name: "Salad", items: [
        ["Salad (10-15)", "", 3000, "ricoricotaco-salad-10-15"],
        ["Salad Vegan", "", 4500, "ricoricotaco-salad-vegan"],
        ["Fresa Traveler", "96 fl oz of Agua Fresca (Serves 8-10)", 2500],
      ] },
      { name: "Tees", items: [
        ["Crew Neck", "", 2000, "ricoricotaco-crew-neck"],
        ["Ringer Tee", "", 2000, "ricoricotaco-ringer-tee"],
      ] },
    ],
  },
  {
    /*
      ISLA FILIPINO RESTAURANT — "Pleasant Hill • Goods", 2026-08-25.

      He sent their hiring page; the business is the restaurant. They run
      several Bay Area rooms and the Pleasant Hill one trades as Isla Grand
      Restaurant Bar & Banquet, so that is the address and number here — the
      Directions button has to reach the branch he actually sold.

      NOT ONE PRICE ANYWHERE on their site, so nothing is priced here.
    */
    slug: 'isla-filipino',
    logoTemplate: 'wordmark',
    logoLines: ['Isla', 'FILIPINO RESTAURANT'],
    logoFace: 'script',
    name: 'Isla Filipino Restaurant',
    label: 'Isla',
    cuisine: 'Filipino',
    tagline: 'Kapampangan cooking from the Philippines\u2019 culinary capital.',
    color: '#131417|#1E5A4C',
    prep: 0,
    category: 'Filipino',
    site: 'https://www.islafilipinorestaurant.com/',
    phone: '(925) 849-6255',
    address: '548 Contra Costa Blvd., STE M, Pleasant Hill, CA 94523',
    siteNote: 'Isla Grand, their banquet room in Pleasant Hill, takes event bookings',
    items: [],
    /* Their published menu, read from the menu pages of islafilipinorestaurant.com on 2026-09-09; sections as they publish them. */
    sections: [
      { name: "Drinks", items: [
        ["Black Gulaman", "Black gulaman with jelly, coconut meat and crushed ice", 798],
        ["Fountain Soda (Bottomless)", "", 448],
        ["Hot Tea (Per Cup)", "", 398],
        ["Coffee", "", 498],
        ["Corona", "", 798],
        ["Heineken", "", 798],
        ["San Miguel Light", "", 798],
        ["San Miguel Pilsen", "", 798],
        ["Redhorse", "", 798],
      ]},
      { name: "Appetizers", items: [
        ["Original Sisig Kapampangan", "Spicy grilled minced pork sauteed and spiced, served sizzling (add $1 for chicharon or egg)", 1898],
        ["Ginataang Kuhol", "Shell-off snails in spicy coconut sauce with green beans and squash", 1798],
        ["Calamari", "Deep-fried jumbo squid, skin off, breaded", 1798],
        ["Chicharon Bulaklak", "Crispy pork ruffle fat", 2098],
        ["Lanz's Lumpiang Shanghai", "Fried spring rolls with ground chicken and vegetables", 1698],
        ["Fried Tofu", "Deep-fried breaded tofu", 2198],
        ["Prawn Crackers", "Deep-fried prawn crackers with spiced vinegar", 1398],
        ["Popcorn Shrimp", "Deep-fried breaded shrimp", 1898],
        ["Freshly Cooked Chicharon", "Crispy pork rind", 1698],
        ["Squid Ball", "Deep-fried squid balls with sweet chili sauce", 1798],
        ["Sizzling Sisig Tofu", "Spicy chopped fried tofu and onion sauteed in special sauce", 1798],
        ["Barbeque Pork Ears", "Grilled marinated pork ears", 1898],
      ]},
      { name: "Soups", items: [
        ["Misua", "Fine egg noodles in garlic, onion, chicken stock and egg, topped with fried garlic and green onion", 1598],
        ["Sigang Boneless Bangus (Boneless Bangus Sinigang)", "Boneless milkfish in tamarind sour broth and vegetables", 2398],
        ["Tinola Combination", "Chicken and green mussels in garlic, ginger, lemon grass with chayote, pepper leaves and spinach", 2198],
      ]},
      { name: "Pork", items: [
        ["Isla Pork Barbeque", "Family-recipe marinated grilled pork", 1898],
        ["Crispy Binagoongan Sa Gata (Guisadu)", "Crispy diced pork belly in spicy coconut sauce with onion, bell pepper, tomato, jalapeno", 2198],
        ["Crispy Sa Gata Pata (Pork Hocks) or Litsun Kawali (Pork Belly)", "Deep-fried crispy pork hock or belly in spicy coconut sauce", 2698],
        ["Crispy Binagoongan", "Crispy pork belly in shrimp sauce with eggplant, mango and tomato", 2198],
        ["Kalderetang Liempo (Pork Belly Kaldereta)", "Spicy pork belly stewed with carrots, peas, bell pepper and potato", 1998],
        ["Grilled Liempo", "Grilled marinated pork belly", 1998],
        ["Crispy Kari-Karing Pata (Crispy Pork Hock Kare-Kare)", "Deep-fried crispy pork hock in savory peanut sauce and vegetables", 2598],
        ["Crispy Kari-Karing Litsun Kawali (Crispy Pork Belly Kare-Kare)", "Deep-fried crispy pork belly in savory peanut sauce and vegetables", 2698],
        ["Tocino", "Marinated sweet pork", 1998],
        ["Longganisa (Pinoy Sweet Sausage)", "Pampanga-style sweet sausage", 1698],
        ["Adobung Liempo (Pork Belly Adobo)", "Pork belly simmered in garlic, soy sauce and vinegar with bay leaf, peppercorn and potato", 1998],
        ["Bistig Liempo (Bistek Pork Belly)", "Pork belly simmered in garlic, onion, calamansi/lemon, soy sauce and potato", 1998],
        ["Litsun Kawali (Lechon Kawali)", "Crispy deep-fried pork belly with spiced vinegar and lechon sauce", 2098],
        ["Crispy Pata", "Deep-fried pork hock with spiced vinegar and lechon sauce", 2098],
        ["Sigang Liempo (Sinigang na Liempo)", "Pork belly in tamarind sour broth and vegetables", 2198],
      ]},
      { name: "Beef", items: [
        ["Kari-Karing Brisket Ning Baka (Beef Brisket Kare-Kare)", "Beef brisket in savory peanut sauce with vegetables", 3098],
        ["Nilagang Beef Brisket (Ligang Brisket Ning Baka)", "Beef brisket with banana, carrot, potato, cabbage and bok choy", 2798],
        ["Isla Gotong Batangas (Kapampangan Style)", "Beef broth, beef meat and innards in garlic, lemon grass, ginger and jalapeno, with garlic rice", 1798],
        ["Adobung Brisket Ning Baka (Beef Brisket Adobo)", "Beef brisket simmered in adobo sauce and potato", 2798],
        ["Sizzling Beef Brisket Ala Pobre", "Beef brisket in Kapampangan seasoning, topped with crispy fried garlic", 2798],
        ["Kalderetang Brisket Ning Baka (Beef Brisket Kaldereta)", "Spicy beef brisket stewed with carrot, pea, bell pepper and potato", 2798],
        ["Sigang Brisket Ning Baka (Sinigang Beef Brisket)", "Beef brisket in tamarind sour broth and vegetables", 2898],
        ["Bistig Brisket Ning Baka (Beef Brisket Bistek)", "Beef brisket simmered in garlic, onion, calamansi/lemon, soy sauce and potato", 2798],
      ]},
      { name: "Fowl", items: [
        ["Kyle's Chicken Wings", "Spicy or non-spicy deep-fried breaded chicken wings", 1698],
        ["Tinolang Manuk (Chicken Tinola)", "Chicken in garlic, ginger, lemon grass with chayote, pepper leaves and spinach", 2098],
        ["Kalderetang Manuk (Chicken Kalderta)", "Spicy chicken stewed with carrot, pea, potato and bell pepper", 1798],
        ["Adobung Manuk (Chicken Adobo)", "Chicken simmered in garlic sauce, vinegar, bay leaf, peppercorn and potato", 1798],
        ["Chicken Halang-Halang", "Chicken in spicy coconut sauce with ginger, chayote, lemon grass and leafy greens", 2098],
        ["Isla Chicken Inasal", "Grilled marinated chicken leg quarter", 1698],
        ["Sinampalukang Manuk", "Chicken in garlic, ginger, tamarind sour broth with tamarind leaf sprout and vegetables", 1998],
      ]},
      { name: "Seafoods", items: [
        ["Sizzling Sisig Bangus", "Spicy chopped milkfish and onion sauteed in special sauce", 2298],
        ["Jumbo Squid Grilled or Fried", "Marinated grilled or fried jumbo squid with diced mango, tomato and salted egg", 1898],
        ["Kari-Karing Laman Dagat (Seafoods Kare-Kare)", "Prawn, squid and mussels in peanut seafood sauce and vegetables", 3198],
        ["Ima Lita's Tintang Adobung Pusit", "Squid cooked in its own ink with adobo sauce", 2198],
        ["Camaron", "Deep-fried breaded prawns", 1898],
        ["Sigang Paro (Sinigang Na Hipon)", "Prawns in garlic, ginger, tamarind sour broth and vegetables", 2098],
        ["Crispy Fish (Jeprox)", "Crispy fried dried sole fish with diced mango and tomato", 1798],
        ["Pritung Bangus (Fried Boneless Milkfish)", "Deep-fried boneless milkfish with diced mango, tomato and salted egg", 2298],
        ["Adobong Bangus (Boneless Milkfish Adobo)", "Boneless milkfish simmered in adobo sauce, bay leaf, peppercorn and potato", 2298],
        ["Bistig Bangus (Boneless Milkfish Bistek)", "Boneless milkfish in bistek sauce (garlic, onion, calamansi, soy) with potato", 2298],
        ["Tinolang Tahong (Tinola Mussels)", "Green mussels in garlic, ginger, lemon grass with chayote, pepper leaves and spinach", 2098],
        ["Adobung Hipon with Crab Fat", "Prawns simmered in adobo sauce with crab fat", 2298],
        ["Grilled Prawns", "Seasoned grilled prawns with diced mango and tomato", 1898],
        ["Smoked Macarel Pike Grilled or Fried", "Brined grilled or fried smoked mackerel with diced mango, tomato and salted egg", 2298],
        ["TNT (Crab Fat) Prawns", "Prawns cooked with crab fat and a lemon twist", 2398],
        ["Butter Garlic Prawns", "Prawns sauteed in garlic and butter", 1898],
        ["Ultimate Ginataang Hipon", "Prawns in creamy spicy coconut sauce with green beans and squash", 2198],
        ["Kalderetang Bangus (Boneless Milkfish Kaldereta)", "Spicy boneless milkfish stewed with carrot, pea, potato and bell pepper", 2298],
        ["Daing Na Bangus", "Marinated fried or grilled boneless baby milkfish with diced mango, tomato and salted egg", 2298],
        ["Seafoods Reunion sa Gata", "Prawns, squid and mussels in spicy coconut sauce, squash and green beans", 3198],
      ]},
      { name: "Vegetables", items: [
        ["Pakbit Isla (Pinakbet)", "Green beans, squash, okra, bitter melon and eggplant sauteed in shrimp paste with pork, shrimp and fried pork belly", 2198],
        ["Adobung Pusu Ning Saguin (Banana Blossom Adobo)", "Banana blossom with pork and shrimp in white adobo sauce", 1698],
        ["Bicol Pakbit (Bicol Pinakbet)", "Pinakbet simmered in spicy coconut sauce with pork and shrimp", 1898],
        ["Kari-Karing Veggies", "Bok choy, green beans and eggplant in savory peanut sauce", 2098],
        ["Chopsuey", "Sauteed vegetables in mushroom sauce with quail egg, pork and shrimp", 1798],
        ["Laing", "Taro leaves in spicy coconut sauce with pork and shrimp", 1998],
        ["Adobung Pusu ning Saguin at Pusit", "Banana blossom with pork and squid in white adobo sauce with crab fat", 1898],
        ["Ginataang Green Beans At Kalabasa", "Green beans and squash in coconut sauce with pork and shrimp", 1898],
      ]},
      { name: "Noodles", items: [
        ["Pancit Bihun Guisado", "Rice stick noodles with pork, quail egg, squid ball, shrimp and vegetables", 1898],
        ["Pancit Palabuk", "Rice stick noodles with pork and shrimp sauce, chicharon, shrimp and egg", 1898],
        ["Pancit Cantun", "Egg noodles with pork, quail egg, squid ball, shrimp and vegetables", 1998],
        ["Seafood Cantun", "Egg noodles with mussels, calamari, shrimp, squid ball, quail egg and vegetables", 2198],
      ]},
      { name: "Flavored Rice", items: [
        ["Adobu Rice", "Steamed rice sauteed in adobo sauce, topped with fried pork belly", 1498],
        ["Binagoongan Rice", "Steamed rice sauteed in shrimp paste, topped with fried pork belly, mango and tomato", 1698],
        ["Flavored Garlic Rice", "", 1198],
        ["Ima Lita's Tinta Rice", "Steamed rice sauteed in adobo squid ink, topped with fried calamari", 1898],
      ]},
      { name: "Side Orders", items: [
        ["TNT (Taba ng Talangka)", "Premium crab paste with roasted garlic", 1198],
        ["Ensaladang Kapampangan", "Diced mango and tomato topped with salted egg", 898],
        ["Our Very Own Guisadong Bagoong", "", 798],
        ["Original Isla Pork Barbeque Sauce", "", 300],
      ]},
      { name: "Rice Plates", items: [
        ["Sisig Silog", "Spicy grilled minced pork; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Tocilog", "Marinated sweet pork; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Bangsilog", "Marinated fried boneless baby milkfish; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Crispy Fish (Jeprox) Silog", "Deep-fried crispy sole fish; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Lumpia Silog", "Fried spring rolls; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Chicken Adobu Silog", "Chicken adobo; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Liempo Silog", "Grilled marinated pork belly; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Wingsilog", "Deep-fried breaded chicken wings; served with garlic rice, egg, tomato, misua soup and soda", 1698],
        ["Longsilog", "Fried sweet Pinoy sausage; served with garlic rice, egg, tomato, misua soup and soda", 1698],
      ]},
      { name: "Desserts", items: [
        ["Leche Flan", "Traditional caramel custard flan", 1198],
        ["Tibuk-Tibuk (Maja Blanca Brulee)", "Coconut milk, sugar, cornstarch, corn kernel and milk", 1098],
        ["Buko Pandan Macapuno", "Pandan gelatin and young coconut macapuno with cream", 1098],
        ["Traditional Halo-Halo", "White beans, sweet banana, macapuno, corn, nata de coco, shaved ice, ube ice cream and flan", 1098],
        ["Banana Con Hielo", "Sweetened banana, sugar, milk and shaved ice", 798],
        ["Mais Con Hielo", "Corn kernel, cream of corn, sugar, milk and shaved ice", 798],
      ]},
    ],
    photos: [
      { src: '/food/isla-filipino-site-0-lg.webp', alt: "", credit: "Their own photo, from islafilipinorestaurant.com" },
      { src: '/food/isla-filipino-site-1-lg.webp', alt: "Pork Barbeque", credit: "Their own photo, from islafilipinorestaurant.com" },
      { src: '/food/isla-filipino-site-2-lg.webp', alt: "Sizzling Brisket Ala Pobre", credit: "Their own photo, from islafilipinorestaurant.com" },
      { src: '/food/isla-filipino-site-5-lg.webp', alt: "Lanz's Lumpiang Shanghai", credit: "Their own photo, from islafilipinorestaurant.com" },
      { src: '/food/isla-filipino-site-6-lg.webp', alt: "Brisket Adobo", credit: "Their own photo, from islafilipinorestaurant.com" },
      { src: '/food/isla-filipino-site-9-lg.webp', alt: "Grilled Liempo", credit: "Their own photo, from islafilipinorestaurant.com" },
    ],
  },
  {
    /*
      JAC DREAMSCAPES — "San Francisco • Services", 2026-08-25.

      Landscape and hardscape, not a shop, so there is nothing to price and
      nothing to stock. Seated under Gardener, which is the nearest thing the
      services list has to what they do.
    */
    slug: 'jac-dreamscapes',
    logoTemplate: 'wordmark',
    logoLines: ['JAC', 'DREAMSCAPES'],
    logoFace: 'condensed',
    name: 'JAC Dreamscapes',
    label: 'JAC',
    cuisine: 'Landscaping and hardscaping',
    tagline: 'Concept renderings through to flawless execution.',
    color: '#12140F|#2F5D34',
    prep: 0,
    category: 'Gardener',
    site: 'https://jacdreamscapes.com/',
    phone: '(510) 255-9561',
    contactOnly:
      'End-to-end landscape architecture in their own words: Italian porcelain terraces, hand-carved stone walls, planting that blends native flora with exotic specimens. Work is quoted after they walk the property, so nothing is priced here.',
    siteCta: 'Open their site',
    items: [],
  },
  {
    /*
      FUN CLOUD EVENTS — "Santa Rosa • Services", 2026-08-25.

      SEATED UNDER DJ, NOT EVENT COORDINATOR. Camacho's Party Rentals already
      holds Santa Rosa's event spot and bumping a seated business is his call.
      DJ is the list's only other performer slot and these are performers — an
      eight-foot transformer, mascots, balloon twisting, a bubble show. Worth
      him confirming.
    */
    slug: 'fun-cloud-events',
    logoTemplate: 'wordmark',
    logoLines: ['Fun Cloud', 'EVENTS'],
    logoFace: 'grotesk',
    name: 'Fun Cloud Events',
    label: 'Fun Cloud',
    cuisine: 'Kids party entertainers',
    tagline: 'The gift of precious childhood, for children and parents.',
    color: '#101322|#2B6FD6',
    prep: 0,
    category: 'DJ',
    site: 'https://www.funcloudevents.com/',
    phone: '(669) 233-5085',
    email: 'info@funcloudevents.com',
    contactOnly:
      'Children\u2019s party entertainment across the Bay Area, Napa and Santa Rosa: balloon twisting, a bubble show, nerf battles, mascots, and a live show built around an eight-foot transformer. Booked by enquiry, so nothing is priced here.',
    items: [],
  },
  {
    /*
      THE FLOWERS VALLEY — "Concord • Services", 2026-08-25.

      Their own billing is "San Francisco's top wedding and event florist"
      while the address they publish is in Concord, which is the city he sent
      and the city they sit in. Both are true: the shop is in Concord and the
      weddings are in the city.
    */
    slug: 'flowers-valley',
    logoTemplate: 'wordmark',
    logoLines: ['Flowers', 'VALLEY'],
    logoFace: 'script',
    name: 'The Flowers Valley',
    label: 'Flowers Valley',
    cuisine: 'Florist',
    tagline: 'Luxury floral design for weddings and corporate events.',
    color: '#14100F|#8E2F55',
    prep: 0,
    category: 'Florist',
    site: 'https://www.theflowersvalley.com/',
    phone: '(707) 893-6686',
    email: 'info@theflowersvalley.com',
    address: '1170 Burnett Ave, Suite E, Concord, CA',
    contactOnly:
      'Wedding and event florals, plus a corporate flower subscription. Every arrangement is quoted to the event, so nothing is priced here.',
    items: [],
  },
  {
    /*
      PETAL & PEBBLES — "San Francisco • Services", 2026-08-25, sent with
      "Needs Website. Looks like she's new to Instagram."

      NO SITE ON PURPOSE — she has none, and that is the whole reason he sent
      her. `needsSite` is not set because the outline is derived from the
      absence of `site` and there is nothing here to override.

      SEATED UNDER FLORIST, NOT EVENT COORDINATOR. Bay Area Charters holds San
      Francisco's event spot. Florist is the nearest free seat and not a
      stretch — the installations she posts are floral and balloon work. Worth
      him confirming.
    */
    slug: 'petal-and-pebbles',
    logoTemplate: 'wordmark',
    logoLines: ['Petal &', 'PEBBLES'],
    logoFace: 'script',
    name: 'Petal & Pebbles',
    label: 'Petal & Pebbles',
    cuisine: 'Event decor and styling',
    tagline: 'Your dream event deserves more than decor \u2014 it deserves an experience.',
    color: '#141014|#A8763F',
    prep: 0,
    category: 'Florist',
    contactOnly:
      'Custom decor, catering, and event styling and coordination in San Francisco, in her own words. She has no website yet and takes enquiries through Instagram, so nothing is priced here.',
    items: [],
  },
  {
    /*
      STAN'S DONUT SHOP — "Santa Clara \u2022 Goods", 2026-08-25.

      Their site publishes the address, the number and a line about stepping
      back in time, and no prices anywhere \u2014 so nothing is priced here. The
      copyright on it reads 2019, which is worth knowing before anybody is told
      the hours are current; the address and number are what the Directions and
      Call buttons use and both are first-party.
    */
    slug: 'stans-donut-shop',
    logoTemplate: 'wordmark',
    logoLines: ['Stan\u2019s', 'DONUT SHOP'],
    logoFace: 'script',
    name: 'Stan\u2019s Donut Shop',
    label: 'Stan\u2019s',
    cuisine: 'Donuts',
    tagline: 'Take a step back in time.',
    color: '#141013|#B4477A',
    prep: 0,
    category: 'Donuts',
    site: 'https://www.stansdonutshop.com/',
    phone: '408.296.5982',
    address: '2628 Homestead Rd, Santa Clara, CA 95051',
    items: [],
    /* Their whole published menu, read from https://www.stansdonutshop.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Donuts", items: [
        ["Famous Glazed", "Please note, due to high demand, we do need to limit order quantity during peak business hours.", 190],
        ["Sugar", "", 190],
        ["Chocolate Glazed", "", 200],
        ["Maple Glazed", "", 200],
        ["Sprinkle Glazed", "", 210],
        ["Dozen Regular Glazed", "", 1850],
        ["Dozen Specialty Glazed", "", 2000],
        ["Dozen raised with sprinkles", "", 2200],
        ["An assortment of cake donuts", "", 125],
        ["Strawberry and Blueberry available FRI-SUN", "", 150],
        ["Jelly Filled Donut", "Our glazed donut filled with raspberry jam. Also available with powdered sugar.", 250],
        ["Cinnamon Roll", "Fresh, handmade Cinnamon Rolls", 300],
        ["Cinnamon Twist", "Fresh, handmade Cinnamon Twist", 300],
        ["Apple Fritter", "Available on Mondays and Fridays only!", 300],
        ["Bars", "Available with maple or chocolate", 250],
      ] },
      { name: "By the dozen", items: [
        ["One dozen cake and/or old-fashioned", "", 1500],
        ["Dozen Raised Classic", "One dozed glazed, sugar, cake, and old-fashioned", 1850],
        ["Dozen Raised Specialty", "Our famous raised donuts with chocolate, maple, sugar, and/or glazed", 2000],
        ["Dozen Raised Rainbow Sprinkle", "Our famous raised donuts with maple or chocolate icing topped with rainbow sprinkles", 2200],
      ] },
      { name: "Donut holes", items: [
        ["Coffee Carafe", "96oz. Includes: 8 cups, cream and sugar.", 2000],
      ] },
    ],
    photos: [
      { src: '/food/stans-donut-shop-site-0-lg.webp', alt: "", credit: "Their own photo, from stansdonutshop.com" },
      { src: '/food/stans-donut-shop-site-6-lg.webp', alt: "Jesus_edited.jpg", credit: "Their own photo, from stansdonutshop.com" },
    ],
    /* Their whole published menu, read from https://www.stansdonutshop.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    /*
      PJ'S JUNK REMOVAL \u2014 Fairfield, sent 2026-08-25 with "this family needs
      a proper website".

      NO SITE, ON PURPOSE. They have a Facebook page and an Instagram and no
      website of their own, which is the whole reason he sent them. The red
      outline is derived from the absence of `site`, so there is nothing here
      to override.

      THE AWARD IS NOT PRINTED. Their bio says "Voted 7X Solano's BEST Hauler
      from 2018 - 2025", which is a claim about a poll nobody here has seen \u2014
      the same rule Bloom Balloon's "5 stars on Yelp and Google" fell under.
      What is on the page is what they do and who they are.

      SEATED ON THE YELLOW OVERFLOW PAGE. Junk removal is not "House cleaning"
      and it is not "Handyman"; the services list has no waste category, and
      Pet Butler set the precedent for exactly this.
    */
    slug: 'pjs-junk-removal',
    name: 'PJ\u2019s Junk Removal',
    label: 'PJ\u2019s',
    cuisine: 'Junk removal and hauling',
    tagline: 'Licensed and insured, small family owned and operated.',
    color: '#0A0A0B|#3A3A3E',
    icon: 'pjs-junk-removal',
    prep: 0,
    category: 'Junk removal',
    phone: '707-656-9208',
    address: 'Fairfield, Solano County',
    contactOnly:
      'Junk removal and hauling across Solano County, run by Phillip Samano and his family \u2014 licensed and insured, in their own words. Every job is quoted on what there is to take, so nothing is priced here. Call them.',
    siteCta: 'Call PJ\u2019s',
    items: [],
  },
  {
    /*
      KHAKI \u2014 "San Ramon \u2022 Goods", 2026-08-25.

      THE ICON IS THEIR OWN MARK ON THEIR OWN COLOUR, which is what he asked
      for: "make the logo bigger in the icon" or "grab the logo from this and
      make the entire circle that color". The terracotta is sampled off their
      own page (#AD523D) and the wordmark is lifted from it rather than redrawn
      \u2014 a logo is theirs and is never regenerated.

      Their site publishes no prices, so nothing is priced here. The 4.9-from-
      291-reviews line on their homepage is a Google rating and stays off, the
      same as every other business's star claim.
    */
    slug: 'khaki',
    name: 'Khaki',
    label: 'Khaki',
    cuisine: 'Modern Indian',
    tagline: 'Bar and Indian canteen.',
    color: '#17100E|#AD523D',
    icon: 'khaki',
    prep: 0,
    category: 'Indian',
    site: 'https://www.wearekhaki.com/',
    phone: '(925) 359-6794',
    email: 'manager@wearekhaki.com',
    address: '6000 Bollinger Canyon Rd, 2nd Floor Unit 2601, San Ramon, CA 94583',
    items: [],
    /* Their whole published menu, read from https://www.wearekhaki.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Breads", items: [
        ["Butter Roti", "", 500],
        ["Cheese Naan", "", 800],
        ["Chili-Cheese Naan", "", 800],
        ["Chilli Garlic Roti", "", 700, "khaki-chilli-garlic-roti"],
        ["Plain Naan", "", 600],
        ["Plain Roti", "", 600],
        ["Mint Lachha Paratha", "", 700],
        ["Ajwain Laccha Paratha", "", 700],
        ["Butter Lachha Paratha", "", 700],
        ["Buttered Ladi Pao", "", 500],
      ] },
      { name: "Dessert", items: [
        ["Ras Malai Tres Leches", "", 1500],
        ["Canteen Pudding", "", 1500],
        ["Kulfi Falooda", "", 1500],
        ["Orange Juice Cake", "", 1600],
        ["gulab jamun", "", 1000],
        ["gulab jamun with vanilla ice cream", "", 1500],
      ] },
      { name: "Non-veg appetizers", items: [
        ["Parsi Chicken Keema", "", 2200, "khaki-parsi-chicken-keema"],
        ["Mangalorean Beef Sukka", "", 2800, "khaki-mangalorean-beef-sukka"],
        ["Chemmeen Kappa", "", 2600, "khaki-chemmeen-kappa"],
        ["Chicken Noorani Kabab", "", 2200, "khaki-chicken-noorani-kabab"],
        ["Pallipalayam Chicken", "", 2000, "khaki-pallipalayam-chicken"],
      ] },
      { name: "Non-veg mains", items: [
        ["Lamb Burrah Kabab", "", 4400, "khaki-lamb-burrah-kabab"],
        ["Malvani Kolambi", "", 3000, "khaki-malvani-kolambi"],
        ["Meen Polichathu", "", 4000],
        ["Chicken Chettinadu", "", 2800, "khaki-chicken-chettinadu"],
        ["Champaran Handi Mutton", "", 3400, "khaki-champaran-handi-mutton"],
        ["Lamb Shank Biryani", "", 4600],
      ] },
      { name: "Sides", items: [
        ["Basmati Rice", "", 600],
        ["Bone Broth Biryani Rice", "", 800, "khaki-bone-broth-biryani-rice"],
        ["Buttered Pao", "", 500],
        ["Coconut Rice", "", 800],
        ["Cucumber Mint Raita", "", 500],
        ["Dal Makhani", "", 1600, "khaki-dal-makhani"],
        ["Indian Onion, Tomato & Chili Salad", "", 500],
        ["Plain Yogurt", "", 300],
        ["Saag Mushroom", "", 1800],
        ["Paneer Bhurji", "", 1600],
        ["Papad Platter", "", 1000, "khaki-papad-platter"],
        ["Onion Pachadi", "", 600],
        ["Chopped onion", "", 150],
      ] },
      { name: "Veg mains", items: [
        ["Paneer Pinwheel", "", 2800, "khaki-paneer-pinwheel"],
        ["Zucchini Ricotta Kofta", "", 2600, "khaki-zucchini-ricotta-kofta"],
        ["Rampuri Bharwan Aloo", "", 2600],
        ["Kadhi Patra", "", 2600, "khaki-kadhi-patra"],
        ["Bagara Baingan", "", 2400, "khaki-bagara-baingan"],
        ["Achari Gobi Musallam", "", 2400],
        ["Donne Biryani", "", 3000, "khaki-donne-biryani"],
      ] },
      { name: "Veg appetizers", items: [
        ["Cauliflower Koliwada", "", 1800, "khaki-cauliflower-koliwada"],
        ["Jackfruit Cutlet", "", 1800, "khaki-jackfruit-cutlet"],
        ["Malai Mushroom", "", 2200, "khaki-malai-mushroom"],
        ["Sweet Potato & Patta Chaat", "", 2000, "khaki-sweet-potato-patta-chaat"],
        ["Hariyali Paneer Tikka", "", 2200, "khaki-hariyali-paneer-tikka"],
        ["Passion Fruit Pani Puri", "", 1600, "khaki-passion-fruit-pani-puri"],
      ] },
    ],
  },
  {
    /*
      CAMBODIAN STREET FOOD \u2014 "Oakland \u2022 Goods", 2026-08-25, with "we ate
      here and it was Hella good. They need a website and some better presence."

      NO SITE, which is the point of sending them. Address, hours and their own
      description are off their Instagram, and the YouTube link is the one in
      THEIR OWN bio \u2014 not a video someone found, the video they chose to
      represent themselves with.
    */
    slug: 'cambodian-street-food',
    /* Their own mark, lifted from their profile and upscaled — with
       Instagram's story ring cut off it, because that gradient is Instagram's
       UI and not one line of their logo. */
    icon: 'cambodian-street-food',
    name: 'Cambodian Street Food',
    label: 'Cambodian SF',
    cuisine: 'Cambodian',
    tagline: 'Cambodia\u2019s fusion, locally and affordable.',
    color: '#14100C|#B4472A',
    prep: 0,
    category: 'Asian',
    phone: '',
    address: '2045 Foothill Blvd, Oakland, CA',
    contactOnly:
      'Cambodian street food on Foothill Boulevard \u2014 in their own words, designed to bring the taste of Cambodia\u2019s fusion locally and affordable to everyone. Open Monday to Saturday 11am-7pm and Sunday 11am-5pm, closed Tuesdays. They publish no prices and have no website yet, so nothing is priced here.',
    clip: {
      src: '/clips/cambodian-street-food.mp4',
      poster: '/clips/cambodian-street-food-poster.webp',
      href: 'https://www.youtube.com/watch?v=6xSaVABbB9s',
      platform: 'YouTube',
      credit: 'From their Instagram bio, filmed by Jay Chan (@JayChanMuzik)',
    },
    items: [],
  },
  {
    /*
      AU LOUNGE \u2014 "Oakland \u2022 Goods", 2026-08-25.

      A lounge, not a kitchen, and the goods list is a list of cuisines \u2014 so
      it sits on the yellow overflow page rather than being filed under one.
      Their site publishes an address and a number and nothing else; the
      copyright on it reads 2015, which is worth knowing before anybody is told
      the hours are current, because it does not state any.
    */
    slug: 'au-lounge',
    logoTemplate: 'wordmark',
    logoLines: ['Au', 'OAKLAND'],
    logoFace: 'script',
    name: 'Au Lounge',
    label: 'Au Lounge',
    cuisine: 'Lounge and events',
    tagline: 'Broadway, Oakland.',
    color: '#0E0D0C|#8C7326',
    prep: 0,
    category: 'Lounge',
    site: 'https://www.auoakland.com/',
    phone: '510.893.1411',
    address: '2430 Broadway, Oakland, CA 94612',
    contactOnly:
      'A lounge on Broadway in downtown Oakland, taking corporate reservations through their own site. They publish no menu and no prices, so nothing is priced here \u2014 call them.',
    siteCta: 'Open their site',
    items: [],
  },
  {
    /*
      OFIE'S KITCHEN \u2014 "Concord \u2022 Goods", 2026-08-26. A food truck, so the
      address is the number rather than a door; they trade at Epidemic Ales
      among other places, which their own reviews mention and their site does
      not fix to one spot.
    */
    slug: 'ofies-kitchen',
    /* THEIR OWN ARTWORK, off their own site at full size — the hand-drawn
       globe with the spoon and fork, not a wordmark typeset to stand in for
       one. A generated mark is only ever a placeholder for this. */
    icon: 'ofies-kitchen',
    name: 'Ofie\u2019s Kitchen',
    label: 'Ofie\u2019s',
    cuisine: 'Burgers, food truck',
    tagline: 'Where food meets fun.',
    color: '#131211|#C4562A',
    prep: 0,
    category: 'Burgers',
    site: 'https://ofieskitchen.com/',
    phone: '925-962-7158',
    email: 'ofieskitchen@gmail.com',
    address: '1044 Shary Circle, Concord, CA',
    contactOnly:
      'A Concord food truck \u2014 burgers and more, in their own words: where food meets fun. They also trade at Epidemic Ales, so their own site and Instagram are where to find them on a given day. They publish no prices, so nothing is priced here.',
    clip: {
      src: '/clips/ofies-kitchen.mp4',
      poster: '/clips/ofies-kitchen-poster.webp',
      href: 'https://www.instagram.com/reel/DcckUJ9zv_g/',
      platform: 'Instagram',
      credit: 'Filmed by @itsmeloslab',
    },
    items: [],
    photos: [
      { src: '/food/ofies-kitchen-site-6-lg.webp', alt: "", credit: "Their own photo, from ofieskitchen.com" },
      { src: '/food/ofies-kitchen-site-8-lg.webp', alt: "", credit: "Their own photo, from ofieskitchen.com" },
      { src: '/food/ofies-kitchen-site-9-lg.webp', alt: "", credit: "Their own photo, from ofieskitchen.com" },
      { src: '/food/ofies-kitchen-site-10-lg.webp', alt: "", credit: "Their own photo, from ofieskitchen.com" },
    ],
  },
  {
    /*
      HD PARTY SF \u2014 "San Francisco \u2022 Goods", 2026-08-26.

      HIS PAGE, NOT MINE TO SECOND-GUESS: he said Goods. They rent LED and wood
      dance floors and supply DJs, which is a service by any reading, but the
      goods list is cuisines and retail and there is no seat for it there
      either \u2014 so it goes on the yellow overflow page of the page he named.
      Worth him confirming it should not be under Services instead.
    */
    slug: 'hd-party-sf',
    logoTemplate: 'wordmark',
    logoLines: ['HD Party', 'SF'],
    logoFace: 'condensed',
    name: 'HD Party SF',
    label: 'HD Party',
    cuisine: 'Event enhancements',
    tagline: 'LED floors, DJs and more.',
    color: '#0C0D14|#3B4CD6',
    prep: 0,
    category: 'Events',
    site: 'https://hdpartysf.com/',
    address: 'San Francisco, California',
    contactOnly:
      'Event enhancements in San Francisco: LED and wood dance floor rental, DJs and more. Everything is quoted to the event, so nothing is priced here \u2014 enquire on their own site.',
    siteCta: 'Open their site',
    items: [],
  },
  {
    /*
      HOUSE OF RAHA \u2014 "Fremont \u2022 Goods", 2026-08-26, "needs website".

      NO SITE, which is why he sent them: Instagram is the whole presence.
      Address, trade and the halal line are their own bio, and the icon is
      their own mark with Instagram's story ring painted out \u2014 that gradient
      and the white gap inside it are Instagram's chrome, not one line of
      theirs.

      THE HALAL LINE IS THEIRS AND IS QUOTED AS THEIRS. Their bio says "Zabiha
      Halal certified vendors" \u2014 a claim about who they buy from. This app
      does not certify anybody, so it is repeated as their statement and the
      dietary tag stays the plain word.
    */
    slug: 'house-of-raha',
    icon: 'house-of-raha',
    name: 'House of Raha',
    label: 'House of Raha',
    cuisine: 'Pan Asian',
    tagline: 'Pan Asian cuisine, Fremont.',
    color: '#12100C|#C89A5B',
    prep: 0,
    category: 'Asian',
    phone: '',
    address: '4137 Bay Street, Fremont, CA',
    dietary: ['Halal'],
    contactOnly:
      'Pan Asian cooking on Bay Street in Fremont, doing private events, catering and reservations. In their own words their vendors are Zabiha Halal certified. They have no website yet and publish no prices, so nothing is priced here \u2014 their Instagram is where to reach them.',
    clip: {
      src: '/clips/house-of-raha.mp4',
      poster: '/clips/house-of-raha-poster.webp',
      href: 'https://www.instagram.com/reel/Dbq3kjRPWEg/',
      platform: 'Instagram',
      credit: 'Filmed by @smackinfood',
    },
    items: [],
  },
  {
    /*
      PAPI CLARY'S KITCHEN \u2014 "Concord \u2022 Goods", 2026-08-26, "Needs Website".

      Filipino, not Mexican, and the seat follows the bio rather than the
      photographs. Their grid leads with birria and pastor tacos, which would
      read as the Mexican spot; their bio leads with the Ilocos empanada, the
      chef bills himself as Chef Clary, and adobo is on the same grid. Ilocos
      is a province, not a dish description \u2014 that is a Filipino kitchen
      cooking a Bay Area menu, and Filipino food was the free seat.

      NOTHING IS PRICED. Their catering flyer says $16 a head, but that is a
      party minimum of fifty people with a travelling fee, not a menu, and no
      dish on their page carries a price anywhere. Their hours and address are
      their own bio, verbatim.
    */
    slug: 'papi-clarys-kitchen',
    icon: 'papi-clarys-kitchen',
    name: "Papi Clary's Kitchen",
    label: "Papi Clary's",
    cuisine: 'Filipino',
    tagline: 'Birria tacos, quesabirria and lumpia, Concord.',
    color: '#0E0E0E|#C9A227',
    prep: 0,
    category: 'Filipino',
    /* THE NUMBER AND THE EMAIL ARE THEIR SQUARE SITE'S, read on 2026-09-12. */
    phone: '(925) 222-7786',
    email: 'papiclaryskitchen@gmail.com',
    /*
      THEIR SQUARE ORDERING SITE IS THE LINK. He sent it on 2026-08-23 —
      "BEASTY • Concord, This place would be great for the food truck" — and
      the page linked their Instagram and said they had no website until the
      12 September thread read caught it. A square.site subdomain is an
      ordering page, not a website of their own, so `needsSite` keeps them on
      his red-outline list, on the Phosho Dough reasoning.

      THEIR ONLINE MENU IS BIRRIA NOW: birria tacos, quesabirria, birria fries
      and mulitas, cheeseburger lumpia, arroz caldo, ube horchata. No Ilocos
      empanada or adobo is on it, so the line below says what they sell today.
      Square loads the prices in the browser after the page opens, so none
      could be read and none are printed.
    */
    site: 'https://papiclaryskitchen.square.site/',
    siteCta: 'Order on their Square page',
    needsSite: true,
    address: '2186 Solano Way, Concord, CA 94565',
    contactOnly:
      'Chef Clary cooks birria tacos, quesabirria and birria fries alongside cheeseburger lumpia and arroz caldo, out of Solano Way in Concord, and caters parties. Open Wednesday to Saturday, 11am to 9:30pm; closed Monday and Tuesday. Their menu and prices are on their Square ordering page, so nothing is priced here.',
    items: [],
  },
  {
    /*
      CRUSHED HANDCRAFTED LEMONADE \u2014 "San Jose \u2022 Goods", 2026-08-26,
      "Needs Website".

      SEATED IN THE WRONG TRADE, AND HE SHOULD KNOW. Boba shop is the drinks
      spot on the goods sheet and there is no lemonade or juice spot among the
      twenty-four. This is not boba. It is the closest seat that exists and it
      was free, and the alternative \u2014 widening the category \u2014 renumbers a
      page he sells by number. His to move.

      Their $7-all-day flyer is a single day's post, not a price list, so it is
      not carried here as a price.
    */
    slug: 'crushed-lemonade',
    icon: 'crushed-lemonade',
    name: 'Crushed Handcrafted Lemonade',
    label: 'Crushed',
    cuisine: 'Lemonade',
    tagline: 'Fair-style lemonade, San Jose.',
    color: '#0D0D0D|#F2C230',
    prep: 0,
    category: 'Boba',
    phone: '',
    /* NO ADDRESS ON PURPOSE. An address renders a Directions button, and theirs
       would point at the city of San Jose: their pick-up spot moves and they
       post each one. A button that opens a map to a whole city is worse than
       no button. The city is in the tagline and the prose instead. */
    /* THEIR INSTAGRAM IS THE LINK, and `needsSite` keeps them on his red-outline
       list anyway. Without a link the page told people to go to their Instagram
       and gave them no way to get there; without the flag, pointing at a social
       profile would have quietly taken them off the list he prospects from —
       and he sent them precisely because they need a website. */
    site: 'https://www.instagram.com/crushed_bayarea/',
    siteCta: 'See their Instagram',
    needsSite: true,
    contactOnly:
      'Fair-style lemonade made to order around San Jose and the Bay, plus private events and catering. Pick-up spots move day to day and they post each one, so there is no fixed address here. They have no website and no standing price list, so nothing is priced \u2014 their Instagram is where to reach them.',
    items: [],
  },
  {
    /*
      BLOOMZEPHYR \u2014 "Santa Clara \u2022 Goods", 2026-08-26, "Needs Website".

      Bakery, because the bouquets are made of marshmallow. Florist is a
      SERVICES category and he put them on the goods sheet, which is right: they
      sell a made thing, not an arrangement service. A licensed cottage food
      kitchen turning out edible bouquets is a confectioner, and bakery is the
      seat the twenty-four have for that.

      THE LICENCE IS THEIRS AND IS SAID AS THEIRS. Their bio says "Licensed CA
      Cottage Food Business". This app licenses nobody, so it is repeated as
      their statement.

      Their sizes are named in their own highlights \u2014 S, M, XL, Box S \u2014 and
      no price is attached to any of them anywhere, so none is attached here.
    */
    slug: 'bloomzephyr',
    icon: 'bloomzephyr',
    name: 'BloomZephyr',
    label: 'BloomZephyr',
    cuisine: 'Marshmallow bouquets',
    tagline: 'Handmade marshmallow bouquets, Santa Clara.',
    color: '#3B2A55|#D8CCEA',
    prep: 0,
    category: 'Bakery',
    phone: '',
    /* NO ADDRESS, AND THIS ONE IS NOT A DESIGN CALL. Their bio says the
       kitchen is their home. A Directions button on a home address is not
       something to publish because a field exists for it, and they publish no
       shopfront to send anyone to. */
    /* THEIR INSTAGRAM IS THE LINK, and `needsSite` keeps them on his red-outline
       list anyway. Without a link the page told people to go to their Instagram
       and gave them no way to get there; without the flag, pointing at a social
       profile would have quietly taken them off the list he prospects from —
       and he sent them precisely because they need a website. */
    site: 'https://www.instagram.com/bloom_zephyr/',
    siteCta: 'See their Instagram',
    needsSite: true,
    contactOnly:
      'Marshmallow bouquets piped by hand in a home kitchen in Santa Clara, in their own words a licensed CA cottage food business. They take orders by direct message and publish no prices, so nothing is priced here \u2014 their Instagram is where to reach them.',
    items: [],
  },
  {
    /*
      NO LAST CALL BARTENDING \u2014 "BEASTY \u2022 Services", 2026-08-26, and in the
      same breath "Bump AS to yellow pages": Andrew Shin's seat, which is the
      event coordinator spot. An injury attorney was sitting in it; a mobile bar
      built for weddings and parties is what the spot is actually for.

      THEY HAVE A SITE, so no red outline. nolastcallbartending.com is their
      own, and the trade line is their own Facebook category and bio.

      NO PRICES. Mobile bar work is quoted per event \u2014 head count, hours,
      whether it is a full bar \u2014 and they publish no rate card. So this page
      says what they do and sends people to them.
    */
    slug: 'no-last-call-bartending',
    icon: 'no-last-call-bartending',
    name: 'NO LAST CALL Bartending',
    label: 'No Last Call',
    cuisine: 'Mobile bartending',
    tagline: 'Mobile bar for weddings and parties.',
    color: '#0B0708|#E03A2F',
    prep: 0,
    category: 'Events',
    phone: '',
    site: 'https://nolastcallbartending.com/',
    contactOnly:
      'Adina Mercado\u2019s mobile bar, working the Bay Area and the Central Valley: weddings, birthdays, corporate events and private parties, full bar setups, signature cocktails and mixology classes. Every event is quoted, so nothing is priced here \u2014 their site is where to start.',
    siteCta: 'Open their site',
    items: [],
  },
  {
    /*
      HEY YOGURT \u2014 "San Mateo \u2022 Goods", 2026-08-26, and his brief with it:
      "can you add any top three of your favorites on a drop-down and let's get
      this page ready to present?"

      THEY ARE NOT OPEN YET. Their own post gives the San Mateo grand opening as
      September 1 with a BOGO on the same flavour, and today is the 26th of
      August. The page says opening, not open \u2014 he is presenting this to them
      before the doors do, and a page that has them trading already is the one
      thing that would embarrass him in the room.

      THE MENU IS REAL AND THE PRICES ARE NOT PUBLISHED. Every flavour below is
      on their own menu page under their own headings; not one of them carries a
      figure there, on Yelp, or on their Instagram. So the rows say the price is
      in store, which is where it is, and `quoteOnly` keeps a cart away from a
      menu nobody has priced. The three picks are three they hearted themselves.

      NO RATING. Yelp shows one. It is Yelp's, not theirs, and this app does not
      republish other people's scores as though they were a fact about the shop.
    */
    slug: 'hey-yogurt',
    icon: 'hey-yogurt',
    name: 'Hey Yogurt',
    label: 'Hey Yogurt',
    cuisine: 'Frozen yogurt',
    tagline: 'Fruit and matcha yogurt smoothies, San Mateo.',
    color: '#F1D127|#141414',
    prep: 0,
    category: 'Ice cream',
    phone: '(650) 523-5599',
    address: '310 S San Mateo Dr, San Mateo, CA 94401',
    site: 'https://www.heyyogurtus.com/',
    siteNote: 'Their full flavour list is on heyyogurtus.com',
    menuNote: 'Three they picked themselves',
    quoteOnly:
      'Opening at 310 S San Mateo Dr on September 1, with a buy-one-get-one on the same flavour. They publish every flavour they make and a price for none of them, so nothing is priced here \u2014 ask at the counter.',
    groups: [
      {
        name: 'Yogurt smoothie',
        items: [
          ['Mango', 'Fruit flavor', 0, 'In store'],
          ['Strawberry', 'Fruit flavor', 0, 'In store'],
          ['Matcha & Strawberry', 'Matcha flavor', 0, 'In store'],
        ],
      },
    ],
    items: [],
  },
  /*
    2026-08-26, the second batch of the day. Six he sent between 9 and 10pm.

    Two of them are auto detailers in different cities, which is the first time
    the same trade has been seated twice — they do not collide because a slot
    key is per city, and Antioch and Fremont are different pages.
  */
  {
    slug: 'golden-auto-muffler',
    icon: 'golden-auto-muffler',
    name: 'Golden Auto Muffler & Brake Service',
    label: 'Golden Auto',
    cuisine: 'Muffler and brake shop',
    tagline: 'Exhaust, brakes and alignment on Folsom at 6th.',
    color: '#44443C|#EFC400',
    prep: 0,
    category: 'Mechanics and smog',
    phone: '(415) 543-8899',
    address: '998 Folsom St, San Francisco, CA 94107',
    site: 'https://www.goldenautomuffler.com/',
    siteNote:
      'They have a second shop at 7360 Mission St, Daly City — (650) 992-6766',
    contactOnly:
      'An exhaust and brake shop on Folsom at 6th, open Monday to Friday 9am to 5pm and closed at weekends; the Daly City shop opens Monday to Saturday. They fit high-performance and dual exhaust, do custom bending, wheel alignment, suspension, struts, shocks, clutches, brakes, catalytic converters, tune-ups and on-board diagnostics, and are authorised dealers for Flowmaster, Borla and Magnaflow. Hablamos español. They publish no prices, so nothing is priced here — call the shop.',
    items: [],
  },
  {
    slug: 'affinage-boards',
    icon: 'affinage-boards',
    name: 'Affinage Boards',
    label: 'Affinage',
    cuisine: 'Charcuterie and grazing',
    tagline: 'Artisanal grazing boards and tables, delivered.',
    color: '#EFE7E0|#2A2A28',
    prep: 0,
    category: 'Charcuterie and grazing',
    phone: '(650) 741-1087',
    /* NO ADDRESS ON PURPOSE. They are mobile and publish a delivery footprint
       rather than a shopfront, so a Directions button would have nowhere to
       send anyone. */
    site: 'https://www.affinageboards.com/',
    siteNote:
      'Same-day delivery if you call (650) 741-1087 before 2pm',
    /*
      THEIR PRICES, FROM THEIR OWN SHOP, AND NO CART.

      These three are read straight off their published catalogue, so they are
      real. `quoteOnly` still suppresses add-to-cart everywhere: ordering here
      is live, and writing a real kitchen ticket against a caterer who has
      agreed nothing is exactly the harm that flag exists to prevent.
    */
    quoteOnly:
      'A small woman-owned business making cheese and charcuterie boxes, platters and flat-lay tables, delivering to San Francisco, San Mateo, Santa Clara, Alameda, Marin and Contra Costa. These are their own published prices; events are quoted on what you need, so order through their shop rather than here.',
    menuNote: 'Three from their own shop',
    groups: [
      {
        name: 'Boards and boxes',
        items: [
          ['Nibble and Graze Box', 'Their box for two to three', 6000],
          ['The Signature', 'Their signature grazing board', 9000],
          ['Charcuterie Cups', 'Individually portioned, per cup', 1500],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'clean-asere',
    icon: 'clean-asere',
    name: 'Clean Asere Car Detailing',
    label: 'Clean Asere',
    cuisine: 'Auto detailing',
    tagline: 'Paint correction and ceramic coating, East Bay.',
    color: '#141414|#E8712A',
    prep: 0,
    category: 'Auto detailing',
    /* NO WEBSITE AT ALL, which is why the operator sent them: their Instagram
       is the only link, and `needsSite` keeps them on his red-outline list. */
    site: 'https://www.instagram.com/clean_asere/',
    siteCta: 'See their Instagram',
    needsSite: true,
    contactOnly:
      'Paint correction, ceramic coating and full interior and exterior detailing across the East Bay. They take appointments by DM and have no website, no published phone number and no published prices, so nothing is priced here — their Instagram is where to reach them.',
    items: [],
  },
  {
    slug: 'doubletake-auto-spa',
    icon: 'doubletake-auto-spa',
    name: 'DoubleTake Auto Spa',
    label: 'DoubleTake',
    cuisine: 'Auto detailing and paint protection',
    tagline: 'PPF, ceramic coating and tint on Christy Street.',
    color: '#0B0B0B|#D42027',
    prep: 0,
    category: 'Auto detailing',
    phone: '(510) 472-4181',
    address: '43122 Christy St, Fremont, CA 94538',
    site: 'https://dtautospaprotection.com/',
    contactOnly:
      'Paint protection film, ceramic coating, window tint, paint correction and detailing in Fremont, open Monday to Saturday 10am to 6pm. XPEL certified, with work aimed at Tesla, Porsche, BMW, Mercedes, Rivian and exotics. Every job starts from a free consultation and is quoted on the vehicle, so nothing is priced here.',
    items: [],
  },
  {
    slug: 'antonios-hauling',
    icon: 'antonios-hauling',
    name: 'Antonio Hauling SF',
    label: 'Antonio’s',
    cuisine: 'Junk removal and hauling',
    tagline: 'Family owned and run junk removal, Vallejo.',
    color: '#0A0C0A|#E8892B',
    prep: 0,
    category: 'Junk removal',
    phone: '(415) 579-8538',
    address: 'Lexington Dr, Vallejo, CA',
    email: 'antonioshaulingsf@gmail.com',
    site: 'https://antonioshaulingsf.com/',
    contactOnly:
      'A family owned and run junk removal service working out of Vallejo: junk and debris, furniture and appliances, yard waste and dirt, construction debris and demolition, residential and commercial cleanouts, storage units and estates. Every job is quoted on what there is to take — they ask you to get an estimate — so nothing is priced here.',
    items: [],
  },
  {
    slug: 'oasis-wine-lounge',
    icon: 'oasis-wine-lounge',
    name: 'Oasis Wine Lounge',
    label: 'Oasis',
    cuisine: 'Mediterranean',
    tagline: 'Kabobs, cocktails and wine on Main Street.',
    color: '#111111|#FFFFFF',
    prep: 0,
    category: 'Mediterranean',
    phone: '(925) 417-8438',
    address: '780 Main St, Pleasanton, CA 94566',
    site: 'https://oasiswinelounge.com/',
    /*
      NOTHING IS PRICED HERE AND THAT IS DELIBERATE.

      Their site has a menu page, but it is still the WordPress theme's demo
      content: Latin filler text under a sushi menu, on a Mediterranean
      restaurant. Copying a price off it would put a made-up number on a real
      business's page. Their real menu is not published in any usable form.
    */
    items: [],
    /* Their whole published menu, read from https://oasiswinelounge.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Starters", items: [
        ["Cucumber Mint Yogurt", "", 1400],
        ["Classic Hummus", "", 1300],
        ["Spicy Harissa Hummus", "", 1300],
        ["Spicy Spinach Goat Cheese Dip", "", 1200],
        ["Hummus Sampler", "", 2100],
        ["Pesto Hummus", "", 1400],
        ["Garlic Hummus", "", 1400],
        ["Eggplant Borani", "", 1500],
        ["Sumac Spiced Potates", "", 1300],
        ["Tour Of Mediterranean", "", 2100],
        ["Greek Dolmathes", "", 1300],
        ["Dipping Sauces/Bread", "", 1300],
        ["Lamb Lollipops", "", 2300],
        ["Basil Shrimp", "", 2000],
        ["Chicken Mini Gyros (4)", "", 2265],
        ["Mini Gyros Beef", "", 1900],
        ["Chicken Mini Gyros", "", 1700],
        ["Mezze Platter", "", 2600],
        ["Steak Shawarma Pitas (4)", "", 2650],
        ["Steak Shawarma Pitas", "", 2000],
        ["Falafel Crisps", "", 1300],
        ["Marinated Olives/ Feta Cheese", "", 1000, "oasiswinelounge-marinated-olives-feta-cheese"],
      ] },
      { name: "Salads", items: [
        ["Mediterranean Salad", "", 1600, "oasiswinelounge-mediterranean-salad"],
        ["House Salad", "", 900],
        ["Lemon Caesar", "", 1500],
        ["Greek Salata", "", 1700],
        ["Pesto Shrimp Flatbread", "", 2800, "oasiswinelounge-pesto-shrimp-flatbread"],
        ["Melitzana Flatbread", "", 2400],
        ["Cheese Flatbread", "", 2000],
        ["Kids Cheese Pizza", "", 900],
        ["Kids Cheese Pizza w/chicken", "", 1300],
        ["Zaytun Flatbread", "", 2500],
        ["Side Grilled Tomato", "", 100],
        ["Side Cucumber Slices", "", 400],
        ["Side Raw Veggie", "", 500],
      ] },
      { name: "Lunch", items: [
        ["Classic Gyro", "", 2300, "oasiswinelounge-classic-gyro"],
        ["Shawarma Wrap", "", 2400, "oasiswinelounge-shawarma-wrap"],
      ] },
      { name: "From the grill", items: [
        ["Oasis Salmon", "", 3600, "oasiswinelounge-oasis-salmon"],
        ["Grilled Rack Of Lamb", "", 4600],
      ] },
      { name: "Shish Kabobs", items: [
        ["Mixed Grille", "", 3200],
        ["Sizzling Shrimp Kabob", "", 3500],
        ["Garlic-Butter Filet Kabob", "", 3900],
        ["Royal Platter Modified", "", 6200],
        ["Royal Platter", "", 6200],
        ["Mantoo Dumplings", "", 2900],
        ["Aushak Tortellini", "", 2900],
        ["Sumac Trout", "", 3400],
        ["Mediterranean Pasta Veg", "", 2500],
        ["Mediterranean Pasta Chicken", "", 2700],
        ["Mediterranean Pasta Veg W/extra vegetables", "", 2800],
        ["Mediterranean Pasta Shrimp", "", 3500],
        ["Oasis Curry With Chicken", "", 2400],
        ["Oasis Curry With Shrimp", "", 3500],
        ["Oasis Curry with Vegetable", "", 2000],
        ["Oasis Curry w/ koobideh", "", 2900],
        ["Oasis Curry w/ falafel", "", 2400],
        ["Oasis Curry w/ salmon", "", 3600],
        ["Oasis Curry w/ rack of lamb", "", 4500],
      ] },
      { name: "Desserts", items: [
        ["Baklava", "", 1100],
        ["Oasis Paradise", "", 1300],
        ["Lava Love", "", 1400],
        ["Sweet Sampler", "", 3700],
        ["Toffee Nut Cake", "", 1400],
      ] },
    ],
  },
  {
    slug: 'serrano-turf-landscape',
    icon: 'serrano-turf-landscape',
    name: 'Serrano Turf Landscape',
    label: 'Serrano Turf',
    cuisine: 'Turf, concrete and pavers',
    tagline: 'Turf, concrete and pavers across the Bay Area.',
    color: '#141414|#6B4A2F',
    prep: 0,
    category: 'Contractor',
    phone: '(925) 848-8085',
    /* THEIR OWN WORDS: "Located in Brentwood", "We work most of the Bay Area".
       The operator seated them in Antioch, which is next door — flagged in
       placements.ts rather than silently moved. */
    address: 'Brentwood, CA',
    site: 'https://www.instagram.com/serranoslandscape/',
    siteCta: 'See their Instagram',
    needsSite: true,
    contactOnly:
      'Turf, concrete and pavers, run out of Brentwood and working most of the Bay Area. Every job starts with a free estimate quoted on the yard, so nothing is priced here. They have no website — their Instagram is where to reach them, and the phone number is on it.',
    items: [],
  },
  /*
    THE FIRST NAME ON BEASTY • INDIVIDUALS, and the first entry here who is a
    PERSON rather than a shop. Two things follow from that and neither is
    optional.

    SHE HAS AGREED NOTHING. The operator found her and wants to ask; nothing on
    her page may read as her having joined, endorsed BEASTY, or agreed a price.
    Same rule as every roster seat, and it matters more for an individual.

    NO CONTACT DETAILS. A shop publishes a phone number because it wants calls
    at the counter. A person's page here carries only what she already publishes
    to the whole internet: her own site and her work.
  */
  {
    slug: 'naya-green',
    icon: 'naya-green',
    name: 'Naya Green',
    label: 'Naya Green',
    cuisine: 'Artist',
    tagline: 'Painting and poetry, saving up for a cathedral.',
    color: '#141414|#E6E6E6',
    prep: 0,
    category: 'Artist',
    site: 'https://www.nayagreenart.com/',
    siteCta: 'See her work',
    contactOnly:
      'An artist working in painting and poetry, who describes herself as saving up to buy an old cathedral and turn it into an eccentric LIFEpaintingpoetry museum. Her work is on nayagreenart.com. BEASTY has not spoken to her yet — this spot is held, not taken, and nothing here is an arrangement she has agreed.',
    items: [],
  },
  {
    slug: 'love-thai',
    icon: 'love-thai',
    name: 'Love Thai Restaurant',
    label: 'Love Thai',
    cuisine: 'Thai',
    tagline: 'Thai cooking on Ygnacio Valley Road, women owned.',
    color: '#E9342A|#FFFFFF',
    prep: 0,
    category: 'Asian',
    phone: '(925) 524-0768',
    address: '5434 Ygnacio Valley Rd STE 90, Concord, CA 94521',
    site: 'https://www.doyoulovethaiconcord.com/',
    siteNote: 'They take orders on doyoulovethaiconcord.com',
    menuNote: 'Six they put on their own front page',
    /*
      NOTHING IS PRICED, AND THE ONE PRICE ON THEIR SITE IS A TRAP.

      Their homepage shows a cart holding "Cotton Jump Suit, 2 x $15.00" — that
      is the Squarespace demo content nobody cleared out, not a dish and not a
      price. Their real prices live behind the online-ordering flow. The six
      dishes below are the ones they name themselves on the front page.
    */
    quoteOnly:
      'Thai cooking in Concord, women owned and operated, with dine-in, take-out and a patio. Closed Tuesdays. They take orders through their own site and publish no dish prices on it, so nothing is priced here.',
    groups: [
      {
        name: 'What they put out front',
        items: [
          ['Pad Thai', 'Their front page', 0, 'On their site'],
          ['Panang Curry', 'Their front page', 0, 'On their site'],
          ['Pad Kee Mao', 'Their front page', 0, 'On their site'],
          ['Pineapple Chicken', 'Their front page', 0, 'On their site'],
          ['Orange Beef', 'Their front page', 0, 'On their site'],
          ['Classic Thai Fried Rice', 'Their front page', 0, 'On their site'],
        ],
      },
    ],
    items: [],
  },
  {
    /*
      NO `icon`, ON PURPOSE. Their site carries photographs and no wordmark, and
      their Instagram picture is a photograph of two people — not a logo, and
      not something to put on a directory tile for them. The app draws its own
      openly-generated mark instead, which is exactly what that fallback is for.
      Swap it the moment they send artwork.
    */
    slug: 'facet-fine',
    name: 'Facet Fine',
    label: 'Facet',
    cuisine: 'One-size jumpsuits and swimwear',
    tagline: 'One-size Jump-Hers, rompers and handmade bikinis.',
    color: '#141414|#C9A227',
    logoTemplate: 'wordmark',
    logoFace: 'condensed',
    logoLines: ['FACET', 'FINE'],
    prep: 0,
    category: 'Apparel',
    site: 'https://facetfine.com/',
    /* Their own published prices, and no cart: ordering here is live and they
       have agreed nothing, so buying happens on their shop. */
    quoteOnly:
      'A Los Angeles designer making one-size jumpsuits, rompers, dresses and handmade bikinis. These are their own published prices; buy them on facetfine.com.',
    menuNote: 'Three from their own shop',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['Ribbed BLACK sheer', 'One size 0-16', 9800],
          ['Ribbed sheer HIGH-V Jump-Her', 'One size 0-16', 11100],
          ['SENSATION Laser-Cut Dress', 'Metallic, laser cut', 12500],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'lyrics-born',
    icon: 'lyrics-born',
    name: 'Lyrics Born',
    label: 'Lyrics Born',
    cuisine: 'Hip-hop artist',
    tagline: 'Bay Area hip-hop — records, shows and a variety store.',
    color: '#0A0A0A|#EDEDED',
    prep: 0,
    category: 'Artist',
    site: 'https://www.lyricsborn.com/',
    siteCta: 'See his tour dates',
    /* HIS POST, ON HIS PLATFORM. `href` with no `src` draws a card that opens
       Instagram rather than pretending to embed it. Re-hosting the video here
       would need the file from him and his permission — neither exists. */
    clip: {
      href: 'https://www.instagram.com/reel/DcMBVjYvYrC/',
      credit: 'Posted by Lyrics Born',
      platform: 'Instagram',
    },
    contactOnly:
      'A Bay Area hip-hop artist, also known as Sticky Rice, with records, tour dates and a variety store of his own at lyricsborn.com. BEASTY has not spoken to him yet — this spot is held, not taken, and nothing here is an arrangement he has agreed.',
    items: [],
  },
  {
    slug: 'p-lo',
    icon: 'p-lo',
    name: 'P-Lo',
    label: 'P-Lo',
    cuisine: 'Rapper and producer',
    tagline: 'Bay Area rapper and producer.',
    color: '#2D3690|#FFFFFF',
    prep: 0,
    category: 'Artist',
    site: 'https://p-lo.com/',
    siteCta: 'See his site',
    /*
      "Can you isolate P-Lo for his icon logo please? Also, if you can play this
      video below, but clip the video." — 2026-08-27, and the second half of it
      was lost to a line-by-line read of the thread.

      IT PLAYS ON THE PAGE NOW. `src` is footage on our own origin and plays
      inline; `href` alone only draws a card that opens Instagram. yt-dlp needed
      no format filter — asking for best[height<=1080] came back "requested
      format is not available" on a 1440x1080 VP9 reel, and plain yt-dlp merged
      it fine.

      TWENTY-FOUR SECONDS OF THIRTY, and which twenty-four was measured rather
      than taken from the top: a one-frame-per-second sweep of the whole reel,
      picking the window with the most movement in it. It starts one second in.
      The full post is still one tap away on the card.
    */
    clip: {
      src: '/clips/p-lo.mp4',
      poster: '/clips/p-lo-poster.webp',
      href: 'https://www.instagram.com/reel/DcBzdqRteQZ/',
      credit: 'Posted by P-Lo',
      platform: 'Instagram',
    },
    contactOnly:
      'A Bay Area rapper and producer. BEASTY has not spoken to him yet: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'pawddle',
    icon: 'pawddle',
    name: 'Pawddle',
    label: 'Pawddle',
    cuisine: 'Dog life jackets and gear',
    tagline: 'Dog life jackets — bring your dog on every adventure.',
    color: '#F1EFE7|#4B3A7A',
    prep: 0,
    category: 'Pet goods',
    /* The operator sent their Linktree; this is the shop it points at, which is
       where the prices below actually are. */
    site: 'https://pawddles.store/',
    siteNote: 'Their links also live at linktr.ee/pawddledogs',
    /*
      THE OFFER IS A MOCKUP AND THE APP SAYS SO.

      His words: "If you can create a welcome offer of 15% off as an example
      that would be great. That way when I can reach out to them, they can see
      how their page might potentially look like." `mock: true` is exactly that
      case — the app labels it on screen instead of letting it read as terms,
      because an offer on a partner's page is a promise made in their name.
    */
    offers: { welcome: '15% off your first order', mock: true },
    clip: {
      src: '/clips/pawddle.mp4',
      poster: '/clips/pawddle-poster.webp',
      href: 'https://www.instagram.com/reel/Dccj3_ZRmkr/',
      credit: 'Posted by Pawddle',
      platform: 'Instagram',
    },
    quoteOnly:
      'Dog life jackets and gear, made to fit every breed and to keep a dog safe in the water. These are their own published prices; buy them on pawddles.store. BEASTY has not spoken to them yet — this spot is held, not taken.',
    menuNote: 'What they sell',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['Pawddle Splash Vest', 'Dog life jacket, sizes vary', 2999, '$29.99-$37.99'],
          ['Funny Dog Face Mask', 'Their other product', 3499],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'aglow-outdoor-lighting',
    icon: 'aglow-outdoor-lighting',
    /* THEY DO NOT CALL THEMSELVES "A GLOW LIGHTS" — that is the domain. Every
       instance on their own site reads Aglow Outdoor Lighting. */
    name: 'Aglow Outdoor Lighting',
    label: 'Aglow Lights',
    cuisine: 'Permanent outdoor lighting',
    tagline: 'App-controlled permanent lighting on rooflines and peaks.',
    color: '#5F12B8|#FF6A00',
    prep: 0,
    category: 'Contractor',
    phone: '(925) 307-4324',
    /*
      NO ADDRESS, AND THAT IS THE POINT. They publish none — the footer says
      only "Proudly serving the Bay Area" — and they list roughly eighty cities
      across five regions. Pleasanton is one of them, not where they are.
    */
    site: 'https://aglowlights.com/',
    siteNote: 'They serve most of the Bay Area, not one town',
    quoteOnly:
      'Permanent architectural LED lighting fitted to rooflines, peaks and columns, controlled from an app, open seven days 6am to 9pm. From their own FAQ: most residential installations run between $2,000 and $5,000, with a lifetime workmanship warranty and a three-year product warranty. Every job is quoted on the house, so nothing is priced here.',
    items: [],
  },
  {
    slug: 'fire-slice-pizza',
    icon: 'fire-slice-pizza',
    name: 'Fire Slice Pizza',
    label: 'Fire Slice',
    cuisine: 'Pizza, halal meats',
    tagline: 'Family-owned pizzeria on Clayton Road, halal meats.',
    color: '#C82127|#2B5672',
    prep: 0,
    category: 'Italian',
    phone: '(925) 270-3107',
    address: '2705 Clayton Rd, Concord, CA 94519',
    email: 'Fireslicepizza925@gmail.com',
    /*
      THE OPERATOR'S NOTE WAS "This business needs a proper website and branding
      logo as well." Both turned out to exist: fireslicepizzeria.com is live and
      their wordmark is a finished 1200px file. What the site actually needs is a
      tidy-up — the footer still says "© 2035", a button on the homepage is
      labelled "@wix", and all four policy pages are unedited Wix boilerplate
      with "[enter organization / business name]" still in the brackets. Worth
      telling them; not a reason to call them website-less.
    */
    site: 'https://www.fireslicepizzeria.com',
    siteNote: 'They take orders through Toast',
    items: [],
    /* Their whole published menu, read from https://www.fireslicepizzeria.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Slices", items: [
        ["Slice of Pepperoni", "", 899],
        ["All Meat Slice", "", 999],
        ["Combo Slice", "", 999],
        ["Chicken Tikka Slice", "", 999],
        ["Veggie Slice", "", 999],
        ["Poly Slice", "", 999],
        ["BBQ Chicken Slice", "", 999],
        ["Sam's Big Boss Slice Pepperoni", "", 5599],
        ["Sam’s Big Boss Slice the Works", "", 6599],
        ["Mediterranean Slice", "", 999],
      ] },
      { name: "14\" Pizza", items: [
        ["Mediterranean Pizza \"14", "", 2999],
      ] },
      { name: "24\" Pizza Boss", items: [
        ["Boss Cheese 24\"", "", 5499],
        ["Boss Pepperoni 24\"", "", 5999],
        ["Boss All Meat Pizza 24\"", "", 6999],
        ["Boss Combination Pizza 24\"", "", 6999],
        ["Boss Fire Pizza 24\"", "", 6999],
        ["Boss Chicken Tikka Masala Pizza 24\"", "", 6999],
        ["Boss Veggie Supreme Pizza 24\"", "", 6999],
        ["Boss Creamy Garlic Chicken & Mushroom Pizza 24\"", "", 6999],
        ["Boss Polynesian Pizza 24\"", "", 6999],
        ["Boss BBQ Chicken Pizza 24\"", "", 6999],
        ["Boss Mediterranean Pizza \"24", "", 6999],
        ["Sam’s Big Boss The Works", "", 8000],
      ] },
      { name: "Desserts", items: [
        ["NY Cheese Cake", "Delicious crafted New York Style Cheesecake Slice", 899],
        ["Refershing soda in a can", "", 199],
      ] },
    ],
  },
  {
    slug: 'cryo-canine',
    icon: 'cryo-canine',
    name: 'Cryo Canine Semen Bank',
    label: 'Cryo Canine',
    cuisine: 'Canine reproduction lab',
    tagline: 'Stud semen collection, freezing and storage, Las Vegas.',
    color: '#5E86C4|#52B8E9',
    prep: 0,
    /*
      NO CATEGORY IN THE TWENTY-FOUR REALLY FITS. This is a cryogenic semen bank
      serving breeders, not a clinic treating pets — but the work is clinical
      (collection, microscopy, progesterone assay, insemination), so Veterinary
      clinic is the least wrong seat. "Dog breeder" would be actively false:
      they do not breed or sell dogs. His to move.
    */
    category: 'Canine reproduction',
    phone: '(725) 306-1508',
    address: 'Las Vegas, NV',
    /*
      THEIR PUBLISHED EMAIL IS "cryocaniesb@gmail.com" AND IT LOOKS MISSPELLED —
      "canie" is missing the n of canine. Reproducing it would send a customer
      nowhere, and correcting it would invent an address they never published,
      so it is omitted and the phone number carries the page. Worth telling them.
    */
    site: 'https://cryocanine.com/',
    quoteOnly:
      'A canine reproduction lab in Las Vegas working with breeders: semen collection, analysis, freezing and long-term storage, artificial insemination, and fertility timing. These are their own published prices. The same owner runs Sin City Pits.',
    menuNote: 'Their own published prices',
    groups: [
      {
        name: 'Lab work',
        items: [
          ['Semen analysis', 'Their published price', 10000],
          ['Collection and freezing', 'Collections that do not freeze are $150', 35000],
          ['Collection and insemination', 'Their published price', 15000],
          ['Fresh collection and ship', 'Shipping is charged on top', 25000],
        ],
      },
      {
        name: 'Storage',
        items: [
          ['Frozen storage, per year', 'Up to 12 straws, then $5 a straw', 10000],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'lavish-paws',
    icon: 'lavish-paws',
    name: 'Lavish Paws',
    label: 'Lavish Paws',
    cuisine: 'Dog supplements',
    tagline: 'Lab-formulated supplements for dogs.',
    color: '#232323|#F6AB4A',
    prep: 0,
    category: 'Supplements and nutrition',
    email: 'info@lavishpaws.co',
    /* No address and no phone published. Their footer has a "Call us :" label
       with nothing after it, which reads as broken — worth telling them. */
    site: 'https://lavishpaws.co/',
    quoteOnly:
      'Six lab-formulated supplements for dogs, sold direct from their own shop. These are their own published prices, tax inclusive as their site states. Same owner as Sin City Pits and Cryo Canine.',
    menuNote: 'Their whole range',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['Hip & Joint', 'Their published price', 5799],
          ['Multivitamin', 'Their published price', 3999],
          ['Wild Alaskan Salmon Oil', 'Their published price', 3399],
          ['Probiotics', 'Their published price', 2899],
          ['Lavish Paws Bundle', 'Their bundle, was $162.96', 12999],
        ],
      },
    ],
    items: [],
  },
  {
    /* THEY ARE "POURA ON WHEELS", one word. The operator wrote "Pour A On
       Wheels"; their site, logo, footer and schema all say Poura. */
    slug: 'poura-on-wheels',
    icon: 'poura-on-wheels',
    name: 'Poura on Wheels',
    label: 'Poura',
    cuisine: 'Mobile bar',
    tagline: 'A mobile bar on a three-wheeler, for weddings and events.',
    color: '#183925|#B99A58',
    prep: 0,
    /* NO CATEGORY IN THE TWENTY-FOUR FITS A MOBILE BAR. There is no catering,
       bartending or bar entry. Seated on the yellow sheet rather than filed
       under "Event coordinator", which they are not — they serve drinks at
       events, they do not run them. */
    category: 'Mobile bar and beverage catering',
    phone: '(408) 334-2231',
    email: 'hello@pouraonwheels.com',
    /* No address on purpose: they are mobile and publish none. They list SF,
       San Jose and Pleasanton plus six counties as their service area. */
    site: 'https://pouraonwheels.com/',
    quoteOnly:
      'A mobile bar built on a Piaggio Ape three-wheeler, with six taps, for weddings, corporate events and parties across the Bay Area. Their own site says packages start at $750 and everything else is quoted on the event; they do not supply the alcohol, and they carry general and liquor liability insurance. Nothing else is priced here because they publish nothing else.',
    items: [],
  },
  {
    slug: 'milk-cloud-bakery',
    icon: 'milk-cloud-bakery',
    name: 'Milk Cloud Bakery',
    label: 'Milk Cloud',
    cuisine: 'Japanese-style bakery',
    tagline: 'Shokupan, fruit sandos and Basque cheesecake, Berkeley.',
    color: '#0B0B0B|#A9DBF6',
    prep: 0,
    category: 'Bakery',
    phone: '(415) 589-9239',
    address: '2701 Eighth St, Suite 116, Berkeley, CA 94710',
    email: 'hello@milkcloudbakery.com',
    site: 'https://milkcloudbakery.com/',
    siteNote: 'Their rotating menu is on Instagram',
    menuNote: 'What they bake',
    /*
      NO HOURS AND NO PRICES, BOTH BECAUSE THEY PUBLISH NEITHER. Their site says
      in as many words "Our hours are currently rotating! We'll keep you
      posted!", and there is not a single price anywhere on it. Their pop-up
      calendar lists one date that has already passed and was never confirmed,
      so it is not surfaced here either.
    */
    quoteOnly:
      'A soft-opening bakery on Eighth Street run by Elizabeth, making Japanese-style shokupan, fruit sandos and Basque cheesecakes with organic A2 milk and honey. Their hours are still rotating and they publish no prices, so nothing is priced here — their Instagram carries the current menu.',
    groups: [
      {
        name: 'What they bake',
        items: [
          ['Regular Shokupan', 'Japanese milk bread', 0, 'Ask'],
          ['Kaya Swirl Shokupan', 'Homemade kaya jam, pandan and coconut cream', 0, 'Ask'],
          ['Strawberry Sando', 'With black sesame cream', 0, 'Ask'],
          ['Crème Brûlée Basque Cheesecake', 'Vanilla bean and candied orange', 0, 'Ask'],
        ],
      },
    ],
    photos: [
      { src: '/food/milk-cloud-bakery-site-0-lg.webp', alt: "//img1.wsimg.com/isteam/ip/e5f5ad79-df25-445d-9cb1-0eb66da20e32/milk-cloud-bakery-sign-sample-06.JPG/:/rs=w:1300,h:800", credit: "Their own photo, from milkcloudbakery.com" },
      { src: '/food/milk-cloud-bakery-site-2-lg.webp', alt: "//img1.wsimg.com/isteam/ip/e5f5ad79-df25-445d-9cb1-0eb66da20e32/0309D81A-DB64-4C49-87DF-BB739C8EAD6B%202.JPG/:/rs=w:1300", credit: "Their own photo, from milkcloudbakery.com" },
      { src: '/food/milk-cloud-bakery-site-3-lg.webp', alt: "//img1.wsimg.com/isteam/ip/e5f5ad79-df25-445d-9cb1-0eb66da20e32/LL_06166.JPG/:/rs=w:1300,h:800", credit: "Their own photo, from milkcloudbakery.com" },
      { src: '/food/milk-cloud-bakery-site-4-lg.webp', alt: "//img1.wsimg.com/isteam/ip/e5f5ad79-df25-445d-9cb1-0eb66da20e32/LL_06844.JPG/:/rs=w:1300,h:800", credit: "Their own photo, from milkcloudbakery.com" },
    ],
    items: [],
  },
  {
    /* "MRM Home Services" was the operator's shorthand. Their own site header,
       footer, domain and schema all say Mr. M Home Services — though their body
       copy still calls them Mr. M CLEANING Services in places, which is worth
       telling them. */
    slug: 'mr-m-home-services',
    icon: 'mr-m-home-services',
    name: 'Mr. M Home Services',
    label: 'Mr. M',
    cuisine: 'Exterior home maintenance',
    tagline: 'Windows, gutters, solar panels and roofline lighting.',
    color: '#0B2E4A|#E07D28',
    prep: 0,
    /* Handyman rather than House cleaning: every job they do is OUTSIDE the
       house — windows, gutters, solar panels, permanent roofline lighting.
       "House cleaning" would read as interior domestic work and be wrong. */
    category: 'Handyman and home repair',
    phone: '(510) 283-4022',
    address: '111 Hogan Ct, Walnut Creek, CA 94598',
    email: 'info@mrmhomeservices.com',
    site: 'https://www.mrmhomeservices.com/',
    contactOnly:
      'Exterior home maintenance across the East Bay: window cleaning, gutter cleaning, solar panel cleaning, and permanent architectural roofline lighting. Open Monday to Saturday 8am to 5pm, closed Sunday. Every job starts from a free estimate, so nothing is priced here.',
    items: [],
  },
  {
    /* "Phosho Dough", one word — their own title tag and logo. */
    slug: 'phosho-dough',
    /* NO ICON FILE. The only logo they publish is 132x132, a JPEG, and on a
       baked-in white square — upscaling it would look muddy and the white
       cannot be keyed out. The app draws its own mark on their green until
       they send artwork. */
    logoTemplate: 'badge',
    logoFace: 'grotesk',
    logoInitials: 'PD',
    name: 'Phosho Dough',
    label: 'Phosho Dough',
    cuisine: 'Vietnamese',
    tagline: 'Phở, bún and bánh mì for pickup, Oakland and Berkeley.',
    color: '#558632|#FFFFFF',
    prep: 0,
    category: 'Asian',
    address: '6601 Telegraph Ave, Oakland, CA 94609',
    /* SQUARE SUBDOMAIN, NO DOMAIN OF THEIR OWN — which is exactly why the
       operator sent them. `needsSite` keeps them on his red-outline list. */
    site: 'https://phoshodough.square.site/',
    /*
      The reel he sent with their link and "BEASTY • Goods" (2026-08-23). It
      is @grubwitmike's, a food reviewer, not theirs — a card that opens the
      post, credited to him.
    */
    clip: { src: '/clips/phosho-dough.mp4', poster: '/clips/phosho-dough-poster.webp', href: 'https://www.instagram.com/reel/DcHlbGcBBX2/', credit: 'Filmed by @grubwitmike', platform: 'Instagram' },
    siteCta: 'Order on their Square page',
    needsSite: true,
    siteNote: 'Second pickup counter at 1235 San Pablo Ave, Berkeley',
    items: [],
    /* Their whole published menu, read from https://phoshodough.square.site/#MYAG5QO4BE743MDFVVGXVER5 on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Drinks", items: [
        ["Thai Iced Tea (TRA THAI)", "", 550, "phoshodough-thai-iced-tea-tra-thai"],
        ["Oatmilk Thai Tea", "", 555],
        ["Limeade (Nuoc Chanh)", "", 550, "phoshodough-limeade-nuoc-chanh"],
        ["Soft Drinks (Nuoc Ngoc)", "", 250, "phoshodough-soft-drinks-nuoc-ngoc"],
        ["Iced Green Tea (TRA DA)", "", 250],
        ["Twisted Thai Tea", "", 650, "phoshodough-twisted-thai-tea"],
        ["Sir A. Palmer", "", 650, "phoshodough-sir-a-palmer"],
        ["Vietnamese Coffee (Cafe Sua Da)", "", 550, "phoshodough-vietnamese-coffee-cafe-sua-da"],
      ] },
      { name: "Vermicelli", items: [
        ["Grilled Chicken Vermicelli (Bún GÀ)", "Bowls of vermicelli with mint, cilantro, bean sprouts, lettuce, pickled carrots & daikon, peanuts, spring green onions, & a side of fish sauce.", 1595],
        ["Grilled Fish Vermicelli (Bún CÁ)", "", 1695],
        ["Lemongrass Beef Vermicelli (Bún BÒ)", "", 1595],
        ["Tofu Vermicelli (Bún Đậu phụ)", "", 1595],
        ["Chicken & Shrimp Vermicelli (Bún TÔM GÀ Nướng)", "", 1750],
        ["Pork & Shrimp Vermicelli (Bún TÔM HEO Nướng)", "", 1750],
        ["Beef & Shrimp Vermicelli (Bún TÔM BÒ Nướng)", "", 1750],
        ["Shrimp Vermicelli (Bún TÔM Nướng)", "", 1695],
        ["EGG ROLL VERMICELLI (Bún Chả giò)", "", 1595],
        ["Grilled Pork Vermicelli (Bún HEO Nướng)", "", 1595],
      ] },
      { name: "Appetizers", items: [
        ["Fried Eggrolls (Chicken Inside!) (Chả giò)", "Includes Chicken", 1050],
        ["Fresh Shrimp Spring Roll (Gỏi cuốn TÔM)", "", 1050],
        ["Chicken Spring Roll (Gỏi cuốn GÀ Nướng)", "", 1095],
        ["Grilled Shrimp Spring Roll (Gỏi cuốn TÔM Nướng)", "", 1150],
        ["Fried Egg Roll Wrapped in Spring Roll (Chả giò cuốn)", "", 1195],
        ["Grilled Fish Spring Rolls (Gỏi cuốn CÁ Nướng)", "", 1150],
        ["Veggie Rolls (Gỏi cuốn CHAY)", "", 1050],
        ["Grilled Pork Spring Roll (Gỏi cuốn HEO Nướng)", "", 1095],
        ["Tofu Rolls (Gỏi cuốn Đậu phụ )", "", 1050],
        ["Chicken N' Shrimp Spring Rolls (Gỏi cuốn TÔM GÀ Nướng)", "", 1195],
        ["Grilled Pork N' Shrimp Spring Rolls (Gỏi cuốn TÔM HEO Nướng)", "", 1195],
      ] },
      { name: "Noodle Soups", items: [
        ["Beef Ball N.S (Phở Bò viên)", "", 1450],
        ["Fresh Sliced Beef N.S (Phở tái)", "", 1450],
        ["Shredded Chicken N.S (HỦ TIẾU GÀ xé)", "", 1450],
        ["Fresh Sliced Beef & Beef Ball N.S (Phở tái Bò viên )", "", 1495],
        ["Veggie N.S. (HỦ TIẾU CHAY)", "", 1495],
      ] },
      { name: "Grilled Noodle Soups", items: [
        ["Fish N.S (Phở CÁ Nướng)", "", 1650],
        ["Shrimp N.S (Phở TÔM Nướng)", "", 1650],
        ["Lemongrass Beef N.S (Phở BÒ Nướng)", "", 1550],
        ["Pork N.S (Phở HEO Nướng)", "", 1550],
        ["Roasted Chicken N' Shrimp N.S (HỦ TIẾU TÔM GÀ Nướng)", "", 1695],
        ["Lemongrass Beef N' Shrimp N.S (Phở TÔM BÒ Nướng)", "", 1695],
        ["Pork N' Shrimp N.S (Phở TÔM HEO Nướng)", "", 1695],
        ["Roasted Chicken N.S (HỦ TIẾU GÀ Nướng)", "", 1550],
      ] },
      { name: "Sandwiches", items: [
        ["Grilled Chicken Sandwich (Bánh mì GÀ Nướng)", "", 1050],
        ["Grilled Fish Sandwich (Bánh mì CÁ Nướng)", "", 1150],
        ["Lemongrass Beef Sandwich (Bánh mì BÒ Nướng)", "", 1050],
        ["Grilled Pork Sandwich (Bánh mì HEO Nướng)", "", 1050],
        ["Grilled Shrimp Sandwich (Bánh mì TÔM Nướng)", "", 1150],
        ["Tofu Sandwich (No Pate) (Bánh mì Đậu phụ)", "", 1050],
        ["Veggie Sandwich ( No Pate) (Bánh mì CHAY)", "", 1050],
      ] },
    ],
  },
  {
    slug: 'karam-sf',
    icon: 'karam-sf',
    name: 'Karam Mediterranean Cuisine',
    label: 'Karam',
    cuisine: 'Mediterranean, halal',
    tagline: 'Halal shawarma, kebabs and mezze on Polk Street.',
    color: '#DF0707|#FFFEF6',
    prep: 0,
    category: 'Mediterranean',
    address: '1725 Polk St, San Francisco, CA',
    site: 'https://www.karam-sf.com/',
    /*
      NO HOURS HERE, DELIBERATELY. Their own site says "Wednesday-Monday:
      12AM-10PM", which is midnight to 10pm and cannot be what they mean — their
      Toast page says 12PM and their own promo says 12PM-5PM. Publishing "12AM"
      would repeat their typo and publishing "12PM" would invent a correction.
      Worth telling them; their page titles also still say "My Site 15".
    */
    items: [],
    /* Their whole published menu, read from https://www.karam-sf.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Appetizers", items: [
        ["Hummus", "Organic garbanzo beans,tahini, lemon juice, Olive Oil", 900, "karamsf-hummus"],
        ["Humus/bayrooty", "Organic Garbanzo Beans, Parsley, Garlic, Tahini, Lemon Juice, Olive Oil", 1000, "karamsf-humus-bayrooty"],
        ["Baba Ghanouj", "Smoked Eggplant, Garlic, Tahini, Olive Oil", 1000, "karamsf-baba-ghanouj"],
        ["Muhamara", "Sweet Red Peppers, Walnuts, Burgle (Crushed Wheat ) Olive Oil", 1200, "karamsf-muhamara"],
        ["Labni B Khyar", "Cucumber, Yogurt, Mint, Olive Oil", 1200, "karamsf-labni-b-khyar"],
        ["Warak Enab", "Grape leaves stuffed with rice, parsley, mint, olive oil lemon juice", 1100, "karamsf-warak-enab"],
        ["Kabis Mix", "Mixed Pickles, Turnip, Cucumber Pickels, Olive", 900, "karamsf-kabis-mix"],
        ["Falafel", "Organic Garbanzo And Fava Beans, Onions, Garlic, Parsley", 1200, "karamsf-falafel"],
        ["Halloumi Cheese", "Flat Melted, Cucumber, Mint, Tomatoes", 1400, "karamsf-halloumi-cheese"],
        ["Zahraa (Cauliflower)", "Deep Fried With Garlic & Tahini Sauce", 1300, "karamsf-zahraa-cauliflower"],
        ["Hummus Shawerma Lamb or Chicken", "Organic Garbanzo Beans, Tahini Sauce, & Shaved Beef & Lam Or Chicken Shawarma", 1700, "karamsf-hummus-shawerma-lamb-or-chicken"],
      ] },
      { name: "Wrap Sajj Bread", items: [
        ["Beef & Lamb Shawerma", "Marinated Beef& Lamb Slowly Roasted, {Served With Rice, Salad & Humus}", 2400, "karamsf-beef-lamb-shawerma"],
        ["Beef & Lamb Shawerma Arabic Style", "Served With Salad, French Fries, Pickles", 2400, "karamsf-beef-lamb-shawerma-arabic-style"],
        ["Chicken Shawarma", "Chaved Chicken Slowly Roasted, Pickles, Lettuce, Garlic Sauces", 1500, "karamsf-chicken-shawarma"],
        ["Chicken Shawerma Arabic Style", "Served With Salad, French Fries, Pickles", 2300],
        ["Falafel Wrap", "Lettuce, Tomato, Pickles, Tahini Sauce", 1500, "karamsf-falafel-wrap"],
      ] },
      { name: "Salads", items: [
        ["Tabouli", "Parsley, Onion, Tomatoes, Bulgur (Crushed What Olive Oil, Lemon Juice", 1300, "karamsf-tabouli"],
        ["Fattouch", "Lettuce, Cucumber, Tomatoes, Mint, Onion, Radishes, Italian Parsley, Bell Peppers, Oregano, Croutons, Lemon Juice & Pomegranate", 1400, "karamsf-fattouch"],
        ["Arabic Salad", "Lettuce, Cucumber, Tomatoes, Mint, Onion, Parsley, Lemon Juice & Olive Oil", 1400, "karamsf-arabic-salad"],
      ] },
      { name: "Entree Mashawe", items: [
        ["Ribeye Steak", "Tender Juicy Grilled steak With Secret Spices, {Served With Fries & Salad}", 4000, "karamsf-ribeye-steak"],
        ["Chicken Shawerma", "Marinated Chicken Slowly Roasted {Served With Rice, Salad & Humus}", 2300, "karamsf-chicken-shawerma"],
        ["Shish Taouk", "Cubes Of Grilled Chicken Breast {Served With Rice, Salad & Humus}", 2200, "karamsf-shish-taouk"],
        ["Kafta Kebab", "Minced Beef & Lamb With Blended Herbs {Served With Rice, Salad & Humus}", 2200, "karamsf-kafta-kebab"],
        ["Lamb Shish Kabab", "Cubes Of Grilled Dry Age Lamb {Served With Rice, Salad & Humus}", 2500, "karamsf-lamb-shish-kabab"],
        ["Beef Shish Kabab", "Cubes Grilled Filet Mignon (Served With Rice, Salad & Humus}", 2500],
        ["Combo Kebab", "Chicken, Kafta & Choice Of Lamb Or Beef {Served With Rice, Salad & Humus}", 2800, "karamsf-combo-kebab"],
        ["Reyash", "Rib Cut Grilled Domestic Rack Of Lamb {Served With Rice, Salad & Humus}", 3000, "karamsf-reyash"],
        ["Jawanih Chicken Wings", "Marinated With Garlic, Lemon Juice, House Made Hot Sauce {Served With Salad, French Fries & Humus}", 2200, "karamsf-jawanih-chicken-wings"],
        ["Farooj Meshwe (Grilled Half Chicken)", "Grilled Chicken Marinate with Garlic, Lemon Juice, Hot Sauce {Served With Humus, Salad, and French Fries)", 2300, "karamsf-farooj-meshwe-grilled-half-chicken"],
      ] },
      { name: "Tabekh Stew", items: [
        ["Dawood Basha", "Sautéed Meat Balls, Onion, Tomato Sauce, {Served With Rice}", 2500, "karamsf-dawood-basha"],
        ["Okra Lamb Shank", "Sautéed Okra, Tomatoes, Cilantro, Garlic With Lamb Shank (Served With Rice}", 3000, "karamsf-okra-lamb-shank"],
        ["Kabab Halabi Spicy", "Ground Lamb, Onions, Parsley, Garlic & Tomato Sauce {Served With Rice}", 2500, "karamsf-kabab-halabi-spicy"],
        ["Fasolia - Kidney Beans", "Kidney Beans, Onions, Tomato, Garlic, Lamb Shank (Served With Rice}", 3000, "karamsf-fasolia-kidney-beans"],
      ] },
      { name: "Vegetarian Dishes", items: [
        ["Veggie Okra", "Sautéed Okra, Tomatoes, Cilantro, Garlic {Served With Rice}", 2400],
        ["Moo-jadarra", "Rice & Lentils Cooked On Slow Heat, Garnished With Caramelized Onion & Cumin {Served With Salad}", 2200, "karamsf-moo-jadarra"],
        ["Falafel Plate", "Organic Garbanzo, Tahini Sauce, {Served With Humus), Baba Ghanouj, Salad, & Pickles", 2200, "karamsf-falafel-plate"],
        ["Chicken/Beef Skewer", "", 800],
        ["Kafta Skewer", "", 800],
        ["Lamb Skewer", "", 800],
        ["Rack of Lamb", "", 800, "karamsf-rack-of-lamb"],
        ["Pita Basket Homemade", "", 500],
        ["Rice Bowl", "", 800],
        ["French Fries", "", 800, "karamsf-french-fries"],
      ] },
      { name: "Desserts", items: [
        ["Basbousa", "", 800],
        ["Mabroume", "", 700],
        ["Pistachio Baklava", "", 600],
        ["Walnut Baklava", "", 600],
      ] },
      { name: "Drinks", items: [
        ["Coke", "", 300],
        ["Diet Coke", "", 300],
        ["Zero Coke", "", 300],
        ["Sprite", "", 300],
        ["Fanta", "", 300],
        ["Fresh Lemonade", "", 600],
        ["Yogurt Drink", "", 600],
        ["Iced Tea", "", 600],
        ["Sparkling Water", "", 500],
      ] },
    ],
  },
  {
    slug: 'emporium-sf',
    icon: 'emporium-sf',
    name: 'Emporium San Francisco',
    label: 'Emporium',
    cuisine: 'Arcade bar',
    tagline: 'Arcade, pinball and live music in the old Harding Theater.',
    color: '#0F0F0F|#FF00FF',
    prep: 0,
    /* No category fits a 21+ arcade bar and music venue. Yellow sheet rather
       than filing them under something they are not. */
    category: 'Arcade bar and venue',
    address: '616 Divisadero St, San Francisco, CA 94117',
    /*
      NO PHONE. Their page shows a 504 number — Louisiana, where they have
      another venue — while the structured data on the SAME page gives a 773
      Chicago number. Neither is a Bay Area code, so neither goes on this page
      until they say which is right.

      AND THEY DO NOT NEED A WEBSITE. The operator sent a Linktree and tagged it
      "needs website"; the Linktree is a link-in-bio and their real page is a
      full location page on the chain's own site.
    */
    site: 'https://www.emporiumarcadebar.com/locations/san-francisco',
    quoteOnly:
      'A 21-and-over arcade bar and live music venue in the hundred-year-old Harding Theater — cabinets, pinball, pool, shuffleboard and skee ball, with DJs and a stage. Open 4pm to 2am on weekdays and from 2pm at weekends. Tokens are 25c and most games take one to four; unlimited tokens are $20 a head on a confirmed reservation. They publish no food or drink prices.',
    items: [],
  },
  {
    slug: 'kings-wc-pizza',
    name: 'Kings West Coast Pizzeria',
    label: 'Kings',
    cuisine: 'Brazilian-American pizza',
    tagline: 'Brazilian and West Coast pizza on Mission Street.',
    color: '#080404|#F7F1E3',
    prep: 0,
    /*
      NO ICON YET, AND IT IS NOT AN OVERSIGHT. Their site's header "logo" is a
      1200px illustration of a bear on a scooter crossing the Golden Gate — at
      tile size it reads as a cropped photograph, not a mark. Their real
      circular badge exists on the restaurant wall and on the delivery box
      inside that illustration, but is published nowhere as a file. Ask them for
      it; the app draws its own mark until then.

      Italian is the nearest of the twenty-four and it is not a good fit: there
      is no pizza category and no Brazilian one, and Brazilian is what they lead
      with — feijoada, picanha, catupiry, brigadeiro, açaí.
    */
    logoTemplate: 'badge',
    logoFace: 'slab',
    logoInitials: 'KP',
    category: 'Italian',
    phone: '(415) 605-4242',
    address: '6540 Mission St, Daly City, CA 94014',
    email: 'kingspizzeriawc@gmail.com',
    site: 'https://kingswcpizza.com/',
    clip: {
      src: '/clips/kings-wc-pizza.mp4',
      poster: '/clips/kings-wc-pizza-poster.webp',
      href: 'https://www.instagram.com/reel/DH4_CuVuxm9/',
      credit: 'Posted by Kings West Coast Pizzeria',
      platform: 'Instagram',
    },
    items: [],
    /* Their whole published menu, read from https://kingswcpizza.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Appetizers", items: [
        ["BBQ Chicken Wings", "", 999, "kingswcpizza-bbq-chicken-wings"],
        ["Buffalo Chicken Wings", "", 999],
        ["Spicy Chicken Wings", "", 999, "kingswcpizza-spicy-chicken-wings"],
        ["Mozzarella Sticks", "", 899],
        ["French Fries", "", 899, "kingswcpizza-french-fries"],
        ["Garlic Bread", "", 599, "kingswcpizza-garlic-bread"],
        ["Classic Chicken Wings", "", 899],
        ["Meatballs", "", 899],
        ["Fried Calabresa", "", 1499],
        ["Jalapeño Poppers", "", 899],
        ["Yuca Fries", "", 999],
        ["Garlic Bread W/ Cheese", "", 699],
        ["Classic Garlic and Salt Chicken Wings", "", 899, "kingswcpizza-classic-garlic-and-salt-chicken-wings"],
        ["Lemon Pepper Wings", "Bone in lemon pepper chicken wings", 1099],
        ["Jalapeno Poppers", "", 899],
        ["Garlic Bread with Cheese", "", 699, "kingswcpizza-garlic-bread-with-cheese"],
        ["Beef Meatballs", "", 999],
        ["Yucca Fries", "", 999],
        ["Fried Calabrese", "", 1499],
      ] },
      { name: "Pizza", items: [
        ["Pepperoni Pizza", "Red sauce, mozzarella, pepperoni", 1599, "kingswcpizza-pepperoni-pizza"],
        ["Chicken Catupiry Pizza", "Red sauce, mozzarella, shredded chicken, Brazilian cream cheese, oregano, green olives", 2299, "kingswcpizza-chicken-catupiry-pizza"],
        ["The Bay Special Pizza", "Red sauce, mozzarella, pepperoni, pineapple, sausage, jalapeno, pesto", 1999, "kingswcpizza-the-bay-special-pizza"],
        ["Portuguese Pizza", "White sauce, mozzarella, hard boiled eggs, corn, canadian bacon, onions, tomatoes, green olives", 2299, "kingswcpizza-portuguese-pizza"],
        ["California Special Pizza", "White sauce, mozzarella, chicken, bacon, tomatoes, green onions", 1999, "kingswcpizza-california-special-pizza"],
        ["Calabresa Pizza", "Red sauce, mozzarella, calabresa sausage, black olives, cooked onions", 2299, "kingswcpizza-calabresa-pizza"],
        ["Margherita Pizza", "Red sauce, mozzarella, tomatoes, fresh basil", 1899, "kingswcpizza-margherita-pizza"],
        ["Combination Special Pizza", "Red sauce, mozzarella, pepperoni, salami, sausage, tomato, bell pepper, onions, mushroom", 2099, "kingswcpizza-combination-special-pizza"],
        ["Greek Pizza", "Red sauce, mozzarella, spinach, black olives, feta cheese, tomatoes, garlic", 1999, "kingswcpizza-greek-pizza"],
        ["Hawaiian Pizza", "Red sauce, Canadian bacon, pineapple", 1699, "kingswcpizza-hawaiian-pizza"],
        ["Kings Special Pizza", "Red sauce, mozzarella, spinach, mushrooms, broccoli, pesto, chicken, onions", 2099, "kingswcpizza-kings-special-pizza"],
        ["Cheese Pizza", "With red sauce and mozzarella", 1499, "kingswcpizza-cheese-pizza"],
        ["Haight-Ashbury Special Pizza", "With red sauce, mozzarella, mushrooms, bell peppers, tomato, black olives, and onions", 1999],
        ["Meat Lover's Pizza", "With red sauce, mozzarella, pepperoni, salami, ham, chicken, and sausage", 2099],
        ["5-Cheese Pizza", "With red sauce, mozzarella, ovalini, blue cheese, feta, and Parmesan", 1999],
        ["Hula-Hula BBQ Chicken Pizza", "With red sauce, mozzarella, pineapple, chicken, BBQ sauce, and green onions", 1899, "kingswcpizza-hula-hula-bbq-chicken-pizza"],
        ["Create-Your-Own Pizza (16\" X-Large)", "With your choice of sauce", 2599],
      ] },
      { name: "Pasta", items: [
        ["Fettuccine Alfredo (Family)", "", 4699],
        ["Chicken Fettuccine Alfredo (Family)", "", 7599, "kingswcpizza-chicken-fettuccine-alfredo-family"],
        ["Spaghetti w/ Marinara Sauce (Individual)", "", 1599, "kingswcpizza-spaghetti-w-marinara-sauce-individual"],
        ["Spaghetti w/ Marinara Sauce (Family)", "", 4699, "kingswcpizza-spaghetti-w-marinara-sauce-family"],
        ["Fettuccine Alfredo (Individual)", "", 1599, "kingswcpizza-fettuccine-alfredo-individual"],
        ["Spaghetti w/ Meat Sauce (Individual)", "", 1799, "kingswcpizza-spaghetti-w-meat-sauce-individual"],
        ["Spaghetti w/ Meat Sauce (Family)", "", 7599, "kingswcpizza-spaghetti-w-meat-sauce-family"],
        ["Chicken Fettuccine Alfredo (Individual)", "", 1899, "kingswcpizza-chicken-fettuccine-alfredo-individual"],
        ["Pesto Parmesan Chicken Penne (Individual)", "", 1899],
        ["Pesto Parmesan Chicken Penne (Family)", "", 7599],
        ["Sunset Penne Marinara & Alfredo Sauce (Individual)", "With your choice of protein", 1999],
        ["Sunset Penne Marinara & Alfredo Sauce (Family)", "With your choice of protein", 7599],
      ] },
      { name: "Salads", items: [
        ["Caesar Salad (Family)", "Served with Caesar dressings included: crisp romaine, croutons, and parmesan", 3499],
        ["Chicken Caesar Salad (Family)", "Served with Caesar dressings included: crisp romaine, croutons, parmesan, and chicken breast", 4999],
        ["Green Salad (Family)", "Included: lettuce, tomatoes, red onions, black olives, cucumber, bell peppers", 4399],
        ["Greek Salad (Family)", "Included: tomatoes, green bell peppers, cucumber, red onions, feta cheese, kalamata olives, oregano, and olive oil", 4399],
        ["Caesar Salad (Individual)", "Romaine with croutons and Parmesan. Served with Caesar dressing", 1199],
        ["Chicken Caesar Salad (Individual)", "Romaine with croutons, Parmesan, and chicken breast. Served with Caesar dressing", 1699],
        ["Green Salad (Individual)", "Lettuce with tomato, red onions, cucumber, pepperoncini and bell peppers. Served with your choice of dressing", 1299],
        ["Greek Salad (Individual)", "Diced tomatoes, green bell peppers, cucumbers, red onions, feta, Kalamata olives, oregano, and olive oil. Served with your choice of dressing", 1499],
        ["Caesar Salad", "Crisp romaine, croutons, parmesan, served with Caesar dressing.", 1199, "kingswcpizza-caesar-salad"],
        ["Chicken Caesar Salad", "Crisp romaine, croutons, parmesan, chicken breast served with Caesar dressing.", 1599],
        ["Green Salad", "Lettuce, tomato, red onions, black olives, cucumber, and bell peppers.", 1299],
        ["Greek Salad", "Diced tomatoes, green bell peppers, cucumbers, red onions, feta cheese, kalamata olives, oregano, and olive oil.", 1499, "kingswcpizza-greek-salad"],
      ] },
      { name: "Desserts", items: [
        ["Chocolate Cake", "", 699, "kingswcpizza-chocolate-cake"],
        ["Cheesecake", "", 699, "kingswcpizza-cheesecake"],
        ["Homemade Flan", "", 699],
        ["Nutella Pizza", "With cheese and Nutella", 1899],
        ["Brigadeiro Pizza", "With cheese, homemade chocolate fudge, and chocolate sprinkles", 1999],
        ["Beijinho Pizza", "With cheese, condensed milk cream, and shredded coconut", 2099],
        ["Banana & Cinnamon Pizza", "With cheese, condensed milk cream, banana, and cinnamon", 2099],
        ["Açai Bowl", "With strawberry, powdered milk, granola, banana, and condensed milk", 1499],
        ["Flan (Brazilian-Style Homemade)", "", 699],
        ["Passion Fruit Mousse", "", 699],
        ["Traditional Acai", "Strawberry, banana, granola, Nido, and condensed milk.", 1499, "kingswcpizza-traditional-acai"],
      ] },
      { name: "Beverages", items: [
        ["Sparkling Water", "", 349, "kingswcpizza-sparkling-water"],
        ["Assorted Individual Sodas", "", 225],
        ["Assorted 2L Soda Bottles", "", 699],
        ["Assorted Fruit Juices", "", 299],
        ["Assorted Jarritos Sodas", "Fruit-flavored Mexican sodas", 299],
        ["Mexican Coke", "Made with cane sugar", 350, "kingswcpizza-mexican-coke"],
        ["Energy Drink", "", 375],
        ["2 Liters", "2 liter bottles", 699, "kingswcpizza-2-liters"],
      ] },
      { name: "Kings Deal!", items: [
        ["Kings Deal", "Extra Large Pizza, 10Pz Wings, Choice Salad, and 2 L Soda!", 4999, "kingswcpizza-kings-deal"],
      ] },
      { name: "Sunday plates", items: [
        ["Chicken Plate", "Rice, pinto beans, vegetable, French fries, chicken breast. Salad", 1999],
        ["Picanha Plate", "Rice, beans, farofa, French fries, fried banana, salad, vegetable, picanha", 2799, "kingswcpizza-picanha-plate"],
        ["Chef's Special Plate", "Plate of the day", 2199],
      ] },
      { name: "House Pizzas", items: [
        ["Plain Cheese Pizza", "Red sauce, mozzarella", 1499, "kingswcpizza-plain-cheese-pizza"],
        ["Vegetarian Special Pizza", "", 1999, "kingswcpizza-vegetarian-special-pizza"],
        ["Meat Lovers Pizza", "Red sauce, mozzarella, pepperoni, salami, ham, chicken, sausage", 2099, "kingswcpizza-meat-lovers-pizza"],
        ["Five Cheese Pizza", "Red sauce, mozzarella, ovolini, blue cheese, feta cheese, shredded parmesan cheese", 2199, "kingswcpizza-five-cheese-pizza"],
        ["Hula Hula BBQ Chicken Pizza", "Red sauce, mozzarella, pineapple, chicken, BBQ sauce, green onions", 1899, "kingswcpizza-hula-hula-bbq-chicken-pizza"],
      ] },
      { name: "Cheeseburger", items: [
        ["King Cheeseburger", "Comes with Cheddar cheese, lettuce, tomatoes, onions, pink sauce, beef patty.", 1599, "kingswcpizza-king-cheeseburger"],
        ["Western Burger", "Comes with Cheddar cheese, lettuce, tomatoes, onions, BBQ sauce, beef patty", 1699],
      ] },
      { name: "Pasta In House", items: [
        ["Spaghetti Classic Butter & Garlic", "", 1299],
        ["Spaghetti Marinara Sauce", "", 1499, "kingswcpizza-spaghetti-marinara-sauce"],
        ["Fettuccine Alfredo", "", 1599, "kingswcpizza-fettuccine-alfredo"],
        ["Spaghetti Meat Sauce", "", 1999, "kingswcpizza-spaghetti-meat-sauce"],
        ["Chicken Fettuccine Alfredo", "", 1999, "kingswcpizza-chicken-fettuccine-alfredo"],
        ["Sunset Fettuccine (Marinara and Alfredo)", "", 1999],
      ] },
      { name: "Dessert Pizzas", items: [
        ["Nutella Dessert Pizza", "Includes Nutella and cheese.", 1999],
        ["Brigadeiro Dessert Pizza", "Includes cheese, homemade chocolate fudge, chocolate sprinkles", 2299],
        ["Beijinho Dessert Pizza", "Includes cheese, white condensed milk cream, shredded coconut", 1999],
        ["Banana & Cinnamon Dessert Pizza", "Includes cheese, white condensed milk cream, banana, cinnamon", 2299],
        ["Dessert 1/2 & 1/2", "", 1450],
      ] },
      { name: "Extras", items: [
        ["Marinara Sauce", "", 100, "kingswcpizza-marinara-sauce"],
        ["Alfredo Sauce", "", 100],
        ["Pesto Sauce", "", 100],
        ["BBQ Sauce", "", 100, "kingswcpizza-bbq-sauce"],
        ["Buffalo Sauce", "", 100, "kingswcpizza-buffalo-sauce"],
      ] },
    ],
  },
  {
    slug: 'peters-design-company',
    icon: 'peters-design-company',
    name: 'Peters Design Company',
    label: 'PDCo',
    cuisine: 'Branding and design',
    tagline: 'A branding and design studio, Minneapolis.',
    color: '#141414|#FF6800',
    prep: 0,
    category: 'Branding and design',
    email: 'allan@allanpeters.com',
    site: 'https://www.petersdesigncompany.com/',
    siteCta: 'See their work',
    /*
      HELD, NOT TAKEN, AND HE IS NOT LOCAL. The operator wants to ask him to
      headline the Online page and possibly design BSTY Goods branding — nothing
      has been asked and nothing agreed. They are a two-person husband-and-wife
      company in the Minneapolis suburbs, not a San Francisco freelancer, and
      they publish no rate for design work at all.
    */
    quoteOnly:
      'A branding and design company run by Allan and Maria Peters out of the Minneapolis suburbs — logos, brand identity, posters and icons. The prices below are from their own shop; they publish no rate for design work. BEASTY has not spoken to them: this spot is held, not taken.',
    menuNote: 'From their shop',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['Posters and art prints', 'Their published price', 3000],
          ['T-shirts', 'Their published price', 2500],
          ['Hoodies', 'Their published price', 4500],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'tiny-wheels',
    icon: 'tiny-wheels',
    name: 'Tiny Wheels',
    label: 'Tiny Wheels',
    cuisine: 'Dog beds',
    tagline: 'A car-shaped bed for small dogs.',
    color: '#121212|#B57EDC',
    prep: 0,
    /*
      PET GOODS IS TAKEN BY PAWDDLE, so this sits in the home spot. A dog bed is
      furniture as much as it is pet kit, and the alternative was bumping a
      business that was seated first.
    */
    category: 'Pet goods',
    email: 'Tinywheelsco@outlook.com',
    site: 'https://tinywheelspets.com/',
    clip: {
      src: '/clips/tiny-wheels.mp4',
      poster: '/clips/tiny-wheels-poster.webp',
      href: 'https://www.instagram.com/reel/Dcg6A7npkpj/',
      credit: 'Posted by Tiny Wheels',
      platform: 'Instagram',
    },
    /*
      WHAT IS DELIBERATELY NOT ON THIS PAGE, and why.

      THEIR REVIEWS. The product was published to their store on 2026-08-23 and
      the page carries dozens of "Verified" reviews dated months earlier, one
      dated in the FUTURE with the body text "NA", and four different totals for
      how many customers they have. None of it can be true, and republishing it
      would put a false claim on BEASTY's own domain.

      THEIR VARIANT NAMES. The bed is sold in versions called G-Wagon, Cayenne,
      GT3, Urus, Roma and 488 Pista — Mercedes, Porsche, Lamborghini and Ferrari
      trademarks. Reprinting those here would hand somebody else's legal problem
      to the operator. The bed is described by what it is instead.

      Their support hours are CET and the storefront defaults to Spain, so this
      is a European operation selling in dollars, not a Bay Area business.
    */
    quoteOnly:
      'A one-product online store selling a car-shaped bed for small dogs, made to order, with an optional wall mount. These are their own published prices. The shop opened in late August 2026 and is run from Europe — support is Monday to Friday, 9am to 6pm CET. BEASTY has not spoken to them: this spot is held, not taken.',
    menuNote: 'What they sell',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['Luxury dog bed', 'Made to order, several styles', 8999],
          ['Wall mount set', 'Optional', 1495],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'fruits-byheart',
    icon: 'fruits-byheart',
    name: 'Fruits Byheart',
    label: 'Fruits Byheart',
    cuisine: 'Fruit displays for events',
    tagline: 'Carved fruit displays and grazing tables, California.',
    color: '#101010|#E8E8E8',
    prep: 0,
    /*
      NO CATEGORY FITS, and the nearest is taken. Carved fruit displays for
      events are closest to Snacks and sweets, which Golden State Ballerz holds
      — an apparel brand in the snacks seat. Rather than bump a business that
      was seated first, this takes a free spot on the same sheet he asked for.
      His to rearrange.
    */
    category: 'Fruit displays',
    /*
      THEIR DOMAIN IS DEAD. fruitsbyheart.com is the link in their own bio and
      it does not resolve at all — no DNS record — which is exactly why the
      operator flagged them as needing their website updated. Their Instagram
      is the only thing that works, so that is what this links to, and
      `needsSite` keeps them on his red-outline list.
    */
    site: 'https://www.instagram.com/fruitsbyheart/',
    siteCta: 'See their Instagram',
    needsSite: true,
    contactOnly:
      'Carved fruit displays and grazing tables for weddings and events, working across California — they call it Love At First Bite. They take enquiries by DM. The domain in their bio, fruitsbyheart.com, does not resolve, and they publish no prices, so nothing is priced here. BEASTY has not spoken to them: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'the-bubble-house',
    icon: 'the-bubble-house',
    name: 'The Bubble House',
    label: 'Bubble House',
    cuisine: 'Soft play and bounce house hire',
    tagline: 'Soft play sets and white bounce houses for parties.',
    color: '#F3D3DD|#3A2A30',
    prep: 0,
    /*
      Event coordinator is the nearest of the twenty-four and it is already Bay
      Area Charters'. A soft play hire company is not an event coordinator
      anyway — they drop off a set, they do not run the party — so this takes an
      open spot rather than a wrong label.
    */
    category: 'Soft play hire',
    site: 'https://www.instagram.com/__thebubblehouse__/',
    siteCta: 'See their Instagram',
    needsSite: true,
    /*
      NO ICON OF THEIRS EXISTS. The operator's own instruction was "Maybe crop a
      tile of this image for there icon for now" — so the tile is a crop of
      their own photograph of a set, not a logo, and it is a stand-in until they
      have one. He also said they are in "desperate need of a website,
      branding/logo", which is the whole reason they are on his list.
    */
    contactOnly:
      'Luxe soft play sets and white bounce houses hired out for children’s parties. They take bookings by DM and have no website, no published phone and no published prices, so nothing is priced here. BEASTY has not spoken to them: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'tot-spot-soft-play',
    icon: 'tot-spot-soft-play',
    name: 'Tot Spot Soft Play Rentals',
    label: 'Tot Spot',
    cuisine: 'Soft play and bounce house hire',
    tagline: 'Luxe soft play and mini bounce houses, Bay Area.',
    color: '#5B2D8E|#F4A6C0',
    prep: 0,
    category: 'Soft play hire',
    /*
      A GOOGLE FORM IS NOT A WEBSITE. Their only link is forms.gle — the exact
      stopgap `needsSite` exists for. Linking the form would take a customer
      straight into a booking request with nothing to look at first, so this
      points at their Instagram and keeps them on the red-outline list.

      Second soft play company in the same city, the same night — worth him
      knowing before he pitches both.
    */
    site: 'https://www.instagram.com/totspotsoftplay/',
    siteCta: 'See their Instagram',
    needsSite: true,
    contactOnly:
      'Luxe soft play sets and mini bounce houses for parties, working the SF Bay Area and beyond. Bookings go through a Google form linked from their Instagram; they have no website and publish no prices, so nothing is priced here. BEASTY has not spoken to them: this spot is held, not taken.',
    items: [],
  },
  {
    /* "Make It Moment" is only the domain — they call themselves Moment.Us. */
    slug: 'moment-us',
    icon: 'moment-us',
    name: 'Moment.Us',
    label: 'Moment.Us',
    cuisine: 'Photo and video for events',
    tagline: 'Photo booths, Glambot and portrait lounges for events.',
    color: '#141414|#F3F3F3',
    prep: 0,
    /* Photo and video is San Francisco's seat and I-Snapped holds it, so this
       takes an open spot rather than bumping a business seated first. */
    category: 'Photo and video',
    phone: '(425) 224-3854',
    email: 'hello@makeitmoment.us',
    /* NO ADDRESS: they publish none. And they are SEATTLE-FIRST — their own
       header reads "Seattle, SF Bay Area & beyond", the FAQ says "our Seattle
       studio", and the phone is a Washington 425 number. The operator filed
       them under San Francisco, which is fair as a service area and wrong as a
       home base. */
    site: 'https://www.makeitmoment.us',
    siteNote: 'Seattle-based; they cover the Bay Area too',
    menuNote: 'Their own published prices',
    quoteOnly:
      'Photo booths and cinematic video activations for weddings, corporate events and brand launches — including a robotic-arm Glambot and portrait lounges. Based in Seattle and working the Bay Area. These are their own published starting prices; every booking is quoted on the event.',
    groups: [
      {
        name: 'From their own price list',
        items: [
          ['The Classic • Digital', 'From', 95000],
          ['The Classic', 'From', 130000],
          ['The Icon', 'From', 150000],
          ['Glambot', 'From', 270000],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'olesia-cake-studio',
    icon: 'olesia-cake-studio',
    name: 'Olesia Cake Studio',
    label: 'Olesia Cake',
    cuisine: 'Cake decorating classes',
    tagline: 'Hands-on cake and cupcake classes on 16th Street.',
    color: '#2E302F|#FAF8F3',
    prep: 0,
    /* They sell a CLASS, not a cake. No listed category covers a workshop, and
       filing them under Bakery would have people turning up expecting to buy
       something baked. Open spot instead. */
    category: 'Cake decorating classes',
    address: '2940 16th St #322, San Francisco, CA 94103',
    email: 'info@olesiacake.com',
    site: 'https://www.olesiacake.com/workshop',
    menuNote: 'Their own published prices',
    quoteOnly:
      'A cake studio on 16th Street running hands-on cake and cupcake decorating classes, plus private and corporate sessions. These are their own published prices; classes are booked by the date on their site.',
    groups: [
      {
        name: 'Classes',
        items: [
          ['Mini Heart Cake + Mimosas', 'Their published price', 15900],
          ['Sip & Decorate with Mimosas', 'Their published price', 12900],
          ['Private cake class', 'Per person, ten minimum', 15500],
          ['Private cupcake class', 'Per person, ten minimum', 13500],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'glowpaws',
    icon: 'glowpaws',
    name: 'GlowPaws',
    label: 'GlowPaws',
    cuisine: 'LED dog boots',
    tagline: 'Light-up boots and collar for walking a dog at night.',
    color: '#06172D|#1E90FF',
    prep: 0,
    category: 'Pet goods',
    site: 'https://valenio.store/products/glow-paws',
    /*
      SAME OWNER AS DRYPUP, AND HE SHOULD KNOW BEFORE HE PITCHES BOTH. The legal
      pages on valenio.store and relunio.store carry the same name, tax ID,
      street address, phone and Gmail — one sole trader in Pudahuel, Chile,
      running two single-product Shopify funnels. They are not two businesses.

      NOTHING PROMOTIONAL FROM EITHER STORE IS REPEATED HERE. Their ratings
      ("4.9/5, 4,000+ happy dog parents" on a product forty days old), their
      countdown timers, their "going viral" line and the trademark symbol they
      claim without a registration are all left off. The product and the price
      are real; the marketing around them is not evidence of anything.
    */
    quoteOnly:
      'LED-lit boots and a matching collar for walking a dog after dark, sold direct. These are their own published prices. The shop is run from Chile and sells in dollars; the same owner runs DryPup. BEASTY has not spoken to them: this spot is held, not taken.',
    menuNote: 'What they sell',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['LED dog boots', 'Sizes XS to 4XL', 3995],
          ['LED collar', 'Their price', 1495],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'drypup',
    icon: 'drypup',
    name: 'DryPup',
    label: 'DryPup',
    cuisine: 'Dog drying bag',
    tagline: 'A hands-free drying bag for a dog after a bath.',
    color: '#0E3A52|#238CC4',
    prep: 0,
    category: 'Pet goods',
    site: 'https://relunio.store/products/drypup-hands-free-dog-drying-bag',
    clip: {
      src: '/clips/drypup.mp4',
      poster: '/clips/drypup-poster.webp',
      href: 'https://www.instagram.com/reel/DcZdfdTQLhX/',
      credit: 'Posted by DryPup',
      platform: 'Instagram',
    },
    /*
      THE REVIEWS ON THIS PRODUCT CANNOT BE REAL and none of them appear here.
      The product record was created 2026-08-22; all forty "Verified" reviews on
      its page are dated BEFORE that, the earliest by about nineteen months, and
      the page gives three different review totals. The same three reviewer names
      head the GlowPaws page in the same order, several review bodies talk about
      cats on a dog product, and one praises "the best pet grooming tool on
      Shopify". Same owner as GlowPaws — see that seed.
    */
    quoteOnly:
      'A fabric drying bag you attach a hair dryer to, for drying a dog after a bath. These are their own published prices. The shop is run from Chile and sells in dollars; the same owner runs GlowPaws. BEASTY has not spoken to them: this spot is held, not taken.',
    menuNote: 'What they sell',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['Drying bag', 'Sizes S to XL', 2995],
          ['Buy two, get one', 'Their bundle', 5985],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'puppiepack',
    name: 'PuppiePack',
    label: 'PuppiePack',
    cuisine: 'Pet carrier backpacks',
    tagline: 'A mesh carrier backpack for small and medium pets.',
    color: '#1B1B1F|#F2A93B',
    prep: 0,
    category: 'Pet goods',
    site: 'https://www.puppiepack.store/',
    clip: {
      src: '/clips/puppiepack.mp4',
      poster: '/clips/puppiepack-poster.webp',
      href: 'https://www.instagram.com/reel/DbtLc7eROjF/',
      credit: 'Posted by PuppiePack',
      platform: 'Instagram',
    },
    /*
      NO ICON AND NOTHING PROMOTIONAL, for the same reasons as GlowPaws and
      DryPup. The only images on their site are their storefront builder's own
      theme assets — shipping a ShopBase theme file as their app icon would be
      the Astra mistake again — so the app draws its own mark until they send
      artwork.

      Their domain was registered 2026-06-23, two months ago, and the store runs
      on ShopBase. That is not disqualifying and it is not hidden here; it is
      why nothing on this page repeats their marketing. The product and the
      price are theirs and real.
    */
    logoTemplate: 'badge',
    logoFace: 'grotesk',
    logoInitials: 'PP',
    quoteOnly:
      'A breathable mesh carrier backpack for small and medium pets, up to about nine kilos, sold direct online. This is their own published price. BEASTY has not spoken to them: this spot is held, not taken.',
    menuNote: 'What they sell',
    groups: [
      {
        name: 'From their shop',
        items: [['Carrier backpack', 'Their published price', 9998]],
      },
    ],
    items: [],
  },
  {
    slug: 'traballos-backyard-bbq',
    name: 'Traballo’s Backyard BBQ',
    label: 'Traballo’s',
    cuisine: 'Backyard BBQ',
    tagline: 'Smoked brisket, ribs and hot links on Bayshore Road.',
    color: '#0A0A0A|#F2F2F2',
    prep: 0,
    /* No BBQ or smokehouse entry exists in the twenty-four, so this takes an
       open spot rather than being filed under Burgers because a burger appears
       in one of their photos. Their menu is smoked-meat plates. */
    category: 'Backyard BBQ',
    phone: '(707) 342-7748',
    address: '3001 Bayshore Rd Ste 1, Benicia, CA 94510',
    site: 'https://traballosbackyardbbq.com/',
    /*
      NO ICON, AND THIS ONE IS IMPORTANT.

      The obvious pick — the transparent 1024px badge used on every page of
      their site — has four errors baked into the artwork: it reads "BACKKYARD",
      "3001 Beyshove Rd", "Benicta CA" and "@Backyardbbg707". Their own footer,
      contact page and Instagram all say Backyard, Bayshore, Benicia and
      @backyardbbq707. Their T-SHIRT artwork carries the correct wording, so the
      site badge is a corrupted regeneration of the real mark.

      Publishing it would put a misspelled address and a dead Instagram handle
      on their page. The app draws its own mark until they send a clean file.
    */
    logoTemplate: 'badge',
    logoFace: 'slab',
    logoInitials: 'TB',
    items: [],
    /* Their whole published menu, read from https://traballosbackyardbbq.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Plates", items: [
        ["1 Way BBQ Plate", "", 2600, "traballosbackyardbbq-1-way-bbq-plate"],
        ["2 Way BBQ Plate", "", 3250, "traballosbackyardbbq-2-way-bbq-plate"],
        ["3 Way BBQ Plate", "", 3900, "traballosbackyardbbq-3-way-bbq-plate"],
        ["Yolk'em Bowl", "", 1500, "traballosbackyardbbq-yolk-em-bowl"],
        ["Filipino Breakfast Burrito", "", 1500, "traballosbackyardbbq-filipino-breakfast-burrito"],
        ["Parekuzzi Breakfast Box", "", 1800, "traballosbackyardbbq-parekuzzi-breakfast-box"],
      ] },
      { name: "Sides", items: [
        ["Mama's Style Potato Salad", "", 650, "traballosbackyardbbq-mama-s-style-potato-salad"],
        ["Foe Cheesy Mac N Cheezy", "", 650, "traballosbackyardbbq-foe-cheesy-mac-n-cheezy"],
        ["Yadidabeans", "", 650, "traballosbackyardbbq-yadidabeans"],
        ["Rice N Yadidabeans", "", 650, "traballosbackyardbbq-rice-n-yadidabeans"],
        ["Steamed Rice", "", 650, "traballosbackyardbbq-steamed-rice"],
      ] },
      { name: "Meat by the Pound", items: [
        ["Brisket", "", 1300, "traballosbackyardbbq-brisket"],
        ["Smoked Ribs", "", 500, "traballosbackyardbbq-smoked-ribs"],
        ["Pulled Pork", "", 910, "traballosbackyardbbq-pulled-pork"],
        ["Grilled Chicken", "", 910, "traballosbackyardbbq-grilled-chicken"],
        ["Hot Links (1 pc)", "", 650, "traballosbackyardbbq-hot-links-1-pc"],
      ] },
      { name: "Drinks", items: [
        ["Cali Drip", "", 650],
        ["Water", "", 200],
      ] },
      { name: "Smash burgers", items: [
        ["1 Stack Smash Burger", "", 1500, "traballosbackyardbbq-1-stack-smash-burger"],
        ["2 Stack Smashed Burger", "", 2000, "traballosbackyardbbq-2-stack-smashed-burger"],
        ["Jimmy Whop", "", 2500, "traballosbackyardbbq-jimmy-whop"],
      ] },
    ],
  },
  {
    slug: 'eat-with-sie',
    icon: 'eat-with-sie',
    name: 'Eat With Sie',
    label: 'Eat With Sie',
    cuisine: 'Food and lifestyle creator',
    tagline: 'Bay Area food, beauty and lifestyle creator.',
    color: '#1A1A1A|#E8E2DC',
    prep: 0,
    category: 'Creator',
    /*
      A PERSON, WHICH IS WHY SHE IS ON THIS SHEET. Sienna is a food, beauty and
      lifestyle creator in the Bay Area — she is paid to recommend other
      people's products, and sells nothing of her own, so there is nothing to
      price and no shop to link.

      A LINKTREE IS ALL SHE HAS. eatwithsie.com and .co do not resolve. The
      operator's "needs a website" call is right, and `needsSite` keeps her on
      that list.
    */
    site: 'https://linktr.ee/eatwithsie',
    siteCta: 'See her links',
    needsSite: true,
    contactOnly:
      'A Bay Area food, beauty and lifestyle creator, posting on Instagram, TikTok and YouTube as @eatwithsie. She recommends other people’s products rather than selling her own, so nothing is priced here. BEASTY has not spoken to her: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'griffo-distillery',
    icon: 'griffo-distillery',
    name: 'Griffo Distillery',
    label: 'Griffo',
    cuisine: 'Craft distillery',
    tagline: 'Gin, whiskey and brandy from Scott Street, Petaluma.',
    color: '#404041|#9E702A',
    prep: 0,
    /* THE FIRST DISTILLERY ON THE APP, and there is no distillery, spirits or
       bar entry among the twenty-four — the operator noticed this himself when
       he sent it. Open spot rather than a wrong label; the list needs a row. */
    category: 'Distillery',
    phone: '(707) 879-8755',
    address: '1320 Scott St, Suite A, Petaluma, CA 94954',
    email: 'info@griffodistillery.com',
    site: 'https://griffodistillery.com/',
    siteNote: 'Bonded Distillery DSP-CA-20051',
    menuNote: 'A few of theirs',
    /*
      PRICES ARE THEIRS, MINUS TWO THAT ARE NOT PRODUCTS. Their public product
      feed also carries a "Processing Fee" at $476.99 and a "Custom Distilling
      Customer Invoice" at $1,000 — internal invoicing SKUs that are published
      by accident. Anything that pulls their catalogue automatically will render
      those next to the gin. Excluded deliberately, and worth telling them.

      The .65 endings are theirs: California excise tax is folded into the shelf
      price, as their own canned-cocktail label spells out.
    */
    quoteOnly:
      'A craft distillery and tasting bar on Scott Street making gin, whiskey, vodka, brandy and a cold brew coffee liqueur, with tours, tastings and private events. Tasting bar Thursday 5-9pm, Friday and Saturday 2-7pm, Sunday 1-6pm, though it closes for private events — check their calendar. They ship across the US except AR, MI, MT, MS, SD, TN and UT, through licensed third-party retailers. Over-21s only. These are their own published prices.',
    groups: [
      {
        name: 'Bottles',
        items: [
          ['Scott Street Gin', 'Their published price', 3565],
          ['Vodka', 'Their published price', 3065],
          ['Stony Point Whiskey', 'Their published price', 4665],
          ['Cold Brew Coffee Liqueur', 'A 33-proof liqueur, not coffee', 3365],
        ],
      },
      {
        name: 'At the distillery',
        items: [['Tour and tasting', 'Per guest, five spirits', 3000]],
      },
    ],
    items: [],
  },
  {
    slug: 'rockin-crawfish',
    name: 'Rockin’ Crawfish',
    label: 'Crawfish',
    cuisine: 'Cajun seafood boil',
    tagline: 'Crawfish, crab and shrimp boils on El Portal Drive.',
    color: '#6A0719|#4E2011',
    prep: 0,
    /* No seafood, Cajun or crab-boil entry exists in the twenty-four. */
    category: 'Cajun seafood',
    address: '2300 El Portal Dr L, San Pablo, CA 94806',
    email: 'Info@therockincrawfish.com',
    /*
      THEY DO HAVE A WEBSITE — the operator assumed DoorDash was all they had.
      It is two pages with no menu on it, and both "Order Now" buttons lead to
      the same delivery listing, so his instinct that they need a real one is
      right even though the premise was wrong.

      NO PHONE AND NO HOURS. Their site publishes neither, their Instagram is
      private, and the numbers and hours circulating belong to aggregators. NO
      PRICES either: their own menu is not published anywhere, and the only
      source is the delivery storefront, which marks prices up — this project
      already measured a flat $3.00 added to every overlapping Paulo Sausage
      item. Those have to come from the owner.

      NO ICON: their logo file is a full illustrated scene with a plank wall and
      a lantern baked in, on an opaque JPEG. It cannot sit on any background but
      its own.
    */
    logoTemplate: 'badge',
    logoFace: 'slab',
    logoInitials: 'RC',
    site: 'https://therockincrawfish.com/',
    needsSite: true,
    siteCta: 'See their site',
    siteNote: 'Their seafood boils are priced on their ordering page; they also have a kitchen in Oakland',
    items: [],
    orderUrl: "https://order.online/store/the-rockin-crawfish-san-pablo-90161",
    menuNote: "A selection from their ordering page — the seafood boils are priced there",
    /* Their published menu, read from the featured items and drinks on their own order.online storefront for San Pablo on 2026-09-09; sections as they publish them. */
    sections: [
      { name: "Seafood Entrees", items: [
        ["Seafood Entrees", "Starting price shown for seafood entree plates; reads like a category label on the ordering page", 1210, null, "from"],
        ["Fried Crab Section w/ Garlic Noodles", "", 3200],
      ]},
      { name: "Entrees", items: [
        ["Garlic Noodle", "", 1760],
        ["Fish & Chips", "", 2530],
        ["Shrimp Basket with Fries", "", 2510],
        ["Chicken Wings", "", 1980],
        ["Calamari", "", 2200],
        ["Chicken Strips with Fries", "", 2430],
        ["Deep Fried Oysters", "", 2530],
        ["Rockin Wings", "", 1980],
      ]},
      { name: "Sides", items: [
        ["Sweet Potato Fries", "", 1210],
        ["Onion Rings", "", 1210],
        ["Fries", "", 990],
      ]},
      { name: "Drinks", items: [
        ["Lemonade", "", 600],
        ["Shirley Temple", "", 600],
        ["Mango Iced Tea", "", 500],
        ["Strawberry Lemonade", "", 500],
        ["Arnold Palmer", "", 600],
      ]},
    ],
  },
  {
    slug: 'east-bay-tinting',
    icon: 'east-bay-tinting',
    name: 'East Bay Tinting',
    label: 'East Bay Tint',
    cuisine: 'Window tinting',
    tagline: 'Automotive, home and commercial window tint, Oakley.',
    color: '#141414|#C0272D',
    prep: 0,
    /* Auto detailing is the nearest of the twenty-four; there is no window
       tinting or vinyl wrap entry, and they do homes and shopfronts as well as
       cars, so the label undersells them. */
    category: 'Auto detailing',
    address: 'Oakley, CA',
    /* A LINKTREE IS THEIR ONLY LINK, which is why he sent them. Their prices
       are quoted by DM — "DM for pricing" is their own line. */
    site: 'https://www.instagram.com/eastbaytinting/',
    siteCta: 'See their Instagram',
    needsSite: true,
    contactOnly:
      'Window tinting in Oakley — cars, homes and commercial glass, plus head and tail light tint and vinyl wrap. Open Monday to Saturday, 10am to 6pm. They quote by DM and publish no prices, so nothing is priced here.',
    items: [],
  },
  {
    slug: 'al-freshko',
    icon: 'al-freshko',
    name: 'Al Freshko',
    /* "There stage name under it will suffice" — his instruction, 2026-08-28. */
    label: 'Al Freshko',
    cuisine: 'Designer',
    tagline: 'Designer behind Elemonkey, San Francisco.',
    color: '#141414|#D8352A',
    prep: 0,
    category: 'Designer',
    site: 'https://www.elemonkey.com/',
    siteCta: 'See his work',
    /*
      HIS FACE IS THE TILE, because he asked for it: "Lets use there pics for
      there icon button". He has no personal mark — Elemonkey's red monkey is
      the brand's, and Elemonkey is already seated on its own.
    */
    contactOnly:
      'The designer behind Elemonkey, who goes by Al Freshko. Elemonkey has its own spot on the app; this is the person. BEASTY has not spoken to him: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'lloyd-de-vera',
    icon: 'lloyd-de-vera',
    name: 'Lloyd de Vera',
    label: 'Lloyd de Vera',
    cuisine: 'Owner and artrepreneur',
    tagline: 'Artrepreneur, and the owner of Quickly Benicia.',
    color: '#1A1A1A|#E4B23C',
    prep: 0,
    category: 'Artrepreneur',
    site: 'https://quicklybenicia.com/',
    siteCta: 'See Quickly Benicia',
    /* Quickly Benicia already has its own seat on the Benicia page; this is the
       person who owns it, on the sheet meant for people. His own words for
       himself are "artrepreneur" and "all pride, no apology". */
    contactOnly:
      'An artist and owner who calls himself an artrepreneur, behind Quickly Benicia on Southampton Road. The shop has its own spot on the app; this is the person. BEASTY has not spoken to him: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'dough-burger',
    icon: 'dough-burger',
    name: 'Dough Burger',
    label: 'Dough Burger',
    cuisine: 'Halal smash burgers',
    tagline: 'Halal smash burgers and shakes, open past midnight.',
    color: '#0B0B0B|#FF1616',
    prep: 0,
    category: 'Burgers',
    phone: '(408) 320-2573',
    address: '1751 N First St, San Jose, CA 95112',
    site: 'https://www.doughburger.com/',
    siteNote: 'Second shop at 1476 N Milpitas Blvd, Milpitas',
    /*
      TWO THINGS OFF THEIR PAGE ARE NOT REPEATED HERE. Their hero carries an
      unsourced "5.0 Rated Excellent" and a third-party review widget; neither
      belongs on somebody else's site. Their merch grid also lists a "Pendant"
      at $1,800 in stock while the $20 shirt is out — a real catalogue product,
      but not something to put beside a $5.99 burger without asking.
    */
    items: [],
    /* Their whole published menu, read from https://www.doughburger.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Fries", items: [
        ["Fries", "", 399, "doughburger-fries"],
        ["Saucy Fries", "", 499, "doughburger-saucy-fries"],
        ["Smash Fries", "", 599, "doughburger-smash-fries"],
      ] },
      { name: "Burgers", items: [
        ["Triple DoughBurger", "", 799, "doughburger-triple-doughburger", "from $7.99"],
      ] },
      { name: "Shakes", items: [
        ["Milk Shake", "Indulge in the creamy goodness of our refreshing milkshake! Perfectly blended to satisfy your sweet cravings", 699, "doughburger-milk-shake"],
      ] },
      { name: "Drinks", items: [
        ["Soda", "", 275, "doughburger-soda"],
      ] },
      { name: "Treats", items: [
        ["Dough Babbies", "", 499, "doughburger-dough-babbies"],
      ] },
    ],
  },
  {
    slug: 'asian-box',
    icon: 'asian-box',
    name: 'Asian Box',
    label: 'Asian Box',
    cuisine: 'Vietnamese-inspired',
    tagline: 'Build-your-own rice and noodle boxes, all gluten free.',
    color: '#1C3F4E|#F1B51C',
    prep: 0,
    /* San Francisco's Asian seat is House of Thai's, so this takes the second
       sheet rather than displacing them. */
    category: 'Asian',
    phone: '(415) 288-3688',
    address: '2031 Chestnut St, San Francisco, CA 94123',
    email: 'info@asianbox.com',
    /*
      THEY DO NOT NEED A WEBSITE — he sent a SpotOn ordering link, which is the
      Chestnut Street branch's ordering page sitting on top of a full real site.
      Same correction as Emporium and Fire Slice.

      AND THEY PUBLISH ALMOST NO PRICES: their whole menu is listed with
      descriptions and no figures, bar two salads. Ordering routes to SpotOn and
      order.online, and a marketplace price is not their price, so only the two
      they publish are here.
    */
    site: 'https://www.asianbox.com/',
    siteNote: 'Also at the Asian Art Museum and SFO Terminal G',
    menuNote: 'The only two they price',
    quoteOnly:
      'A Vietnamese-inspired counter on Chestnut Street where you build a box of rice, noodles or salad, from an entirely gluten-free kitchen. Open 10.30am to 9pm, to 8pm on Sunday. They publish their menu without prices, so only the two they do price are shown; their own site notes a service charge of up to 5% on all bills.',
    groups: [
      {
        name: 'What they price',
        items: [
          ["The Chef's Salad, chicken", 'Their published price', 1549],
          ["The Chef's Salad, steak", 'Their published price', 1679],
        ],
      },
    ],
    photos: [
      { src: '/food/asian-box-site-0-lg.webp', alt: "a plastic container filled with different types of food on a tray", credit: "Their own photo, from asianbox.com" },
      { src: '/food/asian-box-site-2-lg.webp', alt: "", credit: "Their own photo, from asianbox.com" },
      { src: '/food/asian-box-site-3-lg.webp', alt: "", credit: "Their own photo, from asianbox.com" },
      { src: '/food/asian-box-site-9-lg.webp', alt: "", credit: "Their own photo, from asianbox.com" },
      { src: '/food/asian-box-site-11-lg.webp', alt: "", credit: "Their own photo, from asianbox.com" },
    ],
    items: [],
  },
  {
    slug: 'sips-bottle-emporium',
    icon: 'sips-bottle-emporium',
    name: 'SIPS The Bottle Emporium',
    label: 'SIPS',
    cuisine: 'Bottle shop',
    tagline: 'Rare whiskey, additive-free tequila and wine, Benicia.',
    color: '#0A0A0A|#FFD814',
    prep: 0,
    /* No bottle shop, liquor, wine or bar entry exists among the twenty-four.
       His own note when he sent it: "I guess unique alcohol businesses can have
       a place on the page as well." They can; the category list has to catch up. */
    category: 'Bottle shop',
    phone: '(707) 334-5757',
    address: '736 1st St, Benicia, CA 94510',
    email: 'Info@sendsips.com',
    site: 'https://www.sipsca.com/',
    siteNote: 'Second shop at 1399 University Ave, Berkeley',
    menuNote: 'A few of theirs',
    /*
      "PLAY VIDEO ON PAGE PLZ" — 2026-08-28, and it cannot be honoured from
      what he sent. The link was an Instagram STORY,
      instagram.com/stories/sipsca/3973366113505000482, and stories expire after
      twenty-four hours: yt-dlp now answers "this content is unreachable", and
      no cookie fixes a story that no longer exists. If he still wants it on the
      page he needs to send the file itself, or a permanent post.
    */
    /* NO HOURS: their own page is headed "Locations & Hours" and lists none. */
    quoteOnly:
      'A bottle shop on First Street dealing in rare and allocated whiskey, additive-free tequila, wine and champagne, with craft beer and cigars — started in 2022, with a second shop in Berkeley. Over-21s only: age is checked at the till and an adult signature is required on delivery, they ship domestically but never to a PO box, and they will not ship where a buyer’s own state forbids it. These are their own published prices.',
    groups: [
      {
        name: 'Bourbon and rye',
        items: [
          ['Buffalo Trace', '750ml', 1999],
          ['Colonel E.H. Taylor Small Batch', '750ml', 6999],
          ["Blanton's Single Barrel", '750ml', 8999],
        ],
      },
      {
        name: 'Tequila',
        items: [
          ['Flecha Azul Blanco', '750ml', 2999],
          ['Arette Reposado, their barrel select', '750ml', 6499],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'bay-area-brew-boat',
    name: 'Bay Area Brew Boat',
    label: 'Brew Boat',
    cuisine: 'Cycleboat cruises',
    tagline: 'Pedal-powered BYOB cruises on the Oakland Estuary.',
    color: '#1E223E|#23AADD',
    prep: 0,
    /* No boat tour, cruise or party-boat entry exists. Event coordinator would
       misdescribe them — they run the vessel, they do not plan the party. */
    category: 'Cycleboat cruises',
    phone: '(510) 345-0456',
    /* 1070, not 1030. Their own Terms block says 1030 Marina Village Pkwy while
       every other page on the site says 1070. Worth telling them. */
    address: 'Marina Village Yacht Harbor, 1070 Marina Village Pkwy, Alameda, CA 94501',
    email: 'info@bayareabrewboat.com',
    site: 'https://bayareabrewboat.com/',
    /* NO ICON: the largest logo they publish is 150x150, which is smaller than
       the tile renders at. Ask them for the vector. */
    logoTemplate: 'badge',
    logoFace: 'grotesk',
    logoInitials: 'BB',
    menuNote: 'Their own published prices',
    quoteOnly:
      'A pedal-powered cycleboat running 90-minute BYOB cruises on the Oakland Estuary for up to sixteen, out of Marina Village in Alameda with a licensed captain, Wednesday to Sunday. Bring beer, wine, cider or canned cocktails — four drinks a head, no glass and no spirits. Public sailings are over-21 and need eight seats to go. These are their own published prices.',
    groups: [
      {
        name: 'Sailings',
        items: [
          ['A seat on a public tour', 'Plus booking fee', 6000],
          ['Private charter', 'Up to sixteen, from, plus booking fee', 59000],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'state-bird-provisions',
    icon: 'state-bird-provisions',
    name: 'State Bird Provisions',
    label: 'State Bird',
    cuisine: 'Contemporary Californian',
    tagline: 'Small plates from roving carts, on Fillmore.',
    color: '#4E926D|#B1A1CE',
    prep: 0,
    /* No American, Californian or general-restaurant entry among the
       twenty-four — the list is built from cuisines and this is not one of
       them. Second sheet rather than a wrong label. */
    category: 'Contemporary Californian',
    phone: '(415) 795-1272',
    address: '1529 Fillmore St, San Francisco, CA 94115',
    email: 'info@statebirdsf.com',
    /* THEY DO NOT NEED A WEBSITE either — he sent a link-in-bio and their real
       site is a full one. Their page also carries James Beard and Michelin
       marks; those are third-party trademarks and are not reproduced here. */
    site: 'https://www.statebirdsf.com',
    menuNote: 'From their sample menu',
    quoteOnly:
      'A Fillmore Street restaurant serving small provisions from roving carts alongside larger plates — it started as a way of serving quail. Open from 5.30pm, to 10pm and to 10.30pm at weekends. Their menus change and are published as samples; these are prices from theirs. Their menu notes 6.5% added to each check for San Francisco employer mandates.',
    groups: [
      {
        name: 'From the carts',
        items: [
          ['Hog Island oysters', 'Kohlrabi kraut and sesame', 500],
          ['Black sesame duck gyoza', 'Their price', 600],
          ['Smoked trout chip’n’dip', 'Their price', 1500],
        ],
      },
      {
        name: 'Larger',
        items: [
          ['CA state bird with provisions', 'Tart onions and parmesan, half or whole', 2400, '$24 / $48'],
          ['Hand cut noodles', 'Their price', 3200],
        ],
      },
    ],
    items: [],
  },
  {
    /*
      HIS INSTRUCTION, 2026-08-28: "Lets use there pics for there icon button."

      These four shipped with no icon and a generated mark, on my own reading
      that a photograph of a person is not an app icon. That reading was wrong
      twice over: he asked for the opposite in as many words, and the sheet
      already worked that way — Naya Green and Al Freshko have been photographs
      since it was created. Cropped from the screenshots he sent, inside the
      Instagram story ring rather than around it.
    */
    slug: 'nana-casas',
    icon: 'nana-casas',
    name: 'Nana Casas',
    label: 'Nana Casas',
    cuisine: 'Entrepreneur',
    tagline: 'Bay Area entrepreneur: Beyond Amazing Clothing Company and Vending Enterprise.',
    color: '#2A1B3D|#F2C94C',
    prep: 0,
    category: 'Entrepreneur',
    /*
      "BEASTY • Individuals" over a screenshot of her profile, 2026-09-03. Her
      bio, in her words: "Entrepreneur. A rose that grew from concrete. THE
      BAY. Beyond Amazing Clothing Company. Sticky Situationzz." Her link is
      Vending Enterprise, which has its own spot on the Online sheet. The mark
      is her profile picture, inside the story ring, from the screenshot.
    */
    instagram: '_beyondamazing',
    site: 'https://sites.google.com/vendingenterprise.net/vendingenterprise/home',
    siteCta: 'See Vending Enterprise',
    contactOnly:
      'A Bay Area entrepreneur, in her own words a rose that grew from concrete: Beyond Amazing Clothing Company and Vending Enterprise are hers. BEASTY has not spoken to her yet; this spot is hers to claim.',
    items: [],
  },
  {
    slug: 'larry-june',
    icon: 'larry-june',
    name: 'Larry June',
    label: 'Larry June',
    cuisine: 'Rapper',
    tagline: 'San Francisco rapper, and the name behind Midnight Organic.',
    color: '#0C3F23|#F69220',
    prep: 0,
    category: 'Rapper',
    /*
      larryjune.com IS A PARKED GODADDY SALE PAGE — it resolves, but it is a
      114-byte lander that redirects to a domain-for-sale screen. Linking it
      would send people to an advert. His working web presence is Midnight
      Organic, which has its own spot on the Online sheet.

      No icon: there is no first-party square photograph of him on anything he
      controls, and using a press shot found elsewhere is not ours to do.
    */
    logoTemplate: 'wordmark',
    logoFace: 'condensed',
    logoLines: ['LARRY', 'JUNE'],
    site: 'https://midnightorganic.com/',
    siteCta: 'See Midnight Organic',
    contactOnly:
      'A San Francisco rapper and songwriter. Midnight Organic is his brand and has its own spot on the app. BEASTY has not spoken to him: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'midnight-organic',
    icon: 'midnight-organic',
    name: 'Midnight Organic',
    label: 'Midnight Org',
    cuisine: 'Clothing and accessories',
    tagline: 'Larry June’s clothing and accessories line.',
    color: '#0C3F23|#F69220',
    prep: 0,
    category: 'Streetwear and apparel',
    site: 'https://midnightorganic.com/',
    menuNote: 'A few from their shop',
    /* "His brand", not "owned by him": their own page description ties the
       shop to Larry June, but no page states ownership outright. */
    quoteOnly:
      'Larry June’s clothing and accessories line — hoodies, tees, track wear, eyewear and small goods. These are their own published prices. BEASTY has not spoken to them: this spot is held, not taken.',
    groups: [
      {
        name: 'From their shop',
        items: [
          ['Bay Love Tee', 'Their published price', 3500],
          ['Bay Love Hoodie', 'Their published price', 9000],
          ['Signature 5-panel snapback', 'Their published price', 3000],
          ['Midnight Optics "The Unc" sunglasses', 'Their published price', 9000],
        ],
      },
    ],
    items: [],
  },
  {
    /*
      HIS INSTRUCTION, 2026-08-28: "Lets use there pics for there icon button."

      These four shipped with no icon and a generated mark, on my own reading
      that a photograph of a person is not an app icon. That reading was wrong
      twice over: he asked for the opposite in as many words, and the sheet
      already worked that way — Naya Green and Al Freshko have been photographs
      since it was created. Cropped from the screenshots he sent, inside the
      Instagram story ring rather than around it.
    */
    slug: 'nicky-diamonds',
    icon: 'nicky-diamonds',
    name: 'Nicky Diamonds',
    label: 'Nicky Diamonds',
    cuisine: 'Founder, Diamond Supply Co',
    tagline: 'Founder of Diamond Supply Co.',
    color: '#141414|#7BD3E8',
    prep: 0,
    category: 'Founder',
    logoTemplate: 'wordmark',
    logoFace: 'condensed',
    logoLines: ['NICKY', 'DIAMONDS'],
    site: 'https://www.diamondsupplyco.com/',
    siteCta: 'See Diamond Supply Co',
    contactOnly:
      'Nick Tershay, who founded the skate and streetwear brand Diamond Supply Co. BEASTY has not spoken to him: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'diamond-supply-co',
    name: 'Diamond Supply Co',
    label: 'Diamond Supply',
    cuisine: 'Skate and streetwear',
    tagline: 'Skate and streetwear, founded by Nicky Diamonds.',
    color: '#141414|#7BD3E8',
    prep: 0,
    category: 'Streetwear and apparel',
    /*
      THE DOMAIN HE SENT FIRST WAS A COUNTERFEIT. On 2026-08-03 the link was
      diamondssupplyco.com — double S, registered 2026-03-31 through Regery,
      calling itself the "Official Clothing Website" — against the real
      diamondsupplyco.com, registered in 2000. The fake sells "Diamod Ape" and
      "Diamon Eiffel Tower" hoodies and uses Puma, AC/DC, Modelo and Bape as
      variant names. It is not linked from anywhere in this app. He sent the
      real one on 08-28 and that is what is here.

      NOTHING IS PRICED AND THERE IS NO ICON, because their real store returns
      403 to everything — no catalogue, no logo file, no brand colours could be
      read. Filling that gap from a reseller or an aggregator is exactly how the
      counterfeit would have got in, so it stays empty until they publish or
      somebody asks them.
    */
    logoTemplate: 'wordmark',
    logoFace: 'condensed',
    logoLines: ['DIAMOND', 'SUPPLY CO'],
    site: 'https://www.diamondsupplyco.com/',
    siteCta: 'See their store',
    contactOnly:
      'The skate and streetwear brand Nicky Diamonds founded, which began in skateboard hardware. Their store does not serve its pages to anything but a browser, so nothing is priced here and no artwork of theirs is used. BEASTY has not spoken to them: this spot is held, not taken.',
    items: [],
  },
  {
    /*
      HIS INSTRUCTION, 2026-08-28: "Lets use there pics for there icon button."

      These four shipped with no icon and a generated mark, on my own reading
      that a photograph of a person is not an app icon. That reading was wrong
      twice over: he asked for the opposite in as many words, and the sheet
      already worked that way — Naya Green and Al Freshko have been photographs
      since it was created. Cropped from the screenshots he sent, inside the
      Instagram story ring rather than around it.
    */
    slug: 'show-banga',
    icon: 'show-banga',
    name: 'Show Banga',
    label: 'Show Banga',
    cuisine: 'Rapper',
    tagline: 'San Francisco rapper and producer.',
    color: '#141414|#D8B24A',
    prep: 0,
    category: 'Rapper',
    /* showbanga.com is not a site — it is a frameset that forwards to his
       Instagram. Linked as what it is: his Instagram. */
    logoTemplate: 'wordmark',
    logoFace: 'condensed',
    logoLines: ['SHOW', 'BANGA'],
    site: 'https://www.instagram.com/showy4mayor/',
    siteCta: 'See his Instagram',
    needsSite: true,
    contactOnly:
      'A San Francisco rapper, songwriter and producer. His own domain forwards to his Instagram rather than serving a site, so that is what this links to. BEASTY has not spoken to him: this spot is held, not taken.',
    items: [],
  },
  {
    /*
      HIS ASK, 2026-09-06: three videos of "the same Dance group from Richmond
      CA called 'Housing Authority'", "They def need a spot on BEASTY •
      Individuals", and "Yes plz" when offered. The crew has no page of its
      own; the name is verified from Jammer's own uploads ("Housin Authority
      Dance Crew from Richmond California"), and the three videos he sent are
      other people's uploads of the members, so the card links the one he
      called out rather than pretending to embed it. The icon is Jammer's own
      channel picture — "use there pics for there icon button".
    */
    slug: 'housing-authority',
    icon: 'housing-authority',
    name: 'Housing Authority',
    label: 'Housing Authority',
    cuisine: 'Dance crew',
    /* Not "Richmond, California": that exact phrase was the operator card's
       old city line, which he asked to have removed, and live-verify keeps it
       as a canary for the old build. */
    tagline: 'A dance crew out of Richmond, in the East Bay.',
    color: '#141414|#F2C400',
    prep: 0,
    category: 'Dance crew',
    logoTemplate: 'wordmark',
    logoFace: 'condensed',
    logoLines: ['HOUSING', 'AUTHORITY'],
    site: 'https://www.youtube.com/@JW-vd9jh',
    siteCta: 'See their videos',
    needsSite: true,
    clip: {
      href: 'https://youtube.com/shorts/smkmZZYE0qE',
      credit: 'Posted by Gold House',
      platform: 'YouTube',
    },
    contactOnly:
      'A dance crew out of Richmond. Glenn names Jammer, Flii Stylz and Rich + Tone Talauega as its members; the crew has no page of its own, so this links to Jammer, who posts under its name. BEASTY has not spoken to them: this spot is held, not taken.',
    items: [],
  },
  {
    slug: 'iamsu',
    icon: 'iamsu',
    name: 'IAMSU!',
    label: 'IAMSU!',
    cuisine: 'Rapper and producer',
    tagline: 'Bay Area rapper and producer, and IAMSUMMER.',
    color: '#0A0A0A|#EDEDED',
    prep: 0,
    category: 'Rapper and producer',
    /*
      LINKED TO THE STORE ROOT, NOT THE LINK HE SENT. His was
      /products/digital-product — Shopify's generic default handle, which gets
      reused, so whatever sits behind that URL will change without notice.
    */
    site: 'https://theeyesonmestore.com/',
    siteCta: 'See his store',
    menuNote: 'A few from his store',
    quoteOnly:
      'A Bay Area rapper and producer, part of HBK Gang, who runs the IAMSUMMER festival. His own store sells his records, the festival films and HBK goods. These are its own published prices. BEASTY has not spoken to him: this spot is held, not taken.',
    groups: [
      {
        name: 'From his store',
        items: [
          ['Young California 3', 'Digital album', 399],
          ['KILT 2', 'Digital album', 999],
          ['IAMSUMMER: Enjoy The Ride', 'Concert film', 999],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'beastmode',
    icon: 'beastmode',
    name: 'BEASTMODE',
    label: 'BEASTMODE',
    cuisine: 'Athlete and entrepreneur',
    tagline: 'Marshawn Lynch — Beast Mode. Always Town bidness.',
    color: '#0A0A0A|#BDA360',
    prep: 0,
    category: 'Athlete and entrepreneur',
    /*
      "BAY AREA ICON", his words, and the link he sent carried no name — it was
      link.me/beastmode. Established from that page's own outbound links: his
      YouTube, his X account and his family foundation, all published on it.
      Not guessed and not taken from a database.
    */
    site: 'https://www.beastmodeonline.com/',
    siteCta: 'See the store',
    menuNote: 'A few from the store',
    quoteOnly:
      'Marshawn Lynch — retired NFL running back, now an entrepreneur, actor and philanthropist, and the Beast Mode brand. His own bio leads with Cal and "Always Town Bidness". These are the store’s own published prices. BEASTY has not spoken to him: this spot is held, not taken.',
    groups: [
      {
        name: 'From the store',
        items: [
          ['Ombre Sweatpant', 'Their published price', 9500],
          ['Old English Zip Hoodie', 'Their published price', 12000],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'beat-drop-fitness',
    icon: 'beat-drop-fitness',
    name: 'Beat Drop Fitness',
    label: 'Beat Drop',
    cuisine: 'Fitness studio',
    tagline: 'EDM-scored classes on a club sound system, Van Ness.',
    color: '#141018|#63BC48',
    prep: 0,
    category: 'Gym',
    phone: '(415) 757-0471',
    address: '2001 Van Ness Ave, Suite 100, San Francisco, CA 94109',
    email: 'info@beatdropfitness.com',
    /* THE LINK HE SENT WAS /links, A LINK-IN-BIO PAGE. The real site is the
       root, with a schedule, six class pages, a team and a memberships page.
       Fifth time this month. */
    site: 'https://www.beatdropfitness.com/',
    menuNote: 'Their published rates',
    /* NO OPENING HOURS: they publish class windows, not shop hours — mornings
       6-8am and evenings 5-7pm, and that is what the sentence says. */
    quoteOnly:
      'A Pacific Heights studio running sculpt, Pilates, cycling, HIIT, dance cardio and yoga to EDM in rooms built by club sound designers, with resident DJs on some weekend sessions. Classes run mornings between 6 and 8 and evenings between 5 and 7. These are their own published rates; unlimited members are charged $15 for a late cancellation or a no-show.',
    groups: [
      {
        name: 'By the week',
        items: [
          ['One Movement', '1 credit per 7 days', 2500],
          ['Two Movements', 'per week', 3500],
          ['Three Movements', 'per week', 4500],
          ['Unlimited Movements', 'per week', 5000],
          ['Drop In', 'one class', 3000],
        ],
      },
      {
        name: 'Packs and the founding offer',
        items: [
          ['The Opener Pack', '5 movements, $28 a class, 3 months', 14000],
          ['The Headliner Pack', '10 movements, $26 a class, 6 months', 26000],
          ['Founding Member Special', 'Unlimited classes, per month', 9900],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'fours-media',
    icon: 'fours-media',
    name: 'Fours Media',
    label: 'Fours',
    cuisine: 'Creative agency',
    tagline: 'Brand work and paid media from one senior team.',
    color: '#F2EFE8|#111110',
    prep: 0,
    /* Photo and video is the honest half of what they do — they shoot as well
       as buy media — and there is no agency or marketing seat among the
       twenty-four. Opens Rohnert Park, the first city north of the bridge. */
    category: 'Photo and video',
    phone: '(707) 206-2504',
    address: '1500 Valley House Dr, Rohnert Park, CA 94928',
    email: 'services@foursmedia.com',
    site: 'https://foursmedia.com/',
    siteNote: 'Studio by appointment; Mon-Fri 9am-6pm PT',
    /*
      TWO PHONE NUMBERS AND TWO EMAILS ARE PUBLISHED AT ONCE. Their header
      carries (707) 634-8521 and hello@foursmedia.com; their footer and contact
      card carry (707) 206-2504 and services@foursmedia.com under the heading
      "Other ways to reach us". The pair presented as the way to reach them is
      the pair listed here. Worth Glenn asking which they want printed.

      NOT REPUBLISHED: their homepage badge reads "Voted Best in the Bay Area /
      Best Creative Agency 2026" and names no awarding body, while their own
      ideas page states the actual award — North Bay Bohemian's Best Digital
      Creative Services, April 2026. Also left out: "300+ clients", "10k+
      projects delivered" and "7.3x avg. ROAS", against an About page listing
      eight people. Ten thousand projects since 2018 is about three and a half
      a day, every day, and an unverifiable number is not worth reprinting.
    */
    quoteOnly:
      'A Bay Area creative and performance agency keeping brand work and paid media under one senior in-house team — strategy, identity, video and photo production, paid social and search, SEO, web build and analytics. They publish no rates; their own description of the model is that you pay for what you use.',
    items: [],
  },
  {
    slug: 'sinmex-auto-body',
    icon: 'sinmex-auto-body',
    /* Their own site spells it four ways — SINMEX Auto Body Inc, SINMEX Auto
       Body, Sin-Mex Auto Body and Sin-Mex Auto Body Shop — and the logo sets
       the first letter as a dollar sign, "$INMEX". The schema and page title
       agree on the version used here. */
    name: 'SINMEX Auto Body',
    label: 'SINMEX',
    cuisine: 'Auto body',
    tagline: 'Collision and paint on International, Oakland.',
    color: '#FFFFFF|#FDA43E',
    prep: 0,
    /* Collision repair is not Mechanics and smog and it is not Auto detailing.
       Yellow sheet rather than a widened category, the PJ's Junk Removal rule. */
    category: 'Auto body',
    address: '4028 International Blvd, Oakland, CA 94601',
    /*
      THE LINK HE SENT IS A DEAD DOMAIN. sinmexautobody.com is not registered at
      all — no NS, no SOA, and the registry returns no match. Their real site is
      sinmex.org, and every canonical, og:url and og:image on it still points at
      the unregistered name, so their own social previews are broken links.

      NO PHONE AND NO HOURS ARE PUBLISHED HERE, deliberately, because the site
      cannot be trusted on either. It carries a live call button on a reserved
      fictional number, tel:+15105550123 — 555-01xx exists so it can never
      connect. Its working number, (510) 561-0710, does not match the (510)
      434-1993 on the shop's own Yelp, BBB and Facebook listings; a call-tracking
      number is the likely explanation but nobody has asked them. Hours appear
      three different ways on one site (9-6 and 8-6 weekdays; 10-3 and 9-3
      Saturday), and the founding year four ways (1995, 1998, "over 20 years",
      "over 25 years"). Its nineteen reviews are all five stars, all
      "FirstName Initial.", and dated with hardcoded strings like "2 weeks ago"
      that will never age — placeholder copy, not reviews.

      The address is the one thing corroborated by Yelp, BBB and their own
      Facebook, so the address is what this page says. Glenn should confirm the
      number and the hours with the owner before either goes up.
    */
    site: 'https://sinmex.org/',
    quoteOnly:
      'A family-run Oakland collision shop on International Boulevard doing accident and frame repair, paint matching and refinishing, dent and bumper work, glass replacement and insurance claims, on foreign and domestic cars. Their own site publishes no prices and offers a free estimate; its phone number and hours contradict themselves and are left off this page until the shop confirms them.',
    items: [],
  },
  {
    slug: 'palace-games',
    icon: 'palace-games',
    name: 'Palace Games',
    label: 'Palace Games',
    cuisine: 'Escape rooms',
    tagline: 'Escape to play. Play to escape. Palace of Fine Arts.',
    color: '#1A1410|#FF0000',
    prep: 0,
    /* No escape room, arcade or attraction seat exists. Same yellow sheet as
       Emporium, for the same reason. */
    category: 'Escape rooms',
    phone: '(415) 997-8522',
    address: '3362 Palace Drive, San Francisco, CA 94123',
    site: 'https://palace-games.com/',
    menuNote: 'Their published prices',
    /* NO HOURS: their FAQ says only that available slots show when you click a
       booking button. */
    quoteOnly:
      'Four escape rooms in the Palace of Fine Arts running 80 to 120 minute private puzzle games for groups of four to eight, with a sixteen-person game room for events. Slots are shown at booking rather than as opening hours. These are their own published prices; the booking fee is non-refundable.',
    groups: [
      {
        name: 'What they charge',
        items: [
          ['Escape room reservation', 'Per room, taxes and fees included', 42500],
          ['Game Room, 90 minutes', 'Up to 16 guests', 19500],
          ['Booking fee', 'Per room, non-refundable', 2500],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'crayone',
    /*
      ONE WORD. He sent it as "Cray One"; the store header, the og:site_name and
      the vendor field on all sixty-three products spell it Crayone.

      NO ICON. The only mark they serve is a 1200x628 opaque black banner —
      a wide JPEG with no transparency, which is a header image, not a logo. The
      app draws its own mark rather than cropping theirs into a square.
    */
    name: 'Crayone',
    label: 'Crayone',
    cuisine: 'Streetwear',
    tagline: 'Graffiti-lettered jackets, boots and beanies, by Rigel Juratovac.',
    color: '#000000|#D0D0D0',
    prep: 0,
    category: 'Streetwear and apparel',
    phone: '510-502-6667',
    email: 'crayone@crayone.com',
    site: 'https://crayone.myshopify.com/',
    siteNote: 'Artist site at crayone.com',
    menuNote: 'A few of theirs',
    /*
      THREE THINGS ARE DELIBERATELY NOT REPUBLISHED.

      Sixteen of his product titles put a TM on marks he does not own — Giants,
      Warriors, 49ers, and SFFD. Only the products that assert nothing are
      listed here. The disclaimer he pastes onto them makes the point by
      itself: the MLB text naming the San Francisco Giants is pasted onto the
      Warriors and 49ers jackets too, disclaiming the wrong league.

      Twenty-six of the sixty-three products carry images generated in ChatGPT
      — the filenames say so, several stamped this week — so a buyer cannot
      tell a rendering from a photograph of a garment. Nothing here reproduces
      those images.

      He is the real artist, not a reseller: crayone.com was registered in 2002,
      the store's legal contact is his own name, and the work is his own
      lettering. Delivery is his own stated four to six weeks.
    */
    quoteOnly:
      'The direct-to-consumer store of Rigel Juratovac, a Bay Area graffiti writer working since the 1980s, selling puffer jackets, boots, beanies and jerseys printed with his own hand-style lettering. These are his own published prices; his shipping page allows four to six weeks for delivery.',
    groups: [
      {
        name: 'Outerwear and boots',
        items: [
          ['DownLow Jacket B-boy', 'Black, white and red accents', 27000],
          ['Graffiti Boots by Crayone', '001', 23000],
          ['Bay Connection Boots', 'White tag over black', 20172],
          ['Bay Connection Jacket', 'DownLow, black on black', 16500],
          ['4 Elements Camo Jacket', 'Collar raglan sleeve, white zipper', 15000],
        ],
      },
      {
        name: 'Smaller things',
        items: [
          ['Bay Connection Beanie', 'White tag over black', 2999],
          ['Custom NamePlate Jewelry', 'Made to order', 59900],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'transform-fx-fitness',
    icon: 'transform-fx-fitness',
    name: 'Transform FX Fitness',
    label: 'Transform FX',
    cuisine: 'Fitness studio',
    tagline: '45-minute coached classes, Adobe Street, Concord.',
    color: '#FAFAFA|#D34E2B',
    prep: 0,
    /* Concord's Gym seat is Urban Air's. Yellow sheet. */
    category: 'Gym',
    phone: '(925) 289-8042',
    address: '1865 Adobe St, Unit A, Concord, CA 94520',
    email: 'ale@tfxfitnessconcord.com',
    /* He sent only the Instagram. The site was found from the email domain in
       their own bio and confirmed by the address, phone and class length all
       matching. Their logo wordmark reads "FX - FITNESS TRANSFORMATION CENTER",
       a different word order from the name they trade under everywhere else. */
    site: 'https://tfxfitnessconcord.com/',
    siteNote: 'Mon-Fri 5am, 6am, 7am and 5pm, 6.30pm, 7.30pm; Sat 8am and 9am',
    menuNote: 'What they price',
    /*
      MEMBERSHIP PRICES ARE NOT PUBLISHED. The six-week challenge, the six-month
      and the one-year unlimited all carry a call to action and no figure, so
      none is invented here. The $67 is the one price on the site.

      NOT REPUBLISHED: their coupon page runs a countdown next to the fixed
      words "Only 3 COUPONS LEFT", which is page copy rather than a count of
      anything, and stacks unsourced "(Value: $197)" anchors against the price.
    */
    quoteOnly:
      'A Concord gym trading since 2009, running 45-minute coached strength and conditioning classes on a fixed timetable — weekday mornings at 5, 6 and 7, evenings at 5, 6.30 and 7.30, Saturdays at 8 and 9, and a meditation session every other Sunday. Only the challenge and the merchandise carry published prices; the memberships do not.',
    groups: [
      {
        name: 'What they price',
        items: [
          ['Transform Your Body in 30 Days', 'Their 30-day challenge', 6700],
          ["Women's Racerback Tank", 'Their shop', 2250],
          ["Transform Men's Tank", 'Their shop', 2200],
          ['Mesh Black Snap-back', 'Their shop', 1950],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'crossfit-sweat-shop',
    icon: 'crossfit-sweat-shop',
    /* Their own logo, page titles and footer read "Crossfit Sweat Shop" —
       lowercase f, two words. Their body copy and review widget read "CrossFit
       Sweat Shop". The one-word "Sweatshop" that he sent appears only inside
       member-written reviews, never in their own artwork. Their spelling. */
    name: 'Crossfit Sweat Shop',
    label: 'Sweat Shop',
    cuisine: 'CrossFit gym',
    tagline: 'Coached classes and HYROX, Autocenter Drive.',
    color: '#FFFFFF|#000000',
    prep: 0,
    /* Walnut Creek's Gym seat is TruFusion's. Yellow sheet. */
    category: 'Gym',
    phone: '(925) 818-1908',
    address: '1401 Autocenter Dr, Walnut Creek, CA 94597',
    email: 'info@crossfitsweatshop.com',
    site: 'https://crossfitsweatshop.com/',
    siteNote: 'Classes seven days, earliest 6am, latest 7.30pm',
    /*
      NO PRICES, AND THIS IS THE MOST DANGEROUS PAGE OF THE BATCH. Their
      /pricing/ page is unedited WordPress theme demo content: it is wrapped in
      live Lorem Ipsum, prices are written "19,90$" and "49,00$" in the European
      style, the features are Zumba and sauna access, and it counts "87 Studios
      around the world" and "298.000 active members" for a single gym in Walnut
      Creek. A scraper would have put a global chain's numbers on a local gym.
      Their schedule page separately shows "$ 90 Starting Price" attached to
      nothing, contradicting it. No real price exists on this site.

      Their reviews ARE real — an embedded Google widget, 5.0 from 103, with
      full names and dates — but they are Google's to show, not ours to reprint.
    */
    quoteOnly:
      'A Walnut Creek gym running coached CrossFit group classes seven days a week, from six in the morning to half past seven at night, and an official HYROX training club. They publish a class timetable rather than opening hours, and no membership price: the page that looks like one is their website theme’s demo content.',
    items: [],
  },
  {
    slug: 'plark-playspace',
    /* NO ICON: they have no website, so there is no logo file anywhere. Their
       Instagram avatar is a photograph on an expiring CDN URL, which is not a
       brand asset. The app draws its own mark. */
    name: 'Plark PlaySpace',
    label: 'Plark',
    cuisine: 'Play space',
    tagline: 'Kids play, parents work. Valley View, Richmond.',
    color: '#F5F3EF|#2B6CB0',
    prep: 0,
    /* A supervised play room with desks is not a Gym and not childcare; there
       is no seat for it. Same yellow sheet as Tot Spot Soft Play in SF. */
    category: 'Play space',
    address: '4805 Valley View, Richmond, CA 94803',
    menuNote: 'What they publish',
    /*
      THEY HAVE NO WEBSITE. The only link they publish is a Stripe checkout
      page, which is a payment form and is not listed here as a site. Nothing
      else resolves: plarkplayspace.com and nine other spellings are all
      unregistered.

      NOT LINKED: plarkinc.com is titled "Plark | Play + Work", which sounds
      exactly right, but its entire content is a West Contra Costa flag football
      league — no address, no mention of Valley View or Richmond, and no link in
      either direction. It may well be the same operator. Nobody has confirmed
      it, so it stays off the page.

      No phone and no hours are published anywhere, and there is not one
      third-party review of them in existence. Everything here is from their own
      Instagram.
    */
    quoteOnly:
      'A drop-in room on Valley View pairing a supervised childrens play area with desk space, so a parent can work while their child plays. Sold as a day pass, a monthly membership, or a private birthday booking. These two prices are the only ones they publish; they publish no phone number and no hours.',
    groups: [
      {
        name: 'What they publish',
        items: [
          ['Daily drop in', 'Their published price', 2000],
          ['Monthly', 'Their published price', 13999],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'audio-accessories-mobile',
    icon: 'audio-accessories-mobile',
    /* HIS LABEL WAS THE DOMAIN, NOT THE NAME. caraudiobayarea.com is an SEO
       domain; their own logo and footer read Audio Accessories Mobile. Sixth
       name correction this week. */
    name: 'Audio Accessories Mobile',
    label: 'Audio Acc.',
    cuisine: 'Mobile car audio',
    tagline: 'They come to you. Stereos, cameras, kill switches.',
    color: '#121212|#38D3E0',
    prep: 0,
    category: 'Car audio',
    phone: '(408) 324-6605',
    site: 'https://caraudiobayarea.com/',
    siteNote: 'Mon-Fri 9am-5pm, Sat 9am-4pm, closed Sunday',
    /*
      NO ADDRESS, because they publish none — they drive to the customer, and
      list San Francisco, San Jose, Oakland, Fremont, Sunnyvale, Milpitas,
      Gilroy, Tracy and Livermore as the area they cover. BEASTY rather than one
      city for the same reason, and the yellow sheet because BEASTY's twenty-four
      Services seats are full.

      NO PRICES: quote only, and their schema's "$$" is not a price. Their three
      testimonials are credited only "Michael R., San Francisco" and the like,
      with no platform or date, so none is reprinted.

      Their site returns 403 to an ordinary browser user-agent — a firewall rule,
      not an outage. Any crawler pointed at it will silently see nothing.
    */
    quoteOnly:
      'A mobile installer that drives to a home or office anywhere in the Bay Area to fit car stereos, speakers, amplifiers, dash and backup cameras and anti-theft kill switches. They publish no rates and quote each job.',
    items: [],
  },
  {
    slug: 'jackies-place',
    icon: 'jackies-place',
    name: "Jackie's Place",
    label: "Jackie's Place",
    cuisine: 'Soul food',
    tagline: 'Fried fish and chicken, two First Street rooms.',
    color: '#FAFAFA|#ED1C24',
    prep: 0,
    category: 'Soul food',
    phone: '(408) 490-4653',
    address: '840 N First St, San Jose, CA 95112',
    email: 'info@jackiesplacesj.com',
    site: 'https://www.jackiesplacesj.com/',
    siteNote: 'Second room, SoFA: 321 S First St, (408) 564-5144',
    /*
      NO PRICES, and there is nothing to be done about it: their whole menu page
      is PNG artwork — dish names and photographs, no numbers anywhere — and
      ordering hands off to Toast. Their own spelling on the section headings is
      "SHARABLES".
    */
    items: [],
    /* Their whole published menu, read from https://www.jackiesplacesj.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Shareables", items: [
        ["Cracklin' Chicken Bites", "Crispy, golden chicken bites tossed with crunchy cracklin’ skin pieces for extra flavor and texture, served with your choice of ranch, BBQ", 1000, "jackiesplace-cracklin-chicken-bites"],
        ["Corn Ribs", "Crispy, Cajun-glazed corn ribs, sprinkled with parmesan, served hot with your choice of ranch, BBQ, “Saucy Chick” honey mustard", 1000, "jackiesplace-corn-ribs"],
        ["Party Wings (6)", "A mix of drums and flats deep fried and hand tossed in your choice of any of our house-made sauces : JP's Original BBQ, Cajun Spice, Peach Habanero", 1200, "jackiesplace-party-wings-6"],
        ["Party Wings (12)", "A mix of drums and flats deep fried and hand tossed in your choice of any of our house-made sauces : JP's Original BBQ, Cajun Spice, Peach Habanero", 2000, "jackiesplace-party-wings-12"],
      ] },
      { name: "Sides", items: [
        ["French Fries", "Crispy Seasoned French Fries *Vegan", 650, "jackiesplace-french-fries"],
        ["Scoop's \"Not Yo\" Nachos", "Made with both tortilla chips AND fries! Then topped with cheese sauce, pico de gallo, green onions, JP's Original BBQ and \"Set It Off\" sauce", 1200, "jackiesplace-scoop-s-not-yo-nachos"],
        ["Chili Cheese Fries", "Crunchy seasoned French Fries, layered with our house-made cheese sauce and flavorful chili beans! Topped with green onions", 1000, "jackiesplace-chili-cheese-fries"],
        ["BBQ Chicken Thigh", "A highly flavorful, smoked, boneless, skinless chicken thigh.", 400, "jackiesplace-bbq-chicken-thigh"],
        ["Chicken Breast Patty (Fried)", "", 500, "jackiesplace-chicken-breast-patty-fried"],
        ["Cornbread Muffin", "1 Muffin", 200, "jackiesplace-cornbread-muffin"],
        ["Hamburger Bun", "", 150],
        ["Hot Links", "", 500, "jackiesplace-hot-links"],
        ["Hotdog Bun", "", 150, "jackiesplace-hotdog-bun"],
        ["Jumbo Fried Chicken Wings", "", 400, "jackiesplace-jumbo-fried-chicken-wings"],
        ["Rib Tips", "", 950, "jackiesplace-rib-tips"],
        ["Sliced White Bread (2 slices)", "", 200, "jackiesplace-sliced-white-bread-2-slices"],
        ["Smoked Beef Brisket", "", 900, "jackiesplace-smoked-beef-brisket"],
        ["Smoked Jackfruit (V)", "", 500],
        ["Smoked Pulled Pork", "", 500, "jackiesplace-smoked-pulled-pork"],
        ["Southern Fried Fish (Basa)", "Southern Deep Fried Catfish (Basa Catfish) Cornmeal batter", 400, "jackiesplace-southern-fried-fish-basa"],
        ["Steamed White Rice", "", 650, "jackiesplace-steamed-white-rice"],
        ["Uncle Greg's Ribs (Pork)", "", 500, "jackiesplace-uncle-greg-s-ribs-pork"],
      ] },
      { name: "Plates", items: [
        ["Fried Chicken Plate", "3 Piece Chicken Wings Our fried chicken, Battered and fried to perfection. Choose any two sides and your choice of cornbread or sliced bread", 2400, "jackiesplace-fried-chicken-plate"],
        ["Smoked Beef Brisket Plate", "1/2 Pound Beef Brisket. Our 16 hour smoked Beef Brisket. Choose any two sides and your choice of cornbread or sliced bread", 2700, "jackiesplace-smoked-beef-brisket-plate"],
        ["Hot Link Plate", "2 Piece Hot Link Plate Our smoked, grilled, beef links. Choose any two sides and your choice of cornbread or sliced bread", 2200, "jackiesplace-hot-link-plate"],
        ["Smoked Pulled Pork Plate", "1/2 pound of our smoked Pulled Pork. Choose any two sides and your choice of cornbread or sliced bread. Add an additional Meat to make it a combo!", 2200, "jackiesplace-smoked-pulled-pork-plate"],
        ["BBQ Chicken Plate", "2 Piece BBQ Chicken Plate Smoked, grilled, BBQ Chicken. Choose any two sides and your choice of cornbread or sliced bread", 2300, "jackiesplace-bbq-chicken-plate"],
        ["Vegetarian Smoked Pulled Jackfruit Plate", "1/2 Pound of our Vegetarian Smoked Jackfruit topped with crispy onion rings. Any two sides and your choice of cornbread or sliced bread.", 2200, "jackiesplace-vegetarian-smoked-pulled-jackfruit-plate"],
        ["Smoked Pulled Jackfruit Plate", "1/2 Pound of our Vegetarian Smoked Jackfruit topped with crispy onion rings. Any two sides and your choice of cornbread or sliced bread.", 2200, "jackiesplace-smoked-pulled-jackfruit-plate"],
        ["Mdw Brunch", "", 5500],
      ] },
      { name: "Kids", items: [
        ["Kid's Plate", "", 1200],
      ] },
      { name: "Sandwiches", items: [
        ["Brisket Sandwich", "Smoked Beef Brisket on a brioche bun - all the are toppings served on the side.", 1900, "jackiesplace-brisket-sandwich"],
        ["Drippin' Fried Chicken Sandwich", "Things can get a little messy this one but we promise that all the flavor will be worth it", 1800, "jackiesplace-drippin-fried-chicken-sandwich"],
        ["Everything is Bigger In Texas Sandwich", "At Jackie's Place, we are BIG on our names and we live up to them too! Try this sandwich stacked in Smoked Beef Brisket", 3000, "jackiesplace-everything-is-bigger-in-texas-sandwich"],
        ["Southern Fried Fish Sandwich", "Southern Fried Basa Catfish on a brioche bun - all the are toppings served on the side.", 1700, "jackiesplace-southern-fried-fish-sandwich"],
        ["(V) Pulled Jackfruit Sandwich", "Our smoked BBQ Jackfruit is a vegetarian alternative to pulled meat flavored with peppers and topped with crispy onion strings.", 1700, "jackiesplace-v-pulled-jackfruit-sandwich"],
        ["\"Hondo\" Hot Link", "Add Chili + Cheese Sauce to make it “Hondo, TX” style!", 1600, "jackiesplace-hondo-hot-link"],
        ["Smoked Pulled Pork Sandwich", "Smoked Pulled Pork on a brioche bun - all the are toppings served on the side.", 1700, "jackiesplace-smoked-pulled-pork-sandwich"],
        ["Smoked BBQ Chicken Sandwich", "Smoked BBQ Chicken, on a buttery brioche bun.", 1700, "jackiesplace-smoked-bbq-chicken-sandwich"],
        ["(V) Jackfruit Sandwich", "Our smoked BBQ Jackfruit is a vegetarian alternative to pulled meat flavored with peppers and topped with crispy onion strings.", 1700, "jackiesplace-v-jackfruit-sandwich"],
      ] },
      { name: "Chicken & Waffles", items: [
        ["Chicken & Waffles", "3 Jumbo fried chicken wings paired with a golden waffle. Upgrade your waffle with a special topping or try our cinnamon pecan brown sugar syrup that we call", 2100, "jackiesplace-chicken-waffles"],
        ["Waffle", "Belgian golden waffle as big as a whole plate! Add maple bacon", 1000, "jackiesplace-waffle"],
      ] },
      { name: "Soup & Bowls", items: [
        ["Bowl - Seafood Gumbo Soup", "Our Seafood Gumbo Soup is filled with Crab, Shrimp, Chicken, and Andouille Sausage, topped with green onions and served with rice + cornbread muffin.", 2500, "jackiesplace-bowl-seafood-gumbo-soup"],
        ["Smoked Jackfruit Bowl", "Our smoked BBQ Jackfruit is a vegetarian alternative to pulled meat flavored with peppers and topped with crispy onion strings, served with rice and cornbread.", 1600, "jackiesplace-smoked-jackfruit-bowl"],
        ["Cup -Seafood Gumbo Soup", "Our Seafood Gumbo Soup is filled with Crab, Shrimp, Chicken, and Andouille Sausage, topped with green onions and served with rice + cornbread muffin.", 1500, "jackiesplace-cup-seafood-gumbo-soup"],
        ["Soul Bowl", "Our In-house baked Mac + Cheese topped with pico de gallo, green onions", 1800, "jackiesplace-soul-bowl"],
        ["Beef Chili Bowl", "A rich, savory chili made with seasoned ground beef, smokey brisket and pinto beans. Topped with shredded cheese, a scoop of white rice", 1300, "jackiesplace-beef-chili-bowl"],
      ] },
      { name: "Smothered", items: [
        ["Smothered Chicken", "Fried chicken breast patty smothered in gravy served with STEAMED RICE + any two sides and a choice of complementary cornbread or sliced white bread", 2500, "jackiesplace-smothered-chicken"],
        ["Oxtails", "Smothered Oxtails, served with rice and a cornbread muffin.", 3500, "jackiesplace-oxtails"],
      ] },
      { name: "House Made Sauces", items: [
        ["NEW !!! \"Fire It Up\" Spicy BBQ Sauce", "", 800, "jackiesplace-new-fire-it-up-spicy-bbq-sauce"],
        ["\"Jack Sauce\" - Pecan Syrup", "Cinnamon Pecan Brown Sugar Syrup", 100, "jackiesplace-jack-sauce-pecan-syrup"],
        ["Chicken Gravy", "", 150, "jackiesplace-chicken-gravy"],
        ["Oxtail Gravy", "", 150, "jackiesplace-oxtail-gravy"],
        ["Lemon Pepper (Seasoned Butter)", "", 1000, "jackiesplace-lemon-pepper-seasoned-butter"],
        ["Cajun Hot (Seasoned Butter)", "", 1000, "jackiesplace-cajun-hot-seasoned-butter"],
        ["The JuJu", "A mix between Grape + Cherry Kool-Aid named after Jackie's sister JuJu! *NO REFILLS*", 450, "jackiesplace-the-juju"],
      ] },
      { name: "Drinks", items: [
        ["Grape Kool-Aid", "Classic Grape Kool-Aid *NO REFILLS*", 450, "jackiesplace-grape-kool-aid"],
        ["Cherry Kool-Aid", "Classic Cherry Kool-Aid *NO REFILLS*", 450, "jackiesplace-cherry-kool-aid"],
        ["TT's Sweet Tea", "Your Auntie's Classic Sweet Tea! *NO REFILLS*", 450, "jackiesplace-tt-s-sweet-tea"],
        ["Watermelon Lemonade", "Sweet Watermelon with a tangy citrus kick! *NO REFILLS*", 450, "jackiesplace-watermelon-lemonade"],
        ["Coke Zero", "", 350],
        ["Coca-Cola", "", 350, "jackiesplace-coca-cola"],
        ["Diet Coke", "", 350, "jackiesplace-diet-coke"],
        ["Lemonade", "", 350, "jackiesplace-lemonade"],
        ["Sprite", "", 350, "jackiesplace-sprite"],
        ["Orange Fanta", "", 350, "jackiesplace-orange-fanta"],
        ["Red Bull", "", 400, "jackiesplace-red-bull"],
        ["Hyphy Juice (Energy Drink)", "Grapple Flavor", 500, "jackiesplace-hyphy-juice-energy-drink"],
        ["Aquafina", "", 200, "jackiesplace-aquafina"],
        ["Saratoga can", "", 250, "jackiesplace-saratoga-can"],
        ["Orange Juice", "", 400, "jackiesplace-orange-juice"],
        ["Cranberry Juice", "", 400],
        ["Pineapple Juice", "", 400],
        ["Mocktail", "", 800],
        ["Shirley Temple", "", 350],
        ["Roy Rogers", "", 350],
        ["Coca-Cola Original Taste — the crisp, refreshing taste you know and love", "", 250],
        ["Diet Coke, Can", "Take a Diet Coke break with this refreshing, no-calorie soft drink", 250, "jackiesplace-diet-coke-can"],
        ["Coke Zero, Can", "", 250],
        ["Sunkist (CAN)", "", 250, "jackiesplace-sunkist-can"],
        ["Saratoga Sparkling Water", "", 350],
        ["Saratoga Still Water", "", 350, "jackiesplace-saratoga-still-water"],
        ["Premium", "", 1200, "jackiesplace-premium"],
        ["Dasani", "", 300],
      ] },
      { name: "Desserts", items: [
        ["Butter Pound Cake", "Our Butter Pound Cake is a classic MUST HAVE dessert that has been a part of our soulful kitchen for generations. We make it with a generous amount of butter", 800, "jackiesplace-butter-pound-cake"],
        ["KeyLime Pie", "Our Key Lime pie is the perfect treat for anyone with a sweet tooth! It has a light and fluffy whipped topping that will make your taste buds tingle", 1000, "jackiesplace-keylime-pie"],
        ["Lemon Poundcake", "A dense, moist, and buttery texture, with a vibrant lemon flavor from zest and juice, and a sweet lemon-sugary glaze", 900, "jackiesplace-lemon-poundcake"],
      ] },
    ],
  },
  {
    slug: 'citybachi',
    icon: 'citybachi',
    /* ONE WORD, capital C and B — their logo, their title, their og:site_name.
       He sent it as "City Bachi". And it is in PITTSBURG, not San Francisco:
       their own artwork gives 4080 Railroad Ave. He filed it under BEASTY, so
       BEASTY is where it sits, but Pittsburg has free Goods seats if he would
       rather it were local. */
    name: 'CityBachi',
    label: 'CityBachi',
    cuisine: 'Hibachi and sushi',
    tagline: 'Hibachi burritos and rolls, 5pm to 1am.',
    color: '#110003|#F51100',
    prep: 0,
    category: 'Hibachi',
    phone: '(925) 705-9420',
    address: '4080 Railroad Ave, Pittsburg, CA 94565',
    site: 'https://www.citybachi.com/',
    siteNote: 'Text your order; open Tuesday to Sunday 5pm-1am',
    menuNote: 'Their published prices',
    /*
      NOT REPUBLISHED: "BEST HIBACHI & SUSHI IN THE BAY AREA" and "FAMOUS
      HIBACHI GRILL" — superlatives with no rating, publication or award behind
      them anywhere on the site.

      A LANDMINE FOR ANY SCRAPER: their page source still carries the Square
      Online template's stock banner text, "Our restaurant has been serving the
      Fresno community since 1968 with our delicious Middle Eastern cuisine".
      It is flagged hidden so a visitor never sees it, but it is sitting in the
      page state waiting to be read as their description. It is not.
    */
    quoteOnly:
      'A hibachi and sushi kitchen on Railroad Avenue in Pittsburg selling grilled protein combos, hibachi burritos, noodle plates and rolls for late-night pickup, with a hibachi catering truck and party trays. Orders go in by text. These are their own published prices; catering is quoted on proteins, servers and headcount.',
    groups: [
      {
        name: 'Hibachi',
        items: [
          ['Hibachi Burrito, chicken', 'Their published price', 1700],
          ['Hibachi Burrito, NY steak', 'Their published price', 2000],
          ['1 Item Combo, lobster', 'Their published price', 2600],
          ['VIP 4 Item Combo', 'Each', 4500],
        ],
      },
      {
        name: 'Sushi',
        items: [
          ['Sushi Box', '4 rolls, plus tax, limited-time', 6000],
          ['Mar y Tierra Roll', 'Their published price', 2000],
          ['CityBachi Roll', 'Their published price', 1600],
          ['Hot Cheeto Bombz', '3 pieces', 1400],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'sugarmurals',
    icon: 'sugarmurals',
    /* ONE WORD, ALL CAPS — that is the wordmark, the schema name and the
       og:site_name. The icon is their own square SM favicon rather than a crop
       of the wordmark, which is what "enlarge logo as much as possible in tile"
       actually wants: a mark that was drawn to be square, filling the tile. */
    name: 'SUGARMURALS',
    label: 'SUGARMURALS',
    cuisine: 'Mural studio',
    tagline: 'Hand-painted murals, inside and out.',
    color: '#000000|#FFFFFF',
    prep: 0,
    /* No mural, sign-painting or art seat among the twenty-four. */
    category: 'Murals',
    email: 'Hello@SugarMurals.com',
    site: 'https://www.sugarmurals.com/',
    /*
      NO PRICES AT ALL — not a rate card, not a square-foot figure, not a
      minimum. NO PHONE: they publish none; the contact form and the email are
      the only ways in.

      NOT REPEATED: their footer sets a registered-trademark mark after the
      name. Nobody has checked a registration, so this page does not carry it.
    */
    quoteOnly:
      'A San Francisco studio hand-painting custom murals inside and out — restaurants, offices, shops, schools and homes across Northern California. They publish no prices and no phone number; projects start with an email or their contact form.',
    items: [],
  },
  {
    slug: 'richie-rich',
    icon: 'richie-rich',
    name: 'Richie Rich',
    label: 'Richie Rich',
    cuisine: 'Rapper',
    tagline: 'Oakland, since the early nineties.',
    color: '#0A0A0A|#C4A289',
    prep: 0,
    category: 'Individuals',
    /*
      HIS STORE IS dubbleworldwide.com, WHICH IS NOT THE ONE ON HIS LINKTREE.
      The Linktree's "See Full Shop" button opens Linktree's own affiliate wall
      — Babbel, Fabletics, Hulu, HelloFresh and about thirty more — with not one
      Richie Rich product on it, and Linktree's auto-written blurb tells visitors
      to "explore the products within their Shop page for merchandise", which is
      untrue. His real store's footer carries the same Instagram and Twitter
      handles as his verified profile, so the store below is his.

      His Linktree also has a live button to rollingbeancoffee.com, which is not
      a registered domain. Not linked here.
    */
    site: 'https://dubbleworldwide.com/',
    menuNote: 'From his own store',
    /*
      HIS RATES ARE DELIBERATELY UNPRICED. Booking and features both run through
      his own forms, both labelled "offer based", and the last field on each is
      a budget or an offer. He names no fee anywhere, so neither does this.
    */
    quoteOnly:
      'An Oakland rapper working since the early nineties, whose album Richard came out in 2025 and who still records with Bay Area peers. Nothing here is claimed on his behalf: booking and features go through his own forms and he prices neither, calling both offer-based. These are the prices from his own store.',
    groups: [
      {
        name: 'From his own store',
        items: [
          ['Hoodie', 'Five designs, his own store', 7500],
          ["Let's Ride Tee", 'His own store', 4000],
          ['T-shirt', 'Five designs, his own store', 3500],
          ['Richard, autographed CD', 'Limited edition', 3500],
        ],
      },
    ],
    items: [],
  },
  {
    /*
      HIS INSTRUCTION, 2026-08-28: "Lets use there pics for there icon button."

      These four shipped with no icon and a generated mark, on my own reading
      that a photograph of a person is not an app icon. That reading was wrong
      twice over: he asked for the opposite in as many words, and the sheet
      already worked that way — Naya Green and Al Freshko have been photographs
      since it was created. Cropped from the screenshots he sent, inside the
      Instagram story ring rather than around it.
    */
    slug: 'mbnel',
    icon: 'mbnel',
    /*
      NO ICON. He publishes no wordmark and no logo — his avatar and banner are
      photographs of him, and a photograph of a person is not an app icon. The
      interlocking MB monogram belongs to Marque Brand, his clothing line, and
      putting a clothing brand's mark on a page about the person would be
      attributing one to the other. The app draws its own mark.

      AND HE IS FROM STOCKTON, not the Bay Area — every primary source says so,
      including his own streaming bios. He sits on BEASTY - Individuals, which
      belongs to nowhere in particular, rather than in a city that is not his.
    */
    name: 'MBNel',
    label: 'MBNel',
    cuisine: 'Rapper',
    tagline: 'Stockton. Forever II, 2026.',
    color: '#101010|#627E9A',
    prep: 0,
    category: 'Individuals',
    /*
      THE MERCH LINK ON HIS OWN CHANNEL IS DEAD. mbnel.com is registered but its
      nameservers refuse every query, so it resolves nowhere. The store moved to
      marquebrand.us, which is provably the same shop — Shopify still reports its
      internal handle as mbnel-com.myshopify.com — so that is the link here.

      NOT LINKED: a listing calling itself the "Official store of the MBNEL-
      T Shirt" on a domain that does not resolve and has no whois record, which
      has cloned his label's real product title. It is linked from nothing he
      owns.
    */
    site: 'https://www.marquebrand.us/',
    siteNote: 'Label store at store.empi.re',
    menuNote: 'From his label store',
    quoteOnly:
      'A rapper from Stockton signed through Muddy Boyz and EMPIRE, whose most recent album Forever II came out in 2026. Nothing is claimed on his behalf. These prices are from his label store; his own clothing line prices its pieces separately.',
    groups: [
      {
        name: 'From his label store',
        items: [
          ['I Am A Child Of The Trenches Tee', 'Black or white, with download', 3000],
          ['Matte Black Water Bottle', 'With download', 1500],
          ['Blue and Black Wristband', 'With download', 1200],
        ],
      },
    ],
    items: [],
  },
  {
    /*
      NOT SEATED, AND THE REASON HAS A DATE ON IT: A MODAL ON THEIR OWN
      HOMEPAGE READS "We are closing on August 31st!"

      He sent this on 2026-08-25 as "Oakland - Goods" and it was missed; the gap
      check found it three days later, by which point their own site was
      announcing the closure four days out. Putting it on the grid would mean a
      customer tapping an open restaurant this week and a closed one next week,
      and no business that is closing is going to buy a spot. So the research is
      here in full and the seat is not: adding it is one line in placements.ts
      if Glenn knows something the modal does not.

      Their own markup spells it "Home  of Chicken & Waffles" with a doubled
      space, eleven times, including the page title and the logo alt text. The
      badge itself spells the word AND.
    */
    slug: 'home-of-chicken-and-waffles',
    /*
      THEIR MARK, ON THEIR DARK RATHER THAN THEIR BROWN. The logo they serve is
      only 217x189, so it went through tools/upscale.py first — premultiplied,
      EDSR x4, then down to the tile, which is what that tool is for. Gold on
      their brown lost the ring lettering entirely at icon size; #303030 is the
      other colour in their own palette and it holds every word.

      It has an icon because it has a card on the News page. It still has no
      seat: a tile for a room that shuts on Sunday would be wrong by Monday.
    */
    icon: 'home-of-chicken-and-waffles',
    name: 'Home of Chicken and Waffles',
    label: 'Chicken & Waffles',
    cuisine: 'Soul food',
    tagline: 'Fourth Street, Oakland. Closing 31 August 2026.',
    color: '#9F5E40|#FADE96',
    prep: 0,
    category: 'Soul food',
    phone: '(510) 836-4446',
    address: '247 4th St, Oakland, CA 94607',
    email: 'derreckhcw@gmail.com',
    site: 'https://homeofchickenandwaffles.com/',
    siteNote: 'Closing 31 August 2026, per their own homepage',
    items: [],
    /* Their whole published menu, read from https://homeofchickenandwaffles.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Appetizers", items: [
        ["Aladrienne's Nachos", "Choice of black-eyed peas or red beans, home-fried tortilla chips, cheese, sour cream, jalapenos, and salsa. Add chicken +$3.00.", 1499],
        ["Ernestine's Wings", "8 baked chicken drummettes with choice of homestyle buffalo, BBQ, or garlic sauce.", 1299],
        ["Travis' Chicken Drummettes", "8 fried chicken drummettes with house seasoning. Add smothered in gravy +$2.00.", 1299],
        ["Conner's Buttermilk Chicken Strips", "Battered and fried, boneless and skinless 6 breast strips with house seasoning. Choice of ranch, BBQ, smothered, or buffalo sauce +$1.00.", 1299],
        ["Charisses' Garlic Fries", "House French fries with homemade garlic sauce.", 1175],
        ["Tayler's Sweet Potato Fries", "Fried with house seasoning salt and served with BBQ sauce.", 1099],
        ["Ashley's French Fries", "With house seasoning salt.", 925],
      ] },
      { name: "Salads", items: [
        ["Pretty Patricia's Salad", "Battered, fried, or grilled boneless, skinless chicken breast strips, lettuce, tomatoes, cucumber, carrots, boiled egg, bell pepper, and cheese.", 1995],
        ["Sophia's Chicken Salad", "Chicken salad, lettuce, tomatoes, cucumber, carrots, boiled egg, red onion, bell pepper, and cheese.", 1795],
        ["Lovely Leila's Chef Salad", "Fried or grilled chicken breast, lettuce, tomatoes, cucumber, carrots, boiled egg, bell pepper, and cheese.", 1995],
        ["Brandon's Dinner Salad", "Lettuce, tomatoes, cucumber, carrots, red onion, and bell peppers. Add cheese +$0.50.", 850],
      ] },
      { name: "Chicken & Waffles", items: [
        ["Angie's Delight", "1 succulent breast, 1 delicious waffle, and grits.", 1925],
        ["Incredible Kelly", "1 leg or thigh, 1 delicious waffle, and grits.", 1775],
        ["Jade's Joy", "2 delicious waffles and 2 turkey sausage patties (no substitutions).", 1650],
        ["Amina's Appetite", "Delicious buckwheat waffle and 2 turkey sausage patties (no substitutions).", 1375],
        ["Tracy's Mouthwatering Strawberry Waffles", "2 delicious waffles topped with strawberry topping and whipped cream, and 2 turkey sausage patties (no substitutions).", 1695, "homeofchickenandwaffles-tracy-s-mouthwatering-strawberry-waffles"],
        ["Paige's Palette", "2 Southern-fried chicken wings, 1 egg, and 1 delicious waffle.", 1925],
        ["Renaldi's Request", "2 pieces of chicken Southern style or smothered in gravy and onions (+$2.00) and 2 delicious waffles. Add 2 breasts +$2.50.", 2125],
        ["Lord BJ", "4 pieces of chicken Southern style or smothered in gravy and onions (+$2.00) and 2 delicious waffles. Add 2 breasts +$2.50.", 2450, "homeofchickenandwaffles-lord-bj"],
        ["Keith's Tackle", "2 chicken wings, 1 delicious waffle, and macaroni and cheese.", 2075],
        ["Homeboy", "3 wings and waffle or French fries (no substitutions).", 1975],
        ["Dale's Choice", "8 chicken strips and waffle or French fries. Ranch, buffalo, or BBQ sauce (no substitutions).", 2050],
      ] },
      { name: "Eggs & Such", items: [
        ["Chace's Combo", "Egg white vegetable omelet with tomato, onions, bell pepper, and cheese. Buckwheat waffle or sweet potato fries. Add 2 turkey sausage patties +$3.00.", 1850],
        ["Justin's Omelet", "Cheese, chicken, and onion omelet. French fries or 1 delicious waffle (no substitutions).", 1795],
        ["Laura's Luscious Breakfast", "2 turkey sausage patties, 2 eggs, grits, and hot fluffy biscuit.", 1495],
        ["Jacqueline's Breakfast", "2 turkey sausage patties, 2 eggs, and 1 delicious waffle.", 1625],
        ["Susan's Special", "2 scrambled eggs mixed with cheese and onions, potatoes and gravy, and hot fluffy biscuit.", 1350],
        ["Kim's Creation", "1 chicken breast, 1 leg or 1 wing, 2 eggs, grits, and hot fluffy biscuit.", 1795],
        ["Elouise's Masterpiece", "2 sausage patties, toast, and 1 egg. Coffee, orange juice, or hot tea.", 1350],
      ] },
      { name: "Sandwiches", items: [
        ["Teri's Chicken Salad Sliders", "Chicken salad with lettuce, tomato, and red onions on slider buns.", 1395],
        ["Michele's Fried Chicken Sandwich", "Boneless and skinless fried breast with special house coleslaw and pickles on a brioche bun.", 1695, "homeofchickenandwaffles-michele-s-fried-chicken-sandwich"],
        ["Uncle Johnny's Juicy Chicken Sandwich", "Boneless and skinless grilled chicken breast with lettuce, tomatoes, and red onions on a brioche bun.", 1795],
        ["Stevie's Catfish Sandwich", "Boneless fried catfish fillet with lettuce, tomato, and red onions on a brioche bun.", 1995, "homeofchickenandwaffles-stevie-s-catfish-sandwich"],
      ] },
      { name: "Fried Fish", items: [
        ["Naima's Catfish", "2 large fried catfish fillets with choice of French fries, potato salad, green salad, or coleslaw (no substitutions).", 2295, "homeofchickenandwaffles-naima-s-catfish"],
        ["Sabrina's Catfish Plate", "2 large catfish fillets fried or smothered in gravy and onions (+$2.00), grits, and hot fluffy biscuit.", 2295, "homeofchickenandwaffles-sabrina-s-catfish-plate"],
      ] },
      { name: "Creative Combinations", items: [
        ["Brother Darrol", "2 pieces of chicken Southern style or smothered in gravy and onions (+$2.00), grits, and hot fluffy biscuit. Add 2 breasts +$2.50.", 1975],
        ["Prince Brendon", "4 pieces of chicken Southern style or smothered in gravy and onions (+$2.00), grits, and hot fluffy biscuit. Add 2 breasts +$2.50.", 2150],
        ["Homegirl", "4 pieces of chicken Southern style or smothered in gravy and onions (+$2.00) and cornbread. Choice of any 2 sides +$7.50.", 2025],
        ["Princess Jordan", "1 breast or 2 wings, macaroni and cheese, greens, and cornbread.", 2025],
        ["Gordon's Bank", "1 breast or 2 wings, macaroni and cheese, yams, and cornbread.", 2025],
        ["Lil John's Special", "3 wings and cornbread. Choice of greens, smothered potatoes, or macaroni and cheese.", 1995],
        ["Skye's Buttermilk Chicken Strips", "Homemade, cooked to order, 8 boneless and skinless chicken breast strips. Choice of macaroni and cheese, green salad, or potato salad.", 2095],
        ["Darrols Homerun", "2 breasts, greens and cornbread. Choice of macaroni and cheese or red beans and rice.", 2325],
        ["Uncle Doe's Sampler", "Choice of any 3 sides: greens, macaroni and cheese, grits, yams, red beans and rice, smothered potatoes, black-eyed peas, green salad, rice and gravy", 1975],
      ] },
      { name: "Mecca's Kids Meal", items: [
        ["Kaisun's Transformer", "1 chicken leg with mac and cheese.", 1095],
        ["Omaurie's Ranger", "1 turkey sausage patty and grits.", 1095],
        ["Amiya's Doll", "1 chicken wing with 1 delicious waffle.", 1095],
        ["Josiah's Starfish", "3 fried chicken strips with French fries.", 1095],
      ] },
      { name: "Desserts", items: [
        ["Caramel Cake", "", 1050],
        ["Chocolate Cake", "", 1050],
        ["Red Velvet Cake", "", 1050],
        ["Sock It To Me Cake", "", 1050],
        ["Pineapple Coconut Cake", "", 1050],
        ["German Chocolate Cake", "", 1050],
        ["Mello Yellow Cake", "", 1050],
        ["Sweet Potato Cake", "", 1050],
        ["Pecan Pie", "", 875],
        ["Sweet Potato Pie", "", 875],
        ["Peach Cobbler", "", 875],
        ["Chocolate Chip Waffle", "", 925],
      ] },
      { name: "Sides", items: [
        ["Macaroni & Cheese", "", 795],
        ["Candied Yams", "", 795],
        ["Greens", "", 795, "homeofchickenandwaffles-greens"],
        ["Home Fries", "", 795],
        ["Smothered Potatoes", "", 795],
        ["Grits", "", 795, "homeofchickenandwaffles-grits"],
        ["Potato Salad", "", 795, "homeofchickenandwaffles-potato-salad"],
        ["Red Beans & Rice", "", 795],
        ["Black Eye Peas & Rice", "", 795],
        ["Rice & Gravy", "", 795],
        ["Coleslaw", "", 795, "homeofchickenandwaffles-coleslaw"],
        ["Gravy", "", 400, "homeofchickenandwaffles-gravy"],
      ] },
      { name: "Daily Lunch Specials", items: [
        ["Derreck's Deal", "1 thigh or 1 leg, candied yams, greens, and cornbread.", 1350],
        ["Mimi's Potluck", "1 thigh or 1 leg, macaroni and cheese, greens, and cornbread.", 1350],
        ["Stacy's Southern Special", "1 thigh or 1 leg, mixed greens, potato salad, and cornbread.", 1350],
        ["Big Daddy", "1 thigh or 1 leg, black-eyed peas, rice, green salad, and cornbread.", 1350],
        ["Colonel Marshal", "1 thigh or 1 leg, red beans, green salad, and cornbread.", 1350],
        ["Jessie's Party", "6 buffalo wings or fried drummettes and French fries or delicious waffle.", 1350],
      ] },
    ],
  },
  {
    slug: 'pacific-pet-grooming',
    icon: 'pacific-pet-grooming',
    name: 'Pacific Pet Grooming',
    label: 'Pacific Pet',
    cuisine: 'Mobile pet grooming',
    tagline: 'Two salon buses, five towns, a timetable.',
    color: '#0A0A0A|#FFC509',
    prep: 0,
    category: 'Pet grooming and walking',
    phone: '(415) 424-0600',
    email: 'pacificpetgrooming@gmail.com',
    site: 'https://pacificpetgroomingca.com/',
    siteNote:
      'Bus 1: Pacifica Mon/Wed/Fri, Daly City Tue/Thu. Bus 2: South SF Mon/Wed/Sat, SF Tue/Thu, San Bruno Fri',
    menuNote: 'Their published prices',
    /*
      HE FILED IT "MOBILE" AND IT IS NOT QUITE THAT. They are not a
      come-to-you groomer and they are not a shop: two salon buses park at
      fixed public spots on a weekly rotation and the customer brings the dog
      to the bus. Their own words are "Find Our Salon Bus Near You" and "view
      daily parked locations and book your slot". Calling it mobile grooming
      would have someone waiting at home for a van.

      NO ADDRESS, because there is no premises — the five parking spots are in
      siteNote instead, each of which their own site phrases as "Near". NO
      HOURS: they publish days of the week per location and no times at all.

      NOT REPUBLISHED: "Top Rated Groomers", twice, with no rating, platform or
      number anywhere behind it.
    */
    quoteOnly:
      'Two dog-grooming salon buses working a weekly rotation through Pacifica, Daly City, South San Francisco, San Francisco and San Bruno, taking booked appointments on board at fixed public parking spots. These are their own published prices, which run by dog size; the small figure is a dog up to twelve inches and the large is over twenty-one.',
    groups: [
      {
        name: 'Full grooming',
        items: [
          ['Dog Full Grooming, small', 'Up to 12 inches', 10200],
          ['Dog Full Grooming, x-large', '21 inches and over', 19000],
        ],
      },
      {
        name: 'Baths and the rest',
        items: [
          ['Dog Bath Package, small', 'Up to 12 inches', 6500],
          ['Dog Bath Package, x-large', '21 inches and over', 12500],
          ['Dog Bath, basic, small', 'Up to 12 inches', 5500],
          ['Anal Gland Expression', 'Large to x-large', 4000],
          ['Dog Nails Trim, small', 'Up to 12 inches', 2000],
          ['Flea Shampoo', 'Preventive', 1300],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'mcar',
    icon: 'mcar',
    /* HIS LABEL WAS THE DOMAIN AGAIN — the seventh this week. mcarppf.com
       belongs to "Mcar"; their logo shield reads MCAR and their own written
       form is "Mcar - PPF and Window Tinting", where the second half is a
       description of the trade and not part of the name. */
    name: 'Mcar',
    label: 'Mcar',
    cuisine: 'PPF and window tint',
    tagline: 'Paint protection, tint, ceramic and wraps.',
    color: '#FAFAFA|#0000FF',
    prep: 0,
    /* No paint-protection or window-tint seat exists among the twenty-four.
       Auto detailing is the nearest honest one, and it opens San Bruno. */
    category: 'Auto detailing',
    phone: '(415) 528-8182',
    address: '301 San Bruno Ave E, San Bruno, CA 94066',
    email: 'contact@mcarppf.com',
    site: 'https://mcarppf.com/',
    siteNote: 'Also Burlingame, Belmont and 42 12th St, San Francisco',
    /*
      HE SENT ONE LOCATION AND THEY HAVE FOUR — San Bruno, Burlingame, Belmont
      and San Francisco, all four in the footer of every page. Two of them are
      cities that opened today.

      THEIR CONTACT PAGE CONTRADICTS ITS OWN FOOTER: the body of it lists three
      shops, "Shop 1 / Shop 2 / Shop 3", while the footer directly beneath adds
      the fourth. Their Burlingame number is a 408 in a 650 city. Neither is
      published here beyond the San Bruno address and number, which is the pair
      their site is consistent about.

      NO HOURS, although they nearly publish some: "Opening Hours: 8:30 AM to
      6PM" appears seven times and never once says which days. NO PRICES at all.

      Their own service list carries four typos — "PPF Instalation", "Vinil
      Wraps", "Custom T-Shits", "Carwrap Desing" — and the site is built in
      Brazilian Portuguese underneath, so its date picker reads Seg/Ter/Qua and
      a map label says "Estados Unidos". Not reproduced; worth their knowing.
    */
    quoteOnly:
      'An automotive appearance shop doing paint protection film, window tint, ceramic coating and vehicle wraps, with a side line in custom shirt and sign printing, across four Peninsula and San Francisco locations. They publish no prices and quote each car.',
    items: [],
  },
  {
    slug: 'underdogs-cantina',
    icon: 'underdogs-cantina',
    name: 'Underdogs Cantina',
    label: 'Underdogs',
    cuisine: 'Taqueria and sports bar',
    tagline: 'Three floors across from Oracle Park.',
    color: '#FCFAF6|#EC8923',
    prep: 0,
    category: 'Mexican food',
    phone: '(415) 416-6873',
    address: '128 King St, San Francisco, CA 94107',
    email: 'catering-orders@underdogscantina.com',
    site: 'https://underdogscantina.com/',
    siteNote: 'Mon and Sun 11am-9pm, Tue-Sat 11am-10pm; 10am on Giants day games',
    /*
      SINGLE LOCATION, CHECKED. There are other Underdogs rooms in San
      Francisco; this site claims none of them. Every mention of the name on
      this domain is 128 King Street, there is no location switcher and no link
      to a sibling, so nothing here is merged with anything else.

      THEIR MENU HAS NO PRICES ON IT — about sixty dishes with descriptions and
      dietary tags and not one number. The only two figures on the whole site
      are the weekly specials below.

      THE HAPPY HOUR CARRIES AN EXCEPTION their Instagram bio drops: it is
      Monday to Friday 4.30 to 6, EXCEPT on Giants home games, when a separate
      game-day happy hour runs from first pitch to the seventh-inning stretch.
      Printing the bio version would have someone turn up on a game day for a
      price that is not running.

      A 4.5% charge is added to cover San Francisco employment costs, in their
      own words, and it is here because a bill is not what a menu says it is.
    */
    items: [],
    /* Their whole published menu, read from https://underdogscantina.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Antojitos", items: [
        ["Chips & Salsa", "Our signature house-made chips and pico de gallo", 725, "underdogscantina-chips-salsa"],
        ["Chips, Salsa, & Guac", "Pico de gallo, and guacamole piled high on chips.", 1275, "underdogscantina-chips-salsa-guac"],
        ["Skinny Guacamole", "House-made guacamole served with cucumbers, jicama, radish, & carrots", 1275, "underdogscantina-skinny-guacamole"],
        ["Nachos", "House-made chips, Monterey Jack cheese, pinto beans, pico de gallo, jalapeños, guacamole, & Mexican sour cream", 1850, "underdogscantina-nachos"],
        ["Chicken Wings", "Chicken wings with your choice of sauce, served with carrots, celery, & blue cheese dressing", 1675, "underdogscantina-chicken-wings"],
        ["20 Wing Special", "", 3500],
        ["Side French Fries", "", 700],
        ["Grilled Corn & Black Bean Taco Salad", "Romaine lettuce, grilled corn, black beans, cilantro, onions, & tomatoes tossed in a lime vinaigrette, topped with guacamole, tortilla strips", 1600, "underdogscantina-grilled-corn-black-bean-taco-salad"],
        ["Caesar Salad", "Chopped Romaine Hearts with Housemade Dressing and Garlic Croutons **Includes Raw Eggs and Anchovies** Consuming raw or undercooked meats, poultry, seafood", 1600],
        ["Elote", "Fresh corn on the cob brushed with lime salsa & dusted with cotija cheese and cayenne pepper", 800, "underdogscantina-elote"],
        ["Sopa de Tortilla", "Homemade pollo soup with tomatoes, onions, Jack cheese, avocado, tortillas, & lime", 1600, "underdogscantina-sopa-de-tortilla"],
        ["Pozole", "Pork and hominy stew in a savory broth with guajillo and ancho chiles. Served with cabbage, radish, onion, & oregano.", 1825, "underdogscantina-pozole"],
        ["Queso Fundido", "Our signature queso made with Oaxaca cheese. Topped with roasted pasilla peppers, and served with a side of chips.", 1125],
      ] },
      { name: "Tacos", items: [
        ["Street Style Tacos (3)", "Authentic Mexican tacos topped with cilantro & onions on small corn tortillas choose three of the following - carne asada, carnitas, pollo, pollo asado", 1500, "underdogscantina-street-style-tacos-3"],
        ["Flautas", "Three crunchy rolled tacos served with Mexican crema, guacamole, and queso fresco.", 1650, "underdogscantina-flautas"],
        ["Crispy Carnitas", "One taco with a grilled crispy corn tortilla wrapped in a soft corn tortilla. With Jack cheese, pinto beans, pico de gallo, & guacamole", 1000, "underdogscantina-crispy-carnitas"],
        ["Crispy Pollo", "One taco with a grilled crispy corn tortilla wrapped in a soft corn tortilla. With Jack cheese, pinto beans, pico de gallo, & guacamole", 1000, "underdogscantina-crispy-pollo"],
        ["Crispy Pollo Asado", "One taco with a grilled crispy corn tortilla wrapped in a soft corn tortilla. With Jack cheese, pinto beans, pico de gallo, & guacamole", 1000, "underdogscantina-crispy-pollo-asado"],
        ["Crispy Chorizo", "One taco with a grilled crispy corn tortilla wrapped in a soft corn tortilla. With Jack cheese, pinto beans, pico de gallo, & guacamole", 1000, "underdogscantina-crispy-chorizo"],
        ["Baja Taco", "Beer battered fish in soft corn tortillas with cilantro, cabbage, red onions, roasted tomato & baja sauce.", 925, "underdogscantina-baja-taco"],
        ["Crispy Baja Taco", "Beer-battered fish in a crispy tortilla wrapped in a soft tortilla. With Jack cheese, guacamole, cilantro, cabbage, red onions, salsa roja", 1325, "underdogscantina-crispy-baja-taco"],
        ["Fish Taco", "Marinated mahi-mahi in soft corn tortillas with cilantro, cabbage, red onions, pico de gallo, & tomatillo salsa", 925, "underdogscantina-fish-taco"],
        ["Crispy Fish Taco", "Marinated mahi-mahi in a crispy tortilla wrapped in a soft tortilla. With Jack cheese, guacamole, cilantro, cabbage, red onions, & tomatillo salsa", 1325, "underdogscantina-crispy-fish-taco"],
        ["Salmon Taco", "Marinated Salmon in soft corn tortillas with cilantro, cabbage, red onions, mango pico de gallo & mango salsa.", 1000, "underdogscantina-salmon-taco"],
        ["Crispy Salmon Taco", "One grilled Salmon taco with a grilled crispy corn tortilla wrapped in a soft corn tortilla with Monterey Jack cheese, guacamole, cilantro, cabbage", 1400, "underdogscantina-crispy-salmon-taco"],
        ["Shrimp Taco", "Marinated shrimp in soft corn tortillas with cilantro, cabbage, red onions, pico de gallo, & tomatillo salsa", 925, "underdogscantina-shrimp-taco"],
        ["Crispy Shrimp Taco", "Marinated shrimp in a crispy tortilla wrapped in a soft tortilla. With Jack cheese, guacamole, cilantro, cabbage, red onions, & tomatillo salsa", 1325, "underdogscantina-crispy-shrimp-taco"],
        ["Crispy Grilled Veggie", "One taco with a grilled crispy corn tortilla wrapped in a soft corn tortilla. With seasonal grilled veggies, Jack cheese, pinto beans, pico de gallo", 1250, "underdogscantina-crispy-grilled-veggie"],
        ["Crispy Baja Cauliflower Taco", "Beer-battered Cauliflower in a crispy tortilla wrapped in a soft tortilla. With Jack cheese, guacamole, cilantro, cabbage, red onions, salsa roja, & baja sauce", 1200],
        ["Baja Cauliflower Taco", "Beer Battered Cauliflower in soft corn tortillas with cilantro, cabbage, red onions, roasted tomato & baja sauce.", 800],
        ["Crispy Vegetariano", "One taco with a grilled crispy corn tortilla wrapped in a soft corn tortilla. With Jack cheese, pinto beans, pico de gallo, & guacamole", 1200, "underdogscantina-crispy-vegetariano"],
      ] },
      { name: "Burritos and quesadillas", items: [
        ["Mexican Burrito", "Pinto beans, pico de gallo, and your choice of meat", 1500, "underdogscantina-mexican-burrito"],
        ["San Diego Burrito", "No rice or beans! Your choice of meat with Jack cheese, guacamole, & pico de gallo", 1625, "underdogscantina-san-diego-burrito"],
        ["California Burrito", "A SoCal special. Your choice of meat with French fries, Jack cheese & pico de gallo", 1625, "underdogscantina-california-burrito"],
        ["Bean & Cheese Burrito", "Just pinto beans & Jack cheese!", 925, "underdogscantina-bean-cheese-burrito"],
        ["Vegetariano Burrito", "Pinto beans, Jack cheese, pico de gallo, guacamole, cabbage, & red onions.", 1250, "underdogscantina-vegetariano-burrito"],
        ["Grilled Veggie Burrito", "Grilled seasonal veggies, Jack cheese, pinto beans, pico de gallo & guacamole", 1425, "underdogscantina-grilled-veggie-burrito"],
        ["Baja Burrito", "Beer-battered fish burrito with cilantro, cabbage, red onions, salsa roja, & baja sauce (lime salsa)", 1600, "underdogscantina-baja-burrito"],
        ["Mathew Berry's Surf & Turf Burrito", "Approved by Mathew Berry of NBC and ESPN! Carne asada and shrimp with cabbage, jack cheese, and sliced avocado", 2100, "underdogscantina-mathew-berry-s-surf-turf-burrito"],
        ["Cheeseburger Burrito", "In-house ground American Kobe beef, French fries, Jack cheese, pico de gallo, guacamole, & pickled jalapeños", 1650, "underdogscantina-cheeseburger-burrito"],
        ["The Impossible™ Burrito", "The famous Impossible™ burger patty, Jack cheese, French fries, pico de gallo, guacamole, & pickled jalapeños", 2050, "underdogscantina-the-impossible-burrito"],
        ["Quesadilla", "A crispy wheat tortilla with your choice of meat, melted Jack cheese, & pico de gallo", 1475, "underdogscantina-quesadilla"],
        ["Cheese Quesadilla", "Just a crispy wheat tortilla with melted Jack cheese", 775, "underdogscantina-cheese-quesadilla"],
      ] },
      { name: "Burrito bowls", items: [
        ["Carne Asada Burrito Bowl", "A burrito bowl served with our carne asada, rice, pinto beans, guacamole, pico de gallo, & sour cream.", 1825],
        ["Pollo Burrito Bowl", "A burrito bowl served with our pulled chicken, rice, pinto beans, guacamole, pico de gallo, & sour cream.", 1825],
        ["Pollo Asado Burrito Bowl", "A burrito bowl served with our grilled chicken, rice, pinto beans, guacamole, pico de gallo, & sour cream.", 1825],
        ["Carnitas Burrito Bowl", "A burrito bowl served with our carnitas, rice, pinto beans, guacamole, pico de gallo, & sour cream.", 1825],
        ["Grilled Mahi Burrito Bowl", "A burrito bowl served with our grilled mahi mahi, rice, pinto beans, guacamole, pico de gallo, & sour cream.", 2025],
        ["Grilled Shrimp Burrito Bowl", "A burrito bowl served with our grilled shrimp, rice, pinto beans, guacamole, pico de gallo, & sour cream.", 2025],
        ["Grilled Salmon Burrito Bowl", "A burrito bowl served with our grilled salmon, rice, pinto beans, guacamole, pico de gallo, & sour cream.", 2025],
      ] },
      { name: "Dessert", items: [
        ["Churros", "Classic Mexican churros with chocolate, caramel, or strawberry sauce", 950, "underdogscantina-churros"],
        ["Mexican Chocolate Mousse", "Featuring Ghirardelli Chocolate & our very own Housemade whipped cream", 800, "underdogscantina-mexican-chocolate-mousse"],
        ["KEY LIME PIE (Gluten-Free)", "Key lime pie made with a gluten-free graham cracker crust, topped with whipped cream.", 1000, "underdogscantina-key-lime-pie-gluten-free"],
      ] },
      { name: "Kids", items: [
        ["Kids Quesadilla", "Crispy wheat tortilla with Jack cheese", 575, "underdogscantina-kids-quesadilla"],
        ["Kids Bean & Cheese Burrito", "Just pinto beans & Jack cheese", 925, "underdogscantina-kids-bean-cheese-burrito"],
        ["Kids Street Tacos", "Authentic Mexican tacos topped with cilantro & onions on small corn tortillas - choose two of the following | carne asada, carnitas, pollo, pollo asada", 1225, "underdogscantina-kids-street-tacos"],
        ["Kids Chicken Plate", "A small plate of pollo asado with rice and pinto beans", 1325, "underdogscantina-kids-chicken-plate"],
      ] },
      { name: "Sides", items: [
        ["Side Guacamole", "", 700],
        ["Side Pico de Gallo", "", 425],
        ["Side Sour Cream", "", 350],
        ["Side Rice", "", 475],
        ["Side Pinto Beans", "", 475],
        ["Side Rice & Beans", "", 475],
        ["Side Carne Asada", "", 1025],
        ["Side Carnitas", "", 1025],
        ["Side Chorizo", "", 1025],
        ["Side Pollo", "", 1025],
        ["Side Pollo Asado", "", 1025],
        ["Side Fish", "", 1150],
        ["Side Shrimp", "", 1150],
        ["Side Salmon", "", 1150],
        ["Side Baja Fish", "", 1150],
        ["Side Grilled Veggies", "", 725],
        ["Side Cotija", "", 100],
        ["Side Corn Tortillas", "", 250],
        ["Side Blue Cheese", "", 200],
        ["Side Ranch", "", 200],
        ["Side Baja Sauce", "", 200],
        ["{Btl} Salsa Roja", "", 750, "underdogscantina-btl-salsa-roja"],
        ["{Btl} Salsa Verde", "", 750, "underdogscantina-btl-salsa-verde"],
        ["{Btl} Salsa Habanero", "", 750, "underdogscantina-btl-salsa-habanero"],
      ] },
      { name: "Beverages", items: [
        ["Water in a Box", "Help take a step towards saving our planet. 100% purified water (no added minerals), 100% recyclable and refillable with some common sense care.", 550, "underdogscantina-water-in-a-box"],
        ["House-made Horchata", "", 550, "underdogscantina-house-made-horchata"],
        ["Agua Fresca - Jamaica", "", 550, "underdogscantina-agua-fresca-jamaica"],
        ["Agua Fresca - Pineapple", "", 550, "underdogscantina-agua-fresca-pineapple"],
        ["Agua Fresca - Mango", "", 550, "underdogscantina-agua-fresca-mango"],
        ["Agua Fresca - Strawberry", "", 550, "underdogscantina-agua-fresca-strawberry"],
        ["Agua Fresca - Guanabana", "", 550],
        ["Agua Fresca - Guava", "", 550],
        ["Red Bull", "", 650, "underdogscantina-red-bull"],
        ["Diet Coke", "Take a Diet Coke break with this refreshing, no-calorie soft drink", 450, "underdogscantina-diet-coke"],
        ["Coke Zero", "", 450],
        ["Sprite", "Classic, cool, crisp lemon-lime flavored taste that's caffeine free", 450],
        ["Roy Rogers", "", 450],
        ["Shirley Temple", "", 550],
        ["Minute Maid Lemonade", "There’s always goodness to be found at the end of a Minute Maid rainbow.", 450, "underdogscantina-minute-maid-lemonade"],
        ["Iced Tea", "", 425],
        ["Cranberry Juice", "", 550],
        ["Jarritos Mandarin", "", 550, "underdogscantina-jarritos-mandarin"],
        ["Jarritos Pineapple", "", 550, "underdogscantina-jarritos-pineapple"],
        ["Jarritos Strawberry", "", 550],
        ["Jarritos Tamarindo", "", 550],
        ["Juice Shop Pineapple Mint Tonic", "", 700],
        ["Juice Shop Strawberry Kiwi Tonic", "", 700, "underdogscantina-juice-shop-strawberry-kiwi-tonic"],
        ["Athletic Brewing Cerveza N/A", "", 800],
        ["COORS BANQUET [Btl]", "", 600],
        ["Guinness Nitro Can", "", 1100],
        ["Bud Light (Btl)", "", 700],
        ["Modelo Oro", "", 800],
        ["Suncruiser", "", 800],
        ["Nutrl Pineapple", "", 900],
        ["Sierra Nevada Pale Ale", "", 800, "underdogscantina-sierra-nevada-pale-ale"],
        ["Nutrl Watermelon", "", 900],
        ["Nutrl Lemonade", "", 900],
        ["Miller Hi-life", "", 600],
        ["Banana Mudslide Cutwater", "", 1100],
        ["Standard Deviant Kolsch (Can)", "", 400],
        ["805 Cerveza", "805 Cerveza is a premium, Mexican-style light lager brewed with a touch of real lime by Firestone Walker Brewing Company", 800],
        ["Coca-Cola, Fountain", "Coca-Cola Original Taste — the crisp, refreshing taste you know and love", 450, "underdogscantina-coca-cola-fountain"],
      ] },
    ],
  },
  {
    slug: 'biryaniz',
    icon: 'biryaniz',
    name: 'Biryaniz',
    label: 'Biryaniz',
    cuisine: 'Indian',
    tagline: 'Biryani, catering and takeaway. Village Parkway.',
    color: '#FAFAFA|#40A040',
    prep: 0,
    /* Dublin's Indian seat is Pippal's. Yellow sheet rather than a second
       Indian tile on the numbered page. */
    category: 'Indian food',
    phone: '(925) 556-9999',
    address: '6830 Village Parkway, Dublin, CA 94568',
    site: 'https://www.biryaniz.com/',
    siteNote:
      'Mon-Thu 11.30am-2.30pm and 5.30pm-10pm, Fri to 11.30pm, Sat and Sun 11am-10pm',
    /*
      NO PRICES ANYWHERE. Their homepage and their menu page carry not one
      dollar figure between them — checked both, and both load identically to a
      browser user-agent and to plain curl, so nothing is being hidden behind a
      firewall the way Vegan Mob's was.

      NOT REPUBLISHED: "Best Indian catering Dublin", which names no rating, no
      publication and no award.
    */
    quoteOnly:
      'An Indian kitchen on Village Parkway in Dublin doing biryani, takeaway and catering for weddings, corporate events and family gatherings. They serve a midday and an evening service on weekdays and run straight through at weekends. They publish no prices.',
    items: [],
  },
  {
    slug: 'the-sweet-spot',
    icon: 'the-sweet-spot',
    /* Their own Instagram and their site title both say "The Sweet Spot". The
       WC is only in the square.site address he sent. */
    name: 'The Sweet Spot',
    label: 'Sweet Spot',
    cuisine: 'Dessert shop',
    tagline: 'Cups, pancakes and crepes. Sunnyvale Avenue.',
    color: '#FF9BD2|#FFD23F',
    prep: 0,
    /* A dessert counter serving crepes and pancakes to order is not the Bakery
       seat and the Ice cream one is Milky Flakes'. Yellow sheet. */
    category: 'Dessert shop',
    phone: '(925) 999-6394',
    address: '1512 Sunnyvale Ave, Walnut Creek, CA 94597',
    site: 'https://thesweetspotwc.square.site/',
    siteNote: 'Closed Mondays',
    /*
      NO PRICES, AND THEY DO PUBLISH SOME. Their Square Online menu renders in
      JavaScript: the served HTML carries the figures — 9.50 through 19.99 —
      with no way to tell which belongs to which dish. Numbers without the names
      they go with are worse than no numbers, so none are here. Their own
      ordering page has them beside the right things.

      NOT REPUBLISHED: "The Bay Area's favorite dessert spot", which is their
      own line and cites nothing.
    */
    items: [],
    /* Their whole published menu, read from https://thesweetspotwc.square.site/?location_id=LJHGPBW11983T&fulfillment=PICKUP#ZKWECOT3RR775CLESJDCER7B on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Sandos", items: [
        ["Biscoff Sando", "Japanese style milk bread fried to perfection and filled with sweet cream. Topped with biscoff sauce and cookie crumbs", 1150],
        ["Dubai Sando", "Japanese style milk bread fried to perfection and filled with sweet cream. Topped with pistachio cream and crispy katafi", 1150],
        ["Matcha Sando", "Japanese style milk bread fried to perfection and filled with ceremonial grade Matcha cream", 1150],
        ["Plain Sando", "Japanese style milk bread fried to perfection and filled with sweet cream", 950],
        ["Strawberry Nutella Sando", "Japanese style milk bread fried to perfection and filled with sweet cream. Topped with strawberries and Nutella", 1050],
      ] },
      { name: "Mini pancakes", items: [
        ["15 Biscoff Mini Pancakes", "Fluffy pancakes coated with Lotus Biscoff sauce and Belgian white chocolate. Cookie crumbs sprinkled on top", 1299],
        ["15 Double Chocolate Mini Pancakes", "Fluffy mini pancakes coated in Nutella and Belgian white chocolate", 1299],
        ["15 Dubai Chocolate Mini Pancakes", "Fluffy mini pancakes covered in Nutella, pistachio cream and crispy katafi", 1399],
        ["20 Biscoff Mini Pancakes", "Fluffy pancakes coated with Lotus Biscoff sauce and Belgian white chocolate. Cookie crumbs sprinkled on top", 1599],
        ["20 Double Chocolate Mini Pancakes", "Fluffy mini pancakes coated in Nutella and Belgian white chocolate", 1599],
        ["20 Dubai Chocolate Mini Pancakes", "Fluffy mini pancakes covered in Nutella, pistachio cream and crispy katafi", 1699],
        ["25 Biscoff Mini Pancakes", "Fluffy pancakes coated with Lotus Biscoff sauce and Belgian white chocolate. Cookie crumbs sprinkled on top", 1899],
        ["25 Double Chocolate Mini Pancakes", "Fluffy mini pancakes coated in Nutella and Belgian white chocolate", 1899],
        ["25 Dubai Chocolate Mini Pancakes", "Fluffy mini pancakes covered in Nutella, pistachio cream and crispy katafi", 1999],
      ] },
      { name: "Crepes", items: [
        ["Banana Biscoff Crepe", "Crepe filled and topped with, biscoff sauce, biscoff cookie crumble, white chocolate and sliced banana.", 1499],
        ["Dubai Chocolate Crepe", "Crepe filled and topped with crispy kunafa, pistachio cream, Nutella and ground pistachios.", 1499],
        ["Strawberry Nutella Crepe", "Crepe filled and topped with sliced strawberries and Nutella", 1399],
        ["Just plain Nutella", "", 1099],
      ] },
      { name: "Strawberry cups", items: [
        ["Dubai Chocolate Strawberry Cup", "Strawberries cut in half and covered in melted Nutella chocolate, pistachio cream and crispy katafi", 1599],
        ["Chocolate Strawberry Cup", "strawberries cut in half and topped with melted Nutella", 1399],
        ["White Chocolate Strawberry cup", "Strawberries cut in half and covered in melted Belgian white chocolate", 1399],
        ["Biscoff Strawberry Cup", "Strawberries cut in half and covered in melted Belgian white chocolate, lotus biscoff sauce and lotus biscoff cookie crumble", 1499],
      ] },
      { name: "Kunafa", items: [
        ["Dubai Chocolate Kunafa", "Kunafa topped with pistachio cream, crushed pistachios and Nutella with strawberries on the side.", 1499],
        ["Banana Biscoff Kunafa", "Crispy shredded phyllo dough filled with a sweet cheese filling soaked in sweet syrup, topped with fresh bananas, Lotus Biscoff sauce, white chocolate", 1399],
        ["Strawberry Nutella Kunafa", "Crispy shredded phyllo dough soaked in sweet syrup, topped with fresh strawberries and a rich drizzle of Nutella.", 1299],
        ["Plain Kunafa", "", 1099],
        ["12 oz or 16ozWhole milk", "", 350],
      ] },
    ],
  },
  {
    slug: 'gyro-king',
    icon: 'gyro-king',
    name: 'Gyro King',
    label: 'Gyro King',
    cuisine: 'Greek',
    tagline: 'Gyro wraps and plates on Grove Street.',
    color: '#FAFAFA|#0060A0',
    prep: 0,
    /* San Francisco's Mediterranean seat is Karam's. Yellow sheet. */
    category: 'Greek',
    phone: '(415) 621-8313',
    address: '25 Grove Street, San Francisco, CA 94102',
    site: 'https://www.gyrokingca.com/',
    siteNote: 'Mon-Fri 10.30am-7.45pm, Sat and Sun 10.45am-7.45pm',
    /*
      THE DISHES ARE THEIRS AND THE PRICES ARE NOT PUBLISHED, so they are named
      in the sentence rather than listed as items. The first cut put them in a
      priced group at zero, which draws four dishes at $0.00 — an invented price
      is bad and a free one is worse.

      NOT REPUBLISHED: their page title claims "Best Greek in San Francisco",
      which cites nothing.
    */
    quoteOnly:
      'A Greek counter on Grove Street doing gyro wraps and plates, open from half past ten until quarter to eight every day. The four they name themselves are the Lamb and Beef Gyro Wrap, the Chicken Gyro Wrap, the Chicken Gyro Plate and the Vegan Falafel Wrap. They publish no prices.',
    items: [],
  },
  {
    slug: 'bay-memories-booth',
    icon: 'bay-memories-booth',
    /* "Bay Memories Booth" on their own badge and in their Instagram name; the
       Wix page title runs it together as Baymemoriesbooth. */
    name: 'Bay Memories Booth',
    label: 'Bay Memories',
    cuisine: 'Mobile photo booth',
    tagline: 'DSLR booths and instant prints, across the Bay.',
    color: '#0B0B0D|#E01B24',
    prep: 0,
    /* BEASTY - Services is full, so the yellow sheet. A photo booth that
       travels to the event is why he filed it BEASTY and not one city. */
    category: 'Photo booth',
    site: 'https://www.baymemories.com/',
    instagram: 'baymemories_booth',
    /*
      HIS NOTE WAS "I think his business needs a website because their link
      isn't working" — and the site itself is fine. baymemories.com returns 200
      to a browser user-agent and to plain curl alike, four megabytes of it.
      What is broken is the link in their Instagram bio, which is a different
      thing to tell them and a much easier one to fix.

      NO PRICES: their packages page publishes none. NO ADDRESS: they travel.
    */
    quoteOnly:
      'A Bay Area photo booth hire for weddings, birthdays and events, shooting on DSLR cameras with studio lighting rather than tablets, with unlimited instant prints and custom photo-strip templates and backdrops. They publish packages rather than prices, and they come to the event.',
    items: [],
  },
  {
    slug: 'tay-ho',
    icon: 'tay-ho',
    /* Their own logo sets it with the diacritics: Tây Hồ, over OAKLAND. */
    name: 'Tây Hồ',
    label: 'Tây Hồ',
    cuisine: 'Vietnamese',
    tagline: 'Vietnamese, Oakland.',
    color: '#FFFFFF|#2AA6E0',
    prep: 0,
    /* Oakland's Asian food seat is Cambodian Street Food's. Yellow sheet. */
    category: 'Vietnamese',
    site: 'https://tayhooakland.com/',
    /*
      NOTHING BUT THE NAME AND THE TRADE, because their site cannot be read.
      tayhooakland.com sits behind a Cloudflare interstitial that answers 403 to
      a browser user-agent, to plain curl and to Googlebot alike — the page that
      comes back is "Just a moment...". No address, no hours, no menu and no
      prices are published here because none could be seen, not because they do
      not have them.
    */
    quoteOnly:
      'A Vietnamese kitchen in Oakland. Their own site is behind a bot check that will not answer, so nothing beyond their name is listed here yet.',
    items: [],
  },
  {
    slug: 'ruay-mitr',
    icon: 'ruay-mitr',
    name: 'Ruay Mitr',
    label: 'Ruay Mitr',
    cuisine: 'Thai',
    tagline: 'Thai chicken and rice, San Francisco.',
    color: '#FFFCF6|#5E7A5E',
    prep: 0,
    /* San Francisco's Asian food seat is House of Thai's. Yellow sheet. */
    category: 'Thai',
    phone: '(415) 274-9942',
    site: 'https://www.ruaymitrsf.com/',
    instagram: 'ruaymitr_sf',
    /*
      THEIR PAGE TITLE IS THEIR WIX TEMPLATE'S NAME. The site returns
      "Home | Purement" — Purement is the theme, not the restaurant, and a
      description read off that title would have named the wrong business
      entirely. The name here is the wordmark on their own page.

      NO ADDRESS AND NO PRICES: neither is published.
    */
    items: [],
    /* Their whole published menu, read from https://www.ruaymitrsf.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Appetizers", items: [
        ["Chickarones", "", 600, "ruaymitr-chickarones"],
        ["Hoy Jor", "", 900, "ruaymitr-hoy-jor"],
        ["Samosa", "", 800, "ruaymitr-samosa"],
        ["Crab Wonton", "", 1200, "ruaymitr-crab-wonton"],
      ] },
      { name: "Main Dishes", items: [
        ["Khao Mun Gai", "", 1800, "ruaymitr-khao-mun-gai"],
        ["Khao Mun Gai Tod", "", 1900, "ruaymitr-khao-mun-gai-tod"],
        ["Khao Moo Dang Moo Krob", "", 2200, "ruaymitr-khao-moo-dang-moo-krob"],
        ["Ba Mee Moo Dang Moo Krob", "", 2000, "ruaymitr-ba-mee-moo-dang-moo-krob"],
        ["Khao Soi Gai", "", 2100],
        ["Kra Pow Moo Krob", "Spicy crispy pork belly stir-fried with Thai holy basil, served with jasmine rice and fried egg.", 2100],
      ] },
      { name: "Sides", items: [
        ["Khao Mun", "", 400, "ruaymitr-khao-mun"],
        ["Jasmine Rice", "", 300],
        ["Boiled Egg", "", 300],
      ] },
      { name: "Desserts", items: [
        ["Mango Sticky Rice", "", 1100, "ruaymitr-mango-sticky-rice"],
        ["Kanom Tuay", "", 500],
        ["Coconut Ice Cream", "", 600],
      ] },
      { name: "Soft Drinks", items: [
        ["Coca-Cola", "Coca-Cola Original Taste — the crisp, refreshing taste you know and love", 300, "ruaymitr-coca-cola"],
        ["Diet Coke", "Take a Diet Coke break with this refreshing, no-calorie soft drink", 300, "ruaymitr-diet-coke"],
        ["Sprite", "Classic, cool, crisp lemon-lime flavored taste that's caffeine free", 300],
        ["Sparkling Water", "", 600],
        ["Thai Iced Tea", "", 600],
        ["Fresh Young Coconut", "", 600],
        ["Hot Matcha Tea", "", 500],
        ["Hot Jasmine Tea", "", 500],
        ["Iced Green Tea", "", 500],
        ["Thai Ice Coffee", "", 600],
      ] },
    ],
  },
  {
    slug: 'kung-fu-mala',
    icon: 'kung-fu-mala',
    /* Their own profile sets it in both scripts: KUNG FU MALA 쿵푸마라. */
    name: 'Kung Fu Mala',
    label: 'Kung Fu Mala',
    cuisine: 'Hot pot',
    tagline: 'Hot pot on Telegraph until midnight, daily.',
    color: '#FAF3E6|#C1272D',
    prep: 0,
    /* Oakland's Asian food seat is Cambodian Street Food's and Tây Hồ takes the
       first yellow one. Hot pot has no seat of its own. */
    category: 'Hot pot',
    phone: '(510) 817-4665',
    address: '4419 Telegraph Ave, Oakland, CA 94609',
    /* The parking is a reason to visit; the handle is a link. They were one
       string, so the footer read "Instagram at kungfumala" and went to the
       website. Split. */
    siteNote: 'Free private parking',
    instagram: 'kungfumala',
    needsSite: true,
    /*
      HIS NOTE WAS "Needs website pilot program" — this is one for the pilot,
      and everything here is from their own Instagram: hot pot, half past eleven
      until midnight, open daily, free private parking, Telegraph Avenue.
      No prices are published anywhere.
    */
    quoteOnly:
      'A hot pot restaurant on Telegraph Avenue, open every day from half past eleven in the morning until midnight, with free private parking. They have no website yet and publish no prices.',
    items: [],
  },
  {
    slug: 'dj-lex',
    icon: 'dj-lex',
    name: 'DJ Lex',
    label: 'DJ Lex',
    cuisine: 'DJ',
    tagline: 'Bay Area DJ.',
    color: '#FFFFFF|#111111',
    prep: 0,
    category: 'Individuals',
    site: 'https://www.officialdjlex.com/',
    instagram: 'officialdjlex',
    /*
      HELD, NOT TAKEN, like everybody else on this sheet. Their own site is a
      Squarespace with an about page and no rates on it, so none is shown; the
      icon is the script Lex monogram from their own artwork rather than a
      photograph, because for once there is a wordmark to use.
    */
    quoteOnly:
      'A Bay Area DJ. Nothing here is claimed on their behalf and they publish no rates; their own site is the way to reach them.',
    items: [],
  },
  {
    slug: 'pamilya',
    /* Their own page title is "Pamilya - Modern Filipino Comfort Food"; the
       domain adds Kitchen and their site does not. */
    name: 'Pamilya',
    label: 'Pamilya',
    cuisine: 'Filipino',
    tagline: 'Modern Filipino comfort food, Redwood City.',
    color: '#FAFAFA|#B3261E',
    prep: 0,
    category: 'Filipino food',
    phone: '(650) 362-4166',
    site: 'https://pamilyakitchen.com/',
    instagram: 'pamilya_sf',
    /* NO ICON: the only image they serve as a mark is a photograph of the room.
       NO ADDRESS OR PRICES: neither is published on the site. */
    items: [],
    /* Their whole published menu, read from https://pamilyakitchen.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Empanadas", items: [
        ["Ilocos Empanada 1pc", "1 pc", 1199, "pamilya-ilocos-empanada-1pc"],
      ] },
      { name: "Plates & Bowls", items: [
        ["Bowl", "", 1799],
        ["1 Entree Plate + Side Appetizer", "", 1995],
        ["2 Entree Plate + Side Appetizer", "", 2400],
      ] },
      { name: "All Day Breakfast", items: [
        ["Longanisa Silog", "Filipino breakfast sausage served with garlic rice & 2 sunny side up egg, ensalada, atchara (pickled veggies)", 1995],
        ["Spam Silog", "Tocino Spam served with garlic rice & 2 sunny side up eggs, ensalada, and atchara (pickled veggies)", 1995],
        ["Pork Tocino Silog", "Pork Tocino served with garlic rice & 2 sunny side up eggs, ensalada, and atchara (pickled veggies)", 1995],
        ["Fried Bangus Silog", "Fried Milkfish (Bangus) served with garlic rice & 2 sunny side up eggs, ensalada, atchara (pickled veggies)", 1995],
      ] },
      { name: "Sinigang", items: [
        ["Sinigang Soup 32oz", "", 2200],
      ] },
      { name: "Frozen Delicacies", items: [
        ["Goldilocks Dinuguan", "", 2499],
        ["Goldilocks Bopis", "", 2599],
        ["Goldilocks Pinapaitan", "", 2499],
        ["Manila Chicken BBQ", "", 1595],
        ["Kuya's Pork BBQ", "", 1595],
        ["Boneless Chicken Adobo", "", 1595],
        ["Honey Fried Chicken Bites", "", 1595],
        ["Crispy Pork Sisig", "", 1595],
        ["Bangus Sisig", "", 1595],
        ["Bicol Express", "", 1595],
        ["Beef Steak Tagalog", "", 1695],
        ["Beef Kalderetta", "", 1695],
        ["El Nido Garlic Shrimp", "", 1695],
        ["Longanisa 3pc", "", 795],
        ["Pork Tocino", "", 1595],
        ["White Rice", "", 549],
        ["Garlic Rice", "", 725],
        ["Pancit", "", 925],
        ["Fried Plantain", "", 100],
        ["Lechon Kawali", "", 1695],
        ["Veggie Stir Fry", "", 725],
      ] },
      { name: "Filipino Snacks & Treats", items: [
        ["Wawa's Banana Bread", "", 1595],
        ["Polvoron Assorted", "", 975],
        ["Ube Pillows Party", "", 425],
        ["Garlic Peanuts", "", 525],
        ["Choc Nut", "", 425],
        ["Oishi Salt & Vinegar Cracklings", "", 349],
        ["NOMS Lychee", "", 949],
        ["NOMS Strawberry Guava", "", 949],
        ["Toffee Peanuts", "", 599],
        ["NOMS Passion Orange", "", 949],
        ["NOMS Banana Lumpia", "", 975],
        ["Boy Bawang Cornick Garlic", "", 199],
        ["Boy Bawang Cornick BBQ", "", 199],
      ] },
      { name: "Desserts", items: [
        ["Ube Jelly Salad", "", 1175],
        ["Halo Halo", "", 1075],
        ["Mom & Jaeca's Perfect Cake", "", 899],
        ["Mango Jello", "", 795],
        ["Sweet Corn Bibinka Mochi", "", 249],
        ["Wawa's Banana Bread Slice", "", 399],
        ["Sylvanna", "", 475],
        ["Mango Calamansi Boba", "", 675],
        ["Sanzo", "", 350],
        ["C20 Coconut Water", "", 495],
        ["Coca-Cola", "Coca-Cola Original Taste — the crisp, refreshing taste you know and love", 325, "pamilya-coca-cola"],
        ["Diet Coke", "Take a Diet Coke break with this refreshing, no-calorie soft drink", 325, "pamilya-diet-coke"],
        ["Sprite", "Classic, cool, crisp lemon-lime flavored taste that's caffeine free", 325],
        ["Calamansi Juice", "", 325],
        ["Watermelon Calamansi", "", 525],
      ] },
    ],
    photos: [
      { src: '/food/pamilya-site-0-lg.webp', alt: "", credit: "Their own photo, from pamilyakitchen.com" },
    ],
    /* Their whole published menu, read from https://pamilyakitchen.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    slug: 'firebunz',
    icon: 'firebunz',
    /* One word on their own logo and in their page title: Firebunz. */
    name: 'Firebunz',
    label: 'Firebunz',
    cuisine: 'Smash burgers',
    tagline: 'Thin patties, melty cheese. Made to order.',
    color: '#101010|#C00000',
    prep: 0,
    category: 'Burgers and hot dogs',
    site: 'https://www.firebunz.com/',
    instagram: 'firebunz',
    /* The tagline is their own meta description, word for word. No address,
       hours or prices are published. */
    items: [],
    orderUrl: "https://order.firebunz.com/",
    /* Their published menu, read from their own Square ordering page, order.firebunz.com on 2026-09-09; sections as they publish them. */
    sections: [
      { name: "Burger", items: [
        ["Burger - Single", "Single Patty With Cheese, Grilled Onions, Pickles, & Sauce", 699],
        ["Burger - Double", "Double Patty With Cheese, Grilled Onions, Pickles, & Sauce", 799],
        ["Burger - Triple", "Triple Patty With Cheese, Grilled Onions, Pickles, & Sauce", 899],
      ]},
      { name: "Bowl", items: [
        ["Salad Bowl", "Double Patty With Cheese, Grilled Onions, Lettuce, Tomatoes & Sauce", 1099],
        ["Fire Bowl", "Double Patty With Cheese, Grilled Onions, Fries, Pickles, & Sauce", 1199],
      ]},
      { name: "Fries", items: [
        ["Fries", "Coated Crinkle Cut Fries With Our House Seasoning", 479],
        ["Cheese Fries", "Coated Crinkle Cut Fries With Our House Seasoning & Cheese", 625],
        ["Fire Fries", "Coated Crinkle Cut Fries With Our House Seasoning, Cheese, Grilled Onions, & Sauce", 699],
      ]},
      { name: "Drink", items: [
        ["Drink", "", 299],
      ]},
    ],
  },
  {
    slug: 'vale-nails',
    /* Their own artwork reads VALE NAILS in capitals. */
    name: 'VALE NAILS',
    label: 'Vale Nails',
    cuisine: 'Nail salon',
    tagline: 'Nails and classes, Belmont.',
    color: '#FAFAFA|#C08497',
    prep: 0,
    category: 'Nail salon',
    site: 'https://valenailsus.com/',
    /*
      NO ADDRESS, HOURS OR PRICES, and not because they hide them: their site is
      a Vagaro booking page that renders everything in JavaScript, so the served
      HTML has the headings — "Our Location", "Our Hours" — with nothing under
      them. They also run classes and sell gift certificates.

      NO ICON: they serve no logo file at all.
    */
    quoteOnly:
      'A nail salon in Belmont that also runs classes and sells gift certificates. Their booking page loads its address, hours and prices in the browser, so none of it is repeated here.',
    items: [],
  },
  {
    slug: 'beauty-by-bellez',
    name: 'Beauty by Bellez',
    label: 'Beauty by Bellez',
    cuisine: 'Beauty',
    tagline: 'Bay Area beauty.',
    color: '#FAFAFA|#C9A7FF',
    prep: 0,
    category: 'Beauty',
    phone: '(510) 604-4210',
    site: 'https://aantonio321.wixsite.com/beautybybellez',
    needsSite: true,
    instagram: 'beautybybellez',
    /*
      HE ASKED FOR TWO THINGS HERE, 2026-08-29: "Needs proper Website" and
      "can you ask Chat to create a quick logo for her to put".

      The site is a wixsite.com subdomain rather than her own domain, which is
      why it carries needsSite. THE LOGO IS NOT DRAWN YET — making one for a
      business that has none is a different thing from reproducing one that
      exists, and it is his to approve before it goes on her tile. Until then
      the app draws its own mark from her initials.
    */
    quoteOnly:
      'A Bay Area beauty business. Nothing is claimed on her behalf; she publishes no prices, and her site is a free Wix subdomain rather than her own address.',
    items: [],
  },
  {
    slug: 'pawsnug',
    name: 'PawSnug',
    label: 'PawSnug',
    cuisine: 'Pet goods',
    tagline: 'A hoodie you carry the dog in.',
    color: '#FAFAFA|#7BA05B',
    prep: 0,
    category: 'Pet goods',
    site: 'https://pawsnug.us/',
    menuNote: 'Their two listings',
    /*
      SIX DAYS OLD, AND EVERY DEFAULT LEFT IN. Their Shopify vendor field is
      literally "My Store" and their page title ends "– My Store"; the product
      image is called File_001.png; the catalogue holds exactly two things and
      one of them is "Priority Shipping!" at $2.99, which is a delivery charge
      sold as a product. The two listings were published on 23 and 25 August
      2026.

      None of that is proof of anything, and together it is the shape a
      dropshipped single-product store takes. It is listed with the product and
      the price and nothing else — no claims, no reviews, no description beyond
      what the title says it is — which is the Tiny Wheels treatment.
    */
    quoteOnly:
      'An online store selling one thing, a hoodie with a pouch to carry a small dog in. It opened in the last week of August 2026 and still carries its shop template’s defaults, so nothing about it is described here beyond what it lists.',
    groups: [
      {
        name: 'Their two listings',
        items: [
          ['PawSnug Pet Carrier Hoodie', 'Their published price', 4499],
          ['Priority Shipping', 'Sold as a product', 299],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'the-yappy-hour-club',
    name: 'The Yappy Hour Club',
    label: 'Yappy Hour',
    cuisine: 'Dog walking',
    tagline: 'Walks and drop-in visits, San Jose.',
    color: '#FAFAFA|#4A9D8F',
    prep: 0,
    category: 'Pet grooming and walking',
    site: 'https://theyappyhourclub.wixsite.com/my-site-1',
    needsSite: true,
    instagram: 'theyappyhourclub',
    /*
      A FREE WIX SUBDOMAIN, and the path is still my-site-1 — the default Wix
      hands out. That is why it carries needsSite: the business is real, the
      address it lives at is a placeholder.

      Their own words for what they do: walks with one-on-one attention and
      sniff breaks, and drop-in visits. No prices are published.
    */
    quoteOnly:
      'A San Jose dog walking service doing walks and drop-in visits, in their own words with one-on-one attention and plenty of sniff breaks. They publish no prices, and their site is still on a free Wix subdomain.',
    items: [],
  },
  {
    slug: 'pink-onion',
    hours: 'Every day 4pm–10pm',
    name: 'Pink Onion',
    label: 'Pink Onion',
    cuisine: 'Italian',
    tagline: 'Pizza, pasta and panini on 14th.',
    color: '#1B1218|#F0679F',
    prep: 0,
    category: 'Italian',
    phone: '(415) 529-2635',
    address: '64 14th St, San Francisco, CA 94103',
    site: 'https://www.pinkonionpizza.com/',
    /*
      HIS, 2026-08-29: "San Francisco \u2022 Goods / That place my daughter went to."

      Address, phone and the hours are theirs, off their own front page: 64
      14th St, 415.529.2635, open 4\u201310 every day. NO PRICES: their MENU link
      does not resolve to a page \u2014 /menu is a 404 on their own site \u2014 so
      there is no published price list to copy and none is invented.

      NO FOUNDER NAMED HERE ON PURPOSE. Their front page says "Founded by
      Francesco LoCoco and Matt Coric" in one paragraph and "run by Matthew
      Coric and Nallely Quintero Udave" in the next. Both are their words and
      they disagree, so the page says family-owned and leaves the names to
      them. Worth mentioning to them, along with the dead menu link.
    */
    items: [],
    /* Their published menu, read from the menu PDF linked from pinkonionpizza.com on 2026-09-09; sections as they publish them. */
    sections: [
      { name: "Appetizer", items: [
        ["Side Meatballs", "Famous homemade Sicilian meatballs", 1100],
        ["Parma e Burrata Plate", "Prosciutto di parma, burrata, arugula, candied pear, fresh fruit, aged balsamic", 1800],
        ["Vegetarian Style Burrata Plate", "Burrata, arugula, toasted pecans, candied pear, fresh fruit, cherry tomato, aged balsamic, parmigiano", 1800],
        ["Steamed Mussels", "White wine, garlic, shallots, cream, cherry tomatoes, parsley", 1600],
        ["Meat and Cheese Plate", "Mortadella, prosciutto, soppressata, assorted cheeses", 1500],
      ]},
      { name: "Salad", items: [
        ["Caesar Salad", "Romaine, caesar dressing, croutons, cracked black pepper, parmesan", 1300],
        ["Pink Onion Salad", "Romaine, goat cheese, toasted pecans, currants, fresh fruit, blood orange vinaigrette", 1300],
        ["Burrata Caprese", "Fresh tomato, burrata, basil, evoo, balsamic", 1300],
        ["Avocado Salad", "Mixed greens, avocado, toasted almonds, balsamic dressing", 1300],
        ["Pear Endive Salad", "Endives, pears, gorgonzola cheese, candied pecans, balsamic dressing", 1300],
      ]},
      { name: "Pasta", items: [
        ["Rigatoni Sugo", "Sicilian onion based tomato sauce", 1400],
        ["Add Our Famous Meatballs", "Add-on to any pasta", 400],
        ["La Bolognese", "Slow cooked to perfection. Not just any bolognese", 1900],
        ["Il Pesto di Pistacchio", "Basil, pecorino romano, ricotta", 1900],
        ["Mussel Pasta", "White wine, garlic, parsley, chili flakes, fresh mussels", 2000],
        ["Pasta Tartufo", "Seasonal truffle in a delicate parmesan truffle cream", 2100],
        ["Rigatoni Vodka", "Fresh rigatoni, garlic, spicy vodka tomato sauce", 1600],
        ["Rigatoni Norma", "Crushed tomato, garlic, eggplant, basil, ricotta salasa, red chili flakes", 1800],
        ["Rigatoni Amatriciana", "Guanciale, crushed tomato, red onion, black pepper, ramona cheese", 1800],
      ]},
      { name: "Pizza", items: [
        ["Paisan (Small)", "Traditional plain, boring, delicious cheese pizza", 1900],
        ["Paisan (Large)", "Traditional plain, boring, delicious cheese pizza", 2700],
        ["Margherita (Small)", "San marzano tomato, basil, fresh mozzarella", 2100],
        ["Margherita (Large)", "San marzano tomato, basil, fresh mozzarella", 2900],
        ["Pink Alarm Fire (Small)", "Pepperoni, chili pepper, garlic, red onion", 2300],
        ["Pink Alarm Fire (Large)", "Pepperoni, chili pepper, garlic, red onion", 3100],
        ["Icetank (Small)", "Sliced meatball, red onion, mushroom", 2300],
        ["Icetank (Large)", "Sliced meatball, red onion, mushroom", 3100],
        ["Giovanni Special (Small)", "Eggplant, garlic, basil, ricotta", 2300],
        ["Giovanni Special (Large)", "Eggplant, garlic, basil, ricotta", 3100],
        ["Bruce Bochy (Small)", "Pepperoni, mushroom, garlic, green onion", 2300],
        ["Bruce Bochy (Large)", "Pepperoni, mushroom, garlic, green onion", 3100],
        ["Patataccia (Small)", "Olive oil base, fresh mozzarella, potatoes, scallions, garlic, mild calabrese peppers, ricotta", 2300],
        ["Patataccia (Large)", "Olive oil base, fresh mozzarella, potatoes, scallions, garlic, mild calabrese peppers, ricotta", 3100],
        ["Tyson Punch Out (Small)", "Sausage, mushroom, ricotta, green onion", 2300],
        ["Tyson Punch Out (Large)", "Sausage, mushroom, ricotta, green onion", 3100],
        ["Sopressata (Small)", "Fresh mozz, hot soppressata, green onion, mushroom", 2300],
        ["Sopressata (Large)", "Fresh mozz, hot soppressata, green onion, mushroom", 3100],
        ["The Guido (Small)", "Marzano tomato, fresh mozzarella, prosciutto, arugula", 2300],
        ["The Guido (Large)", "Marzano tomato, fresh mozzarella, prosciutto, arugula", 3100],
        ["Magic Mushroom (Small)", "Olive oil base, fresh mozzarella, tomato sauce, crimini mushrooms, black pepper, truffle oil, prosciutto", 2300],
        ["Magic Mushroom (Large)", "Olive oil base, fresh mozzarella, tomato sauce, crimini mushrooms, black pepper, truffle oil, prosciutto", 3100],
        ["Kanoute (Small)", "Pesto of basil and pistachio, fresh mozzarella, ricotta, tomato, arugula, pistachio", 2300],
        ["Kanoute (Large)", "Pesto of basil and pistachio, fresh mozzarella, ricotta, tomato, arugula, pistachio", 3100],
        ["Nayalita (Small)", "Caramelized onion, mushroom, gorgonzola, ricotta, fresh mozzarella, olive oil base, balsamic drizzle", 2300],
        ["Nayalita (Large)", "Caramelized onion, mushroom, gorgonzola, ricotta, fresh mozzarella, olive oil base, balsamic drizzle", 3100],
        ["Hotboy (Small)", "Crushed tomato, fresh mozzarella, hot soppressata, Mikes hot honey", 2300],
        ["Hotboy (Large)", "Crushed tomato, fresh mozzarella, hot soppressata, Mikes hot honey", 3100],
        ["Burrata (Small)", "Crushed tomato, burrata, cherry tomatoes, arugula", 2300],
        ["Burrata (Large)", "Crushed tomato, burrata, cherry tomatoes, arugula", 3100],
        ["Joe Cool (Small)", "Calabrian sausage, cherry peppers, red onion", 2300],
        ["Joe Cool (Large)", "Calabrian sausage, cherry peppers, red onion", 3100],
        ["Ham Pod (Small)", "Sausage, pepperoni, sauteed jalapenos", 2300],
        ["Ham Pod (Large)", "Sausage, pepperoni, sauteed jalapenos", 3100],
        ["Grandma", "Square pizza, tomato sauce, cheese, ricotta, basil", 2100],
        ["Brock Purdy", "Square pizza, tomato sauce, cheese, ricotta, basil, pepperoni", 2300],
        ["Luka Modric (Small)", "Tomato sauce, cheese, pesto swirl", 2300],
        ["Luka Modric (Large)", "Tomato sauce, cheese, pesto swirl", 3100],
        ["Mexicano (Small)", "Mortadella, pepperoni, sausage, jalapenos", 2300],
        ["Mexicano (Large)", "Mortadella, pepperoni, sausage, jalapenos", 3100],
        ["The Ike", "Square pizza, ike's dirty vodka sauce, oregano, extra cheese, hot honey, sliced meatball", 2300],
        ["The Ike on Fire", "The Ike with Calabrian peppers, red onions, and basil", 2300],
        ["Gotham (Small)", "Pepperoni, sausage, ricotta, Mikes hot honey", 2300],
        ["Gotham (Large)", "Pepperoni, sausage, ricotta, Mikes hot honey", 3100],
      ]},
      { name: "Combo", items: [
        ["Combo Meal", "An appetizer or salad, pasta, small pizza, and dessert (free bottle of wine on Wednesdays)", 6000],
      ]},
      { name: "Non-Alcoholic", items: [
        ["Espresso", "", 300],
        ["Cappuccino", "", 400],
        ["Sparkling Water", "", 300],
        ["Soda", "", 300],
      ]},
      { name: "Dessert", items: [
        ["Tiramisu", "", 1000],
        ["Basque Cheesecake", "", 1100],
      ]},
      { name: "Wine", items: [
        ["Wine Bottle", "From the small-winery bottle list", 3500],
        ["Wine Glass", "Limited to selections listed above the bar", 900],
      ]},
      { name: "Beer", items: [
        ["Beer Pint", "Selection listed above the bar", 600],
      ]},
    ],
    photos: [
      { src: '/food/pink-onion-site-3-lg.webp', alt: "", credit: "Their own photo, from pinkonionpizza.com" },
    ],
  },
  {
    slug: 'alora-social',
    name: 'Alora Social',
    label: 'Alora Social',
    cuisine: 'Mediterranean',
    tagline: 'Mediterranean at City Center, San Ramon.',
    color: '#0F1A17|#C9A227',
    prep: 0,
    category: 'Mediterranean',
    site: 'https://www.visitalora.com/alora-social',
    /*
      HIS, 2026-08-29: "San Ramon \u2022 Goods".

      THEIR SITE WOULD NOT SERVE A PAGE. Every page returns 403 behind a
      Cloudflare bot check \u2014 cf-mitigated: challenge \u2014 in a plain request
      and in a real browser, so no address, no hours and no prices were taken
      from it, and none are guessed.

      What IS here comes from the one file they serve unchallenged, their own
      sitemap: pages for mediterranean-restaurant-san-ramon, handmade pasta,
      happy hour and brunch at City Center Bishop Ranch, plus a second room,
      Alora Pier 3, in San Francisco. That is enough to know which category
      they belong in and nothing more, which is why this page carries no
      detail. Ask them for the address, the hours and a logo.
    */
    quoteOnly:
      'A Mediterranean restaurant and bar at City Center in San Ramon, with a second room on the San Francisco waterfront. Their site does not serve to us, so nothing here is copied from it beyond what they belong under.',
    items: [],
  },
  {
    slug: 'napa-pedal-crusher',
    name: 'Napa Pedal Crusher',
    label: 'Pedal Crusher',
    cuisine: 'Party bike tours',
    tagline: 'A sixteen-seat pedal bar around downtown Napa.',
    color: '#141A22|#E8503A',
    prep: 0,
    /* No tour, bike or party-boat category exists on the services sheet, the
       same gap Bay Area Brew Boat fell into \u2014 see data/placements.ts. Event
       coordinator would misdescribe them: they drive the bike, they do not
       plan your party. */
    category: 'Party bike tours',
    phone: '(707) 812-8602',
    address: '1004 Clinton Street, Napa, CA 94559',
    site: 'https://www.napapedalcrusher.com/',
    /*
      HIS, 2026-08-29: "Needs a proper website / Napa \u2022 Services."

      NOT FLAGGED needsSite, AND HE SHOULD KNOW WHY. The link he sent is a
      peek.com booking widget, which is what made it look like they had no site
      of their own. They do: napapedalcrusher.com is their own domain, with
      their tours, their prices and their address on it. Flagging them would
      put a business that already has a real site on the list he prospects
      from.

      Both prices are floors in their own words \u2014 "Starting at $623" for the
      whole bike and "Starting at $45/Seat" \u2014 so they are labelled as floors
      rather than printed as a price somebody could hold them to.
    */
    quoteOnly:
      'A sixteen-seat pedal-powered party bike touring downtown Napa, two hours with a captain, booked for the whole bike or by the seat.',
    groups: [
      {
        name: 'Two hours, with a captain',
        items: [
          [
            'Private party, the whole bike',
            'Groups of 8 to 16, the bike to yourselves.',
            62300,
            'from $623',
          ],
          [
            'Individual seats',
            'One to sixteen seats on a shared ride.',
            4500,
            'from $45 a seat',
          ],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'auto-design-pro',
    hours: 'Mon–Fri 9am–6pm, Sat 9am–5pm, closed Sun',
    /*
      SINGULAR. Their domain is autodesignpros.com and he filed them as "Auto
      Design Pros", but the wordmark, every line of their own copy and their
      BBB listing all read AUTO DESIGN PRO. Only the domain is plural.
    */
    name: 'AUTO DESIGN PRO',
    label: 'Auto Design Pro',
    cuisine: 'Vinyl wrap',
    tagline: 'Wraps, tint and paint protection, Pittsburg.',
    color: '#101114|#C8102E',
    prep: 0,
    /*
      Four real trades and one seat. Their own footer lists vinyl wraps and
      graphic design, Ceramic Pro, window tinting, and detail and paint
      correction — and the services sheet has a seat for detailing, none for
      wraps. Wrapping leads their page and is what they are known for, so it
      leads here; the seat they take is the detailing one, which is genuinely
      theirs too. Worth him knowing they are wider than the tile says.
    */
    category: 'Auto detailing',
    phone: '(925) 635-6021',
    address: '40 N Parkside Dr., Pittsburg, CA 94565',
    email: 'info@autodesignpros.com',
    site: 'https://www.autodesignpros.com/',
    /*
      NO PRICES ANYWHERE ON THEIR SITE. They name every tier in detail —
      Ceramic Pro Sport through Gold, Xpel Ultimate Plus and Stealth, three
      levels of detail — and attach a figure to none of them: "priced to supply
      you with the level of protection you desire".

      NO ICON: the largest mark they serve is 256x75, which is narrower than
      the tile renders at. Ask them for the vector.

      WORTH TELLING THEM, and it is a pilot-program opening. Their page title
      and every piece of their structured data begins with the literal word
      "site" — an unreplaced placeholder, so the business has no correct name
      in its own metadata anywhere Google can read it. Their footer still says
      2018 and their newest upload is 2022.
    */
    quoteOnly:
      'A Pittsburg shop doing vehicle wraps and commercial graphics, Ceramic Pro coatings, window tinting, and detailing and paint correction. Every package is named on their own site and none of them is priced there, so nothing is priced here.',
    items: [],
  },
  {
    slug: 'precision-shine',
    hours: 'Mon–Sat 8am–6pm, Sunday by appointment',
    name: 'Precision Shine Detailing',
    label: 'Precision Shine',
    cuisine: 'Mobile detailing',
    tagline: 'They bring the detail to your driveway.',
    color: '#12141A|#C8A84B',
    prep: 0,
    category: 'Auto detailing',
    phone: '(925) 309-0972',
    email: 'precisionshinedetailing925@gmail.com',
    instagram: 'precisionshinedetailing',
    site: 'https://precisionshinedetailings.com/',
    /*
      NO ADDRESS, AND THAT IS THE POINT. "Mobile service. We come to you. No
      drop-off" — they publish a city and a radius, not a street: San Ramon and
      roughly twenty miles of Tri-Valley. His note said "Mobile" and their own
      site says the same.

      THE PRICES BELOW ARE FLOORS, and their own site is inconsistent about
      that in a way worth knowing: every visible page reads "From $90", while
      the structured data they publish for search engines writes the same
      numbers as flat prices. Anything ingesting their schema imports the wrong
      kind of number. Theirs are floors, so ours say so.

      THEIR 5.0 RATING IS NOT REPEATED HERE. It appears only inside their own
      structured data with nothing on the page behind it, which is a business
      asserting a rating about itself, not a rating.

      NO ICON: they serve no raster mark at all, only an SVG favicon, and the
      picture their own share tag points at is the site builder's stock logo.
    */
    quoteOnly:
      'A mobile detailer working San Ramon and the Tri-Valley, roughly a twenty-mile radius, bringing their own water, power and lighting to you. Prices start where these say and go up with the size and the state of the car.',
    groups: [
      {
        name: 'Detailing, from',
        items: [
          ['Exterior Detail', 'Wash, decontaminate, dress and protect the outside.', 9000, 'from $90'],
          ['Interior Detail', 'Inside out: vacuum, surfaces, glass.', 13500, 'from $135'],
          ['Full Detail', 'Their most-booked option, inside and out.', 16500, 'from $165'],
        ],
      },
      {
        name: 'Paint correction, from',
        items: [
          ['Enhancement Polish', 'Single stage.', 29900, 'from $299'],
          ['Correction Polish', 'Two stage.', 59900, 'from $599'],
          ['Show-Level Correction', 'Three stage.', 100000, 'from $1,000'],
        ],
      },
      {
        name: 'Ceramic coating, from',
        items: [
          ['Essential', 'Two-year warranty.', 50000, 'from $500'],
          ['Professional', 'Five-year warranty.', 69900, 'from $699'],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'carabao',
    name: 'Carabao',
    label: 'Carabao',
    cuisine: 'Filipino',
    tagline: 'Filipino cooking, twelve tables, Napa.',
    color: '#14110E|#C6763B',
    prep: 0,
    category: 'Filipino food',
    phone: '(707) 699-1220',
    address: '145 C Gasser Drive, Napa, CA 94559',
    email: 'contact@carabaonapa.com',
    instagram: 'carabaonapa',
    site: 'https://carabaonapa.com/',
    /*
      NO HOURS HERE, DELIBERATELY, and this is the one thing to ask them.
      Their site publishes two schedules at once: the footer on every page
      still says dinner Tuesday to Saturday, while the homepage announces new
      hours from September — Thursday to Monday, closed Tuesday and Wednesday.
      Both are live today. Printing either would be printing the wrong one for
      half the week, so neither is printed.

      Their menu prices are written as bare numbers with no dollar sign, which
      is their style; they are dollars.

      THEIR WINE LIST IS UNPRICED — about ninety bottles rendered with an empty
      price column. Nothing is inferred from it.
    */
    items: [
      ['Adobo Deviled Egg', '', 800],
      ['Pork Lumpia', '', 1200],
      ['Sisig Tacos', '', 1500],
      ['Kinilaw', '', 2200],
      ['Barako Ribs', '', 2400],
      ['Sizzling Sisig', '', 2900],
      ['Crispy Kare Kare', '', 4200],
      ['Bistek', '', 6900],
    ],
  },
  {
    slug: 'elliston-vineyards',
    hours: 'Tasting Thu–Mon 11am–4pm',
    name: 'Elliston Vineyards',
    label: 'Elliston',
    cuisine: 'Winery',
    tagline: 'A stone mansion and a tasting room, Sunol.',
    color: '#1B1710|#B08D57',
    prep: 0,
    category: 'Winery',
    phone: '(925) 862-2377',
    address: '463 Kilkare Rd, Sunol, CA 94586',
    email: 'info@elliston.com',
    instagram: 'ellistonvineyards',
    site: 'https://ellistonvineyards.com/',
    /*
      HIS READ WAS WRONG AND IT IS WORTH SAYING SO. He sent a Linktree and
      thought "looks like they might need a website" — but the Linktree is a
      social bio, not their site. ellistonvineyards.com is a full Shopify
      store, and elliston.com redirects into it, which is also why their email
      is on a different domain than their website.

      They do have rot he could pitch against: their Tickets collection is
      empty while the nav advertises it, their food-menu page renders a heading
      and nothing else, /pages/visit 404s, and their tasting page misspells
      "Sommelier" and "Approximately". That is a maintenance pitch, not a build.

      Weddings and events are quoted, never priced — they publish room
      capacities and an enquiry form. Only the two tastings carry a number.
    */
    quoteOnly:
      'A winery and event venue in the Sunol hills: a historic stone mansion, lawns, and the Terrace Room, which seats a hundred and fifty. Tastings are priced; weddings, corporate and social events are quoted.',
    groups: [
      {
        name: 'Tastings, per person',
        items: [
          ['Sommelier Tasting', 'About an hour. Weekends.', 8500],
          ['Afternoon Tea', 'About ninety minutes. Two orders minimum per party.', 3900, '$39 to $56'],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'brunch-and-bloom',
    hours: 'Every day 8am–3pm',
    /* An ampersand, which is how they write it everywhere. His note said "and". */
    name: 'Brunch & Bloom',
    label: 'Brunch & Bloom',
    cuisine: 'Brunch cafe',
    tagline: 'Artisan coffee and scratch brunch, Brentwood.',
    color: '#F7F3EC|#5C7F53',
    prep: 0,
    category: 'Coffee shop',
    phone: '(925) 240-4916',
    address: '2540 Sand Creek Road, Suite A5, Brentwood, CA 94513',
    email: 'info@brunchandbloomartisancafe.com',
    instagram: 'brunchandbloomcafe',
    site: 'https://brunchandbloom.cloveronline.com/',
    needsSite: true,
    /*
      THE BEST WEBSITE PROSPECT ON THIS SHEET, and for an unusual reason: they
      have already bought one. brunchandbloomartisancafe.com is theirs — it is
      the domain their own email runs on, and the mail works — but the site
      behind it returns a Wix "connect your domain" error at both the apex and
      www. They are paying for a domain and a builder that were never joined
      up, and their Instagram link has given up and points at the ordering
      page. They decided they wanted a site and did not land it.

      DO NOT LINK brunchandbloom.com. That is a different brunch place with the
      same name in Humble, Texas.

      The suite number comes from their own Instagram; the Clover address
      record omits it.
    */
    items: [],
    /* Their whole published menu, read from https://brunchandbloom.cloveronline.com/ on 2026-09-04 with their own photos; sections as they publish them. */
    sections: [
      { name: "Brunch plates", items: [
        ["Garden Shakshuka", "", 1800, "brunchandbloom-garden-shakshuka"],
        ["Bloom Breakfast Sammie", "", 1500],
        ["Istanbul Morning", "", 1800],
        ["Sunrise Street Tacos", "", 1600],
        ["Golden Harvest Hash", "", 1900],
        ["Brunch & Bloom Classic", "", 1700],
        ["Tropical Morning Chia", "", 1200],
      ] },
      { name: "Toasts", items: [
        ["Cali Avocado Toast", "", 1600],
        ["Coastal Lox Toast", "", 1900],
        ["Parisian French Toast", "", 1600, "brunchandbloom-parisian-french-toast"],
        ["Peanut Butter Blossom Toast", "", 1500],
        ["Tuscan Morning Toast", "", 1700],
      ] },
      { name: "Paninis & Melts", items: [
        ["Turkey Garden Panini", "", 1700],
        ["Triple Cheese Melt", "", 1500],
        ["Irish Corned Beef Panini", "", 1800, "brunchandbloom-irish-corned-beef-panini"],
        ["Southwest Chicken Panini", "", 1800],
        ["Garden Avocado Pesto Panini", "", 1700],
      ] },
      { name: "Sammies", items: [
        ["California Turkey Sammie", "", 1800],
        ["Smoky Hot Chicken Sammie", "", 1800],
        ["Italian Garden Sammie", "", 1700],
      ] },
      { name: "Salads & Soup", items: [
        ["Bloom Chopped Salad", "", 1700],
        ["Orchard Cobb Salad", "", 1800],
        ["Creamy Tomato Soup", "", 800],
      ] },
      { name: "Waffles", items: [
        ["California Breakfast Waffle", "", 1800],
      ] },
      { name: "For the Little Ones", items: [
        ["Little Fry Up", "", 1000],
        ["Grilled Cheese Louise", "", 1000],
        ["Pb & Banana Toastie", "", 1000],
      ] },
      { name: "Coffee & Espresso", items: [
        ["Drip Coffee", "", 400],
        ["Cappuccino", "", 600],
        ["Café Americano", "", 500],
        ["Caramel Latte", "", 700],
        ["Chai Tea Latte", "", 700],
        ["Golden Morning Latte", "", 700],
        ["Lavender Latte", "", 700],
        ["Vanilla Latte", "", 700],
      ] },
      { name: "Seasonal Lattes", items: [
        ["Matcha Latte", "", 700],
      ] },
      { name: "Cold Drinks", items: [
        ["Rasberry Lemonade", "", 600],
        ["Mint Lemonade", "", 600],
        ["Classic Lemonade", "", 500],
        ["Lavender Lemonade", "", 600],
      ] },
      { name: "Hot Tea", items: [
        ["Hot Tea", "", 600],
      ] },
    ],
    photos: [
      { src: '/food/brunch-and-bloom-site-2-lg.webp', alt: "product image", credit: "Their own photo, from brunchandbloom.cloveronline.com" },
      { src: '/food/brunch-and-bloom-site-3-lg.webp', alt: "product image", credit: "Their own photo, from brunchandbloom.cloveronline.com" },
      { src: '/food/brunch-and-bloom-site-4-lg.webp', alt: "product image", credit: "Their own photo, from brunchandbloom.cloveronline.com" },
      { src: '/food/brunch-and-bloom-site-5-lg.webp', alt: "product image", credit: "Their own photo, from brunchandbloom.cloveronline.com" },
      { src: '/food/brunch-and-bloom-site-6-lg.webp', alt: "product image", credit: "Their own photo, from brunchandbloom.cloveronline.com" },
    ],
    /* Their whole published menu, read from https://brunchandbloom.cloveronline.com/ on 2026-09-04 with their own photos; sections as they publish them. */
  },
  {
    slug: 'johnny-boi',
    /* Cut from the share-profile sheet he sent with the listing (2026-09-02 sweep). */
    icon: 'johnny-boi',
    hours: 'Sun–Thu 10am–9pm, Fri–Sat 10am–10pm',
    /* Plural on their own site; their Instagram name is singular. */
    name: 'Johnny Boi Smash Burgers',
    label: 'Johnny Boi',
    cuisine: 'Smash burgers',
    tagline: 'Smash burgers on Tewksbury, Point Richmond.',
    color: '#101A38|#C9A227',
    prep: 0,
    category: 'Burgers and hot dogs',
    phone: '(510) 260-0291',
    /* Point Richmond is the postal form; their ordering site and Instagram
       both just say Richmond, which is the page they sit on. */
    address: '201 Tewksbury Avenue, Point Richmond, CA 94801',
    email: 'infojohnnyboi@gmail.com',
    instagram: 'johnnyboi_smash',
    site: 'https://johnnyboismash.com/',
    /*
      A STOREFRONT, not a truck — he sent only an Instagram screenshot, and
      their own site settles it: a fixed address, dine-in, reservations, a jobs
      page and a mural people mention.

      "shredduce" is theirs and appears three times consistently, so it is not
      corrected here. The typos on their menu page are theirs too and are not
      reproduced: their descriptions spell caramelised onions correctly two
      lines above the heading that does not.

      Trompo is on their menu as "Coming Soon" with no price, so it is not
      listed.
    */
    items: [
      ['Johnny Boi', '', 900],
      ['Fat Boi', '', 1200],
      ['Cowboi', '', 1300],
      ['Fasho Spicy', '', 1100],
      ['Burger Bowl', '', 800],
      ['Mac N\' Cheese & Bacon Bits', '', 600],
      ['Onion Rings', '', 500],
      ['Garlic Parm Wings', '', 1200],
    ],
    offer: ['Johnny Boi', 'Fat Boi', 'Cowboi', 'Fasho Spicy'],
  },
  {
    slug: 'butter-pecan',
    hours: 'Mon–Fri 10am–7pm, Sat–Sun 10am–5pm',
    icon: 'butter-pecan',
    name: 'Butter Pecan Bakeshop',
    label: 'Butter Pecan',
    cuisine: 'Cookie bakery',
    tagline: 'Cookies by the half dozen, six shops.',
    color: '#8A5A2B|#E8C39E',
    prep: 6,
    category: 'Bakery',
    phone: '(510) 283-5140',
    address: '1889 San Pablo Ave, Pinole, CA 94564',
    site: 'https://www.butterpecanbakeshop.com/',
    instagram: 'butterpecanbakeshop',
    /*
      REDONE FROM THEIR OWN SITE, 2026-08-30, on his "can you redo their page".

      WHAT WAS HERE WAS NOT THEIRS. This was one of the seventeen ported from
      goodneighborbuilder.com, and it described an ice cream shop: "Ice cream &
      cobbler", a Butter Pecan Pint, a Peach Cobbler Cup, a Two Scoop Waffle
      Cone. Butter Pecan Bakeshop sells cookies. Not one of those four items
      exists on their menu and the trade was wrong, so the whole entry went and
      this was written from butterpecanbakeshop.com instead. That is also why
      the owner-review flag is gone: there is nothing left on this page that
      nobody confirmed.

      HIS THREE FLAVOURS, UNDER THEIR OWN NAMES. He asked for "Banana Pudding,
      Buterpecan & Dark Chocolate Chip w/sea salt". Only the first is what the
      bakery calls it. Theirs are Banana Pudding, BROWN Butter Pecan (three
      words — "Butter Pecan" alone is the shop, not a cookie) and Dark
      Chocolate & Sea Salt (no "Chip"). Their names are used, because a page
      that renames a business's own products is the same mistake as inventing
      them.

      THE DARK CHOCOLATE PHOTO IS FILED UNDER THE WRONG NAME ON THEIR SERVER —
      brown_butter_pecan_1200x1200_....png is the sea-salt cookie, and its own
      alt text says so. Looked at rather than assumed from the filename.

      They publish boxes, not single cookies, so there is no per-cookie price
      here. Their FAQ still says four locations and their Contact page still
      lists an old Pinole number; the store pages are newer and are what these
      come from.
    */
    panels: [
      {
        head: 'The three he picked',
        photos: [
          {
            src: 'butter-pecan-banana-pudding.webp',
            alt: 'A Banana Pudding cookie',
            caption: 'Banana Pudding',
          },
          {
            src: 'butter-pecan-brown-butter-pecan.webp',
            alt: 'A Brown Butter Pecan cookie',
            caption: 'Brown Butter Pecan',
          },
          {
            src: 'butter-pecan-dark-choc-sea-salt.webp',
            alt: 'A Dark Chocolate and Sea Salt cookie',
            caption: 'Dark Chocolate & Sea Salt',
          },
        ],
      },
      {
        head: 'Where they are',
        body: [
          'Pinole — 1889 San Pablo Ave, (510) 283-5140',
          'Emeryville — 6472 Hollis St, (510) 817-4630',
          'Pleasant Hill — 2360 Monument Blvd Suite C, (925) 483-2956',
          'Fairfield — 846 Texas St, (707) 759-4170',
          'Vallejo — 3272 Sonoma Blvd Suite 1, (707) 731-2562',
          'Hayward — 22656 Mission Blvd, (510) 274-5035',
          'Antioch — coming soon. They are running a grand-opening list for it and have published no address yet.',
          'Every shop keeps the same hours: 10 to 7 on weekdays, 10 to 5 at weekends.',
        ],
      },
      {
        head: 'Every flavour they make',
        body: [
          'Dark Chocolate & Sea Salt, Brown Butter Pecan, Cookies & Cream, Banana Pudding, Oatmeal Raisin Pecan, Dark Chocolate Walnut, Banana Toffee, Strawberries & Cream, Walnut Brownie, Birthday Cake, Tea Cake Cookie, and Pecan Pie.',
        ],
      },
    ],
    items: [
      ['Make a box — half dozen', 'Six, chosen by you.', 2300],
      ['Make a box — one dozen', 'Twelve, chosen by you.', 3900],
      ['Best Sellers Pack — 6', '', 2300],
      ['Best Sellers Pack — 12', '', 3900],
      ['Chocolate Lover Box — 6', '', 2300],
      ['Southern Classics Box — 6', '', 2300],
      ['Nut Lovers Box — 6', '', 2300],
      ["Kid's Pick Box — 6", '', 2300],
      ['Wine & Cookie Pairing Box — 12', '', 5000],
      ['Catering — 50 cookies', '', 15000],
      ['Catering — 100 cookies', '', 29000],
    ],
    offer: [
      'Make a box — half dozen',
      'Make a box — one dozen',
      'Best Sellers Pack — 12',
      'Wine & Cookie Pairing Box — 12',
    ],
  },
  {
    slug: 'delah-coffee',
    /* Cut from the share-profile sheet he sent with the listing (2026-09-02 sweep). */
    icon: 'delah-coffee',
    name: 'Delah Coffee House',
    label: 'Delah Coffee',
    cuisine: 'Arabic coffee',
    tagline: 'Arabic coffee, tea and cakes on West Grand.',
    color: '#0E1A14|#C8A45C',
    prep: 0,
    category: 'Coffee shop',
    address: '420 W Grand Ave, Oakland, CA 94612',
    instagram: 'delah.coffee.oakland',
    /*
      HIS, 2026-08-31: "Oakland • Goods" and then "Definitely needs a website."
      He is right — there is no site at all, only the Instagram, which is why
      everything here comes from their own profile and their own posts.

      NO HOURS, AND THEY ARE THE ONES TO ASK. Their bio says Sunday to Thursday
      7am to 11pm and Friday and Saturday until midnight; their own "New
      Opening Hours" post says Monday to Thursday 7am to 11pm and Saturday and
      Sunday until midnight. Those cannot both be right, and neither is printed
      here rather than picking the one that happens to be newer.

      A SECOND SHOP IS HINTED AND NOT LISTED. One of their posts footers
      "Oakland & San Francisco Sansome St, California", but no San Francisco
      address is published anywhere, so only the Oakland one is here. Worth
      asking him.
    */
    quoteOnly:
      'An Arabic coffee house on West Grand in Oakland: coffee, tea, cakes and pastries, with hummus and falafel baskets. Their menu is pictures on their own site, so no prices are listed here yet.',
    site: 'https://delahcoffee.com/',
    phone: '(510) 228-8229',
    email: 'info@delahcoffee.com',
    items: [],
  },
  {
    slug: 'port-of-peri-peri-sf',
    /* Cut from the share-profile sheet he sent with the listing (2026-09-02 sweep). */
    icon: 'port-of-peri-peri-sf',
    hours: 'Mon–Thu 11am–10pm, Fri–Sun 11am–11pm',
    name: 'The Port of Peri Peri',
    label: 'Peri Peri SF',
    cuisine: 'Peri peri chicken',
    tagline: 'Flame-grilled peri peri on 3rd Street.',
    color: '#1A0C0E|#C8102E',
    prep: 0,
    category: 'Chicken wings',
    phone: '(415) 340-7373',
    address: '737 3rd St, San Francisco, CA',
    instagram: 'sfperiperi',
    /*
      HIS, 2026-08-31: "San Francisco • Goods", sent as a screenshot with no
      link, so everything here is off their own Instagram profile.

      NO WEBSITE OF THEIR OWN. Their bio lists five delivery platforms —
      DoorDash, UberEats, Grubhub, Postmates and Chownow — and no site, which
      is exactly the shape he prospects. The brand exists in other states; this
      entry is the San Francisco shop and its own number.

      THE DIETARY TAG IS THEIRS, NOT OURS: their bio says HALAL and ZABIHA.
      Printed as their own description and never as a certification.

      They write their own cuisine as "Portugese"; the correct spelling is used
      here because it is our sentence, not a quotation of theirs.
    */
    dietary: ['Halal'],
    items: [],
    site: "https://www.myperiperi.com/",
    siteCta: "Order on their site",
    /* Their published menu, read from myperiperi.com, the chain's own site, whose prices are chain-wide on 2026-09-09; sections as they publish them. */
    sections: [
      { name: "Small Bites", items: [
        ["Peri Potato Chips", "", 495],
        ["Mixed Olives", "", 495],
        ["Hummus", "", 595],
        ["6 Peri Wings", "", 1195],
        ["5 Peri Paneer Strips", "", 795, null, "from"],
        ["5 Peri Falafel", "", 795, null, "from"],
        ["Peri Peppers", "", 595, null, "from"],
        ["Pericini", "", 450],
      ]},
      { name: "Specialty", items: [
        ["2 Peri Costeletas (Lamb Chops)", "", 1695, null, "from"],
        ["4 Peri Costeletas (Lamb Chops)", "", 2695, null, "from"],
        ["Peri Chuck Short Ribs", "", 1995],
      ]},
      { name: "Salads", items: [
        ["Couscous Salad", "", 1145],
        ["Quinoa Salad", "", 1145],
        ["Port House Salad", "", 945],
      ]},
      { name: "Signature Chicken", items: [
        ["Two 1/4 Chicken (Leg & Thigh)", "", 1895, null, "from"],
        ["Whole Chicken", "", 3395, null, "from"],
        ["Wings (3/6/12 pc)", "", 625, null, "from"],
        ["Chicken Tender (4 or 7 pc)", "", 1195, null, "from"],
        ["Chicken & Rice Bowl", "", 1795, null, "from"],
        ["The Peri Combo Box", "", 1545, null, "from"],
        ["1/4 Chicken (Leg & Thigh)", "", 995, null, "from"],
        ["1/4 Chicken (Breast & Wing)", "", 1095, null, "from"],
        ["1/2 Chicken", "", 1895, null, "from"],
        ["Peri Leg & Thigh Rice Bowl", "", 1545, null, "from"],
      ]},
      { name: "Platters", items: [
        ["All For One", "", 2525, null, "from"],
        ["Original Platter", "", 4295, null, "from"],
        ["Family Platter", "", 8595, null, "from"],
        ["Wings Platter", "", 4545, null, "from"],
        ["The Peri Feast", "", 11995, null, "from"],
        ["Celebration Platter", "", 6495, null, "from"],
        ["The BBQ Platter", "", 5495, null, "from"],
      ]},
      { name: "Burgers, Pitas & Wraps", items: [
        ["The Burger", "", 1395, null, "from"],
        ["The Sizzler", "", 1395, null, "from"],
        ["The Pita", "", 1295, null, "from"],
        ["The Wrap", "", 1295, null, "from"],
        ["Carné Burger", "", 999, null, "from"],
        ["The Peri Burrito", "", 1000, null, "from"],
        ["Periwarma Wrap", "", 1295, null, "from"],
      ]},
      { name: "Veggie Delights", items: [
        ["Paneer Rice", "", 1245, null, "from"],
        ["Falafel Rice", "", 1245, null, "from"],
        ["Veg Burger", "", 1125, null, "from"],
        ["Veg Pita", "", 1125, null, "from"],
        ["Falafel Pita", "", 1125, null, "from"],
        ["Paneer Wrap", "", 1125, null, "from"],
        ["Peri Peri Beyond Burger", "", 1495, null, "from"],
      ]},
      { name: "The Port Sides", items: [
        ["French Fries", "", 450, null, "from"],
        ["Port Rice", "", 450, null, "from"],
        ["Flame-Grilled Corn On The Cob", "", 450, null, "from"],
        ["PeriMayo Corn", "", 450, null, "from"],
        ["Coleslaw", "", 450, null, "from"],
        ["Red Skinned Potato Salad", "", 450, null, "from"],
        ["Steamed Vegetables", "", 450, null, "from"],
        ["Toasted Pita", "", 150],
        ["Peri Cassava Fries", "", 450, null, "from"],
      ]},
      { name: "Dips", items: [
        ["PeriMayo", "", 75],
        ["Peri BBQ Dip", "", 75],
        ["Peri Ranch Dip", "", 75],
        ["Peri Salt", "", 55],
        ["8 oz Dips", "", 450, null, "from"],
        ["2 Dips for $1", "", 100],
      ]},
      { name: "Desserts", items: [
        ["Assorted Dessert Platter", "", 2250],
        ["Tiramisu Cake", "", 450],
        ["Red Velvet Layer Cake", "", 450],
        ["KeyLime Créme Pie", "", 450],
        ["Salted Caramel Brownie", "", 450],
        ["Cheesecake Xangos", "", 450],
        ["Peanut Butter Cream Pie", "", 450],
        ["Citrus Olive Oil Cake", "", 450],
        ["Eli's Marble Cheesecakes", "", 450],
        ["Pastéis de Nata", "", 450],
        ["Lemon Cream Layer Cake", "", 450],
      ]},
      { name: "JNR's Meals", items: [
        ["3 Wings (Jnr Meal)", "", 965, null, "from"],
        ["2 Tenders (Jnr Meal)", "", 965, null, "from"],
        ["3 Paneer Strips (Jnr Meal)", "", 965, null, "from"],
        ["4 Falafels (Jnr Meal)", "", 965, null, "from"],
      ]},
      { name: "Beverages", items: [
        ["De México", "", 395, null, "from"],
        ["Smart Water", "", 375],
        ["Minute Maid Juice", "", 325],
        ["Sultan", "", 295, null, "from"],
        ["Haraz Coffee & Tea", "", 400],
        ["Topo Chico", "", 295],
        ["Joe's Lemonade", "", 495],
        ["IBC Root Beer", "", 395],
        ["Healthy Cola", "", 195],
        ["Fiji Artisan Water", "", 350],
      ]},
    ],
  },
  {
    slug: 'weasy',
    /*
      "WEASY", NOT "WEASY PET". The domain is weasypet.com and he sent it as
      that, but the store calls itself Weasy throughout — Weasy US on the
      storefront, Weasy LLC in the policies. "Weasy Pet" appears once, mid-
      sentence, in the refund policy. Their name is theirs.
    */
    name: 'Weasy',
    label: 'Weasy',
    cuisine: 'Dog potty system',
    tagline: 'A smart indoor bathroom for the dog.',
    color: '#12100E|#8FB98A',
    prep: 0,
    /* Pet goods is Pawddle's seat, the same wall Glow Paws, DryPup and
       PuppiePack hit. Seated on a free number and noted, per that precedent. */
    category: 'Pet goods',
    phone: '(407) 752-0424',
    address: '1255 LaQuinta Dr, Suite 220, Unit B5, Orlando, FL 32809',
    site: 'https://weasypet.com/',
    /*
      EVERY PRICE HERE IS A SALE PRICE. Almost the whole catalogue carries a
      compare-at, which is permanent-discount pricing rather than a sale; the
      numbers below are what you actually pay today, and the "from" ones are
      the cheapest of several variants.

      TWO THINGS TO ASK THEM, both on their own site. Their support address is
      support@weasy.com.br on every page and support@weasy.com in the Terms —
      two different addresses for the same job. And their homepage says "SHARK
      TANK ... we received offers from two sharks", which only the About page
      clarifies was Shark Tank BRAZIL; an American reading the homepage alone
      would take it for the US show.

      NO INSTAGRAM. They link no social account at all.
    */
    items: [
      ['Weasy Smart Potty', 'From, across twelve variants.', 16990],
      ['Weasy Bag', 'One price, small through large.', 5990],
      ['Weasy Bag Refill', 'From.', 2990],
      ['Leg-Lifter Wall', 'From.', 4990],
      ['Weasy Bowl — Slow Feeder', '', 1990],
      ['Weasy Potty Training', '', 1990],
    ],
    offer: ['Weasy Smart Potty', 'Weasy Bag', 'Leg-Lifter Wall', 'Weasy Bowl — Slow Feeder'],
  },
  {
    slug: 'seatmate',
    name: 'SeatMate',
    label: 'SeatMate',
    cuisine: 'Pet furniture',
    tagline: 'A chair for the dog, next to yours.',
    color: '#141210|#C2A98B',
    prep: 0,
    category: 'Pet goods',
    instagram: 'seatmatechairs',
    site: 'https://seatmate.shop/',
    /*
      THE SAME CHAIR COSTS FIVE DIFFERENT AMOUNTS depending on its colour —
      $200 to $299 — and the "was" price is $400 for four of them and $425 for
      the grey. Their site gives no reason. Only the in-stock colourways are
      listed here.

      NINETEEN SPARE-PART SKUS ARE NOT LISTED, deliberately. They sit in the
      store's product feed, are absent from its own sitemap and 404 on the
      storefront, and ten of them are priced at zero — back-office warranty
      parts, not things anybody can buy. Putting them on a page would invent a
      shop that does not exist.

      Their About page renders its heading and no words at all. Worth a mention.
    */
    items: [
      ['Pet Office Chair — Black Faux Fur', '', 26500],
      ['Pet Office Chair — Grey Faux Fur', '', 26000],
      ['Pet Office Chair — Black Bouclé', '', 26000],
      ['Split Ottoman Dog Ramp', 'Black, grey or tan bouclé.', 15000],
      ['Replacement Seat — Black Bouclé', '', 9900],
    ],
    offer: [
      'Pet Office Chair — Black Faux Fur',
      'Pet Office Chair — Black Bouclé',
      'Split Ottoman Dog Ramp',
    ],
  },
  {
    slug: 'houndsy',
    name: 'Houndsy',
    label: 'Houndsy',
    cuisine: 'Kibble dispenser',
    tagline: 'Mid-century kibble storage that pours.',
    color: '#171310|#B98A5A',
    prep: 0,
    category: 'Pet goods',
    instagram: 'houndsyofficial',
    site: 'https://www.houndsy.com/',
    /*
      NO ADDRESS AND NO PHONE, and that is not an omission here — they publish
      neither, anywhere. Contact page, about, terms, refunds, shipping, footer:
      an email address and a form, and nothing else. Their own site does not
      say what city they are in.

      UNUSUALLY, THE FLAGSHIP IS NOT DISCOUNTED. Both dispensers are at list
      with no compare-at, which is the opposite of the other two brands on this
      sheet.

      WHAT YOU CAN ACTUALLY BUY IS THINNER THAN THE CATALOGUE. Every Oak,
      Walnut and solid-black Furniture Series variant is sold out; two of the
      Water Bowl configurations are gone, which is why its real entry price is
      $56.25 and not the $45 the page implies. The Smart Kibble Sensor sold out
      inside a week and is not listed here.
    */
    email: 'hello@houndsy.com',
    items: [
      ['Kibble Dispenser — Essential Series', '', 17900],
      ['Kibble Dispenser — Furniture Series', 'Black and walnut, or white and walnut.', 24500],
      ['Water Bowl', 'From, cheapest in stock.', 5625],
      ['Silicone Mat', '', 5000],
      ['Kibble Dispenser Legs', '', 2500],
      ['Stainless Steel Pet Bowls', 'Any of seven sizes.', 2000],
    ],
    offer: [
      'Kibble Dispenser — Essential Series',
      'Kibble Dispenser — Furniture Series',
      'Water Bowl',
      'Silicone Mat',
    ],
  },
  {
    slug: 'the-company-barber',
    hours: 'Mon–Sun 9am–5:30pm (Sunday varies)',
    name: 'The Company Barber',
    label: 'Company Barber',
    cuisine: 'Barbershop',
    tagline: 'Fades and straight-razor shaves, two shops.',
    color: '#131313|#B08A4A',
    prep: 0,
    category: 'Barber and salon',
    phone: '(510) 894-3432',
    address: '3833 Peralta Blvd, Suite D, Fremont, CA 94536',
    email: 'thecompanybarber@gmail.com',
    instagram: 'thecompanybarber',
    site: 'https://www.thecompanybarber.com/',
    /*
      HIS TWO CITIES WERE RIGHT — "Fremont • Services / Union city • Services".
      They run two shops, and their own site tags each barber with the one they
      cut at. Peralta Blvd is Fremont, Whipple Rd is Union City; the pages sit
      on both, and the pair must never be swapped.

      NO PRICES, AND THAT IS A BUG ON THEIR SIDE RATHER THAN A CHOICE. Their
      Services page embeds a Schedulicity widget whose host does not resolve in
      DNS at all, so the page renders a heading and nothing under it. They are
      mid-migration to Vagaro and the old booking host is gone. That is worth
      telling them: their services page has been blank for anyone who visits.

      CASH ONLY, in their own shop policy. Worth saying before somebody drives
      to Fremont.

      They also disagree with themselves about their own awards — the homepage
      claims Best Barber Shop in Fremont 2024 and 2025, the About page says
      2024, 2025 and 2026 — so no award is repeated here.
    */
    quoteOnly:
      'A barbershop with two rooms, Fremont and Union City: fades, skin fades, tapers, lineups, beard trims and straight-razor shaves. Nine-thirty to half five, most days. Cash only, and they publish no prices.',
    panels: [
      {
        head: 'Both shops',
        body: [
          'Fremont — 3833 Peralta Blvd, Suite D, (510) 894-3432',
          'Union City — 1842 Whipple Rd, (510) 300-6793',
          'Monday to Sunday, 9am to 5:30pm. Their own note: hours move with barber availability, and Sunday varies.',
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'screen-king',
    hours: 'Mon–Fri 9am–5pm, Sat by appointment, closed Sun',
    name: 'Screen King',
    label: 'Screen King',
    cuisine: 'Window screens',
    tagline: 'Custom window and door screens, Brentwood.',
    color: '#101418|#C9CDD2',
    prep: 0,
    /*
      NOT PHONE SCREENS. The name invites the wrong guess and the services
      sheet has a phone-repair seat that would have been the easy mistake:
      these are custom WINDOW and DOOR screens, cut and built at their own
      shop. There is no screens category, so they take the handyman seat, which
      is the nearest honest thing on the sheet.
    */
    category: 'Handyman and home repair',
    phone: '(925) 301-3240',
    address: '580 Valdry Ct, Suite D9, Brentwood, CA 94513',
    email: 'ScreenKingsMobile@gmail.com',
    instagram: 'screenking_bayarea',
    site: 'https://www.screenkingmobile.com/',
    /*
      A REAL SHOP, AND NOT A MOBILE ONE — despite the domain. Their site says
      the screens are "100% made at our shop" and invites you to visit; the
      word MOBILE appears only as the label on a second phone line and inside
      the business name. Nothing on their site says they come to you, so
      nothing here says it either. They do list seventeen cities they serve.

      NO PRICES ANYWHERE: everything is a free estimate by phone or email.

      Their own email is ScreenKingsMobile@gmail.com — with an S — while the
      domain is screenkingmobile.com without one. Easy to mistype either way.
    */
    quoteOnly:
      'Custom window screens, screen doors, re-screening, patio sliders and pet doors, cut and built at their own shop in Brentwood and fitted across seventeen East Bay cities. Licensed and insured, number 036056. Every job is quoted from a free estimate.',
    items: [],
  },
  {
    slug: 'sweetest-sound',
    hours: 'Wed–Sat 5pm–2am',
    name: 'Sweetest Sound',
    label: 'Sweetest Sound',
    cuisine: 'Dessert bar',
    tagline: 'Ice cream and boozy sundaes, Mission District.',
    color: '#1A1020|#E86FA6',
    prep: 0,
    /*
      HE FILED IT "San Francisco • Goods" AND IT IS NOT REALLY GOODS. In their
      own words it is "a design-driven ice cream and boozy dessert concept by
      DMP, found inside Soundtrack" — a dessert and cocktail room, not a shop
      selling a product. Ice cream is the closest honest seat and it is a fair
      one, since hand-scooped ice cream is genuinely what they serve; the
      San Francisco ice cream seat is Polly Ann's, so this takes a free number.
    */
    category: 'Ice cream shop',
    address: '3192 16th St, San Francisco',
    site: 'https://www.poweredbydmp.com/sweetest-sound',
    needsSite: true,
    /*
      NO SITE OF THEIR OWN — a sub-page of their parent's, which is why it
      carries needsSite.

      NO ZIP, ON PURPOSE. Their page publishes the street and the district and
      no postal code, and their own address block omits it. Not filled in here.

      THE PHONE NUMBER ON THEIR PAGE IS SOUNDTRACK'S, not theirs — it sits
      inside a structured-data block whose name is literally "Soundtrack" — so
      it is not printed here as though it reached them.

      AND THE BIGGER THING TO TELL HIM: this page is a barely-edited copy of
      the Soundtrack page. Its machine-readable data is Soundtrack's verbatim,
      its logo alt text reads "Soundtrack SF logo", and every photograph is a
      Soundtrack interior. Sweetest Sound and Soundtrack are the same room. If
      Soundtrack is ever sent as its own business, these two must not become
      two tiles for one address.

      The $400 is a floor for hiring the room, in their words "Starting from
      $400 for 4 hours" — not the price of anything you eat. They publish no
      menu prices at all.
    */
    quoteOnly:
      'An ice cream and boozy dessert room inside Soundtrack, in the Mission: hand-scooped scoops, shakes, sundaes and halo-halo with a Make It Boozy upgrade, DJs from ten. Wednesday to Saturday, five till two. No menu prices are published.',
    groups: [
      {
        name: 'Hiring the room',
        items: [
          ['Private event', 'Four hours. Their floor; it moves with the date.', 40000, 'from $400'],
        ],
      },
    ],
    items: [],
  },
  {
    slug: 'co-ba',
    hours: 'Sun–Thu 9am–10:30pm, Fri–Sat 9am–11pm',
    /* Their diacritics, which are the name. The legal entity in their footer
       is the undiacriticked CO BA HOUSE CORPORATION; the cafe is Cô Ba. */
    name: 'Cô Ba',
    label: 'Cô Ba',
    cuisine: 'Vietnamese desserts',
    tagline: 'Pandan waffles, chè and coffee on North First.',
    color: '#14100C|#D8A657',
    prep: 0,
    category: 'Bakery',
    phone: '(408) 708-7671',
    address: '3730 N First Street, Suite 110, San Jose, CA 95134',
    email: 'contact@cobacafe.biz',
    instagram: 'cobacafesj',
    site: 'https://cobacafe.biz/',
    /*
      NO ITEM PRICES. Their menu lives on Toast and their own site publishes
      only a range — $6.50 to $21.50 — inside its structured data. A range is
      not a price list, so nothing is itemised here.

      THE NUMBER IN THEIR MACHINE-READABLE DATA IS AN OREGON ONE. Their footer
      prints (408) 708-7671 three times; their JSON-LD carries a 503 number.
      Anything reading their markup rather than their page — a search engine,
      a directory — gets the wrong number. The visible one is used here and it
      is worth telling them.
    */
    quoteOnly:
      'A Vietnamese dessert cafe on North First in San Jose: chè, pandan waffles, tea and coffee, in their own words made with traditional flavours. Nine in the morning until half ten, later at weekends. Their prices are on Toast, not on their own site.',
    items: [],
  },
  {
    slug: 'persian-kabobs',
    hours: 'Mon–Thu 10:45am–8:30pm, Fri–Sat to 9:30pm, Sun to 9pm',
    name: 'Persian Kabobs',
    label: 'Persian Kabobs',
    cuisine: 'Persian',
    tagline: 'Flame-grilled kabobs and saffron rice, Cupertino.',
    color: '#141014|#C9873A',
    prep: 0,
    category: 'Mediterranean',
    /* Two numbers, both visitor-facing: every footer says 669-291-6697 and
       the Visit Us page says (408) 257-1900. The local one is printed here
       and the discrepancy is theirs to settle. */
    phone: '(408) 257-1900',
    address: '7335 Bollinger Rd, Cupertino, CA 95014',
    email: 'zamarexinc@gmail.com',
    site: 'https://www.persiankabobs.com/',
    /*
      NO PRICES. Their menu page renders in the browser and serves no item
      names or prices in its HTML at all — a hundred and twenty-five items
      exist behind it and none of them is readable.

      NOTHING ON THIS PAGE REPEATS THEIR REVIEWS, AND THAT IS DELIBERATE. Two
      of the three five-star testimonials on their own site are the site
      builder's placeholder text, live in production: "Use this space to share
      a testimonial quote about the business..." — signed "Dan C." and
      "Linda S." under a heading that reads "Reviews on Google". Whatever that
      is, it is not a review, and a directory that repeated it would be
      publishing a fabricated one under a real restaurant's name. Their header
      still carries "Sample Text" and lorem ipsum too. All of it is worth
      telling them, kindly: it reads as carelessness rather than intent.
    */
    quoteOnly:
      'A Persian kitchen on Bollinger Road in Cupertino doing flame-grilled kabobs, stews and saffron rice. Their menu is published without prices, so none are listed here.',
    items: [],
  },
  {
    slug: 'eat-more-pho',
    name: 'Eat More Pho',
    label: 'Eat More Pho',
    cuisine: 'Vietnamese',
    tagline: 'Pho on El Camino Real.',
    color: '#12120E|#C4553A',
    prep: 0,
    category: 'Asian food',
    address: '1066 E El Camino Real, Sunnyvale, CA 94087',
    site: 'https://order.toasttab.com/online/eat-more-pho-em-1066-e-el-camino-real',
    needsSite: true,
    /*
      HE FILED THIS AS SAN JOSE AND THE ADDRESS IS IN SUNNYVALE. 1066 E El
      Camino Real is a Sunnyvale address; it sits on the Sunnyvale page. Worth
      confirming with him, since he may have meant a different branch.

      ALMOST NOTHING HERE IS FIRST-PARTY, AND THAT IS THE POINT. They have no
      website: eatmorepho.com and half a dozen variants do not resolve at all,
      and the only link he had was a Toast ordering page. Toast sits behind a
      bot check that refuses everything, its sitemap included, so no menu, no
      prices, no hours, no phone and no artwork could be read from anywhere
      they publish. Only the name and the street — which is in the ordering
      URL itself — are used.

      THE STRONGEST WEBSITE PROSPECT ON THIS RUN. A restaurant whose entire
      web presence is somebody else's ordering page is exactly what he sells.
    */
    contactOnly:
      'They have no website of their own — only a Toast ordering page, which is where the menu and the prices are. Nothing is repeated here that they have not published somewhere we can read.',
    items: [],
  },
  {
    slug: 'hella-good-burger',
    hours: 'Daily from 11am — to 9pm Mon–Tue, 9:30pm Wed–Thu & Sun, 11:30pm Fri–Sat',
    /* ALL CAPS, in their logo, their title and every heading. He filed them as
       "Hella Good SJ", which is their domain rather than a name they use. */
    name: 'HELLA GOOD BURGER',
    label: 'Hella Good',
    cuisine: 'Burgers',
    tagline: 'Burgers, fried chicken and soft serve, downtown San Jose.',
    color: '#141414|#E8B33A',
    prep: 0,
    category: 'Burgers and hot dogs',
    address: '87 N. San Pedro St., San Jose, CA 95110',
    instagram: 'hellagoodburger',
    site: 'https://www.hellagoodsj.com/',
    /*
      NO PRICES AND NO PHONE. Their menu page describes eighteen items in full
      and prices none of them — that is deferred to Toast — and they publish no
      number at all.

      Their own hours block misspells Wednesday, on two pages. Not repeated.
    */
    items: [],
    orderUrl: "https://order.toasttab.com/online/hellagoodburger",
    /* Their published menu, read from the Toast ordering page their site links to on 2026-09-09; sections as they publish them. */
    sections: [
      { name: "Burgers", items: [
        ["Hella Good Hamburger", "1/4 pound Brandt Beef Patty, secret sauce, house pickles, red onion, lettuce, and tomato", 1250],
        ["Hella Good Cheeseburger", "1/4 pound Brandt Beef Patty, cheddar cheese, secret sauce, house pickles, red onion, lettuce, and tomato", 1350],
        ["Hella Insane Burger", "2 x 1/4 pound Brandt Beef Patty = 1/2 pound, double the cheddar cheese, secret sauce, house pickles, red onion, lettuce, and tomato", 1550],
        ["Hella Smashed Burger", "two Brandt smashed patties totaling 1/3 pound, cheddar cheese, secret sauce, grilled red onions, house pickles", 1450],
        ["Hella Veggie Burger", "House made falafel patty, black garlic aioli, house pickles, house slaw", 1350],
      ]},
      { name: "Fried Chicken", items: [
        ["Hella Classic Chicken", "buttermilk fried chicken breast, secret sauce, house pickles and slaw", 1375],
        ["Hella Kickin Chicken", "buttermilk fried chicken breast, sriracha aioli, house pickles and slaw", 1425],
        ["Hella Hot Chicken", "buttermilk fried chicken breast, nashville hot sauce, house pickles and slaw", 1425],
        ["Hella Chicken Tenders", "Buttermilk fried strips of chicken breast with fries and a choice of dipping sauce", 1500],
        ["Hella Tossed Tenders", "buttermilk fried strips of chicken breast tossed in Nashville hot sauce, fries and choice of dipping sauce", 1650],
      ]},
      { name: "Sides", items: [
        ["Hella Skinny Fries", "Our signature skinny fries", 425],
        ["Hella Garlic Fries", "Our skinny fries topped with hella garlic and parmesan cheese mix", 625],
        ["Hella Tater Tots", "Potato tots cooked to crispy perfection", 525],
        ["Hella Garlic Tots", "Tots topped with hella garlic and parmesan cheese mix", 725],
        ["Hella Dirty Tots", "Liquid Gold, bacon bits, grilled red onions, secret sauce", 1125],
      ]},
      { name: "Sauces", items: [
        ["Sauce Trio", "Our hella secret sauce, sriracha aioli, and cilantro ranch", 250],
      ]},
      { name: "Shakes", items: [
        ["Banana Shake", "Pure banana puree mixed with Straus Organic Vanilla soft serve and whole milk", 875],
        ["Strawberry Shake", "Pure strawberry puree mixed with Straus Organic Vanilla soft serve and whole milk", 875],
        ["Chocolate Shake", "Hershey chocolate syrup mixed with Straus Organic Vanilla soft serve and whole milk", 875],
        ["Vanilla Shake", "Made with Straus Organic soft serve and whole milk", 875],
      ]},
      { name: "Sodas", items: [
        ["Jones Soda", "", 325],
        ["Bottled Water", "", 325],
      ]},
      { name: "Jones Floats", items: [
        ["Orange Cream Float", "", 675],
        ["Cola Float", "", 675],
        ["Root Beer Float", "", 675],
      ]},
    ],
  },
]
