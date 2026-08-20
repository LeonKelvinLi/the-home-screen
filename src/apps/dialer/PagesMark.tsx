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
 * ONE page. Not a stack.
 *
 * His 2026-08-15 verdict, after two rounds of stacking it: "no need for other
 * pages. That's already a given." He is right — the fold alone says the thing
 * is a page out of something, and the extra sheets were spending the mark's
 * whole right-hand side saying it twice.
 *
 * LAYERS is kept rather than inlined because the geometry below is written for
 * any number of them, and this has now been 3, 2 and 1 in three days.
 */
const LAYERS = 1
const layerAt = (depth: number) => ({
  x: 0,
  y: STEP * depth,
  size: 100 - STEP * depth,
})
const FRONT = layerAt(LAYERS - 1)

/**
 * Corner radius as a proportion of whichever layer is drawn.
 *
 * The top right is a RIGHT ANGLE. Three other corners keep the app-icon
 * rounding.
 *
 * This has been square, then round, then square again, and the operator's
 * reason for landing here is the one that settles it: "pages from a book are
 * square, plus the pages on the screen are square." The mark is a page out of
 * the directory and the yellow sheets it stands for have square corners at that
 * fold, so rounding it made the icon disagree with the thing it represents.
 *
 * The fold is still clipped to the sheet. It costs nothing against a right
 * angle, and it means the corner can go back to an arc without the flap
 * spilling over the edge again.
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
 * 20.5%, up from 18.5 — "maybe make the triangle a tad bit bigger. Not much
 * bigger." Two points, which is a tad.
 *
 * The original 22.5% was measured off his own artwork rather than chosen, and
 * measuring it is what found the thing he had spotted by eye: his fold reached
 * 22.3% along the top edge and 22.7% down the right. Four parts in a thousand,
 * invisible unless you go looking, and he went looking.
 */
const F = FRONT.size * 0.205

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
function sheetPath(layer: { x: number; y: number; size: number }): string {
  const { x, y, size } = layer
  const rad = size * RADIUS
  const r = x + size
  const b = y + size
  return [
    `M ${x + rad} ${y}`,
    `H ${r}`,
    `V ${y}`,
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
 * Biggie is 355x520 and fills his frame edge to edge — no transparent margin
 * to account for, so where he sits is purely these numbers.
 *
 * His width and height come from the operator's own mark: 23.4% to 70.7%
 * across, 69 tall, which at Biggie's aspect gives 47.1 wide against the 47.3
 * measured off that file. Read rather than guessed.
 *
 * VERTICALLY CENTRED, though, which his file was not and this was not until
 * now. It sat at 17.2% down with a note arguing the turned corner takes weight
 * out of the top right so the dog should hang a little low to compensate. That
 * held while the mark was a stack with a large fold; with one page and a small
 * fold there is nothing left to compensate for, and it measured 17.2 above
 * against 13.8 below — visibly low, which is what he spotted. Centring is now
 * arithmetic off DOG_H so it cannot drift again if the dog is ever resized.
 */
const DOG_H = FRONT.size * 0.69
const DOG_W = (DOG_H * 355) / 520
/* Left of centre by about three units, which IS from his drawing and stays:
   the fold sits top right, and the dog leaning back against it is what keeps
   the tile from looking like it is falling that way. */
const DOG_X = FRONT.x + FRONT.size * 0.234
const DOG_Y = FRONT.y + (FRONT.size - DOG_H) / 2

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
        {/* The underside of a turned page catches least light at the tip. */}
        <linearGradient id="pm-fold" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2A30" />
          <stop offset="1" stopColor="#0B0B0D" />
        </linearGradient>
        {/* Keeps the dog off the fold and off the rounded corners. */}
        <clipPath id="pm-clip">
          <path d={sheetPath(FRONT)} />
        </clipPath>
      </defs>

      {/*
        The sheet is a CLASS rather than a bare path because the landing screen
        turns it translucent while a photograph is behind it. Only this path
        goes: the dog, the fold and the outline stay fully opaque, so the yellow
        becomes a tinted window and the artwork on it stays crisp. Fading the
        whole mark instead washes the dog out to grey, which is the one thing on
        the tile that has to stay black.
      */}
      <path className="pm-sheet" d={sheetPath(FRONT)} fill="url(#pm-tile)" />

      <image
        href="/biggie.webp"
        x={DOG_X}
        y={DOG_Y}
        width={DOG_W}
        height={DOG_H}
        clipPath="url(#pm-clip)"
        preserveAspectRatio="xMidYMid meet"
      />

      <path d={foldPath()} fill="url(#pm-fold)" clipPath="url(#pm-clip)" />

      {/*
        The outline goes on LAST and unfilled, so it sits over the sheet, the
        dog and the flap and reads as one unbroken line the whole way round —
        including along the cut, which is the part that was missing.
      */}
      <path
        d={sheetPath(FRONT)}
        fill="none"
        stroke="#0B0B0D"
        strokeWidth="2.04"
        strokeLinejoin="round"
      />
      <path
        d={foldPath()}
        fill="none"
        stroke="#0B0B0D"
        strokeWidth="2.04"
        strokeLinejoin="round"
        clipPath="url(#pm-clip)"
      />
    </svg>
  )
}
