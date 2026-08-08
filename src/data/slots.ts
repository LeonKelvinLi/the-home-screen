/**
 * The twenty-four spots on a city page, and what each one is for.
 *
 * The operator's own list, in his order. Every city page is the same
 * twenty-four, which is the point of it: a customer who has learned that slot 2
 * is Mexican food in Oakland knows where to look in Richmond, and a business
 * owner being pitched can be shown the exact tile that would be theirs.
 *
 * `label` is what fits under a 66px tile — the grid truncates anything longer
 * with an ellipsis, and "Mediterranean" under a tile is a row of dots. `name`
 * is the full category, used as the tile's accessible name and carried into the
 * Reserve screen so the operator can see which spot was tapped.
 *
 * NONE OF THESE IS A CLAIM. A slot is an empty space with a category on it, not
 * an assertion that such a business exists in that city or has agreed to
 * anything. That distinction is why the tiles stay drawn as dashed outlines
 * rather than as real icons with a name under them.
 */

export interface SlotCategory {
  /** 1-24, as the operator numbers them. */
  n: number
  /** Full category name. */
  name: string
  /** Short enough to sit under a tile without truncating. */
  label: string
}

export const SLOT_CATEGORIES: SlotCategory[] = [
  { n: 1, name: 'Burgers and hot dogs', label: 'Burgers' },
  { n: 2, name: 'Mexican food', label: 'Mexican' },
  { n: 3, name: 'Asian food', label: 'Asian' },
  { n: 4, name: 'Indian food', label: 'Indian' },
  { n: 5, name: 'Sushi', label: 'Sushi' },
  { n: 6, name: 'Italian', label: 'Italian' },
  { n: 7, name: 'Sandwiches', label: 'Sandwiches' },
  { n: 8, name: 'Korean and ramen', label: 'Korean' },
  { n: 9, name: 'Chicken wings', label: 'Wings' },
  { n: 10, name: 'Mediterranean', label: 'Medi' },
  { n: 11, name: 'Filipino food', label: 'Filipino' },
  { n: 12, name: 'Dog boutique', label: 'Dog shop' },
  { n: 13, name: 'Art gallery', label: 'Art' },
  { n: 14, name: 'Clothing brand or boutique', label: 'Clothing' },
  { n: 15, name: 'Gym', label: 'Gym' },
  { n: 16, name: 'Mechanics and smog', label: 'Mechanic' },
  { n: 17, name: 'Tattoo shop', label: 'Tattoo' },
  { n: 18, name: 'Shoe boutique', label: 'Shoes' },
  { n: 19, name: 'Local print shop', label: 'Print' },
  { n: 20, name: 'Ice cream shop', label: 'Ice cream' },
  { n: 21, name: 'Skate and bike shop', label: 'Skate' },
  { n: 22, name: 'Bakery', label: 'Bakery' },
  { n: 23, name: 'Coffee shop', label: 'Coffee' },
  { n: 24, name: 'Barber and salon', label: 'Barber' },
]

/** How many spots a city page holds. The operator's number, not a computed one. */
export const SPOTS_PER_CITY = SLOT_CATEGORIES.length
