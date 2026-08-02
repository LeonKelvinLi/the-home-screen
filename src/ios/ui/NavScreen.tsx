import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Symbol } from './Symbol'

/**
 * iOS navigation screen with a collapsing large title.
 *
 * On iOS the title starts as a 34pt bold large title inside the scroll view and
 * collapses to a 17pt semibold inline title as you scroll, at which point the
 * bar gains its material background and hairline. The inline title is hidden
 * until the collapse — showing both at once is the giveaway that a web app is
 * imitating the bar rather than reproducing it.
 *
 * The back button is a chevron plus the PREVIOUS screen's title, not the word
 * "Back" and not the current screen's title.
 */

interface Props {
  title: string
  /** Previous screen's title, shown next to the back chevron. */
  backTitle?: string
  onBack?: () => void
  /** Trailing bar item. */
  right?: ReactNode
  /** Pinned above the tab bar / home indicator. */
  footer?: ReactNode
  /** Fixed below the bar, outside the scroll area (a search field, say). */
  stickyTop?: ReactNode
  children: ReactNode
}

const COLLAPSE_AT = 28

export function NavScreen({ title, backTitle, onBack, right, footer, stickyTop, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const raf = useRef(0)

  return (
    <div className="nav-screen">
      <header className={`nav-bar${collapsed ? ' is-collapsed' : ''}`}>
        <div className="nav-bar-row">
          <div className="nav-bar-left">
            {onBack && (
              <button className="nav-back" onClick={onBack}>
                <Symbol name="chevron.left" size={17} color="#007AFF" weight={2.6} />
                {backTitle && <span>{backTitle}</span>}
              </button>
            )}
          </div>
          <div className="nav-bar-title">{title}</div>
          <div className="nav-bar-right">{right}</div>
        </div>
      </header>

      {stickyTop && <div className="nav-sticky">{stickyTop}</div>}

      <div
        className="nav-scroll"
        onScroll={(e) => {
          // Coalesce to one read per frame; onScroll fires far more often.
          const top = (e.target as HTMLElement).scrollTop
          if (raf.current) return
          raf.current = requestAnimationFrame(() => {
            raf.current = 0
            setCollapsed(top > COLLAPSE_AT)
          })
        }}
      >
        <h1 className="nav-large-title">{title}</h1>
        {children}
      </div>

      {footer}
    </div>
  )
}
