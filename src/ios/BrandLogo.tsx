import { GLYPHS } from '../data/glyphs'
import { SQUIRCLE_100 } from './squircle'
import type { Logo } from '../data/brands'

/**
 * Renders a brand's logo as pure SVG on a 100x100 squircle.
 *
 * Two rules keep these reading as real iOS icons rather than as designed
 * posters:
 *   1. The silhouette is a superellipse, not a rounded rect (see squircle.ts).
 *   2. The mark sits *on* the tile with margin. Small-business icons on a real
 *      home screen are a logo dropped onto a light plate — type that bleeds to
 *      the tile edge is the tell that something was designed in CSS.
 *
 * No image files and no webfonts on purpose: icons stay crisp at every size and
 * the whole catalogue is one JSON payload. When vendors upload real artwork
 * this component gets an `imageUrl` branch and nothing else changes.
 */

/**
 * Logo faces are self-hosted and named explicitly — no system fonts first.
 * A logo must render identically on every device; falling back to whatever
 * Helvetica variant a machine happens to have would change the mark itself.
 */
const FACE: Record<NonNullable<Logo['face']>, string> = {
  grotesk: 'Inter, "Helvetica Neue", system-ui, sans-serif',
  slab: '"Roboto Slab", Rockwell, Georgia, serif',
  script: '"Great Vibes", "Snell Roundhand", "Apple Chancery", cursive',
  condensed: 'Oswald, "Arial Narrow", Impact, sans-serif',
}

function parseBg(bg: string): { from: string; to: string; flat: boolean } {
  const [from, to] = bg.split('|')
  return { from, to: to ?? from, flat: !to }
}

/** Stable per-logo id so two icons never share a gradient definition. */
function uid(logo: Logo): string {
  const key = `${logo.template}${logo.bg}${logo.fg}${logo.initials ?? ''}${logo.glyph ?? ''}${(
    logo.lines ?? []
  ).join('')}`
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h).toString(36)
}

interface Props {
  logo: Logo
  /** Rendered pixel size. */
  size?: number
  /** Icon tiles get the squircle; in-app headers can render the mark alone. */
  masked?: boolean
}

export function BrandLogo({ logo, size = 60, masked = true }: Props) {
  const { from, to, flat } = parseBg(logo.bg)
  const id = uid(logo)
  const face = FACE[logo.face ?? 'grotesk']
  const accent = logo.accent ?? logo.fg
  const clip = `clip-${id}`
  const grad = `grad-${id}`

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
        <linearGradient id={grad} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      <g clipPath={masked ? `url(#${clip})` : undefined}>
        <rect width="100" height="100" fill={flat ? from : `url(#${grad})`} />

        {/*
          Real vendor artwork wins over the generated mark. The supplied PNGs
          are already square app tiles with their own backgrounds, so they just
          get clipped to the squircle like any other icon.
        */}
        {logo.imageUrl && (
          <image
            href={logo.imageUrl}
            x="0"
            y="0"
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid slice"
          />
        )}

        {logo.template === 'monogram' && (
          <>
            <text
              x="50"
              y="47"
              textAnchor="middle"
              dominantBaseline="central"
              fill={logo.fg}
              fontFamily={face}
              fontSize="40"
              fontWeight="800"
              letterSpacing="-1.5"
            >
              {logo.initials}
            </text>
            <rect x="34" y="68" width="32" height="2.5" rx="1.25" fill={accent} opacity="0.9" />
            {logo.lines?.[0] && (
              <text
                x="50"
                y="80"
                textAnchor="middle"
                dominantBaseline="central"
                fill={accent}
                fontFamily={FACE.grotesk}
                fontSize="7.5"
                fontWeight="700"
                letterSpacing="1.6"
                opacity="0.85"
              >
                {logo.lines[0]}
              </text>
            )}
          </>
        )}

        {logo.template === 'badge' && (
          <>
            <circle cx="50" cy="50" r="35" fill="none" stroke={accent} strokeWidth="2.2" />
            <circle cx="50" cy="50" r="30.5" fill="none" stroke={accent} strokeWidth="0.9" opacity="0.55" />
            {logo.glyph && (
              <g transform="translate(50 43) scale(0.42) translate(-50 -50)" fill={logo.fg}>
                <path d={GLYPHS[logo.glyph]} />
              </g>
            )}
            <text
              x="50"
              y="64"
              textAnchor="middle"
              dominantBaseline="central"
              fill={logo.fg}
              fontFamily={face}
              fontSize={(logo.lines?.[0]?.length ?? 0) > 9 ? 7.5 : 10}
              fontWeight="700"
              letterSpacing="0.8"
            >
              {logo.lines?.[0]}
            </text>
          </>
        )}

        {logo.template === 'glyph-word' && (
          <>
            {logo.glyph && (
              <g transform="translate(50 40) scale(0.5) translate(-50 -50)" fill={logo.fg}>
                <path d={GLYPHS[logo.glyph]} />
              </g>
            )}
            <text
              x="50"
              y="72"
              textAnchor="middle"
              dominantBaseline="central"
              fill={logo.fg}
              fontFamily={face}
              fontSize={(logo.lines?.[0]?.length ?? 0) > 7 ? 12 : 15}
              fontWeight="800"
              letterSpacing="0.3"
            >
              {logo.lines?.[0]}
            </text>
          </>
        )}

        {logo.template === 'wordmark' && (
          <>
            <text
              x="50"
              y="41"
              textAnchor="middle"
              dominantBaseline="central"
              fill={logo.fg}
              fontFamily={face}
              fontSize="26"
              fontWeight="600"
            >
              {logo.lines?.[0]}
            </text>
            <line x1="32" y1="55" x2="68" y2="55" stroke={accent} strokeWidth="1.3" opacity="0.85" />
            <text
              x="50"
              y="66"
              textAnchor="middle"
              dominantBaseline="central"
              fill={accent}
              fontFamily={FACE.condensed}
              fontSize="12"
              fontWeight="700"
              letterSpacing="2.4"
            >
              {logo.lines?.[1]}
            </text>
          </>
        )}

        {logo.template === 'band' && (
          <>
            <rect x="0" y="38" width="100" height="24" fill={accent} />
            <text
              x="50"
              y="28"
              textAnchor="middle"
              dominantBaseline="central"
              fill={logo.fg}
              fontFamily={face}
              fontSize="13"
              fontWeight="700"
              letterSpacing="1.2"
            >
              {logo.lines?.[0]}
            </text>
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fill={from}
              fontFamily={face}
              fontSize="12.5"
              fontWeight="700"
              letterSpacing="0.8"
            >
              {logo.lines?.[1]}
            </text>
            <text
              x="50"
              y="72"
              textAnchor="middle"
              dominantBaseline="central"
              fill={logo.fg}
              fontFamily={FACE.grotesk}
              fontSize="6.5"
              fontWeight="600"
              letterSpacing="1.8"
              opacity="0.7"
            >
              EST 1998
            </text>
          </>
        )}

        {/* Light icons need a hairline or they float on a dark wallpaper. */}
        <path d={SQUIRCLE_100} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />
      </g>
    </svg>
  )
}
