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
  /** A 15-second copy BEASTY plays, /clips/review-<code>.mp4, where one is cut. */
  clip?: boolean
  /** Source attribution when the posting account differs from the reviewer. */
  credit?: string
}

export interface FoodiePage {
  handle: string
  name: string
  label: string
  /** An existing page that is this creator's (Grand-O's), instead of a new one. */
  brand?: string
}

const reel = (code: string) => `https://www.instagram.com/reel/${code}/`

const TOP_FOODIE_PAGES: FoodiePage[] = [
  { handle: 'festusfeasts', name: 'Festus Ezeli', label: 'Festus' },
  { handle: 'thesnacksensei', name: 'Grand-O', label: 'Grand-O', brand: 'b_grando' },
  { handle: 'foodandsachi', name: 'Sachi', label: 'Sachi' },
  { handle: 'hungere.for.diy', name: 'Hunger E for DIY', label: 'Hunger E' },
  { handle: 'justmostie', name: 'Mostie', label: 'Mostie' },
  { handle: 'capturedbysado', name: 'capturedbysado', label: 'Sado' },
  { handle: 'allie.eats', name: 'Allie Tong', label: 'Allie Tong' },
  { handle: 'seekeasyeats', name: 'Seekeasy', label: 'Seekeasy' },
  { handle: 'orangeginger', name: 'Liz Maw', label: 'Liz Maw' },
  { handle: 'antoinetterzz', name: 'antoinetterzz', label: 'Antoinette' },
  { handle: 'takeoutwithtuck', name: 'The Honest Reviewer', label: 'Tuck' },
  { handle: 'chefmelissaking', name: 'Melissa King', label: 'Melissa King' },
  { handle: 'celineeats', name: 'celine', label: 'Celine' },
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
  { handle: 'peggy_shoo', name: 'peggy xu', label: 'Peggy' },
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
    "handle": "jantrinanicole",
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
    "handle": "bayareamunchies510",
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
    "handle": "daeatzwitbri",
    "name": "@daeatzwitbri",
    "label": "daeatzwitbri"
  },
  {
    "handle": "thetastebud",
    "name": "@thetastebud",
    "label": "thetastebud"
  },
  {
    "handle": "dariananthony_",
    "name": "@dariananthony_",
    "label": "dariananthony_"
  },
  {
    "handle": "charweeezy",
    "name": "@charweeezy",
    "label": "charweeezy"
  },
  {
    "handle": "mukbangyourmama",
    "name": "@mukbangyourmama",
    "label": "mukbangyourmama"
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
    "label": "livingvivalakillah"
  },
  {
    "handle": "eighty6ix_",
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
  {
    "handle": "carlaylayyy",
    "name": "@carlaylayyy",
    "label": "carlaylayyy"
  },
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
    "handle": "wthellydanyelly",
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
    "label": "aztec.ed"
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
    "handle": "imadoniseats",
    "name": "@imadoniseats",
    "label": "imadoniseats"
  },
  {
    "handle": "mzz.juxtaposition",
    "name": "@mzz.juxtaposition",
    "label": "mzz.juxtaposition"
  },
  {
    "handle": "yourglobalfoodiebff",
    "name": "@yourglobalfoodiebff",
    "label": "yourglobalfoodiebff"
  },
  {
    "handle": "dchangshangry",
    "name": "@dchangshangry",
    "label": "dchangshangry"
  },
  {
    "handle": "bayarea.foodie.san",
    "name": "@bayarea.foodie.san",
    "label": "bayarea.foodie.san"
  },
  {
    "handle": "felicitythefoodie",
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
    "label": "thesnobbiefoodie"
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
    "handle": "hellahansel",
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
    "handle": "foodgiveness",
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
    "handle": "siliconvalley.foodies",
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
  {
    "handle": "andreweatsinsf",
    "name": "@andreweatsinsf",
    "label": "andreweatsinsf"
  },
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
    "label": "cestalmoco"
  },
  {
    "handle": "hangrypotato",
    "name": "@hangrypotato",
    "label": "hangrypotato"
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
  }
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
  cuisine: 'Food reviewer',
  tagline: `Bay Area food reviews, @${f.handle}`,
  color: PALETTE[i % PALETTE.length],
  prep: 0,
  category: 'Foodie',
  logoTemplate: 'wordmark',
  logoLines: [f.label],
  logoFace: 'script',
  contactOnly: `${f.name} reviews Bay Area food on Instagram as @${f.handle}. The places reviewed are below: open one to watch the review, or to go to that business on BEASTY. BEASTY has not spoken to them yet: this spot is held, not taken.`,
  items: [],
}))
