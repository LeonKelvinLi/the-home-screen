# BEASTY

A web app that behaves like an iPhone home screen. Each icon is a business's
logo; tapping it opens that business's menu. One cart spans every kitchen, one
checkout pays them all, and each vendor is paid separately.

The browser tab reads "BEASTY PAGES"; the shorter name iOS prints under the icon
on Add to Home Screen is BEASTY. See the comment in `index.html`.

Built for an operator putting independent local businesses onto one home
screen: the brands from his own hub, Bay Area businesses researched one at a
time, and two pages of empty reservable tiles for each city he is opening in.

## Run it

The server needs Postgres — every table lives there, and there is no file to
fall back to. Locally that is one container, which the audits below share:

```bash
docker run -d --name beasty-pg -e POSTGRES_PASSWORD=beasty -e POSTGRES_USER=beasty \
  -e POSTGRES_DB=beasty -p 55432:5432 postgres:16-alpine
export DATABASE_URL=postgres://beasty:beasty@localhost:55432/beasty
npm install
npm run dev        # client on :5173, api on :8787
```

`.env.example` lists every other variable and what it is for; nothing loads a
`.env` file on its own.

Or build and serve the whole thing from one process:

```bash
npm run build
npm start          # http://localhost:8787
```

## Check it

```bash
npm run build                 # the audits serve dist/, so build first
node tools/audit-all.mjs      # every audit, three at a time
node tools/audit-all.mjs about members   # or just the ones whose name matches
python3 tools/gap-check.py    # every link he ever sent, against the catalogue
node tools/live-verify.mjs    # AFTER a deploy: drives beastypages.com itself
```

The roster's facts come from `tools/roster-research-ingest.mjs`, which reads
the research JSON (one array per batch, facts only from each business's own
site) and writes `src/data/rosterResearch.ts` — generated, do not hand-edit.
`node tools/spot-roster.mjs` (with `BASE=` pointing at a running server) prints
what a visitor sees on a handful of roster pages: the name, the hours, the
rows. The first version of it passed eight pages that were all another
agent's viewer on the same port, so it now demands the brand's own name.

Each audit starts its own server, its own browser and its own throwaway
Postgres database — created on the container above through `TEST_DATABASE_URL`
(default `postgres://beasty:beasty@localhost:55432/postgres`) and dropped on
the way out — so none of them needs anything running first except that
container. `tools/pgtest.mjs` refuses a managed host, so the production
database cannot be pointed at by accident. **They serve `dist/`** — a source
change you have not built is a change they cannot see, and the failure looks
like a bug that is still there after you fixed it.

`audit-all.mjs` grades on exit code AND on each audit printing its own sign-off.
The earlier way of running these piped them to `grep FAIL || echo "ALL PASS"`,
which reported ALL PASS for a suite that had been killed: no output means no
FAIL line. Silence is not a pass.

## What works

- **iOS shell** — home grid ordered kitchens first and everything else second,
  each group paginated to fit the screen, followed by two reserve pages (Goods
  and Services) for each of 18 cities. Wallpaper parallax, Spotlight pill,
  dock, live status bar, app-open zoom, swipe-to-home, and an app switcher
  whose cards hold the real app rendered small and inert rather than a
  screenshot.
- **Ordering** — 37 businesses, 29 of them orderable. 174 priced items, of
  which 126 sit on a menu you can order from. Per-item notes, one cart across
  all of them. Required/optional choice groups are wired end to end — item
  sheet, cart key, server pricing — but nothing in the catalogue defines one
  yet, so the path is untravelled and the first choice id posted would 400.
- **Checkout** — server re-prices every line, taxes each vendor at its own
  city's rate, splits the order into one ticket per vendor, computes the
  platform fee per vendor (10% by default, `PLATFORM_FEE_BPS`) and stores it.
  A 5% service fee and any tip are charged on the food total. Pickup or
  delivery; delivery adds a flat $3.99 and 12 minutes to the ETA.
- **Orders** — the client polls ticket states every six seconds. Signed in,
  the list is the account's, so it follows the member to another phone.
  Before any kitchen starts, the customer can cancel: the key for that comes
  back only in the answer to the request that placed the order (or the
  signed-in account that placed it), so a kitchen holding the order id cannot
  cancel a competitor's ticket. All or nothing, under a row lock.
- **The kitchen screen** — `/kitchen`, on whatever the counter already has.
  A kitchen signs in with a link the operator issues
  (`tools/issue-kitchen-token.mjs`, `docs/KITCHEN.md`); the key rides in the
  URL fragment, is stored on the device and wiped from the address bar. The
  board shows that kitchen's tickets only — New, Cooking, Ready — with the
  customer's name and number, a new-order banner and chime, and Start, Ready,
  Picked up and Can't make it (with a reason the customer sees). The same
  screen scans a member's pass with the device camera. A kitchen with a live
  key is left alone by `SIMULATE_KITCHEN`, and the customer's screen stops
  calling its statuses a demonstration.
