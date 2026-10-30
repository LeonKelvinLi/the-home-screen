# Batch 80 — San San, CHICHA Berkeley, tea and extended Foodies

Covers Glenn’s thread after Batch 79’s **30 October 2026, 7:54 am PDT** cutoff, through **8:47 am PDT**, including Leon’s 8:27/8:46 acknowledgments. Refetched using `tools/thread-dump.py --since 2026-10-30`; screenshots copied read-only from the same Messages thread. No outbound response sent.

## Pages and seats

| Page | Verified details | Seats |
|---|---|---|
| **San San Tea House** | [Own links](https://lnk.bio/Sansanteahouse), [Instagram](https://www.instagram.com/sansanteahouse/), 1019 Williams St, San Leandro CA 94577; (415) 322-3333 also published on delivery listings. Current own 1080px pink profile artwork, reduced to 512px. | `san-leandro-goods2-1`, `beasty-goods2-94`, `beasty-bakery-15`, `beasty-teas-0` |
| **CHICHA San Chen — Berkeley** | [Own NorCal site](https://chichasanchennorcal.com/), [locations](https://chichasanchennorcal.com/locations): 2400A Bancroft Way, Berkeley CA 94704. [Official Berkeley ordering link](https://order.snackpass.co/chichasanchenberkeley). Own 1080px profile mark reduced to 512px. | `berkeley-goods-14`, `beasty-goods2-95`, `beasty-teas-1` |

**165 seats added; zero previous seats moved or removed**, compared with `06d759d`. This includes the 138 Foodies overflow seats, 22 tea-category seats and five other seats for the two new shops. No paid or occupied Boba spot displaced: San Leandro’s numbered Boba spot stays with Thirstea, and BEASTY Sweets’ Boba spot stays with Cravingz.

San San’s [October 22 winter announcement](https://www.instagram.com/p/Dezx7S_y-jU/) sets **11am–7pm daily, October 24–January 31**, superseding the older bio’s Mon–Sat 11–8 / Sun 12–8. The dated source is linked in its Winter hours panel.

CHICHA’s supplied phone **(408) 792-9045** and **info@chichasanchennorcal.com** are explicitly labeled **NorCal team** contact, separately from the Berkeley address. No branch-specific phone or general hours inferred. Its own October 24 regional post announces Berkeley mocktail service Fri–Sat 6–9:30pm; those are labeled mocktail hours and linked to the announcement. The older website still says Berkeley mocktails are coming soon; current service should be confirmed with the team.

## New category and yellow sheets

At **8:44 am**, Glenn explicitly requests **BEASTY • Teas/Boba/Matcha — New Category**, with San San’s profile and CHICHA’s Berkeley request. New kind `teas` has its own generated wallpaper, thumbnail and cup/boba glyph. San San and CHICHA lead it at 0 and 1; 20 existing qualifying shops fill the other seats. No other existing category’s membership moves.

More pages now paginates: its first 24 category tiles retain their order, and Teas/Boba/Matcha appears on the following yellow sheet. It is also in Search. There are **51 categories plus the More foodies continuation** in the page list.

At **8:26 am**, Glenn asks for yellow pages for the extended Foodies. The original top **24** and all their seat numbers stay. **138 additional creators** with reviews already in the index get their own pages and fixed `beasty-foodies2-0` through `137` seats. The **162** creator pages crosslink their existing reviews and businesses. Additional names use verified source handles where no display name was established; generated marks are used rather than invented portraits.

On a 393×852 viewport, the Foodies category travels with **six yellow continuations**. Shorter phones paginate at their own density, preserving the global seat indexes and direct jumps to a creator. `SlotPage.parent` keeps the original and continuation together; shared seat parsing accepts three-digit indexes, and the data audit counts overflow capacity.

[Foodies manifest](../research/roster/b80-foodies.json) records the original 24, all 138 additional handles, and six source accounts not treated as independent food reviewers: three business posting accounts, one salon account and two non-food film/review credits. Their existing source posts remain on their business pages. The @bsgmoments TikTok review reposted by Laughing Monk is not turned into an Instagram identity for the business itself.

## Every requested film

| Sent (PDT) | Original / account | Treatment |
|---|---|---|
| 8:23 am | [DW4iaEQkmUI](https://www.instagram.com/reel/DW4iaEQkmUI/), @sanleandroeats | San San main Watch, **0–10.985s**, full original. April 13 discount in the original caption is expired; no offer overlay in the film and no discount offered on BEASTY. |
| 8:26 am | [DfHBbcgSlPy](https://www.instagram.com/reel/DfHBbcgSlPy/), @feed_happiness_ | San San Heavy Hitter, **31–46s**. |
| 8:44 am | [DGMZVoJywEB](https://www.instagram.com/reel/DGMZVoJywEB/), @eatswithkath | Berkeley Heavy Hitter, **6.2–10.381s**. Starts after the misleading Michelin headline. The caption describes a product Superior Taste Award; no restaurant Michelin-star claim copied. |
| 8:45 am | [DeORBvOI6mJ](https://www.instagram.com/reel/DeORBvOI6mJ/), @sierra.eats.8 | Newbie, **0–6.852s**, full original. Explicit **Fremont** location and **expired October 8 BOGO** note appears before the player. Archival offer is not presented as available. |
| 8:46 am | [DeCRPNNJrCa](https://www.instagram.com/reel/DeCRPNNJrCa/), @hungere.for.diy | Mediocre, **18–33s**. Explicit **Pleasanton** location appears before the player. |
| 8:47 am | [De5q0XZq-D5](https://www.instagram.com/reel/De5q0XZq-D5/), @chichasanchen.norcal | CHICHA main Watch, **0–9.313s**, full own regional post; posted-by credit. |

All **six requested films** are playable copies with original audio, source links, exact cuts and Pacific post dates in [the film manifest](../research/roster/b80-films.json) and public credits. CHICHA has four films, within the existing limit. Only Berkeley is newly listed; the Fremont and Pleasanton footage is identified as other-location chain coverage. Context notes now appear before review video playback.

## Held facts and other sends

- **San San priced menu:** no complete current own menu linked from its site; delivery-platform prices disagree, and the live Grubhub menu did not resolve. Own posts verify the drink/treat descriptions; no unverified prices or options invented.
- **CHICHA priced menu:** official Berkeley Snackpass link opens a browser-verification checkpoint. No bypass attempted. Own site has no complete priced menu. General Berkeley hours and branch phone remain unverified; regional contact is labeled separately.
- **7:57 am delivery cancellation:** operational conversation, not a listing request.
- **8:32–8:35 am Supply Co vs BSTY Goods discussion:** future-build prioritization, not another directory entry or authorization to start an unrelated site in this batch.

Affiliate agreement files and the separate affiliate worktree untouched. No message, reservation, purchase or production account created.

## Local verification

Build passed. Final combined batch audit: **395 checks passed**, covering both shops, all six films with audio, exact source/context notes, corrected Instagram profiles and creator return links, both More pages sheets, every extended Foodie, original top-24 seats and a direct jump to overflow seat 137 on a shorter phone. Data audit: **0 errors, 156 warnings**; the new tea capacity warning counts 26 qualifying location rows, while the category seats 22 distinct business families. Foodies audit passed; category audit covers the new tea page and the 52-page Search list. All **16 iPhone WebKit entry checks** passed with the combined build. Gap check: **541 business domains, 17 historical unmatched**, the new Lnk.Bio gap closed. No existing seat changed. More pages and Foodies pagination retain the first pages and add continuations.

## Live verification

Release `bbb6517` became live at **9:18:16 am PDT on October 30, 2026**. Both QA corrections are included in final deployed commit **`4ecbf76`**, Render deploy `dep-dbica0n23o6c73f0c4ig`, live at **9:39:00 am PDT**. `https://beastypages.com/api/health` returned **HTTP 200**, `{"ok":true}`.

Against **https://beastypages.com** after that deployment:

- `BASE=https://beastypages.com node tools/audit-batch80.mjs`: **395 checks passed**.
- `BASE=https://beastypages.com node tools/audit-iphone-entry.mjs`: **16 checks passed**, including delayed-module loading, repeated Enter cycles, no document reload or JavaScript/process crash, and phone-width fit.
- `node tools/live-verify.mjs --skip-roster`: **PASS** for the landing chapter, deployed pages and clips, navigation, public forms and protected endpoints. The historical roster walk was skipped on this follow-up; the current batch has its full dedicated audit above.

These results are recorded in a separate `[skip render]` commit so the verification record does not trigger another deployment.

Actual Chrome at **393×852** verified both shop layouts, current-hours and regional-contact panels, video playback, the first and last yellow Foodies sheets, creator/business navigation and both More pages sheets. The tea tile follows the existing sign-in gate for off-home categories; its signed-in category grid is covered by the disposable local-member category audit. No production account created.

Chrome QA found and corrected two footer URLs that had used full Instagram URLs where the seed expects handles (`85f8490`). It also found the return buttons for Fremont/Pleasanton footage labeled with the filming location while opening the Berkeley host page; the buttons now name their actual Berkeley destination (`4ecbf76`). The filmed-location headings and source notes remain explicit. Both cases have regression assertions in the batch audit.

After the corrections deployed, actual Chrome confirmed both exact Instagram profile URLs and both creator-to-Berkeley return buttons. No Chrome console errors were reported during the check. The QA tab was closed and the browser viewport restored.

The earlier physical iPhone repair was verified on the actual mirrored iPhone 13/Chrome in Batch 79: two Enter cycles and Eats navigation succeeded after `0952810` deployed. Mirroring later ended because the phone was in use; this batch retains that fix and repeats the WebKit entry regression.
