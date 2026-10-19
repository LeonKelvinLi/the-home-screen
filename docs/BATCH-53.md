# Batch 53 — 18 October 2026

Glenn's sends from 16 October (after Ace King BBQ) to 18 October: twelve business pages for eleven businesses, eleven icons and six credited films. Research, sources, conflicts and left-out items are in `research/roster/batch53.json`.

| Business | Seats | Notes |
|---|---|---|
| HiroNori Craft Ramen, Santa Clara | Santa Clara More goods | Full priced menu from their Santa Clara menu PDF. No hours published. The reel Glenn chose shows their San Mateo shop, from their own account. |
| Titos Barrio Chino, Oakland | Oakland More goods | 35 priced items from their own Adeline Food Hall ordering page. Hours left out: Instagram and the ordering page disagree. No site of their own (`needsSite`). |
| Cafe de Casa, South San Francisco | South San Francisco More goods | "3 locations": one page per city. Shared menu, 40 items, from their own Square site. |
| Cafe de Casa, San Francisco | San Francisco More goods | Castro, with Fisherman's Wharf as a panel. |
| Slice House, Brentwood | Brentwood Italian; BEASTY More eats | Pizza seat on BEASTY • Eats is King's, so More eats. Chain menu has no prices: contact only. |
| Boxing Dept., San Jose | San Jose More goods; BEASTY • Goods | Gear shop, typed so it does not fall onto Gyms. Hours vary (they post them in stories). |
| The Fat Lady, Oakland | BEASTY • Bar/Lounge; Oakland More goods | Same model as Parliament: no city Bar/Lounge sheet. Food only, no drinks. Dog-friendly patio per their own site. |
| Baekjeong, San Jose | San Jose Korean and ramen; BEASTY More eats | Korean spot on BEASTY • Eats is Belly's. No prices on their site. |
| Ones Cafe & Bakery | Castro Valley Bakery; BEASTY • Bakery (type line) | Castro Valley from their Instagram, Alameda as a panel; prices from the Alameda Toast page. |
| Lacàphê | San Jose and Fremont More goods; BEASTY • Cafe (type line) | Two shops, one menu from their own Square site. |
| Un-Stripped, Martinez | Martinez Barber and salon; BEASTY • Salons (type line) | Vagaro blocked the services list: contact only. |
| The Cheesecake Lab SF, Hayward | Hayward More goods; BEASTY More eats | Cheesecakes spot on BEASTY • Sweets is Basq Haus's (same as Crazy Block). Instagram is their only source. |

Zadna Grill (re-sent as "Redwood City • Eats") was checked against their live site: hours, address and phone already match, and the existing icon is sharper than the screenshot. No change.

Not listings: the Mission Blvd, Hayward map pin (a gas-pump photo), and the 20:29 note and statement screenshots (payment arrangements).

## Media exceptions

- `DelACp9h8Xf` (sent as "Foodie" with Ones Cafe) reviews Big Taco in Oakland, not Ones Cafe. Not used.
- Un-Stripped: "Clip this video plz" came with no link. Their most recent reel (`DeiVpmasbPm`, a lash lift, posted by @un_stripped.academy) is used; swap it if Glenn meant another.

## Verification

`tsc -b`, `npm run build`, the data audit (0 errors) and the icon audit (no hard flags on the new tiles; each tile was also checked by eye). `tools/audit-batch53.mjs` against a local build of the site passed 58 checks: every page opens, images load, all six films decode at 540 wide, creators are credited, every business sits on its city grid, and The Fat Lady shows the dog-friendly badge. The live run is recorded below once deployed.
