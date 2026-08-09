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
  site?: string
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
   * A clip of theirs for the page. See apps/BrandClip.tsx.
   *
   * `src` is footage they gave us, sitting on our origin, and plays inline.
   * `href` alone is a post on someone else's platform, which we cannot embed
   * and do not pretend to — it draws a card that says where it goes. `credit`
   * is required either way: it is their video, and whose it is gets said.
   */
  clip?: { src?: string; poster?: string; href?: string; credit: string; platform?: string }
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
    site: 'https://topdoghotdogs.com',
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
    tagline: 'Italian ice made fresh daily, and organic soft serve.',
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
    clip: { href: 'https://www.instagram.com/reel/DbYsH_viR_a/', credit: 'Filmed by Sin City Pits', platform: 'Instagram' },
    name: 'Sin City Pits',
    label: 'Sin City Pits',
    cuisine: 'Pitbull kennel and breeder',
    tagline: 'American Pitbull Terrier breeder in Las Vegas. Est. 2012.',
    color: '#B3131B|#1A1A1A',
    // No icon file. Their wordmark is published on their own site, which is
    // exactly why it is not reproduced here — redrawing a real business's mark
    // with an image model produces a convincing fake of it.
    icon: '',
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
    slug: 'bula-pies',
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
    offer: ['Beef Stew Pie', 'Butter Chicken Pie', 'Mince & Cheese Pie', 'Kumquat Limemade'],
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
    slug: 'elemonkey',
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
    slug: 'paulo-sausage',
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
    icon: '',
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
    icon: '',
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
]
