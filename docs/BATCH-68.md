# Batch 68 — 26 October 2026

Glenn's sends of 26 October, 5:12 am to 10:18 am, read off the Mac's Messages: ten new pages, a new category, and films and an icon for three listed pages. Sources are in `research/roster/batch68.json`. His 9:06 pm Facebook reel of 25 October ("This looks like it's up your alley") was a personal share, not a business.

## New category: BEASTY • Steakhouse

Glenn, 7:48 am: "New category / BEASTY • Steakhouse". Steakhouses and chophouses by type line (`/steak ?house|chop ?house/i`), with a steak glyph and wallpaper, in More pages and Search. It opens with eight: Chiquo & Eva's, Mac's Old House, Moxie Steak House, PAMPAS, Galpão Gaucho, and today's Bourbon Steak, Harris' and Blind Butcher.

## The pages

| Business | Seats | Notes |
|---|---|---|
| West Coast Sips, Fairfield | Fairfield More services 1; Catering 8, Chefs 12, Food Trucks 13 | "Fairfield • Services / BEASTY • Food Truck / BEASTY • Catering". A mobile dirty-soda and mocktail bar with no shop. Type line "Dirty sodas & mobile drink catering". 17 drinks from their site, matching the menu card Glenn sent; **"Crop this for their page"**: the card is cropped and shown on their page (`public/food/west-coast-sips-menu.webp`). The hours line is their delivery window. Films: their own posts (page film whole, 12 s; second 15 s). |
| Meadowlark Dairy Livermore | Livermore More goods 4 | "BEASTY • Sweets / Livermore • Goods / For Livermore location". 2287 Second St, daily 8am–9pm. No published prices: contact only. Its own walking-cow mark. Films: @truly_athi (page), @eighty6ix_, @lovelivermore. **BEASTY • Sweets' soft-serve spot is the Pleasanton shop's**, so Livermore is on Livermore's page only. |
| Maggie & Mac's, San Francisco | SF More goods 51; More eats 74 | 1326 9th Ave, Inner Sunset. 40 items from their site, no alcohol. No phone published. No reel. |
| Chubby Cattle BBQ, Pleasanton | Pleasanton Asian 2; AYCE 11 | "Pleasanton • Eats / BEASTY • AYCE". 2693 Stoneridge Dr #106. "AYCE Japanese wagyu BBQ": Silver $58, Gold $78, Diamond $88, plus to-go. Films @createwithcv, @bayarea.foodie.adventures. **His third reel (@lynniethefoodie) is their Los Angeles shop**: not cut. |
| La Mar Cebichería, San Francisco | SF More goods 52; More eats 75 | Pier 1½, the Embarcadero. 90 items from their SF menus, no alcohol. Film @festusfeasts. **His 2nd and 3rd reels are July "Passport to Peru" promos that cut between restaurants**: no 15 s of La Mar alone, so not cut. |
| Clean Sips Mocktails, San Jose | Catering 9, Chefs 13, Food Trucks 14 | "BEASTY • Catering / BEASTY • Food Truck". An alcohol-free mocktail cart; Mini Sips $7, Party Sips $120; the cart by quote. Film: their own post. |
| Bourbon Steak San Francisco | SF More goods 53; More eats 76; Steakhouse 5 | Michael Mina's, in the Westin St. Francis. 76 items, no drinks. **Page film is Michael Mina's Super Bowl party reel, as Glenn asked ("make it the 1st top one")**: 0–22 s, which still shows a champagne logo and guests with drinks; @celineeats' food-only film and @explorewithtaka's tomahawk follow. |
| The Eighth Rule, San Francisco | SF More goods 54; More eats 77 | Stephen Curry's bourbon bar with Michael Mina, same address. Not a steakhouse. 21 bar bites and tasting items, drinks out. Film @festusfeasts with Curry's caviar bites. |
| Harris' Restaurant, San Francisco | SF More goods 55; Steakhouse 6 | "San Francisco • Eats / BEASTY • Steakhouse". 2100 Van Ness. 47 items. Films @smackinfood, @yourglobalfoodiebff. The third (@taratastessf) left only 4.9 s clear of a dated menu card and cocktails: dropped. |
| Blind Butcher, San Francisco | SF More goods 56; Steakhouse 7 | 4058 18th St (the SF shop; LA's is not used). 49 items incl. the $365 Butcher's Board. Films @jetsetjanine, @thehautesheet (Festus Ezeli's visit, 9 s). The third (@staycation.sfbayarea) left only 3 s clear of cocktails: dropped. |

**Listed pages.** Meadowlark Dairy (Pleasanton): Glenn's "Please update icon" badge (`meadowlark-dairy-2.webp`, a new name so phones drop the old tile), and its first films: @grubwitmike, @humminglion, @siliconvalley.foodies. Wagyu Master San Jose: onto BEASTY • AYCE by hand ("Please add Wagyu Master to BEASTY • AYCE"; their menu is "SHABU AYCE"), films @areweeatingyet and their own; **his first reel was their Arizona shop**, not cut. Gold Bean: both reels are the Durant Ave shop in Berkeley (@arianasade, @_whatarethechances_); it is a free page, so its films wait for an upgrade.

**Seats by hand.** West Coast Sips and Clean Sips are carts, not trucks, so Food Trucks takes them by hand, as Glenn asked; their type lines say catering, which also fills Chefs, so both sit after LOL Catering (Catering 6, Chefs 5), which keeps its seats.

## Verification

- `npx tsc`, `npm run build`, the data audit (0 errors).
- Seat diff against the last release: 29 additions, nothing moved.
- `tools/audit-batch68.mjs` (126 checks), `tools/audit-categories.mjs` (now 44 categories, Steakhouse among them) and `tools/audit-foodies.mjs` pass on a local build.
