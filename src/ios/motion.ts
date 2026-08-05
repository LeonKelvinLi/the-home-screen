/**
 * Reduced motion, for the animations CSS cannot reach.
 *
 * The stylesheet collapses every CSS animation and transition under
 * `prefers-reduced-motion`, but the shell's app launch is a JS tween driven on
 * requestAnimationFrame — a media query does nothing to it. Without this, a
 * user who asked the system for less motion still watched a 420ms scale every
 * time they opened an app, and a 380ms one every time they left.
 *
 * Read live rather than cached: the setting can change mid-session, and on iOS
 * it flips whenever Low Power Mode does.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * How long to actually animate for.
 *
 * Collapses to a single millisecond rather than zero: the tween divides
 * elapsed time by its duration, and a zero there produces NaN on the very
 * first frame — which lands a NaN transform on the window before it settles.
 */
export function motionMs(ms: number): number {
  return prefersReducedMotion() ? 1 : ms
}
