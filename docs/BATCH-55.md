# Batch 55 — 19 October 2026

Glenn's 19 October sends: two service businesses and a new location page, **Bay Area** ("New Location that covers basically the Bay Area"), for businesses that serve the whole region rather than one town. Research and sources are in `research/roster/batch55.json`.

| Business | Seats | Notes |
|---|---|---|
| DP's Hauling, Oakland | Oakland More services; BEASTY More services | Junk removal and hauling, same day across the Bay Area. Their published address is an apartment unit, so it is left off. Film from their own reel. |
| Matt's Motivated Movers | Bay Area More services; BEASTY More services | Local and long-distance moving. Publishes a service area, not an address. No prices or hours published. |

Hauling and moving have no numbered seat on a city page (the PJ's Junk Removal precedent), and BEASTY • Services' 24 seats are all held, so both take the yellow sheets.

**Bay Area** is in `cities.ts` like any city and appears in Search under Cities. Its wallpaper is the whole Bay from Landsat 8 (Pierre Markuse, CC BY 2.0), credited in `public/wallpapers/CREDITS.md`.

## Verification

`tsc -b`, `npm run build`, the data audit (0 errors), icons checked by eye. `tools/audit-batch55.mjs` against a local build passed 10 checks: both pages, images and the DP's film, both city seats, and Matt's place button reading Bay Area.
