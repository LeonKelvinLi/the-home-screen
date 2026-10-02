# BEASTY iMessage comparison — October 2, 2026

Created 42 missing pages for 32 businesses and creators in the local checkout. The catalog increases from 549 to 591 unique page IDs. No existing business record, city placement, or visible category seat changed.

Base: production branch `origin/main`, commit `1b9102c`. The public catalog was read in macOS Chrome. Glenn’s incoming Messages conversation was read from the existing read-only project tools; 126 recent screenshot attachments were checked by OCR. Only business-specific evidence is retained here. Message timestamps in the receipt use America/Los_Angeles.

## New pages

| Page | Location or category request | Source message |
|---|---|---|
| This Ain't Canon | BEASTY • AI | 247017 |
| Rob Ben’s Restaurant & Lounge | Emeryville | 247023 |
| CaliKid Burgers ’N Shakes | Livermore | 247050 |
| CaliKid Burgers ’N Shakes | Pleasant Hill | 247050 |
| Droneshow.com | BEASTY • Online | 247058 |
| Bottomline | BEASTY • Online | 247061 |
| Steve’s Mobile Security Doors | BEASTY • Online | 247066 |
| Yuanbao Jiaozi | San Francisco | 247069 |
| Yuanbao Jiaozi | Burlingame | 247069 |
| Pineapple King Bakery | San Francisco | 247076 |
| Understory | Oakland | 247083 |
| Rye Cookin LLC | BEASTY • Cooks | 247092 |
| Tony’s Pizza Napoletana | San Francisco | 247099 |
| The Cats Restaurant & Bar | Los Gatos | 247105 |
| Pakaoma Thai-Lao Diner | El Cerrito | 247136 |
| Cali Alley | Berkeley | 247142 |
| Nomads Premium Meats | BEASTY • Meats | 247146 |
| Praaw Thai | Berkeley | 247156 |
| Four Forty Four Events by Nancy | Oakland | 247161 |
| Rose Pizzeria | Berkeley | 247167 |
| Rose Pizzeria | San Francisco | 247167 |
| Absolute Volleyball Club | San Rafael | 247149 |
| ProperCuts Barbershop | San Jose | 247181 |
| Golden Donkatsu Dublin | Dublin | 247191 |
| Town Bizness Hibachi | Oakland | 247196 |
| Phở Hà Nội | San Jose | 247203 |
| Phở Hà Nội | Cupertino | 247203 |
| Phở Hà Nội | Palo Alto | 247203 |
| Phở Hà Nội | Milpitas | 247203 |
| Phở Hà Nội | Fremont | 247203 |
| Phở Hà Nội | Fountain Valley | 247203 |
| Phở Hà Nội | Berkeley | 247203 |
| Phở Hà Nội | San Francisco | 247203 |
| @thesessionca | BEASTY • AI | 247045 |
| Kyvora AI | BEASTY • AI | 247047 |
| @stgdesignz | BEASTY • AI | 247187 |
| @capturedbysado | Foodie | 247055 |
| @allie.eats | Foodie | 247074 |
| @wthellydanyelly | Foodie | 247088 |
| @thesnobbiefoodie | Foodie | 247097 |
| @seekeasyeats | Foodie | 247172 |
| @festusfeasts | Foodie | 247189 |

## Comparison decisions

- Penelope’s Coffee already has five location pages; its mobile-domain link is an alias.
- The Lion’s Mane Barbershop already exists; the Booksy short link is an alias.
- The Moon Nails already exists; the Hayven link points at that same business.
- `leonbuilds.org` is Leon’s own site, not a new Glenn-supplied business.
- Understory: create one page at 3340 International Blvd, confirmed on its current website. The submitted 528 8th St map listing is retained as an unverified address in this note, not as a second active location.
- Rob Ben’s: Glenn labeled it Oakland, but his business-profile screenshot gives 3627 San Pablo Ave in Emeryville. The new page uses Emeryville.
- Phở Hà Nội: the official website lists eight locations. Berkeley and San Francisco are explicitly coming soon (early 2027 and October 2027). Fountain Valley gets a new city page with the existing neutral wallpaper fallback.
- @capturedbysado and @allie.eats were mentioned in existing research notes but had no catalog pages. Each receives one page, without duplicating a brand ID.
- Droneshow.com, Bottomline and Steve’s Mobile Security Doors are searchable pages. Their requested Online slots overlap occupied categories, so no existing Online affiliate is displaced.
- Rye Cookin and Nomads receive the Cooks and Meats category placements Glenn explicitly requested.
- Three existing automatic category seats are pinned at their existing numbers so adding new roster records does not move Looki, LOL Catering, or The Company Barber.

## Retained requests outside these new pages

The Foodie reel `https://www.instagram.com/reel/DXYA3bzjOTc/` did not expose a creator identity in Chrome. No profile was fabricated for it. Existing-page video replacements, Flowers Valley’s icon, Paulo Sausage’s relocation, new category layouts (Sweets/Food Trucks), and membership/dashboard changes are not part of this additions-only change. Source posts on new creator pages link to Instagram; no requested video clips have been downloaded or rendered. Bottomline’s requested 10% discount is recorded in the message source but not presented as a confirmed partner offer.

## Validation

- All 591 IDs are unique.
- Every one of the 549 original catalog records retains its identity, name, website, address and Instagram handle.
- Every original city seat and visible category seat is preserved.
- Existing data audit: 0 errors, 60 pre-existing warnings; after change: 0 errors, the same 60 warnings.
- TypeScript application check and Vite production build pass. Vite retains its existing bundle-size warning.
- Chrome rendered Town Bizness, CaliKid Pleasant Hill, This Ain’t Canon, Bottomline, @festusfeasts and the coming-soon Berkeley Phở Hà Nội page.
- The gap checker now reads the new additions data file. The remaining four website flags are the aliases and own-site link listed above.

## Files

- `src/data/imessageAdditions.ts`: the 42 new pages, with blank menus and source-backed contact details.
- `research/roster/imessage-refetch-2026-10-02.json`: source message IDs, dates, requested categories and added placements.
- `research/qa/imessage-2026-10-02/`: Chrome screenshots.

Prepared and checked locally. Deployment to beastypages.com requested; live verification follows the push to production main.
