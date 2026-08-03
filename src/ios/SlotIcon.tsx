import { ICON_SIZE } from './constants'
import { SQUIRCLE_100 } from './squircle'

/**
 * An empty slot on the last home-screen page.
 *
 * Drawn as a dashed squircle rather than a grey box so it reads as *reserved
 * space in a working system* — the same silhouette as every real icon, just
 * unfilled. A solid placeholder would read as a broken image, which is the
 * opposite of the message: these slots are the pitch to the next food truck.
 */
export function SlotIcon({ size = ICON_SIZE, fill = false }: { size?: number; fill?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        display: 'block',
        ...(fill ? { width: '100%', height: '100%' } : null),
      }}
    >
      <path d={SQUIRCLE_100} fill="rgba(255,255,255,0.09)" />
      <path
        d={SQUIRCLE_100}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.5"
        strokeDasharray="7 6"
        strokeLinecap="round"
      />
      <path
        d="M50 33v34M33 50h34"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
