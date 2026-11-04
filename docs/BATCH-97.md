# Batch 97 — Glenn’s November 4 afternoon sends

The batch covers every site request from 12:14 through 3:05 p.m. Pacific. It adds six location pages from five listing requests and publishes 29 credited excerpts, including the San Francisco Standard’s Dolores Deluxe profile. Ten creators join More foodies. All earlier seats were compared against Batch 96 and retained.

- **Fikscue Craft Barbecue** joins Alameda More Goods and the new More BBQ section because the original BBQ sheet is full. The restaurant’s own profile confirms the Alameda address and describes its meat as halal. The page links to its profile for current service hours and availability. [Fikscue](https://www.fikscue.com/)
- **Lemon Crab** joins Hayward More Goods and opens Seafood/Crab Boil. Its page links to the official Hayward menu and identifies the Richmond location separately. The Richmond reel is labeled with the city where it was filmed. [Lemon Crab](https://lemoncrab.us/)
- **Smack Burgers** has separate addresses and pages for the San Leandro shop and the Saturday San Jose truck. San Leandro opens Burgers/Hot Dogs. The excerpts in this batch were filmed at San Leandro. [Smack Burgers](https://www.smackburgers.com/)
- **Arirang Tofu & BBQ** joins Pleasanton Eats, opens Korean BBQ and is marked for the website pilot. The original BBQ and Korean sheets keep their seats. [Arirang](https://www.instagram.com/arirang.pleasanton/)
- **Broderick Roadhouse** joins Walnut Creek Eats and Burgers/Hot Dogs. Its official white wordmark is on solid black. [Broderick](https://www.broderickwalnutcreek.com/)

The other reels link to Legend Hotpot & Grill, Q Specialty Coffee’s new Howard Street café, Pho Daily, Chez Maeju and Dolores Deluxe. Once a business has four inline films, the other excerpts play in Watch and on the creator’s page. The business still links to those original reels.

[Batch intake](../research/roster/batch97.json) · [Source ledger](../research/roster/b86-b97-coverage.json)

## Live verification

Render deployed `3f6a42b34e79ec76c8ef4ff64e48ea62046bf3bb` at 3:24:43 p.m. Pacific on November 4. During the restart the public endpoint briefly returned HTTP 502. At 3:25:14 p.m. it returned HTTP 200 and the new Broderick icon matched its committed SHA-256.

Chrome and iPhone WebKit passed the six listing and four category route checks and played representative excerpts silently. Chrome also opened each city tile and returned to the matching address. All 16 iPhone entry checks passed. All 582 Watch URLs returned HTTP 206 with valid MP4 headers. The 29 new posters and 13 creator icons matched their committed files. The production build passed and the data audit reported zero errors.

The live catalog matches 627 of 676 distinct Instagram post IDs from the available thread archive. All 29 new sources are present. The November 3 archive report had flagged `DcwX_gsjwbd`, but the exact Precision Auto Service post was verified live under “The shops” on MeterSF. The other 49 older Instagram exceptions still match the [historical report](GLENN-COVERAGE-2026-11-03.md).

The general live site verification passed with the historical roster walk covered by the November 3 audit. A final Messages read found no further sends after the 3:05 p.m. cutoff.
