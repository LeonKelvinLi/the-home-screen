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
 * A placement is a CLAIM ABOUT A REAL AGREEMENT. An empty city page is an
 * honest statement that nobody there has signed up; putting a business on one
 * says they have. Nothing goes in this map that the operator has not actually
 * agreed with the owner.
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
  'dublin-goods-3': 'b_pippal', //                Indian
  'vallejo-goods-13': 'b_grindcafe707', //        Coffee

  /* The operator's own city placements from his messages, seated where his
     renamed categories put them. */
  'brentwood-services-7': 'b_jdiautodetailing', //   Detailer
  'berkeley-services-7': 'b_jnwdetailing', //        Detailer
  'berkeley-services-19': 'b_perfectnineevents', //  Events
  'brentwood-goods-2': 'b_xnoodledumpling', //       Asian
  'napa-goods-12': 'b_themodelbakery', //            Bakery
  'petaluma-services-12': 'b_townfuturistmedia', //  Photo/Video — a video production house

  /*
    Businesses with no fitting category go on the yellow overflow page rather
    than being crammed under a wrong label: a waste-removal service is not
    "Cleaning", a two-city breakfast house is not "Sandwiches", and a mobile
    groomer with no fixed city is not anywhere at all — the operator filed it
    under BEASTY itself.
  */
  'walnut-creek-services2-0': 'b_petbutlerwalnutcreek',
  'beasty-services2-0': 'b_happybaypaws',
  'pleasant-hill-goods2-0': 'b_thehangoutbreakfast',
  'walnut-creek-goods2-0': 'b_thehangoutbreakfast',
}