- **Register cards** — `tools/make-register-cards.ts` prints a 4 x 6 card for
  each seated business with a QR for `/?b=<id>&via=qr`. The landing page's
  Scan tab reads it with the camera (BEASTY links only), and a sign-up that
  starts from a card is credited to that business: the kitchen screen shows it
  its own count, the operator sees everyone's.
- **Reserve slots** — every city page carries 24 empty tiles, each one a live
  pitch to the next business. Tapping one opens the reserve screen,
  `POST /api/applications` records who asked, and the lead is emailed to
  `LEAD_EMAIL` on the same Resend key the login codes use, so it reaches a
  human rather than sitting in a table nobody reads. `LEAD_WEBHOOK_URL` can
  also post it to Slack or Discord, but has never been set on the live
  service. The Designs page's Get in touch button lands the same way, in
  `DESIGNS_LEAD_EMAIL`.
- **BEASTY Collab** — the landing page's Collab key (7) carries Glenn's
  invitation to food creators and a four-field form (name, phone, email,
  Instagram). `POST /api/collabs` saves it with the other leads and emails
  `LEAD_EMAIL`, with Reply set to the creator. `tools/audit-collab.mjs` checks
  it end to end without calling Resend.
- **Pages he can send** — `beastypages.com/collab`, `/money` and `/members`
  each open the page they name (the Collab invitation, MAKE $, the membership
  screen), skipping the landing takeover, and each carries its own title,
  description and preview picture so a DM shows what the link is. Every one of
  them has a Share button that hands that link to the phone's share sheet, or
  copies it where there is none. `src/lib/share.ts` holds the three, and the
  server's `SHARE_PAGES` holds their previews.
- **The owners' card** — Contacts opens on "beastypages.com" and lists both
  owners, Glenn (CEO/Founder) and Janelle (Co-CEO/Co-Founder), from `OWNERS`
  in `src/lib/operator.ts`; the landing's contacts panel reads the same list.
  A number there asks "call or text?" (`src/ios/ui/CallOrText.tsx`), with a
  real `tel:` and `sms:` link each. Janelle's email stays blank until her
  mailbox exists.
- **Halal** — a business whose own pages say halal carries
  `dietary: ['Halal']`, which draws the halal mark (`src/ios/HalalMark.tsx`,
  the Arabic word on a green disc, drawn here rather than a licensed image)
  in its page's chips, and search finds it by the word. It states their
  claim, never a certification.
