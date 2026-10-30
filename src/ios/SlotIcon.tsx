import { ICON_SIZE } from './constants'
import { PAGE_ICON_PATH, PAGE_FOLD_SVG } from './pageIcon'

/**
 * An empty slot on the blank home-screen pages.
 *
 * Drawn as a dashed squircle rather than a grey box so it reads as *reserved
 * space in a working system* — the same silhouette as every real icon, just
 * unfilled. A solid placeholder would read as a broken image, which is the
 * opposite of the message: these slots are the pitch to the next food truck.
 *
 * Rendered as ONE background image rather than as inline SVG. Four blank pages
 * put eighty of these on screen, and eighty inline copies is eighty DOM trees
 * of four nodes each, every one rasterised separately into the pager's layer.
 * As a data URI it is a single decoded image the compositor reuses for every
 * tile — same pixels, a fraction of the work.
 */

const svg =
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>` +
  `<path d='${PAGE_ICON_PATH}' fill='rgba(255,255,255,0.09)'/>` +
  `<path d='${PAGE_ICON_PATH}' fill='none' stroke='rgba(255,255,255,0.55)' stroke-width='2.5' stroke-dasharray='7 6' stroke-linecap='round'/>` +
  `<path d='M50 33v34M33 50h34' stroke='rgba(255,255,255,0.75)' stroke-width='5.5' stroke-linecap='round'/>` +
  PAGE_FOLD_SVG +
  `</svg>`

/* Built once at module load. encodeURIComponent rather than base64: it keeps
   the markup readable in devtools and avoids base64's 33% size tax. */
export const SLOT_IMAGE = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

export function SlotIcon({ size = ICON_SIZE, fill = false }: { size?: number; fill?: boolean }) {
  return (
    <span
      className="slot-icon"
      aria-hidden="true"
      style={{
        display: 'block',
        width: fill ? '100%' : size,
        height: fill ? '100%' : size,
        backgroundImage: SLOT_IMAGE,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
