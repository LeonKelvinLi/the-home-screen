/**
 * The halal mark: the Arabic word حلال on a green disc.
 *
 * His ask of 2026-09-18, on Pizza Gallery: "If we can add this icon onto Pizza
 * galleries page and make this the standard for restaurants that serve Halal.
 * Also make it searchable." The picture he linked was a stock image behind a
 * licence, so this is drawn here instead — the common form of the mark, which
 * is the word itself, not any certifier's logo.
 *
 * It states only what the business says about itself. `dietary: ['Halal']` is
 * set where a business's own pages say halal, and a certification body's seal
 * is never implied: the chip beside it reads "Halal", not "Certified".
 */
export function HalalMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="halal-mark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="16" fill="#1E8C4E" />
      <circle cx="16" cy="16" r="13.2" fill="none" stroke="#FFFFFF" strokeWidth="1.3" />
      <text
        x="16"
        y="19.6"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#FFFFFF"
        fontFamily="'Geeza Pro', 'Noto Naskh Arabic', 'Arial', sans-serif"
      >
        حلال
      </text>
    </svg>
  )
}

/** True when a business's own dietary line says halal. */
export const isHalal = (dietary?: string[]) => !!dietary?.some((d) => /^halal$/i.test(d.trim()))
