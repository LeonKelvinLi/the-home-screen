# Batch 61 — 22 October 2026, evening

Glenn's 8:52 pm send, Sugar Plum Coffee Shop, and his 8:56 pm "New category BEASTY • Breakfast/diner. Or just • diner". Read off the Mac's Messages, which now receives his sends as they come. Sources are in `research/roster/batch61.json`.

## BEASTY • Breakfast/Diner

His first wording is the heading; the kind in seat ids is `diner`. It fills from type lines like every category page (`src/data/categories.ts`): diners, breakfast and brunch rooms, and not breakfast burritos, bagel shops, donut shops or coffee carts. It has its own glyph (a plate with steam) and wallpaper (`tools/make-category-walls.py diner`: eggs and a coffee cup), and is in More pages and Search, where Categories now lists 41.

Twenty of its twenty-four spots filled on the day, all businesses already on BEASTY: The Hangout, Benicia Grill, Shaka Shack, Babs Delta Diner, Kan Kiin, Mimosas of Willow Glen, Toast In Town, Alushe Coffee Bar, Four Chairs, Curio, Skillet'z Cafe, The Breeze Café, The Grind Café, Brunch & Bloom, Shattuck & Butter, Café Carrusel, The Breakfast Club at Midtown, Hick'ry Pit, Patty's Diner and Sugar Plum. Patty's Diner's type line was "American"; it is a diner by name and menu, so it now reads "American diner" and takes a spot. No other seat anywhere moved.

## Sugar Plum Coffee Shop, Concord

| Seats | Notes |
|---|---|
| Concord More goods 3; BEASTY More eats 46; BEASTY • Breakfast/Diner | 1815 Colfax St, downtown Concord, a breakfast and lunch diner since 1959. 107 items from the menu on their own site (their site sorts sections A to Z; Beverages moved last). Their SkyTab ordering page renders only in a browser and was not read, so prices are the website's. Hours from their site and Instagram, which agree. Phone from their Instagram; their site lists none. Their site is their own domain on their till company's template, which counts as a site (the Norman Rose precedent). Concord has no goods category for a diner and BEASTY • Eats no breakfast kind, so the yellow sheets. Film: @festusfeasts, 0–24 s of 136 s. |

## Verification

- `npm run build`, the data audit (0 errors; Breakfast/Diner 20 of 24).
- Seat diff: 22 additions, the twenty Breakfast/Diner spots and Sugar Plum's two; nothing moved.
- `tools/audit-batch61.mjs` (8 checks), `tools/audit-categories.mjs` (41 categories in Search) and `tools/audit-foodies.mjs` pass on a local build.
