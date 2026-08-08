/**
 * The businesses this device has starred.
 *
 * The operator's loop, and it is a good one: Recent fills itself from what you
 * opened, and a star on a recent row promotes it to Favorites. One list you do
 * not have to curate, one you do — which is exactly how the two tabs differ on
 * a real phone.
 *
 * ON THIS DEVICE ONLY, like recents and the cart. No account exists yet, so a
 * favourite does not follow anyone to another phone; the Favorites screen says
 * so rather than letting someone find out by losing the list.
 */

const KEY = 'fb.favorites.v1'
const MAX = 60

/**
 * Same snapshot as a recent visit, and for the same reason: the landing screen
 * draws this list, and a catalogue lookup there would pull all thirty-two
 * brands into the first chunk a customer downloads.
 */
export interface Favorite {
  brandId: string
  name: string
  cuisine: string
  color: string
}

function read(): Favorite[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (v): v is Favorite => !!v && typeof v.brandId === 'string' && typeof v.name === 'string',
    )
  } catch {
    return []
  }
}

/** Starred businesses, most recently starred first. */
export function favorites(): Favorite[] {
  return read()
}

export function isFavorite(brandId: string): boolean {
  return read().some((f) => f.brandId === brandId)
}

/**
 * Star or unstar, returning the new state so a caller can update in one step.
 *
 * Newest first rather than appended: someone who has just starred a place
 * expects to find it at the top of the list they are about to open.
 */
export function toggleFavorite(brand: Favorite): boolean {
  const list = read()
  const on = list.some((f) => f.brandId === brand.brandId)
  const next = on
    ? list.filter((f) => f.brandId !== brand.brandId)
    : [brand, ...list].slice(0, MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode / quota — the star just will not persist */
  }
  return !on
}
