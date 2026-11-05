/*
  BEASTY CATEGORY PAGES — "a multitude of BEASTY pages as its own individual
  categories". Glenn, 2026-09-30:

    "These categories will be searchable and the best 24 of each category will
    hold their spot."
    "BEASTY • Tatoo. The top 24 tattooist in the Bay Area. No matter what city
    they are in … And each affiliate will be on their own cities page as well."
    "Now repeat that idea for every category page."
    "we will limit the amount of pages on the home screen to let's say 9
    categories … all of these extra categories are searchable."

  Plain data, like slots.ts: no BRANDS import here, so anything that only needs
  the names (the landing page, the server's kind check) stays light. Which
  businesses sit on each page is worked out in categorySeats.ts.

  HOW A PAGE FILLS. A seat set by hand (`beasty-tattoo-0` in placements.ts)
  always wins and keeps its number: that is a spot somebody has been sold or
  promised. The rest of the twenty-four fill from businesses already on
  BEASTY whose own type line (`cuisine`) says they belong, in the order they
  joined, one tile per business however many locations it has. The seat a
  business holds on a city page does NOT decide it: those seats were filled
  wherever there was room, so the Barber seats also hold a brew boat and a
  vineyard.

  `test` reads the business's type line only. `not` takes out the near misses
  a test would otherwise pull in ("Custom cakes" is not a whip).
*/

export interface BeastyCategory {
  /** The word in a seat id: `beasty-tattoo-5`. Lower case letters only. */
  kind: string
  /** Follows BEASTY on the page heading: BEASTY · Tattoo. */
  heading: string
  /** One line for the Categories list in Search. */
  about: string
  /** Its own background, public/wallpapers/cat-<kind>.webp (tools/make-category-walls.py). */
  wall: string
  /** Which businesses belong, read from their type line. */
  test?: RegExp
  not?: RegExp
}

const wall = (kind: string) => `/wallpapers/cat-${kind}.webp`

