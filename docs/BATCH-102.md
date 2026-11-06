# Batch 102 — November 6, Dinner With Ike

Fresh Messages intake after Batch 101 found one new Glenn send: `https://dinnerwithike.com/?st-lid=20198531` at 10:22 a.m. Pacific. Leon liked it at 10:33 a.m. There were no new clips, attachments or category instructions.

Dinner With Ike is Food & Philosophy with Ike Shehadeh, founder of Ike’s Love & Sandwiches: a multi-course dinner and small-group conversation at Restaurant Gary Danko, 800 North Point Street at Hyde in San Francisco. The organizer’s rendered page confirms Tuesday November 17, 5:30–8:30 p.m., and $395 per seat. The current year, 2026, matches that weekday/date. Gary Danko is the venue, rather than a newly requested restaurant listing.

The event has its own page, the organizer’s portrait, San Francisco More services seat 14 and BEASTY Events seat 11. Its event panel includes the published schedule, ticket price, inclusions, business-casual dress, dietary-contact direction, final-sale terms and official details/Square links. No phone, email, full restaurant menu or continuously current remaining-seat count is invented. Checkout stays with the organizer.

A curated News entry appears on the November 17 Calendar and opens the event page. News now carries an optional published event time through to Calendar, so this scheduled dinner displays its actual time instead of “All day.” This does not implement the separate affiliate self-service requests in [follow-up notes](GLENN-FOLLOWUPS-2026-11-06.md).

The domain gap checker’s loose prefix match had falsely considered this domain represented: `dinnerwith` occurs in an unrelated older dinner-with-a-DJ description. Direct source-to-catalog reconciliation caught it. The new seed now explicitly contains `dinnerwithike.com`; the earlier 18 unrelated, held or deliberately removed domain findings remain unchanged. The previous film ledger is preserved without changes.

Sources and exact data: [batch research](../research/roster/batch102.json), [coverage ledger](../research/roster/b86-b102-coverage.json), [organizer](https://dinnerwithike.com/). No new send is held in this batch.

## Verification

The production build passes. The data audit reports zero errors (181 existing warnings). Both local Chrome and iPhone WebKit batch audits pass: the source facts and exact portrait, both seats, organizer links, News → Calendar → event navigation, exact calendar time and 393×852/320×740 overflow checks. All 1,889 pre-existing seats are unchanged; exactly two seats were added. Production verification follows deployment.

## Live release

Render deployed `7bdcc9e4d79234676449afc6bf9217cdfdbd1d7f` in `dep-dbn1ulvb9u1s73c28f5g`, reaching provider status `live` at 10:50:22 a.m. Pacific on November 6. Public health and the new portrait’s exact SHA-256 were ready at 10:50:43 a.m., following the persistent-disk restart’s temporary HTTP 502 responses. The production entry is `/assets/index-BWIQCrcH.js`.

Both production batch audits pass in Chrome and iPhone WebKit, including the exact portrait, source facts, organizer links, both seats and News → November 17 Calendar → event navigation with the correct published time. All 16 iPhone entry checks pass, including a stalled module and repeated return/enter cycles.

Visible connected Chrome passed at 393×852 and 320×740: readable event details and dropdown, News entry, Calendar date and exact time, Calendar-to-event navigation, and green Call → Enter → home with the landing layers removed. No horizontal overflow or console errors were observed. The temporary viewport was reset and the test tab closed. Browser testing stayed silent.

A fresh complete Messages extraction still contains the same 725 unique Instagram source IDs. Live bundle reconciliation matches 675 sources, with the same 49 older documented exceptions and one disregarded send; all 19 sources added in Batches 100–101 remain present. Those batches’ eight versioned updated icons and 19 posters also match their committed hashes. No application errors were reported in the checked Render logs after public recovery.

The full production `tools/live-verify.mjs` audit passed, including its historical roster walk and shared media, navigation, membership-copy and API checks. Every live verification process exited with code zero. A final Messages refetch still ends at Glenn’s 10:22 a.m. Dinner With Ike link; there are no later sends or new holds. The domain-gap result remains the same 18 earlier findings.
