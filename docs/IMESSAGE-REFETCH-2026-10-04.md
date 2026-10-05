# Full iMessage reconciliation — October 4, 2026

Baseline: `f1f5a14d947fe8f2cd750774070c872f5ae720ec`, 591 existing pages. Result: **672 pages, 81 additions** (37 business/location/showcase pages and 44 creator pages). Public source URLs and request IDs are listed in `research/roster/imessage-refetch-2026-10-04.json`; private transcripts and screenshots are excluded from the repository.

## Coverage

- Refetched 4,067 decoded incoming text messages in Glenn's BEASTY conversation from August 1 through October 4.
- Reviewed/OCR-processed 440 available incoming image attachments. Another 1,323 old image attachments are absent from the local Messages store and cannot be inspected.
- Rechecked the conversation after processing. No newer incoming message appeared in that refresh. Message IDs are not chronological; the latest by date was 247472, with later IDs representing earlier timestamps.
- Compared source submissions with the existing catalog using names, public domains, handles and locations. Existing creator and business pages were reused. Four older reel links resolved to @sjaroundthebay, @bayareawilson, @foodgiveness and @orangeginger; each was subsequently verified in Chrome.
- Chrome was used through the installed browser extension for source inspection and responsive UI checks. Public source media was downloaded without extracting browser credentials.

## Requested changes

- Added only missing submissions, retaining all 591 existing page IDs and names.
- Moved Paulo Sausage Co. away from its closed Pittsburg location to the requested Martinez and Brentwood market placements; public copy asks visitors to confirm weekly availability.
- Promoted Nosso into flagship Eats spot 21; Meadowlark Dairy is first on Sweets.
- Renamed the automotive business category to Automotive. Whips is now a separate car showcase category, with MeterSF first.
- Added Coffee, Sweets and AYCE and a home page with 24 category doors. Existing category seats are pinned to retain their order while new entries are appended.
- Updated Flowers Valley's icon using its current public Instagram artwork.
- Connected 92 review relationships from 81 unique supplied video posts. **76 new hosted excerpts and four existing hosted clips** are playable; one post remains a source link. The whole Watch catalog now has 119 unique hosted videos.
- Added named video choices for pages with multiple reviews, reduced-motion support for the review bar, and collection of the requested feature-open events.
- Added MeterSF's video, two clearly labeled still frames and its supplied shop link.

## Exceptions and proposals

- The Bottomline story in request 247064 has expired. Its existing page remains available; no replacement story was invented.
- @hungere.for.diy post `DdeTKlrOHud` is reachable as a source link but its public video download failed after retry. Other supplied public download failures were recovered on retry.
- `DcwX_gsjwbd` is a photo carousel, not a video; it is linked from MeterSF's Shops panel rather than represented as a playable clip.
- The relationship between @precisionautoservice and precisiontune.com is unconfirmed. Only the supplied Instagram identity is used on the new shop page.
- Requests 244677 and 244718 point to an agency/event-host post with multiple people. The intended Foodie account is ambiguous; no agency was mislabeled as a Foodie. The identified existing creator page is reused where verified.
- Souva's public site is coming soon; the page says so. Burma 2's referenced QR offer and dog policy were not confirmed as a BEASTY agreement and are not advertised as such.
- The affiliate page/news/calendar publishing workflow is a UI proposal, not an implemented publishing system. See `docs/UI-BRAINSTORM-2026-10-04.md` for the proposed flow and required ownership mapping.

## Verification

- Production build and both TypeScript projects pass. Vite retains its existing large-bundle warning.
- Media checks: all 76 new hosted excerpts have valid video streams, durations up to 24 seconds, existing posters and preserved source audio streams (270.4 MiB total).
- Feature-event ingestion check: all six allowed feature kinds persist, unknown events are refused and unapproved personal fields are removed.
- Data audit: zero errors, 64 warnings, 127 notes. Existing pricing warnings remain; new category-capacity warnings mean overflow entries remain accessible through Search.
- Independent October 4 contract: all original page identities and unchanged placements retained; only the two explicit old-seat moves differ; 24 doors have destinations; review targets and local assets exist; Watch contains each source once.
- Mutation check: replacing MeterSF with the mechanic in Whips' first seat makes the contract fail; restoring the correct seat passes.
- Chrome phone checks at 390 × 844: category grid, Whips navigation, MeterSF video readiness/playback, gallery and shop destination, recovered creator Search and switching named review videos pass. A 320 × 568 check confirms the 24 doors paginate into two screens; the compact utility toolbar is noted for further UI refinement. Temporary viewport is reset after review.

Deployment verification is recorded separately after the production deploy finishes.
