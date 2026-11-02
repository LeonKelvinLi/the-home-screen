# Batch 87 — Glenn’s November 2 Kennels and Easy Breezy requests

Scope: after Batch 86’s November 2 **10:14 am PST** cutoff, through **10:47 am PST**. The final refetch contains 159 November 2 messages, with no later listing request. Baseline: `2f0b003` (Batch 86’s live-verification commit). Recruitment/release-party discussion is planning context; no outreach was sent.

## What shipped

- **Grande Kennels** (`b_grandekennels`): original green/gold artwork, own Instagram, Cane Corso kennel/stud-service description and a link to Cynthia’s existing BEASTY page (`b_foodielagrandedelabanda`). New **BEASTY • Kennels** category, searchable and on More pages, with its own doghouse glyph and dark wallpaper. It accepts every dog breed; the three earlier kennel/breeder listings also fill this category.
- Glenn also requested **Pets**. All 24 original Pets seats are occupied, so Grande opens a **More pets** yellow continuation; no old tile is evicted.
- **Easy Breezy** (`b_easybreezy`): original supplied artwork, website, Instagram, published business email and Sunset address/call/hours. All **six verified branches** appear in a panel with each branch’s address, phone and exact schedule. It is seated in San Francisco, Walnut Creek, More eats, FROYO, Sweets’ open Custard spot and Vegan. Existing Vegan Mob’s auto-filled spot is pinned at its original number.
- **Maya Waldman • SF Foodie** (`b_foodiemayamunches`): new creator page and Glenn’s requested current original portrait, appended at More foodies 172. This handle is distinct from existing `@mayakay.official`.
- **Dan | Your Bay Area Foodie Explorer** (`b_foodiedchangshangry`): requested current original portrait and own display name. Existing creator ID, seat and Hotpot Bay review are retained.

**All 1,647 earlier seats remain unchanged.** Twelve seats are added, for 1,659 total. All 172 earlier overflow Foodie positions stay in order; Maya makes 173. Watch has **467 unique local films**, up from 465. Four artwork files are original pixels resampled with aspect preserved to 512×512, without story rings or redraws.

## Requested films

| Original post | Creator | Where filmed | Published excerpt |
| --- | --- | --- | --- |
| [DXYA3bzjOTc](https://www.instagram.com/reel/DXYA3bzjOTc/) | @maya_munches | Easy Breezy Sunset, 718 Irving Street, San Francisco | 0–15s; Clip / Newbie |
| [DeZeeGbzfoV](https://www.instagram.com/reel/DeZeeGbzfoV/) | @dchangshangry | Easy Breezy, 1387 N. Main Street, Walnut Creek | 0–15s; Clip / update icon / Foodie |

Both play on Easy Breezy and their creators’ pages, and each appears once in Watch. Original audio is retained; 540×960 H.264/AAC, square pixels (`setsar=1`), fast-start. Source, creator, original Pacific post date and excerpt are recorded in `public/clips/CREDITS.md` and `research/roster/b87-films.json`. Maya’s film visibly says Sunset; Dan’s caption explicitly names Walnut Creek. They are not represented as the same filmed branch.

## Research and holds

[Easy Breezy’s own website](https://www.easy-breezy.com/) verifies all six locations and the eight rotating flavor cards. The entire published flavor list and ingredient/dietary descriptions are in a dated panel, with the business’s [nutrition page](https://www.easy-breezy.com/nutritional-information-easy-breezy) linked. Food prices are **not published** there; current yogurt price/completeness is held rather than guessed from reviews. Branch availability is not promised. Vegan and dairy flavors are distinguished, not applied to the entire shop.

The separate six-row **online shop** price list covers the physical gift card (from $25, with $50/$100 values stated) and five $38 shirt variants, including the published size options. It is explicitly labeled merchandise, not a yogurt menu. US shipping is included in published merchandise prices. Confirm stock directly. The own-site **4.5% service fee** and no-stacking promotion condition are disclosed; no BEASTY discount, live food ordering endpoint or expired review promotion is invented. Published contact email is also visible in Glenn’s Easy Breezy contact screenshot.

[Grande Kennels’ own profile](https://www.instagram.com/grande_kennels/) verifies Cane Corso, Bay Area/Northern California, stud service and its link to @lagrandedelabanda. No exact city/street, phone, email, standalone site or service price is verified, so those remain held. Registry/bloodline/OFA/Vet Med bio wording is not independently verified and is not presented as certification. No unrequested dog film was downloaded or invented. A city seat is held until an exact city is verified; the requested Kennels and Pets pages are seated.

Maya and Dan’s original 1080px public profile images were checked against Glenn’s requested screenshots before resampling; Easy Breezy’s supplied original image and Grande’s original 1080px artwork were similarly checked. Credits are in `public/icons/CREDITS.md`. The research manifest is `research/roster/batch87.json`.

Gap check: **563 business domains, 17 unmatched**; Easy Breezy is represented. The same 16 historical tool/external domains plus operator leonbuilds.org remain unmatched. No new Batch 87 website is missing. No outbound communication, accounts, reservations or purchase was submitted. Protected affiliate files/worktree are untouched.

## Verification

TypeScript and production build passed. Data audit: **0 errors, 170 existing warnings**. The initial local browser run exercised the requested behavior but caught credits being served from an older build; the build was refreshed before the final audit.

Final local Chromium and iPhone WebKit each passed **62 Batch 87 checks**, exit 0: all prior seats and creator order, new pages, complete flavor/location/shop panels, both advancing credited films, unique Watch entries, original portraits/logo restoration, Kennels via Search and More pages, Pets continuation and 320px layout. The iPhone entry regression passed **16 checks**, including a delayed app module and repeated green Enter, with no document reload or WebKit crash. Screenshots of Grande, Easy Breezy, Kennels and More pets were inspected. Production verification is pending Render.
