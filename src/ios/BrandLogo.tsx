import { GLYPHS } from '../data/glyphs'
import { SQUIRCLE_100 } from './squircle'
import { readableOn } from './contrast'
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
  // Roboto Slab and Great Vibes were shipped as webfonts and never used by
  // any brand — 208 KB for a code path nothing reaches. These now fall back to
  // faces every device already has, so the option still works without a
  // download.
  slab: 'Rockwell, Georgia, "Times New Roman", serif',
  script: '"Snell Roundhand", "Apple Chancery", "Segoe Script", cursive',
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
  /** Rendered pixel size. Ignored when `fill` is set. */
  size?: number
  /** Icon tiles get the squircle; in-app headers can render the mark alone. */
  masked?: boolean
  /**
   * Stretch to the parent instead of `size`. Only the home grid wants this,
   * where the tile edge changes with the device class. Applying it globally
   * made every in-list logo resolve 100% against its flex row — a 44px mark
   * rendered at 337px and overflowed the screen.
   */
  fill?: boolean
}

export function BrandLogo({ logo, size = 60, masked = true, fill = false }: Props) {
  const { from, to, flat } = parseBg(logo.bg)
  const id = uid(logo)
  const face = FACE[logo.face ?? 'grotesk']
  const accent = logo.accent ?? logo.fg
  const clip = `clip-${id}`
  const grad = `grad-${id}`
  /*
    A monogram with no strapline was still laying out for one: the initials sat
    at y=47 with a rule under them at y=68 and nothing below, so the mark rode
    high in a tile that looked a third empty. Hybrid Workz and Alli's Dog
    Walking both render this way.
  */
  const strapline = logo.lines?.[0]
  /* Two initials at 40 ran nearly edge to edge, against this file's own rule
     that a mark sits ON the tile with margin. */
  const initialSize = (logo.initials?.length ?? 0) > 2 ? 30 : 34
  /* The hairline exists to give a tile an edge against the wallpaper. A dark
     tile on a dark wallpaper got a BLACK hairline and therefore no edge at all,
     which is what made POD DTG's black artwork read as floating letters. */
  const edge = readableOn(logo.bg).isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={
        fill
          ? { display: 'block', overflow: 'visible', width: '100%', height: '100%' }
          : { display: 'block', overflow: 'visible' }
      }
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
              y={strapline ? 45 : 48}
              textAnchor="middle"
              dominantBaseline="central"
              fill={logo.fg}
              fontFamily={face}
              fontSize={initialSize}
              fontWeight="800"
              letterSpacing="-1.5"
            >
              {logo.initials}
            </text>
            {/* The rule reads as a divider ABOVE a strapline. With nothing under
                it, it is just a dash floating in empty space — so it goes. */}
            {strapline ? (
              <>
                <rect x="34" y="66" width="32" height="2.5" rx="1.25" fill={accent} opacity="0.9" />
                <text
                  x="50"
                  y="79"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={accent}
                  fontFamily={FACE.grotesk}
                  fontSize="7.5"
                  fontWeight="700"
                  letterSpacing="1.6"
                  opacity="0.85"
                >
                  {strapline}
                </text>
              </>
            ) : (
              <rect x="40" y="67" width="20" height="2.5" rx="1.25" fill={accent} opacity="0.55" />
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
            {/*
              Only a REAL third line renders here. This slot used to print a
              hardcoded "EST 1998" as filler flavour — which was fine when the
              template only ever drew invented scaffold brands, and became a
              fabricated founding date on real businesses the moment the band
              was used for actual ones. Meadowlark's real "EST. 1919" belongs
              here; nobody else's fiction does.
            */}
            {logo.lines?.[2] && (
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
                {logo.lines[2]}
              </text>
            )}
          </>
        )}

        {/* Every tile needs an edge against the wallpaper — see `edge` above. */}
        <path d={SQUIRCLE_100} fill="none" stroke={edge} strokeWidth="1" />
      </g>
    </svg>
  )
}
