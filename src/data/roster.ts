import type { LocalSeed } from './localBrands'

/**
 * The operator's own rosters for the two flagship pages, exactly as he sent
 * them (a Notes screenshot, 2026-08-10): "BEASTY • GOODS" and "BEASTY •
 * SERVICES", twenty-four names each, numbered.
 *
 * His instruction, verbatim: "you can go ahead and start inputting these
 * businesses for each spot. If you don't have any information on some of them,
 * just leave it blank for now. I will gather it in due time. Just put their
 * business initials like you have been."
 *
 * So these are NAME-ONLY seeds. Nothing below claims a menu, a price, an
 * address or an agreement — each page says the operator is still gathering the
 * business's details. A name on his roster is a fact about his roster, not
 * about the business, and that is all the page asserts. The descriptor line is
 * lifted from the name itself ("general contractor", "barbershop") or left
 * empty; nothing is inferred beyond what he wrote.
 *
 * Names on the rosters that already exist as researched brands are NOT
 * duplicated here — the placement map seats the existing brand id in his spot.
 */

/** One shared explanation, so every roster page says the same honest thing. */
const ROSTER_NOTE =
  'This spot is reserved on the operator’s roster and he is still gathering the ' +
  'business’s details — nothing is listed yet, so nothing here is a claim about ' +
  'them. Check back.'

const seed = (
  slug: string,
  name: string,
  label: string,
  cuisine: string,
  color: string,
  extra?: Partial<LocalSeed>,
): LocalSeed => ({
  slug,
  name,
  label,
  cuisine,
  tagline: '',
  color,
  prep: 0,
  category: 'Roster',
  contactOnly: ROSTER_NOTE,
  items: [],
  ...extra,
})

