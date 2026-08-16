import { useEffect, useMemo, useRef, useState } from 'react'
import { AddToHomeCoach } from './AddToHomeCoach'
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
  /** Wallpaper override for pages that are not a place (the yellow sheets). */
  wall?: string
  /** Dark-ink treatment for the yellow BEASTY pages. */
  yellow?: boolean
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
  /**
   * The dot buttons, so a turn can put focus on the one it landed on.
   *
   * Not polish. The page being LEFT gets `inert` in the same commit, and an
   * inert subtree blurs whatever inside it held focus — so a keyboard user who
   * pages away from an app icon is dropped on document.body, `.home` stops
   * receiving keydown, and the SECOND arrow press does nothing at all.
   */
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([])
  /**
   * A drag has passed useDrag's threshold since the last pointerdown, so the
   * click that lands after the release is that gesture's tail, not a tap.
   *
   * The dots row forwards its pointers to the pager (see .page-dots below), so
   * without this a swipe that began on a dot would settle on the page it
   * dragged to and then be overruled by a click on the dot it started from.
   */
  const dragged = useRef(false)
  /** What the live region says. Never drawn — see .home-live. */
  const [announce, setAnnounce] = useState('')
  /**
   * The page the live region has already been told about, or null before the
   * first commit.
   *
   * Compared rather than counted. A "have I run before" flag is the StrictMode
   * trap: the double-invoked mount effect runs twice with the ref surviving in
   * between, so the second pass reads as a page turn and the app announces
   * "Page 1 of 39" to someone who has not moved yet.
   */
  const announcedFor = useRef<number | null>(null)
  /**
   * The turn came from a dot, so focus moved to it and a reader has already
   * read its label. Without this the live region says it a second time, and
   * arrowing quickly through thirty-nine pages stutters.
   */
  const spokenByFocus = useRef(false)
  /** A dot that could not be focused because the window had not slid to it. */
  const wantsDotFocus = useRef<number | null>(null)

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
    /*
      A LITTLE air on top of the reserve, and only a little.

      This was 40 and it was the wrong shape of fix. bottomReserve is the height
      the dots, the pill and the dock occupy, so measuring against it alone let
      the grid end exactly where the dots begin. Buying clearance out of the
      grid, though, buys it out of the TILE on any phone-sized viewport: the row
      gap is already at its floor there, so every pixel taken from the pitch is a
      pixel off the icon. In Safari, where the chrome eats a hundred points of
      height, that took the tile from 49px to 43 and on a shorter phone to 38.
      Small tiles under full-width labels, which is what "all broken" looked
      like.

      Almost all of the clearance now comes from moving the DOTS down eighteen
      pixels instead — see .page-dots, where there was 33px of unused space. That
      costs nothing. What is left here is 12, which on a tall screen the row gap
      absorbs entirely and on a short one costs two pixels of tile rather than
      six.
    */
    const slotAir = 12
    const slotPitch = Math.min(
      rowPitch,
      (screen.h - topPad - headingH - bottomReserve - slotAir) / slotRows,
    )
    const slotGap = Math.max(minRowGap, Math.min(rowGap, slotPitch - screen.iconSize - ICON_LABEL_H))
    const slotTile = Math.max(
      minTile,
      Math.min(screen.iconSize, Math.floor(slotPitch - ICON_LABEL_H - slotGap)),
    )

    // Paginate each group separately so a group always begins a fresh page.
    // A single flat list let page two's icons flow up onto page one whenever
    // the grid had room, which is exactly what the split exists to prevent.
    const out: Page[] = []

    /*
      The operator's flagship pages open the app — BEASTY · Goods, its yellow
      page, BEASTY · Services, its yellow page — ahead of everything, because
      that is the product he is selling. The system page follows, then the
      cities. buildCity is one function so a flagship page and a city page can
      never drift apart in shape.
    */
    const buildCity = (cityName: string) => {
      const key = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      for (const slotPage of SLOT_PAGES) {
        out.push({
          city: cityName,
          section: slotPage.heading,
          tile: slotTile,
          rowGap: slotGap,
          ...(slotPage.yellow ? { wall: '/wallpapers/_beasty-pages.webp', yellow: true } : {}),
          apps: slotPage.categories.map((_, i) => appForSlot(`${key}-${slotPage.kind}-${i}`)),
        })
      }
    }

    buildCity('BEASTY')

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
    for (const cityName of CITY_PAGES) buildCity(cityName)

    return out.length ? out : [{ apps: [] }]
  }, [screen.columns, screen.iconSize, screen.h, screen.device])

  // Never strand the user on a page that no longer exists after a resize.
  const safePage = Math.min(page, pages.length - 1)
  /*
    The visible slice of the dot row. Clamped at both ends so the window stops
    sliding at the first and last page rather than running off — otherwise the
    row jitters by a dot as you reach either end.
  */
  const DOT_WINDOW = 9
  const dotFrom = Math.max(0, Math.min(safePage - (DOT_WINDOW >> 1), pages.length - DOT_WINDOW))
  const dotTo = Math.min(pages.length - 1, dotFrom + DOT_WINDOW - 1)
  /* Page one has no city of its own, so it keeps the default photograph. */
  const city = pages[safePage]?.city ?? DEFAULT_CITY
  /* Yellow sheets bring their own paper; everything else follows the city. */
  const wall = pages[safePage]?.wall

  /**
   * What a dot is called, and what the live region says.
   *
   * A comma, not the "·" the heading draws: the separator on screen is
   * typography, and a reader either skips it or says "middle dot". The app
   * pages get a bare "Page 2 of 39" — a Page record carries no name for them,
   * and calling one "Apps" would be making something up.
   */
  const pageLabel = (i: number) => {
    const p = pages[i]
    const where = p?.city ? `, ${p.city}${p.section ? `, ${p.section}` : ''}` : ''
    return `Page ${i + 1} of ${pages.length}${where}`
  }

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

  /*
    Say which page we landed on, wherever the turn came from — a dot, an arrow
    key, a swipe, or Search jumping to a city. Keyed off safePage rather than
    off each caller, so a new way of turning a page cannot forget to announce.

    Held until the turn is over, for two reasons. The sentence is only true once
    the page has arrived; and writing state in the same frame as a settle would
    put a second full render of three pages of icons inside the 340ms the
    animation is running, which is the cost this file spends the drag refs
    avoiding. React runs the previous cleanup first, so holding an arrow key
    down announces the page it stops on rather than every page it passed.
  */
  useEffect(() => {
    const was = announcedFor.current
    announcedFor.current = safePage
    if (was === null || was === safePage) return
    if (spokenByFocus.current) {
      spokenByFocus.current = false
      return
    }
    const t = window.setTimeout(() => setAnnounce(pageLabel(safePage)), PAGE_MS)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage])
  pageRef.current = safePage

  /*
    Land the focus a jump could not place. Runs after the dot row has
    re-rendered around the new page, which is the earliest the element exists.
  */
  useEffect(() => {
    const want = wantsDotFocus.current
    if (want === null) return
    wantsDotFocus.current = null
    dotsRef.current[want]?.focus({ preventScroll: true })
  }, [safePage])

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
      dragged.current = false
      startMoving()
      setDragging(true)
    },
    onMove: ({ dx, dy }) => {
      // Past the threshold, so this pointer is a gesture and the click it ends
      // with must not also be read as a tap on a dot.
      dragged.current = true
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

  /**
   * Move to a page from a control rather than from a finger.
   *
   * Deliberately NOT `settle`. That function exists to reconcile a node the
   * drag has been painting by hand back into React state — it writes
   * el.style.transform directly and clears the axis lock. Nothing has been
   * painted here, so plain state plus the transition already declared on
   * .home-pager is the entire job. It is the path Search's jump-to-a-city has
   * always taken.
   *
   * The index is ABSOLUTE and clamped against the current page count. A
   * functional setPage(p => p + 1) would read a `page` that a resize may have
   * left stranded past the end of the list — safePage clamps it for display but
   * never writes it back — and the clamp would then swallow the move: press
   * Right, nothing happens, forever.
   */
  const goToPage = (next: number, focusDot = false) => {
    const to = Math.max(0, Math.min(pages.length - 1, next))
    /*
      Focus BEFORE the state change. The page being left goes inert in the same
      commit and an inert subtree blurs what it contains, so moving focus
      afterwards is a race with that blur; moving it first means there is
      nothing left inside the inert page to lose.
    */
    // preventScroll for the same reason the off-screen pages are inert: the
    // screen is overflow:hidden with no way to scroll it back, so nothing here
    // is allowed to ask the browser to bring something into view.
    if (focusDot) {
      const dot = dotsRef.current[to]
      if (dot) dot.focus({ preventScroll: true })
      /*
        The target dot may not be MOUNTED yet: the row only renders the nine
        around the current page, so a jump beyond that window — End, Home, or
        arrowing off the edge — asks for a dot that does not exist until the
        window slides in the next commit. Focusing before the state change is
        still right for the common case (see above), so the miss is recorded
        and an effect picks it up once the dot is really there. Without this,
        End moved the page and dropped focus to the body.
      */
      else wantsDotFocus.current = to
    }
    if (to === pageRef.current) return
    // Layer promotion for the length of the turn, the same as a swipe gets.
    startMoving()
    endMoving(PAGE_MS + 40)
    /*
      useDrag only reports the END of a gesture that passed its threshold, so a
      plain tap anywhere on the home screen leaves `dragging` true and the pager
      pinned at `transition: none` until the next real swipe. Clearing it here is
      what makes a dot animate its turn rather than teleport when the last thing
      the customer did was tap something.
    */
    setDragging(false)
    spokenByFocus.current = focusDot
    setPage(to)
  }

  /**
   * Arrow keys page, and only from the home screen's own focus.
   *
   * A React handler on the home root rather than a window listener, and that IS
   * the scoping: a key pressed in an app window, in the item sheet or in the
   * switcher is in a different subtree and never bubbles here. The item sheet in
   * particular inerts only its siblings INSIDE .app-window — the home screen is
   * outside that, so a window listener would have paged the grid underneath a
   * sheet that had trapped Tab specifically to stop exactly that.
   *
   * receding/hidden are checked as well, because focus does NOT leave the home
   * screen when an app opens: the icon that was tapped keeps it for the whole
   * launch animation.
   *
   * `dragging` is deliberately not checked. useDrag never ends a gesture that
   * stayed under its 10px threshold, so a plain tap leaves that flag true until
   * the next real swipe — guarding on it would kill the arrow keys after the
   * first tap anywhere. A key pressed mid-swipe resolves harmlessly instead:
   * settle() reads pageRef, which is whatever the key just committed.
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (receding || hidden || inert) return
    if (e.defaultPrevented) return
    // Cmd/Alt+Arrow is browser history, and this app deliberately routes its own
    // way out through history.back() — stealing it would close the exit.
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

    const target = e.target as HTMLElement | null
    if (target?.isContentEditable) return
    if (target?.closest('input, textarea, select')) return

    const onDots = !!target?.closest('.page-dots')
    let to: number | null = null
    if (e.key === 'ArrowRight') to = pageRef.current + 1
    else if (e.key === 'ArrowLeft') to = pageRef.current - 1
    else if (onDots && e.key === 'Home') to = 0
    else if (onDots && e.key === 'End') to = pages.length - 1
    if (to === null) return

    e.preventDefault()
    /*
      Only pull focus when it is standing on ground that is about to go inert.
      Focus on the dock or on Search survives the turn and should stay put.
    */
    goToPage(to, onDots || !!target?.closest('.home-pager'))
  }

  const badgeFor = (appId: string) => {
    if (appId === 'sys.cart') return cart.count
    if (appId.startsWith('sys.')) return 0
    return cart.countForBrand(appId)
  }

  const offset = -safePage * screen.w

  return (
    <div
      /*
        `has-yellow-page` so the Spotlight row can change ink with the paper.
        That row lives outside .home-pager, so it cannot inherit anything from
        the page it is sitting over — it has to be told.
      */
      className={`home${receding ? ' is-receding' : ''}${hidden ? ' is-hidden' : ''} is-${screen.device}${pages[safePage]?.yellow ? ' has-yellow-page' : ''}`}
      onKeyDown={onKeyDown}
      {...(inert ? { inert: '' } : {})}
    >
      {/*
        Pinned, not parallaxed. The drift was a nice idea on a real device but
        on a page it reads as the background sliding around under the icons,
        and it forced a scale-up that softened the photo for no gain.
      */}
      <Wallpaper city={city} src={wall} />

      {/*
        The install nudge. Still inside .home, so its clock can only start once
        the home screen exists — never over the dialer — and it recedes, hides
        and goes inert with everything else when an app opens.

        FIRST among the children, though, where it used to be last. It is
        absolutely positioned so the order costs the layout nothing, and it
        cost a screen-reader user everything: mounted last, its Dismiss button
        was the 116th of 117 stops, about thirty-five seconds of swiping from a
        bubble that retires in twelve. Announced early, it can actually be
        answered.
      */}
      <AddToHomeCoach />

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
            className={`home-page${page.yellow ? ' is-yellow' : ''}`}
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
            {/* The yellow sheets carry the domain, because the yellow IS the
                claim: the operator wants every one of them to read as a page
                of BEASTYpages.com. */}
            {/*
              The domain line is GONE from the city sheets, on his call: "you
              can eliminate it completely on the yellow pages for each city...
              as long as it's on the landing page somewhere I think that will
              do." It lives in the landing page's drop-down bubble now.

              His yellow-Y wordplay went with it — BEAST(Y)PAGES.COM, the Y in
              brand yellow — which had been drawn here and nowhere else. If the
              domain ever comes back to a page, that treatment is in the history
              alongside the .home-page-domain-y rule kept in styles.css.
            */}
            <div
              className="home-grid"
              style={{
                /* minmax(0, 1fr), never a bare 1fr — the auto floor under a
                   bare one is the label's min-content width and it pushed the
                   fourth column off a 320px screen. The stylesheet's copy of
                   this carries the full account of it. */
                gridTemplateColumns: `repeat(${screen.columns}, minmax(0, 1fr))`,
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
                  mobile={app.mobile}
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
        /*
          The row forwards its pointers to the pager, with the SAME hook
          instance the pager uses.

          .page-dots is a sibling of .home-pager painted after it, so every
          pointerdown that lands on this row is swallowed before the drag
          handlers see it. That has always cost a 7px strip; each dot now
          answers a 44pt-tall thumb (see .dot::after), which would have made the
          dead strip six times taller. Forwarding hands the whole band back
          instead — a swipe that begins on the dots turns the page exactly as
          one that begins on the grid, because useDrag paints the pager by ref
          and never looks at which element it was bound to.
        */
        <div className="page-dots" role="group" aria-label="Home screen pages" {...drag}>
          {/*
            A WINDOW of dots, not all of them.

            The row renders one dot per page with a fixed 8px gap and no wrap.
            At 39 pages that fit. The city work took it to 105, which needs
            832px of gap alone inside a 393px row — so flexbox shrank every dot
            to ZERO width and the page indicator silently ceased to exist.
            Measured: 105 dots, 105 of them 0px wide, 0 visible.

            105 dots would be unreadable even if they fit, so this shows the
            nine around wherever you are: enough to feel movement and position
            within the run of pages you are actually swiping through, and it
            stays a fixed width no matter how many cities get added later.
            The full page count still reaches assistive tech through each dot's
            own label ("Page 42 of 105") and the live region.
          */}
          {pages.map((_, i) => (i < dotFrom || i > dotTo ? null : (
            <button
              key={i}
              ref={(el) => {
                dotsRef.current[i] = el
              }}
              className={`dot${i === safePage ? ' is-on' : ''}`}
              /*
                ONE tab stop for the whole row, arrows to move inside it. Two
                pages per city and seventeen cities make thirty-nine dots, so a
                stop each would drop thirty-nine of them between the last app
                icon and Search — worse for a keyboard than no dots at all.
              */
              tabIndex={i === safePage ? 0 : -1}
              aria-current={i === safePage ? 'page' : undefined}
              aria-label={pageLabel(i)}
              onClick={(e) => {
                /*
                  detail is 0 when a button is activated from the keyboard and
                  1+ when a pointer released on it. Only a pointer-driven click
                  can be the tail of a drag, and the flag is not cleared until
                  the next pointerdown — so without this half of the test, Enter
                  on a dot would do nothing for anyone who had ever swiped.
                */
                if (e.detail > 0 && dragged.current) return
                goToPage(i, true)
              }}
            />
          )))}
        </div>
      )}

      {/*
        Rendered from the first commit and left EMPTY. A live region that appears
        at the same moment as its text is not reliably announced — there was
        nothing there to be watched changing.
      */}
      <p className="home-live" role="status">
        {announce}
      </p>

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