/** In the order Glenn listed them on 2026-09-30, with Tattoo from his example. */
export const BEASTY_CATEGORIES: BeastyCategory[] = [
  { kind: 'games', heading: 'Games', about: 'Video games, consoles and trade-ins', wall: wall('games'), test: /video game|gaming|arcade|console|comics and games/i },
  { kind: 'tattoo', heading: 'Tattoo', about: 'Tattoo artists and studios', wall: wall('tattoo'), test: /tattoo/i },
  { kind: 'athletes', heading: 'Athletes', about: 'Athletes and the brands they run', wall: wall('athletes'), test: /\bathlete/i },
  { kind: 'ai', heading: 'AI', about: 'AI products and the people building them', wall: wall('ai'), test: /\bAI\b|artificial intelligence/ },
  { kind: 'artists', heading: 'Artists', about: 'Painters, muralists and musicians', wall: wall('artists'), test: /\bartist\b|mural|vinyl art|custom art/i, not: /tattoo/i },
  { kind: 'dancers', heading: 'Dancers', about: 'Dancers and dance crews', wall: wall('dancers'), test: /\bdancers?\b|dance crew/i },
  { kind: 'donations', heading: 'Donations', about: 'Causes and foundations to give to', wall: wall('donations'), test: /foundation|non-?profit|charity/i },
  { kind: 'djs', heading: "DJ's", about: 'DJs for parties and events', wall: wall('djs'), test: /\bDJ\b/ },
  /* Glenn, 2026-10-10: "change BEASTY • Cooks to BEASTY • Chefs instead". The kind stays
     'cooks', so every seat id and the wallpaper carry on as they were. */
  { kind: 'cooks', heading: 'Chefs', about: 'Chefs, caterers and private chefs', wall: wall('cooks'), test: /catering|private chef|personal chef/i },
  { kind: 'foodies', heading: 'Foodies', about: 'Food reviewers and creators', wall: wall('foodies'), test: /food reviewer|food blogger/i },
  { kind: 'realtors', heading: 'Realtors', about: 'Real estate agents', wall: wall('realtors'), test: /real estate|realtor|realty/i },
  /* "BEASTY • PODCAST — NEW CATEGORY, please create brother. This is a great category
     that we can collab with." — Glenn, 2026-10-12, with That's Good PizzZa Podcast.
     A podcast also fits Media's type line, so it can hold a spot on both;
     it comes before Media so a podcast's page says BEASTY • Podcast. */
  { kind: 'podcast', heading: 'Podcast', about: 'Podcasts and shows to collab with', wall: wall('podcast'), test: /\bpodcast/i },
  { kind: 'media', heading: 'Media', about: 'Media companies and creators', wall: wall('media'), test: /media company|creative agency|\bpodcast|\bmagazine/i },
  { kind: 'photographers', heading: 'Photographers', about: 'Photographers, videographers and photo booths', wall: wall('photographers'), test: /photo|videograph|video production/i },
  /*
    AUTOMOTIVE was this page's first name, Whips. Glenn, 2026-10-04: "change
    BEASTY • whips to BEASTY • Automotive since all those affiliates are there
    already. Then create a new BEASTY • Whips and add Meter SF on there as the
    1st spot." So the shops are here, with the repair shops added, and Whips
    below is for the cars themselves.
  */
  { kind: 'automotive', heading: 'Automotive', about: 'Detailing, tint, wraps, car audio and repair', wall: wall('automotive'), test: /car audio|auto (detail|spa|design|repair|body|service)|detailing|tint|paint protection|\bppf\b|car wash|vinyl wrap|mechanic|smog|muffler|brake|\btires?\b|auto ?sport|collision|headlight/i, not: /cake|jewel/i },
  /* "I want to start the BEASTY • Whips with my boys car right here … Just name
     his page MeterSF" — Glenn, 2026-10-04. Builds and the people behind them;
     seated by hand only (placements.ts), so nothing fills it by itself. */
  { kind: 'whips', heading: 'Whips', about: 'Custom cars and the people who build them', wall: wall('whips') },
  { kind: 'pits', heading: "Pit's", about: 'Pit bull kennels and breeders', wall: wall('pits'), test: /pit ?bull/i },
  /* "BEASTY • Pets" — Glenn, 2026-10-09, with King Lou's single-ingredient
     treats, which hold spot 1 by hand (placements.ts). Everything else whose
     type line is about pets fills it: groomers, walkers, daycare, pet gear.
     Hot dogs and the like are not pets, and breeding stays on Pit's. */
  { kind: 'pets', heading: 'Pets', about: 'Pet food, treats, grooming and care', wall: wall('pets'), test: /\bpets?\b|\bdogs?\b|\bdoggy\b|\bcats?\b|\bpupp(y|ies)\b|\bkennels?\b|\bk9\b|\bcanine\b|\bfeline\b/i, not: /pit ?bull|hot ?dogs?|corn ?dogs?|burgers? ?& ?dogs|breed|reproduction/i },
  { kind: 'models', heading: 'Models', about: 'Models and modeling agencies', wall: wall('models'), test: /\bmodel(s|ing)?\b/i },
  { kind: 'meats', heading: 'Meats', about: 'Independent ranchers and butchers', wall: wall('meats'), test: /rancher|\branch\b|butcher/i },
  { kind: 'gyms', heading: 'Gyms', about: 'Gyms, studios and climbing walls', wall: wall('gyms'), test: /\bgym\b|fitness|crossfit|boxing|climbing|yoga|barre|martial arts|pilates/i },
  { kind: 'barbershops', heading: 'Barbershops', about: 'Barbers, cuts and shaves', wall: wall('barbershops'), test: /barber/i },
  { kind: 'salons', heading: 'Salons', about: 'Hair, nails, braids and beauty', wall: wall('salons'), test: /salon|braid|\bnails?\b|beauty|lash/i, not: /barber/i },
  /* "Can you create a BEASTY • AYCE page and put it after BEASTY • Sweets. I know
     a dozen already to put on that page" — Glenn, 2026-10-02. */
  { kind: 'ayce', heading: 'AYCE', about: 'All you can eat', wall: wall('ayce'), test: /\bayce\b|all[- ]you[- ]can[- ]eat/i },
  /* "BEASTY • Food Trucks … There's so many of them too" — Glenn, 2026-09-30,
     on Leon's "We should target food trucks more". */
  { kind: 'foodtrucks', heading: 'Food Trucks', about: 'Food trucks and pop-ups', wall: wall('foodtrucks'), test: /food truck|taco truck|\btruck\b/i, not: /brew|taproom|winery/i },
  /* "We should create a BEASTY • Coffee page to put into the BEASTY • Pages
     category" — Glenn, 2026-10-03. Boba has its own spot on Sweets. */
  /* Glenn, 2026-10-12: "Should we change BEASTY • Coffee to BEASTY • Cafe?", and Leon:
     "Yeah beasty cafe sounds better". The kind stays 'coffee', so every seat id and the
     wallpaper carry on; the type line test is unchanged, so no seat moves. */
  { kind: 'coffee', heading: 'Coffee/teas', about: 'Coffee shops, roasters, tea, matcha and boba', wall: wall('coffee'), test: /coffee|espresso|roaster|\bteas?\b|matcha|boba/i },
  /* "Hey brother, please add a New category for BEASTY • Bakery" — Glenn, 2026-10-11.
     Bread, pastry and cake shops; a bakery is often a dessert shop too, so it can
     hold a spot here and on Sweets, the way a café is on Coffee and its city. */
  { kind: 'bakery', heading: 'Bakery', about: 'Bakeries, bread, pastry and cakes', wall: wall('bakery'), test: /bakery|bakeries|bakeshop|bake shop|boulangerie|patisserie|pâtisserie|panader|bread|croissant|pastr/i, not: /bread winners|breaded/i },
  /* Glenn, 2026-10-14 to 15, four new pages in one evening:
     "New category BEASTY • Juice", with Go Fresh in Oakland;
     "New Category BEASTY • Bar/lounge", with J&A Lounge in Santa Rosa;
     "New Category BEASTY • Events";
     "New category BEASTY • Youth", with a picture of two kids, arms up.
     Each fills by type line like the rest. A juice bar can be on Sweets too, a bar
     with a kitchen on Eats; a mobile bar is an Events business, not a Bar/Lounge.
     Youth leaves out dog daycare and kids' menus. */
  { kind: 'juice', heading: 'Juice', about: 'Juice bars, smoothies and açaí bowls', wall: wall('juice'), test: /\bjuices?\b|smoothie|a[cç]a[ií]\b|cold[- ]pressed/i, not: /juicy/i },
  /* Renamed Bar/Lounge/Pub on 2026-10-23, as Glenn wrote it twice with Powder Keg Pub. The kind
     stays 'bars', so every seat id and the wallpaper carry on; the test already took pubs. */
  { kind: 'bars', heading: 'Bar/Lounge/Pub', about: 'Bars, lounges, pubs and taprooms', wall: wall('bars'), test: /\blounge\b|cocktail bar|sports bar|wine bar|\bbar ?& ?(grill|kitchen|restaurant)|brewpub|\bpub\b|tavern|speakeasy|hookah|nightclub|full bar|taproom|beer garden/i, not: /juice|smoothie|oyster|salad|mobile|nail|lash|brow|tea lounge|cigar/i },
  { kind: 'events', heading: 'Events', about: 'Event rentals, mobile bars and planners', wall: wall('events'), test: /event (planning|planner|venue|rental|space)|events? (company|planner|venue|rentals?)|party rentals?|bounce house|mobile (cocktail )?bar|bartending|wedding planner|balloon|party entertain/i },
  { kind: 'youth', heading: 'Youth', about: "Kids' clubs, classes, camps and play", wall: wall('youth'), test: /\byouth\b|\bkids?'?\b|children|tutor|summer camp|after[- ]?school|preschool/i, not: /kids? menu|kid-friendly|\bdogs?\b|\bpets?\b/i },
  /* "New category Health/Beauty" — Glenn, 2026-10-18, with Radiant Med Spas in Fremont.
     Med spas, aesthetics and wellness clinics. Hair, nails and lashes stay on Salons. */
  /* Glenn, 2026-10-23, 5:20 pm: "New category BEASTY • FROYO", with a reel of Yiaya in Palo Alto.
     Frozen yogurt shops by their type line; a froyo shop can hold Sweets' Soft serve spot too. */
  { kind: 'froyo', heading: 'FROYO', about: 'Frozen yogurt shops', wall: wall('froyo'), test: /frozen yogh?urt|froyo|fro-yo/i },
  /* Glenn, 2026-10-24, 4:48 am: "New Category BEASTY • Catering", with Inda & Mely in San Bruno.
     Caterers and restaurants that cater, by type line. Chefs keeps private and personal chefs. */
  { kind: 'catering', heading: 'Catering', about: 'Caterers and restaurants that cater', wall: wall('catering'), test: /catering|caterer/i },
  /* Glenn, 2026-10-26, 7:48 am: "New category / BEASTY • Steakhouse", between Bourbon Steak and
     Harris' and Blind Butcher in San Francisco. Steakhouses and chophouses by their type line. */
  /* Glenn, 2026-10-27, 6:28 pm: "Sunnyvale • Eats / BEASTY • Ramen / New Category", with Garlic High.
     Ramen shops by their type line. */
  /* Glenn, 2026-10-28, 8:38 pm: "BEASTY • Dim Sum / New Category"; at 8:39–8:41 asks
     "Dumplings or Dim Sum?", then "You choose". Leon replies "Dim sum I think" at 9:11 pm and
     Glenn likes it at 9:12 pm. Dim Sum is the final heading; Search also finds "dumplings". */
  /* Glenn, 2026-10-29: new Hot Pot (Mumu Sunnyvale) and BBQ (Wooga Cupertino). */
  { kind: 'hotpot', heading: 'Hot Pot', about: 'Hot pot and shabu-shabu restaurants', wall: wall('hotpot'), test: /hot[ -]?pot|shabu[ -]?shabu/i },
  { kind: 'bbq', heading: 'BBQ', about: 'Barbecue, smokehouses and Korean BBQ', wall: wall('bbq'), test: /\bbbq\b|barbecue|barbeque|smoked meat|smokehouse/i },
  { kind: 'dimsum', heading: 'Dim Sum', about: 'Dim sum, dumplings and soup buns', wall: wall('dimsum'), test: /dim[ -]?sum|dumplings?|xiao[ -]?long[ -]?bao/i },
  { kind: 'icecream', heading: 'Ice Cream', about: 'Independent ice cream shops', wall: wall('sweets') },
  { kind: 'mobilecart', heading: 'Mobile Cart', about: 'Mobile food and drink carts', wall: wall('coffee') },
  { kind: 'ramen', heading: 'Ramen', about: 'Ramen shops', wall: wall('ramen'), test: /ramen/i },
  { kind: 'steakhouse', heading: 'Steakhouse', about: 'Steakhouses and chophouses', wall: wall('steakhouse'), test: /steak ?house|chop ?house/i },
  /* "New category BEASTY • Breakfast/diner. Or just • diner" — Glenn, 2026-10-22, 8:56 pm.
     His first wording, with Diner as the kind. Diners and breakfast and brunch rooms, by
     their type line; `\bdiner\b` never matches "dinner". A breakfast burrito is a taco
     shop's item, not a breakfast room. */
  { kind: 'diner', heading: 'Breakfast/Diner', about: 'Diners, breakfast and brunch', wall: wall('diner'), test: /\bdiners?\b|breakfast|brunch|pancake house|waffle house/i, not: /burrito|bagel shop|donut|coffee cart/i },
  { kind: 'health', heading: 'Health/Beauty', about: 'Med spas, aesthetics and wellness', wall: wall('health'), test: /med ?spa|medical spa|day spa|aesthetic|botox|injectable|wellness|skin ?care|\biv (therapy|drip)|laser/i, not: /salon|barber|nails?\b|lash|tattoo/i },
  /* Glenn, 29 Oct 3:46 pm: BEASTY • Vegan, with Laughing Monk’s vegan food.
     Its mixed menu is seated by hand; type-based fills use vegan/plant-based businesses. */
  { kind: 'vegan', heading: 'Vegan', about: 'Vegan food and plant-based chefs', wall: wall('vegan'), test: /\bvegan\b|plant[- ]based/i },
  /* Glenn, 29 Oct 6:55 pm, "BEASTY • Yakatori", with Toriman in Capitola. */
  { kind: 'yakitori', heading: 'Yakitori', about: 'Japanese grilled skewers and yakitori bars', wall: wall('yakitori'), test: /yakitori/i },
  /* Glenn, 30 Oct 8:44 am, with San San and CHICHA Berkeley. */
  { kind: 'teas', heading: 'Teas/Boba/Matcha', about: 'Tea houses, boba, milk tea and matcha shops', wall: wall('teas'), test: /\bboba\b|bubble tea|milk tea|\bmatcha\b|\bteas?\b/i },
  /* Glenn, 30 Oct 10:59 am: "New Category / B i P / BEAST in PEACE".
     No entries supplied yet; manual placement only. */
  { kind: 'bip', heading: 'B i P', about: 'BEAST in PEACE', wall: wall('bip') },
  /* Glenn, November 1: family outings, explicitly curated across several venue types. */
  { kind: 'parks', heading: 'Parks/Playgrounds', about: 'Parks, playgrounds and family places', wall: wall('parks') },
  /* Glenn, November 1–2: Blackhawk, Ginza SF and Simplycake. Append to More pages. */
  { kind: 'travel', heading: 'Travel', about: 'Museums, destinations and places to explore', wall: wall('travel') },
  { kind: 'sushi', heading: 'Sushi', about: 'Sushi, sashimi and Japanese sushi restaurants', wall: wall('sushi'), test: /\bsushi\b|sashimi/i },
  { kind: 'cakes', heading: 'Cakes', about: 'Cake shops, celebration cakes and custom cakes', wall: wall('cakes'), test: /\bcakes?\b|patisserie/i, not: /decorating|classes|workshop|crab cake/i },
  /* Glenn, November 2: kennels of any breed; Grande Kennels opens the page. */
  { kind: 'kennels', heading: 'Kennels', about: 'Dog kennels and breeders of every breed', wall: wall('kennels'), test: /\bkennels?\b|\bbreeders?\b/i },
  /* Glenn, November 2: Korean opens with Matzip in Union City. */
  { kind: 'korean', heading: 'Korean', about: 'Korean restaurants and Korean street food', wall: wall('korean'), test: /korean|kimbap|tteok|bulgogi/i },
  // Glenn, November 4: Lemon Crab, Smack Burgers and Arirang open these pages.
  { kind: 'seafood', heading: 'Seafood/Crab Boil', about: 'Seafood restaurants and Cajun crab boils', wall: wall('sushi'), test: /seafood boil|crab boil|cajun seafood|seafood restaurant|oyster bar/i },
  { kind: 'burgers', heading: 'Burgers/Hot Dogs', about: 'Burger joints, smash burgers and hot dog shops', wall: wall('diner'), test: /burgers?|hot[ -]?dogs?/i, not: /catering/i },
  { kind: 'koreanbbq', heading: 'Korean BBQ', about: 'Korean barbecue and Korean grill restaurants', wall: wall('bbq'), test: /korean (bbq|barbecue)|\bkbbq\b/i },
  // Glenn, November 5: Bay Area Crumbs opens Cookies.
  { kind: 'cookies', heading: 'Cookies', about: 'Cookie shops and cookie bakers', wall: wall('bakery'), test: /cookies?/i },
]

/** Every category page holds his twenty-four. */
export const CATEGORY_SPOTS = 24

export const CATEGORY_KINDS: string[] = BEASTY_CATEGORIES.map((c) => c.kind)

export const categoryByKind = (kind: string | undefined): BeastyCategory | undefined =>
  BEASTY_CATEGORIES.find((c) => c.kind === kind)
