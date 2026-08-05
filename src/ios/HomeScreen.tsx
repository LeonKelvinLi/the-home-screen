import { useEffect, useMemo, useRef, useState } from 'react'
import { AppIcon, rectInScreen } from './AppIcon'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { useScreenSize } from './ScreenSize'
import { APP_GROUPS, BLANK_PAGES, DOCK_APPS, makeSlot } from '../apps/registry'
import type { AppDef } from '../apps/registry'
import { useCart } from '../store/cart'
import { Wallpaper } from './Wallpaper'
import {
  EASE_IOS,
  ICON_LABEL_H,
  PAGE_COMMIT_PX,
  PAGE_MS,
  ROW_GAP_PAD,
  ROW_GAP_PHONE,
} from './constants'
import { DEFAULT_CITY, detectCity, savedCity } from '../lib/place'

interface Props {
  onOpen: (appId: string, rect: IconRect) => void
  /** Home icons fade and push back while an app opens on top of them. */
  receding: boolean
  /** Fully covered by an app — skip painting it altogether. */
  hidden?: boolean
  /**
   * Still visible but not reachable — the app switcher is over it. `hidden`
   * would also blank the wallpaper the switcher shows through.
   */
  inert?: boolean
}

export function HomeScreen({ onOpen, receding, hidden, inert }: Props) {
  const cart = useCart()
  const screen = useScreenSize()
  const [page, setPage] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const pageRef = useRef(0)
  const spotlightRef = useRef<HTMLButtonElement>(null)
  /** Locked on the first move so a vertical drag can never turn a page. */
  const axis = useRef<'x' | 'y' | null>(null)

  /*
    Location label.

    Seeded from whatever this device settled on before, so a returning customer
    is never asked twice — the permission prompt happens on the first tap and
    never again. Read in the initialiser rather than an effect so the label
    never flashes the default first.
  */
  const [city, setCity] = useState(() => savedCity() ?? DEFAULT_CITY)
  const [locating, setLocating] = useState(false)
  const [cityNote, setCityNote] = useState<string | null>(null)
  /*
    The re-entry guard has to be a REF, not the state above.

    Three taps in one tick all read `locating` before React has re-rendered any
    of them, so an impatient customer fired three geolocation requests and
    three relay calls, burning the rate limit for nothing. A ref updates on the
    same line it is set.
  */
  const locatingRef = useRef(false)

  const findCity = async () => {
    if (locatingRef.current) return
    locatingRef.current = true
    setLocating(true)
    setCityNote(null)
    const r = await detectCity()
    locatingRef.current = false
    setLocating(false)
    if (r.ok) return setCity(r.city)
    // Say which of the two it was. "Location is off" and "we could not reach
    // the lookup" need different things from the customer.
    setCityNote(
      r.reason === 'denied'
        ? 'Location is off for this site'
        : r.reason === 'unsupported'
          ? 'This browser cannot share a location'
          : 'Could not work out where you are',
    )
    window.setTimeout(() => setCityNote(null), 3200)
  }

  /**
   * Paginate against the REAL grid rather than a fixed count. A phone gets
   * 4 columns over two pages; a desktop window gets 8 columns and everything
   * lands on one page, which is what stops a wide display looking half empty.
   */
  const pages = useMemo<AppDef[][]>(() => {
    const cols = screen.columns
    /*
      Pitch from the REAL parts, not a round number.

      This was `iconSize + 40`, which came to 100 while the rendered pitch was
      105 — the tile, the label under it, and the row gap. Guessing five pixels
      low per row is how a grid ends up one row taller than the space it has.
    */
    const rowGap = screen.device === 'pad' ? ROW_GAP_PAD : ROW_GAP_PHONE
    const rowPitch = screen.iconSize + ICON_LABEL_H + rowGap
    /*
      Where the grid actually starts.

      Both branches were 96. On a phone the grid begins at 44 — the page pads
      by `--status-h + 24`, and --status-h collapses to a 20px minimum there
      rather than the 54px default. Reserving 96 threw away 52px at the top,
      which is most of a row: the phone showed five where six fit.
    */
    const topPad = screen.device === 'pad' ? 96 : 44
    /*
      Room kept below the grid: the page dots, the Spotlight row and the dock.

      No longer includes a band for the city label — that moved into the
      Spotlight row, which is what freed the seventh row of apps.
    */
    const bottomReserve = screen.device === 'pad' ? 190 : 172
    const rows = Math.max(3, Math.floor((screen.h - topPad - bottomReserve) / rowPitch))
    const perPage = Math.max(cols, cols * rows)

    // Paginate each group separately so a group always begins a fresh page.
    // A single flat list let page two's icons flow up onto page one whenever
    // the grid had room, which is exactly what the split exists to prevent.
    const out: AppDef[][] = []
    for (const group of APP_GROUPS) {
      if (!group.length) continue
      for (let i = 0; i < group.length; i += perPage) out.push(group.slice(i, i + perPage))
    }

    /*
      Blank pages close the home screen. Filled here rather than in the registry
      because a full page is however many icons THIS grid fits, and that is only
      known once the screen has been measured.

      Keys are page-scoped so a tile's id stays stable across a resize on its own
      page, instead of every slot renumbering when the row count changes.
    */
    for (let p = 0; p < BLANK_PAGES; p++) {
      out.push(Array.from({ length: perPage }, (_, i) => makeSlot(`${p}-${i}`)))
    }

    return out.length ? out : [[]]
  }, [screen.columns, screen.iconSize, screen.h, screen.device])

  // Never strand the user on a page that no longer exists after a resize.
  const safePage = Math.min(page, pages.length - 1)
  pageRef.current = safePage

  /**
   * True while a page turn is on screen — through the drag AND the settle
   * transition after it.
   *
   * This no longer touches the dock's blur. Suspending it mid-turn did cut the
   * per-frame cost, but the swap was a visible flicker on every swipe, which
   * is worse than the frames it saved. The blur now stays on continuously and
   * is cheaper instead. What remains here is the pager's own layer promotion.
   */
  const [moving, setMoving] = useState(false)
  const moveTimer = useRef<number | undefined>(undefined)
  const startMoving = () => {
    window.clearTimeout(moveTimer.current)
    setMoving(true)
  }
  const endMoving = (afterMs: number) => {
    window.clearTimeout(moveTimer.current)
    moveTimer.current = window.setTimeout(() => setMoving(false), afterMs)
  }
  useEffect(() => () => window.clearTimeout(moveTimer.current), [])

  const settle = (next: number) => {
    endMoving(PAGE_MS + 40)
    setDragging(false)
    setPage(next)
    setDx(0)
    axis.current = null
  }

  const drag = useDrag({
    threshold: 10,
    onStart: () => {
      startMoving()
      setDragging(true)
    },
    onMove: ({ dx, dy }) => {
      /*
        Decide the axis from a gesture that has actually travelled, not from
        the first pointermove.
        
        This was locking on the very first sample — the noisiest one there is.
        A horizontal swipe that begins with a few pixels of vertical drift, 
        which is most of them on a handheld phone, locked to 'y' and then did
        nothing at all however far the finger went. That is the "sometimes it
        just will not turn" case.
        
        The bar is also much higher now. The home grid paginates to fit and has
        NOTHING to scroll vertically, so a vertical lock buys nothing and costs
        a dead gesture; it takes a genuinely vertical drag (2.5x) to claim one.
      */
      const travelled = Math.hypot(dx, dy)
      if (!axis.current && travelled > 12) {
        axis.current = Math.abs(dy) > Math.abs(dx) * 2.5 ? 'y' : 'x'
      }
      if (axis.current === 'y') return
      const p = pageRef.current
      // Rubber-band at the ends.
      const overscroll = (p === 0 && dx > 0) || (p === pages.length - 1 && dx < 0)
      setDx(overscroll ? dx * 0.32 : dx)
    },
    onCancel: () => settle(pageRef.current),
    onEnd: ({ dx, vx }) => {
      // A vertical drag used to leave the page pinned at 0 for every frame and
      // then teleport a page on release — a page turn with no visual feedback.
      if (axis.current === 'y') return settle(pageRef.current)

      const p = pageRef.current
      // A flick should turn the page on intent, not on distance. 0.25 is a
      // comfortable thumb flick; the old 0.35 asked for a deliberate throw.
      const flick = Math.abs(vx) > 0.25
      if (!flick && Math.abs(dx) <= PAGE_COMMIT_PX) return settle(p)

      // Direction comes from the flick when there is one: dragging left then
      // flicking right used to still advance, because `next` read sign(dx).
      const dir = flick ? (vx < 0 ? 1 : -1) : dx < 0 ? 1 : -1
      settle(Math.max(0, Math.min(pages.length - 1, p + dir)))
    },
  })

  const badgeFor = (appId: string) => {
    if (appId === 'sys.cart') return cart.count
    if (appId.startsWith('sys.')) return 0
    return cart.countForBrand(appId)
  }

  const offset = -safePage * screen.w + dx

  return (
    <div
      className={`home${receding ? ' is-receding' : ''}${hidden ? ' is-hidden' : ''} is-${screen.device}`}
      {...(inert ? { inert: '' } : {})}
    >
      {/*
        Pinned, not parallaxed. The drift was a nice idea on a real device but
        on a page it reads as the background sliding around under the icons,
        and it forced a scale-up that softened the photo for no gain.
      */}
      <Wallpaper city={city} />

      <div
        className="home-pager"
        {...drag}
        style={{
          transform: `translate3d(${offset}px,0,0)`,
          transition: dragging ? 'none' : `transform ${PAGE_MS}ms ${EASE_IOS}`,
          // Promote to its own layer only while it is actually moving. Holding
          // will-change permanently pins a compositor layer for the whole
          // session and costs memory for nothing between swipes.
          willChange: moving ? 'transform' : 'auto',
        }}
      >
        {pages.map((apps, i) => (
          /*
            `inert` on off-screen pages: without it, tabbing reached an icon
            outside the viewport and the browser scrolled the overflow-hidden
            screen sideways with no way to scroll it back.
          */
          <div className="home-page" key={i} {...(i === safePage ? {} : { inert: '' })}>
            {/*
              Only pages next to this one draw their icons.

              The pager is one flex row 100% per page wide, so with seven pages
              it is a single 700%-wide composited layer — about 8000px across at
              phone DPR. Every icon on every page was rasterised into it, and a
              surface that size is past what a phone GPU keeps in one texture,
              so it re-tiles mid-turn. That is the sub-30fps swipe.

              A page outside the window keeps its box (flex sizing is on the
              wrapper) and drops its contents. Three pages of icons paint instead
              of seven, and the two neighbours are always ready because a turn
              only ever moves one page.
            */}
            {Math.abs(i - safePage) <= 1 && (
            <div
              className="home-grid"
              style={{ gridTemplateColumns: `repeat(${screen.columns}, 1fr)` }}
            >
              {apps.map((app) => (
                <AppIcon
                  key={app.id}
                  icon={app.icon}
                  label={app.label}
                  badge={badgeFor(app.id)}
                  size={screen.iconSize}
                  onOpen={(rect) => onOpen(app.id, rect)}
                />
              ))}
            </div>
            )}
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="page-dots">
          {pages.map((_, i) => (
            <span key={i} className={`dot${i === safePage ? ' is-on' : ''}`} />
          ))}
        </div>
      )}

      {/*
        One row: where you are, and the way to search.

        The city label used to have a band of its own between the last icon row
        and the page dots, and that band was worth a whole row of apps. Sharing
        the Spotlight row costs nothing vertically. The trade is size — it
        cannot be lock-screen large down here — so it keeps the weight and the
        glass and gives up the scale.

        Tappable, and ONLY tappable: nothing asks for a location on load.
      */}
      <div className="home-bar">
        <button
          className={[
            'home-city',
            locating ? 'is-locating' : '',
            cityNote ? 'is-note' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={findCity}
          aria-label={`Showing ${city}. Tap to use your location.`}
        >
          {cityNote ?? (locating ? 'Locating' : city)}
        </button>

      {/* iOS 16+ puts a Spotlight pill between the dots and the dock. */}
      <button
        ref={spotlightRef}
        className="spotlight"
        onClick={() => {
          const el = spotlightRef.current
          const rect = el && rectInScreen(el)
          if (rect) onOpen('sys.search', rect)
        }}
      >
        <svg width="12" height="12" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor">
          <path d="M44 16a28 28 0 0 1 22 45.3l17.4 17.4a4.5 4.5 0 0 1-6.4 6.4L59.6 67.7A28 28 0 1 1 44 16Zm0 9a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z" />
        </svg>
        Search
      </button>
      </div>

      <div className="dock">
        {DOCK_APPS.map((app) => (
          <AppIcon
            key={app.id}
            icon={app.icon}
            label={app.label}
            badge={badgeFor(app.id)}
            size={screen.iconSize}
            hideLabel
            onOpen={(rect) => onOpen(app.id, rect)}
          />
        ))}
      </div>
    </div>
  )
}
