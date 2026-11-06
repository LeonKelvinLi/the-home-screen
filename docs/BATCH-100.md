# Batch 100 — November 5 evening

Covers Glenn’s requests after Batch 99’s 11:24 a.m. cutoff through 9:58 p.m. Pacific on November 5, 2026.

Six new listings: V Pho in Campbell, Chahalo in Berkeley, Maillards in San Francisco, Riceful in Berkeley, Champ Onigiri in San Jose and Halal Street Hot Pot in Newark. Campbell gets its requested city page. Master Oh’s existing page receives the supplied artwork and a Seafood/Crab Boil seat. Little Sheep keeps its existing Hot Pot and Yakitori seats, matching Glenn’s request without moving it. All pre-existing seats were compared against the Batch 99 catalog and preserved.

Pho and Onigiri are new searchable categories. Existing pho houses are included once per business family. Burgers and Teas get yellow overflow sheets so Maillards and Chahalo can join without displacing the original 24.

All 13 unique reels are clipped locally, credited, attached to their businesses and present in Watch. Maillards has four requested reviews; Little Sheep receives the two reviews requested as a heavy hitter and a newbie. Five new creator pages use Glenn’s supplied portraits, including Tara’s explicit icon update. Two @rainmoreturely clips required signed-in Chrome: their observed video and audio assets were downloaded and muxed. The Champ review’s sponsorship is disclosed in its credit.

V Pho carries its complete 83-entry published menu, Chahalo 33 non-alcoholic entries, Maillards 37 counter/market variants, Riceful all 71 published dishes, and Halal Street 23 takeaway items. Riceful publishes no prices, so its entries say “Ask shop.” Champ’s daytime onigiri menu is kept separate from Ramen Champ’s evening ramen service; no onigiri prices were verified. Maillards’ hours are omitted because the newer supplied profile announces Tuesday opening while its website still lists Wednesday–Sunday. Halal Street remains flagged for the website pilot, as Glenn requested, with its current ordering links intact.

Sources: [batch research](../research/roster/batch100.json), [source ledger](../research/roster/b86-b100-coverage.json), [V Pho](https://v-pho.com/menu/), [Chahalo ordering](https://pos.chowbus.com/online-ordering/store/Chahalo-Berkeley/23921), [Maillards](https://www.maillardssf.com/), [Riceful menu](https://bericeful.com/menu.html), [Halal Street](https://halalstreethotpotxinjiangcuisine.com/newark/).

## Separate project follow-ups

Glenn’s 11:49 a.m. BSTY GOODS notes specify a Mercari-style marketplace, A-1 through Z-3 inventory (78 items per seller), and two trade boxes for the offered and requested item codes. Leon replied with a separate MVP quote and offered a call. The brief is captured in this batch’s research; a marketplace build is a separate project from the directory sync. Glenn’s 12:02 p.m. suggestion to move the Reborn auction to BEASTY Supply Co is recorded as a proposal awaiting a decision, rather than a confirmed migration.

## Verification

The data audit passes with zero errors. A complete comparison against the prior catalog confirms no surviving old seat moved or disappeared. The production build and local Chrome and iPhone WebKit audits passed, including all new menus, artwork, city links, categories and muted clips. All 19 new encodes have H.264 video and AAC audio at 540×960, at most 15 seconds. Production verification will be recorded after deployment.

## Live release

Render deployed `d144d2abf50bcbfd75178c669c174e485bf19041` in `dep-dbn0j6tckfvc7396nq80`, reaching live at 9:17:19 a.m. Pacific on November 6. The persistent-disk restart returned HTTP 502 during rollout; health and new artwork were verified after recovery. Production uses entry `/assets/index-DVUNT0qt.js`; its asset hash differs from the local build, so deployment identity was verified using Render’s commit plus the live source catalog and exact artwork hashes.

Both batch audits pass on production Chrome and iPhone WebKit, including menus, artwork, city navigation, categories and muted playback. All 630 Watch files return HTTP 206 with valid MP4 headers. All 16 iPhone entry regressions pass, including a stalled app module and repeated return/enter cycles. No application errors appeared in the checked Render logs after readiness.

Visible connected Chrome checks at 393×852 and 320×740 passed Maillards’ 37-row menu and muted advancing review, Boba search and JK Cafe navigation, Stanford’s 55-row menu with “Ask shop” prices, five-location details, and the green Call/Enter flow into home. No horizontal overflow or console errors were observed. The temporary viewport was reset and the test tab closed.

The deployed catalog contains 675 of 725 distinct Instagram IDs from the available Messages archive. All 19 new sources are present; the same 49 older exceptions and one disregarded send remain documented. New artwork and all 19 posters match their committed SHA-256 hashes.

The full `tools/live-verify.mjs` production audit passed, including its historical roster walk. A final Messages refetch reached Glenn’s 9:09 a.m. reaction; no later listing or video request was present. The 18 domain-gap findings are the earlier unrelated, held or deliberately removed domains; all newly requested business sites are represented.
