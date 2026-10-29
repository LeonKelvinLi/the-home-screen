# Batch 76 — 29 October 2026, 11:37 am–12:27 pm

Refetched after Batch 75’s 11:16 am cutoff. One new business, two existing pages updated, seven new playable films and one retained film moved to the review list. Research: `research/roster/b76/`; film manifest: `research/roster/b76-films.json`; held source: `research/roster/b76-held.json`.

## Pages and placement

| Business | Result |
|---|---|
| **Hotpot Bay**, San Francisco | New page, San Francisco More goods **62** and BEASTY • Hot Pot **5**. Glenn: “San Francisco • Eats / BEASTY • Hot Pot.” Asian and Korean city spots are already held, so it appends to More goods. **74 available non-alcoholic menu rows** from its own linked MealKeyway menu; all nine combo dialogs checked for included portions. Phone, address and dining hours from its own website; email from the public Instagram Contact screenshot Glenn sent. Own film is main, three reviewer films below. Own enlarged HPB mark cropped into its icon. |
| **The Sea by Alexander’s Steakhouse**, Palo Alto | Existing city More goods **0** preserved; BEASTY • Steakhouse **9** added by hand, keeping every earlier category seat fixed. Glenn: “Palo Alto • Eats / BEASTY • Steakhouse” and own Watch film. Upgrade its Tier 1 view to the full page so its film and menu show. **54 dinner-menu rows rechecked** against its current own linked iMenuPro menu. No payment or affiliate agreement inferred. Existing whole website wordmark retained; the Instagram disc clips its sides. |
| **Chubby Cattle BBQ**, Pleasanton | All three existing seats remain: Pleasanton Asian **2**, AYCE **11**, BBQ **19**. @trinhdoesthings is the new main film (“Watch / Heavy hitter”); add @aloha_stephanie (“Newbie”). Retain @createwithcv’s former main as an additional review and keep @bayarea.foodie.adventures: **four distinct films, none removed**. Existing 32-row menu, icon and business facts unchanged. |

Indices above are zero-based, as in placements.ts. Comparison against `4f6a614`: **three seats added, no existing moves or removals**. Hot Pot now has six businesses; Steakhouse has ten.

## Menu details

- **Hotpot Bay:** lunch Build-A-Bay and Meat-A-Bay are $62 for two; regular versions are $78. Build-A-Bay includes two soup bases, **two meats, two sides**, two noodles/rice, vegetables and sauce access for two. Meat-A-Bay instead includes **three meats**, with no two-side selection. Personal A and B sets have different choices, preserved in the descriptions. Current menu/dialogs take precedence over older reviewer captions. Excluded five sold-out foods and two soju items; retained current separately priced portions and soups. Website dining closes 10pm; ordering pickup ends 9pm, stated as separate schedules. Private room/karaoke panel is from their own site.
- **The Sea:** same current dinner prices as the earlier research, now visible on the full page. Two Japanese A5 items explicitly show **4 oz increments at $45/oz: $180 for the minimum 4 oz portion**, instead of implying a single ounce is an order. The $195 tasting is one set; its description now names the included courses and optional caviar/Miyazaki food supplements. No wine pairing added. The website’s $85 Sunday prix fixe still conflicts with its linked $95 Sunday menu, so no Sunday price is inferred. Its Thanksgiving advertisement and holiday-closure footer also disagree; no holiday opening schedule is added.

## Every new reel/post

| Sent | Source | Treatment |
|---|---|---|
| 11:37 am | [DfFnfKgvdwi](https://www.instagram.com/reel/DfFnfKgvdwi/), @trinhdoesthings | Chubby Cattle main, 0–24s; Watch / Heavy hitter. |
| 11:38 am | [DbY-GatSDXj](https://www.instagram.com/reel/DbY-GatSDXj/), @aloha_stephanie | Chubby Cattle Newbie review, 0–15s. |
| 11:42 am | [Dexogd1g-UR](https://www.instagram.com/p/Dexogd1g-UR/), @theseabyash | The Sea’s own Watch film; full **5.32s** of kitchen, plating and caviar footage. Credited “Posted by @theseabyash”, no invented filmmaker. |
| 11:46 am | [DbjaM1oycXc](https://www.instagram.com/reel/DbjaM1oycXc/), @zoegabon | **Held off The Sea and Watch.** This is **Alexander’s Steakhouse in Cupertino**, 19379 Stevens Creek Blvd, confirmed against the group’s own Cupertino website and the entrance in the film. It is a separate restaurant from The Sea in Palo Alto. There is no existing Cupertino page or explicit add/placement request; retained as a source-only OTHER_REVIEWS entry, not silently placed on the adjacent business. |
| 12:25 pm | [DdQBcwLT8Iy](https://www.instagram.com/reel/DdQBcwLT8Iy/), @martiwantsmore | Hotpot Bay review, 0–15s; Glenn’s “Mediocre” tag retained in provenance only. |
| 12:26 pm | [DbmW4BoD9bf](https://www.instagram.com/reel/DbmW4BoD9bf/), @hotpotbay | Hotpot Bay’s own Watch film, 0–24s. |
| 12:27 pm | [DZbrqbWT98E](https://www.instagram.com/reel/DZbrqbWT98E/), @dchangshangry | Hotpot Bay Newbie, 0–15s. |
| 12:27 pm | [DXr9m1JEt1A](https://www.instagram.com/reel/DXr9m1JEt1A/), @foodandsachi | Hotpot Bay Heavy Hitter, **10–25s**, excluding the later $19.99 promotion and Google-review screen. Her older caption’s three-meat Build-A-Bay description is not used as menu data. |

The four Hotpot Bay films arrived during preparation and were incorporated before pushing. The original Chubby Cattle @createwithcv **6–30s** excerpt is copied without recutting; its cut continues to exclude the opening membership-price signs. All playable assets have credits; original post dates are Pacific in the manifest/credits. No page exceeds four distinct films.

## Verification

- Build passed; data audit: **0 errors**, 153 existing/portion warnings.
- `tools/audit-batch76.mjs`: **58 local checks passed** across the three pages, all 160 menu rows, films and credits, all additional reviews, both category placements, A5 portions and four-film limits. Local-only membership checks open Hot Pot and Steakhouse from Search and verify Hotpot Bay and The Sea on their grids.
- `tools/audit-batch68.mjs`: passed. It now accepts an original film retained in the reviewer list after a later Watch request and checks that clip decoding there; the approved four-film cap replaces the historical three-film assertion.
- `tools/audit-foodies.mjs`: passed. Batch 75’s Hot Pot count assertion now allows later additions while preserving its original minimum.
- Seat comparison: three additions, no existing moves or removals. No affiliate terms files/worktree touched.
- Final pre-push refetch still ends at **12:27 pm**. Gap check: 535 business domains, 17 historical unmatched domains; no business domain from this batch is unmatched.

### Review navigation

The phone check exposed a dropdown state bug: opening Sachi’s page from Hotpot Bay reused the selected row number and expanded Sachi’s unrelated third review. The dropdown now tracks the page and source post, so navigating to another page cannot open a different review at the same index. Regression checks cover business → creator → business navigation and the correct Hotpot Bay excerpt. Build, all 58 local batch checks and the Foodie audit pass after this fix.

Live results follow after the final deployment.
