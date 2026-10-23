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
| DocuSeal page | `tools/build-affiliate-schedule-a.ts` | The fillable Schedule A pages for the packet template, with defaults. |
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
| Prices | Initiation fee | $69 | FIRST48 proposal, 29 Aug | **No**: the Members page prints $99 | no |
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

- "10% of $30.00 = $3.00/member/month · 10% of $60.00 = $6.00 per initiation".
  With "before the $9" it reads "10% of $39.00 = $3.90/member/month".
- FIRST48: "$69.00 + 3 × $39.00 = $186.00 paid", "Saves $351.00; $186.00 ÷ 12 = $15.50 a month", and the affiliate earns $15.00 on one offer business. No commission is earned on free months.
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
| `initiation_vs_members_page` | soft | The initiation is not the $99 the Members page prints (`src/data/affiliateTiers.ts`; the audit keeps the two in step). **This fires on the defaults on purpose**: it is the first question for Glenn. |
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
2. **The Schedule A pages.** `node --import tsx tools/build-affiliate-schedule-a.ts`
   (optionally `--terms version.json`) writes:
   - `output/pdf/BEASTY-Affiliate-Schedule-A-Fillable-DRAFT.pdf`: two pages, 17 fillable fields with the values filled in, for review.
   - `out/affiliate-forms/beasty-schedule-a-docuseal-import.pdf`: the same pages with **empty** fields, because DocuSeal's importer turns filled widgets into fixed page content.
   - `out/affiliate-forms/schedule-a-fields.json`: field name → default.

   Page 1 holds the figures (fees, the $9, FIRST48, rate, per-member and
   per-initiation commission, points, point value, minimum, promotion days,
   bonus, payment, code). Page 2 holds the standard clauses and a
   **Special Terms** box.
3. **Into the template (once per published version).** In Glenn's DocuSeal
   account, add the import PDF to a copy of the packet template (6402995)
   after the agreement pages, choose **Keep** on native-field import, and make
   the 17 fields sender-filled (prepared by BEASTY, read-only to the
   affiliate) with the defaults from `schedule-a-fields.json`. The free editor
   supports defaults, so a standard affiliate's request needs no typing. When
   Glenn approves, that template's ID becomes `DOCUSEAL_MANUAL_TEMPLATE_ID`,
   as `docs/AFFILIATE-ONBOARDING.md` already describes.

   **Done 22 Oct 2026 for the defaults (code `0Z94EU7`):** Glenn's account
   now has template **6566603**,
   [BEASTY-Affiliate-Packet-with-Schedule-A-DRAFT](https://docuseal.com/templates/6566603/edit).
   It is a clone of 6402995 (left unchanged) with the two Schedule A pages
   added after the packet. Native fields were kept, and all 17 fields have their
   default from `schedule-a-fields.json`, **Read-only** on (the affiliate cannot
   change them), **Prefillable** on (the sender can change them for one
   affiliate) and Required off. The values were checked after a save and a
   reload. It is a draft: no request has been sent from it, and it is not set
   as `DOCUSEAL_MANUAL_TEMPLATE_ID`. When a new version is published with
   different figures, rebuild with `--terms` and update the changed defaults
   in this template.
4. **One affiliate's own figures.** When creating their submission on the
   dashboard, the sender pastes each value from the CRM. The field names in
   the CRM are the field names in DocuSeal (`DOCUSEAL_FIELDS`). DocuSeal cannot
   do the arithmetic on the free plan, so worked figures such as "$3.00 (10% of
   $30.00)" are their own fields, always copied from the CRM and never typed.
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

1. Is the commission on a $69 or a $99 initiation?
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
