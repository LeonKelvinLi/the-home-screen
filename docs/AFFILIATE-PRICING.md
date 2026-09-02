# What a business pays for a spot — his proposal, not yet built

Glenn put this to Leon on 2026-08-29 and Leon said "That should work, that's a
good idea" and "Keep them noted too". **Nothing in the app sells an affiliate
spot yet**, so this is a record of the offer as he described it, not a
description of anything that runs. It is here so the numbers survive the thread.

## The offer

His words, from the thread:

> What if we did a $69 initiation and $39 annual?

> Promo Code: FIRST48
> We can recruit the first 48 for each city and give them this promo code for 9
> months free when they purchase the first 3.
> $39x3=$117.00
> $69+117=$186.00

> $351 Savings

> $186/12=$15.50 month basically — for the first year for any business

## The arithmetic, checked

It works out, and checking it settles what the $39 actually is:

| | |
|---|---|
| Initiation, once | $69 |
| Three months up front | 3 × $39 = $117 |
| **Paid in year one** | **$186** |
| Nine months free | 9 × $39 = $351 |
| A full year at list | 12 × $39 = $468 |
| Saving against list | $468 − $117 = **$351** |
| Effective monthly | $186 ÷ 12 = **$15.50** |

**$39 IS A MONTHLY FEE, not an annual one.** He wrote "$39 annual" in the first
message, and every number after it is monthly: nine free months only save $351
if a month is $39, and $15.50 is only the effective rate if the year would
otherwise cost $468. Worth confirming with him in one sentence before it is
printed anywhere a business can read it, because the two readings differ by a
factor of twelve.

## The tiers, 2026-09-02

Glenn wrote three affiliate tiers and asked for a revision; Leon sent one back
the same hour and Glenn liked it. That text is what the Members page shows
under **Business** (`src/data/affiliateTiers.ts`).

| Tier | Name | Price |
|---|---|---|
| 1 | BEASTY Affiliate Member | Free |
| 2 | Biggie's Member | $69 |
| 3 | BEASTY Member | $99, optional icon glow +$6 |

Leon proposed "$59–$69" for tier two so all three "feel equally compelling".
Glenn kept $69 on purpose: "I based the prices comparable to buying popcorn at
the theater. When you price tier 2 closer to tier 3 it gives tier 3 more of a
value ... It makes the business think, it's only 30 more bucks." Also his:
"it gives us room to send out promo codes for $20 or $30 off", "$9 from every
membership activation is deducted for the foundation", and "an assistance
program to new up-and-coming businesses with an initial discount for their
first 3 or 6 months membership". Leon: "Got it".

So $69 and $99 stand. The promo codes and the assistance programme are ideas,
not terms, and are not on the page. The $9 is on the Members page as his
statement of where the money goes.

**How this relates to the $69 + $39 proposal above:** the $69 initiation is
now tier two's price; the $39 monthly does not appear in the tier text at all.
Nothing sells a spot in the app yet, so no arithmetic depends on which of the
two is meant.

## What is not settled

- **What period $69 and $99 cover.** The tier text carries no "per year" or
  "per month" and none was said; the page prints the figures exactly as
  written. Confirm before a checkout is attached, because a period is the
  difference between $69 once and $828 a year.

- Whether the 48 is per city or across all of them. He wrote "the first 48 for
  each city", which is 48 × the number of cities.
- What happens in year two — the promo covers the first year only.
- The food-review add-on: "whatever that girl charges for a food review, we can
  add it onto that price. So then their girl makes her money from that
  recruitment as well." No amount was named.
- The Instagram button on a partner page is the first thing he has described as
  a higher-tier feature (2026-08-29). Which tier, and what else is in it, is
  not decided. See `instagram` in `src/data/localBrands.ts`.
- Phone-number verification (2026-09-02). Leon asked whether sign-in should
  go back to a texted code; Glenn: "Maybe the phone number is easier? And
  they're obligated to enter their #. But then you have to include a
  disclaimer that we reserve the right to send them promotional texts". The
  disclaimer is in the join form under the number box already, shown only
  when texting is on. Texting is off because there is no Twilio account:
  `TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... bash tools/setup-sms-login.sh`
  turns it on once one exists.
- The BARK point denomination. The Careers page (key 9, now MAKE $) says 3
  points per referred user, 6 per business, 1 point = $1, redeemable from 100.
  Glenn's own arithmetic in the thread matches it: 3 points is 10% of the $39
  fee after the $9 to the foundation, 6 is 10% of the $69 initiation after the
  same $9. On 2026-09-01 Leon asked for "multiples of 10, like 50-100 pts, so
  it feels more rewarding than 3" and "$1 = 10 pts"; Glenn replied "Ok so
  change to 5 & 10?", the two did not agree, and it went to a phone call. The
  morning after (2026-09-02) Glenn sent his note back with the programme
  renamed BEASTY Affiliate Referral Klub (BARK) and the same 3 / 6 / $1 lines
  under it, and Leon approved the note. So the numbers stand as written and
  only the name changed. Settled in the thread and NOT on the page: the
  commission stays at 10% ("It was always initially 10%"), promotional
  double- or triple-point days on slow days and holidays, and a bonus for
  hitting a saved-points goal ("if they managed to save 300 points, we would
  double it"). Those go on the page once Glenn writes the terms.
