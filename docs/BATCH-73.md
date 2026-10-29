# Batch 73 — 27 October evening, completed 28 October 2026

Continued Claude Code’s saved work after its usage limit. Refetched Glenn’s thread from the Mac with `DEVELOPER_DIR=/Library/Developer/CommandLineTools python3 tools/thread-dump.py --since 2026-10-27` and ran `tools/gap-check.py`. This batch covers the business and reel sends from 27 October 5:55 pm through 10:51 pm. Research is in `research/roster/b73/`.

## New businesses

| Business | Seats (internal zero-based IDs) | Menu items |
|---|---|---|
| Chef Smelly’s Creole | beasty-catering-10, beasty-cooks-14, oakland-goods2-37 | 135 |
| Early to Rise | beasty-diner-21, san-francisco-goods2-60 | 72 |
| EPIC Steak | beasty-steakhouse-8, san-francisco-goods2-57 | 81 |
| Fresca | beasty-goods2-83, san-francisco-goods2-59 | 60 |
| Garlic High — Sunnyvale | beasty-ramen-6, sunnyvale-goods-7 | 41 |
| Lunette Cambodia | beasty-goods2-81, san-francisco-goods2-58 | 18 |
| Square Pie Guys | beasty-goods2-82, oakland-goods2-36 | 70 |
| Tacos Oscar | beasty-goods2-80, oakland-goods2-35 | 37 |

Garlic High introduces **BEASTY • Ramen**, which fills seven shops from their type lines. EPIC Steak fills Steakhouse and Early to Rise fills Breakfast/Diner. Chef Smelly is seated by hand on Chefs and Catering so existing businesses retain their spots. Square Pie Guys has a panel for all six shops; Tacos Oscar lists Oakland and San Francisco. Prices and exceptions are recorded in each research file; EPIC Steak is quote-only.

## Existing pages and reels

Brunch & Bloom gets its own icon and film, plus reviews by @lovemissfit and @jantrinanicole. The Sweet Spot gets its own film, the phone (925) 401-5016 from Glenn’s Instagram screenshot, reviews by @wthellydanyelly, @realtorandreviewer and @xoaramarie, and BEASTY More eats 84 (the Sweets specialty spot is held).

There are **26 new playable films**: nine page films and seventeen additional reviews. Every film and icon has a row in its CREDITS.md. Glenn’s heavy hitter, medium and newbie tags are kept in the review comments and credits. Tacos Oscar’s film stops before the next business in the itinerary.

Glenn asked on 27 October at 3:20–3:22 pm for up to three foodie reviews alongside “Watch their video”; Leon replied at 3:23 pm, “We can have more too.” The data audit now permits four distinct films per page. A main film made by a reviewer may also appear in the Foodie list; that is one film appearing in two places.

## Scope after refetch

The Mac now also holds these later sends, **pending the next batch**:
- 28 October 5:17 pm: Instagram reel `DfDGnnGPsYp`, “Foodie”; needs creator/business identification and review research.
- 28 October 5:35–5:38 pm: `thienly.us/contact`, screenshots IMG_8372/8374/8375/8376, “South San Francisco • Eats / BEASTY • Eats”, reel `DblRvB7x1I4`, “Clip this video plz”; needs business/menu/icon and film research.

The call arrangements and seller pickup messages are personal follow-ups. The earlier business-card and reels UI requests have subsequent commits on main; affiliate terms remain separate work.

## Verification

- Build and data audit: pass, 0 errors (existing warnings retained).
- Seat comparison against `dfcca44`: **24 additions, no existing seats changed or removed**.
- Batch audit checks rendered pages, full menus, film decoding, credits, review links, icons, shop panels, city seats and More eats. Extra categories require membership; their computed seats are checked from release data, and the category audit checks signed-in navigation locally.
- Foodie audit passes. The category audit’s category count is updated from 44 to 45 for Ramen.

Local batch audit, category audit and Foodie audit all passed.

## Production

Release `ffacc1d` deployed on 28 October 2026. Render reports the website deployment `dep-dbh9obo473hc73cb5pq0` live at 6:13 pm PDT, and CRM deployment `dep-dbh9obo473hc73cb5q70` live at 6:13 pm PDT. A temporary HTTP 502 during deployment recovered; `/api/health` returned 200 afterward.

`BASE=https://beastypages.com node tools/audit-batch73.mjs` passed all **127 checks**. `tools/live-check.mjs` found `b_garlichighsunnyvale` and `beasty-goods2-84` in the deployed bundle, and `/wallpapers/cat-ramen.webp` served HTTP 200 with `image/webp`. The category audit additionally opened Ramen through signed-in Search and verified seven shops and its wallpaper locally.

## Chrome phone check — 28 October

Drove the real Chrome browser at 393×852 and 375×667. Opened all eight new business pages and both updated pages; checked menu layouts, EPIC’s read-only price list (81 rows, zero ordering buttons), six-shop and two-shop panels, creator review playback, Brunch & Bloom’s gallery, The Sweet Spot’s updated tel link, and city-tile navigation. Inspected pages had no document-level horizontal overflow.

Found dark tagline text over Garlic High’s darkened background film. Film heroes now choose light ink from the dark scrim, independently of the logo tile’s color. Confirmed visually in Chrome at 375×667; the five-brand video-frame contrast audit passes, Garlic High worst frame 6.27:1 (all five above 4.5:1). Added Garlic High to that regression audit.
