# Batch 65 — 24 and 25 October 2026

Glenn's sends from 9:32 pm on 24 October to 10:20 am on 25 October, read off the Mac's Messages: thirteen new pages, second and third films for six pages, and a second film each for two pages already listed. Sources are in `research/roster/batch65.json`.

## Up to three films a page

Glenn, 24 October 9:51 pm: "Clip this video plz (3rd) limit 3 per affiliate". He now sends a page's film, then a "(2nd video)" and a "(3rd)". The first is the page's own film (`clip`); the others are second reviews in `OTHER_REVIEWS` (`src/data/foodies.ts`), each with its own 15-second copy, `public/clips/review-<code>.mp4`. They play in the "Foodie reviews" drop-down under the page's film and in the reels feed.

- The drop-down used to need two reviews, assuming one was the film at the top. A page whose own film is the business's post (not a creator's) hid its one second film, so it now shows whenever there is a review other than the top film (`src/apps/BrandApp.tsx`).
- `tools/audit-data.ts` fails a page with more than three films, an `OTHER_REVIEWS` film whose copy is missing, or one pointing at a business that does not exist.

## The pages

| Business | Seats | Notes |
|---|---|---|
| Sofra Grill, South San Francisco | South San Francisco Medi 9; BEASTY More eats 63 | 132 Hazelwood Dr. "Clip this video plz / Halal": type line "Halal Mediterranean grill" (a HALAL decal on their door in the film; their site never says it). 64 items from their own site. No hours published. Film @imadoniseats. |
| Flour + Water Pizzeria | BEASTY More eats 64 | "BEASTY • Eats / Multiple Locations" with no city, so More eats only (the Pezcow precedent). The page is the North Beach pizzeria, 532 Columbus Ave; the three Pizza Shops (Stockton St, Mission Rock, uptown Oakland) are named on it. 25 items, daily 11:30am–10pm. Film @felicitythefoodie at the Oakland shop, without the dated "until October 31st" lines. |
| Eat. Learn. Play., Oakland | BEASTY • Youth 3; BEASTY • Donations 0 | Stephen and Ayesha Curry's foundation; type line "Kids' nutrition, literacy and play foundation". A cause, not a shop: contact only. Film from their own post of PBS NewsHour's segment, 9s–21s: wide schoolyard shots and children's backs, no interview. |
| Devil & Angel Desserts, Concord | Concord Cookies 15 | "Concord • Sweets". The Veranda, 2025 Diamond Blvd F145. Part of a 14-shop chain; no prices for this shop, so contact only. Film @trinhdoesthings; third film @_aemeriee.dance. **His "(2nd)" came with no link**, so two films, not three. |
| Heads & Tails Barbecue, Berkeley | Berkeley More goods 15; BEASTY More eats 65 | 2121 San Pablo Ave. 97 items from their ordering menu (nine marked sold out on Sunday night are kept). Their site disagrees with itself on Thursday's closing, so no hours. Film @thesnacksensei; second @festusfeasts. **His third (@bayarea_fooddreamz) is a World Cup watch party with beer and shots throughout: not cut, not linked.** |
| Kibo Sushi Danville | Danville Sushi 4; BEASTY More eats 66 | 125 Hartz Ave. 87 items from their site (udon prices from their Square store). Icon is their KIBO / SUSHI wordmark from their sushi-class flyer; they publish no logo file. No reel. |
| Shell Shock Seafood House, Hayward | Hayward More goods 1; BEASTY More eats 67 | 20413 Hesperian Blvd. 48 items; the market-price seafood bags priced from their own ordering page. Film @charweeezy. |
| Korean Papi's Kitchen, San Francisco | BEASTY • Catering 7; BEASTY • Food Trucks 12; BEASTY • Chefs 11 | "BEASTY • Catering" and "BEASTY • Food Truck". At Spark Social SF, 1379 4th St. Type line "Korean-fusion food truck & catering". No prices anywhere of theirs: contact only, with their seven dishes listed. Film @eatwithsie; second @eatwithsie, third @festusfeasts. Hand-seated after LOL Catering on Catering and Chefs, so LOL Catering keeps Catering 6 and Chefs 5. |
| Agave Uptown, Oakland | Oakland More goods 30; BEASTY More eats 68 | 2135 Franklin St. Oaxacan, 35 items from their own site, no mezcal or cocktails. No reel. |
| Ocean Subs, San Francisco | San Francisco More goods 50; BEASTY More eats 69 | 18 Ocean Ave. Toast is their only site, so needs-a-website. Toast held no menu on Sunday (not taking orders), so contact only for now: **read it again Tuesday–Saturday, 11am–4pm.** Instagram and Toast disagree on opening (10 vs 11), so no hours. Film @sherryeatworld; second @venturewithkelly, third @imadoniseats. |
| Dimond Halal Eatery, Oakland | Oakland More goods 31; BEASTY More eats 70 | 2129 MacArthur Blvd. "Needs website pilot / Halal": needs-a-website, type line "Halal burgers, wings & steak hoagies". No published menu, so contact only. Film @bayareamunchies510; second @greatonezfoodreview, third @mr.smackreviews. |
| Fast Times Burgers, Oakland | Oakland More goods 32; BEASTY More eats 71 | Inside Prescott Market, 1620 18th St, Ste F. 95 items from their own Toast (75¢ sauces included; no beer). Phone (510) 239-3004 from their site and Toast; Instagram gives a 415 number. Film @bayareamunchies510. |
| Lo Coco's, Oakland | Oakland More goods 33; BEASTY More eats 72 | Glenn wrote "Piedmont • Eats", but they are at 4270 Piedmont Ave, **Oakland** 94611: seated by their own address, like Broc Cellars. 71 items, Wed–Sun 4:30–9:30pm. No reel. |

**Films on pages already listed.** Crazy Block Cheesecakes, Oakland: @booziebrunch, "(2nd video)". Don Julio's Latin Grill, Rohnert Park: @bp__eats, "(2nd video) / Foodie also". Each page already had a film, so both are second reviews; each page now has two.

**Not added.** @victoria.pham17's reel ("Foodie / Interesting app she made") is her pitch for her own app, Homio (home cooks and bakers), not a review of a place; it is recorded in `docs/FOODIES.md` only.

**More eats** had reached 63, so the yellow sheets now hold 96 (`OPEN_SPOTS`, `src/data/slots.ts`).

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff against the last release: 25 additions, nothing moved.
- `tools/audit-batch65.mjs` (137 checks), `tools/audit-categories.mjs` and `tools/audit-foodies.mjs` pass on a local build.