/*
  Colours rotate through the app's own dark tile palette so a page of
  placeholders still looks like a page of apps rather than a grid of grey.
*/
export const ROSTER_SEED: LocalSeed[] = [
  // ---- from BEASTY • GOODS ----
  /* Their own about page: a skate shop on Polk St in San Francisco — apparel,
     skate goods, safety gear. His roster spells it Midnight; the shop spells
     it Midnite, and the shop wins. */
  seed('midnight-theories', 'Midnite Theories', 'Midnite Th…', 'Skate shop', '#1C1C2E', {
    icon: 'midnight-theories',
    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: '30% off any in-store purchase.',
      loyalty: '10% off your in-store purchase, any visit.',
    },
    /* The collections page, which is what he linked — it lands on what they
       actually sell rather than on a splash. */
    site: 'https://www.midnitetheories.com/collections/all',
    address: '1215 Polk St, San Francisco',
    logoTemplate: 'band', logoLines: ['MIDNITE', 'THEORIES'], logoFace: 'condensed',
  }),
  /*
    Filled out 2026-08-18 on a deadline of his: "I'm delivering to this
    restaurant tomorrow and I want to show him of a potential offer. Can you
    redo his icon and add his direction button."

    Everything here comes from their own Instagram profile and their own logo
    file, both of which he sent. It stays a roster seat — no menu or prices are
    republished — but it is no longer a bare placeholder, because the placeholder
    is what he would have been showing the owner.
  */
  seed('downtown-bbq', 'Downtown BBQ', 'Downtown BBQ', 'Barbecue', '#1E3055', {
    icon: 'downtown-bbq',
    logoTemplate: 'badge', logoGlyph: 'flame', logoLines: ['DOWNTOWN BBQ'], logoFace: 'slab',
    site: 'https://downtownbarbecue.co',
    address: '610 3rd St, Santa Rosa, CA',
    /*
      `src` as well as `href` now: the file is on our own origin so it can play
      behind their mark in the hero, and the link is kept so the card below
      still opens the real post — with sound, and with their caption and their
      follower count around it, which the muted loop cannot carry.
    */
    clip: {
      src: '/clips/downtown-bbq.mp4',
      poster: '/clips/downtown-bbq-poster.webp',
      href: 'https://www.instagram.com/reel/DYvfsi_TWcd/',
      credit: 'Filmed by Downtown Barbecue',
      platform: 'Instagram',
    },
    /*
      His mock-up, headed "Example:" in his own note, so it carries `mock` —
      he is showing the owner what an offer would look like, not reporting one
      the owner has agreed.

      "dessert" is spelled correctly here and "desert" in his note. That is the
      one edit: he is putting this in front of the owner tomorrow, and a
      misspelling on the pitch costs him more than the quote is worth.
    */
    offers: {
      mock: true,
      welcome: 'Get a FREE side & dessert with any $60+ meal purchase for your 1st visit!',
      loyalty: 'Get a FREE $8 side or dessert with any $40+ meal purchase on any visit!',
    },
    /* Replaces the generic roster note, which said he was still gathering their
       details — he has them now, and the page shows them. */
    contactOnly:
      'Dine-in, take out or delivery, 11am to 9pm daily, with happy hour from 3 to 6 — their ' +
      'own words. The menu and prices are on their site rather than repeated here.',
  }),
  seed('eat', 'EAT', 'EAT', '', '#2F2F31', {
    logoInitials: 'EAT', logoFace: 'slab',
  }),
  seed('smash-burgers-bros', 'Smash Burgers Bros', 'Smash Bros', 'Smash burgers', '#7A2E12', {
    logoTemplate: 'glyph-word', logoGlyph: 'burger', logoLines: ['SMASH'],
  }),
  seed('meadowlark-dairy', 'Meadowlark Dairy', 'Meadowlark', 'Drive-thru dairy', '#1F5FA6', {
    icon: 'meadowlark-dairy',
    /* The badge carries their NAME, not the date. 1919 is real and on their own
       site, but a mark reading only "EST. 1919" states a fact about them while
       the page underneath says we are claiming nothing about them. */
    logoTemplate: 'badge', logoGlyph: 'softserve', logoLines: ['MEADOWLARK'], logoFace: 'slab',
    site: 'https://meadowlarkdairy.com/',
    phone: '(925) 846-2261',
    address: '57 W Neal St, Pleasanton',
  }),
  seed('harumi-ayce', 'Harumi', 'Harumi', 'All-you-can-eat', '#8E1119', {
    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: '$10 off each all-you-can-eat, no limit on your first visit.',
      loyalty: 'A free can of soda with any purchase, any visit.',
    },
    site: 'https://www.yelp.com/biz/harumi-sushi-and-hibachi-livermore',
    logoTemplate: 'band', logoLines: ['HARUMI', 'AYCE'],
  }),
  seed('lucky-seven', 'Lucky Seven', 'Lucky Seven', '', '#B3131B', {
    logoInitials: '7', logoFace: 'slab',
  }),
  // ---- from BEASTY • SERVICES ----
  seed('roman-trailer-iron', 'Roman Trailer & Iron Work', 'Roman Iron', 'Trailer and iron work', '#3B3B3F', {
    logoTemplate: 'band', logoLines: ['ROMAN', 'IRON WORK'], logoFace: 'condensed',
  }),
  seed('lucky-barbershop', 'Lucky Barbershop', 'Lucky Barber', 'Barbershop', '#14532D', {
    /* Script over a small-caps line — the classic barbershop pairing. */
    logoTemplate: 'wordmark', logoLines: ['Lucky', 'BARBERSHOP'], logoFace: 'script',
  }),
  seed('frank-jr-english', 'Frank Jr. English', 'Frank Jr.', 'General contractor', '#4B3A2A', {
    logoInitials: 'FJ', logoFace: 'slab',
  }),
  seed('paintgo', 'PaintGo', 'PaintGo', 'Painting', '#1F6FB2', {
    logoTemplate: 'glyph-word', logoGlyph: 'design', logoLines: ['PAINTGO'],
  }),
  seed('ubreakifix', 'uBreakiFix', 'uBreakiFix', 'Device repair', '#0E7A5F', {
    icon: 'ubreakifix',
    logoInitials: 'uB',
    site: 'https://www.ubreakifix.com/locations/elcerrito',
    /* No Richmond store exists; the nearest is El Cerrito, on Richmond's
       border, from the chain's own locator. */
    address: '210 El Cerrito Plaza, El Cerrito',
    phone: '(510) 570-2863',
  }),
  seed('marina-bay-media', 'Marina Bay Media', 'Marina Bay', 'Media', '#0F3B57', {
    icon: 'marina-bay-media',
    site: 'https://www.marinabaymedia.com/',
    logoTemplate: 'band', logoLines: ['MARINA BAY', 'MEDIA'], logoFace: 'condensed',
  }),
  seed('german-auto-sport', 'German Auto Sport', 'German Auto', 'Auto repair', '#22262B', {
    logoTemplate: 'badge', logoLines: ['GERMAN AUTO'], logoFace: 'condensed',
  }),
  seed('bob-valentines-electric', "Bob Valentine's", "Bob Valentine's", 'Electrician', '#B36A00', {
    logoTemplate: 'wordmark', logoLines: ['BOB', 'VALENTINE\u2019S'], logoFace: 'slab',
  }),
  seed('high-tech-car-audio', 'High Tech Car Audio', 'High Tech', 'Car audio', '#232A5C', {
    logoTemplate: 'band', logoLines: ['HIGH TECH', 'CAR AUDIO'], logoFace: 'condensed',
  }),
  /*
    ROCKIN' JUMP, not "Rock n' Jump". The operator's roster has the second
    spelling; the business is a national trampoline-park franchise trading as
    Rockin' Jump with a Concord location, and rocknjump.com does not resolve
    while rockinjump.com does. The same rule already applied one entry above
    for Midnite Theories: where his note and the business disagree about the
    business's own name, the business wins. No band mark — a generated lockup
    of a franchise's name is theirs to make, not ours.
  */
  seed('rock-n-jump', "Rockin' Jump", "Rockin' Jump", 'Trampoline park', '#7A1FA2', {
    logoInitials: 'RJ',
  }),
  seed('dj-rev-roc', 'DJ Rev ROC', 'DJ Rev ROC', 'DJ', '#141416', {
    logoInitials: 'DJ', logoFace: 'condensed', logoAccent: '#f6d800',
  }),
  seed('pet-show-grooming', 'Pet Show Grooming', 'Pet Show', 'Mobile pet grooming', '#0E6B6B', {
    logoTemplate: 'badge', logoLines: ['PET SHOW'], logoFace: 'slab',
  }),
  seed('dr-comics-mr-games', 'Dr. Comics and Mr. Games', 'Dr. Comics', 'Comics and games', '#5C2A83', {
    /* Slab ran 103 units wide in a 100-unit tile; condensed fits. */
    logoTemplate: 'band', logoLines: ['DR. COMICS', 'MR. GAMES'], logoFace: 'condensed',
  }),
  seed('rosebary-car-care', 'Rosebary Car Care', 'Rosebary', 'Car care', '#6B1D2A', {
    logoTemplate: 'badge', logoLines: ['ROSEBARY'], logoFace: 'slab',
  }),
  /*
    NO WORDMARK HERE, deliberately. The band read "SHIN / INJURY LAW", which is
    a trading name this practice does not use — the operator's roster says
    "ANDREW SHIN injury, attorney" and nothing more. Attorney trade names are
    regulated in California, and a generated lockup of an invented firm name is
    the worst version of the mark problem: it looks like their branding and it
    names a business that does not exist. Initials only until he confirms how
    the practice actually trades.
  */
  seed('andrew-shin-law', 'Andrew Shin', 'Andrew Shin', 'Injury attorney', '#26323F', {
    logoInitials: 'AS', logoFace: 'slab',
  }),
  seed('winter-white-carwash', 'Winter White Car Wash & Detail', 'Winter White', 'Mobile car wash', '#274B77', {
    icon: 'winter-white-carwash',
    /* The domain the operator sent is their SUPPLIES store; the wash service
       itself lives at winterwhitecarwash.com, so the tile links the service. */
    site: 'https://winterwhitecarwash.com/',
    phone: '(385) 222-6186',
    logoTemplate: 'band', logoLines: ['WINTER', 'WHITE'], logoAccent: '#BFE3FF',
  }),
  seed('inter-chiro', 'Inter Chiro', 'Inter Chiro', 'Chiropractor', '#155E75', {
    logoFace: 'slab',
  }),
  seed('george-pro-landscape', 'George Professional Landscape', 'George Landsc…', 'Landscaping', '#2F5D33', {
    logoTemplate: 'glyph-word', logoGlyph: 'leaf', logoLines: ['GEORGE'], logoFace: 'slab',
  }),
  seed('rene-custom-cabinetry', 'Rene Custom Cabinetry', 'Rene Cabinetry', 'Custom cabinetry', '#5B4632', {
    logoTemplate: 'wordmark', logoLines: ['RENE', 'CABINETRY'], logoFace: 'slab',
    /* The one detail his roster carried: a phone number, his own note. */
    phone: '(510) 754-1927',
    contactOnly:
      'On the operator’s roster. The number here is from his own note — the rest of ' +
      'the business’s details are still being gathered, so nothing else is listed yet.',
  }),
  // ---- sent separately with placements ----
  seed('jdi-auto-detailing', 'JDI Auto Detailing', 'JDI Detailing', 'Mobile auto detailing', '#1B2B45', {
    logoTemplate: 'wordmark', logoLines: ['JDI', 'DETAILING'], logoFace: 'condensed',
    site: 'https://jdidetailing.com/',
    contactOnly:
      'Mobile detailing based in Brentwood — their own Instagram describes premium mobile ' +
      'detailing, ceramic coatings and paint enhancement. The operator is gathering the rest; ' +
      'nothing more is listed yet.',
  }),
  seed('jnw-detailing', 'J&W Mobile Detailing', 'J&W Detailing', 'Mobile detailing', '#123A5C', {
    site: 'https://jnwdetailing.com/',
    phone: '(510) 756-4995',
    contactOnly:
      'Oakland-based mobile detailing — ceramic coatings, and they come to you. Berkeley is ' +
      'in their own published service list, which is where the operator seated them. ' +
      'Details beyond that are still being gathered.',
  }),
  /*
    Diablo Auto Detailing is deliberately ABSENT. The domain the operator sent
    serves an empty JavaScript shell with no name, city or phone in it, and the
    only Instagram under that name serves Fresno's 559 — while Concord's
    similarly named shop is "Diablo Car Wash & Detail", a different trading
    name with no proven link to the domain. Nothing verifiable exists to list,
    and seating a Fresno business in Concord is worse than an empty spot.
  */
  seed('perfect-nine-events', 'Perfect Nine', 'Perfect Nine', 'Mobile mini golf events', '#701A3C', {
    icon: 'perfect-nine-events',
    /* The ninth hole, as the mark. */
    logoInitials: '9',
    site: 'https://www.perfectnineevents.com/',
    phone: '(510) 953-5757',
  }),
  seed('the-model-bakery', 'The Model Bakery', 'Model Bakery', 'Bakery', '#8A5A18', {
    icon: 'the-model-bakery',
    logoTemplate: 'badge', logoLines: ['MODEL BAKERY'], logoFace: 'slab',
    site: 'https://www.themodelbakery.com/',
    phone: '(707) 259-1128',
    /* Four locations; the operator's "Napa" seat is their Oxbow Market stand —
       "Napa" and "Oxbow" are the SAME store, per their own location pages. */
    address: 'Oxbow Market, 644 1st St, Napa',
  }),
  seed('town-futurist-media', 'TOWNFUTURIST MEDIA', 'Town Futurist', 'Video production', '#233329', {
    logoTemplate: 'band', logoLines: ['TOWN', 'FUTURIST'], logoFace: 'condensed',
    site: 'https://www.townfuturistmedia.com/',
    phone: '(510) 269-0433',
    address: '755 Baywood Dr, Petaluma',
  }),
  seed('the-hangout-breakfast', 'The Hangout', 'The Hangout', 'Breakfast', '#12263F', {
    // Their own mark, not a generated monogram — the header logo fetched from their site: https://static.wixstatic.com/media/4498e5_d17e57814acd47d6829b1586449b2574~mv2.png
    /*
      THEIR REAL LOGO IS NOT USED HERE. the-hangout.webp is their genuine mark,
      fetched from their own site — which is exactly why it does not go on a
      tile for a business that has agreed nothing. Their artwork on a seat the
      app calls taken reads as a partnership to anyone who sees it, including
      them. The file stays in public/icons ready for the moment they say yes.
    */
    site: 'https://www.thehangoutbreakfast.com/',
    contactOnly:
      'Breakfast and brunch, two locations: 2217 Morello Ave, Pleasant Hill (925 671-9925) ' +
      'and 1908 Tice Valley Blvd, Walnut Creek (925 546-3122) — the operator delivers to ' +
      'them. Ordering runs per-location through their own site; menus are still being ' +
      'gathered, and prices will only ever come from the right location’s own menu.',
  }),
  seed('happy-bay-paws', 'Happy Bay Paws', 'Happy Bay Paws', 'Mobile dog grooming', '#D8590F', {
    icon: 'happy-bay-paws',
    /* White on their orange measured 3.92:1; the band's own dark plate carries
       the name instead, and the orange stays the tile. */
    logoTemplate: 'band', logoLines: ['HAPPY BAY', 'PAWS'], logoAccent: '#7A2F06',
    site: 'https://happybaypawsca.com/',
    phone: '(650) 730-0424',
    contactOnly:
      'Mobile dog grooming — their own Instagram says "less stress, more comfort", serving ' +
      'the Bay Area and San Joaquin County. No fixed shop, which is why no address is shown. ' +
      'The operator is gathering the rest.',
  }),
  seed('x-noodle-dumpling', 'X Noodles & Dumplings', 'X Noodles', 'Handcrafted noodles, dumplings', '#141416', {
    logoTemplate: 'glyph-word', logoGlyph: 'noodles', logoLines: ['X'],
    phone: '(925) 626-8866',
    address: '1185 2nd St, Ste G, Brentwood',
    contactOnly:
      'Their own Instagram: handcrafted noodles, juicy dumplings. No menu is published ' +
      'anywhere the tools could read, so nothing is priced here — the operator is ' +
      'gathering the rest.',
  }),

  /*
    ---- the 2026-08-11 run ----

    Ten businesses sent one after another across a single evening, each with
    its city and page written beside the link ("Vacaville • Goods", "Crockett •
    Goods"). Same rules as everything above: the name, the city he gave, the
    link he sent, and nothing else. No menu, no hours, no prices. Where an
    address or a descriptor appears below it is quoted from the business's own
    Instagram header in the screenshot he attached, and nowhere else.

    Five of them opened a city that did not exist yet — see data/cities.ts.
  */
  seed('mimis-chocolates', 'Mimi’s Chocolates', 'Mimi’s', 'Chocolate shop', '#4A2C17', {
    icon: 'mimis-chocolates',
    logoTemplate: 'monogram', logoInitials: 'MC', logoFace: 'script',
    site: 'https://mimischocolates.com/',
  }),
  seed('pho-de-nguyen', 'Pho De Nguyen', 'Pho De Ng…', 'Vietnamese, pho', '#7A1F1F', {
    logoTemplate: 'monogram', logoInitials: 'PN', logoFace: 'slab',
    site: 'https://www.instagram.com/phodenguyen',
    contactOnly:
      'Sent by the operator with no website and no logo of their own — his note calls that ' +
      'the opportunity rather than the problem. Nothing is listed here yet.',
  }),
  seed('maymays-cravings', 'Maymay’s Cravings', 'Maymay’s', 'Filipino desserts', '#8C2F5A', {
    logoTemplate: 'monogram', logoInitials: 'MC', logoFace: 'script',
    site: 'https://order.online/store/35787203',
  }),
  seed('banh-mi-xpress', 'Banh Mi Xpress', 'Banh Mi X…', 'Vietnamese sandwiches', '#1F5F3F', {
    logoTemplate: 'monogram', logoInitials: 'BX', logoFace: 'condensed',
    site: 'https://www.banhmixpress.net/',
  }),
  seed('royale-eatery', 'The Royale Eatery', 'The Royale', 'Contemporary American', '#14141A', {
    icon: 'royale-eatery',
    logoTemplate: 'monogram', logoInitials: 'R', logoFace: 'script',
    site: 'https://www.theroyaleeatery.com/',
    address: '2190 Contra Costa Blvd, Pleasant Hill',
  }),
  seed('one-house-bistro', 'One House Bistro', 'One House', 'Bistro, brunch and dinner', '#6B5426', {
    logoTemplate: 'monogram', logoInitials: 'OH', logoFace: 'grotesk',
    site: 'https://www.instagram.com/onehouse.sr',
    address: '2468 San Ramon Valley Blvd, San Ramon',
  }),
  seed('benicia-grill', 'Benicia Grill', 'Benicia Grill', 'American grill', '#8C3A1E', {
    icon: 'benicia-grill',
    logoTemplate: 'monogram', logoInitials: 'BG', logoFace: 'slab',
    site: 'http://www.benicia-grill.com/',
  }),
  seed('intl-kitchen', 'INTL Kitchen', 'INTL Kitchen', 'Asian takeout', '#C0261F', {
    icon: 'intl-kitchen',
    logoTemplate: 'glyph-word', logoGlyph: 'noodles', logoLines: ['INTL'],
    site: 'https://intlkitchen.com/',
  }),
  seed('majestic-boutique', 'Majestic Boutique', 'Majestic', 'Clothing boutique', '#2B2440', {
    icon: 'majestic-boutique',
    logoTemplate: 'monogram', logoInitials: 'MB', logoFace: 'condensed',
    site: 'https://majesticboutique.co/',
  }),
  /*
    ---- the 2026-08-12 run ----

    Twenty-odd in one evening. Same rules as everything above: his name, his
    city, his link, and nothing invented. Addresses and one-line descriptors
    are quoted from the business's own Instagram header in the screenshot he
    attached, never from anywhere else, and several of these have no website at
    all — he flags those himself as the ones worth selling one to.
  */
  seed('lavanta', 'Lavanta', 'Lavanta', 'Mediterranean', '#2E4A34', {
    logoTemplate: 'monogram', logoInitials: 'LV', logoFace: 'condensed',
    site: 'https://www.eatlavanta.com/',
  }),
  /* His link said tetsujinsushi.com and the screenshot in the same message was
     @kaisendon1939, which looked like two businesses. It is one: that site
     trades as "Sushi | Tetsujin Kaisen Don" and prints this same Marina Blvd
     address. Checked rather than assumed, because seating a business under
     another's website is the kind of error nobody catches later. */
  seed('kaisen-don', 'Kaisen Don', 'Kaisen Don', 'Sushi and donburi', '#1B1B22', {
    logoTemplate: 'monogram', logoInitials: 'KD', logoFace: 'grotesk',
    site: 'https://www.tetsujinsushi.com/',
    address: '1042 Marina Blvd, San Leandro',
  }),
  seed('polly-ann', 'Polly Ann Ice Cream', 'Polly Ann', 'Ice cream', '#C0335E', {
    icon: 'polly-ann',
    logoTemplate: 'monogram', logoInitials: 'PA', logoFace: 'script',
    site: 'https://www.pollyann.com/',
    address: '3138 Noriega St, San Francisco',
  }),
  seed('house-of-thai', 'House Of Thai', 'House Of Thai', 'Thai', '#7A2418', {
    logoTemplate: 'monogram', logoInitials: 'HT', logoFace: 'slab',
    site: 'https://www.houseofthaisf.com/',
    address: '901 Larkin St, San Francisco',
  }),
  seed('u-dessert-story', 'U Dessert Story', 'U Dessert', 'Dessert shop', '#20202A', {
    icon: 'u-dessert-story',
    logoTemplate: 'monogram', logoInitials: 'U', logoFace: 'grotesk',
    site: 'https://www.udessertstory.com/',
    address: '3489 16th St, San Francisco',
  }),
  seed('the-farmacy', 'The Farmacy', 'The Farmacy', 'Cafe', '#1F4030', {
    icon: 'the-farmacy',
    logoTemplate: 'monogram', logoInitials: 'TF', logoFace: 'grotesk',
    site: 'https://www.farmacysf.com/',
  }),
  seed('sol-taqueria', 'Sol Taqueria', 'Sol Taqueria', 'Mexican', '#B4531B', {
    logoTemplate: 'monogram', logoInitials: 'ST', logoFace: 'slab',
    site: 'https://www.soltaqueriaberkeley.com/',
  }),
  seed('one-house-bakery', 'One House Bakery', 'One House Bak…', 'Bakery', '#6B4A22', {
    icon: 'one-house-bakery',
    logoTemplate: 'monogram', logoInitials: 'OH', logoFace: 'script',
    site: 'https://onehousebakery.com/',
    address: '918 1st St, Benicia',
  }),
  seed('sandwich-monkey', 'The Sandwich Monkey', 'Sandwich Mo…', 'Sandwiches', '#8A5A18', {
    icon: 'sandwich-monkey',
    logoTemplate: 'monogram', logoInitials: 'SM', logoFace: 'slab',
    site: 'https://thesandwichmonkey.com/',
    address: '3 Plaza View Ln, Foster City',
  }),
  seed('senor-sisig', 'Señor Sisig', 'Señor Sisig', 'Filipino', '#B0201F', {
    icon: 'senor-sisig',
    logoTemplate: 'monogram', logoInitials: 'SS', logoFace: 'condensed',
    site: 'https://www.senorsisig.com/',
  }),
  seed('jolly-cafe', 'Jolly Cafe', 'Jolly Cafe', 'Coffee', '#8C6A3F', {
    logoTemplate: 'monogram', logoInitials: 'JC', logoFace: 'script',
    phone: '(510) 454-9899',
    address: '1004 Webster St, Oakland',
    contactOnly:
      'Sent 2026-08-12 with his note that they need a website — they have none, which is why ' +
      'the only route here is the phone number from their own Instagram header.',
  }),
  seed('donut-farm', 'Donut Farm', 'Donut Farm', 'Organic donuts', '#1A1A1E', {
    logoTemplate: 'monogram', logoInitials: 'DF', logoFace: 'grotesk',
    contactOnly:
      'Sent 2026-08-12 with "no website yet". Their own Instagram lists shops on Adeline St ' +
      'and Gilman St; the operator filed them under Oakland, so that is where they sit.',
  }),
  seed('milky-flakes', 'Milky Flakes', 'Milky Flakes', 'Sweet treats', '#C8912A', {
    logoTemplate: 'monogram', logoInitials: 'MF', logoFace: 'script',
    address: '1399 N Main St, Walnut Creek',
    contactOnly:
      'A new store, sent 2026-08-12 with "no website yet" — their own Instagram is the only ' +
      'thing published about them so far.',
  }),
  seed('bober-tea', 'Bober Tea & Mochi', 'Bober Tea', 'Boba and mochi donuts', '#C2508A', {
    logoTemplate: 'monogram', logoInitials: 'BT', logoFace: 'grotesk',
    phone: '279-900-8046',
    address: '1029 Arnold Dr, Suite 10, Martinez',
    contactOnly:
      'A new store, sent 2026-08-12 with "needs website". Phone and address are from their ' +
      'own Instagram header; nothing else is listed.',
  }),
  seed('pizzeria-cardamomo', 'Pizzeria Cardamomo', 'Cardamomo', 'Pizza', '#3E1F1A', {
    logoTemplate: 'monogram', logoInitials: 'PC', logoFace: 'slab',
    site: 'https://pizzeriacardamomo.com/',
    contactOnly:
      'Sent 2026-08-12 with his note "needs branding work. No logo" — so this tile is a ' +
      'monogram rather than their mark, because they do not have one.',
  }),
  seed('great-impasta', 'Great Impasta', 'Great Impasta', 'Italian', '#2E4A2A', {
    logoTemplate: 'monogram', logoInitials: 'GI', logoFace: 'script',
    site: 'https://greatimpastadanville.com/',
  }),
  seed('chutneys', 'Chutneys', 'Chutneys', 'Indian', '#8A4A12', {
    logoTemplate: 'monogram', logoInitials: 'CH', logoFace: 'slab',
    site: 'https://chutneys.ai/',
  }),
  seed('french-spot', 'The French Spot', 'French Spot', 'French bakery', '#243A6B', {
    icon: 'french-spot',
    logoTemplate: 'monogram', logoInitials: 'FS', logoFace: 'script',
    site: 'https://www.thefrenchspotsf.com/',
  }),
  seed('joybound', 'Joybound People & Pets', 'Joybound', 'Animal welfare, vet clinic', '#1F5E5A', {
    logoTemplate: 'monogram', logoInitials: 'JB', logoFace: 'grotesk',
    site: 'https://linktr.ee/joyboundpeopleandpets',
    contactOnly:
      'Sent 2026-08-12 with "needs website" and marked a potential BPRF candidate. They are ' +
      'an animal-welfare organisation that also runs a community clinic, which is why they ' +
      'sit under the veterinary spot rather than grooming.',
  }),
  seed('bodylines-day-spa', 'Bodylines Day Spa', 'Bodylines', 'Day spa', '#4A2C52', {
    logoTemplate: 'monogram', logoInitials: 'BD', logoFace: 'script',
    site: 'https://www.bodylinesdayspa.com/',
  }),
  seed('sola-salons', 'Sola Salons East Bay', 'Sola Salons', 'Salon studios', '#1C1C24', {
    logoTemplate: 'monogram', logoInitials: 'SS', logoFace: 'condensed',
    site: 'https://linktr.ee/solasalonseastbay',
    contactOnly:
      'Three locations, and his note says they look like they need a website at some point. ' +
      'Seated on one page for now rather than three, until he says which.',
  }),

  /*
    His friend's six, all sent at once with one instruction: "If you can place
    them all on the yellow pages of BEASTY • Goods & Services; we can start
    filling in those yellow spots with these to fill in spots to look like we
    are growing."
      — so they go on the flagship yellow sheets rather than into a city, which
    is also the honest place for them: he gave no city for any of these, and a
    numbered city spot is a claim about where a business is.
  */
  seed('santa-clara-super-kitchen', 'Santa Clara Super Kitchen', 'Super Kitchen', 'Kitchen', '#7A2A1E', {
    icon: 'santa-clara-super-kitchen',
    logoTemplate: 'monogram', logoInitials: 'SK', logoFace: 'condensed',
    site: 'https://santaclarasuperkitchen.com/',
  }),
  seed('willy-billy-smoked-meat', 'Willy Billy Smoked Meat', 'Willy Billy', 'Smoked meat', '#4A2416', {
    icon: 'willy-billy-smoked-meat',
    logoTemplate: 'monogram', logoInitials: 'WB', logoFace: 'slab',
    site: 'https://willybillysmokedmeat.com/',
  }),
  seed('red-chili', 'Red Chili', 'Red Chili', 'Restaurant', '#A31E1E', {
    icon: 'red-chili',
    logoTemplate: 'monogram', logoInitials: 'RC', logoFace: 'slab',
    site: 'https://redchilirestaurants.com/',
  }),
  seed('banh-mi-oven', 'Banh Mi Oven', 'Banh Mi Oven', 'Vietnamese sandwiches', '#286B3A', {
    logoTemplate: 'monogram', logoInitials: 'BO', logoFace: 'condensed',
    site: 'https://banhmioven.us/',
  }),
  seed('adzeela', 'Adzeela', 'Adzeela', 'Advertising', '#212938', {
    icon: 'adzeela',
    logoTemplate: 'monogram', logoInitials: 'AZ', logoFace: 'grotesk',
    site: 'https://adzeela.com/',
  }),
  /*
    THIS IS THE ONLY ALLY VIRTUAL. There used to be a second entry on the same
    slug in brands.ts — one of the ported hub records — describing them as an
    all-day breakfast place and carrying four priced menu items, right down to
    a steak and egg burrito at $13. Ally Virtual is a virtual assistance
    company. The old site tagged all 25 ported records as food, which is the
    same fault the Brand type already documents ("a tax-prep firm and a sneaker
    brand both ended up with restaurant menus"), and this one additionally
    collided on the slug so the two fought over one id.

    It was removed rather than corrected: inventing a menu and prices for a real
    business is the one thing this app must never do, and there was nothing in
    that record worth keeping except the icon, which is now here.
  */
  seed('ally-virtual', 'Ally Virtual', 'Ally Virtual', 'Virtual assistance', '#1E3A52', {
    icon: 'ally-virtual',
    logoTemplate: 'monogram', logoInitials: 'AV', logoFace: 'grotesk',
    site: 'https://allyvirtual.com/',
    contactOnly:
      'Virtual assistance — there is nothing to order here. What they do and what it costs are ' +
      'on their own site.',
  }),

  /* ---- 2026-08-16 ---- */
  /* "Not sure what city to put it in though because it's a mobile service
     covering the Bay Area" — so no city, and the descriptor says mobile, which
     is what earns the teal ring and the "comes to you" line. */
  seed('rocket-mc-tow', 'Rocket MC Tow', 'Rocket MC Tow', 'Mobile motorcycle towing', '#8C1A1A', {
    icon: 'rocket-mc-tow',
    logoTemplate: 'monogram', logoInitials: 'RT', logoFace: 'condensed',
    site: 'https://www.rocketmctow.com/',
    phone: '(925) 517-5551',
    contactOnly:
      'Emergency motorcycle towing and transport, licensed and insured, open 24/7 across the Bay ' +
      'Area — quoted from their own Instagram. No fixed address, because they come to you.',
  }),
  /* He filed this under Benicia; their own site says American Canyon, and that
     they open at the end of 2026 with at-home steakhouse experiences until
     then. Seated where he put it, with the discrepancy written down rather
     than an address invented to settle it. */
  seed('chiquo-and-eva', 'Chiquo & Eva’s', 'Chiquo & Eva', 'Wagyu steakhouse', '#4A1414', {
    icon: 'chiquo-and-eva',
    logoTemplate: 'monogram', logoInitials: 'CE', logoFace: 'script',
    site: 'https://www.chiquoandeva.com/',
  }),
  seed('cajun-crack-n', 'Cajun Crack N', 'Cajun Crack N', 'Cajun seafood boil', '#A3241A', {
    logoTemplate: 'monogram', logoInitials: 'CC', logoFace: 'slab',
    site: 'https://m.yelp.com/biz/cajun-crack-n-concord-concord-2',
    contactOnly:
      'Sent 2026-08-16 with "needs website" — the Yelp page above is what they have. Nothing ' +
      'else is listed.',
  }),

  /* ---- 2026-08-15 ---- */
  /* He filed this under San Jose; their own Instagram gives a Milpitas street
     address. The address stays as published, because that is the one the
     Directions button sends somebody to — worth him confirming which city he
     means, since the two disagree. */
  seed('bloom-balloon', 'Bloom Balloon', 'Bloom Balloon', 'Balloon design', '#C2508A', {
    icon: 'bloom-balloon',
    logoTemplate: 'monogram', logoInitials: 'BB', logoFace: 'script',
    site: 'https://bloomballoon.com/connect',
    address: '1090 S Milpitas Blvd, Milpitas',
  }),
  seed('yes-moment', 'Yes Moment', 'Yes Moment', 'Proposal and engagement planner', '#A3184A', {
    icon: 'yes-moment',
    logoTemplate: 'monogram', logoInitials: 'YM', logoFace: 'script',
    site: 'https://yes-moment.com/',
  }),
  seed('brasa-bros', 'Brasa Bros', 'Brasa Bros', 'Peruvian rotisserie chicken', '#C24A18', {
    icon: 'brasa-bros',
    logoTemplate: 'monogram', logoInitials: 'BB', logoFace: 'condensed',
    site: 'https://www.brasa-bros.com/',
    address: '1001 S Van Ness Ave, San Francisco',
  }),


  /* Spotted on a delivery, and his note was "in desperate need of everything" —
     no website, so the tile is a monogram and the address is the only thing
     here besides the name. */
  seed('gay-nineties-pizza', 'Gay Nineties Pizza & Pasta Co.', 'Gay Nineties', 'Pizza and pasta', '#1F4A2E', {
    logoTemplate: 'monogram', logoInitials: '90', logoFace: 'slab',
    address: '288 Main St, Pleasanton',
    contactOnly:
      'Sent 2026-08-15 with no website of their own — their Instagram is all that is published. ' +
      'Nothing else is listed.',
  }),

  /* ---- 2026-08-14 ---- */
  /* His best friend's, and the one he asked to show her — so the mark is the
     anchor on its own, as he asked, rather than initials. */
  seed('bay-area-charters', 'Bay Area Charters', 'Bay Area Cha…', 'Boat charters', '#123A5C', {
    icon: 'bay-area-charters',
    logoTemplate: 'glyph-word', logoGlyph: 'anchor', logoLines: [''],
    site: 'https://www.bayareacharters.com/',
  }),
  seed('breaktime-tea', 'Breaktime Tea', 'Breaktime Tea', 'Bubble tea', '#C2607A', {
    logoTemplate: 'monogram', logoInitials: 'BT', logoFace: 'script',
    site: 'https://order.online/store/breaktime-tea---concord-concord-24472557/',
    address: '790 Oak Grove Rd, Ste C-1, Concord',
    /*
      A WORKED EXAMPLE, at his request: "can you make this happy hour special
      as the loyalty offer as an example for this page? Make the welcome offer
      just a regular BOGO free."

      The loyalty line is their real, published promotion, quoted off their own
      post rather than invented — everyday 2-4pm, buy two get one free on milk
      tea and fresh tea. The welcome line is his, and it is the one that is
      genuinely made up, which is what `mock` is for: the page prints a caveat
      saying these are examples and nothing has been agreed.
    */
    offers: {
      mock: true,
      welcome: 'Buy one drink, get one free on your first visit.',
      loyalty: 'Their happy hour, every day 2-4pm: buy two, get one free on milk tea and fresh tea.',
    },
  }),
  seed('babs-delta-diner', 'Babs Delta Diner', 'Babs Diner', 'Homestyle diner', '#8C2018', {
    logoTemplate: 'monogram', logoInitials: 'BD', logoFace: 'script',
    address: '134 Robles Way, Vallejo',
    contactOnly:
      'Sent 2026-08-14 with his note that they need a website. Their own Instagram: a diner in ' +
      'Glen Cove, rooted in Suisun, serving homestyle favourites. Nothing else is listed.',
  }),
  seed('simply-soups', 'Simply Soups', 'Simply Soups', 'Soups and deli', '#5C1A1A', {
    logoTemplate: 'monogram', logoInitials: 'SS', logoFace: 'slab',
    address: '3103 Delta Fair Blvd, Antioch',
    contactOnly:
      'Sent 2026-08-14 with "has no website, needs a logo revamp too" — so this tile is a ' +
      'monogram rather than their mark, deliberately. Their own Instagram calls them a deli.',
  }),
  seed('cafe-noir-oak', 'Cafe Noir', 'Cafe Noir', 'Comfort food', '#1A1A1E', {
    icon: 'cafe-noir-oak',
    logoTemplate: 'monogram', logoInitials: 'N', logoFace: 'script',
    site: 'https://www.cafenoiroak.com/',
    address: '1620 18th St, Stall B, Oakland',
  }),
  /* "BEASTY • Oakland / Mobile", 2026-08-19. Already seated in Oakland; what
     was missing was their own badge and the word Mobile in the descriptor,
     which is what draws the ring — see MOBILE in apps/registry. */
  seed('jump-and-roll', 'Jump & Roll', 'Jump & Roll', 'Mobile soft play and bounce rentals', '#B87C7C', {
    icon: 'jump-and-roll',
    logoTemplate: 'monogram', logoInitials: 'JR', logoFace: 'condensed',
    site: 'https://itsjumpandroll.com/',
    contactOnly:
      'Premium soft play and modern bouncers for parties and celebrations across the Bay Area, ' +
      'in their own words. Packages and availability are on their own site.',
  }),
  seed('urban-air', 'Urban Air', 'Urban Air', 'Adventure park', '#1F3A6B', {
    icon: 'urban-air',
    logoTemplate: 'monogram', logoInitials: 'UA', logoFace: 'condensed',
    site: 'https://www.urbanair.com/',
  }),
  seed('eight-acres', 'Eight Acres Kitchen & Bar', 'Eight Acres', 'Kitchen and bar', '#3A4A2A', {
    icon: 'eight-acres',
    logoTemplate: 'monogram', logoInitials: '8', logoFace: 'slab',
    site: 'http://www.eightacresbrentwood.com/',
    address: 'Brentwood',
  }),
  seed('las-lomas-rib-palace', 'Las Lomas Rib Palace', 'Las Lomas', 'Peruvian and BBQ ribs', '#7A1F14', {
    logoTemplate: 'monogram', logoInitials: 'LL', logoFace: 'slab',
    phone: '(925) 499-7105',
    contactOnly:
      'Sent 2026-08-14 with "needs website". Their own Instagram: authentic Peruvian cuisine and ' +
      'BBQ pork ribs, a home business in Antioch, open Saturdays only and pre-order thirty ' +
      'minutes ahead. No address is published, so none is shown.',
  }),
  seed('playland-707', 'Playland 707', 'Playland 707', 'Paintball', '#2A5C2A', {
    icon: 'playland-707',
    logoTemplate: 'monogram', logoInitials: 'P7', logoFace: 'condensed',
    site: 'https://www.playland707.com/paintball/',
  }),
  seed('chip-cookies', 'Chip Cookies', 'Chip Cookies', 'Cookies', '#6B4A2A', {
    icon: 'chip-cookies',
    logoTemplate: 'monogram', logoInitials: 'CC', logoFace: 'script',
    site: 'https://www.chipcookies.co/',
  }),
  seed('macs-old-house', 'Mac’s Old House', 'Mac’s', 'Steakhouse', '#6B1A1A', {
    icon: 'macs-old-house',
    logoTemplate: 'monogram', logoInitials: 'M', logoFace: 'script',
    site: 'https://www.macsoldhouse.com/',
  }),
  seed('philomena-pizza', 'Philomena Pizza', 'Philomena', 'Pizza', '#2E4A2A', {
    logoTemplate: 'monogram', logoInitials: 'PP', logoFace: 'slab',
    site: 'https://order.philomenapizza.com/',
  }),

  /* ---- 2026-08-13 ---- */
  seed('kabab-burger', 'Kabab Burger', 'Kabab Burger', 'Kebab and burgers', '#7A3A12', {
    icon: 'kabab-burger',
    logoTemplate: 'monogram', logoInitials: 'KB', logoFace: 'slab',
    site: 'https://kabab-burger.co/',
  }),
  seed('sweet-pipers', 'Sweet Pipers', 'Sweet Pipers', 'Filipino desserts', '#6B3A7A', {
    logoTemplate: 'monogram', logoInitials: 'SP', logoFace: 'script',
    phone: '(510) 398-9544',
    address: '2352 A San Pablo Ave, Pinole',
    contactOnly:
      'Sent 2026-08-13 with "no website". Their own Instagram: tropical delicacies, Bay Area ' +
      'Ube Fest 2026 winner for best dessert, taking pre-orders. Phone and address are theirs; ' +
      'nothing else is listed.',
  }),
  /* "Mobile Bay Area" — his words, and no city with it. The descriptor says
     mobile, which is what earns the ring on the grid and the line on their
     page; see MOBILE in apps/registry. Seated on the BEASTY sheet rather than
     in a city, for the same reason Happy Bay Paws is: they are not in one. */
  seed('eagle-pet-grooming', 'Eagle Pet Grooming', 'Eagle Pet', 'Mobile pet grooming', '#1F4A6B', {
    logoTemplate: 'monogram', logoInitials: 'EP', logoFace: 'condensed',
    site: 'https://eaglepetgrooming.com/',
  }),

  /* Sent 2026-08-10 with "Concord • Services" and missed in that batch — the
     third detailer on his list, after JDI in Brentwood and J&W in Berkeley. */
  seed('diablo-auto-detailing', 'Diablo Auto Detailing', 'Diablo Detail', 'Auto detailing', '#1A2C4A', {
    logoTemplate: 'monogram', logoInitials: 'DD', logoFace: 'condensed',
    site: 'https://diabloautodetailing.com/',
  }),
  seed('suptea-lab', 'SupTea Lab', 'SupTea Lab', 'Boba tea', '#8A6A2F', {
    logoTemplate: 'monogram', logoInitials: 'ST', logoFace: 'condensed',
    site: 'https://suptealaboakland.square.site/',
    address: '3349 Grand Ave, Oakland',
    contactOnly:
      'Sent 2026-08-12 with the operator’s note that they need a website — the Square page ' +
      'above is what they have. Nothing else is listed yet.',
  }),
  /*
    Three more from the same 2026-08-18 evening, each sent as an Instagram
    profile with the city and page written under it.
  */
  seed('stella-pastry', 'Stella Pastry & Cafe', 'Stella Pastry', 'Italian pastry', '#3E5C82', {
    icon: 'stella-pastry',
    logoTemplate: 'monogram', logoInitials: 'SP', logoFace: 'script',
    /* The Yelp short link is what he sent; their own site was not in the
       message and is not guessed at here. */
    site: 'https://yelp.to/7H6kl4WghI',
    siteCta: 'See them on Yelp',
    address: '446 Columbus Ave, San Francisco',
    contactOnly:
      'Their own words from Instagram: the House of Sacripantina, authentic Italian pastry made ' +
      'from scratch since 1942. No menu or prices are listed here yet.',
  }),
  /* "MOBILE SERVICE", in his message. The word `Mobile` in the descriptor is
     what earns the ring on the grid and the line on their page — see MOBILE in
     apps/registry — so it is in the descriptor rather than in a second list. */
  seed('i-snapped-photo-booths', 'i.snapped Photo Booths', 'i.snapped', 'Mobile photo booth rental', '#B0208C', {
    icon: 'i-snapped-photo-booths',
    logoTemplate: 'monogram', logoInitials: 'iS', logoFace: 'condensed',
    site: 'https://www.i-snappedphotobooths.com/',
    contactOnly:
      'Their own words: a woman-owned and Black-led photo booth rental for events, parties and ' +
      'celebrations, serving the Bay Area and San Joaquin County. Nothing is priced here.',
  }),
  seed('jenuine-fitness', 'Jenuine Fitness', 'Jenuine Fit', 'Gym', '#1A1A1C', {
    icon: 'jenuine-fitness',
    logoTemplate: 'monogram', logoInitials: 'JF', logoFace: 'condensed',
    site: 'https://jenuinefitness.com/',
    /* "Please add directions" — this is the field the Directions button reads. */
    address: '1085 Broadway Ave, San Pablo, CA 94806',
    /* His words, and his own caveat with them: "This will be a mock offer until
       I speak to my boy that owns it." */
    offers: {
      mock: true,
      welcome: 'Get a FREE 9 day trial on your 1st visit only!',
      loyalty: 'Get 10% off your monthly membership rate.',
    },
    /* His own photograph of the gym, sent with "maybe add this to their page?"
       — and the reason it works is his: "the logo is in the back[g]round". A
       group shot under their own banner says what the place is in a way the
       mark alone cannot. Cropped down, as he offered. */
    photo: {
      src: '/photos/jenuine-fitness.webp',
      credit: 'Photo from Jenuine Fitness',
      alt: 'Members of Jenuine Fitness gathered under the gym’s banner on the training floor',
    },
    contactOnly:
      'Strength and endurance, Glutecamp, circuit training and a Hyrox training club, in their ' +
      'own words. Class times and membership rates are on their own site.',
  }),
  /*
    The operator's cousin's shop, sent 2026-08-18 with the address, the Booksy
    booking link and both offers written out.

    SEATED IN SAN PABLO, ADDRESSED IN RICHMOND, and the two are not a mistake.
    12246 San Pablo Ave is a Richmond address and Richmond already has a page;
    he asked for "his own city of San Pablo, CA" anyway, which is his call
    about how he sells that street. The page draws the real address, so a
    customer navigating there is never sent to the wrong town.

    contactOnly because Booksy holds the prices and they are not republished
    here — a haircut price copied across and left to go stale is worse than a
    booking link that is always current.
  */
  seed('magic-juans', 'Magic Juan’s Barbershop', 'Magic Juan’s', 'Barbershop', '#A81E27', {
    icon: 'magic-juans',
    logoTemplate: 'monogram', logoInitials: 'MJ', logoFace: 'script',
    site: 'https://booksy.com/en-us/instant-experiences/widget/249276?instant_experiences_enabled=true&id_ix=true&utm_source=ig&utm_medium=social&utm_content=link_in_bio',
    siteCta: 'Book on Booksy',
    siteNote: 'Cuts, prices and availability are on their Booksy page.',
    address: '12246 San Pablo Ave, Richmond, CA 94805',
    /*
      THE ONLY OFFER IN THE APP THAT IS NOT MOCK.

      Every other one carries `mock` because the operator wrote it and the
      business has not signed it. He said the opposite about this one, in as
      many words: "This offer is real and will be live once the website is
      done. This will be the lead example I will use when I recruit
      barbershops." It is his cousin's shop and he has spoken to him.

      Quoted from his SECOND message, not his first — he sent a simpler pair at
      02:32 and then "I just edited the offers a bit" nine minutes later. The
      tiers are the offer: an adult rate and a youth/student rate are two
      different promises, and collapsing them into one would misprice it.
    */
    offers: {
      welcome:
        'Get $15 off an Adult haircut and/or $10 off Youth & Student haircut on your 1st ' +
        'booksy appointment only.',
      loyalty:
        'Get $10 off an Adult haircut or $5 off Youth and/or Student haircut on any booksy ' +
        'appointment anytime.',
    },
    /* The stock "nothing here is a claim about them" line cannot be used on
       this one: the offer above it IS a claim, and a real one he has agreed
       with the shop. It says what is actually missing instead. */
    contactOnly:
      'Booking, prices and availability are on their Booksy page — no prices are listed here.',
  }),
  /*
    The 2026-08-18/19 run. Each arrived as a link or an Instagram profile with
    the city and page written under it, and each keeps its own artwork.
  */
  seed('quickly-benicia', 'Quickly Benicia', 'Quickly', 'Boba tea', '#F08A1E', {
    icon: 'quickly-benicia',
    logoTemplate: 'monogram', logoInitials: 'Q', logoFace: 'condensed',
    site: 'https://www.quicklybenicia.com/',
    /* "Mock up discount. This restaurant, my boy owns a BENICIA." — his note,
       so the offer is his draft and the shop has agreed nothing. */
    offers: {
      mock: true,
      welcome: 'Get a family discount of 25% off your purchase for your 1st visit!',
      loyalty: 'Get 10% off your purchase on any visit!',
    },
    contactOnly:
      'Drinks and prices are on their own site — nothing is listed here.',
  }),
  /*
    Sala Thai, Richmond. "My friend DAVE owns this and I just spoke to him and
    he's excited to sign up already" — the first owner who has said yes before
    being shown a page, which is why this one is worth getting right.

    His "Needs website" is a note to himself about selling them one, not a gap
    in the data: salathairichmond.com exists and is where their logo came from.
  */
  seed('sala-thai', 'Sala Thai', 'Sala Thai', 'Thai food', '#8B1A2B', {
    icon: 'sala-thai',
    logoTemplate: 'monogram', logoInitials: 'ST', logoFace: 'script',
    site: 'https://salathairichmond.com/',
    contactOnly:
      'Their menu and hours are on their own site and their Facebook page. Nothing is priced ' +
      'here yet.',
  }),
  /*
    SIA Collective — "BEASTY • Goods, replace EAT tile please". A streetwear
    label with no shop to walk into, which is exactly the case he raised in the
    same breath: "we should have a dedicated color for online only stores."
    Nothing marks that yet; see the note in apps/registry.
  */
  seed('sia-collective', 'SIA Collective', 'SIA', 'Streetwear, online only', '#111114', {
    icon: 'sia-collective',
    logoTemplate: 'monogram', logoInitials: 'SIA', logoFace: 'condensed',
    site: 'https://siacollective.com/',
    contactOnly:
      'An online-only label — there is no shop to visit. Drops and sizing are on their own ' +
      'site and their Instagram.',
  }),
  seed('house-of-silog', 'House of Silog', 'House of Silog', 'Filipino fusion', '#1C1C1E', {
    icon: 'house-of-silog',
    logoTemplate: 'monogram', logoInitials: 'HS', logoFace: 'slab',
    /* No site of their own — he flagged it "Needs website". The ordering page
       is what they publish, so that is what the button opens. */
    site: 'https://order.online/business/house-of-silog-brentwood',
    siteCta: 'Order online',
    address: '7760 Brentwood Blvd, Suite D, Brentwood, CA',
    contactOnly:
      'Inside the Filipino Streetfood Hub, Wednesday to Friday 11am to 9pm and Saturday noon ' +
      'to 9pm, in their own words. Also on DoorDash and Uber Eats.',
  }),
  /*
    Frank2Artistic — "BEASTY • Services, Murals. No website. I'm going to try to
    hit them up about a website."

    Takes the numbered seat Inter Chiro vacates, on his "you can bump ic to
    yellow pages" in the same message.
  */
  seed('frank2artistic', 'Frank2Artistic', 'Frank2Artistic', 'Murals and custom art', '#E8621A', {
    icon: 'frank2artistic',
    logoTemplate: 'monogram', logoInitials: 'F2', logoFace: 'condensed',
    contactOnly:
      'Murals, logos and custom art across the Bay Area and the 209, by Franklin Guardado. ' +
      'Murals start around $1.2k, his own figure. Quotes are by enquiry — he publishes no site.',
  }),
  seed('emys-cannoli', 'Emy’s Cannoli', 'Emy’s Cann…', 'Cannoli, mobile', '#5C3210', {
    icon: 'emys-cannoli',
    logoTemplate: 'monogram', logoInitials: 'EC', logoFace: 'script',
    site: 'http://emyscannoli.com/',
    contactOnly:
      'The operator filed this one as a MOBILE service rather than a shop, so no address is ' +
      'shown — it does not have one fixed place to be. Nothing else is listed yet.',
  }),
]

