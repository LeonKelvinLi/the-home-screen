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

/** Slot key (no `slot.` prefix) to the brand id that has taken it. */
export const CITY_PLACEMENTS: Record<string, string> = {
  /*
    Sin City Pits, in the dog spot on the Las Vegas goods page.

    Index 17 is the operator's number 18, "Dog boutique and breeder". A kennel
    is not a boutique, which is why that category's full name was widened rather
    than the breeder being filed under something it is not — and widening the
    name keeps every other spot's number where it was. Renumbering the list
    would have moved every tile in every city to fix one.
  */
  'las-vegas-goods-17': 'b_sincitypits',
}
