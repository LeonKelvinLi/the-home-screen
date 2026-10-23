# Affiliate terms form — Schedule A (22 October 2026)

Leon asked for the agreement's money terms to be fillable with percentages,
"the same way the TDS app fills a form" (Noctilucenty/loqol-tds). This is that
design and its build. **Nothing here is agreed with Glenn yet.** His own draft
of the terms (an iMessage screenshot, 21 Oct 1:34 pm) has not reached the Mac:
Messages on this Mac has nothing from 21 Oct. So every figure below is a
default an admin edits, and each field says where its default came from.

## The pieces

| Piece | Where | What it does |
|---|---|---|
| The model | `shared/affiliate-terms.ts` | Fields, defaults, chapters, arithmetic, validation, contradiction rules, the printed wording. One copy, used by the CRM, the server, the PDFs and the audit, so a preview cannot disagree with a PDF. |
| The interview | `src/crm/affiliate-terms.tsx`, CRM → Affiliates → **Money terms** (`#/affiliate-terms`) | One chapter at a time, every answer saved as it changes, live previews, review screen, publish. |
| One affiliate | the **Money terms** section on an affiliate's CRM page | Their own figures (overrides), their PDF, copy buttons for the DocuSeal packet. |
| Server | `server/affiliate-terms.ts`, `server/affiliate-terms-pdf.ts` | Draft, versions, history, overrides, Schedule A PDFs (pdf-lib). |
| DocuSeal page | `tools/build-affiliate-schedule-a.ts` | The one-page Schedule A for the packet template: printed terms, a Changes field BEASTY prefills, the Affiliate's initials. |
| Audit | `tools/audit-affiliate-terms.ts` | The arithmetic, every rule, the PDF text, and the API on a throwaway database. |

## How it works like the TDS app

| TDS app | Here |
|---|---|
| Talk about questions that are hard to understand; tap the ones that are only long. | Figures (fees, %, points, days) are **tapped**: they print on a contract, so they are typed, never dictated. Clauses and the questions whose meaning is the hard part (what the $9 comes out of, before or after the $9, how long commission lasts, what "double it" means) are **talk it through**: the explanation is open from the start, and the clause boxes have a **Say it** button. That uses the browser's own dictation, which is free and only shows where the browser supports it. There is no paid voice API. |
| "What does this mean?" in three layers: plain English, an example, then the exact legal words. | The same three layers. The last one is the sentence that will print in Schedule A, **with the current figures in it**. |
| Chapters and a time estimate, not "38 of 150 fields". | 7 chapters: What a business pays, The foundation's $9, FIRST48, Commission, BARK points, Getting paid, Review. Each shows "Chapter n of 7, about x min left". |
| Every answer saves the moment it changes; `answers` plus an append-only `answer_events`. | `affiliate_terms_draft` (current value, with a revision number so a second window never silently loses) plus `affiliate_terms_events` (old value, new value, tap or talk, who, when). |
| Contradictions are queued and brought back at review, both answers shown. Hard ones block; soft ones offer "Both are right, leave them", and stay settled. | Exactly that. An accepted soft flag stays accepted until one of its figures changes. |
| Review screen, then a filled PDF. | Review screen (out-of-range figures, contradictions, everything not settled with Glenn, the schedule as it prints), **Open filled PDF**, and **Publish as version N**. |

## Fields and defaults

| Chapter | Field | Default | Source | Settled? | Per affiliate? |
|---|---|---|---|---|---|
| Prices | Initiation fee | $99 | Leon, 23 Oct: "$99 initiation" (the Members page figure) | Yes | no |
| | Monthly fee | $39 | 29 Aug; Biggie's Member, 3 Sep | yes | no |
| Foundation | Amount | $9 | Glenn, 2 Sep | yes | no |
| | Taken from | every payment | his "activation" vs the 3-point arithmetic | **No** | no |
| FIRST48 | Code / paid / free / cap | FIRST48 / 3 / 9 / 48 | 29 Aug | yes | no |
| | Cap scope | per city | his words | **No** | no |
| Commission | Rate | 10% | "It was always initially 10%" | yes | **yes** |
| | Before or after the $9 | after | his 3- and 6-point arithmetic | yes | no |
| | How long | while the business pays | not discussed | **No** | **yes** (plus months) |
| | Another party's share | 0% | food-review idea, no figure | **No** | no |
| BARK | Points per user / business | 3 / 6 | Careers page, BARK note | yes | **yes** |
| | Point value | $1 | Careers page | yes | no |
| | Minimum redemption | 100 points (cannot be lower) | Careers page | yes | **yes** |
| | Promotion days / max multiplier | yes / 3x | thread | yes | no |
| | Which days (clause) | draft wording | thread, no detail | **No** | no |
| | Saved-points bonus | at 300, ×2, once | "save 300 points, we would double it" | ×2 yes; "once" **No** | goal **yes** |
| Getting paid | Qualifying referral (clause) | draft from `docs/AFFILIATE.md` definitions | — | **No** | no |
| | Frequency / within days / method | monthly / 15 / direct deposit | packet has direct deposit | method yes, rest **No** | frequency, days **yes** |
| | Refunds and chargebacks (clause) | draft: 60 days | — | **No** | no |
| — | Terms agreed only with this affiliate | empty | — | — | **only** per affiliate |

