import type { CSSProperties } from 'react'
import { CATEGORY_GLYPHS } from '../data/categoryGlyphs'
import { SQUIRCLE_100 } from './squircle'

/*
  The squircle every other icon on the home screen wears (BrandLogo clips to
  the same path), as a mask so it scales to whatever box the tile sits in: the
  66px grid, Search's 44px list. Leon, 2026-10-10: "add radius on the
  categories icons, improve the look". A mask, not a clip-path in px, and not
  border-radius: a rounded rect beside the squircles would give it away.
*/
const MASK = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${SQUIRCLE_100}'/></svg>`)}")`

/* The plain BEASTY background is the home screen's own wallpaper, so a tile
   cut from it reads as a hole in the screen. Those get a deeper tint. */
const PLAIN = '/wallpapers/cat-beasty-thumb.webp'

/**
 * A BEASTY category as a tile: a squircle of the category page's own background
 * with its line drawing on top, a glass sheen and a hairline edge. Fills
 * whatever box it is put in, like SlotIcon.
 */
export function CategoryIcon({ kind, thumb }: { kind: string; thumb: string | null }) {
  const g = CATEGORY_GLYPHS[kind]
  const style: CSSProperties = { maskImage: MASK, WebkitMaskImage: MASK }
  if (thumb) style.backgroundImage = thumb === PLAIN ? `linear-gradient(rgba(12, 12, 16, 0.5), rgba(12, 12, 16, 0.5)), url(${thumb})` : `url(${thumb})`
  return (
    <span className="cat-icon" aria-hidden="true" style={style}>
      <svg className="cat-icon-edge" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={SQUIRCLE_100} vectorEffect="non-scaling-stroke" />
      </svg>
      {g && (
        <svg className="cat-icon-glyph" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {g.paths.map((d) => (
            <path key={d} d={d} />
          ))}
          {g.dots?.map(([cx, cy, r]) => (
            <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} fill="#fff" stroke="none" />
          ))}
        </svg>
      )}
    </span>
  )
}

/** The small square of a page's background that stands for it. */
export const thumbFor = (page: { kind: string; wall?: string; yellow?: true }): string =>
  page.wall
    ? page.wall.replace(/\.webp$/, '-thumb.webp')
    : page.yellow
      ? '/wallpapers/cat-yellow-thumb.webp'
      : PLAIN
