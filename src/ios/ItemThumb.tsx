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

/*
  Non-food matches run FIRST. A water company's "Case of 12" and "Single
  Bottle" match nothing in the food list, fell through to the food pool, and
  shipped a pizza and a burger on bottles of water.
*/
const GOODS_KEYWORDS: [RegExp, GlyphName][] = [
  // Most specific object first: a "Pet Bowl Bundle" is a bowl before it is
  // one of the six bottles its description happens to mention.
  [/bowl|mug|tumbler|flask|copper|wand|drinkware/i, 'cup'],
  [/bottle|gallon|refill|alkaline|jug/i, 'bottle'],
  // Whole item words: "that" is not a hat and potstickers are not stickers.
  [/\b(?:tees?|t-shirts?|shirts?|polos?|hoodies?|crewnecks?|sweat(?:shirts?|pants)?|hats?|caps?|apparel|totes?|stickers?)\b/i, 'shirt'],
]

/* Container words, goods sellers ONLY. A butcher's "Ribeye 2-Pack" is a steak,
   not a cardboard box, and this rule ran ahead of the food list until it was. */
const CONTAINER = /case|pack|bundle|box|crate|carton|kit|set of/i

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
/* What a non-food seller falls back to. Never a dish. */
const GOODS_POOL: GlyphName[] = ['box', 'bottle', 'shirt', 'cup']

/* Sellers whose catalogue is goods or a service, not dishes. Matched against
   the brand's own cuisine line, which is the only kind marker the data has. */
const NOT_FOOD =
  /water|apparel|drinkware|print on demand|service|repair|hybrid|walking|pet sitting|app$|reading app/i

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function glyphFor(name: string, desc = '', cuisine = ''): GlyphName {
  const hay = `${name} ${desc}`
  const goods = NOT_FOOD.test(cuisine)

  for (const [re, g] of GOODS_KEYWORDS) if (re.test(hay)) return g
  if (goods && CONTAINER.test(hay)) return 'box'
  // A goods seller never reaches the dish list — "Pet Bowl Bundle" is not a
  // bowl of noodles, and guessing wrong there is worse than a generic box.
  if (!goods) for (const [re, g] of KEYWORDS) if (re.test(hay)) return g

  const pool = goods ? GOODS_POOL : POOL
  return pool[hash(name) % pool.length]
}

export function ItemThumb({
  name,
  desc,
  bg,
  fg,
  size = 78,
  imageUrl,
  cuisine,
}: {
  name: string
  desc?: string
  /** Brand background, `a` or `a|b`. */
  bg: string
  fg: string
  size?: number
  /** The vendor's own photo, when one was sourced. */
  imageUrl?: string
  /** The brand's own cuisine line — decides food glyphs versus goods glyphs. */
  cuisine?: string
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

  const glyph = glyphFor(name, desc, cuisine)
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
