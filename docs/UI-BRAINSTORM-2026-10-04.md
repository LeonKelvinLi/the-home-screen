# BEASTY UI direction — October 4

Make the first screen a useful directory, each page a clear destination, and the business workspace an easy way to keep information current. Keep the familiar phone interface and the public business facts already researched.

## Included in this release

- **Home:** 24 category doors with a consistent set of recognizable pictograms. Category pages open on demand. Coffee, Sweets and AYCE are directly available. Automotive contains businesses; Whips contains car showcases.
- **Business and creator pages:** multiple supplied videos sit behind one collapsed control. A named selector distinguishes the restaurant or reviewer. Existing hosted clips are retained; source credits point to the creator's profile.
- **Whips:** MeterSF starts with its supplied video, two labeled still frames and a Shops panel. This establishes a useful page pattern without claiming the stills are separately supplied photos.
- **Watch:** each hosted source appears once, even when it is connected to both a business and a reviewer. There are 119 unique hosted videos across the whole directory after this batch.
- **News:** a factual directory update introduces the new destinations.
- **Feature measurement:** client events for opening Gallery, Watch, News, Calendar, Share and Contacts are accepted by the analytics service. This adds event collection; it does not add a reporting dashboard or demonstrate user adoption.

## Next improvements by surface

| Surface | Proposed UI | Why it helps | Acceptance check |
| --- | --- | --- | --- |
| Home | Keep the category doors; allow a member to pin a few favorites above them. Use a consistent darker wallpaper scrim and complete labels at small widths; simplify the utility toolbar on compact phones. | Repeat visitors reach their usual places quickly. | At 320 px every category remains reachable and readable; pins never displace categories. |
| Search | Separate Places, People and Categories. Show the city beside repeated business names. Add a small set of factual filters such as category and city. | Seven Hinodeya locations should be distinguishable before opening one. | Search an exact handle and a multi-location name; users can pick the intended destination without trial and error. |
| Business pages | Order the page around identity, city, the most useful contact action, current offer if verified, media, then details. Replace generic “Open their page” with “Instagram” or “Website.” | Visitors immediately understand what the business is and how to contact it. | Each public action has a current destination; no unsupported prices, hours or discounts appear. |
| Foodies and creators | Display named video choices, reviewer credit and a link to the reviewed business when that relationship is verified. | Viewers can continue from a review to the place. | A review appears on both related pages without duplicating the business or Watch video. |
| Whips | Separate Video, Gallery and Shops. Allow shop credits to open the shop's BEASTY page once identity is confirmed. | A showcase tells the story of the car and its contributors. | Precision Auto Service is not confused with Precision Tune; unavailable photos use an honest empty state. |
| Gallery | Group by business or creator with visible source credits; retain the selected group when returning from a detail view. | A large gallery remains understandable. | Opening and closing a picture returns to the same group and position. |
| Watch | Add reviewer/place labels and a clear sound state. Remember the current clip when opening its business. | Videos become an entry point to discovery. | Closing a business returns to the same clip; hidden clips do not keep playing. |
| News | Cards with a clear date, business attribution and one concise preview. Separate directory notices from member submissions. | Visitors can tell who is speaking and whether information is current. | Every card has an attributable source; expired promotions do not look current. |
| Calendar | Offer Upcoming and a month view; event details show date, time zone, location, organizer and destination. | A dense calendar becomes a practical outing planner. | Missing time or location is explicit; recurring dates and daylight-saving transitions display correctly. |
| Share & Scan | Show exactly what is being shared: business, category, event or member invitation. Provide a readable link beside the QR. | People trust the destination before sharing it. | Scan and copy open the same destination; no unintended member information enters a public link. |
| Contacts | Separate saved businesses from personal contacts; use clear Call, Text and Directions actions only where supported. | Visitors understand why each entry is present. | No personal address book is exposed by a directory action. |
| Profile and favorites | Give a member a simple public preview and clearly private saved items. | Public identity and personal organization become easier to understand. | The public preview contains only fields explicitly intended for publication. |
| Affiliate workspace | “My business” with Page, Photos, Events, News and Activity. Show Draft, Submitted, Published and Needs changes states. | Affiliates can contribute without mistaking a save for a live publication. | A member can edit only a business they are authorized to manage; drafts never appear publicly. |
| Operator review | A queue with Preview, Approve and Request changes; show the existing page beside the proposed revision. | New content can be reviewed with its context intact. | Approval applies the reviewed version; concurrent edits cannot silently overwrite it. |
| Analytics | A simple activity screen with page opens, contact actions and video plays, plus the time range and tracking start date. | Businesses can see measured activity without invented outcomes. | Distinguish visitors from events, internal activity and unknown values; do not label a click as a sale. |

## Affiliate workspace flow

1. Sign in and select a business the operator has assigned to the member.
2. Edit the page or create a photo, event or news draft.
3. Preview the exact public result. Save keeps it private.
4. Submit places a version in the operator's review queue.
5. Approval publishes that version and records who approved it; a revision request explains what needs changing.

This flow is a proposal. The existing member profile and affiliate dashboard do not establish member-to-business ownership. Calendar creation is currently an operator action, and News has no affiliate composer. Implement assignment and permission checks before exposing these publishing controls.

Recommended sequence: **make Search distinguish locations; standardize business contact actions; then build the affiliate workspace and operator review queue.** The first two improve every existing page; the workspace makes those improvements maintainable as the directory grows.
