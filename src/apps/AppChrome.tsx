import type { ReactNode } from 'react'
import { STATUS_H } from '../ios/constants'

/**
 * Shared in-app layout: a large-title nav bar that condenses on scroll, a
 * scrollable body inset for the status bar and home indicator, and an optional
 * pinned footer for the cart bar.
 */

interface Props {
  title: string
  subtitle?: string
  /** Left slot — usually a back chevron. */
  onBack?: () => void
  backLabel?: string
  right?: ReactNode
  footer?: ReactNode
  /** Tinted nav bars (brand pages) get light text. */
  tint?: string
  light?: boolean
  children: ReactNode
}

export function AppChrome({ title, subtitle, onBack, backLabel, right, footer, tint, light, children }: Props) {
  return (
    <div className={`chrome${light ? ' is-light' : ''}`} style={tint ? { ['--tint' as string]: tint } : undefined}>
      <header className="chrome-nav" style={{ paddingTop: STATUS_H }}>
        <div className="chrome-nav-row">
          <div className="chrome-nav-left">
            {onBack && (
              <button className="chrome-back" onClick={onBack}>
                <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true">
                  <path
                    d="M10 1 2 10l8 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {backLabel && <span>{backLabel}</span>}
              </button>
            )}
          </div>
          <div className="chrome-nav-title">{title}</div>
          <div className="chrome-nav-right">{right}</div>
        </div>
        {subtitle && <div className="chrome-nav-sub">{subtitle}</div>}
      </header>

      <div className="chrome-body">{children}</div>

      {footer && <div className="chrome-footer">{footer}</div>}
    </div>
  )
}
