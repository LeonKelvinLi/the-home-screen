# Batch 64 — 23 and 24 October 2026

Glenn's sends from 23 October 1:48 pm to 24 October 8:04 pm: nineteen businesses, films and icons for five pages already listed, two new BEASTY pages, The Yard onto BEASTY • Eats, and Leon's new BIGGIE PASS price. Research and sources are in `research/roster/batch64.json`.

## New pages

| Business | Seats | Notes |
|---|---|---|
| The Roll, San Francisco | SF More goods 48; More eats 49 | 921 Folsom St. 47 items from their own online menu. |
| North Beach Pizza, Berkeley | Berkeley More goods 13; More eats 50 | 2420 Shattuck Ave (a University Ave move is announced, no date). 113 items from the Berkeley ordering page; their six other shops are in a panel. Film: @ni.ckk_, shot at their Mission St, San Francisco shop (its title card says so), food only. |
| Pho Hoa, San Jose | More eats 51 | 1834 Tully Rd; "BEASTY • Eats / Multiple locations", no city named. 80 items. Film: @moniica.michelle. |
| Crab Boil & Things, Concord | Concord More goods 4; BEASTY • AYCE | 1847 Willow Pass Rd. AYCE $39.99. No reel. |
| Wasabi Udon & Katsu Bar, Fairfield | Fairfield Sushi (Goods 5); More eats 52 | 121 items. Film: @eatwithsie. |
| Don Julio's Latin Grill, Rohnert Park | Rohnert Park Mexican (Goods 2); More eats 53 | 79 items. Film: @shesvibinhigh, cut after the "until October 30" titles; the page does not offer the limited mole pupusa. |
| Gotta Eatta Pita, Pleasant Hill | Pleasant Hill Mediterranean (Goods 10); More eats 54 | 52 items. Film: @thesnacksensei (Grand-O). |
| El Sazon, Oakland | Oakland More goods 29; More eats 55; BEASTY • Food Trucks | A taco truck at 810 81st Ave; Toast template site, so the outline. Sources disagree on hours. Film: @mayakay.official, stopped before its song's explicit lyrics. |
| Monterey Pizza & Asian Zap, San Francisco | SF More goods 49; More eats 56 | 599 Monterey Blvd. Ordering template only, so the outline. Film: @imadoniseats. |
| Inda + Mely, San Bruno | San Bruno Filipino (Goods 11); More eats 57; Catering; Chefs 10 | 158 items, party trays included. Opens BEASTY • Catering. Film: @mzz.juxtaposition. |
| Spinning Dough, Millbrae | Millbrae Italian (Goods 6); More eats 58 | Inside Modern Eats, 414 Broadway. **Opens Millbrae** (placeholder wallpaper). Film: @yourglobalfoodiebff's durian pizza; @cookwithhenny's ube pizza is a second review ("2nd video for their page"). |
| Pho Daily, San Jose | SJ More goods 23; More eats 59 | 1739 Berryessa Rd. Instagram only: contact only, the outline. Film: their own (a skit, no food on screen). |
| Mazeh Sandwich & Cafe, Concord | Concord Coffee (Goods 14); BEASTY • Cafe | Glenn's link was playcast.io, a game-streaming site; his four screenshots are all Mazeh in Sunvalley Mall, so Mazeh. 64 items. |
| Slanging Dough Pizza | BEASTY • Food Trucks | Wood-fired sourdough; home base Livermore by their own posts. No prices published. |
| Mini Pirate Donuts | BEASTY • Food Trucks | Pittsburg (405 School St). 13 items from their price board. Film: @justmostie. |
| Little Plearn Thai Kitchen, Berkeley | Berkeley More goods 14; More eats 60 | 2283 Shattuck Ave. 90 items. Film: @dchangshangry; Halloween decor is in shot, so recut after 31 October. |
| HwanYeong, Brentwood | Brentwood Boba (Goods 15); More eats 61 | Korean kitchen & boba. "Move them towards the center on Brentwood • Eats page": the Boba spot sits mid-grid and fits; Korean (Goods 8) is on the edge. Instagram only: the outline. |
| Izumi Revolving Sushi, San Jose | SJ More goods 24; More eats 62 | Glenn wrote BEASTY • AYCE, but they price by the plate and nothing of theirs says all-you-can-eat, so not AYCE. Instagram only. Film: @bayarea.foodie.san. |
| Timog, Newark | Newark Filipino (Goods 11); BEASTY • AYCE | Sunday AYCE Filipino buffet. Square template, so the outline. Film: their own. |

## Pages already listed

- **Bula Pies Fiji**: "Please update icon on a black background." Their mark on black; @eatwithsie's film.
- **House of Silog**: their badge as the icon, on black.
- **Ruay Mitr Chicken & Rice**: "Please update page and icon." Full name, address, email, hours and Toast ordering link from their own site; menu reprised from Toast (seven prices up, Kra Pow Moo Krob gone); their rooster logo; their own film.
- **East Bay Buffet**: "BEASTY • AYCE / Dublin • Eats". Type line now "All-you-can-eat Asian-American buffet", seated on AYCE 8 by hand so nobody moves; already on Dublin • Eats. @thesnacksensei's film.
- **Empire State Pizza**: their own reel.
- **The Yard**: "bump them to BEASTY • Eats page in the empty spot": Jamaican (15), the one spot open, by hand. Its tile shows its own name.

## New BEASTY pages

**FROYO** (Glenn, 23 Oct, with a Yiaya reel) and **Catering** (24 Oct, with Inda + Mely). Both fill from type lines; FROYO opens with MYO, Hey Yogurt and Cuppa Yo, Catering with seven caterers. Search's Categories now lists 43.

## BIGGIE PASS: $29.99

Leon, 24 October: "change price to $29.99 for user instead of 39.99" (it was $39), and nine referrals make the month free. `TIERS` in `src/data/membership.ts` is $29.99; the $30 referral cap now floors at $0, and the plan reads "FREE next month when you refer 9 new member sign-ups". The Stripe test-mode payment link still charges $39 until it is recreated; `tools/stripe-setup.mjs` reads the new price when the live links are made. Business fees and the affiliate terms are unchanged.

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff: 50 additions; the only other line is Ruay Mitr's new full name on its own seat. East Bay Buffet (AYCE 8) and Inda + Mely (Chefs 10) are seated by hand so nobody already there moves.
- `tools/audit-batch64.mjs` (142 checks), `tools/audit-categories.mjs` (43 categories), `tools/audit-foodies.mjs`, `tools/audit-payments.mjs` and `tools/audit-stripe.mjs` pass on a local build.
