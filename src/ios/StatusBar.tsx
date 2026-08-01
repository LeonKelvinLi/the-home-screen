import { useEffect, useState } from 'react'

/**
 * Live status bar. The clock is real — a frozen "9:41" is the single fastest
 * way to make the illusion collapse.
 */

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    // Tick on the minute boundary rather than every second.
    let timer: number
    const schedule = () => {
      const ms = 60_000 - (Date.now() % 60_000)
      timer = window.setTimeout(() => {
        setNow(new Date())
        schedule()
      }, ms + 20)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])
  return now
}

export function StatusBar({ dark = false }: { dark?: boolean }) {
  const now = useClock()
  const time = now
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?[AP]M$/i, '')

  const fg = dark ? '#000' : '#fff'

  return (
    <div className="statusbar" style={{ color: fg }}>
      <div className="statusbar-time">{time}</div>
      <div className="statusbar-right">
        {/* cellular bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4.5}
              y={9 - i * 2.6}
              width="3"
              height={3 + i * 2.6}
              rx="1"
              fill={fg}
              opacity={i === 3 ? 0.35 : 1}
            />
          ))}
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" fill={fg}>
          <path d="M8 10.6 6.1 8.4a3 3 0 0 1 3.8 0Z" />
          <path
            d="M3.6 5.6a6.7 6.7 0 0 1 8.8 0"
            stroke={fg}
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M1.3 3.1a10 10 0 0 1 13.4 0"
            stroke={fg}
            strokeWidth="1.7"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        {/* battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.8" fill="none" stroke={fg} opacity="0.4" />
          <rect x="2" y="2" width="16" height="9" rx="2.5" fill={fg} />
          <path d="M24.5 4.5v4a2.4 2.4 0 0 0 0-4Z" fill={fg} opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
