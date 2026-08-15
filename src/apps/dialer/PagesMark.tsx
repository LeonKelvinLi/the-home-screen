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
 * LAYERS INSIDE ONE ICON — not several icons overlapping.
 *
 * The operator's correction: "make it as one icon, like two layers, but still
 * inside one icon." The version before this offset both sheets so their union
 * was a stepped, non-square silhouette; on a home screen full of squircles that
 * reads as a picture OF two icons rather than as one icon.
 *
 * So the BACK sheet is the icon. It fills the whole 100x100 and its rounded
 * square is the outline everything else lives inside. The FRONT sheet is inset
 * from the top and right by STEP, flush left and bottom, which leaves the back
 * one showing as an edge along two sides — layered, but never breaking the
 * single rounded-square boundary.
 *
 * Inset on the TOP and RIGHT specifically, because that is the corner the front
 * sheet's fold turns. The fold then opens onto the layer behind it instead of
 * onto nothing, which is what ties the two devices into one mark.
 */
const STEP = 5

/**
 * THREE layers: the page, and two behind it — his 13:00 note, "can you put two
 * yellow pages behind the front one, just make them somewhat closer to each
 * other". STEP came down from 8 to 5 for the "closer" half of that.
 *
 * The backmost layer fills the full 100x100 and IS the icon's silhouette; each
 * one in front is inset a further STEP from the top and right, flush left and
 * bottom. So the stack lives entirely INSIDE one rounded square — the earlier
 * version offset them outward and the union came out stepped and non-square,
 * which on a screen full of squircles reads as a picture of three icons rather
 * than as one.
 *
 * Inset on the top and right because that is the corner the front page's fold
 * turns: the fold then opens onto the layer behind it rather than onto nothing.
 */
const LAYERS = 3
const layerAt = (depth: number) => ({
  x: 0,
  y: STEP * depth,
  size: 100 - STEP * depth,
})
/** Depth 0 is the backmost and draws the icon's outline; the last is the page
    the dog and the fold live on. */
const FRONT = layerAt(LAYERS - 1)

/**
 * Corner radius as a proportion of whichever layer is drawn, so an inner page's
 * corners stay in step with the icon's own.
 *
 * SQUARE at the top right on the layers behind — "make the second page have a
 * right angle as well". It is the one corner of theirs anybody sees, and a
 * rounded one there makes them read as more app tiles stacked up. A right angle
 * reads as paper, which is what they are.
 */
const RADIUS = 0.22

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
const F = FRONT.size * 0.225

/**
 * One layer as a single closed path, corner cut included.
 *
 * ONE path is the fix for the missing space in the outline. The version he was
 * looking at was a rounded rectangle with a triangle laid over its corner: two
 * shapes, so the stroke ran round the rectangle and stopped dead where the
 * triangle began, leaving the fold's own edge bare. Here the diagonal IS a
 * segment of the outline, so a single stroke travels the entire silhouette and
 * closes on itself. There is no seam left to leave open.
 *
 * `cut` is false for the back layer: only the front page is dog-eared. Two
 * folded corners would read as two marks rather than one page on another.
 */
function sheetPath(layer: { x: number; y: number; size: number }, cut: boolean): string {
  const { x, y, size } = layer
  const rad = size * RADIUS
  const r = x + size
  const b = y + size
  return [
    `M ${x + rad} ${y}`,
    cut ? `H ${r - F}` : `H ${r}`,
    cut ? `L ${r} ${y + F}` : `V ${y}`,
    `V ${b - rad}`,
    `A ${rad} ${rad} 0 0 1 ${r - rad} ${b}`,
    `H ${x + rad}`,
    `A ${rad} ${rad} 0 0 1 ${x} ${b - rad}`,
    `V ${y + rad}`,
    `A ${rad} ${rad} 0 0 1 ${x + rad} ${y}`,
    'Z',
  ].join(' ')
}

/**
 * The turned-down corner of the front page, lying inside it along the cut.
 *
 * Its third point is the corner reflected across the cut, which for a cut
 * meeting both edges at F lands exactly on that corner's diagonal — so the flap
 * is its own mirror image, for any F.
 */
function foldPath(): string {
  const r = FRONT.x + FRONT.size
  return `M ${r - F} ${FRONT.y} L ${r} ${FRONT.y + F} L ${r - F} ${FRONT.y + F} Z`
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
const DOG_H = FRONT.size * 0.69
const DOG_W = (DOG_H * 355) / 520
const DOG_X = FRONT.x + FRONT.size * 0.234
const DOG_Y = FRONT.y + FRONT.size * 0.172

export function PagesMark({ className }: { className?: string }) {
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
        {/* The page behind, as a FLAT tone. It was a gradient while there were
            two of them, which is what made the mark read as a perspective
            drawing of a stack rather than as an icon — shading is what says
            "three-dimensional". One flat shade under the front sheet's gradient
            says "there is another page" and nothing more. */}
        <linearGradient id="pm-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DDB800" />
          <stop offset="1" stopColor="#DDB800" />
        </linearGradient>
        {/* The underside of a turned page catches least light at the tip. */}
        <linearGradient id="pm-fold" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2A30" />
          <stop offset="1" stopColor="#0B0B0D" />
        </linearGradient>
        {/* Keeps the dog off the fold and off the rounded corners. */}
        <clipPath id="pm-clip">
          <path d={sheetPath(FRONT, true)} />
        </clipPath>
      </defs>

      {/* Back to front, so each page laps over the one behind it. The last of
          these is the layer the front page sits directly on. */}
      {Array.from({ length: LAYERS - 1 }, (_, d) => (
        <path
          key={d}
          d={sheetPath(layerAt(d), false)}
          fill="url(#pm-back)"
          stroke="#0B0B0D"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
      ))}

      <path d={sheetPath(FRONT, true)} fill="url(#pm-tile)" />

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
        d={sheetPath(FRONT, true)}
        fill="none"
        stroke="#0B0B0D"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path d={foldPath()} fill="none" stroke="#0B0B0D" strokeWidth="3.4" strokeLinejoin="round" />
    </svg>
  )
}
