/*
  BEASTY • FOODIES. Glenn, 2026-10-03: "when we create BEASTY • Foodies;
  dedicated to the top 24 reviewers, each foodie will have a list of at least a
  dozen or so top reviews that they have from their Instagram on their page.
  This way users can find restaurants based on what they see from each
  reviewers page … a drop-down list of Restaurant names with video clips of
  that restaurant on their BEASTY page." And the same morning: "if a
  restaurant had five different foodies review it. If someone search that
  restaurant, will they be able to see the five different foodies that
  reviewed that restaurant on a list?"

  Two sources of reviews, joined in foodieIndex.ts:
  1. Every film on a business page made by a creator (`clip.by`): that is a
     review of that business, so it counts without being listed here.
  2. The reels Glenn sent as "Foodie" of places that are not on BEASTY, or a
     second review of one that is: OTHER_REVIEWS below, each a link to the
     post. The facts are the post's own caption (place and city).

  The first 24 FOODIE_PAGES keep their original rank. The remaining creators
  have pages on the yellow More foodies sheets, requested 30 October.
  Names are what each account calls itself. Grand-O already has a page on
  Individuals, so @thesnacksensei's reviews go on it instead of a second one.
*/

import type { LocalSeed } from './localBrands'

export interface OtherReview {
  /** The creator's Instagram handle, no @. */
  by: string
  place: string
  city?: string
  /** A business on BEASTY, when it is one. */
  brand?: string
  reel: string
  /** A local film. 'creator' plays on Foodies and Watch and links to the original from the business. */
  clip?: boolean | 'creator'
  /** Source attribution when the posting account differs from the reviewer. */
  credit?: string
}

export interface FoodiePage {
  handle: string
  /** Current profile when the stable page key belongs to an earlier handle. */
  instagram?: string
  name: string
  label: string
  /** Curated travel/music creators need not claim food reviewing as a profession. */
  cuisine?: string
  /** An existing page that is this creator's (Grand-O's), instead of a new one. */
  brand?: string
  /** Original profile artwork supplied for this creator. */
  icon?: string
  glow?: true
}

const reel = (code: string) => `https://www.instagram.com/reel/${code}/`
export const reviewPostCode = (href: string) => /\/(?:reel|p)\/([\w-]+)\//.exec(href)?.[1]

const TOP_FOODIE_PAGES: FoodiePage[] = [
  { handle: 'festusfeasts', icon: "foodie-festusfeasts-v85", name: 'Festus Ezeli', label: 'Festus' },
  { handle: 'thesnacksensei', name: 'Grand-O', label: 'Grand-O', brand: 'b_grando' },
  { handle: 'foodandsachi', icon: "foodie-foodandsachi-v85", name: 'Sachi', label: 'Sachi' },
  { handle: 'hungere.for.diy', icon: "foodie-hungere-for-diy-v85", name: 'Hunger E for DIY', label: 'Hunger E' },
  { handle: 'justmostie', icon: "foodie-justmostie-v85", name: 'Mostie', label: 'Mostie' },
  { handle: 'capturedbysado', icon: "foodie-capturedbysado-v86", name: 'capturedbysado', label: 'Sado' },
  { handle: 'allie.eats', icon: "foodie-allie-eats-v86", name: 'Allie Tong', label: 'Allie Tong' },
  { handle: 'seekeasyeats', icon: "foodie-whofedandrew-v86", instagram: 'whofedandrew', name: 'Andrew Greenstein', label: 'Andrew' },
  { handle: 'orangeginger', name: 'Liz Maw', label: 'Liz Maw' },
  { handle: 'antoinetterzz', name: 'antoinetterzz', label: 'Antoinette' },
  { handle: 'bayarea.kulture', instagram: 'bayarea.kulture', name: 'Bay Area Kulture', label: 'Bay Area Kulture', cuisine: 'Bay Area food and culture', icon: 'foodie-bayarea-kulture-v94', glow: true },
  { handle: 'chefmelissaking', name: 'Melissa King', label: 'Melissa King' },
  { handle: 'celineeats', instagram: 'celineeats', name: 'celine', label: 'Celine', icon: 'foodie-celineeats-v94' },
  { handle: 'grubwitmike', name: 'Grubwitmike', label: 'Grubwitmike' },
  { handle: 'singlecatm0m', name: 'Tiffany', label: 'Tiffany' },
  { handle: 'kimjsseats', name: 'Where Jess at', label: 'Jess' },
  { handle: 'oaktowngrubhub', name: 'NowThatLooksGooD', label: 'Oaktown Grub' },
  { handle: 'thespoonlist', name: 'The Spoon List', label: 'Spoon List' },
  { handle: 'sherryeatworld', name: 'Sherry Shi', label: 'Sherry Shi' },
  { handle: 'booziebrunch', name: 'Novi Mitchell', label: 'Novi' },
  { handle: 'hungrydanz', name: 'Dan', label: 'Dan' },
  { handle: 'iamnikkieg', name: 'Nikkie G', label: 'Nikkie G' },
  { handle: 'janeethefoodie', name: 'Jane', label: 'Jane' },
  { handle: 'peggy_shoo', icon: "foodie-peggy-shoo-v86", name: 'peggy xu', label: 'Peggy' },
]

/* Glenn, 30 Oct 8:26 am: a yellow page for the extended number of foodies.
   Keep the original 24 and every existing seat. These source handles have
   food reviews already in the index; their display names are not guessed.
   Append new creators here so the overflow keeps its seat numbers. */
