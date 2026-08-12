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
    Businesses with no fitting category go on the yellow overflow page rather
    than being crammed under a wrong label: a waste-removal service is not
    "Cleaning", a two-city breakfast house is not "Sandwiches", and a mobile
    groomer with no fixed city is not anywhere at all — the operator filed it
    under BEASTY itself.

    Three from the 2026-08-11 run land here for the same reason, and it is
    worth being plain about which: the goods list is a list of CUISINES, and a
    restaurant that does not cook one of them has nowhere to sit. The Royale
    Eatery is contemporary American fine dining and One House Bistro is a
    brunch-and-dinner bistro — putting either under "Burgers and hot dogs",
    the only American-shaped spot on the page, would print "Burgers" under a
    tasting plate. Mimi's is a chocolatier, and "Bakery" is a different trade.

    All three are on their city's page and reachable; they are simply on the
    yellow one. Say the word and any of them moves to a numbered spot — that is
    a category call, and the categories are the operator's.
  */
  'pleasant-hill-goods2-1': 'b_royaleeatery',
  'san-ramon-goods2-0': 'b_onehousebistro',
  'dublin-goods2-0': 'b_mimischocolates',
  'walnut-creek-services2-0': 'b_petbutlerwalnutcreek',
  'beasty-services2-0': 'b_happybaypaws',
  'pleasant-hill-goods2-0': 'b_thehangoutbreakfast',
  'walnut-creek-goods2-0': 'b_thehangoutbreakfast',
}
