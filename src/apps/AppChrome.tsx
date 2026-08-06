import type { ReactNode } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'

/**
 * Shim over NavScreen.
 *
 * This used to hand-roll its own bar: an opaque tinted fill with a 16px
 * centred title that never changed on scroll. Delegating means every screen
 * gets the real behaviour — a 34pt large title that collapses to a 17pt inline
 * one, a bar that stays transparent until it does, and a back button that
 * names the screen you came from — without each app being rewritten.
 *
 * `tint` is deliberately ignored. iOS navigation bars take the system material,
 * not a brand colour; brand colour belongs to the content below (see the hero
 * in BrandApp).
 */

interface Props {
  title: string
  /** Rendered under the large title, as iOS does on Mail and Files. */
  subtitle?: string
  onBack?: () => void
  /** The PREVIOUS screen's name — not "Back" and not this screen's name. */
  backLabel?: string
  right?: ReactNode
  footer?: ReactNode
  /** Retained for call sites; no longer paints the bar. */
  tint?: string
  light?: boolean
  /** Extra class on the screen, for an app that paints its own ground. */
  className?: string
  children: ReactNode
}

export function AppChrome({ title, subtitle, onBack, backLabel, right, footer, className, children }: Props) {
  return (
    <NavScreen
      title={title}
      backTitle={backLabel ?? 'Home'}
      onBack={onBack}
      right={right}
      footer={footer}
      className={className}
    >
      {subtitle && <p className="nav-subtitle">{subtitle}</p>}
      {children}
    </NavScreen>
  )
}
