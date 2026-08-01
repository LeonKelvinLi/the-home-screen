import { ICON_RADIUS_RATIO, SCREEN_RADIUS } from './constants'
import type { IconRect } from './AppIcon'
import type { ScreenSize } from './ScreenSize'

/**
 * Geometry for the app-open animation.
 *
 * iOS does not scale an app out of the icon's square — it scales it out of a
 * *screen-shaped* rect centred on the icon, and cross-fades the icon artwork on
 * top. Doing the same is what stops the content looking squashed on the way up.
 */

export interface WindowTransform {
  transform: string
  borderRadius: number
  opacity: number
}

function geometry(origin: IconRect, screen: ScreenSize) {
  const s = origin.width / screen.w
  return {
    s,
    left: origin.left,
    top: origin.top + origin.height / 2 - (screen.h * s) / 2,
  }
}

export function collapsed(origin: IconRect, screen: ScreenSize): WindowTransform {
  const { s, left, top } = geometry(origin, screen)
  return {
    transform: `translate3d(${left}px, ${top}px, 0) scale(${s})`,
    // Rendered radius is multiplied by the scale, so divide it back out.
    borderRadius: (origin.width * ICON_RADIUS_RATIO) / s,
    opacity: 0,
  }
}

export const expanded: WindowTransform = {
  transform: 'translate3d(0px, 0px, 0) scale(1)',
  borderRadius: SCREEN_RADIUS,
  opacity: 1,
}

/** p=0 is fully open, p=1 is fully collapsed onto the icon. */
export function lerp(origin: IconRect, screen: ScreenSize, p: number): WindowTransform {
  const { s, left, top } = geometry(origin, screen)

  const sc = 1 + (s - 1) * p
  return {
    transform: `translate3d(${left * p}px, ${top * p}px, 0) scale(${sc})`,
    /*
      Interpolate the RENDERED radius, then divide by the current scale.
      Lerping the pre-division value instead left the corner up to 31% too
      round through the middle of the collapse — correct only at the endpoints,
      which is exactly where it is hardest to notice and easiest to ship.
    */
    borderRadius:
      (SCREEN_RADIUS * (1 - p) + origin.width * ICON_RADIUS_RATIO * p) / sc,
    // Content only starts fading in the last third of the collapse.
    opacity: p > 0.66 ? 1 - (p - 0.66) / 0.34 : 1,
  }
}
