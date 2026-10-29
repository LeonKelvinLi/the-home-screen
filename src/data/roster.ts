import type { LocalSeed } from './localBrands'
import { ROSTER_RESEARCH } from './rosterResearch'

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

/*
  THE SAME NOTE FOR A NAME THAT ALREADY CARRIES AN ADDRESS OR A NUMBER.

  Nineteen roster pages printed a published street address beside the words
  "nothing is listed yet". Both were true in their own way — his list, their
  address — and together they read as a page contradicting itself. So a name
  that arrived with an address or a phone says so, and says the rest is still
  being gathered, which is what is actually the case.
*/
const ROSTER_NOTE_PARTIAL =
  'This spot is reserved on the operator’s roster. The address and number here are ' +
  'the business’s own; the rest of their details — what they sell and what it ' +
  'costs — are still being gathered, so nothing else is claimed about them yet.'

/*
  THE RESEARCH LAYER SITS ON TOP OF HIS LIST, AND HIS LIST IS NOT EDITED.

  Every name below is his roster as he sent it. What each business actually
  publishes — address, hours, a number, a menu with prices — was gathered
  later from the business's own website and lives in rosterResearch.ts, keyed
  by slug and merged here. Two files on purpose: this one stays a faithful
  copy of what he wrote, and the other is provenance-stamped research that can
  be regenerated, reviewed and corrected without touching his roster.

  When research exists, the "he is still gathering their details" note is
  DROPPED — it would be false next to a published address — and replaced by
  whatever the research says: a menu, a quoted price list, or a sentence about
  a business that publishes no prices. A name with no research keeps the note.
*/
const seed = (
  slug: string,
  name: string,
  label: string,
  cuisine: string,
  color: string,
  extra?: Partial<LocalSeed>,
): LocalSeed => {
  const research = ROSTER_RESEARCH[slug]
  /* A seed that brings its own menu retires the placeholder the same way
     research does below. Chef Jeff's menu was read off their own board and
     written here by hand, and it rendered under "still gathering details". */
  const ownMenu = !!(extra?.items?.length || extra?.sections?.length || extra?.groups?.length || extra?.quoteOnly)
  const base: LocalSeed = {
    slug,
    name,
    label,
    cuisine,
    tagline: '',
    color,
    prep: 0,
    category: 'Roster',
    contactOnly: ownMenu ? undefined : extra?.address || extra?.phone ? ROSTER_NOTE_PARTIAL : ROSTER_NOTE,
    items: [],
    ...extra,
  }
  if (!research) return base
  const merged: LocalSeed = { ...base, ...research }
  /*
    RESEARCH THAT SAYS WHAT THEY SELL RETIRES WHATEVER STOOD IN FOR IT.

    Every contactOnly on a roster name — the generic note, the partial note, or
    a hand-written line like "nothing else is listed yet" — was written as a
    placeholder for the day the business's own menu or price list arrived. A
    page cannot carry a priced menu AND a paragraph saying nothing is listed;
    the data audit flags exactly that pair. So a menu, a quoted price list or a
    researched sentence replaces the placeholder outright. What survives from
    the hand-written extras is everything else: the clip, the mark, the CTA.
  */
  if (research.items?.length || research.sections?.length || research.groups?.length || research.quoteOnly || research.contactOnly) {
    merged.contactOnly = research.contactOnly
  }
  return merged
}

