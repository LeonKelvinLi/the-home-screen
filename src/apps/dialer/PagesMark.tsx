/**
 * The BEASTY PAGES mark: Biggie on a yellow sheet, with the directory behind him.
 *
 * Drawn rather than shipped as a picture, because everything the operator has
 * asked to have changed here has been geometry, and geometry baked into a PNG
 * has to be redrawn by hand at every size it is ever used at.
 *
 *   "the line around the tile goes completely around without that missing space"
 *   "the page fold isn't as symmetrical to the corner"
 *   "design this in a way so that there is another page behind it like a
 *    scrollable yellow pages like how it existed in the back end"
 *
 * All three are answered by construction below rather than by eye. The last one
 * is what turned this from a tile into a STACK, and it pays for itself: the cut
 * corner now reveals the sheet behind rather than revealing nothing, so the
 * fold and the stack stopped being two ideas and became one.
 *
 * Biggie has died; the dog on this screen is a memorial, not a mascot, which is
 * worth knowing before anyone edits that artwork.
 */

/**
 * Three sheets, each SHEET across, each STEP up and to the right of the one in
 * front of it — so the whole stack still fills the 100x100 the mark is drawn in.
 *
 * Up and to the RIGHT specifically, because that is where the front sheet's
 * corner is turned. A stack offset any other way would show its slivers on an
 * edge the fold does nothing with, and the two devices would just be two
 * devices. This way the fold opens onto the page behind it.
 */
const SHEETS = 3
const STEP = 6
const SHEET = 100 - STEP * (SHEETS - 1)

/** Corner radius, in proportion to a sheet rather than to the whole mark. */
const R = SHEET * 0.22

/**
 * How far the fold reaches from the corner along BOTH edges, which is the whole
 * of what "symmetrical to the corner" means here.
 *
 * The cut runs from A on the top edge to B on the right edge, each exactly F
 * from the corner, so A and B are mirror images across that corner's own
 * 45-degree diagonal. The fold is symmetric BY CONSTRUCTION — one number used
 * twice, no eyeballed control point that can drift, true at every size.
 *
 * 22.5% is HIS size, measured off public/icons/beasty-pages-mark.png rather
 * than chosen, and measuring it is what found the thing he was pointing at: his
 * fold reaches 22.3% along the top edge and 22.7% down the right. Four parts in
 * a thousand, invisible until you look for it, and he looked for it.
 */
const F = SHEET * 0.225

/** Where each sheet's top-left corner sits. Index 0 is the front one. */
const originOf = (i: number) => ({ x: STEP * i, y: STEP * (SHEETS - 1 - i) })

/**
 * One sheet as a single closed path, corner cut included.
 *
 * ONE path is the fix for the missing space in the outline. The version he was
 * looking at was a rounded rectangle with a triangle laid over its corner: two
 * shapes, so the stroke ran round the rectangle and stopped dead where the
 * triangle began, leaving the fold's own edge bare. Here the diagonal IS a
 * segment of the outline, so a single stroke travels the entire silhouette and
 * closes on itself. There is no seam left to leave open.
 *
 * `cut` is false for the sheets behind: only the top one is dog-eared. Three
 * folded corners would read as three separate marks rather than one directory.
 */
function sheetPath(i: number, cut: boolean): string {
  const { x, y } = originOf(i)
  const r = x + SHEET
  const b = y + SHEET
  return [
    `M ${x + R} ${y}`,
    cut ? `H ${r - F}` : `H ${r - R}`,
    cut ? `L ${r} ${y + F}` : `A ${R} ${R} 0 0 1 ${r} ${y + R}`,
    `V ${b - R}`,
    `A ${R} ${R} 0 0 1 ${r - R} ${b}`,
    `H ${x + R}`,
    `A ${R} ${R} 0 0 1 ${x} ${b - R}`,
    `V ${y + R}`,
    `A ${R} ${R} 0 0 1 ${x + R} ${y}`,
    'Z',
  ].join(' ')
}

/**
 * The turned-down corner of the front sheet, lying inside it along the cut.
 *
 * Its third point is the corner reflected across the cut, which for a cut
 * meeting both edges at F lands exactly on that corner's diagonal — so the flap
 * is its own mirror image, for any F.
 */
function foldPath(): string {
  const { x, y } = originOf(0)
  const r = x + SHEET
  return `M ${r - F} ${y} L ${r} ${y + F} L ${r - F} ${y + F} Z`
}

/**
 * Biggie is 355x520, placed to match the operator's own mark rather than to my
 * taste — his file is public/icons/beasty-pages-mark.png and these are measured
 * off it: 23.4% to 70.7% across, 17.2% to 86.4% down. That height at Biggie's
 * aspect gives 47.1 wide against the 47.3 measured off his art, which is the
 * confirmation the numbers are read and not guessed.
 *
 * Proportions of a SHEET, not of the mark, so he keeps his place on the front
 * page now that the page is smaller than the whole drawing.
 */
const DOG_H = SHEET * 0.69
const DOG_W = (DOG_H * 355) / 520
const DOG_X = originOf(0).x + SHEET * 0.234
const DOG_Y = originOf(0).y + SHEET * 0.172

export function PagesMark({ className }: { className?: string }) {
  /* Back to front, so each sheet laps over the one behind it. */
  const behind = Array.from({ length: SHEETS - 1 }, (_, k) => SHEETS - 1 - k)

  return (
    /*
      Padded by 3 on every side so the stroke has somewhere to live. A stroke
      straddles its own path, so in a bare 0 0 100 100 box the outer half of it
      falls outside the viewport: the edges render at half the weight of the
      diagonal, which reads as precisely the kind of unfinished being complained
      about.
    */
    <svg className={className} viewBox="-3 -3 106 106" role="img" aria-label="BEASTY PAGES">
      <defs>
        <linearGradient id="pm-tile" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFE85C" />
          <stop offset="1" stopColor="#F0C000" />
        </linearGradient>
        {/* The sheets behind sit in the front one's shadow, and further back is
            further down. Two stops rather than a flat fill so a deep stack does
            not read as a flat band of colour. */}
        <linearGradient id="pm-back" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#E8CA3A" />
          <stop offset="1" stopColor="#C79E00" />
        </linearGradient>
        {/* The underside of a turned page catches least light at the tip. */}
        <linearGradient id="pm-fold" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2A30" />
          <stop offset="1" stopColor="#0B0B0D" />
        </linearGradient>
        {/* Keeps the dog off the fold and off the rounded corners. */}
        <clipPath id="pm-clip">
          <path d={sheetPath(0, true)} />
        </clipPath>
      </defs>

      {behind.map((i) => (
        <path
          key={i}
          d={sheetPath(i, false)}
          fill="url(#pm-back)"
          stroke="#0B0B0D"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
      ))}

      <path d={sheetPath(0, true)} fill="url(#pm-tile)" />

      <image
        href="/biggie.webp"
        x={DOG_X}
        y={DOG_Y}
        width={DOG_W}
        height={DOG_H}
        clipPath="url(#pm-clip)"
        preserveAspectRatio="xMidYMid meet"
      />

      <path d={foldPath()} fill="url(#pm-fold)" />

      {/*
        The outline goes on LAST and unfilled, so it sits over the sheet, the
        dog and the flap and reads as one unbroken line the whole way round —
        including along the cut, which is the part that was missing.
      */}
      <path
        d={sheetPath(0, true)}
        fill="none"
        stroke="#0B0B0D"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path d={foldPath()} fill="none" stroke="#0B0B0D" strokeWidth="3.4" strokeLinejoin="round" />
    </svg>
  )
}