- **Glow** — the paid icon halo is gold by default; `glow: 'pink'` draws it
  pink (Jazz Braids, and Janelle's own page, Nana Casas). A tile with no
  website keeps its red ring inside the halo rather than losing it to the
  animation. `beastyOwner: true` (Janelle's page only) takes an owner off the
  red-ring prospect list whether or not a site is set.
- **Yellow sheets** — blank spots stop at one page's worth, but a sheet runs
  on to a second page when a seated business would otherwise fall past the
  last row, so a short screen never drops one.
- **Calendar** — what the businesses have on, stored server-side. Reading is
  public; writing and deleting need `OPERATOR_TOKEN`.
- **Accounts and membership** — sign-up and sign-in are one screen: a name
  and an email, a six-digit code sent through Resend, and an httpOnly session
  cookie good for 180 days. No passwords, and the code never reaches the
  client. Every member gets a referral code and a QR; each three sign-ups on
  it earn a raffle ticket and a discount, both computed by `rewardsFor()` in
  `src/data/membership.ts`, which the server imports too. Choosing a paid tier
  records it as `pending` and hands back a Stripe Payment Link when one is
  configured; only Stripe's webhook can mark anybody paid. Signed out, the
  first two pages and every business on them stay open, and six doors — more
  cities, the reels, the gallery, the dock switch, the dock buttons, search —
  raise the sign-up prompt instead. Contacts lists real members once signed
  in, and a row opens that member's page: what they starred and liked, and
  nothing private. The member card shows a **pass** — a signed QR that changes
  every minute and verifies once at `POST /api/pass/verify`, so a screenshot
  redeems nothing. Raffle tickets are numbered rows a member holds alone,
  listed on Rewards. Yearly billing is wired and hidden until a yearly price
  exists. SMS codes are built end to end and off until a Twilio account
  exists. `docs/MEMBERSHIP.md` has the whole shape.

## Where the data comes from

This section used to say every brand and price was fake. That was true before
the port and is not true now — leaving it there was dangerous in both
directions, because it invited someone to replace real transcribed data
wholesale while treating unverified data as safe.

- **`src/data/brands.ts` — 17 brands, 68 items.** Transcribed from the
  operator's own hub at goodneighborbuilder.com. The port was checked against
  that site's live bundle at the time — 98 of 98 parseable items matching on
  name *and* price — but nothing in this repo reproduces that diff, so treat it
  as a claim about a past check rather than something you can re-run. **Every
  one of the 17 carries `needsOwnerReview`**: the hub tagged all 25 of its
  entries as food, so a tax-prep firm and a sneaker brand both arrived with
  restaurant menus, and none of these menus has been confirmed by the business
  itself. Entries whose stated trade the ported menu contradicted were dropped
  rather than carried over, and two of them were later re-researched from
  source into `localBrands.ts`. The UI says all of this on the brand's own page.
- **`src/data/localBrands.ts` — 20 businesses, 106 items on offer.** Researched
  individually and read off each business's own site or listing. The file holds
  167 researched rows; the rest stay in the data but are not stocked, so
  widening an offer later is a one-line change rather than another round of
  research. Where a menu came from a delivery platform the prices carry that
  platform's markup, so the brand carries `pricesEstimated` — four do — and
  every screen that shows a price says it needs confirming. Six carry
  `contactOnly` and have no menu at all; five of those six are not restaurants.
  Two more are `quoteOnly` — a menu to read rather than order from, because one
  takes its orders at the counter and the other quotes every job.
- **Dish photos in `public/food`.** Forty-six items carry one, and the two
  provenances are declared rather than hidden: 25 are the vendor's own, saved
  from their own listing; 21 are generated illustrations, used only where the
  vendor publishes no photo, and labelled "Illustration, not their photo" on
  every screen they appear. Never stock, and a generated one is never passed
  off as the vendor's. A picture of food a kitchen does not serve is as much an
  invented fact as an invented price.
- **City wallpapers in `public/wallpapers`** are 28 city files plus a neutral
  placeholder, and they are not all the same kind of thing. Nine are licensed
  photographs, each checked against the licence stated on its own hosting page;
  five of those nine are CC BY-SA, which is copyleft, so those files are not
  exclusively ours and the attribution in `public/wallpapers/CREDITS.md` has to
  travel with them. The other 19 are generated. A city with a page but no
  photograph yet draws the placeholder rather than another town's landmark.
- **No ratings or review counts anywhere.** Inventing them for a real business
  would be fabricating evidence about someone else's trade.

## What is still not real

- Payment. `payment_state` is `mock`; no card is charged, and `stripe` is never
  imported. `PAYMENTS_WIRED` in `server/index.ts` is a source constant, not an
  env var, precisely so that setting `STRIPE_SECRET_KEY` cannot make the app
  believe a charge path exists.
- The kitchen, for every kitchen so far. The screen exists (`/kitchen`) and
  keys can be issued, but none has been given to a business yet, so in
  production every ticket is still walked queued → cooking → ready → collected
  by `SIMULATE_KITCHEN=1`, and the order screen tells the customer so. That
  changes kitchen by kitchen as each one is handed its link.
- `prepMinutes` is an estimate by category, not sourced, and is hedged in the
  UI rather than shown as a fact.
- Paid membership. Accounts are real (above), but no member has ever been
  charged: `tier_status` stays `pending` until Stripe's webhook says otherwise,
  and the live service carries no Payment Links and no webhook secret because
  the Stripe account has not been activated. `docs/STRIPE.md` lists what only
  Glenn can do there.
- The loyalty card and the profile extras. `src/lib/member.ts` (the code you
  show at the counter, its points and check-ins) and `src/lib/profile.ts`
  (avatar, top spot, display name) are still localStorage only — no server,
  no card, nothing scanned. Both partner offers in the catalogue are flagged
  `mock`, meaning the operator asked to see the design and the business has
  agreed nothing; the app labels them on screen rather than letting them read
  as terms.

## Not built yet

- Vendor onboarding and Stripe Connect KYC. `POST /api/applications` captures a
  business that wants a slot, but vendors exist in the DB with
  `payouts_enabled = 0` and no way to complete verification.
- Scheduling, refunds, receipts. (Cancelling is built — the customer before a
  kitchen starts, the kitchen with a reason — and nothing is charged today, so
  there is nothing to refund yet; the refund belongs in the cancel route.)
- SMS sign-in, switched on. The code path is written and audited; on
  2026-09-02 the decision was to stay on email until there are more users.
  `tools/setup-sms-login.sh` turns it on once a Twilio account exists.

## Architecture notes

**Money is always integer cents.** No floats anywhere.

**The server never trusts a client price.** `src/data/brands.ts` is imported by
both sides; the server builds a flat price index from it and recomputes every
amount from item and option ids alone. A cart that posts `price: 1` is charged
the menu price.

**Multi-tenant from the first migration.** Every row that carries money has a
`vendor_id`. Opening the platform to outside trucks is a policy change, not a
schema migration.

**Tax belongs to the vendor, not to the order.** California taxes prepared food
at the seller's location, so the rate sits on `Vendor.taxBps` and a cart
spanning two cities is genuinely taxed at two rates — the order-level figure is
a sum, not a percentage of the whole. Seven rates are live across the
catalogue, from 7.25% up to 10.75%, and they are assigned by matching the
vendor's address against a city table: 15 of the 37 brands hold an address, and
the other 22 fall back to the statewide 7.25%. One vendor's posted prices
already include tax, so checkout adds none and records the embedded amount
instead; that amount is also taken out of the base the service fee, tip and
platform fee are charged on. `src/lib/tax.ts` is called by both the client
display and the server charge, because a customer shown one number and billed
another is the worst version of this bug.

**Icons are drawn, or the vendor's own artwork.** `src/ios/BrandLogo.tsx`
renders a squircle in SVG and either clips the vendor's supplied square tile
into it — 28 of the 37 brands — or draws a monogram from data for the other
nine. A business that joins before it sends a logo still gets a sharp icon
rather than a broken image, which is worse than no logo at all.

**The squircle is real.** `src/ios/squircle.ts` generates a superellipse rather
than using `border-radius`. Side by side the rounded-rect corner looks pinched,
and it is the fastest way to make a fake home screen look fake.

**Fonts are self-hosted.** `-apple-system` first so Apple devices get genuine
SF Pro; Inter is the bundled fallback and is the face every generated mark
uses, so a logo never changes shape depending on the device.

## Kitchen API

A kitchen authenticates with a key the operator issues — `kt_` and 32 random
bytes, shown once, stored only as its SHA-256 — normally through the screen at
`/kitchen` rather than by hand. `docs/KITCHEN.md` has issuing and revoking.

```bash
curl -H "Authorization: Bearer kt_…" localhost:8787/api/orders
curl -X POST localhost:8787/api/tickets/<id>/state \
     -H "Authorization: Bearer kt_…" -H 'content-type: application/json' \
     -d '{"state":"cancelled","reason":"Sold out"}'
```

`GET /api/orders` returns only that vendor's tickets: every order it still has
to work, plus its thirty most recent. Transitions are forward-only
(`queued → cooking → ready → collected`, and `cancelled` from queued or
cooking, with a reason of up to 140 characters) and use compare-and-swap, so
two terminals cannot both advance the same ticket. The boot-seeded `vt_`
tokens are printed in development for the audits and refused in production.

Customers never hit that endpoint — `GET /api/orders/:id` is the public lookup,
and the unguessable order id is the capability. The customer-facing shape omits
`platformFee` and `vendorPayout` entirely. That route is vendor-scoped too: a
kitchen replaying an id from its own queue sees only its own ticket, never a
competitor's lines on the same cart.

## Known gaps before this takes real money

- **No payment.** Refuses to boot with `NODE_ENV=production` unless
  `ALLOW_MOCK_PAYMENTS=1` acknowledges it, so it cannot silently dispatch food
  against no authorization — but the Stripe call itself is still not written.
  The guard used to key off `STRIPE_SECRET_KEY` and failed open the moment an
  operator set one: a key cannot prove a charge path exists, only code can.
- **Rate limiting is in-process.** Order creation is capped at 30/min per IP
  with a burst of 10, and applications at 6/min with a burst of 3; orders are
  also bounded by `MAX_LINES` and `MAX_ORDER_TOTAL`. The token buckets live in
  one process's memory, so this is the first thing to replace if it ever scales
  past a single instance.
- **Kitchen keys are issued by the operator**, from a CLI, one per device and
  at most ten live per kitchen. A business cannot rotate its own key or see
  its devices; that is vendor onboarding, which is not built.
- **The tax table is right today and expires.** The rates in
  `src/data/brands.ts` are transcribed from CDTFA's July 2026 table and were
  last confirmed 2026-08-09, so the old "confirm before payments go on" gate is
  met for the cities listed — but CDTFA republishes quarterly and district
  rates change by local vote, so they have to be re-read rather than carried
  forward on trust. Three holes remain either way. Matching is by address
  substring, so a street can impersonate a city. Twenty-two of the 37 brands
  hold no address and fall back to the statewide 7.25%, which under-collects
  for most Bay Area cities — deliberately the safest wrong answer, since a
  shortfall can be settled and an overcharge already taken off a customer's
  card cannot. And two brands are not in California at all, where a California
  rate is simply the wrong tax; both are contact-only today, so neither can be
  ordered from.
