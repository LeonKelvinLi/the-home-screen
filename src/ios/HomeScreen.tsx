import { useRef, useState } from 'react'
import { AppIcon } from './AppIcon'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { DOCK_APPS, HOME_PAGES } from '../apps/registry'
import { useCart } from '../store/cart'
import { EASE_IOS, PAGE_COMMIT_PX, PAGE_MS, SCREEN_W } from './constants'

interface Props {
  onOpen: (appId: string, rect: IconRect) => void
  /** Home icons fade and push back while an app opens on top of them. */
  receding: boolean
}

export function HomeScreen({ onOpen, receding }: Props) {
  const cart = useCart()
  const [page, setPage] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const pageRef = useRef(0)
  pageRef.current = page
  const spotlightRef = useRef<HTMLButtonElement>(null)

  const pages = HOME_PAGES

  const drag = useDrag({
    threshold: 10,
    onStart: () => setDragging(true),
    onMove: ({ dx, dy }) => {
      // Vertical intent belongs to the page, not the carousel.
      if (Math.abs(dy) > Math.abs(dx) * 1.4) return
      const p = pageRef.current
      // Rubber-band at the ends.
      const overscroll = (p === 0 && dx > 0) || (p === pages.length - 1 && dx < 0)
      setDx(overscroll ? dx * 0.32 : dx)
    },
    onEnd: ({ dx, vx }) => {
      setDragging(false)
      const p = pageRef.current
      const flick = Math.abs(vx) > 0.35
      const committed = Math.abs(dx) > PAGE_COMMIT_PX || flick
      let next = p
      if (committed) next = dx < 0 ? Math.min(p + 1, pages.length - 1) : Math.max(p - 1, 0)
      setPage(next)
      setDx(0)
    },
  })

  const badgeFor = (appId: string) => {
    if (appId === 'sys.cart') return cart.count
    if (appId.startsWith('sys.')) return 0
    return cart.countForBrand(appId)
  }

  const offset = -page * SCREEN_W + dx

  return (
    <div className={`home${receding ? ' is-receding' : ''}`}>
      {/*
        Wallpaper parallax: iOS drifts the wallpaper a fraction of the page
        distance rather than pinning it, which is what gives the home screen
        depth. 6% is close to the real ratio.
      */}
      <div
        className="home-wallpaper"
        style={{
          transform: `translate3d(${offset * 0.06}px,0,0) scale(1.08)`,
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
          <div className="home-page" key={i}>
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
          const screen = el?.closest('.screen') as HTMLElement | null
          if (!el || !screen) return
          const s = screen.getBoundingClientRect()
          const r = el.getBoundingClientRect()
          const k = screen.offsetWidth === 0 ? 1 : s.width / screen.offsetWidth
          // Spotlight expands out of the pill itself, not out of an icon.
          onOpen('sys.search', {
            left: (r.left - s.left) / k,
            top: (r.top - s.top) / k,
            size: r.height / k,
          })
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
