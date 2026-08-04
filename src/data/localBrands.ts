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
  /** name, description, cents, and the basename of a vendor-supplied photo in /food. */
  items: [string, string, number, string?][]
  /** Real ordering link, where one exists. */
  orderUrl?: string
  site?: string
  phone?: string
  address?: string
  /** Set when the whole menu is triangulated rather than published. */
  pricesEstimated?: string
  /** Set when no menu is published anywhere. No items are invented. */
  contactOnly?: string
  /**
   * The stocked subset, by item name. Everything not listed stays in `items`
   * but is not sold — three to five per partner keeps stock space and prep
   * load manageable across many kitchens. Omit to offer the whole menu.
   */
  offer?: string[]
  /** Replaces the generic "they also take orders on X" footer. */
  siteNote?: string
  /** Button label on a contact-only brand. Defaults to "Open their page". */
  siteCta?: string
  /** Kitchen's own dietary description, e.g. ['Halal']. Never a certification. */
  dietary?: string[]
  /** Partner discount. Headline states the guaranteed floor, not a range. */
  perk?: { headline: string; detail: string }
  /**
   * Their posted prices already contain sales tax, so checkout must not add it
   * again. Backed out for the vendor's records rather than ignored — they
   * still owe it, it is just already inside the price the customer sees.
   */
  taxIncluded?: boolean
}

/**
 * trycurio.app, tagged so a visit that started here is attributable.
 *
 * The landing site's own analytics.js reads utm_source / utm_medium /
 * utm_campaign / utm_content / utm_term on arrival, persists them to
 * localStorage (last non-empty touch wins) and feeds them to GA4 — so these
 * exact parameter names are what it already understands. Nothing custom is
 * needed, and inventing a different scheme would land as "direct" traffic.
 *
 * `placement` distinguishes where in this app the tap came from, so a home
 * screen icon and a future in-cart promo can be told apart without minting a
 * second campaign.
 */
export function trackedCurioLink(placement: string): string {
  const params = new URLSearchParams({
    utm_source: 'the-home-screen',
    utm_medium: 'referral',
    utm_campaign: 'food-truck',
    utm_content: placement,
  })
  return `https://trycurio.app/?${params.toString()}`
}

