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
- **Ordering** — 16 fake restaurants, menus with required/optional choice
  groups, per-item notes, one cart across all of them.
- **Checkout** — server re-prices every line, splits the order into one ticket
  per vendor, computes the platform fee per vendor, and stores it.
- **Orders** — ticket states advance on a timer and the client polls them.

## What is deliberately fake

- Every brand, menu and price in `src/data/brands.ts`. Replace wholesale.
- Payment. `payment_state` is `mock`; no card is charged. The Stripe Connect
  split is computed and stored but never submitted.
- The kitchen. A `setInterval` in `server/index.ts` walks tickets
  queued → cooking → ready → collected so the tracking screen has something
  truthful to show. A real kitchen display replaces it.

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
