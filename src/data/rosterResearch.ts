import type { LocalSeed } from './localBrands'

/**
 * What the roster businesses publish about themselves, keyed by roster slug.
 *
 * GENERATED, then reviewed. tools/roster-research-ingest.mjs reads the
 * research JSON (one object per business, produced by reading each business's
 * OWN website and nothing else) and writes this file. Every entry carries the
 * date it was gathered and any self-contradictions found on the business's own
 * site, so a wrong fact can be traced to the page it came from.
 *
 * THE RULES THE GENERATOR HOLDS TO, which are the same rules as everywhere
 * else in this catalogue:
 *   - nothing here came from Yelp, Google, a delivery app or a search snippet;
 *   - a "starting at" price is carried as a floor with its label, never
 *     flattened into a fixed price;
 *   - hours are set only when the business publishes ONE schedule; two that
 *     disagree mean no hours and a note;
 *   - a business that publishes no prices gets a sentence saying so, not a
 *     guessed menu.
 *
 * Merged into the roster by seed() in roster.ts. Edit by hand if a business
 * corrects something; the ingest script refuses to overwrite an entry marked
 * `// hand-edited`.
 */
export const ROSTER_RESEARCH: Record<string, Partial<LocalSeed>> = {
  /*
     1-Up Retro — gathered 2026-09-09 from own-domain
     their spelling: "1-Up Retro Video Games" (roster keeps "1-Up Retro")
     they are: Retro video games
     logo: https://www.1upretrogaming.com/cdn/shop/files/shirtlogo.png?v=1721634226 (1920x1200) — not cut into a tile yet
     flag: THE ONLY PUBLISHED ADDRESS IS IN SACRAMENTO, not the Bay Area, and every social handle ends in 'sac'
     flag: the Shopify contact-information page still shows the default 'Trade name: My Store'
     flag: store hours are not published anywhere
  */
  '1up-retro': {
    address: "2325 J Street, Sacramento, CA 95816",
    phone: "(916) 706-2358",
    email: "orders@1upretrogaming.com",
    instagram: "1upretrosac",
    cuisine: "Retro video games",
    items: [
      ["1942 — NES","",1999,null,"from $19.99"],
      ["Adventure Island — NES","",1999],
      ["A Nightmare on Elm Street — NES","",7499],
      ["Advanced Dungeons & Dragons: Pool of Radiance — NES","",6999],
    ],
    siteNote: "'from' prices reflect condition — loose, boxed, complete in box.",
  },

  /*
     7 Mile House — gathered 2026-09-09 from own-domain
     they are: Restaurant & sports bar
     logo: https://images.squarespace-cdn.com/content/v1/5621644ce4b01226f10a20ad/1535466904353-UGW681IXI8TO1INI0X75/static1.squarespace.png — not cut into a tile yet
     flag: Glenn: 'Brisbane • Goods'
     flag: Hours: the home page, /menu and /contact agree (Sun 11:30am-8pm; Mon and Wed-Sat 11:30am-9pm, bar to 10pm Fri-Sat; closed Tue) and their Instagram bio says 'Open Wed - Mon w/ Sun brunch'; only the /ubebakeoff page's generic footer groups the days differently, so the three-page line is carried
     flag: Menu is image/PDF only on /menu (Appetizers & Salads; Sandwiches, Pasta, Kids & Sides; Entrees & Desserts; two more unlabeled pages; Dog Menu; Brunch Menu) - no text prices could be extracted; /order redirects to a third-party Toast Tab ordering site (out of scope for this research), so prices_published is false and items is empty.
     flag: Ube Bake-Off page: 6th annual event, Sept 30-Oct 5, 2026, at 7 Mile House. Free to vote (no entry fee); dine-in only - order the 'Ube Bake-Off Sampler' to taste 4 competition desserts and receive 2 ballots to vote (hand to server); no tickets required, reservations recommended. Prizes: the '7 Mile House Ube Bake Off Champ' title, a $100 gift certificate, a chance to sell the winning dessert at 7 Mile House in Oct/Nov, plus a blog/social media feature. A separate link on that page for nominating or competing was not followed.
     flag: No email address found on the home page or the /contact page.
     flag: Phone number appears in two printed formats across pages ('(415) 467-2343' on the home page vs '415-467-2343' on /ubebakeoff, /menu, and /contact) - same number, formatting difference only.
     flag: Menu prices are on their Toast ordering page, which refuses automated fetches (403), so the page says the prices are on the site rather than printing any
     flag: Menu sweep 2026-09-09, still no readable prices: No prices could be read: the menu at 7milehouse.com/menu is published only as scanned/photo images (Appetizers, Sandwiches/Pasta/Kids/Sides, Entrees/Desserts, Dog Menu, Brunch Menu pages), not text, and their Toast online-ordering page (order.toasttab.com/online/7-mile-house-sports-bar-grill) return
     flag: Menu sweep 2026-09-09: Menu on own site (7milehouse.com/menu) is images only, no machine-readable text or prices
     flag: Menu sweep 2026-09-09: Toast online-ordering page returned 403 Forbidden, confirming prior report
     flag: Menu sweep 2026-09-09: Hours are irregular: closed Tuesday, and bar stays open later (10pm) Fri-Sat than the kitchen/general hours
     flag: Menu sweep 2026-09-09: Site also references a separate Dog Menu and a Brunch Menu, neither price-readable
  */
  '7-mile-house': {
    address: "2800 Bayshore Blvd, Brisbane, CA 94005",
    phone: "(415) 467-2343",
    hours: "Mon 11:30am-9pm, Wed-Sat 11:30am-9pm, Sun 11:30am-8pm, closed Tue",
    instagram: "7milehouse",
    cuisine: "Restaurant & sports bar",
    tagline: "Historic, dog-friendly restaurant, sports bar and live music venue",
    contactOnly: "Historic, dog-friendly restaurant, sports bar and live music venue. No text-based prices are published on 7milehouse.com: /menu shows six menu images (Appetizers & Salads; Sandwiches, Pasta, Kids & Sides; Entrees & Desserts; two further unlabeled pages; Dog Menu; Brunch Menu) with no readable text, and /order only links out to a third-party Toast Tab ordering page. Per the /ubebakeoff page, the 6th annual Ube Bake-Off (Sept 30-Oct 5, 2026) has no entry fee, is dine-in only via the 'Ube Bake-Off Sampler' (comes with 2 ballots to sample and vote on 4 competing desserts; no tickets needed though reservations are recommended), with the winning baker earning the 'Ube Bake Off Champ' title, a $100 gift certificate, and a chance to sell their dessert at 7 Mile House in Oct/Nov.",
  },

  /*
     Adzeela — gathered 2026-09-09 from own-domain
     they are: Out-of-home advertising
     logo: https://assets.cdn.filesafe.space/eB7n0OPlq05vyyLG9vE5/media/69dc669a982fd67a35b6482c.png (401x310) — not cut into a tile yet
     flag: no street address — footer lists only 'San Jose, California / Manila, Philippines'
     flag: content is Philippines-centric (Makati, BGC, SM Mall loops, peso pricing) though filed as a Bay Area business
     flag: a broken HTML comment leaks into visible page text before the contact section
     flag: mojibake quote characters throughout the FAQ
     flag: second phone published: PH line (+63) 912-845-2408
  */
  'adzeela': {
    phone: "(669) 200-3444",
    email: "admin@adzeela.com",
    instagram: "adzeelacore",
    cuisine: "Out-of-home advertising",
    contactOnly: "A digital out-of-home advertising platform — 'your brand, walking where people are' — via LED-backpack walking ads, vehicle ads and screen networks. No campaign pricing; the only figures on the site are a Territory Partner licence quoted in Philippine pesos.",
  },

  /*
     Al Pastor Papi — gathered 2026-09-09 from own-domain
     they are: Mexican grill
     logo: https://www.alpastorpapisf.com/uploads/b/75a7c2018d51b2a13ae14860ad1a9f6f0c865a1f22ab6e50c3a4e4419883ea86/APP%20Combined%20Logo%20%283%29_1775243606.png (2000x2000) — not cut into a tile yet
     flag: no phone or email published anywhere — the contact page is a form
     flag: their ordering pages show availability 11:15am-6:59pm while the posted hours say 11am-8pm
     flag: menu: 19 items read from https://www.alpastorpapisf.com/s/order#most-popular on 2026-09-05
  */
  'al-pastor-papi': {
    address: "232 O'Farrell Street, San Francisco, CA 94102",
    hours: "Tue-Sat 11am-8pm, closed Sun-Mon",
    instagram: "alpastorpapi415",
    cuisine: "Mexican grill",
    sections: [
      { name: "Drinks", items: [
        ["Water","Bottled water.",200],
        ["Jarritos","Jarritos is a popular Mexican brand of fruit-flavored, carbonated soft drinks.",500],
        ["Sparkling Water","Topo Chico is a premium, highly carbonated mineral water sourced and bottled in Monterrey, Mexico.",500],
        ["Canned Soda","Variety of canned sodas.",300],
        ["Gatorade","Bottled Gatorade",400],
        ["Aguas Frescas","A light, non-alcoholic Mexican beverage made by blending fruit, cereals, flowers, or seeds with water, sugar, and lime.",500,"al-pastor-papi-aguas-frescas"],
      ] },
      { name: "Tacos", items: [
        ["Tacos Al Pastor de Trompo","Authentic Mexico City Style Tacos Al Pastor: 4 inch Corn Tortilla, Al Pastor de Trompo, Onions, Cilantro and Pineapple",500,"al-pastor-papi-tacos-al-pastor-de-trompo"],
        ["Classic Taco","4-inch Corn tortilla, cilantro, onions, plus your choice of protein.",400,"al-pastor-papi-classic-taco","from $4.00"],
        ["Vampiro Tacos","4 inch corn Tortilla, melted cheese, onions, cilantro.",500,"al-pastor-papi-vampiro-tacos","from $5.00"],
        ["Crispy Queso Tacos","6-inch crisped corn tortilla, melted cheese, onions, cilantro",700,"al-pastor-papi-crispy-queso-tacos","from $7.00"],
        ["Gringa Taco","6-inch flour tortilla, melted cheese, onions, cilantro",800,"al-pastor-papi-gringa-taco","from $8.00"],
      ] },
      { name: "Burritos", items: [
        ["Kids Burrito","Flour tortilla, rice, beans, and cheese. Add meat for an additional $3.00",800,"al-pastor-papi-kids-burrito"],
        ["Award Winning Burrito","12-inch flour tortilla, spanish rice, black beans (whole or refried), melted cheese, avocado, crema, onions, cilantro",1800,"al-pastor-papi-award-winning-burrito","from $18.00"],
        ["Tijuana Style Burrito","NO RICE, NO BEANS, 12 inch flour tortilla, melted cheese, avocado, crema, onions, cilantro, spicy salsa papi rojo or medium salsa papi verde.",1800,"al-pastor-papi-tijuana-style-burrito","from $18.00"],
      ] },
      { name: "Tortas", items: [
        ["The Alpastorta","Toasted soft roll, grilled al pastor, grilled pineapple, refried pinto beans, melted cheese, avocado, crema, onions, cilantro, spicy salsa papi roja",1900,"al-pastor-papi-the-alpastorta","from $19.00"],
      ] },
      { name: "Sides", items: [
        ["Chips and Salsa","Tortilla chips and salsa.",300,"al-pastor-papi-chips-and-salsa"],
        ["Chips And Guacamole","Tortilla chips and freshly made, in-house guacamole.",1000],
        ["Chips","Side of tortilla chips",200],
      ] },
      { name: "Bowls", items: [
        ["Bowl","Romaine, Spanish rice, black beans (whole or refried), melted cheese, avocado, crema, onions, cilantro, spicy salsa papi roja or medium salsa papi verde",1800,"al-pastor-papi-bowl","from $18.00"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Alive Kitchen — gathered 2026-09-09 from own-domain
     their spelling: "Alive Kitchen by Joni" (roster keeps "Alive Kitchen")
     they are: Mediterranean
     logo: https://eatalivekitchen.com/assets/logo-Cj9p8VVN.png — not cut into a tile yet
     flag: Glenn: '3 locations', no city given
     flag: Website meta description also names 'Napa' as a 4th service area, but the Instagram bio and the rest of the site name only 3 cities (Concord, Walnut Creek, Lafayette) -- a location on one page but not the others
     flag: No street address is published for any city; the site states the exact address is only 'provided after checkout' (mentioned specifically for Concord pickup)
     flag: Only one phone number (+1 561-909-5062, also used as the WhatsApp ordering link) is published for the whole business; no per-city phone numbers exist
     flag: No per-city store hours are published; only a general Sun-Mon 2-6pm delivery/pickup window and a Thursday 6pm weekly order cutoff apply site-wide, not tied to any specific address
     flag: This is a weekly meal-prep delivery/pickup kitchen, not a walk-in restaurant with three storefronts, so the 'locations' are delivery service-area cities rather than addressed venues
     flag: One kitchen, three delivery cities — Concord, Walnut Creek and Lafayette per their own bio, Napa only in the site's meta description — so one record seated on each of the three cities' yellow sheets; orders close Thursday 6pm, delivery and pickup Sun-Mon 2-6pm, per the site
  */
  'alive-kitchen': {
    phone: "(561) 909-5062",
    email: "Alivekitchen24@gmail.com",
    instagram: "alivekitchen24",
    cuisine: "Mediterranean",
    tagline: "Weekly Mediterranean meal-prep delivered in the Bay Area, CA",
    sections: [
      { name: "Protein Bowls", items: [
        ["Chicken Shawarma","Spiced chicken, basmati rice, cucumber tomato salad, pickled onion, garlic yogurt",2500],
        ["Chimichurri Chicken","Herb-marinated chicken, roasted sweet potatoes, garlic green beans, house chimichurri",2300],
        ["Mediterranean Ground Beef Bowl","Spiced ground beef, tri-color quinoa, roasted vegetables, tzatziki, fresh herbs",2800],
        ["Grilled Shrimp Couscous","Garlic lemon shrimp, lemon herb couscous, seasonal vegetables",2800],
        ["Roasted Eggplant & Chickpea","Roasted eggplant, marinated chickpeas, lemon herb rice, tahini, pomegranate",2000],
        ["Kofta Bowl","Spiced ground beef and lamb kofta, pearl couscous, roasted vegetables, mint yogurt",2600],
      ] },
      { name: "Salads", items: [
        ["Chickpea Salad","Marinated chickpeas, cucumber, cherry tomato, red onion, bell pepper, lemon vinaigrette",1300],
        ["Roasted Beet Salad","Roasted beets, toasted pine nuts, goat cheese, pomegranate, tahini dressing",1800],
        ["Cabbage Slaw","Shaved cabbage, carrot, edamame, scallion, citrus dressing",1200],
        ["Kale Salad","Massaged kale, parmesan, lemon, caesar dressing, toasted pepitas",1000],
      ] },
      { name: "Dips & Breads", items: [
        ["Classic Hummus","",800],
        ["Tzatziki","",800],
        ["Matbucha","",800],
        ["Chimichurri","",800],
        ["Lemon Tahini","",800],
        ["Fresh Baked Pita (4-pack)","",1000],
        ["Fresh Baked Pita (8-pack)","",2000],
        ["Braided Challah Loaf","",1500],
      ] },
      { name: "Cold-Pressed Juices", items: [
        ["Green Glow","",900],
        ["Carrot Citrus Boost","",900],
        ["Beet Berry Vitality","",1000],
      ] },
      { name: "Meal Plans", items: [
        ["Essential","6 meals per week",15000],
        ["Balanced","10 meals per week",25000],
        ["Performance","15 meals per week",37500],
      ] },
      { name: "Shabbat Dinner", items: [
        ["Honey Harissa Roast Chicken","Shabbat dinner, serves 4",25000],
        ["Slow-Braised Lamb Shoulder","Shabbat dinner, serves 4",27500],
      ] },
    ],
    siteNote: "Prices are taken from the site's own menu page (eatalivekitchen.com/menu); one menu applies to all cities and no location-based pricing is shown.",
  },

  /*
     Ally Virtual — gathered 2026-09-09 from own-domain
     they are: CRM and automation
     logo: https://assets.cdn.filesafe.space/GyU3aAixj9Swzx1v6VvR/media/6628a0b2424438359e1ba0d3.png (350x180) — not cut into a tile yet
     flag: the only published address is 30 Gould St Ste R, Sheridan, WY — a registered-agent suite, not a place a customer visits — so no address is carried onto the page; both phones are San Jose area codes
     flag: filed as 'Virtual assistance' but the site sells CRM and automation software plus e-commerce site packages
     flag: two phone numbers on the same pages: (408) 495-5737 and (669) 205-1004
     flag: testimonials use the site builder's stock avatars with generic names — read as placeholders
     flag: an FAQ answer about onboarding is unrelated text about commission fees
     flag: name also appears as 'AllyVirtual' and 'AllyVirtual Marketing'
  */
  'ally-virtual': {
    phone: "(408) 495-5737",
    email: "support@allyvirtual.com",
    instagram: "allyvirtualofficial",
    cuisine: "CRM and automation",
    groups: [
      { name: "Prices", items: [
        ["Basic Plan","CRM, funnels, workflows and email marketing, per month",7900],
        ["Pro Plan","Basic plus websites, reporting and invoicing, per month",12900],
        ["Agency Plan","Pro plus memberships, an affiliate manager and priority support, per month",20900],
        ["E-commerce Website Set-up","A fully functional e-commerce site, one-off",20900],
        ["Domain and Hosting","Registration, hosting, maintenance and uptime monitoring, per month",2499],
        ["Package Deal","E-commerce tools, domain and hosting, per month",4999],
      ] },
    ],
    quoteOnly: "'A comprehensive CRM and automation platform designed to streamline your business operations, enhance client engagement, and boost sales — all from a single dashboard.' Plans are per month; their FAQ says 6- and 12-month terms are charged in full up front and early cancellation is not permitted.",
  },

  /*
     Almas Auto & Tires — gathered 2026-09-09 from own-domain — BLOCKED: domain does not resolve — NXDOMAIN for almasautoandtiresca.com and www. on 1.1.1.1 and 8.8.8.8; no site to read
  */
  'almas-auto-tires': {
  },

  /*
     Andrew Shin — gathered 2026-09-09 from own-domain
     their spelling: "Law Offices of Andrew B. Shin" (roster keeps "Andrew Shin")
     they are: Personal injury law
     logo: https://cdn.prod.website-files.com/6733dda61510d345ee4e95f5/6889615445e8101a63b519f5_logo%20new%201.jpg (700x240) — not cut into a tile yet
     flag: 5 more offices: Pleasanton 4695 Chabot Dr Ste 200, 94588, (925) 462-1155; Modesto 426 14th St Ste 118, 95354, (209) 284-0222; Oakland 1901 Harrison St 11th Fl, 94612, (510) 791-7640; Salinas 971 N. Main St Ste 213, 93906, (877) 340-8905; San Francisco 1426 Fillmore St #305, 94115, (415) 392-3510
     flag: footer practice-area list says 'Denied Settlement' where the nav and page slug say 'Denied Claim'
     flag: hero images are AI-generated (filenames literally 'ChatGPT Image Aug 20, 2026')
  */
  'andrew-shin-law': {
    address: "540 Bird Avenue, San Jose, 95125",
    phone: "(408) 615-1155",
    email: "info@injuryattorneydirect.com",
    cuisine: "Personal injury law",
    contactOnly: "Personal injury and workers' compensation law firm 'Fighting for the Rights of the Injured For More Than 40 Years.' Free initial consultation; 'No Recovery, No Fee'.",
  },

  /*
     Armenta Landscape Co. — gathered 2026-09-09 from own-domain
     they are: Landscape contractor
     flag: Glenn filed them under 'Antioch • Goods'; they are a landscape contractor and sit on Antioch Services
     flag: serves Brentwood, Oakley, Antioch, Walnut Creek, Dublin, San Ramon, Danville, Pleasanton, Livermore, Lafayette, per their site
  */
  'armenta-landscape': {
    phone: "(925) 481-0609",
    instagram: "armentalandscapeco",
    cuisine: "Landscape contractor",
    tagline: "Landscape design and construction across the East Bay",
    contactOnly: "Landscape design and construction across the East Bay. Quotes on request; pavers, concrete and pergolas, 3D designs and construction; Lic. 1033926.",
  },

  /*
     Babs Delta Diner — gathered 2026-09-09 from own-domain
     they are: American diner
     flag: the site is an ordering mini-site with no about page and no email
     flag: a breakfast called 'Chicken Apple Sausage' is described as boneless pork chops — a copy-paste error; frequent menu typos
  */
  'babs-delta-diner': {
    address: "770 Kellogg Street, Suisun City, CA 94585",
    phone: "(707) 421-1926",
    hours: "Mon-Sat 7am-2pm, Sun 7am-1:30pm",
    instagram: "babsdiner",
    cuisine: "American diner",
    tagline: "A homestyle diner in Suisun City; the site is its own ordering portal.",
    items: [
      ["Bacon and Eggs","Four slices of bacon, two eggs, country potatoes or fried rice, toast",1800],
      ["Homemade Corned Beef Hash","With two eggs, country potatoes or fried rice, toast",2075],
      ["Chicken Fried Steak","Gravy on top, two eggs, potatoes or rice, toast",1925],
      ["Ribeye Breakfast Steak","Steak, two eggs, potatoes or fried rice, toast",3125],
      ["Seafood Omelet","Real crab, bay shrimp, spinach, jack cheese",2695],
      ["Three Hotcakes","",1050],
      ["French Toast","Two thick slices of sourdough in Babs' batter",1200],
      ["Fried Chicken with Waffles","Five pieces of fried chicken on a waffle",2025],
    ],
    siteNote: "A 184-item priced menu inside their ordering app; no static or PDF menu.",
  },

  /*
     Baithak — gathered 2026-09-09 from own-domain
     they are: Awadhi and North Indian
     logo: https://baithak.us/wp-content/uploads/2025/03/Logo-Orange_small_website.png — not cut into a tile yet
     flag: Glenn: 'Dublin • Goods'
     flag: Hours conflict: the homepage, happy-hour page, and weekend-brunch page footers all state 'Open Daily: 11:00 AM – 10:00 PM', but the Contact Us page (https://baithak.us/contact-us/) states 'Mon - THUR: 11AM - 9PM / Fri, SAT: 11AM - 10PM / SUN: 11AM - 9PM'. Because these disagree, hours is set to null.
     flag: Email conflict: the homepage, happy-hour page, and weekend-brunch page footers all list info@baithak.us, but the Contact Us page lists baithak@baithak.us. Because these disagree, email is set to null.
     flag: No second location is mentioned anywhere on the site; all pages checked point to the single Dublin, CA address.
     flag: Replaces the hand-written entry of 2026-08 that said they publish no prices: their own menu page now prints them
  */
  'baithak': {
    address: "4590 Dublin Blvd, Dublin, CA 94568",
    phone: "(925) 361-0862",
    instagram: "Baithak.dublin",
    cuisine: "Awadhi and North Indian",
    tagline: "Indian restaurant with full bar, happy hour, and weekend brunch",
    sections: [
      { name: "Kebab Plates", items: [
        ["Norani Paneer Tikka","Grilled cottage cheese",1700],
        ["Harabhara Daal Kebab","",1600],
        ["Salad Bowl","Choose any kebab",1500],
        ["Soft Veg Kebab","Vegetable patties, soft",1600],
        ["Chicken Malai Tikka","Cream marinated chicken",1700],
        ["Chicken Seekh Kebab","",1700],
        ["Chicken Chapali Kebab","Minced chicken kofta kebab",1700],
        ["Tandoori Chicken Tikka","Marinated chicken pieces",1700],
        ["Beef Seekh Kebab","Seasoned minced beef",1800],
        ["Shami Kebab","Minced goat patties, soft",1800],
        ["Lamb Chop","Marinated lamb chops",2200],
        ["Fish Fillet Ajwaini","Basa fish",1800],
        ["Mutton Seekh Kebab","Minced goat meat kebab",1800],
        ["Soya Chaap Kebab","",1600],
      ] },
      { name: "Sides", items: [
        ["Khameeri Naan (1pc)","",400],
        ["Garlic Khameeri Naan","",400],
        ["Warqi Parantha","",400],
        ["Saffron Rice","",500],
        ["Biryani Rice","",600],
        ["Indian Salad","",800],
        ["Caesar Salad","",800],
        ["Chilli Garlic Khamiri Naan","",400],
        ["Khameeri Atta Roti","",400],
        ["Steam Rice","",500],
      ] },
      { name: "Curries", items: [
        ["Awadhi Daal Makhani","Black daal",1500],
        ["Awadhi Paneer Makhani","Cottage cheese in curry",1700],
        ["Shahi Veg Korma","Mix vegetable curry",1700],
        ["Chicken Kasoori Methi (Boneless)","",1700],
        ["Awadhi Butter Chicken (Boneless)","Butter chicken, boneless",1700],
        ["Lamb Nihari","Spicy goat curry",2100],
        ["Goat Awadhi Korma","Goat creamy curry",2000],
        ["Chana Daal Fry","",1500],
        ["Malai Kofta","",1700],
        ["Dhaba Chicken Korma","",1800],
        ["Baingan Bharta","",1600],
      ] },
      { name: "Biryanis", items: [
        ["Paneer Mix Veg Biryani","Aromatic rice, vegetables & paneer",1600],
        ["Chicken Lucknowi Biryani (With Bones)","Aromatic rice & chicken",1600],
      ] },
      { name: "Sharing Platters", items: [
        ["Non Veg Platter","",4400],
        ["Veg Platter","",4200],
      ] },
      { name: "Chai Nashta", items: [
        ["Chai","Masala / Irani / Saffron / Sulemani",500],
        ["Coffee","Cappuccino / Americano / Espresso / Cold Nescafe / Filter Coffee",500],
        ["Shakes","Vanilla / Chocolate / Mango / Strawberry / Pistachio saffron",700],
      ] },
      { name: "Snacks & Quick Bites", items: [
        ["Grilled Bombay Veg Sandwich","",1300],
        ["Amul Cheese Sandwich","",1300],
        ["Paneer Roll","",1300],
        ["Mix Veg Paneer Pakoda","",1100],
        ["Naanza (Pizza)","Cheese, Chicken Makhani, Paneer, Veg",1300],
        ["Grilled Chicken Sandwich","",1300],
        ["Chicken Seekh Roll","",1300],
        ["Chicken Malai Tikka Roll","",1300],
        ["Vada Pav","",900],
        ["Bun Muska","Sweet bread & butter",600],
        ["Masala Peanuts","",600],
        ["Papdi Chaat","",1100],
        ["Aloo Tikki Chaat","",1100],
        ["Dahi Puri","",1100],
        ["Pani Puri","",1100],
        ["Chakhana Chana Dal","",600],
        ["Masala Papad","",600],
      ] },
      { name: "Mocktails", items: [
        ["Pink Paloma","Grapefruit",1000],
        ["Red Lantern","Pomegranate",1000],
        ["Lychee Mule","Lychee",1000],
        ["Mojito","Pineapple",1000],
        ["Pina Colada Virgin","",1000],
        ["Margarita Virgin","",1000],
      ] },
      { name: "Buffet", items: [
        ["Adult","",3000],
        ["Kids","",1500],
      ] },
      { name: "Small Bites", items: [
        ["Daal Pakwan","",700],
        ["Ram Laddoo","",700],
        ["Papad Peanut Masala","",700],
        ["Kurkure Bhindi","",700],
        ["Veg Cheese Ball","",700],
        ["Chicken Cheese Ball","",800],
        ["Chole Bhature","",1600],
      ] },
      { name: "Chai - Lassi - Coffee", items: [
        ["Mango Lassi","",700],
        ["Masala Soda","",700],
        ["Fresh Lime Soda","",700],
      ] },
      { name: "Beers", items: [
        ["Blue Moon","",800],
        ["Hazy Little Things IPA","",800],
        ["Modelo Especial","",800],
        ["Coors Light","",800],
        ["Peroni Nastro Azurro","",800],
        ["Pacifico","",800],
        ["Corona Extra","",800],
        ["Pale Ale Sierra Nevada","",800],
      ] },
      { name: "Non Alcoholic", items: [
        ["Lemonade","",500],
        ["Can Soda","",500],
        ["Tap Soda","",400],
      ] },
      { name: "Desserts", items: [
        ["Shahi Tukda","",600],
        ["Malai Kulfi","",600],
        ["Ice Cream","Mango / strawberry / chocolate / vanilla / pistachio",600],
        ["Shahi Phirni","",600],
        ["Rasmalai","",800],
      ] },
      { name: "Kids Menu", items: [
        ["Chicken Nuggets","",800],
        ["Cheese Sandwich","",1000],
        ["Veg Spring Roll","",800],
        ["French Fries","",800],
        ["Onion Rings","",600],
        ["Maggi Masala","",800],
        ["Chocolate Milk Shake","",700],
        ["Vanilla Milk Shake","",700],
        ["Cheese Naanza","",1100],
        ["Mango Milk Shake","",700],
      ] },
      { name: "Cocktails", items: [
        ["Japanese Sour","Tequila-based; balance of tartness and sweetness",1200],
        ["Lychee Martini","Vodka; sweet, fruity martini with distinctive lychee flavour",1200],
        ["Bramble","Gin-based sour with distinct blackberry flavour",1200],
        ["Mango Mojito","Rum; refreshing cocktail with balance of sweet, tart, minty flavours",1200],
        ["Mimosa","Champagne",1200],
        ["Old Fashioned","Whiskey",1200],
        ["Moscow Mule","",1300],
        ["Margarita","",1300],
        ["Pina Colada","",1300],
      ] },
      { name: "Bar Drinks", items: [
        ["Gin Hendricks","",1500],
        ["Cognac Hennessy","",1500],
        ["Cabernet Sauvignon","Wine, glass",1200],
        ["Pinot Noir","Wine, glass",1200],
        ["Chardonnay","Wine, glass",1200],
        ["Sauvignon Blanc","Wine, glass",1200],
        ["Champagne","Glass",1200],
        ["Tequila Don Julio Blanco","",1300],
        ["Whiskey Crown Royal","",1300],
        ["Whiskey Jameson","",1300],
        ["Vodka Tito's","",1400],
        ["Vodka Absolute","",1400],
        ["Gin Tanqueray","",1300],
        ["Cognac Hennessay VSOP","",1400],
        ["Tequila Patron Silver","",1300],
        ["Tequila Patron Anejo","",1300],
        ["Tequila Casa Amigo Reposado","",1500],
        ["Vodka Belvedere","",1600],
        ["Vodka Grey Goose","",1600],
        ["Whiskey Jack Daniel","",1300],
        ["Whiskey Black Label","",1500],
        ["Whiskey Glinlivet 12","",1600],
        ["Whiskey Oban 14","",1800],
        ["Whiskey Indri","",2000],
        ["Whiskey Maccallan 12","",2200],
        ["Cognac Rampur","",2200],
      ] },
    ],
    siteNote: "Prices taken from the site's own menu page (https://baithak.us/baithak-indian-restaurant-menu-dublin-ca/), which lists the full food and drink menu as text with printed prices.",
  },

  /*
     Banh Mi Oven — gathered 2026-09-09 from stopgap — BLOCKED: domain is not registered; there is no site to read
     they are: Vietnamese
     flag: the given domain banhmioven.us does not exist — NXDOMAIN on two resolvers, and the .us registry has no record of it; the link he sent is dead
     flag: Menu sweep 2026-09-09, still no readable prices: No prices could be read. The given URL https://banhmioven.us/ does not resolve (DNS lookup failure, both with and without www). One WebSearch identified banhmiovenus.com as the likely correct official site ('Banh Mi Oven | Vietnamese Sandwich Shop in San Jose, CA'), but it returned HTTP 403 Forbidde
     flag: Menu sweep 2026-09-09: The exact URL given in the task (https://banhmioven.us/) does not exist -- DNS does not resolve at all, so it appears to be a dead link or typo
     flag: Menu sweep 2026-09-09: Could not confirm which domain is the current official site: banhmiovenus.com (403 Forbidden) and banhmiovencali.com (404 Not Found on all paths tried) were both found via search but neither was readable
     flag: Menu sweep 2026-09-09: Search listings suggest there may be more than one 'Banh Mi Oven' location/entity: a Yelp listing for 1143 Story Rd, San Jose, CA and a separate Yelp listing marked CLOSED for 221 E San Fernando St, San Jose, CA, plus an unrelated Austin, TX location (banhmioventx.com) -- could not determine from an
     flag: Menu sweep 2026-09-09: name_exact, one_line, and cuisine are low-confidence, inferred only from third-party search-result titles since no own-site or own-ordering-page content could be loaded at all
     flag: Menu sweep 2026-09-09: address/phone/email/hours/instagram/logo all left null because nothing could be confirmed from the business's own site or own ordering page
  */
  'banh-mi-oven': {
    cuisine: "Vietnamese",
    needsSite: true,
  },

  /*
     Banh Mi Xpress — gathered 2026-09-09 from own-domain
     they are: Vietnamese sandwiches
     flag: no business hours or days published — the only time statement is 'banh mi served from 7:30am to 6pm'
     flag: the 'grilled pork' description actually describes the grilled beef item
     flag: menu typos: 'Vietnamse grilled ham', 'Vienamese meatball'
     flag: no logo image — the header is plain text and the favicon is a sandwich photo
     flag: no social links at all despite a 'Connect with Us' section
     flag: menu: 10 items read from https://www.banhmixpress.net/menu on 2026-09-05
  */
  'banh-mi-xpress': {
    address: "951 Alamo Dr, Vacaville, CA 95687",
    phone: "(707) 305-5128",
    email: "banhmixpresscorp@gmail.com",
    cuisine: "Vietnamese sandwiches",
    sections: [
      { name: "Bánh mì", items: [
        ["Bánh Mì Xpress- Bánh Mì Đặc Biệt","Crispy Vietnamese baguette layered with a variety of premium Vietnamese cold cuts, pork loaf, pâté, fresh cucumber, pickled carrots and daikon, cilantro",935,"banh-mi-xpress-b-nh-m-xpress-b-nh-m-c-bi-t"],
        ["Bánh Mì Heo Quay-Crispy roast pork","Crispy Vietnamese baguette filled with roasted pork belly with crunchy skin, fresh cucumber, pickled carrots and daikon, cilantro, jalapeños, and house sauce",935,"banh-mi-xpress-b-nh-m-heo-quay-crispy-roast-pork"],
        ["Bánh Mì Bò Nướng-Grilled beef","Crispy Vietnamese baguette filled with grilled marinated beef, fresh cucumber, pickled carrots and daikon, cilantro, jalapeños, and house sauce. Smoky, savory",935,"banh-mi-xpress-b-nh-m-b-n-ng-grilled-beef"],
        ["Bánh Mì Thịt Nguội-Vietnamse grilled ham","Crispy Vietnamese baguette filled with Vietnamese cold cuts, fresh cucumber, pickled carrots and daikon, cilantro, jalapeños, and house sauce",835],
        ["Bánh Mì Chả Lụa- Vietnamese ham","Crispy Vietnamese baguette filled with traditional Vietnamese pork sausage, fresh cucumber, pickled carrots and daikon, cilantro, jalapeños, and house sauce",835,"banh-mi-xpress-b-nh-m-ch-l-a-vietnamese-ham"],
        ["Bánh Mì Thập Cẩm-Combination","Crispy Vietnamese baguette loaded with a variety of Vietnamese meats, pâté, fresh cucumber, pickled carrots and daikon, cilantro, jalapeños, and house sauce",835],
        ["Bánh Mì Xíu Mại-Vienamese meatball","Crispy Vietnamese baguette filled with tender Vietnamese meatballs in savory tomato sauce, topped with fresh cucumber, pickled carrots and daikon, cilantro",835,"banh-mi-xpress-b-nh-m-x-u-m-i-vienamese-meatball"],
        ["Bánh Mì Ốp La-Fried egg","Crispy Vietnamese baguette filled with traditional Vietnamese pork sausage and sunny-side-up eggs, topped with fresh cucumber, pickled carrots and daikon",735,"banh-mi-xpress-b-nh-m-p-la-fried-egg"],
        ["Bánh Mì Chả Gà-Vietnamese chicken ham","Crispy Vietnamese baguette filled with Vietnamese chicken sausage, fresh cucumber, pickled carrots and daikon, cilantro, jalapeños, and house sauce. Light",835,"banh-mi-xpress-b-nh-m-ch-g-vietnamese-chicken-ham"],
        ["Bánh Mì Thịt Nướng- Grilled pork","Crispy Vietnamese baguette filled with grilled marinated beef, fresh cucumber, pickled carrots and daikon, cilantro, jalapeños, and house sauce. Smoky, savory",835],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     The Barrel Bistro & Wine Bar — gathered 2026-09-09 from own-domain
     they are: Wine bar and bistro
     logo: https://images.squarespace-cdn.com/content/v1/62e481f28715b55915a9d17d/0cb1963c-d787-4160-9e53-4e09cd1c127f/Barrel-logotype-horizontal-2color.png (2085x200) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the footer says Sun-Thu 9am-10pm, Fri-Sat 9am-11pm with breakfast 9-2, while their structured data says 11am-10pm every day — no hours carried
     flag: the Slice ordering-widget URL is pasted as plain text in the page head, so it renders as stray visible text on every page
     flag: the header 'Order Online' deep-links to one Toast item, the Barrel Burger, instead of the menu
     flag: weekend brunch Sat-Sun 11-2 with bottomless mimosas; live music Fri-Sat 6:30-11pm; reservations on OpenTable
     flag: menu: 40 items read from https://www.thebarrelbistrowinebar.com/menus on 2026-09-05
  */
  'barrel-bistro': {
    address: "246 South B Street, San Mateo, CA 94401",
    phone: "(650) 445-7250",
    email: "info@thebarrelbistrowinebar.com",
    instagram: "thebarrelbistrowinebar",
    cuisine: "Wine bar and bistro",
    photos: [
      {"src":"/food/barrel-bistro-site-0-lg.webp","alt":"","credit":"Their own photo, from thebarrelbistrowinebar.com"},
      {"src":"/food/barrel-bistro-site-2-lg.webp","alt":"","credit":"Their own photo, from thebarrelbistrowinebar.com"},
      {"src":"/food/barrel-bistro-site-3-lg.webp","alt":"","credit":"Their own photo, from thebarrelbistrowinebar.com"},
      {"src":"/food/barrel-bistro-site-11-lg.webp","alt":"","credit":"Their own photo, from thebarrelbistrowinebar.com"},
      {"src":"/food/barrel-bistro-site-12-lg.webp","alt":"","credit":"Their own photo, from order.toasttab.com"},
    ],
    sections: [
      { name: "Salads", items: [
        ["Goat Cheese Salad","With petite Romaine hearts, baby kale, garlic croutons, parmesan cheese, house-made Caesar dressing",2200],
        ["Feta Saganaki Salad","Our Warm Napa Cabbage Salad features crispy pepper bacon, mushrooms, and tangy blue cheese gorgonzola, all tossed in a flavorful red wine dressing",2200],
        ["Caesar Salad","Pistachio, goat cheese mousse, butter lettuce, tomatoes, roasted beets and raspberry dressing.",2000],
        ["Mediterranean Breeze","",2000],
        ["House Salad","",1200],
      ] },
      { name: "Main Courses", items: [
        ["Prime Rib Eye","",6500],
        ["Prime Lamb Chops","",6200],
        ["Grilled Wild Boar Tenderloin","",4400],
        ["Braised Rabbit Gnocchetti","",4400],
        ["Grilled Branzino","",4600],
        ["Chicken Parmesan","",3400],
        ["Chilean Sea Bass","",5500],
        ["Wild Lobster Tail Risotto","",4200],
        ["Mushroom Risotto","",3800],
        ["Risotto Alla Osso Buco","",4200],
        ["Niman Short Ribs","",4600],
      ] },
      { name: "Sides", items: [
        ["Roasted Seasonal Vegetables","",1600],
        ["Garlic Truffle Fries","",1600],
        ["Crispy Brussels Sprouts","",1600],
        ["Patatas Bravas","",1600],
        ["Artisinal Soup Of The Day","",1300],
        ["Bread sourdough","",300],
        ["Fire-Kissed Pappardelle","",2800],
        ["SeaFood Linguine","",3600],
        ["Fettuccine Al Pollo E Funghi","",3200],
      ] },
      { name: "Kids Options", items: [
        ["Kids Pasta","Our Kids Pasta Butter is a delicious and simple dish perfect for young appetites. Made with tender pasta and a creamy butter sauce",1699,"barrel-bistro-kids-pasta"],
        ["Kids Chicken Souvlaki","",1600],
        ["Kids Beef Souvlaki","",1800],
      ] },
      { name: "Flat Breads", items: [
        ["Prosciutto Flat Bread","",2800],
        ["Filet Mignon Flat Bread","",2800],
        ["Smoked Salmon Flat Bread","",2800],
        ["Chef's Seasonal Vegan Flatbread","",2800],
        ["Woodland mushroom flat bread","",2800],
      ] },
      { name: "Burgers", items: [
        ["The Shepherd Burger","",2200],
        ["Barrel Sliders","",2200],
      ] },
      { name: "Bakaliko Souvlaki", items: [
        ["Chicken Skewers","",2800],
        ["Beef Tenderloin","",3000],
        ["Tiger Shrimp","",3000],
        ["Wild Boar Souvlaki","",3200],
        ["Uncle Yorgos' Fire Skewers","",5200],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Bay Area Charters — gathered 2026-09-09 from own-domain
     their spelling: "Bay Area Charters Inc." (roster keeps "Bay Area Charters")
     they are: Charter buses
     flag: fleet size contradicts itself: the homepage says 57-passenger motor coaches, the Services page says 55
     flag: no logo image published; the favicon's source file is 18x21 pixels
     flag: no social links anywhere
  */
  'bay-area-charters': {
    address: "3150 Hilltop Mall Rd, Richmond, CA 94806",
    phone: "(510) 964-4476",
    email: "chartersbayarea@gmail.com",
    hours: "Mon-Fri 9am-5pm, closed Sat-Sun",
    cuisine: "Charter buses",
    contactOnly: "Group charter and shuttle — 'Comfortable, Budget-Friendly Group Transport' from 25-passenger minibuses to full motor coaches, with SPAB-certified school trips. Quote-based — no rates published; the quote form asks for trip details and, in 2026, a required fax number.",
  },

  /*
     Bay Side Fencing Co — gathered 2026-09-09 from site
     they are: Fencing contractor
     flag: Lic #1042534, on their contact page and Instagram bio
     flag: serves all of the Bay Area per their Instagram bio; the showroom is the Antioch address
     flag: fence styles listed on their site: board on board, nail on dog ear, hog wire, ranch, 3-rail vinyl, horizontal, louvered, nail on flat top, deer fencing
  */
  'bayside-fencing': {
    address: "1633 Viera Ave, Antioch, CA 94509",
    phone: "925-420-6268",
    email: "team@baysidefencingco.com",
    hours: "Mon-Fri 9am-4pm, closed Sat-Sun",
    instagram: "baysidefencing",
    cuisine: "Fencing contractor",
    tagline: "Licensed fencing contractor with a showroom on Viera Ave",
    contactOnly: "Licensed fencing contractor with a showroom on Viera Ave. Redwood fences, custom and automatic gates, staining on new installations, and reclaimed wood accent walls. Free estimates by call or text (925-354-3677 for texts); they publish no prices.",
  },

  /*
     Belly — gathered 2026-09-09 from own-domain — BLOCKED: order.toasttab.com/online/belly (Toast ordering page) returned HTTP 403 Forbidden when fetched, so it could not be used to cross-check hours or prices.
     their spelling: "belly" (roster keeps "Belly")
     they are: Korean-Mexican fusion
     logo: https://static.wixstatic.com/media/6511a6_43e3c4b2fc0844c19b09eb35e25c54ba~mv2.jpg (525x190) — not cut into a tile yet
     flag: Glenn: 'Oakland • Goods'
     flag: Second location on their own contact-us/about pages: 1901 San Pablo Avenue, Oakland, CA 94612 (downtown Oakland), explicitly marked 'Permanently Closed'; the only active location is 5634 College Avenue (Rockridge).
     flag: Hours of operation are not published on any of Belly's own pages checked (home, contact-us, about) — contact-us explicitly had no hours text — so hours is set to null rather than guessed.
     flag: Toast's separate live-ordering page (https://order.toasttab.com/online/belly), which sometimes shows hours, returned HTTP 403 Forbidden when fetched and could not be checked.
     flag: Instagram reel https://www.instagram.com/reel/DdDEq35z2g5/ loaded fine (no login wall). It was posted by a third-party food/lifestyle account, @antoinetterzz, not by Belly itself, captioned 'My favorite chicken caesar wrap in Oakland! #bayarea #oakland #bayareafoodie #lunchidea @bellyoakland' — the reel reviews/shows Belly's Chicken Caesar Wrap. Note it tags the handle @bellyoakland, which differs from the Instagram handle Belly's own site links to (@bellyuptown).
     flag: Phone number punctuation varied slightly by page ('1-510-350-8799' vs '1 510 350 8799') but the digits matched everywhere; not a real contradiction.
     flag: Belly's own about page gives no formal cuisine label, only the tagline 'Good food, no frills'; the 'Korean-Mexican fusion' tag used here is inferred from the menu itself (kimchi, bulgogi, Korean-style tacos/burritos/bowls alongside pico de gallo, crema, and Cheddar).
     flag: Instagram: their site's footer links @bellyuptown, but the profile in Glenn's screenshot is @bellyoakland — display name Belly, 5634 College Ave, linking bellyrestaurants.com — and the reel tags @bellyoakland too, so that handle is carried; the site's phone 1-510-350-8799 is printed the way their Instagram contact sheet prints it, (510) 350-8799
  */
  'belly': {
    address: "5634 College Avenue, Oakland, CA 94618",
    phone: "(510) 350-8799",
    email: "info@bellyuptown.com",
    instagram: "bellyoakland",
    cuisine: "Korean-Mexican fusion",
    tagline: "Korean-Mexican fusion diner with tacos, burgers, bowls, brunch",
    sections: [
      { name: "Appetizers", items: [
        ["Kimchi Arancini Balls","Crispy risotto, Monterey Jack, scallions, sesame, kimchi aioli",900],
        ["Crispy Dumplings","Pan-seared pork & shrimp, soy chili oil",1000],
        ["Mushroom Arancini","",900],
        ["Bulgogi Stuffed Mushrooms","",900],
      ] },
      { name: "Burgers", items: [
        ["Uptown Burger","6oz patty, sunny egg, grilled kimchi, jalapeños, cheese, belly sauce, fries",2200],
        ["Belly Burger","6oz patty, mushrooms, onion ring, kimchi cucumbers, cheese, garlic & belly sauce, fries",2200],
        ["West Coast Burger","6oz patty, kimchi cucumbers, candied bacon, greens, tomato, avocado, chipotle ketchup, fries",2200],
      ] },
      { name: "Pasta", items: [
        ["Silk Road Spaghetti","Garlic, ginger, green onions, Yunnan chilies, sweet & spicy sauce",1400],
        ["Creamy Kimchi Spaghetti","Sautéed kimchi, onions, Parmesan, creamy kimchi sauce",1400],
        ["Miso Butter Spaghetti","Parmesan, furikake, truffle oil, toasted panko",1400],
        ["Mushroom Risotto","Dashi, mushroom, Parmesan, parsley, asparagus",1900],
      ] },
      { name: "Salads", items: [
        ["Asian Crunch Salad","Cabbage mix, Romaine, carrots, Asian pear, fried split peas, wontons, miso sesame vinaigrette",1600],
        ["Chinese Chicken Salad","Mixed greens, chicken, wontons, mandarins, almonds, edamame, sesame ginger vinaigrette",1975],
        ["Side Salad","Mixed greens, pickled red onions, sesame ginger vinaigrette",575],
        ["Caesar Salad","Romaine, croutons, Parmesan, caesar dressing",1600],
        ["Cobb Salad","",1600],
      ] },
      { name: "All Day Breakfast", items: [
        ["Breakfast Taco Place","Scrambled eggs/egg whites, fries, bacon, cheese, avocado, chipotle aioli (2 corn tortillas)",2195],
        ["Breakfast Burrito","Scrambled eggs/egg whites, tater tots, bacon, cheese, avocado, chipotle aioli",2075],
        ["Breakfast Sandwich","Egg, bacon, American cheese, avocado, chipotle aioli",1600],
      ] },
      { name: "Tacos (Individual)", items: [
        ["Cali","House marinated steak, fries, avocado, pico de gallo, spicy crema, Cheddar",775],
        ["Grilled Chicken","House marinated chicken, Korean slaw, rice, pickled cucumbers, garlic & kimchi aioli",775],
        ["Panko Shrimp","Panko shrimp tempura, avocado, sesame slaw, sambal aioli, pico de gallo, lime-cilantro crema",775],
        ["Korean Hot Chicken Taco","Panko fried chicken, sesame slaw, pickled cucumbers, kimchi aioli",775],
        ["Steak + Egg Taco","House marinated steak, fries, fried egg, chipotle & garlic aioli",775],
        ["Surf Taco","Panko fish tempura, avocado, pico de gallo, sesame slaw, sambal aioli, spicy crema",775],
        ["Veggie Taco","Tofu tempura, sweet chili glaze, sesame slaw, pickled cucumbers",775],
      ] },
      { name: "Taco Platters", items: [
        ["2 Taco Platter","Choice of two tacos, side salad, chips",2095],
        ["3 Taco Platter","Choice of three tacos, side salad, chips",2475],
      ] },
      { name: "Burritos", items: [
        ["Cali Burrito","House marinated steak, fries, avocado, pico de gallo, spicy crema, Cheddar",1975],
        ["Grilled Chicken Burrito","Marinated chicken, Korean slaw, pickled cucumbers, garlic & kimchi aioli, multigrain rice",1975],
        ["Panko Shrimp Burrito","Panko shrimp, avocado, sesame slaw, sambal aioli, pico de gallo, lime-cilantro crema, multigrain rice",1975],
        ["Korean Hot Chicken Burrito","Panko fried chicken, sesame slaw, pickled cucumbers, kimchi aioli, multigrain rice",1975],
        ["Steak + Egg Burrito","House marinated steak, fries, fried egg, chipotle & garlic aioli",1975],
        ["Surf Burrito","Tempura fish, sesame slaw, avocado, pico de gallo, sambal aioli, spicy crema, multigrain rice",1975],
        ["Veggie Burrito","Tofu tempura, pickled cucumbers, sesame slaw, sweet chili glaze",1975],
        ["Surf and Turf Burrito","Steak, shrimp tempura, corn salsa, Cheddar, avocado, chipotle aioli",2200],
        ["Chicken Caesar Wrap","Grilled/fried chicken, Romaine, Parmesan, croutons, caesar dressing",2075],
      ] },
      { name: "Bowls", items: [
        ["Cali Bowl","House marinated steak, fries, avocado, pico de gallo, spicy crema, Cheddar",1975],
        ["Grilled Chicken Bowl","Marinated chicken, Korean slaw, pickled cucumbers, garlic & kimchi aioli, multigrain rice",1975],
        ["Panko Shrimp Bowl","Panko shrimp, avocado, sesame slaw, sambal aioli, pico de gallo, lime-cilantro crema, multigrain rice",1975],
        ["Korean Hot Chicken Bowl","Panko fried chicken, sesame slaw, pickled cucumbers, kimchi aioli, multigrain rice",1975],
        ["Surf Bowl","Panko fish, sesame slaw, avocado, pico de gallo, sambal aioli, spicy crema, multigrain rice",1975],
        ["Veggie Bowl","Tofu tempura, sweet chili glaze, sesame slaw, cucumbers, multigrain rice",1975],
        ["Surf and Turf Bowl","Steak, shrimp tempura, corn salsa, Cheddar, avocado, chipotle aioli, fries",1950],
      ] },
      { name: "Kids Menu", items: [
        ["Chicken + Fries","Fried chicken tender, French fries",1200],
        ["Kids Hamburger","Quarter pound grass-fed Angus patty, French fries",1200],
        ["Grilled Cheese","Pain de mie, Cheddar, Monterey Jack",1000],
      ] },
      { name: "Soup & Sandwiches", items: [
        ["Chicken Tortilla Soup (Cup)","Chicken, corn, black beans, avocado, Cheddar, Monterey Jack, sour cream, crispy tortilla",1000],
        ["Chicken Tortilla Soup (Bowl)","Chicken, corn, black beans, avocado, Cheddar, Monterey Jack, sour cream, crispy tortilla",1500],
        ["Chicken Noodle Soup (Cup)","Chicken, carrots, celery, orecchiette",1000],
        ["Chicken Noodle Soup (Bowl)","Chicken, carrots, celery, orecchiette",1500],
      ] },
      { name: "Sides", items: [
        ["Classic Fries","Shoestring fries",600],
        ["Truffle Fries","Shoestring fries, Italian parsley, Parmesan, truffle oil",900],
        ["Tater Tots","Crispy tots, togarashi aioli, furikake",900],
        ["Grandma Chun's Homemade Kimchi","Napa cabbage, water parsley, minari, chives",400],
      ] },
      { name: "Sweets", items: [
        ["Chocolate Chip Cookie","Brown butter, Valrhona dark chocolate, Maldon sea salt",500],
        ["Ice Cream","Matcha or Ube, topped with chocolate chip cookie crumbles",800],
        ["Matcha Creme Brulee","With assorted berries",1200],
        ["Bread Pudding","Cinnamon, vanilla, brioche, crème anglais",1400],
      ] },
      { name: "Non-Alcoholic Drinks", items: [
        ["Matcha Yuzu Lemonade","",700],
        ["Butterfly Pea Yuzu Lemonade","",700],
        ["Seasonal Lemonade","Fresh lemon juice, fruit purees, mint",500],
        ["Seasonal Unsweetened Iced Tea","Fresh brewed, no sugar",500],
        ["San Pellegrino Sparkling Water","",350],
        ["Fiji Water","",250],
        ["Coke","",350],
        ["Diet Coke","",350],
        ["Coke Zero","",350],
        ["Horchata","",600],
        ["Strawberry Horchata","",700],
        ["Matcha Horchata","",700],
      ] },
      { name: "Café", items: [
        ["Iced Latte","",550],
        ["Strawberry Milk","",600],
        ["Iced Matcha Latte","",550],
        ["Pourover Coffee","",500],
        ["Latte","",500],
        ["Assorted Hot Tea","",400],
        ["Mexican Hot Chocolate","",500],
        ["Americano","",500],
        ["Iced Americano","",550],
        ["Chai Latte","",600],
      ] },
      { name: "Mocktails", items: [
        ["Kochita","Yuzu, pear, ginger, lime, mint, lemon-lime soda",700],
        ["Sparkling Lemonade","Lemonade of the day, lemon-lime soda",700],
      ] },
      { name: "Draft Beers", items: [
        ["La Fin Du Monde","",900],
        ["Headland Point Bonita Pilsner","",700],
        ["Almanac Love Hazy IPA","",700],
      ] },
      { name: "Wine", items: [
        ["House Pinot Noir (Glass)","",800],
        ["House Pinot Noir (Bottle)","",3700],
        ["House Sauvignon Blanc (Glass)","",1000],
        ["House Sauvignon Blanc (Bottle)","",4000],
        ["House Rosé (Glass)","",900],
        ["House Rosé (Bottle)","",3500],
      ] },
      { name: "Cocktail Spritzers", items: [
        ["Lady Moon","Lychee, elderflower, lime",1200],
        ["Shitorasu","Kalamansi, sudachi, rosemary",1200],
        ["Guayaba","Guayaba, pineapple",1200],
        ["Kochi","Yuzu, pear, ginger, lime, mint",1200],
      ] },
    ],
    siteNote: "All prices came from the full text menu on Belly's own site at https://www.bellyrestaurants.com/menus. That page notes online ordering is also available via Toast (toasttab.com/belly), but prices here were read directly from Belly's own menu page, not from Toast.",
  },

  /*
     Benicia Grill — gathered 2026-09-09 from own-domain
     they are: Breakfast and lunch
     logo: http://www.benicia-grill.com/assets/images/logo/logo-white.jpg (166x161) — not cut into a tile yet
     flag: About, Menu, Gallery, Coupons and Contact all return byte-identical homepage HTML — the whole nav is one page
     flag: 'Order now' buttons link to '#'; 'Order Foods 24/7' contradicts the published 7am-2pm hours
     flag: lorem ipsum in the reservation section; the reservation dropdown offers 12am-3am slots when they are closed
     flag: the homepage featured dish 'Chicken Alfredo Fettuccine' is nowhere on the menu PDF
     flag: homepage says 'Benicia Grill 1', implying numbered locations, but none other is listed
     flag: the banquet room is bookable 6am-10pm
     flag: Menu sweep 2026-09-09, still no readable prices: Their own menu.pdf (linked from benicia-grill.com) was read in full (4 pages: cover/contact, Breakfast, numbered Sandwiches/Burgers 1-33, and Wraps/Salads/Fries & Sides/Kids Menu/Beverages/Desserts). No base item carries a printed price anywhere in it -- salads, wraps, sides, kids items, and beverag
     flag: Menu sweep 2026-09-09: menu.pdf lists item names/descriptions/numbers but prints no base prices for any dish -- salads/wraps/sides/kids/beverages show blank underscored price lines, suggesting a template menu with prices removed or handwritten in-store
     flag: Menu sweep 2026-09-09: Address is spelled two different ways on their own pages: homepage HTML shows '4760 E 2nd St, Benicia, CA 94510' while the PDF menu spells it out as '4760 East 2nd Street, Benicia, CA 94510' -- same address, different abbreviation
     flag: Menu sweep 2026-09-09: PDF also lists a fax number, 707.745.6737, distinct from the main phone 707.751.0155
     flag: Menu sweep 2026-09-09: Site separately mentions a banquet/private event room available 6am-10pm, wider than the 7am-2pm regular dining hours
     flag: Menu sweep 2026-09-09: No online ordering platform (Toast/Square/ChowNow) found on the site; menu is a downloadable PDF only
     flag: Menu sweep 2026-09-09: PDF is dated 'Rev. 7/2026' so it is presented as their current menu
  */
  'benicia-grill': {
    address: "4760 E 2nd St, Benicia, CA 94510",
    phone: "(707) 751-0155",
    hours: "Daily 7am-2pm",
    instagram: "benicia.grill",
    cuisine: "Breakfast and lunch",
    tagline: "A breakfast-and-lunch grill in Benicia since 2008 — 'fresh, hearty",
    photos: [
      {"src":"/food/benicia-grill-site-0-lg.webp","alt":"hero image","credit":"Their own photo, from benicia-grill.com"},
      {"src":"/food/benicia-grill-site-1-lg.webp","alt":"hero image","credit":"Their own photo, from benicia-grill.com"},
      {"src":"/food/benicia-grill-site-2-lg.webp","alt":"hero image","credit":"Their own photo, from benicia-grill.com"},
      {"src":"/food/benicia-grill-site-3-lg.webp","alt":"hero image","credit":"Their own photo, from benicia-grill.com"},
      {"src":"/food/benicia-grill-site-4-lg.webp","alt":"hero image","credit":"Their own photo, from benicia-grill.com"},
    ],
    contactOnly: "A breakfast-and-lunch grill in Benicia since 2008 — 'fresh, hearty. Their menu is a PDF with every price line left blank; only add-ons are priced.",
  },

  /*
     Bhan Mae Vane — gathered 2026-09-09 from own-domain
     they are: Modern Lao & Thai cuisine
     logo: https://static1.squarespace.com/static/5da923454173893f4e094cd2/t/5dade6113707f45fc261ce60/1571677727641/4074FCD7-CF55-489B-83FB-34B563D20F64.png?format=1500w (1500x600) — not cut into a tile yet
     flag: Operator's note: Alameda • Goods — Some place my daughter visits
     flag: Operator tagged it 'Goods', but this is a sit-down restaurant (the site's own tagline is 'MODERN LAO & THAI FOOD'; Instagram category 'Restaurant')
     flag: Hours agree everywhere on their own channels: site footer, Visit page and Instagram bio all say Tues–Sun 11am-3pm and 5pm-9pm, Mondays closed; the Visit page and Instagram bio both add last seating/dine-in 2:30pm (lunch) and 8:30pm (dinner), last takeout 2:45pm and 8:45pm
     flag: The $75 BMV Ultimate Papaya Platter is a standalone image block sitting between the Soup and Specialty Dishes sections with no section header of its own, so its section is left blank; its add-on proteins are +$8
     flag: No logo image in the site header (plain text 'Bhan Mae Vane'); logo_url is the site's og:image share banner (orange emblem, name and 'MODERN LAO & THAI CUISINE' on white with bamboo/wood-grain side borders). The URL ends in .png but the Squarespace CDN serves it as WebP, and the meta tag uses http:// although https works; the site favicon is a generic red chili-pepper icon (100x100), not the logo
     flag: Squarespace template leftovers: the Menu and Drink pages display 'This is the page description.', every page's footer has an empty 'Embed Block — Add an embed URL or code.', and the homepage meta description is blank
     flag: Footer copyright reads '© 2021, Bhan Mae Vane LLC' (stale year); the wine list carries 2012–2018 vintages with a note that the wine menu is 'subject to change', so drink prices may be dated
     flag: Online ordering is only a DoorDash partner link on the site's 'Door Dash' page (third-party, no prices taken from it); the site says catering and reservations are by phone only
     flag: Policies published on the Visit page: 18% gratuity for parties of 6 or more; reservations strongly preferred for parties larger than 8 and same-day reservations not usually taken; corkage $20 per bottle, four bottles max; gift cards sold in restaurant only; catering needs at least 2 days notice
     flag: Name variants: site title and Instagram name 'Bhan Mae Vane'; footer 'Bhan Mae Vane LLC'; the Facebook link on the Instagram profile reads 'Bhan Mae Vane Restaurant'
     flag: Our Story page names the owners as sisters Bebe Lach (Chef-Owner) and Thip Tran (Owner), cooking from their mother's recipes; no opening date is published
     flag: Not published anywhere on their own site or Instagram: opening year, parking info, a full catering menu; the menu page publishes 60-plus priced dishes plus a drink list, so items here are a 40-item selection of the base prices
  */
  'bhan-mae-vane': {
    address: "1511 Webster Street, Alameda, CA 94501",
    phone: "510-227-5197",
    email: "info@bhanmaevane.com",
    hours: "Tue-Sun 11am-3pm, 5pm-9pm, closed Mon",
    instagram: "bhanmaevane",
    cuisine: "Modern Lao & Thai cuisine",
    tagline: "Modern Lao & Thai restaurant on Webster Street in Alameda",
    sections: [
      { name: "Appetizers", items: [
        ["Fried Tofu","Served with Thai peanut sauce",1400],
        ["Eggrolls (Pork or Veggies)","Served with our sweet chili sauce, veggie or pork",1600],
        ["Chicken Satay","Grilled chicken skewers served with peanut sauce and cucumber sauce.",1800],
        ["Shrimp in a Blanket","Fried seasoned shrimps wrapped in eggroll wrapper served with sweet chili sauce",1800],
        ["Appetizer Sampler","Shrimp in a Blanket (4), Eggrolls (3), and Fried Tofu (8)",2400],
      ] },
      { name: "Salads", items: [
        ["Papaya Salad","Lao style - Hand shredded green papaya mixed with fresh Thai chili, tomatoes, lime juice, shrimp paste and anchovy dressing. Thai style - Hand shredded green papaya mixed with fresh Thai chili, tomatoes, lime juice and fish sauce dressing",1800],
        ["Laab Gai","Minced chicken and gizzards mixed with toasted rice powder, fresh herbs and lime dressing.",2000],
        ["Laab Seen","Lao Style - Sliced beef and tripe mixed with toasted rice powder, fresh herbs and lime dressing.",2200],
        ["Yum Talay (Seafood Salad)","Fresh shrimp and calamari mixed with fresh herbs and tossed with our chili lime sauce.",2600],
      ] },
      { name: "Soup", items: [
        ["Tom Yum","Spicy and sour soup with mushrooms and herbs (chicken / tofu / veggies / shrimp +2 / seafood +6)",2000],
        ["Tom Kha","Coconut soup with lemongrass, galangal, kaffir lime leaves and fresh mushrooms (chicken / tofu / veggie / shrimp +2 / seafood +6)",2000],
      ] },
      { name: "Menu", items: [
        ["BMV Ultimate Papaya Platter","Papaya Salad (Lao or Thai style), pork rinds, vermicelli noodles, cabbage and rice (steamed or sticky). 3 options of protein (Meats & BBQ). Options: Crispy Pork Belly / BBQ Pork Ribs / Fried Wings / Angel Wings / Spicy Wings / Lao Sausages / Beef Jerky / Beef Short Ribs +8",7500],
      ] },
      { name: "Specialty Dishes", items: [
        ["Sakoo","Steamed savory tapioca balls stuffed with ground pork, peanuts, sweet radishes and shallots. Served with lettuce, fried chili peppers, fried garlic, and fresh herbs.",2000],
        ["Nam Khao","Crispy rice salad tossed with preserved pork sausage, peanuts, green onions, and cilantro. Served with fried chili peppers, lettuce, mint, and cilantro.",2000],
        ["Fresh Lao Spring Rolls","Choice of grilled beef, shrimp, crispy pork belly, or tofu wrapped in rice paper with fresh herbs and lettuce. Served with pineapple anchovy sauce, sweet fish sauce & peanut sauce. Combo shrimp & beef +$4",1800],
        ["Aou Nuer","Stewed beef with lemongrass, fresh herbs, mushrooms, and Thai eggplant.",2200],
        ["Mok Pla","Basa fish with herbs steamed in banana leaves. Served with steamed vegetables and Laotian tomato sauce.",2500],
        ["Fried Clear Rice Roll Wraps","Our signature fried rice paper egg rolls with pork. Served with our sweet fish sauce, lettuce, herbs, and vermicelli noodles.",2000,null,"signature"],
        ["Phatty Special","Shrimp garlic noodles with a strip of crispy pork belly and your choice of (4 pieces) fried, angel or spicy chicken wings.",3800],
      ] },
      { name: "Meat", items: [
        ["Seen Lod (Lao Beef Jerky)","Beef jerky served with Laotian roasted tomato sauce and steam vegetables.",2000],
        ["Sai Oua (Lao Sausages)","Spicy pork sausage with herbs served with Laotian tomato sauce.",2000],
        ["Crispy Pork Belly","Fried pork belly served with chili lime sauce.",2200],
        ["BBQ Pork Ribs","Grilled lemongrass marinated pork spareribs served with chili lime sauce.",2200],
        ["BBQ Beef Short Ribs","Grilled marinated beef short ribs served with chili lime sauce.",2800],
        ["Fried Wings","Lightly battered and seasoned crispy fried wings (8)",1800],
        ["Angel Wings","Lightly battered crispy fried wings tossed with our special sweet chili sauce (8)",1800],
        ["Spicy Wings","Lightly battered crispy fried wings tossed with our special sweet and spicy chili sauce mix (8)",1800],
        ["Combo Wings Platter","Fried Wings (7) Angel Wings (7) Spicy Wings (7)",4600],
      ] },
      { name: "Entrees", items: [
        ["Pad Ka Pow","Wok fried basil, mushrooms, bell peppers, and onions with choice of protein.",2000],
      ] },
      { name: "Fried Rice and Noodle Dishes", items: [
        ["Garlic Noodles","Wok fried egg noodles with garlic and butter.",1800],
        ["Pad Thai","Wok fried thin rice noodles with tamarind sauce, tofu, eggs, bean sprouts and green onions.",2000],
        ["Pad Kee Mao","Wok fried flat wide rice noodles with spicy basil sauce, onions, broccoli, bell peppers and fresh basil.",2000],
      ] },
      { name: "Noodle Soup", items: [
        ["Khao Piek","Fresh handmade noodles with chicken in savory chicken broth. Choice of pork blood optional.",1800],
        ["Khao Soy","Fermented spicy bean paste cooked with ground pork and fresh tomatoes served with flat wide rice noodles, sliced beef and pork meatballs.",2000],
        ["Khao Poon Gai","Laotian curry chicken vermicelli noodle soup. Contains bamboo shoots and quail eggs. Choice of pork blood optional.",2000],
        ["Pho E-Lao","Laotian style beef rice noodle soup with sliced beef and pork meatballs, beef tripe optional.",2000],
      ] },
      { name: "Curries", items: [
        ["Geng Dang (Red Curry)","Coconut milk red curry simmered with onions, bamboo shoots, bell peppers and basil with choice of protein.",2000],
      ] },
      { name: "Dessert", items: [
        ["Sticky Rice with Mango","Sticky rice with sweet coconut milk topped with mangoes and toasted sesame seeds",1000],
        ["Purple Rice with Egg Custard","Purple rice with sweet coconut milk topped with our special egg custard and toasted sesame seeds",1000],
      ] },
      { name: "Specialty Drinks (Non-Alcoholic Beverages)", items: [
        ["Thai Iced Tea","",500],
      ] },
    ],
    siteNote: "Base prices from the Menu and Drink pages of bhanmaevane.com (entrees, fried rice/noodles and curries add beef +$3, shrimp +$4, shrimp & calamari +$8; soups shrimp +$2, seafood +$6); hours from the Visit page and site footer, matching the Instagram bio.",
  },

  /*
     Bloom Balloon — gathered 2026-09-09 from own-domain
     their spelling: "BLOOM BALLOON" (roster keeps "Bloom Balloon")
     they are: Balloon decor
     logo: https://static.tildacdn.net/tild6230-3234-4430-b835-343032333532/logo_Bloom_Balloon_r.jpeg (1680x1711) — not cut into a tile yet
     flag: no street address or phone published; 'We provide decorations throughout the SF Bay Area'
     flag: nav typo 'GET YOUR QOUTE!' and an untranslated Russian 'Шаг:' (Step) in the quote form
     flag: run by Sergey and Marina, per the site
  */
  'bloom-balloon': {
    email: "sales@bloomballoon.com",
    instagram: "bloom_balloon.bayarea",
    cuisine: "Balloon decor",
  },

  /*
     Boba Club — gathered 2026-09-09 from ordering-platform
     they are: Milk Tea & Sandwiches
     flag: Neither screenshot shows an address, phone or hours; both are of the Instagram profile @bobaclub2025 (the second is a zoomed crop of that same profile, not the ordering page's header)
     flag: Instagram bio lists 'pos.chowbus.com/online-or... and 1 more' - the second link is not visible in the screenshot, so it is unknown
     flag: Ordering page prints closing time as 07:59 PM every day; recorded as published (7:59pm), not rounded to 8pm
     flag: Menu item names are printed in lowercase on the ordering page and transcribed as-is, including the spelling 'avacado mango smoothie'; names and prices came through WebFetch text extraction, not a browser render, so casing should be spot-checked before publishing
     flag: Ordering page showed status 'Closed' at fetch time; not verified whether that is outside-hours or a temporary closure
     flag: No email published anywhere
     flag: No logo URL captured; the logo (blue-haired cartoon character with a boba cup, text 'BOBA CLUB / MILK TEA & SANDWICHES') is only seen in the Instagram screenshot
     flag: Instagram bio also advertises 'Catering | Events' with no details or pricing published
     flag: the operator's exact note: Needs Website — Livermore • Goods
  */
  'boba-club': {
    address: "909 Bluebell Drive, Livermore, CA, 94551",
    phone: "+1 (510) 999-2687",
    hours: "Daily 11am-7:59pm",
    instagram: "bobaclub2025",
    cuisine: "Milk Tea & Sandwiches",
    tagline: "Milk tea, smoothies and bánh mì sandwiches in Livermore, California",
    sections: [
      { name: "New Drinks", items: [
        ["chocolate strawberry milk","",750],
        ["ice coffee latte","",750],
        ["pistachio latte","",850],
        ["taro coconut milk","",750],
        ["watermelon fruit tea","",750],
      ] },
      { name: "Combo Specials", items: [
        ["combo - milk tea & banh mi","",1495],
        ["combo - smoothie & banh mi","",1595],
        ["combo - tea gurt & banh mi","",1595],
        ["combo - fruit tea & banh mi","",1495],
        ["combo - matcha latte & banh mi","",1595],
      ] },
      { name: "Milk Tea", items: [
        ["brown sugar milk tea","",750],
        ["jasmine milk tea","",750],
        ["taro milk tea","",750],
        ["mint oreo milk tea","",750],
        ["biscoff cookie milk tea","",750],
        ["thai milk tea","",750],
      ] },
      { name: "Smoothie", items: [
        ["strawberry smoothie","",850],
        ["avacado mango smoothie","",850],
        ["black sesame smoothie","",850],
        ["ube smoothie","",850],
      ] },
      { name: "Tea & Yogurt", items: [
        ["strawberry teagurt","",850],
        ["mango teagurt","",850],
      ] },
      { name: "Matcha Latte", items: [
        ["strawberry matcha latte","",850],
        ["banana matcha latte","",850],
      ] },
      { name: "Fruit Tea", items: [
        ["passion fruit tea","",750],
        ["mango fruit tea","",750],
        ["strawberry mojito","",750],
      ] },
      { name: "Sandwiches - Bánh Mì", items: [
        ["b.b.q. pork belly banh mi","",895],
        ["grilled pork banh mi","",895],
        ["grilled chicken banh mi","",895],
        ["cold cut combo w pork pate banh mi","",895],
      ] },
    ],
    siteNote: "Prices, address, phone and hours are from their Chowbus online-ordering page; every price there carries a '+', the base before a size or add-on, so the figures here are starting prices.",
  },

  /*
     Bober Tea & Mochi — gathered 2026-09-09 from own-domain
     their spelling: "Bober Tea & Coffee" (roster keeps "Bober Tea & Mochi")
     they are: Boba and mochi donuts
     logo: https://framerusercontent.com/images/MqLkWIPHQiotmvGb9mJ1AyXfWc8.png (500x500) — not cut into a tile yet
     flag: twenty-plus locations; the Martinez one is the roster seat. Other Bay Area shops: Pleasanton (925) 201-3893, San Ramon (925) 361-8528, San Carlos (650) 226-5552, Walnut Creek (925) 395-1344, Livermore (925) 800-7822
     flag: leftover template copy in the footer: 'Unwind and savor the burger bliss' on a boba site
     flag: a placeholder 'info@email.com' sits beside the real address
     flag: testimonials use generic full names with no dates
     flag: Menu sweep 2026-09-09, still no readable prices: boberteaus.com/Menu lists item names by series (Brown Sugar, Milk Tea, Chizu/Cheese, Vietnamese Coffee, Mochi Donut) but no prices appear anywhere in the fetched page text for the homepage, /menu, or /Menu URLs, so no priced items could be recorded for the Martinez location.
     flag: Menu sweep 2026-09-09: Homepage's main contact block shows a San Ramon address (21001 San Ramon Valley Blvd, E4, San Ramon CA 94583); the Martinez-specific address was only found on the separate /locations page
     flag: Menu sweep 2026-09-09: Menu item names found with no prices: Brown Sugar Milk Tea, Brown Sugar Creme Brulee, Brown Sugar Cookies, Brown Sugar Matcha Latte, Classic Milk Tea, Hazelnut/Jasmine/Roasted Oolong/Honey/Signature Milk Tea, Chizu Green Tea/Mango Green Tea/Matcha Latte/Milk Tea/Strawberry Green Tea, Coconut/Custard
     flag: Menu sweep 2026-09-09: No Instagram or other social link found anywhere on the site
     flag: Menu sweep 2026-09-09: info@boberteaus.com is a general company-wide contact email, not specific to the Martinez location
     flag: Menu sweep 2026-09-09: This is a chain with 30+ locations across multiple US states plus one in India
  */
  'bober-tea': {
    address: "1029 Arnold Dr, Ste 10, Martinez, CA 94553",
    email: "info@boberteaus.com",
    hours: "Daily 10am-9pm",
    instagram: "bober_teaus",
    cuisine: "Boba and mochi donuts",
    tagline: "A boba chain that 'started in Singapore' — brown sugar, cheese-foam,",
    photos: [
      {"src":"/food/bober-tea-site-2-lg.webp","alt":"","credit":"Their own photo, from boberteaus.com"},
      {"src":"/food/bober-tea-site-5-lg.webp","alt":"","credit":"Their own photo, from boberteaus.com"},
      {"src":"/food/bober-tea-site-6-lg.webp","alt":"","credit":"Their own photo, from boberteaus.com"},
      {"src":"/food/bober-tea-site-11-lg.webp","alt":"","credit":"Their own photo, from boberteaus.com"},
      {"src":"/food/bober-tea-site-13-lg.webp","alt":"","credit":"Their own photo, from boberteaus.com"},
      {"src":"/food/bober-tea-site-15-lg.webp","alt":"","credit":"Their own photo, from boberteaus.com"},
    ],
    contactOnly: "A boba chain that 'started in Singapore' — brown sugar, cheese-foam,. The menu page lists drink and donut names only — no prices anywhere on the site.",
  },

  /*
     Bodylines Day Spa — gathered 2026-09-09 from own-domain
     they are: Day spa
     flag: leftover Wix duplicate pages: 'Copy of Home' is a visible nav item, and live service URLs use 'copy-of-' slugs
     flag: a bare Constant Contact signup URL is pasted as stray text into the page head
     flag: the hero says 'Bodylines Day Spa & Wellness Center' while the title and footer say 'Bodylines Day Spa'
     flag: no logo asset; the favicon is the Wix default
  */
  'bodylines-day-spa': {
    address: "2330 San Ramon Valley Boulevard, San Ramon, CA 94583",
    phone: "(925) 837-8895",
    email: "contact@bodylinesdayspa.com",
    hours: "Tue 12-8:30pm, Wed-Thu 10am-8:30pm, Fri 9am-8:30pm, Sat 9am-6pm, Sun 10am-5:30pm, closed Mon",
    instagram: "bodylinesdayspa",
    cuisine: "Day spa",
    groups: [
      { name: "Prices, from", items: [
        ["Swedish Massage, 30 min focus","Relaxation and stress reduction, light to medium pressure",8500],
        ["Swedish Massage, 60 min","Club members $105",12500],
        ["Deep Tissue, 60 min","Club members $120",14000],
        ["Prenatal, 60 min","After the first trimester; club members $110",12500],
        ["Full-Body Hot Stone, 60 min","Club members $145",16000],
        ["Reflexology, 30 min","",8000],
        ["Lymphatic Drainage, 60 min","Club members $120",13500],
        ["Couples Swedish, 60 min","Side by side in the same room",12500,"$125 a person"],
      ] },
    ],
    quoteOnly: "A San Ramon 'Relaxation Destination' for facials, therapeutic massage and customised skincare, with certified therapists. Two-tier pricing on most services — a lower Club member rate beside the non-member rate shown here.",
  },

  /*
     BODYROK East Bay — gathered 2026-09-09 from own-domain — BLOCKED: Mindbody store and schedule pages (clients.mindbodyonline.com, studioid=283626) returned HTTP 403 'Security Check' to WebFetch and to curl; they were read instead in the real browser pane, so all Mindbody facts above come from the rendered pages on 2026-09-07. The two t.bodyrok.com tracking links returned 405 to HEAD; on GET one redirected to the Mindbody Walnut Creek community-events schedule (also 403 to curl) and the other to a Google Form. Instagram was not fetched; its facts come from the operator's four screenshots.
     they are: Reformer Pilates studio
     logo: https://bodyrok.com/wp-content/uploads/2024/07/Logo-large-1024x135.png (1024x135) — not cut into a tile yet
     flag: The operator's exact note: Multiple locations
     flag: Name is spelled differently on their own properties: brand site pages just say 'BODYROK'; their Mindbody booking site is titled 'BODYROK - East Bay'; the Instagram display name is 'BODYROK EASTBAY' (handle bodyrokeastbay); the round avatar logo reads 'BODYROK EAST BAY'; the operator wrote 'BodyRok East Bay'. 'BODYROK East Bay' used here.
     flag: Six East Bay studio pages exist but only four are open. Walnut Creek (1380 North California Boulevard) says 'Opening Late Summer 2026' and the studios index labels it 'Coming Soon'; Lafayette (971 Moraga Rd) says 'Opening Fall 2026' and is labeled 'Coming Soon' on the index. Their addresses are in locations only and were left out of the top-level address so a card does not show unopened studios.
     flag: Linktree bio has a typo 'ROCKRDIGE' and says only 'WALNUT CREEK COMING SOON!', while the Instagram bio says 'Coming Soon: Walnut Creek & Lafayette'.
     flag: No phone number appears on any bodyrok.com studio page or on the Mindbody store. The only number published is the Instagram Contact sheet's 'Text (510) 900-9234', which is a text line for the whole East Bay group, so every per-studio phone is null.
     flag: No opening hours are published on the site, linktree, Instagram or Mindbody; only class schedules. For reference, class start times on the Mindbody schedule for the week of Sept 7-13 2026 (Mon Sept 7 was a holiday short schedule): Berkeley Tue-Thu 6:30am-6:30pm, Fri 6:30am-5:30pm, Sat 7am-12pm, Sun 8am-12pm; Oakland Lakeshore Tue-Thu 6:00am-7:30pm, Fri 6:00am-6:30pm, Sat-Sun 7am-12pm; Alamo from 6:00am Tue-Fri with last classes 5:30pm Tue, 6:30pm Wed, 12pm Thu, 1pm Fri, Sat-Sun 7-11am; Rockridge Tue and Thu 6:30am-6:30pm, Fri 6:30am-5:30pm, no classes Wed Sept 9, Sat 8-11am, Sun 8am-12pm. Classes are 45 minutes.
     flag: The studio pages link to Instagram @bodyrokstudio (the brand account), not @bodyrokeastbay.
     flag: Wording differs between studio pages while prices are identical: intro first item is 'First Class' on Berkeley and Rockridge but '1 Class' on Alamo and Oakland; section is 'Class Packages' on Berkeley and Oakland but 'Class Packs' on Alamo and Rockridge; validity reads '30 Day Expiration' vs 'Valid For 30 Days' and 'Valid For 6 Months' vs '6 Month Expiration'.
     flag: Addresses are inconsistently formatted on their site: Alamo, Rockridge, Walnut Creek and Lafayette have no ZIP code and end in ', USA'; Oakland spells out 'California'; Alamo's '170f Alamo Plaza' uses a lowercase suite letter. Kept exactly as published.
     flag: Rockridge is a neighborhood of Oakland, so there are two Oakland-addressed studios (3303 Lakeshore Ave and 5901 College Avenue); Instagram and the site list 'Oakland' and 'Rockridge' as separate studios.
     flag: Linktree button 'BUY YOUR ROCKRIDGE FOUNDING MEMBERSHIP' points to Mindbody prodId=205, which no longer resolves to any contract (the store only offers the four EastBay Access memberships and four Walnut Creek founding memberships) and the Rockridge page says 'now open' with standard prices, so that button looks stale.
     flag: Other stale linktree buttons: 'SIGN UP FOR ROCKRIDGE CLASSES!' carries a hard-coded schedule date 05/09/26; 'FREE Pilates in the Park with Kelsey - 8/30!' (t.bodyrok.com link resolving to the Mindbody schedule for location 5 'Walnut Creek', category 'Community Events') is a past event; 'August Promo- Get your membership now' was still up in September.
     flag: Walnut Creek founding prices ($83.30, $132.30, $167.30, $195.30) are exactly 30% off the standard $119, $189, $239, $279 tiers; Mindbody says 'lock in your 30% discount for the life of your Walnut Creek only membership', founding members pay a '$25 drop-in rate per class' at the other East Bay studios until opening, and the pinned Instagram post says 'LAST CALL 30% OFF FOUNDING MEMBERSHIPS'.
     flag: Memberships are named 'EastBay Access- Recurring ... (no commitment)' on Mindbody, yet the contract reads '$119.00 every month for 12 months' and 'auto-renews every 12 months until you cancel' with a 30-day written cancellation notice. Memberships are valid at Alamo, Berkeley, Oakland, Rockridge and Walnut Creek; extra classes $25 each; late cancel $15.
     flag: No-show penalty contradicts itself: the studio pages say a $20 charge on unlimited plans, while the Mindbody Unlimited contract says 'you will incur a $25 No Show Fee'.
     flag: Items on the Mindbody store that bodyrok.com does not show: 2 Weeks Unlimited $79, ROK 1 Month Unlimited (no contract) $349, three Back To School bonus packs expiring 12/5/2026, Special Event- Non-Member $20 and $10 Community class ONLY. The 'Community Events (out of studio)' category cannot be bought online and a 'Privates' category exists on the schedule filter with no price published.
     flag: The brand home page says 'Generally a drop in class starts at around $30 (depending on location)', but the East Bay drop-in is $38.
     flag: Only the black 'BODYROK' wordmark is hosted on their own domain (a white variant is at https://bodyrok.com/wp-content/uploads/2024/07/logo-white-1024x134.png, 1024x134); the round 'BODYROK EAST BAY' badge exists only as the Instagram and linktree avatar, hosted by those platforms.
     flag: Per-studio emails on their site: berkeley@bodyrok.com, alamo@bodyrok.com, oakland@bodyrok.com, rockridge@bodyrok.com, walnutcreek@bodyrok.com, lafayette@bodyrok.com, plus brand info@bodyrok.com; Instagram's Contact sheet shows berkeley@BODYROK.com, which is why it is the top-level email.
     flag: The operator sent a linktree; its 'Our Website' button goes to the brand's bodyrok.com/studios/ index, and booking and purchases run on Mindbody (clients.mindbodyonline.com, site ID 283626). site_kind is own-domain because the addresses and prices live on bodyrok.com.
  */
  'bodyrok-alamo': {
    address: "170f Alamo Plaza, Alamo, CA, USA",
    phone: "(510) 900-9234",
    email: "alamo@bodyrok.com",
    instagram: "bodyrokeastbay",
    cuisine: "Reformer Pilates studio",
    tagline: "Reformer Pilates studio at Alamo Plaza",
    groups: [
      { name: "Prices, from", items: [
        ["First Class","Intro offer, 30 Day Expiration; Alamo and Oakland pages call it '1 Class'; Mindbody name 'INTRO SPECIAL - $20 First Visit'",2000,"$20"],
        ["5 Classes","Intro offer, 30 Day Expiration; Mindbody name 'INTRO SPECIAL- 5 classes for $99 (1mth exp)'",9900,"$99"],
        ["Unlimited","Intro offer: first month unlimited, 1 class per day, expires 30 days from first use; Mindbody name 'INTRO SPECIAL 1st MTH(1x day) $149'",14900,"$149"],
        ["INTRO SPECIAL 2 Weeks Unlimited (1X Day) $79","Expiration Date: 14 days from first use; listed on their Mindbody store only, not on bodyrok.com",7900,"$79"],
        ["1 Class","Drop-in, Valid For 6 Months; Mindbody name 'ROK Group- 1 session'",3800,"$38"],
        ["5 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 5 Sessions'",16900,"$169"],
        ["10 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 10 Sessions'",29900,"$299"],
        ["20 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 20 Sessions'",54900,"$549"],
        ["ROK 1 Month Unlimited (no contract)","One month unlimited, no contract; expiration one month from purchase; Mindbody store only",34900,"$349"],
        ["4x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 4X Mth (no commitment)': $119.00 every month, valid at Alamo, Berkeley, Oakland, Rockridge, Walnut Creek; extra classes $25 each",11900,"$119/mo"],
        ["8x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 8X Mth (no commitment)': $189.00 every month",18900,"$189/mo"],
        ["12x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 12X Mth (no commitment)': $239.00 every month",23900,"$239/mo"],
        ["Unlimited","Membership, 30 Day Cancellation, max 1 class per day; Mindbody contract 'EastBay Access- Recurring Unlimited, 1X Day': $279.00 every month",27900,"$279/mo"],
        ["WALNUT CREEK 4X Mth Founding Membership","Walnut Creek page lists it as '4x A Month' under 'Founding Memberships - Lock Your Rate In For Life'; $83.30 every month, Walnut Creek only, activates when the studio opens",8330,"$83.30/mo"],
        ["WALNUT CREEK 8X Mth Founding Membership","Walnut Creek page: '8x A Month'; $132.30 every month",13230,"$132.30/mo"],
        ["WALNUT CREEK 12X Mth Founding Membership","Walnut Creek page: '12x A Month'; $167.30 every month",16730,"$167.30/mo"],
        ["WALNUT CREEK Founding Member- Unlimited (1X Day)","Walnut Creek page: 'Unlimited'; $195.30 every month",19530,"$195.30/mo"],
        ["Back To School- 5 +1 FREE $169 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",16900,"$169"],
        ["Back to School- 10 +2 FREE $299 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",29900,"$299"],
        ["Back To School- 20 +4 FREE- $549 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",54900,"$549"],
        ["Special Event- Non-Member","Mindbody 'Special Event Classes' category",2000,"$20"],
        ["$10 Community class ONLY","Mindbody 'COMMUNITY Sculpt Classes' category",1000,"$10"],
      ] },
    ],
    quoteOnly: "Reformer Pilates studio at Alamo Plaza. Prices from the bodyrok.com studio pages (identical on Berkeley, Alamo, Oakland and Rockridge; Walnut Creek founding rates on its own page) and confirmed item-by-item on their Mindbody store (site ID 283626, read in the browser on 2026-09-07); no opening hours are published anywhere, only class schedules on Mindbody.",
  },

  /*
     BODYROK East Bay — gathered 2026-09-09 from own-domain — BLOCKED: Mindbody store and schedule pages (clients.mindbodyonline.com, studioid=283626) returned HTTP 403 'Security Check' to WebFetch and to curl; they were read instead in the real browser pane, so all Mindbody facts above come from the rendered pages on 2026-09-07. The two t.bodyrok.com tracking links returned 405 to HEAD; on GET one redirected to the Mindbody Walnut Creek community-events schedule (also 403 to curl) and the other to a Google Form. Instagram was not fetched; its facts come from the operator's four screenshots.
     they are: Reformer Pilates studio
     logo: https://bodyrok.com/wp-content/uploads/2024/07/Logo-large-1024x135.png (1024x135) — not cut into a tile yet
     flag: The operator's exact note: Multiple locations
     flag: Name is spelled differently on their own properties: brand site pages just say 'BODYROK'; their Mindbody booking site is titled 'BODYROK - East Bay'; the Instagram display name is 'BODYROK EASTBAY' (handle bodyrokeastbay); the round avatar logo reads 'BODYROK EAST BAY'; the operator wrote 'BodyRok East Bay'. 'BODYROK East Bay' used here.
     flag: Six East Bay studio pages exist but only four are open. Walnut Creek (1380 North California Boulevard) says 'Opening Late Summer 2026' and the studios index labels it 'Coming Soon'; Lafayette (971 Moraga Rd) says 'Opening Fall 2026' and is labeled 'Coming Soon' on the index. Their addresses are in locations only and were left out of the top-level address so a card does not show unopened studios.
     flag: Linktree bio has a typo 'ROCKRDIGE' and says only 'WALNUT CREEK COMING SOON!', while the Instagram bio says 'Coming Soon: Walnut Creek & Lafayette'.
     flag: No phone number appears on any bodyrok.com studio page or on the Mindbody store. The only number published is the Instagram Contact sheet's 'Text (510) 900-9234', which is a text line for the whole East Bay group, so every per-studio phone is null.
     flag: No opening hours are published on the site, linktree, Instagram or Mindbody; only class schedules. For reference, class start times on the Mindbody schedule for the week of Sept 7-13 2026 (Mon Sept 7 was a holiday short schedule): Berkeley Tue-Thu 6:30am-6:30pm, Fri 6:30am-5:30pm, Sat 7am-12pm, Sun 8am-12pm; Oakland Lakeshore Tue-Thu 6:00am-7:30pm, Fri 6:00am-6:30pm, Sat-Sun 7am-12pm; Alamo from 6:00am Tue-Fri with last classes 5:30pm Tue, 6:30pm Wed, 12pm Thu, 1pm Fri, Sat-Sun 7-11am; Rockridge Tue and Thu 6:30am-6:30pm, Fri 6:30am-5:30pm, no classes Wed Sept 9, Sat 8-11am, Sun 8am-12pm. Classes are 45 minutes.
     flag: The studio pages link to Instagram @bodyrokstudio (the brand account), not @bodyrokeastbay.
     flag: Wording differs between studio pages while prices are identical: intro first item is 'First Class' on Berkeley and Rockridge but '1 Class' on Alamo and Oakland; section is 'Class Packages' on Berkeley and Oakland but 'Class Packs' on Alamo and Rockridge; validity reads '30 Day Expiration' vs 'Valid For 30 Days' and 'Valid For 6 Months' vs '6 Month Expiration'.
     flag: Addresses are inconsistently formatted on their site: Alamo, Rockridge, Walnut Creek and Lafayette have no ZIP code and end in ', USA'; Oakland spells out 'California'; Alamo's '170f Alamo Plaza' uses a lowercase suite letter. Kept exactly as published.
     flag: Rockridge is a neighborhood of Oakland, so there are two Oakland-addressed studios (3303 Lakeshore Ave and 5901 College Avenue); Instagram and the site list 'Oakland' and 'Rockridge' as separate studios.
     flag: Linktree button 'BUY YOUR ROCKRIDGE FOUNDING MEMBERSHIP' points to Mindbody prodId=205, which no longer resolves to any contract (the store only offers the four EastBay Access memberships and four Walnut Creek founding memberships) and the Rockridge page says 'now open' with standard prices, so that button looks stale.
     flag: Other stale linktree buttons: 'SIGN UP FOR ROCKRIDGE CLASSES!' carries a hard-coded schedule date 05/09/26; 'FREE Pilates in the Park with Kelsey - 8/30!' (t.bodyrok.com link resolving to the Mindbody schedule for location 5 'Walnut Creek', category 'Community Events') is a past event; 'August Promo- Get your membership now' was still up in September.
     flag: Walnut Creek founding prices ($83.30, $132.30, $167.30, $195.30) are exactly 30% off the standard $119, $189, $239, $279 tiers; Mindbody says 'lock in your 30% discount for the life of your Walnut Creek only membership', founding members pay a '$25 drop-in rate per class' at the other East Bay studios until opening, and the pinned Instagram post says 'LAST CALL 30% OFF FOUNDING MEMBERSHIPS'.
     flag: Memberships are named 'EastBay Access- Recurring ... (no commitment)' on Mindbody, yet the contract reads '$119.00 every month for 12 months' and 'auto-renews every 12 months until you cancel' with a 30-day written cancellation notice. Memberships are valid at Alamo, Berkeley, Oakland, Rockridge and Walnut Creek; extra classes $25 each; late cancel $15.
     flag: No-show penalty contradicts itself: the studio pages say a $20 charge on unlimited plans, while the Mindbody Unlimited contract says 'you will incur a $25 No Show Fee'.
     flag: Items on the Mindbody store that bodyrok.com does not show: 2 Weeks Unlimited $79, ROK 1 Month Unlimited (no contract) $349, three Back To School bonus packs expiring 12/5/2026, Special Event- Non-Member $20 and $10 Community class ONLY. The 'Community Events (out of studio)' category cannot be bought online and a 'Privates' category exists on the schedule filter with no price published.
     flag: The brand home page says 'Generally a drop in class starts at around $30 (depending on location)', but the East Bay drop-in is $38.
     flag: Only the black 'BODYROK' wordmark is hosted on their own domain (a white variant is at https://bodyrok.com/wp-content/uploads/2024/07/logo-white-1024x134.png, 1024x134); the round 'BODYROK EAST BAY' badge exists only as the Instagram and linktree avatar, hosted by those platforms.
     flag: Per-studio emails on their site: berkeley@bodyrok.com, alamo@bodyrok.com, oakland@bodyrok.com, rockridge@bodyrok.com, walnutcreek@bodyrok.com, lafayette@bodyrok.com, plus brand info@bodyrok.com; Instagram's Contact sheet shows berkeley@BODYROK.com, which is why it is the top-level email.
     flag: The operator sent a linktree; its 'Our Website' button goes to the brand's bodyrok.com/studios/ index, and booking and purchases run on Mindbody (clients.mindbodyonline.com, site ID 283626). site_kind is own-domain because the addresses and prices live on bodyrok.com.
  */
  'bodyrok-berkeley': {
    address: "1601 University Avenue, Berkeley, CA 94703",
    phone: "(510) 900-9234",
    email: "berkeley@bodyrok.com",
    instagram: "bodyrokeastbay",
    cuisine: "Reformer Pilates studio",
    tagline: "Reformer Pilates studio on University Ave in Berkeley",
    groups: [
      { name: "Prices, from", items: [
        ["First Class","Intro offer, 30 Day Expiration; Alamo and Oakland pages call it '1 Class'; Mindbody name 'INTRO SPECIAL - $20 First Visit'",2000,"$20"],
        ["5 Classes","Intro offer, 30 Day Expiration; Mindbody name 'INTRO SPECIAL- 5 classes for $99 (1mth exp)'",9900,"$99"],
        ["Unlimited","Intro offer: first month unlimited, 1 class per day, expires 30 days from first use; Mindbody name 'INTRO SPECIAL 1st MTH(1x day) $149'",14900,"$149"],
        ["INTRO SPECIAL 2 Weeks Unlimited (1X Day) $79","Expiration Date: 14 days from first use; listed on their Mindbody store only, not on bodyrok.com",7900,"$79"],
        ["1 Class","Drop-in, Valid For 6 Months; Mindbody name 'ROK Group- 1 session'",3800,"$38"],
        ["5 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 5 Sessions'",16900,"$169"],
        ["10 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 10 Sessions'",29900,"$299"],
        ["20 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 20 Sessions'",54900,"$549"],
        ["ROK 1 Month Unlimited (no contract)","One month unlimited, no contract; expiration one month from purchase; Mindbody store only",34900,"$349"],
        ["4x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 4X Mth (no commitment)': $119.00 every month, valid at Alamo, Berkeley, Oakland, Rockridge, Walnut Creek; extra classes $25 each",11900,"$119/mo"],
        ["8x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 8X Mth (no commitment)': $189.00 every month",18900,"$189/mo"],
        ["12x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 12X Mth (no commitment)': $239.00 every month",23900,"$239/mo"],
        ["Unlimited","Membership, 30 Day Cancellation, max 1 class per day; Mindbody contract 'EastBay Access- Recurring Unlimited, 1X Day': $279.00 every month",27900,"$279/mo"],
        ["WALNUT CREEK 4X Mth Founding Membership","Walnut Creek page lists it as '4x A Month' under 'Founding Memberships - Lock Your Rate In For Life'; $83.30 every month, Walnut Creek only, activates when the studio opens",8330,"$83.30/mo"],
        ["WALNUT CREEK 8X Mth Founding Membership","Walnut Creek page: '8x A Month'; $132.30 every month",13230,"$132.30/mo"],
        ["WALNUT CREEK 12X Mth Founding Membership","Walnut Creek page: '12x A Month'; $167.30 every month",16730,"$167.30/mo"],
        ["WALNUT CREEK Founding Member- Unlimited (1X Day)","Walnut Creek page: 'Unlimited'; $195.30 every month",19530,"$195.30/mo"],
        ["Back To School- 5 +1 FREE $169 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",16900,"$169"],
        ["Back to School- 10 +2 FREE $299 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",29900,"$299"],
        ["Back To School- 20 +4 FREE- $549 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",54900,"$549"],
        ["Special Event- Non-Member","Mindbody 'Special Event Classes' category",2000,"$20"],
        ["$10 Community class ONLY","Mindbody 'COMMUNITY Sculpt Classes' category",1000,"$10"],
      ] },
    ],
    quoteOnly: "Reformer Pilates studio on University Ave in Berkeley. Prices from the bodyrok.com studio pages (identical on Berkeley, Alamo, Oakland and Rockridge; Walnut Creek founding rates on its own page) and confirmed item-by-item on their Mindbody store (site ID 283626, read in the browser on 2026-09-07); no opening hours are published anywhere, only class schedules on Mindbody.",
  },

  /*
     BODYROK East Bay — gathered 2026-09-09 from own-domain — BLOCKED: Mindbody store and schedule pages (clients.mindbodyonline.com, studioid=283626) returned HTTP 403 'Security Check' to WebFetch and to curl; they were read instead in the real browser pane, so all Mindbody facts above come from the rendered pages on 2026-09-07. The two t.bodyrok.com tracking links returned 405 to HEAD; on GET one redirected to the Mindbody Walnut Creek community-events schedule (also 403 to curl) and the other to a Google Form. Instagram was not fetched; its facts come from the operator's four screenshots.
     they are: Reformer Pilates studio
     logo: https://bodyrok.com/wp-content/uploads/2024/07/Logo-large-1024x135.png (1024x135) — not cut into a tile yet
     flag: The operator's exact note: Multiple locations
     flag: Name is spelled differently on their own properties: brand site pages just say 'BODYROK'; their Mindbody booking site is titled 'BODYROK - East Bay'; the Instagram display name is 'BODYROK EASTBAY' (handle bodyrokeastbay); the round avatar logo reads 'BODYROK EAST BAY'; the operator wrote 'BodyRok East Bay'. 'BODYROK East Bay' used here.
     flag: Six East Bay studio pages exist but only four are open. Walnut Creek (1380 North California Boulevard) says 'Opening Late Summer 2026' and the studios index labels it 'Coming Soon'; Lafayette (971 Moraga Rd) says 'Opening Fall 2026' and is labeled 'Coming Soon' on the index. Their addresses are in locations only and were left out of the top-level address so a card does not show unopened studios.
     flag: Linktree bio has a typo 'ROCKRDIGE' and says only 'WALNUT CREEK COMING SOON!', while the Instagram bio says 'Coming Soon: Walnut Creek & Lafayette'.
     flag: No phone number appears on any bodyrok.com studio page or on the Mindbody store. The only number published is the Instagram Contact sheet's 'Text (510) 900-9234', which is a text line for the whole East Bay group, so every per-studio phone is null.
     flag: No opening hours are published on the site, linktree, Instagram or Mindbody; only class schedules. For reference, class start times on the Mindbody schedule for the week of Sept 7-13 2026 (Mon Sept 7 was a holiday short schedule): Berkeley Tue-Thu 6:30am-6:30pm, Fri 6:30am-5:30pm, Sat 7am-12pm, Sun 8am-12pm; Oakland Lakeshore Tue-Thu 6:00am-7:30pm, Fri 6:00am-6:30pm, Sat-Sun 7am-12pm; Alamo from 6:00am Tue-Fri with last classes 5:30pm Tue, 6:30pm Wed, 12pm Thu, 1pm Fri, Sat-Sun 7-11am; Rockridge Tue and Thu 6:30am-6:30pm, Fri 6:30am-5:30pm, no classes Wed Sept 9, Sat 8-11am, Sun 8am-12pm. Classes are 45 minutes.
     flag: The studio pages link to Instagram @bodyrokstudio (the brand account), not @bodyrokeastbay.
     flag: Wording differs between studio pages while prices are identical: intro first item is 'First Class' on Berkeley and Rockridge but '1 Class' on Alamo and Oakland; section is 'Class Packages' on Berkeley and Oakland but 'Class Packs' on Alamo and Rockridge; validity reads '30 Day Expiration' vs 'Valid For 30 Days' and 'Valid For 6 Months' vs '6 Month Expiration'.
     flag: Addresses are inconsistently formatted on their site: Alamo, Rockridge, Walnut Creek and Lafayette have no ZIP code and end in ', USA'; Oakland spells out 'California'; Alamo's '170f Alamo Plaza' uses a lowercase suite letter. Kept exactly as published.
     flag: Rockridge is a neighborhood of Oakland, so there are two Oakland-addressed studios (3303 Lakeshore Ave and 5901 College Avenue); Instagram and the site list 'Oakland' and 'Rockridge' as separate studios.
     flag: Linktree button 'BUY YOUR ROCKRIDGE FOUNDING MEMBERSHIP' points to Mindbody prodId=205, which no longer resolves to any contract (the store only offers the four EastBay Access memberships and four Walnut Creek founding memberships) and the Rockridge page says 'now open' with standard prices, so that button looks stale.
     flag: Other stale linktree buttons: 'SIGN UP FOR ROCKRIDGE CLASSES!' carries a hard-coded schedule date 05/09/26; 'FREE Pilates in the Park with Kelsey - 8/30!' (t.bodyrok.com link resolving to the Mindbody schedule for location 5 'Walnut Creek', category 'Community Events') is a past event; 'August Promo- Get your membership now' was still up in September.
     flag: Walnut Creek founding prices ($83.30, $132.30, $167.30, $195.30) are exactly 30% off the standard $119, $189, $239, $279 tiers; Mindbody says 'lock in your 30% discount for the life of your Walnut Creek only membership', founding members pay a '$25 drop-in rate per class' at the other East Bay studios until opening, and the pinned Instagram post says 'LAST CALL 30% OFF FOUNDING MEMBERSHIPS'.
     flag: Memberships are named 'EastBay Access- Recurring ... (no commitment)' on Mindbody, yet the contract reads '$119.00 every month for 12 months' and 'auto-renews every 12 months until you cancel' with a 30-day written cancellation notice. Memberships are valid at Alamo, Berkeley, Oakland, Rockridge and Walnut Creek; extra classes $25 each; late cancel $15.
     flag: No-show penalty contradicts itself: the studio pages say a $20 charge on unlimited plans, while the Mindbody Unlimited contract says 'you will incur a $25 No Show Fee'.
     flag: Items on the Mindbody store that bodyrok.com does not show: 2 Weeks Unlimited $79, ROK 1 Month Unlimited (no contract) $349, three Back To School bonus packs expiring 12/5/2026, Special Event- Non-Member $20 and $10 Community class ONLY. The 'Community Events (out of studio)' category cannot be bought online and a 'Privates' category exists on the schedule filter with no price published.
     flag: The brand home page says 'Generally a drop in class starts at around $30 (depending on location)', but the East Bay drop-in is $38.
     flag: Only the black 'BODYROK' wordmark is hosted on their own domain (a white variant is at https://bodyrok.com/wp-content/uploads/2024/07/logo-white-1024x134.png, 1024x134); the round 'BODYROK EAST BAY' badge exists only as the Instagram and linktree avatar, hosted by those platforms.
     flag: Per-studio emails on their site: berkeley@bodyrok.com, alamo@bodyrok.com, oakland@bodyrok.com, rockridge@bodyrok.com, walnutcreek@bodyrok.com, lafayette@bodyrok.com, plus brand info@bodyrok.com; Instagram's Contact sheet shows berkeley@BODYROK.com, which is why it is the top-level email.
     flag: The operator sent a linktree; its 'Our Website' button goes to the brand's bodyrok.com/studios/ index, and booking and purchases run on Mindbody (clients.mindbodyonline.com, site ID 283626). site_kind is own-domain because the addresses and prices live on bodyrok.com.
  */
  'bodyrok-oakland': {
    address: "3303 Lakeshore Ave, Oakland, California 94610; 5901 College Avenue, Oakland, CA, USA",
    phone: "(510) 900-9234",
    email: "oakland@bodyrok.com",
    instagram: "bodyrokeastbay",
    cuisine: "Reformer Pilates studio",
    tagline: "Reformer Pilates studios on Lakeshore Ave and in Rockridge, Oakland",
    groups: [
      { name: "Prices, from", items: [
        ["First Class","Intro offer, 30 Day Expiration; Alamo and Oakland pages call it '1 Class'; Mindbody name 'INTRO SPECIAL - $20 First Visit'",2000,"$20"],
        ["5 Classes","Intro offer, 30 Day Expiration; Mindbody name 'INTRO SPECIAL- 5 classes for $99 (1mth exp)'",9900,"$99"],
        ["Unlimited","Intro offer: first month unlimited, 1 class per day, expires 30 days from first use; Mindbody name 'INTRO SPECIAL 1st MTH(1x day) $149'",14900,"$149"],
        ["INTRO SPECIAL 2 Weeks Unlimited (1X Day) $79","Expiration Date: 14 days from first use; listed on their Mindbody store only, not on bodyrok.com",7900,"$79"],
        ["1 Class","Drop-in, Valid For 6 Months; Mindbody name 'ROK Group- 1 session'",3800,"$38"],
        ["5 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 5 Sessions'",16900,"$169"],
        ["10 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 10 Sessions'",29900,"$299"],
        ["20 Classes","Valid For 6 Months; Mindbody name 'ROK Group - 20 Sessions'",54900,"$549"],
        ["ROK 1 Month Unlimited (no contract)","One month unlimited, no contract; expiration one month from purchase; Mindbody store only",34900,"$349"],
        ["4x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 4X Mth (no commitment)': $119.00 every month, valid at Alamo, Berkeley, Oakland, Rockridge, Walnut Creek; extra classes $25 each",11900,"$119/mo"],
        ["8x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 8X Mth (no commitment)': $189.00 every month",18900,"$189/mo"],
        ["12x A Month","Membership, 30 Day Cancellation; Mindbody contract 'EastBay Access- Recurring 12X Mth (no commitment)': $239.00 every month",23900,"$239/mo"],
        ["Unlimited","Membership, 30 Day Cancellation, max 1 class per day; Mindbody contract 'EastBay Access- Recurring Unlimited, 1X Day': $279.00 every month",27900,"$279/mo"],
        ["WALNUT CREEK 4X Mth Founding Membership","Walnut Creek page lists it as '4x A Month' under 'Founding Memberships - Lock Your Rate In For Life'; $83.30 every month, Walnut Creek only, activates when the studio opens",8330,"$83.30/mo"],
        ["WALNUT CREEK 8X Mth Founding Membership","Walnut Creek page: '8x A Month'; $132.30 every month",13230,"$132.30/mo"],
        ["WALNUT CREEK 12X Mth Founding Membership","Walnut Creek page: '12x A Month'; $167.30 every month",16730,"$167.30/mo"],
        ["WALNUT CREEK Founding Member- Unlimited (1X Day)","Walnut Creek page: 'Unlimited'; $195.30 every month",19530,"$195.30/mo"],
        ["Back To School- 5 +1 FREE $169 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",16900,"$169"],
        ["Back to School- 10 +2 FREE $299 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",29900,"$299"],
        ["Back To School- 20 +4 FREE- $549 (90 day expiration)","Promo pack on their Mindbody store, Expiration Date 12/5/2026",54900,"$549"],
        ["Special Event- Non-Member","Mindbody 'Special Event Classes' category",2000,"$20"],
        ["$10 Community class ONLY","Mindbody 'COMMUNITY Sculpt Classes' category",1000,"$10"],
      ] },
    ],
    quoteOnly: "Reformer Pilates studios on Lakeshore Ave and in Rockridge, Oakland. Prices from the bodyrok.com studio pages (identical on Berkeley, Alamo, Oakland and Rockridge; Walnut Creek founding rates on its own page) and confirmed item-by-item on their Mindbody store (site ID 283626, read in the browser on 2026-09-07); no opening hours are published anywhere, only class schedules on Mindbody.",
  },

  /*
     Boudreaux Cajun Steak House — gathered 2026-09-09 from own-domain
     they are: Cajun
     logo: https://le-cdn.hibuwebsites.com/d2d5b30f702a402bae0d53127cfa1f94/dms3rep/multi/opt/boudreaux-cajun-steak-house-logo-a78278ea-1920w.png (546x396) — not cut into a tile yet
     flag: NOT OPEN: the site publishes hours of Mon-Sun 11am-10pm while stating the restaurant is under construction and not open to the public — the hours are not carried
     flag: no street address; 'Located in Fairfield, CA' but the service area says Sacramento
     flag: literal template variables render in the footer: {{placeholder_footer_reserve1}} through 7, and five unlabelled 'Button' placeholders on the homepage
     flag: the contact page lists the same number twice as Mobile and Alternate
     flag: Menu sweep 2026-09-09, still no readable prices: No prices are published anywhere on boucajun.com. The homepage and /restaurant page state the sit-down steak house location is still 'under development'/coming soon, and the /gumbo-orders page (current, operating service) advertises gumbo but lists no item prices, directing customers to call or text
     flag: Menu sweep 2026-09-09: No menu or prices published anywhere on the site; the sit-down restaurant is explicitly described as still under development ('coming soon')
     flag: Menu sweep 2026-09-09: Food Truck, Catering, and Gumbo Orders pages advertise active services but list no item prices, directing customers to call/text (844) 305-2260 for pricing
     flag: Menu sweep 2026-09-09: Hours (Mon-Sun 11am-10pm) are stated identically on both the homepage and the /gumbo-orders page - no contradiction found
     flag: Menu sweep 2026-09-09: Gumbo-orders page mentions a 10% discount for military, seniors, and first responders
  */
  'bou-cajun': {
    address: "814 Texas Street, Fairfield, CA 94533",
    phone: "(844) 305-2260",
    email: "info@boucajun.com",
    hours: "Mon-Sun 11am-10pm",
    instagram: "boucajun_",
    cuisine: "Cajun",
    tagline: "Veteran- and minority-owned 'authentic New Orleans cuisine' in",
    photos: [
      {"src":"/food/bou-cajun-site-1-lg.webp","alt":"","credit":"Their own photo, from boucajun.com"},
      {"src":"/food/bou-cajun-site-3-lg.webp","alt":"","credit":"Their own photo, from boucajun.com"},
      {"src":"/food/bou-cajun-site-4-lg.webp","alt":"","credit":"Their own photo, from boucajun.com"},
      {"src":"/food/bou-cajun-site-8-lg.webp","alt":"","credit":"Their own photo, from boucajun.com"},
    ],
    contactOnly: "Veteran- and minority-owned 'authentic New Orleans cuisine' in. No menu or prices published; ordering is by call or text; 10% military, senior and first-responder discounts advertised.",
  },

  /*
     Brasa Bros — gathered 2026-09-09 from own-domain
     they are: Peruvian rotisserie
     logo: https://images.getbento.com/accounts/c2c7fd3f33613d787a8a0347c60c09dd/media/images/28972BB_without_R.png (3530x2259) — not cut into a tile yet
     flag: the Build Your Own Bowl menu has two sections both labelled 'STEP 3'
     flag: TikTok is linked two ways on the same page, one through a corporate email-tracking wrapper
     flag: no email published — contact is a form only
     flag: menu: 59 items read from https://order.chownow.com/order/44170/locations/66358?add_cn_ordering_class=true on 2026-09-05
  */
  'brasa-bros': {
    address: "1001 S Van Ness Ave, San Francisco, CA 94110",
    phone: "(415) 821-2134",
    hours: "Daily 11am-9pm",
    instagram: "brasa.bros",
    cuisine: "Peruvian rotisserie",
    sections: [
      { name: "Pollo a la Brasa", items: [
        ["Whole Chicken","Includes two sides and a trio of sauces: one Pica Loco and two Aji Amarillo.",3495,"brasa-bros-whole-chicken"],
        ["1/2 Chicken","Includes two sides and one Ají Amarillo sauce.",2195,"brasa-bros-1-2-chicken"],
        ["1/4 Chicken","Includes two sides and one Ají Amarillo sauce",1795,"brasa-bros-1-4-chicken"],
        ["Whole Chicken Only","Includes a trio of sauces: one Pica Loco and two Aji Amarillo.",2800,"brasa-bros-whole-chicken-only"],
        ["1/2 Chicken Only","Includes two Aji Amarillo sauces.",1700,"brasa-bros-1-2-chicken-only"],
        ["1/4 Chicken Only","Includes two Aji Amarillo sauces.",1000,"brasa-bros-1-4-chicken-only"],
      ] },
      { name: "Family Meals", items: [
        ["Kicker Combo","One rotisserie chicken, 8 tenders, 2 large sides & 4 dipping sauces",5895,"brasa-bros-kicker-combo"],
        ["Champions Bucket","2 rotisserie chickens, 10 tenders, 3 large sides & 6 dipping sauces",9495,"brasa-bros-champions-bucket"],
        ["Game One","10 chicken tenders, 2 large sides & 3 dipping sauces",3995,"brasa-bros-game-one"],
        ["Goal Worthy Tenders","15 chicken tenders, 2 large sides & 4 dipping sauces",4995,"brasa-bros-goal-worthy-tenders"],
      ] },
      { name: "Kids", items: [
        ["Kid's Combo","1 chicken tender, fries, Brasa Bliss sauce & a drink",895,"brasa-bros-kid-s-combo"],
        ["Chaufita","Peruvian-style fried rice, 1 chicken tender with Brasa Bliss sauce & a drink",895,"brasa-bros-chaufita"],
      ] },
      { name: "Combos", items: [
        ["2 Tenders","Brasa Bliss sauce, fries, slaw, fountain drink",1395,"brasa-bros-2-tenders"],
        ["Crispy Sandwich","Crispy chicken on a Brioche bun, Brasa Bliss sauce, fries, slaw, pickles, fountain drink",1495,"brasa-bros-crispy-sandwich"],
      ] },
      { name: "Sides", items: [
        ["Jasmine Rice","",525,"brasa-bros-jasmine-rice"],
        ["Side Chaufa","",525,"brasa-bros-side-chaufa"],
        ["Fresh-cut Fries","",525,"brasa-bros-fresh-cut-fries"],
        ["Sweet Potato Fries","",525,"brasa-bros-sweet-potato-fries"],
        ["Yuca Fries","",525,"brasa-bros-yuca-fries"],
        ["Beans","",525,"brasa-bros-beans"],
        ["Plantains","",525,"brasa-bros-plantains"],
        ["Slaw","",525,"brasa-bros-slaw"],
        ["Small House Salad","",525,"brasa-bros-small-house-salad"],
        ["Big House Salad","",1000,"brasa-bros-big-house-salad"],
        ["Single Tender","(1) Piece of Tender",595,"brasa-bros-single-tender"],
        ["House Salad - Small","",525],
      ] },
      { name: "Signature Sauces", items: [
        ["Aji Amarillo Sauce","",150,"brasa-bros-aji-amarillo-sauce"],
        ["Pica Loco Sauce","",150,"brasa-bros-pica-loco-sauce"],
        ["Brasa Bliss Sauce","",150,"brasa-bros-brasa-bliss-sauce"],
        ["Medium Sauce 6oz","",450,"brasa-bros-medium-sauce-6oz"],
        ["Large Sauce 8oz","",550,"brasa-bros-large-sauce-8oz"],
      ] },
      { name: "Desserts", items: [
        ["Tres Leches","",695,"brasa-bros-tres-leches"],
        ["Maracuya Panna-Cotta","",695,"brasa-bros-maracuya-panna-cotta"],
        ["Gummy Bears","",395,"brasa-bros-gummy-bears"],
      ] },
      { name: "Drinks", items: [
        ["Coca Cola","",395,"brasa-bros-coca-cola"],
        ["Diet Coke","",395,"brasa-bros-diet-coke"],
        ["Coca Cola Zero","",395,"brasa-bros-coca-cola-zero"],
        ["Sprite","",395,"brasa-bros-sprite"],
        ["Fanta","",395,"brasa-bros-fanta"],
        ["Minute Maid","",395,"brasa-bros-minute-maid"],
        ["Passion Fruit Lemonade","",600,"brasa-bros-passion-fruit-lemonade"],
        ["Chicha Morada","",600,"brasa-bros-chicha-morada"],
        ["Inca Cola","",450,"brasa-bros-inca-cola"],
      ] },
      { name: "Signature Bowls", items: [
        ["LOMO SALTADO","",1795,"brasa-bros-lomo-saltado"],
        ["SALTADO DE POLLO","",1595,"brasa-bros-saltado-de-pollo"],
        ["Picanha Steak Bowl","",1895],
        ["MONSTRITO","",1595],
        ["Chaufa Crunch","Chopped tenders, fried rice & fries, drizzled with Brasa Bliss sauce",1795,"brasa-bros-chaufa-crunch"],
      ] },
      { name: "Menu", items: [
        ["Grilled Chicken","",395],
        ["Grilled Steak","",495],
        ["Roasted Veggies","",295],
        ["Aji Garlic Chicken","",395],
        ["Salad","",525,"brasa-bros-salad"],
        ["Chaufa","",200,"brasa-bros-chaufa"],
        ["Yuca","",200,"brasa-bros-yuca"],
        ["Sweet Potatoes","",200],
        ["Aji Amarillo","",450,"brasa-bros-aji-amarillo"],
        ["Brasa Bliss","",450,"brasa-bros-brasa-bliss"],
        ["Pica Loco","",450,"brasa-bros-pica-loco"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Breaktime Tea — gathered 2026-09-09 from ordering-platform — BLOCKED: order.online storefront returned HTTP 403 Forbidden (tried 3 URL variants)
     they are: Bubble Tea
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: order.online storefront blocked (HTTP 403) on all 3 URL variants attempted, including the exact URL provided
     flag: One WebSearch for an owned website turned up only third-party listings (Facebook, Yelp, DoorDash, Instagram, order.online, plus directory/aggregator sites weeblyte.com and wheree.com) and an unverified breaktimetea.com domain with no substantive content
     flag: Because no approved own-site or ordering-page source could actually be read, address/phone/hours/instagram are left null rather than sourced from third-party (Yelp/DoorDash/aggregator) snippets
  */
  'breaktime-tea': {
    cuisine: "Bubble Tea",
    tagline: "Bubble tea and boba drink shop",
  },

  /*
     Cafe Noir — gathered 2026-09-09 from own-domain
     they are: African diaspora
     logo: https://images.squarespace-cdn.com/content/v1/6584861e80e9050fa3c6ffc8/2139ba63-bcf8-4ad0-a7e6-233cd69d999c/cafe-noir-oakland-full-logo.png (1592x580) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the homepage lists seven days of service, but the brunch menu says Wednesday-Sunday and the dinner menu says Wednesday-Friday, Saturday, Sunday — Monday and Tuesday contradicted, so no hours carried
     flag: the /menu page title reads 'lack Owned' — a missing B
     flag: menu: 24 items read from https://www.cafenoiroak.com/menu on 2026-09-05
  */
  'cafe-noir-oak': {
    address: "1620 18th St, Oakland, CA 94607",
    phone: "(415) 312-0990",
    email: "cafenoiroakland@gmail.com",
    instagram: "cafenoiroak",
    cuisine: "African diaspora",
    photos: [
      {"src":"/food/cafe-noir-oak-site-3-lg.webp","alt":"Brunch bowl with sunny-side-up eggs, roasted potatoes, and seasonal vegetables drizzled with herb sauce at Café Noir, a","credit":"Their own photo, from cafenoiroak.com"},
      {"src":"/food/cafe-noir-oak-site-4-lg.webp","alt":"Braised beef short ribs with creamy mashed potatoes and green beans at Café Noir, a Black-owned restaurant in Oakland. C","credit":"Their own photo, from cafenoiroak.com"},
      {"src":"/food/cafe-noir-oak-site-5-lg.webp","alt":"Blackened shrimp with grilled corn, savory bites, and fresh herbs at Café Noir, a Black-owned restaurant serving gourmet","credit":"Their own photo, from cafenoiroak.com"},
      {"src":"/food/cafe-noir-oak-site-6-lg.webp","alt":"Rich chocolate cake topped with dark cherry compote at Café Noir, a Black-owned gourmet comfort food restaurant in Oakla","credit":"Their own photo, from cafenoiroak.com"},
    ],
    sections: [
      { name: "Dinner Entrees", items: [
        ["Jerk Salmon","Fire roasted salmon filet with coconut rice and fried plantains; topped with mango salsa; cooked to medium",2450],
        ["Noir Jollof","Grilled chicken and shrimp with jollof style rice Spicy",2100],
        ["Mushroom Fettuccine","Fresh Fettuccine pasta with a wild mushroom cream sauce",1850],
        ["Braised Oxtail, whipped mash potatoes, seasonal mix vegetables","",3200],
        ["Braised Beef over Mash","Braised beef that we cook for 12 hours, decadent brown gravy over mash potatoes and seasonal mixed veg",2800],
        ["Fried Chicken Sandwich w/fries","Our infamous chicken sando is available for Ballers Games this season!!",1900],
      ] },
      { name: "Lunch", items: [
        ["BBQ CHICKEN TACO SALAD","Our infamous salad has made its way to dinner! Cabbage, arugula, pickled red onions, pickled jalapenos, cucumber, black beans, corn, shredded cheese",1850],
        ["*SPECIAL* Arugula Pesto Ricotta Gnocchi","House made ricotta gnocchi with our arugula pest made with sunflower seeds... so no worries for any nut allergies! Vegetarian add meat as an add on",1400],
      ] },
      { name: "Salads", items: [
        ["Cran Apple Salad","Arugula salad with cranberry compote, goat cheese and candied walnuts; citrus vinagrette",1350],
        ["Mixed Green Salad","Spinach and arugula, pickled red onions and cherry tomatoes, citrus vinaigrette",1150],
      ] },
      { name: "Dessert", items: [
        ["Ricotta Donuts","Ricotta, lemon, fluffy and fried to perfection Small: 4 donuts Large: 8 donuts",800],
        ["BIG OL' COOKIE","",400],
      ] },
      { name: "Drinks", items: [
        ["Lemonade","Fresh squeezed lemonade sweetened by house made simple syrup",550],
        ["Sorrel","Carribean hibiscus drink that is spiced with citrus, ginger, nutmeg and cinnamon; we nicknamed it 'Christmas in a cup\"! Served hot or cold",450],
        ["Coca-Cola, 12oz","Coca-Cola Original Taste — the crisp, refreshing taste you know and love",250,"cafe-noir-oak-coca-cola-12oz"],
        ["Green Juice","",900],
        ["Cafe Duran Coffee","Imported Coffee from Panama; Small Hot 3.50 Large Hot 4.50 Cold (one size) 4.50",375],
        ["Infused Spa Water","",250],
        ["MIMOSAS","Choice of Tamarind, Honey Pasion Fruit and Mango",1000],
      ] },
      { name: "Sides", items: [
        ["*SIDE* Jollof Rice","Our Jollof rice with garlic and green onions (vegetarian)",600],
        ["*SIDE* Coconut Rice","",600],
        ["*SIDE* Fried Plantains","",600],
        ["Side Salad","Mixed Green with cucumber, carrots and cherry tomatoes",550],
        ["Pepper Sauce","Our habanero sauce to take home!! Its a 3 oz bottle of our spicy goodness; comes in a recyclable glass bottle",500],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     caitlyns-sweets — gathered 2026-09-09 from stopgap
     their spelling: "Caitlyn's Sweets" (roster keeps "caitlyns-sweets")
     they are: Custom cakes
     flag: Glenn: 'San Jose • Goods. Needs website'
     flag: no street address published
     flag: Menu sweep 2026-09-09, still no readable prices: No independent website or ordering page exists for this business. The Instagram bio (@caitlyn_sweets) says 'DM for quote & availability', confirming pricing is by custom quote only and is not published anywhere, so no menu items or prices could be recorded.
     flag: Menu sweep 2026-09-09: No standalone business website or ordering page found; a single WebSearch turned up only Instagram (@caitlyn_sweets), a TikTok (@caitlynsweets), and third-party listings (Yelp, a Giftly gift-card page) - no owned domain
     flag: Menu sweep 2026-09-09: This is a custom-order cake business - pricing is quote-based via DM, not a published menu, so 'items: []' is expected rather than a gap
     flag: Menu sweep 2026-09-09: No street address, phone, or email listed in the Instagram bio; only 'San Jose'/Bay Area given as service area
     flag: Menu sweep 2026-09-09: Search also surfaced an unrelated similarly-named business, 'Caitlyn's Confections' (caitlynsconfections.com), which was not used since it does not match the given Instagram handle
  */
  'caitlyns-sweets': {
    address: "San Jose, CA",
    instagram: "caitlyn_sweets",
    cuisine: "Custom cakes",
    needsSite: true,
    tagline: "Custom cakes in San Jose for birthdays, weddings and events",
    contactOnly: "Custom cakes in San Jose for birthdays, weddings and events. DM them for a quote and availability; Bay Area pickup and delivery; policies and flavors are in their highlights.",
  },

  /*
     Cajun Crack N — gathered 2026-09-09 from own-domain — BLOCKED: order.online storefront returned HTTP 403 Forbidden
     their spelling: "Cajun Crack'n CA" (roster keeps "Cajun Crack N")
     they are: Cajun Seafood Boil
     logo: https://img1.wsimg.com/isteam/ip/4bb7e437-4b51-4578-b5c9-21e1469c471b/Cajun%20logo%20no%20bg.png — not cut into a tile yet
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: No street address, phone, email, or hours found anywhere on cajuncracknca.com/concord (header and footer both checked) or the cajuncracknca.com homepage
     flag: order.online storefront for this location (store/cajun-crack'n-concord-24646509) returned HTTP 403 Forbidden on both a plain and a URL-encoded-apostrophe attempt
     flag: Guessed /menu and /contact subpages both returned 404 Not Found
     flag: Appears to be a multi-location chain; a separate Milpitas location operates its own distinct domain (cajuncracknmilpitas.com)
     flag: Menu item names found with no prices: Combo 1-3, Signature 1-2, The Boiling (a-la-carte catch), Garlic Bread, Fries, Onion Rings, Chicken Tender/Catfish/Shrimp/Oyster/Softshell Crab baskets, various Po'Boys, Gumbo, Cajun Chowder, and Rice/Sauce/Butter/Corn/Egg/Potato add-ons
  */
  'cajun-crack-n': {
    cuisine: "Cajun Seafood Boil",
    tagline: "Cajun-style seafood boil restaurant with fried baskets and po'boys",
  },

  /*
     Cali Party Bus — gathered 2026-09-09 from own-domain
     they are: Party bus rental
     flag: a travel fee may apply beyond 40 miles of their Oakland terminal, their own note
  */
  'cali-party-bus': {
    address: "4911 Coliseum Way, Oakland, CA",
    phone: "(415) 692-1465",
    email: "info@calipartybus.com",
    hours: "Mon-Fri 8am-7pm, Sat-Sun 11am-5pm",
    instagram: "calipartybus",
    cuisine: "Party bus rental",
    tagline: "Party buses and limo vans out of an Oakland terminal",
    groups: [
      { name: "Prices, from", items: [
        ["Sprinter Limo Van","1 to 12 guests",16000,"from $160/hr"],
        ["Small Party Bus","10 to 19 guests",19500,"from $195/hr"],
        ["Small Party Bus with restroom","10 to 19 guests",20000,"from $200/hr"],
        ["Medium Party Bus","20 to 28 guests",24500,"from $245/hr"],
        ["Medium Party Bus with restroom","20 to 28 guests",25000,"from $250/hr"],
        ["Large Party Bus with restroom","30 to 40 guests",29500,"from $295/hr"],
        ["XL Party Bus with restroom","30 to 45 guests",30000,"from $300/hr"],
        ["Executive Charter with restroom","36 guests",20000,"from $200/hr"],
      ] },
    ],
    quoteOnly: "Party buses and limo vans out of an Oakland terminal. Their own published starting rates, Sunday to Friday; Friday night and Saturday are $5 to $10 an hour more, and the rate covers tax, fuel, tolls and the driver's gratuity.",
  },

  /*
     camachos-party-rentals — gathered 2026-09-09 from own-domain
     their spelling: "Camachos Party Rentals" (roster keeps "camachos-party-rentals")
     they are: Party rentals
     logo: https://camachospartyrentals.com/wp-content/uploads/2023/11/Camachos_Party_Rentals.png (2100x2100) — not cut into a tile yet
     flag: name written both 'Camachos' (title, footer, logo) and 'Camacho's' (About, FAQ)
     flag: product numbers are duplicated — four items numbered 0001, two numbered 0003 — though the quote flow asks customers to cite one
     flag: the contact page lists only 'Sebastopol, California'; the site advertises '24/7 service' but publishes no hours
     flag: the header logo loads over http on an https page
  */
  'camachos-party-rentals': {
    phone: "(707) 308-8935",
    email: "CamachosPartyRentalsINFO@gmail.com",
    instagram: "camachosparty",
    cuisine: "Party rentals",
    contactOnly: "'We bring the joy of modern bounce houses, tables, chairs and all you need for your party right to your doorstep!' — delivering across Sonoma County and beyond. Quote-only — every catalogue product shows 'Get a quote today!' and no price; a 25% deposit reserves the date.",
  },

  /*
     Chikin Drip — gathered 2026-09-09 from own-domain
     they are: Nashville hot chicken
     flag: they have a second San Jose kitchen at 81 Curtner Ave on the same menu, hours and number
     flag: their Instagram bio says 100% halal
     flag: menu: 5 items read from https://www.chikindrip.com/menu on 2026-09-05
  */
  'chikin-drip-san-jose': {
    address: "530 Newhall Dr, San Jose, CA 95110",
    phone: "(669) 900-3829",
    email: "info@chikindrip.com",
    hours: "Sun-Thu 11am-1am, Fri-Sat 11am-1:30am",
    instagram: "chikindrip",
    cuisine: "Nashville hot chicken",
    tagline: "Nashville hot chicken by SJC on Newhall Drive, open late",
    sections: [
      { name: "Combos", items: [
        ["Combo 1","",1299],
        ["Combo 2","",1499],
        ["Combo 3","",1399],
        ["Combo 4","",1799],
        ["Loaded Fries","",1399],
      ] },
    ],
    siteNote: "Prices are from their own site.",
  },

  /*
     Chikin Drip — gathered 2026-09-09 from own-domain
     they are: Nashville hot chicken
     flag: their Instagram bio says 100% halal
     flag: every combo is fried to order, their words
     flag: menu: 5 items read from https://www.chikindrip.com/menu on 2026-09-05
  */
  'chikin-drip-union-city': {
    address: "32004 Alvarado Blvd, Union City, CA 94587",
    phone: "(669) 900-3829",
    email: "info@chikindrip.com",
    hours: "Sun-Thu 11am-1am, Fri-Sat 11am-1:30am",
    instagram: "chikindrip",
    cuisine: "Nashville hot chicken",
    tagline: "Nashville hot chicken on Alvarado Blvd, open late every day",
    sections: [
      { name: "Combos", items: [
        ["Combo 1","",1299],
        ["Combo 2","",1499],
        ["Combo 3","",1399],
        ["Combo 4","",1799],
        ["Loaded Fries","",1399],
      ] },
    ],
    siteNote: "Prices are from their own site.",
  },

  /*
     Chip Cookies — gathered 2026-09-09 from own-domain
     their spelling: "chip cookies" (roster keeps "Chip Cookies")
     they are: Gourmet cookies
     logo: https://www.chipcookies.co/cdn/shop/files/chip-logo_dfae3b6d-9d06-41eb-85ea-ba6f9c444fe5.png?v=1733879055 (600x600) — not cut into a tile yet
     flag: Glenn, 2026-09-07: '3 locations' — the three Bay Area stores from their own locations page, Brentwood, Walnut Creek and Dublin, are all on the address line now and each has its own page seat; hours are identical at all three per each store's own page (Walnut Creek writes Mon-Thu and Sun on separate lines)
     flag: phones per store, from each store's own page: Brentwood (925) 489-5201, Walnut Creek 925-289-9351, Dublin 925-819-7855; emails brentwood@, walnutcreek@ and dublin@chipcookies.co
     flag: two Instagram accounts: chipcookies.bayarea (the one Glenn sent, lists the three Bay Area stores) and the corporate chipcookiesco the website links; the Bay Area one is carried
     flag: A CHAIN of 23 stores in seven states, headquartered at 1805 E Williams Field Rd, Gilbert AZ. The Brentwood store is the address here; the other Bay Area stores are Dublin, 6851 Amador Plaza Rd, (925) 819-7855, and Walnut Creek, 2335 Oak Grove Road, (925) 289-9351
     flag: internal franchise supply items are exposed in their public product feed
  */
  'chip-cookies': {
    address: "2505 Sand Creek Rd #128, Brentwood, CA 94513; 2335 Oak Grove Road, Walnut Creek, CA 94598; 6851 Amador Plaza Rd, Dublin, CA 94568",
    phone: "(925) 489-5201",
    hours: "Sun-Thu 10am-10pm, Fri-Sat 10am-12am",
    instagram: "chipcookies.bayarea",
    cuisine: "Gourmet cookies",
    photos: [
      {"src":"/food/chip-cookies-site-3-lg.webp","alt":"og-chip_web_copy.png","credit":"Their own photo, from chipcookies.co"},
      {"src":"/food/chip-cookies-site-5-lg.webp","alt":"sw-chip_web_copy.png","credit":"Their own photo, from chipcookies.co"},
      {"src":"/food/chip-cookies-site-6-lg.webp","alt":"biscoff-chip_web_copy.png","credit":"Their own photo, from chipcookies.co"},
      {"src":"/food/chip-cookies-site-9-lg.webp","alt":"oreo-dunk-chip_web_copy.png","credit":"Their own photo, from chipcookies.co"},
      {"src":"/food/chip-cookies-site-13-lg.webp","alt":"chip cookie bar","credit":"Their own photo, from chipcookies.co"},
      {"src":"/food/chip-cookies-site-14-lg.webp","alt":"chip cookie cakes","credit":"Their own photo, from chipcookies.co"},
    ],
    items: [
      ["OG","Four of their award-winning chocolate chip cookies",2200],
      ["mini OG","Bite-sized OG assortment",2200],
      ["cocoa chip","Premium cocoa, fudgy brownie texture",2200],
      ["SW chip","Dark chocolate and sea salt",2200],
      ["biscoff chip","Biscoff, white chocolate chips, stuffed with cookie butter",2200],
      ["boneless chip","Their blonde cookie base with nothing in it",2200],
    ],
    siteNote: "These are the four-cookie nationwide-shipping packs on their Shopify store; walk-in and local-delivery prices live only on order.chipcookies.co.",
  },

  /*
     Chiquo & Eva’s — gathered 2026-09-09 from own-domain
     their spelling: "Chiquo & Eva's Wagyu Steakhouse" (roster keeps "Chiquo & Eva’s")
     they are: Wagyu steakhouse
     logo: https://static.wixstatic.com/shapes/0c4e7f_e268b88348614e30b9f97dfe006b8f9e.svg — not cut into a tile yet
     flag: NOT OPEN. The homepage says 'Coming soon — End of 2026' and the first lease is not yet signed; an American Canyon address appears only in page metadata with no ZIP, so no address is carried onto the page
     flag: the menu page advertises a Saturday pop-up at The Cafe at The Inn at Benicia Bay while the Reservations page says 'we are not hosting any steakhouse pop ups' and Book Online says 'Nothing to book right now'
     flag: the footer says 'Reservations Required' on every page while the Reservations page says 'No Reservations at this time'
     flag: policy pages live on default Wix slugs /blank, /blank-1, /blank-2 and the accessibility page still carries the unedited Wix template text
     flag: name written three ways: 'Chiquo & Eva's Wagyu Steakhouse', 'Chiquo and Eva's', 'CHIQUO & EVA'S- WAGYU STEAK HOUSE'
     flag: a second tasting menu, Wagyu Ribeye Tour, is $560; sides $17-$23
     flag: menu: 8 items read from https://www.chiquoandeva.com/menu on 2026-09-05
  */
  'chiquo-and-eva': {
    phone: "(707) 646-1112",
    email: "chiquoxeva@gmail.com",
    instagram: "chiquoevasteaks",
    cuisine: "Wagyu steakhouse",
    photos: [
      {"src":"/food/chiquo-and-eva-site-0-lg.webp","alt":"18210957451294561.jpg","credit":"Their own photo, from chiquoandeva.com"},
    ],
    sections: [
      { name: "Appetizers", items: [
        ["MoChiquo Fried Chicken Wings","8 Chicken wings marinated in a gochujang + mochiko batter. Fried in beef tallow.",2000,"chiquo-and-eva-mochiquo-fried-chicken-wings"],
        ["Lumpia Shanghai","Filipino fried egg roll made with pork, carrots, celery, and water chestnuts. Comes with 12 pieces. Fried in beef tallow.",2000],
      ] },
      { name: "Cuts of Wagyu", items: [
        ["Japanese A5 Wagyu Ribeye - 20-22 oz","Origin - Miyazaki Japan. Grade A5. Japanese Beef Marble Score 10+. Feeds 2 people",21500],
        ["Japanese A5 Wagyu Filet Mignon - 10 oz","Origin - Miyazaki Japan. Grade A5. Japanese BMS 10+. Feeds 1 person.",19000],
      ] },
      { name: "Pacific Sides", items: [
        ["Silog","Garlic fried rice topped with a fried egg and fried garlic chips.",1700],
        ["Mango Salad","Mangoes, pineapple, tomatoes, onions, and lime juice. Compliments the richness of the wagyu.",1700],
      ] },
      { name: "Enhancers", items: [
        ["Chili Pepper Shrimp","Tamarind, Chili Peppers, Garlic, Lemon",2300],
        ["Bone Marrow","Two bone marrow canoes with roasted garlic and a side of toasted bread. Bread is toasted in bone marrow butter.",2300],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Chutneys — gathered 2026-09-09 from stopgap
     they are: Indian
     flag: 2 of 4 DNS A records point at a misconfigured Cloudflare endpoint: HTTPS handshake refused, HTTP returns 'error code: 1001' — the site fails to load whenever a client picks those records
     flag: GoDaddy Website Builder template with a single Getty stock photo and GoDaddy's default icon — no business logo
     flag: publishes no cuisine, menu, address, phone, hours or social links; filed as 'Indian' but the site never says so
     flag: domain is .ai
     flag: Menu sweep 2026-09-09, still no readable prices: chutneys.ai (www.chutneys.ai) loads only a bare placeholder page with a tagline and a contact form, no menu; the non-www chutneys.ai never loads (persistent SSL handshake failure); a related-looking domain chutneys.us (found via search, labeled "Chutneys Indian Vegetarian Restaurant, Brentwood, CA")
     flag: Menu sweep 2026-09-09: Given URL chutneys.ai (no www) fails with a persistent SSL handshake error and never loads.
     flag: Menu sweep 2026-09-09: www.chutneys.ai loads but is a near-empty placeholder: only the tagline "Savor the Flavor" and a contact form; no address, phone, email, hours, Instagram link, logo, or menu present.
     flag: Menu sweep 2026-09-09: A separate domain chutneys.us surfaced in search as "Chutneys Indian Vegetarian Restaurant | Brentwood, CA" -- very likely the same business -- but blocked automated fetches with HTTP 403 on every page tried, so it could not be used to verify any facts.
     flag: Menu sweep 2026-09-09: No address, phone, email, hours, Instagram, logo, or menu/prices could be confirmed from any reachable page for this business.
  */
  'chutneys': {
    cuisine: "Indian",
    needsSite: true,
    tagline: "One-page placeholder site: the tagline 'Savor the Flavor', a contact",
  },

  /*
     classy-canines — gathered 2026-09-09 from own-domain
     their spelling: "Classy Canine's Wiggle Rumps" (roster keeps "classy-canines")
     they are: Pet grooming
     logo: https://static.wixstatic.com/media/769eaa_5784054376a44f629bbefe56e79ae916~mv2.png (3468x1048) — not cut into a tile yet
     flag: the skunk-service price contradicts itself: the homepage says '$200, including de-skunking baths', the travel-spa page says 'starting at $200 plus de-skunking baths'
     flag: the footer address reads '2602 or 2644 Castro Valley Blvd' — two street numbers; the contact page uses 2602
     flag: the cat grooming page still lists '2024 dates available'
     flag: typos throughout: 'Transpertation', 'communtiy', 'Burmese Mountain Dogs'
  */
  'classy-canines': {
    address: "2602 Castro Valley Blvd, Castro Valley, CA 94546",
    phone: "(510) 583-7297",
    hours: "Mon-Sat 7:30am-6pm, some Sundays",
    instagram: "classycanineswigglerumps",
    cuisine: "Pet grooming",
    groups: [
      { name: "Prices, from", items: [
        ["Full Haircut Premium Package","Nail trim, ears, brush-out, massage bath, blow dry, a full trim to breed standard",10000,"small $100-$115"],
        ["Face, Feet and Tail Package","A touch-up trim: face, feet and sanitary areas",9500,"small $95-$105"],
        ["Bath Package","With a bow or bandana and deodorant",5500,"small $55-$85"],
        ["Self-Wash","They supply tubs, shampoo and dryers, and clean up",2000],
        ["Skunked Dog Service","The travel spa comes to you for de-skunking",20000,"from $200"],
        ["Cat Full Grooming","Warm bath, blow dry, brush-out, a lion trim; cats one Monday a month",15500,"$155-$250+"],
        ["Cat Nail Trim","",4000,"$40-$50"],
      ] },
    ],
    quoteOnly: "Family-owned since 2015 — the 'Pet Valley Block' in Castro Valley: an award-winning grooming spa, a mobile travel spa, a dog school, a self-wash and a boutique. Grooming is priced in ranges by size and breed, small through XXXL; the mobile travel spa costs more than in-salon; a $25 dog or $50 cat booking deposit.",
  },

  /*
     dads-bbq — gathered 2026-09-09 from own-domain
     their spelling: "Dad's BBQ" (roster keeps "dads-bbq")
     they are: Mississippi-style BBQ
     flag: hours are from their Instagram bio; the site itself lists none
     flag: Glenn: 'Brentwood • Goods' then 'Actually, Antioch'
     flag: a food trailer books by DM or email, per their bio
     flag: menu: 23 items read from https://dadsbbqco.com/menu on 2026-09-05
  */
  'dads-bbq': {
    address: "5887 Lone Tree Way, Suite R, Antioch, CA 94531",
    email: "dadsbbq101@gmail.com",
    hours: "Every day 11am-8:30pm",
    instagram: "dadsbbqca",
    cuisine: "Mississippi-style BBQ",
    tagline: "Mississippi-style barbecue in Antioch since 1999",
    sections: [
      { name: "Sides", items: [
        ["Greens freshly cooked","Mixed with collard, mustard and turnups with smoked turkey wings",800,"dads-bbq-greens-freshly-cooked"],
        ["Potato salad","",600,"dads-bbq-potato-salad"],
        ["Green beans","Sautéed in onions and potatoes",700,"dads-bbq-green-beans"],
        ["Macaroni & cheese","Homemade baked macaroni and cheese",900,"dads-bbq-macaroni-cheese"],
        ["Baked beans","",700,"dads-bbq-baked-beans"],
        ["Muffin","",300,"dads-bbq-muffin"],
      ] },
      { name: "Gumbo", items: [
        ["Mom's gumbo","Our Louisiana well freshly seasoned with shrimp, crabmeat, smoked hot and mild sausages over rice",1800,"dads-bbq-mom-s-gumbo"],
      ] },
      { name: "Entrées", items: [
        ["Combo","A choice of 2 meats and 2 sides",2500,"dads-bbq-combo"],
        ["3-way","A choice of 3 meats and 2 sides",3000,"dads-bbq-3-way"],
        ["4-way","A choice of 4 meats and 2 sides",3600,"dads-bbq-4-way"],
        ["Entree dinner","A choice of ribs, links, chicken, tri tip and rib tips and 2 side orders",2000,"dads-bbq-entree-dinner"],
      ] },
      { name: "Meats", items: [
        ["1 pound of tritip","Side orders are not included",2600,"dads-bbq-1-pound-of-tritip"],
        ["1/2 slab of ribs","Side orders are not included",2500,"dads-bbq-1-2-slab-of-ribs"],
        ["Slab of ribs","Pork ribs",4500,"dads-bbq-slab-of-ribs"],
        ["Whole chicken","Side orders are not included",2500,"dads-bbq-whole-chicken"],
      ] },
      { name: "Desserts", items: [
        ["Sweet potato pie","Baked fresh daily",600,"dads-bbq-sweet-potato-pie"],
        ["Banana pudding","Baked fresh daily",700,"dads-bbq-banana-pudding"],
        ["Peach cobbler","Baked fresh daily",800,"dads-bbq-peach-cobbler"],
      ] },
      { name: "Drinks", items: [
        ["Kool-aid","That good flavor from your mommas kitchen",400,"dads-bbq-kool-aid"],
        ["Flavors","Pepsi, diet pepsi, orange, root beer, lemonade and sprite,",250,"dads-bbq-flavors"],
        ["Sweet tea","",400,"dads-bbq-sweet-tea"],
      ] },
      { name: "Fried Fish Friday", items: [
        ["3pc Cat Fish","",1800,"dads-bbq-3pc-cat-fish"],
        ["6pc Cat Fish","",2400,"dads-bbq-6pc-cat-fish"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Diablo Auto Detailing — gathered 2026-09-09 from own-domain
     they are: Mobile auto detailing
     logo: https://diabloautodetailing.com/diablo-logo.jpg (920x920) — not cut into a tile yet
     flag: the site is an empty JS shell without JavaScript; every fact came from their own JS bundle and structured data
     flag: no street address published — their own structured data sets streetAddress undefined (Danville, CA 94526; 'mobile appointments, on-location only')
     flag: customer reviews are hardcoded with frozen relative dates ('3 weeks ago')
     flag: Sunday is absent from the hours rather than marked closed
  */
  'diablo-auto-detailing': {
    phone: "(510) 631-1230",
    hours: "Mon-Sat 8am-6:30pm",
    instagram: "Diablo.auto.detailing",
    cuisine: "Mobile auto detailing",
    groups: [
      { name: "Prices, from", items: [
        ["One-Time","One complete interior and exterior detail, no commitment",27500,"from $275"],
        ["Monthly","Every month: a 2-3 hour detail with interior and carpet shampoo, hand wash, wheels and ceramic wax",17500,"from $175"],
        ["Quarterly","Every three months, the same full detail",22500,"from $225"],
      ] },
    ],
    quoteOnly: "'Mobile car detailing in the East Bay' — interior and exterior care across Walnut Creek, Danville, Alamo and nearby, with hand wash, wheel cleaning and ceramic wax. Starting-at floors — their site says 'Prices are starting points. Final price is confirmed by vehicle condition and model.'",
  },

  /*
     Donut Farm — gathered 2026-09-09 from own-domain
     they are: Vegan donuts
     logo: https://donutfarmberkeley.com/assets/logo.png (2306x1722) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the visible page says Sat-Sun 9am-2pm while their structured data says 7:30am-3pm — Mon-Fri 7:30am-3pm agree in both, but no hours carried
     flag: a badge claims '100% organic since 2003' while the site also says founded 2006
     flag: sister cafe Coffee Conscious at 1312 Gilman St, Berkeley; the former Oakland flagship at 6037 San Pablo is stated closed
     flag: Menu sweep 2026-09-09, still no readable prices: donutfarmberkeley.com does not publish a menu with prices anywhere on the site; flavors rotate daily and are described as posted to Instagram instead. The only ordering link on the site is a third-party DoorDash storefront, which is excluded as a source per instructions, so no items with prices coul
     flag: Menu sweep 2026-09-09: The business's own site states the original Oakland flagship (6037 San Pablo) is CLOSED and operations moved to two Berkeley shops (3278 Adeline St main shop; 1312 Gilman St 'Coffee Conscious' sister cafe) -- this contradicts the task's framing of this business as being in Oakland, CA; the address g
     flag: Menu sweep 2026-09-09: Instagram handle linked from the site is @donutfarmoakland, still referencing Oakland even though the site says that location is closed.
     flag: Menu sweep 2026-09-09: No menu or prices published in text on the own-domain site; only a third-party DoorDash ordering link was found (excluded per sourcing rules). /menu, /locations, and /order paths on the site all returned 404.
     flag: Menu sweep 2026-09-09: logo_url was a relative path (assets/logo.png) in the page HTML, resolved here against the site root.
     flag: Menu sweep 2026-09-09: Site markets itself with the word 'organic' rather than explicitly using the word 'vegan' on the pages fetched, though several rotating/brunch items are plant-based (e.g. Pepples Tofu Scramble, Buffalo Cauliflower).
  */
  'donut-farm': {
    address: "3278 Adeline St, Berkeley, CA 94703",
    phone: "(510) 879-6980",
    email: "pepples.donuts@gmail.com",
    hours: "Daily 7:30am-3pm",
    instagram: "donutfarmoakland",
    cuisine: "Vegan donuts",
    tagline: "'Real good donuts. Always organic.' — 100% organic, fully vegan donuts",
    photos: [
      {"src":"/food/donut-farm-site-0-lg.webp","alt":"Steak and egg tacos from Donut Farm's weekend brunch","credit":"Their own photo, from donutfarmberkeley.com"},
      {"src":"/food/donut-farm-site-1-lg.webp","alt":"A box of assorted Donut Farm vegan donuts","credit":"Their own photo, from donutfarmberkeley.com"},
      {"src":"/food/donut-farm-site-2-lg.webp","alt":"Salted caramel vegan donut","credit":"Their own photo, from donutfarmberkeley.com"},
      {"src":"/food/donut-farm-site-3-lg.webp","alt":"Cold brew coffee and donuts","credit":"Their own photo, from donutfarmberkeley.com"},
    ],
    contactOnly: "'Real good donuts. Always organic.' — 100% organic, fully vegan donuts. No prices anywhere on the site; the day's flavours are posted on Instagram and ordering goes through a delivery link.",
  },

  /*
     Doodle Cakes — gathered 2026-09-09 from own-domain
     their spelling: "doodlecakes" (roster keeps "Doodle Cakes")
     they are: Cake Shop
     logo: https://www.doodlecakesbakery.com/uploads/b/bfdb8ef2731066eeca258ade92385bd80c7ea0ea2970568cbd049d48cb2d3f17/DC_shine_pink_1775514271.png (2000x2000) — not cut into a tile yet
     flag: Operator's exact note: Alameda • Goods
     flag: Name spelling: the site and Instagram display name is the one-word lowercase 'doodlecakes' (page title, web manifest, Square location name, logo alt text); the logo artwork reads 'doodle cakes'; the domain and Instagram handle are 'doodlecakesbakery'. The operator's spelling 'Doodle Cakes Bakery' does not appear anywhere on the site.
     flag: Phone: not displayed anywhere on the site or the Instagram bio (no tel: link, no phone text, none in the Store info panel). A number (+1 510-995-8539) exists only inside the site's non-rendered Square store-location JSON, so phone is left null pending verification.
     flag: Hours agree across three of their own sources: site footer 'OPEN to Public: WED, THUR, FRI & SAT 11AM - 3PM' (also 'Open to Public Wed- Sat, 11am-3pm' on the custom-cake form), Square pickup/delivery hours Wed-Sat 11:00-15:00 with Sun-Tue empty, and the Instagram bio 'WED-SAT / 11AM-3PM'.
     flag: Site kind: own domain (doodlecakesbakery.com) running Square Online; the homepage IS the ordering menu (/s/order redirects to /). There are no separate about, menu, contact or locations pages (all 404).
     flag: Standard Cakes: the 'Cakes / Standard Cakes' section rendered empty (heading only) on the live menu at first load, but the site's published catalog lists 5 visible items in that category, and each product page loads live with the same price (verified 2026-09-07): Standard 4" Cake $50.00, Standard 6" Cake $70.00, Standard 8" Cake $90.00 (each 'prep time of 3 business days'), Standard Lunchbox Mini Cake 4” $30.00 and Celebration Box $40.00 (each 'prep time of 20 hours'), all with a required cake-flavor choice (e.g. Red Velvet/Cream Cheese, Ube/Ube, Chocolate/Peanut Butter) and optional sprinkles or edible glitter. Included under section 'Cakes / Standard Cakes'; the empty render is most likely the auto-selected next pickup slot (Wednesday 11:00 AM) falling inside their prep time.
     flag: Visible but uncategorized products reachable only by direct URL (not shown on the menu) were excluded from items: 6 Box $25.50, Cake Slice $6.30, Custom 4” Lunchbox Mini Cake $30.00, Custom Celebration Box $40.00, Flower Pot Cake $32.50, Heart $6.00, Tiny cake $10.00, Paper Bag $0.10.
     flag: The sitemap lists about 95 product URLs; most are rotated-out monthly cupcake flavors or dated seasonal items (e.g. 'available until 5/30', Lunar New Year 2026, Mother's Day Heart, Jack-O-Lantern) or catalog-hidden listings that still load with a price by direct URL (e.g. 'Custom 6” Cake' $70.00, visibility hidden). Excluded.
     flag: Cupcake flavors rotate monthly ('Monthly Flavors'); the 6 standard and 6 GDE* (gluten, dairy and egg free) flavors listed are the selection rendered on 2026-09-07. Dozen assortments say flavors may vary from the picture.
     flag: Ordering rules on the site: 'Email = doodlecakesbakery.online@gmail.com for custom orders'; 'High volume of emails, responses take 3 days'; custom cakes need at minimum 1-2 weeks notice for elaborate designs and 2-3 business days for simple designs; '*THIS INQUIRY FORM DOES NOT GUARANTEE AN ORDER*'. Instagram bio adds 'NO DM ORDERS!'.
     flag: Fulfillment per the ordering page: store pickup and local delivery both enabled (Square shows 'Lead time: 1 day', order cutoff 10:00 AM, delivery fee $0); pickup instruction 'Please give First and Last Name to receive your order.'; returns policy 'We do not refund or exchange products.'; notice that the cashier or delivery driver may ask to see ID and/or the credit card used.
     flag: Instagram (screenshot, @doodlecakesbakery, display name 'doodlecakes', category 'Cake Shop'): '647 Central Ave, Alameda, CA', 'WED-SAT / 11AM-3PM', 'NO DM ORDERS!', 'Email: Doodlecakesbakery.online@gmail.com' (same address as the site, capitalized differently), link doodlecakesbakery.com. Consistent with the site.
     flag: Logo: logo_url is the pink square header logo (alt 'doodlecakes logo', 2000x2000 PNG, opaque pink background, white cupcake with hippo and sparkles) and matches the operator's second screenshot. Alternatives on the site: line-art wordmark used in the footer (DC-line_only_B_1652479102.png, 1124x294, transparent), a purple-circle app icon/favicon variant (icon_512x512_android_NTM5NT.png, 510x510, theme color #cb9ac7), and a different cartoon hippo-face design stored as the site's logo field (BigLogo_Face_1652487961.png, 6000x6000, transparent, 4.7 MB).
     flag: Site meta description: 'Bay Area bakery in Alameda, CA. Vegan & gluten free options. Birthday, wedding and corporate event cakes & dessert surprise boxes.'
  */
  'doodle-cakes': {
    address: "647 Central Avenue, Alameda, CA 94501",
    email: "doodlecakesbakery.online@gmail.com",
    hours: "Wed-Sat 11am-3pm, closed Sun-Tue",
    instagram: "doodlecakesbakery",
    cuisine: "Cake Shop",
    tagline: "Cupcake and cake shop in Alameda with vegan and gluten-free options",
    sections: [
      { name: "Cupcakes", items: [
        ["Surprise Box","What dessert in a box did you get?",1999],
        ["Surprise Box 6 Pack","What 6 pack of desserts did you get?",11000],
      ] },
      { name: "Cupcakes / Daily Standard Cupcakes", items: [
        ["Chocolate Wasted","Decadent dark chocolate cake, topped with chocolate frosting, chocolate sauce and chocolate chips.",499],
        ["Red Velvet","Riveting Red velvet cake, a lighter chocolate cake, topped with cream cheese frosting.",499],
        ["Cookies & Cream (CnC)","Captivating cookies & cream vanilla cake, topped with vanilla frosting, and chocolate cookie.",499],
        ["Piñata","Vanilla cake filled with mini m&ms, topped with vanilla frosting and mini m&ms.",499],
        ["Chocolate Caramel Frappe","Chocolate cake topped with caramel frosting, whipped cream, caramel drizzle and a candy straw.",499],
        ["Lemon","Lemon cake, topped with lemon frosting.",499],
      ] },
      { name: "Cupcakes / Daily VEGAN Gluten, Dairy, and Egg Free Cupcakes", items: [
        ["GDE* Free Strawberry Crunch","Gluten free, dairy free and egg free strawberry cake, topped with dairy free vanilla frosting and strawberry crunch crumbs.",499],
        ["GDE* Free Cinnamon Toasty","Gluten free, dairy free, and egg free cinnamon cake, topped with dairy free vanilla frosting, cinnamon sugar and Catalina Crunch.",499],
        ["GDE* Free Chocolate Oreo","Gluten free, dairy free and egg free chocolate cake, topped with dairy free vanilla frosting and a gluten free chocolate Oreo cookie.",499],
        ["GDE* Free Lemon Blueberry","Gluten, dairy and egg free blueberry cake, topped with dairy free lemon frosting, freeze dried blueberries and edible glitter.",499],
        ["GDE S’mores","Gluten, dairy and egg free chocolate cake, graham cracker crust, topped with dairy free vanilla frosting, oat chocolate, marshmallows and a graham cracker.",499],
        ["GDE* Free Banana Split","Gluten, dairy and egg free spiced banana cake, topped with dairy free vanilla frosting, dairy free chocolate sauce, banana chips, sprinkles, maraschino cherry and edible glitter.",499],
      ] },
      { name: "Cupcakes / By the Dozen", items: [
        ["Dozen Mixed Assortment","1 Dozen Mixed Assortment of our GDE* Free and Standard Cupcakes (1 Each of the 6 Standard Monthly Flavors* and 6 GDE* Free Monthly Flavors). *Flavors may vary from picture indicated. Check the individual cupcakes for the current selection. PLEASE NOTE: •Mixed Assortment: Contains all 12 flavors; which includes 1 each of the GDE* Free Flavors, and 1 each of the Standard Flavors. **If you would like a mix of Standard Flavors only or GDE* Free Flavors only, please select the indicated Assortment**",5500],
        ["Dozen GDE* Free Assortment","1 Dozen Assortment of our Gluten, Dairy and Egg Free Cupcakes (2 Each of the GDE* Free Monthly Flavors*) *Flavors may vary from picture indicated. Check the individual cupcakes for the current selection.",5500],
        ["Dozen Standard Assortment","1 Dozen Assortment of our Daily Standard Cupcakes (2 Each of the Standard Monthly Flavors*). *Flavors may vary from picture indicated. Check the individual cupcakes for the current selection.",5500],
        ["Mini Cupcake Assortment","* Flavors may vary from picture indicated. Check the individual cupcakes for the current selection. PLEASE NOTE: • Mixed Assortment : Contains all 12 flavors; which includes 1 each of the GDE* Free Flavors, and 1 each of the Standard Flavors • Standard Assortment : Contains 2 each of the Monthly Standard Flavors • GDE Free Assortment : Contains 2 each of the Monthly GDE Free Flavors",2999],
      ] },
      { name: "Cakes / Standard Cakes", items: [
        ["Standard 4\" Cake","4” Small Cake Serves 2-6 people. Custom writing available - maximum of 4 words. Standard cakes are decorated based on flavor profile/Baker’s choice. For custom orders, please fill out our Inquiry Form.",5000,null,"3 business days prep, 12 flavors"],
        ["Standard 6\" Cake","6\" Cake Serves 8-14 Custom writing available. Standard cakes are decorated based on flavor profile/Baker’s choice. For custom orders, please fill out our Inquiry Form.",7000,null,"3 business days prep, 12 flavors"],
        ["Standard 8\" Cake","8\" Cake Serves 14-28 Custom writing available. Please add the message in the order notes. Standard cakes are decorated based on flavor profile/Baker’s choice. For custom orders, please fill out our Inquiry Form.",9000,null,"3 business days prep, 12 flavors"],
        ["Standard Lunchbox Mini Cake 4”","4” Lunchbox Mini Cake (Bento Cake) Serves 2-4 people. Custom writing available - maximum of 4 words. Standard cakes are decorated based on flavor profile/Baker’s choice. For custom orders, please fill out our Inquiry Form.",3000,null,"20 hours prep, 11 flavors"],
        ["Celebration Box","4\" Lunch box Mini Cake + 2 Standard Size Cupcakes Serves 2-6 Custom writing available - maximum 4 words. Standard cakes are decorated based on flavor profile/Baker’s choice. For custom orders, please fill out our Inquiry Form.",4000,null,"20 hours prep, 10 flavors"],
      ] },
    ],
    siteNote: "Prices are from the live Square Online ordering menu that is the doodlecakesbakery.com homepage (rendered 2026-09-07) and its catalog data; hours from the site's own footer text, Square pickup hours and the Instagram bio, which all agree.",
  },

  /*
     Downtown BBQ — gathered 2026-09-09 from own-domain
     their spelling: "Downtown Barbecue" (roster keeps "Downtown BBQ")
     they are: Barbecue
     logo: https://static.spotapps.co/website_images/ab_websites/476501_website_v1/logo.png (200x200) — not cut into a tile yet
     flag: the menu intro calls it 'Downtown BBQ' while the site name is 'Downtown Barbecue'
     flag: menu: 61 items read from https://downtownbarbecue.co/santa-rosa-downtown-barbecue-drink-menu on 2026-09-05
  */
  'downtown-bbq': {
    address: "610 3rd Street, Santa Rosa, CA 95404",
    phone: "(707) 843-4830",
    email: "bbqsantarosa@gmail.com",
    hours: "Daily 11am-9pm, happy hour 3-6pm",
    instagram: "downtownbarbecue",
    cuisine: "Barbecue",
    sections: [
      { name: "Salads", items: [
        ["SONOMA SALAD","Butter lettuces, shaved roots, pickled shallots, roasted pumpkin seeds with smoked house vinaigrette",1400,"downtown-bbq-sonoma-salad"],
        ["CAESAR SALAD","CLASSIC CEASAR, ANCHOVY DRESSING, PARMESAN, FREID CROUTONS",1400,"downtown-bbq-caesar-salad"],
        ["Pit Smoked Salmon Salad","",1900,"downtown-bbq-pit-smoked-salmon-salad"],
      ] },
      { name: "California Pizza", items: [
        ["Brisket & Calabrian Chili","",1900],
        ["Pork & Pineapple","",1800],
        ["Cali Pizza Chicken","",1800],
        ["Eggplant Parmigiano","",1800],
        ["Pit Smoked Salmon Pizza","",2000],
      ] },
      { name: "Desserts", items: [
        ["Banana Pudding","",800],
        ["CHOC MOUSSE","",800],
        ["CHEESE CAKE","",800],
        ["VALLEY FORD SOFT SERVE","",800,"downtown-bbq-valley-ford-soft-serve"],
        ["VANILLA & LEMON OLIVE OIL & SEA SALT","Vanilla soft served topped with lemon olive oil drizzle and flaky sea salt",900,"downtown-bbq-vanilla-lemon-olive-oil-sea-salt"],
        ["CREME BRULEE","",800],
      ] },
      { name: "Sandwiches", items: [
        ["Brisket & Peppers","",1900],
        ["Classic Pulled Pork","",1600],
        ["BRISKET AND PEPPERS SANDO","Tender brisket, melted onion and peppers, horseradish mayo",2000],
        ["SMASH BURGER","ground brisket, grilled onion, American, pickles, campfire sauce",1300],
        ["MEMPHIS SANDO","",1600],
      ] },
      { name: "Meats", items: [
        ["Brisket","Slow smoked Texas style, salt + pepper, crispy crust prime brisket",2100,"downtown-bbq-brisket"],
        ["Memphis Ribs","Succulent competition style, St. Louis cut ribs",2400,"downtown-bbq-memphis-ribs"],
        ["Cajun Chicken","Bold, spicy and earthy smoked chicken - comes fully cooked but it will look a bit pink due to smoke ring.",1800,"downtown-bbq-cajun-chicken"],
        ["House Hot Link","",1000,"downtown-bbq-house-hot-link"],
        ["1 Meat Plate W/ Corn Bread","",2500],
        ["4 Person Pitmaster Platter","SAMPLING OF SMOKED MEATS, PICKLES, four small SIDES and four slices of cornbread 12/lb Brisket, 1/2lb Pulled Pork, 1/2 Rack Ribs and 1/2 Chicken, 3 Wings",12800,"downtown-bbq-4-person-pitmaster-platter"],
        ["6-8 Person Pitmaster Platter","SAMPLING OF SMOKED MEATS, PICKLES, four LARGE SIDES and eight slices of cornbread 1lb Brisket, 1lb Pulled Pork, Full Rack Ribs and Whole Chicken, 6 Wings",23900,"downtown-bbq-6-8-person-pitmaster-platter"],
        ["TWICE BAKED POTATO","LOADED TWICE BAKED RUSSET POTATO, GOUDA, GREEN ONION, BUTTER, SOUR CREAM, BBQ SAUCE WITH YOUR CHOICE OF BBQ MEAT",1200,"downtown-bbq-twice-baked-potato"],
        ["MEMPHIS WINGS","",1300],
        ["BUFFALO WINGS","",1300],
        ["PORK BELLY BURNT ENDS","",1700],
        ["HABANERO WINGS","",1300],
        ["Luau Plate","",2000],
      ] },
      { name: "Sides/salads", items: [
        ["WEDGE SALAD","",1700],
        ["BURNT ENDS CHILLI","DEEP AND SPICY CHILLI, WITH CREMA, CHEESE AND GREEN ONIONS",900,"downtown-bbq-burnt-ends-chilli"],
        ["BUTTERNUT SQUASH","Roasted Butternut Squash with brown butter and sage",800,"downtown-bbq-butternut-squash"],
        ["CUCUMBER SAL","cucumber with creamy dill dressing",800,"downtown-bbq-cucumber-sal"],
      ] },
      { name: "Baked Beans", items: [
        ["SLAW","Cabbage and carrot, brined and tossed in house mayo dressing. LARGE (16oz)",800,"downtown-bbq-slaw"],
        ["TALLOW FRIES","",800,"downtown-bbq-tallow-fries"],
      ] },
      { name: "Kiddos", items: [
        ["KIDS PIZZA","THIN CRUST PIZZA WITH TOMATO AND CHEESE",1100,"downtown-bbq-kids-pizza"],
      ] },
      { name: "Kids Chicken Tenders", items: [
        ["KIDS CHICKEN TENDERS","3 pieces of breaded chicken tenders",1000,"downtown-bbq-kids-chicken-tenders"],
        ["KIDS MAC N CHEESE","",800],
        ["KIDS BURGER","",1000],
      ] },
      { name: "Toppers", items: [
        ["MEMPHIS CHX TOPPER","",600],
        ["SMOKED CHX TOPPER","",500],
        ["PULLED PORK TOPPER","",500],
        ["BRISKET TOPPER","",800],
        ["PORK BELLY TOPPER","",800],
      ] },
      { name: "Sauces", items: [
        ["SIDECAMPFIRE SAUCE","",100],
        ["SIDE RANCH","",100],
        ["SIDE BLUE CHEESE","",100],
        ["SIDE CALI MUSTARD","",100],
        ["SIDE CEASAR DRESSING","",100],
        ["SIDE SONOMA SALAD DRESS","",100],
        ["SIDE MIDWEST BBQ SAUCE","",100],
        ["SIDE CALI BBQ SAUCE","",100],
      ] },
      { name: "Tacos", items: [
        ["QUESABIRRIA","",1700],
        ["PAPAS TACOS","",1600],
        ["PULLED PORK TACO","",1500],
        ["TT PORK","",500],
        ["TT BRISKET","",500],
        ["TT PAPA","",500],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Eagle Pet Grooming — gathered 2026-09-09 from own-domain
     they are: Mobile pet grooming
     logo: https://eaglepetgrooming.com/svg/eagle-logo.svg — not cut into a tile yet
     flag: their own site contradicts itself on where they work: a header toggle offers Nevada while the FAQ says the Bay Area and Salt Lake City
     flag: the footer reads 'Eagle Mobile Pet Grooming' and 2025 against 'Eagle Pet Grooming' everywhere else
     flag: hours not published; payment goes directly to the groomer
  */
  'eagle-pet-grooming': {
    phone: "(650) 278-3611",
    email: "contact@eaglepetgrooming.com",
    instagram: "eaglepetgrooming",
    cuisine: "Mobile pet grooming",
    contactOnly: "Mobile pet grooming for dogs and cats — 'we come to you with our state-of-the-art mobile salons to give your pet the best spa day.' Prices exist only inside their booking flow and depend on location, package, breed, weight, behaviour and coat.",
  },

  /*
     Eight Acres Kitchen & Bar — gathered 2026-09-09 from own-domain
     they are: Contemporary comfort food
     logo: https://eightacresbrentwood.com/wp-content/uploads/8Logo.png (176x178) — not cut into a tile yet
     flag: name varies on-site: page title '8 Acres - Le Bon Temps' vs 'Eight Acres Kitchen & Bar' in content and logo
     flag: a footer icon links to sister restaurant Forge Pizza Rockridge's Resy page (Oakland) instead of their own reservation page
     flag: their own Resy link hardcodes a stale date parameter (date=2026-07-08)
     flag: menu image pages beyond page 1 return 403, so brunch, beverage and wine prices are not readable
     flag: menu: 23 items read from https://eightacresbrentwood.com/#menu on 2026-09-05
  */
  'eight-acres': {
    address: "801 Foothill Drive, Brentwood, 94513",
    phone: "(925) 848-0858",
    email: "info@eightacresbrentwood.com",
    hours: "Daily 11am-9pm; brunch Sat-Sun 11am-2pm; happy hour Mon-Fri 2-5pm",
    instagram: "eightacresbrentwood",
    cuisine: "Contemporary comfort food",
    sections: [
      { name: "Starters", items: [
        ["Marinated Olives","mediterranean blend, orange, chili flake, fennel served w/ toasted sourdough",1250,"eight-acres-marinated-olives"],
        ["Baked Macaroni & Cheese","smoked three cheese blend, elbow macaroni",1300,"eight-acres-baked-macaroni-cheese"],
        ["Wisconsin Cheese Curds","chickpea battered, marinara sauce",1450,"eight-acres-wisconsin-cheese-curds"],
        ["Brussel Sprouts","crispy Brussels sprouts, sambal honey, micro cilantro",1350,"eight-acres-brussel-sprouts"],
        ["Carne Asada Tots","crispy tater tots, grilled carne asada, queso, guacamole, pickled jalapeños, pico de gallo",1650,"eight-acres-carne-asada-tots"],
        ["Chicken Wings","choice of... sambal honey w/ micro cilantro and thai peanut sauce or traditional buffalo sauce w/ bleu cheese crumbles and herb ranch dressing",1550,"eight-acres-chicken-wings"],
      ] },
      { name: "Salads and soup", items: [
        ["Kale Caesar Salad","kale, caesar dressing, cracked black pepper, shaved grana padano, garlic croutons",1550,"eight-acres-kale-caesar-salad"],
        ["Strawberry Salad","strawberries, toasted walnuts, pickled red onion, goat cheese, citrus vinaigrette, arugula",1650,"eight-acres-strawberry-salad"],
        ["BLT Wedge","bacon, cherry tomatoes, iceberg lettuce, hard-boiled egg, pickled red onion, blue cheese crumbles, green goddess dressing",1650,"eight-acres-blt-wedge"],
      ] },
      { name: "Forge handcrafted pizzas", items: [
        ["Fat Boy Pizza","Italian sausage, bacon, pickled pepper, red onion, red sauce, mozzarella",2500,"eight-acres-fat-boy-pizza"],
      ] },
      { name: "Entrees and sandwiches", items: [
        ["BYO Burger","natural angus blend, LTOP on side. choice of cheese, sauce, and add ons. served on a brioche bun",2200,"eight-acres-byo-burger"],
        ["Buffalo Shrimp Sandwich","fried shrimp, buffalo sauce, lettuce, tomato, mayo, blue cheese crumbles, served on a toasted deli roll",2250,"eight-acres-buffalo-shrimp-sandwich"],
        ["Eight Acres Burger","natural angus blend, bacon jam, arugula, gruyere, pickled red onions, roasted garlic aioli. served on a brioche bun",2250,"eight-acres-eight-acres-burger"],
        ["Fried Chicken Sandwich","fried chicken, bacon, pimento cheese, lettuce, house pickles, chipotle mayo",2200,"eight-acres-fried-chicken-sandwich"],
        ["Muffaletta Sandwich","black forest ham, Molinari salame, hot sopressata, coppa, fontina cheese, olive salad, garlic aioli, served on a toasted deli roll",2300,"eight-acres-muffaletta-sandwich"],
        ["Ribeye Melt","shaved ribeye, gruyere, served on a toasted deli roll w/ side of au jus and horseradish cream",3000,"eight-acres-ribeye-melt"],
        ["Campanelle Pasta","campanelle pasta, roasted mushrooms, cherry tomatoes, arugula, pesto cream, grana padano",2450,"eight-acres-campanelle-pasta"],
        ["Fish + Chips","beer battered pacific cod, steak fries, tartar sauce",2450,"eight-acres-fish-chips"],
        ["Chicken Confit","chicken confit, ham hock stewed cannellini beans, sautéed greens, hot sauce jam on side",2600,"eight-acres-chicken-confit"],
        ["Blackened Mahi Mahi","whipped potatoes, sautéed greens, shrimp, andouille, white wine - lemon cream, crispy capers",3100,"eight-acres-blackened-mahi-mahi"],
      ] },
      { name: "Kids", items: [
        ["Kids Mac + Cheese","",1250],
        ["Kids Chicken Bites","",1250],
        ["Kids Fish + Chips","",1250],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Rancho Grande Taqueria — gathered 2026-09-09 from own-domain
     they are: Mexican
     logo: https://irp.cdn-website.com/77a86d20/dms3rep/multi/Color-Whtie-Logo.svg — not cut into a tile yet
     flag: the sign outside reads EL RANCHO GRANDE TAQUERIA; their own site, logo and footer say Rancho Grande Taqueria, so that is the name here
     flag: Glenn photographed the storefront and the window poster while delivering, 2026-09-04
     flag: Menu sweep 2026-09-09: Prices are from Rancho Grande Taqueria's own order.online storefront (order.online/store/rancho-grande-taqueria-pleasanton-24568904); the site's own /our-menu page on ranchograndetaq.com lists the same item names and descriptions but no prices at all.
     flag: Menu sweep 2026-09-09: ranchograndetaq.com's own /our-menu page lists item names and descriptions with no prices whatsoever; every price here comes from the order.online storefront instead.
     flag: Menu sweep 2026-09-09: Hours conflict: ranchograndetaq.com states Mon-Thu & Sat 8:00am-9:00pm, Fri 7:00am-9:00pm, Sun 8:00am-8:00pm, while the order.online storefront shows a single flat 'Online ordering hours: 8:00 AM - 8:00 PM' for every day — hours set to null because of this disagreement.
     flag: Menu sweep 2026-09-09: The order.online browser-tab title reads 'EL RANCHO GRANDE TAQUERIA' (with 'El'), while ranchograndetaq.com and its own page content consistently use 'Rancho Grande Taqueria' (no 'El'); used the site's own spelling for name_exact.
     flag: Menu sweep 2026-09-09: 'Bean & Cheese Burrito', 'Bean Rice & Cheese Burrito', and 'Bean & Rice Burrito' are each cross-listed under both the Burritos and Kids Menu categories at the same price on order.online; recorded once, under Burritos.
     flag: Menu sweep 2026-09-09: No email address found on ranchograndetaq.com.
     flag: Menu sweep 2026-09-09: Delivery/pickup is also offered via GrubHub and UberEats per the homepage; not used for pricing here.
     flag: Menu sweep 2026-09-09: Menudo soup is flagged on the menu itself as 'ONLY AVAILABLE SATURDAY & SUNDAY'.
     flag: Menu sweep 2026-09-09: 'Cheese' and 'Lettuce' are listed as add-on Extras with size options but no printed price, so they were not included as items.
  */
  'el-rancho-grande': {
    address: "2707 Hopyard Rd, Pleasanton, CA",
    phone: "(925) 600-8620",
    hours: "Mon-Thu and Sat 8am-9pm, Fri 7am-9pm, Sun 8am-8pm",
    instagram: "ranchogrande.taq",
    cuisine: "Mexican",
    tagline: "Tacos, burritos and enchiladas on Hopyard Road, open early",
    sections: [
      { name: "Burritos", items: [
        ["California Burrito","Filled with your choice of meats, including Carne Asada, Lengua, Cabeza, and more. Also available meat-free.",1595],
        ["Jumbo Burrito","With cheese, guacamole, sour cream, rice and beans, pico de gallo and lettuce.",1624],
        ["Super Burrito","With cheese, guacamole, sour cream, rice, beans & pico de gallo.",1494],
        ["Super Wet Burrito","With rice, beans, cheese, sour cream and guacamole, pico de gallo and enchilada or chile verde sauce with cheese on top.",1745],
        ["Super 2 Mix Meat Burrito","With rice, beans, cheese, and sour cream, guacamole, pico de gallo.",1750],
        ["Super Shrimp Burrito","With cheese, guacamole, sour cream, rice & beans, salsa.",2075],
        ["Super Burro Mar Y Tierra","Burrito filled with both seafood and land meats. Various meat options including Carne Asada, Lengua, Carnitas, and more.",2300],
        ["Super Burrito Fish","Grilled fish, rice, beans, cheese, sour cream, guacamole, and pico de gallo wrapped in a flour tortilla.",1800],
        ["Regular Burrito","With rice, beans and pico de gallo.",1225],
        ["Regular Wet Burrito","With rice, beans, pico de gallo and enchilada or chile verde sauce on top.",1475],
        ["Regular 2 Mix Meat Burrito","With rice, beans and salsa.",1624],
        ["Regular Shrimp Burrito","With rice, beans & salsa.",1850],
        ["Regular Burro Mar Y Tierra","Combination of land and sea flavors in a burrito. Choose from various meats such as beef, pork, chicken, or no meat option.",2099],
        ["Regular Burrito Fish","Grilled tilapia, rice, beans, cheese, pico de gallo, and salsa in a flour tortilla.",1550],
        ["Vegetarian Burrito","With cheese, guacamole, sour cream, rice and beans, pico de gallo, and lettuce (no meat).",1225],
        ["Vegetarian Wet Burrito","",1475],
        ["Vegan Burrito","With beans, guacamole, lettuce, pico de gallo.",1225],
        ["Bean Rice & Cheese Burrito","Refried beans, rice, and shredded cheddar cheese wrapped in a soft flour tortilla.",974],
        ["Bean & Cheese Burrito","Savory beans paired with melted cheese, encased in a soft, warm tortilla.",895],
        ["Bean & Rice Burrito","Refried beans and rice wrapped in a soft flour tortilla.",895],
        ["Rancho Grande Burrito Plate","With rice, beans, guacamole, sour cream, cheese, lettuce, choice of meats.",2095],
      ] },
      { name: "Tacos", items: [
        ["Taco","With onions and cilantro.",385],
        ["Taco Lengua","Beef tongue on a corn tortilla, topped with cilantro and onions.",550],
        ["Veggie Taco","Grilled veggies, black beans, lettuce, pico de gallo, cheese, and guacamole on a soft corn tortilla.",385],
        ["Fish Taco","With onions, cilantro & salsa.",675],
        ["Shrimp Taco","Grilled shrimp topped with shredded lettuce, fresh cilantro, and diced onions on soft corn tortillas.",675],
        ["Super Taco","With onions, cilantro & salsa, cheese, guacamole, sour cream, & lettuce.",975],
        ["Rancho Taco","With onions, cilantro, salsa, grilled with choice of meat, cheese on top and lettuce on the side.",725],
        ["(2) Queso Birria Tacos","Tacos with birria, cheese, onions, cilantro, and tomatillo salsa. Topped with beef broth.",1100],
        ["(3) Queso Birria Tacos","Slow-cooked beef in corn tortillas with melted cheese, served with a side of consomme for dipping.",1650],
        ["Taco #32","Tender taco filled with choices like Carne Asada, Carnitas, Chorizo, Pollo Adobado, and more.",1030],
        ["Chips","Fresh homemade tortilla chips typically served with salsa or guacamole.",200],
      ] },
      { name: "Quesadillas", items: [
        ["Rancho Grande Quesadilla","With sour cream, guacamole, cheese and choice of meat.",1425],
        ["Super Quesadilla","With sour cream, guacamole, cheese and choice of meat.",1175],
        ["Large Quesadilla (Cheese Only)","Melted cheese layered between two large flour tortillas, grilled to a golden brown.",995],
        ["Regular Quesadilla (Cheese Only)","Melted cheese enveloped in a golden, toasted tortilla.",600],
        ["Meat Quesadilla Regular","Quesadilla with your choice of meat: grilled steak, beef tongue, beef cheek, barbacoa beef, grilled chicken, shredded chicken, marinated chicken, seasoned pork, braised pork, green chili pork, spicy sausage, or pork stomach.",925],
        ["Large Quesadilla (Meat Only)","Stuffed with your choice of seasoned meats like Carne Asada, Lengua, Barbacoa, and more.",1200],
      ] },
      { name: "Nachos/Fries", items: [
        ["Super Nachos","Choice of meat, sour cream, guacamole and salsa.",1445],
        ["Regular Nachos","Cheese, sour cream, guacamole and salsa.",1100],
        ["Super Fries","Loaded fries topped with your choice of meat: options include various beef, chicken, pork, and chorizo.",1494],
      ] },
      { name: "Combo Plate", items: [
        ["Crispy Taco Combo 2","Crispy taco combo with choice of meats or seafood such as Carne Asada, Pollo Asado, Barbacoa, Carnitas, Shrimp, and more.",1800],
        ["Crispy Taco Combo 1","Crispy corn taco with choice of Carne Asada, Pollo Asado, Carnitas, Chorizo, seafood, and more.",1350],
        ["Super Taco Combo","Choose from a variety of meats like Carne Asada, Lengua, Pollo Asado, Chorizo, or Shrimp. Served as a taco plate.",1425],
        ["1 Taco Combo","1 taco topped with onions & cilantro w/ side rice & beans with cheese on top.",1050],
        ["2 Taco Combo","2 tacos topped with onions & cilantro w/ side rice & beans with cheese on top.",1425],
        ["3 Taco Combo","3 tacos topped with onions & cilantro w/ side rice & beans with cheese on top.",1795],
        ["Taco Salad","With rice, beans, guacamole, sour cream, cheese, lettuce, choice of meats.",1775],
      ] },
      { name: "Plates", items: [
        ["Carne Asada Plate","Grilled steak served with a roasted green chili pepper and a charred green onion.",2195],
        ["Bisteak Ranchero Plate","Tender steak strips with sauteed onions, bell peppers, and tomatoes, served with seasoned rice, refried beans topped with shredded cheese, and a side of fresh lettuce.",2295],
        ["Rancho Grande Plate","With rice, beans, guacamole, sour cream, cheese, lettuce and your choice of meat.",2150],
        ["3 Enchilada Combo","Three enchiladas with a choice of meats or seafood, topped with your choice of red or green sauce.",1995],
        ["2 Enchilada Combo","Choice of protein including beef, tongue, barbacoa, chicken, pork, and seafood. Sauces: red or green.",1482],
        ["1 Enchilada Combo","Enchilada combo with choice of meat including Carne Asada, Lengua, Barbacoa, and more. Wet options: red or green.",1248],
        ["Fajitas (Beef)","Tender beef strips sauteed with bell peppers and onions, seasoned with traditional Mexican spices.",2295],
        ["Fajitas (Chicken)","Grilled chicken with bell peppers and onions, served with rice, beans, tortillas, and salad.",2295],
        ["Fajitas Mix","Fajitas mix served with a selection of meats including Carne Asada, Lengua, Barbacoa, and many more.",2399],
        ["3 Flautas Plate","Chicken only.",1995],
        ["Chile Relleno Plate","Roasted poblano pepper stuffed with cheese, topped with tomato sauce, served with refried beans, Mexican rice, shredded lettuce, guacamole, and sour cream.",1875],
        ["Chimichanga Plate","Crisp flour tortilla filled with choice of meats like Carne Asada, Lengua, Barbacoa, or seafood such as Shrimp or Fish.",1875],
        ["Carne Con Chile Plate","Grilled beef strips with grilled onions cooked with spicy salsa. Served with rice, refried beans and tortillas.",1995],
      ] },
      { name: "Mariscos", items: [
        ["Mojarra","Fried whole fish. Fried fish, rice, beans, tortillas and salad.",2250],
        ["Camarones A la Diabla","Succulent shrimp in a spicy red sauce, served with rice, shredded lettuce, tomato, onion, and red bell pepper.",2350],
        ["Fajitas de Camarones","With vegetables. With rice, beans, tortillas and salad.",2395],
        ["Camarones Al Mojo de Ajo","Succulent shrimp sauteed in garlic, served with shredded lettuce, bell peppers, onions, and a side of rice.",2350],
        ["Camarones A la Mantequilla","Succulent shrimp sauteed in butter, served with shredded lettuce, sliced tomatoes, onions, bell peppers, and a side of rice and beans.",2350],
        ["Camarones Adobados","Shrimp marinated in adobo sauce, typically prepared with a blend of chili peppers, garlic, and spices.",2350],
        ["Cocktel de Camaron","Shrimp cocktail with choice of cold, warm, or hot.",1999],
        ["Tostada de Ceviche (Fish)","Fresh fish ceviche on a crispy tostada, topped with sliced avocado.",675],
      ] },
      { name: "Breakfast Plate", items: [
        ["Egg Chorizo Plate","Scrambled eggs mixed with spicy chorizo sausage, served alongside refried beans topped with melted cheese and a portion of seasoned Mexican rice.",1675],
        ["Egg Ham Plate","Scrambled eggs mixed with ham, served with beans, potatoes, and tortillas.",1675],
        ["Egg Beef Plate","Tender beef options: Carne Asada, Barbacoa, Lengua (beef tongue), Cabeza (head meat), paired with eggs.",1675],
        ["Egg Chicken Plate","Eggs with a choice of chicken styles: Pollo Asado (grilled chicken), Pollo Desebrado (shredded chicken), or Pollo Adobado (marinated chicken).",1675],
        ["Egg Pork Plate","Eggs with choices of Carnitas, Pastor, or Chile Verde.",1675],
        ["Huevos Rancheros","With rice, beans and tortillas.",1675],
        ["Chilaquiles","With rice, beans and tortillas.",1675],
      ] },
      { name: "Breakfast Burritos", items: [
        ["Chorizo Egg & Cheese Burrito","Savory chorizo paired with scrambled eggs, melted cheese, and tender beans wrapped in a soft tortilla.",1050],
        ["Bacon Egg & Cheese Burrito","Scrambled eggs, crispy bacon, and melted cheese wrapped in a soft tortilla.",1050],
        ["Beef Egg & Cheese Burrito","Carne Asada, Barbacoa, Lengua, or Cabeza beef, combined with eggs and cheese, wrapped in a burrito.",1050],
        ["Ham Egg & Cheese Burrito","Ham, scrambled eggs, and cheese wrapped in a flour tortilla.",1050],
        ["Chicken Egg & Cheese Burrito","Grilled chicken options with eggs and melted cheese wrapped in a warm tortilla.",1050],
        ["Pork Egg & Cheese Burrito","Eggs, cheese, and a choice of pork (Carnitas, Pastor, or Chile Verde).",1050],
        ["Machaca Egg & Cheese Burrito","Shredded beef, bell peppers, onions, tomatoes, scrambled with eggs, and topped with cheese, all wrapped in a flour tortilla.",1050],
        ["Potato Egg & Cheese Burrito","Scrambled eggs, diced potatoes, and melted cheese wrapped in a soft flour tortilla.",1050],
      ] },
      { name: "Desserts", items: [
        ["Mexican Candy Flan","Smooth and creamy flan topped with a rich caramel sauce.",780],
        ["Churro","Crisp golden-brown fried dough stick, dusted with cinnamon sugar.",230],
      ] },
      { name: "Soups", items: [
        ["Menudo","Only available Saturday & Sunday.",1525],
        ["Pozole","Pork hominy soup.",1525],
      ] },
      { name: "Drinks", items: [
        ["Large Bev","Variety of fountain sodas: Coke, Diet Coke, Sprite, Fanta, Pink Lemonade, Root Beer.",395],
        ["Medium Bev","Coke, Diet Coke, Sprite, Fanta, Pink Lemonade, or Root Beer.",345],
        ["Imported Soda Bottle","A variety of Jarritos sodas: fruit punch, lime, mandarin, mineragua, pineapple, tamarind; also sangria and Sidral Mundet.",425],
        ["Bottle Coca Cola 1/2 Liter","",499],
        ["Bottle Fanta 1/2 Liter","Mexican Fanta in a 1/2 liter glass bottle.",499],
        ["Can Soda","Choice of Coke, Diet Coke, or Dr. Pepper in a can.",275],
        ["Bottle Water","",235],
        ["Large Agua Fresca","",515],
        ["Medium Agua Fresca","",411],
      ] },
      { name: "Kids Menu", items: [
        ["Meat Cheese Taco","Ground beef and cheese in a soft flour tortilla.",450],
        ["Cheese Quesadilla","Melted cheese folded in a soft flour tortilla, grilled to a golden brown.",600],
      ] },
      { name: "Tortas & Tostadas", items: [
        ["Torta","Mexican sandwich filled with a choice of meats such as beef, chicken, pork, or chorizo.",1475],
        ["Tostadas","With choice of meat, beans, lettuce, sour cream, cheese & guacamole.",1125],
        ["Ensalada","Mixed greens topped with your choice of Carne Asada, Lengua, Cabeza, Carnitas, Pastor, or various other meats.",1075],
      ] },
      { name: "A La Carte/Extra", items: [
        ["Crispy Taco A La Carta","Crispy taco. Filled with options: grilled steak, tongue, shredded chicken, seasoned pork, fish, and more.",655,null,"from"],
        ["1 Flauta","Deep-fried crispy tortilla typically filled with shredded chicken or beef, topped with lettuce, sour cream, and cheese.",650],
        ["Chile Relleno A La Carta","",806],
        ["Enchilada A La Carta","Enchilada with various meats or seafood. Choices include Carne Asada, Shrimp, Cheese, and more. Option for wet style with red or green sauce.",475],
        ["Tamale A La Carta","Tamale with choice of chicken or pork filling.",475],
        ["Chimichanga A La Carta","Chimichanga filled with choice of various meats, such as Carne Asada, Carnitas, Pollo, Chorizo, and more.",1245],
      ] },
      { name: "Extra", items: [
        ["Guacamole","Creamy avocado dip available in multiple sizes: 2oz, 4oz, 8oz, 20oz, 32oz.",150,null,"from"],
        ["Sour Cream","Various sizes available: 2oz, 4oz, 8oz, 20oz, 32oz.",150,null,"from"],
        ["Salsa","Assorted salsa options including Pico De Gallo, Salsa Verde, Chile Verde Salsa, Tomatillo Salsa, Sinaloa Salsa, Chipotle Salsa, and Very Spicy Salsa. Available in 8oz, 20oz, and 32oz.",600,null,"from"],
        ["Side Rice","Small or large servings of Mexican-style rice.",575,null,"from"],
        ["Side Beans","Beans with choice of size, type (refried or whole), and optional cheese in various quantities.",575,null,"from"],
        ["Side 1/2 Rice & 1/2 Beans","Rice and beans on the side, available in small or large. Choose between refried or whole beans.",575,null,"from"],
        ["Small Meat","Variety of meats including Carne Asada, Lengua, barbacoa, cabeza, pollo asado, and more; also fish and shrimp.",1599,null,"from"],
        ["Large Meat","Selection of various meats and seafood like Carne Asada, Lengua, Barbacoa, Shredded Chicken, and more.",3099,null,"from"],
      ] },
    ],
    siteNote: "Prices are from Rancho Grande Taqueria's own order.online storefront (order.online/store/rancho-grande-taqueria-pleasanton-24568904); the site's own /our-menu page on ranchograndetaq.com lists the same item names and descriptions but no prices at all.",
  },

  /*
     Empire State Pizza — gathered 2026-09-09 from own-domain
     they are: NYC-style pizza
     flag: Apple Maps prints the suite as Ste A; their own site says Suite C, which is what is here
     flag: no Instagram on the site; none carried
     flag: menu: 41 items read from https://www.empirestatepizzas.com/ on 2026-09-05
  */
  'empire-state-pizza': {
    address: "9130 Alcosta Blvd Suite C, San Ramon, CA 94583",
    phone: "(925) 421-1111",
    hours: "Daily 11am-9pm",
    cuisine: "NYC-style pizza",
    tagline: "NYC-style pizza on Alcosta Blvd, by the pie or the slice",
    sections: [
      { name: "Empire State Pizza", items: [
        ["Hot Wings","",1295],
        ["BBQ Wings","",1295],
        ["Garlic Twists","",1195],
        ["Garlic Bread With Cheese","",895],
        ["Mozzarella Sticks","",895],
        ["Garlic Sticks 10\"","Fluffy Garlic Sticks with White Creamy Garlic Sauce and Pesto Sauce topped with Cheese",1495],
        ["Create Your Own Pizza","",1795],
      ] },
      { name: "Empire Specialties", items: [
        ["NY Truffle Pizza","Sliced portobello mushrooms, fresh mozzarella, pecorino romano cheese, fresh garlic, drizzled with black & white truffle oil, sprinkled with black pepper.",2895],
        ["Empire Of Meats Pizza","Red sauce, italian sausage, ground beef, salami, pepperoni, ham and linguica.",2895],
        ["Mediterranean Mile Pizza","Pesto sauce, pepperoncini, spinach, green olives, red onions, sun-dried tomato, feta cheese.",2895],
        ["Garlic Chicken Pizza","Creamy white garlic sauce, chicken, mushrooms, green, onions, tomato and chopped garlic.",2895],
        ["Empire Margherita Pizza","Red sauce, fresh mozzarella, sliced tomato and fresh basil.",2895],
        ["Combination Pizza","House mix read sauce, pepperoni, salami, ham, sausage, mushroom, olive, bell pepper.",2895],
        ["NY White Pizza","Olive oil drizzle, ricotta cheese, mozzarella cheese, fresh garlic and fresh basil.",2895],
        ["Hot Honey Ricotta Pepperoni","Classic red sauce, cheese, pepperoni, ricotta cheese, fresh basil, hot honey sauce. Freshly grated grana padano cheese.",2895],
        ["BBQ Chicken Pizza","Smoked BBQ sauce, chicken, mushrooms, red onions, garlic and tomato.",2895],
        ["Uptown Pesto Pizza","Pesto sauce, chicken, sun-dried tomato, black olive, mushrooms, artichoke, feta cheese and red onion.",2895],
        ["Ray's Special Pizza","Chicken, mushroom, artichoke, roasted garlic, fresh basil, romano cheese, white garlic sauce.",2895],
        ["Vegetarian Pizza","House Mix Red Sauce, Mushroom, Olive, Tomatoes, Bell Pepper, Red Onion, Garlic",2895],
        ["The Empire Tikka","Butter chicken Sauce, Mozzarella Cheese, Butter Chicken, Bell Pepper, Red Onion, Mushroom, Green Onion, Cilantro",2895],
        ["Paneer Tikka Pizza","Creamy Butter Sauce, Mozzarella Cheese, Marinated Paneer, Bell Pepper, Olive, Onion, Cilantro",2895],
        ["Pizza by the Slice","",600],
        ["Specialty Pizza Slice","",875],
      ] },
      { name: "Empire Bites", items: [
        ["Beef & Lamb Gyro","Beef & Lamb Gyro with bag of chips Halal",1395],
        ["9\" Meatball Sub","9 inch Meatball sub with chips Halal",1395],
      ] },
      { name: "Salads", items: [
        ["Green Salad","",995],
        ["Caesar Salad","",995],
        ["Greek Salad","",1095],
        ["Calzones","Calzone",1695],
      ] },
      { name: "Desserts", items: [
        ["Brownie Cookie Pizza","",895],
        ["Chocolate Chip Cookie Pizza","",895],
        ["Cannoli","Fresh Cannoli",1095],
        ["New York Cheesecake","New York Cheesecake",595],
        ["Lava Cake","Lava Cake",695],
      ] },
      { name: "Drinks", items: [
        ["Can Soda","",200],
        ["Mexican Coke","",375],
        ["2 Liter Soda","",475],
      ] },
      { name: "Dips and Sauces", items: [
        ["Ranch Dressing","",100],
        ["Blue Cheese Dressing","",100],
        ["Marinara Sauce","",100],
        ["Pizza Sauce","",100],
      ] },
    ],
    siteNote: "Prices are from their own site.",
  },

  /*
     Emy’s Cannoli — gathered 2026-09-09 from own-domain
     their spelling: "Emy's Cannoli" (roster keeps "Emy’s Cannoli")
     they are: Italian catering
     logo: https://bronkbuilder-website-assets.s3.us-east-2.amazonaws.com/users/55506079-77ad-4a9c-b02f-eaadca6e1803/websites/5d9c4b44-2008-4bff-923a-3e3e2f2bc244/LOGO/e3a37942-3a79-4efd-bd80-3297117fa3ae.webp (1080x946) — not cut into a tile yet
     flag: the contact form carries the builder's placeholder text, 'Business Default form', with a stray 'Subscribe' label
     flag: the hero image alt is the unedited placeholder
     flag: a one-page site: no address, hours or prices
     flag: Menu sweep 2026-09-09, still no readable prices: No prices are printed anywhere on emyscannoli.com; the home page lists three offerings (Gourmet Mini Cannoli, Traditional Tiramisu, Homemade Lasagna) with descriptions but no prices, and the only other page paths on the site (/menu, /services, /about, /contact) return 404, so no separate menu or ord
     flag: Menu sweep 2026-09-09: No prices published anywhere on the site for any menu item
     flag: Menu sweep 2026-09-09: No street address listed on the site (business appears to be a mobile cart/catering operation with no fixed storefront); Vacaville, CA location given in the task brief could not be confirmed from their own site
     flag: Menu sweep 2026-09-09: No hours of operation listed on the site
     flag: Menu sweep 2026-09-09: Site is effectively single-page: nav links (About, Services, Contact) and attempted paths /menu, /services, /about, /contact all return 404, so they are likely in-page anchors rather than separate pages
     flag: Menu sweep 2026-09-09: No online ordering platform (Toast/Square/ChowNow/etc.) found or linked
  */
  'emys-cannoli': {
    phone: "(707) 580-2049",
    email: "emyscannoli@gmail.com",
    instagram: "emyscannoli",
    cuisine: "Italian catering",
    tagline: "Mobile catering bringing 'Authentic Italian Flavors Delivered to Your",
    photos: [
      {"src":"/food/emys-cannoli-site-0-lg.webp","alt":"Alternative text for describing the image displayed","credit":"Their own photo, from emyscannoli.com"},
      {"src":"/food/emys-cannoli-site-1-lg.webp","alt":"Placeholder image for ABOUT","credit":"Their own photo, from emyscannoli.com"},
      {"src":"/food/emys-cannoli-site-2-lg.webp","alt":"Placeholder image for PRODUCT","credit":"Their own photo, from emyscannoli.com"},
      {"src":"/food/emys-cannoli-site-3-lg.webp","alt":"Placeholder image for PRODUCT","credit":"Their own photo, from emyscannoli.com"},
      {"src":"/food/emys-cannoli-site-4-lg.webp","alt":"Placeholder image for PRODUCT","credit":"Their own photo, from emyscannoli.com"},
    ],
    contactOnly: "Mobile catering bringing 'Authentic Italian Flavors Delivered to Your. Three offerings are named — gourmet mini cannoli, traditional tiramisu, homemade lasagna — and none is priced.",
  },

  /*
     Ethos Of California — gathered 2026-09-09 from own-domain
     they are: Barbershop
     flag: Glenn: 'He's got a location in Lafayette too' — no Lafayette address is published anywhere they control, so only Orinda is seated
     flag: two phones on their Vagaro page, (925) 464-1932 and (925) 718-0971; the first is carried
  */
  'ethos-of-california': {
    address: "23 Orinda Way Suite C, Orinda, CA 94563",
    phone: "(925) 464-1932",
    cuisine: "Barbershop",
    tagline: "Barbershop on Orinda Way, booking on Vagaro",
    contactOnly: "Barbershop on Orinda Way, booking on Vagaro. Their site is a Vagaro page still under construction (\"the chairs are open\"); services and prices are behind the booking screen.",
  },

  /*
     Forno Piombo — gathered 2026-09-09 from own-domain
     they are: Pizza ovens
     logo: https://fornopiombo.com/cdn/shop/files/FPO_Logo_FINAL-Letters-only_927e992a-09ac-47ba-ae13-1c751f373fe5_300x.png?v=1626473863 (300x182) — not cut into a tile yet
     flag: the header logo's HTML claims 1945x1179 but the served file is 300x182
     flag: Shopify theme boilerplate is live on the page — a popup placeholder and an alcohol age-verification snippet on a pizza-oven store
     flag: the address is a 'visit us' showroom line with no hours attached
  */
  'forno-piombo': {
    address: "120 Klamath Ct, Suite A, American Canyon, CA 94503",
    phone: "(707) 346-2818",
    email: "support@fornopiombo.com",
    instagram: "fornopiombo",
    cuisine: "Pizza ovens",
    items: [
      ["Tiled Roman 80 Pizza Oven","The flagship and largest model in their refractory line",980000,null,"from $9,800"],
      ["Roman 80 Pizza Oven","",930000],
      ["Tiled Santino 70 Pizza Oven","",590000,null,"from $5,900"],
      ["Tiled Santino 60 Pizza Oven","",520000,null,"from $5,200"],
      ["Avanzini P1+ Gas Burner","For the Roman oven",210000],
      ["Concessionaire Pizza Oven Trailer","",3085000,null,"from $30,850"],
    ],
    siteNote: "'from' prices are the cheapest tile or colour variant — the Tiled Roman 80 runs $9,800 to $10,550 by tile; 49 products in their catalogue.",
  },

  /*
     The French Spot — gathered 2026-09-09 from own-domain
     they are: French patisserie
     logo: https://images.squarespace-cdn.com/content/v1/5f6b54d6483daf47f3ca0c32/25acebb3-09a0-44fe-89a6-e45e04de3875/newlogoagray.png (340x570) — not cut into a tile yet
     flag: the original shop is 1042 Larkin Street, San Francisco, Thu-Sun 8am-1pm; their nav lists Concord first, and Concord's hours are the ones carried
     flag: a phone number exists only in hidden structured-data markup, never on the visible page — not carried
     flag: their structured data misspells the email 'oreders@'; no ZIP is published for either address
  */
  'french-spot': {
    address: "785 Oak Grove Road, Concord, CA",
    email: "orders@thefrenchspotsf.com",
    hours: "Mon & Wed-Fri 7:30am-2:30pm, Sat-Sun 8am-2:30pm, closed Tue",
    instagram: "thefrenchspot",
    cuisine: "French patisserie",
    contactOnly: "'An independent, artisanal family bakery' by Vincent Attali and Maria Zapata — French technique with Asian and tropical twists, home of the Mochicro. The menu is item names only — croissants, pain au chocolat, the Ube Mochicro, kouign amann, guava cream-cheese danish, croque monsieur — with no prices anywhere.",
  },

  /*
     Gay Nineties Pizza & Pasta Co. — gathered 2026-09-09 from own-domain
     their spelling: "Gay Nineties Pizza" (roster keeps "Gay Nineties Pizza & Pasta Co.")
     they are: Pizza and pasta
     logo: https://irp.cdn-website.com/5bf6c805601f409284365d58f44ccf25/dms3rep/multi/opt/gayninetieslogoidea1-1920w.png (655x570) — not cut into a tile yet
     flag: placeholder text live on the homepage: a photo credit 'Photo By: John Doe' and a button labelled 'Button'
     flag: the logo reads 'GAY NINETIES PIZZA CO.' while the site text says 'Gay Nineties Pizza'
     flag: garbled OCR-like text on the dinner menu; one suspicious lunch line prices garlic bread at $1.00
     flag: menu: 12 items read from https://www.gayninetiespizza.com/lunch-menu on 2026-09-05
  */
  'gay-nineties-pizza': {
    address: "288 Main St, Pleasanton, CA 94566",
    phone: "(925) 846-2520",
    hours: "Mon-Thu 11am-9pm, Fri-Sat 11am-10pm, Sun 11am-9pm",
    cuisine: "Pizza and pasta",
    photos: [
      {"src":"/food/gay-nineties-pizza-site-3-lg.webp","alt":"","credit":"Their own photo, from gayninetiespizza.com"},
      {"src":"/food/gay-nineties-pizza-site-4-lg.webp","alt":"","credit":"Their own photo, from gayninetiespizza.com"},
    ],
    sections: [
      { name: "Side Orders", items: [
        ["Side Lunch Salad","",600,"gay-nineties-pizza-side-lunch-salad"],
        ["Italian Sausage(two)","",800,"gay-nineties-pizza-italian-sausage-two"],
        ["Minestrone Soup with crackers","",700,"gay-nineties-pizza-minestrone-soup-with-crackers"],
        ["Minestrone Soup with bread and butter","",900,"gay-nineties-pizza-minestrone-soup-with-bread-and-butter"],
        ["Meatballs(two)","",800,"gay-nineties-pizza-meatballs-two"],
        ["Cheesy Garlic Bread","",1000,"gay-nineties-pizza-cheesy-garlic-bread"],
        ["Garlic Bread","(with cheese add $2.25)",600,"gay-nineties-pizza-garlic-bread"],
        ["Italian Sausage (two)","",800,"gay-nineties-pizza-italian-sausage-two"],
        ["Minestrone Soup","with crackers",800,"gay-nineties-pizza-minestrone-soup"],
      ] },
      { name: "Appetizers", items: [
        ["Antipasta Platter","",1650,"gay-nineties-pizza-antipasta-platter"],
      ] },
      { name: "Minestrone Soup", items: [
        ["Meatballs (two)","",800,"gay-nineties-pizza-meatballs-two"],
      ] },
      { name: "Altamont Maui Waui", items: [
        ["Soft Drinks","",400,"gay-nineties-pizza-soft-drinks"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     German Auto Sport — gathered 2026-09-09 from own-domain
     they are: German auto repair
     logo: https://gasberkeleyrepair.com/wp-content/uploads/2023/03/GAS-Logo-2_1.png (518x95) — not cut into a tile yet
     flag: the only email in the markup belongs to their web vendor, not the shop — treated as not published
     flag: footer publishes CA BAR #ARD257306
  */
  'german-auto-sport': {
    address: "751 Folger Ave, Berkeley, CA 94710",
    phone: "(510) 525-6000",
    hours: "Mon-Fri 8am-5pm, closed Sat-Sun",
    instagram: "gas_bmw",
    cuisine: "German auto repair",
    contactOnly: "A family-owned Berkeley shop for 'full service German auto repair' — Audi, BMW, Mercedes, Porsche, Volkswagen and MINI. Their Specials page publishes coupon discounts only — $40 off an oil change, $100 off brakes, free inspections — and no service prices.",
  },

  /*
     Gofrette Pamper & Play — gathered 2026-09-09 from own-domain
     they are: Pet grooming and daycare
     logo: https://www.gofrette.com/wp-content/uploads/2026/07/gofrette-logo.webp (1024x1024) — not cut into a tile yet
     flag: Instagram inconsistent on their own site: the buttons link to gofrette408 while the contact page says @gofrette.pamper.and.play
     flag: no opening hours published anywhere
  */
  'gofrette': {
    address: "50 Eagle Rock Way, Ste B, Brentwood, CA 94513",
    phone: "(925) 819-5369",
    email: "info@gofrette.com",
    instagram: "gofrette408",
    cuisine: "Pet grooming and daycare",
    groups: [
      { name: "Prices", items: [
        ["Bath and Brush — short coat, small dog","Bath, blow dry, ears, nails, up to fifteen minutes of brushing",5000],
        ["Bath and Brush — curly coat, giant dog","",12000],
        ["Mini Groom — short coat, small dog","Bath and brush plus trimming around eyes, sanitary area and feet",6500],
        ["Full Groom — short coat, small dog","Bath, blow dry, ears, sanitary trim, nails, a full-body haircut",8500],
        ["Full Groom — curly coat, giant dog","",18500],
        ["Half Daycare","Up to five hours",4500],
        ["Full Daycare","Over five hours",6000],
      ] },
    ],
    quoteOnly: "'Your Pet's Home Away From Home' — pet grooming and daycare in Brentwood where pets are treated like family. A full grooming grid on their homepage by coat type and five sizes, $50-$185; the meet-and-greet is free; multi-dog and multi-day daycare discounts on request.",
  },

  /*
     Golden State Ballerz — gathered 2026-09-09 from stopgap
     they are: Football gear
     logo: https://golden-state-ballerz.myshopify.com/cdn/shop/files/33827B68-FDF7-46EF-A948-03B383FE90B5.png?v=1777428510 (1024x1024) — not cut into a tile yet
     flag: no address, phone or email anywhere — the contact policy page contains only the Instagram URL
     flag: the store lives entirely on the default myshopify.com subdomain
     flag: their legal notice says the backplates are 'primarily for aesthetic purposes' and not safety-certified
  */
  'golden-state-ballerz': {
    instagram: "goldenstateballerz",
    cuisine: "Football gear",
    needsSite: true,
    items: [
      ["GSB Black Backplate","Adult and youth",2999],
      ["CBFW Backplate","Black with white lettering",3499],
      ["GSB Matte Black Mouthpiece","Adult and youth",1199],
      ["GSB Black Turf Tape","",1499],
      ["GSB Black Crew Socks","Adult and youth",899],
      ["GSB Black Crew Socks, pack of three","",1999],
      ["Football Mudding Service","Used footballs mudded and shipped back",6500],
    ],
    siteNote: "53 fixed-price products in their catalogue.",
  },

  /*
     Good Compenny — gathered 2026-09-09 from own-domain
     they are: Streetwear brand
     logo: https://goodcompenny.co/cdn/shop/files/GC_HEADER_6392a686-e093-417d-884a-c8496ac6b0f5.png?v=1720029892 (3000x900) — not cut into a tile yet
     flag: Glenn: 'BEASTY • Online'
     flag: the P.O. box in Vallejo on their FAQ is a returns address, not a shop, so no address is carried; the phone on their contact page reads like unedited theme text and is not carried either
     flag: PRICING: the whole store is offer-based. Announcement bar: '*OFFER BASED MERCH*'. Product pages: 'Our entire site runs on a unique offer-based system called "Proud to Pay"... you get to choose your donation amount for everything we offer.' FAQ: 'If your offer meets or exceeds our minimum offer amount, it will be automatically accepted'; the minimum is never published. The listed amounts ($500 magazine, $1,000 CD, $2,000 beanie/hat/puzzle, $2,500 tee, $7,500 jacket/jersey, $10,000 racing jacket) are the 'Add to cart' list prices next to a 'Make An Offer' form, not fixed retail - show them only with the 'Make an offer' label or hide them.
     flag: TWO CONFLICTING ADDRESSES: the FAQ page publishes 'Address for Returns: P.O. Box 5903 Vallejo, CA 94591' (used in address). The Contact page map block reads '6100 Wilshire Blvd 2nd Floor CA 9004 / +1 310 499 7700 / Opening hours Monday-Saturday 11am–7pm ET, Sunday 11am–6pm ET' - no city, 4-digit ZIP, Eastern-time hours on a California address, and nothing else on the site mentions Los Angeles; it reads like unedited theme placeholder text. The phone above is the only one on the site and comes from that block, so treat it as unverified; hours left null for the same reason.
     flag: LOCATION IS INFERRED, NOT STATED: the site never says where the brand is based. 'Vallejo' in one_line comes from the returns P.O. Box plus Bay references in product copy ('IM FROM THE BAY' football jersey, 'VJO' beanie and 'VJO LEGENDS' jacket, Richmond CA and Stern Grove show tees, 'Good Compenny x Cal bears' hat). No street address or storefront is published; locations left empty.
     flag: NAME RENDERING: the Shopify store name, page titles, logo alt text and footer copyright all show lowercase 'goodcompenny'; the header logo wordmark, product copy and the Instagram display name read 'Good Compenny' (name_exact uses the wordmark).
     flag: SHIPPING (from the FAQ page): 'Our standard shipping service is USPS'; in-stock items ship within 1–3 days 'unless we are on the road for tour'; printed shirts and hoodies 3–5 weeks, factory items 4–6 weeks; 'We ship to most countries worldwide', international via DHL with tariffs paid by the customer. Shopify /policies/ pages (shipping, refund, terms, privacy) all return 404; the returns/exchange policy exists only in the FAQ text and a product-page accordion (30 days, unworn, customer pays return shipping, show purchases non-refundable).
     flag: NAV ODDITIES: 'FAQ's' links to /collections/faq, a product collection with 0 products whose description holds the FAQ and contact info; 'Bottoms' (/collections/bottoms) is empty; 'Shows' points to /collections/music-1, titled 'MUSIC' and containing CDs; /pages/about is 404 - there is no About page.
     flag: COPY ODDITIES: product 'SHIRT PACK $150' is listed at $2,000.00 (sold out); GC "PINK T" MESH JERSEY's description starts 'GOOD COMPENNY BLUE MESH JERSEY!'; a homepage section reads 'FEATURED COLLECTION / Best dresses for the upcoming fall season' (no dresses are sold) and another says 'shop new hoodies' (no hoodies listed); the NPR Tiny Desk vinyl copy spells 'Laruseell'.
     flag: LOGO: the header file is a white 'Good Compenny' wordmark on a transparent PNG (3000x900) - invisible on light backgrounds, needs a dark backdrop; no favicon is set; the yellow circular avatar on Instagram does not appear anywhere on the site.
     flag: LARUSSELL: much of the catalog is 'Official LaRussell' show tees, CDs, an NPR Tiny Desk vinyl and a puzzle, but the site never explains the relationship; the Instagram bio only says 'The official Good Compenny brand page.'
     flag: INSTAGRAM (screenshot): display name 'Good Compenny', category 'Brand', bio 'WELCOME TO THE FAMILY! The official Good Compenny brand page. For brand related questions contact us at merch@goodcompenny.co', link 'goodcompenny.co and 1 more' (second link not visible). Site footer links: instagram.com/goodcompenny, tiktok.com/@goodcompenny, youtube.com/@GoodCompenny, x.com/GCompenny.
     flag: The operator's exact note: BEASTY • Online
  */
  'good-compenny': {
    email: "merch@goodcompenny.co",
    instagram: "goodcompenny",
    cuisine: "Streetwear brand",
    tagline: "Bay Area streetwear and LaRussell merch, offer-based, ships worldwide",
  },

  /*
     Gourmet Burritos — gathered 2026-09-09 from stopgap
     their spelling: "A & A Gas" (roster keeps "Gourmet Burritos")
     they are: Burritos
     flag: Glenn's working name for the page is Gourmet Burritos; the business on Yelp and Apple Maps is A & A Gas
     flag: hours, phone and address from Apple Maps as he sent them; the menu from Yelp's listing
     flag: PRICE CONFLICT: Yelp's menu says $13.99; Glenn, who buys there, says 'the burritos are like $15-17'. The priced menu is withdrawn rather than shipped wrong; ask the owner for a current list.
  */
  'gourmet-burritos': {
    address: "1009 Oliver Rd, Fairfield, CA 94534",
    phone: "(707) 399-3600",
    hours: "Open 24 hours",
    cuisine: "Burritos",
    needsSite: true,
    contactOnly: "Burritos, tacos and tortas out of A & A Gas on Oliver Road, open 24 hours. The menu on their Yelp page prices most items at $13.99, and Yelp itself warns it may be out of date — the owner quotes $15 to $17 at the counter, so nothing is priced here.",
  },

  /*
     Great Impasta — gathered 2026-09-09 from own-domain
     their spelling: "The Great Impasta" (roster keeps "Great Impasta")
     they are: Italian
     logo: https://greatimpastadanville.com/pluto-images/41a358f2-018e-4d8f-b80d-91012c9f5436 (512x516) — not cut into a tile yet
     flag: homepage feature card typo: 'Everithin's made from scratch'
     flag: footer legal name: DANVILLE PASTA LLC
     flag: site is Owner.com; its host 403s a Chrome user agent but serves plain curl
     flag: menu: 92 items read from https://greatimpastadanville.com/menu on 2026-09-05
  */
  'great-impasta': {
    address: "318 Sycamore Valley Rd, Danville, 94526",
    phone: "(925) 831-9363",
    email: "danvillepasta@gmail.com",
    hours: "Mon-Fri 11:15am-8pm, Sat-Sun 11am-7pm",
    instagram: "impasta_danville",
    cuisine: "Italian",
    sections: [
      { name: "Appetizers", items: [
        ["Garlic Cheese Bread","Add a dipping sauce: ranch $3.00 or marinara $4.00",1199,"great-impasta-garlic-cheese-bread"],
        ["Side of Meatballs with Marinara Sauce","2 Homemade Beef Meatballs covered with our Meat Sauce. No PORK",1299,"great-impasta-side-of-meatballs-with-marinara-sauce"],
        ["Side of Prawns","6-7 Garlic Sauteed Prawns",1299,"great-impasta-side-of-prawns"],
        ["Side of Italian Sausages with Marinara","2 Caggiano Sausage Links with Marinara. Contains Pork (sausage)",1299,"great-impasta-side-of-italian-sausages-with-marinara"],
        ["Homemade Garlic Bread","",1050,"great-impasta-homemade-garlic-bread"],
        ["Grilled Chicken Breast","Juicy 5 oz chicken breast sautéed in savory garlic butter and lightly seasoned. A flavorful and satisfying side that pairs perfectly with any dish.",800,"great-impasta-grilled-chicken-breast"],
        ["Fresh Steamed Vegetables","Steamed Mixed Veggies",1300,"great-impasta-fresh-steamed-vegetables"],
      ] },
      { name: "Chicken Pasta Favorites", items: [
        ["Lemon Caper Chicken","Grilled Chicken in a Creamy Lemon Caper Sauce over Linguini",2499,"great-impasta-lemon-caper-chicken"],
        ["Grilled Chicken Piccata Olio","Grilled Chicken with Mushrooms, Lemon Juice, Capers, Basil and Roma Tomatoes over Spaghetti",2499,"great-impasta-grilled-chicken-piccata-olio"],
        ["Angel Hair Special","Grilled Chicken Breast and Mushrooms in a Marsala Cream Sauce over Angel Hair",2499,"great-impasta-angel-hair-special"],
        ["Chicken & Broccoli","Grilled Chicken and Fresh Broccoli in a Creamy Homemade Alfredo Sauce over Fettuccine",2499,"great-impasta-chicken-broccoli"],
        ["Smoked Chicken Olio","Grilled Chicken with Mushrooms, Roma Tomatoes and Garlic Extra Virgin Olive Oil over Linguini",2499,"great-impasta-smoked-chicken-olio"],
        ["Smoked Chicken Artichoke","Slightly Smoky Chicken Breast and Artichokes tossed in our Homemade Mushroom Cream sauce over Fettuccine",2499,"great-impasta-smoked-chicken-artichoke"],
        ["Chicken Garlic","House Marinated Chicken Breast in our own Creamy Garlic sauce over Fettuccine",2499,"great-impasta-chicken-garlic"],
        ["Bowtie Special","Bowtie pasta with Grilled Chicken and Mushrooms in White Wine Tomato Sauce",2499,"great-impasta-bowtie-special"],
        ["Smoked Apple Chicken Sausage","With Mushrooms, Basil and Lemon Juice in a Tomato Sauce over Rigatoni. This item contains Pork (apple sausage)",2499,"great-impasta-smoked-apple-chicken-sausage"],
        ["Penne Special","Grilled Chicken, Mushrooms, and Onions in a delicious Slightly Spicy Marsala Cream sauce over Penne",2499,"great-impasta-penne-special"],
      ] },
      { name: "Specialty Favorites", items: [
        ["Spicy Chicken","Grilled Chicken in a Creamy Tomato Pan Sauce with Garlic, Red Chili Flakes and Fresh Basil over Rigatoni",2499,"great-impasta-spicy-chicken"],
        ["Linguini Special","Locally sourced Caggiano Hot Italian Sausage and Mushrooms in our Famous Red Pepper Cream Sauce over Linguini. Contains Pork (Sausage)",2499,"great-impasta-linguini-special"],
        ["Porcini Mushroom Ravioli in Mushroom cream sauce","12 Porcini Mushroom Raviolis smothered in our Homemade Mushroom Cream Sauce. Contains Egg (ravioli)",2299,"great-impasta-porcini-mushroom-ravioli-in-mushroom-cre"],
        ["Butternut Squash Ravioli in Roasted Red Bell Pepper Sauce","12 Butternut Ravioli and our Famous Roasted Bell Pepper Sauce. Contains Egg (ravioli)",2299,"great-impasta-butternut-squash-ravioli-in-roasted-red-"],
        ["Spinach & Cheese Ravioli in Roasted Red Bell Pepper Sauce","12 Spinach and Cheese Ravioli in our Famous Roasted Bell Pepper Cream Sauce. Contains Egg (ravioli)",2299,"great-impasta-spinach-cheese-ravioli-in-roasted-red-be"],
        ["Chicken & Spinach Ravioli in Mushroom Cream Sauce","12 Chicken and Spinach Ravioli in our Homemade Mushroom Cream Sauce. Contains Egg (ravioli)",2299,"great-impasta-chicken-spinach-ravioli-in-mushroom-crea"],
        ["Linguini with Clam Sauce","Tender Baby Clams in your Choice of Sauce: White, Red or *Olio Clam Sauces. *Olio is a Garlic Olive Oil Sauce",2299,"great-impasta-linguini-with-clam-sauce"],
        ["Pasta Primavera","Garden Fresh Vegetables over Fettuccine in your Choice of Alfredo, Marinara or *Olio. *Olio is a Garlic Olive Sauce",2299,"great-impasta-pasta-primavera"],
        ["Fettuccine Carbonara","Our interpretation...made with our Homemade Creamy Alfredo Sauce with Smithfield Ham & Peas",2499,"great-impasta-fettuccine-carbonara"],
        ["Spicy Chicken and Sausage Jambalaya","Caggiano Hot Italian Sausage, Grilled Chicken Breast and Bell Peppers & Onions over rigatoni. Choice of Cream, Red or *Olio Sauce",2599,"great-impasta-spicy-chicken-and-sausage-jambalaya"],
        ["Tortellini in 4 Cheese with Chicken","Tortellini stuffed with four rich cheeses, tossed in a creamy sauce with seasoned grilled chicken. A comforting, flavorful dish that melts in every bite.",2600,"great-impasta-tortellini-in-4-cheese-with-chicken"],
      ] },
      { name: "Build your own pasta", items: [
        ["Pastas : Mix & Match","Angel hair, spaghetti, linguini, fettuccini, gluten free fettuccini, fusilli, bowtie, rigatoni or penne, gluten free penne.",1750,"great-impasta-pastas-mix-match"],
        ["Raviolis : Mix & Match","Beef & spinach, chicken & spinach, cheese, cheese & spinach, sun dried tomato, butternut squash, porcini mushroom.",2250,"great-impasta-raviolis-mix-match"],
        ["Filled Pastas : Mix & Match","Cheese Tortellini, Potato Gnocchi or Beef & Spinach Cannelloni.",2250,"great-impasta-filled-pastas-mix-match"],
      ] },
      { name: "Pasta Favorites", items: [
        ["Fresh Basil Pesto Over Linguini","Homemade Pesto over Linguini. Contains Walnuts (pesto sauce)",2150,"great-impasta-fresh-basil-pesto-over-linguini"],
        ["Rigatoni with Roasted Bell Pepper Cream Sauce","A homerun....Our Famous Roasted Red Bell Pepper Sauce and Big Rigatoni Tubes",1750,"great-impasta-rigatoni-with-roasted-bell-pepper-cream-"],
        ["Fusilli with Creamy Pesto Sauce","Curly Fusilli Pasta tossed with our Homemade Creamy Fresh Basil Pesto. Contains Walnuts (pesto sauce)",2150,"great-impasta-fusilli-with-creamy-pesto-sauce"],
        ["Fettuccine and 4 Cheese Sauce","Creamy and Flavor packed Homemade 4 Cheese Sauce (Parmesan, Cream, Gorgonzola and Swiss cheese) over Fettuccine",1750,"great-impasta-fettuccine-and-4-cheese-sauce"],
        ["Traditional Fettuccine Alfredo","A Classic....Homemade Alfredo Sauce and Fettuccine...don't forget to add Grilled Chicken and Garlic Sautéed Prawns.",1750,"great-impasta-traditional-fettuccine-alfredo"],
        ["Rigatoni with Spicy Sausage & Mushroom Sauce","A Chunky Tomato Sauce with Classic Hot Italian Sausage and Mushrooms over Rigatoni. Contains Pork (Spicy Sausage & Mushroom Sauce)",2150,"great-impasta-rigatoni-with-spicy-sausage-mushroom-sau"],
        ["Angel Hair with Basil, Tomato & Artichoke Sauce","Our Super Fresh and Chunky Basil Tomato & Artichoke Sauce over Delicate Angel Hair",2150,"great-impasta-angel-hair-with-basil-tomato-artichoke-s"],
        ["Spaghetti with Meat Sauce (meatballs extra)","Our Best Seller. House Made Meat Sauce. Don't forget to add Meatballs. Contains Beef. NO PORK (meat sauce)",2000,"great-impasta-spaghetti-with-meat-sauce-meatballs-extr"],
      ] },
      { name: "Seafood Pasta Favorites", items: [
        ["Prawns Sicilian","Succulent Prawns with Capers and Kalamata Olives in a Tomato Sauce over Rigatoni",2699,"great-impasta-prawns-sicilian"],
        ["Smoked Salmon","Slightly Smoky Salmon in our Homemade Lemon Caper Cream sauce over Fettuccine",2799,"great-impasta-smoked-salmon"],
        ["Shrimp & Mushrooms","Heaps of Large Bay Shrimp with our Famous Red Bell Pepper Cream sauce over Fusilli",2699,"great-impasta-shrimp-mushrooms"],
        ["Shrimp Olio","Perfectly Sauteed Large Bay Shrimp with Mushrooms, Artichoke Hearts and Roma Tomatoes in a Garlic Olive Oil sauce over Fusilli",2699,"great-impasta-shrimp-olio"],
        ["Prawns & Scallops","Succulent Prawns and Scallops with Kalamata Olives in a Spicy Tomato Sauce over Fettuccine.",2799,"great-impasta-prawns-scallops"],
        ["Prawns Garlic","Garlicy Prawns in our Homemade Creamy Garlic Sauce over Fettuccine",2699,"great-impasta-prawns-garlic"],
        ["Spicy Prawns Mexicana","Grilled Prawns in a Creamy Tomato Pan Sauce with Garlic, Red Chili Flakes and Basil over Rigatoni...this one won't disappoint!",2699,"great-impasta-spicy-prawns-mexicana"],
        ["Lemon Caper Prawns","Sauteed Prawns in our Creamy Lemon Caper Pan Sauce over Linguini",2699,"great-impasta-lemon-caper-prawns"],
        ["Seafood Plate","Prawns and Scallops in our Sherry Cream Pan Sauce over Fettuccine",2799,"great-impasta-seafood-plate"],
      ] },
      { name: "Homemade Lasagna", items: [
        ["Spinach Lasagna","Layers and Layers of Spinach, Egg Pasta, Ricotta, Mozzarella and Parmesan...smothered in our Famous Homemade Marinara.",2300,"great-impasta-spinach-lasagna"],
        ["Meat Lasagna","Extra Lean Ground Beef, Egg Pasta with Ricotta, Mozzarella and Parmesan....topped with our Homemade Meat Sauce",2300,"great-impasta-meat-lasagna"],
      ] },
      { name: "Tortellini and gnocchi", items: [
        ["Potato Gnocchi (RPC)","Tender and Chewy Potato Gnocchi with our Famous Roasted Bell Pepper Cream Sauce. Contains Egg (gnocchi)",2250,"great-impasta-potato-gnocchi-rpc"],
        ["Cheese Tortellini and 4 Cheese Sauce","Creamy and Flavor packed Homemade 4 Cheese Sauce (Parmesan, Cream, Gorgonzola and Swiss cheese) over Cheese Tortellinis. Contains Egg (tortellinis)",2250,"great-impasta-cheese-tortellini-and-4-cheese-sauce"],
      ] },
      { name: "Sandwiches with Pasta Salad", items: [
        ["Italian Sausage Sandwich (Small)","Locally Sourced Caggiano Sausage smothered in our Marinara Sauce and Whole Milk Mozzarella Cheese. Served on a Sourdough roll. Contains Pork (sausage)",1399,"great-impasta-italian-sausage-sandwich-small"],
        ["Italian Sausage Sandwich (Large)","Locally Sourced Caggiano Sausage smothered in our Marinara Sauce and Whole Milk Mozzarella Cheese. Served on a Sourdough roll. Contains Pork (sausage)",1799,"great-impasta-italian-sausage-sandwich-large"],
        ["Meatball Sandwich (Small)","Homemade Meatballs smothered in our Marinara Sauce with Whole Milk Mozzarella Cheese. Served on a Sourdough Roll. Contains Beef. NO PORK",1399,"great-impasta-meatball-sandwich-small"],
        ["Meatball Sandwich (Large)","Homemade Meatballs smothered in our Marinara Sauce with Whole Milk Mozzarella Cheese. Served on a Sourdough Roll. Contains Beef. NO PORK",1799,"great-impasta-meatball-sandwich-large"],
        ["BBQ Chicken Sandwich (Small)","Marinated Chicken Breast in our Tangy/Sweet Barbeque Sauce with Onions and Whole Milk Mozzarella Cheese on a Sourdough Roll",1399,"great-impasta-bbq-chicken-sandwich-small"],
        ["BBQ Chicken Sandwich (Large)","Marinated Chicken Breast in our Tangy/Sweet Barbeque Sauce with Onions and Whole Milk Mozzarella Cheese on a Sourdough Roll",1799,"great-impasta-bbq-chicken-sandwich-large"],
        ["Chicken Avocado Sandwich (Small)","Marinated Chicken Breast sautéed in Olio with Onions, Tomatoes topped with Avocado and Whole Milk Mozzarella Cheese on Sourdough Roll",1399,"great-impasta-chicken-avocado-sandwich-small"],
        ["Chicken Avocado Sandwich (Large)","Marinated Chicken Breast sautéed in Olio with Onions, Tomatoes topped with Avocado and Whole Milk Mozzarella Cheese on Sourdough Roll",1799,"great-impasta-chicken-avocado-sandwich-large"],
        ["Chicken Pesto Sandwich (Small)","Marinated Chicken Breast sautéed in our Fresh Pesto Sauce with Roma Tomatoes, Parmesan and Mozzarella Cheese on a Sourdough Roll. Contains Walnuts (pesto)",1399,"great-impasta-chicken-pesto-sandwich-small"],
        ["Chicken Pesto Sandwich (Large)","Marinated Chicken Breast sautéed in our Fresh Pesto Sauce with Roma Tomatoes, Parmesan and Mozzarella Cheese on a Sourdough Roll. Contains Walnuts (pesto)",1799,"great-impasta-chicken-pesto-sandwich-large"],
        ["Smoked Chicken Sandwich (Small)","Lightly Smoked Chicken Breast sautéed in Olio with Mushrooms, Roma Tomatoes, and Whole Milk Mozzarella cheese served on a Sourdough Roll",1399,"great-impasta-smoked-chicken-sandwich-small"],
        ["Smoked Chicken Sandwich (Large)","Lightly Smoked Chicken Breast sautéed in Olio with Mushrooms, Roma Tomatoes, and Whole Milk Mozzarella cheese served on a Sourdough Roll",1799,"great-impasta-smoked-chicken-sandwich-large"],
        ["Fresh Vegetable Sandwich (Small)","Sautéed Balsamic Glazed Mushrooms, Bell Peppers, Zucchini, and Onions served on a Sourdough Roll",1399,"great-impasta-fresh-vegetable-sandwich-small"],
        ["Fresh Vegetable Sandwich (Large)","Sautéed Balsamic Glazed Mushrooms, Bell Peppers, Zucchini, and Onions served on a Sourdough Roll",1799,"great-impasta-fresh-vegetable-sandwich-large"],
        ["Chicken Caesar Sandwich (Small)","Marinated Chicken Breast with Romaine, House made Caesar Dressing, Roma Tomatoes, and Parmesan cheese on Sourdough Roll",1399,"great-impasta-chicken-caesar-sandwich-small"],
        ["Chicken Caesar Sandwich (Large)","Marinated Chicken Breast with Romaine, House made Caesar Dressing, Roma Tomatoes, and Parmesan cheese on Sourdough Roll",1799,"great-impasta-chicken-caesar-sandwich-large"],
        ["Chicken Tarragon Salad Sandwich (Small)","Shredded Chicken Breast with Walnuts and Fuji Apples in a Creamy Tarragon Dressing served on a Sourdough Roll. This is Amazing Chicken Salad!",1399,"great-impasta-chicken-tarragon-salad-sandwich-small"],
        ["Chicken Tarragon Salad Sandwich (Large)","Shredded Chicken Breast with Walnuts and Fuji Apples in a Creamy Tarragon Dressing served on a Sourdough Roll. This is Amazing Chicken Salad!",1799,"great-impasta-chicken-tarragon-salad-sandwich-large"],
        ["Tuna Salad Sandwich (Small)","Albacore Tuna with Egg Whites, Onions, Celery, Roma Tomatoes, Mayo, and Whole Milk Mozzarella Cheese on Sliced Sourdough.",1399,"great-impasta-tuna-salad-sandwich-small"],
        ["Tuna Salad Sandwich (Large)","Albacore Tuna with Egg Whites, Onions, Celery, Roma Tomatoes, Mayo, and Whole Milk Mozzarella Cheese on Sliced Sourdough.",1799,"great-impasta-tuna-salad-sandwich-large"],
      ] },
      { name: "Salads", items: [
        ["Grilled Prawns Salad","Fresh Crisp Romaine with sautéed Prawns, Red Onions, Roma Tomatoes and Artichoke Hearts with Raspberry Vinaigrette Dressing on the Side",2100,"great-impasta-grilled-prawns-salad"],
        ["Cobb Salad","Fresh Crisp Romaine with Grilled Chicken Breast, Hardboiled Egg, Avocado, Bacon, Gorgonzola Cheese and Blue Cheese Dressing on the Side",1850,"great-impasta-cobb-salad"],
        ["Sautéed Fresh Vegetable Salad","House salad with sautéed marinated mushrooms, bell peppers, zucchini, and onions with goat cheese and balsamic vinaigrette",1650,"great-impasta-saut-ed-fresh-vegetable-salad"],
        ["Greek Salad","Fresh Crisp Romaine with Red Onions, Roma Tomatoes, Cucumbers, Kalamata Olives and Feta Cheese with Our House Balsamic Vinaigrette on the Side",1650,"great-impasta-greek-salad"],
        ["Caesar Salad","Fresh Romaine tossed with our House Caesar Dressing, Fresh Parmesan Cheese and topped with Homemade Garlic Croutons.",1199,"great-impasta-caesar-salad"],
        ["Pasta Salad","Fusilli, Cheese Tortellini, Bell Peppers, Cucumbers, and Artichoke Hearts marinated in a vinaigrette over a Side Salad with Caesar Dressing",1650,"great-impasta-pasta-salad"],
        ["House Salad","Fresh Romaine with Red Cabbage, Carrots, Fresh Parmesan Cheese and Choice of Dressing on the Side",1100,"great-impasta-house-salad"],
        ["Danville Garden Salad","Fresh Romaine with Red onions, Tomatoes, Cucumbers, Kidney Beans, Garbanzo Beans, Homemade Garlic Croutons with House Balsamic Vinaigrette on the Side",1650,"great-impasta-danville-garden-salad"],
      ] },
      { name: "Soups and combos", items: [
        ["Soup and Half Caesar Salad","Our Soups change daily. Please call the restaurant to find out the Soups of the Day. Then type in the soup you want into the comment box",1699,"great-impasta-soup-and-half-caesar-salad"],
        ["Soup and Side House Salad","Our Soups change daily. Please call the restaurant to find out the Soups of the Day. Then type in the soup you want into the comment box",1599,"great-impasta-soup-and-side-house-salad"],
      ] },
      { name: "Half orders", items: [
        ["Side of Tortellini with Sauce","",1550,"great-impasta-side-of-tortellini-with-sauce"],
        ["Side of Gnocchi with Sauce","",1550,"great-impasta-side-of-gnocchi-with-sauce"],
        ["Side of 6 Ravioli with Sauce","",1550,"great-impasta-side-of-6-ravioli-with-sauce"],
        ["Side of Pasta with Sauce","",1350,"great-impasta-side-of-pasta-with-sauce"],
      ] },
      { name: "Desserts", items: [
        ["(6) Hazelnut Chocolate Beignets","A beautiful Beignet Pastry filled with Hazelnut Chocolate and Sprinkled with Powdered Sugar!",1200,"great-impasta-6-hazelnut-chocolate-beignets"],
        ["Tiramisu","An immensely decadent, bittersweet, Creamy Coffee Tiramisu for you!",1200,"great-impasta-tiramisu"],
        ["Cheesecake","Creamy cheesecake with a cookie crust, topped with a luscious layer of handcrafted dulce de leche. A sweet, smooth dessert that’s the perfect finishing touch.",1000,"great-impasta-cheesecake"],
      ] },
      { name: "Beverages", items: [
        ["Fountain Sodas (XL)","You can choose between Coke, Lemonade, Sprite, Diet Coke, Root Beer",375,"great-impasta-fountain-sodas-xl"],
        ["Fresh Brewed Unsweetened Iced Tea","Unsweetened Iced tea, Tropical or Black tea.",375,"great-impasta-fresh-brewed-unsweetened-iced-tea"],
        ["Assorted San Pellegrino Sparkling Waters","",375,"great-impasta-assorted-san-pellegrino-sparkling-waters"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Happy Bay Paws — gathered 2026-09-09 from own-domain
     they are: Mobile dog grooming
     logo: https://happybaypawsca.com/wp-content/uploads/2024/07/logo-v2.png (1000x535) — not cut into a tile yet
     flag: their /contact/ page returns a Cloudflare challenge while the rest of the site loads
     flag: a second line is published for San Joaquin: (209) 998-2727
     flag: menu typos: 'Specific Bread' for breed, 'DEMATHING', 'deshading'
     flag: no email or social links on the reachable pages
  */
  'happy-bay-paws': {
    phone: "(650) 730-0424",
    hours: "Mon-Sat 8am-6pm, closed Sun",
    cuisine: "Mobile dog grooming",
    groups: [
      { name: "Prices, from", items: [
        ["Full Grooming — small","Bath, blow dry, nails, ears and eyes, sanitary trim, paw pads, teeth, haircut or deshedding, cologne, bandana",13000],
        ["Full Grooming — medium","",13500],
        ["Full Grooming — medium, curly coats","Doodles, sheepdogs and curly coats",15000],
        ["Full Grooming — XX large","",24000],
        ["Bath Package, short hair — small","Bath, blow dry, nails, sanitary trim, cologne, bandana, paw pads",8500],
        ["Bath Package, long hair — small","Teeth brushing $10 extra",9500],
        ["Nails Only","A discount for two or more dogs",5000],
        ["Dematting","",2500,"from $25"],
      ] },
    ],
    quoteOnly: "A mobile dog grooming team serving the Bay Area, the East Bay, Manteca, Tracy, San Joaquin County and Stockton. Per-size packages on each service page, small through XX large — full grooming $130-$240, baths $85-$180; flea treatment $30-$45 by size.",
  },

  /*
     Harumi — gathered 2026-09-09 from own-domain
     their spelling: "Harumi Sushi & Hibachi" (roster keeps "Harumi")
     they are: Japanese AYCE sushi/hibachi
     logo: https://harumisushihibachi.com/assets/favicon.svg — not cut into a tile yet
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: Only site found on a business-specific domain was harumisushihibachi.com; no Toast/Square/ChowNow/order.online storefront could be found via search. Yelp, Google Maps, and DoorDash listings were seen in search results but were NOT used as a source for any fact per instructions.
     flag: Strong evidence harumisushihibachi.com is an auto-generated third-party template microsite rather than a site authored/maintained by the restaurant: its CSS is versioned 'site.css?v=menu-detail-20260527' (a generic shared template name/id), it loads analytics from a shared Railway-hosted Umami instance, it embeds a verbatim Google star rating ('4.4 stars on Google'), Google review count (210+), and full-text Google reviews (e.g. from 'Allen Ng', 'Lelong Pham (Long)'), its FAQ answers are generic boilerplate, and near-duplicate template phrasing repeats across pages ('with listed prices when available' / 'Check the menu for current prices and availability').
     flag: This is marketed elsewhere as an all-you-can-eat (AYCE) restaurant, but no AYCE per-person/adult/child/lunch/dinner pricing tiers appear anywhere on the site -- a major gap for this business type that further undermines confidence in the site's 'popular dishes' price list as a real menu.
     flag: The 7 listed 'popular dishes' read as generic sushi ingredient names (Shrimp, Eel, Cheese, Caviar) rather than actual named dishes/rolls with descriptions, consistent with filler/template content.
     flag: No email address found on any page of the site.
     flag: No Instagram or other social-media link found on the site (its only outbound non-utility link is a Google Maps place link).
     flag: No dedicated logo image exists; the header uses a plain text wordmark ('Harumi Sushi & Hibachi') and the only graphical brand asset is a generic SVG favicon, so logo_px could not be determined.
     flag: A similarly named domain, harumisushinv.com ('Harumi Sushi'), appeared in search results; it is very likely an unrelated, differently located restaurant (possibly in Nevada, given 'nv') and was not used as a source or verified further.
     flag: Address/phone/hours above are the best-available facts printed on harumisushihibachi.com (consistent between its home page and menu page), but given the site's likely auto-generated nature they should be treated as provisional rather than confirmed directly by the business owner.
     flag: An official site was found (own-domain), but it does not contain a verifiable, business-authored priced menu.
  */
  'harumi-ayce': {
    address: "4713 Livermore Outlets Dr, Livermore, CA 94551, USA",
    phone: "+1 925-667-4714",
    hours: "Mon-Thu & Sun 11am-9:30pm, Fri-Sat 11am-10pm",
    cuisine: "Japanese AYCE sushi/hibachi",
    tagline: "All-you-can-eat Japanese sushi and hibachi restaurant in Livermore, CA",
    contactOnly: "All-you-can-eat Japanese sushi and hibachi restaurant in Livermore, CA. No trustworthy priced menu was found: harumisushihibachi.com/menu/ and /popular-dishes/ show only a generic 7-item 'popular dishes' sample (Shrimp $10.00, Eel $15.00, Cheese $5.00, Caviar $10.00, Salmon Sashimi $15.00, Tempura Roll $12.99, Avocado Roll $12.99) whose own copy says 'Check the menu for current prices and availability' right next to those figures and which includes no all-you-can-eat per-person pricing at all, so these look like auto-generated placeholder content rather than the restaurant's real menu and were not captured as items.",
  },

  /*
     House of Silog — gathered 2026-09-09 from ordering-platform — BLOCKED: order.online/business/house-of-silog-brentwood returned HTTP 403 Forbidden
     their spelling: "House Of Silog" (roster keeps "House of Silog")
     they are: Filipino
     logo: https://798f55407ee211f0b627.cdn6.editmysite.com/uploads/b/798f5540-7ee2-11f0-b627-63507b36213e/IMG_0055.jpg?width=104 (104) — not cut into a tile yet
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: order.online/business/house-of-silog-brentwood (the URL given in the brief) returned HTTP 403 Forbidden; could not be read at all.
     flag: Used house-of-silog.square.site instead (found via search) as the business's own ordering platform; it is a Square Online storefront, not a custom domain.
     flag: Most menu categories on the ordering site (Silog All Day, Specialties-Ala Carte, Drinks, Appetizers, Condiments, Special Menu, Beverages) show no populated items in the live storefront, or items are marked 'Unavailable'/'Sold out' — Egg, Plain Fries and Suman are marked 'Unavailable' despite carrying a listed price, and Crispy Pata is 'Sold out' with no price at all.
     flag: A search-engine snippet (third-party, not the business's own page) listed a different phone number, +1 408-221-8939, than the one shown on the business's own ordering page (+1 925-544-9562); the business's own page was used.
     flag: Search-engine snippets suggest day-specific hours (e.g. Wed-Sat only), but the business's own ordering page only shows a flat daily window of 4:00 PM-8:59 PM with no day-by-day breakdown, so that flat window is reported here.
     flag: No Instagram link found anywhere on the business's own ordering page.
  */
  'house-of-silog': {
    address: "7760 Brentwood Blvd Ste D, Brentwood, CA 94513-1062",
    phone: "+1 925-544-9562",
    hours: "Daily 4:00pm-8:59pm",
    cuisine: "Filipino",
    tagline: "Filipino silog breakfast-plate spot in Brentwood",
    sections: [
      { name: "Add Ons", items: [
        ["Egg","Add-on egg",175],
      ] },
      { name: "Other Items", items: [
        ["Plain Fries","",400],
        ["Suman (1pc)","Filipino rice cake made from glutinous rice, cooked in coconut milk and wrapped in banana leaves",350],
      ] },
    ],
    siteNote: "The order.online storefront given in the brief (order.online/business/house-of-silog-brentwood) returned HTTP 403 Forbidden. Prices instead read from the business's own Square ordering site, house-of-silog.square.site, found via one web search. Most of that site's menu categories (Silog All Day, Specialties - Ala Carte, Drinks, Appetizers, Condiments, Special Menu) have no items populated in the live storefront; only Egg, Plain Fries, and Suman carry a price, and Crispy Pata is listed sold out with no price shown.",
  },

  /*
     House Of Thai — gathered 2026-09-09 from own-domain
     their spelling: "HOUSE OF THAI" (roster keeps "House Of Thai")
     they are: Thai street food
     logo: https://static.wixstatic.com/media/315f9a_35abbd9bfb684f71a13a6abbc73d3864~mv2.png (8500x4776) — not cut into a tile yet
     flag: self-contradiction: the about text says 'Established in 1999' while the logo reads 'SINCE 2001'
     flag: a second location is published only on their online-order page: 494 Haight Street, San Francisco 94117, (415) 552-2960 — hours are published for Larkin only
     flag: menu: 63 items read from https://www.houseofthaisf.com/menu-larkin on 2026-09-05
  */
  'house-of-thai': {
    address: "901 Larkin St, San Francisco, CA 94109",
    phone: "(415) 441-2248",
    hours: "Mon-Fri 11am-10pm, Sat-Sun 11:30am-10pm",
    instagram: "house_of_thai_sf",
    cuisine: "Thai street food",
    photos: [
      {"src":"/food/house-of-thai-site-0-lg.webp","alt":"A vibrant spread of various Asian dishes, including curries, fried rice, seafood, and appetizers, arranged on wooden tab","credit":"Their own photo, from houseofthaisf.com"},
      {"src":"/food/house-of-thai-site-1-lg.webp","alt":"A wooden bowl filled with green salad, tomatoes, and shredded vegetables, accompanied by a stone pestle.","credit":"Their own photo, from houseofthaisf.com"},
      {"src":"/food/house-of-thai-site-3-lg.webp","alt":"A plate of pad thai with shrimp, topped with egg and garnished with carrot curls, served alongside bean sprouts and gree","credit":"Their own photo, from houseofthaisf.com"},
      {"src":"/food/house-of-thai-site-4-lg.webp","alt":"A bowl of spicy noodle soup topped with fresh cilantro, minced meat, and slices of meatballs.","credit":"Their own photo, from houseofthaisf.com"},
      {"src":"/food/house-of-thai-site-9-lg.webp","alt":"A dish featuring tender beef slices atop steamed broccoli and carrots, garnished with green leaves.","credit":"Their own photo, from houseofthaisf.com"},
    ],
    sections: [
      { name: "Appetizers", items: [
        ["Fresh Rolls","Thin rice noodles, spring mix, mint, carrot, bean sprout; choice of shrimp OR marinated tofu. Served with tamarind sauce.",1300,"house-of-thai-fresh-rolls"],
        ["Tod Mun Pla (Fish Cake)","Deep fried white fish with green beans, kaffir lime leaf, and curry paste; served with cucumber salad and ground peanut.",1500],
        ["Por-Pier Pak (Vegetarian rolls)","Deep fried egg rolls stuffed with silver noodles, black fungus, carrot, and cabbage; served with sweet & sour sauce.",1300],
        ["Kor Moo Yang","Grilled marinated pork neck meat; served with spicy tamarind sauce.",1600],
        ["Nuer Kem","House specialty beef jerky; served with spicy tamarind sauce.",1600],
        ["Pla Mauk Tod","Golden fried calamari; served with sweet & sour sauce.",1600],
        ["Peak Gai Tod","Garlic marinated deep fried chicken wings; served with sweet & sour sauce.",1600],
        ["See Krong Moo Todd","Deep fried marinated baby pork spare rib; served with sriracha spicy sauce.",1600],
        ["Samosa (Taro)","Served with cucumber salad and peanut sauce.",1500],
        ["Chicken Skewer","Served with cucumber salad and peanut sauce.",1600],
        ["Thai Style with dried shrimp and peanut.","",1600],
        ["PU with salted crab.","",1700],
        ["KOONG SOD with shrimps and peanut.","",1800],
      ] },
      { name: "Specialties", items: [
        ["Naked Ladies","Raw shrimps topped with chef’s secret spicy lime dressing.",1800],
        ["Minced chicken or minced pork","",1600],
        ["Minced beef","",1800],
        ["Catfish","",2100],
        ["Roasted duck","",2400],
        ["Salad Nuer Sun","Marinated flank beef steak sliced over iceberg salad, yellow onion, tomatoes, cucumber, and chef’s crystal glazed dressing.",2100],
        ["Yum Woon-Sen","Silver noodles mixed with minced pork, shrimps, black fungus, red & green onion, cilantro, and spicy lime dressing.",2000],
        ["Yum Tofu","Prepared with fresh chili, red and green onion, and spicy lime dressing.",1600],
        ["Yum Nuer (Beef)","Prepared with cucumber, basil, fresh chili, red & green onion, and spicy lime dressing.",1900],
        ["Tofu and mixed vegetables","",1800],
        ["Chicken","",1900,"house-of-thai-chicken"],
        ["Shrimps or Calamari","",2100],
        ["Seafood","",2300,"house-of-thai-seafood"],
        ["Fresh Tofu","",1700],
        ["Ground Pork","",1800],
        ["No Meat Substitution","",2500],
        ["Chicken or Tofu or Mixed Vegetables","",2300],
        ["Pork","",2400],
        ["Beef","",2400,"house-of-thai-beef"],
        ["Duck (half duck)","",3700],
        ["Salmon Curry (A La Carte Only)","Fried battered salmon, carrot, eggplants, green bean, bell pepper, and basil in choice of favorite Red or / Green Curry.",2600],
        ["Chan Pad Poo","Rice stick noodles with dungeness crab meat, egg, green onion, garlic, and fresh chili. NO MEAT SUBSTITUTION",2300],
        ["Chicken Noodle Soup","Tender chicken and bean sprout.",1800],
        ["Duck Noodle Soup","Roast duck and bean sprout.",2200],
        ["Wonton Soup","Stuffed minced pork and shrimp wonton with roast pork and napa cabbage. ($3 extra charge for egg noodles)",1800],
        ["Pork Leg Stew Noodles Soup","Specialty pork leg stew, pickle mustard, bean sprout.",1900],
        ["Pad Cha Catfish (A La Carte Only)","Spicy stir fry dish, using peppercorn, bell pepper, carrot, onion, basil, chili and house chili paste sauce. Prepared with Catfish.",3400],
      ] },
      { name: "Noodle soup", items: [
        ["Beef Noodle Soup","Sliced beef, beef stew, beef balls, tripe with bean sprouts, and dice Chinese broccoli in beef broth.",1900],
        ["Tom Yum Noodle Soup","Minced pork, slice pork, pork balls, fish cakes, bean sprout, and ground peanuts in chili-lime soup.",1900],
      ] },
      { name: "Sides", items: [
        ["Fried Egg","",300],
        ["Sticky rice","",350],
        ["Brown rice","",350,"house-of-thai-brown-rice"],
        ["Garlic and Ginger rice","",400],
        ["Fried rice","",450,"house-of-thai-fried-rice"],
        ["Curry Sauce (Red or Green)","",600],
        ["Peanut Sauce","",600],
        ["Cucumber Salad","",400,"house-of-thai-cucumber-salad"],
        ["Steamed Assorted Vegetables","",800],
        ["Desserts","Coconut Sticky Rice with Egg Custard",900,"house-of-thai-desserts"],
        ["(Vanilla, Coconut, Thai Tea, Green Tea)","",850],
        ["Mango with Coconut Sticky Rice","",1200],
        ["Taro Ball","",600],
        ["Roti (Fry Flatbread)","Served with condensed milk and sugar.",400],
      ] },
      { name: "Beverages", items: [
        ["Thai Iced Tea/Thai Iced Coffee","",600],
        ["Lychee Iced Tea","",600],
        ["Mint Lemonade (House made)","",600],
        ["Coconut Juice","",600],
        ["Sparking water 532 ml.","",300],
        ["Coke, Diet coke and Sprite (Can)","",350],
        ["Green Tea or Thai Tea","",250],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     House of Wings California — gathered 2026-09-09 from stopgap
     they are: Chicken wings
     flag: houseofwingsca.com did not resolve on 2026-09-02; Glenn: 'It seems to have expired'
     flag: hours and address from their Instagram bio
     flag: Menu sweep 2026-09-09, still no readable prices: No own website or first-party ordering page (Toast/Square/ChowNow/order.online) could be found. One web search turned up only marketplace listings (DoorDash, Uber Eats, Grubhub), a Yelp page, and an Instagram profile (houseofwingscalifornia) — none of which are the business's own site or ordering pa
     flag: Menu sweep 2026-09-09: No own-domain website found; their old domain houseofwingsca.com does not resolve, per the brief.
     flag: Menu sweep 2026-09-09: One web search for an own site or first-party ordering page returned only third-party marketplace pages (DoorDash, Uber Eats, Grubhub) and a Yelp listing — no Toast/Square/ChowNow/order.online storefront run by the business was found.
     flag: Menu sweep 2026-09-09: The business is known to have an Instagram account, houseofwingscalifornia, but this was not confirmed via a link from any site owned by the business (there is no such site), so it is not populated in the instagram field per the sourcing rule.
     flag: Menu sweep 2026-09-09: Address, phone, and hours appear on third-party sites (Yelp, DoorDash, Grubhub) but were deliberately excluded because the task requires facts only from the business's own site or ordering page, and neither exists.
  */
  'house-of-wings': {
    address: "2941 Harbor St, Pittsburg, CA 94565",
    hours: "Daily 11am-10pm",
    instagram: "houseofwingscalifornia",
    cuisine: "Chicken wings",
    needsSite: true,
    tagline: "Wings on Harbor Street, open every day",
    contactOnly: "Wings on Harbor Street, open every day. Their website has lapsed, so the menu lives on their Instagram, and they publish no prices.",
  },

  /*
     i.snapped Photo Booths — gathered 2026-09-09 from own-domain
     they are: Photo booths
     flag: no street address — mobile, listing counties served
     flag: no logo image: the header is styled text and the favicon is the Wix default
     flag: services-page copy has stray backticks and unclosed parentheses
     flag: footer reads '©2026 .i.snapped Photo Booths' with a stray period
  */
  'i-snapped-photo-booths': {
    phone: "(925) 400-0595",
    email: "getsnapped@i-snappedphotobooths.com",
    instagram: "i.snappedphotobooths",
    cuisine: "Photo booths",
    groups: [
      { name: "Prices, from", items: [
        ["The Motion — 360 video experience","Two-hour minimum, with music and a custom digital background",35000,"from $350"],
        ["The Selfie — selfie booth","Two-hour minimum",25000,"from $250"],
        ["The Glam — luxury glam experience","Two-hour minimum, a polished portrait experience",45000,"from $450"],
        ["The Paint Party — paint and photo","Two-hour minimum, up to ten guests; $30 each beyond",42500,"from $425"],
      ] },
    ],
    quoteOnly: "A Black-owned, woman-owned photo booth company — 360 video, selfie, glam and paint-party experiences across the Bay Area, Sacramento, San Joaquin and Stanislaus counties. Every experience is a two-hour-minimum 'starting at' floor; backdrops add $75-$250; a rush fee from $50 inside fourteen days.",
  },

  /*
     INTL Kitchen — gathered 2026-09-09 from own-domain — BLOCKED: Cloudflare 'Just a moment' challenge on every path; not bypassed — nothing readable
     flag: Cloudflare managed challenge on /, /sitemap.xml and /robots.txt with both user agents
     flag: menu: 88 items read from https://intlkitchen.com/menu on 2026-09-05
  */
  'intl-kitchen': {
    sections: [
      { name: "Appetizers", items: [
        ["001. Spring Rolls","",998,"intl-kitchen-001-spring-rolls"],
        ["002. Fresh Rolls","Lettuce, cucumber, carrot, cabbage, and mixed green salad wrapped in rice paper. Served with peanut sauce",1298,"intl-kitchen-002-fresh-rolls"],
        ["003. Fried Tofu","Deep-fried fresh tofu triangles served with sweet chili sauce and a side of chopped peanuts",998,"intl-kitchen-003-fried-tofu"],
        ["004. Fish Cakes","4 pieces of deep-fried fresh fish cake from a mixture of fresh fish, chopped green beans, kaffir lime leaves, chili paste, and curry paste",1298,"intl-kitchen-004-fish-cakes"],
        ["005. Corn Cakes","Fritters (4) made with corn kernels, chopped green beans, kaffir lime leaves, chili paste, and curry paste",1098,"intl-kitchen-005-corn-cakes"],
        ["006. Pan Fried Dumplings","Pan-fried Thai-spiced chicken or pork dumplings (8) tossed in our house glaze",1098,"intl-kitchen-006-pan-fried-dumplings"],
        ["007. Crispy Wrap","Thai style prawns (7) deep-fried in an eggroll wrapper, served with house sweet chili sauce",1398,"intl-kitchen-007-crispy-wrap"],
        ["008. Golden Prawns","Deep-fried panko-breaded prawns (8) served with a side of french fries, complemented with a house sweet chili sauce",1598,"intl-kitchen-008-golden-prawns"],
        ["009. House Butter Garlic Fries","Crispy golden fries tossed in our house-made garlic butter garnished with garlic crisps",1098,"intl-kitchen-009-house-butter-garlic-fries"],
        ["010. Roti","A crispy multilayer Thai pancake served with house curry dip",998,"intl-kitchen-010-roti"],
        ["011. Chive Puff Paratha","",998,"intl-kitchen-011-chive-puff-paratha"],
        ["012. Shrimp Cakes","4 pieces of deep-fried fresh shrimp cake from a mixture of fresh shrimp, chopped green beans, kaffir lime leaves, chili paste, and curry paste",1398],
      ] },
      { name: "Grilled Chicken Hainan Rice", items: [
        ["200. Grilled Garlic Chicken Hainan Rice","Served with Fragrant Chicken Rice, Cucumber, Chicken Broth, Pickled Veggies, and House Sauce",1598,"intl-kitchen-200-grilled-garlic-chicken-hainan-rice"],
        ["201. Grilled Lemongrass Chicken Hainan Rice","Served with Fragrant Chicken Rice, Cucumber, Chicken Broth, Pickled Veggies, and House Sauce",1598,"intl-kitchen-201-grilled-lemongrass-chicken-hainan-ri"],
        ["202. Grilled Ginger Chicken Hainan Rice","Served with Fragrant Chicken Rice, Cucumber, Chicken Broth, Pickled Veggies, and House Sauce",1598,"intl-kitchen-202-grilled-ginger-chicken-hainan-rice"],
        ["203. Grilled House Chicken Hainan Rice","Served with Fragrant Chicken Rice, Cucumber, Chicken Broth, Pickled Veggies, and House Sauce",1598,"intl-kitchen-203-grilled-house-chicken-hainan-rice"],
      ] },
      { name: "Sizzling Rice Plates", items: [
        ["300. Sizzling Tofu Rice Plate","Fried tofu glazed in your choice of sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot. Comes with your choice of rice.",1598,"intl-kitchen-300-sizzling-tofu-rice-plate"],
        ["301. Sizzling Garlic Fillet Fish Rice Plate","Tender filet fish glazed in our house garlic sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot",1698,"intl-kitchen-301-sizzling-garlic-fillet-fish-rice-pla"],
        ["302. Sizzling BBQ Chicken Rice Plate","Tender chicken glazed in your choice of sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot",1598,"intl-kitchen-302-sizzling-bbq-chicken-rice-plate"],
        ["304. Sizzling BBQ Pork Rice Plate","Tender pork glazed in your choice of sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot. Comes with a side of soup and your choice of rice.",1698,"intl-kitchen-304-sizzling-bbq-pork-rice-plate"],
        ["305. Sizzling Garlic Prawn Rice Plate","Tender prawns glazed in our house garlic butter sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot",1798,"intl-kitchen-305-sizzling-garlic-prawn-rice-plate"],
        ["306. Sizzling Spare Ribs Rice Plate","Tender spare ribs glazed in your choice of sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot",1798,"intl-kitchen-306-sizzling-spare-ribs-rice-plate"],
        ["307. Sizzling Lemongrass Prawn Rice Plate","Tender prawns glazed in our house lemongrass sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot",1798,"intl-kitchen-307-sizzling-lemongrass-prawn-rice-plate"],
      ] },
      { name: "Roti Pizza", items: [
        ["400. Yellow Curry Roti Pizza 🌶️","King Mushroom, Bell Pepper, Yellow Onion, Thai Yellow Curry Sauce, and choice of protein on crispy Roti",1198,"intl-kitchen-400-yellow-curry-roti-pizza"],
        ["401. Green Curry Roti Pizza 🌶️","King Mushroom, Bell Pepper, Yellow Onion, Thai Green Curry Sauce, and choice of protein on crispy Roti",1198,"intl-kitchen-401-green-curry-roti-pizza"],
        ["402. Vegetarian Roti Pizza","Roti Pizza comes with Red Bell Pepper, Green Bell Pepper, Yellow Onion and King Mushroom",1198,"intl-kitchen-402-vegetarian-roti-pizza"],
        ["403. Build Your Own Roti Pizza","Roti Pizza comes with Red Bell Pepper, Green Bell Pepper, Yellow Onion and King Mushroom",1198,"intl-kitchen-403-build-your-own-roti-pizza"],
        ["404. Pork & Hot Links Roti Pizza","Hot link Sausage, Pork Sausage, King Mushroom, Red Bell Pepper, Green Bell Pepper, and Yellow Onion on crispy Roti",1298,"intl-kitchen-404-pork-hot-links-roti-pizza"],
        ["500. Signature Dry Rub Chicken Breast","Served with fries, yellow onion, red onion, and jalapeño.",1198,"intl-kitchen-500-signature-dry-rub-chicken-breast"],
        ["501. Signature Dry Rub Fried Tofu","Served with fries, yellow onion, red onion, and jalapeño.",1198,"intl-kitchen-501-signature-dry-rub-fried-tofu"],
        ["502. Signature Dry Rub Wings","Served with fries, yellow onion, red onion, and jalapeño.",1398,"intl-kitchen-502-signature-dry-rub-wings"],
        ["503. Fried Fish Signature Dry Rub","Served with fries, yellow onion, red onion and jalapeño.",1398,"intl-kitchen-503-fried-fish-signature-dry-rub"],
        ["504. Signature Dry Rub Prawns","Crispy shell-on prawns with fries, yellow onion, red onion and jalapeño.",1798,"intl-kitchen-504-signature-dry-rub-prawns"],
      ] },
      { name: "Angry style wings", items: [
        ["505. Angry Style Chicken Breast","Served with fried potato, yellow onion, red onion, and jalapeño.",1198,"intl-kitchen-505-angry-style-chicken-breast"],
        ["506. Angry Style Wings","Served with fried potato, yellow onion, red onion, and jalapeño.",1398,"intl-kitchen-506-angry-style-wings"],
        ["507. Angry Style Fried Fish","Served with fried potato, yellow onion, red onion, and jalapeño.",1398,"intl-kitchen-507-angry-style-fried-fish"],
      ] },
      { name: "Specialty Noodles", items: [
        ["700. Lort Cha Noodles","",1498,"intl-kitchen-700-lort-cha-noodles"],
        ["701. Kathiew Cha Noodles","",1498,"intl-kitchen-701-kathiew-cha-noodles"],
        ["702a. Phnom Penh Dry Noodles (Egg Noodles)","A savory Cambodian classic featuring egg noodles tossed in a special house sauce with crispy krill (tiny shrimp), bean sprouts, green onion, cilantro",1498,"intl-kitchen-702a-phnom-penh-dry-noodles-egg-noodles"],
        ["703. Basil Kathiew Cha Noodles","A Cambodian inspired dish featuring wide rice noodles stir-fried with Basil, Bell Pepper, Bean Sprouts, Yellow Onion, Green Onion",1498,"intl-kitchen-703-basil-kathiew-cha-noodles"],
        ["704. Yellow Curry Noodle Soup","A rich and creamy Thai soup made with yellow curry paste, coconut milk, and egg noodles, with vegetables and choice of protein",1498,"intl-kitchen-704-yellow-curry-noodle-soup"],
        ["705. Namya Noodle Soup","A spicy and aromatic Thai soup made with fish, coconut milk, and rice noodles.",1598,"intl-kitchen-705-namya-noodle-soup"],
        ["706. Num Banh Chok Noodle Soup","A traditional Cambodian dish featuring rice noodles topped with a fish-based green curry, coconut milk, and a variety of fresh herbs and vegetables.",1598,"intl-kitchen-706-num-banh-chok-noodle-soup"],
      ] },
      { name: "Grilled Whole Fish", items: [
        ["GF1. Grilled Whole Tilapia","Whole Grilled Tilapia fish served with Cucumber, Pickled Vegetables, House Sweet Chili Sauce, and your choice of Rice.",1598,"intl-kitchen-gf1-grilled-whole-tilapia"],
        ["GF2. Grilled Whole Pompano","Whole Grilled Pompano fish served with Cucumber, Pickled Vegetables, House Sweet Chili Sauce, and your choice of Rice.",1798,"intl-kitchen-gf2-grilled-whole-pompano"],
      ] },
      { name: "Salads", items: [
        ["100. Papaya Salad","Shredded green papaya with minced garlic, crushed peanuts, grape tomato, carrot, sliced green beans, and fresh Thai chili, dressed in fresh lime juice",1698],
        ["101. Mango Salad","Your choice of protein with mango, cashew nuts, green onion, roasted chili flakes, fresh cilantro, carrot, and diced red onions",1698,"intl-kitchen-101-mango-salad"],
        ["102. Cambodian Style Papaya Salad","Shredded papaya salad with Cambodian prahok fish sauce, with dry shrimp, finely grounded shrimp paste, green bean, cherry tomato, and ground peanuts",1898,"intl-kitchen-102-cambodian-style-papaya-salad"],
        ["103. Salted Crab Papaya Salad","Shredded green papaya with salted crab (3 pieces due to saltiness for flavor enhancement), dried shrimp, green bean, cherry tomato, with ground peanut",1998,"intl-kitchen-103-salted-crab-papaya-salad"],
      ] },
      { name: "Dessert", items: [
        ["D1. Mango Pudding","Creamy mango pudding with fresh mango chunks",499,"intl-kitchen-d1-mango-pudding"],
        ["D2. Mango Sticky Rice","Sweet sticky rice with coconut milk and fresh mango",1095,"intl-kitchen-d2-mango-sticky-rice"],
        ["D3. 2 Pandan Green Waffles","Crispy pandan flavored waffles",499,"intl-kitchen-d3-2-pandan-green-waffles"],
      ] },
      { name: "Sides", items: [
        ["SO1. Steam Rice","",250,"intl-kitchen-so1-steam-rice"],
        ["SO2. Brown Rice","",350,"intl-kitchen-so2-brown-rice"],
        ["SO3. Fragrant Chicken Rice","",350,"intl-kitchen-so3-fragrant-chicken-rice"],
      ] },
      { name: "AppeTea Milk Tea", items: [
        ["MT2. Assam Milk Tea","Freshly brewed Assam black tea topped with non-dairy creamer",499,"intl-kitchen-mt2-assam-milk-tea"],
        ["MT3. Jasmine Green Milk Tea","Freshly brewed Jasmine green tea topped with non-dairy creamer",499,"intl-kitchen-mt3-jasmine-green-milk-tea"],
        ["MT5. Taro Milk Tea","Non-dairy creamer infused with taro flavoring. Fixed sweetness.",599,"intl-kitchen-mt5-taro-milk-tea"],
        ["MT6. Mango Milk Tea","Freshly brewed Assam black tea or Jasmine green tea with non-dairy creamer infused with mango puree",599,"intl-kitchen-mt6-mango-milk-tea"],
        ["MT7. Lychee Milk Tea","Freshly brewed Assam black tea or Jasmine green tea with non-dairy creamer infused with lychee essence",599,"intl-kitchen-mt7-lychee-milk-tea"],
        ["MT8. Strawberry Milk Tea","Freshly brewed Assam black tea or Jasmine green tea with non-dairy creamer infused with strawberry puree",599,"intl-kitchen-mt8-strawberry-milk-tea"],
        ["MT9. Brown Sugar Milk Tea","Freshly brewed Assam black tea with non-dairy creamer and brown sugar swirl. Fixed sweetness.",599,"intl-kitchen-mt9-brown-sugar-milk-tea"],
        ["MT10. Passion Fruit Milk Tea","Freshly brewed Assam black tea or Jasmine green tea with non-dairy creamer infused with passion fruit essence",599,"intl-kitchen-mt10-passion-fruit-milk-tea"],
        ["MT11. Peach Milk Tea","Freshly brewed Assam black tea or Jasmine green tea with non-dairy creamer infused with peach essence",599,"intl-kitchen-mt11-peach-milk-tea"],
      ] },
      { name: "AppeTea Flavored Tea", items: [
        ["FT3. Lychee Mango Iced Tea","Freshly brewed Assam black tea or Jasmine green tea infused with mango puree and lychee essence",599,"intl-kitchen-ft3-lychee-mango-iced-tea"],
        ["FT4. Passion Fruit Tea","Freshly brewed Assam black tea or Jasmine green tea infused with passion fruit essence",599,"intl-kitchen-ft4-passion-fruit-tea"],
        ["FT5. Lemon Iced Tea","Freshly brewed Assam black tea or Jasmine green tea infused with fresh lemon",599,"intl-kitchen-ft5-lemon-iced-tea"],
        ["FT6. Mango Iced Tea","Freshly brewed Assam black tea or Jasmine green tea infused with mango puree",599,"intl-kitchen-ft6-mango-iced-tea"],
        ["FT7. Lychee Iced Tea","Freshly brewed Assam black tea or Jasmine green tea infused with lychee essence",599,"intl-kitchen-ft7-lychee-iced-tea"],
        ["FT8. Strawberry Iced Tea","Freshly brewed Assam black tea or Jasmine green tea infused with strawberry puree",599,"intl-kitchen-ft8-strawberry-iced-tea"],
        ["FT9. Peach Fruit Tea","Freshly brewed Assam black tea or Jasmine green tea infused with peach essence",599,"intl-kitchen-ft9-peach-fruit-tea"],
        ["L1. Iced Lemonade","Housemade lemonade",499,"intl-kitchen-l1-iced-lemonade"],
        ["L2. Iced Mango Lemonade","Housemade lemonade infused with mango puree",599,"intl-kitchen-l2-iced-mango-lemonade"],
        ["L3. Iced Strawberry Lemonade","Housemade lemonade infused with strawberry puree",599,"intl-kitchen-l3-iced-strawberry-lemonade"],
        ["L4. Iced Passion Fruit Lemonade","Housemade lemonade infused with passion fruit essence",599,"intl-kitchen-l4-iced-passion-fruit-lemonade"],
        ["L5. Iced Guava Lemonade","Housemade lemonade infused with guava essence",599,"intl-kitchen-l5-iced-guava-lemonade"],
        ["L6. Iced Lychee Lemonade","Housemade lemonade infused with lychee essence",599,"intl-kitchen-l6-iced-lychee-lemonade"],
      ] },
      { name: "AppeTea Thai Tea", items: [
        ["MT1. Thai Iced Tea","Classic steeped authentic Thai tea topped with half-and-half",599,"intl-kitchen-mt1-thai-iced-tea"],
        ["MT12. Thai Iced Coffee","Classic steeped authentic Thai coffee topped with half-and-half",599,"intl-kitchen-mt12-thai-iced-coffee"],
        ["MT4. Thai Iced Green Milk Tea","Steeped authentic Thai green tea topped with half-and-half",499,"intl-kitchen-mt4-thai-iced-green-milk-tea"],
        ["FT1. Thai Lemon Green Tea","Freshly brewed authentic Thai green tea infused with lemon",599,"intl-kitchen-ft1-thai-lemon-green-tea"],
      ] },
      { name: "Fried rice", items: [
        ["800. House Fried Rice","INTL Kitchen house fried rice with Egg, Carrot, Yellow Onion, Green Peas, Green Onion, minced Garlic, and your choice of protein in a savory house sauce.",1498,"intl-kitchen-800-house-fried-rice"],
        ["801. Basil Bai Cha","A Cambodian inspired fried rice with Basil, Bell Pepper, Bean Sprouts, Yellow Onion, Green Onion, minced Garlic",1498,"intl-kitchen-801-basil-bai-cha"],
        ["802. Tom Yum Fried Rice","A Thai inspired fried rice with Egg, Carrot, Yellow Onion, Green Peas, Green Onion, minced Garlic, and your choice of protein tossed in Tom Yum seasoning.",1498,"intl-kitchen-802-tom-yum-fried-rice"],
        ["803. Lemongrass Basil Fried Rice","INTL Kitchen fried rice with Lemongrass, Basil, Bell Pepper, Yellow Onion, Green Onion, minced Garlic, and your choice of protein in a savory house sauce.",1498,"intl-kitchen-803-lemongrass-basil-fried-rice"],
        ["804. Pineapple Fried Rice","A Thai style fried rice with Pineapple, Cashew Nuts, Egg, Carrot, Yellow Onion, Green Peas, Green Onion, minced Garlic",1498,"intl-kitchen-804-pineapple-fried-rice"],
        ["805. Pork & Hot Links Fried Rice","INTL Kitchen fried rice with Hot Link Sausage, Ground Pork, Egg, Yellow Onion, Green Onion, and minced Garlic in a savory house sauce.",1698,"intl-kitchen-805-pork-hot-links-fried-rice"],
      ] },
      { name: "Menu", items: [
        ["303. Sizzling Lemongrass Fillet Fish Rice Plate","Tender filet fish glazed in our house lemongrass sauce with King Mushroom, Onion, and Bell Pepper, served sizzling hot",1698,"intl-kitchen-303-sizzling-lemongrass-fillet-fish-rice"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     JDI Auto Detailing — gathered 2026-09-09 from own-domain
     they are: Mobile auto detailing
     flag: two contact emails on one site: the footer says info@jdidetailing.com, the contact page says info@jdiautodetailing.com — the one on their domain is carried
     flag: the before-and-after gallery uses Unsplash stock photos
     flag: no street address — 'Brentwood, CA (Mobile)'
  */
  'jdi-auto-detailing': {
    phone: "(925) 409-0127",
    email: "info@jdidetailing.com",
    hours: "Mon-Sat 8am-6pm",
    cuisine: "Mobile auto detailing",
    groups: [
      { name: "Prices, from", items: [
        ["Maintenance Detail","For regularly maintained vehicles with light buildup",12999,"from $129.99"],
        ["Full Detail","Complete interior and exterior",39900,"from $399"],
        ["Full Interior Detail","Deep interior cleaning; final price depends on size, stains, pet hair and odours",30000,"from $300"],
        ["Interior Restoration","For heavily soiled or neglected interiors",60000,"from $600"],
        ["Wash & Wax","Hand wash, decontamination as needed, durable wax",20000,"from $200"],
        ["Paint Enhancement","One-step polish for gloss and minor defects",35000,"from $350"],
        ["Paint Correction","Machine polishing for swirls, oxidation and visible defects",65000,"from $650"],
        ["Ceramic Coating","Long-term paint protection",79900,"from $799"],
      ] },
    ],
    quoteOnly: "Premium mobile auto detailing, paint correction and ceramic coating — 'showroom results to your driveway.' Every price is a floor — in their words, 'All prices are starting at rates; final pricing depends on vehicle size and condition'.",
  },

  /*
     Jenuine Fitness — gathered 2026-09-09 from own-domain
     their spelling: "JENUINE FITNESS" (roster keeps "Jenuine Fitness")
     they are: Gym and bootcamp
     logo: https://img1.wsimg.com/isteam/ip/ef4679e4-66e7-4d9e-ade7-68b1a8a3ab1c/logo/a720d831-287e-4c40-b5f0-4adb44e6bc3c.png (162x185) — not cut into a tile yet
     flag: no business hours published — only a Mon-Fri class schedule
     flag: the membership name is spelled 'UNLIMTED' on their site
     flag: a Wednesday HYROX class is listed at 4:30 AM beside PM classes — a likely AM/PM slip
     flag: the footer copyright says 2018; partner gym 510 Training Co. is called 'home of Jenuine Fitness'
  */
  'jenuine-fitness': {
    address: "1085 Broadway Avenue, San Pablo, CA 94806",
    phone: "(415) 740-7947",
    instagram: "JENUINE_FITNESS_",
    cuisine: "Gym and bootcamp",
    groups: [
      { name: "Prices", items: [
        ["Unlimited Classes, prepaid 3 months","Bootcamp membership",40000],
        ["Unlimited Classes, monthly autopay","Bootcamp membership",15000],
        ["Punch Card, 10 classes","Bootcamp or open gym",16500],
        ["Drop In","A bootcamp class or open gym",2000],
        ["HYROX 10-class pass, members","",12000],
        ["HYROX 10-class pass, non-members","",14000],
        ["HYROX single class","",2000],
        ["Youth 10-class pass","Middle and high school athletic training, $13 a class",13000],
      ] },
    ],
    quoteOnly: "'A training facility that offers strength and resistance training, one on one personal training, and small group training programs' — plus open gym and a HYROX training club. Personal and small-group training: 'rates vary, see Coach Jen for a consultation'.",
  },

  /*
     J&W Mobile Detailing — gathered 2026-09-09 from own-domain
     they are: Mobile auto detailing
     logo: https://jnwdetailing.com/images/logo-nav.webp (300x250) — not cut into a tile yet
     flag: the services page promises 'real prices' but contains no dollar figure
     flag: a FAQ sentence is missing its price values entirely
     flag: the FAQ says 'a blanket price list would only mislead you' while their blog publishes tiered floors
  */
  'jnw-detailing': {
    address: "2127 23rd Ave, Oakland, CA 94606",
    phone: "(510) 756-4995",
    email: "jnwdetailing@gmail.com",
    hours: "Daily 8am-8pm",
    instagram: "jnwdetail",
    cuisine: "Mobile auto detailing",
    groups: [
      { name: "Prices, from", items: [
        ["Exterior Detail","Hand wash, wheels and tyres, clay and iron decontamination, sealant",15000,"from $150"],
        ["Interior Deep Clean","Vacuum, steam, shampoo, stain and odour removal",20000,"from $200"],
        ["Standard Full Detail","Interior and exterior, a typical sedan",25000,"from $250"],
        ["Premium Full Detail","Decontamination, enhanced interior, paint work",35000,"from $350"],
        ["Paint Correction","Machine polishing for swirls and scratches",35000,"from $350"],
        ["Ceramic Coating","Prep, correction and a multi-year coating",50000,"$500-$1,800"],
      ] },
    ],
    quoteOnly: "Owner-operated mobile detailing and ceramic coating — 'we bring the shop to your driveway across Oakland and the East Bay, with our own water, power and eco-friendly products.' Their service pages carry no prices — 'every vehicle is quoted individually' — and these floors are the 'typical Oakland prices' from their own pricing guide.",
  },

  /*
     Jolly Roger Land — gathered 2026-09-09 from own-domain
     they are: Indoor playground
     logo: https://static.wixstatic.com/media/c1e1da_8e1aa65d7a3a488998ad46cf46e81b03~mv2.png (579x99) — not cut into a tile yet
     flag: Operator's note: Union City • Services
     flag: Business type per their own site: an indoor playground / children's play center ('Union city's best indoor family entertainment arena for parties and play', 'nearly 7,000 square feet', four-level soft play structure) with birthday-party rooms; open since January 22, 2019 (about page); Wix site, booking and waivers on LilyPad
     flag: Address spelling differs: the site (footer, contact page, party menu, printable invitation) says '31300 Courthouse Dr'; the Instagram bio says '31300 courthouse pl'
     flag: Phone differs: the site shows 510-362-7996 everywhere (header, footer tel link, menu, invitation, booking page); the Instagram profile's Call button dials +1 (510) 304-8683
     flag: Three emails published: the footer/contact text reads jollyrogerland@yahoo.com but that text is hyperlinked to mailto:info@jollyrogerland.com; the pricing, play-center and calendar pages print info@jollyrogerland.com; employment@jollyrogerland.com is for jobs. info@ is used here; verify with the owner
     flag: Name written several ways: 'Jolly Roger Land' (logo, footer, contact page, Instagram), 'JOLLY ROGER LAND' (page titles), 'Jollyrogerland'/'JollyRogerLand' (og:site_name, meta description, play-center heading, waiver), tagline 'Indoorplayground - Kidsplay - Funforkids' run together, and an Instagram post thumbnail reads 'JOLLY ROGERS LAND SAN JOSE CA'
     flag: Deposit contradiction on /pricing-plans: every party card and the booking page say '$200 Non-refundable', but the policy text on the same page says '$100 deposits is non-refundable', and the party terms add 'Deposits will be nonrefundable 3 weeks prior to your party date'
     flag: Weekday definition differs: open play uses 'Weekdays Monday to Friday', parties use 'Weekdays Monday to Thursday' and price Friday as a weekend; the party section heading reads 'FRIDAY, SATURDAY AND HOLIDAYS' while its cards say 'Friday to Sunday & Holidays'
     flag: Package contents inconsistent: the weekday 30 KIDS card ($715) lists only 'two large pizza (Value $55.98)' and '20 juice pouches' for 30 kids, while the weekend 30 KIDS card lists three pizzas and 30 pouches; both 20 KIDS cards value 'two large pizza' at $27.99, which is the menu price of one large pizza
     flag: Additional-child limits inconsistent: cards say '(Max 15)' for 10 kids and '(Max 5)' for 20 and 30 kids; the booking page allows up to 15 or 19 extra for the 10-kid packages and up to 36 for Mon-Thu 20 kids, yet says 'For parties larger than 29 please phone' on the Fri-Sun 20-kid package; the terms also say 'For parties of more than 10 children, please call us' although 20- and 30-kid packages are sold online
     flag: Outside food rules conflict: the policy says 'No outside food and drinks allowed' and '$10 per item' if you bring your own, while the party terms say 'No outside drinks are allowed, but food is permitted with a fee'
     flag: The Monday-Thursday 30 KIDS package ($715) is on the site but not offered on the LilyPad booking page (only the other five packages are)
     flag: Contact page shows a 'SPECIAL HOURS:' label with nothing after it; the hours themselves match on /pricing-plans and /contact, and the San Jose subdomain lists the same hours
     flag: Some 'BOOK NOW' buttons on /unioncity and /play-center link to /plans-pricing, a leftover page titled 'Pricing-old' showing an unnamed '$385 ... Valid for one week' plan; not counted as a price
     flag: Calendar page has no calendar entries; the 'REVIEWS' nav item just links to /unioncity
     flag: Socks are required ('All guests must wear socks on the play area') and sold at the admissions counter, but no sock price is published
     flag: The online ticket-sales page (LilyPad tickets1.php) needs a JavaScript date step and returned 'Invalid Selection' to direct fetches, so admission prices come from the site's pricing page, not the ticket page
     flag: Site disclaimers: 'Price/hours are subject to change without notice'; menu: 'All items are subject to sales tax (10.75%)' and 'All prices are subject to changes'
     flag: Age and charging rules: 'suitable for children AGED 12 and younger'; 'We charge anyone aged under 18 (except infants) regardless if they play or not'; children must be accompanied and supervised by a parent/legal guardian; a waiver is required for each playing child
     flag: Second location: San Jose (Westfield Oakridge Malls, 925 Blossom Hills RD, San Jose, CA, 95123) on sanjose.jollyrogerland.com with its own phone (408) 622-8306 and different prices; this record is the Union City location only
  */
  'jolly-roger-land': {
    address: "31300 Courthouse Dr, Union City, CA 94587",
    phone: "510-362-7996",
    email: "info@jollyrogerland.com",
    hours: "Mon-Wed 10am-7:30pm, Thu-Sun 10am-8pm",
    instagram: "_jollyrogerland",
    cuisine: "Indoor playground",
    tagline: "Indoor playground and kids' party center in Union City",
    groups: [
      { name: "Prices, from", items: [
        ["1 KID / UNLIMITED PLAY","Weekdays Monday to Friday. For 1 Kid. Unlimited Play Time. One child comes with 1 free adult. $7 for each additional adult",1800,"weekdays Mon-Fri"],
        ["1 KID / 1 hour","Saturday, Sunday & Holidays. For 1 Kid. 1 Hour Play Time. One child comes with 1 free adult. $7 for each additional adult",1800,"Sat, Sun & holidays"],
        ["1 KID / 2 hour","Saturday, Sunday & Holidays. For 1 Kid. 2 Hour Play Time. One child comes with 1 free adult. $7 for each additional adult",2100,"Sat, Sun & holidays"],
        ["1 KID / UNLIMITED PLAY","Saturday, Sunday & Holidays. For 1 Kid. Unlimited Play Time. One child comes with 1 free adult. $7 for each additional adult",2400,"Sat, Sun & holidays"],
        ["Additional adult","$7 for each additional adult (one child comes with 1 free adult; the same $7 charge applies at parties)",700,"per adult"],
        ["10 KIDS","Friday to Sunday & Holidays. For 10 Kids. 1 Hour Play Time. 60 Minutes in the Party Room. Includes One Large Pizza (Value $27.99). Includes 10 Juice Pouches. 10 Free Adults. $20 for each Additional child (Max 15). $7 for each additional adult. $200 Non-refundable",38500,"Fri-Sun & holidays"],
        ["20 KIDS","Friday to Sunday & Holidays. For 20 Kids. 1 Hour Play Time. 60 Minutes in the party room. Includes two large pizza (Value $27.99). Includes 20 juice pouches. 20 Free Adults. $20 for each Additional child (Max 5). $7 for each additional adult. $200 Non-refundable",58900,"Fri-Sun & holidays"],
        ["30 KIDS","Friday to Sunday & Holidays. For 30 Kids. 1 Hour Play Time. 60 Minutes in the party room. Includes three large pizza (Value $83.97). Includes 30 juice pouches. 30 Free Adults. $20 for each Additional child (Max 5). $7 for each additional adult. $200 Non-refundable",76500,"Fri-Sun & holidays"],
        ["10 KIDS","Weekdays Monday to Thursday. For 10 Kids. 1 Hour Play Time. 60 Minutes in the Party Room. Includes One Large Pizza (Value $27.99). Includes 10 Juice Pouches. 10 Free Adults. $20 for each Additional child (Max 15). $7 for each additional adult. $200 Non-refundable",33500,"weekdays Mon-Thu"],
        ["20 KIDS","Weekdays Monday to Thursday. For 20 Kids. 1 Hour Play Time. 60 Minutes in the party room. Includes two large pizza (Value $27.99). Includes 20 juice pouches. 20 Free Adults. $20 for each Additional child (Max 5). $7 for each additional adult. $200 Non-refundable",53500,"weekdays Mon-Thu"],
        ["30 KIDS","Weekdays Monday to Thursday. For 30 Kids. 1 Hour Play Time. 60 Minutes in the party room. Includes two large pizza (Value $55.98). Includes 20 juice pouches. 30 Free Adults. $20 for each Additional child (Max 5). $7 for each additional adult. $200 Non-refundable (as printed on the site; not offered on the online booking page)",71500,"weekdays Mon-Thu"],
        ["Party deposit","$200 Non-refundable on every party card and on the booking page (the policy text on the same page says $100)",20000,"non-refundable"],
        ["Additional child (party)","$20 for each Additional child; booking page: Extra child $20.00 each",2000,"per child"],
        ["Party overtime","There will be a $20 charge for every 10 minutes you go over your scheduled party time",2000,"per 10 minutes"],
        ["Excess cleaning charge","A $50 charge will be applied if excess cleaning is needed for your party",5000],
        ["Outside food/drink charge","If you bring your own food/drinks, you WILL be charged $10 per item",1000,"per item"],
        ["Pizza-Large Cheese or 1-Topping (15”)","",2799],
        ["Pizza-Large Master Pizzas (15”)","",3299],
        ["Pizza-King 1-Topping (18”)","",3299],
        ["Pizza-King Master Pizzas (18”)","",3799],
        ["Groovy Twists (Garlic Parmesan or Bacon/Cheese)","6 pieces",1000],
        ["Chicken Wings (Roasted, BBQ, Parmesan, Teriyaki)","24 pieces",3799],
        ["Boneless Wings (Roasted, BBQ, Parmesan, Teriyaki)","24 pieces",4099],
        ["French Fries","1 LB",700],
        ["Seasoned Potato Wedges","1 LB",950],
        ["Pasta-Chicken Alfredo","1 Small Tray",1700],
        ["Pasta-Meat Marinara","1 Small Tray",1700],
        ["Pepsi/Coke, Diet Pepsi/Coke, or Sprite","1 Liters",600],
        ["Honest Organic Juice Pouch (6.75FL OZ)","",125],
      ] },
    ],
    quoteOnly: "Indoor playground and kids' party center in Union City. Admission, party and fee prices from jollyrogerland.com/pricing-plans (repeated on /unioncity) and cross-checked on their LilyPad booking page; food prices from their linked 'Jolly Roger Land Party Food/ Drinks Menu' document (plus 10.75% sales tax); hours from 'OUR TIMINGS' on /pricing-plans and 'Hours of Operation' on /contact.",
  },

  /*
     Jump & Roll — gathered 2026-09-09 from own-domain
     they are: Soft play rentals
     logo: https://itsjumpandroll.com/wp-content/uploads/2025/07/Pack-Montarias-4.png (1080x1080) — not cut into a tile yet
     flag: the same product is '8x8 White Bounce House' in the list and '8x8 White Bouncer House' on its price card
     flag: Portuguese leftovers on the English site — the skip-link reads 'Ir para o conteúdo'
     flag: no address or hours published; a single page with anchor navigation
  */
  'jump-and-roll': {
    phone: "(510) 804-4147",
    email: "contact@itsjumpandroll.com",
    instagram: "itsjumpandroll",
    cuisine: "Soft play rentals",
    groups: [
      { name: "Prices", items: [
        ["6x6 Mini White Bouncer","Or add to any soft play rental for $75",24000],
        ["6x8 Three-in-One Mini Bouncer","",28000],
        ["8x8 Pastel Blue Bounce House","Ball pit attached",32000],
        ["10x10 White Bounce House","Or add to any soft play rental for $175",30000],
        ["White Soft Play","Ball pit, slide, climb tunnel, seesaw, fencing, foam flooring; a 12x16 area",54000],
        ["Pastel Soft Play","Ball pit, slide, stairs, climb set, ride-on toys; a 12x20 area",57000],
        ["Boho Luxe Soft Play","Slide, climbing rainbow arch, moon rocker, seesaw, beige flooring",56000],
        ["Classic Primary Soft Play","Roller-coaster ride-on, ball pit steps, four seesaws; a 12x20 area",58000],
      ] },
    ],
    quoteOnly: "Bounce house and soft play rentals 'where luxury meets fun,' delivered to your doorstep in the Bay Area. Flat per-package rental prices, $240-$580 across about twenty-five packages; travel fee by location; the mechanical bull is quote-only.",
  },

  /*
     Kabab Burger — gathered 2026-09-09 from own-domain
     their spelling: "Kabab Burger Mediterranean Grill" (roster keeps "Kabab Burger")
     they are: Mediterranean
     logo: https://kabab-burger.co/pluto-images/funnel/images/8d5f620f-65e9-4fd6-8725-0bdff4194b96 (2921x2888) — not cut into a tile yet
     flag: site is Owner.com; its host 403s a Chrome user agent but serves plain curl
     flag: menu: 114 items read from https://kabab-burger.co/menu on 2026-09-05
  */
  'kabab-burger': {
    address: "3647 Mount Diablo Blvd, Lafayette, 94549",
    phone: "(925) 297-6343",
    email: "kababburgerlafayette@gmail.com",
    hours: "Mon-Thu 11am-8pm, Fri-Sat 11am-8:30pm, Sun 11am-3pm",
    instagram: "kabab.burger.lafayette",
    cuisine: "Mediterranean",
    sections: [
      { name: "Appetizers", items: [
        ["1/2 Sampler Patter","Includes any combination of ONLY 4 items from the regular Sampler Platter.",1150,"kabab-burger-1-2-sampler-patter"],
        ["Baba Ganoush (Mini)","Served with 1 Pita bread.",775,"kabab-burger-baba-ganoush-mini"],
        ["Baba Ganoush (Regular)","Served with 1 Pita bread.",1050,"kabab-burger-baba-ganoush-regular"],
        ["Dolmas Appetizer (5)","Stuffed grape leaves w/rice & spices (5)",675,"kabab-burger-dolmas-appetizer-5"],
        ["Falafel Appetizer (5)","5 of our delicious Falafels balls made to order. Served with (1) side Tahini.",850,"kabab-burger-falafel-appetizer-5"],
        ["Hummus (Mini)","Served with 1 Pita bread.",775,"kabab-burger-hummus-mini"],
        ["Pickles (Large)","Pickled Cucumbers, Turnips & Olives.",899,"kabab-burger-pickles-large"],
        ["Pickles (Regular)","Pickled Cucumbers, Turnips & Olives.",645,"kabab-burger-pickles-regular"],
        ["Sampler Platter","Hummus, Turkish Salad Dip, Baba Ganoush, Spicy Eggplant, Pickles, Tahini, two Falafel balls, two Dolmas and served with two Pita breads.",1745,"kabab-burger-sampler-platter"],
        ["Side Pita (1)","",215,"kabab-burger-side-pita-1"],
        ["Spicy Eggplant (Mini)","Served with 1 Pita bread.",775,"kabab-burger-spicy-eggplant-mini"],
        ["Spicy Eggplant (Regular)","Served with 1 Pita bread.",1050,"kabab-burger-spicy-eggplant-regular"],
        ["Turkish Salad (Mini)","Served with 1 Pita bread.",775,"kabab-burger-turkish-salad-mini"],
        ["Turkish Salad (Regular)","Served with 1 Pita bread.",1050,"kabab-burger-turkish-salad-regular"],
        ["Tzatziki with pita","Served with 1 Pita bread.",645,"kabab-burger-tzatziki-with-pita"],
      ] },
      { name: "Salads", items: [
        ["Greek Salad (Large)","Romaine lettuce, Tomatoes, Cucumbers, Feta Cheese, Kalamata Olives, Red Onion & seasonings. Served with the house dressing on the side.",1495,"kabab-burger-greek-salad-large"],
        ["Greek Salad (Regular)","Romaine Lettuce, Tomatoes, Cucumbers, Feta Cheese, Kalamata Olives, Red Onion & seasonings. Served with the House Dressing on the side.",1199,"kabab-burger-greek-salad-regular"],
        ["House Salad (Large)","Fresh diced Tomatoes, Cucumbers, Shredded Romaine topped with Parsley and our house Dressing.",1325,"kabab-burger-house-salad-large"],
        ["House Salad (Regular)","Fresh diced Tomatoes, Cucumbers, Shredded Romaine topped with Parsley and our house Dressing.",995,"kabab-burger-house-salad-regular"],
      ] },
      { name: "Plates", items: [
        ["Chicken Gyros Plate","Thin slices of marinated rotisserie chicken served with Basmati Rice, Tzatziki, Greek Salad and one Pita bread.",1795,"kabab-burger-chicken-gyros-plate"],
        ["Chicken Kabab Plate","Cubes of marinated Chicken Breast grilled to perfection, served with Basmati Rice, House Salad, Hummus & one Pita Bread.",1995,"kabab-burger-chicken-kabab-plate"],
        ["Falafel Plate","Fresh made Falafel balls, served on a plate with Hummus, Tahini, House Salad & 1 Pita bread.",1675,"kabab-burger-falafel-plate"],
        ["Grilled Plain Chicken Breast Plate","Chicken breast Grilled to perfection served with Basmati Rice, House Salad, Hummus & one Pita Bread.",1995],
        ["Gyros Plate","Thin slices of marinated rotisserie Beef & Lamb Gyros. Served on a plate with Basmati Rice, Greek Salad, Tzatziki Sauce & one Pita Bread.",1795,"kabab-burger-gyros-plate"],
        ["Hummus Plate","Served with two Pita Breads and your choice of toppings.",1399,"kabab-burger-hummus-plate"],
        ["Kefta Kabab Plate","Grilled seasoned mixture of ground beef & lamb Grilled to perfection, served with Basmati Rice, House Salad, Hummus & one Pita Bread.",1995,"kabab-burger-kefta-kabab-plate"],
        ["Lamb Kabab Plate","Cubes of marinated lamb Grilled to Perfection, served with Basmati Rice, House Salad, Hummus & one Pita Bread.",2299,"kabab-burger-lamb-kabab-plate"],
        ["Mix two Kababs Plate","Choice of 2 skewers of Chicken, kefta or Lamb kababs.",2599,"kabab-burger-mix-two-kababs-plate"],
        ["Schnitzel Plate","Crispy pan fried seasoned and breaded Chicken Breast, served on a plate with French Fries, Hummus, House Salad & one Pita bread.",1895,"kabab-burger-schnitzel-plate"],
        ["Shawarma Plate","Thin slices of marinated rotisserie chicken served with Rice, Hummus, House Salad and one Pita bread.",1845,"kabab-burger-shawarma-plate"],
        ["Chicken Shawarma Plate","Thin slices of marinated rotisserie chicken served with Rice, Hummus, House Salad and one Pita bread.",1845,"kabab-burger-chicken-shawarma-plate"],
        ["Lamb Kabab Plate (Mini) HH","Cubes of marinated Australian lamb Grilled to Perfection, served with Basmati Rice, House Salad and Hummus. Ad a Pita Bread for $1.50",1350,"kabab-burger-lamb-kabab-plate-mini-hh"],
        ["Chicken Kabab Plate (Mini) HH","Cubes of marinated Chicken Breast grilled to perfection, served with Basmati Rice, House Salad, Hummus. Add a Pita Bread for $1.50",1250,"kabab-burger-chicken-kabab-plate-mini-hh"],
      ] },
      { name: "Pita Sandwiches", items: [
        ["Chicken Gyros in Pita","Thin slices of marinated Chicken, served inside a pita bread with hummus, Israeli salad & tahini",1575,"kabab-burger-chicken-gyros-in-pita"],
        ["Chicken Kabab in pita","Cubes of marinated Chicken Breast grilled to perfection, Served inside a Pita bread with Hummus, House salad & Tahini.",1695,"kabab-burger-chicken-kabab-in-pita"],
        ["Falafel in Pita","Freshly cooked Falafel balls, served inside a Pita bread with Hummus, Tahini, and House salad",1445,"kabab-burger-falafel-in-pita"],
        ["Gyros in pita","Thin slices of marinated Beef & Lamb strips, served inside a Pita bread with Salad and Tzatziki sauce",1575,"kabab-burger-gyros-in-pita"],
        ["Hummus in Pita","Hummus served in a Pita with Tahini and House Salad.",1275],
        ["Kefta Kabab in pita","Grilled seasoned mixture of Ground Beef & Lamb Grilled to perfection, served inside a Pita bread with Hummus, Israeli Salad & Tahini",1695],
        ["Lamb Kabab in Pita","Tender cubes of Marinated Lamb Grilled to perfection, served inside a Pita with Hummus, House Salad & Tahini.",1989],
        ["Schnitzel in pita","Crispy pan fried seasoned breaded Chicken Breast, served inside a Pita bread with Hummus, House Salad & Tahini",1695],
        ["Shawarma In Pita","Thin slices of marinated Chicken Shawarma, served inside a Pita bread with Hummus, House salad & Tahini.",1575,"kabab-burger-shawarma-in-pita"],
      ] },
      { name: "Burgers", items: [
        ["Kabab Burger","Grilled seasoned Lamb & Beef burger. Served on a toasted bun with Mayo, Lettuce, Tomato and Pickles",2139,"kabab-burger-kabab-burger"],
        ["Hamburger","Grilled 100% Ground Beef Chuck Burger. Served on a toasted Bun with Mayo, Lettuce, Tomato and Pickles",1725,"kabab-burger-hamburger"],
        ["Cheese Burger","Grilled 100% Ground Beef Chuck Burger. Served on a toasted Bun with Cheddar Cheese, Mayo, Lettuce, Tomato and Pickles",1830,"kabab-burger-cheese-burger"],
        ["Garden Burger HH","Garden Burger Grilled to perfection, served in a toasted bun with lettuce, tomato, pickles and a choice of one side.",1799,"kabab-burger-garden-burger-hh"],
        ["Greek Burger","Grilled Beef Burger topped with seasoned Feta Cheese. Served in a toasted Bun with Lettuce, Tomato, Red Onion and Tzatziki",1950,"kabab-burger-greek-burger"],
      ] },
      { name: "A la carte", items: [
        ["Side 1 Chicken Kabab","",895,"kabab-burger-side-1-chicken-kabab"],
        ["Side 1 Kefta Kabab","",895,"kabab-burger-side-1-kefta-kabab"],
        ["Side 1 Lamb Kabab","",1050,"kabab-burger-side-1-lamb-kabab"],
        ["Side Burger Patty","",675,"kabab-burger-side-burger-patty"],
        ["Side Gyros a-la-carte 6 oz.","",799,"kabab-burger-side-gyros-a-la-carte-6-oz"],
        ["Side Kabab Burger Patty","",869,"kabab-burger-side-kabab-burger-patty"],
        ["Side Schnitzel (7oz)","",845,"kabab-burger-side-schnitzel-7oz"],
        ["Side Shawama a-la-carte (6oz.)","",799,"kabab-burger-side-shawama-a-la-carte-6oz"],
      ] },
      { name: "Bowls & Platters", items: [
        ["Baklava 12 ea","",2800,"kabab-burger-baklava-12-ea"],
        ["Baklava 24 ea","",5000,"kabab-burger-baklava-24-ea"],
        ["Basmati Rice - Large","",5900,"kabab-burger-basmati-rice-large"],
        ["Basmati Rice - Medium","",4100,"kabab-burger-basmati-rice-medium"],
        ["Falafel Platter Appetizer - Large","",8600,"kabab-burger-falafel-platter-appetizer-large"],
        ["Falafel Platter Appetizer - Medium","",5200,"kabab-burger-falafel-platter-appetizer-medium"],
        ["Fried Eggplant Platter App. - Large","",11500,"kabab-burger-fried-eggplant-platter-app-large"],
        ["Fried Eggplant Platter App. - Medium","",7200,"kabab-burger-fried-eggplant-platter-app-medium"],
        ["Greek Salad - Large","",8700,"kabab-burger-greek-salad-large"],
        ["Greek Salad - Medium","",5000,"kabab-burger-greek-salad-medium"],
        ["Gyro Platter - Large","",12100,"kabab-burger-gyro-platter-large"],
        ["Gyro Platter - Medium","",7300,"kabab-burger-gyro-platter-medium"],
        ["House Salad (10 lbs Bowl) - Large","",7400,"kabab-burger-house-salad-10-lbs-bowl-large"],
        ["House Salad (5 lbs Bowl) - Medium","",4000,"kabab-burger-house-salad-5-lbs-bowl-medium"],
        ["Lamb Shish Kabab Platter - Large","",18200,"kabab-burger-lamb-shish-kabab-platter-large"],
        ["Lamb Shish Kabab Platter - Medium","",10900,"kabab-burger-lamb-shish-kabab-platter-medium"],
        ["Med, Sampler Platter App. - Large","",11500,"kabab-burger-med-sampler-platter-app-large"],
        ["Med. Sampler Platter App. - Medium","",7200,"kabab-burger-med-sampler-platter-app-medium"],
        ["Shawarma Platter - Large","",12100,"kabab-burger-shawarma-platter-large"],
        ["Shawarma Platter - Medium","",7300,"kabab-burger-shawarma-platter-medium"],
        ["Shish Kabab Mix Platter - Large","",14400,"kabab-burger-shish-kabab-mix-platter-large"],
        ["Shish Kabab Mix Platter - Medium","",7900,"kabab-burger-shish-kabab-mix-platter-medium"],
      ] },
      { name: "Kids Menu", items: [
        ["Kids (3) Falafel Plate","Three Falafels served with a choice of one side and one kids drink.",1099,"kabab-burger-kids-3-falafel-plate"],
        ["Kids Cheeseburger","Grilled 1/4 lb. 100% all beef burger. Served plain in a bun with Cheddar Cheese, one side & one kids drink.",1300,"kabab-burger-kids-cheeseburger"],
        ["Kids Chicken Kabab","Kids Chicken Kabab served with a choice of one side and one kids drink.",1299,"kabab-burger-kids-chicken-kabab"],
        ["Kids Grilled Cheese Pita","Grilled Cheese in a Pita Bread with a choice of one side & one kids drink.",1199,"kabab-burger-kids-grilled-cheese-pita"],
        ["Kids Grilled Chicken Breast (plain)","Served with a choice of one side and one kids drink.",1199,"kabab-burger-kids-grilled-chicken-breast-plain"],
        ["Kids Gyros","Thin slices of Gyros strips (Beef & Lamb) and Tzatziki Sauce served with a choice of one side and one kids drink.",1199,"kabab-burger-kids-gyros"],
        ["Kids Hamburger","Grilled 1/4 lb. 100% all beef burger. Served plain in a bun with a choice of one side and one kids drink.",1195,"kabab-burger-kids-hamburger"],
        ["Kids Schnitzel","Crispy pan fried breaded chicken breast strips served with a choice of one side and one kids drink.",1295],
        ["Kids Shawarma","Thin slices of Marinated Rotisserie Chicken served with one side & one kids drink.",1199],
      ] },
      { name: "Sides", items: [
        ["Dressing Side 2 oz.","",175,"kabab-burger-dressing-side-2-oz"],
        ["French Fries (Large)","",850,"kabab-burger-french-fries-large"],
        ["French Fries (Regular)","",549,"kabab-burger-french-fries-regular"],
        ["hummus side 2 oz.","",200,"kabab-burger-hummus-side-2-oz"],
        ["Pita Package White (5)","",795,"kabab-burger-pita-package-white-5"],
        ["Side 1 Patty Burger","",850,"kabab-burger-side-1-patty-burger"],
        ["Side Basmati Rice 12 oz.","",655,"kabab-burger-side-basmati-rice-12-oz"],
        ["Side Cucumber Spears (6)","",645,"kabab-burger-side-cucumber-spears-6"],
        ["Side Gluten Free Bread (2)","",250,"kabab-burger-side-gluten-free-bread-2"],
        ["Side Kabab Burger Patty a-la-carte","",969,"kabab-burger-side-kabab-burger-patty-a-la-carte"],
        ["Side Schnitzel A-la-carte 7 oz.","",895],
        ["Side Tomato Slices (4)","",225,"kabab-burger-side-tomato-slices-4"],
        ["Side Veggie Burger a-la-carte","",925,"kabab-burger-side-veggie-burger-a-la-carte"],
        ["Tzatziki Side 2 oz.","",150,"kabab-burger-tzatziki-side-2-oz"],
      ] },
      { name: "Desserts", items: [
        ["Baklava Pistachio (Finger)","",250,"kabab-burger-baklava-pistachio-finger"],
      ] },
      { name: "Cold Beverages", items: [
        ["Soda Can","",245,"kabab-burger-soda-can"],
        ["Fiji Water (small)","",299,"kabab-burger-fiji-water-small"],
        ["Frapuchino","",465],
        ["Gatorade","",375],
        ["Honest Kids","",195],
        ["Ice Tea","",375,"kabab-burger-ice-tea"],
        ["Jarritos","",325,"kabab-burger-jarritos"],
        ["Kern's","",325],
        ["Pellegrino Large Sparkling Water","",399],
        ["Pellegrino Spark. (small)","",319],
        ["Pellegrino Soda Can","",299],
        ["Snapple","",350],
        ["Vitamin Water","",375],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Kaisen Don — gathered 2026-09-09 from own-domain
     their spelling: "Tetsujin Kaisen Don" (roster keeps "Kaisen Don")
     they are: Sushi and kaisen don
     flag: brand split: the domain is tetsujinsushi.com but Toast and Instagram use 'Kaisen Don'; the full name appears only in the page title
     flag: no logo graphic exists — the favicon is a photo of a bowl
     flag: Resy 'Book your table' links hardcode a past date (2025-12-03)
     flag: happy hour: early-bird Mon-Fri 4-6pm, night-owl daily 8:30-10:30pm
     flag: menu: 200 items read from https://order.online/store/-297279?hideModal=true&pickup=true on 2026-09-05
  */
  'kaisen-don': {
    address: "1042 Marina Blvd, San Leandro, CA 94577",
    phone: "(510) 969-5399",
    hours: "Mon/Wed/Thu 11:30am-2:30pm & 4pm-12am, Tue 4pm-12am, Fri-Sun 11:30am-3:30pm & 4pm-12am",
    instagram: "kaisendon1939",
    cuisine: "Sushi and kaisen don",
    sections: [
      { name: "Starters", items: [
        ["Nankotsu","Fried chicken knee cartilage",1599,"kaisen-don-nankotsu"],
        ["Fish Soup","Daily fish broth , daikon radish , carrot , scallion (Slow cooked 6 hours , No Salt or Sodium added. Pure ingredients flavor .)",1099],
        ["Ika geso","Fried squid legs",1299,"kaisen-don-ika-geso"],
        ["Takowasa","Raw chopped octopus mix with fresh Japanese horseradish \"wasabi\"",1299,"kaisen-don-takowasa"],
        ["Umi masu crudo","Thin cut ocean trout serves with micro sprouts , house made soy vinaigrette , olive oil , avocado oil , salt & Ocean trout crispy roasted skin",2099,"kaisen-don-umi-masu-crudo"],
        ["Hirame usuzukuri (8 pc)","Halibut in thin cut style 8 pieces serves with ponzu sauce",2699,"kaisen-don-hirame-usuzukuri-8-pc"],
        ["Sashimi Deluxe 16pcs","",7999,"kaisen-don-sashimi-deluxe-16pcs"],
        ["Garlic fried shishito pepper","garlic stir fried shishito pepper",1699,"kaisen-don-garlic-fried-shishito-pepper"],
        ["Broadmoor Roll (5 pc.)","Chopped blue fin fatty tuna , scallion , avocado , roast garlic , radish sprout (We put wasabi in this roll",2099,"kaisen-don-broadmoor-roll-5-pc"],
        ["Fried half sea bream head","",2199],
        ["Oden","Fish cakes stew in house broth",1399,"kaisen-don-oden"],
        ["Oden (Mochi Kinchaku)","Mochi rice cake wrap with fried tofu pouch in house broth",1199,"kaisen-don-oden-mochi-kinchaku"],
        ["Tuna poki","Tuna, Onion , tomato , avocado, tomato, salt , olive oil , house made poki sauce & cilantro",2199,"kaisen-don-tuna-poki"],
        ["Hamachi poki","yellowtail , Onion , tomato , avocado, tomato, salt , olive oil , house made poki sauce & cilantro",2199,"kaisen-don-hamachi-poki"],
        ["Sushi tray F (1-2 people)","This party tray comes with: 1 Ashland Roll 1Lion king roll 1 Lobster salad roll 1 Salmon skin roll (Total 32 pc.)",5999,"kaisen-don-sushi-tray-f-1-2-people"],
        ["Sushi tray G (2 people)","This sushi tray comes: 1 Pear salmon roll 1 Peach mango roll 1 Tuna avocado roll 1 Hamchi avocado roll 1 California roll (real crab) (Total 40 pc. rolls)",5499,"kaisen-don-sushi-tray-g-2-people"],
        ["Negitoro don(limited item)","Chopped fatty blue fin tuna with scallions, side with pickles, Avocado, and Nitamago (Light marinated boiled egg). (This item comes with miso soup)",4299,"kaisen-don-negitoro-don-limited-item"],
        ["Garlic albacore roll","Albacore , garlic , scallion ,Perilla harb leaf , daikon sprout , wasabi & sweet soy",1099,"kaisen-don-garlic-albacore-roll"],
        ["Madai sashimi","Sea bream with seasoned salt , peanut oil , perilla herb leafs. tomato with olive oil & house salad dressing",2499,"kaisen-don-madai-sashimi"],
        ["Aji Sashimi","Thin cut Jack Horse mackerel serves with ginger , scallion , thin slices onion and ponzu sauce",2799,"kaisen-don-aji-sashimi"],
        ["Hiyayakko tofu","Chilled soft tofu serves with fresh ginger , scallion, fish flake and house special soy",999,"kaisen-don-hiyayakko-tofu"],
        ["Blue fin tuna Nigiri (Seasonal)","",1399,"kaisen-don-blue-fin-tuna-nigiri-seasonal"],
        ["(Veggie dumpling made by soy bean)","",1099],
        ["Age dashi tofu","Battered deep-fried tofu with scallion, fish flakes & house broth",1299,"kaisen-don-age-dashi-tofu"],
        ["Ankimo","Seasoned cooked Monk Fish liver serve with thin onion, ground radish, scallion, and house special dressing.",1899,"kaisen-don-ankimo"],
        ["Chicken Karaage","Fried chicken",1299,"kaisen-don-chicken-karaage"],
        ["Fried vegetable potato cake","",999],
        ["Edamame","Salted soy bean",699,"kaisen-don-edamame"],
        ["Fried oyster","",1299],
        ["Fried salmon head (2 pc.)","Seasoned fried salmon head",1299,"kaisen-don-fried-salmon-head-2-pc"],
        ["Garlic salted fried tofu","",1399,"kaisen-don-garlic-salted-fried-tofu"],
        ["Gyoza","6pc. potstickers with yuzu dressing",1299],
        ["Natto","Fermented soybean with house-made special soy sauce, scallion, and perilla leaf (First time order please make sure you know about this item)",899,"kaisen-don-natto"],
        ["Mix pickles","",799],
        ["Fried shrimp & vegetable","",1299],
        ["Poke salad","Assorted sashimi, slice onion, seaweed with house special poki sauce",1399],
        ["Seasoned fried halibut head & collar","",2099],
      ] },
      { name: "Grilled", items: [
        ["Kanpachi kama","Salted grill kanpachi collar",2099,"kaisen-don-kanpachi-kama"],
        ["Ika sugata yaki","Salted grill whole squid",2399,"kaisen-don-ika-sugata-yaki"],
        ["Maguro natto","Tuna, fermented soybean with house-made special soy sauce, scallion, and perilla leaf (First time order please make sure you know about this item)",1499,"kaisen-don-maguro-natto"],
        ["Lemon Pepper Salmon Kama","Lemon Pepper Salted grill salmon collar",1899,"kaisen-don-lemon-pepper-salmon-kama"],
        ["Smoke duck breast","Home made smoke duck breast with mix green salad",2399,"kaisen-don-smoke-duck-breast"],
        ["Soft shell crab","",1399,"kaisen-don-soft-shell-crab"],
        ["Spicy garlic Edamame","",1399,"kaisen-don-spicy-garlic-edamame"],
        ["Takoyaki","Batter cooked octopus serves with special house-made spicy mayo",1199,"kaisen-don-takoyaki"],
        ["Saba shioyaki Appetizer","Salted grill mackerel",1499,"kaisen-don-saba-shioyaki-appetizer"],
        ["Fried salmon kama","Seasoned fried salmon collar serves with house made soy vinaigrette",1899],
        ["Hamachi Kama Small","",1799,"kaisen-don-hamachi-kama-small"],
        ["Hamachi kama Large","Salted grill yellowtail collar",2199,"kaisen-don-hamachi-kama-large"],
        ["Kurodai kama","Seasoned fried snapper head",1299,"kaisen-don-kurodai-kama"],
        ["Shishamo","Seasoned fried smelt with roe",1599,"kaisen-don-shishamo"],
        ["Rainbow Don","Assorted sashimi over rice",3399,"kaisen-don-rainbow-don"],
        ["Salmon Don","7 pc. Salmon, sushi omelette over sushi rice, and side (this item comes with miso soup)",2999,"kaisen-don-salmon-don"],
        ["Salmon Ikura Don","Salmon, sushi omelette salmon caviar and sides",3499,"kaisen-don-salmon-ikura-don"],
        ["Hamachi Don","7 pc. Yellowtail, sushi omelet over sushi rice and side (this item comes with miso soup",2999,"kaisen-don-hamachi-don"],
        ["Tekka Don","7 pc. Tuna, sushi omelette and sides over rice",3299,"kaisen-don-tekka-don"],
        ["Toro Don","5 pc. Blue fin fatty tuna, chopped up fatty tuna with scallion, Avocado, Perilla leaf, pickle, fresh wasabi (this item comes with miso soup)",4399,"kaisen-don-toro-don"],
        ["Kaisen Don","Sea Scallop, crab, \"salmon caviar\" and sides over rice",3799,"kaisen-don-kaisen-don"],
      ] },
      { name: "Nigiri", items: [
        ["Kanpachi Nigiri (seasonal)","Amberjack",1199,"kaisen-don-kanpachi-nigiri-seasonal"],
        ["Kurodai Nigiri","Black Snapper",1299,"kaisen-don-kurodai-nigiri"],
        ["Fried chicken skin","Seasoned fried chicken skin with cabbage & tomato salad",1199,"kaisen-don-fried-chicken-skin"],
        ["Baeren SCHWARZ 330ml","(Made in Japan) SCHWARZ used to be drunk mainly in the former East Germany",1299,"kaisen-don-baeren-schwarz-330ml"],
        ["Ippin Junmai Daiginjo 720ml","(Rich , Dry) A hint of pineapple fragrance and sweet on the palate. Double Gold prize of San Francisco IWC Winer 2017. The best 2017, Double Gold 2017, 2015",8499],
        ["Yuzu nigori 300ml","(Sweet , Refreshing , Creamy ) Premium yuzu nigori sake using the best rice from Northern California and real, fresh yuzu juice from Japan.",2799],
        ["Negitoro hand roll","Chopped fatty blue fin tuna with scallion",1899],
        ["Salmon skin hand roll","",1099],
        ["Kihada maguro nigiri","Aged yellow fin tuna",1299,"kaisen-don-kihada-maguro-nigiri"],
        ["Mebachi Maguro Nigiri","Aged big eye tuna",1399,"kaisen-don-mebachi-maguro-nigiri"],
        ["Tsubugai nigiri","Whelk clam",1099,"kaisen-don-tsubugai-nigiri"],
        ["Japanese sea snail","",999],
        ["Salmon Nigiri","",999,"kaisen-don-salmon-nigiri"],
        ["Salmon Belly Nigiri","",1099,"kaisen-don-salmon-belly-nigiri"],
        ["Hamachi Belly Nigiri","Yellowtail Belly",1099,"kaisen-don-hamachi-belly-nigiri"],
        ["Bincho Nigiri","Albacore",999,"kaisen-don-bincho-nigiri"],
        ["Ebi Nigiri","Cooked sushi shrimp",899,"kaisen-don-ebi-nigiri"],
        ["Ika Nigiri","Squid",999,"kaisen-don-ika-nigiri"],
        ["Hirame Nigiri (Seasonal)","Halibut",1399,"kaisen-don-hirame-nigiri-seasonal"],
        ["Halibut pickled by kelp","",1499],
        ["Hirame Engawa Nigiri (Seasonal)","Fatty halibut",1499,"kaisen-don-hirame-engawa-nigiri-seasonal"],
        ["Cooked seasoned octopus","",999],
        ["Unagi Nigiri","BBQ freshwater eel",999,"kaisen-don-unagi-nigiri"],
        ["Omelette","",699,"kaisen-don-omelette"],
      ] },
      { name: "Salads", items: [
        ["Grilled chicken breast , mix green salad with house vinaigrette dressing","",1899],
        ["Fried chicken wing","",1399],
        ["Salmon teriyaki","Salted grill salmon with teriyaki sauce ,potato salad,mix green salad & sides",2499,"kaisen-don-salmon-teriyaki"],
        ["#51# House salad","Mix green salad with house salad vinaigrette dressing",799,"kaisen-don-51-house-salad"],
        ["Seaweed salad","",699,"kaisen-don-seaweed-salad"],
        ["Wakame sunomono","Slightly pickled seaweed & cucumber salad",899,"kaisen-don-wakame-sunomono"],
        ["Ika sansai","Seasoned cooked Calamari & veggiue salad",999,"kaisen-don-ika-sansai"],
        ["Sashimi salad","Green salad & sashimi mixed with house vinaigrette",1999,"kaisen-don-sashimi-salad"],
        ["Albacore tataki","Seared albacore, slice onion, scallion, garlic with olive oil and house dressing",2099,"kaisen-don-albacore-tataki"],
        ["Katsuo tataki","Seared Skipjack tuna, slice onion, scallion, garlic with olive oil and house salad dressing",2999],
      ] },
      { name: "Don and chirashi", items: [
        ["Omakase Don(Daily item)","Chef's choice",6999,"kaisen-don-omakase-don-daily-item"],
        ["Mini omakase chirachi(Daily item)","Daily item: (Chef choice Chirashi)",4599,"kaisen-don-mini-omakase-chirachi-daily-item"],
        ["Blue fin tuna don","7 pc. Blue fin Tuna, sushi omelette and sides over rice",3399],
      ] },
      { name: "Drinks", items: [
        ["*S. Pellegrino Sparking Natural Mineral Water 750ml","Large Bottle 1 litter",999,"kaisen-don-s-pellegrino-sparking-natural-mineral-wa"],
        ["Voss Still Water","Bottle 500 ml. Artesian water from Norway",599,"kaisen-don-voss-still-water"],
        ["Lychee oolong boba & aloe vera (480ml)","Jelly popping boba , Lychee oolong & aloe vera",699,"kaisen-don-lychee-oolong-boba-aloe-vera-480ml"],
        ["Calpico 335ml (Can)","Bottle 500ml Japanese non-carbonated soft drink",399,"kaisen-don-calpico-335ml-can"],
        ["Martinelli's Apple Juice","Bottle 296 ml",479,"kaisen-don-martinelli-s-apple-juice"],
        ["Ramune Lychee Soda","Japanese codd-neck bottle carbonated soft drink , 200ml (bottle)",499,"kaisen-don-ramune-lychee-soda"],
        ["Ramune Soda","Japanese codd-neck bottle carbonated soft drink 200ml (Bottle)",499,"kaisen-don-ramune-soda"],
        ["Yuzu Soda","Can 350 ml. Yuzu carbonated soda",499,"kaisen-don-yuzu-soda"],
        ["Plum soda","Can 350 ml Plum carbonated soda",499,"kaisen-don-plum-soda"],
        ["Tomomasu Swan Ramune","Tomomasu Swan Ramune is a unique Japanese soda that combines refreshing citrus flavors with a fizzy, effervescent kick",699,"kaisen-don-tomomasu-swan-ramune"],
        ["Boss cold black coffee(unsweetened)","Boss cold black coffee (237ml Can) from Japan",650,"kaisen-don-boss-cold-black-coffee-unsweetened"],
        ["Mexican Sprite","Classic, cool, crisp lemon-lime flavored taste that's caffeine free",599,"kaisen-don-mexican-sprite"],
        ["Mexican Fanta Orange","Liberate your every day with fizzy and refreshing fruit-flavored Fanta soda pop",599,"kaisen-don-mexican-fanta-orange"],
      ] },
      { name: "Classic rolls", items: [
        ["King salmon avo roll (Limited)","King salmon , avocado",1399],
        ["California roll (Imitation crab)","Imitation crab , Avocado",899,"kaisen-don-california-roll-imitation-crab"],
        ["Spicy crab roll","Spicy imitation crab , cucummber",899,"kaisen-don-spicy-crab-roll"],
        ["New york roll","Cooked shirmp , avocado",999,"kaisen-don-new-york-roll"],
        ["Salmon avo roll","Salmon , avocado",1199,"kaisen-don-salmon-avo-roll"],
        ["Spicy salmon avo roll","Spicy Salmon , avocado",1199,"kaisen-don-spicy-salmon-avo-roll"],
        ["Tuna avo roll","Tuna , avocado",1199,"kaisen-don-tuna-avo-roll"],
        ["Spicy tuna roll","House special mix spicy tuna, cucummber",1199,"kaisen-don-spicy-tuna-roll"],
        ["Hamachi avo roll","Hamachi, avocado",1199,"kaisen-don-hamachi-avo-roll"],
        ["Spicy hamachi avo roll","Spicy hamachi, avocado",1199,"kaisen-don-spicy-hamachi-avo-roll"],
        ["Peach salmon roll","Peach , salmon",1199,"kaisen-don-peach-salmon-roll"],
        ["Pear salmon roll","Salmon . pear",1199,"kaisen-don-pear-salmon-roll"],
        ["Mango salmon roll","",1199,"kaisen-don-mango-salmon-roll"],
        ["Mango tuna roll","",1199,"kaisen-don-mango-tuna-roll"],
        ["Philly roll","Salmon, cream cheese, cucumber",1199,"kaisen-don-philly-roll"],
        ["Salmon skin roll","Salmon skin , cucummber",1099,"kaisen-don-salmon-skin-roll"],
        ["Spicy shrimp roll (5 pc.)","Spicy cooked shrimp , avocado , cucumber",1399,"kaisen-don-spicy-shrimp-roll-5-pc"],
        ["Rock & Roll roll","BBQ fresh water eel , avocado",1199,"kaisen-don-rock-roll-roll"],
        ["Jalapeño hamachi roll","Jalapeño, cucumber ,yellowtail",1199,"kaisen-don-jalape-o-hamachi-roll"],
        ["Jalapeño salmon roll","Jalapeño, cucumber ,salmon",1199,"kaisen-don-jalape-o-salmon-roll"],
        ["Jalapeño tuna roll","Jalapeño, cucumber ,tuna",1199,"kaisen-don-jalape-o-tuna-roll"],
        ["Lobster salad roll","Lobster salad , avocado",1399,"kaisen-don-lobster-salad-roll"],
        ["Spicy scallop roll","Spicy scallop , avocado",1299,"kaisen-don-spicy-scallop-roll"],
        ["Tempura roll","Shrimp tempura, cucumber, avocado, with special house made sauce",1199,"kaisen-don-tempura-roll"],
        ["Spider roll","Battered fried soft shell crab, cucumber, avocado, with special house made sauce",1599,"kaisen-don-spider-roll"],
        ["Negihama maki","Chopped yellowtail with scallion (We put wasabi in this roll , please let your servers know if you don't want wasabi in it , thanks!)",1199,"kaisen-don-negihama-maki"],
        ["Tekka maki","tuna roll (We put wasabi in this roll , please let your servers know if you don't want wasabi in it , thanks!)",1199,"kaisen-don-tekka-maki"],
        ["Seasoned cooked octopus salad","",999],
        ["Negitoro maki","Chopped fatty blue fin tuna with scallion (We put wasabi in this roll , please let your servers know if you don't want wasabi in it , thanks!)",1799,"kaisen-don-negitoro-maki"],
        ["Ika mentai maki","Squid & spicy cod roe with perilla leaf",1299,"kaisen-don-ika-mentai-maki"],
        ["Pear & avocado","",899],
        ["Avo mango roll","Avocado , mango",899,"kaisen-don-avo-mango-roll"],
        ["Mango & japanese pickle","",899],
        ["Veggie tempura roll 5pc.","Tempura vegetable",999,"kaisen-don-veggie-tempura-roll-5pc"],
        ["Avocado roll","",999,"kaisen-don-avocado-roll"],
        ["Kappa maki","cucummber",799,"kaisen-don-kappa-maki"],
        ["Mango maki","",799,"kaisen-don-mango-maki"],
        ["Yamagobo maki","Pickled mountain root",799,"kaisen-don-yamagobo-maki"],
        ["Kanpyo maki","Sweet pickle gourd",799,"kaisen-don-kanpyo-maki"],
        ["Oshinko maki","Pickled giant radish (Daikon)",799,"kaisen-don-oshinko-maki"],
        ["Plum paste ,Saseme seed,perilla leaf","",799],
        ["Inari","Seasoned fried tofu wrap",799,"kaisen-don-inari"],
        ["Pear","",799,"kaisen-don-pear"],
      ] },
      { name: "Special rolls", items: [
        ["Dragon roll","Imitation crab meat, avocado, wrapped BBQ eel and avocado,with house special made sauce",1999,"kaisen-don-dragon-roll"],
        ["Tempura dragon roll","Tempura shirmp, cucummber, wrapped BBQ eel and avocado,with house special made sauce & flying fish roe",1999,"kaisen-don-tempura-dragon-roll"],
        ["Caterpillar roll","BBQ eel, cucumber, wrapped with avocado, with house special made sauce",1999,"kaisen-don-caterpillar-roll"],
        ["Rainbow roll","Imitation crab meat, avocado, wrapped with assorted sashimi",2099,"kaisen-don-rainbow-roll"],
        ["Ashland roll","Inside : Avocado , Cream cheese , Outside :baked Yellowtail, fish roes , scallion , spicy mayo & house special sauce",1999,"kaisen-don-ashland-roll"],
        ["Baked scallop","Imitation crab meat, avocado, topped with baked scallop and house special sauce",2199,"kaisen-don-baked-scallop"],
        ["Flamango roll","Cucumber, avocado wrapped with mango and0 salmon, topped with octopus salad, tobiko and scallion",2099,"kaisen-don-flamango-roll"],
        ["Orchard roll","Inside imitation crab, avocado. Outside wrap with tuna and avocado. Top with thin slices onion,cucumber",2099,"kaisen-don-orchard-roll"],
        ["Estudillo roll","Inside salmon , avocado, Outside wraps hamachi , avocado, shiso leaf .top with tobiko flying fish roe ,green onion",2199,"kaisen-don-estudillo-roll"],
        ["Davis roll","Inside spicy sea scallop , avocado . outside wraps by tuna . top Scallion",2199],
        ["Marina roll","Inside : spicy tuna , flying fish roe , scallions, cucumber. Outside wraps with yellowtail & albacore tuna .Top with green salad",2199,"kaisen-don-marina-roll"],
        ["Sunset roll","Tempura shrimp, cucumber wrapped with tuna, salmon and avocado. Topped with spicy crab, flying fish roes and scallion",2199,"kaisen-don-sunset-roll"],
        ["49er roll","Real crab meat, avocado, wrapped with salmon and lemon",2199,"kaisen-don-49er-roll"],
        ["Manor roll","inside Spicy tuna , cucumber . outside wraps with yellowtail & avocado . top with aioli & thin slice Jalapeno pepper",2199,"kaisen-don-manor-roll"],
        ["Fairmont Roll","Shiso leaf , Scallion , Tuna , Blue fin fatty tuna , Uni \"Sea urchin\"",3299,"kaisen-don-fairmont-roll"],
      ] },
      { name: "Hand rolls", items: [
        ["California hand roll","Imitation crab , Avocado",849,"kaisen-don-california-hand-roll"],
        ["California hand roll Real crab","Real crab , avocado",1599,"kaisen-don-california-hand-roll-real-crab"],
        ["Spicy crab hand roll","Spicy imitation crab , cucummber",899,"kaisen-don-spicy-crab-hand-roll"],
        ["Salmon avo hand roll","Salmon , avocado",1199,"kaisen-don-salmon-avo-hand-roll"],
        ["Spicy salmon avo hand roll","Spicy Salmon , avocado",1199,"kaisen-don-spicy-salmon-avo-hand-roll"],
        ["Tuna avo hand roll","Tuna , avocado",1199,"kaisen-don-tuna-avo-hand-roll"],
        ["Spicy tuna hand roll","House special mix spicy tuna, cucummber",1199,"kaisen-don-spicy-tuna-hand-roll"],
        ["Hamachi avo hand roll","Hamachi, avocado",1199,"kaisen-don-hamachi-avo-hand-roll"],
        ["Spicy hamachi avo hand roll","Spicy hamachi, avocado",1199,"kaisen-don-spicy-hamachi-avo-hand-roll"],
        ["Mango salmon hand roll","",1199],
        ["Unagi hand roll","BBQ fresh water eel , avocado",1199],
        ["Lobster salad hand roll","Lobster salad , avocado",1399,"kaisen-don-lobster-salad-hand-roll"],
        ["Spicy scallop hand roll","Spicy scallop , avocado",1299,"kaisen-don-spicy-scallop-hand-roll"],
        ["Negihama hand roll","Chopped yellowtail with scallion",1199,"kaisen-don-negihama-hand-roll"],
        ["Spicy toro hand roll","Spicy toro , scallion , cucumber",1899],
        ["Ika ikura hand roll","Fresh squid , house made",1699],
      ] },
      { name: "Veggie rolls", items: [
        ["Veggie combo","This combo comes with: 1 Kappa maki 1 Oshinko maki 1 Yamagobo maki 1 Kanpyo maki 2 pc Inari",3599,"kaisen-don-veggie-combo"],
        ["Veggie roll 5 pc.","Mix vegetable",899,"kaisen-don-veggie-roll-5-pc"],
      ] },
      { name: "Noodles", items: [
        ["Chicken udon","House made soup chicken udon with vegetable & scallion",1899,"kaisen-don-chicken-udon"],
        ["Beef udon","House made soup beef udon with vegetable & scallion",1999,"kaisen-don-beef-udon"],
        ["Tempura udon","House made soup udon with vegetable & shrimp tempura , scallion",1899],
        ["Shoyu ramen","Soy sauce broth ramen noodle , chashu (Roasted pork belly), ajitsuke tamago",1799,"kaisen-don-shoyu-ramen"],
        ["Zaru soba","Cold buck wheat noodle serves house made dipping sauce with scallion , ground radish , wasabi",1699,"kaisen-don-zaru-soba"],
        ["Zaru somen(cold noodle)","Chilled wheat flour noodles ,grated fresh ginger , scallion with dipping sauce",1699],
      ] },
      { name: "Sashimi", items: [
        ["Salmon sashimi","salmon",1599,"kaisen-don-salmon-sashimi"],
        ["Hamachi Nigiri","Yellowtail",999,"kaisen-don-hamachi-nigiri"],
        ["Tuna sashimi","",1699,"kaisen-don-tuna-sashimi"],
        ["Albacore Sashimi","",1599,"kaisen-don-albacore-sashimi"],
        ["Sashimi combo 10 pc.","",3999,"kaisen-don-sashimi-combo-10-pc"],
        ["Blue Fin Tuna Sashimi 4pc","",1799],
        ["Ocean trout sashimi (4pc.)","",1899],
        ["Arctic char","",1999],
        ["Toro sashimi (4pc)","Fatty blue fin tuna",3099,"kaisen-don-toro-sashimi-4pc"],
        ["Amberjack yellowtail","",2099],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Kusan Bazaar — gathered 2026-09-09 from own-domain
     they are: Halal Uyghur, Central Asian
     logo: https://kusanbazaar.com/pluto-images/funnel/images/880af640-b202-4c7f-87ab-3e1ba1de6709 (1352x264) — not cut into a tile yet
     flag: Glenn: 'Milpitas • Goods'
     flag: Operator's exact note: San Jose • Goods, Milpitas • Goods, Mountain View • Goods
     flag: Naming: the site's header, <title>, logo and story page brand the umbrella as 'Kusan Collective'; the location names are 'Kusan Uyghur Cuisine 西域小巴郎- San Jose', 'Kusan Bazaar 龟兹集市- Milpitas' and 'Kusan Bazaar 龟兹集市- Mountain View'; Instagram display name is 'Küsan'; footer copyright reads 'Slow Food Diary LLC 2026 All Rights Reserved'. name_exact uses 'Kusan Bazaar' (domain, app name, two of three locations)
     flag: Site footer disclaimer (verbatim): 'Kusan Bazaar and Kusan Uyghur Cuisine are independently owned and operated. The two businesses are not affiliated in any legal or financial capacity.' Yet one site, one Instagram, one email and one app cover all three locations, so the San Jose location may not belong under a 'Kusan Bazaar' listing
     flag: San Jose hours contradict each other on the site, so they are left null. Homepage store-hours block: Sun 10:30am-3pm & 5-9pm, Mon-Fri 10:30am-2:30pm & 5-9pm, Sat 10:30am-3pm & 5-9pm. /page/locations: Sunday 10:30 AM–9 PM, Monday–Thursday 10:30 AM–2:30 PM & 4:30–9 PM, Friday 11 AM–2:30 PM & 5–9:30 PM, Saturday 10:30 AM–9 PM
     flag: Menus and prices differ by location. The default kusanbazaar.com/menu is the San Jose menu with lower prices (French-style Roasted Lamb Chops with Salads $18.95+ vs $29.95 in Milpitas; Homemade Amine Yogurt $5.95 vs $6.95; Uyghur Roast Lamb Shank $25.99 vs $25.95; Soda $2.00 vs $2.50). Mountain View has a 'streamlined' menu with different items (Grilled Lamb Cold Noodles $18.95, Grilled Chicken Cold Noodles $21.25, Lobster Tails $39.19+, Uyghur Lamb Wraps (2 piece) $17.95, yoghurt beverages $6.50). Items above are the Milpitas menu only
     flag: Broken link: the Milpitas 'Order Now' button on /page/locations points to /menu/kusanbazaar-bcnyw1, which returns HTTP 404; the working Milpitas menu (linked from the homepage) is /menu/kusanbazaar-milpitas
     flag: SEO oddities: page titles read 'Kusan Collective | Best Chinese Food in Bay Area | Chinese Food near me' and 'Best Chinese Food in California' although the food is Uyghur/Central Asian halal; the FAQ 'What areas do you serve?' lists only San Jose neighborhoods (no Milpitas or Mountain View)
     flag: Instagram vs site contact: Instagram contact sheet shows (855) 695-8726 and order@kusancuisine.com, while the site publishes per-location phones and Kusanbazaar@gmail.com; Instagram bio address is only the San Jose one; the handle is kusanuyghurcuisine (the San Jose name) while the site's Facebook link is facebook.com/KusanBazaar. An Instagram post advertises a weekend-only 'Grilled Lamb Cold Noodles' promo at $9.95 (reg $18.95)
     flag: Possible fourth location: an Instagram 4th of July post footer lists 'MILPITAS · SAN JOSE · MOUNTAIN VIEW · SAN MATEO'; San Mateo appears nowhere on the site (not on /page/locations, story, contact or catering pages)
     flag: Site platform: own domain built on Owner.com ('Powered by Owner' in footer), ordering via the same domain plus an OrderSave app (kusanle0e.app.ordersave.com); pages load in a browser/WebFetch but curl gets a Cloudflare challenge (HTTP 403), so automated re-checks may fail
     flag: Logo: the only logo file on the site is the 'KUSAN COLLECTIVE / NEW UYGHUR FUSION' wordmark (black text on white, served as image/avif at 1352x264; append ?w=N&h=N&fit=contain for resized copies); no 'Kusan Bazaar' logo is published, and the Instagram avatar 'KÜSAN' roundel has no fetchable URL from own sources
     flag: Odd published prices: Stewed Mutton Soup $3.99+ and Flat Noodle $3.00 look like side/add-on sizes; Roasted Whole Lamb is $488.00+ and marked 'Advance booking required'; some descriptions are truncated on the site (e.g. Beef Noodle Soup ends with 'and White')
  */
  'kusan-bazaar-milpitas': {
    address: "510 Barber Ln, Milpitas, CA 95035",
    phone: "(408) 549-2078",
    email: "Kusanbazaar@gmail.com",
    hours: "Mon-Thu 11am-2:30pm & 5-9pm, Fri 11am-2:30pm & 5-9:30pm, Sat 11am-9:30pm, Sun 11am-9pm",
    instagram: "kusanuyghurcuisine",
    cuisine: "Halal Uyghur, Central Asian",
    tagline: "Halal Uyghur Silk Road restaurant on Barber Lane in Milpitas",
    sections: [
      { name: "Appetizers & Salads 沙拉和前菜", items: [
        ["Samsa (2 piece per serve) 烤包子","Flour, Lamb, Onions, Black peppers, Salt, and Sesame (Two pieces per serving)",795],
        ["Uyghur Salad 维吾尔风味沙拉","Tomato, Onion, Green pepper, Coriander, Dry red pepper, Salt, Sesame oil, Vinegar (Vegan Food, Gluten free)",799],
        ["Eggplant With Mashed Garlic 蒜蓉茄子沙拉","Eggplant, Garlic, Cilantro, Dry red pepper, Salt, Sesame oil, Prickly pepper oil, Chili oil, Garlic water (Vegan Food, Gluten Free)",899],
        ["Black Fungus Salad 爽心木耳沙拉","Black Fungus, Goji Berries, Onion, Garlic, Cilantro, Soy Sauce, Chili oil, Sesame oil, Vinegar (Vegan Food, Gluten Free)",799],
        ["Cold Chili Chicken 椒麻鸡","Chicken, Onion, Cilantro, Dry red pepper, Salt, Sesame oil, Chili oil, Prickly pepper oil. (Gluten Free)",950],
        ["Sliced Beef with Sauce 凉拌牛肉","Sliced beef, Green onion, Cilantro, Dry red pepper, Salt, Sesame oil, Chili oil, Prickly pepper oil (Gluten Free)",1095],
      ] },
      { name: "Silk Road Grilled 维吾尔风烤制", items: [
        ["Lamb Kebab (2 Skewers) 烤羊肉串","Lamb, Cumin, and Chili powder. (Serves two skewers per order) (Gluten free)",995],
        ["Chicken Kebab (2 Skewers) 烤鸡肉串","Chicken, Cumin, and Chili powder. (Serves two skewers per order) (Gluten free)",895],
        ["Wellington-Style Roasted Lamb Shank 惠灵顿风羊腿面包","",2895],
        ["Golden Crispy Roasted Lamb Rib 黄金脆片烤羊排","Lamb Rib, Onion, Home-made BBQ powder",2495],
        ["Uyghur Grilled Lamb Shank 维吾尔特色焖烤羊腿","Lamb Shank, Onion, Fennel Seeds, Sichuan Peppercorn, Cumin, White Pepper, Bay Leaves, Cinnamon, Star Anise, Black Cardamom, Angelica Root, Nutmeg, Salt. (Halal Lamb From Australasia, No Msg, Homestyle)",2595],
        ["French-Style Roasted Lamb Chops with Salads 法式烤羊排配沙拉","Lamb chops, Cumin, Chili powder and Italian season. (Gluten free)",2995],
        ["Whole Roasted Fish with Silk Road Garlic Spice- 丝路风味蒜香金皮烤整鱼","Freshwater Catfish, Garlic, BBQ powder （Contains Bones）",2995],
        ["Slow-Roasted Beef Rib 慢烤牛肋排","Beef Ribs, Cumin, Salt, Chili Powder. (Gluten Free)",2595],
        ["Grilled Garlic Naan Bread 蒜香烤馕饼","Naan bread, Cumin, and Chili powder. (Vegan)",250],
        ["Roasted Whole Lamb (Advance booking required) 烤全羊","Halal Whole lamb (cleaned and gutted), Cumin, Chili powder, Egg, Olive oil, Salt, Black pepper, Minced garlic, Rosemary, Thyme.",48800,null,"from $488"],
      ] },
      { name: "Uyghur Noodles 维吾尔面食", items: [
        ["Big Plate Chicken 大盘鸡拌面","Chicken (Bone-in), Potato, Green pepper, Garlic, Dry red pepper, and house spices, served with flat wheat flour noodles.",2495,null,"from $24.95"],
        ["Laghman 拉条子","Homemade noodles, Lamb, Cabbage, Potatoes, Tomato, Green onion, Green Pepper, and Black Fungi. (Choose spicy level: No spicy, Spicy, Extra spicy)",1995],
        ["Peppercorn Beef Tossed Noodles 藤椒牛肉辣皮子拌面","",1995],
        ["Beef Cumin Chao-mian 孜然牛肉炒拉条子","Handmade Noodles, Beef, Cumin, Onion, Pepper, Salt",1895],
        ["Lamb Cumin Chao-mian 孜然羊肉炒面","Lamb, Noodles, Cumin, Onion, Pepper, Salt",1895],
        ["Veggie Cumin Chao-mian 孜然时蔬炒拉条子","Handmade noodles, Shredded Carrots, Onion, Pepper, Black Fungus, Cumin,",1795],
        ["Signature Braised Beef Rib Noodle Soup 西域牛肋排面","Handmade noodles, Beef rib, Green onion, Chives, Cilantro, Chili oil, and White radish",2295],
        ["Beef Noodle Soup 清汤牛肉面","Wheat flour Noodles, Beef, Green onion, Chives, Cilantro, Chili oil, and White",1795],
        ["Lamb Noodle Soup 清汤羊肉面","Wheat flour Noodles, Lamb, Goji Berries, Green onion, Cilantro, Chili oil White",1795],
      ] },
      { name: "Signature Pilaf Set 手抓饭套餐", items: [
        ["Braised Beef Pilaf 香炖牛肉粒手抓饭","",2095],
        ["Braised Lamb Rib Pilaf 新西兰羊排手抓饭","",2295],
        ["6-Hour Braised Lamb Shank Pilaf 六小时慢炖羊腿手抓饭","",2795],
        ["Garlic-Baked Cold-Water Lobster Pilaf 蒜蓉焗烤北大西洋冷水龙虾手抓饭","",2695],
      ] },
      { name: "Dumplings & Wontons 饺子 · 馄炖", items: [
        ["Lamb Broth with Handcrafted Mini Wontons 羊汤手工小馄饨","",1895],
        ["Handcrafted Dumplings - Beef with Celery (10 Piece) 手工牛肉芹菜水饺","Beef, Celery.Flour, Seasonings",1695],
      ] },
      { name: "Uyghur Wraps 维吾尔烤肉卷", items: [
        ["Uyghur Lamb Wraps 维吾尔酸奶羊肉卷","Lamb, Tomato, Onion, Green Pepper, home-made Yogurt wrapped with Naan bread.",1695],
        ["Uyghur Chicken Wraps 维吾尔酸奶鸡肉卷","Chicken, Tomato, Onion, Green Pepper, home-made Yogurt wrapped with Naan bread.",1595],
      ] },
      { name: "Soup and Stew 汤和炖菜", items: [
        ["Stewed Mutton Soup 清炖羊腩汤","Lamb, Goji Berries, White Pepper, Salt",399,null,"from $3.99"],
        ["6-Hour Braised Lamb Shank with Naan 慢炖羊腿配烤馕","Lamb Shank, Naan bread, Asparagus, Cilantro and decorated with White Sesame and Sliced dry red pepper.",2495],
        ["Braised Lamb Ribs With Dipping Sauce 慢炖新西兰小羊排 （手抓羊肉）","Lamb Rib, White Pepper, Salt",2295],
      ] },
      { name: "Dessert 甜品", items: [
        ["Homemade Amine Yogurt 维吾尔妈妈手工酸奶","Home-made Yogurt, Almond and Honey (Vegetarian)",695],
        ["Yogurt Pressé Cone with Fig Jam 冷萃干噎酸奶甜筒","Home-made Yogurt Cheese, Fig Jam, Cone, Dry Rose (Vegetarian)",895],
        ["Baklava 巴克拉瓦酥皮坚果蛋糕","Sweet dessert pastry made of layers of filo filled with chopped nuts and sweetened and held together with honey (Vegetarian)",495],
      ] },
      { name: "Drinks 饮品", items: [
        ["Uyghur Special Milk Tea 维吾尔风味特调微咸奶茶","Made with milk, black tea, butter, cream, and salt. (Hot)",595],
        ["Dogap Yoghurt Beverage (Sour) 多哈普微糖酸奶饮","",695],
        ["Honey Lemon Flavor Yoghurt Beverage 柠檬蜂蜜果粒酸奶饮","",695],
      ] },
    ],
    siteNote: "Prices and descriptions are the Milpitas online-ordering menu on kusanbazaar.com; hours from the homepage location card and the locations page, which agree for Milpitas.",
  },

  /*
     Kusan Bazaar — gathered 2026-09-09 from own-domain
     they are: Halal Uyghur, Central Asian
     logo: https://kusanbazaar.com/pluto-images/funnel/images/880af640-b202-4c7f-87ab-3e1ba1de6709 (1352x264) — not cut into a tile yet
     flag: Glenn: 'Mountain View • Goods'
     flag: Operator's exact note: San Jose • Goods, Milpitas • Goods, Mountain View • Goods
     flag: Naming: the site's header, <title>, logo and story page brand the umbrella as 'Kusan Collective'; the location names are 'Kusan Uyghur Cuisine 西域小巴郎- San Jose', 'Kusan Bazaar 龟兹集市- Milpitas' and 'Kusan Bazaar 龟兹集市- Mountain View'; Instagram display name is 'Küsan'; footer copyright reads 'Slow Food Diary LLC 2026 All Rights Reserved'. name_exact uses 'Kusan Bazaar' (domain, app name, two of three locations)
     flag: Site footer disclaimer (verbatim): 'Kusan Bazaar and Kusan Uyghur Cuisine are independently owned and operated. The two businesses are not affiliated in any legal or financial capacity.' Yet one site, one Instagram, one email and one app cover all three locations, so the San Jose location may not belong under a 'Kusan Bazaar' listing
     flag: San Jose hours contradict each other on the site, so they are left null. Homepage store-hours block: Sun 10:30am-3pm & 5-9pm, Mon-Fri 10:30am-2:30pm & 5-9pm, Sat 10:30am-3pm & 5-9pm. /page/locations: Sunday 10:30 AM–9 PM, Monday–Thursday 10:30 AM–2:30 PM & 4:30–9 PM, Friday 11 AM–2:30 PM & 5–9:30 PM, Saturday 10:30 AM–9 PM
     flag: Menus and prices differ by location. The default kusanbazaar.com/menu is the San Jose menu with lower prices (French-style Roasted Lamb Chops with Salads $18.95+ vs $29.95 in Milpitas; Homemade Amine Yogurt $5.95 vs $6.95; Uyghur Roast Lamb Shank $25.99 vs $25.95; Soda $2.00 vs $2.50). Mountain View has a 'streamlined' menu with different items (Grilled Lamb Cold Noodles $18.95, Grilled Chicken Cold Noodles $21.25, Lobster Tails $39.19+, Uyghur Lamb Wraps (2 piece) $17.95, yoghurt beverages $6.50). Items above are the Milpitas menu only
     flag: Broken link: the Milpitas 'Order Now' button on /page/locations points to /menu/kusanbazaar-bcnyw1, which returns HTTP 404; the working Milpitas menu (linked from the homepage) is /menu/kusanbazaar-milpitas
     flag: SEO oddities: page titles read 'Kusan Collective | Best Chinese Food in Bay Area | Chinese Food near me' and 'Best Chinese Food in California' although the food is Uyghur/Central Asian halal; the FAQ 'What areas do you serve?' lists only San Jose neighborhoods (no Milpitas or Mountain View)
     flag: Instagram vs site contact: Instagram contact sheet shows (855) 695-8726 and order@kusancuisine.com, while the site publishes per-location phones and Kusanbazaar@gmail.com; Instagram bio address is only the San Jose one; the handle is kusanuyghurcuisine (the San Jose name) while the site's Facebook link is facebook.com/KusanBazaar. An Instagram post advertises a weekend-only 'Grilled Lamb Cold Noodles' promo at $9.95 (reg $18.95)
     flag: Possible fourth location: an Instagram 4th of July post footer lists 'MILPITAS · SAN JOSE · MOUNTAIN VIEW · SAN MATEO'; San Mateo appears nowhere on the site (not on /page/locations, story, contact or catering pages)
     flag: Site platform: own domain built on Owner.com ('Powered by Owner' in footer), ordering via the same domain plus an OrderSave app (kusanle0e.app.ordersave.com); pages load in a browser/WebFetch but curl gets a Cloudflare challenge (HTTP 403), so automated re-checks may fail
     flag: Logo: the only logo file on the site is the 'KUSAN COLLECTIVE / NEW UYGHUR FUSION' wordmark (black text on white, served as image/avif at 1352x264; append ?w=N&h=N&fit=contain for resized copies); no 'Kusan Bazaar' logo is published, and the Instagram avatar 'KÜSAN' roundel has no fetchable URL from own sources
     flag: Odd published prices: Stewed Mutton Soup $3.99+ and Flat Noodle $3.00 look like side/add-on sizes; Roasted Whole Lamb is $488.00+ and marked 'Advance booking required'; some descriptions are truncated on the site (e.g. Beef Noodle Soup ends with 'and White')
     flag: Menu sweep 2026-09-09: Prices and full item list read from the Mountain View location's own menu page, https://kusanbazaar.com/menu/kusanbazaar-txusjq. Address, phone, hours, email, and Instagram link read from the Mountain View entry on the kusanbazaar.com homepage location listing.
     flag: Menu sweep 2026-09-09: Branding is inconsistent across the site: the homepage's SEO title reads 'Kusan Collective | Best Chinese Food in Bay Area | Chinese Food near me' despite this being a Halal Uyghur restaurant; the San Jose location is separately branded 'Kusan Uyghur Cuisine' while Milpitas and Mountain View are bra
     flag: Menu sweep 2026-09-09: This is one of three locations (San Jose, Milpitas, Mountain View) sharing the kusanbazaar.com site; items and prices recorded here are for the Mountain View location's own menu page only, per the brief.
     flag: Menu sweep 2026-09-09: The Instagram handle (kusanuyghurcuisine) and contact email (Kusanbazaar@gmail.com) appear once on the shared homepage and are not confirmed to be Mountain-View-specific rather than a brand-wide contact.
     flag: Menu sweep 2026-09-09: 'Lobster Tails' and 'Stewed Mutton Soup' are priced with a '+' suffix on the menu (e.g. '$39.19+'), indicating a starting/variable price; recorded here with label 'from'.
     flag: Menu sweep 2026-09-09: No phone number, hours, or Instagram link were shown on the Mountain View menu page itself; those fields were sourced from the shared homepage's Mountain View location card instead.
  */
  'kusan-bazaar-mountain-view': {
    address: "634 N San Antonio Rd, Mountain View, CA 94043",
    phone: "(650) 215-6118",
    email: "Kusanbazaar@gmail.com",
    hours: "Daily 11am-2:30pm & 5-9pm",
    instagram: "kusanuyghurcuisine",
    cuisine: "Halal Uyghur, Central Asian",
    tagline: "Halal Uyghur Silk Road restaurant on N San Antonio Rd, Mountain View",
    sections: [
      { name: "Appetizers & Salads", items: [
        ["Samsa (2 pcs per serve)","Flour, lamb, onions, black pepper, salt and sesame",795],
        ["Uyghur Salad","Tomato, onion, green pepper, coriander, dry red pepper, salt, sesame oil, vinegar",799],
        ["Cucumber Salad With Yogurt","Cucumber, yogurt, lemon juice, black pepper",799],
        ["Eggplant With Mashed Garlic","Eggplant, garlic, cilantro, dry red pepper, salt, sesame oil, prickly pepper oil, chili oil, garlic water",899],
        ["Black Fungus Salad","Black fungus, goji berries, onion, garlic, cilantro, soy sauce, chili oil, sesame oil, vinegar",799],
        ["Cold Chili Chicken","Chicken, onion, cilantro, dry red pepper, salt, sesame oil, chili oil, prickly pepper oil",950],
        ["Sliced Beef With Sauce","Sliced beef, green onion, cilantro, dry red pepper, salt, sesame oil, chili oil, prickly pepper oil",1095],
      ] },
      { name: "Silk Road Grilled", items: [
        ["Lamb Kebab (2 Skewers)","Lamb, cumin and chili powder",995],
        ["Chicken Kebab (2 Skewers)","Chicken, cumin and chili powder",895],
        ["Wellington-Style Roasted Lamb Shank","Lamb shank, onion, bread, cumin and chili powder",2895],
        ["Golden Crispy Roasted Lamb Rib","Lamb rib, onion, home-made BBQ powder",2495],
        ["Uyghur Roast Lamb Shank","Lamb shank, onion, fennel seeds, Sichuan peppercorn, cumin, white pepper, bay leaves, cinnamon, star anise, black cardamom, angelica root, nutmeg, salt",2595],
        ["French-Style Roasted Lamb Chops with Salads","Lamb chops, cumin, chili powder and Italian seasoning",2995],
        ["Silk Road Garlic-Roasted Whole Fish","Freshwater catfish, garlic, BBQ powder (contains bones)",3355],
        ["Lobster Tails, Garlic-Baked, Wild North Atlantic Cold-Water","",3919,null,"from"],
        ["Slow-Roasted Beef Rib","",2906],
        ["Grilled Garlic Naan Bread","Naan bread, cumin and chili powder",250],
      ] },
      { name: "Signature Pilaf Set", items: [
        ["Braised Beef Cubes Pilaf","Rice, carrot, green onion, cotton oil, quail eggs, shredded lamb and beef, served with Uyghur salad or yogurt",2095],
        ["Braised Lamb Rib Pilaf","",2295],
        ["6-Hour Braised Lamb Shank Pilaf","",2795],
        ["Pilaf with Garlic-Baked North Atlantic Cold-Water Lobster Tail","",2699],
      ] },
      { name: "Noodles, Dumplings & Wraps", items: [
        ["Lamb Broth with Handcraft Mini Wontons","Handmade mini wontons, lamb, goji berries, green onion, cilantro, chili oil, white radish",1895],
        ["Handcrafted Dumplings-Beef with Celery","Beef, celery, flour, seasoning",1695],
        ["Uyghur Lamb Wraps (2 piece)","Lamb, tomato, onion, green pepper, home-made yogurt wrapped with naan",1795],
        ["Uyghur Chicken Wraps (2 piece)","Chicken, tomato, onion, green pepper, home-made yogurt wrapped with naan",1695],
      ] },
      { name: "Soup and Stew", items: [
        ["Stewed Mutton Soup","Lamb, goji berries, white radish, salt",399,null,"from"],
        ["Braised Lamb Ribs","Lamb rib, white pepper, salt",2295],
      ] },
      { name: "Drinks", items: [
        ["Honey Yuzu Flavor Yoghurt Beverage","",650],
        ["Passion Fruit Flavor Yoghurt Beverage","",650],
        ["Honey Lemon Flavor Yoghurt Beverage","",650],
        ["Blueberry Flavor Yoghurt Beverage","",650],
        ["Mango Flavor Yoghurt Beverage","",650],
        ["Strawberry Flavor Yoghurt Beverage","",650],
        ["Uyghur Special Milk Tea","Milk, black tea, butter, cream and salt (hot)",595],
        ["Honey Lemon Tea","Black tea, honey and lemon (hot or cold)",450],
        ["Soda","Choose Coke, Diet Coke or Sprite",250],
      ] },
      { name: "Dessert", items: [
        ["Homemade Amine Yogurt","Home-made yogurt, almond and honey",695],
        ["Yogourt Presse Cone with Fig Jam","Home-made yogurt cheese, fig jam, cone, dry rose",895],
        ["Baklava","Layers of filo filled with chopped nuts and honey",495],
      ] },
    ],
    siteNote: "Prices and full item list read from the Mountain View location's own menu page, https://kusanbazaar.com/menu/kusanbazaar-txusjq. Address, phone, hours, email, and Instagram link read from the Mountain View entry on the kusanbazaar.com homepage location listing.",
  },

  /*
     Kusan Uyghur Cuisine — gathered 2026-09-09 from own-domain
     they are: Halal Uyghur, Central Asian
     logo: https://kusanbazaar.com/pluto-images/funnel/images/880af640-b202-4c7f-87ab-3e1ba1de6709 (1352x264) — not cut into a tile yet
     flag: Glenn: 'San Jose • Goods'
     flag: their own footer says Kusan Bazaar and Kusan Uyghur Cuisine are independently owned and not affiliated, though one site, one Instagram and one email cover all three; seated under the name the site gives this shop
     flag: Operator's exact note: San Jose • Goods, Milpitas • Goods, Mountain View • Goods
     flag: Naming: the site's header, <title>, logo and story page brand the umbrella as 'Kusan Collective'; the location names are 'Kusan Uyghur Cuisine 西域小巴郎- San Jose', 'Kusan Bazaar 龟兹集市- Milpitas' and 'Kusan Bazaar 龟兹集市- Mountain View'; Instagram display name is 'Küsan'; footer copyright reads 'Slow Food Diary LLC 2026 All Rights Reserved'. name_exact uses 'Kusan Bazaar' (domain, app name, two of three locations)
     flag: Site footer disclaimer (verbatim): 'Kusan Bazaar and Kusan Uyghur Cuisine are independently owned and operated. The two businesses are not affiliated in any legal or financial capacity.' Yet one site, one Instagram, one email and one app cover all three locations, so the San Jose location may not belong under a 'Kusan Bazaar' listing
     flag: San Jose hours contradict each other on the site, so they are left null. Homepage store-hours block: Sun 10:30am-3pm & 5-9pm, Mon-Fri 10:30am-2:30pm & 5-9pm, Sat 10:30am-3pm & 5-9pm. /page/locations: Sunday 10:30 AM–9 PM, Monday–Thursday 10:30 AM–2:30 PM & 4:30–9 PM, Friday 11 AM–2:30 PM & 5–9:30 PM, Saturday 10:30 AM–9 PM
     flag: Menus and prices differ by location. The default kusanbazaar.com/menu is the San Jose menu with lower prices (French-style Roasted Lamb Chops with Salads $18.95+ vs $29.95 in Milpitas; Homemade Amine Yogurt $5.95 vs $6.95; Uyghur Roast Lamb Shank $25.99 vs $25.95; Soda $2.00 vs $2.50). Mountain View has a 'streamlined' menu with different items (Grilled Lamb Cold Noodles $18.95, Grilled Chicken Cold Noodles $21.25, Lobster Tails $39.19+, Uyghur Lamb Wraps (2 piece) $17.95, yoghurt beverages $6.50). Items above are the Milpitas menu only
     flag: Broken link: the Milpitas 'Order Now' button on /page/locations points to /menu/kusanbazaar-bcnyw1, which returns HTTP 404; the working Milpitas menu (linked from the homepage) is /menu/kusanbazaar-milpitas
     flag: SEO oddities: page titles read 'Kusan Collective | Best Chinese Food in Bay Area | Chinese Food near me' and 'Best Chinese Food in California' although the food is Uyghur/Central Asian halal; the FAQ 'What areas do you serve?' lists only San Jose neighborhoods (no Milpitas or Mountain View)
     flag: Instagram vs site contact: Instagram contact sheet shows (855) 695-8726 and order@kusancuisine.com, while the site publishes per-location phones and Kusanbazaar@gmail.com; Instagram bio address is only the San Jose one; the handle is kusanuyghurcuisine (the San Jose name) while the site's Facebook link is facebook.com/KusanBazaar. An Instagram post advertises a weekend-only 'Grilled Lamb Cold Noodles' promo at $9.95 (reg $18.95)
     flag: Possible fourth location: an Instagram 4th of July post footer lists 'MILPITAS · SAN JOSE · MOUNTAIN VIEW · SAN MATEO'; San Mateo appears nowhere on the site (not on /page/locations, story, contact or catering pages)
     flag: Site platform: own domain built on Owner.com ('Powered by Owner' in footer), ordering via the same domain plus an OrderSave app (kusanle0e.app.ordersave.com); pages load in a browser/WebFetch but curl gets a Cloudflare challenge (HTTP 403), so automated re-checks may fail
     flag: Logo: the only logo file on the site is the 'KUSAN COLLECTIVE / NEW UYGHUR FUSION' wordmark (black text on white, served as image/avif at 1352x264; append ?w=N&h=N&fit=contain for resized copies); no 'Kusan Bazaar' logo is published, and the Instagram avatar 'KÜSAN' roundel has no fetchable URL from own sources
     flag: Odd published prices: Stewed Mutton Soup $3.99+ and Flat Noodle $3.00 look like side/add-on sizes; Roasted Whole Lamb is $488.00+ and marked 'Advance booking required'; some descriptions are truncated on the site (e.g. Beef Noodle Soup ends with 'and White')
     flag: Menu sweep 2026-09-09: Prices captured from the San Jose location's own order/menu page at https://kusanbazaar.com/menu/kusanuyghurcuisine-ggis5e (the San Jose-specific link found on https://kusanbazaar.com/page/locations), which itself displays the 1516 N 4th St, San Jose, CA address; the same prices also appear on the site's general https://kusanbazaar.com/menu page.
     flag: Menu sweep 2026-09-09: Multi-location business: kusanbazaar.com also lists Milpitas (510 Barber Ln, order page kusanbazaar-bcnyw1) and Mountain View (634 N San Antonio Rd, order page kusanbazaar-txusjq) locations with their own order pages/pricing; only the San Jose (N 4th St) location, order page kusanuyghurcuisine-ggis5
     flag: Menu sweep 2026-09-09: Location-specific branding: the San Jose order page URL slug and displayed name use 'Kusan Uyghur Cuisine', while Milpitas and Mountain View order pages use 'Kusan Bazaar'; the overall site/company brand is presented as 'Kusan Collective'.
     flag: Menu sweep 2026-09-09: Hours contradiction: the homepage states approximate hours (lunch 10:30am-2:30pm, dinner 5-9pm on weekdays), while the dedicated Locations page gives more detailed San Jose-specific hours (Mon-Thu dinner starts 4:30pm not 5pm; Friday lunch starts 11am not 10:30am; Sunday 10:30am-9pm continuous). Bec
     flag: Menu sweep 2026-09-09: Three items show a '+' after the listed price on the San Jose menu page (French-style Roasted Lamb Chops with Salads $18.95+, Stewed Mutton Soup $3.99+, Big Plate Chicken $24.95+), indicating a starting/base price with additional size or add-on options; the page text did not itemize the specific upc
     flag: Menu sweep 2026-09-09: No Instagram or other social media links were found on the homepage or in its footer.
     flag: Menu sweep 2026-09-09: Logo image is a small 64x64 icon-style graphic rather than a full wordmark; may be a favicon rather than the primary brand logo.
     flag: Menu sweep 2026-09-09: Menu item Chinese-language translations shown alongside English names on the page were omitted from name/desc fields for clarity; only the English item names were captured.
  */
  'kusan-uyghur-cuisine-san-jose': {
    address: "1516 N 4th St, San Jose, CA 95112",
    phone: "(650) 899-0210",
    email: "Kusanbazaar@gmail.com",
    instagram: "kusanuyghurcuisine",
    cuisine: "Halal Uyghur, Central Asian",
    tagline: "Halal Uyghur Silk Road kitchen on N 4th St in San Jose",
    sections: [
      { name: "Appetizers & Salads", items: [
        ["Samsa (2 piece per serve)","",795],
        ["Uyghur Salad","",799],
        ["Cucumber Salad With Yogurt","",799],
        ["Eggplant With Mashed Garlic","",899],
        ["Black Fungus Salads","",799],
        ["Cold Chili Chicken","",950],
        ["Sliced Beef With Sauce","",1095],
      ] },
      { name: "Grilled", items: [
        ["Lamb Kebab (2 Skewers)","",995],
        ["Chicken Kebab (2 Skewers)","",895],
        ["Golden Crispy Roasted Lamb Rib","",2495],
        ["Uyghur Roast Lamb Shank","",2599],
        ["Grilled Naan","",250],
        ["French-style Roasted Lamb Chops with Salads","",1895,null,"from"],
      ] },
      { name: "Soup & Stew", items: [
        ["Stewed Mutton Soup","",399,null,"from"],
        ["Braised Lamb Shank with Naan","",2495],
        ["Braised Lamb Ribs","",2295],
      ] },
      { name: "Main Dish", items: [
        ["Big Plate Chicken","",2495,null,"from"],
        ["Flat Noodle","",300],
        ["Laghman","",1995],
        ["Polo (Served with Yogurt & Uyghur Salads)","",1895],
        ["Beef Noodles Soup","",1695],
        ["Lamb Noodles Soup","",1695],
        ["Lamb Cumin Chao-mian","",1895],
        ["Uyghur Lamb Wraps","",1695],
        ["Uyghur Chicken Wraps","",1595],
        ["Handcrafted Dumplings - Beef with Celery (10 Piece)","",1595],
      ] },
      { name: "Dessert", items: [
        ["Homemade Amine Yogurt","",595],
        ["Baklava","",495],
      ] },
      { name: "Drinks", items: [
        ["Uyghur Special Milk Tea","",595],
        ["Dogap Yoghurt Beverage (Sour)","",695],
        ["Honey Yuzu Flavor Yoghurt Beverage","",695],
        ["Passion Fruit Flavor Yoghurt Beverage","",695],
        ["Honey Lemon Flavor Yoghurt Beverage","",695],
        ["Honey Lemon Tea","",450],
        ["Soda","",200],
      ] },
    ],
    siteNote: "Prices captured from the San Jose location's own order/menu page at https://kusanbazaar.com/menu/kusanuyghurcuisine-ggis5e (the San Jose-specific link found on https://kusanbazaar.com/page/locations), which itself displays the 1516 N 4th St, San Jose, CA address; the same prices also appear on the site's general https://kusanbazaar.com/menu page.",
  },

  /*
     Lavanta — gathered 2026-09-09 from own-domain
  */
  'lavanta': {
    photos: [
      {"src":"/food/lavanta-site-0-lg.webp","alt":"DSC03210.jpg","credit":"Their own photo, from eatlavanta.com"},
      {"src":"/food/lavanta-site-2-lg.webp","alt":"DSC03048.jpg","credit":"Their own photo, from eatlavanta.com"},
      {"src":"/food/lavanta-site-3-lg.webp","alt":"DSC03029.jpg","credit":"Their own photo, from eatlavanta.com"},
      {"src":"/food/lavanta-site-4-lg.webp","alt":"DSC02956.jpg","credit":"Their own photo, from eatlavanta.com"},
    ],
  },

  /*
     Love Burn Hot Chicken — gathered 2026-09-09 from stopgap
     they are: Nashville hot chicken
     flag: all facts from their Instagram bio; Toast blocks reading the menu
     flag: bio says 'Portola 26' and 'Cluck around and find out'
     flag: menu: 34 items read from https://order.toasttab.com/online/love-burn-521a-3rd-street on 2026-09-05
  */
  'love-burn': {
    address: "521A 3rd St, San Francisco, CA",
    hours: "Mon-Fri 11:30am-7pm, closed Sat-Sun",
    instagram: "loveburnchicken",
    cuisine: "Nashville hot chicken",
    needsSite: true,
    tagline: "Nashville-inspired hot chicken on 3rd Street, four spice levels",
    sections: [
      { name: "Hot Fried Chicken", items: [
        ["Hot Tenders and Fries","Three massive chicken tenders (breast), choice of spice level, fries, and choice of sauce ****Level 4 Disclaimer: Consume at your discretion",1700,"love-burn-hot-tenders-and-fries"],
        ["Six Hot Wings","Six Large Hot Wings with choice of a spice level, choice of sauce, and side of pickles ****Level 4 Disclaimer: Consume at your discretion",1400,"love-burn-six-hot-wings"],
        ["Twelve Hot Wings","Twelve large hot wings with choice of two different spice levels, choice of two sauces, and side of pickles ****Level 4 Disclaimer: Consume at your discretion",2600,"love-burn-twelve-hot-wings"],
        ["Hot Quarter Meal (Thigh & Drum)","Crispy Fried Chicken Leg Quarter, Buttered Texas Toast & Pickles ***Levels 2-4 gets mixed pickles (cucumbers, jalapeños",1600,"love-burn-hot-quarter-meal-thigh-drum"],
      ] },
      { name: "Smash Burger and Hot Sandwiches", items: [
        ["Double Smash Burger","Two beef patties, American cheese, house sauce, caramelized onions, and pickles on a toasted brioche bun. Vegan option available",1500,"love-burn-double-smash-burger"],
        ["Korean Fried Chicken Sandwich","Crispy Korean glazed chicken, kimchi slaw, and pickles on brioche bun",1500,"love-burn-korean-fried-chicken-sandwich"],
        ["Fish Filet Sandwich","Crispy fish patty, American cheese, bread and butter pickles, tartar sauce on a brioche bun",1200,"love-burn-fish-filet-sandwich"],
        ["BBQ Pork Sandwich","Pulled pork with Asian BBQ sauce, kimchee slaw, and pickles on brioche",1500,"love-burn-bbq-pork-sandwich"],
      ] },
      { name: "Salads", items: [
        ["Mixed Green Salad","Mixed greens with herbed croutons, cherry tomatoes, English cucumber, shredded carrots, balsamic vinaigrette",1200,"love-burn-mixed-green-salad"],
      ] },
      { name: "Weekly Specials", items: [
        ["Wing Wednesday 6pc","",1400,"love-burn-wing-wednesday-6pc"],
        ["Wing Wednesday 12pc","",2600,"love-burn-wing-wednesday-12pc"],
      ] },
      { name: "Specials and sides", items: [
        ["Fish Filet Fridays","Fish Filet Friday Special",1000,"love-burn-fish-filet-fridays"],
        ["KFC 6pc Wings","",1500,"love-burn-kfc-6pc-wings"],
        ["Bomba special","",1800],
        ["French Fries","Crispy Coated French Fries",600,"love-burn-french-fries"],
        ["Creamy Coleslaw","Cabbage, Carrots, Apple Cider Vinegar, Dijon Mustard, Garlic, Onion, Sugar, Mayo, and Celery Seed",600,"love-burn-creamy-coleslaw"],
        ["Potato Salad","Potatoes, Mayonnaise, Celery, Sweet Pickle Relish, Mustard, Onion, and Red Bell Pepper",600,"love-burn-potato-salad"],
        ["Macaroni Salad","Elbow noodles, red and green bell peppers, red onions, scallion, celery, egg, and mayo",600,"love-burn-macaroni-salad"],
      ] },
      { name: "Sauces", items: [
        ["Mike's Hot Honey","A blend of honey, chilies, and vinegar",200,"love-burn-mike-s-hot-honey"],
        ["Sweet Baby Ray's BBQ Sauce","A sweet and smoky barbecue sauce typically featuring a rich blend of molasses, brown sugar, and spices",100,"love-burn-sweet-baby-ray-s-bbq-sauce"],
        ["Chipotle Aioli","House made chipotle aioli: mayo, garlic, lemon juice, chipotle powder, salt and pepper",100,"love-burn-chipotle-aioli"],
        ["Hot Ranch","Not for the faint of heart. Hot House made ranch: Habanero, Buttermilk, Mayo, and Spice Blend",100,"love-burn-hot-ranch"],
        ["Cool Ranch","House made ranch: buttermilk, mayo, and spice blend",100,"love-burn-cool-ranch"],
        ["Crystal Hot Sauce","Red Cayenne Peppers, Distilled White Vinegar, and Salt",100,"love-burn-crystal-hot-sauce"],
        ["House","",100,"love-burn-house"],
        ["Habanero","",100,"love-burn-habanero"],
        ["Ube Mochi Cake","Hawaiian inspired mochi butter cake made with ube (purple sweet potato)",400,"love-burn-ube-mochi-cake"],
        ["Strawberry Mochi Cake","",400,"love-burn-strawberry-mochi-cake"],
      ] },
      { name: "Drinks", items: [
        ["Diet Coke","A crisp, refreshing taste you know and love with zero calories",200],
        ["Sprite","The cold, refreshing flavors of lemon and lime, perfectly blended",200],
        ["Horizon Organic Milk","Horizon Organic Milk is a certified organic milk, offering a naturally sourced and refreshing dairy beverage",200],
        ["Sparkling Water","Lightly carbonated water with a crisp, refreshing taste",400],
        ["Coke","The cold, refreshing, sparkling classic that America loves",200],
      ] },
      { name: "Menu", items: [
        ["Mini Churros with Caramel Sauce","Five mini churros rolled in cinnamon sugar and a side of house made caramel sauce",800,"love-burn-mini-churros-with-caramel-sauce"],
      ] },
    ],
    siteNote: "Prices and photos are from their own Toast ordering page.",
  },

  /*
     Lucky Three Seven — gathered 2026-09-09 from own-domain
     they are: Filipino
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: Starting point was only a GoFundMe link, which is not a valid fact source; one WebSearch call located an apparent own domain (luckythreeseven.com) and a NetWaiter ordering-platform page (luckythreeseven.netwaiter.com), both matching the business's address and phone.
     flag: luckythreeseven.com footer copyright reads 'Lucky 777 LLC', supporting that this domain belongs to the business despite the mismatched order-online link found on it.
     flag: luckythreeseven.com's 'Order Online' button links to https://order.online/store/chopped-nyc-ann-arbor-27977264/ which is an unrelated storefront (not Lucky Three Seven, not in Oakland) -- the link appears broken or misconfigured.
     flag: No menu prices were found on either the own-domain site or the NetWaiter ordering-platform page; /menu (tried on both sites) and /order (tried on NetWaiter) all returned 404, so no priced menu could be located within the tool budget.
     flag: luckythreeseven.com states payment is cash or Venmo/Zelle only, no credit cards accepted.
     flag: No Instagram link found on either of the business's own pages (a separate Facebook page exists per search results but was not used as a source).
     flag: No second location mentioned anywhere in the sources checked.
     flag: Hours were stated only on the NetWaiter page; the own-domain homepage did not list hours at all, so there is no direct contradiction, but the schedule is sourced from a single page.
  */
  'lucky-three-seven': {
    address: "2868 Fruitvale Ave, Oakland, CA 94602",
    phone: "(510) 866-2023",
    hours: "Sun, Wed–Sat 11:00 AM–7:00 PM; closed Mon–Tue",
    cuisine: "Filipino",
    tagline: "Filipino restaurant in Oakland serving comfort food and wings",
    contactOnly: "Filipino restaurant in Oakland serving comfort food and wings. No priced menu could be found: luckythreeseven.com (their own domain) names only 3 sample dishes with no prices and its 'Order Online' button links to an unrelated business's order.online storefront; luckythreeseven.netwaiter.com (their NetWaiter ordering-platform page) lists restaurant info and hours but no menu or prices; /menu paths on both sites and /order on the NetWaiter site returned 404.",
  },

  /*
     Lush Spaw — gathered 2026-09-09 from own-domain
     they are: Pet grooming
     flag: Glenn: 'Three locations above' — the three addresses in their bio
     flag: the site's story ring is Instagram's; the icon is the white disc inside it
  */
  'lush-spaw': {
    address: "700 S Winchester Blvd #60, San Jose, CA; 2604 Union Ave, San Jose, CA; 2434 El Camino Real, Santa Clara, CA",
    phone: "(833) 279-5874",
    instagram: "lushspaw",
    cuisine: "Pet grooming",
    tagline: "Dog and cat grooming, three shops in San Jose and Santa Clara",
    groups: [
      { name: "Prices, from", items: [
        ["Lush Bath, short hair","Massage bath and condition, blueberry facial, blowout and brush out, nail trim and grind, ear cleaning, teeth brushing, fluff and puff. By weight, up to 20 lbs to 101 lbs and up.",5000,"from $50"],
        ["Lush Bath, long hair","The same bath for long-haired breeds. By weight.",5500,"from $55"],
        ["Lush Groom","Haircut and style with everything in the Lush Bath. By weight.",8500,"from $85"],
        ["Lush Groom, poodle, doodle and special breeds","Their own pricing category. By weight.",11000,"from $110"],
        ["Cat Bath","",11000],
        ["Cat Groom","",16000],
        ["Nail trim and grind","",2000],
        ["Pawdicure","",4500],
        ["Teeth brushing","",1000],
        ["Ear cleaning and plucking","",1000],
      ] },
    ],
    quoteOnly: "Dog and cat grooming, three shops in San Jose and Santa Clara. By weight and coat type, from their own dog and cat price pages; a $4 material fee is added to every groom and bath, and first visits are 20% off, per their site.",
  },

  /*
     Mac’s Old House — gathered 2026-09-09 from ordering-platform — BLOCKED: Squarespace subscription expired — no business content is published anywhere on the domain
     they are: American steakhouse
     flag: the entire domain serves Squarespace's 'Website Expired' page — /, /menu, /sitemap.xml, www and bare, both user agents
     flag: Menu sweep 2026-09-09: Prices captured from https://macsoldhouse.netwaiter.com/antioch/menu/, a single-business NetWaiter-hosted menu page (the business's own domain macsoldhouse.com is expired/inaccessible); that page credits the listing to a third-party service ('Locu') and the prices (e.g. $6.95 prime rib dinner specials, $1-$1.50 cocktails) read as a legacy/outdated menu rather than current pricing.
     flag: Menu sweep 2026-09-09: Business's own domain https://www.macsoldhouse.com/ returns HTTP 404 and, when opened in a browser, shows a Squarespace 'Website Expired' page — the primary site is inactive; all data here came from the business's NetWaiter-hosted page (macsoldhouse.netwaiter.com/antioch) instead.
     flag: Menu sweep 2026-09-09: That NetWaiter page states 'Online Ordering Not Available' and attributes its menu content to 'Locu', a third-party restaurant-data service that shut down years ago; prices appear stale/historical rather than current.
     flag: Menu sweep 2026-09-09: Contradiction: Manhattan cocktail is priced at $1.00 under the 'New York Thursday' drink specials but $1.50 under the general 'Drinks' section on the same page.
     flag: Menu sweep 2026-09-09: Two extraction passes of the same menu page disagreed on the Cajun Tuesday items — one pass listed Prime Rib, Chicken, and Trout (each $6.95, 'spicy and blackened' style) as three items; a second pass split out 'Spicy and Blackened' as its own $6.95 line and dropped Trout. The three-item version (Pr
     flag: Menu sweep 2026-09-09: First-pass summaries showed the 'Cajun Tuesday' and 'Seafood Wednesday' complete-dinner prices with a trailing '+' (e.g. '$6.95+'), suggesting these may be starting/upgradeable prices; a later line-item pass showed flat prices with no '+'. Treated as 'from' pricing (label: "from") but this is not fu
     flag: Menu sweep 2026-09-09: No appetizer, dessert, or standard (non-daily-special) full-price steak/prime rib dinner items were found in the captured content — plausibly an incomplete legacy menu capture rather than the restaurant's full historical offering.
     flag: Menu sweep 2026-09-09: No email address, Instagram, or other social media link was found on any page checked.
     flag: Menu sweep 2026-09-09: No logo image was found on any page checked.
     flag: Menu sweep 2026-09-09: Per public news reporting (Antioch Herald, not the business's own site — used only for background context, not as a source for any field above), Mac's Old House reportedly closed permanently on June 22, 2025 after 42 years under prior ownership, with new owners reportedly planning to reopen in 2026;
     flag: Menu sweep 2026-09-09: Only one physical location found; no evidence of a second location.
     flag: Menu sweep 2026-09-09: macsoldhouse.com is expired; the NetWaiter menu credits Locu, a listing service that no longer exists; outside reporting says the restaurant closed in June 2025 — not printed on the page, since it is not their own statement, but his to check
  */
  'macs-old-house': {
    address: "3100 E 18th St, Antioch, CA 94509",
    phone: "(925) 757-9908",
    hours: "Mon-Sun 4:00pm-10:00pm",
    cuisine: "American steakhouse",
    contactOnly: "Their own domain has expired and the only menu online is a NetWaiter page crediting a defunct listing service, so its prices are not carried; outside reporting says the restaurant closed in June 2025, which is his to confirm.",
  },

  /*
     Macstalgia — gathered 2026-09-09 from own-domain
     their spelling: "macstalgia" (roster keeps "Macstalgia")
     they are: Framed vinyl art
     logo: https://www.macstalgia.com/cdn/shop/files/hf_20260818_045451_57f574dd-1324-49a6-875d-f07cf87148a1.png?v=1787029208 (2048x2048) — not cut into a tile yet
     flag: the homepage is largely unedited Shopify template copy: 'Tell your brand's story through images', 'Button label', '90% noticed that this product has significantly improved their life'
     flag: no contact information at all — a form only; no about page, no social links
     flag: '90 Day Quality Guarantee' and 'Priority Insured Shipping' are sold as $5.99 add-on products
  */
  'macstalgia': {
    cuisine: "Framed vinyl art",
    items: [
      ["Fleetwood Mac Vinyl Frame","",5999],
      ["Sade Vinyl Frame","",5999],
      ["Marvin Gaye Vinyl Frame","",5999],
      ["9 Vinyl Discs","",999],
    ],
    siteNote: "Every frame is $59.99 against a $119.99 compare-at under a site-wide 'WELCOME! 50% OFF TODAY!' banner.",
  },

  /*
     Majestic Boutique — gathered 2026-09-09 from own-domain
     they are: Clothing boutique
     logo: https://cdn.shopify.com/s/files/1/0830/2867/2801/files/ACFD4D10-99B9-480D-8A07-946839C78FD5.jpg?v=1696398367 (915x731) — not cut into a tile yet
     flag: the Instagram link is malformed — a full URL pasted into a handle field — and produces a broken link; the intended handle was recovered from inside it
     flag: a visible Shopify theme placeholder remains in the header: 'Featured Text — A great place to share about a sale!'
     flag: second stockist: The Red Door Gift Shop, 50 Eagle Rock Way, Suite D, Brentwood; no ZIP published for either; their contact policy gives only 'Antioch CA 94509'
     flag: the contact email is on a different domain (majesticthreadsboutique.org) from the site
     flag: 'Popup schedule' is listed as a $0.00 product
  */
  'majestic-boutique': {
    address: "161 Chestnut Street, Brentwood, CA",
    email: "carla@majesticthreadsboutique.org",
    instagram: "majestic_boutique_llc",
    cuisine: "Clothing boutique",
    items: [
      ["Halter Crop Top and High-Waisted Leggings Set","",7000],
      ["Zenana Ribbed Knit Button-Down Sweater Vest","",3200],
      ["Zenana Wool Blend Striped Sweater","",3200],
      ["Zenana Washed French Terry Sweatpants","",3800],
      ["Risen Raw Hem Slouchy Seamed Jorts","",6200],
      ["Zenana American Flag Embroidered Ribbed Tank","",2500],
      ["Dusk Blue Western Embroidery Denim Shorts","",4500],
    ],
    siteNote: "A Shopify store with 250-plus priced products; the address is a Brentwood shop that stocks them, not a storefront of their own.",
  },

  /*
     Marina Bay Media — gathered 2026-09-09 from own-domain
     they are: Marketing agency
     logo: https://www.marinabaymedia.com/20260610-marina-bay-media-logo-large.png (500x150) — not cut into a tile yet
     flag: Contact page is empty — a 'Contact' heading with no form, email or phone; the homepage says 'Contact us' with no channel other than Instagram
     flag: og:image and RSS link point to https://example.com/ with an Astro template placeholder — unconfigured site URL
     flag: no address, phone or email anywhere on the site; team listed by first names only
  */
  'marina-bay-media': {
    instagram: "marinabaymedia",
    cuisine: "Marketing agency",
  },

  /*
     Maymay’s Cravings — gathered 2026-09-09 from ordering-platform
     their spelling: "Maymay’s Cravings Asian Snack bar" (roster keeps "Maymay’s Cravings")
     they are: Filipino desserts
     logo: https://static.wixstatic.com/media/3dff99_43ebae768a2549c4bcfd66a3701a4d0f~mv2.jpg/v1/fill/w_264,h_264,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/3dff99_43ebae768a2549c4bcfd66a3701a4d0f~mv2.jpg (264) — not cut into a tile yet
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: Own-domain site found at maymayscravings.com (Wix) in addition to the order.online/DoorDash storefront. Its homepage is otherwise a near-empty template (browser title reads 'Refund Policy | Maymay's Cravings'; only visible text is 'Welcome to Maymay's Cravings') with no address, phone, or hours listed, and its footer social icons are unconfigured Wix placeholders (facebook.com/wix, instagram.com/wix, x.com/wix, tiktok.com/@wix) rather than the business's real profiles.
     flag: That same own-domain homepage does embed one image of the business's actual printed menu board, which shows a logo and a real handle '@MAYMAYSCRAVINGS' next to the Instagram/Facebook icons (used here as the instagram field) — this is a different, more credible source for the handle than the placeholder footer icons on the same site.
     flag: Price discrepancy between the two of the business's own pages: the printed menu board on maymayscravings.com shows lower prices than order.online for overlapping items, e.g. Mango Sago $9 vs $11, Buko Pandan $9 vs $11, Ube Sago $9 vs $11, Taho $8 vs $10, Tofu Pudding with Coconut Milk & Sago $10 vs $14, Creamy Tofu Pudding w/ Coconut Milk & Taro Balls $12 vs $15, Iced Taro Balls & Milk $11 vs $14, Iced Taro Balls w/ Boba Sago Grass Jelly & Red Bean $14 vs $17, same +Taro Paste $15 vs $18, Filipino Congee 'Lugaw' $7 vs $10 (as 'Filipino Congee (Lugaw) with Egg'). Likely reflects standard in-store-vs-delivery-platform markup. items[] uses the order.online prices per the sourcing instructions; not treated as a hours-style contradiction requiring nulling since it is a pricing difference, not a factual disagreement about a single fixed fact.
     flag: The printed menu board also lists items/sections with no equivalent on order.online at all: a Signature Drinks list (Corn Latte, Ube Latte, Strawberry Latte, Mango Coconut, Matcha Coconut Water, each $6-$7.50), Pork Sinigang $18, a Bingsu category (Small $14 / Large $21, in Mango Cheesecake, Strawberry Cheesecake, Matcha Red Bean w/ Matcha Mochi Jelly, and Oreos & Brownies flavors), and Mango Sticky Rice Dessert / Mango Sticky Rice Drink at $10 each. These were not merged into items[] to avoid combining two disagreeing source menus.
     flag: order.online's storeHeader describes the business as a 'Virtual Brand' with businessTags Filipino / Casual Dining / Fast Casual.
     flag: Phone (408) 565-5287 and the street/city address fields were read from the ordering page's embedded structured order data, not from visibly rendered page text (no visible phone number or tel: link was found in the rendered page); the address string used here ('1349 Locust, Walnut Creek CA 94596-4511, United States') is the one visibly printed in the page's store-info banner.
     flag: order.online shows two slightly different hour sets on the same page: the store's actual operating hours (used for the hours field here) and a several-minutes-shorter 'hours this store accepts DoorDash orders' cutoff each day — treated as complementary, not a contradiction.
     flag: No email address found printed on either page (a DoorDash support-routing contact email exists only base64-encoded inside a Terms-of-Service link parameter, not displayed as page content, so it was not used).
     flag: No second location found.
     flag: Menu sweep 2026-09-09: 56 prices read from order.online were set aside because their own site's menu-board photo shows lower prices for the same items — a delivery mark-up, not the kitchen's price
  */
  'maymays-cravings': {
    address: "1349 Locust, Walnut Creek CA 94596-4511, United States",
    phone: "(408) 565-5287",
    hours: "Mon-Tue 12pm-7:30pm, Wed-Sat 12pm-9pm, Sun 12pm-7:30pm",
    instagram: "maymayscravings",
    cuisine: "Filipino desserts",
    tagline: "Filipino snack bar serving sago desserts, onigiri, and drinks",
    contactOnly: "Filipino snack bar serving sago desserts, onigiri, and drinks. Their order.online storefront prints prices that run higher than the menu board on their own site (Mango Sago $11 against $9), the mark-up a delivery platform adds, so neither set is carried until they publish one list.",
  },

  /*
     Meadowlark Dairy — gathered 2026-09-09 from own-domain
     they are: Soft-serve dairy
     logo: https://www.meadowlarkdairy.com/cdn/shop/files/Untitled_design_18_256x.png?v=1762378449 (256x256) — not cut into a tile yet
     flag: second location: 2287 Second Street, Livermore 94550, (925) 846-8777, with its own Instagram @meadowlarkdairylivermore
     flag: the logo's HTML claims 1563x1563 but the served file is 256x256
  */
  'meadowlark-dairy': {
    address: "57 W. Neal Street, Pleasanton, CA 94566",
    phone: "(925) 846-2261",
    email: "orders@meadowlarkdairy.com",
    hours: "Daily 8am-9pm",
    instagram: "meadowlarkdairy",
    cuisine: "Soft-serve dairy",
    photos: [
      {"src":"/food/meadowlark-dairy-site-1-lg.webp","alt":"","credit":"Their own photo, from meadowlarkdairy.com"},
      {"src":"/food/meadowlark-dairy-site-4-lg.webp","alt":"","credit":"Their own photo, from meadowlarkdairy.com"},
      {"src":"/food/meadowlark-dairy-site-6-lg.webp","alt":"","credit":"Their own photo, from meadowlarkdairy.com"},
    ],
    items: [
      ["Frosty Token","Each token is good for any size frosty, slushie or diablo",375],
    ],
    siteNote: "The soft-serve menu itself is not priced online; their store sells tokens, hats and a $500 name-your-own-flavour-day certificate, and the flavour of the day is posted on Instagram.",
  },

  /*
     Midnite Theories — gathered 2026-09-09 from own-domain
     they are: Skate shop
     logo: https://www.midnitetheories.com/cdn/shop/files/hoodie_font_sticker.jpg?v=1730508016 (1050x600) — not cut into a tile yet
     flag: the shop spells itself 'Midnite'; the directory id spells it 'midnight'
     flag: no phone, no hours and no social links published anywhere
  */
  'midnight-theories': {
    address: "1215 Polk Street, San Francisco, CA 94109",
    email: "midnitetheories@gmail.com",
    cuisine: "Skate shop",
    items: [
      ["Midnite Theories Sticker Pack","",499],
      ["53mm Spitfire Formula Four 99a Classics","",4295],
      ["54mm Spitfire F4 93a Ishod Lock-In","",4300],
      ["53mm OJ Elite Mini Combo 101a Wheels","",4000],
      ["Ace AF1 Hollow Trucks, polished pair","",6599],
      ["Ace AF1 Trucks, polished pair","",6199,null,"from $61.99"],
      ["Quasi Video Dept. Tote, navy","",2500],
    ],
    siteNote: "410 products listed, 268 in stock; 'from' prices are size variants.",
  },

  /*
     Mimi’s Chocolates — gathered 2026-09-09 from own-domain
     their spelling: "Mimi's Chocolates" (roster keeps "Mimi’s Chocolates")
     they are: Chocolates and ice cream
     logo: https://img1.wsimg.com/isteam/ip/54f7119c-a1d4-41ea-99f4-56706224959f/logo/1a5dae7a-2365-49e5-9b0c-090e056f6540.png (2560x1591) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the visible widget said 'Open today 1pm-8pm' on a Tuesday while their structured data says Mon-Fri 12-7pm, Sat 1-8pm, Sun closed — no hours carried
     flag: the homepage says 'CALL, TEXT, OR EMAIL US FOR CUSTOM ORDERS' but no email is published anywhere
     flag: the footer copyright still reads 2016
     flag: menu: 16 items read from https://mimischocolates.com/menu on 2026-09-05
  */
  'mimis-chocolates': {
    address: "6601 Dublin Blvd, Ste N, Dublin, CA 94568",
    phone: "(510) 508-6727",
    instagram: "mimis_chocolates",
    cuisine: "Chocolates and ice cream",
    sections: [
      { name: "Menu", items: [
        ["Almond Caramel Apple","From",1150,"mimis-chocolates-almond-caramel-apple"],
      ] },
      { name: "Almond Caramel Apple", items: [
        ["Chocolate Covered Strawberries","",285,"mimis-chocolates-chocolate-covered-strawberries"],
        ["Caramel Apples","",980,"mimis-chocolates-caramel-apples"],
        ["Chocolate Caramel Apple","",1075,"mimis-chocolates-chocolate-caramel-apple"],
        ["Strawberry Shortcake Apple","",1275,"mimis-chocolates-strawberry-shortcake-apple"],
        ["Apple Pie Apple","",1275,"mimis-chocolates-apple-pie-apple"],
        ["S'more Caramel Apple","",1425,"mimis-chocolates-s-more-caramel-apple"],
        ["Oreo Caramel Apple","",1275,"mimis-chocolates-oreo-caramel-apple"],
        ["Heath Caramel Apple","",1275,"mimis-chocolates-heath-caramel-apple"],
      ] },
      { name: "(Milk, Dark, or White Chocolate)", items: [
        ["S'more","",565,"mimis-chocolates-s-more"],
      ] },
      { name: "Caramel", items: [
        ["Caramel Apple","",925,"mimis-chocolates-caramel-apple"],
        ["Oreo","",1175,"mimis-chocolates-oreo"],
        ["Strawberry Shortcake","",1175,"mimis-chocolates-strawberry-shortcake"],
      ] },
      { name: "Chocolates and ice cream", items: [
        ["Candy Bar Covered Caramel Apple","From",1275,"mimis-chocolates-candy-bar-covered-caramel-apple"],
        ["Peanut Caramel Apple","From",1150,"mimis-chocolates-peanut-caramel-apple"],
        ["Pecan Caramel Apple","From",1150,"mimis-chocolates-pecan-caramel-apple"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Moxie Steak House — gathered 2026-09-09 from own-domain
     they are: Steakhouse
     logo: https://images.squarespace-cdn.com/content/v1/65ff79e65817f545c360dbd7/24dbc09f-0f78-4d23-8442-25bbb96a4d67/fan.png (2243x2554) — not cut into a tile yet
     flag: Operator's exact note: Alameda • Goods — but the site shows no shop, goods, or merchandise (only an empty Squarespace /cart link); it is a sit-down steakhouse
     flag: dietary marks (v, gf, vv) and the happy-hour 'Plates' / 'Bites' groupings are on the menu page and were not carried onto the rows
     flag: Name spelling varies: site title and homepage hero say 'Moxie Steak House' / 'MOXIE STEAK HOUSE' (two words), footer says just 'MOXIE', Instagram says 'MOXIE STEAKHOUSE' with handle moxiesteakhouse (one word)
     flag: Instagram mismatch: the site never mentions 'moxiesteakhouse'; its Squarespace social-link config points Instagram to instagram.com/littlehouse_cafe.moxie/ (the chef's former Little House café account, per the about page history); the 'moxiesteakhouse' handle is taken from the operator's screenshot of that profile, which links back to moxiealameda.com and shows the Park St address
     flag: Phone contradiction: site (homepage, footer, menu, about) lists (510) 671-2890; the Instagram Contact button (operator screenshot) lists (510) 864-4044
     flag: Email contradiction: site lists moxie1640@gmail.com; the Instagram Contact button lists tootsiepuplove@gmail.com
     flag: No ZIP code published anywhere on the site ('1640 Park Street Alameda Ca') or in the Instagram bio ('1640 Park St, Alameda, California')
     flag: Hours: the site footer on every page lists only 'Wednesday — Sunday 5pm — 9pm' (dinner); the homepage hero and menu page add Brunch Saturday & Sunday 10am-2pm and Happy Hour Wednesday-Sunday 2pm-5pm; the hours line combines these; Instagram bio 'Open 2 - 9 Wednesday - Friday, 10 - 9 Saturday- Sunday' agrees; Monday-Tuesday closure inferred from 'Open Wednesday-Sunday'
     flag: Market price item: 'Foolish Fish of the Day' is listed M/P with no price (Other Choices section)
     flag: Reservations page embeds a Squarespace Tock reservation block (no OpenTable/Resy link); menu page says no reservation needed for brunch
     flag: Menu text is seasonal ('Spring Asparagus Soup', 'Lemony Spring Slaw', blog post 'Spring Menu') and may be stale as of Sept 2026; prices recorded as currently published
     flag: Menu page lists non-alcoholic drinks twice with different spellings ('A'Siciliana Lemon Soda' vs 'A'siciliana Lemonata', 'San Pellegrino' vs 'San Pelligrino') and repeats 'Latte $5'
     flag: Two different marks: the site logo (logoImageUrl and og:image) is the teal fan/cocktail graphic fan.png, matching operator screenshot IMG_3772; the Instagram avatar is a vintage waitress illustration (IMG_3775)
     flag: About page names Donna Meadows as Executive Chef/owner and describes the room as 'reminiscent of an art-deco era French countryside restaurant and steakhouse'; site is Squarespace on its own domain
  */
  'moxie-steak-house': {
    address: "1640 Park Street, Alameda, CA",
    phone: "(510) 671-2890",
    email: "moxie1640@gmail.com",
    hours: "Wed-Fri 2pm-9pm, Sat-Sun 10am-9pm, closed Mon-Tue",
    instagram: "moxiesteakhouse",
    cuisine: "Steakhouse",
    tagline: "Art-deco French-style steakhouse and bar on Park Street in Alameda",
    sections: [
      { name: "Get Started", items: [
        ["Tableside Caesar Salad for Two or More","",2600],
        ["Caesar Salad for One Prepared by the Chef","",1100],
        ["Full Belly Farms Beet Salad with Oranges, Walnuts, and Marinated Goat Cheese","",1600],
        ["Classic Wedge Salad","",1400],
        ["Half Dozen Oysters on Ice with Champagne Mignonette","",2400],
        ["Gulf Shrimp with Cocktail Sauce","",2200],
        ["Local Dungeness Crab Cake with Lemony Spring Slaw","",2400],
        ["Housemade Parker Rolls with Orange Blossom Butter and Alameda Honey","",800],
        ["Mongolian Meatballs with Scallion Sesame Salad","",1200],
      ] },
      { name: "The Cuts", items: [
        ["8 Oz. Bavette (Sirloin Flap)","Wagyu Beef by Abatti Ranch",4800],
        ["12 Oz. New York Strip","Wagyu Beef by Abatti Ranch",7300],
        ["48 Oz. Bone-in Tomahawk","Wagyu Beef by Abatti Ranch",21000],
        ["6 Oz. Filet Mignon","Holstein Beef by Brandt Farms",4600],
        ["14 Oz Ribeye","Holstein Beef by Brandt Farms",7200],
        ["32 Oz. Flannery Porterhouse","Holstein Beef by Brandt Farms",14600],
      ] },
      { name: "Other Choices", items: [
        ["Australian Lamb Chops","",4700],
        ["Half Roasted Lemon Rosemary Hen","",3200],
        ["Pachamama Farms Pork Tenderloin from Oregon","",3400],
        ["Spring Asparagus Soup with Parmesan Gnocchi and Brown Butter Almondine","",3200],
      ] },
      { name: "Carbs", items: [
        ["Classic Mash","",1000],
        ["Beef Tallow Fries with Garlic Aioli","",1000],
        ["Mac & Cheese with or without Gorgonzola","",1000],
        ["Loaded Baked Potato with Sour Cream, Chives, Cheddar Cheese, Butter","add Bacon +$2",1000],
        ["Duck Fat Roasted Yukons with Confit Garlic","",1000],
        ["Grand Dutchess Potatoes with Caramelized Onions, and Koch Cannalina Cheese","",1000],
      ] },
      { name: "Veggies", items: [
        ["Sauteed Sugar Snap Peas with Radishes and Cucumber","",1000],
        ["Salt and Pepper Shoe String Onions","",1000],
        ["Roasted Cumin Carrots with a Carrot Pepita Hummus","",1000],
        ["Grilled Asparagus with Gribiche","",1000],
        ["Charred Leeks with Tonnato Sauce, Crispy Panko, and Kalamata Olives","",1000],
      ] },
      { name: "Brunch", items: [
        ["Steak & Eggs","spicy steak skewers, crispy fried eggs, potato doughnuts and Romesco sauce",2700],
        ["Moxie Burger with chips","add egg $5, bacon $5",2000],
        ["Classic Maine lobster roll","",3500],
        ["Brioche French Toast","with berries and cream",2000],
        ["Flambeed tableside banana souffle pancake","",2500],
        ["Donut of the day","",400],
      ] },
      { name: "Happy Hour", items: [
        ["Hanger Steak & Fries","",3400],
        ["Cheddar Cheese Burger & Fries","",2500],
        ["Oyster on Ice with Lemon","",250],
      ] },
      { name: "Cocktails", items: [
        ["Alameda Kick","Bruichladdich & Laphroaig Scotch, Orgeat, Quince Liqueur, Absinthe",1700],
      ] },
    ],
    siteNote: "Prices from the text menu at moxiealameda.com/menu (dinner, brunch, happy hour, drinks); hours combine the site's published windows (happy hour Wed-Sun 2pm-5pm, dinner Wed-Sun 5pm-9pm, brunch Sat-Sun 10am-2pm) and match the Instagram bio.",
  },

  /*
     Mrs. Ramen Concord — gathered 2026-09-09 from stopgap
     they are: Ramen and seafood boil
     flag: no website found; a 'Mrs. Pho' is listed by Yelp at the same address, which may be the same operator or the previous tenant
     flag: address is from their own Instagram bio: 'At The Veranda, 2045 Diamond Blvd. Concord, California' — no suite number, no ZIP
     flag: no phone, no hours anywhere in their own words
     flag: Menu sweep 2026-09-09, still no readable prices: No prices found: no official website or ordering-platform page (own domain, Toast, Square, ChowNow, or order.online) for Mrs. Ramen could be located within the search budget, and Instagram is not a valid price source.
     flag: Menu sweep 2026-09-09: Only an Instagram handle (mrs.ramen_concord) was known going into this research; no website or ordering-platform URL was provided.
     flag: Menu sweep 2026-09-09: One WebSearch call ('Mrs Ramen Concord The Veranda menu order online') was run per instructions; it returned no own-domain website or ordering-platform (Toast/Square/ChowNow/order.online) page belonging to Mrs. Ramen.
     flag: Menu sweep 2026-09-09: Search results were dominated by a different business at the same shopping center, 'Mrs. Pho' (Vietnamese fusion, previously 'Silverlake Ramen' at that unit), at 2045 Diamond Blvd Ste Pv32, Concord -- this is NOT confirmed to be the same business as Mrs. Ramen and no facts from it were used or shoul
     flag: Menu sweep 2026-09-09: Confirmed via WebFetch that an Instagram profile named 'Mrs. Ramen Concord' exists at the given handle, but its bio/link-in-bio could not be read (Instagram blocks unauthenticated scraping of profile content), so no link to a real site could be extracted.
     flag: Menu sweep 2026-09-09: Attempted to find a Veranda shopping-center tenant-directory page for Mrs. Ramen (shoptheveranda.com) as a possible link source; the site blocked automated access (403 Forbidden).
     flag: Menu sweep 2026-09-09: No street address, phone number, hours, logo, or menu prices could be confirmed from any business-owned source; all such fields are left null/empty per instructions rather than guessed.
     flag: Menu sweep 2026-09-09: Possible second/related-location or naming confusion: worth verifying in person or via the business's own Instagram whether 'Mrs. Ramen' and 'Mrs. Pho' at The Veranda are related, a successor, or entirely separate businesses.
  */
  'mrs-ramen': {
    address: "2045 Diamond Blvd, Concord, CA",
    instagram: "mrs.ramen_concord",
    cuisine: "Ramen and seafood boil",
    needsSite: true,
    tagline: "Seafood boil, ramen, Korean corn dogs and rice plates at The Veranda in",
    contactOnly: "Seafood boil, ramen, Korean corn dogs and rice plates at The Veranda in. No website yet — their menu is posted on their Instagram, where the boiling seafood bowl board reads $17.95 and a family pack $32.95.",
  },

  /*
     One House Bakery — gathered 2026-09-09 from own-domain
     they are: Bakery and cafe
     logo: https://static.wixstatic.com/media/7dfc6f_912d37cd93ff41bfa762c2ea97097eda~mv2_d_1320_1320_s_2.jpg (1320x1320) — not cut into a tile yet
     flag: the menu exists only as images — no HTML or PDF text, so it reads as empty to anything that cannot see
     flag: the nav still contains a default Wix duplicate slug, /copy-of-about-us
     flag: the pizza window is Wed-Sun 10am-6pm, a subset of store hours
  */
  'one-house-bakery': {
    address: "918 1st Street, Benicia, CA 94510",
    phone: "(707) 361-5919",
    email: "info@onehousebakery.com",
    hours: "Wed-Mon 8am-6pm, closed Tue",
    instagram: "onehousebakery",
    cuisine: "Bakery and cafe",
    items: [
      ["Butter Croissant","",575],
      ["Chocolate Croissant","",600],
      ["Chocolate Chip Cookie","",410],
      ["Apple Pie","Buttery crust, gala apples, caramel, cinnamon, graham-oat crumble",780],
      ["Tiramisu","House-made ladyfingers, mascarpone mousse, coffee syrup",725],
      ["Chicken Pot Pie","Buttery crust, carrots, celery, leeks, onions and Mary's free-range roasted chicken",1090],
      ["Beef Empanada","Spiced chile dough, ground beef, roasted peppers, cotija, potato",865],
      ["Porchetta Sandwich","Fresh bread, porchetta, fontina, fennel, apple, arugula, caramelised onion aioli",1850],
    ],
    siteNote: "The full priced menu is published as image files; salads and pizzas are priced small and large; 'items subject to daily availability'.",
  },

  /*
     One House Bistro — gathered 2026-09-09 from own-domain
     they are: Thai & Asian Fusion
     logo: https://www.blizzstatic.com/dynamicmedia/image/16051/6a7f647609547.png — not cut into a tile yet
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: Found via web search from an Instagram-only lead; business has its own site at onehousebistro.com plus a Toast ordering page (order.toasttab.com/online/onehousebistro), so the own-domain site was used
     flag: Site displayed a 'temporarily closed, reopening September 9, 2026' banner at time of research (today's date)
     flag: Some modifier upcharges are not captured as separate priced items: shrimp add-on (+$4) on Thai Lunch/Curry dishes, and yellow curry sauce add-on (+$4) on Samosa
     flag: Yellow/Red/Green Curry and several Pad dishes are printed twice on the menu under different section headers (e.g. Thai Lunch vs Curry vs Thai Street Food) at the same price; both instances are recorded as separate items since sections differ
     flag: One item's name was normalized from an apparent typo 'Pad See Ev' to 'Pad See Ew' to match the identical dish's spelling elsewhere on the same menu
  */
  'one-house-bistro': {
    address: "2468 San Ramon Valley Boulevard, San Ramon, CA 94583",
    phone: "(925) 235-8888",
    hours: "Mon-Fri 8:30am-2:30pm & 5-9pm, Sat-Sun 8am-2:30pm & 5-9pm",
    instagram: "onehousebistro",
    cuisine: "Thai & Asian Fusion",
    tagline: "Thai and Asian fusion breakfast, brunch, and dinner restaurant",
    sections: [
      { name: "Breakfast Salad", items: [
        ["Athenian Salad","Arugula, mixed greens, cucumbers, cherry tomatoes, red onions, olives, goat cheese with cilantro lime vinaigrette",1900],
        ["Asian Salad","Romaine, carrots, cucumbers, edamame, mandarin oranges, green onions, cilantro, crispy wonton strips, cashew nut, grilled chicken with asian dressing",2300],
        ["Ocean's Salad","Mixed green with grilled shrimp, smoked salmon, avocado, cherry tomatoes, cucumbers, fried capers and parmesan, cilantro lime vinaigrette",2800],
      ] },
      { name: "Egg Plate", items: [
        ["Two Eggs Any Style","",1600],
        ["Egg Plate with Applewood Bacon","",2100],
        ["Egg Plate with Chicken Mango Sausage","",2100],
        ["Egg Plate with Pork Sausage","",2100],
        ["Egg Plate with Thai Pork Sausage","",2300],
        ["Egg Plate with New York Steak","",2800],
      ] },
      { name: "Scrambles / Omelet", items: [
        ["Green Garden","Baby spinach, monterey jack, parmesan",1900],
        ["Athenian","Mushroom, olives, arugula, goat cheese",1900],
        ["Frisco","Chicken mango sausage, mushroom, red onion, avocado, mild cheddar",2200],
        ["Breakfast Meat","Bacon, pork sausage, Canadian ham, mild cheddar",2300],
        ["South of the Border","Chorizo, cherry pepper, avocado, monterey jack with fresh salsa",2200],
        ["Pacific Morning","Shrimp, spinach, red onion, fried capers, monterey jack",2500],
        ["Ocean Sunrise","Fresh Dungeness crab, green onion, asparagus, monterey jack, parmesan",2900],
      ] },
      { name: "Benedict", items: [
        ["Classic Benedict","Canadian bacon, Meyer lemon hollandaise",1900],
        ["Florentine Benedict","Baby spinach, tomato, Meyer lemon hollandaise, parmesan",2000],
        ["Fried Chicken Benedict","Fried chicken, Meyer lemon hollandaise",2200],
        ["The Salmon Benney","Smoked salmon, sliced lemon, fried caper, Meyer lemon hollandaise",2500],
        ["Crab Benedict","Fresh Dungeness crab meat, asparagus, sliced lemon, fried caper, Meyer lemon hollandaise, parmesan",2900],
      ] },
      { name: "Bun & Bread", items: [
        ["Classic Burger","Angus beef patty, mild cheddar, lettuce, tomato, red onion, pickles and aioli on toasted brioche bun",2100],
        ["California Burger","Angus beef patty, monterey jack, arugula, tomato, red onion, pickles and jalapeno ranch on toasted brioche bun",2300],
        ["One House Shrimp Burger","Crispy shrimp donut, lettuce, avocado, red onion and spicy aioli sauce on toasted brioche bun",2500],
        ["Breakfast Sandwich","Bacon, scrambled egg, spinach, mild cheddar and aioli on ciabatta roll",2100],
        ["B L T A","Bacon, lettuce, tomato, avocado and aioli on ciabatta roll",2100],
        ["Chicken Melt","Chicken mango sausage, spinach, tomato and aioli on ciabatta roll",2100],
        ["Mushroom Melt","Mushroom, pesto, mayo and monterey jack on ciabatta roll",2000],
      ] },
      { name: "Healthy Choice", items: [
        ["Mix Fruit with Greek Yogurt","",1200],
        ["Avocado Toast","Texas toast, sliced avocado, radish, red pickle onion, olive oil with poached egg",1500],
        ["Pimavera Omelet","Egg white omelet, arugula, bell pepper, mushroom, tomato, scallion with salad and english muffin",2500],
      ] },
      { name: "Kid's Zone", items: [
        ["Kid Pancake","One pancake and one scrambled egg with bacon or chicken sausage or pork sausage",1500],
        ["One Egg Plate (Kids)","One scrambled egg with bacon or chicken sausage or pork sausage and mixed fruit",1400],
        ["Grilled Cheese (Kids)","Wheat toast with melted mild cheddar, swiss cheese with french fries",1400],
      ] },
      { name: "Breakfast Side", items: [
        ["Toast","",400],
        ["Avocado","",300],
        ["One Egg","",300],
        ["Two Eggs","",600],
        ["Bacon","",700],
        ["Chicken Sausage","",700],
        ["Pork Sausage","",700],
        ["Thai Pork Sausage","",900],
        ["One Pancake","",900],
        ["One French Toast","",800],
        ["Fried Chicken","",900],
        ["Grill Chicken","",800],
        ["Potato Medley","",600],
        ["French Fries","",600],
        ["Fresh Salsa","",300],
        ["Hollandaise Sauce","",300],
        ["New York Steak (Side)","",1500],
      ] },
      { name: "Sweet & Sweet", items: [
        ["Fried Chicken & Waffles","Served with mixed berry, sugar powder, and maple syrup",2000],
        ["Citrus French Toast","Served with mixed berry, sugar powder, butter and maple syrup",1800],
        ["Sweet Waffles","Served with mixed berry, sugar powder, vanilla ice cream and whip cream",1500],
        ["Butter Milk Pancakes","Served with mixed berry, sugar powder, butter and maple syrup",1800],
        ["Banana Strawberry Nutella Crepe","Served with whipped cream and sugar powder",1500],
      ] },
      { name: "Appetizers", items: [
        ["Steamed House Dumplings (5)","Prawns & pork in wontons, house soy sauce, fried garlic",1200],
        ["Crab Rangoon (6)","Wild crab cream cheese wontons, house cherry sauce",1400],
        ["Samosa (4)","Vegetables, pastry puffs, cucumber salad",1400],
        ["Tuna Tower","Wild tuna, avocado, mango, masago, sweet soy with crispy rice paper",1800],
        ["Crispy Prawn Rolls (5)","Hand wrapped marinated prawns with egg roll shells, house sweet chili sauce",1400],
        ["Avocado Spring Roll (3)","Avocado and herbs in egg roll shells, house cherry sauce",1500],
        ["Fresh Rolls (2)","Prawns or avocado, spring mix, rice paper, peanut sauce",1100],
        ["Pot Stickers (6)","Fried gyoza with chicken and veggie, house soy sauce",1100],
        ["Chicken Satay (4)","Marinated chicken breast, cucumber salad, peanut sauce",1300],
        ["Roti and Yellow Curry","Crispy fried roti, yellow curry sauce",1400],
        ["Garlic Pepper Wings (6)","Marinated and fried battered wings and sweet chili garlic sauce",1500],
        ["Crispy Shrimp Donut (3)","Marinated shrimp, pork fat, cilantro and sweet spicy plum sauce",1500],
        ["Vegetable Egg Rolls (4)","Veggies, glass noodle, in egg roll shell with sweet chili sauce",1100],
      ] },
      { name: "Thai Lunch", items: [
        ["Pad Thai (Thai Lunch)","Thin rice noodles, eggs, tofu, scallions, beansprout, and peanuts; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Pad See Ew (Thai Lunch)","Wild rice noodles, eggs, broccoli and carrots; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Pad Kee Mao (Thai Lunch)","Wild rice noodles, basil, bell peppers, onion and carrots; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Fried Rice (Thai Lunch)","Eggs, tomato, carrots and scallion; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Pad Gra Prow (Thai Lunch)","Basil, bell peppers, onion and carrots; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["String Bean (Thai Lunch)","Thai chili paste, basil, green bean and bell pepper; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Eggplant (Thai Lunch)","Eggplant, basil, bell pepper and onion; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Yellow Curry (Thai Lunch)","Broccoli, carrot, onion and potato; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Red Curry (Thai Lunch)","Broccoli, carrot, bell pepper, basil and green bean; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Green Curry (Thai Lunch)","Broccoli, carrot, bell pepper, basil, green bean and eggplant; choice of chicken, pork, beef, tofu or vegetable",1800],
      ] },
      { name: "Soups", items: [
        ["Tom Kha","Mild creamy coconut milk and herbs broth, mushroom, scallions, red onions, cilantro, chili paste; choice of chicken, pork, beef, tofu or vegetable",800],
        ["Tom Yum","Mild lemongrass and herbs broth, mushroom, scallions, red onions, cilantro, chili paste; choice of chicken, pork, beef, tofu or vegetable",800],
      ] },
      { name: "Thai Salad", items: [
        ["Beet Salad","Spring mix, candied walnut, dried cranberries, mandarin oranges, strawberries, parmesan cheese and vinaigrette",1700],
        ["Papaya Salad","Grilled shrimps, shredded papaya, peanuts, tomatoes, carrots, lime dressing",1700],
        ["Thai Beef Salad","Medium rare beef, red onion, scallions, cilantro, roasted rice, roasted chilies, lime dressing",1700],
      ] },
      { name: "Curry", items: [
        ["Yellow Curry","Carrot, onion and potato; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Red Curry","Broccoli, carrot, bell pepper, basil and green bean; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Green Curry","Broccoli, carrot, bell pepper, basil, green bean and eggplant; choice of chicken, pork, beef, tofu or vegetable",1800],
      ] },
      { name: "Thai Street Food", items: [
        ["Pad Thai","Thin rice noodles, eggs, fried tofu, chive, beansprout, and peanuts; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Pad See Ew","Wild rice noodles, eggs, broccoli and carrots; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Pad Kee Mao","Wild rice noodles, basil, bell peppers, onion and carrots; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Fried Rice","Eggs, tomato, onion and scallion; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Spicy Basil Fried Rice","Carrots, scallion, basil, onion, bell peppers; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Pineapple Fried Rice","Eggs, cashewnut, raisin, garlic, scallion, pineapples, curry powder; choice of chicken, pork, beef, tofu or vegetable",1900],
        ["Pad Gra Prow","Basil, bell peppers, onion and carrots; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["String Bean","Thai chili paste, basil, green bean and bell pepper; choice of chicken, pork, beef, tofu or vegetable",1800],
        ["Eggplant","Eggplant, basil, bell pepper and onion; choice of chicken, pork, beef, tofu or vegetable",1800],
      ] },
      { name: "Special of the House", items: [
        ["Khao Soi","Northern Thai style curry, crispy egg noodles, steamed egg noodles, chicken, red onion, scallion, cilantro",2000],
        ["Wild Lobster Pad Thai","Wild lobster, prawns, thin rice noodle, eggs, fried tofu, chive and peanut",3000],
        ["Lychee Salmon","Grilled salmon, red curry, lychee, cherry tomatoes",2800],
        ["Seafood Paradise","Shrimp, green mussels, scallops, asparagus, zucchini, carrot, broccoli, bell pepper, red curry",3500],
        ["Angus Beef Curry","Slow cooked angus beef, panang curry",2200],
        ["Fried Whole Snapper","Crispy fried whole snapper, spring mix salad, Thai spicy lime sauce",3500],
        ["Tom Yum Spaghetti","Spaghetti noodles, tom yum paste, mushroom, tomato, scallion",1800],
        ["Drunken Spaghetti","Spaghetti noodles, basil, bell pepper, onion and carrot",1800],
        ["Crab Fried Rice","Crab meat, eggs, carrots and scallion",2500],
      ] },
      { name: "Thai Side", items: [
        ["Jasmine Rice","",300],
        ["Brown Rice","",400],
        ["Sticky Rice","",400],
        ["Cucumber Salad","",700],
        ["Steamed Veggies","",700],
        ["Fried Roti (1)","",400],
      ] },
      { name: "Hot Drink", items: [
        ["House Coffee","",500],
        ["Espresso","",400],
        ["Americano","",500],
        ["Latte","",700],
        ["Cappuccino","",700],
        ["Salted Caramel Macchiato","",900],
        ["Mocha","",800],
        ["Chai Latte","",700],
        ["Matcha Latte","",700],
        ["Ube Latte","",700],
        ["Hot Chocolate","",700],
        ["Hot Tea","",700],
      ] },
      { name: "Beverages", items: [
        ["Fresh Squeezed Orange Juice","",700],
        ["Lemonade","",600],
        ["Coke","",400],
        ["Diet Coke","",400],
        ["Coke Zero","",400],
        ["Sprite","",400],
        ["Regular Iced Tea","",600],
        ["Thai Iced Tea","",700],
        ["Arnold Palmer","",700],
        ["Thai Iced Green Tea","",700],
        ["Ginger Beer","",600],
        ["Mochi Yuzu","",800],
        ["Maison Perrier","",500],
        ["Acqua Panna Natural","",500],
        ["Apple Juice","",500],
        ["Cranberry Juice","",500],
        ["Milk","",400],
        ["Chocolate Milk","",400],
      ] },
    ],
    siteNote: "Full priced menu text taken from onehousebistro.com/menu (their own domain); address, phone, and hours confirmed from the onehousebistro.com homepage.",
  },

  /*
     oneills-signature — gathered 2026-09-09 from own-domain
     their spelling: "Pavers and Turf By O'Neills" (roster keeps "oneills-signature")
     they are: Pavers and turf
     logo: https://paversandturf.com/wp-content/uploads/2025/04/LogoUpdate.png (1563x1563) — not cut into a tile yet
     flag: the phone is printed two ways in the same header: '(925) 443 7888' and '(925) 433 7888' — the tel: links and structured data carry 443, which is used here
     flag: a floating call button dials a third number, 844-507-8363
     flag: name appears as 'Pavers & Turf', 'Pavers and Turf By O'Neills', 'Pavers and Turf by O'Neill's' and the legal 'O'Neill's Green Services DBA Pavers and Turf By O'Neills'
     flag: footer misspells the licensing board as 'CLSB'; licence 1059264
  */
  'oneills-signature': {
    address: "2133 Research Dr, Unit 16, Livermore, CA 94550",
    phone: "(925) 443-7888",
    email: "info@paversandturf.com",
    hours: "Mon-Fri 8am-5pm, closed Sat-Sun",
    instagram: "paversandturfbyoneills",
    cuisine: "Pavers and turf",
    contactOnly: "'Outdoor living design, pavers, artificial turf and backyard renovations — with putting greens designed and built by true craftsmen,' serving the Tri-Valley. A contractor — free, no-obligation quotes only, no prices published.",
  },

  /*
     Overly Hip Hop — gathered 2026-09-09 from own-domain
     they are: Media company
     flag: Oakland and San Francisco per their footer; no address published
     flag: Glenn: his best friend's company, a sound engineer; a collab is planned
  */
  'overly-hiphop': {
    instagram: "overlyhiphop",
    cuisine: "Media company",
    tagline: "A new Bay Area media company: music, originals, community, fashion",
  },

  /*
     PaintGo — gathered 2026-09-09 from own-domain
     their spelling: "Paint Go USA" (roster keeps "PaintGo")
     they are: Auto tint and PPF
     logo: https://irp.cdn-website.com/2dec908d/dms3rep/multi/LOGOWHITEpaintgo.webp (2400x386) — not cut into a tile yet
     flag: the page title and meta description are unfilled template placeholders: 'Window Tint LOCATION | ... | BUSINESS'
     flag: the header logo's alt text names a different business: 'Southside Mobile Detail & Tint'
     flag: the gallery shows ten literal 'Button' placeholder labels
     flag: name written PAINT GO USA / Paint Go USA / PaintGo on one page; the domain is paintgonorcal.com
  */
  'paintgo': {
    address: "1640 Lewis Brown Drive, Vallejo, CA 94589",
    phone: "(707) 805-3334",
    email: "info@paintgonorcal.com",
    hours: "Mon-Fri 8am-6pm, closed Sat-Sun",
    instagram: "paintgo.usa",
    cuisine: "Auto tint and PPF",
    contactOnly: "A Vallejo shop for 'premium automotive protection, restoration, and customization' — detailing, ceramic coating, PPF, window tinting, body and paint. Quote-based — 'Free Estimate, No Obligation' — with no prices on any service page.",
  },

  /*
     Parada New Peru — gathered 2026-09-09 from own-domain
     their spelling: "Parada Kitchen" (roster keeps "Parada New Peru")
     they are: Peruvian food
     logo: https://paradakitchen.com/wp-content/uploads/2024/09/parada-logo.png (598x226) — not cut into a tile yet
     flag: The operator's exact note: Walnut Creek • Goods — 'Goods' does not fit: this is a sit-down Peruvian restaurant (dine-in, take-out, bar, brunch, catering), not a goods/retail shop
     flag: Name is written three ways: the site title and nav-logo alt text say 'Parada Kitchen' (domain paradakitchen.com), while the logo image itself and the hero graphic read 'Parada NEW PERU' (matches the operator's 'Parada New Peru'), and the Instagram display name and OpenTable link slug say 'Parada Peruvian Kitchen'; body copy just says 'Parada'
     flag: Sunday is not listed anywhere on the site or in the Instagram bio, neither as hours nor as closed; a Brunch menu is published (bottomless mimosas, 90 min limit) but no brunch days or hours are given, so hours covers Mon-Sat only
     flag: No item prices on any own-site menu page (Dinner, Brunch, Cocktails, Beer & Wine, Desserts): only '$25 corkage fee' ('$25 for 750ml' on the wine page) and 'Add Fried egg $3' on Lomo Saltado; the Catering Menu page just says to email events@altamiranorestaurants.com
     flag: Their Toast ordering page (order.toasttab.com/online/parada-wc-7001-sunne-ln-suite-116), the only place their prices would be, returned 403 and a Cloudflare 'Just a moment' bot-verification page, which was not bypassed, so items is empty
     flag: The site's own 'Order Online' nav link points to paradakitchen.com/pickup-delivery/, which returns 404; the working links are the Toast 'Pickup + Delivery' URL and OpenTable (opentable.com/r/parada-peruvian-kitchen-reservations-walnut-creek) for reservations
     flag: Address details are scattered: most pages say '7001 Sunne Lane, Walnut Creek, CA' with no zip; 94597 appears only on the Our Restaurants page ('7001 Sunne Ln, Walnut Creek, CA 94597'); 'Suite 116' appears only inside the Toast link slugs, never in visible text
     flag: A second email, events@altamiranorestaurants.com, is published for events and catering (the restaurant group's domain, not Parada's); the Instagram bio tags #AltamiranoRestaurants
     flag: Only one Parada location is published; the site's Our Restaurants page lists sister restaurants under chef Carlos Altamirano (Paradita Eatery, Emeryville; Sanguchon Eatery and Mochica, San Francisco; Barranco, Lafayette; La Costanera, Half Moon Bay), separate brands with their own sites, not recorded as Parada locations
     flag: The header logo file (wordmark 'Parada NEW PERU') is white-on-transparent, invisible on light backgrounds; a 200x200 teal square 'P' favicon also exists at https://paradakitchen.com/wp-content/uploads/2024/09/favicon-parada.png
     flag: Parking is described two ways: the site banner says '2 Hours of Free Parking at the public parking garage conveniently located next to our restaurant', the contact page says 'complimentary parking in the covered lot behind the restaurant' (one block from Pleasant Hill/Contra Costa Centre BART)
     flag: Beer & Wine list looks dated: vintages 2016-2020 only, with typos ('Colorada', 'Sam Jose')
     flag: The site itself has no Instagram or social links; the handle comes only from the operator's screenshot of the profile (@paradakitchen, category 'Peruvian Restaurant', bio 'Dine in & Take out: Mon-Thu 11am-9pm Fri-Sat 11am-10pm', identical to the site's hours)
     flag: Menu sweep 2026-09-09, still no readable prices: No prices are printed anywhere on paradakitchen.com; the dinner, brunch, and cocktails menu pages all list item names and descriptions but omit every price (the cocktails page explicitly tells customers to call for current pricing). Their Toast ordering page (order.toasttab.com/online/parada-wc-7001
     flag: Menu sweep 2026-09-09: Business name given in this task ('Parada New Peru') does not match the name used on their own site, which calls itself 'Parada Kitchen' (also 'Parada Peruvian Kitchen' on the dinner-menu page, and 'parada-peruvian-kitchen' in their OpenTable listing)
     flag: Menu sweep 2026-09-09: No prices printed anywhere on paradakitchen.com across dinner, brunch, and cocktails menu pages
     flag: Menu sweep 2026-09-09: Their Toast online-ordering page (order.toasttab.com/online/parada-wc-7001-sunne-ln-suite-116) returned HTTP 403 Forbidden, so any prices it carries could not be read
     flag: Menu sweep 2026-09-09: Site-listed hours cover only Mon-Thu and Fri-Sat; no Sunday hours are stated anywhere found
     flag: Menu sweep 2026-09-09: No Instagram link found in the site's HTML on the homepage or contact page
     flag: Menu sweep 2026-09-09: Toast ordering URL slug references 'Suite 116' though the printed address on the site's own pages does not include a suite number
  */
  'parada-new-peru': {
    address: "7001 Sunne Lane, Walnut Creek, CA 94597",
    phone: "925-448-8118",
    email: "info@paradakitchen.com",
    hours: "Mon-Thu 11am-9pm, Fri-Sat 11am-10pm",
    instagram: "paradakitchen",
    cuisine: "Peruvian food",
    tagline: "Peruvian restaurant by chef Carlos Altamirano in Walnut Creek",
    contactOnly: "Peruvian restaurant by chef Carlos Altamirano in Walnut Creek. No prices anywhere on paradakitchen.com (menu pages give names and descriptions only; the only dollar figures are a $25 corkage fee and a $3 fried-egg add-on); their Toast ordering page is behind a Cloudflare bot check and was not read; hours come from the homepage HOURS block and match the Instagram bio.",
  },

  /*
     Perfect Nine — gathered 2026-09-09 from own-domain
     they are: Mobile mini golf
     logo: https://images.squarespace-cdn.com/content/v1/6985817d209a3550aea72807/a665e08a-a937-42dc-ace4-80bc8c75e2a0/Perfect+Nine+Mobile+Mini+Golf+California.png (2500x502) — not cut into a tile yet
     flag: based in Berkeley but no street address published
     flag: the nav's FAQ link points at their internal squarespace.com domain
  */
  'perfect-nine-events': {
    phone: "(510) 953-5757",
    email: "jacob@perfectnineevents.com",
    instagram: "perfectnineminigolf",
    cuisine: "Mobile mini golf",
    groups: [
      { name: "Prices, from", items: [
        ["Full nine-hole course, per day","With an on-site attendant and up to eight hours of play; no setup or delivery fees",235000],
        ["Six-hole course, per day","",166000],
        ["Three-hole course, per day","",97000],
        ["Additional time beyond eight hours","",5000,"$50 per half hour"],
      ] },
    ],
    quoteOnly: "'The Bay Area's premier pop-up mini golf provider' — a nine-hole mobile course for weddings, corporate events and gatherings. A $750 deposit at booking, the balance two weeks before; day two onward is 20% less; free delivery within 150 miles of Berkeley.",
  },

  /*
     Philomena Pizza — gathered 2026-09-09 from own-domain
     their spelling: "PHILOMENA" (roster keeps "Philomena Pizza")
     they are: Pizza and beer bar
     logo: https://images.squarespace-cdn.com/content/v1/56e8a739f850829a3e282a2a/7d848adb-25df-4a4b-96fe-25ca7319a0f0/horizantal+title.png (1944x567) — not cut into a tile yet
     flag: the link he sent, order.philomenapizza.com, is Cloudflare-blocked; these facts are from www.philomenapizza.com
     flag: no street address or phone anywhere on their main site; a parking-map image places it near E 18th St and 14th Ave, Oakland
     flag: hours are published only as an image; brunch Tue-Sun 10:30am-3pm, slices Tue-Fri 10:30am-5pm, pickup and delivery Thu-Mon until 11pm
     flag: the SMS privacy page still reads 'Effective Date: [insert date]'
     flag: menu: 102 items read from https://order.philomenapizza.com/ on 2026-09-05
  */
  'philomena-pizza': {
    email: "Philomena.manager@gmail.com",
    hours: "Mon 4-10pm, Tue-Sun 10:30am-10pm",
    instagram: "philomenaoakland",
    cuisine: "Pizza and beer bar",
    sections: [
      { name: "Specials", items: [
        ["Seasonal Brussels: Chicken Bacon & Ranch","",1375,"philomena-pizza-seasonal-brussels-chicken-bacon-ranch"],
        ["10\" BYO Pizza","Design your own pie!",1375,"philomena-pizza-10-byo-pizza"],
        ["Side Caesar Salad","Romaine, croutons, anchovies & grana padano.",700,"philomena-pizza-side-caesar-salad"],
        ["10\" Margherita","Red sauce, fior de latte, mozzarella, parmesan Reggiano, garlic, basil & olive oil.",1675,"philomena-pizza-10-margherita"],
        ["10\" Harborside","Pesto, mozzarella, herbed ricotta, oregano, pineapple, topped with arugula.",1675,"philomena-pizza-10-harborside"],
        ["10\" House Mushroom","Red sauce, mozzarella with roasted mushrooms, presillade, green onions & olive oil.",1675,"philomena-pizza-10-house-mushroom"],
        ["10\" House Sopressata","Red sauce, mozzarella, with fra'mani sopressata, assorted premium olives, parmesan reggiano, oregano & olive oil.",1675,"philomena-pizza-10-house-sopressata"],
        ["10\" Miss Piggy","Red sauce, mozzarella, parmesan reggiano, pork belly, black forrest ham, Italian sausage & green onions.",1675,"philomena-pizza-10-miss-piggy"],
        ["10\" Garlic Garden","Pesto, mozzarella, roasted garlic, roasted tomatoes, fresh mozzarella, topped with arugula, parmesan reggiano & garlic oil.",1675,"philomena-pizza-10-garlic-garden"],
        ["10\" Hot Sausage Party","White sauce, mozzarella, parmesan reggiano, Italian sausage, jalapeños, red onions & roasted garlic.",1675,"philomena-pizza-10-hot-sausage-party"],
        ["10\" Cali Apple and Pork Belly","Sauce-less pie with pork belly, apple, caramelized onion, blue cheese, mozzarella, topped with fresh arugula & balsamic reduction.",1675,"philomena-pizza-10-cali-apple-and-pork-belly"],
        ["10\" Combo","Red Sauce, Pepperoni, Italian Sausage, Bell Peppers, Red Onion & Mushroom.",2175,"philomena-pizza-10-combo"],
        ["10\" Hawaiian","House red sauce, black forest ham and pineapple.",1725,"philomena-pizza-10-hawaiian"],
        ["10\" Pepperoni","red sauce, mozzarella, pepperoni",1575,"philomena-pizza-10-pepperoni"],
      ] },
      { name: "Plain pies", items: [
        ["16\" Plain Cheese Pizza","Red sauce & mozzarella cheese",2475,"philomena-pizza-16-plain-cheese-pizza"],
        ["8oz Jar Ranch","",300],
      ] },
      { name: "16\" house pizzas", items: [
        ["16\" Margherita","Red sauce, foir de latte, mozzarella, parmesan reggiano, garlic, basil & olive oil.",3075,"philomena-pizza-16-margherita"],
        ["16\" Harborside","Pesto, mozzarella, herbed ricotta, oregano, pineapple, topped with arugula.",3175,"philomena-pizza-16-harborside"],
        ["16\" House Mushroom","Red sauce, mozzarella with roasted mushrooms, presillade, green onions & olive oil.",3175,"philomena-pizza-16-house-mushroom"],
        ["16\" House Sopressata","Red sauce, mozzarella, with fra'mani sopressata, assorted premium olives, parmesan reggiano, oregano & olive oil.",3175,"philomena-pizza-16-house-sopressata"],
        ["16\" Miss Piggy","Red sauce, mozzarella, parmesan reggiano, pork belly, black forrest ham, Italian sausage & green onions.",3175,"philomena-pizza-16-miss-piggy"],
        ["16\" Garlic Garden","Pesto, mozzarella, roasted garlic, roasted tomatoes, fresh mozzarella, topped with arugula, parmesan reggiano & garlic oil.",3175,"philomena-pizza-16-garlic-garden"],
        ["16\" Hot Sausage Party","White sauce, mozzarella, parmesan reggiano, Italian sausage, jalapeños, red onions & roasted garlic.",3175,"philomena-pizza-16-hot-sausage-party"],
        ["16\" Cali Apple and Pork Belly","Sauce-less pie with pork belly, apple, caramelized onion, blue cheese, mozzarella, topped with fresh arugula & balsamic reduction.",3175,"philomena-pizza-16-cali-apple-and-pork-belly"],
        ["16\" Philo Combo","Red Sauce, Pepperoni, Italian Saugage, Bell Peppers, Red Onion & Mushroom.",3475,"philomena-pizza-16-philo-combo"],
        ["16\" Hawaiian","House red sauce, black forest ham, and pineapple.",2975,"philomena-pizza-16-hawaiian"],
        ["16\" Pepperoni Pizza","red sauce, mozzarella, pepperoni",2700,"philomena-pizza-16-pepperoni-pizza"],
      ] },
      { name: "Build your own", items: [
        ["16\" BYO Pizza","Design your own pie!",2475,"philomena-pizza-16-byo-pizza"],
      ] },
      { name: "Appetizers", items: [
        ["Brussel Sprouts","CHOOSE YOUR FLAVOR: Blue Cheese+Buffalo+Pickled Veggies OR Calabrian Chile+Balsamic+Lemon Zest!",900,"philomena-pizza-brussel-sprouts"],
        ["Garlic Waffle Fries (now w/Parm!)","Crispy waffle fries topped with minced garlic oil & freshly grated parm",1000,"philomena-pizza-garlic-waffle-fries-now-w-parm"],
      ] },
      { name: "Sides", items: [
        ["Waffle Fries","Crispy waffle fries",900,"philomena-pizza-waffle-fries"],
        ["Tater Tots 4 You","",550,"philomena-pizza-tater-tots-4-you"],
        ["Tater Tots to Share","",1200,"philomena-pizza-tater-tots-to-share"],
        ["Chicken Wings 12pc","Choose plain, buffalo, or sweet garlic Thai",2175,"philomena-pizza-chicken-wings-12pc"],
        ["Chicken Wings 8 pc","Choose plain, buffalo, or sweet garlic Thai",1475,"philomena-pizza-chicken-wings-8-pc"],
        ["Cheesy Bread (no adds/subs)","Our house dough with garlic and herb olive oil/persilade and our house buffalo mozz blend shredded mozzarella. We are sorry",1500,"philomena-pizza-cheesy-bread-no-adds-subs"],
      ] },
      { name: "Pasta and sandwiches", items: [
        ["Italian Classic SANDO","Ham +soppressata, +prosciutto, +arugula, +mayo, +provolone, +pepperoncini, +tomato, +red onion, +oil & vinaigrette, salt & pepper on an Italian roll.",1550,"philomena-pizza-italian-classic-sando"],
        ["PHANCY Burger","6oz. angus beef burger mix +sautéed house mushrooms, +caramelized yellow onions, +arugula +Blue Cheese Crumbles w/Lemon Garlic Aioli. **Sides are Xtra $\"",1550],
        ["BASED Burger","3.5 oz. angus house beef burger mix +Shredduce +Philomena House burger Sauce. Cooked Well. **Sides are extra $**",800],
      ] },
      { name: "Salads", items: [
        ["Caesar Salad","Romaine, croutons, anchovies & grana padano.",1600,"philomena-pizza-caesar-salad"],
        ["Garden Salad","Mixed greens, red onion, tomatoes and croutons and Parmesan.",1600,"philomena-pizza-garden-salad"],
        ["Side Garden Salad","Mixed greens, red onion, tomatoes and croutons and Parmesan.",700,"philomena-pizza-side-garden-salad"],
        ["BYO Salad","Design your own salad!",1300],
        ["Cookie MIXED 4- Pk! (2 and 2)","The best of both worlds! Try each flavor...buy 3 get one cookie free!",1000,"philomena-pizza-cookie-mixed-4-pk-2-and-2"],
        ["Basically buy 3 GET ONE SUPER GOOEY CHOCOLATE COOKIE FOR FREE. Yep. Serious.","",1000],
        ["4Pk Snickerdoodle Cookie (House scratch made)","Basically buy 3 GET ONE SUPER YUMMY SNICKERDOODLE FOR FREE. Yep. Serious.",1000],
        ["Snickerdoodle Cookie (House scratch made)","We make these gooey dough love puddles from scratch and bake them fresh! Cinnamon & sugar goodness... get your milk ready.",350],
        ["Beignets (5)","fried dough, powdered sugar, chocolate ganache",850,"philomena-pizza-beignets-5"],
        ["Beignets (3)","fried dough, powdered sugar, chocolate ganache",550,"philomena-pizza-beignets-3"],
      ] },
      { name: "Drinks", items: [
        ["Coca-Cola Original Taste — the crisp, refreshing taste you know and love","",300],
        ["Coke-6x 12oz -Catering","",1200,"philomena-pizza-coke-6x-12oz-catering"],
        ["Fanta Orange, 12oz Can","Liberate your every day with fizzy and refreshing fruit-flavored Fanta soda pop",300,"philomena-pizza-fanta-orange-12oz-can"],
        ["Fanta 12 oz 6 Pk","",1200,"philomena-pizza-fanta-12-oz-6-pk"],
        ["Sprite 12 oz Cans 6 PK","",1200,"philomena-pizza-sprite-12-oz-cans-6-pk"],
        ["Coca-Cola Zero Sugar","Enjoy the great taste of Coca-Cola with zero sugar, zero calories",300,"philomena-pizza-coca-cola-zero-sugar"],
        ["Coca Cola Zero Sugar 6 Pack","",1200,"philomena-pizza-coca-cola-zero-sugar-6-pack"],
        ["LUP Sparkling HOP Water 4 PACK! 12oz cans","",1500,"philomena-pizza-lup-sparkling-hop-water-4-pack-12oz-cans"],
        ["LUP Sparkling HOP Water 12oz single can","",500,"philomena-pizza-lup-sparkling-hop-water-12oz-single-can"],
      ] },
      { name: "Alameda Point Craft Soda", items: [
        ["Cola","",325,"philomena-pizza-cola"],
        ["Diet Cola","",325],
        ["Lemon Lime","",325],
        ["Lemonade","",325,"philomena-pizza-lemonade"],
        ["Iced Tea","",325],
        ["Dr. Poivre (aka Dr. Pepper)","",325],
        ["Grapefruit Soda (aka Squirt)","",325],
        ["Club Soda","",200],
      ] },
      { name: "Juices", items: [
        ["Orange Juice","",400],
        ["Cranberry Juice","",400],
        ["Grapefruit Juice","",400],
        ["Apple Juice","",300,"philomena-pizza-apple-juice"],
        ["Stuff your Stockings with Stockings! 4 Different Designs in one fun box.","",2200],
        ["The Pepper Plant OG Cali-style hot sauce 10oz","Original California Style Hot Pepper Sauce Our customers LOVE this hard-to-find gem. Take one home!",699],
        ["Firelli Xtra Hot Sauce","Casa Firelli is made in ITALY - and is now available in THREE delicious varieties - Original, Extra Hot and Truffle",699],
        ["Firelli Truffle Hot Sauce","Casa Firelli is made in ITALY - and is now available in THREE delicious varieties - Original, Extra Hot and Truffle",699],
      ] },
      { name: "Coffee", items: [
        ["Mr Espresso Hot Coffee (caff)","",325,"philomena-pizza-mr-espresso-hot-coffee-caff"],
        ["Mr Espresso Hot Coffee (Decaf)","",325,"philomena-pizza-mr-espresso-hot-coffee-decaf"],
      ] },
      { name: "PizzaPass Membership", items: [
        ["10\" Cheese Pizza (PizzaPass)","Design your own pie!",1575,"philomena-pizza-10-cheese-pizza-pizzapass"],
        ["10\" Pepperoni Pizza (PizzaPass)","Design your own pie!",1575,"philomena-pizza-10-pepperoni-pizza-pizzapass"],
      ] },
      { name: "Fresh Greens", items: [
        ["Caesar Salad - Full Tray","20 Side Salads or 5 Entree sized salads +romaine lettuce +house made buttermilk Caesar dressing +house made croutons +Parmesan +anchovies",6000,"philomena-pizza-caesar-salad-full-tray"],
        ["Caesar - Half Tray","Feeds 8 (side salad portions) +House made Buttermilk Caesar dressing +House Made Croutons +Fresh Grated Parmesan +Anchovies",3200],
        ["Garden Salad - Full Tray","20 Side Salads or 5 Entree sized salads +mixed greens +red onion +cherry toms +house made croutons +Parmesan",6000],
        ["Garden Salad - Half Tray","Feeds 8 (side salad portions) +mixed greens +red onion +cherry toms +house made croutons +Parmesan",3200],
      ] },
      { name: "Sweet Tooths", items: [
        ["20 Cookies (1/2 tray)","",4500,"philomena-pizza-20-cookies-1-2-tray"],
        ["40 Cookies (large Tray)","",8000],
        ["Serves 12 Locally made by Alameda Soda Company with cane sugar","",1700],
        ["96oz Iced Tea (Alameda Soda Company)","",1700],
        ["96oz Organic Coffee (Regular)","serves 12 Mr. Espresso coffee. Cups, cream, sugar, and sweetener provided",2500,"philomena-pizza-96oz-organic-coffee-regular"],
        ["96oz Organic Coffee (Decaffeinated)","serves 12 cups, cream, sugar, and sweetener provided",2500,"philomena-pizza-96oz-organic-coffee-decaffeinated"],
        ["Coke-35x 12oz -Catering","",5500],
        ["Sprite-6x 12oz - Catering","",1200],
        ["Sprite-35x 12oz -Catering","",5500],
        ["Coke ZERO (Diet)-6x 12oz -Catering","",1200],
        ["Coke ZERO (Diet)-35x 12oz -Catering","",5500],
        ["Fanta-6x 12oz- Catering","",1200],
        ["Fanta-24x 12oz -Catering","",3800],
        ["LaCroix-6x 12oz -Catering","",850],
        ["LaCroix-24x 12oz -Catering","",3300],
      ] },
      { name: "Menu", items: [
        ["10\" Plain Pie","Red sauce & mozzarella cheese",1375,"philomena-pizza-10-plain-pie"],
        ["Meatball Plate! 10th Anniversary!","House-made Turkey Meatballs with our house-made Marinara with fresh arugula greens and shaved aged Parmesan, side of garlic cheesy toast for dipping.",1600,"philomena-pizza-meatball-plate-10th-anniversary"],
        ["36-wing party pack!","All 36 wings in 1 tray. Only 1 flavor per tray. Simply wings in 1 sauce. No Sides, No Dressings.",5900,"philomena-pizza-36-wing-party-pack"],
        ["Choco Chip Cookie with Sea Salt","We make these gooey dough love puddles from scratch and bake them fresh! So many chocolate chips... get your milk ready.",350,"philomena-pizza-choco-chip-cookie-with-sea-salt"],
        ["4PK Parliament - Birds in Paradise Kattle Sour","POG-style Kettle Sour featuring huge notes of Passionfruit, Orange and Guava balanced out by a soft sourness.",2800,"philomena-pizza-4pk-parliament-birds-in-paradise-kattle-"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Pho De Nguyen — gathered 2026-09-09 from own-domain
     they are: Vietnamese
     logo: https://website-cdn.menusifu.com/public/images/Transparent+Logo.png — not cut into a tile yet
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: Task's location 'San Mateo CA' does not match either of the business's two locations (San Bruno, CA and San Francisco, CA); the San Bruno address includes 'San Mateo Ave' as its street name, which is likely the source of the mix-up
     flag: Business operates two locations with different phones and hours: San Bruno (650-873-1388, used here) and San Francisco at 501 6th Street (415-904-9888, Mon-Fri 10am-2am next day, Sat 5pm-11:45pm, Sun 12am-2am) — only the San Bruno location's data is recorded in this file
     flag: Address discrepancy between the business's own pages: phodenguyen.com homepage prints '586-A San Mateo Ave', while the online-ordering platform's store-info footer prints '586 San Mateo Ave' (no '-A')
     flag: No Instagram link or email address found anywhere on phodenguyen.com, despite this task being given an Instagram handle for the business
     flag: A few items appear twice on the ordering menu under different section headers at the same price (e.g. 'Filet Mignon' $8 under both Soups and Sides, 'Noodles' $4 under both Extras and Sides) — likely the same add-on offered in multiple contexts, recorded here as separate entries since sections differ
     flag: One vegetarian item's printed name was truncated on the ordering page ('Fresh Spring Rolls W/' with no object after 'W/'); recorded here as 'Fresh Spring Rolls'
  */
  'pho-de-nguyen': {
    address: "586-A San Mateo Ave, San Bruno, CA 94066",
    phone: "650-873-1388",
    hours: "Tue-Fri 10am-3pm & 4-9pm, Sat 10am-9pm, Sun 10am-8pm, closed Mon",
    cuisine: "Vietnamese",
    tagline: "Vietnamese restaurant known for pho, banh mi, and noodles",
    sections: [
      { name: "Appetizers", items: [
        ["Shrimp Egg Rolls","Fried",800],
        ["Fries","",600],
        ["Salt + Pepper Wings","",1000],
        ["Sticky Wings","",1000],
        ["GlutenFree Sticky Wings","",1000],
        ["Goi Ga","Cold citrus chicken salad with peanuts",1500],
        ["Shrimp Spring Rolls","",1300],
        ["Roast Duck Skin Chips","",1200],
        ["GlutenFree Parmesan Wings","",1000],
        ["The Sampler","2 pork+chicken egg rolls, 2 shrimp egg rolls, 2 roast duck skewers, 2 shrimp spring rolls, 4 sticky wings",2600],
        ["Crab Rangoon (6)","Crispy deep fried wonton stuffed with cream cheese, imitation crab meat, onions",1300],
        ["Deep Fried Wonton (8)","Wonton stuffed with shrimp and pork",1400],
        ["Beef Spring Roll","",1100],
        ["Chicken Spring Roll","",1100],
        ["Imperial Rolls","",1500],
        ["Parmesan Wings","",1000],
        ["Carpaccio","",1900],
        ["Deep Fried Imperial Roll","",1600],
      ] },
      { name: "Soups", items: [
        ["Oxtail Pho Dac Biet","Special combination with oxtail",2200],
        ["Pho Dac Biet","Special combination: filet mignon, flank, brisket, and beef meatballs",1900],
        ["Pho Tai - Rare Angus Steak","Filet mignon",1900],
        ["Pho Bo Vien","Meatballs",1900],
        ["Pho Tai Gau","Rare steak + brisket",1900],
        ["Pho Gau (Brisket Pho)","Brisket only",1900],
        ["Pho Ga","Chicken pho",1900],
        ["Pho Vit Quay","Roast duck pho",2400],
        ["Pho Tom","Shrimp",2000],
        ["Bun Bo Hue","Spicy beef noodle soup, served with thin vermicelli",1900],
        ["Duck Bun Bo Hue","",2800],
        ["Filet Mignon (Soup Topping)","",800],
        ["Wonton Noodles Soup","Shrimp & pork dumpling served in chicken broth egg noodles, topped with bok choy",2000],
        ["Oxtail Pho","Pho served with only oxtails",2600],
      ] },
      { name: "Rice Plates", items: [
        ["Spicy Lemongrass Filet Mignon + Rice","",2300],
        ["Spicy Lemongrass Chicken + Rice","",2100],
        ["Five Spice Chicken + Rice","",2100],
        ["Ca Ri","",1500],
        ["Com Thit Nuong Rice Plate","Rice plate with protein, egg rolls, and fish sauce dressing",2100],
      ] },
      { name: "Vermicelli Bowls", items: [
        ["Bun Thit Nuong Dry Vermicelli Bowl","Dry vermicelli bowl with protein, egg rolls, and fish sauce dressing",2000],
      ] },
      { name: "Garlic Noodles", items: [
        ["Garlic Noodles","",1500],
      ] },
      { name: "Banh Mi", items: [
        ["Beef Short Rib Banh Mi","",1800],
        ["Chicken Salad Banh Mi","",1700],
        ["Lemongrass Beef Banh Mi","",1700],
        ["Lemongrass Chicken Banh Mi","",1700],
        ["Duck Banh Mi","",2000],
      ] },
      { name: "Vegetarian", items: [
        ["Veggie Egg Rolls","",700],
        ["Fresh Spring Rolls","",1300],
        ["Salt + Pepper Tofu","",1300],
        ["Vegan Pho","",1800],
        ["Shaken Leaf W/ Rice","",1600],
        ["Spicy Eggplant + Tofu Stir Fry W/ Rice","",1900],
        ["Tofu Vermicelli Bowl","",1400],
        ["Vegan Ca Ri (Curry)","",1600],
        ["Garlic Bok Choy","",1300],
        ["Vegan Bun Bo Hue","",1100],
      ] },
      { name: "Drinks", items: [
        ["Ca Phe Sua Da","Vietnamese iced coffee with condensed milk",600],
        ["Thai Tea","",600],
        ["Coconut Water","Can",600],
        ["Bottled Water","",250],
        ["Coke","",400],
        ["Diet Coke","",400],
        ["Sprite","",400],
        ["Sunkist","",400],
        ["Coke Zero","",400],
      ] },
      { name: "Extras", items: [
        ["Noodles (Extra)","",400],
        ["Wings (Extra)","",600],
        ["Chicken (Extra)","",400],
        ["Shrimp (Extra)","",600],
        ["Corkage","",1100],
        ["Extra Garnish","",300],
      ] },
      { name: "Catering Menu", items: [
        ["Pork+Chicken Egg Rolls (Catering)","",4100],
        ["Shrimp Egg Rolls (Catering)","",4100],
        ["Vegetarian Egg Rolls (Catering)","",4100],
        ["Chicken Potstickers (Catering)","",5100],
        ["Shrimp Spring Rolls (20 Pcs)","Fresh rice paper rolls + peanut sauce",10100],
        ["Pork Spring Rolls (20 Pcs)","Fresh rice paper rolls + peanut sauce",10100],
        ["Tofu Spring Rolls (20 Pcs)","Fresh rice paper rolls + peanut sauce",10100],
        ["Garlic Pork Banh Mi (10 Pcs)","",16100],
        ["Chicken Banh Mi (10 Pcs)","",16100],
        ["Duck Banh Mi (10 Pcs)","",16100],
        ["Eggplant Tofu Banh Mi (10 Pcs)","",16100],
        ["Fries (Catering)","",3600],
        ["Salt & Pepper Wings (Catering)","Wings for catering are all gluten free",6600],
        ["Sticky Wings (Catering)","",6600],
        ["Parmesan Wings (Catering)","",6600],
        ["Salt & Pepper Tofu (Tray)","",5100],
        ["Garlic Bok Choy (Tray)","",5100],
        ["Garlic String Beans (Tray)","",5100],
        ["Shaken Leaf (Tray)","",8600],
        ["Lemongrass Tofu (Tray)","",8600],
        ["Spicy Eggplant Tofu (Tray)","",8600],
        ["Chicken Lemongrass (Tray)","",9100],
        ["Beef Lemongrass (Tray)","",9100],
        ["Pork Lemongrass (Tray)","",9100],
        ["Shrimp Lemongrass (Tray)","",9100],
        ["Chicken Fried Rice (Tray)","",12100],
        ["Beef Fried Rice (Tray)","",12100],
        ["Pork Fried Rice (Tray)","",12100],
        ["Tofu Fried Rice (Tray)","",12100],
        ["Duck Fried Rice (Tray)","",16100],
        ["Shrimp Fried Rice (Tray)","",16100],
        ["Crab Fried Rice (Tray)","",16100],
        ["Steamed Rice (Tray)","",2100],
        ["Plain Garlic Noodle (Tray)","Stir fry thick egg noodles with butter, garlic, topped with freshly grated parmesan and basil",7600],
        ["Chicken Garlic Noodle (Tray)","Stir fry thick egg noodles with butter, garlic, topped with freshly grated parmesan and basil",12100],
        ["Beef Garlic Noodle (Tray)","Stir fry thick egg noodles with butter, garlic, topped with freshly grated parmesan and basil",12100],
        ["Duck Garlic Noodle (Tray)","Stir fry thick egg noodles with butter, garlic, topped with freshly grated parmesan and basil",12100],
        ["Shrimp Garlic Noodle (Tray)","Stir fry thick egg noodles with butter, garlic, topped with freshly grated parmesan and basil",12100],
        ["Tofu Garlic Noodle (Tray)","Stir fry thick egg noodles with butter, garlic, topped with freshly grated parmesan and basil",12100],
        ["Masabi Ranch Steak w. Chimichurri Sauce (1Lbs) (Tray)","",5100],
        ["Chicken Salad (Carrot) (Tray)","Goi Ga: cold chicken citrus salad with cabbage, carrot, mixed herbs, peanuts, fried shallot",6100],
        ["Chicken Salad (Daikon) (Tray)","Goi Ga: cold chicken citrus salad with cabbage, daikon, mixed herbs, peanuts, fried shallot",6100],
        ["Mixed Greens (Tray)","",4100],
        ["Vermicelli Noodles (S) (Tray)","",2100],
        ["Sugarcane Juice (1/2 Gal)","",3400],
        ["Sugarcane Juice (Gal)","",6000],
        ["Thai Tea (10 Cups)","",5100],
        ["Vietnamese Ice Coffee (10 Cups)","",5100],
      ] },
      { name: "Sides", items: [
        ["Extra Noodles On Side","",400],
        ["Extra Noodles Broth","",800],
        ["Rice","",300],
        ["Broth","",900],
        ["Oxtail","",1100],
        ["Filet Mignon (Side)","",800],
        ["Fried Egg","",300],
        ["Grilled Eggplant","",600],
        ["Vegetables On The Side","",600],
        ["Noodles (Side)","",400],
        ["Vegetables","",600],
        ["Quarter Roast Duck","",1400],
      ] },
      { name: "Sugarcane HQ", items: [
        ["Fresh Pressed Sugarcane Juice","",800],
      ] },
    ],
    siteNote: "Full priced menu taken from the business's own MealKeyway/MenuSifu online-ordering page for the San Bruno location (order.mealkeyway.com, linked from phodenguyen.com); phodenguyen.com's own pages list business info but no text price list, so the JS-rendered ordering page was read via a browser to get prices.",
  },

  /*
     Pho Nation — gathered 2026-09-09 from stopgap
     they are: Vietnamese
     flag: hours, phone and address from the Apple Maps card he sent
     flag: Glenn: the three locations need one consistent brand identity; the same mark is used on all three
     flag: menu is the Alameda location's Yelp listing; the other two are not priced here
  */
  'pho-nation-alameda': {
    address: "1511 Park St, Alameda, CA 94501",
    phone: "(510) 995-8084",
    hours: "Daily 5pm-2am",
    cuisine: "Vietnamese",
    needsSite: true,
    tagline: "Pho, noodle and rice on Park Street, open late",
    items: [
      ["Pho Nation Combo #1","Rice noodles with thin sliced rare steak, briskets, well-done flanks, tripe, and beef meatballs in beef broth.",2185],
      ["Pho Nation Combo #2","Rice noodles with thin sliced rare steak, briskets, and well-done flanks in beef broth.",2185],
      ["Rare Steak & Beef Balls","Rice noodles with thin sliced rare steak and beef meatballs in beef broth.",1955],
      ["Rare Steak & Well Done Briskets","Rice noodles with thin sliced rare steak and well-done briskets in beef broth.",1955],
      ["Well Done Briskets","Rice noodles with well-done briskets in beef broth.",1955],
      ["Rare Steak","Rice noodles with thin sliced rare steak in beef broth.",1955],
      ["Beef Balls","Rice noodles with beef meatballs in beef broth.",2070],
      ["Pho Chicken Breast","Rice noodles with shredded chicken breast meat in chicken broth.",1955],
      ["Pho Chicken Quarter","Rice noodles with bone-in chopped chicken leg quarters in chicken broth.",1955],
      ["Pho Shrimp","Rice noodles with shrimp in chicken broth.",2070],
      ["Plain Pho & Soup","Rice noodles with beef or chicken broth.",1380],
      ["Vegetarian Pho Tofu & Mixed Veggies","Rice noodles with tofu and mixed vegetables in vegetarian broth.",1955],
      ["House Special Vermicelli","Vermicelli noodles and grilled chicken, grilled pork, and grilled shrimp. Served with shredded lettuce, cucumb",2185],
      ["Grilled Chicken Vermicelli","Vermicelli noodles and grilled chicken. Served with shredded lettuce, cucumber, beansprouts, mint, pickled car",1955],
      ["Grilled Pork Vermicelli","Vermicelli noodles and grilled pork. Served with shredded lettuce, cucumber, beansprouts, mint, pickled carrot",1955],
      ["Grilled Shrimp Vermicelli","Vermicelli noodles and grilled shrimp. Served with shredded lettuce, cucumber, beansprouts, mint, pickled carr",2185],
      ["Egg Rolls Vermicelli","Vermicelli noodles and egg rolls. Served with shredded lettuce, cucumber, beansprouts, mint, pickled carrots &",1955],
      ["Vegetarian Tofu & Mixed Veggies Vermicelli","Vermicelli noodles and tofu and mixed vegetables. Served with shredded lettuce, cucumber, beansprouts, mint, p",1840],
      ["Combo Rice Plate #1","Jasmine broken white rice served with grilled pork, shrimp, grilled chicken, lettuce, tomatoes, and a side of",2185],
      ["Combo Rice Plate #2","Jasmine broken white rice served with chicken wings, an egg roll, pork chop, lettuce, tomatoes, cucumber, and",2185],
      ["Grilled Chicken, Salad, & Soup","Jasmine broken white rice served with grilled chicken, lettuce, tomatoes, cucumber, and a side of house chicke",1955],
      ["Grilled Pork, Salad, & Soup","Jasmine broken white rice served with grilled pork, lettuce, tomatoes, cucumber, and a side of house chicken s",1955],
      ["Grilled Pork Chops, Salad, & Soup","Jasmine broken white rice served with grilled pork chops, lettuce, tomatoes, cucumber, and a side of house chi",2070],
      ["Grilled Shrimp, Salad, & Soup","Jasmine broken white rice served with grilled shrimp, lettuce, tomatoes, cucumber, and a side of house chicken",2185],
      ["Grilled Beef Short Ribs, Salad, & Soup","Jasmine broken white rice served with grilled beef short ribs, lettuce, tomatoes, cucumber, and a side of hous",2415],
      ["Steamed Chicken, Salad, & Soup","Jasmine broken white rice served with steamed bone-in chopped chicken leg quarters, lettuce, tomatoes, cucumbe",1955],
      ["Vegetarian Tofu, Mixed Veggies, & Soup","Jasmine broken white rice served with tofu and steamed mixed vegetables, lettuce, tomatoes, cucumber, and a si",1840],
      ["Fried Egg Rolls","chicken, shrimp, and vegetable filling. Vegetarian option are now no longer available for this item.",1035],
      ["Fried Chicken Wings","Please note the flaver you would like. Lemon Pepper - Buffalo - Sweet and sour",1155],
      ["Fried Potstickers","Chicken and vegetable filling.",1035],
      ["Fresh Shrimp Spring Rolls","Comes with a side of peanut dipping sauce. Please ask for fish sauce if you are allergic to peanuts.",1265],
      ["Shrimp Salad","Hand-tossed shrimp, shredded cabbage, carrots, onions, mixed herbs with a sweet and savory fish sauce vinaigre",1495],
      ["Chicken Salad","Hand-tossed shredded chicken breast, shredded cabbage, carrots, onions, mixed herbs with a sweet and savory fi",1380],
      ["Fried Chicken Skin","Spicy. Please let us know if you do not want it spicy.",1265],
      ["Deep Fried Tofu","Spicy. Please let us know if you do not want it spicy.",920],
      ["Deep Fried Calamari","Spicy. Please let us know if you do not want it spicy.",1150],
    ],
    siteNote: "From the menu on their Yelp page, the one Glenn sent, which Yelp notes may not be up to date.",
  },

  /*
     Pho Nation — gathered 2026-09-09 from stopgap
     they are: Vietnamese
     flag: hours, phone and address from the Apple Maps card he sent; the Square site lists this location for ordering
     flag: menu: 46 items read from https://pho-nation.square.site/?location=LGATRB6HCK6A2#LADTEUMGQEBBOTYMOVSF6DGH on 2026-09-04
  */
  'pho-nation-newark': {
    address: "6259 Jarvis Ave, Newark, CA 94560",
    phone: "(510) 894-2584",
    hours: "Daily 11am-9pm",
    cuisine: "Vietnamese",
    needsSite: true,
    tagline: "Pho, noodle and rice on Jarvis Avenue, order online for pickup",
    sections: [
      { name: "Noodle soups", items: [
        ["1. PHO NATION COMBO #1 | PHỞ ĐẶC BIỆT BÒ VIÊN #1","Pho beef noodle soup. Combination contains thinly sliced rare steaks, briskets, flanks, tripes and beef balls.",1695,"pho-nation-newark-1-pho-nation-combo-1-ph-c-bi-t-b-vi-n-1","from $16.95"],
        ["10. PHO SHRIMP | PHỞ TÔM","Pho shrimp noodle soup. Served with shrimps, noodle and chicken broth. Also a sprinkle of fried shallot.",1595,"pho-nation-newark-10-pho-shrimp-ph-t-m","from $15.95"],
        ["12. VEGETARIAN PHO TOFU + MIXED VEGGIES | PHỞ CHAY","Vegetarian pho made with mushroom seasoning broth, no MSG. Comes with fried tofu, broccoli, zucchini, carrot and white mushroom. Made fresh every time.",1495,"pho-nation-newark-12-vegetarian-pho-tofu-mixed-veggies-ph-","from $14.95"],
        ["11. PLAIN PHO + SOUP | PHỞ KHÔNG","Plain pho noodle soup. Contains just noodle and soup. You can choose beef, chicken or vegetarian broth",1095,"pho-nation-newark-11-plain-pho-soup-ph-kh-ng","from $10.95"],
        ["3. RARE STEAK + BEEF BALLS | PHỞ TÁI BÒ VIÊN","Pho beef noodle soup. Combination contains thinly sliced rare steak and beef balls.",1595,"pho-nation-newark-3-rare-steak-beef-balls-ph-t-i-b-vi-n","from $15.95"],
        ["5. WELL DONE BRISKETS | PHỞ GẦU","Pho beef noodle soup serve with only briskets.",1595,"pho-nation-newark-5-well-done-briskets-ph-g-u","from $15.95"],
        ["6. RARE STEAK | PHỞ TÁI","Pho beef noodle soup. Serve with thinly sliced rare steak.",1595,"pho-nation-newark-6-rare-steak-ph-t-i","from $15.95"],
        ["2. PHO NATION COMBO #2 | PHỞ ĐẶC BIỆT #2","Pho beef noodle soup combo#2. Combination comes with thinly sliced rare steak, well done brisket and flanks.",1695,"pho-nation-newark-2-pho-nation-combo-2-ph-c-bi-t-2","from $16.95"],
        ["7. BEEF BALLS | PHỞ BÒ VIÊN","Pho beef noodle soup. Comes with only beef balls.",1595,"pho-nation-newark-7-beef-balls-ph-b-vi-n","from $15.95"],
        ["8. PHO CHICKEN BREAST | PHỞ GÀ","Pho chicken noodle soup. Comes with shredded white chicken breast.",1595,"pho-nation-newark-8-pho-chicken-breast-ph-g","from $15.95"],
        ["9. PHO CHICKEN QUARTERS | PHỞ GÀ CÓ XƯƠNG","Pho chicken noodle soup. Comes with chicken leg quarter bone and skin, chopped in smaller pieces. Enjoy with ginger sauce.",1595,"pho-nation-newark-9-pho-chicken-quarters-ph-g-c-x-ng","from $15.95"],
        ["4. RARE STEAK + WELL DONE BRISKETS | PHỞ TÁI GẦU","Pho beef noodle soup. Combination contains thinly sliced rare steak and well done briskets.",1595,"pho-nation-newark-4-rare-steak-well-done-briskets-ph-t-i-g","from $15.95"],
      ] },
      { name: "Vermicelli", items: [
        ["13. HOUSE SPECIAL VERMICELLI | BÚN ĐẶC BIỆT","House special vermicelli. Served with grilled chicken, grilled pork, three grilled shrimps, vermicelli noodle, thinly sliced round lettuce, cucumber",1895,"pho-nation-newark-13-house-special-vermicelli-b-n-c-bi-t"],
        ["14. GRILLED CHICKEN VERMICELLI | BÚN GÀ NƯỚNG","Grilled chicken vermicelli. Served with grilled chicken, vermicelli noodle, thinly sliced round lettuce, cucumber, beansprouts",1695,"pho-nation-newark-14-grilled-chicken-vermicelli-b-n-g-n-ng"],
        ["15. GRILLED PORK VERMICELLI | BÚN THỊT HEO NƯỚNG","Grilled pork vermicelli. Served with grilled pork, vermicelli noodle, thinly sliced round lettuce, cucumber, beansprouts",1695,"pho-nation-newark-15-grilled-pork-vermicelli-b-n-th-t-heo-"],
        ["17. EGGROLLS VERMICELLI | BÚN CHẢ GIÒ","Egg roll vermicelli. Served with 4 egg rolls, vermicelli noodle, thinly sliced round lettuce, cucumber, beansprouts, pickled carrot daikon and roast peanuts",1695,"pho-nation-newark-17-eggrolls-vermicelli-b-n-ch-gi"],
        ["16. GRILLED SHRIMPS VERMICELLI | BÚN TÔM NƯỚNG","Grilled shrimps vermicelli. Served with 9 grilled shrimps, vermicelli noodle, thinly sliced round lettuce, cucumber, beansprouts",1695,"pho-nation-newark-16-grilled-shrimps-vermicelli-b-n-t-m-n-"],
        ["18. VEGETARIAN TOFU + MIXED VEGGIES VERMICELLI | BÚN ĐẬU HỦ CHAY","Vegetarian tofu and mixed veggies vermicelli. Served with fried tofu, broccoli, white mushroom, sliced zucchini and carrot. Also contains vermicelli noodle",1595,"pho-nation-newark-18-vegetarian-tofu-mixed-veggies-vermice"],
        ["48. BEEF ONION VERMICELLI","Beef stir fry with yellow onion. Served with vermicelli noodle, thinly sliced round lettuce, cucumber, beansprout, pickled carrot daikon and roasted peanuts",1695,"pho-nation-newark-48-beef-onion-vermicelli"],
      ] },
      { name: "Rice plates", items: [
        ["19. COMBO RICE PLATE #1 | CƠM ĐẶC BIỆT #1","Combo rice plate #1. Served with grilled chicken, grilled pork and 3 grilled shrimps and a small salad.",1895,"pho-nation-newark-19-combo-rice-plate-1-c-m-c-bi-t-1"],
        ["20. COMBO RICE PLATE #2 | CƠM ĐẶC BIỆT #2","Combination rice plate comes with 1 grilled pork chop, 2 fried chicken wings, 1 egg roll. Also includes bowl of rice and a small salad.",1895,"pho-nation-newark-20-combo-rice-plate-2-c-m-c-bi-t-2"],
        ["21. GRILLED CHICKEN RICE + SALAD | CƠM GÀ NƯỚNG","Rice plate serve with grilled chicken and a small salad.",1695,"pho-nation-newark-21-grilled-chicken-rice-salad-c-m-g-n-ng"],
        ["22. GRILLED PORK RICE + SALAD | CƠM THỊT HEO NƯỚNG","Rice plate serve with grilled pork and a small salad.",1695,"pho-nation-newark-22-grilled-pork-rice-salad-c-m-th-t-heo-"],
        ["23. GRILLED PORKCHOP RICE + SALAD | CƠM SƯỜN HEO NƯỚNG","Rice plate serve with two grilled pork chops and a small salad",1795,"pho-nation-newark-23-grilled-porkchop-rice-salad-c-m-s-n-h"],
        ["24. GRILLED SHRIMPS RICE + SALAD | CƠM TÔM NƯỚNG","Rice plate serve with 9 grilled shrimps and a small salad.",1695,"pho-nation-newark-24-grilled-shrimps-rice-salad-c-m-t-m-n-"],
        ["25. GRILLED BEEF SHORT RIBS RICE + SALAD | CƠM SƯỜN BÒ NƯỚNG","Rice plate serve with strips of beef short rib and a small salad.",2095,"pho-nation-newark-25-grilled-beef-short-ribs-rice-salad-c-"],
        ["26. STEAMED CHICKEN RICE + SALAD | CƠM GÀ HẤP","Rice plate serve with steamed chicken leg quarter with bone and skin chopped into small pieces. Also includes salad and ginger sauce.",1695,"pho-nation-newark-26-steamed-chicken-rice-salad-c-m-g-h-p"],
        ["27. VEGETARIAN TOFU + MIXED VEGGIES RICE | CƠM ĐẬU HỦ CHAY","Rice plate comes with fried tofu, broccoli, white mushroom, sliced zucchini and carrot. Also comes with small salad.",1595,"pho-nation-newark-27-vegetarian-tofu-mixed-veggies-rice-c-"],
        ["49. BEEF ONION RICE PLATE + SALAD","Beef is stir fry with yellow onion, served with rice and salad.",1695],
      ] },
      { name: "Appetizers", items: [
        ["29. FRIED CHICKEN WINGS | CÁNH GÀ CHIÊN","Fried chicken wings.",995,"pho-nation-newark-29-fried-chicken-wings-c-nh-g-chi-n"],
        ["30. FRIED SHRIMP ROLLS | TÔM CUỐN CHIÊN","5 whole shrimp wrapped in egg wrap fried.",995,"pho-nation-newark-30-fried-shrimp-rolls-t-m-cu-n-chi-n"],
        ["28. FRIED EGG ROLLS | CHẢ GIÒ","Item comes with four egg rolls which contains chicken and shrimp. No pork.",995,"pho-nation-newark-28-fried-egg-rolls-ch-gi"],
        ["33. VEGETARIAN SPRING ROLLS | GỎI CUỐN CHAY","2 long rolls of fresh spring rolls using fried tofu. Also contains vermicelli, beansprout and long lettuce. Enjoy with peanut sauce.",995,"pho-nation-newark-33-vegetarian-spring-rolls-g-i-cu-n-chay"],
        ["32. FRESH SHRIMP SPRING ROLLS | GỎI CUỐN TÔM","2 long rolls of fresh shrimp spring roll cut in half served with peanut sauce. Contains shrimp, vermicelli, beansprout and long lettuce.",995,"pho-nation-newark-32-fresh-shrimp-spring-rolls-g-i-cu-n-t-"],
      ] },
      { name: "Drinks", items: [
        ["34. VN ICE COFFEE MILK | VN CAFÉ SỬA ĐÁ","",595,"pho-nation-newark-34-vn-ice-coffee-milk-vn-caf-s-a"],
        ["35. VN BLACK ICE COFFEE | VN CAFÉ DEN ĐÁ","",495,"pho-nation-newark-35-vn-black-ice-coffee-vn-caf-den"],
        ["36. THAI ICE TEA | TRÀ THÁI","",550,"pho-nation-newark-36-thai-ice-tea-tr-th-i"],
        ["39. FRESH LEMONADE | NƯỚC CHANH","",495,"pho-nation-newark-39-fresh-lemonade-n-c-chanh"],
        ["40. SODA | NƯỚC NGỌT","",195,"pho-nation-newark-40-soda-n-c-ng-t"],
        ["41. BOTTLED WATER | BÌNH NƯỚC","",195,"pho-nation-newark-41-bottled-water-b-nh-n-c"],
      ] },
      { name: "Smoothies", items: [
        ["42. AVOCADO | BƠ","",695,"pho-nation-newark-42-avocado-b"],
        ["44. STRAWBERRY | DÂU","",595,"pho-nation-newark-44-strawberry-d-u"],
        ["45. STRAWBERRY BANANA | DÂU CHUOY","",595,"pho-nation-newark-45-strawberry-banana-d-u-chuoy"],
        ["43. MANGO | XOÀI","",595,"pho-nation-newark-43-mango-xo-i"],
        ["46. PEACH | DÂO","",595,"pho-nation-newark-46-peach-d-o"],
        ["47. WILDBERRY","",595,"pho-nation-newark-47-wildberry"],
      ] },
    ],
    siteNote: "Prices and photos are from their own Square ordering page.",
  },

  /*
     Pho Nation SF — gathered 2026-09-09 from stopgap
     they are: Vietnamese
     flag: Glenn wrote 'San Bruno' for this one; it is San Bruno Avenue in San Francisco, so it sits on San Francisco's page
     flag: address from the profile card he sent; no phone or hours published there
  */
  'pho-nation-sf': {
    address: "2428 San Bruno Ave, San Francisco, CA 94134",
    cuisine: "Vietnamese",
    needsSite: true,
    tagline: "Pho, noodle and rice on San Bruno Avenue in the Portola",
    contactOnly: "Pho, noodle and rice on San Bruno Avenue in the Portola. They publish no prices online.",
  },

  /*
     Pijja Paradise — gathered 2026-09-09 from own-domain
     they are: Indian pizza
     flag: a third location in Fresno is on their site and is not seated here
     flag: Glenn delivers to this one weekly and plans to show the owner her page
     flag: Menu sweep 2026-09-09: Prices are from Pijja Paradise's own dedicated website for the Livermore location, pijjaparadiselivermore.com (its menu/order page).
     flag: Menu sweep 2026-09-09: Displayed prices are non-round numbers (e.g. $18.71, $23.39, $53.81) that are close to common round base prices multiplied by about 1.17 (e.g. $15.99x1.17=$18.71; $19.99x1.17=$23.39), suggesting an online-ordering surcharge of roughly 17% is baked into every price shown on this page.
     flag: Menu sweep 2026-09-09: Pittsburg and Livermore show different menus and different prices for similarly named pizzas (e.g. Livermore 'Cheese Pizza' $18.71 vs Pittsburg 'Cheese Pizza / Create Your Own Pizza' $19.55+) even though both are Pijja Paradise locations — recorded as two separate menus as instructed, not one shared
     flag: Menu sweep 2026-09-09: 'Soda' is listed at $3.50 in both a 'Desserts' block and a 'Drinks' block on this page; recorded once, under Drinks.
     flag: Menu sweep 2026-09-09: 'Side Jalapeno' ($1.17) is listed under both 'Appetizers' and a separate 'Sides' heading on this page; recorded once, under Appetizers.
     flag: Menu sweep 2026-09-09: The business's main domain pijjaparadise.com is unreachable (SSL/TLS handshake failure); this Livermore data instead comes from the location's own dedicated domain, pijjaparadiselivermore.com.
     flag: Menu sweep 2026-09-09: A third location (Fresno, 2767 W Shaw Ave 106, Fresno CA 93711) exists per pijjaparadise.menufy.com/locations, in addition to the two requested.
     flag: Menu sweep 2026-09-09: menufy.com lists the Livermore address with a suite number ('922 Larkspur Dr A1') while pijjaparadiselivermore.com omits the suite.
     flag: Menu sweep 2026-09-09: No Instagram link or logo image URL found on pijjaparadiselivermore.com; no email address found either.
  */
  'pijja-paradise-livermore': {
    address: "922 Larkspur Dr Suite A1, Livermore, CA 94551",
    phone: "(925) 800-5934",
    hours: "Mon-Sun 9am-11pm",
    cuisine: "Indian pizza",
    tagline: "Indian-style pizza on Larkspur Drive",
    sections: [
      { name: "Pizzas", items: [
        ["Cheese Pizza","",1871],
        ["Chili Paneer Pizza","",2339],
        ["Butter Chicken Pizza","",2339],
        ["Heart Attack Pizza","",2339],
        ["Achari Chicken Pizza","",2339],
        ["Tandoori Chicken Pizza","",2339],
        ["Garden Vegetarian Pizza","",2339],
        ["Tandoori Paneer Pizza","",2339],
        ["Achari Paneer Pizza","",2339],
        ["Chicken Tikka Masala Pizza","",2339],
        ["California Chicken Club Pizza","",2339],
        ["Royal Shahi Paneer Pizza","",2339],
        ["Curry Chicken Pizza","",2339],
        ["Achari Gobi Pizza","",2339],
        ["World Meatijja Pizza","",2339],
        ["Aloha Pineapple Express Pizza","",2339],
        ["BBQ Chicken Lovers Pizza","",2339],
        ["Greek Pizza","",2339],
        ["Garlic Vegetarian Pizza","",2339],
        ["Mexican Taco Pizza","",2339],
        ["You Say Potato Pizza!!!","",2339],
        ["Curry Paneer Pizza","",2339],
        ["Veggie Curry Pizza","",2339],
        ["World Supreme Pizza","",2339],
        ["Lamb Kabab Pizza","",2573],
      ] },
      { name: "Appetizers", items: [
        ["Side Jalapeno","",117],
        ["Side Ranch Dressing","",139],
        ["Regular Fries","",584],
        ["Veg Samosa","",584],
        ["Truffle Fries","",935],
        ["Garlic Fries","",935],
        ["Cheesey Fries","",935],
        ["Chicken Tenders","",935],
        ["Garlic Sticks with Cheese","",1052],
        ["Potato Munchies","",1052],
        ["Jalapeno Peppers","",1052],
        ["Cauliflower Bites","",1052],
        ["Mozzarella Sticks","",1052],
        ["Fried Mushrooms","",1052],
        ["Boneless Wings","",1169],
        ["Indian Masala Breadsticks","",1169],
        ["Pesto Garlic Sticks","",1169],
        ["Traditional Wings","",1169],
        ["Paneer Tikka Quesadilla","",1169],
        ["Mac & Cheese","",818],
        ["Loaded Fries","",1286],
        ["Loaded Mac & Cheese","",1286],
        ["Achari Chicken Wings","",1286],
        ["Tandoori Chicken Wings","",1286],
        ["Chicken Tikka Quesadilla","",1286],
        ["Buffalo Mac & Cheese","",1286],
      ] },
      { name: "Burgers & Sandwiches", items: [
        ["Hamburger","",935],
        ["Cheeseburger","",1052],
        ["Veggie Patty Burger","",1052],
        ["Crispy Chicken Sandwich","",1052],
        ["Spicy Chicken Sandwich","",1169],
        ["Veggie Patty Noodles Burger","",1286],
        ["Butter Chicken Sandwich","",1286],
        ["Paneer Tikka Sandwich","",1286],
        ["Italian Sandwich","",1286],
        ["Mushroom Swiss Burger","",1286],
        ["Shahi Paneer Sandwich","",1286],
        ["Tandoori Chicken Sandwich","",1286],
        ["Tandoori Paneer Sandwich","",1286],
        ["Grilled Chicken Sandwich","",1286],
        ["Pastrami Cheese Burger","",1403],
        ["Double Cheeseburger","",1403],
        ["Avocado Swiss Burger","",1403],
        ["BBQ Bacon Cheeseburger","",1403],
        ["Pastrami Swiss Sandwich","",1520],
        ["Heart Attack Burger","",1754],
        ["5 Patty Cheeseburger","",2807],
      ] },
      { name: "Salads", items: [
        ["Caesar Salad","",1169],
        ["Greek Salad","",1286],
        ["Tandoori Chicken Salad","",1520],
        ["High Protein Salad","",1520],
        ["Garden Salad","",1886],
      ] },
      { name: "Calzones", items: [
        ["The Cheesy Trio Calzone","",1871],
      ] },
      { name: "Desserts", items: [
        ["Ice Cream Dollies","",233],
        ["Ice Cream Conical Kulfi","",350],
        ["Ice Cream Cylindrical Kulfi","",350],
        ["Ice Cream Cups","",350],
        ["Ice Cream Cones","",467],
        ["Ice Cream Cassatta","",584],
        ["Tiramisu","",701],
        ["Cheesecake","",701],
        ["Sticky Toffee Pudding","",701],
        ["Mini Churros","",818],
        ["Nutella Pizza","",1169],
        ["Chocolate Chip Cookie Pizza","",1169],
        ["Ice Cream Matka Box","",1286],
        ["Ice Cream Cake","",1403],
        ["Dubai Chocolate Pizza","",2105],
      ] },
      { name: "Drinks", items: [
        ["Water","",174],
        ["Soda","",350],
        ["Fresh Hazy IPA","",935],
      ] },
      { name: "Catering", items: [
        ["Greek Salad Catering","Catering tray",5381],
        ["Tandoori Chicken Salad Catering","Catering tray",5381],
        ["High Protein Salad Catering","Catering tray",5381],
        ["Garden Salad Catering","Catering tray",5381],
        ["Caesar Salad Catering","Catering tray",5381],
      ] },
    ],
    siteNote: "Prices are from Pijja Paradise's own dedicated website for the Livermore location, pijjaparadiselivermore.com (its menu/order page).",
  },

  /*
     Pijja Paradise — gathered 2026-09-09 from own-domain
     they are: Indian pizza
     flag: pijjaparadise.com renders only with JavaScript, so the menu could not be read
     flag: addresses and numbers from their own site's location list, as he sent it
     flag: Menu sweep 2026-09-09: Prices are from Pijja Paradise's own order.online storefront for the Pittsburg location (order.online/store/pijja-paradise-pittsburg-29028324); the business's main domain, pijjaparadise.com, could not be reached from this environment (SSL/TLS handshake failure).
     flag: Menu sweep 2026-09-09: pijjaparadise.com (the business's main domain) is unreachable from this environment: HTTPS fails with an SSL/TLS handshake failure and plain HTTP returns 409; every fact here therefore comes from the business's own order.online storefront rather than the primary site.
     flag: Menu sweep 2026-09-09: Chain has at least 3 locations per pijjaparadise.menufy.com/locations: Pittsburg, Livermore, and Fresno (2767 W Shaw Ave 106, Fresno, CA 93711) — Fresno was not one of the two requested but exists.
     flag: Menu sweep 2026-09-09: Address formatting differs slightly between sources: menufy.com lists '2961 Railroad Avenue, Pittsburg, CA 94565' while order.online lists '2961 Railroad Ave, Pittsburg CA 94565-5224'.
     flag: Menu sweep 2026-09-09: Two distinct items are both named 'Lamb Kabab Burger' on the same order.online storefront, with different descriptions and prices ($15.00 vs $9.20); kept as two separate entries, the second labeled '(Lamb Patty)' here for clarity.
     flag: Menu sweep 2026-09-09: The order.online page shows 'Online ordering hours: 9:30 AM-11:25 PM', which looks like a single day's live window rather than a posted weekly schedule; no hours are published on any reachable page for this location, so hours is null.
     flag: Menu sweep 2026-09-09: No Instagram link, logo image, phone-verified-elsewhere, or email address found on any reachable page for this location.
     flag: Menu sweep 2026-09-09: The ordering page displays a 'Get $10 off any order of $50 or more' promo banner; not reflected in item prices.
     flag: Menu sweep 2026-09-09: This is treated as site_kind 'ordering-platform' rather than 'own-domain' because the business's own domain never loaded for this location.
  */
  'pijja-paradise-pittsburg': {
    address: "2961 Railroad Ave, Pittsburg, CA 94565",
    phone: "(925) 267-4833",
    cuisine: "Indian pizza",
    tagline: "Indian-style pizza on Railroad Avenue",
    sections: [
      { name: "Pizza", items: [
        ["Create Your Own Pizza","Create your own pizza with any toppings",1955,null,"from"],
        ["Pepperoni Pizza","Our crispy cup pepperoni pizza",1955,null,"from"],
        ["Cheese Pizza","Create your own pizza with any toppings",1955,null,"from"],
        ["Peri Peri Chicken Pizza","Homemade tangy peri-peri sauce, onions, red peppers, marinated spicy chicken & fresh cilantro",2000,null,"from"],
        ["Peri Peri Paneer Pizza","Homemade tangy peri-peri sauce, onions, red peppers, marinated spicy paneer & fresh cilantro",2000,null,"from"],
        ["Small World Supreme","Pijja Paradise combination with salami, pepperoni, mushrooms, onion, bell pepper, Italian sausage",2300,null,"from"],
        ["Tandoori Paneer Pizza","Homemade eggless tandoori sauce, onions, bell pepper, tomato, jalapenos, tandoori paneer with fresh cilantro & green onions",2300,null,"from"],
        ["Small World Meatijja","All meat combo with salami, pepperoni, ham, beef & sausage",2300,null,"from"],
        ["Garden Vegetarian","Mushrooms, olives, bell pepper, onion, diced tomatoes",2300,null,"from"],
        ["California Chicken Club","Creamy garlic sauce, grilled chicken, crispy bacon, diced tomatoes & fresh cilantro",2300,null,"from"],
        ["BBQ Chicken Lovers","Tangy BBQ sauce, grilled chicken, crispy bacon & diced tomato",2300,null,"from"],
        ["Aloha Pineapple Express","Straight from Hawaii with sliced pineapple and ham with loads of cheese",2300,null,"from"],
        ["Greek Pizza","Mediterranean style with pesto sauce, spinach, feta cheese, greek olives & sundried tomatoes",2300,null,"from"],
        ["Garlic Vegetarian","Garlic vegetarian combo with mushrooms, spinach, red onions, broccoli & diced tomato",2300,null,"from"],
        ["Mexican Taco Pizza","Mexican taco style with ground beef, taco seasoning, fresh lettuce, beans, cheddar blend, diced tomato, jalapenos & green onion",2300,null,"from"],
        ["HeartAttack Pizza","Tons of pepperoni with loads of cheese",2300,null,"from"],
        ["You Say Potato!!!","Pesto sauce, roasted garlic, onions, crispy sliced potato with truffle oil drizzle and parmesan cheese",2300,null,"from"],
        ["Achari Paneer Pizza","Creamy garlic sauce, onion, tomato, bell pepper, jalapenos & marinated achari paneer",2300,null,"from"],
        ["Tandoori Chicken Pizza","Homemade tandoori sauce, onions, bell peppers, diced tomato, marinated tandoori chicken, jalapenos, fresh green onion & cilantro",2300,null,"from"],
        ["Butter Chicken Pizza","Homemade butter sauce, onions, diced tomato, buttered marinated chicken, fresh green onion & cilantro",2300,null,"from"],
        ["Chicken Tikka Masala Pizza","Tikka sauce, onions, bell pepper, ginger, garlic, diced tomato, marinated chicken tikka, fresh cilantro",2300,null,"from"],
        ["Curry Chicken Pizza","Homemade curry sauce, onion, fresh garlic, diced tomato, marinated chicken, fresh green onion & cilantro",2300,null,"from"],
        ["Achari Chicken Pizza","Creamy garlic sauce, onion, bell pepper, jalapeno, diced tomato, grilled chicken, fresh green onion & cilantro",2300,null,"from"],
        ["Royal Shahi Paneer","Eggless butter sauce, mushrooms, onion, diced tomato, buttered marinated paneer, fresh green onion & cilantro",2300,null,"from"],
        ["Curry Paneer Pizza","Eggless curry sauce, red onions, bell pepper, fresh garlic, diced tomato, marinated paneer, fresh green onion & cilantro",2300,null,"from"],
        ["Chili Paneer Pizza","Eggless curry sauce, red onions, bell pepper, fresh garlic, diced tomato, marinated paneer, green chilli, jalapenos, fresh green onion & cilantro",2300,null,"from"],
        ["Lamb Kabab Pizza","Rich & creamy homemade garlic sauce, sauteed red onions, flavorful marinated halal lamb with a sprinkle of cilantro",2300,null,"from"],
        ["Achari Gobi Pizza","Creamy garlic sauce, onions, bell pepper, diced tomato with achari gobhi",2300,null,"from"],
      ] },
      { name: "Appetizers", items: [
        ["Aloo Puff Patty 2Pcs","Homemade crispy puff potato patty fresh from the oven",690,null,"from"],
        ["Cauliflower Bites","Cauliflower (gobhi) battered and deep fried until crispy",1150,null,"from"],
        ["Cheesey Fries","Crispy fries loaded with cheese sauce",920,null,"from"],
        ["Chicken Tikka Quesadilla","Mexican quesadilla with chicken tikka, onions, & bell pepper",1380,null,"from"],
        ["Heineken 12 FL Oz.","",746,null,"from"],
        ["Paneer Tikka Quesadilla","Mexican quesadilla with our special paneer tikka, onion, bell pepper stuffed in it",1610,null,"from"],
        ["Tandoori Sauce","",115,null,"from"],
        ["Chicken Tenders","",920,null,"from"],
        ["Garlic Sticks with Cheese","",1150,null,"from"],
        ["Pesto Garlic Sticks","Pesto garlic sticks with cheese",1265,null,"from"],
        ["Indian Masala Breadsticks","Indian masala breadsticks with jalapeno and pineapple with homemade masala",1380,null,"from"],
        ["Mozzarella Sticks","",1150,null,"from"],
        ["Jalapeno Poppers","Jalapeno poppers filled with cream cheese",1380,null,"from"],
        ["Regular Fries","",575,null,"from"],
        ["Truffle Fries","Fries with truffle aioli and parmesan",920,null,"from"],
        ["Garlic Fries","Fries with garlic sauce & parsley",920,null,"from"],
        ["Loaded Fries","Fries with crispy bacon or beef, onions & fresh green onions",1265,null,"from"],
        ["Mac & Cheese","",920,null,"from"],
        ["Buffalo Mac & Cheese","Crispy spicy buffalo chicken loaded with mac",1265,null,"from"],
        ["Loaded Mac & Cheese","Loaded mac & cheese with crispy bacon, onions & fresh green onions",1265,null,"from"],
        ["Fried Mushrooms","",1035,null,"from"],
        ["Veg Samosa (2 Pc)","",690,null,"from"],
      ] },
      { name: "Burgers and Sandwiches", items: [
        ["All American Double Smash","Double beef patties, crispy bacon, gooey american cheese, crisp lettuce, fresh tomato, dill pickles, and zingy onions between two soft buns",1380,null,"from"],
        ["Heart Attack Burger","Two juicy 1/3 lb beef patties with 4 slices of american cheese & loaded with 3 mozzarella sticks",1725,null,"from"],
        ["Italian Sandwich","Italian style sandwich with ham & salami",1265,null,"from"],
        ["Lamb Kabab Burger","Juicy marinated lamb kabab on burger bun with Paradise sauce, onion, lettuce, tomato & pickles",1500,null,"from"],
        ["Parantha Smash Burger","Flaky, buttery, layered unleavened flatbread with two smashed beef patties, loads of cheese and caramelized onion",1500,null,"from"],
        ["Parantha Veggie Noodle Burger","Crispy flaky parantha with veggie patty, lettuce, onion, tomato with homemade sauce",1500,null,"from"],
        ["Pastrami Cheese Burger","Pastrami cheese burger with swiss cheese loaded with onion, lettuce, tomato and Paradise sauce",1380,null,"from"],
        ["Pastrami Swiss Sandwich","Pastrami swiss sandwich with onion, lettuce, tomato and pickles",1495,null,"from"],
        ["Veggie Patty Burger","Original homemade veggie patty with Paradise sauce, onions, potato, lettuce, pickles on a soft bun",1035,null,"from"],
        ["Veggie Patty Noodles Burger","Indian street burger with veggie noodles loaded on hamburger bun, onion, tomato and tamarind sauce",1265,null,"from"],
        ["5 Patty Cheeseburger","Five 1/3 lb fresh beef patties with lettuce, onion, tomato, pickles on secret sauce",2243,null,"from"],
        ["BBQ Bacon Cheeseburger","1/3 lb fresh beef patty with bacon, lettuce, onion, tomato, pickles on secret sauce with BBQ drizzle",1380,null,"from"],
        ["Butter Chicken Sandwich","Grilled chicken on butter sauce with onion, sliced tomato and pickles",1265,null,"from"],
        ["Cheeseburger","1/3 lb fresh beef patty with lettuce, onion, tomato, pickles on secret sauce",1150,null,"from"],
        ["Crispy Chicken Sandwich","Crispy chicken with secret sauce, onion, sliced tomato & pickles",1150,null,"from"],
        ["Double Cheeseburger","Double 1/3 lb fresh beef patty with lettuce, onion, tomato, pickles on secret sauce",1380,null,"from"],
        ["Grilled Chicken Sandwich","Grilled chicken with secret sauce, onion, sliced tomato & pickles",1265,null,"from"],
        ["Lamb Kabab Burger (Lamb Patty)","Lamb patty with lettuce, onion, tomato, pickles on secret sauce",920,null,"from"],
        ["Mushroom Swiss Burger","1/3 lb fresh beef patty with lettuce, onion, tomato, pickles on secret sauce with swiss cheese and grilled mushroom",1265,null,"from"],
        ["Shahi Paneer Sandwich","Indian style paneer sandwich with malai sauce",1265,null,"from"],
        ["Spicy Chicken Sandwich","Crispy spicy chicken with secret sauce, onion, sliced tomato & pickles",1150,null,"from"],
        ["Tandoori Chicken Sandwich","Grilled chicken with lettuce, onion, tomato, pickles on tandoori sauce",1265,null,"from"],
        ["Tandoori Paneer Sandwich","Grilled tandoori paneer on tandoori sauce, onions, lettuce, tomato on a soft bun",1265,null,"from"],
      ] },
      { name: "Salads", items: [
        ["Garden Salad","",1265,null,"from"],
        ["Caesar","Romaine hearts, garlic croutons, shaved parmesan & caesar dressing",1150,null,"from"],
        ["Greek Salad","",1265,null,"from"],
        ["Tandoori Chicken Salad","",1495,null,"from"],
        ["High Protein Salad","",1495,null,"from"],
      ] },
      { name: "Desserts", items: [
        ["Paradise Chocolate Pizza","Kunafa pistachio cream base topped with a drizzle of rich chocolate and powdered sugar",1725,null,"from"],
        ["Sticky Toffee Pudding","One of the most selling desserts",805,null,"from"],
        ["Nutella Pizza","Heart-shape Nutella pizza",1380,null,"from"],
        ["Chocolate Chip Pizza","Chocolate chip cookie pizza",1265,null,"from"],
        ["Mini Churros 16pcs","",805,null,"from"],
        ["Cheesecake","",690,null,"from"],
        ["Tiramisu","",690,null,"from"],
      ] },
      { name: "Drinks", items: [
        ["Crush Orange","",460,null,"from"],
        ["Diet Pepsi","",690,null,"from"],
        ["Jarritos Pineapple","",460,null,"from"],
        ["Pepsi","",345,null,"from"],
        ["Starry","",690,null,"from"],
        ["Water","",230,null,"from"],
        ["Lemonade","",460,null,"from"],
        ["Jarritos Mandarian","",460,null,"from"],
      ] },
      { name: "Sides", items: [
        ["BBQ Sauce","",200,null,"from"],
        ["Buffalo Sauce","",150,null,"from"],
        ["Jalapeno","",115,null,"from"],
        ["Ranch","",115,null,"from"],
      ] },
      { name: "Halal", items: [
        ["Halal Wings","Crispy wings with choice of your flavors",1495,null,"from"],
        ["Halal Combo Pizza","Halal beef pepperoni, mushroom, onion, bell pepper, tomatoes, halal lamb",2414,null,"from"],
        ["Halal Lamb Kabab Pizza","Lamb kabab, creamy white sauce, red onions, and fresh cilantro on a pizza",2530,null,"from"],
        ["Halal Pepperoni Pizza","Housemade red sauce, beef pepperoni, mozzarella",2070,null,"from"],
      ] },
      { name: "Chicken Wings", items: [
        ["Achari Chicken Wings","Pijja special tangy achari wings",1495,null,"from"],
        ["Boneless Wings","Crispy boneless wings with choice of your flavors",1380,null,"from"],
        ["Tandoori Chicken Wings","Pijja special tandoori spicy wings",1495,null,"from"],
        ["Traditional Wings","Crispy wings with choice of your flavors",1495,null,"from"],
      ] },
    ],
    siteNote: "Prices are from Pijja Paradise's own order.online storefront for the Pittsburg location (order.online/store/pijja-paradise-pittsburg-29028324); the business's main domain, pijjaparadise.com, could not be reached from this environment (SSL/TLS handshake failure).",
  },

  /*
     Pizzeria Cardamomo — gathered 2026-09-09 from own-domain
     they are: Northern Italian pizza
     logo: https://static-content.owner.com/funnel/images/d7fd8779-db7d-442d-b9aa-d731c798852f?v=8219686727 (703x95) — not cut into a tile yet
     flag: site banner: open September 7th for Labor Day, closed for a team vacation September 8th to 14th
     flag: their host refuses a browser user agent but serves plain curl
     flag: menu: 52 items read from https://pizzeriacardamomo.com/menu on 2026-09-05
  */
  'pizzeria-cardamomo': {
    address: "2053A Broadway, Redwood City, CA 94063",
    phone: "(650) 629-4193",
    email: "sarika@pizzeriacardamomo.com",
    hours: "Tue-Thu 11am-3pm & 5-9pm, Fri-Sat 11am-10pm, Sun 11am-9pm, closed Mon",
    instagram: "pizzeriacardamomo",
    cuisine: "Northern Italian pizza",
    sections: [
      { name: "Specials", items: [
        ["Nonna Arancini","4 pieces of deep-fried rice balls, Pecorino Romano, Parmesan, Garlic, Parsley, and Pepper served with Parmesan sauce.",1200],
        ["Pizza ItaloAmericana","Organic tomato sauce, special cherry tomatoes confit, fresh burrata, ground beef sausage and hot honey.",2800],
        ["Pasta Cacio E Pepe","Cream Cacio E Pepe, house-made pecorino cream, Madagascar voatsiperifery pepper, lemon zest.",2600],
      ] },
      { name: "Antipasti", items: [
        ["Fresh Bread Baked (VG)","Fresh sourdough bread from The Baker Next Door.",500,"pizzeria-cardamomo-fresh-bread-baked-vg"],
        ["Bruschetta (V)","Toasted sourdough, stracciatella, slow cooked cherry tomatoes.",1400,"pizzeria-cardamomo-bruschetta-v"],
        ["Arancini Cacio e Pepe","Crispy risotto fritter with pecorino and parmigiano reggiano.",1300,"pizzeria-cardamomo-arancini-cacio-e-pepe"],
        ["Marinated Taggiasca Olive (VG)","Lemon, cumin, chili served with fresh homemade bread.",1200],
        ["Meatballs","Ground beef meatballs seasoned with marinara sauce and voatsiperifery pepper.",1400,"pizzeria-cardamomo-meatballs"],
        ["Aglio Bruschetta","Toasted sourdough, garlic puree, slow cooked cherry tomatoes, mint.",1400,"pizzeria-cardamomo-aglio-bruschetta"],
        ["Habanero Oil","",900,"pizzeria-cardamomo-habanero-oil"],
        ["Garlic Oil","",1000,"pizzeria-cardamomo-garlic-oil"],
        ["Fig Bruschetta","Toasted sourdough, slow cooked organic figs, fresh organic goat cheese, organic fig leaves oil, rosemary and toasted hazelnuts.",1500,"pizzeria-cardamomo-fig-bruschetta"],
      ] },
      { name: "Pasta", items: [
        ["Pasta Pomodoro Basilico (V)","House-made fresh spaghetti, slow-cooked tomato sauce, basil. Spicy pomodoro available on request.",2200,"pizzeria-cardamomo-pasta-pomodoro-basilico-v"],
        ["Pasta Tagliatelle Bolognese","Housemade fresh pasta, beef ragu.",2600,"pizzeria-cardamomo-pasta-tagliatelle-bolognese"],
        ["Pasta Spaghetti Meatballs","Classic hand-rolled ground beef meatballs, simmered in-housemade tomato sauce, topped with chili flakes and herbs.",2700,"pizzeria-cardamomo-pasta-spaghetti-meatballs"],
        ["Lasagna","Layers of tender pasta, rich slow cooked beef Bolognese sauce, creamy bechamel sauce.",2600],
        ["Pasta al Pesto","House made spaghetti, pine nuts, basil pesto, pecorino romano and parmagiano reggiano.",2600],
      ] },
      { name: "Classic Pizza", items: [
        ["Margherita Pizza (V)","Organic tomato sauce, Fior di latte, basil.",2200,"pizzeria-cardamomo-margherita-pizza-v"],
        ["Margherita DOP Pizza (V)","Organic tomato sauce, buffalo mozzarella DOP, basil.",2600,"pizzeria-cardamomo-margherita-dop-pizza-v"],
        ["Alla Marinara Pizza (VG)","Organic tomato sauce, garlic, oregano, basil.",1900],
      ] },
      { name: "Specialty White Pizzas", items: [
        ["Momo Pizza","Fior di latte, ricotta, montasio cheese, cbt yellow potatoes.",2600],
        ["Bronte Pizza (V)","Fior di latte, ricotta, pistachio pesto, chopped pistachio.",2700],
        ["Carbonara Pizza","Fior di latte, guanciale, poached egg cbt, Pecorino Romano DOP, Madagascar voatsiperifery pepper.",2800,"pizzeria-cardamomo-carbonara-pizza"],
        ["Calzone Cacio Pepe Pizza","Fior di latte, pecorino romano, Madagascar voatsiperifery pepper, extra virgin olive oil.",2700,"pizzeria-cardamomo-calzone-cacio-pepe-pizza"],
        ["Calzone Emiliana","Fior di latte, beef ragu, bechamel, parmigiano reggiano.",2800,"pizzeria-cardamomo-calzone-emiliana"],
        ["Mortadella Pistachio","Fior di latte, mortadella (ham), pistachio pesto, chopped pistachios.",2800,"pizzeria-cardamomo-mortadella-pistachio"],
      ] },
      { name: "Specialty Red Pizzas", items: [
        ["Stracciatella (V)","Organic tomato sauce, stracciatella, caramelized tomatoes, basil, olive oil.",2600],
        ["Verdura Pizza (V)","Organic tomato sauce, Fior di latte, grilled zucchini, eggplant, bell pepper, tomatoes, onion, taggiasca olives, and mint.",2600,"pizzeria-cardamomo-verdura-pizza-v"],
        ["Crudo e Parmigiano All' Aceto Balsamico","Organic tomato sauce, Fior di latte, 24-month prosciutto crudo, Parmigiano Reggiano, Modena traditional balsamic IGP.",2700,"pizzeria-cardamomo-crudo-e-parmigiano-all-aceto-balsamico"],
        ["Spicy Pepperoni with Honey","Organic tomato sauce, fior di latte, pepperoni, organic honey.",2700,"pizzeria-cardamomo-spicy-pepperoni-with-honey"],
        ["Sausage","Organic tomato sauce, fior di latte, bell peppers, ground beef sausage, white onions, garlic, Thai chilies, parmigiano reggiano.",2700,"pizzeria-cardamomo-sausage"],
        ["Arrabbiata Pizza","Organic tomato sauce, Fior di latte, bacon, habanero chillies, fresh garlic, parsley, parmigiano reggiano.",2700],
        ["Funghi Ruccola Gorgonzola","Organic tomato sauce, Fior di latte, gorgonzola cheese, cooked organic baby mushrooms, arugula, garlic, and parsley.",2700],
        ["Sarika","Organic tomato sauce, fior di latte, cooked organic baby mushrooms, white onions, bell peppers, garlic, Thai chilies, parmigiano reggiano.",2600,"pizzeria-cardamomo-sarika"],
        ["Prosciutto Funghi","Organic tomato sauce, fior di latte, cooked organic baby mushroom, prosciutto granbiscotto.",2600],
      ] },
      { name: "Secondi", items: [
        ["Pollo Al Limone","Braised chicken leg with lemon and spices, sauteed Yukon potatoes with rosemary.",2600,"pizzeria-cardamomo-pollo-al-limone"],
      ] },
      { name: "Salads", items: [
        ["Arugula Salad","Local peaches, parmigiano reggiano, walnuts, honey, and vinaigrette.",1500,"pizzeria-cardamomo-arugula-salad"],
        ["Organic Beets Salad","Cara cara orange, toasted almonds, arugula pesto, white wine vinaigrette.",1800],
        ["Spring Salad","Mixed green salad with blood oranges, strawberries, toasted cashews, prosciutto crudo, and a light vinaigrette.",2100,"pizzeria-cardamomo-spring-salad"],
        ["Pistachio Salad","Spinach, blueberries, pistachios, goat cheese, fresh lemon and honey dressing.",1800,"pizzeria-cardamomo-pistachio-salad"],
      ] },
      { name: "Desserts", items: [
        ["Tiramisu","Classic Italian dessert with layers of espresso-soaked ladyfingers, creamy mascarpone, and a dusting of cocoa powder.",1200,"pizzeria-cardamomo-tiramisu"],
        ["Strawberry Tiramisu","Layers of strawberry-soaked ladyfingers, creamy mascarpone, and sweet strawberries.",1300,"pizzeria-cardamomo-strawberry-tiramisu"],
        ["Panna C W Strawberry","Creamy Italian panna cotta topped with caramelized strawberries.",1300],
      ] },
      { name: "Kids", items: [
        ["K Pasta Pomodoro (V)","Slow cooked pasta with tomatoes, parmigiano reggiano. Smaller portion for children 12 and under.",1700,"pizzeria-cardamomo-k-pasta-pomodoro-v"],
        ["Cheese Pasta","Pasta with parmigiano reggiano cheese and olive oil. Smaller portion for children 12 and under.",1700,"pizzeria-cardamomo-cheese-pasta"],
      ] },
      { name: "Drinks", items: [
        ["Natural Spring Water","",800],
        ["San Pellegrino Water","",800],
        ["Limonata","",800],
        ["Chinotto","",800],
        ["Aranciata","",800],
      ] },
      { name: "Panini", items: [
        ["Panini Verdura","Bell peppers, taggiasca olives, oregano, capers, basil, vinegar, stracciatella.",1800],
        ["Panini Prosciutto/Bufala","Ruliano prosciutto 24 mo, bufala, fresh tomatoes, basil, extra virgin olive oil.",2000],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Playland 707 — gathered 2026-09-09 from own-domain
     their spelling: "PLAYLAND707.com" (roster keeps "Playland 707")
     they are: Paintball
     logo: https://images.squarespace-cdn.com/content/v1/69a710af8259800303779dc1/7c3b847d-cdbf-4c04-9af3-9364b35e2c57/black2inlogo.jpg (1000x1000) — not cut into a tile yet
     flag: name written three ways: 'PLAYLAND707.com', 'PLAYland707.com', 'Playland'
     flag: typo-heavy copy: 'Sonoma Counties Premier PAintball', 'fields n the Bay Area', 'If your shot once you are out'
     flag: self-equipped pricing lists the same $30 for three hours and all day
     flag: a separate rain entrance is published at 419 Payran St, Gate 4 of the fairgrounds
     flag: no Instagram; the only social link is a bare Facebook profile URL
  */
  'playland-707': {
    address: "471 Kenilworth Dr, Petaluma, CA 94952",
    phone: "(707) 238-5088",
    email: "Management@playland707.com",
    hours: "Sat-Sun 10am-5pm; weekdays for confirmed private parties only",
    cuisine: "Paintball",
    groups: [
      { name: "Prices, from", items: [
        ["Basic Rental, 1 hour","Tippmann FT-12, air with unlimited refills, hopper, full face mask",2000],
        ["Basic Rental, 3 hours","",4000],
        ["Basic Rental, all day","",5000],
        ["Sniper Upgrade, 3 hours","Planet Eclipse Emek with a precision barrel",5000],
        ["Terminator, all day","Tournament-level marker",7500],
        ["Self-Equipped, all day","Field paint only",3000],
        ["500 paintballs","Sold on site; 2000 for $60",2000],
        ["Weekend Private Party","Eight players, three hours, 200 paintballs each, a private field; $50 each extra player",39900,"from $399"],
      ] },
    ],
    quoteOnly: "'Sonoma County's premier paintball destination' — an outdoor paintball park at the Petaluma fairgrounds with four fields, plus airsoft, gellyball, laser tag and NERF. Walk-on rentals are tiered by hours; private parties start at $399 for eight players; rental players buy field paint on site.",
  },

  /*
     Polly Ann Ice Cream — gathered 2026-09-09 from own-domain
     they are: Ice cream
     logo: https://www.pollyann.com/static/4c139f8ea465466ad98154b406f8294b/73bb6/Polly_Ann_monochrome_logo_since_1955_v2.jpg (120x120) — not cut into a tile yet
     flag: menu lists two separate categories named 'Baked goods' and 'Baked Goods'
     flag: ordering runs on an external Square site (pollyannicecream.square.site)
     flag: menu: 34 items read from https://www.pollyann.com/menu/ on 2026-09-04
  */
  'polly-ann': {
    address: "3138 Noriega St, San Francisco, 94122",
    phone: "(415) 664-2472",
    email: "info@pollyann.com",
    hours: "Mon-Fri 12-9pm, Sat 11am-9:30pm, Sun 11am-9pm",
    instagram: "pollyann.sf",
    cuisine: "Ice cream",
    sections: [
      { name: "Ice cream", items: [
        ["Junior Scoop","Junior Scoop",525,"polly-ann-junior-scoop"],
        ["Monster Sundae","",1250,"polly-ann-monster-sundae"],
        ["Regular Sundae","2 scoops, 4 Toppings, Whipped cream and cherry",1050,"polly-ann-regular-sundae"],
        ["Tiramisu Ice Cream Cake Personal","",900,"polly-ann-tiramisu-ice-cream-cake-personal"],
        ["Chocolate Bark","Broken pieces of chocolate with nuts",300,"polly-ann-chocolate-bark"],
        ["Malt","",100],
        ["Single Scoop","Single Scoop",625,"polly-ann-single-scoop"],
        ["Ring Pop","",100],
        ["Chocolate Chip Cookie 🍪 Jumbo","Triple chocolate Chip Cookie",400,"polly-ann-chocolate-chip-cookie-jumbo"],
        ["Pringles - Small","",150],
        ["Monster Scoop","3 Scoops of Ice Cream",1050,"polly-ann-monster-scoop"],
        ["Push Pop","",200],
        ["Sour Patch / Mamba / Skittles /Nerds","",200],
        ["Sour Belt x 5","",100],
        ["Soft Serve - Regular","",650],
        ["Soft Serve Large","",850],
        ["Double","2 Scoops of Ice cream. Can have 2 flavors with no extra cost.",795,"polly-ann-double"],
        ["Pint","1 Pint of Premium Ice Cream (16 Oz)",1090,"polly-ann-pint"],
        ["Waffle Cone Chocolate Dip","",125],
        ["Hand packed Quart","",1790,"polly-ann-hand-packed-quart"],
        ["Slam Dunk Candy","",300],
        ["Rock Paper Scissor \\ Toy Candy","",300],
        ["Kinder Egg","",200],
        ["Muscle Milk","",500],
        ["Brownie","",400,"polly-ann-brownie"],
        ["Vegan Container - Pint","Pint of Vegan Ice Cream",1200],
        ["Quart (Pre-Packed)","",1790,"polly-ann-quart-pre-packed"],
      ] },
      { name: "Drinks", items: [
        ["1.1 Small Milkshake","Milk Shake 16 Oz",975,"polly-ann-1-1-small-milkshake"],
        ["1.3 Float","",900,"polly-ann-1-3-float"],
        ["1 Regular Milkshake","Milkshake 24 Oz",1175,"polly-ann-1-regular-milkshake"],
        ["Soda Can","",175,"polly-ann-soda-can"],
        ["ITO EN Tea","",275],
        ["1.2 Monster Milkshake","",1295,"polly-ann-1-2-monster-milkshake"],
        ["Starbucks Frappuccino 9.5 Oz","",300],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Quickly Benicia — gathered 2026-09-09 from own-domain
     they are: Boba and Filipino snacks
     logo: https://www.quicklybenicia.com/images/quickly-logo.jpg (1818x1818) — not cut into a tile yet
     flag: the site was generated with v0.app and carries long keyword-stuffed copy
     flag: the review carousel mixes quotes labelled 'Recent Google Review' with generic undated ones
     flag: menu: 20 items read from https://www.quicklybenicia.com/specialty-menu on 2026-09-05
  */
  'quickly-benicia': {
    address: "822 Southampton Rd, Benicia, CA 94510",
    phone: "(707) 361-5936",
    hours: "Mon-Fri 12-7pm, Sat-Sun 9am-7pm",
    instagram: "quicklybenicia",
    cuisine: "Boba and Filipino snacks",
    sections: [
      { name: "Food Favorites", items: [
        ["Chee-Hoo Sticks","",819,"quickly-benicia-chee-hoo-sticks"],
        ["Hula Rings","",510,"quickly-benicia-hula-rings"],
        ["Hurricane Fries","",795],
        ["Lumpianadas","",595],
        ["Mahalo Fries","",995,"quickly-benicia-mahalo-fries"],
        ["Popcorn Chicken","",995,"quickly-benicia-popcorn-chicken"],
        ["Yum-Pia","",995,"quickly-benicia-yum-pia"],
        ["Tocilog","Sweet pork tocino",1395],
        ["Longsilog","Sweet pork longanisa",1395],
        ["Bangsilog","Milkfish bangus",1495],
      ] },
      { name: "BBQ Silog", items: [
        ["Chicken or pork BBQ","",1495],
      ] },
      { name: "Combo Silog", items: [
        ["Mix & match favorites","",1795],
      ] },
      { name: "Sides", items: [
        ["Fried Egg","",195,"quickly-benicia-fried-egg"],
        ["Garlic Rice","",295,"quickly-benicia-garlic-rice"],
        ["BBQ Stick","",695,"quickly-benicia-bbq-stick"],
        ["Longanisa (2)","",695],
        ["Bangus","",1095,"quickly-benicia-bangus"],
      ] },
      { name: "Milk tea", items: [
        ["Premium Matcha Milk Tea","",129,"quickly-benicia-premium-matcha-milk-tea"],
        ["Panda Milk Tea","",154,"quickly-benicia-panda-milk-tea"],
        ["Red Bean Milk Tea","",103],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Red Chili — gathered 2026-09-09 from own-domain
     they are: Thai and Vietnamese
     logo: https://redchilirestaurants.com/wp-content/uploads/2025/04/Red-Chili-Rectangle-logo.png (208x58) — not cut into a tile yet
     flag: THE HAYWARD ROOM IS CLOSED — 29583 Mission Blvd, (510) 881-8593, 'temporarily closed until further notice due to repairs from a neighboring fire' per their own banner — so the open San Jose location is the address here
     flag: their TikTok link points to @redchili.bayareac with a trailing c
     flag: menu: 74 items read from https://redchilirestaurants.com/wp-content/uploads/2025/11/RCH-Menu.pdf on 2026-09-05
  */
  'red-chili': {
    address: "2538 Berryessa Rd, San Jose, CA 95132",
    phone: "(408) 937-8888",
    hours: "Daily 11am-2:30pm & 4-8:30pm",
    instagram: "redchili.bayarea",
    cuisine: "Thai and Vietnamese",
    sections: [
      { name: "Combo Plates", items: [
        ["Combo 1 - Curry (Vegan Base, GF)","Housemade gluten-free Thai coconut milk curry; comes with side salad and choice of side. Egg roll not included.",1475],
        ["Combo 2 - Stir-fry","Comes with side salad and choice of side. Egg roll not included.",1475,"red-chili-combo-2-stir-fry"],
        ["Combo 3 - BBQ","House marinated Vietnamese BBQ; comes with side, salad, Vietnamese fish sauce and chili paste, plus 2 grilled shrimp. Egg roll not included.",1595,"red-chili-combo-3-bbq"],
      ] },
      { name: "Starters", items: [
        ["A1. Chicken Satay","4 skewers with wheat bread, peanut sauce & cucumber salad",1150,"red-chili-a1-chicken-satay"],
        ["A2. Vegan Egg Rolls","3 pcs; comes with housemade sweet & sour sauce and chili paste",895,"red-chili-a2-vegan-egg-rolls"],
        ["A3. Thai Samosa Egg Rolls","Vegan; sweet curry potato filling",895,"red-chili-a3-thai-samosa-egg-rolls"],
        ["A4. Crab Rangoons","Made in-house; filled with cream cheese, carrot, celery, imitation crab; sweet & sour sauce and chili paste for dipping",595,"red-chili-a4-crab-rangoons"],
        ["A8. Roti Canai","w/ yellow curry & cucumber salad",1050,"red-chili-a8-roti-canai"],
        ["A9. Fried Tofu","Soft and crispy tofu triangles paired with tamarind peanut sauce",1050,"red-chili-a9-fried-tofu"],
      ] },
      { name: "Chicken Wings", items: [
        ["A10. Tom Yum Wings","Dry rub tom yum flavored, topped with fried lemongrass & kaffir leaves; paired with chili dipping sauce",1395,"red-chili-a10-tom-yum-wings"],
        ["A11. Larb Wings","Dry rub, a little sour & spicy, tossed in roasted rice and topped with red onions, cilantro, green onions",1395],
        ["A12. Fish Sauce Wings","Glazed sweet & salty fish sauce, topped with fried shallots",1395,"red-chili-a12-fish-sauce-wings"],
        ["A13. Red Chili Hot Wings","Chicken wings stir-fried with bell peppers & sweet chili sauce, topped with fried basil",1395,"red-chili-a13-red-chili-hot-wings"],
        ["A14. Fire Hot Wings","Housemade fire sauce for the spicy lovers; comes with a bed of lettuce and pickled carrots to cool down",1395,"red-chili-a14-fire-hot-wings"],
        ["A15. Passionfruit Habañero Wings","Fresh & crunchy deep-fried chicken wings paired with housemade passionfruit habañero dipping sauce; side of pickled carrots & daikon",1395,"red-chili-a15-passionfruit-haba-ero-wings"],
      ] },
      { name: "Salads", items: [
        ["S1. Papaya Salad","Green papaya, shredded carrots, tomatoes, green beans, dried shrimp, peanuts. Add salted crab +3 · Add grilled shrimp (2) +3",1375,"red-chili-s1-papaya-salad"],
        ["S2. Mango Salad","Green mango, red onions, carrots, cashews. Add grilled shrimp (2) +3",1375,"red-chili-s2-mango-salad"],
        ["S3. Larb","Ground meat, roasted rice powder, chili, red onion, cilantro & mint leaves tossed in a lime fish sauce dressing. Chicken, pork, or beef (+1)",1475,"red-chili-s3-larb"],
      ] },
      { name: "Soups", items: [
        ["10. Tom Yum","Sour and spicy soup with mushroom, baby corn, red onion, galangal & lemongrass. Choice of protein.",800,"red-chili-10-tom-yum"],
        ["11. Tom Kha","Flavorful & light coconut milk soup; choice of protein, baby corn, mushrooms, lemongrass",850,"red-chili-11-tom-kha"],
      ] },
      { name: "Pan-Fried Noodles", items: [
        ["27. Pad Thai","Choice of meat, beansprouts, chives, tofu. Contains peanuts.",1600,"red-chili-27-pad-thai"],
        ["28. Pad See Ew","Choice of meat, broccoli, Chinese broccoli, eggs",1550,"red-chili-28-pad-see-ew"],
        ["29. Pad Kee Mao","Choice of protein, bell peppers, onions, basil, tomato, eggs",1550,"red-chili-29-pad-kee-mao"],
        ["30. Rad Na","Choice of protein, broccoli, Chinese broccoli, Thai-style gravy",1550,"red-chili-30-rad-na"],
      ] },
      { name: "Fried Rice", items: [
        ["31. Thai Fried Rice","Choice of meat, egg, tomatoes, onions",1450],
        ["32. Spicy Basil Fried Rice","Choice of meat, egg, basil, bell pepper, onions, dark soy",1450,"red-chili-32-spicy-basil-fried-rice"],
        ["33. Pineapple Fried Rice","Chicken & shrimp (2 pc), cashews, raisins, carrots, peas, pineapple chunks",1650,"red-chili-33-pineapple-fried-rice"],
        ["34. Crab Fried Rice","Crab meat, eggs, onions, sliced Chinese broccoli stems",1850,"red-chili-34-crab-fried-rice"],
      ] },
      { name: "BBQ entrées", items: [
        ["35. BBQ Chicken (GF)","Comes with Vietnamese fish sauce, chili paste, salad",1795],
        ["36. BBQ Pork","Comes with Vietnamese fish sauce, chili paste, salad",1795,"red-chili-36-bbq-pork"],
        ["37. BBQ Short Ribs","Comes with Vietnamese fish sauce, chili paste, salad",2095,"red-chili-37-bbq-short-ribs"],
      ] },
      { name: "Curry entrées", items: [
        ["40. Panang Curry","Choice of meat, basil, bell peppers - contains more meat",1650,"red-chili-40-panang-curry"],
        ["41. Yellow Curry","Choice of meat, onions, potatoes",1650,"red-chili-41-yellow-curry"],
        ["42. Green Curry","Choice of meat, zucchini, eggplant, bell peppers, basil",1650,"red-chili-42-green-curry"],
        ["43. Red Curry","Choice of meat, bamboo shoots, basil, bell peppers",1650],
        ["44. Choo Chee Fish Curry","Basa fish fillet in red curry, topped with fried basil",1850,"red-chili-44-choo-chee-fish-curry"],
        ["45. Massaman Curry","Peanut curry; choice of protein, potatoes, carrots, fried shallots",1795],
        ["46. Pumpkin Curry","Choice of protein, pumpkin, bell pepper, basil",1750,"red-chili-46-pumpkin-curry"],
      ] },
      { name: "Stir-fry entrées", items: [
        ["50. Basil (Pad Kra Prao)","Ground meat, basil, bell peppers, onions",1650,"red-chili-50-basil-pad-kra-prao"],
        ["51. Eggplant","Ground meat, eggplant, bell pepper, onions, basil",1650,"red-chili-51-eggplant"],
        ["52. Garlic","Sliced meat of choice sautéed with garlic, onions, and house sauce, on a bed of sliced lettuce and shredded carrots",1650],
        ["53. Mango","Sliced meat, cubed mango, bell peppers, onions, cashews, sweet chili shrimp sauce",1650,"red-chili-53-mango"],
        ["54. Mixed Veggie","Sliced meat, broccoli, carrots, cabbage, Chinese broccoli, baby corn",1650],
        ["55. Spicy Green Bean","Sliced meat, green bean, bell pepper, spicy Thai curry paste",1650,"red-chili-55-spicy-green-bean"],
      ] },
      { name: "Chef's Specials", items: [
        ["C1. Tamarind Fried Fish Fillet","Glazed with sweet tamarind sauce; bell peppers, onions, fried basil",2000,"red-chili-c1-tamarind-fried-fish-fillet"],
        ["C2. Red Chili Fried Fish Fillet","Red Chili sauce with diced bell peppers and onions",2000,"red-chili-c2-red-chili-fried-fish-fillet"],
        ["C3. Mango Fried Fish Fillet","Served with mango salad",2000,"red-chili-c3-mango-fried-fish-fillet"],
        ["C4. Thai Crispy Garlic Shrimp","",2000,"red-chili-c4-thai-crispy-garlic-shrimp"],
        ["C5. Garlic Jumbo Prawns","Deep-fried butterfly cut prawns seasoned with salt, pepper, chili and topped with onions and basil",2000],
        ["C6. Honey Wasabi Walnut Shrimp","",2000,"red-chili-c6-honey-wasabi-walnut-shrimp"],
      ] },
      { name: "Sides", items: [
        ["Jasmine Rice","Steamed jasmine rice",250,"red-chili-jasmine-rice"],
        ["Brown Rice","",350,"red-chili-brown-rice"],
        ["Coconut Rice","",400],
        ["Sticky Rice","",350,"red-chili-sticky-rice"],
        ["Garlic Noodles","",700,"red-chili-garlic-noodles"],
        ["Steamed Veggies","Broccoli, Chinese broccoli, carrots, baby corn, cabbage",500,"red-chili-steamed-veggies"],
        ["Cucumber Salad","",500,"red-chili-cucumber-salad"],
        ["Peanut Sauce","",300,"red-chili-peanut-sauce"],
        ["Side of Curry","Side of one of our Thai curries, only the curry itself",250],
      ] },
      { name: "Drinks", items: [
        ["Thai Iced Tea","Sweetness cannot be adjusted",400,"red-chili-thai-iced-tea"],
        ["Green Thai Tea (w/ milk)","Floral taste from real Thai green tea leaves; sweetness cannot be adjusted",450,"red-chili-green-thai-tea-w-milk"],
        ["Green Thai Tea w/ Lime","Made with real Thai green tea leaves, fresh lime, and sugar; no artificial colors, sweeteners, or dairy",500,"red-chili-green-thai-tea-w-lime"],
        ["Vietnamese Iced Coffee","",500,"red-chili-vietnamese-iced-coffee"],
        ["Coconut Juice","Served with coconut meat inside",450],
        ["Daang Soda w/ Lime","Red Thai flower syrup, fresh lime juice, soda, topped with lime slices",550],
        ["Sprite / Coke / Diet Coke","",300],
        ["Sparkling Passionfruit","Best seller; made with real passionfruit, contains seeds",550,"red-chili-sparkling-passionfruit"],
        ["Sparkling Anchan","Soda, real butterfly pea flower, fresh lime juice, syrup; sweetness adjustable",550,"red-chili-sparkling-anchan"],
      ] },
      { name: "Smoothies", items: [
        ["Mango Smoothie","Sweetness adjustable; fresh fruit",650,"red-chili-mango-smoothie"],
        ["Peach Mango Smoothie","Sweetness cannot be adjusted; yogurt based with real fruit",650,"red-chili-peach-mango-smoothie"],
        ["Mixed Berry Yogurt Smoothie","Sweetness cannot be adjusted; yogurt based with real mixed berries",650],
        ["Strawberry Smoothie","Sweetness adjustable; fresh fruit",650],
      ] },
      { name: "Desserts", items: [
        ["GT Sticky Rice w/ Mango","Extra mango +2",950,"red-chili-gt-sticky-rice-w-mango"],
        ["Sweet Roti w/ Egg","",995,"red-chili-sweet-roti-w-egg"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     rock-n-jump — gathered 2026-09-09 from own-domain
     their spelling: "ROCKIN' JUMP" (roster keeps "rock-n-jump")
     they are: Trampoline park
     logo: https://rockinjump.com/wp-content/themes/rockinjump/images/header/Rockin-Jump-Logo.png (442x64) — not cut into a tile yet
     flag: stale content: a 'CORONAVIRUS UPDATE - MARCH 2020' modal and a 'NOW OPEN!' banner are still live
     flag: the Instagram and Twitter links go to @rockinjump916 — 916 is Sacramento's area code, on the Concord page
     flag: the Thursday row of their hours table has a stray second Open Jump entry with no times
     flag: tots sessions Wed 9-11am, Sat 8-10am, Sun 9-11am
  */
  'rock-n-jump': {
    address: "1631 Challenge Dr, Concord, CA 94520",
    phone: "(925) 332-0285",
    email: "Concord-CA@RockinJump.com",
    hours: "Mon-Thu 3:30-8pm, Fri 1-10pm, Sat 10am-10pm, Sun 11am-7pm",
    instagram: "rockinjump916",
    cuisine: "Trampoline park",
    groups: [
      { name: "Prices", items: [
        ["General Admission — 90 minutes","Full access to the whole park",2599],
        ["General Admission — 120 minutes","",2999],
        ["Rockin' Tots","A parent and one child up to six, two hours; each extra child $3",1500],
        ["Rockin' Friday","Per person, 8-10pm every Friday",2000],
        ["Deluxe Party (Mon-Thu)","",24900],
        ["Deluxe Party (Fri-Sun)","",29900],
        ["Premium Party (Mon-Thu)","",37900],
        ["Platinum Party (Mon-Thu)","",46900],
      ] },
    ],
    quoteOnly: "'The Ultimate Trampoline Park' — an indoor trampoline park in Concord with open jump, dodgeball, climbing walls, tots time and birthday parties. Party packages are priced Mon-Thu against Fri-Sun; booking runs on ROLLER.",
  },

  /*
     Rocket MC Tow — gathered 2026-09-09 from own-domain
     their spelling: "Rocket Motorcycle Towing and Transport Service" (roster keeps "Rocket MC Tow")
     they are: Motorcycle towing
     logo: https://www.rocketmctow.com/wp-content/uploads/2024/07/logo-web.png (500x460) — not cut into a tile yet
     flag: a Helmet Raffle 2026 is still promoted with 'ENTER NOW' though its deadline of Aug 28, 2026 has passed
     flag: no hours, email or address anywhere on the site
  */
  'rocket-mc-tow': {
    phone: "(925) 517-5551",
    instagram: "rocketmctow",
    cuisine: "Motorcycle towing",
    contactOnly: "Safe and efficient towing and transport of motorcycles and ATVs, serving the whole San Francisco Bay Area and surroundings. Quote-based only — 'Get Your Free Towing Quote' — with a 15% senior and military discount advertised.",
  },

  /*
     The Royale Eatery — gathered 2026-09-09 from own-domain
     their spelling: "THE ROYALE" (roster keeps "The Royale Eatery")
     they are: Contemporary American
     logo: https://static.wixstatic.com/media/315f9a_ae2afe1fbba248ffa009ee59f07c6fa8~mv2.png (1280x1280) — not cut into a tile yet
     flag: the Instagram button displays @theroyaleeatery but links to instagram.com/theroyaleeatery.ph
     flag: name written three ways: 'THE ROYALE' (wordmark), 'The Royale' (title), 'The Royale Eatery' (copy)
  */
  'royale-eatery': {
    address: "2190 Contra Costa Blvd, Pleasant Hill, CA 94523",
    phone: "(925) 483-2219",
    email: "info@theroyaleeatery.com",
    hours: "Brunch Mon-Fri 9am-2pm, Sat-Sun 8am-3pm; dinner Tue-Fri 4:30-9pm, Sat 5:30-9pm",
    instagram: "theroyaleeatery.ph",
    cuisine: "Contemporary American",
    items: [
      ["La Royale Classic","Two cage-free sunny-side eggs, AmaRosa potatoes, house aioli, sourdough toast, applewood bacon or chicken sausage",2000],
      ["The Ambassador","Spiced-honey glazed candy bacon, two eggs, AmaRosa potatoes, sourdough",3200],
      ["The King's","Belgian waffle, PBJ, banana Foster brûlée, candied pecans, mascarpone, berries, candy bacon",2700],
      ["Chicken Waffle","Belgian waffle, fried chicken thigh, berries, warm butter maple syrup",2700],
      ["The Majestic","Braised short rib or lamb neck, garlic mash, grilled broccolini, red wine sauce",4500],
      ["Tom Yum Paella","Lobster tail, red shrimp, mussels, calamari, lemongrass, chilli-lime; dine-in only",4800],
      ["Ultimate Smashburger","Double Wagyu patty, white cheddar, truffle mushroom, Mornay, brioche, fries",2900],
      ["Kare Raisu","Japanese-style curry with Hamburg steak, fried chicken thigh or an Impossible patty",3000],
    ],
  },

  /*
     Ruben Hibachi Grill — gathered 2026-09-09 from stopgap
     they are: Hibachi and catering
     flag: all facts from their Instagram bio; DoorDash blocks reading the menu
     flag: Glenn: 'Definitely needs a website'
     flag: Menu sweep 2026-09-09, still no readable prices: No official business website or business-run ordering page could be found. A search turned up only third-party listings (DoorDash marketplace, Yelp, Instagram, TikTok, Apple Maps); per sourcing rules these were not used for facts or prices, so no menu could be read.
     flag: Menu sweep 2026-09-09: No own-domain website or Toast/Square/ChowNow/order.online ordering page exists for this business as far as one WebSearch could find; only DoorDash, Yelp, Instagram (@rubenhibachigrill), TikTok, and Apple Maps listings appeared.
     flag: Menu sweep 2026-09-09: A similarly named site, hibachibyruben.com ('Hibachi By Ruben'), was checked and confirmed to be a different, unrelated business located in San Juan, TX, not San Lorenzo, CA.
     flag: Menu sweep 2026-09-09: Per sourcing rules (no Yelp/DoorDash/review sites), address, phone, and hours were not populated even though a DoorDash listing surfaced some in search results.
     flag: Menu sweep 2026-09-09: name_exact reflects the name given in the research request, not text confirmed on an owned site.
  */
  'ruben-hibachi-grill': {
    address: "575 Paseo Grande, San Lorenzo, CA",
    phone: "510-776-1962",
    hours: "Wed-Fri 3pm-10pm, Sat-Sun 12pm-10pm, closed Mon-Tue",
    instagram: "rubenhibachigrill",
    cuisine: "Hibachi and catering",
    needsSite: true,
    tagline: "Hibachi, catering and events on Paseo Grande",
    contactOnly: "Hibachi, catering and events on Paseo Grande. Their menu is on DoorDash, which they link from their bio; they publish no prices of their own.",
  },

  /*
     Russ Fam Kitchen — gathered 2026-09-09 from own-domain
     they are: Filipino fusion
     flag: second counter at 2992 Spring St Unit C, Redwood City, per their site
     flag: hours are from their Instagram bio: '8:30-12 / 2-7PM, Tuesday-Sunday'
     flag: Glenn: 'Daly City • Goods' with their reel
     flag: menu: 28 items read from https://russfamkitchen.com/menu on 2026-09-05
  */
  'russ-fam-kitchen': {
    address: "1216 Hillside Blvd, Daly City, CA 94014",
    phone: "510-691-3658",
    email: "admin@russfamkitchen.com",
    hours: "Tue-Sun 8:30am-12pm and 2pm-7pm",
    instagram: "russfamkitchen_",
    cuisine: "Filipino fusion",
    tagline: "Filipino fusion inside an Exxon on Hillside Blvd, and in Redwood City",
    sections: [
      { name: "Breakfast", items: [
        ["Spam Silog","Spamsilog is a type of Silog, a traditional Filipino breakfast dish made of garlic rice, fried spam and sunny side up egg.",1399,"russ-fam-kitchen-spam-silog"],
        ["Tocilog","Tender sweet-cured pork tocino served with white rice and a fried egg. A Filipino breakfast classic that’s sweet, savory and satisfying.",1499,"russ-fam-kitchen-tocilog"],
        ["Tapsilog","Tender marinated beef tapa served with white rice and a fried egg. A classic Filipino breakfast favorite packed with bold, savory flavor in every bite.",1599,"russ-fam-kitchen-tapsilog"],
        ["Bacsilog","Crispy bacon served with garlic fried rice and a fried egg. A hearty and flavorful breakfast classic that’s savory, satisfying and delicious.",1499,"russ-fam-kitchen-bacsilog"],
        ["Hotsilog","Three Filipino-style hotdogs served with white rice and a fried egg. A sweet, savory and satisfying breakfast favorite that’s perfect any time of the day.",1399,"russ-fam-kitchen-hotsilog"],
        ["American Breakfast","A classic breakfast platter featuring scrambled eggs, crispy bacon and pancakes.",1499,"russ-fam-kitchen-american-breakfast"],
        ["Bangsilog","Crispy boneless milkfish served with white rice and a fried egg. A classic Filipino breakfast dish that’s hearty, flavorful and satisfying.",1799,"russ-fam-kitchen-bangsilog"],
        ["Longsilog","3 pieces of sweet Filipino longganisa sausage served with white rice and a fried egg. A flavorful breakfast favorite.",1399,"russ-fam-kitchen-longsilog"],
        ["Cornsilog","Corned beef served with white rice and a fried egg. A savory Filipino breakfast classic that's hearty and satisfying.",1699,"russ-fam-kitchen-cornsilog"],
        ["Embusilog","4 pieces of embutido (Filipino-style meatloaf) served with white rice and a fried egg. A hearty and savory breakfast plate.",1499,"russ-fam-kitchen-embusilog"],
      ] },
      { name: "Lunch and dinner", items: [
        ["Cheezzy Birria Tacos","4 pieces with free consommé shredded beef, dried chilies, corn tortilla, mozzarella cheese, onions, cilantro and consommé.",2000,"russ-fam-kitchen-cheezzy-birria-tacos"],
        ["Lion King Sushi Bake","Japanese rice, furikake, imitation crab, salmon, topped with mayo, unagi sauce, tobiko and spring onions.",1700,"russ-fam-kitchen-lion-king-sushi-bake"],
        ["Pork Lumpia","",1300,"russ-fam-kitchen-pork-lumpia"],
        ["Classic Chicken Wings","8 pieces.",1600,"russ-fam-kitchen-classic-chicken-wings"],
        ["Cali-Spam Musubi","2 pieces. Sliced spam, Japanese rice, special sauce, topped with imitation crab, unagi sauce, spicy mayo, furikake, spring onions.",1500,"russ-fam-kitchen-cali-spam-musubi"],
        ["Braised Pork Belly with Lumpia Rice Plate","",1800,"russ-fam-kitchen-braised-pork-belly-with-lumpia-rice-plat"],
        ["Crispy Dinakdakan Rice Plate","Chopped crispy pork, house made special creamy sauce, ginger, onions, fresh Thai chili & jalapeños (spicy).",1600,"russ-fam-kitchen-crispy-dinakdakan-rice-plate"],
        ["Lechon Kawali Rice Plate","Well seasoned deep fried pork belly served in cubes.",1600,"russ-fam-kitchen-lechon-kawali-rice-plate"],
        ["Pork & Shrimp Siomai","10 pieces comes with soy sauce and homemade garlic chili oil.",1500,"russ-fam-kitchen-pork-shrimp-siomai"],
      ] },
      { name: "Filipino Street Foods", items: [
        ["Kwek-Kwek","10 pieces quail eggs come with house special manong sauce & vinegar.",1000,"russ-fam-kitchen-kwek-kwek"],
        ["Ki-Kiam","10 pieces bite sized ki-kiam with house special manong sauce & vinegar.",900,"russ-fam-kitchen-ki-kiam"],
        ["Fish Balls","12 pieces bite sized fish balls with house special manong sauce & vinegar.",800,"russ-fam-kitchen-fish-balls"],
        ["Pork Tumbong","3 sticks",1300,"russ-fam-kitchen-pork-tumbong"],
      ] },
      { name: "Drinks", items: [
        ["Classic Iskrambol","16 oz. SHAVED ICE, POWDERED MILK, SUGAR, FLAVORING, DRIZZLED WITH EITHER CHOCOLATE / CARAMEL SAUCE, TOPPED WITH MARSHMALLOWS & SPRINKLES",900,"russ-fam-kitchen-classic-iskrambol"],
        ["Ube Iskrambol","16 oz. SHAVED ICE, POWDERED MILK, SUGAR, FLAVORING, DRIZZLED WITH EITHER CHOCOLATE / CARAMEL SAUCE, TOPPED WITH MARSHMALLOWS & SPRINKLES",900,"russ-fam-kitchen-ube-iskrambol"],
        ["Sagot’ Gulaman","16oz",600,"russ-fam-kitchen-sagot-gulaman"],
        ["Sagot Gulaman","",600],
      ] },
      { name: "Specialties", items: [
        ["Ilocos Empanada","Ilocos Empanada is made with fresh green papaya, homemade pork longganisa and egg",800,"russ-fam-kitchen-ilocos-empanada"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Rywire — gathered 2026-09-09 from own-domain
     their spelling: "Rywire Motorsport Electronics" (roster keeps "Rywire")
     they are: Motorsport electronics
     logo: https://res.cloudinary.com/v11111111-0000-0000-0000-000001381196/image/upload/v1724100194/hf01rdo9mo8gvhvorwkw.png (1420x491) — not cut into a tile yet
     flag: name inconsistent on their own site: the title says 'Rywire Motorsports Electronics', the header and footer say 'Motorsport'
     flag: the About Us page is empty — a heading and a dash
     flag: no phone, email, street address or hours anywhere; contact is a form only
  */
  'rywire': {
    instagram: "rywire_motorsport",
    cuisine: "Motorsport electronics",
    groups: [
      { name: "Prices", items: [
        ["OBD1 Budget D and B-series Tucked Engine Harness","Black wire with expandable mesh loom; charge harness option +$45",54900],
        ["Budget Tucked K-Series Harness Ver. 2 (K20)","",72500],
        ["Honda/Acura Chassis Harness with PDM 16","Optional front, rear and gauge harnesses $100 each",192500],
        ["Porsche Emtron Harness","Mil-spec EFI harness for 911, 964 and 993 twin plug",540000],
        ["2023 Rywire T-Shirt","",3500],
      ] },
    ],
    quoteOnly: "A motorsport electronics shop — budget and mil-spec engine harnesses, PDM systems and electronics for Honda, Porsche and race applications. Listed prices are base configurations; optional add-ons chosen on the product page raise them.",
  },

  /*
     Sala Thai — gathered 2026-09-09 from own-domain — BLOCKED: Cloudflare bot challenge on every URL with both user agents; not bypassed — nothing readable
     they are: Thai
     logo: https://salathairichmond.com/wp-content/uploads/2025/05/SALA-LOGO2-1024x517.png (1024x517) — not cut into a tile yet
     flag: WordPress behind Cloudflare — robots.txt is served, but the sitemap, /feed/ and /wp-json/ are all challenged
     flag: Menu sweep 2026-09-09, still no readable prices: salathairichmond.com publishes its real menu only as 8 scanned/photographed image files (menu-8.5x11in_2025-01.jpg through -07.jpg, plus a togo-8.5x11in_2025-01.jpg takeout menu) hosted under /wp-content/uploads/; no text-based prices appear anywhere on the homepage or /menu/ page to extract.
     flag: Menu sweep 2026-09-09: Homepage lists two different phone numbers: 510-223-2933 (used here, also shown on the /menu page) and 510-223-2900.
     flag: Menu sweep 2026-09-09: A fax number is printed as '510-2232932' (appears to be missing a dash/digit formatting).
     flag: Menu sweep 2026-09-09: Full menu is 7 image pages plus a separate takeout menu image; no text pricing exists on the site.
     flag: Menu sweep 2026-09-09: No Instagram or Facebook link found anywhere on the site.
  */
  'sala-thai': {
    address: "15501 San Pablo Ave Suite F, Richmond, CA 94806",
    phone: "510-223-2933",
    hours: "Mon-Fri 11am-4pm & 5pm-10pm, Sat 4pm-10pm, Sun 5pm-10pm",
    cuisine: "Thai",
    photos: [
      {"src":"/food/sala-thai-site-0-lg.webp","alt":"","credit":"Their own photo, from salathairichmond.com"},
    ],
    contactOnly: "They publish no prices.",
  },

  /*
     Salad Makers — gathered 2026-09-09 from own-domain
     they are: Salads, wraps & sandwiches
     logo: https://studio-mobile-app-prod.s3.amazonaws.com/public_web/logo/ws_39uJ6tP98HgAQs9W7jqHAdztMrI/3402-c-3-b-1-466-c-4129-9503-0-a-40-a-63-d-8-db-1.png — not cut into a tile yet
     flag: Glenn: 'Brentwood • Goods'
     flag: No explicit hours schedule is printed anywhere on the site; the /menu page only shows a dynamic 'Open now' status with no weekly hours listed, so hours is null.
     flag: No email address is published anywhere on the site.
     flag: No Instagram link or handle appears on the home page or menu page; instagram is null.
     flag: The site is a single-page ordering site (home page + /menu ordering page, built on the 'Revi' platform) with no separate /location, /hours, or /about URLs to check.
     flag: No second location is mentioned anywhere on the site.
     flag: Two priced menu items are marked 'Out Of Stock (Be Back Soon!)' as of this research: Broccoli Cheddar soup ($8.99) and Polar beverage ($3.25); both are kept in items since they carry printed prices.
     flag: Printed address has no ZIP code: the menu page shows only '2565 Sand Creek Road, Brentwood, CA'.
     flag: Address with the suite and ZIP, and the handle saladmakers_brentwood, are from Glenn's screenshots of their own site's Find Us page and their own Instagram profile, which links saladmakers.net
     flag: Hours contradict between their own pages: the site's Find Us page says Mon-Sat 11am-6pm, Sun 11am-5pm; their Instagram bio says Mon-Sat 11am-7pm, Sun 11am-6pm — so none are carried
  */
  'salad-makers': {
    address: "2565 Sand Creek Rd, Ste 136, Brentwood, CA 94513",
    phone: "(925) 634-0718",
    instagram: "saladmakers_brentwood",
    cuisine: "Salads, wraps & sandwiches",
    tagline: "Fast-casual salad, sandwich, wrap and soup shop in Brentwood, CA",
    sections: [
      { name: "Salad Makers' Favorite Salads", items: [
        ["Chicken Apple Crisp Salad","Mix greens, romaine, grilled chicken, apples, blue cheese, walnuts, dried cranberries, and balsamic vinaigrette dressing",1399],
        ["Cobb Salad","Mix greens, romaine, grilled chicken, bacon, carrots, tomatoes, avocado, egg, blue cheese and ranch dressing.",1499],
        ["Asian Chicken Salad","Mix greens, grilled chicken, carrots, almonds, mandarin oranges, wonton crisps, tossed sesame dressing.",1399],
        ["Brentwood House Salad","Mix greens, romaine, almonds, pears, blue cheese, topped with honey dijon mustard, and tossed with balsamic vinaigrette dressing",1299],
        ["BBQ Salad","Mix greens, romaine, bbq chicken, corn, tomatoes, onions, cheddar cheese and crispy strips with ranch.",1399],
      ] },
      { name: "Classic Salads", items: [
        ["Chicken Caesar Salad","Romaine, tossed in our special caesar dressing with croutons and parmesan cheese.",1299],
        ["Make Your Own Salad","",1399],
        ["Buffalo Chicken Salad","Mix greens, romaine, chicken with buffalo sauce, bacon, tomatoes, onions, blue cheese and ranch",1399],
        ["Greek Salad","Mix greens, romaine, cucumbers, tomatoes, olives, red onions, feta cheese",1399],
        ["Tuna Salad","Mix greens, romaine, white tuna, wonton, bell peppers, onions, tomatoes, cucumbers. Your choice of dressing",1399],
        ["Daily Salad Special","Today's Special",1099],
      ] },
      { name: "Combos", items: [
        ["Salad & Soup Combo","Pick half salad/ soup",1899],
        ["Sandwich & Soup Combo","Pick half sandwich/ soup",1899],
        ["Sandwich & Salad Combo","Pick half salad/ half sandwich",1899],
      ] },
      { name: "Sandwiches", items: [
        ["Pesto Chicken Panini","On a Ciabatta bread with pesto ranch, chicken, mozzarella and tomatoes.",1299],
        ["Turkey Pesto Panini","On a sourdough with pesto sauce, turkey, swiss cheese and tomatoes.",1299],
        ["BBQ Chicken Panini","On a sourdough with chicken, lettuce, tomatoes, onions, cheddar cheese and BBQ sauce.",1299],
        ["Turkey Avocado Club","Toasted on sourdough, all natural turkey, onions, cucumber, lettuce, bacon, avocado and house mayo.",1399],
        ["Grilled Cheese","",1149],
        ["Pesto Cheese Panini","On a sourdough with swiss, parmesan, mozzarella and pesto sauce",1299],
        ["Ribeye Steak Sandwich","Ribeye, mayo, bbq sauce, and tomato. On ciabatta",1499],
        ["BLT","",1299],
        ["Tuna Melt","White tuna, mayo, lettuce, tomato and swiss cheese. On sourdough",1299],
      ] },
      { name: "Wraps", items: [
        ["Chicken Caesar Pita","",1399],
        ["Buffalo Chicken Wrap","Buffalo chicken, bacon, tomatoes, onions, blue cheese and ranch",1399],
        ["Salad Wrap","",1399],
        ["Chicken Gyro","Warm pita with lettuce, tomatoes, onion, & tzatziki sauce.",1399],
        ["Ribeye Gyro","Warm pita with lettuce, tomatoes, onion, & tzatziki sauce.",1399],
        ["Turkey Wrap","",1399],
      ] },
      { name: "Soup", items: [
        ["Chicken Tortilla Soup","",899],
        ["Clam Chowder","Creamy Style New England Chowder",899],
        ["Broccoli Cheddar","",899],
        ["Tomato Bisque","",899],
        ["Butternut Squash Soup","",899],
      ] },
      { name: "Pizza", items: [
        ["Cheese Pizza","10” pizza. Thin crust delicious cauliflower dough pizza with mozzarella cheese and pizza sauce",1100],
        ["Pepperoni Pizza","10” Pizza",1300],
        ["Build your own Pizza","10” pizza",1400],
        ["Pesto Cheese Pizza","10” Pizza. Thin crust delicious cauliflower dough pizza with mozzarella cheese and pesto sauce",1200],
      ] },
      { name: "Sides", items: [
        ["Boiled Egg","",250],
        ["Cookies","",325],
        ["Rice Krispie","",325],
        ["Side Chicken","",250],
        ["Warm Pita","",199],
        ["Toasted Sourdough","",175],
        ["Side Avocado","",175],
        ["Chips","",225],
        ["Balsamic Vinaigrette","",200],
        ["Caesar Dressing","",200],
        ["Feta Cheese (Greek) Dressing","",200],
        ["Honey Mustard Dressing","",200],
        ["Ranch","",200],
        ["Toasted Sesame Dressing","",200],
        ["Italian Dressing","",200],
        ["Jalapeno Ranch","",200],
        ["Blue Cheese Dressing","",200],
        ["Olive Oil & Balsamic Vinegar","",200],
        ["Raspberry Vinaigrette","",200],
        ["Thousand Island Dressing","",200],
      ] },
      { name: "Kids", items: [
        ["Kids Grilled Cheese","Soft toasted whole wheat white bread",1000],
        ["Kids Salad Two toppings","",1000],
        ["Kids Cheese Pizza","",1000],
        ["Kids Mac & Cheese","",1000],
      ] },
      { name: "Beverages", items: [
        ["Coke","",275],
        ["Dr.Pepper","",275],
        ["Gatorade","",350],
        ["Snapple","",350],
        ["Kids juice","",200],
        ["Sparkling Water","",350],
        ["Water","",275],
        ["La Croix","",350],
        ["Izze","",350],
        ["Arizona Iced Tea","",325],
        ["Polar","",325],
        ["Kombucha","",399],
        ["Energy Drink","",399],
      ] },
    ],
    siteNote: "Prices come from saladmakers.net/menu, the business's own in-house ordering page (built on the 'Revi' ordering platform); the static homepage does not list prices.",
  },

  /*
     The Sandwich Monkey — gathered 2026-09-09 from own-domain
     their spelling: "SANDWICH MONKEY" (roster keeps "The Sandwich Monkey")
     they are: Sandwiches
     logo: https://img1.wsimg.com/isteam/ip/36917ad0-efd1-4e42-95ce-59336e468a4d/logo/ee08cbb2-6554-4f3d-b953-6eb8899b9d2f.png (2560x2560) — not cut into a tile yet
     flag: the 'Menu' page contains no menu at all
     flag: HOURS CONFLICT on their own site: the visible widget says 'Open today 10am-4pm' while their structured data lists Mon-Fri 10-4, Sun 10:30-4 and a garbled Saturday that closes before it opens — none carried
     flag: second location: 121 Spear Street, San Francisco 94105, (415) 251-1054
     flag: the Instagram link goes to a location page, not a profile
     flag: menu: 48 items read from https://thesandwichmonkey.com/menu on 2026-09-04
  */
  'sandwich-monkey': {
    address: "3 Plaza View Lane, Suite V, Foster City, CA 94404",
    phone: "(650) 274-0264",
    cuisine: "Sandwiches",
    sections: [
      { name: "Drawing Board Sandwiches", items: [
        ["Drawing Board COLD","Build your own sandwich. All sandwiches come with Signature Garlic Pesto Sauce, Mayonnaise, Mustard, Lettuce, Tomatoes, Onions and Pickles",1550,"sandwich-monkey-drawing-board-cold"],
        ["Drawing Board Toasted","Build your own sandwich. All sandwiches come with Signature Garlic Pesto Sauce, Mayonnaise, Mustard, Lettuce, Tomatoes, Onions and Pickles",1550,"sandwich-monkey-drawing-board-toasted"],
      ] },
      { name: "Clubhouse Sandwiches", items: [
        ["#15 Porky’s Pulled Pork","SLOW ROASTED PULLED PORK, SLAW AND BBQ SAUCE",1550,"sandwich-monkey-15-porky-s-pulled-pork"],
        ["#1 King Louie (T)","HONEY HAM, BREADED CHICKEN PATTIES, SWISS CHEESE, GARLIC-PESTO SAUCE, MAYONNAISE, LETTUCE, TOMATOES, PICKLES, ONIONS (TOASTED HOT)",1550,"sandwich-monkey-1-king-louie-t"],
        ["#4 Brass Monkey (T)","MEATBALLS, PROVOLONE CHEESE, MARINARA SAUCE (TOASTED HOT)",1550,"sandwich-monkey-4-brass-monkey-t"],
        ["#8 Harvest Monkey","TURKEY, CREAM CHEESE, CRANBERRY SAUCE, LETTUCE, TOMATOES",1550,"sandwich-monkey-8-harvest-monkey"],
        ["#5 Tempting Tuna Melt (T)","ALBACORE TUNA SALAD (CELERY, PICKLED RELISH, MAYONNAISE), AMERICAN CHEESE, SALT, PEPPER (TOASTED HOT)",1550,"sandwich-monkey-5-tempting-tuna-melt-t"],
        ["#13 Angry Monkey (T)","GRILLED CHICKEN, PEPPER JACK CHEESE, SAFARI SAUCE, ROASTED RED PEPPERS, JALAPENOS, PEPPERONCINIS, LETTUCE, ONIONS (TOASTED HOT)",1550,"sandwich-monkey-13-angry-monkey-t"],
        ["#2 Monkey's Uncle (T)","PASTRAMI, SWISS CHEESE, SAUERKRAUT, THOUSAND ISLAND DRESSING, LETTUCE, TOMATOES, PICKLES, ONIONS (TOASTED HOT)",1550,"sandwich-monkey-2-monkey-s-uncle-t"],
        ["#6 BBQ Bonanza (T)","ROAST BEEF, BACON, CHEDDAR CHEESE, BBQ SAUCE, LETTUCE, TOMATOES, PICKLES, ONIONS (TOASTED HOT)",1550,"sandwich-monkey-6-bbq-bonanza-t"],
        ["#3 Roasted Rascal (T)","ROAST BEEF, CREAM CHEESE, SAFARI SAUCE, LETTUCE, TOMATOES, PICKLES, ONIONS (TOASTED HOT)",1550,"sandwich-monkey-3-roasted-rascal-t"],
        ["#10 Bonobo (T)","MOZZARELLA CHEESE, BALSAMIC VINEGAR, OLIVE OIL, TOMATOES, BASIL, SALT, PEPPER (TOASTED HOT)",1550,"sandwich-monkey-10-bonobo-t"],
        ["#9 Avo Gobble","TURKEY, AMERICAN CHEESE, AVOCADO, MAYONNAISE, MUSTARD, LETTUCE, TOMATOES, PICKLES, ONIONS",1550,"sandwich-monkey-9-avo-gobble"],
        ["#7 Monkey Business","TURKEY, BACON, HAM, MAYONNAISE, HONEY MUSTARD, LETTUCE, TOMATOES, PICKLES, ONIONS",1550,"sandwich-monkey-7-monkey-business"],
        ["#12 Italian Jungle","SALAMI, CAPICOLA, PROSCIUTTO, MORTADELLA, PROVOLONE CHEESE, GARLIC SAUCE, OLIVE OIL, VINEGAR, ARTICHOKE HEARTS, PEPPERONCINIS, LETTUCE, TOMATOES, PICKLES",1550,"sandwich-monkey-12-italian-jungle"],
        ["#11 Goodall","ARTICHOKE HEARTS, ROASTED RED PEPPERS, AVOCADO, PEPPERONCINIS, CUCUMBERS, GARLIC SAUCE, MAYONNAISE, MUSTARD, LETTUCE, TOMATOES, PICKLES, ONIONS",1550,"sandwich-monkey-11-goodall"],
      ] },
      { name: "Drinks", items: [
        ["Gatorade","",325,"sandwich-monkey-gatorade"],
        ["San Pellegrino Flavored Soda","",295,"sandwich-monkey-san-pellegrino-flavored-soda"],
        ["San Pellegrino Sparkling Water","",250,"sandwich-monkey-san-pellegrino-sparkling-water"],
        ["Soda 12 oz cans","",285,"sandwich-monkey-soda-12-oz-cans"],
      ] },
      { name: "Chips", items: [
        ["Dirty Chips Mesquite BBQ","2 oz. bag Dirty Chips Mesquite BBQ",295,"sandwich-monkey-dirty-chips-mesquite-bbq"],
        ["Dirty Chips: Salt and Vinegar","2 oz. bag Dirty Chips: Salt & Vinegar",295,"sandwich-monkey-dirty-chips-salt-and-vinegar"],
        ["Dirty Chips: Sour Cream & Onion","2oz. bag Dirty Chips: Sour Cream & Onion",295,"sandwich-monkey-dirty-chips-sour-cream-onion"],
        ["Dirty Chips: Jalepano Heat","2oz bag Dirty Chips: Jalepani Heat",295,"sandwich-monkey-dirty-chips-jalepano-heat"],
        ["Dirty Chip: Sea Salt","2 oz. bag Dirty Chips: Sea Salt",295,"sandwich-monkey-dirty-chip-sea-salt"],
        ["Dirty Chip: Cracked Pepper & Sea Salt","2 oz. bag Dirty Chips: Cracked Pepper & Sea Salt",295,"sandwich-monkey-dirty-chip-cracked-pepper-sea-salt"],
        ["Dirty Chip: Maui Onion","2 oz. bag Dirty Chips: Maui Onion",295,"sandwich-monkey-dirty-chip-maui-onion"],
        ["Dirty Chips Funky Fusion","2 oz. bag Dirty Chips Funky Fusion",295,"sandwich-monkey-dirty-chips-funky-fusion"],
        ["Metro Deli: Original Sea Salt Kettle Chips","1.38 oz. Bag : Metro Deli Original Sea Salt Kettle Chips",250,"sandwich-monkey-metro-deli-original-sea-salt-kettle-chip"],
        ["Metro Deli: Spicy Dill Pickle Kettle Chips","1.38 oz. Bag : Metro Deli Spicy Dill Pickle Kettle Chips",250,"sandwich-monkey-metro-deli-spicy-dill-pickle-kettle-chip"],
        ["Metro Deli: Jalapeño Cheddar Kettle Chips","1.38 oz. Bag : Metro Deli Jalapeno Cheddar Kettle Chips",250,"sandwich-monkey-metro-deli-jalape-o-cheddar-kettle-chips"],
      ] },
      { name: "Kid's Classic Sandwiches", items: [
        ["Kids ROAST BEEF","",800,"sandwich-monkey-kids-roast-beef"],
        ["Kids HONEY HAM","",800,"sandwich-monkey-kids-honey-ham"],
        ["Kids TURKEY","",800,"sandwich-monkey-kids-turkey"],
        ["Kids NUTELLA, STRAWBERRY & BANANA","",800,"sandwich-monkey-kids-nutella-strawberry-banana"],
        ["Kids PEANUT BUTTER & BANANA","",800,"sandwich-monkey-kids-peanut-butter-banana"],
        ["Kids PEANUT BUTTER & JELLY","",800,"sandwich-monkey-kids-peanut-butter-jelly"],
        ["LIL' RASCALS GRILLED CHEESE","",800,"sandwich-monkey-lil-rascals-grilled-cheese"],
      ] },
      { name: "Soups and boxes", items: [
        ["Chicken Tortilla Soup","",595,"sandwich-monkey-chicken-tortilla-soup"],
        ["Tomato Basil Soup","",595,"sandwich-monkey-tomato-basil-soup"],
        ["Club House Lunch Boxes","",1895],
      ] },
      { name: "Salads", items: [
        ["#1 Caesar Salad","ROMAIN LETTUCE, PARMESAN CHEESE, GARLIC CROUTONS, CAESAR DRESSING",1195,"sandwich-monkey-1-caesar-salad","from $11.95"],
        ["#3 Tuna Salad","ROMAIN & SPRING MIX LETTUCE, TUNA SALAD, CUCUMBERS, RED ONIONS, TOMATOES, BLACK OLIVES, AVOCADO, ITALIAN DRESSING",1395,"sandwich-monkey-3-tuna-salad"],
        ["#4 BBQ Chicken Salad","ROMAIN LETTUCE, GRILLED CHICKEN, TOMATOES, CORN, BLACK BEANS, RED ONIONS, SHREDDED CHEDDAR, TORTILLA STRIPS, RANCH/BBQ SAUCE DRESSING",1395,"sandwich-monkey-4-bbq-chicken-salad"],
        ["#5 Italian Antipasto Salad","ROMAIN LETTUCE, SALAMI, ARTICHOKE HEARTS, RED ONIONS, BLACK OLIVES, TOMATOES, GARBANZO BEANS, PEPPERONCINIS, PROVOLONE CHEESE, PARMESAN CHEESE",1395,"sandwich-monkey-5-italian-antipasto-salad"],
        ["#6 Southwest Salad","ROMAIN LETTUCE, GRILLED CHICKEN, CORN, TOMATOES, AVOCADO, ROASTED RED PEPPERS, BLACK BEANS, RED ONIONS, SHREDDED CARROTS, TORTILLA STRIPS",1395,"sandwich-monkey-6-southwest-salad"],
        ["#7 Greek Salad","ROMAINE LETTUCE, CUCUMBER, RED ONION, TOMATOES, BELL PEPPERS, FETA CHEESE, BLACK OLIVES, OLIVE OIL , RED WINE VINEGAR",1395,"sandwich-monkey-7-greek-salad"],
        ["#2 NOBO Salad","SPRING MIX LETTUCE, MOZZARELLA, BASIL, TOMATOES, BALSAMIC VINAIGRETTE",1395,"sandwich-monkey-2-nobo-salad"],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Santa Clara Super Kitchen — gathered 2026-09-09 from own-domain
     they are: Halal catering
     logo: https://assets.cdn.filesafe.space/eB7n0OPlq05vyyLG9vE5/media/69ef20660d66f2a66587db87.png (866x288) — not cut into a tile yet
     flag: name alternates on the site: 'Santa Clara Super Kitchen' (title, logo, copyright) vs 'Santa Clara Super Kitchens' (About and FAQ)
     flag: no street address published — location given only as 'Santa Clara, California'
     flag: uses 'tasting' site-wide where 'catering' is plainly meant
     flag: second phone published as 'Online Ordering': (669) 310-5261; separate catering email catering@santaclarasuperkitchen.com
     flag: hero and gallery use Unsplash stock photos; copyright line still says 2025
     flag: Menu sweep 2026-09-09, still no readable prices: No item-level prices are published anywhere on santaclarasuperkitchen.com (homepage '#menus' section, /food-tasting, /contact were all checked); the site's 'View Full Menu' button just anchors back to the same homepage section, which shows category tiles (Breakfast, Lunch, Dinner, Healthy, Salad Bar
     flag: Menu sweep 2026-09-09: No street address is published anywhere on the site (homepage, /contact, /food-tasting) - only 'Santa Clara, California' is given, with no street number.
     flag: Menu sweep 2026-09-09: No hours of operation are published anywhere on the site.
     flag: Menu sweep 2026-09-09: Two different phone numbers serve different purposes: +1 (669) 310-5261 is labeled for 'online ordering' while +1 (669) 600-0201 is the general call number (used here as phone).
     flag: Menu sweep 2026-09-09: Email addresses render only as literal placeholder text in fetched content (appear JavaScript/anti-scraping obfuscated on the live site) and could not be captured as real addresses, so email was left null.
     flag: Menu sweep 2026-09-09: This is a shared/ghost-kitchen operator running multiple sub-brands (e.g. Jerk & Java, House of the Best Seafood Boil, Willy Billy Smoked Meat; site claims 22+ cuisines and 350+ menu items) rather than a single restaurant menu.
     flag: Menu sweep 2026-09-09: The research brief describes this business as 'halal catering' but no page fetched (home, /food-tasting, /contact) explicitly mentions halal certification, so that claim could not be verified from the site.
  */
  'santa-clara-super-kitchen': {
    phone: "(669) 600-0201",
    email: "info@santaclarasuperkitchen.com",
    instagram: "santaclarasuperkitchen",
    cuisine: "Halal catering",
    tagline: "'California's premier shared kitchen network' selling halal corporate",
    contactOnly: "'California's premier shared kitchen network' selling halal corporate. They claim '350+ menu options' and 'transparent pricing' but publish no menu items or prices; quotes come through a tasting-request form.",
  },

  /*
     Señor Sisig — gathered 2026-09-09 from own-domain
     they are: Filipino fusion
     logo: https://images.getbento.com/accounts/ab73e9d161ec9b04042370bad74771a9/media/images/17855logo.png (900x260) — not cut into a tile yet
     flag: three more shops plus trucks: Ferry Building (1 Ferry Building Suite 41), Thrive City (151 Warriors Way Suite 103), Oakland (330 17th Street, 94612)
     flag: the Thrive City address is published with ZIP 94518, which is not a San Francisco ZIP
     flag: name written both 'Señor Sisig' and 'Senor Sisig' on the same pages
     flag: Menu sweep 2026-09-09, still no readable prices: senorsisig.com/menu/ and /order/ list dish names and descriptions (Classics, Featured Items, Vegano, Kids Menu, Dessert, Beverages) but no prices anywhere in the static page. The Oakland location's dedicated ordering storefront, which would show real prices - https://order.online/store/senor-sisig-o
     flag: Menu sweep 2026-09-09: Señor Sisig has multiple locations (990 Valencia St and 1 Ferry Building and 151 Warriors Way in San Francisco, 330 17th St in Oakland, plus food trucks); this file is scoped to the Oakland, CA location only, per instructions.
     flag: Menu sweep 2026-09-09: Hours contradiction between the site's own pages: senorsisig.com/locations/ lists Oakland hours as Sun-Wed 11am-8pm / Thu-Sat 11am-9pm, while the dedicated senorsisig.com/location/oakland/ page lists Mon-Sun 11am-9pm for the same location. Hours set to null due to this conflict.
     flag: Menu sweep 2026-09-09: No phone number is published for the Oakland location on either the /locations/ directory or the /location/oakland/ page.
     flag: Menu sweep 2026-09-09: Menu items (name + description only, no prices) found: Classics - Sisig Taco, Senor Sisig Burrito, California Sisig Burrito, Tosilog Burrito, Sisig Nachos, Sisig Fries, Sisig Rice Bowl, Senor Sisig Burrito Bowl, Tosilog Bowl, Sisig Salad; Featured - Umami Ube Crab Sandwich; Vegano (vegan versions of
  */
  'senor-sisig': {
    address: "990 Valencia St, San Francisco, CA 94110",
    phone: "(855) 747-4455",
    email: "contact@senorsisig.com",
    hours: "Daily 11am-9pm",
    instagram: "senorsisig",
    cuisine: "Filipino fusion",
    tagline: "'From Sisig Burritos to Sinigang Wings, we remix traditional Filipino",
    photos: [
      {"src":"/food/senor-sisig-site-2-lg.webp","alt":"","credit":"Their own photo, from senorsisig.com"},
      {"src":"/food/senor-sisig-site-3-lg.webp","alt":"","credit":"Their own photo, from senorsisig.com"},
      {"src":"/food/senor-sisig-site-4-lg.webp","alt":"","credit":"Their own photo, from senorsisig.com"},
      {"src":"/food/senor-sisig-site-5-lg.webp","alt":"","credit":"Their own photo, from senorsisig.com"},
      {"src":"/food/senor-sisig-site-7-lg.webp","alt":"","credit":"Their own photo, from senorsisig.com"},
      {"src":"/food/senor-sisig-site-8-lg.webp","alt":"","credit":"Their own photo, from senorsisig.com"},
    ],
    contactOnly: "'From Sisig Burritos to Sinigang Wings, we remix traditional Filipino. The menu page lists every item with no prices — sisig tacos, burritos, fries, nachos, rice bowls, the Crispy Sinigang Wings — and prices live only inside their ordering flow.",
  },

  /*
     Shaka Shack — gathered 2026-09-09 from stopgap
     they are: Hawaiian brunch
     flag: their only site is a Square Online store — the operator's own 'Needs website'
     flag: the site's About and Catering pages return 404 while the footer advertises catering, corporate lunches and restaurant buyouts
     flag: Instagram bio says the profile is being rebuilt: 'mahalo for the follow, help rebuilding our Instagram ohana'
     flag: menu: 59 items read from https://shaka-shack.square.site/s/order#most-popular on 2026-09-04
  */
  'shaka-shack': {
    address: "2300 Blanding Ave, Alameda, CA 94501",
    phone: "(510) 305-8754",
    email: "shakashackeats@gmail.com",
    hours: "Mon-Tue, Thu-Sun 8:30am-3pm, closed Wed",
    instagram: "shakashackeats",
    cuisine: "Hawaiian brunch",
    needsSite: true,
    sections: [
      { name: "Lunch", items: [
        ["Kai's Plate Lunch","Plate with your choice of meat and salad. Lava Chicken or Kalua Pork, Tutu’s Mac Salad or Kimchi Cucumber.",1700,"shaka-shack-kai-s-plate-lunch","from $17.00"],
        ["Lava Chicken Tropi-Cobb Salad","Mango, pineapple, tomato, avocado, edamame, bacon, egg, feta, romaine, lava chicken w/ pineapple balsamic",1800,"shaka-shack-lava-chicken-tropi-cobb-salad"],
        ["Big Kahuna Loco Moco","Burger, Kalua Pork, Portuguese sausage w/ Fried Rice",2600,"shaka-shack-big-kahuna-loco-moco"],
        ["Squirt's Kalua Pork Loco Moco","Kalua Pork, Rice, Eggs, Gravy add burger $4",1900,"shaka-shack-squirt-s-kalua-pork-loco-moco"],
        ["Poke Wrap","Rice, Slaw, Cucumber, Edamame, Avocado, Furikake, Seaweed Salad, Ginger wrapped in a spinach tortilla",2000,"shaka-shack-poke-wrap"],
        ["Poke Salad","Romaine Lettuce, Slaw, Cucumber, Edamame, Avocado, Furikake, Seaweed Salad, Ginger",2000,"shaka-shack-poke-salad"],
        ["Poke Bowl","Rice, Slaw, Cucumber, Edamame, Avocado, Furikake, Seaweed Salad, Ginger",2000,"shaka-shack-poke-bowl"],
        ["Syd's Loco Moco","Burger, Rice, Eggs your way, Gravy",1900,"shaka-shack-syd-s-loco-moco"],
        ["Stella's Kalbi Rib Loco Moco","Kalbi Ribs & an egg your way over rice topped with gravy",2400,"shaka-shack-stella-s-kalbi-rib-loco-moco"],
        ["Teri Chicken Tropi-Cobb Salad","Mango, pineapple, tomato, avocado, edamame, bacon, egg, feta, romaine, teri chicken w/ pineapple balsamic.",1800,"shaka-shack-teri-chicken-tropi-cobb-salad"],
      ] },
      { name: "Coffee", items: [
        ["Tea","",300],
        ["Latte","",600,"shaka-shack-latte"],
        ["Americano","",500],
        ["Iced Taro Vietnamese Coffee","",700,"shaka-shack-iced-taro-vietnamese-coffee"],
        ["Macchiato","",600,"shaka-shack-macchiato"],
        ["Caramel Macchiato","",700,"shaka-shack-caramel-macchiato"],
        ["Capuccino","",600,"shaka-shack-capuccino"],
        ["Iced Latte","",600,"shaka-shack-iced-latte"],
        ["Drip Coffee","",500,"shaka-shack-drip-coffee"],
      ] },
      { name: "Snacks", items: [
        ["Musubi","Spam Musubi",500,"shaka-shack-musubi"],
        ["Hawaiian Chili","Portuguese sausage, spam, beef, & bacon w/ black, pinto, kidney & white beans over rice topped w/ green onions, shredded cheese & hawaiian roll",1500,"shaka-shack-hawaiian-chili"],
        ["Fried Rice Cup","Spam Fried Rice",500,"shaka-shack-fried-rice-cup"],
        ["Kimchi Cucumber","Kimchi Cucumber Salad",400,"shaka-shack-kimchi-cucumber"],
        ["Side Portuguese Sausage","",500,"shaka-shack-side-portuguese-sausage"],
        ["Side Burger","",600],
        ["Side Spam","",500,"shaka-shack-side-spam"],
        ["Side Lava Chicken","",600,"shaka-shack-side-lava-chicken"],
        ["Tutu's Mac Salad","Great grandma’s recipe w/ spaghetti noodles",400,"shaka-shack-tutu-s-mac-salad"],
        ["Side Kalbi Ribs","",1100],
        ["Side Teri Chicken","",600],
        ["Side Kalua Pork","",600],
        ["Side Bacon","",500,"shaka-shack-side-bacon"],
      ] },
      { name: "Keiki menu (12 and under)", items: [
        ["Keiki (Kids) Spam, Eggs, Rice Breakfast","Spam, Eggs, Rice",1000,"shaka-shack-keiki-kids-spam-eggs-rice-breakfast"],
        ["Keiki (Kids) Loco Moco","Small Loco Moco",1200,"shaka-shack-keiki-kids-loco-moco"],
        ["Keiki (Kids) Ube Waffle","",1000,"shaka-shack-keiki-kids-ube-waffle"],
        ["Keiki (Kids) Mini Dogs","Mini Hot Dogs w/ Side of Fresh Fruit",1000,"shaka-shack-keiki-kids-mini-dogs"],
        ["Keiki (Kids) Grilled Cheese","Grilled Cheese w/ Side of Fresh Fruit",1000,"shaka-shack-keiki-kids-grilled-cheese"],
        ["Keiki (Kids) Mini Burger","Slider w/ Side of Fresh Fruit",1000,"shaka-shack-keiki-kids-mini-burger"],
        ["Keiki (Kids) Teri Chicken Plate Lunch","Kids Size Teri Chicken Plate Lunch",1200],
      ] },
      { name: "Breakfast", items: [
        ["Steak (Kalbi) & Eggs","Kalbi Short Ribs, Eggs your Way",2200,"shaka-shack-steak-kalbi-eggs"],
        ["Garden Breakfast Bowl","Eggs your way, House Potatoes, Bell Peppers, Spinach, Onions, Avocado, feta Cheese, Tomatoes, w/ Salsa",1700,"shaka-shack-garden-breakfast-bowl"],
        ["Ube Mochi Waffles","Ube Mochi Waffle w/ Ube Syrup & Fresh Fruit",1700,"shaka-shack-ube-mochi-waffles"],
        ["Da Kine","2 Eggs Your Way, House Potatoes, Rice, Hawaiian Roll Toast",1600,"shaka-shack-da-kine"],
        ["Garden Breakfast Burrito","House Potatoes, Bell Peppers, Spinach, Onions, Eggs, Avocado, feta Cheese, Tomatoes Wrapped in a Spinach Tortilla w/ Salsa",1700,"shaka-shack-garden-breakfast-burrito"],
        ["Hawaiian Roll French Toast","Hawaiian Rolls Turned Into Tasty French Toast Bites w/ Ube Syrup & Fresh Fruit",1700,"shaka-shack-hawaiian-roll-french-toast"],
        ["Ube Waffles","Ube Waffles w/ Ube Syrup & Fresh Fruit",1700,"shaka-shack-ube-waffles"],
        ["Matcha Mochi Waffle","Matcha Mochi Waffle w/ Ube Syrup & Fresh Fruit",1700,"shaka-shack-matcha-mochi-waffle"],
        ["Mac Nut Waffle","Mac Nut Waffle w/ Fresh Fruit",1700,"shaka-shack-mac-nut-waffle"],
      ] },
      { name: "Sweets", items: [
        ["Pineapple Upside Down Cake","",500,"shaka-shack-pineapple-upside-down-cake"],
        ["Ube Mochi","",500,"shaka-shack-ube-mochi"],
        ["Malasadas","One Malasada option of filling and sugaring on the outside.",300,"shaka-shack-malasadas"],
        ["Malasada Filling Sampler Half Dozen","6 filled malasadas, one of each of our 6 fillings",2100,"shaka-shack-malasada-filling-sampler-half-dozen"],
        ["Malasada Filling Sampler Dozen","12 filled malasadas, two of each of our 6 fillings",4200,"shaka-shack-malasada-filling-sampler-dozen"],
      ] },
      { name: "Drinks", items: [
        ["Pineapple POG","",500,"shaka-shack-pineapple-pog"],
        ["Coke/Diet Coke","",200],
        ["POG Juice","POG = Passion Fruit, Orange, Guava",500,"shaka-shack-pog-juice"],
        ["Lilikoi Lemonade","",500,"shaka-shack-lilikoi-lemonade"],
        ["Coconut Water","",300],
        ["Hawaiian Sun","Randomly Selected Hawaiian Sun (Based on Availability)",300,"shaka-shack-hawaiian-sun"],
      ] },
    ],
    siteNote: "Prices and photos are from their own Square ordering page.",
  },

  /*
     SIA Collective — gathered 2026-09-09 from own-domain
     they are: Streetwear and footwear
     logo: https://siacollective.com/cdn/shop/files/textblack_f738e4c5-6cda-4366-bcf8-f74e6f69342a.png (3651x1530) — not cut into a tile yet
     flag: brand written 'sia collective' (header), 'SIA Collective' and 'SIACLTV' (about); logo wordmark reads 'siacltv'
     flag: no physical address, phone or social links anywhere — email only, which fits the online-only filing
     flag: the only hours published are email-support hours, Mon-Fri 9-5 PST, not carried as shop hours
  */
  'sia-collective': {
    email: "siasupport@siacollective.com",
    cuisine: "Streetwear and footwear",
    items: [
      ["XSV Sneaker (Rattlesnake)","",23999],
      ["SIA-NARRA 510 (Touch Grass)","A vintage performance runner rebuilt through a distinctly SIA lens",17999],
      ["EVO Foam Trainer (Pigeon)","Flexible moulded foam with breathable cutout detailing",2499],
      ["Rerun High (Royal)","",4999],
      ["Double Waist Short (Black)","",8999],
      ["Y2K Hoodie (SIAPPLE)","Distressed relaxed hoodie",3999],
      ["SIA-NARRA 510 Shirt (Touch Grass)","",3999],
    ],
    siteNote: "191 priced products in their Shopify catalogue; sub-$2 listings are Route shipping-protection add-ons and $999.99 items are made-to-order reservations, neither listed here.",
  },

  /*
     Simply Soups — gathered 2026-09-09 from own-domain
     their spelling: "Simply Soups and More" (roster keeps "Simply Soups")
     they are: Soul food
     logo: https://storage.googleapis.com/msgsndr/JC1YUdvjnhXZlLhDoj4c/media/69784cc8a87bebf1d8313907.jpg (500x500) — not cut into a tile yet
     flag: logo reads 'SIMPLY SOUPS and more... ESTD 2024'
     flag: site calls itself 'New in Antioch'; every menu button leads off-site to order.online
  */
  'simply-soups': {
    address: "3103 Delta Fair Blvd, Antioch, CA 94509",
    phone: "(925) 420-0783",
    hours: "Tue-Sun 11am-8pm, closed Mon",
    instagram: "simply.soupsandmore",
    cuisine: "Soul food",
    photos: [
      {"src":"/food/simply-soups-site-0-lg.webp","alt":"Fresh soul food plate from Simply Soups and More in Antioch","credit":"Their own photo, from simplysoupsandmore.com"},
      {"src":"/food/simply-soups-site-1-lg.webp","alt":"Simply Soups and More Soul Bowl — base, protein and two homestyle sides","credit":"Their own photo, from simplysoupsandmore.com"},
    ],
    items: [
      ["Soul Bowl","Build your own: a base, a protein and two sides",2999],
    ],
    siteNote: "Only the Soul Bowl is priced on their own site; the rest of the menu sits behind order.online links.",
  },

  /*
     Sol Taqueria — gathered 2026-09-09 from own-domain
     they are: Jalisco-style Mexican
     logo: https://static.wixstatic.com/media/fab297_42e925a7e2a14b0c8cb14ff9b5e5d2e0~mv2.png (889x1123) — not cut into a tile yet
     flag: footer hours are typed 'MOn-Thur 10-9PM' with no AM marker on the ten
     flag: the 'Follow Us!' section embeds an Instagram widget but no handle appears anywhere in the HTML
     flag: the drink flyer spells 'MARAGARITAS'
     flag: menu: 48 items read from https://www.soltaqueriaberkeley.com/menus on 2026-09-05
  */
  'sol-taqueria': {
    address: "1335 San Pablo Ave, Berkeley, CA 94702",
    phone: "(510) 529-4325",
    email: "SolTaqueriaBerkeley@gmail.com",
    hours: "Mon-Thu 10am-9pm, Fri-Sun 8am-9pm",
    cuisine: "Jalisco-style Mexican",
    sections: [
      { name: "Specials", items: [
        ["Huarache","Flattened, giant, deep-fried tortilla layered with beans, your choice of meat, cheese, salsa, onion, and cilantro. Our signature special!",1995,"sol-taqueria-huarache"],
        ["Molcajete","a bowl carved out of a volcanic stone, is seasoned and used to hold a curated selection of meats, seafood and vegetables.",2999,"sol-taqueria-molcajete"],
        ["Piña Loca","Pineapple filled with a mix of seafood, meats, vegetables and cheese. One of our customers favorites.",2500,"sol-taqueria-pi-a-loca"],
        ["Fajitas Plate","Served with a side of rice, beans, sour cream, and pico de gallo Choice of flour or corn tortillas on the side.",1950,"sol-taqueria-fajitas-plate"],
      ] },
      { name: "Plates", items: [
        ["Carne Asada Plate","Served with rice, beans, lettuce, guacamole, sour cream, and pico de gallo",1750,"sol-taqueria-carne-asada-plate"],
        ["Carnitas Plate","Served with rice, beans, lettuce, guacamole, sour cream, and pico de gallo",1750,"sol-taqueria-carnitas-plate"],
        ["Camarones a La Diabla","Served with rice, beans, lettuce, guacamole, sour cream, and pico de gallo",2295,"sol-taqueria-camarones-a-la-diabla"],
        ["Chilaquiles Rojos o Verdes","Tortilla chips, 2 eggs, salsa, cheese, sour cream, cilantro. Side rice and beans.",1695,"sol-taqueria-chilaquiles-rojos-o-verdes"],
        ["Breakfast Skillet Bowl","Potatoes, 2 eggs, meat, cheese, sour cream, cilantro, salsa.",1695,"sol-taqueria-breakfast-skillet-bowl"],
        ["Chile Relleno Burrito","Served with arroz, fripinto, queso, crema, guacamole, pico de gallo, chile relleno.",1450,"sol-taqueria-chile-relleno-burrito"],
        ["Wet Burrito","meat, rice, beans, sour cream, pico de gallo, guacamole, and cheese, wet in red or green sauce",1735],
        ["Cafe","",399],
      ] },
      { name: "Tacos", items: [
        ["Regular Taco","Served with meat, onion, cilantro and salsa.",375,"sol-taqueria-regular-taco"],
        ["Served with meat, onion, cilantro, salsa and cheese.","",475,"sol-taqueria-served-with-meat-onion-cilantro-salsa-an"],
        ["Super Taco","Meat, lettuce, cheese, sour cream, guacamole, cilantro.",595,"sol-taqueria-super-taco"],
        ["Taco Plate","Served with rice and beans on two tacos with meat",1150,"sol-taqueria-taco-plate"],
        ["Fish Taco","Fish, salsa, lettuce, pico de gallo,",745,"sol-taqueria-fish-taco"],
        ["Shrimp Taco","Shrimp, lettuce, cabbage, and salsa.",750,"sol-taqueria-shrimp-taco"],
      ] },
      { name: "Breakfast", items: [
        ["Breakfast Burrito","Eggs, potato, cheese, salsa and choice of meat (chorizo, bacon, ham,)",1350,"sol-taqueria-breakfast-burrito"],
        ["Huevos con Chorizo","Eggs with chorizo. Served with rice, bean, meat, lettuce, sour cream, pico de gallo.",1550,"sol-taqueria-huevos-con-chorizo"],
        ["Huevos con Jamon","Eggs with Ham. Served with rice, beans, meat, lettuce, sour cream, pico de gallo.",1550,"sol-taqueria-huevos-con-jamon"],
        ["Huevos Rancheros","Eggs served on top of tortillas. Served with rice, bean, meat, lettuce, sour cream, pico de Gallo.",1550,"sol-taqueria-huevos-rancheros"],
      ] },
      { name: "Tortas", items: [
        ["Torta","Choice of meat, Beans, Sour Cream, lettuce, onion, tomatoes, jalapeño, avocado, cheese",1595,"sol-taqueria-torta"],
      ] },
      { name: "Burritos", items: [
        ["Super Burrito","Served with arroz, frijol de olla, pico de gallo, guacamole, queso, crema, meat.",1550,"sol-taqueria-super-burrito"],
        ["Regular Burrito","Served with arroz, frijol, meat, pico de gallo.",1425,"sol-taqueria-regular-burrito"],
        ["Baby Burrito","Served with rice, beans, cheese, beans and cheese",1050,"sol-taqueria-baby-burrito"],
        ["Veggie Burrito","Served with rice, beans, crema, queso, pico de gallo, lechuga.",1399,"sol-taqueria-veggie-burrito"],
      ] },
      { name: "Nachos", items: [
        ["Super Nachos","Tortilla chips, meat, beans, cheese, sour cream, guacamole, pico de gallo.",1550,"sol-taqueria-super-nachos"],
        ["Regular Nachos","Tortilla chips, beans, cheese, sour cream, guacamole, pico de gallo.",1425,"sol-taqueria-regular-nachos"],
        ["Crazy Fries","Potatoes, meat, cheese, guacamole, sour cream, pico de gallo.",1599,"sol-taqueria-crazy-fries"],
      ] },
      { name: "Quesadillas", items: [
        ["Super Quesadilla","Large Flour tortilla, cheese, meat, sour cream, guacamole, pico de gallo.",1550,"sol-taqueria-super-quesadilla"],
        ["Regular Quesadilla","flour tortilla, cheese.",399,"sol-taqueria-regular-quesadilla"],
        ["Quesabirria","Corn tortilla, birria, cheese, salsa verde, onion, cilantro, served with consome broth.",599,"sol-taqueria-quesabirria"],
      ] },
      { name: "Combination Plates", items: [
        ["1 Item Combo Plate","Served with rice and beans.",1275,"sol-taqueria-1-item-combo-plate"],
        ["2 Items Combo Plate","Served with rice and beans.",1599,"sol-taqueria-2-items-combo-plate"],
        ["3 Items Combo Plate","Served with rice and beans.",1899],
      ] },
      { name: "Super Bowls", items: [
        ["Fish Super Bowl","Served with rice, pinto beans, lettuce, sour cream, cheese, pico de gallo, guacamole, and cilantro.",1599,"sol-taqueria-fish-super-bowl"],
        ["Chicken Super Bowl","Served with rice, pinto beans, lettuce, sour cream, cheese, pico de gallo, guacamole, and cilantro.",1599,"sol-taqueria-chicken-super-bowl"],
        ["Kids Quesadilla","Flour tortilla, cheese, served with rice and beans.",600,"sol-taqueria-kids-quesadilla"],
        ["Kids Taco","Meat only Taco served with rice and beans.",600,"sol-taqueria-kids-taco"],
      ] },
      { name: "Desserts", items: [
        ["Churro","",324,"sol-taqueria-churro"],
        ["Cheesecake","",450,"sol-taqueria-cheesecake"],
        ["Flan","",575,"sol-taqueria-flan"],
      ] },
      { name: "Drinks", items: [
        ["Soda Lata","Coke, Diet Coke, Squirt, Pepsi.",225],
        ["Jarritos","",375],
        ["Snapple","Fruit Punch, Strawberry kiwi, Apple",350],
        ["Mexican Soda","1/2 Litro.",495],
      ] },
      { name: "Aguas frescas", items: [
        ["Horchata and Jamaica","",375],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     Stella Pastry & Cafe — gathered 2026-09-09 from none
     they are: Italian bakery/cafe
     flag: Menu sweep 2026-09-09: first research record for this seat
     flag: No own-domain website or Toast/Square/ChowNow/order.online storefront run by the business could be located via one WebSearch (plus one follow-up ordering-platform-focused search).
     flag: Search results were dominated by third-party marketplace/review listings (DoorDash, Uber Eats, Postmates, Grubhub, Tripadvisor, Yelp) and apparent auto-generated directory-spam mirrors (e.g. stellaspastry.mapsite.site, stella-pastry-cafe.bartgrocerybbq.com, stella-pastry.com-place.com, stella-pastry.wheree.com, stella-pastry-cafe.menu-world.com) that are not the business's own site.
     flag: A distinctly named business, 'Stella's Bakery' (stellasbakery.us), also appeared in search results but is a different business and was not used.
     flag: Per sourcing rules, address/phone/hours seen in search-result summaries (sourced from Yelp/DoorDash/Tripadvisor) were not populated into this record.
     flag: name_exact reflects the name given in the research request, not text confirmed on an owned site.
  */
  'stella-pastry': {
    cuisine: "Italian bakery/cafe",
    tagline: "Italian bakery and cafe in San Francisco's North Beach",
  },

  /*
     Street Social — gathered 2026-09-09 from own-domain
     their spelling: "Street..Social" (roster keeps "Street Social")
     they are: Seasonal American
     logo: https://images.squarespace-cdn.com/content/v1/5a2049faf14aa151d0ec4334/f0326e03-39e4-4ab3-a148-d56c5d930f88/Screen%2BShot%2B2021-07-06%2Bat%2B10.36.03%2BAM.jpg — not cut into a tile yet
     flag: Glenn: 'Petaluma • Goods'
     flag: Hours are inconsistent across their own pages/profiles: the About page says 'Dinner tuesday - Friday 5:30 until 9:00' (one uniform schedule), but the homepage/menu page instead treats Tuesday as a distinct 'Golden Fried Chicken... Dine in with us from 5:30 until Sold out. No reservations' event and Wednesday as a separate, unspecified 'Neighborhood Night'; their own Instagram bio adds a third variant, 'Tuesday - Friday 5:30-9ish / Saturdays are for private,' which is not mentioned on the website at all. Because these disagree, hours is set to null.
     flag: No menu prices are published as text anywhere on the site; prices_published is false and items is empty as a result (see price_note).
     flag: Site spells its own name inconsistently: the homepage and About page both render it as 'Street..Social,' while an embedded San Francisco Chronicle quote on the homepage, plus the site's own domain (streetsocial.social) and email, use plain 'Street Social' with no punctuation.
     flag: Their own contact email (streetsocialla@gmail.com) still carries an 'LA' suffix from the brand's Los Angeles founding (per the About page's history: founded 2013 in LA, then Central Coast, then Sonoma County, permanent Petaluma location since 2020) — this is a naming remnant, not a second active location; only one operating address (Petaluma) is listed on the site.
     flag: Phone printed the way their own Instagram contact sheet prints it, (707) 774-6185; the site writes 707.774.6185
  */
  'street-social': {
    address: "29 F Petaluma Boulevard North, Petaluma, California 94952",
    phone: "(707) 774-6185",
    email: "streetsocialla@gmail.com",
    instagram: "street_social",
    cuisine: "Seasonal American",
    tagline: "Small chef-driven restaurant serving seasonal food and craft cocktails",
    contactOnly: "Small chef-driven restaurant serving seasonal food and craft cocktails. Their menu is published only as a photograph on the homepage, which the Menu link opens, so no prices are printed here; the one shown is dated 08.28.26.",
  },

  /*
     SupTea Lab — gathered 2026-09-09 from stopgap
     they are: Boba and Taiwanese snacks
     logo: https://suptealaboakland.square.site/uploads/b/bcb2fda72610bd6712fe73e313670e34259b6a3cdae75d0a3a0f53a37060193a/LOGO%20Final_design_01_1708289189.jpg (2048x2048) — not cut into a tile yet
     flag: no address, phone or hours anywhere — 'Oakland' appears only in the square.site subdomain
     flag: unedited Square brewery template copy on the homepage: 'Our most popular beers', 'Visit our brewery for lunch'
     flag: the Menu, Merch, About, Events and Locations nav pages all 404
     flag: menu: 46 items read from https://suptealaboakland.square.site/#66QIIDSPPAGSPZC7T2PAOI64 on 2026-09-05
  */
  'suptea-lab': {
    email: "info@suptealab.com",
    instagram: "suptealab",
    cuisine: "Boba and Taiwanese snacks",
    needsSite: true,
    sections: [
      { name: "Drinks and snacks", items: [
        ["Chai Tea Latte","Originating in India. A well Balance of aromatic spices and creamy and sweetness",575,"suptea-lab-chai-tea-latte"],
        ["Matcha Latte","Ceremonial grade Matcha from Uji Japan. The perfect match for your morning.",699,"suptea-lab-matcha-latte"],
        ["Milk Tea","Perfectly brew using high-pressure technique, correct temperature, and high-quality loose-leaf tea to achieve the best cup of tea you will ever had.",550,"suptea-lab-milk-tea"],
        ["B05 Fried Spring Roll（4）-春卷","Veggie Fried Spring Roll.",550,"suptea-lab-b05-fried-spring-roll-4"],
        ["Thai Tea","the best classic Thai tea you will ever have in town.",550,"suptea-lab-thai-tea"],
        ["B02 Fried Chicken Wings(5)-炸鸡翼","Mouth watering wings.",799,"suptea-lab-b02-fried-chicken-wings-5"],
        ["Strawberry Potion","Make with fresh strawberry and Spring Tea. Highly recommended for a hot day. Tips: Amazing with Osmanthus Jelly! and 50% sugar",600,"suptea-lab-strawberry-potion"],
        ["B01 Popcorn Chicken -盐酥鸡","Juicy Thigh meat with our well balance seasoning. The best popcorn chicken in town.",850,"suptea-lab-b01-popcorn-chicken"],
        ["B03 Fried Chicken Steak-炸鸡排","Crispy and Juicy. A bite to die for",699,"suptea-lab-b03-fried-chicken-steak"],
        ["B04 Fried Calamari-炸鱿鱼","Crispy, Tender and Juicy. Perfect for a treat.",850,"suptea-lab-b04-fried-calamari"],
        ["B09 Sesame balls（6）-芝麻球","Slightly Sweet and Crispy Sesame balls with red bean filling.",399,"suptea-lab-b09-sesame-balls-6"],
        ["Freshly Passion","Refreshing Jasmine tea with Passion fruit. The best you will ever had.",575,"suptea-lab-freshly-passion"],
        ["Grape Potion","Jasmine Green Tea with the combination of Kyoto Red Grape and Green Grape Jelly. Great treat for a Hot day.",600,"suptea-lab-grape-potion"],
        ["B17 French Fries-炸薯条","Fluffy inside, and crispy skins Freshly fried every single batch. Make to order.",599,"suptea-lab-b17-french-fries"],
        ["Overly-Peach","Peach Oolong green tea with fresh peach for the maximum flavor!",600,"suptea-lab-overly-peach"],
        ["B11 Salt & Pepper Tofu-椒盐豆腐","Soft from the inside, Crispy from the outside. PERFECTION!",599,"suptea-lab-b11-salt-pepper-tofu"],
        ["B10 Taishan Style Savory Waffle-炉底糍（咸）","Fluffy and slightly savory, with fresh taro and sausage bite. One Unique Waffle you will never forget.",850,"suptea-lab-b10-taishan-style-savory-waffle"],
        ["A03 Popcorn Chicken Over Rice-盐酥鸡飯","Our Freshly made Popcorn Chicken on a bed of warm rice with seasonal veggie.",1150,"suptea-lab-a03-popcorn-chicken-over-rice"],
        ["B12 Hand Grabbed Pancake with Fried Chicken Steak-炸鸡排手抓饼","Crispy Fried Chicken wrap in a nice and flakey pancake.",950,"suptea-lab-b12-hand-grabbed-pancake-with-fried-chic"],
        ["B06 Hong Kong Style EggPuff-鸡蛋仔","Satisfy your cravings with Hong Kong-style egg puffs where soft meets airy for an irresistible snacking pleasure.",750,"suptea-lab-b06-hong-kong-style-eggpuff"],
        ["B08 Sweet Waffle-炉底糍（甜）","Fluffy, Slightly sweeten with condensed milk.",750,"suptea-lab-b08-sweet-waffle"],
        ["Mango Osmanthus","Jasmin green tea and mango puree, top it off with our Osmanthus flower Jelly. You can taste Autumn is coming.",600,"suptea-lab-mango-osmanthus"],
        ["A02 Fried Chicken Wing Over Rice（6）-炸鸡翼飯","Freshly make friend chicken wings over a bed of white rice with seasonal veggie.",1299,"suptea-lab-a02-fried-chicken-wing-over-rice-6"],
        ["A07 Salt & Pepper Tofu Over Rice-椒盐豆腐飯","Freshly make Salt and Pepper Tofu over a bed of white rice with seasonal veggie",1050,"suptea-lab-a07-salt-pepper-tofu-over-rice"],
        ["A06 Teriyaki Chicken Over Rice-照烧鸡飯","Sweet and Tangy Teriyaki Chicken over a bed of White Rice, with Seasonal Veggie. Lunch can be quick and delicious.",1350,"suptea-lab-a06-teriyaki-chicken-over-rice"],
        ["B18Curly Fries-炸螺旋薯条","Curly fries are a popular variation of traditional French fries. Crispy Texture, Only missing ketchup, and YOU",750,"suptea-lab-b18curly-fries"],
        ["A08 Fried Chicken Steak Over Rice-炸鸡排飯","Freshly make fried chicken steak over a bed of white rice with seasonal veggie.",1150,"suptea-lab-a08-fried-chicken-steak-over-rice"],
        ["Classic Tea \"No Milk\"","Freshly brew Tea. Ice or Hot.",500],
        ["B13 Crab Wonton (6) 蟹角","Imitation crab with cream cheese and green onion. Handmade to perfection.",750,"suptea-lab-b13-crab-wonton-6"],
        ["B14 Mozzarella Cheese Stick (6) - 芝士條","Mouth watering Cheese Stick. Crispy Goodness!",650,"suptea-lab-b14-mozzarella-cheese-stick-6"],
        ["A05 Salt & Pepper Fish over Rice - 椒鹽魚片飯","Classic Salt and Pepper Fish over a warm bed of rice. Crispy and Juicy.",1350,"suptea-lab-a05-salt-pepper-fish-over-rice"],
        ["B16 Tonkatsu (Pork Cutlet) - 吉列豬排","Indulge in the irresistible crispy goodness of Tonkatsu, a traditional Japanese pork cutlet that promises a perfect golden crunch with each bite",750,"suptea-lab-b16-tonkatsu-pork-cutlet"],
        ["Mango Creme","Mango Smoothie with our specialty sweet cream. Simply perfection.",650,"suptea-lab-mango-creme"],
        ["A04 Tonkatsu over Rice - 吉列豬排飯","Hungry??? Experience the crispy perfection of pork Tonkatsu over a bed of fluffy rice",1250,"suptea-lab-a04-tonkatsu-over-rice"],
        ["B15 Salt & Pepper Fish - 椒鹽魚片","Experience the authentic flavors of Chinese salt and pepper fish, a tantalizing snack that will surely satisfy your cravings",850,"suptea-lab-b15-salt-pepper-fish"],
        ["A01 Unagi Over Rice-鰻魚飯","Savor the exquisite flavors of tender unagi drizzled over a bed of steaming rice, a traditional Japanese delicacy that will tantalize your taste buds",1499,"suptea-lab-a01-unagi-over-rice"],
        ["Salt & Pepper Shrimp over Rice + Thai Tea- 椒鹽蝦飯+泰式茶","Classic Salt and Pepper Fish over a warm bed of rice. Crispy and Juicy.",1499,"suptea-lab-salt-pepper-shrimp-over-rice-thai-tea"],
        ["Lychee Potion","Refreshing, Gentle sweetness from Lychee, with a Hint of peach :) perfect for a hot day. Owner Tips: add Lychee Jelly and do 0% sweet. Heavenly",600,"suptea-lab-lychee-potion"],
        ["Lychee Shake","Creamy and gently sweet from lychee. slightly caffeinated with green tea. Owner tips: Best enjoying this FRESHly made in Store",650,"suptea-lab-lychee-shake"],
        ["Grape Elixir *Limited","A perfect fusion of bold Kyoho Grapes and refreshing Green Grapes, infused with the natural energy of Oolong Tea. Sweet, Tangy, and absolutely delicious",775,"suptea-lab-grape-elixir-limited"],
        ["Kiwi Elixir","House made fresh Kiwi Puree, with refreshing orange green tea. Osmanthus Jelly included",675,"suptea-lab-kiwi-elixir"],
        ["Coco Fresh Ube","Coconut Milk, with Ube. Creamy and Sweet goodness",600,"suptea-lab-coco-fresh-ube"],
        ["Mango Coco","Fresh and delightful mango smoothie with our Coconut milk. The match made from heaven.",775,"suptea-lab-mango-coco"],
        ["Strawberry Shake","Creamy and Refreshing. Sweetness and slightly tangy from strawberry, combine with cream and green tea to create this love potion. Love is only one sip away",625,"suptea-lab-strawberry-shake"],
        ["SupTea Lab Fruit Tea","The Ultimate fruit tea. Well balance of passionfruit , orange, apple, and peach.",625,"suptea-lab-suptea-lab-fruit-tea"],
        ["Purple Dragon","Refreshing Peach Oolong green tea, slightly sweet purple dragon fruit. Great for Hydration!",675,"suptea-lab-purple-dragon"],
      ] },
    ],
    siteNote: "Prices and photos are from their own Square ordering page.",
  },

  /*
     Sushinaloa — gathered 2026-09-09 from own-domain
     they are: Mexican sushi & mariscos
     logo: https://static.wixstatic.com/media/fab297_f800a1a601ea4b00b5ae55559451c71b~mv2.png (960x960) — not cut into a tile yet
     flag: Operator's exact note: Redwood City • Goods — the 'Goods' category does not fit; their own site and Instagram both call it a Restaurant
     flag: Operator spelled it 'Sushi Naloa'; the business spells it 'Sushinaloa' (one word) on its site title, footer, logo and Instagram display name 'Sushinaloa - Redwood City'
     flag: Phone contradiction on their own homepage: visible text and tel: links (including the 'Reserve A Table' button) say (650) 771-1620, but the hidden schema.org block says telephone 6503894597; used the visible number
     flag: Hours contradiction on their own site: visible footer says 'Wednesday-Monday: 10AM-10PM / Tuesday: CLOSED', but the hidden schema.org data and Wix business schedule list only Sun and Wed-Sat 10:00-22:00, with a malformed day-less entry where Monday should be; used the visible hours
     flag: Zip shown two ways on their own site: footer says 94063, hidden structured data and the ordering page say 94063-2825 (zip+4, consistent)
     flag: Online-ordering page footer reads '© 2035 by Business Name. Built on Wix Studio' (unedited template placeholder) while the homepage footer reads '© 2026 by Studio Siete'; the /experiences page carries the same placeholder
     flag: A menu named 'Test' (single item 'Test', $0, description 'Vfdsvfdavrsa', modifier 'No mayo') is publicly visible as a tab on the menu and ordering pages; excluded from items
     flag: Price contradiction: Caldo de Camarón and Caldo de Pescado are $24.20 under Tacos y Caldos but $22 as variants of '7 Mares' under Mariscos Calientes
     flag: Duplicate items across menus: 'Mariscada' $65.95 appears under both Mariscos and Mariscos Calientes; 'Milkshake' $9.90 under both Bebidas and Postres
     flag: Dietary labels look wrong: the 'Chipotle' roll (asada) and 'Ceviche Sierra' (fish) are tagged 'Vegetarian'
     flag: Typos/oddities in item names: 'Michealda de Mango', 'Brucheta Sushi', 'Tacos Clasicos(3)'; 'Coctel ' and 'Cerveza ' carry trailing spaces; sub-menus 'Sushi', 'Mariscos Calientes' and 'Bebidas' all carry the copied description 'Mariscos Estilo Sinaloa'
     flag: Nearly all online prices equal a round dollar amount plus 10% (e.g. $13.20, $16.50, $24.20, $29.70); in-store prices may differ, so verify before quoting
     flag: Ordering page showed 'Accepting Orders' with Pickup / Delivery / Dine-In at fetch time, but the default 'Delivery time: Today 8:00 AM' is earlier than the 10AM opening; menu sections are split into 'Sides/Appetizers' (menu) and 'Sides/Starters' (section)
     flag: Homepage buttons 'Order Pick-Up' and 'Order Delivery' are not hyperlinked (only 'See Menu' and 'Order Online' go to /online-ordering); footer words 'Party Reservations', 'Catering' and 'View Menu' are plain text; 'Reserve A Table' is a tel: link, while a separate /reservations page ('Request a reservation') exists and /book-online says 'Nothing to book right now'
     flag: The website has no social links; the Instagram handle sushinaloarwc comes from the operator's profile screenshot (bio: "Redwood City's First Mexican-Sushi Restaurant", '2505 Middlefield Rd, Redwood City, CA', 'Mariscos estilo Sinaloa, Micheladas y mas', link sushinaloarwc.com); no hours, phone or prices are published on Instagram
     flag: The Instagram profile links a Facebook page labeled 'Suchinaloa Quintero' (misspelled with a 'c')
     flag: Site is a Wix Studio site on their own domain with built-in Wix Restaurants ordering; no third-party ordering platform (DoorDash/Toast/etc.) is linked; the homepage links a Telemundo interview ('As Seen on Telemundo!')
  */
  'sushi-naloa': {
    address: "2505 Middlefield Rd, Redwood City, CA 94063",
    phone: "(650) 771-1620",
    email: "sushinaloacatering@gmail.com",
    hours: "Wed-Mon 10am-10pm, closed Tue",
    instagram: "sushinaloarwc",
    cuisine: "Mexican sushi & mariscos",
    tagline: "Sinaloa-style mariscos and Mexican sushi in Redwood City since 2013",
    sections: [
      { name: "Sides/Starters", items: [
        ["Guacamole","",1320],
        ["Empanadas de Camaron","",1870],
        ["Camarones Cucarachas","",2420],
        ["Chicharrones de Pescado","",2190],
        ["Super Nachos","",1980,null,"Asada or Chicken; Shrimp or Octopus +$2"],
      ] },
      { name: "Tacos y Caldos", items: [
        ["Tacos Gobernador","Shrimp or Marlin",1870],
        ["Taco Capeado (3)","SHRIMP - FISH - OCTOPUS",1650],
        ["Quesabirrias","Comes with 3 quesabirrias, consume, and toppings.",1870],
        ["Siete Mares Soup","",2530],
        ["Tacos Clasicos(3)","",1320,null,"Asada or Chicken; Shrimp or Octopus +$2"],
      ] },
      { name: "Mariscos (Estilo Sinaloa)", items: [
        ["Aguachile","",2640],
        ["Aguachile Negro","",2750],
        ["Campechana","Shrimp, octopus, oyster, and scallop.",2860],
        ["Torre","Shrimp, scallop, octopus, crab, cucumber, avocado, and chiltepin.",3295],
        ["Botana Mazatlan","Fish, ceviche, shrimp, octopus, scallop, and oysters.",4290],
        ["Aguachile en su Piedra","Shrimp, scallop, cucumber, and tomato.",3190],
        ["Mariscada","",6595],
      ] },
      { name: "Ceviches / Tostadas", items: [
        ["Tostada Perrona","Shrimp, octopus, scallop, crab, and avocado.",1754],
        ["Ceviche de Camaron","Shrimp Ceviche",990,null,"Tostada $9.90 / Plate $23"],
        ["Ceviche Mixto","Shrimp and octopus.",1100,null,"Tostada $11 / Plate $25.24"],
      ] },
      { name: "Sushi", items: [
        ["Divorciado","Shrimp, asada, cream cheese, avocado, cucumber, and unagi sauce.",2085],
        ["Venenoso","Crab, avocado, cucumber, chiltepin, onion, and chipotle sauce.",2194],
        ["Cocono","Shrimp, avocado, cucumber, surimi, coconut, mango, and chipotle sauce.",2085],
        ["Spicy Tuna","Tuna, cream cheese, avocado, and jalapeño.",2415],
        ["California","Cream cheese, avocado, and cucumber.",1865],
        ["Salmon Roll","Salmon, cream cheese, avocado, and cucumber.",2415],
        ["Bacon Roll","Shrimp, bacon, mozzarella cheese, avocado, and cucumber.",2415],
      ] },
      { name: "Mariscos Calientes", items: [
        ["Molcajete","Shrimp, chicken, pork, and steak with side of rice.",3295],
        ["Mojarra","FRITA // AL AJO // A LA DIABLA. Rice and salad on the side.",2300],
        ["Camarones Envueltos","Bacon-wrapped shrimp.",2415],
        ["Salmon a la Plancha","Choice of Tilapia available.",2970],
        ["Camarones a La Diabla","",2300,null,"A La Diabla, Camarones Rancheros or A La Plancha, $23 each"],
      ] },
      { name: "Bebidas", items: [
        ["Michelada","",1210,null,"Regular $12.10; Con Camaron $19.80; Perrona or La Buchona $30.80"],
        ["Cubeta (6)","",3190],
        ["Barrilito (1LT)","",2420],
        ["Agua Fresca","",550],
        ["Piña Colada","",1310],
      ] },
      { name: "Kid's Menu", items: [
        ["Tenders","",1760],
        ["Plain Quesadilla","Cheese only.",1100],
      ] },
      { name: "Postres", items: [
        ["Flan","",660],
        ["Banana Split","",1100],
      ] },
      { name: "Trays (Catering)", items: [
        ["Charola Especial","Special tray with Sushi Venenoso, Sushi Cocono, Camarones Envueltos y Empanizados, Flautas, Camarones Cucaracha, Chicharrón Chino, and Empanadas de Camarón.",12500],
        ["Full Sushi Tray","For 50 people",10000],
      ] },
    ],
    siteNote: "Prices from the Wix menu data on their own site (sushinaloarwc.com/menu, the same menus behind /online-ordering); hours, address, phone and email from the homepage footer.",
  },

  /*
     Tastin Peachy — gathered 2026-09-09 from stopgap
     they are: Catering
     flag: no address published; the bio says Bay Area, CA
     flag: the tagline is their bio line
  */
  'tastin-peachy': {
    phone: "510-685-7876",
    email: "TastinPeachy@gmail.com",
    instagram: "tastinpeachy",
    cuisine: "Catering",
    needsSite: true,
    tagline: "Bay Area catering: don't let your taste buds miss this",
    contactOnly: "Bay Area catering: don't let your taste buds miss this. No website yet, so catering enquiries go by phone or email, and they publish no prices.",
  },

  /*
     The Farmacy — gathered 2026-09-09 from own-domain — BLOCKED: Cloudflare managed challenge on every page including robots.txt; nothing readable
     flag: every page is behind a Cloudflare challenge; only the sitemap is served, and its slugs describe a chicken concept — strips and chips, fried and rotisserie chicken sandwiches — not a cafe
     flag: menu: 21 items read from https://www.farmacysf.com/menu on 2026-09-05
  */
  'the-farmacy': {
    sections: [
      { name: "Handhelds", items: [
        ["Fried Chicken Sandwich","Crispy chicken thigh, honey chipotle aioli, shaved cabbage, pickles, brioche bun",1250,"the-farmacy-fried-chicken-sandwich"],
        ["Diablo Spicy Chicken Sandwich","Crispy chicken thigh, house diablo sauce, shredded lettuce, pickles, brioche bun",1325],
        ["Rotisserie Chicken Sandwich","Herb-roasted chicken, lemon aioli, arugula, tomato, brioche bun",1225],
        ["Plant-Based Chicken Sandwich (Tindle™)","Crispy Tindle™ chicken, vegan aioli, pickles, shredded lettuce",1275],
        ["Chicken Smash Burger *Limited Time Special*","Smashed seasoned chicken patty, American cheese, caramelized onions, pickles, Farmacy sauce",1395,"the-farmacy-chicken-smash-burger-limited-time-specia"],
      ] },
      { name: "Strips & Chips", items: [
        ["Classic Crispy Chicken Strips & Chips","Our special golden fried chicken",1295,"the-farmacy-classic-crispy-chicken-strips-chips"],
        ["Hot Honey Chicken Strips & Chips","Crispy chicken tossed in hot honey glaze",1395,"the-farmacy-hot-honey-chicken-strips-chips"],
        ["Diablo Chicken Strips & Chips","Crispy chicken tossed in house diablo sauce",1395,"the-farmacy-diablo-chicken-strips-chips"],
        ["Asian Chili Chicken Strips & Chips","Sweet-spicy chili glaze",1395,"the-farmacy-asian-chili-chicken-strips-chips"],
      ] },
      { name: "Signature Bowls", items: [
        ["Mediterranean Bowl","Jasmine rice, cucumber-tomato salad, olives, fried scallions, tzatziki. Add crispy, rotisserie, plant-based, or Diablo-style chicken for $3",1395,"the-farmacy-mediterranean-bowl"],
        ["Asian Sesame Bowl","Jasmine rice, sesame slaw, cucumbers, scallions, soy-ginger glaze, chili crisp. Add crispy, rotisserie, plant-based, or Diablo-style chicken for $3",1395,"the-farmacy-asian-sesame-bowl"],
        ["Warm Power Bowl","Greens + grains, roasted seasonal vegetables, avocado, house vinaigrette. Add crispy, rotisserie, plant-based, or Diablo-style chicken for $3",1295],
      ] },
      { name: "Signature Salads", items: [
        ["Kale Caesar","Chopped kale, parmesan, sourdough croutons, Caesar dressing. Add crispy, rotisserie, plant-based, or Diablo chicken for $3",1275,"the-farmacy-kale-caesar"],
        ["Asian Crunch Salad","Mixed greens, cabbage, carrots, sesame seeds, crispy wontons, ginger vinaigrette. Add crispy, rotisserie, plant-based, or Diablo chicken for $3",1375,"the-farmacy-asian-crunch-salad"],
        ["Mediterranean Chopped Salad","Chopped romaine & arugula, cherry tomatoes, cucumber, olives, red onion, feta, lemon oregano vinaigrette. Add crispy, rotisserie, plant-based",1375],
      ] },
      { name: "Soup & Sides", items: [
        ["Soup Of The Day (Chicken Noodle)","",695],
        ["Daily-Made Farmacy Chips","",395,"the-farmacy-daily-made-farmacy-chips"],
        ["Sesame Asian Slaw","",595],
      ] },
      { name: "Sweets", items: [
        ["Soft Serve","Rotating Flavor (French Vanilla)",595,"the-farmacy-soft-serve"],
      ] },
      { name: "Boxed Lunches", items: [
        ["Plant‑Based Tindle Sandwich","Each box includes a plant-based Tindle sandwich (plant-based chicken, vegan aioli, lettuce, tomato & red onion on a toasted vegan bun) and chips.",1875],
      ] },
      { name: "Salads", items: [
        ["Kale Caesar Salad","Petite kale, parmesan, and toasted croutons tossed in house-made Caesar dressing. Choose rotisserie chicken, fried chicken, or plant-based protein.",1750],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     The Hangout — gathered 2026-09-09 from own-domain
     their spelling: "The Hangout Breakfast" (roster keeps "The Hangout")
     they are: Breakfast and brunch
     logo: https://static.wixstatic.com/media/4498e5_d17e57814acd47d6829b1586449b2574~mv2.png (1558x1441) — not cut into a tile yet
     flag: second location: 2217 Morello Avenue, Pleasant Hill 94523, (925) 671-9925, daily 8am-3pm — that is the other seat
     flag: the footer says 'The Hangout'; the title and domain say 'The Hangout Breakfast'
     flag: menu: 79 items read from https://www.thehangoutbreakfast.com/menu on 2026-09-05
  */
  'the-hangout-breakfast': {
    address: "1908 Tice Valley Blvd, Ste A, Walnut Creek, CA 94595",
    phone: "(925) 546-3122",
    hours: "Mon-Fri 8am-2:30pm, Sat-Sun 8am-3pm",
    instagram: "thehangoutbayarea",
    cuisine: "Breakfast and brunch",
    photos: [
      {"src":"/food/the-hangout-breakfast-site-0-lg.webp","alt":"breakfast at the hangout","credit":"Their own photo, from thehangoutbreakfast.com"},
      {"src":"/food/the-hangout-breakfast-site-1-lg.webp","alt":"cold drinks","credit":"Their own photo, from thehangoutbreakfast.com"},
      {"src":"/food/the-hangout-breakfast-site-2-lg.webp","alt":"Walnut Creek","credit":"Their own photo, from thehangoutbreakfast.com"},
    ],
    sections: [
      { name: "Menu", items: [
        ["Loco Moco","Beef patty & rice, bell, mushroom, onion, fried egg and curry & gravy sauce mixed",2300],
        ["Gai Gra Prow","Ground chicken, basil, onion, bell, garlic, pepper, and fried egg over rice.",2200],
        ["Chick Pops","Crispy fried chicken and bite waffle",1400,"the-hangout-breakfast-chick-pops"],
        ["Ube Pancake","Fluffy purple yam pancakes topped with fresh strawberries, blueberries, and grapes, served with a side of ube sauce.",2000],
        ["SIDE Bacon","Crispy, savory bacon strips, perfectly rendered for a delicious crunch.",700],
        ["The Hangout Omelet","Bacon, avocado, tomato, Cheddar, and homemade bacon jam",2600],
        ["Sausage Scramble","CK apple sausage, spinach, onion, and Cheddar cheese",2300],
        ["Side Two Eggs","Choice of two eggs: Up, Over Easy, Over Medium, Over Hard, Poached, Poached Medium, Poached Hard, Scrambled, Egg Whites, or No Egg.",700],
        ["Buttermilk Pancake","Fluffy buttermilk pancakes topped with fresh strawberries, blueberries, grapes, a dollop of butter, and a dusting of powdered sugar. Syrup served on the side.",1800],
        ["Garlic Noodles","Garlic Noodles Green onion, Parmesan cheese Choice of meat Crispy Chicken or Tiger prawns",2300],
        ["Chicken & Waffle","Served with homemade spicy maple syrup",2500],
        ["Side Pancake","A single pancake, often served as a delightful complement to any meal.",700],
        ["Salmon Avocado Toast","Cherry tomato, pickled shallot, and caper",1700,"the-hangout-breakfast-salmon-avocado-toast"],
        ["Avocado Toast","Strawberries, basil, and fresh mozzarella",1500,"the-hangout-breakfast-avocado-toast"],
        ["Morning Poutine","Fries, bacon, fried egg, Pepper Jack cheese, curry & gravy sauce mixed",1400],
        ["Mixed Berries Parfait","Greek yogurt, granola, almond, and mixed berries",1200],
        ["Rosemary Fries","Crispy potato wedges seasoned with fresh rosemary.",900],
        ["Healthy Pig","Brussels sprouts, Parmesan, and bacon jam",1300],
        ["Two Eggs Any Style","Variety of styles. Accompanied by a choice of crispy potato, fries, mixed greens, or mixed fruits. Select wheat toast, ciabatta, English muffin",1600],
        ["Western Scramble","Bacon, avocado, tomato, Cheddar, homemade bacon jam",2300],
        ["Italian Piggy Scramble","Pork wine sausage, cherry tomato, onion, scallion, cheddar",2300],
        ["Trio Scramble","Bacon, CK apple sausage, pork wine sausage, basil, and Cheddar cheese",2400],
        ["Farmer Scramble","Tofu, baby kale, onion, mushroom, tomato and bell pepper",2100],
        ["Under the Sea Omelet","Smoked salmon, crab, tiger prawn, bacon, bell pepper, and Pepper Jack",3300],
        ["Crab Benedict","Crab, cherry tomato, avocado, Parmesan, and hollandaise",3300],
        ["Flying Pig Benedict","Bacon, baby kale, tomato, avocado, and hollandaise",2200],
        ["49Er Benedict","Smoked salmon, avocado, capers, and wasabi hollandaise",2200],
        ["Black Forest Benedict","Black Forest Ham, tomato, asparagus , hollandaise",2200],
        ["Sausage Benedict","CK apple sausage, bell, onion, and spicy hollandaise",2200],
        ["Crispy Chicken Benedict","Cherry tomato, red bell pepper, onion, and spicy hollandaise",2500],
        ["Florentine Benedict","Sautéed spinach, tomato, Parmesan, and hollandaise",2000],
        ["Hangover","Stir-fried Italian noodle, basil, bell, onion, mushroom, CK apple, bacon, and fried egg",2200,"the-hangout-breakfast-hangover"],
        ["Chick Katsu Curry","Crispy chicken & rice, fried Yukon, fried egg and curry & gravy sauce mixed",2400],
        ["Choco Banana Pancake","Served with homemade chocolate sauce and almond",2000],
        ["Monster Hotcakes","1 French toast , 3 Pancakes, 2 Eggs, 3 Bacon, or Ham, or 2 Chicken apple, or GarlicPork wine",3300],
        ["Lemon Creme Anglaise Pancake","Served with homemade lemon cream anglaise",2000],
        ["Classic Waffle","Golden waffle topped with fresh strawberries, blueberries, grapes, orange slices, and a sprig of rosemary, lightly dusted with powdered sugar",1700],
        ["Sunrise French Toast","Thick slices of French toast topped with assorted fresh berries, grapes, and orange slices, dusted with powdered sugar.",1700],
        ["Cha Thai Pancake","Served with homemade Thai tea sauce",2000],
        ["Berries Lover Toast","Mixed berries mascarpone stuffed with homemade strawberry sauce and cornflake",2100],
        ["California Burger","Beef patty, romaine, avocado, tomato, Cheddar, and bacon jam",2100],
        ["Terriyaki chicken burger","Crispy potato, French fries, mixed greens, mixed fruits, or no side.",2100],
        ["Fat Boy Burger","Beef patty, bacon, fried egg, fried onion, pickled ginger, and Pepper Jack",2200],
        ["Rainbow Burger","Bell peppers, avocado, romaine, and tomato",1800],
        ["Chicken Burger","Crispy CK, tomato, and spring mix",2100],
        ["Ultimate Bacon Burger","Beef patty, romaine, avocado, tomato, Cheddar, and bacon jam",2200],
        ["BLT","Bacon, romaine, tomato, and Pepper Jack",1800],
        ["Ham cheese Sandwich","Wheat toast, Bacon, eggs, and Cheddar",1800],
        ["BEC","Bacon, eggs, and Cheddar",1800],
        ["Smoked Salmon Salad","Cherry tomato, spring mix, romaine, pickled shallot, caper, and wasabi dressing",2100],
        ["Avocado Salad","Cherry tomato, baby kale, orange, spring mix, slice almond, and champagne vinaigrette",1700],
        ["Crispy Chicken Salad","Crispy CK, avocado, romaine, cherry tomato, pickled shallot, Parmesan, and sriracha dressing",2200],
        ["Grilled Cheese with Fries","Cheese sandwich served with fries. Choice of drink: Apple Juice or Milk.",1300],
        ["KID Pancake","Pancake with choice of Apple Juice or Milk.",1300],
        ["KID Scrambled","Scrambled eggs. Option of Apple Juice or Milk.",1300],
        ["Side Toast","Choice of wheat, ciabatta, English muffin, or gluten-free toast.",500],
        ["SIDE Potato","Potatoes prepared in a style complementary to American cuisine, typically seasoned and served as a simple yet satisfying accompaniment.",600],
        ["Side Pork Sausage","Pork sausage, typically prepared and served as a side dish, offering a simple yet satisfying complement to any meal.",700],
        ["SIDE Waffle","A single Belgian-style waffle, typically served with honey butter and maple syrup.",800],
        ["Side Crispy Chicken","Boneless chicken pieces, seasoned and deep fried for a crispy finish.",1200],
        ["Side Patty","Rare, Medium Rare, Medium, Medium Well, or Well Done.",900],
        ["Side Salmon","This dish features a carefully prepared portion of salmon, typically seasoned and cooked to enhance its natural flavors.",700],
        ["Side Ham","Side portion of sliced ham, typically served as an accompaniment.",700],
        ["Side Curry","Aromatic spices combined to create a rich, savory curry sauce, typically served as a complement to main dishes.",500],
        ["Mixed Fruits","A medley of fresh-cut fruits, typically including strawberries, kiwi, oranges, and blackberries, offering a refreshing complement to any meal.",600],
        ["Side Salad","Fresh Green Salad: A Crisp, Refreshing Side Dish",500],
        ["Side Banana","A freshly sourced banana, typically served as a light and simple complement to any meal.",500],
        ["Homemade Bacon Jam","A savory blend of slow-cooked bacon, caramelized onions, and a hint of sweetness, typically spread on toast or used to enhance dishes.",500],
        ["Side CK Apple","Sliced apples, typically served as a simple, refreshing accompaniment.",700],
        ["Side 1 Eggs","Sunny-side up, over easy, medium, hard, poached, scrambled, whites only, or none.",350],
        ["Side Strawberry sauce","A sweet and tangy sauce made with fresh strawberries, typically served as a complement to desserts or as a flavorful addition to various dishes.",300],
        ["SIDE Thai Tea Sauce","Inspired by the aromatic and refreshing qualities of Thai tea, this sauce combines its creamy sweetness with a hint of spice, perfect for enhancing any dish.",300],
        ["SIDE Chocolate Sauce","Rich and velvety chocolate sauce, often served to complement a variety of desserts.",300],
        ["Side Rice","Seasoned steamed grains, perfect as a side.",400],
        ["Avocado","Fresh and creamy fruit with a rich taste, perfect for adding a touch of luxury to any dish.",400,"the-hangout-breakfast-avocado"],
        ["Side Ube Sauce","A vibrant, sweet sauce made from purple yam, often enhancing desserts or adding a unique twist to savory dishes.",300],
        ["Side Hollandaise","A velvety blend of butter, egg yolks, and lemon juice, often complemented with a hint of dijon mustard for a smooth and rich taste.",300],
        ["SIDE Lemon Sauce","A tangy accompaniment made with fresh lemon juice, typically includes a blend of herbs and spices to enhance its flavor.",300],
        ["Ube Espresso","Dirty ube combines the unique taste of ube (purple yam) with the boldness of espresso, typically served as a warm beverage.",900],
      ] },
    ],
    siteNote: "Prices and photos are from their own site.",
  },

  /*
     The Model Bakery — gathered 2026-09-09 from own-domain
     they are: Artisan bakery
     logo: https://www.themodelbakery.com/wp-content/uploads/2025/06/Model-Logo-1908-Wheat-trans.svg (500x175) — not cut into a tile yet
     flag: FOUR LOCATIONS, and the roster seat is Napa, so the Oxbow Market stand is the address here. The others: 1357 Main St, St. Helena 94574, (707) 963-8192, Sun-Fri 5:30am-4pm, Sat to 5pm; 6523 Washington St, Yountville, (707) 415-5045, Mon/Wed-Fri 7am-12pm, closed Tue, Sat-Sun 7am-1pm; 1315 North Main St, Walnut Creek (no ZIP published), (866) 622-5379, daily 6am-4pm
     flag: homepage says 'for almost ninety years' while the header says Established 1908
     flag: the Yountville page lists ZIP 94559 — identical to Napa's, though they are different towns
     flag: logo is an SVG; its HTML width attribute says 280 against an intrinsic 500
  */
  'the-model-bakery': {
    address: "Oxbow Market, 644 1st St Bldg B, Napa, CA 94559",
    phone: "(707) 259-1128",
    email: "orders@themodelbakery.com",
    hours: "Daily 6:30am-4pm",
    instagram: "modelbakery",
    cuisine: "Artisan bakery",
    photos: [
      {"src":"/food/the-model-bakery-site-1-lg.webp","alt":"","credit":"Their own photo, from themodelbakery.com"},
      {"src":"/food/the-model-bakery-site-3-lg.webp","alt":"","credit":"Their own photo, from themodelbakery.com"},
    ],
    items: [
      ["Almond Croissant","",475],
      ["Morning Bun","",425],
      ["Granola Parfait","",850],
      ["Joe To Go","Serves twelve 8oz cups, with fixings",4500],
      ["Breakfast Sandwich Platter","Serves 12: twelve sandwiches halved, a fruit cup, coffee with fixings",27500],
      ["Lunch Sandwich Platter","Serves 12: twelve sandwiches, tea, kettle chips, cookies",25000],
    ],
    siteNote: "These prices are from their catering PDF ('items and pricing subject to change'); cafe prices live only in their Toast and Square ordering apps.",
  },

  /*
     The Tox Alamo — gathered 2026-09-09 from own-domain
     they are: Lymphatic body sculpting
     flag: the studio is by @courtneyyeager per the bio; the franchise's studio locator does not list Alamo yet
     flag: address from their Instagram bio; the zip is Alamo's
  */
  'the-tox-alamo': {
    address: "120 Alamo Plaza, Alamo, CA 94507",
    instagram: "thetoxalamo",
    cuisine: "Lymphatic body sculpting",
    tagline: "Lymphatic body sculpting at Alamo Plaza, The Tox Technique",
    contactOnly: "Lymphatic body sculpting at Alamo Plaza, The Tox Technique. The studio books through its link in bio; The Tox Technique's site lists the treatments, the 60-minute Master Tox and the 100-minute Master Tox with sculpting facial, without prices.",
  },

  /*
     tonys-style — gathered 2026-09-09 from stopgap
     their spelling: "Tony's Style" (roster keeps "tonys-style")
     they are: Chicken wings
     flag: Glenn: 'This is my cousins boy right here that owns this restaurant. Gonna put him on. Needs a website too'
     flag: the icon is their neon sign, cut from his photo of it
     flag: Menu sweep 2026-09-09, still no readable prices: Tony's Style's ordering page (adelinefoodhall.com, which redirects to oakland.picnicfood.com) is a JavaScript-rendered single-page app; the static fetch returned only the header text 'Order Now From Your Digital Food Court' with no menu items, descriptions, or prices retrievable.
     flag: Menu sweep 2026-09-09: No standalone business website exists: tonysstyle.com has no DNS record
     flag: Menu sweep 2026-09-09: Only web presence found beyond marketplaces is an Instagram (tonysstyles, as given) and a vendor storefront inside Adeline Food Hall's ordering platform (adelinefoodhall.com -> oakland.picnicfood.com)
     flag: Menu sweep 2026-09-09: That storefront is JS-rendered, so no menu, prices, phone, email, hours, or logo could be extracted from a static page fetch
     flag: Menu sweep 2026-09-09: Address is inferred only from the ordering page's own URL slug (/tony's-style/5333-adeline-st-oakland/), not from printed page text, since the page did not render statically; no zip code confirmed
     flag: Menu sweep 2026-09-09: Per instructions, items left empty since no own site or ordering page with readable menu content could be found
  */
  'tonys-style': {
    address: "938 San Pablo Ave, Albany, CA",
    phone: "917-244-4797",
    instagram: "tonysstyles",
    cuisine: "Chicken wings",
    needsSite: true,
    tagline: "Chicken wings on San Pablo Ave in Albany, serving the Bay 15+ years",
    contactOnly: "Chicken wings on San Pablo Ave in Albany, serving the Bay 15+ years. Hours and the menu are posted on their Instagram story daily; no site yet.",
  },

  /*
     TOWNFUTURIST MEDIA — gathered 2026-09-09 from own-domain
     they are: Video production
     logo: https://static.wixstatic.com/media/97333a_fb647e13b8454d0a8a249dd59529cfd4~mv2.png (1159x227) — not cut into a tile yet
     flag: name written four ways on their own site: 'TOWNFUTURIST MEDIA' (logo), 'townfuturist media', 'Townfuturistmedia' (title), 'Town Futurist Media' (credits)
     flag: the email uses a different domain, townfuturist.com
     flag: favicon is the default Wix placeholder
     flag: the sitemap still lists duplicate Wix pages 'copy-of-contact' and 'copy-of-media'
     flag: Oakland-rooted per their About page; founders Sunru Carter and Korise Jubert
  */
  'town-futurist-media': {
    address: "755 Baywood Dr, Ste 200, Petaluma, CA 94954",
    phone: "(510) 269-0433",
    email: "info@townfuturist.com",
    instagram: "townfuturist",
    cuisine: "Video production",
    contactOnly: "Film and video production — corporate videos, short docs, festivals, series and podcasts; 'Created to tell your story.' No service pricing — the contact page offers a 'Book a Discovery Meeting' form only.",
  },

  /*
     TruFusion Walnut Creek — gathered 2026-09-09 from third-party
     they are: Group fitness
     flag: a chain site; this is the Walnut Creek studio's page
     flag: their logo asset URL is dead — it redirects to a Reebok Fitness 404 — so nothing was pulled for a tile
     flag: the page references literal placeholder.jpg images in its embedded data
  */
  'trufusion-walnut-creek': {
    address: "1675 Olympic Blvd, Walnut Creek, CA 94596",
    phone: "(925) 476-5539",
    email: "walnutcreek@trufusion.com",
    hours: "Mon 5am-7:15pm, Tue-Fri 6am-9pm, Sat 8am-1pm, Sun 9am-6pm",
    instagram: "trufusion_walnutcreek",
    cuisine: "Group fitness",
    contactOnly: "'Two blocks away from Broadway Plaza' — an unmatched variety of heated and unheated group fitness classes, world-class instructors and a vibrant community. No class or membership prices in the page — a 'first class free' banner, with pricing inside an embedded booking widget.",
  },

  /*
     U Dessert Story — gathered 2026-09-09 from own-domain
     their spelling: "U :Dessert Story" (roster keeps "U Dessert Story")
     they are: Asian desserts
     logo: https://chowly-coo-configuration-assets.nyc3.digitaloceanspaces.com/chowly-coo-prod-configuration-assets/public/assets/U%3ADessert-Story-bdfc5969-cce0-4a23-afb1-a9eaa90f1149.png (908x951) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the /location page and the /contact-us page publish different schedules for both shops — none carried
     flag: Berkeley: 1849 Shattuck Ave 94709, (510) 356-4127
     flag: the /location blurb says 'Visit us in Bernal Heights' though the shops are on 16th Street and in Berkeley — template filler
     flag: Menu sweep 2026-09-09, still no readable prices: udessertstory.com's homepage lists dessert categories and named items (e.g., Brown Butter Chicken Croffle, Mango Sticky Rice Bingsu) with no prices; the /menu and /stores pages are portals with no item-level pricing in static HTML, and the SF location's order.online, custom.order.online, and Toast o
     flag: Menu sweep 2026-09-09: Second location: Berkeley (1849 Shattuck Ave) in addition to the San Francisco location researched here
     flag: Menu sweep 2026-09-09: No prices could be confirmed for the SF menu despite trying /menu, /stores, order.online, custom.order.online, and a Toast page - all either lacked static price data or returned 403
     flag: Menu sweep 2026-09-09: Email address is not listed anywhere on the site
  */
  'u-dessert-story': {
    address: "3489 16th St, San Francisco, CA 94114",
    phone: "(415) 796-3633",
    email: "udessertstory.official@gmail.com",
    hours: "Sun 1pm-11:59pm, Mon-Wed 3pm-10pm, Thu-Fri 3pm-1am, Sat 1pm-1am",
    instagram: "udessertstory",
    cuisine: "Asian desserts",
    tagline: "An Asian dessert cafe in San Francisco and Berkeley — 'We bring a new",
    photos: [
      {"src":"/food/u-dessert-story-site-0-lg.webp","alt":"Brown Butter Chicken Croffle","credit":"Their own photo, from udessertstory.com"},
      {"src":"/food/u-dessert-story-site-1-lg.webp","alt":"Ube Matcha Latte","credit":"Their own photo, from udessertstory.com"},
      {"src":"/food/u-dessert-story-site-2-lg.webp","alt":"Mango Sticky Rice Bingsu","credit":"Their own photo, from udessertstory.com"},
      {"src":"/food/u-dessert-story-site-5-lg.webp","alt":"The Loaded Nacho Croissant","credit":"Their own photo, from udessertstory.com"},
      {"src":"/food/u-dessert-story-site-7-lg.webp","alt":"Recipe: Chocolate Matcha Lava Cake","credit":"Their own photo, from udessertstory.com"},
      {"src":"/food/u-dessert-story-site-8-lg.webp","alt":"U :Dessert Story serves next-level Asian cuisine","credit":"Their own photo, from udessertstory.com"},
    ],
    contactOnly: "An Asian dessert cafe in San Francisco and Berkeley — 'We bring a new. Ordering runs through an embedded app; no prices in the page and no PDF menu — the signatures are the Brown Butter Chicken Croffle, the Ube Matcha Latte and the Mango Sticky Rice Bingsu.",
  },

  /*
     uBreakiFix — gathered 2026-09-09 from third-party
     their spelling: "uBreakiFix by Asurion" (roster keeps "uBreakiFix")
     they are: Electronics repair
     logo: https://images.ctfassets.net/d9ybqgejqp0w/4NRQb0wxJIQn6sxaZZuzAn/ee5e41a8970fe2c625b19a92c324c94d/ubreakifix-by-asurion-logo-header-nav.svg (120x48) — not cut into a tile yet
     flag: a location page on the chain's corporate site
  */
  'ubreakifix': {
    address: "210 El Cerrito Plaza, Unit 1011, El Cerrito, CA 94530",
    phone: "(510) 570-2863",
    email: "elcerrito@ubreakifix.com",
    hours: "Mon-Sat 10am-7pm, closed Sun",
    instagram: "ubreakifix",
    cuisine: "Electronics repair",
    contactOnly: "'Best Repair Services in El Cerrito, Guaranteed!' — phone, computer and console repair; a Samsung Authorized Service Provider. No repair price list — a free basic diagnostic, complex diagnostics $39.99 to $59.99, and a low-price guarantee of a competitor's price less $5.",
  },

  /*
     United Curb Painting — gathered 2026-09-09 from own-domain
     they are: Curb painting
     logo: https://assets.zyrosite.com/YX4ag7qEwETX3w2p/unitedc-mv02KZxDXLuvJKOb.jpg (1472x832) — not cut into a tile yet
     flag: the /prices page has no HTML text — prices exist only inside an image, which contains typos
     flag: the contact email says 'UnitedCurbAppeal', not 'Painting'
     flag: no street address or hours published; payment via Zelle, Cash App, Venmo, Apple Pay, cheque or cash
  */
  'united-curb-painting': {
    phone: "(530) 360-1105",
    email: "UnitedCurbAppeal@gmail.com",
    instagram: "unitedcurbpainting",
    cuisine: "Curb painting",
    groups: [
      { name: "Prices, from", items: [
        ["House Numbers","",6000],
        ["Beach Sunset or Scenery","",12000,"$120-$200"],
        ["Logo","Base design",10000,"$100-$120"],
        ["Double Logo","",12000,"$120-$140"],
        ["Full Themed Layout","",16000,"$160-$240"],
        ["Licence Plate Design","",12000],
        ["Top American Flag","",3000],
      ] },
    ],
    quoteOnly: "'Professional curb painting, rated 5 stars by customers' — curb address painting based in San Jose, serving the Bay Area and the Central Valley. Their price sheet is an image; every curb includes removal of the old numbers and a protective coat; travel fees apply outside San Jose.",
  },

  /*
     Urban Air — gathered 2026-09-09 from own-domain
     their spelling: "Urban Air Adventure Park" (roster keeps "Urban Air")
     they are: Indoor adventure park
     logo: https://www.urbanair.com/wp-content/uploads/2022/01/logo-horizontal-black-outline-1.png (1249x399) — not cut into a tile yet
     flag: the URL is the chain's corporate site: no street address, phone, hours or email in its HTML; park details sit behind a JS 'Find Your Park' locator
     flag: no Bay Area location is named in the static HTML — which park he means is not recoverable from this link
  */
  'urban-air': {
    instagram: "urbanairpark",
    cuisine: "Indoor adventure park",
  },

  /*
     Varnish Nail Boutique — gathered 2026-09-09 from booking-platform
     they are: Nail salon
     flag: Operator's exact note: sent twice, as Antioch • Goods and as Walnut Creek • Goods
     flag: Two locations confirmed from their own Instagram profiles: @varnishnailboutique is 'Varnish Nail Boutique | Walnut Creek' (2918 N Main St, (925) 506-3101) and @varnish.antioch is 'Varnish Nail Boutique | Antioch' (4815 Lone Tree Wy, Antioch, CA 94531, (925) 750-4245); each bio cross-links the other
     flag: The booking site publishes no address; its phone 9255063101 equals the Walnut Creek Instagram phone and the link sits in the Walnut Creek bio, so the site and its hours are attributed to Walnut Creek; the Antioch profile shows no website link
     flag: Antioch hours are not published on any of their own pages, so that location's hours are null
     flag: Name mismatch: the site's subdomain (varnishnailstudio3868) and email (varnishstudioco@) say 'Studio', but the site heading, its company record and both Instagram profiles say 'Varnish Nail Boutique'; the 'Varnish Nail Studio' label appears to come from the URL
     flag: It is a nail salon (services, incl. waxing), so the operator's 'Goods' category looks wrong
     flag: Email is from the booking site's own company record (the public API response the page loads on every visit) and is not rendered on the visible page; confirm before displaying it
     flag: The site is a bare SimplePOS booking shell: no about text, no logo image, no address, no visible hours; the company record's name/address/city/about fields are empty and only the DBA name 'Varnish Nail Boutique' is set. Hours were read from the booking calendar (Mon-Sat 9:30am-7pm, Sun 10am-6pm)
     flag: No logo on their own site (home page is a plain blue header; the only image assets are SimplePOS platform graphics), so logo_url is null; their Instagram profile picture is a logo (blue marble circle, gold 'V', 'VARNISH NAIL BOUTIQUE'; the Antioch profile's variant adds 'ANTIOCH') but exists only in the operator's screenshots, not at a fetchable URL
     flag: Prices: 57 of 114 services are flagged adjustable and render as '$X.00+' on the site (recorded here as 'from $X'); each category also has a $0 placeholder entry ('Pedicure Service', 'Manicure Service', 'Design', etc.) that was omitted; add-ons such as Chrome, Cateye, French Tips and Ombre are repeated in nearly every category, and every extension service shows a 15-minute duration placeholder
     flag: The Walnut Creek Instagram address has no ZIP code; recorded as published
     flag: The site is a JavaScript app: a plain fetch returns only the 'SimplePOS Online Booking' shell; data was taken from the rendered page in a browser and from the site's own API (simplepos.us/api/v2 with the Sub-Domain header the app sends)
  */
  'varnish-nail-boutique-antioch': {
    address: "4815 Lone Tree Wy, Antioch, CA 94531",
    phone: "(925) 750-4245",
    email: "varnishstudioco@gmail.com",
    instagram: "varnish.antioch",
    cuisine: "Nail salon",
    tagline: "Nail salon on Lone Tree Way in Antioch: mani, pedi, gel, dip, wax",
    contactOnly: "Nail salon on Lone Tree Way in Antioch: mani, pedi, gel, dip, wax. The Antioch shop publishes no hours or price list of its own; the Walnut Creek shop's booking site carries the brand's prices.",
  },

  /*
     Varnish Nail Boutique — gathered 2026-09-09 from booking-platform
     they are: Nail salon
     flag: Operator's exact note: sent twice, as Antioch • Goods and as Walnut Creek • Goods
     flag: Two locations confirmed from their own Instagram profiles: @varnishnailboutique is 'Varnish Nail Boutique | Walnut Creek' (2918 N Main St, (925) 506-3101) and @varnish.antioch is 'Varnish Nail Boutique | Antioch' (4815 Lone Tree Wy, Antioch, CA 94531, (925) 750-4245); each bio cross-links the other
     flag: The booking site publishes no address; its phone 9255063101 equals the Walnut Creek Instagram phone and the link sits in the Walnut Creek bio, so the site and its hours are attributed to Walnut Creek; the Antioch profile shows no website link
     flag: Antioch hours are not published on any of their own pages, so that location's hours are null
     flag: Name mismatch: the site's subdomain (varnishnailstudio3868) and email (varnishstudioco@) say 'Studio', but the site heading, its company record and both Instagram profiles say 'Varnish Nail Boutique'; the 'Varnish Nail Studio' label appears to come from the URL
     flag: It is a nail salon (services, incl. waxing), so the operator's 'Goods' category looks wrong
     flag: Email is from the booking site's own company record (the public API response the page loads on every visit) and is not rendered on the visible page; confirm before displaying it
     flag: The site is a bare SimplePOS booking shell: no about text, no logo image, no address, no visible hours; the company record's name/address/city/about fields are empty and only the DBA name 'Varnish Nail Boutique' is set. Hours were read from the booking calendar (Mon-Sat 9:30am-7pm, Sun 10am-6pm)
     flag: No logo on their own site (home page is a plain blue header; the only image assets are SimplePOS platform graphics), so logo_url is null; their Instagram profile picture is a logo (blue marble circle, gold 'V', 'VARNISH NAIL BOUTIQUE'; the Antioch profile's variant adds 'ANTIOCH') but exists only in the operator's screenshots, not at a fetchable URL
     flag: Prices: 57 of 114 services are flagged adjustable and render as '$X.00+' on the site (recorded here as 'from $X'); each category also has a $0 placeholder entry ('Pedicure Service', 'Manicure Service', 'Design', etc.) that was omitted; add-ons such as Chrome, Cateye, French Tips and Ombre are repeated in nearly every category, and every extension service shows a 15-minute duration placeholder
     flag: The Walnut Creek Instagram address has no ZIP code; recorded as published
     flag: The site is a JavaScript app: a plain fetch returns only the 'SimplePOS Online Booking' shell; data was taken from the rendered page in a browser and from the site's own API (simplepos.us/api/v2 with the Sub-Domain header the app sends)
  */
  'varnish-nail-boutique-walnut-creek': {
    address: "2918 N Main St, Walnut Creek, California",
    phone: "(925) 506-3101",
    email: "varnishstudioco@gmail.com",
    hours: "Mon-Sat 9:30am-7pm, Sun 10am-6pm",
    instagram: "varnishnailboutique",
    cuisine: "Nail salon",
    tagline: "Nail salon on N Main St in Walnut Creek: mani, pedi, gel, dip, wax",
    groups: [
      { name: "Prices, from", items: [
        ["Classic Manicure (Reg)","",2800],
        ["Classic Manicure (Gel)","",4200],
        ["KDS Manicure (Reg)","",5500],
        ["KDS Manicure (Gel)","",7000],
        ["Collagen Manicure (Reg)","",6500],
        ["Collagen Manicure (Gel)","",8000],
        ["Cleopatra Golden Manicure (Reg)","",7500],
        ["Cleopatra Golden Manicure (Gel)","",9000],
        ["24K VIP Package (Reg)","",9000],
        ["24K VIP Package (Gel)","",10500],
        ["Classic Pedicure (Reg)","",4500],
        ["Classic Pedicure (Gel)","",5500],
        ["KDS Pedicure (Reg)","",6500],
        ["KDS Pedicure (Gel)","",8000],
        ["Collagen Pedicure (Reg)","",7500],
        ["Collagen Pedicure (Gel)","",9000],
        ["Cleopatra Golden Pedicure (Reg)","",8500],
        ["Cleopatra Golden Pedicure (Gel)","",10000],
        ["24K VIP Package (Reg)","",10000],
        ["24K VIP Package (Gel)","",11500],
        ["GelX Full Set","",7100,"from $71"],
        ["Gel X Fill","",6100],
        ["Builder Gel Full Set (Natural)","",6000,"from $60"],
        ["Builder Gel Full Set (Tips)","",7500,"from $75"],
        ["Builder Gel Fill (Natural)","",5500,"from $55"],
        ["Builder Gel Fill (Tips)","",6500,"from $65"],
        ["Dip (Natural)","",5500,"from $55"],
        ["Dip (Tips)","",6500,"from $65"],
        ["Acrylic Full Set","",6100,"from $61"],
        ["Acrylic Fill","",5100,"from $51"],
        ["Pink & White Full Set","",7500,"from $75"],
        ["Kids Manicure (Reg)","",2000],
        ["Kids Manicure (Gel)","",3000],
        ["Kids Pedicure (Reg)","",3000],
        ["Kids Pedicure (Gel)","",4000],
        ["Eyebrow (For Her)","",1600,"from $16"],
        ["Eyebrow (For Him)","",1800,"from $18"],
        ["Brazilian","",5500,"from $55"],
        ["Hands Polish Change (Reg)","",1600],
        ["Toes Polish Change (Reg)","",2000],
        ["Gel Add-On","",1500,"from $15"],
        ["French Tips","",1000,"from $10"],
        ["Chrome","",1000],
      ] },
    ],
    quoteOnly: "Nail salon on N Main St in Walnut Creek: mani, pedi, gel, dip, wax. Prices are the full service list on their SimplePOS booking site (varnishnailstudio3868.simplepos.us, all 9 categories); hours are that booking system's business-hours calendar, identical across the two weeks checked (Sep 7-20, 2026); addresses and the Antioch phone come from the two Instagram bios in the operator's screenshots.",
  },

  /*
     Vending Enterprise — gathered 2026-09-09 from stopgap
     they are: Vending machines
     flag: their site is a Google Site; vendingenterprise.net itself does not resolve
     flag: the contact page maps an Oakland street address that reads as a home base, so it is not printed
  */
  'vending-enterprise': {
    phone: "415-523-5963",
    email: "lja@vendingenterprise.net",
    hours: "Mon-Sat 8am-5pm, closed Sun",
    cuisine: "Vending machines",
    needsSite: true,
    tagline: "Vending machines placed free in Bay Area businesses and offices",
    contactOnly: "Vending machines placed free in Bay Area businesses and offices. Placement is free to the host business, their own words; no prices are published.",
  },

  /*
     Walk Free — gathered 2026-09-09 from own-domain
     they are: Dog harness and leash
     flag: Glenn: 'BEASTY • Online' and 'Maybe include a drop-down pic?' — their own product photos are the strip
     flag: their bio says 'the ultimate leash for small dogs'; the product page says medium to large dogs
  */
  'walk-free': {
    instagram: "walkfree.us",
    cuisine: "Dog harness and leash",
    tagline: "Anti-pull dog harness with a built-in leash, shipped worldwide",
    photos: [
      {"src":"/food/walk-free-site-0-lg.webp","alt":"Anti-Pull Dog Harness","credit":"Their own product photos, from walkfree.store"},
      {"src":"/food/walk-free-site-2-lg.webp","alt":"Anti-Pull Dog Harness","credit":"Their own product photos, from walkfree.store"},
      {"src":"/food/walk-free-site-3-lg.webp","alt":"Anti-Pull Dog Harness","credit":"Their own product photos, from walkfree.store"},
      {"src":"/food/walk-free-site-7-lg.webp","alt":"Anti-Pull Dog Harness","credit":"Their own product photos, from walkfree.store"},
    ],
  },

  /*
     Willy Billy Smoked Meat — gathered 2026-09-09 from own-domain
     their spelling: "WILLY BILLY'S SMOKED MEATS" (roster keeps "Willy Billy Smoked Meat")
     they are: Halal Texan BBQ
     logo: https://assets.cdn.filesafe.space/2W3mKjfU3GREdwOnEUvd/media/67b76555410afca5d4f1fc10.png (1674x1887) — not cut into a tile yet
     flag: canonical URL points to jerkandjava.com and the header logo's alt text reads 'Jerk and Java Logo' — the site is a re-skin of another restaurant's template
     flag: the published contact email is info@sumferkitchens.com, a DIFFERENT business's domain — deliberately not carried onto this page
     flag: name written three ways on-site: 'Willy Billy's BBQ' (title), 'Willy Billy's Smoked Meat' (body), 'Willy Billy's Smoked Meats' (footer and logo)
     flag: five more addresses listed, which read as ghost-kitchen suites: 949 Ruff Dr San Jose 95110; 60 Morris St SF 94107; 1200 Market St SF 94102; 5333 Adeline St Oakland 94608; 42550 Albrae St Fremont 94538 'coming soon'
     flag: copy says 'right here in San Jose' while the first listed address is San Francisco
     flag: footer address is just 'Califonia, United States' (typo); Location page carries kitchen-remodelling boilerplate; testimonials look templated
     flag: menu: 12 items read from https://willybillysmokedmeat.com/menu-willy-billys-smoked-meat on 2026-09-05
  */
  'willy-billy-smoked-meat': {
    address: "90 Charter Oak Ave, San Francisco, CA 94124",
    phone: "(408) 650-2589",
    hours: "Mon-Fri 10am-10pm, Sat-Sun 9am-11pm",
    cuisine: "Halal Texan BBQ",
    photos: [
      {"src":"/food/willy-billy-smoked-meat-site-0-lg.webp","alt":"","credit":"Their own photo, from willybillysmokedmeat.com"},
      {"src":"/food/willy-billy-smoked-meat-site-2-lg.webp","alt":"","credit":"Their own photo, from willybillysmokedmeat.com"},
      {"src":"/food/willy-billy-smoked-meat-site-3-lg.webp","alt":"","credit":"Their own photo, from willybillysmokedmeat.com"},
      {"src":"/food/willy-billy-smoked-meat-site-5-lg.webp","alt":"","credit":"Their own photo, from willybillysmokedmeat.com"},
      {"src":"/food/willy-billy-smoked-meat-site-14-lg.webp","alt":"","credit":"Their own photo, from willybillysmokedmeat.com"},
    ],
    sections: [
      { name: "BBQ", items: [
        ["Brisket (Regular)","",1800],
        ["Brisket (Large)","",2500],
        ["Pulled Beef (Regular)","",1600],
        ["Pulled Beef (Large)","",2100],
        ["Beef Hot Links","",1450],
        ["Dino Beef Rib","",3500],
      ] },
      { name: "Combo meals", items: [
        ["2-Meat Combo","",2500],
        ["3-Meat Combo","",2900],
        ["Brisket Burger","",1550],
        ["Mac & Cheese","",425],
      ] },
      { name: "Sides", items: [
        ["Hawaiian Rolls (2 pcs)","",300],
        ["Corn Bread","",350],
      ] },
    ],
    siteNote: "Prices are from their own site.",
  },

  /*
     Winter White Car Wash & Detail — gathered 2026-09-09 from own-domain
     they are: Mobile car detailing
     logo: https://img1.wsimg.com/isteam/ip/79ed2926-8987-45ae-8cf9-3611e560f8dc/IMG_5757.jpeg (1024x1024) — not cut into a tile yet
     flag: A UTAH FOOTPRINT ON A BAY AREA LISTING: a 385 (Utah) phone number and a Yelp link to a South Jordan, UT listing, beside 'California Cities We Serve' — worth a look before this is sold as local
     flag: a second location card: 113 Ashton Way, Pleasant Hill — no ZIP published for either
     flag: no weekly hours — only an 'Open today' widget per location
     flag: warranty contradictions between page slugs and titles; seasonal specials for every holiday bookable at once
  */
  'winter-white-carwash': {
    address: "2009 Colmar Street, Danville, CA",
    phone: "(385) 222-6186",
    instagram: "winterwhitecarwash",
    cuisine: "Mobile car detailing",
    groups: [
      { name: "Prices, from", items: [
        ["Showroom — sedan or coupe","",25999],
        ["Showroom interior — sedan or coupe","",16999],
        ["Showroom — mini SUV or crossover","",26999],
        ["Showroom — medium SUV or truck","",28999],
        ["Showroom — large SUV, van or truck","",29999],
        ["Showroom — extra-large SUV, van or truck","",34999],
        ["Mini Detail Package","",13900,"$139-$179"],
        ["Wave Rider Shine","",19999],
      ] },
    ],
    quoteOnly: "'Professional car care, ceramic protection, and showroom-level results delivered right to your location.' Fixed per-size prices on their booking pages; some packages are ranges; ceramic Gold Package $2,499-$3,299; interior add-ons $29-$69.",
  },

  /*
     Wow Mia Pizza — gathered 2026-09-09 from own-domain
     their spelling: "Wowmia Pizza" (roster keeps "Wow Mia Pizza")
     they are: Pizza
     logo: https://wowmiapizza.com/wp-content/uploads/2023/11/mia-logo.png (150x58) — not cut into a tile yet
     flag: Glenn: 'San Jose • Goods'
     flag: Hours contradiction on the Contact page (wowmiapizza.com/contact/): it states 'Sunday - Thursday: 11:00 AM - 9:00 PM' and 'Friday - Saturday: 11:00 AM - 10:00 PM' but also separately states 'Monday - Closed' -- Monday is both inside the open Sun-Thu range and listed as closed on the same page, so hours could not be resolved to one consistent line and are set to null.
     flag: Homepage also lists separate promotional hours that don't map onto the Contact page's daily hours: Lunch Buffet Tue-Fri 11:30am-1:30pm and Happy Hour Tue-Thu 2pm-5pm.
     flag: Two different phone numbers are printed sitewide (as tel: links on both the homepage and contact page) with neither labeled as primary: (408) 676-3030 (shown in the address/contact block, used as the phone value here) and (408) 245-9000 (shown elsewhere on the same pages).
     flag: No email address is published anywhere on the site -- checked the raw HTML of the homepage and contact page for mailto: links and visible email text and found none, so email is set to null.
     flag: The site's own 'About Us' nav link (https://wowmiapizza.com/about-us/) returns HTTP 404, and https://wowmiapizza.com/about also 404s, so no About page could be reached or checked for further contradictions.
     flag: Only one location (San Jose, on Monterey Road) is mentioned anywhere on the site; no second location found.
     flag: Email is not on the site; contact@wowmiapizza.com is from the Contact sheet of their own Instagram profile in Glenn's screenshot, which also shows (408) 676-3030 as the number
  */
  'wow-mia-pizza': {
    address: "2951 Monterey Road, San Jose, CA 95111",
    phone: "(408) 676-3030",
    email: "contact@wowmiapizza.com",
    instagram: "wowmiapizza",
    cuisine: "Pizza",
    tagline: "Pizzeria in San Jose serving pizza, wings, sandwiches and salads",
    sections: [
      { name: "Pizza", items: [
        ["Smoky BBQ Chicken P","Creamy garlic & BBQ sauce, blended cheese, BBQ chicken, bacon, tomatoes, red onions, green onions",1199],
        ["Smoky BBQ Chicken S","Creamy garlic & BBQ sauce, blended cheese, BBQ chicken, bacon, tomatoes, red onions, green onions",2199],
        ["Smoky BBQ Chicken M","Creamy garlic & BBQ sauce, blended cheese, BBQ chicken, bacon, tomatoes, red onions, green onions",2699],
        ["Smoky BBQ Chicken L","Creamy garlic & BBQ sauce, blended cheese, BBQ chicken, bacon, tomatoes, red onions, green onions",3199],
        ["Smoky BBQ Chicken XL","Creamy garlic & BBQ sauce, blended cheese, BBQ chicken, bacon, tomatoes, red onions, green onions",3699],
        ["Gardena P","Creamy garlic sauce, cheese, spinach, garlic, tomatoes, red onions, zucchini, artichoke hearts, mushrooms",1199],
        ["Gardena S","Creamy garlic sauce, cheese, spinach, garlic, tomatoes, red onions, zucchini, artichoke hearts, mushrooms",2199],
        ["Gardena M","Creamy garlic sauce, cheese, spinach, garlic, tomatoes, red onions, zucchini, artichoke hearts, mushrooms",2699],
        ["Gardena L","Creamy garlic sauce, cheese, spinach, garlic, tomatoes, red onions, zucchini, artichoke hearts, mushrooms",3199],
        ["Gardena XL","Creamy garlic sauce, cheese, spinach, garlic, tomatoes, red onions, zucchini, artichoke hearts, mushrooms",3699],
        ["Harvest P","Red sauce, cheese, mushrooms, green peppers, yellow onions, tomatoes, Kalamata olives, banana pepper",1199],
        ["Harvest S","Red sauce, cheese, mushrooms, green peppers, yellow onions, tomatoes, Kalamata olives, banana pepper",2199],
        ["Harvest M","Red sauce, cheese, mushrooms, green peppers, yellow onions, tomatoes, Kalamata olives, banana pepper",2699],
        ["Harvest L","Red sauce, cheese, mushrooms, green peppers, yellow onions, tomatoes, Kalamata olives, banana pepper",3199],
        ["Harvest XL","Red sauce, cheese, mushrooms, green peppers, yellow onions, tomatoes, Kalamata olives, banana pepper",3699],
        ["Combo Rambo P","Red sauce, cheese, salami, pepperoni, sausage, linguica, yellow onion, mushrooms, green peppers, olives",1199],
        ["Combo Rambo S","Red sauce, cheese, salami, pepperoni, sausage, linguica, yellow onion, mushrooms, green peppers, olives",2199],
        ["Combo Rambo M","Red sauce, cheese, salami, pepperoni, sausage, linguica, yellow onion, mushrooms, green peppers, olives",2699],
        ["Combo Rambo L","Red sauce, cheese, salami, pepperoni, sausage, linguica, yellow onion, mushrooms, green peppers, olives",3199],
        ["Combo Rambo XL","Red sauce, cheese, salami, pepperoni, sausage, linguica, yellow onion, mushrooms, green peppers, olives",3699],
        ["Shawn's Favorite P","Red sauce, cheese, pepperoni, sausage, bacon, linguica, tomatoes, mushrooms, banana peppers, green onions",1199],
        ["Shawn's Favorite S","Red sauce, cheese, pepperoni, sausage, bacon, linguica, tomatoes, mushrooms, banana peppers, green onions",2199],
        ["Shawn's Favorite M","Red sauce, cheese, pepperoni, sausage, bacon, linguica, tomatoes, mushrooms, banana peppers, green onions",2699],
        ["Shawn's Favorite L","Red sauce, cheese, pepperoni, sausage, bacon, linguica, tomatoes, mushrooms, banana peppers, green onions",3199],
        ["Shawn's Favorite XL","Red sauce, cheese, pepperoni, sausage, bacon, linguica, tomatoes, mushrooms, banana peppers, green onions",3699],
        ["Hawaiian P","Red sauce, cheese, ham and pineapple",1199],
        ["Hawaiian S","Red sauce, cheese, ham and pineapple",2199],
        ["Hawaiian M","Red sauce, cheese, ham and pineapple",2699],
        ["Hawaiian L","Red sauce, cheese, ham and pineapple",3199],
        ["Hawaiian XL","Red sauce, cheese, ham and pineapple",3699],
        ["Island Delight P","Polynesian sauce, cheese, ham, bacon, pineapple, tomatoes, red onions, green onions",1199],
        ["Island Delight S","Polynesian sauce, cheese, ham, bacon, pineapple, tomatoes, red onions, green onions",2199],
        ["Island Delight M","Polynesian sauce, cheese, ham, bacon, pineapple, tomatoes, red onions, green onions",2699],
        ["Island Delight L","Polynesian sauce, cheese, ham, bacon, pineapple, tomatoes, red onions, green onions",3199],
        ["Island Delight XL","Polynesian sauce, cheese, ham, bacon, pineapple, tomatoes, red onions, green onions",3699],
        ["All Marvell P","Red sauce, cheese, salami, pepperoni, sausage and linguica",1199],
        ["All Marvell S","Red sauce, cheese, salami, pepperoni, sausage and linguica",2199],
        ["All Marvell M","Red sauce, cheese, salami, pepperoni, sausage and linguica",2699],
        ["All Marvell L","Red sauce, cheese, salami, pepperoni, sausage and linguica",3199],
        ["All Marvell XL","Red sauce, cheese, salami, pepperoni, sausage and linguica",3699],
        ["All Meat P","Red sauce, cheese, pepperoni, sausage, bacon and linguica",1199],
        ["All Meat S","Red sauce, cheese, pepperoni, sausage, bacon and linguica",2199],
        ["All Meat M","Red sauce, cheese, pepperoni, sausage, bacon and linguica",2699],
        ["All Meat L","Red sauce, cheese, pepperoni, sausage, bacon and linguica",3199],
        ["All Meat XL","Red sauce, cheese, pepperoni, sausage, bacon and linguica",3699],
        ["Wow Chick P","Creamy garlic sauce, cheese, chicken, red onions, tomatoes, mushrooms, herb seasoning, green onions",1199],
        ["Wow Chick S","Creamy garlic sauce, cheese, chicken, red onions, tomatoes, mushrooms, herb seasoning, green onions",2199],
        ["Wow Chick M","Creamy garlic sauce, cheese, chicken, red onions, tomatoes, mushrooms, herb seasoning, green onions",2699],
        ["Wow Chick L","Creamy garlic sauce, cheese, chicken, red onions, tomatoes, mushrooms, herb seasoning, green onions",3199],
        ["Wow Chick XL","Creamy garlic sauce, cheese, chicken, red onions, tomatoes, mushrooms, herb seasoning, green onions",3699],
        ["E-Roni","Red sauce, cheese, beef bologna, beef frankfurter sausage, green and red peppers, thyme seasoning (one size only)",3399],
        ["E-Roni Delight","Red sauce, cheese, crumble beef, mushrooms, green and red peppers, thyme seasoning (one size only)",3399],
        ["ChickMe E-Roni","Wowmia white sauce, cheese, chicken, mushroom, green and red peppers, olives, thyme seasoning (one size only)",3399],
      ] },
      { name: "Build Your Own Pizza", items: [
        ["Build Your Own Pizza (One Topping) P","Choice of one topping; regular, skinny or pan crust",999],
        ["Build Your Own Pizza (One Topping) S","Choice of one topping; regular, skinny or pan crust",1899],
        ["Build Your Own Pizza (One Topping) M","Choice of one topping; regular, skinny or pan crust",2199],
        ["Build Your Own Pizza (One Topping) L","Choice of one topping; regular, skinny or pan crust",2699],
        ["Build Your Own Pizza (One Topping) XL","Choice of one topping; regular, skinny or pan crust",2999],
      ] },
      { name: "Sandwiches", items: [
        ["Sossis Tanoori","Hotdog, mushroom, cheese, tomatoes, pickles, parsley, potato chips (available Tue-Thu)",1999],
        ["Jambon Tanoori","Beef jambon, mushroom, cheese, tomatoes, potato chips, pickles, parsley (available Tue-Thu)",1999],
        ["Super Jambon","Beef jambon, potato chips, tomatoes, pickles, parsley (available Tue-Thu)",1999],
        ["Chick Mia","Boneless wings, cheese, tomatoes, mushrooms, pickles, parsley, potato chips (available Tue-Thu)",1999],
      ] },
      { name: "Appetizers", items: [
        ["Wings 6 pc","Classic or boneless; choice of Buffalo Hot, Buffalo Mild, BBQ, Lemon Pepper, Garlic Parmesan or Polynesian",1099],
        ["Wings 12 pc","Classic or boneless; choice of Buffalo Hot, Buffalo Mild, BBQ, Lemon Pepper, Garlic Parmesan or Polynesian",1999],
        ["Wings 24 pc","Classic or boneless; choice of Buffalo Hot, Buffalo Mild, BBQ, Lemon Pepper, Garlic Parmesan or Polynesian",3299],
        ["Garlic Parmesan Sticks 3 pc","",699],
        ["Garlic Parmesan Sticks 6 pc","",1099],
        ["Garlic Parmesan Sticks 12 pc","",1699],
      ] },
      { name: "Salads", items: [
        ["Garden Salad Individual","Lettuce, grape tomatoes, cucumber, red onion, Kalamata olives, green peppers",899],
        ["Garden Salad Family","Lettuce, grape tomatoes, cucumber, red onion, Kalamata olives, green peppers",1199],
        ["Caesar Salad Individual","Lettuce, shaved parmesan cheese, croutons",899],
        ["Caesar Salad Family","Lettuce, shaved parmesan cheese, croutons",1199],
      ] },
      { name: "Beverages", items: [
        ["Soft Drink 16oz","Coke, Sprite, Diet Coke, Dr Pepper, Fanta Orange, Root Beer or Coke Zero",299],
        ["Soft Drink 2 Liter","Coke, Sprite, Diet Coke, Dr Pepper, Fanta Orange, Root Beer or Coke Zero",599],
        ["Wine Glass","Pinot Noir, Chardonnay, Cabernet or Merlot",899],
        ["Wine Bottle","Pinot Noir, Chardonnay, Cabernet or Merlot",3099],
      ] },
    ],
    siteNote: "All prices are printed in full on the business's own menu page at wowmiapizza.com/menu/; a linked third-party ordering platform (posnet.us/site/wowmia) handles checkout but was not queried separately since the menu text and prices already live on the business's own page.",
  },

  /*
     Yes Moment — gathered 2026-09-09 from own-domain
     they are: Proposal planning
     logo: https://yes-moment.com/assets/img/logos/new_logo.png (269x231) — not cut into a tile yet
     flag: no address by design — they come to the location
  */
  'yes-moment': {
    phone: "(650) 275-5520",
    email: "book@yes-moment.com",
    instagram: "yesmoment_sfbayarea",
    cuisine: "Proposal planning",
    groups: [
      { name: "Prices, from", items: [
        ["The Little Secret","A rose heart arch, a neon sign, six candles; one hour",70000],
        ["The Intimate Promise","Six grounded florals, 21 candles, a white rug or dense rose petals",70000],
        ["The Ever After","A rose aisle, twelve candles, a red carpet walkway",90000],
        ["The Enchanted Romance","Gold candelabras over a semicircle of blooms, fifteen candles",110000],
        ["The Blooming Heart","A full floral heart arch, six grounded florals, thirty candles",110000],
        ["The Grand Beginning","Neon sign, rose aisle, 24 candles, MARRY ME marquee letters",130000],
        ["The Fairytale Moment","A floral heart arch and neon sign framed by candelabras and blooms",150000],
        ["Design Your Dream Proposal","Fully custom — handpick every detail",60000,"from $600"],
      ] },
    ],
    quoteOnly: "'The premier San Francisco Bay Area proposal planner' — personalised planning, engagement ideas and full-service setup. Nine packages, $600 to $1,500; add-ons $120-$200; partner photography $350-$450.",
  },

  /*
     YogaSix East Contra Costa — gathered 2026-09-09 from third-party
     they are: Yoga studio
     logo: https://www.yogasix.com/hubfs/logo-4.png (600x120) — not cut into a tile yet
     flag: the studio is branded 'East Contra Costa' but the address is in Brentwood, which is the page it sits on
     flag: this is a location page on the YogaSix franchise site, not a studio site of its own; the logo is the brand's
     flag: no studio hours on the page itself — the schedule is a client-rendered widget
  */
  'yogasix-brentwood': {
    address: "5471 Lone Tree Way, #110, Brentwood, CA 94513",
    phone: "(925) 759-3880",
    email: "eastcontracosta@yogasix.com",
    instagram: "yogasix_eastcontracosta",
    cuisine: "Yoga studio",
    groups: [
      { name: "Prices", items: [
        ["Intro offer — 3 classes","For new students, this studio only",3600],
      ] },
    ],
    quoteOnly: "'A boutique yoga fitness studio changing the way people think and experience yoga,' with six core classes from Y6 101 to Sculpt and Flow. Only the intro offer is priced; for memberships the page says 'please contact our studio directly'.",
  },
}
