# Batch 52 — 16 October 2026

Added 13 verified business pages: Manakish Oven & Grill, Poesia, Dolores Deluxe, Wilfred’s Lounge, Super Savage Games, Frymazing, D. Monaghans, Whiskey Tango Foxtrot in Antioch and Oakley, Crazy Block Cheesecakes, Parliament Brewing, Lucy’s Crepes, and Cabeza Grande Kennel (Real Presa).

Games has its own category, controller glyph, wallpaper and Search entry. Super Savage Games opens it in spot 1. Wilfred’s page carries the dog-friendly badge requested by Leon. A business opened from a grid now shows Back and returns to that exact grid and page index; direct links and Search keep Home.

Twelve verified films were added, with credits derived from each reel’s actual account. Four existing icons were replaced with new filenames: Isla, Fun Cloud, Benicia Grill and Maymay’s. Original artwork and film excerpts are documented in the public credits files. Research, source URLs, menu prices and conflicts are in `research/roster/batch52.json`.

## Placement decisions

- Existing businesses retain their seats. New businesses use the matching open cuisine seat or their city’s yellow overflow sheet.
- Parliament appears on BEASTY Bar/Lounge and Rohnert Park’s yellow food sheet. The current city model has no separate Bar/Lounge sheet. Its homepage and footer disagree on hours, so its page links to the current weekly schedule.
- Crazy Block appears on Oakland’s and BEASTY’s yellow food sheets. The BEASTY Sweets cheesecake spot is already Basq Haus’s; no business was displaced. Oakland’s existing directory model combines food and sweets on Goods and its overflow sheet rather than providing separate Eats and Sweets sheets.
- Real Presa is a verified searchable directory profile for the Illinois kennel identified by the supplied domain. The unnamed new category remains pending; no new category name was inferred from missing screenshots.

## Media exceptions

- `DeX8snzS-Ae`: football/invitation content, not a verified Manakish review.
- `DeNBS2rSB-3`: explicitly reviews Mala Tavern in Lahaina, Maui, rather than Poesia.
- `Ddxk-6MBHSr`: explicitly describes New York/New Jersey, rather than Crazy Block Cheesecakes.
- `DeODcFCCMKM` (Dolores Deluxe) and `DeF-p4_hm_4` (Wilfred’s secondary review): Instagram returned empty media responses. No broken films were published.

## Verification

`npm run build`, the data audit, the category browser audit, and `tools/audit-batch52.mjs` cover this batch. The batch audit checks every new page, video decoding and attribution, the badge, Games, Home from direct links and Back from a later Cafe grid page at a small phone viewport. Its `BASE` mode is read-only and creates no live accounts.

The broader suite was also attempted. Its results must be read individually: some original scripts assume macOS executables, and the global icon audit reports older icons that were already on main. These are not counted as passing checks. All new and changed tiles are checked separately against the unchanged icon audit functions.
