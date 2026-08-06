/** iPhone 15 Pro logical viewport. Everything in the shell is derived from this. */
export const SCREEN_W = 393
export const SCREEN_H = 852

/** Corner radius of the display itself, and of an app icon (iOS squircle ratio). */
export const SCREEN_RADIUS = 47

/**
 * The widest viewport still treated as a phone. Must stay in step with the
 * `@media (max-width: 480px)` block in styles.css — they were 700 and 480, and
 * the band between them rendered a phone grid inside tablet chrome.
 */
export const PHONE_MAX = 481
export const ICON_RADIUS_RATIO = 0.2237

export const ICON_SIZE = 60

/**
 * Vertical space BETWEEN icon rows, phone and pad.
 *
 * Kept here rather than only in the stylesheet because HomeScreen has to know
 * it: the number of rows a page holds is computed from the real pitch, and if
 * these two ever disagree the grid either overflows the screen or leaves a row
 * of empty space. They must be changed together.
 *
 * The phone gap was 26, which fitted five rows on a 390x844 screen where iOS
 * fits six. 20 fits six rows at the full 60px tile — twenty-four apps a page,
 * and the icons stay big enough to recognise.
 */
export const ROW_GAP_PHONE = 20
export const ROW_GAP_PAD = 34

/**
 * Everything under the tile in one icon: the gap to the label, plus the label
 * itself. Measured, not guessed — 7px gap and a 13px line.
 */
export const ICON_LABEL_H = 20
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
/**
 * How far a slow drag must travel to turn the page.
 *
 * Was 70px, which is nearly a fifth of a 393px phone — far enough that a
 * one-handed thumb swipe often did not reach it and the page snapped back.
 * 44px is about a thumb's comfortable arc and still well clear of a tap.
 * A flick turns the page at any distance; this only governs a slow drag.
 */
export const PAGE_COMMIT_PX = 44
export const DISMISS_COMMIT_PX = 90
/** Above this upward velocity (px/ms) a short swipe still goes home. */
export const DISMISS_VELOCITY = 0.55
/** Below this velocity at release, an upward swipe opens the app switcher. */
export const SWITCHER_VELOCITY = 0.12

/**
 * The switcher needs a LONGER pull than going home, not a shorter one, plus a
 * pause at the top. Anything less and the switcher swallows every hesitant
 * swipe, which is how this behaved before.
 */
export const SWITCHER_COMMIT_PX = 110
