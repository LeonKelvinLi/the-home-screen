# Batch 81 — BEASTY page corners, Owner’s contacts and B i P

Covers Glenn’s thread after Batch 80’s **October 30, 2026, 8:47 am PDT** cutoff, through his **10:59 am** send. Read again at **11:22 am PDT** using `tools/thread-dump.py --since 2026-10-30`, with `tools/gap-check.py`. No new business or video was sent in this interval. The [request manifest](../research/roster/batch81.json) records all three requests and Leon’s acknowledgment.

## Requested changes

- **10:04 am — Owner’s contacts:** Janelle is temporarily removed from the shared public `OWNERS` list. Glenn and Leon retain their titles and published contact actions. This list supplies both the Contacts screen and the landing’s contact panel. No business, placement or CRM record is removed.
- **10:17 am — icon page corner:** brand, category, system, dock and open-spot icons use a shared page outline with a square top-right corner. A black lower triangle and white upper triangle reproduce the BEASTY page-fold motif with contrast on light and dark artwork. The same renderers cover Search and other in-app icon thumbnails. Gallery and Watch’s small framed marks carry the fold too. Source artwork remains intact; labels, badges, mobile/no-site rings, paid glows and tap targets retain their behavior. The fold uses static SVG paths, with no new filter or backdrop surface.
- **10:59 am — B i P:** new category kind `bip`, exact heading **B i P** and expansion **BEAST in PEACE**. It follows Teas/Boba/Matcha on the second More pages sheet and appears in Search. `bip`, `b i p` and `BEAST in PEACE` find it. It has an original peace glyph and procedural dusk wallpaper with a thumbnail and public credit.

**All 1,500 existing placements remain identical** to `aabbbf4`; no seats are added, moved or removed. The new category has **24 open spots** and manual placement only. Glenn supplied no entries, names, biographies or memorial subjects, so none are inferred. The first 24 categories and existing More pages order stay intact. Search now lists **53 pages**, including the existing Foodies continuation.

## Verification

Local verification passed:

- Build and TypeScript; startup bundle remains **218.36 kB** (**72.37 kB gzip**).
- **41 Batch 81 checks**, including all 1,031 registered app/open-spot icons, all 53 Search page thumbnails, all three dock sets, public and signed-in Owner’s contacts, B i P Search aliases, its empty grid/background, and short-phone/tablet width.
- **395 Batch 80 regression checks**; every previous seat, shop and film remains intact.
- **16 iPhone WebKit entry checks**, including repeated Enter and delayed module loading.
- Category and member-profile audits passed. Data audit: **0 errors, 156 warnings**, unchanged warning count; 191 notes.
- Final thread refetch at **11:33 am PDT** still ends with the same 10:59 am request. Gap check remains **541 business domains, 17 historical unmatched**.

Reviewed screenshots of the phone home grid, second More pages sheet, B i P and Owner’s contacts. The Scan sweep’s clipping now follows the square page corner, so it cannot round off the fold.

## Live verification

Release **`4b49886`** is deployed on **https://beastypages.com**, Render deploy **`dep-dbie6d0473hc73ch9vkg`**, live at **11:41:44 am PDT on October 30, 2026**. The health endpoint returned **HTTP 200**, `{"ok":true}`.

- `BASE=https://beastypages.com node tools/audit-batch81.mjs`: **25 production checks passed**, exit 0. Includes the deployed fold/category assets, absence of Janelle’s former owner contact details, real public Owner’s contacts with exactly Glenn and Leon, home/dock/city tiles and the B i P tile. Signed-in category checks use the disposable local member above; production mode creates nothing.
- `BASE=https://beastypages.com node tools/audit-iphone-entry.mjs`: **16 checks passed**, exit 0, including repeated entry, delayed app loading, no document reload or JavaScript/process crash, and phone-width fit.
- `node tools/live-verify.mjs --skip-roster`: **PASS**, exit 0. Checks the landing chapter, existing pages/videos and navigation, forms and protected endpoints. The historical roster walk is skipped on this follow-up; the current batch and previous batch have their dedicated audits above.

**Actual Chrome, 393×852:** Enter opened the category grid; inspected all 24 home category folds and four dock folds, varied light/dark affiliate artwork with existing rings/glows on Eats, a business opening, the second More pages sheet with Teas and B i P, and San Leandro’s yellow sheet with two affiliates and 22 open tiles. `/contacts` shows **Owners 2**, Glenn and Leon with their correct contact actions. B i P keeps the existing signed-out access gate; its full signed-in empty grid, wallpaper, aliases and Search thumbnails were verified locally. No Chrome console errors and no horizontal overflow observed. Closed the QA tab and restored the viewport.

iPhone Mirroring reported **iPhone in Use**, so no new physical-device claim is made for this batch. The Batch 79 physical entry repair remains in place and passes the 16 live WebKit entry checks above.

The production results are recorded in a separate **`[skip render]`** commit so saving the verification does not redeploy the app.

No outbound messages, production accounts, purchases or bookings created. Affiliate agreement files and the separate affiliate worktree untouched.
