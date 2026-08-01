import type { GlyphName } from './glyphs'

/**
 * Fake seed catalogue. Shape matches the API payload exactly, so swapping this
 * for `GET /api/catalogue` is a one-line change in the store.
 *
 * Multi-tenant from day one: every brand belongs to a vendor, every vendor gets
 * paid separately. A cart can span vendors; checkout splits the payment.
 */

export type LogoTemplate = 'monogram' | 'badge' | 'glyph-word' | 'wordmark' | 'band'

export interface Logo {
  template: LogoTemplate
  /** Background of the icon tile. Either a solid or a `a|b` linear pair. */
  bg: string
  fg: string
  accent?: string
  glyph?: GlyphName
  initials?: string
  /** Stacked wordmark lines, largest first. */
  lines?: string[]
  /** Font stack override for the mark. */
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
  /** Truncated the way iOS truncates home-screen labels. */
  iconLabel: string
  cuisine: string
  tagline: string
  logo: Logo
  prepMinutes: number
  rating: number
  ratingCount: number
  menu: MenuCategory[]
}

export interface Vendor {
  id: string
  name: string
  /** Populated once the vendor finishes Stripe Connect onboarding. */
  stripeAccountId: string | null
  payoutsEnabled: boolean
}

export const VENDORS: Vendor[] = [
  { id: 'v_hallgroup', name: 'Hall Street Kitchen Group', stripeAccountId: null, payoutsEnabled: false },
  { id: 'v_mesa', name: 'Mesa Provisions LLC', stripeAccountId: null, payoutsEnabled: false },
  { id: 'v_northside', name: 'Northside Hospitality', stripeAccountId: null, payoutsEnabled: false },
  { id: 'v_solo', name: 'Marisol Vega (sole prop)', stripeAccountId: null, payoutsEnabled: false },
  { id: 'v_pike', name: 'Pike & Co', stripeAccountId: null, payoutsEnabled: false },
]

const opt = (
  id: string,
  name: string,
  choices: [string, number][],
  required = false,
  max = 1,
): MenuOptionGroup => ({
  id,
  name,
  required,
  max,
  choices: choices.map(([n, p]) => ({ id: `${id}_${n.toLowerCase().replace(/\W+/g, '')}`, name: n, price: p })),
})

const SIZE = opt('size', 'Size', [['Regular', 0], ['Large', 250]], true)
const SPICE = opt('spice', 'Heat level', [['Mild', 0], ['Medium', 0], ['Hot', 0], ['Screaming', 0]], true)
const EXTRAS = opt('extras', 'Add extras', [['Extra patty', 400], ['Bacon', 250], ['Avocado', 200], ['Fried egg', 175]], false, 4)

