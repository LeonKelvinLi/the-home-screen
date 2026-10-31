import { PAGE_FOLD_DARK } from './pageIcon'

/** Decorative only; it never changes a button's target or accessible name. */
export function PageFold() {
  return (
    <g className="beasty-page-fold" aria-hidden="true" pointerEvents="none">
      <path d={PAGE_FOLD_DARK} fill="#151515" stroke="none" />
    </g>
  )
}
