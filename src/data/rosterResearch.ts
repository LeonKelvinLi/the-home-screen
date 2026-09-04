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
     1-Up Retro — gathered 2026-09-04 from own-domain
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
      ["1942 — NES","",1999,"from $19.99"],
      ["Adventure Island — NES","",1999],
      ["A Nightmare on Elm Street — NES","",7499],
      ["Advanced Dungeons & Dragons: Pool of Radiance — NES","",6999],
    ],
    offer: ["1942 — NES","Adventure Island — NES","A Nightmare on Elm Street — NES","Advanced Dungeons & Dragons: Pool of Radiance — NES"],
    siteNote: "'from' prices reflect condition — loose, boxed, complete in box.",
  },

  /*
     Adzeela — gathered 2026-09-04 from own-domain
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
     Al Pastor Papi — gathered 2026-09-04 from own-domain
     they are: Mexican grill
     logo: https://www.alpastorpapisf.com/uploads/b/75a7c2018d51b2a13ae14860ad1a9f6f0c865a1f22ab6e50c3a4e4419883ea86/APP%20Combined%20Logo%20%283%29_1775243606.png (2000x2000) — not cut into a tile yet
     flag: no phone or email published anywhere — the contact page is a form
     flag: their ordering pages show availability 11:15am-6:59pm while the posted hours say 11am-8pm
  */
  'al-pastor-papi': {
    address: "232 O'Farrell Street, San Francisco, CA 94102",
    hours: "Tue-Sat 11am-8pm, closed Sun-Mon",
    instagram: "alpastorpapi415",
    cuisine: "Mexican grill",
    items: [
      ["Award Winning Burrito","Twelve-inch flour tortilla, Spanish rice, black beans, cheese, avocado, crema, salsa papi",1800,"$18-$21"],
      ["Tacos al Pastor de Trompo","Mexico City style: corn tortilla, trompo pork, onion, cilantro, pineapple",500],
      ["Classic Taco","Corn tortilla, cilantro, onion, your protein",400,"$4-$6"],
      ["Crispy Queso Tacos","Crisped corn tortilla, melted cheese",700,"$7-$9"],
      ["Gringa Taco","Flour tortilla, melted cheese",800,"$8-$10"],
      ["Vampiro Tacos","Corn tortilla, melted cheese",500,"$5-$7"],
      ["The Alpastorta","Toasted roll, grilled al pastor and pineapple, refried beans, cheese, avocado, crema",1900,"$19-$21"],
      ["Bowl","Romaine, Spanish rice, black beans, cheese, avocado, crema, salsa",1800,"$18-$21"],
    ],
    offer: ["Award Winning Burrito","Tacos al Pastor de Trompo","Classic Taco","Crispy Queso Tacos"],
    siteNote: "Most items are a price range that moves with the protein.",
  },

  /*
     Ally Virtual — gathered 2026-09-04 from own-domain
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
     Almas Auto & Tires — gathered 2026-09-04 from own-domain — BLOCKED: domain does not resolve — NXDOMAIN for almasautoandtiresca.com and www. on 1.1.1.1 and 8.8.8.8; no site to read
  */
  'almas-auto-tires': {
  },

  /*
     Andrew Shin — gathered 2026-09-04 from own-domain
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
     Babs Delta Diner — gathered 2026-09-04 from own-domain
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
    offer: ["Bacon and Eggs","Homemade Corned Beef Hash","Chicken Fried Steak","Ribeye Breakfast Steak"],
    siteNote: "A 184-item priced menu inside their ordering app; no static or PDF menu.",
  },

  /*
     Banh Mi Oven — gathered 2026-09-04 from stopgap — BLOCKED: domain is not registered; there is no site to read
     flag: the given domain banhmioven.us does not exist — NXDOMAIN on two resolvers, and the .us registry has no record of it; the link he sent is dead
  */
  'banh-mi-oven': {
    needsSite: true,
  },

  /*
     Banh Mi Xpress — gathered 2026-09-04 from own-domain
     they are: Vietnamese sandwiches
     flag: no business hours or days published — the only time statement is 'banh mi served from 7:30am to 6pm'
     flag: the 'grilled pork' description actually describes the grilled beef item
     flag: menu typos: 'Vietnamse grilled ham', 'Vienamese meatball'
     flag: no logo image — the header is plain text and the favicon is a sandwich photo
     flag: no social links at all despite a 'Connect with Us' section
  */
  'banh-mi-xpress': {
    address: "951 Alamo Dr, Vacaville, CA 95687",
    phone: "(707) 305-5128",
    email: "banhmixpresscorp@gmail.com",
    cuisine: "Vietnamese sandwiches",
    items: [
      ["Bánh Mì Đặc Biệt","Premium Vietnamese cold cuts, pork loaf and pâté",935],
      ["Bánh Mì Heo Quay — crispy roast pork","Roasted pork belly with crunchy skin",935],
      ["Bánh Mì Bò Nướng — grilled beef","Grilled marinated beef",935],
      ["Bánh Mì Thịt Nguội — Vietnamese ham","Vietnamese cold cuts",835],
      ["Bánh Mì Ốp La — fried egg","Pork sausage and sunny-side-up eggs",735],
      ["Gỏi Cuốn — spring rolls (3)","Fresh rolls in rice paper",1335],
      ["Cà Phê Sữa Đá","Vietnamese iced coffee with condensed milk",600],
      ["Cà Phê Muối","Salted-cream coffee",750],
    ],
    offer: ["Bánh Mì Đặc Biệt","Bánh Mì Heo Quay — crispy roast pork","Bánh Mì Bò Nướng — grilled beef","Bánh Mì Thịt Nguội — Vietnamese ham"],
    siteNote: "The full menu with prices is on their own site; bánh mì are served 7:30am to 6pm, and they publish no days.",
  },

  /*
     The Barrel Bistro & Wine Bar — gathered 2026-09-04 from own-domain
     they are: Wine bar and bistro
     logo: https://images.squarespace-cdn.com/content/v1/62e481f28715b55915a9d17d/0cb1963c-d787-4160-9e53-4e09cd1c127f/Barrel-logotype-horizontal-2color.png (2085x200) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the footer says Sun-Thu 9am-10pm, Fri-Sat 9am-11pm with breakfast 9-2, while their structured data says 11am-10pm every day — no hours carried
     flag: the Slice ordering-widget URL is pasted as plain text in the page head, so it renders as stray visible text on every page
     flag: the header 'Order Online' deep-links to one Toast item, the Barrel Burger, instead of the menu
     flag: weekend brunch Sat-Sun 11-2 with bottomless mimosas; live music Fri-Sat 6:30-11pm; reservations on OpenTable
  */
  'barrel-bistro': {
    address: "246 South B Street, San Mateo, CA 94401",
    phone: "(650) 445-7250",
    email: "info@thebarrelbistrowinebar.com",
    instagram: "thebarrelbistrowinebar",
    cuisine: "Wine bar and bistro",
    items: [
      ["Charcoaled Prime Ribeye","16oz, roasted seasonal vegetables",6500],
      ["Chilean Sea Bass","Pan-seared, cauliflower velouté",5500],
      ["Niman Ranch Beef Short Ribs","Slow-braised, pomme purée, red wine reduction",4600],
      ["Wild Lobster Tail Risotto","Wild lobster tail on creamy risotto",4200],
      ["Cheese & Cured Meats","Prosciutto di Parma, Ibérico chorizo, bresaola, Gorgonzola dolce, brie, Idiazabal — for two, four or six",3200,"$32–$45"],
      ["Octopus Dolce Mare","Octopus carpaccio, dried fruits, blueberries",3200],
      ["Uncle Yorgos' Fire Skewers","Chicken, beef tenderloin, tiger shrimp and wild boar",5200],
      ["The Barrel Sliders","Three grilled Kobe beef sliders",2200],
    ],
    offer: ["Charcoaled Prime Ribeye","Chilean Sea Bass","Niman Ranch Beef Short Ribs","Wild Lobster Tail Risotto"],
    siteNote: "Menus are linked PDFs — brunch, lunch and dinner — with full prices; a 20% service charge for parties of six or more.",
  },

  /*
     Bay Area Charters — gathered 2026-09-04 from own-domain
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
     Bay Side Fencing Co — gathered 2026-09-04 from site
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
     Benicia Grill — gathered 2026-09-04 from own-domain
     they are: Breakfast and lunch
     logo: http://www.benicia-grill.com/assets/images/logo/logo-white.jpg (166x161) — not cut into a tile yet
     flag: About, Menu, Gallery, Coupons and Contact all return byte-identical homepage HTML — the whole nav is one page
     flag: 'Order now' buttons link to '#'; 'Order Foods 24/7' contradicts the published 7am-2pm hours
     flag: lorem ipsum in the reservation section; the reservation dropdown offers 12am-3am slots when they are closed
     flag: the homepage featured dish 'Chicken Alfredo Fettuccine' is nowhere on the menu PDF
     flag: homepage says 'Benicia Grill 1', implying numbered locations, but none other is listed
     flag: the banquet room is bookable 6am-10pm
  */
  'benicia-grill': {
    address: "4760 E 2nd St, Benicia, CA 94510",
    phone: "(707) 751-0155",
    hours: "Daily 7am-2pm",
    instagram: "benicia.grill",
    cuisine: "Breakfast and lunch",
    contactOnly: "A breakfast-and-lunch grill in Benicia since 2008 — 'fresh, hearty meals, friendly service, and a space that feels like home.' Their menu is a PDF with every price line left blank; only add-ons are priced.",
  },

  /*
     Bloom Balloon — gathered 2026-09-04 from own-domain
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
     Bober Tea & Mochi — gathered 2026-09-04 from own-domain
     their spelling: "Bober Tea & Coffee" (roster keeps "Bober Tea & Mochi")
     they are: Boba and mochi donuts
     logo: https://framerusercontent.com/images/MqLkWIPHQiotmvGb9mJ1AyXfWc8.png (500x500) — not cut into a tile yet
     flag: twenty-plus locations; the Martinez one is the roster seat. Other Bay Area shops: Pleasanton (925) 201-3893, San Ramon (925) 361-8528, San Carlos (650) 226-5552, Walnut Creek (925) 395-1344, Livermore (925) 800-7822
     flag: leftover template copy in the footer: 'Unwind and savor the burger bliss' on a boba site
     flag: a placeholder 'info@email.com' sits beside the real address
     flag: testimonials use generic full names with no dates
  */
  'bober-tea': {
    address: "1029 Arnold Dr, Ste 10, Martinez, CA 94553",
    email: "info@boberteaus.com",
    hours: "Daily 10am-9pm",
    instagram: "bober_teaus",
    cuisine: "Boba and mochi donuts",
    contactOnly: "A boba chain that 'started in Singapore' — brown sugar, cheese-foam, milk tea and Vietnamese coffee series, plus topped mochi donuts. The menu page lists drink and donut names only — no prices anywhere on the site.",
  },

  /*
     Bodylines Day Spa — gathered 2026-09-04 from own-domain
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
     Boudreaux Cajun Steak House — gathered 2026-09-04 from own-domain
     they are: Cajun
     logo: https://le-cdn.hibuwebsites.com/d2d5b30f702a402bae0d53127cfa1f94/dms3rep/multi/opt/boudreaux-cajun-steak-house-logo-a78278ea-1920w.png (546x396) — not cut into a tile yet
     flag: NOT OPEN: the site publishes hours of Mon-Sun 11am-10pm while stating the restaurant is under construction and not open to the public — the hours are not carried
     flag: no street address; 'Located in Fairfield, CA' but the service area says Sacramento
     flag: literal template variables render in the footer: {{placeholder_footer_reserve1}} through 7, and five unlabelled 'Button' placeholders on the homepage
     flag: the contact page lists the same number twice as Mobile and Alternate
  */
  'bou-cajun': {
    phone: "(844) 305-2260",
    email: "info@boucajun.com",
    instagram: "boucajun_",
    cuisine: "Cajun",
    contactOnly: "Veteran- and minority-owned 'authentic New Orleans cuisine' in Fairfield — a food truck, event catering and gumbo to go; the restaurant itself is under construction and not open to the public. No menu or prices published; ordering is by call or text; 10% military, senior and first-responder discounts advertised.",
  },

  /*
     Brasa Bros — gathered 2026-09-04 from own-domain
     they are: Peruvian rotisserie
     logo: https://images.getbento.com/accounts/c2c7fd3f33613d787a8a0347c60c09dd/media/images/28972BB_without_R.png (3530x2259) — not cut into a tile yet
     flag: the Build Your Own Bowl menu has two sections both labelled 'STEP 3'
     flag: TikTok is linked two ways on the same page, one through a corporate email-tracking wrapper
     flag: no email published — contact is a form only
  */
  'brasa-bros': {
    address: "1001 S Van Ness Ave, San Francisco, CA 94110",
    phone: "(415) 821-2134",
    hours: "Daily 11am-9pm",
    instagram: "brasa.bros",
    cuisine: "Peruvian rotisserie",
    contactOnly: "Fast-casual Peruvian in the Mission from the crew behind Limón — flame-roasted pollo a la brasa, golden crispy tenders and combos. The menus page lists every item and description but no prices — those live only on their Toast ordering page; pick-up only, order by 8:30pm.",
  },

  /*
     Cafe Noir — gathered 2026-09-04 from own-domain
     they are: African diaspora
     logo: https://images.squarespace-cdn.com/content/v1/6584861e80e9050fa3c6ffc8/2139ba63-bcf8-4ad0-a7e6-233cd69d999c/cafe-noir-oakland-full-logo.png (1592x580) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the homepage lists seven days of service, but the brunch menu says Wednesday-Sunday and the dinner menu says Wednesday-Friday, Saturday, Sunday — Monday and Tuesday contradicted, so no hours carried
     flag: the /menu page title reads 'lack Owned' — a missing B
  */
  'cafe-noir-oak': {
    address: "1620 18th St, Oakland, CA 94607",
    phone: "(415) 312-0990",
    email: "cafenoiroakland@gmail.com",
    instagram: "cafenoiroak",
    cuisine: "African diaspora",
    items: [
      ["Banana Bread French Toast","Their signature: whipped cream, Bananas Foster syrup, candied walnuts",1700],
      ["Andouille Shrimp and Grits","Stone-ground grits, cheddar, Cajun andouille and shrimp gravy",2200],
      ["Fried Chicken Sandwich","Slaw, pickled jalapeños, chipotle aioli, with fries",1850],
      ["Prescott Bowl with Blackened Shrimp","Cajun shrimp, black beans, farro, arugula, cherry tomatoes, pepper relish, herbed crema",2100],
      ["Jerk Salmon","Their best seller: fire-roasted salmon, coconut rice, fried plantains, mango salsa",2400],
      ["Noir Jollof","West African rice with grilled chicken and shrimp",2100],
      ["Braised Short Rib","Brown gravy, whipped mash, seasonal vegetables",3200],
      ["Chicken Tenders and Fries","Three tenders with fries and ranch",1250],
    ],
    offer: ["Banana Bread French Toast","Andouille Shrimp and Grits","Fried Chicken Sandwich","Prescott Bowl with Blackened Shrimp"],
    siteNote: "Menus are images on their /menu page — brunch, lunch, dinner, dessert; online ordering via Toast.",
  },

  /*
     Cali Party Bus — gathered 2026-09-04 from own-domain
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
     camachos-party-rentals — gathered 2026-09-04 from own-domain
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
     Chikin Drip — gathered 2026-09-04 from own-domain
     they are: Nashville hot chicken
     flag: they have a second San Jose kitchen at 81 Curtner Ave on the same menu, hours and number
     flag: their Instagram bio says 100% halal
  */
  'chikin-drip-san-jose': {
    address: "530 Newhall Dr, San Jose, CA 95110",
    phone: "(669) 900-3829",
    email: "info@chikindrip.com",
    hours: "Sun-Thu 11am-1am, Fri-Sat 11am-1:30am",
    instagram: "chikindrip",
    cuisine: "Nashville hot chicken",
    tagline: "Nashville hot chicken by SJC on Newhall Drive, open late",
    items: [
      ["Combo 1","One slider, slaw, pickles, secret sauce and fries",1299],
      ["Combo 2","One slider, one tender, slaw, pickles, secret sauce and fries",1499],
      ["Combo 3","Two tenders, slaw, pickles, secret sauce and fries",1399],
      ["Combo 4","Two sliders, slaw, pickles, secret sauce and fries",1799],
      ["Loaded Fries","Fries, chopped tenders, slaw, pickles and secret sauce",1399],
    ],
    offer: ["Combo 1","Combo 2","Combo 3","Combo 4"],
    siteNote: "From their own menu; cheese is 75 cents extra on any slider combo.",
  },

  /*
     Chikin Drip — gathered 2026-09-04 from own-domain
     they are: Nashville hot chicken
     flag: their Instagram bio says 100% halal
     flag: every combo is fried to order, their words
  */
  'chikin-drip-union-city': {
    address: "32004 Alvarado Blvd, Union City, CA 94587",
    phone: "(669) 900-3829",
    email: "info@chikindrip.com",
    hours: "Sun-Thu 11am-1am, Fri-Sat 11am-1:30am",
    instagram: "chikindrip",
    cuisine: "Nashville hot chicken",
    tagline: "Nashville hot chicken on Alvarado Blvd, open late every day",
    items: [
      ["Combo 1","One slider, slaw, pickles, secret sauce and fries",1299],
      ["Combo 2","One slider, one tender, slaw, pickles, secret sauce and fries",1499],
      ["Combo 3","Two tenders, slaw, pickles, secret sauce and fries",1399],
      ["Combo 4","Two sliders, slaw, pickles, secret sauce and fries",1799],
      ["Loaded Fries","Fries, chopped tenders, slaw, pickles and secret sauce",1399],
    ],
    offer: ["Combo 1","Combo 2","Combo 3","Combo 4"],
    siteNote: "From their own menu; cheese is 75 cents extra on any slider combo.",
  },

  /*
     Chip Cookies — gathered 2026-09-04 from own-domain
     their spelling: "chip cookies" (roster keeps "Chip Cookies")
     they are: Gourmet cookies
     logo: https://www.chipcookies.co/cdn/shop/files/chip-logo_dfae3b6d-9d06-41eb-85ea-ba6f9c444fe5.png?v=1733879055 (600x600) — not cut into a tile yet
     flag: A CHAIN of 23 stores in seven states, headquartered at 1805 E Williams Field Rd, Gilbert AZ. The Brentwood store is the address here; the other Bay Area stores are Dublin, 6851 Amador Plaza Rd, (925) 819-7855, and Walnut Creek, 2335 Oak Grove Road, (925) 289-9351
     flag: hours vary by store and live on per-store pages (Dublin: Sun-Thu 10am-10pm, Fri-Sat to midnight); none published for Brentwood in the HTML read, so none carried
     flag: internal franchise supply items are exposed in their public product feed
  */
  'chip-cookies': {
    address: "2505 Sand Creek Rd #128, Brentwood, CA 94513",
    phone: "(925) 489-5201",
    instagram: "chipcookiesco",
    cuisine: "Gourmet cookies",
    items: [
      ["OG","Four of their award-winning chocolate chip cookies",2200],
      ["mini OG","Bite-sized OG assortment",2200],
      ["cocoa chip","Premium cocoa, fudgy brownie texture",2200],
      ["SW chip","Dark chocolate and sea salt",2200],
      ["biscoff chip","Biscoff, white chocolate chips, stuffed with cookie butter",2200],
      ["boneless chip","Their blonde cookie base with nothing in it",2200],
    ],
    offer: ["OG","mini OG","cocoa chip","SW chip"],
    siteNote: "These are the four-cookie nationwide-shipping packs on their Shopify store; walk-in and local-delivery prices live only on order.chipcookies.co.",
  },

  /*
     Chiquo & Eva’s — gathered 2026-09-04 from own-domain
     their spelling: "Chiquo & Eva's Wagyu Steakhouse" (roster keeps "Chiquo & Eva’s")
     they are: Wagyu steakhouse
     logo: https://static.wixstatic.com/shapes/0c4e7f_e268b88348614e30b9f97dfe006b8f9e.svg — not cut into a tile yet
     flag: NOT OPEN. The homepage says 'Coming soon — End of 2026' and the first lease is not yet signed; an American Canyon address appears only in page metadata with no ZIP, so no address is carried onto the page
     flag: the menu page advertises a Saturday pop-up at The Cafe at The Inn at Benicia Bay while the Reservations page says 'we are not hosting any steakhouse pop ups' and Book Online says 'Nothing to book right now'
     flag: the footer says 'Reservations Required' on every page while the Reservations page says 'No Reservations at this time'
     flag: policy pages live on default Wix slugs /blank, /blank-1, /blank-2 and the accessibility page still carries the unedited Wix template text
     flag: name written three ways: 'Chiquo & Eva's Wagyu Steakhouse', 'Chiquo and Eva's', 'CHIQUO & EVA'S- WAGYU STEAK HOUSE'
     flag: a second tasting menu, Wagyu Ribeye Tour, is $560; sides $17-$23
  */
  'chiquo-and-eva': {
    phone: "(707) 646-1112",
    email: "chiquoxeva@gmail.com",
    instagram: "chiquoevasteaks",
    cuisine: "Wagyu steakhouse",
    items: [
      ["Full Blood Wagyu Tomahawk Ribeye, 40-44oz","Stone Axe Wagyu, Australia, marble score 9+; feeds two",30000],
      ["Japanese A5 Wagyu Ribeye, 20-22oz","Miyazaki, Japan, BMS 10+; feeds two",21500],
      ["Japanese A5 Wagyu Filet Mignon, 10oz","Miyazaki, Japan, grade A5; feeds one",19000],
      ["MoChiquo Fried Chicken Wings","Gochujang and mochiko batter, fried in beef tallow",2000],
      ["Lumpia Shanghai","Twelve Filipino fried egg rolls",2000],
      ["Silog","Garlic fried rice, fried egg, garlic chips",1700],
      ["Tyco Tomahawk — Wagyu for Two","Tomahawk, chimichurri and Hawaiian sauces, lumpia, silog, ice cream",32500],
    ],
    offer: ["Full Blood Wagyu Tomahawk Ribeye, 40-44oz","Japanese A5 Wagyu Ribeye, 20-22oz","Japanese A5 Wagyu Filet Mignon, 10oz","MoChiquo Fried Chicken Wings"],
    siteNote: "Not open yet — until the restaurant opens at the end of 2026 they cook private at-home dinners booked by email, with a four-steak minimum and a service fee they do not publish.",
  },

  /*
     Chutneys — gathered 2026-09-04 from stopgap
     flag: 2 of 4 DNS A records point at a misconfigured Cloudflare endpoint: HTTPS handshake refused, HTTP returns 'error code: 1001' — the site fails to load whenever a client picks those records
     flag: GoDaddy Website Builder template with a single Getty stock photo and GoDaddy's default icon — no business logo
     flag: publishes no cuisine, menu, address, phone, hours or social links; filed as 'Indian' but the site never says so
     flag: domain is .ai
  */
  'chutneys': {
    needsSite: true,
  },

  /*
     classy-canines — gathered 2026-09-04 from own-domain
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
     Diablo Auto Detailing — gathered 2026-09-04 from own-domain
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
     Donut Farm — gathered 2026-09-04 from own-domain
     they are: Vegan donuts
     logo: https://donutfarmberkeley.com/assets/logo.png (2306x1722) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the visible page says Sat-Sun 9am-2pm while their structured data says 7:30am-3pm — Mon-Fri 7:30am-3pm agree in both, but no hours carried
     flag: a badge claims '100% organic since 2003' while the site also says founded 2006
     flag: sister cafe Coffee Conscious at 1312 Gilman St, Berkeley; the former Oakland flagship at 6037 San Pablo is stated closed
  */
  'donut-farm': {
    address: "3278 Adeline St, Berkeley, CA 94703",
    phone: "(510) 879-6980",
    email: "pepples.donuts@gmail.com",
    instagram: "donutfarmoakland",
    cuisine: "Vegan donuts",
    contactOnly: "'Real good donuts. Always organic.' — 100% organic, fully vegan donuts made from scratch daily in Berkeley, plus weekend vegan brunch. No prices anywhere on the site; the day's flavours are posted on Instagram and ordering goes through a delivery link.",
  },

  /*
     Downtown BBQ — gathered 2026-09-04 from own-domain
     their spelling: "Downtown Barbecue" (roster keeps "Downtown BBQ")
     they are: Barbecue
     logo: https://static.spotapps.co/website_images/ab_websites/476501_website_v1/logo.png (200x200) — not cut into a tile yet
     flag: the menu intro calls it 'Downtown BBQ' while the site name is 'Downtown Barbecue'
  */
  'downtown-bbq': {
    address: "610 3rd Street, Santa Rosa, CA 95404",
    phone: "(707) 843-4830",
    email: "bbqsantarosa@gmail.com",
    hours: "Daily 11am-9pm, happy hour 3-6pm",
    instagram: "downtownbarbecue",
    cuisine: "Barbecue",
    items: [
      ["Salt & Pepper Brisket","Lean, fatty or combo, sliced; per half pound",1900,"$19 per ½ lb"],
      ["Slow Smoked Pulled Pork","Shoulder with mop sauce; per half pound",1400,"$14 per ½ lb"],
      ["Dry Rubbed Ribs","St. Louis cut; a full rack is $42",2100,"half rack $21"],
      ["Cajun Spiced Half Chicken","Bold, spicy, earthy",1700],
      ["One Meat Combo Plate","Brisket, ribs, pulled pork, hot link or half chicken, with a small side and cornbread",2300],
      ["Brisket & Calabrian Chili Pizza","Smoked brisket, spicy chili, cheese, tomato",1900],
      ["Sonoma Salad","Whole-leaf lettuces, shaved roots, pickled shallots, pumpkin seeds, smoked vinaigrette",1400],
      ["Cornbread","With honey butter",250],
    ],
    offer: ["Salt & Pepper Brisket","Slow Smoked Pulled Pork","Dry Rubbed Ribs","Cajun Spiced Half Chicken"],
    siteNote: "A 4% service charge is added to every check; brisket and pulled pork are priced per half pound.",
  },

  /*
     Eagle Pet Grooming — gathered 2026-09-04 from own-domain
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
     Eight Acres Kitchen & Bar — gathered 2026-09-04 from own-domain
     they are: Contemporary comfort food
     logo: https://eightacresbrentwood.com/wp-content/uploads/8Logo.png (176x178) — not cut into a tile yet
     flag: name varies on-site: page title '8 Acres - Le Bon Temps' vs 'Eight Acres Kitchen & Bar' in content and logo
     flag: a footer icon links to sister restaurant Forge Pizza Rockridge's Resy page (Oakland) instead of their own reservation page
     flag: their own Resy link hardcodes a stale date parameter (date=2026-07-08)
     flag: menu image pages beyond page 1 return 403, so brunch, beverage and wine prices are not readable
  */
  'eight-acres': {
    address: "801 Foothill Drive, Brentwood, 94513",
    phone: "(925) 848-0858",
    email: "info@eightacresbrentwood.com",
    hours: "Daily 11am-9pm; brunch Sat-Sun 11am-2pm; happy hour Mon-Fri 2-5pm",
    instagram: "eightacresbrentwood",
    cuisine: "Contemporary comfort food",
    items: [
      ["Eight Acres Burger","Natural angus blend, bacon jam, arugula, gruyère, pickled red onions, roasted garlic aioli",2200],
      ["BYO Burger","Natural angus blend, LTOP on the side, choice of cheese and sauce",2100],
      ["Ribeye Melt","Shaved ribeye, gruyère, toasted deli roll, au jus and horseradish cream",2900],
      ["Blackened Mahi Mahi","Whipped potatoes, sautéed greens, shrimp, andouille, white wine–lemon cream, crispy capers",3000],
      ["Strawberry Salad","Arugula, strawberries, toasted walnuts, pickled red onion, goat cheese, citrus vinaigrette",1600],
      ["Ahi Tuna","Spicy mayo, fish caramel, avocado purée, serrano, cilantro",1800],
      ["Forge Pepperoni","Pepperoni, castelvetrano olives, jalapeño, mozzarella, red onion, parmesan",2400],
      ["Grilled Ribeye","16oz ribeye, whipped potatoes, grilled asparagus, au jus and horseradish cream",5800],
    ],
    offer: ["Eight Acres Burger","BYO Burger","Ribeye Melt","Blackened Mahi Mahi"],
    siteNote: "Menus are published only as images; whole-dollar prices; online-ordering prices are on Toast.",
  },

  /*
     Empire State Pizza — gathered 2026-09-04 from own-domain
     they are: NYC-style pizza
     flag: Apple Maps prints the suite as Ste A; their own site says Suite C, which is what is here
     flag: no Instagram on the site; none carried
  */
  'empire-state-pizza': {
    address: "9130 Alcosta Blvd Suite C, San Ramon, CA 94583",
    phone: "(925) 421-1111",
    hours: "Daily 11am-9pm",
    cuisine: "NYC-style pizza",
    tagline: "NYC-style pizza on Alcosta Blvd, by the pie or the slice",
    items: [
      ["Hot Honey Ricotta Pepperoni","Classic red sauce, cheese, pepperoni, ricotta, fresh basil, hot honey, grana padano",2895],
      ["Empire Of Meats Pizza","Red sauce, Italian sausage, ground beef, salami, pepperoni, ham and linguica",2895],
      ["NY Truffle Pizza","Portobello, fresh mozzarella, pecorino romano, garlic, black and white truffle oil",2895],
      ["Pizza by the Slice","",600],
      ["Specialty Pizza Slice","",875],
      ["Empire Margherita Pizza","Red sauce, fresh mozzarella, sliced tomato, fresh basil",2895],
      ["NY White Pizza","Olive oil, ricotta, mozzarella, fresh garlic, fresh basil",2895],
      ["Combination Pizza","Pepperoni, salami, ham, sausage, mushroom, olive, bell pepper",2895],
      ["Garlic Chicken Pizza","White garlic sauce, chicken, mushrooms, green onions, tomato, garlic",2895],
      ["BBQ Chicken Pizza","Smoked BBQ sauce, chicken, mushrooms, red onions, garlic, tomato",2895],
      ["Mediterranean Mile Pizza","Pesto, pepperoncini, spinach, green olives, red onions, sun-dried tomato, feta",2895],
      ["Uptown Pesto Pizza","Pesto, chicken, sun-dried tomato, black olive, mushrooms, artichoke, feta, red onion",2895],
      ["Ray's Special Pizza","Chicken, mushroom, artichoke, roasted garlic, basil, romano, white garlic sauce",2895],
      ["Vegetarian Pizza","Mushroom, olive, tomatoes, bell pepper, red onion, garlic",2895],
      ["The Empire Tikka","Butter chicken sauce, mozzarella, butter chicken, bell pepper, red onion, mushroom, cilantro",2895],
      ["Paneer Tikka Pizza","Creamy butter sauce, mozzarella, marinated paneer, bell pepper, olive, onion, cilantro",2895],
      ["Create Your Own Pizza","",1795],
      ["Calzone","",1695],
      ["Beef & Lamb Gyro","With a bag of chips. Halal",1395],
      ["9\" Meatball Sub","With chips. Halal",1395],
      ["Hot Wings","",1295],
      ["BBQ Wings","",1295],
      ["Garlic Twists","",1195],
      ["Garlic Sticks","10 inch, white garlic sauce and pesto, topped with cheese",1495],
      ["Garlic Bread With Cheese","",895],
      ["Mozzarella Sticks","",895],
      ["Green Salad","",995],
      ["Caesar Salad","",995],
      ["Greek Salad","",1095],
      ["Brownie Cookie Pizza","",895],
      ["Chocolate Chip Cookie Pizza","",895],
      ["Fresh Cannoli","",1095],
      ["New York Cheesecake","",595],
      ["Lava Cake","",695],
    ],
    offer: ["Hot Honey Ricotta Pepperoni","Empire Of Meats Pizza","NY Truffle Pizza","Pizza by the Slice"],
    siteNote: "From their own ordering site, which takes 10% off online orders.",
  },

  /*
     Emy’s Cannoli — gathered 2026-09-04 from own-domain
     their spelling: "Emy's Cannoli" (roster keeps "Emy’s Cannoli")
     they are: Italian catering
     logo: https://bronkbuilder-website-assets.s3.us-east-2.amazonaws.com/users/55506079-77ad-4a9c-b02f-eaadca6e1803/websites/5d9c4b44-2008-4bff-923a-3e3e2f2bc244/LOGO/e3a37942-3a79-4efd-bd80-3297117fa3ae.webp (1080x946) — not cut into a tile yet
     flag: the contact form carries the builder's placeholder text, 'Business Default form', with a stray 'Subscribe' label
     flag: the hero image alt is the unedited placeholder
     flag: a one-page site: no address, hours or prices
  */
  'emys-cannoli': {
    phone: "(707) 580-2049",
    email: "emyscannoli@gmail.com",
    instagram: "emyscannoli",
    cuisine: "Italian catering",
    contactOnly: "Mobile catering bringing 'Authentic Italian Flavors Delivered to Your Special Events' — mini cannoli, tiramisu and lasagna, founded by Emy after seven years in Italy. Three offerings are named — gourmet mini cannoli, traditional tiramisu, homemade lasagna — and none is priced.",
  },

  /*
     Ethos Of California — gathered 2026-09-04 from own-domain
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
     Forno Piombo — gathered 2026-09-04 from own-domain
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
      ["Tiled Roman 80 Pizza Oven","The flagship and largest model in their refractory line",980000,"from $9,800"],
      ["Roman 80 Pizza Oven","",930000],
      ["Tiled Santino 70 Pizza Oven","",590000,"from $5,900"],
      ["Tiled Santino 60 Pizza Oven","",520000,"from $5,200"],
      ["Avanzini P1+ Gas Burner","For the Roman oven",210000],
      ["Concessionaire Pizza Oven Trailer","",3085000,"from $30,850"],
    ],
    offer: ["Tiled Roman 80 Pizza Oven","Roman 80 Pizza Oven","Tiled Santino 70 Pizza Oven","Tiled Santino 60 Pizza Oven"],
    siteNote: "'from' prices are the cheapest tile or colour variant — the Tiled Roman 80 runs $9,800 to $10,550 by tile; 49 products in their catalogue.",
  },

  /*
     The French Spot — gathered 2026-09-04 from own-domain
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
     Gay Nineties Pizza & Pasta Co. — gathered 2026-09-04 from own-domain
     their spelling: "Gay Nineties Pizza" (roster keeps "Gay Nineties Pizza & Pasta Co.")
     they are: Pizza and pasta
     logo: https://irp.cdn-website.com/5bf6c805601f409284365d58f44ccf25/dms3rep/multi/opt/gayninetieslogoidea1-1920w.png (655x570) — not cut into a tile yet
     flag: placeholder text live on the homepage: a photo credit 'Photo By: John Doe' and a button labelled 'Button'
     flag: the logo reads 'GAY NINETIES PIZZA CO.' while the site text says 'Gay Nineties Pizza'
     flag: garbled OCR-like text on the dinner menu; one suspicious lunch line prices garlic bread at $1.00
  */
  'gay-nineties-pizza': {
    address: "288 Main St, Pleasanton, CA 94566",
    phone: "(925) 846-2520",
    hours: "Mon-Thu 11am-9pm, Fri-Sat 11am-10pm, Sun 11am-9pm",
    cuisine: "Pizza and pasta",
    items: [
      ["Cheese Pizza","From the 8-inch baby up to a 16-inch large at $30",1125,"from $11.25"],
      ["Frank's Special","Pepperoni, linguiça, ham, sausage, salami, peppers, onions, olives, mushrooms",1925,"from $19.25"],
      ["All Meat Pizza","Ground beef, ham, linguiça, Italian sausage, salami, pepperoni",1925,"from $19.25"],
      ["Boneless Wings (10)","",1495],
      ["Antipasto Platter","",1650],
      ["Cheesy Garlic Bread","",1000],
      ["Veal Parmesan, à la carte","With rigatoni and meat sauce",2145],
      ["Lasagna, full dinner","",2545],
    ],
    offer: ["Cheese Pizza","Frank's Special","All Meat Pizza","Boneless Wings (10)"],
    siteNote: "Pizzas are priced by size — baby 8in, small 12in, medium 14in, large 16in — and the floors here are the baby price.",
  },

  /*
     German Auto Sport — gathered 2026-09-04 from own-domain
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
     Gofrette Pamper & Play — gathered 2026-09-04 from own-domain
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
     Golden State Ballerz — gathered 2026-09-04 from stopgap
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
    offer: ["GSB Black Backplate","CBFW Backplate","GSB Matte Black Mouthpiece","GSB Black Turf Tape"],
    siteNote: "53 fixed-price products in their catalogue.",
  },

  /*
     Gourmet Burritos — gathered 2026-09-04 from stopgap
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
     Great Impasta — gathered 2026-09-04 from own-domain
     their spelling: "The Great Impasta" (roster keeps "Great Impasta")
     they are: Italian
     logo: https://greatimpastadanville.com/pluto-images/41a358f2-018e-4d8f-b80d-91012c9f5436 (512x516) — not cut into a tile yet
     flag: homepage feature card typo: 'Everithin's made from scratch'
     flag: footer legal name: DANVILLE PASTA LLC
     flag: site is Owner.com; its host 403s a Chrome user agent but serves plain curl
  */
  'great-impasta': {
    address: "318 Sycamore Valley Rd, Danville, 94526",
    phone: "(925) 831-9363",
    email: "danvillepasta@gmail.com",
    hours: "Mon-Fri 11:15am-8pm, Sat-Sun 11am-7pm",
    instagram: "impasta_danville",
    cuisine: "Italian",
    items: [
      ["Pastas: Mix & Match","",1750,"$17.50+"],
      ["Raviolis: Mix & Match","",2250,"$22.50+"],
      ["Fettuccine Carbonara","",2499],
      ["Traditional Fettuccine Alfredo","",1750],
      ["Meat Lasagna","",2300],
      ["Grilled Chicken Piccata Olio","Grilled chicken with mushrooms, lemon juice, capers, basil and Roma tomatoes over spaghetti",2499],
      ["Garlic Cheese Bread","",1199],
      ["Caesar Salad","",1199,"$11.99+"],
    ],
    offer: ["Pastas: Mix & Match","Raviolis: Mix & Match","Fettuccine Carbonara","Traditional Fettuccine Alfredo"],
    siteNote: "Full menu with prices on /menu; a '+' suffix marks a starting price.",
  },

  /*
     Happy Bay Paws — gathered 2026-09-04 from own-domain
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
     House Of Thai — gathered 2026-09-04 from own-domain
     their spelling: "HOUSE OF THAI" (roster keeps "House Of Thai")
     they are: Thai street food
     logo: https://static.wixstatic.com/media/315f9a_35abbd9bfb684f71a13a6abbc73d3864~mv2.png (8500x4776) — not cut into a tile yet
     flag: self-contradiction: the about text says 'Established in 1999' while the logo reads 'SINCE 2001'
     flag: a second location is published only on their online-order page: 494 Haight Street, San Francisco 94117, (415) 552-2960 — hours are published for Larkin only
  */
  'house-of-thai': {
    address: "901 Larkin St, San Francisco, CA 94109",
    phone: "(415) 441-2248",
    hours: "Mon-Fri 11am-10pm, Sat-Sun 11:30am-10pm",
    instagram: "house_of_thai_sf",
    cuisine: "Thai street food",
    items: [
      ["Toong Gyen Yung (Golden Bag)","Minced chicken, onion, carrot and potato in a golden pouch",1500],
      ["Fresh Rolls","Rice noodles, spring mix, mint; shrimp or marinated tofu",1300],
      ["Tod Mun Pla (Fish Cake)","Deep-fried white fish with green beans, kaffir lime leaf and curry paste",1500],
      ["Kor Moo Yang","Grilled marinated pork neck with spicy tamarind sauce",1600],
      ["Naked Ladies","Raw shrimp with the chef's spicy lime dressing",1800],
      ["Tom Kha (chicken)","Spicy coconut milk soup with lemongrass, galangal and kaffir lime",1900],
      ["Pad Thai (tofu or mixed vegetable)","Rice noodles with egg, salted turnip and ground peanut",1800],
      ["Pineapple Fried Rice (chicken or pork)","Fried rice with pineapple, egg, cashews and raisins",2000],
    ],
    offer: ["Toong Gyen Yung (Golden Bag)","Fresh Rolls","Tod Mun Pla (Fish Cake)","Kor Moo Yang"],
    siteNote: "Full Larkin Street menu with prices on their site; many dishes are priced per protein; brown, garlic or sticky rice +$2.",
  },

  /*
     House of Wings California — gathered 2026-09-04 from stopgap
     they are: Chicken wings
     flag: houseofwingsca.com did not resolve on 2026-09-02; Glenn: 'It seems to have expired'
     flag: hours and address from their Instagram bio
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
     i.snapped Photo Booths — gathered 2026-09-04 from own-domain
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
     INTL Kitchen — gathered 2026-09-04 from own-domain — BLOCKED: Cloudflare 'Just a moment' challenge on every path; not bypassed — nothing readable
     flag: Cloudflare managed challenge on /, /sitemap.xml and /robots.txt with both user agents
  */
  'intl-kitchen': {
  },

  /*
     JDI Auto Detailing — gathered 2026-09-04 from own-domain
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
     Jenuine Fitness — gathered 2026-09-04 from own-domain
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
     J&W Mobile Detailing — gathered 2026-09-04 from own-domain
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
     Jump & Roll — gathered 2026-09-04 from own-domain
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
     Kabab Burger — gathered 2026-09-04 from own-domain
     their spelling: "Kabab Burger Mediterranean Grill" (roster keeps "Kabab Burger")
     they are: Mediterranean
     logo: https://kabab-burger.co/pluto-images/funnel/images/8d5f620f-65e9-4fd6-8725-0bdff4194b96 (2921x2888) — not cut into a tile yet
     flag: site is Owner.com; its host 403s a Chrome user agent but serves plain curl
  */
  'kabab-burger': {
    address: "3647 Mount Diablo Blvd, Lafayette, 94549",
    phone: "(925) 297-6343",
    email: "kababburgerlafayette@gmail.com",
    hours: "Mon-Thu 11am-8pm, Fri-Sat 11am-8:30pm, Sun 11am-3pm",
    instagram: "kabab.burger.lafayette",
    cuisine: "Mediterranean",
    items: [
      ["Chicken Kabab Plate","",1995],
      ["Gyros Plate","",1795],
      ["Shawarma Plate","",1845],
      ["Mix Two Kababs Plate","",2599,"$25.99+"],
      ["Falafel Plate","",1675],
      ["Kefta Kabab Plate","",1995],
      ["Sampler Platter","Hummus, Turkish salad dip, baba ganoush, spicy eggplant, pickles, tahini, two falafel, two dolmas, two pita",1745],
      ["Falafel Appetizer (5)","Five falafel made to order, with tahini",850],
    ],
    offer: ["Chicken Kabab Plate","Gyros Plate","Shawarma Plate","Mix Two Kababs Plate"],
    siteNote: "Full menu with prices on /menu; a '+' suffix marks a starting price; Early Bird menu 2–5:30pm Mon–Fri.",
  },

  /*
     Kaisen Don — gathered 2026-09-04 from own-domain
     their spelling: "Tetsujin Kaisen Don" (roster keeps "Kaisen Don")
     they are: Sushi and kaisen don
     flag: brand split: the domain is tetsujinsushi.com but Toast and Instagram use 'Kaisen Don'; the full name appears only in the page title
     flag: no logo graphic exists — the favicon is a photo of a bowl
     flag: Resy 'Book your table' links hardcode a past date (2025-12-03)
     flag: happy hour: early-bird Mon-Fri 4-6pm, night-owl daily 8:30-10:30pm
  */
  'kaisen-don': {
    address: "1042 Marina Blvd, San Leandro, CA 94577",
    phone: "(510) 969-5399",
    hours: "Mon/Wed/Thu 11:30am-2:30pm & 4pm-12am, Tue 4pm-12am, Fri-Sun 11:30am-3:30pm & 4pm-12am",
    instagram: "kaisendon1939",
    cuisine: "Sushi and kaisen don",
    contactOnly: "'Sushi and more' — kaisen don, kushiyaki and a daily happy hour in San Leandro, open till midnight. No menu or prices on their own site — the MENU buttons go to Toast.",
  },

  /*
     Love Burn Hot Chicken — gathered 2026-09-04 from stopgap
     they are: Nashville hot chicken
     flag: all facts from their Instagram bio; Toast blocks reading the menu
     flag: bio says 'Portola 26' and 'Cluck around and find out'
  */
  'love-burn': {
    address: "521A 3rd St, San Francisco, CA",
    hours: "Mon-Fri 11:30am-7pm, closed Sat-Sun",
    instagram: "loveburnchicken",
    cuisine: "Nashville hot chicken",
    needsSite: true,
    tagline: "Nashville-inspired hot chicken on 3rd Street, four spice levels",
    contactOnly: "Nashville-inspired hot chicken on 3rd Street, four spice levels. They take orders on Toast, which they link from their bio; the menu is behind it.",
  },

  /*
     Mac’s Old House — gathered 2026-09-04 from stopgap — BLOCKED: Squarespace subscription expired — no business content is published anywhere on the domain
     flag: the entire domain serves Squarespace's 'Website Expired' page — /, /menu, /sitemap.xml, www and bare, both user agents
  */
  'macs-old-house': {
    needsSite: true,
  },

  /*
     Macstalgia — gathered 2026-09-04 from own-domain
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
    offer: ["Fleetwood Mac Vinyl Frame","Sade Vinyl Frame","Marvin Gaye Vinyl Frame","9 Vinyl Discs"],
    siteNote: "Every frame is $59.99 against a $119.99 compare-at under a site-wide 'WELCOME! 50% OFF TODAY!' banner.",
  },

  /*
     Majestic Boutique — gathered 2026-09-04 from own-domain
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
    offer: ["Halter Crop Top and High-Waisted Leggings Set","Zenana Ribbed Knit Button-Down Sweater Vest","Zenana Wool Blend Striped Sweater","Zenana Washed French Terry Sweatpants"],
    siteNote: "A Shopify store with 250-plus priced products; the address is a Brentwood shop that stocks them, not a storefront of their own.",
  },

  /*
     Marina Bay Media — gathered 2026-09-04 from own-domain
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
     Meadowlark Dairy — gathered 2026-09-04 from own-domain
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
    items: [
      ["Frosty Token","Each token is good for any size frosty, slushie or diablo",375],
    ],
    offer: ["Frosty Token"],
    siteNote: "The soft-serve menu itself is not priced online; their store sells tokens, hats and a $500 name-your-own-flavour-day certificate, and the flavour of the day is posted on Instagram.",
  },

  /*
     Midnite Theories — gathered 2026-09-04 from own-domain
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
      ["Ace AF1 Trucks, polished pair","",6199,"from $61.99"],
      ["Quasi Video Dept. Tote, navy","",2500],
    ],
    offer: ["Midnite Theories Sticker Pack","53mm Spitfire Formula Four 99a Classics","54mm Spitfire F4 93a Ishod Lock-In","53mm OJ Elite Mini Combo 101a Wheels"],
    siteNote: "410 products listed, 268 in stock; 'from' prices are size variants.",
  },

  /*
     Mimi’s Chocolates — gathered 2026-09-04 from own-domain
     their spelling: "Mimi's Chocolates" (roster keeps "Mimi’s Chocolates")
     they are: Chocolates and ice cream
     logo: https://img1.wsimg.com/isteam/ip/54f7119c-a1d4-41ea-99f4-56706224959f/logo/1a5dae7a-2365-49e5-9b0c-090e056f6540.png (2560x1591) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the visible widget said 'Open today 1pm-8pm' on a Tuesday while their structured data says Mon-Fri 12-7pm, Sat 1-8pm, Sun closed — no hours carried
     flag: the homepage says 'CALL, TEXT, OR EMAIL US FOR CUSTOM ORDERS' but no email is published anywhere
     flag: the footer copyright still reads 2016
  */
  'mimis-chocolates': {
    address: "6601 Dublin Blvd, Ste N, Dublin, CA 94568",
    phone: "(510) 508-6727",
    instagram: "mimis_chocolates",
    cuisine: "Chocolates and ice cream",
    items: [
      ["Chocolate Pretzel","Milk, dark or white chocolate",225],
      ["Chocolate Covered Strawberry","Milk, dark or white chocolate",285],
      ["Chocolate Truffle (Bonbon)","Flavours include lavender honey, Nutella kanafa and vanilla bean",260],
      ["Chocolate Bacon","",355],
      ["S'more","",565],
      ["Caramel Apple","Plain; topped versions $10.25-$14",925],
      ["Single Scoop","4oz",675],
      ["Milkshake","Your choice of ice cream and milk, blended",975],
    ],
    offer: ["Chocolate Pretzel","Chocolate Covered Strawberry","Chocolate Truffle (Bonbon)","Chocolate Bacon"],
    siteNote: "The full price list is on their /menu page.",
  },

  /*
     Mrs. Ramen Concord — gathered 2026-09-04 from stopgap
     they are: Ramen and seafood boil
     flag: no website found; a 'Mrs. Pho' is listed by Yelp at the same address, which may be the same operator or the previous tenant
     flag: address is from their own Instagram bio: 'At The Veranda, 2045 Diamond Blvd. Concord, California' — no suite number, no ZIP
     flag: no phone, no hours anywhere in their own words
  */
  'mrs-ramen': {
    address: "2045 Diamond Blvd, Concord, CA",
    instagram: "mrs.ramen_concord",
    cuisine: "Ramen and seafood boil",
    needsSite: true,
    contactOnly: "Seafood boil, ramen, Korean corn dogs and rice plates at The Veranda in Concord. No website yet — their menu is posted on their Instagram, where the boiling seafood bowl board reads $17.95 and a family pack $32.95.",
  },

  /*
     One House Bakery — gathered 2026-09-04 from own-domain
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
    offer: ["Butter Croissant","Chocolate Croissant","Chocolate Chip Cookie","Apple Pie"],
    siteNote: "The full priced menu is published as image files; salads and pizzas are priced small and large; 'items subject to daily availability'.",
  },

  /*
     oneills-signature — gathered 2026-09-04 from own-domain
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
     Overly Hip Hop — gathered 2026-09-04 from own-domain
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
     PaintGo — gathered 2026-09-04 from own-domain
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
     Perfect Nine — gathered 2026-09-04 from own-domain
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
     Philomena Pizza — gathered 2026-09-04 from own-domain
     their spelling: "PHILOMENA" (roster keeps "Philomena Pizza")
     they are: Pizza and beer bar
     logo: https://images.squarespace-cdn.com/content/v1/56e8a739f850829a3e282a2a/7d848adb-25df-4a4b-96fe-25ca7319a0f0/horizantal+title.png (1944x567) — not cut into a tile yet
     flag: the link he sent, order.philomenapizza.com, is Cloudflare-blocked; these facts are from www.philomenapizza.com
     flag: no street address or phone anywhere on their main site; a parking-map image places it near E 18th St and 14th Ave, Oakland
     flag: hours are published only as an image; brunch Tue-Sun 10:30am-3pm, slices Tue-Fri 10:30am-5pm, pickup and delivery Thu-Mon until 11pm
     flag: the SMS privacy page still reads 'Effective Date: [insert date]'
  */
  'philomena-pizza': {
    email: "Philomena.manager@gmail.com",
    hours: "Mon 4-10pm, Tue-Sun 10:30am-10pm",
    instagram: "philomenaoakland",
    cuisine: "Pizza and beer bar",
    contactOnly: "An East Oakland restaurant and beer bar with homemade pizza, skillet creations and micro beer. No menu or prices on their main site; the ordering site he linked sits behind a Cloudflare challenge.",
  },

  /*
     Pho Nation — gathered 2026-09-04 from stopgap
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
    offer: ["Pho Nation Combo #1","Pho Nation Combo #2","Rare Steak & Beef Balls","Rare Steak & Well Done Briskets"],
    siteNote: "From the menu on their Yelp page, the one Glenn sent, which Yelp notes may not be up to date.",
  },

  /*
     Pho Nation — gathered 2026-09-04 from stopgap
     they are: Vietnamese
     flag: hours, phone and address from the Apple Maps card he sent; the Square site lists this location for ordering
  */
  'pho-nation-newark': {
    address: "6259 Jarvis Ave, Newark, CA 94560",
    phone: "(510) 894-2584",
    hours: "Daily 11am-9pm",
    cuisine: "Vietnamese",
    needsSite: true,
    tagline: "Pho, noodle and rice on Jarvis Avenue, order online for pickup",
    contactOnly: "Pho, noodle and rice on Jarvis Avenue, order online for pickup. They take pickup and delivery orders on their Square site, which holds the menu.",
  },

  /*
     Pho Nation SF — gathered 2026-09-04 from stopgap
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
     Pijja Paradise — gathered 2026-09-04 from own-domain
     they are: Indian pizza
     flag: a third location in Fresno is on their site and is not seated here
     flag: Glenn delivers to this one weekly and plans to show the owner her page
  */
  'pijja-paradise-livermore': {
    address: "922 Larkspur Dr Suite A1, Livermore, CA 94551",
    phone: "(925) 800-5934",
    cuisine: "Indian pizza",
    tagline: "Indian-style pizza on Larkspur Drive",
    contactOnly: "Indian-style pizza on Larkspur Drive. Their site takes orders per location; the menu and prices are behind it.",
  },

  /*
     Pijja Paradise — gathered 2026-09-04 from own-domain
     they are: Indian pizza
     flag: pijjaparadise.com renders only with JavaScript, so the menu could not be read
     flag: addresses and numbers from their own site's location list, as he sent it
  */
  'pijja-paradise-pittsburg': {
    address: "2961 Railroad Ave, Pittsburg, CA 94565",
    phone: "(925) 267-4833",
    cuisine: "Indian pizza",
    tagline: "Indian-style pizza on Railroad Avenue",
    contactOnly: "Indian-style pizza on Railroad Avenue. Their site takes orders per location; the menu and prices are behind it.",
  },

  /*
     Pizzeria Cardamomo — gathered 2026-09-04 from own-domain
     they are: Northern Italian pizza
     logo: https://static-content.owner.com/funnel/images/d7fd8779-db7d-442d-b9aa-d731c798852f?v=8219686727 (703x95) — not cut into a tile yet
     flag: site banner: open September 7th for Labor Day, closed for a team vacation September 8th to 14th
     flag: their host refuses a browser user agent but serves plain curl
  */
  'pizzeria-cardamomo': {
    address: "2053A Broadway, Redwood City, CA 94063",
    phone: "(650) 629-4193",
    email: "sarika@pizzeriacardamomo.com",
    hours: "Tue-Thu 11am-3pm & 5-9pm, Fri-Sat 11am-10pm, Sun 11am-9pm, closed Mon",
    instagram: "pizzeriacardamomo",
    cuisine: "Northern Italian pizza",
    items: [
      ["Margherita Pizza","Organic tomato sauce, fior di latte, basil",2200],
      ["Margherita DOP Pizza","Organic tomato sauce, buffalo mozzarella DOP, basil",2600],
      ["Carbonara Pizza","Fior di latte, guanciale, poached egg, Pecorino Romano DOP, voatsiperifery pepper",2800],
      ["Spicy Pepperoni with Honey","Organic tomato sauce, fior di latte, pepperoni, organic honey",2700],
      ["Tagliatelle Bolognese","House-made fresh pasta, beef ragù",2600],
      ["Nonna Arancini","Four fried rice balls with Pecorino, Parmesan, garlic and parsley, with Parmesan sauce",1200],
      ["Arugula Salad","Local peaches, Parmigiano Reggiano, walnuts, honey, vinaigrette",1500],
      ["Tiramisu","Espresso-soaked ladyfingers, mascarpone, cocoa",1200],
    ],
    offer: ["Margherita Pizza","Margherita DOP Pizza","Carbonara Pizza","Spicy Pepperoni with Honey"],
  },

  /*
     Playland 707 — gathered 2026-09-04 from own-domain
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
     Polly Ann Ice Cream — gathered 2026-09-04 from own-domain
     they are: Ice cream
     logo: https://www.pollyann.com/static/4c139f8ea465466ad98154b406f8294b/73bb6/Polly_Ann_monochrome_logo_since_1955_v2.jpg (120x120) — not cut into a tile yet
     flag: menu lists two separate categories named 'Baked goods' and 'Baked Goods'
     flag: ordering runs on an external Square site (pollyannicecream.square.site)
  */
  'polly-ann': {
    address: "3138 Noriega St, San Francisco, 94122",
    phone: "(415) 664-2472",
    email: "info@pollyann.com",
    hours: "Mon-Fri 12-9pm, Sat 11am-9:30pm, Sun 11am-9pm",
    instagram: "pollyann.sf",
    cuisine: "Ice cream",
    items: [
      ["Ice Cream Scoop (Junior)","Their smallest scoop, good for kids",495],
      ["Ice Cream Scoop (Monster)","",990],
      ["Regular Sundae","2 scoops, 4 toppings, whipped cream and cherry",975],
      ["Monster Sundae","3 scoops, 4 toppings, whipped cream and cherry",1195],
      ["Banana Split Monster","3 scoops, 1 banana, 4 toppings",1280],
      ["Milk Shake (Small 16 Oz)","",895],
      ["Pint","16 oz",1090],
      ["Ice Cream Cake 8\"","Custom 8-inch ice cream cake with one layer of baked cake",4895],
    ],
    offer: ["Ice Cream Scoop (Junior)","Ice Cream Scoop (Monster)","Regular Sundae","Monster Sundae"],
    siteNote: "Scoops are priced by size: Junior $4.95, Single $5.95, Double $7.50, Monster $9.90; all 52 flavours are the same price.",
  },

  /*
     Quickly Benicia — gathered 2026-09-04 from own-domain
     they are: Boba and Filipino snacks
     logo: https://www.quicklybenicia.com/images/quickly-logo.jpg (1818x1818) — not cut into a tile yet
     flag: the site was generated with v0.app and carries long keyword-stuffed copy
     flag: the review carousel mixes quotes labelled 'Recent Google Review' with generic undated ones
  */
  'quickly-benicia': {
    address: "822 Southampton Rd, Benicia, CA 94510",
    phone: "(707) 361-5936",
    hours: "Mon-Fri 12-7pm, Sat-Sun 9am-7pm",
    instagram: "quicklybenicia",
    cuisine: "Boba and Filipino snacks",
    items: [
      ["Chee-Hoo Sticks","",795],
      ["Hula Rings","",495],
      ["Mahalo Fries","",995],
      ["Popcorn Chicken","",995],
      ["Tocilog","Sweet pork tocino with garlic rice and egg; weekends",1395],
      ["Bangsilog","Milkfish with garlic rice and egg; weekends",1495],
      ["Combo Silog","Mix and match; weekends",1795],
      ["Breakfast Family Platter","A weekend dine-in bilao: garlic rice, BBQ skewers, tocino, longanisa, fried bangus, lumpia, fried egg",4995],
    ],
    offer: ["Chee-Hoo Sticks","Hula Rings","Mahalo Fries","Popcorn Chicken"],
    siteNote: "The food menu is priced on their site; drinks are not — 'ask a team member for current drink pricing' — and the full drink menu is on Clover.",
  },

  /*
     Red Chili — gathered 2026-09-04 from own-domain
     they are: Thai and Vietnamese
     logo: https://redchilirestaurants.com/wp-content/uploads/2025/04/Red-Chili-Rectangle-logo.png (208x58) — not cut into a tile yet
     flag: THE HAYWARD ROOM IS CLOSED — 29583 Mission Blvd, (510) 881-8593, 'temporarily closed until further notice due to repairs from a neighboring fire' per their own banner — so the open San Jose location is the address here
     flag: their TikTok link points to @redchili.bayareac with a trailing c
  */
  'red-chili': {
    address: "2538 Berryessa Rd, San Jose, CA 95132",
    phone: "(408) 937-8888",
    hours: "Daily 11am-2:30pm & 4-8:30pm",
    instagram: "redchili.bayarea",
    cuisine: "Thai and Vietnamese",
    items: [
      ["Tom Yum","Small; large $14",800,"from $8"],
      ["Pad Thai","Stir-fried rice noodles with garlic, red onion, sweet radish, tofu, bean sprouts, chives, egg",1600],
      ["Pad Kee Mao","Drunken noodles with bell pepper, tomato, onion, basil, egg",1550],
      ["Panang Curry","With bell peppers and basil",1650],
      ["Tofu Spring Rolls (2)","",795],
      ["Papaya Salad","",1375],
      ["Green Tea Sticky Rice with Mango","",950],
      ["Thai Iced Tea","",400],
    ],
    offer: ["Tom Yum","Pad Thai","Pad Kee Mao","Panang Curry"],
    siteNote: "The full menu is an eight-page PDF; soups, noodles and curries take a protein — beef +$1, fish or shrimp +$2, seafood +$4.",
  },

  /*
     rock-n-jump — gathered 2026-09-04 from own-domain
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
     Rocket MC Tow — gathered 2026-09-04 from own-domain
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
     The Royale Eatery — gathered 2026-09-04 from own-domain
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
    offer: ["La Royale Classic","The Ambassador","The King's","Chicken Waffle"],
  },

  /*
     Ruben Hibachi Grill — gathered 2026-09-04 from stopgap
     they are: Hibachi and catering
     flag: all facts from their Instagram bio; DoorDash blocks reading the menu
     flag: Glenn: 'Definitely needs a website'
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
     Rywire — gathered 2026-09-04 from own-domain
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
     Sala Thai — gathered 2026-09-04 from own-domain — BLOCKED: Cloudflare bot challenge on every URL with both user agents; not bypassed — nothing readable
     flag: WordPress behind Cloudflare — robots.txt is served, but the sitemap, /feed/ and /wp-json/ are all challenged
  */
  'sala-thai': {
  },

  /*
     The Sandwich Monkey — gathered 2026-09-04 from own-domain
     their spelling: "SANDWICH MONKEY" (roster keeps "The Sandwich Monkey")
     they are: Sandwiches
     logo: https://img1.wsimg.com/isteam/ip/36917ad0-efd1-4e42-95ce-59336e468a4d/logo/ee08cbb2-6554-4f3d-b953-6eb8899b9d2f.png (2560x2560) — not cut into a tile yet
     flag: the 'Menu' page contains no menu at all
     flag: HOURS CONFLICT on their own site: the visible widget says 'Open today 10am-4pm' while their structured data lists Mon-Fri 10-4, Sun 10:30-4 and a garbled Saturday that closes before it opens — none carried
     flag: second location: 121 Spear Street, San Francisco 94105, (415) 251-1054
     flag: the Instagram link goes to a location page, not a profile
  */
  'sandwich-monkey': {
    address: "3 Plaza View Lane, Suite V, Foster City, CA 94404",
    phone: "(650) 274-0264",
    cuisine: "Sandwiches",
    contactOnly: "A sandwich shop with locations in Foster City and San Francisco; ordering for pickup and catering through Square. Their site's Menu page is empty; the menu and prices exist only in a client-rendered Square store.",
  },

  /*
     Santa Clara Super Kitchen — gathered 2026-09-04 from own-domain
     they are: Halal catering
     logo: https://assets.cdn.filesafe.space/eB7n0OPlq05vyyLG9vE5/media/69ef20660d66f2a66587db87.png (866x288) — not cut into a tile yet
     flag: name alternates on the site: 'Santa Clara Super Kitchen' (title, logo, copyright) vs 'Santa Clara Super Kitchens' (About and FAQ)
     flag: no street address published — location given only as 'Santa Clara, California'
     flag: uses 'tasting' site-wide where 'catering' is plainly meant
     flag: second phone published as 'Online Ordering': (669) 310-5261; separate catering email catering@santaclarasuperkitchen.com
     flag: hero and gallery use Unsplash stock photos; copyright line still says 2025
  */
  'santa-clara-super-kitchen': {
    phone: "(669) 600-0201",
    email: "info@santaclarasuperkitchen.com",
    instagram: "santaclarasuperkitchen",
    cuisine: "Halal catering",
    contactOnly: "'California's premier shared kitchen network' selling halal corporate catering and office meal delivery from partner restaurant brands. They claim '350+ menu options' and 'transparent pricing' but publish no menu items or prices; quotes come through a tasting-request form.",
  },

  /*
     Señor Sisig — gathered 2026-09-04 from own-domain
     they are: Filipino fusion
     logo: https://images.getbento.com/accounts/ab73e9d161ec9b04042370bad74771a9/media/images/17855logo.png (900x260) — not cut into a tile yet
     flag: three more shops plus trucks: Ferry Building (1 Ferry Building Suite 41), Thrive City (151 Warriors Way Suite 103), Oakland (330 17th Street, 94612)
     flag: the Thrive City address is published with ZIP 94518, which is not a San Francisco ZIP
     flag: name written both 'Señor Sisig' and 'Senor Sisig' on the same pages
  */
  'senor-sisig': {
    address: "990 Valencia St, San Francisco, CA 94110",
    phone: "(855) 747-4455",
    email: "contact@senorsisig.com",
    hours: "Daily 11am-9pm",
    instagram: "senorsisig",
    cuisine: "Filipino fusion",
    contactOnly: "'From Sisig Burritos to Sinigang Wings, we remix traditional Filipino flavors into innovative dishes everyone can enjoy.' The menu page lists every item with no prices — sisig tacos, burritos, fries, nachos, rice bowls, the Crispy Sinigang Wings — and prices live only inside their ordering flow.",
  },

  /*
     Shaka Shack — gathered 2026-09-04 from stopgap
     they are: Hawaiian brunch
     flag: their only site is a Square Online store — the operator's own 'Needs website'
     flag: the site's About and Catering pages return 404 while the footer advertises catering, corporate lunches and restaurant buyouts
     flag: Instagram bio says the profile is being rebuilt: 'mahalo for the follow, help rebuilding our Instagram ohana'
  */
  'shaka-shack': {
    address: "2300 Blanding Ave, Alameda, CA 94501",
    phone: "(510) 305-8754",
    email: "shakashackeats@gmail.com",
    hours: "Mon-Tue, Thu-Sun 8:30am-3pm, closed Wed",
    instagram: "shakashackeats",
    cuisine: "Hawaiian brunch",
    needsSite: true,
    items: [
      ["Syd's Loco Moco","Burger, rice, eggs your way, gravy",1900],
      ["Musubi","Spam musubi",500],
      ["Malasadas","One malasada, your choice of filling and sugar",300],
      ["Ube Waffles","Ube waffles with ube syrup and fresh fruit",1700],
      ["Kai's Plate Lunch","Your choice of lava chicken or kalua pork with mac or kimchi cucumber salad",1700,"$17-$22"],
      ["Stella's Kalbi Rib Loco Moco","Kalbi ribs and an egg your way over rice, topped with gravy",2400],
      ["Big Kahuna Loco Moco","Burger, kalua pork, Portuguese sausage with fried rice",2600],
      ["Squirt's Kalua Pork Loco Moco","Kalua pork, rice, eggs, gravy",1900],
      ["Hawaiian Roll French Toast","Hawaiian rolls turned into French toast bites with ube syrup and fresh fruit",1700],
      ["Da Kine","Two eggs your way, house potatoes, rice, Hawaiian roll toast",1600],
      ["Poke Bowl","Rice, slaw, cucumber, edamame, avocado, furikake, seaweed salad, ginger",2000],
      ["Hawaiian Chili","Portuguese sausage, spam, beef and bacon with four beans over rice, green onions, cheese and a Hawaiian roll",1500],
      ["Tutu's Mac Salad","Great grandma's recipe with spaghetti noodles",400],
      ["Malasada Filling Sampler Half Dozen","Six filled malasadas, one of each filling",2100],
      ["POG Juice","Passion fruit, orange, guava",500],
      ["Keiki Loco Moco","A small loco moco, for kids",1200],
    ],
    offer: ["Syd's Loco Moco","Musubi","Malasadas","Ube Waffles"],
    siteNote: "63 items are priced on their Square ordering site — breakfast, lunch, a keiki menu, Signal Coffee drinks, sweets and Kona beer.",
  },

  /*
     SIA Collective — gathered 2026-09-04 from own-domain
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
    offer: ["XSV Sneaker (Rattlesnake)","SIA-NARRA 510 (Touch Grass)","EVO Foam Trainer (Pigeon)","Rerun High (Royal)"],
    siteNote: "191 priced products in their Shopify catalogue; sub-$2 listings are Route shipping-protection add-ons and $999.99 items are made-to-order reservations, neither listed here.",
  },

  /*
     Simply Soups — gathered 2026-09-04 from own-domain
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
    items: [
      ["Soul Bowl","Build your own: a base, a protein and two sides",2999],
    ],
    offer: ["Soul Bowl"],
    siteNote: "Only the Soul Bowl is priced on their own site; the rest of the menu sits behind order.online links.",
  },

  /*
     Sol Taqueria — gathered 2026-09-04 from own-domain
     they are: Jalisco-style Mexican
     logo: https://static.wixstatic.com/media/fab297_42e925a7e2a14b0c8cb14ff9b5e5d2e0~mv2.png (889x1123) — not cut into a tile yet
     flag: footer hours are typed 'MOn-Thur 10-9PM' with no AM marker on the ten
     flag: the 'Follow Us!' section embeds an Instagram widget but no handle appears anywhere in the HTML
     flag: the drink flyer spells 'MARAGARITAS'
  */
  'sol-taqueria': {
    address: "1335 San Pablo Ave, Berkeley, CA 94702",
    phone: "(510) 529-4325",
    email: "SolTaqueriaBerkeley@gmail.com",
    hours: "Mon-Thu 10am-9pm, Fri-Sun 8am-9pm",
    cuisine: "Jalisco-style Mexican",
    items: [
      ["Huarache","Their signature: a giant fried tortilla layered with beans, your meat, cheese, salsa, onion, cilantro",1995],
      ["Molcajete","A seasoned volcanic-stone bowl of meats, seafood and vegetables",2999],
      ["Piña Loca","A pineapple filled with seafood, meats, vegetables and cheese",2500],
      ["Fajitas Plate","Rice, beans, sour cream, pico; flour or corn tortillas",1950],
      ["Carne Asada Plate","Rice, beans, lettuce, guacamole, sour cream, pico",1750],
      ["Camarones a la Diabla","",2295],
      ["Super Burrito","Rice, beans, pico, guacamole, cheese, crema, your meat",1550],
      ["Quesabirria","Birria, cheese, salsa verde, onion, cilantro, with consommé",599],
    ],
    offer: ["Huarache","Molcajete","Piña Loca","Fajitas Plate"],
    siteNote: "The full food menu is priced on their /menus page; the drink and happy-hour menus are picture flyers with no prices.",
  },

  /*
     SupTea Lab — gathered 2026-09-04 from stopgap
     they are: Boba and Taiwanese snacks
     logo: https://suptealaboakland.square.site/uploads/b/bcb2fda72610bd6712fe73e313670e34259b6a3cdae75d0a3a0f53a37060193a/LOGO%20Final_design_01_1708289189.jpg (2048x2048) — not cut into a tile yet
     flag: no address, phone or hours anywhere — 'Oakland' appears only in the square.site subdomain
     flag: unedited Square brewery template copy on the homepage: 'Our most popular beers', 'Visit our brewery for lunch'
     flag: the Menu, Merch, About, Events and Locations nav pages all 404
  */
  'suptea-lab': {
    email: "info@suptealab.com",
    instagram: "suptealab",
    cuisine: "Boba and Taiwanese snacks",
    needsSite: true,
  },

  /*
     Tastin Peachy — gathered 2026-09-04 from stopgap
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
     The Farmacy — gathered 2026-09-04 from own-domain — BLOCKED: Cloudflare managed challenge on every page including robots.txt; nothing readable
     flag: every page is behind a Cloudflare challenge; only the sitemap is served, and its slugs describe a chicken concept — strips and chips, fried and rotisserie chicken sandwiches — not a cafe
  */
  'the-farmacy': {
  },

  /*
     The Hangout — gathered 2026-09-04 from own-domain
     their spelling: "The Hangout Breakfast" (roster keeps "The Hangout")
     they are: Breakfast and brunch
     logo: https://static.wixstatic.com/media/4498e5_d17e57814acd47d6829b1586449b2574~mv2.png (1558x1441) — not cut into a tile yet
     flag: second location: 2217 Morello Avenue, Pleasant Hill 94523, (925) 671-9925, daily 8am-3pm — that is the other seat
     flag: the footer says 'The Hangout'; the title and domain say 'The Hangout Breakfast'
  */
  'the-hangout-breakfast': {
    address: "1908 Tice Valley Blvd, Ste A, Walnut Creek, CA 94595",
    phone: "(925) 546-3122",
    hours: "Mon-Fri 8am-2:30pm, Sat-Sun 8am-3pm",
    instagram: "thehangoutbayarea",
    cuisine: "Breakfast and brunch",
    items: [
      ["Ube Pancake","Purple yam pancake with a house purple yam sauce",1900],
      ["Chick Pops","Crispy fried chicken and bite waffles",1300],
      ["Avocado Toast","Strawberries, basil, fresh mozzarella, mixed greens",1400],
      ["The Hangout Omelette","Bacon, avocado, tomato, cheddar, house bacon jam",2500],
      ["Hangover","Stir-fried noodles, basil, peppers, onion, mushroom, apple, bacon, fried egg",2200],
      ["Crispy Chicken & Waffle","Over a Belgian waffle with house spicy maple syrup",2400],
      ["Loco Moco","Beef patty and rice, peppers, mushroom, onion, fried egg, curry and gravy",2300],
      ["California Burger","Beef patty, romaine, avocado, tomato, cheddar, bacon jam, brioche",2000],
    ],
    offer: ["Ube Pancake","Chick Pops","Avocado Toast","The Hangout Omelette"],
    siteNote: "Whole-dollar prices on their own menu; 'prices may change without notice'.",
  },

  /*
     The Model Bakery — gathered 2026-09-04 from own-domain
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
    items: [
      ["Almond Croissant","",475],
      ["Morning Bun","",425],
      ["Granola Parfait","",850],
      ["Joe To Go","Serves twelve 8oz cups, with fixings",4500],
      ["Breakfast Sandwich Platter","Serves 12: twelve sandwiches halved, a fruit cup, coffee with fixings",27500],
      ["Lunch Sandwich Platter","Serves 12: twelve sandwiches, tea, kettle chips, cookies",25000],
    ],
    offer: ["Almond Croissant","Morning Bun","Granola Parfait","Joe To Go"],
    siteNote: "These prices are from their catering PDF ('items and pricing subject to change'); cafe prices live only in their Toast and Square ordering apps.",
  },

  /*
     The Tox Alamo — gathered 2026-09-04 from own-domain
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
     TOWNFUTURIST MEDIA — gathered 2026-09-04 from own-domain
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
     TruFusion Walnut Creek — gathered 2026-09-04 from third-party
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
     U Dessert Story — gathered 2026-09-04 from own-domain
     their spelling: "U :Dessert Story" (roster keeps "U Dessert Story")
     they are: Asian desserts
     logo: https://chowly-coo-configuration-assets.nyc3.digitaloceanspaces.com/chowly-coo-prod-configuration-assets/public/assets/U%3ADessert-Story-bdfc5969-cce0-4a23-afb1-a9eaa90f1149.png (908x951) — not cut into a tile yet
     flag: HOURS CONFLICT on their own site: the /location page and the /contact-us page publish different schedules for both shops — none carried
     flag: Berkeley: 1849 Shattuck Ave 94709, (510) 356-4127
     flag: the /location blurb says 'Visit us in Bernal Heights' though the shops are on 16th Street and in Berkeley — template filler
  */
  'u-dessert-story': {
    address: "3489 16th St, San Francisco, CA 94114",
    phone: "(415) 796-3633",
    email: "udessertstory.official@gmail.com",
    instagram: "udessertstory",
    cuisine: "Asian desserts",
    contactOnly: "An Asian dessert cafe in San Francisco and Berkeley — 'We bring a new perspective to Asian desserts, making everything in-house.' Ordering runs through an embedded app; no prices in the page and no PDF menu — the signatures are the Brown Butter Chicken Croffle, the Ube Matcha Latte and the Mango Sticky Rice Bingsu.",
  },

  /*
     uBreakiFix — gathered 2026-09-04 from third-party
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
     United Curb Painting — gathered 2026-09-04 from own-domain
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
     Urban Air — gathered 2026-09-04 from own-domain
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
     Vending Enterprise — gathered 2026-09-04 from stopgap
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
     Willy Billy Smoked Meat — gathered 2026-09-04 from own-domain
     their spelling: "WILLY BILLY'S SMOKED MEATS" (roster keeps "Willy Billy Smoked Meat")
     they are: Halal Texan BBQ
     logo: https://assets.cdn.filesafe.space/2W3mKjfU3GREdwOnEUvd/media/67b76555410afca5d4f1fc10.png (1674x1887) — not cut into a tile yet
     flag: canonical URL points to jerkandjava.com and the header logo's alt text reads 'Jerk and Java Logo' — the site is a re-skin of another restaurant's template
     flag: the published contact email is info@sumferkitchens.com, a DIFFERENT business's domain — deliberately not carried onto this page
     flag: name written three ways on-site: 'Willy Billy's BBQ' (title), 'Willy Billy's Smoked Meat' (body), 'Willy Billy's Smoked Meats' (footer and logo)
     flag: five more addresses listed, which read as ghost-kitchen suites: 949 Ruff Dr San Jose 95110; 60 Morris St SF 94107; 1200 Market St SF 94102; 5333 Adeline St Oakland 94608; 42550 Albrae St Fremont 94538 'coming soon'
     flag: copy says 'right here in San Jose' while the first listed address is San Francisco
     flag: footer address is just 'Califonia, United States' (typo); Location page carries kitchen-remodelling boilerplate; testimonials look templated
  */
  'willy-billy-smoked-meat': {
    address: "90 Charter Oak Ave, San Francisco, CA 94124",
    phone: "(408) 650-2589",
    hours: "Mon-Fri 10am-10pm, Sat-Sun 9am-11pm",
    cuisine: "Halal Texan BBQ",
    items: [
      ["Brisket (Regular)","",1800],
      ["Brisket (Large)","",2500],
      ["Pulled Beef (Regular)","",1600],
      ["Beef Hot Links","",1450],
      ["Dino Beef Rib","",3500],
      ["2-Meat Combo","",2500],
      ["3-Meat Combo","",2900],
      ["Brisket Burger","",1550],
    ],
    offer: ["Brisket (Regular)","Brisket (Large)","Pulled Beef (Regular)","Beef Hot Links"],
    siteNote: "BBQ meals include one side, combos two; sides $3-$6.",
  },

  /*
     Winter White Car Wash & Detail — gathered 2026-09-04 from own-domain
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
     Yes Moment — gathered 2026-09-04 from own-domain
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
     YogaSix East Contra Costa — gathered 2026-09-04 from third-party
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
