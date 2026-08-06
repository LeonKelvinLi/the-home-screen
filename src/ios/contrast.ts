/**
 * Pick legible text for an arbitrary brand colour.
 *
 * Brand pages tint their header with the logo's own background, and the text
 * was hardcoded white. Once the catalogue included light plates that gave
 * white-on-white: measured 1.00:1 on several brands, so the name, rating and
 * tagline were simply invisible. Vendors choose their own colours, so this has
 * to be computed, never assumed.
 */

function channel(hex: string, from: number): number {
  const v = parseInt(hex.slice(from, from + 2), 16) / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(color: string): number {
  let hex = color.trim().replace('#', '')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  if (hex.length < 6) return 0
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 2) + 0.0722 * channel(hex, 4)
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Foreground for a tint, chosen by whichever of near-black / white actually
 * contrasts better. Takes `a|b` gradient pairs and averages them, since the
 * header is a gradient across both.
 */
const INK = '#141416'

/*
  The luminance at which white and INK contrast EQUALLY against a background.

  Solve contrast(white, L) = contrast(INK, L):
    1.05 / (L + 0.05) = (L + 0.05) / (Link + 0.05)
    L = sqrt(1.05 * (Link + 0.05)) - 0.05  ~= 0.195

  The old threshold was a hand-picked 0.42, justified by a claim about how
  luminance is weighted that does not hold: everything between 0.195 and 0.42
  was given WHITE text when near-black contrasts better, and mid-tone brand
  colours land squarely in that band. Measured on the catalogue, DingDongtogo's
  orange gave white text at 3.04:1 where near-black gives 6.05:1; Masa 3.19 vs
  5.78; Vegan Mob 3.45 vs 5.33. All three were under the 4.5:1 minimum and all
  three clear it comfortably the other way round. Derive it, do not guess it.
*/
const CROSSOVER = Math.sqrt(1.05 * (luminance(INK) + 0.05)) - 0.05

export function readableOn(bg: string): { fg: string; dim: string; isDark: boolean } {
  const parts = bg.split('|')
  const avg = parts.reduce((s, p) => s + luminance(p), 0) / parts.length
  const isDark = avg < CROSSOVER
  /*
    The dim variants are deliberately close to the solid one. They are re-dimmed
    downstream — .brand-tagline sets opacity 0.82 and .brand-meta 0.8 — so a
    0.66 dim was really landing near 0.53, which is where the sub-3:1 taglines
    came from. Dimming twice is the caller's business; this only has to survive
    it.
  */
  return isDark
    ? { fg: '#ffffff', dim: 'rgba(255,255,255,0.92)', isDark: true }
    : { fg: INK, dim: 'rgba(20,20,22,0.88)', isDark: false }
}
