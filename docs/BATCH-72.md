# Batch 72 — 27 October 2026

Glenn's sends of 7:44–10:53 am on 27 October, read off the Mac's Messages: four all-you-can-eat places, a cheesecake bakery, and films for Gao Viet Kitchen and Nawah Market, which are already on BEASTY. Sources are in `research/roster/batch72.json`. All four AYCE places fill BEASTY • AYCE from their type lines (spots 14–17).

| Business | Seats | Notes |
|---|---|---|
| Daly Buffet, Daly City | Daly City Sushi 4; BEASTY • AYCE 14 | "Daly City • Eats / BEASTY • AYCE". 1901 Junipero Serra Blvd A. A seafood, BBQ and sushi buffet; Daly City's Sushi spot was open. **Prices** (buffet and to go, 17) are from a diner's Yelp photo of their printed board (9 Aug 2026), which Google's menu matches: their site and Instagram publish none, so the page says the prices need confirming and nothing is ordered from it. **No hours:** their site has a weekday break 2:30–4pm; Google and Yelp say 11am–9:30pm daily. **Film:** their own reel (Glenn: "No reviews on this place that I can find"), 0–24 s, opening on the storefront. Icon: their site's logo. |
| Sake2Me AYCE Sushi, Fremont | Fremont Sushi 4; BEASTY • AYCE 15 | "Fremont • Eats / BEASTY • AYCE / Needs website pilot": needs-a-website. 43337 Christy St #3032, Pacific Commons. Hours from their Instagram, which Google and Yelp match. Regular and Premium all-you-can-eat (lunch $27.99/$34.95; dinner, weekends and holidays $34.95/$39.95) from their Instagram and their own Yelp updates; kids' prices from diners' menu photos, said so on the page. House rules in the note. No film sent. |
| Fusion Buffet, Concord | Concord Sushi 4; BEASTY • AYCE 16 | "Concord • Eats / BEASTY • AYCE / Needs Website": needs-a-website (Instagram links to a Google search). 486 Sun Valley Mall. Sushi, Mongolian BBQ and seafood. Prices from their own Instagram price board of 11 May 2026 (buffet and takeout, 11); email from their Facebook page; daily 11am–9pm everywhere. Icon: their Facebook logo file. No film sent. |
| Kakuna Sushi, Fremont (five shops) | Fremont More goods 8; BEASTY • AYCE 17 | "BEASTY • AYCE / Fremont • Eats / Multiple locations". One page for Fremont, 43472 Grimmer Blvd, with every shop (Milpitas, Meridian and McKee in San Jose, San Leandro) and an order link for each in "Their shops". Fremont's Sushi spot went to Sake2Me, which Glenn sent first. **Menu:** all 231 items from their own Fremont ordering page, their wording kept. Their all-you-can-eat is in their own posts but priced only on a diner's photo of the in-store sheet, so the page says it exists at four shops and to call. No hours (ordering site 8:30pm, Google 9pm). |
| Jay The Cheesecake Queen | BEASTY • More eats 79 | "BEASTY • Sweets", with their Google Maps list of stores. A Sacramento wholesale bakery: no-bake cheesecakes sold in 23 listed stores (four in the Bay Area: Nawah Market and Motion Market in Oakland, 408 Eazy Mart in San Jose, Meadows store in Vallejo) and a café counter in Metro Cafe 2890, Sacramento. **Sweets' Cheesecake spot is Basq Haus's**, so More eats, as Crazy Block Cheesecakes and The Cheesecake Lab. Since July they take store orders only and publish no prices for the store packs, so the page is contact-only with "Where to find them" and a link to their store map. No hours (site and Google differ). **Film:** their own reel, the platters restocked at Nawah Market. |

**Films on pages already listed.**
- Gao Viet Kitchen: "Clip this video plz for Gao" (@allie.eats's Outer Sunset crawl), "2nd" (@mr.gaoviet's beef rib pho reel), then "Clip this video plz as 1st video". Gao had no film, so Mr. Gao's own reel is the page film (7–31 s) and the Gao half of the crawl (41–56 s) the second; the crawl's bakery half was already Pineapple King's film.
- Nawah Market & Deli, Oakland: @mayakay.official's chopped cheese reel ("Clip this video plz / Foodie", 10:50 am), its first film (1–25 s).

**For Leon, not for the site.** At 8:12–8:19 am Glenn sent a draft cold email for building websites for businesses, written in Leon's voice, and asked for his opinion before he finishes it. Nothing was changed for it.

Nawah's own page gives 5489 Foothill Blvd; Jay's store list and reel say 5475. Left as their page has it.

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff against the last release: 9 additions, nothing moved.
- `tools/audit-batch72.mjs`, `tools/audit-categories.mjs` and `tools/audit-foodies.mjs` pass on a local build.

## Live

Production release `c0f253e`, pushed at about 11:17 am on 27 October 2026, live by 11:26 am (the Kakuna Sushi icon served as an image). `BASE=https://beastypages.com node tools/audit-batch72.mjs` passed all 51 checks against the live site: every page, menu, city seat, icon, BEASTY • AYCE and More eats spot, and the Daly Buffet, Jay, Gao (both) and Nawah films decoding.
