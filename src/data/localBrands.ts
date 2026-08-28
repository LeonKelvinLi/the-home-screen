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
  /** name, description, cents, and the basename of a vendor-supplied photo in /food. */
  items: [string, string, number, string?][]
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
  clip?: { src?: string; poster?: string; href?: string; credit: string; platform?: string }
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
    contactOnly:
      'Family-run Isan Thai \u2014 their own words: from our family table to yours. Their menu has not been researched yet, so nothing is priced here; their site is the place to order until it is.',
    items: [],
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
    clip: { href: 'https://www.instagram.com/reel/DV7TYKVCGdl/', credit: 'Filmed by The Yard', platform: 'Instagram' },
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
    siteNote: 'Their site is still a placeholder. Instagram is where they post.',
    address: '1323 Sunnyvale Saratoga Rd, Sunnyvale',
    contactOnly:
      'A walk-up counter, so there is nothing to order here. They publish no menu and no prices anywhere \u2014 not on their site, which is still a placeholder, and not on Instagram \u2014 so rather than guess at them, this lists where they are and when they are open. Open Monday to Thursday noon to 11pm, and Friday to Sunday noon to midnight. They say they are the first in Sunnyvale to put soft serve and Italian ice in the same cup.',
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
    clip: { href: 'https://www.instagram.com/reel/DbmH3wLFV9U/', credit: 'Filmed by Tequila\u2019s Taqueria', platform: 'Instagram' },
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
    offer: ['Combo 1', 'Combo 2', 'Bowl'],
    siteNote: 'Order direct at jojoshotchicken.com — pick the Branham location.',
    items: [
      ['Combo 1', '2 sliders, fries and a side of Jojo sauce', 1699],
      ['Combo 2', '2 tenders, toast, fries and a side of Jojo sauce', 1499],
      ['Combo 3', '1 slider, 1 tender, fries and a side of Jojo sauce', 1599],
      ['Halftime', '1 slider or tender with fries and Jojo sauce', 1199],
      ['Bowl', 'Seasoned fries with chopped chicken, Jojo sauce, pickles and coleslaw', 1499],
      ['Slider', 'One hand-breaded chicken slider', 799],
      ['Tender', 'One hand-breaded chicken tender', 599],
      ['Fries', 'Seasoned fries', 599],
      ['Slaw', 'Coleslaw', 399],
      ['Pickles', 'House pickles', 299],
      ['Banana Pudding', 'House banana pudding', 599],
      ["Cookies N' Cream Pudding", 'House cookies and cream pudding', 599],
      ['Fountain Drink', 'Fountain soda', 299],
    ],
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
    offer: ['Baco Cheeseburger', 'Bicol Express Pork & Shrimp', 'TLC Veggie'],
    siteNote: 'See their full menu and order direct at thelumpiacompany.com',
    items: [
      ['Baco Cheeseburger', 'Ground beef, smoked bacon, cheddar, onions, BBQ and moo moo sauce', 1400, 'lumpia-baco-cheeseburger'],
      ['Chicken Tinola', 'Ground chicken, chayote, ginger, jalapeño, spinach, shoyu aioli', 1300],
      ['Bicol Express Pork & Shrimp', 'Spicy coconut pork and shrimp, Shanghai style, sweet chili', 1300, 'lumpia-bicol-express'],
      ["Earl's Turkey & Veggies", 'Ground turkey, cabbage, carrots, potatoes, peas, sweet chili', 1300],
      ['TLC Veggie', 'Chopped kale, roasted potatoes, roasted garlic and mushrooms', 1200, '~lumpia-tlc-veggie'],
      ['Peach Mango Cobbler', 'Caramelised peach and mango, jackfruit, cinnamon wonton strips', 1200],
      ['Adobo Seasoned Wings', 'Six twice-fried jumbo wings in secret dry adobo seasoning', 1500, 'lumpia-adobo-wings'],
      ['Filipino BBQ Wings', 'Six twice-fried jumbo wings, Filipino BBQ sauce, ranch', 1500, 'lumpia-bbq-wings'],
      ['Butter Garlic Shrimp Pancit', 'Pancit noodles with butter garlic shrimp', 1500],
      ['Filipino Mac-Ghetti', 'Cheese mac, Filipino sweet spaghetti sauce, ground beef, cheddar', 600, 'lumpia-macghetti'],
    ],
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
    offer: ['Mince & Cheese Pie', 'Beef Stew Pie', 'Smoked Brisket Pie'],
    siteNote:
      'Discover more favorites and even order frozen pies shipped directly to your door by visiting bulapiesfiji.com',
    items: [
      ['Beef Stew Pie', 'Tender ground beef, peas, carrots and potatoes', 1000, 'bula-beef-stew'],
      ['Butter Chicken Pie', 'Creamy buttery sauce with a hint of heat', 1100, 'bula-butter-chicken'],
      ['Homestyle Chicken', 'Tender chicken and broccoli in a flaky crust', 1000],
      ['Mince & Cheese Pie', 'Minced meat and melted cheese, the softest cheeseburger', 1000, 'bula-mince-cheese'],
      ['Smoked Brisket Pie', 'Smoked brisket with savoury seasonings', 1200],
      ['Jamaican me Hungry Pie', 'Chicken marinated in bold jerk spice', 1100],
      ['Pork Sausage Roll', 'Homemade pork sausage in buttery flaky pastry', 500],
      ['Lamb Sausage Roll', 'Homemade lamb sausage in buttery flaky pastry', 500],
      ['Chocanana Pie', 'Fudgy chocolate banana centre with Nutella', 1000],
      ['Pineapple Pie', 'Caramelised pineapple with cinnamon', 1000],
      ['Banana Pudding Trifle', 'Creamy banana trifle cake cup', 600],
      ['Latte', 'Espresso and steamed milk, 12oz', 425],
      ['Mocha', 'Espresso, dark chocolate, steamed milk, whipped cream', 475],
      ['Kumquat Limemade', 'Homemade, sweetened with organic cane sugar', 350, 'bula-kumquat'],
      ['Nitro Cold Brew', 'Nitro-infused cold brew', 425],
    ],
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
    offer: [
      'Italian Cold Cut',
      'Mortadella & Brie',
      'Ham & Burrata',
      'Meatball Sub',
      'Italian Dip',
    ],
    siteNote: 'Pre-order sandwiches direct at paulosausageco.com',
    items: [
      ['Italian Cold Cut', 'Classic Italian cold cut sandwich', 2000, '~paulo-italian-cold-cut'],
      ['Mortadella & Brie', 'Rich mortadella with brie', 1650, '~paulo-mortadella-brie'],
      ['Ham & Burrata', 'Ham with burrata', 1600, '~paulo-ham-burrata'],
      ['Meatball Sub', 'Hearty classic meatball sub', 1550, '~paulo-meatball-sub'],
      ['Salami & Stuffed Pepperoncini', 'Savoury salami with stuffed pepperoncini', 1550],
      ['Italian Dip', 'Italian dip sandwich', 1500, '~paulo-italian-dip'],
      ['Italian Smash', 'Smash burger, Italian style', 1700],
      ['Meat Lasagna', 'Scratch-made', 2200],
      ['Sausage & Peppers', 'Their own sausage with peppers', 2200],
      ['Hot Italian Meatballs', 'Hot Italian meatballs', 1800],
    ],
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
    orderUrl: 'https://order.toasttab.com/online/pippal-dublin-4500-tassajara-rd-unit-c',
    address: '4500 Tassajara Rd, Suite C, Dublin',
    // OPEN, despite a "coming soon" post still sitting on their grid — that
    // post is stale. Dine-in list prices from their own site's menu backend.
    offer: [
      'Live Chaat Tray',
      'Chicken Tikka Trio',
      'Lamb Chops',
      'Malai Kofta',
      'Mushroom Galouti',
    ],
    siteNote: 'See the full menu and book at pippaldublin.com',
    items: [
      ['Lamb Chops', 'Juicy lamb chops marinated in yogurt and spices', 3200, '~pippal-lamb-chops'],
      ['Malai Kofta', 'Koftas in rich cashew gravy', 2800, '~pippal-malai-kofta'],
      ['Live Chaat Tray', 'Regional Indian chaats with papadi and dhokla', 2700, '~pippal-live-chaat-tray'],
      ['Chicken Tikka Trio', 'Three tikka variations: classic, malai and more', 2200, '~pippal-chicken-tikka-trio'],
      ['Prawn Pepper Fry', 'Prawns tossed with black pepper and curry leaf', 2400],
      ['Mushroom Galouti', 'Mushroom mince kebab with brown cashew-apricot', 2000, '~pippal-mushroom-galouti'],
      ['Kolkata Fish Cutlet', 'Crispy fried fish with a nutty peanut-butter note', 2200],
      ['Andhra Fried Chicken', 'Spiced Andhra-style fried chicken', 2200],
      ['Chakri Paneer', 'Paneer roomali stuffed with saffron', 2000],
      ['Papad Sampler', 'Assortment of papadums with chutneys', 1400],
    ],
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
    email: 'leondragon3798@gmail.com',
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
    contactOnly:
      'Tacos, burritos, bowls, quesadillas and huarachitos — al pastor, carnitas, carne asada, camarón, pescado, pollo asado, and nopales and hongo for anyone off the meat. They publish the menu but not the prices, so nothing is priced here; ordering goes through their own site. A second location opened at City Center Bishop Ranch in San Ramon.',
    items: [],
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
    contactOnly:
      'Sisig Kapampangan and the Isla Ultimate Boodle Fight, from a kitchen whose chef was born and raised in Pampanga. The Pleasant Hill room is Isla Grand Restaurant Bar & Banquet and takes event bookings. They publish no prices, so nothing is priced here.',
    items: [],
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
    contactOnly:
      'A Santa Clara donut shop, in their own words: take a step back in time. They publish no prices, so nothing is priced here \u2014 their site is where to order until they do.',
    items: [],
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
    contactOnly:
      'Modern Indian in San Ramon, with a vegetarian-forward menu their own site says is never an afterthought, and a bar built on Indian whiskies and gins, spice infusions and pickled elements. Lunch, dinner and private events. They publish no prices, so nothing is priced here \u2014 order or book on their own site.',
    items: [],
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
      href: 'https://www.youtube.com/watch?v=6xSaVABbB9s',
      platform: 'YouTube',
      credit: 'The video from their own Instagram bio.',
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
      href: 'https://www.instagram.com/reel/DcckUJ9zv_g/',
      platform: 'Instagram',
      credit: 'Their reel, on Instagram.',
    },
    items: [],
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
      href: 'https://www.instagram.com/reel/Dbq3kjRPWEg/',
      platform: 'Instagram',
      credit: 'Their reel, on Instagram.',
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
    tagline: 'Ilocos empanada and tacos, Concord.',
    color: '#0E0E0E|#C9A227',
    prep: 0,
    category: 'Filipino',
    phone: '',
    /* THEIR INSTAGRAM IS THE LINK, and `needsSite` keeps them on his red-outline
       list anyway. Without a link the page told people to go to their Instagram
       and gave them no way to get there; without the flag, pointing at a social
       profile would have quietly taken them off the list he prospects from —
       and he sent them precisely because they need a website. */
    site: 'https://www.instagram.com/papiclaryskitchen/',
    siteCta: 'See their Instagram',
    needsSite: true,
    address: '2186 Solano Way, Concord, CA',
    contactOnly:
      'Chef Clary cooks Ilocos empanada, birria and adobo out of Solano Way in Concord, and caters parties. Open Wednesday to Saturday, 11am to 9:30pm; closed Monday and Tuesday. They have no website and publish no dish prices, so nothing is priced here \u2014 their Instagram is where to reach them.',
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
    contactOnly:
      'Mediterranean cooking on Main Street in downtown Pleasanton — kabobs, vegetarian dishes, cocktails and a wine list — open seven days, 11:30am to 9pm, with social hour every day from 2pm to 5pm. Their own menu page has not been finished, so no dish is priced here. Call them or book a table.',
    items: [],
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
    clip: {
      href: 'https://www.instagram.com/reel/DcBzdqRteQZ/',
      credit: 'Posted by P-Lo',
      platform: 'Instagram',
    },
    contactOnly:
      'A Bay Area rapper and producer. His own site is still largely the template it was built from — the contact details on it are Squarespace’s placeholders, not his — so only his music and shows are pointed to here. BEASTY has not spoken to him yet: this spot is held, not taken.',
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
    contactOnly:
      'A family-owned pizzeria on Clayton Road in Concord, making pizza with halal meats, open seven days — 11am to 10pm, and to midnight on Friday and Saturday. Their menu and prices live on their Toast ordering page, which blocks the tools used to build this page, so rather than copy prices from a delivery app nothing is priced here.',
    items: [],
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
    siteCta: 'Order on their Square page',
    needsSite: true,
    siteNote: 'Second pickup counter at 1235 San Pablo Ave, Berkeley',
    menuNote: 'A few of theirs',
    quoteOnly:
      'A Vietnamese counter with two pickup locations — Telegraph Avenue in Oakland and San Pablo Avenue in Berkeley — doing phở and hủ tiếu, vermicelli bowls, bánh mì and rice plates. Pickup only; they publish no phone and no hours. These are their own prices, from their own store.',
    groups: [
      {
        name: 'Noodle soups',
        items: [
          ['Phở tái', 'Fresh sliced beef', 1450],
          ['Phở bò viên', 'Beef ball', 1450],
          ['Hủ tiếu gà xé', 'Shredded chicken', 1450],
        ],
      },
      {
        name: 'Bánh mì',
        items: [
          ['Grilled Pork', 'Their price', 1050],
          ['Lemongrass Beef', 'Their price', 1050],
          ['Grilled Shrimp', 'Their price', 1150],
        ],
      },
    ],
    items: [],
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
    menuNote: 'A few of theirs',
    quoteOnly:
      'A family-run halal Middle Eastern kitchen on Polk Street — shawarma wraps, kebabs, mezze and stews. Closed Tuesdays. These are their own published prices.',
    groups: [
      {
        name: 'Wraps',
        items: [
          ['Chicken Shawarma', 'Their price', 1500],
          ['Beef & Lamb Shawerma', 'Their price', 1600],
          ['Falafel', 'Their price', 1500],
        ],
      },
      {
        name: 'Mezze',
        items: [
          ['Hummus', 'Their price', 900],
          ['Baba Ghanouj', 'Their price', 1000],
          ['Muhamara', 'Their price', 1200],
        ],
      },
    ],
    items: [],
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
      href: 'https://www.instagram.com/reel/DH4_CuVuxm9/',
      credit: 'Posted by Kings West Coast Pizzeria',
      platform: 'Instagram',
    },
    menuNote: 'A few of theirs',
    quoteOnly:
      'A Brazilian-American pizzeria on Mission Street started by two brothers, open 11am to 10pm seven days — West Coast and Brazilian pizzas, dessert pizzas, pasta, wings and homemade flan. Their lunch special runs to 5pm on weekdays. These are their own published prices.',
    groups: [
      {
        name: 'Pizza',
        items: [
          ['Plain Cheese', 'From', 1499],
          ['Pepperoni', 'From', 1599],
          ['Calabresa', 'From', 2299],
          ['Chicken Catupiry', 'From', 2299],
        ],
      },
      {
        name: 'Dessert pizza',
        items: [
          ['Beijinho', 'From', 1999],
          ['Brigadeiro', 'From', 2299],
        ],
      },
    ],
    items: [],
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
]
