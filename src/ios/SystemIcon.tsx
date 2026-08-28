import { ICON_SIZE } from './constants'
import { SQUIRCLE_100 } from './squircle'

/**
 * Icons for the platform's own apps.
 *
 * Built to the craft standard Apple's system icons use rather than copying
 * their artwork: a soft vertical gradient (never flat), a specular highlight
 * across the top third, a glyph carrying a real drop shadow so it sits *on*
 * the tile instead of being punched out of it, and optical sizing — the glyph
 * occupies ~54% of the tile, which is what stops it looking cramped or
 * oversized next to a real app.
 *
 * The glyph shapes are ours. Apple's specific icon artwork is theirs.
 */

export type SystemGlyph =
  | 'bag' | 'receipt' | 'star' | 'help' | 'search' | 'person' | 'gear' | 'news'

/**
 * Gear outline with rounded teeth, generated rather than hand-drawn so the
 * teeth stay evenly spaced and the two gears in the Settings icon match.
 */
function gear(cx: number, cy: number, rOuter: number, rInner: number, teeth: number): string {
  const pts: string[] = []
  const step = (Math.PI * 2) / teeth
  // Each tooth is a trapezoid: narrow at the tip, wider at the root.
  const tipHalf = step * 0.19
  const rootHalf = step * 0.31

  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const p = (r: number, ang: number) =>
      `${(cx + r * Math.cos(ang)).toFixed(2)} ${(cy + r * Math.sin(ang)).toFixed(2)}`
    pts.push(`${i === 0 ? 'M' : 'L'}${p(rInner, a - rootHalf)}`)
    pts.push(`L${p(rOuter, a - tipHalf)}`)
    pts.push(`L${p(rOuter, a + tipHalf)}`)
    pts.push(`L${p(rInner, a + rootHalf)}`)
    // Arc along the root circle to the next tooth.
    pts.push(`A${rInner} ${rInner} 0 0 1 ${p(rInner, a + step - rootHalf)}`)
  }
  return `${pts.join('')}Z`
}

/*
  Both gears must sit inside the squircle, not the bounding box — a tooth that
  clears the 100x100 viewBox can still be sliced off by the corner curve.
  The pair is offset so the small gear meshes into the large one's upper right.
*/
const GEAR_MAIN = gear(45, 56, 30, 22.5, 9)
const GEAR_SMALL = gear(69, 32, 14, 10.5, 8)

/** Tile gradients, using iOS system colour pairs. */
const TILES: Record<SystemGlyph, [string, string]> = {
  bag: ['#3B8BFF', '#0A5BE0'],
  receipt: ['#7A78F0', '#4B49CC'],
  star: ['#FFB340', '#F58500'],
  help: ['#FFD426', '#FF9F0A'],
  search: ['#8E9298', '#5A5E63'],
  person: ['#F5F2ED', '#DCD5CA'],
  gear: ['#B9BDC3', '#75797E'],
  /*
    NOT AN iOS SYSTEM PAIR — this is BEASTY's own yellow, and deliberately.

    He asked for a news icon and sent an image search for one. A clip-art PNG
    off a search page would sit on the grid next to a hundred and sixty real
    business logos and read as clip art, and its licence is nobody's guess but
    the person who drew it. Drawn here instead, in the same craft as the other
    six: vertical gradient, specular top third, glyph with a real shadow.

    Four were drawn and this is the one that is theirs rather than anyone's —
    the masthead rule is the same yellow as the BEASTY PAGES overflow sheets,
    so it belongs to this product instead of to every news app ever made. The
    other three are folded newspaper, megaphone and stacked pages; swapping is
    this table and the path below.

    THE EXACT YELLOW IS SAMPLED FROM _beasty-pages.webp, not picked. First cut
    used the same amber pair as Help, and the two tiles sat in one dock of four
    looking like a rendering error. The BEASTY PAGES sheet is #E8C800 — a
    lemon rather than an amber — which reads as theirs and separates cleanly
    from Help at dock size.
  */
  news: ['#F7DC1E', '#E8C800'],
}

/** Glyph colour. Most are white; the light tiles need a dark mark. */
const INK: Partial<Record<SystemGlyph, string>> = {
  person: '#7D7469',
  help: '#7A4B00',
  // Near-black on the yellow, so the masthead is knocked out in their colour.
  news: '#141414',
}

