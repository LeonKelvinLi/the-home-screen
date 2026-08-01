/**
 * iOS app-icon silhouette.
 *
 * iOS does not use a rounded rectangle. It uses a superellipse (a "squircle"),
 * where the straight edge flows into the corner continuously instead of meeting
 * an arc at a tangent point. Side by side with `border-radius` the difference is
 * obvious — the rounded-rect corner looks pinched. This is the single biggest
 * reason a web home screen reads as fake.
 *
 *   |x/a|^n + |y/b|^n = 1,  n ≈ 4.6 matches Apple's shape closely.
 */

export function squirclePath(size = 100, n = 4.6, steps = 96): string {
  const r = size / 2
  const pts: string[] = []

  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    // Signed power keeps the curve in the right quadrant.
    const x = r + Math.sign(c) * Math.abs(c) ** (2 / n) * r
    const y = r + Math.sign(s) * Math.abs(s) ** (2 / n) * r
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(3)} ${y.toFixed(3)}`)
  }

  return `${pts.join('')}Z`
}

/** Cached — every icon on the grid shares one geometry. */
export const SQUIRCLE_100 = squirclePath(100)
