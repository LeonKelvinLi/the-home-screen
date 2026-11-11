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

  The first 24 FOODIE_PAGES reflect Glenn’s November 6 heavy-hitter requests. Other creators
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
  /** Featured creators share this credited film without duplicating it in Watch. */
  featuring?: string[]
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

// Glenn, November 6: move Ronnie Banks and MsAshleyVee to the front,
// then bring the explicitly tagged heavy hitters toward the first page.
const TOP_FOODIE_PAGES: FoodiePage[] = [
  {
    "handle": "ronniebanks",
    "name": "Ronnie Banks",
    "label": "Ronnie Banks",
    "icon": "foodie-ronniebanks-v103"
  },
  {
    "handle": "msashleyvee",
    "name": "MsAshleyVee",
    "label": "Ashley Vee",
    "icon": "foodie-msashleyvee-v103"
  },
  {
    "handle": "feed_happiness_",
    "name": "@feed_happiness_",
    "label": "feed_happiness_",
    "icon": "foodie-feed-happiness-v103"
  },
  {
    "handle": "ashleyveats",
    "name": "@ashleyveats",
    "label": "ashleyveats",
    "icon": "foodie-ashleyveats-v103"
  },
  {
    "handle": "blurgotti",
    "name": "@blurgotti",
    "label": "blurgotti",
    "icon": "foodie-blurgotti-v103"
  },
  {
    "handle": "sebascastroficial",
    "name": "@sebascastroficial",
    "label": "sebascastroficial",
    "icon": "foodie-sebascastroficial-v103"
  },
  {
    "handle": "festusfeasts",
    "icon": "foodie-festusfeasts-v85",
    "name": "Festus Ezeli",
    "label": "Festus"
  },
  {
    "handle": "thesnacksensei",
    "name": "Grand-O",
    "label": "Grand-O",
    "brand": "b_grando"
  },
  {
    "handle": "foodandsachi",
    "icon": "foodie-foodandsachi-v85",
    "name": "Sachi",
    "label": "Sachi"
  },
  {
    "handle": "grubwitmike",
    "name": "Grubwitmike",
    "label": "Grubwitmike",
    "icon": "foodie-grubwitmike-v99"
  },
  {
    "handle": "hungry4munchies",
    "name": "@hungry4munchies",
    "label": "hungry4munchies"
  },
  {
    "handle": "bayarea_fooddreamz",
    "name": "@bayarea_fooddreamz",
    "label": "bayarea_fooddreamz"
  },
  {
    "handle": "eatwithsie",
    "name": "@eatwithsie",
    "label": "eatwithsie"
  },
  {
    "handle": "daeatzwitbri",
    "icon": "foodie-daeatzwitbri-v85",
    "name": "@daeatzwitbri",
    "label": "daeatzwitbri"
  },
  {
    "handle": "thetastebud",
    "name": "@thetastebud",
    "label": "thetastebud",
    "icon": "foodie-thetastebud-v92"
  },
  {
    "handle": "aztec.ed",
    "name": "@aztec.ed",
    "label": "aztec.ed",
    "icon": "foodie-aztec-ed-v91",
    "instagram": "aztec.ed"
  },
  {
    "handle": "imadoniseats",
    "icon": "foodie-imadoniseats-v85",
    "name": "@imadoniseats",
    "label": "imadoniseats"
  },
  {
    "handle": "mzz.juxtaposition",
    "name": "@mzz.juxtaposition",
    "label": "mzz.juxtaposition",
    "icon": "foodie-mzz-juxtaposition-v99"
  },
  {
    "handle": "yourglobalfoodiebff",
    "name": "@yourglobalfoodiebff",
    "label": "yourglobalfoodiebff",
    "icon": "foodie-globalbff-v92"
  },
  {
    "handle": "felicitythefoodie",
    "icon": "foodie-felicitythefoodie-v86",
    "name": "@felicitythefoodie",
    "label": "felicitythefoodie"
  },
  {
    "handle": "trinhdoesthings",
    "name": "@trinhdoesthings",
    "label": "trinhdoesthings"
  },
  {
    "handle": "smackinfood",
    "name": "@smackinfood",
    "label": "smackinfood",
    "icon": "foodie-smackinfood-v97"
  },
  {
    "handle": "drooling.bae",
    "name": "@drooling.bae",
    "label": "drooling.bae",
    "icon": "foodie-drooling-bae-v98"
  },
  {
    "handle": "thesauceboss_",
    "name": "@thesauceboss_",
    "label": "thesauceboss_"
  }
]

