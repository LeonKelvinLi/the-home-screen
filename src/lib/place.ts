/**
 * Which city the home screen says it is showing.
 *
 * Never asked for on load. A permission sheet in front of someone who has not
 * seen a menu yet costs more than a city name is worth, so the label starts at
 * the default and only reaches for the device when it is tapped.
 *
 * Once resolved it is written to the device and read back on every later
 * visit, so the prompt happens once and never again.
 */

export const DEFAULT_CITY = 'San Francisco'

const KEY = 'ths.city'

/** What this device settled on last time, if anything. */
export function savedCity(): string | null {
  try {
    const v = localStorage.getItem(KEY)
    return v && v.trim() ? v : null
  } catch {
    // Safari in private mode throws on localStorage rather than returning null.
    return null
  }
}

function remember(city: string): void {
  try {
    localStorage.setItem(KEY, city)
  } catch {
    /* Not being able to remember it is not a reason to fail the lookup. */
  }
}

/** Wipe the saved city so the next tap asks again. */
export function forgetCity(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to do */
  }
}

export type CityResult =
  | { ok: true; city: string }
  | { ok: false; reason: 'unsupported' | 'denied' | 'unavailable' }

/**
 * Ask the device where it is, name the place, and remember the answer.
 *
 * The coordinate goes to our own server, which relays it — see /api/city. The
 * browser never talks to the geocoder, so the customer's IP and headers are
 * not handed to a company they did not choose, and the page's CSP stays
 * `connect-src 'self'`.
 */
export async function detectCity(): Promise<CityResult> {
  if (!navigator.geolocation) return { ok: false, reason: 'unsupported' }

  let pos: GeolocationPosition
  try {
    pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        // A city needs a rough fix, not a precise one. Low accuracy is faster,
        // costs far less battery, and on iOS honours Precise Location being
        // off rather than failing.
        enableHighAccuracy: false,
        timeout: 10000,
        // A fix from the last five minutes is the same city as a fresh one.
        maximumAge: 300000,
      })
    })
  } catch (err) {
    const code = (err as GeolocationPositionError)?.code
    return {
      ok: false,
      reason: code === 1 ? 'denied' : 'unavailable',
    }
  }

  try {
    const { latitude, longitude } = pos.coords
    const r = await fetch(`/api/city?lat=${latitude}&lon=${longitude}`)
    if (!r.ok) throw new Error(`city lookup returned ${r.status}`)
    const { city } = (await r.json()) as { city?: string }
    if (!city) throw new Error('no city in response')
    remember(city)
    return { ok: true, city }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}
