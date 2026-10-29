# Batch 74 — 28 October 2026 evening

Refetched Glenn’s Mac Messages thread from 28 October, including the two pending sends noted in Batch 73. Covers his 5:17–8:41 pm business/reel sends and naming question, plus the 9:11–9:12 pm naming confirmation. Research and source notes: `research/roster/b74/`.

## Businesses

| Business | Seats | Menu and film |
|---|---|---|
| Thiên Lý House, South San Francisco | South San Francisco More goods 1; BEASTY More eats 85 | “South San Francisco • Eats / BEASTY • Eats.” The Asian spot is HL Peninsula’s and BEASTY’s Pho spot is Gao’s. 29 items from the public menu API used by their own site; the $95 family set is one item with eight included dishes. Hours from the own-site footer in Glenn’s screenshot, matching his Maps screenshot. Film: @yourglobalfoodiebff, 0–24s. |
| Kajiken San Mateo | San Mateo More goods 3; BEASTY • Ramen 7 | “San Mateo • Eats / BEASTY • Ramen.” The Asian spot is Pho de Nguyen’s and Korean/ramen is Yayoi’s. 45 items from the San Mateo Toast page linked by their site; no alcohol, free options or out-of-stock cold tofu. Own-site dining hours. Main film: @antoinetterzz, **5–29s, Kajiken only**, excluding her later SomiSomi stop. Additional reviews: @eatswithkath (“Heavy”), @eatswithfoodie (“Foodie”). |
| Taste of Shaxian, San Mateo | San Mateo More goods 4; BEASTY • Ramen 8 (by hand); BEASTY • Dim Sum 10 | “San Mateo • Eats / BEASTY • Ramen.” **Fujian Chinese noodles and dim sum, not Japanese ramen**: its honest cuisine line is retained and the Ramen seat honors Glenn’s explicit request. 181 regular-price non-alcoholic items from their own linked Chowbus menu, including frozen food and house sauces. Zero-price disclaimer, repeated dishes and member-point offers excluded. No hours because their site and Instagram give conflicting weekend schedules. @firstdibs.bayarea is the main film (“Watch this video clip,” resent as “Foodie”); three additional reviews from @thesnacksensei, @jensintec and @snackateriansf. |
| Din Ding Dumpling House — Fremont | Fremont More goods 9; BEASTY • Dim Sum 11 | “Fremont • Eats / BEASTY • Dim Sum / New Category.” 92 items from **Fremont’s** own linked Best Food Today menu; Union City’s prices differ. Both shops and ordering links in a panel. After his 8:39 pm follow-up, their own @dindingdumplingbayarea reel is the main film (0–24s of a 2024 opening film, without any expired promotion). Reviews: @thesnacksensei and @apoorva_sharma1 (original marked **#ad**). |

Seat numbers above are the zero-based internal IDs used in placements.ts and research; the page’s human spot number is one higher.

## Dumplings or Dim Sum?

At 8:38 pm Glenn requested Dim Sum; at 8:39 pm he asked “Should it be BEASTY • Dim Sum or Dim Sum? Are they the same?”, then at 8:41 pm “You choose. But it’s a category everyone will search.”

Initially used Dumplings after the 8:41 pm “You choose.” The final refetch caught Leon’s **9:11 pm “Dim sum I think”** and Glenn’s 9:12 pm acknowledgment, so the final heading is **BEASTY • Dim Sum**. Its internal kind is `dimsum`, and both **“dumplings” and “dim sum” find the page in Search**. Twelve businesses fill it from their type lines, with its own bamboo-basket wallpaper, thumbnail and category glyph. Ramen now has nine businesses. No existing seat moved.

## Every reel send

| Sent | Reel | Treatment |
|---|---|---|
| 5:17 pm | DfDGnnGPsYp, @foodie.dreams, Manila Inasal, **Los Angeles** | “Foodie”: recorded in OTHER_REVIEWS and docs/FOODIES.md as a source link. **Held off business pages and Watch:** the restaurant is not on BEASTY, following the existing Foodies rule. No new restaurant listing inferred from a Foodie tag. |
| 5:38 pm | DblRvB7x1I4, @yourglobalfoodiebff | Thiên Lý’s film. |
| 7:37 pm | DfD7T6YT7Cy, @antoinetterzz | Kajiken-only excerpt, main film. |
| 7:42 pm | DBvMxORRkM7, @eatswithkath | Kajiken review, “Heavy”. |
| 7:45 pm | DZHBRMYvzav, @eatswithfoodie | Kajiken review, “Foodie”. |
| 7:51 pm | DcXXO44osnK, @thesnacksensei | Shaxian review. |
| 7:51 pm | Dcmwqxlp0WR, @jensintec | Shaxian review, “2nd”. |
| 7:52 pm | DbUmGGDyMF3, @snackateriansf | Shaxian review, “3rd”. |
| 7:53 pm; resent 8:03 pm | DU9GimFkmVj, @firstdibs.bayarea | Shaxian’s main film, “Watch this video clip” then “Foodie”, credited once. |
| 8:38 pm | DYNeXe3SB9U, @thesnacksensei | Din Ding review. |
| 8:38 pm | DPM1flUEqkS, @apoorva_sharma1 | Din Ding review, “2nd”, original #ad. |
| 8:39 pm | DBFuIT3vF3j, @dindingdumplingbayarea | Din Ding’s own main film, “Watch this video clip”. |

**Eleven playable clips**, four main films and seven additional reviews. Every icon and clip has a credits row; original publication dates there are Pacific. No page exceeds four distinct films.

## Verification

- Build and data audit pass with 0 errors. Item glyph regression checks pass: ordinary words such as “that” and “potstickers” no longer match “hat” or “sticker” and draw a shirt on food; real apparel still does.
- Seat comparison against `7bc7215`: **19 additions, no moves or removals**.
- Batch audit covers every business page, film decoding, full menus (447 items), city seats, icons, both-shop panel, review playback, category seat data and More eats. Category audit opens Dim Sum, verifies twelve shops and its wallpaper, and searches for both names. Foodie audit covers review-to-business links.
- Historical roster walking in live-verify is now optional with `--skip-roster` for follow-up releases; all other existing verification remains enabled. This batch uses the full batch audit plus that focused live verification rather than repeating the already-checked historical roster walk.

## Live

Release `c4e1370` is live on beastypages.com. Render deployment `dep-dbhcavfb9u1s739n09b0` finished on **28 October 2026 at 9:09 pm PDT**. The brief restart returned 502; waited for HTTP 200 and the new bundle before running verification.

- `BASE=https://beastypages.com node tools/audit-batch74.mjs`: **63 checks passed**, including all four pages, 447 menu rows, eleven decoded films, credits, city seats, icons, both shops, review playback and category seat data.
- `node tools/live-verify.mjs --skip-roster`: **passed**. The historical roster walk is intentionally omitted in this mode; all other existing checks ran.
- Real Chrome at 393×852: Taste of Shaxian’s 181 menu rows render without horizontal overflow and crab roe noodles now draw a noodle icon; Din Ding’s main film decodes with “Posted by @dindingdumplingbayarea,” its two reviewers stay below it, and its page has no horizontal overflow.

The initial `c4e1370` release used Dumplings; the follow-up heading change incorporates the naming decision received while that release was being verified. Both names remain searchable.

### Final name confirmation

`708a5ce` incorporates Leon’s 9:11 pm “Dim sum I think” and Glenn’s acknowledgment. Render deployment `dep-dbhch84s728c73cudut0` finished **28 October at 9:23 pm PDT**. The final heading **BEASTY • Dim Sum** is visible on More pages in real Chrome at 393×852. The local category audit confirms that both “dumplings” and “dim sum” search for and open this page, with twelve businesses.

After this final release, the live batch audit passed **all 63 checks again**, and `tools/live-verify.mjs --skip-roster` passed again. All business/film/placement changes are on origin/main; only the historical roster walk is excluded from the focused verifier.
