# Batch 84 — Glenn sync, October 31, 2026

Covers the thread after Batch 83’s October 31, 8:41 am cutoff through **8:45 pm PDT**. Previous release and verification were `7dd8a8c` / `e2090df`. Refetch includes the later AI and Lovitt’s requests. Research: `research/roster/batch84.json`; film provenance: `research/roster/b84-films.json`.

| Send | Result | Placements |
| --- | --- | --- |
| 1:34 pm Ink Wall Co.; Bay Area Goods / BEASTY Services | Own logo, public phone/email, on-site printing services and quote link. Sacramento/Bay Area footprint; no invented shopfront, rates or hours. Bay Area already exists. | Bay Area More goods 0; BEASTY More services 33; Artists 7 |
| 1:37 pm Subs Inc.; SF Eats / BEASTY Eats | 1300 Castro St; phone/email/Instagram; daily 10:30am–5pm; all **65 available menu rows in 7 sections**, variable floors preserved; catering and own ordering links. | SF More goods 65; BEASTY More eats 100; Chefs 17; Catering 12 |
| 1:39–1:40 pm Subs films; Heavy Hitter / Newbie / Watch | Grand-O’s Heavy Hitter review, plus FoodWookie’s Newbie as the main film. No separate link accompanied “Watch this video clip”; both supplied films are playable. Grand-O’s existing page stays. | FoodWookie appended at More foodies 142 |
| 5:09–6:18 pm two Rywire SEMA posts; BEASTY Whips | Two own-account car/build films added to **existing Rywire**, alongside its original YouTube road film. Posted-by attribution, no invented Foodie reviewers. | Whips 11; MeterSF 9 and Mr. Cheeze 10 remain |
| 8:14 pm tap icon to enlarge, tap again to shrink | Original business-page hero artwork opens a native dialog. Tap the art again, Close, Escape or backdrop to return. Original art aspect ratio preserved; generated wordmarks work too. Grid icons still open pages with one tap. Native modal focus isolation; trigger focus restored. No extra video decoder, blur surface or full-screen animation. | All business pages |
| 8:36–8:37 pm İsmail Seval; BEASTY Ai and reel | Original creator portrait, public business email, Instagram and linked site; film explicitly labeled **AI-generated**, matching the creator’s own caption. | AI 6 |
| 8:39–8:40 pm Lovitt’s BJJ; Concord Services / BEASTY Youth | Original logo, 2190 Solano Way address, public phone/email, kids/adults programs, **12 published rates in 5 sections**, direct schedule and pricing links. Enrollment handled by the school. Its supplied youth-class film is playable, with archived age bands explicitly disclosed. | Concord More services 3; Youth 4; Gyms 17 |
| 8:44 pm M Omer Farooq; BEASTY Ai and reel | Original @mo.x2.ai portrait, public business email and Instagram; AI-generated unofficial Street Fighter fan film, labeled before playback. Dubai bio retained without inventing local presence. | AI 7 |

All **1,518 existing placements remain unchanged**; **14 added**. No existing rank or category occupant moves. The named sandwich/Gym/Print positions remain held; yellow overflow and matching open category seats supply the requested placements.

## Film excerpts

