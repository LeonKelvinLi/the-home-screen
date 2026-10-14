# Affiliate onboarding (`/join`)

Glenn asked for "BEASTY forms" so affiliates can sign up in house: basic info,
Social Security number, checking routing and account number, a picture of
their ID, and a signed agreement. This is that, built so BEASTY's own database
never holds the sensitive parts.

**No Stripe for affiliates, for now** (Leon, 2026-10-11: "lets not have stripe
set up and have that running for now"). The journey is three steps; the W-9,
the direct-deposit form and the ID photo are pages of the same DocuSeal packet
as the agreement, and Glenn pays affiliates himself from the signed packet. The
Stripe Connect step below is still built and appears only when
`AFFILIATE_PAYOUTS` is set.

## How it fits together

| Piece | Where | What it does |
|---|---|---|
| Portal | `src/join/JoinScreen.tsx`, `src/join/join.css` | `beastypages.com/join` and `/join/<invite>`. Welcome, sign in with a code, three steps (four with Stripe payouts on), then the affiliate's dashboard. Autosaves as they type. |
| API | `server/onboarding.ts` | `/api/onboarding/*` for the affiliate, `/api/crm/onboarding*` for the team, the DocuSeal webhook. |
| Outside services | `server/onboarding-providers.ts`, `server/onboarding-manual.ts` | DocuSeal via a free manual dashboard handoff or a paid API integration, and optional Stripe Connect. |
| Tables | `server/db/onboarding-schema.ts` | `onboarding_invites`, `onboarding_applications`, `onboarding_documents`, `onboarding_events`, `onboarding_webhook_events`. |
| CRM pages | `src/crm/affiliates.tsx` | People → Affiliates: the list, invites, one person's page, countersign, approve. |
| Test | `tools/audit-onboarding.mjs` | The whole journey in test mode, API and browser, phone and computer. |

The steps the affiliate sees:

1. **Your information.** Legal name, preferred name, email, phone, mailing
   address, individual or business, social links, where they will promote.
   Stored in `onboarding_applications.profile`.
2. **Get paid** (only with `AFFILIATE_PAYOUTS` set; off for now). Opens Stripe's
   own hosted page. Stripe collects the Social Security number or EIN, date of
   birth, bank account and, when it asks, an ID photo, and the tax details a W-9
   asks for. BEASTY keeps the Stripe account id plus Stripe's yes/no answers and
   the last four digits.
3. **Forms & agreement** (just "Agreement" when Stripe is on). Opens DocuSeal:
   one packet with the W-9, the direct-deposit form, an ID photo upload and the
   agreement, filled in from step 1. The affiliate fills in and signs; Glenn
   countersigns from the CRM. In free manual mode, an admin checks the
   documents, signatures and audit trail in DocuSeal and records that review.
   The applicant's "request review" button never marks a signature. In API
   mode, signatures reconcile from DocuSeal's API and webhook.
4. **Review & submit.** Locks the application for review and emails it to
   `LEAD_EMAIL` and the affiliate. A step whose service is not switched on yet
   (Stripe Connect, DocuSeal) does not block submitting: the affiliate sends
   their details now, and finishes payouts and signing from their dashboard
   once those open. Approval still needs the agreement signed by both.

Statuses: `in_progress` → `submitted` → `approved`, or `changes_requested`
(they edit and send it in again) or `rejected`; `approved` ↔ `suspended`.
Approve needs the agreement signed by both. Asking for a change or turning
someone down needs a note, which is emailed to them.

## What is real today

| | State |
|---|---|
| Invites (14 days, single use, token stored hashed, resend makes a new link, cancel) | Built and working |
| Sign in with a one-time code (the existing member sign-in) | Built and working |
| Step 1 details, autosave, conflict check between two tabs, resume where they left off | Built and working |
| Team list, filters, search, person page, history of every action (including who opened the record) | Built and working |
| Approve, ask for a change, turn down, pause, reinstate, with emails | Built and working (emails need `RESEND_API_KEY` and `OTP_FROM_EMAIL`, as for all site email) |
| Stripe payouts step | Built, **off on purpose** (no Stripe for affiliates for now). Hidden while off; the journey is three steps |
| Free DocuSeal handoff | Built: request forms, attach separate signing links in CRM, request review, admin checks W-9/bank/ID/audit/signatures, countersign and approve. Approved template configuration is required before linking any applicant packet. |
| Agreement wording | **Needs Glenn and a lawyer.** Nothing here invents terms. |
| Commissions and payouts to affiliates | **Not built.** Glenn pays from the W-9 and direct-deposit form in the signed packet; the dashboard says commission tracking isn't switched on yet. |
| Test mode (`AFFILIATE_PROVIDERS=mock`) | Local and audits only; refused in production. Every test screen is labelled. |

Until each service is configured, the portal says that step "opens soon" and
the CRM says what is waiting; nothing pretends to work.

## Switching it on

### Stripe (payouts), later and only if wanted

1. Glenn activates his Stripe account and enables **Connect** (Express
   accounts) in the Stripe dashboard.
2. On the **site** service (beastypages.com) set `AFFILIATE_PAYOUTS=stripe`.
   `STRIPE_SECRET_KEY` is already there for memberships.
3. Optional: set the same two on the **CRM** service, so a person's page
   re-checks Stripe when Glenn opens it (otherwise it updates whenever the
   affiliate opens `/join`).
4. Optional: in Connect settings, brand the onboarding pages with the BEASTY
   logo and yellow.

### Free DocuSeal handoff (Leon's selected approach)

Set `AFFILIATE_SIGNING=manual` on **both** site and CRM, keeping affiliate
Stripe payouts off. No DocuSeal API key or Pro subscription is required.

1. Glenn and Leon finalize the company identity and agreement/payment terms.
   The redesigned blank review template is in Glenn's account, template 6402572;
   the packet draft is 6402583. Earlier drafts are preserved. Neither is an
   approved applicant agreement.
2. Create the finalized packet with Affiliate and BEASTY roles, signed W-9,
   signed direct-deposit authorization and a required ID image upload. Without
   Pro conditional fields, explicitly review that the applicable SSN **or**
   EIN is completed, and any LLC/Other classification is supplied as needed.
3. Set the finalized ID as `DOCUSEAL_MANUAL_TEMPLATE_ID` on both services and
   deploy. Leave this unset while the agreement is a draft. CRM will explain
   the pending approval and refuse any link attachment without it.
4. Invite the applicant in CRM. They register using the normal code login,
   finish their details and request forms or submit their application.
5. In DocuSeal, create a **separate submission** from the approved template,
   with the exact applicant email in Affiliate and Glenn in BEASTY. Preserve
   signer order. Uncheck **Send Email** if CRM will notify them, so there are
   no duplicate DocuSeal request emails. Copy the dashboard URL
   (`https://docuseal.com/submissions/<id>`) and the separate private `/s/`
   signing links into that applicant's CRM record. Confirm the terms,
   recipient, roles and required forms. CRM emails the applicant a portal
   link and accurately reports sending failures while keeping the packet.
6. The applicant opens their packet, uploads ID and any requested bank proof
   directly to DocuSeal, fills the forms and signs. They return to `/join` and
   request review. This means **reported finished**, not verified signed.
7. Glenn opens the request in DocuSeal, checks the affiliate signature,
   signed W-9, bank authorization, legible ID upload and matching audit trail,
   and records his review. CRM opens the BEASTY signing link (or dashboard if
   that link was omitted). After he countersigns, he checks that signature
   and records the completed packet. Approval then becomes available.
8. The affiliate can view the completed packet from their dashboard; DocuSeal
   supplies its download and audit trail. No sensitive file is copied into
   BEASTY. A replacement request preserves the previous document record and
   resets verification; new signatures and review are required.

Only CRM admins can attach links or record review. Team members can see
progress, but do not receive either private signing link or the request URL.
Links must be HTTPS on `docuseal.com`; shared public template links, arbitrary
hosts, credentials/query parameters and identical signer links are refused.
Submission IDs cannot be attached to two applications. Packet revisions prevent
stale edits. Manual records are never passed to the vendor API or webhook.

DocuSeal's [free plan and API pricing](https://www.docuseal.com/pricing) differ:
manual dashboard requests and uploads are supported free; production API and
embedding require Pro. A sandbox API is not a free production substitute.

### DocuSeal API (optional paid path; not selected)

1. Create a DocuSeal account (cloud, or self-hosted and set `DOCUSEAL_URL`).
2. Make one template, the packet, with two signer roles named **Affiliate** and
   **BEASTY** (or set `DOCUSEAL_AFFILIATE_ROLE` and `DOCUSEAL_COMPANY_ROLE`).
   Its pages, all filled in by the Affiliate role:
   - **Form W-9** (the IRS PDF, uploaded): name, business name, tax
     classification, address, SSN or EIN, signature and date.
   - **Direct deposit**: bank name, routing number, account number, checking or
     savings, and a voided check or bank letter as an optional upload.
   - **ID**: an image field for a photo of their driver's license, state ID or
     passport.
   - **The affiliate agreement** (wording from Glenn and his lawyer), signed by
     the Affiliate, then countersigned by the BEASTY role.
   Fields named `Legal Name`, `Business Name`, `Email`, `Phone`, `Address`,
   `Street Address`, `City`, `State` and `ZIP` are filled in from step 1; name
   the W-9's fields that way and they arrive filled. The server reads the
   template's field names first and sends only the ones it has.
3. On the **site** service set `DOCUSEAL_API_KEY` and
   `DOCUSEAL_AFFILIATE_TEMPLATE_ID`. Optional: `DOCUSEAL_COMPANY_EMAIL`,
   `DOCUSEAL_COMPANY_NAME`.
4. Add a webhook in DocuSeal to
   `https://beastypages.com/api/onboarding/webhooks/docuseal` with a custom
   header `x-beasty-webhook-secret` (or set `DOCUSEAL_WEBHOOK_HEADER`) whose
   value is a random string of 16+ characters, and set the same value as
   `DOCUSEAL_WEBHOOK_SECRET`. The webhook only speeds things up: the portal
   and CRM also re-check DocuSeal when opened.
5. Set the same DocuSeal variables on the **CRM** service so the person page
   can show the agreement and open the countersign link.

## Privacy and safety

- No Social Security number, bank number or ID image ever touches this server
  or its database: they are typed into DocuSeal's own page and stay in
  DocuSeal, where Glenn opens the signed packet to pay. (With Stripe on, the
  CRM shows Stripe's yes/no answers and the last four.)
- Invite tokens are stored as SHA-256 hashes; the token leaves the address bar
  as soon as it is used. `/join` pages are `noindex`, `no-referrer`, `no-store`.
- Every affiliate request is scoped to the signed-in member; one affiliate can
  never read another's application.
- Team actions are logged in `onboarding_events` with who did them; opening a
  record is logged too (at most once per ten minutes per person).
- Webhooks are checked with a constant-time secret comparison and deduplicated.
- Rate limits on every route; stricter on invites.

## Running the test

```bash
node tools/audit-onboarding.mjs --api-only
node tools/audit-onboarding-manual.mjs
```

Set `ONBOARDING_SHOTS=<dir>` to save screenshots of each step. It needs the
local Postgres (`docker start beasty-pg`) and a fresh `npm run build`.
Use the connected macOS Chrome extension for browser QA, including a phone
breakpoint; do not run the script's separate Playwright Chromium under Leon's
browser preference. The manual audit uses synthetic records, tests admin-only
review and ownership/URL/revision guards, and makes no DocuSeal API calls.