export function SystemIcon({
  glyph,
  size = ICON_SIZE,
  fill = false,
}: {
  glyph: SystemGlyph
  size?: number
  fill?: boolean
}) {
  const [a, b] = TILES[glyph]
  const ink = INK[glyph] ?? '#fff'
  const uid = `sys-${glyph}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        display: 'block',
        ...(fill ? { width: '100%', height: '100%' } : null),
      }}
      aria-hidden="true"
    >
      <defs>
        {/* The same superellipse the brand icons clip to, so the two silhouettes
            match exactly on the grid and in the dock. Clipping in the SVG also
            makes the shape scale-independent, which border-radius was not. */}
        <clipPath id={`${uid}-clip`}>
          <path d={SQUIRCLE_100} />
        </clipPath>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>

        {/* Specular highlight: brightest at the very top, gone by 45%. */}
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.26" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Depth under the glyph. Apple's marks are never flat cut-outs. */}
        <filter id={`${uid}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#000" floodOpacity="0.18" />
        </filter>

        {/* Gear teeth catch light on the upper edge. */}
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#E4E6E9" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${uid}-clip)`}>
      <rect width="100" height="100" fill={`url(#${uid}-bg)`} />
      <rect width="100" height="100" fill={`url(#${uid}-gloss)`} />

      <g filter={`url(#${uid}-shadow)`} fill={ink}>
        {glyph === 'bag' && (
          <>
            {/* Handle drawn as a stroke so it reads at 60px, body as a solid. */}
            <path
              d="M38 34v-3a12 12 0 0 1 24 0v3"
              fill="none"
              stroke={ink}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path d="M29 34h42a5 5 0 0 1 5 4.6l3.4 33A7 7 0 0 1 72.4 79H27.6a7 7 0 0 1-7-7.4l3.4-33a5 5 0 0 1 5-4.6Z" />
            <path
              d="M29 34h42a5 5 0 0 1 5 4.6l3.4 33A7 7 0 0 1 72.4 79H27.6a7 7 0 0 1-7-7.4l3.4-33a5 5 0 0 1 5-4.6Z"
              fill="#000"
              opacity="0.07"
              transform="translate(0 3)"
              style={{ mixBlendMode: 'multiply' }}
            />
          </>
        )}

        {glyph === 'receipt' && (
          <>
            <path d="M28 20h44a4 4 0 0 1 4 4v54a3 3 0 0 1-4.6 2.5L61 74l-11 7-11-7-10.4 6.5A3 3 0 0 1 24 78V24a4 4 0 0 1 4-4Z" />
            <g fill={a} opacity="0.9">
              <rect x="34" y="33" width="32" height="5.5" rx="2.75" />
              <rect x="34" y="45" width="32" height="5.5" rx="2.75" />
              <rect x="34" y="57" width="21" height="5.5" rx="2.75" />
            </g>
          </>
        )}

        {glyph === 'star' && (
          <path d="M50 19.5a3 3 0 0 1 2.7 1.7l7.6 15.5 17.1 2.5a3 3 0 0 1 1.7 5.1L66.7 56.4l2.9 17a3 3 0 0 1-4.4 3.2L50 68.6 34.8 76.6a3 3 0 0 1-4.4-3.2l2.9-17-12.4-12.1a3 3 0 0 1 1.7-5.1l17.1-2.5 7.6-15.5A3 3 0 0 1 50 19.5Z" />
        )}

        {glyph === 'help' && (
          <path d="M50.6 22c11.2 0 19.8 7.4 19.8 17.6 0 7.1-3.4 11.3-9.6 15.4-4.2 2.8-5.4 4.4-5.4 7.6a5.4 5.4 0 0 1-10.8 0c0-7.3 3.4-11.3 9.6-15.4 4.4-2.9 5.4-4.4 5.4-7.6 0-4-3.9-7.2-9-7.2s-9 3.2-9 7.2a5.4 5.4 0 0 1-10.8 0C30.8 29.4 39.4 22 50.6 22ZM50 68.6a6.4 6.4 0 1 1 0 12.8 6.4 6.4 0 0 1 0-12.8Z" />
        )}

        {glyph === 'news' && (
          <>
            {/* Sheet, then the yellow knocked back out of it: masthead bar, a
                lead picture, two lines beside it, and two full-width lines. */}
            <path d="M20 24a4 4 0 0 1 4-4h52a4 4 0 0 1 4 4v52a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V24Z" />
            <g fill="#FFD400">
              <rect x="27" y="28" width="46" height="11" rx="2.5" />
              <rect x="27" y="45" width="20" height="16" rx="2.5" />
              <rect x="51" y="45" width="22" height="4" rx="2" />
              <rect x="51" y="53" width="22" height="4" rx="2" />
              <rect x="27" y="66" width="46" height="4" rx="2" />
            </g>
          </>
        )}

        {glyph === 'search' && (
          <path d="M43.5 19a24.5 24.5 0 0 1 19.2 39.7l17.6 17.6a5 5 0 0 1-7.1 7.1L55.6 65.8A24.5 24.5 0 1 1 43.5 19Zm0 10a14.5 14.5 0 1 0 0 29 14.5 14.5 0 0 0 0-29Z" />
        )}

        {glyph === 'person' && (
          <>
            <circle cx="50" cy="38" r="15" />
            <path d="M50 57c15.5 0 27.5 9.2 27.5 20.6A2.4 2.4 0 0 1 75 80H25a2.4 2.4 0 0 1-2.5-2.4C22.5 66.2 34.5 57 50 57Z" />
          </>
        )}

        {glyph === 'gear' && (
          <>
            <path d={GEAR_SMALL} fill={`url(#${uid}-metal)`} opacity="0.82" />
            <circle cx="69" cy="32" r="4.6" fill={b} opacity="0.82" />
            <path d={GEAR_MAIN} fill={`url(#${uid}-metal)`} />
            <circle cx="45" cy="56" r="10" fill={b} />
          </>
        )}
      </g>
      </g>
    </svg>
  )
}
