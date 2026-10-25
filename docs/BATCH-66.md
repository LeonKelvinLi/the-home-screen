# Batch 66 — 25 October 2026

Glenn's 11:06 am send of 25 October, Spicy Joi's Banh Mi & Lao Street Food, read off the Mac's Messages. Sources are in `research/roster/batch66.json`.

| Business | Seats | Notes |
|---|---|---|
| Spicy Joi's Banh Mi & Lao Street Food, Concord | Concord Sandwiches 6; BEASTY More eats 73 | "Concord • Eats / BEASTY • Eats". 1687 Willow Pass Rd, in the 99 Ranch plaza. Type line "Lao street food & banh mi". 69 items from their own ordering page (order.online, their site's "Order Delivery" link); their site lists the dishes without prices. Party trays ($95–$300, three weeks' notice) are left out. Hours from their site, lunch and dinner; its Sunday "11am–8:30am" is read as 8:30 pm. Icon is their website's logo file. Film: their own post, 7s–31s, the King's Platter carried to a family table. |

**Still waiting from Batch 65.** Ocean Subs' Toast page still shows no menu while they are closed (it reopens Tuesday at 11 am), so its page stays contact only until it can be read. Dimond Halal Eatery publishes no menu or ordering page of its own; a screenshot of their Instagram MENU highlight from Glenn would give it one.

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff against the last release: 2 additions (Concord Sandwiches 6, More eats 73); nothing moved.
- `tools/audit-batch66.mjs` (15 checks) passes on a local build.

## Live

Production release `28616d9`, pushed at about 11:38 am on 25 October 2026, live by 11:43 am (`tools/live-check.mjs` found the page). `BASE=https://beastypages.com node tools/audit-batch66.mjs` passed all 15 checks against the live site.