export const LOCAL_SEED: LocalSeed[] = [
  {
    slug: 'top-dog',
    name: 'top dog',
    label: 'top dog',
    cuisine: 'Hot dogs, sausages',
    tagline: 'Finely seasoned grilled sausages on French rolls. Berkeley, since 1966.',
    color: '#FFF33E',
    icon: 'top-dog',
    prep: 7,
    category: 'Grilled Sausages',
    site: 'https://topdoghotdogs.com',
    phone: '(510) 843-5967',
    address: '2534 Durant Ave, Berkeley',
    taxIncluded: true,
    // Deliberately no `offer`: the operator wants top dog's full menu, unlike
    // the other partners where only three to five items are stocked.
    //
    // Prices are from a photograph of their in-store board (2026-08), and the
    // item wording is their own from topdoghotdogs.com/themenu.html. Both are
    // primary sources, so these are no longer triangulated — the earlier
    // $5.00/$5.25 came off a Postmates listing and carried that platform's
    // markup. The board runs a single ditto column: $4.75 from the Garlic
    // Frankfurter down to Lemon Chicken.
    pricesEstimated:
      'Their board reads that prices INCLUDE tax, so nothing further is added at checkout. Worth confirming with the shop before taking real money. Card and contactless payments have a $5 minimum.',
    items: [
      ['top dog Frankfurter', 'All beef, kosher style', 450],
      ['Garlic Frankfurter', 'Three-quarter beef, quarter pork, fresh garlic', 475],
      ['Hot Link', 'Louisiana style. Beef and four kinds of pepper, h-h-hottt', 475],
      ['Smoked Chicken Apple', 'Chicken with juicy bits of apple, low salt', 475],
      ['Calabrese', 'Italian. Pork, paprika, chili, fennel, semi-hot', 475],
      ['Kielbasa', 'Polish. Two-thirds pork, one-third beef, hearty', 475],
      ['Bockwurst', 'Half pork, half veal, milk and eggs', 475],
      ['the Wienie', 'Veggie. Wheat protein, bell peppers, fennel, eggplant, fresh garlic', 475],
      ['Lemon Chicken', 'Chicken, fresh lemon and garlic. Low salt, low fat, no preservatives', 475],
      ['Mango with Jalapeno', 'From Chef Bruce Aidell. Chicken, mango, jalapeño pepper, cilantro and paprika', 475],
      ['Bratwurst', 'German. Pork and marjoram, genuine old world taste', 500],
      ['Potato Salad', 'Side', 250],
      ['Chili on any dog', 'Add chili to any sausage', 100],
      ['Chili, 10 oz', 'Cup', 200],
      ['Chili, 16 oz', 'Bowl', 300],
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
    // Rolls only — the wings, pancit and mac-ghetti are off. Two of these three
    // are the ones their own site puts photos against; TLC Veggie is the third
    // because a shared cart across kitchens needs one vegetarian option and the
    // other rolls are all meat. Swap it for Chicken Tinola or Earl's Turkey if
    // the kitchen would rather.
    offer: ['Baco Cheeseburger', 'Bicol Express Pork & Shrimp', 'TLC Veggie'],
    siteNote: 'See their full menu and order direct at thelumpiacompany.com',
    items: [
      ['Baco Cheeseburger', 'Ground beef, smoked bacon, cheddar, onions, BBQ and moo moo sauce', 1400, 'lumpia-baco-cheeseburger'],
      ['Chicken Tinola', 'Ground chicken, chayote, ginger, jalapeño, spinach, shoyu aioli', 1300],
      ['Bicol Express Pork & Shrimp', 'Spicy coconut pork and shrimp, Shanghai style, sweet chili', 1300, 'lumpia-bicol-express'],
      ["Earl's Turkey & Veggies", 'Ground turkey, cabbage, carrots, potatoes, peas, sweet chili', 1300],
      ['TLC Veggie', 'Chopped kale, roasted potatoes, roasted garlic and mushrooms', 1200],
      ['Peach Mango Cobbler', 'Caramelised peach and mango, jackfruit, cinnamon wonton strips', 1200],
      ['Adobo Seasoned Wings', 'Six twice-fried jumbo wings in secret dry adobo seasoning', 1500, 'lumpia-adobo-wings'],
      ['Filipino BBQ Wings', 'Six twice-fried jumbo wings, Filipino BBQ sauce, ranch', 1500, 'lumpia-bbq-wings'],
      ['Butter Garlic Shrimp Pancit', 'Pancit noodles with butter garlic shrimp', 1500],
      ['Filipino Mac-Ghetti', 'Cheese mac, Filipino sweet spaghetti sauce, ground beef, cheddar', 600, 'lumpia-macghetti'],
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
    // Named by the operator. Their full menu stays below for when it widens.
    offer: ['Beef Stew Pie', 'Butter Chicken Pie', 'Mince & Cheese Pie', 'Kumquat Limemade'],
    siteNote:
      'Discover more favorites and even order frozen pies shipped directly to your door by visiting bulapiesfiji.com',
    items: [
      ['Beef Stew Pie', 'Tender ground beef, peas, carrots and potatoes', 1000, 'bula-beef-stew'],
      ['Butter Chicken Pie', 'Creamy buttery sauce with a hint of heat', 1100, 'bula-butter-chicken'],
      ['Homestyle Chicken', 'Tender chicken and broccoli in a flaky crust', 1000],
      ['Mince & Cheese Pie', 'Minced meat and melted cheese, the softest cheeseburger', 1000, 'bula-mince-cheese'],
      ['Smoked Brisket Pie', 'Smoked brisket with savoury seasonings', 1200],
      ['Jamaican me Hungry Pie', 'Chicken marinated in bold jerk spice', 1100],
      ['Pork Sausage Roll', 'Homemade pork sausage in buttery flaky pastry', 500],
      ['Lamb Sausage Roll', 'Homemade lamb sausage in buttery flaky pastry', 500],
      ['Chocanana Pie', 'Fudgy chocolate banana centre with Nutella', 1000],
      ['Pineapple Pie', 'Caramelised pineapple with cinnamon', 1000],
      ['Banana Pudding Trifle', 'Creamy banana trifle cake cup', 600],
      ['Latte', 'Espresso and steamed milk, 12oz', 425],
      ['Mocha', 'Espresso, dark chocolate, steamed milk, whipped cream', 475],
      ['Kumquat Limemade', 'Homemade, sweetened with organic cane sugar', 350, 'bula-kumquat'],
      ['Nitro Cold Brew', 'Nitro-infused cold brew', 425],
    ],
  },
  {
    slug: 'bread-winners',
    name: 'Bread Winners',
    label: 'Bread Winners',
    cuisine: 'Sandwiches',
    tagline: 'An Oakland sandwich company. Sandwiches, salads, juices and smoothies, Monday to Saturday.',
    color: '#E0A32E',
    icon: 'bread-winners',
    prep: 12,
    category: 'Sandwiches',
    site: 'https://www.instagram.com/breadwinnersoak/',
    orderUrl: 'https://www.doordash.com/store/bread-winners-oakland-llc-oakland-39886361/',
    address: '917 Washington St, Oakland',
    pricesEstimated:
      'These are DoorDash listing prices, which carry the platform markup. Counter prices at the shop are lower — confirm before charging.',
    // Taken from DoorDash's "Most Ordered" section, in the order it lists
    // them — actual order counts rather than a guess at what sells.
    offer: ['BYO Sandwich', 'The Breadwinner Club', 'Crab Melt', 'Tuna Sub', 'Turkey & Swiss'],
    siteNote: 'See their full menu and order direct on DoorDash',
    // Descriptions are the shop's own wording, not a paraphrase.
    items: [
      ['Crab Melt', 'Lump crab, swiss cheese, tomato, on toasted ciabatta', 2185, 'bread-winners-crab-melt'],
      ['The Breadwinner Club', 'Smoked turkey, black forest ham, applewood smoked bacon, cheddar, lettuce, tomato and garlic aioli on sourdough', 1950, 'bread-winners-club'],
      ['Tuna Sub', 'Housemade tuna salad, provolone, shredded lettuce, tomato, red onion, pickles, on a french roll', 1835, 'bread-winners-tuna-sub'],
      ['Tuna Melt', 'Housemade tuna salad, melted and pressed', 1835],
      ['Turkey & Swiss', 'Roasted turkey, swiss cheese, lettuce, tomato, chipotle aioli on sourdough', 1720, 'bread-winners-turkey-swiss'],
      ['Turkey Pesto Panini', 'Roasted turkey, provolone, tomato, spinach, pesto aioli on ciabatta', 1720, 'bread-winners-turkey-pesto'],
      ['BYO Sandwich', 'Choose your own adventure', 1610, 'bread-winners-byo'],
    ],
  },
  {
    slug: 'rains-plates',
    name: "Rain's Plates",
    label: "Rain's Plates",
    cuisine: 'Soul food, Asian fusion',
    tagline: 'Southern soul food crossed with Asian fusion, sold as pop-ups and catering.',
    color: '#E8508D',
    icon: 'rains-plates',
    prep: 25,
    category: 'Menu',
    site: 'https://www.instagram.com/rains_plates/',
    phone: '(510) 630-8739',
    address: 'Pinole',
    pricesEstimated:
      'DoorDash listing prices, which carry the platform markup — and their DoorDash store currently shows as inactive. Message @rains_plates to confirm what is on today.',
    // The three meals, plus the side that is theirs rather than generic.
    offer: ['Party Wings Meal', '2 Jumbo Shrimp Skewers Meal', 'Tender Tri Tip Meal', 'Candied Yams'],
    siteNote: 'See what is on this week at instagram.com/rains_plates',
    items: [
      ['Party Wings Meal', 'About 1 lb, marinated 24 hours, fried naked, your choice of sauce, side, bread and dip', 1950, 'rains-plates-party-wings'],
      ['2 Jumbo Shrimp Skewers Meal', '8 pieces, marinated 24 hours, pan seared, choice of sauce, side, bread and dip', 2150, 'rains-plates-shrimp-skewers'],
      ['Tender Tri Tip Meal', '7 oz marinated in 10 spices for 48 hours, choice of sauce, side, bread and dip', 2150, 'rains-plates-tri-tip'],
      ['Candied Yams', 'Side', 650],
      ['French Fries', 'Side', 600],
      ['Jasmine Rice', 'Side', 400],
    ],
  },
  {
    slug: 'elemonkey',
    name: 'Elemonkey',
    label: 'Elemonkey',
    cuisine: 'Apparel',
    tagline: 'Constant Elevation. Streetwear out of San Francisco.',
    color: '#0A0A0A',
    icon: 'elemonkey',
    prep: 0,
    category: 'Shop',
    site: 'https://www.elemonkey.com/',
    // No menu is invented here. elemonkey.com is password-protected, so
    // nothing about what they sell or what it costs can be read at source.
    // The icon is their own mark, lifted from their site's own uploads at
    // 800x800 and composited on black — not a redraw and not a generated
    // approximation, either of which would be a different brand's identity.
    // Real products at real prices, but READ FROM AN ARCHIVED CAPTURE of their
    // storefront (Oct 2025) because they have since closed it behind an
    // invite-only gate on purpose. That is why the flag below is blunt: these
    // are not confirmed current, and the shop is not open to the public.
    pricesEstimated:
      'From their last public storefront in October 2025, not confirmed current. Elemonkey is invite-only now, so confirm with them before ordering.',
    siteNote: 'Visit elemonkey.com',
    items: [
      ['ELEMONKEY Embroidered Polo, black', 'Embroidered polo', 7000],
      ['ELEMONKEY Embroidered Polo, white', 'Embroidered polo', 7000],
      ['Elemonkey Snap Back Hat, red', 'One size', 4000],
      ['Elemonkey Snap Back Hat, white', 'One size', 4000],
      ['Elemonkey Snap Back Hat, black', 'One size', 4000],
    ],
  },
  {
    slug: 'curio',
    name: 'Curio',
    label: 'Curio',
    cuisine: 'Reading app',
    tagline: 'Turn scrolling into rabbit holes worth reading.',
    color: '#1A0B2E',
    icon: 'curio',
    prep: 0,
    category: 'App',
    site: trackedCurioLink('home-screen-icon'),
    contactOnly:
      'Curio is an iOS app, not a kitchen. Full-screen cards on psychology, mysteries, forgotten history and strange science — a better way to scroll while you wait for your order.',
    siteCta: 'Open Curio',
    items: [],
  },
  {
    slug: 'pod-dtg',
    name: 'POD DTG',
    label: 'POD DTG',
    cuisine: 'Print on demand',
    tagline: 'Print on demand.',
    color: '#0A0A0A',
    icon: 'pod-dtg',
    prep: 0,
    category: 'Shop',
    // Name and mark only, by the operator's instruction — it is a print-on-
    // demand brand and there is nothing to order through this app. Phrased as
    // settled rather than pending, so the tile does not read as unfinished.
    // This entry previously carried a wood-fired pizza menu ported from the old
    // hub, which is why it was removed once; a printer is not a pizzeria.
    contactOnly: 'POD DTG is a print-on-demand brand, not a kitchen. Nothing to order here.',
    items: [],
  },
  {
    slug: 'hybrid-workz',
    name: 'Hybrid Workz',
    label: 'Hybrid Workz',
    cuisine: 'Toyota hybrid service',
    tagline: 'Toyota hybrid service and maintenance, Fremont.',
    color: '#8C1D24',
    icon: '',
    prep: 0,
    category: 'Service',
    site: 'https://www.instagram.com/hybridworkz/',
    phone: '(510) 399-9140',
    // ADDRESS DELIBERATELY OMITS THE STREET NUMBER.
    //
    // Two conflict, and both come from surfaces the business itself controls:
    // their Instagram bio says "45554 industrial place unit 8", their
    // owner-verified Google Business Profile says "45450 Industrial Pl". Both
    // street numbers are real, about 100 m apart on the same road, and Google's
    // own map pin sits on 45450. Publishing either one sends somebody to the
    // wrong unit, so publish neither until a phone call settles it — the phone
    // number is verified and gets the customer there.
    address: 'Industrial Pl, Fremont, CA 94538',
    // No services and no prices are listed because they publish none. This was
    // checked, not assumed: all 56 of their Instagram captions were read and
    // there is not a single price on any surface they control. A repair quote
    // depends on the car, and inventing a price list for a garage would be
    // worse here than anywhere else on this home screen.
    perk: {
      headline: '10% off for BEASTY EATS customers',
      detail:
        'Up to 25% on larger jobs, at the shop\u2019s discretion. Mention BEASTY EATS when you book.',
    },
    contactOnly:
      'Hybrid Workz service Toyota hybrids \u2014 a garage, not a kitchen, so there is nothing to order here. They take bookings by phone or DM only. Confirm the unit number when you call: their Instagram and their Google listing give different street numbers on the same road.',
    siteCta: 'Message @hybridworkz',
    items: [],
  },
  {
    slug: 'paulo-sausage',
    name: 'Paulo Sausage Co',
    label: 'Paulo Sausage',
    cuisine: 'Italian sandwiches, sausage',
    tagline: 'Traditionally made sausage and specialty Italian sandwiches. Pittsburg.',
    color: '#111111',
    icon: 'paulo-sausage',
    prep: 15,
    category: 'Sandwiches',
    site: 'https://www.paulosausageco.com',
    orderUrl: 'https://www.paulosausageco.com/sandwich-pre-order',
    address: '2951 Harbor Street Suite E, Pittsburg',
    // Counter prices from their OWN Square Online catalogue, not a delivery
    // platform. DoorDash adds a flat $3.00 to every overlapping item, measured
    // across six of them, so the platform figures were not used.
    offer: [
      'Italian Cold Cut',
      'Mortadella & Brie',
      'Ham & Burrata',
      'Meatball Sub',
      'Italian Dip',
    ],
    siteNote: 'Pre-order sandwiches direct at paulosausageco.com',
    items: [
      ['Italian Cold Cut', 'Classic Italian cold cut sandwich', 2000],
      ['Mortadella & Brie', 'Rich mortadella with brie', 1650],
      ['Ham & Burrata', 'Ham with burrata', 1600],
      ['Meatball Sub', 'Hearty classic meatball sub', 1550],
      ['Salami & Stuffed Pepperoncini', 'Savoury salami with stuffed pepperoncini', 1550],
      ['Italian Dip', 'Italian dip sandwich', 1500],
      ['Italian Smash', 'Smash burger, Italian style', 1700],
      ['Meat Lasagna', 'Scratch-made', 2200],
      ['Sausage & Peppers', 'Their own sausage with peppers', 2200],
      ['Hot Italian Meatballs', 'Hot Italian meatballs', 1800],
    ],
  },
  {
    slug: 'pippal',
    name: 'Pipp\u0101l',
    label: 'Pipp\u0101l',
    cuisine: 'Regional Indian',
    tagline: 'Regional Indian, elevated dining. Dublin.',
    color: '#9B3326',
    icon: 'pippal',
    prep: 25,
    category: 'Regional Indian',
    site: 'https://www.pippaldublin.com',
    orderUrl: 'https://order.toasttab.com/online/pippal-dublin-4500-tassajara-rd-unit-c',
    address: '4500 Tassajara Rd, Suite C, Dublin',
    // OPEN, despite a "coming soon" post still sitting on their grid — that
    // post is stale. Dine-in list prices from their own site's menu backend.
    offer: [
      'Live Chaat Tray',
      'Chicken Tikka Trio',
      'Lamb Chops',
      'Malai Kofta',
      'Mushroom Galouti',
    ],
    siteNote: 'See the full menu and book at pippaldublin.com',
    items: [
      ['Lamb Chops', 'Juicy lamb chops marinated in yogurt and spices', 3200],
      ['Malai Kofta', 'Koftas in rich cashew gravy', 2800],
      ['Live Chaat Tray', 'Regional Indian chaats with papadi and dhokla', 2700],
      ['Chicken Tikka Trio', 'Three tikka variations: classic, malai and more', 2200],
      ['Prawn Pepper Fry', 'Prawns tossed with black pepper and curry leaf', 2400],
      ['Mushroom Galouti', 'Mushroom mince kebab with brown cashew-apricot', 2000],
      ['Kolkata Fish Cutlet', 'Crispy fried fish with a nutty peanut-butter note', 2200],
      ['Andhra Fried Chicken', 'Spiced Andhra-style fried chicken', 2200],
      ['Chakri Paneer', 'Paneer roomali stuffed with saffron', 2000],
      ['Papad Sampler', 'Assortment of papadums with chutneys', 1400],
    ],
  },
  {
    slug: 'glasshouzz',
    name: 'Glasshouzz',
    label: 'Glasshouzz',
    cuisine: 'California fusion',
    tagline: 'Pizza, salad and snacks. Livermore.',
    color: '#1E2A22',
    icon: 'glasshouzz',
    prep: 20,
    category: 'Pizza & Plates',
    site: 'https://www.glasshouzzusa.com/',
    orderUrl: 'https://glasshouzz.toast.site/order/glass-houzz-4575-livermore-outlets-drive',
    address: '4575 Livermore Outlets Drive, Livermore',
    // Prices from their OWN Toast ordering site. DoorDash runs about 25% higher
    // on the same items, measured across fifteen of them, so it was not used.
    // Pizzas are sold by size; the 14 inch price is listed and named as such so
    // the figure on the tile is one a customer can actually pay.
    offer: [
      'Pepperoni Rustic, 14 inch',
      'Margherita Lovers, 14 inch',
      'Spaghetti Carbonara',
      'Lamb Roll Wrap',
      'Classic Ceasar',
    ],
    siteNote: 'Order direct on their own Toast page',
    items: [
      ['Pepperoni Rustic, 14 inch', 'Classic pepperoni with a rich tomato sauce', 2800],
      ['Margherita Lovers, 14 inch', 'Crushed San Marzano tomato, a timeless classic', 2600],
      ['Mushroom Truffle, 14 inch', 'Sauteed mushrooms and truffle', 2400],
      ['Spaghetti Carbonara', 'Spaghetti carbonara', 2200],
      ['Penne Arrabbiata', 'Penne arrabbiata', 1800],
      ['Lamb Roll Wrap', 'Lamb roll wrap', 1800],
      ['Classic Ceasar', 'Their spelling. Classic Caesar salad', 1200],
      ['GH Caprese', 'Caprese', 1200],
      ['Garlic Bread', 'Garlic bread', 600],
    ],
  },
  {
    slug: 'poof-of-alchemy',
    name: 'Poof of Alchemy',
    label: 'Poof of Alchemy',
    cuisine: 'Copper drinkware',
    tagline: 'A solid copper wand for your own bottle or glass.',
    color: '#B87333',
    icon: '',
    prep: 0,
    category: 'Shop',
    site: 'https://poofofalchemy.com',
    // One product, one price, read from their own Shopify storefront and
    // confirmed identical across their own products.json endpoints — so it is
    // orderable rather than contact-only. Not food, so it still sits with the
    // non-kitchen tiles.
    siteNote: 'See it on their own store at poofofalchemy.com',
    items: [
      ['Copper Water Wand', 'Two per pack. A solid copper rod for your own bottle or glass', 4100],
    ],
  },
  {
    slug: 'allis-dog-walking',
    name: "Alli's Dog Walking & Petsitting",
    label: "Alli's Dog Walking",
    cuisine: 'Dog walking, pet sitting',
    tagline: 'Dog walking and pet sitting. Philadelphia and southern New Jersey.',
    color: '#111111',
    // No icon file: their logo is not published anywhere fetchable. The
    // generated monogram is the honest placeholder — asking an image model for
    // "her logo" would produce a convincing fake of a real mark, which is a
    // worse problem than not having it yet.
    icon: '',
    prep: 0,
    category: 'Service',
    phone: '(856) 360-5288',
    address: 'Philadelphia and southern New Jersey',
    // NO WEBSITE. allisdogwalking.com no longer resolves at all (NXDOMAIN), so
    // linking it would send customers to a browser error. The phone number is
    // the only route that works, and it is verified against her Yelp listing.
    //
    // Her own description of the work is quoted as hers rather than asserted as
    // a qualification: no licence, bonding or insurance is published anywhere,
    // and care of animals with medical needs is not a claim to make on someone
    // else's behalf.
    contactOnly:
      "Alli walks dogs and pet-sits \u2014 not a kitchen, so there is nothing to order here. She describes her service as specialising in dogs with medical, behavioural and social needs. She works in Philadelphia and southern New Jersey, not the Bay Area. Call to arrange.",
    items: [],
  },
]
