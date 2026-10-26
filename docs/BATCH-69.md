# Batch 69 — 26 October 2026

Glenn's 2:21 pm send of 26 October, Simurgh Bakery & Cafe, read off the Mac's Messages. Sources are in `research/roster/batch69.json`.

| Business | Seats | Notes |
|---|---|---|
| Simurgh Bakery & Cafe, Emeryville | Emeryville Mediterranean 9; BEASTY • Breakfast/Diner 20; BEASTY • Bakery 13 | "Emeryville • Eats / BEASTY • Breakfast/Diner". 4125 San Pablo Ave, (510) 596-5685, daily 8am–4pm. Type line "Turkish & Balkan bakery, breakfast & brunch", which fills Breakfast/Diner (and Bakery). 98 items from their own store's menu (breakfast, soups and salads, lunch plates, kids, desserts, drinks, grab-and-go); bulk baklava trays, the holiday gift box, seasonal Ramadan pide and retail honey are left out. Emeryville's Bakery spot is taken, so its open Mediterranean spot. Icon: their own logo file from their site; Glenn's three screenshots had not downloaded to the Mac. No reel. |

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff against the last release: 3 additions; nothing moved.
- `tools/audit-batch69.mjs` (6 checks) passes on a local build.

## Live

Production release `2174abd`, live by 3:33 pm on 26 October 2026. `BASE=https://beastypages.com node tools/audit-batch69.mjs` passed all 6 checks against the live site.
