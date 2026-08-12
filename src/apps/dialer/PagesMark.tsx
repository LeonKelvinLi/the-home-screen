/**
 * The BEASTY PAGES mark: Biggie on a yellow tile with the corner turned down.
 *
 * Drawn rather than shipped as a picture, because the two things the operator
 * asked to have fixed are both geometry, and geometry baked into a PNG has to
 * be redrawn by hand at every size it is ever used at.
 *
 *   "Can you design it where the line around the tile goes completely around
 *    without that missing space. Also the page fold isn't as symmetrical to the
 *    corner if you can look closely and see."
 *
 * Both are answered by construction below rather than by eye — see TILE and
 * FOLD.
 *
 * Biggie has died; the dog on this screen is a memorial, not a mascot, which is
 * worth knowing before anyone edits that artwork.
 */

/** Corner radius, in the 100x100 square the mark is drawn in. */
const R = 22

/**
 * How far the fold reaches from the corner along BOTH edges, which is the whole
 * of what "symmetrical to the corner" means here.
 *
 * The cut runs from A on the top edge to B on the right edge, each exactly F
 * from the corner, so A and B are mirror images across the corner's own
 * 45-degree diagonal. The fold is then symmetric BY CONSTRUCTION: one number
 * used twice, no eyeballed control point that can drift, and it holds at every
 * size the mark is ever drawn at.
 *
 * 22.5 is HIS size, measured off public/icons/beasty-pages-mark.png rather than
 * chosen — and measuring it is what found the thing he was pointing at. His
 * fold reaches 22.3% along the top edge and 22.7% down the right. Four parts in
 * a thousand, invisible until you look for it, and he looked for it. One number
 * used twice cannot do that.
 */
const F = 22.5

/** A, where the cut leaves the top edge. */
const AX = 100 - F
/** B, where the cut meets the right edge. */
const BY = F

/*
  ONE path for the whole tile, corner cut included — the fix for the missing
  space in the outline.

  The version the operator was looking at was a rounded rectangle with a
  triangle laid over its corner: two shapes, so the stroke ran round the
  rectangle and stopped dead where the triangle started, leaving the fold's own
  edge bare. That is the gap he spotted. Here the diagonal IS a segment of the
  outline, so one stroke travels the entire silhouette and closes on itself.
  There is no seam left to leave open.
*/
const TILE = [
  `M ${R} 0`,
  `H ${AX}`, //                        top edge, stopping at A
  `L 100 ${BY}`, //                    the cut, A down to B
  `V ${100 - R}`, //                   right edge
  `A ${R} ${R} 0 0 1 ${100 - R} 100`,
  `H ${R}`, //                         bottom edge
  `A ${R} ${R} 0 0 1 0 ${100 - R}`,
  `V ${R}`, //                         left edge
  `A ${R} ${R} 0 0 1 ${R} 0`,
  'Z',
].join(' ')

/*
  The turned-down corner, lying inside the tile along the cut.

  Its third point D is the corner reflected across the cut, which for a cut
  meeting both edges at F comes out at exactly (100 - F, F). So D sits ON the
  corner's diagonal with A and B equidistant either side of it, and the flap is
  its own mirror image — the property he asked for, true for any F.
*/
const FOLD = `M ${AX} 0 L 100 ${BY} L ${AX} ${BY} Z`

/**
 * Biggie is 355x520, placed to match the operator's own mark rather than to my
 * taste — his file is in public/icons/beasty-pages-mark.png and these numbers
 * are measured off it.
 *
 * His dog occupies 23.4% to 70.7% across and 17.2% to 86.4% down. That is 69
 * tall, which at Biggie's aspect gives 47.1 wide against the 47.3 measured off
 * his art — the same artwork at the same scale, which is the confirmation the
 * measurement is right rather than a coincidence of two eyeballed numbers.
 *
 * NOT centred: he sits about three units left of it. That is deliberate in his
 * drawing and it works, because the turned corner takes visual weight out of
 * the top right and the dog leans back against it. Centring him by arithmetic
 * made the tile look like it was falling to the right.
 */
const DOG_H = 69
const DOG_W = (DOG_H * 355) / 520
const DOG_X = 23.4
const DOG_Y = 17.2

export function PagesMark({ className }: { className?: string }) {
  return (
    /*
      Padded by 3 on every side so the stroke has somewhere to live. A stroke
      straddles its own path, so in a bare 0 0 100 100 box the outer half of it
      falls outside the viewport: the four edges render at half the weight of
      the diagonal, which reads as precisely the kind of unfinished being
      complained about.
    */
    <svg className={className} viewBox="-3 -3 106 106" role="img" aria-label="BEASTY PAGES">
      <defs>
        <linearGradient id="pm-tile" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFE85C" />
          <stop offset="1" stopColor="#F0C000" />
        </linearGradient>
        {/* The underside of a turned page catches least light at the tip. */}
        <linearGradient id="pm-fold" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2A30" />
          <stop offset="1" stopColor="#0B0B0D" />
        </linearGradient>
        {/* Keeps the dog off the fold and off the rounded corners. */}
        <clipPath id="pm-clip">
          <path d={TILE} />
        </clipPath>
      </defs>

      <path d={TILE} fill="url(#pm-tile)" />

      <image
        href="/biggie.webp"
        x={DOG_X}
        y={DOG_Y}
        width={DOG_W}
        height={DOG_H}
        clipPath="url(#pm-clip)"
        preserveAspectRatio="xMidYMid meet"
      />

      <path d={FOLD} fill="url(#pm-fold)" />

      {/*
        The outline goes on LAST and unfilled, so it sits over both the tile and
        the dog and reads as one unbroken line the whole way round — including
        along the cut, which is the part that was missing.
      */}
      <path
        d={TILE}
        fill="none"
        stroke="#0B0B0D"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      {/* The fold's two straight edges, so the turned corner has an edge of its
          own rather than floating as a dark shape inside the tile. */}
      <path
        d={FOLD}
        fill="none"
        stroke="#0B0B0D"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
