# Online fills — 25 October 2026

Leon: "fetch those menu for those business online search", then "all that are lacking info see if u can find them by searching online".

Until now a page carried only what the business published itself, so 546 of 815 pages had no menu or no hours. The 265 food businesses among them were searched online in twelve parallel passes. **225 pages were filled: 93 menus (6,054 items) and 175 hours lines**, plus phones, emails, order links and a few missing addresses. The other 40 found nothing reliable.

## How it is stored

- `src/data/onlineFills.ts`: `ONLINE_FILLS`, keyed by seed slug, laid over the seed in `brands.ts` (`withFill`), so roster names, researched seeds and their vendors all get it. A found menu retires the page's contact-only line. Seeds themselves are unchanged.
- `research/online-fills.json`: what each page got, its sources and flags.
- Source order: their own site or ordering page; their delivery-app store (DoorDash, Uber Eats, Grubhub); then a listing (Google, Yelp) for hours only. Nothing is invented.
- A menu priced from a delivery app, a Yelp menu, a news range or a photo of their menu carries `pricesEstimated`, so the page says **"Prices need confirming"**. Ocean Subs' sandwiches come from its Yelp menu (Toast shows none while it is closed); the five HL Peninsula dim sum menus, Macs by Icky and Lucy's Crêpes were read from photos of their own menus.
- **30 of the filled menus are on free (tier 1) pages**, which show no menu by design (`affiliateTiers.ts`): the menu is held there and appears if the page is upgraded.

## Corrections made on review

Nomads' hours were customer-support hours for an online shop (dropped); Bollywood Pizza Livermore opens October 31 with no closing time posted (hours dropped, menu at its San Francisco prices, as its site says); GoldPie had only a $15–$20 range from a news article (dropped); Baekjeong San Jose's hours were taken from its own site.

## Worth a look

- **Closed:** Home of Chicken and Waffles closed for good on 31 August 2026; Jackie's Place's 840 N First St shop is listed as temporarily closed. Their pages were not changed.
- **Changed:** Café Noir now calls itself Heirlume; Oasis Wine Lounge is moving to 855 Main St, Suite 101; Mac's Old House reopened in August 2026 under new owners; Papi Clary's Kitchen sells birria and spicy chicken though its type line says Filipino; The Une sells bagels and sandwiches, not noodle soup.
- **Their own site:** mochicasf.com/dessert carries injected pharmacy spam; the owner may want to know.
- **Phones that differ** from BEASTY's: John's Ice Cream, Bakefections, La Chicharronada Colombiana and Sanaa Cafe; not changed.

## Not found (40)

- ABVE the Basics (`abve-the-basics`)
- Banh Mi Oven (`banh-mi-oven`)
- BloomZephyr (`bloomzephyr`)
- Boudreaux Cajun Steak House (`bou-cajun`)
- Brundo Spice Company (`brundo-spices`)
- Cravingz (`cravingz`)
- Crushed Handcrafted Lemonade (`crushed-lemonade`)
- Cuppa Yo Danville (`cuppayo-danville`)
- Dino’s Greek Food Truck (`dinos-greek-food-truck`)
- Eat With Sie (`eat-with-sie`)
- Emy’s Cannoli (`emys-cannoli`)
- Fruits Byheart (`fruits-byheart`)
- Gold Bean (`gold-bean-pleasanton`)
- Goldpie Pizza (`goldpie-pizza`)
- Gourmet Burritos (`gourmet-burritos`)
- Home of Chicken and Waffles (`home-of-chicken-and-waffles`)
- Honey Pot Gelato (`honey-pot-gelato`)
- Izumi Revolving Sushi (`izumi-revolving-sushi`)
- Jackie's Place (`jackies-place`)
- La Chicharronada Colombiana (`la-chicharronada-colombiana`)
- Little Sheep (`little-sheep-newark`)
- Lucky Three Seven (`lucky-three-seven`)
- Mrs. Ramen Concord (`mrs-ramen`)
- Nawah Market & Deli (`nawah-market`)
- Ofie’s Kitchen (`ofies-kitchen`)
- Olesia Cake Studio (`olesia-cake-studio`)
- Pezcow (`pezcow`)
- Rain's Plates (`rains-plates`)
- Rye Cookin (`rye-cookin`)
- Santa Clara Super Kitchen (`santa-clara-super-kitchen`)
- Slice House by Tony Gemignani — Brentwood (`slicehouse-brentwood`)
- Smash Burgers Bros (`smash-burgers-bros`)
- Sourdough Eatery (`sourdough-eatery`)
- Tastin Peachy (`tastin-peachy`)
- The Breakfast Club at Midtown (`the-breakfast-club-sf`)
- The Cheesecake Lab SF (`cheesecake-lab-sf`)
- The Cozy Oven (`the-cozy-oven`)
- The French Spot (`french-spot`)
- Tuệ (`tue-twaydabae`)
- Yume Mori (`yume-mori`)

## Verification

- `npx tsc`, `npm run build`, the data audit (0 errors; the new warnings are real 45–99¢ add-ons such as extra sauce).
- Seat diff: no seat changed.
- `tools/audit-online-fills.mjs` (308 checks): every filled page shows all its items, its price note and its hours, and a free page holds its menu back; `tools/audit-categories.mjs` passes.
