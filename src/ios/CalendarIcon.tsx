import { PageFold } from './PageFold'
import { useEffect, useState } from 'react'
import { PAGE_ICON_PATH } from './pageIcon'

/**
 * The calendar tile, showing today — the way the real one does.
 *
 * A live date, not a picture of a date. A frozen "17" on a home screen is the
 * same tell as a frozen 9:41 in a status bar: it is the one icon on the grid
 * that a customer already knows is supposed to be right, so getting it wrong is
 * worse than not having it.
 *
 * Ticks at local midnight rather than on an interval, so it costs one timer that
 * fires once a day instead of a poll.
 */
export function CalendarIcon() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number
    const schedule = () => {
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2)
      timer = window.setTimeout(() => {
        setNow(new Date())
        schedule()
      }, Math.max(1000, next.getTime() - Date.now()))
    }
    schedule()
    return () => clearTimeout(timer)
  }, [now])

  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const day = now.getDate()

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <clipPath id="cal-clip">
          <path d={PAGE_ICON_PATH} />
        </clipPath>
      </defs>
      <g clipPath="url(#cal-clip)">
        <rect width="100" height="100" fill="#fff" />
        {/* The weekday band. Apple's is a red word on white; the tile reads
            better on a busy wallpaper with the band filled. */}
        <rect width="100" height="27" fill="#E5433B" />
        <text
          x="50"
          y="19.5"
          textAnchor="middle"
          fill="#fff"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.5"
          fontFamily="-apple-system, 'SF Pro Display', system-ui, sans-serif"
        >
          {weekday}
        </text>
        <text
          x="50"
          y="79"
          textAnchor="middle"
          fill="#1c1c1e"
          fontSize="54"
          fontWeight="300"
          fontFamily="-apple-system, 'SF Pro Display', system-ui, sans-serif"
        >
          {day}
        </text>
      </g>
      <path d={PAGE_ICON_PATH} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />
      <PageFold />
    </svg>
  )
}
