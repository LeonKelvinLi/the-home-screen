import { ICON_RADIUS_RATIO, SCREEN_H, SCREEN_RADIUS, SCREEN_W } from './constants'
import type { IconRect } from './AppIcon'

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

export function collapsed(origin: IconRect): WindowTransform {
  const s = origin.size / SCREEN_W
  const left = origin.left
  const top = origin.top + origin.size / 2 - (SCREEN_H * s) / 2
  return {
    transform: `translate3d(${left}px, ${top}px, 0) scale(${s})`,
    // Rendered radius is multiplied by the scale, so divide it back out.
    borderRadius: (origin.size * ICON_RADIUS_RATIO) / s,
    opacity: 0,
  }
}

export const expanded: WindowTransform = {
  transform: 'translate3d(0px, 0px, 0) scale(1)',
  borderRadius: SCREEN_RADIUS,
  opacity: 1,
}

/** p=0 is fully open, p=1 is fully collapsed onto the icon. */
export function lerp(origin: IconRect, p: number): WindowTransform {
  const c = collapsed(origin)
  const s = origin.size / SCREEN_W
  const left = origin.left
  const top = origin.top + origin.size / 2 - (SCREEN_H * s) / 2

  const sc = 1 + (s - 1) * p
  const tx = left * p
  const ty = top * p
  return {
    transform: `translate3d(${tx}px, ${ty}px, 0) scale(${sc})`,
    borderRadius: SCREEN_RADIUS + (c.borderRadius - SCREEN_RADIUS) * p,
    // Content only starts fading in the last third of the collapse.
    opacity: p > 0.66 ? 1 - (p - 0.66) / 0.34 : 1,
  }
}