/*
  Colours rotate through the app's own dark tile palette so a page of
  placeholders still looks like a page of apps rather than a grid of grey.
*/
export const ROSTER_SEED: LocalSeed[] = [
  // ---- from BEASTY • GOODS ----
  /* Their own about page: a skate shop on Polk St in San Francisco — apparel,
     skate goods, safety gear. His roster spells it Midnight; the shop spells
     it Midnite, and the shop wins. */
  /* GLOW: a paid Tier 3 sample, on his ask of 2026-09-03 — "put an icon glow
     on midnight theories and Gao just so I could use it as an example". */
  seed('midnight-theories', 'Midnite Theories', 'Midnite Th…', 'Skate shop', '#1C1C2E', {
    glow: true,
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
    /*
      AGREED, 2026-09-02. Glenn texted the owner the mock-up ("Just some
      temporary examples unless you wanna keep it or change it") and the owner
      wrote back his own two lines, each with a thumbs-up: "Loyalty 10% off
      entire check" and "First time visit. Free soft serve"; Glenn added "with
      the purchase of any meal for each guest" to the welcome. So `mock` is
      gone: these are the business's own terms, in their words.
    */
    offers: {
      welcome: 'Free soft serve on your first visit, with the purchase of any meal, for each guest.',
      loyalty: '10% off the entire check.',
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
    /* Their own badge since 2026-10-26 (Glenn: "Please update icon"); a new file name so no
       phone keeps the old tile from its cache, as with Harumi. */
    icon: 'meadowlark-dairy-2',
    /* The badge carries their NAME, not the date. 1919 is real and on their own
       site, but a mark reading only "EST. 1919" states a fact about them while
       the page underneath says we are claiming nothing about them. */
    logoTemplate: 'badge', logoGlyph: 'softserve', logoLines: ['MEADOWLARK'], logoFace: 'slab',
    site: 'https://meadowlarkdairy.com/',
    phone: '(925) 846-2261',
    address: '57 W Neal St, Pleasanton',
    /* Glenn, 2026-10-26: "Clip this video plz / For Pleasanton location". Two more films are in OTHER_REVIEWS. */
    clip: {src: '/clips/meadowlark-dairy.mp4', poster: '/clips/meadowlark-dairy-poster.webp', href: 'https://www.instagram.com/reel/C8vSXSDPZGq/', credit: 'Filmed by @grubwitmike', platform: 'Instagram', by: 'grubwitmike'},
  }),
  seed('harumi-ayce', 'Harumi', 'Harumi', 'All-you-can-eat', '#8E1119', {
    /* His own 'x Biggie' sheet, quoted rather than paraphrased — the
       qualifying condition IS the offer. mock until the business signs it. */
    offers: {
      mock: true,
      welcome: '$10 off each all-you-can-eat, no limit on your first visit.',
      loyalty: 'A free can of soda with any purchase, any visit.',
    },
    /* No site: the Yelp page that stood here is not theirs, and neither is
       harumisushihibachi.com, an auto-generated booking site (checked
       2026-09-13). The tile's outline says so until they have one. */
    logoTemplate: 'band', logoLines: ['HARUMI', 'AYCE'],
    /* "Please update icon for this place" — Glenn, 2026-10-15, with a screenshot of
       their profile picture (the 晴海 mark) and @zarina.nawabi's reel ("Clip this video
       plz"). A new file name so no phone keeps the old tile from its cache. */
    icon: 'harumi-ayce-2',
    clip: {
      src: '/clips/harumi-ayce.mp4',
      poster: '/clips/harumi-ayce-poster.webp',
      href: 'https://www.instagram.com/reel/DNYa_Wlx1G2/',
      credit: 'Filmed by @zarina.nawabi',
      platform: 'Instagram',
      by: 'zarina.nawabi',
    },
  }),
  /*
    Lucky Three Seven, Oakland. Filled out 2026-08-20 from the Instagram profile
    and the logo he sent — "Oakland • Goods & update BEASTY • goods".

    THE NAME WAS WRONG HERE. It was read off one of his list screenshots as
    "Lucky Seven"; the business is Lucky Three Seven, @luckythreeseven. The slug
    moved with it, and the seat below moved with the slug.

    THE LINK IS A GOFUNDME AND THAT IS DELIBERATE. "Please attach this as their
    website link for now", followed by "They need a website. Note" — so the seat
    carries the fundraiser AND stays on the red-outline prospect list. That is
    what `needsSite` exists for: without it, the stopgap link would have quietly
    taken them off the list he prospects from.

    Trade is Filipino, from their OWN billing rather than a guess off the name —
    the mark reads "XL LUMPIA & G-FIRE WINGS" and their pinned highlight is how
    to pronounce tocino.
  */
  seed('lucky-three-seven', 'Lucky Three Seven', 'Lucky 3 Seven', 'Filipino food', '#0B0B0D', {
    icon: 'lucky-three-seven',
    /* Batch 75: Glenn's Watch film is @hungry4munchies. The original 6–22s Lucky-only
       excerpt is retained as an additional review, beside Maya and Larry's wings tasting. */
    clip: {
      "src": "/clips/lucky-three-seven-b75.mp4",
      "poster": "/clips/lucky-three-seven-b75-poster.webp",
      "href": "https://www.instagram.com/reel/DevbNctK0uP/",
      "credit": "Filmed by @hungry4munchies",
      "platform": "Instagram",
      "by": "hungry4munchies"
    },
    site: 'https://www.gofundme.com/f/my-brothers-wish-for-kiah',
    siteCta: 'Open their GoFundMe',
    needsSite: true,
    address: '2868 Fruitvale Ave, Oakland, CA',
    contactOnly:
      'Filipino food in Fruitvale — lumpia and wings, by their own billing. They have no ' +
      'website yet, so the link goes to the family fundraiser the owner is running, which is ' +
      'what the operator asked it to point at for now. Nothing else is listed.',
  }),
  /*
    Forno Piombo, American Canyon — "BEASTY • More Goods and American Canyon
    city", 2026-08-21, from their Instagram profile and the product page he
    linked. Verified account, 16.4K followers, and their own line is "we design
    the highest quality and best performing pizza ovens in the world".

    THEY MAKE THE OVEN, they do not cook on it, which is why they sit on a
    yellow page in both places rather than in a numbered food category. None of
    the twenty-four fits an oven manufacturer and inventing one would move every
    tile in every city to fit one business. He named "More Goods" himself for
    the flagship; American Canyon follows the same reasoning.

    Worth raising: BEASTY • Online was created for exactly this — "brands that
    ship products" — and this is one. His instruction said More Goods, so that
    is where it is.
  */
  seed('forno-piombo', 'Forno Piombo', 'Forno Piombo', 'Pizza ovens', '#F5F5F5', {
    icon: 'forno-piombo',
    site: 'https://fornopiombo.com/products/tiled-roman-80',
    siteCta: 'See the Tiled Roman 80',
    address: '120 Klamath Ct, American Canyon, CA',
    contactOnly:
      'Handmade pizza ovens, in their own words: "we design the highest quality and best ' +
      'performing pizza ovens in the world". The link goes to the Tiled Roman 80, which is the ' +
      'model the operator sent. Nothing else is listed yet.',
  }),
  /*
    Almas Auto & Tires, Newark — sent 2026-08-21 with "Needs website updated",
    which is why they carry `needsSite` even though almasautoandtiresca.com
    exists and resolves. The red outline is his PROSPECT list, and a business
    whose site he wants rebuilt belongs on it exactly as much as one with no
    site at all. That is a wider reading than the flag was written for; he
    opened it himself with this message.

    Verified account, 1,664 followers. The service list below is theirs off
    their own bio, in their own order.
  */
  seed('almas-auto-tires', 'Almas Auto & Tires', 'Almas Auto', 'Mechanic and tires', '#F2F2F2', {
    icon: 'almas-auto-tires',
    site: 'https://almasautoandtiresca.com',
    needsSite: true,
    address: '6110 Jarvis Ave, Newark, CA 94560',
    contactOnly:
      'An automotive repair shop, in their own words: auto repair, tires and rims, suspension, ' +
      'tinting and wrap/PPF, diagnostics, full service and vehicle storage. Nothing is priced ' +
      'here \u2014 none of it has been confirmed with them yet.',
  }),
  /*
    Gofrette Pamper & Play, Brentwood — "Brentwood • Services", 2026-08-21, from
    their Instagram and gofrette.com. A groomer and daycare, which is the one
    category on his services list that fits without any stretching at all.
  */
  seed('gofrette', 'Gofrette Pamper & Play', 'Gofrette', 'Pet grooming and daycare', '#FBF3F1', {
    icon: 'gofrette',
    site: 'https://www.gofrette.com/',
    address: '50 Eagle Rock Way STE B, Brentwood, CA',
    contactOnly:
      'Dog grooming and daycare, by their own billing \u2014 "Grooming & Daycare" is on their ' +
      'mark. Nothing is priced here yet; book or ask on their own site.',
  }),
  /*
    The 2026-08-21 afternoon run — six businesses in ninety minutes, each sent
    with the page written beside it.
  */
  seed('golden-state-ballerz', 'Golden State Ballerz', 'GSB', 'Football gear', '#F2F2F2', {
    icon: 'golden-state-ballerz',
    site: 'https://golden-state-ballerz.myshopify.com/',
    contactOnly:
      'Football gear, in their own words: "next-gen gear for the ones who play different". ' +
      'They ship, which is what the Online page is for. Nothing is priced here yet.',
  }),
  seed('united-curb-painting', 'United Curb Painting', 'United Curb', 'Curb painting', '#1B6FD1', {
    icon: 'united-curb-painting',
    site: 'https://unitedcurbpainting.com/',
    contactOnly:
      'Curb address painting across the Bay Area and the Central Valley, in their own words. ' +
      'They take bookings by text on 530-360-1105. Nothing is priced here yet.',
  }),
  seed('classy-canines', "Classy Canine's Wiggle Rumps", 'Wiggle Rumps', 'Pet grooming', '#F6D9E4', {
    icon: 'classy-canines',
    site: 'https://www.classycanineswigglerumps.com/',
    address: '2602 Castro Valley Blvd, Castro Valley, CA',
    contactOnly:
      'A grooming salon with luxury mobile grooming, pet retail and dog training, by their own ' +
      'billing. Book on their own site. Nothing is priced here yet.',
  }),
  seed('oneills-signature', "O'Neills Signature Sports", "O'Neills", 'Turf and pavers', '#EDEDED', {
    icon: 'oneills-signature',
    site: 'https://paversandturf.com/',
    address: '6200 Stoneridge Mall Rd #300, Pleasanton, CA',
    contactOnly:
      'A landscape company, and by their own description a premium sports installer and ' +
      'designer for the greater Bay Area — turf and pavers. Quotes are by enquiry.',
  }),
  seed('trufusion-walnut-creek', 'TruFusion Walnut Creek', 'TruFusion', 'Bootcamp, pilates and yoga', '#141416', {
    icon: 'trufusion-walnut-creek',
    site: 'https://trufusion.com/',
    address: '1675 Olympic Blvd, Walnut Creek, CA',
    contactOnly:
      'Bootcamp, pilates, yoga and reformer classes, from their own listing. Class times and ' +
      'membership prices are on their site \u2014 nothing is copied here.',
  }),
  /*
    "This place needs a website", so Camacho's carries `needsSite` and keeps the
    red outline. Their own line is "we are the #1 in the Bay area", which is a
    marketing claim and stays off the page as one.
  */
  seed('camachos-party-rentals', "Camacho's Party Rentals", "Camacho's", 'Party rentals', '#F7C948', {
    site: 'https://camachospartyrentals.com/',
    icon: 'camachos-party-rentals',
    needsSite: true,
    phone: '(707) 308-8935',
    contactOnly:
      'Party rentals in Santa Rosa \u2014 bounce houses, tents and event kit, from their own ' +
      'feed. They answer in English and Spanish. No website yet: call or message them.',
  }),
  /*
    Boudreaux Cajun Steak House, Fairfield — "these guys need a whole lot of
    help. I deliver for them maybe every other week they have a food truck.
    Fairfield • Goods", 2026-08-21.

    THE RESTAURANT IS NOT OPEN YET and the page has to say so. Their own site
    puts 814 Texas Street "currently under construction"; what is running today
    is the food truck and catering, around the Bay Area and Sacramento. An
    address on a tile reads as somewhere you can walk into, so this one is
    written as the address of the building being fitted out, not of a place to
    turn up at tonight.

    THE ICON IS A PLACEHOLDER AND IS NOT THEIR ARTWORK. See
    public/icons/CREDITS.md — the operator's words were "we will just put them
    in there to fill space for now until I deliver to them again".
  */
  seed('bou-cajun', 'Boudreaux Cajun Steak House', 'Boudreaux', 'Cajun and steaks', '#141110', {
    icon: 'bou-cajun',
    site: 'https://www.boucajun.com/',
    phone: '(844) 305-2260',
    address: '814 Texas Street, Fairfield, CA 94533',
    contactOnly:
      'New Orleans Cajun cooking — a food truck and catering around the Bay Area and ' +
      'Sacramento, in their own words. THE TEXAS STREET RESTAURANT IS STILL UNDER ' +
      'CONSTRUCTION and not open to the public; call or check their site for where the truck ' +
      'is. Nothing is priced here yet.',
  }),
  /*
    Bloom Balloon, Milpitas — "Milpitas • Services", 2026-08-22. Verified
    account, 14.3K followers. Their bio leads with "2000+ happy customers" and
    "5 stars on Yelp and Google", which are marketing claims and stay off the
    page as claims; what is on it is what they do.

    SENT TWICE. He first filed them on 2026-08-15 under San Jose, then again a
    week later under Milpitas, and each send wrote its own seed — same slug,
    same business, two records. Only one could ever win, silently, because the
    id is derived from the slug; this is the one that survives, being the
    later send and the one carrying their published address.

    They are still seated on BOTH city pages. Their own address is in
    Milpitas, so San Jose is worth him confirming — but which city he sells
    them into is his call, not a thing to quietly drop.
  */
  seed('bloom-balloon', 'Bloom Balloon', 'Bloom Balloon', 'Balloon design', '#5FC8C4', {
    icon: 'bloom-balloon',
    site: 'https://bloomballoon.com/connect',
    address: '1090 S Milpitas Blvd, Milpitas, CA',
    contactOnly:
      'Balloon design for birthdays, baby showers and graduations, in their own words. ' +
      'Enquire on their own site. Nothing is priced here yet.',
  }),
  /*
    YogaSix East Contra Costa, Brentwood — "Brentwood • Services", 2026-08-22.
    He sent two marks and said "either one"; the disc is the one that survives
    being a square tile 148px across, where the horizontal wordmark could only
    shrink until neither half read.
  */
  seed('yogasix-brentwood', 'YogaSix East Contra Costa', 'YogaSix', 'Yoga studio', '#F0A090', {
    icon: 'yogasix-brentwood',
    site: 'https://www.yogasix.com/location/east-contra-costa',
    address: '5471 Lone Tree Way #110, Brentwood, CA',
    contactOnly:
      'A yoga studio on Lone Tree Way. Class times, styles and membership prices are on ' +
      'their own site — nothing is copied here.',
  }),
  /*
    Macstalgia — "let's put this in the middle of the online page for the hell
    of it bro", 2026-08-22.

    NOBODY HAS AGREED ANYTHING HERE. He had DM'd them minutes before: "I just
    dm'd this person. Lets see if I can lock them in to selling on our
    platform." The seat is a hope, which is exactly what every roster tile
    already says on its own page, so it needs no special wording — but it is
    worth knowing before anyone treats this as a partner.

    Their logo is their own, off macstalgia.com. Framed vinyl; they ship, which
    is what the Online page is for.
  */
  seed('macstalgia', 'Macstalgia', 'Macstalgia', 'Framed vinyl', '#0E0C0A', {
    icon: 'macstalgia',
    site: 'https://www.macstalgia.com/',
    contactOnly:
      'Framed vinyl records, in their own words "a bohemian collection for the gold dust ' +
      'soul". They ship worldwide. Nothing is priced here yet.',
  }),
  /*
    Healthy Spot Berkeley — "Berkeley • Services", 2026-08-22. Two shops, both
    theirs: North Berkeley on Walnut St and Rockridge on College Ave. The
    address below is the Berkeley one, since that is the page they sit on.
  */
  seed('healthy-spot-berkeley', 'Healthy Spot Berkeley', 'Healthy Spot', 'Pet store and grooming', '#3E9B3E', {
    icon: 'healthy-spot-berkeley',
    site: 'https://linktr.ee/healthyspotnorcal',
    siteCta: 'Open their links',
    address: '1510 Walnut St, Berkeley, CA',
    contactOnly:
      'A pet store serving the Bay since 2019, in their own words — "for your pet\u2019s needs, ' +
      'from mind, body, to bowl". They also have a Rockridge shop at 3206 College Ave. ' +
      'Nothing is priced here yet.',
  }),
  /*
    The Barrel Bistro & Wine Bar — "San Mateo • Goods", 2026-08-22, with "try
    and crop the icon in that logo as big as possible if you may please". Their
    mark is a disc, so it fills the tile edge to edge with nothing trimmed.
  */
  seed('barrel-bistro', 'The Barrel Bistro & Wine Bar', 'The Barrel', 'Wine bar and bistro', '#141013', {
    icon: 'barrel-bistro',
    site: 'https://www.thebarrelbistrowinebar.com/',
    address: '246 South B Street, San Mateo, CA',
    contactOnly:
      'A wine bar and bistro — "exceptional wines and delicious bites, brunch, dinner and ' +
      'everything in between", their own line. Nothing is priced here yet.',
  }),
  /*
    Bay Area Power Wash Pros opens Oakley, 2026-08-22 — "these are like brand
    new! lol", and the account is: one post, three followers. The free-estimate
    number is theirs and is the only way to reach them, so it is the page.
  */
  seed('bay-area-power-wash', 'Bay Area Power Wash Pros', 'Power Wash Pros', 'Pressure washing', '#141A38', {
    icon: 'bay-area-power-wash',
    phone: '(925) 726-8577',
    contactOnly:
      'Soft washing for houses and pressure washing for driveways, in their own words, around ' +
      'Oakley. They quote free by call or text. No website yet.',
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
  /*
    Filled out 2026-08-20 from their own site and listing — "update on BEASTY &
    Vallejo • Services. Please add directions as well."

    "Painting" was the guess the name invited and it was the wrong trade: they
    do exotic paint systems, ceramic coating, detailing and window tinting on
    CARS. The blue was a guess too. Their wordmark sits on their own grey, which
    is what he asked for — "maybe put Paint Go on that gray background".
  */
  seed('paintgo', 'PaintGo', 'PaintGo', 'Auto paint, ceramic coating and tinting', '#8A9093', {
    icon: 'paintgo',
    logoTemplate: 'glyph-word', logoGlyph: 'design', logoLines: ['PAINTGO'],
    site: 'https://www.paintgonorcal.com/',
    address: '1640 Lewis Brown Dr, Vallejo, CA 94589',
    phone: '(707) 805-3334',
    contactOnly:
      'Exotic paint systems, ceramic coating, detailing and window tinting across Northern ' +
      'California, in their own words. Open 9am to 6pm. Quotes are by enquiry.',
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
  /*
    Marina Bay Media's own artwork, 2026-08-21 — "would you please crop this for
    their icon and you can put that on their page on the top the whole thing
    that says Marina Bay media rather than the icon on the page".

    So there are two files. The icon is the MBM monogram and the wave, which is
    all a square can hold; the page carries the full lockup with MAKE WAVES.
    Both are lifted from their own site — the drawn `band` template that stood
    in for a logo until now is gone.

    THE COLOUR MOVED WITH THEM. It was a dark navy, chosen when the tile was
    type on a plate. Their mark is navy ON CREAM, so a cream ground is what
    their own artwork was drawn for; the old navy would have put a cream
    rectangle in the middle of a dark blue hero.
  */
  seed('marina-bay-media', 'Marina Bay Media', 'Marina Bay', 'Media', '#F7F4EC', {
    icon: 'marina-bay-media',
    pageMark: '/marks/marina-bay-media.webp',
    site: 'https://www.marinabaymedia.com/',
  }),
  seed('german-auto-sport', 'German Auto Sport', 'German Auto', 'Auto repair', '#22262B', {
    site: 'https://gasberkeleyrepair.com/',
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
  /*
    Filled out 2026-08-20 from the Concord location page he sent — "update on
    BEASTY as well as add to Concord • Services". Their own mark replaces the
    RJ monogram, and the purple it was drawn on was a guess: their colour is
    orange.
  */
  seed('rock-n-jump', "Rockin' Jump", "Rockin' Jump", 'Trampoline park', '#F26722', {
    icon: 'rock-n-jump',
    logoInitials: 'RJ',
    site: 'https://rockinjump.com/concord/',
    address: '1631 Challenge Dr, Concord, CA 94520',
    phone: '(925) 332-0285',
    email: 'Concord-CA@RockinJump.com',
    contactOnly:
      'A trampoline park in Concord. Park prices, hours, parties and waivers are all on their ' +
      'own site, which is where they change.',
  }),
  seed('dj-rev-roc', 'DJ Rev ROC', 'DJ Rev ROC', 'DJ', '#141416', {
    logoInitials: 'DJ', logoFace: 'condensed', logoAccent: '#f6d800',
  }),
  seed('pet-show-grooming', 'Pet Show Grooming', 'Pet Show', 'Mobile pet grooming', '#0E6B6B', {
    logoTemplate: 'badge', logoLines: ['PET SHOW'], logoFace: 'slab',
  }),
  seed('dr-comics-mr-games', 'Dr. Comics and Mr. Games', 'Dr. Comics', 'Comics and games', '#5C2A83', {
    site: 'https://drcomicsmrgames.tumblr.com/',
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
    site: 'https://www.injuryattorneydirect.com/',
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
  /* The 2026-09-09 menu sweep found their own site and ordering page, and
     their two rooms are San Bruno and San Francisco — not San Mateo, where he
     seated them. The seat stays his; the page shows their address. */
  seed('pho-de-nguyen', 'Pho De Nguyen', 'Pho De Ng…', 'Vietnamese, pho', '#7A1F1F', {
    logoTemplate: 'monogram', logoInitials: 'PN', logoFace: 'slab',
    site: 'https://phodenguyen.com/',
    siteCta: 'Order online',
  }),
  seed('maymays-cravings', 'Maymay’s Cravings', 'Maymay’s', 'Filipino desserts', '#8C2F5A', {
    icon: 'maymays-cravings-2',
    logoTemplate: 'monogram', logoInitials: 'MC', logoFace: 'script',
    site: 'https://order.online/store/35787203',
    /* Glenn, 2026-10-15/16: requested film; caption confirms this business. */
    clip: {
        "src": "/clips/maymays-cravings.mp4",
        "poster": "/clips/maymays-cravings-poster.webp",
        "href": "https://www.instagram.com/reel/DeiOY86oJv1/",
        "credit": "Posted by @maymayscravings",
        "platform": "Instagram"
    },
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
  /* The 2026-09-09 menu sweep found their own site behind the Instagram
     link, with the whole menu priced. */
  seed('one-house-bistro', 'One House Bistro', 'One House', 'Bistro, brunch and dinner', '#6B5426', {
    logoTemplate: 'monogram', logoInitials: 'OH', logoFace: 'grotesk',
    site: 'https://onehousebistro.com/',
    siteCta: 'See the menu',
    address: '2468 San Ramon Valley Blvd, San Ramon',
  }),
  seed('benicia-grill', 'Benicia Grill', 'Benicia Grill', 'American grill', '#8C3A1E', {
    icon: 'benicia-grill-2',
    logoTemplate: 'monogram', logoInitials: 'BG', logoFace: 'slab',
    site: 'http://www.benicia-grill.com/',
    /* Glenn, 2026-10-15/16: requested film; caption confirms this business. */
    clip: {
        "src": "/clips/benicia-grill.mp4",
        "poster": "/clips/benicia-grill-poster.webp",
        "href": "https://www.instagram.com/reel/DZ8VTQuS-XB/",
        "credit": "Filmed by @jbrenes_",
        "platform": "Instagram",
        "by": "jbrenes_"
    },
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
  /*
    LAVANTA IS NO LONGER A ROSTER STUB, 2026-08-30. He sent them again with
    "San Leandro • Goods", and their own site publishes an address, a number
    and three PDF menus with real prices on them — so the roster line about
    still gathering their details had stopped being true, and it is overridden
    below rather than left to say something false on their page.

    NO HOURS, and this is the thing to ask them. Their site publishes two
    schedules that cannot both hold: brunch Friday to Sunday from 9am, and
    dining Friday to Sunday from 11am. Nothing reconciles them, so neither is
    printed.

    NO INSTAGRAM. Their footer prints the words Facebook, Instagram and TikTok
    and attaches no link to any of them — dead labels, not handles, so there is
    nothing to link to.

    TWO THINGS WORTH TELLING THEM. Their "ORDER ONLINE" button goes to a Toast
    page whose account is still named "moussaka" at this same address, which
    looks like a rebrand nobody finished; and their "Contact Us" link goes to
    their own homepage, because no contact page exists.

    Prices are the dine-in menu. Their catering PDF prices several of the same
    dishes lower — Moussaka $36 against $42 — so these are the sit-down prices,
    not the only prices they charge.
  */
  seed('lavanta', 'Lavanta', 'Lavanta', 'Mediterranean', '#2E4A34', {
    logoTemplate: 'monogram', logoInitials: 'LV', logoFace: 'condensed',
    site: 'https://www.eatlavanta.com/',
    category: 'Mediterranean',
    contactOnly: undefined,
    tagline: 'Mezze, lamb and wine, San Leandro.',
    phone: '(510) 822-5329',
    address: '599 Dutton Ave, San Leandro, CA 94577',
    items: [
      ['Tzatziki', '', 1400],
      ['Dolmadakia Yialantzi', '', 1400],
      ['Grilled Halloumi', '', 1600],
      ['Aegean Saganaki', '', 2400],
      ['Grilled Octopus', '', 2800],
      ['Lamb Ragù Pappardelle', '', 3200],
      ['Lamb Moussaka', '', 4200],
      ['Grilled Lamb Chops', '', 4800],
    ],
    offer: ['Grilled Halloumi', 'Grilled Octopus', 'Lamb Moussaka', 'Grilled Lamb Chops'],
    panels: [
      {
        head: 'Also on their menu',
        body: [
          'A prix fixe at $49 a head, three courses, Monday to Thursday 11:30 to 4. A 20% gratuity is added.',
          'Catering from a separate menu, $400 minimum with a $100 delivery fee.',
        ],
      },
    ],
  }),
  /* His link said tetsujinsushi.com and the screenshot in the same message was
     @kaisendon1939, which looked like two businesses. It is one: that site
     trades as "Sushi | Tetsujin Kaisen Don" and prints this same Marina Blvd
     address. Checked rather than assumed, because seating a business under
     another's website is the kind of error nobody catches later. */
  seed('kaisen-don', 'Kaisen Don', 'Kaisen Don', 'Sushi and donburi', '#1B1B22', {
    /* Their fish-in-a-circle mark, from the Instagram Glenn resent on
       2026-09-27, in place of the KD initials; and their Toast ordering. */
    icon: 'kaisen-don-mark',
    logoTemplate: 'monogram', logoInitials: 'KD', logoFace: 'grotesk',
    site: 'https://www.tetsujinsushi.com/',
    orderUrl: 'https://order.toasttab.com/online/kaisen-don',
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
  /* TWO SHOPS, NOT ONE. He sent them again on 2026-08-31 labelled "Berkeley •
     Goods / San Francisco • Goods", and their own Instagram bio pins both:
     3489 16th St in San Francisco and 1849 Shattuck Ave in Berkeley. Only the
     San Francisco one was listed, so the Berkeley page had no dessert shop
     while this one sat a mile from it. Seated on both now. */
  seed('u-dessert-story', 'U Dessert Story', 'U Dessert', 'Dessert shop', '#20202A', {
    icon: 'u-dessert-story',
    /* Batch 59. Glenn, 2026-10-20, 1:15 am: "Clip this video plz / Foodie". Filmed at the Berkeley shop on Shattuck; the one seed holds both cities, so San Francisco plays it too. */
    clip: {
      src: '/clips/u-dessert-story.mp4',
      poster: '/clips/u-dessert-story-poster.webp',
      href: 'https://www.instagram.com/reel/DciKBxnt2o-/',
      credit: 'Filmed by @simply_dorothy_',
      platform: 'Instagram',
      by: 'simply_dorothy_',
    },
    logoTemplate: 'monogram', logoInitials: 'U', logoFace: 'grotesk',
    site: 'https://www.udessertstory.com/',
    address: '3489 16th St, San Francisco',
    instagram: 'udessertstory',
    panels: [
      {
        head: 'Both shops',
        body: [
          'San Francisco — 3489 16th St',
          'Berkeley — 1849 Shattuck Ave',
        ],
      },
    ],
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
    site: 'https://donutfarmberkeley.com/',
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
    site: 'https://boberteaus.com/',
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
    /* Glenn, 2026-10-12, "Clip this video plz for @pizzeriacardamomo": @acoupleofcooks'
       date night there, from "From Lake Como to Redwood City" to the pizza. */
    clip: {
      src: '/clips/pizzeria-cardamomo.mp4',
      poster: '/clips/pizzeria-cardamomo-poster.webp',
      href: 'https://www.instagram.com/reel/DeXPu11oz2S/',
      credit: 'Filmed by @acoupleofcooks',
      platform: 'Instagram',
      by: 'acoupleofcooks',
    },
    contactOnly:
      'Sent 2026-08-12 with his note "needs branding work. No logo" — so this tile is a ' +
      'monogram rather than their mark, because they do not have one.',
  }),
  seed('great-impasta', 'Great Impasta', 'Great Impasta', 'Italian', '#2E4A2A', {
    /* "Please update their icon" — Glenn, 2026-10-15, with their own round logo (the
       street signs, Since 1992, Danville Livery). It replaces the GI monogram. */
    icon: 'great-impasta-2',
    logoTemplate: 'monogram', logoInitials: 'GI', logoFace: 'script',
    site: 'https://greatimpastadanville.com/',
  }),
  /* "Needs Website update. Current one isn't working." (2026-09-19) — and it
     is not: chutneys.ai is still a placeholder with a contact form. The link
     is off the page, the red outline stays, and the facts are their Instagram
     (research batch27). The mark is cut from their own post. */
  seed('chutneys', 'Chutneys', 'Chutneys', 'Indian', '#8A4A12', {
    icon: 'chutneys',
    logoTemplate: 'monogram', logoInitials: 'CH', logoFace: 'slab',
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

  /* ---- 2026-09-03 ---- */
  /* The overnight batch after Empire State. Every fact is from the business's
     own page or bio; where a menu sits behind DoorDash or Toast, the page
     says so and links it. */
  seed('ruben-hibachi-grill', 'Ruben Hibachi Grill', 'Ruben Hibachi', 'Hibachi and catering', '#C8102E', {
    icon: 'ruben-hibachi-grill',
    logoTemplate: 'monogram', logoInitials: 'RH', logoFace: 'condensed',
    site: 'https://www.doordash.com/store/rubenhibchigrill-san-lorenzo-44744433/109287358/',
    siteCta: 'Order on DoorDash',
  }),
  seed('love-burn', 'Love Burn Hot Chicken', 'Love Burn', 'Nashville hot chicken', '#D7191F', {
    icon: 'love-burn',
    logoTemplate: 'monogram', logoInitials: 'LB', logoFace: 'condensed',
    site: 'https://order.toasttab.com/online/love-burn-521a-3rd-street',
    siteCta: 'Order on Toast',
  }),
  seed('the-tox-alamo', 'The Tox Alamo', 'The Tox', 'Lymphatic body sculpting', '#111111', {
    icon: 'the-tox-alamo',
    logoTemplate: 'monogram', logoInitials: 'TX', logoFace: 'condensed',
    site: 'https://www.thetoxtechnique.com/',
    siteCta: 'See The Tox Technique',
  }),
  seed('ethos-of-california', 'Ethos Of California', 'Ethos', 'Barbershop', '#1C1C1E', {
    logoTemplate: 'wordmark', logoLines: ['ETHOS'], logoFace: 'condensed',
    site: 'https://www.vagaro.com/ethosofcalifornia',
    siteCta: 'Book on Vagaro',
  }),
  seed('vending-enterprise', 'Vending Enterprise', 'Vending Ent.', 'Vending machines', '#0F4C3A', {
    logoTemplate: 'band', logoLines: ['VENDING', 'ENTERPRISE'], logoFace: 'condensed',
    site: 'https://sites.google.com/vendingenterprise.net/vendingenterprise/home',
  }),
  seed('overly-hiphop', 'Overly Hip Hop', 'Overly', 'Media company', '#111111', {
    icon: 'overly-hiphop',
    logoTemplate: 'wordmark', logoLines: ['OVERLY'], logoFace: 'condensed',
    site: 'https://overlyhiphop.com/',
    siteCta: 'Get first access',
    /* Nothing hard to research — no address, no prices — so the page would
       otherwise print the roster placeholder. Their own site, in their words. */
    contactOnly:
      'A new Bay Area media company, born in the Bay and broadcasting worldwide: music, originals, community, fashion and business, out of Oakland and San Francisco. It launches Labor Day, September 7, 2026, and nothing is for sale yet; their site takes sign-ups for first access.',
  }),
  /* 2026-09-05, night. Russ Fam Kitchen, "Daly City • Goods", with their reel
     — "remember to add those videos and links to the swipeable feed too", so
     the reel is re-hosted and plays in Watch. Filipino fusion inside an Exxon
     on Hillside Blvd, a second counter in Redwood City; facts from their bio
     and site, the menu from their own ordering page. */
  seed('russ-fam-kitchen', 'Russ Fam Kitchen', 'Russ Fam', 'Filipino fusion', '#1B3F8F', {
    icon: 'russ-fam-kitchen',
    logoTemplate: 'badge', logoLines: ['RUSS FAM', 'KITCHEN'], logoFace: 'slab',
    site: 'https://russfamkitchen.com/',
    siteCta: 'Order online',
    clip: {
      src: '/clips/russ-fam-kitchen.mp4',
      poster: '/clips/russ-fam-kitchen-poster.webp',
      href: 'https://www.instagram.com/reel/Dc68gg9SJhY/',
      credit: 'Their own reel, @russfamkitchen_',
      platform: 'Instagram',
    },
  }),

  /* 2026-09-05, evening. Walk Free, "BEASTY • Online" with "Maybe include a
     drop-down pic?" — a Shopify harness store; the Pet goods seat is Pawddle's,
     so the flagship's yellow sheet, with their own product photos as the
     strip. Lush Spaw, "Three locations above": two in San Jose, one in Santa
     Clara — the Santa Clara grooming seat, and San Jose's yellow sheet because
     The Yappy Hour Club holds that one. Prices from their own dog and cat
     price pages, by weight and coat. */
  seed('walk-free', 'Walk Free', 'Walk Free', 'Dog harness and leash', '#C8471B', {
    icon: 'walk-free',
    logoTemplate: 'badge', logoLines: ['WALK', 'FREE'], logoFace: 'grotesk',
    site: 'https://walkfree.store/',
    siteCta: 'Shop the harness',
    /* An online store has no address or hours to count as a fact, so the
       roster placeholder would stay; this is what they are. */
    contactOnly:
      'An online store for their anti-pull dog harness with a built-in retractable leash, shipped worldwide. ' +
      'The store runs a rolling flash sale and prices differ by region, so the price is on the store, not here.',
  }),
  seed('lush-spaw', 'Lush Spaw', 'Lush Spaw', 'Pet grooming', '#E64BB5', {
    icon: 'lush-spaw',
    logoTemplate: 'wordmark', logoLines: ['LUSH', 'SPAW'], logoFace: 'script',
    site: 'https://www.lushspaw.com/',
    siteCta: 'Book an appointment',
  }),

  /* 2026-09-05. Four from the thread overnight and this morning, one per
     message: Dad's BBQ for Antioch ("Brentwood • Goods. Actually, Antioch");
     Tony's Style, "my cousins boy right here that owns this restaurant. Gonna
     put him on. Needs a website too" — on the Boba spot he named, BEASTY and
     Albany; Caitlyn's Sweets, "San Jose • Goods. Needs website"; and Armenta
     Landscape Co., which he filed under Antioch Goods and which is a landscape
     contractor, so it sits on the Gardener seat of Antioch Services instead —
     flagged to him. Every fact below is from their own site or bio; Dad's
     menu and photos are from their own ordering page. */
  seed('dads-bbq', "Dad's BBQ", "Dad's BBQ", 'Mississippi-style BBQ', '#B8121B', {
    icon: 'dads-bbq',
    logoTemplate: 'badge', logoLines: ["DAD'S", 'BBQ'], logoFace: 'slab',
    site: 'https://dadsbbqco.com/',
    siteCta: 'Order online',
  }),
  seed('tonys-style', "Tony's Style", "Tony's Style", 'Chicken wings', '#1B0F3A', {
    icon: 'tonys-style',
    logoTemplate: 'wordmark', logoLines: ["TONY'S", 'STYLE'], logoFace: 'script',
    site: 'https://www.instagram.com/tonysstyles/',
    siteCta: 'Message them on Instagram',
    needsSite: true,
  }),
  seed('caitlyns-sweets', "Caitlyn's Sweets", "Caitlyn's", 'Custom cakes', '#E8879F', {
    icon: 'caitlyns-sweets',
    logoTemplate: 'badge', logoLines: ["CAITLYN'S", 'SWEETS'], logoFace: 'script',
    site: 'https://www.instagram.com/caitlyn_sweets/',
    siteCta: 'DM for a quote',
    needsSite: true,
  }),
  seed('armenta-landscape', 'Armenta Landscape Co.', 'Armenta', 'Landscape design and construction', '#2E7D32', {
    icon: 'armenta-landscape',
    logoTemplate: 'wordmark', logoLines: ['ARMENTA', 'LANDSCAPE'], logoFace: 'grotesk',
    site: 'https://www.armentalandscape.com/',
    siteCta: 'Contact them',
  }),

  /* 2026-09-04, from the van: "are you able to add this to the Paige real
     quick? I'm delivering right now and I might talk to the owner" — two
     photographs, the storefront and the window poster. Everything below is
     from their own site; the mark is their own Logo-Color.png, downloaded,
     not the photograph. Their sign says EL RANCHO GRANDE and their site says
     Rancho Grande, so the site wins, as it does everywhere else. */
  seed('el-rancho-grande', 'Rancho Grande Taqueria', 'Rancho Grande', 'Mexican', '#A81E27', {
    icon: 'el-rancho-grande',
    logoTemplate: 'badge', logoLines: ['RANCHO', 'GRANDE'], logoFace: 'slab',
    site: 'https://www.ranchograndetaq.com/',
    siteCta: 'See their menu',
  }),

  /* 2026-09-03 night into 09-04. Cali Party Bus for Oakland; Pijja Paradise
     twice, "I deliver to the one in Livermore every week. I plan to speak to
     the owner and show her her page soon"; Chikin Drip twice, Union City and
     San Jose. Their published rates and menus, from their own sites. */
  seed('cali-party-bus', 'Cali Party Bus', 'Cali Party Bus', 'Party bus rental', '#12121A', {
    icon: 'cali-party-bus',
    logoTemplate: 'wordmark', logoLines: ['CALI', 'PARTY BUS'], logoFace: 'script',
    site: 'https://calipartybus.com/sanfrancisco/',
    siteCta: 'Get an instant quote',
  }),
  seed('pijja-paradise-pittsburg', 'Pijja Paradise', 'Pijja Paradise', 'Indian pizza', '#B3121B', {
    icon: 'pijja-paradise',
    logoTemplate: 'badge', logoLines: ['PIJJA', 'PARADISE'], logoFace: 'condensed',
    site: 'https://pijjaparadise.com/',
    siteCta: 'Order from Pittsburg',
  }),
  seed('pijja-paradise-livermore', 'Pijja Paradise', 'Pijja Paradise', 'Indian pizza', '#B3121B', {
    icon: 'pijja-paradise',
    logoTemplate: 'badge', logoLines: ['PIJJA', 'PARADISE'], logoFace: 'condensed',
    site: 'https://pijjaparadise.com/',
    siteCta: 'Order from Livermore',
  }),
  seed('chikin-drip-union-city', 'Chikin Drip', 'Chikin Drip', 'Nashville hot chicken', '#E8621A', {
    /* Halal on their own pages — the standard mark, his ask of 2026-09-18. */
    dietary: ['Halal'],
    icon: 'chikin-drip',
    logoTemplate: 'wordmark', logoLines: ['CHIKIN', 'DRIP'], logoFace: 'condensed',
    site: 'https://www.chikindrip.com/',
  }),
  seed('chikin-drip-san-jose', 'Chikin Drip', 'Chikin Drip', 'Nashville hot chicken', '#E8621A', {
    /* Halal on their own pages — the standard mark, his ask of 2026-09-18. */
    dietary: ['Halal'],
    icon: 'chikin-drip',
    logoTemplate: 'wordmark', logoLines: ['CHIKIN', 'DRIP'], logoFace: 'condensed',
    site: 'https://www.chikindrip.com/',
  }),

  /* PHO NATION, THREE TIMES. "Pho Nation locations: Alameda, San Bruno,
     Newark" with five cards, and "He needs a consistent brand identity
     between three of his locations" — the website-and-menu client, "it comes
     with free pho". One mark on all three, cut from the profile disc he
     sent; each page carries its own address, number and hours from the cards.
     "San Bruno" is San Bruno Avenue in San Francisco, so that one is on San
     Francisco's page. Newark's Square site takes the orders; the menu is
     behind it. */
  seed('pho-nation-newark', 'Pho Nation', 'Pho Nation', 'Vietnamese', '#B3121B', {
    icon: 'pho-nation',
    logoTemplate: 'monogram', logoInitials: 'PN', logoFace: 'condensed',
    site: 'https://pho-nation.square.site/',
    siteCta: 'Order online',
  }),
  seed('pho-nation-alameda', 'Pho Nation', 'Pho Nation', 'Vietnamese', '#B3121B', {
    icon: 'pho-nation',
    logoTemplate: 'monogram', logoInitials: 'PN', logoFace: 'condensed',
  }),
  seed('pho-nation-sf', 'Pho Nation SF', 'Pho Nation', 'Vietnamese', '#B3121B', {
    icon: 'pho-nation',
    logoTemplate: 'monogram', logoInitials: 'PN', logoFace: 'condensed',
  }),
  /* GOURMET BURRITOS IS HIS NAME FOR IT, not theirs: "ask Chat to make a quick
     logo of something called 'Gourmet Burritos' for this A&A gas station that
     serves burritos. I'm recruiting to them tomorrow." The business is A & A
     Gas on Oliver Road; the page carries their real menu and the working name
     he is pitching with. */
  seed('gourmet-burritos', 'Gourmet Burritos', 'Gourmet Burritos', 'Burritos', '#B8860B', {
    logoTemplate: 'badge', logoLines: ['GOURMET', 'BURRITOS'], logoFace: 'condensed',
    site: 'https://www.yelp.com/biz/a-and-a-gas-fairfield',
    siteCta: 'See them on Yelp',
    /*
      AGREED WITH THE OWNER, 2026-09-03: "Locked in offer! Welcome offer: Get
      any 1 gourmet burrito item for $10 CASH only. Any size fountain drink
      FREE with the purchase of any gourmet burrito item." Both lines are his,
      verbatim in substance. He labelled only the first; the drink is placed as
      the loyalty offer because it is written to repeat on any purchase, and
      the $10 is the deal the owner gives him on a visit. Worth one word from
      him if he meant both as the welcome.

      NOT `mock`: he says the owner locked these in.
    */
    offers: {
      welcome: 'Any one gourmet burrito item for $10, cash only.',
      loyalty: 'A free fountain drink, any size, with any gourmet burrito item.',
    },
  }),
  /* "I'm picking up a pizza right now speaking to the Owner. Are you free
     to make up a page real quick?" — San Ramon • Goods, with their site, a
     Maps card and a photo of the Hot Honey Ricotta poster on their wall:
     "Just post this on the page for now." Italian is goods category 6. The
     mark is their own badge, cut from the screenshot of their site. */
  seed('empire-state-pizza', 'Empire State Pizza', 'Empire State', 'NYC-style pizza', '#1F5A3C', {
    /* Glenn, 2026-10-23, 5:23 pm: "Clip this video plz". Their own 10 s reel, whole: 8 pizzas, 8 flavors. */
    clip: {
      src: '/clips/empire-state-pizza.mp4',
      poster: '/clips/empire-state-pizza-poster.webp',
      href: 'https://www.instagram.com/reel/DekrW5dh7Ss/',
      credit: 'Posted by @empirestatepizza',
      platform: 'Instagram',
    },
    icon: 'empire-state-pizza',
    logoTemplate: 'monogram', logoInitials: 'ES', logoFace: 'condensed',
    site: 'https://www.empirestatepizzas.com/',
    /* "Nice I locked in legit offers!" — his note from the counter, 2026-09-02:
       welcome "Spend $50+ 15%", loyalty "$50+ 10% off". Agreed with the owner
       in person, so no `mock`. */
    offers: {
      welcome: '15% off when you spend $50 or more, on your first visit.',
      loyalty: '10% off when you spend $50 or more.',
    },
    photos: [
      {
        src: '/photos/empire-state-pizza-hot-honey.webp',
        alt: 'Empire State Pizza poster on the shop wall: Hot Honey Ricotta Pepperoni, NYC style, made with Parmigiano Reggiano.',
        credit: 'Their poster, photographed in the shop',
      },
    ],
  }),

  /* ---- 2026-09-02 ---- */
  /* Their site link with "Antioch • Services" and three screenshots of their
     Instagram. A licensed fencing contractor; the Contractor seat in Antioch
     is Serrano's, so this takes Handyman and home repair on the Pleasanton
     precedent. The mark is cut from the profile-ring screenshot he sent. */
  seed('bayside-fencing', 'Bay Side Fencing Co', 'Bay Side Fencing', 'Fencing contractor', '#B3121B', {
    icon: 'bayside-fencing',
    logoTemplate: 'monogram', logoInitials: 'BF', logoFace: 'condensed',
    site: 'https://baysidefencingco.com/',
  }),
  /* FOUND IN THE 2026-09-02 SWEEP OF THE WHOLE THREAD. Sent 2026-08-23 with
     "Looks like this place needs a website update. It seems to have expired"
     and "BEASTY • Pittsburgh", and never seated. houseofwingsca.com does not
     resolve, which is his "expired"; the facts are their Instagram bio, and
     the mark is cut from the share sheet he sent. Wings is goods category 9. */
  seed('house-of-wings', 'House of Wings California', 'House of Wings', 'Chicken wings', '#C8102E', {
    icon: 'house-of-wings',
    /* Batch 59. Glenn, 2026-10-19, 10:22 pm: "Clip this video plz / House of Wings". Their soft opening at 2941 Harbor St, from 24s, past the expired "20% off" card. */
    clip: {
      src: '/clips/house-of-wings.mp4',
      poster: '/clips/house-of-wings-poster.webp',
      href: 'https://www.instagram.com/reel/DXlQA7ljkwk/',
      credit: 'Filmed by @jantrinanicole',
      platform: 'Instagram',
      by: 'jantrinanicole',
    },
    logoTemplate: 'monogram', logoInitials: 'HW', logoFace: 'condensed',
  }),
  /* Same sweep. Sent 2026-08-30 with "Just isolate the words for icon. Great
     candidate for pilot program." A caterer with no website and no city —
     "Bay Area, CA" is all their bio says — so the BEASTY services sheet, on
     the Rocket MC Tow reasoning. */
  seed('tastin-peachy', 'Tastin Peachy', 'Tastin Peachy', 'Catering', '#1A1A1A', {
    icon: 'tastin-peachy',
    logoTemplate: 'monogram', logoInitials: 'TP', logoFace: 'script',
  }),

  /* ---- 2026-09-01 ---- */
  /* Sent as a link to their Square ordering site with "Alameda • Goods" and
     "Needs website" — the square.site IS the website, which is the point. No
     Hawaiian category exists; seat 0 opens Alameda, as the brew boat does on
     the services side. The mark is cut from the share-profile sheet he sent. */
  seed('shaka-shack', 'Shaka Shack', 'Shaka Shack', 'Hawaiian brunch', '#0F3A46', {
    icon: 'shaka-shack',
    logoTemplate: 'monogram', logoInitials: 'SS', logoFace: 'condensed',
    site: 'https://shaka-shack.square.site/',
  }),
  /* "Candidate for Pilot Program" and two screenshots of their Instagram —
     no city line, no link. Their own bio puts them at The Veranda in Concord,
     and ramen is category 8, so that is the seat. They have no website at
     all that anyone can find, so the page carries their profile and nothing
     it does not say. */
  seed('mrs-ramen', 'Mrs. Ramen Concord', 'Mrs. Ramen', 'Ramen and seafood boil', '#C8102E', {
    icon: 'mrs-ramen',
    logoTemplate: 'monogram', logoInitials: 'MR', logoFace: 'slab',
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
    site: 'https://www.gayninetiespizza.com/',
    logoTemplate: 'monogram', logoInitials: '90', logoFace: 'slab',
    address: '288 Main St, Pleasanton',
    contactOnly:
      'Sent 2026-08-15 with no website of their own — their Instagram is all that is published. ' +
      'Nothing else is listed.',
  }),

  /* ---- 2026-08-14 ---- */
  /* His best friend's, and the one he asked to show her — so the mark is the
     anchor on its own, as he asked, rather than initials. */
  /*
    Updated 2026-08-19 from the contact page he sent — and it corrected a real
    error, not just added detail. This was filed as "Boat charters" under an
    ANCHOR. They are Bay Area Charter Bus Rental: coaches, not boats. The name
    alone was doing the guessing, and the guess was wrong for as long as nobody
    had looked at their site.

    Their old domain is dead too; the live one is bayarea-charters.com.
  */
  seed('bay-area-charters', 'Bay Area Charters', 'Bay Area Cha…', 'Charter bus rental', '#171717', {
    icon: 'bay-area-charters',
    logoTemplate: 'glyph-word', logoGlyph: 'anchor', logoLines: [''],
    site: 'https://bayarea-charters.com/',
    address: '3150 Hilltop Mall Rd, Richmond, CA 94806',
    phone: '(510) 964-4476',
    email: 'chartersbayarea@gmail.com',
    /* His draft, from the sheet he sent — mock until they sign it. */
    offers: {
      mock: true,
      welcome: 'Get a family discount of 20% off your 1st bus rental for any occasion.',
      loyalty: 'Get 10% off your bus rental anytime!',
    },
    contactOnly:
      'Charter buses and group transportation, Monday to Friday 9am to 5pm, closed weekends — ' +
      'their own hours. Quotes are by enquiry rather than listed.',
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
    site: 'https://www.babsdeltadiner.com/',
    logoTemplate: 'monogram', logoInitials: 'BD', logoFace: 'script',
    address: '134 Robles Way, Vallejo',
    contactOnly:
      'Sent 2026-08-14 with his note that they need a website. Their own Instagram: a diner in ' +
      'Glen Cove, rooted in Suisun, serving homestyle favourites. Nothing else is listed.',
  }),
  seed('simply-soups', 'Simply Soups', 'Simply Soups', 'Soups and deli', '#5C1A1A', {
    site: 'https://simplysoupsandmore.com/',
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
  /* Glenn, 2026-10-13: @chris.corpz's reel ("Clip this video plz") and "please update their
     icon. This shop is adjacent to our POD DTG print shop... at some point I will speak to
     them about getting a website made." Their logo from his screenshot, under a new file
     name (sweet-pipers-2) so no cached copy of the old one lingers. */
  seed('sweet-pipers', 'Sweet Pipers', 'Sweet Pipers', 'Filipino desserts', '#6B3A7A', {
    icon: 'sweet-pipers-2',
    logoTemplate: 'monogram', logoInitials: 'SP', logoFace: 'script',
    clip: {
      src: '/clips/sweet-pipers.mp4',
      poster: '/clips/sweet-pipers-poster.webp',
      href: 'https://www.instagram.com/reel/DecMBslTErN/',
      credit: 'Filmed by @chris.corpz',
      platform: 'Instagram',
      by: 'chris.corpz',
    },
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
  seed('house-of-silog', 'House of Silog', 'House of Silog', 'Filipino fusion', '#000000', {
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
    /* "Please add this to the house of silog's page", 2026-09-30, 5:33 am.
       3s-27s of 68s: the silog bento box and the sisig. @justmostie's. */
    clip: {
      src: '/clips/house-of-silog.mp4',
      poster: '/clips/house-of-silog-poster.webp',
      href: 'https://www.instagram.com/reel/Dd5HDT4zZQJ/',
      credit: 'Filmed by @justmostie',
      platform: 'Instagram',
      by: 'justmostie',
    },
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
    /*
      His own reel, added 2026-08-21 — "can you add this to his page? Also the
      video gallery? Without it having to go to Instagram and all."

      IT PLAYS INLINE, so it does both jobs at once: the video window reads
      REELS straight off any brand carrying a `src`, so a clip on his page is a
      clip in the gallery with nothing else to remember.

      Fifteen seconds, and unlike the other talking-to-camera reel this week it
      earns the loop — a mural he painted for Tato's Cantina fills the middle of
      it, so the work is on screen and not only described. Muted, as every hero
      film here is; the card underneath still opens the post with his voice on
      it.
    */
    clip: {
      src: '/clips/frank2artistic.mp4',
      poster: '/clips/frank2artistic-poster.webp',
      href: 'https://www.instagram.com/p/DbHaTU6suQw/',
      credit: 'Filmed by Frank2Artistic',
      platform: 'Instagram',
    },
    /* His own contact card, off his profile, 2026-08-22 — "can you add these
       contacts on Frank the artists page". */
    phone: '(510) 919-7577',
    email: 'frank2artistic@gmail.com',
    contactOnly:
      'Murals, logos and custom art across the Bay Area and the 209, by Franklin Guardado. ' +
      'Murals start around $1.2k, his own figure. Quotes are by enquiry — call or email him ' +
      'directly; he publishes no site.',
  }),
  /*
    1-Up Retro, Sacramento — "Sacramento • Goods", 2026-08-19.

    Their icon is their own artwork RESTACKED, on his ask: "can you possibly
    reconfigure there icon button to have the 1up centered above RETRO". Their
    lockup runs side by side, which is right on a shopfront and wrong in a
    square — horizontal, the whole thing has to shrink until neither half reads.
    Nothing is redrawn: both elements are lifted out of their own file at full
    resolution and re-placed, so the cyan, the mushroom and the letterforms are
    theirs.
  */
  seed('1up-retro', '1-Up Retro', '1-Up Retro', 'Retro video game store', '#7DE1EC', {
    icon: '1up-retro',
    logoTemplate: 'monogram', logoInitials: '1UP', logoFace: 'condensed',
    site: 'https://www.1upretrogaming.com/',
    address: '2325 J Street, Sacramento, CA',
    phone: '(916) 706-2358',
    contactOnly:
      'A retro-modern video game store in midtown Sacramento — buy, sell and trade, seven days ' +
      'a week, in their own words. Stock changes daily and is not listed here.',
  }),
  seed('scoop-n-chill', 'Scoop N Chill', 'Scoop N Chill', 'Gelato and ice cream', '#F4A8C0', {
    icon: 'scoop-n-chill',
    logoTemplate: 'monogram', logoInitials: 'SC', logoFace: 'condensed',
    address: '2122 Shattuck Ave, Berkeley, CA',
    /* "Needs new website", his note — they publish an Instagram and nothing
       else, so there is no site button and the red ring earns itself. */
    contactOnly:
      'Gelato, ice cream, milkshakes, crepes and croffles in downtown Berkeley, in their own ' +
      'words. Nothing is priced here.',
  }),
  /*
    Al Pastor Papi — "Oakland • Goods", his words. THEIR ADDRESS IS IN SAN
    FRANCISCO: 232 O'Farrell St, which their own Instagram states. Seated where
    he asked and addressed where they are, the same way Magic Juan's is; worth
    a word with him in case he meant a second location.
  */
  seed('al-pastor-papi', 'Al Pastor Papi', 'Al Pastor Papi', 'Mexican grill', '#E8197F', {
    icon: 'al-pastor-papi',
    logoTemplate: 'monogram', logoInitials: 'AP', logoFace: 'condensed',
    site: 'https://www.alpastorpapisf.com/',
    address: '232 O’Farrell St, San Francisco, CA',
    contactOnly:
      'Est. 2018. Tuesday to Thursday 11 to 8, Friday and Saturday 11 to 9, in their own words. ' +
      'The menu is on their own site.',
  }),
  /*
    Rywire, 2026-08-20 — "BEASTY • Services. I painted this guys CRX back when
    he was a nobody. Now he's worth millions."

    Motorsport wiring harnesses, PDM and chassis wiring, 107k followers. He is
    reaching out to them; nothing here claims they have agreed anything.

    HIS VIDEO PLAYS ON THE PAGE. The first attempt failed — three yt-dlp client
    strategies all came back 403 or no-format — and the fix was simply a newer
    build: the nightly pulls it where the release could not.

    IT IS AN EXCERPT, 194s to 218s of a 6m16s film, and which 24 seconds was a
    real choice. The rest is interviews and end credits, and a talking head with
    the sound off is a still photograph that happens to blink. This stretch is
    the car on a desert road with the camera rigged to it: moving, and about
    what they actually build. Picked off a frame sweep of the whole film rather
    than by taking the opening. The full thing is one tap away on the card.
  */
  seed('rywire', 'Rywire', 'Rywire', 'Motorsport wiring harnesses', '#111111', {
    icon: 'rywire',
    logoTemplate: 'wordmark', logoLines: ['RY', 'WIRE'], logoFace: 'grotesk',
    site: 'https://www.rywire.com/',
    clip: {
      src: '/clips/rywire.mp4',
      poster: '/clips/rywire-poster.webp',
      href: 'https://youtu.be/YVkl1zTsnxQ',
      credit: 'Filmed by Rywire',
      platform: 'YouTube',
    },
    contactOnly:
      'A Santa Ana shop, four hundred miles south of here, building tucked and Mil-Spec ' +
      'engine wiring harnesses, power distribution modules and brake and clutch line kits ' +
      'for Honda and Porsche builds. They are on BEASTY rather than on a city page because ' +
      'they ship rather than serve a counter; products and pricing are on their own site.',
  }),
  seed('emys-cannoli', 'Emy’s Cannoli', 'Emy’s Cann…', 'Cannoli, mobile', '#5C3210', {
    icon: 'emys-cannoli',
    logoTemplate: 'monogram', logoInitials: 'EC', logoFace: 'script',
    site: 'http://emyscannoli.com/',
    /* "Foodie" — 2026-09-09, a reel and nothing else. It is a reviewer's film
       of THIS shop: @oaktowngrubhub, captioned "Authentic Italian dessert from
       @emyscannoli". Handled the way he set out for Belly the same day: the
       bar reads "Watch a review by @oaktowngrubhub", the credit opens his
       page, "so they get the credit & views and hopefully a follow". */
    clip: {
      src: '/clips/emys-cannoli.mp4',
      poster: '/clips/emys-cannoli-poster.webp',
      href: 'https://www.instagram.com/reel/DdFKK1RSPBd/',
      credit: 'Filmed by @oaktowngrubhub',
      platform: 'Instagram',
      by: 'oaktowngrubhub',
    },
    contactOnly:
      'The operator filed this one as a MOBILE service rather than a shop, so no address is ' +
      'shown — it does not have one fixed place to be. Nothing else is listed yet.',
  }),

  /* ---- 2026-09-08. The batch he sent on the night of the 7th, plus the five
     from the weekend that were still waiting. Facts from each business's own
     site, in research/roster/batch15.json; icons cut from the profile
     pictures in his screenshots. ---- */

  /* "Sushi Naloa" was his spelling; the restaurant writes Sushinaloa, one
     word, on its sign, its site and its Instagram. Sinaloa-style mariscos and
     Mexican sushi — Redwood City's sushi seat. */
  seed('sushi-naloa', 'Sushinaloa', 'Sushinaloa', 'Mexican sushi', '#1E6FA8', {
    icon: 'sushi-naloa',
    logoTemplate: 'monogram', logoInitials: 'SN', logoFace: 'condensed',
    site: 'https://www.sushinaloarwc.com/online-ordering',
    siteCta: 'Order online',
  }),
  /* Kusan: three shops on one site, three menus at three sets of prices, and
     a footer that says the San Jose shop, Kusan Uyghur Cuisine, is a separate
     business — so it keeps the name the site gives it. Only Milpitas carries
     items, because Milpitas is the menu that was read. */
  seed('kusan-uyghur-cuisine-san-jose', 'Kusan Uyghur Cuisine', 'Kusan', 'Uyghur food', '#8A1C1C', {
    /* Halal on their own pages — the standard mark, his ask of 2026-09-18. */
    dietary: ['Halal'],
    icon: 'kusan-bazaar',
    logoTemplate: 'wordmark', logoLines: ['KÜSAN'], logoFace: 'condensed',
    site: 'https://kusanbazaar.com/',
    siteCta: 'Order online',
  }),
  seed('kusan-bazaar-milpitas', 'Kusan Bazaar', 'Kusan Bazaar', 'Uyghur food', '#8A1C1C', {
    /* Halal on their own pages — the standard mark, his ask of 2026-09-18. */
    dietary: ['Halal'],
    icon: 'kusan-bazaar',
    logoTemplate: 'wordmark', logoLines: ['KÜSAN'], logoFace: 'condensed',
    site: 'https://kusanbazaar.com/menu/kusanbazaar-milpitas',
    siteCta: 'Order online',
  }),
  seed('kusan-bazaar-mountain-view', 'Kusan Bazaar', 'Kusan Bazaar', 'Uyghur food', '#8A1C1C', {
    /* Halal on their own pages — the standard mark, his ask of 2026-09-18. */
    dietary: ['Halal'],
    icon: 'kusan-bazaar',
    logoTemplate: 'wordmark', logoLines: ['KÜSAN'], logoFace: 'condensed',
    site: 'https://kusanbazaar.com/',
    siteCta: 'Order online',
  }),
  /* Varnish Nail Boutique — "Studio" was only ever in the booking URL. Two
     shops, each with its own Instagram; the booking site and its price list
     belong to Walnut Creek. He filed both as Goods; a nail salon is a
     service, so they sit on the services pages. */
  seed('varnish-nail-boutique-walnut-creek', 'Varnish Nail Boutique', 'Varnish', 'Nail salon', '#1F3A5F', {
    icon: 'varnish-nail-boutique',
    logoTemplate: 'monogram', logoInitials: 'V', logoFace: 'script',
    site: 'https://varnishnailstudio3868.simplepos.us/new-home',
    siteCta: 'Book online',
  }),
  seed('varnish-nail-boutique-antioch', 'Varnish Nail Boutique', 'Varnish', 'Nail salon', '#1F3A5F', {
    icon: 'varnish-nail-boutique',
    logoTemplate: 'monogram', logoInitials: 'V', logoFace: 'script',
  }),
  /* BODYROK East Bay — "Multiple locations". Four open studios; Walnut Creek
     and Lafayette say "coming soon" on their own site and get no seat until
     they open. One price list at all four, and no hours published anywhere,
     only class schedules. Rockridge is in Oakland, so it shares that seat. */
  seed('bodyrok-berkeley', 'BODYROK East Bay', 'BODYROK', 'Reformer Pilates', '#111111', {
    icon: 'bodyrok',
    logoTemplate: 'wordmark', logoLines: ['BODYROK'], logoFace: 'condensed',
    site: 'https://bodyrok.com/studios/',
    siteCta: 'Book a class',
  }),
  seed('bodyrok-alamo', 'BODYROK East Bay', 'BODYROK', 'Reformer Pilates', '#111111', {
    icon: 'bodyrok',
    logoTemplate: 'wordmark', logoLines: ['BODYROK'], logoFace: 'condensed',
    site: 'https://bodyrok.com/studios/',
    siteCta: 'Book a class',
  }),
  seed('bodyrok-oakland', 'BODYROK East Bay', 'BODYROK', 'Reformer Pilates', '#111111', {
    icon: 'bodyrok',
    logoTemplate: 'wordmark', logoLines: ['BODYROK'], logoFace: 'condensed',
    site: 'https://bodyrok.com/studios/',
    siteCta: 'Book a class',
  }),
  /* Bhan Mae Vane — "Some place my daughter visits". Lao and Thai on Webster
     Street, two sisters cooking their mother's recipes. Alameda's Asian seat
     is Pho Nation's, so the yellow sheet. */
  seed('bhan-mae-vane', 'Bhan Mae Vane', 'Bhan Mae Vane', 'Lao and Thai food', '#2B2B2B', {
    icon: 'bhan-mae-vane',
    logoTemplate: 'wordmark', logoLines: ['BHAN MAE', 'VANE'], logoFace: 'slab',
    site: 'https://www.bhanmaevane.com/menu',
    siteCta: 'See the menu',
  }),
  /* Jolly Roger Land — an indoor playground with party rooms, admission and
     party packages priced on their own site. Nothing on the services list is
     a play centre, so Union City's yellow sheet. */
  seed('jolly-roger-land', 'Jolly Roger Land', 'Jolly Roger', 'Indoor playground', '#F2B705', {
    icon: 'jolly-roger-land',
    logoTemplate: 'wordmark', logoLines: ['JOLLY', 'ROGER'], logoFace: 'slab',
    site: 'https://www.jollyrogerland.com/pricing-plans',
    siteCta: 'Book a party',
  }),
  /* Parada — the logo he photographed says NEW PERU, the site title says
     Kitchen, Instagram says Peruvian Kitchen. No prices on their own site,
     and their Toast page sits behind a bot check, so none are printed.
     Peruvian has no seat, like Las Lomas, so the yellow sheet. */
  seed('parada-new-peru', 'Parada New Peru', 'Parada', 'Peruvian food', '#1B7A8C', {
    icon: 'parada-new-peru',
    logoTemplate: 'wordmark', logoLines: ['PARADA'], logoFace: 'script',
    site: 'https://paradakitchen.com/',
    siteCta: 'See the menu',
  }),
  /* Good Compenny — offer-based merch: every figure on the store is an anchor
     above an unpublished minimum, so no price is printed. Online's apparel
     seat is Facet Fine's, so BEASTY's yellow sheet. */
  seed('good-compenny', 'Good Compenny', 'Good Compenny', 'Streetwear brand', '#F2C400', {
    icon: 'good-compenny',
    logoTemplate: 'wordmark', logoLines: ['GOOD', 'COMPENNY'], logoFace: 'condensed',
    site: 'https://goodcompenny.co/',
    siteCta: 'See the store',
    /* No address, hours or fixed prices exist to research, so the generated
       layer would leave the roster's "still gathering" note; what they are is
       known, so it is said here. */
    contactOnly:
      'Bay Area streetwear — satin jackets, mesh jerseys, puff-print tees, beanies — and official LaRussell show tees, records and a puzzle, shipped worldwide from their own store. Everything on it is offer-based: you name the amount, and offers at or above their unpublished minimum are accepted, so no price is printed here.',
  }),
  /* Boba Club — "Needs Website". Their only web presence is a Chowbus
     ordering page, which is what the button opens. */
  seed('boba-club', 'Boba Club', 'Boba Club', 'Boba and sandwiches', '#4FB3E8', {
    icon: 'boba-club',
    logoTemplate: 'wordmark', logoLines: ['BOBA', 'CLUB'], logoFace: 'condensed',
    site: 'https://pos.chowbus.com/online-ordering/store/restaurant/22892',
    siteCta: 'Order online',
    needsSite: true,
  }),
  /* Doodle Cakes — "doodlecakes", one word, everywhere on their own site; his
     spelling is kept here and theirs is in the research. Cupcakes and cakes
     with a vegan, gluten-free line. Alameda's bakery seat. */
  seed('doodle-cakes', 'Doodle Cakes', 'Doodle Cakes', 'Cake shop', '#F4A6C6', {
    icon: 'doodle-cakes',
    logoTemplate: 'wordmark', logoLines: ['doodle', 'cakes'], logoFace: 'script',
    site: 'https://www.doodlecakesbakery.com/',
    siteCta: 'Order online',
  }),

  /* ---- 2026-09-08, morning. Moxie Steak House, "Alameda • Goods" — Park
     Street. No steakhouse seat exists; Mac's Old House took Antioch's burgers
     seat for the same reason, and Alameda's is Shaka Shack's, so the yellow
     sheet. The icon is their roundel from his screenshot. Research in
     research/roster/batch16.json. ---- */
  seed('moxie-steak-house', 'Moxie Steak House', 'Moxie', 'Steakhouse', '#1F6F73', {
    icon: 'moxie-steak-house',
    /* Batch 59. Glenn, 2026-10-20, 9:55 pm: "Clip this video plz / Foodie". Their executive chef, Donna Meadows, on the New York strip. */
    clip: {
      src: '/clips/moxie-steak-house.mp4',
      poster: '/clips/moxie-steak-house-poster.webp',
      href: 'https://www.instagram.com/reel/DdAZBPgIoAt/',
      credit: 'Filmed by @thealamedapulse',
      platform: 'Instagram',
      by: 'thealamedapulse',
    },
    logoTemplate: 'wordmark', logoLines: ['MOXIE'], logoFace: 'script',
    site: 'https://www.moxiealameda.com/',
    siteCta: 'See the menu',
  }),

  /* ---- 2026-09-08, evening. Three more, each with the city written beside
     the link. Research in research/roster/batch17.json. ---- */
  /* 7 Mile House, "Brisbane • Goods" — sent as their Ube Bake-Off page, and
     Brisbane had no page, so this opens it. No bar-and-grill seat exists;
     seat 0 opens the city, as Shaka Shack's did Alameda. Their menu is six
     pictures and their prices sit on Toast, which refuses a fetch, so the
     page says where the prices are rather than printing any. The mark is
     their own logo off the site, flattened onto white. */
  seed('7-mile-house', '7 Mile House', '7 Mile House', 'Bar & grill', '#5C3A1E', {
    icon: '7-mile-house',
    logoTemplate: 'badge', logoLines: ['7 MILE', 'HOUSE'], logoFace: 'slab',
    site: 'https://7milehouse.com/',
    siteCta: 'See the menu',
    siteNote: 'Ube Bake-Off, September 30 to October 5: the sampler comes with two ballots',
    /* Their own reel of the Sizzling Garlic Mushrooms, "@thesnacksensei approved", sent 2026-10-01 with "Clip this video plz". */
    clip: {
      src: '/clips/7-mile-house.mp4',
      poster: '/clips/7-mile-house-poster.webp',
      href: 'https://www.instagram.com/reel/DXUviEUj9i8/',
      credit: 'Posted by 7 Mile House',
      platform: 'Instagram',
    },
    contactOnly:
      'SF comfort food on Bayshore Boulevard, established 1858 by their own sign: a restaurant, sports bar and live-music room ' +
      'with a heated, dog-friendly patio, a dog menu of its own and Sunday brunch. The menu on their site is pictures and the ' +
      'prices live on their Toast ordering page, so none are printed here. Their sixth annual Ube Bake-Off runs September 30 ' +
      'to October 5, 2026: order the sampler, taste the four competing desserts, and vote with the two ballots that come with it.',
  }),
  /* Belly, "Oakland • Goods" — College Avenue in Rockridge; their downtown
     room on San Pablo is marked permanently closed on their own pages. Kimchi
     and bulgogi through a diner menu of tacos, burritos and burgers, so the
     Korean seat. The reel he sent with "Can you play on their page without it
     going onto Instagram?" is a food creator's, not theirs — re-hosted and
     credited to her, on the Phosho Dough reasoning; see public/clips/CREDITS.md. */
  seed('belly', 'Belly', 'Belly', 'Korean-Mexican fusion', '#1F3F73', {
    icon: 'belly',
    /* "Can you put this as an example for belly?" — 2026-09-09, a Notes
       screenshot: a welcome offer and a "Biggies Pass offer". His words,
       one spelling corrected ("you're" to "your"); mock until Belly signs
       it, so the page says these are examples and nothing has been agreed.
       "I'm going to tag my daughter and see what she thinks." */
    offers: {
      mock: true,
      welcome: 'Get a free side of fries or kimchi with each $15+ order.',
      loyalty: 'Get a 10% discount with your $20+ meal purchase!',
    },
    logoTemplate: 'wordmark', logoLines: ['Belly'], logoFace: 'script',
    site: 'https://www.bellyrestaurants.com/',
    siteCta: 'See the menu',
    clip: {
      src: '/clips/belly.mp4',
      poster: '/clips/belly-poster.webp',
      href: 'https://www.instagram.com/reel/DdDEq35z2g5/',
      credit: 'Filmed by @antoinetterzz',
      platform: 'Instagram',
      /* His 2026-09-09 note: the bar says "Watch a review by @antoinetterzz"
         and the credit opens her Instagram — "This way they get the credit &
         views and hopefully a follow directly to their ig page." */
      by: 'antoinetterzz',
    },
  }),
  /* Wow Mia Pizza, "San Jose • Goods" — Monterey Road. Pizza is the Italian
     seat and San Jose's is open. Their contact page prints two sets of hours
     that disagree about Monday, so none are carried. The mark is cut from the
     profile disc in his screenshot. */
  seed('wow-mia-pizza', 'Wow Mia Pizza', 'Wow Mia', 'Pizza', '#F2622E', {
    icon: 'wow-mia-pizza',
    logoTemplate: 'wordmark', logoLines: ['WOW MIA', 'PIZZA'], logoFace: 'grotesk',
    site: 'https://wowmiapizza.com/',
    siteCta: 'Order online',
  }),

  /* ---- 2026-09-09, evening. Four more, and a rule from the same day that
     changes how a spot is drawn: "from here forward, we should only give
     Affiliates that are on the yellow pages the Free Tier 1 treatment" — see
     Brand.tier. Research in research/roster/batch18.json. ---- */
  /* Salad Makers, "Brentwood • Goods" — The Streets of Brentwood. Soups,
     salads and sandwiches, and Brentwood's Sandwiches seat is open, so a
     category seat and the whole page. Their site and their Instagram bio
     close at different hours, so none are carried. The mark is their disc,
     cut from his screenshot of their site. */
  seed('salad-makers', 'Salad Makers', 'Salad Makers', 'Salads, wraps & sandwiches', '#2F7D32', {
    icon: 'salad-makers',
    logoTemplate: 'wordmark', logoLines: ['Salad', 'Makers'], logoFace: 'script',
    site: 'https://www.saladmakers.net/',
    siteCta: 'Order online',
  }),
  /* Street Social, "Petaluma • Goods" — Petaluma Boulevard North, eclectic
     comfort food and a bottle shop. No seat for it, so the yellow sheet, and
     so the first page drawn at Tier 1: their initials on a tile in their
     colour, the address, the number, the email and the link, nothing from
     the tiers above. Their menu is a photograph and their own pages disagree
     about the hours, so neither is carried. */
  seed('street-social', 'Street Social', 'Street Social', 'Comfort food & bottle shop', '#111111', {
    logoTemplate: 'monogram', logoInitials: 'SS', logoFace: 'slab',
    site: 'https://www.streetsocial.social/',
    siteCta: 'Reserve a table',
    tier: 1,
  }),
  /* Alive Kitchen by Joni, "3 locations" with no city — Mediterranean meal
     prep delivered weekly, and the three locations are the cities it serves,
     Concord, Walnut Creek and Lafayette, per their own bio. No address
     anywhere (theirs is given after checkout), no seat for meal prep, so each
     of the three cities' yellow sheets, at Tier 1. */
  seed('alive-kitchen', 'Alive Kitchen', 'Alive Kitchen', 'Meal prep, delivered weekly', '#2E4A2E', {
    logoTemplate: 'monogram', logoInitials: 'AK', logoFace: 'script',
    site: 'https://eatalivekitchen.com/',
    siteCta: "Order this week's menu",
    tier: 1,
  }),
  /* Baithak, "Dublin • Goods", sent again on 2026-09-09 as a paid Instagram
     ad. It has held dublin-goods2-1 since August as a hand-written entry that
     said they publish no prices; their own menu page now prints 138 of them,
     so the entry moves here and the menu comes with it. Still the warm lead
     he described — "I deliver for them. They're aware and waiting to sign
     on" — and nothing here claims they have agreed anything. Seated before
     the Tier 1 rule, so it keeps its whole page. Their footers and their
     contact page disagree about hours and about the email, so neither is
     carried. */
  seed('baithak', 'Baithak', 'Baithak', 'Indian', '#D2691E', {
    icon: 'baithak',
    logoTemplate: 'wordmark', logoLines: ['Baithak'], logoFace: 'script',
    site: 'https://baithak.us/',
    siteCta: 'Reserve a table',
  }),

  /* ---- 2026-09-10. ---- */
  /*
     Bay Area Event Lights, "Mobile / San Jose • Services" — sent 2026-08-29 and
     missed for twelve days. tools/gap-check.py did not catch it either: its
     seven-character prefix rule read bayareaeventlights.com as Bay Area
     Charters and called it listed. That rule is tightened in the same commit.

     Event lighting and decor for weddings, events and holidays, a preferred
     lighting vendor at Saratoga Springs, Hakone Gardens and Montalvo among
     others, by their own billing. Mobile, so no street address: San Jose is
     the city they give. Event coordinator, the nearest of the twenty-four, is
     Bloom Balloon's on San Jose already, so this takes the yellow sheet — and
     a yellow-sheet spot seated after his 2026-09-09 rule is a free Tier 1
     listing. He sent it before that rule; his to bump.
  */
  seed('bay-area-event-lights', 'Bay Area Event Lights', 'Event Lights', 'Event lighting & decor', '#1B2A4A', {
    logoTemplate: 'monogram', logoInitials: 'BL', logoFace: 'condensed',
    address: 'San Jose, CA',
    phone: '(408) 502-7229',
    email: 'BayAreaEventLights@gmail.com',
    site: 'https://www.bayareaeventlights.com/',
    siteCta: 'See their work',
    tier: 1,
  }),
  /*
     Chef Jeff's Smash Burger, Antioch. His message of 2026-09-10: "I
     delivered to them for the first time and I know the owner from Restaurant
     Depot and he totally hooked me up. He's 100% down. He's ready for a page
     … Give him that empty space on the home screen. And put a glow around
     his page."

     The empty space is seat 18. The glow is the Tier 3 add-on, seated by his
     instruction rather than by a payment.

     THE MENU IS THEIR OWN BOARD, read on 2026-09-13 from the MENU highlight on
     their own Instagram (@chefjeffssmashburger): the last card is the full
     chalkboard, every item and price, posted about 59 weeks before it was
     read. Leon's ask the same night: "make into menu … all kitchens should
     look the same so when users open its a menu inside". Delivery-app prices
     were never used. The board prices each burger "Single" and "Make it
     complete" without saying what complete adds, so the single price is the
     item's price and the complete price is quoted in its description in the
     board's own words, not explained. The cheeses are the board's list.

     Address, number and hours are off their Instagram profile. They have no
     website of their own; the profile links a Facebook page, so the page asks
     for one. The mark is their own logo, cut from Glenn's photograph of their
     dining-room wall. The smashburger picture on Single Smashed is Glenn's own
     photograph of the burger he was handed.
  */
  seed('chef-jeffs-smash-burger', "Chef Jeff's Smash Burger", "Chef Jeff's", 'Smashburgers', '#2B2B2E', {
    glow: true,
    icon: 'chef-jeffs-smash-burger',
    tagline: 'Gourmet smashburgers, fast food style',
    address: '740 W 2nd St, Antioch, CA',
    phone: '(925) 732-7625',
    hours: 'Tue–Sat 10:30am–8pm; closed Sun & Mon',
    instagram: 'chefjeffssmashburger',
    needsSite: true,
    logoTemplate: 'band', logoLines: ['SMASH', 'BURGER'], logoFace: 'condensed',
    /* "Do you have time to clip this video to add on the page within the next
       hour? I'm gonna deliver to him and see if I can lock in an offer from
       the owner", 2026-09-30, 11:20 am. 2s-26s of 68s: his "Top burger spots
       in the 925" title, the burgers and the loaded fries. @takeoutwithtuck's. */
    clip: {
      src: '/clips/chef-jeffs-smash-burger.mp4',
      poster: '/clips/chef-jeffs-smash-burger-poster.webp',
      href: 'https://www.instagram.com/reel/DQe8tiVkpCK/',
      credit: 'Filmed by @takeoutwithtuck',
      platform: 'Instagram',
      by: 'takeoutwithtuck',
    },
    sections: [
      {
        name: 'Burgers and sandwiches',
        items: [
          ['Single Smashed', 'Smashed 100% Angus chuck ground beef patty, cheese, lettuce, tomatoes, grilled onions, pickles and secret sauce. Make it complete: $17.', 1100, 'chef-jeffs-smash-burger-1'],
          ['Double Smashed', 'Two smashed 100% Angus chuck ground beef patties, cheese, lettuce, tomatoes, grilled onions, pickles and secret sauce. Make it complete: $20.', 1600],
          ['Sweet n Spicy Chicken', 'Two breaded chicken tenderloins on a toasted bun with cheese, shredded lettuce, sliced tomato, raw onion, pickles and their homemade sweet and hot sauce. Make it complete: $17.', 1100],
          ['Breakfast Croissant', 'Bacon, sausage patty, egg frittata and cheese on a buttery toasted croissant. Make it complete: $17.', 1100],
        ],
      },
      {
        name: 'Smashed fries and salad',
        items: [
          ['Smashed Fries', 'A smashed 100% Angus chuck ground beef patty, cheese, bacon, tomatoes, grilled onions, pickles and secret sauce on a bed of fries. Make it complete: $15.', 1300],
          ['Smashed Salad', 'A smashed 100% Angus chuck ground beef patty, cheese, tomatoes, grilled onions, bacon, pickles and secret sauce on a bed of lettuce. Make it complete: $17.', 1300],
        ],
      },
      {
        name: 'Sides',
        items: [
          ['Onion Rings', 'Crunchy beer-battered onion rings', 700],
          ['Fries', 'Crispy seasoned shoestring fries', 600],
          ['Cheese Fries', 'Crispy seasoned fries smothered in nacho cheese with bacon', 900],
        ],
      },
      {
        name: 'Kids',
        items: [
          ['Smashburger with Fries', '', 800],
          ['Chicken Strips with Fries', '', 800],
        ],
      },
      {
        name: 'Add-ons',
        items: [
          ['Thick Cut Bacon', '', 300],
          ['Extra Cheese', 'American, cheddar, habanero jack, Monterey jack or Swiss', 50],
          ['Real Swiss Cheese', '', 50],
          ['Grilled Mushrooms', '', 50],
          ['Fresh Jalapeños', '', 50],
        ],
      },
      {
        name: 'Drinks',
        items: [
          ['Milkshake, Medium', 'Chocolate, cookies and cream, strawberry, PB&C (peanut butter and chocolate) or vanilla', 575],
          ['Milkshake, Large', 'Chocolate, cookies and cream, strawberry, PB&C (peanut butter and chocolate) or vanilla', 675],
          ['Cold Drink', 'Canned soda or bottled water', 200],
        ],
      },
      {
        name: 'Dessert',
        items: [
          ['Gourmet Brownies', 'Chocolate salted caramel, peanut butter toffee, Peruvian chocolate chunk or gluten-free chocolate', 350],
        ],
      },
    ],
  }),

  /* ---- 2026-09-10 evening to 09-12, the messages after the 10 September
     commits. Research in research/roster/batch21.json. ---- */
  /* BratPak Dog Kamp, "Livermore • Services" — cage-free daycare, overnight
     boarding and in-home training on First Street. Pet grooming and walking
     is the nearest seat a services page has, and Livermore's was open. They
     publish no rates; the first day or first night is free, per their site.
     A second shop in Henderson, Nevada is his call for the Las Vegas page. */
  seed('bratpak-dog-kamp', 'BratPak Dog Kamp', 'BratPak', 'Dog daycare and boarding', '#F08A24', {
    icon: 'bratpak-dog-kamp',
    logoTemplate: 'wordmark', logoLines: ['BratPak'], logoFace: 'grotesk',
    site: 'https://bratpakdogkamp.com/',
    siteCta: 'Book on their site',
  }),
  /* Sliceit Pizza, "Martinez • Goods" — slices, pies and calzones. Seated on
     Martinez's open Italian seat as he labelled it; the shop itself is on
     Pacheco Blvd in Pacheco, which borders Martinez and has no page, and the
     page shows that address. The menu is sliceitnow.com's. */
  seed('sliceit-pizza', 'Sliceit Pizza', 'Sliceit', 'Pizza', '#111111', {
    icon: 'sliceit-pizza',
    logoTemplate: 'wordmark', logoLines: ['SLICEit'], logoFace: 'condensed',
    site: 'https://sliceitnow.com/',
    siteCta: 'Order online',
  }),
  /* Dog Haus Biergarten Berkeley, "Berkeley • Goods", sent as their rewards
     link. Hot dogs and smashburgers take Berkeley's open Burgers and hot dogs
     seat. The prices are the Berkeley store's, from their ordering storefront
     switched to Berkeley, which prices differently from their other stores.
     Their location page and their Berkeley Instagram disagree about the late
     hours, so none are carried. A franchise of a national brand. */
  seed('dog-haus-berkeley', 'Dog Haus Biergarten', 'Dog Haus', 'Hot dogs and burgers', '#E4342A', {
    icon: 'dog-haus-berkeley',
    logoTemplate: 'wordmark', logoLines: ['Dog', 'Haus'], logoFace: 'grotesk',
    site: 'https://locations.doghaus.com/locations/ca/berkeley/1407-san-pablo-ave-suite-a',
    siteCta: 'See the Berkeley store',
  }),
  /* P.I. Wings, "Daly city • Goods" — Filipino flavours on a chicken wing.
     Daly City's Chicken wings seat was open. Their site prints the number and
     the email, and a menu that is one picture with no prices; the address and
     the Wednesday-to-Sunday hours are their own Instagram bio. */
  seed('pi-wings', 'P.I. Wings', 'P.I. Wings', 'Filipino wings', '#2D384B', {
    icon: 'pi-wings',
    logoTemplate: 'monogram', logoInitials: 'PI', logoFace: 'grotesk',
    site: 'https://www.eatpiwings.com/',
    siteCta: 'See the menu',
  }),
  /* Pizza Ponte, "Oakland • Goods" — Temescal, run by two brothers. Oakland's
     Italian seat is Philomena Pizza's, so the yellow sheet, at the free Tier 1
     his rule of 9 September sets for a yellow-sheet spot. Their own site
     prints no address or number; both are off the Apple Maps card he sent
     with the link. */
  seed('pizza-ponte', 'Pizza Ponte', 'Pizza Ponte', 'Pizza', '#0A2A56', {
    icon: 'pizza-ponte',
    logoTemplate: 'wordmark', logoLines: ['Pizza', 'Ponte'], logoFace: 'slab',
    site: 'https://www.ponte.pizza/',
    siteCta: 'Order online',
    tier: 1,
  }),
  /* Claire Anderson, "BEASTY • Services — Lets tap into a new market", and
     "I'll get ahold of her and give her a lifetime affiliate deal." The first
     realtor on the app: Corcoran Icon Properties, DRE 01513554, luxury and
     relocation across Oakland, Piedmont, Lamorinda and San Francisco. BEASTY
     Services is full, so its yellow sheet. THE WHOLE PAGE, not Tier 1: every
     spot on the BEASTY pages gets the full treatment by his note of 9
     September, and a Tier 1 page prints a three-month expiry that would
     contradict the lifetime deal he is offering her. The mark is her own
     compass logo, cut from his screenshot of her site. */
  seed('claire-anderson-homes', 'Claire Anderson', 'Claire Anderson', 'Real estate agent', '#6F6A67', {
    icon: 'claire-anderson-homes',
    logoTemplate: 'wordmark', logoLines: ['Claire', 'Anderson'], logoFace: 'script',
    site: 'https://www.movetherecallclaire.com/',
    siteCta: 'See her listings',
  }),

  /* ---- 2026-09-13, the two he sent that morning. Research in
     research/roster/batch22.json. ---- */
  /* Daughter Thai Kitchen, "Oakland • Goods" — Southern Thai on Medau Place in
     Montclair; their site says they won Food Network's Thai Takedown.
     Oakland's Asian food seat is Cambodian Street Food's, so the yellow sheet,
     at the free Tier 1 his rule of 9 September sets for a yellow-sheet spot.
     Their menu and prices are their own ordering page's. The mark is their
     logo from that page, on a black tile. */
  seed('daughter-thai', 'Daughter Thai Kitchen', 'Daughter Thai', 'Southern Thai', '#0D0D0D', {
    icon: 'daughter-thai',
    logoTemplate: 'wordmark', logoLines: ['Daughter'], logoFace: 'script',
    site: 'https://daughterthai.com/',
    siteCta: 'Order online',
    /* "Clip this video plz for Daughters kitchen", 2026-10-01 (the reel tags 6118
       Medau Pl). A yellow-sheet business with a film gets the whole page, so the
       free Tier 1 listing ends here. */
    clip: {
      src: '/clips/daughter-thai.mp4',
      poster: '/clips/daughter-thai-poster.webp',
      href: 'https://www.instagram.com/reel/Ddptshixa3e/',
      credit: 'Filmed by @bayareamunchies510',
      platform: 'Instagram',
      by: 'bayareamunchies510',
    },
  }),
  /* MexiHibachi, "Pinole • Goods" — Mexican and Japanese hibachi together, on
     Fitzgerald Drive. Pinole's Mexican food seat was open, and Mexican is the
     half they lead with. Their own site prints no menu and no prices, only
     "Text Menu @ 415.604.7135", and their Toast page had online ordering
     switched off with nothing listed, so the page says so and gives the
     number. Delivery marketplaces were not used. The mark is their own
     Instagram picture. */
  seed('mexihibachi', 'MexiHibachi', 'MexiHibachi', 'Mexican-Japanese fusion', '#0B0B0B', {
    icon: 'mexihibachi',
    logoTemplate: 'wordmark', logoLines: ['Mexi', 'Hibachi'], logoFace: 'condensed',
    site: 'https://mexihibachi.com/',
    siteCta: 'Visit their site',
  }),

  /* ---- 2026-09-13 evening. Research in research/roster/batch23.json. ---- */
  /* Gumbo Social, "San Francisco • Goods — Needs website" — gumbo, po'boys
     and catering on 3rd Street in Bayview. No goods category fits a gumbo
     kitchen, so San Francisco's yellow sheet, at the free Tier 1 his rule of
     9 September sets. NOT OUTLINED as siteless: gumbosocial.com is live (a
     Wix site updated 2026-09-08, with the menu this record carries), and the
     outline on the tile reads "no website" to a screen reader and marks a
     business for a website pitch. His note is passed back to him instead.
     Café Mélange at City Hall, the counter his Apple Maps card showed, is the
     owner's separate sister café; none of its details are used here. The mark
     is their own logo, cut from his screenshot of their Instagram picture. */
  seed('gumbo-social', 'Gumbo Social', 'Gumbo Social', 'Soul food & gumbo', '#1C7C85', {
    icon: 'gumbo-social',
    logoTemplate: 'wordmark', logoLines: ['Gumbo', 'Social'], logoFace: 'grotesk',
    site: 'https://www.gumbosocial.com/',
    siteCta: 'See their menu',
    tier: 1,
  }),

  /* ---- 2026-09-14. Research in research/roster/batch24.json. ---- */
  /* Ace King BBQ, "Newark • Goods" — Chinese BBQ skewers, foil-pan dishes and
     noodles on Mowry Avenue, open late. Newark's Asian food seat is Pho
     Nation's, so the yellow sheet at the free Tier 1. Their site and ordering
     page still carry an old "Ace King Music Restaurant" logo at the same
     address; the mark here is the BBQ logo off their own Instagram picture. */
  seed('ace-king-bbq', 'Ace King BBQ', 'Ace King', 'Chinese BBQ skewers', '#2E3F7C', {
    icon: 'ace-king-bbq',
    logoTemplate: 'wordmark', logoLines: ['ACE', 'KING'], logoFace: 'condensed',
    site: 'https://www.acekingbbqus.com/',
    siteCta: 'Order online',
    tier: 3,
    /* Glenn, 2026-10-15/16: requested film; caption confirms this business. */
    clip: {
        "src": "/clips/ace-king-bbq.mp4",
        "poster": "/clips/ace-king-bbq-poster.webp",
        "href": "https://www.instagram.com/reel/DeNbo-hynOi/",
        "credit": "Filmed by @victoria.pham17",
        "platform": "Instagram",
        "by": "victoria.pham17"
    },
  }),
  /* Sushi Uma, sent as their Instagram post with "gather as much information
     maybe on yelp and make them a page. They will be a good candidate to get
     a website made." Family-owned sushi on Irving Street, ten years this
     summer, on San Francisco's open Sushi seat with the whole page. Yelp
     blocked the researcher, and Yelp was never a price source: the menu is
     the ordering page on their own site. THEY HAVE A SITE, thesushiuma.com, a
     2016 Wix template that still takes pickup orders, so the tile is not
     outlined as siteless; a redesign is the pitch. No mark of theirs was
     sent, so the tile is drawn. */
  seed('sushi-uma', 'Sushi Uma', 'Sushi Uma', 'Japanese sushi', '#9E2A2B', {
    logoTemplate: 'monogram', logoInitials: 'SU', logoFace: 'slab',
    site: 'https://www.thesushiuma.com/',
    siteCta: 'Order pickup',
  }),
  /* Harborview Restaurant & Bar, "San Francisco • Goods" — Michelin Guide
     Cantonese, dim sum and roast duck at 4 Embarcadero Center. San
     Francisco's Asian food seat is House of Thai's, so the yellow sheet at
     Tier 1. No hours: their site's visible hours and its search-engine data
     disagree about dinner. The mark is their own logo, cut from his
     screenshot of their Instagram picture. */
  seed('harborview-sf', 'Harborview Restaurant & Bar', 'Harborview', 'Cantonese Chinese', '#A4262C', {
    icon: 'harborview-sf',
    logoTemplate: 'wordmark', logoLines: ['HARBORVIEW'], logoFace: 'grotesk',
    site: 'https://www.harborviewsf.com/',
    siteCta: 'See their menus',
    tier: 1,
  }),
  /* The Sea by Alexander's Steakhouse, "Palo Alto • Goods" — seafood with
     Japanese flair and wagyu on El Camino Real, dinner only. No goods seat
     fits seafood or steak, so Palo Alto's yellow sheet at Tier 1. Prices are
     the dinner menu their own site links on iMenuPro. The mark is the
     wordmark from his screenshot of their site. */
  seed('the-sea-by-ash', "The Sea by Alexander's Steakhouse", 'The Sea', 'Seafood & Wagyu', '#1F4E9C', {
    icon: 'the-sea-palo-alto',
    logoTemplate: 'wordmark', logoLines: ['THE', 'SEA'], logoFace: 'grotesk',
    site: 'https://theseausa.com/',
    siteCta: 'See their menu',
    /* Glenn, 29 Oct: BEASTY • Steakhouse and Watch their own film: show the full page. */
    tier: 3,
    clip: {
      src: '/clips/the-sea-by-ash.mp4',
      poster: '/clips/the-sea-by-ash-poster.webp',
      href: 'https://www.instagram.com/p/Dexogd1g-UR/',
      credit: 'Posted by @theseabyash',
      platform: 'Instagram',
    },
  }),

  /* ---- 2026-09-15 and 16. Research in research/roster/batch25.json. ----
     Every mark below is cut from his screenshots of the business's own
     Instagram picture or website. A seat on a yellow sheet is the free
     Tier 1; a category seat is the whole page. */

  /* Mar Y Mar, "San Bruno • Goods. Needs website absolutely new new" — a new
     mariscos taqueria and bar on San Mateo Avenue. San Bruno's Mexican food
     seat was open. No website, so no link and the red outline. Instagram put
     a "NEW" badge over the bottom of their picture; that strip is filled with
     the picture's own paper. */
  seed('mar-y-mar', 'Mar Y Mar', 'Mar Y Mar', 'Mexican seafood', '#0B0B0F', {
    icon: 'mar-y-mar',
    logoTemplate: 'wordmark', logoLines: ['Mar Y Mar'], logoFace: 'script',
  }),
  /* Tacos Mi Reynita, "3 locations. Needs Website" — Tijuana-style tacos. Their
     own Toast site lists FOUR shops with a number each, so four seeds on the
     Pho Nation pattern, each on its city's open Mexican food seat with that
     shop's own menu (the prices differ by a little between them). Their only
     site is the Toast one, so the red outline stays. San Jose and Hayward were
     not taking online orders when read; the link still shows the menu. */
  seed('tacos-mi-reynita-san-lorenzo', 'Tacos Mi Reynita', 'Mi Reynita', 'Tijuana-style tacos', '#26A891', {
    icon: 'tacos-mi-reynita',
    logoTemplate: 'wordmark', logoLines: ['Tacos Mi', 'Reynita'], logoFace: 'condensed',
    site: 'https://tacosmireynita.toast.site/order/tacos-mi-reynita-san-lorenzo-575-paseo-grande',
    siteCta: 'Order pickup',
    needsSite: true,
  }),
  seed('tacos-mi-reynita-hayward', 'Tacos Mi Reynita', 'Mi Reynita', 'Tijuana-style tacos', '#26A891', {
    icon: 'tacos-mi-reynita',
    logoTemplate: 'wordmark', logoLines: ['Tacos Mi', 'Reynita'], logoFace: 'condensed',
    site: 'https://tacosmireynita.toast.site/order/tacos-mi-reynita-hayward-821-sycamore-avenue',
    siteCta: 'See their menu',
    needsSite: true,
  }),
  seed('tacos-mi-reynita-san-jose', 'Tacos Mi Reynita', 'Mi Reynita', 'Tijuana-style tacos', '#26A891', {
    icon: 'tacos-mi-reynita',
    logoTemplate: 'wordmark', logoLines: ['Tacos Mi', 'Reynita'], logoFace: 'condensed',
    site: 'https://tacosmireynita.toast.site/order/tacos-mi-reynita-san-jose-2075-alum-rock-avenue',
    siteCta: 'See their menu',
    needsSite: true,
  }),
  seed('tacos-mi-reynita-fremont', 'Tacos Mi Reynita', 'Mi Reynita', 'Tijuana-style tacos', '#26A891', {
    icon: 'tacos-mi-reynita',
    logoTemplate: 'wordmark', logoLines: ['Tacos Mi', 'Reynita'], logoFace: 'condensed',
    site: 'https://tacosmireynita.toast.site/order/tacos-mi-reynita-restaurant-hayward-821-sycamore-avenue',
    siteCta: 'Order pickup',
    needsSite: true,
  }),
  /* Turtle Tower, "San Francisco • Goods" — Northern Vietnamese since 1999, in
     the Marina and the Financial District. San Francisco's Asian food seat is
     House of Thai's, so the yellow sheet at Tier 1. */
  seed('turtle-tower', 'Turtle Tower', 'Turtle Tower', 'Northern Vietnamese', '#2A3D92', {
    icon: 'turtle-tower',
    logoTemplate: 'wordmark', logoLines: ['TURTLE', 'TOWER'], logoFace: 'grotesk',
    site: 'https://www.turtletowersf.com/',
    siteCta: 'See their menu',
    tier: 1,
  }),
  /* Plaza Cafe, "Pleasant Hill • Goods. Brand brand new. Needs a website." —
     breakfast since 1985 and, from 9 September, Korean street food at night,
     on Pleasant Hill's open Korean seat. plazapleasanthill.com is an ordering
     template (the Masa case: an ordering platform on their own domain, a map
     of Los Angeles on its info page), so the red outline stays. */
  seed('plaza-cafe-pleasant-hill', 'Plaza Cafe', 'Plaza Cafe', 'Breakfast & Korean food', '#3D270F', {
    icon: 'plaza-cafe-pleasant-hill',
    logoTemplate: 'wordmark', logoLines: ['PLAZA', 'CAFE'], logoFace: 'slab',
    site: 'https://plazapleasanthill.com/',
    siteCta: 'Order online',
    needsSite: true,
  }),
  /* hone, "San Jose • Services" — a piercing studio on Lincoln Avenue in
     Willow Glen, on San Jose's open body-art seat (widened to "Tattoo and
     piercing" for them in data/slots.ts). Fees are their booking page's;
     jewelry is priced separately. */
  seed('hone-piercing', 'Hone Piercing', 'Hone', 'Piercing studio', '#1A1412', {
    icon: 'hone-piercing',
    logoTemplate: 'wordmark', logoLines: ['hone'], logoFace: 'grotesk',
    site: 'https://www.honepiercing.com/',
    siteCta: 'Book a piercing',
  }),
  /* CycleBar Berkeley, "Berkeley • Services" — indoor cycling on University
     Avenue. Berkeley's Gym seat is BodyRok's, so the yellow sheet at Tier 1.
     The link is the studio's own page on the franchise site. */
  seed('cyclebar-berkeley', 'CycleBar Berkeley', 'CycleBar', 'Indoor cycling studio', '#E21F26', {
    icon: 'cyclebar-berkeley',
    logoTemplate: 'wordmark', logoLines: ['CYCLEBAR'], logoFace: 'condensed',
    site: 'https://www.cyclebar.com/location/berkeley',
    siteCta: 'See classes and prices',
    tier: 1,
  }),
  /* Rumble Boxing San Ramon, "San Ramon • Services" — boxing-inspired group
     fitness in Diablo Plaza, on San Ramon's open Gym seat. */
  seed('rumble-boxing-san-ramon', 'Rumble Boxing San Ramon', 'Rumble', 'Boxing fitness studio', '#D71F36', {
    icon: 'rumble-boxing-san-ramon',
    logoTemplate: 'wordmark', logoLines: ['RUMBLE'], logoFace: 'condensed',
    site: 'https://www.rumbleboxinggym.com/location/san-ramon',
    siteCta: 'Book a class',
  }),
  /* Truffle Poke Bar, "Multiple locations • Goods" — four Peninsula shops, one
     seed per city on the Pho Nation pattern, each on its city's open Sushi
     seat (poke is raw fish; there is no closer tile). The mark is the badge
     from their own website. */
  seed('truffle-poke-belmont', 'Truffle Poke Bar', 'Truffle Poke', 'Poke & sushi', '#0B0B0B', {
    icon: 'truffle-poke-bar',
    logoTemplate: 'wordmark', logoLines: ['Truffle'], logoFace: 'script',
    site: 'https://www.trufflepokebar.com/',
    siteCta: 'See their menu',
  }),
  seed('truffle-poke-burlingame', 'Truffle Poke Bar', 'Truffle Poke', 'Poke & sushi', '#0B0B0B', {
    icon: 'truffle-poke-bar',
    logoTemplate: 'wordmark', logoLines: ['Truffle'], logoFace: 'script',
    site: 'https://www.trufflepokebar.com/',
    siteCta: 'See their menu',
  }),
  seed('truffle-poke-ssf', 'Truffle Poke Bar', 'Truffle Poke', 'Poke & sushi', '#0B0B0B', {
    icon: 'truffle-poke-bar',
    logoTemplate: 'wordmark', logoLines: ['Truffle'], logoFace: 'script',
    site: 'https://www.trufflepokebar.com/',
    siteCta: 'See their menu',
  }),
  seed('truffle-poke-san-mateo', 'Truffle Poke Bar', 'Truffle Poke', 'Poke & sushi', '#0B0B0B', {
    icon: 'truffle-poke-bar',
    logoTemplate: 'wordmark', logoLines: ['Truffle'], logoFace: 'script',
    site: 'https://www.trufflepokebar.com/',
    siteCta: 'See their menu',
  }),
  /* Balompié Sports Bar & Grill, "Richmond • Goods. Needs a Website ASAP" —
     Salvadoran food and a sports bar at Hilltop. No tile for Salvadoran food
     (Mexican would be wrong), so the yellow sheet at Tier 1. No website: no
     link, and the red outline follows from that. */
  seed('balompie', 'Balompié Sports Bar & Grill', 'Balompié', 'Salvadoran', '#1B1210', {
    icon: 'balompie',
    logoTemplate: 'wordmark', logoLines: ['Balompié'], logoFace: 'script',
    tier: 1,
  }),
  /* Paper Plane, "San Jose • Goods" — a bar on South First Street. No bar
     tile, so the yellow sheet at Tier 1. */
  seed('paper-plane-sj', 'Paper Plane', 'Paper Plane', 'Cocktail bar', '#0A0A0A', {
    icon: 'paper-plane-sj',
    logoTemplate: 'wordmark', logoLines: ['PAPER', 'PLANE'], logoFace: 'grotesk',
    site: 'https://paperplanesj.com/',
    siteCta: 'Visit their site',
    tier: 1,
  }),
  /* Benchmark Climbing, "Berkeley • Services / San Francisco • Services" — two
     bouldering gyms. Both cities' Gym seats are taken (BodyRok, Beat Drop), so
     each goes on its yellow sheet at Tier 1, one seed per gym. Their mark is
     the arch alone; the wordmark was cut off in his screenshot. */
  seed('benchmark-climbing-berkeley', 'Benchmark Climbing', 'Benchmark', 'Bouldering gym', '#23272A', {
    icon: 'benchmark-climbing',
    logoTemplate: 'wordmark', logoLines: ['BENCHMARK'], logoFace: 'grotesk',
    site: 'https://www.benchmarkclimbing.com/',
    siteCta: 'See passes and prices',
    tier: 1,
  }),
  seed('benchmark-climbing-sf', 'Benchmark Climbing', 'Benchmark', 'Bouldering gym', '#23272A', {
    icon: 'benchmark-climbing',
    logoTemplate: 'wordmark', logoLines: ['BENCHMARK'], logoFace: 'grotesk',
    site: 'https://www.benchmarkclimbing.com/',
    siteCta: 'See passes and prices',
    tier: 1,
  }),
  /* Deli Board, "San Francisco • Goods" — sandwiches on Folsom Street, on San
     Francisco's open Sandwiches seat. The film is @antoinetterzz's, sent in the
     same message as the listing, so it plays as a review under his protocol of
     2026-09-09 (see docs/FOODIES.md). */
  seed('deli-board', 'Deli Board', 'Deli Board', 'Sandwiches', '#1C1C1C', {
    icon: 'deli-board',
    logoTemplate: 'wordmark', logoLines: ['DELI', 'BOARD'], logoFace: 'condensed',
    site: 'https://deliboardsf.com/',
    siteCta: 'See their menu',
    clip: {
      src: '/clips/deli-board.mp4',
      poster: '/clips/deli-board-poster.webp',
      href: 'https://www.instagram.com/reel/DdVGzARTQiS/',
      credit: 'Filmed by @antoinetterzz',
      platform: 'Instagram',
      by: 'antoinetterzz',
    },
  }),
  /* Brazuca Açaí, "Richmond • Goods" — açaí bowls on Barrett Avenue. He sent
     their DoorDash page; nothing here comes from it. No tile for açaí (Ice
     cream is Waffles Cream's), so the yellow sheet at Tier 1. No website of
     their own, so no link. */
  seed('brazuca-acai', 'Brazuca Açaí', 'Brazuca', 'Açaí bowls', '#009C3B', {
    icon: 'brazuca-acai',
    logoTemplate: 'wordmark', logoLines: ['Brazuca'], logoFace: 'script',
    tier: 1,
  }),
  /* The Gravity Vault Marin, "Marin • Services" — an indoor climbing gym at
     Smith Ranch Road. There is no Marin page; San Rafael is the city on their
     address, and its Gym seat was open. */
  seed('gravity-vault-marin', 'The Gravity Vault Marin', 'Gravity Vault', 'Indoor climbing gym', '#0D4E7D', {
    icon: 'gravity-vault-marin',
    logoTemplate: 'wordmark', logoLines: ['GRAVITY', 'VAULT'], logoFace: 'grotesk',
    site: 'https://gravityvault.com/locations/marin-county-ca',
    siteCta: 'See rates and classes',
  }),
  /* Batch & Brine, "Lafayette • Goods" — burgers, brunch and cocktails on Mt.
     Diablo Blvd. Lafayette's Burgers seat is Kabab Burger's, so the yellow
     sheet at Tier 1. The menu is their Toast pickup page, read in a real
     browser; the dine-in and bar lists on it are left out. */
  seed('batch-and-brine', 'Batch & Brine', 'Batch & Brine', 'Burgers & brunch', '#B79A37', {
    icon: 'batch-and-brine',
    logoTemplate: 'wordmark', logoLines: ['BATCH', '& BRINE'], logoFace: 'grotesk',
    site: 'https://www.batchandbrine.com/',
    siteCta: 'See their menus',
    tier: 1,
  }),
  /* Thai Thani and Oishi, "Walnut Creek • Goods" — Thai food and sushi under one
     roof on Ygnacio Valley Road, on Walnut Creek's open Asian food seat. The
     menu is their own pickup ordering page. */
  seed('thai-thani-oishi', 'Thai Thani and Oishi', 'Thai Thani', 'Thai & sushi', '#702573', {
    icon: 'thai-thani-oishi',
    logoTemplate: 'wordmark', logoLines: ['Thai Thani'], logoFace: 'slab',
    site: 'https://www.thaithanioishi.com/',
    siteCta: 'Order pickup',
  }),
  /* Brew & Banh Mi Cafe, "Milpitas • Goods" — coffee, tea and banh mi on
     Cypress Drive, on Milpitas's open Coffee seat. */
  seed('brew-and-banh-mi', 'Brew & Banh Mi Cafe', 'Brew Banh Mi', 'Coffee & banh mi', '#6F4A24', {
    icon: 'brew-and-banh-mi',
    logoTemplate: 'wordmark', logoLines: ['BREW &', 'BANH MI'], logoFace: 'slab',
    site: 'https://www.brewbanhmicafe.com/en',
    siteCta: 'See their menu',
  }),
  /* Delage, "Oakland • Goods" — sushi and omakase on 9th Street, reopening on
     16 September under Kyle Itani, on Oakland's open Sushi seat. Their menus
     are samples (the fish changes daily); the omakase is a seat at the
     counter, so it is named in the note rather than sold as pickup. */
  seed('delage-oakland', 'Delage', 'Delage', 'Sushi & omakase', '#732B2F', {
    icon: 'delage-oakland',
    logoTemplate: 'wordmark', logoLines: ['DELAGE'], logoFace: 'slab',
    site: 'https://www.delagesushi.com/',
    siteCta: 'See their menus',
  }),
  /* Taj Mahal, "Livermore • Goods. I deliver for them so I'll get an offer
     soon." — an Indian restaurant, bar and lounge at the outlets. Livermore's
     Indian seat is Pijja Paradise's, so the yellow sheet at Tier 1 until they
     sign. */
  seed('taj-mahal-livermore', 'Taj Mahal', 'Taj Mahal', 'Indian', '#002541', {
    icon: 'taj-mahal-livermore',
    logoTemplate: 'wordmark', logoLines: ['TAJ', 'MAHAL'], logoFace: 'slab',
    site: 'https://tajmahalflavorsofindia.com/',
    siteCta: 'See their menu',
    tier: 1,
  }),
  /* Yakiniku Shodai, "San Francisco • Goods" — Japanese wagyu barbecue on
     Market Street. No tile for yakiniku, and Asian food is House of Thai's, so
     the yellow sheet at Tier 1. */
  seed('shodai-sf', 'Yakiniku Shodai', 'Shodai', 'Japanese yakiniku', '#3A342E', {
    icon: 'shodai-sf',
    logoTemplate: 'wordmark', logoLines: ['SHODAI'], logoFace: 'slab',
    site: 'https://www.shodaisf.com/',
    siteCta: 'See their menus',
    tier: 1,
  }),
  /* ThirsTea, "San Leandro • Goods. Brand new new. Needs website asap" — a
     ThirsTea (by Brain Tune Cafe) boba shop opening on MacArthur Blvd, soft
     opening 17 September, on San Leandro's open Boba seat. The chain's site
     lists this shop and its ordering page, so no red outline: a page of the
     shop's own is the pitch. */
  seed('thirstea-san-leandro', 'ThirsTea', 'ThirsTea', 'Boba tea', '#E4312B', {
    icon: 'thirstea-san-leandro',
    logoTemplate: 'wordmark', logoLines: ['THIRSTEA'], logoFace: 'grotesk',
    site: 'https://thirstea.com/',
    siteCta: 'Visit their site',
  }),
  /* Z & Y Peking Duck, "San Francisco • Goods" — Peking duck and dim sum on
     Jackson Street. Asian food is House of Thai's, so the yellow sheet at
     Tier 1. */
  seed('z-and-y-peking-duck', 'Z & Y Peking Duck', 'Z & Y', 'Peking duck & dim sum', '#B42C39', {
    icon: 'z-and-y-peking-duck',
    logoTemplate: 'wordmark', logoLines: ['Z & Y'], logoFace: 'slab',
    site: 'https://zandypekingduck.com/',
    siteCta: 'See their menu',
    tier: 1,
  }),
  /* BIBO Salon, "Oakland • Services" — a full-service hair salon on Broadway,
     on Oakland's open Barber and salon seat. Prices are the "from" list on
     their own site; their booking page quotes higher fixed prices. */
  seed('bibo-salon', 'BIBO Salon', 'BIBO', 'Hair salon', '#2A2D35', {
    icon: 'bibo-salon',
    logoTemplate: 'wordmark', logoLines: ['BIBO'], logoFace: 'slab',
    site: 'https://www.bibosalon.com/',
    siteCta: 'Book an appointment',
  }),
  /* Pizza Deli & Grill, "Oakland • Goods" — halal pizza, burgers and
     cheesesteaks on International Blvd. Italian is Philomena Pizza's, so the
     yellow sheet at Tier 1. The www address he sent fails; the bare domain
     works. */
  seed('pizza-deli-and-grill', 'Pizza Deli & Grill', 'Pizza Deli', 'Halal pizza & grill', '#B3261E', {
    /* Halal on their own pages — the standard mark, his ask of 2026-09-18. */
    dietary: ['Halal'],
    icon: 'pizza-deli-and-grill',
    logoTemplate: 'wordmark', logoLines: ['PIZZA DELI', '& GRILL'], logoFace: 'condensed',
    site: 'https://pizzadeliandgrill.com/',
    siteCta: 'Order pickup',
    tier: 1,
  }),
  /* Cal Burger & More, "Berkeley • Goods" — smash burgers, wings and Crazyades
     on Euclid Avenue. Berkeley's Burgers seat is Dog Haus's, so the yellow
     sheet. Their site is new and unfinished (a placeholder phone number), so no
     number is carried. It was Tier 1 until Glenn's film of 2026-10-12 ("Clip this
     video plz / For CalBurger"): a yellow-sheet business with a film gets the
     whole page. */
  seed('cal-burger', 'Cal Burger & More', 'Cal Burger', 'Smash burgers & wings', '#1B2A4E', {
    icon: 'cal-burger',
    logoTemplate: 'wordmark', logoLines: ['CAL', 'BURGER'], logoFace: 'condensed',
    site: 'https://calbgocrazy.com/',
    siteCta: 'See their menu',
    clip: {
      src: '/clips/cal-burger.mp4',
      poster: '/clips/cal-burger-poster.webp',
      href: 'https://www.instagram.com/reel/DccevdIRc0g/',
      credit: 'Filmed by @bayareamunchies510',
      platform: 'Instagram',
      by: 'bayareamunchies510',
    },
  }),

  /* ---- 2026-09-17. Research in research/roster/batch26.json. ---- */

  /* Roast Eatery Co., "Needs website. Brentwood • Goods" — Hong Kong roast
     duck and soy sauce braised goods to take away, in the same plaza on
     Balfour Road as Dim Sum Basket below. Brentwood's Asian food seat is X
     Noodles', so the yellow sheet at Tier 1. No website anywhere: no link,
     and the red outline follows. They publish no prices of their own either. */
  seed('roast-eatery-co', 'Roast Eatery Co.', 'Roast Eatery', 'Hong Kong Chinese BBQ', '#F0A32B', {
    icon: 'roast-eatery-co',
    logoTemplate: 'wordmark', logoLines: ['ROAST', 'EATERY'], logoFace: 'condensed',
    tier: 1,
  }),
  /* Dim Sum Basket, "Brentwood • Goods. Needs website" — dim sum to go, two
     doors from Roast Eatery. Their only site is a Square store, so the red
     outline stays; the store's whole catalogue today is rice pudding and
     bottled Ramune, and it is not taking orders. Yellow sheet at Tier 1. */
  seed('dim-sum-basket', 'Dim Sum Basket', 'Dim Sum', 'Cantonese dim sum', '#F5C518', {
    icon: 'dim-sum-basket',
    logoTemplate: 'wordmark', logoLines: ['DIM SUM', 'BASKET'], logoFace: 'grotesk',
    site: 'https://dimsumbasket.square.site/',
    siteCta: 'See their shop',
    needsSite: true,
    tier: 1,
  }),
  /* Brentwood Rehab & Performance PT, "Brentwood • Services" — one-on-one
     physical therapy on Sand Creek Road. No tile for a clinic, so Brentwood's
     yellow sheet at Tier 1. They publish no prices. */
  seed('brentwood-rehab-pt', 'Brentwood Rehab & Performance PT', 'Brentwood PT', 'Physical therapy', '#14293C', {
    icon: 'brentwood-rehab-pt',
    logoTemplate: 'wordmark', logoLines: ['BRENTWOOD', 'REHAB'], logoFace: 'grotesk',
    site: 'https://www.brentwoodphysicaltherapy.com/',
    siteCta: 'Book a visit',
    tier: 1,
  }),
  /* Double Rainbow Cafe, "San Rafael • Goods" — a café and ice cream shop at
     Autistry Studios on 4th Street, where the training is for neurodivergent
     students, on San Rafael's open Ice cream seat. */
  seed('double-rainbow-cafe', 'Double Rainbow Cafe', 'Double Rainbow', 'Cafe & ice cream', '#E4762D', {
    icon: 'double-rainbow-cafe',
    logoTemplate: 'wordmark', logoLines: ['Double', 'Rainbow'], logoFace: 'grotesk',
    site: 'https://doublerainbowcafe.com/',
    siteCta: 'See their menu',
  }),
  /* Studio Flora's, "San Francisco • Services" — pressed flower art, rug
     tufting, candles and mosaic lamps, taught on Sutter Street and in San
     Jose. No tile for a craft workshop, so San Francisco's yellow sheet at
     Tier 1. */
  seed('studio-floras', "Studio Flora's", 'Studio Flora', 'Art & craft workshops', '#C2A66D', {
    icon: 'studio-floras',
    logoTemplate: 'wordmark', logoLines: ['STUDIO', "FLORA'S"], logoFace: 'slab',
    site: 'https://www.studiofloras.com/',
    siteCta: 'Book a workshop',
    tier: 1,
  }),
  /*
    The Local, "Petaluma • Goods. I deliver to this restaurant weekly and I
    know the owner. Please give him a glow on his page and do as much for it as
    you can. He will give me an offer soon and spearhead the city of Petaluma."

    So: Petaluma's open Sandwiches seat, the whole page, the glow he asked for,
    their own menu and one of their own photographs — and the reel he sent
    right after, which is @thespoonlist's film of the shop, playing as a review
    with her credit linking her Instagram, as he asked.
  */
  seed('the-local-petaluma', 'The Local', 'The Local', 'Farm-to-table sandwiches', '#1E2738', {
    glow: true,
    icon: 'the-local-petaluma',
    logoTemplate: 'wordmark', logoLines: ['THE', 'LOCAL'], logoFace: 'slab',
    site: 'https://www.thelocalpetaluma.com/',
    siteCta: 'See their menu',
    clip: {
      src: '/clips/the-local-petaluma.mp4',
      poster: '/clips/the-local-petaluma-poster.webp',
      href: 'https://www.instagram.com/reel/DdXV9jQveok/',
      credit: 'Filmed by @thespoonlist',
      platform: 'Instagram',
      by: 'thespoonlist',
    },
  }),
  /* Mile Limit, "Berkeley • Goods" — Mediterranean small plates, a wine bar
     and a bottle shop on San Pablo Avenue, from the chefs behind La Marcha,
     on Berkeley's open Mediterranean seat. The film is their own post: "Please
     clip this video for that page. It is an ad placed by them." */
  seed('mile-limit-berkeley', 'Mile Limit', 'Mile Limit', 'Mediterranean wine bar', '#222222', {
    icon: 'mile-limit-berkeley',
    logoTemplate: 'wordmark', logoLines: ['MILE', 'LIMIT'], logoFace: 'condensed',
    site: 'https://www.milelimitberkeley.com/',
    siteCta: 'Order pickup',
    clip: {
      src: '/clips/mile-limit-berkeley.mp4',
      poster: '/clips/mile-limit-berkeley-poster.webp',
      href: 'https://www.instagram.com/p/DdSQMLZAXta/',
      credit: 'Their own film, @milelimit',
      platform: 'Instagram',
    },
  }),
  /* Dumont Creamery & Cafe, "Livermore • Goods" — ice cream, coffee and boba
     on Railroad Avenue, opened this month, on Livermore's open Ice cream seat.
     Dumont is a 16-shop brand and dumont.us has a page per shop, but not for
     Livermore, and it publishes no prices, so the page says so. */
  seed('dumont-livermore', 'Dumont Creamery & Cafe', 'Dumont', 'Ice cream, coffee & boba', '#194C49', {
    icon: 'dumont-livermore',
    logoTemplate: 'wordmark', logoLines: ['DUMONT'], logoFace: 'slab',
    site: 'https://dumont.us/',
    siteCta: 'See their site',
  }),

  /* ---- 2026-09-17 to 21. Research in research/roster/batch27.json. ---- */
  /* Real Cutie Pies, "Oakland • Goods" — dessert cups on 17th Street, on
     Oakland's open Bakery seat. The reel he sent straight after is their own
     post of KTVU's feature on them, so it plays here as their film. */
  seed('real-cutie-pies', 'Real Cutie Pies', 'Cutie Pies', 'Dessert cups', '#1F4E9A', {
    icon: 'real-cutie-pies',
    logoTemplate: 'wordmark', logoLines: ['CUTIE', 'PIES'], logoFace: 'script',
    site: 'https://realcutiepies.com/',
    siteCta: 'See their flavors',
    clip: {
      src: '/clips/real-cutie-pies.mp4',
      poster: '/clips/real-cutie-pies-poster.webp',
      href: 'https://www.instagram.com/reel/DU889WWkn8j/',
      credit: 'Their own post of KTVU FOX 2’s feature',
      platform: 'Instagram',
    },
  }),
  /* Kan Kiin, "Daly City • Goods" — Thai brunch and dinner on Southgate
     Avenue, on Daly City's open Asian food seat, with their whole brunch menu. */
  seed('kan-kiin', 'Kan Kiin', 'Kan Kiin', 'Thai brunch & dinner', '#1D3B2F', {
    /* Re-read 2026-10-05 for Glenn's "Clip this video plz for Kan Kin page":
       the full brunch and dinner menus, their Toast pickup, a sharper mark
       from their own site, and @foodieberrie's brunch reel. */
    icon: 'kan-kiin-2',
    logoTemplate: 'wordmark', logoLines: ['KAN', 'KIIN'], logoFace: 'condensed',
    site: 'https://www.kankiineatery.com/',
    siteCta: 'See their menus',
    orderUrl: 'https://order.toasttab.com/online/kankiineatery',
    clip: {
      src: '/clips/kan-kiin.mp4',
      poster: '/clips/kan-kiin-poster.webp',
      href: 'https://www.instagram.com/reel/DdfKJIgPDzm/',
      credit: 'Filmed by @foodieberrie',
      platform: 'Instagram',
      by: 'foodieberrie',
    },
  }),
  /* Lovely's Burgers, "Oakland • Goods / San Francisco • Goods" — two shops.
     San Francisco takes the open Burgers seat with the whole page; Oakland's
     Burgers seat is Cafe Noir's, so Oakland is a free listing on the yellow
     sheet. The reel he sent after it is Sam Smith's @samserved visiting the
     Cole Valley shop, so it plays as a review with his handle. READ-ONLY: their
     own menu says they cannot take to-go orders at peak hours. */
  seed('lovelys-burgers-sf', "Lovely's Burgers", "Lovely's", 'Burgers & dogs', '#C8321E', {
    icon: 'lovelys-burgers',
    logoTemplate: 'wordmark', logoLines: ["LOVELY'S"], logoFace: 'condensed',
    site: 'https://www.lovelysburgers.com/cole-valley',
    siteCta: 'See their hours',
    quoteOnly:
      'Order at the counter inside Woods Cole Valley. Their menu says they cannot take to-go orders at peak times, so this is their menu to read, not to order from.',
    clip: {
      src: '/clips/lovelys-burgers-sf.mp4',
      poster: '/clips/lovelys-burgers-sf-poster.webp',
      href: 'https://www.instagram.com/reel/DWCwnqWgQh9/',
      credit: 'Filmed by @samserved',
      platform: 'Instagram',
      by: 'samserved',
    },
  }),
  seed('lovelys-burgers-oakland', "Lovely's Burgers", "Lovely's", 'Burgers & dogs', '#C8321E', {
    icon: 'lovelys-burgers',
    logoTemplate: 'wordmark', logoLines: ["LOVELY'S"], logoFace: 'condensed',
    site: 'https://www.lovelysburgers.com/oakland',
    tier: 1,
  }),
  /* Whack Donuts, "San Francisco • Goods" — sent as a Linktree, whose main
     link is their own site, whackdonuts.net. San Francisco's open Donuts seat. */
  seed('whack-donuts', 'Whack Donuts!', 'Whack', 'Vegan donuts', '#D43F8D', {
    icon: 'whack-donuts',
    logoTemplate: 'wordmark', logoLines: ['WHACK', 'DONUTS'], logoFace: 'condensed',
    site: 'https://www.whackdonuts.net/',
    siteCta: 'Order from their site',
  }),
  /* Mochica, "San Francisco • Goods" — Peruvian has no seat, so the yellow sheet. */
  seed('mochica-sf', 'Mochica Kitchen & Bar', 'Mochica', 'Peruvian', '#5B2A1E', {
    icon: 'mochica-sf',
    logoTemplate: 'wordmark', logoLines: ['MOCHICA'], logoFace: 'slab',
    site: 'https://mochicasf.com/',
    tier: 1,
  }),
  /* Taqueria Azteca, "Dublin • Goods" — Dublin's open Mexican seat. Their site
     is a DoorDash-built page with an order button and nothing else. */
  seed('taqueria-azteca-dublin', 'Taqueria Azteca', 'Azteca', 'Mexican', '#D7261E', {
    icon: 'taqueria-azteca-dublin',
    logoTemplate: 'wordmark', logoLines: ['TAQUERIA', 'AZTECA'], logoFace: 'condensed',
    site: 'https://www.taqueriaazteca.com/',
  }),
  /* La Chicharronada Colombiana, "Oakland • Goods. Needs website and pilot
     program" — a Facebook profile is their only link. */
  seed('la-chicharronada-colombiana', 'La Chicharronada Colombiana', 'Chicharronada', 'Colombian', '#1C1C1C', {
    icon: 'la-chicharronada-colombiana',
    logoTemplate: 'monogram', logoInitials: 'LC', logoFace: 'condensed',
    tier: 1,
  }),
  /* Goldpie Pizza, "Richmond • Goods. New new. Needs website and pilot
     program" — Sunday and Monday pizza, pre-ordered by text; Richmond's open
     Italian seat. */
  seed('goldpie-pizza', 'Goldpie Pizza', 'Goldpie', 'Pizza', '#B3261E', {
    icon: 'goldpie-pizza',
    logoTemplate: 'wordmark', logoLines: ['GOLDPIE'], logoFace: 'script',
  }),
  /* Golden Gate Market & Deli, "San Francisco • Goods" — the Sandwiches seat
     is Deli Board's, so this is the yellow sheet, but with THE WHOLE PAGE: he
     asked "Can you please clip this video for their page?", and a free listing
     carries no film. The film is @thesnacksensei's. */
  seed('golden-gate-market-deli', 'Golden Gate Market & Deli', 'Golden Gate', 'Sandwiches & market', '#8E1B1B', {
    icon: 'golden-gate-market-deli',
    logoTemplate: 'wordmark', logoLines: ['GOLDEN', 'GATE'], logoFace: 'slab',
    site: 'https://goldengatemarketdeli.com/',
    siteCta: 'Order from their site',
    clip: {
      src: '/clips/golden-gate-market-deli.mp4',
      poster: '/clips/golden-gate-market-deli-poster.webp',
      href: 'https://www.instagram.com/reel/DX7W6WiIU8a/',
      credit: 'Filmed by @thesnacksensei',
      platform: 'Instagram',
      by: 'thesnacksensei',
    },
  }),
  /* Tada Ramen, "Oakland • Goods. Needs website update" — their domain has
     lapsed and serves a gambling site, so nothing links to it. Korean and
     ramen is Belly's seat; the yellow sheet. */
  seed('tada-ramen', 'Tada Ramen & Yakitori', 'Tada', 'Ramen & yakitori', '#141414', {
    icon: 'tada-ramen',
    logoTemplate: 'wordmark', logoLines: ['TADA'], logoFace: 'condensed',
    tier: 1,
  }),
  /* Bar Sprezzatura, "San Francisco • Goods" — Italian is Stella's seat. */
  seed('bar-sprezzatura', 'Bar Sprezzatura', 'Sprezzatura', 'Italian aperitivo bar', '#1F3A2B', {
    icon: 'bar-sprezzatura',
    logoTemplate: 'wordmark', logoLines: ['BAR', 'SPRZ'], logoFace: 'condensed',
    site: 'https://www.barsprezzatura.com/',
    tier: 1,
  }),
  /* Poor House Bistro, "San Jose • Goods. Needs website" — they have one, so
     it is a redesign pitch, not an outline. No New Orleans seat exists. */
  seed('poor-house-bistro', 'Poor House Bistro', 'Poor House', 'New Orleans cooking', '#1A1A1A', {
    icon: 'poor-house-bistro',
    logoTemplate: 'monogram', logoInitials: 'PHB', logoFace: 'slab',
    site: 'https://poorhousebistro.com/',
    tier: 1,
  }),
  /* Sakana Sushi & Roll, "Albany • Goods" — Albany's open Sushi seat, the menu
     from their own ordering portal (a stopgap, so the outline stays). */
  seed('sakana-sushi-albany', 'Sakana Sushi & Roll', 'Sakana', 'Sushi & rolls', '#D2542A', {
    icon: 'sakana-sushi',
    logoTemplate: 'wordmark', logoLines: ['SAKANA'], logoFace: 'slab',
    site: 'https://www.ordersakana.com/albany/order',
    siteCta: 'Order from their site',
  }),
  /* Pizza Gallery, "Emeryville • Goods" — Emeryville's open Italian seat, and
     the first page with the halal mark: "If we can add this icon onto Pizza
     galleries page and make this the standard for restaurants that serve
     Halal. Also make it searchable." */
  seed('pizza-gallery', 'Pizza Gallery', 'Pizza Gallery', 'Halal pizza & wings', '#C62828', {
    icon: 'pizza-gallery',
    logoTemplate: 'wordmark', logoLines: ['PIZZA', 'GALLERY'], logoFace: 'condensed',
    site: 'https://pizzagalleryca.com/',
    siteCta: 'Order from their site',
    dietary: ['Halal'],
  }),
  /* Napa Yard, "NAPA • Goods" — a beer garden on the river; Napa's open Burgers
     seat, since the Double Smashburger is theirs and no bar category exists. */
  seed('napa-yard', 'Napa Yard & Beer Garden', 'Napa Yard', 'Beer garden', '#2E3A2F', {
    icon: 'napa-yard',
    logoTemplate: 'wordmark', logoLines: ['NAPA', 'YARD'], logoFace: 'condensed',
    site: 'https://www.napayard.com/',
    siteCta: 'See their menus',
  }),
  /* Mimosas of Willow Glen, "San Jose • Goods" — brunch has no seat. */
  seed('mimosas-willow-glen', 'Mimosas of Willow Glen', 'Mimosas', 'Brunch', '#2B2B2B', {
    icon: 'mimosas-willow-glen',
    logoTemplate: 'wordmark', logoLines: ['MIMOSAS'], logoFace: 'script',
    site: 'https://mimosasofwillowglen.com/',
    tier: 1,
  }),
  /* Dreamland Art & Play, "Danville • Services" — a kids' play town and art
     studio; no tile fits, so the services yellow sheet. */
  seed('dreamland-art-play', 'Dreamland Art & Play', 'Dreamland', "Kids' play & art studio", '#3A3A3A', {
    icon: 'dreamland-art-play',
    logoTemplate: 'wordmark', logoLines: ['DREAMLAND'], logoFace: 'script',
    site: 'https://www.dreamlandartandplay.com/',
    tier: 1,
  }),
  /* Cajun Bowl, "San Bruno • Goods / San Mateo • Goods" — two shops; no
     seafood seat, so both yellow sheets. */
  seed('cajun-bowl-san-bruno', 'Cajun Bowl', 'Cajun Bowl', 'Cajun seafood', '#1B1B1B', {
    icon: 'cajun-bowl',
    logoTemplate: 'wordmark', logoLines: ['CAJUN', 'BOWL'], logoFace: 'script',
    site: 'https://www.cajunbowlcalifornia.com/',
    tier: 1,
  }),
  seed('cajun-bowl-san-mateo', 'Cajun Bowl', 'Cajun Bowl', 'Cajun seafood', '#1B1B1B', {
    icon: 'cajun-bowl',
    logoTemplate: 'wordmark', logoLines: ['CAJUN', 'BOWL'], logoFace: 'script',
    site: 'https://www.cajunbowlcalifornia.com/',
    tier: 1,
  }),
  /* Oke Poke, "Walnut Creek • Goods" — poke takes the Sushi seat, as Truffle
     Poke's did on the Peninsula. */
  seed('oke-poke-walnut-creek', 'Oke Poke Walnut Creek', 'Oke Poke', 'Poke', '#1C1C1C', {
    icon: 'oke-poke-walnut-creek',
    logoTemplate: 'wordmark', logoLines: ['OKE', 'POKE'], logoFace: 'condensed',
    site: 'https://www.okepoke.com/',
    siteCta: 'Order from their site',
  }),
  /* Sana'a Cafe, "San Rafael • Goods. Needs website and pilot program" —
     Yemeni coffee, San Rafael's open Coffee seat. Since then the chain has a
     site of its own, thesanaacafe.com, which lists this shop at the same
     address with its phone (2026-10-06); its hours there are one line for
     every shop, so the hours from their own profile stay. */
  seed('sanaa-cafe', "Sana'a Cafe", "Sana'a", 'Yemeni coffee', '#2A2016', {
    icon: 'sanaa-cafe',
    site: 'https://thesanaacafe.com/',
    phone: '(415) 295-7101',
    logoTemplate: 'wordmark', logoLines: ["SANA'A"], logoFace: 'slab',
  }),
  /* Pasta Pelican, "Alameda • Goods" — Alameda's open Italian seat, with
     their whole dining menu. */
  seed('pasta-pelican', 'Pasta Pelican', 'Pelican', 'Italian & American', '#13294B', {
    icon: 'pasta-pelican',
    logoTemplate: 'wordmark', logoLines: ['PASTA', 'PELICAN'], logoFace: 'script',
    site: 'https://www.pastapelican.com/',
    siteCta: 'Reserve or order',
  }),
  /* Alma Dessert, "Sunnyvale • Goods" — "Boba x Tiramisu", on Sunnyvale's
     open Boba seat. */
  seed('alma-dessert', 'Alma Dessert', 'Alma', 'Tiramisu & tea', '#D2693F', {
    icon: 'alma-dessert',
    logoTemplate: 'wordmark', logoLines: ['ALMA'], logoFace: 'script',
    site: 'https://www.almadessert.com/',
    siteCta: 'Order from their site',
  }),
  /* Brezo, "Albany • Goods" — Californian has no seat. */
  seed('brezo-albany', 'Brezo Restaurant', 'Brezo', 'Californian', '#111111', {
    icon: 'brezo-albany',
    logoTemplate: 'wordmark', logoLines: ['BREZO'], logoFace: 'script',
    site: 'https://www.brezorestaurant.com/',
    tier: 1,
  }),
  /* Tacos Walnut Creek, "Walnut Creek • Goods" — the open Mexican seat. */
  seed('tacos-walnut-creek', 'Tacos Walnut Creek', 'Tacos WC', 'Mexican', '#1B1B1B', {
    icon: 'tacos-walnut-creek',
    logoTemplate: 'wordmark', logoLines: ['TACOS', 'WC'], logoFace: 'condensed',
    site: 'https://tacoswalnutcreek.com/',
    siteCta: 'See their menu',
  }),
  /* Yummy Yummy Hibachi, "3 locations" — one page each, and the reel on every
     one: "Please clip this video for each of the locations pages." San
     Leandro takes the open Asian food seat; Oakland's is Cambodian Street
     Food's, so the two Oakland shops go on the yellow sheet with THE WHOLE
     PAGE, because a free listing carries no film. Their bio's website is dead. */
  seed('yummy-yummy-hibachi-san-leandro', 'Yummy Yummy Hibachi', 'Yummy', 'Hibachi', '#E4611B', {
    icon: 'yummy-yummy-hibachi',
    logoTemplate: 'wordmark', logoLines: ['YUMMY', 'YUMMY'], logoFace: 'condensed',
    clip: {
      src: '/clips/yummy-yummy-hibachi.mp4',
      poster: '/clips/yummy-yummy-hibachi-poster.webp',
      href: 'https://www.instagram.com/reel/DdeeVxNzQe4/',
      credit: 'Their own film, @yummy_yummyhibachi',
      platform: 'Instagram',
    },
  }),
  seed('yummy-yummy-hibachi-73rd', 'Yummy Yummy Hibachi', 'Yummy', 'Hibachi', '#E4611B', {
    icon: 'yummy-yummy-hibachi',
    logoTemplate: 'wordmark', logoLines: ['YUMMY', 'YUMMY'], logoFace: 'condensed',
    clip: {
      src: '/clips/yummy-yummy-hibachi.mp4',
      poster: '/clips/yummy-yummy-hibachi-poster.webp',
      href: 'https://www.instagram.com/reel/DdeeVxNzQe4/',
      credit: 'Their own film, @yummy_yummyhibachi',
      platform: 'Instagram',
    },
  }),
  seed('yummy-yummy-hibachi-piedmont', 'Yummy Yummy Hibachi', 'Yummy', 'Hibachi', '#E4611B', {
    icon: 'yummy-yummy-hibachi',
    logoTemplate: 'wordmark', logoLines: ['YUMMY', 'YUMMY'], logoFace: 'condensed',
    clip: {
      src: '/clips/yummy-yummy-hibachi.mp4',
      poster: '/clips/yummy-yummy-hibachi-poster.webp',
      href: 'https://www.instagram.com/reel/DdeeVxNzQe4/',
      credit: 'Their own film, @yummy_yummyhibachi',
      platform: 'Instagram',
    },
  }),
  /* Toast In Town, "Foster City • Goods. Can you isolate just the toast/bread
     for the icon logo?" — the icon is the loaf alone. Brunch has no seat. */
  seed('toast-in-town', 'Toast In Town', 'Toast', 'Brunch', '#5B2F1F', {
    icon: 'toast-in-town',
    logoTemplate: 'wordmark', logoLines: ['TOAST'], logoFace: 'slab',
    site: 'https://toastintown.com/',
    tier: 1,
  }),
  /* BARREbeat, "Antioch • Goods" — a fitness studio, so Antioch's open Gym
     seat on the services page, the label corrected rather than followed. */
  seed('barre-beat', 'BARREbeat Fitness', 'BARREbeat', 'Barre & dance fitness', '#6B3FA0', {
    icon: 'barre-beat',
    logoTemplate: 'wordmark', logoLines: ['BARRE', 'BEAT'], logoFace: 'condensed',
    site: 'https://barre-beat.com/',
    siteCta: 'Book a class',
  }),
  /* Nosso, "Oakland • Goods" — sent with the Barre Beat link pasted again; the
     screenshots are all Nosso's. A lounge; the yellow sheet. */
  seed('nosso-oakland', 'Nosso', 'Nosso', 'Lounge & bites', '#1E1E1E', {
    icon: 'nosso-oakland',
    logoTemplate: 'wordmark', logoLines: ['NOSSO'], logoFace: 'script',
    site: 'https://nossooakland.com/',
    /* @festusfeasts on Nosso, sent 2026-10-02 with "Clip this video plz / For that page", minutes before "Bump Nossa onto BEASTY • Eats page". 40s-64s of 104s. */
    clip: {
      src: '/clips/nosso-oakland.mp4',
      poster: '/clips/nosso-oakland-poster.webp',
      href: 'https://www.instagram.com/reel/Ddh94RIgaxM/',
      credit: 'Filmed by @festusfeasts',
      platform: 'Instagram',
      by: 'festusfeasts',
    },
    /* Was a free Tier 1 listing on Oakland's yellow sheet; on BEASTY • Eats
       since 2026-10-05, where a spot is the whole page. */
  }),
  /* El Portal, "San Leandro • Goods" — the open Mexican seat, their own menu. */
  seed('el-portal-san-leandro', 'El Portal Mexican Restaurant', 'El Portal', 'Mexican & seafood', '#8A4A1E', {
    icon: 'el-portal-san-leandro',
    logoTemplate: 'wordmark', logoLines: ['EL', 'PORTAL'], logoFace: 'script',
    site: 'https://www.elportalrest.com/',
    siteCta: 'See their menu',
  }),
  /* Kitava, "Goods, 4 locations" — gluten-free, which has no seat, so four
     yellow-sheet listings: San Francisco, Oakland, Albany, Walnut Creek. */
  seed('kitava-sf', 'Kitava', 'Kitava', 'Gluten-free kitchen', '#5E8C31', {
    icon: 'kitava',
    logoTemplate: 'wordmark', logoLines: ['KITAVA'], logoFace: 'slab',
    site: 'https://www.kitava.com/store-locator/',
    tier: 1,
  }),
  seed('kitava-oakland', 'Kitava', 'Kitava', 'Gluten-free kitchen', '#5E8C31', {
    icon: 'kitava',
    logoTemplate: 'wordmark', logoLines: ['KITAVA'], logoFace: 'slab',
    site: 'https://www.kitava.com/store-locator/',
    tier: 1,
  }),
  seed('kitava-albany', 'Kitava', 'Kitava', 'Gluten-free kitchen', '#5E8C31', {
    icon: 'kitava',
    logoTemplate: 'wordmark', logoLines: ['KITAVA'], logoFace: 'slab',
    site: 'https://www.kitava.com/store-locator/',
    tier: 1,
  }),
  seed('kitava-walnut-creek', 'Kitava', 'Kitava', 'Gluten-free kitchen', '#5E8C31', {
    icon: 'kitava',
    logoTemplate: 'wordmark', logoLines: ['KITAVA'], logoFace: 'slab',
    site: 'https://www.kitava.com/store-locator/',
    tier: 1,
  }),
  /* Between The Plants, "Union City • Services. They have an app to download
     to book." — reformer Pilates, Union City's open Gym seat. */
  seed('between-the-plants', 'Between The Plants', 'Between', 'Reformer Pilates', '#1F5A3D', {
    icon: 'between-the-plants',
    logoTemplate: 'wordmark', logoLines: ['BETWEEN', 'THE PLANTS'], logoFace: 'script',
    site: 'https://www.betweentheplants.com/',
    siteCta: 'See their plans',
  }),
  /* PAMPAS, "Vacaville • Goods" — a Brazilian steakhouse; no seat fits. */
  seed('pampas-vacaville', 'PAMPAS Brazilian Steakhouse', 'Pampas', 'Brazilian steakhouse', '#4A1E1E', {
    icon: 'pampas-vacaville',
    logoTemplate: 'wordmark', logoLines: ['PAMPAS'], logoFace: 'slab',
    site: 'https://www.pampasbraziliansteakhouse.com/',
    tier: 1,
  }),
  /* Essence Jiu Jitsu, "Walnut Creek • Services" — the Gym seat is TruFusion's. */
  seed('essence-bjj', 'Essence Jiu Jitsu', 'Essence', 'Brazilian jiu-jitsu', '#1A1A1A', {
    icon: 'essence-bjj',
    logoTemplate: 'wordmark', logoLines: ['ESSENCE'], logoFace: 'condensed',
    site: 'https://essencebjjwalnutcreek.com/',
    tier: 1,
  }),
  /* Drip Dessert House, "Newark • Goods" — Newark's open Bakery seat; a Square
     store is their only site, so the outline stays. */
  seed('drip-dessert-house', 'Drip Dessert House', 'Drip', 'Dessert house', '#4A2C1D', {
    icon: 'drip-dessert-house',
    logoTemplate: 'wordmark', logoLines: ['DRIP'], logoFace: 'condensed',
    site: 'https://dripdesserthouse.square.site/',
    siteCta: 'Order from their store',
  }),
  /* Regent Thai Massage, "San Francisco • Services" — the open Massage seat. */
  seed('regent-thai-massage', 'Regent Thai Massage', 'Regent', 'Thai massage', '#0E1B33', {
    icon: 'regent-thai-massage',
    logoTemplate: 'wordmark', logoLines: ['REGENT'], logoFace: 'script',
    site: 'https://www.regentthaimassage.com/',
    siteCta: 'Book a massage',
  }),
  /* The Holbrook House, "San Francisco • Goods" — a bar; no seat fits. */
  seed('holbrook-house', 'The Holbrook House', 'Holbrook', 'Bar & restaurant', '#141414', {
    icon: 'holbrook-house',
    logoTemplate: 'wordmark', logoLines: ['HOLBROOK'], logoFace: 'slab',
    site: 'https://www.holbrookhousesf.com/',
    tier: 1,
  }),
  /* Seoul to Tokyo Kitchen, "Santa Rosa • Goods" — the open Korean seat. */
  seed('seoul-to-tokyo-kitchen', 'Seoul to Tokyo Kitchen', 'Seoul Tokyo', 'Korean & Japanese', '#2B2B2B', {
    icon: 'seoul-to-tokyo-kitchen',
    logoTemplate: 'wordmark', logoLines: ['SEOUL', 'TOKYO'], logoFace: 'condensed',
    site: 'https://seoultotokyokitchen.com/',
    siteCta: 'See their menu',
  }),
  /* Bust Down & Co., "San Jose • Services / BEASTY • Services. Please put a
     glow on the BEASTY spot. This is Janelle's family." Two seeds because the
     two seats differ: the San Jose listing is free and plain, the BEASTY page
     is whole and glows. */
  seed('bust-down-co', 'Bust Down & Co.', 'Bust Down', 'Custom jewelry & watches', '#111111', {
    icon: 'bust-down-co',
    logoTemplate: 'wordmark', logoLines: ['BUST', 'DOWN'], logoFace: 'condensed',
    site: 'https://bustdownandco.com/',
    tier: 1,
  }),
  seed('bust-down-co-beasty', 'Bust Down & Co.', 'Bust Down', 'Custom jewelry & watches', '#111111', {
    glow: true,
    icon: 'bust-down-co',
    logoTemplate: 'wordmark', logoLines: ['BUST', 'DOWN'], logoFace: 'condensed',
    site: 'https://bustdownandco.com/',
    siteCta: 'Shop their store',
  }),
  /* The BeauDega by Maine, Janelle's sister, who asked for a spot through the
     Reserve a Spot form on 2026-09-22. Glenn: "BEASTY • Services" / "Needs
     website pilot program", "Can you give her icon that glow thing like on
     the scan button?" and "You can bump Roman Iron to the yellow pages for
     her". So: BEASTY • Services #2, the Scan button's light sweep across her
     logo (glow: 'sweep', not the paid halo), and the red outline, because she
     has no website yet. Facts from her request and her own Instagram bio. */
  seed('the-beaudega-by-maine', 'The BeauDega by Maine', 'BeauDega', 'Makeup and permanent makeup', '#0A1433', {
    glow: 'sweep',
    needsSite: true,
    /* Her own slogan, from her logo. */
    tagline: 'Your beauty. Your bodega.',
    /* Glenn, 10:16 pm the same night: "Can you add her ig plz Janelle
       asked", with the link. His word, which the Instagram button waits for. */
    instagram: 'thebeaudegabymaine',
    icon: 'the-beaudega-by-maine',
    logoTemplate: 'wordmark', logoLines: ['BEAU', 'DEGA'], logoFace: 'condensed',
  }),
  /* Jazz Braids, from Janelle's circle. "Newark • Services / BEASTY • Services.
     Needs website. This is Janelle folks. Can you put a glow around her icon?
     Can you make it a pink glow?" Not Janelle herself — her own page is Nana
     Casas on BEASTY • Individuals, and this braider's number, (510) 894-3975,
     is not hers. Newark's open Barber and salon seat and a first-page seat,
     the pink glow on both, and the braider's own post of Ludacris's birthday
     braids as the film: "Can you also clip this video and add it to her page." */
  seed('jazz-braids', 'Jazz Braids', 'Jazz Braids', 'Braids, salon services', '#4A2A1E', {
    glow: 'pink',
    icon: 'jazz-braids',
    logoTemplate: 'wordmark', logoLines: ['JAZZ', 'BRAIDS'], logoFace: 'script',
    site: 'https://www.styleseat.com/m/v/jazzbraidsstyles',
    siteCta: 'Book on StyleSeat',
    clip: {
      src: '/clips/jazz-braids.mp4',
      poster: '/clips/jazz-braids-poster.webp',
      href: 'https://www.instagram.com/reel/Cw6TATXPOkB/',
      credit: 'Her own post, @jazz_braids_styles',
      platform: 'Instagram',
    },
  }),
  /* Caballeros BarberLounge, "Concord • Services" — the open Barber seat. */
  seed('caballeros-barber-lounge', 'Caballeros BarberLounge', 'Caballeros', 'Barber', '#1A1A1A', {
    icon: 'caballeros-barber-lounge',
    logoTemplate: 'wordmark', logoLines: ['CABALLEROS'], logoFace: 'script',
    site: 'https://www.caballerosbarberlounge.com/',
    siteCta: 'Book a cut',
  }),
  /* MOA Events & Rentals, "Antioch • Services. Needs Website. Pilot program" —
     they have a working site with a booking cart, so no outline; Antioch's
     open Events seat. */
  seed('moa-events-rentals', 'MOA Events & Rentals', 'MOA', 'Mobile party rentals', '#1A9E9E', {
    icon: 'moa-events-rentals',
    logoTemplate: 'wordmark', logoLines: ['MOA'], logoFace: 'condensed',
    site: 'https://rentbouncebayarea.com/',
    siteCta: 'Book a rental',
  }),
  /* HL Peninsula, "Five locations" — one page each. The Asian food seat is open
     in South San Francisco, Burlingame and Castro Valley; Milpitas's is taken,
     and Burlingame's second restaurant goes on its yellow sheet. */
  seed('hl-peninsula-south-sf', 'HL Peninsula Restaurant', 'HL Peninsula', 'Cantonese dim sum', '#1E3A8A', {
    icon: 'hl-peninsula',
    logoTemplate: 'monogram', logoInitials: 'HL', logoFace: 'slab',
    site: 'https://www.hlpeninsula.com/locations',
    siteCta: 'See their menus',
  }),
  seed('hl-peninsula-pearl', 'HL Peninsula Pearl', 'HL Pearl', 'Cantonese dim sum', '#1E3A8A', {
    icon: 'hl-peninsula',
    logoTemplate: 'monogram', logoInitials: 'HL', logoFace: 'slab',
    site: 'https://www.hlpeninsula.com/locations',
    siteCta: 'See their menus',
  }),
  seed('hl-peninsula-castro-valley', 'HL Peninsula Restaurant', 'HL Peninsula', 'Cantonese dim sum', '#1E3A8A', {
    icon: 'hl-peninsula',
    logoTemplate: 'monogram', logoInitials: 'HL', logoFace: 'slab',
    site: 'https://www.hlpeninsula.com/locations',
    siteCta: 'See their menus',
  }),
  seed('hl-peninsula-garden', 'HL Peninsula Garden', 'HL Garden', 'Cantonese dim sum', '#1E3A8A', {
    icon: 'hl-peninsula',
    logoTemplate: 'monogram', logoInitials: 'HL', logoFace: 'slab',
    site: 'https://www.hlpeninsula.com/locations',
    tier: 1,
  }),
  seed('hl-peninsula-milpitas', 'HL Peninsula Restaurant', 'HL Peninsula', 'Cantonese dim sum', '#1E3A8A', {
    icon: 'hl-peninsula',
    logoTemplate: 'monogram', logoInitials: 'HL', logoFace: 'slab',
    site: 'https://www.hlpeninsula.com/locations',
    tier: 1,
  }),
  /* The Halal Cartel, "Santa Clara • Goods. Halal" — Santa Clara's open
     Mediterranean seat, with the halal mark on their own word. */
  seed('the-halal-cartel', 'The Halal Cartel', 'Halal Cartel', 'Halal street food', '#1E1612', {
    icon: 'the-halal-cartel',
    logoTemplate: 'wordmark', logoLines: ['HALAL', 'CARTEL'], logoFace: 'condensed',
    dietary: ['Halal'],
  }),
  /* The Cozy Oven, "Antioch • Goods. New new. Needs Website and pilot
     program" — cakes to order; the Bakery seat is Butter Pecan's. */
  seed('the-cozy-oven', 'The Cozy Oven', 'Cozy Oven', 'Custom cakes', '#E88BA5', {
    icon: 'the-cozy-oven',
    logoTemplate: 'wordmark', logoLines: ['COZY', 'OVEN'], logoFace: 'script',
    tier: 1,
  }),
  /* 2026-09-21, evening. Penelope's Coffee & Tea, "Berkeley • Goods (5
     locations)": five shops, each on its own city's Coffee shop seat. Berkeley,
     Foster City, San Mateo and Daly City were open; San Francisco's is The
     Farmacy's, so that shop is a free listing on the yellow sheet. One menu for
     all five, the PDF their own site links. */
  seed('penelopes-coffee-berkeley', "Penelope's Coffee & Tea", "Penelope's", 'Coffee & tea', '#5A3825', {
    icon: 'penelopes-coffee',
    logoTemplate: 'wordmark', logoLines: ["PENELOPE'S"], logoFace: 'script',
    site: 'https://penelopescoffee.com/',
    siteCta: 'Order from their site',
  }),
  seed('penelopes-coffee-sf', "Penelope's Coffee & Tea", "Penelope's", 'Coffee & tea', '#5A3825', {
    icon: 'penelopes-coffee',
    logoTemplate: 'wordmark', logoLines: ["PENELOPE'S"], logoFace: 'script',
    site: 'https://penelopescoffee.com/',
    tier: 1,
  }),
  seed('penelopes-coffee-foster-city', "Penelope's Coffee & Tea", "Penelope's", 'Coffee & tea', '#5A3825', {
    icon: 'penelopes-coffee',
    logoTemplate: 'wordmark', logoLines: ["PENELOPE'S"], logoFace: 'script',
    site: 'https://penelopescoffee.com/',
    siteCta: 'Order from their site',
  }),
  seed('penelopes-coffee-san-mateo', "Penelope's Coffee & Tea", "Penelope's", 'Coffee & tea', '#5A3825', {
    icon: 'penelopes-coffee',
    logoTemplate: 'wordmark', logoLines: ["PENELOPE'S"], logoFace: 'script',
    site: 'https://penelopescoffee.com/',
    siteCta: 'Order from their site',
  }),
  seed('penelopes-coffee-daly-city', "Penelope's Coffee & Tea", "Penelope's", 'Coffee & tea', '#5A3825', {
    icon: 'penelopes-coffee',
    logoTemplate: 'wordmark', logoLines: ["PENELOPE'S"], logoFace: 'script',
    site: 'https://penelopescoffee.com/',
    siteCta: 'Order from their site',
  }),
  /* Catch SF, "San Francisco • Goods". Seafood has no seat, so the yellow
     sheet, with its menu ready behind the free-listing rule. */
  seed('catch-sf', 'Catch SF', 'Catch', 'Seafood & cocktails', '#02425B', {
    icon: 'catch-sf',
    logoTemplate: 'wordmark', logoLines: ['CATCH'], logoFace: 'slab',
    site: 'https://catchseafoodsf.com/',
    tier: 1,
  }),
  /* Brasil Bistro, "El Cerrito • Goods". Brazilian has no seat either: the
     yellow sheet, the menu from their own ordering site ready behind the rule. */
  /* Yank Sing, "San Francisco • Goods" (Glenn, 2026-09-24 7:46 am). Asian
     food is House of Thai's seat, so the yellow sheet, but the whole page
     rather than the free listing: he sent Sherry Shi's reel with it, "Can we
     use this link for their page?", and only a whole page shows a reel. The
     menu is their own takeout ordering; only the Stevenson Street restaurant,
     since their Rincon Center lease has ended. Their seal, in their red. */
  seed('yank-sing', 'Yank Sing', 'Yank Sing', 'Dim sum', '#EA1E28', {
    icon: 'yank-sing',
    logoTemplate: 'wordmark', logoLines: ['YANK SING'], logoFace: 'slab',
    tagline: "San Francisco's contemporary & traditional dim sum",
    site: 'https://yanksing.com/',
    orderUrl: 'https://order.toasttab.com/online/yank-sing-stevenson-49-stevenson-st',
    /* @sherryeatworld's review, which Glenn sent for this page; downloaded
       the same day on Leon's "DOWNLOAD ALL". 0s-24s of 33s: her "San
       Francisco's most iconic dim sum spot" title, the room, the carts and
       the dim sum. A food creator's film, not the restaurant's, credited to her. */
    clip: {
      src: '/clips/yank-sing.mp4',
      poster: '/clips/yank-sing-poster.webp',
      href: 'https://www.instagram.com/reel/DdqF3P3P67w/',
      credit: 'Filmed by @sherryeatworld',
      platform: 'Instagram',
      by: 'sherryeatworld',
    },
  }),
  /* Demitri's Taverna, Glenn's link of 2026-09-24, 7:14 pm (no page named;
     Livermore is their one location). Livermore's Mediterranean seat was open:
     the whole page. Their laurel-wreath D from their own site, in its maroon.
     Their site sits behind a Cloudflare check that turns away scripts; it was
     read in a normal browser, where it opened with no challenge. */
  seed('demitris-taverna', "Demitri's Taverna", "Demitri's", 'Greek & Mediterranean', '#8A2E1B', {
    icon: 'demitris-taverna-mark',
    logoTemplate: 'wordmark', logoLines: ["DEMITRI'S"], logoFace: 'slab',
    tagline: 'Family-owned Greek taverna in Downtown Livermore since 2008',
    site: 'https://demitristavernalivermore.com/',
    orderUrl: 'https://demitristavernalivermore.com/menu',
  }),
  /* Cherie's Southern Kitchen, "Dublin • Goods" (Glenn, 2026-09-24,
     9:52 pm). Soul food has no seat; their menu has wings beside the fried
     chicken and Dublin's Chicken wings seat was open, so the whole page there.
     Their own logo, the masked face over "Chérie's". */
  seed('cheries-southern-kitchen', "Cherie's Southern Kitchen", "Chérie's", 'Soul food', '#4A2459', {
    icon: 'cheries-southern-kitchen',
    logoTemplate: 'wordmark', logoLines: ["CHÉRIE'S"], logoFace: 'script',
    tagline: 'Bringing southern charm to the West Coast',
    site: 'https://cheriesouthernkitchen.com/',
  }),
  /* Glenn's links of 25 to 27 September 2026, researched from their own sites and
     ordering pages (research/roster/batch36.json has every call made). */
  /* Woof Gang Bakery & Grooming, "Oakley • Services": the Grooming seat. */
  seed('woof-gang-bakery-oakley', 'Woof Gang Bakery & Grooming', 'Woof Gang', 'Dog grooming & pet supplies', '#6B3A1E', {
    icon: 'woof-gang-bakery',
    logoTemplate: 'wordmark', logoLines: ['WOOF GANG'], logoFace: 'slab',
    site: 'https://shop.woofgangbakery.com/206703/booking',
    siteCta: 'Book a groom',
    tagline: 'Full-service grooming and pet treats in Oakley',
  }),
  /* Old Crow Tattoo, "Berkeley • Services": the Tattoo seat, on Telegraph since the move from Oakland. */
  seed('old-crow-tattoo', 'Old Crow Tattoo', 'Old Crow', 'Tattoo studio', '#141414', {
    icon: 'old-crow-tattoo',
    logoTemplate: 'wordmark', logoLines: ['OLD CROW'], logoFace: 'slab',
    site: 'https://www.oldcrowtattoo.com/',
    tagline: 'Ornamental, blackwork, fine-line and custom tattooing since 2008',
  }),
  /* Rakani Tattoo, "San Francisco • Services": the Tattoo seat. By appointment; no street address. */
  seed('rakani-tattoo', 'Rakani Tattoo', 'Rakani', 'Tattoo artist', '#0B0907', {
    icon: 'rakani-tattoo',
    logoTemplate: 'wordmark', logoLines: ['RAKANI'], logoFace: 'grotesk',
    site: 'https://rakanitattoo.com/',
    siteCta: 'Book a consultation',
    tagline: 'Cover-ups, scar and burn camouflage, by Karyna Pulcho',
  }),
  /* Hungry Cow, "Fremont • Goods", where Glenn, Janelle and Leon met: the Korean seat. */
  seed('hungry-cow', 'Hungry Cow', 'Hungry Cow', 'Korean BBQ', '#121212', {
    icon: 'hungry-cow',
    logoTemplate: 'wordmark', logoLines: ['HUNGRY COW'], logoFace: 'slab',
    site: 'https://www.myhungrycow.com/',
    tagline: 'Korean BBQ and shabu shabu on Albrae Street',
    /* "Clip this video plz / For Hungry cow", 2026-10-02: Grand-O's Top Five Korean BBQ spots; 51s-75s of 155s. */
    clip: {
      src: '/clips/hungry-cow.mp4',
      poster: '/clips/hungry-cow-poster.webp',
      href: 'https://www.instagram.com/reel/DSEaJrgkZe6/',
      credit: 'Filmed by @thesnacksensei',
      platform: 'Instagram',
      by: 'thesnacksensei',
    },
  }),
  /* Long Bridge Pizza Co., "San Francisco • Goods": Italian is Stella Pastry's, so the yellow sheet. */
  seed('long-bridge-pizza', 'Long Bridge Pizza Co.', 'Long Bridge', 'Sourdough pizza', '#EF5623', {
    icon: 'long-bridge-pizza',
    logoTemplate: 'wordmark', logoLines: ['LONG BRIDGE'], logoFace: 'slab',
    site: 'https://www.longbridgepizza.com/',
    orderUrl: 'https://order.toasttab.com/online/long-bridge-pizza-2347-3rd-st',
    tier: 1,
  }),
  /* Maverick Jack's, "Burlingame • Goods / San Mateo • Goods": each shop on its city's Burgers seat, with its own prices. */
  seed('maverick-jacks-burlingame', "Maverick Jack's", "Maverick Jack's", 'Burgers & shakes', '#141414', {
    icon: 'maverick-jacks',
    logoTemplate: 'wordmark', logoLines: ['MAVERICK', "JACK'S"], logoFace: 'grotesk',
    site: 'https://maverickjacks.com/',
    orderUrl: 'https://maverickjacks.com/order/maverick-jacks-burlingame-1190-california-drive',
  }),
  seed('maverick-jacks-san-mateo', "Maverick Jack's", "Maverick Jack's", 'Burgers & shakes', '#141414', {
    icon: 'maverick-jacks',
    logoTemplate: 'wordmark', logoLines: ['MAVERICK', "JACK'S"], logoFace: 'grotesk',
    site: 'https://maverickjacks.com/',
    orderUrl: 'https://maverickjacks.com/order/maverickjacks-san-mateo',
  }),
  /* Taqueria Los Agaves, "Daly City • Goods": the Mexican seat. */
  seed('los-agaves-daly-city', 'Taqueria Los Agaves', 'Los Agaves', 'Mexican', '#1F7FC4', {
    icon: 'los-agaves-taqueria',
    logoTemplate: 'wordmark', logoLines: ['LOS AGAVES'], logoFace: 'script',
    site: 'https://www.losagavesdalycity.com/',
    orderUrl: 'https://www.toasttab.com/local/order/taqueria-los-agaves-2408-b-junipero-serra-boulevard',
  }),
  /* Alushe Coffee Bar, "San Francisco • Goods": Coffee is The Farmacy's, so the yellow sheet. */
  seed('alushe-coffee', 'Alushe Coffee Bar', 'Alushe', 'Coffee & tamales', '#141414', {
    icon: 'alushe-coffee',
    logoTemplate: 'wordmark', logoLines: ['ALUSHE'], logoFace: 'slab',
    site: 'https://alushecoffee.com/',
    orderUrl: 'https://order.toasttab.com/online/alushe-coffee-bar-em-4201-geary-boulevard',
    tier: 1,
  }),
  /* Four Chairs, "San Francisco • Goods": no brunch seat, so the yellow sheet. */
  seed('four-chairs', 'Four Chairs', 'Four Chairs', 'Breakfast & brunch', '#9A7B36', {
    icon: 'four-chairs',
    logoTemplate: 'wordmark', logoLines: ['FOUR CHAIRS'], logoFace: 'grotesk',
    site: 'https://www.fourchairssf.com/',
    tier: 1,
  }),
  /* Napa Valley Burger Company, "Sausalito • Goods": the Burgers seat. */
  seed('napa-valley-burger-sausalito', 'Napa Valley Burger Company', 'Napa Valley Burger', 'Burgers', '#5A4A2C', {
    icon: 'napa-valley-burger',
    logoTemplate: 'wordmark', logoLines: ['NAPA VALLEY', 'BURGER'], logoFace: 'slab',
    site: 'https://www.napavalleyburgercompany.com/',
  }),
  /* NAR Restaurant, "Mountain View • Goods": South Caucasus cooking on the Mediterranean seat. */
  seed('nar-restaurant', 'NAR Restaurant', 'NAR', 'Azerbaijani', '#9C1B24', {
    icon: 'nar-restaurant',
    logoTemplate: 'wordmark', logoLines: ['NAR'], logoFace: 'slab',
    site: 'https://narfood.com/',
    orderUrl: 'https://pos.chowbus.com/online-ordering/store/NAR-Restaurant/22992',
  }),
  /* 2026-09-27, 5:24 pm, to 28 September, 5:59 am: Glenn's links and screenshots
     (research/roster/batch37.json has every call made). Tattoo seats were open in
     Walnut Creek, Richmond and Livermore; the rest are free listings on their
     cities' yellow sheets because the seat they would take is someone's. */
  /* Peaches Patties, "San Francisco • Goods": no Caribbean seat, so the yellow sheet. */
  seed('peaches-patties', 'Peaches Patties', 'Peaches Patties', 'Jamaican patties', '#E8962E', {
    icon: 'peaches-patties',
    logoTemplate: 'wordmark', logoLines: ['PEACHES', 'PATTIES'], logoFace: 'script',
    site: 'https://www.peachespatties.com/',
    orderUrl: 'https://www.peachespatties.com/catering-store-v2/',
    tier: 1,
  }),
  /* Shish Grill, "San Ramon • Goods": Mediterranean is Alora Social's, so the yellow sheet. Halal, by the logo on their own site. */
  seed('the-shish-grill', 'Shish Grill', 'Shish Grill', 'Lebanese', '#C4401F', {
    icon: 'shish-grill',
    logoTemplate: 'wordmark', logoLines: ['SHISH', 'GRILL'], logoFace: 'slab',
    site: 'https://theshishgrill.com/',
    orderUrl: 'https://order.toasttab.com/online/shishgrill',
    dietary: ['Halal'],
    tier: 1,
  }),
  /* Sandbar Oakland, "Oakland • Goods / Needs website pilot program": the yellow
     sheet, no link (their old site errors on every page), and the red ring. */
  seed('sandbar-oakland', 'Sandbar Oakland', 'Sandbar', 'Caribbean beach club', '#1B8FA6', {
    needsSite: true,
    icon: 'sandbar-oakland',
    logoTemplate: 'wordmark', logoLines: ['SANDBAR'], logoFace: 'grotesk',
    tier: 1,
  }),
  /* Matt Ahn at Golden Star Tattoo, "San Francisco • Services": "Put Matt Ahn as
     the owner of this page. He just works out of that tattoo parlor." His page,
     the shop's logo, address and number. Tattoo is Rakani's, so the yellow sheet. */
  seed('matt-ahn', 'Matt Ahn', 'Matt Ahn', 'Tattoo artist', '#1B1B19', {
    icon: 'golden-star-tattoo',
    logoTemplate: 'monogram', logoInitials: 'MA', logoFace: 'slab',
    site: 'https://www.goldenstartattoosf.com/matt-ahn',
    tier: 1,
  }),
  /* Ink From Tatooine, "Walnut Creek • Goods / Needs website pilot program": a
     tattoo artist, so Walnut Creek's open Tattoo seat on Services, whole page. */
  seed('ink-from-tatooine', 'Ink From Tatooine', 'Ink From Tatooine', 'Fine-line tattoo artist', '#0A0A0A', {
    needsSite: true,
    icon: 'ink-from-tatooine',
    logoTemplate: 'wordmark', logoLines: ['INK FROM', 'TATOOINE'], logoFace: 'condensed',
    tagline: 'Botanical and fine-line tattooing in Walnut Creek',
    email: 'inkfromtatooine@gmail.com',
    address: 'Walnut Creek, CA',
    contactOnly:
      'Botanical and fine-line tattooing, as resident artist at The Last Dodo Studio in Walnut Creek. No prices are published: they book by Instagram message, or email them to ask about a piece.',
  }),
  /* Paul Domingo, "Richmond • Services / Needs website and logo/branding. Make
     page for that artist": Richmond's open Tattoo seat, whole page, his initials
     until he has a mark. */
  seed('paul-domingo', 'Paul Domingo', 'Paul Domingo', 'Black & grey tattoo', '#111111', {
    needsSite: true,
    /* "Can you also add this Instagram to this person's page?", 2026-09-30,
       11:28 am, with a post of his: Glenn's say-so for the button. */
    instagram: 'peezycasso',
    logoTemplate: 'monogram', logoInitials: 'PD', logoFace: 'slab',
    tagline: 'Black and grey tattooing at True Line Tattoo',
  }),
  /* 2$CWBY Tattoo, "Livermore • Services / Needs website pilot program and logo
     branding / Two Dollar cowboy", and at 8:34 pm "Found this": his poster.
     Livermore's open Tattoo seat, whole page; his booking form is the button. */
  seed('two-dollar-cowboy', '2$CWBY Tattoo', '2$CWBY', 'Traditional tattoo', '#111111', {
    needsSite: true,
    icon: 'two-dollar-cowboy',
    logoTemplate: 'wordmark', logoLines: ['2$CWBY'], logoFace: 'condensed',
    site: 'https://forms.gle/M8jJ2BFjJ9zkaqwH9',
    siteCta: 'Request a tattoo',
    tagline: 'Two Dollar Cowboy: traditional, Japanese, black and grey',
  }),
  /* Aberration Studio, "San Francisco • Services": Photo and video is iSnapped's, so the yellow sheet. */
  seed('aberration-studio', 'Aberration Studio', 'Aberration', 'Wedding photo & video studio', '#111111', {
    icon: 'aberration-studio',
    logoTemplate: 'monogram', logoInitials: 'A', logoFace: 'grotesk',
    site: 'https://www.aberration.studio/wedding.html',
    tier: 1,
  }),
  /* Impower Sports Performance & Rehab, "Walnut Creek • Services": a sports chiropractor; the yellow sheet. */
  seed('impower-sports-performance', 'Impower Sports Performance & Rehab', 'Impower', 'Sports chiropractic & rehab', '#111111', {
    icon: 'impower-sports',
    logoTemplate: 'wordmark', logoLines: ['IMPOWER'], logoFace: 'grotesk',
    site: 'https://impowersportsperformance.com/',
    tier: 1,
  }),
  /* The Nail Edit Studio, "Walnut Creek • Services": Nails is Varnish's, so the yellow sheet. */
  seed('nail-edit-studio', 'The Nail Edit Studio', 'The Nail Edit', 'Russian manicure & pedicure studio', '#141414', {
    icon: 'nail-edit-studio',
    logoTemplate: 'wordmark', logoLines: ['THE NAIL', 'EDIT'], logoFace: 'script',
    site: 'https://naileditstud.io/',
    tier: 1,
  }),
  /* CoreNest Pilates, "Concord • Services": opens 5 October; Gym is Urban Air's, so the yellow sheet. */
  seed('corenest-pilates', 'CoreNest Pilates', 'CoreNest', 'Pilates & yoga studio', '#6E8F9C', {
    icon: 'corenest-pilates',
    logoTemplate: 'wordmark', logoLines: ['CORENEST'], logoFace: 'grotesk',
    site: 'https://pilatescorenest.com/',
    tier: 1,
  }),
  /* Contra Costa Fitness, "Concord • Services / Ideal for a Collab shoot": the yellow sheet behind Urban Air. */
  seed('contra-costa-fitness', 'Contra Costa Fitness', 'Contra Costa Fitness', 'Group fitness & yoga', '#2FB34A', {
    icon: 'contra-costa-fitness',
    logoTemplate: 'wordmark', logoLines: ['CONTRA COSTA', 'FITNESS'], logoFace: 'condensed',
    site: 'https://www.contracostafitness.com/',
    tier: 1,
  }),
  /* Carlyle's Chicken Wings, "Oakland • Goods", 2026-09-28, 1:14 pm, with
     @booziebrunch's reel and "Clip video for page plz". Oakland's Chicken wings
     seat is Lucky Three Seven's, so the yellow sheet; with a film it has the
     whole page (the batch27 rule), for the Jack London shop at 439 Water St. */
  seed('carlyles-chicken-wings', "Carlyle's Chicken Wings", "Carlyle's", 'Grilled chicken wings', '#C8102E', {
    icon: 'carlyles-chicken-wings',
    logoTemplate: 'wordmark', logoLines: ["CARLYLE'S"], logoFace: 'grotesk',
    tagline: 'Home of the grilled chicken wings',
    site: 'https://carlyleschickenwings.com/',
    orderUrl: 'https://carlyles-chicken-wings2-oakland.cloveronline.com/',
    /* 3s-27s of 51s: her "Trying a new Black Owned Wing Spot in Jack London
       Oakland" title outside the shop, the owner at the counter, the grill,
       the sauces and a basket of wings. A food creator's film, credited to her. */
    clip: {
      src: '/clips/carlyles-chicken-wings.mp4',
      poster: '/clips/carlyles-chicken-wings-poster.webp',
      href: 'https://www.instagram.com/reel/Dd1606uB7cK/',
      credit: 'Filmed by @booziebrunch',
      platform: 'Instagram',
      by: 'booziebrunch',
    },
  }),
  /* Bascota Café, "Berkeley • Services", 2026-09-28, 6:09 pm: an Egyptian-owned
     pop-up coffee and matcha cart for events, and matcha by the tin. Berkeley's
     Events seat is Perfect Nine's, so the yellow sheet. */
  /* Curio, "San Francisco • Goods", 2026-09-28, 4:20 pm: a cocktail bar with a
     kitchen on Valencia, The Chapel's sister. No seat for a bar, so the yellow
     sheet; the page carries their food and none of the drinks. */
  seed('curio-bar', 'Curio', 'Curio', 'Brunch & bar food', '#272110', {
    icon: 'curio-bar',
    logoTemplate: 'wordmark', logoLines: ['CURIO'], logoFace: 'slab',
    site: 'https://www.curiobarsf.com/',
    tier: 1,
  }),
  seed('bascota-cafe', 'Bascota Café', 'Bascota', 'Pop-up coffee & matcha cart', '#8A5A2B', {
    icon: 'bascota-cafe',
    logoTemplate: 'wordmark', logoLines: ['BASCOTA'], logoFace: 'slab',
    site: 'https://www.bascotacafe.com/',
    tier: 1,
  }),
  /* 2026-09-28, 9:21 to 9:25 pm: two wagyu grills in Milpitas and Wagyu Master in San Jose. */
  /* 牛浪人 Wagyu Grill, "Milpitas • Goods": all-you-can-eat wagyu barbecue and sushi, on the open Sushi seat. */
  seed('wagyu-grill-milpitas', 'Wagyu Grill', 'Wagyu Grill', 'AYCE wagyu BBQ & sushi', '#1C1C1C', {
    icon: 'wagyu-grill',
    logoTemplate: 'wordmark', logoLines: ['WAGYU', 'GRILL'], logoFace: 'slab',
    tagline: 'Japanese A5, Australian M9 and US wagyu, all you can eat',
    site: 'https://wagyu-grill.com/',
  }),
  /* Meat Time Yakiniku, "Milpitas • Goods": Japanese barbecue on the Korean and ramen seat, the nearest. */
  seed('meat-time-yakiniku', 'Meat Time Yakiniku', 'Meat Time', 'Japanese yakiniku', '#0E0E0E', {
    icon: 'meat-time',
    logoTemplate: 'wordmark', logoLines: ['MEAT TIME'], logoFace: 'grotesk',
    tagline: 'Local Japanese BBQ in your neighborhood',
    site: 'https://www.meattimeyakiniku.com/',
  }),
  /* Wagyu Master, "San Jose • Goods": Asian and Sushi are taken, so the yellow sheet. */
  seed('wagyu-master-san-jose', 'Wagyu Master', 'Wagyu Master', 'A5 wagyu shabu & sukiyaki', '#1A1A1A', {
    icon: 'wagyu-master',
    logoTemplate: 'wordmark', logoLines: ['WAGYU', 'MASTER'], logoFace: 'grotesk',
    site: 'https://wagyumastershabu.com/project/wagyu-master-san-jose/',
    orderUrl: 'https://pos.chowbus.com/online-ordering/store/WAGYU-MASTER-SUKIYAKI-SAN-JOSE/23506',
    tier: 1,
    /* Glenn, 2026-10-26: "Please add Wagyu Master to BEASTY • AYCE", with three reels; the first was their Arizona shop, so this San Jose one leads. */
    clip: {src: '/clips/wagyu-master-san-jose.mp4', poster: '/clips/wagyu-master-san-jose-poster.webp', href: 'https://www.instagram.com/reel/Dd3_6PuPZ5b/', credit: 'Filmed by @areweeatingyet', platform: 'Instagram', by: 'areweeatingyet'},
  }),
  /* 2026-09-29 and 30: Glenn's links from Tuesday and Wednesday morning. */
  /* King Katsu Land, "Newark • Goods": "Clip this video and give their page the
     whole tier 3 treatment. I'm going to use this page as a way to recruit her."
     Korean katsu on Newark's open Korean and ramen seat. */
  seed('king-katsu-land-newark', 'King Katsu Land', 'King Katsu', 'Korean katsu', '#161514', {
    icon: 'king-katsu-land',
    logoTemplate: 'wordmark', logoLines: ['KING', 'KATSU LAND'], logoFace: 'script',
    tagline: 'The King of Korean Katsu, near Costco in Newark',
    site: 'https://www.kingkatsuland.com/',
    /* 1s-25s of 34s: her 'King Katsu Land, Newark' opening and the katsu. @kimjsseats, the creator Glenn wants to recruit. */
    clip: {
      src: '/clips/king-katsu-land.mp4',
      poster: '/clips/king-katsu-land-poster.webp',
      href: 'https://www.instagram.com/reel/DalLO65pHLY/',
      credit: 'Filmed by @kimjsseats',
      platform: 'Instagram',
      by: 'kimjsseats',
    },
  }),
  /* Little Sheep, "Newark • Goods / Needs Website pilot program". Asian is
     Phonation's, so the yellow sheet; @iamnikkieg's film of it (sent as a
     Foodie at 5:18 am) gives it the whole page. */
  seed('little-sheep-newark', 'Little Sheep', 'Little Sheep', 'AYCE hot pot & yakitori', '#1F5E3B', {
    needsSite: true,
    icon: 'little-sheep',
    logoTemplate: 'wordmark', logoLines: ['LITTLE', 'SHEEP'], logoFace: 'grotesk',
    tagline: 'All you can eat hot pot and yakitori',
    address: '2016 Newpark Mall, Newark, CA 94560',
    /* 26s-50s of 101s: the hot pot bar and the pots. @iamnikkieg's, a food creator's. */
    clip: {
      src: '/clips/little-sheep-newark.mp4',
      poster: '/clips/little-sheep-newark-poster.webp',
      href: 'https://www.instagram.com/reel/DdftkVVTK7h/',
      credit: 'Filmed by @iamnikkieg',
      platform: 'Instagram',
      by: 'iamnikkieg',
    },
  }),
  /* Bollywood Pizza, "San Francisco • Goods / Livermore • Goods". San
     Francisco's Indian seat was open: Indian fusion pizza, the whole page, with
     their own video ("Clip this video plz"). Livermore is coming soon. */
  seed('bollywood-pizza-sf', 'Bollywood Pizza', 'Bollywood Pizza', 'Indian fusion pizza', '#E31B23', {
    icon: 'bollywood-pizza',
    logoTemplate: 'monogram', logoInitials: 'BP', logoFace: 'condensed',
    tagline: 'Beyond Ordinary, Beyond Flavors',
    site: 'https://bollywoodpizza.com/san-francisco-fremont-st/',
    orderUrl: 'https://order.toasttab.com/online/bollywood-pizza-san-francisco-215-fremont-street',
    /* 83s-107s of 108s: the pizza itself. Their own post. */
    clip: {
      src: '/clips/bollywood-pizza-sf.mp4',
      poster: '/clips/bollywood-pizza-sf-poster.webp',
      href: 'https://www.instagram.com/p/Dd3AYRzseyv/',
      credit: 'Their own film, @bollywoodpizzausa',
      platform: 'Instagram',
      by: 'bollywoodpizzausa',
    },
  }),
  seed('bollywood-pizza-livermore', 'Bollywood Pizza', 'Bollywood Pizza', 'Indian fusion pizza', '#E31B23', {
    icon: 'bollywood-pizza',
    logoTemplate: 'monogram', logoInitials: 'BP', logoFace: 'condensed',
    site: 'https://bollywoodpizza.com/locations/',
    address: 'Livermore, CA (coming soon)',
    tier: 1,
  }),
  /* Basq Haus, "Santa Clara • Goods", with @hungrydanz's reel ("Clip this video
     please"). Bakery is Bloom Zephyr's, so the yellow sheet, whole page for the film. */
  seed('basq-haus', 'Basq Haus', 'Basq Haus', 'Basque cheesecake, pre-order', '#2D619E', {
    icon: 'basq-haus',
    logoTemplate: 'wordmark', logoLines: ['BASQ', 'HAUS'], logoFace: 'grotesk',
    tagline: 'Basque cheesecakes by pre-order, picked up in Santa Clara',
    site: 'https://www.basqhaus.com/',
    orderUrl: 'https://www.basqhaus.com/collections/all',
    /* 1s-25s of 25s: his 'best basque cheesecake in the Bay Area' and the slices. @hungrydanz's, a food creator's. */
    clip: {
      src: '/clips/basq-haus.mp4',
      poster: '/clips/basq-haus-poster.webp',
      href: 'https://www.instagram.com/reel/Dczd9jQxFes/',
      credit: 'Filmed by @hungrydanz',
      platform: 'Instagram',
      by: 'hungrydanz',
    },
  }),
  seed('brasil-bistro', 'Brasil Bistro', 'Brasil Bistro', 'Brazilian', '#111111', {
    icon: 'brasil-bistro',
    logoTemplate: 'wordmark', logoLines: ['BRASIL', 'BISTRO'], logoFace: 'slab',
    site: 'https://brasilbistroelcerrito.com/',
    tier: 1,
  }),
  /* MYO Pure Frozen Yogurt, "Walnut Creek • Goods". The Ice cream shop seat is
     Milky Flakes', so the yellow sheet. Their Alamo shop is not seated. */
  seed('myo-frozen-yogurt-walnut-creek', 'MYO Pure Frozen Yogurt', 'MYO', 'Frozen yogurt', '#F26F21', {
    icon: 'myo-frozen-yogurt',
    logoTemplate: 'wordmark', logoLines: ['MYO'], logoFace: 'grotesk',
    site: 'https://www.myofrozenyogurt.com/',
    tier: 1,
  }),
  /* The Hub by Pack Animals, "San Ramon • Services": a gym for dogs at City
     Center Bishop Ranch, on San Ramon's open Pet grooming and walking seat. */
  seed('the-hub-pack-animals', 'The Hub by Pack Animals', 'The Hub', 'Dog training & daycare', '#009A4E', {
    icon: 'the-hub-pack-animals',
    logoTemplate: 'wordmark', logoLines: ['THE HUB'], logoFace: 'condensed',
    site: 'https://www.thehubpack.com/',
    siteCta: 'See their plans',
  }),
  /* Yo Sushi & Ramen, "Vacaville • Goods", 2026-09-22: Vacaville's open Sushi
     seat with the whole menu from their own site. A plain fetch of that site
     gets a Cloudflare check, so it was read in a real browser. Their Vallejo
     shop is on the same site and is not seated: he named Vacaville. */
  seed('yo-sushi-vacaville', 'Yo Sushi & Ramen', 'Yo Sushi', 'Sushi & ramen', '#2FA6D9', {
    icon: 'yo-sushi-vacaville',
    logoTemplate: 'wordmark', logoLines: ['YO', 'SUSHI'], logoFace: 'grotesk',
    site: 'https://yosushivacaville.com/',
    siteCta: 'See their menu',
    /* Glenn, 2026-10-15/16: requested film; caption confirms this business. */
    clip: {
        "src": "/clips/yo-sushi.mp4",
        "poster": "/clips/yo-sushi-poster.webp",
        "href": "https://www.instagram.com/reel/DeiOoYbxiut/",
        "credit": "Filmed by @grubwitmike",
        "platform": "Instagram",
        "by": "grubwitmike"
    },
  }),
  /* ABVE the Basics, "San Jose • Services", 2026-09-22, 9:28 pm, with their
     site and screenshots of it and of their Instagram (@abvethebasicscatering).
     Caterers from San Jose, "The Bay's Catering Specialists" by their own bio:
     tacos, smash burgers and more for any occasion, in the cooking their site
     calls AMEX, Mexican-American with a street food twist, made from scratch.
     Catering has no seat among the twenty-four and Event coordinator is Bloom
     Balloon's on San Jose, so the yellow sheet, as Bay Area Event Lights, and
     with it the free Tier 1 listing: their initials on a tile in their black,
     the number and email from their Instagram's Contact sheet, and the link
     (their bio: "DM or Visit Our Website for a Quote"). No street address, no
     hours and no prices: their site sits behind a bot check, and its own link
     preview is all of it that was read. */
  seed('abve-the-basics', 'ABVE the Basics', 'ABVE', 'Taco & smash burger catering', '#111111', {
    logoTemplate: 'monogram', logoInitials: 'AB', logoFace: 'condensed',
    address: 'San Jose, CA',
    phone: '(408) 569-5581',
    email: 'abvethebasics@gmail.com',
    site: 'https://www.abvethebasics.com/',
    siteCta: 'Get a quote',
    tier: 1,
  }),
  /* Black Crown Tattoo Studio, "Pittsburg • Services / Needs website pilot
     program", 2026-09-22, 9:54 pm, with their Instagram and what its Email
     button writes to. Pittsburg's open Tattoo and piercing seat, the whole
     page: their crest, cut from his crop of their profile picture, and the
     address, hours, number and walk-in rule from their own bio. The site
     their bio links, blackcrowntattoos.com, is a Wix domain "not connected to
     a site", so no link and the red ring for his pilot list; worth telling
     them their bio points at nothing. */
  seed('black-crown-tattoo', 'Black Crown Tattoo Studio', 'Black Crown', 'Tattoo studio', '#111111', {
    needsSite: true,
    icon: 'black-crown-tattoo',
    logoTemplate: 'monogram', logoInitials: 'BC', logoFace: 'slab',
    tagline: 'Walk-ins welcome, 18 and over with a valid photo ID',
    address: '655 Railroad Ave, Pittsburg, CA 94565',
    phone: '(925) 267-9320',
    email: 'BlackCrownTattoos@yahoo.com',
    hours: 'Mon-Sun 12-7pm',
    contactOnly:
      'A tattoo studio on Railroad Avenue in downtown Pittsburg, open every day from noon to 7pm. Walk-ins are welcome; you must be 18 or over with a valid photo ID. Call or email them to book or to ask about a piece.',
  }),
  /* Cravingz, "Redwood city • Goods / Needs website pilot / Janelle's
     brothers brand", 2026-09-22, 10:06 pm, with their new logo, their
     Instagram, their gift-card page and their own story: "Seeesh… definitely
     needs a drop down lol". Redwood City's open Ice cream shop seat, the whole
     page: the logo he sent ("Logo new"), 826 Main St and "specialty shakes •
     scoops • treats" from their bio, the first paragraph of their story as
     the text on the page and the other two in a drop-down, as on Janelle's.
     Their only link is a Square gift-card page, so it is the button and the
     tile keeps the red ring for his pilot list. No hours, number or prices of
     theirs anywhere, so none are shown. */
  seed('cravingz', 'Cravingz', 'Cravingz', 'Ice cream shop', '#8E5CC8', {
    needsSite: true,
    icon: 'cravingz',
    logoTemplate: 'wordmark', logoLines: ['CRAVINGZ'], logoFace: 'condensed',
    tagline: 'Specialty shakes, scoops and treats',
    address: '826 Main St, Redwood City, CA',
    site: 'https://app.squareup.com/gift/MLQ54M0TS4Q84/order',
    siteCta: 'Buy a gift card',
    /* @grubwitmike's review, the reel Glenn sent at 10:06 pm on 2026-09-22
       beside this listing; Leon said to download it on 2026-09-23. 16s-40s
       of 89s: the shop's neon bear under his "ICE CREAM SANDWICH / PEACH
       COBBLER MILKSHAKE / REDWOOD CITY, CA" title, then the shake tasted
       outside. A food reviewer's film, not the shop's, credited to him. */
    clip: {
      src: '/clips/cravingz.mp4',
      poster: '/clips/cravingz-poster.webp',
      href: 'https://www.instagram.com/reel/DAmWXRISz7P/',
      credit: 'Filmed by @grubwitmike',
      platform: 'Instagram',
      by: 'grubwitmike',
    },
    contactOnly:
      'Cravingz was created to bring back that feeling of hearing the ice cream truck coming down the street—the excitement, the nostalgia, and knowing you were about to get your favorite treat—only elevated.',
    panels: [
      {
        head: 'Our story',
        body: [
          'Family-owned and Bay Area-born, our downtown Redwood City dessert shop takes the flavors and treats we grew up loving and gives them a twist. From specialty shakes and creative sundaes to ice cream sandwiches, dirty sodas, and seasonal creations, our menu is designed to feel familiar while still giving you something you haven’t had before.',
          'Think childhood favorites, grown-up creativity, over-the-top presentation, and a little bit of nostalgia in every order. Cravingz is that ice-cream-truck feeling you remember—just all grown up.',
        ],
      },
    ],
  }),
  /* ---- 2026-09-23, morning. Janelle's friends, a yakitori bar and Gold
     Bean's shops. Glenn sent each with its city page and, for Janelle's
     friends, a glow colour; the research is in research/roster/batch32.json.
     Every logo is cut from his screenshots of their own site or Instagram. */
  /* Skillet'z Cafe, "Fremont • Goods / Janelle's friends restaurant / Give
     them a blue glow": breakfast and brunch on Niles Blvd. No brunch seat, so
     Fremont's open Coffee shop seat, the way Brunch & Bloom took Brentwood's. */
  seed('skilletz-cafe', "Skillet'z Cafe", "Skillet'z", 'Breakfast & brunch', '#232323', {
    glow: 'blue',
    icon: 'skilletz-cafe',
    logoTemplate: 'wordmark', logoLines: ["SKILLET'Z"], logoFace: 'slab',
    site: 'https://skilletz.cafe/',
    siteCta: 'See their menu',
  }),
  /* Billy Roy's Burger Co., "Fremont • Goods / Janelle's friend Restaurant /
     Give them a blue glow": Fremont's open Burgers seat. */
  seed('billy-roys-burger-co', "Billy Roy's Burger Co.", "Billy Roy's", 'Burgers', '#4A2A1E', {
    glow: 'blue',
    icon: 'billy-roys-burger-co',
    logoTemplate: 'wordmark', logoLines: ['BILLY', "ROY'S"], logoFace: 'script',
    site: 'https://billyroysburgerco.com/',
    siteCta: 'Order online',
  }),
  /* Garageworks, "Hayward • Services / Give them a blue glow / Janelle's
     friend Shop": auto body and paint restoration. A collision shop has no
     seat among the twenty-four (Sin Mex went to a yellow sheet for that), but
     a glow is a whole page, so Hayward's open Auto detailing seat, the nearer
     one for paint work. His to move. */
  seed('garageworks', 'Garageworks', 'Garageworks', 'Auto body & paint', '#1F2160', {
    glow: 'blue',
    /* Their own Instagram bio: "a Award Winning Auto Body & Paint Restoration shop". */
    tagline: 'Award-winning auto body and paint restoration',
    icon: 'garageworks',
    logoTemplate: 'wordmark', logoLines: ['GARAGE', 'WORKS'], logoFace: 'condensed',
    site: 'https://www.garageworksusa.com/',
    siteCta: 'Book or see their work',
  }),
  /* The Breeze Café, "Newark • Goods / Janelle's friends restaurant / Give
     them a green glow": breakfast and lunch on Cedar Blvd, on Newark's open
     Coffee shop seat, a café by name. The green glow is new with it. */
  seed('the-breeze-cafe', 'The Breeze Café', 'The Breeze', 'Breakfast & lunch café', '#6E9A78', {
    glow: 'green',
    icon: 'the-breeze-cafe',
    logoTemplate: 'wordmark', logoLines: ['the', 'breeze'], logoFace: 'script',
    site: 'https://www.thebreeze-cafe.com/',
    siteCta: 'See their menu',
  }),
  /* Macs by Icky, "Union City • Goods / Janelle's friends Restaurant / Give
     them a blue glow": "Home of the ube ice cream taco", a Filipino-inspired
     menu and catering, on Union City's open Filipino food seat. */
  seed('macs-by-icky', 'Macs by Icky', 'Macs by Icky', 'Filipino-inspired treats', '#4B3FB8', {
    glow: 'blue',
    icon: 'macs-by-icky',
    logoTemplate: 'wordmark', logoLines: ['MACS', 'BY ICKY'], logoFace: 'script',
    site: 'https://macsbyicky.store/',
    siteCta: 'See their menu',
    /* Glenn, 2026-10-11, "Clip this video plz for Mac'sbyIcky": @siusvision's reel of
       @p_lo trying their Strawberry Crunch ice cream taco in one bite, at the
       Everybody Eats festival on 10 October. */
    clip: {
      src: '/clips/macs-by-icky.mp4',
      poster: '/clips/macs-by-icky-poster.webp',
      href: 'https://www.instagram.com/reel/DeXPVS5M9jz/',
      credit: 'Filmed by @siusvision',
      platform: 'Instagram',
      by: 'siusvision',
    },
  }),
  /* The Une, "Union city • Goods / Janelle's friends Restaurant / Give them a
     pink glow": rice plates and noodle soup at 3902 Smith St, next door to
     Macs by Icky, on Union City's open Asian food seat. Their only link is a
     DoorDash store, so there is no link here, no menu (no prices are taken
     from a delivery app), and the red ring for his pilot list. Hours as their
     own Instagram bio gives them. */
  seed('the-une', 'The Une', 'The Une', 'Rice plates & noodle soup', '#D96BD6', {
    glow: 'pink',
    needsSite: true,
    icon: 'the-une',
    logoTemplate: 'wordmark', logoLines: ['THE', 'UNE'], logoFace: 'condensed',
    address: '3902 Smith St, Union City, CA',
    hours: 'Tue-Sat 12-6pm; The Secret Door Fri-Sat 9pm-3am; closed Sun-Mon',
    contactOnly:
      'Rice plates and noodle soup on Smith Street in Union City, open noon to 6pm, and The Secret Door on Friday and Saturday nights from 9pm to 3am. Closed Sundays and Mondays. Their menu is only on a delivery app, so it is not shown here.',
  }),
  /* The Yakitori Bar, "Fremont • Goods": yakitori on Warm Springs Blvd, with
     no sushi or ramen on the menu, and Fremont's Asian food seat is House of
     Raha's, so the yellow sheet, the free Tier 1 listing. Their menu is three
     pictures from 2021, so no prices are carried, as with HL Peninsula. */
  seed('the-yakitori-bar', 'The Yakitori Bar', 'Yakitori Bar', 'Yakitori', '#111111', {
    icon: 'the-yakitori-bar',
    logoTemplate: 'wordmark', logoLines: ['YAKITORI', 'BAR'], logoFace: 'condensed',
    site: 'https://theyakitoribar.us/',
    siteCta: 'See their menu',
    tier: 1,
  }),
  /* Gold Bean, with its bio's four shops: "Three locations" and "Actually,
     the fourth one coming soon". San Leandro and Pleasanton take their open
     Coffee shop seats with the whole page (Pleasanton opens soon); Berkeley's
     coffee seat is Penelope's, so the two Berkeley shops are free listings
     on its yellow sheet. One logo, the cup, for all four. */
  seed('gold-bean-san-leandro', 'Gold Bean', 'Gold Bean', 'Coffee shop', '#111111', {
    icon: 'gold-bean',
    logoTemplate: 'monogram', logoInitials: 'GB', logoFace: 'grotesk',
    /* This shop's own ordering page, where the prices on the page are from. */
    site: 'https://order.snackpass.co/goldbeansl',
    siteCta: 'Order ahead',
  }),
  seed('gold-bean-pleasanton', 'Gold Bean', 'Gold Bean', 'Coffee shop, opening soon', '#111111', {
    icon: 'gold-bean',
    tagline: 'Opening soon',
    logoTemplate: 'monogram', logoInitials: 'GB', logoFace: 'grotesk',
    site: 'https://www.gldbeancafe.com/',
    siteCta: 'See their shops',
  }),
  seed('gold-bean-durant', 'Gold Bean', 'Gold Bean', 'Coffee shop', '#111111', {
    icon: 'gold-bean',
    logoTemplate: 'monogram', logoInitials: 'GB', logoFace: 'grotesk',
    site: 'https://www.gldbeancafe.com/',
    siteCta: 'See their menu',
    tier: 1,
    /* Glenn, 2026-10-26: "Clip this video plz / for Goldbean coffee"; both reels are the Durant Ave shop. */
    clip: {src: '/clips/gold-bean-durant.mp4', poster: '/clips/gold-bean-durant-poster.webp', href: 'https://www.instagram.com/reel/De9ozyhB0gx/', credit: 'Filmed by @arianasade', platform: 'Instagram', by: 'arianasade'},
  }),
  seed('gold-bean-hearst', 'Gold Bean', 'Gold Bean', 'Coffee shop', '#111111', {
    icon: 'gold-bean',
    logoTemplate: 'monogram', logoInitials: 'GB', logoFace: 'grotesk',
    site: 'https://www.gldbeancafe.com/',
    siteCta: 'See their menu',
    tier: 1,
  }),
  /* ---- 2026-09-23, afternoon: Glenn's messages from 2:35 to 6:43 pm, most
     of Union City's "coming from Janelle FYI". Each went to the seat of its
     kind on the city page he named; where that seat was taken, or there is no
     seat of its kind, the city's yellow sheet at his free Tier 1. The research
     is in research/roster/batch33.json, and every logo is cut from his
     screenshots of their own Instagram or site. */
  /* Paleta Planeta, "San Jose • Goods": three brothers' paleta shop on East
     Santa Clara St, on San Jose's open Ice cream shop seat. */
  seed('paleta-planeta', 'Paleta Planeta', 'Paleta Planeta', 'Paleta shop', '#4B1E8C', {
    icon: 'paleta-planeta',
    logoTemplate: 'wordmark', logoLines: ['PALETA', 'PLANETA'], logoFace: 'condensed',
    tagline: 'Authentic Mexican artisan paletas',
    site: 'https://www.paletaplaneta.com/',
    siteCta: 'See their menu',
    panels: [
      {
        head: 'Catering',
        body: [
          'Catering packages start at $6.75 a paleta for their Galaxy or White Cart, and $6.00 a paleta for their Galaxy Cooler.',
          'The minimum is 100 paletas for a cart and 75 for the cooler. From their own catering page.',
        ],
      },
    ],
  }),
  /* Maza, "San Jose • Goods": Mariscos el Mazatleco on N 13th St. Mexican is
     Tacos Mi Reynita's; their menu has its own sushi section, so the Sushi seat. */
  seed('maza-san-jose', 'Maza', 'Maza', 'Mariscos', '#111111', {
    icon: 'maza-san-jose',
    logoTemplate: 'wordmark', logoLines: ['MAZA'], logoFace: 'slab',
    tagline: 'Mariscos el Mazatleco, 100% outdoor and dog-friendly',
    site: 'https://www.maza-restaurant-bar.com/',
    siteCta: 'Order to go',
  }),
  /* Divino Ristorante, "Belmont • Goods": Belmont's open Italian seat. */
  seed('divino-ristorante', 'Divino Ristorante', 'Divino', 'Italian', '#D71920', {
    icon: 'divino-ristorante',
    logoTemplate: 'wordmark', logoLines: ['DIVINO'], logoFace: 'slab',
    tagline: 'Twenty years of regional Italian in Belmont',
    site: 'https://divinoristorante.com/',
    siteCta: 'See their menus',
  }),
  /* Favorite Indian Restaurant, "Hayward • Goods": Hayward's open Indian seat.
     Their site sat behind a bot check until 2026-10-25, when it loaded and gave
     the menu (rosterResearch.ts); BEASTY • AYCE by hand for their buffet. */
  seed('favorite-indian-restaurant', 'Favorite Indian Restaurant', 'Favorite', 'Indian', '#5A3A22', {
    icon: 'favorite-indian-restaurant',
    logoTemplate: 'wordmark', logoLines: ['FAVORITE'], logoFace: 'slab',
    tagline: 'Where every bite tells a story',
    site: 'https://favoriteindia.com/',
    siteCta: 'Order on their site',
  }),
  /* The Port of Peri Peri, Fremont — "Fremont • Goods / Website needs
     updating": their site renders a blank page, so no link, and the red ring
     for his pilot list. Fremont's open Wings seat, the one Brasa Bros' holds
     in San Francisco, where the other shop sits on the yellow sheet. */
  seed('port-of-peri-peri-fremont', 'The Port of Peri Peri', 'Peri Peri Fremont', 'Peri peri chicken', '#111111', {
    needsSite: true,
    icon: 'port-of-peri-peri-fremont',
    logoTemplate: 'wordmark', logoLines: ['PERI', 'PERI'], logoFace: 'condensed',
    tagline: 'Portuguese peri peri on Walnut Avenue',
    dietary: ['Halal'],
  }),
  /* DO Martial Arts, "Castro Valley • Services": taekwondo and judo, on
     Castro Valley's open Gym seat, as Essence BJJ is a gym in Walnut Creek. */
  seed('do-martial-arts', 'DO Martial Arts', 'DO Martial Arts', 'Martial arts studio', '#111111', {
    icon: 'do-martial-arts',
    logoTemplate: 'monogram', logoInitials: 'DO', logoFace: 'grotesk',
    tagline: 'Taekwondo and judo, kids to adults',
    site: 'https://www.usdomartialarts.com/',
    siteCta: 'Book a trial class',
  }),
  /* Zadna Grill, "Redwood City • Goods": Lebanese, on the open Mediterranean seat. */
  seed('zadna-grill', 'Zadna Grill', 'Zadna Grill', 'Lebanese', '#E4262B', {
    icon: 'zadna-grill',
    logoTemplate: 'wordmark', logoLines: ['ZADNA'], logoFace: 'slab',
    tagline: 'Lebanese wraps, kebabs and soups',
    site: 'https://www.zadnagrill.com/',
    siteCta: 'Order online',
  }),
  /* YAYOI, "3 city locations • Goods": their three shops, Palo Alto,
     Cupertino and Hillsdale in San Mateo, each on its city's Asian food seat
     but Hillsdale's, where Pho De Nguyen sits; their to-go menu has ramen,
     so San Mateo's open Korean and ramen seat. */
  seed('yayoi-palo-alto', 'YAYOI Palo Alto', 'YAYOI', 'Japanese teishoku', '#FFFFFF', {
    icon: 'yayoi',
    logoTemplate: 'wordmark', logoLines: ['YAYOI'], logoFace: 'grotesk',
    tagline: 'Japanese teishoku comfort meals',
    site: 'https://www.yayoi-us.com/togo',
    siteCta: 'See the to-go menu',
  }),
  seed('yayoi-cupertino', 'YAYOI Cupertino', 'YAYOI', 'Japanese teishoku', '#FFFFFF', {
    icon: 'yayoi',
    logoTemplate: 'wordmark', logoLines: ['YAYOI'], logoFace: 'grotesk',
    tagline: 'Japanese teishoku comfort meals',
    site: 'https://www.yayoi-us.com/togo',
    siteCta: 'See the to-go menu',
  }),
  seed('yayoi-san-mateo', 'YAYOI Hillsdale', 'YAYOI', 'Japanese teishoku', '#FFFFFF', {
    icon: 'yayoi',
    logoTemplate: 'wordmark', logoLines: ['YAYOI'], logoFace: 'grotesk',
    tagline: 'Japanese teishoku comfort meals',
    site: 'https://www.yayoi-us.com/togo',
    siteCta: 'See the to-go menu',
  }),
  /* Union City's goods: Tacos Papo on the Mexican seat, DoughWeiMe on the
     Bakery seat, K On The Go on the Coffee shop seat. Backyard Bayou (Cajun,
     no seat of its kind), Golden Bay (dim sum; Asian food is The Une's) and
     San Honoré (bakery, after DoughWeiMe) are on the yellow sheet. */
  seed('tacos-papo', 'Tacos Papo', 'Tacos Papo', 'Mexican', '#F28C28', {
    icon: 'tacos-papo',
    logoTemplate: 'wordmark', logoLines: ['TACOS', 'PAPO'], logoFace: 'condensed',
    tagline: 'Authentic Mexican taqueria, since 2019',
    site: 'https://tacospapo.com/',
    siteCta: 'Order online',
  }),
  seed('doughweime', 'DoughWeiMe Bakery & Cafe', 'DoughWeiMe', 'Bakery', '#F2A77E', {
    icon: 'doughweime',
    logoTemplate: 'wordmark', logoLines: ['DOUGH', 'WEIME'], logoFace: 'slab',
    tagline: 'Thursday to Sunday, 9 to 3 or sellout',
    site: 'https://doughweime.com/',
    siteCta: 'Preorder',
  }),
  /* No site of their own: a Linktree, a delivery storefront and a Calendly for
     tea time, so the button is the tea-time booking and the red ring shows. */
  seed('k-on-the-go-union-city', 'K On The Go', 'K On The Go', 'Cafe and high tea', '#B7D3CF', {
    icon: 'k-on-the-go',
    logoTemplate: 'monogram', logoInitials: 'K', logoFace: 'slab',
    tagline: 'Specialty coffee, boba and high tea',
    site: 'https://calendly.com/konthegouc/tea-time-reservation',
    siteCta: 'Reserve tea time',
  }),
  seed('backyard-bayou', 'Backyard Bayou', 'Backyard Bayou', 'Cajun seafood', '#F4F1EA', {
    icon: 'backyard-bayou',
    logoTemplate: 'wordmark', logoLines: ['BACKYARD', 'BAYOU'], logoFace: 'slab',
    site: 'https://backyardbayou.com/',
    siteCta: 'See their menu',
    tier: 1,
  }),
  seed('golden-bay-seafood-harbor', 'Golden Bay Seafood Harbor', 'Golden Bay', 'Dim sum and seafood', '#FFFFFF', {
    icon: 'golden-bay-seafood-harbor',
    logoTemplate: 'wordmark', logoLines: ['GOLDEN', 'BAY'], logoFace: 'slab',
    site: 'https://goldenbayca.com/',
    siteCta: 'See the menu and order',
    tier: 1,
  }),
  /* San Honoré Panaderia, "Union City • Goods / Needs Website pilot program",
     at the address he sent, 4128 Dyer St. Their Instagram: authentic Filipino
     baked goods, "nestled within select Island Pacific Supermarkets across
     California and Nevada". No site, so no link and the red ring. */
  seed('san-honore-panaderia', 'San Honoré Panaderia', 'San Honoré', 'Filipino bakery', '#F5EDE2', {
    needsSite: true,
    icon: 'san-honore-panaderia',
    logoTemplate: 'wordmark', logoLines: ['SAN', 'HONORÉ'], logoFace: 'slab',
    address: '4128 Dyer St, Union City, CA 94587',
    contactOnly:
      'Authentic Filipino baked goods, from a panaderia inside select Island Pacific Supermarkets across California and Nevada, in their own words. They publish no menu or prices.',
    tier: 1,
  }),
  /* Union City's services: The Moon Nails on the Nail salon seat. The Hot
     Spot Studios (paint-your-own pottery, no seat of its kind), The Lion's
     Mane (the Barber seat is The Company Barber's) and JAS Nail Spa (after
     The Moon Nails) are on the yellow sheet. */
  seed('the-moon-nails', 'The Moon Nails', 'Moon Nails', 'Nail salon', '#0F2A4D', {
    icon: 'the-moon-nails',
    logoTemplate: 'wordmark', logoLines: ['THE', 'MOON'], logoFace: 'slab',
    tagline: 'Mani, pedi, lashes and waxing',
    site: 'https://themoonnailsunioncity.com/',
    siteCta: 'See their prices',
  }),
  seed('the-hot-spot-studios-union-city', 'The Hot Spot Studios', 'Hot Spot', 'Paint-your-own pottery', '#F6E7D0', {
    icon: 'the-hot-spot-studios',
    logoTemplate: 'wordmark', logoLines: ['HOT', 'SPOT'], logoFace: 'script',
    site: 'https://www.thehotspotstudios.com/union-city-ca/',
    siteCta: 'Visit their studio page',
    tier: 1,
  }),
  seed('the-lions-mane-barbershop', "The Lion's Mane Barbershop", "Lion's Mane", 'Barbershop', '#3A3A3A', {
    icon: 'the-lions-mane-barbershop',
    logoTemplate: 'monogram', logoInitials: 'LM', logoFace: 'slab',
    address: '31808 Alvarado Blvd, Union City, CA 94587',
    site: 'https://booksy.com/en-us/431617_edzel-ford-the-lions-mane-barbershop_barber-shop_103699_union-city',
    siteCta: 'Book on Booksy',
    tier: 1,
  }),
  seed('jas-nail-spa', 'JAS Nail Spa', 'JAS Nail Spa', 'Nail salon', '#F2F2F2', {
    icon: 'jas-nail-spa',
    logoTemplate: 'monogram', logoInitials: 'J', logoFace: 'slab',
    site: 'https://jasnailspaunioncity.com/',
    siteCta: 'See their prices',
    tier: 1,
  }),
  /* Honey Pot Gelato, "Petaluma • Goods / Needs website": Petaluma's open
     Ice cream shop seat. Everything is off their own Instagram: open at last,
     701 Sonoma Mountain Pkwy, noon to 9pm every day. The bio's only link is a
     newspaper story about them, so no button and the red ring. */
  seed('honey-pot-gelato', 'Honey Pot Gelato', 'Honey Pot', 'Gelato', '#FFFFFF', {
    needsSite: true,
    icon: 'honey-pot-gelato',
    logoTemplate: 'wordmark', logoLines: ['HONEY', 'POT'], logoFace: 'grotesk',
    tagline: 'Gelato, open every day, Mondays too',
    address: '701 Sonoma Mountain Pkwy, Petaluma, CA',
    hours: 'Every day 12–9pm',
    contactOnly:
      'A gelato shop on Sonoma Mountain Parkway, open from noon to 9pm every day, Mondays included, in their own words. They publish no menu or prices yet.',
  }),
  /* Walnut Creek's four: North Italia on the open Italian seat; Galpão Gaucho
     (Brazilian), Havana (Cuban) and LITA (Miami and the Caribbean) have no
     seat of their kind, so the yellow sheet. Galpão's and North Italia's
     screenshots never reached this Mac, so their tiles are drawn. */
  seed('north-italia-walnut-creek', 'North Italia', 'North Italia', 'Italian', '#1F2A30', {
    logoTemplate: 'wordmark', logoLines: ['NORTH', 'ITALIA'], logoFace: 'slab',
    tagline: 'Handmade pasta and pizza on Locust Street',
    site: 'https://www.northitalia.com/locations/north-italia-walnut-creek-ca/',
    siteCta: 'See their menus',
    panels: [
      {
        head: 'Hours by menu',
        body: [
          'Lunch Monday to Friday, 11:30am to 4pm, and brunch Saturday and Sunday, 10am to 4pm.',
          'Dinner Sunday to Thursday, 4pm to 10pm, and Friday and Saturday, 4pm to 11pm.',
          'Happy hour Monday to Friday, 3pm to 6pm. From their own Walnut Creek page.',
        ],
      },
    ],
  }),
  seed('galpao-gaucho-walnut-creek', 'Galpão Gaucho', 'Galpão', 'Brazilian steakhouse', '#1B1B1B', {
    logoTemplate: 'wordmark', logoLines: ['GALPÃO', 'GAUCHO'], logoFace: 'slab',
    site: 'https://galpaogauchousa.com/location/walnut-creek-ca/',
    siteCta: 'See their prices',
    tier: 1,
  }),
  seed('havana-walnut-creek', 'Havana', 'Havana', 'California-Cuban', '#000000', {
    icon: 'havana-walnut-creek',
    logoTemplate: 'wordmark', logoLines: ['Havana'], logoFace: 'grotesk',
    site: 'https://www.havanarestaurant.net/',
    siteCta: 'See their menus',
    tier: 1,
  }),
  seed('lita-walnut-creek', 'LITA', 'LITA', 'Caribbean-Latin', '#4A6583', {
    icon: 'lita-walnut-creek',
    logoTemplate: 'wordmark', logoLines: ['lita'], logoFace: 'script',
    site: 'https://www.litawalnutcreek.com/',
    siteCta: 'See their menus',
    tier: 1,
  }),
  /* Shady Oak, "Santa Rosa • Goods": a brewery, whose beer is never listed
     here, with a beer garden and an arcade. No seat of its kind, so Santa
     Rosa's yellow sheet. */
  seed('shady-oak-brewing', 'Shady Oak Brewing Company', 'Shady Oak', 'Brewery taproom', '#F4EAD5', {
    icon: 'shady-oak-barrel-house',
    logoTemplate: 'wordmark', logoLines: ['SHADY', 'OAK'], logoFace: 'script',
    site: 'https://www.shadyoakbrewing.com/',
    siteCta: 'See what is on',
    tier: 1,
  }),
  /* ---- 2026-09-24. */
  /* Ezra Luz Johns, "BEASTY • Services / This is my friend ... make her a page
     based on her LinkedIn info" (Glenn called her a freelance photographer;
     none of her own pages mention photography, so, on Leon's call, the page is
     what they do say). Seat #23, George Professional Landscape's: "You can
     bump George Landscape to the yellow page". Everything is her own: the
     headline, the consultation and podcast on the pages her Linktree links,
     her LinkedIn's service list, and the phone and email on her Instagram's
     contact sheet. Her Linktree's product and referral links are left off. No
     site of her own, so the button is her booking page and the ring is red. */
  seed('ezra-luz-johns', 'Ezra Luz Johns', 'Ezra Johns', 'Life insurance & coaching', '#6B2E1E', {
    needsSite: true,
    icon: 'ezra-luz-johns',
    logoTemplate: 'monogram', logoInitials: 'EJ', logoFace: 'slab',
    tagline: 'Financial literacy, entrepreneurship and intentional living',
    phone: '(415) 535-0242',
    email: 'ilml.inquire@gmail.com',
    site: 'https://calendar.app.google/H3jYLqLSj43nWvKg6',
    siteCta: 'Book a free consultation',
    contactOnly:
      'Empowering individuals through financial literacy, entrepreneurship and intentional living, in her own words. She offers free 30-minute consultations on life insurance, living benefits and Indexed Universal Life (IUL), and hosts the Women of Insurance podcast. Book a time, or text or email her.',
    panels: [
      {
        head: 'What she offers',
        body: [
          'Life insurance, small business insurance and financial planning.',
          'Training, corporate training, team building and public speaking.',
          'Strategic planning, marketing consulting and career development coaching.',
          'From her LinkedIn, San Francisco.',
        ],
      },
    ],
  }),
  /* 1850 Properties, "BEASTY • Services / this is a friend of mine's
     business ... White glow would be nice" (Glenn, 2026-09-24): Ross
     Hillesheim's real estate company, "He builds gas stations". BEASTY
     Services is full, so the yellow sheet, the whole page as every BEASTY
     spot gets. Address, phone, email and every word from their own site. */
  seed('1850-properties', '1850 Properties', '1850 Properties', 'Real estate development', '#223246', {
    glow: 'white',
    icon: '1850-properties',
    logoTemplate: 'wordmark', logoLines: ['1850'], logoFace: 'slab',
    tagline: 'Service stations and automotive real estate',
    address: '3195 Danville Blvd, Alamo, CA 94507',
    phone: '(831) 392-6424',
    email: 'ross@1850properties.com',
    site: 'https://www.1850properties.com/',
    siteCta: 'See their properties',
    contactOnly:
      'Developing and owning real estate in California and the Mountain West for over twelve years, with more than $60,000,000 in service stations and automotive real estate controlled, managed and built, in their own words. Their properties include Stockton and Laurel Rd. Call or email Ross to connect.',
  }),
  /*
    BATCH 42, 2026-10-05: Glenn's links of 30 September to 4 October
    (research/roster/batch42.json, built by build42.py). A yellow-sheet
    business he sent a film for gets the whole page; the rest of the yellow
    sheet is the free Tier 1 listing.
  */
  /* Oakland • Eats */
  seed('rob-bens-restaurant', 'Rob Ben\'s Restaurant & Lounge', 'Rob Ben\'s', 'Southern soul food', '#0E0C0A', {
    icon: 'rob-bens-restaurant',
    tagline: 'Southern soul food, in Emeryville',
    site: 'https://robbensrestaurant.com/',
    clip: {
      src: '/clips/rob-bens-restaurant.mp4',
      poster: '/clips/rob-bens-restaurant-poster.webp',
      href: 'https://www.instagram.com/reel/DEgHeK_yfL-/',
      credit: 'Filmed by @bayarea_fooddreamz',
      platform: 'Instagram',
      by: 'bayarea_fooddreamz',
    },
  }),
  /* Oakland • Eats (2 locations) */
  seed('understory', 'Understory', 'Understory', 'Worker-owned cafe and weeken', '#010101', {
    icon: 'understory',
    tagline: 'Worker-owned cafe and weekend brunch, Filipino and global flavours, in Oakland',
    site: 'https://understoryoakland.com/',
    orderUrl: 'https://order.toasttab.com/online/understory-oakland-3340-international-boulevard',
    clip: {
      src: '/clips/understory.mp4',
      poster: '/clips/understory-poster.webp',
      href: 'https://www.instagram.com/reel/Dd7Gag4NaBV/',
      credit: 'Filmed by @festusfeasts',
      platform: 'Instagram',
      by: 'festusfeasts',
    },
  }),
  /* Oakland • Eats */
  seed('town-bizness-hibachi', 'Town Bizness Hibachi', 'Town Bizness', 'Hibachi grill (takeout and d', '#B1312B', {
    icon: 'town-bizness-hibachi',
    tagline: 'Hibachi grill (takeout and delivery), in Oakland',
    site: 'https://townbiznesshibachi.com/',
    orderUrl: 'https://online-ordering.innowi.com/branch/npkoakland',
    tier: 1,
  }),
  /* Oakland • Eats */
  seed('brundo-spices', 'Brundo Spice Company', 'Brundo', 'Ethiopian spices and herbs (', '#4C4C4C', {
    icon: 'brundo-spices',
    tagline: 'Ethiopian spices and herbs (online shop)',
    site: 'https://www.brundo.com/',
    clip: {
      src: '/clips/brundo-spices.mp4',
      poster: '/clips/brundo-spices-poster.webp',
      href: 'https://www.instagram.com/reel/DeAygs_vTtd/',
      credit: 'Filmed by @bayareafoodz',
      platform: 'Instagram',
      by: 'bayareafoodz',
    },
  }),
  /* Oakland • Services */
  seed('four-forty-four-events', 'Four Forty Four Events', '444 Events', 'Event design, styling and pl', '#504B46', {
    icon: 'four-forty-four-events',
    tagline: 'Event design, styling and planning, in Oakland',
    site: 'https://www.fourfortyfourevents.com/',
    clip: {
      src: '/clips/four-forty-four-events.mp4',
      poster: '/clips/four-forty-four-events-poster.webp',
      href: 'https://www.instagram.com/reel/Dd70LCuMMsD/',
      credit: 'Posted by Four Forty Four Events',
      platform: 'Instagram',
    },
  }),
  /* El Cerrito • Eats */
  seed('pakaoma', 'Pakaoma', 'Pakaoma', 'Thai Isan and Lao', '#464E45', {
    icon: 'pakaoma',
    tagline: 'Thai Isan and Lao, in El Cerrito',
    site: 'https://www.pakaomathailao.com/',
    orderUrl: 'https://order.toasttab.com/online/pakaoma-thai-lao-diner',
    clip: {
      src: '/clips/pakaoma.mp4',
      poster: '/clips/pakaoma-poster.webp',
      href: 'https://www.instagram.com/reel/Dd7cwHQv9lo/',
      credit: 'Filmed by @foodandsachi',
      platform: 'Instagram',
      by: 'foodandsachi',
    },
  }),
  /* Berkeley • Eats */
  seed('cali-alley', 'Cali Alley', 'Cali Alley', 'Artisan burgers, sandwiches ', '#893673', {
    icon: 'cali-alley',
    tagline: 'Artisan burgers, sandwiches and plates from an outdoor food window, in Berkeley',
    site: 'https://calialley.com/',
    orderUrl: 'https://ordering.chownow.com/order/26508/locations',
    clip: {
      src: '/clips/cali-alley.mp4',
      poster: '/clips/cali-alley-poster.webp',
      href: 'https://www.instagram.com/reel/Dd4ydyFto4G/',
      credit: 'Filmed by @festusfeasts',
      platform: 'Instagram',
      by: 'festusfeasts',
    },
  }),
  /* Berkeley • Eats */
  seed('praaw-thai', 'Praaw Thai', 'Praaw Thai', 'Thai', '#234122', {
    icon: 'praaw-thai',
    tagline: 'Thai, in Berkeley',
    site: 'https://praawthai.com/',
    orderUrl: 'https://praawthaica.smiledining.com/',
    clip: {
      src: '/clips/praaw-thai.mp4',
      poster: '/clips/praaw-thai-poster.webp',
      href: 'https://www.instagram.com/reel/DdhPdjsPH71/',
      credit: 'Filmed by @foodandsachi',
      platform: 'Instagram',
      by: 'foodandsachi',
    },
  }),
  /* Berkeley • Eats AND San Francisco • Eats */
  seed('rose-pizzeria-berkeley', 'Rose Pizzeria', 'Rose Pizzeria', 'Thin-crust pizza and natural', '#484D4E', {
    icon: 'rose-pizzeria-berkeley',
    tagline: 'Thin-crust pizza and natural wine, in Berkeley',
    site: 'https://www.rosepizzeria.com/location-berkeley',
    orderUrl: 'https://order.toasttab.com/online/rosetogo',
  }),
  /* Berkeley • Eats AND San Francisco • Eats */
  seed('rose-pizzeria-san-francisco', 'Rose Pizzeria', 'Rose Pizzeria', 'Thin-crust pizza and natural', '#484D4E', {
    icon: 'rose-pizzeria-san-francisco',
    tagline: 'Thin-crust pizza and natural wine, in San Francisco',
    site: 'https://www.rosepizzeria.com/location-sanfrancisco',
    orderUrl: 'https://order.toasttab.com/online/rosepizzeriasf',
    clip: {
      src: '/clips/rose-pizzeria-san-francisco.mp4',
      poster: '/clips/rose-pizzeria-san-francisco-poster.webp',
      href: 'https://www.instagram.com/reel/DdEjNGpqKm9/',
      credit: 'Filmed by @seekeasyeats',
      platform: 'Instagram',
      by: 'seekeasyeats',
    },
  }),
  /* Berkeley • Eats (multiple Bay Area locations) */
  seed('hinodeya-ramen-berkeley', 'HINODEYA Ramen & Bar', 'Hinodeya', 'Japanese dashi ramen', '#4C4C4C', {
    icon: 'hinodeya-ramen-berkeley',
    tagline: 'Japanese dashi ramen, in Berkeley',
    site: 'https://hinodeyaramen.com/berkeley1',
    orderUrl: 'https://hinodeyaramen.com/menu/berkeley1',
    clip: {
      src: '/clips/hinodeya-ramen-berkeley.mp4',
      poster: '/clips/hinodeya-ramen-berkeley-poster.webp',
      href: 'https://www.instagram.com/reel/DdohRAlvwjj/',
      credit: 'Filmed by @hungere.for.diy',
      platform: 'Instagram',
      by: 'hungere.for.diy',
    },
  }),
  /* Berkeley • Eats */
  seed('thai-table-berkeley', 'Thai Table', 'Thai Table', 'Thai, homemade style', '#BD0D0D', {
    icon: 'thai-table-berkeley',
    tagline: 'Thai, homemade style, in Berkeley',
    site: 'https://www.thaitableberkeley.com/',
    orderUrl: 'https://order.toasttab.com/online/thai-table',
    tier: 1,
  }),
  /* San Francisco • Eats */
  seed('yuanbao-jiaozi-san-francisco', 'Yuanbao Jiaozi', 'Yuanbao', 'Handmade Chinese dumplings a', '#4C4C4C', {
    icon: 'yuanbao-jiaozi-san-francisco',
    tagline: 'Handmade Chinese dumplings and noodles, in San Francisco',
    site: 'https://yuanbaojiaozitogo.com/',
    clip: {
      src: '/clips/yuanbao-jiaozi-san-francisco.mp4',
      poster: '/clips/yuanbao-jiaozi-san-francisco-poster.webp',
      href: 'https://www.instagram.com/reel/Dd78almhYaR/',
      credit: 'Filmed by @allie.eats',
      platform: 'Instagram',
      by: 'allie.eats',
    },
  }),
  /* Burlingame • Eats */
  seed('yuanbao-jiaozi-burlingame', 'Yuanbao Jiaozi', 'Yuanbao', 'Handmade Chinese dumplings a', '#4C4C4C', {
    icon: 'yuanbao-jiaozi-burlingame',
    tagline: 'Handmade Chinese dumplings and noodles, in Burlingame',
    site: 'https://yuanbaojiaozitogo.com/',
    orderUrl: 'https://dinfo.me/onlineorder/#/home/menu/?restid=yuanbaojiaozi',
    clip: {
      src: '/clips/yuanbao-jiaozi-san-francisco.mp4',
      poster: '/clips/yuanbao-jiaozi-san-francisco-poster.webp',
      href: 'https://www.instagram.com/reel/Dd78almhYaR/',
      credit: 'Filmed by @allie.eats',
      platform: 'Instagram',
      by: 'allie.eats',
    },
  }),
  /* San Francisco • Sweets */
  seed('pineapple-king-bakery-san-francisco', 'Pineapple King Bakery', 'Pineapple King', 'Hong Kong-style bakery', '#4C4C4C', {
    icon: 'pineapple-king-bakery-san-francisco',
    tagline: 'Hong Kong-style bakery, in San Francisco',
    site: 'https://www.pineapplekingbakery.com/',
    orderUrl: 'https://pineapple-king-bakery.square.site/',
    clip: {
      src: '/clips/pineapple-king-bakery-san-francisco.mp4',
      poster: '/clips/pineapple-king-bakery-san-francisco-poster.webp',
      href: 'https://www.instagram.com/reel/DdX5Vztgv0A/',
      credit: 'Filmed by @allie.eats',
      platform: 'Instagram',
      by: 'allie.eats',
    },
  }),
  /* San Francisco • Eats */
  seed('tonys-pizza-napoletana', 'Tony\'s Pizza Napoletana', 'Tony\'s Pizza', 'Pizzeria: Neapolitan, New Yo', '#4C4C4C', {
    icon: 'tonys-pizza-napoletana',
    tagline: 'Pizzeria: Neapolitan, New York, Detroit, Sicilian and more, in San Francisco',
    site: 'https://tonyspizzanapoletana.com/',
    orderUrl: 'https://order.toasttab.com/online/tonys-pizza-napoletana',
    clip: {
      src: '/clips/tonys-pizza-napoletana.mp4',
      poster: '/clips/tonys-pizza-napoletana-poster.webp',
      href: 'https://www.instagram.com/reel/DYyHYXRI202/',
      credit: 'Filmed by @thesnacksensei',
      platform: 'Instagram',
      by: 'thesnacksensei',
    },
  }),
  /* San Francisco • Coffee */
  seed('q-specialty-coffee-san-francisco', 'Q Specialty Coffee', 'Q Coffee', 'Specialty coffee roaster and', '#4C4C4C', {
    icon: 'q-specialty-coffee-san-francisco',
    tagline: 'Specialty coffee roaster and cafe, in San Francisco',
    site: 'https://www.qspecialtycoffee.com/',
    tier: 1,
  }),
  /* San Francisco • Eats */
  seed('rg-lounge', 'R&G Lounge', 'R&G Lounge', 'Cantonese', '#4C4C4C', {
    icon: 'rg-lounge',
    tagline: 'Cantonese, in San Francisco',
    site: 'https://www.rnglounge.com/',
    tier: 1,
  }),
  /* Redwood City • Eats */
  seed('alhambra-irish-house', 'Alhambra Irish House', 'Alhambra', 'Irish gastropub', '#4C4C4C', {
    icon: 'alhambra-irish-house',
    tagline: 'Irish gastropub, in Redwood City',
    site: 'https://alhambra-irish-house.com/',
    orderUrl: 'https://alhambra-irish-house.com/order',
    clip: {
      src: '/clips/alhambra-irish-house.mp4',
      poster: '/clips/alhambra-irish-house-poster.webp',
      href: 'https://www.instagram.com/reel/DaWWDv1hXvH/',
      credit: 'Filmed by @singlecatm0m',
      platform: 'Instagram',
      by: 'singlecatm0m',
    },
  }),
  /* San Rafael • Services */
  seed('absolute-volleyball-club', 'Absolute Volleyball Club', 'Absolute VB', 'Youth volleyball club: teams', '#232122', {
    icon: 'absolute-volleyball-club',
    tagline: 'Youth volleyball club: teams, clinics and private lessons, in San Rafael',
    site: 'https://www.absolutevb.com/',
    clip: {
      src: '/clips/absolute-volleyball-club.mp4',
      poster: '/clips/absolute-volleyball-club-poster.webp',
      href: 'https://www.instagram.com/reel/Dd91dqSMBDg/',
      credit: 'Posted by Absolute Volleyball Club',
      platform: 'Instagram',
    },
  }),
  /* BEASTY • Eats */
  seed('kopi-bar-and-bakery', 'Kopi Bar & Bakery', 'Kopi Bar', 'Singaporean- and Indonesian-', '#4C4C4C', {
    icon: 'kopi-bar-and-bakery',
    tagline: 'Singaporean- and Indonesian-inspired cafe and bakery, in Berkeley',
    site: 'https://www.thekopibar.com/',
    orderUrl: 'https://www.thekopibar.com/store/23872',
  }),
  /* Los Gatos • Eats */
  seed('the-cats', 'The Cats', 'The Cats', 'Texas BBQ and Filipino favor', '#000000', {
    icon: 'the-cats',
    tagline: 'Texas BBQ and Filipino favorites, with a bar and live music, in Los Gatos',
    site: 'https://www.thecatslosgatos.com/',
    orderUrl: 'https://online.skytab.com/6900ec73ace70df71d640a3a2b221eda',
  }),
  /* San Jose • Eats */
  seed('sticky-rice-thai', 'Sticky Rice Thai', 'Sticky Rice', 'Thai, with Isan dishes', '#1C1C1E', {
    tagline: 'Thai, with Isan dishes, in San Jose',
    orderUrl: 'https://stickyricethaillc.toast.site/order',
    needsSite: true,
    clip: {
      src: '/clips/sticky-rice-thai.mp4',
      poster: '/clips/sticky-rice-thai-poster.webp',
      href: 'https://www.instagram.com/reel/Dd1o8N_tB5C/',
      credit: 'Filmed by @orangeginger',
      platform: 'Instagram',
      by: 'orangeginger',
    },
  }),
  /* San Jose • Eats */
  seed('blue-pagoda', 'Blue Pagoda', 'Blue Pagoda', 'Japanese omakase and sushi', '#4C4C4C', {
    icon: 'blue-pagoda',
    tagline: 'Japanese omakase and sushi, in San Jose',
    site: 'https://bluepagodadining.com/',
    clip: {
      src: '/clips/blue-pagoda.mp4',
      poster: '/clips/blue-pagoda-poster.webp',
      href: 'https://www.instagram.com/reel/Dd4J1SRq4UA/',
      credit: 'Filmed by @janeethefoodie',
      platform: 'Instagram',
      by: 'janeethefoodie',
    },
  }),
  /* San Jose • Eats */
  seed('tempura-kaneko-hannosuke', 'Tempura Kaneko Hannosuke', 'Hannosuke', 'Japanese tempura and tendon', '#534A49', {
    icon: 'tempura-kaneko-hannosuke',
    tagline: 'Japanese tempura and tendon, in San Jose',
    site: 'https://tempura-kaneko-hannosuke.com/',
    clip: {
      src: '/clips/tempura-kaneko-hannosuke.mp4',
      poster: '/clips/tempura-kaneko-hannosuke-poster.webp',
      href: 'https://www.instagram.com/reel/Dd9emqGs0zV/',
      credit: 'Filmed by @bestbayareafood',
      platform: 'Instagram',
      by: 'bestbayareafood',
    },
  }),
  /* Santa Clara • Eats */
  seed('master-oh', 'Master Oh', 'Master Oh', 'Korean, known for raw marina', '#4C4C4B', {
    icon: 'master-oh',
    tagline: 'Korean, known for raw marinated seafood, in Santa Clara',
    site: 'https://master-oh.com/',
    orderUrl: 'https://masterohs.menu11.com/sc/order',
    clip: {
      src: '/clips/master-oh.mp4',
      poster: '/clips/master-oh-poster.webp',
      href: 'https://www.instagram.com/reel/DcSP10VN8uz/',
      credit: 'Filmed by @annna_eats',
      platform: 'Instagram',
      by: 'annna_eats',
    },
  }),
  /* San Jose • Eats */
  seed('sourdough-eatery', 'Sourdough Eatery', 'Sourdough', 'Sandwich shop with fresh-bak', '#73423F', {
    icon: 'sourdough-eatery',
    tagline: 'Sandwich shop with fresh-baked sourdough, in San Jose',
    site: 'https://sourdougheatery.com/',
  }),
  /* San Jose • Eats */
  seed('rantei-japanese-cuisine', 'Rantei Japanese Cuisine', 'Rantei', 'Japanese: sushi bar and yaki', '#4F4C38', {
    icon: 'rantei-japanese-cuisine',
    tagline: 'Japanese: sushi bar and yakitori, in Santa Clara',
    site: 'https://www.ranteijapanesecuisine.com/',
    orderUrl: 'https://www.ranteijapanesecuisine.com/gsnrgav5/rantei-japanese-cuisine-santa-clara-95050/order-online',
  }),
  /* BEASTY • Barbershops */
  seed('sj-proper-cuts', 'Proper Cuts Barber Shop', 'Proper Cuts', 'Barbershop', '#4C4C4C', {
    icon: 'sj-proper-cuts',
    tagline: 'Barbershop, in San Jose',
    site: 'https://www.sjpropercuts.com/',
    orderUrl: 'https://getsquire.com/booking/book/propercuts-barbershop-san-jose',
  }),
  /* San Jose • Eats */
  seed('pho-ha-noi-san-jose', 'Pho Ha Noi', 'Pho Ha Noi', 'Vietnamese, Northern-style p', '#4C4C4C', {
    icon: 'pho-ha-noi-san-jose',
    tagline: 'Vietnamese, Northern-style phở, in San Jose',
    site: 'https://phohanoi.com/san-jose-en.html',
    tier: 1,
  }),
  /* Cupertino • Eats */
  seed('pho-ha-noi-cupertino', 'Pho Ha Noi', 'Pho Ha Noi', 'Vietnamese, Northern-style p', '#4C4C4C', {
    icon: 'pho-ha-noi-cupertino',
    tagline: 'Vietnamese, Northern-style phở, in Cupertino',
    site: 'https://phohanoi.com/cupertino-en.html',
    tier: 1,
  }),
  /* Palo Alto • Eats */
  seed('pho-ha-noi-palo-alto', 'Pho Ha Noi', 'Pho Ha Noi', 'Vietnamese, Northern-style p', '#4C4C4C', {
    icon: 'pho-ha-noi-palo-alto',
    tagline: 'Vietnamese, Northern-style phở, in Palo Alto',
    site: 'https://phohanoi.com/palo-alto-en.html',
    tier: 1,
  }),
  /* Milpitas • Eats */
  seed('pho-ha-noi-milpitas', 'Pho Ha Noi', 'Pho Ha Noi', 'Vietnamese, Northern-style p', '#4C4C4C', {
    icon: 'pho-ha-noi-milpitas',
    tagline: 'Vietnamese, Northern-style phở, in Milpitas',
    site: 'https://phohanoi.com/milpitas-en.html',
    tier: 1,
  }),
  /* Fremont • Eats */
  seed('pho-ha-noi-fremont', 'Pho Ha Noi', 'Pho Ha Noi', 'Vietnamese, Northern-style p', '#4C4C4C', {
    icon: 'pho-ha-noi-fremont',
    tagline: 'Vietnamese, Northern-style phở, in Fremont',
    site: 'https://phohanoi.com/fremont-en.html',
    tier: 1,
  }),
  /* Livermore • Eats */
  seed('calikid-burgers-livermore', 'CaliKid Burgers ’n Shakes', 'CaliKid', 'California-style burgers and', '#000000', {
    icon: 'calikid-burgers-livermore',
    tagline: 'California-style burgers and shakes, in Livermore',
    site: 'https://www.calikidburgers.com/',
    orderUrl: 'https://order.toasttab.com/online/calikidburgers',
    clip: {
      src: '/clips/calikid-burgers-livermore.mp4',
      poster: '/clips/calikid-burgers-livermore-poster.webp',
      href: 'https://www.instagram.com/reel/DdW5SubguQ1/',
      credit: 'Filmed by @capturedbysado',
      platform: 'Instagram',
      by: 'capturedbysado',
    },
  }),
  /* Pleasant Hill • Eats */
  seed('calikid-burgers-pleasant-hill', 'CaliKid Burgers ’n Shakes', 'CaliKid', 'California-style burgers and', '#000000', {
    icon: 'calikid-burgers-pleasant-hill',
    tagline: 'California-style burgers and shakes, in Pleasant Hill',
    site: 'https://www.calikidburgers.com/',
    orderUrl: 'https://order.toasttab.com/online/cali-kid-burgers-n-shakes-pleasant-hill/',
    clip: {
      src: '/clips/calikid-burgers-livermore.mp4',
      poster: '/clips/calikid-burgers-livermore-poster.webp',
      href: 'https://www.instagram.com/reel/DdW5SubguQ1/',
      credit: 'Filmed by @capturedbysado',
      platform: 'Instagram',
      by: 'capturedbysado',
    },
  }),
  /* Dublin • Eats */
  seed('golden-donkatsu-dublin', 'Golden Donkatsu', 'Donkatsu', 'Korean donkatsu and Korean f', '#4D4C4C', {
    icon: 'golden-donkatsu-dublin',
    tagline: 'Korean donkatsu and Korean fusion, in Dublin',
    needsSite: true,
    clip: {
      src: '/clips/golden-donkatsu-dublin.mp4',
      poster: '/clips/golden-donkatsu-dublin-poster.webp',
      href: 'https://www.instagram.com/reel/DdOwOeePuNJ/',
      credit: 'Filmed by @hungere.for.diy',
      platform: 'Instagram',
      by: 'hungere.for.diy',
    },
  }),
  /* Fremont • Eats */
  seed('katsu-factory', 'Katsu Factory', 'Katsu Factory', 'Japanese tonkatsu', '#101010', {
    icon: 'katsu-factory',
    tagline: 'Japanese tonkatsu, in Fremont',
    needsSite: true,
    clip: {
      src: '/clips/katsu-factory.mp4',
      poster: '/clips/katsu-factory-poster.webp',
      href: 'https://www.instagram.com/reel/Dcr493rMTD5/',
      credit: 'Filmed by @ugc.with.frances',
      platform: 'Instagram',
      by: 'ugc.with.frances',
    },
  }),
  /* Fremont • Eats */
  seed('wadaya-fremont', 'Wadaya', 'Wadaya', 'Japanese mazemen and ramen', '#4C4C4C', {
    icon: 'wadaya-fremont',
    tagline: 'Japanese mazemen and ramen, in Fremont',
    site: 'https://wadaya.co/',
    orderUrl: 'https://order.spoton.com/so-wadaya-mazeman-and-ramen-23846/fremont-ca/68238eb695eeea50142ed51b',
    tier: 1,
  }),
  /* Fremont • Services */
  seed('mission-hills-swim', 'Mission Hills Racquet & Swim Club', 'Mission Hills', 'Swim lessons and swim teams', '#214370', {
    icon: 'mission-hills-swim',
    tagline: 'Swim lessons and swim teams, in Fremont',
    site: 'https://www.themissionhillsclub.com/swim',
    tier: 1,
  }),
  /* Pleasanton • Services */
  seed('amp-mode', 'AMP MODE', 'AMP Mode', 'Active gaming arena with pri', '#192734', {
    icon: 'amp-mode',
    tagline: 'Active gaming arena with private game pods, in Pleasanton',
    site: 'https://goampmode.com/',
  }),
  /* Walnut Creek • Eats */
  seed('burma-2', 'Burma 2', 'Burma 2', 'Burmese', '#564A3F', {
    icon: 'burma-2',
    tagline: 'Burmese, in Walnut Creek',
    site: 'https://www.burma2.com/',
    orderUrl: 'https://order.toasttab.com/online/burma-2-1616-north-main-street',
    dietary: ['Halal-friendly'],
    offers: { welcome: '20% off when you scan the QR code on their menu and sign up with your phone number' },
  }),
  /* Brentwood • Sweets */
  seed('handels-brentwood', 'Handel\'s Homemade Ice Cream', 'Handel\'s', 'Ice cream shop', '#494B5C', {
    icon: 'handels-brentwood',
    tagline: 'Ice cream shop, in Brentwood',
    site: 'https://handelsicecream.com/store/brentwood/',
    clip: {
      src: '/clips/handels-brentwood.mp4',
      poster: '/clips/handels-brentwood-poster.webp',
      href: 'https://www.instagram.com/reel/DaT3xX1u9PY/',
      credit: 'Filmed by @jantrinanicole',
      platform: 'Instagram',
      by: 'jantrinanicole',
    },
  }),
  /* Walnut Creek • Sweets */
  seed('handels-walnut-creek', 'Handel\'s Homemade Ice Cream', 'Handel\'s', 'Ice cream shop', '#494B5C', {
    icon: 'handels-walnut-creek',
    tagline: 'Ice cream shop, in Walnut Creek',
    site: 'https://handelsicecream.com/store/walnut-creek/',
    tier: 1,
  }),
  /* Livermore • Sweets */
  seed('handels-livermore', 'Handel\'s Homemade Ice Cream', 'Handel\'s', 'Ice cream shop', '#494B5C', {
    icon: 'handels-livermore',
    tagline: 'Ice cream shop, in Livermore',
    site: 'https://handelsicecream.com/store/livermore/',
    tier: 1,
  }),
  /* Brentwood • Sweets */
  seed('johns-ice-cream', 'John\'s Ice Cream', 'John\'s', 'Ice cream shop with homemade', '#9E3635', {
    icon: 'johns-ice-cream',
    tagline: 'Ice cream shop with homemade waffle cones, in Brentwood',
    needsSite: true,
    tier: 1,
  }),
  /* Richmond • Eats */
  seed('the-burger-spot-co', 'The Burger Spot Co.', 'Burger Spot', 'Smash burgers and beef tallo', '#4C4C4C', {
    icon: 'the-burger-spot-co',
    tagline: 'Smash burgers and beef tallow fries, in Richmond',
    site: 'https://www.theburgerspotco.com/',
    orderUrl: 'https://order.spoton.com/so-the-burger-spot-co-25860/richmond-ca/690521beae71ab780d67140a',
    clip: {
      src: '/clips/the-burger-spot-co.mp4',
      poster: '/clips/the-burger-spot-co-poster.webp',
      href: 'https://www.instagram.com/reel/Dd-GqUFPqH4/',
      credit: 'Filmed by @foodandsachi',
      platform: 'Instagram',
      by: 'foodandsachi',
    },
  }),
  /* Vallejo • Eats */
  seed('buds-burgers', 'Buds Burgers', 'Bud\'s', 'Burgers', '#414D5E', {
    icon: 'buds-burgers',
    tagline: 'Burgers, in Vallejo',
    needsSite: true,
    tier: 1,
  }),
  /* Newark • Goods */
  seed('shibam-coffee-newark', 'Shibam Coffee Co.', 'Shibam', 'Yemeni coffee and desserts', '#4C4C4C', {
    icon: 'shibam-coffee-newark',
    tagline: 'Yemeni coffee and desserts, in Newark',
    needsSite: true,
    tier: 1,
  }),
  /* BEASTY • Online */
  seed('droneshow', 'Droneshow', 'Drone Show', 'Drone light shows', '#4C4C4C', {
    icon: 'droneshow',
    tagline: 'Drone light shows',
    site: 'https://www.droneshow.com',
  }),
  /* BEASTY • Online */
  seed('bottomline', 'Bottomline', 'Bottomline', 'Streetwear clothing brand', '#000000', {
    icon: 'bottomline',
    tagline: 'Streetwear clothing brand',
    site: 'https://shopbottomline.com',
    offers: { welcome: '10% off your order' },
  }),
  /* BEASTY • Online */
  seed('steves-mobile-security', 'Steve\'s Mobile Security', 'Steve\'s', 'Security screen doors and wi', '#594B30', {
    icon: 'steves-mobile-security',
    tagline: 'Security screen doors and window screens',
    site: 'https://www.stevesmobilesecurity.com',
    orderUrl: 'https://www.stevesmobilesecurity.com/request-a-quote',
  }),
  /* BEASTY • Cooks */
  seed('rye-cookin', 'Rye Cookin', 'Rye Cookin\'', 'Filipino food creator: bagoo', '#4C4C4C', {
    icon: 'rye-cookin',
    tagline: 'Filipino food creator: bagoong and merch',
    site: 'https://www.ryecookin.com',
  }),
  /* BEASTY • Meats */
  seed('nomads', 'Nomads', 'Nomads', 'Grass-fed steak jerky and be', '#251306', {
    icon: 'nomads',
    tagline: 'Grass-fed steak jerky and beef tallow',
    site: 'https://eatnomads.com',
  }),
  /* BEASTY • Sweets */
  seed('gregorys-gourmet-desserts', 'Gregory\'s Gourmet Desserts', 'Gregory\'s', 'Dessert bakery: cheesecakes,', '#030303', {
    icon: 'gregorys-gourmet-desserts',
    tagline: 'Dessert bakery: cheesecakes, cakes, pies and cobblers, in Oakland',
    site: 'https://gregorysgourmetdesserts.com',
    orderUrl: 'https://www.toasttab.com/catering/gregorys-gourmet-desserts-oakland-285-23rd-street',
    clip: {
      src: '/clips/gregorys-gourmet-desserts.mp4',
      poster: '/clips/gregorys-gourmet-desserts-poster.webp',
      href: 'https://www.instagram.com/reel/DJ5UW0ySv_n/',
      credit: 'Filmed by @takeoutwithtuck',
      platform: 'Instagram',
      by: 'takeoutwithtuck',
    },
  }),
  /* BEASTY • Services */
  seed('souva-mobile-pet-grooming', 'Souva Mobile Pet Grooming', 'Souva', 'Mobile pet grooming', '#4E4E36', {
    icon: 'souva-mobile-pet-grooming',
    tagline: 'Mobile pet grooming',
    site: 'https://www.souvagrooming.com',
    clip: {
      src: '/clips/souva-mobile-pet-grooming.mp4',
      poster: '/clips/souva-mobile-pet-grooming-poster.webp',
      href: 'https://www.instagram.com/reel/DeA2Mz4oQwx/',
      credit: 'Posted by Souva Mobile Pet Grooming',
      platform: 'Instagram',
    },
  }),
  /* BEASTY • Services */
  seed('kind-bubbles', 'Kind Bubbles', 'Kind Bubbles', 'Bubble party entertainment', '#000000', {
    icon: 'kind-bubbles',
    tagline: 'Bubble party entertainment',
    site: 'https://www.kindbubbles.com',
    orderUrl: 'https://www.kindbubbles.com/book-now',
  }),
  /* BEASTY • Services */
  seed('precision-auto-service', 'Precision Auto Service', 'Precision', 'Auto service shop, muscle ca', '#624644', {
    icon: 'precision-auto-service',
    tagline: 'Auto service shop, muscle cars',
    needsSite: true,
  }),
  /*
    BATCH 43, 2026-10-06: Glenn's links of 5 and 6 October
    (research/roster/batch43.json, built by build43.py). A yellow-sheet
    business he sent a film for gets the whole page; the rest of the yellow
    sheet is the free Tier 1 listing.
  */
  /* Walnut Creek • Eats */
  seed('hakashi-sushi-bar', 'Hakashi Sushi Bar & Grill', 'Hakashi', 'Sushi and Japanese kitchen', '#000000', {
    icon: 'hakashi-sushi-bar',
    tagline: 'Sushi and Japanese kitchen, in Walnut Creek',
    site: 'https://www.hakashisushibar.com/',
    tier: 1,
  }),
  /* San Jose • Eats */
  seed('ginza-sushi', 'Ginza Sushi', 'Ginza Sushi', 'Sushi and Japanese', '#4C4C4C', {
    icon: 'ginza-sushi',
    tagline: 'Sushi and Japanese, in San Jose',
    site: 'https://sushimakesuhappy.com/',
    orderUrl: 'https://order.toasttab.com/online/ginzasushisj',
    tier: 1,
  }),
  /* Martinez • Eats */
  seed('tacos-don-chai', 'Tacos Don Chai', 'Don Chai', 'Mexican, brisket birria', '#000000', {
    icon: 'tacos-don-chai',
    tagline: 'Mexican, brisket birria, in Martinez',
    site: 'https://tacosdonchai.com/',
    orderUrl: 'https://tacosdonchai.com/menu',
    clip: {
      src: '/clips/tacos-don-chai.mp4',
      poster: '/clips/tacos-don-chai-poster.webp',
      href: 'https://www.instagram.com/reel/DeH-BvAyDIb/',
      credit: 'Posted by Tacos Don Chai',
      platform: 'Instagram',
    },
  }),
  /* BEASTY • Coffee */
  seed('kiyomi-ca-phe', 'Kiyomi Cà Phê', 'Kiyomi', 'Vietnamese coffee', '#4C4C4C', {
    icon: 'kiyomi-ca-phe',
    tagline: 'Vietnamese coffee, matcha and brunch, in San Francisco',
    needsSite: true,
    clip: {
      src: '/clips/kiyomi-ca-phe.mp4',
      poster: '/clips/kiyomi-ca-phe-poster.webp',
      href: 'https://www.instagram.com/reel/DeJOlPgvkkA/',
      credit: 'Posted by Kiyomi Cà Phê',
      platform: 'Instagram',
    },
  }),
  /* BEASTY • Food Truck */
  seed('vostok-shawarma', 'Vostok gyro & shawarma', 'Vostok', 'Halal shawarma food truck', '#4C4C4C', {
    icon: 'vostok-shawarma',
    tagline: 'Halal shawarma and Central Asian food truck',
    needsSite: true,
    dietary: ['Halal-friendly'],
    panels: [
      {
        head: 'Where to find them',
        body: [
          '36 Washington St, Santa Clara, CA, (408) 690-6916, Mon-Sun 12pm-11pm',
          '98 Franklin St, San Francisco, CA, (415) 850-2171, Mon-Sat 11am-8pm',
        ],
      },
    ],
  }),
  /* Hayward • Services */
  seed('snatched-by-chinita', 'Snatched by Chinita', 'Snatched', 'Post-op care and sculpting', '#4C4C4C', {
    icon: 'snatched-by-chinita',
    tagline: 'Post-op care and body sculpting, in Hayward',
    needsSite: true,
  }),
  /* San Francisco • Sweets (multiple locations) */
  seed('sidewalk-juice', 'Sidewalk Juice', 'Sidewalk', 'Juice bar and smoothies', '#4C4C4C', {
    icon: 'sidewalk-juice',
    tagline: 'Juice bar, smoothies and acai bowls, in San Francisco',
    site: 'https://sidewalkjuice.com/',
    orderUrl: 'https://order.sidewalkjuice.com/order',
  }),
]

/**
 * His numbered spots, as slot indexes on the flagship pages. `null` is a spot
 * nobody holds by hand.
 *
 * Names that map to brands the app already has use the EXISTING id — the
 * roster never forks a second copy of a researched business.
 *
 * BEASTY • EATS SINCE 2026-10-05 is one restaurant per cuisine, in Glenn's
 * order (EATS_CATEGORIES in slots.ts), seats `beasty-eats-N`. His picks moved
 * to their cuisine; where two shared one, the glowing tile kept it ("every
 * glowing tile on page one", 2026-09-21) and the other went to More eats, as
 * he said: "Any forgotten varieties of food will push over to the second
 * yellow pages". Open spots fill with the first business that fits
 * (categorySeats.ts). Off this page that day: Cravingz, Butter Pecan and
 * Meadowlark to BEASTY • Sweets, Midnite Theories to BEASTY • Goods, Jazz
 * Braids to BEASTY • Salons ("move midnight theories and jazz braids off of
 * the eats page onto their appropriate category", 2026-09-30), and Rain's
 * Plates, Glasshouzz, Bread Winners, Winky Dinky Dogs and Lovely's to More
 * eats (placements.ts).
 */
export const BEASTY_EATS_ROSTER: (string | null)[] = [
  'b_downtownbbq', //          1  BBQ
  'b_belly', //                2  Korean
  null, //                     3  Chinese
  'b_harumiayce', //           4  Sushi
  'b_masa', //                 5  Mexican
  'b_lumpiacompany', //        6  Filipino food
  'b_pippal', //               7  Indian food
  null, //                     8  Greek food
  null, //                     9  Italian food
  null, //                     10 French cuisine
  /* "Hey bro, can you put this on the open spots on BEASTY • Eats page?" —
     Glenn, 2026-10-21, 5:18 pm, with Empire State's own page. Udon and
     Jamaican were the two spots nobody filled; Pizza is King's and Italian is
     The Great Impasta's, so it takes the first open one. Its tile shows its
     own name; a later udon shop goes to More eats. */
  'b_empirestatepizza', //     11 Udon (open spot)
  'b_gaovietkitchen', //       12 Pho
  null, //                     13 Ramen
  'b_bulapies', //             14 Fijian food
  /* "I like how this turned out. Can you bump them to BEASTY • Eats page in the
     empty spot?" — Glenn, 2026-10-24, 8:04 pm, with The Yard's page. Jamaican
     was the one spot nobody filled (the Empire State precedent): its tile shows
     its own name, and a later Jamaican kitchen goes to More eats. */
  'b_theyardbrentwood', //     15 Jamaican food (open spot)
  'b_chefjeffssmashburger', // 16 Burger
  'b_hotboyschicken', //       17 Chicken sandwich
  'b_thelocalpetaluma', //     18 Sandwiches (The Local's glow; Bread Winners to More eats)
  'b_banhmioven', //           19 Banh mi (up from More eats)
  null, //                     20 Steakhouse
  null, //                     21 Hot pot
  /* "Bump Nossa onto BEASTY • Eats page" — 2026-10-02. A lounge known for its
     sliders and wings, so the fried chicken spot. */
  'b_nossooakland', //         22 Fried chicken
  'b_topdog', //               23 Hot dogs
  'b_kingswcpizza', //         24 Pizza (up from More eats)
]
/**
 * BEASTY • Sweets, seated by hand: the three dessert shops that were on Eats,
 * at their kind's spot (SWEETS_CATEGORIES). "Move Meadowlark onto BEASTY •
 * Sweets page" — 2026-10-02.
 */
export const BEASTY_SWEETS_ROSTER: Record<number, string> = {
  3: 'b_cravingz', //          Ice cream
  6: 'b_butterpecan', //       Cookies
  17: 'b_meadowlarkdairy', //  Soft serve
}
export const BEASTY_SERVICES_ROSTER: (string | null)[] = [
  'b_dingdongtogo', //          1  Ding DongToGo
  /* "You can bump Roman Iron to the yellow pages for her", 2026-09-22: Roman
     Trailer & Iron Work moves to the yellow sheet (data/placements.ts) and
     Janelle's sister's business takes the seat. */
  'b_thebeaudegabymaine', //    2  The BeauDega by Maine (was Roman Trailer & Iron work)
  'b_luckybarbershop', //       3  Lucky barbershop
  'b_poddtg', //                4  POD DTG
  /* "Bump Bust down Billy's page to BEASTY • Services & bump Frank Jr. to yellow
     pages", 2026-09-30: Bust Down & Co. from BEASTY • Eats 24, Frank Jr. English
     to the yellow sheet (data/placements.ts). */
  'b_bustdowncobeasty', //      5  Bust Down & Co. (was Frank Jr. English)
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
  /* "Can you also remove the vending enterprise and give it its own spot on
     BEASTY • Services" / "You can bump Dr. comics", 2026-09-21. It came off
     Janelle's page, where it was her link, and off the Online sheet, which is
     for brands that ship; Dr. Comics and Mr. Games went to the yellow sheet
     in data/placements.ts. */
  'b_vendingenterprise', //     16 Vending Enterprise (was Dr. Comics and Mr. Games)
  'b_rosebarycarcare', //       17 Rosebary Car Care
  'b_highscores', //            18 High Scores arcade
  /* His #19 repeated Ding DongToGo, already seated at #1, and was left open
     until he named a different business for it. He did, on 2026-08-18: "Move
     LOL catering to BEASTY Services". */
  'b_lolcatering', //           19 LOL Catering
  /* "Bump AS to yellow pages", 2026-08-26. Andrew Shin moves to the yellow
     sheet and No Last Call takes the seat — which is the event coordinator
     spot, and a mobile bar for weddings is what that spot is for. An injury
     attorney was never the trade this number sells. */
  'b_nolastcallbartending', //  20 NO LAST CALL Bartending
  'b_winterwhitecarwash', //    21 Winter White mobile Car Wash
  /* "You can bump ic to yellow pages" — Inter Chiro moved to the yellow sheet
     and Frank2Artistic takes the seat it leaves. */
  'b_frank2artistic', //        22 Frank2Artistic
  /* "You can bump George Landscape to the yellow page", 2026-09-24: Ezra
     Luz Johns takes the seat; George is on the yellow sheet in placements.ts. */
  'b_ezraluzjohns', //          23 Ezra Luz Johns (was George Professional Landscape)
  /* Rene Custom Cabinetry was here and is GONE — "bump out Rene and complete
     remove him. He's not ready." Removed rather than benched: a seat held for
     somebody who is not coming is a spot he cannot sell. Rywire takes it. */
  'b_rywire', //                24 Rywire
]
