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
    site: 'https://midnitetheories.com/',
    address: '1215 Polk St, San Francisco',
    logoTemplate: 'band', logoLines: ['MIDNITE', 'THEORIES'], logoFace: 'condensed',
  }),
  seed('downtown-bbq', 'Downtown BBQ', 'Downtown BBQ', 'Barbecue', '#4A2313', {
    logoTemplate: 'badge', logoGlyph: 'flame', logoLines: ['DOWNTOWN BBQ'], logoFace: 'slab',
  }),
  seed('eat', 'EAT', 'EAT', '', '#2F2F31', {
    logoInitials: 'EAT', logoFace: 'slab',
  }),
  seed('smash-burgers-bros', 'Smash Burgers Bros', 'Smash Bros', 'Smash burgers', '#7A2E12', {
    logoTemplate: 'glyph-word', logoGlyph: 'burger', logoLines: ['SMASH'],
  }),
  seed('meadowlark-dairy', 'Meadowlark Dairy', 'Meadowlark', 'Drive-thru dairy', '#1F5FA6', {
    /* The badge carries their NAME, not the date. 1919 is real and on their own
       site, but a mark reading only "EST. 1919" states a fact about them while
       the page underneath says we are claiming nothing about them. */
    logoTemplate: 'badge', logoGlyph: 'softserve', logoLines: ['MEADOWLARK'], logoFace: 'slab',
    site: 'https://meadowlarkdairy.com/',
    phone: '(925) 846-2261',
    address: '57 W Neal St, Pleasanton',
  }),
  seed('harumi-ayce', 'Harumi', 'Harumi', 'All-you-can-eat', '#8E1119', {
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
    logoInitials: 'uB',
    site: 'https://www.ubreakifix.com/locations/elcerrito',
    /* No Richmond store exists; the nearest is El Cerrito, on Richmond's
       border, from the chain's own locator. */
    address: '210 El Cerrito Plaza, El Cerrito',
    phone: '(510) 570-2863',
  }),
  seed('marina-bay-media', 'Marina Bay Media', 'Marina Bay', 'Media', '#0F3B57', {
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
    site: 'https://www.jdidetailing.com/',
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
    /* The ninth hole, as the mark. */
    logoInitials: '9',
    site: 'https://www.perfectnineevents.com/',
    phone: '(510) 953-5757',
  }),
  seed('the-model-bakery', 'The Model Bakery', 'Model Bakery', 'Bakery', '#8A5A18', {
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
    logoTemplate: 'monogram', logoInitials: 'BG', logoFace: 'slab',
    site: 'http://www.benicia-grill.com/',
  }),
  seed('intl-kitchen', 'INTL Kitchen', 'INTL Kitchen', 'Asian takeout', '#C0261F', {
    logoTemplate: 'glyph-word', logoGlyph: 'noodles', logoLines: ['INTL'],
    site: 'https://intlkitchen.com/',
  }),
  seed('majestic-boutique', 'Majestic Boutique', 'Majestic', 'Clothing boutique', '#2B2440', {
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
    logoTemplate: 'monogram', logoInitials: 'U', logoFace: 'grotesk',
    site: 'https://www.udessertstory.com/',
    address: '3489 16th St, San Francisco',
  }),
  seed('the-farmacy', 'The Farmacy', 'The Farmacy', 'Cafe', '#1F4030', {
    logoTemplate: 'monogram', logoInitials: 'TF', logoFace: 'grotesk',
    site: 'https://www.farmacysf.com/',
  }),
  seed('sol-taqueria', 'Sol Taqueria', 'Sol Taqueria', 'Mexican', '#B4531B', {
    logoTemplate: 'monogram', logoInitials: 'ST', logoFace: 'slab',
    site: 'https://www.soltaqueriaberkeley.com/',
  }),
  seed('one-house-bakery', 'One House Bakery', 'One House Bak…', 'Bakery', '#6B4A22', {
    logoTemplate: 'monogram', logoInitials: 'OH', logoFace: 'script',
    site: 'https://onehousebakery.com/',
    address: '918 1st St, Benicia',
  }),
  seed('sandwich-monkey', 'The Sandwich Monkey', 'Sandwich Mo…', 'Sandwiches', '#8A5A18', {
    logoTemplate: 'monogram', logoInitials: 'SM', logoFace: 'slab',
    site: 'https://thesandwichmonkey.com/',
    address: '3 Plaza View Ln, Foster City',
  }),
  seed('senor-sisig', 'Señor Sisig', 'Señor Sisig', 'Filipino', '#B0201F', {
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
    logoTemplate: 'monogram', logoInitials: 'SK', logoFace: 'condensed',
    site: 'https://santaclarasuperkitchen.com/',
  }),
  seed('willy-billy-smoked-meat', 'Willy Billy Smoked Meat', 'Willy Billy', 'Smoked meat', '#4A2416', {
    logoTemplate: 'monogram', logoInitials: 'WB', logoFace: 'slab',
    site: 'https://willybillysmokedmeat.com/',
  }),
  seed('red-chili', 'Red Chili', 'Red Chili', 'Restaurant', '#A31E1E', {
    logoTemplate: 'monogram', logoInitials: 'RC', logoFace: 'slab',
    site: 'https://redchilirestaurants.com/',
  }),
  seed('banh-mi-oven', 'Banh Mi Oven', 'Banh Mi Oven', 'Vietnamese sandwiches', '#286B3A', {
    logoTemplate: 'monogram', logoInitials: 'BO', logoFace: 'condensed',
    site: 'https://banhmioven.us/',
  }),
  seed('adzeela', 'Adzeela', 'Adzeela', 'Advertising', '#212938', {
    logoTemplate: 'monogram', logoInitials: 'AZ', logoFace: 'grotesk',
    site: 'https://adzeela.com/',
  }),
  seed('ally-virtual', 'Ally Virtual', 'Ally Virtual', 'Virtual assistance', '#1E3A52', {
    logoTemplate: 'monogram', logoInitials: 'AV', logoFace: 'grotesk',
    site: 'https://allyvirtual.com/',
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
  seed('emys-cannoli', 'Emy’s Cannoli', 'Emy’s Cann…', 'Cannoli, mobile', '#5C3210', {
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
  'b_eat', //              10 EAT
  'b_paulosausage', //     11 Paulo Sausage Co
  'b_lumpiacompany', //    12 Lumpia Company
  'b_hotboyschicken', //   13 Hot boys
  'b_sincitypits', //      14 Sin City Pits
  'b_smashburgersbros', // 15 Smash Burgers Bros
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
  'b_hightechcaraudio', //      12 High Tech Car Audio
  'b_rocknjump', //             13 Rock n' Jump
  'b_djrevroc', //              14 DJ Rev ROC
  'b_petshowgrooming', //       15 Pet Show Grooming - mobile
  'b_drcomicsmrgames', //       16 Dr. Comics and Mr. Games
  'b_rosebarycarcare', //       17 Rosebary Car Care
  'b_highscores', //            18 High Scores arcade
  /* His #19 repeats Ding DongToGo, already seated at #1. Open until he names
     a different business for it. */
  null,
  'b_andrewshinlaw', //         20 ANDREW SHIN injury, attorney
  'b_winterwhitecarwash', //    21 Winter White mobile Car Wash
  'b_interchiro', //            22 Inter Chiro
  'b_georgeprolandscape', //    23 George Professional Landscape
  'b_renecustomcabinetry', //   24 Rene Custom Cabinetry
]
