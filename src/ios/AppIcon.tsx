import { memo, useRef } from 'react'
import type { ReactNode } from 'react'
import { ICON_SIZE } from './constants'

/** Width and height are separate so non-square origins (the Spotlight pill) work. */
export interface IconRect {
  left: number
  top: number
  width: number
  height: number
}

/** Measure an element in the fake screen's own unscaled coordinate space. */
export function rectInScreen(el: HTMLElement): IconRect | null {
  const screen = el.closest('.screen') as HTMLElement | null
  if (!screen) return null
  const s = screen.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  // The device may be CSS-scaled to fit the window; undo that when measuring.
  const k = screen.offsetWidth === 0 ? 1 : s.width / screen.offsetWidth
  return {
    left: (r.left - s.left) / k,
    top: (r.top - s.top) / k,
    width: r.width / k,
    height: r.height / k,
  }
}

interface Props {
  /** Whatever draws the tile: a brand logo, or a system app glyph. */
  icon: ReactNode
  label: string
  /**
   * The full name, for assistive tech.
   *
   * `label` is truncated to fit under a 60px tile — "Gao Viet Kitc…",
   * "WinkyDinkyD…", "Waffles & Cr…" — and it was doing double duty as the
   * accessible name, so a screen reader announced the ellipsis. Sighted users
   * get the short one because they can see the icon; nobody else can.
   */
  name?: string
  badge?: number
  /** Measured at tap time so the app can zoom out of this exact icon. */
  onOpen: (rect: IconRect) => void
  hideLabel?: boolean
  /** Tile edge in px; iPad icons are larger than iPhone ones. */
  size?: number
}

function AppIconBase({ icon, label, name, badge, onOpen, hideLabel, size = ICON_SIZE }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const pressed = useRef(false)
  const startY = useRef(0)
  /** Set by a pointer-driven open so the synthesised click does not re-fire. */
  const handledByPointer = useRef(false)

  const open = () => {
    const tile = ref.current?.querySelector('.icon-tile') as HTMLElement | null
    const rect = tile && rectInScreen(tile)
    if (rect) onOpen(rect)
  }

  return (
    <button
      ref={ref}
      className="app-icon"
      onPointerDown={(e) => {
        pressed.current = true
        handledByPointer.current = false
        startY.current = e.clientY
      }}
      onPointerCancel={() => (pressed.current = false)}
      onPointerUp={(e) => {
        if (!pressed.current) return
        pressed.current = false
        // A swipe that began on an icon is a page swipe, not a tap.
        if (Math.abs(e.clientY - startY.current) > 8) return
        handledByPointer.current = true
        open()
      }}
      /*
        onClick as well as onPointerUp: pointer events alone left icons dead to
        the keyboard and to VoiceOver, whose activation delivers a synthesised
        click with no pointer sequence at all. The ref guard keeps a real mouse
        tap from opening the app twice.
      */
      onClick={() => {
        if (handledByPointer.current) {
          handledByPointer.current = false
          return
        }
        open()
      }}
      aria-label={name ?? label}
    >
      <span className="icon-tile" style={{ width: size, height: size }}>
        {icon}
        {badge ? (
          <span className="icon-badge" aria-label={`${badge} in cart`}>
            {badge > 99 ? '99+' : badge}
          </span>
        ) : null}
      </span>
      {!hideLabel && <span className="icon-label">{label}</span>}
    </button>
  )
}

/*
  Memoised, because the home screen re-renders on every page commit and there
  are twenty-four of these on a page. Nothing here changes unless its own props
  do — the icon element is stable, the label is a string, and the badge is a
  number.
*/
export const AppIcon = memo<Props>(AppIconBase)
