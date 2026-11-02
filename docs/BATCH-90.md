# Batch 90 — late NaYa reviews

Scope: Glenn’s three NaYa reel requests after November 2 **12:35 pm PST**, through **12:47 pm PST** (last Glenn send 12:41, last Leon reaction 12:47). Baseline `98b2f1f` is Batch 89 verified live. The closing refetch contains 423 messages since November 1 and no newer requests.

## Complete recent coverage

`research/roster/b86-b90-coverage.json` reconciles **all 67 unique Instagram posts** supplied after November 1 09:42 through this cutoff: **54 local films and 13 retained original-source links, zero missing IDs**. The ledger was independently compared with the refetched thread’s post IDs. The duplicate Booboo send remains one post. Ten requested copies remain held at the established four-local-film cap; two other sends requested a Foodie/original link without a separate clip instruction. This batch adds one explicit creator-permission hold below. Every original stays available from its relevant business/creator page.

All **1,696 earlier seats** remain unchanged. Three creator seats append at **BEASTY More Foodies 184–186**, for **1,699 total seats** and **187 overflow Foodie pages**. The earlier 184 Foodie positions remain in order. All **483 earlier Watch films** remain, plus two additions, for **485 unique films**.

## Every late send

| Sent | Creator / original | Result |
| --- | --- | --- |
| 12:37 | [@hungryhungryheejin — De8TxUbOfCI](https://www.instagram.com/reel/De8TxUbOfCI/) | New **Hee Jin** creator page and original San Mateo review linked on both creator and NaYa pages. Glenn: Clip / Heavy Hitter / Fasho. **Local film and supplied portrait held** under the creator’s explicit permission notice. |
| 12:39 | [@liltiffyvert — DeNPxiISX3z](https://www.instagram.com/reel/DeNPxiISX3z/) | New **Tiffany Tran** page, original profile artwork and local 0–15s review on both creator and NaYa pages. Glenn: Clip / Foodie / Mediocre. Caption identifies **Davis** and discloses an invited visit; the review explicitly distinguishes Davis from the listing’s SF menu prices. |
| 12:41 | [@jovana.camberos — DVxPfFGEfNz](https://www.instagram.com/reel/DVxPfFGEfNz/) | New **@jovana.camberos** page, original profile artwork and local 0–15s review on both pages. Glenn: Clip / Foodie / Newbie. The video’s on-screen title identifies **San Francisco**; the exact SF branch is not stated or invented. |

Hee Jin’s current public profile explicitly says **“DON’T REPOST W/O PERMISSION”**, and gives the preferred name **“HEE JIN L. (not Hee)”**. No permission record was verified. Her directory page therefore uses **Hee Jin**, a monogram, and links to her original profile and San Mateo review. Neither her portrait nor an unused local MP4 is published. The other two original 1080px artworks were visually matched to Glenn’s screenshots, resampled to 512px with aspect preserved, and credited without redrawing or adding a story ring.

The two local films retain original audio, H.264/AAC, 540×960 square pixels, fast-start, exact source/date credits and bounded 15-second excerpts. Both appear once in Watch. Research, branch evidence and holds are in `research/roster/batch90.json` and `research/roster/b90-films.json`; artwork and excerpt provenance are in the two public credits files. Glenn’s Foodie/Newbie/Mediocre/Heavy Hitter/Fasho tags stay in internal provenance.

**NaYa’s entire business model is unchanged:** the 166 separately labeled Octavia/Geary menu rows, five branch contacts, primary contact, hours and previous seats are retained. The new Davis film does not relabel SF prices as Davis prices. The earlier canceled portrait `IMG_8927.png` remains excluded under Glenn’s 12:08 “Disregard”; the preceding Thai Thani business film remains seated.

## Verification

TypeScript and production build passed. Data audit: **0 errors, 171 existing warnings**, unchanged from Batch 89. Local Chromium and iPhone WebKit each passed **154 checks**, covering all 67 posts, the new advancing films and branch credits, original-source and portrait holds, 512px artwork, 320px layouts, all earlier seats, every earlier Watch film and NaYa’s unchanged business data. The iPhone entry regression passed **16 checks**, including a stalled module, repeated entry and no document reload. Local phone screenshots were inspected.

The full historical gap check still reports **566 domains and 17 historical unmatched domains** outside this batch’s scope; those are not represented as a completed all-history reconciliation. All business domains in the current Batch 86–90 scope are represented.

Production deployment and live browser verification are pending. No production account, cart, order, reservation or outbound message was created. Protected affiliate paths and the separate affiliate worktree remain untouched.
