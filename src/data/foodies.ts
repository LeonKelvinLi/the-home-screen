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

  FOODIE_PAGES is the 24 with a page, ranked by how many reviews each has sent
  so far, then by Glenn's interest (@kimjsseats, "spearhead our movement").
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
}

export interface FoodiePage {
  handle: string
  name: string
  label: string
  /** An existing page that is this creator's (Grand-O's), instead of a new one. */
  brand?: string
}

const reel = (code: string) => `https://www.instagram.com/reel/${code}/`

export const FOODIE_PAGES: FoodiePage[] = [
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
]

/*
  The foodies' own pages, one per FOODIE_PAGES entry that has none yet, in
  their rank, so BEASTY • Foodies seats them in that order (categories.ts:
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
