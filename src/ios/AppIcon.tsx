import { useRef } from 'react'
import type { ReactNode } from 'react'
import { ICON_SIZE } from './constants'

export interface IconRect {
  left: number
  top: number
  size: number
}

interface Props {
  /** Whatever draws the tile: a brand logo, or a system app glyph. */
  icon: ReactNode
  label: string
  badge?: number
  /** Measured at tap time so the app can zoom out of this exact icon. */
  onOpen: (rect: IconRect) => void
  hideLabel?: boolean
}

export function AppIcon({ icon, label, badge, onOpen, hideLabel }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const pressed = useRef(false)
  const startY = useRef(0)

  const handleUp = (e: React.PointerEvent) => {
    if (!pressed.current) return
    pressed.current = false
    // A swipe that began on an icon is a page swipe, not a tap.
    if (Math.abs(e.clientY - startY.current) > 8) return

    const el = ref.current
    const screen = el?.closest('.screen') as HTMLElement | null
    const tile = el?.querySelector('.icon-tile') as HTMLElement | null
    if (!screen || !tile) return

    const s = screen.getBoundingClientRect()
    const r = tile.getBoundingClientRect()
    // The device is CSS-scaled to fit the window; undo that when measuring.
    const k = screen.offsetWidth === 0 ? 1 : s.width / screen.offsetWidth

    onOpen({ left: (r.left - s.left) / k, top: (r.top - s.top) / k, size: r.width / k })
  }

  return (
    <button
      ref={ref}
      className="app-icon"
      onPointerDown={(e) => {
        pressed.current = true
        startY.current = e.clientY
      }}
      onPointerCancel={() => (pressed.current = false)}
      onPointerUp={handleUp}
      aria-label={label}
    >
      <span className="icon-tile" style={{ width: ICON_SIZE, height: ICON_SIZE }}>
        {icon}
        {badge ? <span className="icon-badge">{badge > 99 ? '99+' : badge}</span> : null}
      </span>
      {!hideLabel && <span className="icon-label">{label}</span>}
    </button>
  )
}