export const BRANDS: Brand[] = [
  {
    id: 'b_hotbird',
    vendorId: 'v_hallgroup',
    name: 'Hot Bird Chicken Co',
    iconLabel: 'Hot Bird Chi…',
    cuisine: 'Nashville hot chicken',
    tagline: 'Cayenne-lacquered, cooled by white bread.',
    logo: { template: 'badge', bg: '#FFFFFF', fg: '#C92A2A', accent: '#F08C00', glyph: 'flame', face: 'condensed', lines: ['HOT BIRD'] },
    prepMinutes: 14,
    rating: 4.8,
    ratingCount: 1204,
    menu: [
      {
        id: 'c_sandwiches',
        name: 'Sandwiches',
        items: [
          { id: 'i_hb1', name: 'The Original Hot', desc: 'Quarter-pound thigh, cayenne lacquer, pickles, comeback sauce.', price: 1200, popular: true, options: [SPICE, EXTRAS] },
          { id: 'i_hb2', name: 'Honey Butter Bird', desc: 'Hot chicken finished with cultured honey butter on a milk bun.', price: 1350, options: [SPICE] },
          { id: 'i_hb3', name: 'Plain Jane', desc: 'For the heat-averse. Buttermilk brined, no cayenne.', price: 1100 },
        ],
      },
      {
        id: 'c_plates',
        name: 'Plates',
        items: [
          { id: 'i_hb4', name: 'Half Bird Plate', desc: 'Four pieces, white bread, pickle spears, choice of side.', price: 1900, popular: true, options: [SPICE] },
          { id: 'i_hb5', name: 'Tender Basket', desc: 'Three tenders, crinkle fries, comeback sauce.', price: 1450, options: [SPICE] },
        ],
      },
      {
        id: 'c_sides',
        name: 'Sides',
        items: [
          { id: 'i_hb6', name: 'Crinkle Fries', desc: 'Beef-tallow fried, seasoned salt.', price: 500, options: [SIZE] },
          { id: 'i_hb7', name: 'Vinegar Slaw', desc: 'No mayo. Sharp and cold.', price: 450 },
          { id: 'i_hb8', name: 'Mac & Cheese', desc: 'Three cheese, brown butter crumb.', price: 650 },
        ],
      },
    ],
  },
  {
    id: 'b_bosswich',
    vendorId: 'v_hallgroup',
    name: 'Boss Burgers',
    iconLabel: 'Boss Burgers',
    cuisine: 'Smash burgers',
    tagline: 'Two patties, thin and crisp at the edge.',
    logo: { template: 'glyph-word', bg: '#E8590C', fg: '#FFFFFF', glyph: 'burger', lines: ['BOSS'], face: 'grotesk' },
    prepMinutes: 11,
    rating: 4.6,
    ratingCount: 2871,
    menu: [
      {
        id: 'c_burgers',
        name: 'Burgers',
        items: [
          { id: 'i_bb1', name: 'The Boss Double', desc: 'Two smashed patties, American, onion, house sauce.', price: 1250, popular: true, options: [EXTRAS] },
          { id: 'i_bb2', name: 'Bacon Jam Single', desc: 'Single patty, bacon jam, aged cheddar, crispy shallot.', price: 1150, options: [EXTRAS] },
          { id: 'i_bb3', name: 'Mushroom Swiss', desc: 'Roasted maitake, Swiss, garlic aioli.', price: 1300, tags: ['veg'] },
          { id: 'i_bb4', name: 'Plain Cheeseburger', desc: 'Nothing clever. Just correct.', price: 950 },
        ],
      },
      {
        id: 'c_bbsides',
        name: 'Sides & Drinks',
        items: [
          { id: 'i_bb5', name: 'Shoestring Fries', desc: 'Salted while hot.', price: 475, popular: true, options: [SIZE] },
          { id: 'i_bb6', name: 'Fry Sauce', desc: 'Cup of the good stuff.', price: 100 },
          { id: 'i_bb7', name: 'Vanilla Shake', desc: 'Hand-spun, thick enough to hold a straw.', price: 700, options: [SIZE] },
          { id: 'i_bb8', name: 'Fountain Soda', desc: 'Free refills do not apply to delivery.', price: 350, options: [SIZE] },
        ],
      },
    ],
  },
  {
    id: 'b_mesataco',
    vendorId: 'v_mesa',
    name: 'Mesa Taqueria',
    iconLabel: 'Mesa Taqueria',
    cuisine: 'Tacos, Sonoran',
    tagline: 'Mesquite grill, flour tortillas pressed to order.',
    logo: { template: 'badge', bg: '#FFFDF6', fg: '#7F1D1D', accent: '#B45309', glyph: 'taco', lines: ['MESA'], face: 'slab' },
    prepMinutes: 9,
    rating: 4.9,
    ratingCount: 943,
    menu: [
      {
        id: 'c_tacos',
        name: 'Tacos',
        items: [
          { id: 'i_mt1', name: 'Carne Asada', desc: 'Mesquite-grilled skirt, onion, cilantro, salsa taquera.', price: 475, popular: true },
          { id: 'i_mt2', name: 'Al Pastor', desc: 'Trompo pork, pineapple, salsa roja.', price: 450, popular: true },
          { id: 'i_mt3', name: 'Birria', desc: 'Braised beef, consommé for dipping.', price: 550 },
          { id: 'i_mt4', name: 'Nopales', desc: 'Grilled cactus, queso fresco, pepitas.', price: 425, tags: ['veg'] },
        ],
      },
      {
        id: 'c_bigger',
        name: 'Bigger Plates',
        items: [
          { id: 'i_mt5', name: 'Sonoran Burrito', desc: 'Flour tortilla, asada, beans, cheese, guac.', price: 1400, popular: true },
          { id: 'i_mt6', name: 'Quesabirria Trio', desc: 'Three cheese-crisped tacos, consommé.', price: 1500 },
        ],
      },
      {
        id: 'c_mtsides',
        name: 'Sides',
        items: [
          { id: 'i_mt7', name: 'Chips & Salsa Roja', desc: 'Fried to order.', price: 500 },
          { id: 'i_mt8', name: 'Elote', desc: 'Crema, cotija, chile, lime.', price: 550 },
          { id: 'i_mt9', name: 'Horchata', desc: 'Rice, cinnamon, not too sweet.', price: 400, options: [SIZE] },
        ],
      },
    ],
  },
  {
    id: 'b_saigon',
    vendorId: 'v_northside',
    name: 'Saigon Rolling',
    iconLabel: 'Saigon Rolling',
    cuisine: 'Vietnamese',
    tagline: 'Broth simmered eighteen hours, every day.',
    logo: { template: 'wordmark', bg: '#0B3B34|#08221E', fg: '#F4E9D8', accent: '#C9A227', lines: ['Saigon', 'ROLLING'], face: 'script' },
    prepMinutes: 16,
    rating: 4.7,
    ratingCount: 1560,
    menu: [
      {
        id: 'c_pho',
        name: 'Phở',
        items: [
          { id: 'i_sg1', name: 'Phở Tái', desc: 'Rare steak, rice noodle, eighteen-hour broth.', price: 1500, popular: true, options: [SIZE] },
          { id: 'i_sg2', name: 'Phở Gà', desc: 'Poached chicken, ginger-forward broth.', price: 1400, options: [SIZE] },
          { id: 'i_sg3', name: 'Phở Chay', desc: 'Mushroom and charred onion broth.', price: 1350, tags: ['vegan'], options: [SIZE] },
        ],
      },
      {
        id: 'c_banhmi',
        name: 'Bánh Mì',
        items: [
          { id: 'i_sg4', name: 'Thịt Nướng', desc: 'Grilled pork, pâté, pickled daikon, chili.', price: 1050, popular: true },
          { id: 'i_sg5', name: 'Gà Nướng', desc: 'Lemongrass chicken, cucumber, cilantro.', price: 1000 },
          { id: 'i_sg6', name: 'Đậu Hũ', desc: 'Crisped tofu, herb salad, vegan mayo.', price: 950, tags: ['vegan'] },
        ],
      },
      {
        id: 'c_sgdrinks',
        name: 'Drinks',
        items: [
          { id: 'i_sg7', name: 'Cà Phê Sữa Đá', desc: 'Phin-brewed, condensed milk, ice.', price: 550, popular: true },
          { id: 'i_sg8', name: 'Fresh Coconut', desc: 'Served in the shell.', price: 650 },
        ],
      },
    ],
  },
  {
    id: 'b_butterpecan',
    vendorId: 'v_solo',
    name: 'Butter Pecan Bakery',
    iconLabel: 'Butter Pecan',
    cuisine: 'Bakery',
    tagline: 'Small batch, sold out by two.',
    logo: { template: 'badge', bg: '#FBF3E8', fg: '#5B2333', accent: '#A9748A', glyph: 'donut', lines: ['BUTTER PECAN'], face: 'slab' },
    prepMinutes: 5,
    rating: 4.9,
    ratingCount: 611,
    menu: [
      {
        id: 'c_pastry',
        name: 'Pastry',
        items: [
          { id: 'i_bp1', name: 'Butter Pecan Roll', desc: 'The one we are named after. Order two.', price: 650, popular: true },
          { id: 'i_bp2', name: 'Brown Butter Chocolate Chip', desc: 'Sea salt, 36-hour rest.', price: 425, popular: true },
          { id: 'i_bp3', name: 'Morning Bun', desc: 'Laminated, orange sugar.', price: 550 },
          { id: 'i_bp4', name: 'Sweet Potato Hand Pie', desc: 'Seasonal. Lard crust.', price: 600 },
        ],
      },
      {
        id: 'c_wholecake',
        name: 'Whole Cakes',
        items: [
          { id: 'i_bp5', name: '7" Caramel Cake', desc: 'Six layers. 48-hour notice honoured but rarely needed.', price: 5800 },
          { id: 'i_bp6', name: '7" Red Velvet', desc: 'Cream cheese, cocoa-forward.', price: 5600 },
        ],
      },
    ],
  },
  {
    id: 'b_pikepoke',
    vendorId: 'v_pike',
    name: 'Pike Street Poke',
    iconLabel: 'Pike St Poke',
    cuisine: 'Poke, Hawaiian',
    tagline: 'Cut in the morning, gone by dinner.',
    logo: { template: 'glyph-word', bg: '#0E7490|#065666', fg: '#ECFEFF', glyph: 'fish', lines: ['PIKE ST'], face: 'grotesk' },
    prepMinutes: 8,
    rating: 4.5,
    ratingCount: 780,
    menu: [
      {
        id: 'c_bowls',
        name: 'Bowls',
        items: [
          { id: 'i_pp1', name: 'Classic Ahi', desc: 'Shoyu, sweet onion, limu, sushi rice.', price: 1600, popular: true, options: [SIZE] },
          { id: 'i_pp2', name: 'Spicy Salmon', desc: 'Chili aioli, cucumber, furikake.', price: 1650, popular: true, options: [SIZE] },
          { id: 'i_pp3', name: 'Tofu Shoyu', desc: 'Marinated tofu, edamame, avocado.', price: 1400, tags: ['vegan'], options: [SIZE] },
        ],
      },
      {
        id: 'c_ppsides',
        name: 'Sides',
        items: [
          { id: 'i_pp4', name: 'Seaweed Salad', desc: 'Sesame, rice vinegar.', price: 450 },
          { id: 'i_pp5', name: 'Spam Musubi', desc: 'Two pieces. No apologies.', price: 500, popular: true },
        ],
      },
    ],
  },
  {
    id: 'b_greenmob',
    vendorId: 'v_northside',
    name: 'Green Mob',
    iconLabel: 'Green Mob',
    cuisine: 'Vegan soul food',
    tagline: 'Plant-based, still heavy.',
    logo: { template: 'badge', bg: '#0A0A0A', fg: '#4ADE80', accent: '#4ADE80', glyph: 'leaf', lines: ['GREEN MOB'], face: 'condensed' },
    prepMinutes: 13,
    rating: 4.7,
    ratingCount: 1332,
    menu: [
      {
        id: 'c_mains',
        name: 'Mains',
        items: [
          { id: 'i_gm1', name: 'Mob Burger', desc: 'House seitan patty, smoked gouda-style, special sauce.', price: 1400, popular: true, tags: ['vegan'] },
          { id: 'i_gm2', name: 'Fried "Shrimp" Basket', desc: 'King oyster mushroom, old bay, remoulade.', price: 1550, tags: ['vegan'], popular: true },
          { id: 'i_gm3', name: 'Philly Mob', desc: 'Seitan steak, peppers, cashew cheese.', price: 1500, tags: ['vegan'] },
        ],
      },
      {
        id: 'c_gmsides',
        name: 'Sides',
        items: [
          { id: 'i_gm4', name: 'Collards', desc: 'Smoked without the meat.', price: 550, tags: ['vegan'] },
          { id: 'i_gm5', name: 'Candied Yams', desc: 'Brown sugar, cinnamon.', price: 550, tags: ['vegan'] },
          { id: 'i_gm6', name: 'Cornbread', desc: 'Two squares, maple butter.', price: 450, tags: ['vegan'] },
        ],
      },
    ],
  },
  {
    id: 'b_dailygrind',
    vendorId: 'v_pike',
    name: 'Daily Grind Coffee',
    iconLabel: 'Daily Grind',
    cuisine: 'Coffee',
    tagline: 'Single origin, no oat milk surcharge.',
    logo: { template: 'monogram', bg: '#FAF6F1', fg: '#3E2723', accent: '#A1662F', initials: 'DG', lines: ['COFFEE'], face: 'slab' },
    prepMinutes: 6,
    rating: 4.4,
    ratingCount: 2109,
    menu: [
      {
        id: 'c_espresso',
        name: 'Espresso',
        items: [
          { id: 'i_dg1', name: 'Cortado', desc: 'Equal parts. Served in glass.', price: 475, popular: true },
          { id: 'i_dg2', name: 'Latte', desc: 'Whole, oat, or almond. No upcharge.', price: 550, popular: true, options: [SIZE] },
          { id: 'i_dg3', name: 'Americano', desc: 'Double shot, hot water.', price: 400, options: [SIZE] },
        ],
      },
      {
        id: 'c_brew',
        name: 'Brew & Cold',
        items: [
          { id: 'i_dg4', name: 'Pour Over', desc: 'Ask what is on the bar today.', price: 600 },
          { id: 'i_dg5', name: 'Cold Brew', desc: '20-hour steep, served over one big cube.', price: 575, popular: true, options: [SIZE] },
        ],
      },
    ],
  },
  {
    id: 'b_slicehouse',
    vendorId: 'v_hallgroup',
    name: 'Slice House 24',
    iconLabel: 'Slice House',
    cuisine: 'Pizza by the slice',
    tagline: 'Open until the dough runs out.',
    logo: { template: 'glyph-word', bg: '#B91C1C', fg: '#FFF7ED', glyph: 'pizza', lines: ['SLICE 24'], face: 'condensed' },
    prepMinutes: 7,
    rating: 4.3,
    ratingCount: 3402,
    menu: [
      {
        id: 'c_slices',
        name: 'By the Slice',
        items: [
          { id: 'i_sh1', name: 'Cheese Slice', desc: 'Aged mozz, 72-hour cold ferment.', price: 425, popular: true },
          { id: 'i_sh2', name: 'Pepperoni Cup', desc: 'The kind that curls.', price: 500, popular: true },
          { id: 'i_sh3', name: 'Grandma Square', desc: 'Sicilian pan, crushed tomato on top.', price: 525 },
          { id: 'i_sh4', name: 'Hot Honey Soppressata', desc: 'Chili honey drizzle.', price: 575 },
        ],
      },
      {
        id: 'c_pies',
        name: 'Whole Pies',
        items: [
          { id: 'i_sh5', name: '18" Cheese', desc: 'Eight slices.', price: 2200 },
          { id: 'i_sh6', name: '18" Pepperoni', desc: 'Eight slices, cup-and-char.', price: 2500, popular: true },
        ],
      },
    ],
  },
  {
    id: 'b_wafflebar',
    vendorId: 'v_solo',
    name: 'Waffles & Cream',
    iconLabel: 'Waffles & Cr…',
    cuisine: 'Dessert',
    tagline: 'Liège dough, pearl sugar, torched to order.',
    logo: { template: 'glyph-word', bg: '#FDF2F8|#FCE7F3', fg: '#831843', glyph: 'waffle', lines: ['W&C'], face: 'script' },
    prepMinutes: 10,
    rating: 4.8,
    ratingCount: 522,
    menu: [
      {
        id: 'c_waffles',
        name: 'Waffles',
        items: [
          { id: 'i_wc1', name: 'Classic Liège', desc: 'Pearl sugar caramelised on the iron.', price: 700, popular: true },
          { id: 'i_wc2', name: 'Strawberries & Cream', desc: 'Macerated berries, chantilly.', price: 950, popular: true },
          { id: 'i_wc3', name: 'Biscoff Crumble', desc: 'Cookie butter, speculoos crumb.', price: 1000 },
        ],
      },
      {
        id: 'c_scoops',
        name: 'Soft Serve',
        items: [
          { id: 'i_wc4', name: 'Vanilla Bean Cone', desc: 'Real vanilla, visible specks.', price: 550 },
          { id: 'i_wc5', name: 'Waffle Sundae', desc: 'Waffle, soft serve, hot fudge.', price: 1200, popular: true },
        ],
      },
    ],
  },
  {
    id: 'b_wingcart',
    vendorId: 'v_mesa',
    name: 'Wing Cart',
    iconLabel: 'Wing Cart',
    cuisine: 'Wings',
    tagline: 'Fried twice. Sauced on request.',
    logo: { template: 'monogram', bg: '#111827', fg: '#FBBF24', initials: 'WC', face: 'condensed' },
    prepMinutes: 15,
    rating: 4.5,
    ratingCount: 1877,
    menu: [
      {
        id: 'c_wings',
        name: 'Wings',
        items: [
          { id: 'i_wg1', name: '6 Wings', desc: 'Choice of sauce, ranch or blue cheese.', price: 1000, popular: true, options: [opt('sauce', 'Sauce', [['Buffalo', 0], ['Lemon Pepper', 0], ['Garlic Parm', 0], ['Gochujang', 50], ['Naked', 0]], true)] },
          { id: 'i_wg2', name: '12 Wings', desc: 'Two sauces if you want them split.', price: 1850, popular: true, options: [opt('sauce12', 'Sauce', [['Buffalo', 0], ['Lemon Pepper', 0], ['Garlic Parm', 0], ['Gochujang', 100], ['Naked', 0]], true, 2)] },
          { id: 'i_wg3', name: '24 Wings', desc: 'Feeds three. Or one, no judgement.', price: 3400 },
        ],
      },
      {
        id: 'c_wgsides',
        name: 'Sides',
        items: [
          { id: 'i_wg4', name: 'Seasoned Fries', desc: 'Tossed in wing dust.', price: 500, options: [SIZE] },
          { id: 'i_wg5', name: 'Celery & Carrots', desc: 'The obligatory vegetables.', price: 300 },
        ],
      },
    ],
  },
  {
    id: 'b_noodlebar',
    vendorId: 'v_northside',
    name: 'Third Ave Noodle Bar',
    iconLabel: '3rd Ave Nood…',
    cuisine: 'Ramen',
    tagline: 'Tonkotsu, twelve hours, no shortcuts.',
    logo: { template: 'badge', bg: '#F8FAFC', fg: '#0F172A', accent: '#DC2626', glyph: 'noodles', lines: ['3RD AVE'], face: 'grotesk' },
    prepMinutes: 17,
    rating: 4.6,
    ratingCount: 1044,
    menu: [
      {
        id: 'c_ramen',
        name: 'Ramen',
        items: [
          { id: 'i_nb1', name: 'Tonkotsu', desc: 'Pork bone broth, chashu, ajitama, scallion.', price: 1700, popular: true },
          { id: 'i_nb2', name: 'Spicy Miso', desc: 'Ground pork, corn, chili oil.', price: 1750, popular: true, options: [SPICE] },
          { id: 'i_nb3', name: 'Shoyu Chicken', desc: 'Clear broth, lighter.', price: 1600 },
          { id: 'i_nb4', name: 'Vegetable Shio', desc: 'Kombu-shiitake broth, seasonal veg.', price: 1550, tags: ['vegan'] },
        ],
      },
      {
        id: 'c_nbsides',
        name: 'Small Plates',
        items: [
          { id: 'i_nb5', name: 'Pork Gyoza (5)', desc: 'Pan-fried, crispy skirt.', price: 800, popular: true },
          { id: 'i_nb6', name: 'Ajitama', desc: 'Extra marinated egg.', price: 250 },
          { id: 'i_nb7', name: 'Cucumber Sunomono', desc: 'Rice vinegar, sesame.', price: 500 },
        ],
      },
    ],
  },
  {
    id: 'b_baja',
    vendorId: 'v_mesa',
    name: 'Baja Shrimp Shack',
    iconLabel: 'Baja Shrimp',
    cuisine: 'Seafood',
    tagline: 'Beer-battered, cabbage, crema, lime.',
    logo: { template: 'glyph-word', bg: '#F2FAFF', fg: '#0369A1', glyph: 'shrimp', lines: ['BAJA'], face: 'slab' },
    prepMinutes: 12,
    rating: 4.4,
    ratingCount: 688,
    menu: [
      {
        id: 'c_bajatacos',
        name: 'Tacos',
        items: [
          { id: 'i_bj1', name: 'Baja Shrimp Taco', desc: 'Beer-battered shrimp, cabbage, chipotle crema.', price: 550, popular: true },
          { id: 'i_bj2', name: 'Grilled Fish Taco', desc: 'Mahi, pico, avocado.', price: 525 },
        ],
      },
      {
        id: 'c_baskets',
        name: 'Baskets',
        items: [
          { id: 'i_bj3', name: 'Shrimp Basket', desc: 'Eight pieces, fries, tartar.', price: 1600, popular: true },
          { id: 'i_bj4', name: 'Fish & Chips', desc: 'Two fillets, thick-cut fries.', price: 1550 },
          { id: 'i_bj5', name: 'Ceviche Cup', desc: 'Lime-cured, tostada on the side.', price: 1100 },
        ],
      },
    ],
  },
  {
    id: 'b_deli',
    vendorId: 'v_pike',
    name: 'Corner Deli Co',
    iconLabel: 'Corner Deli',
    cuisine: 'Sandwiches',
    tagline: 'Sliced to order. Never pre-made.',
    logo: { template: 'band', bg: '#FEF3C7', fg: '#7C2D12', accent: '#166534', lines: ['CORNER', 'DELI CO'], face: 'condensed' },
    prepMinutes: 9,
    rating: 4.7,
    ratingCount: 1421,
    menu: [
      {
        id: 'c_subs',
        name: 'Sandwiches',
        items: [
          { id: 'i_cd1', name: 'The Italian', desc: 'Capicola, soppressata, provolone, hot peppers.', price: 1350, popular: true, options: [SIZE] },
          { id: 'i_cd2', name: 'Turkey Club', desc: 'Roast turkey, bacon, lettuce, tomato, mayo.', price: 1250, options: [SIZE] },
          { id: 'i_cd3', name: 'Chicken Cutlet', desc: 'Breaded cutlet, broccoli rabe, sharp provolone.', price: 1400, popular: true },
          { id: 'i_cd4', name: 'Eggplant Parm', desc: 'Fried eggplant, marinara, mozzarella.', price: 1200, tags: ['veg'] },
        ],
      },
      {
        id: 'c_delisides',
        name: 'Sides',
        items: [
          { id: 'i_cd5', name: 'Pasta Salad', desc: 'Half pound.', price: 600 },
          { id: 'i_cd6', name: 'Kettle Chips', desc: 'Salt and vinegar or plain.', price: 250 },
          { id: 'i_cd7', name: 'Black Cherry Soda', desc: 'Glass bottle.', price: 350 },
        ],
      },
    ],
  },
  {
    id: 'b_birria',
    vendorId: 'v_solo',
    name: 'Doña Vega Birria',
    iconLabel: 'Doña Vega',
    cuisine: 'Birria',
    tagline: "Marisol's recipe. Unchanged since 1997.",
    logo: { template: 'wordmark', bg: '#7C2D12|#431407', fg: '#FED7AA', accent: '#FBBF24', lines: ['Doña', 'VEGA'], face: 'script' },
    prepMinutes: 14,
    rating: 5.0,
    ratingCount: 402,
    menu: [
      {
        id: 'c_birria',
        name: 'Birria',
        items: [
          { id: 'i_dv1', name: 'Quesabirria (3)', desc: 'Cheese-crisped, consommé included.', price: 1500, popular: true },
          { id: 'i_dv2', name: 'Birria Ramen', desc: 'Consommé, noodles, braised beef.', price: 1600, popular: true },
          { id: 'i_dv3', name: 'Birria Plate', desc: 'Half pound of beef, rice, beans, tortillas.', price: 1900 },
          { id: 'i_dv4', name: 'Consommé Only', desc: '16oz. For the purists.', price: 700 },
        ],
      },
    ],
  },
  {
    id: 'b_bubble',
    vendorId: 'v_northside',
    name: 'Half Sugar Tea',
    iconLabel: 'Half Sugar',
    cuisine: 'Boba',
    tagline: 'Tea first, sugar second.',
    logo: { template: 'monogram', bg: '#DDD6FE|#C4B5FD', fg: '#4C1D95', initials: 'HS', face: 'grotesk' },
    prepMinutes: 7,
    rating: 4.6,
    ratingCount: 2255,
    menu: [
      {
        id: 'c_milktea',
        name: 'Milk Tea',
        items: [
          { id: 'i_hs1', name: 'Classic Milk Tea', desc: 'Assam base, tapioca included.', price: 600, popular: true, options: [SIZE, opt('sugar', 'Sugar', [['0%', 0], ['25%', 0], ['50%', 0], ['100%', 0]], true), opt('ice', 'Ice', [['No ice', 0], ['Less ice', 0], ['Regular', 0]], true)] },
          { id: 'i_hs2', name: 'Brown Sugar Boba', desc: 'Fresh milk, torched syrup walls.', price: 700, popular: true, options: [SIZE] },
          { id: 'i_hs3', name: 'Taro Latte', desc: 'Real taro, not powder.', price: 675, options: [SIZE] },
        ],
      },
      {
        id: 'c_fruit',
        name: 'Fruit Tea',
        items: [
          { id: 'i_hs4', name: 'Passionfruit Green', desc: 'Jasmine green, fresh passionfruit.', price: 625, options: [SIZE] },
          { id: 'i_hs5', name: 'Strawberry Matcha', desc: 'Ceremonial matcha, strawberry purée.', price: 750, popular: true, options: [SIZE] },
        ],
      },
    ],
  },
]

export const brandById = (id: string) => BRANDS.find((b) => b.id === id)
export const vendorById = (id: string) => VENDORS.find((v) => v.id === id)