export const MORE_FOODIE_PAGES: FoodiePage[] = [
  {
    "handle": "zarina.nawabi",
    "name": "@zarina.nawabi",
    "label": "zarina.nawabi"
  },
  {
    "handle": "hungry4munchies",
    "name": "@hungry4munchies",
    "label": "hungry4munchies"
  },
  {
    "handle": "jbrenes_",
    "name": "@jbrenes_",
    "label": "jbrenes_"
  },
  {
    "handle": "simply_dorothy_",
    "name": "@simply_dorothy_",
    "label": "simply_dorothy_"
  },
  {
    "handle": "acoupleofcooks",
    "name": "@acoupleofcooks",
    "label": "acoupleofcooks"
  },
  {
    "handle": "jantrinanicole", icon: "foodie-jantrinanicole-v86",
    "name": "@jantrinanicole",
    "label": "jantrinanicole"
  },
  {
    "handle": "chris.corpz",
    "name": "@chris.corpz",
    "label": "chris.corpz"
  },
  {
    "handle": "thealamedapulse",
    "name": "@thealamedapulse",
    "label": "thealamedapulse"
  },
  {
    "handle": "bayareamunchies510", icon: "foodie-bayareamunchies510-v86",
    "name": "@bayareamunchies510",
    "label": "bayareamunchies510"
  },
  {
    "handle": "victoria.pham17",
    "name": "@victoria.pham17",
    "label": "victoria.pham17"
  },
  {
    "handle": "foodieberrie",
    "name": "@foodieberrie",
    "label": "foodieberrie"
  },
  {
    "handle": "samserved",
    "name": "@samserved",
    "label": "samserved"
  },
  {
    "handle": "areweeatingyet",
    "name": "@areweeatingyet",
    "label": "areweeatingyet"
  },
  {
    "handle": "siusvision",
    "name": "@siusvision",
    "label": "siusvision"
  },
  {
    "handle": "arianasade",
    "name": "@arianasade",
    "label": "arianasade"
  },
  {
    "handle": "bayarea_fooddreamz",
    "name": "@bayarea_fooddreamz",
    "label": "bayarea_fooddreamz"
  },
  {
    "handle": "bayareafoodz",
    "name": "@bayareafoodz",
    "label": "bayareafoodz"
  },
  {
    "handle": "bestbayareafood",
    "name": "@bestbayareafood",
    "label": "bestbayareafood"
  },
  {
    "handle": "annna_eats",
    "name": "@annna_eats",
    "label": "annna_eats"
  },
  {
    "handle": "ugc.with.frances",
    "name": "@ugc.with.frances",
    "label": "ugc.with.frances"
  },
  {
    "handle": "eatwithsie",
    "name": "@eatwithsie",
    "label": "eatwithsie"
  },
  {
    "handle": "daeatzwitbri", icon: "foodie-daeatzwitbri-v85",
    "name": "@daeatzwitbri",
    "label": "daeatzwitbri"
  },
  {"handle": "thetastebud", "name": "@thetastebud", "label": "thetastebud", "icon": "foodie-thetastebud-v92"},
  {
    "handle": "dariananthony_",
    "name": "@dariananthony_",
    "label": "dariananthony_"
  },
  {
    "handle": "charweeezy", icon: "foodie-charweeezy-v86",
    "name": "@charweeezy",
    "label": "charweeezy"
  },
  {
    "handle": "mukbangyourmama",
    "name": "@mukbangyourmama",
    "label": "mukbangyourmama", "icon": "foodie-mukbangyourmama-v88"
  },
  {
    "handle": "wanderingstefany",
    "name": "@wanderingstefany",
    "label": "wanderingstefany"
  },
  {
    "handle": "lifebyvivien",
    "name": "@lifebyvivien",
    "label": "lifebyvivien"
  },
  {
    "handle": "andre___lucas",
    "name": "@andre___lucas",
    "label": "andre___lucas"
  },
  {
    "handle": "shrimpfriedroice",
    "name": "@shrimpfriedroice",
    "label": "shrimpfriedroice"
  },
  {
    "handle": "_cynlacson",
    "name": "@_cynlacson",
    "label": "_cynlacson"
  },
  {
    "handle": "alexytravels",
    "name": "@alexytravels",
    "label": "alexytravels"
  },
  {
    "handle": "andygravs",
    "name": "@andygravs",
    "label": "andygravs"
  },
  {
    "handle": "livingvivalakillah",
    "name": "@livingvivalakillah",
    "label": "livingvivalakillah", "icon": "foodie-livingvivalakillah-v88"
  },
  {
    "handle": "eighty6ix_", icon: "foodie-eighty6ix-v86",
    "name": "@eighty6ix_",
    "label": "eighty6ix_"
  },
  {
    "handle": "mayakay.official",
    "name": "@mayakay.official",
    "label": "mayakay.official"
  },
  {
    "handle": "bayarea.maganda.eats",
    "name": "@bayarea.maganda.eats",
    "label": "bayarea.maganda.eats"
  },
  {
    "handle": "forkmeetsfood",
    "name": "@forkmeetsfood",
    "label": "forkmeetsfood"
  },
  {
    "handle": "foodiesnflightss",
    "name": "@foodiesnflightss",
    "label": "foodiesnflightss"
  },
  {"handle": "carlaylayyy", "name": "Carla Charisse", "label": "Carla", "instagram": "carlacharisse_", "icon": "foodie-carlacharisse-v92"},
  {
    "handle": "shua.tangco",
    "name": "@shua.tangco",
    "label": "shua.tangco"
  },
  {
    "handle": "jenny.home.loans",
    "name": "@jenny.home.loans",
    "label": "jenny.home.loans"
  },
  {
    "handle": "wthellydanyelly", icon: "foodie-wthellydanyelly-v85",
    "name": "@wthellydanyelly",
    "label": "wthellydanyelly"
  },
  {
    "handle": "thekhaysie",
    "name": "@thekhaysie",
    "label": "thekhaysie"
  },
  {
    "handle": "sophiaxbayarea",
    "name": "@sophiaxbayarea",
    "label": "sophiaxbayarea"
  },
  {
    "handle": "sierra.eats.8",
    "name": "@sierra.eats.8",
    "label": "sierra.eats.8"
  },
  {
    "handle": "yo_siiii_foodie",
    "name": "@yo_siiii_foodie",
    "label": "yo_siiii_foodie"
  },
  {
    "handle": "ivkicks",
    "name": "@ivkicks",
    "label": "ivkicks"
  },
  {
    "handle": "itsslydiia",
    "name": "@itsslydiia",
    "label": "itsslydiia"
  },
  {
    "handle": "startingfiresevrywhere",
    "name": "@startingfiresevrywhere",
    "label": "startingfiresevrywhere"
  },
  {
    "handle": "bylizettexo",
    "name": "@bylizettexo",
    "label": "bylizettexo"
  },
  {
    "handle": "aztec.ed",
    "name": "@aztec.ed",
    "label": "aztec.ed",
    "icon": "foodie-aztec-ed-v91",
    "instagram": "aztec.ed"
},
  {
    "handle": "brianthebarber",
    "name": "@brianthebarber",
    "label": "brianthebarber"
  },
  {
    "handle": "ni.ckk_",
    "name": "@ni.ckk_",
    "label": "ni.ckk_"
  },
  {
    "handle": "jamesbaylife",
    "name": "@jamesbaylife",
    "label": "jamesbaylife"
  },
  {
    "handle": "shesvibinhigh",
    "name": "@shesvibinhigh",
    "label": "shesvibinhigh"
  },
  {
    "handle": "imadoniseats", icon: "foodie-imadoniseats-v85",
    "name": "@imadoniseats",
    "label": "imadoniseats"
  },
  {
    "handle": "mzz.juxtaposition",
    "name": "@mzz.juxtaposition",
    "label": "mzz.juxtaposition"
  },
  {"handle": "yourglobalfoodiebff", "name": "@yourglobalfoodiebff", "label": "yourglobalfoodiebff", "icon": "foodie-globalbff-v92"},
  {
    "handle": "dchangshangry",
    "name": "Dan | Your Bay Area Foodie Explorer",
    "label": "Dan", "icon": "foodie-dchangshangry-v87"
  },
  {
    "handle": "bayarea.foodie.san",
    "name": "@bayarea.foodie.san",
    "label": "bayarea.foodie.san"
  },
  {
    "handle": "felicitythefoodie", icon: "foodie-felicitythefoodie-v86",
    "name": "@felicitythefoodie",
    "label": "felicitythefoodie"
  },
  {
    "handle": "trinhdoesthings",
    "name": "@trinhdoesthings",
    "label": "trinhdoesthings"
  },
  {
    "handle": "truly_athi",
    "name": "@truly_athi",
    "label": "truly_athi"
  },
  {
    "handle": "smackinfood",
    "name": "@smackinfood",
    "label": "smackinfood"
  },
  {
    "handle": "jetsetjanine",
    "name": "@jetsetjanine",
    "label": "jetsetjanine"
  },
  {
    "handle": "drooling.bae",
    "name": "@drooling.bae",
    "label": "drooling.bae"
  },
  {
    "handle": "kvbitesandgo",
    "name": "@kvbitesandgo",
    "label": "kvbitesandgo"
  },
  {
    "handle": "stunnaman02",
    "name": "@stunnaman02",
    "label": "stunnaman02"
  },
  {
    "handle": "savorwithcoral",
    "name": "@savorwithcoral",
    "label": "savorwithcoral"
  },
  {
    "handle": "firstdibs.bayarea",
    "name": "@firstdibs.bayarea",
    "label": "firstdibs.bayarea"
  },
  {
    "handle": "margs.out",
    "name": "@margs.out",
    "label": "margs.out"
  },
  {
    "handle": "yogetasworld",
    "name": "@yogetasworld",
    "label": "yogetasworld"
  },
  {
    "handle": "itsmayrazambrano",
    "name": "@itsmayrazambrano",
    "label": "itsmayrazambrano"
  },
  {
    "handle": "your_travel_daddy",
    "name": "@your_travel_daddy",
    "label": "your_travel_daddy"
  },
  {
    "handle": "thesauceboss_",
    "name": "@thesauceboss_",
    "label": "thesauceboss_"
  },
  {
    "handle": "hella._local.mo",
    "name": "@hella._local.mo",
    "label": "hella._local.mo"
  },
  {
    "handle": "thesnobbiefoodie",
    "name": "@thesnobbiefoodie",
    "label": "thesnobbiefoodie", "icon": "foodie-thesnobbiefoodie-v89"
  },
  {
    "handle": "katfoodsf",
    "name": "@katfoodsf",
    "label": "katfoodsf"
  },
  {
    "handle": "charlikestoeat",
    "name": "@charlikestoeat",
    "label": "charlikestoeat"
  },
  {
    "handle": "hellahansel", icon: "foodie-hellahansel-v86",
    "name": "@hellahansel",
    "label": "hellahansel"
  },
  {
    "handle": "geraldfermin",
    "name": "@geraldfermin",
    "label": "geraldfermin"
  },
  {
    "handle": "pimchanyum",
    "name": "@pimchanyum",
    "label": "pimchanyum"
  },
  {
    "handle": "bayareawilson",
    "name": "@bayareawilson",
    "label": "bayareawilson"
  },
  {
    "handle": "whatthejessi_",
    "name": "@whatthejessi_",
    "label": "whatthejessi_"
  },
  {
    "handle": "foodgiveness", icon: "foodie-foodgiveness-v86",
    "name": "@foodgiveness",
    "label": "foodgiveness"
  },
  {
    "handle": "asideofsweet",
    "name": "@asideofsweet",
    "label": "asideofsweet"
  },
  {
    "handle": "tasha.malan",
    "name": "@tasha.malan",
    "label": "tasha.malan"
  },
  {
    "handle": "camemzmin",
    "name": "@camemzmin",
    "label": "camemzmin"
  },
  {
    "handle": "venturewithkelly",
    "name": "@venturewithkelly",
    "label": "venturewithkelly"
  },
  {
    "handle": "cookwithhenny",
    "name": "@cookwithhenny",
    "label": "cookwithhenny"
  },
  {
    "handle": "_aemeriee.dance",
    "name": "@_aemeriee.dance",
    "label": "_aemeriee.dance"
  },
  {
    "handle": "greatonezfoodreview",
    "name": "@greatonezfoodreview",
    "label": "greatonezfoodreview"
  },
  {
    "handle": "mr.smackreviews",
    "name": "@mr.smackreviews",
    "label": "mr.smackreviews"
  },
  {
    "handle": "bp__eats",
    "name": "@bp__eats",
    "label": "bp__eats"
  },
  {
    "handle": "erinlovesfun",
    "name": "@erinlovesfun",
    "label": "erinlovesfun"
  },
  {
    "handle": "lovelivermore",
    "name": "@lovelivermore",
    "label": "lovelivermore"
  },
  {
    "handle": "bayarea.foodie.adventures",
    "name": "@bayarea.foodie.adventures",
    "label": "bayarea.foodie.adventures"
  },
  {
    "handle": "explorewithtaka",
    "name": "@explorewithtaka",
    "label": "explorewithtaka"
  },
  {
    "handle": "thehautesheet",
    "name": "@thehautesheet",
    "label": "thehautesheet"
  },
  {
    "handle": "humminglion",
    "name": "@humminglion",
    "label": "humminglion"
  },
  {
    "handle": "siliconvalley.foodies", icon: "foodie-siliconvalley-foodies-v93",
    "name": "@siliconvalley.foodies",
    "label": "siliconvalley.foodies"
  },
  {
    "handle": "_whatarethechances_",
    "name": "@_whatarethechances_",
    "label": "_whatarethechances_"
  },
  {
    "handle": "jacksdiningroom",
    "name": "@jacksdiningroom",
    "label": "jacksdiningroom"
  },
  {
    "handle": "katwalksf",
    "name": "@katwalksf",
    "label": "katwalksf"
  },
  {
    "handle": "yulmoo_l",
    "name": "@yulmoo_l",
    "label": "yulmoo_l"
  },
  {
    "handle": "barstoolsports",
    "name": "@barstoolsports",
    "label": "barstoolsports"
  },
  {
    "handle": "xo.pinsta",
    "name": "@xo.pinsta",
    "label": "xo.pinsta"
  },
  {"handle": "andreweatsinsf", "name": "@andreweatsinsf", "label": "andreweatsinsf", "icon": "foodie-andrew-v92"},
  {
    "handle": "lovemissfit",
    "name": "@lovemissfit",
    "label": "lovemissfit"
  },
  {
    "handle": "chloe_chomps",
    "name": "@chloe_chomps",
    "label": "chloe_chomps"
  },
  {
    "handle": "realtorandreviewer",
    "name": "@realtorandreviewer",
    "label": "realtorandreviewer"
  },
  {
    "handle": "xoaramarie",
    "name": "@xoaramarie",
    "label": "xoaramarie"
  },
  {
    "handle": "foodie.dreams",
    "name": "@foodie.dreams",
    "label": "foodie.dreams"
  },
  {
    "handle": "eatswithkath",
    "name": "@eatswithkath",
    "label": "eatswithkath"
  },
  {
    "handle": "eatswithfoodie",
    "name": "@eatswithfoodie",
    "label": "eatswithfoodie"
  },
  {
    "handle": "jensintec",
    "name": "@jensintec",
    "label": "jensintec"
  },
  {
    "handle": "snackateriansf",
    "name": "@snackateriansf",
    "label": "snackateriansf"
  },
  {
    "handle": "apoorva_sharma1",
    "name": "@apoorva_sharma1",
    "label": "apoorva_sharma1"
  },
  {
    "handle": "volha_creative",
    "name": "@volha_creative",
    "label": "volha_creative"
  },
  {
    "handle": "boba._.addict",
    "name": "@boba._.addict",
    "label": "boba._.addict"
  },
  {
    "handle": "feed_happiness_",
    "name": "@feed_happiness_",
    "label": "feed_happiness_"
  },
  {
    "handle": "ruthannesturman",
    "name": "@ruthannesturman",
    "label": "ruthannesturman"
  },
  {
    "handle": "larryjunetfm",
    "name": "@larryjunetfm",
    "label": "larryjunetfm"
  },
  {
    "handle": "eileenhuynher",
    "name": "@eileenhuynher",
    "label": "eileenhuynher"
  },
  {
    "handle": "createwithcv",
    "name": "@createwithcv",
    "label": "createwithcv"
  },
  {
    "handle": "aloha_stephanie",
    "name": "@aloha_stephanie",
    "label": "aloha_stephanie"
  },
  {
    "handle": "zoegabon",
    "name": "@zoegabon",
    "label": "zoegabon"
  },
  {
    "handle": "martiwantsmore",
    "name": "@martiwantsmore",
    "label": "martiwantsmore"
  },
  {
    "handle": "byhillaryn",
    "name": "@byhillaryn",
    "label": "byhillaryn"
  },
  {
    "handle": "aly_eats_cali",
    "name": "@aly_eats_cali",
    "label": "aly_eats_cali"
  },
  {
    "handle": "bayarea.foodies",
    "name": "@bayarea.foodies",
    "label": "bayarea.foodies"
  },
  {
    "handle": "moniica.michelle",
    "name": "@moniica.michelle",
    "label": "moniica.michelle"
  },
  {
    "handle": "ryanbyryanchua",
    "name": "@ryanbyryanchua",
    "label": "ryanbyryanchua"
  },
  {
    "handle": "cestalmoco",
    "name": "@cestalmoco",
    "label": "cestalmoco", "icon": "foodie-cestalmoco-v88"
  },
  {
    "handle": "hangrypotato",
    "name": "@hangrypotato",
    "label": "hangrypotato", "icon": "foodie-hangrypotato-v89"
  },
  {
    "handle": "melsotel",
    "name": "@melsotel",
    "label": "melsotel"
  },
  {
    "handle": "sanleandroeats",
    "name": "San Leandro Eats",
    "label": "SL Eats"
  },
  {"handle": "broitsva", "name": "Va", "label": "Va"},
  {"handle": "fat_ash_foodie", "name": "Ash", "label": "Ash", "icon": "foodie-fatash-v92"},
  {"handle": "_foodieshots_", "name": "Joann Ha", "label": "Joann Ha"},
  {"handle": "kitkatvales", "name": "@kitkatvales", "label": "kitkatvales"},
  { handle: 'foodwookie', name: 'FoodWookie', label: 'FoodWookie' },
  {"handle": "kangofrealty", "name": "@kangofrealty", "label": "kangofrealty"},
  {"handle": "sonomacountyliving", "name": "@sonomacountyliving", "label": "sonomacountyliving"},
  {"handle": "lovecartier25", "name": "@lovecartier25", "label": "lovecartier25"},
  {"handle": "foodelaventures", "name": "@foodelaventures", "label": "foodelaventures"},
  {"handle": "fedoramaelle", icon: "foodie-fedoramaelle-v86", "name": "@fedoramaelle", "label": "fedoramaelle"},
  {"handle": "foodie_travel_happiness", "name": "@foodie_travel_happiness", "label": "foodie_travel_happiness"},
  {"handle": "peterlyagent", icon: "foodie-peterlyagent-v85", "name": "Peter Ly", "label": "Peter Ly"},
  {"handle": "k.smokeskitchen", "name": "K. Smokes Kitchen", "label": "K. Smokes", "icon": "foodie-k-smokeskitchen-v86"},
  {"handle": "tysf.qods", "name": "@tysf.qods", "label": "tysf.qods", "icon": "foodie-tysf-qods-v86"},
  {"handle": "ilisaeatssf", "name": "@ilisaeatssf", "label": "ilisaeatssf", "icon": "foodie-ilisaeatssf-v86"},
  {"handle": "tundemodupee", "name": "Tunde Modupe", "label": "Tunde", "icon": "foodie-tundemodupee-v86"},
  {"handle": "wafflebam", "name": "@wafflebam", "label": "Wafflebam", "icon": "foodie-wafflebam-v86"},
  {"handle": "goyuliiago", "name": "@goyuliiago", "label": "goyuliiago", "icon": "foodie-goyuliiago-v86"},
  {"handle": "jamiebeoutside", "name": "@jamiebeoutside", "label": "Jamie", "icon": "foodie-jamiebeoutside-v86"},
  {"handle": "pastrywithjenn", "name": "Jenn Yee", "label": "Jenn", "icon": "foodie-pastrywithjenn-v86"},
  {"handle": "anjali_wandersoul", "name": "@anjali_wandersoul", "label": "Anjali", "icon": "foodie-anjali-wandersoul-v86", "cuisine": "Travel creator"},
  {"handle": "travelwtiff", "name": "@travelwtiff", "label": "Tiffany", "icon": "foodie-travelwtiff-v86"},
  {"handle": "gabriiellas", "name": "@gabriiellas", "label": "gabriiellas", "icon": "foodie-gabriiellas-v86"},
  {"handle": "ploinsanfrancisco", "name": "P-LO | SF Bay Area Food + Travel", "label": "P-LO SF", "icon": "foodie-ploinsanfrancisco-v86"},
  {"handle": "piscesprincesspriya", "name": "Priya", "label": "Priya", "icon": "foodie-piscesprincesspriya-v86"},
  {"handle": "d_baylock_", "name": "DateNight | D", "label": "DateNight D", "icon": "foodie-d-baylock-v86"},
  {"handle": "hallojessa", "name": "Jessa Dee Carino", "label": "Jessa", "icon": "foodie-hallojessa-v86"},
  {"handle": "lagrandedelabanda", "name": "Cynthia La Grande Silva", "label": "La Grande", "icon": "foodie-lagrandedelabanda-v86", "cuisine": "Singer, songwriter and food visits"},
  {"handle": "chaudownfood", "name": "Angie", "label": "Angie", "icon": "foodie-chaudownfood-v86"},
  {"handle": "_emwong_", "name": "Emma Wong-Stephens", "label": "Emma", "icon": "foodie-emwong-v86"},
  {"handle": "phoebe8food", "name": "Phoebe", "label": "Phoebe", "icon": "foodie-phoebe8food-v86"},
  {"handle": "karaxhuynh", "name": "Kara Huynh", "label": "Kara", "icon": "foodie-karaxhuynh-v86"},
  {"handle": "wakeyeats", "name": "Weiqi", "label": "Weiqi", "icon": "foodie-wakeyeats-v86"},
  {"handle": "dodo__eats", "name": "Evan", "label": "Evan", "icon": "foodie-dodo-eats-v86"},
  // Glenn: update icon / Foodie; first requested page for this handle.
  {"handle": "maya_munches", "name": "Maya Waldman • SF Foodie", "label": "Maya", "icon": "foodie-maya-munches-v87"},
  // Batch 88 — append new reviewers without moving existing pages.
  {"handle": "preet.khatrii", "name": "Preet", "label": "Preet", "icon": "foodie-preet-khatrii-v88"},
  {"handle": "kogumahs", "name": "Sinai", "label": "Sinai", "icon": "foodie-kogumahs-v88"},
  {"handle": "nurse.danamae", "name": "Dana Mae", "label": "Dana Mae", "icon": "foodie-nurse-danamae-v88"},
  {"handle": "kimoni.eatss", "name": "Kimball & Monica", "label": "Kimoni", "icon": "foodie-kimoni-eatss-v88"},
  // Batch 89 — append newcomers; earlier Foodie positions are fixed.
  {"handle": "thehabibizeat", "name": "The Habibiz Eat", "label": "Habibiz", "icon": "foodie-thehabibizeat-v89"},
  {"handle": "eatwithbooboo", "name": "Eat with Booboo", "label": "Booboo", "icon": "foodie-eatwithbooboo-v89"},
  {"handle": "bayarea_foodogram", "name": "Lavanya & Deepthi", "label": "Foodogram", "icon": "foodie-bayarea-foodogram-v89"},
  {"handle": "lub.to.eat", "name": "Lub Lub", "label": "Lub Lub", "icon": "foodie-lub-to-eat-v89"},
  {"handle": "thismajourney", "name": "Denise", "label": "Denise", "icon": "foodie-thismajourney-v89"},
  {"handle": "summer.ishungry", "name": "Summer", "label": "Summer", "icon": "foodie-summer-ishungry-v89"},
  {"handle": "justfeediris", "name": "Iris", "label": "Iris", "icon": "foodie-justfeediris-v89"},
  // Batch 90 — original-image permission hold for Hee Jin is in docs/BATCH-90.md.
  {"handle": "hungryhungryheejin", "instagram": "hungryhungryheejin", "name": "Hee Jin", "label": "Hee Jin"},
  {"handle": "liltiffyvert", "instagram": "liltiffyvert", "name": "Tiffany Tran", "label": "Tiffany", "icon": "foodie-liltiffyvert-v90"},
  {"handle": "jovana.camberos", "instagram": "jovana.camberos", "name": "@jovana.camberos", "label": "Jovana", "icon": "foodie-jovana-camberos-v90"},
  {"handle": "sulli_eats", "instagram": "sulli_eats", "name": "𑣲𝓢𝓾𝓵𝓵𝓲 𓎩 ꜱꜰ ʙᴀʏ ᴀʀᴇᴀ ꜰᴏᴏᴅɪᴇ/ʜᴏᴍᴇᴄᴏᴏᴋꜱ", "label": "𑣲𝓢𝓾𝓵𝓵𝓲", "icon": "foodie-sulli-eats-v92"},
  {"handle": "baygirlseat", "instagram": "baygirlseat", "name": "Amandy", "label": "Amandy", "icon": "foodie-baygirlseat-v92"},
  {"handle": "phamamiii", "instagram": "phamamiii", "name": "Diane Pham", "label": "Diane", "icon": "foodie-phamamiii-v92"},
  {"handle": "heraldh", "instagram": "heraldh", "name": "Herald John", "label": "Herald", "icon": "foodie-heraldh-v92"},
  {"handle": "tastewith.rach", "instagram": "tastewith.rach", "name": "rachel🍴bay area, ca 🇵🇭", "label": "rachel🍴bay", "icon": "foodie-tastewithrach-v92"},
  {"handle": "foodiswhyimbroke", "instagram": "foodiswhyimbroke", "name": "Yen Kim Phan", "label": "Yen", "icon": "foodie-foodiswhyimbroke-v92"},
  {"handle": "keneats_", "instagram": "keneats_", "name": "kenya // sf bay area foodie 😋", "label": "kenya", "icon": "foodie-keneats-v92"},
  {"handle": "e40", "name": "E-40", "label": "E-40", "brand": "b_e40"},
  {"handle": "mamamarquez888", "instagram": "mamamarquez888", "name": "Megan Marquez", "label": "Megan", "icon": "foodie-mamamarquez-v92"},
  {"handle": "sisicooksandeats", "instagram": "sisicooksandeats", "name": "$i$i 🐐 THE GOAT", "label": "$i$i", "icon": "foodie-sisicooks-v92"},
  {"handle": "reelkevo", "instagram": "reelkevo", "name": "Kevin", "label": "Kevin", "icon": "foodie-reelkevo-v92"},
  {"handle": "myrealtoralexbradeis", "instagram": "myrealtoralexbradeis", "name": "Alex Bradeis", "label": "Alex", "icon": "foodie-alexbradeis-v92"},
  {"handle": "rollingwithdeneats", "instagram": "rollingwithdeneats", "name": "Denise", "label": "Denise", "icon": "foodie-denise-v92"},
  {"handle": "rowbot408", "instagram": "rowbot408", "name": "𝐑 𝐎 𝐖 📻💕🇵🇭", "label": "𝐑", "cuisine": "Event host and creator"},
  {"handle": "revrocrichboy", "instagram": "revrocrichboy", "name": "Ricardo Vicente", "label": "Ricardo", "icon": "foodie-revrocrichboy-v92", "cuisine": "Print shop and creator"},
  // Batch 94: Tuck moves to More Foodies when Bay Area Kulture takes the center seat.
  { handle: 'takeoutwithtuck', name: 'The Honest Reviewer', label: 'Tuck' },
  {"handle": "kat.dazzzle", "name": "Kat", "label": "Kat", "icon": "foodie-kat-dazzzle-v94", "instagram": "kat.dazzzle"},
  {"handle": "queen.food.e", "name": "Queen Food E", "label": "Queen Food E", "icon": "foodie-queen-food-e-v94", "instagram": "queen.food.e"},
  {"handle": "cindydreamtravel", "name": "Cindy", "label": "Cindy", "icon": "foodie-cindydreamtravel-v94", "instagram": "cindydreamtravel"},
  {"handle": "yummylouey", "name": "Yummy Louey", "label": "Yummy Louey", "icon": "foodie-yummylouey-v94", "instagram": "yummylouey"},
  {"handle": "agnespittioni", "name": "Agnes Pittioni", "label": "Agnes", "icon": "foodie-agnespittioni-v94", "instagram": "agnespittioni"},
  {"handle": "j00diefoodie", "name": "J00die Foodie", "label": "J00die Foodie", "icon": "foodie-j00diefoodie-v94", "instagram": "j00diefoodie"},
  {"handle": "erica.sorelle", "name": "Erica Sorelle", "label": "Erica", "icon": "foodie-erica-sorelle-v94", "instagram": "erica.sorelle"},
]
export const FOODIE_PAGES: FoodiePage[] = [...TOP_FOODIE_PAGES, ...MORE_FOODIE_PAGES]

