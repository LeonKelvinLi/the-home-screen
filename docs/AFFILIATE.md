# The affiliate dashboard

Glenn asked for a "user/affiliate dashboard" for the meeting in the week of 29 September
2026. Every member is an affiliate: they have had a referral code since the day they
joined. The dashboard is `src/apps/AffiliateApp.tsx`, opened from the card on Profile.
Its numbers come from `GET /api/affiliate/me`, built in `server/affiliate.ts`. The test is
`tools/audit-affiliate.mjs`.

## The chain

```
member (affiliate) ── code ──> click ──> sign-up ──> active            (people)
                  └─ /r/<slug> ──> visit ──> Reserve a Spot ──> signed  (businesses)
                                                     └──> reward (raffle tickets today;
                                                          affiliate_rewards when cash starts)
```

| Step | Where it is recorded | Written by |
|---|---|---|
| Code | `members.referral_code` | sign-up (`POST /api/members/verify`) |
| Click on the friend link | `referral_clicks` | `POST /api/affiliate/click`, sent once by the page a `?ref=` link opens |
| Person brought | `members.referred_by` | sign-up, new accounts only |
| Active | the same test as the CRM's "activated" (`ACTIVATION`, `server/analytics.ts`) | the member's own actions |
| Click on the business link | `crm_referral_visits` | `GET /r/<slug>` (`server/crm/routes.ts`) |
| Business referred | `crm_opportunities.referrer_id` | Reserve a Spot, through the CRM's first-touch cookie |
| Signed | the CRM stage (Won, Onboarding, Active customer) | the team, in the CRM |
| Raffle ticket | `raffle_tickets` | every third person brought |
| Cash or points | `affiliate_rewards` (empty) | nothing yet: BEASTY does not pay affiliates yet |
| Something to look at | `referral_flags` | sign-up, when a code is used on its owner's own device |

## What counts

These are the definitions the server computes and the page prints; the page adds nothing.

- **Click.** One device opening the member's friend link (`/?ref=CODE`, or its QR code),
  counted once per device per California day. Not counted: the member's own devices (any
  device they have signed in on), anyone signed in, search robots, browsers sending Global
  Privacy Control (there is no device to count), and codes that belong to nobody. Clicks
  are counted from 30 September 2026; before that nothing recorded them. Business-link
  clicks are the CRM's visits, one per device per day.
- **Person brought (referred user).** A new account made with the member's code. The first
  code wins and never changes; signing in to an existing account never credits anyone; an
  account made on the member's own device with their own code credits nobody and is flagged.
- **Active (qualified user).** A person brought who liked, saved or shared a business,
  ordered, used their pass at a shop, or brought a friend of their own: the CRM's
  "activated", from the same list.
- **Business referred.** A Reserve a Spot request made after opening the member's business
  link. The first link a visitor opens in 90 days wins, and the CRM keeps who changed it.
- **Signed (converted business).** The business's CRM stage is Won, Onboarding or Active
  customer.
- **Pending.** People brought who are not active yet, and businesses still being worked.
- **Conversions.** Active people plus signed businesses.
- **Sign-up rate.** People brought since clicks were counted, divided by friend-link clicks
  in the same window (capped at 100%). Blank when there were no clicks.
- **Business win rate.** Of the businesses referred in the window, the share now signed.
- **Rewards.** Real ones only: raffle tickets (one per three people, uncapped) and the
  membership discount ($10 per three people, capped by tier), both from
  `src/data/membership.ts`. Cash and points read `affiliate_rewards`, which is empty, and
  the page says "Not switched on yet".

## Privacy

A member sees only their own dashboard. People they brought are shown by first initial
("F•••"), with the date they joined and whether they are active; never a name, email,
phone or account id. Businesses are shown by name, city and status, which the business
itself gave when it asked for a spot.

## The business link

Every member's business link is `beastypages.com/r/<their code in lower case>` (or the slug
of the CRM row they already have, like a partner's). No CRM row is written until someone
actually opens it: then `ensurePerson` makes one with role "none", which grants nothing in
the CRM, so the visit and the Reserve a Spot request are credited the way every referrer's
are, and the CRM's Referrers view shows the member alongside everyone else.

## For the admin dashboard to come

`GET /api/admin/affiliates` (operator key) lists every member with anything to show: people
brought, clicks, businesses, and flags, with the latest flags. The CRM's Referrers view
already shows business referrals per person. Suspicious activity to add later: bursts of
clicks from one network, many sign-ups from one device, businesses that never answer.

## Paying affiliates later

`affiliate_rewards` holds one row per affiliate per source (a person or a business) per kind
(points or cash), with a status (pending, earned, paid, void) and a paid date; the unique key
means the same person or business can never be paid for twice. The dashboard already sums
it into pending, earned and paid, and flips from "Not switched on yet" when
`program.cashRewards` is turned on in `server/affiliate.ts`.
