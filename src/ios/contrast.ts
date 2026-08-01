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
export function readableOn(bg: string): { fg: string; dim: string; isDark: boolean } {
  const parts = bg.split('|')
  const avg = parts.reduce((s, p) => s + luminance(p), 0) / parts.length
  // 0.42 rather than 0.5: white text needs a darker background than black text
  // needs a light one, because of how luminance is weighted.
  const isDark = avg < 0.42
  return isDark
    ? { fg: '#ffffff', dim: 'rgba(255,255,255,0.78)', isDark: true }
    : { fg: '#141416', dim: 'rgba(20,20,22,0.66)', isDark: false }
}