| Original | Account | Local file | Excerpt |
| --- | --- | --- | --- |
| [DfK5OdlSYrJ](https://www.instagram.com/reel/DfK5OdlSYrJ/) | @thesnacksensei / Grand-O | review-DfK5OdlSYrJ | 37–52s |
| [C7Vq6ayOShB](https://www.instagram.com/reel/C7Vq6ayOShB/) | @foodwookie | subs-inc | 0–5.4s; before outro |
| [DfJAxg7vn1V](https://www.instagram.com/reel/DfJAxg7vn1V/) | @toyotires | rywire-toyo-sema | 0–24s |
| [Dew9d_nOSSY](https://www.instagram.com/reel/Dew9d_nOSSY/) | @rywire_motorsport | rywire-sema-startup | 8–32s |
| [DcrUt2-vGff](https://www.instagram.com/reel/DcrUt2-vGff/) | @yapayzekaserisi | ismail-seval | 0–24s; creator-disclosed AI fantasy |
| [DcTpqOnArSH](https://www.instagram.com/p/DcTpqOnArSH/) | @c.lovittsjujitzuof | lovitts-bjj | 4–14s; older age bands disclosed, promotional ending excluded |
| [DdexmHaqiQ3](https://www.instagram.com/reel/DdexmHaqiQ3/) | @mo.x2.ai | m-omer-farooq | 30–45s; AI fan film |

All seven original files downloaded; excerpts have original audio, H.264/AAC encoding, faststart and 540×960 posters. Each enters Watch once. Rywire’s earlier 960×540 YouTube excerpt is retained unchanged. AI and own-account car posts are not independent Foodie reviews. Logos are original own artwork, resized without redrawing. Credits are in both public asset credit files.

## Held and source discrepancies

- Subs’ **Super Gobbler, Greek Salad, apple juice and Kinder Bueno** were sold out on its own ordering menu; excluded from the available menu. Toast’s own 3% credit-card surcharge is disclosed in the ordering panel, and final options/prices stay on its checkout.
- Ink Wall Co. publishes no walk-in street address, hours or rates. Services and public contact/quote links are available.
- Lovitt’s home page advertises Sunday closed and Saturday until noon, but its actual schedule includes Sunday noon open mat and Saturday afternoon BJJ. Hours are held and the conflict is disclosed with the current class schedule. The own youth age bands omit age 6, so parents are directed to the school rather than an invented band. No Instagram handle verified.
- İsmail’s website returned HTTP 403 to the research client. The creator’s own Instagram and Glenn’s supplied screenshots confirm the name, linked domain and public business email. No local address, phone or rates invented.
- The 1:40 pm Watch instruction had no additional URL. The preceding Subs Newbie film supplies the main Watch film; no third source invented.
- Personal sender details from screenshot email composers are excluded from seeds, assets and research.

No messages, contact forms, signups, purchases or reservations submitted. Affiliate agreement paths and worktree untouched.

## Verification

### Local

- Build and TypeScript passed. Data audit: **0 errors**, 161 historical warnings.
- Chromium and iPhone WebKit: **114 checks passed each**, exit 0. All seven films visibly decode from their correct business panels; original audio, available menus, 14 added seats, all 1,518 unchanged seats, creator links and credits pass. All 406 Watch films are unique.
- Native logo viewer: original image, tap again, Close, Escape, backdrop, focus restoration, repeated open/close, generated wordmark and wide page mark tested. Viewer fits 320×568; no JavaScript error, process crash or document restart. Screenshots inspected at phone size.
- iPhone entry regression: **16 checks passed**, including delayed app loading, repeated green Enter presses and no reload/crash.
- Reel sound and share audits: **PASS**. Decoded audio unmutes/remutes; sharing copies the actual business link and leaves sound unchanged. Watch remains bounded to four mounted players, with none playing on an ad and one playing after returning to a film.
- Gap check: **548 business domains, 17 historical unmatched**, no new business gap.
- WebKit exposed a non-square sample aspect ratio in M Omer’s source. Its excerpt is normalized to square pixels; `tools/make-clip.py` now explicitly applies `setsar=1` for future cuts. Final Chromium and WebKit reruns pass.

The gated feed audit uses an explicit browser-only synthetic member response; it creates no account or session cookie. No production forms or messages are submitted. Latest bounded research refetch: **49 messages through 8:45 pm**, including both later AI creators and Lovitt’s film. Remote main remains `e2090df` before release.

### Production

Release **`b85dc8b`** is live at **https://beastypages.com**, Render deploy **`dep-dbjbfmbncjis73dect6g`**, completed **October 31, 2026, 9:01:11 pm PDT**. At **9:02:11 pm**, the new M Omer icon matched its release SHA-256 and `/api/health` returned **HTTP 200** with `{"ok":true}`.

- `BASE=https://beastypages.com node tools/audit-batch84.mjs`: **114 checks passed**, exit 0. All seven supplied films advance after user playback gestures from the correct panels, including native controls on the Grand-O review. Source credits, original audio, full menus, unchanged placements, logo viewer and bounded Watch playback pass.
- `BASE=https://beastypages.com node tools/audit-iphone-entry.mjs`: **16 checks passed**, exit 0, including delayed loading, repeated entry, and no document restart, JavaScript error or WebKit process crash.
- `node tools/live-verify.mjs --skip-roster`: **PASS**, exit 0. The historical roster walk is skipped; all new pages have the dedicated batch audit.
- Final local iPhone WebKit audit: **114 checks passed**, exit 0, with real advancing playback. The audit helper uses native pointer playback in WebKit and the native Space control in Chromium for review videos; business films use their actual sound button. This verification-only audit strengthening is recorded with this document under `[skip render]`; product files are unchanged after release.

**Actual Chrome, 393×852:** the green Enter button reached the real home grid twice, with return to landing between attempts. The landing layer then disappeared, the home remained visible, and no horizontal overflow was present. Opened all five new listing pages. Every new original logo enlarges and restores on a second tap; the Subs viewer was visually inspected on screen. Subs’ menu dropdown renders 65 rows; Lovitt’s price list renders 12 rows. Grand-O’s native review played through its 15-second duration. Rywire’s video panel contains its original film and both new credited SEMA posts. The connected QA tab reported no console errors. Temporary phone viewport restored and task tabs closed.

The production feed test uses the browser-only synthetic membership fixture stated above. Actual Chrome checks cover public entry and pages. This is Chrome phone-layout and iPhone WebKit verification, not a new physical iPhone Mirroring run.

Closing thread refetch: **49 messages**, unchanged from the 8:45 pm snapshot; no further sends. All listing/reel requests through that cutoff are seated live; held facts and sold-out items are explicitly listed above.
