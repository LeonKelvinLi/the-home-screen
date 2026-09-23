/**
 * Which businesses have actually taken a numbered spot on a city page.
 *
 * Until now every tile on every city page was an empty outline, because none of
 * them had been claimed. This is the map that fills one in: a slot key on the
 * left, the brand that sits there on the right. It is the whole point of
 * numbering the spots — a business is pitched "the number 18 spot in Las Vegas"
 * and this is where that promise becomes a tile.
 *
 * THE KEY MUST MATCH THE SLOT ID EXACTLY, minus the `slot.` prefix:
 * `<city-slug>-<goods|services>-<zero-based index>`. The index is the position
 * in the category list, NOT the `n` the operator uses — his number 18 is index
 * 17. Getting that wrong seats a business in the wrong category's tile, so
 * there is a test below the map that refuses to let it happen quietly.
 *
 * A placement is a CLAIM THAT A BUSINESS BELONGS IN THAT SPOT — and the
 * strength of that claim now differs by source, which this file used to
 * pretend it did not.
 *
 * Two kinds live here. A RESEARCHED partner seated in its own city is seated
 * on its own published address: Tequila's in Livermore because Livermore is
 * where their menu says they are. A ROSTER seat comes from the operator's
 * numbered list and means only that HE has put them there — most have agreed
 * nothing, which is why every one of their pages says he is still gathering
 * their details and why none of them carries the business's real artwork.
 *
 * The distinction matters because the product sells a numbered spot as taken.
 * It must stay visible in the data rather than being smoothed into one word,
 * and a seat must never be dressed up as more than its source supports.
 */

import { BEASTY_GOODS_ROSTER, BEASTY_SERVICES_ROSTER } from './roster'

/*
  The flagship pages are DERIVED from the roster arrays rather than typed out
  again — his numbered list is the single source of which business sits in
  which spot, and a hand-copied duplicate here is exactly the kind of pair
  that drifts.
*/
const flagship: Record<string, string> = {}
BEASTY_GOODS_ROSTER.forEach((id, i) => {
  if (id) flagship[`beasty-goods-${i}`] = id
})
BEASTY_SERVICES_ROSTER.forEach((id, i) => {
  if (id) flagship[`beasty-services-${i}`] = id
})

