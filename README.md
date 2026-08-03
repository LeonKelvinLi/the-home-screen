# One Kitchen

A web app that behaves like an iPhone home screen. Each icon is a restaurant's
logo; tapping it opens that restaurant's menu. One cart spans every kitchen, one
checkout pays them all, and each vendor is paid separately.

Built for a ghost-kitchen operator running several brands out of one commissary,
with room for third-party trucks to join later.

## Run it

```bash
npm install
npm run dev        # client on :5173, api on :8787
```

Or build and serve the whole thing from one process:

```bash
npm run build
npm start          # http://localhost:8787
```

## What works

- **iOS shell** — home grid with two pages, wallpaper parallax, Spotlight pill,
  dock, live status bar, app-open zoom, swipe-to-home, and an app switcher with
  live (not screenshotted) cards.
- **Ordering** — 25 real businesses, menus with required/optional choice
  groups, per-item notes, one cart across all of them.
- **Checkout** — server re-prices every line, splits the order into one ticket
  per vendor, computes the platform fee per vendor, and stores it.
- **Orders** — ticket states advance on a timer and the client polls them.

## Where the data comes from

This section used to say every brand and price was fake. That was true before
the port and is not true now — leaving it there was dangerous in both
directions, because it invited someone to replace real transcribed data
wholesale while treating unverified data as safe.

- **`src/data/brands.ts` — 20 brands, 80 items.** Transcribed from the
  operator's own hub at goodneighborbuilder.com. Verified by diffing against
  that site's live bundle: 98 of 98 parseable items match on name *and* price
  exactly. Seven of these businesses look, by name, like they are not food
  businesses at all; those carry `needsOwnerReview` and the UI says so.
- **`src/data/localBrands.ts` — 5 businesses, 45 items.** Researched
  individually and read off each business's own site or listing. Where a menu
  came from a delivery platform the prices carry that platform's markup, so the
  brand carries `pricesEstimated` and every screen that shows a price says it
  needs confirming. Two of these are not restaurants and have no menu at all.
- **Dish photos in `public/food`** are the vendors' own, saved from their own
  listings. Never stock, never generated: a picture of food a kitchen does not
  serve is as much an invented fact as an invented price.
- **No ratings or review counts anywhere.** Inventing them for a real business
  would be fabricating evidence about someone else's trade.

## What is still not real

- Payment. `payment_state` is `mock`; no card is charged, and `stripe` is never
  imported. `PAYMENTS_WIRED` in `server/index.ts` is a source constant, not an
  env var, precisely so that setting `STRIPE_SECRET_KEY` cannot make the app
  believe a charge path exists.
- The kitchen. No kitchen display exists and no vendor has been issued a token,
  so in production tickets stay `queued`. `SIMULATE_KITCHEN=1` walks them
  queued → cooking → ready → collected for a demo, and shouts in the log that
  it is doing so.
- `prepMinutes` is an estimate by category, not sourced, and is hedged in the
  UI rather than shown as a fact.

## Not built yet

- Accounts and sign-in. Orders are keyed to a phone number typed at checkout.
- Vendor onboarding and Stripe Connect KYC. Vendors exist in the DB with
  `payouts_enabled = 0` and no way to complete verification.
- Delivery addresses, scheduling, cancellation, refunds, receipts.
- Any authentication on the API — see the security notes below.

## Architecture notes

**Money is always integer cents.** No floats anywhere.

**The server never trusts a client price.** `src/data/brands.ts` is imported by
both sides; the server builds a flat price index from it and recomputes every
amount from item and option ids alone. A cart that posts `price: 1` is charged
the menu price.

**Multi-tenant from the first migration.** Every row that carries money has a
`vendor_id`. Opening the platform to outside trucks is a policy change, not a
schema migration.

**Icons are SVG, not images.** `src/ios/BrandLogo.tsx` renders each mark from
data, so the catalogue is one JSON payload and icons stay sharp at any size.
When vendors upload real artwork this component gains an `imageUrl` branch.

**The squircle is real.** `src/ios/squircle.ts` generates a superellipse rather
than using `border-radius`. Side by side the rounded-rect corner looks pinched,
and it is the fastest way to make a fake home screen look fake.

**Fonts are self-hosted.** `-apple-system` first so Apple devices get genuine
SF Pro; Inter is the bundled fallback. Logo faces are named explicitly so a mark
never changes shape depending on the device.

## Kitchen API

Each vendor gets a bearer token, printed on boot in development:

```bash
curl -H "Authorization: Bearer vt_…" localhost:8787/api/orders
curl -X POST localhost:8787/api/tickets/<id>/state \
     -H "Authorization: Bearer vt_…" -H 'content-type: application/json' \
     -d '{"state":"cooking"}'
```

`GET /api/orders` returns only that vendor's tickets. Transitions are
forward-only (`queued → cooking → ready → collected`) and use compare-and-swap,
so two terminals cannot both advance the same ticket.

Customers never hit that endpoint — `GET /api/orders/:id` is the public lookup,
and the unguessable order id is the capability. The customer-facing shape omits
`platformFee` and `vendorPayout` entirely.

## Known gaps before this takes real money

- **No payment.** Refuses to boot with `NODE_ENV=production` unless
  `STRIPE_SECRET_KEY` is set, so it cannot silently dispatch food against no
  authorization — but the Stripe call itself is still not written.
- **No customer accounts.** Order history is the set of ids on the device.
- **No rate limiting** on order creation. Bounded by `MAX_LINES` and
  `MAX_ORDER_TOTAL`, not by request rate.
- **Vendor tokens are static** and printed to stdout in dev. Fine for a
  commissary, not for self-serve vendor onboarding.
- **Tax is one flat 8.75%.** Real marketplaces need per-vendor rates, since each
  vendor is usually seller of record for their own lines.
