import { PAGE_FOLD_DARK, PAGE_FOLD_LIGHT } from './pageIcon'

/** Decorative only; it never changes a button's target or accessible name. */
export function PageFold() {
  return (
    <g className="beasty-page-fold" aria-hidden="true" pointerEvents="none">
      <path d={PAGE_FOLD_DARK} fill="#151515" stroke="none" />
      <path d={PAGE_FOLD_LIGHT} fill="#fff" stroke="#151515" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  )
}
