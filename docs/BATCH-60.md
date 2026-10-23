# Batch 60 — 22 October 2026, evening

Everything Glenn sent after Batch 59 (his 4:35 pm "BEASTY • Juice" send of 22 October) up to 7:25 pm that day: two businesses, Pho Now in San Jose and Vinnie's Bar & Grill in Concord, with their icons and Pho Now's own film. Research and sources are in `research/roster/batch60.json`.

**Read off the Mac.** `tools/thread-dump.py --since 2026-10-22` and `tools/gap-check.py` against the Mac's own `chat.db`, which has Glenn's thread up to 7:25 pm on 22 October.

## Already done in Batch 59

- **4:35 pm, "BEASTY • Juice / Needs website pilot"**, with two screenshots: Fresh Fuel Juicery, seated on BEASTY • Juice in Batch 59.
- **4:35 pm, reel DeF5pXEh2C_, "Clip this video plz" and "Foodie"**: @aztec.ed's Fresh Fuel reel, which is already the film on their page and logged in `docs/FOODIES.md`.

## Businesses

| Business | Seats | Notes |
|---|---|---|
| Pho Now, San Jose | San Jose More goods 22; BEASTY More eats 45 | 6:58 pm, "San Jose • Eats / BEASTY • Eats", with phonownow.com. 505 W Capitol Expy, Communication Hill. San Jose's Asian food spot is Kusan Uyghur's and BEASTY • Eats' Pho spot is Gao Viet Kitchen's, so the yellow sheets (Pho Hanoi's precedent). 87 items from the BLogic ordering page their site's "Order Online Now" opens; their Vegetarian section repeats three items and is left out. Their capitals are set in title case and the Vietnamese names kept as descriptions. Hours from their site. Film: their own reel (7:01 pm, "Clip this video plz"), 21 s, run whole, "Posted by @phonowsj". |
| Vinnie's Bar & Grill, Concord | BEASTY • Bar/Lounge (spot 24) | 7:25 pm, "BEASTY • Bar/Lounge", with their Linktree. 2045 Mt. Diablo St. Type line "Bar & grill", so it fills Bar/Lounge's last open spot by itself; the page is now full. No city seat: he named only the Bar/Lounge page (The New H Lounge's precedent). 53 food items from the four menu images on vinniesbar.com; the menu page fails to show them (they point at an old staging host), so they were opened from the site's own uploads folder. They were posted in July 2025, which the page note says. No alcohol, no daily special. 21 and over, said first in the note. Hours "open everyday 11am–2am" from their site and menu. No reel was sent, so no film. |

The icons are their own marks: Pho Now's chef-girl roundel cut from their Instagram picture, on its own slate; Vinnie's logo from the image Glenn sent, which is wider than tall, squared by extending its own black above and red below rather than cropping it.

## Verification

- `npm run build` and the data audit (0 errors).
- A before-and-after diff of every seat in the app: 3 additions and nothing moved. San Jose More goods 22 and BEASTY More eats 45, set by hand, and Bar/Lounge 23 (spot 24), filled from the type line.
- `tools/audit-batch60.mjs`: 16 checks on a local build. Each page opens and keeps Home, its images load, Pho Now's film decodes with its credit, each sits on its seat's page, every menu item is there (87 and 53), both icons are served, Pho Now is on More eats and Vinnie's on Bar/Lounge. Bar/Lounge is not among Home's page dots, so the audit reaches it through Vinnie's own place button.
- `tools/audit-categories.mjs` and `tools/audit-foodies.mjs` pass.
- `tools/gap-check.py` against the Mac: 473 sites; phonownow.com and the Linktree are listed now, and the ten "missing" are the same older ten as in Batch 59.

## Live

Production release `ebf3b16`, pushed at 8:03 pm on 22 October 2026; beastypages.com served it from 8:08 pm (`tools/live-check.mjs` found "Communication Hill" and "Mt. Diablo St" in the bundle).
- **`audit-batch60.mjs` passed against beastypages.com:** 16 checks, the same as on the local build.
- **The full `tools/live-verify.mjs` passed.**
- Run on the Mac, Postgres in Docker for the local audits. Only the site was checked; the CRM service's deploy was not confirmed from here.
