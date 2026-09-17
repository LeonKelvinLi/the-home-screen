/**
 * Likes, saves and shares — the numbers an affiliate is shown.
 *
 * Server-side on purpose. Favourites were localStorage, which is per browser on
 * one phone: there was no number that meant anything to a business owner. The
 * operator asked for these counts so he could tell an affiliate "how much users
 * see them and like, add to favorites and share their page", and a figure like
 * that has to be true or it should not be on the screen.
 *
 * THE COUNT IS PEOPLE, NOT TAPS. The server keeps one row per actor per brand
 * per kind, so tapping the heart twice unlikes rather than counting twice, and
 * nobody can run a number up with their thumb.
 */
import { drain } from './http'
export interface Signals {
  counts: { like: number; favourite: number; share: number }
  mine: { like: boolean; favourite: boolean; share: boolean }
}

export type SignalKind = 'like' | 'favourite' | 'share'

export const EMPTY_SIGNALS: Signals = {
  counts: { like: 0, favourite: 0, share: 0 },
  mine: { like: false, favourite: false, share: false },
}

const ok = async (r: Response) => {
  if (!r.ok) {
    await drain(r)
    return null
  }
  return (await r.json()) as Signals
}

export async function readSignals(brandId: string): Promise<Signals | null> {
  try {
    return await ok(
      await fetch(`/api/brands/${encodeURIComponent(brandId)}/signals`, {
        credentials: 'same-origin',
      }),
    )
  } catch {
    /* Offline, or the API is not there. The buttons still work locally; they
       just carry no number, which is better than carrying a wrong one. */
    return null
  }
}

export async function sendSignal(brandId: string, kind: SignalKind): Promise<Signals | null> {
  try {
    return await ok(
      await fetch(`/api/brands/${encodeURIComponent(brandId)}/signals/${kind}`, {
        method: 'POST',
        credentials: 'same-origin',
      }),
    )
  } catch {
    return null
  }
}

/**
 * 1,200 rather than 1200, and 12.4k past ten thousand.
 *
 * Zero is printed as zero. A business is being shown this number, and hiding a
 * nought to make an empty page look busier is the one dishonest thing a counter
 * can do.
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `${Math.round(n / 1000)}k`
}
