/*
  WHAT A SEARCH FOUND, FOR PAGES THAT WERE MISSING IT.

  Leon, 2026-10-25: "all that are lacking info see if u can find them by
  searching online". Until then a page carried only what the business published
  itself, so 546 pages had no menu or no hours. This fills the food businesses
  among them from the best source a search turns up, in this order: their own
  site or ordering page, their store on a delivery app (DoorDash, Uber Eats,
  Grubhub), then a listing (Yelp, Google) for hours only. Nothing is invented,
  and a page whose search found nothing keeps what it had.

  A menu priced from a delivery app, a listing or a photo of a menu board
  carries `pricesEstimated`, so the page says its prices need confirming.
  Every entry's sources are in research/online-fills.json.

  Keyed by seed slug. Applied over the seed in brands.ts, so it reaches roster
  names, researched seeds and their vendors alike.
*/
import type { LocalSeed } from './localBrands'

export const ONLINE_FILLS: Record<string, Partial<LocalSeed>> = {
  '7-mile-house': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["BBQ Wings", "", 1850],
          ["Buffalo Wings", "Spicy chicken wings with ranch.", 1850],
          ["Mango Habanero Wings", "", 1900],
          ["Sweet Chili Garlic Wings", "Wings in sweet chili sauce sautéed in garlic.", 1850],
          ["Calamari", "Hand-cut rings & tentacles, deep-fried, with garlic aioli & French fries.", 1800],
          ["Chicken Tenders", "Panko-crusted chicken breast strips with ranch.", 1700],
          ["French Fries", "Basketful of seasoned fries.", 800],
          ["Garlic Fries", "Tossed in sautéed garlic and parsley.", 900],
          ["Sweet Potato Fries", "Sweet potato crinkles with spicy mayo.", 900],
          ["Onion Rings", "Beer-battered, with ranch.", 1100],
          ["Zucchini Sticks", "Panko-fried, topped with parmesan, with ranch.", 1100],
          ["Garlic Mushrooms", "Button mushrooms sautéed in garlic, soy sauce and spices.", 1300],
          ["Loaded Nachos", "Homemade chips with avocado, sour cream, salsa, nacho cheese, jalapeños and your choice of meat.", 2200],
          ["Loaded Sisig Fries", "", 2200],
          ["Lumpia, Pork/Chicken", "Hand-rolled mini egg rolls with sweet chili sauce.", 1200],
          ["Lumpia, Fish", "3 Filipino-style egg rolls with basa fish and soy-vinegar dip.", 1200],
          ["Lumpia, Vegetable", "Carrots, bean sprouts, cabbage, with garlic soy vinegar dip.", 1100],
          ["Salpicao", "NY Angus steak chunks in a la pobre sauce with jalapeños and garlic bread.", 2500],
          ["Sisig", "Grilled diced pork (cheeks, meat, a little liver) with onions, jalapeños and herbs.", 1950],
          ["Sisig Lettuce Wrap", "Sizzling sisig with romaine lettuce.", 2100],
          ["Large Order of Wings (per wing)", "25 pieces or more, take-out only.", 225],
          ["Frozen Lumpia (25 pieces)", "Hand-rolled mini egg rolls to cook at home, with sweet chili dip.", 2000],
          ["Lumpia (50 pieces)", "", 4000]
        ]
      },
      {
        name: "Salads",
        items: [
          ["Caesar Salad", "Romaine, homemade croutons, house Caesar; add chicken, blackened prawns or salmon.", 1600],
          ["Chicken Cobb Salad", "Romaine with chicken, bacon, croutons, tomatoes, mushrooms, boiled egg.", 1900],
          ["Kenny's Salmon Vinaigrette Salad", "Grilled salmon over spring greens, beets, carrots, tomato, olives, cucumber.", 2250],
          ["Side Salad", "Mixed baby greens, onions, carrots, beets and cucumber with your dressing.", 800]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["7 Mile Burger", "1/2 lb Angus beef, bacon, lettuce, tomato, mayo, onions, pickles on brioche, with fries.", 1950],
          ["Cow Palace Burger", "As seen on United States of Bacon: double Angus patty, onion rings, bacon and more.", 2700],
          ["Patty Melt", "1/2 lb Angus beef, sautéed onions, Swiss and pickles on rye, with fries.", 1800],
          ["Beyond Burger", "Plant-based patty, lettuce, tomato, onions, mayo, pickle on brioche.", 1850],
          ["Beyond Patty Melt", "Plant-based patty with vegan mozzarella, sautéed onions, pickle.", 1700],
          ["Smoked Beef Brisket", "", 2200],
          ["Chicken Pesto Sandwich", "Grilled chicken, pesto, onions, lettuce, tomato on Dutch crunch, with fries.", 1800],
          ["New York Steak Sandwich", "Lettuce, tomato, mayo and onions on Dutch crunch, with fries.", 2600],
          ["Pulled Pork Sandwich", "Shredded adobo with BBQ sauce on brioche, with fries or salad.", 1800],
          ["Sole Fish Sandwich", "Panko-crusted sole, tartar, lettuce, tomato on brioche, with fries.", 1900]
        ]
      },
      {
        name: "Entrees",
        items: [
          ["Adobo with Rice", "Best seller: tender pork marinated in soy sauce, thrice-prepared 7 Mile style.", 1950],
          ["Arroz Caldo", "", 1400],
          ["Cup of Arroz Caldo", "", 700],
          ["Basa Fillet", "Grilled in lemon butter with pico de gallo and steamed vegetables.", 2100],
          ["Brazilian Fish Chowder", "Moqueca-style fish, bell peppers and onions in coconut broth.", 2300],
          ["Cioppino", "SF-style: Dungeness crab, mussels, prawns, clams and white fish.", 2800],
          ["Deep Fried Porkchops", "Two breaded chops with creamy mushroom horseradish sauce and salad.", 2400],
          ["Deep Fried Prawns", "Panko-crusted jumbo tiger prawns with tartar sauce and fries.", 2200],
          ["Deep Fried Sole", "Panko-crusted sole fillet with tartar sauce and fries.", 2200],
          ["Fish & Chips", "Beer-battered fish with fries and homemade tartar sauce.", 2300],
          ["Fish Tacos", "Three corn tortilla tacos with grilled fish, lettuce, salsa, sour cream, cheese.", 2100],
          ["Grilled Salmon", "Herb butter sauce, mashed potatoes and steamed veggies.", 2500],
          ["Grilled Steak", "New York steak with garlic mashed potatoes and steamed veggies.", 2700]
        ]
      },
      {
        name: "Pasta",
        items: [
          ["Fettuccine", "Alfredo, pomodoro, pesto or garlic olive oil.", 1350],
          ["Chicken Fettuccine", "Your choice of sauce with chicken breast.", 2100],
          ["Shrimp Fettuccine", "Your choice of sauce with shrimp.", 2400],
          ["Vegetable Fettuccine", "Your choice of sauce with seasonal vegetables.", 1850],
          ["Linguine Bolognese", "Italian sausage, Angus beef, tomatoes, basil, garlic, mushrooms.", 2300],
          ["Seafood Linguine", "Shrimp, salmon, bay scallops and peas in garlic and olive oil.", 2600],
          ["Shirley's Scampi", "Large prawns in lemon garlic sauce with linguine and steamed veggies.", 2500]
        ]
      },
      {
        name: "FAHM Specials (October)",
        items: [
          ["Chicken Adobo Bowl", "", 1800],
          ["Dinamita Lumpia", "", 1400],
          ["Filipino Cioppino", "", 2900],
          ["Balut", "", 400]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Ube Cheesecake (1 slice)", "Purple yam cheesecake topped with macapuno.", 1100],
          ["Mango Cheesecake (1 slice)", "Fresh Manila mangoes, graham cracker crust.", 1100],
          ["Blueberry Lavender Cheesecake", "Blueberry compote and lavender glaze.", 1000],
          ["Whole Blueberry Lavender Cheesecake", "", 6500],
          ["Calamansi Lime Pie", "Mom Cleo's calamansi pie with vanilla ice cream; October only.", 1100],
          ["Key Lime Pie (1 slice)", "Graham cracker crust, by Mom Cleo.", 1000],
          ["Funky Monkey (1 slice)", "Warm banana cake, salted caramel, banana coins, vanilla ice cream.", 1000],
          ["Brownie à la Mode", "Warm brownie with vanilla ice cream.", 1100],
          ["Apple Raisin Bread Pudding", "With vanilla ice cream.", 1000],
          ["Ube Tres Leches", "2021 Ube Bake Off champion recipe.", 1200],
          ["Dot Cake", "", 1100],
          ["Vanilla Ice Cream", "", 200]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Side Mashed Potatoes", "", 700],
          ["Side Steamed Veggies", "", 900],
          ["Side Linguini", "", 800],
          ["Side Garlic Bread", "", 600],
          ["Side Buttered Toast", "", 500],
          ["Buttered Bread", "", 400],
          ["Side Rice", "", 300],
          ["Side Egg", "", 300],
          ["Side Avocado", "", 300],
          ["Side Romaine Lettuce", "", 300],
          ["Side of Pico de Gallo (1 cup)", "", 500],
          ["Side Adobo Gravy", "", 200],
          ["Side Porkchop Gravy", "", 200]
        ]
      },
      {
        name: "Non-Alcoholic Drinks",
        items: [
          ["Coca-Cola", "", 500],
          ["Diet Coke", "", 500],
          ["Sprite", "", 500],
          ["Gingerale", "", 500],
          ["Ginger Beer (bottle)", "Bundaberg, 12 oz.", 600],
          ["Iced Tea", "", 500],
          ["Arnold Palmer", "", 500],
          ["Lemonade", "", 500],
          ["Strawberry Lemonade", "", 700],
          ["Josie's Fruit Tea", "Muddled orange, cherries and mint with iced tea and lemonade.", 900],
          ["Orange Crush", "Muddled oranges and cherries with OJ and lemonade.", 900],
          ["Lychee No-jito", "", 1100],
          ["Shirley Temple", "", 700],
          ["Roy Rogers", "", 700],
          ["Virgin Piña Colada", "", 900],
          ["Virgin Margarita", "", 800],
          ["Virgin Mango Margarita", "", 1100],
          ["Virgin Strawberry Margarita", "", 1000],
          ["Virgin Daiquiri", "", 900],
          ["Virgin Ube Colada", "", 1000],
          ["Virgin Ube-B-Boba", "", 1300],
          ["Virgin Bloody Mary", "", 900],
          ["Ube Iced Coffee", "", 900],
          ["Coffee", "", 500],
          ["Hot Tea", "", 400],
          ["Hot Chocolate", "", 800],
          ["Orange Juice", "", 700],
          ["Cranberry Juice", "", 700],
          ["Guava Juice", "", 700],
          ["Mango Juice", "", 700],
          ["Pineapple Juice", "", 700],
          ["Milk", "", 400],
          ["Red Bull", "", 900],
          ["Soda Water", "", 200],
          ["Tonic Water", "", 500]
        ]
      }
    ],
    orderUrl: "https://order.toasttab.com/online/7-mile-house-sports-bar-grill",
    siteNote: "Menu and prices from their own Toast online ordering page (linked from 7milehouse.com/order); alcohol left out."
  },
  'addis-oakland': {
    hours: "Daily 11:30am–10pm",
    siteNote: "Hours from Yelp; their own site lists none."
  },
  'affinage-boards': {
    hours: "Mon–Fri 10am–5pm, Sat 8am–3pm, Sun 9am–2pm",
    siteNote: "Hours are from their claimed Yelp page (linked from their own site); their site says same-day delivery orders must be placed by phone before 2pm."
  },
  'alive-kitchen': {
    hours: "Weekly meal prep: order by Thu 6pm; delivery or Concord-area pickup Sun & Mon 2–6pm",
    orderUrl: "https://eatalivekitchen.com/menu",
    siteNote: "Alive Kitchen is a weekly meal-prep service with no storefront; the order cutoff and delivery/pickup windows are from eatalivekitchen.com."
  },
  'alma-dessert': {
    hours: "Sun–Thu 12pm–9pm, Fri–Sat 12pm–10pm",
    orderUrl: "https://www.almadessert.com/s/order",
    siteNote: "Hours are the business hours set on their own Square online store."
  },
  'alora-social': {
    hours: "Sun–Thu 11:30am–9pm, Fri–Sat 11:30am–10pm",
    address: "6000 Bollinger Canyon Rd Suite 1100, San Ramon, CA 94583",
    phone: "(925) 236-2026",
    siteNote: "Hours from OpenTable and AAA listings, which agree; visitalora.com was not readable."
  },
  'asian-box': {
    hours: "Mon–Sat 11am–10pm, Sun 11am–8pm",
    orderUrl: "https://order.online/business/Asian%20Box%20Group-16?pickup=true",
    siteNote: "Hours are from the Chestnut Street listing on asianbox.com/locations."
  },
  'baekjeong-san-jose': {
    hours: "Sun–Thu 11am–10pm, Fri–Sat 11am–12am",
    siteNote: "Hours from their own website."
  },
  'baithak': {
    hours: "Daily 11am–10pm",
    orderUrl: "https://baithak.onlineorders.novatab.com/",
    siteNote: "Hours are from the footer on baithak.us, which OpenTable and AAA also list; online ordering link is the one on their site."
  },
  'bakefections': {
    hours: "Mon–Fri 8am–5pm, Sat–Sun 8am–2pm",
    siteNote: "Hours come from Bakefections' Yelp listing; the business takes custom orders through a Google Form and publishes no prices."
  },
  'balompie': {
    sections: [
      {
        name: "Pupusas (with curtido & salsa roja)",
        items: [
          ["Pupusa de Queso", "From", 450],
          ["Pupusa de Queso con Frijol", "From", 450],
          ["Pupusa de Frijol", "From", 450],
          ["Pupusa Revuelta", "From. Cheese and ground chicharrón", 450],
          ["Pupusa de Chicharrón, Frijol y Queso", "From", 450],
          ["Pupusa de Chicharrón", "From", 450],
          ["Pupusa de Chicharrón y Frijol", "", 450],
          ["Pupusa de Queso con Loroco", "From", 500],
          ["Pupusa de Queso, Frijol y Loroco", "From", 500],
          ["Pupusa de Chicharrón, Loroco y Queso", "From", 500],
          ["Pupusa de Chicharrón, Frijol, Loroco y Queso", "From", 500],
          ["Pupusa Mexicana", "From. Chicharrón, jalapeño and cheese", 500],
          ["Pupusa de Chorizo y Queso", "From", 500],
          ["Pupusa de Pollo y Queso", "From", 500],
          ["Pupusa de Pollo, Frijol y Queso", "", 500],
          ["Pupusa de Pollo y Frijol", "", 500],
          ["Pupusa de Carne Asada y Queso", "From", 600],
          ["Pupusa de Camarón y Queso", "From", 500],
          ["Pupusa de Queso y Jalapeño", "From", 450],
          ["Pupusa de Ayote y Queso", "From", 450],
          ["Pupusa de Ayote, Loroco y Queso", "", 500],
          ["Pupusa Verde", "From. Cheese, ayote squash and spinach", 450],
          ["Pupusa de Espinaca y Queso", "", 450],
          ["Pupusa de Ayote, Espinaca y Frijol", "No cheese", 450]
        ]
      },
      {
        name: "Pupusa Platters",
        items: [
          ["One Pupusa con Arroz y Frijoles", "From. One pupusa of your choice with rice and beans", 1100],
          ["Pupusa Platter", "From. Build your own pupusa platter", 1425],
          ["Two Pupusas con Arroz y Frijoles", "From. Two pupusas of your choice with rice and beans", 1500],
          ["Pupusas Combo (2)", "From. Two pupusas with casamiento or rice and beans", 1675]
        ]
      },
      {
        name: "Desayuno / Breakfast",
        items: [
          ["Plátanos, Frijoles, Queso, Crema y Huevos", "Fried sweet plantains, refried beans, cheese, sour cream and eggs; bread or tortillas", 1725],
          ["Huevos Revueltos con Jamón", "Scrambled eggs with ham; rice and beans or casamiento", 1725],
          ["Huevos Rancheros", "Eggs in ranchera tomato sauce; rice and beans or casamiento", 1725],
          ["Chorizos con Huevos", "Eggs scrambled with Salvadoran chorizo", 1725],
          ["Huevos con Loroco", "Eggs scrambled with loroco flower buds", 1725],
          ["Ejotes con Huevo", "Eggs scrambled with green beans", 1725],
          ["Papas con Huevos", "Eggs scrambled with diced potatoes", 1725],
          ["Huevos Revueltos con Espinacas", "Scrambled eggs with fresh spinach", 1725],
          ["Pupusas Breakfast", "From. Pupusas of your choice with eggs", 1725],
          ["Huevos con Casamiento, Queso y Crema", "Eggs with casamiento, cheese and sour cream", 1500],
          ["Huevos con Arroz y Frijoles", "Eggs with rice and beans; bread or tortillas", 1500],
          ["Carne Asada con Huevos y Arroz", "Grilled steak with eggs, rice and beans", 2200]
        ]
      },
      {
        name: "Antojitos",
        items: [
          ["Yuca Cocida o Frita", "From. Fried or boiled cassava with curtido, salsa and chicharrón or other topping", 1800],
          ["Salpicón", "Minced beef with onion, radish, mint and lime; rice and tortillas", 1875],
          ["Bolitas de Yuca con Camarones", "Fried cassava fritters stuffed with shrimp", 1395],
          ["Empanada", "Fried plantain empanada with a sweet filling", 1195],
          ["Tamal de Elote con Crema", "Sweet fresh-corn tamal with sour cream", 1195],
          ["Pastel", "Stuffed masa turnover with curtido and salsa", 1195],
          ["Chile Relleno", "Egg-battered poblano stuffed with cheese or pork", 1900],
          ["Pollo Frito con Sopa", "Fried chicken with a bowl of chicken soup", 2195],
          ["Carne Asada con Sopa", "Grilled steak with a bowl of beef soup", 2195],
          ["Yuca al Mojo de Ajo", "Fried cassava in garlic mojo", 1195]
        ]
      },
      {
        name: "Platos Típicos",
        items: [
          ["Tamal de Elote Cocido", "Steamed sweet corn tamal", 500],
          ["Tamal de Elote Frito", "Fried sweet corn tamal", 500],
          ["Empanadas", "Plantain empanadas filled with custard or bean", 1000],
          ["Pasteles", "Fried turnovers filled with pork, chicken or shrimp", 1150],
          ["Tamal de Elote con Crema (2)", "Two sweet corn tamales, steamed or fried, with sour cream", 1150],
          ["Enchiladas Salvadoreñas", "Fried tortillas with beans, shredded chicken, lettuce, tomato, cheese, sour cream", 1350],
          ["Yuca", "From. Fried or steamed yuca with pork, chicken, steak or shrimp", 1600],
          ["Chile Relleno con Arroz y Frijoles", "Cheese or pork filling; rice, beans, salad", 1700],
          ["Salpicón con Arroz", "Chopped beef with radish, onion and mint; rice, beans, salad", 1700],
          ["Sopa de Gallina", "Hen soup with vegetables; rice and tortillas", 2100],
          ["Sopa de Res con Carne Asada", "Beef soup with grilled carne asada; rice and tortillas", 2300]
        ]
      },
      {
        name: "Combination Plates",
        items: [
          ["Combinación de Pupusa, Yuca y Pastel", "From. One pupusa, yuca and a pastel", 1700],
          ["Pollo Frito y Sopa", "Fried or grilled chicken with soup and rice", 1700],
          ["Chile Relleno y Salpicón", "With rice, beans and tortillas", 2200],
          ["Carne Asada, Chorizo, Casamiento y Queso", "Carne asada and chorizo with casamiento and cheese", 2400]
        ]
      },
      {
        name: "Sopas / Soups",
        items: [
          ["Sopa de Res (Pequeña)", "Small beef soup", 1525],
          ["Sopa de Mondongo (Pequeña)", "Small tripe soup", 1525],
          ["Sopa de Mondongo", "Salvadoran tripe soup with vegetables and yuca", 1800],
          ["Sopa de Pollo", "Chicken soup with vegetables", 1800],
          ["Sopa de Res", "Beef soup with carrots, cabbage, corn and yuca", 1900],
          ["Sopa de Camarón", "Shrimp soup with vegetables", 2100]
        ]
      },
      {
        name: "Pollo / Chicken",
        items: [
          ["Pollo Guisado", "Chicken stewed in tomato sauce; rice, beans, salad", 1800],
          ["Pollo Encebollado", "Grilled chicken with sautéed onions; rice, beans, salad", 1800],
          ["Pollo a la Plancha", "Grilled chicken breast; rice, beans, salad", 1800],
          ["Milanesa de Pollo", "Breaded chicken cutlet; rice, beans, salad", 1995],
          ["Pollo con Camarones", "Grilled chicken topped with shrimp; rice, beans, salad", 2100]
        ]
      },
      {
        name: "Carnes / Beef",
        items: [
          ["Carne Asada", "Grilled marinated steak; rice, beans, salad", 2000],
          ["Bistec Empanizado", "Breaded beef cutlet; rice, beans, salad", 2000],
          ["Bistec Salvadoreño", "Salvadoran-style grilled steak; rice, beans, salad", 2000],
          ["Carne Deshilachada con Huevo", "Shredded beef with egg; rice, beans, salad", 2000],
          ["Carne Deshilachada con Vegetales", "Shredded beef with vegetables; rice, beans, salad", 2000],
          ["Bistec Encebollado", "Grilled steak with sautéed onions; rice, beans, salad", 2095],
          ["Colitas Horneadas", "Oven-baked beef tri-tip; rice, beans, salad", 2125],
          ["Lengua en Salsa", "Braised beef tongue in tomato sauce; rice, beans, salad", 2125],
          ["Milanesa de Carne", "Breaded beef cutlet; rice, beans, salad", 2125],
          ["Cola de Res Entomatada", "Oxtail braised in tomato sauce", 2200],
          ["Bistec con Camarones", "Grilled steak topped with shrimp; rice, beans, salad", 2395]
        ]
      },
      {
        name: "Mariscos / Seafood",
        items: [
          ["Torta de Pescado", "Salvadoran fish patty in light tomato broth; rice", 1700],
          ["Pescado Frito o Cocido", "Whole fish, fried or steamed; rice, beans, salad", 2195],
          ["Camarones a la Plancha", "Grilled shrimp with garlic; rice, beans, salad", 2200],
          ["Camarones", "Seasoned sautéed shrimp; rice, beans, salad", 2395]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["Kids Huevo, Frijoles y Plátanos", "From. One egg, refried beans and fried plantains", 875],
          ["Kids Pupusa Plate", "With curtido and salsa", 875],
          ["Kids Pupusitas con Frijoles y Plátanos", "Pupusa, refried beans and fried plantains", 895]
        ]
      },
      {
        name: "Órdenes / Sides",
        items: [
          ["Plátanos (Fried Plantains)", "", 500],
          ["Huevos (Two Eggs)", "From. Any style", 575],
          ["Arroz (Rice)", "", 595],
          ["Frijoles (Beans)", "Refried red beans", 595],
          ["Papas Fritas (French Fries)", "", 650],
          ["Plátanos Fritos", "Sweet fried plantains", 675],
          ["Casamiento (Rice & Beans)", "", 675],
          ["Chorizo", "Grilled Salvadoran chorizo", 700],
          ["Vegetales Salteados", "Sautéed vegetables", 750],
          ["Yuca Frita", "", 750],
          ["Salpicón (Side)", "", 800],
          ["Chile Relleno de Carne", "", 900],
          ["Chile Relleno de Queso", "", 900],
          ["Pollo (A La Carta)", "", 1000],
          ["Carne Asada (A La Carta)", "", 1100],
          ["Chicharrón (Fried Pork)", "", 1175],
          ["Aguacate (Avocado)", "", 225],
          ["Crema (Sour Cream)", "", 225],
          ["Queso (Cheese)", "", 225],
          ["Tortilla", "", 100]
        ]
      },
      {
        name: "Bebidas / Beverages",
        items: [
          ["House Coffee", "", 250],
          ["Espresso", "", 250],
          ["Cappuccino", "", 450],
          ["Latte", "", 450],
          ["Mocha", "", 450],
          ["Hot Chocolate", "", 475],
          ["Tea", "Hot tea", 200],
          ["Fresco del Día", "House agua fresca of the day", 350],
          ["Fresco de Tamarindo", "Tamarind agua fresca", 450],
          ["Fresco de Jamaica", "Hibiscus agua fresca", 450],
          ["Horchata 16 oz", "Salvadoran rice-and-seed horchata", 450],
          ["Horchata 32 oz", "Salvadoran rice-and-seed horchata", 800],
          ["Orange Juice", "", 475],
          ["Apple Juice", "", 200],
          ["Soda", "Fountain soda", 250],
          ["Kolashampan", "Salvadoran cream-soda-style soda", 375],
          ["San Pellegrino", "", 375],
          ["Sparkling Water", "", 350]
        ]
      }
    ],
    hours: "Wed–Fri 10am–8pm, Sat–Sun 9am–8pm; Closed Mon–Tue",
    orderUrl: "https://balompiesportsbarandgrill.com/menu",
    siteNote: "Menu, prices and hours are from Balompié's own ordering site, balompiesportsbarandgrill.com (Owner)."
  },
  'banh-mi-xpress': {
    hours: "Daily 8:30am–6:30pm",
    siteNote: "Hours are from their Google Maps listing."
  },
  'bar-sprezzatura': {
    sections: [
      {
        name: "Cicchetti",
        items: [
          ["Castelvetrano Olives", "", 600],
          ["Acciughe e Uova \"Deviled Egg\"", "Scalia anchovy, marinated sardines", 1200],
          ["Guanciale Meatballs", "\"Polpette di Patrizio\" (dinner $12, lunch $11)", 1100],
          ["Baccalà Mantecato di All'Arco", "Whipped salt cod, parsley, garlic", 900],
          ["'Caprese'", "Ramini mozzarella di bufala, sugo al pomodoro, basil, balsamic pearls", 900],
          ["Avocado", "Brokaw Gem avocado, house ricotta, sesame seeds, fennel, arugula (dinner)", 1700],
          ["Brokaw Avocado & Channel Islands Uni", "Meyer lemon gel, vadouvan (lunch)", 2800],
          ["Arancino al Gambero", "Guanciale, red shrimp, Perigord black truffle, Calabrian chili aioli (dinner)", 2200],
          ["Forest Floor", "Porcini sformato, glazed wild mushrooms, beech mushroom saor", 1500],
          ["Ahi Tuna", "Salsa verde, charred radicchio, Swarnadwipa spice", 1200],
          ["Polpo", "Avocado crema, salsa verde, pickled Fresno chili", 1200],
          ["Pesche & Caviar", "Caviar Co. caviar, mortadella, white peach, pistachio (dinner)", 2100],
          ["'Stracci & Caviar'", "Caviar Co. caviar, stracciatella, pear, asparagus, cured egg yolk (lunch)", 2100]
        ]
      },
      {
        name: "Salumi & Formaggi",
        items: [
          ["Salumi, choose 2", "Prosciutto, coppa, pancetta, salame, pistachio mortadella; 5 for $39", 2100],
          ["Formaggi, choose 2", "Parmigiano Vacche Rosse, pecorino di fossa, Prima Pecora, Valtaleggio; 5 for $36", 1900],
          ["Ramini Buffalo Mozzarella Burrata", "Caviar Co. reserve caviar, tomato, focaccia", 8500],
          ["Ramini Buffalo Mozzarella Stracciatella", "Pistachio, green olive condimento, focaccia", 2100]
        ]
      },
      {
        name: "Crudo & Insalate",
        items: [
          ["Market Oysters (6)", "Prosecco mignonette, pickled apple (dinner)", 2800],
          ["Hawaiian Ahi Tuna Carpaccio", "Castelvetrano olive, preserved tomato", 2400],
          ["Pacific Amberjack", "Marcona almond, buttermilk vinaigrette, coriander, smoked trout roe (dinner)", 2200],
          ["Cured Mediterranean Branzino", "City Bees honey, fennel, pistachio, parsley oil, sea bean (dinner)", 2100],
          ["Stone Fruit & Heirloom Tomato", "House ricotta, Marcona almond, basil oil (dinner)", 2400],
          ["Roasted Beets & Radicchio di Treviso", "Campari vinaigrette, pistachio, robiola, citrus (dinner)", 1700],
          ["Little Gem", "Avocado, asparagus, soft egg, pecorino di fossa (dinner)", 1800],
          ["Sprezzatura 'Chop'", "Lamon beans, mortadella, Prima Pecora, walnuts, pickled peppers (lunch)", 1700],
          ["Dirty Girl Kale 'Caesar'", "Farro, caesar dressing, soft egg, focaccia crouton (lunch)", 1800],
          ["Zuppa di Mais", "Corn soup (lunch)", 1000]
        ]
      },
      {
        name: "Pizza al Taglio & Panini (Lunch)",
        items: [
          ["Mortadella Pizza", "Stracciatella, pomegranate, pistachios, sylvetta", 2100],
          ["Whipped Artichoke Pizza", "Truffle, parmigiano, sylvetta", 2200],
          ["Margherita Pizza", "Ramini mozzarella di bufala, basil", 2000],
          ["Salumi Sandwich", "Chef's salumi selection, stracciatella, pistachio pesto", 2500],
          ["Sandwich di Polpette", "Meatballs, prosciutto, mozzarella, Calabrian chili", 2400],
          ["Prezzo Fisso Lunch", "Choice of starter and main (pizza, risotto, bigoli or scampi), per guest", 3800]
        ]
      },
      {
        name: "Pasta & Secondi",
        items: [
          ["Agnolotti alla Ricotta e Mortadella", "Peas, burro fuso, Vacche Rosse, morels (dinner)", 3200],
          ["Pappardelle alla Bolognese", "Sakura Ranch wagyu, soffritto, stracciatella (dinner)", 4500],
          ["Bigoli Freschi", "Duck ragù, orange, clove (lunch $28, dinner $32)", 2800],
          ["Scampi alla Veneziana", "Red shrimp, vino bianco, lemon, herb gremolata (lunch $32, dinner $34)", 3200],
          ["Risotto alla Verdure", "Lobster mushrooms, English peas, pistachio (lunch)", 2400],
          ["Masami Beef Liver", "Truffle potato purée, caramelized onions, beef jus (lunch)", 3600],
          ["Sakura Ranch Wagyu Strip", "Truffle potato purée, rainbow carrot, onion, porcini confit, beef jus (dinner)", 12500],
          ["Braised Massimi Ranch Beef Cheeks", "Fava, fennel purée, fingerling potatoes, stone fruit (dinner)", 5500],
          ["Northern Halibut", "Olive condimento, charred lemon, cauliflower purée (dinner)", 4200]
        ]
      },
      {
        name: "Spirit-Free & Soft Drinks",
        items: [
          ["Spirited Away", "Spirit-free bitters, NA prosecco, soda", 1500],
          ["Nonna's Garden", "Seedlip Garden, lemon, opal basil, elderflower tonic", 1500],
          ["Phony Negroni", "Spirit-free negroni from St. Agrestis", 1500],
          ["Sogno di Basilico", "Basil spirit-free, cucumber water, lychee, NA prosecco", 1600],
          ["Limoncello Spritz", "Spirit-free limoncello, basil, elderflower, NA prosecco", 1500],
          ["Passione Mule", "Spirit-free agave, passion fruit, mint, lime, blood orange ginger beer", 1600],
          ["A' Siciliana Italian Soda", "Limonata or aranciata rossa", 600],
          ["Lurisia Chinotto Soda", "", 600],
          ["Molecola Classica", "", 600],
          ["House-Made Italian Soda", "Seasonal", 800]
        ]
      }
    ],
    hours: "Mon–Wed 11am–9pm, Thu–Fri 11am–10pm, Sat 4pm–10pm, Closed Sun",
    siteNote: "Food menu from their lunch and dinner PDFs linked on barsprezzatura.com; hours from the San Francisco location page."
  },
  'belly': {
    hours: "Sun–Thu 10:45am–8:30pm, Fri–Sat 10:45am–9pm",
    orderUrl: "https://www.toasttab.com/local/order/belly",
    siteNote: "Hours are from Belly's own Toast online ordering page (linked from bellyrestaurants.com); Uber Eats lists the same hours."
  },
  'benicia-grill': {
    sections: [
      {
        name: "Breakfast Specialties",
        items: [
          ["Breakfast Burrito", "A flour tortilla filled with a choice of either sausage or bacon, scrambled eggs, cheese, green chiles…", 1799],
          ["Veggie Breakfast Burrito (No Meat)", "A flour tortilla filled with scrambled eggs, cheese, green chiles, onions, and salsa with hash browns or…", 1699],
          ["Breakfast Sandwich", "Two eggs cooked over hard, bacon, cheese, and tomato served between two pieces of toast with hash browns…", 1799]
        ]
      },
      {
        name: "Omelettes",
        items: [
          ["Denver Omelette", "Ham, cheese, onion and bell pepper.", 1899],
          ["Ham and Cheese Omelette", "Diced ham and melted cheese.", 1825],
          ["Steak Omelette", "Grilled steak, mushrooms, cheese, tomato and onion.", 1999],
          ["Spinach Omelette", "Spinach, mushrooms and Swiss cheese.", 1899],
          ["BMS Omelette", "Bacon, mushrooms and Swiss cheese.", 1825],
          ["Steak Fajita Omelette", "Grilled steak, bell peppers, onion and jack cheese. Served with sour cream and salsa.", 1899],
          ["Shrimp Fajita Omelette", "Grilled Shrimp, bell peppers, onion and jack cheese. Served with sour cream and salsa.", 1899],
          ["Turkey Patty Sausage Omelette", "American, cheddar or Swiss cheese and green onion.", 1725],
          ["Cheese Omelette", "American, cheddar or Swiss.", 1699],
          ["Chicken Fajita Omelette", "Grilled Chicken, bell peppers, onion and jack cheese. Served with sour cream and salsa.", 1899],
          ["Chili Con Queso Omelette", "Chili, Cheese, onion and tomato. Served with Sour Cream", 1799],
          ["Linguica Omelette", "Jack Cheese, Ortega Chillies and onion.", 1899],
          ["Garden Omelette", "Avocado, spinach, mushrooms, olives, tomato, onion and cheese.", 1799],
          ["Louisiana Omelette", "Cajun sausage, cheese and onion.", 1899]
        ]
      },
      {
        name: "Skillets",
        items: [
          ["Shrimp Skillet", "Shrimp, avocado, cheese, scrambled eggs over country potatoes topped with sour cream, green onion and…", 1899],
          ["Country Skillet", "Two biscuits covered with scrambled eggs, sausage links and country gravy.", 1849],
          ["Steak Fajita Skillet", "Grilled steak, bell peppers, onion, cheese, guacamole, salsa, sour cream with scrambled eggs served over…", 1899],
          ["Chicken Skillet", "Grilled chicken, scrambled eggs, cheeses, mushrooms, bell pepper and onions over country potatoes. Served…", 1899],
          ["Veggie Skillet", "Spinach, mushrooms, olives, tomato, green onions., scrambled eggs and cheese over country potatoes. Served…", 1899],
          ["Chicken Fajita Skillet", "Grilled chicken, bell peppers, onion, cheese, guacamole, salsa, sour cream with scrambled eggs served over…", 1799],
          ["Joe's Special", "Ground beef, Mushroom, Spinach, onion, and cheese over country potatoes.", 1949],
          ["Santa Fe Skillet", "Bacon, avocado and cheese scrambled with eggs, diced green chilies, and green onion over country potatoes…", 1875],
          ["Ham and Cheese Skillet", "Ham and cheese, sour cream with scrambled eggs served over country potatoes.", 1699]
        ]
      },
      {
        name: "Egg Combos",
        items: [
          ["Chicken Fried Steak and Eggs", "Lightly seasoned and breaded beefsteak, eggs any style.", 1899],
          ["Bacon and Eggs", "Two eggs served any style and four pieces of bacon.", 1699],
          ["Benicia Grill Breakfast", "Three eggs any style, three pieces of bacon, and three sausage links.", 2099],
          ["Sausage Link and Eggs", "Two eggs served any style with two pieces of sausage link.", 1699],
          ["Pork chop and Eggs", "A seasoned and grilled pork chop and two eggs served any style.", 1949],
          ["Turkey Sausage Patty and Eggs", "Two eggs served any style and a turkey sausage patty..", 1749],
          ["Tri-Tip and Eggs", "Tri-tip and two eggs any style.", 1899],
          ["4oz Steak and Eggs", "A 4oz steak and two eggs served any style.", 1899],
          ["Hot Link and Eggs", "Two eggs served any style and a hot link.", 1799],
          ["Corned Beef Hash and Eggs", "Corned beef hash and two eggs served any style.", 1799],
          ["3 Eggs and Hash Browns", "Three eggs served any style.", 1499],
          ["British Bangers & Eggs", "British Bangers with two eggs any style. Choice of hashbrowns or country potatoes. Served with toast", 2099],
          ["Hamburger Patty and Eggs", "Two eggs served any style and a hamburger patty.", 1999],
          ["Ham Steak and Eggs", "Grilled ham steak and two eggs served any style.", 1799],
          ["2 Eggs And Hash Browns", "2 eggs served any style.", 1399],
          ["12oz T-Bone Steak and Eggs", "A 12oz T-bone steak and two eggs served any style.", 2899]
        ]
      },
      {
        name: "Benedicts",
        items: [
          ["Eggs Benedict", "Canadian bacon, poached eggs and hollandaise sauce served on an English muffin.", 1949],
          ["Florentine Benedict", "Ham, fresh spinach, poached eggs, tomato and Hollandaise sauce on an English muffin.", 1949],
          ["Veggie Benedict", "Avocado, tomato, bell pepper, onion, poached egg, and Hollandaise sauce.", 1799]
        ]
      },
      {
        name: "Pancakes",
        items: [
          ["Pancake Combo", "Two fluffy buttermilk pancakes, two eggs any style, two pieces of bacon or sausage.", 1699],
          ["Full Stack Pancake", "Three buttermilk pancakes.", 1499],
          ["Short Stack Pancake", "Two buttermilk pancakes.", 1399],
          ["Pancakes & Bacon", "Two buttermilk pancakes and two pieces of bacon.", 1499],
          ["Banana & Walnut Pancakes", "Three walnut pancakes, topped with glazed banana slices and walnuts.", 1599]
        ]
      },
      {
        name: "Waffles",
        items: [
          ["Waffle Combo", "A Belgian waffle, two eggs any style, two pieces of bacon or sausage.", 1799],
          ["Belgian Waffle & Bacon", "A Belgian waffle with two pieces of bacon.", 1599],
          ["Banana Walnut Waffle", "A Belgian walnut waffle, two eggs any style, two pieces of bacon or sausage.", 1875]
        ]
      },
      {
        name: "French Toast",
        items: [
          ["French Toast Combo", "Two pieces of French toast, two eggs any style, two pieces of bacon or sausage.", 1799],
          ["French Toast & Bacon", "Two pieces of cinnamon French toast with two pieces of bacon.", 1699]
        ]
      },
      {
        name: "Breakfast Sides",
        items: [
          ["Bacon (4)", "Crispy, savory bacon strips, perfectly cooked to a golden brown. Four pieces per serving.", 949],
          ["Sausage Links (3)", "Three links of seasoned ground meat encased and cooked to a golden brown.", 925],
          ["Biscuits and Gravy", "Fluffy biscuits topped with creamy sausage gravy and garnished with crispy bacon pieces.", 949],
          ["Country Potatoes", "Rustic, seasoned potatoes, diced and skillet-fried to golden perfection.", 849],
          ["A Pancake", "A single pancake, often served with butter and syrup, making for a simple yet satisfying addition to any…", 725],
          ["Turkey Sausage (2)", "Two seasoned turkey sausage patties, typically prepared with a blend of spices.", 925],
          ["Oatmeal", "Creamy oats cooked to a smooth consistency.", 925],
          ["Grits", "\"Southern-style cornmeal porridge, a classic comfort dish, perfect for breakfast or as a savory side.\"", 925],
          ["Toast", "Crisp, golden-brown bread, perfectly toasted for a comforting, simple pleasure.", 650],
          ["Hash Browns", "Crispy golden breakfast potatoes, perfect for starting your day off right.", 799],
          ["French Toast", "Two french toast triangles", 749],
          ["Fried Rice", "Savory stir-fried rice with mixed vegetables.", 849],
          ["Egg (2)", "Two eggs, choice of over easy, hard, medium, scrambled, or sunny-side up.", 775],
          ["Ham", "Tender, savory sliced pork, perfectly cured and gently seasoned for a classic taste.", 949],
          ["Egg (1)", "Eggs prepared your choice: over easy, over hard, medium, scrambled, sunny-side up.", 595],
          ["Waffle", "", 1049],
          ["Sausage Patty (2)", "Finely minced meat formed into two patties and cooked.", 825]
        ]
      },
      {
        name: "Famous Hot Sandwiches & Burgers",
        items: [
          ["24. Turkey Club Sandwich", "Turkey club sandwich with bacon, lettuce, tomato. Choice of side: fries, sweet potato fries, crisscut…", 1745],
          ["17. Benicia Burger", "Two juicy beef patties cheese lettuce tomato onion and our own special dressing served on a a toasted bun.", 1845],
          ["2. Mesquite Pepper Tri-Tip Sandwich", "Thin sliced tri-tip, seasoned with mesquite pepper. Served on a baguette roll, with a side of au jus sauce.", 1875],
          ["6. Spicy Buffalo Chicken Tender Sandwich", "Crispy chicken tenders tossed in a spicy buffalo sauce, lettuce, tomato, onion, ranch, mayo. Served on a…", 1845],
          ["13. Tri-Tip Philly Cheesesteak Sandwich", "Thin sliced tri-tip. Cheese grilled bell peppers, grilled onions", 1845],
          ["16. Angus Hamburger", "Our traditional hamburger with lettuce tomato onion and thousand island dressing.", 1645],
          ["1. French Dip Tri-Tip Sandwich", "Thin sliced tri-tip, served on a bagel roll with a side of au jus sauce.", 1845],
          ["25. BLT Sandwich", "BLT sandwich with layers of crispy bacon, fresh lettuce, and ripe tomato. Choose from fries, sweet potato…", 1545],
          ["12. Crispy Chicken Tenders", "4-piece chicken tenders", 1745],
          ["4. Fiesta Tri-Tip Sandwich", "Thin sliced tri-tip, lettuce, salsa, guacamole spread, pepper jack cheese. Served on a baguette roll.", 1845],
          ["3. Cowboy Tri-Tip Sandwich", "Thin sliced tri-tip, onion rings, diced green chilis, BBQ sauce. Served on a baguette roll.", 1845],
          ["5. Tri-Tip Sandwich", "Thin sliced tri-tip, lettuce, tomato, onion, mayo. Served on a baguette roll.", 1845],
          ["14. Pastrami Dip", "Pastrami. Served on a baguette roll, with a side of au jus sauce.", 1845],
          ["22. Veggie Burger", "Avocado cheese lettuce tomato and onion on a toasted wheat bun.", 1645],
          ["11. Turkey Sandwich", "Thin Sliced turkey. Lettuce, tomato, cheese, onion, and special sauce. Served on a baguette roll.", 1745],
          ["18. Mushroom Burger", "Mushroom burger served with choice of fries, sweet potato fries, crisscut fries, or onion rings.", 1745],
          ["7. Cowboy Chicken Tender Sandwich", "Crispy chicken tenders tossed in BBQ sauce, onion rings, diced green chilis. Served on a baguette roll.", 1845],
          ["10. Turkey Dip Sandwich", "Thin sliced smoked turkey. Served on a baguette roll, with a side of au jus sauce.", 1795],
          ["21. Cowboy BBQ Cheeseburger", "Cowboy BBQ Cheeseburger: Juicy beef patty, BBQ sauce, cheddar, crispy onions. Options for side: fries…", 1745],
          ["27. Patty Melt", "2 patties, american cheese, grilled onions, served on rye bread. Served with French Fries", 1945],
          ["15. Corned Beef Dip", "Corned beef. Served on a baguette roll, with a side of au jus sauce.", 1845],
          ["19. Pastrami Swiss Burger", "Pastrami Swiss Burger with choice of fries, sweet potato fries, crisscut fries, or onion rings.", 1745],
          ["20. Fiesta Jalapeño Cheeseburger", "Jalapeño and melted cheese atop a succulent burger, with a choice of fries, sweet potato fries, crisscut…", 1745],
          ["23. Fish Sandwich", "", 1645],
          ["26. Open Faced Hot Turkey Sandwich", "Served with mashed potatoes & gravy.", 1845],
          ["28. Hot Beef Sandwich", "Served with mashed potatoes & gravy.", 1795],
          ["29. Turkey Bacon Melt", "Choose from fries, sweet potato fries, crisscut fries, or onion rings as a side.", 1795],
          ["30. Tuna Melt", "Choose from fries, sweet potato fries, crisscut fries, or onion rings as a side.", 1895],
          ["8. Fiesta Chicken Tender Sandwich", "Crispy chicken tenders, lettuce, salsa, guacamole spread, pepper jack cheese. Served on a baguette roll.", 1845],
          ["9. Chicken Tender Sandwich", "Crispy chicken tenders, lettuce, tomato. onion, mayo. Served on a baguette roll.", 1675]
        ]
      },
      {
        name: "Wraps",
        items: [
          ["Chicken Caesar Wrap", "Chicken Caesar salad, Parmesan cheese, and Caesar dressing in a flour tortilla. Served with Waffle Fries.", 1575],
          ["Buffalo Chicken Wrap", "Buffalo Chicken, lettuce, tomato, cheese, green onion and ranch dressing. Served with Waffle Fries.", 1795],
          ["Steak Caesar Wrap", "Caesar salad with sliced tri-tip, Parmesan cheese, and Caesar dressing in a flour tortilla. Served with…", 1675],
          ["Veggie Wrap", "Avocado, mushroom, olives, cheese, cucumber, lettuce, and onion wrapped in a our tortilla, with ranch…", 1575]
        ]
      },
      {
        name: "Fresh Salads",
        items: [
          ["Buffalo Chicken Salad", "Buffalo chicken over fresh greens.", 1799],
          ["Oriental Chicken Salad", "A blend of lettuce cabbage green onions carrots mandarin oranges topped with grilled chicken slivered…", 1849],
          ["Cobb Salad", "Chicken bacon avocado bleu cheese tomato sliced eggs red onion cucumber and olives on a bed of lettuce.", 1849],
          ["Tri-Tip Caesar Salad", "Sliced tri-tip atop crisp romaine lettuce, typically includes croutons, parmesan cheese, and caesar dressing.", 1899],
          ["Mediterranean Salad", "Romaine lettuce, tossed with bell peppers, red onion, olives, cucumber, tomato wedge, and feta cheese…", 1749],
          ["Fajita Chicken Salad", "Grilled chicken, mixed greens, and vegetables, typically tossed with a tangy dressing and topped with…", 1849],
          ["Fajita Tri-Tip Salad", "Marinated tri-tip served over a bed of mixed greens, typically includes grilled bell peppers, onions, and…", 1875],
          ["Shrimp Caesar Salad", "Grilled shrimp served atop crisp romaine lettuce, garnished with parmesan cheese, croutons, and tossed…", 1899],
          ["Chef's Salad", "Lettuce, mixed cheese, turkey, bacon, ham, tomato, cucumber, and sliced egg.", 1899],
          ["Chicken Caesar Salad", "Crisp romaine lettuce, tender grilled chicken, shaved Parmesan, and croutons, all drizzled with classic…", 1799],
          ["Caesar Salad", "Crispy romaine lettuce red onion croutons and parmesan cheese tossed with a creamy caesar dressing.", 1499]
        ]
      },
      {
        name: "Fries & Sides",
        items: [
          ["Fries", "Golden and crispy, seasoned to perfection.", 625],
          ["Side of Avocado", "Fresh avocado slices: Perfect creamy addition to any dish", 275],
          ["Side of Ranch", "Creamy house-made ranch, typically includes a blend of herbs and spices, ideal as a dipping sauce.", 175],
          ["Crisscut Fries", "Waffle-cut potatoes, fried until golden and crispy.", 649],
          ["Sweet Potato Fries", "Crispy and flavorful fries made from sweet potatoes, a delightful twist on a classic favorite.", 625],
          ["Garlic Fries", "Crispy fries, tossed in aromatic garlic and herbs", 725],
          ["Onion Rings", "Crispy golden-fried onion rings, perfectly seasoned for a savory crunch.", 849]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["Kids Pancake Combo", "", 1025],
          ["Kids Waffle Combo", "A belgian waffle 2 eggs any style 2 pcs of bacon or sausage.", 1025],
          ["Kids Cheeseburger", "Cheesy delight on a bun, specially crafted for our young burger enthusiasts.", 1049],
          ["Kids Bacon & Eggs", "Scrambled eggs", 1025],
          ["Kids Chicken Tenders", "Crispy chicken tenders for kids", 1025],
          ["Kids Tri-Tip Sandwich", "", 1025],
          ["Kids Hamburger", "", 1025]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Chocolate Cake", "Decadent chocolate delight, lavished with rich frosting and served with a dollop of indulgence.", 749],
          ["Cheesecake", "Smooth and rich, our Creamy Cheesecake is the perfect way to satisfy your sweet tooth.", 749]
        ]
      },
      {
        name: "Beverages",
        items: [
          ["French Vanilla Iced Coffee", "", 650],
          ["Lg Orange Juice", "", 599],
          ["Soda & Fountain Soft Drinks", "Selection includes: Crush Orange, Pepsi, Diet Pepsi, Dr. Pepper, Brisk Raspberry Iced Tea, Mug Root Beer…", 499],
          ["Milkshake", "Milkshake with choice of chocolate, strawberry, or vanilla flavors.", 800],
          ["Sm Orange Juice", "", 499],
          ["Coffee", "Freshly brewed, aromatic blend to kick-start your day.", 515],
          ["Lg Apple Juice", "Made from freshly pressed apples, offering a naturally sweet and refreshing taste.", 599],
          ["Iced Tea", "Chilled, refreshing brewed tea, perfectly balanced for a hot day", 499],
          ["Hot Chocolate", "Smooth, rich chocolate drink, perfectly steamed to warm your soul.", 499],
          ["Sm Apple Juice", "Apple juice, made from fresh-pressed apples, offers a naturally sweet and refreshing taste, capturing the…", 499],
          ["Sm Tomato Juice", "", 499],
          ["Lg Tomato Juice", "", 599],
          ["Lg Milk", "A large serving of milk, offering a refreshing and simple beverage option.", 550],
          ["Bottled Water", "Pure and refreshing bottled water.", 350],
          ["Pepsi Can", "Can of Pepsi.", 400],
          ["Diet Pepsi Can", "Can of Diet Pepsi.", 400],
          ["Pepsi Max Can", "Can of Pepsi Max.", 400],
          ["Decaf Coffee", "Smooth, full-flavored coffee without the caffeine kick. Perfect any time of day.", 499],
          ["Hot Tea", "Steaming, aromatic blend of finely selected tea leaves. Perfectly soothing", 499]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/benicia-grill-benicia-260425/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their DoorDash store; their own menu PDF lists the same dishes without prices."
  },
  'birria-lokaa': {
    phone: "(925) 948-6037"
  },
  'biryaniz': {
    hours: "Mon–Thu 11:30am–2:30pm & 5:30pm–10pm, Fri 11am–11:30pm, Sat–Sun 11am–10pm",
    siteNote: "Hours are from biryaniz.com (Dublin)."
  },
  'bober-tea': {
    sections: [
      {
        name: "Mochi Donuts",
        items: [
          ["Box of 2 Donuts", "Chewy mochi donuts with a strawberry glaze and a black sesame glaze, offering a delightful contrast of…", 799],
          ["Box of 6 Mochi Donuts", "Allergens: milk, eggs, wheat and soybeans. Bypass the line and order ahead for pick up. Box of 6 is…", 2099],
          ["Box of 3 Mochi Donuts", "Allergens: milk, eggs, wheat and soybeans. Introducing a delightful box of 3 assorted premium Japanese…", 1099]
        ]
      },
      {
        name: "Hot Lattes",
        items: [
          ["(Hot) Taro Latte", "Contains real dairy. Contains no caffeine. Perfectly steamed taro latte.", 730],
          ["(Hot) Rose Latte", "Double espresso shot. Rose and rich vanilla.", 750],
          ["(Hot) Sea Salt Caramel Latte", "Double espresso shot. Rich caramel. Real sea salt. Caramel drizzle.", 770],
          ["(Hot) Pistachio Latte", "Double espresso shot. Real pistachio. Topped with edible 24k gold flakes.", 870],
          ["(Hot) Mung Bean Pandan Latte", "No caffeine. Hot mung bean pandan latte.", 760],
          ["(Hot) Strawberry Matcha Latte", "Contains real dairy. Okumidori matcha from Japan. Rich milk. Housemade strawberry purée.", 810],
          ["(Hot) Cookie Butter Latte", "Double espresso shot. Sweet cookie butter. Edible 24k gold flakes.", 780],
          ["(Hot) Pumpkin Pie Latte", "Double espresso shots. Rich pumpkin pie. Cinnamon.", 770]
        ]
      },
      {
        name: "Vietnamese Iced Coffee",
        items: [
          ["Pandan Coco Cloud", "Vietnamese iced coffee. Topped with pandan coco cloud.", 770],
          ["The O.G", "Contains dairy. Vietnamese iced coffee.", 699],
          ["Matcha Coco Cloud", "Vietnamese iced coffee. Layer of matcha cloud. Dusted with 24k edible gold flakes.", 770],
          ["Pink Haze", "Contains dairy. Vietnamese iced coffee. Hazelnut. Pink salted cream. Dusted with imported chocolate.", 760],
          ["Nutty O.G", "Vietnamese iced coffee. Hazelnut. Splash of H&H.", 699],
          ["Custard Coco Cloud", "Vietnamese iced coffee. Topped with custard cloud and brûléed brown sugar.", 770],
          ["Coconut Coco Cloud", "Vietnamese iced coffee. Layer of coconut cloud. Topped with toasted coconut flakes.", 770]
        ]
      },
      {
        name: "Brown Sugar Series",
        items: [
          ["Brown Sugar Milk Tea", "Generously coated with our housemade brown sugar syrup and filled with caffeine-rich milk tea. Recommended…", 640],
          ["The Signature Milk Tea", "We generously coat the cup with house-made brown sugar syrup, spoon in our warm stir-fried brown sugar…", 780],
          ["Brown Sugar Matcha Latte", "Our ceremonial-grade matcha over Straus Family organic extra rich milk. Sweetened with our house-made…", 730],
          ["Brown Sugar Roasted Oolong Milk Tea", "Generously coated with our housemade brown sugar syrup and filled with roasted oolong milk tea. Sweetness…", 660],
          ["Brown Sugar Cookies & Cream", "Housemade brown sugar syrup coated cup with classic milk tea, cheese cream and crushed Oreo cookies. With…", 730],
          ["Brown Sugar Creme Brûlée Milk Tea", "Generously coated with our housemade brown sugar syrup, then filled with our classic milk tea, topped off…", 710]
        ]
      },
      {
        name: "Fresh Fruit Tea",
        items: [
          ["Supreme Strawberry Green Tea", "Fresh, hand-mashed strawberries with our loose leaf brewed jasmine green tea. Sweetness level can not be…", 799],
          ["Supreme Mango Green Tea", "A blend of fresh housemade mango puree and our freshly brewed premium-grade jasmine green tea. Sweetness…", 730],
          ["Supreme Grapefruit Green Tea", "A blend of fresh grapefruit slices and pulp with our freshly brewed jasmine green tea. Sweetness level can…", 690]
        ]
      },
      {
        name: "Chizu Series (cheese cream)",
        items: [
          ["Chizu Strawberry Green Tea", "Fresh hand-mashed strawberries with premium jasmine green tea and our housemade chizu (cheese cream)…", 850],
          ["Chizu Taro Latte", "Your favorite taro latte with our housemade cheese cream.", 850],
          ["Thai Tea Creme Brûlée", "Authentic Thai tea brewed from loose-leaf tea using our hour-long brewing process. Topped with our creamy…", 799],
          ["Chizu Matcha Latte", "Housemade cheese cream over our ceremonial-grade matcha and Straus Family organic extra rich milk.", 770],
          ["Chizu Milk Tea", "Housemade cheese cream over our classic milk tea.", 670],
          ["Chizu Mango Green Tea", "Housemade cheese cream layered over a blend of our freshly prepared mango purée and premium-grade jasmine…", 850],
          ["Chizu KungFu Black Tea", "Our caffeine-rich loose leaf black tea topped with our housemade cheese cream. Perfectly sweet and savory…", 620]
        ]
      },
      {
        name: "Milk Tea (non-dairy)",
        items: [
          ["Winter Melon Milk Tea", "Caffeine-free drink. Made with the traditional Chinese melon, known for its light caramel flavor. Tastes…", 650],
          ["Roasted Oolong Milk Tea", "Made with our freshly brewed premium-grade roasted oolong loose leaf tea. Nutty and aromatic.", 630],
          ["Jasmine Milk Tea", "Made with our freshly brewed premium-grade jasmine green tea. Floral and silky.", 630],
          ["Honey Milk Tea", "Our caffeine-rich milk tea sweetened with pure honey.", 650],
          ["Classic Milk Tea", "Caffeine-rich milk tea made with our freshly brewed loose leaf black tea.", 610],
          ["Hazelnut Milk Tea", "Made with our freshly brewed loose leaf black tea. Nutty and creamy.", 630]
        ]
      },
      {
        name: "Latte Series",
        items: [
          ["Taro Latte", "Caffeine-free and Vitamin C rich taro over extra rich milk.", 690],
          ["Thai Tea Latte", "Authentic Thai tea brewed from loose-leaf tea using our hour-long brewing process. Topped with evaporated…", 799],
          ["Okumidori Matcha Latte", "Premium ceremonial grade matcha paired with extra rich milk for the best tasting matcha latte. Recommended…", 710],
          ["Mung Bean Pandan Latte", "Slow-cooked mung bean and pandan leaves with extra rich milk, topped with a splash of our house-made chizu.", 740]
        ]
      },
      {
        name: "Tea Series",
        items: [
          ["Kungfu Black Tea", "Freshly brewed caffeine-rich loose leaf black tea.", 560],
          ["Honey Jasmine Green Tea", "Freshly brewed premium-grade jasmine green tea sweetened with pure honey.", 610],
          ["Jasmine Green Tea", "Freshly brewed premium-grade jasmine green tea.", 600]
        ]
      },
      {
        name: "Smoothies (caffeine-free)",
        items: [
          ["Cookie Butter Latte Smoothie", "Sweet cookie butter smoothie.", 999],
          ["Pumpkin Pie Latte Smoothie", "Rich pumpkin pie. Cinnamon.", 999],
          ["Sea Salt Caramel Smoothie", "Rich caramel. Real sea salt. Caramel drizzle.", 999],
          ["Pistachio Latte Smoothie", "Real pistachio.", 999],
          ["Rose Latte Smoothie", "Rose and rich vanilla.", 999],
          ["Strawberry Matcha Smoothie", "Contains real dairy. Okumidori matcha from Japan. Rich milk. Housemade strawberry purée.", 999],
          ["Taro Latte Smoothie", "Contains real dairy. Contains no caffeine. Perfectly steamed taro latte.", 999],
          ["Coconut Taro Latte Smoothie", "Contains real dairy. Coconut. Taro.", 999],
          ["Mung Bean Pandan Latte Smoothie", "Contains real dairy. Contains no caffeine. Our signature mung bean pandan latte smoothie.", 999]
        ]
      },
      {
        name: "Refreshers (caffeine-free)",
        items: [
          ["Mango Refresher", "Non-caffeine drink.", 750],
          ["Strawberry Refresher", "Non-caffeine drink.", 750],
          ["Peach Refresher", "Non-caffeine drink.", 750],
          ["DragonFruit Refresher", "Non-caffeine drink.", 750],
          ["Pineapple Refresher", "Non-caffeine drink.", 750],
          ["Grapefruit Refresher", "Non-caffeine drink.", 750],
          ["Honeydew Refresher", "Non-caffeine drink.", 750],
          ["Lychee Refresher", "Non-caffeine drink.", 750]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/bober-tea-and-mochi-martinez-35599311/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their DoorDash store; their own menu page lists drinks without prices."
  },
  'bollywood-pizza-livermore': {
    sections: [
      {
        name: "Desi Fusion Pizzas",
        items: [
          ["Curry Paneer", "Spicy curry sauce, mozzarella, mushrooms, bell peppers, olives, red onions, diced tomatoes and fresh", 2195],
          ["Shahi Paneer", "Makhani sauce, bell peppers, red onions, diced tomatoes, marinated paneer and fresh cilantro.", 2195],
          ["Malai Paneer", "Malai sauce, mozzarella, bell peppers, red onions, diced tomatoes and marinated paneer.", 2195],
          ["Palak Paneer", "Pesto sauce, mozzarella, baby spinach, onions and marinated paneer.", 2195],
          ["Aloo Chat", "Creamy savoury sauce, mozzarella, onions, potatoes, cilantro, mint sauce and chaat masala.", 2195],
          ["Desi Garden", "Traditional red sauce, mozzarella, mushrooms, bell peppers, olives, red onions, diced tomatoes, ginger and", 2195],
          ["Achari Gobhi", "Creamy garlic sauce, mozzarella, red onions, diced tomatoes and gobhi (cauliflower).", 2195],
          ["Butter Chicken", "Makhni sauce, mozzarella, bell peppers, red onions, tomatoes and fresh cilantro.", 2195],
          ["Tandoori Chicken", "Creamy garlic sauce, mozzarella, bell peppers, red onions, diced tomatoes, tandoori chicken, green onions", 2195],
          ["Chicken Tikka", "Creamy garlic sauce, mozzarella, red onions, diced tomatoes, chicken tikka, green onions and cilantro.", 2195],
          ["Curry Chicken", "Spicy curry sauce, mozzarella, bell peppers, red onions, diced tomatoes, curry chicken, green onions and", 2195],
          ["Malai Chicken", "Malai sauce, mozzarella, bell peppers, red onions, diced tomatoes and malai chicken.", 2195],
          ["Achari Chicken", "Creamy garlic sauce, mozzarella, red onions, diced tomatoes and achari chicken.", 2195],
          ["Desi Garlic Chicken", "Garlic sauce, cheese, mushrooms, olives, bell peppers, onions, tomatoes, garlic chicken, hari mirch", 2195]
        ]
      },
      {
        name: "Halal",
        items: [
          ["Lamb Kebab", "White sauce, cheese, onions, spiced ground lamb and cilantro.", 2195],
          ["Shawarma Pizza", "White sauce, onion, ginger, jalapeño, cilantro and shawarma chicken.", 2195],
          ["Halal Chicken Tikka", "Halal chicken tikka on a creamy garlic base with red onion and cilantro.", 2195]
        ]
      },
      {
        name: "Vegan",
        items: [
          ["Vegan Chicken Tikka", "Vegan white sauce, vegan cheese, onions, tomatoes and plant-based chicken tikka.", 2195],
          ["Vegan Curry Chicken", "Vegan curry sauce, vegan cheese, bell peppers, onions, tomatoes and plant-based curry chicken.", 2195],
          ["Vegan Curry Veggie", "Vegan curry sauce, vegan cheese, mushrooms, bell peppers, olives, red onions, diced tomatoes and fresh", 2195]
        ]
      },
      {
        name: "Classic Pizzas",
        items: [
          ["Original Margherita", "Traditional red sauce, oregano, basil, diced tomatoes, a hint of olive oil and mozzarella.", 2195],
          ["Classic Veggie", "Mushrooms, olives, bell peppers, diced tomatoes, red onions and artichoke hearts.", 2195],
          ["Classic Combo", "Pepperoni, salami, beef, sausage, mushrooms, olives, diced tomatoes, bell peppers and red onions.", 2195],
          ["Meat Lovers Combination", "Ham, salami, pepperoni, beef and Italian sausage.", 2195],
          ["Garlic Chicken Combination", "Creamy garlic sauce, grilled chicken, bacon, diced tomatoes and green onions.", 2195],
          ["BBQ Chicken Combination", "BBQ sauce, grilled chicken, bacon, red onions and pineapple.", 2195]
        ]
      },
      {
        name: "Build Your Own",
        items: [
          ["BYO Pizza", "Start with dough, sauce and cheese, then build it exactly how you want it.", 1995],
          ["Half & Half Specialty Pizza", "Two specialty pizzas on one base. Settles every argument at the table.", 3895]
        ]
      },
      {
        name: "Sides & Wings",
        items: [
          ["Tandoori Wings", "Tandoori-marinated wings, charred and finished with lime.", 1295],
          ["Achari Wings", "Wings in achari pickling spice.", 1295],
          ["Masala Potatoes", "Crispy wedges tossed in house masala.", 795],
          ["Garlic Cheese Sticks", "Fresh dough, garlic butter and stretchy mozzarella.", 895],
          ["Tandoori Cheese Sticks", "Onions, pineapple and jalapeños.", 895],
          ["Desi Cheese Sticks", "Ginger, cilantro, onions, jalapeños and pineapple.", 1395],
          ["Mozzarella Sticks", "Five pieces, golden and gooey, with marinara on the side.", 595]
        ]
      },
      {
        name: "Pasta",
        items: [
          ["Butter Chicken Pasta", "Penne in makhani sauce with tandoori chicken.", 1495],
          ["Shahi Paneer Pasta", "Penne in shahi gravy with paneer.", 1495],
          ["Pesto Chicken Pasta", "Basil pesto with grilled chicken.", 1495]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Nutella Marshmallow Pie", "Warm dough, Nutella, toasted marshmallows and candy.", 1195]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Mango Lassi", "Thick, cold mango lassi", 500],
          ["Nimbu Pani", "Indian lemonade, salted and sharp", 400],
          ["Bottled Soda", "", 400],
          ["Limca", "", 399],
          ["Thums Up", "", 399],
          ["Can Soda", "", 319],
          ["Bottled Water", "", 400]
        ]
      }
    ],
    address: "1524 N Vasco Rd, Livermore, CA 94551",
    siteNote: "Menu and prices are the San Francisco pickup prices on bollywoodpizza.com, which says the Livermore menu matches its San Francisco store; hours and address are from their Livermore page.",
    pricesEstimated: "Their site says the Livermore menu matches San Francisco, so these are the San Francisco prices; Livermore opens October 31."
  },
  'brazuca-acai': {
    sections: [
      {
        name: "Açaí",
        items: [
          ["Açaí Bowl", "Brazilian açaí, smoothly blended; Traditional or Americano style, add-ons available", 1550],
          ["Pitaya Bowl", "Dragon fruit with granola, fresh blueberries, shredded coconut and strawberries", 1300]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["Passion Fruit Smoothie", "", 1000],
          ["Brazilian Cupuaçu Smoothie", "Tastes like a mix of pineapple and chocolate", 1000],
          ["Green Smoothie", "Kiwi, spinach, kale, strawberry and banana", 1000],
          ["Pineapple Smoothie", "", 1000]
        ]
      },
      {
        name: "Juices",
        items: [
          ["Orange Juice", "Freshly squeezed", 600],
          ["Acerola Juice", "Brazilian cherry juice", 600]
        ]
      },
      {
        name: "Brazilian Pastries",
        items: [
          ["Ground Beef Triangle", "Pastry filled with seasoned ground beef", 700],
          ["Chicken Empanada", "Pastry filled with seasoned chicken", 700],
          ["Chicken Coxinha", "Teardrop-shaped pastry filled with seasoned shredded chicken", 700],
          ["Sweet Coconut Roll", "Flaky pastry filled with sweet coconut cream", 700]
        ]
      }
    ],
    orderUrl: "https://www.ubereats.com/store/brazuca-acai/m9BN2P4HWrOuiUwGjeCb3w",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from Brazuca Açaí's Uber Eats store (4500 Barrett Avenue); they have no website with a menu."
  },
  'bread-winners': {
    hours: "Mon–Sat 11am–4pm, Closed Sun",
    phone: "(510) 907-3183",
    siteNote: "Hours are from their Instagram and Yelp/MapQuest/Visit Oakland listings, which agree; phone from the Swan's Market tenant page."
  },
  'breaktime-tea': {
    sections: [
      {
        name: "Fresh Tea",
        items: [
          ["Cheese Foam Tea", "Black tea, green tea or roasted oolong tea with ice & salted cheese foam on top", 699],
          ["Honey Black Tea / Green Tea", "", 675],
          ["Peach Green Tea", "Cold only.", 675],
          ["Mango Green Tea", "", 675],
          ["Passion Fruit Green Tea", "", 675],
          ["Lychee Green Tea", "Iced.", 675],
          ["Strawberry Green Tea (W/ Fruit Bits)", "With fruit bits. Iced.", 675],
          ["Mango Mojito", "Cold only.", 750],
          ["Strawberry Mojito", "", 750],
          ["Grapefruit Sunrise", "", 850],
          ["Twilight Delight w/ fruit bits", "", 699],
          ["Royal Rose Green Tea", "with fresh lemon", 750],
          ["Matcha Lemon Tea", "", 775],
          ["Butterfly Lemonade", "Cold only.", 699],
          ["Passion Fruit Mojito", "Cold only.", 725],
          ["Watermelon Tea", "", 675],
          ["Watermelon Lemon Tea", "", 695],
          ["Butterfly Peach Tea", "Butterfly tea + pink peach.", 750],
          ["Strawberry Lemonade", "Strawberry + fresh lemon + strawberry bits.", 725]
        ]
      },
      {
        name: "Milk Tea",
        items: [
          ["Classic Milk Tea", "Earl Grey Milk Tea.", 599],
          ["Black Sugar Boba Milk", "Black Sugar Boba Milk With chewy tapioca pearls.", 699],
          ["Taro Green Milk Tea", "", 725],
          ["Thai Milk Tea", "Cold only.", 675],
          ["Roasted Oolong Milk Tea", "", 650],
          ["Honey Green Milk Tea", "", 675],
          ["Mango Green Milk Tea", "Cold only.", 675],
          ["Peach Milk Tea", "Cold only.", 675],
          ["Strawberry Green Milk Tea", "", 675],
          ["Lychee Green Milk Tea", "Jasmine green milk tea infused with sweet lychee flavor.", 675],
          ["Okinawa Milk Tea", "Cold only.", 725],
          ["Caramel Milk Tea", "Caramel creamy milk tea.", 750],
          ["Honeydew Green Milk Tea", "", 675],
          ["Tiramisu Milk Tea", "Trendy Tiramisu Milk Tea.", 750],
          ["Matcha Milk Tea", "Sweet Japanese Matcha Milk Tea.", 799],
          ["Coconut Milk Tea", "", 750],
          ["Coffee Milk Tea", "coffee and smooth milk tea, served over ice.", 775],
          ["Rose Milk Tea", "Cold only.", 699],
          ["Jasmine Milk Tea", "", 599],
          ["Butterfly Coconut", "Cold only.", 750],
          ["Watermelon Milk Tea", "Watermelon Milk Tea.", 675],
          ["Oreo Milk Tea", "Oreo Milk Tea.", 775],
          ["Mango Coconut Frostie", "Selected Mango Toppings + Coconut Milk + Pudding.", 849],
          ["Strawberry Coconut Frostie", "Selected Strawberry Toppings + Coconut Milk + Pudding.", 849]
        ]
      },
      {
        name: "Blend Blast",
        items: [
          ["Avocado Smoothie", "", 850],
          ["Mango Smoothie", "Creamy Mango Smoothie.", 725],
          ["Strawberry Smoothie", "", 725],
          ["Mango Peach Strawberry Smoothie", "", 725],
          ["Pina Colada", "Pineapple + Coconut.", 725],
          ["Taro Smoothie", "", 775],
          ["Honeydew Smoothie", "Honeydew melon, milk, and ice.", 725],
          ["Caramel Frappe (W/ Cream)", "", 795],
          ["Coconut Coffee Frappe", "", 795],
          ["Mocha Coffee Frappe", "", 795],
          ["Pineapple Mango Smoothie W/ Cream", "", 750]
        ]
      },
      {
        name: "Matcha, Coffee & Latte",
        items: [
          ["Taro Latte", "", 750],
          ["Matcha Latte", "", 750],
          ["Strawberry Matcha Latte W/ Fruit Bits", "Matcha + Strawberry bits.", 835],
          ["Sea Salt Coffee", "", 750],
          ["Oreo Matcha Cloudy", "Matcha + oreo.", 850],
          ["Coconut Matcha Cloud", "Matcha + Coconut.", 850],
          ["Pink Coconut Matcha Cloud", "Pink coconut matcha with crunchy coconut crumbs.", 850],
          ["Taro Matcha Latte", "Matcha + Taro flavoring.", 850],
          ["Mango Matcha Latte", "Matcha + mango flavoring.", 835],
          ["Thai Tea Matcha Latte", "", 850],
          ["Dirty Matcha Coffee", "Coffee + Matcha.", 865],
          ["Brown Sugar Matcha", "Brown Sugar boba milk + Matcha.", 850],
          ["Coconut Coffee", "", 799]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Swiss Roll - Milk (2 pcs)", "Light fluffy cream-filled cake.", 525],
          ["Chocolate Temptation (Made in Italy)", "Italian chocolate cake with rich chocolate flavor.", 750],
          ["Limoncello Mascarpone Cake", "", 650],
          ["Oreo Mousse Cheesecake", "", 595],
          ["Tiramisu Cake (Italian Dessert)", "", 799],
          ["Steamed Cheesecake", "", 595]
        ]
      },
      {
        name: "Snacks & Rice Bowls",
        items: [
          ["Gyoza (Potstickers) - 8 pcs", "Pan-fried dumplings filled with chicken and vegetables.", 799],
          ["Cheese Sticks (8 pcs)", "", 799],
          ["Takoyaki", "Octopus balls topped with bonito flakes and mayonnaise.", 950],
          ["Curly Fries", "", 699],
          ["French Fries", "", 599],
          ["Sweet Fries", "", 750],
          ["Lobster Balls (8 pcs)", "", 895],
          ["Chicken Wings (5 pcs)", "With a savory dipping sauce.", 995],
          ["Chicken Tenders", "", 950],
          ["Crispy Tater Tots", "", 699],
          ["Chicken Tenders on Rice", "Chicken tenders on rice with sauce & broccoli.", 1395],
          ["Teriyaki Chicken on Rice", "Teriyaki chicken on rice & broccoli.", 1495],
          ["Teriyaki Salmon on Rice", "Teriyaki salmon on rice & broccoli.", 1595],
          ["Popcorn Chicken Bento", "Popcorn chicken on rice with 2 pcs potstickers and sweet chili sauce.", 1650]
        ]
      },
      {
        name: "Combos & Large Orders",
        items: [
          ["Combo #2", "2 large classic milk teas with boba, 6 gyoza, 6 mozzarella sticks & curly fries.", 2999],
          ["Combo #4", "3 large classic milk teas with boba, 6 gyoza, 3 chicken tenders & french fries.", 3499],
          ["Combo #5", "2 large classic milk teas with boba, 6 gyoza, 3 chicken tenders & french fries.", 3699],
          ["Classic Milk Tea (5 drinks)", "Earl Grey milk tea, 5 drinks.", 2999],
          ["Black Sugar Boba Milk (5 drinks)", "With chewy tapioca pearls, 5 drinks.", 3299],
          ["Tutti Fruit-Tea (5 drinks)", "With mango and strawberry fruit bits, 5 drinks.", 3499],
          ["Mango Mojito (5 drinks)", "With mango bits, 5 drinks.", 3499],
          ["Taro Green Milk Tea (5 drinks)", "", 3499],
          ["Oreo Milk Tea (5 drinks)", "", 3600],
          ["Gyoza Party Tray (30 pcs)", "Fried chicken and vegetable potstickers with 4 dipping sauces.", 2799],
          ["Gyoza Party Tray (45 pcs)", "Fried chicken and vegetable potstickers with 6 dipping sauces.", 3999],
          ["Mozzarella Sticks Tray (24 pcs)", "With 3 dipping sauces.", 2199],
          ["Mozzarella Sticks Tray (48 pcs)", "With 6 dipping sauces.", 4299],
          ["Crispy Chicken Wings Party Tray (20 pcs)", "With 4 dipping sauces.", 3799],
          ["Cheesecake Brownies (10 pcs)", "", 3800]
        ]
      }
    ],
    hours: "Mon–Thu 12–10pm, Fri 12–11pm, Sat 11am–11pm, Sun 11am–10pm",
    phone: "(925) 822-3059",
    orderUrl: "https://order.online/store/breaktime-tea---concord-concord-24472557/",
    siteNote: "Menu and prices from their own online ordering page (order.online, 790 Oak Grove Rd); hours from their Google Business listing."
  },
  'brezo-albany': {
    hours: "Tue–Fri 10:30am–2:30pm, Sat–Sun 8:30am–2:30pm; dinner Tue–Thu 5:30–8pm, Fri–Sat 5:30–9pm, Sun 5:30–8:30pm; Closed Mon",
    siteNote: "Hours from the footer of brezorestaurant.com."
  },
  'buds-burgers': {
    hours: "Mon–Sat 10:30am–7:30pm, Sun 10:30am–6:30pm",
    phone: "(707) 642-3252",
    siteNote: "Hours from Google and Yelp; their own site (budsburgersvallejo.com) is behind a bot check and they are on no delivery app, so no priced menu."
  },
  'cafe-carrusel': {
    sections: [
      {
        name: "Carrusel Classics",
        items: [
          ["Big Breakfast Plate", "", 2200],
          ["Avocado Toast", "", 1800],
          ["Mexi-Avocado Toast", "", 1900],
          ["Bagel Plate", "", 1400],
          ["Breakfast Burrito", "", 1800],
          ["Yogurt Parfait Bowl", "", 1400],
          ["Chilaquiles Rojos", "", 1900],
          ["Chilaquiles Verdes", "", 1900],
          ["Chilaquiles Morrita", "", 1900],
          ["Oatmeal Bowl", "", 1300],
          ["Huevos Rancheros", "", 1800],
          ["Biscuits n Gravy", "", 1500],
          ["Chicken and Bacon waffle Benedict", "", 2100],
          ["Chicken Fried Steak", "", 2400],
          ["Traditional Eggs Benedict", "", 1900],
          ["Salmon Benedict", "", 2000],
          ["Birria Benedict", "", 2000]
        ]
      },
      {
        name: "Morning Rotations",
        items: [
          ["High Rotation Omelette", "", 2100],
          ["Healthy Omelette", "", 1900],
          ["Chile Relleno Omelette", "", 2300],
          ["N.Y. Steak and Eggs", "", 3200],
          ["Chilaquiles Burrito", "", 2300],
          ["Huevos ala Mexicana", "", 1900],
          ["Huevos ala Veracruzana", "", 2200],
          ["Huevos Ahogados", "", 2200],
          ["Huevos con Chorizo", "", 1800],
          ["Huevos con Jamon", "", 1800]
        ]
      },
      {
        name: "Sugarland (Pancakes, Waffles, Crepes)",
        items: [
          ["Creme Brulee French Toast", "", 1800],
          ["Traditional French Toast", "", 1700],
          ["Belgian Waffle", "", 1600],
          ["Matcha Pancakes", "", 1900],
          ["Red Velvet Pancakes", "", 1900],
          ["Ube Pancakes", "", 1900],
          ["Funnel Cake", "", 1800],
          ["Crepe", "", 1700],
          ["Chicken and Waffles", "", 2100],
          ["Stuffed French Toast", "", 1800],
          ["Chocolate Chip Pancakes", "", 1900],
          ["Tiramisu French Toast", "", 1900],
          ["Buttermilk Pancakes", "", 1600],
          ["Blueberry Pancakes", "", 1700],
          ["Strawberry Heaven Pancakes", "", 1900],
          ["Oreo Pancakes", "", 1900],
          ["Over the Rainbow Pancakes", "", 1900],
          ["Japanese Souffle Pancakes", "", 2000]
        ]
      },
      {
        name: "El Jardín (Salads)",
        items: [
          ["Surf and Turf Salad", "", 2300],
          ["Strawberry Salad", "", 1900],
          ["Chicken Caesar Salad", "", 1700],
          ["Elote Tuna Salad", "", 2000]
        ]
      },
      {
        name: "Carrusel Burgers",
        items: [
          ["Breakfast Burger", "", 1900],
          ["Texas Hold'em Burger", "", 2200],
          ["Nacho Cheese Smash Burger", "", 2100]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["Carrusel BLT", "", 1900],
          ["Turkey Club", "", 2000],
          ["Buffalo Chicken Sandwich", "", 2200],
          ["N.Y. Steak Sandwich", "", 2600],
          ["Grilled Cheese", "", 1800],
          ["Croissant Sandwich", "", 1900],
          ["Chicken Pesto Sandwich", "", 2000],
          ["Turkey Sandwich", "", 2000],
          ["Birria Sliders (4pcs)", "", 1700]
        ]
      },
      {
        name: "Street Classics",
        items: [
          ["Queso Birria Tacos (3pcs)", "", 2000],
          ["Soft Baja Shrimp Tacos (2pcs)", "", 1700],
          ["Crispy Shrimp Tacos (2pcs)", "", 1700],
          ["Enchiladas", "", 1900],
          ["Nachos", "", 1800],
          ["Chile Relleno", "", 1900],
          ["Fajitas Plate", "", 2200],
          ["Molcajete", "", 3200],
          ["Enmoladas (mole enchiladas)", "", 2000],
          ["Taquitos Dorados", "", 1800]
        ]
      },
      {
        name: "Main Stage Entrees",
        items: [
          ["Chicken Alfredo Pasta", "", 2200],
          ["Cajun Ala Penne Pasta", "", 2300],
          ["Salmon Plate", "", 2500],
          ["Camarones Ala Diabla", "", 2400],
          ["Ribeye Steak", "", 3500]
        ]
      },
      {
        name: "Carrusel Crusts (Pizza)",
        items: [
          ["Birria Pizza", "", 2500],
          ["Pepperoni Pizza", "", 2000],
          ["Al Pastor Pizza", "", 2300],
          ["Chocolate Dessert Pizza", "", 2000]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["Happy Cakes Meal", "includes Bacon, Sausage and Egg Flavors Buttermilk or Chocolate", 1200],
          ["French Toast", "", 1100],
          ["Cereal Bowl", "", 600],
          ["Mac and cheese", "", 800],
          ["Cheese Quesadilla", "", 800],
          ["Corn Dog", "", 800],
          ["Pink Heart Waffles", "", 1200],
          ["Croissant Sandwich kids", "", 1000],
          ["Grilled Cheese", "", 800],
          ["Cheeseburger UFO", "", 1200],
          ["Chicken Nuggets", "", 1100],
          ["kids Pizza", "", 1100]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["The Affogato", "", 1000],
          ["Pan Dulce (conchitas) (3pcs)", "", 1200],
          ["Tres Leches Cake", "", 1200],
          ["Banana Split", "", 1300],
          ["Strawberry Cake", "", 1200],
          ["Tiramisu Cake", "", 1100],
          ["Banana Bread Pudding", "", 1200]
        ]
      },
      {
        name: "Hot Drinks",
        items: [
          ["Americano", "", 400],
          ["Cafe De Olla", "", 800],
          ["Cortado", "", 400],
          ["Drip Coffee", "", 500],
          ["Espresso", "", 800],
          ["Hot Chocolate", "", 700],
          ["Hot Tea", "", 500],
          ["Latte", "", 800],
          ["London Fog", "", 600],
          ["Pink Drama (pink Coffee)", "", 800]
        ]
      },
      {
        name: "Iced Lattes",
        items: [
          ["Horchata iced Latte", "", 800],
          ["Strawberry Horchata iced Latte", "", 800],
          ["Raspberry Mocha Truffle", "", 800],
          ["Smores iced Latte", "", 800],
          ["Lavender Blueberry iced latte", "", 800],
          ["Choco-Banana Iced latte", "", 800]
        ]
      },
      {
        name: "Matcha",
        items: [
          ["Traditional Matcha", "", 700],
          ["Strawberry Matcha", "", 800],
          ["Blueberry Matcha", "", 800]
        ]
      },
      {
        name: "Milkshakes",
        items: [
          ["Blush Ride (Strawberry)", "", 1100],
          ["Midnight Ride (Chocolate)", "", 1100],
          ["Golden Ride (Vanilla)", "", 1100]
        ]
      },
      {
        name: "Fresh Pressed Juices",
        items: [
          ["El Vampiro (beet,carrot,orange)", "", 1000],
          ["Green Juice", "", 1000],
          ["Fresh Orange Juice", "", 800]
        ]
      },
      {
        name: "Licuados & Smoothies",
        items: [
          ["Choco-milk", "", 800],
          ["Banana", "", 900],
          ["Strawberry", "", 900],
          ["Mamey", "", 1000],
          ["Papaya", "", 1000]
        ]
      },
      {
        name: "Sodas, Juices & Aguas",
        items: [
          ["Coke Products", "", 500],
          ["Redbull", "", 600],
          ["Apple Juice", "", 500],
          ["Cranberry Juice", "", 500],
          ["Horchata", "", 600],
          ["Strawberry Horchata", "", 600],
          ["Jamaica", "", 600],
          ["Pink Obsession", "", 800],
          ["Milk", "", 600]
        ]
      }
    ],
    hours: "Daily 7am–10pm",
    orderUrl: "https://www.toasttab.com/local/order/cafe-carrusel",
    siteNote: "Menu and prices from their Toast online ordering page; hours from Toast and Sonoma Magazine."
  },
  'cafe-napolina': {
    hours: "Daily 11am–9:45pm",
    siteNote: "Hours from Restaurantji and their Slice ordering page (online orders until 9:30pm)."
  },
  'cafe-noir-oak': {
    hours: "Mon 9am–3:30pm; Tue–Fri 9am–3:30pm & 4:30–8pm; Sat 9am–4pm & 5–8pm; Sun 9am–4pm & 5–7:30pm",
    siteNote: "Hours from their own website (cafenoiroak.com, 1620 18th St, Oakland), which lists daytime and dinner service."
  },
  'caitlyns-sweets': {
    hours: "Daily 9am–6pm (custom orders by DM)",
    siteNote: "Hours from MapQuest (Yelp-sourced listing, San Jose 95121); cakes are custom-quoted, no published menu prices."
  },
  'cajun-bowl-san-bruno': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Chowder Soup", "Shrimp or clam", 599],
          ["Lemon Pepper Shrimp", "8 pieces", 1199],
          ["Coconut Shrimp", "8 pieces", 1199],
          ["Sweet Sriracha Shrimp", "8 pieces", 1199],
          ["Char-Grilled Oysters", "From $21.99 half dozen, $39.99 dozen", 2199],
          ["Fried Calamari", "", 1199],
          ["Original Wings", "6 pieces", 1199],
          ["Sweet Sriracha Wings", "6 pieces", 1199],
          ["Lemon Pepper Wings", "6 pieces", 1199],
          ["Chicken Nuggets", "", 899],
          ["Cajun Fries", "", 699],
          ["French Fries", "", 499],
          ["Cheese Fries", "", 899],
          ["Garlic Bread", "", 599],
          ["Cheese Bread", "", 899]
        ]
      },
      {
        name: "From the Wok",
        items: [
          ["Cajun Fried Rice", "Green pepper, corn, onion, sausage, egg, shrimp", 1799],
          ["Seafood Garlic Noodles", "Shrimp, black mussels, garlic, parmesan", 1899],
          ["White Sauce Spaghetti", "Shrimp, clam, parmesan", 1899],
          ["Garlic Noodles", "Garlic, parmesan", 999],
          ["Mac & Cheese", "Bread crumbs", 999],
          ["Shrimp Mac & Cheese", "Shrimp, bread crumbs", 1899],
          ["Lobster & Shrimp Mac & Cheese", "Shrimp, lobster tail, bread crumbs", 2699],
          ["Volcano Shrimp", "1 lb shrimp, corn, ginger, scallion, house cream sauce", 2699],
          ["Shrimp Tornado", "Fried 1 lb shell-on shrimp with house garlic seasoning, with fries", 2699],
          ["Lobster Tornado", "Fried lobster with house garlic seasoning, with fries", 4399]
        ]
      },
      {
        name: "Seafood Boil",
        items: [
          ["Jumbo Shrimp (1 lb)", "Head on or off; pick sauce and spice level. Market price", 2299],
          ["Crawfish (1 lb)", "Market price", 2299],
          ["Black Mussels (1 lb)", "", 1899],
          ["Green-Lipped Mussels (1 lb)", "", 2299],
          ["Middleneck Clams (1 lb)", "", 1899],
          ["Snow Crab", "From $22.99 half lb, $39.99 per lb", 2299],
          ["Dungeness Crab", "From $22.99 half lb, $39.99 per lb", 2299],
          ["Lobster Tail", "From $22.99 one tail, $42.99 two tails", 2299],
          ["Alaskan King Crab Legs (1 lb)", "Market price", 7599],
          ["Seafood Combo", "From $59.99; 8 combos of shrimp, crawfish, clams, mussels, crab or lobster, with 3 sides", 5999]
        ]
      },
      {
        name: "Sides, Desserts & Kids",
        items: [
          ["Boil Side", "Corn, potatoes, egg, sausage, broccoli, fish ball, lobster ball, noodles or rice", 300],
          ["Chocolate Lava Cake", "", 1299],
          ["New York Cheesecake", "", 1299],
          ["Kids Chicken Nuggets & Fries", "", 899],
          ["Kids Macaroni and Cheese", "", 999],
          ["Kids Corn", "", 250]
        ]
      }
    ],
    hours: "Daily 11am–9pm",
    orderUrl: "https://cajunbowlcalifornia.getbento.com/online-ordering/cajunbowlsca/menu",
    siteNote: "Menu from the San Bruno menu PDF on cajunbowlcalifornia.com; hours from Google Maps."
  },
  'cajun-bowl-san-mateo': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Chowder Soup", "Shrimp or clam", 599],
          ["Deep Fried Oysters", "", 1199],
          ["Chicken Tenders with Fries", "2 pieces", 1199],
          ["Crab Sticks", "3 pieces", 1199],
          ["Lemon Pepper Shrimp", "8 pieces", 1199],
          ["Coconut Shrimp", "8 pieces", 1199],
          ["Sweet Sriracha Shrimp", "8 pieces", 1199],
          ["Fried Calamari", "", 1199],
          ["Original Wings", "6 pieces", 1199],
          ["Sweet Sriracha Wings", "6 pieces", 1199],
          ["Lemon Pepper Wings", "6 pieces", 1199],
          ["Fried Fish", "5 pieces", 1199],
          ["Cajun Fries", "", 699],
          ["French Fries", "", 499],
          ["Cheese Fries", "", 899],
          ["Garlic Bread", "", 599],
          ["Cheese Bread", "", 899]
        ]
      },
      {
        name: "From the Wok",
        items: [
          ["Cajun Fried Rice", "Green pepper, corn, onion, sausage, egg, shrimp", 1799],
          ["Seafood Garlic Noodles", "Shrimp, black mussels, garlic, parmesan", 1899],
          ["White Sauce Spaghetti", "Shrimp, clam, parmesan", 1899],
          ["Cajun Pasta", "Shrimp, parmesan", 1899],
          ["Garlic Noodles", "Garlic, parmesan", 1299],
          ["Mac & Cheese", "Bread crumbs", 1299],
          ["Shrimp Mac & Cheese", "Shrimp, bread crumbs", 1899],
          ["Lobster & Shrimp Mac & Cheese", "Shrimp, lobster tail, bread crumbs", 2999],
          ["Snow Crab Fried Rice", "", 2199],
          ["Cajun Snow Crab Fried Rice", "", 2199],
          ["Add Lobster Tail", "To any wok dish", 1899]
        ]
      },
      {
        name: "Seafood Boil",
        items: [
          ["Jumbo Shrimp (1 lb)", "Head on or off; pick sauce and spice level. Market price", 2399],
          ["Crawfish (1 lb)", "Market price", 2399],
          ["Black Mussels (1 lb)", "", 2299],
          ["Green-Lipped Mussels (1 lb)", "", 2399],
          ["Middleneck Clams (1 lb)", "", 2299],
          ["Snow Crab (1 lb)", "", 4399],
          ["Dungeness Crab (1 lb)", "", 4399],
          ["Lobster Tail", "From $24.99 one tail, $45.99 two tails", 2499],
          ["Alaskan King Crab Legs (1 lb)", "Market price", 9999],
          ["Seafood Combo", "From $69.99; 8 combos of shrimp, crawfish, clams, mussels, crab or lobster, with 3 sides", 6999],
          ["All You Can Eat (dine-in)", "From $39.99 Mon–Thu 11am–4pm; $45.99 after 4pm and Fri–Sun", 3999]
        ]
      },
      {
        name: "Sides, Desserts & Drinks",
        items: [
          ["Boil Side", "Corn, potatoes, egg, sausage, broccoli, fish ball, lobster ball or white rice", 300],
          ["Chocolate Lava Cake", "", 1299],
          ["New York Cheesecake", "", 1299],
          ["Iced Fruit Drink", "Mango, pineapple, strawberry, lemonade, coconut, passion fruit, piña colada", 999],
          ["Soda", "Coke, Sprite, Coke Zero", 299],
          ["Sparkling Water or Sweet Tea", "", 499]
        ]
      }
    ],
    hours: "Sun–Thu 11am–9pm, Fri–Sat 11am–9:30pm",
    orderUrl: "https://cajunbowlcalifornia.getbento.com/online-ordering/san-mateo/menu",
    siteNote: "Menu from the San Mateo menu PDFs on cajunbowlcalifornia.com; hours from Google Maps."
  },
  'cajun-crack-n': {
    sections: [
      {
        name: "Signature Combos",
        items: [
          ["Combo #1", "Choose 3: mussels, clams, crawfish or shrimp. With 2 corn, 2 potatoes, 4 pcs sausage.", 5795],
          ["Combo #2", "1 of crab/lobster/snow crab/king crab + 2 small catches; corn, potatoes, sausage.", 9595],
          ["Combo #3", "1 of crab/lobster/snow crab/king crab + 3 small catches; corn, potatoes, sausage.", 11495],
          ["Signature 1", "Snow crab legs (1 cluster) and 1/2 lb shrimp, with 1/2 lb sausage, eggs, corn, potatoes.", 3995],
          ["Signature 2", "1 of snow crab, lobster tail or Dungeness + 2 of shrimp, clam, mussel or crawfish.", 7395]
        ]
      },
      {
        name: "The Boiling",
        items: [
          ["The Boiling", "From. Choose your catch: clams, crawfish, shrimp, mussels, lobster, crab, sausage.", 1800]
        ]
      },
      {
        name: "Raw Bar",
        items: [
          ["Fresh Raw Oyster 6 pcs", "With lemon wedges and cocktail sauce.", 1795],
          ["Fresh Raw Oyster 12 pcs", "With lemon wedges and cocktail sauce.", 2995],
          ["Kumamoto Oyster 6 pcs", "With lemon wedges and cocktail sauce.", 2695],
          ["Kumamoto Oyster 12 pcs", "With lemon wedges and cocktail sauce.", 4895]
        ]
      },
      {
        name: "Appetizers",
        items: [
          ["Hot Wings (8 pcs)", "BBQ / Buffalo / Cajun / Lemon Pepper.", 1395],
          ["Fried Soft Shell Crab", "Cajun-seasoned.", 1695],
          ["Fried Calamari", "", 1495],
          ["Fried Oysters (10 pcs)", "Cajun-seasoned.", 1595],
          ["Fried Okra", "", 950],
          ["Garlic Bread", "", 650],
          ["Onion Ring", "", 750],
          ["Fries", "French / Cajun / Lemon Pepper / Cajun Curly.", 750],
          ["Sweet Potato Fries", "", 850],
          ["Side Condiments", "Ranch, cocktail sauce, sweet chili mayo, thousand island.", 100]
        ]
      },
      {
        name: "Fried Baskets",
        items: [
          ["Chicken Tenders Basket", "With Cajun, lemon pepper or sweet potato fries.", 1595],
          ["Fried Shrimp Basket", "With Cajun, lemon pepper or sweet potato fries.", 1695],
          ["Fried Catfish Basket", "With Cajun, lemon pepper or sweet potato fries.", 1695],
          ["Fried Oyster Basket", "With Cajun, lemon pepper or sweet potato fries.", 1795],
          ["Fried Soft Shell Crab Basket", "With Cajun, lemon pepper or sweet potato fries.", 1995]
        ]
      },
      {
        name: "Po'Boys & Rolls",
        items: [
          ["Chicken Po' Boy", "With Cajun, lemon pepper or sweet potato fries.", 1595],
          ["Shrimp Po' Boy", "Crispy shrimp with remoulade; choice of fries.", 1695],
          ["Oyster Po' Boy", "Crispy oysters; choice of fries.", 1695],
          ["Catfish Po' Boy", "", 1795],
          ["Soft Shell Crab Po' Boy", "Choice of Cajun, lemon pepper or sweet potato fries.", 1995],
          ["Shrimp Roll", "Cajun shrimp on a soft roll with choice of fries.", 1995],
          ["Lobster Roll (2)", "Whole lobster.", 3995]
        ]
      },
      {
        name: "Rice / Noodle",
        items: [
          ["Garlic Noodle", "", 1295],
          ["Cajun Shrimp Fried Rice", "Carrot, green pea, corn, onion, egg, sausage and shrimp.", 1695],
          ["Cajun Crawfish Fried Rice", "Carrot, green pea, corn, onion, egg, sausage and crawfish.", 1795],
          ["Steamed Rice", "", 395]
        ]
      },
      {
        name: "Soup",
        items: [
          ["Cajun Chowder", "", 695],
          ["Gumbo Soup", "With or without rice.", 695]
        ]
      },
      {
        name: "Add-Ons",
        items: [
          ["Extra Seafood Sauce", "", 895],
          ["Butter", "", 375]
        ]
      },
      {
        name: "Dessert & Drinks",
        items: [
          ["Ice Cream Cup", "Macaron ice cream, assorted flavors.", 295],
          ["Flavored Lemonade", "Strawberry / Mango.", 499],
          ["Fountain Drink", "", 399]
        ]
      }
    ],
    hours: "Sun–Thu 11:30am–9pm, Fri–Sat 12–10pm",
    address: "1975 Diamond Blvd, Ste E361, Concord, CA 94520",
    phone: "(925) 408-8555",
    orderUrl: "https://www.doordash.com/store/24646509",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu items from their own site (cajuncracknca.com/concord, no prices) with prices from their DoorDash store; hours from Visit Concord and Willows Shopping Center."
  },
  'cal-burger': {
    hours: "Tue–Fri 11am–8pm, Sat–Sun 1–6pm; Closed Mon",
    phone: "(510) 634-7127",
    siteNote: "Hours are from Cal Burger & More's Google listing and their Instagram bio, which agree; phone is on calbgocrazy.com and their Yelp page."
  },
  'cambodian-street-food': {
    hours: "Mon, Wed–Sat 11am–7pm; Sun 11am–5pm; Closed Tue",
    phone: "(510) 842-3134",
    siteNote: "Hours are from their Instagram bio and Yelp, which agree; no online menu with prices was found."
  },
  'carabao': {
    hours: "Mon, Thu–Fri 4pm–8:30pm; Sat–Sun 11am–2pm & 5pm–9pm; Closed Tue–Wed",
    siteNote: "Hours are from carabaonapa.com."
  },
  'champa-garden': {
    hours: "Sun–Thu 11am–3pm, 5–9pm; Fri–Sat 11am–3pm, 5–9:30pm",
    siteNote: "Hours come from the Opening Hours section of Champa Garden's own website."
  },
  'cheries-southern-kitchen': {
    hours: "Wed–Sat 12–3pm & 4–8pm, Sun 12–3pm & 4–7pm, Closed Mon–Tue",
    siteNote: "Hours are from their own website (\"or until sold out\"); Restaurantji lists the same."
  },
  'chiquo-and-eva': {
    hours: "Fri–Sun 5–9pm; Closed Mon–Thu",
    address: "321 First St, Benicia, CA 94510",
    siteNote: "Hours and address from their own website (chiquoandeva.com), which lists the Benicia pop-up at 321 First Street."
  },
  'chutneys': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Baby Corn Manchuria", "Crispy baby corn tossed in a savory sauce, garnished with fresh green onions.", 1399],
          ["Tawa Paneer Tikka", "Grilled paneer cubes marinated with spices, accompanied by sautéed bell peppers and onions. Garnished with…", 1399],
          ["Onion Samosa", "Crispy pastry filled with spiced onions, served with a side of green chutney.", 699],
          ["Paneer 65", "Spiced and crispy paneer cubes, garnished with shredded cabbage, served with a tangy dipping sauce.", 1199],
          ["Samosa (3 Pcs)", "Crispy pastry pockets filled with seasoned potatoes and peas, served with a side of tangy green chutney.", 599],
          ["Stuffed mirchi", "", 999],
          ["Mirchi Bhaji", "Crispy fried green chili peppers stuffed with spiced gram flour batter, garnished with chopped onions and…", 899],
          ["Chilli Paneer Dry", "Spicy paneer cubes tossed with bell peppers and onions, garnished with sliced green onions.", 1399],
          ["Crispy Corn", "Golden fried corn kernels seasoned with spices, garnished with fresh cilantro and whole dried chilies.", 1299],
          ["Mushroom Pepper Fry", "Sautéed mushrooms with peppers, garnished with fresh herbs, lemon wedge, and sliced red onions.", 1399],
          ["Cut Mirchi", "Crispy battered chili fritters served with fresh shredded vegetables and a side of green chutney.", 799],
          ["Veg Manchuria", "Crispy spring rolls filled with seasoned vegetables, served with a side of tangy dipping sauce.", 1299],
          ["Chili Paneer Dry", "", 1399],
          ["Veg Spring Roll (6 Pcs)", "Crispy spring rolls filled with seasoned vegetables, served with a side of tangy dipping sauce.", 1299],
          ["Chilli Mushroom", "Mushrooms sautéed with onions and bell peppers, coated in a spicy chili sauce, garnished with chopped…", 1399]
        ]
      },
      {
        name: "Biryanis & Pulao",
        items: [
          ["Veg Dum Biryani", "Fragrant basmati rice layered with spiced vegetables, garnished with crispy fried onions and fresh cilantro.", 1199],
          ["Chutneys Special Paneer Biryani", "Fragrant basmati rice layered with marinated paneer cubes, aromatic spices, and garnished with crispy…", 1299],
          ["Mushroom Fry Piece Pulao", "Sautéed mushrooms mixed with fragrant rice, garnished with crispy fried onions and fresh herbs.", 1199]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Rasamalai", "", 499],
          ["Kesari", "", 499],
          ["Chutneys Special Sweet", "", 599]
        ]
      },
      {
        name: "Dosa",
        items: [
          ["Masala Dosa", "Crispy fermented rice and lentil crepe filled with spiced potato mixture, served with chutneys and sambar.", 999],
          ["Masala Onion Dosa", "Crispy dosa filled with spiced potato mix, topped with sliced onions. Served with coconut chutney, tomato…", 1099],
          ["Ravva Masala Dosa", "Crispy semolina crepe filled with seasoned potato mixture, garnished with chopped onions, served with…", 1099],
          ["Onion Masala Ravva Dosa", "Crispy semolina crepe topped with onions, served with spiced mashed potatoes, coconut chutney, tomato…", 1099],
          ["Onion Ravva Dosa", "Crispy semolina crepe topped with finely chopped onions, served with coconut, tomato, and lentil chutneys.", 1099],
          ["Onion Uttapam", "", 999],
          ["Ghee Roast Plain Dosa", "", 999],
          ["Onion Dosa", "", 999],
          ["Ghee Karam Dosa", "", 999],
          ["Plain Dosa", "", 899],
          ["Ghee Roast Dosa", "Crispy dosa infused with aromatic ghee, garnished with chopped onions, served with coconut chutney, tomato…", 1099],
          ["Ravva Dosa", "", 1099],
          ["Ghee Roast Onion Masala Dosa", "", 999],
          ["Onion Pesarattu", "Crispy lentil crepe topped with finely chopped onions, served with coconut chutney, tomato chutney, and a…", 1099]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Mango Lassi", "", 599],
          ["Tea", "", 499]
        ]
      },
      {
        name: "South Tiffins",
        items: [
          ["Idli (3 Pcs)", "Steamed rice cakes served with coconut chutney, tomato chutney, and sambar.", 799],
          ["Poori (2 Pcs)", "Golden, puffed unleavened bread served with a side of spiced lentil curry.", 999],
          ["Mysore Bonda", "Golden, round fritters made from urad dal batter, deep-fried to a crisp exterior with a soft interior…", 799],
          ["Guntur Idli (3 Pcs)", "Soft steamed rice cakes topped with spicy Guntur chili powder, served with lentil soup and coconut chutneys.", 899],
          ["Thatte Idli (1 Pc)", "", 699],
          ["Ulvacharu Idli (3 Pcs)", "", 899],
          ["Andhra Garelu with Sambar (4 pcs)", "", 1099],
          ["Andhra Garelu (4 Pcs)", "Crispy lentil doughnuts, seasoned with spices, served as four pieces.", 999],
          ["14 Mini Idli with sambar", "Soft mini rice cakes immersed in a savory lentil and vegetable stew.", 899]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/chutneys-brentwood-43392381/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their DoorDash store."
  },
  'citybachi': {
    hours: "Tue–Sun 5pm–1am, Closed Mon",
    siteNote: "Hours are from citybachi.com ('open tues - sun 5pm - 1am')."
  },
  'da-good-vibes': {
    hours: "Thu 12pm–7pm, Fri–Sat 12pm–8pm, Sun 11am–4pm, Closed Mon–Wed",
    phone: "(858) 375-6922",
    siteNote: "Hours from Apple Maps and Yelp, which agree; goodvibeseats.com lists no hours."
  },
  'delah-coffee': {
    hours: "Mon–Thu 7am–8pm, Fri 7am–9pm, Sat 7am–11pm, Sun 7am–9pm",
    siteNote: "Hours are from the Oakland (420 W Grand Ave) entry on delahcoffee.com/locations."
  },
  'devil-and-angel-desserts': {
    sections: [
      {
        name: "Boba",
        items: [
          ["Taro", "24 oz, jasmine green tea base", 695],
          ["Vietnamese Coffee", "24 oz, with condensed milk", 695],
          ["Matcha Berry", "24 oz, jasmine green tea base with strawberry", 695],
          ["Matcha", "24 oz, jasmine green tea base", 695],
          ["Fresh Milk", "24 oz, milk base", 695],
          ["Royal Milk Tea", "24 oz, black tea base", 695],
          ["Thai Tea", "24 oz, Thai tea base", 695]
        ]
      },
      {
        name: "Refreshers",
        items: [
          ["Love Potion", "Lemonade base, strawberry, guava, lemon juice, lychee jelly", 625],
          ["Devil Pop", "Lemonade base, guava, lychee, lemon juice, strawberry popping boba", 625],
          ["Angel Pop", "Lemonade base, peach, kumquat, lemon juice, mango popping boba", 625],
          ["Summer Blast", "Black tea base, peach, mango, lemon juice, mango jelly", 625],
          ["Blue Lagoon", "Lemonade base, blue curacao, kumquat, lemon juice, lychee jelly", 625]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["Mango Smoothie", "Mango purée blend, optional boba", 625],
          ["Pistachio Smoothie", "Optional boba", 625],
          ["Thai Tea Smoothie", "24 oz, Thai tea base", 625],
          ["Strawberry Smoothie", "Creamy strawberry blend, optional boba", 625],
          ["Cookies & Cream Smoothie", "Optional boba", 625],
          ["Coffee Smoothie", "Optional boba", 625],
          ["Matcha Smoothie", "Matcha powder, fresh milk, boba", 625],
          ["Chocolate Smoothie", "Optional boba", 625],
          ["Taro Smoothie", "Optional boba", 625],
          ["Honeydew Smoothie", "Fresh blended, optional boba", 625]
        ]
      }
    ],
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Drinks menu and prices come from their DoorDash store for the Concord (The Veranda) location; desserts are not priced online."
  },
  'dimond-halal-eatery': {
    sections: [
      {
        name: "Burgers",
        items: [
          ["Cheeseburger", "Halal smash burger, house sauce, grilled onions, lettuce, tomatoes, pickles", 825],
          ["Double Cheeseburger", "Two halal smash patties, house sauce, grilled onions, lettuce, tomatoes, pickles", 1150],
          ["Cheeseburger Combo", "Cheeseburger served with seasoned fries", 1450],
          ["Double Cheeseburger Combo", "Double cheeseburger served with seasoned fries", 1785]
        ]
      },
      {
        name: "Steak Hoagies",
        items: [
          ["Steak Hoagie", "Seasoned steak in a hoagie roll with melted cheese and sautéed onions", 1050],
          ["Steak Hoagie Combo", "Steak hoagie served with seasoned fries", 1700]
        ]
      },
      {
        name: "Halal Wings",
        items: [
          ["6 Piece Wings", "", 1350],
          ["12 Piece Wings", "", 2650],
          ["20 Piece Wings", "", 4350]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Loaded Fries", "Fries topped with creamy sauce, pickles and jalapeños", 1850]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/dimond-halal-eatery-oakland-32576649/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu and prices are from their DoorDash store; their Uber Eats store lists the same burgers and wings at the same prices."
  },
  'divino-ristorante': {
    sections: [
      {
        name: "Insalate & Antipasti",
        items: [
          ["Zuppa del Giorno", "Soup of the day, cup ($11 bowl)", 800],
          ["Insalata Divino", "Arugula, radicchio, candied pecans, gorgonzola, balsamic (veg, GF)", 1500],
          ["Insalata Cesare", "Romaine Caesar salad with croutons", 1500],
          ["Insalata Caprese", "Heirloom tomatoes, burrata, basil & extra-virgin olive oil (GF)", 1800],
          ["Calamari alla Griglia", "Grilled Monterey calamari, cannellini beans & arugula (GF)", 1700],
          ["Carpaccio", "Thin raw beef, mustard, onions, arugula, shaved parmesan (GF)", 1800],
          ["Polpette della Mamma", "Slow-braised meatballs with tomato sauce", 1800],
          ["Bruschetta", "Toasted bread, chopped tomatoes, basil & olive oil (veg)", 1300]
        ]
      },
      {
        name: "Le Paste",
        items: [
          ["Sedanini", "Tube pasta, sausage, peas, roasted peppers, tomato cream sauce", 2800],
          ["Pappardelle", "Homemade wide fettuccine with Bolognese", 2800],
          ["Linguine Vongole", "Linguine with clams, garlic, white wine", 3000],
          ["Gnocchi", "Homemade potato dumplings, tomato sauce, fresh mozzarella (veg)", 2600],
          ["Tagliatelle", "Homemade tagliatelle, prawns, mushrooms, arugula, white wine", 3000],
          ["Spaghetti con Polpette", "Spaghetti with slow-braised meatballs & tomato sauce", 2800],
          ["Ravioli", "Ricotta & spinach ravioli, butter, sage, tomato sauce (veg)", 2600],
          ["Fettuccine", "Homemade fettuccine with basil pesto & fresh ricotta (veg)", 2600],
          ["Lasagna", "Homemade lasagna with Bolognese & béchamel", 2900]
        ]
      },
      {
        name: "I Secondi",
        items: [
          ["Pollo in Porchetta", "Organic chicken, prosciutto, fennel seeds, arugula (allow 20 min)", 3300],
          ["Costoletta di Maiale", "Pistachio-crusted pork chop with saba (allow 20 min)", 3400],
          ["Vitello", "Sautéed veal scaloppini, mushrooms & wine sauce", 3600],
          ["Gamberoni", "Tiger prawns, garlic, lemon, cherry tomatoes, basil, white wine", 3300]
        ]
      },
      {
        name: "Contorni",
        items: [
          ["Sautéed Spinach", "", 900],
          ["Purè di Patate", "Mashed potatoes", 900],
          ["Vegetable del Giorno", "", 900],
          ["Add Chicken", "", 1000],
          ["Add Shrimp", "", 1200]
        ]
      },
      {
        name: "Lunch (Mon–Fri)",
        items: [
          ["Insalata di Spinaci", "Baby spinach, prawns, goat cheese, crispy pancetta, balsamic (GF)", 2300],
          ["Insalata Cesare con Pollo", "Caesar salad with grilled organic chicken", 2100],
          ["Panino Vegetariano", "Baguette, grilled eggplant, zucchini, peppers & mozzarella, side salad", 1900],
          ["Panino con Pollo", "Baguette, grilled chicken, tomato, zucchini, red onion, smoked mozzarella", 2100],
          ["Panino con Polpette", "Baguette, braised meatballs, smoked mozzarella, tomato sauce, side salad", 2100],
          ["Maiale Saltimbocca", "Pork scaloppini with prosciutto, sage, white wine", 2300],
          ["Pollo Marsala", "Chicken breast with mushrooms & Marsala wine", 2500],
          ["Pollo Milanese", "Breaded chicken breast, mashed potatoes & vegetables", 2400],
          ["Vitello Piccata", "Veal scaloppini with lemon, capers, white wine", 3000]
        ]
      }
    ],
    hours: "Lunch Mon–Fri 11:30am–2pm; dinner Sun–Thu 4:30–8:30pm, Fri–Sat 4:30–9pm",
    email: "belmont@divinoristorante.com",
    siteNote: "Menu and hours are from the dinner and lunch menus linked on their own website."
  },
  'dolores-deluxe': {
    sections: [
      {
        name: "Seasonal Sandos (lunch 10:30am–4pm)",
        items: [
          ["Vegan Sando #48", "Braised romano beans, tomato miso, espelette pepper shatta, fried garlic + mint on green onion slab", 1550],
          ["Après-Ski", "Amarosa potato, reblochon, porcini aioli, caramelized onion, cornichon mustard on focaccia (hot)", 1650],
          ["Deluxe Baguette #63", "Lamb merguez, aged manchego, butternut squash, hazelnut, treviso + harissa-kumquat (toasted)", 1650],
          ["La Ventimiglia", "Confit pork shoulder, prosciutto, gruyère, fontina, spicy apple mostarda + fried sage (hot)", 1800],
          ["Bozo Dubbed Over", "Rotisserie chicken, cajun alfredo, parmesan, mama lil's peppers, balsamic, puntarelle (hot)", 1750]
        ]
      },
      {
        name: "Classic Sandos",
        items: [
          ["Lebanese Caprese", "Tomato, mint, mozzarella, pickled armenian cucumbers, whipped labne + zaatar on baguette", 1500],
          ["Lady Giana", "Caramelized eggplant, basil, mozzarella, fontina, tomato arrabbiata on focaccia garlic bread (hot)", 1650],
          ["Electric Mayhem", "Cajun tuna salad, american cheese, fontina, holy trinity, shredduce + voodoo chips (hot)", 1700],
          ["Ode to Barbar", "Rotisserie chicken, homemade toum, lebanese pickles, crispy potatoes, parsley + sumac", 1650],
          ["Call Me Serge", "Turkey melt with bacon, white cheddar, smoked gouda, chili orange jam, arugula, rosemary ranch (hot)", 1700]
        ]
      },
      {
        name: "Breakfast All Day",
        items: [
          ["The Austin Cut 2.0", "Egg patty, taylor ham, american cheese, roasted poblanos, serrano aioli + tortilla chips (hot)", 1350],
          ["Deluxe Breakfast Sando", "Creamed leek omelette, boursin, pepper jack + spicy tomato jam on green onion slab (hot)", 1300],
          ["Cubano Croissant", "Smoked ham, gruyère, mayo, dijon + grillo pickle", 950]
        ]
      },
      {
        name: "Fresh Grab + Go",
        items: [
          ["Deluxe Caesar Wrap", "Grilled chicken, shredded romaine, deluxe caesar dressing, lemon zest, parmesan crisps", 1450],
          ["Salade Maison", "Shaved fennel, herbs, nectarine, fresno peppers + nectarine-preserved lemon vinaigrette (vegan)", 950],
          ["Teta's Fattoush Salad", "Romaine, mint, parsley, tomato, persian cucumber, radish, sumac-lemon vinaigrette + pita chips (vegan)", 1200]
        ]
      }
    ],
    hours: "Daily 7:30am–7pm",
    siteNote: "Menu from the Oct 24, 2026 lunch board on doloresdeluxe.com (changes often); hours from their homepage.",
    pricesEstimated: "From their October 24, 2026 lunch board, which changes often."
  },
  'donut-farm': {
    sections: [
      {
        name: "Vegan Donuts",
        items: [
          ["Half Dz", "We'll pick you out the best half dozen we have", 2100],
          ["Dozen", "We'll pick you out the best dz. we have", 3800]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/pepples-donut-farm-berkeley-93518/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Donut box prices are from their DoorDash store; their site says flavors rotate daily and the weekend brunch menu changes weekly."
  },
  'dope-pho': {
    hours: "Daily 11am–2:30pm, 4pm–9:30pm",
    siteNote: "Hours come from the hours box on Dope Pho's own menu11 online-ordering page."
  },
  'dough-burger': {
    hours: "Sun–Thu 11am–1:30am, Fri–Sat 11am–3am",
    siteNote: "Hours are from the San Jose (1751 N First St) location block on doughburger.com."
  },
  'drip-dessert-house': {
    hours: "Tue–Sun 3pm–11:30pm, Closed Mon",
    siteNote: "Hours are the business hours set on their own Square online store."
  },
  'dumont-livermore': {
    hours: "Sun–Thu 11am–10pm, Fri 11am–11pm, Sat 10am–11pm",
    phone: "(925) 315-5675",
    siteNote: "Hours and phone are from the Livermore store page on dumont.us; Google's listing shows the same hours. No priced menu was found for this store."
  },
  'eat-more-pho': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Spring Rolls (Gỏi Cuốn)", "Rice paper rolls with shrimp, pork, vermicelli and herbs; peanut sauce", 900],
          ["Egg Rolls (Chả Giò)", "Fried rolls with shrimp, pork, taro, onion and carrot; fish sauce", 900],
          ["Garlic Chicken Wings (Cánh Gà Tỏi)", "Crispy wings with garlic", 850],
          ["Popcorn Chicken", "With sweet and sour sauce", 800],
          ["French Fries", "With ketchup", 600],
          ["Shrimp Cake (Tàu Hủ Ky)", "", 975]
        ]
      },
      {
        name: "Beef Pho",
        items: [
          ["Custom Pho", "Build your own bowl with up to four kinds of meat", 1700],
          ["Special Combination Pho", "Rare filet mignon, flank, fat brisket, tendon and meatballs", 1800],
          ["Rare Pho (Phở Tái)", "", 1700],
          ["Rare & Meatball Pho (Tái, Bò Viên)", "", 1700],
          ["Short Rib Pho (Phở Sườn Bò)", "", 1950],
          ["Oxtail Pho (Phở Đuôi Bò)", "", 1850],
          ["Pho No-Meat", "", 1250]
        ]
      },
      {
        name: "Chicken & Seafood Pho",
        items: [
          ["Chicken Pho (Phở Gà)", "Shredded white chicken, rice noodles, broth and herbs", 1700],
          ["Seafood Pho (Hủ Tiếu Hải Sản)", "Rice noodles with shrimp, squid and scallop", 1700]
        ]
      },
      {
        name: "Rice Plates",
        items: [
          ["Pork Chop & Shrimp Cake Rice (Cơm Sườn Nướng, Tàu Hủ Ky)", "", 1700],
          ["BBQ Galbi Ribs Rice (Cơm Sườn Bò Đại Hàn)", "", 1800],
          ["BBQ Pork Rice (Cơm Thịt Nướng)", "", 1800],
          ["BBQ Chicken Rice (Cơm Gà Nướng)", "", 1800]
        ]
      },
      {
        name: "Vermicelli Bowls",
        items: [
          ["Grilled Pork & Egg Rolls Bowl (Bún Thịt Nướng Chả Giò)", "Vermicelli, lettuce, cucumber, pickles, herbs, fish sauce dressing", 1700],
          ["Grilled Pork, Shrimp & Egg Rolls Bowl (Bún Tôm Thịt Nướng Chả Giò)", "", 1700]
        ]
      },
      {
        name: "Vegetarian & Sides",
        items: [
          ["Vegetarian Pho (Phở Chay)", "", 1700],
          ["Cup of Broth", "", 500]
        ]
      },
      {
        name: "Drinks & Smoothies",
        items: [
          ["Thai Iced Tea", "", 595],
          ["Mango Smoothie", "", 700],
          ["Avocado Smoothie", "", 700],
          ["Soursop Smoothie", "", 700]
        ]
      }
    ],
    hours: "Daily 10am–12am",
    phone: "(408) 459-5009",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their Uber Eats/Postmates store (partial; Toast page shows the same prices); hours from Yelp and Apple Maps."
  },
  'el-sazon': {
    hours: "Mon–Fri 11am–4pm, Sat 11am–3pm, Closed Sun",
    siteNote: "Hours come from El Sazon's Yelp listing; their Toast site's hours look like online-ordering placeholders."
  },
  'endless-summer-sweets': {
    hours: "Daily 12pm–10pm",
    siteNote: "Hours from the Opening Hours section on endlesssummersweets.com."
  },
  'four-chairs': {
    hours: "Mon–Fri 10am–2:30pm, Sat–Sun 9am–3pm",
    siteNote: "Hours are from their own website; Restaurantji and Yelp agree."
  },
  'fresh-fuel-juicery': {
    hours: "Sun–Thu 9am–7:30pm, Fri–Sat 9am–11:30pm",
    siteNote: "Hours come from the store-hours data on Fresh Fuel's order.online (DoorDash) ordering page."
  },
  'frymazing': {
    sections: [
      {
        name: "Korean Fried Chicken Wings",
        items: [
          ["Original Fried Chicken Wings", "10pc original wings", 1849],
          ["Honey Butter Fried Chicken Wings", "Our delicious Korean Fried chicken gets glazed in our signature Honey Butter glaze.", 1849],
          ["Korean Yangnyum Wings", "Our Delicious Korean wings tossed in our \"Yangyum\" sauce. It is sweet, savory, tangy, and oh-so gooood!", 1849],
          ["Chilin' Chili Fried Chicken Wings", "Our delicious wings get tossed in our spiciest sauce.", 1849],
          ["Soy Garlic Fried Chicken Wings", "Our delicious wings are tossed in our savory, garlicky, soy saucy sauce.", 1849],
          ["Double Crunch Fried Chicken Wings", "Remember eating ramen in the bag? This is our chicken version of that.", 1849],
          ["Chee-Z Fried Chicken Wings", "Pronounced \"cheesy\", these crispy wings are tossed in our house cheese dry rub.", 1849],
          ["Half&Half Fried Chicken Wings", "Can't Choose? Well, we tried to help, but you still gotta pick 2. Choose from any 2 of our wing flavors!", 1998],
          ["Wing Combo", "From 5 Pieces of our delicious fried wings or boneless wings, matched with our golden fries.", 1545],
          ["JALA-LUJAH Wings", "10pc of our delicious wings are smothered in our creamy jalapeno sauce.", 1849]
        ]
      },
      {
        name: "Korean Fried Boneless Chicken",
        items: [
          ["BONELESS Half&Half Fried Chicken", "Can't decide? Choose 2 flavors to try!", 1998],
          ["BONELESS Chee-Z Chicken", "Pronounced \"cheesy\", these crispy wings are tossed in our house cheese dry rub.", 1849],
          ["BONELESS Double Crunch Fried Chicken", "Remember eating ramen in the bag? This is our chicken version of that.", 1849],
          ["BONELESS Soy Garlic Fried Chicken", "Our delicious wings are tossed in our savory, garlicky, soy saucy sauce.", 1849],
          ["BONELESS Yangnyum Chicken", "Our \"Yangnyum\" chicken is the sauce of choice in Korea. It is sweet, spicy, tangy, and oh-so gooooood!", 1849],
          ["BONELESS Chilin' Chili Chicken", "Our delicious Korean Fried Chicken, tossed in our spiciest sauce.", 1849],
          ["BONELESS Original Korean Fried Chicken", "Our delicious Korean Fried Chicken in all its glory.", 1849],
          ["BONELESS Honey Butter Chicken", "Our delicious Korean Fried chicken gets glazed in our signature Honey Butter glaze.", 1849],
          ["BONELESS JALA-LUJAH Chicken", "", 1849]
        ]
      },
      {
        name: "Rice Bowls & Korean Specials",
        items: [
          ["Bulgogi Rice Bowl", "Housemade bulgogi with mom's kimchi, garlic aioli, Korean chili aioli, green onion and sesame.", 1437],
          ["Bibimbob", "The quintessential Korean dish. Bibimbob, meaning mixed rice in Korean, is full of mouth-watering flavors.", 1643],
          ["Tteokboki", "Korea's favorite street food is tteokboki (pronounced Dduck-bok-ki).", 1437],
          ["Miso Butter Chicken Rice Bowl", "Chicken thighs braised in miso butter sauce, topped with garlic aioli and green onions. Served with kimchi.", 1437],
          ["Frymazing Rice Bowl", "Boneless fried chicken over rice and cheese, topped with house Frymazing Sauce and green onions.", 1437],
          ["Lunch Box", "Our Famous Bulgogi Rice Bowl gets paired with our mouth-watering chicken.", 1849]
        ]
      },
      {
        name: "Loaded Fries",
        items: [
          ["Bulgogi Fries", "Bulgogi, shredded cheese, kimchi, garlic aioli, Korean chili aioli, sesame seeds, green onion", 1437]
        ]
      },
      {
        name: "Gimbap",
        items: [
          ["Bulgogi Gimbap", "Beef bulgogi with sautéed vegetables, eggs and pickled radish, wrapped in roasted seaweed.", 870],
          ["Spam Gimbap", "Spam with sautéed vegetables, eggs and pickled radish, wrapped in roasted seaweed.", 870],
          ["Tuna Gimbap", "Tuna salad with sautéed vegetables, eggs and pickled radish, wrapped in roasted seaweed.", 870]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Fries", "Crispy, golden fries.", 412],
          ["Fresh Garlic Fries", "Golden fries get tossed in our fresh garlic blend.", 515],
          ["Chee-Z Fries", "Golden Fries are tossed in our house-made Chee-Z dry rub.", 515],
          ["K-ajun Fries", "Golden fries are tossed in our special cajun spice that is blended with Korean Chilies", 515],
          ["Steamed White Rice", "", 309],
          ["Pickled Garlic", "Fresh garlic is pickled to perfection.", 360],
          ["Pickled Radish", "Our housemade pickled radish aka \"Chicken Moo\" in Korea, is the perfect pairing with our crispy wings.", 360],
          ["Kimchi - Bottle", "", 1030]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Craft Lemonade", "", 515],
          ["Ramune", "The \"Marble Drink\". A fun sparkling drink made with real cane sugar.", 412],
          ["Banana Milk", "", 257],
          ["Coffee Milk", "", 257],
          ["Strawberry Milk", "Korean Strawberry Milk", 250],
          ["Faygo Blue Raspberry Soda", "", 309],
          ["Faygo Watermelon Pineapple Soda", "", 309],
          ["Coke", "", 206],
          ["Coke Zero", "", 206],
          ["Sprite", "", 206],
          ["Sparkling Water", "", 206],
          ["Oolong Tea", "", 412],
          ["Jasmine Green Tea", "", 412],
          ["Matcha Green Tea", "", 412],
          ["Good Tea - Peach", "", 412],
          ["Good Tea - Lemon", "", 412],
          ["Bottled Water", "", 103]
        ]
      }
    ],
    orderUrl: "https://frymazing.com/menu",
    siteNote: "Menu and prices from their online ordering menu on frymazing.com."
  },
  'ginza-sushi': {
    hours: "Mon–Fri 11am–2pm, 5–9pm; Sat 11am–9pm; Sun 12–9pm",
    siteNote: "Hours from Google, consistent with their Toast ordering hours."
  },
  'glasshouzz': {
    hours: "Daily 10:30am–9:30pm",
    phone: "(925) 800-5984",
    siteNote: "Hours are from Yelp and OpenTable, which agree, and match most days on their Toast site."
  },
  'golden-donkatsu-dublin': {
    sections: [
      {
        name: "Donkatsu",
        items: [
          ["Golden Wang Donkatsu", "Giant pork cutlet with savory sauce", 2399],
          ["Spicy Wang Donkatsu", "Giant pork cutlet with spicy sauce", 2399],
          ["Half & Half", "Classic & Spicy pork cutlet with savory sauce", 2399],
          ["Fish Katsu", "Fish cutlet with savory sauce", 2599],
          ["Golden Wang Shrimp Katsu", "Jumbo shrimp cutlet with savory sauce", 2699],
          ["Golden Chicken Katsu", "Chicken cutlet with savory sauce", 2399],
          ["Cheese Wang Donkatsu", "Cheese pork cutlet with rich savory sauce", 2599],
          ["Pork & Fish Katsu", "Pork Cutlet & Fish Cutlet Combo", 2799],
          ["Pork & Shrimp Katsu", "Pork Cutlet & Jumbo Shrimp Cutlet Combo", 2799],
          ["Cream Pasta with Donkatsu", "Cream pasta with pork cutlet", 2999],
          ["Rose Pasta with Donkatsu", "Creamy tomato sauce pasta with Pork Cutlet", 2999],
          ["Onion Wang Donkatsu", "Onion giant pork cutlet with savory sauce", 2599]
        ]
      },
      {
        name: "Appetizer",
        items: [
          ["Cajun Chicken Salad", "Crispy fried chicken over fresh greens", 1999],
          ["Chicken Caesar Salad", "Romaine lettuce with Caesar dressing", 1999],
          ["Cheese Potato Pancake", "Crispy potato pancake with melted cheese", 2399],
          ["Corn Cheese", "Sweet corn baked with mozzarella cheese", 1399],
          ["Olive Oil & Baguette (3pcs)", "", 1399],
          ["Garlic Bread", "Toasted bread with garlic butter", 899],
          ["Shrimp Gambas", "Sizzling shrimp in garlic & chili olive oil", 2599]
        ]
      },
      {
        name: "Pasta",
        items: [
          ["Tomato Meat Spaghetti", "Classic spaghetti with rich meat sauce", 2099],
          ["Cheesy Meat Spaghetti", "Meat spaghetti topped with melted cheese", 2399],
          ["Seafood Tomato Pasta", "Seafood pasta with savory tomato sauce", 2599],
          ["Shrimp Cream Pasta", "Shrimp pasta with velvety cream sauce", 2699],
          ["Shrimp Rose Pasta", "Shrimp pasta with blend of tomato and creamy sauce", 2699]
        ]
      },
      {
        name: "Side Dishes",
        items: [
          ["Cold Buckwheat Noodles", "Soba noodles served in a chilled soy-based broth", 2099],
          ["Spicy Cold Noodles", "Chewy noodles with spicy sauce and veggies", 2099],
          ["Fish Cake Udon", "Fish cake soup with Udon noodle", 2099],
          ["Shrimp Fried Rice Gratin", "", 2499],
          ["Omurice", "Fried rice wrapped in a soft omelet", 2199]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Soda", "", 300],
          ["Orange Juice", "", 400],
          ["Fiji Water", "", 400]
        ]
      },
      {
        name: "Extra",
        items: [
          ["Steamed Rice", "", 200],
          ["Extra Sauce", "", 300],
          ["Cabbage Salad", "", 400],
          ["Daily Soup", "", 400]
        ]
      }
    ],
    hours: "Mon–Thu 11am–2:30pm, 5–9pm; Fri–Sun 11am–9pm",
    phone: "(925) 248-8915",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their Uber Eats store (listed as Golden Wang Donkatsu, same 7222 Regional St address); hours from Google."
  },
  'grind-cafe-707': {
    sections: [
      {
        name: "Breakfast Burritos",
        items: [
          ["Super Bfast Burrito", "Bacon, sausage, potato, egg and cheese", 1600],
          ["Potato, Egg, Cheese Burrito", "Seasoned potatoes, eggs, shredded cheese, housemade salsa and sour cream", 1400],
          ["Bacon Burrito", "Bacon, potatoes, egg, cheese, housemade salsa and sour cream", 1500],
          ["Sausage Burrito", "Sausage, seasoned potatoes, egg, shredded cheese, housemade salsa, sour cream", 1500],
          ["Hot Link Burrito", "Sliced hot link, egg, shredded cheese, seasoned cubed potatoes, housemade salsa", 1700],
          ["Jalapeño Popper Burrito", "Bacon, sausage, potato, egg, cheese, jalapeños, cream cheese", 1600],
          ["Vegan Burrito", "Potato, spinach, avocado, tomato, salsa, vegan sausage", 1600],
          ["Veggie Burrito", "Potato, egg, cheese, spinach, salsa", 1500]
        ]
      },
      {
        name: "Breakfast Sandwiches",
        items: [
          ["Ham and Cheese Croissant", "Buttery croissant with sliced ham and cheddar cheese", 925],
          ["Sausage, Egg, Cheese Sandwich", "Pork sausage patty, egg, sliced cheese on a toasted English muffin", 750],
          ["Toasted Tomato Breakfast Sandwich", "Seasoned tomato, provolone, spinach, garlic butter on a croissant", 1050],
          ["Bacon, Egg, Cheese Croissant", "Hickory smoked bacon, egg, sliced cheddar on a buttered croissant", 900],
          ["Vegan Breakfast Sandwich", "Plant-based sausage, egg and cheese on an English muffin", 999],
          ["Egg, Cheese Muffin", "Garlic butter, pepper jack, English muffin", 650],
          ["Bacon, Egg, and Cheese Sandwich", "Bacon, egg and cheddar on a toasted English muffin", 750],
          ["Avocado Toast", "1 slice of multigrain bread toasted with avocado slices", 700],
          ["Hot Link Breakfast Croissant", "Sliced hot link, egg and cheese on a buttered toasted croissant", 1050]
        ]
      },
      {
        name: "Waffles",
        items: [
          ["Single Waffle", "1 Belgian waffle with syrup and butter", 799],
          ["Waffle Sandwich", "Bacon or sausage, 1 egg and cheese between 2 waffle halves", 1399],
          ["Waffle Plate", "1 waffle, 1 egg, choice of meat (2 pcs)", 1299]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["Ultimate BLT Croissant", "Garlic butter croissant with smoked bacon, lettuce, tomato, egg and avocado", 1299],
          ["Garlic Chicken Sandwich", "French roll, garlic butter, grilled chicken breast, mayo, pepper jack…", 1399],
          ["BLT Sandwich", "Hickory smoked bacon on multigrain toasted with light garlic butter", 1350],
          ["Turkey Cheddar Sandwich", "Sliced turkey, cheddar, lettuce, tomato, mayo, mustard", 1300],
          ["Veggie Sandwich", "Served cold. Romaine, cucumber, spinach, onion, tomato, avocado, pesto…", 999],
          ["Hot Link Sandwich", "Sliced all-beef hot links, cheddar, lettuce, tomato, mayo, mustard", 1399],
          ["Grilled Cheese Sandwich", "Melted cheddar on buttered toasted multigrain bread", 800],
          ["Chicken Philly Cheese Steak", "Seasoned grilled chicken breast, garlic butter French roll, provolone…", 1399],
          ["Philly Cheese Steak", "Seasoned beef on a garlic butter French roll with smoked provolone…", 1399]
        ]
      },
      {
        name: "Bagels",
        items: [
          ["Jalapeño Cheddar Bagel", "Toasted with cream cheese", 500],
          ["Pesto Bagel", "Pesto sauce, parmesan", 675],
          ["Everything Bagel", "Toasted with cream cheese", 500],
          ["Plain Bagel", "Toasted with cream cheese", 500],
          ["Cheddar Bagel", "Toasted with cream cheese", 500]
        ]
      },
      {
        name: "Salads",
        items: [
          ["The Grind House Salad", "Romaine, tomato, chicken, bacon bits, shredded cheese, hard boiled eggs…", 1499],
          ["Chicken Caesar Salad", "Romaine, chicken, parmesan, Caesar dressing", 1395]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Loaded Potatoes", "With cheese, sour cream and bacon", 899],
          ["Seasoned Cubed Potatoes", "", 500],
          ["Bacon", "", 250],
          ["Sausage", "", 200],
          ["Egg", "", 200],
          ["Butter Croissant", "", 300],
          ["Salsa", "", 50]
        ]
      },
      {
        name: "Pastries",
        items: [
          ["Chocolate Chip Cookie", "", 250],
          ["Biscotti", "", 250],
          ["Chocolate Chunk Muffin", "", 300],
          ["Banana Nut Muffin", "", 300],
          ["Cheese Streusel Muffin", "", 300],
          ["Blueberry Muffin", "", 300]
        ]
      },
      {
        name: "Coffee and Espresso",
        items: [
          ["Latte", "From", 450],
          ["Caramel Macchiato", "From", 550],
          ["White Mocha", "From", 475],
          ["Coffee", "From", 250],
          ["Mocha", "From", 500],
          ["Americano", "From", 450],
          ["Cappuccino", "From", 425],
          ["Cafe Au Lait", "From", 350],
          ["Triple", "", 350],
          ["Doppio", "", 275],
          ["Solo", "", 225],
          ["Nitro Cold Brew", "From", 650],
          ["Iced Coffee", "From", 400],
          ["Ube Latte", "From", 600],
          ["Biscoff Cookie Butter Latte", "From", 500]
        ]
      },
      {
        name: "Local Faves",
        items: [
          ["Lavender White Mocha", "From", 525],
          ["Pumpkin Spice Chai", "From", 550],
          ["Caramel Creme Brulee", "From", 575],
          ["Peppermint Mocha", "From", 525],
          ["Horchata Coffee", "From", 550]
        ]
      },
      {
        name: "Seasonal Drinks",
        items: [
          ["Vanilla Praline Latte", "Espresso and milk with vanilla and praline", 575],
          ["Strawberry Matcha", "Strawberry purée with slightly sweet green tea", 525],
          ["Salted Toffee Nut Latte", "Espresso, milk, toffee nut and salted caramel notes", 575],
          ["Ube Iced Coffee", "Ube flavor with your choice of milk", 600]
        ]
      },
      {
        name: "Teas and More",
        items: [
          ["Chai", "From", 475],
          ["Hot Chocolate", "From", 425],
          ["Lemonade", "From", 525],
          ["Hot Tea", "From", 325],
          ["Matcha Tea", "From", 500],
          ["Tea Latte", "From", 400],
          ["Tea Lemonade", "From", 495],
          ["Dubai Matcha", "Sweet matcha with pistachio syrup and chocolate drizzle", 600],
          ["Elderberry Syrup", "", 2000],
          ["Sea Moss 16oz", "", 3000]
        ]
      },
      {
        name: "Frozen Lemonade",
        items: [
          ["Strawberry Frozen Lemonade", "16oz or 24oz", 600],
          ["Mango Frozen Lemonade", "16oz or 24oz", 600],
          ["Green Apple Frozen Lemonade", "16oz or 24oz", 600],
          ["Piña Colada Frozen Lemonade", "16oz or 24oz", 600]
        ]
      },
      {
        name: "Blended Drinks",
        items: [
          ["Caramel Blended Drink", "From", 625],
          ["Strawberry Shortcake Blended Drink", "From", 699],
          ["Mocha Blended Drink", "From", 625],
          ["Oreo Blended Drink", "From", 699],
          ["Coffee Blended Drink", "From", 500],
          ["Vanilla Bean Blended", "From", 500],
          ["White Mocha Blended", "From", 625]
        ]
      },
      {
        name: "Snacks and Drinks",
        items: [
          ["Soda", "", 250],
          ["Water", "", 200],
          ["Chips", "", 200],
          ["Snapple", "", 250],
          ["Small Juice 10oz", "", 200],
          ["Hard Boiled Eggs", "", 50]
        ]
      }
    ],
    hours: "Mon–Fri 7am–2pm, Sat 8am–1pm; Closed Sun",
    orderUrl: "https://order.online/store/the-grind-cafe-922253",
    siteNote: "Menu and prices from their own online ordering page (linked from thegrindcafeorders.com); hours from Google, Yelp and MapQuest."
  },
  'gyro-king': {
    hours: "Mon–Fri 10:30am–7:45pm, Sat–Sun 10:45am–7:45pm",
    orderUrl: "https://direct.chownow.com/order/39990/locations/60764",
    siteNote: "Hours are the pickup & delivery hours on gyrokingca.com."
  },
  'handels-brentwood': {
    sections: [
      {
        name: "Cones and Dishes",
        items: [
          ["Small Dish", "", 600],
          ["Medium Dish", "", 700],
          ["Large Dish", "", 800]
        ]
      },
      {
        name: "Novelties",
        items: [
          ["4 Scoop Sampler", "Choose 4 flavors of their homemade ice cream", 800],
          ["Handel Pop", "A scoop of ice cream dipped in rich gourmet chocolate", 500],
          ["Ice Cream Sandwich", "", 500],
          ["Chocolate Covered Banana", "", 500]
        ]
      },
      {
        name: "Pints and More",
        items: [
          ["Pint", "", 900],
          ["Quart", "One flavor of homemade ice cream hand-packed in a quart", 1400]
        ]
      },
      {
        name: "Extras",
        items: [
          ["Extra Topping", "", 150],
          ["Extra Waffle Cone", "", 100],
          ["Extra Cake Cone", "", 50],
          ["Extra Sugar Cone", "", 50]
        ]
      }
    ],
    orderUrl: "https://order.online/store/handel-s-homemade-ice-cream-brentwood-42728995?pickup=true",
    siteNote: "Menu and prices from their own online ordering page (linked from handelsicecream.com); the online menu covers dishes, novelties and hand-packs, not every in-store item."
  },
  'handels-livermore': {
    sections: [
      {
        name: "Cones and Dishes",
        items: [
          ["Small Dish", "", 600],
          ["Medium Dish", "", 700],
          ["Large Dish", "", 800]
        ]
      },
      {
        name: "Hurricanes",
        items: [
          ["Small Hurricane", "Vanilla ice cream mixed with your choice of toppings", 800],
          ["Medium Hurricane", "Vanilla ice cream mixed with your choice of toppings", 900],
          ["Large Hurricane", "Vanilla ice cream mixed with your choice of toppings", 1000]
        ]
      },
      {
        name: "Novelties",
        items: [
          ["4 Scoop Sampler", "Choose 4 flavors of their homemade ice cream", 800],
          ["Handel Pop", "A scoop of ice cream dipped in rich gourmet chocolate", 500],
          ["Chocolate Covered Banana", "", 500],
          ["Ice Cream Sandwich", "", 500],
          ["Dog Treat", "A treat for your four-legged friend", 300]
        ]
      },
      {
        name: "Pints and More",
        items: [
          ["Pint", "", 900],
          ["Quart", "One flavor of homemade ice cream hand-packed in a quart", 1400],
          ["4 Pack Pint", "Choose 4 flavors, hand-packed pints", 3450]
        ]
      },
      {
        name: "Extras",
        items: [
          ["Extra Topping", "", 150],
          ["Extra Waffle Cone", "", 100],
          ["Extra Cake Cone", "", 50],
          ["Extra Sugar Cone", "", 50]
        ]
      }
    ],
    orderUrl: "https://order.online/store/handel-s-homemade-ice-cream-1st-st-48498588?pickup=true",
    siteNote: "Menu and prices from their own online ordering page (linked from handelsicecream.com); the online menu covers dishes, novelties and hand-packs, not every in-store item."
  },
  'handels-walnut-creek': {
    sections: [
      {
        name: "Cones and Dishes",
        items: [
          ["Small Dish", "", 600],
          ["Medium Dish", "", 700],
          ["Large Dish", "", 800]
        ]
      },
      {
        name: "Novelties",
        items: [
          ["4 Scoop Sampler", "Choose 4 flavors of their homemade ice cream", 800],
          ["Handel Pop", "A scoop of ice cream dipped in rich gourmet chocolate", 500],
          ["Chocolate Covered Banana", "", 500]
        ]
      },
      {
        name: "Pints and More",
        items: [
          ["Pint", "Choose from over 40 flavors of homemade ice cream", 900],
          ["Quart", "One flavor of homemade ice cream hand-packed in a quart", 1400]
        ]
      },
      {
        name: "Extras",
        items: [
          ["Extra Topping", "1 oz side container of topping", 150],
          ["Extra Waffle Cone", "", 100],
          ["Extra Cake Cone", "", 50],
          ["Extra Sugar Cone", "", 50]
        ]
      }
    ],
    orderUrl: "https://order.online/store/handel's-homemade-ice-cream-walnut-creek-28066905/?pickup=true",
    siteNote: "Menu and prices from their own online ordering page (linked from handelsicecream.com); the online menu covers dishes, novelties and hand-packs, not every in-store item."
  },
  'harborview-sf': {
    hours: "Tue–Fri 11:30am–2pm & 5–9pm, Sat–Sun 10:30am–2:30pm & 5–9pm; Closed Mon",
    siteNote: "Hours are from the Hours & Location page on harborviewsf.com."
  },
  'harumi-ayce': {
    hours: "Sun–Thu 11am–9:30pm, Fri–Sat 11am–10pm",
    siteNote: "Hours are from their Google Maps listing."
  },
  'havana-walnut-creek': {
    hours: "Mon 4–10pm, Tue–Thu 4–9pm, Fri 4–10pm, Sat 10am–10pm, Sun 10am–9pm (brunch Sat–Sun 10am–2:30pm)",
    orderUrl: "https://www.toasttab.com/havana-walnut-creek/v3",
    siteNote: "Hours are from the Hours & Location page on their own website."
  },
  'heads-and-tails-barbecue': {
    hours: "Mon–Wed 11:30am–9pm, Thu 11:30am–10pm, Fri 11:30am–12am, Sat 10am–12am, Sun 10am–9pm",
    siteNote: "Hours come from the All hours list on Heads & Tails' own website; the kitchen serves until 9pm daily."
  },
  'hey-yogurt': {
    hours: "Mon–Thu 12–9pm, Fri 12–10pm, Sat 11am–10pm, Sun 11am–9pm",
    siteNote: "Hours are from Google Maps, matching Yelp and MapQuest; their own site lists no hours."
  },
  'hinodeya-ramen-berkeley': {
    hours: "Daily 10am–10pm",
    siteNote: "Hours are from the Berkeley page on their own website."
  },
  'hironori-santa-clara': {
    hours: "Mon–Thu 11am–9pm, Fri–Sun 11am–10pm",
    siteNote: "Hours from Yelp and Foodle, which agree; their site lists none for Santa Clara."
  },
  'hl-peninsula-castro-valley': {
    sections: [
      {
        name: "Special Recommendation",
        items: [
          ["Four-Color Xiao Long Baos", "", 1110],
          ["Paper-Wrapped Savory Squab", "", 2200],
          ["Tianjin Twisted Sweet Sesame Dough", "", 1395],
          ["High Tower Fried Pancake", "", 810],
          ["Durian Mango Mochi", "", 910],
          ["Red Cherry Mountain Yam", "", 1495],
          ["Baked Wagyu Beef Tart w/ Cheese", "", 1110],
          ["Black Truffle Roasted Duck over Rice Noodles (Half)", "", 4600],
          ["Broiled Sticky Rice w/ Miso Wasabi Paste", "", 910],
          ["Pan-Seared Ginger Flavor Glutinous Cake", "", 710],
          ["Crispy Taro Cake w/ Pork", "", 810]
        ]
      },
      {
        name: "Steamer",
        items: [
          ["Shrimp Dumpling", "", 810],
          ["Pork & Crab Roe Siu Mai", "", 810],
          ["Pea Shoots & Seafood Dumpling", "", 910],
          ["Black Truffle Mushroom Dumpling", "", 810],
          ["Steamed Chive & Shrimp Dumpling", "", 810],
          ["Crab Meat & Shrimp Dumpling", "", 810],
          ["Shanghai Xiao Long Baos", "", 810],
          ["Chiu Chow Dumpling (w/ Peanut)", "", 710],
          ["Steamed BBQ Pork Baos", "", 580],
          ["Salted Egg Yolk Lava Black Buns", "", 810],
          ["Steamed Taro & Pork w/ Salty Egg Yolk", "", 810],
          ["Steamed Layer Cake w/ Salty Egg Yolk & Pumpkin", "", 910],
          ["Pork To-Fu Skin Wrap in Oyster Sauce", "", 710],
          ["Pork Spareribs in Black Bean Sauce", "", 810],
          ["Chicken Feet w/ Black Bean Sauce", "", 810],
          ["Sticky Rice in Lotus Leaf w/ Dried Scallop", "", 810],
          ["Steamed Beef Meat Balls", "", 710],
          ["Steamed Sponge Cake", "", 810],
          ["Pan-Seared Pork Bao", "", 810],
          ["Piggy Creamy Custard Bao", "", 810],
          ["Steamed Beef Tripes w/ Ginger & Scallion", "", 810],
          ["Steamed Fish Balls w/ Cilantro", "", 810],
          ["Steamed Honeycomb Tripes w/ Satay Sauce", "", 1010]
        ]
      },
      {
        name: "Street Favorite",
        items: [
          ["Fried Shrimp Rangoon", "", 910],
          ["Pan-Seared Turnip Cake", "", 710],
          ["Pan-Seared Water Chestnut Cake", "", 710],
          ["Fried Glutinous Dumpling w/ Pork", "", 580],
          ["Pan-Seared Chive & Shrimp Dumpling", "", 810],
          ["Potstickers", "", 710],
          ["Pan-Seared Seafood Seaweed Roll", "", 810],
          ["Fried Egg Yolk Lava Ball w/ Almond", "", 710],
          ["Green Tea & Mango Seared Crepe Roll", "", 810],
          ["Fried Vege. Egg Roll", "", 580],
          ["Fried Bean Curd Skin Roll w/ Shrimp", "", 810],
          ["Beef Offal Stew w/ Turnip", "", 1480],
          ["Pan-Seared Scallion Pancake", "", 710],
          ["Taro Puff", "", 710]
        ]
      },
      {
        name: "Bakery",
        items: [
          ["Baked Egg Yolk Lava Bao", "", 810],
          ["Pandan Flavor Custard Tart", "", 810],
          ["Durian Puff", "", 1110],
          ["Baked BBQ Pork Bao", "", 810],
          ["BBQ Pork Puff", "", 710],
          ["Portuguese Style Custard Tart", "", 810],
          ["Baked Creamy Custard Bao", "", 810]
        ]
      },
      {
        name: "Rice Noodle Rolls",
        items: [
          ["Crispy Wild Rice Noodle Rolls w/ Shrimp", "", 1010],
          ["Beef & Yellow Chive Rice Noodle Rolls", "", 1010],
          ["Shrimp Rice Noodle Rolls", "", 1010],
          ["BBQ Pork Rice Noodle Rolls", "", 1010],
          ["Cilantro Rice Noodle Rolls", "", 810],
          ["Fish & Crispy Donut Rice Noodle Rolls", "", 1010],
          ["Fish Fillet & Scallion Rice Noodle Rolls", "", 1010],
          ["Plain Rice Noodle Rolls", "", 810],
          ["Pork Liver Rice Noodle Rolls", "", 1010]
        ]
      },
      {
        name: "Roaster & Cold Plates",
        items: [
          ["Crispy Roasted Squab", "", 2200],
          ["House Special Crispy BBQ Pork", "", 2200],
          ["Chef Special Blackened BBQ Pork", "", 2800],
          ["Roasted Duck", "", 1395],
          ["Soya Marinated Garlic Pig Feet", "", 1395],
          ["Steamed Concubine Chicken", "", 1395],
          ["Soy Sauce Chicken", "", 1395],
          ["Marinated Duck Tongue", "", 1395],
          ["Roasted Pork Belly", "", 2000],
          ["Herbal Chicken Feet", "", 1395],
          ["Spiced Marinated Beef Shank", "", 1395],
          ["Chilled & Spicy Chicken Feet", "", 1395],
          ["Cucumber Salad Roll", "", 1010],
          ["Vinegrette Black Fungus Salad", "", 1010],
          ["Seaweed & Jellyfish", "", 1395],
          ["Chilled Vegetarian Bean Curd Skin Roll", "", 1395],
          ["Wasabi Chicken Salad", "", 1395],
          ["Soya To-Fu", "", 1010]
        ]
      },
      {
        name: "Congee",
        items: [
          ["Fresh Yam & Wolfberries Congee", "", 1495],
          ["Pork & Preserved Duck Egg Congee", "", 1495],
          ["Plain Congee w/ Dried Scallop", "", 1110],
          ["Crab Congee (Half)", "", 3800],
          ["Sea Cucumber & Pumpkin Millet Congee", "", 2800],
          ["Fish Fillet Congee", "", 2800],
          ["House Special Seafood & Chicken Congee", "", 3200],
          ["Giant Clam Congee", "", 3200],
          ["Pork Tripe & Liver Congee", "", 2600]
        ]
      },
      {
        name: "Seafood",
        items: [
          ["Sauteed Lobster Spicy Peninsula Style (w/ Peanut)", "", 4800],
          ["Fried Red Wine Marinated Oyster", "", 1390],
          ["Steamed Oyster in Black Bean Sauce (3)", "", 1390],
          ["Fried Mussels w/ Sriracha Mayo Dressing", "", 1110],
          ["Steamed Fish Fillet w/ Chili", "", 1800],
          ["Pan-Seared Peninsula Style Juicy Oyster & Pork Patty", "", 1395],
          ["Steamed Fish Head in Pepper Sauce", "", 1110],
          ["Seven Spices Fried Squid", "", 1110],
          ["Pan-Seared Shrimp w/ Supreme Soy Sauce", "", 1395],
          ["Steamed Giant Clam w/ Garlic", "", 1395],
          ["Pan-Seared Mackerel Fish", "", 1395]
        ]
      },
      {
        name: "Kitchen",
        items: [
          ["Sauteed Pork Liver w/ Ginger & Scallion", "", 1750],
          ["Pan-Seared Mushroom Stuffed w/ Taro", "", 1395],
          ["Beef Brisket w/ Turnip in Bouillon", "", 1750],
          ["Pan-Seared Lotus Root Cake", "", 1110],
          ["House Special Capelin (w/ Peanut)", "", 1395],
          ["Deep-Fried Shrimp Ball w/ Almond Slices", "", 1395],
          ["Pan-Seared Eggplant Stuffed w/ Shrimp Paste", "", 1395],
          ["Simmered Chicken w/ Chinese Herb Broth", "", 2600],
          ["Sauteed Turnip Cake in XO Sauce", "", 1395],
          ["Pea Sprout & To-Fu Skin in Broth", "", 1625],
          ["Chinese Broccoli w/ Oyster Sauce", "", 1395],
          ["Chinese Tender Green w/ Garlic", "", 1395],
          ["Trotter & Ginger in Sweetened Black Vinegar", "", 1550],
          ["Short Ribs w/ Teriyaki Sauce", "", 1380],
          ["Salt & Pepper Shrimp (w/ Shell)", "", 1395],
          ["General Tao's Chicken Wings", "", 1395],
          ["Soy Sauce Chow Mein", "", 1395],
          ["Poached Pork Liver w/ Scallion", "", 1695]
        ]
      },
      {
        name: "Rice & Noodle",
        items: [
          ["Sauteed Rice Noodle w/ Dungeness Crab (Half)", "", 3800],
          ["Sauteed Lobster w/ Sticky Rice & Pine Nut", "", 5800],
          ["Creamy Seafood & Dried Scallop Sauce over Fried Rice", "", 2900],
          ["Steamed Beef & Rice Noodles w/ Garlic Pickled Vege", "", 2500],
          ["Seafood & Seaweed Rice Gruel", "", 2600],
          ["Beef & Rice Noodles w/ Sha Cha Sauce", "", 2500],
          ["Sauteed Vermicelli w/ Minced Beef in XO Sauce", "", 2400],
          ["Salted Kumquat & Preserved Meat Fried Rice", "", 2500],
          ["Lingcod Fillet Vermicelli Soup w/ Cilantro & Preserved Egg", "", 2900],
          ["A4 Wagyu Beef Fried Rice w/ Lettuce & Ginger", "", 2900],
          ["House Pan-Seared Noodle w/ Abalone & Sea Cucumber", "", 3400],
          ["Beef Chow Fun Dry Style", "", 2400],
          ["Supreme Soy Sauce Lo Mein w/ Shallot", "", 2100],
          ["Steamed Spareribs over Rice Noodle", "", 2300],
          ["Golden Egg Fried Rice", "", 2300],
          ["Shanghai Style Sauteed E-Fu Noodle w/ Pork", "", 2300],
          ["Sizzling Clam Noodle w/ Crab Roe Paste", "", 2100],
          ["Abalone w/ E-Fu Noodle", "", 2800],
          ["Pan-Seared Rice Noodle w/ Giant Clam", "", 3200],
          ["Steamed Lobster in Garlic over Rice Noodle", "", 4800],
          ["Beef Chow Fun w/ Tomato & Egg", "", 2500],
          ["Diced Tender Green Chow Fun w/ Preserved Vege.", "", 2300],
          ["Braised Duck Rice Noodle Clay Pot", "", 4200],
          ["Beef Offal & Rice Noodles Clay Pot", "", 2900]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Peach Resin & Milk Sweet Soup", "", 910],
          ["Green Tea Mille Crepe Cake", "", 710],
          ["Basque Cheese Cake", "", 710],
          ["Multi-Layer Coffee Jelly", "", 710],
          ["Mango Piggy (or Rabbit) Pudding", "", 710],
          ["Mango Pomelo Sago", "", 710]
        ]
      }
    ],
    siteNote: "Menu and prices are from the dim sum menu pictures on their own site (hlpeninsula.com), read by eye.",
    pricesEstimated: "Prices were read from photos of their own menu; worth confirming with the shop."
  },
  'hl-peninsula-garden': {
    sections: [
      {
        name: "Steamer",
        items: [
          ["Steamed Shrimp Dumpling", "", 780],
          ["Supreme Abalone Siu Mai", "", 1380],
          ["Crab Roe Siu Mai", "", 680],
          ["Steamed Black Truffle Shrimp Dumpling", "", 780],
          ["Chiu Chow Dumpling (w/ Peanut)", "", 680],
          ["Steamed Shanghai Dumpling", "", 680],
          ["Steamed Barbecue Pork Buns", "", 680],
          ["Salted Egg Yolk Lava Black Buns", "", 780],
          ["Steamed Egg Custard Buns", "", 680],
          ["Steamed Sticky Rice in Lotus Leaf", "", 780],
          ["Black Bean Sauce Spareribs", "", 680],
          ["Steamed Chicken Feet in Black Bean Sauce", "", 780],
          ["Steamed Beef Meat Balls", "", 680],
          ["Steamed Beef Tripe w/ Ginger & Scallion", "", 780],
          ["Steamed Beancurd Skin Rolls w/ Pork", "", 780],
          ["Steamed Honey Comb Cake", "", 780],
          ["Steamed Sponge Cake", "", 680]
        ]
      },
      {
        name: "Street Favorite",
        items: [
          ["Fried Sticky Rice Pork Dumpling", "", 680],
          ["Crispy Taro Cake w/ Pork", "", 680],
          ["Pan Seared Scallion Pancake", "", 680],
          ["Fried Spring Rolls", "", 550],
          ["Pan Fried Water Chestnut Cake", "", 680],
          ["Deep Fried Pumpkin Balls", "", 550],
          ["Pan Fried Dumplings Filled w/ Chives & Shrimp", "", 980],
          ["Fried Dough Stick", "", 550],
          ["Beef Offal Stew w/ Turnip", "", 1428],
          ["Soy Sauce Chow Mein", "", 980],
          ["Duck Intestine w/ Soy", "", 1690],
          ["Poached Beef Tripes", "", 1328],
          ["Pork Tripe Simmered in Pepper & Pickled Vegetable Broth", "", 1328]
        ]
      },
      {
        name: "Bakery",
        items: [
          ["Portuguese Baked Custard Tarts", "", 680],
          ["Durian Puff", "", 880],
          ["Baked Korean Style Yam Buns", "", 780],
          ["Barbecue Pork Pastry", "", 680],
          ["Baked Barbecue Pork Bun", "", 680],
          ["Baked Mix Fruit & Cheese Buns", "", 680]
        ]
      },
      {
        name: "Rice Noodle Rolls",
        items: [
          ["Beef Offal Stew over Rice Noodle Rolls", "", 1128],
          ["Beef & Yellow Chive Rice Noodle Rolls", "", 780],
          ["Fish Fillet & Scallion Rice Noodle Rolls", "", 980],
          ["Plain Rice Noodle Rolls", "", 680],
          ["Shrimp Rice Noodle Rolls", "", 980],
          ["Cilantro Rice Noodle Rolls", "", 880],
          ["Pork Liver Rice Noodle Rolls", "", 980],
          ["Street Side Plain Rice Crepe Rolls", "Sauce contains peanut", 980],
          ["Crispy Donut Rice Noodle Rolls", "", 880]
        ]
      },
      {
        name: "Roaster & Cold Plates",
        items: [
          ["Crispy Roasted Squab", "", 2200],
          ["Roasted Duck", "", 1328],
          ["Roasted Pork Belly", "", 2200],
          ["Steamed Concubine Chicken", "", 1328],
          ["Soy Sauce Chicken", "", 1328],
          ["Sesame Chicken Salad", "", 1328],
          ["Marinated Duck Tongue", "", 1328],
          ["Chilled Vegetarian Bean Curd Skin Roll", "", 1328],
          ["Vinegrette Black Fungus Salad", "", 980],
          ["Soya To-Fu", "", 980],
          ["Spiced Marinated Beef Shank", "", 1328],
          ["Seaweed & Jellyfish", "", 1328],
          ["Chilled & Spicy Chicken Feet", "", 1328],
          ["Cucumber Salad Roll", "", 980]
        ]
      },
      {
        name: "Congee",
        items: [
          ["Crab Congee (Half)", "", 4200],
          ["House Special Chicken & Seafood Congee", "", 2800],
          ["Fresh Yam & Wolfberries Congee", "", 1328],
          ["Giant Clam Congee", "", 2800],
          ["Abalone & Chicken Congee", "", 2800],
          ["Plain Congee w/ Dried Scallop", "", 880],
          ["Preserved Egg & Pork Congee", "", 980],
          ["Salted Pork Bone & Watercress Congee", "", 2400],
          ["Street Favorite Pork Offal Congee", "", 2600],
          ["Fish Congee (w/ Bone)", "", 2800]
        ]
      },
      {
        name: "Special Recommendation",
        items: [
          ["Simmered Fish Curd & Red Clam w/ Watercress", "", 1688],
          ["Sauteed Beef Short Rib & Mushroom in Teriyaki Sauce", "", 1428],
          ["Steamed Fish Head in Yellow Pepper Sauce", "", 1328],
          ["Sauteed Pork Intestine w/ XO Black Bean Sauce", "", 1328],
          ["Chinese Tender Green w/ Garlic", "", 1128],
          ["Herbal Chicken Feet", "", 1328],
          ["XO Pan Seared Rice Crepe Roll", "", 1328],
          ["Chinese Broccoli w/ Oyster Sauce", "", 1428],
          ["Sauteed Turnip Cake w/ Salty Egg Yolk", "", 1328],
          ["Pan-Seared Cuttlefish Cake", "", 1328],
          ["Pork Liver Simmered w/ Watercress", "", 1328],
          ["Pan-Seared Chicken Wings, Honey Pepper Sauce", "", 1328],
          ["Pan Seared Daikon Cake w/ XO Sauce", "", 1328],
          ["Fried Pumpkin w/ Salty Egg Yolk", "", 1328],
          ["Pea Sprout & To-Fu Skin in Broth", "", 1328]
        ]
      },
      {
        name: "Seafood",
        items: [
          ["Broiled Mussels in Miso Wasabi Dressing", "", 1328],
          ["Sauteed Lobster Spicy Peninsula Style (w/ Peanut)", "", 4200],
          ["Fried Red Wine Marinated Oysters (3)", "", 1428],
          ["Steamed Oysters w/ Black Bean Sauce (3)", "", 1428],
          ["Seven Spices Fried Squid", "", 1328],
          ["Salt & Pepper Capelin", "", 1328],
          ["Pan-Seared Prawns w/ Soy", "", 1328],
          ["Steamed Giant Clam w/ Garlic", "", 1328],
          ["Crispy Fish Skin w/ Salty Egg Yolk", "", 1428],
          ["Sauteed Clams w/ Basil", "", 1428],
          ["Salt & Pepper Prawns", "", 1328],
          ["Lingcod (w/ Bone) Two Course (Chow Fun & Congee)", "", 5200]
        ]
      },
      {
        name: "Rice & Noodle",
        items: [
          ["Sauteed Rice Noodles w/ Crab (Half)", "", 3800],
          ["Duck Stew w/ Rice Noodle in Clay Pot", "", 3400],
          ["A4 Wagyu Beef Fried Rice", "", 2600],
          ["Black Truffle Seafood Fried Rice", "", 2200],
          ["Crispy Fish Skin Chow Fun w/ XO Sauce", "", 2000],
          ["Pan-Seared Noodle w/ Mixed Seafood", "", 2300],
          ["Abalone & Mushroom E-Fu Noodle", "", 2800],
          ["Steamed Rice Noodle w/ Black Bean Pork Spareribs", "", 2000],
          ["Steamed Rice Noodle w/ Giant Clam in Garlic", "", 2800],
          ["Diced Tender Green Chow Fun w/ Preserved Vege.", "", 1900],
          ["Pan-Seared Vermicelli w/ Bitter Melon & Fish Head in XO Sauce", "", 2800],
          ["Pan-Seared Noodle w/ Abalone & Sea Cucumber", "", 3200],
          ["House Special Stir-Fried Vermicelli Noodle", "", 2100],
          ["Beef Brisket & Turnip Rice Noodle Soup", "", 2800],
          ["Beef Chow Fun Dry Style", "", 2100],
          ["Roasted Duck Turnip Rice Noodle Soup", "", 2000],
          ["Tender Green & Shallot Lo Mein in Abalone Sauce", "", 2000],
          ["Dried Scallop & Egg White Fried Rice", "", 2200],
          ["Beef Chow Fun w/ Tomato & Egg", "", 2200],
          ["Beef Offal & Rice Noodles", "", 2000],
          ["Fish Maw & Wonton in Supreme Broth", "", 2200],
          ["Singapore Rice Noodles", "", 2100],
          ["Sea Urchin & Dried Scallop Fried Rice", "", 2200]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Osmanthus Longan Jelly", "", 680],
          ["Mango Mochi", "", 980],
          ["Mango Piggy Pudding", "", 680]
        ]
      }
    ],
    siteNote: "Menu and prices are from the dim sum menu pictures on their own site (hlpeninsula.com), read by eye.",
    pricesEstimated: "Prices were read from photos of their own menu; worth confirming with the shop."
  },
  'hl-peninsula-milpitas': {
    sections: [
      {
        name: "Special Recommendation",
        items: [
          ["Steamed Shrimp Dumpling in Ginseng Broth", "", 1025],
          ["Broiled Sticky Rice w/ Miso Wasabi Paste", "", 925],
          ["Pan-Seared Ginger Flavor Glutinous Cake", "", 725],
          ["Crispy Taro Cake w/ Pork", "", 825],
          ["Mango Piggy (or Rabbit) Pudding", "", 725],
          ["Lingcod (w/ Bone) Two Course (Chow Fun & Congee)", "", 5200]
        ]
      },
      {
        name: "Steamer",
        items: [
          ["Shrimp Dumpling", "", 825],
          ["Pork & Crab Roe Siu Mai", "", 825],
          ["Spinach & Shrimp Dumpling", "", 825],
          ["Steamed Chive & Shrimp Dumpling", "", 825],
          ["Crab Meat & Shrimp Dumpling", "", 825],
          ["Shanghai Xiao Long Baos", "", 825],
          ["Chiu Chow Dumpling (w/ Peanut)", "", 725],
          ["Steamed BBQ Pork Baos", "", 595],
          ["Salted Egg Yolk Lava Black Buns", "", 825],
          ["Pork To-Fu Skin Wrap in Oyster Sauce", "", 725],
          ["Pork Spareribs in Black Bean Sauce", "", 725],
          ["Chicken Feet w/ Black Bean Sauce", "", 725],
          ["Sticky Rice in Lotus Leaf w/ Dried Scallop", "", 825],
          ["Steamed Beef Meat Balls", "", 725],
          ["Steamed Sponge Cake", "", 825],
          ["Pan-Seared Pork Bao", "", 825],
          ["Piggy Creamy Custard Bao", "", 825],
          ["Steamed Beef Tripes w/ Ginger & Scallion", "", 825],
          ["Steamed Fish Balls w/ Cilantro", "", 825],
          ["Steamed Honeycomb Tripes w/ Curry Sauce", "", 825]
        ]
      },
      {
        name: "Street Favorite",
        items: [
          ["Fried Glutinous Dumpling w/ Pork", "", 595],
          ["Pan-Seared Turnip Cake", "", 725],
          ["Pan-Seared Water Chestnut Cake", "", 725],
          ["Fried Shrimp Rangoon", "", 825],
          ["Pan-Seared Chive & Shrimp Dumpling", "", 825],
          ["Pan-Seared Seafood Seaweed Roll", "", 825],
          ["Deep Fried Pumpkin Ball", "", 725],
          ["Fried Egg Yolk Lava Ball w/ Almond", "", 725],
          ["Charcoal Sweet Crepe Roll", "", 825],
          ["Fried Vege. Egg Roll", "", 595],
          ["Fried Bean Curd Skin Roll w/ Shrimp", "", 825],
          ["Beef Offal Stew w/ Turnip", "", 1380],
          ["Pan-Seared Scallion Pancake", "", 725],
          ["Taro Puff", "", 725]
        ]
      },
      {
        name: "Bakery",
        items: [
          ["Baked Egg Yolk Lava Bao", "", 825],
          ["Pandan Flavor Custard Tart", "", 825],
          ["Durian Puff", "", 1025],
          ["Baked BBQ Pork Bao", "", 825],
          ["BBQ Pork Puff", "", 725],
          ["Portuguese Style Custard Tart", "", 825],
          ["Baked Taro Bao", "", 825]
        ]
      },
      {
        name: "Rice Noodle Rolls",
        items: [
          ["Crispy Wild Rice Noodle Rolls w/ Shrimp", "", 1025],
          ["Beef & Bamboo Shoot Rice Noodle Roll", "", 1025],
          ["Plain Rice Noodle Rolls", "", 825],
          ["BBQ Pork Rice Noodle Rolls", "", 1025],
          ["Cilantro Rice Noodle Rolls", "", 825],
          ["Fish & Crispy Donut Rice Noodle Rolls", "", 1025],
          ["Fish Fillet & Scallion Rice Noodle Rolls", "", 1025],
          ["Shrimp Rice Noodle Rolls", "", 1025]
        ]
      },
      {
        name: "Roaster & Cold Plates",
        items: [
          ["Crispy Roasted Squab", "", 2200],
          ["House Special Crispy BBQ Pork", "", 2200],
          ["Chef Special Blackened BBQ Pork", "", 2800],
          ["Roasted Duck", "", 1395],
          ["Soya Marinated Garlic Pig Feet", "", 1395],
          ["Steamed Concubine Chicken", "", 1395],
          ["Soy Sauce Chicken", "", 1395],
          ["Marinated Duck Tongue", "", 1395],
          ["Roasted Pork Belly", "", 2000],
          ["Herbal Chicken Feet", "", 1395],
          ["Spiced Marinated Beef Shank", "", 1395],
          ["Chilled & Spicy Chicken Feet", "", 1395],
          ["Cucumber Salad Roll", "", 1025],
          ["Vinegrette Black Fungus Salad", "", 1025],
          ["Seaweed & Jellyfish", "", 1395],
          ["Chilled Vegetarian Bean Curd Skin Roll", "", 1395],
          ["Wasabi Chicken Salad", "", 1395],
          ["Soya To-Fu", "", 1025]
        ]
      },
      {
        name: "Congee",
        items: [
          ["Fresh Yam & Wolfberries Congee", "", 1395],
          ["Crab Congee (Half)", "", 3400],
          ["Sea Cucumber & Pumpkin Millet Congee", "", 2800],
          ["Pork & Preserved Duck Egg Congee", "", 1395],
          ["Fish Fillet Congee", "", 2800],
          ["Plain Congee w/ Dried Scallop", "", 925],
          ["House Special Seafood & Chicken Congee", "", 3200],
          ["Giant Clam Congee", "", 3200]
        ]
      },
      {
        name: "Seafood",
        items: [
          ["Sauteed Lobster Spicy Peninsula Style (w/ Peanut)", "", 4200],
          ["Fried Red Wine Marinated Oyster", "", 1390],
          ["Steamed Oyster in Black Bean Sauce (3)", "", 1390],
          ["Steamed Fish Fillet w/ Chili", "", 1800],
          ["Pan-Seared Mackerel Fish", "", 1125],
          ["Steamed Fish Head in Pepper Sauce", "", 1125],
          ["Pan-Seared Shrimp w/ Supreme Soy Sauce", "", 1125],
          ["Seven Spices Fried Squid", "", 1125],
          ["Sand Storm Clams", "", 1500],
          ["Steamed Giant Clam w/ Garlic", "", 1395]
        ]
      },
      {
        name: "Kitchen",
        items: [
          ["Short Ribs w/ Teriyaki Sauce", "", 1385],
          ["Sauteed Pork Intestine w/ XO Black Bean Sauce", "", 1395],
          ["Beef Brisket w/ Turnip in Bouillon", "", 1600],
          ["Pan-Seared Lotus Root Cake", "", 1125],
          ["House Special Capelin (w/ Peanut)", "", 1395],
          ["Deep-Fried Shrimp Ball w/ Almond Slices", "", 1395],
          ["Pan-Seared Eggplant Stuffed w/ Shrimp Paste", "", 1395],
          ["Soy Sauce Chow Mein", "", 1125],
          ["Sauteed Turnip Cake in XO Sauce", "", 1395],
          ["Chinese Broccoli w/ Oyster Sauce", "", 1125],
          ["Chinese Tender Green w/ Garlic", "", 1125],
          ["Sauteed Rice Noodle w/ Preserved Meat", "", 1395],
          ["Crispy Fish Skin in Salty Egg Yolk Sauce", "", 925],
          ["Salt & Pepper Shrimp (w/ Shell)", "", 1125],
          ["General Tao's Chicken Wings", "", 1395],
          ["Pea Sprout & To-Fu Skin in Broth", "", 1455],
          ["Fried Pumpkin w/ Salty Egg Yolk", "", 1395],
          ["Trotter & Ginger in Sweetened Black Vinegar", "", 1495],
          ["Salt & Pepper Chicken Cartilage", "", 1395]
        ]
      },
      {
        name: "Rice & Noodle",
        items: [
          ["Sauteed Rice Noodle w/ Dungeness Crab (Half)", "", 3800],
          ["Wild Grain Fried Rice w/ Seafood & Raisin", "", 2400],
          ["Beef Chow Fun Dry Style", "", 2300],
          ["Supreme Soy Sauce Lo Mein w/ Shallot", "", 2000],
          ["Golden Egg Fried Rice", "", 2200],
          ["Sauteed Vermicelli w/ Minced Beef in XO Sauce", "", 2300],
          ["Seaweed & Seafood Crispy Rice Gruel", "", 2400],
          ["Lingcod Fillet Vermicelli Soup w/ Cilantro & Preserved Egg", "", 2800],
          ["BBS Crab & Bitter Melon Pan-Seared Rice Noodle (Half)", "", 3800],
          ["Beef Chow Fun w/ Tomato & Egg", "", 2400],
          ["House Pan-Seared Noodle w/ Abalone & Sea Cucumber", "", 3200],
          ["Steamed Spareribs over Rice Noodle", "", 2100],
          ["Shanghai Style Sauteed E-Fu Noodle w/ Pork", "", 2200],
          ["Sizzling Clam Noodle w/ Crab Roe Paste", "", 2000],
          ["Abalone w/ E-Fu Noodle", "", 2600],
          ["Pan-Seared Rice Noodle w/ Giant Clam", "", 3200],
          ["Steamed Lobster in Garlic over Rice Noodle", "", 4200],
          ["Diced Tender Green Chow Fun w/ Preserved Vege.", "", 2100],
          ["Preserved Meat Golden Egg Fried Rice w/ Taro", "", 2200],
          ["Braised Duck Rice Noodle Clay Pot", "", 4200]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Peach Resin & Milk Sweet Soup", "", 925],
          ["Mango Pomelo Sago", "", 725],
          ["Osmanthus & Goji Berry Pudding", "", 595]
        ]
      }
    ],
    siteNote: "Menu and prices are from the dim sum menu pictures on their own site (hlpeninsula.com), read by eye.",
    pricesEstimated: "Prices were read from photos of their own menu; worth confirming with the shop."
  },
  'hl-peninsula-pearl': {
    sections: [
      {
        name: "Steamer",
        items: [
          ["Supreme Abalone Siu Mai", "", 1380],
          ["Steamed Shrimp Dumpling", "", 805],
          ["Siu Mai", "", 705],
          ["Steamed Black Truffle Shrimp Dumpling", "", 805],
          ["Steamed Dried Scallop & Shrimp w/ Vegetable Dumpling", "", 805],
          ["Steamed Shanghai Dumpling", "", 705],
          ["Steamed Shanghai Dumplings w/ Crab Meat", "", 805],
          ["Steamed Chiu Chow Dumpling", "", 705],
          ["Chun Shan Dumplings", "", 705],
          ["Steamed Barbecue Pork Buns", "", 705],
          ["Salted Egg Yolk Lava Black Buns", "", 805],
          ["Steamed Egg Custard Buns", "", 705],
          ["Steamed Red Date Paste Bun", "", 705],
          ["Steamed Walnut Paste Bun", "", 705],
          ["Simmer Bean Curd Skin Rolls", "", 1005],
          ["Steamed Sticky Rice in Lotus Leaf", "", 805],
          ["Steamed Chicken Feet in Black Bean Sauce", "", 705],
          ["Steamed Spare Ribs in Black Bean Sauce", "", 705],
          ["Steamed Beef Balls", "", 705],
          ["Beef Tripes in Ginger & Scallion Sauce", "", 805],
          ["Steamed Sponge Cake", "", 705],
          ["Steamed Honey Cake", "", 805]
        ]
      },
      {
        name: "Street Favorite",
        items: [
          ["Vegetable Egg Rolls", "", 705],
          ["Fried Sticky Rice Pork Dumpling", "", 705],
          ["Pan Fried Turnip Cake", "", 705],
          ["Pan Fried Water Chestnut Cake", "", 705],
          ["Green Tea & Mango Pancake", "", 905],
          ["Pan Seared Scallion Pancake", "", 705],
          ["Deep Fried Sesame Balls", "", 705],
          ["Braised Beef Offal", "", 1480],
          ["Pan Fried Dumplings Filled with Chives & Shrimp", "", 1005],
          ["Crispy Taro Cake w/ Pork", "", 705],
          ["Broiled Sticky Rice w/ Miso Wasabi Paste", "", 905],
          ["Pan Fried Pork Dumpling", "", 1105]
        ]
      },
      {
        name: "Bakery",
        items: [
          ["Barbecue Pork Pastry", "", 705],
          ["Portuguese Baked Custard Tarts", "", 805],
          ["Baked Barbecue Pork Bun", "", 705],
          ["Durian Puff", "", 905],
          ["Baked Korean Style Yam Buns", "", 805],
          ["Baked Mix Fruit & Cheese Buns", "", 705]
        ]
      },
      {
        name: "Rice Noodle Rolls",
        items: [
          ["Plain Rice Noodle Rolls", "", 705],
          ["Barbecue Pork Rice Noodle Rolls", "", 805],
          ["Crispy Wild Rice Shrimp Noodle Roll", "", 1005],
          ["Beef & Corn Rice Noodle Rolls", "", 805],
          ["Shrimp Rice Noodle Rolls", "", 905],
          ["Chinese Donut Rice Noodle Rolls", "", 805],
          ["Cilantro Rice Noodle Rolls", "", 705]
        ]
      },
      {
        name: "Roaster & Cold Plates",
        items: [
          ["Crispy Roasted Squab", "", 2200],
          ["House Special Crispy BBQ Pork", "", 3800],
          ["Roasted Duck", "", 1375],
          ["Steamed Concubine Chicken", "", 1375],
          ["Soy Sauce Chicken", "", 1375],
          ["Roasted Pork Belly", "", 2000],
          ["Spiced Marinated Beef Shank", "", 1375],
          ["Chilled & Spicy Chicken Feet", "", 1375],
          ["Cucumber Salad Roll", "", 1005],
          ["Vinegrette Black Fungus Salad", "", 1005],
          ["Seaweed & Jellyfish", "", 1375],
          ["Chilled Vegetarian Bean Curd Skin Roll", "", 1375],
          ["Sesame Chicken Salad", "", 1375],
          ["Soya To-Fu", "", 1005],
          ["Marinated Duck Tongue", "", 1380],
          ["Tasty Pig's Feet", "", 1375]
        ]
      },
      {
        name: "Congee",
        items: [
          ["Plain Rice Congee", "", 575],
          ["Beef & Lettuce Congee", "", 1005],
          ["Preserved Egg & Pork Congee", "", 1005],
          ["Pig Liver & Fresh Yam Congee", "", 1375],
          ["Sampan Congee", "", 1375],
          ["Fresh Scallop Congee", "", 1375],
          ["Ginkgo Nut & Dried Scallop Pork Congee", "", 1375],
          ["Chicken Combo Congee", "", 2800],
          ["Fresh Yam & Wolfberries Congee", "", 1105],
          ["Fish Fillet Congee", "", 1375],
          ["Salted Pork Rib Congee", "", 1375],
          ["Dungeness Crab (Half) Congee", "", 3800]
        ]
      },
      {
        name: "Kitchen",
        items: [
          ["Beef Brisket w/ Turnip in Bouillon", "", 1800],
          ["Salt & Pepper Capelin", "", 1375],
          ["Stuffed Lotus Patty in XO Chili Sauce", "", 1375],
          ["Garlic Okra", "", 1375],
          ["Herbal Chicken Feet", "", 1280],
          ["Baby Short Ribs in House Special Dressing", "", 1800],
          ["Steamed Oyster in Black Bean Sauce (3)", "", 1380],
          ["Saute Chinese Broccoli in Ginger Sauce", "", 1105],
          ["Soy Sauce Chow Mein", "", 1005],
          ["Fried Crispy Turnip Cake in XO Sauce", "", 1105],
          ["Malaysian Belacan Fried Rice Noodle", "", 1105],
          ["Salt & Pepper Fried Shrimp", "", 1105],
          ["Sauteed Pumpkin Stick w/ Salty Egg Yolk", "", 1375],
          ["Wonton & Chicken in Supreme Broth", "", 1800],
          ["Mixed Chili & Garlic Fried Chicken Wings", "", 1375],
          ["Pan Fried Fish Cake", "", 1375],
          ["Mandarin Chicken Wing", "", 1375],
          ["Pig Trotters in Ginger Vinegar", "", 1380]
        ]
      },
      {
        name: "Seafood",
        items: [
          ["Sauteed Lobster Spicy Peninsula Style (w/ Peanut)", "", 4200],
          ["Clams in Chinese Wine", "", 1280],
          ["Pan-Seared Mackerel Fish", "", 1375],
          ["Steamed Cod with Preserved Vegetable", "", 2680],
          ["Salt & Pepper Fried Calamari", "", 1375],
          ["Steamed Scallop with Rice Noodle", "", 2000],
          ["Steam Surf Clam with Vermicelli in Garlic Sauce", "Each", 1275]
        ]
      },
      {
        name: "Rice & Noodle",
        items: [
          ["Sauteed Rice Noodle w/ Dungeness Crab (Half)", "", 3800],
          ["H.L. House Special Fried Rice", "", 2600],
          ["Beef Chow Fun", "", 2300],
          ["Thai Style Fried Vermicelli", "", 2300],
          ["Duo Egg Fried Rice", "", 2300],
          ["Sea Urchin & Dried Scallop Fried Rice", "", 2500],
          ["Shallot & Green Onion Tossed Noodle", "", 1600],
          ["Tom Yum Seafood Combo Udon Soup", "", 2600],
          ["Black Bean Sauce Crab & Bitter Melon Pan-Seared Rice Noodle (Half)", "", 3800],
          ["House Pan-Seared Noodle w/ Abalone & Sea Cucumber", "", 3200],
          ["Fish Fillet Vermicelli Soup", "", 2800],
          ["Rice Noodles Claypot", "", 1375],
          ["Beef Brisket & Tendon Tossed Noodle", "", 2100],
          ["Roast Duck Noodle Soup", "", 1900],
          ["Braised Noodle with Clam Meat", "", 1800],
          ["Country Style Rice Noodle with Meat, Seafood & Vegetables", "", 2380],
          ["Beef Brisket & Tendon over Rice Noodles", "", 2000],
          ["Fried Udon w/ Black Pepper Beef", "", 2200],
          ["Tom Yum Goong Beef Pho", "", 2200],
          ["Dried Scallop & Egg White Fried Rice", "", 2300],
          ["Fu Jian Fried Rice", "", 2300],
          ["Seafood Fried Rice in Abalone Sauce", "", 2300],
          ["Flat Rice Noodles w/ Beef Stew in Beef Broth", "", 2800],
          ["Signature Fried Rice Noodle", "", 2380],
          ["Steamed Spareribs over Rice Noodles", "", 1800],
          ["Braised E-Fu Noodle & Eggplant w/ Garlic & Chili", "", 2100],
          ["Diced Chicken w/ Chinese Anchovies Fried Rice", "", 2300],
          ["Rice Noodles w/ Braised Duck & Dried Orange Peel", "", 3500],
          ["Assorted Seafood in Truffle Sauce Fried Rice", "", 2500]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Special Dessert w/ Chinese Herbs in Syrup", "", 705],
          ["Osmanthus Longan Jelly", "", 705],
          ["Peach Resin & Milk Sweet Soup", "", 805],
          ["Mango Piggy Pudding", "", 705],
          ["Coconut Milk Cake", "", 805],
          ["Mango Mochi", "", 1005]
        ]
      }
    ],
    siteNote: "Menu and prices are from the dim sum menu pictures on their own site (hlpeninsula.com), read by eye.",
    pricesEstimated: "Prices were read from photos of their own menu; worth confirming with the shop."
  },
  'hl-peninsula-south-sf': {
    sections: [
      {
        name: "Steamer",
        items: [
          ["Shrimp Dumpling", "", 805],
          ["Pork & Crab Roe Siu Mai", "", 805],
          ["Spinach & Shrimp Dumpling", "", 805],
          ["Sea Bass & Shrimp Dumpling", "", 805],
          ["Shanghai Xiao Long Baos", "", 805],
          ["Crab Meat & Shrimp Dumpling", "", 805],
          ["Chiu Chow Dumpling (w/ Peanut)", "", 705],
          ["Steamed BBQ Pork Baos", "", 705],
          ["Tangerine Salty Egg Yolk Lava Bao", "", 805],
          ["Pork To-Fu Skin Wrap in Oyster Sauce", "", 705],
          ["Pork Spareribs in Black Bean Sauce", "", 705],
          ["Chicken Feet w/ Black Bean Sauce", "", 705],
          ["Sticky Rice in Lotus Leaf w/ Dried Scallop", "", 805],
          ["Steamed Beef Meat Balls", "", 705],
          ["Steamed Sponge Cake", "", 805],
          ["Pan-Seared Pork Bao", "", 805],
          ["Piggy Creamy Custard Bao", "", 805],
          ["Steamed Beef Tripes w/ Ginger & Scallion", "", 805],
          ["Steamed Fish Balls w/ Cilantro", "", 805],
          ["Steamed Honeycomb Tripes w/ Curry Sauce", "", 805],
          ["Milky Mala Roll", "", 705]
        ]
      },
      {
        name: "Special Recommendation",
        items: [
          ["Seafood Chive Dumplings", "", 1005],
          ["Broiled Sticky Rice w/ Miso Wasabi Paste", "", 905],
          ["Mango Piggy / Rabbit Pudding", "", 705],
          ["Pan-Fried Taro Cake", "", 705]
        ]
      },
      {
        name: "Street Favorite",
        items: [
          ["Pan-Seared Water Chestnut Cake", "", 705],
          ["Pan-Seared Turnip Cake", "", 705],
          ["Fried Glutinous Dumpling w/ Pork", "", 575],
          ["Red Bean Paste Sesame Balls", "", 705],
          ["Charcoal Sweet Crepe Roll", "", 805],
          ["Fried Vege. Egg Roll", "", 575],
          ["Fried Bean Curd Skin Roll w/ Shrimp", "", 805],
          ["Taro Puff", "", 705],
          ["Pan-Seared Scallion Pancake", "", 705],
          ["Pan-Fried Sticky Rice Cake", "", 805],
          ["Beef Offal Stew w/ Turnip", "", 1395]
        ]
      },
      {
        name: "Bakery",
        items: [
          ["Baked Egg Yolk Lava Bao", "", 805],
          ["Pandan Flavor Custard Tart", "", 805],
          ["BBQ Pork Puff", "", 705],
          ["Baked BBQ Pork Bao", "", 805],
          ["Portuguese Style Custard Tart", "", 805],
          ["Baked Glutinous Bao", "", 805],
          ["Baked Rice Cake w/ Sweet Egg", "", 575],
          ["Durian Puff", "", 1005]
        ]
      },
      {
        name: "Rice Noodle Rolls",
        items: [
          ["Crispy Wild Rice Noodle Rolls w/ Shrimp", "", 1005],
          ["Beef & Bamboo Shoot Rice Noodle Roll", "", 1005],
          ["Plain Rice Noodle Rolls", "", 805],
          ["BBQ Pork Rice Noodle Rolls", "", 1005],
          ["Shrimp Rice Noodle Rolls", "", 1005],
          ["Fish & Crispy Donut Rice Noodle Rolls", "", 1005],
          ["Cilantro Rice Noodle Rolls", "", 805]
        ]
      },
      {
        name: "Roaster & Cold Plates",
        items: [
          ["Crispy Roasted Squab", "", 2200],
          ["House Special Crispy BBQ Pork", "", 2200],
          ["Roasted Suckling Pig Slices", "", 3200],
          ["Roasted Duck", "", 1375],
          ["Soya Marinated Garlic Pig Feet", "", 1375],
          ["Steamed Concubine Chicken", "", 1375],
          ["Soy Sauce Chicken", "", 1375],
          ["Marinated Duck Tongue", "", 1375],
          ["Roasted Pork Belly", "", 2000],
          ["Herbal Chicken Feet", "", 1375],
          ["Spiced Marinated Beef Shank", "", 1375],
          ["Chilled & Spicy Chicken Feet", "", 1375],
          ["Cucumber Salad Roll", "", 1375],
          ["Vinegrette Black Fungus Salad", "", 1005],
          ["Seaweed & Jellyfish", "", 1375],
          ["Chilled Vegetarian Bean Curd Skin Roll", "", 1375],
          ["Cilantro & To-Fu Skin Salad", "", 1375],
          ["Sesame Chicken Salad", "", 1375],
          ["Soya To-Fu", "", 1005]
        ]
      },
      {
        name: "Congee",
        items: [
          ["Fresh Yam & Wolfberries Congee", "", 1375],
          ["Crab Congee (Half)", "", 3800],
          ["Sea Cucumber & Pumpkin Millet Congee", "", 2600],
          ["Pork & Preserved Duck Egg Congee", "", 1105],
          ["Giant Clam Congee", "", 2800],
          ["Plain Congee w/ Dried Scallop", "", 905],
          ["Fish Fillet Congee", "", 2800]
        ]
      },
      {
        name: "Kitchen",
        items: [
          ["Short Ribs w/ Teriyaki Sauce", "", 1495],
          ["Sauteed Pork Intestine w/ XO Black Bean Sauce", "", 1375],
          ["Beef Brisket w/ Turnip in Bouillon", "", 1795],
          ["Pan-Seared Lotus Root Cake", "", 1105],
          ["Salt & Pepper Capelin", "", 1375],
          ["Deep-Fried Shrimp Ball w/ Almond Slices", "", 1375],
          ["Pan-Seared Eggplant Stuffed w/ Shrimp Paste", "", 1375],
          ["Taishan Style Chicken", "Chicken, chicken seeds, peanuts, fungus, enoki in Chinese wine soup", 1895],
          ["Sauteed Turnip Cake in XO Sauce", "", 1375],
          ["Chinese Broccoli w/ Oyster Sauce", "", 1105],
          ["Chinese Tender Green w/ Garlic", "", 1375],
          ["Sauteed Rice Noodle w/ Preserved Meat", "", 1375],
          ["Salt & Pepper Shrimp (w/ Shell)", "", 1375],
          ["General Tao's Chicken Wings", "", 1375],
          ["Sauteed Okra w/ Sambal Belacan Sauce", "", 1375],
          ["Pea Sprout & To-Fu Skin in Broth", "", 1375],
          ["Fried Pumpkin w/ Salty Egg Yolk", "", 1375],
          ["Soy Sauce Chow Mein", "", 1375],
          ["Poached Beef Tripes", "", 1375]
        ]
      },
      {
        name: "Seafood",
        items: [
          ["Sauteed Lobster Spicy Peninsula Style (w/ Peanut)", "", 4200],
          ["Fried Red Wine Marinated Oyster (3)", "", 1650],
          ["Steamed Oysters (3) w/ Black Bean Sauce", "", 1650],
          ["Steamed Fish Fillet w/ Chili", "", 1400]
        ]
      },
      {
        name: "Rice & Noodle",
        items: [
          ["Sauteed Rice Noodle w/ Dungeness Crab (Half)", "", 3800],
          ["Wild Grain Fried Rice w/ Seafood & Raisin", "", 2300],
          ["Beef Chow Fun Dry Style", "", 2100],
          ["Supreme Soy Sauce Lo Mein w/ Shallot", "", 1900],
          ["Golden Egg Fried Rice", "", 2000],
          ["Sauteed Vermicelli w/ Minced Beef in XO Sauce", "", 2200],
          ["Preserved Meat Golden Egg Fried Rice w/ Taro", "", 2000],
          ["Lingcod Fillet Vermicelli Soup w/ Cilantro & Preserved Egg", "", 2800],
          ["BBS Crab & Bitter Melon Pan-Seared Rice Noodle (Half)", "", 3800],
          ["Beef Chow Fun w/ Tomato & Egg", "", 2300],
          ["House Pan-Seared Noodle w/ Abalone & Sea Cucumber", "", 3200],
          ["Steamed Spareribs over Rice Flat Noodle", "", 1800],
          ["Pan-Seared Rice Noodle w/ Giant Clam", "", 2800],
          ["Seaweed & Seafood Crispy Rice Gruel", "", 2200],
          ["Shanghai Style Sauteed E-Fu Noodle w/ Pork", "", 1900],
          ["Steamed Lobster in Garlic over Rice Noodle", "", 4200],
          ["Sizzling Clam Noodle w/ Crab Roe Paste", "", 1900],
          ["Diced Tender Green Chow Fun w/ Preserved Vege.", "", 1900],
          ["Abalone w/ E-Fu Noodle", "", 2600]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Peach Resin & Milk Sweet Soup", "", 905],
          ["Sesame Roll", "", 805],
          ["Glutinous Rice Dumpling w/ Durian Filling", "", 1005],
          ["Mango Pomelo Sago", "", 705],
          ["Osmanthus & Goji Berry Pudding", "", 575]
        ]
      }
    ],
    siteNote: "Menu and prices are from the dim sum menu pictures on their own site (hlpeninsula.com), read by eye.",
    pricesEstimated: "Prices were read from photos of their own menu; worth confirming with the shop."
  },
  'holbrook-house': {
    hours: "Mon–Tue 8am–10pm, Wed–Fri 8am–11pm, Sat 4–10pm, Closed Sun",
    siteNote: "Hours are the regular operating hours on their own website's Hours page."
  },
  'house-of-raha': {
    sections: [
      {
        name: "Starters",
        items: [
          ["Samosa Chaat", "Crushed golden pastry with potato, chickpeas and mint yogurt", 1150],
          ["Dragon Chicken", "Crispy Indo-Chinese fried chicken in a sweet spicy chili garlic sauce", 2070],
          ["Dragon Paneer", "", 2070],
          ["Drums of Heaven", "Wok-fired chicken lollipops in mild chili-garlic soy glaze", 2070],
          ["Bulgogi Luchi", "Two Korean-spiced lamb tacos on Bengali fried bread with mayo", 1610],
          ["Dahi Puri", "", 1200]
        ]
      },
      {
        name: "Fried Chicken",
        items: [
          ["Indian (Chennai 65)", "South Indian-style halal fried chicken in tangy spices, with fiery tomato chutney", 1800],
          ["Japanese (Karaage)", "Golden fried chicken with mayo-citrus-soy dip", 1800],
          ["Korean (Yangnyeom)", "Double-fried chicken in gochujang glaze", 1800],
          ["Indonesian (Ayam Goreng)", "Ayam goreng-style chicken with sambal aioli", 1800]
        ]
      },
      {
        name: "Tandoor",
        items: [
          ["Tandoori Chicken", "Punjabi-style yogurt marinade, charcoal-roasted with lime", 1840],
          ["Malai Kebab", "Cream-marinated chicken with white pepper, smoke and subtle ginger", 1840],
          ["Coastal Jhinga", "Tandoor-roasted shrimp with lime, chili oil and Thai basil", 2070]
        ]
      },
      {
        name: "Mains",
        items: [
          ["Goat Dum Biryani", "Fragrant slow-cooked Dakhni-style biryani", 2530],
          ["Ember Chicken Biryani", "Saffron rice topped with tandoori chicken", 2300],
          ["Rogan Josh", "Mild Kashmiri goat curry with a rich, aromatic base", 2185],
          ["Butter Chicken", "Chicken in tomato-butter gravy and fenugreek", 2070],
          ["Butter Paneer", "Paneer in tomato-butter gravy and fenugreek", 1800],
          ["Kadai Murgh", "Chicken, bell peppers, onions & signature kadai masala", 1800],
          ["Kadai Paneer", "Paneer, bell peppers, onions & signature kadai masala", 1800],
          ["Chole Bhature", "Lahori chickpeas with fried bhatura, pickle and onions", 1840]
        ]
      },
      {
        name: "Rice & Noodles",
        items: [
          ["Miso Ramen", "Japanese chicken or vegetable broth, springy noodles and toppings", 1840],
          ["Hakka Noodles", "Indo-Chinese stir-fried noodles with vegetables, garlic and soy; add egg or chicken", 1840],
          ["Fried Rice", "Wok-tossed rice with mixed vegetables; add egg or chicken", 1200],
          ["Veg Biryani", "Dum biryani with a medley of vegetables", 1840],
          ["Steamed White Rice", "Steamed basmati rice", 460],
          ["Jeera Rice", "Cumin-flavored basmati rice", 690]
        ]
      },
      {
        name: "Bread",
        items: [
          ["Plain Naan", "", 345],
          ["Butter Naan", "", 460],
          ["Garlic-Butter Naan", "", 575],
          ["Bullet Naan", "Naan topped with spicy chilies and cilantro", 575],
          ["Laccha Paratha", "Pull-apart flaky flatbread with layers of ghee", 805]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Noor-e-Jamun", "Gulab jamun folded into custard and toasted almonds", 1150],
          ["Gul Paan", "Rasmalai steeped in rose and betel leaf, with pistachio dust", 1150]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Kokumi", "", 1150],
          ["Nectar", "Muddled peach, basil, lemon with a gentle fizz", 1150],
          ["Blush", "Strawberry, rose, citrus, grenadine and a soft ginger sparkle", 1150],
          ["PinaFresca", "Tropical pineapple-coconut blend with lime", 1150],
          ["Monsoon", "Mango, lemon, mint and seltzer", 1150],
          ["Mango Lassi", "", 1000],
          ["Soda", "Plain or lightly spiced", 345],
          ["Bottled Water", "", 230]
        ]
      },
      {
        name: "Lunch Special (11am–3pm)",
        items: [
          ["Combo Meal", "From: 1 main with 1 or 2 sides; veg and non-veg choices", 1380]
        ]
      },
      {
        name: "Group Specials",
        items: [
          ["Veg Fried Rice – Family Pack", "", 2530],
          ["Veg Dum Biryani – Family Pack", "", 3450],
          ["Hakka Noodles – Family Pack", "", 3450],
          ["Ember Chicken Biryani – Family Pack", "", 3910],
          ["Goat Dum Biryani – Family Pack", "", 4140]
        ]
      }
    ],
    hours: "Mon–Thu 11:30am–3pm & 5:30–10pm, Fri–Sat 11:30am–10:30pm, Sun 11:30am–10pm",
    phone: "(510) 771-9747",
    siteNote: "Menu (their Toast menu, last updated Sep 13, 2026), hours and phone are from their OpenTable page."
  },
  'house-of-wings': {
    sections: [
      {
        name: "Bone-In Wings",
        items: [
          ["5 Pieces Bone-In Wings", "", 1099],
          ["10 Pieces Bone-In Wings", "", 1999],
          ["20 Pieces Bone-In Wings", "", 3899],
          ["50 Pieces Bone-In Wings", "", 9299]
        ]
      },
      {
        name: "Bone Out Wings",
        items: [
          ["5 Pieces Bone Out Wings", "", 999],
          ["10 Pieces Bone Out Wings", "", 1799],
          ["20 Pieces Bone Out Wings", "", 3299],
          ["50 Pieces Bone Out Wings", "", 7499]
        ]
      },
      {
        name: "Tenders",
        items: [
          ["3 Pieces Tenders", "", 999],
          ["5 Pieces Tenders", "", 1699],
          ["10 Pieces Tenders", "", 2999]
        ]
      },
      {
        name: "Smash Burgers",
        items: [
          ["Single Patty Burger", "Cheese, lettuce, tomato, grilled onions, pickles and house sauce.", 899],
          ["Double Patty Burger", "Cheese, lettuce, tomato, grilled onions, pickles and house sauce.", 1199],
          ["The Spicy Smash", "Cheese, lettuce, tomato, grilled onions, pickles, jalapeños and spicy house sauce.", 999],
          ["Mac Burger", "Signature smash burger topped with a cheesy scoop of mac and cheese.", 1099]
        ]
      },
      {
        name: "Chicken Sandwiches",
        items: [
          ["Harissa Hot Honey Chicken Sandwich", "Spicy. Lettuce, pickles and drizzled with harissa hot honey.", 899],
          ["Buffalo Chicken Sandwich", "Chicken in mild Buffalo sauce with lettuce, tomato, and pickles.", 899],
          ["Build Your Own Sandwich", "", 899],
          ["Snack Wraps (2 wraps)", "Crispy tenders on warm tortillas with lettuce, cheddar and house sauce.", 1199]
        ]
      },
      {
        name: "Texas Toast Grilled Cheese Melts",
        items: [
          ["Chop Cheese Melt", "Mild. Grilled onions, lettuce, tomato, pickles and house sauce.", 1299],
          ["Crispy Buffalo Chicken Melt", "Chopped chicken in mild Buffalo sauce, topped with mozzarella.", 1299],
          ["Build Your Own Melt", "Chopped chicken in your choice of sauce with mozzarella and pickles.", 1299],
          ["Philly Cheese Melt", "Mozzarella cheese, grilled onions, peppers and mayo.", 1399],
          ["Grilled Cheeseburger (Double Patty)", "Mild. L&T, grilled onions, pickles and house sauce.", 1299]
        ]
      },
      {
        name: "Loaded Waffle Bowls",
        items: [
          ["Loaded Mac & Cheese", "Mac and cheese topped with chopped chicken tenders and house sauce.", 1199],
          ["Steak Mac & Cheese", "Mac and cheese topped with chopped steak and spicy house sauce.", 1199],
          ["Chop Cheese Mac & Cheese Bowl", "", 1199],
          ["Chop Cheese Bowl", "Mild. Chopped ground beef over waffle fries with lettuce, pickles and house sauce.", 1599],
          ["Garlic Parm Bowl", "Waffle fries topped with diced chicken tenders and sauce.", 1599],
          ["Thai Chili Bowl", "Waffle fries topped with diced chicken tenders and sauce.", 1599],
          ["Buffalo Bowl", "Waffle fries topped with diced chicken tenders and sauce.", 1599],
          ["BBQ Ranch Bowl", "Waffle fries topped with diced chicken tenders and sauce.", 1599],
          ["Build Your Own Bowl", "Waffle fries topped with diced chicken tenders and your sauce.", 1599]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Straight Cut Fries", "", 599],
          ["Waffle Fries", "", 599],
          ["Cajun Fries", "", 700],
          ["Lemon Pepper Fries", "", 700],
          ["Sweet Potato Fries", "", 700],
          ["Cheese Fries", "", 799],
          ["Bacon Cheese Fries", "", 1099],
          ["Bacon Cheese Waffle Fries", "", 1099],
          ["Mac and Cheese", "", 699],
          ["Mozzarella Sticks", "", 700],
          ["Onion Rings", "", 700],
          ["Jalapeño Poppers", "", 700]
        ]
      },
      {
        name: "Lov'n the Crew",
        items: [
          ["Fry Boxes", "", 2900],
          ["40 Bone-In Wings (Choice of 2 Flavors)", "", 6999],
          ["50 Boneless Wings (Choice of 2 Flavors)", "", 6999],
          ["Burger Box", "12 burgers or chicken sandwiches.", 8900],
          ["Half Crew Box", "4 burgers, 4 chicken sandwiches, 5 tenders, fries, 5 drinks.", 8999]
        ]
      },
      {
        name: "Sweet Tooth!",
        items: [
          ["Vanilla Milkshake", "", 699],
          ["Chocolate Milkshake", "", 699],
          ["Oreo Milkshake", "", 799],
          ["Rainbow Ridge Milkshake", "", 799],
          ["Cinnamon Toast Crunch Milkshake", "", 799],
          ["Brooklyn Blackout Milkshake", "", 799],
          ["No Cap'n Crunch Milkshake", "", 799],
          ["Peanut Buttaa Lovaa", "Peanut butter shake with vanilla ice cream and mixed nuts.", 799],
          ["Fried Oreos", "", 599]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Mango Lemonade Refresher", "", 399],
          ["Berry Lemonade Refresher", "", 399],
          ["Canned Soda", "", 249],
          ["Fountain Drink", "", 350],
          ["Bottled Water", "", 249]
        ]
      },
      {
        name: "Extra Sauce",
        items: [
          ["Ranch", "", 200],
          ["Mild", "", 200],
          ["Medium", "", 200],
          ["Hot", "", 200],
          ["Burn!", "", 200],
          ["Thai Chili", "", 200],
          ["Cajun", "", 200],
          ["Mango Habanero", "", 200],
          ["Honey Garlic", "", 200],
          ["Hot Honey Cup", "", 200]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/california-house-of-wings-pittsburg-42781963/106468546/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their DoorDash store (California House of Wings, 2941 Harbor St, Pittsburg)."
  },
  'hwanyeong': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Gochujang Honey Wings", "Chicken wings glazed in spicy gochujang honey sauce with sesame and green onion", 1725],
          ["Garlic Wings", "Crispy wings tossed in garlic with sliced onions and green peppers", 1725],
          ["Sauteed Rice Cake in Spicy Sauce (Dduk Bok Gi)", "", 1840],
          ["Kimchi Pancake (Kimchi Jeon)", "", 1610],
          ["Corn Cheese", "Melted cheese with sweet corn and green onions", 1840],
          ["Deep Fried Dumplings (Man-doo)", "Crispy dumplings filled with seasoned meat and vegetables", 1380],
          ["Deep Fried Oyster (Gul Jeon)", "Battered oysters with a creamy dipping sauce", 1840],
          ["Fried Seafood Imperial Roll", "Crab, shrimp, taro, onion, wood ear mushroom and bean thread noodle", 1380],
          ["Oyster Pancake", "Crispy oyster pancake with scallions and dipping sauce", 1840],
          ["Seasoned Fried Calamari (Ojingeo Bokkeum)", "Fried calamari with sautéed onions, bell peppers and garlic", 1840],
          ["Grilled Oyster (Gulgui)", "", 1840],
          ["Beef Tartare (Yukhoe)", "Chopped raw beef with quail egg yolk, sesame and green onions", 2300],
          ["Grilled Mussels (Gunn Honghab)", "", 1840],
          ["Seafood Rice Cake in Spicy Sauce (Haemul Dduk Bok Gi)", "", 2300]
        ]
      },
      {
        name: "Soup",
        items: [
          ["Seafood Tofu Soup (Haemul Jjigae)", "Mussels, shrimp, squid, tofu, enoki and scallions in savory broth", 2990],
          ["Hen Stew with Ginseng (Samgye Tang)", "Hen simmered with ginseng, jujubes, garlic and rice", 3450],
          ["Pollock Roe Kimchi Soup (Al Tang)", "Pollock roe and kimchi with enoki and green onions", 2300],
          ["Kimchi Tofu Stew", "Spicy stew with kimchi, tofu, green onions and enoki", 2300],
          ["Dumpling & Rice Cake Soup (Tteok Mandu Guk)", "Dumplings, rice cakes, beef, seaweed and egg strips in savory broth", 2300]
        ]
      },
      {
        name: "Bibimbap (Regular or Hot Stone)",
        items: [
          ["Bibimbap Chicken", "Rice, vegetables, chicken, egg", 2530],
          ["Bibimbap Tofu", "Rice topped with tofu, mixed vegetables and spicy sauce", 2185],
          ["Bibimbap Tenderloin", "Tenderloin strips over vegetables and rice", 3220],
          ["Bibimbap Pork", "Pork with mixed vegetables, rice and egg", 2300],
          ["Bibimbap Bulgogi", "Marinated beef, vegetables and fried egg over rice", 2530],
          ["Bibimbap Seafood", "Assorted seafood and vegetables over rice", 2990]
        ]
      },
      {
        name: "House BBQ",
        items: [
          ["BBQ Pork (Dae Ji Bulgogi)", "Marinated pork slices with green onions and sesame", 2760],
          ["Tenderloin on Skillet (Anshim Bokkeum)", "Tenderloin stir-fried with onions", 3450],
          ["BBQ Chicken (Dak Gui)", "Grilled marinated chicken with sesame and green onions", 2760],
          ["BBQ Short Rib (Galbi)", "Short ribs with sesame and green onions on sliced onions", 3680],
          ["BBQ Beef (Bulgogi)", "Thinly sliced marinated beef, grilled", 3220]
        ]
      },
      {
        name: "House Special",
        items: [
          ["Cheesy Katsu Curry", "Breaded cutlet with melted cheese and Japanese curry sauce", 2875],
          ["Korean Steamed Pork (Bossam)", "Steamed pork with cabbage wraps, kimchi and spicy radish salad", 3220],
          ["Spicy Marinated Raw Crab (Gejang)", "", 3220],
          ["Braised Short Rib (Galbi Jjim)", "Short ribs braised in spicy sauce with carrots, potatoes, radish and rice cake", 5175],
          ["Hambagu", "Hamburger steaks with savory sauce", 2875],
          ["Korean Pork Bone Soup (Gamjatang)", "Spicy pork neck bone soup with potatoes and perilla leaves", 2760],
          ["Pan Fried Salmon in Creamy Sauce", "", 3220],
          ["Sauteed Seafood & Veggies (Sae Woo Bok Um)", "Sautéed seafood and vegetables topped with a fried egg", 2990],
          ["Pan Broiled Pork Belly Kimchi with Tofu", "", 2530],
          ["Sizzling Stone Bowl", "", 2530],
          ["Sauteed Squid & Veggies (Oh Jing Uh Bok Um)", "", 2760],
          ["Omurice with Rib-eye Steak", "Omelette over kimchi fried rice with rib-eye slices", 3680],
          ["Pan Fried Mackerel", "Salted mackerel fillet", 2300]
        ]
      },
      {
        name: "Noodles",
        items: [
          ["Noodles in Black Bean Sauce (Jajangmyeon)", "Wheat noodles with black bean sauce, pork and vegetables", 2300],
          ["Galbitang Short Rib Noodle Soup", "Rich broth with oxtail, sliced beef, green onions and egg", 3450],
          ["Stir Fried Ramyeon", "Bulgogi, seafood, tofu or no meat", 2760],
          ["Chicken Noodle Soup (Dak Ramyeon)", "Chicken, noodles, enoki, egg, green onions and crispy garlic", 2300],
          ["Korean Instant Noodle Soup (Ramyeon)", "", 2990],
          ["Japchae", "Sweet potato noodles with bulgogi, seafood, tofu or no meat", 2760],
          ["Spicy Cold Noodles", "", 2300]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Kimchi Fried Rice", "Topped with a fried egg", 1380],
          ["Side Fries", "", 690],
          ["Side Rice", "", 460],
          ["Side Lettuce", "", 345],
          ["Side Broth", "", 345],
          ["Side Fried Egg", "", 288]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Croffle", "From. Croissant-waffle with toppings like Biscoff", 700]
        ]
      },
      {
        name: "Specialty Drinks",
        items: [
          ["Lychee Oolong", "Oolong tea with lychee", 748],
          ["Tropical Fruits Tea", "", 748],
          ["Brown Sugar Boba Milk Latte", "", 748],
          ["H-Y Thai Milk Tea", "", 690],
          ["H-Y Peach Tea", "", 748],
          ["Coconut Matcha", "Matcha with coconut milk", 748],
          ["Hibiscus Strawberry Milk Bar", "", 748],
          ["Mango or Strawberry Matcha Latte", "", 748],
          ["Coconut Coffee", "", 748],
          ["Biscoff Coffee Latte", "", 748],
          ["Coffee Latte", "", 748],
          ["Mango or Strawberry Chocolate Latte", "", 748],
          ["Tea with Foam", "Crème brûlée, salted cheese and other foams", 748],
          ["Matcha Latte", "", 748],
          ["Coffee Float", "Coffee with tea foam topping", 805],
          ["Dalgona Coffee", "", 748],
          ["Sesame Latte", "", 748],
          ["Kumquat Tea", "", 690],
          ["Lemonade", "", 690],
          ["Tea", "", 575],
          ["Milk Tea", "Choice of almond, house cream or oat milk", 690]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["Coconut Smoothie", "", 690],
          ["Avocado Smoothie", "", 805],
          ["Mangonada Smoothie", "Mango with chamoy", 805],
          ["Strawberry-Banana Smoothie", "", 805],
          ["Lychee Smoothie", "", 690],
          ["Matcha Smoothie", "", 690],
          ["Mocha Smoothie", "", 690],
          ["Honeydew Smoothie", "", 690],
          ["Kiwi Smoothie", "", 690],
          ["Passion Fruit Smoothie", "", 690],
          ["Piña Colada Smoothie", "", 805],
          ["Pineapple Smoothie", "", 690],
          ["Taro Smoothie", "", 690],
          ["Taro-reo Smoothie", "Taro blended with Oreo", 805],
          ["Oreo Smoothie", "", 805],
          ["Mango Smoothie", "", 690],
          ["Strawberry Smoothie", "", 690]
        ]
      },
      {
        name: "H-Y Sodas",
        items: [
          ["Lychee Soda", "", 690],
          ["Honeydew Soda", "", 690],
          ["Passion Fruit Soda", "", 690],
          ["Pineapple Soda", "", 690],
          ["Kiwi Soda", "", 690],
          ["Mango Soda", "", 690],
          ["Strawberry Soda", "", 690]
        ]
      },
      {
        name: "Beverages",
        items: [
          ["Hot Tea Pot", "", 460],
          ["Soda (Coke, Diet Coke, Sprite, Dr Pepper, Root Beer, Orange, Ginger Ale)", "", 288],
          ["Sparkling Water", "", 288]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/35213369/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu and prices come from HwanYeong's DoorDash store at 41 Sand Creek Rd Ste C, Brentwood; their own site hwanyeong.co blocked access."
  },
  'intl-kitchen': {
    hours: "Daily 11am–11pm",
    phone: "(408) 248-8868",
    address: "344 S Main St, Milpitas, CA 95035",
    orderUrl: "https://intlkitchen.com/order",
    siteNote: "Hours, phone and address are from their own website (intlkitchen.com)."
  },
  'johns-ice-cream': {
    sections: [
      {
        name: "Ice Cream",
        items: [
          ["Double Scoop", "Choose two flavors", 800],
          ["Triple Scoop", "Choose up to three flavors", 1000]
        ]
      },
      {
        name: "Sundaes and Splits",
        items: [
          ["3 Scoop Sundae", "", 1200],
          ["Brownie Sundae", "Warm brownie base topped with your choice of two ice cream flavors", 1000],
          ["Banana Split", "", 1200]
        ]
      },
      {
        name: "Shakes",
        items: [
          ["Medium Shake", "", 1000],
          ["Large Shake", "", 1200]
        ]
      },
      {
        name: "Hand Packs",
        items: [
          ["Medium Hand Pack", "", 1400]
        ]
      },
      {
        name: "Cones",
        items: [
          ["Regular Cone", "", 100],
          ["Sugar Cone", "", 100],
          ["Waffle Cone", "", 200],
          ["Waffle Cone Dipped in Chocolate", "", 250],
          ["Waffle Cone Dipped in Chocolate w/ Sprinkles", "", 300],
          ["Waffle Cup", "", 200],
          ["Waffle Cup Dipped in Chocolate", "", 250],
          ["Waffle Cup Dipped in Chocolate w/ Sprinkles", "", 300]
        ]
      }
    ],
    hours: "Daily 12–10pm",
    orderUrl: "https://order.online/store/john's-ice-cream-brentwood-23916540",
    siteNote: "Menu and prices from their own online ordering page; hours from Google and johnsicecream.shop."
  },
  'jojos-hot-chicken': {
    hours: "Mon–Thu 11am–11pm, Fri–Sat 11am–11:45pm, Sun 11am–8pm",
    siteNote: "Hours are from the Branham location listing on their own site (jojoshotchicken.com/visit-us)."
  },
  'jolly-cafe': {
    sections: [
      {
        name: "Roasted Black Sesame",
        items: [
          ["Black Sesame Latte", "Fresh milk topped with creamy black sesame foam. Nutty, smooth, and caffeine-free, with your choice of milk.", 845],
          ["Black Sesame Hojicha", "Roasted hojicha blended with your choice of milk and topped with creamy black sesame foam. Toasty, nutty…", 845],
          ["Black sesame matcha", "Ceremonial-grade matcha layered with your choice of milk and topped with creamy black sesame foam. Rich…", 899],
          ["Black sesame coffee", "Strong Vietnamese coffee topped with creamy black sesame foam. Bold, rich, and nutty with a smooth, toasty…", 845]
        ]
      },
      {
        name: "Croffles (Waffle + Croffle)",
        items: [
          ["Milo Croffle", "Creamy whipped topping drizzled with chocolate sauce and dusted with Milo powder on a croffle base.", 774],
          ["Banana Nutella Croffle", "Crispy waffle topped with sliced bananas, drizzled Nutella, and whipped cream.", 774],
          ["Biscoff Croffle", "Crispy croissant-waffle hybrid topped with crumbled Biscoff cookies, drizzled with caramel and white…", 774],
          ["Mango Croffle", "Crispy croissant waffle topped with whipped cream and diced mango, drizzled with mango sauce.", 774],
          ["Matcha Croffle", "A croissant-waffle hybrid topped with matcha powder and accompanied by a creamy matcha spread.", 774],
          ["Oreo Croffle", "A crispy waffle topped with whipped cream and crushed chocolate sandwich cookies.", 774],
          ["Brown Sugar Boba Croffle", "Crispy croissant waffle topped with creamy sauce and chewy brown sugar boba pearls.", 774],
          ["Plain Croffle", "", 650],
          ["Ube Taro Croffle", "Whipped cream with a scoop of homemade taro, complemented by a side of ube foam.", 774]
        ]
      },
      {
        name: "Jolly's Signature",
        items: [
          ["NEW ITEM JS6. Mango Coco Breeze", "Fresh mango jasmine slushy, mango jelly, and crystal boba in a refreshing, tropical blend of coconut…", 956],
          ["JS5. Jasmine coco matcha cloud", "Infused jasmine green tea base and fresh coconut water meets ceremonial Japanese matcha foam — floral…", 845],
          ["JS4. Fresh taro milk tea", "Our house-made real taro paste — nutty, creamy, and irresistibly chewy like mochi — swirled into bold milk…", 878],
          ["Coco Longan Refresher", "Coconut water infused with pandan and longan jam, aloe vera and chia seed included", 845],
          ["JS2. Milo cocoa lava ( Milo dầm )", "Chunky, crushed Milo over rich cocoa milk, serves with home made flan pudding, oreo crumbs, 1 scoop of…", 956],
          ["JS1. Fresh taro milk", "Made in-house with real taro paste, slow-cooked to a naturally nutty and creamy perfection — thick…", 891]
        ]
      },
      {
        name: "Milk Tea",
        items: [
          ["MT11. Jasmine milk tea matcha cloud", "Fragrant jasmine milk tea crowned with a fluffy ceremonial Japanese matcha cloud: rich umami, no…", 845],
          ["MT4. Honey Brown Rice Milk Tea", "Nutty roasted brown rice tea sweetened with golden honey, light and naturally wholesome, serves with…", 774],
          ["MT9. Thai Milk Tea", "Vibrant amber Thai tea blended with sweet condensed milk bold, spiced, and irresistibly creamy. Milk…", 715],
          ["MT10.Thai green milk tea", "A creamy, lightly sweet green Thai tea with a subtle pandan-like aroma. Smooth and uniquely refreshing…", 748],
          ["MT3. Coffee milk tea", "Rich black tea and 1 shot of bold coffee in one perfectly balanced cup.", 774],
          ["MT8. Premium jasmine milk tea", "Infused jasmine green tea layered with fresh milk floral, fragrant, and refreshingly light. Milk…", 761],
          ["MT6. Osmanthus oolong milk tea", "Delicate floral osmanthus paired with smooth oolong, kissed with honey-like sweetness. Milk substitute…", 715],
          ["MT5. Earl grey milk tea", "Fragrant bergamot infused Earl Grey tea softened with velvety milk sophisticated and aromatic. Milk…", 715],
          ["MT2. Brown Sugar Boba Milk Tea", "Tiger striped brown sugar syrup swirled into silky milk tea, topped with toasted cheese foam, brown sugar…", 845],
          ["MT1. Original Black Milk Tea", "Classic black tea blended with creamy milk bold, smooth, and timeless.", 683]
        ]
      },
      {
        name: "Fruit Tea - Green Tea / Jasmine Tea",
        items: [
          ["JT7. Berry Sunset", "A stunning blend of mixed guava, passion fruit and mango swirled into jasmine tea — bold, tangy, and…", 761],
          ["JT3. Rose Lychee Jasmine Tea", "Rose lychee jasmine tea with customizable sweetness and ice levels. Adjust sugar from zero to extra sweet…", 761],
          ["JT5. Watermelon Jasmine Tea", "Cool watermelon smoothie blended into infused jasmine green tea — light, sweet, and perfectly summery.", 761],
          ["JT4. Peach Orange Jasmine Tea", "Juicy peach puree and orange juice meet infused jasmine green tea for a sun-kissed, vibrant sip.", 748],
          ["JT6. Honey Lemon Jasmine Tea", "Infused jasmine green tea brightened with fresh lemon juice and drizzled with golden honey. Fresh and…", 735],
          ["JT9. Passion Fruit Jasmine Tea", "Tangy real passion fruit puree meets infused jasmine green tea — exotic, tropical, and refreshingly bold.", 715],
          ["JT8. Berry Sunrise", "Layered strawberry purees over jasmine tea, topped with orange juice that bloom like a sunrise — vibrant…", 761],
          ["JT1. Jasmine Green Tea", "Delicate infused jasmine green tea — light, clean, and naturally floral. The perfect refresher.", 618],
          ["JT2. Jasmine Mango Fruit Tea", "Infused jasmine green tea swirled with luscious mango puree — tropical, bright, and irresistibly fruity.", 761]
        ]
      },
      {
        name: "Fruit Tea - Oolong Tea",
        items: [
          ["OT3. Strawberry Oolong Tea", "Fresh strawberry puree layered over oolong tea — bright, fruity, and beautifully refreshing.", 715],
          ["OT6. Watermelon oolong tea", "Cool watermelon juice over light oolong tea crisp, sweet, and ultra-refreshing.", 761],
          ["OT5. Lychee oolong tea", "Delicate lychee paired with smooth oolong — sweet, juicy, and wonderfully aromatic.", 748],
          ["OT4. Peach Orange Oolong Tea", "Sweet peach puree and bright orange puree swirled into smooth oolong — a citrusy, fruity delight.", 748],
          ["OT2. Peach Perfection Oolong Tea", "Velvety peach puree meets smooth oolong for a perfectly sweet, lightly floral combination.", 748],
          ["OT1. Oolong Tea", "Pure, smooth oolong tea — lightly toasty with a natural floral finish. Simple and satisfying.", 618]
        ]
      },
      {
        name: "Fruit Tea - Black Tea",
        items: [
          ["BT3. Lemon Black Tea", "Bright lemon juice with robust black tea — clean, tangy, and perfectly zesty.", 715],
          ["BT2. Lychee Black Tea", "Sweet lychee puree swirled into bold black tea: fruity, aromatic, and refreshingly light.", 715],
          ["BT1. Premium Black Tea", "Full-bodied premium black tea, smooth and rich — a classic that never goes out of style.", 631]
        ]
      },
      {
        name: "Caffeine Free",
        items: [
          ["CF5. Coco ube cloud", "Fresh coconut water crowned with a luscious ube cloud — tropical, aromatic, and beautifully layered.", 845],
          ["CF3. Fresh Strawberry milk", "Sweet and sour strawberry puree swirled into fresh milk — fruity, creamy, and nostalgically delicious…", 813],
          ["CF4. Fresh Mango milk", "Tropical mango puree blended with fresh milk — smooth, sweet, and sunshine in a cup. Milk substitute…", 845],
          ["CF1. Brown Sugar Boba Fresh Milk", "Creamy fresh milk drizzled with tiger brown sugar syrup and chewy brown sugar boba. Topped with toasted…", 774],
          ["CF2. Fresh milk ube cloud", "Silky fresh milk topped with a dreamy purple ube cloud — sweet, creamy, and visually stunning. Milk…", 845]
        ]
      },
      {
        name: "Coffee",
        items: [
          ["CP3. Creamy Salt Coffee", "Our signature Vietnamese coffee topped with a lightly salted cream foam — sweet, salty, and completely…", 891],
          ["CP4. Egg Cream Coffee", "Velvety whipped egg cream layered over rich, robust Vietnamese coffee — silky smooth with a strong…", 813],
          ["CP5. Coco Coffee", "Rich, robust Vietnamese coffee swirled with creamy coconut — tropical, bold, and beautifully balanced.", 748],
          ["CP6. Coffee Ube Cloud", "Bold, robust Vietnamese coffee crowned with a gorgeous purple ube cloud — strong caffeine meets dreamy…", 845],
          ["CP2. Original Vietnamese Coffee", "Rich, robust Vietnamese coffee phin filtered strong with a smooth finish — bold caffeine to power your day.", 748],
          ["CP1. Black Coffee", "Pure, bold phin filtered coffee- clean, strong, and straightforward. For the purists.", 683]
        ]
      },
      {
        name: "Ceremonial Grade Matcha",
        items: [
          ["MC5. Supreme Matcha Latte", "An elevated take on our matcha latte — ceremonial Japanese matcha, premium quality, deeply rich umami with…", 878],
          ["MC6. Parisian Cookie Matcha", "Ceremonial Japanese matcha latte with cookies butter, caramel taste — sophisticated, indulgent, and…", 878],
          ["MC7. Brown sugar boba matcha latte", "Ceremonial Japanese matcha latte swirled with tiger brown sugar and chewy boba pearls — rich umami meets…", 878],
          ["MC4. Mango Matcha Latte", "Luscious mango puree paired with ceremonial Japanese matcha — tropical sweetness balancing rich, smooth…", 845],
          ["MC3. Strawberry matcha latte", "Bright strawberry puree layered beneath ceremonial Japanese matcha latte — fruity meets rich umami in the…", 839],
          ["MC9. Matcha latte ube cloud", "Ceremonial Japanese matcha latte crowned with a vibrant purple ube cloud — earthy umami meets sweet…", 845],
          ["MC8. Matcha banana cream", "Ceremonial Japanese matcha latte layered with banana foam and banana slices toasted, biscoff cookie crumbs…", 943],
          ["MC2. Coco matcha Cloud", "Ceremonial Japanese matcha foam with a tropical coconut water— creamy, earthy, and utterly dreamy. Milk…", 845],
          ["MC1. Premium Matcha Latte", "Ceremonial-grade Japanese matcha whisked into velvety milk — rich umami, zero bitterness, light caffeine…", 813]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["SO5. Mango Banana Smoothie", "Tropical mango meets creamy banana in one perfectly smooth, naturally sweet blend. Milk substitute available.", 845],
          ["SO3. Strawberry Banana Smoothie", "Sweet and sour strawberry and ripe banana blended together — creamy, naturally sweet, and perfectly…", 845],
          ["SO4. Mango Smoothie", "Tropical mango puree blended into a smooth, luscious drink — bold, sweet, and full of sunshine. Milk…", 813],
          ["SO1. Avocado Smoothie", "Creamy, fresh avocado blended with milk — rich, nourishing, and satisfyingly smooth. Milk substitute…", 813],
          ["SO2. Strawberry Smoothie", "Fresh strawberry puree blended into a thick, creamy smoothie — fruity, bright, and deliciously refreshing…", 813]
        ]
      },
      {
        name: "Slushy",
        items: [
          ["SL3. Watermelon Slushy", "Cool, juicy watermelon puree blended with ice — light, sweet, and endlessly refreshing.", 813],
          ["SL1. Strawberry Slushy", "Icy blended strawberry puree — bright, fruity, and the perfect cool-down sip.", 813],
          ["SL2. Mango Slushy", "Tropical mango puree blended into a refreshing icy slushy — sweet, bold, and sunshine in every sip.", 813]
        ]
      },
      {
        name: "Crystal Series (Soda)",
        items: [
          ["SD4. Ruby", "Ruby soda with customizable sweetness and ice level. Choose from no to extra sweet, and ice from none to full.", 813],
          ["SD3. Topaz", "Refreshing soda with customizable sweetness and ice levels. Choose from a range of zero to extra sweet…", 813],
          ["SD1. Sapphire", "A dazzling blue sparkling soda — cool, refreshing, and as beautiful as the gemstone it's named after.", 813],
          ["SD2. Amethyst", "Amethyst soda with customizable sweetness and ice levels. Choose from various sugar percentages and ice…", 813]
        ]
      },
      {
        name: "Mung Bean",
        items: [
          ["MB1. Mung Bean Pandan Milk", "Creamy mung bean blended with fresh pandan extract and filtered and fresh milk — nutty, aromatic, and…", 891]
        ]
      },
      {
        name: "Banh Mi",
        items: [
          ["BM4. Grilled Chicken Sandwich", "Grilled chicken with pickled vegetables and fresh herbs in a crispy baguette.", 1235],
          ["BM3. Grilled Beef Sandwich", "Grilled beef with pickled vegetables, cucumber, and fresh cilantro in a crispy baguette.", 1164],
          ["BM5. Vegan Sandwich", "Crisp baguette filled with marinated tofu, fresh cilantro, pickled vegetables, and sliced jalapeños.", 1164],
          ["BM2. Grilled Pork Sandwich", "Grilled pork with pickled vegetables, fresh herbs, and jalapeños in a crispy baguette.", 1164],
          ["BM1. Special Combo Sandwich", "Sliced meats, fresh cilantro, and crisp vegetables in a baguette.", 1235]
        ]
      },
      {
        name: "Spring Rolls",
        items: [
          ["SP3. Shrimp Spring Rolls", "Shrimp spring rolls filled with shrimp, vermicelli noodles, fresh lettuce, and carrots, wrapped in rice paper.", 1424],
          ["SP4. Tofu Spring Rolls", "Tofu wrapped in rice paper with vermicelli, lettuce, and carrots.", 1424],
          ["SP5. Egg Spring Rolls", "Crispy rolls filled with egg, vermicelli noodles, and fresh vegetables, wrapped in rice paper.", 1424],
          ["SP1. Classic Vietnamese Pork & Shrimp Rolls", "Rice paper rolls filled with pork, shrimp, fresh herbs, lettuce, and shredded vegetables.", 1424],
          ["SP2. Grilled Pork Spring Rolls", "Grilled pork wrapped in rice paper with fresh vegetables and herbs.", 1424]
        ]
      },
      {
        name: "Jolly's Snacks",
        items: [
          ["Popcorn Chicken", "Bite-sized chicken pieces, perfectly seasoned and crisply fried", 1294],
          ["Flan", "Smooth, caramel-topped custard, a classic delight.", 254]
        ]
      }
    ],
    hours: "Daily 10am–6pm",
    orderUrl: "https://www.doordash.com/store/jolly-cafe-oakland-40461003/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their DoorDash store; hours are from Google Maps and Yelp."
  },
  'jonnys-italian-ice': {
    hours: "Mon–Thu 12–11pm, Fri–Sun 12pm–12am",
    siteNote: "Hours from Google and MapQuest; their website is a 'Launching Soon' page and they are on no delivery app, so no priced menu."
  },
  'k-on-the-go-union-city': {
    sections: [
      {
        name: "Coffee, Matcha & Lattes",
        items: [
          ["Vietnamese Coffee", "", 750],
          ["Vietnamese White Coffee", "", 800],
          ["Vietnamese Egg Coffee", "", 800],
          ["Flan Coffee +coffee jelly & flan (Iced)", "", 850],
          ["Dalgona Coffee", "", 800],
          ["Caramel Macchiatto", "", 800],
          ["Matcha EggLatte", "", 900],
          ["Matcha Latte", "", 850],
          ["Dirty Matcha Latte", "", 850],
          ["Brown Sugar Latte", "with or without coffee", 750],
          ["Cafe Latte", "", 700],
          ["Caramel Latte", "", 750],
          ["Vanilla Latte", "", 750],
          ["Hazelnut Latte", "", 750],
          ["Mint Mojito Latte", "", 750],
          ["Taro Latte", "", 750],
          ["Fresh Milk", "", 325],
          ["Matcha Fresh Coconut", "matcha cream on top of fresh coconut with coconut meat", 900],
          ["Ube Coconut Coffee", "", 800],
          ["Matcha Sakura", "", 900],
          ["Matcha Strawberry Latte", "Strawberry Matcha", 900],
          ["Brown Sugar Matcha", "Brown sugar in your matcha.", 850],
          ["Mango Matcha", "Mango cold foam mango matcha", 900],
          ["Matcha Tiramisu", "", 850],
          ["Tiramisu Latte", "", 750],
          ["Banana Matcha", "Banana cream matcha latte comes without boba", 900],
          ["Salted Vietnamese Coffee", "", 800]
        ]
      },
      {
        name: "Milk Teas",
        items: [
          ["Puff Cream Milk Tea", "", 800],
          ["Classic Milk Tea", "", 700],
          ["Jasmine Milk Tea", "", 700],
          ["Oolong Milk Tea", "", 700],
          ["Thai Green Milk Tea", "", 650],
          ["Strawberry Milk Tea (iced)", "", 700],
          ["Honeydew Milk Tea (iced)", "", 700],
          ["Mango Milk Tea (iced)", "", 650],
          ["Taro Milk Tea", "", 700],
          ["Brown Sugar Milk Tea", "", 700]
        ]
      },
      {
        name: "Iced Tea & Fruit Drinks",
        items: [
          ["Guava Refresher", "", 750],
          ["Peach Lychee Tea", "", 750],
          ["Mango Strawberry Tea", "", 750],
          ["Mango Passionfruit Tea", "", 750],
          ["Lychee Strawberry Tea", "", 750],
          ["Iced Green Tea", "", 600],
          ["Passion Orange Guava Tea", "Passion Fruit Orange Guava Tea", 750],
          ["White Grape Fruit Tea", "", 750],
          ["Mango Peach Fruit Tea", "", 750],
          ["Orange Sugarcane", "", 800]
        ]
      },
      {
        name: "Smoothies & Slushies",
        items: [
          ["Mango Smoothie", "", 800],
          ["Strawberry Smoothie", "", 800],
          ["Mango Strawberry Smoothie", "", 800],
          ["Mango Honeydew Smoothie", "", 800],
          ["Mango Peach Smoothie", "", 800],
          ["Lychee Strawberry Smoothie", "", 800],
          ["Mango Slushie", "", 800],
          ["Strawberry Slushie", "", 800],
          ["Mango Strawberry Slushie", "", 800],
          ["Mango Honeydew Slushie", "", 800],
          ["Mango Peach Slushie", "", 800],
          ["Lychee Strawberry Slushie", "", 800],
          ["Mango Passionfruit Slushie", "", 800],
          ["White Grape Slushie", "", 800],
          ["White Grape Smoothie", "", 800],
          ["Taro Smoothie", "", 800],
          ["Lychee Slushie", "", 800],
          ["Taro Slushie", "", 800]
        ]
      },
      {
        name: "All-Day Breakfast",
        items: [
          ["Mini Puff Pancake (10 Pcs)", "10 mini puff pancake with fresh fruit and cream", 650],
          ["Banh Mi (Pork)", "", 950],
          ["Baked Chicken", "Baked popcorn chicken", 900],
          ["Lox Bagel", "", 1025],
          ["Chocolate Croissant", "", 550],
          ["Turkey & Cheese Croissant", "", 625],
          ["Tomato & Parmesan Croissant", "", 625]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Flan Cake (Caramel/Coffee) - Served With Shaved Ice", "", 750],
          ["Tiramisu Cake", "", 850],
          ["Mango Coconut Mousse", "", 850],
          ["Macarons", "From", 300],
          ["Crunchy Mocha Mousse", "", 850],
          ["Pistachio Cheesecake", "", 850],
          ["Oatmeal Cookie", "", 400],
          ["Ruby Choux", "", 800],
          ["Cinnamon Cookie", "cinnamon sugar cookies. get it toasted or not", 400],
          ["Chocolate Chip Cookie", "", 400],
          ["Dubai Chocolate Cake", "", 1000]
        ]
      },
      {
        name: "Hot Tea",
        items: [
          ["Hot Tea", "", 600]
        ]
      },
      {
        name: "Snack",
        items: [
          ["Bagel Cream Cheese", "", 525],
          ["Lemongrass Escargo", "LEMONGRASS ESCARGO SERVE WITH SLICES OF BREAD", 1500],
          ["Buttercorn Escargot", "BUTTERCORN ESCARGO SERVE WITH SLICE BREAD", 1500]
        ]
      },
      {
        name: "Coffee",
        items: [
          ["Black Coffee", "", 600]
        ]
      }
    ],
    pricesEstimated: "Prices are from their Grubhub store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from the K On the Go store on Grubhub at 31877 Alvarado Blvd."
  },
  'karam-sf': {
    hours: "Wed–Mon 12–10pm, Closed Tue",
    phone: "(415) 374-7142",
    siteNote: "Hours are from their own website (which shows a 12AM typo) confirmed by Yelp and their Toast page."
  },
  'katsu-factory': {
    sections: [
      {
        name: "Katsu Factory",
        items: [
          ["KF Tomahawk Katsu", "A breaded pork chop topped with sauce, served with shredded cabbage, a daikon pickle, and a side of…", 2395],
          ["KF Combination", "KF Tonkatsu, shrimp katsu and cheese katsu", 2495],
          ["KF King Katsu", "A generous portion of crispy breaded pork cutlet, accompanied by a tangy dipping sauce and a small…", 2395],
          ["KF Curry Shrimp Katsu", "A crispy shrimp cutlet served with savory Japanese curry sauce.", 2395],
          ["KF Pork Ribs Katsu", "Tender pork ribs in a crispy breadcrumb coating. Served with a side of shredded cabbage and a tangy…", 2295],
          ["KF udon", "Thick udon noodles in a savory broth, topped with sliced green onions, seaweed, and mushrooms.", 695],
          ["KF Soba", "", 695],
          ["KF Fish Katsu", "Breaded deep fried cod", 2295],
          ["KF Tonkatsu", "Crispy breaded pork cutlets with tangy sauce, served with shredded cabbage, pickles, and a side of…", 2195],
          ["KF Cheese Katsu", "Crispy breaded pork cutlet topped with melted cheese, served with shredded cabbage, pickles, and a…", 2195]
        ]
      },
      {
        name: "Appetizers",
        items: [
          ["Gyoza", "Crispy fried potstickers served with sweet spicy vinaigrette.", 995],
          ["Chicken Karaage", "Japanese style chicken nugget.", 1595],
          ["San Francisco Fire", "Spicy tuna roll tempura, served with chili-cilantro sauce on a bed of green salad, topped with…", 1995],
          ["Ankimo", "Monkfish liver with ponzu sauce.", 1595],
          ["The Bomb", "Deep fried jalapeño, stuffed with spicy tuna, snow crab and cream cheese.", 1495],
          ["Miso (L)", "", 795],
          ["Agedashi Tofu", "Deep fried tofu with tempura sauce and green onion.", 895],
          ["Rice", "", 350],
          ["BBQ Ribs (AP)", "Korean style BBQ ribs.", 1995],
          ["Grilled Squid", "Grilled squid with spicy mayo.", 1795],
          ["Monkey Brain", "Deep fried mushroom, stuffed with spicy tuna.", 1295],
          ["Kaki Fried", "5 pcs. Fried oysters.", 1395],
          ["Hamachi Kama", "Grilled hamachi collar served with ponzu sauce.", 1895],
          ["Maguro Tataki", "Seared tuna with garlic sauce.", 1595],
          ["Miso (S)", "", 395],
          ["Edamame", "Steamed green soybeans.", 595],
          ["Spicy Garlic Edamame", "Steamed green soybean with garlic and japanese hot pepper.", 895]
        ]
      },
      {
        name: "Tempura",
        items: [
          ["Shrimp Tempura (AP)", "4 pcs. Of shrimps.", 1195],
          ["Soft Shell Crab", "Breaded soft shell crab.", 1395],
          ["Fried Calamari", "Crispy fried calamari.", 1895],
          ["Sashimi Sampler", "8 pcs chef's selection of fresh sashimi.", 1895],
          ["Japanese Beef Tataki", "Seared washugyu beef with garlic sauce.", 1695],
          ["Pepper Fin", "Thin slices of white tuna with jalapeño, ponzu sauce.", 1495],
          ["BBQ Albacore", "Seared white tuna with special mayo sauce.", 1395],
          ["BBQ Mussel", "BBQ green mussel with house sauce.", 1095],
          ["Melting Albacore", "Albacore tuna with snow crab served with special sauce.", 1595],
          ["Vegetables Tempura (AP)", "7 pcs. Of seasonal vegetables.", 1095],
          ["Assorted Tempura (AP)", "1 pcs. Of shrimp and 6 pcs. Of seasonal vegetables.", 1195]
        ]
      },
      {
        name: "Salad",
        items: [
          ["Seaweed Salad", "Fresh seaweed with sesame seeds, accompanied by ripe raspberries.", 895],
          ["Japanese Pickle", "Assorted pickled japanese vegetable.", 695],
          ["Cucumber Salad", "Cucumber in vinegar sauce.", 650],
          ["Sunomono Salad", "Cucumber in vinegar sauce (choice of prawn or octopus).", 1095],
          ["Hawaiian Poke", "Spicy seaweed salad with choice of tuna or salmon.", 1895],
          ["Ika Sansai", "Steamed squid salad.", 695],
          ["Green Salad", "", 495],
          ["Seafood Salad (Or Spicy)", "Assortment of sliced raw fish mixed with seaweed salad.", 2095]
        ]
      },
      {
        name: "Kitchen",
        items: [
          ["Salmon Teriyaki", "Grilled salmon glazed with teriyaki sauce, served with white rice topped with sesame seeds and a…", 2695],
          ["Chicken Katsu Plate", "Breaded cutlet (choice of chicken or pork for an additional charge).", 2595],
          ["Unagi Kabayaki", "Barbequed fresh water eel platter - whole piece.", 2895],
          ["Saba Shioyaki", "Grilled mackerel.", 1895],
          ["BBQ Ribs", "Korean BBQ style-9 pcs.", 2995],
          ["Tempura Combination", "Assorted tempura featuring crispy shrimp, vegetables, and herbs, lightly battered and fried for a…", 2195],
          ["Shrimp Tempura (D)", "Crispy, golden-battered shrimp, deep-fried to a light crunch.", 2295],
          ["Vegetable Tempura (D)", "", 1895],
          ["Chicken Teriyaki", "Grilled chicken glazed with teriyaki sauce, garnished with sesame seeds, served atop sautéed…", 2295],
          ["Beef Teriyaki", "Tender beef strips glazed in teriyaki sauce, garnished with sesame seeds and scallions, served over…", 2595]
        ]
      },
      {
        name: "Udon",
        items: [
          ["Seafood Udon", "Shrimp, scallop, red snapper, salmon, calamari in broth.", 2095],
          ["Tempura Udon", "Vegetables in broth, tempura served on the side.", 1895],
          ["Nabeyaki Udon", "Chicken, shrimp tempura, vegetables in broth.", 1895]
        ]
      },
      {
        name: "Bento",
        items: [
          ["Bento #1. Chicken Teriyaki, Gyoza, CA Roll", "", 2595],
          ["Bento #2. Chicken Teriyaki, Tempura, CA Roll", "", 2595],
          ["Bento #3. Chicken Teriyaki, Tempura, Sashimi", "", 2695],
          ["Bento #4. Beef Teriyaki, Gyoza, CA Roll", "", 2695],
          ["Bento #5. Beef Teriyaki, Tempura, CA Roll", "", 2695],
          ["Bento #6. Beef Teriyaki, Tempura, Sashimi", "", 2595],
          ["Bento #7. Salmon Teriyaki, Gyoza, CA Roll", "", 2795],
          ["Bento #8. Salmon Teriyaki, Tempura, CA Roll", "", 2795],
          ["Bento #9. Salmon Teriyaki, Tempura, Sashimi", "", 2895],
          ["Bento #10. BBQ Ribs, Gyoza, CA Roll", "", 2895],
          ["Bento #11. BBQ Ribs, Tempura, CA Roll", "", 2895],
          ["Bento #12. BBQ Ribs, Tempura, Sashimi", "", 2995]
        ]
      },
      {
        name: "Sushi Bar",
        items: [
          ["Chirashi", "Chef's selection of fresh sashimi, served over sushi rice.", 3495],
          ["Sake Don", "Slices of salmon sashimi with lemon, wasabi and pickled ginger.", 3495],
          ["Sake Maki", "Fresh salmon.", 695],
          ["Avocado Roll", "", 595],
          ["Tekka Maki", "Red tuna.", 695],
          ["Assorted Sashimi", "Chef's selection of fresh sashimi.", 3495],
          ["Roll Combination", "California roll, spicy tuna roll and unagi roll.", 2695],
          ["Unagi Don", "BBQ fresh water eel served over rice.", 3495],
          ["Philadelphia Roll", "Salmon, cream cheese and avocado.", 1050],
          ["Vegetable Tempura Roll", "", 795],
          ["Oshinko Maki", "Japanese pickles.", 550],
          ["Satomi Signature Set (For 2–3)", "Chef's choice of fresh sushi, sashimi and special rolls.", 9500],
          ["Tekka Don", "Slices of tuna (salmon), served over sushi rice.", 3495],
          ["Salmon Skin Roll", "Cucumber, sprouts, burdock root.", 995],
          ["Kappa Maki", "Cucumber.", 550],
          ["Sushi Combination", "Chef's choice of fresh sushi and California roll.", 3295],
          ["Sushi and Sashimi", "Chef's choice of fresh sushi & sashimi.", 3695]
        ]
      },
      {
        name: "Satomi Rolls",
        items: [
          ["Gregs Roll", "", 3695],
          ["Lion King", "California roll covered with baked salmon.", 1795],
          ["Crunch Roll", "Shrimp tempura, crab meat with sprinkled crunch powder.", 1495],
          ["Golden Gate", "California roll covered with salmon and yellowtail.", 1595],
          ["Raiders", "Deep fried shrimp, crab meat covered with avocado and shrimp.", 1695],
          ["Rock & Roll", "Deep fried soft shell crab, avocado, cucumber, crab meat with eel and shrimp.", 2195],
          ["3655", "Spicy soft shell crab, crab meat, cucumber and avocado covered with tuna.", 2195],
          ["Lobster Crossing", "California roll topped with baked langostino with special sauce.", 1995],
          ["Crazy Roll", "Tuna, salmon, yellowtail, avocado and tobiko.", 1395],
          ["Gangsta", "Yellowtail and cucumber covered with salmon and freshwater eel.", 1895],
          ["Spicy Rainbow", "Spicy tuna and cucumber covered by a colorful array of raw fish.", 1895],
          ["Inferno Scallop", "Spicy tuna, cucumber and jalapeño covered with seared scallop on top.", 1895],
          ["911", "Spicy tuna, jalapeño covered with white tuna with unagi and spicy sauce.", 1895],
          ["Spicy Juno", "Deep fried shrimp, spicy tuna, cucumber covered with tuna, salmon, crab meat and jalapeño…", 1895],
          ["Tempura Roll", "Shrimp and vegetable tempura.", 1295],
          ["Rainbow", "California roll covered by a colorful array of raw fish.", 1795],
          ["Cherry Blossom", "Salmon and avocado covered with tuna.", 1795],
          ["Mt Fuji", "Deep fried shrimp, crab meat with scallop on top.", 1695],
          ["Salmon Lover", "Deep fried salmon roll covered with salmon.", 1695],
          ["California Lover", "California roll wrapped with shrimp and mango.", 1495],
          ["Super California Roll", "California roll covered with freshwater eel.", 1595],
          ["49'Er", "Salmon, avocado wrapped salmon and sliced lemon.", 1695],
          ["Delicious Roll", "Soft shell crab, avocado wrapped with salmon and mango.", 1795],
          ["Mango Paradise", "Deep fried shrimp, crab meat covered with tuna and mango with mango sauce.", 1695],
          ["Ultimate Spider", "Freshwater eel, cucumber, topped with deep fried soft shell crab.", 1895],
          ["Giants", "Deep fried shrimp, crab meat covered with white tuna.", 1695],
          ["Bay Scallop", "California roll with baked scallop on top.", 1795],
          ["Veggie Lover", "Cucumber, avocado, japanese pickle, fried tofu wrapped with soy paper.", 1895],
          ["Finding Nemo", "Chicken teriyaki and cream cheese.", 1295],
          ["Orange Blossom", "Tuna and avocado covered with fresh salmon.", 1795],
          ["Andy's", "Spicy tuna, jalapeño covered with seared salmon and crunch powder.", 1895],
          ["Flaming Dragon", "Deep fried shrimp, crab, avocado and spicy tuna covered with salmon, yellowtail, tuna and tobiko.", 2195],
          ["Spicy Orange", "Spicy crab meat, shrimp tempura covered with tuna, avocado with slice of orange.", 1995],
          ["Victoria Secret", "Spicy tuna, cucumber and deep fried sea bass with spicy scallop.", 1895],
          ["Crazy Spicy", "Spicy tuna, salmon, yellowtail, tobiko and cucumber.", 1495],
          ["Out of Control", "Crab meat, shrimp tempura, spicy tuna and avocado covered with yellowtail, izumidai and tuna.", 1795],
          ["Spicy Crunch", "Spicy tuna, deep fried shrimp with crunch mix.", 1595],
          ["Spicy Country", "Spicy tuna, cucumber and tobiko with seaweed salad.", 1695],
          ["Two Timer", "Deep fried shrimp, crab meat cucumber covered with unagi, avocado, tuna and tai.", 1795],
          ["Caterpillar", "Freshwater eel & cucumber covered with avocado.", 1695],
          ["Power of Love", "Deep fried roll: fresh water eel, shrimp, mango, cream cheese with unagi and mango sauce.", 1495],
          ["Unagi Lover", "A unagi loin on California roll.", 1995],
          ["Japanese Cowboy", "Spicy tuna, mango and jalapeño covered with seared washugyu beef with garlic ponzu.", 1895],
          ["S** and the City", "Spicy deep fried shrimp, cucumber covered with tuna.", 1695],
          ["Fremont", "Fresh salmon, cream cheese, jalapeño with spicy sauce (deep fried whole roll).", 1395],
          ["Lucky 7", "Crab meat, deep fried shrimp, avocado and spicy tuna with special seared mix tuna.", 2195],
          ["Spicy Spider", "Deep fried soft shell crab, avocado topped with spicy tuna.", 1895],
          ["Volcano", "Breaded deep fried spicy tuna with jalapeño.", 1695],
          ["Dancing Spicy Tuna", "Deep fried shrimp and cucumber covered with spicy tuna.", 1795],
          ["Red Dragon", "Fresh water eel with cucumber covered with spicy tuna.", 1795],
          ["White Dragon", "White tuna and cucumber covered with unagi and avocado.", 1795],
          ["Dragon", "Deep fried shrimp, crab meat covered with freshwater eel and avocado.", 1695],
          ["Satomi Roll", "Deep fried California roll.", 1295]
        ]
      },
      {
        name: "Soft Drinks",
        items: [
          ["Soft Drink", "Coke, Diet Coke, Sprite, orange, lemonade.", 295],
          ["Apple Juice", "", 395],
          ["Sparkling Water", "", 595],
          ["Marble Soda", "", 450]
        ]
      }
    ],
    hours: "Daily 11:30am–2:30pm, 5–9pm",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their DoorDash store (Katsu Factory (Satomi 2), 5022 Mowry Ave); hours from Google and Yelp."
  },
  'khaki': {
    hours: "Mon–Tue 5–9pm; Wed–Thu 12–2:30pm, 5–9pm; Fri 12–2:30pm, 5–10pm; Sat 11:30am–10pm; Sun 11:30am–8:30pm",
    siteNote: "Hours are from their own website (wearekhaki.com)."
  },
  'kickin-flavors-fremont': {
    hours: "Mon–Thu 12pm–2:30pm & 4:30pm–9pm, Fri–Sun 12pm–9pm",
    siteNote: "Hours are from their Chowbus ordering page and match Apple Maps."
  },
  'kickin-flavors-milpitas': {
    hours: "Mon–Wed 11:30am–6:20pm, Thu 11:30am–7pm, Fri–Sat 11:30am–8pm, Sun 11:30am–6:30pm",
    siteNote: "Hours are from their Great Mall Chowbus ordering page (online-order hours)."
  },
  'kings-wc-pizza': {
    hours: "Daily 11am–10pm",
    siteNote: "Hours are from their own website, matching Yelp, MapQuest and Google Maps."
  },
  'kitava-albany': {
    sections: [
      {
        name: "Brunchy Snacks",
        items: [
          ["Banana Blueberry Muffin", "Banana and blueberry muffin made with almond flour, eggs, coconut, cassava flour, chia seeds, and…", 550],
          ["Blueberry Overnight Oats (V)", "Gluten-free oats soaked in coconut milk and mixed with cacao, cinnamon, coconut sugar, and sunflower…", 600],
          ["Spiced Carrot Muffin (V)", "Carrot muffin made with warming spices, raisins, almond flour, almond butter, flaxmeal, and sweetened…", 550],
          ["Strawberry Chia Pudding (V)", "Chia pudding made with coconut milk, chia seeds, coconut sugar, vanilla, strawberry puree, and lemon…", 600]
        ]
      },
      {
        name: "Brunch",
        items: [
          ["Butternut Squash Fritter Tacos", "Butternut squash and chickpea fritter, roasted bell peppers and onions, guacamole, and sprouts, on an…", 1200],
          ["Blueberry Pancakes", "triple stack of fluffy gluten-free pancakes topped with organic blueberry compote and whipped coconut…", 1500],
          ["Warm Quinoa Breakfast Bowl", "Two scrambled pasture-raised eggs, herbed quinoa with peppers & onions, sweet potatoes, chimichurri…", 1600],
          ["Grass Fed Beef & Egg Tacos", "100% grass-fed picadillo beef, scrambled pasture-raised eggs from Tomales Bay Pastures, chipotle aioli…", 1550]
        ]
      },
      {
        name: "Protein Plates",
        items: [
          ["Picadillo Beef Protein Plate", "100% grass-fed beef, chickpea miso eggplant, roasted fingerling potatoes", 1600],
          ["Miso Salmon Plate", "Sustainably sourced salmon, chickpea miso glaze, roasted rainbow carrots, jasmine rice", 2100],
          ["Paprika Chicken Protein Plate", "Free-range Mary’s chicken thigh, charred broccoli, jasmine rice, avocado goddess", 1600]
        ]
      },
      {
        name: "Small Plates",
        items: [
          ["Za'atar Cauliflower & Hummus", "Cauliflower florets tossed with za’atar spices, served over chickpea hummus, topped with cilantro and…", 700],
          ["Crispy Brussels Sprouts", "Brussels sprouts cooked in sustainable palm oil, served with chipotle aioli", 900],
          ["Fried Plantains", "Naturally sweet plantains, served with chipotle aioli", 600],
          ["Chicken Nuggets", "Cassava flour breaded chicken, served with house made ketchup", 800],
          ["Cauliflower Bites", "Cauliflower florets with a crispy cassava flour breading, served with house made ranch", 700],
          ["Kitava Fries", "Classic cut fries cooked in sustainable palm fruit oil, served with house-made ketchup", 600]
        ]
      },
      {
        name: "Signature Bowls",
        items: [
          ["Sweet Plantain Bowl", "Jasmine rice, plantains, cumin beans, kale slaw, avocado, cilantro, romesco sauce", 1300],
          ["Sesame Chicken Bowl", "Jasmine rice, crispy chicken with cassava flour breading, charred broccoli, sesame togarashi, green…", 1600],
          ["Power Bowl", "Wild rice blend from Lundberg Farms, farmer’s greens, hummus, sweet potatoes, avocado, pickled onions…", 1300],
          ["Burrito Bowl", "Jasmine rice, paprika chicken, cumin beans, chimichurri mushrooms & sautéd spinach, guac, jalapeño lime…", 1400],
          ["Evolved Caesar Salad", "Farmer’s greens, sliced radish, pastured egg, avocado, gluten-free croutons, cashew “parmesan,\" herb…", 1000],
          ["Citrus Salad", "Farmer's greens, seasonal citrus fruit slices, diced cucumber, pickled onions, avocado, almond slices…", 1200],
          ["Guac & Greens Salad", "Farmer's greens, black bean & corn salad, red cabbage, guacamole, paprika-dusted organic corn tortilla…", 1400],
          ["Grilled Chicken Salad", "Farmer's greens, grilled Mary's free-range chicken breast (cold), avocado, diced cucumber, pickled…", 1500]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Dark Chocolate Brownie", "Rich and fudgy brownie made with cassava and coconut flour, pastured eggs, and coconut sugar", 450],
          ["Chocolate Chip Cookie", "Dark chocolate chip cookie made with GF flour mix, egg, vanilla, and dark chocolate sweetened with…", 450],
          ["Dairy-Free Soft Serve", "Dairy-free soft serve made with a cashew cream base and sweetened with coconut sugar", 600]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Charred Broccoli", "Fresh broccoli roasted with extra virgin olive oil, garlic, ginger, and salt", 400],
          ["Za'atar Cauliflower", "Cauliflower florets tossed with za’atar spices, cooked in sustainable palm fruit oil", 500],
          ["Black Beans & Corn Salad (Cold)", "Black beans, organic corn, red onion, cilantro, and lime salad", 400],
          ["Kale Slaw", "Fresh kale and shredded cabbage in a house-made tomato vinaigrette", 400],
          ["Sweet Potatoes", "Sweet potatoes cooked with salt and extra virgin olive oil", 400],
          ["Chickpea Miso Eggplant", "Roasted eggplant in a savory chickpea miso sauce with garlic, ginger, and basil.", 500],
          ["Cumin Beans", "A blend of red & mayocoba beans, soaked overnight and cooked with cumin, onion, garlic, and bay leaf", 400],
          ["Hummus", "Creamy chickpea hummus made with garlic, extra virgin olive oil, and lemon juice", 400],
          ["1/2 Avocado", "Half avocado side order", 200],
          ["Jasmine Rice", "Long-grain jasmine rice", 400],
          ["Wild Rice Blend", "A blend of wild, brown, red, and black rice from Lundberg Family Farms", 500],
          ["Cauliflower Rice", "Riced cauliflower sautéed with turmeric, onions, garlic, and extra virgin olive oil", 500],
          ["Farmer's Greens", "A house-made blend of organic red leaf and arugula", 400],
          ["Chimichurri Mushrooms", "Cremini, oyster mushrooms and spinach cooked in a mild herb chimichurri sauce.", 400],
          ["Diced Cucumber", "Freshly diced cucumber", 400],
          ["Roasted Rainbow Carrots", "Oven-roasted baby rainbow carrots with thyme, olive oil, and salt.", 500],
          ["Plant Protein Patty", "House-made protein patty with black beans, gluten-free oats, almonds, pumpkin seeds, and flax seeds…", 500],
          ["Grilled Chicken Breast (cold)", "Mary's chicken breast, marinated in a lemon and salt water brine. Diced and served cold.", 600],
          ["Paprika Chicken", "Pasture-raised chicken thigh coated with a mild paprika spice blend, then lightly charred", 600],
          ["Picadillo Beef", "100% grass-fed and grass-finished beef simmered with mild spices, tomatoes, onions, and garlic in…", 800],
          ["Crispy Chicken", "Cassava flour breaded chicken, cooked in sustainably sourced palm fruit oil", 700],
          ["Grilled Salmon", "Sustainably sourced salmon grilled with salt and olive oil", 900],
          ["Avocado Goddess", "Creamy avocado-based dressing made with parsley, cilantro, tahini, ginger root, and extra virgin olive oil", 200],
          ["House Ketchup", "House ketchup made with tomatoes, garlic, and coconut sugar", 200],
          ["Chipotle Aioli", "Dairy-free aioli made with chipotle pepper, honey, and extra virgin olive oil", 200],
          ["Herb Ranch", "Savory ranch made with herbs, lemon juice, and aquafaba from garbanzo beans (vegan)", 200],
          ["Romesco Sauce", "Roasted bell pepper sauce made with sunflower seeds, garlic, lemon juice, and extra virgin olive oil", 200],
          ["Ginger Ponzu Sauce", "Soy-free ginger ponzu sauce, made with coconut aminos", 200],
          ["Lemon Vinaigrette", "Light and simple dressing, made with a lemon juice & olive oil base", 200],
          ["Jalapeno Lime Dressing", "Charred tomatillos and jalapeno dressing with cilantro and tahini.", 200]
        ]
      },
      {
        name: "Snacks",
        items: [
          ["Coracao Chocolate", "Organic dark chocolate bars from Coracao", 700]
        ]
      }
    ],
    hours: "Daily 11am–9pm",
    orderUrl: "https://order.online/store/kitava-albany-32381267/",
    siteNote: "Menu and hours from kitava.com for this location; Kitava adds 5% to orders for staff healthcare."
  },
  'kitava-oakland': {
    sections: [
      {
        name: "Brunchy Snacks",
        items: [
          ["Banana Blueberry Muffin", "Banana and blueberry muffin made with almond flour, eggs, coconut, cassava flour, chia seeds, and…", 550],
          ["Blueberry Overnight Oats (V)", "Gluten-free oats soaked in coconut milk and mixed with cacao, cinnamon, coconut sugar, and sunflower…", 600],
          ["Spiced Carrot Muffin (V)", "Carrot muffin made with warming spices, raisins, almond flour, almond butter, flaxmeal, and sweetened…", 550],
          ["Strawberry Chia Pudding (V)", "Chia pudding made with coconut milk, chia seeds, coconut sugar, vanilla, strawberry puree, and lemon…", 600]
        ]
      },
      {
        name: "Brunch",
        items: [
          ["Butternut Squash Fritter Tacos", "Butternut squash and chickpea fritter, roasted bell peppers and onions, guacamole, and sprouts, on an…", 1200],
          ["Blueberry Pancakes", "triple stack of fluffy gluten-free pancakes topped with organic blueberry compote and whipped coconut…", 1500],
          ["Warm Quinoa Breakfast Bowl", "Two scrambled pasture-raised eggs, herbed quinoa with peppers & onions, sweet potatoes, chimichurri…", 1600],
          ["Grass Fed Beef & Egg Tacos", "100% grass-fed picadillo beef, scrambled pasture-raised eggs from Tomales Bay Pastures, chipotle aioli…", 1550]
        ]
      },
      {
        name: "Protein Plates",
        items: [
          ["Picadillo Beef Protein Plate", "100% grass-fed beef, chickpea miso eggplant, roasted fingerling potatoes", 1600],
          ["Miso Salmon Plate", "Sustainably sourced salmon, chickpea miso glaze, roasted rainbow carrots, jasmine rice", 2100],
          ["Paprika Chicken Protein Plate", "Free-range Mary’s chicken thigh, charred broccoli, jasmine rice, avocado goddess", 1600]
        ]
      },
      {
        name: "Small Plates",
        items: [
          ["Za'atar Cauliflower & Hummus", "Cauliflower florets tossed with za’atar spices, served over chickpea hummus, topped with cilantro and…", 700],
          ["Crispy Brussels Sprouts", "Brussels sprouts cooked in sustainable palm oil, served with chipotle aioli", 900],
          ["Fried Plantains", "Naturally sweet plantains, served with chipotle aioli", 600],
          ["Chicken Nuggets", "Cassava flour breaded chicken, served with house made ketchup", 800],
          ["Cauliflower Bites", "Cauliflower florets with a crispy cassava flour breading, served with house made ranch", 700],
          ["Kitava Fries", "Classic cut fries cooked in sustainable palm fruit oil, served with house-made ketchup", 600]
        ]
      },
      {
        name: "Signature Bowls",
        items: [
          ["Sweet Plantain Bowl", "Jasmine rice, plantains, cumin beans, kale slaw, avocado, cilantro, romesco sauce", 1300],
          ["Sesame Chicken Bowl", "Jasmine rice, crispy chicken with cassava flour breading, charred broccoli, sesame togarashi, green…", 1600],
          ["Power Bowl", "Wild rice blend from Lundberg Farms, farmer’s greens, hummus, sweet potatoes, avocado, pickled onions…", 1300],
          ["Burrito Bowl", "Jasmine rice, paprika chicken, cumin beans, chimichurri mushrooms & sautéd spinach, guac, jalapeño lime…", 1400],
          ["Evolved Caesar Salad", "Farmer’s greens, sliced radish, pastured egg, avocado, gluten-free croutons, cashew “parmesan,\" herb…", 1000],
          ["Citrus Salad", "Farmer's greens, seasonal citrus fruit slices, diced cucumber, pickled onions, avocado, almond slices…", 1200],
          ["Guac & Greens Salad", "Farmer's greens, black bean & corn salad, red cabbage, guacamole, paprika-dusted organic corn tortilla…", 1400],
          ["Grilled Chicken Salad", "Farmer's greens, grilled Mary's free-range chicken breast (cold), avocado, diced cucumber, pickled…", 1500]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Dark Chocolate Brownie", "Rich and fudgy brownie made with cassava and coconut flour, pastured eggs, and coconut sugar", 450],
          ["Chocolate Chip Cookie", "Dark chocolate chip cookie made with GF flour mix, egg, vanilla, and dark chocolate sweetened with…", 450],
          ["Dairy-Free Soft Serve", "Dairy-free soft serve made with a cashew cream base and sweetened with coconut sugar", 600]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Charred Broccoli", "Fresh broccoli roasted with extra virgin olive oil, garlic, ginger, and salt", 400],
          ["Za'atar Cauliflower", "Cauliflower florets tossed with za’atar spices, cooked in sustainable palm fruit oil", 500],
          ["Black Beans & Corn Salad (Cold)", "Black beans, organic corn, red onion, cilantro, and lime salad", 400],
          ["Kale Slaw", "Fresh kale and shredded cabbage in a house-made tomato vinaigrette", 400],
          ["Sweet Potatoes", "Sweet potatoes cooked with salt and extra virgin olive oil", 400],
          ["Chickpea Miso Eggplant", "Roasted eggplant in a savory chickpea miso sauce with garlic, ginger, and basil.", 500],
          ["Cumin Beans", "A blend of red & mayocoba beans, soaked overnight and cooked with cumin, onion, garlic, and bay leaf", 400],
          ["Hummus", "Creamy chickpea hummus made with garlic, extra virgin olive oil, and lemon juice", 400],
          ["1/2 Avocado", "Half avocado side order", 200],
          ["Jasmine Rice", "Long-grain jasmine rice", 400],
          ["Wild Rice Blend", "A blend of wild, brown, red, and black rice from Lundberg Family Farms", 500],
          ["Cauliflower Rice", "Riced cauliflower sautéed with turmeric, onions, garlic, and extra virgin olive oil", 500],
          ["Farmer's Greens", "A house-made blend of organic red leaf and arugula", 400],
          ["Chimichurri Mushrooms", "Cremini, oyster mushrooms and spinach cooked in a mild herb chimichurri sauce.", 400],
          ["Diced Cucumber", "Freshly diced cucumber", 400],
          ["Roasted Rainbow Carrots", "Oven-roasted baby rainbow carrots with thyme, olive oil, and salt.", 500],
          ["Plant Protein Patty", "House-made protein patty with black beans, gluten-free oats, almonds, pumpkin seeds, and flax seeds…", 500],
          ["Grilled Chicken Breast (cold)", "Mary's chicken breast, marinated in a lemon and salt water brine. Diced and served cold.", 600],
          ["Paprika Chicken", "Pasture-raised chicken thigh coated with a mild paprika spice blend, then lightly charred", 600],
          ["Picadillo Beef", "100% grass-fed and grass-finished beef simmered with mild spices, tomatoes, onions, and garlic in…", 800],
          ["Crispy Chicken", "Cassava flour breaded chicken, cooked in sustainably sourced palm fruit oil", 700],
          ["Grilled Salmon", "Sustainably sourced salmon grilled with salt and olive oil", 900],
          ["Avocado Goddess", "Creamy avocado-based dressing made with parsley, cilantro, tahini, ginger root, and extra virgin olive oil", 200],
          ["House Ketchup", "House ketchup made with tomatoes, garlic, and coconut sugar", 200],
          ["Chipotle Aioli", "Dairy-free aioli made with chipotle pepper, honey, and extra virgin olive oil", 200],
          ["Herb Ranch", "Savory ranch made with herbs, lemon juice, and aquafaba from garbanzo beans (vegan)", 200],
          ["Romesco Sauce", "Roasted bell pepper sauce made with sunflower seeds, garlic, lemon juice, and extra virgin olive oil", 200],
          ["Ginger Ponzu Sauce", "Soy-free ginger ponzu sauce, made with coconut aminos", 200],
          ["Lemon Vinaigrette", "Light and simple dressing, made with a lemon juice & olive oil base", 200],
          ["Jalapeno Lime Dressing", "Charred tomatillos and jalapeno dressing with cilantro and tahini.", 200]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Green Smoothie", "Refreshing green smoothie made with coconut milk, banana, pineapple, spinach, ginger, and cucumber", 900],
          ["Hibiscus Cooler", "Unsweetened beverage with hibiscus tea leaves and fresh mint", 500],
          ["Immunity Broth", "pasture-raised chicken bones simmered for 24 hours with turmeric & ginger root", 600],
          ["Regular or Decaf Coffee", "Ethically sourced coffee from Andytown Coffee Roasters in San Francisco", 350],
          ["Organic Hot Tea", "Organic tea from Numi", 275],
          ["OLIPOP Sparkling Tonic", "A healthy alternative to soda with prebiotics and botanicals to support your microbiome and digestive health", 400],
          ["Spindrift Sparkling Water", "Sparkling water made with real squeezed fruit. N “natural flavors” or added sugar, just real fruit!", 350],
          ["Agua de Piedra 12oz", "Bubbly sparkling water loaded with minerals", 300],
          ["Organic Cold-Pressed Juice", "Fresh organic cold-pressed juice from Happy Moose Juice", 750],
          ["Marin Kombucha", "Probiotic-rich kombucha, also available on tap", 500],
          ["Feel Mo' Betta Elixir Shot", "Rich and intense 2oz elixir shot with ginger, turmeric, apple cider vinegar, pineapple, lemon, and black…", 450],
          ["Athletic Brewing Co.", "Upside Dawn Ale (can) Non-alcoholic classic golden ale, crafted to remove gluten during fermentation…", 700]
        ]
      },
      {
        name: "Snacks",
        items: [
          ["Coracao Chocolate", "Organic dark chocolate bars from Coracao", 700]
        ]
      }
    ],
    hours: "Mon–Thu 11am–9pm, Fri–Sun 10am–9pm (brunch 10am–2pm)",
    orderUrl: "https://order.online/store/Kitava-1248486/",
    siteNote: "Menu and hours from kitava.com for this location; Kitava adds 5% to orders for staff healthcare."
  },
  'kitava-sf': {
    sections: [
      {
        name: "Protein Plates",
        items: [
          ["Picadillo Beef Protein Plate", "100% grass-fed beef, chickpea miso eggplant, roasted fingerling potatoes", 1600],
          ["Miso Salmon Plate", "Sustainably sourced salmon, chickpea miso glaze, roasted rainbow carrots, jasmine rice", 2100],
          ["Paprika Chicken Protein Plate", "Free-range Mary’s chicken thigh, charred broccoli, jasmine rice, avocado goddess", 1600]
        ]
      },
      {
        name: "Small Plates",
        items: [
          ["Za'atar Cauliflower & Hummus", "Cauliflower florets tossed with za’atar spices, served over chickpea hummus, topped with cilantro and…", 700],
          ["Fried Plantains", "Naturally sweet plantains, served with chipotle aioli", 600],
          ["Crispy Brussels Sprouts", "Brussels sprouts cooked in sustainable palm oil, served with chipotle aioli", 900],
          ["Chicken Nuggets", "Cassava flour breaded chicken, served with house made ketchup", 800]
        ]
      },
      {
        name: "Signature Bowls",
        items: [
          ["Sweet Plantain Bowl", "Jasmine rice, plantains, cumin beans, kale slaw, avocado, cilantro, romesco sauce", 1300],
          ["Sesame Chicken Bowl", "Jasmine rice, crispy chicken with cassava flour breading, charred broccoli, sesame togarashi, scallions…", 1600],
          ["Power Bowl", "Wild rice blend from Lundberg Farms, farmer’s greens, hummus, sweet potatoes, avocado, pickled onions…", 1300],
          ["Burrito Bowl", "Jasmine rice, paprika chicken, cumin beans, chimichurri mushrooms & sautéd spinach, guac, jalapeño lime…", 1400],
          ["Evolved Caesar Salad", "Farmer’s greens, sliced radish, pastured egg, avocado, gluten-free croutons, cashew “parmesan,\" herb…", 1000],
          ["Citrus Salad", "Farmer's greens, seasonal citrus fruit slices, diced cucumber, pickled onions, avocado, almond slices…", 1200],
          ["Guac & Greens Salad", "Farmer's greens, black bean & corn salad, red cabbage, guacamole, paprika-dusted organic corn tortilla…", 1400],
          ["Grilled Chicken Salad", "Farmer's greens, grilled Mary's free-range chicken breast (cold), avocado, diced cucumber, pickled…", 1500]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Dark Chocolate Brownie", "Rich and fudgy brownie made with cassava and coconut flour, pastured eggs, and coconut sugar", 450],
          ["Chocolate Chip Cookie", "Dark chocolate chip cookie made with GF flour mix, egg, vanilla, and dark chocolate sweetened with…", 450]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Charred Broccoli", "Fresh broccoli roasted with extra virgin olive oil, garlic, ginger, and salt", 400],
          ["Za'atar Cauliflower", "Cauliflower florets tossed with za’atar spices, cooked in sustainable palm fruit oil", 500],
          ["Black Beans & Corn Salad (Cold)", "Black beans, organic corn, red onion, cilantro, and lime salad", 400],
          ["Kale Slaw", "Fresh kale and shredded cabbage in a house-made tomato vinaigrette", 400],
          ["Sweet Potatoes", "Sweet potatoes cooked with salt and extra virgin olive oil", 400],
          ["Marinated Chickpeas", "Tender chickpeas in a za'atar spice marinade", 400],
          ["Cumin Beans", "A blend of red & mayocoba beans, soaked overnight and cooked with cumin, onion, garlic, and bay leaf", 400],
          ["Hummus", "Creamy chickpea hummus made with garlic, extra virgin olive oil, and lemon juice", 400],
          ["1/4 Avocado", "Quarter avocado side order", 200],
          ["Jasmine Rice", "Long-grain jasmine rice", 400],
          ["Wild Rice Blend", "A blend of wild, brown, red, and black rice from Lundberg Family Farms", 500],
          ["Cauliflower Rice", "Riced cauliflower sautéed with turmeric, onions, garlic, and extra virgin olive oil", 500],
          ["Farmer's Greens", "A house-made blend of organic red leaf and arugula", 400],
          ["Chimichurri Mushrooms", "Cremini, oyster mushrooms and spinach cooked in a mild herb chimichurri sauce.", 400],
          ["Diced Cucumber", "Freshly diced cucumber", 400],
          ["Roasted Rainbow Carrots", "Oven-roasted baby rainbow carrots with thyme, olive oil, and salt.", 500],
          ["Plant Protein Patty", "House-made protein patty with black beans, gluten-free oats, almonds, pumpkin seeds, and flax seeds…", 500],
          ["Grilled Chicken Breast (cold)", "Mary's chicken breast, marinated in a lemon and salt water brine. Diced and served cold.", 600],
          ["Paprika Chicken", "Pasture-raised chicken thigh coated with a mild paprika spice blend, then lightly charred", 600],
          ["Grilled Salmon", "Sustainably sourced salmon grilled with salt and olive oil", 900],
          ["Picadillo Beef", "100% grass-fed and grass-finished beef simmered with mild spices, tomatoes, onions, and garlic in…", 800],
          ["Crispy Chicken", "Cassava flour breaded chicken, cooked in sustainably sourced palm fruit oil", 700],
          ["Avocado Goddess", "Creamy avocado-based dressing made with parsley, cilantro, tahini, ginger root, and extra virgin olive oil", 200],
          ["House Ketchup", "House ketchup made with tomatoes, garlic, and coconut sugar", 200],
          ["Chipotle Aioli", "Dairy-free aioli made with chipotle pepper, honey, and extra virgin olive oil", 200],
          ["Herb Ranch", "Savory ranch made with herbs, lemon juice, and aquafaba from garbanzo beans (vegan)", 200],
          ["Romesco Sauce", "Roasted bell pepper sauce made with sunflower seeds, garlic, lemon juice, and extra virgin olive oil", 200],
          ["Ginger Ponzu Sauce", "Soy-free ginger ponzu sauce, made with coconut aminos", 200],
          ["Chickpea Miso Dressing", "Soy free chickpea miso dressing with tahini, lemon juice and ginger.", 200],
          ["Lemon Vinaigrette", "Light and simple dressing, made with a lemon juice & olive oil base", 200],
          ["Jalapeno Lime Dressing", "Charred tomatillos and jalapeno dressing with cilantro and tahini.", 200]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Immunity Broth", "Pasture-raised chicken bones simmered for 24 hours with turmeric & ginger root", 600],
          ["Marin Kombucha", "Rotating flavors, tap or bottle", 500],
          ["OLIPOP Sparkling Tonics", "Various flavors, healthy alternative to soda", 400],
          ["Spindrift Sparkling Water", "Various flavors, made with real fruit juice", 350],
          ["Mineral Water", "12 oz bottle from Agua de Piedra", 300],
          ["Chilled Green Tea", "16 oz bottle unsweetened tea from Teas' Tea", 700],
          ["Cold-Pressed Juice", "Various flavors from Happy Moose Juice", 750],
          ["Feel Mo' Betta Elixir Shot", "2 oz immunity elixir from Happy Moose Juice", 450],
          ["Hot Coffee", "Regular or decaf coffee from Andytown", 350],
          ["Organic Hot Tea", "Various flavors from Mighty Leaf Tea", 275]
        ]
      },
      {
        name: "Snacks",
        items: [
          ["YES Bar", "A better-for-you bar made with plant-based ingredients like almonds, maple syrup, dark chocolate, and…", 300],
          ["Keto Bar", "Almond butter brownie bar from Perfect Keto", 325],
          ["Good Chocolate Square", "Sugar-free squares from The Good Chocolate", 225],
          ["Good Chocolate Bar", "Sugar-free bars from The Good Chocolate", 800]
        ]
      }
    ],
    hours: "Daily 11am–9pm",
    orderUrl: "https://order.online/store/Kitava-32001/",
    siteNote: "Menu and hours from kitava.com for this location; Kitava adds 5% to orders for staff healthcare."
  },
  'kitava-walnut-creek': {
    sections: [
      {
        name: "Brunchy Snacks",
        items: [
          ["Banana Blueberry Muffin", "Banana and blueberry muffin made with almond flour, eggs, coconut, cassava flour, chia seeds, and…", 550],
          ["Blueberry Overnight Oats (V)", "Gluten-free oats soaked in coconut milk and mixed with cacao, cinnamon, coconut sugar, and sunflower…", 600],
          ["Spiced Carrot Muffin (V)", "Carrot muffin made with warming spices, raisins, almond flour, almond butter, flaxmeal, and sweetened…", 550],
          ["Strawberry Chia Pudding (V)", "Chia pudding made with coconut milk, chia seeds, coconut sugar, vanilla, strawberry puree, and lemon…", 600]
        ]
      },
      {
        name: "Brunch",
        items: [
          ["Butternut Squash Fritter Tacos", "Butternut squash and chickpea fritter, roasted bell peppers and onions, guacamole, and sprouts, on an…", 1200],
          ["Blueberry Pancakes", "triple stack of fluffy gluten-free pancakes topped with organic blueberry compote and whipped coconut…", 1500],
          ["Warm Quinoa Breakfast Bowl", "Two scrambled pasture-raised eggs, herbed quinoa with peppers & onions, sweet potatoes, chimichurri…", 1600],
          ["Grass Fed Beef & Egg Tacos", "100% grass-fed picadillo beef, scrambled pasture-raised eggs from Tomales Bay Pastures, chipotle aioli…", 1550]
        ]
      },
      {
        name: "Protein Plates",
        items: [
          ["Picadillo Beef Protein Plate", "100% grass-fed beef, chickpea miso eggplant, roasted fingerling potatoes", 1600],
          ["Miso Salmon Plate", "Sustainably sourced salmon, chickpea miso glaze, roasted rainbow carrots, jasmine rice", 2100],
          ["Paprika Chicken Protein Plate", "Free-range Mary’s chicken thigh, charred broccoli, jasmine rice, avocado goddess", 1600]
        ]
      },
      {
        name: "Small Plates",
        items: [
          ["Za'atar Cauliflower & Hummus", "Cauliflower florets tossed with za’atar spices, served over chickpea hummus, topped with cilantro and…", 700],
          ["Crispy Brussels Sprouts", "Brussels sprouts cooked in sustainable palm oil, served with chipotle aioli", 900],
          ["Fried Plantains", "Naturally sweet plantains, served with chipotle aioli", 600],
          ["Chicken Nuggets", "Cassava flour breaded chicken, served with house made ketchup", 800],
          ["Cauliflower Bites", "Cauliflower florets with a crispy cassava flour breading, served with house made ranch", 700],
          ["Kitava Fries", "Classic cut fries cooked in sustainable palm fruit oil, served with house-made ketchup", 600]
        ]
      },
      {
        name: "Signature Bowls",
        items: [
          ["Sweet Plantain Bowl", "Jasmine rice, plantains, cumin beans, kale slaw, avocado, cilantro, romesco sauce", 1300],
          ["Sesame Chicken Bowl", "Jasmine rice, crispy chicken with cassava flour breading, charred broccoli, sesame togarashi, green…", 1600],
          ["Power Bowl", "Wild rice blend from Lundberg Farms, farmer’s greens, hummus, sweet potatoes, avocado, pickled onions…", 1300],
          ["Burrito Bowl", "Jasmine rice, paprika chicken, cumin beans, chimichurri mushrooms & sautéd spinach, guac, jalapeño lime…", 1400],
          ["Evolved Caesar Salad", "Farmer’s greens, sliced radish, pastured egg, avocado, gluten-free croutons, cashew “parmesan,\" herb…", 1000],
          ["Citrus Salad", "Farmer's greens, seasonal citrus fruit slices, diced cucumber, pickled onions, avocado, almond slices…", 1200],
          ["Guac & Greens Salad", "Farmer's greens, black bean & corn salad, red cabbage, guacamole, paprika-dusted organic corn tortilla…", 1400],
          ["Grilled Chicken Salad", "Farmer's greens, grilled Mary's free-range chicken breast (cold), avocado, diced cucumber, pickled…", 1500]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Dark Chocolate Brownie", "Rich and fudgy brownie made with cassava and coconut flour, pastured eggs, and coconut sugar", 450],
          ["Chocolate Chip Cookie", "Dark chocolate chip cookie made with GF flour mix, egg, vanilla, and dark chocolate sweetened with…", 450],
          ["Dairy-Free Soft Serve", "Dairy-free soft serve made with a cashew cream base and sweetened with coconut sugar", 600]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Charred Broccoli", "Fresh broccoli roasted with extra virgin olive oil, garlic, ginger, and salt", 400],
          ["Za'atar Cauliflower", "Cauliflower florets tossed with za’atar spices, cooked in sustainable palm fruit oil", 500],
          ["Black Beans & Corn Salad (Cold)", "Black beans, organic corn, red onion, cilantro, and lime salad", 400],
          ["Kale Slaw", "Fresh kale and shredded cabbage in a house-made tomato vinaigrette", 400],
          ["Sweet Potatoes", "Sweet potatoes cooked with salt and extra virgin olive oil", 400],
          ["Chickpea Miso Eggplant", "Roasted eggplant in a savory chickpea miso sauce with garlic, ginger, and basil.", 500],
          ["Cumin Beans", "A blend of red & mayocoba beans, soaked overnight and cooked with cumin, onion, garlic, and bay leaf", 400],
          ["Hummus", "Creamy chickpea hummus made with garlic, extra virgin olive oil, and lemon juice", 400],
          ["1/2 Avocado", "Half avocado side order", 200],
          ["Jasmine Rice", "Long-grain jasmine rice", 400],
          ["Wild Rice Blend", "A blend of wild, brown, red, and black rice from Lundberg Family Farms", 500],
          ["Cauliflower Rice", "Riced cauliflower sautéed with turmeric, onions, garlic, and extra virgin olive oil", 500],
          ["Farmer's Greens", "A house-made blend of organic red leaf and arugula", 400],
          ["Chimichurri Mushrooms", "Cremini, oyster mushrooms and spinach cooked in a mild herb chimichurri sauce.", 400],
          ["Diced Cucumber", "Freshly diced cucumber", 400],
          ["Roasted Rainbow Carrots", "Oven-roasted baby rainbow carrots with thyme, olive oil, and salt.", 500],
          ["Plant Protein Patty", "House-made protein patty with black beans, gluten-free oats, almonds, pumpkin seeds, and flax seeds…", 500],
          ["Grilled Chicken Breast (cold)", "Mary's chicken breast, marinated in a lemon and salt water brine. Diced and served cold.", 600],
          ["Paprika Chicken", "Pasture-raised chicken thigh coated with a mild paprika spice blend, then lightly charred", 600],
          ["Picadillo Beef", "100% grass-fed and grass-finished beef simmered with mild spices, tomatoes, onions, and garlic in…", 800],
          ["Crispy Chicken", "Cassava flour breaded chicken, cooked in sustainably sourced palm fruit oil", 700],
          ["Grilled Salmon", "Sustainably sourced salmon grilled with salt and olive oil", 900],
          ["Avocado Goddess", "Creamy avocado-based dressing made with parsley, cilantro, tahini, ginger root, and extra virgin olive oil", 200],
          ["House Ketchup", "House ketchup made with tomatoes, garlic, and coconut sugar", 200],
          ["Chipotle Aioli", "Dairy-free aioli made with chipotle pepper, honey, and extra virgin olive oil", 200],
          ["Herb Ranch", "Savory ranch made with herbs, lemon juice, and aquafaba from garbanzo beans (vegan)", 200],
          ["Romesco Sauce", "Roasted bell pepper sauce made with sunflower seeds, garlic, lemon juice, and extra virgin olive oil", 200],
          ["Ginger Ponzu Sauce", "Soy-free ginger ponzu sauce, made with coconut aminos", 200],
          ["Lemon Vinaigrette", "Light and simple dressing, made with a lemon juice & olive oil base", 200],
          ["Jalapeno Lime Dressing", "Charred tomatillos and jalapeno dressing with cilantro and tahini.", 200]
        ]
      },
      {
        name: "Snacks",
        items: [
          ["Coracao Chocolate", "Organic dark chocolate bars from Coracao", 700]
        ]
      }
    ],
    hours: "Mon–Thu 11am–9pm, Fri–Sun 10am–9pm (brunch 10am–2pm)",
    orderUrl: "https://order.online/store/~42079739/",
    siteNote: "Menu and hours from kitava.com for this location; Kitava adds 5% to orders for staff healthcare."
  },
  'kiyomi-ca-phe': {
    sections: [
      {
        name: "Drinks",
        items: [
          ["Hanoi Egg Coffee", "Phin drip coffee, condensed milk, egg foam", 800],
          ["Ube Coconut Coffee", "Phin dripped coffee, condensed milk, ube coconut foam", 800],
          ["Saigon Einspanner", "Phin dripped coffee, condensed milk, salted cream foam", 800],
          ["Fish Sauce Caramel Coffee", "Fish sauce caramel with vanilla einspanner foam on Vietnamese iced coffee", 800],
          ["Pandan Coffee", "Pandan cream foam with Vietnamese iced coffee", 800],
          ["Matcha Latte", "Ceremonial grade matcha from Japan, milk", 800],
          ["Strawberry Matcha", "Layers of strawberry puree, milk and matcha", 800],
          ["Guava Matcha", "Layers of matcha, milk and sweet pink guava", 800],
          ["Matcha Einspanner", "Ceremonial grade matcha, condensed milk, salted cream foam", 800],
          ["Iced Pandan Coconut Cloud", "Iced coconut water with pandan cream foam", 875],
          ["Iced Ube Coconut Cloud", "Iced coconut water with ube coconut cream foam", 875],
          ["Iced Coconut Cloud", "Organic iced coconut water with coconut cream foam", 875]
        ]
      }
    ],
    orderUrl: "https://order.online/store/51474249",
    siteNote: "Menu and prices from their own online ordering page (order.online)."
  },
  'korean-papis-kitchen': {
    sections: [
      {
        name: "Mains",
        items: [
          ["Korean Papi's Taco", "Choice of protein, shredded red cabbage, kimchi, orange sawce, cilantro, sesame seeds", 1200],
          ["Korean Papi's Taco Trio", "3 Korean Papi's Tacos", 3299],
          ["Korean Papi's Burrito", "Protein choice, kimchi rice, cheese, red cabbage, orange sawce, cilantro, scallions, sesame", 2599],
          ["Korean Papi's Burrito Bowl", "Protein choice, kimchi rice, cheese, red cabbage, orange sawce, cilantro, scallions, sesame", 2599],
          ["Korean Papi's Kimchi Fried Rice", "Bulgogi, spam, kimchi rice, dried seaweed, scallions, sesame seeds", 2300],
          ["Korean Papi's Cheesesteak", "Bulgogi, cheese, grilled onions, jalapeños, kimchi, scallions, sesame seeds", 2599],
          ["Korean Papi's Q-Dilla", "Choice of protein, cheese, grilled onions, kimchi, scallions, sesame seeds", 2599]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Water", "", 399],
          ["Coke Zero", "", 399],
          ["Sprite", "", 399]
        ]
      }
    ],
    phone: "(628) 284-7343",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu and prices are from their Uber Eats store; the same seven dishes appear on the menu board on their own website (no prices there)."
  },
  'kung-fu-mala': {
    hours: "Daily 11:30am–12am",
    siteNote: "Hours are from their Google Maps and claimed Yelp listings, which agree."
  },
  'kusan-uyghur-cuisine-san-jose': {
    hours: "Mon–Fri 10:30am–2:30pm & 5–9pm, Sat–Sun 10:30am–3pm & 5–9pm",
    siteNote: "Hours from their Google Business listing for 1516 N 4th St, San Jose; Yelp agrees (Mon 10:30am–2:30pm …)."
  },
  'las-lomas-rib-palace': {
    hours: "Sat 9am–5pm only (pre-order 30 min ahead)",
    address: "Antioch, CA 94509",
    siteNote: "Hours from their Instagram bio and posts (@laslomasribpalace): open Saturdays only, 9am–5pm, Antioch."
  },
  'lavanta': {
    hours: "Sun–Thu 11am–10pm, Fri–Sat 11am–11pm; brunch Fri–Sun 9am–2pm",
    siteNote: "Hours are from their own website."
  },
  'lita-walnut-creek': {
    sections: [
      {
        name: "Starters",
        items: [
          ["Chips & Tropical Salsa", "House-made chips with tropical tomatillo salsa", 1200],
          ["Chips & Pineapple Guacamole", "House-made chips with charred pineapple guacamole", 1600],
          ["Fall Salad", "Seasonal greens, delicate , squash, jicama, pomegranate, heirloom, tomatoes, pepitas, apple cider vinaigrette", 1900],
          ["Lobster Corn Dog", "Battered Maine lobster tail, jerk aioli, makrut aioli, tamarind-tomato chutney", 3900],
          ["Di Stefano Burrata", "fuyu persimmom, chive pomegranate molasses, yuca chips", 2100]
        ]
      },
      {
        name: "Shareables",
        items: [
          ["Yum-Numb Salt & Pepper Shrimp", "Crispy shrimp, Szechuan pepper, crispy garlic, herbs", 1700],
          ["Salt Cod Fritters", "With jerk aioli", 2000],
          ["Crispy Marble Potatoes", "market aioli, chive , tobiko", 1900],
          ["Platanos Maduros", "", 1400],
          ["Jerk Mushroom Quesdilla", "Allspice-thyme butter, jerk marinade, queso Oaxaca", 1900],
          ["Brussel's Sprouts", "", 1500],
          ["Pork Belly Bao", "Braised pork belly, jerk marinade, Caribbean pickle, soft bao (2 pc)", 1600],
          ["Kids Quesadilla", "", 1500],
          ["Crispy Cho-Cho", "Chili lime, aïoli, fresh lemon", 1500]
        ]
      },
      {
        name: "Empanadas",
        items: [
          ["Coconut Curry Chicken Empanadas", "", 1600],
          ["Caribbean Beef Empanadas", "", 1600],
          ["Callaloo Empanadas", "", 1600]
        ]
      },
      {
        name: "Tacos",
        items: [
          ["Coconut Pork Belly Taco", "Roasted pineapple, Caribbean pickle, citrus crema", 1400],
          ["Jerk Chicken \"Trompo\" Taco", "Caramelized onion, jerk aioli, pineapple guacamole", 1100],
          ["Fried Wild Cod Taco", "Beer-battered rock cod, Caribbean slaw, pineapple guacamole", 1200],
          ["Two Oxtail Tacos", "With macaroni pie", 3000]
        ]
      },
      {
        name: "Dinner Plates",
        items: [
          ["Jerk Fillet Of Salmon", "Rice & peas, Caribbean slaw, platano maduro", 3600],
          ["Lita's Steak Dinner", "Black Angus skirt steak, rice & peas, green seasoning, maduro", 3800],
          ["Braised Oxtail", "Rice & peas, oxtail gravy, platano maduro", 4600],
          ["Black Pepper Shrimp", "Jumbo prawns, black pepper sauce, rice & peas, maduro, mango salsa", 3600],
          ["Curry Shrimp Pasta", "Linguine & shrimp, curry sauce, cherry tomato, spiced crumb", 3400],
          ["Callaloo Bowl", "Okra, spinach, squash, rice & peas, guacamole, slaw, maduro", 2400],
          ["Curry Goat", "Rice & peas, festival, platano maduro", 3100],
          ["Jerk Mushroom Bowl", "Rice & peas, pineapple guacamole, Caribbean slaw, maduro", 2400],
          ["Pan Seared Barramundi", "Clams, marble potatoes, sweet peppers, scotch-bonnet coconut broth", 3300],
          ["Autumn Risotto", "Butternut squash, braised cassava, parmesan", 2300]
        ]
      },
      {
        name: "Family Style",
        items: [
          ["Escovitch Fish", "Fried whole fish, Caribbean pickle, thyme", 4900],
          ["Half Jerk Chicken", "Available after 12pm*", 3500],
          ["12oz Tomahawk Pork Chop", "Snake River Farms Kurobuta chop, cho-cho hash, braised chicory, pork jus", 4700]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Caribbean Pineapple Cake (No IceCream)", "", 1500],
          ["Flourless Chocolate Passion", "", 1400],
          ["LITA's Doughnuts", "", 1200]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Macaroni Pie", "", 1300],
          ["1/2 Fall Salad", "", 1300],
          ["Crispy Sprouts", "", 1500],
          ["Rice & Peas", "", 1300],
          ["Braised Red Cabbage", "", 1100]
        ]
      },
      {
        name: "Additional Protein",
        items: [
          ["Side: Jerk Chicken", "", 1000],
          ["Side: Oxtail (1pc)", "", 1200],
          ["Side:  Skirt Steak", "", 2200],
          ["Side: Jerk Salmon", "", 1300],
          ["Side: Grilled Shrimp", "", 1300],
          ["Side: Callaloo", "", 900],
          ["Side: Jerk Mushroom", "", 1200]
        ]
      },
      {
        name: "Extras",
        items: [
          ["Chile Lime Chips", "", 600],
          ["Yucca Chips", "", 600],
          ["1/2 Yucca/Tortilla", "", 800],
          ["Fries (Seasoned)", "", 1100],
          ["Fries (Plain)", "", 1100],
          ["Tortillas (3)", "", 600],
          ["Solo Tortilla", "", 200],
          ["Side: Cole Slaw", "", 600],
          ["Side: Avocado", "", 300]
        ]
      }
    ],
    pricesEstimated: "Prices are from their Grubhub store; delivery apps often charge more than the counter.",
    siteNote: "Menu prices are from the LITA store on Grubhub linked from their own site; descriptions from their own menu page."
  },
  'lucys-crepes': {
    sections: [
      {
        name: "All-Day Breakfast",
        items: [
          ["Syrniki", "Cottage cheese, eggs, flour, sugar, vanilla, berry coulis, sour cream", 1800],
          ["Tomatello", "Grilled crusty bread, garlic, fresh basil, tomatoes", 1400],
          ["Pestofungo", "Grilled crusty bread, garlic, mushrooms, vegan pesto", 1400],
          ["Avocado Toast", "Grilled crusty bread, avocado, cream cheese, marinated onions, pickled radish, arugula", 1400]
        ]
      },
      {
        name: "Savory Crepes",
        items: [
          ["Special", "Cheddar, feta, tomato, green onions, baby spinach, lemon juice", 1500],
          ["Harvest Medley", "Cheddar, mushrooms, baked tofu, tomato, green onions, feta, spicy sauce, baby spinach", 1900],
          ["The Italian", "Mozzarella, marinara, roasted eggplant, tomato, spinach, lemon juice", 1700],
          ["Garden", "Roasted eggplant, tomato, olives, roasted bell pepper, arugula, vegan pesto", 1700],
          ["Avocado", "Mozzarella, tomato, avocado, lemon tahini sauce, spinach, onion", 1700],
          ["Plant Power", "Cheddar, plant-based meat, tomato, spinach, lemon juice", 1900],
          ["Veggie Pesto", "Mozzarella, tomato, vegan pesto, spinach, onion", 1600],
          ["Three Cheeses", "Cheddar, mozzarella, feta", 1200],
          ["Gluten-Free Buckwheat Crepe", "Add-on: gluten free butter (buckwheat flour)", 300]
        ]
      },
      {
        name: "Protein-Packed Crepes",
        items: [
          ["Flying Hawaiian", "Ham, sharp cheddar, pineapple, jalapeño, ranch sauce, spinach", 1700],
          ["Chipotle Crepe", "Chipotle sauce, chicken breast, cheddar, tomato, spinach", 1800],
          ["Pacific Ocean", "Salted salmon, mozzarella, romaine lettuce, capers", 2100],
          ["Pizza Style", "Mozzarella, pepperoni, tomato, arugula, black olives, marinara sauce", 1700],
          ["Blini Beef", "Ground beef, onions, sour cream", 1700],
          ["Blini Chicken Mushroom", "Mushrooms, chopped chicken, cheese", 1700],
          ["The Greek", "Gyros, cheddar, feta, pickles, green onion, lettuce, ranch dressing", 1900],
          ["Garlic Chicken Pesto", "Chopped chicken, mozzarella, tomato, red onion marinade, basil pesto", 1900]
        ]
      },
      {
        name: "Sweet Crepes",
        items: [
          ["Strawberry Nutella Cream", "Nutella, strawberry, sweet cream", 1600],
          ["Banana Nutella", "Nutella, banana", 1400],
          ["Fruity Nutella Cream", "Nutella, strawberry, banana, sweet cream", 1600],
          ["Blini a la Tiramisu", "Cocoa, ladyfingers, mascarpone, whipped cream", 1800],
          ["Cherry Cottage Blini", "Cottage cheese, sour cherry, sour cream", 1800],
          ["Berry Cream", "Sweet cream, blackberry, blueberry, strawberry, powdered sugar", 1600]
        ]
      },
      {
        name: "Soups",
        items: [
          ["Borsch (cup)", "Beets, cabbage, potatoes, carrots, onions. Bowl $10", 800],
          ["Lentil Soup (cup)", "Onions, carrots, celery, lentils, potatoes, tomato. Bowl $9", 700],
          ["Creamy Mushroom Soup (cup)", "Wild and cremini mushrooms, potatoes, onion, cheese, heavy cream. Bowl $12", 1000]
        ]
      },
      {
        name: "Salads",
        items: [
          ["Ukrainian Garden", "Beets, potatoes, carrots, pickles, peas", 1300],
          ["The Oasis", "Arugula, beets, marinated onions, pecans, cranberries", 1500]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Napoleon Cake Classic (slice)", "Homemade puff pastry, vanilla custard cream", 700],
          ["Honey Nuts Cake (slice)", "Honey, butter, whipped cream, vanilla, sour cream, walnuts", 750],
          ["Sochniki (piece)", "Pastry with cottage cheese and vanilla", 400],
          ["Meteorite (chocolate truffle)", "Cacao, condensed milk, vanilla, chocolate ganache", 500],
          ["Pavlova (slice)", "Meringue, berry, mascarpone, whipped cream", 650],
          ["Chocolate Honey Cake (slice)", "Honey, whipped cream, vanilla, cacao powder, mascarpone", 800]
        ]
      },
      {
        name: "Fresh Juices",
        items: [
          ["Apple Juice", "Organic apple", 800],
          ["Carrot Juice", "Organic carrots", 800],
          ["Ginger Shot (2oz)", "Organic ginger, organic lemon juice", 400],
          ["Ginger Shots (1L)", "Organic ginger, organic lemon juice", 2500],
          ["Sunset", "Apple, carrots, beets", 900],
          ["Green Delight", "Celery, cucumbers, spinach, kale, lemon", 800],
          ["Morning Power", "Kale, cucumbers, celery, parsley, apple, ginger shot, lemon", 800],
          ["Mint Lemonade", "Mint, lemon", 700]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["Strawberry Bliss", "Strawberries, banana, milk of choice, honey", 900],
          ["Berry Dream", "Mixed berries, banana, milk of choice, agave, vanilla", 900],
          ["Antioxidant Blast", "Blueberry, banana, oats, flaxseed, orange juice", 900],
          ["Tropical Rainbow", "Mango, banana, peach, strawberry, spinach, apple, orange juice", 900],
          ["Banana Choco-Nut", "Banana, chocolate, chia seeds, almond butter, milk of choice, agave, vanilla", 900],
          ["Mango", "Mango, mango syrup, orange juice", 900]
        ]
      }
    ],
    siteNote: "Menu and prices read from the menu images on the Menu page of lucyscrepes.com.",
    pricesEstimated: "Prices were read from photos of their own menu; worth confirming with the shop."
  },
  'lumpia-company': {
    hours: "Tue–Sat 12pm–9pm, Sun 11am–6pm, Closed Mon",
    siteNote: "Hours are from their own website (thelumpiacompany.com)."
  },
  'macs-by-icky': {
    sections: [
      {
        name: "Coffee & Espresso",
        items: [
          ["Latte", "From. Espresso + milk (add syrup +.50). Iced: regular 16oz, large 24oz +$1; hot: regular 16oz", 550],
          ["Mocha", "From. Espresso + white/dark chocolate sauce + milk. Iced: regular 16oz, large 24oz +$1; hot: regular 16oz", 600],
          ["Caramel Macchiato", "From. Milk + vanilla syrup + espresso + caramel drizzle. Iced: regular 16oz, large 24oz +$1; hot: regular", 600],
          ["Ube Latte", "From. Milk + house-made ube syrup + espresso. Iced: regular 16oz, large 24oz +$1; hot: regular 16oz", 650],
          ["Mac Nut Latte", "From. Espresso + coconut syrup + macadamia nut syrup + milk. Iced: regular 16oz, large 24oz +$1; hot", 650],
          ["Banana Latte", "From. Espresso + banana syrup + milk. Iced: regular 16oz, large 24oz +$1; hot: regular 16oz", 650],
          ["Buko Pandan Latte", "From. Milk + house-made buko pandan syrup + espresso. Iced: regular 16oz, large 24oz +$1; hot: regular 16oz", 650],
          ["Iced Pistachio Latte", "From. Espresso + pistachio syrup + milk + pistachio soft top; iced only, large +$1", 675],
          ["Iced Turon Latte", "From. Banana, espresso, milk, caramel, banana soft top, brûléed turon; iced only, large +$1", 675],
          ["Papa Puffs", "From. Iced coffee, vanilla, sweet cream soft top, chocolate puff cereal; iced only, large +$1", 650],
          ["Brewed Coffee", "Freshly brewed drip coffee", 450],
          ["Iced Coffee", "From. Black iced coffee; large +$1", 450],
          ["Matcha Latte", "From. Ceremonial grade matcha + milk + agave. Iced: regular 16oz, large 24oz +$1; hot: regular 16oz", 650],
          ["Cocoa", "From. Classic chocolate, white chocolate or ube. Iced: regular 16oz, large 24oz +$1; hot: regular 16oz", 500],
          ["Hot Tea", "Earl grey, English breakfast, green or spiced chai", 450],
          ["Milky", "From. Milk + flavor + sweet cream or chocolate soft top; iced only, large +$1", 600]
        ]
      },
      {
        name: "Lemonade & Iced Tea",
        items: [
          ["Calamansi Black Tea", "From. Calamansi purée, organic cane sugar + black iced tea ($6 / $7)", 600],
          ["Iced Black Tea", "From. Unsweetened or add flavor (+.50) ($5 / $6)", 500],
          ["50/50", "32oz. Half black tea + half fresh smashed lemonade + flavor of choice", 800],
          ["Lemonade", "32oz. Smashed lemon, water, organic cane sugar + up to 3 flavors", 800],
          ["Filipino Melon Juice", "From. Fresh shredded cantaloupe, cane sugar + water; Fri–Sun only ($6 / $7)", 600],
          ["Ube Thai Tea", "From. Ube syrup + coconut syrup + milk, topped with Thai iced tea ($6.50 / $7.50)", 650]
        ]
      },
      {
        name: "Croffles",
        items: [
          ["Classic Butter Croffle", "Plain butter croissant baked in a waffle maker", 450],
          ["Cinnamon Sugar Croffle", "Butter croffle dipped in cinnamon sugar", 500],
          ["Strawberry Croffle", "House whip, strawberry crunch, strawberries, white chocolate sauce; from 10am", 625],
          ["Cookies & Cream Croffle", "House whip, chocolate cookie crumble, choco sauce; from 10am", 625],
          ["Ube Croffle", "House whip, white chocolate pearls, ube halaya, ube condensed milk; from 10am", 700]
        ]
      },
      {
        name: "Halo Halo & Soft Serve",
        items: [
          ["OG Halo Halo", "Red beans, banana, jackfruit, macapuno, nata de coco, ube soft serve, leche flan; from 10am", 875],
          ["Ube All Day", "Ube jam, ube cake crumbs, ube condensed milk, ube soft serve, muddy mix; from 10am", 850],
          ["Soft Serve", "Vanilla, ube or swirl, cup or cake cone; from 10am", 400],
          ["Affogato", "Your choice of soft serve topped with a double shot of espresso", 450]
        ]
      },
      {
        name: "Pandesal Sandwiches",
        items: [
          ["Tocino Spam Pandesal", "Tocino-flavored Spam + mayo on pan de sal", 600],
          ["Ham & Cheese Pandesal", "Ham + cheddar + mayo on pandesal", 600],
          ["Corned Beef Pandesal", "Filipino-style corned beef + mayo on pandesal", 700],
          ["Bacon Egg & Cheese Ube Pandesal", "Bacon, egg + cheddar on ube pandesal", 725]
        ]
      }
    ],
    hours: "Mon 7am–1pm, Closed Tue, Wed–Fri 7am–6pm, Sat–Sun 8am–6pm",
    siteNote: "Menu and prices are from the in-store menu pictures on their own site (macsbyicky.store/pages/menu); hours are from Yelp and Restaurantji, which agree.",
    pricesEstimated: "Prices were read from photos of their own menu; worth confirming with the shop."
  },
  'macs-old-house': {
    sections: [
      {
        name: "Breakfast",
        items: [
          ["Steak and Eggs", "Steak with eggs your style, crispy or regular potatoes, and toast.", 1957],
          ["Chicken Fried Steak", "Breaded fried steak with eggs, potatoes and toast.", 1854],
          ["Eggs Benedict", "With bacon, ham, or sausage on an English muffin.", 1957],
          ["Denver Omelette", "Bell pepper, onion, and cheese, with potatoes and toast.", 1545],
          ["Ham and Cheese Omelette", "With potatoes and choice of toast.", 1545],
          ["Full Stack Pancakes", "Three pancakes with choice of eggs and meat.", 1648],
          ["French Toast (3 pieces)", "With choice of eggs and meat.", 1648],
          ["French Toast (2 pieces)", "With choice of eggs and meat.", 1236],
          ["Short Stack", "Pancakes with choice of eggs and meat.", 1236],
          ["Classic Mac", "Cheddar macaroni with toast, eggs, potatoes, and meat.", 1339],
          ["Mac Scramble", "Eggs with toast, potatoes, and bacon, ham, or sausage.", 1339]
        ]
      },
      {
        name: "Soup or Salad",
        items: [
          ["Soup & Salad Special", "Single serving.", 1267],
          ["Pasta", "With meat sauce and plenty of hot bread.", 1267],
          ["Italian Salad", "Mac's house dressing with plenty of hot bread.", 1373]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["Prime Rib Sandwich", "Choice of salad, pasta or veggies.", 2434],
          ["Extra Cut Prime Rib Sandwich", "Choice of salad, pasta or veggies.", 2752],
          ["Ribeye Steak Sandwich", "Choice of salad, pasta or veggies.", 2434],
          ["Calamari Steak Sandwich", "Choice of salad, pasta or veggies.", 1691],
          ["Italian Sausage Sandwich", "Choice of salad, pasta or veggies.", 1585],
          ["Ground Round Sandwich", "Choice of salad, pasta or veggies.", 1585],
          ["Grilled Chicken Breast Sandwich", "Choice of salad, pasta or veggies.", 1585]
        ]
      },
      {
        name: "Luncheon Specials",
        items: [
          ["Mac's Famous Caesar Salad", "Romaine, shredded parmesan and croutons in creamy Caesar dressing.", 1267],
          ["Lunch Special", "With pasta or fries.", 1643],
          ["Polish Sausage Sandwich", "Grilled Polish sausage with mayo, mustard, lettuce, tomato on sourdough.", 1479],
          ["Hot Link Sandwich", "Grilled hot links on a soft roll.", 1479],
          ["Cheeseburger", "Served with potato salad.", 1585]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["Kids Pasta Dinner & Veggies", "Under 12; includes a soft drink.", 927],
          ["Kids Mac 'N Cheese & Fries", "Under 12; includes a soft drink.", 927],
          ["Kids Hot Dog & Fries", "Under 12; includes a soft drink.", 927],
          ["Kids Chicken Tenders & Fries", "Under 12; includes a soft drink.", 927],
          ["Kids Burger & Fries", "Under 12; includes a soft drink.", 927]
        ]
      },
      {
        name: "Beverages",
        items: [
          ["Coffee", "", 318],
          ["Iced Tea", "", 309],
          ["Hot Tea", "", 309],
          ["Lemonade", "", 309],
          ["Soda", "", 309],
          ["Juice - Small", "Orange, cranberry, or pineapple.", 309],
          ["Juice - Large", "Orange, cranberry, or pineapple.", 412],
          ["Milk - Small", "", 309],
          ["Milk - Large", "", 412]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/mac's-old-house-antioch-51643849/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their DoorDash store (3100 E 18th St, Antioch); it covers breakfast, lunch, sandwiches and kids items but not the dinner (prime rib) menu."
  },
  'manakish-oven': {
    sections: [
      {
        name: "Starters",
        items: [
          ["Cheese Fries", "Crispy Seasoned Fries, topped with Cheese and baked to a perfect melt!", 1495],
          ["Shawarma Fries - Chicken", "Crispy Seasoned Fries, topped with Cheese and Chicken Shawarma then baked to a perfect melt!", 1799],
          ["Shawarma Fries - Tri Tip", "Crispy Seasoned Fries, topped with Cheese and Tri Tip Shawarma then baked to a perfect melt!", 1899],
          ["Spicy Harissa Fries", "Crispy Seasoned Fries, topped with Cheese, Red Onions & Cilantro, then baked to a perfect melt!", 1599],
          ["Hummus with Fresh Pita", "Served with warm Pita Bread. Garnished with Chickpeas & Summac.", 1195],
          ["Baba Ganoush with Fresh Pita", "Served with warm Pita Bread. Roasted Eggplant dip garnished with diced Tomatoes & Smoked Paprika.", 1295],
          ["Jalapeno Cilantro Hummus with Fresh Pita", "Served with warm Pita Bread. Garnished with sliced Jalapeno.", 1195],
          ["Tabouleh with Fresh Pita", "Served with warm Pita Bread. Made with Parsley, Bulgur, Tomatoes, Onions & Cucumbers.", 1095],
          ["Labne with Fresh Pita", "Served with warm Pita Bread. Kefir dip made with Dried Mint, Cucumbers and garnished with Olives.", 1095],
          ["Tomato Cucumber Salad", "Olive Oil, Lemon Juice & Dried Mint.", 1095],
          ["Fatoush Salad Small", "Lettuce, Tomatoes, Cucumbers, Red Onions, Bell Peppers, Sliced Lemons, Fresh Mint & Za'atar Pita Chips.", 1095],
          ["Fatoush Salad Large", "Lettuce, Tomatoes, Cucumbers, Red Onions, Bell Peppers, Sliced Lemons, Fresh Mint & Za'atar Pita Chips.", 1495],
          ["Red Lentil Soup", "Creamy & rich Red Lentil Soup, served with sliced lemon.", 995],
          ["Falafel Balls (10 Balls)", "Crispy Falafel Balls served on a bed of lettuce and side of Tahini sauce.", 1595]
        ]
      },
      {
        name: "Fatteh Bowls",
        items: [
          ["Chicken Shawarma Bowl", "From Chicken Shawarma, Hummus, Tomato Cucumber Salad, Garlic Sauce, Pickles & Turnips.", 1799],
          ["Tri Tip Shawarma Bowl", "From Tri Tip Shawarma, Hummus, Tomato Cucumber Salad, Tahini Sauce, Pickles & Turnips.", 1999],
          ["Cauliflower Eggplant Bowl", "From Roasted Cauliflower & Eggplant, Hummus, Tomato Cucumber Salad, Harissa Sauce, Pickles & Turnips.", 1799],
          ["Falafel Bowl", "From Crispy Falafel Balls, Hummus, Tomato Cucumber Salad, Tahini Sauce, Pickles & Turnips.", 1799]
        ]
      },
      {
        name: "Wraps",
        items: [
          ["Chicken Shawarma Wrap", "Lavash bread, Hummus Spread, Chicken Shawarma, Lettuce, Cucumbers, Tomatoes, Onions, Pickles", 1999],
          ["Tri Tip Shawarma Wrap", "Lavash bread, Hummus Spread, Beef Shawarma, Lettuce, Cucumbers, Tomatoes, Onions, Pickles, Turnips", 2199],
          ["Falafel Wrap", "Lavash bread, Hummus Spread, Crispy Falafels, Lettuce, Cucumbers, Tomatoes, Onions, Pickles", 1999],
          ["Cauliflower Eggplant Wrap", "Lavash bread, Hummus Spread, Cauliflower, Eggplant, Lettuce, Cucumbers, Tomatoes, Onions, Pickles", 1999],
          ["Chicken Kebab Wrap", "Lavash bread, Hummus Spread, Grilled Chicken Kebab, Lettuce, Cucumbers, Tomatoes, Onions, Pickles", 2099],
          ["Kefta Kebab Wrap", "Lavash bread, Hummus Spread, Grilled Kefta Kebab, Lettuce, Cucumbers, Tomatoes, Onions, Pickles", 2199],
          ["Lamb Kebab Wrap", "Lavash bread, Hummus Spread, Grilled Lamb Kebab, Lettuce, Cucumbers, Tomatoes, Onions, Pickles", 2299]
        ]
      },
      {
        name: "Kebab Plates",
        items: [
          ["Chicken Kebab Plate", "Served with Rice, Hummus, Cucumber Tomato Salad, Pickles, Turnips, Garlic Sauce & Warm Pita Bread.", 2499],
          ["Kefta Kebab Plate", "Served with Rice, Hummus, Cucumber Tomato Salad, Pickles, Turnips, Tahini Sauce & Warm Pita Bread.", 2599],
          ["Lamb Kebab Plate", "Served with Rice, Hummus, Cucumber Tomato Salad, Pickles, Turnips, Tahini Sauce & Warm Pita Bread.", 2699],
          ["Chicken Kebab Salad", "Chicken Kebab Skewer served over Fatoush Salad, garnished with lemons, mint & Za'atar Pita Chips.", 2199],
          ["Kefta Kebab Salad", "Kefta Kebab Skewer served over Fatoush Salad, garnished with lemons, mint & Za'atar Pita Chips.", 2299],
          ["Lamb Kebab Salad", "Lamb Kebab Skewer served over Fatoush Salad, garnished with lemons, mint & Za'atar Pita Chips.", 2399]
        ]
      },
      {
        name: "Manakish Flatbreads",
        items: [
          ["Zaatar & Cheese Manakish", "Za'atar & Olive Oil mix & hand shredded Mozzarella Cheese. Garnished with Kalamata Olives.", 1900],
          ["Zaatar & Whipped Kefir Manakish", "Za'atar & Olive Oil Mix. Garnished with Whipped Kefir (Labneh), Tomato cucumber salad & Kalamata Olives.", 1900],
          ["Zaatar & Olives Manakish", "Za'atar & Olive Oil Mix. Garnished with Tomato cucumber salad & Kalamata Olives.", 1800],
          ["Cheese & Olives Manakish", "Hand shredded Mozzarella Cheese. Garnished with Kalamata Olives & Parsley.", 1700],
          ["Lahm-bajin Manakish", "Ground Beef, Bell Peppers, Onions, Seven Spice & ground Cardamom. Garnished with fresh parsley.", 2200],
          ["Chicken Shawarma Manakish", "Hummus & Chicken Shawarma with Garlic Sauce, Tomato Cucumber salad, Pickles & Turnips.", 2300],
          ["Tri Tip Shawarma Manakish", "Hummus & Tri Tip Shawarma with Tahini Sauce, Tomato Cucumber salad, Pickles & Turnips.", 2400],
          ["Cauliflower Eggplant Manakish", "Creamy Hummus, Roasted Cauliflower & Eggplant.", 2300],
          ["Baked Falafel Manakish", "Creamy Hummus & Crispy Falafel Balls.", 2300],
          ["Chicken & Cheese Manakish", "Hand Shredded Mozzarella Cheese, Chicken Shawarma, Red Onions & Cilantro. Garnished with Garlic Sauce.", 2300],
          ["Tri Tip & Cheese Manakish", "Hand Shredded Mozzarella Cheese, Tri Tip Shawarma, Red Onions & Cilantro. Garnished with Tahini Sauce.", 2400],
          ["Sujuk & Cheese Manakish", "Hand Shredded Mozzarella Cheese, Spicy Lebanese Sujuk (Sausage), Red Onions & Cilantro.", 2400],
          ["Cauliflower Eggplant & Cheese Manakish", "Hand Shredded Mozzarella Cheese, Roasted Cauliflower, Eggplant, Red Onions & Cilantro.", 2200],
          ["Cheese & Veggies Manakish", "Hand Shredded Mozzarella Cheese, Bell Peppers, Onions, Tomatoes & Kalamata Olives.", 2000],
          ["Classic Pepperoni Manakish", "Shakshuka Sauce, Mozzarella Cheese, Halal Beef Pepperoni & Dried Herbs.", 2200],
          ["Super Supreme Manakish", "Shakshuka sauce, mozzarella, halal beef pepperoni, halal beef salami and more.", 2400],
          ["Veggie Supreme Manakish", "Shakshuka sauce, mozzarella, bell peppers, onions, tomatoes, Kalamata olives and more.", 2200],
          ["Margarita Manakish", "Shakshuka Sauce, Hand Shredded Mozzarella Cheese & Dried Herbs.", 2000]
        ]
      },
      {
        name: "Brunch (Tue–Sun 10am–3pm)",
        items: [
          ["Moroccan Shakshouka", "", 2000],
          ["Sujuk Omelette", "3 Egg Omelette with Spicy Lebanese Sujuk, Bell Peppers, Onions & Mozz Cheese. Served with Warm Pita bread.", 2000],
          ["Vegetable Omelette", "3 Egg Omelette with Tomatoes, Bell Peppers, Onions, Kalamata Olives, Mozz Cheese & Feta Cheese.", 1650],
          ["Cheese Omelette", "3 Egg Omelette with Mozz Cheese & Feta Cheese. Served with Warm Pita Bread.", 1600]
        ]
      },
      {
        name: "Add-Ons",
        items: [
          ["Fries", "", 699],
          ["Freshly Baked Pita Bread", "", 450],
          ["Chicken Shawarma Add On", "", 1199],
          ["Beef Shawarma Add On", "", 1399],
          ["Cauliflower & Eggplant Add On", "", 1199],
          ["Chicken Kebab Skewer Add On", "", 1599],
          ["Kefta Kebab Skewer Add On", "", 1699],
          ["Lamb Kebab Skewer Add On", "", 1799],
          ["Cucumber Pickles Add On", "", 700],
          ["Turnips Add On", "", 700],
          ["Kalamata Olives Add On", "", 700],
          ["Hot Chili Sauce Add On", "", 700],
          ["Tahini Sauce Add On", "", 700],
          ["Harissa Sauce Add On", "", 700],
          ["Garlic Sauce Add On", "", 700],
          ["Summac Dressing Add On", "", 700],
          ["White Rice Add On", "", 700],
          ["Authentic Toum Dip 8oz", "", 1500]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["3 Walnut Baklava", "", 950],
          ["3 Pistachio Baklava", "", 1050]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Freshly Squeezed Lemonade", "Lemonade Made Fresh Daily with a Touch of Rose Water", 1000],
          ["Freshly Squeezed Mint Lemonade", "", 1000],
          ["Freshly Squeezed Orange Juice", "", 1000],
          ["Fresh Strawberry Juice", "", 1000],
          ["Yogurt Drink Regular", "", 375],
          ["Yogurt Drink Mint", "", 375],
          ["Mango Lassi", "", 375],
          ["Freez Mix", "", 375],
          ["Tea's Tea", "", 400],
          ["Vimto", "", 375],
          ["Barbican Malt Beverage", "", 375],
          ["Imported Soda", "", 375],
          ["Celsius", "", 375],
          ["Flavored Sparkling Water", "", 375],
          ["Pepsi", "", 275],
          ["Diet Pepsi", "", 275],
          ["Hot Mint Tea", "", 400],
          ["Water Bottle", "", 275]
        ]
      }
    ],
    orderUrl: "https://manakishoven.com/menu/walnut-creek",
    siteNote: "Menu and prices from the Walnut Creek online ordering menu on manakishoven.com."
  },
  'mar-y-mar': {
    sections: [
      {
        name: "Tacos",
        items: [
          ["Regular Taco", "From. With spicy salsa", 300],
          ["Taco con Queso", "From. Regular taco with cheese", 400],
          ["Taco con Queso y Crema", "From. Regular taco with cheese & sour cream", 400],
          ["Taco Super", "From. Regular taco with cheese, sour cream & guacamole", 500],
          ["Taco de Pescado", "From. Fish taco", 500],
          ["Regular Taco Vegetariano", "From. Lettuce, pico de gallo, rice, beans, cheese", 400],
          ["Super Taco Vegetariano", "From. Lettuce, pico de gallo, rice, beans, cheese, sour cream & guacamole", 500],
          ["Taco de Camarón", "From. Shrimp taco", 500],
          ["Taco Especial", "From", 450],
          ["Taco de Camarón con Queso", "", 600],
          ["Taco Super de Camarón", "", 700],
          ["Taco Super de Pescado", "", 700],
          ["Taco de Tortilla Hecha a Mano", "From. Taco on a handmade tortilla", 400],
          ["Tostada con Carne", "From", 650],
          ["Taco de Birria", "", 550]
        ]
      },
      {
        name: "Burritos",
        items: [
          ["Burrito Regular", "From. Meat, rice, beans & pico de gallo", 1100],
          ["Burrito con Queso", "From. Regular with cheese", 1250],
          ["Burrito con Queso y Crema", "From. Regular with cheese & sour cream", 1250],
          ["Burrito Super", "From. Regular with cheese, sour cream & guacamole", 1300],
          ["Regular Burrito Vegetariano", "From", 1000],
          ["Super Burrito Vegetariano", "From", 1200],
          ["Regular Burrito Mojado", "From. Green or red sauce over your choice of burrito", 1300],
          ["Super Burrito Mojado", "From. Green or red sauce over your choice of burrito", 1500],
          ["Burrito Mar y Tierra", "From", 1700],
          ["Burrito de Camarón", "Shrimp burrito", 1600],
          ["Burrito de Pescado", "Fish burrito", 1700],
          ["Burrito Frijol y Queso", "Bean & cheese", 650]
        ]
      },
      {
        name: "Botanas / Appetizers",
        items: [
          ["Botana de Camarón", "From. Shrimp, with lettuce, onion, tomato, avocado & orange with lime & salt", 2300],
          ["Botana de Pulpo", "From. Octopus, with lettuce, onion, tomato, avocado & orange with lime & salt", 2300],
          ["Botana de Ceviche", "From. Fish, with lettuce, onion, tomato, avocado & orange with lime & salt", 2300],
          ["Super Nachos", "From. Choice of meat, fried beans, guacamole, cheese, sour cream & pico de gallo", 1600],
          ["Combinada", "Sampler", 2500],
          ["Calamari", "From", 1400],
          ["Frijoles Especiales con Carne", "From", 1300],
          ["Aguachiles", "From", 1800],
          ["Camarones Mar y Mar", "", 3000]
        ]
      },
      {
        name: "Caldos",
        items: [
          ["7 Mares Soup", "From. Seven seas seafood soup", 2400],
          ["Caldo de Camarón", "From. Shrimp soup", 2000],
          ["Caldo de Pescado", "From. Fish soup", 2300],
          ["Birria de Res", "From. Beef birria", 1700],
          ["Menudo", "From", 1600]
        ]
      },
      {
        name: "Camarones",
        items: [
          ["Camarón a la Diabla", "From. In spicy sauce; with rice, beans & salad", 2200],
          ["Camarón a la Española", "From. Wrapped with bacon, cheese & bell pepper; with rice, beans & salad", 2500],
          ["Camarón a la Plancha", "From. Grilled; with rice, beans & salad", 2000],
          ["Camarones Empanizados", "From. Breaded; with rice, beans & salad", 2200],
          ["Camarones Rancheros", "From. Pico de gallo and mushrooms; with rice, beans & salad", 2200],
          ["Camarones al Mojo de Ajo", "Garlic shrimp", 2200],
          ["Fajitas de Camarón", "Shrimp fajitas", 2200],
          ["Pulpo a la Plancha", "Grilled octopus", 2500]
        ]
      },
      {
        name: "Filete de Pescado",
        items: [
          ["Filete al Mojo de Ajo", "From. Fish fillet in buttery garlic sauce", 2000],
          ["Filete a la Diabla", "From. Fish fillet in spicy sauce", 2000],
          ["Filete a la Plancha", "From. Grilled fish fillet", 2000],
          ["Filete Empanizado", "From. Breaded fish fillet", 2000],
          ["Filete Veracruz", "From. Veracruz style", 2200],
          ["Trucha a la Plancha", "Grilled trout", 2000]
        ]
      },
      {
        name: "Mariscos",
        items: [
          ["Huachinango Frito", "From. Fried red snapper", 2300],
          ["Huachinango al Mojo de Ajo", "From. Red snapper in garlic sauce", 2400],
          ["Huachinango a la Diabla", "From. Red snapper in spicy sauce", 2400],
          ["Huachinango a la Veracruzana", "From. Red snapper, Veracruz style", 2500],
          ["Bagre Frito", "From. Fried catfish", 2000],
          ["Bagre al Mojo de Ajo", "From. Catfish in garlic sauce", 2100],
          ["Bagre a la Diabla", "From. Catfish in spicy sauce", 2100],
          ["Bagre a la Veracruzana", "From. Catfish, Veracruz style", 2300],
          ["Mojarra Frita", "Fried tilapia", 1900],
          ["Mojarra al Mojo de Ajo", "From. Tilapia in garlic sauce", 2100],
          ["Mojarra a la Diabla", "From. Tilapia in spicy sauce", 2100],
          ["Mojarra a la Veracruzana", "From. Tilapia, Veracruz style", 2300],
          ["Ostiones (1/2 Dozen)", "Oysters", 1500],
          ["Ostiones (1 Dozen)", "Oysters", 2800]
        ]
      },
      {
        name: "Cocteles & Tostadas",
        items: [
          ["Med Camarón Coctel", "From. Medium shrimp cocktail", 1500],
          ["Med Pulpo Coctel", "From. Medium octopus cocktail", 1500],
          ["Med Pulpo / Camarón Coctel", "From. Medium octopus & shrimp cocktail", 1500],
          ["Grande Camarón Coctel", "From. Large shrimp cocktail", 1700],
          ["Grande Pulpo Coctel", "From. Large octopus cocktail", 1700],
          ["Grande Pulpo / Camarón Coctel", "From. Large octopus & shrimp cocktail", 1700],
          ["Campechana", "From. Large shrimp, octopus and oyster cocktail", 2000],
          ["Ceviche Tostada", "From. Fish", 500],
          ["Camarón Tostada", "From. Shrimp", 600],
          ["Marlin Tostada", "From", 600],
          ["Pulpo Tostada", "From. Octopus", 700],
          ["Salpicón Tostada", "From. Shrimp & octopus mixture", 700],
          ["Tostada de Camarón y Pulpo", "", 700],
          ["Combinada Tostada", "From. Fish, shrimp & octopus", 1000]
        ]
      },
      {
        name: "Platillos / Plates",
        items: [
          ["Carne Asada", "From. Grilled steak; with rice, beans & salad", 2000],
          ["Pollo Asado", "From. Grilled chicken; with rice, beans & salad", 1900],
          ["Fajitas de Pollo", "From. Chicken fajitas", 2200],
          ["Fajitas de Res", "From. Beef fajitas", 2200],
          ["Fajitas Mixtas", "From. Shrimp, chicken and steak fajitas", 2400],
          ["Enchiladas (3)", "From. Choice of chicken, beef or cheese", 2300],
          ["Chile Verde", "From. Pork in green sauce", 2000],
          ["Chile Colorado", "From. Beef in red sauce", 2000],
          ["Carne Tampiqueña", "From. Juicy steak with two cheese enchiladas", 2400],
          ["Carne a la Veracruzana", "From. Beef with bell pepper, tomato, onions, olives and mushrooms", 2300],
          ["Milanesa", "From. Breaded steak", 2000],
          ["Texana", "From. Steak sautéed with onions, serrano chile & mushrooms", 2300],
          ["Pollo a la Naranja", "From. Chicken in orange sauce", 2200],
          ["Pollo Empanizado", "From. Breaded chicken", 2000],
          ["Carne Ranchero", "", 2000],
          ["Arrachera", "Skirt steak", 2800],
          ["Tampiqueña con Arrachera", "", 3200]
        ]
      },
      {
        name: "Desayunos / Breakfast",
        items: [
          ["Huevos a la Mexicana", "From", 1500],
          ["Chilaquiles", "From", 1500],
          ["Huevos con Chorizo", "From", 1500],
          ["Huevos Rancheros", "From", 1500],
          ["Machaca", "From", 1600],
          ["Huevos con Jamón", "From. Eggs with ham", 1500],
          ["Huevos con Tocino", "From. Eggs with bacon", 1500]
        ]
      },
      {
        name: "Quesadillas",
        items: [
          ["Maíz Quesadilla", "From. Corn tortilla & cheese", 300],
          ["Quesadilla de Maíz con Carne", "From. Corn tortilla, cheese & meat", 400],
          ["Quesadilla Maíz de Camarón", "Corn tortilla with shrimp", 600],
          ["Harina Quesadilla", "From. Flour tortilla & cheese", 600],
          ["Suiza Quesadilla", "From. Flour tortilla with cheese & choice of meat", 1000],
          ["Quesadilla Super", "From", 1300],
          ["Quesadilla de Camarón", "From. Shrimp quesadilla", 1500]
        ]
      },
      {
        name: "Tortas",
        items: [
          ["Torta Mexicana", "From. Choice of meat, tomato, sour cream and guacamole", 1100],
          ["Torta Milanesa", "From", 1400],
          ["Torta Arrachera", "", 1500]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["Corn Quesadilla", "From", 700],
          ["Flour Quesadilla", "From", 700],
          ["Chicken Nuggets", "", 800],
          ["Fish Sticks", "From", 900]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Chips", "", 99],
          ["Extra Chips y Salsa", "From", 200],
          ["Orden de Arroz", "From. Rice", 500],
          ["Orden de Frijoles", "From. Beans", 500],
          ["Orden de Arroz y Frijoles", "From. Rice & beans", 500],
          ["Papas a la Francesa", "From. French fries", 500],
          ["Tacos de Frijol (3)", "From. Bean tacos", 500],
          ["Guacamole", "", 900],
          ["Frijoles Especiales", "From", 1100],
          ["Consomé", "", 700]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Botella de Agua", "Bottled water", 130],
          ["Agua Fresca", "", 400],
          ["Limonada", "", 300],
          ["Iced Tea", "", 300],
          ["Tea", "", 250],
          ["Café / Coffee", "", 400],
          ["Hot Chocolate", "", 300],
          ["Leche / Milk", "", 250],
          ["Jugo de Manzana", "Apple juice", 300],
          ["Jugo de Naranja (Med)", "Orange juice", 550],
          ["Jugo de Naranja (Large)", "Orange juice", 700],
          ["Smoothie", "", 700],
          ["Soda de Lata", "Canned soda", 300],
          ["Soda de Botella", "Bottled soda", 400],
          ["Mineral Preparado", "", 600],
          ["Red Bull", "", 550]
        ]
      }
    ],
    hours: "Sun–Thu 9am–9pm, Fri–Sat 9am–10pm",
    phone: "(650) 225-0516",
    orderUrl: "https://marymar.menufy.com/order",
    siteNote: "Menu, prices and hours are from Mar y Mar's own Menufy ordering site; Google's listing shows the same hours."
  },
  'master-oh': {
    hours: "Mon–Fri 11am–2:30pm, 5–10pm; Sat–Sun 11am–10pm",
    siteNote: "Hours from their own website, master-oh.com."
  },
  'maymays-cravings': {
    sections: [
      {
        name: "Fizzy Fruit Tea and Cream Tea Soda",
        items: [
          ["Blueberry Lemon Fizz", "", 850],
          ["Dragon Fruit Fizz", "", 850],
          ["Lychee Grape Fizz", "", 850],
          ["Mango Cream Soda", "", 900],
          ["Mango Passion Fruit Fizz", "", 850],
          ["Matcha Cream Soda", "Rich matcha blended with fizzy soda, topped with a creamy layer for a refreshing twist on a classic favorite", 900],
          ["Strawberry Cream Soda", "", 900],
          ["Strawberry Yuzu Fizz", "", 850],
          ["Ube Cream Soda", "", 900],
          ["Yuzu Cream Soda", "", 900]
        ]
      },
      {
        name: "Maymay Craves Mango",
        items: [
          ["Mango Pomelo Sago Dessert", "Sweet mango chunks and juicy pomelo segments in creamy tapioca pudding", 1200],
          ["Mango Sticky Rice", "Sweet sticky rice topped with fresh mango slices and a drizzle of coconut milk.", 1200],
          ["Mango Sticky Rice Drink", "Sweet mango puree blended with creamy coconut milk, topped with sticky rice and fresh mango chunks", 1200]
        ]
      },
      {
        name: "Cantonese Desserts",
        items: [
          ["Creamy Tofu Pudding with Coconut Milk and Taro Balls", "Silky tofu pudding paired with chewy taro balls and black pearls, drizzled with rich coconut milk", 1500],
          ["Iced Taro Balls and Milk", "Taro balls, red beans, and grass jelly served with milk", 1400],
          ["Iced Taro Balls with Boba, Sago, Grass Jelly, Red Bean, and Taro Paste", "Chewy taro balls, boba, sago, grass jelly, red beans, and smooth taro paste topped with a drizzle of milk", 1800],
          ["Iced Taro Balls with Boba, Sago, Grass Jelly, and Red Bean", "Chewy taro balls with boba, sago, grass jelly, and sweet red beans", 1700],
          ["Mochi Milk with Mango", "Chewy mochi pieces with fresh mango, accompanied by silky tofu pudding and sweet tapioca pearls", 1300],
          ["Mochi Milk with Red Bean and Boba", "Soft mochi, sweet red beans, and chewy boba pearls in creamy milk", 1400],
          ["Mochi Milk with Taro Balls", "Soft mochi with chewy taro balls, complemented by tender tofu pudding and tapioca pearls", 1300],
          ["Tofu Pudding with Coconut Milk and Sago", "Silky tofu pudding paired with creamy coconut milk, chewy sago pearls, and vibrant sweet potato and taro cubes", 1400]
        ]
      },
      {
        name: "Rice Bowls",
        items: [
          ["Chicken Adobo", "Tender beef in peanut sauce with vegetables and toasted shrimp paste over rice. Contains peanuts", 1700],
          ["Japanese Chicken Curry", "Tender beef chunks, carrots, and potatoes in a savory curry sauce, served with steamed white rice", 1800],
          ["Pork Adobo", "Tender pork bites marinated in tangy soy sauce and vinegar, paired with aromatic garlic and peppercorns…", 2000],
          ["Pork Sinigang Rice Bowl", "", 2000]
        ]
      },
      {
        name: "Filipino Congee (Lugaw)",
        items: [
          ["Arroz Caldo", "Filipino Arroz Caldo now available", 1400],
          ["Filipino Congee (Lugaw) with Egg", "Creamy rice porridge topped with soft-boiled egg, crispy garlic bits, and fresh green onions", 1000]
        ]
      },
      {
        name: "Filipino Sago Desserts",
        items: [
          ["Buko Pandan", "Tender young coconut strips combined with pandan-flavored jelly cubes in a creamy mixture", 1100],
          ["Mango Sago", "Creamy tapioca pudding with sweet mango chunks", 1100],
          ["Strawberry Sago", "Creamy tapioca pudding with sweet strawberry slices", 1100],
          ["Taho", "Silken tofu layered with caramelized brown sugar syrup and chewy sago pearls", 1000],
          ["Ube Sago", "Rich purple yam pudding with chewy tapioca pearls and soft purple jelly cubes", 1100],
          ["Ube Taho", "Silken tofu layered with purple yam syrup and chewy sago pearls, creating a creamy and vibrant dessert", 1000]
        ]
      },
      {
        name: "Onigiris",
        items: [
          ["Spicy Tuna Onigiri", "Spicy", 550],
          ["Tuna Mayo Onigiri", "Seasoned rice filled with tuna and creamy mayonnaise, wrapped in a crisp seaweed sheet", 550],
          ["Unagi Onigiri", "Grilled eel wrapped in seasoned rice and nori seaweed", 575]
        ]
      },
      {
        name: "Matcha",
        items: [
          ["Blueberry Matcha", "Real blueberry mixed with our signature Kyoto Uji Matcha", 950],
          ["Mango Matcha", "Matcha with mango. Choice of ice and sweetness level", 900],
          ["Strawberry Matcha", "Tropical fusion of strawberry and matcha. Customize ice and sweetness levels to your preference", 900],
          ["Ube Matcha", "Ube matcha drink with customizable ice and sweetness levels. Choose from no ice, less ice, normal ice, and…", 900]
        ]
      },
      {
        name: "Creamy Lattes",
        items: [
          ["Creamy Lavender Latte", "Smooth lavender-infused latte with customizable ice and sweetness levels", 800],
          ["Creamy Rose Latte", "Rose-infused coffee latte, customizable ice and sweetness levels", 700],
          ["Creamy Ube Latte", "Creamy ube latte with choices for ice and sweetness levels. Ube is a purple yam used in Filipino cuisine", 800]
        ]
      },
      {
        name: "Protein Tea Latte",
        items: [
          ["Matcha Tea Protein Latte", "Matcha tea protein latte with customizable ice and sweetness levels", 1100]
        ]
      },
      {
        name: "Yogurt Drinks",
        items: [
          ["Mango Yogurt Green Tea", "Mango yogurt drink with choice of ice and sweetness levels", 800],
          ["Plain Yogurt Green Tea", "Plain yogurt served with customizable ice levels and sweetness levels", 800],
          ["Strawberry Yogurt Green Tea", "Strawberry yogurt with customizable ice and sweetness levels. Options: No Ice, Less Ice, Normal Ice; None…", 800]
        ]
      },
      {
        name: "More Drinks",
        items: [
          ["Dragon Fruit Green Tea", "Dragon fruit green tea. Customize ice and sweetness levels. Options: No Ice, Less Ice, Normal Ice; None…", 600],
          ["Jasmine Milk Tea", "Delicate milk tea with the aromatic essence of jasmine. Customizable ice and sweetness levels", 700],
          ["Pomegranate Green Tea", "Pomegranate green tea. Choose ice level: No Ice, Less Ice, Normal Ice. Sweetness level: None, Less Sweet…", 600],
          ["Thai Tea Latte", "Thai tea latte. Choose ice level: no ice, less ice, normal ice. Sweetness level: none, less sweet, normal…", 700]
        ]
      },
      {
        name: "New Fall Drinks",
        items: [
          ["Pumpkin Spice Tea Latte", "", 825],
          ["Pumpkin Spice Smoothie", "", 1000],
          ["Buke Pandan Smoothie", "", 1000],
          ["Milo Smoothie", "", 900],
          ["Ovaltine Smoothie", "", 900]
        ]
      }
    ],
    orderUrl: "https://order.online/store/35787203",
    siteNote: "Menu and prices are from their own online ordering page (order.online)."
  },
  'maza-san-jose': {
    hours: "Mon–Fri 2pm–10pm, Sat–Sun 11am–10pm",
    siteNote: "Hours are from their own website."
  },
  'merkado-sf': {
    hours: "Tue–Fri 11:30am–3pm & 4–9pm, Sat 4–9pm, closed Sun–Mon",
    siteNote: "Hours from the Hours & Location page on merkadosf.com."
  },
  'mexihibachi': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Edamame", "Vegetarian. Lightly salted young soybeans in their pods.", 999],
          ["French Fries", "Vegetarian. Crispy golden potato fries, lightly salted.", 624],
          ["Jalapeño Poppers (6)", "Vegetarian. Crispy breaded jalapeños stuffed with creamy cheese.", 1124],
          ["Gyoza Deluxe (6)", "Pan-fried chicken and vegetable dumplings with green onions and house sauces", 1168],
          ["Coconut Shrimp (6)", "Six shrimp coated in coconut flakes and fried to a golden crisp.", 1429],
          ["Shrimp Tempura (6)", "Shrimp lightly battered and fried to golden perfection.", 1498],
          ["Chicken Wings", "Crispy chicken wings available in a variety of flavors.", 1498]
        ]
      },
      {
        name: "Garlic Fried Rice & Vegetables",
        items: [
          ["Hibachi Tofu", "Fried tofu with garlic fried rice and mixed vegetables (broccoli, carrots, onion, zucchini)", 2250],
          ["Hibachi Chicken Plate", "Chicken with garlic fried rice and sautéed broccoli, carrots, onion and zucchini", 2599],
          ["Salmon Plate", "Grilled salmon with teriyaki, garlic fried rice and mixed vegetables", 3125],
          ["New York Steak Plate", "Grilled New York steak with garlic fried rice and mixed vegetables", 3125],
          ["Steak, Chicken and Shrimp Plate", "Steak, chicken, shrimp with garlic fried rice and vegetables.", 4125],
          ["Shrimp Plate", "Grilled shrimp over seasoned fried rice with sautéed broccoli, carrots and zucchini", 2876],
          ["Scallops Plate", "Scallops with garlic fried rice and vegetables.", 3000],
          ["Chicken & Shrimp Plate", "Grilled chicken and shrimp atop garlic-infused fried rice, paired with sautéed vegetables.", 3250],
          ["Steak & Chicken Plate", "Steak & chicken with garlic fried rice and vegetables.", 3500],
          ["Steak & Shrimp Plate", "Steak & shrimp with garlic fried rice and vegetables.", 3625]
        ]
      },
      {
        name: "Yaki Udon Stir-Fry",
        items: [
          ["Veggie Yaki-Udon Stir Fry", "Udon noodles with vegetables; teriyaki, spicy teriyaki or garlic noodles", 2374],
          ["Chicken Yaki-Udon Stir Fry", "Teriyaki, spicy teriyaki, or garlic noodles", 2498],
          ["Shrimp Yaki-Udon Stir Fry", "Teriyaki, spicy teriyaki, or garlic noodles", 3124],
          ["Scallops Yaki-Udon Stir Fry", "Scallops with thick udon noodles; teriyaki, spicy teriyaki, or garlic noodles", 3124],
          ["Salmon Yaki-Udon Stir Fry", "Salmon with udon noodles; teriyaki, spicy teriyaki, or garlic noodles", 3124],
          ["New York Steak Yaki-Udon", "Teriyaki, spicy teriyaki, or garlic noodles", 3124],
          ["Chicken & Shrimp Yaki-Udon Stir Fry", "Teriyaki, spicy teriyaki, or garlic noodles", 3124],
          ["Steak & Chicken Yaki-Udon Stir Fry", "Teriyaki, spicy teriyaki, or garlic noodles", 3374],
          ["Steak & Shrimp Yaki-Udon Stir Fry", "Teriyaki, spicy teriyaki, or garlic noodles", 3498],
          ["Steak, Chicken & Shrimp Yaki-Udon Stir Fry", "Teriyaki, spicy teriyaki, or garlic noodles", 4124]
        ]
      },
      {
        name: "Hibachi Burrito / Hibachi Quesadilla",
        items: [
          ["Rice & Veggie Wrap", "Rice and vegetables, hibachi style or queso style", 1560],
          ["Chicken Wrap", "Hibachi wrap or queso wrap, filled with chicken", 1874],
          ["Shrimp Wrap", "Hibachi wrap or queso wrap, filled with shrimp", 2124],
          ["Steak Wrap", "Hibachi wrap or queso wrap, filled with steak", 2124],
          ["Chicken & Shrimp Wrap", "Grilled chicken and shrimp with mixed vegetables in a soft tortilla", 2249],
          ["Steak & Chicken Wrap", "Grilled steak and chicken with seasoned rice, sautéed vegetables and savory sauce", 2249],
          ["Steak & Shrimp Wrap", "Grilled steak and shrimp with mixed vegetables and savory sauce", 2474],
          ["Steak, Chicken & Shrimp Wrap", "Grilled steak, chicken and shrimp with mixed vegetables in a soft tortilla", 2624]
        ]
      },
      {
        name: "Kids' Menu",
        items: [
          ["Kids Cheese Quesadilla", "Vegetarian", 1124],
          ["Kids Mixed Veggies", "Vegetarian. Broccoli, carrots, zucchini & onion", 874],
          ["Kids Chicken Fried Rice", "Chicken fried rice with veggies", 1249],
          ["Kids Garlic Fried Rice", "Kid-sized garlic fried rice", 1124],
          ["Kids Garlic Noodles", "Kid-sized garlic noodles", 1124],
          ["Kids Plain Teriyaki Noodles", "Vegetarian", 1124],
          ["Kids Plain Chicken Garlic Noodles", "", 1249],
          ["Kids Plain Chicken Teriyaki Noodles", "Grilled chicken with teriyaki sauce over plain noodles", 1249]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Side of Egg", "Fried or scrambled", 186],
          ["Side of Chicken", "Lightly seasoned chicken cooked in garlic butter", 999],
          ["Side of Shrimp (7)", "Seven grilled seasoned shrimp", 1149],
          ["Side of Scallops (6)", "", 1169],
          ["Side of Salmon", "Seared salmon fillet", 1874],
          ["Side of NY Steak (8 oz)", "8 oz uncooked weight", 1874],
          ["Side of Lobster", "", 2374]
        ]
      },
      {
        name: "Extras",
        items: [
          ["Lemon Wedge (2)", "", 45],
          ["Teriyaki (3.25 oz)", "", 130],
          ["Yum Yum (3.25 oz)", "", 130],
          ["Ginger (3.25 oz)", "", 130],
          ["Blistered Jalapeños", "", 259],
          ["Garlic Butter (3.25 oz)", "", 259],
          ["Diablo (3.25 oz)", "Spicy chili sauce", 259]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Bottled Water", "", 194],
          ["Canned Soda", "", 313],
          ["Mexican Coke (12 oz)", "", 520],
          ["Agua Fresca (24 oz)", "", 520]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Ice Cream Scoop (1)", "Vanilla chocolate chip", 519],
          ["Churros (2)", "Cinnamon-sugar churros filled with caramel", 780],
          ["Churros a La Mode", "Caramel-filled churros with vanilla chocolate chip ice cream, chocolate and caramel drizzle", 1124]
        ]
      }
    ],
    hours: "Wed–Thu 12–9pm, Fri–Sat 12–10pm, Sun 12–8pm; Closed Mon–Tue",
    orderUrl: "https://www.ubereats.com/store/mexihibachi-pinole-pinole/V7nVQd2RViSK3TNBX_RpJA",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from MexiHibachi's Uber Eats store (their site has no menu; it says to text for one); hours are from the hours list on mexihibachi.com."
  },
  'milk-cloud-bakery': {
    hours: "Thu & Sat 10am–2:30pm (hours rotate; check their Instagram)",
    siteNote: "Hours are from their Instagram bio and Franki; their own site says hours are currently rotating."
  },
  'milky-flakes': {
    hours: "Sun–Thu 11am–10pm, Fri–Sat 11am–11pm",
    phone: "(925) 440-0569",
    email: "hello@milkyflakes.com",
    siteNote: "Hours are from their own website and Google Maps, which agree."
  },
  'mimis-chocolates': {
    hours: "Mon–Fri 12pm–7pm, Sat 1pm–8pm, Closed Sun",
    siteNote: "Hours are from their own website."
  },
  'mimosas-willow-glen': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Wings", "Seven wings, plain, lemon pepper, barbecue, or buffalo.", 1800],
          ["Onion Rings", "Crispy golden breaded onion rings with a side of ranch.", 1300],
          ["Jalapeño Poppers", "Crispy golden breaded jalapeño stuffed with cheddar cheese, side ranch.", 1300],
          ["Mozerella Sticks", "Crispy golden breaded Mozzarella sticks with side of marinara sauce.", 1300],
          ["Popcorn Shrimp", "Crispy golden breaded juicy shrimp with side tartar sauce.", 1600],
          ["Nachos or Loaded Fries", "Crispy tortilla chips or fries topped with beans, cheddar nacho cheese, pico de gallo, sour cream…", 1800],
          ["Pork Rind, Chips, and Guac", "Crispy pork rinds with meat housemade tortilla chips and a side of guacamole.", 1800],
          ["Avocado Toast", "One slice of thick white Texas toast with guacamole one egg and bits of bacon.", 1600]
        ]
      },
      {
        name: "House Specialties",
        items: [
          ["Chilaquiles", "Crispy corn tortillas, two eggs, red or green salsa, queso fresco, avocado, sour cream, country potatoes…", 2000],
          ["Chile Verde", "Pork chile verde, two eggs any which way, pinto beans, hash browns or country potatoes with tortillas.", 2000],
          ["Rib Eye Steak and Eggs", "Two eggs, country potatoes or hash brown, choice of toast.", 2500],
          ["Divorced Eggs", "Two crispy corn tortillas, two eggs any which way, green and red salsa, pinto beans, onions, country…", 1800],
          ["Breakfast Burrito", "Two eggs, bacon, ham, chorizo or sausage, hash brown or country potatoes, cheddar cheese side salsa.", 1500],
          ["Country Fried Steak", "Two eggs, country potatoes or hash brown, gravy, choice of toast.", 2500]
        ]
      },
      {
        name: "Omelettes & Scrambles",
        items: [
          ["Chorizo", "Onions, tomato, chorizo, cheddar cheese.", 2000],
          ["Steak", "Mushroom, onion, steak, tomato, cheddar cheese.", 2000],
          ["Veggie", "Spinach, tomato, onion, bell peppers, mushrooms, cheddar cheese.", 1800],
          ["Denver", "Grilled ham, bell pepper, onion, cheddar cheese.", 1800],
          ["Tri-Meat", "Bacon, sausage, chorizo, onion, cheese and tomatoes.", 2500]
        ]
      },
      {
        name: "Skillets",
        items: [
          ["Jalapeño Skillet", "Country potatoes mixed with onion, bell peppers, tomato, and chorizo with two eggs any style and side of…", 1900],
          ["Veggie Skillet", "Country potatoes mixed with mushroom, tomato, bell peepers, onion, spinach, cheddar cheese, two eggs any…", 1800],
          ["Meat Fanatic Skillet", "Country potatoes mixed with mushroom, bell peppers, onions, tomato, as well as chorizo, bacon, linguica…", 2500]
        ]
      },
      {
        name: "Breakfast Combos",
        items: [
          ["Waffle Combo", "One waffle, two eggs, bacon or sausage, hash brown or country potatoes.", 2200],
          ["Pancake Combo", "Short stack, two eggs any which way, bacon or sausage, country potatoes or hash brown.", 2000],
          ["Crepe Combo", "Two crepes two eggs any which way, bacon or sausage, country potatoes or hash brown.", 2000],
          ["French Toast Combo", "Two French toast, two eggs, bacon or sausage, and choice of country potatoes or hash browns.", 2000],
          ["Basic Breakfast", "Two eggs any which way, country style potatoes, bacon or sausage, choice of toast.", 1700]
        ]
      },
      {
        name: "Benedict",
        items: [
          ["Salmon Benedict", "Two poached eggs, onions, tomato, spinach, salmon, Hollandaise sauce, English muffin, choice of potatoes.", 2400],
          ["Basic Benedict", "Two poached eggs, bacon, Hollandaise sauce, English muffin, choice of potatoes.", 1900],
          ["Chorizo Benedict", "Two poached eggs, onions, jalapeños, chorizo, Hollandaise sauce, English muffin and choice of potatoes.", 2100],
          ["Divorced Benny", "Two poached eggs, onions, tomatoes, steak, English muffin, green and red salsa, choice of potatoes.", 2200],
          ["Crab Cake Benedict", "Two poached eggs, crispy crab cake patty, Hollandaise sauce, English muffin, choice of potatoes.", 2400],
          ["Veggie Benedict", "Two poached eggs, sautéed spinach, sliced tomato, grilled red onion, Hollandaise sauce, English Muffin…", 2000]
        ]
      },
      {
        name: "Soups",
        items: [
          ["Chicken Vegetable Soup", "", 800],
          ["Tomato Basil Soup", "", 800],
          ["Menudo", "", 900],
          ["Chicken Tortilla Soup", "", 800]
        ]
      },
      {
        name: "Crepes",
        items: [
          ["Strawberry Banana Crepe", "One crepe with banana, strawberry, Nutella, whipped cream, powdered sugar, and vanilla ice cream.", 1800],
          ["Chicken Pesto Crepe", "One crepe with onions, mushrooms, mozzarella cheese, pesto sauce and chicken.", 1900],
          ["Breakfast Crepe", "One crepe with onions, tomatoes, choice of meat, scrambled eggs, and mixed cheddar cheese.", 1900],
          ["Plain Crepe", "Two plain crepes with powdered sugar.", 1500],
          ["Banana Pecan Caramel Crepe", "One crepe with bananas, caramelized pecans, powdered sugar, and whipped cream.", 1800]
        ]
      },
      {
        name: "Pancakes, Waffles & French Toast",
        items: [
          ["Banana Pecan Pancakes", "Two pancakes topped with bannana, candied pecan, whip cream and powdered sugar.", 1600],
          ["Strawberry & Chocolate Chip Pancakes", "Two pancakes with chocolate chips topped with fresh strawberries, whipped cream, and powdered sugar.", 1600],
          ["Tres Leches Pancakes", "Two pancakes topped with vanilla ice cream, milkmaid, strawberries and cinnamon.", 1700],
          ["French & Fruit", "Two French toast with banana, strawberry's, whip cream and powdered sugar.", 1700],
          ["Churro Waffle", "One Belgian waffle drizzled with caramel one vanilla scoop topped with powdered sugar, cinnamon and a…", 1700],
          ["Strawberry Banana Waffle", "One Belgian waffle topped with strawberries, banana, whip cream, Nutella and powder sugar.", 1800],
          ["Fried Chicken & Waffles", "One Belgian waffle and three fried chicken strips.", 1800]
        ]
      },
      {
        name: "Salads",
        items: [
          ["Chicken Caesar Salad", "Romaine lettuce, grilled chicken, garlic croutons, freshly shaved Parmesan cheese and Caesar dressing.", 1700],
          ["Chicken Fajita Salad", "Grilled chicken, romaine, avocado, tomato, grilled red onion and bell pepper, jack cheese, and ranch…", 1800],
          ["Straberry Pecan Salad", "Spinach, fresh strawberries, cranberry, candied pecan, side of raspberry balsamic vinegrette.", 1700],
          ["Steak Salad", "Organic spring mix, spinach, 7 oz. New York steak, tomato, avocado, and ranch dressing.", 2500],
          ["Chicken Cobb Salad", "Romaine lettuce, tomatoes, red onions, cucumber, avocado, boiled eggs, mixed cheddar cheese, chicken…", 2800],
          ["Buffalo Chicken Wrap", "Romaine lettuce, cheddar mix cheese, ranch, buffalo chicken tenders.", 2000]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["Cali Club", "Sourdough bread, turkey, tomato, avocado, bacon, lettuce, mayonnaise and side of fries.", 1800],
          ["BLT", "Sourdough bread, lettuce, bacon, tomato, avocado, mayonnaise and side of fries.", 1500],
          ["Chicken Pesto", "Chicken breast, pesto, tomato, onion, jack cheese, on ciabatta bread, side of fries.", 1700],
          ["Crispy Chicken Sandwhich", "Crispy spicy chicken, chipotle mayo, tomato, grilled onion, pepper jack cheese, on ciabatta bread, side…", 1900],
          ["Philly Cheese Steak", "Steak, grilled onion, bell peppers, mushrooms, pepperjack cheese on ciabatta bread and side of fries.", 1700],
          ["Breakfast Sandwich", "Sourdough bread, scramble egg, bacon, ham or sausage, cheddar cheese, mayonnaise, side of potatoes or fruit.", 1600]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["I Don’t Know", "Three mini Nutella pancakes with strawberries, bananas, Nutella and whipped cream topped with powdered…", 1300],
          ["Uhmmm..", "Grilled cheese with a side of fruit or fries.", 1300],
          ["What?", "Three mini pancakes with scrambled eggs and side of bacon or sausage.", 1300],
          ["I Don’t Care", "Chicken tenders with a side of fruit or fries.", 1300],
          ["I Don’t Want That", "Grilled chicken breast with veggies.", 1300],
          ["I’m Not Hungry", "Cheeseburger with side of fries or fruit.", 1300]
        ]
      },
      {
        name: "Hamburgers",
        items: [
          ["Cheeseburger", "Ground beef patty, cheddar cheese, tomato, onions, pickles, mayonnaise.", 1800],
          ["Bacon Mushroom Burger", "Ground beef patty, bacon, cheddar cheese, mushrooms, tomato, onions, lettuce, chipotle mayonnaise.", 2000],
          ["BBB Burger", "Ground beef patty, with barbecue sauce, cheddar cheese, onion rings, and bacon.", 2000],
          ["Veggie Burger", "Veggie patty, onion, tomato, pickles, lettuce, chipotle mayonnaise.", 1700],
          ["Chicken Pepper Jack Burger", "One breaded chicken patty with onions, tomatoes, lettuce, pepperjack cheese, and chipotle mayonnaise.", 1700]
        ]
      },
      {
        name: "Tacos & More",
        items: [
          ["Taco", "Small taco with meat, onion, cilantro and salsa.", 400],
          ["Burrito", "From $15 regular, $18 super. Meat, rice and beans; super adds pico, avocado, cheese, sour cream", 1500],
          ["Breakfast Molcajete", "Steak, chicken, cactus, chilaquiles, sour cream, queso fresco, green or red salsa, two eggs any style…", 5000],
          ["Taco Plate", "2 Tacos with your choice of meat, rice and beans on the side.", 1500],
          ["Quesabirria", "Three quesabirria tacos with mozzarella cheese and side of salsa.", 1600],
          ["Baked Loaded Potato", "One large Russet potato with cheese, butter, sour cream, cheddar mix, and bacon.", 1200],
          ["Quesadilla", "Flour tortilla and mozarella cheese. Make it a Super with meat, onions, cilantro and salsa +$6", 1200]
        ]
      },
      {
        name: "Dinner",
        items: [
          ["Salmon", "6oz Salmon fillet grilled with side of mashed potatoes and sautéed vegetables.", 2700],
          ["Rib Eye", "One grilled rib eye with side of mashed potatoes and sautéed vegetables.", 2600],
          ["Chicken Alfredo Pasta", "Creamy chicken alfredo sauce with chicken, fettuccine, and mozzarella cheese.", 2500],
          ["Chicken Pesto Pasta", "Fettucine pasta with pesto sauce and chicken, side of garlic bread.", 2500]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Chocolate Cake", "", 800],
          ["Cheese Cake", "", 800],
          ["Vanilla Ice Cream", "with whip cream, Nutella and strawberries.", 1200],
          ["Churros and Ice Cream", "", 1200]
        ]
      },
      {
        name: "Sides",
        items: [
          ["One Egg", "One egg cooked any which way.", 300],
          ["Two Eggs", "Two eggs cooked any which way.", 500],
          ["Avocado", "Fresh avocado.", 300],
          ["Hash Brown or Country Potatoes", "Our signature hash browns or country potatoes.", 600],
          ["Bacon or Sausage Three Piece", "Bacon or sausage three piece.", 600],
          ["Fruit", "Fresh seasonal fruit.", 600],
          ["Extra Toppings", "", 200],
          ["One Pancake", "", 400],
          ["Side of Fries", "", 600]
        ]
      }
    ],
    hours: "Thu–Tue 8am–9pm, Closed Wed",
    orderUrl: "https://tmt.spotapps.co/ordering-menu?spot_id=88454",
    siteNote: "Food menu and hours from their own website.",
    email: "kimberlin1113@gmail.com"
  },
  'mini-pirate-donuts': {
    hours: "Mon, Wed, Fri 7am–3:30pm; Tue, Thu 7am–2:30pm at School St & Harbor; Sat at events",
    email: "minipiratedonuts@gmail.com",
    siteNote: "Hours come from the pop-up schedule on Mini Pirate Donuts' own website."
  },
  'mochica-sf': {
    sections: [
      {
        name: "To Start",
        items: [
          ["Cebiche de Pescado", "Fresh fish in lime juice-chile rocoto leche de tigre", 2500],
          ["Cebiche de Camarones", "Mexican wild shrimp, chile amarillo-coconut leche de tigre, mint-lemongrass", 2600],
          ["Cebiche Chino-Peruano", "Ahi tuna, ginger, scallions, rocoto, cucumber, sweet chili sauce, microgreens", 2700],
          ["Cebiche Tasting", "", 3900],
          ["Tuna Tartare", "Sushi-grade ahi tuna, chili japones, choclo, lime, avocado, yuca chips, tiradito sauce", 2900],
          ["Roasted Beet Salad", "Mariquita Farm beets, purple potatoes, choclo, cancha, feta, Mochica vinaigrette", 1700],
          ["Papa a la Huancaina", "", 2000],
          ["Yucca Chips", "", 600]
        ]
      },
      {
        name: "Appetizers",
        items: [
          ["Costillas", "Crispy pork spareribs, Peruvian-style BBQ sauce, jicama salad", 1900],
          ["Tequeños", "Crispy wontons stuffed with Oaxaca cheese, guacamole, tamarind sauce", 1900],
          ["Chicharrón de Pollo", "", 1900],
          ["Bolitas de Yuca", "Cancha-crusted yuca balls with ham and cheese, huancaina sauce", 1700],
          ["Camarones Crocantes", "Quinoa-crusted wild Mexican prawns, sweet potato purée, dulce aioli", 2200],
          ["Anticuchos de Pollo", "", 2200],
          ["Anticuchos de Camarón", "", 2400],
          ["Empanada Trio", "", 2400],
          ["Pulpito Parrillero", "Grilled octopus tentacle, purple mashed potato, fusion sauce, salsa criolla", 2700]
        ]
      },
      {
        name: "Main Dishes",
        items: [
          ["Lomo Saltado", "Stir-fried beef fillet, lomo saltado sauce, fries, rice", 3300],
          ["Pollo Saltado", "", 2800],
          ["Vegan Saltado", "", 2600],
          ["Aji de Gallina", "Mary's free-range chicken, creamy chile amarillo, potato, olives, hard-boiled egg", 2600],
          ["Aji de Seafood", "Seafood in creamy chile amarillo, potato, olives, hard-boiled egg", 2900],
          ["Chaufa Chicken", "Peruvian fried rice, chicken, egg, asparagus, hoisin, chile amarillo, wild mushroom", 2900],
          ["Chaufa Pork Belly", "Peruvian fried rice, pork belly, egg, asparagus, hoisin, chile amarillo, wild mushroom", 3000],
          ["Chaufa Seafood", "", 3200],
          ["Chaufa Vegan", "", 2600],
          ["Paella Mariscos", "Peruvian-style Bomba rice, seafood in saffron-fish stock, criolla salad", 3300],
          ["Paella Pollo", "", 2900],
          ["Paella Vegan", "", 2600],
          ["Paella Negra", "", 3500],
          ["Aguadito de Pollo", "", 2300],
          ["Aguadito de Mariscos", "", 2900],
          ["Pescado a lo Macho", "Seafood bouillabaisse, pan-roasted swordfish, chupe sauce, coconut rice", 3300],
          ["Salmon Bandido", "", 3300],
          ["Chancho Adobado", "Snake River pork shoulder, adobo sauce, yuca fries, berros salad", 3000],
          ["Seco Short Rib", "", 3800],
          ["Churrasco", "", 5800],
          ["Pollo a la Brasa (Half)", "Mary's organic rotisserie chicken in Peruvian seasonings", 2600],
          ["Pollo a la Brasa (Whole)", "Mary's organic rotisserie chicken in Peruvian seasonings", 4800],
          ["Quinotto", "Peruvian quinoa, roasted vegetables, soffrito, creamy huancaina, queso fresco", 2400],
          ["Charlie Burger", "", 2300]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Cancha", "", 300],
          ["Criolla", "", 300],
          ["Peruvian Beans", "", 400],
          ["Jasmine Rice", "", 500],
          ["Side Avocado", "", 500],
          ["Side Guacamole", "", 500],
          ["Tacu Tacu", "", 800],
          ["French Fries", "", 800],
          ["Coconut Rice", "", 800],
          ["Sautéed Spinach with Garlic", "", 900],
          ["Sautéed Veggies", "", 900],
          ["Shishito Peppers", "", 1000],
          ["Plátanos Maduros", "Sweet ripe plantains, caramelized", 1200],
          ["Yucca Fries", "Huancaina sauce, queso rayado", 1200],
          ["Sautéed Mushrooms", "", 1200],
          ["Mac N Cheese a Nuestro Estilo", "Applewood bacon, mixed quesos, truffle oil, aji amarillo sofrito, toasted crumbs", 1500],
          ["Side Camarones", "", 1500]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Lucuma Ice Cream", "", 600],
          ["Vanilla Ice Cream", "", 600],
          ["Alfajores", "", 1500],
          ["Flan de Quinoa", "", 1600],
          ["Chocolate Indulgence", "", 1800],
          ["Key Lime Pie", "", 1800],
          ["Guava Cheesecake", "", 1800]
        ]
      },
      {
        name: "Spirit-Free Drinks",
        items: [
          ["Orange Juice", "", 400],
          ["Diet Coke", "", 500],
          ["Mexican Coke", "", 700],
          ["Mexican Sprite", "", 700],
          ["Inca Kola", "", 700],
          ["Unsweetened Iced Tea", "", 700],
          ["Topo Chico", "", 700],
          ["Raspberry Lemonade", "", 800],
          ["Lemonade", "", 1000],
          ["Strawberry Lemonade", "", 1000],
          ["Chicha Morada", "", 1000],
          ["Maracuyá", "Passion fruit", 1000],
          ["Cucumber Virgin Mojito", "", 1000],
          ["Ginger Beer", "", 1000],
          ["Mocktail-Rita", "", 1200],
          ["Saratoga Sparkling", "", 1100]
        ]
      },
      {
        name: "Coffee & Tea",
        items: [
          ["Drip Coffee", "", 400],
          ["Organic Tea", "", 500]
        ]
      }
    ],
    hours: "Tue–Thu 4–9pm, Fri–Sat 10am–10pm, Sun 10am–9pm; Closed Mon",
    orderUrl: "https://order.toasttab.com/online/mochica-1469-18th-street",
    siteNote: "Menu and prices are from Mochica's own Toast online ordering page (linked from mochicasf.com); dine-in hours are from mochicasf.com."
  },
  'myo-frozen-yogurt-walnut-creek': {
    hours: "Sun–Thu 12–9pm, Fri–Sat 12–10pm",
    siteNote: "Hours are from Restaurantji and Yelp, which agree; their own site contradicts itself."
  },
  'nomads': {
    siteNote: "From their own website, eatnomads.com (support hours; it ships, no storefront)."
  },
  'oasis-wine-lounge': {
    hours: "Daily 11:30am–9pm",
    siteNote: "Hours are from their own website and OpenTable, which agree."
  },
  'ocean-oyster-bar-redwood-city': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Cooked Oysters", "Each. Parmesan, sriracha bourbon, a la diabla, al mojo de ajo, a la mexicana or mango habanero. 4 for $19.95", 595],
          ["Oysters Rockefeller", "Each. Nutmeg and bacon", 695],
          ["Mediterranean Sea Jewels", "Each. Baked scallops and shrimp in the shell, roasted garlic parmesan sauce. 4 for $22.95", 695],
          ["Greek Style Octopus", "Drizzled with lemon oregano vinaigrette sauce", 2195],
          ["Crab Cakes", "Crab meat, panko & smokey aioli", 1885],
          ["Garlic Prawns", "Succulent prawns tossed in garlic butter sauce", 1895],
          ["Spicy Peanut Prawns", "Prawns in creamy peanut sauce", 1895],
          ["Fried Calamari", "Sprinkled with garlic & cheese; served with cocktail & sriracha aioli sauce", 1795],
          ["Ahi Poke Tostadas", "Fresh ahi on a crunchy tostada with cilantro sauce, avocado & sesame seeds", 1895],
          ["Spicy Chili Edamame", "Sweet chili sauce", 995],
          ["Cheese Garlic Bread", "Cheese blend melted on sourdough bread", 1195],
          ["Clams or Black Mussels", "Steamed in a wine sauce with chili flakes, served with garlic toasted bread", 1995],
          ["Louisiana Prawns", "Head and shells on, tossed in southern spices, garlic & butter", 2395],
          ["Crunchy Jalapeño Prawns", "Lightly floured, head and shells on, sautéed with jalapeño slices", 2295],
          ["Skirt Steak Bites", "Tender skirt steak served with our three homemade steak sauces", 2395],
          ["Fish & Chips", "Served with fries", 1895]
        ]
      },
      {
        name: "Raw Oysters & Clams",
        items: [
          ["Blue Point Oyster", "Each. Briny & mild with a sweet finish; Long Island, Connecticut", 395],
          ["Shigoku Oyster", "Each. Strong brininess, sweet finish, firm plump texture; Washington", 445],
          ["Eastern Oyster", "Each. Firm & plump with a briny finish; Chesapeake Bay", 425],
          ["Kumamoto Oyster", "Each. Deep cup with a briny & sweet finish; Washington", 495],
          ["Kusshi Oyster", "Each. Small, deep cup with a clean finish; Deep Bay, Canada", 445],
          ["Pai Pai Oyster", "Each. Punchy brine and smooth plump meat; Baja California", 445],
          ["Petit Barachois Oyster", "Each. Deep cup, sweet and salty; Prince Edward Island", 395],
          ["Royal Miyagi Oyster", "Each. Smooth and creamy, mild and sweet; Hood Canal, Washington", 425],
          ["Littleneck Clams", "Each. From the warm coastal waters of Florida", 395],
          ["Cherrystone Clams", "Each. Plump, sweet East Coast clams on the half shell", 495]
        ]
      },
      {
        name: "Raw Bar",
        items: [
          ["Shrimp Ceviche", "Lime marinated shrimp with serrano peppers, tomatoes & red onion", 1195],
          ["Aguachile", "Raw shrimp in lime, serrano, jalapeño, red onions & cucumber", 1995],
          ["Hamachi Crudo", "Citrus, ponzu, serrano, cilantro", 1995],
          ["Prawn Cocktail", "Six jumbo prawns; served with cocktail sauce & lemon", 1695],
          ["Ponzu Sashimi Scallops", "Seaweed, wasabi aioli, pickled ginger & tobiko", 1795],
          ["Leche de Tigre", "Ahi tuna, cooked shrimp, octopus, lime juice, ginger, toasted corn & sweet potato", 2495],
          ["Half Seafood Tower", "Shrimp ceviche, ahi poke, raw clams, oysters, king crab legs, cocktail prawns & sashimi scallops", 6995],
          ["Cold Seafood Tower", "Shrimp ceviche, ahi poke, raw clams, oysters, king crab legs, cocktail prawns & sashimi scallops", 12995]
        ]
      },
      {
        name: "Soups & Salads",
        items: [
          ["Clam Chowder Cup", "Clams, potatoes, onions, cream", 695],
          ["Clam Chowder Bowl", "Clams, potatoes, onions, cream", 1095],
          ["Clam Chowder Bread Bowl", "Clams, potatoes, onions, cream", 1495],
          ["House Salad", "Spring mix, tomatoes & croutons tossed in pomegranate vinaigrette", 1395],
          ["Caesar Salad", "Crispy romaine, fresh parmesan & house-made croutons", 1495],
          ["Roasted Beet Goat Cheese Salad", "Wild arugula, apple, sliced almonds, pomegranate vinaigrette & balsamic glaze", 1595],
          ["Garden Salad", "Iceberg, romaine, spring mix, tomatoes, cucumbers, onions, avocado & egg", 1395],
          ["Wedge Salad", "Traditional style served with bacon & chopped tomatoes", 1595],
          ["Seafood Louie", "Dungeness crab, shrimp, egg, avocado and greens with house thousand island", 2595]
        ]
      },
      {
        name: "Fresh Shellfish",
        items: [
          ["Ocean's Mixed Seafood", "Shrimp, crab, clams, octopus, mussels & fish sautéed in a guajillo sauce", 3895],
          ["Ocean's Louisiana Platter (Half)", "Crab legs, prawns & octopus in southern spices, garlic & butter", 5495],
          ["Ocean's Louisiana Platter", "Crab legs, prawns & octopus in southern spices, garlic & butter", 9995],
          ["Cioppino", "Crab, shrimp, clams, mussels, fish & calamari in a tomato garlic broth", 3995],
          ["Scallops", "Pan seared in garlic butter; with sautéed spinach & mashed potatoes", 2895],
          ["Ocean's Duo Seafood Enchilada", "Crab or shrimp enchiladas with cheese, sour cream, avocado, red sauce, rice & pico", 2795],
          ["Taco Trio", "Breaded fish, achiote shrimp & guajillo octopus on flour tortillas", 1995]
        ]
      },
      {
        name: "Pasta",
        items: [
          ["Cajun Pasta", "Linguine with prawns, bell peppers & red onion. Topped with cheese", 2795],
          ["Chicken Alfredo", "Fettuccine with garlic, nutmeg, cream & topped with cheese", 2495],
          ["Clam Linguine", "Tossed in parsley & white wine, topped with cheese and chili flakes", 2595],
          ["Chef's Spicy Linguine", "Prawns, fennel, olives, garlic, tomatoes & white wine topped with cheese", 2795],
          ["Crab Linguine", "Crab with garlic, nutmeg and cream; Alfredo or marinara", 3895],
          ["Lobster Spaghetti", "Spaghetti, lobster claw, basil, cherry tomatoes, in a white lobster base sauce", 4495],
          ["Surf & Turf", "Pappardelle, grilled lobster, braised short ribs, mushroom, zucchini, light butter sauce", 5795]
        ]
      },
      {
        name: "Fresh Fish",
        items: [
          ["Atlantic Salmon", "Grilled; vegetable medley & rice pilaf or mashed potatoes", 2895],
          ["Pacific Petrale Sole", "Pan-seared, lemon beurre blanc capers sauce; roasted potatoes & asparagus", 2895],
          ["Wild Halibut", "Mushrooms, capers & white wine sauce; vegetables & rice pilaf or mashed potatoes", 3295],
          ["Wild Pacific Tuna", "Grilled rare in a citrus soy glaze, with baby bok choy and steamed rice", 2995],
          ["Southern Pacific Mahi-Mahi", "Coffee-rub blackened, with spinach, mashed potatoes & mango salsa", 2995],
          ["Grilled Whole Branzino", "Salt, pepper & oregano vinaigrette; served with choice of sides", 3995]
        ]
      },
      {
        name: "Meats",
        items: [
          ["Mary's Airline Chicken Breast", "Oven roasted with rosemary & garlic; vegetables & roasted or mashed potatoes", 2895],
          ["New York Boneless Steak 12oz", "Served with a vegetable medley & roasted or mashed potatoes", 3995],
          ["Halal Lamb Chops", "Grilled with garlic, lemon, oregano & olive oil; with fingerling potatoes", 4295],
          ["Prime Rib Eye 10oz", "Served with a vegetable medley & roasted or mashed potatoes", 4495],
          ["Kansas City Steak 22oz", "Served with a vegetable medley & roasted or mashed potatoes", 4995],
          ["Texas Cowboy Steak 22oz", "Served with a vegetable medley & roasted or mashed potatoes", 5495],
          ["Prime Filet Mignon 8oz", "Red wine compound butter; vegetables & roasted or mashed potatoes", 5795],
          ["T-bone Steak 26oz", "Served with a vegetable medley & roasted or mashed potatoes", 5995],
          ["Rib Eye Prime 16oz", "Served with a vegetable medley & roasted or mashed potatoes", 6495],
          ["Porterhouse Steak 32oz", "Served with a vegetable medley & roasted or mashed potatoes", 6995],
          ["The Land & Sea Experience", "Bone-in ribeye topped with sautéed shrimp and a creamy mushroom sauce", 6995]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["Fried Fish Sandwich", "True cod, lettuce, avocado, tartar, tomato & sriracha aioli; served with fries", 1895],
          ["Crab Sandwich", "Fresh crab, arugula, tomato, avocado, swiss & sriracha aioli on brioche; with fries", 2295],
          ["Lobster Roll", "Light mayo, celery, chives & chef's seasoning; with fries or potato chips", 2895],
          ["Beef Tenderloin Burger", "Filet mignon patty, avocado, mushrooms, havarti on brioche; sweet potato fries", 2995]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Mashed Potatoes", "", 595],
          ["Roasted Potatoes", "", 595],
          ["Potato Chips", "", 595],
          ["Steamed Vegetables", "", 595],
          ["French Fries", "", 595],
          ["Steamed White Rice", "", 595],
          ["Rice Pilaf", "", 595],
          ["Asparagus", "", 595],
          ["Sweet Potato Fries", "", 595],
          ["Spinach", "", 595]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Key Lime Pie", "A slice", 795],
          ["Crème Brûlée", "", 895],
          ["Snickerdoodle", "", 895],
          ["Chocolate Mousse Cheesecake", "", 995],
          ["Panna Cotta", "Creamy homemade Italian custard with triple berry sauce", 995]
        ]
      },
      {
        name: "Kid's Menu",
        items: [
          ["Kid's Pasta", "Drink included (12 and under). Alfredo, spaghetti sauce, or butter & cheese", 1195],
          ["Kid's Breaded Fried Shrimp", "Drink included (12 and under). Served with fries", 1195],
          ["Kid's Breaded Chicken Tenders", "Drink included (12 and under). Served with fries", 1195],
          ["Kid's Beef Patty Burger", "Drink included (12 and under). Served with fries", 1395]
        ]
      }
    ],
    hours: "Mon–Thu 11:45am–2pm & 4:45–8:30pm, Fri 11:45am–10pm, Sat 11am–10pm, Sun 11am–8:30pm",
    siteNote: "Menu and prices from their Redwood City menu page on oceanoysterbargrill.com; hours from Yelp."
  },
  'ocean-subs': {
    sections: [
      {
        name: "Sandwiches",
        items: [
          ["Build Your Own Sub", "Choose up to two meats and cheese", 1650],
          ["Original Sub", "Ham & Italian salami; choose your bread and cheese", 1650],
          ["Atomic Sub", "Ham, Italian salami, turkey, roast beef; choose your bread and cheese", 1725],
          ["Italian Sub", "Mortadella and Italian salami; choose your bread and cheese", 1650],
          ["Veggie Sub", "Garlic hummus, roasted red peppers, cucumber, alfalfa sprouts; choose bread and cheese", 1625],
          ["The Mufasa", "Turkey, roast beef, pastrami with alfalfa sprouts; choose your bread and cheese", 1725],
          ["The Crusader", "Turkey and pastrami with garlic hummus and roasted red peppers", 1725],
          ["The Papadopoulos", "Artichoke hearts, roasted red peppers, olives, cucumber, feta & provolone", 1725]
        ]
      }
    ],
    hours: "Tue–Sat 10am–4pm, Closed Sun–Mon",
    pricesEstimated: "Prices are from the menu on their Yelp page (Yelp notes it may not be up to date); their Toast ordering menu would not load.",
    siteNote: "Hours are from Yelp (claimed listing) and findit.city, which agree; the sandwich menu and prices are from their Yelp menu page because their own Toast ordering page shows no menu right now."
  },
  'paleta-planeta': {
    sections: [
      {
        name: "Paletas de Agua (Water-based)",
        items: [
          ["Guayaba (Guava)", "Water-based paleta made with guava.", 525],
          ["Fresa Maracuyá (Strawberry Passion Fruit)", "Water-based paleta made with passion fruit and strawberry.", 525],
          ["Sandia Piña (Watermelon Pineapple)", "Water-based paleta made with watermelon and pineapple.", 525],
          ["Kiwi", "Water-based paleta made with kiwi.", 525],
          ["Cometa", "A water-based paleta made with fresh mango, pineapple, strawberry, Tajin and chamoy.", 525],
          ["Mango Chile (Mango Chili)", "Water-based paleta made with Mango, Tajin, and Chamoy.", 595],
          ["Berries", "Water-based paleta made with fresh strawberries, blueberries, raspberries and blackberries.", 525],
          ["Fresa Pepino (Strawberry Cucumber)", "Water-based paleta made with strawberry, cucumber and lime juice.", 525],
          ["Mango Lechera  (Mango Condensed Milk)", "Water-based paleta made with mango and a condensed milk filling.", 595],
          ["Fresa Lechera (Strawberry Condensed Milk)", "Water-based paleta made with strawberry filled with condensed milk.", 595],
          ["Melón (Cantaloupe)", "Water-based paleta made with cantaloupe.", 525],
          ["Fresa Piña (Strawberry Pineapple)", "Water-based paleta made with strawberry and pineapple.", 525],
          ["Limonada de Berries (Berries Lemonade)", "Water-based paleta made with strawberry, blueberry, blackberry, raspberry and lemon juice.", 525],
          ["Guanabana Berries (Soursop Berries)", "Water-based paleta made with soursop, blackberry, blueberry, raspberry, and strawberry.", 525],
          ["Frambuesa (Raspberry)", "Water-based paleta made with raspberry.", 525],
          ["Tamarindo (Tamarind)", "Water-based paleta made with tamarind.", 525],
          ["Mango Maracuya Lechera (Mango Passion Fruit Condensed Milk)", "Water-based paleta made with mango, passion fruit, and condensed milk filling.", 595],
          ["Fresa (Strawberry)", "Water-based paleta made with strawberries.", 525],
          ["Fresa Menta (Strawberry Mint)", "Water-based paleta made with strawberry and mint.", 525],
          ["Piña Menta (Pineapple Mint)", "Water-based paleta made with pineapple and mint.", 525],
          ["Jamaica Mango (Hibiscus Mango)", "Water-based paleta with hibiscus flower and mango.", 525],
          ["Kiwi Maracuyá (Kiwi Passion Fruit)", "Water-based paleta made with kiwi and passion fruit.", 525],
          ["Pepino Menta (Cucumber Mint)", "Water-based paleta made with cucumber, lime juice and mint.", 525],
          ["Lychee Fresa", "A water-based paleta made with lychee and strawberry..", 525],
          ["Mango Duranzo (Mango Peach)", "Water-based paleta made with mango and peach.", 525],
          ["Sandia Mango (Watermelon Mango)", "Water-based paleta made with watermelon and mango.", 525],
          ["Mango Pepino (Mango Cucumber)", "Water-based paleta made with mango and cucumber.", 525],
          ["Kiwi Mango", "Water-based paleta made with kiwi and mango.", 525],
          ["Jamaica Fresa (Hibiscus Strawberry)", "Water-based paleta with hibiscus flower and strawberry.", 525],
          ["Mango Berries", "Water-based paleta made with mango, strawberry, raspberry, blackberry, and blueberry.", 525],
          ["Mango Melon (Mango Cantaloupe)", "Water-based paleta made with mango and cantaloupe.", 525],
          ["Fresa Mango (Strawberry Mango)", "Water-based paleta made with strawberry and mango.", 525],
          ["Mango Limon (Mango Lime)", "Water-based paleta made with mango and lime juice.", 525],
          ["Mango Tamarindo (Mango Tamarind)", "Water-based paleta made with mango and tamarind.", 525],
          ["Fresa Tamarindo (Strawberry Tamarind)", "Water-based paleta with strawberry and tamarind.", 525],
          ["Pepino Chile (Pepino Chili)", "Water-based paleta made with cucumber, Tajin, and chamoy.", 595],
          ["Limon Chia (Lime Chia Seeds)", "Water-based paleta with fresh lime juice and chia seeds.", 525],
          ["Fresa Limon (Strawberry Lime)", "Water-based paleta made with strawberry and lime juice.", 525],
          ["Pina Limon (Pineapple Lime)", "Water-based paleta made with pineapple and lime juice.", 525],
          ["Mango Habanero", "Water-based paleta made with mango and habanero peppers.", 525],
          ["Mango Menta (Mango Mint)", "Water-based paleta made with mango and mint leaves.", 525],
          ["Pepino (Cucumber)", "Water-based paleta made with cucumber.", 525],
          ["Mango Albahaca (Mango Basil)", "Water-based paleta made with mango and basil leaves.", 525],
          ["Fresa Albahaca (Strawberry Basil)", "Water-based paleta made with strawberry and basil leaves.", 525],
          ["Mango Jalapeño", "Water-based paleta made with mango and jalapeño peppers", 525],
          ["Papaya", "Water-based paleta with papaya.", 525],
          ["Sandia (Watermelon)", "Water-based paleta made with watermelon.", 525],
          ["Fresa Chile (Strawberry Chili)", "Water-based paleta made with strawberries, Tajin, and chamoy.", 595],
          ["Jamaica Chile (Hibiscus Chili)", "Water-based paleta made with hibiscus flower, Tajin and chamoy.", 595],
          ["Cosmo", "Water-based paleta made with a blended mix of fresh watermelon, mango, pineapple, and cucumber with Tajin and…", 675],
          ["Kiwi Pepino (Kiwi Cucumber)", "Water-based paleta made with kiwi, cucumber, and lime juice.", 525],
          ["Limonada de Pepino (Cucumber Lemonade)", "Water-based paleta made with cucumber and lemon juice.", 525],
          ["Limonada de Blueberry (Blueberry Lemonade)", "Water-based paleta made with blueberry and lemon juice.", 525],
          ["Melón Chile (Cantaloupe Chili)", "Water-based paleta made with cantaloupe, Tajin, and chamoy.", 595],
          ["Limonada de Fresa (Strawberry Lemonade)", "Water-based paleta made with strawberry and lemon juice.", 525],
          ["Piña Chile (Pineapple Chili)", "Water-based paleta made with pineapple, Tajin, and chamoy.", 595],
          ["Piña (Pineapple)", "Water-based paleta made with pineapple.", 525],
          ["Maracuya (Passion Fruit)", "Water-based paleta made with passion fruit.", 525],
          ["Guayaba Lechera (Guava Condensed Milk)", "Water-based paleta made with guava and condensed milk filling.", 595],
          ["Honeydew", "Water-based paleta made with honeydew melon.", 525],
          ["Honeydew Fresa", "Water-based paleta made with honeydew melon and strawberry.", 525],
          ["Maracuya Piña (Passion Fruit Pineapple)", "Water-based paleta made with passion fruit and pineapple.", 525],
          ["Sandia Limon (Watermelon Lime)", "Water-based paleta made with watermelon and lime juice.", 525],
          ["Mango", "A water-based paleta made with fresh mangos.", 525],
          ["Sandia Fresa (Watermelon Strawberry)", "Water-based paleta made with watermelon and strawberry.", 525],
          ["Guayaba Fresa (Guava Strawberry)", "Water-based paleta made with strawberry and guava.", 525],
          ["Guanabana (Soursop)", "Water-based paleta made with soursop.", 525],
          ["Mango Guanabana (Mango Soursop)", "Water-based paleta made with soursop and mango.", 525],
          ["Limon (Lime)", "Water-based paleta made with fresh lime juice.", 525],
          ["Jamaica (Hibiscus)", "Water-based paleta made with hibiscus flower.", 525],
          ["Mango Maracuya (Mango Passion Fruit)", "Water-based paleta made with mango and passion fruit.", 525],
          ["Vibras", "A water-based paleta made with fresh kiwi, mango, strawberry.", 525],
          ["Pickle Chili", "Water-based paleta made with pickle, chamoy and tajin.", 525],
          ["Guayaba Guanabana (Guava Soursop)", "Water-based paleta made with guava and soursop.", 525],
          ["Honeydew Mango", "Water-based paleta made with honeydew melon and mango.", 525],
          ["Jamaica Blueberry (Hibiscus Blueberry)", "Water-based paleta with hibiscus flower and strawberry.", 525],
          ["Strawberry Shortcake", "Milk-based paleta made with a strawberry water-based filling and strawberry shortcake crumbs outside covering.", 675],
          ["Limon Gushers (Lime Gushers)", "Water-based paleta made with fresh lime juice and Gushers candy inside.", 525],
          ["Piña Berries (Pineapple Berries)", "Water-based paleta made with pineapple, strawberries, blueberries, raspberries and blackberries.", 525],
          ["Limonada (Lemonade)", "Water-based paleta made with lemon juice.", 525],
          ["Sandia Berries (Watermelon Berries)", "Water-based paleta made with watermelon, strawberries, blueberries, raspberries and blackberries.", 525],
          ["Pickle", "Water-based paleta made with pickles.", 525],
          ["Lychee Mango", "A water-based paleta made with lychee and mango..", 525]
        ]
      },
      {
        name: "Paletas de Leche (Milk-based)",
        items: [
          ["Oreos", "Milk-based paleta made with chocolate oreo and golden oreo cookie.", 525],
          ["Fruity Pebbles", "Milk-based paleta made with Fruity Pebbles cereal.", 525],
          ["Blueberry Horchata", "Milk-based paleta made with blueberry and our Horchata mix.", 525],
          ["Coco Nuez (Coconut Pecan)", "Milk-based paleta made with coconut, shredded coconut, and pecan.", 525],
          ["Matcha Fresa (Matcha Strawberry)", "Milk-based paleta made with matcha green tea and strawberry.", 525],
          ["Cafe Oreo (Coffee Oreo)", "Milk-based paleta ma de with coffee, chocolate Oreo cookie, almonds and chocolate syrup.", 525],
          ["Reeses", "Milk-based paleta with made with Reese's peanut butter chocolate candy.", 525],
          ["Aguacate Ferrero (Avocado Ferrero Rocher)", "Milk-based paleta made with avocado and Ferrero Rocher Hazelnut chocolate.", 525],
          ["Matcha Coco (Matcha Coconut)", "Milk-based paleta made with matcha green tea, coconut and shredded coconut.", 525],
          ["Pumpkin Spice Cafe", "Milk-based paleta made with pumpkin, coffee and pumpkin spice.", 525],
          ["Rompompe (Eggnog)", "Milk-based paleta made with eggnog.", 525],
          ["Ube Coco (Ube Coconut)", "Milk-based paleta made with ube, coconut and shredded coconut flakes.", 525],
          ["Chocolate de Abuelita Horchata (Mexican Hot Chocolate Horchata)", "Milk-based paleta made with Abuelita's Hot Chocolate, our horchata mix and cinnamon.", 525],
          ["Platano Matcha (Banana Matcha)", "Milk-based paleta made with banana and matcha green tea.", 525],
          ["Ube Coco Horchata", "Milk-based paleta made with Ube, coconut, shredded coconut flakes and our house horchata mix.", 525],
          ["Crema de Maracuya (Passion Fruit Cream)", "Milk-based paleta made with passionfruit.", 525],
          ["Cookie Monster", "Milk-based paleta made with Chips Ahoy! and Oreo cookie.", 525],
          ["Dubai Chocolate", "Milk-based paleta made with chocolate outside, pistachio, katifi and pistachio paste.", 695],
          ["Platano Nuez (Banana Pecan)", "Milk-based paleta made with banana and pecan.", 525],
          ["Street Paleta", "Milk-based made with our house Horchata mix, orange and ube.", 525],
          ["Oreo Ahoy!", "Milk-based paleta made with Chips Ahoy! and Oreo cookie.", 525],
          ["Matcha Coconut Horchata", "Milk-based paleta with our Horchata mix, coconut, shredded coconut, matcha green tea and cinnamon.", 525],
          ["Horchata Biscoff", "Milk-based paleta made with Biscoff cookie, our Horchata mix and cinnamon.", 525]
        ]
      },
      {
        name: "Ice Cream & Sorbet",
        items: [
          ["Gansito", "From – Milk-based ice cream made with Gansito cake snack, Strawberry jam and Chocolate.", 525],
          ["Limon (Lime)", "From – Water-based sorbet made with lime juice.", 525],
          ["Fresa (Strawberry)", "From – Water-based sorbet made with strawberry.", 525],
          ["Sandia (Watermelon)", "From – Water-based sorbet made with watermelon.", 525],
          ["Mango", "From – Water-based sorbet made with mango.", 525],
          ["Birthday Cake", "From – Milk-based ice cream made with golden oreo cookie and rainbow sprinkles.", 525],
          ["Berries And Cream", "From – Milk-based ice cream made with strawberry, blueberry, raspberry and blackberry.", 525],
          ["Cafe Chocolate de Abuelita (Coffee Mexican Hot Chocolate)", "From – Milk-based ice cream made with coffee and Abuelita's Mexican hot chocolate.", 525],
          ["Cafe Oreo (Coffee Oreo)", "From – Milk-based ice cream made with coffee, Oreo cookie, almonds and chocolate syrup.", 525],
          ["Chicle (Bubble Gum)", "From – Milk-based ice cream made with pink and blue bubble gum flavoring.", 525],
          ["Cinnamon Toast Crunch", "From – Milk-based ice cream made with Cinnamon Toast Crunch cereal.", 525],
          ["Chocolate Oreo", "From – Milk-based ice cream made with 100% Cocoa and Oreos cookie.", 525],
          ["Coco Nuez (Coconut Pecan)", "From – Milk-based ice cream made with coconut, pecan and shredded coconut.", 525],
          ["Coco Horchata (Coconut Horchata)", "From – Milk-based ice cream made with our horchata mix, coconut, shredded coconut, and cinnamon.", 525],
          ["Cookie Monster", "From – Milk-based ice cream made with Chips Ahoy! and Oreo cookie.", 525],
          ["Ferrero Rocher", "From – Milk-based ice cream made with Ferrero Rocher hazelnut chocolate.", 525],
          ["Fresa Oreo (Strawberry Oreo)", "From – Milk-based ice cream made with strawberry and oreo cookie.", 525],
          ["Fruity Pebbles", "From – Milk-based ice cream made with Fruity Pebbles cereal.", 525],
          ["Honey Lavender", "From – Milk-based ice cream made with honey and lavender.", 525],
          ["Kit Kat", "From – Milk-based ice cream made with Kit-Kat chocolate candy.", 525],
          ["Malteada de Fresa (Strawberry Milkshake)", "From – Milk-based ice cream made with strawberry and cinnamon.", 525],
          ["Crema De Mango Coco (Mango Coconut Cream)", "From – Milk-based ice cream made with mango, coconut, and shredded coconut.", 525],
          ["Crema de Mango (Mango Cream)", "From – Milk-based ice cream made with mango.", 525],
          ["Matcha Horchata", "From – Milk-based ice cream made with matcha green tea and our horchata mix.", 525],
          ["Mazapan", "From – Milk-based ice cream made with de la rosa mazapan peanut candy.", 525],
          ["Menta Oreo (Mint Oreo)", "From – MIlk-based ice cream made with mint and oreo cookie.", 525],
          ["Oreo Horchata", "From – Milk-based ice cream made with oreo cookie and our horchata mix.", 525],
          ["Oreos", "From – Milk-based ice cream made with golden oreo and chocolate oreo cookie.", 525],
          ["Pistachio", "From – Milk-based ice cream made with pistachio.", 525],
          ["Platano Brownie (Banana Brownie)", "From – Milk-based ice cream with banana and sugar bowl bakery brownie bites.", 525],
          ["Reese's", "From – Milk-based ice cream made with reese's peanut chocolate candy.", 525],
          ["Strawberry Cheesecake", "From – Milk-based ice cream made with our cheesecake mix, strawberry, strawberry jam.", 525],
          ["Ube Brownie", "From – Milk-based ice cream made with ube and sugar bowl bakery brownie bites.", 525],
          ["Ube Horchata", "From – Milk-based ice cream made with ube and our horchata mix.", 525],
          ["Vanilla Bean", "From – Milk-based ice cream made with vanilla bean.", 525],
          ["Vanilla Bean Biscoff", "From – Milk-based ice cream made with vanilla bean and biscoff cookie.", 525],
          ["White Chocolate Raspberry", "From – Milk-based ice cream made with white chocolate, raspberry and chocolate chips.", 525],
          ["Cafe Biscoff (Coffee Biscoff)", "From – Milk-based ice cream made with coffee and biscoff cookie.", 525],
          ["Cajeta Nuez (Caramel Pecan)", "From – Milk-based ice cream made with goat milk caramel and pecan.", 525],
          ["Mango Horchata", "From – Milk-based ice cream made with mango and our horchata mix.", 525],
          ["Fresa Horchata (Strawberry Horchata)", "From – Milk-based ice cream made with strawberry and our horchata mix.", 525],
          ["Key Lime", "From – Milk-based ice cream made with key lime and graham cracker.", 525],
          ["Cafe Ferrero Rocher (Coffee Ferrero Rocher)", "From – Milk-based ice cream made with Ferrero Rocher hazelnut chocolate and coffee.", 525],
          ["The Grinch", "From – Milk-based ice cream made with vanilla bean, sugar cookie and holiday sprinkles.", 525],
          ["Platano Oreo (Banana Oreo)", "From – Milk-based ice cream with banana and Oreo cookie.", 525],
          ["Blueberry Coco (Blueberry Coconut)", "From – Milk-based ice cream made with blueberry and coconut.", 525],
          ["Ube Honey", "From – Milk-based ice cream made with Ube and honey.", 525],
          ["Cafe Horchata (Coffee Horchata)", "From – Milk-based ice cream made with coffee, our horchata mix and cinnamon.", 525],
          ["Cafe Brownie (Coffee Brownie)", "From – Milk-based ice cream made with coffee and Sugar Bowl Brownie bites.", 525],
          ["Platano Pudin Biscoff (Banana Pudding Biscoff)", "From – Milk-based ice cream with banana, condensed milk and Biscoff cookie.", 525],
          ["Coco (Coconut)", "From – Milk-based ice cream made with coconut and shredded coconut.", 525],
          ["Ferrero Rocher Brownie", "From – Milk-based ice cream made with Ferrero Rocher hazelnut chocolate and sugar bowl brownie bites.", 525],
          ["Kinder Bueno Chocolate", "From – Milk-based ice cream made with Kinder Bueno chocolate. Contains: Hazelnut filling.", 525],
          ["Horchata Brownie", "From – Milk-based ice cream with our mexican rice water mix, sugar bowl bakery brownie bites, cinnamon and sweetener.", 525],
          ["S'Mores", "From – Milk-based ice cream made with vanilla bean, graham cracker cookie, toasted marshmallows and chocolate syrup.", 525],
          ["Peanut Butter Brownie", "From – Milk-based ice cream made with peanut butter and sugar bowl bakery brownie bites.", 525],
          ["Mango Coco Biscoff (Mango Coconut Biscoff)", "From – Milk-based ice cream made with mango, coconut, shredded coconut and biscoff cookie.", 525],
          ["Peanut Butter Oreo", "From – Milk-based ice cream made with peanut butter and Oreo cookie.", 525],
          ["Chocolate Brownie", "From – Milk-based ice cream with 100% cocoa and sugar bowl bakery brownie bites.", 525],
          ["Dark Chocolate Sea Salt Caramel", "From – Milk-based ice cream made with dark chocolate and sea salt caramel.", 525],
          ["Rocky Road", "From – Milk-based ice cream made with 100% Cocoa, marshmallows and almonds.", 525]
        ]
      }
    ],
    email: "info@paletaplaneta.com",
    siteNote: "Menu and prices are from the online store on their own website (Square Online), paletaplaneta.com."
  },
  'pamilya': {
    hours: "Tue–Sun 11am–8pm, Closed Mon",
    address: "756 Woodside Rd, Redwood City, CA 94061",
    orderUrl: "https://order.toasttab.com/online/pamilya-756-woodside-rd",
    email: "pamilya.sf@gmail.com",
    siteNote: "Hours and address are from pamilyakitchen.com."
  },
  'pampas-vacaville': {
    sections: [
      {
        name: "Rodízio (Dine-In, per person)",
        items: [
          ["Premium Pampas Rodízio", "Expanded chef-selected premium cuts carved tableside, plus Market Table and hot sides", 7495],
          ["Special Pampas Rodízio", "13 grilled cuts served tableside, plus unlimited Market Table and hot sides", 4995],
          ["Market Table Dinner", "50+ cold and hot selections: salads, seafood, Brazilian sides", 4195],
          ["Weekday Lunch Rodízio", "Mon–Fri lunch", 4495],
          ["Weekday Lunch Market Table", "Mon–Fri lunch", 3495],
          ["Tuesday Couples Night", "Full rodízio for two, Tuesdays 5–9pm", 11000]
        ]
      },
      {
        name: "From the Grill (Takeout)",
        items: [
          ["Picanha", "", 2500],
          ["Spicy or Jalapeño Picanha", "", 2700],
          ["Ribeye", "", 4000],
          ["Beef Ribs", "", 3500],
          ["Pork Ribs", "", 1800],
          ["Brazilian Sausage", "", 1900],
          ["Grilled Shrimp", "", 2300],
          ["Baked Salmon", "", 3100],
          ["Grilled Pineapple", "", 800],
          ["Queijo Coalho", "Grilled Brazilian cheese", 1800]
        ]
      },
      {
        name: "Sides (Takeout)",
        items: [
          ["Brazilian Cheese Bread", "", 600],
          ["French Fries", "", 600],
          ["House Salad", "", 600],
          ["Grilled Vegetables", "", 600],
          ["Mashed Potatoes", "", 600],
          ["Fried Bananas", "", 600],
          ["Rice and Beans", "", 600]
        ]
      },
      {
        name: "Bar Food",
        items: [
          ["Fried Calamari", "", 1800],
          ["Pão de Alho", "Garlic bread", 800],
          ["Chicken Special Burger", "", 1200],
          ["Tropical Pork Burger", "", 1500],
          ["Toro Burger", "", 1800],
          ["Carnaval Fire", "", 2200],
          ["Fire and Flavor", "", 2200],
          ["Picanha Sandwich", "", 1600]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Tres Leches Cake", "", 1195]
        ]
      }
    ],
    hours: "Mon–Fri 11:30am–2:30pm & 5pm–9pm, Sat 12pm–10pm, Sun 12pm–8pm",
    orderUrl: "https://www.toasttab.com/local/order/pampas-brazilian-steakhouse-vacaville",
    siteNote: "Rodízio prices and hours from their website; à la carte takeout items from their Toast ordering page."
  },
  'papi-clarys-kitchen': {
    sections: [
      {
        name: "Birria",
        items: [
          ["Birria Tacos", "Street taco size with birria, onion, cilantro, salsa and limes", 350],
          ["Quesabirria", "6-inch corn tortilla with melted cheese, onion, cilantro and birria", 475],
          ["Keto Birria Taco", "Crusted cheese as the shell with birria, onions, cilantro and guac", 450],
          ["Birria Mulita", "Two crispy tortillas with cheese, birria, onion, cilantro and guac", 450],
          ["Birria Quesadilla", "13-inch flour tortilla with cheese, birria, onion, cilantro and guac", 1450],
          ["Birria Grilled Cheese", "Crispy thick Texas toast with melted cheese, birria, onion and cilantro", 1300],
          ["Birria Fries", "Seasoned fries with cheese, birria, onion, cilantro, guac and sour cream", 1400],
          ["Birria Mac & Cheese", "", 1250]
        ]
      },
      {
        name: "Spicy Chicken",
        items: [
          ["Spicy Chicken Sandwich", "Fried chicken breast on brioche with homemade mango slaw and spicy aioli", 1250],
          ["Spicy Chicken Sliders", "Mini version of the spicy chicken sandwich", 400],
          ["Spicy Chix Sliders 2", "", 750],
          ["CJ Special", "Spicy chicken sandwich wrapped with cheese, with fries added", 1350],
          ["Spicy Chicken Fries", "Seasoned fries, fried chicken, cheese, sour cream, guac and spicy aioli", 1400]
        ]
      },
      {
        name: "Sides & Extras",
        items: [
          ["Cheese Quesadilla", "Plain cheese quesadilla, no meat or onion/cilantro", 700],
          ["Mac n Cheese (no meat)", "24 oz plain mac n cheese", 800],
          ["Side Fries", "Seasoned fries", 400],
          ["Crusted Cheese", "Add to any item", 150]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Regular Agua Fresca", "16 oz, choice of flavor", 325],
          ["Large Agua Fresca", "24 oz, choice of flavor", 425],
          ["Ube Horchata", "24 oz horchata with ube flavor", 550]
        ]
      }
    ],
    hours: "Wed–Sat 11am–9:30pm, Sun 11am–6pm, Closed Mon–Tue",
    orderUrl: "https://papiclaryskitchen.square.site/",
    siteNote: "Menu and prices are from their own Square ordering site; hours from their Instagram bio and Yelp."
  },
  'parada-new-peru': {
    sections: [
      {
        name: "Cebiche",
        items: [
          ["Cebiche de Pescado", "Fresh fish in lime juice, aji rocoto leche de tigre", 2400],
          ["Cebiche Mixto", "Fresh fish, calamari, mussels, camarones, and aji rocoto leche de tigre", 2500],
          ["Cebiche Chino Peruano", "Ahi tuna, rocoto-sweet chili, tamarind, roasted nori, cucumbers, green onions, and cilantro", 2600],
          ["Home Made Chips", "Highly recommended for your cebiche", 600],
          ["Cebiche Shrimp", "Cilantro-lime base, avocado, choclo, cancha and wild shrimp.", 2700],
          ["Cebiche Tasting", "Three cebiches: pescado, mixto and tuna.", 3600],
          ["Tuna Tartare", "Ahi tuna in rocoto-tamarind sauce, scallions, avocado, and house-made chips", 2600]
        ]
      },
      {
        name: "Bocaditos",
        items: [
          ["Classic Peruvian Hangover Soup", "Rice noodles, cilantro-ginger base & vegetables", 1600],
          ["Quinoa Salad", "Mixed field greens, onions, Andean corn, queso fresco & lime-passionfruit vinaigrette", 1500],
          ["Parada Mac 'n Cheese", "Smoked bacon, huancaina sauce, and microgreens", 1500],
          ["Tequeños", "Crispy wontons stuffed with oaxaca cheese, avocado, & tamarind sauce", 1500],
          ["Chicharrones", "Breaded with rice flour and fried.", 1600],
          ["Roasted Farm Beet Salad", "Beets, lime vinaigrette, onions, choclo, cancha, mint, cilantro, potatoes and feta", 1600],
          ["Palta Rellena", "Half avocado stuffed with chicharron de pollo, lime and house mayonnaise", 1600],
          ["Empanada Trío No Pollo", "Corn, beef, and mushroom empanadas with traditional Peruvian sauce", 2000],
          ["Mushroom Empanada Trio", "Three homemade portobello mushroom empanadas (made with cheese).", 2000],
          ["Corn Empanada Trio", "Three homemade corn (choclo) empanadas (made with cheese).", 2000],
          ["Chicken Empanada Trio", "Three homemade empanadas with chicken and Peruvian spices.", 2000],
          ["Beef Empanada Trio", "Three homemade ground beef empanadas.", 2000],
          ["Empanada Sampler #4", "One each: mushroom, corn, chicken, beef.", 2300],
          ["Langostinos Crocantes", "Quinoa encrusted shrimp, sweet mashed potatoes, and tamarind sauce", 1900],
          ["Jalea", "Deep-fried calamari, mussels, shrimp, fish, rocoto aioli, and lemon", 3000],
          ["Pulpo a la Parrilla", "Grilled baby octopus, blue mashed potato, and anticucho panca sauce.", 2500]
        ]
      },
      {
        name: "Platos de Fondo",
        items: [
          ["Lomo Saltado", "Stir-fried chicken or beef tenderloin with onions, tomatoes, gluten-free soy sauce, french fries", 3000],
          ["Pollo Saltado", "Stir-fried chicken with onions, tomatoes, soy sauce and fries", 2800],
          ["Veggie Saltado", "", 2800],
          ["Adobo", "Snake River pork shoulder, Cusqueña-panca base, potato gratin, and salsa criolla", 3000],
          ["Aji de Gallina", "Peruvian chicken stew in aji-amarillo base served with jasmine rice", 2800],
          ["Costillitas", "Pork spareribs with gochujang-Inca Kola BBQ sauce, salsa-fusion, and coleslaw", 1800],
          ["Anticuchos", "Street-cart style grilled skewers marinated in panca paste and Peruvian spices", 1800],
          ["Arroz con Marisco", "Peruvian style, bomba rice, saffron-paprika base & Peruvian beer", 3200],
          ["Salmon Bandido", "Grilled wild king salmon, blue mashed potatoes, and escabeche", 3200],
          ["Pescado a lo Macho", "Local catch over seafood stew, mild rocoto-paprika sauce, and jasmine rice", 3400],
          ["Churrasco", "16oz grass-fed Black Angus New York steak, panca, aji chimichurri butter, watercress salad", 4900],
          ["Arroz Chaufa with Pork", "Chinese-inspired fried rice, pork, and onions", 2800],
          ["Papa a la Huancaina", "Roasted potatoes, aji amarillo-feta sauce, smoked bacon, half an egg and sarsita", 1400],
          ["Pollo a la Brasa Whole Chicken", "Mary's organic rotisserie chicken with French fries and a side salad.", 4500],
          ["Pollo a la Brasa Half Chicken", "Mary's organic rotisserie chicken with French fries and a side salad.", 2500]
        ]
      },
      {
        name: "Lunch Box",
        items: [
          ["Pan Crispy Chicken", "Crispy chicken marinated in aji-amarillo, lemon, sea salt, coleslaw, crema de rocoto & cilantro", 2000],
          ["Pan BBQ Pork", "Crispy pork Shoulder, Inca cola BBQ sauce, coleslaw and rocoto", 2000],
          ["Pan con Adobo", "Slow-braised pork shoulder in Cusqueña aji panca sauce, crema de rocoto and salsa criolla on a local roll.", 2500],
          ["Pan Con Chicharron Pork", "Sliced roasted pork loin, fried yams, marinated onions in lime juice & crema de rocoto", 2000],
          ["Pan Con Lomo", "Stir-fried beef tenderloin, tomatoes, onions, gluten-free soy sauce & crema de rocoto", 2000],
          ["Pan con Salmon", "Grilled salmon, avocado and escabeche", 2600]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Jasmine Rice", "", 300],
          ["Yucca Fries", "Large, golden and crispy outside, soft inside.", 1300],
          ["Sweet Potato Fries", "", 900],
          ["Platanos Fritos", "Ripe plantains, caramelized around the edges.", 900],
          ["Sautéed Spinach with Garlic", "", 1000],
          ["Sautéed Veggies", "Squash, onions, tomatoes, garlic and green onions", 1200],
          ["Garlic Fries", "", 900],
          ["Garlic Bread", "", 800],
          ["French Fries", "", 800],
          ["Tacu-Tacu", "Beans and rice with Peruvian seasonings.", 800]
        ]
      },
      {
        name: "Sweets",
        items: [
          ["Alfajores", "Homemade Peruvian cookies filled with dulce de leche", 900],
          ["Panna Cotta", "Vanilla coconut panna cotta with passion fruit sauce", 1200]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["Tequeños Kid", "", 1500],
          ["Mac N Cheese Kid", "", 1700],
          ["Chicken Strips", "", 1600]
        ]
      },
      {
        name: "Non-Alcoholic Beverages",
        items: [
          ["Chicha Morada", "Andean drink made from purple corn, fruit and spice.", 500],
          ["Maracuya", "Passion fruit drink.", 500],
          ["Inca Cola", "", 500],
          ["Abita Root Beer", "", 450],
          ["Ginger Beer", "", 450],
          ["Coca Cola", "", 450],
          ["Sprite", "", 450],
          ["Diet Coke", "", 400],
          ["Q Tonic Water", "", 400]
        ]
      },
      {
        name: "Sauces (2 oz)",
        items: [
          ["Yellow Huancaina Sauce", "Queso, aji and cream.", 150],
          ["Pink Rocoto Aioli Sauce", "", 150],
          ["Green Huacatay Sauce", "", 150],
          ["Spicy Rocoto Sauce", "", 150],
          ["Chimichurri Sauce", "", 150]
        ]
      },
      {
        name: "Family Feast",
        items: [
          ["Family Feast #1", "Feeds 3: quinoa salad, empanada sampler of 4, aji de gallina, lomo saltado and alfajores.", 7500],
          ["Family Feast #2", "Quinoa salad, 2 empanada samplers, lomo saltado, adobo, aji de gallina, 6 alfajores.", 10500]
        ]
      }
    ],
    orderUrl: "https://order.toasttab.com/online/parada-wc-7001-sunne-ln-suite-116",
    siteNote: "Menu and prices from their own Toast online ordering page for Parada WC (7001 Sunne Ln, Suite 116, Walnut Creek)."
  },
  'pattys-diner': {
    hours: "Wed–Sun 9am–8:30pm, Mon 11:15am–8:30pm, Closed Tue",
    siteNote: "Hours come from the All hours list on Patty's Diner's own Toast ordering page."
  },
  'paulo-sausage': {
    hours: "Sat 8am–12pm at Brentwood Farmers' Market; Sun 9am–1pm at Martinez Farmers' Market",
    email: "info@paulosausageco.com",
    siteNote: "Market days are from their own website; times are the markets' published hours (PCFMA)."
  },
  'penelopes-coffee-berkeley': {
    hours: "Daily 6:30am–4:30pm",
    siteNote: "Hours are the Berkeley store's business hours on their own Square ordering site."
  },
  'penelopes-coffee-daly-city': {
    hours: "Mon–Fri 6am–6pm, Sat–Sun 7am–6pm",
    siteNote: "Hours are the Gellert Blvd store's business hours on their own Square ordering site."
  },
  'penelopes-coffee-foster-city': {
    hours: "Daily 7am–4:30pm",
    siteNote: "Hours are the Plaza View Ln store's business hours on their own Square ordering site; Atmosfy agrees."
  },
  'penelopes-coffee-san-mateo': {
    hours: "Mon–Fri 6am–5:45pm, Sat–Sun 7am–5:45pm",
    siteNote: "Hours are the Hillsdale store's business hours on their own Square ordering site."
  },
  'penelopes-coffee-sf': {
    hours: "Daily 7am–4:30pm",
    siteNote: "Hours are the Spear St store's business hours on their own Square ordering site."
  },
  'pho-daily': {
    phone: "(669) 267-9999"
  },
  'pho-nation-sf': {
    sections: [
      {
        name: "Noodle Soup/Pho",
        items: [
          ["Pho Nation Combo #1", "Rare steak, well done flanks, briskets, beef balls, tripes.", 1695],
          ["Pho Nation Combo #2", "Rare steak, well done flanks, briskets, tripes.", 1695],
          ["Rare Steak and Beef Balls Noodle Soup", "Tender rare steak and beef balls served in a savory noodle soup.", 1595],
          ["Rare Steak and Well Done Briskets Noodle Soup", "Tender rare steak and well-done briskets served in a savory noodle soup.", 1595],
          ["Well Done Briskets Noodle Soup", "Tender briskets served in a flavorful noodle soup.", 1595],
          ["Rare Steak Noodle Soup", "Tender steak and noodles in a savory broth.", 1595],
          ["Beef Balls Noodle Soup", "Tender beef balls served in a flavorful noodle soup.", 1595],
          ["Pho Chicken Breast", "Tender chicken breast in a flavorful broth.", 1595],
          ["Pho Chicken Quarter", "Chicken quarter served in a flavorful broth.", 1595],
          ["Pho Shrimp", "Shrimp noodle soup in a flavorful broth.", 1695],
          ["Plain Pho and Soup", "Traditional Vietnamese noodle soup served in a savory broth.", 1195],
          ["Vegetarian Pho Tofu and Mixed Veggies", "Tofu and mixed veggies in a flavorful broth.", 1495]
        ]
      },
      {
        name: "Vermicelli/Bun",
        items: [
          ["House Special Vermicelli", "Grilled chicken, pork, shrimp.", 1995],
          ["Grilled Chicken and Salad Vermicelli", "Grilled chicken on vermicelli noodles with a fresh salad.", 1695],
          ["Grilled Pork and Salad Vermicelli", "Grilled pork on vermicelli noodles with a fresh salad.", 1695],
          ["Grilled Shrimps and Salad Vermicelli", "Shrimps on vermicelli noodles with a fresh salad.", 1895],
          ["Eggrolls and Salad Vermicelli", "Vermicelli noodles with egg rolls and a fresh salad.", 1695],
          ["Vegetarian Tofu and Salad Vermicelli", "Tofu and salad over vermicelli noodles.", 1595]
        ]
      },
      {
        name: "Rice Plate/Com Dia",
        items: [
          ["Combo Rice Plate #1", "Grilled chicken, pork, shrimp, salad and soup.", 1895],
          ["Combo Rice Plate #2", "Chicken wings, pork chop, egg roll, salad, soup.", 1895],
          ["Grilled Chicken and Salad Rice Plate", "Grilled chicken with a side of salad and rice.", 1695],
          ["Grilled Pork and Salad Rice Plate", "Grilled pork with a side of salad and rice.", 1695],
          ["Grilled Porkchop and Salad Rice Plate", "Grilled porkchop with a side of salad and rice.", 1795],
          ["Grilled Shrimps and Salad Rice Plate", "Shrimps with a side of salad and rice.", 1895],
          ["Grilled Beef Short Ribs and Salad Rice Plate", "Beef short ribs with a side of salad and rice.", 2095],
          ["Steamed Chicken and Salad Rice Plate", "Steamed chicken with a side of salad and rice.", 1695],
          ["Vegetarian Tofu and Mixed Veggies Rice Plate", "Tofu and mixed veggies over rice.", 1595]
        ]
      },
      {
        name: "Appetizers/Khai Vi",
        items: [
          ["Fried EggRolls", "", 895],
          ["Fried Chicken Wings", "", 1095],
          ["Fried Shrimp Rolls", "", 995],
          ["Fried Potstickers", "", 895],
          ["Fresh Shrimp Spring Rolls", "", 1095],
          ["Vegetarian Spring Rolls", "", 1095]
        ]
      },
      {
        name: "Drinks/Nuoc Ngot",
        items: [
          ["Thai Ice Tea", "", 595],
          ["Soda", "", 250],
          ["VN Ice Coffee Milk", "", 695],
          ["Coconut Juice Can", "", 350],
          ["Fresh Lemonade", "", 595],
          ["Apple Juice", "", 395],
          ["Bottled Water", "", 200],
          ["VN Black Ice Coffee", "", 595]
        ]
      },
      {
        name: "Smoothies/Sinh To",
        items: [
          ["Wildberry Smoothie", "", 595],
          ["Strawberry Smoothie", "", 595],
          ["Strawberry Banana Smoothie", "", 595],
          ["Avocado Smoothie", "", 695],
          ["Mango Smoothie", "", 595],
          ["Peach Smoothie", "", 595]
        ]
      },
      {
        name: "Add On / Them",
        items: [
          ["Briskets", "", 350],
          ["Noodle", "", 350],
          ["Beef Soup", "", 225],
          ["Rare Steak", "", 350],
          ["Grilled Pork", "", 450],
          ["Grilled Beef Short Rib", "", 595],
          ["Rice", "", 350],
          ["Beef Balls", "", 350],
          ["Tripes", "", 350],
          ["Grilled Chicken", "", 450],
          ["Tofu", "", 295],
          ["Egg", "", 250],
          ["Salad", "", 295],
          ["Shrimps", "", 450],
          ["Eggroll", "", 275],
          ["Mixed Vegetables", "", 295],
          ["Grilled Porkchop", "", 595],
          ["Chicken Soup", "", 295],
          ["Extra Salad for Pho", "", 295],
          ["Extra Steamed Chicken", "", 450],
          ["Extra Onion Vinegar", "", 250],
          ["Chicken Breast", "", 450]
        ]
      }
    ],
    hours: "Daily 10am–7:45pm",
    phone: "(415) 347-7115",
    orderUrl: "https://www.ubereats.com/store/pho-nation-sf/65OKMlGSRKSRUUZ4a_MmtQ",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu and hours from their Uber Eats store (2428 San Bruno Ave); DoorDash lists the same 10am–7:45pm hours."
  },
  'phosho-dough': {
    hours: "Mon–Sat 11am–7pm, Closed Sun",
    phone: "(510) 788-5755",
    siteNote: "Hours are from their Instagram bio, Yelp and MapQuest, which agree."
  },
  'pi-wings': {
    sections: [
      {
        name: "Wing Boxes",
        items: [
          ["5 Wing Box", "5 wings, 1 flavor; with calamansi ranch", 1380],
          ["8 Wing Box", "8 wings, 2 flavors; with calamansi ranch", 2070],
          ["25 Wing Box", "25 wings, 1 flavor, 3 sides of calamansi ranch", 6218],
          ["Single Wing", "Adobo, Bicol Express, Kare Kare, Sinigang, Arroz Caldo or Sisig", 280]
        ]
      },
      {
        name: "Wing Combos",
        items: [
          ["5 Wing Rice Combo Box", "5 wings, 1 flavor, rice and a drink", 2070],
          ["5 Wing Fries Combo Box", "5 wings, 1 flavor, battered fries and a drink", 2300],
          ["8 Wing Rice Combo Box", "8 wings, 2 flavors, rice and a drink", 2530],
          ["8 Wing Fries Combo Box", "8 wings, 2 flavors, battered fries and a drink", 2875]
        ]
      },
      {
        name: "P.I. Tacos",
        items: [
          ["Steak Taco", "Grilled steak, green onions and jalapeños on a soft tortilla", 460],
          ["Pork Belly Taco", "Crispy pork belly, green onions and jalapeños on a soft tortilla", 460]
        ]
      },
      {
        name: "Extras",
        items: [
          ["Rice", "", 460],
          ["Lumpia Shanghai", "Pork fried spring rolls with sweet chili sauce", 920],
          ["Battered Fries", "Crispy seasoned battered fries with calamansi ranch", 1150],
          ["Bistek Cheesesteak Fries", "Half pound grilled steak & onions, provolone, garlic citrus soy gravy, cheese sauce, pickled onions", 2300],
          ["Pork Belly Sisig Fries", "Half pound citrus-soy pork belly, provolone, pickled onion, sisig-seasoned fries, calamansi ranch", 2415],
          ["Extra Calamansi Ranch", "", 250]
        ]
      },
      {
        name: "Boba",
        items: [
          ["White Rabbit Candy", "24 oz creamy candied milk", 976],
          ["Calamansi Iced Tea", "24 oz calamansi juice and black sweet tea", 976],
          ["Choc-Nut Candy", "Chocolate-and-nut flavored drink; boba optional", 1035]
        ]
      },
      {
        name: "Beverages",
        items: [
          ["Bottled Water", "", 200],
          ["Soda Can", "", 300]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/pi-wings-daly-city-39037001/89593546/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Item names and flavors match the menu board on eatpiwings.com (which has no prices); prices are from their DoorDash store at 1900 Sullivan Ave."
  },
  'pijja-paradise-pittsburg': {
    hours: "Sun–Thu 9am–10:30pm, Fri–Sat 9am–11:30pm",
    orderUrl: "https://pittsburgpijjaparadise.menufy.com/",
    siteNote: "Hours from their own Menufy ordering page for the Pittsburg (2961 Railroad Ave) location."
  },
  'pineapple-king-bakery-san-francisco': {
    hours: "Mon–Fri 8am–6pm, Sat–Sun 8am–6:30pm",
    email: "info@pineapplekingbakery.com",
    siteNote: "Hours are from the San Francisco store hours on their own contact page."
  },
  'pink-element-cafe': {
    hours: "Mon–Fri 7am–8pm, Sat–Sun 9am–7pm",
    siteNote: "Hours come from the Pink Element Cafe page on The Pink Lab's own website."
  },
  'pippal': {
    hours: "Daily 11:30am–2pm & 5–10pm (Fri–Sat until 10:30pm)",
    phone: "(925) 587-1125",
    siteNote: "Hours and phone are from their own website's reservations page."
  },
  'pizza-casamia': {
    sections: [
      {
        name: "Pizzas",
        items: [
          ["Build Your Own Pizza", "From", 1494],
          ["All Meat", "From. Red sauce, mozzarella, pepperoni, salami, ham, Italian sausage, ground beef", 2414],
          ["Combo", "From. Red sauce, mozzarella, salami, pepperoni, mushrooms, green pepper, olives, sausage, ground beef", 2414],
          ["Hawaiian", "From. Red sauce, mozzarella, Canadian bacon, pineapple", 2414],
          ["Beef Bacon Cheeseburger Pizza", "From. Burger sauce, beef bacon, pickles, cheese, red onions, Roma tomatoes, ground beef", 2414],
          ["Italiana", "From. Garlic sauce, mozzarella, pepperoni, sausage, mushrooms, tomatoes, green onions, garlic", 2414],
          ["Pepperoni Blast", "From. Red sauce, mozzarella, double pepperoni, extra cheese", 2414],
          ["CasaMia Primo", "From. Red sauce, mozzarella, pepperoni, garlic, basil, tomatoes, olive oil, sea salt, sumac", 2414],
          ["Mexicana", "From. Chipotle sauce, mozzarella, cilantro, beef bacon, turkey ham, jalapeños, onion, pineapple, ground beef", 2414],
          ["Alfredo Chicken", "From. Alfredo sauce, grilled chicken, mozzarella, onions, spinach, garlic, mushrooms, Parmesan", 2414],
          ["BBQ Hawaiian", "From. BBQ sauce, mozzarella, BBQ chicken, Canadian bacon, pineapple, red onions", 2414],
          ["Buffalo Chicken", "From. Garlic sauce, mozzarella, buffalo chicken, red onion, tomatoes, cilantro", 2414],
          ["Chicken Bacon Ranch", "From. Garlic sauce, mozzarella, beef bacon, chicken, tomatoes, red onions, cilantro", 2414],
          ["Chipotle Chicken", "From. Garlic sauce, mozzarella, chipotle chicken, red onion, tomatoes, cilantro", 2414],
          ["Garlic Chicken", "From. Garlic sauce, mozzarella, chicken, mushrooms, red onions, cilantro", 2414],
          ["Pesto Chicken", "From. Pesto, mozzarella, artichoke hearts, mushrooms, tomatoes, red onions, garlic, chicken", 2414],
          ["Spicy Hawaiian", "From. Red sauce, mozzarella, hot & spicy chicken, tomatoes, bacon, pineapple", 2414],
          ["BBQ Chicken", "From. BBQ sauce, mozzarella, BBQ chicken, red onions, zucchini, cilantro, tomato", 2414],
          ["Nashville Hot Chicken", "From. Garlic sauce, mozzarella, Nashville hot chicken, cilantro, red onions, tomatoes, pickles", 2414],
          ["Garlic Spinaci", "From. Garlic sauce, mozzarella, spinach, mushrooms, tomatoes, feta, garlic", 2414],
          ["Margherita", "From. Red sauce, mozzarella, garlic, basil, tomatoes, olive oil, sea salt, sumac", 2414],
          ["Veggie Deluxe", "From. Red sauce, mozzarella, artichoke hearts, mushrooms, olives, tomatoes, green pepper, red onions, zucchini", 2414],
          ["Via Tuscana", "From. Pesto, mozzarella, mushrooms, spinach, sun-dried tomatoes, feta, garlic", 2414],
          ["Classic Vegetarian", "From. Red sauce, mozzarella, mushrooms, olives, tomatoes, green pepper, red onions", 2414]
        ]
      },
      {
        name: "Flatbreads",
        items: [
          ["Build Your Own Flatbread", "From", 1494],
          ["Bacon Ranch Flatbread", "From. Ranch sauce, mozzarella, crumbled bacon; side of marinara", 1494],
          ["Bruschetta Flatbread", "From. Roma tomatoes, basil, olive oil; side of marinara", 1494],
          ["Cheesy Flatbread", "From. Mozzarella; side of marinara", 1494],
          ["Garlic Flatbread", "From. Mozzarella, garlic, seasonings; side of marinara", 1494],
          ["Greek Flatbread", "From. Creamy garlic sauce, mozzarella, feta; side of marinara", 1494],
          ["Jalapeno Flatbread", "From. Mozzarella, jalapeños; side of marinara", 1494],
          ["Nashville Hot Flatbread", "From. Mozzarella, garlic sauce, jalapeños, Nashville hot drizzle", 1494],
          ["Pepperoni Flatbread", "From. Mozzarella, pepperoni; side of marinara", 1494],
          ["Pesto Flatbread", "From. Pesto, mozzarella; side of marinara", 1494]
        ]
      },
      {
        name: "Wings",
        items: [
          ["7pc Wings", "From. Fresh, never-frozen wings, marinated in-house and baked to order", 1609],
          ["14pc Wings", "From. Fresh, never-frozen wings, marinated in-house and baked to order", 2414],
          ["21pc Wings", "From. Fresh, never-frozen wings, marinated in-house and baked to order", 3334],
          ["50pc Wings", "From. Fresh, never-frozen wings, marinated in-house and baked to order", 7589]
        ]
      },
      {
        name: "Pasta",
        items: [
          ["Build Your Own Pasta", "From. Choose a sauce and one meat or veggie topping", 1839],
          ["Italian Sausage Pasta", "From. Penne, creamy tomato sauce, Italian sausage, cheese, oven baked", 1839],
          ["Chicken Alfredo Pasta", "From. Penne, Alfredo sauce, cheese, grilled chicken, oven baked", 1839],
          ["Pesto Chicken Pasta", "From. Penne, creamy pesto, cheese, grilled chicken, sun-dried tomato, oven baked", 1839],
          ["Nashville Hot Chicken Pasta", "From", 1839]
        ]
      },
      {
        name: "Salad",
        items: [
          ["Build Your Own Salad", "From", 1494],
          ["Caesar Salad", "From. Lettuce, cherry tomatoes, croutons, shaved Parmesan", 1494],
          ["Chef Salad", "From. Lettuce, ham, salami, cucumber, tomatoes, cheese, olives, pepperoncini, carrots", 1494],
          ["Chicken Caesar Salad", "From. Lettuce, cherry tomatoes, grilled chicken, croutons, shaved Parmesan", 1839],
          ["Garden Salad", "From. Lettuce, tomatoes, cheese, artichoke hearts, olives, cucumber, pepperoncini, carrots", 1494],
          ["Greek Salad", "From. Lettuce, tomatoes, onion, olives, cucumber, artichoke hearts, carrots, pepperoncini, feta", 1494]
        ]
      },
      {
        name: "Beverages",
        items: [
          ["Soda", "From", 401],
          ["Water Bottle", "From", 229]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Cheesecake", "From. Rich & creamy", 776],
          ["Pizza Cookie", "From. Chocolate chip cookie pizza", 1093]
        ]
      }
    ],
    hours: "Mon–Thu 11am–9:15pm, Fri–Sat 11am–9:45pm, Sun 11am–8:45pm",
    orderUrl: "https://order.online/store/pizza-casamia-san-jose-981762",
    pricesEstimated: "Prices are from their DoorDash-powered order.online store; delivery apps often charge more than the counter.",
    siteNote: "Menu and store hours come from their order.online (DoorDash) store page for the 1423 Branham Ln location."
  },
  'pizza-ponte': {
    sections: [
      {
        name: "Pizzas",
        items: [
          ["Classic Cheese Pizza", "From", 1200],
          ["Pepperoni Pizza", "From. 56-hour fermented dough, tomato sauce, mozzarella, beef pepperoni cups, parmesan, basil", 1500],
          ["Vegetarian", "From", 1500],
          ["Buffalo Chicken", "From. creamy white sauce, marinated chicken, buffalo sauce, parmesan, basil", 1500],
          ["Green Goddess Pizza", "From. creamy white sauce, minced garlic, spinach, nut-free pesto, parmesan, basil", 1500],
          ["Genoa Pesto", "From. tomato sauce, mozzarella, nut-free pesto, ricotta, parmesan, basil", 1600],
          ["Combo Combo Pizza", "From. red sauce, mozzarella, pepperoni, sausage, mushrooms, olives, parmesan", 1600],
          ["Alexandria Pizza", "From", 1700]
        ]
      },
      {
        name: "Garlic Bread",
        items: [
          ["Ultimate Garlic Bread", "", 900]
        ]
      },
      {
        name: "Salads",
        items: [
          ["Garden Salad", "Romaine, fresh tomatoes, cucumber and onions", 800],
          ["Caesar Salad", "Crispy lettuce, shaved parmesan, seasoned croutons, creamy Caesar dressing on the side", 1100],
          ["Greek Inspired Salad", "Feta, black olives, cucumbers, red onions and romaine", 1100]
        ]
      },
      {
        name: "Calzones",
        items: [
          ["Cheese Calzone", "Mozzarella and ricotta, with homemade marinara on the side", 1000]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Italian Tiramisu", "", 700],
          ["Double Chocolate Brownie", "", 600]
        ]
      },
      {
        name: "Beverages",
        items: [
          ["Water", "", 200],
          ["IBC Root Beer", "", 400],
          ["Mexican Coke", "", 400],
          ["Can Soda", "", 200],
          ["Perrier", "", 400],
          ["Pellegrino", "", 350]
        ]
      },
      {
        name: "Dips and Dressings",
        items: [
          ["Homemade Hot Ranch (2 oz)", "Our famous hot ranch", 100],
          ["Ranch (2 oz)", "", 100],
          ["Buffalo Sauce (2 oz)", "", 100],
          ["Side Pesto (2 oz)", "Homemade, nut-free", 100]
        ]
      }
    ],
    hours: "Daily 11am–12am",
    orderUrl: "https://pizzaponte.toast.site/order/pizza-ponte",
    siteNote: "Menu, prices and hours are from Pizza Ponte's own Toast online ordering page, linked from ponte.pizza."
  },
  'poor-house-bistro': {
    sections: [
      {
        name: "Starters",
        items: [
          ["Blackened Chicken Wings", "Served with celery and carrot sticks with blue cheese dressing", 1800],
          ["Sausage Bread", "Homemade French bread stuffed with Italian sausage and cheese, with creole mustard", 1900],
          ["French Fries", "From $7 small / $12 large; add Cajun spice $1", 700],
          ["Cajun Popcorn", "Tender shrimp in corn meal with herbs & spices, fried, with homemade creole remoulade", 1800],
          ["Catfish Basket", "Fried Mississippi catfish in seasoned corn meal with homemade tartar sauce", 1600],
          ["Corn Bread", "Homemade, served with butter", 700],
          ["Creole Slaw", "Side", 600],
          ["Cajun Potato Salad", "Side", 600],
          ["Red Beans and Rice (side)", "", 700],
          ["Jambalaya Cup", "", 900],
          ["Zapps Chips", "", 300],
          ["Fried Oysters", "$5 each", 500]
        ]
      },
      {
        name: "Sandwiches & Po Boys",
        items: [
          ["Fried Cajun Chicken Sandwich", "Award winning; dressed with mayo, pickles and creole slaw", 1700],
          ["The Poor House Po Boy", "Ham, roast beef, beef drippin's and au jus, dressed", 2000],
          ["The Drippin's Po Boy", "Shredded roast beef drenched in au jus, dressed without mayo", 1800],
          ["Cochon de Lait Po Boy", "Slow roasted pork, dressed", 1800],
          ["BBQ Chicken Po Boy", "Shredded chicken in spicy, tangy New Orleans sauce", 1600],
          ["BBQ Shrimp Po Boy", "Shrimp sautéed in a spicy and tangy New Orleans BBQ sauce", 2000],
          ["Fried Catfish Po Boy", "With homemade tartar sauce", 1700],
          ["Fried Shrimp Po Boy", "With homemade remoulade sauce", 2000],
          ["Fried Oyster Po Boy", "With homemade tartar sauce", 1900],
          ["Classic Muffaletta", "Salami, ham, mortadella, provolone and olive salad; from $20 half, $38 whole", 2000],
          ["Vegetarian Muffaletta", "Provolone and olive salad; from $18 half, $34 whole", 1800]
        ]
      },
      {
        name: "From the Charbroiler",
        items: [
          ["Burger", "1/4 lb Angus chuck; with potato salad, slaw or fries", 1700],
          ["Turkey Burger", "With potato salad, slaw or fries", 1700],
          ["Boca Burger", "Tofu patty (vegetarian); with potato salad, slaw or fries", 1700],
          ["Grilled Chicken Sandwich", "With potato salad, slaw or fries", 1700],
          ["Andouille Sausage Sandwich", "Dressed with creole slaw; with a side", 1700]
        ]
      },
      {
        name: "PHB Specialties",
        items: [
          ["Blackened Chicken & Tasso Pasta", "Blackened chicken and tasso ham in a creole cream sauce with toasted po boy bread", 2400],
          ["New Orleans Combo", "Gumbo, jambalaya and red beans and rice, served with corn bread", 2600],
          ["Jambalaya", "Classic rice dish with smoked sausage and chicken in tomato-based creole sauce", 2000],
          ["Crawfish Pasta", "Crawfish tails in a creole cream over fusilli, with toasted bread", 2800],
          ["Creole Cream Veggie Pasta", "Sautéed veggies in creole cream sauce over fusilli, with toasted bread", 2200],
          ["BBQ Shrimp Platter", "Shrimp sautéed in spicy, tangy New Orleans BBQ sauce, with dippin' bread", 2800],
          ["Fried Seafood Platter", "Shrimp, oysters and catfish with two sides", 3000],
          ["Red Beans & Rice", "Simmered with ham hock, with corn bread and andouille sausage", 2000]
        ]
      },
      {
        name: "Soups & Salads",
        items: [
          ["Shrimp Gumbo or Chicken & Sausage Gumbo", "From $11 cup / $17 bowl, with dippin' bread", 1100],
          ["Garden Salad", "From $9 small / $15 large", 900],
          ["Poor House Salad", "Greens, apples, candied pecans, blue cheese, balsamic; from $14 small / $20 large", 1400],
          ["Cajun Popcorn Salad", "Popcorn shrimp on mixed greens with homemade remoulade", 2000],
          ["Caesar Salad", "From $11 small / $17 large", 1100]
        ]
      },
      {
        name: "Sweets & Kids",
        items: [
          ["Bread Pudding", "With New Orleans praline sauce, big enough to share", 1400],
          ["Sweet Potato French Fries", "Sprinkled with cinnamon sugar", 1000],
          ["Beignets", "3 fresh donuts, served warm with powdered sugar", 1200],
          ["Kid's Meal", "Grilled cheese, chicken tenders or corn dog, with fries and a drink", 1400]
        ]
      }
    ],
    hours: "Wed–Thu 11am–2pm & 5pm–9pm, Fri–Sat 11am–9pm, Sun 10am–7pm, Closed Mon–Tue",
    orderUrl: "https://order.online/store/poor-house-bistro-148",
    siteNote: "Menu from their printable menu PDF (Nov 2025); hours from their website contact page."
  },
  'port-of-peri-peri-fremont': {
    sections: [
      {
        name: "Small Bites",
        items: [
          ["Peri Messy Fries", "", 1025],
          ["PeriFried Corn", "", 685],
          ["5 Peri Falafel", "5 Pieces of fried felafel patties, grilled with your choice of Peri sauce or plain.", 799],
          ["5 Peri Paneer strips", "5 pieces of flame grilled paneer cheese strips, served with your choice of sauce. It is an un-aged…", 1025],
          ["Hummus", "Our creamy spread of traditional Hummus, combines a blend of pureed garbanzo beans, sesame tahini, and savory…", 799],
          ["Mixed Olives", "Green & Black Mediterranean Olives infused with red peppers, sundried tomatoes, Anchovies, Balsamic vinegar…", 915],
          ["6 Peri Wings", "6 Peri Wings. You haven't tasted wings until you've tried our Peri Wings in your choice of Peri Sauce. They…", 1499],
          ["Peri Cassava Fries", "Fresh-cut Manioc root or Yuca, steamed, deep fried and tossed in our Peri Seasoning. Cassava is a…", 1149],
          ["Peri Peppers", "From – Four Sweet Peppers stuffed with Cheesy Peri Chicken with a seasoned GF topping then deep fried to crispy…", 695]
        ]
      },
      {
        name: "Signature Chicken",
        items: [
          ["Chicken Boneless Thigh", "From", 1495],
          ["1/2 Chicken", "From – Best of both worlds. A quarter of the white and a quarter of the dark meat of the chicken. Half Chicken…", 2299],
          ["1/4 Chicken: Breast & Wing", "Taste the \"Wild & Juicy side of the Chicken\". A marinated quarter piece of the WHITE meat, tender and juicy…", 1349],
          ["1/4 Chicken: Leg & Thigh", "Taste the \"dark side of the chicken\" meat. Tender and flavorful to the bone. A marinated leg & Thigh quarter…", 998],
          ["Chicken & Rice Bowl", "4 Marinated Peri Peri chicken tenderloins (not breast strips), steamed, grilled and basted with your choice…", 1899],
          ["Chicken Tender", "Marinated chicken tenderloin (not breast strips), steamed, grilled and basted with your choice of sauce on…", 1435],
          ["Whole Chicken", "One whole bird, cut in four quarters. Marinated, steamed then grilled. Basted with your choice of sauce while…", 3999],
          ["Wings", "From – Marinated party-wings, flame grilled to PERIfection. Marinated chicken wings, steamed, grilled and basted on…", 899],
          ["Two 1/4 Chicken: Leg & Thigh", "The favorite dark meat cut, now come as a pair to fulfill your cravings for \"The dark-side of the Chicken\"…", 2399],
          ["Chicken & Rice Plate", "GRILLED CHICKEN OVER RICE & SALAD: Port Signature Rice, Port House Salad, Chopped Boneless Grilled Peri Peri…", 1095]
        ]
      },
      {
        name: "Peri Bowls",
        items: [
          ["Peri Leg & Thigh Rice Bowl", "Taste the \"dark side of the chicken\" meat. Tender and flavorful to the bone. A marinated leg & Thigh quarter…", 1845],
          ["Peri Wings Rice Bowl", "4 Marinated party-wings, flame grilled to PERIfection. Marinated chicken wings, steamed, grilled and basted…", 1845],
          ["Garden Rice Bowl", "Pies of our signature Veggie-patty, fried then grilled with your choice of our Peri Sauce over a bed of our…", 1545]
        ]
      },
      {
        name: "Salads",
        items: [
          ["Couscous Salad", "Tender, tri-color, Israeli Couscous, tomatoes, cucumbers, onions, and basil and highlighted together with a…", 1599],
          ["Quinoa Salad", "Protein packed Quinoa, Green & Brown lentils with Parsley and split peas. Served with fresh tomatoes…", 1599],
          ["Port House Salad", "A fresh blend of Tomatoes, Sweetcorn, red onions. Tossed with mixed maditerranean pitted olives. Served on a…", 1255]
        ]
      },
      {
        name: "Burger, Pitas & Wraps",
        items: [
          ["Peri Pulled Brisket Burger", "", 1499],
          ["Carné Burger", "Certified Organic, grass-fed 1/4 Lb Beef patty between buttery brioche buns. The patty is dry marinated for a…", 1149],
          ["The Burger", "Peri chicken tenderloins on a fresh toasted ciabatta bun spread with our signature homemade PeriMayo with…", 1599],
          ["The Pita", "Peri chicken tenderloins wrapped in a lightly toasted Pita bread spread with our signature homemade PeriMayo…", 1599],
          ["The Sizzler", "Peri chicken tenderloins on a fresh toasted ciabatta bun spread with our signature homemade PeriMayo with…", 1599],
          ["The Wrap", "Peri chicken tenderloins wrapped in your choice of lightly toasted plain or Spinach tortilla spread with our…", 1599],
          ["The Peri Burrito", "Mexico meets Portugal, in what we like to call PORTUMEX. Meet our hearty Peri Burrito. Fresh greens, steamed…", 1699]
        ]
      },
      {
        name: "Platters",
        items: [
          ["Sunshine Platter", "Ideal for 2-3 People 6 Boneless Thigh Meat 6 Tenders 3 Large Sides", 4499],
          ["All For One", "Ideal for 1-2 people. Half grilled Peri Peri Chicken, 3 Peri Wings with your choice of a regular side.", 2799],
          ["Wings Platter", "Ideal for 2-3 people. 24 of our famous Peri Peri wings with your choice of 2 Large sides. Good for your Peri…", 5499],
          ["Family Platter", "Ideal for 4-6 people. Two whole grilled Peri Peri Chicken with your choice of 4 large sides.", 7999],
          ["Original Platter", "Ideal for 2-3 people. One full grilled Peri Peri Chicken with your choice of 2 Large sides.", 4699]
        ]
      },
      {
        name: "Veggie Delights",
        items: [
          ["Falafel Pita", "Fried Felafel patties, served in your choice of sauce or plain rolled into a toasted pita with a spread of…", 1025],
          ["Falafel Rice", "Fried Felafel patties, served in your choice of sauce or plain. Served on a bed of our signature yellow…", 1149],
          ["Paneer Wrap", "Flame-grilled paneer cheese strips, served with your choice of sauce wrapped in your choice of lightly…", 1249],
          ["Peri Peri Beyond ® Burger", "A vegan burger, lightly grilled, basted in your choice of peri sauce, served on your choice of Ciabatta or a…", 1799],
          ["Veg Burger", "Lightly battered Peri Veggie patty on a fresh Ciabatta bun, with a spread of our home made PeriMayo, served…", 1255],
          ["Veg Pita", "Lightly battered Peri Veggie patty rolled into a toasted pita with a spread of our home made PeriMayo, served…", 1255],
          ["Paneer Rice", "4 pieces of flame grilled paneer cheese strips, basted with your choice of sauce and served on a bed of our…", 1399]
        ]
      },
      {
        name: "Specialty",
        items: [
          ["3 Peri Costeletas  (Lamb Chops)", "Pre-Marinated Frenched Lambchops. Lightly grilled & basted with your choice of Peri Sauce.", 2499],
          ["5 Peri Costeletas", "Five pieces of our Pre-Marinated Frenched Peri Peri Lambchops. Lightly grilled & basted with your choice of…", 3599]
        ]
      },
      {
        name: "The Port Sides",
        items: [
          ["Coleslaw", "Homemade, daily. Fresh, Creamy & Crunchy. Our coleslaw comes complete with finely shredded green cabbage…", 799],
          ["Flame-Grilled Corn On The Cob", "3 pcs of 3 inch USDA Grade-A Corn on the cob. Steamed then lightly grilled. Have it plain or basted with your…", 799],
          ["Port Rice", "Our signature yellow basmati rice with a hint of spice cooked fresh daily.", 799],
          ["Fries", "Traditional Skin-on potato fries tossed in our proprietary Peri seasoning. Our fries are made from the best &…", 799],
          ["Steamed Vegetables", "Mixed variety of gourmet vegetables. Steamed and sprinkled with our Peri seasoning. This colorful blend of…", 799],
          ["Toasted Pita", "Hot toasted artisan flat bread, cut in four pieces. Made with an authentic Indian flatbread recipe which…", 199],
          ["PeriMayo Corn", "USDA Grade-A cut corn, steamed daily. Hot kernels, slathered in our home made PeriMayo and sprinkled with our…", 799],
          ["Red Skinned Potato Salad", "Fresh sliced red skinned potatoes in a creamy salad dressing making a wholesome chunky potato salad. With no…", 799]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Chocolate Cake", "", 499]
        ]
      },
      {
        name: "Kids Meals",
        items: [
          ["2 Tenders", "Kids Meals include either Fries or Coleslaw or Corn on the Cob. Fruit Juice", 999],
          ["3 Paneer Slices", "Kids Meals include either Fries or Coleslaw or Corn on the Cob. Fruit Juice", 899],
          ["3 Wings", "Kids Meals include either Fries or Coleslaw or Corn on the Cob. Fruit Juice", 1099],
          ["4 Falafels", "Kids Meals include either Fries or Coleslaw or Corn on the Cob. Fruit Juice", 899]
        ]
      }
    ],
    pricesEstimated: "Prices are from their Grubhub store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from The Port Of Peri Peri (Fremont) store on Grubhub at 3283 Walnut Ave."
  },
  'real-cutie-pies': {
    email: "cutiepiesorders@gmail.com"
  },
  'rg-lounge': {
    hours: "Sun–Thu 11am–8:45pm, Fri–Sat 11am–9:15pm",
    siteNote: "Hours are from their own website."
  },
  'rico-rico-taco': {
    hours: "Mon–Wed 11am–9pm, Thu–Fri 11am–10pm, Sat 10am–10pm, Sun 11am–9pm",
    siteNote: "Hours are from their own website (ricoricotaco.com)."
  },
  'rise-pizzeria': {
    hours: "Mon–Thu 11:30am–9pm, Fri–Sat 11am–10pm, Sun 11am–9pm",
    siteNote: "Hours from the Hours & Location page on risepizzeria.com."
  },
  'roast-eatery-co': {
    sections: [
      {
        name: "Roast Meats",
        items: [
          ["Roast Duck / 明爐燒鴨", "From. Half or whole roast duck", 2350],
          ["Soy Sauce Chicken / 玫瑰豉油雞", "From. Half or whole", 1500],
          ["Hainan Chicken / 海南雞", "From. Half or whole", 1500],
          ["Roast Crispy Pork Belly / 脆皮燒腩仔", "Tender inside, crispy skin", 1700],
          ["BBQ Pork Ribs / 燒排骨", "Roasted pork ribs glazed with sweet barbecue sauce", 1700]
        ]
      },
      {
        name: "Rice Plates",
        items: [
          ["Single Meat / 單拼", "Roast duck, BBQ pork, soy sauce chicken or BBQ pork ribs, with rice", 1600],
          ["Double Meat / 雙拼", "Choice of two meats with rice", 2000],
          ["Triple Meat / 三拼", "Choice of three meats with rice", 2400]
        ]
      },
      {
        name: "Noodles & More",
        items: [
          ["Garlic Noodle", "With BBQ pork, roast duck or crispy pork belly", 1750],
          ["Beef Brisket Soup Noodles", "Braised beef brisket soup noodles", 1450],
          ["Dan Dan Noodle", "Spicy chili pork sauce, scallion, peanuts and chili oil", 1450],
          ["Chili Wonton / 紅油雲吞", "Shrimp and pork wontons in chili oil and sesame sauce", 1225],
          ["Spicy Cucumber Salad", "Chili oil, black vinegar, garlic, cilantro and sesame", 800]
        ]
      },
      {
        name: "Sides & Sauces",
        items: [
          ["Steamed Rice", "", 350],
          ["Extra Ginger Scallion Sauce", "", 100],
          ["Plum Sauce", "", 100]
        ]
      }
    ],
    hours: "Tue–Sat 11am–6:30pm, Sun 11am–6pm; Closed Mon",
    phone: "(925) 626-8196",
    orderUrl: "https://www.doordash.com/store/roast-eatery-co.-brentwood-31851921/58144747/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from Roast Eatery Co.'s DoorDash store (3120 Balfour Rd Ste A; no website found); hours and phone are from their Google and Yelp listings."
  },
  'rob-bens-restaurant': {
    hours: "Tue 9am–1:30pm, Wed–Fri 9am–8pm, Sat 9am–1:30pm & 3:30–8pm, Sun 12:30–6pm, Closed Mon",
    siteNote: "Hours are from their own website."
  },
  'rocket-mc-tow': {
    hours: "Open 24 hours, 7 days (emergency towing)",
    siteNote: "Hours from Yelp and Yahoo Local (both 24 hours daily) and their Instagram ('Emergency Towing 24 HR'); pricing is quote-only."
  },
  'rockin-crawfish': {
    hours: "Sun–Thu 12–8:30pm, Fri–Sat 12–9:30pm",
    phone: "(510) 230-4874",
    siteNote: "Hours are from the San Pablo location's Instagram, matching Yelp and Grubhub."
  },
  'romana-pizzeria': {
    hours: "Mon–Thu 11am–9pm, Fri–Sat 10am–12am, Sun 11am–9pm",
    email: "romanapizzeria251@gmail.com",
    siteNote: "Hours and email from the Hours of Operation section on romanadanville.com."
  },
  'ruben-hibachi-grill': {
    sections: [
      {
        name: "Combination Plates",
        items: [
          ["Filet Mignon And Chicken Shrimp Trio", "Grilled filet mignon, saut�ed chicken, and shrimp typically accompanied by a red wine reduction and…", 4500],
          ["New York Steak And Shrimp", "Sliced New York steak paired with grilled shrimp, served with steamed vegetables and a side of rice", 3600],
          ["Lobster FILET MIGNON, SHRIMP", "Succulent lobster and shrimp paired with tender filet mignon, complemented by sautéed vegetables including…", 6900],
          ["Filet Mignon And Shrimp", "Tender filet mignon paired with succulent shrimp, served with a side of steamed vegetables and a choice of…", 3800],
          ["Lobster SHRIMP, SALMON", "Grilled lobster, shrimp, and salmon typically paired with aromatic herbs and spices, offering a savory…", 6300],
          ["New York Steak And Chicken", "Juicy New York steak paired with tender chicken, served with a side of fresh vegetables and your choice of…", 3500],
          ["Filet Mignon And New York", "Tender filet mignon paired with a robust New York strip, served with seasonal vegetables and fired rice", 4100],
          ["Chicken And Shrimp", "Tender chicken and juicy shrimp served with steamed vegetables and fried rice.", 3400],
          ["Filet Mignon And Salmon", "Filet mignon with salmon, served with fresh vegetables. Includes a side of fired rice OR noodles.", 3800],
          ["Filet Mignon And Chicken", "Grilled filet mignon paired with marinated chicken, typically accompanied by a red wine reduction and…", 3500],
          ["Salmon And Shrimp", "Fresh salmon paired with succulent shrimp, served with vegetables and a side of fried rice", 3800],
          ["Salmon And Chicken", "Grilled salmon and chicken typically served with a side of seasoned fries.", 3700],
          ["NEW YORK STEAK AND LOBSTER", "Grilled New York steak paired with a tender lobster tail, typically served with roasted potatoes and…", 5000],
          ["CHICKEN AND LOBSTER", "Grilled chicken paired with a tender lobster, typically accompanied by a selection of sides such as rice…", 4900],
          ["Lobster NEW YORK STEAK, SHRIMP", "Grilled New York steak paired with tender lobster and succulent shrimp, offering a classic combination of…", 6300],
          ["FILET MIGNON AND LOBSTER", "Grilled filet mignon paired with succulent lobster, typically accompanied by a red wine reduction and…", 5700],
          ["SALMON AND LOBSTER", "Grilled salmon and lobster, typically accompanied by garlic herb rice, charred vegetables, and a light…", 5000],
          ["SHRIMP AND LOBSTER", "Shrimp and lobster typically served together, often featuring a combination of tender lobster and…", 5000],
          ["New York Steak, Chicken And Shrimp Trio", "Tender New York steak, grilled chicken breast, and succulent shrimp served together. With vegetables and a…", 4000],
          ["New York Steak And Salmon", "Grilled New York steak paired with pan-seared salmon, typically accompanied by roasted potatoes and…", 3600]
        ]
      },
      {
        name: "Spicy Diablo Noodles",
        items: [
          ["Spicy Diablo Noodles Three Meat", "Three kinds of meat: chicken, steak, and shrimp mixed with spicy noodles and vegetables", 4500],
          ["Spicy Diablo Noodles Two Meat", "Chicken, Steak or Shrimp", 4000],
          ["Spicy Diablo Noodles One Meat", "Noodles with your choice of chicken, steak, or shrimp, with a side of rice", 3500]
        ]
      },
      {
        name: "Double portion",
        items: [
          ["Doble NY Steak", "Juicy New York steak pieces paired with saut�ed zucchini, carrots, and onions.", 4100],
          ["Doble Chicken", "Chicken double plate with mixed vegetables. Served with a choice of noodles or fried rice.", 3600],
          ["Doble Salmon", "Two portions of salmon with vegetables, served with your choice of noodles or fried rice.", 4100],
          ["Doble Shrimp", "Succulent shrimp served in generous double portions, complemented by a side of fresh vegetables and a side…", 4000],
          ["Doble FM Mignon", "Tender filet mignon pieces paired with saut�ed zucchini, carrots, and onions.", 4300]
        ]
      },
      {
        name: "Side Orders",
        items: [
          ["Fred Rice", "Rice with onions, carrots, and scrambled eggs.", 900],
          ["Filet Mignon", "Grilled filet mignon, typically served with a red wine reduction and seasonal vegetables, offering a…", 1900],
          ["Spicy noodles", "Wheat noodles tossed with shrimp, chicken, and vegetables in a spicy peanut sauce.", 900],
          ["Shrimp Fried Rice", "Savory rice mixed with shrimp, carrots, and peas, lightly seasoned for a classic American side dish.", 1400],
          ["Steak Fried Rice", "Angus steak fried with onions, peppers, broccoli, carrots, peas, fried egg, and scallion, creating a…", 2300],
          ["Salmon", "Slices of fresh salmon served plain.", 1500],
          ["Shrimp", "Seven shrimp", 1400],
          ["Chicken Fried Rice", "Savory rice mixed with tender chicken pieces and colorful vegetables, seasoned for a classic taste.", 1300],
          ["Chicken", "Tender chicken pieces seasoned with spices.", 1300],
          ["New York Steak", "Grilled New York steak typically includes saut�ed mushrooms and onions, served on toasted bread with a…", 1700],
          ["Lobster", "Baked lobster typically served with a lemon butter sauce.", 3200],
          ["Veg", "Grilled medley of carrots, zucchini, and onions seasoned with herbs.", 900],
          ["Noodles", "Tender noodles lightly coated in a savory sauce, offering a simple and satisfying side option.", 900]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Coke Can", "The cold, refreshing, sparkling classic that America loves.", 300],
          ["Sprite Can", "The cold, refreshing flavors of lemon and lime, perfectly blended.", 300],
          ["Water", "Pure bottled water with added minerals for taste.", 300],
          ["Mexican Coke", "The same great taste made with only pure cane sugar and served in a bottle.", 500],
          ["Jarritos", "A Mexican soda typically featuring vibrant and fruity flavors like mandarin, pineapple, and tamarind…", 400]
        ]
      },
      {
        name: "Hibachi Bowls",
        items: [
          ["Hibachi Bowls Trio Meat", "Choose of 3 chicken, steak, shrimp, or salmon served with mixed vegetables and steamed rice.", 2500],
          ["Hibachi Bowls Two Meat", "Option of two Chicken, steak, shrimp, or salmon. Served with rice and vegetables. Or just rice", 2300],
          ["Hibachi Bowls One Meat", "Choose of ONE from chicken, steak, shrimp, or salmon served with vegetables and rice.", 1900]
        ]
      },
      {
        name: "Hibachi Burrito",
        items: [
          ["Hibachi Burrito Trio Meat", "Chicken, Steak or Shrimp", 2500],
          ["Hibachi Burrito One Meat", "Choose from ONE chicken, steak, or shrimp with vegetables and rice.", 1900],
          ["Hibachi Burrito Two Meat", "Chicken, Steak or Shrimp", 2300]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/rubenhibchigrill-san-lorenzo-44744433/",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their DoorDash store (food truck at 575 Paseo Grande, San Lorenzo)."
  },
  'sakana-sushi-albany': {
    hours: "Sun–Thu 5pm–9:30pm, Fri–Sat 5pm–11pm",
    siteNote: "Hours from their own online ordering page for the Albany location."
  },
  'san-honore-panaderia': {
    sections: [
      {
        name: "Breads",
        items: [
          ["Hot Pandesal", "12 per pack. Soft, buttery, whisper-sweet Filipino bread roll. A breakfast staple and very good as a sandwich…", 699],
          ["Mini Pandesal", "6 per pack. A smaller version of the hot big pandesal.", 699],
          ["Spanish Bread", "6 per pack. Filipino bread roll, cylindrical in shape with a traditional sweet filling made of breadcrumbs…", 799],
          ["Pan De Coco", "6 per pack. Soft bread roll filled with in-house cooked coconut filling made with milk (or coconut milk)…", 799],
          ["Ube Halaya Bread", "6 per pack. Soft bread roll filled with in-house cooked ube halaya (coconut yam) filling.", 799],
          ["Cheese Pimiento Bread", "6 per pack.", 799],
          ["Cheese Bomb Bread", "4 per pack.", 799],
          ["Putok", "4 per pack. Star bread.", 699],
          ["Bonette", "4 per pack.", 799],
          ["Kababayan", "6 per pack. Filipino muffin.", 799]
        ]
      },
      {
        name: "Crinkles",
        items: [
          ["Dark Chocolate Crinkles", "5 per pack.", 799],
          ["Ube Crinkles", "5 per pack.", 799]
        ]
      },
      {
        name: "Hopia",
        items: [
          ["Ube Halaya Hopia", "5 per pack.", 799],
          ["Red Beans Hopia", "5 per pack.", 799],
          ["Baboy Hopia", "5 per pack.", 799]
        ]
      },
      {
        name: "Espasol",
        items: [
          ["Ube Espasol", "Random cut.", 699],
          ["Plain Espasol", "Random cut.", 699]
        ]
      },
      {
        name: "Ensaymada",
        items: [
          ["Ube Cheese Halaya Ensaymada", "4 per pack.", 999],
          ["Cheese Ensaymada", "4 per pack.", 999]
        ]
      },
      {
        name: "Loaf",
        items: [
          ["Ube Halaya Loaf", "Each.", 899],
          ["Raisin Loaf", "Each.", 899],
          ["Red Bean Loaf", "Each.", 899]
        ]
      },
      {
        name: "Pie",
        items: [
          ["Buko Pie", "Each.", 1699],
          ["Buko Ube Pie", "Each.", 1699],
          ["Egg Pie", "Each.", 1299]
        ]
      },
      {
        name: "Savory",
        items: [
          ["Siomai - Pork & Shrimp", "", 599],
          ["Siopao - Chunky Asado", "", 599],
          ["Empanada - Chicken", "", 375],
          ["Pastry Cheese Roll", "", 999]
        ]
      },
      {
        name: "Coffee",
        items: [
          ["Cappuccino (Hot)", "A beautifully crafted coffee made with rich espresso, steamed milk, and a smooth layer of velvety foam…", 675],
          ["Americano", "From – A classic coffee favorite made with rich espresso and water for a smooth, bold, and refreshing experience…", 650],
          ["Latte | Iced Latte", "From – Made with rich, freshly brewed espresso and milk, every cup delivers a smooth, balanced coffee experience…", 675],
          ["Spanish Latte", "From – Smooth, bold espresso perfectly blended with creamy milk and just the right touch of sweetness condensed milk…", 775],
          ["Caramel Latte", "From – Indulge in our rich and creamy Caramel Latte, made with freshly brewed espresso, smooth steamed milk, and…", 775],
          ["Mocha Latte", "From – Rich espresso blended with smooth, creamy milk and premium chocolate for the perfect balance of bold coffee…", 775],
          ["Iced Arnibal Latte (20 oz)", "Experience the perfect blend of bold espresso and our signature taho arnibal syrup, layered with smooth milk…", 795],
          ["Iced Ube Latte (20 oz)", "Crowds' favorite! Experience the perfect blend of rich espresso and the sweet, creamy flavor of real ube…", 795],
          ["Matcha Latte (20 oz Iced)", "Crafted with premium Japanese matcha, fresh milk, and perfectly balanced for a smooth, creamy finish.", 795],
          ["Ube Matcha Latte (20 oz Iced)", "A vibrant fusion of two fan favorites! A creamy ube milk drink with a refreshing matcha twist. Made with our…", 795],
          ["Strawberry Matcha Latte (20 oz Iced)", "A refreshing combination of sweet and earthy flavors in one beautiful drink. Made with our blended strawberry…", 795]
        ]
      }
    ],
    hours: "Daily 8am–8:30pm",
    pricesEstimated: "Prices are from their Grubhub store; delivery apps often charge more than the counter.",
    siteNote: "Menu and hours are from the San Honore Panaderia store on Grubhub (4122 Dyer St, Union City)."
  },
  'sanaa-cafe': {
    sections: [
      {
        name: "Espresso Drinks",
        items: [
          ["Espresso (4oz)", "Rich, concentrated coffee with a layer of crema", 409],
          ["Cortado (5oz)", "", 519],
          ["Americano", "Espresso with hot water", 479],
          ["Cappuccino (12oz)", "Espresso with steamed milk and a rich layer of foam", 609],
          ["Latte", "Espresso with steamed milk", 609],
          ["Caramel Macchiato", "Espresso with caramel, vanilla and steamed milk", 679],
          ["White Mocha Latte", "Espresso with white chocolate, vanilla and steamed milk", 659],
          ["Spanish Latte", "Espresso, steamed milk and sweet condensed milk", 659],
          ["Yemeni Latte", "Espresso and steamed milk infused with cinnamon and cardamom", 709],
          ["Sana'a Latte", "Espresso and steamed milk with cinnamon, cardamom and ginger", 709],
          ["Matcha", "Green tea blended with steamed milk", 709],
          ["Pistachio Latte", "Espresso with creamy milk and pistachio", 719],
          ["Hot Chocolate", "", 469],
          ["Mocha Latte", "Espresso with chocolate, vanilla and steamed milk", 659],
          ["Rose Latte", "Espresso and steamed milk with delicate rose flavor", 689],
          ["Cinnamon Dolce Latte", "Espresso, steamed milk and cinnamon syrup", 689],
          ["Biscoff Latte", "Espresso and steamed milk with Biscoff spread", 699],
          ["Caramel Frappuccino", "Blended iced caramel drink with whipped cream", 799],
          ["Mocha Frappuccino", "Blended iced chocolate and espresso with whipped cream", 799],
          ["Brown Sugar Latte", "Espresso shaken with ice, brown sugar and a touch of milk", 759],
          ["Cold Brew", "Slow-steeped coffee served cold", 589],
          ["Macchiato", "Espresso topped with a touch of steamed milk", 550]
        ]
      },
      {
        name: "Yemeni Style Drinks",
        items: [
          ["Sanaani", "Medium roast coffee brewed with cardamom", 459],
          ["Jubani", "Medium-light roast coffee and coffee husks brewed with ginger and cardamom", 459],
          ["Arabic Light Roast", "Light roast coffee brewed with cardamom and a touch of saffron", 519],
          ["Mofawar", "Medium roast coffee brewed with cardamom, finished with cream", 519],
          ["Qisher", "Coffee husks brewed with cinnamon and ginger", 479],
          ["Adeni Chai", "Yemeni black tea brewed with cardamom, finished with cream", 519],
          ["Yemeni Black Tea", "Black tea brewed with cardamom and cloves", 479],
          ["Turkish Coffee", "Finely ground medium and dark roast, traditionally brewed", 489],
          ["Dirty Chai", "Spiced Adeni chai with espresso", 649],
          ["Iced Adeni Chai", "", 619],
          ["Iced Mofawar", "", 619],
          ["Iced Sana'ani", "", 589],
          ["Iced Dirty Chai", "Chilled Adeni chai with espresso over ice", 719]
        ]
      },
      {
        name: "Fall Season Drinks",
        items: [
          ["Banoffee Latte", "Espresso, milk, banana and caramel", 659],
          ["Maple Cinnamon Latte", "Espresso, milk, maple and cinnamon", 675],
          ["Pumpkin Cookie Butter Latte", "Espresso, milk, Biscoff cookie butter and pumpkin spice", 689],
          ["Pumpkin Snickerdoodle Latte", "Espresso, milk, pumpkin spice, white mocha and brown sugar", 699],
          ["Iced Pumpkin Spice Chai", "Adeni chai, evaporated milk, pumpkin spice sauce", 739],
          ["Hot Pumpkin Spice Chai", "Adeni chai, evaporated milk, pumpkin spice sauce", 689]
        ]
      },
      {
        name: "Refreshers & Tea",
        items: [
          ["Mango Passion Fruit", "", 695],
          ["Kiwi Dragon Fruit", "", 695],
          ["Mango Watermelon", "", 695],
          ["Lemonade", "Freshly squeezed", 695],
          ["Mojito", "Mint, lime and sparkling soda over ice (non-alcoholic)", 695],
          ["Strawberry Lemonade", "", 695],
          ["Dragon Fruit", "", 695],
          ["Strawberry Acai", "", 695],
          ["Pink Drink", "Strawberry açaí with coconut milk", 695],
          ["Lemon Ginger", "", 545],
          ["Mango Dragon Fruit", "", 695],
          ["Wild Peach Tea", "", 529],
          ["Hibiscus Tea", "", 529],
          ["Green Tea", "", 529],
          ["Tangerine Tea", "", 529],
          ["Tea Bag", "Any tea from the collection, brewed to order", 349],
          ["Diet Coke", "", 250],
          ["Sana'a Water Bottle 16oz", "", 359]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["Mango Smoothie", "Ripe mango with a touch of Vimto syrup", 695],
          ["Strawberry Smoothie", "", 695],
          ["Strawberry Banana Smoothie", "", 695],
          ["Banana Smoothie", "", 695],
          ["Pina Colada Smoothie", "Pineapple and coconut", 695],
          ["Tropical Smoothie", "", 999]
        ]
      },
      {
        name: "Fatayer & Savory",
        items: [
          ["Beef Fatayer", "Baked pastry with seasoned beef and Middle Eastern spices", 575],
          ["Chicken Fatayer", "Baked pastry with seasoned chicken and Middle Eastern spices", 575],
          ["Cheese Fatayer", "", 575],
          ["Spinach Fatayer", "", 575],
          ["Potato Fatayer", "", 575],
          ["Sanaa Spinach Cheese Fatayer", "", 595],
          ["Chicken Musakhan", "Pastry with chicken, caramelized onions and Palestinian spices", 599],
          ["Safiha Fatayer", "", 550],
          ["Spinach Feta Fatayer", "", 575],
          ["Zaater Feta", "Baked pastry with feta and za'atar", 575],
          ["Zaater Bread", "", 550],
          ["Egg Cheese Fatayer", "", 550],
          ["Beef Shawarma Roll", "Beef shawarma wrapped in soft flatbread", 1099],
          ["Chicken Shawarma", "Chicken shawarma wrapped in soft flatbread", 999],
          ["Chicken Hotdog", "", 550]
        ]
      },
      {
        name: "Pastries & Croissants",
        items: [
          ["Brownie", "", 499],
          ["Cookies", "", 499],
          ["Honeycomb", "Soft pastry filled with cream cheese, finished with honey", 719],
          ["Tulumba", "", 179],
          ["Turkish Delight", "", 699],
          ["Lemon Bar", "", 499],
          ["Banana Bread", "", 499],
          ["Pistachio Ricotta", "", 799],
          ["Banana Pudding", "", 825],
          ["Plain Butter Croissant", "", 549],
          ["Dubai Croissant", "Filled with pistachio cream and crispy kunafa", 599],
          ["Pistachio Rose Croissant", "", 599],
          ["Almond Croissant", "", 579],
          ["Chocolate Croissant", "", 650],
          ["Biscoff Croissant", "", 599],
          ["Chocolate Muffin", "", 550],
          ["Blueberry Muffin", "", 550],
          ["Poppyseed Muffin", "", 550],
          ["Cherry Danish", "", 479],
          ["Cheese Danish", "", 429],
          ["Biscoff Danish", "", 649],
          ["Dubai Danish", "Pistachio and Dubai-style chocolate", 649],
          ["Almond Danish", "", 399],
          ["Apple Danish", "", 479]
        ]
      },
      {
        name: "Milk Cakes",
        items: [
          ["Pistachio Milk Cake", "", 799],
          ["Tiramisu Milk Cake", "", 850],
          ["Rose Milk Cake", "", 799],
          ["Saffron Milk Cake", "", 799],
          ["Biscoff Milk Cake", "", 799],
          ["Caramel Milk Cake", "", 799],
          ["Strawberry Milk Cake", "", 749],
          ["Dubai Milk Cake", "Chocolate and pistachio", 849],
          ["Mango Milk Cake", "", 799],
          ["Molten Chocolate Cake", "", 850],
          ["Pumpkin Milk Cake", "", 850],
          ["Fruit Cake Mousse", "Variety of flavors", 1099]
        ]
      },
      {
        name: "Cheesecakes",
        items: [
          ["Pistachio Cheesecake", "", 899],
          ["Nutella Cheesecake", "", 899],
          ["Biscoff Cheesecake", "", 899],
          ["Chocolate Fudge Cheesecake", "", 899],
          ["Carrot Cheesecake", "", 899],
          ["Red Velvet Cheesecake", "", 799],
          ["Strawberry Cheesecake", "", 899],
          ["Dubai Cheesecake", "", 899],
          ["Pistachio Dream Cheesecake", "", 899],
          ["Oreo Cheesecake", "", 899],
          ["Tiramisu Cheesecake", "", 899],
          ["Crème Brûlée Cheesecake", "", 899],
          ["Snickers Cheesecake", "", 899],
          ["Ferrero Cheesecake", "", 899],
          ["Ube Cheesecake", "", 899],
          ["Cheesecake Tray", "Full tray for sharing", 7499]
        ]
      },
      {
        name: "Baklava",
        items: [
          ["Chocolate with Pistachio", "", 375],
          ["Burma Qataifi", "Crispy kataifi filled with pistachios and syrup", 499],
          ["Triangle Pistachio Baklava", "", 599],
          ["Bird Nest Chocolate", "", 449],
          ["Pistachio Baklava", "", 375],
          ["Tahini with Walnut", "", 399],
          ["Classic Baklava", "", 499],
          ["Royal Pistachio", "", 599],
          ["Taco Baklava", "", 450],
          ["Fig Baklava with Walnut", "", 325],
          ["Cold Milky with Pistachio", "", 450]
        ]
      }
    ],
    orderUrl: "https://www.toasttab.com/local/order/sana-a-cafe-sunnyvale-1146-4th-st",
    siteNote: "Menu from their San Rafael Toast online ordering page (1146 4th St)."
  },
  'sanaa-cafe-hayward': {
    sections: [
      {
        name: "Espresso Drinks",
        items: [
          ["Espresso (4oz)", "Espresso - a rich, concentrated coffee with a layer of crema", 410],
          ["Cortado (8oz)", "Espresso balanced with an equal amount of lightly steamed milk", 449],
          ["Americano", "Espresso combined with hot water for a smooth, bold coffee", 439],
          ["Cappuccino (12oz)", "Espresso with steamed milk and a rich layer of foam", 495],
          ["Latte", "Espresso combined with smooth, steamed milk", 550],
          ["White Mocha Latte", "Espresso with white chocolate, vanilla, and smooth steamed milk", 595],
          ["Spanish Latte", "Rich espresso blended with steamed milk and sweet condensed milk, creating a smooth, creamy latte with a…", 619],
          ["Yemeni Latte", "Rich espresso blended with steamed milk, infused with cinnamon and cardamom for a warm, aromatic…", 619],
          ["Sana'a Latte", "Rich espresso blended with steamed milk, infused with cinnamon, cardamom, and ginger for a bold, warm, and…", 619],
          ["Matcha", "Smooth green tea blended with steamed milk", 589],
          ["Pistachio Latte", "Smooth espresso blended with creamy milk and rich pistachio flavor for a sweet, nutty latte.", 699],
          ["Hot Chocolate", "Rich chocolate blended with smooth, steamed milk", 399],
          ["Mocha Latte", "Espresso with rich chocolate, vanilla, and smooth steamed milk", 595],
          ["Rose Latte", "Rich espresso blended with steamed milk and delicate rose flavor, creating a smooth, floral latte with a…", 619],
          ["Cinnamon Dolce Latte", "Rich espresso blended with steamed milk and sweet cinnamon syrup, topped with a warm, spiced finish for a…", 599],
          ["Biscoff Latte", "Rich espresso blended with steamed milk and creamy Biscoff spread, creating a smooth, caramelized latte…", 645],
          ["Caramel Frappuccino", "A blended iced drink with rich caramel, milk, and ice, topped with whipped cream for a smooth, sweet, and…", 799],
          ["Mocha Frappuccino", "A blended iced drink with rich chocolate, espresso, milk, and ice, topped with whipped cream for a smooth…", 799],
          ["Shaken Ice Brown Sugar", "Espresso shaken with ice, brown sugar, and a touch of milk for a smooth, lightly sweet drink with a rich…", 749]
        ]
      },
      {
        name: "Yemeni Style Drinks",
        items: [
          ["Sanaani", "Medium roast coffee brewed with cardamom, delivering a smooth, aromatic cup with a warm, traditional…", 499],
          ["Jubani", "Aromatic blend of medium-light roast coffee and coffee husks, brewed with ginger and cardamom for a warm…", 499],
          ["Arabic Light Roast", "Light roast coffee brewed with cardamom and a touch of saffron, offering a delicate, aromatic cup with a…", 499],
          ["Mofawar", "Medium roast coffee brewed with cardamom and finished with cream, creating a smooth, rich, and aromatic cup…", 549],
          ["Qisher", "Coffee husks brewed with cinnamon and ginger, creating a warm, lightly spiced drink with a smooth…", 499],
          ["Adeni Chai", "Yemeni black tea brewed with cardamom and finished with cream, creating a rich, smooth, and warmly spiced…", 549],
          ["Yemeni Black Tea", "Yemeni black tea brewed with cardamom and cloves, offering a bold, aromatic cup with a warm, traditional…", 499],
          ["Turkish Coffee", "Finely ground medium and dark roast coffee, traditionally brewed for a bold, rich flavor with a smooth…", 449],
          ["Dirty Chai", "Spiced Adeni Chai combined with rich espresso", 649]
        ]
      },
      {
        name: "Iced Yemeni Specialty Drinks",
        items: [
          ["Iced Adeni Chai", "Yemeni black tea brewed with cardamom and finished with cream, creating a rich, smooth, and warmly spiced…", 599],
          ["Iced Mofawar", "Medium roast coffee brewed with cardamom and finished with cream, creating a smooth, rich, and aromatic cup…", 599],
          ["Iced Sana'ani", "Medium roast coffee brewed with cardamom, delivering a smooth, aromatic cup with a warm, traditional…", 549],
          ["Iced Dirty Chai", "Chilled Adeni chai blended with espresso over ice, creating a smooth, creamy drink with a bold coffee kick…", 699]
        ]
      },
      {
        name: "Fall Season Drinks",
        items: [
          ["Banoffee Latte", "Rich espresso with creamy milk, sweet banana, and smooth caramel. (optional cold foam).", 699],
          ["Maple Cinnamon Latte", "Rich espresso with creamy milk, sweet maple, and a warm touch of cinnamon. (optional cold foam).", 699],
          ["Pumpkin Cookie Butter Latte", "Rich espresso with creamy milk, biscoff cookie butter, and pumpkin spice. (optional cold foam).", 719],
          ["Pumpkin Snickerdoodle Latte", "Rich espresso with creamy milk, pumpkin spice, white mocha, and sweet brown sugar. (optional cold foam).", 719],
          ["Iced Pumpkin Spice Chai", "Adeni Chai Blend, Evaporated Milk, Pumpkin Spice Sauce & Warm Spices (optional cold foam).", 749],
          ["Hot Pumpkin Spice Chai", "Adeni Chai Blend, Evaporated Milk, Pumpkin Spice Sauce & Warm Spices (optional cold foam).", 699]
        ]
      },
      {
        name: "Refreshers",
        items: [
          ["Mango Passion Fruit", "A refreshing blend of mango and passion fruit over ice, delivering a bright, tropical flavor with a smooth…", 619],
          ["Kiwi Dragon Fruit", "A refreshing blend of kiwi and dragon fruit over ice, offering a vibrant, tangy-sweet flavor with a crisp…", 619],
          ["Mango Watermelon", "A refreshing blend of mango and watermelon over ice, delivering a juicy, sweet flavor with a light and…", 619],
          ["Lemonade", "Freshly squeezed lemon juice blended with water and a touch of sweetness for a crisp, refreshing drink with…", 619],
          ["Mojito", "A refreshing blend of mint, lime, and sparkling soda over ice, delivering a crisp, cool flavor with a zesty…", 699],
          ["Strawberry Lemonade", "Freshly squeezed lemonade blended with ripe strawberries for a refreshing, sweet-tart drink with a bright…", 619],
          ["Dragon Fruit", "A refreshing dragon fruit drink over ice, offering a lightly sweet, vibrant flavor with a crisp and fruity…", 619],
          ["Strawberry Acai", "A refreshing blend of strawberry and açaí over ice, delivering a sweet, tangy flavor with a smooth, fruity…", 719],
          ["Pink Drink", "A refreshing blend of strawberry açaí and creamy coconut milk over ice, delivering a smooth, lightly sweet…", 719],
          ["Lemon Ginger", "A refreshing blend of lemon and ginger over ice, offering a bright citrus kick with a warm, lightly spiced…", 559],
          ["Mango Dragon Fruit", "A refreshing blend of mango and dragon fruit, shaken with ice and refresher base", 619]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["Mango Smoothie", "A smooth blend of ripe mango with a touch of Vimto syrup, creating a rich, fruity drink with a unique sweet…", 695],
          ["Strawberry Smoothie", "A smooth blend of ripe strawberries and milk, creating a creamy, refreshing drink with a naturally sweet…", 695],
          ["Strawberry Banana Smoothie", "A smooth blend of ripe strawberries and banana with milk, creating a creamy, naturally sweet drink with a…", 695],
          ["Banana Smoothie", "A smooth blend of ripe banana and milk, creating a creamy, naturally sweet drink with a rich and comforting…", 695]
        ]
      },
      {
        name: "Tea",
        items: [
          ["Wild Peach Tea", "A refreshing tea with a sweet, fruity peach flavor", 499],
          ["Green Tea", "A light, refreshing tea with a smooth, delicate flavor", 495],
          ["Tangerine Tea", "A refreshing tea with a bright, citrusy flavor", 499],
          ["Tea Bag", "Your choice of any available tea from our collection, freshly brewed to order", 349]
        ]
      },
      {
        name: "Fatayer & Sandwiches",
        items: [
          ["Beef Fatayer", "Savory baked pastry filled with seasoned beef and aromatic Middle Eastern spices.", 595],
          ["Chicken Fatayer", "Savory baked pastry filled with seasoned chicken and aromatic Middle Eastern spices.", 595],
          ["Cheese Fatayer", "Savory baked pastry filled with warm, creamy cheese and baked to a golden finish.", 595],
          ["Spinach Fatayer", "", 595],
          ["Potato Fatayer", "Savory baked pastry filled with seasoned potatoes and aromatic Middle Eastern spices.", 595],
          ["Chicken Musakhan", "Savory Musakhan pastry filled with tender chicken, caramelized onions, and aromatic Palestinian spices.", 575],
          ["Spinach Feta Fatayer", "Savory baked pastry filled with spinach and creamy feta cheese for a rich, flavorful bite.", 595],
          ["Zaater Feta", "Savory baked pastry filled with creamy feta cheese and aromatic za’atar for a delicious Middle Eastern…", 595],
          ["Egg Cheese Fatayer", "A savory baked pastry stuffed with fluffy eggs and melted cheese, wrapped in soft dough and baked until…", 595],
          ["Pastrami Ciabatta Sandwich", "Savory pastrami layered in a warm, crispy ciabatta roll for a hearty, flavorful sandwich.", 800],
          ["Turkey Pesto Ciabatta Sandwich", "", 800],
          ["Chicken Ranch Ciabatta Sandwich", "Grilled chicken, creamy ranch, and fresh toppings served on a warm, crispy ciabatta roll.", 800],
          ["Chicken Shawarma Wrap", "Tender chicken shawarma wrapped in soft flatbread with savory spices for a flavorful, satisfying bite.", 999]
        ]
      },
      {
        name: "Croissants",
        items: [
          ["Plain Butter Croissant", "A light, flaky pastry with a rich, buttery flavor", 549],
          ["Almond Croissant", "Flaky, buttery croissant topped with sliced almonds and a sweet, nutty finish.", 579],
          ["Chocolate Croissant", "A buttery, flaky croissant filled with rich, smooth chocolate", 599],
          ["Biscoff Croissant", "", 800],
          ["Nutella Chocolate Croissant", "Flaky, buttery croissant filled with rich Nutella and chocolate for a sweet, indulgent treat.", 800],
          ["Pistachio Croissant", "Flaky, buttery croissant filled with creamy pistachio and topped with crunchy pistachio pieces.", 800]
        ]
      },
      {
        name: "Pastries",
        items: [
          ["Honeycomb", "A soft, sweet pastry filled with creamy cheese and finished with honey", 649]
        ]
      },
      {
        name: "Baklava",
        items: [
          ["Small Pistachio Baklava 2Pc", "Two pieces of crispy, flaky baklava filled with rich pistachios and finished with sweet syrup.", 499]
        ]
      },
      {
        name: "Milk Cakes",
        items: [
          ["Pistachio Milk Cake", "Soft and moist pistachio sponge soaked in sweet milk, topped with creamy frosting and crunchy pistachio…", 699],
          ["Rose Milk Cake", "Soft and fluffy sponge soaked in sweet rose milk, topped with creamy frosting and delicate rose flavors for…", 749],
          ["Saffron Milk Cake", "Soft sponge soaked in rich saffron-infused milk, topped with creamy frosting and a hint of golden saffron…", 749],
          ["Dubai Milk Cake", "Soft sponge soaked in rich milk, layered with creamy chocolate and pistachio flavors, and finished with a…", 849]
        ]
      },
      {
        name: "Cheesecakes",
        items: [
          ["Pistachio Cheesecake", "A rich and creamy cheesecake with a smooth, velvety texture on a buttery biscuit crust, topped with crushed…", 899],
          ["Biscoff Cheesecake", "", 899],
          ["Red Velvet Cheesecake", "", 899],
          ["Oreo Cheesecake", "", 899],
          ["Tiramisu Cheesecake", "A creamy cheesecake with rich coffee, cocoa, and classic  tiramisu flavor", 899],
          ["Ferrero Cheesecake", "A smooth and creamy chocolate cheesecake on a buttery biscuit crust, topped with a rich chocolate ganache…", 899],
          ["Ube Cheesecake", "A creamy cheesecake with the sweet, nutty flavor of ube", 899]
        ]
      }
    ],
    hours: "Mon–Fri 6am–12am, Sat–Sun 7am–12am",
    phone: "(510) 431-3006",
    orderUrl: "https://thesanaacafe.com/menu",
    siteNote: "Menu and Hayward Whipple hours are from thesanaacafe.com (chain-wide menu; prices may vary slightly by location)."
  },
  'sandwich-monkey': {
    hours: "Mon–Fri 10am–4pm, Sat–Sun 10:30am–4pm",
    siteNote: "Hours are from their own website."
  },
  'scoop-n-chill': {
    sections: [
      {
        name: "Gelato",
        items: [
          ["Thai Tea Gelato", "", 599],
          ["Ube Gelato", "", 599],
          ["Matcha Gelato", "", 599],
          ["Nutella Gelato", "", 599],
          ["Pineapple Sorbet", "", 599],
          ["Gelato Mix", "", 599]
        ]
      },
      {
        name: "Ice Cream",
        items: [
          ["Ice Cream Single Scoop", "", 599],
          ["Ice Cream Double Scoop", "", 699],
          ["Ice Cream Triple Scoop", "", 799]
        ]
      },
      {
        name: "Sundaes",
        items: [
          ["Classic Sundae", "Your choice of ice cream and toppings, with cherry, whipped cream and crushed nuts.", 899],
          ["Oreo Milk Sundae", "Cookies & cream ice cream over crushed Oreos in milk, with chocolate sauces and whip.", 899],
          ["Fruity Pebble Milk Sundae", "Vanilla ice cream over Fruity Pebbles and milk, white chocolate drizzle.", 899],
          ["Tiramisu Sundae", "Lady fingers, double espresso, espresso chocolate chip ice cream, mascarpone cream, cocoa.", 999],
          ["Baklava Sundae", "Crushed baklava and vanilla ice cream with cinnamon, honey and pistachios.", 999],
          ["Strawberry Cheesecake Sundae", "Cream cheese frosting, strawberry ice cream, fresh strawberries, graham crumbs.", 1099]
        ]
      },
      {
        name: "Crepes",
        items: [
          ["Nutella Strawberry Crepe", "Nutella drizzle and fresh strawberries, powdered sugar.", 1499],
          ["Dubai Chocolate Crepe", "Pistachio sauce and katafi, Nutella, crushed pistachio.", 1599],
          ["Dubai Biscoff Crepe", "Katafi, Biscoff crumbs, Biscoff and white chocolate sauce.", 1599],
          ["Biscoff Crepe", "Biscoff crumbs, Biscoff sauce, white chocolate, a Biscoff cookie.", 1499],
          ["Oreo Crepe", "Oreo crumbles, white chocolate and Hershey's sauce.", 1499],
          ["Reese’s Crepe", "Reese's crumbles, peanut butter and Hershey's sauce.", 1499],
          ["S’mores Crepe", "Mini marshmallows, graham crumbs, Hershey's sauce, toasted marshmallows.", 1499],
          ["Fruity Pebbles Crepe", "Fruity Pebbles, white chocolate, strawberry drizzle.", 1499],
          ["Pistachio Stuffed Crepe", "Stuffed with crushed pistachios, pistachio sauce & white chocolate sauce.", 1599],
          ["Build Your Own Crepe", "Up to two sauces and two toppings; whipped cream on the side.", 1499]
        ]
      },
      {
        name: "Sushi Crepes",
        items: [
          ["Dubai Chocolate Sushi Crepe", "Rolled with katafi; Nutella and pistachio drizzle, crushed pistachios.", 1699],
          ["Biscoff Sushi Crepe", "Filled with Biscoff cookies; Biscoff and white chocolate sauce.", 1699],
          ["Nutella Sushi Crepe", "Rolled with Nutella and fresh strawberries.", 1699],
          ["Fruity Pebbles Sushi Crepe", "Rolled with white chocolate and Fruity Pebbles.", 1699],
          ["Oreo Sushi Crepe", "Rolled with white chocolate and Oreo crumbs.", 1699],
          ["Dubai Biscoff Sushi Crepe", "Filled with katafi and Biscoff cookies.", 1699]
        ]
      },
      {
        name: "Croffles",
        items: [
          ["Dubai Chocolate Croffle", "Pistachio and Nutella sauce, katafi, crushed pistachios.", 999],
          ["Dubai Biscoff Croffle", "", 999],
          ["Biscoff Croffle", "White chocolate and Biscoff sauce, Biscoff crumbles.", 999],
          ["Nutella Strawberry Croffle", "Sliced strawberries, Nutella, powdered sugar.", 999],
          ["Nutella Banana Croffle", "Sliced bananas, Nutella, powdered sugar.", 999],
          ["Oreo Croffle", "Chocolate and white chocolate sauce, Oreo crumbles, an Oreo.", 999],
          ["Reese’s Croffle", "Reese's peanut butter, chocolate syrup, Reese's bits.", 999],
          ["S’mores Croffle", "", 999],
          ["Fruity Pebble Croffle", "White chocolate, strawberry syrup, Fruity Pebbles.", 999],
          ["Plain Croffle", "", 799],
          ["Build Your Own Croffle", "Up to two sauces and two toppings; whipped cream on the side.", 999]
        ]
      },
      {
        name: "Strawberry Cups",
        items: [
          ["Dubai Chocolate Strawberries", "", 1299],
          ["Nutella Strawberries", "", 1199],
          ["Biscoff Strawberries", "", 1199],
          ["Oreo Strawberries", "", 1199],
          ["White Chocolate Strawberries", "", 1199],
          ["White Chocolate Biscoff Strawberries", "", 1199],
          ["Nutella Biscoff Strawberries", "", 1199],
          ["Cheesecake Strawberries", "", 1299]
        ]
      },
      {
        name: "Milkshakes",
        items: [
          ["Vanilla Milkshake", "", 699],
          ["Chocolate Milkshake", "", 699],
          ["Strawberry Milkshake", "", 699],
          ["Biscoff Milkshake", "Biscoff cookies, vanilla ice cream, whole milk, whipped cream.", 799],
          ["Nutella Milkshake", "", 799],
          ["Oreo Milkshake", "", 799],
          ["Reese’s Milkshake", "Vanilla ice cream with Reese's bits and peanut butter.", 799],
          ["Fruity Pebble Milkshake", "", 799],
          ["Ube Milkshake", "", 799],
          ["Banana Pudding Milkshake", "Banana pudding blended with vanilla ice cream and Nilla wafer crumbs.", 799],
          ["Cinnamon Toast Crunch Milkshake", "", 799],
          ["Cap N Crunch Milkshake", "", 799],
          ["Pecan Praline Milkshake", "", 799],
          ["Birthday Cake Milkshake", "", 799],
          ["Mint Chocolate Chip Milkshake", "", 799],
          ["Build Your Own Milkshake", "Up to three scoops, one topping and drizzles of your choice.", 749]
        ]
      },
      {
        name: "Chills (Lemonades)",
        items: [
          ["Blue Raspberry Lemonade", "24 oz.", 599],
          ["Mango Pineapple Lemonade", "24 oz.", 599],
          ["Strawberry Lemonade", "24 oz.", 599],
          ["Strawberry Watermelon Lemonade", "", 599],
          ["Guava Lemonade", "24 oz.", 599],
          ["Strawberry Kiwi Lemonade", "24 oz.", 599],
          ["Hibiscus Lemonade", "24 oz.", 599]
        ]
      },
      {
        name: "Classic Espresso",
        items: [
          ["Espresso Shot", "Double shot.", 300],
          ["Espresso Macchiato", "Double shot with a dollop of steamed milk and foam.", 400],
          ["Americano", "", 450],
          ["Cappuccino", "", 500],
          ["Flat White", "", 500],
          ["Cortado", "", 500],
          ["Cafe Latte", "", 600]
        ]
      },
      {
        name: "Specialty Drinks",
        items: [
          ["Pumpkin Spice Latte", "", 700],
          ["Biscoff Latte", "Biscoff cookie butter and espresso with your choice of milk.", 600],
          ["Nutella Latte", "Nutella and double espresso with your choice of milk.", 600],
          ["Honey Latte", "100% real honey.", 600],
          ["Caramel Macchiato", "Caramel, vanilla and espresso with your choice of milk.", 600],
          ["Mocha", "Dark chocolate and espresso with milk, topped with whipped cream.", 600],
          ["White Chocolate Mocha", "", 600],
          ["Zebra Mocha", "White and dark chocolate with espresso and milk.", 600]
        ]
      },
      {
        name: "Teas and More",
        items: [
          ["Hot Chocolate", "", 500],
          ["Green Teas", "", 435],
          ["Herbal Teas", "", 435],
          ["Black Teas", "", 435]
        ]
      }
    ],
    hours: "Sun–Thu 2–10pm, Fri–Sat 2pm–12am",
    phone: "(510) 934-7045",
    orderUrl: "https://order.snackpass.co/scoopnchill",
    siteNote: "Menu and prices from their own Snackpass ordering page (2122 Shattuck Ave); hours from Google, matching Yelp and Apple Maps."
  },
  'sea-wagyu-house': {
    sections: [
      {
        name: "All-You-Can-Eat Tiers",
        items: [
          ["Silver (adult)", "AYCE: wagyu beef toro & bulgogi, short rib, ribeye, pork, chicken, Dragon Seafood Tower, sushi, apps", 4500],
          ["Silver (kids 3–10)", "", 2250],
          ["Gold (adult)", "Adds wagyu chuck eye, ribeye cap, finger meat & flat iron; one seafood platter per table", 5800],
          ["Gold (kids 3–10)", "", 2900],
          ["Diamond (adult)", "Adds A5 wagyu & caviar platter and abalone/lobster tail seafood platter (one per table)", 7500],
          ["Diamond (kids 3–10)", "", 3750]
        ]
      },
      {
        name: "Soft Drinks",
        items: [
          ["Coca-Cola", "", 299],
          ["Diet Coke", "", 299],
          ["Coke Zero", "", 299],
          ["Sprite", "", 299],
          ["Ginger Ale", "", 299],
          ["Pibb Xtra", "", 299],
          ["Iced Tea", "", 299],
          ["Lemonade", "", 299],
          ["Soda Water", "", 299],
          ["Fresh Lemonade", "", 599],
          ["Coconut Juice", "", 699],
          ["Apple Juice", "", 300],
          ["Orange Juice", "", 300],
          ["Hot Green Tea", "", 199],
          ["Hot Rice Tea", "", 299],
          ["Shirley Temple", "", 399],
          ["Thai Iced Tea", "", 499],
          ["Sour Plum Juice", "", 399],
          ["Honey Jasmine", "", 399],
          ["Herbal Tea", "", 399],
          ["Black Barley Tea", "", 399],
          ["Calpico", "", 499],
          ["Moshi Yuzu", "", 599],
          ["Moshi White Peach", "", 599]
        ]
      }
    ],
    siteNote: "Tier prices and drinks are from the restaurant's own table-ordering menu (kwickmenu); what each tier includes is from seawagyuhouse.com/menu."
  },
  'senor-sisig': {
    sections: [
      {
        name: "Specials",
        items: [
          ["Mission Sisig Burrito", "Choice of protein with pinto beans, tomatillo salsa, sour cream, guacamole and pico de gallo wrapped with…", 1825],
          ["Crispy Sinigang Wings", "Crispy wings marinated and tossed in a sinigang (tamarind) seasoning with fresno peppers. Paired with a…", 1700]
        ]
      },
      {
        name: "Main Menu",
        items: [
          ["Sisig Taco", "Your choice of protein on one 6\" corn tortilla topped with onions, lettuce, and our cilantro cream sauce…", 400],
          ["The Señor Sisig Burrito", "Choice of protein wrapped in a flour tortilla w/ adobo garlic rice, pinto beans, lettuce, pico de gallo…", 1525],
          ["California Sisig Burrito", "Choice of protein wrapped in a flour tortilla w/ french fries inside, shredded cheese, sour cream…", 1625],
          ["Tosilog Burrito", "Filipino sweet pork wrapped in a flour tortilla w/ adobo garlic rice, fresh sliced tomatoes & a fried egg…", 1625],
          ["The Whole Barnyard", "French fries topped with pork, chicken, tofu, tocino, shredded cheese, sour cream, guacamole, pico de…", 2250],
          ["Sisig Crunch-a-dilla", "Choice of protein with monterey jack cheese, pico de gallo, lettuce, sour cream & guacamole layered with a…", 1750],
          ["Sisig Nachos", "Corn tortilla chips topped w/ choice of protein, nacho cheese, sour cream, guacamole, pico de gallo, and…", 1625],
          ["Sisig Fries", "Crispy shoestring french fries topped w/ choice of protein, nacho cheese, sour cream, guacamole, pico de…", 1625],
          ["Sisig Rice Bowl", "Steamed rice topped w/ choice of protein, diced onions, diced jalapeños & achara. Comes with one free…", 1600],
          ["The Señor Sisig Bowl", "Choice of protein w/ adobo garlic rice, pinto beans, lettuce, pico de gallo, and our cilantro cream sauce…", 1525],
          ["Sisig Salad", "Choice of protein w/ shredded lettuce, pico de gallo, shredded cheese, fried flour tortilla strips and our…", 1525]
        ]
      },
      {
        name: "Kids Menu",
        items: [
          ["Kids Rice Bowl", "", 800],
          ["RBC", "Rice, bean & cheese burrito", 650],
          ["Cheese Quesadilla", "Flour tortilla with melted shredded cheese", 550],
          ["Cheese Nachos", "Tortilla chips with nacho cheese", 450],
          ["Cheese Fries", "French fries with nacho cheese", 450]
        ]
      },
      {
        name: "Vegano Menu",
        items: [
          ["VEGANO Sisig Taco", "Choice of vegan protein on a 6\" corn tortilla topped with onions, lettuce, fresh jalapeños & our vegan…", 500],
          ["VEGANO Señor Sisig Burrito", "Choice of vegan protein wrapped in a flour tortilla with adobo garlic rice, pinto beans, lettuce, pico de…", 1600],
          ["VEGANO California Sisig Burrito", "Choice of vegan protein wrapped in a flour tortilla with french fries, vegan shredded cheese, vegan sour…", 1700],
          ["VEGANO Silog Burrito", "Choice of vegan protein wrapped in a flour tortilla with adobo garlic rice, fresh tomatoes and a vegan…", 1550],
          ["VEGANO Sisig Crunch-a-dilla", "Choice of vegan protein with vegan shredded cheese, pico de gallo, lettuce, vegan sour cream, and…", 1850],
          ["VEGANO Sisig Nachos", "Choice of vegan protein with corn tortilla chips topped with vegan nacho cheese, vegan sour cream…", 1700],
          ["VEGANO Sisig Fries", "Choice of vegan protein with french fries topped with vegan nacho cheese, vegan sour cream, guacamole…", 1700],
          ["VEGANO Señor Sisig Bowl", "Choice of vegan protein with adobo garlic rice, pinto beans, lettuce, pico de gallo & our vegan cilantro…", 1600],
          ["VEGANO Silog Bowl", "Choice of vegan protein with adobo garlic rice, fresh tomatoes and a vegan scrambled egg. Served with an…", 1550],
          ["VEGANO Sisig Rice Bowl", "Choice of vegan protein served with steamed rice and topped with diced onions, diced jalapeños & a side of…", 1650],
          ["VEGANO Sisig Salad", "Choice of vegan protein w/ shredded lettuce, pico de gallo, vegan shredded cheese, fried tortilla strips…", 1600]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Ube Macapuno Churros", "Mini churros tossed in cinnamon sugar and topped with toasted coconut flakes. Served with a macapuno and…", 700]
        ]
      },
      {
        name: "Side Items & A La Carte",
        items: [
          ["Chips & Guac", "", 400],
          ["Chips & Pico", "Tortilla chips with a side of pico de gallo", 400],
          ["Chili Lime Chicharrones", "", 300],
          ["Side of Fries", "Plain side of french fries", 300],
          ["Side of Tortilla Chips", "Side of tortilla chips", 200],
          ["Side of Guacamole", "", 200],
          ["Fried Egg", "", 200],
          ["Sisig A La Carte", "Your choice of protein served a la carte", 900]
        ]
      },
      {
        name: "Frescas",
        items: [
          ["Ube Horchata", "", 600],
          ["Pandan Iced Tea", "", 500],
          ["Mangonada Fresca", "Housemade mango fresca with chamoy and tajin drizzle", 500],
          ["Calamansi Ginger Limeade", "", 500],
          ["Half & Half", "Mix of 2 fresca choices", 500]
        ]
      },
      {
        name: "Canned/Bottled Drinks",
        items: [
          ["Watermelon Juice", "", 500],
          ["Mexican Coke", "", 500],
          ["Jarritos Mandarin", "", 500],
          ["Jarritos Pineapple", "", 500],
          ["Jarritos Mineragua", "", 500],
          ["Coke Can", "", 350],
          ["Coke Zero", "", 350],
          ["Diet Coke", "", 350],
          ["Sprite", "", 350],
          ["Dasani Water", "Enhanced with minerals for a crisp, clean and fresh taste", 200]
        ]
      }
    ],
    orderUrl: "https://order.online/store/senor-sisig-sf-mission-1005568",
    siteNote: "Menu and prices are from their own online ordering page for the 990 Valencia St (Mission) store."
  },
  'seoul-to-tokyo-kitchen': {
    sections: [
      {
        name: "Small Plates",
        items: [
          ["Agedashi Tofu", "Fried tofu, scallion, tempura sauce", 900],
          ["Kimchi Mandoo", "Steamed jumbo dumplings with kimchi, pork and vegetables", 1200],
          ["Gyoza", "Deep-fried dumplings with beef and vegetables", 900],
          ["K-Chicken Wings", "Deep fried, original, spicy or sweet soy, with radish kimchi", 1100],
          ["Karaage", "Original, spicy or teriyaki fried chicken nuggets with slaw", 1100],
          ["Popcorn Shrimp", "With orange spicy aioli", 1100],
          ["Edamame", "", 600],
          ["Spicy Garlic Edamame", "", 700],
          ["Oyster Tempura", "", 1200],
          ["Tempura Shrimp and Vegetables", "", 1200],
          ["Calamari Fries", "", 1200],
          ["Ika Shoyaki", "Grilled squid", 1400],
          ["Spicy Squid", "Sautéed with onion, green onion and cabbage in spicy sauce", 1400],
          ["Shrimp Shumai", "", 1100],
          ["Bacon Okonomiyaki", "Japanese pancake with cabbage, green onion, egg, mayo and katsuo", 1500],
          ["Jalapeño Bomb", "Spicy tuna, crab meat, cream cheese and jalapeño, fried", 1200],
          ["Martini Prawn", "Prawn tempura with spicy aioli", 1200],
          ["Takoyaki", "With shaved bonito and QP mayo", 1200],
          ["Seafood Pancake", "Assorted seafood, green onion, red pepper, shiitake and onion", 1600],
          ["Kimchee Pancake", "Kimchi, green onion, red pepper, shiitake and onion", 1200],
          ["Tteok-bokki", "Rice cake and fish cake in spicy gochujang or sweet galbi sauce", 1500],
          ["Japchae", "Stir-fried glass noodles with assorted vegetables", 1200],
          ["Kimbap", "Korean rice roll with vegetables and cooked meats in seaweed", 1700]
        ]
      },
      {
        name: "Soup & Salad",
        items: [
          ["House Miso", "", 400],
          ["House Salad", "", 600],
          ["Cucumber Salad", "", 700],
          ["Wakame Salad", "Seaweed", 700],
          ["Chicken Salad", "", 1400]
        ]
      },
      {
        name: "From Seoul",
        items: [
          ["Galbi Jjim", "Braised short rib, potato, carrot, radish, dates in sweet soy with mozzarella; with six banchan", 3200],
          ["Galbi Gui", "L.A.-style short rib marinated in sweet soy, on a cast-iron plate; with six banchan", 2800],
          ["Naengmyeon", "Cold buckwheat noodles with cucumber, brisket and egg, in broth or spicy sauce", 2000],
          ["Bulgogi", "Sweet soy marinated beef, onion, shiitake, scallion", 2200],
          ["Yukgaejang", "Spicy beef soup with shredded brisket, scallions and vegetables", 2100],
          ["Gamjatang (Spicy Pork Bone Stew)", "Neck bone, potato, carrot in spicy stew", 2400],
          ["Pan-Fried Mackerel", "", 1900],
          ["Suyuk (Soy Braised Pork Belly)", "With radish kimchi, ssamjang and romaine", 2200],
          ["Spicy Pork Spare Rib", "Gochujang-marinated rib, potato, carrot, sweet potato, rice cake", 2400],
          ["Spicy Pork", "Spicy marinated pork, onion, scallion on a sizzling skillet", 2100],
          ["Spicy Chicken", "Spicy gochujang or teriyaki chicken, onion, scallion on a sizzling skillet", 1900],
          ["Grilled Eel", "With oyster mushroom, onion, jalapeño and garlic", 2800],
          ["Seoul Soon Tofu", "Soft tofu stew with vegetables and choice of meat or seafood", 1900],
          ["Bibimbap", "Assorted vegetables, bulgogi, egg over white rice", 2200],
          ["Hot Stone Bowl Bibimbap", "Assorted vegetables, bulgogi, egg over rice in a sizzling stone bowl", 2400],
          ["Army Stew", "Spicy chili broth with tofu, Spam, sausage, rice cake, vegetables and ramen noodles", 2900]
        ]
      },
      {
        name: "Noodles & Japanese",
        items: [
          ["Udon", "Shoyu broth, thick noodles, bok choy, onion, mushrooms and choice of protein", 1900],
          ["Ramen", "Pork-bone broth, thin noodles, bok choy, corn, bamboo shoot, egg and choice of protein", 1900],
          ["Pho", "Light beef-bone broth, rice noodles, meatballs; brisket, beef rib (+$2) or grilled chicken", 1900],
          ["Seolleongtang (Ox Bone Soup)", "Marrow-bone soup with braised brisket and shank", 1900],
          ["Bento Box, One Item", "Miso soup, salad, 2 gyoza, edamame, rice and one protein", 2100],
          ["Bento Box, Two Items", "Miso soup, salad, 2 gyoza, edamame, rice and two proteins", 2800],
          ["Katsu", "Japanese cutlet: pork, chicken or N.Y. steak", 2100]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Soft Drinks", "", 300],
          ["Sparkling Water", "Japan", 500],
          ["Ramune Japanese Soda", "Original, strawberry, grape or melon", 500],
          ["Green Tea or Barley Tea", "Hot or cold", 300],
          ["Iced Tea", "Unsweetened", 300],
          ["Lemonade", "", 300],
          ["Thai Iced Tea", "", 450]
        ]
      }
    ],
    siteNote: "Menu and prices are from the Canva menu their own site links as its menu (\"# Seoul to Tokyo Menu (8.5x11)\"), read from the design's text."
  },
  'shattuck-and-butter': {
    hours: "Daily 7am–3pm",
    email: "shattucknbutter@gmail.com",
    siteNote: "Hours are the planned launch hours on shattuckandbutter.com; the restaurant is opening (soft launch) Oct 2026."
  },
  'shibam-coffee-newark': {
    sections: [
      {
        name: "Yemeni Coffee Bar",
        items: [
          ["Jubani", "From: Light roast Yemeni coffee + qishr (husk), cardamom, ginger & cinnamon", 550],
          ["Turkish Coffee", "From: Dark roast Yemeni coffee with cardamom", 550],
          ["Rad'ai", "From: Light roast Yemeni coffee, ginger & cardamom", 550],
          ["Saudi Coffee", "From: Light roast coffee, cardamom & saffron", 550],
          ["Qishr", "From: Coffee husk, ginger & cinnamon", 550],
          ["Sana'ni", "From: Organic single-origin premium Yemeni coffee", 550],
          ["Muffawar", "From: Organic single-origin premium Yemeni coffee with milk", 550]
        ]
      },
      {
        name: "Tea",
        items: [
          ["Iced Adani", "Chilled Adeni tea; choice of size and sweetness", 942],
          ["Meditative Mind", "From: Organic white tea, jasmine pearls & rose petals", 550],
          ["Moroccan Mint Tea", "From: Gunpowder green tea & spearmint leaves", 550],
          ["Adeni Tea", "From: Premium Yemeni black tea, cardamom, nutmeg & cream", 550],
          ["Yemeni Black Tea", "From: Premium Yemeni black tea, clove, cardamom, cinnamon", 360]
        ]
      },
      {
        name: "Iced Latte",
        items: [
          ["Iced Pistachio Latte", "Espresso and pistachio; choice of milk and size", 1072],
          ["Iced Matcha", "", 1072],
          ["Iced Spanish Latte", "", 1072],
          ["Iced Brown Sugar Shak'n", "Chilled latte with brown sugar; whole, oat or almond milk", 1072],
          ["Iced Mocha", "", 1020],
          ["Iced Plain Latte", "", 1020],
          ["Iced Shibam Latte", "", 1020],
          ["Iced Flavored Latte", "", 1020]
        ]
      },
      {
        name: "Hot Latte",
        items: [
          ["Hot Spanish Latte", "", 1072],
          ["Hot Brown Sugar Shak'n", "", 1072],
          ["Hot Mocha", "", 1020],
          ["Hot Pistachio Latte", "", 1072],
          ["Hot Lotus Latte", "", 1072],
          ["Hot Matcha", "", 1072],
          ["Hot Plain Latte", "", 1020],
          ["Hot Shibam Latte", "", 1020],
          ["Hot Latte", "", 1020]
        ]
      },
      {
        name: "Espresso Bar",
        items: [
          ["Iced Americano 16oz", "", 780],
          ["Cortado", "Double shot + steamed milk", 910],
          ["Drip Coffee", "From: Small, medium or large", 400],
          ["Traditional Macchiato", "Double shot + dollop of milk foam", 780],
          ["Hot Americano 12oz", "Double shot + water", 780],
          ["Cappuccino 12oz", "Double shot + steamed milk & foam", 910],
          ["Espresso", "Double shot", 780]
        ]
      },
      {
        name: "Refreshers",
        items: [
          ["Shibam Royal", "Mango, dates & evaporated milk", 942],
          ["Shibam Mist", "Iced 20oz beverage", 942],
          ["Strawberry Acai", "Water or lemonade base", 942],
          ["Mojito", "Strawberry, raspberry, mango or blueberry", 942],
          ["Dragon Fruit", "Dragon fruit pieces, mango & lemonade", 942]
        ]
      },
      {
        name: "Kids",
        items: [
          ["Iced French Vanilla", "", 780],
          ["French Vanilla Frappe", "", 780],
          ["Hot Cocoa", "Hot chocolate milk & foam", 780],
          ["Cocoa Frappe", "", 780],
          ["Hot French Vanilla", "Vanilla bean", 780],
          ["Iced Cocoa", "", 780],
          ["Babyccino", "Steamed milk & flavor", 780],
          ["Ginger Milk", "Creamy milk with a hint of ginger", 780]
        ]
      }
    ],
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their DoorDash store (Shibam Coffee Newark, 34903 Newark Blvd)."
  },
  'sidewalk-juice': {
    hours: "Daily 9am–6pm",
    phone: "(415) 529-6305",
    siteNote: "Hours from Google, consistent with their own ordering site's Haight St hours (orders until 5:45pm)."
  },
  'slanging-dough-pizza': {
    hours: "Wed 2–6pm Saratoga FM, Thu 4–8pm Livermore Downtown FM, Sat 9am–1pm Willow Glen FM",
    phone: "(510) 709-9341",
    siteNote: "Hours are the weekly farmers-market schedule on Slanging Dough's own Find Us page; phone is from Yelp."
  },
  'sofra-grill': {
    hours: "Tue–Sun 11am–9pm, Closed Mon",
    siteNote: "Hours come from Sofra Grill's Yelp listing; their own site shows no hours."
  },
  'soulsip': {
    sections: [
      {
        name: "Coffee Foam",
        items: [
          ["Brown Sugar Foam Coffee", "Chilled coffee with brown sugar foam; choose sweetness", 799],
          ["Tiramisu Foam Coffee", "Chilled coffee topped with tiramisu foam", 799],
          ["Egg Foam Coffee", "Iced coffee topped with frothy egg foam", 799],
          ["Sea Salt Foam Coffee", "Iced coffee topped with sea salt foam", 799],
          ["Biscoff Coffee", "", 799],
          ["Cheese Creama Foam Coffee", "Iced coffee topped with cheese creama foam", 799],
          ["Pandan Foam Coffee", "Iced coffee topped with pandan foam", 799],
          ["Coconut Foam Coffee", "Iced coffee with coconut foam", 799]
        ]
      },
      {
        name: "Phin Drips & Latte",
        items: [
          ["Vietnamese Latte", "Iced Vietnamese coffee latte; choose sweetness", 684],
          ["Caramel Dalgona Latte", "Iced latte with caramel and dalgona", 799],
          ["Vietnamese Coffee", "Iced Vietnamese coffee; choose sweetness", 684]
        ]
      },
      {
        name: "Matcha Series (Ceremonial Grade A)",
        items: [
          ["Strawberry Foam Matcha", "Ceremonial grade matcha with strawberry foam; choice of milk", 949],
          ["Biscoff Foam Matcha", "Ceremonial grade matcha topped with Biscoff foam; served iced", 949],
          ["Pistachio Foam Matcha", "Matcha topped with pistachio foam; choice of milk", 949],
          ["Tiramisu Foam Matcha", "Ceremonial grade matcha with tiramisu foam; choice of milk", 949],
          ["Mango Foam Matcha", "", 949],
          ["Matcha Latte", "Ceremonial grade A matcha", 891],
          ["Hojicha Latte", "", 863]
        ]
      },
      {
        name: "Fruit Tea",
        items: [
          ["Watermelon & Lychee & Passionfruit", "With jasmine tea and fruit bits", 891],
          ["Soursop Passionfruit", "With jasmine tea and fruit bits", 891],
          ["Soursop & Mango & Strawberry", "With jasmine tea and fruit bits", 891],
          ["Blueberry & Lychee & Chrysanthemum", "Jasmine tea with blueberry, lychee, rose and chrysanthemum", 891],
          ["Lychee Tea", "With jasmine tea and lychee jelly", 891],
          ["Mango Passionfruit", "With jasmine tea and fruit bits", 891],
          ["Soulsip Deluxe", "With jasmine tea and mixed fruits", 891]
        ]
      },
      {
        name: "Smoothies (Real Fruit Blended)",
        items: [
          ["Banana Strawberry", "", 978],
          ["Honeydew Smoothie", "", 949],
          ["Mango & Passionfruit & Strawberry Smoothie", "", 978]
        ]
      },
      {
        name: "Lotus Tea",
        items: [
          ["Pandan Lotus Tea", "Pandan-infused tea with lotus aroma", 949],
          ["Cheese Creama Lotus Tea", "Lotus tea topped with cheese cream", 949],
          ["Pistachio Lotus Tea", "Pistachio-infused tea", 949]
        ]
      },
      {
        name: "Milk Tea & Tea with Foam",
        items: [
          ["Jasmine Tea with Foam", "Jasmine tea with your choice of foam, like coconut or Biscoff", 799],
          ["Pure Jasmine Tea", "", 518],
          ["Jasmine Milktea", "Jasmine tea with creamy foam", 719],
          ["Thai Tea Milktea", "", 748]
        ]
      }
    ],
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu and prices come from Soulsip's DoorDash store at 2002 Alum Rock Ave (no website of their own found)."
  },
  'stans-donut-shop': {
    hours: "Daily 6am–2:30pm",
    siteNote: "Hours are from their own menu page (operating hours 6am–2:30pm) and Yelp; cash or check only."
  },
  'state-bird-provisions': {
    hours: "Sun–Thu 5:30pm–10pm, Fri–Sat 5:30pm–10:30pm",
    siteNote: "Hours are from statebirdsf.com."
  },
  'stefanos-solar-pizza-petaluma': {
    hours: "Sun–Thu 11am–9pm, Fri–Sat 11am–9:30pm",
    email: "stefanospizzasolar@gmail.com",
    siteNote: "Hours and email from the footer of stefanossolarpizza.com."
  },
  'stefanos-solar-pizza-san-rafael': {
    hours: "Sun–Thu 11am–9pm, Fri–Sat 11am–9:30pm",
    email: "stefanospizzasolar@gmail.com",
    siteNote: "Hours and email from the footer of stefanossolarpizza.com."
  },
  'stella-pastry': {
    sections: [
      {
        name: "Pastries & Slices",
        items: [
          ["Sacripantina", "Signature sponge soaked in rum with zabaglione cream.", 875],
          ["Tiramisu", "Vanilla sponge soaked in espresso and rum with layers of mascarpone cream.", 875],
          ["Cannoli", "Crisp shell filled with lightly sweetened ricotta, sprinkled with chocolate.", 775],
          ["Strawberry Shortcake", "Vanilla sponge with fresh strawberries and whipped cream.", 875],
          ["Choco Truffle", "Devil's food cake with ganache filling and truffle glaze.", 875],
          ["Black and White Slice", "Vanilla and chocolate layers with whipped cream and fudge icing.", 875],
          ["Fedora Slice", "Rum-soaked chocolate cake with Italian pastry cream and whipped cream.", 875],
          ["Napoleon", "Puff pastry layers with custard filling and fondant glaze.", 875],
          ["Custard Eclair", "", 875],
          ["Whipped Cream Eclair", "", 875],
          ["Cream Puff", "Puff pastry filled with whipped cream.", 875],
          ["Cheesecake", "Graham crust and rich New York cheesecake.", 875],
          ["Strawberry Cheesecake", "", 875],
          ["Blueberry Cheesecake", "", 875],
          ["Fruit Tart", "Sweet pastry filled with fresh fruit.", 875],
          ["Cookies by the Pound (1 lb)", "Assorted tea cookies.", 2800]
        ]
      },
      {
        name: "Whole Cakes",
        items: [
          ["Sacripantina 6\"", "", 4500],
          ["Strawberry Shortcake 6\"", "Sponge with whipped cream and fresh strawberries.", 4500],
          ["Sacripantina 8\"", "", 5790],
          ["Chocolate Truffle 8\"", "Chocolate cake with truffle filling.", 5790],
          ["Black & White 8\"", "", 5790],
          ["Fedora 8\"", "", 5790],
          ["St. Honore 8\"", "", 5790],
          ["Tiramisu 8\"", "", 5790]
        ]
      }
    ],
    hours: "Mon–Wed 7:30am–8pm, Thu 7:30am–9pm, Fri–Sat 7:30am–11pm, Sun 7:30am–10pm",
    phone: "(415) 986-2914",
    orderUrl: "https://www.ubereats.com/store/stella-pastry-%26-cafe/BRxiJkueRpywb71ec6kLVw",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their Uber Eats store (446 Columbus Ave); hours from their Google Business listing, matching Yelp."
  },
  'street-social': {
    sections: [
      {
        name: "To Begin",
        items: [
          ["Stuffed Peppadews", "Boquerones, Urfa, aioli", 1000],
          ["Olives & Pickles", "Togarashi", 1100],
          ["Gem Lettuces", "Green goddess, fennel, almond dukkah", 1700],
          ["Grilled Cone Cabbage", "Ginger marmalade, chile crisp, lime", 2000],
          ["Roasted Spaghetti Squash 'Cacio e Pepe'", "Pecorino, cured egg yolk", 2100],
          ["Mt. Lassen Trout Gravlax & Golden Beets", "Pickled carrot, labneh, ice plant", 2300],
          ["Shrimp Toast B.L.T.", "Koji mayo, tomato jam, watercress", 2400]
        ]
      },
      {
        name: "Bigger Plates",
        items: [
          ["BBQ Hamachi Collar", "'The Crowd Pleaser': tamarind & honey glaze, furikake, lime (add lettuce & shiso +$3)", 2500],
          ["Arugula Spatzli & Pork Cheek Ragu", "Mushrooms, Malabar spinach, bread crumb", 3400],
          ["Liberty Duck Confit", "Szechuan honey, charred eggplant, turmeric fried rice, pak choy", 3600],
          ["Grilled New York with Bone Marrow Butter", "BG A-1, seasoned frites, arugula salad", 7400]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Raspberry Sorbet", "", 900],
          ["Orange Cardamom Ice Cream", "Vegan", 900]
        ]
      },
      {
        name: "Neighborhood Night (Wednesdays)",
        items: [
          ["3-Course Prix Fixe", "Optional Wednesday set menu; dishes change weekly", 4500]
        ]
      }
    ],
    hours: "Tue–Sat 5:30pm–9pm; Closed Sun–Mon",
    siteNote: "Menu is the Thursday–Friday menu (updated 10.22.26) posted on streetsocial.social; it changes weekly. Hours are from their Reservations page."
  },
  'supreme-crab-ayce': {
    hours: "Mon–Fri 12–3:30pm & 5–11pm, Sat–Sun 12–11pm",
    siteNote: "Hours from the Locations page on supremecrabayce.com."
  },
  'suptea-lab': {
    hours: "Tue–Sun 11am–8pm; Closed Mon",
    phone: "(510) 817-4738",
    siteNote: "Hours from their Google Business listing and Instagram bio (Tues–Sun 11am–8pm); Yelp agrees."
  },
  'sweet-pipers': {
    hours: "Wed 10am–3pm, Thu 10am–4pm; Closed Fri–Tue (pre-orders accepted)",
    siteNote: "Hours from their Google Business listing for 2352-A San Pablo Ave, Pinole; Yelp agrees (Mon–Tue closed, Wed 10am–3pm)."
  },
  'tacos-mi-reynita-fremont': {
    hours: "Tue–Sun 1–10pm; Closed Mon",
    orderUrl: "https://tacosmireynita.toast.site/order/tacos-mi-reynita-restaurant-hayward-821-sycamore-avenue",
    siteNote: "Hours are from the Google and Yelp listings for the 39161 Farwell Dr location; Apple Maps, YupUp and a Fremont Foodies post agree."
  },
  'tacos-papo': {
    hours: "Daily 8am–9pm",
    email: "Tacospapo@gmail.com",
    siteNote: "Hours are from the contact page on their own website."
  },
  'tacos-walnut-creek': {
    sections: [
      {
        name: "Tacos",
        items: [
          ["Street Taco", "Choice of meat, onion and cilantro", 449],
          ["Jalisco Style Pastor Taco", "Al pastor with grilled onions, cilantro, pineapple and chipotle salsa", 449],
          ["Super Taco", "Choice of meat, onion, cilantro, salsa, sour cream, cheese and guacamole", 599],
          ["Fish Taco", "Grilled fish, chipotle mayo, grilled pineapple, pico and cabbage", 749],
          ["Shrimp Taco", "Grilled shrimp, chipotle mayo, grilled pineapple, pico and cabbage", 749],
          ["Spider Taco", "Cheese-stuffed corn tortilla, choice of meat, whole beans, tomatillo salsa, onions, cilantro", 749],
          ["Veggie Taco", "Rice, beans, cheese, lettuce, sour cream, guacamole and tomato", 749],
          ["Tacos Dorados (4 pcs)", "Choice of meat, refried beans, cheese, sour cream, lettuce, guacamole, tomatillo salsa", 1799],
          ["Taco Salad", "Flour tortilla bowl with choice of meat, rice, beans, cheese, sour cream, guacamole", 1849]
        ]
      },
      {
        name: "Burritos",
        items: [
          ["Regular Burrito", "Choice of meat, rice, beans, cilantro, onions and tomatillo salsa", 1499],
          ["Super Burrito", "Choice of meat, rice, beans, cheese, lettuce, sour cream, guacamole, tomatillo salsa", 1799],
          ["Bean & Cheese Burrito", "Refried beans and cheese", 1049],
          ["California Burrito", "Potatoes, carne asada, refried beans, cheese, sour cream and pico de gallo", 1699],
          ["Super Veggie Burrito", "Rice, beans, cheese, lettuce and pico de gallo", 1499],
          ["Vegan Burrito", "Black beans, rice, pico de gallo, avocado, corn and cabbage", 1249],
          ["Walnut Creek Burrito (Vegetarian)", "Grilled fajita veggies, rice, beans, cheese, sour cream, guacamole, lettuce", 1699],
          ["Fajita Burrito", "Beef or chicken fajitas, refried beans, cheese, tomatillo salsa, sour cream, avocado", 1899],
          ["Chile Relleno Burrito", "Chile relleno, rice, beans, cheese, onion, cilantro and avocado", 1599],
          ["Regular Shrimp Burrito", "Rice, beans, tomatillo and tomato salsa", 1699],
          ["Super Shrimp Burrito", "Rice, beans, cheese, lettuce, guacamole and sour cream", 1899],
          ["49ers Burrito", "Super burrito covered with red enchilada sauce and cheese", 1949],
          ["Oakland A's Burrito", "Super burrito covered with green enchilada sauce and cheese", 1949],
          ["El Tri-color Burrito", "Super burrito with half red, half green enchilada sauce and cheese", 1949],
          ["Diablo Burrito", "Super burrito covered with chipotle enchilada sauce and cheese", 1949]
        ]
      },
      {
        name: "Platters (Platillos)",
        items: [
          ["Taco Plate (1 pc)", "With rice, beans, cheese, lettuce, sour cream, guacamole, salsa and tortillas", 1125],
          ["Enchilada Plate (1 pc)", "With rice, beans, cheese, lettuce, sour cream, guacamole, salsa and tortillas", 1325],
          ["Tostada Plate (1 pc)", "With rice, beans, cheese, lettuce, sour cream, guacamole, salsa and tortillas", 1425],
          ["Chile Relleno Plate", "With rice, beans, cheese, lettuce, sour cream, guacamole, salsa and tortillas", 1599],
          ["Super Quesadilla Plate", "Choice of meat; with rice, beans and fixings", 1599],
          ["Grilled Veggies Plate", "With rice, beans, cheese, lettuce, sour cream, guacamole and tortillas", 1625],
          ["Carnitas Plate (Orden de Carnitas)", "Slow-cooked shredded pork", 1899],
          ["Chile Verde Plate", "Pork in green tomatillo salsa with rice, beans and fixings", 1899],
          ["Carne Asada Plate", "Grilled flap steak with rice, beans and fixings", 2299]
        ]
      },
      {
        name: "Fajitas & Seafood",
        items: [
          ["Chicken Fajitas", "With rice, beans, lettuce, sour cream, guacamole, salsa, cheese and tortillas", 2399],
          ["Steak Fajitas", "With rice, beans, lettuce, sour cream, guacamole, salsa, cheese and tortillas", 2399],
          ["Shrimp Fajitas", "With rice, beans, lettuce, sour cream, guacamole, salsa, cheese and tortillas", 2499],
          ["Mixed Fajitas (2 Choices)", "With rice, beans and fixings", 2699],
          ["Camarones al Mojo de Ajo", "Shrimp in butter garlic sauce with rice and beans", 2299],
          ["Camarones a la Diabla", "Shrimp in spicy chipotle sauce with bell peppers, onions, rice and beans", 2299],
          ["Coctel de Camarón", "Shrimp cocktail with onions, tomatoes, cilantro, avocado and cucumber", 2199]
        ]
      },
      {
        name: "Breakfast",
        items: [
          ["Breakfast Burrito", "3 eggs, choice of chorizo, bacon or ham, rice, beans, cheese, tomatillo salsa", 1699],
          ["2 Breakfast Tacos", "Egg and chorizo scramble, corn tortillas, cheese, avocado and salsa", 1599],
          ["Chilaquiles Verdes o Rojos", "Scrambled eggs, refried beans, onion, cilantro, cheese and sour cream", 1725],
          ["Huevos Rancheros", "Scrambled eggs, carnitas, ranchero sauce on a crispy tortilla over black beans", 1725],
          ["Huevos con Chorizo", "3 eggs with Mexican sausage, rice, beans and fixings", 1725],
          ["Huevos con Papa", "3 eggs with potatoes, rice, beans and fixings", 1725],
          ["Huevos a la Mexicana", "3 eggs with peppers, onions and tomatoes, rice, beans and fixings", 1725],
          ["Huevos con Jamón", "3 eggs with ham, rice, beans and fixings", 1725]
        ]
      },
      {
        name: "Nachos, Quesadillas & Salads",
        items: [
          ["Super Nachos", "Choice of meat, refried beans, cheese, guacamole, sour cream and jalapeño", 1999],
          ["Rancheros Nachos", "Black beans, rice, cheese, pico de gallo, cilantro, corn and avocado", 1499],
          ["Veggie Nachos", "Pinto beans, cheese, guacamole, sour cream, cilantro and jalapeños", 1499],
          ["Flour Quesadilla", "Melted cheese in a flour tortilla", 599],
          ["Quesadilla Mula", "Corn tortilla, meat, onion, cilantro and tomatillo salsa", 999],
          ["Quesadilla Azteca", "Flour tortilla, carne asada, grilled onion, bacon and avocado", 1199],
          ["Quesadilla Grande", "14-inch flour tortilla with guacamole, sour cream and tomatillo salsa", 1299],
          ["Tapatio Salad", "Spring mix, corn, cucumber, black beans, tomato, grilled chicken, cheese", 1699],
          ["Arroyo de los Nueces Salad", "Spring mix, pickled onions, cabbage, beets, walnuts, carne asada", 1699],
          ["Carne en su Jugo (32 oz)", "Family-recipe beef broth with carne asada, bacon, whole beans, onions", 1975],
          ["Small Carne en su Jugo (12 oz)", "", 1299]
        ]
      },
      {
        name: "A la Carte & Kids",
        items: [
          ["Enchilada", "", 699],
          ["Chile Relleno", "", 999],
          ["Tostada", "", 999],
          ["Guacamole", "House-made", 1299],
          ["Side of Rice", "", 500],
          ["Side of Beans", "", 500],
          ["Side of Meat", "", 1299],
          ["Kids Bean, Cheese & Rice Burrito", "", 799],
          ["Kids Meat Burrito", "Rice, beans, cheese and beef or chicken", 1149],
          ["Kids Quesadilla Meal", "Cheese or meat quesadilla, rice and beans, small drink", 1199],
          ["Kids Taco Meal", "Taco, rice and beans, small drink", 1199],
          ["Kids Nachos", "Refried beans, cheese and meat", 1299]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Agua Fresca", "", 425],
          ["Jarritos, Sidral or Sangria", "", 449],
          ["Coca-Cola or Fanta (Bottle)", "", 525],
          ["Soda (Can)", "", 300],
          ["Water (Bottle)", "", 300]
        ]
      }
    ],
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their Uber Eats store, which their website links to."
  },
  'tada-ramen': {
    sections: [
      {
        name: "Appetizers",
        items: [
          ["Edamame", "Choice of garlic sauce or salt seasoning", 600],
          ["Gyoza", "Classic Tada's signature pan-fried chicken & vegetable gyoza. Choice of Tada' special sauce or gyoza sauce.", 1200],
          ["Grilled Corn Cob", "Grilled sweet corn on cob with spice seasoning", 1100],
          ["Enoki Chips", "Crispy fried enoki mushroom. Enjoy with lemon and spicy seasoning.", 1000],
          ["Takoyaki", "Octopus balls with bonito flakes, seaweed powder, japanese mayo, and Takoyaki sauce", 1000],
          ["Shishito", "Japanese peppers with spicy yuzu seasoning.", 800],
          ["Chicken Karaage", "Japanese style fried chicken served with house Japanese Mayo", 1200],
          ["Ebi Furai", "Japanese crispy prawns coated in panko breadcrumbs served w/tempura sauce (5pcs)", 1400],
          ["Tada Bun", "Japanese steamed bun filled with Tada pork belly (1pc)", 600],
          ["Tada Shrimp Bun", "Steamed bun filled with spring mix, mayo, house sauce.", 800]
        ]
      },
      {
        name: "Ramen & Udon",
        items: [
          ["Miso Ramen", "Housemade signature Paitan broth, pork chashu, green onion, bamboo shoot, bean sprout, corn, seasoned egg", 1900],
          ["TanTan Men", "Housemade Paitan broth, spicy seasoned ground pork, chashu, chives, bamboo shoot, bean sprout, half egg", 1900],
          ["Kake Udon", "Warm udon in a light, savory fish broth, green onion, naruto, poached egg and tempura flakes.", 1900],
          ["Chicken Kake Udon", "Udon in light fish broth with seasoned sliced chicken, green onion, naruto, poached egg, tempura flakes.", 1900],
          ["Beef Kake Udon", "Udon in light fish broth with seasoned sliced beef, green onion, naruto, poached egg, tempura flakes.", 1900],
          ["Beef Udon Curry", "Udon noodles in Japanese curry with seasoned sliced beef, caramelized onions, pickled red ginger.", 2000],
          ["Chicken Ramen", "Potato noodles in chicken broth with a hint of yuzu, sliced chicken, shiitake, sprouts, fried garlic.", 1900],
          ["Spicy Vegan Ramen", "Spicy creamy organic soy milk broth, spinach noodles, organic tofu, bamboo shoot, mushrooms, corn", 2000],
          ["Soy Cream Zen Ramen", "Delicate vegan creamy soy milk broth, spinach noodles, organic tofu, mushrooms, bamboo shoot, corn", 1900],
          ["Veggie Bliss", "Veggie light miso broth, spinach noodles, organic tofu, bamboo shoot, mushrooms, corn & nori", 1900],
          ["Mazemen", "Soupless ramen, house sauce, egg noodle, ground pork, pork chashu, corn, sprouts, soft boiled egg", 1900],
          ["TadaMen", "Medium spicy. NY strip steak in a Japanese-Thai curry broth, red onion, cilantro, lime, crispy noodle", 2300],
          ["Hiyashi Chuka", "Chilled noodles, chashu, ham, cherry tomato, cucumber, corn, egg ribbons, light yuzu soy sauce", 1800]
        ]
      },
      {
        name: "Rice Bowls",
        items: [
          ["Chashu Bowl", "Slow-cooked Tada pork belly with house sauce, soft-boiled egg, spring mix, seaweed salad, pickled ginger", 1800],
          ["Beef Bowl", "Sliced beef with house teriyaki sauce over white rice, spring mix, seaweed salad, pickled ginger", 1800],
          ["Beef Curry Bowl", "Sliced beef and caramelized onion over white rice with house curry, pickled ginger, green onion.", 1900],
          ["Karaage Bowl", "Japanese fried chicken, house mayo, spring mix, seaweed salad & pickled ginger", 1800],
          ["Chicken Karaage Curry", "Japanese fried chicken with Japanese curry, green onion, pickled ginger over white rice", 1900],
          ["Unagi Don", "Grilled eel fillet, spring mix, seaweed salad, pickled ginger over steamed rice.", 2200],
          ["Ebi Furai Curry", "Large panko-crusted shrimp and Japanese curry with white rice, green onion, pickled red ginger", 1900]
        ]
      },
      {
        name: "Yakitori (Skewers)",
        items: [
          ["Scallop Bacon", "1 skewer", 900],
          ["Eel", "1 skewer", 900],
          ["Combo (Prawn, Scallop & Eel)", "1 skewer", 900],
          ["Scallop", "", 900],
          ["Chicken Thigh", "", 800],
          ["Negima", "", 800],
          ["Chicken Heart", "", 800],
          ["Chicken Liver", "", 800],
          ["Pork Belly", "", 800],
          ["Ebi", "", 800],
          ["Tsukune", "Chicken meatball with house sauce", 800],
          ["Mochi Bacon", "", 700],
          ["Enoki Bacon", "", 700],
          ["Shishito Bacon", "", 700],
          ["Eggplant", "", 700],
          ["Oyster Mushroom", "", 700],
          ["Shiitake Mushroom", "", 700],
          ["Tomato", "", 700]
        ]
      },
      {
        name: "Toppings & Sides",
        items: [
          ["Nori (3pcs)", "", 100],
          ["Corn", "", 100],
          ["Naruto", "Japanese fish cakes", 200],
          ["Bean Sprout", "Marinated bean sprout", 100],
          ["Pork Chashu", "Tada's signature pork belly", 400],
          ["Seasoned Tofu", "", 250],
          ["Menma", "Seasoned bamboo shoot", 200],
          ["Seasoned Boiled Egg", "", 300],
          ["Wood Ear Mushroom", "", 100],
          ["Kaedama", "Extra serving of noodles", 350],
          ["Tada Spicy Ball", "Signature Tada spicy chili paste", 100],
          ["Shrimp Tempura (1pc)", "", 300],
          ["Extra Broth", "Tonkotsu, yuzu, miso, tan tan, veggie bliss, spicy vegan or soy cream zen", 1000],
          ["Black Garlic Oil", "", 100],
          ["Potato Noodles", "", 350],
          ["Udon Noodles", "", 350],
          ["Green Onion", "", 200],
          ["Poached Egg", "", 300],
          ["Pumpkin Croquette", "", 300],
          ["Steamed Rice", "", 300],
          ["Seaweed Salad", "", 600],
          ["Curry 8oz", "", 600]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Yuzu Sparkling", "Sparkling lemonade made with Japanese yuzu citrus", 600],
          ["Matcha Strawberry", "Matcha green tea and strawberry essence with sparkling water", 600],
          ["Ramune Soda Original", "Japanese marble soda, lemon-lime flavor", 500],
          ["Iced Matcha", "Unsweetened organic Japanese matcha", 500],
          ["Matcha Coconut", "Coconut water topped with matcha cold foam", 700],
          ["Sparkling Water", "", 400],
          ["Coke", "", 300],
          ["Diet Coke", "", 300],
          ["Sprite", "", 300]
        ]
      },
      {
        name: "Dessert",
        items: [
          ["Yuzu Cheesecake", "Creamy cheesecake flavored with Japanese yuzu citrus (1pc)", 700]
        ]
      }
    ],
    hours: "Sun–Thu 11:30am–9:15pm, Fri–Sat 11:30am–9:45pm",
    phone: "(510) 844-4995",
    orderUrl: "https://www.toasttab.com/local/order/tadaramen",
    siteNote: "Menu, hours and phone from their own Toast online ordering page (pickup only)."
  },
  'taj-mahal-livermore': {
    hours: "Tue–Thu 12–2:30pm & 5:30–10pm, Fri 12–2:30pm & 6–11pm, Sat 12–3:30pm & 6–11pm, Sun 12–3:30pm & 5:30–10pm; Closed Mon",
    siteNote: "Hours are from the opening-hours block on tajmahalflavorsofindia.com; Google's listing matches except it closes Fri–Sat at 10:30pm."
  },
  'taqueria-azteca-dublin': {
    sections: [
      {
        name: "Game Day & Family Boxes",
        items: [
          ["20 Street Tacos & Asada Fries Box", "", 3500],
          ["20 Street Tacos, Chips, French Fries & Esquites", "", 3500],
          ["20 Taquitos & Asada Fries", "Rolled corn tortillas stuffed with potatoes or choice of meat", 3500]
        ]
      },
      {
        name: "Breakfast – Desayuno",
        items: [
          ["Breakfast Taco", "Organic corn tortilla, refried beans, bacon or chorizo, red potatoes, fried egg", 600],
          ["Breakfast Burrito – Mexican Style", "3 free-range eggs, choice of protein; add sausage & gravy wet style", 1450],
          ["Breakfast Burrito – American Style", "Eggs, cheese, tater tots and choice of protein", 1450],
          ["Chorizo or Bacon & Free-Range Eggs", "With tomato rice, refried beans and tortillas", 1595],
          ["Breakfast Fries", "Fries topped with chorizo, bacon or carne asada and eggs; jack & cheddar", 1595],
          ["Chilaquiles in Red Guajillo Sauce & Eggs", "2 free-range eggs, onions, queso fresco, refried beans", 1700],
          ["Chilaquiles in Green Tomatillo Sauce & Eggs", "2 free-range eggs, onions, queso fresco, refried beans", 1700],
          ["Huevos Rancheros", "Two eggs over fried corn tortillas, tomato rice, refried beans", 1700],
          ["Huevos a la Mexicana", "Eggs with green chile, tomatoes and onions", 1700],
          ["Huevos Divorciados", "Two eggs topped with red and green salsa", 1700],
          ["Machaca", "Shredded beef and eggs, tomato rice, refried beans", 1700],
          ["Breakfast Torta", "Bolillo, refried beans, chorizo or bacon, potatoes, avocado, queso fresco", 1700],
          ["Chile Verde Omelette", "Three eggs stuffed with spicy pork chile verde", 1800],
          ["Rib-Eye Carne Asada & Eggs", "Carne asada and 2 eggs, beans, tomato rice, tortillas", 2400],
          ["No Mames Giant Breakfast Burrito", "Mexican or American style", 3500]
        ]
      },
      {
        name: "Tamal Hondurano – Nacatamal",
        items: [
          ["Nacatamal", "Honduran tamal with chicken, rice, green peas and potatoes", 850],
          ["Nacatamal Combo", "With rice & beans", 1300],
          ["Nacatamal – Dozen", "", 5500]
        ]
      },
      {
        name: "Seafood – Mariscos",
        items: [
          ["Tacos Gobernador", "Sautéed shrimp and cheese on grilled corn tortillas, red onion, cilantro", 575],
          ["Shrimp Taco (Sautéed in Butter)", "Shrimp, cabbage, tomato, cilantro and onions", 525],
          ["Cod Fish Taco (Sautéed in Butter)", "Cod, cabbage, tomato, cilantro and onions", 525],
          ["Shrimp Ceviche Tostada", "Shrimp in fresh lime juice with onion, tomato and cilantro", 1000],
          ["Cod Ceviche Tostada", "Cod in fresh lime juice, onion, tomato, cilantro, avocado", 1000],
          ["Shrimp Cocktail", "Shrimp in zesty sauce with onions, tomatoes, avocado and cucumber; crackers", 1800],
          ["Mojarra Frita", "Crispy fried whole fish with cucumber, tomato, red onion and rice", 1900],
          ["Mojarra al Ajillo", "Fried mojarra in garlic sauce, french fries", 2000],
          ["Caldo de Camarones", "Shrimp and vegetable soup", 2000],
          ["Mojarra a la Diabla", "Fried mojarra a la diabla, french fries", 2100],
          ["Camarones a la Diabla", "Shrimp in spicy chile sauce, beans, tortillas", 2100],
          ["Mojarra Frita with Diabla Shrimp", "Fried mojarra topped with diabla shrimp, french fries", 2300]
        ]
      },
      {
        name: "Mexican Pizza",
        items: [
          ["Personal Mexican Pizza", "", 1700],
          ["Vegetarian Mexican Pizza", "13\" flour tortilla, jack & cheddar, refried beans", 2495],
          ["Mexican Pizza", "Carne asada, shrimp, chicken, al pastor, chorizo, carnitas, chile verde or birria", 3095],
          ["Carne Asada and Shrimp Mexican Pizza", "13\" flour tortilla, jack & cheddar, refried beans", 3295],
          ["Birria Pizza", "13\" flour tortilla with a pound of jack & cheddar and birria", 3100]
        ]
      },
      {
        name: "Tacos",
        items: [
          ["Fajitas Veggie Taco", "Organic corn tortillas, black beans, avocado & salsa", 425],
          ["Organic Corn Tortilla Taco", "Choice of meat, cilantro and onions", 475],
          ["Taco al Pastor & Pineapple", "Al pastor, grilled pineapple, cilantro, red onion", 475],
          ["Crispy Taco", "Choice of meat, lettuce, cheese, tomato, cilantro, onions", 475],
          ["QuesaTaco", "Corn tortillas with jack cheese, cilantro, red onion and filling", 575],
          ["Super Taco", "With cheese, sour cream and guacamole", 600],
          ["Carne Asada & Shrimp QuesaTaco", "", 600],
          ["2 Crispy Tacos Combo", "Beans, tomato rice, guacamole, sour cream", 1595],
          ["2 Soft Tacos Combo", "Beans, tomato rice, guacamole, sour cream", 1600],
          ["Shrimp Tacos Combo", "2 sautéed shrimp tacos with beans", 1695],
          ["Taquitos Combo", "Four rolled fried organic corn tortillas with choice of filling", 1695],
          ["Taco Pack (6)", "6 soft tacos, cilantro and onions", 2495],
          ["No Mames Taco", "Giant hard-shell taco", 3000]
        ]
      },
      {
        name: "Burritos",
        items: [
          ["Beans & Cheese Burrito", "", 900],
          ["Veggie Super Burrito (No Meat)", "Beans, rice, cheese, sour cream, guacamole, pico", 1200],
          ["Fajitas Veggie Regular Burrito", "Grilled bell peppers and onions, beans, rice, cheese, salsa fresca", 1300],
          ["Regular Burrito", "Choice of meat and beans, tomato rice, salsa fresca", 1500],
          ["Sautéed Shrimp Regular Burrito", "Beans, tomato rice, salsa fresca", 1600],
          ["California Burrito", "Carne asada or other protein, fries, jack cheese, guacamole, sour cream, pico", 1650],
          ["Super Burrito", "Meat, beans, rice, salsa fresca, cheese, sour cream, guacamole", 1700],
          ["Mojados / Wet Burrito", "Topped with red enchilada or green tomatillo sauce and cheese", 1800],
          ["Chimichanga", "Deep-fried burrito with meat and cheese; rice, beans, sour cream, guac", 1800],
          ["Chile Relleno Super Burrito", "Handmade chile relleno in a grilled flour tortilla", 1800],
          ["Chile Relleno & Birria Super Burrito", "", 1850],
          ["No Mames Giant Burrito", "3 large flour tortillas stuffed with meat, rice, beans, cheese, sour cream, guac", 3500]
        ]
      },
      {
        name: "Tortas",
        items: [
          ["Torta de Frijoles & Queso", "Refried beans, queso fresco, avocado, sour cream, lettuce", 1200],
          ["Torta de Jamón & Huevos", "Honey ham and eggs with lettuce, onion, tomato, refried beans", 1600],
          ["Torta", "From. Choice of meat with lettuce, refried beans, tomato, onion, queso fresco, sour cream, guac", 1800],
          ["Torta de Carnitas", "Michoacan-style carnitas on a toasted bolillo", 1800],
          ["Torta de Birria", "Bolillo dipped in consomé with cheese, onion, cilantro", 1800],
          ["Tortas Ahogadas de Carnitas", "Spicy pork carnitas, pickled onions", 1800],
          ["Torta de Rib-Eye Carne Asada", "Grilled rib-eye on a toasted bolillo", 2000],
          ["Torta Milanesa de Rib Eye", "Breaded rib eye, refried beans, lettuce, tomato, avocado", 2000],
          ["Torta Cubana", "Ham, cheese, chorizo and more", 2000]
        ]
      },
      {
        name: "Street Food",
        items: [
          ["Elotes with Flaming Hot Cheetos", "Street corn on the cob with crema and cotija", 600],
          ["Esquites con Carne", "Corn with meat, mayo, cotija and chile", 1000],
          ["Taquitos de Papas y Queso en Vaso", "5 taquitos stuffed with queso fresco and red potatoes", 1295],
          ["Birria \"Cheesesteak\"", "Birria, melted cheese and bell peppers on a bolillo; fries and consomé", 1695],
          ["Grilled Cheese with Carnitas", "With french fries", 1800],
          ["Grilled Cheese with Birria", "With french fries and consomé", 1800],
          ["Taquitos de Papas y Queso Topped with Birria", "5 taquitos with queso fresco and red potatoes", 1800]
        ]
      },
      {
        name: "French Fries",
        items: [
          ["Carne Asada Fries", "Jack and cheddar cheese", 1700],
          ["Carnitas Fries", "Jack and cheddar, pico de gallo", 1700],
          ["Al Pastor Fries", "Jack and cheddar, pico de gallo", 1700],
          ["Chile Verde Fries", "Jack and cheddar", 1700],
          ["Sautéed Shrimp Fries", "Jack and cheddar", 1800]
        ]
      },
      {
        name: "Soups – Caldos",
        items: [
          ["Caldo de Res", "Beef stewed with potatoes, carrots, corn and cabbage", 1795],
          ["Organic Chicken Avocado Tortilla Soup", "Chicken and vegetables with sliced avocado", 1795],
          ["Red Menudo with Hominy", "Honeycomb tripe and patas with hominy in guajillo chile", 1795],
          ["Green Pozole with Hominy", "Pork, chicken and spine meat with hominy", 1795],
          ["Caldo de Res with Ramen Noodles", "", 2000],
          ["Pho Birria", "Beef birria, rice noodles, cilantro, red onion, lime", 2000],
          ["PhoBirria with Short Rib", "", 2300],
          ["Birria Short Rib Ramen", "Fresh ramen with short rib birria and boiled egg", 2300],
          ["Caldo de Res with Ramen and Short Ribs", "", 2300]
        ]
      },
      {
        name: "Birria (Michoacan family recipe)",
        items: [
          ["Tacos de Birria", "Corn tortillas, cilantro and onions", 475],
          ["Quesabirria", "Birria on corn tortillas with melted jack cheese", 500],
          ["Bao Birria", "Bao bun with birria and pickled daikon", 500],
          ["3 Tacos de Birria with Consomé", "", 1595],
          ["Birria Loaded Fries", "Fries with birria, jack, cheddar and sour cream", 1595],
          ["3 Quesabirria with Consomé", "", 1695],
          ["Lengua de Birria Tacos (3)", "Tongue braised in birria consomé", 1700],
          ["Birria Plate with Consomé", "Birria with onions, cilantro, tomato rice and beans", 1800],
          ["Sopa de Birria", "Birria in broth with red onion, cilantro, radish and lime", 1900],
          ["Side of Consomé (16 oz)", "", 350]
        ]
      },
      {
        name: "Classics",
        items: [
          ["Cheese Quesadilla", "Flour tortilla with jack cheese, sour cream and guacamole", 1200],
          ["Quesadilla", "Grilled flour tortilla stuffed with choice of meat", 1500],
          ["Nachos", "Topped with cheese and choice of meat", 1600],
          ["Meat Plate", "", 1800],
          ["Enchiladas Combo", "Three organic corn tortillas with meat or cheese, beans and rice", 1900],
          ["Enchiladas Style Michoacan", "5 corn tortillas dipped in sauce, stuffed with queso fresco and onion", 1895],
          ["Tamales Combo", "Two tamales with beans, tomato rice, sour cream", 1900],
          ["Chile Rellenos", "Two egg-battered pasilla chiles stuffed with jack cheese", 1900],
          ["Fajitas", "Beef, chicken breast or shrimp; beans and tortillas", 1900],
          ["Sopes Combo", "Two fried masa shells with choice of meat", 1900],
          ["Rib-Eye Carne Asada Plate", "Fire-grilled carne asada with beans, tomato rice and tortillas", 2300]
        ]
      },
      {
        name: "Salads",
        items: [
          ["Tostada", "Crispy corn tortilla topped with choice of meat", 895],
          ["Taco Salad", "Organic flour tortilla basket with choice of meat", 1595]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Churros", "Rolled in sugar and cinnamon", 300],
          ["Flan", "Housemade, topped with caramel", 500],
          ["Churros in a Cup", "4 churros with chocolate, caramel, Nutella or Lechera sauce", 500],
          ["Elotes", "Street corn on the cob with crema and queso", 550],
          ["Esquites en Vaso", "Street corn in a 16 oz cup", 700]
        ]
      },
      {
        name: "Kids' Stuff",
        items: [
          ["Kids Bean & Cheese Burrito", "", 800],
          ["Kids Crispy Taco & Refried Beans", "", 800],
          ["Kids Cheese Enchilada & Refried Beans", "", 800],
          ["Kids Cheese Quesadilla & Refried Beans", "", 800]
        ]
      },
      {
        name: "Sides & A la Carte",
        items: [
          ["Mexican Tomato Rice", "Vegan friendly", 300],
          ["Beans (8 oz)", "Pinto, refried or black; vegan friendly", 300],
          ["French Fries", "", 400],
          ["Chips & 8 oz Salsa", "Organic corn chips and house-made salsa", 500],
          ["Chips & 8 oz Guacamole", "", 800],
          ["Quesadillas de Maíz (2)", "Organic corn tortillas with jack cheese", 800],
          ["Tamal (A la Carte)", "Pork, chicken, birria or vegetarian", 800],
          ["Chile Relleno (A la Carte)", "", 800],
          ["Taquitos (A la Carte)", "", 1200],
          ["Tortillas (Dozen)", "Organic", 600]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Bottled Water", "", 200],
          ["Organic Milk", "", 200],
          ["Can Soda", "", 250],
          ["Coffee", "", 300],
          ["Orange Juice", "", 300],
          ["Martinelli Apple Juice", "", 300],
          ["Jarritos", "", 400],
          ["Mexican Imported Soda", "From. Real sugar, glass bottle", 450],
          ["Agua Fresca", "Horchata, Jamaica or Tamarindo", 500],
          ["Agua Fresca – Large", "", 650]
        ]
      },
      {
        name: "Tamales by the Dozen",
        items: [
          ["Tamales (Dozen)", "From. Handmade; red or green sauce or plain", 3295],
          ["Birria Tamales (Dozen)", "Masa stuffed with birria and jack cheese, with consomé", 3295],
          ["Vegetarian Tamales (Dozen)", "From. Stuffed with queso fresco", 3295]
        ]
      }
    ],
    hours: "Mon–Thu 8am–9pm, Fri–Sat 8am–12am, Sun 8am–10pm",
    orderUrl: "https://order.online/business/41541/store/taqueria-azteca-dublin-64789?pickup=true",
    siteNote: "Menu and prices are from Taqueria Azteca's own online ordering page (order.online, linked from taqueriaazteca.com); hours are from their Yelp listing."
  },
  'tay-ho': {
    hours: "Tue–Sat 11am–3pm & 5:30pm–9pm, Closed Sun–Mon",
    address: "344 12th St, Oakland, CA 94607",
    phone: "(510) 836-6388",
    siteNote: "Hours from AAA TripCanvas and Pearl listings, which agree; tayhooakland.com was not readable."
  },
  'tempura-kaneko-hannosuke': {
    hours: "Daily 11am–1:30pm, 5–9pm",
    phone: "(408) 320-1867",
    siteNote: "Hours from their Yelp listing, matched by WhereTo's listing; no San Jose online menu with prices was found."
  },
  'tequilas-taqueria': {
    hours: "Mon–Fri 10am–9pm, Sat–Sun 9am–9pm",
    siteNote: "Hours from their own website (Livermore Avenue location)."
  },
  'the-breeze-cafe': {
    hours: "Mon–Thu 7am–2:30pm, Fri–Sun 7am–3pm",
    siteNote: "Hours are from Restaurantji and Yelp, which agree; their own site shows none."
  },
  'the-burger-spot-co': {
    hours: "Tue–Thu & Sun 11am–9pm, Fri 11am–10pm, Sat 9am–10pm; Closed Mon",
    siteNote: "Hours from their own website, theburgerspotco.com."
  },
  'the-farmacy': {
    hours: "Mon–Fri 11:30am–7pm, Closed Sat–Sun",
    phone: "(669) 303-6972",
    address: "1 S Park St, San Francisco, CA 94107",
    orderUrl: "https://www.farmacysf.com/popmenu-order",
    siteNote: "Hours, address and phone are from their own website."
  },
  'the-halal-cartel': {
    phone: "(510) 557-0338"
  },
  'the-sweet-spot': {
    hours: "Tue–Thu 3pm–11pm, Fri–Sat 5pm–1am, Sun 3pm–10pm, Closed Mon",
    siteNote: "Hours are from the business hours on their Square site."
  },
  'the-une': {
    sections: [
      {
        name: "Good Eats",
        items: [
          ["Cream Cheese Cucumber Bagel", "Toasted bagel with cream cheese & cucumbers, Everything Bagel seasoning", 750],
          ["Ultimate Breakfast Bagel", "Ham, sausage, bacon, egg & cheddar on a toasted bagel", 795],
          ["Ricotta Honey Avocado Toast", "Sourdough, ricotta, avocado, Everything Bagel seasoning, lemon & honey", 850],
          ["Canadian Bacon Breakfast Muffin", "English muffin with Canadian bacon, egg & cheddar", 750],
          ["Avocado Toast", "Sourdough, olive oil, avocado, Everything Bagel seasoning & lemon", 795],
          ["Corn Cheese", "Seasoned corn with butter, mayo & mozzarella", 395]
        ]
      },
      {
        name: "Sandwiches & Wraps",
        items: [
          ["Build Your Own Classic Sandwich", "Hoagie or sourdough, house mayo, mustard, lettuce, tomato, red onion", 1200],
          ["Beef Bulgogi Sandwich", "Toasted hoagie, house mayo, beef bulgogi, cucumber & cilantro", 1595],
          ["The UNE Chicken Dip Sandwich", "Shredded chicken & mozzarella on a toasted roll, dipped in a tangy sauce", 1595],
          ["Beef Bulgogi Wrap", "Bulgogi & melted cheese, lettuce, sour cream, guacamole", 1495],
          ["Island Chicken Wrap", "Chicken adobo & melted cheese, lettuce, sour cream, guacamole", 1495]
        ]
      },
      {
        name: "Rice Bowls",
        items: [
          ["Bulgogi Rice Bowl", "White rice, bulgogi, cucumber, pickled carrots, sesame seeds", 1595],
          ["Island Chicken Rice Bowl", "White rice, shredded chicken, pineapple, sesame seeds", 1395]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Milky Chill Quenchers", "Milk tea in your choice of flavor; add jelly", 695],
          ["Milkshake", "Premium ice cream, milk & whipped cream", 925],
          ["Caffeine Rush", "Ice blended with Red Bull, sugar-free Red Bull or Sprite", 695],
          ["Can Coke", "", 250],
          ["Can Sprite", "", 250],
          ["Can Diet Coke", "", 250],
          ["Bottled Water", "", 250]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Hawaiian Brand Chips", "Luau BBQ, Hulapeño, Sweet Maui Onion or Original", 225],
          ["Additional Sauce", "", 75]
        ]
      }
    ],
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from The UNE (union city) store on Uber Eats at 3902 Smith St."
  },
  'the-yakitori-bar': {
    sections: [
      {
        name: "Snacks",
        items: [
          ["Edamame", "Boiled soybeans", 500],
          ["Tako Wasa", "Chopped fresh octopus with wasabi sauce", 600],
          ["Umezu Ika", "Squid", 800],
          ["Jidori Gyoza", "House-made chicken gyoza", 800],
          ["Kara-age", "Japanese-style fried chicken", 800],
          ["Fried Crispy Breast Cartilage", "", 1000],
          ["Ebi Katsu", "Shrimp stick", 1000],
          ["Kaki Panko Fried", "Breaded oysters", 1000],
          ["Fried Crispy Chicken Skin", "", 800],
          ["Fried Baby Octopus", "", 800],
          ["Potato Fries", "", 600],
          ["Takoyaki", "Fried octopus balls", 600]
        ]
      },
      {
        name: "Chicken Skewers (Jidori)",
        items: [
          ["Mune", "Breast, 2 skewers", 800],
          ["Tebamoto", "Shoulder, 2 skewers", 800],
          ["Momo", "Thigh, 2 skewers", 800],
          ["Tsukune", "Minced chicken with yolk, 1 skewer", 800],
          ["Reba", "Liver, 2 skewers", 700],
          ["Hatsu", "Heart, 2 skewers", 600],
          ["Sunagimo", "Gizzard, 2 skewers", 600],
          ["Nakaochi", "Neck, 2 skewers", 700],
          ["Hiza Nankotsu", "Knee cartilage, 2 skewers", 800],
          ["Teba", "Wings, 2 skewers", 900],
          ["Sori", "Thigh oyster, 1 skewer", 700]
        ]
      },
      {
        name: "Other Grilled (Yakimono)",
        items: [
          ["Buta Bara", "Kurobuta pork belly, 2 skewers", 800],
          ["Kamo", "Duck breast, 2 skewers", 900],
          ["Gyutan", "Ranch beef tongue, 2 skewers", 1000],
          ["Kalbi", "Short rib, 2 skewers", 900],
          ["Kurobuta Sausage", "Skewer, 5 pieces", 900],
          ["Yaki Onigiri", "Grilled rice ball, 1 piece", 400]
        ]
      },
      {
        name: "Seafood",
        items: [
          ["Sake", "Fresh salmon, 1 skewer", 700],
          ["Hamachi Kama", "Whole", 1500],
          ["Awabi", "Abalone, whole", 1600],
          ["Surume Ika Yaki", "Large Hokkaido squid, whole", 2200]
        ]
      },
      {
        name: "Seasonal Veggie (Yasai Gushi)",
        items: [
          ["Shishito", "Green pepper, 1 skewer", 300],
          ["Okura", "Okra, 1 skewer", 300],
          ["Shiitake Mushroom", "2 skewers", 600],
          ["Eringi", "King oyster mushrooms, 2 skewers", 700],
          ["Cherry Tomato", "2 skewers", 500],
          ["Hokkaido Yaki-Imo", "Sweet potato with salted butter, whole", 600],
          ["Avocado with Yuzutare", "Chef special, half", 800]
        ]
      }
    ],
    pricesEstimated: "Prices are from the menu images on their website, dated 2021; current prices may be higher.",
    siteNote: "Menu is from the three menu images on their own website, theyakitoribar.us/our-menu."
  },
  'the-yard-brentwood': {
    hours: "Thu–Mon 11:30am–8:30pm; Closed Tue–Wed",
    siteNote: "Hours from their own website, brentwoodyard.com."
  },
  'thirstea-san-leandro': {
    hours: "Sun–Wed 11am–9:30pm, Thu–Sat 11am–10pm",
    siteNote: "Hours are from the Google listing for ThirsTea San Leandro (1383 MacArthur Blvd); their Uber Eats store shows the same Sun–Wed hours. Their own site lists the store without hours."
  },
  'timog': {
    hours: "Wed–Thu & Sun 11am–3pm, 5–8pm; Fri–Sat 11am–3pm, 5–10pm; Closed Mon–Tue",
    siteNote: "Hours come from Timog's Yelp listing; their Square site shows no hours."
  },
  'titos-barrio-chino': {
    hours: "Mon–Thu 9am–8pm, Fri 9am–1pm, closed Sat–Sun",
    phone: "(510) 467-0052",
    siteNote: "Hours and phone from Yelp's Barrio Chino listing at 5333 Adeline St."
  },
  'toast-in-town': {
    sections: [
      {
        name: "Starters & Salads",
        items: [
          ["Corn Cheese Rolls", "", 1200],
          ["Mozzarella Sticks", "", 1200],
          ["Coconut Prawns", "", 1200],
          ["Ocean Breeze Salad", "Seared ahi tuna, mixed greens, cucumber, tomatoes, ponzu dressing", 1900],
          ["Berry Blast Salad", "Mixed greens, avocado, cantaloupe, walnuts, berries, feta, berry dressing", 1700]
        ]
      },
      {
        name: "Scrambles & Omelettes",
        items: [
          ["The House", "House breakfast", 1500],
          ["Sweet Garden Scramble", "Baby spinach, onions, cheddar, parmesan", 1800],
          ["Double Double Scramble", "Bacon, apple sausage, Canadian bacon, cheddar", 1900],
          ["Fiesta Scramble", "Chorizo, jalapeños, bell peppers, onions, avocado, pepper jack", 2000],
          ["Green Day (Vegan, No Egg)", "Tofu, bell peppers, cabbage, mushrooms, carrots, onions, curry powder", 1700],
          ["Farm Fresh Omelette", "Baby spinach, mushrooms, bell peppers, tomatoes, onions, mozzarella", 1800],
          ["Golden State Omelette", "Bacon, avocado, tomatoes, cheddar", 1800],
          ["Coastal Crab Omelette", "Dungeness crab, baby spinach, onions, Swiss, parmesan", 2700]
        ]
      },
      {
        name: "Benedicts",
        items: [
          ["Timeless Benedict", "Smoked Canadian bacon, tomatoes, basil hollandaise", 1800],
          ["Florentine Benedict", "Spinach, tomatoes, basil hollandaise", 1700],
          ["Ocean Royal Benedict", "Crab cake, arugula, sriracha hollandaise", 2600],
          ["Nordic Smoked Benedict", "Smoked salmon, pickled red onions, tomatoes, capers, sriracha hollandaise", 2400],
          ["Dill-Icious Prawns Benedict", "Diced prawns, smoked dill mayo, arugula, basil hollandaise", 2300]
        ]
      },
      {
        name: "From the Griddle",
        items: [
          ["Pancakes", "With maple syrup and powdered sugar", 1400],
          ["Mascarpone Berries Pancakes", "Topped with mascarpone and homemade mixed berry sauce", 1700],
          ["Supreme Pancakes", "With two eggs and two strips of bacon", 2200],
          ["Crème Brûlée French Toast", "Custard cream, walnuts, berries", 1600],
          ["Pandan French Toast", "With homemade pandan sauce", 1600],
          ["Roti Ham & Cheese", "Roti, Canadian bacon, cheddar, mozzarella, salad and potato puffs", 1800],
          ["Chicken Croffles", "Crispy chicken, croissant waffle, sweet chili sauce, Biscoff crumble, maple syrup", 2200],
          ["Croffles Bacon Cheese", "Croissant waffle, bacon, scrambled eggs, avocado", 2100]
        ]
      },
      {
        name: "Burgers & Sandwiches",
        items: [
          ["Cali Fresh Burger", "Sesame bun, butter lettuce, tomatoes, onions, cheddar, No. 27 sauce", 1900],
          ["Bacon Bliss Burger", "Applewood bacon, fried egg, romaine, Swiss, ranch", 1900],
          ["Smoky Dill Burger", "Brioche, caramelized onions, butter lettuce, tomatoes, Swiss, smoked dill mayo", 1900],
          ["Crispy Southern Burger", "Fried chicken, coleslaw, pickles, cheddar, sweet chili sauce", 1800],
          ["BLT", "Bacon, avocado, lettuce, tomato, garlic mayo", 1800],
          ["Steakhouse Sandwich", "8 oz ribeye, lettuce, dried tomato, caramelized onions, garlic mayo, Dijon", 2600],
          ["Sunrise Mozzarella (Open-Faced)", "Arugula, fresh mozzarella, prosciutto, tomato, balsamic", 2200],
          ["California Morning (Open-Faced)", "Guacamole, mushrooms, arugula, avocado, feta, dill", 2200],
          ["Breakfast Buddy (Open-Faced)", "Crispy bacon, scrambled eggs, mozzarella", 2200],
          ["Nordic Harmony (Open-Faced)", "Smoked salmon, avocado, shallot, capers, dill", 2500],
          ["Luxe Lox Bagel", "Smoked salmon, cream cheese, tomatoes, shallots, dill, capers, lemon zest", 2400]
        ]
      },
      {
        name: "Specials",
        items: [
          ["Golden Ocean Carbonara", "Shrimp, garlic, onions, ebiko, house cream sauce", 2600],
          ["Tokyo Ribeye", "8 oz ribeye with house sauce, rice, sunny-side up egg and salad", 2900],
          ["Shibuya Chicken", "Fried chicken with roasted seaweed and house sauce, rice, sunny-side up egg", 2300],
          ["Cajun Spaghetti", "Cajun sausage, onions, jalapeño, bell pepper, garlic, basil, parmesan", 2200]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Toast", "", 400],
          ["Two Eggs", "", 600],
          ["Bacon", "", 500],
          ["Cajun Sausage", "", 500],
          ["Chicken Apple Sausage", "", 400],
          ["Sweet Potato Puffs", "", 500],
          ["Rainbow Potato", "", 500],
          ["Fries", "", 500],
          ["Side Salad", "", 600],
          ["Avocado", "", 400],
          ["Mixed Fruit", "", 500],
          ["Croffle", "", 600],
          ["Side Pancake", "", 500],
          ["Side French Toast", "", 700],
          ["Fried Chicken", "", 600],
          ["Rice", "", 400]
        ]
      },
      {
        name: "Coffee & Tea",
        items: [
          ["Espresso", "", 350],
          ["Hot Black Coffee", "", 450],
          ["Americano (Hot or Iced)", "", 700],
          ["Latte (Hot or Iced)", "", 700],
          ["Vanilla Latte (Hot or Iced)", "", 800],
          ["Cappuccino (Hot or Iced)", "", 700],
          ["Mocha (Hot or Iced)", "", 700],
          ["Caramel Macchiato (Hot or Iced)", "", 800],
          ["Ube Latte (Hot or Iced)", "", 700],
          ["Matcha Latte (Hot or Iced)", "", 700],
          ["Hot Chocolate", "", 700],
          ["Hot Tea", "", 600],
          ["Yuzu Honey Lemon Ginger", "", 600],
          ["Iced Coffee", "With refill", 450],
          ["Iced Coffee with Coconut Juice, Lemonade or OJ", "", 700],
          ["Iced Cha-Chak", "", 700],
          ["Iced Coconut Matcha", "", 700],
          ["Iced Strawberry Dream", "", 700],
          ["Iced Strawberry Matcha", "", 750]
        ]
      },
      {
        name: "Cold Drinks",
        items: [
          ["Peach Iced Tea", "", 600],
          ["Arnold Palmer", "", 600],
          ["Unsweetened Black Tea", "", 600],
          ["Strawberry Yuzu", "", 650],
          ["Passion Fruit Soda", "", 650],
          ["Orange Juice", "", 500],
          ["Apple Juice", "", 500],
          ["Lemonade", "", 500],
          ["Coconut Juice", "", 700],
          ["Coke, Coke Zero or Sprite", "", 300],
          ["IBC Root Beer", "", 500],
          ["Sparkling Water", "", 400],
          ["Milk", "", 400]
        ]
      }
    ],
    hours: "Mon–Fri 9am–2:30pm, Sat–Sun 8am–2:30pm",
    orderUrl: "https://toastintown.com/order/toastintown",
    siteNote: "Menu from their own Toast ordering site; hours from their Toast page."
  },
  'tonys-style': {
    sections: [
      {
        name: "Chicken Wings",
        items: [
          ["Tony's Style Wings", "Their original wings, \"the wings that started the party\".", 1395],
          ["Lemon Pepper Wings", "Savory, garlicky twist on the classic, made with real lemons.", 1395],
          ["Spicy Jerk Wings", "Tony's Style spin on jerk flavor.", 1395],
          ["Delenciagas", "Sweet, tangy and spicy wings named for their brother Delency.", 1395]
        ]
      },
      {
        name: "Baguettes",
        items: [
          ["Crab & Shrimp Baguette", "Baguette piled with seasoned crab, shrimp, and garlic cream sauce.", 1795]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Shasta Tiki Punch Soda", "", 200],
          ["Water", "", 200]
        ]
      }
    ],
    hours: "Wed 5–11pm, Thu 6–11pm, Fri–Sat 5–11pm; Closed Sun–Tue",
    orderUrl: "https://www.ubereats.com/store/tonys-style-5333-adeline-st/ct2p56f7U8m3Fq7IONVXcw",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their Uber Eats store (listed at 938 Crawfish, Albany — the same building); hours from MapQuest/Yelp for 938 San Pablo Ave."
  },
  'traballos-backyard-bbq': {
    hours: "Tue–Sat 6am–4pm, Closed Sun–Mon",
    siteNote: "Hours are from their Instagram bio and site, matching Yelp and MapQuest."
  },
  'u-dessert-story': {
    sections: [
      {
        name: "Specials",
        items: [
          ["CROFFLE", "Choose one flavor of Our Croffles. Our Croffle are the most aesthetic desserts you'll have yet.", 1095],
          ["SALTED EGG YOLK TOAST", "Homemade Salted Egg Yolk Custard Sauce with Buttery Toast, Salted Egg Yolk, Vanilla Bean Ice Cream, and…", 2760],
          ["CROFFLE PARTY", "Have a 'Croffle Party' with us at U: Dessert Story! Featuring 3 tasty flavors of our housemade croffles", 3105],
          ["SPICY THAI RAMYEON", "Secret popular street food in Thailand Delicious! Assortment of seafood, Thai herbs, Egg Yolk, Spicy Herbs…", 3910],
          ["MOCHI-GARU BINGSU", "A traditional Korean milk bingsu topped with nutty roasted multi-grain powder (misutgaru), sweet red…", 2530],
          ["MVI SET \"MOST VALUABLE ITEMS\"", "Come with - Mango Sticky Rice Bingsoo - Honey Brick Toast - Thai Tea Crepe Cake, and - 2 Glasses of Mango…", 7475]
        ]
      },
      {
        name: "Snow Ice (Bingsu)",
        items: [
          ["MANGO STICKY RICE BINGSU", "Korean snow ice with Organic Homemade Crumble, Sticky Rice, Mango Puree & Condensed Milk.", 2530],
          ["VOLCANO BINGSU", "Korean snow ice with Brownie, Crispy Chocolate Rice, Banana, Cornflake, Oreo, Almond and Condensed Milk", 2530],
          ["STRAWBERRY CHEESECAKE GREEK YOGURT BINGSU", "Korean Greek Yogurt Snow Ice with Strawberry, Homemade Strawberry Puree, Almond and Cheesecake Bite", 2415],
          ["VEGAN MANGO STICKY RICE BINGSU (V)", "Korean snow ice with Sticky Rice, Mango Puree", 2645],
          ["BOBA THAI TEA BINGSU", "Korean snow ice with Grass Jelly, Boba, Condense Milk, Crispy Toast and almond", 2415],
          ["VEGAN STRAWBERRY BINGSU (V)", "Korean snow ice with Strawberry Puree, Almond and Fresh Strawberry", 2530],
          ["SPICY OUT SUMMER BINGSU", "Refreshing light yogurt snow ice, fresh lychee, spicy honey, crispy strawberry, lychee puree, spicy umami.", 2415],
          ["UBE BISCOFF BINGSU", "Finely Ube Snow Ice, with Spiced Biscoff Cookies, on the side with Condensed Milk and Boba. This frozen…", 2530]
        ]
      },
      {
        name: "Sweet Bliss",
        items: [
          ["SO MATCHA PARFAIT", "Matcha Ice-cream, oreo crumbs, cornflake, homemade cheese foam, almond, serves with a shot of matcha", 1610]
        ]
      },
      {
        name: "Toast",
        items: [
          ["SOFT BREAD WITH PANDAN FONDUE", "Soft bread dipped in a creamy pandan fondue, offering a subtle, aromatic flavor.", 2530],
          ["HONEY BRICK TOAST", "Vanilla Bean Ice Cream, Almond, Mixed Berries & Banana.", 2300],
          ["THAI TEA LAVA TOAST", "Thai Tea Sauce, Thai Tea Ice cream, Almond, Mixed Berries & Banana.", 2530]
        ]
      },
      {
        name: "By the Slice",
        items: [
          ["ORIGINAL BASQUE BURNT CHEESECAKE", "The intentional caramelized burnt exterior of cheesecake with creamy and gooey center. The aroma of…", 1669],
          ["U'S CHEESECAKE SAMPLER", "3 Flavor of our signature Cheesecake: Basque Burnt, Double Fromage Lychee and Double Fromage Honey Yuzu…", 4600],
          ["THAI TEA CREPE CAKE (Slice)", "18 Layers of Thai Tea Flavor Crepe Cake serves with Homemade Thai Tea Sauce.", 1785],
          ["YOUNG COCONUT PANDAN CREPE CAKE (Slice)", "18 Layers of Organic Coconut Pandan Crepe Cake serves with Homemade Young Coconut Sauce.", 1785],
          ["DOUBLE FROMAGE LYCHEE CHEESECAKE (Slice)", "Japanese Cheesecake serves with Lychee Ice Cream, Homemade Foam Cheese, Fresh Lychee, and Crispy Strawberry.", 1669],
          ["CHOCOLATE TRUFFLE CAKE", "Belgium Chocolate Chiffon Cake, Mascarpone Chocolate Cream, Rich Chocolate Custard filling, in Crunchy…", 1785],
          ["DOUBLE FROMAGE HONEY YUZU CHEESECAKE (Slice)", "Japanese Cheesecake serves with Homemade Yuzu Sauce, Homemade Foam Cheese, Matcha Ice Cream, biscoff…", 1669],
          ["CHOCOLATE ORGANIC MATCHA LAVA CAKE", "Homemade Warm Chocolate Molten Cake with Organic Matcha Lava serves with Matcha Ice Cream and Chocolate…", 1840],
          ["CHOCOLATE THAI TEA LAVA CAKE", "Homemade Warm Chocolate Molten Cake with Thai Tea Lava serves with Thai Tea Ice Cream and Chocolate…", 1840]
        ]
      },
      {
        name: "Whole Cakes",
        items: [
          ["WHOLE LYCHEE CHEESECAKE", "!!Kindly give us a call and enquire about the availability of same-day pick-up!! This Lychee Cheesecake (6…", 8625],
          ["WHOLE CHOCOLATE TRUFFLE CAKE", "!!Kindly give us a call and enquire about the availability of same-day pick-up!! Belgium Chocolate Chiffon…", 13800],
          ["WHOLE HONEY YUZU CHEESECAKE", "!!Kindly give us a call and enquire about the availability of same-day pick-up!!This Honey Yuzu Cheesecake…", 8625],
          ["WHOLE PIE - HOJICHA BANOFFEE", "!!Kindly give us a call and enquire about the availability of same-day pick-up!! Hojicha Cream Pie…", 10350],
          ["WHOLE CREPE CAKE - THAI TEA", "18 Crepe layers (9 inches) of Organic Thai Tea Crepe which comes with Homemade Thai Tea Sauce (Signature)", 14375],
          ["WHOLE CREPE CAKE - YOUNG COCONUT PANDAN", "18 Crepe layers (9 inches) of Young Coconut Cream between Pandan Crepe with Homemade Organic Young Coconut…", 14375]
        ]
      },
      {
        name: "Savory and Snacks",
        items: [
          ["APPETIZER PLATTER", "Great Value assortment appetizers set (Crispy French Fries , Shrimp Tempura, Crispy Calamari, and Spicy…", 4485],
          ["Crispy French Fries", "Crispy Shoestring Fries served with Homemade Cilantro Aioli", 1380],
          ["TEMPURA SHRIMP", "Crispy tempura shrimp, golden-brown and light, are drizzled with a homemade spicy sweet glaze. This…", 1495],
          ["FRIED CALAMARI", "Lightly battered calamari, fried to golden crisp perfection. Tender on the inside, crispy on the outside…", 1610],
          ["VEGGIE SPRING ROLL", "Cabbage, Celery, Carrot, Onion, Long Grain Rice, Shitake Mushroom, Garlic, come with Homemade Sweet Glaze…", 1380],
          ["TAKOYAKI", "Octopus-filled balls. Choice of 8, 10, or 12 pieces.", 1380]
        ]
      },
      {
        name: "Specialty Drinks",
        items: [
          ["BLUE LYCHEE", "Lychee juice with a splash of blue; available in regular or large sizes.", 979],
          ["MANGO TANGO SPRITZER", "Refreshing mango spritzer, available in regular or large size.", 920],
          ["OOLONG LYCHEE FLOAT", "Oolong tea with lychee flavor, topped with a creamy float. Available in regular or large size.", 979],
          ["Tiramisu Latte", "Coffee latte infused with tiramisu flavors. Choose hot, iced, or with lite ice.", 920],
          ["UBE BLACK SESAME EINSPANNER (TRENDY! MUST TRY)", "Ube black sesame einspanner. Creamy blend featuring ube and black sesame. Available in regular or large…", 1150],
          ["UBE MATCHA LATTE", "Organic Matcha from Uji farm, Japan", 1095],
          ["MATCHA BLACK SESAME EINSPANNER (TRENDY! MUST TRY)", "Matcha and black sesame drink topped with cream. Choose from regular or large size.", 1265],
          ["DOUBLE MATCHA EINSPANNER (TRENDY! MUST TRY)", "Matcha-infused cream-topped drink. Available in regular or large size.", 1265]
        ]
      },
      {
        name: "Smoothies",
        items: [
          ["CHOCO STRAWBERRY SMOOTHIE", "Korean Smoothie, Cacao, homemade Strawberry puree, Dark Choco Ice-cream, oatmilk, foam cheese, almond", 1150],
          ["CHERRY BLOSSOM SMOOTHIE", "Korean Smoothie, Homemade Strawberry puree, lychee ice cream, fresh lychee, rose, foam cheese", 1150]
        ]
      },
      {
        name: "Einspanner",
        items: [
          ["EARL GRAY CRUMBLE CHEESE EINSPANNER", "Earl Gray flavor with a cheese twist. Crumble topping for added texture. Choose regular or large size.", 805],
          ["OLD SCHOOL MILO CHEESE EINSPANNER (HIGHLY RECOMMENDED)", "* Highly recommended. An old school milo drink with condensed milk topped with milo powder and oreo crumbs…", 979],
          ["OAT MATCHA LATTE CHEESE EINSPANNER", "Creamy oat milk infused with matcha, topped with a cheese foam layer. Available in regular or large size.", 1095]
        ]
      },
      {
        name: "Organic Uji Matcha",
        items: [
          ["OAT MATCHA LAVENDER", "Organic Matcha from Uji farm, Japan with a hint of lavender", 1065],
          ["STRAWBERRY OAT MATCHA FRESCA", "Strawberry oat matcha fresca available in regular or large size. Refreshing blend of organic Uji matcha…", 1095],
          ["LYCHEE MATCHA FAUXITO", "Refreshing matcha drink with lychee flavor with fresh lychee and lychee juice. (Non-diary)", 1095],
          ["OREO MATCHA", "Rich matcha blended with crushed Oreo cookies, creating a layered treat combining earthy and sweet flavors.", 1150],
          ["MANGO OAT MATCHA FRESCA", "Mango and oat blend with organic Uji matcha. Available in regular or large size.", 1095],
          ["MANGO MATCHA FIZZ", "Organic Matcha from Uji farm, Japan with homemade mango puree and fresh mangoe", 979],
          ["STRAWBERRY MATCHA FIZZ", "Organic Matcha from Uji farm, Japan with homemade strawberry puree and fresh strawberries", 979],
          ["UNSWEETEN ICE MATCHA", "Ice organic matcha (Non-diary)", 805],
          ["STRAWBERRY DREAM MATCHA", "Layers of organic Uji matcha and pink strawberry blend, topped with crushed strawberries.", 1150],
          ["OAT MATCHA LATTE", "Organic Matcha from Uji farm, Japan", 1035],
          ["OAT MATCHA FLOAT", "Organic Matcha Latte with Matcha Ice Cream", 1209]
        ]
      },
      {
        name: "Milk Tea",
        items: [
          ["FIRED BOBA BROWN SUGAR", "Brown Sugar, milk, Boba on top with homemade cheese foam", 979],
          ["CLASSIC MILK TEA", "*Highly Recommend*", 1035],
          ["THAI TEA FLOAT", "Creamy Thai tea with a refreshing twist. Available in regular or large sizes, served iced, hot, or with…", 920],
          ["TIGER EARLGRAY MILK TEA", "Creamy blend of Earl Gray tea with milk. Choose drink size and temperature: regular, large, iced, hot, or…", 805],
          ["EARL GREY MANGO MILK TEA", "Earl Grey-infused milk tea with mango flavor. Available in regular or large size.", 865],
          ["Signature Thai Iced Tea", "Thai iced tea with options for ice level and drink size.", 690],
          ["UBE MILK TEA", "*Recommend ; Purple Yam mix with milk **The daily amount remained after substituting the milk.**", 920],
          ["MANGO MILK TEA", "Mango-infused milk tea. Choose between regular or large size.", 865],
          ["STRAWBERRY MILK TEA", "Strawberry milk tea with choice of regular or large size.", 865]
        ]
      },
      {
        name: "Equator Coffee",
        items: [
          ["CORTADO", "Espresso and steamed milk blend in equal measure for a smooth finish.", 519],
          ["LATTE", "Rich espresso with steamed milk, available in regular or large sizes. Choose hot, iced, or lite ice.", 635],
          ["CAPUCCINO", "Rich espresso blended with steamed milk, topped with a delicate layer of foam.", 635],
          ["MOCHA", "Rich blend of coffee with chocolate. Choose size and temperature preference: regular or large, and hot…", 805],
          ["AFFOGATO", "Decadent espresso shot poured over creamy, velvety ice cream. The perfect blend of bitter and sweet.", 865],
          ["ESPRESSO", "Rich, flavorful cup of espresso brewed to perfection.", 405],
          ["AMERICANO", "Choice of regular or large Americano. Hot, iced, or lite ice options available.", 575]
        ]
      },
      {
        name: "Organic Loose Leaf Tea",
        items: [
          ["GENMAICHA", "Japanese green tea with roasted brown rice. Choose hot or with ice.", 920],
          ["PEACH APRICOT", "Peach and apricot infused organic loose leaf tea. Available hot, iced, or lightly iced.", 920],
          ["CHAI", "Organic loose leaf tea. Available hot, iced, or with light ice.", 920],
          ["EARL GREY", "Classic blend of black tea with bergamot. Choice of hot, ice, or lite ice.", 920],
          ["GOLDEN OOLONG", "Choice of organic oolong tea, served hot or cold. Optional ice levels available.", 920]
        ]
      },
      {
        name: "Caffeine-Free Loose Leaf Tea",
        items: [
          ["GINGER LEMON FUSION TEA", "Ginger lemon blend. Served hot or chilled; choose from ice, hot, or lite ice options.", 920],
          ["CHOCOLATE INDULGENCE", "A rich blend of organic, caffeine-free chocolate tea. Available hot or cold with options of ice, hot, or…", 920],
          ["CHAMOMILE HIBISCUS", "Chamomile herbal infusion; choose from ice, hot, or lite ice.", 920],
          ["TURMERIC SPICE", "Turmeric spice tea, available hot, iced, or with light ice.", 920]
        ]
      }
    ],
    orderUrl: "https://www.doordash.com/store/u-dessert-story-san-francisco-416800",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their DoorDash store for 3489 16th St."
  },
  'underdogs-cantina': {
    hours: "Mon 11am–9pm, Tue–Sat 11am–10pm, Sun 9:30am–9pm",
    siteNote: "Hours are from underdogscantina.com; opens 9am for select games and events."
  },
  'vostok-shawarma': {
    sections: [
      {
        name: "Shawarma & Pita",
        items: [
          ["Shawarma with Chicken", "Chicken, tomato, cucumber, cabbage, french fries, house sauce", 1802],
          ["Shawarma with Beef and Lamb", "Beef and lamb, tomato, cucumber, cabbage, french fries, house sauce", 1915],
          ["King Shawarma with Chicken", "Chicken, tomato, cucumber, cabbage, house sauce, fries, cheese", 2486],
          ["King Shawarma with Beef and Lamb", "Beef and lamb, tomato, cucumber, cabbage, french fries, house sauce, cheese", 2486],
          ["Chicken Pita", "Pita bread, chicken, tomato, cucumber, cabbage, fries, house sauce", 1694],
          ["Beef and Lamb Pita", "Pita bread, beef and lamb, tomato, cucumber, cabbage, fries, house sauce", 1807]
        ]
      },
      {
        name: "Central Asian Plates",
        items: [
          ["Lagman", "Noodles with beef, bell peppers, onions, cabbage, wood ear mushrooms, spices", 1915],
          ["Wok Lagman", "Hand-pulled fried noodles with beef, bell peppers, onions and spices", 1915],
          ["Plov", "Traditional rice with beef, carrots, onions and spices", 1802],
          ["Manty", "Central Asian style dumplings filled with beef and onions", 2252],
          ["Fried Dumplings with Beef", "Dumplings filled with seasoned meat, served with sour cream", 1768],
          ["Cheburek", "Crispy fried pastry stuffed with seasoned beef and onions. 1 piece", 672]
        ]
      },
      {
        name: "Sides",
        items: [
          ["French Fries", "", 549],
          ["Extra Sauce", "", 80],
          ["Extra Cheese", "", 140]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Lemonade", "Passion fruit, lemon, mint, soda", 864],
          ["Chalap / Yogurt Drink", "Tangy yogurt drink with a hint of salt", 328],
          ["Coke", "", 328],
          ["Diet Coke", "", 328],
          ["Sprite", "", 328]
        ]
      }
    ],
    hours: "Daily 12–11pm",
    address: "36 Washington St, Santa Clara, CA 95050",
    pricesEstimated: "Prices are from their DoorDash store; delivery apps often charge more than the counter.",
    siteNote: "Menu from their DoorDash store; hours and address from Google and Yelp (truck parked at a gas station on Washington St)."
  },
  'wadaya-fremont': {
    hours: "Mon–Fri 11:30am–2pm, 5–9pm; Sat 11am–9:30pm; Sun 11am–9pm",
    siteNote: "Hours from their own website's Locations page (Fremont)."
  },
  'wasabi-udon-and-katsu-bar': {
    hours: "Mon–Fri 11am–2:30pm, 4:30–10pm; Sat 11am–10pm; Sun 11am–9pm",
    siteNote: "Hours come from Wasabi's own website footer."
  },
  'whack-donuts': {
    hours: "Tue–Fri 9am–2pm, Sat 7:30am–12:30pm; Closed Sun–Mon",
    siteNote: "Hours are from whackdonuts.net for the 4 Embarcadero Center shop; no priced menu is published."
  },
  'wow-mia-pizza': {
    hours: "Tue–Thu & Sun 11am–9pm, Fri–Sat 11am–10pm; Closed Mon",
    siteNote: "Hours are from the Working Hours block on wowmiapizza.com's Contact page."
  },
  'wtf-antioch': {
    sections: [
      {
        name: "Starters",
        items: [
          ["Cheese quesadilla", "", 1137],
          ["Cheesy Garlic Bread", "From", 800],
          ["Chicken Quesadilla", "", 1480],
          ["Chicken Tenders Appetizers (3 pieces)", "3pcs of chicken tenders, choice of dip", 1142],
          ["Chicken Wings (Serve with 3-4 celery sticks)", "From Tossed with your choice of sauce or dry rub", 1828],
          ["Chili Cheese Fries", "French fries topped with chili and cheese", 1828],
          ["Chips and salsa", "", 571],
          ["Fried Brussels Sprouts", "Crisp brussels sprouts topped with balsamic glaze", 1600],
          ["Garlic Fries", "French fries tossed with garlic and Parmesan cheese", 1371],
          ["Jumbo Prawns Cocktail (6 pieces)", "", 1600],
          ["Lobster Quesadilla", "", 3080],
          ["Lumpia", "8 pcs deep fried egg roll stuffed with ground pork and vegetables with sweet chili sauce", 1371],
          ["Mozzarella Sticks", "6pcs mozzarella sticks, served with marinara sauce", 908],
          ["Navigator Potato Skins", "Potato skins stuffed with Pepper Jack cheese and bacon", 1600],
          ["Onion Rings", "", 1600],
          ["Pepper Poppers (8 pieces)", "", 1571],
          ["Platoon", "Appetizer with 3 pcs mozzarella sticks, 3 pcs pepper poppers, 3pcsw navigator potato skins", 1714],
          ["Regular Fries", "", 1028],
          ["Ricotta Meatball", "House-made meatball with ricotta cheese, baked in marinara sauce and served with crostini", 1714],
          ["Sweet Potato Fries", "", 1028],
          ["Taquitos 6 pieces", "", 1142],
          ["WTF Combo Platter", "3 pcs wings, 3pcs taquitos, small order fries", 1828],
          ["Prawns Bruschetta", "4 Jumbo prawns in Siciliana creamy sauce with a hint of mild chili pepper", 1708],
          ["Calamari", "Seasoned and breaded calamari, fried to perfection", 1771],
          ["Grenade (bacon-wrapped stuffed jalapenos)", "Fresh jalapenos stuffed with cream cheese and chopped bacon", 1600],
          ["Nachos", "", 1022]
        ]
      },
      {
        name: "Soup and Salad",
        items: [
          ["Caesar Salad", "", 1371],
          ["Chicken Caesar Salad", "Romaine hearts, Parmesan cheese, croutons, grilled chicken, with Caesar dressing", 1828],
          ["Chili Soup", "From", 685],
          ["Clam Chowder Soup", "From", 685],
          ["House Salad", "Mixed greens, shredded carrots, tomatoes, croutons, with a choice of dressing (ranch", 1142],
          ["Prawns Louie Salad", "", 2400],
          ["Side Salad", "Side salad with choice of dressing", 914],
          ["TO GO Clam Chowder 16 oz", "", 1142],
          ["TO go Clam Chowder 32 oz", "", 2285],
          ["Wedge Salad", "Iceberg lettuce topped with bacon, blue cheese crumbles", 1828],
          ["Chicken Cobb Salad", "Romaine topped with grilled chicken, bleu cheese, avocado, boiled egg, bacon bits, tomato", 2171],
          ["Crispy Chicken Salad", "Mixed lettuce, cherry tomatoes, cheddar cheese, boiled egg, bacon, tortilla strips", 2051],
          ["Soup of the Day", "From", 685],
          ["SOURDOUGH BREAD BOWL", "", 457],
          ["Buffalo chicken salad", "Boneless buffalo pieces served over a bed of romaine lettuce, celery, cucumber, red onion", 2051]
        ]
      },
      {
        name: "Burgers",
        items: [
          ["Barracks Burger", "1/2 lb beef patty, choice of cheese.", 1971],
          ["Bomber Burger", "1/2 lb beef patty, bacon, jalapeños, Pepper Jack cheese, garlic aioli.", 2142],
          ["Bunker Burger", "1/2 lb beef patty, bacon, pulled pork with BBQ sauce, choice of cheese, fixings", 2142],
          ["Code Blue Burger", "1/2 lb beef patty, bacon, crumbled bleu cheese, grilled onions, choice of cheese slice", 2142],
          ["Double WTF Burger", "Two half pound patties, bacon, onion ring, cheddar cheese, BBQ sauce", 2857],
          ["Green Beret Teriyaki Burger", "", 2142],
          ["Hangover Burger", "1/2 lb beef patty, one egg (cooked any style), bacon, choice of cheese", 2142],
          ["Mushroom Swiss Burger", "1/2 lb beef patty, Swiss cheese, grilled mushrooms", 2142],
          ["PBJ Ration Burger", "1/2 lb beef patty, bacon, peanut butter, habanero bacon jelly, served on brioche bun with all the fixings.", 2142],
          ["Veggie Burger", "Vegetarian patty, Swiss cheese, with all the fixings.", 1885],
          ["WTF Burger", "1/2 lb beef patty, bacon, onion ring, Cheddar cheese, BBQ sauce.", 2142],
          ["Hamburger Patty", "", 857],
          ["Patty Melt", "1/2 lb beef patty, caramelized onions, choice of cheese on sourdough bread", 1971],
          ["MASH Burger", "Two 1/4 pound patties, with grilled onions, choice of cheese", 1971]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["1/2 Sandwich/ 1/2 Soup", "From", 1257],
          ["5150 BLT Sandwich", "Bacon, lettuce, tomatoes on sourdough or white sliced bread. Add avocado for an additional charge.", 1885],
          ["Admiral's Steak Sandwich", "Grilled 8 oz NY steak, mild creamy horseradish mayo, grilled onions on a French roll.", 2628],
          ["Angus French Dip Sandwich", "", 2165],
          ["Chicken Caesar wrap", "", 1942],
          ["Code 3 Sandwich", "Linguica served on French roll, mayonnaise, mustard, onions, lettuce, tomatoes", 1885],
          ["COLD Tuna Salad Sandwich", "", 1771],
          ["Commander's MEATLOAF Sandwich", "", 1708],
          ["Deckhand Club Sandwich", "Triple-layer sourdough bread, with turkey, bacon, lettuce, tomato, mayo.", 2285],
          ["Firehouse Spicy Fried Chicken Sandwich", "", 2000],
          ["Grilled Cheese Sandwich", "Served with french fries", 1142],
          ["Grunt Pulled Pork Sandwich", "Pulled pork with BBQ sauce, red onions, pickle on a brioche bun. Choice of side", 1942],
          ["Lobster Melt", "", 3080],
          ["Lobster Roll", "", 3080],
          ["Meatball Sandwich", "", 2285],
          ["Philly Cheesesteak Sandwich", "Cheesesteak, provolone cheese, served on French roll topped with choice of sautéed onions", 2114],
          ["Sergeant's Turkey Bacon Melt Sandwich", "Turkey, bacon, and cheddar cheese on grilled sourdough bread", 2171],
          ["Sky Cops Turkey Sandwich", "Smoked turkey slices, avocado, lettuce, tomatoes, red onions, mayonnaise.", 1828],
          ["Torpedo Dog", "Hot dog in a bun, mayonnaise, mustard, relish, onions.", 1200],
          ["Tuna Melt Sandwich", "Tuna salad, Cheddar cheese", 1828],
          ["WTF Chicken Sandwich", "Grilled breast of chicken, bacon, onion ring, cheddar cheese, BBQ sauce, lettuce, onions, tomatoes", 2114],
          ["Torpedo Dog without sides", "", 971],
          ["Grilled ham and cheese", "", 2051],
          ["Reuben Sub", "", 2051],
          ["Bazooka", "Jumbo 1/4 lb beef hotdog, chopped onions, tomato, pickle relish, mustard, jalapeno", 1257]
        ]
      },
      {
        name: "Entrees",
        items: [
          ["Baked Penne Pasta and Meatballs", "House-made ricotta meatballs with marinara sauce over baked penne pasta served with two slices of", 2285],
          ["Captain's Platter", "Beer battered cod and prawns, served with tartar sauce, side of fries", 2514],
          ["Chicken Breast", "", 800],
          ["Chicken Marsala", "Fileted chicken breast smothered with mushrooms sauteed in marsala sauce", 2400],
          ["First Mates Fish and Chips", "Beer battered cod served with tartar sauce, a side of fries", 2285],
          ["First Responder NY Steak", "Grilled 14 oz NY steak with mushroom demi-glace, Parmesan mashed potatoes", 4114],
          ["Four Cheese Ravioli", "Topped with marinara sauce, Parmesan cheese, served with crostini", 1828],
          ["Recruit's NY Steak 10 oz", "10 oz NY Steak, mushroom demi glace, mashed potatoes, mixed vegetables", 3085],
          ["Chicken Parmesan", "Breaded chicken topped with provolone or mozzarella cheese and marinara sauce", 2600],
          ["Meatloaf Dinner Plate", "8 oz slice of meatloaf drizzled with gravy", 2165],
          ["Salmon Teriyaki", "", 3200],
          ["Surf & Turf", "", 3428],
          ["Chief's Ribeye Steak", "Grilled 14 oz rib-eye steak, garlic mashed potatoes, roasted vegetables", 4571],
          ["Chicken Gorgonzola Pasta", "Penne pasta smothered in creamy gorgonzola sauce, with sliced chicken", 2742],
          ["Chicken Parmageddon", "Breaded filet of chicken breast smothered in our house-made Oaxacan marinara, served with spaghetti.", 2742],
          ["Chicken Siciliana", "Chicken breast filet smothered in Siciliana creamy sauce with a hint of mild chili pepper", 2600],
          ["Salmon Siciliana", "Salmon smothered in Siciliana creamy sauce with a hint of mild chili pepper", 3628],
          ["Prawns Alfredo Fettuccine", "Prawns with cream sauce served over fettuccine and a side of cheesy garlic bread", 2742],
          ["Spaghetti with meatballs", "", 2285],
          ["Country Fried Steak Dinner/Lunch Entree", "Breaded steak smothered in sausage country gravy", 2394]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Cheesecake", "", 914],
          ["Chocolate Chip Cake with Milk Mousse", "", 1137],
          ["Chocolate Peanut Butter Cake", "", 1137],
          ["Jumbo Chocolate Chip Cookie", "", 400],
          ["Loaded Chocolate Chip Cookie Ice Cream Sandwich", "Shareable 2 jumbo cookies stuffed with a scoop of vanilla ice cream", 1371],
          ["Scoop of Ice Cream", "", 371],
          ["Tuxedo Cake", "", 1251],
          ["WTF What the Fookie", "One warm jumbo chocolate chip cookie topped with a scoop of ice cream", 794],
          ["Cup of Seasonal Fruit", "", 340],
          ["Pumpkin Cheesecake", "", 1057]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Arnold Palmer", "", 428],
          ["Coffee", "", 342],
          ["Fountain Soda", "Pepsi, Starry, Diet Pepsi, Crush, Rootbeer, Dr Pepper, Ginger Ale", 451],
          ["Hot chocolate", "", 428],
          ["Hot Tea", "", 257],
          ["Iced Tea", "", 371],
          ["Juice 8oz", "", 428],
          ["Milk 8 oz", "", 428],
          ["Red Bull", "", 571],
          ["SF Red Bull", "", 571],
          ["Soda Float", "Choice of soda, with a scoop of vanilla ice cream", 600],
          ["Virgin Bloody Mary", "", 685]
        ]
      },
      {
        name: "Cadet's Meal",
        items: [
          ["Chicken Tenders", "3 pieces chicken tenders, served with french fries", 1371],
          ["Kids' Cheeseburger", "5 oz beef patty, Cheddar cheese, brioche bun, served with french fries", 1257],
          ["Kids' Drink", "", 285]
        ]
      },
      {
        name: "South of the Border",
        items: [
          ["Burrito Bowl", "Your choice of seasoned protein served with cilantro rice, black beans, crisp green lettuce", 1594],
          ["Super Wet Burrito", "A giant, fully-loaded burrito stuffed with your choice of protein (grilled chicken, steak", 1708],
          ["Tacos Dinner Plate", "Two soft shell tacos with your choice of meat (steak, grilled chicken, shredded chicken)", 1822],
          ["Tacos ala carte", "Choice of meat (steak, grilled chicken", 451],
          ["Chicken Enchiladas", "Two enchiladas, served with Spanish rice, black beans. Choice of red or green sauce", 1822]
        ]
      }
    ],
    orderUrl: "https://order.online/business/13030306/store/antioch-whiskey-tango-foxtrot-restaurant-bar-grill-antioch-33928521?pickup=true",
    pricesEstimated: "Prices are from their order.online ordering page (run by DoorDash); they may be higher than in the restaurant.",
    siteNote: "Menu from the Antioch store on their order.online page, linked from wtfrestaurantbargrill.com."
  },
  'wtf-oakley': {
    sections: [
      {
        name: "Starters",
        items: [
          ["Cheese quesadilla", "", 1194],
          ["Cheesy Garlic Bread", "From", 840],
          ["Chicken Quesadilla", "", 1554],
          ["Chicken Tenders Appetizers (3 pieces)", "3pcs of chicken tenders, choice of dip", 1200],
          ["Chicken Wings (Serve with 3-4 celery sticks)", "From Tossed with your choice of sauce or dry rub", 1920],
          ["Chili Cheese Fries", "French fries topped with chili and cheese", 1920],
          ["Chips and salsa", "", 600],
          ["Fried Brussels Sprouts", "Crisp brussels sprouts topped with balsamic glaze", 1680],
          ["Garlic Fries", "French fries tossed with garlic and Parmesan cheese", 1440],
          ["Jumbo Prawns Cocktail (6 pieces)", "", 1680],
          ["Lobster Quesadilla", "", 3234],
          ["Lumpia", "8 pcs deep fried egg roll stuffed with ground pork and vegetables with sweet chili sauce", 1440],
          ["Mozzarella Sticks", "6pcs mozzarella sticks, served with marinara sauce", 954],
          ["Navigator Potato Skins", "Potato skins stuffed with Pepper Jack cheese and bacon", 1680],
          ["Onion Rings", "", 1680],
          ["Pepper Poppers (8 pieces)", "", 1650],
          ["Platoon", "Appetizer with 3 pcs mozzarella sticks, 3 pcs pepper poppers, 3pcsw navigator potato skins", 1800],
          ["Regular Fries", "", 1080],
          ["Ricotta Meatball", "House-made meatball with ricotta cheese, baked in marinara sauce and served with crostini", 1800],
          ["Sweet Potato Fries", "", 1080],
          ["Taquitos 6 pieces", "", 1200],
          ["WTF Combo Platter", "3 pcs wings, 3pcs taquitos, small order fries", 1920],
          ["Prawns Bruschetta", "4 Jumbo prawns in Siciliana creamy sauce with a hint of mild chili pepper", 1794],
          ["Calamari", "Seasoned and breaded calamari, fried to perfection", 1860],
          ["Grenade (bacon-wrapped stuffed jalapenos)", "Fresh jalapenos stuffed with cream cheese and chopped bacon", 1680]
        ]
      },
      {
        name: "Soup and Salad",
        items: [
          ["Caesar Salad", "", 1440],
          ["Chicken Caesar Salad", "Romaine hearts, Parmesan cheese, croutons, grilled chicken, with Caesar dressing", 1920],
          ["Chili Soup", "From", 720],
          ["Clam Chowder Soup", "From", 720],
          ["House Salad", "Mixed greens, shredded carrots, tomatoes, croutons, with a choice of dressing (ranch", 1200],
          ["Prawns Louie Salad", "", 2520],
          ["Side Salad", "Side salad with choice of dressing", 960],
          ["TO GO Clam Chowder 16 oz", "", 1200],
          ["TO go Clam Chowder 32 oz", "", 2400],
          ["Wedge Salad", "Iceberg lettuce topped with bacon, blue cheese crumbles", 1920],
          ["Chicken Cobb Salad", "Romaine topped with grilled chicken, bleu cheese, avocado, boiled egg, bacon bits, tomato", 2280],
          ["Crispy Chicken Salad", "Mixed lettuce, cherry tomatoes, cheddar cheese, boiled egg, bacon, tortilla strips", 2154],
          ["Soup of the Day", "From", 720],
          ["SOURDOUGH BREAD BOWL", "", 480],
          ["Buffalo chicken salad", "Boneless buffalo pieces served over a bed of romaine lettuce, celery, cucumber, red onion", 2154]
        ]
      },
      {
        name: "Burgers",
        items: [
          ["Barracks Burger", "1/2 lb beef patty, choice of cheese.", 2070],
          ["Bomber Burger", "1/2 lb beef patty, bacon, jalapeños, Pepper Jack cheese, garlic aioli.", 2250],
          ["Bunker Burger", "1/2 lb beef patty, bacon, pulled pork with BBQ sauce, choice of cheese, fixings", 2250],
          ["Code Blue Burger", "1/2 lb beef patty, bacon, crumbled bleu cheese, grilled onions, choice of cheese slice", 2250],
          ["Double WTF Burger", "Two half pound patties, bacon, onion ring, cheddar cheese, BBQ sauce", 3000],
          ["Green Beret Teriyaki Burger", "", 2250],
          ["Hangover Burger", "1/2 lb beef patty, one egg (cooked any style), bacon, choice of cheese", 2250],
          ["Mushroom Swiss Burger", "1/2 lb beef patty, Swiss cheese, grilled mushrooms", 2250],
          ["PBJ Ration Burger", "1/2 lb beef patty, bacon, peanut butter, habanero bacon jelly, served on brioche bun with all the fixings.", 2250],
          ["Veggie Burger", "Vegetarian patty, Swiss cheese, with all the fixings.", 1980],
          ["WTF Burger", "1/2 lb beef patty, bacon, onion ring, Cheddar cheese, BBQ sauce.", 2250],
          ["Hamburger Patty", "", 900],
          ["Patty Melt", "1/2 lb beef patty, caramelized onions, choice of cheese on sourdough bread", 2070],
          ["MASH Burger", "Two 1/4 pound patties, with grilled onions, choice of cheese", 2070]
        ]
      },
      {
        name: "Sandwiches",
        items: [
          ["1/2 Sandwich/ 1/2 Soup", "From", 1320],
          ["5150 BLT Sandwich", "Bacon, lettuce, tomatoes on sourdough or white sliced bread. Add avocado for an additional charge.", 1980],
          ["Admiral's Steak Sandwich", "Grilled 8 oz NY steak, mild creamy horseradish mayo, grilled onions on a French roll.", 2760],
          ["Angus French Dip Sandwich", "", 2274],
          ["Chicken Caesar wrap", "", 2040],
          ["Code 3 Sandwich", "Linguica served on French roll, mayonnaise, mustard, onions, lettuce, tomatoes", 1980],
          ["COLD Tuna Salad Sandwich", "", 1860],
          ["Commander's MEATLOAF Sandwich", "", 1794],
          ["Deckhand Club Sandwich", "Triple-layer sourdough bread, with turkey, bacon, lettuce, tomato, mayo.", 2400],
          ["Firehouse Spicy Fried Chicken Sandwich", "", 2100],
          ["Grilled Cheese Sandwich", "Served with french fries", 1200],
          ["Grunt Pulled Pork Sandwich", "Pulled pork with BBQ sauce, red onions, pickle on a brioche bun. Choice of side", 2040],
          ["Lobster Melt", "", 3234],
          ["Lobster Roll", "", 3234],
          ["Meatball Sandwich", "", 2400],
          ["Philly Cheesesteak Sandwich", "Cheesesteak, provolone cheese, served on French roll topped with choice of sautéed onions", 2220],
          ["Sergeant's Turkey Bacon Melt Sandwich", "Turkey, bacon, and cheddar cheese on grilled sourdough bread", 2280],
          ["Sky Cops Turkey Sandwich", "Smoked turkey slices, avocado, lettuce, tomatoes, red onions, mayonnaise.", 1920],
          ["Torpedo Dog", "Hot dog in a bun, mayonnaise, mustard, relish, onions.", 1260],
          ["Tuna Melt Sandwich", "Tuna salad, Cheddar cheese", 1920],
          ["WTF Chicken Sandwich", "Grilled breast of chicken, bacon, onion ring, cheddar cheese, BBQ sauce, lettuce, onions, tomatoes", 2220],
          ["Torpedo Dog without sides", "", 1020],
          ["Grilled ham and cheese", "", 2154],
          ["Reuben Sub", "", 2154],
          ["Bazooka", "Jumbo 1/4 lb beef hotdog, chopped onions, tomato, pickle relish, mustard, jalapeno", 1320]
        ]
      },
      {
        name: "Entrees",
        items: [
          ["Baked Penne Pasta and Meatballs", "House-made ricotta meatballs with marinara sauce over baked penne pasta served with two slices of", 2400],
          ["Captain's Platter", "Beer battered cod and prawns, served with tartar sauce, side of fries", 2640],
          ["Chicken Breast", "", 840],
          ["Chicken Marsala", "Fileted chicken breast smothered with mushrooms sauteed in marsala sauce", 2520],
          ["First Mates Fish and Chips", "Beer battered cod served with tartar sauce, a side of fries", 2400],
          ["First Responder NY Steak", "Grilled 14 oz NY steak with mushroom demi-glace, Parmesan mashed potatoes", 4320],
          ["Four Cheese Ravioli", "Topped with marinara sauce, Parmesan cheese, served with crostini", 1920],
          ["Recruit's NY Steak 10 oz", "10 oz NY Steak, mushroom demi glace, mashed potatoes, mixed vegetables", 3240],
          ["Chicken Parmesan", "Breaded chicken topped with provolone or mozzarella cheese and marinara sauce", 2730],
          ["Meatloaf Dinner Plate", "8 oz slice of meatloaf drizzled with gravy", 2274],
          ["Salmon Teriyaki", "", 3360],
          ["Surf & Turf", "", 3600],
          ["Chief's Ribeye Steak", "Grilled 14 oz rib-eye steak, garlic mashed potatoes, roasted vegetables", 4800],
          ["Chicken Parmageddon", "Breaded filet of chicken breast smothered in our house-made Oaxacan marinara, served with spaghetti.", 2880],
          ["Chicken Siciliana", "Chicken breast filet smothered in Siciliana creamy sauce with a hint of mild chili pepper", 2730],
          ["Salmon Siciliana", "Salmon smothered in Siciliana creamy sauce with a hint of mild chili pepper", 3810],
          ["Prawns Alfredo Fettuccine", "Prawns with cream sauce served over fettuccine and a side of cheesy garlic bread", 2880],
          ["Spaghetti with meatballs", "", 2400],
          ["Country Fried Steak Dinner/Lunch Entree", "Breaded steak smothered in sausage country gravy", 2514],
          ["Rose Seafood Linguine", "Shrimp and cod with pasta in a velvety rose cream sauce, lightly topped with parmesan", 3150],
          ["Blackened Salmon", "Salmon in a Creole blend rub, pan-seared in butter, served over white rice and veggies", 3594]
        ]
      },
      {
        name: "Desserts",
        items: [
          ["Cheesecake", "", 960],
          ["Chocolate Chip Cake with Milk Mousse", "", 1194],
          ["Chocolate Peanut Butter Cake", "", 1194],
          ["Jumbo Chocolate Chip Cookie", "", 420],
          ["Loaded Chocolate Chip Cookie Ice Cream Sandwich", "Shareable 2 jumbo cookies stuffed with a scoop of vanilla ice cream", 1440],
          ["Red Velvet Cake", "Red velvet with cream cheese frosting", 1194],
          ["Scoop of Ice Cream", "", 390],
          ["Tuxedo Cake", "", 1314],
          ["WTF What the Fookie", "One warm jumbo chocolate chip cookie topped with a scoop of ice cream", 834],
          ["Cup of Seasonal Fruit", "", 358],
          ["Pumpkin Cheesecake", "", 1110]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Arnold Palmer", "", 450],
          ["Coffee", "", 360],
          ["Fountain Soda", "Pepsi, Starry, Diet Pepsi, Crush, Rootbeer, Dr Pepper, Ginger Ale", 474],
          ["Hot chocolate", "", 450],
          ["Hot Tea", "", 270],
          ["Iced Tea", "", 390],
          ["Juice 8oz", "", 450],
          ["Milk 8 oz", "", 450],
          ["Red Bull", "", 600],
          ["SF Red Bull", "", 600],
          ["Soda Float", "Choice of soda, with a scoop of vanilla ice cream", 630],
          ["Virgin Bloody Mary", "", 720]
        ]
      },
      {
        name: "Cadet's Meal",
        items: [
          ["Chicken Tenders", "3 pieces chicken tenders, served with french fries", 1440],
          ["Kids' Cheeseburger", "5 oz beef patty, Cheddar cheese, brioche bun, served with french fries", 1320],
          ["Kids' Drink", "", 300]
        ]
      },
      {
        name: "South of the Border",
        items: [
          ["Tacos ala carte", "Choice of meat (steak, grilled chicken", 474],
          ["Totchos", "Tater tots topped with pico de gallo, sour cream, guacamole, nacho cheese sauce, choice of meat", 1314]
        ]
      }
    ],
    orderUrl: "https://order.online/business/13030306/store/oakley-whiskey-tango-foxtrot-restaurant-bar-grill-bridgehead-rd-oakley-30211748?pickup=true",
    pricesEstimated: "Prices are from their order.online ordering page (run by DoorDash); they may be higher than in the restaurant.",
    siteNote: "Menu from the Oakley store on their order.online page, linked from wtfrestaurantbargrill.com."
  },
  'x-noodle-dumpling': {
    sections: [
      {
        name: "Soup Noodles",
        items: [
          ["Lanzhou Hand Pull Beef Noodle Soup", "Pls choose the shape and thickness of your preference. Served with sliced beef, daikon, leek, cilantro and…", 1954],
          ["Braised Beef Soup Noodles", "Mild. Served with beef, bok choy, cilantro, leek in special beef stock.", 1954],
          ["Spicy Beef Noodle Soup", "Hot. Served with beef, egg, fried tofu, cilantro, and onion.", 1954],
          ["Extra Meat", "Additional serving of meat.", 459],
          ["Extra Noodles", "Additional serving of noodles.", 459],
          ["Extra Soup", "Additional serving of our savory soup.", 459],
          ["Fried Lamb Skewer", "Served with cumin & chili powder.", 799],
          ["Pickle Mustard Green W/Beef Noodle Soup", "Served W/Pickle Mustard Green,Beef slice", 1954],
          ["Hot &Sour Fish Noodle soup", "Served W/Fish Fillet,PIckle,Pepper in fish soup", 1954],
          ["Hot & Sour Pork Noodle Soup", "Served W/Ground pork,Green onion,black fungus in soup", 1954]
        ]
      },
      {
        name: "Stir Noodles",
        items: [
          ["General Chow Chicken Stirred Noodle", "Mild.", 1949],
          ["Orange Chicken Stirred Noodle", "Stir-fried noodles with orange chicken.", 1949],
          ["Pork Belly Topping Soup Noodles", "Served with pork belly, bok choy, cilantro, leek over noodle.", 1949],
          ["Ground Beef with Spicy Sauce Stir Noodle", "Mild. Served with ground beef, bok choy, cilantro, and leek.", 1949],
          ["Noodle with Ground Pork Sauce", "Served with ground pork, potato, dry bean curd, carrots, and cucumber over noodle.", 1949],
          ["Egg and Tomato Noodle", "Served with tomato, and scrambled egg.", 1949],
          ["Fried Red Chili Flakes Noodles with Ground", "Mild. Served with minced pork, bok choy, and red chili flakes.", 1949],
          ["Mogolian Beef Stir Noodle", "Served W/Beef Onion &Dry Chili", 1949],
          ["Beef Broccoli Stir Noodle", "Served W/Beef &Broccoli over noodle", 1949]
        ]
      },
      {
        name: "Handmade Dim Sium",
        items: [
          ["Pork Xiao Long Bao (4 Pieces)", "Steamed dumplings filled with pork.", 1149],
          ["Pork & Crab Meat Xiao Long Bao (4 Pieces)", "Steamed dumplings filled with pork and crab meat.", 1149],
          ["Pork & Shrimp Xiao Long Bao (4 Pieces)", "Steamed dumplings filled with pork and shrimp.", 1149],
          ["Spicy Pork Xiao Long Bao (4 Pieces)", "Spicy.", 1149],
          ["Shrimp/Pork Siomai (4 Pieces)", "Steamed dumplings filled with shrimp and pork.", 1149],
          ["Fried Crab & Cheese Puffs (4 Pieces)", "Crab and cheese filled puffs, crispy on the outside and soft within.", 919],
          ["Pork Wonton with Chili Sauce (8 Pieces)", "Delicate pork dumplings served in a savory chili sauce.", 1149],
          ["Dumpling with Hot Chili Sauce (6 Pieces)", "Steamed dumplings served with a side of hot chili sauce.", 1149],
          ["Pan-Fried Dumpling (6 Pieces)", "Crisp-bottom pan-fried dumplings with tender wrappers and juicy, savory filling. 6 pieces.", 1149],
          ["Dumpling (8 Pieces)", "Handmade steamed dumplings filled with minced meat and greens. 8 pieces.", 1149],
          ["Pan-Fried Pork Bun (4 Pieces)", "Tender pork in a soft bun, served in a set of four.", 1149],
          ["Chinese Beef Burrito", "Served with sliced beef, cilantro, and onion.", 1729],
          ["Barbecue Pork Bao (2 Pieces)", "Tender pork in a soft, fluffy bun.", 804],
          ["Chinese Pork Hamburger (1 Piece)", "Served with pork, cilantro, and jalapeño fillings.", 1034],
          ["Pork and Cabbage Pie (1 Piece)", "Pan-fried pork & cabbage pie.", 459],
          ["Beef & Onion Meat Pie (1 Piece)", "Pan-fried pork & cabbage pie.", 459],
          ["Green Onion Pancake", "Crispy pancake filled with green onions.", 689],
          ["Egg Yolk Bao (3 Pieces/Order)", "Soft, fluffy bao filled with rich egg yolks.", 804],
          ["Shrimp Dumplings(5pcs)", "Delicate shrimp wrapped in thin dough, steamed to perfection.", 1149],
          ["Sticky Rice Siomai W/Ground Pork(4pcs)", "Steamed dumplings filled with ground pork and served with sticky rice.", 1149],
          ["Sweet Red Bean Bao (3 Pieces/Order)", "Soft, fluffy buns filled with sweet red bean paste.", 804]
        ]
      },
      {
        name: "Rice Bowl",
        items: [
          ["Hunan Beef Rice Bowl", "Mild.", 2069],
          ["Beef Broccoli Rice Bowl", "Tender beef and broccoli served over a bed of rice.", 2069],
          ["Mongolian Beef Rice Bowl", "Mild.", 2069],
          ["Orange Chicken Rice Bowl", "Crispy chicken, orange-infused sauce, and steamed rice come together in a flavorful bowl.", 2069],
          ["General Tso's Chicken Rice Bowl", "Mild.", 2069],
          ["Kungpao Chicken Rice Bowl", "Mild.", 2069],
          ["Beef with Tomato Rice Bowl", "Served with rice, beef, bell peppers, onion, and tomato in tomato sauce.", 2069],
          ["Ma Po Tofu Rice Bowl", "Mild.", 1839]
        ]
      },
      {
        name: "Starter/Salad",
        items: [
          ["Cucumber Salad", "Thinly sliced cucumbers in a refreshing mix.", 1149],
          ["Braised Pork Feet", "Braised pork feet, tender and succulent with rich collagen.", 1149],
          ["Spicy Sliced Beef with Cucumber Salad", "Medium.", 1149]
        ]
      },
      {
        name: "Chef Special",
        items: [
          ["General Tso's Chicken Nuggets", "Mild.", 1839],
          ["Orange Chicken Nuggets", "Crispy chicken strips smothered in a tangy orange sauce.", 1839],
          ["Sesame Crispy Chicken Nuggets", "Crispy fried chicken tossed in sesame seeds for a nutty flavor.", 1839],
          ["Mandarin Chicken Nuggets", "Tender chicken in a savory Mandarin-inspired sauce.", 1839],
          ["Baby Buk ChoyW/Garlic", "Stir-fried baby bok choy with garlic.", 1499],
          ["Mapo Tofu", "Silky tofu in a savory Sichuan pepper sauce.", 1499]
        ]
      },
      {
        name: "Spicy Noodle Plate",
        items: [
          ["Spicy Chicken Flat Noodles", "Hot and spicy. Hot. Served with flat noodle, chicken, celery, bamboo shoots, leeks, and dry bean curd…", 1954],
          ["Spicy Beef Flat Noodles", "Hot and spicy. Hot. Served with flat noodle, beef, celery, bamboo shoots, leeks, and dry bean curd stick…", 1954],
          ["Spicy Braised Pork Dry Pot", "Medium. Served with pork belly, celery, bamboo shoots, leeks, and dry bean curd stick with chili powder.", 1954]
        ]
      },
      {
        name: "Fried Rice & Chow Mein",
        items: [
          ["Beef Chow Mein", "Served with noodle, beef, onion, carrots, and cabbage.", 1839],
          ["Combination Chow Mein", "Served with noodle, chicken, beef, shrimp, onion, carrots, and cabbage.", 1839],
          ["Seafood Chow Mein", "Served with noodle, mix of seafood, onion, carrots, and cabbage.", 1839],
          ["Chicken Chow Mein", "Served with noodle, chicken, onion, carrots, and cabbage.", 1839],
          ["Vegetable Chow Mein", "Served with noodle, onion, carrots, and cabbage.", 1724],
          ["Vegetable Fried Rice", "Served with vegetable, rice, carrots, and peas.", 1724],
          ["Combination Fried Rice", "Served with rice, chicken, beef, shrimp, egg, carrots, and peas.", 1724],
          ["Shrimp Fried Rice", "Served with rice, shrimp, egg, carrots, and peas.", 1724],
          ["Beef Fried Rice", "Served with rice, beef, egg, carrots, and peas.", 1724],
          ["Chicken Fried Rice", "Served with rice, chicken, egg, carrots, and peas.", 1724],
          ["White Rice", "Plain steamed white rice.", 289]
        ]
      },
      {
        name: "Dessert/Snack",
        items: [
          ["Fried Crab & Cheese Puffs (6 Pieces)", "Crab and cheese filled puffs, crispy on the outside and soft within.", 919]
        ]
      },
      {
        name: "Sodas",
        items: [
          ["Coca-Cola", "", 300],
          ["Diet Coke", "", 300],
          ["Sprite", "", 300]
        ]
      }
    ],
    hours: "Daily 11am–8:45pm",
    orderUrl: "https://www.ubereats.com/store/x-noodles-%26-dumplings-brentwood/uQSAWIhRWliEneMZzCyfVw",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu is from their Uber Eats store; hours are from Google Maps and Uber Eats, which agree."
  },
  'yayoi-cupertino': {
    hours: "Sun–Thu 11:30am–8pm, Fri–Sat 11:30am–9pm",
    orderUrl: "https://order.toasttab.com/online/yayoi-cupertino-new-20682-homestead-road",
    siteNote: "Hours are from the Find Us page on YAYOI's own website; order link is from their To-Go page."
  },
  'yayoi-palo-alto': {
    hours: "Daily 11:30am–8pm",
    orderUrl: "https://www.toasttab.com/local/order/yayoi-palo-alto-403-university-ave",
    siteNote: "Hours are from the Find Us page on YAYOI's own website; order link is from their To-Go page."
  },
  'yayoi-san-mateo': {
    hours: "Daily 11:30am–8pm",
    orderUrl: "https://www.toasttab.com/local/order/yayoi-san-mateo-em-new-389-hillsdale-mall",
    siteNote: "Hours are from the Find Us page on YAYOI's own website; order link is from their To-Go page."
  },
  'yuanbao-jiaozi-burlingame': {
    hours: "Daily 11am–3pm, 5pm–9pm",
    siteNote: "Hours are from their own website and agree with their Grubhub store."
  },
  'yuanbao-jiaozi-san-francisco': {
    hours: "Wed–Mon 11am–9pm, Closed Tue",
    siteNote: "Hours are from their Grubhub store and directory listings; no menu with prices could be read."
  },
  'yummy-yummy-hibachi-73rd': {
    sections: [
      {
        name: "Hibachi Plates",
        items: [
          ["Chicken Plate", "Chicken breast in garlic butter, salt, pepper and lemon; with garlic fried rice and veggies", 2350],
          ["New York Steak Plate", "8 oz New York steak in garlic butter; with garlic fried rice and veggies", 2750],
          ["Filet Mignon Plate", "6 oz filet in garlic butter; with garlic fried rice and veggies", 3050],
          ["Shrimp Plate", "Shrimp in garlic butter with lemon; with garlic fried rice and veggies", 2750],
          ["Scallops Plate", "5 dry scallops in garlic butter; with garlic fried rice and veggies", 2750],
          ["Salmon Plate", "6 oz salmon in garlic butter; with garlic fried rice and veggies", 2750],
          ["Lobster Plate", "6 oz lobster tail in garlic butter; with garlic fried rice and veggies", 3350]
        ]
      },
      {
        name: "Hibachi Combos",
        items: [
          ["New York Steak and Chicken Plate", "With garlic fried rice, veggies and yummy sauce", 2950],
          ["Shrimp and Chicken Plate", "", 2950],
          ["Chicken and Scallops Plate", "", 3150],
          ["New York Steak and Shrimp Plate", "", 3250],
          ["New York Steak and Scallops Plate", "", 3250],
          ["Salmon and Chicken Plate", "", 3250],
          ["Filet Mignon and Chicken Plate", "", 3250],
          ["Salmon and Scallop Plate", "", 3350],
          ["Shrimp and Scallop Plate", "", 3450],
          ["Filet Mignon and Shrimp Plate", "", 3550],
          ["Filet Mignon and Scallops Plate", "", 3550],
          ["Shrimp and Salmon Plate", "", 3550],
          ["New York Steak, Chicken and Shrimp Plate", "", 3650],
          ["Lobster and Chicken Plate", "", 3750],
          ["New York Steak and Salmon Plate", "", 3950],
          ["Filet Mignon, Shrimp and Chicken Plate", "", 3950],
          ["Lobster and Scallops Plate", "", 4050],
          ["New York Steak and Lobster Plate", "", 4250],
          ["Shrimp and Lobster Plate", "", 4250],
          ["Filet Mignon and Salmon Plate", "", 4250],
          ["Shrimp, Chicken and Lobster Plate", "", 4450],
          ["Salmon and Lobster Plate", "", 4550],
          ["Filet Mignon and Lobster Plate", "6 oz filet and 4 oz lobster tail", 4550],
          ["New York Steak, Shrimp and Lobster Plate", "", 4750],
          ["Salmon, Shrimp and Lobster Plate", "", 5050]
        ]
      },
      {
        name: "Hibachi Burritos",
        items: [
          ["Chicken Burrito", "With garlic fried rice, veggies and yummy sauce", 1400],
          ["Steak Burrito", "With garlic fried rice, veggies and yummy sauce", 1600],
          ["Shrimp Burrito", "With garlic fried rice, veggies and yummy sauce", 1600],
          ["Chicken and Shrimp Burrito", "", 1900],
          ["Steak and Chicken Burrito", "", 1900],
          ["Steak and Shrimp Burrito", "", 2000],
          ["Trio Burrito", "New York steak, chicken and shrimp", 2200]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Garlic Fried Rice", "", 750],
          ["Steamed Rice", "", 450],
          ["Veggies", "", 550],
          ["Chicken (Side)", "", 750],
          ["Shrimp (Side)", "", 1100],
          ["Scallops (Side)", "", 1100],
          ["Salmon (Side)", "", 1450],
          ["New York Steak (Side)", "", 1500],
          ["Filet Mignon (Side)", "", 1800],
          ["Lobster (Side)", "", 2000],
          ["Extra Sauce", "Yummy sauce, garlic butter, teriyaki or ginger sauce", 50]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Canned Soda", "Coca-Cola, Sprite or Dr Pepper", 200],
          ["Water Bottle", "", 200]
        ]
      }
    ],
    hours: "Mon & Wed 3pm–9pm, Fri 3pm–10pm, Sat–Sun 2pm–8pm, Closed Tue & Thu",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu and hours from their Uber Eats store (no website found)."
  },
  'yummy-yummy-hibachi-piedmont': {
    sections: [
      {
        name: "Hibachi Plates",
        items: [
          ["Chicken Plate", "Chicken breast in garlic butter, salt, pepper and lemon; with garlic fried rice and veggies", 2350],
          ["New York Steak Plate", "8 oz New York steak in garlic butter; with garlic fried rice and veggies", 2750],
          ["Filet Mignon Plate", "6 oz filet in garlic butter; with garlic fried rice and veggies", 3050],
          ["Shrimp Plate", "Shrimp in garlic butter with lemon; with garlic fried rice and veggies", 2750],
          ["Scallops Plate", "5 dry scallops in garlic butter; with garlic fried rice and veggies", 2750],
          ["Salmon Plate", "6 oz salmon in garlic butter; with garlic fried rice and veggies", 2750],
          ["Lobster Plate", "6 oz lobster tail in garlic butter; with garlic fried rice and veggies", 3350]
        ]
      },
      {
        name: "Hibachi Combos",
        items: [
          ["New York Steak and Chicken Plate", "With garlic fried rice, veggies and yummy sauce", 2950],
          ["Shrimp and Chicken Plate", "", 2950],
          ["Chicken and Scallops Plate", "", 3150],
          ["New York Steak and Shrimp Plate", "", 3250],
          ["New York Steak and Scallops Plate", "", 3250],
          ["Salmon and Chicken Plate", "", 3250],
          ["Filet Mignon and Chicken Plate", "", 3250],
          ["Salmon and Scallop Plate", "", 3350],
          ["Shrimp and Scallop Plate", "", 3450],
          ["Filet Mignon and Shrimp Plate", "", 3550],
          ["Filet Mignon and Scallops Plate", "", 3550],
          ["Shrimp and Salmon Plate", "", 3550],
          ["New York Steak, Chicken and Shrimp Plate", "", 3650],
          ["Lobster and Chicken Plate", "", 3750],
          ["New York Steak and Salmon Plate", "", 3950],
          ["Filet Mignon, Shrimp and Chicken Plate", "", 3950],
          ["Lobster and Scallops Plate", "", 4050],
          ["New York Steak and Lobster Plate", "", 4250],
          ["Shrimp and Lobster Plate", "", 4250],
          ["Filet Mignon and Salmon Plate", "", 4250],
          ["Shrimp, Chicken and Lobster Plate", "", 4450],
          ["Salmon and Lobster Plate", "", 4550],
          ["Filet Mignon and Lobster Plate", "6 oz filet and 4 oz lobster tail", 4550],
          ["New York Steak, Shrimp and Lobster Plate", "", 4750],
          ["Salmon, Shrimp and Lobster Plate", "", 5050]
        ]
      },
      {
        name: "Hibachi Burritos",
        items: [
          ["Chicken Burrito", "With garlic fried rice, veggies and yummy sauce", 1400],
          ["Steak Burrito", "With garlic fried rice, veggies and yummy sauce", 1600],
          ["Shrimp Burrito", "With garlic fried rice, veggies and yummy sauce", 1600],
          ["Chicken and Shrimp Burrito", "", 1900],
          ["Steak and Chicken Burrito", "", 1900],
          ["Steak and Shrimp Burrito", "", 2000],
          ["Trio Burrito", "New York steak, chicken and shrimp", 2200]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Garlic Fried Rice", "", 750],
          ["Steamed Rice", "", 450],
          ["Veggies", "", 550],
          ["Chicken (Side)", "", 750],
          ["Shrimp (Side)", "", 1100],
          ["Scallops (Side)", "", 1100],
          ["Salmon (Side)", "", 1450],
          ["New York Steak (Side)", "", 1500],
          ["Filet Mignon (Side)", "", 1800],
          ["Lobster (Side)", "", 2000],
          ["Extra Sauce", "Yummy sauce, garlic butter, teriyaki or ginger sauce", 50]
        ]
      },
      {
        name: "Sushi Appetizers & Bowls",
        items: [
          ["Cucumber Sunomono", "Cucumber in sweet vinegar dressing", 800],
          ["Wakame", "Seaweed salad", 950],
          ["Sashimi Appetizer (6 pcs)", "", 1900],
          ["Tuna Tataki (8 pcs)", "Seared tuna", 2400],
          ["Sashimi Chef's Choice", "", 3550],
          ["Chirashi", "Assorted fish and seaweed salad over rice", 3850],
          ["Sake Don (10 pcs)", "Salmon over rice", 2800],
          ["Unagi Don", "Eel over rice with oshinko", 3650],
          ["Sushi and Sashimi Special", "California roll, sake roll, tekka roll, 6 sashimi and 8 nigiri", 4850],
          ["Trio Poke Bowl", "Salmon, tuna, hamachi, cucumber, onion, jalapeño, corn, wakame, crab, tobiko", 2800],
          ["Scottish Bowl", "Salmon, cucumber, onion, jalapeño, corn, wakame, crab, tobiko", 2500],
          ["Hawaiian Poke Salad", "Cucumber, red onion, greens, corn, seaweed salad, tobiko", 2300]
        ]
      },
      {
        name: "Nigiri (2 pcs)",
        items: [
          ["Maguro (Tuna)", "", 850],
          ["Sake (Salmon)", "", 850],
          ["Hamachi (Yellowtail)", "", 850],
          ["Smoked Salmon", "", 850],
          ["Tobiko", "", 850],
          ["Tako (Octopus)", "", 850],
          ["Saba (Mackerel)", "", 750],
          ["Unagi (Eel)", "", 950],
          ["Ebi (Shrimp)", "", 950],
          ["Hotate (Scallop)", "", 1050],
          ["Spicy Hotate", "", 1150],
          ["Ikura (Salmon Roe)", "", 1050],
          ["Inari (3 pcs)", "", 950],
          ["Tamago (3 pcs)", "", 950]
        ]
      },
      {
        name: "Rolls & Hand Rolls",
        items: [
          ["California Roll", "Imitation crab and avocado", 850],
          ["Tekka Roll", "Tuna", 850],
          ["Sake Roll", "Salmon", 850],
          ["Alaska Roll", "Salmon and avocado", 950],
          ["Negihama Roll", "Yellowtail and green onion", 950],
          ["Hamachi Roll", "Yellowtail and avocado", 950],
          ["New York Roll", "Shrimp, cucumber and avocado", 950],
          ["Shrimp Tempura Roll", "Shrimp tempura, cucumber and avocado", 950],
          ["Spicy Tuna Cucumber Roll", "", 950],
          ["Spicy Salmon Avocado Roll", "", 950],
          ["Tobiko California Roll", "", 1050],
          ["Salmon Skin Roll", "Salmon skin, yamagobo, avocado, cucumber, tobiko, bonito", 1050],
          ["Philadelphia Roll", "Salmon, cream cheese and avocado", 1150],
          ["Spicy Scallop Roll", "", 1150],
          ["Snow California Roll", "Real crab and avocado", 1250],
          ["Poki Roll", "Spicy tuna, cucumber, seaweed on top", 1250],
          ["Rock n Roll", "Unagi, avocado and tobiko", 1250],
          ["California Deluxe Roll", "Real crab, avocado, unagi on top", 1450],
          ["Spider Roll", "Soft shell crab, avocado, cucumber, tobiko", 1450],
          ["Veggie Deluxe Roll", "Vegetable tempura and avocado", 950],
          ["Avocado Roll", "", 950],
          ["Avocado Cucumber Roll", "", 950],
          ["Futomaki Roll", "Assorted vegetables", 850],
          ["Oshinko Roll", "Pickled radish", 1050],
          ["Kappa Roll", "Cucumber", 1250],
          ["Shiitake Roll", "", 1450],
          ["California Hand Roll", "", 750],
          ["Salmon Hand Roll", "", 750],
          ["Spicy Tuna Hand Roll", "", 750],
          ["Spicy Salmon Hand Roll", "", 850],
          ["Shrimp Tempura Hand Roll", "", 850],
          ["Unagi Hand Roll", "", 850],
          ["Tuna Hand Roll", "", 850],
          ["Hamachi Hand Roll", "", 850],
          ["Spicy Hamachi Hand Roll", "", 950],
          ["Spicy Scallop Hand Roll", "", 1050],
          ["San Francisco Hand Roll", "Imitation crab, unagi and avocado", 1350]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Canned Soda", "Coca-Cola, Sprite or Dr Pepper", 200],
          ["Water Bottle", "", 200]
        ]
      }
    ],
    hours: "Mon–Thu 12pm–9pm, Fri–Sat 12pm–10pm, Sun 12pm–8pm",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu and hours from their Uber Eats store (no website found)."
  },
  'yummy-yummy-hibachi-san-leandro': {
    sections: [
      {
        name: "Hibachi Plates",
        items: [
          ["Chicken Plate", "Chicken breast in garlic butter, salt, pepper and lemon; with garlic fried rice and veggies", 2450],
          ["New York Steak Plate", "8 oz New York steak in garlic butter; with garlic fried rice and veggies", 2950],
          ["Filet Mignon Plate", "6 oz filet in garlic butter; with garlic fried rice and veggies", 3250],
          ["Shrimp Plate", "Shrimp in garlic butter with lemon; with garlic fried rice and veggies", 2950],
          ["Scallops Plate", "5 dry scallops in garlic butter; with garlic fried rice and veggies", 2950],
          ["Salmon Plate", "6 oz salmon in garlic butter; with garlic fried rice and veggies", 2950],
          ["Lobster Plate", "6 oz lobster tail in garlic butter; with garlic fried rice and veggies", 3550]
        ]
      },
      {
        name: "Hibachi Combos",
        items: [
          ["New York Steak and Chicken Plate", "With garlic fried rice, veggies and yummy sauce", 2950],
          ["Shrimp and Chicken Plate", "", 3150],
          ["Chicken and Scallops Plate", "", 3350],
          ["New York Steak and Shrimp Plate", "", 3450],
          ["New York Steak and Scallops Plate", "", 3450],
          ["Salmon and Chicken Plate", "", 3450],
          ["Filet Mignon and Chicken Plate", "", 3450],
          ["Salmon and Scallop Plate", "", 3550],
          ["Shrimp and Scallop Plate", "", 3650],
          ["Filet Mignon and Shrimp Plate", "", 3750],
          ["Filet Mignon and Scallops Plate", "", 3750],
          ["Shrimp and Salmon Plate", "", 3750],
          ["New York Steak, Chicken and Shrimp Plate", "", 3850],
          ["Lobster and Chicken Plate", "", 3950],
          ["New York Steak and Salmon Plate", "", 4150],
          ["Filet Mignon, Shrimp and Chicken Plate", "", 4150],
          ["Lobster and Scallops Plate", "", 4250],
          ["New York Steak and Lobster Plate", "", 4450],
          ["Shrimp and Lobster Plate", "", 4450],
          ["Filet Mignon and Salmon Plate", "", 4450],
          ["Shrimp, Chicken and Lobster Plate", "", 4650],
          ["Salmon and Lobster Plate", "", 4750],
          ["Filet Mignon and Lobster Plate", "6 oz filet and 4 oz lobster tail", 4750],
          ["New York Steak, Shrimp and Lobster Plate", "", 4950],
          ["Salmon, Shrimp and Lobster Plate", "", 5250]
        ]
      },
      {
        name: "Hibachi Burritos",
        items: [
          ["Chicken Burrito", "With garlic fried rice, veggies and yummy sauce", 1400],
          ["Steak Burrito", "With garlic fried rice, veggies and yummy sauce", 1600],
          ["Shrimp Burrito", "With garlic fried rice, veggies and yummy sauce", 1600],
          ["Chicken and Shrimp Burrito", "", 1900],
          ["Steak and Chicken Burrito", "", 1900],
          ["Steak and Shrimp Burrito", "", 2000],
          ["Trio Burrito", "New York steak, chicken and shrimp", 2200]
        ]
      },
      {
        name: "Sides",
        items: [
          ["Garlic Fried Rice", "", 850],
          ["Steamed Rice", "", 450],
          ["Veggies", "", 750],
          ["Chicken (Side)", "", 850],
          ["Shrimp (Side)", "", 1200],
          ["Scallops (Side)", "", 1200],
          ["Salmon (Side)", "", 1650],
          ["New York Steak (Side)", "", 1700],
          ["Filet Mignon (Side)", "", 2000],
          ["Lobster (Side)", "", 2200],
          ["Extra Sauce", "Yummy sauce, garlic butter, teriyaki or ginger sauce", 50]
        ]
      },
      {
        name: "Drinks",
        items: [
          ["Canned Soda", "Coca-Cola, Sprite or Dr Pepper", 300],
          ["Water Bottle", "", 300]
        ]
      }
    ],
    hours: "Mon–Thu & Sat 12pm–8:50pm, Fri 12pm–9:45pm, Sun 12pm–7:50pm",
    pricesEstimated: "Prices are from their Uber Eats store; delivery apps often charge more than the counter.",
    siteNote: "Menu and hours from their Uber Eats store (no website found)."
  },
  'z-and-y-peking-duck': {
    hours: "Thu–Tue 11am–9pm; Closed Wed",
    siteNote: "Hours are from the FAQ on zandypekingduck.com ('Monday-Sunday: 11am-9pm. Closed Wednesdays.'); Google's listing matches."
  },
}

/** A seed with what the search found laid over it. A found menu retires the contact-only line. */
export const withFill = <S extends { slug: string }>(s: S): S => {
  const f = ONLINE_FILLS[s.slug]
  if (!f) return s
  const menu = !!(f.items?.length || f.sections?.length)
  return { ...s, ...f, ...(menu ? { contactOnly: f.contactOnly } : {}) }
}
