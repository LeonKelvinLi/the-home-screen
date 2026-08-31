import { useEffect, useMemo, useRef, useState } from 'react'
import { AddToHomeCoach } from './AddToHomeCoach'
import { AppIcon, rectInScreen } from './AppIcon'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { useScreenSize } from './ScreenSize'
import { APP_GROUPS, CITY_PAGES, DOCK_SETS, GALLERY_APP, WATCH_APP, appForSlot } from '../apps/registry'
import { useGate } from '../lib/gate'
import { BEASTY_SHEETS, SLOT_PAGES, SPOTS_PER_PAGE } from '../data/slots'
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
import { ICON_LUMA, WALLPAPER_TILT } from '../data/luma'
import { wallpaperFor } from './Wallpaper'

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
  /*
    THE GATE, from his "New Users" note. A signed-out visitor keeps the first
    two flagship pages and every business on them; the six doors below raise the
    sign-up prompt instead of opening.
  */
  const { gate } = useGate()
  const [page, setPage] = useState(0)
  /*
    Which of the three dock sets is showing — his "Default is 1".

    Deliberately NOT persisted. The dock is the one fixed thing on the screen,
    and a customer who left it on Help last week should not come back to a home
    screen whose bottom row is a support menu.
  */
  const [dockSet, setDockSet] = useState(0)
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
  const galleryRef = useRef<HTMLButtonElement>(null)
  const watchRef = useRef<HTMLButtonElement>(null)
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
    /*
      HOW MANY ROWS THIS SCREEN CAN HOLD AT A DECENT SIZE — not how many the
      spots need.

      A city page used to force all twenty-four into six rows whatever the
      screen was, and shrink the tile until they fitted. In Safari, where the
      chrome takes a hundred points of height, that meant 47px icons under
      full-width labels: "the icons look too small". The operator's answer was
      the right one — "if needed remove the last row, so that it behaves like an
      iPhone home screen" — because that IS what a home screen does. It never
      shrinks an icon to make a page hold more; it fills the page at the proper
      size and the rest goes to the next one.

      So the rows come from the height, the tile keeps its size, and any spots
      that do not fit flow onto a continuation page. On a tall screen nothing
      changes: six rows fit, all twenty-four are on one page, and this reduces
      to what it always did.

      THIS IS IN TENSION WITH "the first 48 spots are the first two pages", and
      the tension is worth understanding before touching either side.

      That claim is what SLOT_PAGES was reordered for, and it holds exactly when
      the grid seats all 24 — which it does INSTALLED, at the full screen
      height, on every phone from a 13 mini up. In Safari, where the chrome
      costs about 160 points, a 15 seats 20 and Goods spills onto a second page:
      the order is still every numbered page before every yellow one, but the
      count moves.

      Forcing six rows anyway would restore the count and cost the size: at
      393x690 the tile computes to 47px, which is precisely the number the
      operator rejected above, and on a small phone in Safari it hits the 28px
      floor. So the count gives way and the size does not.
    */
    const slotAir = 12
    const slotRoom = screen.h - topPad - headingH - bottomReserve - slotAir
    /*
      52 is the floor for "looks like a home screen". Below it the label is
      nearly as wide as the icon above it, which is the exact thing being
      complained about. It is only a floor — where there is room the tile is the
      operator's own 66.
    */
    const niceTile = 52
    const nicePitch = niceTile + ICON_LABEL_H + minRowGap
    const slotRows = Math.max(3, Math.min(Math.ceil(SPOTS_PER_PAGE / cols), Math.floor(slotRoom / nicePitch)))
    const slotPitch = Math.min(rowPitch, slotRoom / slotRows)
    const slotGap = Math.max(minRowGap, Math.min(rowGap, slotPitch - screen.iconSize - ICON_LABEL_H))
    const slotTile = Math.max(
      minTile,
      Math.min(screen.iconSize, Math.floor(slotPitch - ICON_LABEL_H - slotGap)),
    )
    /** How many numbered spots fit on one page of this city, at this size. */
    const slotsPerPage = cols * slotRows

    /**
     * How bright a tile is, 0 to 1.
     *
     * A real logo is measured from its own file at build time. A generated
     * monogram has no file, so it is measured from the colour it is drawn on —
     * which is very nearly the whole tile, the initials being a few percent of
     * it.
     */
    const tileLuma = (app: AppDef): number => {
      const file = /\/icons\/([a-z0-9-]+)\.webp/.exec(
        (app.icon as { props?: { logo?: { imageUrl?: string } } })?.props?.logo?.imageUrl ?? '',
      )
      const measured = file && ICON_LUMA[file[1]]
      if (measured !== undefined && measured !== null) return measured
      const hex = /^#([0-9a-f]{6})/i.exec(app.tint ?? '')
      if (!hex) return 0.5
      const ch = (v: number) => {
        const x = v / 255
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
      }
      const n = parseInt(hex[1], 16)
      return 0.2126 * ch(n >> 16) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255)
    }

    /**
     * Put the dark tiles where the wallpaper is light.
     *
     * The operator's ask, in his words: "can you switch around those icons, so
     * the dark icons are in the lighter space of the wallpaper." A black tile
     * on the dark water at the foot of the Golden Gate photograph disappears;
     * the same tile against the sky does not.
     *
     * ONLY ON A PAGE WHERE EVERY TILE IS A REAL BUSINESS. A city page is mostly
     * empty numbered spots and those are categorised — services 1 is Barber in
     * every city, which is the whole basis of "the number 18 spot in your city".
     * Sorting those by brightness would shuffle the categories and break the
     * thing he sells. The flagship BEASTY sheets are fully seated, so there is
     * nothing there to scramble.
     *
     * Slot ids are untouched either way: this reorders what is DRAWN, not what
     * anything is keyed by, so every placement still resolves to the same
     * business.
     */
    const litOrder = (apps: AppDef[], city: string): AppDef[] => {
      /*
        FLAGSHIP SHEETS ONLY. A city page's numbered spots are categorised —
        services 1 is Barber in every city — and that is the whole basis of
        "the number 18 spot in your city". Reordering those would shuffle the
        categories and break the thing he sells. The BEASTY sheets are his own
        showcase, so they are his to arrange.

        This used to test "is every tile a real business" instead, which had the
        same effect right up until it did not: bumping Smash Bros to the yellow
        sheet left one open seat, the test saw a non-brand tile, and the whole
        page silently fell back to roster order. His brightness request stopped
        applying to the exact page he asked about, and nothing failed.
      */
      if (city !== 'BEASTY') return apps
      const slug = /\/wallpapers\/([a-z0-9-]+)\.webp/.exec(wallpaperFor(city))?.[1]
      const tilt = (slug && WALLPAPER_TILT[slug]) || 0
      /* A flat wallpaper has no lighter space to aim at, so his own order
         stands rather than being churned for a difference nobody can see. */
      if (Math.abs(tilt) < 0.03) return apps

      /*
        Only the BUSINESSES move. An open seat keeps its index, because on
        these sheets an empty tile still draws its category and sliding it
        somewhere else would relabel a spot he may already have sold.
      */
      const seats = apps.map((a, i) => [a, i] as const).filter(([a]) => a.kind === 'brand')
      const sorted = seats
        .map(([a]) => a)
        .sort((a, b) => (tilt > 0 ? tileLuma(a) - tileLuma(b) : tileLuma(b) - tileLuma(a)))
      const out = [...apps]
      seats.forEach(([, at], n) => {
        out[at] = sorted[n]
      })
      return out
    }

    // Paginate each group separately so a group always begins a fresh page.
    // A single flat list let page two's icons flow up onto page one whenever
    // the grid had room, which is exactly what the split exists to prevent.
    const out: Page[] = []

    /*
      The operator's flagship pages open the app — BEASTY · Goods, BEASTY ·
      Services, then their two yellow pages — ahead of everything, because that
      is the product he is selling. The system page follows, then the cities.
      buildCity is one function so a flagship page and a city page can never
      drift apart in shape, and so the order below is fixed in exactly one
      place: SLOT_PAGES.
    */
    const buildCity = (cityName: string) => {
      const key = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      /*
        The flagship carries one sheet the cities do not: BEASTY · Online, for
        brands that ship. A city's 48 numbered spots and its two yellow sheets
        are exactly as they were, so "the first 48 are the first two pages"
        still holds everywhere it is sold.
      */
      for (const slotPage of cityName === 'BEASTY' ? BEASTY_SHEETS : SLOT_PAGES) {
        /*
          Chunked, and the INDEX IS GLOBAL. A slot's id is its position in the
          operator's category list, not its position on the page it happens to
          land on — his number 18 has to stay number 18 whether it is the
          eighteenth tile of one page or the second of a continuation. Numbering
          per chunk would silently reseat every business on any screen short
          enough to split.
        */
        /*
          The yellow sheets never continue onto a second page. Their twenty-four
          blanks are not a promise of anything — they are "there is room here" —
          so on a short screen they simply show one page's worth rather than
          splitting and doubling how far anyone has to swipe. The NUMBERED pages
          do continue, because every one of those spots is a specific business
          or a specific category and none of them can be dropped.
        */
        const total = slotPage.yellow
          ? Math.min(slotPage.categories.length, slotsPerPage)
          : slotPage.categories.length
        for (let from = 0; from < total; from += slotsPerPage) {
          const chunk = slotPage.categories.slice(from, Math.min(from + slotsPerPage, total))
          out.push({
            city: cityName,
            section: slotPage.heading,
            tile: slotTile,
            rowGap: slotGap,
            ...(slotPage.yellow ? { wall: '/wallpapers/_beasty-pages.webp', yellow: true } : {}),
            apps: litOrder(
              chunk.map((_, i) => appForSlot(`${key}-${slotPage.kind}-${from + i}`)),
              cityName,
            ),
          })
        }
      }
    }

    buildCity('BEASTY')

    for (const group of APP_GROUPS) {
      if (!group.length) continue
      for (let i = 0; i < group.length; i += perPage)
        out.push({ apps: group.slice(i, i + perPage) })
    }

    /*
      Then four pages per city: the two numbered ones — goods, then services —
      which together hold the first 48 spots he sells, followed by the two
      yellow pages of openly available room.

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
  /*
    DOTS FOR THIS CITY, not a window over every page in the app.

    They used to show the nine around wherever you were, out of 208. That was
    already a compromise — 208 dots do not fit and would say nothing if they
    did — but a sliding window of nine says something actively unhelpful: it
    looks like a position in a short list and it is a position in a very long
    one, and it changes which pages it covers as you move.

    A city is the unit that means anything: Goods, Services, More goods, More
    services. Four dots tell you exactly where you are inside the place you are
    looking at, and they stop lying about how far you have to go. How far you
    have to go across 208 pages is not a dot problem — see the note on the
    heading, which is what actually jumps.

    The app-group pages carry no city, so they get their own run.
  */
  const dotGroup = (i: number) => pages[i]?.city ?? '\u0000apps'
  const here = dotGroup(safePage)
  let dotFrom = safePage
  while (dotFrom > 0 && dotGroup(dotFrom - 1) === here) dotFrom--
  let dotTo = safePage
  while (dotTo < pages.length - 1 && dotGroup(dotTo + 1) === here) dotTo++
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
                  noSite={app.noSite}
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
        {/*
          BIGGIE'S WINDOW, left of home — his ask: "add a window svg icon next
          to the home icon on the left where we will put biggie (the dog)… it
          should open another window within the web."

          It opens over the home screen the same way every other app does, so
          "another window" is literal rather than a new browser tab: leaving the
          site to show somebody the dog it is named after would be the wrong
          direction of travel.
        */}
        <button
          className="spotlight-glass is-gallery"
          onClick={() => {
            const el = galleryRef.current
            const rect = el && rectInScreen(el)
            if (rect) gate('gallery', () => onOpen(GALLERY_APP.id, rect))
          }}
          ref={galleryRef}
          aria-label="Biggie’s pictures"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
            <rect x="2.6" y="4.2" width="18.8" height="15.6" rx="3.2" />
            <circle cx="16.1" cy="9.4" r="1.9" fill="currentColor" stroke="none" />
            <path d="M3.4 16.6l4.9-5.2 4.4 4.6 2.6-2.4 4.6 4.4" strokeLinecap="round" />
          </svg>
        </button>

        {/*
          WATCH, beside the gallery — the operator's ask for a video button that
          plays instantly instead of handing somebody off to Instagram and
          making them wait through a login. His reason, in his words: "most
          people have a short attention span."
        */}
        <button
          className="spotlight-glass is-watch"
          onClick={() => {
            const el = watchRef.current
            const rect = el && rectInScreen(el)
            if (rect) gate('watch', () => onOpen(WATCH_APP.id, rect))
          }}
          ref={watchRef}
          aria-label="Watch"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
            <rect x="2.6" y="4.6" width="18.8" height="14.8" rx="3.2" />
            <path d="M10.2 9.4l5.2 3.1-5.2 3.1V9.4Z" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {/*
          A HOUSE, not a left arrow — "create a home button like you see there
          to bring people back to the landing page."

          Same behaviour it always had: it goes through history rather than a
          state flag, so the button and the browser can never disagree about
          which entry we are on. Only the glyph changed, and it changed because
          a left arrow now sits four inches away doing something completely
          different — stepping a page — and two arrows meaning two things is
          how a control gets pressed by mistake.
        */}
        <button
          className="spotlight-back"
          onClick={() => window.history.back()}
          aria-label="Back to the landing screen"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11.2 12 4l9 7.2" />
            <path d="M5.5 9.6V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.6" />
            <path d="M9.8 20v-5.2h4.4V20" />
          </svg>
        </button>

        <button
          ref={spotlightRef}
          className="spotlight"
          onClick={() => {
            const el = spotlightRef.current
            const rect = el && rectInScreen(el)
            if (rect) gate('search', () => onOpen('sys.search', rect))
          }}
        >
          <svg width="12" height="12" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor">
            <path d="M44 16a28 28 0 0 1 22 45.3l17.4 17.4a4.5 4.5 0 0 1-6.4 6.4L59.6 67.7A28 28 0 1 1 44 16Zm0 9a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z" />
          </svg>
          Search
        </button>

        {/*
          STEP ARROWS, in the margins either side of the row.

          His idea, and his reason: "rather than scrolling left or right...
          just have these buttons on the left and right to move from one page
          to another. Just tap away."

          They sit in the screen's own margins rather than in the flex row
          because that is where he drew them and because the row is already
          carrying Search and three dock buttons — adding two more to the flow
          on a 393px screen would squeeze the pill that is meant to be the
          obvious control.

          A swipe still works. This is a second way in, not a replacement:
          tapping is easier to demo, easier on a laptop, and easier for anyone
          who finds a precise horizontal drag hard.
        */}
        <button
          className="page-step is-prev"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 0}
          aria-label="Previous page"
        >
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button
          className="page-step is-next"
          /* "When they tap the right arrow to view more city's" — forward only.
             Going BACK is never gated: it would trap a visitor on whatever page
             they had reached with no way out. */
          onClick={() => gate('cities', () => goToPage(safePage + 1))}
          disabled={safePage === pages.length - 1}
          aria-label="Next page"
        >
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/*
          His three round buttons, right of Search: "Default is 1. When 2 or 3
          is pressed it will flip to that set of 4 icons."

          The DIGIT is what he drew and it is what the dock is switched by, so
          the digit is what is printed. It carries no meaning on its own, which
          is why each button's accessible name is the set it opens — a reader
          hears "BEASTY, dock set 2 of 3" rather than "2".

          Not tabs. A tab panel implies the thing below is the panel, and the
          thing below is the dock — furniture that is present on every page and
          never disappears. These are three toggles over one row, so that is
          what they are announced as.
        */}
        <div className="dock-switch" role="group" aria-label="Dock">
          {DOCK_SETS.map((set, i) => (
            <button
              key={set.key}
              className={`dock-switch-btn${i === dockSet ? ' is-on' : ''}`}
              aria-pressed={i === dockSet}
              aria-label={`${set.name}, dock set ${i + 1} of ${DOCK_SETS.length}`}
              onClick={() => gate('dock', () => setDockSet(i))}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="dock">
        {DOCK_SETS[dockSet].apps.map((app) => (
          <AppIcon
            key={app.id}
            icon={app.icon}
            label={app.label}
            name={app.name}
            badge={badgeFor(app.id)}
            size={screen.iconSize}
            hideLabel
            /*
              A dock entry carrying `page` is a PAGE, not a window — BSTY Goods
              is the flagship sheet of the very screen the dock sits on, so
              opening a window over it would cover the thing being asked for.
            */
            onOpen={(rect) => {
              /*
                "or any of them lower 4 buttons" — the dock row itself, gated
                as a group, but named one at a time. Four tiles sharing the
                `profile` key meant all four answered a tap with "Open your
                profile", which was wrong for three of them and got worse the
                day News took a slot.
              */
              /*
                NEWS IS PUBLIC, and that is the point of it.

                "This will be public for all users and affiliates to view. Only
                BEASTY Affiliates can access and use this feature" — reading is
                open, posting is not. A page whose job is to keep people coming
                back daily cannot be the thing they have to sign up to see; it
                is the reason to sign up.

                Everything else in the row is still gated, which is his own
                note: "any of them lower 4 buttons".
              */
              if (app.systemKey === 'news') return onOpen(app.id, rect)
              if (!app.page) return gate('profile', () => onOpen(app.id, rect), `Open ${app.name}`)
              const i = pages.findIndex((pg) => pg.city === app.page)
              if (i >= 0) goToPage(i)
            }}
          />
        ))}
      </div>

    </div>
  )
}
