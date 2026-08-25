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
  'beasty-services2-0': 'b_happybaypaws',
  'pleasant-hill-goods2-0': 'b_thehangoutbreakfast',
  'walnut-creek-goods2-0': 'b_thehangoutbreakfast',
}
