import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  /** Extra class on the screen, for an app that paints its own ground. */
  className?: string
  children: ReactNode
}

const COLLAPSE_AT = 28

/*
  Where each screen was left, keyed by title.

  iOS keeps an app's scroll position when you leave and come back; this shell
  threw it away, so a customer who opened an item halfway down top dog's
  fifteen-item board and pressed Back landed at the top of the board again and
  had to find their place. Module-level so it survives the unmount — the whole
  screen is torn down when its app closes.
*/
const scrollMemory = new Map<string, number>()

export function NavScreen({ title, backTitle, onBack, right, footer, stickyTop, className, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const raf = useRef(0)
  /** Mirrors `collapsed` so the scroll handler can bail without a re-render. */
  const collapsedRef = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)

  /* Restore before paint, or the screen shows the top for one frame and jumps. */
  useLayoutEffect(() => {
    const top = scrollMemory.get(title)
    if (!top || !scroller.current) return
    scroller.current.scrollTop = top
    collapsedRef.current = top > COLLAPSE_AT
    setCollapsed(collapsedRef.current)
  }, [title])

  /* A queued frame that lands after unmount would set state on a dead screen. */
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <div className={`nav-screen${className ? ` ${className}` : ''}`}>
      <header className={`nav-bar${collapsed ? ' is-collapsed' : ''}`}>
        <div className="nav-bar-row">
          <div className="nav-bar-left">
            {onBack && (
              <button className="nav-back" onClick={onBack}>
                {/* currentColor, not a hardcoded blue: a screen that paints its own
                    ground has to be able to recolour the chevron with the label. */}
                <Symbol name="chevron.left" size={17} weight={2.6} />
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
        ref={scroller}
        onScroll={(e) => {
          // Coalesce to one read per frame; onScroll fires far more often.
          const top = (e.target as HTMLElement).scrollTop
          scrollMemory.set(title, top)
          if (raf.current) return
          raf.current = requestAnimationFrame(() => {
            raf.current = 0
            const next = top > COLLAPSE_AT
            if (next === collapsedRef.current) return
            collapsedRef.current = next
            setCollapsed(next)
          })
        }}
      >
        <h1 className="nav-large-title">{title}</h1>
        {children}
      </div>

      {/*
        Footers need the chrome padding, including clearance for the
        swipe-to-home strip. Rendering `footer` raw put a pinned button flush
        against that strip, which then silently ate the tap.
      */}
      {footer && <div className="nav-footer">{footer}</div>}
    </div>
  )
}
