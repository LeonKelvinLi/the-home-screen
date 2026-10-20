# Batch 57 — 19 October 2026, evening

Glenn's 7:04 pm send: Pizza Casamia, "San Jose • Eats / BEASTY • Eats", with four screenshots and no reel. Sources are in `research/roster/batch57.json`.

| Business | Seats | Notes |
|---|---|---|
| Pizza Casamia, San Jose | San Jose More goods; BEASTY More eats | 1423 Branham Ln, (408) 265-2222, info@pizzacasamia.com, from their Instagram. Their sister shop is Via Mia Pizza in Morgan Hill. San Jose's Italian spot is Wow Mia Pizza's and BEASTY • Eats' Pizza spot is King's. |

Their site is an Adora POS ordering app. It shows the menu only after a delivery address or store is chosen, so no prices were read, and the page sends people to order there. An ordering template counts as a stopgap site (the Masa precedent), so they get the needs-a-website red ring. No hours are published.

`tsc -b`, the build and the data audit pass. A before-and-after seat diff shows only the two new seats. `tools/audit-batch57.mjs` passed on a local build.
