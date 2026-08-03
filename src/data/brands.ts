import type { GlyphName } from './glyphs'
import { LOCAL_SEED } from './localBrands'

/**
 * Catalogue ported from the operator's existing hub at goodneighborbuilder.com.
 *
 * Every brand name, tagline, brand colour, menu item, description and price
 * below is transcribed from that site — not invented. The icon art is their
 * own, served from /public/icons.
 *
 * Two things were deliberately NOT carried over:
 *  - Ratings. The old site has none, and inventing review counts for real
 *    businesses would be fabricating evidence about someone else's trade.
 *  - Contact details and ordering links. They do not exist anywhere in the old
 *    site's data model, so there was nothing to port. `prepMinutes` below is an
 *    operational estimate by category, not sourced.
 *
 * Multi-tenant from day one: each business is its own vendor and gets paid
 * separately. That matches what this actually is — independent local operators
 * sharing one home screen, not one company's brand portfolio.
 */

export type LogoTemplate = 'monogram' | 'badge' | 'glyph-word' | 'wordmark' | 'band'

export interface Logo {
  /** Vendor-supplied square artwork. Wins over the generated mark below. */
  imageUrl?: string
  /** Tile background. Either a solid or an `a|b` linear pair. */
  bg: string
  fg: string
  accent?: string
  /* Generated-mark fallback, for a vendor who joins without artwork. */
  template?: LogoTemplate
  glyph?: GlyphName
  initials?: string
  lines?: string[]
  face?: 'grotesk' | 'slab' | 'script' | 'condensed'
}

export interface MenuItem {
  id: string
  name: string
  desc: string
  /** Cents. */
  price: number
  popular?: boolean
  tags?: string[]
  options?: MenuOptionGroup[]
}

