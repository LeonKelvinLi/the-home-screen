import { useRef, useState } from 'react'
import { AppIcon, rectInScreen } from './AppIcon'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { useScreenSize } from './ScreenSize'
import { DOCK_APPS, HOME_PAGES } from '../apps/registry'
import { useCart } from '../store/cart'
import { EASE_IOS, PAGE_COMMIT_PX, PAGE_MS } from './constants'

interface Props {
  onOpen: (appId: string, rect: IconRect) => void
  /** Home icons fade and push back while an app opens on top of them. */
  receding: boolean
}

export function HomeScreen({ onOpen, receding }: Props) {
  const cart = useCart()
  const screen = useScreenSize()
  const [page, setPage] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const pageRef = useRef(0)
  pageRef.current = page
  const spotlightRef = useRef<HTMLButtonElement>(null)
  /** Locked on the first move so a vertical drag can never turn a page. */
  const axis = useRef<'x' | 'y' | null>(null)

  const pages = HOME_PAGES

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
    if (appId.startsWith('sys.') || appId.startsWith('h2o.')) return 0
    return cart.countForBrand(appId)
  }

  const offset = -page * screen.w + dx

  return (
    <div className={`home${receding ? ' is-receding' : ''}`}>
      {/*
        Wallpaper parallax: iOS drifts the wallpaper a fraction of the page
        distance rather than pinning it, which is what gives the home screen
        depth. The scale must cover the total drift or the far page exposes a
        bare strip down the edge.
      */}
      <div
        className="home-wallpaper"
        style={{
          transform: `translate3d(${offset * 0.06}px,0,0) scale(${1 + 0.13 * (pages.length - 1)})`,
          transition: dragging ? 'none' : `transform ${PAGE_MS}ms ${EASE_IOS}`,
        }}
      />

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
          <div className="home-page" key={i} {...(i === page ? {} : { inert: '' })}>
            <div className="home-grid">
              {apps.map((app) => (
                <AppIcon
                  key={app.id}
                  icon={app.icon}
                  label={app.label}
                  badge={badgeFor(app.id)}
                  onOpen={(rect) => onOpen(app.id, rect)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="page-dots">
        {pages.map((_, i) => (
          <span key={i} className={`dot${i === page ? ' is-on' : ''}`} />
        ))}
      </div>

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
            hideLabel
            onOpen={(rect) => onOpen(app.id, rect)}
          />
        ))}
      </div>
    </div>
  )
}