/**
 * His numbered spots, as slot indexes on the flagship pages. `null` is a spot
 * his list left effectively open (his #19 repeats an entry — kept open rather
 * than seating the same business twice on one page).
 *
 * Names that map to brands the app already has use the EXISTING id — the
 * roster never forks a second copy of a researched business.
 */
export const BEASTY_GOODS_ROSTER: (string | null)[] = [
  'b_midnighttheories', // 1  Midnight Theories
  'b_topdog', //           2  Top Dog
  'b_bulapies', //         3  Bula pies
  'b_breadwinners', //     4  Bread winners
  'b_winkydinkydogs', //   5  Winky dinky dogs
  'b_rainsplates', //      6  Chef Rain
  'b_downtownbbq', //      7  Downtown BBQ
  'b_glasshouzz', //       8  Glass Houzz
  'b_pippal', //           9  Pippal
  /* SIA Collective takes this seat, on "BEASTY • Goods, replace EAT tile
     please". EAT keeps its services seat at #9 and its place in the dock. */
  'b_siacollective', //    10 SIA Collective
  'b_paulosausage', //     11 Paulo Sausage Co
  'b_lumpiacompany', //    12 Lumpia Company
  'b_hotboyschicken', //   13 Hot boys
  'b_sincitypits', //      14 Sin City Pits
  /* "Can you bump SMASH burgers into the more goods space" — moved to the
     yellow sheet in data/placements.ts, so this seat is open again. */
  null, //                 15 open
  'b_butterpecan', //      16 Butter Pecan bake shop
  'b_veganmob', //         17 Vegan Mob
  'b_poofofalchemy', //    18 Poof of Alchemy
  'b_gaovietkitchen', //   19 Gao
  'b_elemonkey', //        20 Elemonkey
  'b_meadowlarkdairy', //  21 Meadowlark Dairy
  'b_masa', //             22 Masa
  'b_harumiayce', //       23 Harumi - AYCE
  'b_luckyseven', //       24 Lucky Seven
]

