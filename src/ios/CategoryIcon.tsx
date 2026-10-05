import { CATEGORY_GLYPHS } from '../data/categoryGlyphs'

/**
 * A BEASTY category as a tile: a square of the category page's own background
 * with its line drawing on top. Fills whatever box it is put in, like SlotIcon.
 */
export function CategoryIcon({ kind, thumb }: { kind: string; thumb: string | null }) {
  const g = CATEGORY_GLYPHS[kind]
  return (
    <span className="cat-icon" aria-hidden="true" style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}>
      {g && (
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
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
      : '/wallpapers/cat-beasty-thumb.webp'
