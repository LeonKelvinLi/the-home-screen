import { useEffect, useMemo, useRef, useState } from 'react'
import { AppIcon, rectInScreen } from './AppIcon'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { useScreenSize } from './ScreenSize'
import { APP_GROUPS, CITY_PAGES, DOCK_APPS, appForSlot } from '../apps/registry'
import { SLOT_PAGES, SPOTS_PER_PAGE } from '../data/slots'
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
import { DEFAULT_CITY } from '../lib/place'

/** A home-screen page. `city` is set on the empty pages waiting for a city. */
interface Page {
  apps: AppDef[]
  /**
   * The city's name on its own, never "Oakland · Goods".
   *
   * The wallpaper and Search's jump-to-a-city both key off this, and a city now
   * has two pages — so the half that distinguishes them is kept separate rather
   * than folded into the name they both match on.
   */
  city?: string
  /** Goods or Services. Only a city page has one. */
  section?: string
  /**
   * Tile edge and row gap for THIS page, where the page cannot use the screen's
   * own. Only a city page sets them — see where the pages are built.
   */
  tile?: number
  rowGap?: number
}

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
  /** A city name to move to, set when Search asks for one. */
  jumpToCity?: string | null
  /** Called once the jump has been made, so the request is not repeated. */
  onJumped?: () => void
}