export interface MenuOptionGroup {
  id: string
  name: string
  required?: boolean
  max?: number
  choices: { id: string; name: string; price: number }[]
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export interface Brand {
  id: string
  vendorId: string
  name: string
  /** Home-screen label, as it appears on the operator's existing hub. */
  iconLabel: string
  cuisine: string
  tagline: string
  logo: Logo
  /** Estimate by category. Not sourced from the operator. */
  prepMinutes: number
  menu: MenuCategory[]
  /** Their own site, where one exists. */
  site?: string
  /** A real ordering link (Toast, their own checkout), where one exists. */
  orderUrl?: string
  phone?: string
  address?: string
  /** Set when a whole menu is triangulated rather than published at source. */
  pricesEstimated?: string
  /**
   * Set when no menu is published anywhere. The brand still gets an icon and a
   * page, but shows how to reach them instead of an invented menu — and three
   * of these are not restaurants at all.
   */
  contactOnly?: string
  /**
   * Set where the business name and the ported menu plainly disagree — the old
   * site tagged all 25 as `kind:"food"`, so a tax-prep firm and a sneaker brand
   * both ended up with restaurant menus. Surfaced in the UI rather than hidden,
   * because shipping a credit-repair company selling brisket would embarrass
   * the operator in front of his own tenants.
   */
  needsOwnerReview?: string
}

export interface Vendor {
  id: string
  name: string
  /** Populated once the vendor finishes Stripe Connect onboarding. */
  stripeAccountId: string | null
  payoutsEnabled: boolean
  /**
   * Sales tax charged on this vendor's food, in basis points.
   *
   * California charges prepared-food tax at the SELLER's location, not the
   * buyer's, so this belongs to the vendor and not to the order. A cart
   * spanning Berkeley and Vallejo is genuinely taxed at two different rates.
   */
  taxBps: number
}

/**
 * Combined state + county + district rates by city.
 *
 * CONFIRM AGAINST CDTFA BEFORE TURNING PAYMENTS ON. These are the published
 * combined rates for each vendor's city, but rates change by district vote and
 * under-collecting is the vendor's liability, not ours. `DEFAULT_TAX_BPS` is
 * the California statewide minimum and is deliberately the safest wrong answer
 * for a vendor whose address we do not yet hold — it under-collects, which
 * shows up as a shortfall rather than as an overcharge to a customer.
 */
const DEFAULT_TAX_BPS = 725
const CITY_TAX_BPS: Record<string, number> = {
  Berkeley: 1025,
  Oakland: 1025,
  Vallejo: 925,
  Pinole: 975,
}

function taxBpsFor(address?: string): number {
  if (!address) return DEFAULT_TAX_BPS
  for (const [city, bps] of Object.entries(CITY_TAX_BPS)) {
    if (address.includes(city)) return bps
  }
  return DEFAULT_TAX_BPS
}

interface Seed {
  slug: string
  name: string
  label: string
  cuisine: string
  tagline: string
  color: string
  icon: string
  prep: number
  category: string
  items: [string, string, number][]
  review?: string
}

/** Straight transcription of the source hub. Prices are cents. */
const SEED: Seed[] = [
  {
    slug: 'dingdongtogo', name: 'DingDongtogo', label: 'DingDongtogo',
    cuisine: 'Delivery bundles', tagline: 'Delivery from the kitchen to your door',
    color: '#F26B21', icon: 'dingdongtogo', prep: 20, category: 'Bundles',
    items: [
      ['Family Dinner Bundle', 'Entrée, two sides, four drinks', 4800],
      ['Lunch Special', 'Entrée, side, drink', 1400],
      ['Wing Party Pack', '24 wings, two sauces', 3600],
      ['Dessert Add-On', "Chef's choice sweet", 700],
    ],
  },
  {
    slug: 'share-scan', name: 'Share & Scan', label: 'Share & Scan',
    cuisine: 'Grab-and-go deli', tagline: 'Grab-and-go bites and cold drinks',
    color: '#3B82F6', icon: 'share-scan', prep: 6, category: 'Grab & Go',
    items: [
      ['Chicken Caesar Wrap', 'Romaine, parmesan, garlic dressing', 1100],
      ['Turkey Club Box', 'Sandwich, chips, cookie', 1300],
      ['Fruit Cup', 'Seasonal, fresh cut', 600],
      ['Bottled Lemonade', 'House made, 16 oz', 400],
    ],
  },
  {
    slug: 'lol-catering', name: 'LOL Catering', label: 'LOL Catering',
    cuisine: 'Event catering', tagline: 'Catering for parties, offices, and pop-ups',
    color: '#7B2FF7', icon: 'lol-catering-featured', prep: 48, category: 'Catering',
    items: [
      ['Taco Bar — 25 Guests', 'Three proteins, all the fixings', 42500],
      ['Soul Food Tray — 15 Guests', 'Entrée plus three sides', 30000],
      ['Breakfast Spread — 20 Guests', 'Pastries, fruit, egg trays, coffee', 26000],
      ['Dessert Table', 'Assorted sweets for 25', 17500],
    ],
  },
  {
    slug: 'hotboys-chicken', name: 'HotBoys Chicken', label: 'HotBoys Chicken',
    cuisine: 'Nashville hot chicken', tagline: 'Nashville-style hot chicken, fried to order',
    color: '#F2B705', icon: 'hotboys', prep: 15, category: 'Menu',
    items: [
      ['Hot Chicken Sandwich', 'Buttermilk thigh, slaw, comeback sauce', 1350],
      ['3 Piece Tender Combo', 'Tenders, fries, choice of heat', 1500],
      ['Loaded Hot Fries', 'Chopped chicken, cheese, ranch drizzle', 1100],
      ['Mac & Cheese', 'Baked, four cheese', 600],
    ],
  },
  {
    slug: 'butter-pecan', name: 'Butter Pecan', label: 'Butter Pecan',
    cuisine: 'Ice cream & cobbler', tagline: 'Small-batch ice cream and cobblers',
    color: '#8A5A2B', icon: 'butter-pecan', prep: 6, category: 'Sweets',
    items: [
      ['Butter Pecan Pint', 'The house classic, roasted pecans', 1200],
      ['Peach Cobbler Cup', 'Warm cobbler, vanilla scoop', 900],
      ['Banana Pudding', 'Wafers, fresh banana, whipped cream', 800],
      ['Two Scoop Waffle Cone', 'Any two flavors', 750],
    ],
  },
  {
    slug: 'baked-blooms', name: 'Baked Blooms', label: 'Baked Blooms',
    cuisine: 'Bakery & flowers', tagline: 'Fresh bakes and flower boxes',
    color: '#D06A8C', icon: 'baked-blooms', prep: 20, category: 'Bakery',
    items: [
      ['Bloom Box + 6 Cookies', 'Seasonal blooms with warm cookies', 4500],
      ['Half Dozen Cupcakes', "Baker's choice frosting", 2400],
      ['Cinnamon Roll Tray', 'Four jumbo rolls, cream cheese glaze', 1800],
      ['Brownie Flight', 'Fudge, walnut, cheesecake swirl', 1200],
    ],
  },
  {
    slug: 'wildfork-foods', name: 'WildFork Foods', label: 'WildFork Foods',
    cuisine: 'Butcher', tagline: 'Butcher-cut proteins, ready to cook',
    color: '#C0392B', icon: 'wildfork', prep: 12, category: 'Butcher',
    items: [
      ['Ribeye 2-Pack', '12 oz each, hand cut', 3200],
      ['Chicken Breast Family Pack', '4 lb, boneless skinless', 1900],
      ['Wild Caught Salmon', 'Two 6 oz fillets', 2100],
      ['Shrimp Skewers', 'Six garlic herb skewers', 1600],
    ],
  },
  {
    slug: 'tax-technician', name: 'Tax Technician', label: 'Tax Technician',
    cuisine: 'Southern soul food', tagline: 'Southern plates and daily specials',
    color: '#1F6FB2', icon: 'tax-technician', prep: 18, category: 'Plates',
    review: 'Listed as a tax-prep business but carries a soul-food menu.',
    items: [
      ['Fried Catfish Plate', 'Two fillets, two sides, hush puppies', 1800],
      ['Smothered Pork Chops', 'Onion gravy, rice, greens', 1900],
      ['Red Beans & Rice', 'Smoked sausage, cornbread', 1400],
      ['Peach Sweet Tea', 'Brewed fresh daily, 20 oz', 400],
    ],
  },
  {
    slug: 'credit-brothers', name: 'The Credit Brothers', label: 'The Credit Br…',
    cuisine: 'Barbecue', tagline: 'Wood-smoked barbecue by the pound',
    color: '#2E7D5B', icon: 'credit-brothers', prep: 18, category: 'Barbecue',
    review: 'Listed as a credit-repair business but carries a barbecue menu.',
    items: [
      ['Brisket Plate', 'Half pound, two sides, pickles', 2200],
      ['Rib Tips & Links', 'Combo basket, house sauce', 1800],
      ['Pulled Pork Sandwich', 'Slaw, brioche bun', 1400],
      ['Baked Beans', 'Brisket burnt ends stirred in', 600],
    ],
  },
  {
    slug: 'beastmode', name: 'BEASTmode', label: 'BEASTmode',
    cuisine: 'High-protein meals', tagline: 'High-protein meals and shakes',
    color: '#111827', icon: 'beastmode', prep: 14, category: 'Meals',
    items: [
      ['Grilled Chicken & Rice Bowl', '8 oz chicken, jasmine rice, broccoli', 1400],
      ['Steak & Sweet Potato', 'Sirloin, roasted sweet potato, greens', 1800],
      ['Meal Prep — 5 Meals', 'Macro-tracked, chef prepared', 7000],
      ['Recovery Shake', 'Post-workout protein blend', 900],
    ],
  },
  {
    slug: 'vegan-mob', name: 'Vegan Mob', label: 'Vegan Mob',
    cuisine: 'Plant-based BBQ', tagline: 'Plant-based BBQ and soul food',
    color: '#3C9D3C', icon: 'vegan-mob', prep: 16, category: 'Menu',
    items: [
      ['Mobfather Burrito', 'BBQ jackfruit, mac, greens', 1700],
      ['Smoked Brisket Plate', 'Two sides, cornbread', 2200],
      ['Vegan Gumbo', 'Okra, mushroom sausage, rice', 1500],
      ['Mac & Greens', 'Cashew cheese mac, collards', 1100],
    ],
  },
  {
    slug: 'boss-burgers', name: 'Boss.Burgers', label: 'Boss.Burgers',
    cuisine: 'Smash burgers', tagline: 'Smash burgers with attitude',
    color: '#B3261E', icon: 'boss-burgers', prep: 12, category: 'Burgers',
    items: [
      ['Boss Double Smash', 'Two patties, American, boss sauce', 1400],
      ['Bacon Jam Burger', 'Smoked bacon jam, aged cheddar', 1600],
      ['Crispy Chicken Burger', 'Pickles, spicy mayo', 1300],
      ['Seasoned Fries', 'Large, house seasoning', 550],
    ],
  },
  {
    slug: 'ally-virtual', name: 'Ally Virtual', label: 'Ally Virtual',
    cuisine: 'All-day breakfast', tagline: 'Breakfast all day, coffee bar included',
    color: '#5A4FCF', icon: 'ally-virtual', prep: 12, category: 'Breakfast',
    items: [
      ['Steak & Egg Burrito', 'Potatoes, cheese, salsa roja', 1300],
      ['Pancake Stack', 'Three buttermilk cakes, whipped butter', 1100],
      ['Breakfast Sandwich', 'Egg, bacon, cheddar, brioche', 900],
      ['Iced Latte', 'Double shot, 16 oz', 550],
    ],
  },
  {
    slug: 'jenuine-fitness', name: 'Jenuine Fitness', label: 'Jenuine Fitn…',
    cuisine: 'Bowls & smoothies', tagline: 'Clean bowls, wraps, and smoothies',
    color: '#E0457B', icon: 'jenuine-fitness', prep: 10, category: 'Menu',
    review: 'Listed as a fitness business but carries a food menu.',
    items: [
      ['Power Greens Bowl', 'Quinoa, kale, avocado, grilled chicken', 1500],
      ['Turkey Avocado Wrap', 'Spinach tortilla, chipotle aioli', 1300],
      ['Açaí Bowl', 'Granola, banana, berries, honey', 1200],
      ['Green Smoothie', 'Spinach, pineapple, ginger, 20 oz', 900],
    ],
  },
  {
    slug: 'gao-viet-kitchen', name: 'Gao Viet Kitchen', label: 'Gao Viet Kitc…',
    cuisine: 'Vietnamese', tagline: 'Vietnamese comfort, made fresh daily',
    color: '#1E7A6B', icon: 'gao-viet', prep: 16, category: 'Menu',
    items: [
      ['Phở Tái', 'Rare steak, 12-hour broth', 1600],
      ['Bánh Mì Thịt', 'Grilled pork, pâté, pickled veg', 1100],
      ['Bún Chả', 'Grilled pork, vermicelli, herbs', 1700],
      ['Fresh Spring Rolls', 'Two rolls, peanut sauce', 800],
    ],
  },
  {
    slug: 'beasty-h20', name: 'Beasty H20 Co', label: 'Beasty H20 Co',
    cuisine: 'Alkaline water', tagline: 'Alkaline water for you and your dog',
    color: '#2C8ED6', icon: 'beasty-h20', prep: 5, category: 'Water',
    items: [
      ['Case of 12', '500ml alkaline bottles', 2800],
      ['5 Gallon Refill', 'Bring your jug or buy one', 1500],
      ['Pet Bowl Bundle', 'Travel bowl plus 6 bottles', 2400],
      ['Single Bottle', 'Grab and go', 300],
    ],
  },
  {
    slug: 'winkydinkydogs', name: 'WinkyDinkyDogs', label: 'WinkyDinkyD…',
    cuisine: 'Hot dogs', tagline: 'Gourmet hot dogs, loaded up',
    color: '#E8452C', icon: 'winky-dinky', prep: 10, category: 'Dogs',
    items: [
      ['Winky Classic', 'All beef dog, mustard, onions', 800],
      ['Chili Cheese Dog', 'House chili, cheddar, jalapeño', 1100],
      ['Bacon Wrapped Street Dog', 'Peppers, onions, crema', 1200],
      ['Chili Cheese Fries', 'Full basket', 900],
    ],
  },
  {
    slug: 'tonys-style', name: "Tony's Style", label: "Tony's Style",
    cuisine: 'New York pizza', tagline: 'New York style slices and heros',
    color: '#0F172A', icon: 'tonys-style', prep: 14, category: 'Pizza',
    review: 'Brand name reads as a style/barber trade but carries a pizzeria menu.',
    items: [
      ['Cheese Slice', 'Hand-tossed, aged mozzarella', 450],
      ['Pepperoni Pie', '18 inch, cupped pepperoni', 2600],
      ['Chicken Parm Hero', 'Marinara, mozzarella, toasted roll', 1400],
      ['Garlic Knots', 'Six, parmesan and herbs', 700],
    ],
  },
  {
    slug: 'sharetasking', name: 'Sharetasking', label: 'Sharetasking',
    cuisine: 'Party platters', tagline: 'Shareable platters for the whole crew',
    color: '#0EA5A5', icon: 'sharetasking', prep: 25, category: 'Platters',
    review: 'Listed on the dock as gig work but carries a catering menu.',
    items: [
      ['Wing Platter — 24', 'Two sauces, ranch and celery', 4200],
      ['Slider Tray — 12', 'Beef and chicken sliders', 3800],
      ['Nacho Mountain', 'Feeds four, queso and pico', 2400],
      ['Loaded Fry Basket', 'Cheese, bacon, scallions', 1200],
    ],
  },
  {
    slug: 'gifted-kicks', name: 'Gifted Kicks', label: 'Gifted Kicks',
    cuisine: 'Cheesesteaks', tagline: 'Philly cheesesteaks and fry baskets',
    color: '#E11D48', icon: 'gifted-kicks', prep: 13, category: 'Menu',
    review: 'Brand name reads as sneakers/retail but carries a cheesesteak menu.',
    items: [
      ['Classic Cheesesteak', 'Ribeye, onions, provolone', 1500],
      ['Chicken Cheesesteak', 'Peppers, whiz, long roll', 1400],
      ['Cheese Fry Basket', 'Whiz and fried onions', 900],
      ['Fountain Soda', '24 oz, free refill in truck', 300],
    ],
  },
  {
    slug: 'print-on-demand', name: 'Print On Demand', label: 'Print On De…',
    cuisine: 'Wood-fired pizza', tagline: 'Wood-fired pizzas made to order',
    color: '#7C3AED', icon: 'print-on-demand', prep: 15, category: 'Pizza',
    review: 'Listed as a print/merch business but carries a pizzeria menu.',
    items: [
      ['Margherita', 'San Marzano, fresh mozzarella, basil', 1600],
      ['Spicy Soppressata', 'Hot honey, chili flake', 1900],
      ['Truffle Mushroom', 'Fontina, thyme, truffle oil', 2000],
      ['Caesar Salad', 'Shaved parmesan, torn croutons', 900],
    ],
  },
  {
    slug: 'boba', name: 'Boba', label: 'Boba',
    cuisine: 'Boba tea', tagline: 'Milk teas, fruit teas, and toppings',
    color: '#9C6644', icon: 'boba', prep: 8, category: 'Drinks',
    items: [
      ['Classic Milk Tea', 'Black tea, tapioca pearls', 650],
      ['Taro Milk Tea', 'Real taro, creamy', 700],
      ['Mango Green Tea', 'Fresh mango, popping boba', 700],
      ['Brown Sugar Latte', 'Fresh milk, warm pearls', 750],
    ],
  },
  {
    slug: 'masa', name: 'Masa', label: 'Masa',
    cuisine: 'Mexican', tagline: 'Handmade tortillas and street tacos',
    color: '#D97706', icon: 'masa', prep: 12, category: 'Menu',
    items: [
      ['Taco Trio', 'Three tacos, choice of meat', 1300],
      ['Quesabirria Plate', 'Three tacos with consomé', 1700],
      ['Burrito', 'Rice, beans, salsa verde', 1400],
      ['Chips & Salsa', 'Fresh fried, two salsas', 600],
    ],
  },
  {
    slug: 'waffles-cream', name: 'Waffles & Cream', label: 'Waffles & Cr…',
    cuisine: 'Waffles & ice cream', tagline: 'Waffles, cones, and cold scoops',
    color: '#EAB308', icon: 'waffles-cream', prep: 12, category: 'Menu',
    items: [
      ['Chicken & Waffles', 'Crispy tender, maple butter', 1600],
      ['Waffle Sundae', 'Two scoops, whipped cream', 1200],
      ['Strawberry Waffle', 'Fresh berries, cream', 1100],
      ['Milkshake', 'Hand spun, any flavor', 800],
    ],
  },
  {
    slug: 'high-scores', name: 'High Scores', label: 'High Scores',
    cuisine: 'Arcade snacks', tagline: 'Arcade snacks, pizza, and slushies',
    color: '#6D28D9', icon: 'high-scores', prep: 10, category: 'Snacks',
    items: [
      ['Pepperoni Personal Pizza', 'Eight inch, crispy crust', 1100],
      ['Corn Dog Basket', 'Two dogs, curly fries', 1000],
      ['Soft Pretzel', 'Warm, salted, cheese dip', 700],
      ['Blue Raspberry Slushie', '24 oz, extra cold', 500],
    ],
  },
]

const fromSeed = (s: Seed): Brand => ({
  id: `b_${s.slug.replace(/-/g, '')}`,
  vendorId: `v_${s.slug.replace(/-/g, '')}`,
  name: s.name,
  iconLabel: s.label,
  cuisine: s.cuisine,
  tagline: s.tagline,
  logo: s.icon
    ? { imageUrl: `/icons/${s.icon}.png`, bg: s.color, fg: '#ffffff' }
    : // No verifiable artwork: draw a monogram rather than link a missing file.
      {
        bg: s.color,
        fg: '#ffffff',
        template: 'monogram' as const,
        initials: s.name.replace(/[^A-Za-z ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
        face: 'grotesk' as const,
      },
  prepMinutes: s.prep,
  needsOwnerReview: s.review,
  menu: [
    {
      id: `c_${s.slug.replace(/-/g, '')}`,
      name: s.category,
      items: s.items.map(([name, desc, price], i) => ({
        id: `i_${s.slug.replace(/-/g, '')}_${i + 1}`,
        name,
        desc,
        price,
      })),
    },
  ],
})

/**
 * Verified local businesses first — they are the real ones, so they take the
 * front of the grid. The ported hub entries follow.
 */
export const BRANDS: Brand[] = [
  ...LOCAL_SEED.map((s) => ({
    ...fromSeed(s as unknown as Seed),
    site: s.site,
    orderUrl: s.orderUrl,
    phone: s.phone,
    address: s.address,
    pricesEstimated: s.pricesEstimated,
    contactOnly: s.contactOnly,
  })),
  ...SEED.map(fromSeed),
]

/** Each business is independent and is paid separately. */
export const VENDORS: Vendor[] = [...LOCAL_SEED, ...SEED].map((s) => ({
  id: `v_${s.slug.replace(/-/g, '')}`,
  name: s.name,
  stripeAccountId: null,
  payoutsEnabled: false,
  taxBps: taxBpsFor((s as { address?: string }).address),
}))

export const brandById = (id: string) => BRANDS.find((b) => b.id === id)
export const vendorById = (id: string) => VENDORS.find((v) => v.id === id)
