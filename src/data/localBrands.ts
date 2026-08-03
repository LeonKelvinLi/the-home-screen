/**
 * Real Bay Area businesses, researched and verified individually.
 *
 * Kept separate from the brands ported out of goodneighborbuilder.com because
 * the provenance is different and that difference matters: those were
 * transcribed from the operator's own (placeholder-looking) hub, these were
 * read off each business's own site. Anything not confirmed at source is
 * flagged rather than smoothed over.
 *
 * Rules applied throughout:
 *  - A price is only here if it was read from the business's own menu.
 *    Where a whole menu is triangulated rather than published, the brand
 *    carries `pricesEstimated` and the UI says so.
 *  - A business with no published menu gets `contactOnly` and no invented
 *    items. Three of these are not restaurants at all.
 */

export interface LocalSeed {
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
  /** Real ordering link, where one exists. */
  orderUrl?: string
  site?: string
  phone?: string
  address?: string
  /** Set when the whole menu is triangulated rather than published. */
  pricesEstimated?: string
  /** Set when no menu is published anywhere. No items are invented. */
  contactOnly?: string
}

export const LOCAL_SEED: LocalSeed[] = [
  {
    slug: 'top-dog',
    name: 'top dog',
    label: 'top dog',
    cuisine: 'Hot dogs, sausages',
    tagline: 'Grilled specialty sausages on toasted French rolls, in Berkeley since 1966.',
    color: '#FFF33E',
    icon: 'top-dog',
    prep: 7,
    category: 'Grilled Dogs',
    site: 'https://topdoghotdogs.com',
    phone: '(510) 843-5967',
    address: '2534 Durant Ave, Berkeley',
    pricesEstimated:
      'top dog has never published counter prices. These are triangulated from their own catering sheet and an archived delivery menu — confirm before taking payment.',
    items: [
      ['top dog Frankfurter', 'All beef, kosher style', 500],
      ['Garlic Frankfurter', 'Three-quarter beef, quarter pork, fresh garlic', 500],
      ['Bratwurst', 'Pork and marjoram, genuine old world taste', 500],
      ['Smoked Chicken Apple', 'Chicken with juicy bits of apple, low salt', 500],
      ['Mango with Jalapeno', 'Chicken, mango and jalapeño pepper', 525],
      ['Lemon Chicken', 'Chicken, fresh lemon and garlic, no preservatives', 525],
      ['the Wienie', 'Wheat protein, bell peppers, fennel, eggplant, garlic', 500],
      ['Six Pack To-Go', 'Six sausages and six buns, uncooked, to take home', 1600],
    ],
  },
  {
    slug: 'lumpia-company',
    name: 'The Lumpia Company',
    label: 'Lumpia Co',
    cuisine: 'Filipino lumpia, wings',
    tagline: 'Handcrafted lumpia in traditional and fusion flavours, plus twice-fried adobo wings.',
    color: '#B23132',
    icon: 'lumpia-company',
    prep: 18,
    category: 'Lumpia',
    site: 'https://thelumpiacompany.com',
    orderUrl: 'https://order.toasttab.com/online/thelumpiacompany',
    phone: '(213) 570-7497',
    address: '288 9th Avenue Suite A, Oakland',
    items: [
      ['Baco Cheeseburger', 'Ground beef, smoked bacon, cheddar, onions, BBQ and moo moo sauce', 1400],
      ['Chicken Tinola', 'Ground chicken, chayote, ginger, jalapeño, spinach, shoyu aioli', 1300],
      ['Bicol Express Pork & Shrimp', 'Spicy coconut pork and shrimp, Shanghai style, sweet chili', 1300],
      ["Earl's Turkey & Veggies", 'Ground turkey, cabbage, carrots, potatoes, peas, sweet chili', 1300],
      ['TLC Veggie', 'Chopped kale, roasted potatoes, roasted garlic and mushrooms', 1200],
      ['Peach Mango Cobbler', 'Caramelised peach and mango, jackfruit, cinnamon wonton strips', 1200],
      ['Adobo Seasoned Wings', 'Six twice-fried jumbo wings in secret dry adobo seasoning', 1500],
      ['Filipino BBQ Wings', 'Six twice-fried jumbo wings, Filipino BBQ sauce, ranch', 1500],
      ['Butter Garlic Shrimp Pancit', 'Pancit noodles with butter garlic shrimp', 1500],
      ['Filipino Mac-Ghetti', 'Cheese mac, Filipino sweet spaghetti sauce, ground beef, cheddar', 600],
    ],
  },
  {
    slug: 'bula-pies',
    name: 'Bula Pies Fiji',
    label: 'Bula Pies Fiji',
    cuisine: 'Fijian meat pies',
    tagline: 'Handmade Fijian savoury and sweet pies, sausage rolls and espresso, baked fresh.',
    color: '#9C2424',
    icon: 'bula-pies',
    prep: 12,
    category: 'Savoury Pies',
    site: 'https://bulapiesfiji.com',
    orderUrl: 'https://bulapiesfiji.com/menu',
    phone: '(707) 563-8422',
    address: '2568 Springs Rd, Vallejo',
    items: [
      ['Beef Stew Pie', 'Tender ground beef, peas, carrots and potatoes', 1000],
      ['Butter Chicken Pie', 'Creamy buttery sauce with a hint of heat', 1100],
      ['Homestyle Chicken', 'Tender chicken and broccoli in a flaky crust', 1000],
      ['Mince & Cheese Pie', 'Minced meat and melted cheese, the softest cheeseburger', 1000],
      ['Smoked Brisket Pie', 'Smoked brisket with savoury seasonings', 1200],
      ['Jamaican me Hungry Pie', 'Chicken marinated in bold jerk spice', 1100],
      ['Pork Sausage Roll', 'Homemade pork sausage in buttery flaky pastry', 500],
      ['Lamb Sausage Roll', 'Homemade lamb sausage in buttery flaky pastry', 500],
      ['Chocanana Pie', 'Fudgy chocolate banana centre with Nutella', 1000],
      ['Pineapple Pie', 'Caramelised pineapple with cinnamon', 1000],
      ['Banana Pudding Trifle', 'Creamy banana trifle cake cup', 600],
      ['Latte', 'Espresso and steamed milk, 12oz', 425],
      ['Mocha', 'Espresso, dark chocolate, steamed milk, whipped cream', 475],
      ['Kumquat Limemade', 'Homemade, sweetened with organic cane sugar', 350],
      ['Nitro Cold Brew', 'Nitro-infused cold brew', 425],
    ],
  },
  {
    slug: 'bread-winners',
    name: 'Bread Winners',
    label: 'Bread Winners',
    cuisine: 'Sandwiches',
    tagline: 'An Oakland sandwich company. Open six days a week, 11am to 4pm.',
    color: '#E0A32E',
    icon: 'bread-winners',
    prep: 12,
    category: 'Sandwiches',
    site: 'https://www.instagram.com/breadwinnersoak/',
    contactOnly:
      'Bread Winners publish their menu on Instagram rather than a site. Message @breadwinnersoak to order.',
    items: [],
  },
  {
    slug: 'rains-plates',
    name: "Rain's Plates",
    label: "Rain's Plates",
    cuisine: 'Soul food, Asian fusion',
    tagline: 'Southern soul food crossed with Asian fusion, sold as pop-ups and catering.',
    color: '#E8508D',
    icon: '',
    prep: 25,
    category: 'Menu',
    site: 'https://www.instagram.com/rains_plates/',
    phone: '(510) 630-8739',
    address: 'Pinole',
    contactOnly:
      'The menu changes with each pop-up and is announced on Instagram. Message @rains_plates for what is on today.',
    items: [],
  },
  {
    slug: 'midnite-theories',
    name: 'Midnite Theories',
    label: 'Midnite Theories',
    cuisine: 'Skate shop',
    tagline: 'Boards, wheels, trucks, bearings and grip. Not a kitchen.',
    color: '#0A0A0A',
    icon: 'midnite-theories',
    prep: 0,
    category: 'Shop',
    site: 'https://www.midnitetheories.com',
    contactOnly:
      'Midnite Theories is a skate shop, not a food business — it sells boards and parts through its own online store.',
    items: [],
  },
  {
    slug: 'sincity-pits',
    name: 'Sin City Pits',
    label: 'Sin City Pits',
    cuisine: 'Dog breeder',
    tagline: 'American terrier, pitbull and bully breeder. Not a kitchen.',
    color: '#B3161C',
    icon: 'sincity-pits',
    prep: 0,
    category: 'Info',
    site: 'https://sincitypits.com',
    contactOnly:
      'Sin City Pits is a breeder, not a food business. There is nothing here to order.',
    items: [],
  },
]
