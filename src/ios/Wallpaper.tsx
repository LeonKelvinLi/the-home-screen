import { useEffect, useRef, useState } from 'react'
import { CITY_PAGES } from '../data/cities'

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
  if (CITY_WALLPAPERS.has(slug)) return `/wallpapers/${slug}.webp`
  /*
    A city with its own PAGE but no photograph yet gets the neutral one, not
    San Francisco.

    The San Francisco fallback works for someone whose location we do not have:
    it says "this marketplace is a Bay Area thing" and claims nothing about
    where they are. It stops working the moment a city has a page of its own,
    because then the Golden Gate is sitting at the top of a screen headed LAS
    VEGAS, telling a Nevada business owner we do not know the difference. Las
    Vegas was the first page outside California and turned that into a live
    defect the same day it was added.

    The placeholder is a plain dark gradient with no landmark and no text in it,
    which is the honest picture for "we have not shot this city yet" — and it
    keeps the icon and label contrast identical to the photographs.
  */
  return PAGED_CITIES.has(slug) ? PLACEHOLDER : FALLBACK
}

/*
  Neutral, generated here rather than photographed — see tools/wallpapers.mjs
  for the real ones. Named with a leading underscore so it sorts away from the
  cities and nobody mistakes it for one.
*/
const PLACEHOLDER = '/wallpapers/_placeholder.webp'

/**
 * Cities that have a home-screen page, lowercased and slugged.
 *
 * Derived from CITY_PAGES rather than typed out again, so adding a city can
 * never quietly reintroduce the wrong-landmark bug.
 */
const PAGED_CITIES = new Set(
  CITY_PAGES.map((c) =>
    c
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  ),
)

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
  'benicia',
  'berkeley',
  'brentwood',
  'concord',
  'cupertino',
  'dublin',
  'fremont',
  'hayward',
  'las-vegas',
  'livermore',
  'mountain-view',
  'oakland',
  'palo-alto',
  'pittsburg',
  'pleasanton',
  'redwood-city',
  'richmond',
  'san-francisco',
  'san-jose',
  'san-leandro',
  'san-mateo',
  'santa-clara',
  'saratoga',
  'sunnyvale',
  'union-city',
  'vallejo',
  'walnut-creek',
])

/*
  `src` overrides the city lookup for pages that are not a place at all — the
  yellow BEASTY PAGES overflow sheets. The crossfade machinery below neither
  knows nor cares where the path came from.
*/
export function Wallpaper({ city, src }: { city: string | null; src?: string }) {
  const target = src ?? wallpaperFor(city)
  /** What is currently painted. Only ever changes once the next one is ready. */
  const [shown, setShown] = useState(target)
  /** The incoming picture, faded up over the top once it has decoded. */
  const [incoming, setIncoming] = useState<string | null>(null)
  const timer = useRef(0)

  useEffect(() => {
    if (target === shown) {
      /*
        A stale incoming layer must be torn down here, not ignored. Two page
        turns inside the 900ms fade hit this: turn one sets the yellow sheet as
        `incoming` and starts the swap timer; turn two lands back on a page
        whose wallpaper equals `shown`, the cleanup cancels that timer, and
        this early return then left the yellow layer sitting on top of the
        correct photograph indefinitely — the whole screen wore the wrong
        paper until some third page changed the target.
      */
      setIncoming((prev) => (prev === null ? prev : null))
      return
    }

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
