# Batch 115 — November 12 Glenn intake

The [intake ledger](../research/roster/batch115.json) records 155 messages through **6:43 p.m. Pacific on November 12**, 69 supplied images and 47 distinct Instagram posts. The last thirteen messages include Palette Tea House, plus branch-specific clips for M Dumpling, Mikiya San Mateo and North Beach Pizza Berkeley. Unrelated chat is omitted from the public notes.

- Added 23 pages, including both Bonbon Matcha cafes and all eight supplied Salt & Straw shops. The Salt & Straw video belongs to Bishop Ranch; the other stores have separate hours, addresses and city tiles.
- Added Italian with Bella Trattoria and Adopt/Foster with Joybound. Sabrina Soto appears under Massage/Therapy and Models without a storefront address. Ben’s Burger appears on the requested Pittsburg sheet, with its physical Bay Point address and website pilot flag.
- Added the new Frymazing feature and moved its previous film into reviews with the original credit intact. Overflow reviews play from the creator's page and Watch. The Wooga film is filed under Cupertino, not Um.Ma. The late Mikiya review belongs to Hillsdale Mall in San Mateo, not Santa Clara.
- Added 43 new excerpts and moved one existing excerpt. Nono’s already-published replacement stays in Watch once; the withdrawn alternate was omitted. [The Wrap & Slurp reel](https://www.instagram.com/reel/Da_C3sQqfFO/) remains linked from the business and creator pages. It plays on Instagram, but the downloadable source did not resolve. The new ramen counter page uses its official mark; Glenn supplied no replacement portrait for the creator, so the existing portrait was retained.
- Reviewed all artwork and replaced 40 icon assets, including the new pages and creator profiles. The unlabeled yellow artwork is the same Mr. Dewie’s mascot already used on the Albany listing. Screenshots were used as sources and are not published.

Use the official menu links for current selections and prices. Butter & Crumble reports that cake orders are paused. The Bay Area Hot Tub Boat lists $400 starting and $412 including booking fees. Miracle Mile Cafe, Beep’s Burgers and Bay Pocha include item prices from their published menus.

## Live verification

Render served `3d4bdda` at [beastypages.com](https://beastypages.com) after deploying `dep-dbr8hmsnov2c73adp070`. Both site health checks passed.

- The batch audit passed in Chrome and iPhone WebKit emulation: 23 listings, 44 affected films played muted in each browser, city and category seats, and 40 icons. The iPhone entry audit passed all 16 checks.
- Full `tools/live-verify.mjs` passed. The thread archive check found 913 of 965 Instagram sources on the site; the other 52 are 49 previously documented exceptions and three explicit withdrawals or replacements. All 867 Watch files returned valid MP4 byte ranges.
- Checked 128 exact live asset hashes. Hosted BSTY Goods managed resale and shared sign-in rendered in both browsers; both private resale endpoints returned 401 when signed out.
- Kept all 2,141 existing seats and added 73. All new business domains are represented; 19 older domain flags remain, including redirects and known exceptions.
- See the [verification record](../research/roster/b115-live-verification.json) for the revision, audit results and file hashes.
