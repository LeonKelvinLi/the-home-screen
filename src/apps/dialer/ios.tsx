/**
 * Original SVG glyphs drawn to read as SF Symbols, for the stock half of the
 * landing dialer.
 *
 * Proportions were measured off a screenshot of the real Phone app; none of
 * Apple's symbol files were traced or copied. Shapes are solid or thickly
 * stroked so they survive being drawn at 26px, and every interior detail is a
 * hole cut with fill-rule evenodd rather than a white shape — these sit on a
 * background that changes colour underneath them.
 */

export type GlyphProps = {
  size?: number;
  color?: string;
};

/** Favorites tab — stands in for star.fill */
export function StarFill({ size = 24, color = "currentColor" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" color={color} aria-hidden="true" focusable="false">
      <path
        d="M12 2.5 14.96 8.92 21.99 9.76 16.79 14.56 18.17 21.49 12 18.04 5.83 21.49 7.21 14.56 2.01 9.76 9.04 8.92Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Recents tab — stands in for clock.fill; the hand is a hole, not a white shape */
export function RecentsClock({ size = 24, color = "currentColor" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" color={color} aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z
           M11.02 6.35a.98.98 0 0 1 1.96 0V12.03a.95.95 0 0 1-.95.95H7.21a.98.98 0 0 1 0-1.96h3.31a.5.5 0 0 0 .5-.5Z"
      />
    </svg>
  );
}

/** Contacts tab — stands in for person.crop.circle.fill; head and shoulders are holes */
export function PersonCircleFill({ size = 24, color = "currentColor" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" color={color} aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z
           M12 5.81a3.55 3.91 0 1 0 0 7.82 3.55 3.91 0 0 0 0-7.82Z
           M5.72 17.72Q12 11.72 18.28 17.72 12 21.72 5.72 17.72Z"
      />
    </svg>
  );
}

/** Keypad tab — stands in for circle.grid.3x3.fill */
export function KeypadGrid({ size = 24, color = "currentColor" }: GlyphProps) {
  const at = [4.65, 12, 19.35];
  const dots = at.flatMap((cy) => at.map((cx) => [cx, cy] as const));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" color={color} aria-hidden="true" focusable="false">
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * Voicemail tab — stands in for voicemail, two reels joined by tape.
 *
 * Rings, not discs. Solid circles plus a bar through the middle gave a
 * silhouette that reads as a dumbbell at 26px; the reels are what make it a
 * voicemail symbol, so they are cut out with evenodd and the tape runs along
 * the bottom tangent rather than through the centre.
 */
export function VoicemailFill({ size = 24, color = "currentColor" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" color={color} aria-hidden="true" focusable="false">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M6.1 6.6a5.4 5.4 0 0 1 4.6 8.2h2.6a5.4 5.4 0 1 1 4.6 2.6H6.1a5.4 5.4 0 0 1 0-10.8Z
           M6.1 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z
           M17.9 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
      />
    </svg>
  );
}

/**
 * Green call button — the handset.
 *
 * IT DID NOT READ AS A PHONE. The old one was a 4.4-wide stroked arc with a
 * rounded rectangle at each end, and at the size this actually renders (34px)
 * the three merged into one fat crescent. The operator's words: "is there
 * anyway you can fix this call button? It looks a little suspicious lol" — and
 * he is right, an unreadable glyph on the one green button that starts
 * everything is worse than no glyph.
 *
 * So it is one filled silhouette now, the shape every phone on earth uses:
 * earpiece, tapered waist, mouthpiece, drawn as a single path so nothing can
 * merge with anything. It stays legible from 20px up.
 */
export function PhoneFill({ size = 24, color = "currentColor" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" color={color} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7.6 3.3c.6-.6 1.6-.6 2.2 0l2.5 2.5c.6.6.6 1.6 0 2.2L10.7 9.6c-.3.3-.4.8-.2 1.2a12 12 0 0 0 4.7 4.7c.4.2.9.1 1.2-.2l1.6-1.6c.6-.6 1.6-.6 2.2 0l2.5 2.5c.6.6.6 1.6 0 2.2l-1.2 1.2c-1 1-2.5 1.4-3.9 1a20.5 20.5 0 0 1-13.6-13.6c-.4-1.4 0-2.9 1-3.9L7.6 3.3Z"
      />
    </svg>
  );
}
