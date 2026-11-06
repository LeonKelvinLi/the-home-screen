# Batch 101 — November 6 morning

Covers Glenn’s November 6 sends from 7:59 through 9:09 a.m. Pacific. The last catalog/media request arrived at 8:32 a.m.; the 8:52 a.m. product questions are recorded separately.

JK Cafe & Boba Donuts joins Pittsburg Sweets and opens the searchable Donuts and Boba categories. Its supplied profile confirms coffee, donuts, boba, Vietnamese sandwiches and croissant sandwiches. No complete price list was verified, so its page directs visitors to the shop. The map screenshot’s hours are not promoted as a shop-confirmed schedule.

World Wrapps gets all five requested location pages: San Ramon, Stanford, San Francisco, Corte Madera and Santa Clara. Stanford and Corte Madera open city sheets. Stanford’s location retains its actual Palo Alto mailing address. Each branch has its own phone and ordering link, the full published 55-entry menu, and a panel listing all five locations. Prices are absent from the public menu and display “Ask shop.” The headquarters address is not treated as a restaurant. One chain seat is on BEASTY More eats. The Corte Madera review by @jourdyn.lynn and the branch-unspecified review by @bayeatss are available from all five location panels without inventing a visit location.

Six local excerpts are added to Watch: JK Cafe’s review, Innena’s own promotional montage (“Watch this video clip”), two additional Innena’s reviews, and the two World Wrapps reviews. Innena’s earlier review remains, for four films total. Heavy-hitter, mediocre and newbie labels are retained in the source credits. New creator pages are added for @jourdyn.lynn and @bayeatss. The latter’s supplied screenshot has an unavailable temporary attachment path; her official current Instagram portrait was retrieved in signed-in Chrome instead.

Sources: [batch research](../research/roster/batch101.json), [source ledger](../research/roster/b86-b101-coverage.json), [World Wrapps menu](https://worldwrapps.com/), [World Wrapps locations](https://worldwrapps.com/locations/), [JK Cafe profile](https://www.instagram.com/jkcafebobadonuts/).

Glenn’s 8:52 a.m. screenshot asks about affiliate event submissions and profile/page editing. Those are open product requirements, documented with the current implementation in [follow-up notes](GLENN-FOLLOWUPS-2026-11-06.md). His membership, affiliate-pricing and BARK recruitment ads are explicitly deferred until website readiness. Private billing discussion carries no catalog change. At 9:09 a.m., Glenn liked Leon’s reply promising the newsfeed/ads and affiliate profile as future work; that reaction carries no additional catalog change.

## Verification

The data audit passes with zero errors. Every pre-existing seat remains in place. The production build and local Chrome and iPhone WebKit audits passed, including all new menus, artwork, city links, categories and muted clips. All 19 new encodes have H.264 video and AAC audio at 540×960, at most 15 seconds. Production verification will be recorded after deployment.

## Live release

Render deployed `d144d2abf50bcbfd75178c669c174e485bf19041` in `dep-dbn0j6tckfvc7396nq80`, reaching live at 9:17:19 a.m. Pacific on November 6. The persistent-disk restart returned HTTP 502 during rollout; health and new artwork were verified after recovery. Production uses entry `/assets/index-DVUNT0qt.js`; its asset hash differs from the local build, so deployment identity was verified using Render’s commit plus the live source catalog and exact artwork hashes.

Both batch audits pass on production Chrome and iPhone WebKit, including menus, artwork, city navigation, categories and muted playback. All 630 Watch files return HTTP 206 with valid MP4 headers. All 16 iPhone entry regressions pass, including a stalled app module and repeated return/enter cycles. No application errors appeared in the checked Render logs after readiness.

Visible connected Chrome checks at 393×852 and 320×740 passed Maillards’ 37-row menu and muted advancing review, Boba search and JK Cafe navigation, Stanford’s 55-row menu with “Ask shop” prices, five-location details, and the green Call/Enter flow into home. No horizontal overflow or console errors were observed. The temporary viewport was reset and the test tab closed.

The deployed catalog contains 675 of 725 distinct Instagram IDs from the available Messages archive. All 19 new sources are present; the same 49 older exceptions and one disregarded send remain documented. New artwork and all 19 posters match their committed SHA-256 hashes.

The full `tools/live-verify.mjs` production audit passed, including its historical roster walk. A final Messages refetch reached Glenn’s 9:09 a.m. reaction; no later listing or video request was present. The 18 domain-gap findings are the earlier unrelated, held or deliberately removed domains; all newly requested business sites are represented.
