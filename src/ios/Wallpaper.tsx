import { useEffect, useRef, useState } from 'react'

/**
 * The home-screen wallpaper, which changes with the city.
 *
 * Two stacked layers rather than one whose `background-image` is swapped. A
 * swap paints the new picture the instant it decodes — which is a hard cut,
 * and worse, a cut to a half-decoded image. Here the incoming layer is only
 * revealed once the browser says it has the pixels, so the fade always runs
 * from one finished picture to another.
 */

/** Where a city's wallpaper lives, if it has one. */
export function wallpaperFor(city: string | null | undefined): string {
  if (!city) return FALLBACK
  const slug = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return CITY_WALLPAPERS.has(slug) ? `/wallpapers/${slug}.webp` : FALLBACK
}

/*
  San Francisco, for anyone who declines location or whose city we have no
  picture for.

  It is the one landmark in the set that reads as "the Bay Area" rather than as
  a specific suburb, so a customer who never shares their location still gets
  something that belongs to where this marketplace operates — and someone in an
  unlisted city is not shown a landmark from a town they are not in.
*/
const FALLBACK = '/wallpapers/san-francisco.webp'

/*
  Cities with their own wallpaper on disk. A Set rather than a directory listing
  because the browser cannot list a directory, and a missing file would
  otherwise fail as a blank screen instead of falling back.

  Populated by tools/wallpapers.mjs — keep the two in step.
*/
const CITY_WALLPAPERS = new Set<string>([
  'alameda',
  'albany',
  'antioch',
  'berkeley',
  'brentwood',
  'concord',
  'dublin',
  'fremont',
  'hayward',
  'livermore',
  'oakland',
  'pittsburg',
  'pleasanton',
  'richmond',
  'san-francisco',
  'san-jose',
  'san-leandro',
  'union-city',
  'walnut-creek',
])

export function Wallpaper({ city }: { city: string | null }) {
  const target = wallpaperFor(city)
  /** What is currently painted. Only ever changes once the next one is ready. */
  const [shown, setShown] = useState(target)
  /** The incoming picture, faded up over the top once it has decoded. */
  const [incoming, setIncoming] = useState<string | null>(null)
  const timer = useRef(0)

  useEffect(() => {
    if (target === shown) return

    let cancelled = false
    const img = new Image()
    img.src = target

    const reveal = () => {
      if (cancelled) return
      setIncoming(target)
      /*
        Swap the base layer only after the fade has finished, then drop the
        incoming layer. Doing it in that order means there is never a frame
        where both layers are transparent, which would flash the black behind.
      */
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        if (cancelled) return
        setShown(target)
        setIncoming(null)
      }, FADE_MS)
    }

    /*
      decode() waits for the pixels, not just the bytes. `onload` fires before
      a large photograph has been rasterised, so fading on load can still show
      a blank layer for a frame or two on a slower phone.
    */
    img
      .decode()
      .then(reveal)
      .catch(() => {
        // decode() rejects on some older Safari versions even when the image is
        // fine, and on a genuine 404. Fall back to onload rather than never
        // changing the wallpaper at all.
        if (img.complete) return reveal()
        img.onload = reveal
        img.onerror = () => {
          /* Leave the current wallpaper up. A missing file is not worth a
             black screen. */
        }
      })

    return () => {
      cancelled = true
      window.clearTimeout(timer.current)
    }
  }, [target, shown])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="home-wallpaper">
      <div className="home-wallpaper-layer" style={{ backgroundImage: `url('${shown}')` }} />
      {incoming && (
        <div
          className="home-wallpaper-layer is-incoming"
          style={{ backgroundImage: `url('${incoming}')` }}
        />
      )}
    </div>
  )
}

/** Must match the CSS transition on .home-wallpaper-layer.is-incoming. */
const FADE_MS = 900