/** Slot key (no `slot.` prefix) to the brand id that has taken it. */
export const CITY_PLACEMENTS: Record<string, string> = {
  ...flagship,

  /*
    Sin City Pits, in the dog spot on the Las Vegas goods page.

    Index 17 is the operator's number 18, "Dog boutique and breeder". A kennel
    is not a boutique, which is why that category's full name was widened rather
    than the breeder being filed under something it is not — and widening the
    name keeps every other spot's number where it was. Renumbering the list
    would have moved every tile in every city to fix one.
  */
  'las-vegas-goods-17': 'b_sincitypits',

  /*
    Researched partners seated in their own cities, each in the category the
    operator's taxonomy gives them. A seat is a claim the business is in that
    city, which for these comes from their own published address.
  */
  'livermore-goods-1': 'b_tequilastaqueria', //   Mexican
  'livermore-goods-5': 'b_glasshouzz', //         Italian (pizza)
  'san-jose-goods-8': 'b_jojoshotchicken', //     Wings
  'brentwood-goods-0': 'b_theyardbrentwood', //   Burgers
  'sunnyvale-goods-11': 'b_jonnysitalianice', //  Ice cream
  /* Pippāl's seat was a dead key for weeks: Dublin was on the operator's
     expansion list but had no page, so this resolved to nothing. It was left in
     deliberately rather than deleted, on the grounds that it would be correct
     the day Dublin got a page. Mimi's Chocolates brought that day on
     2026-08-11, and this has rendered ever since. */
  'dublin-goods-3': 'b_pippal', //                Indian
  'vallejo-goods-13': 'b_grindcafe707', //        Coffee

  /* The operator's own city placements from his messages, seated where his
     renamed categories put them. */
  'brentwood-services-7': 'b_jdiautodetailing', //   Detailer
  'berkeley-services-7': 'b_jnwdetailing', //        Detailer
  'concord-services-7': 'b_diabloautodetailing', //  Detailer
  'berkeley-services-19': 'b_perfectnineevents', //  Events
  'brentwood-goods-2': 'b_xnoodledumpling', //       Asian
  'napa-goods-12': 'b_themodelbakery', //            Bakery
  'el-cerrito-goods-2': 'b_larbthaitapas', //        Asian
  /* uBreakiFix's own locator puts their nearest store at El Cerrito Plaza —
     seated the moment the city page existed. Phone fix is its category. */
  'el-cerrito-services-8': 'b_ubreakifix',
  'petaluma-services-12': 'b_townfuturistmedia', //  Photo/Video — a video production house

  /*
    The 2026-08-11 run. Each of these came with its city and page already
    written beside the link, so the city and the page are HIS; only the
    numbered spot within the page is a reading of his own category list.
  */
  'san-mateo-goods-2': 'b_phodenguyen', //        Asian — a pho house
  'milpitas-goods-2': 'b_intlkitchen', //         Asian — takeout, per their own mark
  'walnut-creek-goods-10': 'b_maymayscravings', //Filipino
  'vacaville-goods-6': 'b_banhmixpress', //       Sandwiches — a banh mi shop
  'vacaville-goods-12': 'b_emyscannoli', //       Bakery
  'benicia-goods-0': 'b_beniciagrill', //         Burgers and hot dogs — an American grill
  'crockett-goods-19': 'b_majesticboutique', //   Clothing brand or boutique
  /* Sent 2026-08-12, on their own published address on Grand Ave. */
  'oakland-goods-14': 'b_suptealab', //           Boba shop

  /*
    The 2026-08-12 run. Six cities opened with it — San Francisco, San Leandro,
    Pleasanton, Foster City, Martinez and Danville — each by a business he sent
    with the city already written beside the link.
  */
  'san-francisco-goods-2': 'b_houseofthai', //    Asian — a Thai kitchen on Larkin
  'san-francisco-goods-11': 'b_pollyann', //      Ice cream
  'san-francisco-goods-12': 'b_udessertstory', // Bakery — a dessert shop
  'san-leandro-goods-4': 'b_kaisendon', //        Sushi
  'san-leandro-goods-9': 'b_lavanta', //          Mediterranean
  'berkeley-goods-1': 'b_soltaqueria', //         Mexican
  'benicia-goods-12': 'b_onehousebakery', //      Bakery
  'foster-city-goods-6': 'b_sandwichmonkey', //   Sandwiches
  'oakland-goods-10': 'b_senorsisig', //          Filipino
  'oakland-goods-13': 'b_jollycafe', //           Coffee
  'oakland-goods-16': 'b_donutfarm', //           Donuts
  'walnut-creek-goods-11': 'b_milkyflakes', //    Ice cream
  'martinez-goods-14': 'b_bobertea', //           Boba
  'redwood-city-goods-5': 'b_pizzeriacardamomo', // Italian
  'danville-goods-5': 'b_greatimpasta', //        Italian
  'brentwood-goods-3': 'b_chutneys', //           Indian
  'concord-goods-12': 'b_frenchspot', //          Bakery
  'walnut-creek-services-15': 'b_joybound', //    Veterinary clinic
  'san-ramon-services-2': 'b_bodylinesdayspa', // Massage and spa
  'pleasanton-services-0': 'b_solasalons', //     Barber and salon

  /*
    2026-08-18. Five moves off the system page, each with the city and the page
    written next to it in his own message, plus his cousin's shop opening San
    Pablo. Moving them here is what takes them OFF that page: the grid draws
    every brand WITHOUT a seat, so a placement is the removal.
  */
  'fremont-services-5': 'b_hybridworkz', //        Mechanics and smog — "Toyota hybrid service"
  'san-rafael-goods-12': 'b_bakedblooms', //       Bakery
  'richmond-goods-11': 'b_wafflescream', //        Ice cream shop
  'richmond-goods-14': 'b_boba', //                Boba shop
  /* Dog walking, on the spot widened from "Pet grooming" to hold it — see
     data/slots.ts. Philadelphia exists as a page from today. */
  'philadelphia-services-14': 'b_allisdogwalking', // Pet grooming and walking
  /* Magic Juan's, the operator's cousin. Seated in San Pablo at his request;
     the shop's real address is in Richmond and its page shows that. */
  'san-pablo-services-0': 'b_magicjuans', //       Barber and salon
  /*
    Noctilucente onto the BEASTY services sheet, on "feel free to move your app
    to BEASTY • Services". The numbered Services page had exactly one opening
    (#19) and LOL Catering took it, so this lands on the yellow sheet behind
    it — the nearest seat to what he asked for. Say the word and they swap.
  */
  'beasty-services2-5': 'b_noctilucente',
  /*
    Curio joins it, which is what finally empties the system page.

    His two sentences are "feel free to move your app to BEASTY • Services" and
    "you can eliminate your website since your working under BEASTYdesigns", and
    BOTH of Leon's tiles could be either one: Curio is literally an app, and
    Noctilucente is the studio with the website. Rather than guess which is
    moved and which is deleted, both move and neither is deleted — the page ends
    up empty either way, and nothing that would have to be rebuilt is thrown
    away on a coin flip. One word from him settles it.
  */
  'beasty-services2-6': 'b_curio',
  /*
    The 02:47-03:03 run, three more businesses with the page written under each.

    Stella Pastry takes ITALIAN rather than Bakery: San Francisco's bakery spot
    is already U Dessert Story's, and Stella describes itself as authentic
    Italian pastry, so the spot it does fit is on the page he named.
  */
  'san-francisco-goods-5': 'b_stellapastry', //       Italian
  'san-francisco-services-12': 'b_isnappedphotobooths', // Photo and video — mobile
  /* Jenuine Fitness onto the BEASTY services sheet, the page he named. The
     numbered page is full, so this is the yellow sheet behind it. */
  'beasty-services2-7': 'b_jenuinefitness',

  /*
    2026-08-19. Three new city seats, and the two he asked to be bumped onto
    the yellow sheets — "can you bump SMASH burgers into the more goods space"
    and "you can bump ic to yellow pages".
  */
  'benicia-goods-14': 'b_quicklybenicia', //   Boba shop
  'richmond-goods-2': 'b_salathai', //         Asian food
  'brentwood-goods-10': 'b_houseofsilog', //   Filipino food
  'beasty-goods2-4': 'b_smashburgersbros',
  'beasty-services2-8': 'b_interchiro',
  /* 1-Up Retro opens Sacramento. Toy shop is the closest of his 24 — a game
     store is not on the list, and widening a category for one seat would
     renumber a page he sells by number. */
  'sacramento-goods-23': 'b_1upretro', //      Toy shop
  'berkeley-goods-11': 'b_scoopnchill', //     Ice cream shop
  'oakland-goods-1': 'b_alpastorpapi', //      Mexican food
  /*
    Bay Area Charters into Richmond too, on "add it to Richmond • Services" —
    and Richmond is where they actually are, 3150 Hilltop Mall Rd. Event
    coordinator is the nearest of the 24: group transport for events is what
    they sell, and there is no transport spot on his list. They keep the San
    Francisco seat from an earlier instruction, which is now the odd one out
    given their address — worth a word with him.
  */
  'richmond-services-19': 'b_bayareacharters', // Event coordinator
  /*
    Rockin' Jump into Concord, where their park is. NOT the Gym spot — Urban
    Air already has it on exactly the same reasoning, and two adventure parks
    cannot share one numbered seat. Event coordinator is the better fit anyway:
    their own page leads with Book a Party.
  */
  'concord-services-19': 'b_rocknjump', //     Event coordinator
  /* PaintGo into Vallejo, where their shop is. Auto detailing rather than the
     painting trades — theirs is paint and coating on cars, which is the half
     of the name that was being misread. */
  'vallejo-services-7': 'b_paintgo', //        Auto detailing

  /*
    His friend's six, on the flagship yellow sheets by his own instruction:
    "place them all on the yellow pages of BEASTY • Goods & Services."

    Also the honest place for them. He gave no city for any of these, and a
    numbered city spot is a claim that a business is IN that city — the yellow
    sheets claim nothing but that they are on his list.
  */
  'beasty-goods2-0': 'b_santaclarasuperkitchen',
  'beasty-goods2-1': 'b_willybillysmokedmeat',
  'beasty-goods2-2': 'b_redchili',
  'beasty-goods2-3': 'b_banhmioven',
  'beasty-services2-1': 'b_adzeela',
  'beasty-services2-2': 'b_allyvirtual',
  /* "Mobile Bay Area", his words — no city, so no city page. */
  'beasty-services2-3': 'b_eaglepetgrooming',

  /* ---- 2026-08-16 ---- */
  /* No city — "it's a mobile service covering the Bay Area", his words. */
  'beasty-services2-4': 'b_rocketmctow',
  /*
    Neither has a category on his list. Chiquo & Eva's is a Wagyu steakhouse and
    Benicia's only American-shaped spot is already Benicia Grill; Cajun Crack N
    is a seafood boil and there is no seafood on the page at all. Yellow sheets
    rather than a wrong label, same as Eight Acres and Las Lomas — and his to
    move if he would rather they were on page one.
  */
  'benicia-goods2-0': 'b_chiquoandeva',
  'concord-goods2-0': 'b_cajuncrackn',

  /* ---- 2026-08-15 ---- */
  'san-jose-services-19': 'b_bloomballoon', //    Events — balloon design for parties
  'san-francisco-goods-8': 'b_brasabros', //      Wings — Peruvian rotisserie chicken

  /*
    Yes Moment is an Event Planner by their own bio and Events is exactly its
    category — but San Francisco's Events spot is Bay Area Charters, which the
    operator asked for by name and wanted to show the owner. Rather than move
    his friend's business to make room, the proposal planner takes the yellow
    sheet, where it is on the city's pages and reachable. His call to swap them
    if he would rather.
  */
  'san-francisco-services2-0': 'b_yesmoment',


  'pleasanton-goods-5': 'b_gayninetiespizza', // Italian — pizza and pasta

  /* ---- 2026-08-14 ---- */
  /* His best friend's business, and he asked for it in both places. */
  'san-francisco-services-19': 'b_bayareacharters', // Events
  /* Displaced from the BEASTY services page by Bay Area Charters, and given a
     page of its own rather than dropped — his instruction, verbatim. */
  'el-cerrito-services-6': 'b_hightechcaraudio', //   Car audio

  'concord-goods-14': 'b_breaktimetea', //            Boba
  'vallejo-goods-0': 'b_babsdeltadiner', //           Burgers — a homestyle diner
  'antioch-goods-6': 'b_simplysoups', //              Sandwiches — a deli
  'antioch-goods-0': 'b_macsoldhouse', //             Burgers — a steakhouse
  'oakland-goods-0': 'b_cafenoiroak', //              Burgers — comfort food
  'oakland-goods-5': 'b_philomenapizza', //           Italian
  'oakland-services-19': 'b_jumpandroll', //          Events — party rentals

  /*
    Lucky Three Seven, on "Oakland • Goods", 2026-08-20.

    SEATED IN CHICKEN WINGS RATHER THAN FILIPINO, and not because the trade is
    in doubt. Filipino food is index 10 and Señor Sisig already holds it in
    Oakland; a category holds one business per city, and bumping a seated one to
    make room is his call and not mine. Wings is not a consolation either — the
    mark itself reads "XL LUMPIA & G-FIRE WINGS", so half their own billing is
    the category they are sitting in. Worth confirming with him.
  */
  'oakland-goods-8': 'b_luckythreeseven', //          Chicken wings

  /*
    Forno Piombo, on "BEASTY • More Goods and American Canyon city", 2026-08-21.

    THE FLAGSHIP SEAT IS YELLOW BECAUSE HE SAID SO — "BEASTY • More Goods" is
    his own words, and the flagship list is his numbering to spend.

    AMERICAN CANYON'S IS PAGE ONE, and the first version of this had it on the
    yellow page too, which was the mistake the note below already records: a
    claimed tile draws the business's own name and never the category, so the
    nearest slot costs a seated business nothing, and page one is where he
    sells from. Putting the city's ONLY business on page three would have left
    the page he shows people blank. Italian is the nearest — an Italian pizza
    oven, from a company with an Italian name — and nothing on screen will ever
    say the word.

    This also OPENS AMERICAN CANYON: their address, 120 Klamath Ct, is the
    reason that city exists now.
  */
  /*
    Almas Auto & Tires opens Newark, and Gofrette takes Brentwood's groomer
    spot. Both land in the category their own bio names — mechanics for an
    automotive repair shop, pet grooming for a groomer — so neither needed the
    yellow page or a widened label.
  */
  /*
    The 2026-08-21 afternoon run.

    GOLDEN STATE BALLERZ SITS IN THE MIDDLE ON PURPOSE — "please place this spot
    anywhere in the middle" — so it takes index 12 of twenty-four rather than
    the streetwear slot at the top that its trade would suggest. The category
    under a CLAIMED tile never renders, so the seat costs them nothing and the
    position is his to choose. It is the first business on BEASTY • Online.

    Classy Canine's takes two seats, which is his own pattern for a business he
    wants on the flagship as well as at home.
  */
  'beasty-online-12': 'b_goldenstateballerz',
  'beasty-services2-9': 'b_unitedcurbpainting',
  'beasty-services2-10': 'b_classycanines',
  'castro-valley-services-14': 'b_classycanines', //   Pet grooming and walking
  'pleasanton-services-23': 'b_oneillssignature', //   Contractor
  'walnut-creek-services-4': 'b_trufusionwalnutcreek', // Gym
  'santa-rosa-services-19': 'b_camachospartyrentals', // Event coordinator

  /*
    Boudreaux opens Fairfield. Cajun is not one of the twenty-four goods
    categories and inventing one would renumber spots he has already sold, so
    they take the American comfort-food slot at index 0 — the same reading that
    put Café Noir in Oakland's. A claimed tile prints their name, never the
    category.
  */
  'fairfield-goods-0': 'b_boucajun', //                Burgers — comfort food

  /* 2026-08-22. Both land in the category their own bio names. */
  'milpitas-services-19': 'b_bloomballoon', //         Event coordinator
  'brentwood-services-4': 'b_yogasixbrentwood', //     Gym

  /*
    MACSTALGIA GOES IN THE MIDDLE BECAUSE HE ASKED — "the middle of the online
    page for the hell of it" — so index 11, beside Golden State Ballerz at 12,
    rather than "Music and vinyl" at 20 which is what they actually sell. The
    category under a claimed tile never renders, so the position is his to spend
    and the trade is not lost by spending it.
  */
  'beasty-online-11': 'b_macstalgia',
  'berkeley-services-14': 'b_healthyspotberkeley', //  Pet grooming and walking
  'san-mateo-goods-5': 'b_barrelbistro', //            Italian — bistro
  'oakley-services-20': 'b_bayareapowerwash', //       House cleaning

  'newark-services-5': 'b_almasautotires', //          Mechanics and smog
  'brentwood-services-14': 'b_gofrette', //            Pet grooming and walking

  'beasty-goods2-5': 'b_fornopiombo',
  'american-canyon-goods-5': 'b_fornopiombo', //       Italian
  'concord-services-4': 'b_urbanair', //              Gym — an adventure park
  'petaluma-services-4': 'b_playland707', //          Gym — paintball
  'brentwood-goods-15': 'b_chipcookies', //           Cookies

  /*
    No fitting cuisine, so the yellow sheet rather than a wrong label. Eight
    Acres is a kitchen and bar and Brentwood's American spot is already The
    Yard; Las Lomas is Peruvian and BBQ ribs, and there is neither on the list.
  */
  'brentwood-goods2-1': 'b_eightacres',
  'antioch-goods2-0': 'b_laslomasribpalace',

  /* ---- 2026-08-13 ---- */
  'lafayette-goods-0': 'b_kababburger', //   Burgers and hot dogs
  'pinole-goods-10': 'b_sweetpipers', //     Filipino — ube and buko pie

  /*
    The three that were on yellow sheets, now on page one in the nearest slot —
    see the note above for why the objection to that did not hold. Each is the
    closest of the twenty-four rather than an exact fit, and each is a call he
    can overrule in one line:

      The Royale Eatery   contemporary American  -> Burgers and hot dogs
      One House Bistro    brunch and dinner      -> Burgers and hot dogs
      Mimi's Chocolates   chocolatier            -> Bakery
      The Farmacy         cafe                   -> Coffee shop
  */
  'pleasant-hill-goods-0': 'b_royaleeatery',
  'san-ramon-goods-0': 'b_onehousebistro',
  'dublin-goods-12': 'b_mimischocolates',
  'san-francisco-goods-13': 'b_thefarmacy',

  /*
    Rico Rico Taco, sent as "Oakland • Goods" and "San Ramon • Goods" on
    2026-08-25.

    SEATED IN SAN RAMON ONLY. Mexican food is index 1 and Al Pastor Papi
    already holds it in Oakland — one business per category per city, and
    bumping a seated one is his call, not mine. San Ramon's Mexican spot was
    open, and it is the location he actually flagged as news: their second
    shop opened at City Center Bishop Ranch. Their Oakland seat is his to
    decide.
  */
  'san-ramon-goods-1': 'b_ricoricotaco', //           Mexican
  /* Khaki, "San Ramon - Goods", 2026-08-25. Indian was open there. */
  'san-ramon-goods-3': 'b_khaki', //                 Indian food

  /*
    The 2026-08-25 run. Five sent in one morning, each with the city and page
    he wants them on.

    THREE SEAT WHERE THEY BELONG. Isla trades in Pleasant Hill and Filipino
    food was open there; JAC does landscaping and Gardener was open in San
    Francisco; Flowers Valley is a florist with a Concord address and Concord's
    florist spot was empty.

    TWO DO NOT, both for the same reason: the event-coordinator spot in their
    city is already held. Camacho's has Santa Rosa and Bay Area Charters has
    San Francisco, and bumping a seated business is his call, not mine. Fun
    Cloud went to DJ, the only other performer seat; Petal & Pebbles went to
    Florist, which is what half her posted work actually is. Both are worth
    confirming with him.
  */
  'pleasant-hill-goods-10': 'b_islafilipino', //       Filipino food
  'san-francisco-services-21': 'b_jacdreamscapes', //  Gardener
  'concord-services-13': 'b_flowersvalley', //         Florist
  'santa-rosa-services-17': 'b_funcloudevents', //     DJ - see above
  'san-francisco-services-13': 'b_petalandpebbles', // Florist - see above

  /* Stan's Donut Shop, "Santa Clara - Goods", 2026-08-25. Donuts was open in
     Santa Clara, and so was the whole city — this is its first tile. */
  'santa-clara-goods-16': 'b_stansdonutshop', //       Donut shop

  /*
    The late run of 2026-08-25/26. Two seat on page one and two do not.

    Cambodian Street Food takes Oakland's Asian spot and Ofie's takes Concord's
    burgers, both of which were empty. Au Lounge and HD Party SF have nowhere
    honest to sit — the goods list is cuisines and retail, and a lounge is
    neither, and neither is a dance-floor rental — so they go on the yellow
    overflow page of the city he named rather than being filed under a wrong
    label. HD Party is worth confirming: he said Goods and they read as a
    service.
  */
  'oakland-goods-2': 'b_cambodianstreetfood', //       Asian food
  /* House of Raha, "Fremont - Goods", 2026-08-26. Asian was open in Fremont. */
  'fremont-goods-2': 'b_houseofraha', //               Asian food
  'concord-goods-0': 'b_ofieskitchen', //              Burgers
  'oakland-goods2-0': 'b_aulounge',
  'san-francisco-goods2-0': 'b_hdpartysf',

  /*
    Businesses with no fitting category go on the yellow overflow page rather
    than being crammed under a wrong label: a waste-removal service is not
    "Cleaning", a two-city breakfast house is not "Sandwiches", and a mobile
    groomer with no fixed city is not anywhere at all — the operator filed it
    under BEASTY itself.

    Three from the 2026-08-11 run were parked here on the argument that the
    goods list is a list of CUISINES, so a restaurant that cooks none of them
    has nowhere honest to sit — the worry being that seating a tasting-plate
    bistro under "Burgers and hot dogs" would print BURGERS beneath it.

    That worry was simply wrong about how the grid renders. A CLAIMED spot
    draws the business's own name; the category label only shows while the tile
    is still empty. Banh Mi Xpress reads "Banh Mi X…" and not "Sandwiches",
    Majestic reads "Majestic" and not "Clothing". Nothing on screen ever
    announces the category, so the nearest slot costs a seated business
    nothing, and page one is where he sells from. All three moved.
  */
  'walnut-creek-services2-0': 'b_petbutlerwalnutcreek',
  /* PJ's Junk Removal, Fairfield, 2026-08-25. Same argument as Pet Butler:
     hauling is not cleaning and not handyman, and there is no waste category
     to put it in. */
  'fairfield-services2-0': 'b_pjsjunkremoval',
  'beasty-services2-0': 'b_happybaypaws',
  'pleasant-hill-goods2-0': 'b_thehangoutbreakfast',
  'walnut-creek-goods2-0': 'b_thehangoutbreakfast',

  /*
    2026-08-26. Four he sent in one morning, three of them "needs website".

    Papi Clary's takes Concord's Filipino spot, BloomZephyr takes Santa Clara's
    bakery spot, and No Last Call takes the flagship's event coordinator seat
    from Andrew Shin — "Bump AS to yellow pages" — who moves to the yellow
    sheet below.

    CRUSHED IS IN THE WRONG TRADE AND IT IS FLAGGED, not smoothed over. Boba is
    the only drinks spot the twenty-four have and they sell lemonade. His to
    move if he wants them somewhere else; widening the category would renumber
    every goods page in the app to fix one seat.
  */
  'concord-goods-10': 'b_papiclaryskitchen', //        Filipino food
  'san-jose-goods-14': 'b_crushedlemonade', //         Boba shop — they sell lemonade
  'santa-clara-goods-12': 'b_bloomzephyr', //          Bakery
  'beasty-services2-11': 'b_andrewshinlaw',
  /* Hey Yogurt opens San Mateo on September 1 — the ice cream spot, and the
     page he is taking to them. */
  'san-mateo-goods-11': 'b_heyyogurt', //              Ice cream shop
  /*
    2026-08-26, evening. Six more, and two of the seats needed a judgment call.

    ANTONIO'S HAULING IS ON THE YELLOW SHEET, not page one, and the operator
    labelled it "Vallejo • Goods". There is no goods category a junk
    removal service can honestly sit in — the twenty-four are food and
    retail — and this is the same call already made for PJ's Junk Removal
    in Fairfield: hauling is not cleaning and not handyman, and there is no
    waste category. His to move.

    AFFINAGE IS ON THE YELLOW SHEET for the opposite reason: the seat that fits
    a caterer, San Francisco's event coordinator spot, is already Bay Area
    Charters'. Reseating a business that is already placed to make room is not
    a call this file gets to make on its own.

    The other four land exactly where their trade does.
  */
  'san-francisco-services-5': 'b_goldenautomuffler', //  Mechanics and smog
  'antioch-services-7': 'b_cleanasere', //               Auto detailing
  'fremont-services-7': 'b_doubletakeautospa', //        Auto detailing
  'pleasanton-goods-9': 'b_oasiswinelounge', //          Mediterranean
  'vallejo-services2-0': 'b_antonioshauling', //         no waste category, same as PJ's
  'san-francisco-services2-1': 'b_affinageboards', //    caterer; the events seat is taken
  /*
    2026-08-27. Serrano Turf Landscape, sent as "Antioch • Services".

    THEY ARE IN BRENTWOOD, by their own bio, and work most of the Bay Area.
    Antioch is the next town over and the operator's own call, so the seat
    stands — but it is written down here rather than left to look like
    their published address.

    Contractor rather than Gardener: turf, concrete and pavers is hardscaping,
    not garden maintenance.
  */
  'antioch-services-23': 'b_serranoturflandscape', // Contractor
  /*
    BEASTY • INDIVIDUALS opens with Naya Green, 2026-08-27.

    HELD, NOT TAKEN. He asked to "put Naya Green under her icon" so he can go
    and ask her; she has agreed nothing, and her page says so in as many words.
    The sheet itself is numbered but uncategorised — see INDIVIDUAL_SPOTS.
  */
  'beasty-individuals-0': 'b_nayagreen',
  /*
    2026-08-27, evening. Four more, and two of them are artists.

    Lyrics Born and P-Lo take the next two Individuals spots. Both carry a link
    to the reel he sent rather than the video itself: the clip field only plays
    footage sitting on our own origin, and re-hosting an artist's video would
    need the file and their permission. Neither has agreed anything yet, and
    both pages say so.
  */
  'concord-goods-2': 'b_lovethai', //            Asian food
  'beasty-online-0': 'b_facetfine', //           Apparel
  'beasty-individuals-1': 'b_lyricsborn',
  'beasty-individuals-2': 'b_plo',
  /* Pawddle, 2026-08-27. BEASTY • Online's pet goods spot, with a MOCK welcome
     offer he asked for so he has something to show them. */
  'beasty-online-17': 'b_pawddle', //            Pet goods
  /*
    2026-08-27, from the 08-23 and 08-26 backlog. Three of these four needed a
    judgment call recorded rather than smoothed over.

    AGLOW IS NOT A PLEASANTON BUSINESS. He said "Pleasanton • Services"; they
    publish no address at all and list about eighty cities. Seated where he asked
    and flagged on their own page. Handyman rather than Contractor only because
    O'Neills already holds Pleasanton's contractor spot.

    CRYO CANINE HAS NO HONEST CATEGORY. A cryogenic semen bank for breeders is
    not a vet clinic and definitely not a "dog breeder" — they neither breed nor
    sell dogs. Veterinary clinic is the least wrong of twenty-four. His to move.

    LAVISH PAWS WANTED ONLINE'S PET GOODS SPOT, which Pawddle took earlier
    tonight. Supplements is what they actually sell, so that is where they sit.
  */
  'pleasanton-services-22': 'b_aglowoutdoorlighting', // Handyman; contractor taken
  'concord-goods-5': 'b_fireslicepizza', //             Italian
  'las-vegas-services-15': 'b_cryocanine', //           nearest seat, not a good one
  'beasty-online-9': 'b_lavishpaws', //                 Supplements and nutrition
  /*
    2026-08-28. Eight from the backlog and tonight, researched off their own
    sites. THREE OF THE NAMES HE SENT WERE WRONG and are corrected on their
    pages: "Pour A On Wheels" is Poura on Wheels, "MRM Home Services" is
    Mr. M Home Services, "Pho Sho Dough" is Phosho Dough.

    THREE HAVE NO HONEST CATEGORY among the twenty-four. A mobile bar, an
    arcade bar and a design studio are none of them, so they take open spots on
    a yellow sheet rather than being filed under something they are not.

    KINGS TAKES DALY CITY'S ITALIAN SEAT and that is the nearest of a bad set:
    there is no pizza category and no Brazilian one, and Brazilian is what they
    lead with.
  */
  'beasty-services2-12': 'b_pouraonwheels', //     mobile bar; no category fits
  'berkeley-goods-12': 'b_milkcloudbakery', //     Bakery
  'beasty-services2-13': 'b_mrmhomeservices', //   Handyman, not house cleaning
  'beasty-goods2-6': 'b_phoshodough', //           Asian food
  'san-francisco-goods-9': 'b_karamsf', //         Mediterranean
  'san-francisco-services2-2': 'b_emporiumsf', //  arcade bar; no category fits
  'daly-city-goods-5': 'b_kingswcpizza', //        Italian, nearest of a bad set
  'beasty-online-19': 'b_petersdesigncompany', //  Art prints; held, not taken
  /* Tiny Wheels, 2026-08-28, approved with its reviews and its trademarked
     variant names stripped — see the long note on the seed. Home rather than
     Pet goods only because Pawddle took Pet goods first. */
  'beasty-online-18': 'b_tinywheels',
  /*
    2026-08-28, the three he sent as pictures with no link. All three are
    "needs a website" businesses, which is why he sent them.

    TWO SOFT PLAY COMPANIES IN ONE CITY on the same night — The Bubble House and
    Tot Spot. Worth him knowing before he pitches both, since neither knows
    about the other.
  */
  'beasty-online-13': 'b_fruitsbyheart', //        dead domain; snacks seat taken
  'san-francisco-services2-3': 'b_thebubblehouse',
  'san-francisco-services2-4': 'b_totspotsoftplay',
  /*
    2026-08-28, the last four of the night.

    ONE PET SEAT, FIVE PET BUSINESSES. BEASTY • Online has a single Pet goods
    spot and now carries Pawddle, Lavish Paws, Tiny Wheels, GlowPaws and DryPup.
    Pawddle holds the real seat; the rest sit where there was room. That is a
    structural problem with the twenty-four, not a placement mistake, and it is
    his to decide.

    GLOWPAWS AND DRYPUP ARE ONE PERSON. Their legal pages carry the same name,
    tax ID, address, phone and Gmail — one sole trader in Chile running two
    single-product funnels. He should know that before he pitches both.
  */
  'san-francisco-services2-5': 'b_momentus', //   photo/video seat taken by I-Snapped
  'san-francisco-services2-6': 'b_olesiacakestudio', // a class, not a bakery
  'beasty-online-14': 'b_glowpaws', //            pet seat taken
  'beasty-online-15': 'b_drypup', //              pet seat taken; same owner as above
  /* PuppiePack, 2026-08-28 00:55 — the sixth pet business on a sheet with one
     pet seat. Same note as GlowPaws and DryPup applies. */
  'beasty-online-16': 'b_puppiepack',
  /*
    Paulo Sausage Co lands in Pittsburg, 2026-08-28. Their published address is
    2951 Harbor Street, Pittsburg — they were on the flagship sheet with no city
    page to sit in until the Pittsburg page existed this week. A business on a
    BEASTY sheet AND in its own city is the intended shape, not a duplicate.
  */
  'pittsburg-goods-6': 'b_paulosausage', //        Sandwiches — off the front page since 2026-09-09 ("they close down recently"); this seat is his call
  /*
    2026-08-28, 01:01-01:28. THREE OF THESE FOUR HAVE NO CATEGORY among the
    twenty-four — BBQ, a distillery and a Cajun seafood boil are none of them,
    and the operator spotted it himself on Griffo ("1st distillery on the
    page"). They take open spots rather than wrong labels. The list needs rows,
    which is his call.
  */
  'benicia-goods2-1': 'b_traballosbackyardbbq', // no BBQ category
  'beasty-individuals-3': 'b_eatwithsie', //       a creator, not a shop
  'petaluma-goods-0': 'b_griffodistillery', //     first distillery on the app
  'san-pablo-goods-0': 'b_rockincrawfish', //      no seafood category
  /*
    2026-08-28, the four he sent as pictures with no link.

    SWEET PIPERS WAS ALREADY HERE — "Update in Pinole please" meant their new
    logo, not a new listing. They have sat at pinole-goods-10 since 08-13; the
    update is the tile, which now carries the round Tropical Treats badge they
    replaced the old one with. Adding them again created a duplicate brand id
    and the data audit refused it, which is exactly what that check is for.

    TWO OF THEM ARE THE PEOPLE BEHIND SHOPS ALREADY ON THE APP: Al Freshko
    designs Elemonkey and Lloyd de Vera owns Quickly Benicia, both of which have
    their own seats. That is the Individuals sheet working as intended — the
    shop and the person are different entries, and his note was that a stage
    name under the tile is enough.
  */
  'oakley-services-7': 'b_eastbaytinting', //      no window tint category
  'beasty-individuals-4': 'b_alfreshko',
  'beasty-individuals-5': 'b_lloyddevera',
  /*
    2026-08-28, the overnight run. Twelve, and the category list creaked again.

    ASIAN BOX AND STATE BIRD DO NOT NEED WEBSITES. He sent a SpotOn ordering
    link and a link-in-bio; both sit on top of full real sites. Third and
    fourth time this week — Fire Slice and Emporium were the others.

    SIX OF THESE HAVE NO CATEGORY among the twenty-four: a bottle shop, a
    cycleboat, a contemporary Californian restaurant, and four people. His own
    note when he sent SIPS — "I guess unique alcohol businesses can have a place
    on the page as well" — is the same observation from the other side.

    DIAMOND SUPPLY CO IS HERE WITH NOTHING ON IT. Their real store 403s to
    everything, so there is no catalogue, no logo and no colours to read. The
    domain he sent on 08-03 was a counterfeit registered five months ago; this
    is the real one he sent on 08-28, and the page stays empty rather than being
    filled from a reseller — which is exactly the route the fake would have
    taken in.
  */
  'san-jose-goods-0': 'b_doughburger', //          Burgers
  'san-francisco-goods2-1': 'b_asianbox', //       SF's Asian seat is House of Thai's
  'benicia-goods2-2': 'b_sipsbottleemporium', //   no bottle shop category
  'alameda-services-0': 'b_bayareabrewboat', //    no boat category; opens Alameda
  'san-francisco-goods2-2': 'b_statebirdprovisions',
  'beasty-individuals-6': 'b_larryjune',
  'beasty-online-1': 'b_midnightorganic',
  'beasty-individuals-7': 'b_nickydiamonds',
  'beasty-online-2': 'b_diamondsupplyco',
  'beasty-individuals-8': 'b_showbanga',
  'beasty-individuals-9': 'b_iamsu',
  'beasty-individuals-10': 'b_beastmode', //       "Bay Area Icon" — Marshawn Lynch
  /*
    2026-08-28, the overnight batch. Fourteen from him, and a gap check that
    found three he sent weeks ago and nobody ever added.

    SIX OF THE FOURTEEN HAVE NO SEAT ON A NUMBERED PAGE. Escape rooms, a mural
    studio, a collision shop, a co-working play room, and two gyms in cities
    whose one Gym seat is already sold. They go on the yellow sheets rather than
    into a widened category — the PJ's Junk Removal rule.

    BEASTY - SERVICES IS FULL. All twenty-four seats are gone, so the next
    business he files under it lands on the yellow sheet by arithmetic, not by
    judgement. BEASTY - Goods has one seat left, and it is Boba shop. He should
    know both.

    THREE NAMES HE SENT WERE THE DOMAIN, NOT THE BUSINESS: Car Audio Bay Area is
    Audio Accessories Mobile, Cray One is Crayone, City Bachi is CityBachi.
    And sinmexautobody.com is not a registered domain at all.
  */
  'san-francisco-services-4': 'b_beatdropfitness', //   Gym
  'rohnert-park-services-12': 'b_foursmedia', //        Photo and video; opens Rohnert Park
  'oakland-services2-0': 'b_sinmexautobody', //         collision, not Mechanics and not Detailing
  'san-francisco-services2-7': 'b_palacegames', //      escape rooms; no category
  'san-francisco-services2-8': 'b_sugarmurals', //      murals; no category
  'concord-services2-0': 'b_transformfxfitness', //     Gym seat is Urban Air's
  'walnut-creek-services2-1': 'b_crossfitsweatshop', // Gym seat is TruFusion's
  'richmond-services2-0': 'b_plarkplayspace', //        play space; the Tot Spot precedent
  'beasty-services2-14': 'b_audioaccessoriesmobile', // BEASTY Services is full
  'beasty-goods2-7': 'b_crayone', //                    all three apparel seats taken
  'beasty-goods2-8': 'b_citybachi', //                  he filed it BEASTY; the shop is Pittsburg
  /* Soul food has no seat: San Jose's Chicken wings is JoJo's and Cookie shop
     is not what they are. Yellow sheet. */
  'san-jose-goods2-0': 'b_jackiesplace',
  'beasty-individuals-11': 'b_richierich',
  'beasty-individuals-12': 'b_mbnel', //                Stockton, so nowhere rather than a wrong city

  /*
    RYWIRE HAS BEEN BUILT SINCE 2026-08-20 AND WAS NEVER GIVEN A SEAT. Seed,
    icon, and a 24-second cut of their own film with a poster frame, all sitting
    in the repo doing nothing because this line was missing. The gap check does
    not catch that class of miss — the link matched the data — so it took
    reading his message again to notice he had labelled it "BEASTY - Services"
    and nobody had acted on the label.

    Santa Ana, Orange County, four hundred miles from here, which is exactly why
    BEASTY rather than a city: these sheets belong to nowhere in particular, and
    the alternative was putting a Southern California shop on an East Bay page.
  */
  'beasty-services2-15': 'b_rywire',

  /*
    2026-08-28 afternoon. Three businesses, and the seven cities he opened for
    them — Pacific Pet Grooming parks in five of the seven, Mcar has shops in
    two.

    PACIFIC PET GROOMING IS ON BEASTY BECAUSE IT IS IN FIVE PLACES AT ONCE. He
    filed it "Mobile", which is what these sheets are for: a business that
    belongs to no single city page. BEASTY - Services being full is why it
    lands on the yellow one.
  */
  'beasty-services2-16': 'b_pacificpetgrooming', // five cities, one timetable
  'san-bruno-services-7': 'b_mcar', //             Auto detailing; no tint seat exists
  'san-francisco-goods-1': 'b_underdogscantina', // Mexican food

  /* 2026-08-28, late: "Dublin • Goods". Dublin's Indian seat is Pippal's. */
  'dublin-goods2-0': 'b_biryaniz',

  /* "Bump poof of Alchemy to yellow goods pages" — his words, 2026-08-28.
     It gives up seat 18 on the numbered BEASTY Goods sheet. */
  'beasty-goods2-9': 'b_poofofalchemy',

  /*
    FOUR INSTRUCTIONS THAT WERE READ AS ONE LINE EACH AND WERE TWO.

    His messages are often two lines and the second is a second placement. A
    filter reading this thread line by line kept only the first, so each of
    these shipped with half of what he asked for. The fetcher writes one
    message per line now.

      "BEASTY - Services / San Jose - Services"  -> Audio Accessories Mobile,
      which lists San Jose in its own service area, so the city seat is honest
      as well as instructed.

      "Mobile / San Bruno - Services"  -> Pacific Pet Grooming, whose Bus 2
      parks at Commodore Park in San Bruno on Fridays. Its own timetable.

      "BEASTY - Online / BEASTY - Individuals"  -> Crayone, which is both: the
      store is Online and Rigel Juratovac is the artist behind it.
  */
  'san-jose-services-6': 'b_audioaccessoriesmobile', //  Car audio, and BEASTY too
  'san-bruno-services-14': 'b_pacificpetgrooming', //    Pet grooming; Fridays
  'beasty-individuals-13': 'b_crayone', //               the artist, beside his store

  /* "BEASTY - Goods / Daly City" — the fourth two-line placement. It has held
     the Daly City seat since the 27th; this is the half that was missed. The
     numbered BEASTY Goods sheet has only Boba and Dog boutique open and it is
     a pizzeria, so the yellow one. */
  'beasty-goods2-10': 'b_kingswcpizza',

  /* 2026-08-29. A dessert counter, a Greek counter and a photo booth — none of
     the three has a seat among the twenty-four, and the two food ones are in
     cities whose nearest category is already sold. */
  'walnut-creek-goods2-1': 'b_thesweetspot', //   Ice cream is Milky Flakes'
  'san-francisco-goods2-3': 'b_gyroking', //      Mediterranean is Karam's
  'beasty-services2-17': 'b_baymemoriesbooth', // BEASTY - Services is full

  /* The 29th, later. Four kitchens and a DJ. Three of the four are in cities
     whose nearest category is already sold, which is now the ordinary case
     rather than the exception — Oakland alone has Vietnamese and hot pot
     queueing behind one Asian food seat. */
  'oakland-goods2-1': 'b_tayho', //             Asian food is Cambodian Street Food's
  'oakland-goods2-2': 'b_kungfumala', //        hot pot has no seat at all
  'dublin-goods2-1': 'b_baithak', //            Indian is Pippal's, the yellow one Biryaniz
  'san-francisco-goods2-4': 'b_ruaymitr', //    Asian food is House of Thai's
  'beasty-individuals-14': 'b_djlex',

  /* The 29th, evening. Belmont opens for Vale Nails. */
  'redwood-city-goods-10': 'b_pamilya', //      Filipino food
  'union-city-goods-0': 'b_firebunz', //        Burgers
  'belmont-services-1': 'b_valenails', //       Nail salon; opens Belmont
  'beasty-services2-18': 'b_beautybybellez',
  'beasty-goods2-11': 'b_pawsnug', //           Pet goods on Online is Pawddle's
  'san-jose-services-14': 'b_theyappyhourclub', // Pet grooming and walking

  /* The 29th, late. Two he sent that had not been seated, and one that had
     been missed entirely: the pedal bike went by as a peek.com booking link
     between two other businesses and never got a seat. */
  'san-francisco-goods2-5': 'b_pinkonion', //     Italian on page one is Stella Pastry's
  'san-ramon-goods-9': 'b_alorasocial', //        Mediterranean; opens San Ramon's
  'napa-services-0': 'b_napapedalcrusher', //     no tour or bike category; opens Napa

  /* The 30th. Six he sent overnight, and five new cities opened the same day
     for landmark links with no business behind them yet. */
  'richmond-goods-0': 'b_johnnyboi', //           Burgers; his screenshot, no link
  'napa-goods-10': 'b_carabao', //                Filipino food
  'brentwood-goods-13': 'b_brunchandbloom', //    Coffee shop; a brunch cafe
  'pittsburg-services-7': 'b_autodesignpro', //   Auto detailing; they lead with wraps
  'san-ramon-services-7': 'b_precisionshine', //  Auto detailing, mobile
  /* No winery or venue category exists, the same gap the Brew Boat and the
     pedal bike fell into. Opens Sunol, which is their real address. */
  'sunol-services-0': 'b_ellistonvineyards',

  /*
    BUTTER PECAN, ON EVERY CITY IT HAS A SHOP IN — his ask of 2026-08-30: "can
    you look up all their other locations in the bay and get each one on their
    own City's page basically identical."

    Six, not the "like 5-6" he guessed, and each address is theirs. The same
    brand id is seated seven times, which is how a business with more than one
    shop already works here (Bay Area Charters sits on Richmond and San
    Francisco); the page lists all six addresses rather than pretending the
    Pinole one is the only door.

    ANTIOCH IS SEATED BUT NOT OPEN. It is the one he is visiting, and their own
    site says only "Coming soon!" with no address, no phone and no hours — they
    are running a grand-opening list for it. The seat is held; the page says
    what is true.
  */
  'pinole-goods-12': 'b_butterpecan', //          Bakery
  'emeryville-goods-12': 'b_butterpecan',
  'pleasant-hill-goods-12': 'b_butterpecan',
  'fairfield-goods-12': 'b_butterpecan',
  'vallejo-goods-12': 'b_butterpecan',
  'hayward-goods-12': 'b_butterpecan',
  'antioch-goods-12': 'b_butterpecan', //         coming soon, per their own site

  /* The 31st, and the 1st. Two he sent as screenshots with no link at all —
     everything on their pages comes off their own Instagram — plus a shop we
     had listed on one of its two addresses. */
  'oakland-goods2-3': 'b_delahcoffee', //        Coffee on page one is Jolly Cafe's
  'san-francisco-goods2-6': 'b_portofperiperisf', // Wings on page one is Brasa Bros'
  /* Their bio pins both shops; we had only the San Francisco one. */
  'berkeley-goods2-0': 'b_udessertstory',

  /* BEASTY - Online, 2026-09-01. Three shipping brands, and all three are pet
     goods — a seat Pawddle has held since its own run, which is why Glow Paws,
     DryPup and PuppiePack are all sitting on numbers that name something else
     too. Same treatment: a free number, and the reason written down. */
  'beasty-online-20': 'b_weasy', //      Pet goods is Pawddle's
  'beasty-online-21': 'b_seatmate', //   same
  'beasty-online-22': 'b_houndsy', //    same

  /* Two shops for one barber, which is what he filed it as. */
  'fremont-services-0': 'b_thecompanybarber', //   Barber and salon
  'union-city-services-0': 'b_thecompanybarber',
  /* Window and door screens, not phone screens. No screens category exists. */
  'brentwood-services-22': 'b_screenking', //      Handyman and home repair
  /* Ice cream on page one is Polly Ann's. */
  'san-francisco-goods2-7': 'b_sweetestsound',

  /* The 31st and the 1st, the food run. Two of his labels were off and are
     corrected here rather than followed: Eat More Pho's address is in
     SUNNYVALE, not San Jose, and "Hella Good SJ" is a domain — the business
     writes itself HELLA GOOD BURGER. */
  'san-jose-goods-13': 'b_coba', //         Bakery; a Vietnamese dessert cafe
  'cupertino-goods-9': 'b_persiankabobs', // Mediterranean
  'sunnyvale-goods-2': 'b_eatmorepho', //   Asian food; HIS CARD SAID SAN JOSE
  'san-jose-goods2-1': 'b_hellagoodburger', // Burgers on page one is Dough Burger's

  /* 2026-09-01, the evening. No Hawaiian category, so seat 0 opens Alameda —
     the brew boat's treatment. Mrs. Ramen came as "Candidate for Pilot
     Program" with no city line; their own bio says The Veranda, Concord. */
  'alameda-goods-0': 'b_shakashack', //      no Hawaiian category; opens Alameda
  'concord-goods-7': 'b_mrsramen', //        Korean and ramen
  'antioch-services-22': 'b_baysidefencing', //  Handyman and home repair; contractor taken (Serrano Turf)
  'san-ramon-goods-5': 'b_empirestatepizza', //  Italian; sent 09-03 from the shop
  'san-lorenzo-goods-2': 'b_rubenhibachigrill', // Asian food; opens San Lorenzo
  'san-francisco-goods2-8': 'b_loveburn', //     wings seat taken; the yellow page
  'alamo-services-2': 'b_thetoxalamo', //        Massage and spa; opens Alamo
  'orinda-services-0': 'b_ethosofcalifornia', // Barber; Lafayette unverified
  'beasty-online-23': 'b_overlyhiphop', //        Media, tech and accessories (widened)
  'fairfield-goods-1': 'b_gourmetburritos', //   Mexican food; A & A Gas, his working name
  'beasty-individuals-15': 'b_nanacasas',
  /* Zero-based: seat N is category N+1. Pijja is Indian-style pizza and calls
     itself that, so both take Indian food rather than Italian — which is
     Glasshouzz's in Livermore anyway. Chikin Drip takes Chicken wings in
     Union City; San Jose's is JoJo's, so that one goes to the yellow page.
     A party bus has no category on the services sheet and Oakland's Events
     seat is Jump and Roll's, so Cali Party Bus goes to the yellow page too. */
  'pleasanton-goods-1': 'b_elranchogrande', //  Mexican food
  /* 2026-09-05. Dad's BBQ: the goods list has no barbecue seat, so the yellow
     overflow page of the city he settled on; Tony's Style on the Boba spot he
     named, twice; Caitlyn's on Bakery; Armenta on Gardener in Services (he
     said Goods — it is a landscape contractor; flagged). */
  'antioch-goods2-1': 'b_dadsbbq', //                Mississippi-style BBQ
  'beasty-goods-14': 'b_jazzbraids', //              from Janelle's circle, pink glow — page one since 2026-09-21 (was Tony's Style)
  'albany-goods-14': 'b_tonysstyle', //              Chicken wings — "Add on Boba empty spot"
  'san-jose-goods-12': 'b_caitlynssweets', //        Bakery — custom cakes
  'antioch-services-21': 'b_armentalandscape', //    Gardener — landscape design and construction
  'beasty-goods2-12': 'b_walkfree', //               Online: Pet goods is Pawddle's; yellow sheet
  'santa-clara-services-14': 'b_lushspaw', //        Pet grooming
  'san-jose-services2-0': 'b_lushspaw', //           Pet grooming is The Yappy Hour Club's; yellow sheet
  /* Bay Area Event Lights, "Mobile / San Jose • Services", 2026-08-29 — Event
     coordinator is Bloom Balloon's on San Jose, so the yellow sheet. */
  'san-jose-services2-1': 'b_bayareaeventlights',
  'daly-city-goods-10': 'b_russfamkitchen', //       Filipino
  'pittsburg-goods-3': 'b_pijjaparadisepittsburg', // Indian food
  'livermore-goods-3': 'b_pijjaparadiselivermore', // Indian food
  'union-city-goods-8': 'b_chikindripunioncity', //   Chicken wings
  'san-jose-goods2-2': 'b_chikindripsanjose', //      wings seat is JoJo's
  'oakland-services2-1': 'b_calipartybus', //         no transport category; Events is taken
  'newark-goods-2': 'b_phonationnewark', //     Asian food
  'alameda-goods-2': 'b_phonationalameda', //   Asian food
  'san-francisco-goods2-9': 'b_phonationsf', // Asian seat taken; the yellow page
  'pittsburg-goods-8': 'b_houseofwings', //      Chicken wings; sent 08-23, seated in the 09-02 sweep
  'beasty-services2-19': 'b_tastinpeachy', //    Caterer, Bay Area, no city; sent 08-30, seated in the 09-02 sweep
  /*
    2026-09-08: the batch he sent on the night of the 7th, plus the five from
    the weekend. Research in research/roster/batch15.json. Where a category
    seat was already taken, or no category fits, the business sits on the
    city's yellow sheet, as before.
  */
  'redwood-city-goods-4': 'b_sushinaloa', //                     Sushi — Mexican sushi and mariscos
  'san-jose-goods-2': 'b_kusanuyghurcuisinesanjose', //          Asian food
  'milpitas-goods2-0': 'b_kusanbazaarmilpitas', //               Milpitas's Asian seat is INTL Kitchen's; yellow sheet
  'mountain-view-goods-2': 'b_kusanbazaarmountainview', //       Asian food
  'walnut-creek-services-1': 'b_varnishnailboutiquewalnutcreek', // Nail salon — he wrote Goods
  'antioch-services-1': 'b_varnishnailboutiqueantioch', //       Nail salon — he wrote Goods
  'berkeley-services-4': 'b_bodyrokberkeley', //                 Gym — reformer Pilates
  'alamo-services-4': 'b_bodyrokalamo', //                       Gym
  'oakland-services-4': 'b_bodyrokoakland', //                   Gym; Lakeshore and Rockridge on one seat
  'alameda-goods2-0': 'b_bhanmaevane', //                        Alameda's Asian seat is Pho Nation's; yellow sheet
  'union-city-services2-0': 'b_jollyrogerland', //               no play-centre category; yellow sheet
  'walnut-creek-goods2-2': 'b_paradanewperu', //                 Peruvian — no seat for it, like Las Lomas
  'beasty-goods2-13': 'b_goodcompenny', //                       Online: the apparel seat is Facet Fine's; yellow sheet
  'livermore-goods-14': 'b_bobaclub', //                         Boba shop
  'alameda-goods-12': 'b_doodlecakes', //                        Bakery
  'walnut-creek-goods-15': 'b_chipcookies', //                   Cookies — their Walnut Creek store
  'dublin-goods-15': 'b_chipcookies', //                         Cookies — their Dublin store
  'beasty-individuals-16': 'b_housingauthority', //              a Richmond dance crew, on his "Yes plz"
  'beasty-individuals-17': 'b_e40', //                           2026-09-21, "Gotta make a page for E-40"; held, not taken
  'beasty-individuals-18': 'b_grando', //                        2026-09-21, "Grando1k" straight after E-40; held, not taken
  /* 2026-09-22, 4:35 am: Yo Sushi & Ramen, "Vacaville • Goods". */
  'vacaville-goods-4': 'b_yosushivacaville', //                  Sushi
  /* 2026-09-08, morning: Moxie Steak House, "Alameda • Goods". */
  'alameda-goods2-1': 'b_moxiesteakhouse', //                     no steakhouse seat, and the burgers seat is Shaka Shack's; yellow sheet
  /* 2026-09-08, evening: 7 Mile House opens Brisbane; Belly; Wow Mia Pizza. */
  'brisbane-goods-0': 'b_7milehouse', //                          no bar-and-grill seat; seat 0 opens the city, as Shaka Shack's did Alameda
  'oakland-goods-7': 'b_belly', //                                Korean and ramen — kimchi and bulgogi on a Rockridge diner menu
  'san-jose-goods-5': 'b_wowmiapizza', //                         Italian — pizza
  /* 2026-09-09, evening: Salad Makers on a seat; Street Social and Alive
     Kitchen on yellow sheets, drawn at Tier 1 under his rule of that day. */
  'brentwood-goods-6': 'b_saladmakers', //                        Sandwiches — soups, salads and sandwiches
  'petaluma-goods2-0': 'b_streetsocial', //                       no seat for comfort food and a bottle shop; Tier 1
  'concord-goods2-1': 'b_alivekitchen', //                        meal prep delivered to three cities; Tier 1 on each yellow sheet
  'walnut-creek-goods2-3': 'b_alivekitchen',
  'lafayette-goods2-0': 'b_alivekitchen',
  /* 2026-09-10 evening to 09-12: four on open category seats, Pizza Ponte on
     Oakland's yellow sheet at Tier 1, Claire Anderson on the BEASTY services
     yellow sheet with the whole page. */
  'livermore-services-14': 'b_bratpakdogkamp', //                 Pet grooming and walking — daycare and boarding, the nearest seat
  'martinez-goods-5': 'b_sliceitpizza', //                        Italian — pizza; the shop is in Pacheco, next door
  'berkeley-goods-0': 'b_doghausberkeley', //                     Burgers and hot dogs
  'daly-city-goods-8': 'b_piwings', //                            Chicken wings
  'oakland-goods2-4': 'b_pizzaponte', //                          Italian is Philomena Pizza's; yellow sheet, Tier 1
  'beasty-services2-20': 'b_claireandersonhomes', //              BEASTY Services is full; real estate, a new market
  /* "You can bump Dr. comics", 2026-09-21: Vending Enterprise took its seat,
     BEASTY • Services 16, and it moves here rather than off the pages. */
  'beasty-services2-21': 'b_drcomicsmrgames',
  /* "You can bump Roman Iron to the yellow pages for her", 2026-09-22: The
     BeauDega by Maine took BEASTY • Services #2, and Roman Iron moves here
     rather than off the pages. */
  'beasty-services2-22': 'b_romantraileriron',
  /* 2026-09-13 morning: Daughter Thai on Oakland's yellow sheet at Tier 1,
     MexiHibachi on Pinole's open Mexican food seat. */
  'oakland-goods2-5': 'b_daughterthai', //                        Asian food is Cambodian Street Food's; yellow sheet, Tier 1
  'pinole-goods-1': 'b_mexihibachi', //                           Mexican food — Mexican and Japanese hibachi
  /* 2026-09-13 evening: Gumbo Social on San Francisco's yellow sheet, Tier 1. */
  'san-francisco-goods2-10': 'b_gumbosocial', //                  no gumbo or soul food seat; yellow sheet, Tier 1
  /* 2026-09-14: Looki on BEASTY • Online. No wearable-tech category exists and
     Media, tech and accessories is Overly Hip Hop's, so Watches, the nearest
     open wearable seat. A BEASTY page, so the whole page. */
  'beasty-online-6': 'b_looki', //                                Watches — a wearable AI camera
  /* 2026-09-14: Sushi Uma on San Francisco's open Sushi seat; Ace King BBQ,
     Harborview and The Sea on their cities' yellow sheets at Tier 1. */
  'san-francisco-goods-4': 'b_sushiuma', //                        Sushi
  'newark-goods2-0': 'b_acekingbbq', //                            Asian food is Pho Nation's; yellow sheet, Tier 1
  'san-francisco-goods2-11': 'b_harborviewsf', //                  Asian food is House of Thai's; yellow sheet, Tier 1
  'palo-alto-goods2-0': 'b_theseabyash', //                        no seafood or steak seat; yellow sheet, Tier 1
  /* 2026-09-15 and 16: thirty-three seats from two days of his messages. Open
     category seats get the whole page; a taken seat, or no fitting tile,
     means the city's yellow sheet at Tier 1. */
  'san-bruno-goods-1': 'b_marymar', //                             Mexican food — mariscos and tacos
  'san-lorenzo-goods-1': 'b_tacosmireynitasanlorenzo', //          Mexican food
  'hayward-goods-1': 'b_tacosmireynitahayward', //                 Mexican food
  'san-jose-goods-1': 'b_tacosmireynitasanjose', //                Mexican food
  'fremont-goods-1': 'b_tacosmireynitafremont', //                 Mexican food
  'san-francisco-goods2-12': 'b_turtletower', //                   Asian food is House of Thai's; yellow sheet, Tier 1
  'pleasant-hill-goods-7': 'b_plazacafepleasanthill', //           Korean — Korean street food at night
  'san-jose-services-3': 'b_honepiercing', //                      Tattoo and piercing
  'berkeley-services2-0': 'b_cyclebarberkeley', //                 Gym is BodyRok's; yellow sheet, Tier 1
  'san-ramon-services-4': 'b_rumbleboxingsanramon', //             Gym — boxing fitness
  'belmont-goods-4': 'b_trufflepokebelmont', //                    Sushi — poke
  'burlingame-goods-4': 'b_trufflepokeburlingame', //              Sushi — poke
  'south-san-francisco-goods-4': 'b_trufflepokessf', //            Sushi — poke
  'san-mateo-goods-4': 'b_trufflepokesanmateo', //                 Sushi — poke
  'richmond-goods2-0': 'b_balompie', //                            no Salvadoran seat; yellow sheet, Tier 1
  'san-jose-goods2-3': 'b_paperplanesj', //                        no bar seat; yellow sheet, Tier 1
  'berkeley-services2-1': 'b_benchmarkclimbingberkeley', //        Gym is BodyRok's; yellow sheet, Tier 1
  'san-francisco-services2-9': 'b_benchmarkclimbingsf', //         Gym is Beat Drop's; yellow sheet, Tier 1
  'san-francisco-goods-6': 'b_deliboard', //                       Sandwiches
  'richmond-goods2-1': 'b_brazucaacai', //                         no açaí seat, Ice cream is Waffles Cream's; yellow sheet, Tier 1
  'san-rafael-services-4': 'b_gravityvaultmarin', //               Gym — "Marin"; San Rafael is on their address
  'lafayette-goods2-1': 'b_batchandbrine', //                      Burgers is Kabab Burger's; yellow sheet, Tier 1
  'beasty-online-4': 'b_pupcup', //                                Bags and luggage — a dog travel bottle; Pet goods is Pawddle's
  'walnut-creek-goods-2': 'b_thaithanioishi', //                   Asian food — Thai and sushi
  'milpitas-goods-13': 'b_brewandbanhmi', //                       Coffee shop
  'oakland-goods-4': 'b_delageoakland', //                         Sushi
  'livermore-goods2-0': 'b_tajmahallivermore', //                  Indian is Pijja Paradise's; yellow sheet, Tier 1
  'san-francisco-goods2-13': 'b_shodaisf', //                      no yakiniku seat; yellow sheet, Tier 1
  'san-leandro-goods-14': 'b_thirsteasanleandro', //               Boba shop
  'san-francisco-goods2-14': 'b_zandypekingduck', //               Asian food is House of Thai's; yellow sheet, Tier 1
  'oakland-services-0': 'b_bibosalon', //                          Barber and salon
  'oakland-goods2-6': 'b_pizzadeliandgrill', //                    Italian is Philomena Pizza's; yellow sheet, Tier 1
  'berkeley-goods2-1': 'b_calburger', //                           Burgers is Dog Haus's; yellow sheet, Tier 1
  /* 2026-09-17: eight from Tuesday night and Wednesday. The Local gets the
     glow he asked for; Mile Limit and it both carry a film. */
  'brentwood-goods2-0': 'b_roasteateryco', //                      Asian food is X Noodles'; yellow sheet, Tier 1
  'brentwood-goods2-2': 'b_dimsumbasket', //                        same plaza, same seat taken; yellow sheet, Tier 1
  'brentwood-services2-0': 'b_brentwoodrehabpt', //                 no clinic seat; yellow sheet, Tier 1
  'san-rafael-goods-11': 'b_doublerainbowcafe', //                  Ice cream shop — a café at Autistry Studios
  'san-francisco-services2-10': 'b_studiofloras', //                no craft-workshop seat; yellow sheet, Tier 1
  'petaluma-goods-6': 'b_thelocalpetaluma', //                      Sandwiches — his own delivery customer, with the glow
  'berkeley-goods-9': 'b_milelimitberkeley', //                     Mediterranean
  'livermore-goods-11': 'b_dumontlivermore', //                     Ice cream shop
  /* 2026-09-17 to 21, research/roster/batch27.json: fifty-eight seats for
     about forty businesses, the pink glow for Jazz Braids of Janelle's circle, and
     three films. See that file's flags for every fact. */
  'oakland-goods-12': 'b_realcutiepies', //                        Bakery
  'daly-city-goods-2': 'b_kankiin', //                             Asian food
  'san-francisco-goods-0': 'b_lovelysburgerssf', //                Burgers; read-only menu, their to-go rule
  'oakland-goods2-7': 'b_lovelysburgersoakland', //                Burgers is Cafe Noir's; yellow sheet, Tier 1
  'san-francisco-goods-16': 'b_whackdonuts', //                    Donuts
  'san-francisco-goods2-15': 'b_goldengatemarketdeli', //          Sandwiches is Deli Board's; the whole page, for the film
  'san-francisco-goods2-16': 'b_mochicasf', //                     no Peruvian seat; yellow sheet, Tier 1
  'dublin-goods-1': 'b_taqueriaaztecadublin', //                   Mexican
  'dublin-goods-2': 'b_eastbaybuffet', //                          Asian food
  'oakland-goods2-8': 'b_lachicharronadacolombiana', //            no Colombian seat; yellow sheet, Tier 1
  'richmond-goods-5': 'b_goldpiepizza', //                         Italian
  'oakland-goods2-9': 'b_tadaramen', //                            Korean and ramen is Belly's; yellow sheet, Tier 1
  'san-francisco-goods2-17': 'b_barsprezzatura', //                Italian is Stella's; yellow sheet, Tier 1
  'san-jose-goods2-4': 'b_poorhousebistro', //                     no New Orleans seat; yellow sheet, Tier 1
  'albany-goods-4': 'b_sakanasushialbany', //                      Sushi
  'emeryville-goods-5': 'b_pizzagallery', //                       Italian; the first halal mark
  'napa-goods-0': 'b_napayard', //                                 Burgers; no bar seat
  'san-jose-goods2-5': 'b_mimosaswillowglen', //                   no brunch seat; yellow sheet, Tier 1
  'danville-services2-0': 'b_dreamlandartplay', //                 no kids' play seat; yellow sheet, Tier 1
  'san-bruno-goods2-0': 'b_cajunbowlsanbruno', //                  no seafood seat; yellow sheet, Tier 1
  'san-mateo-goods2-0': 'b_cajunbowlsanmateo', //                  no seafood seat; yellow sheet, Tier 1
  'walnut-creek-goods-4': 'b_okepokewalnutcreek', //               Sushi, for poke
  'san-rafael-goods-13': 'b_sanaacafe', //                         Coffee shop
  'alameda-goods-5': 'b_pastapelican', //                          Italian
  'sunnyvale-goods-14': 'b_almadessert', //                        Boba
  'albany-goods2-0': 'b_brezoalbany', //                           no Californian seat; yellow sheet, Tier 1
  'walnut-creek-goods-1': 'b_tacoswalnutcreek', //                 Mexican
  'san-leandro-goods-2': 'b_yummyyummyhibachisanleandro', //       Asian food
  'oakland-goods2-12': 'b_yummyyummyhibachi73rd', //               Asian is Cambodian Street Food's; the whole page, for the film
  'oakland-goods2-13': 'b_yummyyummyhibachipiedmont', //           the same, their second Oakland shop
  'foster-city-goods2-0': 'b_toastintown', //                      no brunch seat; yellow sheet, Tier 1
  'antioch-services-4': 'b_barrebeat', //                          Gym; his label said Goods
  'oakland-goods2-10': 'b_nossooakland', //                        a lounge; yellow sheet, Tier 1
  'san-leandro-goods-1': 'b_elportalsanleandro', //                Mexican
  'san-francisco-goods2-18': 'b_kitavasf', //                      no gluten-free seat; yellow sheet, Tier 1
  'oakland-goods2-11': 'b_kitavaoakland', //                       the same
  'albany-goods2-1': 'b_kitavaalbany', //                          the same
  'walnut-creek-goods2-4': 'b_kitavawalnutcreek', //               the same
  'union-city-services-4': 'b_betweentheplants', //                Gym, for reformer Pilates
  'vacaville-goods2-0': 'b_pampasvacaville', //                    no steakhouse seat; yellow sheet, Tier 1
  'walnut-creek-services2-2': 'b_essencebjj', //                   Gym is TruFusion's; yellow sheet, Tier 1
  'newark-goods-12': 'b_dripdesserthouse', //                      Bakery
  'san-francisco-services-16': 'b_regentthaimassage', //           Massage
  'san-francisco-goods2-19': 'b_holbrookhouse', //                 a bar; yellow sheet, Tier 1
  'santa-rosa-goods-7': 'b_seoultotokyokitchen', //                Korean and ramen
  'san-jose-services2-2': 'b_bustdownco', //                       no jeweller seat; yellow sheet, Tier 1
  'newark-services-0': 'b_jazzbraids', //                          Barber and salon — from Janelle's circle, pink glow
  'concord-services-0': 'b_caballerosbarberlounge', //             Barber and salon
  'antioch-services-19': 'b_moaeventsrentals', //                  Event coordinator
  'south-san-francisco-goods-2': 'b_hlpeninsulasouthsf', //        Asian food
  'burlingame-goods-2': 'b_hlpeninsulapearl', //                   Asian food
  'castro-valley-goods-2': 'b_hlpeninsulacastrovalley', //         Asian food
  'burlingame-goods2-0': 'b_hlpeninsulagarden', //                 their second Burlingame room; yellow sheet, Tier 1
  'milpitas-goods2-1': 'b_hlpeninsulamilpitas', //                 Asian is International Kitchen's; yellow sheet, Tier 1
  'santa-clara-goods-9': 'b_thehalalcartel', //                    Mediterranean; halal
  'antioch-goods2-2': 'b_thecozyoven', //                          Bakery is Butter Pecan's; yellow sheet, Tier 1
  /* 2026-09-21, Leon: "move the app with glowing ones to the first page".
     Every glowing tile now sits on BEASTY • Goods, the first page a visitor
     sees: Midnite Theories, Chef Jeff's and Gao were already there, and The
     Local, Jazz Braids (seat 15, above) and Bust Down & Co. join them. The
     Local keeps its Petaluma seat, which he is using to recruit that city;
     Jazz Braids keeps Newark and Bust Down keeps its San Jose listing, but
     both leave the BEASTY services yellow sheet so neither shows twice there.

     The three who made room are the page's tiles with no menu that keep a
     city seat of their own. They move to the yellow sheet right behind it,
     not off the BEASTY pages: Sin City Pits (Las Vegas), Tony's Style (Albany)
     and Lucky Three Seven (Oakland). */
  'beasty-goods-13': 'b_thelocalpetaluma', //                     The Local — glow; was Sin City Pits
  'beasty-goods-23': 'b_bustdowncobeasty', //                     Bust Down & Co. — glow; was Lucky Three Seven
  'beasty-goods2-14': 'b_sincitypits', //                          from page one, seat 14
  'beasty-goods2-15': 'b_tonysstyle', //                           from page one, seat 15
  'beasty-goods2-16': 'b_luckythreeseven', //                      from page one, seat 24
  /* 2026-09-21, evening: Penelope's five shops ("Berkeley • Goods (5
     locations)"), Catch and Brasil Bistro on yellow sheets because seafood
     and Brazilian have no seat, MYO on Walnut Creek's because its Ice cream
     seat is Milky Flakes', and The Hub on San Ramon's pet seat. */
  'berkeley-goods-13': 'b_penelopescoffeeberkeley', //             Coffee shop
  'san-francisco-goods2-20': 'b_penelopescoffeesf', //             Coffee shop is The Farmacy's; yellow sheet, Tier 1
  'foster-city-goods-13': 'b_penelopescoffeefostercity', //        Coffee shop
  'san-mateo-goods-13': 'b_penelopescoffeesanmateo', //            Coffee shop
  'daly-city-goods-13': 'b_penelopescoffeedalycity', //            Coffee shop
  'san-francisco-goods2-21': 'b_catchsf', //                       no seafood seat; yellow sheet, Tier 1
  'el-cerrito-goods2-0': 'b_brasilbistro', //                      no Brazilian seat; yellow sheet, Tier 1
  'walnut-creek-goods2-5': 'b_myofrozenyogurtwalnutcreek', //      Ice cream shop is Milky Flakes'; yellow sheet, Tier 1
  'san-ramon-services-14': 'b_thehubpackanimals', //               Pet grooming and walking: a gym for dogs
}
