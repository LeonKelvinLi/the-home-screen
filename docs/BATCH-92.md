# Batch 92 — Glenn’s directory sync

Messages cutoff: November 3, 2026 at 11:34 a.m. Pacific. The roster records all 43 new Instagram posts, including creator, source, disposition and the business when applicable. The cumulative ledger includes all 114 unique posts from November 1 at 9:42 a.m. through the cutoff.

New listings: Cà Phê Việt, Mr. Dewie’s, Piglet & Co., Tsujita San Jose, Ube Bae, Moonlight Café and Always Yours Bakery Cafe. Donut Farm, North Italia, Bober Tea, East Bay Buffet, Lumpia Co, Macs by Icky, POD DTG and Gạo Việt keep their existing pages. Piglet & Co. joins More Eats after the full flagship sheet. The new Mobile Cart category starts with Moonlight Café. Mr. Dewie’s is on Ice Cream and the three requested city sheets. The Walnut Creek shop is listed in its location panel. Cà Phê Việt has a More Cafes seat and lists the current New Montgomery menu, with the future Sutter location and conflicting Sunday closing times explained separately.

40 credited films were prepared. Three are linked to their originals because of the four-film limit: Rachel’s Mr. Dewie’s review, Andrew’s Lumpia Co review, and Andrew’s North Italia review. Andrew’s and Mike’s Gạo Việt films show the Sunset location. Amandy’s Cà Phê Việt carousel preserves slide 4 and the source’s silence. The Macs by Icky review goes on its own page, and the festival clip opens the host’s page. The POD DTG page links the printing accounts identified in Ricardo Vicente’s posts.

The artwork credits distinguish business and creator originals from crops of Glenn’s screenshots. Hee Jin’s requested portrait remains held under her explicit permission notice recorded in Batch 90. The official links are the source for menus that change or whose prices could not be verified in this batch.

## Live verification

The first Batch 92 deployment, `dep-dbl3n1nb9u1s73ehejs0` for `789f499`, went live at 12:07:47 p.m. Pacific on November 3. Its health endpoint returned HTTP 200 and the public Cà Phê Việt icon matched the release SHA-256. The public client data included all 43 supplied posts.

The first site-wide audit flagged the extra More Eats page and E-40’s duplicate creator entry. The follow-up `e8425d9` connects his credited Lumpia Company review to his existing page and checks the home swipe for city pages directly. Render deployment `dep-dbl3v6navr4c73btv7l0` went live at 12:23:46 p.m. Pacific. The public bundle showed the corrected E-40 seat and the health endpoint returned HTTP 200 at 12:23:51 p.m.

The production build and data audit passed. Live Chromium and iPhone WebKit audits at 393 × 852 passed on the corrected release, checking 16 pages, the 43-post ledger and all 40 new MP4 range responses. Both Gạo Việt clips and the Cà Phê Việt carousel played in the browser audits. All 1,705 prior seats and 489 prior Watch films are retained, for 1,739 seats and 529 Watch films. The live iPhone WebKit entry audit passed all 16 checks. Mobile Cart, Ice Cream and Ramen opened the requested businesses in the live category checks.

In actual Chrome at 393 × 852, both Gạo Việt reviews played, Rachel’s 512 × 512 icon enlarged and restored, and the green Call button opened the home grid and removed the dialer. The corrected release also showed the Lumpia Company film on E-40’s existing page without a profile button. Chrome recorded no console errors. The temporary viewport override was reset.

The final site-wide audit, `node tools/live-verify.mjs --skip-roster`, passed against beastypages.com. The first post-rollout browser attempts hit loading or tap timing failures, and the passing reruns retained the playback assertions.
