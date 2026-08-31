# Stripe: what is built, and what only Glenn can do

**The account cannot take money yet, and no code change will fix that.**
`acct_1U9vyKLnwdL8dIyO`, display name BEASTY, US/USD. The API reports
`charges_enabled: false`, `payouts_enabled: false`, `details_submitted: false`
— Stripe has not been given the business details, so it bounces the dashboard
into onboarding and refuses live charges.

Everything that does NOT require those details is built and proven, in test
mode, so that activating the account is the only step left.

## Built (test mode, 2026-08-29)

| | |
|---|---|
| BIGGIE PASS | `prod_VAGrFU4rVSnJiJ` · `price_1U9wK4LnwdL8dIyO0CNFX24T` · $39.00/month |
| BEASTY PASS | `prod_VAGrb6kicD6H5E` · `price_1U9wK5LnwdL8dIyOeC8H8tJJ` · $59.00/month |
| Payment link, pass | `https://buy.stripe.com/test_cNiaEYbeSbuscvvcWe9Zm00` |
| Payment link, diamond | `https://buy.stripe.com/test_3cIfZigzcbus0MNg8q9Zm01` |
| Webhook | `we_1U9wKRLnwdL8dIyOYfDkXQm9` → `https://beastypages.com/api/stripe/webhook` |

The prices are read off `TIERS` in `src/data/membership.ts`, which is Glenn's
own numbers, and each product carries `metadata.tier_id` so the mapping back to
a tier is written down rather than inferred from the name.

Both links redirect to `https://beastypages.com/?joined=1` on completion and
accept promotion codes — the promo field is what FIRST48 would use if he ever
runs it on memberships. See `docs/AFFILIATE-PRICING.md`.

The webhook subscribes to exactly the three events the server acts on:
`checkout.session.completed`, `customer.subscription.deleted`,
`invoice.payment_failed`.

## Proven, not assumed

`tools/audit-membership-billing.mjs` runs the whole money path against a real
server and a real database, and it passes:

- each tier hands back its OWN link, carrying `client_reference_id` — the only
  join between a payment and a member row;
- choosing a tier leaves the member `pending`, so nothing reads as paid before
  anybody has paid;
- an unsigned webhook, a wrongly-signed one and a day-old signature are all
  refused 400 and change nothing — this endpoint is public and grants paid
  status, so that matters more than the happy path;
- a correctly signed `checkout.session.completed` activates the member and
  stores the Stripe customer id;
- `customer.subscription.deleted` lapses them, matched on that stored customer
  id, and another customer's cancellation leaves them alone.

Run it with a test key. It refuses to run against a live key at all — it
fabricates payment events, which must never be pointed at real money:

```bash
set -a; . ~/.beasty-stripe-test.env; set +a
node tools/audit-membership-billing.mjs
```

## What is left, and it is Glenn's

1. **Activate the account.** Stripe wants the business and the representative:
   EIN, business address, the representative's legal name, date of birth, home
   address and SSN, and a bank account for payouts. **Nobody should hand those
   to an assistant, and none of them are in this repo or in any log.** Glenn
   enters them himself at `https://dashboard.stripe.com/`.
2. Once `charges_enabled` is true, recreate the five objects above in **live**
   mode with one command:

   ```bash
   export STRIPE_SECRET_KEY=sk_live_...     # from the live API keys page
   node tools/stripe-setup.mjs              # shows what it would do
   node tools/stripe-setup.mjs --write      # makes it
   ```

   It reads the prices from `TIERS` in `src/data/membership.ts` rather than
   carrying its own copy, so the amounts cannot drift from the screen that
   shows them. It is idempotent by metadata — re-running finds what it made and
   leaves it alone — and it REFUSES to build live objects on an account that
   cannot charge, which would otherwise leave unusable links to clean up.

   It writes the four values to `.stripe-live.env` (chmod 600, gitignored)
   rather than printing them, because one of them is the webhook signing
   secret. Delete that file once the values are on Render.
3. Set **three** environment variables on the Render service
   (`srv-d9nusqdaeets73cnca50`) and **trigger a deploy** — the Render API does
   not restart a service when its environment changes, so a value set without a
   deploy is a value the running process never sees:
   - `STRIPE_WEBHOOK_SECRET` (from the live webhook endpoint)
   - `STRIPE_PAYMENT_LINK_PASS`
   - `STRIPE_PAYMENT_LINK_DIAMOND`

   **NOT the secret key.** The server never calls the Stripe API; its only use
   of the SDK is `webhooks.constructEvent`, an HMAC over the raw body against
   the SIGNING secret. Verified rather than assumed: it passes with a
   placeholder key, and the whole money-path audit passes with no key in the
   environment. A full-access live key sitting in a public web service that
   makes no API calls is something to leak, not something to need. The live
   secret key is for the one-off setup run in step 2 and should not outlive it.

   **Revealing that key cannot be automated, by design.** Stripe refuses to
   uncover a live secret key without a real human gesture — a coordinate click,
   a keyboard press and an in-page `.click()` all leave it masked. Somebody has
   to press "Reveal live key" themselves. That is the account protecting
   itself; do not go looking for a way around it.
4. Flip `PAYMENTS_WIRED` in `server/index.ts` only when the ORDER path is
   wired. It is a source constant, not an env var, precisely so that setting a
   Stripe key cannot convince the app a charge path exists that nobody wrote.
   Memberships do not need it — they go through Payment Links, not the cart.

**Do not put the test keys on the live service.** beastypages.com is open to
the public; test keys there would let anyone pay with `4242 4242 4242 4242` and
be granted a real membership.
