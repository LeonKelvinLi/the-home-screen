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
| Taking $39 or $59 | **not connected** — see below |

`tier_status` never leaves `pending` on its own. Nothing in this codebase may
mark a member paid; only a payment provider may, and none is wired.

## Turning payments on

Two Stripe Payment Links, one per tier, then two environment variables:

    STRIPE_PAYMENT_LINK_PASS=https://buy.stripe.com/xxxxxxxx
    STRIPE_PAYMENT_LINK_DIAMOND=https://buy.stripe.com/yyyyyyyy

The server appends `?client_reference_id=<member id>` to whichever link it hands
back. **That parameter is the whole join** — without it a completed payment
cannot be matched to a member and `tier_status` could never move off `pending`.

Still to build after the links exist: a `POST /api/stripe/webhook` that verifies
the signature, reads `client_reference_id`, and sets `tier_status = 'active'`.
Until it does, a member who pays stays `pending` and the app will not show them
a paid perk — which is the correct way round to be wrong.

## The two currencies, and why they are computed apart

Both come off one referral count and they stop at different points:

* **Money is capped.** $10 off for every 3 sign-ups, to a ceiling of $30 on
  Biggie's PASS (9 sign-ups) and $40 on DIAMOND (12).
* **Raffle tickets are not.** One per 3 sign-ups, forever. His example: "refer
  30 newly signed members and receive 10 Raffle tickets."

`rewardsFor()` in `src/data/membership.ts` owns both, and the server imports the
same function. Two copies of that arithmetic disagreeing about somebody's money
is the kind of bug that gets noticed from outside.

## No passwords, and no email-only sign-in

He asked for name, email, Instagram and an optional phone. So the session cookie
set at sign-up **is** the credential, and it follows that:

* this device stays signed in;
* another device cannot, and is told why;
* an existing email is **refused**, not signed in.

That last one is deliberate and must stay. "Type your email to sign in" with no
password would let anybody take over any member — including their referral
credit and their raffle tickets — by guessing an address. The fix is email
verification, not a shortcut.

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
