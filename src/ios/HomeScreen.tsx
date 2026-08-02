import { useMemo, useRef, useState } from 'react'
import { AppIcon, rectInScreen } from './AppIcon'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { useScreenSize } from './ScreenSize'
import { DOCK_APPS, ORDERED_APPS } from '../apps/registry'
import type { AppDef } from '../apps/registry'
import { useCart } from '../store/cart'
import { EASE_IOS, PAGE_COMMIT_PX, PAGE_MS } from './constants'

interface Props {
  onOpen: (appId: string, rect: IconRect) => void
  /** Home icons fade and push back while an app opens on top of them. */
  receding: boolean
  /** Fully covered by an app — skip painting it altogether. */
  hidden?: boolean
}

export function HomeScreen({ onOpen, receding, hidden }: Props) {
  const cart = useCart()
  const screen = useScreenSize()
  const [page, setPage] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const pageRef = useRef(0)
  const spotlightRef = useRef<HTMLButtonElement>(null)
  /** Locked on the first move so a vertical drag can never turn a page. */
  const axis = useRef<'x' | 'y' | null>(null)

  /**
   * Paginate against the REAL grid rather than a fixed count. A phone gets
   * 4 columns over two pages; a desktop window gets 8 columns and everything
   * lands on one page, which is what stops a wide display looking half empty.
   */
  const pages = useMemo<AppDef[][]>(() => {
    const cols = screen.columns
    const rowPitch = screen.iconSize + 40
    const topPad = screen.device === 'pad' ? 96 : 96
    const bottomReserve = screen.device === 'pad' ? 190 : 210
    const rows = Math.max(3, Math.floor((screen.h - topPad - bottomReserve) / rowPitch))
    const perPage = Math.max(cols, cols * rows)

    const out: AppDef[][] = []
    for (let i = 0; i < ORDERED_APPS.length; i += perPage) out.push(ORDERED_APPS.slice(i, i + perPage))
    return out.length ? out : [[]]
  }, [screen.columns, screen.iconSize, screen.h, screen.device])

  // Never strand the user on a page that no longer exists after a resize.
  const safePage = Math.min(page, pages.length - 1)
  pageRef.current = safePage

  const settle = (next: number) => {
    setDragging(false)
    setPage(next)
    setDx(0)
    axis.current = null
  }

  const drag = useDrag({
    threshold: 10,
    onStart: () => setDragging(true),
    onMove: ({ dx, dy }) => {
      if (!axis.current) axis.current = Math.abs(dy) > Math.abs(dx) * 1.4 ? 'y' : 'x'
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
      const flick = Math.abs(vx) > 0.35
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
    >
      {/*
        Pinned, not parallaxed. The drift was a nice idea on a real device but
        on a page it reads as the background sliding around under the icons,
        and it forced a scale-up that softened the photo for no gain.
      */}
      <div className="home-wallpaper" />

      <div
        className="home-pager"
        {...drag}
        style={{
          transform: `translate3d(${offset}px,0,0)`,
          transition: dragging ? 'none' : `transform ${PAGE_MS}ms ${EASE_IOS}`,
        }}
      >
        {pages.map((apps, i) => (
          /*
            `inert` on off-screen pages: without it, tabbing reached an icon
            outside the viewport and the browser scrolled the overflow-hidden
            screen sideways with no way to scroll it back.
          */
          <div className="home-page" key={i} {...(i === safePage ? {} : { inert: '' })}>
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
