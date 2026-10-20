# Batch 56 — 19 October 2026

Everything Glenn sent on 19 October after the movers: four businesses, five changes to Contacts, sign-up and friends, and the reels after three quiet seconds. Research and sources for the businesses are in `research/roster/batch56.json`.

## Businesses

| Business | Seats | Notes |
|---|---|---|
| Molinari Delicatessen, San Francisco | San Francisco second sheet; BEASTY More eats | 25 sandwiches and drinks, priced, from their own "Order Sandwich Online" page. San Francisco's Sandwiches spot is Deli Board's and BEASTY • Eats' is The Local's. Film: @festusfeasts' review, credited. Shop hours from their site. |
| Bakefections, South San Francisco | San Francisco second sheet; BEASTY • Bakery spot 12 | Custom cakes and cupcakes to order; no prices published, so the page asks for a request (their Google Form), a text or an email. Seated on San Francisco as Glenn wrote, although their Instagram says South San Francisco. The form is their only site, so the needs-a-website outline. Their email is spelled with two s's (bakefectionss@gmail.com), as on their contact sheet. |
| Dope Pho, Fremont | Fremont second sheet; BEASTY More eats | 90 items, priced, from their own menu11 ordering page. Fremont's Asian spot is House of Raha's and BEASTY • Eats' Pho spot is Gao Viet Kitchen's. Their Instagram says 10am to midnight and their ordering page says 11am to 9:30pm with a 2:30 to 4pm break, so no hours are shown. The ordering page is their only site: needs-a-website outline. Film: their own reel. |
| M Dumpling, San Ramon | San Ramon Asian spot | 61 items, priced, from the ordering page their own site links to (the site's menu has no prices). Glenn wrote "Needs Website pilot", but mdumplingsanramon.com is live (a SpotHopper template), so there is no needs-a-website outline. For the pilot it is a redesign pitch, which is Glenn's call. |

Bakefections is seated on BEASTY • Bakery by hand. Left to the automatic fill, her "cupcake" type line would have taken BEASTY • Sweets' Cupcakes spot from Baked Blooms. A before-and-after diff of every seat shows only the eight new ones.

## Contacts, sign-up and friends

- **Owners behind one button.** Glenn: "can you make the owners a button that will drop down the 3 contacts to minimize the space?", and on his markup: "Can you just have a phone & email icon to tap all on a single line for each of our contact info?" Owners starts closed and opens to one line each: name, role, a green phone icon (call or text) and a blue mail icon. Leon's line has no icons until he has a number or address to show.
- **The note as a bubble.** "Can you make this a bubble that pops up after 2 seconds pointing to 'owners' below?" "Get in touch directly with the owners for any questions. Text or email is preferred" rises in two seconds after Contacts opens, with its tail pointing at Owners. A tap puts it away.
- **Drop-downs per set of letters.** "Have a drop down for each set of letters", over his note "A-H, I-Q, R-Z". The list is now three drop-downs, each with its count.
- **City and State.** "Add City and State when people sign up to appear here. That way people can befriend people in their same city if they want to. It is also good to add to our analytics."
  - Sign-up asks for City (required) and State (defaults to California).
  - Contacts shows "Concord, CA" beside each member's "Member since", and so does their page.
  - Members from before today add theirs on Profile ("Add your city"), or it fills in the next time they sign in. A city already set is never overwritten that way.
  - The sign-up event carries city and state, and the CRM's Users page has a new "Where members live" chart.
  - The server refuses digits in a city (no street addresses) and any state not on the list.
- **Find friends, his Beli idea.** "We should do something very similar but change it to something referring to the 💎 points."
  - A new member lands on "Earn points with people you trust" straight after joining. It is also one tap from Contacts ("Find friends near you").
  - It lists members you are not already friends with and have not asked, people in your own city first. Each row shows their diamond points and their town, and the first five are ticked, as on Beli.
  - Select all, then "Add N friends" sends a real friend request to each.
  - Points are 3 per real membership referral, Glenn's rate of 2 September. Nothing invents or multiplies them; his double-points promotions are not built.

- **The reels after three quiet seconds.** Glenn, 19 October evening: "when the user is on the home screen, after 3 seconds of no activity, can we let it default onto the video reels page?" and "maybe we could delete that pop-up bubble for the video reels." A signed-in member whose home screen sits untouched for three seconds goes to the reels, once a visit; any touch, key, wheel or scroll starts the count again. Signed-out visitors are not moved, because the reels button is a sign-up prompt for them. The reels bubble is gone, and with it the rules that had been restyling the reels viewer's own "scroll for more" pill. An automatic open counts as a reels-button tap in the analytics, since it goes through the same door.

## Verification

- `tsc -b`, `npm run build`, and the data audit (0 errors).
- `tools/audit-batch56.mjs`: 23 checks on a local build. Each page, image, film and creator credit; each city seat; and all 25, 90 and 61 menu items behind the Menu bar.
- `tools/audit-city-friends.mjs` (new):
  - On the server: the rules for City and State, points from real referrals, same city first, and a sign-in never overwriting a city.
  - In a phone browser: the bubble, the Owners drop-down, A–H/I–Q/R–Z, Find friends from Contacts, and a new member landing on it after joining.
- Seven audits that fill the sign-up form now type a city. The Contacts audits open the letter sets and the Owners drop-down.

Docker Desktop was stuck behind a macOS admin prompt this session. The suite ran one audit at a time against PGlite on the test port (`npx pglite-server -p 55432`), restarted fresh for each audit, because PGlite gives every test the same database.
