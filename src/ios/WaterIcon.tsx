import { SQUIRCLE_100 } from './squircle'

/**
 * Dock icons for the water business (Beasty H2O Co / Kangen).
 *
 * Drawn to match the customer's existing home-screen shortcuts: white plates
 * with a single centred mark, which is what a "Add to Home Screen" icon from a
 * small business actually looks like on iOS.
 */

export type WaterGlyph = 'kangen' | 'beasty' | 'scan' | 'info'

/** Deterministic QR-looking module grid — three finder eyes plus stable noise. */
function qrModules(): { x: number; y: number }[] {
  const N = 21
  const out: { x: number; y: number }[] = []
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8)

  let seed = 0x9e3779b9
  const rnd = () => {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return ((seed >>> 0) % 1000) / 1000
  }

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue
      if (rnd() > 0.52) out.push({ x, y })
    }
  }
  return out
}

const MODULES = qrModules()

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" fill="#111" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="#111" />
    </g>
  )
}

export function WaterIcon({ glyph, size = 60 }: { glyph: WaterGlyph; size?: number }) {
  const clip = `wclip-${glyph}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <path d={SQUIRCLE_100} />
        </clipPath>
        <linearGradient id={`drop-${glyph}`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#8FE3FF" />
          <stop offset="45%" stopColor="#2FB6EF" />
          <stop offset="100%" stopColor="#0C7FC4" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill={glyph === 'info' ? '#0B0B0D' : '#FFFFFF'} />

        {glyph === 'kangen' && (
          <>
            {/* classic water droplet */}
            <path
              d="M50 14c13 20 22 31 22 43a22 22 0 0 1-44 0c0-12 9-23 22-43Z"
              fill={`url(#drop-${glyph})`}
            />
            <path
              d="M41 52c-3 4-4 8-3 12 .5 2-2 3-3 1-2-5-1-11 3-15 1.4-1.5 4.4.6 3 2Z"
              fill="#fff"
              opacity="0.75"
            />
          </>
        )}

        {glyph === 'beasty' && (
          <>
            {/* droplet outline */}
            <path
              d="M50 15c12.5 19 21 29.5 21 41a21 21 0 0 1-42 0c0-11.5 8.5-22 21-41Z"
              fill="none"
              stroke="#22B8E6"
              strokeWidth="3.4"
              strokeLinejoin="round"
            />
            {/*
              Standing pitbull in profile, facing right. Built from separate
              shapes rather than one path — at 60px the silhouette has to stay
              readable, and overlapping primitives are far easier to keep
              proportioned than a single bezier outline.
            */}
            <g fill="#9AA3A8">
              {/* tail */}
              <path d="M37 55c-2.5-1.5-4.5-4-5.5-6.8-.4-1.2 1.4-2 2-.9 1 2.1 2.6 4 4.6 5.2Z" />
              {/* body */}
              <ellipse cx="48" cy="57" rx="11.5" ry="6.2" />
              {/* chest + neck into head */}
              <path d="M56 52.5c1.5-2.6 4-4.2 6.8-4.2 3 0 5.4 1.7 6.6 4.2l-1.4 4.4c-.3 1-1.2 1.6-2.2 1.6h-8.2Z" />
              {/* head */}
              <circle cx="62.5" cy="49.5" r="6.4" />
              {/* snout */}
              <path d="M66 47.2h5.6c.9 0 1.6.7 1.6 1.6v2c0 .9-.7 1.6-1.6 1.6H66Z" />
              {/* ears */}
              <path d="M57.6 43.6l1.4 4.6-3.8-2.2c-.7-.4-.8-1.4-.2-1.9l1-.8c.5-.4 1.3-.2 1.6.3Z" />
              <path d="M67.4 43.6l-1.4 4.6 3.8-2.2c.7-.4.8-1.4.2-1.9l-1-.8c-.5-.4-1.3-.2-1.6.3Z" />
              {/* legs */}
              <rect x="39.5" y="60" width="3.4" height="11" rx="1.5" />
              <rect x="44.5" y="60" width="3.4" height="11" rx="1.5" />
              <rect x="54" y="60" width="3.4" height="11" rx="1.5" />
              <rect x="58.8" y="60" width="3.4" height="11" rx="1.5" />
            </g>
            <text
              x="68"
              y="76"
              fill="#9AA3A8"
              fontFamily='"Helvetica Neue", sans-serif'
              fontSize="7"
              fontWeight="700"
              letterSpacing="0.4"
            >
              CO.
            </text>
          </>
        )}

        {glyph === 'scan' && (
          <g transform="translate(19 19) scale(2.95)">
            <Finder x={0} y={0} />
            <Finder x={14} y={0} />
            <Finder x={0} y={14} />
            {MODULES.map((m, i) => (
              <rect key={i} x={m.x} y={m.y} width="1" height="1" fill="#111" />
            ))}
          </g>
        )}

        {glyph === 'info' && (
          <text
            x="50"
            y="52"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="58"
            fontStyle="italic"
            fontWeight="700"
          >
            i
          </text>
        )}

        <path d={SQUIRCLE_100} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />
      </g>
    </svg>
  )
}