/** Reviews that are not a film on a business page. */
export const OTHER_REVIEWS: OtherReview[] = [
  { by: 'festusfeasts', place: 'Terracotta Warriors', city: 'San Francisco', reel: reel('DduKTl4hokY'), clip: true },
  { by: 'hungere.for.diy', place: 'Cavaña', city: 'San Francisco', reel: reel('DdrCC5YhN2z'), clip: true },
  { by: 'justmostie', place: 'Slice House', reel: reel('Dcw6WX7zN-Q'), clip: true },
  { by: 'capturedbysado', place: 'Pier 39', city: 'San Francisco', reel: reel('DdapLKiATum'), clip: true },
  { by: 'capturedbysado', place: 'A corner slice shop', city: 'Livermore', reel: reel('DdCZTx7Ppei'), clip: true },
  { by: 'seekeasyeats', place: 'Whiz Burger', city: 'San Francisco', reel: reel('DLi7ChcvhbM'), clip: true },
  { by: 'orangeginger', place: 'Champ Onigiri', city: 'San Jose', reel: reel('DRGFltxkklB'), clip: true },
  { by: 'chefmelissaking', place: 'Ruby King', city: 'Oakland', reel: reel('DdFgh8TvwdA'), clip: true },
  { by: 'chefmelissaking', place: 'Lana’s', city: 'Oakland', reel: reel('DdU9R3Myj9x'), clip: true },
  { by: 'celineeats', place: 'Souled Out Pastries at Signal Coffee Roasters', reel: reel('Dc2abz8C7CU'), clip: true },
  { by: 'celineeats', place: 'Froyo Park, Krispy Joe’s and Kingpin Donuts', city: 'Berkeley', reel: reel('DdXmljSpM-M'), clip: true },
  { by: 'grubwitmike', place: 'Donut Savant', city: 'Oakland', reel: reel('DdIUO2Jxj1s'), clip: true },
  { by: 'singlecatm0m', place: 'El 2 Carnales Taqueria and Pizzeria', city: 'Stockton', reel: reel('DWwiNxYCSiI'), clip: true },
  /* Glenn, 2026-10-12, "Add to BEASTY • AYCE", with @foodieberrie's reel at Hungry Cow: its
     page keeps Grand-O's film, and this one is listed as a review and plays in the feed. */
  { by: 'foodieberrie', place: 'Hungry Cow', city: 'Fremont', brand: 'b_hungrycow', reel: reel('DeUm0sfx2dO'), clip: true },
  /* Glenn, 2026-10-13, "Foodie", with @_cynlacson's second reel (her first is on Niku-Ya's page). */
  { by: '_cynlacson', place: 'Honolulu Sushi Taco at the 626 Night Market', reel: reel('DeW73CTSLlN'), clip: true },
  { by: 'thesauceboss_', place: 'Deli Board', city: 'San Francisco', brand: 'b_deliboard', reel: reel('DdVGXn4NxbO'), clip: true },
  { by: 'hella._local.mo', place: 'The Burger Spot Co.', city: 'Richmond', brand: 'b_theburgerspotco', reel: reel('Ddo0xf9MplM'), clip: true },
  { by: 'thesnobbiefoodie', place: 'Mensho', city: 'Walnut Creek', reel: reel('DY6Qf_qJdQV') },
  { by: 'wthellydanyelly', place: 'Romana Pizzeria', city: 'Danville', brand: 'b_romanapizzeria', reel: reel('Dd4StNkNAA1') },
  { by: 'katfoodsf', place: 'Butter & Crumble', city: 'San Francisco', reel: reel('C1z-YxlvO12') },
  { by: 'charlikestoeat', place: 'Sergeant Ma', city: 'San Francisco', reel: reel('DdIMBHKPfj_') },
  { by: 'imadoniseats', place: 'Capo’s', city: 'San Francisco', reel: reel('Dcg3Bl_B0iX') },
  { by: 'hellahansel', place: 'Roxie Food Center', city: 'San Francisco', reel: reel('DdNCA9Qyb7W') },
  { by: 'felicitythefoodie', place: 'Early to Rise', city: 'San Francisco', reel: reel('DdN7XUmvmzU') },
  { by: 'geraldfermin', place: 'Apple Fritter', city: 'San Mateo', reel: reel('DTJ0lqhEWoy') },
  { by: 'pimchanyum', place: 'Kuro Nami', city: 'San Anselmo', reel: reel('DBwc4CtSw4Q') },
  { by: 'mukbangyourmama', place: 'Clementine', city: 'Yountville', reel: reel('DdUUdRJKpQd') },
  { by: 'bayareawilson', place: 'Florecita Panaderia', city: 'San Francisco', reel: reel('Ddbm9IwBTWj') },
  { by: 'eighty6ix_', place: 'Infin8 Ilocos Empanada', city: 'San Jose', reel: reel('DIktz2AR_0M') },
  { by: 'charweeezy', place: 'Ry’s Poke Shack', city: 'Mountain View', reel: reel('DdphZkJAn6v') },
  { by: 'whatthejessi_', place: 'Aung Myanmar', city: 'Oakland', reel: reel('DdZ_vmtP9SZ') },
  { by: 'areweeatingyet', place: 'Truong Thanh Restaurant', city: 'Milpitas', reel: reel('DBY9wl6PM3f') },
  { by: 'foodgiveness', place: 'Tony’s Cable Car Restaurant', city: 'San Francisco', reel: reel('Dd2mwZRRBhm') },
  { by: 'asideofsweet', place: 'Britex Fabrics', city: 'San Francisco', reel: reel('Dd-TwU4vo9x') },
  /* Sent with "Foodie" on 2026-10-11, after the same creator's Fusion Dumpling film. */
  { by: 'andre___lucas', place: 'Rize Up Bakery', city: 'San Francisco', reel: reel('DeHpXeES1SE') },
  /* Batch 59, Glenn's "Foodie" sends of 19 and 20 October. Tuck's is a second review: Wing Bros' page plays @justmostie's film. */
  { by: 'wthellydanyelly', place: 'Uncle Jay Burger House', city: 'Concord', reel: reel('DerkBxotJGe') },
  { by: 'takeoutwithtuck', place: 'Wing Bros', brand: 'b_wingbros', reel: reel('DYnTayxSVKT'), clip: true },
  { by: 'tasha.malan', place: 'That’s My Jam', city: 'San Francisco', reel: reel('Ddjs4KSRHcV') },
  /* Glenn's "Foodie" sends of 23 and 24 October: neither place is on BEASTY. Yiaya came with "New category BEASTY • FROYO". */
  { by: 'camemzmin', place: 'Yiaya', city: 'Palo Alto', reel: reel('De1EEbdpP63') },
  { by: 'venturewithkelly', place: 'Super Pan', city: 'San Francisco', reel: reel('DeXNrNVs0Oa') },
  /* Glenn, 24 Oct 5:04 am, "Clip this video plz / 2nd video for their page": Spinning Dough's page plays the durian film, so this is a second review. */
  { by: 'cookwithhenny', place: 'Spinning Dough', city: 'Millbrae', brand: 'b_spinningdough', reel: reel('DYGJe5pPj3q'), clip: true },
  /* Batch 65, 24 and 25 October: second and third films for a page (Glenn: "Clip this video plz (3rd) limit 3 per affiliate"), each played under the page's own film. */
  { by: '_aemeriee.dance', place: 'Devil & Angel Desserts', city: 'Concord', brand: 'b_devilandangeldesserts', reel: reel('DN6sK0JElGo'), clip: true },
  { by: 'festusfeasts', place: 'Heads & Tails Barbecue', city: 'Berkeley', brand: 'b_headsandtailsbarbecue', reel: reel('DUBxC2xEnTG'), clip: true },
  { by: 'eatwithsie', place: 'Korean Papi’s Kitchen', city: 'San Francisco', brand: 'b_koreanpapiskitchen', reel: reel('De5RI99T-dW'), clip: true },
  { by: 'festusfeasts', place: 'Korean Papi’s Kitchen', city: 'San Francisco', brand: 'b_koreanpapiskitchen', reel: reel('DR5QMgBkrUT'), clip: true },
  { by: 'venturewithkelly', place: 'Ocean Subs', city: 'San Francisco', brand: 'b_oceansubs', reel: reel('DaEOA0WBDh9'), clip: true },
  { by: 'imadoniseats', place: 'Ocean Subs', city: 'San Francisco', brand: 'b_oceansubs', reel: reel('DBzuzNdSpm0'), clip: true },
  { by: 'greatonezfoodreview', place: 'Dimond Halal Eatery', city: 'Oakland', brand: 'b_dimondhalaleatery', reel: reel('DeckUbYSiRS'), clip: true },
  { by: 'mr.smackreviews', place: 'Dimond Halal Eatery', city: 'Oakland', brand: 'b_dimondhalaleatery', reel: reel('Dd-fvDmNwBY'), clip: true },
  { by: 'booziebrunch', place: 'Crazy Block Cheesecakes', city: 'Oakland', brand: 'b_crazyblockcheesecakes', reel: reel('DYAPtgxosEf'), clip: true },
  { by: 'bp__eats', place: 'Don Julio’s Latin Grill', city: 'Rohnert Park', brand: 'b_donjulioslatingrill', reel: reel('Dd7i6jHzCBv'), clip: true },
  /* Batch 67: Glenn, 25 Oct 12:13 pm, "Clip this video plz (2nd video) / Foodie also". */
  { by: 'erinlovesfun', place: 'Yume Mori', city: 'Berkeley', brand: 'b_yumemori', reel: reel('DVgoxRdgbdp'), clip: true },
  /* Batch 68, 26 October: second and third films for a page. */
  { by: 'westcoastsips707', place: 'West Coast Sips', city: 'Fairfield', brand: 'b_westcoastsips', reel: reel('DaWytebp89X'), clip: true },
  { by: 'eighty6ix_', place: 'Meadowlark Dairy Livermore', city: 'Livermore', brand: 'b_meadowlarkdairylivermore', reel: reel('De8Vue6v7mj'), clip: true },
  { by: 'lovelivermore', place: 'Meadowlark Dairy Livermore', city: 'Livermore', brand: 'b_meadowlarkdairylivermore', reel: reel('DT356WhgcFT'), clip: true },
  { by: 'bayarea.foodie.adventures', place: 'Chubby Cattle BBQ', city: 'Pleasanton', brand: 'b_chubbycattlebbqpleasanton', reel: reel('DesxHR2pcRs'), clip: true },
  { by: 'celineeats', place: 'Bourbon Steak San Francisco', city: 'San Francisco', brand: 'b_bourbonsteaksanfrancisco', reel: reel('De8FsQPCn0O'), clip: true },
  { by: 'explorewithtaka', place: 'Bourbon Steak San Francisco', city: 'San Francisco', brand: 'b_bourbonsteaksanfrancisco', reel: reel('DeaZOeNPwdn'), clip: true },
  { by: 'yourglobalfoodiebff', place: 'Harris’ Restaurant', city: 'San Francisco', brand: 'b_harrisrestaurant', reel: reel('DSYs6AgD3Ks'), clip: true },
  { by: 'thehautesheet', place: 'Blind Butcher', city: 'San Francisco', brand: 'b_blindbutcher', reel: reel('DdXobJ8JpiU'), clip: true },
  { by: 'humminglion', place: 'Meadowlark Dairy', city: 'Pleasanton', brand: 'b_meadowlarkdairy', reel: reel('DO1dIS1gTTz'), clip: true },
  { by: 'siliconvalley.foodies', place: 'Meadowlark Dairy', city: 'Pleasanton', brand: 'b_meadowlarkdairy', reel: reel('DNE34tbROif'), clip: true },
  { by: 'wagyumastersukiyaki', place: 'Wagyu Master', city: 'San Jose', brand: 'b_wagyumastersanjose', reel: reel('DeVbmGxFHUx'), clip: true },
  { by: '_whatarethechances_', place: 'Gold Bean', city: 'Berkeley', brand: 'b_goldbeandurant', reel: reel('Ddk28qRIsGZ'), clip: true },
  { by: 'bestbayareafood', place: 'Legend Hotpot & Grill', city: 'Newark', brand: 'b_legendhotpotgrill', reel: reel('De2J1F7PYQR'), clip: true },
  { by: 'victoria.pham17', place: 'Legend Hotpot & Grill', city: 'Newark', brand: 'b_legendhotpotgrill', reel: reel('DeruAsHMWIZ'), clip: true },
  /* Batch 72, Glenn, 27 Oct 8:41 am: the Gao Viet Kitchen half of @allie.eats's Outer Sunset crawl (with @festusfeasts), its second film. */
  { by: 'allie.eats', place: 'Gao Viet Kitchen', city: 'San Francisco', brand: 'b_gaovietkitchen', reel: reel('DdX5Vztgv0A'), clip: true },
  /* Batch 73, Glenn, 27 Oct 5:55–5:57 pm: "Foodie heavy hitter", "Foodie mediocre", "3rd". */
  { by: 'jacksdiningroom', place: 'Epic Steak', city: 'San Francisco', brand: 'b_epicsteak', reel: reel('Co8T0FtAwBY'), clip: true },
  { by: 'katwalksf', place: 'Epic Steak', city: 'San Francisco', brand: 'b_epicsteak', reel: reel('DHCbSEYSFsN'), clip: true },
  { by: 'charweeezy', place: 'Epic Steak', city: 'San Francisco', brand: 'b_epicsteak', reel: reel('Cf-UwSdgG8o'), clip: true },
  /* Batch 73, Glenn, 27 Oct 6:29–6:31 pm: "Mediocre", "Newbie". */
  { by: 'bayarea.foodie.san', place: 'Garlic High', city: 'Sunnyvale', brand: 'b_garlichighsunnyvale', reel: reel('De-gzy8snrZ'), clip: true },
  { by: 'yulmoo_l', place: 'Garlic High', city: 'Sunnyvale', brand: 'b_garlichighsunnyvale', reel: reel('DcoUarDtU2I'), clip: true },
  /* Batch 73, Glenn, 27 Oct 7:37–7:38 pm: "Medium", "Heavy heavy weight", "Newbie". */
  { by: 'grubwitmike', place: 'Square Pie Guys', city: 'San Francisco', brand: 'b_squarepieguys', reel: reel('CxrN-55P8Nl'), clip: true },
  { by: 'barstoolsports', place: 'Square Pie Guys', city: 'San Francisco', brand: 'b_squarepieguys', reel: reel('DUeW5F6EREw'), clip: true },
  { by: 'takeoutwithtuck', place: 'Square Pie Guys', city: 'San Francisco', brand: 'b_squarepieguys', reel: reel('DT8dMM3Aem3'), clip: true },
  /* Batch 73, Glenn, 27 Oct 8:09–8:10 pm: "Clip this video plz", "2nd", "Heavyweight". */
  { by: 'hungrydanz', place: 'Fresca', city: 'San Francisco', brand: 'b_frescasf', reel: reel('De-iRunR54w'), clip: true },
  { by: 'xo.pinsta', place: 'Fresca', city: 'San Francisco', brand: 'b_frescasf', reel: reel('DecI_svxxwC'), clip: true },
  { by: 'andreweatsinsf', place: 'Fresca', city: 'San Francisco', brand: 'b_frescasf', reel: reel('DeQA76lh1PD'), clip: true },
  /* Batch 73, Glenn, 27 Oct 8:31–8:32 pm: "Newbie", "Medium". */
  { by: 'lovemissfit', place: 'Brunch & Bloom', city: 'Brentwood', brand: 'b_brunchandbloom', reel: reel('De29bZ_OXDu'), clip: true },
  { by: 'jantrinanicole', place: 'Brunch & Bloom', city: 'Brentwood', brand: 'b_brunchandbloom', reel: reel('DbunZC5uSFX'), clip: true },
  /* Batch 73, Glenn, 27 Oct 9:35 pm: "Newbie". */
  { by: 'chloe_chomps', place: 'Early to Rise', city: 'San Francisco', brand: 'b_earlytorisesf', reel: reel('De2rMJPP9IC'), clip: true },
  /* Batch 73, Glenn, 27 Oct 10:31–10:34 pm: "Clip this video plz", "Heavyweight", "Newbie". */
  { by: 'wthellydanyelly', place: 'The Sweet Spot', city: 'Walnut Creek', brand: 'b_thesweetspot', reel: reel('DcT6BBStbAk'), clip: true },
  { by: 'realtorandreviewer', place: 'The Sweet Spot', city: 'Walnut Creek', brand: 'b_thesweetspot', reel: reel('DbldkkFqBA2'), clip: true },
  { by: 'xoaramarie', place: 'The Sweet Spot', city: 'Walnut Creek', brand: 'b_thesweetspot', reel: reel('Dbd5kXthhrw'), clip: true },
  /* Batch 74, Glenn, 28 Oct. Manila Inasal is in Los Angeles and has no BEASTY page: source link only. */
  { by: 'foodie.dreams', place: 'Manila Inasal', city: 'Los Angeles', reel: reel('DfDGnnGPsYp') },
  /* Kajiken, San Mateo. Glenn: "Heavy", then "Foodie". Antoinette's Kajiken-only excerpt is its main film. */
  { by: 'eatswithkath', place: 'Kajiken San Mateo', brand: 'b_kajikensanmateo', reel: reel('DBvMxORRkM7'), clip: true },
  { by: 'eatswithfoodie', place: 'Kajiken San Mateo', brand: 'b_kajikensanmateo', reel: reel('DZHBRMYvzav'), clip: true },
  /* Taste of Shaxian: "Clip this video plz", "2nd", "3rd". @firstdibs.bayarea's "Watch this video clip"
     (resent as "Foodie") is the main film, so it is not duplicated here. */
  { by: 'thesnacksensei', place: 'Taste of Shaxian', brand: 'b_tasteofshaxian', reel: reel('DcXXO44osnK'), clip: true },
  { by: 'jensintec', place: 'Taste of Shaxian', brand: 'b_tasteofshaxian', reel: reel('Dcmwqxlp0WR'), clip: true },
  { by: 'snackateriansf', place: 'Taste of Shaxian', brand: 'b_tasteofshaxian', reel: reel('DbUmGGDyMF3'), clip: true },
  /* Din Ding's own film arrived afterward as "Watch this video clip"; the first reviewer stays below it. */
  { by: 'thesnacksensei', place: 'Din Ding Dumpling House — Fremont', brand: 'b_dindingdumplinghousefremont', reel: reel('DYNeXe3SB9U'), clip: true },
  /* Din Ding in Fremont, "2nd"; original is marked #ad. */
  { by: 'apoorva_sharma1', place: 'Din Ding Dumpling House — Fremont', brand: 'b_dindingdumplinghousefremont', reel: reel('DPM1flUEqkS'), clip: true },

  /* Batch 75 — Glenn’s 28–29 October sends; his reviewer tags are retained here. */
  /* Foodie */
  {"by": "andreweatsinsf", "place": "Origin Lab Coffee & Matcha", "city": "San Francisco", "brand": "b_originlabcoffeematcha", "reel": "https://www.instagram.com/reel/DXsa0XQj9lg/", "clip": true},
  /* Heavyweight */
  {"by": "bayarea_fooddreamz", "place": "Parekoy Lutong Pinoy", "city": "San Leandro", "brand": "b_parekoylutongpinoy", "reel": "https://www.instagram.com/reel/De-Tlz7SnXg/", "clip": true},
  /* Heavyweight / Foodie */
  {"by": "volha_creative", "place": "Yami Bowl Bar & BBQ", "city": "San Jose", "brand": "b_yamibowl", "reel": "https://www.instagram.com/reel/Dd7oiAFo-s-/", "clip": true},
  /* Medium */
  {"by": "yourglobalfoodiebff", "place": "Yami Bowl Bar & BBQ", "city": "San Jose", "brand": "b_yamibowl", "reel": "https://www.instagram.com/reel/Dep7JcOREof/", "clip": true},
  /* Newbie; invited visit */
  {"by": "boba._.addict", "place": "Yami Bowl Bar & BBQ", "city": "San Jose", "brand": "b_yamibowl", "reel": "https://www.instagram.com/reel/DewyciVBPO8/", "clip": true},
  /* Newbie */
  {"by": "wthellydanyelly", "place": "Wikiwiki Hawaiian BBQ", "city": "Berkeley", "brand": "b_wikiwikihawaiianbbq", "reel": "https://www.instagram.com/reel/DcOpenPtXTm/", "clip": true},
  /* Heavyweight */
  {"by": "feed_happiness_", "place": "Wikiwiki Hawaiian BBQ", "city": "Berkeley", "brand": "b_wikiwikihawaiianbbq", "reel": "https://www.instagram.com/reel/DYT0xwFS2RV/", "clip": true},
  /* Ocean oyster bar */
  {"by": "booziebrunch", "place": "Ocean Oyster Bar & Grill — Union City", "city": "Union City", "brand": "b_oceanoysterbarunioncity", "reel": "https://www.instagram.com/reel/DfDb-kFSieE/", "clip": true},
  /* Newbie */
  {"by": "ruthannesturman", "place": "Ocean Oyster Bar & Grill — Redwood City", "city": "Redwood City", "brand": "b_oceanoysterbarredwoodcity", "reel": "https://www.instagram.com/reel/DdaEd-tvxIk/", "clip": true},
  /* Existing 6–22s Lucky-only excerpt */
  {"by": "thetastebud", "place": "Lucky Three Seven", "city": "Oakland", "brand": "b_luckythreeseven", "reel": "https://www.instagram.com/reel/DBw6bNGv2nD/", "clip": true},
  /* Newbie */
  {"by": "mayakay.official", "place": "Lucky Three Seven", "city": "Oakland", "brand": "b_luckythreeseven", "reel": "https://www.instagram.com/reel/DfDGWfQPoFv/", "clip": true},
  /* 3rd / Heavy also; posted by the restaurant */
  {"by": "larryjunetfm", "place": "Lucky Three Seven", "city": "Oakland", "brand": "b_luckythreeseven", "reel": "https://www.instagram.com/reel/DUg0QAHEgY4/", "clip": true, "credit": "Posted by @lucky777oakland; featuring @larryjunetfm and @tommybogo"},
  /* Medium / Foodie */
  {"by": "eileenhuynher", "place": "House of Phin", "city": "Oakland", "brand": "b_houseofphin", "reel": "https://www.instagram.com/reel/DWCrai9EjCQ/", "clip": true},

  /* Batch 76, 29 Oct: new Chubby Watch/Heavy hitter is @trinhdoesthings.
     Its former main stays beside @bayarea.foodie.adventures and the new Newbie. */
  { by: 'createwithcv', place: 'Chubby Cattle BBQ', city: 'Pleasanton', brand: 'b_chubbycattlebbqpleasanton', reel: reel('DevfMX2isDa'), clip: true },
  { by: 'aloha_stephanie', place: 'Chubby Cattle BBQ', city: 'Pleasanton', brand: 'b_chubbycattlebbqpleasanton', reel: reel('DbY-GatSDXj'), clip: true },
  /* Separate Cupertino restaurant, not The Sea. No Cupertino page/add request yet: source only. */
  { by: 'zoegabon', place: 'Alexander’s Steakhouse', city: 'Cupertino', reel: reel('DbjaM1oycXc') },

  /* Hotpot Bay, Glenn 12:25–12:27 pm: Mediocre / Newbie / Heavy Hitter; own Watch is main. */
  { by: 'martiwantsmore', place: 'Hotpot Bay', city: 'San Francisco', brand: 'b_hotpotbay', reel: reel('DdQBcwLT8Iy'), clip: true },
  { by: 'dchangshangry', place: 'Hotpot Bay', city: 'San Francisco', brand: 'b_hotpotbay', reel: reel('DZbrqbWT98E'), clip: true },
  { by: 'foodandsachi', place: 'Hotpot Bay', city: 'San Francisco', brand: 'b_hotpotbay', reel: reel('DXr9m1JEt1A'), clip: true },

  /* Batch 77: Glenn’s tags kept as provenance; they are not public ratings. */
  // Newbie / Foodie
  {"by": "byhillaryn", "place": "Urban Matcha — Castro Valley", "city": "Castro Valley", "brand": "b_urbanmatchacastrovalley", "reel": "https://www.instagram.com/reel/DcUGJ9NPYjO/", "clip": true},
  // Heavy Hitter
  {"by": "eatwithsie", "place": "Urban Matcha — Castro Valley", "city": "Castro Valley", "brand": "b_urbanmatchacastrovalley", "reel": "https://www.instagram.com/reel/DaqhXYDh5xl/", "clip": true},
  // Mediocre
  {"by": "mukbangyourmama", "place": "Urban Matcha — Castro Valley", "city": "Castro Valley", "brand": "b_urbanmatchacastrovalley", "reel": "https://www.instagram.com/reel/DfFqZBQCj1S/", "clip": true},
  // Newbie
  {"by": "aly_eats_cali", "place": "TLeafGreen — San Jose", "city": "San Jose", "brand": "b_tleafgreensanjose", "reel": "https://www.instagram.com/reel/DeahroUhP1L/", "clip": true},
  // Heavy Hitter
  {"by": "feed_happiness_", "place": "TLeafGreen — San Jose", "city": "San Jose", "brand": "b_tleafgreensanjose", "reel": "https://www.instagram.com/reel/De059eHyBFq/", "clip": true},
  // Mediocre
  {"by": "bestbayareafood", "place": "TLeafGreen — San Jose", "city": "San Jose", "brand": "b_tleafgreensanjose", "reel": "https://www.instagram.com/reel/DbekpvnJljy/", "clip": true},
  // Newbie; source only, four-film cap
  {"by": "bayarea_fooddreamz", "place": "House of Prime Rib", "city": "San Francisco", "brand": "b_houseofprimerib", "reel": "https://www.instagram.com/reel/DfGBxqWyt_w/"},
  // Heavy Hitter
  {"by": "jacksdiningroom", "place": "House of Prime Rib", "city": "San Francisco", "brand": "b_houseofprimerib", "reel": "https://www.instagram.com/reel/C3Gtd_CvrpR/", "clip": true},
  // Mediocre; source only, four-film cap
  {"by": "bayarea.foodies", "place": "House of Prime Rib", "city": "San Francisco", "brand": "b_houseofprimerib", "reel": "https://www.instagram.com/reel/CwwEcLKJJ9J/"},
  // Heavy Hitter #2
  {"by": "thesnacksensei", "place": "House of Prime Rib", "city": "San Francisco", "brand": "b_houseofprimerib", "reel": "https://www.instagram.com/reel/DEeM01jxsBT/", "clip": true},
  // Heavy Hitter #3
  {"by": "thesauceboss_", "place": "House of Prime Rib", "city": "San Francisco", "brand": "b_houseofprimerib", "reel": "https://www.instagram.com/reel/Db1zs7kNPv_/", "clip": true},
  // Original main retained
  {"by": "itsslydiia", "place": "Laughing Monk NOPA", "city": "San Francisco", "brand": "b_laughingmonknopa", "reel": "https://www.instagram.com/reel/Defo2sWSjXA/", "clip": true},
  // Newbie; TikTok @bsgmoments repost
  {"by": "thelaughingmonksf", "place": "Laughing Monk NOPA", "city": "San Francisco", "brand": "b_laughingmonknopa", "reel": "https://www.instagram.com/reel/DfFq35OzQqk/", "clip": true, "credit": "Review by @bsgmoments (TikTok); posted by @thelaughingmonksf"},

  /* Batch 79: Glenn 29 Oct evening–30 Oct morning. Original tags retained below. */
  // Mediocre
  {"by": "hungrydanz", "place": "Wasabi Udon & Katsu Bar", "reel": "https://www.instagram.com/reel/DfGVIPXRo28/", "city": "Fairfield", "brand": "b_wasabiudonandkatsubar", "clip": true},
  // Existing film retained unchanged
  {"by": "moniica.michelle", "place": "Pho Hoa", "reel": "https://www.instagram.com/reel/De2Jr6CxEER/", "city": "San Jose", "brand": "b_phohoa", "clip": true},
  // Heavy Hitter; source copy held, chain location unspecified
  {"by": "ryanbyryanchua", "place": "Pho Hoa", "reel": "https://www.instagram.com/reel/DMV3hajhWva/", "brand": "b_phohoa", "credit": "Pho Hoa chain; the original post does not identify a location."},
  // Heavy Hitter
  {"by": "thesnacksensei", "place": "Tapsilog Express", "reel": "https://www.instagram.com/reel/DfGNmCAowHQ/", "city": "San Leandro", "brand": "b_tapsilogexpress", "clip": true},
  // Mediocre
  {"by": "ivkicks", "place": "Tapsilog Express", "reel": "https://www.instagram.com/reel/DVoRfaOjo8q/", "city": "San Leandro", "brand": "b_tapsilogexpress", "clip": true},
  // Heavy Hitter; source copy held
  {"by": "thesnacksensei", "place": "United Mexican Bar & Grill", "reel": "https://www.instagram.com/reel/De-pYUOI2bt/", "city": "Hayward", "brand": "b_unitedmexicanbarandgrill"},
  // Newbie
  {"by": "bayareamunchies510", "place": "Ace King BBQ", "reel": "https://www.instagram.com/reel/Def33KkR7R_/", "city": "Newark", "brand": "b_acekingbbq", "clip": true},
  // Heavy Hitter
  {"by": "bayarea.foodie.adventures", "place": "Ace King BBQ", "reel": "https://www.instagram.com/reel/DV7dhE8CeFT/", "city": "Newark", "brand": "b_acekingbbq", "clip": true},
  // Mediocre
  {"by": "cestalmoco", "place": "Ace King BBQ", "reel": "https://www.instagram.com/reel/DSJIdTWAQnq/", "city": "Newark", "brand": "b_acekingbbq", "clip": true},
  // Mediocre
  {"by": "foodandsachi", "place": "Ramen Shop", "reel": "https://www.instagram.com/reel/DE221k6SUbK/", "city": "Oakland", "brand": "b_ramenshop", "clip": true},
  // Mediocre
  {"by": "bayarea.foodie.adventures", "place": "NōKA Ramen & Bar", "reel": "https://www.instagram.com/reel/DH9_OWiRznc/", "credit": "This source copy has no audio track.", "city": "Oakland", "brand": "b_nokaramen", "clip": true},
  // Newbie
  {"by": "hangrypotato", "place": "NōKA Ramen & Bar", "reel": "https://www.instagram.com/reel/DeNzH3MB3Lu/", "city": "Oakland", "brand": "b_nokaramen", "clip": true},
  // Foodie; source-only request
  {"by": "melsotel", "place": "Macondo Colombian Fusion", "reel": "https://www.instagram.com/reel/Dexe7_gxwLe/", "city": "Alameda"},
  // Batch 80, 30 Oct 8:26 am — Clip this video plz / Heavy Hitter.
  { by: 'feed_happiness_', place: 'San San Tea House', city: 'San Leandro', brand: 'b_sansanteahouse', reel: reel('DfHBbcgSlPy'), clip: true },
  // Batch 80: Heavy Hitter, Newbie, Mediocre respectively; source locations retained.
  {"by": "eatswithkath", "place": "CHICHA San Chen — Berkeley", "city": "Berkeley", "brand": "b_chichasanchenberkeley", "reel": "https://www.instagram.com/reel/DGMZVoJywEB/", "clip": true},
  {"by": "sierra.eats.8", "place": "CHICHA San Chen — Fremont", "city": "Fremont", "brand": "b_chichasanchenberkeley", "reel": "https://www.instagram.com/reel/DeORBvOI6mJ/", "clip": true, "credit": "Filmed at the Fremont location. Archival October 8 promotion: the BOGO offer has ended."},
  {"by": "hungere.for.diy", "place": "CHICHA San Chen — Pleasanton", "city": "Pleasanton", "brand": "b_chichasanchenberkeley", "reel": "https://www.instagram.com/reel/DeCRPNNJrCa/", "clip": true, "credit": "Filmed at the Pleasanton location, 2709 Stoneridge Dr, Suite 102."},

  /* Batch 83, October 30–31: exact Glenn tags are provenance, not ratings. */
  // Foodie
  {"by": "broitsva", "place": "Polynesian Island Luau", "reel": "https://www.instagram.com/reel/DeLKrmkManh/"},
  // Clip
  {"by": "orangeginger", "place": "Saigon Social Cafe", "reel": "https://www.instagram.com/reel/De0Lg8tNNAn/", "city": "San Jose", "brand": "b_saigonsocialcafe", "clip": true},
  // Newbie
  {"by": "fat_ash_foodie", "place": "Saigon Social Cafe", "reel": "https://www.instagram.com/reel/Dd_xBfBBTT2/", "city": "San Jose", "brand": "b_saigonsocialcafe", "clip": true},
  // Newbie
  {"by": "eighty6ix_", "place": "Carabao", "reel": "https://www.instagram.com/reel/Dbjt-T3Prbf/", "city": "Napa", "brand": "b_carabao", "clip": true, "credit": "Filmed by @eighty6ix_ · August 2 collaboration-event review; the event has ended."},
  // Mediocre
  {"by": "eatwithsie", "place": "Carabao", "reel": "https://www.instagram.com/reel/DLVTjIlpLGo/", "city": "Napa", "brand": "b_carabao", "clip": true},
  // Heavy Hitter / Foodie
  {"by": "cestalmoco", "place": "Insomnibar", "reel": "https://www.instagram.com/reel/Dd7H1N0Su7F/", "city": "San Jose", "brand": "b_insomnibar", "clip": true},
  // Newbie / Foodie
  {"by": "_foodieshots_", "place": "Insomnibar", "reel": "https://www.instagram.com/reel/DdzgPZ1y1XV/", "city": "San Jose", "brand": "b_insomnibar", "clip": true},
  // Mediocre / Foodie
  {"by": "kitkatvales", "place": "Insomnibar", "reel": "https://www.instagram.com/reel/Ddp1yP8SqXK/", "city": "San Jose", "brand": "b_insomnibar", "clip": true},
  /* Batch 84, Glenn: Heavy Hitter. Grand-O keeps his existing page. */
  { by: 'thesnacksensei', place: 'Subs Inc.', city: 'San Francisco', brand: 'b_subsinc', reel: reel('DfK5OdlSYrJ'), clip: true },

  /* Batch 85 — original Glenn tags are provenance, not BEASTY ratings. */
  // Glenn: Clip
  {"by": "miks_outdoors", "place": "Bay Area Discovery Museum", "city": "Sausalito", "brand": "b_bayareadiscoverymuseum", "reel": "https://www.instagram.com/reel/DeHetb-KJi-/", "clip": true, "credit": "Filmed by @miks_outdoors · Archival October Goblin Jamboree footage; the event has ended."},
  // Glenn: Clip / Tag Shanna
  {"by": "outdoorideaswithkids", "place": "Peek-a-Boo Factory — Rancho Cordova", "city": "Rancho Cordova", "brand": "b_peekaboofactoryrc", "reel": "https://www.instagram.com/reel/DchaQ5ZPMAz/", "clip": true, "credit": "Filmed by Shanna · @outdoorideaswithkids"},
  // Glenn: Clip
  {"by": "outdoorideaswithkids", "place": "El Dorado Orchards", "city": "Camino", "brand": "b_eldoradoorchards", "reel": "https://www.instagram.com/reel/DevA1QXvtAr/", "clip": true, "credit": "Filmed by @outdoorideaswithkids · Seasonal harvest visit; weather and dates can change."},
  // Glenn: Clip
  {"by": "truly_athi", "place": "Lakewood Park", "city": "Sunnyvale", "brand": "b_lakewoodpark", "reel": "https://www.instagram.com/reel/Dcqu-CkvNfy/", "clip": true},
  // Glenn: Newbie
  {"by": "sonomacountyliving", "place": "Red Eye Barbecue", "city": "Santa Rosa", "brand": "b_redeyebarbecue", "reel": "https://www.instagram.com/reel/DdcJ0ICPTlh/", "clip": true, "credit": "Filmed by @sonomacountyliving · Hosted menu-preview review; food was provided, as the creator discloses."},
  // Glenn: Newbie
  {"by": "lovecartier25", "place": "Jin Pot Shabu House", "city": "San Francisco", "brand": "b_jinpotshabuhouse", "reel": "https://www.instagram.com/reel/DZ73122Jj0Q/", "clip": true, "credit": "Filmed by @lovecartier25 · Hosted visit, disclosed by the creator."},
  // Glenn: Mediocre
  {"by": "hungere.for.diy", "place": "United Dumplings — Oakland", "city": "Oakland", "brand": "b_uniteddumplingsoakland", "reel": "https://www.instagram.com/reel/DfNCcelSeUT/", "clip": true},
  // Glenn: Heavy Hitter
  {"by": "fedoramaelle", "place": "United Dumplings — Oakland", "city": "Oakland", "brand": "b_uniteddumplingsoakland", "reel": "https://www.instagram.com/reel/De3KeuWTmRO/", "clip": true},
  // Glenn: Newbie
  {"by": "foodie_travel_happiness", "place": "The Backyard — Richmond", "city": "Richmond", "brand": "b_therichmondbackyard", "reel": "https://www.instagram.com/reel/DAwd7foumEg/", "clip": true, "credit": "Filmed by @foodie_travel_happiness · Archival 2024 visit; confirm current menu and events."},
  // Glenn: Foodie
  {"by": "peterlyagent", "place": "El Portal Mexican Restaurant", "city": "San Leandro", "brand": "b_elportalsanleandro", "reel": "https://www.instagram.com/reel/Da1oeItBNd3/", "clip": true, "credit": "Filmed by @peterlyagent · Archival oyster review; confirm current specials and prices with the restaurant."},
  // Glenn: Heavy Hitter
  {"by": "foodandsachi", "place": "El Portal Mexican Restaurant", "city": "San Leandro", "brand": "b_elportalsanleandro", "reel": "https://www.instagram.com/reel/DXaKrrREnjH/", "clip": true, "credit": "Filmed by @foodandsachi · Archival April review; menu prices and promotions may have changed."},
  // Glenn: Mediocre
  {"by": "aztec.ed", "place": "El Portal Mexican Restaurant", "city": "San Leandro", "brand": "b_elportalsanleandro", "reel": "https://www.instagram.com/reel/DXDFiGkAbCn/", "clip": true, "credit": "Filmed by @aztec.ed · Archival April review; confirm current specials with the restaurant."},
  // Glenn: Mediocre. Original post verified; local media copy held.
  {"by": "bayarea_fooddreamz", "place": "The Backyard \u2014 Richmond", "city": "Richmond", "brand": "b_therichmondbackyard", "reel": "https://www.instagram.com/reel/CwD8utAosUv/", "credit": "Archival August 17, 2023 visit. Watch the original post on Instagram."},

  /* Batch 86 — Glenn tags retained as provenance. */
  // Glenn: Clip
  {"by": "hungere.for.diy", "place": "Monster Pho", "city": "Oakland", "brand": "b_monsterpho", "reel": "https://www.instagram.com/reel/C7DgtQlL1g1/", "clip": true, "credit": "Filmed by @hungere.for.diy · Filmed at 360 40th St, Oakland."},
  // Glenn: Clip
  {"by": "tundemodupee", "place": "Monster Pho", "city": "Oakland", "brand": "b_monsterpho", "reel": "https://www.instagram.com/reel/Dew5mRjT-NS/", "clip": true, "credit": "Filmed by @tundemodupee · Filmed in Oakland."},
  // Glenn: Clip
  {"by": "edmunchthefoodie", "place": "Monster Pho", "city": "Oakland", "brand": "b_monsterpho", "reel": "https://www.instagram.com/reel/DXQV7WHApNF/", "clip": true, "credit": "Filmed by @edmunchthefoodie · Filmed at 360 40th St, Oakland."},
  // Glenn: Clip
  {"by": "wafflebam", "place": "Wasabi Udon & Katsu Bar", "city": "Fairfield", "brand": "b_wasabiudonandkatsubar", "reel": "https://www.instagram.com/reel/DWcaNmCkgr7/", "clip": true, "credit": "Filmed by @wafflebam · Filmed at Wasabi, 1500 Oliver Rd, Fairfield; this is not Ginza in San Francisco."},
  // Glenn: Clip
  {"by": "wafflebam", "place": "UMe Tea — San Jose", "city": "San Jose", "brand": "b_umeteasanjose", "reel": "https://www.instagram.com/reel/DRn2GMACRVC/", "clip": true, "credit": "Filmed by @wafflebam · UMe chain review; the caption does not identify the filmed store. San Jose locations are listed separately."},
  // Glenn: Heavy Hitter
  {"by": "felicitythefoodie", "place": "Brothers BBQ (Hyungjae)", "city": "San Leandro", "brand": "b_brothersbbqsanleandro", "reel": "https://www.instagram.com/reel/DTUgi24ieMC/", "clip": true, "credit": "Filmed by @felicitythefoodie"},
  // Glenn: Newbie / Foodie
  {"by": "fedoramaelle", "place": "Brothers BBQ (Hyungjae)", "city": "San Leandro", "brand": "b_brothersbbqsanleandro", "reel": "https://www.instagram.com/reel/DS1EFntCSee/", "clip": true, "credit": "Filmed by @fedoramaelle"},
  // Glenn: Clip
  {"by": "wafflebam", "place": "HolyShred — San Francisco", "city": "San Francisco", "brand": "b_holyshredsf", "reel": "https://www.instagram.com/reel/DQMpZKICUrY/", "clip": true, "credit": "Filmed by @wafflebam · Filmed at the San Francisco location. Archival opening BOGO promotion has ended."},
  // Glenn: Heavy Hitter
  {"by": "siliconvalley.foodies", "place": "HolyShred — Palo Alto", "city": "Palo Alto", "brand": "b_holyshredpaloalto", "reel": "https://www.instagram.com/reel/DeQOde-o0oS/", "clip": true, "credit": "Filmed by @siliconvalley.foodies · Filmed at the Palo Alto location."},
  // Glenn: Newbie / Foodie
  {"by": "goyuliiago", "place": "HolyShred — Palo Alto", "city": "Palo Alto", "brand": "b_holyshredpaloalto", "reel": "https://www.instagram.com/reel/DeZ5vR8P1oG/", "clip": true, "credit": "Filmed by @goyuliiago · Filmed at the Palo Alto location. Confirm current hours rather than the older caption schedule."},
  // Glenn: Clip / update Peggy icon
  {"by": "peggy_shoo", "place": "Polly Ann Ice Cream", "city": "San Francisco", "brand": "b_pollyann", "reel": "https://www.instagram.com/reel/Dd4OmIuvKVI/", "clip": true, "credit": "Filmed by @peggy_shoo · Original Noriega location; the page lists locations separately."},
  // Glenn: Clip / Foodie
  {"by": "jamiebeoutside", "place": "Polly Ann Ice Cream", "city": "San Francisco", "brand": "b_pollyann", "reel": "https://www.instagram.com/reel/DeMVsZuOD7E/", "clip": true, "credit": "Filmed by @jamiebeoutside · Filmed at the Noriega location."},
  // Glenn: Heavy Hitter / Foodie
  {"by": "pastrywithjenn", "place": "Polly Ann Ice Cream", "city": "San Francisco", "brand": "b_pollyann", "reel": "https://www.instagram.com/reel/DbWyx0whmoz/", "clip": true, "credit": "Filmed by @pastrywithjenn · Filmed at the 120 Pine St pop-up, not the Noriega shop. Confirm current pop-up dates."},
  // Glenn: Heavy Hitter
  {"by": "travelwtiff", "place": "Simplycake Bakery", "city": "San Mateo", "brand": "b_simplycakebakery", "reel": "https://www.instagram.com/reel/DdzwmdyhLQo/", "clip": true, "credit": "Posted by @travelwtiff · Posted by @travelwtiff; features @d_baylock_ reviewing the charcoal walnut cheese bread."},
  // Glenn: Newbie / Foodie
  {"by": "ploinsanfrancisco", "place": "Simplycake Bakery", "city": "San Mateo", "brand": "b_simplycakebakery", "reel": "https://www.instagram.com/reel/DfGwmkmhPPx/", "clip": true, "credit": "Filmed by @ploinsanfrancisco · Sponsored visit; the creator labels the post #ad."},
  // Glenn: Foodie
  {"by": "piscesprincesspriya", "place": "Simplycake Bakery", "city": "San Mateo", "brand": "b_simplycakebakery", "reel": "https://www.instagram.com/reel/DefEVwFvYql/", "clip": true, "credit": "Filmed by @piscesprincesspriya · This excerpt covers Simplycake; the original also features Molly Tea and Izumi Matcha."},
  // Glenn: Foodie
  {"by": "lagrandedelabanda", "place": "Innena's Kitchen", "city": "Oakland", "brand": "b_innenaskitchen", "reel": "https://www.instagram.com/reel/DfPul8TBIma/", "clip": true, "credit": "Filmed by @lagrandedelabanda · Review by @lagrandedelabanda, reposted by @innenaskitchen."},
  // Glenn: Foodie only; no local clip requested
  {"by": "gabriiellas", "place": "Yogurt Shack", "city": "Lafayette", "reel": "https://www.instagram.com/reel/DecT_ZRPBzz/"},
  // Glenn: Clip / icon; local copy held at four films per page
  {"by": "foodgiveness", "place": "Polly Ann Ice Cream", "city": "San Francisco", "brand": "b_pollyann", "reel": "https://www.instagram.com/reel/DXnM3fcj5vE/", "credit": "Original Noriega shop review. Watch the original post on Instagram."},
  // Glenn: Clip / update icon; local copy held at four films per page
  {"by": "d_baylock_", "place": "Simplycake Bakery", "city": "San Mateo", "brand": "b_simplycakebakery", "reel": "https://www.instagram.com/reel/DcrSbmKyksH/", "credit": "Watch the original review on Instagram."},
  // Glenn: Clip / Foodie / zoom icon; local copy held at four films per page
  {"by": "hallojessa", "place": "Simplycake Bakery", "city": "San Mateo", "brand": "b_simplycakebakery", "reel": "https://www.instagram.com/reel/De5qAHvieL7/", "credit": "Watch the original review on Instagram."},
  // Glenn: Newbie / Foodie
  {"by": "chaudownfood", "place": "Chez Maeju", "city": "Oakland", "brand": "b_chezmaeju", "reel": "https://www.instagram.com/reel/DfGSjNXRKXo/", "clip": true, "credit": "Filmed by @chaudownfood · Hosted collaboration, disclosed by the creator."},
  // Glenn: Heavy Hitter / Foodie
  {"by": "_emwong_", "place": "Chez Maeju", "city": "Oakland", "brand": "b_chezmaeju", "reel": "https://www.instagram.com/reel/De0mq8ap2Fa/", "clip": true, "credit": "Filmed by @_emwong_"},
  // Glenn: Newbie / Foodie
  {"by": "phoebe8food", "place": "Chez Maeju", "city": "Oakland", "brand": "b_chezmaeju", "reel": "https://www.instagram.com/reel/DefrbSLtXxV/", "clip": true, "credit": "Filmed by @phoebe8food · Review prices are archival; confirm current prices with the restaurant."},
  // Glenn: Watch / Newbie / Foodie
  {"by": "wakeyeats", "place": "Chez Maeju", "city": "Oakland", "brand": "b_chezmaeju", "reel": "https://www.instagram.com/reel/Dd_0JF5Nq2B/", "clip": true, "credit": "Filmed by @wakeyeats · Hosted soft-opening visit, disclosed by the creator; confirm current hours."},
  // Glenn: Newbie / Foodie; local copy held at four films
  {"by": "karaxhuynh", "place": "Chez Maeju", "city": "Oakland", "brand": "b_chezmaeju", "reel": "https://www.instagram.com/reel/DeHlBF3B8FI/", "credit": "Watch the original review on Instagram."},
  // Glenn: Newbie / Foodie; local copy held at four films
  {"by": "dodo__eats", "place": "Chez Maeju", "city": "Oakland", "brand": "b_chezmaeju", "reel": "https://www.instagram.com/reel/DeAHK8ogWsD/", "credit": "Hosted visit, disclosed by the creator. Watch the original review on Instagram."},

  /* Batch 87 — Clip / Newbie; Clip / update icon / Foodie. */
  {"by": "maya_munches", "place": "Easy Breezy", "city": "San Francisco", "brand": "b_easybreezy", "reel": "https://www.instagram.com/reel/DXYA3bzjOTc/", "clip": true, "credit": "Filmed by @maya_munches · Filmed at the Sunset shop, 718 Irving Street; confirm current flavors and prices."},
  {"by": "dchangshangry", "place": "Easy Breezy", "city": "Walnut Creek", "brand": "b_easybreezy", "reel": "https://www.instagram.com/reel/DeZeeGbzfoV/", "clip": true, "credit": "Filmed by @dchangshangry · Filmed at the Walnut Creek shop, 1387 N. Main Street; flavors rotate."},

  /* Batch 88 — each original request and its disposition are in docs/BATCH-88.md. */
  // Glenn: Clip / update icon
  {"by": "mukbangyourmama", "place": "Chip Cookies", "city": "Walnut Creek", "brand": "b_chipcookies", "reel": "https://www.instagram.com/reel/DfDEvHYPLyF/", "credit": "Filmed by @mukbangyourmama · Walnut Creek shop, 2335 Oak Grove Road; the original review includes the creator’s mixed impressions.", "clip": true},
  // Glenn: Clip / Newbie
  {"by": "dodo__eats", "place": "Alma Dessert", "city": "Sunnyvale", "brand": "b_almadessert", "reel": "https://www.instagram.com/reel/DfBinzDBcOc/", "credit": "Filmed by @dodo__eats · Hosted visit, disclosed by the creator; filmed at 165 S Murphy Avenue, Suite D. Review prices are archival.", "clip": true},
  // Glenn: Clip / Newbie
  {"by": "dodo__eats", "place": "Pho Ha Noi", "city": "San Jose", "brand": "b_phohanoisanjose", "reel": "https://www.instagram.com/reel/DenwYdOtZ79/", "credit": "Filmed by @dodo__eats · Hosted visit, disclosed by the creator; Vietnam Town, 969 Story Road, Unit 6048. Review prices are archival.", "clip": true},
  // Glenn: Clip / Newbie
  {"by": "wakeyeats", "place": "Soulsip", "city": "San Jose", "brand": "b_soulsip", "reel": "https://www.instagram.com/reel/DeMwwnKNzt2/", "credit": "Filmed by @wakeyeats · Hosted visit, disclosed by the creator, with @dodo__eats; 2002 Alum Rock Avenue. Confirm current hours and flavors.", "clip": true},
  // Glenn: Clip / Newbie / Foodie
  {"by": "preet.khatrii", "place": "Soulsip", "city": "San Jose", "brand": "b_soulsip", "reel": "https://www.instagram.com/reel/DeyQjQ-uMx_/", "credit": "Filmed by @preet.khatrii · Banana pudding matcha and tiramisu cake matcha review at SoulSip, San Jose.", "clip": true},
  // Glenn: Clip / update icon
  {"by": "cestalmoco", "place": "Soulsip", "city": "San Jose", "brand": "b_soulsip", "reel": "https://www.instagram.com/reel/DenfhiyJCt5/", "credit": "Posted by @cestalmoco · this excerpt covers only SoulSip. The full post tours several late-night San Jose stops.", "clip": true},
  // Glenn: Clip / Newbie Newbie / Foodie
  {"by": "kogumahs", "place": "Soulsip", "city": "San Jose", "brand": "b_soulsip", "reel": "https://www.instagram.com/reel/DeZ_DocBSQS/", "credit": "Filmed by @kogumahs · SoulSip matcha review, San Jose; confirm current flavors.", "clip": true},
  // Glenn: Clip / Foodie / Newbie Newbie
  {"by": "livingvivalakillah", "place": "Bibim Grill", "city": "Dublin", "brand": "b_bibimgrill", "reel": "https://www.instagram.com/reel/DfP6YgRN04H/", "credit": "Filmed by @livingvivalakillah · 3742 Fallon Road, Dublin; confirm current choices and final bowl price.", "clip": true},
  // Glenn: Clip / Newbie / Foodie
  {"by": "nurse.danamae", "place": "Soulsip", "city": "San Jose", "brand": "b_soulsip", "reel": "https://www.instagram.com/reel/DeH8zrghsHo/", "credit": "Hosted visit, disclosed by the creator. Watch the original review on Instagram."},
  // Glenn: Clip / update icon
  {"by": "kimoni.eatss", "place": "Soulsip", "city": "San Jose", "brand": "b_soulsip", "reel": "https://www.instagram.com/reel/Dd_-OAaz_-D/", "credit": "The original October 4 promotion has ended. Watch the original review on Instagram."},

  /* Batch 89 — Glenn’s tags and all copy holds are recorded in docs/BATCH-89.md. */
  // Glenn: Clip / Newbie Newbie / Foodie
  {"by": "thehabibizeat", "place": "Bibim Grill", "city": "Dublin", "reel": "https://www.instagram.com/reel/DfNcnsRypa9/", "credit": "Filmed by @thehabibizeat · The menu describes only the two chicken proteins as halal, not every protein.", "brand": "b_bibimgrill", "clip": true},
  // Glenn: Clip / Foodie / Newbie
  {"by": "eatwithbooboo", "place": "Bibim Grill", "city": "Dublin", "reel": "https://www.instagram.com/reel/DfL6t5IgEzR/", "credit": "Filmed by @eatwithbooboo · Invited visit disclosed by the creator. The original mentions a limited promotion; confirm directly.", "brand": "b_bibimgrill", "clip": true},
  // Glenn: Clip / Foodie / Mediocre
  {"by": "bayarea_foodogram", "place": "Bibim Grill", "city": "Dublin", "reel": "https://www.instagram.com/reel/DfLNFVSy7sp/", "credit": "Filmed by @bayarea_foodogram · The original mentions a limited November 5 promotion; confirm directly.", "brand": "b_bibimgrill", "clip": true},
  // Glenn: Clip
  {"by": "mukbangyourmama", "place": "Slice House — Castro Valley", "city": "Castro Valley", "reel": "https://www.instagram.com/reel/DfQBdF-BDY5/", "credit": "Filmed by @mukbangyourmama · Filmed at Castro Valley; this is not the Brentwood listing.", "clip": true},
  // Glenn: Clip / Foodie / Newbie
  {"by": "summer.ishungry", "place": "Binge Coffee House", "city": "Berkeley", "reel": "https://www.instagram.com/reel/DeIym1UyuPJ/", "credit": "Filmed by @summer.ishungry · Seasonal pumpkin special at the 2528A Durant Avenue shop. @bingecoffeehouse is tagged on the original collaborative post; confirm current availability.", "brand": "b_bingecoffeehouse", "clip": true},
  // Glenn: Clip / Foodie / Newbie Newbie
  {"by": "justfeediris", "place": "Binge Coffee House", "city": "Berkeley", "reel": "https://www.instagram.com/reel/DcC8E_pxUwm/", "credit": "Filmed by @justfeediris · Berkeley coffee, matcha and banh mi review.", "brand": "b_bingecoffeehouse", "clip": true},
  // Glenn: Clip / Foodie / Newbie
  {"by": "hangrypotato", "place": "Matzip — Union City", "city": "Union City", "reel": "https://www.instagram.com/reel/DfOSCjHBKPY/", "credit": "Filmed by @hangrypotato · Invited visit disclosed by the creator; confirm current menu prices.", "brand": "b_matzipunioncity", "clip": true},
  // Glenn: Clip / update icon / Mediocre
  {"by": "thesnobbiefoodie", "place": "Bibim Grill", "city": "Dublin", "reel": "https://www.instagram.com/reel/DfGZWFXpfX8/", "credit": "The October promotion in the original has ended. Watch the original review on Instagram.", "brand": "b_bibimgrill"},
  // Glenn: Clip / update icon / Newbie
  {"by": "lub.to.eat", "place": "Bibim Grill", "city": "Dublin", "reel": "https://www.instagram.com/reel/DfDFR78P2Hi/", "credit": "The October promotion in the original has ended. Watch the original review on Instagram.", "brand": "b_bibimgrill"},
  // Glenn: Link only
  {"by": "hungere.for.diy", "place": "Bibim Grill", "city": "Dublin", "reel": "https://www.instagram.com/reel/DfCmQ2EpPsr/", "credit": "Watch the original review on Instagram.", "brand": "b_bibimgrill"},
  // Glenn: Clip / Foodie / Newbie
  {"by": "thismajourney", "place": "Bibim Grill", "city": "Dublin", "reel": "https://www.instagram.com/reel/DfALmKdtaig/", "credit": "Watch the original review on Instagram.", "brand": "b_bibimgrill"},

  /* Batch 90 — late NaYa requests; branch credits retained. */
  // Glenn: Clip / Heavy Hitter / Fasho
  {"by": "hungryhungryheejin", "place": "NaYa Dessert Cafe", "brand": "b_nayadessertcafe", "reel": "https://www.instagram.com/reel/De8TxUbOfCI/", "credit": "Original San Mateo review by @hungryhungryheejin. Watch on Instagram.", "city": "San Mateo"},
  // Glenn: Clip / Foodie / Mediocre
  {"by": "liltiffyvert", "place": "NaYa Dessert Cafe", "brand": "b_nayadessertcafe", "reel": "https://www.instagram.com/reel/DeNPxiISX3z/", "credit": "Filmed by @liltiffyvert · Invited visit disclosed by the creator. Filmed at the Davis branch; the SF menu prices on the listing do not represent Davis prices.", "city": "Davis", "clip": true},
  // Glenn: Clip / Foodie / Newbie
  {"by": "jovana.camberos", "place": "NaYa Dessert Cafe", "brand": "b_nayadessertcafe", "reel": "https://www.instagram.com/reel/DVxPfFGEfNz/", "credit": "Filmed by @jovana.camberos · Filmed at the Geary Boulevard branch in San Francisco, identified by the storefront shown in the video. Confirm current menu and availability.", "city": "San Francisco", "clip": true},

  /* Batch 91 — existing creator pages retain their earlier reviews. */
  // Glenn: Clip / Newbie
  {"by": "justfeediris", "place": "Funky Elephant", "brand": "b_funkyelephant", "reel": "https://www.instagram.com/reel/DfKUkZESzhe/", "credit": "Filmed by @justfeediris · Berkeley branch, identified by the on-screen title and the tagged @funky.elephant account.", "city": "Berkeley", "clip": true},
  // Glenn: Clip / Newbie
  {"by": "justfeediris", "place": "U Dessert Story", "brand": "b_udessertstory", "reel": "https://www.instagram.com/reel/DfNjbJ8NfrY/", "credit": "Filmed by @justfeediris · Berkeley branch, identified by the on-screen title. The listing also represents the San Francisco shop; confirm branch menus and availability.", "city": "Berkeley", "clip": true},
  // Glenn: Clip / Heavy Hitter / Update icon
  {"by": "aztec.ed", "place": "Taqueria El Chacho", "brand": "b_taqueriaelchacho", "reel": "https://www.instagram.com/reel/DfBR9qRMuEF/", "credit": "Filmed by @aztec.ed · Oakland truck at 569 High St. This review advertises a Wednesday $2-taco special; confirm current promotions directly. The promotional price is not the regular menu price.", "city": "Oakland", "clip": true},
  {"by": "carlacharisse_", "place": "Cà Phê Việt", "city": "San Francisco", "brand": "b_capheviet", "reel": "https://www.instagram.com/reel/DfQpxP_OrNs/", "credit": "Original by @carlacharisse_.", "clip": true},
  {"by": "sulli_eats", "place": "Cà Phê Việt", "city": "San Francisco", "brand": "b_capheviet", "reel": "https://www.instagram.com/reel/Dbo-XCziORS/", "credit": "Original by @sulli_eats.", "clip": true},
  {"by": "baygirlseat", "place": "Cà Phê Việt", "city": "San Francisco", "brand": "b_capheviet", "reel": "https://www.instagram.com/p/DbFRtWJFCq4/?img_index=4", "credit": "Original by @baygirlseat. Carousel slide 4, with no audio in the original.", "clip": true},
  {"by": "phamamiii", "place": "Mr. Dewie’s Cashew Creamery", "city": "Albany", "brand": "b_mrdewies", "reel": "https://www.instagram.com/reel/DcKukITsvL8/", "credit": "Original by @phamamiii.", "clip": true},
  {"by": "heraldh", "place": "Mr. Dewie’s Cashew Creamery", "city": "Albany", "brand": "b_mrdewies", "reel": "https://www.instagram.com/reel/DNETLY6zdwr/", "credit": "Original by @heraldh. Filmed at the Walnut Creek scoop shop. Check current flavors with the shop.", "clip": true},
  {"by": "thesnobbiefoodie", "place": "Mr. Dewie’s Cashew Creamery", "city": "Albany", "brand": "b_mrdewies", "reel": "https://www.instagram.com/reel/DJzk1MxxACw/", "credit": "Original by @thesnobbiefoodie. Filmed at the Walnut Creek scoop shop. Check current flavors with the shop.", "clip": true},
  {"by": "tastewith.rach", "place": "Mr. Dewie’s Cashew Creamery", "city": "Albany", "brand": "b_mrdewies", "reel": "https://www.instagram.com/reel/DT88ZKwEhhy/", "credit": "Original by @tastewith.rach."},
  {"by": "thetastebud", "place": "Piglet & Co.", "city": "San Francisco", "brand": "b_pigletandco", "reel": "https://www.instagram.com/reel/DfQyIxvTeZI/", "credit": "Original by @thetastebud.", "clip": true},
  {"by": "foodiswhyimbroke", "place": "Piglet & Co.", "city": "San Francisco", "brand": "b_pigletandco", "reel": "https://www.instagram.com/reel/DHrx8JryfkT/", "credit": "Original by @foodiswhyimbroke.", "clip": true},
  {"by": "fat_ash_foodie", "place": "Tsujita Artisan Noodle · San Jose", "city": "San Jose", "brand": "b_tsujitasanjose", "reel": "https://www.instagram.com/reel/DfQ3_1YpBRz/", "credit": "Original by @fat_ash_foodie.", "clip": true},
  {"by": "kimoni.eatss", "place": "Tsujita Artisan Noodle · San Jose", "city": "San Jose", "brand": "b_tsujitasanjose", "reel": "https://www.instagram.com/reel/DLIjnupS6XR/", "credit": "Original by @kimoni.eatss.", "clip": true},
  {"by": "festusfeasts", "place": "The Lumpia Company", "city": "Oakland", "brand": "b_lumpiacompany", "reel": "https://www.instagram.com/reel/DfGBXamN_aC/", "credit": "Original by @festusfeasts.", "clip": true},
  {"by": "keneats_", "place": "The Lumpia Company", "city": "Oakland", "brand": "b_lumpiacompany", "reel": "https://www.instagram.com/reel/DcuDfqbyThI/", "credit": "Original by @keneats_. Filmed at Oracle Park in San Francisco.", "clip": true},
  {"by": "e40", "place": "The Lumpia Company", "city": "Oakland", "brand": "b_lumpiacompany", "reel": "https://www.instagram.com/reel/CZRo4pQj4qy/", "credit": "Original by @e40.", "clip": true},
  {"by": "mamamarquez888", "place": "The Lumpia Company", "city": "Oakland", "brand": "b_lumpiacompany", "reel": "https://www.instagram.com/reel/DBeJjCNPq0g/", "credit": "Original by @mamamarquez888.", "clip": true},
  {"by": "andreweatsinsf", "place": "The Lumpia Company", "city": "Oakland", "brand": "b_lumpiacompany", "reel": "https://www.instagram.com/reel/C_Bvy9cydR-/", "credit": "Original by @andreweatsinsf. Filmed at Oracle Park in San Francisco."},
  {"by": "sisicooksandeats", "place": "East Bay Buffet", "city": "Dublin", "brand": "b_eastbaybuffet", "reel": "https://www.instagram.com/reel/DfRFIHuSfnA/", "credit": "Original by @sisicooksandeats.", "clip": true},
  {"by": "sisicooksandeats", "place": "Moonlight Café", "city": "Bay Area", "brand": "b_moonlightcafecart", "reel": "https://www.instagram.com/reel/Dea5edeyxnG/", "credit": "Original by @sisicooksandeats.", "clip": true},
  {"by": "yourglobalfoodiebff", "place": "Always Yours Bakery Cafe", "city": "Castro Valley", "brand": "b_alwaysyoursbakerycafe", "reel": "https://www.instagram.com/reel/DLqjuSmy4lo/", "credit": "Original by @yourglobalfoodiebff.", "clip": true},
  {"by": "sisicooksandeats", "place": "Always Yours Bakery Cafe", "city": "Castro Valley", "brand": "b_alwaysyoursbakerycafe", "reel": "https://www.instagram.com/reel/Dd8ANmUyPMd/", "credit": "Original by @sisicooksandeats.", "clip": true},
  {"by": "sisicooksandeats", "place": "North Italia · Walnut Creek", "city": "Walnut Creek", "brand": "b_northitaliawalnutcreek", "reel": "https://www.instagram.com/reel/DdIgGFoSgn7/", "credit": "Original by @sisicooksandeats.", "clip": true},
  {"by": "eatwithsie", "place": "North Italia · Walnut Creek", "city": "Walnut Creek", "brand": "b_northitaliawalnutcreek", "reel": "https://www.instagram.com/reel/DWUb9PzAZ1e/", "credit": "Original by @eatwithsie. The creator disclosed a partnership or invitation.", "clip": true},
  {"by": "fedoramaelle", "place": "North Italia · Walnut Creek", "city": "Walnut Creek", "brand": "b_northitaliawalnutcreek", "reel": "https://www.instagram.com/reel/DWMxzGTEnrn/", "credit": "Original by @fedoramaelle.", "clip": true},
  {"by": "mukbangyourmama", "place": "North Italia · Walnut Creek", "city": "Walnut Creek", "brand": "b_northitaliawalnutcreek", "reel": "https://www.instagram.com/reel/DWURO76BlTw/", "credit": "Original by @mukbangyourmama.", "clip": true},
  {"by": "andreweatsinsf", "place": "North Italia · Walnut Creek", "city": "Walnut Creek", "brand": "b_northitaliawalnutcreek", "reel": "https://www.instagram.com/reel/DWXI_sAEmYS/", "credit": "Original by @andreweatsinsf. The creator disclosed a partnership or invitation."},
  {"by": "reelkevo", "place": "Donut Farm · Berkeley", "city": "Berkeley", "brand": "b_donutfarm", "reel": "https://www.instagram.com/reel/DaZB5L1Sytt/", "credit": "Original by @reelkevo.", "clip": true},
  {"by": "heraldh", "place": "Donut Farm · Berkeley", "city": "Berkeley", "brand": "b_donutfarm", "reel": "https://www.instagram.com/reel/DaTQnC-qJEA/", "credit": "Original by @heraldh.", "clip": true},
  {"by": "myrealtoralexbradeis", "place": "Donut Farm · Berkeley", "city": "Berkeley", "brand": "b_donutfarm", "reel": "https://www.instagram.com/reel/DVDBfJXjoVU/", "credit": "Original by @myrealtoralexbradeis.", "clip": true},
  {"by": "rollingwithdeneats", "place": "Bober Tea & Mochi Dough", "city": "Martinez", "brand": "b_bobertea", "reel": "https://www.instagram.com/reel/C8LtnOPN4Bq/", "credit": "Original by @rollingwithdeneats. The creator disclosed a partnership or invitation.", "clip": true},
  {"by": "rollingwithdeneats", "place": "Bober Tea & Mochi Dough", "city": "Martinez", "brand": "b_bobertea", "reel": "https://www.instagram.com/reel/C57QFmHLTtE/", "credit": "Original by @rollingwithdeneats.", "clip": true},
  {"by": "felicitythefoodie", "place": "Macs by Icky", "city": "Union City", "brand": "b_macsbyicky", "reel": "https://www.instagram.com/reel/C2tu5NTLqDa/", "credit": "Original by @felicitythefoodie.", "clip": true},
  {"by": "rowbot408", "place": "Top of the Hill Festival", "city": "Daly City", "reel": "https://www.instagram.com/reel/Desrzn9s1VC/", "credit": "Original by @rowbot408.", "clip": true},
  {"by": "revrocrichboy", "place": "POD DTG", "city": "Pinole", "brand": "b_poddtg", "reel": "https://www.instagram.com/reel/DdpL1X7yKrr/", "credit": "Original by @revrocrichboy.", "clip": true},
  {"by": "revrocrichboy", "place": "POD DTG", "city": "Pinole", "brand": "b_poddtg", "reel": "https://www.instagram.com/reel/DXSgcMpEsU0/", "credit": "Original by @revrocrichboy.", "clip": true},
  {"by": "revrocrichboy", "place": "POD DTG", "city": "Pinole", "brand": "b_poddtg", "reel": "https://www.instagram.com/reel/DUpKLiyEcEY/", "credit": "Original by @revrocrichboy.", "clip": true},
  {"by": "revrocrichboy", "place": "POD DTG", "city": "Pinole", "brand": "b_poddtg", "reel": "https://www.instagram.com/reel/DDfKABWyHij/", "credit": "Original by @revrocrichboy.", "clip": true},
  {"by": "andreweatsinsf", "place": "Gao Viet Kitchen", "city": "San Francisco", "brand": "b_gaovietkitchen", "reel": "https://www.instagram.com/reel/C0zzpVTSTx3/", "credit": "Original by @andreweatsinsf. Filmed at the San Francisco Sunset location.", "clip": true},
  {"by": "grubwitmike", "place": "Gao Viet Kitchen", "city": "San Francisco", "brand": "b_gaovietkitchen", "reel": "https://www.instagram.com/reel/CsOubherntT/", "credit": "Original by @grubwitmike. Filmed at the San Francisco Sunset location.", "clip": true},

  // Batch 93: four reviews of Wooga in Cupertino.
  {"by": "mukbangyourmama", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/DfSoOhmBrml/", "credit": "Filmed by @mukbangyourmama at Wooga Korean BBQ in Cupertino.", "clip": true},
  {"by": "hungrydanz", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/C9eFnN0xsUE/", "credit": "Filmed by @hungrydanz at Wooga Korean BBQ in Cupertino.", "clip": true},
  {"by": "charlikestoeat", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/DAPRm7FyDNW/", "credit": "Filmed by @charlikestoeat at Wooga Korean BBQ in Cupertino.", "clip": true},
  {"by": "siliconvalley.foodies", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/C-EVou-PSMY/", "credit": "Filmed by @siliconvalley.foodies at Wooga Korean BBQ in Cupertino.", "clip": true},

  // Batch 94: Pinole, San Francisco and Oakland reviews.
  {"by": "kat.dazzzle", "place": "Sweet Pipers", "city": "Pinole", "brand": "b_sweetpipers", "reel": "https://www.instagram.com/reel/DfTfpVfgT8A/", "credit": "Filmed by @kat.dazzzle at Sweet Pipers in Pinole.", "clip": true},
  {"by": "celineeats", "place": "Dolores Deluxe", "city": "San Francisco", "brand": "b_doloresdeluxe", "reel": "https://www.instagram.com/reel/DfTbab1iKXB/", "credit": "Filmed by @celineeats. The Bon Voyage sandwich was a limited special.", "clip": true},
  {"by": "grubwitmike", "place": "Brasa Bros", "city": "San Francisco", "brand": "b_brasabros", "reel": "https://www.instagram.com/reel/DNWwiHiRGof/", "credit": "Filmed by @grubwitmike at Brasa Bros. Paid promotion disclosed by the creator.", "clip": true},
  {"by": "thesnacksensei", "place": "Brasa Bros", "city": "San Francisco", "brand": "b_brasabros", "reel": "https://www.instagram.com/reel/DM_pOd2vqSh/", "credit": "Filmed by @thesnacksensei at Brasa Bros. Archival August 2025 opening review.", "clip": "creator"},
  {"by": "startingfiresevrywhere", "place": "Brasa Bros", "city": "San Francisco", "brand": "b_brasabros", "reel": "https://www.instagram.com/reel/De5AERCRDzW/", "credit": "Filmed by @startingfiresevrywhere at Brasa Bros.", "clip": true},
  {"by": "queen.food.e", "place": "Brasa Bros", "city": "San Francisco", "brand": "b_brasabros", "reel": "https://www.instagram.com/reel/DdJzWT-vPYh/", "credit": "Filmed by @queen.food.e at Brasa Bros.", "clip": true},
  {"by": "cindydreamtravel", "place": "Brasa Bros", "city": "San Francisco", "brand": "b_brasabros", "reel": "https://www.instagram.com/reel/Dcgpc6tgSRY/", "credit": "Filmed by @cindydreamtravel at Brasa Bros.", "clip": "creator"},
  {"by": "yummylouey", "place": "Kung Fu Mala", "city": "Oakland", "brand": "b_kungfumala", "reel": "https://www.instagram.com/reel/DYptgDShjz-/", "credit": "Filmed by @yummylouey at Kung Fu Mala in Oakland.", "clip": true},
  {"by": "agnespittioni", "place": "Kung Fu Mala", "city": "Oakland", "brand": "b_kungfumala", "reel": "https://www.instagram.com/reel/DNRiXHzytGH/", "credit": "Filmed by @agnespittioni at Kung Fu Mala in Oakland.", "clip": true},
  {"by": "j00diefoodie", "place": "Kung Fu Mala", "city": "Oakland", "brand": "b_kungfumala", "reel": "https://www.instagram.com/reel/DLQNvevPcKj/", "credit": "Filmed by @j00diefoodie at Kung Fu Mala in Oakland.", "clip": true},
  {"by": "erica.sorelle", "place": "Nawah Market & Deli", "city": "Oakland", "brand": "b_nawahmarket", "reel": "https://www.instagram.com/reel/DfTXXJzM3pw/", "credit": "Filmed by @erica.sorelle at Nawah Market & Deli in Oakland.", "clip": true},
]

/*
  The foodies' own pages, including the yellow overflow. The first 24 keep
  their original order and seats (categories.ts:
  "Food reviewer"). Monogram tiles until they send a picture.
*/
const PALETTE = ['#1F1B24', '#24161A', '#13201C', '#1B1F2A', '#2A1D12', '#191919']
export const FOODIE_SEED: LocalSeed[] = FOODIE_PAGES.filter((f) => !f.brand).map((f, i) => ({
  slug: `foodie-${f.handle.replace(/[^a-z0-9]+/g, '-')}`,
  name: f.name,
  label: f.label,
  cuisine: f.cuisine ?? 'Food reviewer',
  tagline: `${f.cuisine ? 'Reviews and visits' : 'Bay Area food reviews'}, @${f.instagram ?? f.handle}`,
  color: PALETTE[i % PALETTE.length],
  icon: f.icon,
  glow: f.glow,
  instagram: f.instagram,
  prep: 0,
  category: 'Foodie',
  logoTemplate: 'wordmark',
  logoLines: [f.label],
  logoFace: 'script',
  contactOnly: `${f.name} ${f.cuisine ? 'shares reviews and visits' : 'reviews Bay Area food'} on Instagram as @${f.instagram ?? f.handle}. The places reviewed are below. Open one to watch the review or visit the business on BEASTY.`,
  items: [],
}))