### Live previews (all from the same `derive()`)

- "10% of $30.00 = $3.00/member/month · 10% of $90.00 = $9.00 per initiation".
  With "before the $9" it reads "10% of $39.00 = $3.90/member/month".
- FIRST48: "$99.00 + 3 × $39.00 = $216.00 paid", "Saves $351.00; $216.00 ÷ 12 = $18.00 a month", and the affiliate earns $18.00 on one offer business. No commission is earned on free months. (Before 23 Oct the default was $69: $186.00, $15.50, $15.00.)
- Points: "3 points × $1.00 = $3.00 · commission arithmetic gives $3.00".
- Minimum: "$100.00, about 34 users or 17 businesses".
- Bonus: "+300 points = $300.00 on top of the $300.00 saved".

## Validation

Field limits (blocking): money to the cent, percentages 0–100, whole points and
months, **minimum redemption at least 100 points**, and no empty clauses.

Contradictions (`RULES`):

| Rule | Kind | When |
|---|---|---|
| `shares_over_net` | hard | Commission plus any other share is more than 100% of what is left after the $9, on the monthly fee or the initiation. This also catches a percentage of the full price that eats past the $9. |
| `foundation_over_payment` | hard | The $9 is larger than a payment it comes out of. |
| `user_points_over_net` / `business_points_over_net` | hard | A referral pays out more than BEASTY keeps after the $9. |
| `other_share_unnamed` | hard | Another share is set but nobody is named. |
| `user_points_vs_commission` / `business_points_vs_commission` | soft | The points do not equal the commission arithmetic (Glenn's 3 and 6 matched it exactly). |
| `initiation_vs_members_page` | soft | The initiation is not the $99 the Members page prints (`src/data/affiliateTiers.ts`; the audit keeps the two in step). **This fires on the defaults on purpose**: it is the first question for Glenn. | Since 23 Oct the default is $99, so it no longer fires on the defaults; `business_points_vs_commission` ($9.00 against 6 points) does instead.
| `promo_not_a_year` | soft | Paid plus free months is not 12. |
| `bonus_below_minimum` | soft | The bonus goal is below the redemption minimum. |
| `promo_day_over_net` | soft | At the top multiplier a referral pays more than BEASTY keeps. |

Hard flags block publishing and saving an affiliate's override. The PDF still
opens, marked **NOT FINAL**.

## Per-affiliate overrides (CRM)

On an affiliate's page, **Money terms** shows which version they are on and
their code. **Change terms for this affiliate only** lists the per-affiliate
fields with the standard figure as a placeholder; an empty box means the
standard figure. The same rules check the combined figures before **Save
their terms**. Overrides are stored on the application (`terms_overrides`); a
value equal to the standard is dropped. Every change is in their History
("Money terms changed for them") and in `affiliate_terms_events`. Fees, the
$9, FIRST48 and the point value are the same for everyone and are refused by
the server.

## How the numbers reach the agreement and the DocuSeal packet (free plan)

No paid DocuSeal API, no embedding, no API prefill.

1. **The code.** Every set of figures has a 7-character code (`termsCode`, a
   hash of every field). It prints on every page and goes into the packet, so
   a signed copy can always be matched to its exact figures.
2. **One printed page.** `node --import tsx tools/build-affiliate-schedule-a.ts`
   (optionally `--terms version.json`) renders Schedule A on one page, with the
   same renderer as the CRM's PDF (`server/affiliate-terms-pdf.ts`):
   - a four-row fee table, amounts right-aligned: initiation, membership fee,
     the Foundation contribution, and FIRST48 with its first-year total;
   - one sentence for commission ("10% of what BEASTY keeps after the
     Foundation contribution: $3.00 per member per month and $6.00 per
     initiation …");
   - one sentence for BARK, with promotion days and the 300-point bonus as a
     line of fine print;
   - payment and adjustments, and qualifying referrals.

   The money terms are BEASTY's, so they print as text. The page has **two
   fields only**: **Schedule A Changes**, which BEASTY prefills ("None" on the
   standard terms), and **Schedule A Initials** for the Affiliate. The design
   is plain on purpose, like a contract schedule rather than a form: one
   typeface (Helvetica, whose figures are tabular), hairline rules instead of
   boxes, a single heading style, and BEASTY yellow once, under the title.

   Outputs: `output/pdf/BEASTY-Affiliate-Schedule-A-DRAFT.pdf` (review),
   `out/affiliate-forms/beasty-schedule-a-docuseal-import.pdf` (both fields
   empty, because DocuSeal's importer turns filled widgets into fixed page
   content) and `out/affiliate-forms/schedule-a-fields.json`.
3. **Into the template (once per published version).** In Glenn's DocuSeal
   account, add the import page after the agreement pages and choose **Keep**.
   Set **Schedule A Changes** to default "None", Read-only and Prefillable.
   Change **Schedule A Initials** to the Initials type, owned by the Affiliate
   and required. When Glenn approves, that template's ID becomes
   `DOCUSEAL_MANUAL_TEMPLATE_ID`, as `docs/AFFILIATE-ONBOARDING.md` already
   describes. A new published version means re-rendering the page and
   replacing it in the template.

   Template **6566603**
   ([BEASTY-Affiliate-Packet-with-Schedule-A-DRAFT](https://docuseal.com/templates/6566603/edit)),
   a clone of 6402995 made on 22 Oct, now carries this one-page Schedule A
   (23 Oct). The first, 17-field version, which Leon judged too busy, was
   removed with all its fields. The page was imported with **Keep**:
   **Schedule A Changes** defaults to "None" and is Read-only and
   Prefillable, not Required; **Schedule A Initials** is an Initials field for
   the Affiliate, Required. The template was saved and checked after a reload.
   It is still a draft: no request has been sent from it, it is not
   `DOCUSEAL_MANUAL_TEMPLATE_ID`, and the original 6402995 is unchanged.
   Removing a document in DocuSeal's editor opens a browser confirm dialog;
   click OK in the browser itself.
4. **One affiliate's own figures.** The CRM writes them as one line for the
   Changes field, e.g. "Commission: 12% (standard 10%); Redeemable from:
   150 points (standard 100 points). Code 1AB2C3D." The sender pastes it when
   creating that affiliate's request on the dashboard. Their own Schedule A
   PDF from the CRM prints their figures in full.
5. **Proof.** When an admin attaches the packet in the CRM, the document row
   records `terms_snapshot = { version, code }`. If the affiliate's terms
   change afterwards, their page says so: "The DocuSeal packet went out with
   code X … send a new packet, or change them back."

The older review agreement (template 6403162) has six reward fields; the CRM
also offers their values ("Values for the review agreement's reward fields").

## What this does not do

- It does not send anything to applicants or to Glenn, and publishing a
  version only changes what new affiliates start on.
- It does not track or pay commission. `affiliate_rewards` stays empty and
  Glenn pays from the signed packet, as before.
- It does not invent agreement law. Clause defaults are marked "Draft wording;
  not agreed", and the agreement still needs Glenn and his lawyer.
- Not built in: Glenn's 18 Oct **website pilot** idea (free monthly fees for
  the first year, initiation charged after 30 days). It conflicts with FIRST48
  and is not agreed. If it becomes an offer, add it as a second promo chapter.

## Questions for Glenn, in order

1. ~~Is the commission on a $69 or a $99 initiation?~~ **$99**, Leon, 23 Oct. That makes the commission on an initiation $9.00 (10% of $90), while Glenn's BARK note pays 6 points ($6.00) per business, worked out from $69: Leon settled it the same morning: **9 points per business**, so the defaults raise no question at all.
2. Does the $9 come out of every payment, or only the activation?
3. How long does an affiliate earn on one business?
4. Payment: how often, and within how many days?
5. Is the 300-point bonus paid once, or every time?
6. Is the FIRST48 cap 48 per city, or 48 overall?

## Running it

```bash
node --import tsx tools/audit-affiliate-terms.ts --model   # model + PDF, no database
node --import tsx tools/audit-affiliate-terms.ts           # + API on a fresh local Postgres
node --import tsx tools/build-affiliate-schedule-a.ts      # the DocuSeal pages
```

## 23 October 2026, later: $99 in the DocuSeal draft

The one-page Schedule A in draft template 6566603 was replaced with the $99 version (code 1GUTH3E: $99.00 initiation, $216.00 FIRST48, $9.00 per initiation), using DocuSeal's Replace on that document so the two fields kept their places. Saved; still no submissions, nothing sent, not the live template.

## 23 October 2026: 9 BARK points per business

Leon: "Make BARK 9 points per referred business, to match the $9.00 commission." The default is 9 (it was Glenn's 6, worked out from $69), the Careers page (MAKE $) says 9, and the defaults now raise no soft question. Schedule A was regenerated and replaced in draft template 6566603 the same way as the $99 change.
