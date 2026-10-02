/**
 * The cities the operator is opening in, in his order.
 *
 * Plain data in its own module, deliberately. It used to live in
 * apps/registry.tsx, and the landing page imported it from there just to print
 * a count — which dragged the registry, every app icon, the glyph set and the
 * whole brand catalogue into the first response, for one number.
 *
 * Each of these gets a home-screen page that starts EMPTY: a grid of blank
 * tiles waiting for the businesses recruited there. A city page with nothing on
 * it is an honest statement that nobody has signed up yet, and it is the thing
 * he shows a prospective business to say "this space is yours".
 *
 * The rest of his list — Hercules, Daly City, Pittsburg, Oakley — goes in here
 * when he says. Hayward came off this line on 2026-08-30 ("Forgot your own city
 * bro"); the others had already been built and were left listed here as though
 * they had not been.
 */
export const CITY_PAGES = [
  'Oakland',
  'Richmond',
  'Berkeley',
  'Albany',
  'Concord',
  'San Jose',
  'Livermore',
  'Antioch',
  'Brentwood',
  /*
    The South Bay and Peninsula run, added from the operator's own landmark
    list: Shoreline for Mountain View, Great America for Santa Clara, Hoover
    Tower for Palo Alto. None of them has a photograph on disk yet, so each
    draws the neutral placeholder rather than another city's landmark — see
    ios/Wallpaper.tsx.
  */
  'Sunnyvale',
  'Cupertino',
  'Santa Clara',
  'Mountain View',
  'Palo Alto',
  'Saratoga',
  'Redwood City',
  'San Mateo',
  /*
    The second wave, from the operator's own placements: Vallejo (The Grind
    Café, Bula Pies), Benicia, Walnut Creek and Pleasant Hill (The Hangout, Pet
    Butler's territory), Napa (The Model Bakery), Petaluma (Town Futurist).
    None has a photograph yet except Walnut Creek, so the rest draw the neutral
    placeholder rather than another city's landmark.
  */
  'Vallejo',
  'Benicia',
  'Walnut Creek',
  'Pleasant Hill',
  'Napa',
  'Petaluma',
  /* Larb Thai's home, sent 2026-08-10 — and uBreakiFix's nearest store
     already sat here waiting for the page to exist. */
  'El Cerrito',
  /*
    The 2026-08-11 run, each one opened by a business the operator sent with
    the city already written next to it: Mimi's Chocolates for Dublin, One
    House Bistro for San Ramon, Majestic Boutique for Crockett, INTL Kitchen
    for Milpitas, Banh Mi Xpress and Emy's Cannoli for Vacaville.

    Dublin also closes an open loop. Pippāl has been seated at dublin-goods-3
    since his earlier list, on a key that resolved to nothing because the city
    had no page — the placement was left in deliberately, waiting for exactly
    this. It renders from today.

    He sent landmark photographs for Vacaville (the Nut Tree) and Crockett (the
    C&H sugar refinery); neither is on disk yet, so both draw the neutral
    placeholder rather than another town's landmark.
  */
  'Dublin',
  'San Ramon',
  'Crockett',
  'Milpitas',
  'Vacaville',
  /*
    The 2026-08-12 run — a single evening in which his Instagram algorithm,
    in his words, "is just giving me exactly what I need". Six more cities,
    each opened by a business he sent with the city written beside the link:
    Polly Ann and House of Thai for San Francisco, Lavanta and Kaisen Don for
    San Leandro, The Sandwich Monkey for Foster City, Bober Tea for Martinez,
    Great Impasta for Danville, Sola Salons for Pleasanton.

    San Francisco is a city page now as well as the fallback wallpaper. Those
    are different jobs and it is worth being clear they do not collide: the
    Golden Gate is what someone sees when we do NOT know their city, and it
    goes on being that. This just means the Bay's biggest city can finally hold
    businesses of its own rather than only standing in for everywhere else.
  */
  'San Francisco',
  'San Leandro',
  'Pleasanton',
  'Foster City',
  'Martinez',
  'Danville',
  /*
    2026-08-13: Kabab Burger opens Lafayette and Sweet Pipers opens Pinole.
    Orinda arrived as a landmark link with no business behind it yet — a page
    he wants ready rather than a spot he has sold, which is exactly what an
    empty city page is for.

    Pinole finally comes off the "the rest of his list" line in the note above,
    where it has sat since this file was written.
  */
  'Lafayette',
  'Orinda',
  'Pinole',
  /*
    THE FIRST CITY OUTSIDE THE BAY AREA, and outside California.

    Every other page on this list is within about an hour of Richmond, which is
    what made "the Bay Area cities on Glenn's list" a true sentence. It is not
    one any more, and the copy that said it has been changed rather than left to
    quietly mislead a business owner reading it in Nevada.
  */
  'Las Vegas',
  /*
    2026-08-18. Four opened in one message, three of them by a business he
    asked to have moved onto a page that did not exist yet: Hybrid Workz to
    Fremont, Baked Blooms to San Rafael, Alli's Dog Walking to Philadelphia.

    San Pablo is his cousin's — Magic Juan's Barbershop, at 12246 San Pablo
    Ave. The shop's own address is in RICHMOND, and Richmond already has a
    page; he asked for San Pablo anyway ("would you mind putting him on his
    own city of San Pablo, CA"), which is his call to make about how he sells
    the street. The address on the business's page stays the real one.

    Philadelphia is the second city outside the Bay Area and the second
    outside California — see the note on Las Vegas above.
  */
  'Fremont',
  'San Rafael',
  'San Pablo',
  'Philadelphia',
  /*
    American Canyon, opened 2026-08-21 by Forno Piombo — "BEASTY • More Goods
    and American Canyon city", with their address at 120 Klamath Ct. Napa
    County's southern end, and the fourth city opened by one business arriving
    with a place written beside it.
  */
  'American Canyon',
  /*
    Newark, opened 2026-08-21 by Almas Auto & Tires — he sent their profile with
    "Needs website updated" and a search for a Newark landmark in the same
    minute, which is how a city gets opened here.
  */
  'Newark',
  /*
    Castro Valley and Santa Rosa, 2026-08-21. Castro Valley came with Classy
    Canine's Wiggle Rumps and its own landmark link; Santa Rosa he simply named
    as a page — "Santa Rosa • services" — for Camacho's Party Rentals, which is
    the first business to open a city here without him sending a wallpaper for
    it.
  */
  'Castro Valley',
  'Santa Rosa',
  /*
    Fairfield, opened 2026-08-21 by Boudreaux Cajun Steak House — "Fairfield •
    Goods". The operator delivers for their food truck every other week.
  */
  'Fairfield',
  /*
    Oakley, opened 2026-08-22 by Bay Area Power Wash Pros. He first said BEASTY
    • Services and corrected himself a minute later — "actually Oakley •
    Services rather".
  */
  'Oakley',
  /*
    ARIZONA — the second region, not more of the first.

    "All Arizona cities to create ASAP", his note, in his order: the Phoenix
    metro from the centre outwards. He is talking to Bernie about running it,
    and wants "a website release simultaneous from the Bay Area and AZ", so
    these are pages he needs ready rather than spots already sold.

    Every one is empty on purpose. Not one of them has a business yet, and an
    empty numbered page is exactly what he sells from — 48 spots with nobody in
    them is the pitch, not a gap.
  */
  'Phoenix',
  'Scottsdale',
  'Tempe',
  'Mesa',
  'Surprise',
  'Goodyear',
  'Chandler',
  'Glendale',
  /*
    Sacramento, 2026-08-19, opened by 1-Up Retro on J Street. He met a friend in
    Folsom the same week who "might be in charge of recruiting all of Sacramento
    & Folsom area when we're ready to launch" — this is the first seat in that
    region rather than a page held open for it.
  */
  'Sacramento',
  /* Folsom, sent with Sacramento the same minute — the two his Folsom friend
     may end up recruiting together. */
  'Folsom',
  /*
    PITTSBURG, and it is spelled without the h.

    He wrote "BEASTY • Pittsburgh" twice on 2026-08-23, sending two businesses
    that both "need a proper website" — and there was no page for either to land
    on, so both asks sat unactioned for four days. The California city is
    Pittsburg; Pittsburgh is Pennsylvania. Spelled correctly here because the
    page heading is what a business in that city reads.
  */
  'Pittsburg',
  /*
    ALAMEDA, 2026-08-28, opened by Bay Area Brew Boat — the cycleboat sails from
    Marina Village and he filed it "Alameda • Services", which had nowhere to
    land until now.
  */
  'Alameda',
  /*
    DALY CITY, 2026-08-27, opened by Kings WC Pizza. His note, and it is the
    reason he remembered it: "Totally forgot about the city. This is the
    Filipino capital of the world. Every morning it's foggy in this city because
    all the families are cooking their rice."
  */
  'Daly City',
  /*
    ROHNERT PARK, 2026-08-28, opened by Fours Media. Sonoma County, and the
    first city on this list north of the Golden Gate — the network's shape has
    been East Bay and Peninsula until now.
  */
  'Rohnert Park',
  /*
    THE PENINSULA RUN, 2026-08-28. Seven landmark searches in seven minutes —
    Pacifica, San Bruno, South San Francisco, Burlingame, Menlo Park, Los Gatos,
    Sausalito — and then the businesses that explain them: Pacific Pet Grooming
    parks its salon bus in five of these, and Mcar has shops in two.

    None has a photograph on disk on the day it is added, so each draws the
    neutral placeholder rather than another city's landmark. Every one of his
    seven links pointed at copyrighted stock — TripAdvisor, Dreamstime, Getty
    via Canva, simpleview — so the subjects are his and the files, when they
    land, come from somewhere the licence survives a commercial product. See
    public/wallpapers/CREDITS.md, which has said the same thing since Vallejo.
  */
  'Pacifica',
  'San Bruno',
  'South San Francisco',
  'Burlingame',
  'Menlo Park',
  'Los Gatos',
  'Sausalito',
  /* BELMONT, 2026-08-29, opened by Vale Nails — and he sent a Belmont landmark
     search in the same breath, so a wallpaper is expected. Mcar's third shop is
     here too, on Harbor Boulevard. */
  'Belmont',
  /* UNION CITY, 2026-08-29, opened by Firebunz. There is a union-city
     wallpaper on disk already — it was built before the city page existed. */
  'Union City',
  /*
    2026-08-30, and this run is FIVE LANDMARK LINKS AND NO BUSINESSES — pages
    he wants standing before he sells into them, which is what an empty city
    page is for. He opened with "Forgot your own city bro" over a Hayward
    search, and Hayward has indeed been sitting unbuilt on the "rest of his
    list" line at the top of this file since the day it was written. It comes
    off that line here.

    TWO OF THESE ARE NEIGHBOURHOODS, NOT CITIES. West Oakland is in Oakland and
    North Berkeley is in Berkeley, and both of those already have their own
    page — so a business in either will now see two pages it could belong to.
    That is the San Pablo decision again: he asked for it, how he sells a
    street is his call, and a business's own page still carries its real
    address. Worth him knowing the overlap exists rather than discovering it
    when the same shop turns up twice.

    No photograph is on disk for any of the five, so each draws the neutral
    placeholder rather than another town's landmark. All five of his links
    pointed at material somebody else owns — the city's own site for Hayward,
    Pixar Post for the Emeryville studio sign, Expedia for Piedmont, the
    Chronicle for West Oakland, a travel blog for North Berkeley — so the
    subjects are his and the files, when they land, come from somewhere the
    licence survives a commercial product. See public/wallpapers/CREDITS.md.
  */
  /*
    2026-09-03, from the shop rounds: San Lorenzo for Ruben Hibachi Grill
    ("Definitely needs a website · San Lorenzo • Goods") and Alamo for The
    Tox ("Alamo • Services"). His San Lorenzo link was a homes.com listing
    photo, somebody else's; both wallpapers are Commons aerials of the
    places themselves, licensed — see public/wallpapers/CREDITS.md.
  */
  'San Lorenzo',
  'Alamo',
  /*
    2026-09-03, afternoon: "Sorry lots of important Cities that slipped my
    mind" — Hercules, Rodeo, Crockett and Point Richmond, each with a landmark
    link. Crockett already had a page. Hercules comes off the "rest of his
    list" line at last. POINT RICHMOND IS A NEIGHBOURHOOD OF RICHMOND, which
    has its own page — the West Oakland decision again: he asked for it, and a
    business's page still carries its real address. Photographs: Commons, the
    subjects his — Refugio Valley Park is exactly what his Hercules link
    showed. See public/wallpapers/CREDITS.md.
  */
  'Hercules',
  'Rodeo',
  'Point Richmond',
  'Hayward',
  'Emeryville',
  'Penngrove',
  'Piedmont',
  'West Oakland',
  'North Berkeley',
  /*
    SUNOL, for Elliston Vineyards — the winery he delivers to weekly and wants
    "to lock in". He sent it with no city beside it, which is unusual for him,
    and their own address is 463 Kilkare Rd, Sunol. They describe themselves as
    in "the historic Livermore Valley Wine Country" and Livermore has had a
    page since the first run, so the temptation was to seat them there. Their
    address is what a customer navigates to, so Sunol gets the page.
  */
  'Sunol',
  /*
    2026-09-08, evening: 7 Mile House, "Brisbane • Goods", opens Brisbane. His
    landmark link was a hotel photograph off TripAdvisor, not ours to use; the
    wallpaper is Sierra Point and the marina from Commons, the same corner of
    town — see public/wallpapers/CREDITS.md.
  */
  'Brisbane',
  // Phở Hà Nội’s published location, sent by Glenn on 2026-10-02.
  'Fountain Valley',
] as const
