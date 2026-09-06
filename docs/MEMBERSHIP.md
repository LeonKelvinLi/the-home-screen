# Accounts, memberships and referrals

Built 2026-08-24 from his brief. Three things that hang together: a free account
that unlocks the app, a paid tier on top of it, and a referral code that pays
out in two different currencies.

## What is wired, and what is not

| | |
|---|---|
| Free sign-up, session, gate | **working** |
| Referral codes, QR, credit | **working** |
| Raffle tickets | **working** |
| Discount arithmetic | **working** |
| Email codes (OTP) | **live** — sent through Resend from the verified beastypages.com domain since 2026-08-29 |
| Sign-in on a second device | **working** |
| Taking $39 or $59 | **wired** — needs Stripe keys, see below |
| Reissuing a login code | **working** — the code step can send another, on a 30s cooldown |

`tier_status` never leaves `pending` on its own. Nothing in this codebase may
mark a member paid; only a payment provider may, and none is wired.

## Turning payments on

Two Stripe Payment Links, one per tier, then two environment variables:

    STRIPE_PAYMENT_LINK_PASS=https://buy.stripe.com/xxxxxxxx
    STRIPE_PAYMENT_LINK_DIAMOND=https://buy.stripe.com/yyyyyyyy

The server adds two parameters to whichever link it hands back:

| Parameter | Why |
|---|---|
| `client_reference_id` | The member id. **This is the whole join** — without it a completed payment cannot be matched to a member and `tier_status` could never move off `pending`. |
| `prefilled_email` | The address the member already proved with a code. Saves a step, and stops a receipt landing under a different address that cannot be matched back. |

They are added with `URL`, not string concatenation, so a Payment Link that
already carries a query string — Stripe's dashboard hands those out — keeps it.
Appending `?…` to a link that already had one produces a single unreadable
value and a payment that can never be matched.

`paymentsConfigured` rides on **every** member response, not just the one that
hands out a link, because the membership screen has to know whether it can take
a payment before anybody taps. It used to learn that only from the reply to a
tap, so it rendered "not connected yet" underneath two working buttons.

### The webhook

    STRIPE_SECRET_KEY=sk_live_xxxxxxxx
    STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx

Point Stripe at `POST /api/stripe/webhook` for `checkout.session.completed`,
`customer.subscription.deleted` and `invoice.payment_failed`.

**Without both secrets the route is not registered at all.** An unverified
webhook is a public endpoint that grants paid memberships to anybody who can
POST JSON, so it does not fall back to trusting the body — it does not exist.

`checkout.session.completed` also stores the Stripe **customer id**, and that is
load-bearing: subscription events carry no `client_reference_id`, so the customer
is the only durable link back. Without it a cancellation could never be matched
and memberships would stay `active` forever after the money stopped — the app
telling an affiliate to honour an offer nobody is paying for.

**One trap already caught here:** a global `express.json()` consumed the request
body before signature verification could see the raw bytes, so every correctly
signed webhook failed with "payload must be a string or Buffer". Real payments
would have sat at `pending` forever while a forged-webhook test passed happily.
The webhook path is excluded from the JSON parser, and `tools/audit-payments.mjs`
now asserts **both** directions — forgeries refused *and* real events accepted.

## The two currencies, and why they are computed apart

Both come off one referral count and they stop at different points:

* **Money is capped.** $10 off for every 3 sign-ups, to a ceiling of $30 on
  Biggie's PASS (9 sign-ups) and $40 on DIAMOND (12).
* **Raffle tickets are not.** One per 3 sign-ups, forever. His example: "refer
  30 newly signed members and receive 10 Raffle tickets."

`rewardsFor()` in `src/data/membership.ts` owns both, and the server imports the
same function. Two copies of that arithmetic disagreeing about somebody's money
is the kind of bug that gets noticed from outside.

## One-time codes

No passwords. A six-digit code emailed to the address proves it belongs to them,
which is what makes signing in on a **second device** safe — the thing that had
to be refused before this existed.

    RESEND_API_KEY=re_xxxxxxxx
    OTP_FROM_EMAIL=beasty@yourdomain.com

**With no key set, the code is written to the server log and delivered nowhere.**
It is never returned in an HTTP response, not even in development — a response
carrying the code would be a complete authentication bypass for anyone who can
read a network tab, and "it is only in dev" is exactly how that ships. The
sign-up screen says plainly when delivery is not configured.

Properties `tools/audit-otp.mjs` holds to:

* the code never reaches the client;
* no member row exists until the address is proved, so an abandoned sign-up
  leaves no half-account squatting on the email's UNIQUE index;
* one use only;
* five wrong guesses kill the code — **including for the real one arriving
  afterwards**;
* **no membership oracle.** `/api/members/start` answers identically whether the
  address is registered or not. That one is not theoretical: an earlier version
  required a name only for new sign-ups, so a one-character name returned 400
  for an unknown address and 202 for a registered one. Anybody could have typed
  addresses in and learned who is a member. The name is now validated before
  anyone is looked up.

## The gate fails OPEN

If `/api/members/me` cannot be reached, every visitor is let through. The gate is
a sales prompt, not a security boundary — nothing behind it is private — so an
API outage must not lock the directory. `fetchAccount` returns three answers, not
two: an account, `null` for a real 401, and `'offline'` when it could not ask.

## What is behind the gate

His list, and only his list: the right arrow to more cities, the reels, the
gallery, the dock 1/2/3 switch, the four dock buttons, and search. The first two
flagship pages and all 48 businesses on them stay open to anyone.
`tools/audit-gate.mjs` checks both halves — a gate that also shut the directory
would pass a "is it locked" test and destroy the thing the app is for.