export const BEASTY_SERVICES_ROSTER: (string | null)[] = [
  'b_dingdongtogo', //          1  Ding DongToGo
  'b_romantraileriron', //      2  Roman Trailer & Iron work
  'b_luckybarbershop', //       3  Lucky barbershop
  'b_poddtg', //                4  POD DTG
  'b_frankjrenglish', //        5  Frank Jr. English general contractor
  'b_paintgo', //               6  PaintGo
  'b_ubreakifix', //            7  uBreakiFix
  'b_marinabaymedia', //        8  Marina Bay Media
  'b_eat', //                   9  EAT (also goods #10 — same business, his call)
  'b_germanautosport', //       10 German Auto Sport
  'b_bobvalentineselectric', // 11 Bob Valentine's electrician
  /* Bay Area Charters takes this seat, on his 2026-08-14 note: put it on the
     BEASTY page "in place of high-tech audio. You can move high-tech audio to
     the El Cerrito page." High Tech Car Audio is seated there now, on the Car
     audio spot, so it keeps a page rather than losing one. */
  'b_bayareacharters', //       12 Bay Area Charters
  'b_rocknjump', //             13 Rock n' Jump
  'b_djrevroc', //              14 DJ Rev ROC
  'b_petshowgrooming', //       15 Pet Show Grooming - mobile
  'b_drcomicsmrgames', //       16 Dr. Comics and Mr. Games
  'b_rosebarycarcare', //       17 Rosebary Car Care
  'b_highscores', //            18 High Scores arcade
  /* His #19 repeated Ding DongToGo, already seated at #1, and was left open
     until he named a different business for it. He did, on 2026-08-18: "Move
     LOL catering to BEASTY Services". */
  'b_lolcatering', //           19 LOL Catering
  'b_andrewshinlaw', //         20 ANDREW SHIN injury, attorney
  'b_winterwhitecarwash', //    21 Winter White mobile Car Wash
  /* "You can bump ic to yellow pages" — Inter Chiro moved to the yellow sheet
     and Frank2Artistic takes the seat it leaves. */
  'b_frank2artistic', //        22 Frank2Artistic
  'b_georgeprolandscape', //    23 George Professional Landscape
  'b_renecustomcabinetry', //   24 Rene Custom Cabinetry
]
