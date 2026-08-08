/**
 * Businesses this device has opened, most recent first.
 *
 * The operator's idea for the second tab, and it keeps the stock clock icon
 * because it is doing the stock thing — iOS's second Phone tab is Recents, and
 * this is recents.
 *
 * ON THIS DEVICE ONLY. Nothing is sent anywhere and nothing identifies anyone:
 * it is a list of ids and timestamps in localStorage, the same place the cart
 * lives. That is worth stating because "we track what you looked at" is a
 * sentence that normally means something else.
 */

const KEY = 'fb.recents.v1'
/** A fortnight. Long enough to still be useful, short enough to stay a list. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000
const MAX = 20

export interface RecentVisit {
  brandId: string
  /** Epoch ms of the most recent open. */
  at: number
  /*
    A SNAPSHOT of what the row needs to draw, stored at write time.

    The landing screen shows this list, and looking a name up from the
    catalogue would drag all thirty-two brands, their menus and their logo
    definitions into the first chunk a customer downloads — measured at +33KB,
    which is the whole reason the shell is lazy-loaded in the first place. Three
    strings written once per visit costs nothing and keeps the split intact.

    It can go stale if a business is renamed. That is the right trade for a
    recents list: the id still opens the right page, and the next visit
    refreshes the label.
  */
  name: string
  cuisine: string
  color: string
}

function read(): RecentVisit[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    const cutoff = Date.now() - MAX_AGE_MS
    return raw.filter(
      (v): v is RecentVisit =>
        !!v &&
        typeof v.brandId === 'string' &&
        typeof v.at === 'number' &&
        typeof v.name === 'string' &&
        v.at > cutoff,
    )
  } catch {
    return []
  }
}

/** The list, newest first, already pruned of anything older than the window. */
export function recentVisits(): RecentVisit[] {
  return read().sort((a, b) => b.at - a.at)
}

/**
 * Record an open. Called for BRAND apps only — a customer's list of places is
 * not improved by Settings appearing in it.
 *
 * One entry per business: opening somewhere twice moves it to the top rather
 * than filling the list with the same shop.
 */
export function rememberVisit(brand: { id: string; name: string; cuisine: string; color: string }) {
  try {
    const entry: RecentVisit = {
      brandId: brand.id,
      at: Date.now(),
      name: brand.name,
      cuisine: brand.cuisine,
      color: brand.color,
    }
    const next = [entry, ...read().filter((v) => v.brandId !== brand.id)]
    localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX)))
  } catch {
    /* private mode / quota — the list just will not persist */
  }
}

/** "Today", "Yesterday", "3 days ago" — what a recents list actually needs. */
export function whenLabel(at: number, now = Date.now()): string {
  const startOf = (t: number) => {
    const d = new Date(t)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  // Compare by DAY, not by elapsed hours: something opened at 11pm was
  // "yesterday" at 1am, not "2 hours ago".
  const days = Math.round((startOf(now) - startOf(at)) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return 'Last week'
  return 'Earlier'
}
