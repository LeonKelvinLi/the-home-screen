# Batch 94 — November 3–4 directory sync

This batch covers Glenn’s sends after Batch 93 through November 4 at 7:50 a.m. Pacific. The [batch roster](../research/roster/batch94.json) records all 17 Instagram posts and their sources. The [cumulative ledger](../research/roster/b86-b94-coverage.json) contains 136 distinct posts since November 1 at 9:42 a.m.

- MESO Customs joins Whips. Jessica Domingo and Netta Brielle join Individuals.
- Brasa Bros keeps its San Francisco seat and full menu, and joins More Eats. Its Toast link and updated wordmark are on the listing. The restaurant’s public location page lists 11 a.m. to 9 p.m. daily. The supplied Toast screenshot shows a later ordering window, so the location page supplies the storefront hours.
- Brasa Bros plays its own video and three reviews. The Grand-O and Cindy reviews play on their creator pages and in Watch. Brasa Bros links to both originals.
- The other posts play on Sweet Pipers, Dolores Deluxe, Kung Fu Mala, Nawah Market & Deli and the new listings. Watch grows from 534 to 551 films. Fourteen icons use Glenn’s screenshots, including the requested closer crop for Agnes.
- The Foodies tile swaps with Tattoo and gets the same yellow glow as Gạo Việt. Bay Area Kulture takes the corresponding Foodies seat and gets the glow. Tuck moves to More Foodies. The Foodies sheets hide the red prospect outlines.
- Empire State Pizza keeps the agreed 15% welcome and 10% loyalty offers on $50 or more. Both show @bayarea.kulture as the proposed sponsor for Glenn’s outreach. Offer text is 20 pt. Street addresses with structured locality details use two lines, with suites on the street line.

## Membership pricing

New monthly signups use $39 for BIGGIE PASS and $59 for BEASTY PASS. Stripe checkout keeps the promotion-code field and the return to BEASTY. The old price IDs are retained in Render under `STRIPE_PRICE_PASS_LEGACY` and `STRIPE_PRICE_DIAMOND_LEGACY` so Stripe events for existing subscriptions still resolve to the right tier.

The proposed creator discounts and free introductory month await a confirmed campaign, code and term. The examples in the thread do not define an active promotion.

## Verification

The placement comparison against Batch 93 found 12 additional seats and the requested Foodies reassignment. Render first served `6fc7a09` at 8:15:40 a.m. Pacific. The combined release `b6a6cdb`, including Brasa Bros’ visible Toast link and Batch 95, went live at 8:24:31 a.m. Pacific. It returned HTTP 200 and served the new Uncle Cha icon with the expected SHA-256 at 8:24:46 a.m.

Live Chrome and iPhone WebKit played all 17 clips muted, matched all 14 icon files, opened the Toast link panel, checked the Foodies tiles, and verified both 20 pt offer text and the address at a 320 px viewport. The membership cards and both public Stripe checkout pages showed exactly $39 and $59 per month. Both checkouts offered promotion codes. Stripe saved the new plan-switch prices in the customer portal. Local membership tests verified tier mapping for both legacy price IDs. Production exposes email as its sign-in channel.
