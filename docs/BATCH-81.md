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

Reviewed screenshots of the phone home grid, second More pages sheet, B i P and Owner’s contacts. The Scan sweep’s clipping now follows the square page corner, so it cannot round off the fold. Production deployment and actual Chrome phone-layout verification are pending.

No outbound messages, production accounts, purchases or bookings created. Affiliate agreement files and the separate affiliate worktree untouched.