/** Everyone else remains reachable on the yellow More foodies sheets. */
export const MORE_FOODIE_PAGES: FoodiePage[] = [
  {
    "handle": "bayarea.foodie.adventures",
    "name": "@bayarea.foodie.adventures",
    "label": "bayarea.foodie.adventures"
  },
  {
    "handle": "siliconvalley.foodies",
    "icon": "foodie-siliconvalley-foodies-v93",
    "name": "@siliconvalley.foodies",
    "label": "siliconvalley.foodies"
  },
  {
    "handle": "jacksdiningroom",
    "name": "@jacksdiningroom",
    "label": "jacksdiningroom"
  },
  {
    "handle": "andreweatsinsf",
    "name": "@andreweatsinsf",
    "label": "andreweatsinsf",
    "icon": "foodie-andrew-v92"
  },
  {
    "handle": "eatswithkath",
    "name": "@eatswithkath",
    "label": "eatswithkath"
  },
  {
    "handle": "cestalmoco",
    "name": "@cestalmoco",
    "label": "cestalmoco",
    "icon": "foodie-cestalmoco-v88"
  },
  {
    "handle": "kangofrealty",
    "name": "@kangofrealty",
    "label": "kangofrealty"
  },
  {
    "handle": "fedoramaelle",
    "icon": "foodie-fedoramaelle-v86",
    "name": "@fedoramaelle",
    "label": "fedoramaelle"
  },
  {
    "handle": "pastrywithjenn",
    "name": "Jenn Yee",
    "label": "Jenn",
    "icon": "foodie-pastrywithjenn-v86"
  },
  {
    "handle": "travelwtiff",
    "name": "@travelwtiff",
    "label": "Tiffany",
    "icon": "foodie-travelwtiff-v86"
  },
  {
    "handle": "_emwong_",
    "name": "Emma Wong-Stephens",
    "label": "Emma",
    "icon": "foodie-emwong-v86"
  },
  {
    "handle": "kimoni.eatss",
    "name": "Kimball & Monica",
    "label": "Kimoni",
    "icon": "foodie-kimoni-eatss-v88"
  },
  {
    "handle": "baygirlseat",
    "instagram": "baygirlseat",
    "name": "Amandy",
    "label": "Amandy",
    "icon": "foodie-baygirlseat-v107"
  },
  {
    "handle": "heraldh",
    "instagram": "heraldh",
    "name": "Herald John",
    "label": "Herald",
    "icon": "foodie-heraldh-v92"
  },
  {
    "handle": "foodiswhyimbroke",
    "instagram": "foodiswhyimbroke",
    "name": "Yen Kim Phan",
    "label": "Yen",
    "icon": "foodie-foodiswhyimbroke-v92"
  },
  {
    "handle": "keneats_",
    "instagram": "keneats_",
    "name": "kenya // sf bay area foodie 😋",
    "label": "kenya",
    "icon": "foodie-keneats-v92"
  },
  {
    "handle": "e40",
    "name": "E-40",
    "label": "E-40",
    "brand": "b_e40"
  },
  {
    "handle": "mamamarquez888",
    "instagram": "mamamarquez888",
    "name": "Megan Marquez",
    "label": "Megan",
    "icon": "foodie-mamamarquez-v92"
  },
  {
    "handle": "reelkevo",
    "instagram": "reelkevo",
    "name": "Kevin",
    "label": "Kevin",
    "icon": "foodie-reelkevo-v92"
  },
  {
    "handle": "rollingwithdeneats",
    "instagram": "rollingwithdeneats",
    "name": "Denise",
    "label": "Denise",
    "icon": "foodie-rollingwithdeneats-v103"
  },
  {
    "handle": "agnespittioni",
    "name": "Agnes Pittioni",
    "label": "Agnes",
    "icon": "foodie-agnespittioni-v103",
    "instagram": "agnespittioni"
  },
  {
    "handle": "j00diefoodie",
    "name": "J00die Foodie",
    "label": "J00die Foodie",
    "icon": "foodie-j00diefoodie-v94",
    "instagram": "j00diefoodie"
  },
  {
    "handle": "aliasharrief",
    "name": "@aliasharrief",
    "label": "aliasharrief",
    "icon": "foodie-aliasharrief-v97"
  },
  {
    "handle": "carlosbradley",
    "name": "@carlosbradley",
    "label": "carlosbradley",
    "icon": "foodie-carlosbradley-v97"
  },
  {
    "handle": "jc.eeats",
    "name": "@jc.eeats",
    "label": "jc.eeats",
    "icon": "foodie-jc-eeats-v98"
  },
  {
    "handle": "monaeatsnearby",
    "name": "@monaeatsnearby",
    "label": "monaeatsnearby",
    "icon": "foodie-monaeatsnearby-v98"
  },
  {
    "handle": "bayareafoodiecrew",
    "name": "@bayareafoodiecrew",
    "label": "bayareafoodiecrew",
    "icon": "foodie-bayareafoodiecrew-v98"
  },
  {
    "handle": "janniners",
    "name": "@janniners",
    "label": "janniners",
    "icon": "foodie-janniners-v98"
  },
  {
    "handle": "alwayshannegry",
    "name": "@alwayshannegry",
    "label": "alwayshannegry",
    "icon": "foodie-alwayshannegry-v100"
  },
  {
    "handle": "rainmoreturely",
    "name": "@rainmoreturely",
    "label": "rainmoreturely",
    "icon": "foodie-rainmoreturely-v100"
  },
  {
    "handle": "_wheresthefoodat",
    "name": "@_wheresthefoodat",
    "label": "_wheresthefoodat",
    "icon": "foodie-wheresthefoodat-v103"
  },
  {
    "handle": "sfbayfood",
    "name": "@sfbayfood",
    "label": "sfbayfood",
    "icon": "foodie-sfbayfood-v103"
  },
  {
    "handle": "zeyno.ern",
    "name": "@zeyno.ern",
    "label": "zeyno.ern",
    "icon": "foodie-zeyno-ern-v107"
  },
  {
    "handle": "booziebrunch",
    "name": "Novi Mitchell",
    "label": "Novi"
  },
  {
    "handle": "thekhaysie",
    "name": "@thekhaysie",
    "label": "thekhaysie",
    "icon": "foodie-thekhaysie-v105"
  },
  {
    "handle": "kelmeleats",
    "name": "Kel & Mel | San Francisco Food, Fun, & Travel",
    "label": "kelmeleats",
    "icon": "foodie-kelmeleats-v107"
  },
  {
    "handle": "courtneylyneaa",
    "name": "Courtney Lynea | Bay Area Influencer",
    "label": "courtneylyneaa",
    "icon": "foodie-courtneylyneaa-v107"
  },
  {
  "handle": "hungere.for.diy",
  "icon": "foodie-hungerefordiy-v112",
  "name": "Hunger E for DIY",
  "label": "Hunger E"
},
  {
    "handle": "justmostie",
    "icon": "foodie-justmostie-v85",
    "name": "Mostie",
    "label": "Mostie"
  },
  {
    "handle": "capturedbysado",
    "icon": "foodie-capturedbysado-v86",
    "name": "capturedbysado",
    "label": "Sado"
  },
  {
    "handle": "allie.eats",
    "icon": "foodie-allie-eats-v86",
    "name": "Allie Tong",
    "label": "Allie Tong"
  },
  {
    "handle": "seekeasyeats",
    "icon": "foodie-whofedandrew-v86",
    "instagram": "whofedandrew",
    "name": "Andrew Greenstein",
    "label": "Andrew"
  },
  {
    "handle": "orangeginger",
    "name": "Liz Maw",
    "label": "Liz Maw",
    "icon": "foodie-orangeginger-v98"
  },
  {
    "handle": "antoinetterzz",
    "name": "antoinetterzz",
    "label": "Antoinette"
  },
  {
    "handle": "bayarea.kulture",
    "instagram": "bayarea.kulture",
    "name": "Bay Area Kulture",
    "label": "Bay Area Kulture",
    "cuisine": "Bay Area food and culture",
    "icon": "foodie-bayarea-kulture-v94",
    "glow": true
  },
  {
    "handle": "chefmelissaking",
    "name": "Melissa King",
    "label": "Melissa King"
  },
  {
    "handle": "celineeats",
    "instagram": "celineeats",
    "name": "celine",
    "label": "Celine",
    "icon": "foodie-celineeats-v94"
  },
  {
    "handle": "singlecatm0m",
    "name": "Tiffany",
    "label": "Tiffany"
  },
  {
    "handle": "kimjsseats",
    "name": "Where Jess at",
    "label": "Jess"
  },
  {
    "handle": "oaktowngrubhub",
    "name": "NowThatLooksGooD",
    "label": "Oaktown Grub"
  },
  {
    "handle": "thespoonlist",
    "name": "The Spoon List",
    "label": "Spoon List"
  },
  {
    "handle": "sherryeatworld",
    "name": "Sherry Shi",
    "label": "Sherry Shi"
  },
  {
    "handle": "hungrydanz",
    "name": "Dan",
    "label": "Dan",
    "icon": "foodie-hungrydanz-v98"
  },
  {
    "handle": "iamnikkieg",
    "name": "Nikkie G",
    "label": "Nikkie G",
    "icon": "foodie-iamnikkieg-v111"
  },
  {
    "handle": "janeethefoodie",
    "name": "Jane",
    "label": "Jane"
  },
  {
    "handle": "peggy_shoo",
    "icon": "foodie-peggy-shoo-v86",
    "name": "peggy xu",
    "label": "Peggy"
  },
  {
    "handle": "zarina.nawabi",
    "name": "@zarina.nawabi",
    "label": "zarina.nawabi"
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
    "label": "acoupleofcooks",
    "icon": "foodie-acoupleofcooks-v98"
  },
  {
    "handle": "jantrinanicole",
    "icon": "foodie-jantrinanicole-v86",
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
    "icon": "foodie-bayareamunchies510-v86",
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
    "label": "foodieberrie",
    "instagram": "foodieberrie",
    "icon": "foodie-foodieberrie-v95"
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
    "handle": "bayareafoodz",
    "name": "@bayareafoodz",
    "label": "bayareafoodz",
    "icon": "foodie-bayareafoodz-v108"
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
    "handle": "dariananthony_",
    "name": "@dariananthony_",
    "label": "dariananthony_"
  },
  {
    "handle": "charweeezy",
    "icon": "foodie-charweeezy-v86",
    "name": "@charweeezy",
    "label": "charweeezy"
  },
  {
    "handle": "mukbangyourmama",
    "name": "@mukbangyourmama",
    "label": "mukbangyourmama",
    "icon": "foodie-mukbangyourmama-v88"
  },
  {
    "handle": "wanderingstefany",
    "name": "@wanderingstefany",
    "label": "wanderingstefany"
  },
  {
    "handle": "lifebyvivien",
    "name": "@lifebyvivien",
    "label": "lifebyvivien",
    "icon": "foodie-lifebyvivien-v107"
  },
  {
    "handle": "andre___lucas",
    "name": "@andre___lucas",
    "label": "andre___lucas"
  },
  {
    "handle": "shrimpfriedroice",
    "name": "@shrimpfriedroice",
    "label": "shrimpfriedroice",
    "icon": "foodie-shrimpfriedroice-v97"
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
    "label": "livingvivalakillah",
    "icon": "foodie-livingvivalakillah-v88"
  },
  {
    "handle": "eighty6ix_",
    "icon": "foodie-eighty6ix-v86",
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
    "name": "Carla Charisse",
    "label": "Carla",
    "instagram": "carlacharisse_",
    "icon": "foodie-carlacharisse-v92"
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
    "icon": "foodie-wthellydanyelly-v85",
    "name": "@wthellydanyelly",
    "label": "wthellydanyelly"
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
  "label": "startingfiresevrywhere",
  "icon": "foodie-startingfiresevrywhere-v114"
},
  {
    "handle": "bylizettexo",
    "name": "@bylizettexo",
    "label": "bylizettexo"
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
    "handle": "dchangshangry",
    "name": "Dan | Your Bay Area Foodie Explorer",
    "label": "Dan",
    "icon": "foodie-dchangshangry-v87"
  },
  {
    "handle": "bayarea.foodie.san",
    "name": "@bayarea.foodie.san",
    "label": "bayarea.foodie.san"
  },
  {
    "handle": "truly_athi",
    "name": "@truly_athi",
    "label": "truly_athi"
  },
  {
    "handle": "jetsetjanine",
    "name": "@jetsetjanine",
    "label": "jetsetjanine"
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
    "handle": "hella._local.mo",
    "name": "@hella._local.mo",
    "label": "hella._local.mo"
  },
  {
    "handle": "thesnobbiefoodie",
    "name": "@thesnobbiefoodie",
    "label": "thesnobbiefoodie",
    "icon": "foodie-thesnobbiefoodie-v89"
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
    "icon": "foodie-hellahansel-v86",
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
  "label": "whatthejessi_",
  "icon": "foodie-whatthejessi-v114"
},
  {
    "handle": "foodgiveness",
    "icon": "foodie-foodgiveness-v86",
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
  "label": "cookwithhenny",
  "icon": "foodie-cookwithhenny-v112"
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
    "handle": "_whatarethechances_",
    "name": "@_whatarethechances_",
    "label": "_whatarethechances_",
    "icon": "foodie-whatarethechances-v97"
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
    "handle": "lovemissfit",
    "name": "@lovemissfit",
    "label": "lovemissfit",
    "icon": "foodie-lovemissfit-v107"
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
    "handle": "eatswithfoodie",
    "name": "@eatswithfoodie",
    "label": "eatswithfoodie",
    "icon": "foodie-eatswithfoodie-v97"
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
  "label": "martiwantsmore",
  "icon": "foodie-martiwantsmore-v112"
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
    "handle": "hangrypotato",
    "name": "@hangrypotato",
    "label": "hangrypotato",
    "icon": "foodie-hangrypotato-v89"
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
  {
    "handle": "broitsva",
    "name": "Va",
    "label": "Va"
  },
  {
    "handle": "fat_ash_foodie",
    "name": "Ash",
    "label": "Ash",
    "icon": "foodie-fatash-v92"
  },
  {
    "handle": "_foodieshots_",
    "name": "Joann Ha",
    "label": "Joann Ha",
    "icon": "foodie-foodieshots-v98"
  },
  {
    "handle": "kitkatvales",
    "name": "@kitkatvales",
    "label": "kitkatvales"
  },
  {
    "handle": "foodwookie",
    "name": "FoodWookie",
    "label": "FoodWookie",
    "icon": "foodie-foodwookie-v99"
  },
  {
    "handle": "sonomacountyliving",
    "name": "@sonomacountyliving",
    "label": "sonomacountyliving"
  },
  {
    "handle": "lovecartier25",
    "name": "@lovecartier25",
    "label": "lovecartier25"
  },
  {
    "handle": "foodelaventures",
    "name": "@foodelaventures",
    "label": "foodelaventures"
  },
  {
    "handle": "foodie_travel_happiness",
    "name": "@foodie_travel_happiness",
    "label": "foodie_travel_happiness",
    "icon": "foodie-foodie-travel-happiness-v98"
  },
  {
    "handle": "peterlyagent",
    "icon": "foodie-peterlyagent-v85",
    "name": "Peter Ly",
    "label": "Peter Ly"
  },
  {
    "handle": "k.smokeskitchen",
    "name": "K. Smokes Kitchen",
    "label": "K. Smokes",
    "icon": "foodie-k-smokeskitchen-v86"
  },
  {
    "handle": "tysf.qods",
    "name": "@tysf.qods",
    "label": "tysf.qods",
    "icon": "foodie-tysf-qods-v86"
  },
  {
    "handle": "ilisaeatssf",
    "name": "@ilisaeatssf",
    "label": "ilisaeatssf",
    "icon": "foodie-ilisaeatssf-v86"
  },
  {
    "handle": "tundemodupee",
    "name": "Tunde Modupe",
    "label": "Tunde",
    "icon": "foodie-tundemodupee-v86"
  },
  {
    "handle": "wafflebam",
    "name": "@wafflebam",
    "label": "Wafflebam",
    "icon": "foodie-wafflebam-v86"
  },
  {
    "handle": "goyuliiago",
    "name": "@goyuliiago",
    "label": "goyuliiago",
    "icon": "foodie-goyuliiago-v104"
  },
  {
    "handle": "jamiebeoutside",
    "name": "@jamiebeoutside",
    "label": "Jamie",
    "icon": "foodie-jamiebeoutside-v86"
  },
  {
    "handle": "anjali_wandersoul",
    "name": "@anjali_wandersoul",
    "label": "Anjali",
    "icon": "foodie-anjali-wandersoul-v86",
    "cuisine": "Travel creator"
  },
  {
    "handle": "gabriiellas",
    "name": "@gabriiellas",
    "label": "gabriiellas",
    "icon": "foodie-gabriiellas-v86"
  },
  {
    "handle": "ploinsanfrancisco",
    "name": "P-LO | SF Bay Area Food + Travel",
    "label": "P-LO SF",
    "icon": "foodie-ploinsanfrancisco-v86"
  },
  {
    "handle": "piscesprincesspriya",
    "name": "Priya",
    "label": "Priya",
    "icon": "foodie-piscesprincesspriya-v86"
  },
  {
    "handle": "d_baylock_",
    "name": "DateNight | D",
    "label": "DateNight D",
    "icon": "foodie-d-baylock-v86"
  },
  {
    "handle": "hallojessa",
    "name": "Jessa Dee Carino",
    "label": "Jessa",
    "icon": "foodie-hallojessa-v86"
  },
  {
    "handle": "lagrandedelabanda",
    "name": "Cynthia La Grande Silva",
    "label": "La Grande",
    "icon": "foodie-lagrandedelabanda-v86",
    "cuisine": "Singer, songwriter and food visits"
  },
  {
    "handle": "chaudownfood",
    "name": "Angie",
    "label": "Angie",
    "icon": "foodie-chaudownfood-v104"
  },
  {
    "handle": "phoebe8food",
    "name": "Phoebe",
    "label": "Phoebe",
    "icon": "foodie-phoebe8food-v86"
  },
  {
    "handle": "karaxhuynh",
    "name": "Kara Huynh",
    "label": "Kara",
    "icon": "foodie-karaxhuynh-v86"
  },
  {
    "handle": "wakeyeats",
    "name": "Weiqi",
    "label": "Weiqi",
    "icon": "foodie-wakeyeats-v86"
  },
  {
    "handle": "dodo__eats",
    "name": "Evan",
    "label": "Evan",
    "icon": "foodie-dodo-eats-v86"
  },
  {
    "handle": "maya_munches",
    "name": "Maya Waldman • SF Foodie",
    "label": "Maya",
    "icon": "foodie-maya-munches-v87"
  },
  {
    "handle": "preet.khatrii",
    "name": "Preet",
    "label": "Preet",
    "icon": "foodie-preet-khatrii-v88"
  },
  {
    "handle": "kogumahs",
    "name": "Sinai",
    "label": "Sinai",
    "icon": "foodie-kogumahs-v88"
  },
  {
    "handle": "nurse.danamae",
    "name": "Dana Mae",
    "label": "Dana Mae",
    "icon": "foodie-nurse-danamae-v88"
  },
  {
    "handle": "thehabibizeat",
    "name": "The Habibiz Eat",
    "label": "Habibiz",
    "icon": "foodie-thehabibizeat-v89"
  },
  {
    "handle": "eatwithbooboo",
    "name": "Eat with Booboo",
    "label": "Booboo",
    "icon": "foodie-eatwithbooboo-v89"
  },
  {
    "handle": "bayarea_foodogram",
    "name": "Lavanya & Deepthi",
    "label": "Foodogram",
    "icon": "foodie-bayarea-foodogram-v89"
  },
  {
    "handle": "lub.to.eat",
    "name": "Lub Lub",
    "label": "Lub Lub",
    "icon": "foodie-lub-to-eat-v89"
  },
  {
    "handle": "thismajourney",
    "name": "Denise",
    "label": "Denise",
    "icon": "foodie-thismajourney-v96"
  },
  {
    "handle": "summer.ishungry",
    "name": "Summer",
    "label": "Summer",
    "icon": "foodie-summer-ishungry-v105"
  },
  {
    "handle": "justfeediris",
    "name": "Iris",
    "label": "Iris",
    "icon": "foodie-justfeediris-v89"
  },
  {
    "handle": "hungryhungryheejin",
    "instagram": "hungryhungryheejin",
    "name": "Hee Jin",
    "label": "Hee Jin"
  },
  {
    "handle": "liltiffyvert",
    "instagram": "liltiffyvert",
    "name": "Tiffany Tran",
    "label": "Tiffany",
    "icon": "foodie-liltiffyvert-v90"
  },
  {
    "handle": "jovana.camberos",
    "instagram": "jovana.camberos",
    "name": "@jovana.camberos",
    "label": "Jovana",
    "icon": "foodie-jovana-camberos-v98"
  },
  {
    "handle": "sulli_eats",
    "instagram": "sulli_eats",
    "name": "𑣲𝓢𝓾𝓵𝓵𝓲 𓎩 ꜱꜰ ʙᴀʏ ᴀʀᴇᴀ ꜰᴏᴏᴅɪᴇ/ʜᴏᴍᴇᴄᴏᴏᴋꜱ",
    "label": "𑣲𝓢𝓾𝓵𝓵𝓲",
    "icon": "foodie-sulli-eats-v92"
  },
  {
    "handle": "phamamiii",
    "instagram": "phamamiii",
    "name": "Diane Pham",
    "label": "Diane",
    "icon": "foodie-phamamiii-v92"
  },
  {
    "handle": "tastewith.rach",
    "instagram": "tastewith.rach",
    "name": "rachel🍴bay area, ca 🇵🇭",
    "label": "rachel🍴bay",
    "icon": "foodie-tastewith-rach-v103"
  },
  {
    "handle": "sisicooksandeats",
    "instagram": "sisicooksandeats",
    "name": "$i$i 🐐 THE GOAT",
    "label": "$i$i",
    "icon": "foodie-sisicooks-v92"
  },
  {
    "handle": "myrealtoralexbradeis",
    "instagram": "myrealtoralexbradeis",
    "name": "Alex Bradeis",
    "label": "Alex",
    "icon": "foodie-alexbradeis-v92"
  },
  {
    "handle": "rowbot408",
    "instagram": "rowbot408",
    "name": "𝐑 𝐎 𝐖 📻💕🇵🇭",
    "label": "𝐑",
    "cuisine": "Event host and creator"
  },
  {
    "handle": "revrocrichboy",
    "instagram": "revrocrichboy",
    "name": "Ricardo Vicente",
    "label": "Ricardo",
    "icon": "foodie-revrocrichboy-v92",
    "cuisine": "Print shop and creator"
  },
  {
    "handle": "takeoutwithtuck",
    "name": "The Honest Reviewer",
    "label": "Tuck"
  },
  {
    "handle": "kat.dazzzle",
    "name": "Kat",
    "label": "Kat",
    "icon": "foodie-kat-dazzzle-v94",
    "instagram": "kat.dazzzle"
  },
  {
    "handle": "queen.food.e",
    "name": "Queen Food E",
    "label": "Queen Food E",
    "icon": "foodie-queen-food-e-v94",
    "instagram": "queen.food.e"
  },
  {
    "handle": "cindydreamtravel",
    "name": "Cindy",
    "label": "Cindy",
    "icon": "foodie-cindydreamtravel-v94",
    "instagram": "cindydreamtravel"
  },
  {
    "handle": "yummylouey",
    "name": "Yummy Louey",
    "label": "Yummy Louey",
    "icon": "foodie-yummylouey-v94",
    "instagram": "yummylouey"
  },
  {
    "handle": "erica.sorelle",
    "name": "Erica Sorelle",
    "label": "Erica",
    "icon": "foodie-erica-sorelle-v94",
    "instagram": "erica.sorelle"
  },
  {
  "handle": "chelchomps",
  "name": "@chelchomps",
  "label": "chelchomps",
  "icon": "foodie-chelchomps-v114"
},
  {
    "handle": "monicaplatt",
    "name": "@monicaplatt",
    "label": "monicaplatt",
    "icon": "foodie-monicaplatt-v97"
  },
  {
    "handle": "imsarahchaz",
    "name": "@imsarahchaz",
    "label": "imsarahchaz",
    "icon": "foodie-imsarahchaz-v97"
  },
  {
    "handle": "irenedony",
    "name": "@irenedony",
    "label": "irenedony",
    "icon": "foodie-irenedony-v97"
  },
  {
  "handle": "biteswithnatalia",
  "name": "@biteswithnatalia",
  "label": "biteswithnatalia",
  "icon": "foodie-biteswithnatalia-v112"
},
  {
    "handle": "laurenlovessfood",
    "name": "@laurenlovessfood",
    "label": "laurenlovessfood",
    "icon": "foodie-laurenlovessfood-v97"
  },
  {
    "handle": "lisaaaaletseat",
    "name": "@lisaaaaletseat",
    "label": "lisaaaaletseat",
    "icon": "foodie-lisaaaaletseat-v105"
  },
  {
    "handle": "mattiasblanco",
    "name": "@mattiasblanco",
    "label": "mattiasblanco",
    "icon": "foodie-mattiasblanco-v97"
  },
  {
    "handle": "deazylee",
    "name": "@deazylee",
    "label": "deazylee",
    "icon": "foodie-deazylee-v98"
  },
  {
  "handle": "edmunchthefoodie",
  "name": "@edmunchthefoodie",
  "label": "edmunchthefoodie",
  "icon": "foodie-edmunchthefoodie-v112"
},
  {
    "handle": "lynniethefoodie",
    "name": "@lynniethefoodie",
    "label": "lynniethefoodie",
    "icon": "foodie-lynniethefoodie-v98"
  },
  {
    "handle": "kelsy.annn",
    "name": "@kelsy.annn",
    "label": "kelsy.annn",
    "icon": "foodie-kelsy-annn-v98"
  },
  {
    "handle": "food_adventures21",
    "name": "@food_adventures21",
    "label": "food_adventures21",
    "icon": "foodie-food-adventures21-v107"
  },
  {
    "handle": "taratastessf",
    "name": "@taratastessf",
    "label": "taratastessf",
    "icon": "foodie-taratastessf-v100"
  },
  {
    "handle": "zia_hazrati",
    "name": "@zia_hazrati",
    "label": "zia_hazrati",
    "icon": "foodie-zia-hazrati-v100"
  },
  {
    "handle": "bennyeats.bayarea",
    "name": "@bennyeats.bayarea",
    "label": "bennyeats.bayarea",
    "icon": "foodie-bennyeats-bayarea-v100"
  },
  {
    "handle": "jourdyn.lynn",
    "name": "@jourdyn.lynn",
    "label": "jourdyn.lynn",
    "icon": "foodie-jourdyn-lynn-v101"
  },
  {
    "handle": "bayeatss",
    "name": "Kristine",
    "label": "Kristine",
    "icon": "foodie-bayeatss-v101"
  },
  {
    "handle": "charlize_tse",
    "name": "@charlize_tse",
    "label": "charlize_tse",
    "icon": "foodie-charlize-tse-v104"
  },
  {
    "handle": "eatwith_ange",
    "name": "@eatwith_ange",
    "label": "eatwith_ange",
    "icon": "foodie-eatwith-ange-v103"
  },
  {
    "handle": "habibimocha",
    "name": "@habibimocha",
    "label": "habibimocha",
    "icon": "foodie-habibimocha-v103"
  },
  {
    "handle": "maddyeats.sfbay",
    "name": "@maddyeats.sfbay",
    "label": "maddyeats.sfbay",
    "icon": "foodie-maddyeats-sfbay-v103"
  },
  {
    "handle": "mr.bayareafoodie",
    "name": "@mr.bayareafoodie",
    "label": "mr.bayareafoodie",
    "icon": "foodie-mr-bayareafoodie-v103"
  },
  {
    "handle": "soysupli",
    "name": "@soysupli",
    "label": "soysupli",
    "icon": "foodie-soysupli-v104"
  },
  {
    "handle": "thehungrycurator",
    "name": "@thehungrycurator",
    "label": "thehungrycurator",
    "icon": "foodie-thehungrycurator-v103"
  },
  {
    "handle": "withlovelysss",
    "name": "@withlovelysss",
    "label": "withlovelysss",
    "icon": "foodie-withlovelysss-v103"
  },
  {
    "handle": "oliviiacai",
    "name": "@oliviiacai",
    "label": "oliviiacai",
    "icon": "foodie-oliviiacai-v105"
  },
  {
    "handle": "kevinberkeleyfoodreviews",
    "name": "@kevinberkeleyfoodreviews",
    "label": "kevinberkeleyfoodr",
    "icon": "foodie-kevinberkeleyfoodreviews-v105"
  },
  {
    "handle": "martiebautista",
    "name": "Martie Bautista-Johnson",
    "label": "Martie Bautista",
    "icon": "foodie-martiebautista-v105"
  },
  {
    "handle": "badies.af",
    "name": "@badies.af",
    "label": "badies.af",
    "icon": "foodie-badies-af-v106"
  },
  {
    "handle": "sjfoodgram",
    "name": "@sjfoodgram",
    "label": "sjfoodgram",
    "icon": "foodie-sjfoodgram-v106"
  },
  {
    "handle": "tiensmunchies",
    "name": "@tiensmunchies",
    "label": "tiensmunchies",
    "icon": "foodie-tiensmunchies-v106"
  },
  {
    "handle": "alexisbaybe_",
    "name": "@alexisbaybe_",
    "label": "alexisbaybe_",
    "icon": "foodie-alexisbaybe-v106"
  },
  {
    "handle": "dyannaluna",
    "name": "@dyannaluna",
    "label": "dyannaluna",
    "icon": "foodie-dyannaluna-v106"
  },
  {
    "handle": "sapphiesofire",
    "name": "S💎pphire Divine | Whims & Wanderlust 💫✨",
    "label": "sapphiesofire",
    "icon": "foodie-sapphiesofire-v107"
  },
  {
    "handle": "kimmmpossxble",
    "name": "🫧🇹🇭HOLOGRAPHIC SEA SIAN 🇹🇷🫧",
    "label": "kimmmpossxble",
    "icon": "foodie-kimmmpossxble-v107"
  },
  {
    "handle": "staycation.sfbayarea",
    "name": "Jax📍Everything SF | Bay Area  🇵🇭",
    "label": "staycation.sfbayar",
    "icon": "foodie-staycation-sfbayarea-v107"
  },
  {
    "handle": "swooningspoon",
    "name": "Kunal Thadani",
    "label": "swooningspoon",
    "icon": "foodie-swooningspoon-v107"
  },
  {
    "handle": "vvveats",
    "name": "V ◦ sf & nyc ◦ food & lifestyle",
    "label": "vvveats",
    "icon": "foodie-vvveats-v107"
  },
  {
    "handle": "el.kattt",
    "name": "Kat",
    "label": "el.kattt",
    "icon": "foodie-el-kattt-v107"
  },
  {
    "handle": "almightyalondra",
    "name": "@almightyalondra",
    "label": "almightyalondra",
    "icon": "foodie-almightyalondra-v108"
  },
  {
    "handle": "unwntedtv",
    "name": "IZZY",
    "label": "IZZY",
    "icon": "foodie-unwntedtv-v109"
  },
  {
    "handle": "awesomejuliee",
    "name": "@awesomejuliee",
    "label": "awesomejuliee",
    "icon": "foodie-awesomejuliee-v109"
  },
  {
    "handle": "keyanajoooon",
    "name": "@keyanajoooon",
    "label": "keyanajoooon",
    "icon": "foodie-keyanajoooon-v109"
  },
  {
    "handle": "bvddiebri",
    "name": "Bri",
    "label": "Bri",
    "icon": "foodie-bvddiebri-v110"
  },
  // Glenn, November 8–9: Jade, Monica, Eleanor and Rose Newbie; Christy Mac Heavy Hitter.
  {
    "handle": "jadedancelrealtor",
    "name": "Jade Dancel",
    "label": "Jade Dancel",
    "icon": "foodie-jadedancelrealtor-v111"
  },
  {
    "handle": "macmadame",
    "name": "Christy Mac",
    "label": "Christy Mac",
    "icon": "foodie-macmadame-v111"
  },
  {
    "handle": "monica.s.daniels",
    "name": "Monica Daniels",
    "label": "Monica Daniels",
    "icon": "foodie-monica-s-daniels-v111"
  },
  {
    "handle": "echen_eats",
    "name": "eleanor",
    "label": "eleanor",
    "icon": "foodie-echen-eats-v111"
  },
  {
    "handle": "rose_buds",
    "name": "Rose Peterson",
    "label": "Rose Peterson",
    "icon": "foodie-rose-buds-v111"
  },
  // Glenn, November 9, 10:55 a.m.: Foodie / Newbie.
  {"handle": "amandabushman", "name": "amanda", "label": "amanda", "icon": "foodie-amandabushman-v111"},
  // Batch 112 — supplied creator profiles; editorial tags stay in research.
{
  "handle": "limitlessfood",
  "name": "Kristina",
  "label": "Kristina",
  "icon": "foodie-limitlessfood-v112"
},
{
  "handle": "bayarealumpia",
  "name": "Jamie",
  "label": "Jamie",
  "icon": "foodie-bayarealumpia-v112"
},
{
  "handle": "yaymeegoround",
  "name": "Jaimee",
  "label": "Jaimee",
  "icon": "foodie-yaymeegoround-v112"
},
{
  "handle": "foodieclubsf",
  "name": "Carol",
  "label": "Carol",
  "icon": "foodie-foodieclubsf-v112"
},
{
  "handle": "nomwithelaine",
  "name": "Elaine",
  "label": "Elaine",
  "icon": "foodie-nomwithelaine-v112"
},
{
  "handle": "chefemaristevens",
  "name": "Emari Stevens",
  "label": "Emari Stevens",
  "icon": "foodie-chefemaristevens-v112",
  "cuisine": "Chef and food creator"
},
{
  "handle": "forkandscore",
  "name": "Fork & Score",
  "label": "Fork & Score",
  "icon": "foodie-forkandscore-v112"
},
{
  "handle": "edeatstheworld",
  "name": "Ed Eats the World",
  "label": "Ed Eats the World",
  "icon": "foodie-edeatstheworld-v112"
},
{
  "handle": "sophie_eats_world",
  "name": "Sophie",
  "label": "Sophie",
  "icon": "foodie-sophieeatsworld-v114"
},
{
  "handle": "eatswithglory",
  "name": "glory",
  "label": "glory",
  "icon": "foodie-eatswithglory-v112"
},
{
  "handle": "lifestylebyangiee",
  "name": "Angelina Chen",
  "label": "Angelina Chen",
  "icon": "foodie-lifestylebyangiee-v112"
},
{
  "handle": "hungryhugh",
  "name": "Hugh Harper",
  "label": "Hugh Harper",
  "icon": "foodie-hungryhugh-v112"
},
{
  "handle": "realphdfoodie",
  "name": "Angela",
  "label": "Angela",
  "icon": "foodie-realphdfoodie-v112"
},
{
  "handle": "eatswithvinni",
  "name": "Vinni",
  "label": "Vinni",
  "icon": "foodie-eatswithvinni-v112"
},
{
  "handle": "baeareafo0die",
  "name": "Bay Area Foodie",
  "label": "Bay Area Foodie",
  "icon": "foodie-baeareafo0die-v112"
},
{
  "handle": "latin_mami_",
  "name": "Nataly Alferez",
  "label": "Nataly Alferez",
  "icon": "foodie-latinmami-v112"
},
  // Batch 114 — creator profiles with supplied portraits.
{
  "handle": "goeatwithangie",
  "name": "Go Eat With Angie",
  "label": "Angie",
  "icon": "foodie-goeatwithangie-v114"
},
{
  "handle": "naeemahtravels",
  "name": "Naeemah Travels",
  "label": "Naeemah",
  "icon": "foodie-naeemahtravels-v114"
},
{
  "handle": "feedchris_",
  "name": "Feed Chris",
  "label": "Feed Chris",
  "icon": "foodie-feedchris-v114"
},
{
  "handle": "k.traaaaan",
  "name": "K. Tran",
  "label": "K. Tran",
  "icon": "foodie-ktraaaaan-v114"
},
{
  "handle": "goutclout",
  "name": "Gout Clout",
  "label": "Gout Clout",
  "icon": "foodie-goutclout-v114"
},
{
  "handle": "bestinthegamme",
  "name": "Best in the Gamme",
  "label": "Best in Game",
  "icon": "foodie-bestinthegamme-v114"
},
{
  "handle": "bonjocbites",
  "name": "Bonjoc Bites",
  "label": "Bonjoc Bites",
  "icon": "foodie-bonjocbites-v114"
},
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
  // Batch 95: the follow-up that arrived during the Batch 94 deploy.
  { by: 'foodieberrie', place: 'Uncle Cha Fusion Cafe', city: 'Milpitas', brand: 'b_unclechafusioncafe', reel: reel('DfThLPzx4Yd'), credit: 'Filmed by @foodieberrie at Uncle Cha Fusion Cafe in Milpitas.', clip: true },
  // Batch 96: keep Bibim Grill's four inline films and publish this excerpt on Denise's page and Watch.
  { by: 'thismajourney', place: 'Bibim Grill', city: 'Dublin', brand: 'b_bibimgrill', reel: reel('DfTJrTyNHVN'), credit: 'Filmed by @thismajourney at Bibim Grill in Dublin. The original mentions a limited soft-opening promotion; confirm any offers with the restaurant.', clip: 'creator' },
  // Batch 97.
  {"by": "aliasharrief", "place": "Fikscue Craft Barbecue", "city": "Alameda", "brand": "b_fikscuealameda", "reel": "https://www.instagram.com/reel/De72TEoP0t9/", "credit": "Filmed by @aliasharrief at Fikscue Craft Barbecue in Alameda.", "clip": true},
  {"by": "smackinfood", "place": "Lemon Crab", "city": "Hayward", "brand": "b_lemoncrabhayward", "reel": "https://www.instagram.com/reel/DfVKoBVp_H-/", "credit": "Filmed by @smackinfood at Lemon Crab in Hayward.", "clip": true},
  {"by": "bayareamunchies510", "place": "Lemon Crab", "city": "Richmond", "brand": "b_lemoncrabhayward", "reel": "https://www.instagram.com/reel/DeiXImexmzZ/", "credit": "Filmed by @bayareamunchies510 at Lemon Crab in Richmond.", "clip": true},
  {"by": "chelchomps", "place": "Lemon Crab", "city": "Hayward", "brand": "b_lemoncrabhayward", "reel": "https://www.instagram.com/reel/DcHnHrNvdLB/", "credit": "Filmed by @chelchomps at Lemon Crab in Hayward.", "clip": true},
  {"by": "grubwitmike", "place": "Lemon Crab", "city": "Hayward", "brand": "b_lemoncrabhayward", "reel": "https://www.instagram.com/reel/DUCUNAgkbY8/", "credit": "Filmed by @grubwitmike at Lemon Crab in Hayward.", "clip": true},
  {"by": "livingvivalakillah", "place": "Legend Hotpot & Grill", "city": "Newark", "brand": "b_legendhotpotgrill", "reel": "https://www.instagram.com/reel/DfVMPhPS2dJ/", "credit": "Filmed by @livingvivalakillah at Legend Hotpot & Grill in Newark.", "clip": true},
  {"by": "thesnacksensei", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/DVO690gkkQg/", "credit": "Archival breakfast review by Grand-O. Check current availability.", "clip": true},
  {"by": "livingvivalakillah", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/DfFtZeYpCkT/", "credit": "Filmed by @livingvivalakillah at Smack Burgers in San Leandro.", "clip": true},
  {"by": "melsotel", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/DTytdIxAT8y/", "credit": "Filmed by @melsotel at Smack Burgers in San Leandro.", "clip": "creator"},
  {"by": "bayarea_fooddreamz", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/DL3NyWBhSXc/", "credit": "Filmed by @bayarea_fooddreamz at Smack Burgers in San Leandro.", "clip": true},
  {"by": "shrimpfriedroice", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/Db-tFWOAWJB/", "credit": "Filmed by @shrimpfriedroice at Smack Burgers in San Leandro.", "clip": "creator"},
  {"by": "monicaplatt", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/DZETMc1IaVt/", "credit": "Filmed by @monicaplatt at Smack Burgers in San Leandro.", "clip": "creator"},
  {"by": "carlosbradley", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/DXfGeg9gW1a/", "credit": "Filmed by @carlosbradley at Smack Burgers in San Leandro.", "clip": "creator"},
  {"by": "sfchronicle_food", "place": "Smack Burgers", "city": "San Leandro", "brand": "b_smackburgerssanleandro", "reel": "https://www.instagram.com/reel/DVRcl0KiRZs/", "credit": "Breakfast burrito coverage by Cesar Hernandez for @sfchronicle_food. Check current breakfast availability.", "clip": true},
  {"by": "imsarahchaz", "place": "Q Specialty Coffee — Howard Street", "city": "San Francisco", "brand": "b_qspecialtycoffeesanfrancisco", "reel": "https://www.instagram.com/reel/DfTn17sJdkM/", "credit": "Filmed by @imsarahchaz at 405 Howard St. Hosted soft-opening visit, disclosed by the creator.", "clip": true},
  {"by": "thesnobbiefoodie", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/Dc_i4jqplwb/", "credit": "Filmed by @thesnobbiefoodie at Arirang Tofu & BBQ in Pleasanton.", "clip": "creator"},
  {"by": "irenedony", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/DctQVBpNLZ-/", "credit": "Filmed by @irenedony at Arirang Tofu & BBQ in Pleasanton.", "clip": "creator"},
  {"by": "_whatarethechances_", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/DciD-vdIUAW/", "credit": "Filmed by @_whatarethechances_ at Arirang Tofu & BBQ in Pleasanton.", "clip": true},
  {"by": "biteswithnatalia", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/DcMKdy2s6KW/", "credit": "Filmed by @biteswithnatalia at Arirang Tofu & BBQ in Pleasanton.", "clip": "creator"},
  {"by": "hungere.for.diy", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/DcLxPQlB7I2/", "credit": "Filmed by @hungere.for.diy at Arirang Tofu & BBQ in Pleasanton.", "clip": true},
  {"by": "eatswithfoodie", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/DcJ2__kyfw6/", "credit": "Filmed by @eatswithfoodie at Arirang Tofu & BBQ in Pleasanton.", "clip": true},
  {"by": "wafflebam", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/Db14djWAUlp/", "credit": "Filmed by @wafflebam at Arirang Tofu & BBQ in Pleasanton.", "clip": "creator"},
  {"by": "laurenlovessfood", "place": "Arirang Tofu & BBQ", "city": "Pleasanton", "brand": "b_arirangtofubbq", "reel": "https://www.instagram.com/reel/DfSjsEXvqPs/", "credit": "Filmed by @laurenlovessfood at Arirang Tofu & BBQ in Pleasanton.", "clip": true},
  {"by": "phodailysj", "place": "Pho Daily", "city": "San Jose", "brand": "b_phodaily", "reel": "https://www.instagram.com/reel/DfVbROChLBB/", "credit": "Filmed by @aztec.ed and posted by @phodailysj.", "clip": true},
  {"by": "lisaaaaletseat", "place": "Chez Maeju", "city": "Oakland", "brand": "b_chezmaeju", "reel": "https://www.instagram.com/reel/DfRHf08tRQA/", "credit": "Filmed by @lisaaaaletseat at Chez Maeju in Oakland.", "clip": "creator"},
  {"by": "lisaaaaletseat", "place": "Q Specialty Coffee — Howard Street", "city": "San Francisco", "brand": "b_qspecialtycoffeesanfrancisco", "reel": "https://www.instagram.com/reel/DfS3yDvyZ5g/", "credit": "Filmed by @lisaaaaletseat at 405 Howard St during the November 2026 soft opening.", "clip": true},
  {"by": "lisaaaaletseat", "place": "Broderick Roadhouse", "city": "Walnut Creek", "brand": "b_broderickwalnutcreek", "reel": "https://www.instagram.com/reel/DfBBrlzPCB_/", "credit": "Filmed by @lisaaaaletseat at Broderick Roadhouse in Walnut Creek.", "clip": true},
  {"by": "mattiasblanco", "place": "Dolores Deluxe", "city": "San Francisco", "brand": "b_doloresdeluxe", "reel": "https://www.instagram.com/reel/DfVeLs0Bst2/", "credit": "Filmed by @mattiasblanco. The featured sandwich was a special. See the shop’s current menu.", "clip": true},
  {"by": "sfstandard", "place": "Dolores Deluxe", "city": "San Francisco", "brand": "b_doloresdeluxe", "reel": "https://www.instagram.com/reel/DPtgAR7D9YZ/", "credit": "The San Francisco Standard’s 2025 profile of Dolores Deluxe and founder Ramzi Budayr, posted by @sfstandard.", "clip": true},
  // Batch 98. Glenn’s ratings and icon requests are recorded in the batch roster.
  {"by": "hungrydanz", "place": "U Dessert Story", "city": "San Francisco", "brand": "b_udessertstory", "reel": "https://www.instagram.com/reel/DfVmG5ixQCf/", "clip": true, "credit": "Filmed by @hungrydanz at U Dessert Story in San Francisco."},
  {"by": "maya_munches", "place": "Easy Breezy", "city": "San Francisco", "brand": "b_easybreezy", "reel": "https://www.instagram.com/reel/DfVqeDTsnUX/", "clip": true, "credit": "Filmed by @maya_munches. Easy Breezy is the final stop in the original multi-stop review. Excerpt from the end, as requested by Glenn."},
  {"by": "carlosbradley", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/DfSs3-RyNHj/", "clip": true, "credit": "Filmed by @carlosbradley at Q-Pot Korean BBQ & Hot Pot in San Jose. Prices in the original review may be dated. See Q-Pot’s current menu."},
  {"by": "deazylee", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/DesXChGvkWe/", "clip": true, "credit": "Filmed by @deazylee at Q-Pot Korean BBQ & Hot Pot in San Jose. Prices in the original review may be dated. See Q-Pot’s current menu."},
  {"by": "jc.eeats", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/DeAGmDROIVb/", "clip": true, "credit": "Filmed by @jc.eeats at Q-Pot Korean BBQ & Hot Pot in San Jose. Prices in the original review may be dated. See Q-Pot’s current menu."},
  {"by": "edmunchthefoodie", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/Dd-RwgACGoE/", "clip": "creator", "credit": "Filmed by @edmunchthefoodie at Q-Pot Korean BBQ & Hot Pot in San Jose. Prices in the original review may be dated. See Q-Pot’s current menu."},
  {"by": "orangeginger", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/Dctq7K_t7yi/", "clip": "creator", "credit": "Filmed by @orangeginger at Q-Pot Korean BBQ & Hot Pot in San Jose. Prices in the original review may be dated. See Q-Pot’s current menu."},
  {"by": "hungrydanz", "place": "Mile Limit", "city": "Berkeley", "brand": "b_milelimitberkeley", "reel": "https://www.instagram.com/p/DfFp0KcAv0E/", "clip": true, "credit": "Review by @hungrydanz, posted by @milelimit. Glenn identified Dan as the reviewer."},
  {"by": "jovana.camberos", "place": "Mumu Hot Pot", "city": "Bay Area", "brand": "b_mumuhotpotsunnyvale", "reel": "https://www.instagram.com/reel/DfWFWKHtAcu/", "clip": true, "credit": "Filmed by @jovana.camberos. The original names several Mumu Hot Pot locations; this opens BEASTY’s Sunnyvale listing."},
  {"by": "kimoni.eatss", "place": "Pizzeria Cardamomo", "city": "Redwood City", "brand": "b_pizzeriacardamomo", "reel": "https://www.instagram.com/reel/DfSyBodSf-v/", "clip": true, "credit": "Filmed by @kimoni.eatss at Pizzeria Cardamomo in Redwood City."},
  {"by": "foodwookie", "place": "Pizzeria Cardamomo", "city": "Redwood City", "brand": "b_pizzeriacardamomo", "reel": "https://www.instagram.com/reel/DfEMN85RiCx/", "clip": true, "credit": "Filmed by @foodwookie at Pizzeria Cardamomo in Redwood City."},
  {"by": "drooling.bae", "place": "Pizzeria Cardamomo", "city": "Redwood City", "brand": "b_pizzeriacardamomo", "reel": "https://www.instagram.com/reel/De3NCDFORm5/", "clip": true, "credit": "Filmed by @drooling.bae at Pizzeria Cardamomo in Redwood City."},
  {"by": "monaeatsnearby", "place": "Pizzeria Cardamomo", "city": "Redwood City", "brand": "b_pizzeriacardamomo", "reel": "https://www.instagram.com/reel/Desx4zGycIU/", "clip": "creator", "credit": "Filmed by @monaeatsnearby at Pizzeria Cardamomo in Redwood City."},
  {"by": "lynniethefoodie", "place": "Pizzeria Cardamomo", "city": "Redwood City", "brand": "b_pizzeriacardamomo", "reel": "https://www.instagram.com/reel/Dc7CF8iy_0a/", "clip": "creator", "credit": "Filmed by @lynniethefoodie at Pizzeria Cardamomo in Redwood City."},
  {"by": "karaxhuynh", "place": "Sushi Umami", "city": "Milpitas", "brand": "b_sushiumamimilpitas", "reel": "https://www.instagram.com/reel/DfWEtUwBFk0/", "clip": true, "credit": "Filmed by @karaxhuynh at Sushi Umami in Milpitas. Posted by @karaxhuynh."},
  {"by": "_foodieshots_", "place": "Sushi Umami", "city": "Milpitas", "brand": "b_sushiumamimilpitas", "reel": "https://www.instagram.com/reel/DbwtXO6xrAq/", "clip": true, "credit": "Filmed by @_foodieshots_ at Sushi Umami in Milpitas."},
  {"by": "bayareafoodiecrew", "place": "Sushi Umami", "city": "Milpitas", "brand": "b_sushiumamimilpitas", "reel": "https://www.instagram.com/reel/DaofEQWyxUI/", "clip": true, "credit": "Filmed by @bayareafoodiecrew at Sushi Umami in Milpitas."},
  {"by": "janniners", "place": "Sushi Umami", "city": "Milpitas", "brand": "b_sushiumamimilpitas", "reel": "https://www.instagram.com/reel/DZ6UsplR1V6/", "clip": true, "credit": "Filmed by @janniners at Sushi Umami in Milpitas."},
  {"by": "kelsy.annn", "place": "Ushiya Grill", "city": "Milpitas", "brand": "b_ushiyagrill", "reel": "https://www.instagram.com/reel/DfV75JatiuT/", "clip": true, "credit": "Filmed by @kelsy.annn at Ushiya Grill in Milpitas. Confirm current AYCE courses and prices with the restaurant."},
  {"by": "food_adventures21", "place": "Ushiya Grill", "city": "Milpitas", "brand": "b_ushiyagrill", "reel": "https://www.instagram.com/reel/DeeqpsRJiTH/", "clip": true, "credit": "Filmed by @food_adventures21 at Ushiya Grill in Milpitas. Confirm current AYCE courses and prices with the restaurant."},
  {"by": "foodie_travel_happiness", "place": "Ushiya Grill", "city": "Milpitas", "brand": "b_ushiyagrill", "reel": "https://www.instagram.com/reel/Dclhds1O7CC/", "clip": true, "credit": "Filmed by @foodie_travel_happiness at Ushiya Grill in Milpitas. Confirm current AYCE courses and prices with the restaurant."},
  {"by": "_foodieshots_", "place": "Ushiya Grill", "city": "Milpitas", "brand": "b_ushiyagrill", "reel": "https://www.instagram.com/reel/DcRZaziR2SP/", "clip": true, "credit": "Filmed by @_foodieshots_ at Ushiya Grill in Milpitas. Confirm current AYCE courses and prices with the restaurant."},
  {"by": "dodo__eats", "place": "Ushiya Grill", "city": "Milpitas", "brand": "b_ushiyagrill", "reel": "https://www.instagram.com/reel/DcPvluTNCFx/", "clip": "creator", "credit": "Filmed by @dodo__eats at Ushiya Grill in Milpitas. Confirm current AYCE courses and prices with the restaurant."},
  // Batch 99.
  {"by": "queen.food.e", "place": "The Hangout", "city": "Walnut Creek", "brand": "b_thehangoutbreakfast", "reel": "https://www.instagram.com/reel/Dc3-EnZh8Gm/", "clip": true, "credit": "Filmed by @queen.food.e at The Hangout in Walnut Creek."},
  {"by": "queen.food.e", "place": "Sugar Plum Coffee Shop", "city": "Concord", "brand": "b_sugarplumcoffeeshop", "reel": "https://www.instagram.com/reel/DcTuRDNMJ78/", "clip": true, "credit": "Filmed by @queen.food.e at Sugar Plum Coffee Shop in Concord."},
  {"by": "queen.food.e", "place": "CaliKid Burgers ’n Shakes", "city": "Pleasant Hill", "brand": "b_calikidburgerspleasanthill", "reel": "https://www.instagram.com/reel/DbB3rily7fZ/", "clip": true, "credit": "Filmed by @queen.food.e at CaliKid Burgers ’n Shakes in Pleasant Hill."},
  {"by": "queen.food.e", "place": "Bay Area Crumbs", "city": "Pittsburg", "brand": "b_bayareacrumbs", "reel": "https://www.instagram.com/reel/DaRK8hTPUld/", "clip": true, "credit": "Filmed by @queen.food.e at Bay Area Crumbs in Pittsburg."},
  {"by": "mzz.juxtaposition", "place": "Dolores Deluxe", "city": "San Francisco", "brand": "b_doloresdeluxe", "reel": "https://www.instagram.com/reel/DfWyuCSt2bS/", "clip": true, "credit": "Filmed by @mzz.juxtaposition at Dolores Deluxe in San Francisco."},
  {"by": "mzz.juxtaposition", "place": "Russ Fam Kitchen", "city": "Daly City", "brand": "b_russfamkitchen", "reel": "https://www.instagram.com/reel/DfTAGm3vA1q/", "clip": true, "credit": "Ilocos empanada review by @mzz.juxtaposition at Russ Fam Kitchen."},
  // Batch 100.
  {"by": "_foodieshots_", "place": "V Pho", "city": "Campbell", "brand": "b_vpho", "reel": "https://www.instagram.com/reel/DfSmtNEhdNn/", "clip": true, "credit": "Filmed by @_foodieshots_ at V Pho in Campbell."},
  {"by": "_foodieshots_", "place": "Master Oh", "city": "Santa Clara", "brand": "b_masteroh", "reel": "https://www.instagram.com/reel/De-CdUISqLp/", "clip": true, "credit": "Filmed by @_foodieshots_ at Master Oh in Santa Clara."},
  {"by": "_foodieshots_", "place": "Chahalo Berkeley", "city": "Berkeley", "brand": "b_chahaloberkeley", "reel": "https://www.instagram.com/reel/Dexq2IcxgNp/", "clip": true, "credit": "Filmed by @_foodieshots_ at Chahalo Berkeley in Berkeley."},
  {"by": "_foodieshots_", "place": "Pho Ha Noi", "city": "San Jose", "brand": "b_phohanoisanjose", "reel": "https://www.instagram.com/reel/DekOiRNPKMs/", "clip": true, "credit": "Filmed by @_foodieshots_ at Pho Ha Noi in San Jose. Check current prices and promotions directly."},
  {"by": "thesnacksensei", "place": "Maillards", "city": "San Francisco", "brand": "b_maillards", "reel": "https://www.instagram.com/reel/DfYlac-IYZU/", "clip": true, "credit": "Filmed by @thesnacksensei at Maillards in San Francisco."},
  {"by": "taratastessf", "place": "Maillards", "city": "San Francisco", "brand": "b_maillards", "reel": "https://www.instagram.com/reel/DXr08B8iUub/", "clip": true, "credit": "Filmed by @taratastessf at Maillards in San Francisco."},
  {"by": "alwayshannegry", "place": "Maillards", "city": "San Francisco", "brand": "b_maillards", "reel": "https://www.instagram.com/reel/DXgUEmJiHp1/", "clip": true, "credit": "Filmed by @alwayshannegry at Maillards in San Francisco."},
  {"by": "grubwitmike", "place": "Maillards", "city": "San Francisco", "brand": "b_maillards", "reel": "https://www.instagram.com/reel/DUmV_9IDzJb/", "clip": true, "credit": "Filmed by @grubwitmike at Maillards in San Francisco."},
  {"by": "rainmoreturely", "place": "Little Sheep", "city": "Newark", "brand": "b_littlesheepnewark", "reel": "https://www.instagram.com/reel/DeYS4LtPOgA/", "clip": true, "credit": "Filmed by @rainmoreturely at Little Sheep in Newark."},
  {"by": "rainmoreturely", "place": "Champ Onigiri", "city": "San Jose", "brand": "b_champonigiri", "reel": "https://www.instagram.com/reel/DUxLrT1D7_-/", "clip": true, "credit": "Filmed by @rainmoreturely at Champ Onigiri in San Jose. Sponsored visit disclosed by the creator."},
  {"by": "zia_hazrati", "place": "Halal Street Hot Pot", "city": "Newark", "brand": "b_halalstreetnewark", "reel": "https://www.instagram.com/reel/DfYOfuHgu_4/", "clip": true, "credit": "Filmed by @zia_hazrati at Halal Street Hot Pot in Newark. Check current prices and promotions directly."},
  {"by": "bennyeats.bayarea", "place": "Little Sheep", "city": "Newark", "brand": "b_littlesheepnewark", "reel": "https://www.instagram.com/reel/Dc2NSyjOQlH/", "clip": true, "credit": "Filmed by @bennyeats.bayarea at Little Sheep in Newark. Check current prices and promotions directly."},
  {"by": "eatwithbooboo", "place": "Hungry Cow", "city": "Fremont", "brand": "b_hungrycow", "reel": "https://www.instagram.com/reel/DfY4w-IA5ej/", "clip": true, "credit": "Filmed by @eatwithbooboo at Hungry Cow in Fremont."},
  // Batch 101.
  {"by": "justmostie", "place": "JK Cafe & Boba Donuts", "city": "Pittsburg", "brand": "b_jkcafebobadonuts", "reel": "https://www.instagram.com/reel/DfYchDyTPNV/", "clip": true, "credit": "Filmed by @justmostie at JK Cafe & Boba Donuts in Pittsburg."},
  {"by": "bayarea_fooddreamz", "place": "Innena’s Kitchen", "city": "Oakland", "brand": "b_innenaskitchen", "reel": "https://www.instagram.com/reel/DfYKf3FBJyO/", "clip": true, "credit": "Filmed by @bayarea_fooddreamz at Innena’s Kitchen in Oakland."},
  {"by": "bayareamunchies510", "place": "Innena’s Kitchen", "city": "Oakland", "brand": "b_innenaskitchen", "reel": "https://www.instagram.com/reel/DenQqB6vpKk/", "clip": true, "credit": "Filmed by @bayareamunchies510 at Innena’s Kitchen in Oakland."},
  {"by": "jourdyn.lynn", "place": "World Wrapps", "city": "Corte Madera", "brand": "b_worldwrappscortemadera", "reel": "https://www.instagram.com/reel/DfXjdE4tu24/", "clip": true, "credit": "Filmed by @jourdyn.lynn at World Wrapps in Corte Madera."},
  {"by": "bayeatss", "place": "World Wrapps", "city": "Bay Area", "brand": "b_worldwrappscortemadera", "reel": "https://www.instagram.com/reel/DfVnXm7vXlq/", "clip": true, "credit": "World Wrapps rice-paper wrap review by @bayeatss. The caption does not identify the branch."},
  // Batches 103–104. Additional films beyond four remain on the creator and Watch.
  {"by": "withlovelysss", "place": "Aburaya", "city": "Oakland", "brand": "b_aburayaoakland", "reel": "https://www.instagram.com/reel/DfaSfDzNzqq/", "clip": true, "credit": "Filmed by @withlovelysss at Aburaya in Oakland."},
  {"by": "thesnacksensei", "place": "Crabby Crabby Newark", "city": "Newark", "brand": "b_crabbycrabbynewark", "reel": "https://www.instagram.com/reel/Dfaqmzevn3f/", "clip": true, "credit": "Filmed by @thesnacksensei at Crabby Crabby Newark in Newark."},
  {"by": "sebascastroficial", "place": "Crabby Crabby Newark", "city": "Newark", "brand": "b_crabbycrabbynewark", "reel": "https://www.instagram.com/reel/Deuaz1UokI_/", "clip": true, "credit": "Filmed by @sebascastroficial at Crabby Crabby Newark in Newark."},
  {"by": "mr.bayareafoodie", "place": "Via Mia Pizza", "city": "Morgan Hill", "brand": "b_viamiapizza", "reel": "https://www.instagram.com/reel/DVagsFijsYT/", "clip": true, "credit": "Filmed by @mr.bayareafoodie at Via Mia Pizza in Morgan Hill."},
  {"by": "rollingwithdeneats", "place": "Via Mia Pizza", "city": "Morgan Hill", "brand": "b_viamiapizza", "reel": "https://www.instagram.com/reel/DU4aKCVCdHZ/", "clip": true, "credit": "Filmed by @rollingwithdeneats at Via Mia Pizza in Morgan Hill."},
  {"by": "grubwitmike", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/Dbegh6YvISu/", "clip": true, "credit": "Filmed by @grubwitmike at Cajun Crack N in Concord."},
  {"by": "blurgotti", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/DYSjeZFvJq5/", "clip": "creator", "credit": "Filmed by @blurgotti at Cajun Crack N in Concord."},
  {"by": "eatwithsie", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/DbrAChCBmlg/", "clip": "creator", "credit": "Filmed by @eatwithsie at Cajun Crack N in Concord."},
  {"by": "jantrinanicole", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/Da6Go3-yTOF/", "clip": "creator", "credit": "Filmed by @jantrinanicole at Cajun Crack N in Concord."},
  {"by": "ronniebanks", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/DZdf8vkS4mu/", "clip": true, "credit": "Filmed by @ronniebanks at Cajun Crack N in Concord."},
  {"by": "zeyno.ern", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/DXXRD0CP_Ve/", "clip": "creator", "credit": "Filmed by @zeyno.ern at Cajun Crack N in Concord."},
  {"by": "habibimocha", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/DVwi4SVEp4f/", "clip": "creator", "credit": "Filmed by @habibimocha at Cajun Crack N in Concord."},
  {"by": "thesnacksensei", "place": "Cajun Crack N", "city": "Concord", "brand": "b_cajuncrackn", "reel": "https://www.instagram.com/reel/DRnnwfkksWa/", "clip": true, "credit": "Filmed by @thesnacksensei at Cajun Crack N in Concord."},
  {"by": "mr.gaoviet", "place": "Gao Viet Kitchen", "city": "San Francisco", "brand": "b_gaovietkitchen", "reel": "https://www.instagram.com/reel/DQKo2NEEipZ/", "clip": "creator", "credit": "Posted by @mr.gaoviet at Gao Viet Kitchen, featuring @msashleyvee and @nikkysnoww. The posting account retains the source credit.", "featuring": ["msashleyvee"]},
  {"by": "mr.gaoviet", "place": "Gao Viet Kitchen", "city": "San Francisco", "brand": "b_gaovietkitchen", "reel": "https://www.instagram.com/reel/DPrJc_ukbxS/", "clip": "creator", "credit": "Posted by @mr.gaoviet at Gao Viet Kitchen, featuring @msashleyvee and @nikkysnoww. The posting account retains the source credit.", "featuring": ["msashleyvee"]},
  {"by": "ashleyveats", "place": "Serious Dumpling", "city": "San Jose", "brand": "b_seriousdumpling", "reel": "https://www.instagram.com/reel/DP6uV55D13g/", "clip": true, "credit": "Filmed by @ashleyveats at Serious Dumpling in San Jose."},
  {"by": "sfbayfood", "place": "Serious Dumpling", "city": "San Jose", "brand": "b_seriousdumpling", "reel": "https://www.instagram.com/reel/DegSz5xCDIV/", "clip": true, "credit": "Filmed by @sfbayfood at Serious Dumpling in San Jose."},
  {"by": "foodandsachi", "place": "Serious Dumpling", "city": "San Jose", "brand": "b_seriousdumpling", "reel": "https://www.instagram.com/reel/DeaVCJ8PUYz/", "clip": true, "credit": "Filmed by @foodandsachi at Serious Dumpling in San Jose."},
  {"by": "orangeginger", "place": "Serious Dumpling", "city": "San Jose", "brand": "b_seriousdumpling", "reel": "https://www.instagram.com/reel/Ddu0yvsNAIJ/", "clip": "creator", "credit": "Filmed by @orangeginger at Serious Dumpling in San Jose."},
  {"by": "feed_happiness_", "place": "Serious Dumpling", "city": "San Jose", "brand": "b_seriousdumpling", "reel": "https://www.instagram.com/reel/DcQLXq-y-RN/", "clip": true, "credit": "Filmed by @feed_happiness_ at Serious Dumpling in San Jose."},
  {"by": "ashleyveats", "place": "Serious Dumpling", "city": "San Jose", "brand": "b_seriousdumpling", "reel": "https://www.instagram.com/reel/DKue7toxsdq/", "clip": "creator", "credit": "Filmed by @ashleyveats at Serious Dumpling in San Jose."},
  {"by": "ashleyveats", "place": "ABSteak San Francisco", "city": "San Francisco", "brand": "b_absteaksanfrancisco", "reel": "https://www.instagram.com/reel/DLqiBYFyNcL/", "clip": true, "credit": "Filmed by @ashleyveats at ABSteak San Francisco in San Francisco."},
  {"by": "andreweatsinsf", "place": "ABSteak San Francisco", "city": "San Francisco", "brand": "b_absteaksanfrancisco", "reel": "https://www.instagram.com/reel/DR0-AbnEYhd/", "clip": true, "credit": "Filmed by @andreweatsinsf at ABSteak San Francisco in San Francisco."},
  {"by": "yourglobalfoodiebff", "place": "ABSteak San Francisco", "city": "San Francisco", "brand": "b_absteaksanfrancisco", "reel": "https://www.instagram.com/reel/DRLb_CLjzyb/", "clip": true, "credit": "Filmed by @yourglobalfoodiebff at ABSteak San Francisco in San Francisco."},
  {"by": "andreweatsinsf", "place": "ABSteak San Francisco", "city": "San Francisco", "brand": "b_absteaksanfrancisco", "reel": "https://www.instagram.com/reel/DA9Z8xhKLKG/", "clip": true, "credit": "Filmed by @andreweatsinsf at ABSteak San Francisco in San Francisco."},
  {"by": "agnespittioni", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DLqUKTvhWwF/", "clip": true, "credit": "Filmed by @agnespittioni at Flats Burgers in San Francisco."},
  {"by": "yourglobalfoodiebff", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DIuj2KzObRo/", "clip": true, "credit": "Filmed by @yourglobalfoodiebff at Flats Burgers in San Francisco."},
  {"by": "taratastessf", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DH1YmF7yVXY/", "clip": "creator", "credit": "Filmed by @taratastessf at Flats Burgers in San Francisco."},
  {"by": "charlikestoeat", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DHpZ4bvOQeV/", "clip": "creator", "credit": "Filmed by @charlikestoeat at Flats Burgers in San Francisco."},
  {"by": "imadoniseats", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DHOr11dyPWA/", "clip": true, "credit": "Filmed by @imadoniseats at Flats Burgers in San Francisco."},
  {"by": "tastewith.rach", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DGj9Mc1x7Wl/", "clip": "creator", "credit": "Filmed by @tastewith.rach at Flats Burgers in San Francisco."},
  {"by": "celineeats", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DGcAU9aPXVR/", "clip": "creator", "credit": "Filmed by @celineeats at Flats Burgers in San Francisco."},
  {"by": "thehungrycurator", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DGOz7fvSViA/", "clip": "creator", "credit": "Filmed by @thehungrycurator at Flats Burgers in San Francisco."},
  {"by": "eatwith_ange", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DGBpC1JyYmG/", "clip": "creator", "credit": "Filmed by @eatwith_ange at Flats Burgers in San Francisco."},
  {"by": "_wheresthefoodat", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DEQ-sOwveS2/", "clip": true, "credit": "Filmed by @_wheresthefoodat at Flats Burgers in San Francisco."},
  {"by": "_whatarethechances_", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DD7UYOvPjfL/", "clip": "creator", "credit": "Filmed by @_whatarethechances_ at Flats Burgers in San Francisco."},
  {"by": "maddyeats.sfbay", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DfTf65DB3E-/", "clip": "creator", "credit": "Filmed by @maddyeats.sfbay at Flats Burgers in San Francisco."},
  {"by": "orangeginger", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/DfajuVqPPwz/", "clip": "creator", "credit": "Filmed by @orangeginger at Wooga Korean BBQ in Cupertino."},
  {"by": "goyuliiago", "place": "Oink & Oscar", "city": "San Francisco", "brand": "b_oinkoscar", "reel": "https://www.instagram.com/reel/Dc4s0cuQVen/", "clip": true, "credit": "Filmed by @goyuliiago at Oink & Oscar in San Francisco."},
  {"by": "soysupli", "place": "Oink & Oscar", "city": "San Francisco", "brand": "b_oinkoscar", "reel": "https://www.instagram.com/reel/DdCQPY-siua/", "clip": true, "credit": "Filmed by @soysupli at Oink & Oscar in San Francisco."},
  {"by": "charlize_tse", "place": "Kan Kiin", "city": "Daly City", "brand": "b_kankiin", "reel": "https://www.instagram.com/reel/Dfar3N3vTHy/", "clip": true, "credit": "Filmed by @charlize_tse; posted by @kan_kiin as a restaurant collaboration."},
  {"by": "chaudownfood", "place": "Kan Kiin", "city": "Daly City", "brand": "b_kankiin", "reel": "https://www.instagram.com/reel/DfBMdwmJuwa/", "clip": true, "credit": "Filmed by @chaudownfood at Kan Kiin in Daly City."},
  {"by": "phoebe8food", "place": "Kan Kiin", "city": "Daly City", "brand": "b_kankiin", "reel": "https://www.instagram.com/reel/DeNoQSSNzu8/", "clip": true, "credit": "Filmed by @phoebe8food at Kan Kiin in Daly City."},
  {"by": "festusfeasts", "place": "Sweet Maple", "city": "Bay Area", "brand": "b_sweetmaplesanfrancisco", "reel": "https://www.instagram.com/reel/DO18vuKEpwq/", "clip": true, "credit": "Sweet Maple review by @festusfeasts with Monique Billings. The caption does not identify the branch; linked to the chain’s San Francisco page."},
  {"by": "thesnobbiefoodie", "place": "Sweet Maple", "city": "Walnut Creek", "brand": "b_sweetmaplewalnutcreek", "reel": "https://www.instagram.com/reel/DHjDsXfpm3C/", "clip": true, "credit": "Filmed by @thesnobbiefoodie at Sweet Maple in Walnut Creek."},

  // Batch 105.
  {"by": "summer.ishungry", "place": "Paku", "city": "San Francisco", "brand": "b_pakusf", "reel": "https://www.instagram.com/reel/DfWHrVUSpFn/", "clip": true, "credit": "Posted by @summer.ishungry at Paku, San Francisco."},
  {"by": "oliviiacai", "place": "Nono’s Doughnuts & Cafe", "city": "Berkeley", "brand": "b_nonosdoughnutsberkeley", "reel": "https://www.instagram.com/reel/DfThSHUtrVK/", "clip": true, "credit": "Posted by @oliviiacai at Nono’s Doughnuts & Cafe, Berkeley."},
  {"by": "kevinberkeleyfoodreviews", "place": "Nono’s Doughnuts & Cafe", "city": "Berkeley", "brand": "b_nonosdoughnutsberkeley", "reel": "https://www.instagram.com/reel/DfN0cv3hA1C/", "clip": true, "credit": "Posted by @kevinberkeleyfoodreviews at Nono’s Doughnuts & Cafe, Berkeley."},
  {"by": "thekhaysie", "place": "Nono’s Doughnuts & Cafe", "city": "Berkeley", "brand": "b_nonosdoughnutsberkeley", "reel": "https://www.instagram.com/reel/Dfadd8FP4oT/", "clip": true, "credit": "Posted by @thekhaysie at Nono’s Doughnuts & Cafe, Berkeley."},
  {"by": "booziebrunch", "place": "Lucuma Kitchen & Bar", "city": "Oakland", "brand": "b_lucumakitchenoakland", "reel": "https://www.instagram.com/reel/DfAkb2XvzKn/", "clip": true, "credit": "Posted by @booziebrunch at Lucuma Kitchen & Bar, Oakland."},
  {"by": "rollingwithdeneats", "place": "MT Music BBQ & Bar", "city": "Richmond", "brand": "b_mtmusicrichmond", "reel": "https://www.instagram.com/reel/Dfdai5EPSq4/", "clip": true, "credit": "Posted by @rollingwithdeneats at MT Music BBQ & Bar, Richmond."},
  {"by": "habibimocha", "place": "MT Music BBQ & Bar", "city": "Richmond", "brand": "b_mtmusicrichmond", "reel": "https://www.instagram.com/reel/DfaOWE2OSUf/", "clip": true, "credit": "Posted by @habibimocha at MT Music BBQ & Bar, Richmond."},
  {"by": "thekhaysie", "place": "MT Music BBQ & Bar", "city": "Richmond", "brand": "b_mtmusicrichmond", "reel": "https://www.instagram.com/reel/DfQjK8pCKBQ/", "clip": true, "credit": "Posted by @thekhaysie at MT Music BBQ & Bar, Richmond."},
  {"by": "wthellydanyelly", "place": "MT Music BBQ & Bar", "city": "Richmond", "brand": "b_mtmusicrichmond", "reel": "https://www.instagram.com/reel/DecEKVBt1Kg/", "clip": true, "credit": "Posted by @wthellydanyelly at MT Music BBQ & Bar, Richmond."},
  {"by": "lisaaaaletseat", "place": "NōKA Ramen & Bar", "city": "Oakland", "brand": "b_nokaramen", "reel": "https://www.instagram.com/reel/Dfcqyhzxh_9/", "clip": true, "credit": "Filmed by @lisaaaaletseat at NōKA Ramen & Bar in Oakland."},

  {"by": "martiebautista", "place": "Ace King BBQ", "city": "Newark", "brand": "b_acekingbbq", "reel": "https://www.instagram.com/reel/DfYiyfCxYxs/", "clip": "creator", "credit": "Filmed by @martiebautista at Ace King BBQ in Newark. Plays on the creator page and Watch; the business retains its four existing films."},
  // Batch 106.
  {"by": "eatwithbooboo", "place": "Plaza Cafe", "city": "Pleasant Hill", "brand": "b_plazacafepleasanthill", "reel": "https://www.instagram.com/reel/Dfd9SqQA7Ew/", "clip": true, "credit": "Filmed by @eatwithbooboo at Plaza Cafe, Pleasant Hill. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "victoria.pham17", "place": "Hansang Tofu", "city": "Milpitas", "brand": "b_hansangtofumilpitas", "reel": "https://www.instagram.com/reel/DfQeYDFsj3C/", "clip": true, "credit": "Filmed by @victoria.pham17 at Hansang Tofu, Milpitas. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "hallojessa", "place": "Hansang Tofu", "city": "Milpitas", "brand": "b_hansangtofumilpitas", "reel": "https://www.instagram.com/reel/Dfd2oEICJjj/", "clip": true, "credit": "Filmed by @hallojessa at Hansang Tofu, Milpitas. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "eatswithfoodie", "place": "Hansang Tofu", "city": "Milpitas", "brand": "b_hansangtofumilpitas", "reel": "https://www.instagram.com/reel/DfFGNKqMsKM/", "clip": true, "credit": "Filmed by @eatswithfoodie at Hansang Tofu, Milpitas. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "badies.af", "place": "Hansang Tofu", "city": "Milpitas", "brand": "b_hansangtofumilpitas", "reel": "https://www.instagram.com/reel/DdjXNbjpXSI/", "clip": "creator", "credit": "Filmed by @badies.af at Hansang Tofu, Milpitas. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "drooling.bae", "place": "Hansang Tofu", "city": "Milpitas", "brand": "b_hansangtofumilpitas", "reel": "https://www.instagram.com/reel/DdIG4FdOr4J/", "clip": "creator", "credit": "Filmed by @drooling.bae at Hansang Tofu, Milpitas. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "sjfoodgram", "place": "Hansang Tofu", "city": "Milpitas", "brand": "b_hansangtofumilpitas", "reel": "https://www.instagram.com/reel/DbW5HvnpD40/", "clip": "creator", "credit": "Filmed by @sjfoodgram at Hansang Tofu, Milpitas. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "tiensmunchies", "place": "Hansang Tofu", "city": "Milpitas", "brand": "b_hansangtofumilpitas", "reel": "https://www.instagram.com/reel/DbTwCR9ytgb/", "clip": "creator", "credit": "Filmed by @tiensmunchies at Hansang Tofu, Milpitas. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "alexisbaybe_", "place": "Waterfall Cevicheria", "city": "San Francisco", "brand": "b_waterfallcevicheriasf", "reel": "https://www.instagram.com/reel/DcrPe2GPTLD/", "clip": true, "credit": "Filmed by @alexisbaybe_ at Waterfall Cevicheria, San Francisco. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "bayarea_fooddreamz", "place": "Waterfall Cevicheria", "city": "San Francisco", "brand": "b_waterfallcevicheriasf", "reel": "https://www.instagram.com/reel/DWAFpcvknyy/", "clip": true, "credit": "Filmed by @bayarea_fooddreamz at Waterfall Cevicheria, San Francisco. Additional films play on Foodies and Watch when the four-film business limit is reached."},
  {"by": "dyannaluna", "place": "Waterfall Cevicheria", "city": "San Francisco", "brand": "b_waterfallcevicheriasf", "reel": "https://www.instagram.com/reel/DR4wxEhkVYG/", "clip": true, "credit": "Filmed by @dyannaluna at Waterfall Cevicheria, San Francisco. Additional films play on Foodies and Watch when the four-film business limit is reached."},

  // Batch 107.
  {"by": "wthellydanyelly", "place": "Siam Orchid Traditional Thai Massage", "city": "Walnut Creek", "brand": "b_siamorchidwalnutcreek", "reel": "https://www.instagram.com/reel/DfcwBigtSfW/", "clip": true, "credit": "Filmed by @wthellydanyelly at Siam Orchid Traditional Thai Massage."},
  {"by": "foodieberrie", "place": "Siam Orchid Traditional Thai Massage", "city": "Walnut Creek", "brand": "b_siamorchidwalnutcreek", "reel": "https://www.instagram.com/reel/DfQfEJJRGfP/", "clip": true, "credit": "Filmed by @foodieberrie at Siam Orchid Traditional Thai Massage."},
  {"by": "sapphiesofire", "place": "Siam Orchid Traditional Thai Massage", "city": "Walnut Creek", "brand": "b_siamorchidwalnutcreek", "reel": "https://www.instagram.com/reel/De5QhWbv8_J/", "clip": true, "credit": "Filmed by @sapphiesofire at Siam Orchid Traditional Thai Massage."},
  {"by": "kelmeleats", "place": "Siam Orchid Traditional Thai Massage", "city": "San Francisco", "brand": "b_siamorchidsfpolk", "reel": "https://www.instagram.com/reel/DfTK4BCRRxJ/", "clip": true, "credit": "Filmed by @kelmeleats at Siam Orchid Traditional Thai Massage. The caption identifies San Francisco, without specifying Polk or Taylor."},
  {"by": "sapphiesofire", "place": "Broderick Roadhouse", "city": "Walnut Creek", "brand": "b_broderickwalnutcreek", "reel": "https://www.instagram.com/reel/DfM8lGkhq-7/", "clip": true, "credit": "Filmed by @sapphiesofire at Broderick Roadhouse."},
  {"by": "grubwitmike", "place": "The Meat Wagon", "city": "Bay Area", "brand": "b_themeatwagon", "reel": "https://www.instagram.com/reel/Dec90xTRGYi/", "clip": true, "credit": "Filmed by @grubwitmike at The Meat Wagon."},
  {"by": "kimmmpossxble", "place": "Creole Caviar", "city": "Oakland truck stop", "brand": "b_creolecaviar", "reel": "https://www.instagram.com/reel/DeAt3ADpMbA/", "clip": true, "credit": "Filmed by @kimmmpossxble at Creole Caviar. The caption identifies an Oakland truck stop; check the operator’s current schedule."},
  {"by": "courtneylyneaa", "place": "The Hangout", "city": "Walnut Creek", "brand": "b_thehangoutbreakfast", "reel": "https://www.instagram.com/reel/DfcqwQROrup/", "clip": true, "credit": "Filmed by @courtneylyneaa at The Hangout."},
  {"by": "staycation.sfbayarea", "place": "The Hangout", "city": "Walnut Creek / Pleasant Hill", "brand": "b_thehangoutbreakfast", "reel": "https://www.instagram.com/reel/DXSlC_YEk-5/", "clip": true, "credit": "Filmed by @staycation.sfbayarea at The Hangout. The caption mentions both Hangout branches; filming location is not specified. Linked to the chain’s Walnut Creek page."},
  {"by": "swooningspoon", "place": "The Hangout", "city": "Walnut Creek", "brand": "b_thehangoutbreakfast", "reel": "https://www.instagram.com/reel/DNR8AT0RYCp/", "clip": "creator", "credit": "Filmed by @swooningspoon at The Hangout."},
  {"by": "dchangshangry", "place": "The Hangout", "city": "Walnut Creek / Pleasant Hill", "brand": "b_thehangoutbreakfast", "reel": "https://www.instagram.com/reel/DMuMbrJu5zl/", "clip": "creator", "credit": "Filmed by @dchangshangry at The Hangout. The caption mentions both Hangout branches; filming location is not specified. Linked to the chain’s Walnut Creek page."},
  {"by": "food_adventures21", "place": "The Hangout", "city": "Pleasant Hill", "brand": "b_thehangoutpleasanthill", "reel": "https://www.instagram.com/reel/DblXox7pT_f/", "clip": true, "credit": "Filmed by @food_adventures21 at The Hangout."},
  {"by": "bayarea_fooddreamz", "place": "The Hangout", "city": "Pleasant Hill", "brand": "b_thehangoutpleasanthill", "reel": "https://www.instagram.com/reel/DOwnJO3Ep39/", "clip": true, "credit": "Filmed by @bayarea_fooddreamz at The Hangout."},
  {"by": "hungere.for.diy", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/DffBOm6psGI/", "clip": "creator", "credit": "Filmed by @hungere.for.diy at Wooga Korean BBQ."},
  {"by": "thesnobbiefoodie", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/DfDkZhMJksf/", "clip": "creator", "credit": "Filmed by @thesnobbiefoodie at Wooga Korean BBQ."},
  {"by": "hangrypotato", "place": "Wooga Korean BBQ", "city": "Cupertino", "brand": "b_woogakoreanbbq", "reel": "https://www.instagram.com/reel/De-yovMgl_v/", "clip": "creator", "credit": "Filmed by @hangrypotato at Wooga Korean BBQ."},
  {"by": "baygirlseat", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/DbrvXU2oqKZ/", "clip": "creator", "credit": "Filmed by @baygirlseat at Q-Pot Korean BBQ & Hot Pot."},
  {"by": "foodieberrie", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/Danp0G2xKH-/", "clip": "creator", "credit": "Filmed by @foodieberrie at Q-Pot Korean BBQ & Hot Pot."},
  {"by": "zeyno.ern", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/DZVqd_3yNyq/", "clip": "creator", "credit": "Filmed by @zeyno.ern at Q-Pot Korean BBQ & Hot Pot. Its caption says KPot, but the opening storefront sign clearly identifies Q-Pot."},
  {"by": "vvveats", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/DYqeGaKuUwY/", "clip": "creator", "credit": "Filmed by @vvveats at Q-Pot Korean BBQ & Hot Pot."},
  {"by": "_whatarethechances_", "place": "Q-Pot Korean BBQ & Hot Pot", "city": "San Jose", "brand": "b_qpotsanjose", "reel": "https://www.instagram.com/reel/DcK_1GvIcxg/", "clip": "creator", "credit": "Filmed by @_whatarethechances_ at Q-Pot Korean BBQ & Hot Pot."},
  {"by": "cestalmoco", "place": "Korean BBQ", "city": "Bay Area", "reel": "https://www.instagram.com/reel/DYDXEWPyOxY/", "clip": true, "credit": "Filmed by @cestalmoco at Korean BBQ. The caption does not identify the restaurant, so no business-page association is invented."},
  {"by": "lifebyvivien", "place": "Little Sheep", "city": "Newark", "brand": "b_littlesheepnewark", "reel": "https://www.instagram.com/reel/De-CONYSkUA/", "clip": true, "credit": "Filmed by @lifebyvivien at Little Sheep."},

  // Glenn, Nov 8: Foodie / Newbie; four business films retained, additional review on creator and Watch.
  {"by": "el.kattt", "place": "Brunch & Bloom", "city": "Brentwood", "brand": "b_brunchandbloom", "reel": "https://www.instagram.com/reel/Da2-j8eqwor/", "clip": "creator", "credit": "Filmed by @el.kattt at Brunch & Bloom, Brentwood."},
  // Batch 108 — Glenn, November 8 afternoon. Repost accounts retain their posting credit.
  {"by": "almightyalondra", "place": "Scoop N Chill", "city": "Berkeley", "brand": "b_scoopnchill", "reel": "https://www.instagram.com/reel/DfakL3GvOwL/", "clip": true, "credit": "Review by @almightyalondra at Scoop N Chill, Berkeley. Posted by @scoopnchillberkeley."},
  {"by": "lovemissfit", "place": "Scoop N Chill", "city": "Berkeley", "brand": "b_scoopnchill", "reel": "https://www.instagram.com/reel/DdLPY1UOL7T/", "clip": true, "credit": "Review by @lovemissfit at Scoop N Chill, Berkeley."},
  {"by": "bayareafoodz", "place": "Scoop N Chill", "city": "Berkeley", "brand": "b_scoopnchill", "reel": "https://www.instagram.com/reel/DcM5vOUM5Uo/", "clip": true, "credit": "Review by @bayareafoodz at Scoop N Chill, Berkeley. Posted by @scoopnchillberkeley."},

  {"by": "sisicooksandeats", "place": "Scoop N Chill", "city": "Berkeley", "brand": "b_scoopnchill", "reel": "https://www.instagram.com/reel/DbKVDKcyf-l/", "clip": "creator", "credit": "Review by @sisicooksandeats at Scoop N Chill, Berkeley."},
  // Batch 109 — Glenn tags: IZZY Newbie; awesomejuliee Mediocre; keyanajoooon Heavy Hitter.
  {"by": "thesnacksensei", "place": "The Baked Bear", "city": "San Francisco", "brand": "b_thebakedbear", "reel": "https://www.instagram.com/reel/DJapgu5pCj9/", "clip": true, "credit": "Review by @thesnacksensei at The Baked Bear, Chase Center, 680 Terry A Francois Blvd, San Francisco. This is another branch of the Columbus Avenue business shown here."},
  {"by": "unwntedtv", "place": "The Baked Bear", "city": "San Francisco", "brand": "b_thebakedbear", "reel": "https://www.instagram.com/reel/DT_rN8lk6XZ/", "clip": true, "credit": "Review by @unwntedtv at The Baked Bear in San Francisco. The caption does not identify a branch."},
  {"by": "festusfeasts", "place": "Arsicault Bakery", "city": "San Francisco", "brand": "b_arsicaultbakery", "reel": "https://www.instagram.com/reel/DQnL-OOEp7Y/", "clip": true, "credit": "Review by @festusfeasts at Arsicault Bakery, Mission Bay. This is another branch of the Civic Center business shown here."},
  {"by": "awesomejuliee", "place": "Arsicault Bakery", "city": "San Francisco", "brand": "b_arsicaultbakery", "reel": "https://www.instagram.com/reel/DV_hublk6ZA/", "clip": true, "credit": "Review by @awesomejuliee of Arsicault Bakery in San Francisco; branch unspecified in the caption."},
  {"by": "keyanajoooon", "place": "Arsicault Bakery", "city": "San Francisco", "brand": "b_arsicaultbakery", "reel": "https://www.instagram.com/reel/DTOxk2aj3HE/", "clip": true, "credit": "Review by @keyanajoooon of Arsicault Bakery in San Francisco; branch unspecified in the caption."},
  {"by": "charlikestoeat", "place": "Arsicault Bakery", "city": "San Francisco", "brand": "b_arsicaultbakery", "reel": "https://www.instagram.com/reel/DTJ7UZ4Fz_4/", "clip": "creator", "credit": "@charlikestoeat discusses Arsicault croissants while dining at Atelier Crenn. The footage is not filmed at Arsicault, and no Michelin status is claimed for the bakery."},
  {"by": "eatswithkath", "place": "Arsicault Bakery", "city": "San Francisco", "brand": "b_arsicaultbakery", "reel": "https://www.instagram.com/reel/DRi4rO9EXOT/", "clip": "creator", "credit": "Review by @eatswithkath of Arsicault Bakery, Mission Bay. This is another branch of the Civic Center business shown here."},
  {"by": "charlikestoeat", "place": "Arsicault Bakery", "city": "San Francisco", "brand": "b_arsicaultbakery", "reel": "https://www.instagram.com/reel/DN9ZjY0AWdD/", "clip": "creator", "credit": "Cookie comparison by @charlikestoeat featuring Arsicault, b.patisserie and Spruce. The excerpt focuses on Arsicault; the complete original compares all three. No branch is specified."},

  // Batch 110 — Glenn, November 8, 5:13 p.m.: Foodie / Newbie; creator discloses a gifted collaboration.
  {"by": "bvddiebri", "place": "Simplycake Bakery", "city": "San Mateo", "brand": "b_simplycakebakery", "reel": "https://www.instagram.com/reel/Dffgm_FBlGk/", "clip": "creator", "credit": "Simplycake Bakery review by @bvddiebri in San Mateo. Gifted collaboration, as disclosed by the creator."},

  // Batch 111 — Tuck Heavy Hitter; Nikkie Mediocre. Tags are provenance, not public ratings.
  {"by": "jadedancelrealtor", "place": "One House Bakery", "city": "Benicia", "brand": "b_onehousebakery", "reel": "https://www.instagram.com/reel/De-1MuLPAkj/", "clip": true, "credit": "Review by @jadedancelrealtor at One House Bakery, Benicia."},
  {"by": "_whatarethechances_", "place": "Ace King BBQ", "city": "Newark", "brand": "b_acekingbbq", "reel": "https://www.instagram.com/reel/DfgdxkVoRv1/", "clip": "creator", "credit": "Review by @_whatarethechances_ at Ace King BBQ, 6062 Mowry Ave, Newark."},
  {"by": "booziebrunch", "place": "Fowl + Fare", "city": "Alameda", "brand": "b_fowlfare", "reel": "https://www.instagram.com/reel/DSS1u6GEky-/", "clip": true, "credit": "Review by @booziebrunch at Fowl + Fare, Alameda."},
  {"by": "macmadame", "place": "Fowl + Fare", "city": "Alameda", "brand": "b_fowlfare", "reel": "https://www.instagram.com/reel/DM_J2O1BnWX/", "clip": true, "credit": "Review by @macmadame at Fowl + Fare, 2534 Santa Clara Ave, Alameda."},
  {"by": "takeoutwithtuck", "place": "Fowl + Fare", "city": "Alameda", "brand": "b_fowlfare", "reel": "https://www.instagram.com/reel/DMEaPGGvGip/", "clip": true, "credit": "Review by @takeoutwithtuck at Fowl + Fare, Alameda."},
  {"by": "festusfeasts", "place": "Almond and Oak", "city": "Oakland", "brand": "b_almondandoak", "reel": "https://www.instagram.com/reel/DIxvek5x_6v/", "clip": true, "credit": "Lunch review by @festusfeasts at Almond and Oak, Oakland. The creator’s own award is not a BEASTY rating."},
  {"by": "monica.s.daniels", "place": "Penelope’s Coffee & Tea", "city": "Berkeley", "brand": "b_penelopescoffeeberkeley", "reel": "https://www.instagram.com/reel/Dffu4OFBNQT/", "clip": true, "credit": "Review by @monica.s.daniels. The film clearly shows Penelope’s signage; its caption identifies Berkeley."},
  {"by": "dchangshangry", "place": "Penelope’s Coffee & Tea", "city": "Berkeley", "brand": "b_penelopescoffeeberkeley", "reel": "https://www.instagram.com/reel/Ddx0eL-zdif/", "clip": true, "credit": "Review by @dchangshangry at Penelope’s Coffee & Tea, downtown Berkeley."},
  {"by": "echen_eats", "place": "Penelope’s Coffee & Tea", "city": "Berkeley", "brand": "b_penelopescoffeeberkeley", "reel": "https://www.instagram.com/reel/DdfWyljp_mr/", "clip": true, "credit": "Review by @echen_eats at Penelope’s Coffee & Tea, Berkeley. Hosted visit / invitation disclosed by the creator; filmed with help from @heykaytea."},
  {"by": "iamnikkieg", "place": "Penelope’s Coffee & Tea", "city": "Berkeley", "brand": "b_penelopescoffeeberkeley", "reel": "https://www.instagram.com/reel/Db14_F6PJZP/", "clip": true, "credit": "Review by @iamnikkieg at Penelope’s Coffee & Tea, 2255 Shattuck Ave, Berkeley."},
  {"by": "rose_buds", "place": "Penelope’s Coffee & Tea", "city": "Berkeley", "brand": "b_penelopescoffeeberkeley", "reel": "https://www.instagram.com/reel/DaW7vLHJbnZ/", "clip": "creator", "credit": "Review by @rose_buds at Penelope’s Coffee & Tea, Berkeley."},
  {"by": "dchangshangry", "place": "Chronic Tacos", "city": "Danville", "brand": "b_chronictacosdanville", "reel": "https://www.instagram.com/reel/DfgvwLyzAx_/", "clip": true, "credit": "Review by @dchangshangry at Chronic Tacos, Danville. The dated Taco Tuesday promotion is not presented as a current offer."},

  // Batch 111, late-morning continuation.
  {"by": "yourglobalfoodiebff", "place": "Bibim Grill", "city": "Dublin", "brand": "b_bibimgrill", "reel": "https://www.instagram.com/reel/DfWBEPoRC4F/", "clip": "creator", "credit": "Review by @yourglobalfoodiebff at Bibim Grill, 3742 Fallon Rd, Dublin. A creator review requested as Watch; it is not an owner film."},
  {"by": "amandabushman", "place": "Meadowlark Dairy", "city": "Pleasanton", "brand": "b_meadowlarkdairy", "reel": "https://www.instagram.com/reel/Dc1INSaMC1m/", "clip": true, "credit": "Review by @amandabushman at Meadowlark Dairy. The footage names Meadowlark Dairy and shows its Railroad Avenue storefront in Pleasanton."},

  // Batch 112 — branch-specific reviews, recipes, and explicit other-branch credits.
  {"by": "grubwitmike", "place": "Surf-and-turf recipe — New England Lobster ingredients", "city": "Burlingame", "brand": "b_newenglandlobster", "reel": "https://www.instagram.com/reel/DKVo8ELToeo/", "clip": true, "credit": "Home recipe by @grubwitmike using New England Lobster claw meat and rib-eye from The Butcher Shop by Niku. Home-cooked surf-and-turf sandwich, not a restaurant menu dish."},
  {"by": "justmostie", "place": "Brunch & Bloom", "city": "Brentwood", "brand": "b_brunchandbloom", "reel": "https://www.instagram.com/reel/Dfi9V_OTZH4/", "clip": "creator", "credit": "Review by @justmostie at Brunch & Bloom, Brentwood."},
  {"by": "hungere.for.diy", "place": "Ones Cafe & Bakery", "city": "Alameda", "brand": "b_onescafealameda", "reel": "https://www.instagram.com/reel/DbBFjWzhpja/", "clip": true, "credit": "Review / coverage by @hungere.for.diy. Visit to ones cafe alameda."},
  {"by": "cookwithhenny", "place": "Ones Cafe & Bakery", "city": "Alameda", "brand": "b_onescafealameda", "reel": "https://www.instagram.com/reel/DbHPuqiPoIm/", "clip": true, "credit": "Review / coverage by @cookwithhenny. Alameda visit, as identified in the caption opening and the submitted branch clarification. The caption footer instead names Castro Valley. Hosted visit disclosed by the creator."},
  {"by": "grubwitmike", "place": "Ones Cafe & Bakery", "city": "Castro Valley", "brand": "b_onescafebakery", "reel": "https://www.instagram.com/reel/DN6yMSWgU_G/", "clip": true, "credit": "Review / coverage by @grubwitmike. Castro Valley visit at 3483 Castro Valley Blvd; kept separate from the new Alameda location."},
  {"by": "bayarea.foodie.adventures", "place": "Ones Cafe & Bakery", "city": "Alameda", "brand": "b_onescafealameda", "reel": "https://www.instagram.com/reel/DdnQiFSp-IL/", "clip": true, "credit": "Review / coverage by @bayarea.foodie.adventures. Alameda visit. The dated buy-five-get-one promotion is not a current offer."},
  {"by": "thealamedapulse", "place": "Ones Cafe & Bakery", "city": "Alameda", "brand": "b_onescafealameda", "reel": "https://www.instagram.com/reel/DaMR1f3Jya4/", "clip": true, "credit": "Review / coverage by @thealamedapulse. Community coverage of the Alameda opening, posted June 30, 2026. Archival opening announcement, not an upcoming event."},
  {"by": "limitlessfood", "place": "Stan’s Donut Shop", "city": "Santa Clara", "brand": "b_stansdonutshop", "reel": "https://www.instagram.com/reel/DdF3CFGu9Jd/", "clip": true, "credit": "Review / coverage by @limitlessfood. Visit to stans donut shop."},
  {"by": "bayarealumpia", "place": "Stan’s Donut Shop", "city": "Santa Clara", "brand": "b_stansdonutshop", "reel": "https://www.instagram.com/reel/DbpUy5Ct2Vi/", "clip": true, "credit": "Review / coverage by @bayarealumpia. The film shows Stan’s Donut Shop signage in Santa Clara."},
  {"by": "eighty6ix_", "place": "Stan’s Donut Shop", "city": "Santa Clara", "brand": "b_stansdonutshop", "reel": "https://www.instagram.com/reel/DZNtHMKP_4H/", "clip": true, "credit": "Review / coverage by @eighty6ix_. Stan’s Donut Shop visit in National Donut Day coverage from June 5, 2026. Other chains’ dated offers are not current Stan’s offers."},
  {"by": "iamnikkieg", "place": "Fork It Pasta To Go", "city": "San Mateo", "brand": "b_forkitpasta", "reel": "https://www.instagram.com/reel/DfjGqJwPDnm/", "clip": true, "credit": "Review / coverage by @iamnikkieg. Visit to fork it pasta."},
  {"by": "yaymeegoround", "place": "Fork It Pasta To Go", "city": "San Mateo", "brand": "b_forkitpasta", "reel": "https://www.instagram.com/reel/DffPiq8BxHu/", "clip": true, "credit": "Review / coverage by @yaymeegoround. Visit to fork it pasta."},
  {"by": "foodieclubsf", "place": "Fork It Pasta To Go", "city": "San Mateo", "brand": "b_forkitpasta", "reel": "https://www.instagram.com/reel/DfiJQkAPslq/", "clip": true, "credit": "Review / coverage by @foodieclubsf. Visit to fork it pasta."},
  {"by": "nomwithelaine", "place": "Fork It Pasta To Go", "city": "San Mateo", "brand": "b_forkitpasta", "reel": "https://www.instagram.com/reel/DfiJkqxPVKz/", "clip": "creator", "credit": "Review / coverage by @nomwithelaine. Visit to fork it pasta."},
  {"by": "chefemaristevens", "place": "Crab-roll recipe — New England Lobster ingredients", "city": "Burlingame", "brand": "b_newenglandlobster", "reel": "https://www.instagram.com/reel/Da28nlxRG0M/", "clip": "creator", "credit": "Review / coverage by @chefemaristevens. Home recipe for a hot-honey butter crab roll using New England Lobster seafood. This is supplier context, not a restaurant menu dish or on-site visit."},
  {"by": "forkandscore", "place": "New England Lobster Market & Eatery", "city": "Burlingame", "brand": "b_newenglandlobster", "reel": "https://www.instagram.com/reel/DTqL0Cljd4F/", "clip": true, "credit": "Review / coverage by @forkandscore. Visit to new england lobster."},
  {"by": "hungere.for.diy", "place": "New England Lobster Market & Eatery", "city": "Burlingame", "brand": "b_newenglandlobster", "reel": "https://www.instagram.com/reel/DQ-CZNRERx0/", "clip": true, "credit": "Review by @hungere.for.diy at New England Lobster in Burlingame. The creator thanks the business for the meal."},
  {"by": "edeatstheworld", "place": "New England Lobster Market & Eatery", "city": "Burlingame", "brand": "b_newenglandlobster", "reel": "https://www.instagram.com/reel/DPt4qsJDz6o/", "clip": "creator", "credit": "Review / coverage by @edeatstheworld. Visit to new england lobster."},
  {"by": "sophie_eats_world", "place": "New England Lobster Market & Eatery", "city": "Burlingame", "brand": "b_newenglandlobster", "reel": "https://www.instagram.com/reel/DL5aeKuPXb7/", "clip": "creator", "credit": "Review / coverage by @sophie_eats_world. Visit to new england lobster."},
  {"by": "biteswithnatalia", "place": "East Bay Buffet", "city": "Dublin", "brand": "b_eastbaybuffet", "reel": "https://www.instagram.com/reel/DfiPeP7P_el/", "clip": true, "credit": "Review / coverage by @biteswithnatalia. Visit to east bay buffet."},
  {"by": "phoebe8food", "place": "Popbar", "city": "Berkeley", "brand": "b_popbarberkeley", "reel": "https://www.instagram.com/reel/DeFXxJmyKon/", "clip": true, "credit": "Review / coverage by @phoebe8food. Visit to popbar berkeley."},
  {"by": "eatswithglory", "place": "Popbar", "city": "Berkeley", "brand": "b_popbarberkeley", "reel": "https://www.instagram.com/reel/DbUINJ3ooPA/", "clip": true, "credit": "Review / coverage by @eatswithglory. Visit to popbar berkeley."},
  {"by": "lifestylebyangiee", "place": "Popbar", "city": "Berkeley", "brand": "b_popbarberkeley", "reel": "https://www.instagram.com/reel/DcUjFT1vSqU/", "clip": true, "credit": "Review / coverage by @lifestylebyangiee. Berkeley visit. The dated back-to-school Snackpass promotion is not presented as current."},
  {"by": "hungryhugh", "place": "Popbar — Anaheim Packing District", "city": "Anaheim", "brand": "b_popbarberkeley", "reel": "https://www.instagram.com/reel/CDfTEtRJTjy/", "clip": "creator", "credit": "Review / coverage by @hungryhugh. Popbar at Anaheim Packing District, posted August 5, 2020. Archival footage of another branch, not the Berkeley shop."},
  {"by": "realphdfoodie", "place": "Hinata Sushi Kitchen", "city": "Hayward", "brand": "b_hinatasushikitchen", "reel": "https://www.instagram.com/reel/DKLSD9myqri/", "clip": true, "credit": "Review / coverage by @realphdfoodie. Hayward visit posted May 27, 2025. The price quoted in the film is historical, not a current restaurant price."},
  {"by": "agnespittioni", "place": "Hinata Sushi Kitchen", "city": "Hayward", "brand": "b_hinatasushikitchen", "reel": "https://www.instagram.com/reel/DdfCvmqyCdn/", "clip": true, "credit": "Review / coverage by @agnespittioni. Visit to hinata sushi kitchen."},
  {"by": "eatswithvinni", "place": "Hinata Sushi Kitchen", "city": "Hayward", "brand": "b_hinatasushikitchen", "reel": "https://www.instagram.com/reel/DfitSXWIGrD/", "clip": true, "credit": "Review / coverage by @eatswithvinni. Visit to hinata sushi kitchen."},
  {"by": "yourglobalfoodiebff", "place": "Mikiya Wagyu Shabu House", "city": "San Mateo", "brand": "b_mikiyasanmateo", "reel": "https://www.instagram.com/reel/DNwcoap5Mye/", "clip": true, "credit": "Review by @yourglobalfoodiebff at Mikiya, 68 Hillsdale Shopping Center, San Mateo."},
  {"by": "baeareafo0die", "place": "Mikiya Wagyu Shabu House", "city": "Santa Clara", "brand": "b_mikiyasantaclara", "reel": "https://www.instagram.com/reel/DYM4sl1ROTc/", "clip": true, "credit": "Review / coverage by @baeareafo0die. Santa Clara visit; invitation disclosed by the creator. Dated tier promotions are not current prices."},
  {"by": "chaudownfood", "place": "Mikiya Wagyu Shabu House", "city": "Santa Clara", "brand": "b_mikiyasantaclara", "reel": "https://www.instagram.com/reel/DcnJ8qsxdkC/", "clip": true, "credit": "Review / coverage by @chaudownfood. Mikiya chain review; invited visit disclosed. Its caption lists several locations without identifying the filming branch; linked to Santa Clara without claiming it was filmed there."},
  {"by": "martiwantsmore", "place": "Mikiya Wagyu Shabu House", "city": "San Mateo", "brand": "b_mikiyasanmateo", "reel": "https://www.instagram.com/reel/DfixQS5TNfP/", "clip": true, "credit": "Review / coverage by @martiwantsmore. Mikiya San Mateo visit at 68 Hillsdale Shopping Center."},
  {"by": "latin_mami_", "place": "Mikiya — Cerritos", "city": "Cerritos", "brand": "b_mikiyasantaclara", "reel": "https://www.instagram.com/reel/DfbKexVuC5q/", "clip": "creator", "credit": "Review / coverage by @latin_mami_. Mikiya Cerritos visit. Linked as another-branch chain coverage, not footage of Santa Clara."},
  {"by": "edmunchthefoodie", "place": "Mikiya Wagyu Shabu House", "city": "Santa Clara", "brand": "b_mikiyasantaclara", "reel": "https://www.instagram.com/reel/DbmbVZLiDpM/", "clip": true, "credit": "Review / coverage by @edmunchthefoodie. Mikiya Bay Area review. The caption lists both Santa Clara and San Mateo without identifying the filming branch."},
  {"by": "carlaylayyy", "place": "My O My", "city": "Berkeley", "brand": "b_myomyberkeley", "reel": "https://www.instagram.com/reel/DfkLe46OqJe/", "clip": true, "credit": "Review / coverage by @carlacharisse_. My O My, Berkeley. Posted by @carlacharisse_; credited to Carla’s existing @carlaylayyy page."},
  {"by": "habibimocha", "place": "My O My", "city": "Berkeley", "brand": "b_myomyberkeley", "reel": "https://www.instagram.com/reel/DecrNOsS2fO/", "clip": true, "credit": "Review / coverage by @habibimocha. My O My, Berkeley. The bring-your-own-bag promotion is dated and not a current menu promise."},
  // Batch112 late pre-release share, November10 08:40 Pacific.
  {"by": "_whatarethechances_", "place": "Fork It Pasta To Go", "city": "San Mateo", "brand": "b_forkitpasta", "reel": "https://www.instagram.com/reel/DfjON_XozUT/", "clip": "creator", "credit": "Review by @_whatarethechances_ at Fork It Pasta To Go, San Mateo. The November 11, 2026 grand-opening announcement is dated, not an ongoing offer."},

  // Batch 113 — fresh reviews; existing creator pages and prior inline films retained.
  {"by": "bayareamunchies510", "place": "Deli Board", "city": "San Francisco", "brand": "b_deliboard", "reel": "https://www.instagram.com/reel/Dfi6sPbRZHy/", "clip": true, "credit": "Review by @bayareamunchies510 at Deli Board, 1058 Folsom Street, San Francisco."},
  {"by": "iamnikkieg", "place": "Flats Burgers", "city": "San Francisco", "brand": "b_flatsburgers", "reel": "https://www.instagram.com/reel/DflV2movJep/", "clip": "creator", "credit": "Review by @iamnikkieg at Flats Burgers, 4753 Mission Street, San Francisco."},
  // Batch 114 — creator reviews; creator links preserve the four-film business limit.
  {"by": "startingfiresevrywhere", "place": "HELLA GOOD BURGER", "city": "San Jose", "brand": "b_hellagoodburger", "reel": "https://www.instagram.com/reel/De0D6ipBS2B/", "clip": true, "credit": "Review by @startingfiresevrywhere at HELLA GOOD BURGER, San Jose."},
  {"by": "feedchris_", "place": "Sugar Plum Coffee Shop", "city": "Concord", "brand": "b_sugarplumcoffeeshop", "reel": "https://www.instagram.com/reel/DfkZJihzU0s/", "clip": true, "credit": "Review by @feedchris_ at Sugar Plum Coffee Shop, Concord."},
  {"by": "d_baylock_", "place": "Matzip — Union City", "city": "Union City", "brand": "b_matzipunioncity", "reel": "https://www.instagram.com/reel/DflcQpdNWWP/", "clip": true, "credit": "Review by @d_baylock_ at Matzip — Union City, Union City."},
  {"by": "chelchomps", "place": "Matzip — Union City", "city": "Union City", "brand": "b_matzipunioncity", "reel": "https://www.instagram.com/reel/DX4wZNpvg9x/", "clip": true, "credit": "Review by @chelchomps at Matzip — Union City, Union City."},
  {"by": "travelwtiff", "place": "Matzip — Union City", "city": "Union City", "brand": "b_matzipunioncity", "reel": "https://www.instagram.com/reel/DQ9zYNzAWgL/", "clip": true, "credit": "Review by @travelwtiff at Matzip — Union City, Union City."},
  {"by": "whatthejessi_", "place": "Matzip — Union City", "city": "Union City", "brand": "b_matzipunioncity", "reel": "https://www.instagram.com/reel/DcfGVgOJukE/", "clip": "creator", "credit": "Review by @whatthejessi_ at Matzip — Union City, Union City."},
  {"by": "sophie_eats_world", "place": "Matzip — Union City", "city": "Union City", "brand": "b_matzipunioncity", "reel": "https://www.instagram.com/reel/DZiDB5pykQr/", "clip": "creator", "credit": "Review by @sophie_eats_world at Matzip — Union City, Union City."},
  {"by": "goeatwithangie", "place": "Bibim Grill", "city": "Dublin", "brand": "b_bibimgrill", "reel": "https://www.instagram.com/reel/DflcorXhzRc/", "clip": "creator", "credit": "Review by @goeatwithangie at Bibim Grill, 3742 Fallon Road, Dublin."},
  {"by": "k.traaaaan", "place": "Gregory’s Gourmet Desserts — Oakland", "city": "Oakland", "brand": "b_gregorysgourmetdesserts", "reel": "https://www.instagram.com/reel/DeAEO9kviha/", "clip": true, "credit": "Review by @k.traaaaan at Gregory’s Gourmet Desserts — Oakland, Oakland."},
  {"by": "bestinthegamme", "place": "Gregory’s Gourmet Desserts — San Ramon", "city": "San Ramon", "brand": "b_gregorysgourmetdessertssanramon", "reel": "https://www.instagram.com/reel/Dc6aSHzv4a-/", "clip": true, "credit": "Review by @bestinthegamme. Filmed at the San Ramon shop; the original also lists the Oakland location."},
  {"by": "naeemahtravels", "place": "Gregory’s Gourmet Desserts — Oakland", "city": "Oakland", "brand": "b_gregorysgourmetdesserts", "reel": "https://www.instagram.com/reel/DcCkNkkoRgj/", "clip": true, "credit": "Review by @naeemahtravels at Gregory’s Gourmet Desserts — Oakland, Oakland."},
  {"by": "goutclout", "place": "Gregory’s Gourmet Desserts — San Ramon", "city": "San Ramon", "brand": "b_gregorysgourmetdessertssanramon", "reel": "https://www.instagram.com/reel/DbHGlTZygC-/", "clip": true, "credit": "Review by @goutclout at Gregory’s Gourmet Desserts — San Ramon, San Ramon."},
  {"by": "bonjocbites", "place": "The Sandwich Monkey", "city": "Foster City", "brand": "b_sandwichmonkey", "reel": "https://www.instagram.com/reel/Dd5UQRdqQ4x/", "clip": true, "credit": "Review by @bonjocbites at The Sandwich Monkey, Foster City."},
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
