import { GLYPHS } from '../data/glyphs'
import type { GlyphName } from '../data/glyphs'

/**
 * Stand-in for a dish photo.
 *
 * Repeating the brand logo on every row reads as an unfinished placeholder, so
 * each item gets its own glyph — matched on keyword where the dish name says
 * what it is, hashed otherwise — over a shade of the brand's own colour. When
 * kitchens upload real photos this component takes an `imageUrl` and nothing
 * else changes.
 */

const KEYWORDS: [RegExp, GlyphName][] = [
  [/burger|patty|smash|cheeseburger/i, 'burger'],
  [/taco|birria|quesabirria|nopales|pastor|asada/i, 'taco'],
  [/wing|tender|drumstick/i, 'wing'],
  [/chicken|bird|cutlet|nashville/i, 'chicken'],
  [/pizza|slice|pie|grandma|pepperoni/i, 'pizza'],
  [/ramen|pho|noodle|gyoza|tonkotsu|miso|shoyu/i, 'noodles'],
  [/coffee|latte|cortado|americano|espresso|brew|cà phê/i, 'coffee'],
  [/roll|cookie|bun|donut|pastry|cake|pie/i, 'donut'],
  [/waffle/i, 'waffle'],
  [/cone|soft serve|sundae|ice cream|cream/i, 'softserve'],
  [/shrimp|prawn/i, 'shrimp'],
  [/fish|ahi|salmon|poke|mahi|ceviche|musubi/i, 'fish'],
  [/sandwich|mì|banh|sub|italian|club|deli|philly/i, 'sandwich'],
  [/vegan|tofu|collard|salad|slaw|veg|leaf|celery/i, 'leaf'],
  [/hot|spicy|flame|chili/i, 'flame'],
  [/tea|boba|horchata|coconut|soda|shake|matcha/i, 'coffee'],
]

const POOL: GlyphName[] = ['chef', 'burger', 'noodles', 'taco', 'leaf', 'donut', 'fish', 'pizza']

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function glyphFor(name: string, desc = ''): GlyphName {
  const hay = `${name} ${desc}`
  for (const [re, g] of KEYWORDS) if (re.test(hay)) return g
  return POOL[hash(name) % POOL.length]
}

export function ItemThumb({
  name,
  desc,
  bg,
  fg,
  size = 78,
  imageUrl,
}: {
  name: string
  desc?: string
  /** Brand background, `a` or `a|b`. */
  bg: string
  fg: string
  size?: number
  /** The vendor's own photo, when one was sourced. */
  imageUrl?: string
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={{ display: 'block', width: size, height: size, objectFit: 'cover' }}
      />
    )
  }

  const glyph = glyphFor(name, desc)
  const [a, b] = bg.split('|')
  const seed = hash(name)
  // Rotate the gradient per item so neighbouring rows never look identical.
  const angle = 120 + (seed % 5) * 24
  const gid = `it-${seed.toString(36)}`

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} gradientTransform={`rotate(${angle} 0.5 0.5)`}>
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b ?? a} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <rect width="100" height="100" fill="#000" opacity={(seed % 3) * 0.05} />
      <g fill={fg} opacity="0.92" transform="translate(50 50) scale(0.72) translate(-50 -50)">
        <path d={GLYPHS[glyph]} />
      </g>
    </svg>
  )
}