export function HomeScreen({ onOpen, receding, hidden, inert, jumpToCity, onJumped }: Props) {
  const cart = useCart()
  const screen = useScreenSize()
  const [page, setPage] = useState(0)
  const [dragging, setDragging] = useState(false)
  /*
    The finger's offset lives in a REF and is written straight to the node, not
    held in state.

    It used to be state, so every pointermove re-rendered HomeScreen — three
    pages of icons, each one calling into the cart context for its badge. A
    120Hz screen delivers a pointermove every 8ms, so a page turn was asking for
    roughly seventy component renders per frame. That is what made a swipe feel
    like ten frames a second.

    Nothing about the gesture needs React: it is one transform on one element.
    React is told once, on release, which page won.
  */
  const dxRef = useRef(0)
  const pagerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef(0)
  const spotlightRef = useRef<HTMLButtonElement>(null)
  /** Locked on the first move so a vertical drag can never turn a page. */
  const axis = useRef<'x' | 'y' | null>(null)

  /*
    The wallpaper follows the PAGE, not a detected location.

    There used to be a faint city label at the bottom that resolved where the
    customer actually was, and the wallpaper followed it. The operator has cut
    the label, which takes the only control that could trigger a lookup with it
    — so rather than freeze on whichever city a device happened to settle on
    once, the photograph is now simply the city whose page you are looking at.
    That makes all nineteen wallpapers reachable by swiping instead of by
    standing somewhere, and page one keeps the default.
  */

  /**
   * Paginate against the REAL grid rather than a fixed count. A phone gets
   * 4 columns over two pages; a desktop window gets 8 columns and everything
   * lands on one page, which is what stops a wide display looking half empty.
   */
  const pages = useMemo<Page[]>(() => {
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

      Both branches were 96. On a phone the grid begins at 32 — the page pads by
      `--status-h + 12`, and --status-h collapses to a 20px minimum there rather
      than the 54px default. Reserving 96 threw away most of a row.

      THIS NUMBER MIRRORS THE CSS. `.home-page`'s padding-top and this constant
      have to agree, or the row count is computed against a grid that starts
      somewhere else — which is exactly how a 25px row gap silently cost a row.
    */
    const topPad = screen.device === 'pad' ? 96 : 32
    /*
      Room kept below the grid: the page dots, the Spotlight row and the dock.

      No longer includes a band for the city label — that moved into the
      Spotlight row, which is what freed the seventh row of apps.
    */
    const bottomReserve = screen.device === 'pad' ? 190 : 172
    const rows = Math.max(3, Math.floor((screen.h - topPad - bottomReserve) / rowPitch))
    const perPage = Math.max(cols, cols * rows)

    /*
      A CITY page cannot paginate to fit, so its tiles shrink instead.

      Everywhere else the count follows the grid: however many icons fit, fit.
      A city page is the operator's fixed twenty-four — that sameness is the
      whole product — so on a short phone it is the tile that has to give way.
      It was not giving way: at the standard 105px pitch six rows need 694px
      below the heading, a 640px-tall phone has 404, and four tiles were drawn
      past the dock and off the bottom of the screen.

      The room is measured against the SAME bottomReserve the main grid honours,
      which is the page dots, the Spotlight pill and the dock. The hard-coded
      count had been quietly overrunning it and drawing the last row of labels
      under the dots even on a tall phone.

      The gap is spent before the tile: rows packed tighter cost nothing, a
      smaller tile costs a tap target. Both are capped at the screen's own
      numbers, so a phone with the room keeps the 66px tile the operator asked
      for and nothing moves.
    */
    /*
      The city name's own band — a 15px line plus its margin.

      MIRRORS .home-page-city in styles.css, for the same reason topPad mirrors
      .home-page's padding: the grid below it is sized from what is left, and a
      heading measured wrong is a row measured wrong.
    */
    const headingH = 32
    /* Tighter than this and the rows read as one block rather than as a grid. */
    const minRowGap = 6
    /* Below this a tile is no longer something a thumb can hit. A window this
       short has no room for a home screen at all, but it should end up cramped
       rather than with tiles of negative width. */
    const minTile = 28
    const slotRows = Math.ceil(SPOTS_PER_PAGE / cols)
    const slotPitch = Math.min(rowPitch, (screen.h - topPad - headingH - bottomReserve) / slotRows)
    const slotGap = Math.max(minRowGap, Math.min(rowGap, slotPitch - screen.iconSize - ICON_LABEL_H))
    const slotTile = Math.max(
      minTile,
      Math.min(screen.iconSize, Math.floor(slotPitch - ICON_LABEL_H - slotGap)),
    )

    // Paginate each group separately so a group always begins a fresh page.
    // A single flat list let page two's icons flow up onto page one whenever
    // the grid had room, which is exactly what the split exists to prevent.
    const out: Page[] = []
    for (const group of APP_GROUPS) {
      if (!group.length) continue
      for (let i = 0; i < group.length; i += perPage)
        out.push({ apps: group.slice(i, i + perPage) })
    }

    /*
      Then TWO pages per city, goods then services, each an empty grid waiting
      for the businesses the operator recruits there.

      One page per city put a barber and a sushi bar in the same grid, which is
      neither how the operator sells it — "Supply of Goods, Services & awesome
      Company" — nor how anyone looks for either of them. Twenty-four spots on
      each, his number, and the same categories in the same order in every city:
      a customer who learns that the second tile on Oakland's goods page is
      Mexican food knows where to look in Richmond, and a business owner being
      pitched can be shown the exact tile that would be theirs.

      Built here rather than in the registry because the tiles are sized to the
      page, and that is only known once the screen has been measured. Ids are
      scoped by city AND by page, so a tile keeps its own id across a resize —
      and so a tapped tile can be resolved back to a category, which is all
      makeSlot has to go on.
    */
    for (const cityName of CITY_PAGES) {
      const key = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      for (const slotPage of SLOT_PAGES) {
        out.push({
          city: cityName,
          section: slotPage.heading,
          tile: slotTile,
          rowGap: slotGap,
          apps: slotPage.categories.map((_, i) => appForSlot(`${key}-${slotPage.kind}-${i}`)),
        })
      }
    }

    return out.length ? out : [{ apps: [] }]
  }, [screen.columns, screen.iconSize, screen.h, screen.device])

  // Never strand the user on a page that no longer exists after a resize.
  const safePage = Math.min(page, pages.length - 1)
  /* Page one has no city of its own, so it keeps the default photograph. */
  const city = pages[safePage]?.city ?? DEFAULT_CITY

  /*
    Search asked for a city. Move there and tell the shell it is done, so the
    request cannot fire again on the next render.
  */
  useEffect(() => {
    if (!jumpToCity) return
    const i = pages.findIndex((p) => p.city?.toLowerCase() === jumpToCity.toLowerCase())
    if (i >= 0) setPage(i)
    onJumped?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToCity, pages.length])
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

  /** Write the pager's transform now, without waiting for a render. */
  const paint = (offset: number, animate: boolean) => {
    const el = pagerRef.current
    if (!el) return
    el.style.transition = animate ? `transform ${PAGE_MS}ms ${EASE_IOS}` : 'none'
    el.style.transform = `translate3d(${offset}px,0,0)`
  }

  const settle = (next: number) => {
    endMoving(PAGE_MS + 40)
    dxRef.current = 0
    axis.current = null
    // Animate to the committed page from wherever the finger left it, then let
    // the re-render land on the same value it is already showing.
    paint(-next * screen.w, true)
    setDragging(false)
    setPage(next)
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
      dxRef.current = overscroll ? dx * 0.32 : dx
      paint(-p * screen.w + dxRef.current, false)
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

  const offset = -safePage * screen.w

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
        ref={pagerRef}
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
        {pages.map((page, i) => {
          /*
            Only the current page and its two neighbours exist in the DOM.

            A turn only ever moves one page, so both neighbours are always ready;
            everything else would only be widening the composited surface. This
            is what keeps the painted area at three screens whether there are
            twelve pages or thirty.
          */
          if (Math.abs(i - safePage) > 1) return null
          return (
          /*
            `inert` on off-screen pages: without it, tabbing reached an icon
            outside the viewport and the browser scrolled the overflow-hidden
            screen sideways with no way to scroll it back.
          */
          <div
            className="home-page"
            key={i}
            /* Positioned by index, since they are no longer laid out in a row. */
            style={{ transform: `translate3d(${i * 100}%,0,0)` }}
            {...(i === safePage ? {} : { inert: '' })}
          >
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
            <>
            {/* An empty city page has to say WHICH city, or it is eighteen
                identical grids of plus signs — and now WHICH of the city's two
                pages, since goods and services are otherwise the same grid of
                dashed outlines under the same photograph. One line, so the
                heading's height and the tile math under it are unchanged. */}
            {page.city && (
              <p className="home-page-city">
                {page.city}
                {page.section && ` · ${page.section}`}
              </p>
            )}
            <div
              className="home-grid"
              style={{
                gridTemplateColumns: `repeat(${screen.columns}, 1fr)`,
                /* A city page carries its own, having been sized to fit a
                   fixed twenty-four. Everything else keeps the stylesheet's. */
                ...(page.rowGap === undefined ? {} : { rowGap: page.rowGap }),
              }}
            >
              {page.apps.map((app) => (
                <AppIcon
                  key={app.id}
                  icon={app.icon}
                  label={app.label}
                  name={app.name}
                  badge={badgeFor(app.id)}
                  size={page.tile ?? screen.iconSize}
                  onOpen={(rect) => onOpen(app.id, rect)}
                />
              ))}
            </div>
            </>
          </div>
          )
        })}
      </div>

      {pages.length > 1 && (
        <div className="page-dots">
          {pages.map((_, i) => (
            <span key={i} className={`dot${i === safePage ? ' is-on' : ''}`} />
          ))}
        </div>
      )}

      {/* iOS 16+ puts a Spotlight pill between the dots and the dock. */}
      <div className="spotlight-row">
        {/*
          Back to the landing screen, beside Search rather than in it.

          Browser back does this too, but that is the gesture people use to LEAVE
          a site — and the opening sequence is the thing anyone showing this app
          to someone else wants to replay. Deliberately quiet: the same glass as
          the Spotlight pill, no label, sized to the pill's own height so it
          reads as furniture rather than as a control competing with the grid.

          It goes through history rather than a state flag, so the button and the
          browser cannot disagree about which entry we are on — that
          disagreement is what made back a trap the first time.
        */}
        <button
          className="spotlight-back"
          onClick={() => window.history.back()}
          aria-label="Back to the landing screen"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5l-7 7 7 7M4 12h16" />
          </svg>
        </button>

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
            name={app.name}
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
