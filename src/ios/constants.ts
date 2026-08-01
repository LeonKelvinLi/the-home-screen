/** iPhone 15 Pro logical viewport. Everything in the shell is derived from this. */
export const SCREEN_W = 393
export const SCREEN_H = 852

/** Corner radius of the display itself, and of an app icon (iOS squircle ratio). */
export const SCREEN_RADIUS = 47
export const ICON_RADIUS_RATIO = 0.2237

export const ICON_SIZE = 60
export const GRID_COLS = 4
export const GRID_ROWS = 6

export const STATUS_H = 54
export const HOME_INDICATOR_H = 34

/**
 * Apple's transition curve. Not a real spring, but it is the curve UIKit's
 * sheet and app-open animations read as, and it stays GPU-composited.
 */
export const EASE_IOS = 'cubic-bezier(0.32, 0.72, 0, 1)'
export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

export const OPEN_MS = 420
export const CLOSE_MS = 380
export const PAGE_MS = 340

/** Distance a swipe must travel before it commits instead of snapping back. */
export const PAGE_COMMIT_PX = 70
export const DISMISS_COMMIT_PX = 90
/** Above this upward velocity (px/ms) a short swipe still goes home. */
export const DISMISS_VELOCITY = 0.55
/** Below this velocity at release, an upward swipe opens the app switcher. */
export const SWITCHER_VELOCITY = 0.12
