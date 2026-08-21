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

/** City name to the slug both wallpaper sets are keyed by. */
function slugOf(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * How much EXTRA black this city's wallpaper needs behind the icon labels.
 *
 * The scrim in styles.css was tuned on night cityscapes, where the sky behind
 * the grid is already dark. Every daytime photograph added since fails under
 * it, and not marginally: measured per label with the glyphs hidden, the
 * Golden Gate flagship's worst label is 7.29:1 against the 4.5 floor, while
 * Sunnyvale's is 1.56:1 with twenty of its twenty-four labels failing. White
 * text on a midday sky is the whole of the problem.
 *
 * WALLPAPER_LUMA is measured from the pixels by tools/wallpapers.mjs — the
 * 97th-percentile luminance of the band the icon grid sits in. Run the tool;
 * never hand-edit it. The percentile is high on purpose: a label lands on one
 * spot, not on the average of a photograph, and the failures are local ones —
 * a lit sign, a white wall, a gap of sky between towers. See the note there.
 *
 * The arithmetic. White on a background of luminance L clears 4.5:1 when L is
 * at or under 0.183. The existing gradient already contributes roughly 0.20 in
 * the grid band, so what is left for this to do is
 *
 *     (1 - 0.20) x (1 - boost) x L  <=  0.183      ->  boost >= 1 - 0.229 / L
 *
 * which is zero for anything already dark enough and rises with the picture.
 * Capped at 0.72: past that a photograph stops being a photograph, and a page
 * that dark is worth reshooting rather than dimming further.
 */
export function wallpaperScrim(city: string | null | undefined, src?: string): number {
  /*
    An explicit `src` overrides the city — that is how the yellow overflow
    sheets are drawn. Yellow is emphatically light, but those pages already
    flip their whole ink set to dark rather than leaning on the scrim, so they
    must NOT also get this: two fixes for one problem would black out a sheet
    whose labels are already dark on purpose.
  */
  if (src || !city) return 0
  const luma = WALLPAPER_LUMA[slugOf(city)]
  if (!luma) return 0
  return Math.max(0, Math.min(0.72, Math.round((1 - 0.229 / luma) * 1000) / 1000))
}

/** Where a city's wallpaper lives, if it has one. */
export function wallpaperFor(city: string | null | undefined): string {
  if (!city) return FALLBACK
  const slug = slugOf(city)
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
  How bright each wallpaper is where the icon grid sits, 0 to 1. Written by
  tools/wallpapers.mjs from the pixels; see wallpaperScrim above for what is
  done with it. Not a list anybody should edit by hand.
*/
const WALLPAPER_LUMA: Record<string, number> = {
  'alameda': 0.0753,
  'albany': 0.4747,
  'american-canyon': 0.6444,
  'antioch': 0.2427,
  'benicia': 0.8373,
  'berkeley': 0.5791,
  'brentwood': 0.3406,
  'chandler': 0.803,
  'concord': 0.2211,
  'crockett': 0.7139,
  'cupertino': 0.2797,
  'danville': 0.7612,
  'dublin': 0.2826,
  'el-cerrito': 0.7142,
  'folsom': 0.7354,
  'foster-city': 0.8568,
  'fremont': 0.4978,
  'glendale': 0.6404,
  'goodyear': 0.9823,
  'hayward': 0.3556,
  'lafayette': 0.4328,
  'las-vegas': 0.3848,
  'livermore': 0.3455,
  'martinez': 0.6197,
  'mesa': 0.3016,
  'milpitas': 0.7437,
  'mountain-view': 0.7351,
  'napa': 0.5719,
  'oakland': 0.288,
  'orinda': 0.9048,
  'palo-alto': 0.5192,
  'petaluma': 0.4516,
  'philadelphia': 0.6233,
  'phoenix': 0.8188,
  'pinole': 0.4472,
  'pittsburg': 0.5532,
  'pleasant-hill': 0.8686,
  'pleasanton': 0.1865,
  'redwood-city': 0.626,
  'richmond': 0.3969,
  'sacramento': 0.8155,
  'san-francisco': 0.1182,
  'san-jose': 0.3164,
  'san-leandro': 0.4027,
  'san-mateo': 0.4343,
  'san-pablo': 0.4778,
  'san-rafael': 0.8236,
  'san-ramon': 0.7907,
  'santa-clara': 0.553,
  'saratoga': 0.7237,
  'scottsdale': 0.7115,
  'sunnyvale': 0.7547,
  'surprise': 0.4997,
  'tempe': 0.2995,
  'union-city': 0.3012,
  'vacaville': 0.9493,
  'vallejo': 0.7821,
  'walnut-creek': 0.3634,
}

/*
  Cities with their own wallpaper on disk. A Set rather than a directory listing
  because the browser cannot list a directory, and a missing file would
  otherwise fail as a blank screen instead of falling back.

  Populated by tools/wallpapers.mjs — keep the two in step.
*/
const CITY_WALLPAPERS = new Set<string>([
  'alameda',
  'albany',
  'american-canyon',
  'antioch',
  'benicia',
  'berkeley',
  'brentwood',
  'chandler',
  'concord',
  'crockett',
  'cupertino',
  'danville',
  'dublin',
  'el-cerrito',
  'folsom',
  'foster-city',
  'fremont',
  'glendale',
  'goodyear',
  'hayward',
  'lafayette',
  'las-vegas',
  'livermore',
  'martinez',
  'mesa',
  'milpitas',
  'mountain-view',
  'napa',
  'oakland',
  'orinda',
  'palo-alto',
  'petaluma',
  'philadelphia',
  'phoenix',
  'pinole',
  'pittsburg',
  'pleasant-hill',
  'pleasanton',
  'redwood-city',
  'richmond',
  'sacramento',
  'san-francisco',
  'san-jose',
  'san-leandro',
  'san-mateo',
  'san-pablo',
  'san-rafael',
  'san-ramon',
  'santa-clara',
  'saratoga',
  'scottsdale',
  'sunnyvale',
  'surprise',
  'tempe',
  'union-city',
  'vacaville',
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
        /*
          decode() rejects on some older Safari versions even when the image is
          fine, and on a genuine 404. Fall back to onload rather than never
          changing the wallpaper at all.

          naturalWidth, NOT complete. A failed request is `complete` too — it
          finished, it just failed — so testing complete alone revealed the
          broken URL and swapped the base layer to it, and the onerror branch
          below could never run. A 404 on one wallpaper left the screen with no
          photograph at all until some other page changed the target. Only a
          decoded image has a non-zero natural width.
        */
        if (img.complete && img.naturalWidth > 0) return reveal()
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

  /*
    Follows `shown`, not `target` — the dimming has to travel with the picture
    it belongs to. Keyed off the incoming one instead, a swap from a night city
    to a midday one would black out the OLD photograph for the length of the
    fade and then lift as the bright one arrived, which is precisely backwards.
  */
  const boost = wallpaperScrim(cityOfPath(shown), src)

  return (
    <div className="home-wallpaper" style={{ '--wall-boost': boost } as React.CSSProperties}>
      <div className="home-wallpaper-layer" style={{ backgroundImage: `url('${shown}')` }} />
      {incoming && (
        <div
          className="home-wallpaper-layer is-incoming"
          style={{ backgroundImage: `url('${incoming}')` }}
        />
      )}
      {/*
        The black band the dock sits on — the operator asked for "this black
        background space like on this homescreen", pointing at iOS, where the
        dock has a ground of its own rather than floating on the picture.

        It lives INSIDE the wallpaper rather than beside it, and that is the
        whole reason it works. As a child of .home it would have been the last
        element in the DOM and painted over the dock and the icons; giving it a
        negative z-index instead would have put it behind the photograph. Here
        it is simply the layer after the pictures and before everything else,
        with no z-index anywhere to disagree about.
      */}
      {/*
        The dock's ground, on EVERY page including the yellow sheets — "don't
        forget to put the black wall on the bottom too."

        It was taken off the sheets for a day on the reasoning that a page runs
        to the edge of the paper rather than stopping above the dock. His call
        is the other way and it is his mark: the black band is what the dock
        stands on, and it reads as part of the furniture rather than as the page
        being cut off. One rule everywhere is also simply one rule.
      */}
      <div className="home-wallpaper-dock" />
    </div>
  )
}

/**
 * The slug back out of a wallpaper path, so the dimming can follow the picture
 * actually on screen rather than the city prop.
 *
 * They part company during a page turn: `shown` is still the old city's
 * photograph for the 900ms the fade takes, while `city` is already the new one.
 */
function cityOfPath(path: string): string | null {
  const m = /\/wallpapers\/([^/]+)\.webp$/.exec(path)
  return m && !m[1].startsWith('_') ? m[1] : null
}

/** Must match the CSS transition on .home-wallpaper-layer.is-incoming. */
const FADE_MS = 900
