# BARK points: recruiting, paperwork and cash-outs

Leon, 26 October 2026: "paying the $60 opens the /join paperwork, points credit monthly while recruiting is active, and cash-outs only after Glenn approves the packet." Built in `server/bark.ts`, with the rules from Schedule A (`shared/affiliate-terms.ts`). Each affiliate's own terms apply when they have them (their application's overrides on the latest published version). Otherwise the latest published version applies, or the defaults if none is published.

## The flow

1. **Every member already has links.** At sign-up they get a code, a friend link (`beastypages.com/?ref=CODE`) and a business link (`beastypages.com/r/code`), on Profile → Earn and on the Affiliate dashboard (now also at `beastypages.com/affiliate`). The links count clicks, sign-ups and businesses for everyone. Only recruiters earn BARK points.
2. **They become a recruiter.** Members page → BEASTY Recruiter, $60 a month through Stripe (docs/STRIPE.md). The webhook makes them `active` and logs the change in `recruiter_history`.
3. **Paying opens their paperwork.** The same webhook creates their `/join` application from their account (`openRecruiterApplication` in `server/onboarding.ts`; CRM history: "Paid the recruiter upgrade, which opened their paperwork"). No invite is needed; Glenn's invites still work. A recruiter who paid before this shipped gets their application the first time they open `/join`. Someone who has not paid sees "Become a recruiter first". The recruiter card on Members then says "Do your paperwork to get paid" until it is approved.
4. **Points are credited month by month** into `bark_points`, one row per paid month:
   - **A member they referred** earns them `pointsPerUser` (10) for each paid month of a pass: `userMonthsBiggie` (2) on BIGGIE PASS, `userMonthsBeasty` (3) on BEASTY PASS. A month is Stripe's `invoice.paid` with money in it and a reason of `subscription_create` or `subscription_cycle`. A $0 month, a proration from switching passes, and the recruiter's own $60 earn nothing. The invoice id makes it once only. A first invoice that arrives before the checkout linking its customer waits in `bark_waiting_invoices` and is credited when the checkout lands.
   - **A business they referred** earns `pointsPerBusiness` (10) for each of its first `businessMonths` (6) paid months. Businesses pay BEASTY outside Stripe, so the team records each month in the CRM ("Paid month N" on the affiliate's page). It counts only with its initiation fee on a won deal.
   - **Only referrals made while recruiting count**: a member who joined, or a business that asked for a spot, while the referrer was active, not before they paid and not while paused. Months still owed on earlier referrals keep coming during a pause. After the $60 is cancelled nothing more is credited.
5. **Refunds and disputes.** `charge.refunded` (the whole amount) or `charge.dispute.created` within 60 days voids that month's points, matched by its invoice or payment intent. The team can also remove a credit in the CRM, with a reason, for example a business refund. Points taken back after a payout come off the next cash-out. The balance shown never goes below zero.
6. **Cash-outs** (`bark_cashouts`): only once their `/join` application is **approved** (Glenn countersigns and approves in the CRM). From `minRedemption` (100) in steps of `redemptionStep` (50), one request at a time, from the Affiliate dashboard. It emails `LEAD_EMAIL`, shows at the top of CRM → Affiliates, and Glenn pays it by direct deposit from the signed packet within `payoutDays` (15), then marks it paid. Declining needs a note, which the affiliate sees.

## Where it shows

- **Affiliate dashboard** (`src/apps/AffiliateApp.tsx`, `BarkPoints`): the balance in points and dollars, the one next step (become a recruiter, finish the paperwork, how many points to go, or Cash out), and the latest credits with referred members' names masked. The old "cash rewards: not switched on" tile is gone.
- **Members** (`src/apps/MembersApp.tsx`, `RecruiterCard`): the paperwork step under the recruiter status.
- **CRM** (`src/crm/bark.tsx`): on an affiliate's page, their balance, open cash-out (Mark paid / Decline), businesses with "Paid month N", and every credit with Remove. On the Affiliates list, the cash-outs still to pay.

## Stripe

The webhook `beastypages-memberships` has listened to `invoice.paid`, `charge.refunded` and `charge.dispute.created` since 26 October 2026, about 6:30 pm, along with its four membership events (seven in all, checked in the dashboard after saving). Adding them did not change the signing secret. Live: `f608b5a`.

## Proof

`tools/audit-bark.mjs`: 70 checks against a local server with signed local webhooks and made-up prices, no Stripe key, no real money, including the phone and CRM screens (`.verify/bark-*.png`). `audit-membership-manage.mjs`, `audit-affiliate.mjs` and `audit-affiliate-terms.ts` (140) still pass. `audit-onboarding.mjs` times out at the test-mode signing step, on the last pushed commit too, so that failure predates this.

## Not built

- **Promotion days** (Schedule A: "points may be multiplied up to 3x") have no way to be announced yet, so no multiplier is applied.
- Percent-based terms (`rewardKind: 'percent'`) credit nothing automatically; every affiliate is on monthly points today.
