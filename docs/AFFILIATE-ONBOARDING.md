# Affiliate onboarding (`/join`)

Glenn asked for "BEASTY forms" so affiliates can sign up in house: basic info,
Social Security number, checking routing and account number, a picture of
their ID, and a signed agreement. This is that, built so BEASTY's own database
never holds the sensitive parts.

## How it fits together

| Piece | Where | What it does |
|---|---|---|
| Portal | `src/join/JoinScreen.tsx`, `src/join/join.css` | `beastypages.com/join` and `/join/<invite>`. Welcome, sign in with a code, four steps, review, then the affiliate's dashboard. Autosaves as they type. |
| API | `server/onboarding.ts` | `/api/onboarding/*` for the affiliate, `/api/crm/onboarding*` for the team, the DocuSeal webhook. |
| Outside services | `server/onboarding-providers.ts` | Stripe Connect (payouts, ID, tax, bank) and DocuSeal (the agreement). Each is `off`, `mock` or `live`. |
| Tables | `server/db/onboarding-schema.ts` | `onboarding_invites`, `onboarding_applications`, `onboarding_documents`, `onboarding_events`, `onboarding_webhook_events`. |
| CRM pages | `src/crm/affiliates.tsx` | People → Affiliates: the list, invites, one person's page, countersign, approve. |
| Test | `tools/audit-onboarding.mjs` | The whole journey in test mode, API and browser, phone and computer. |

The four steps the affiliate sees:

1. **Your information.** Legal name, preferred name, email, phone, mailing
   address, individual or business, social links, where they will promote.
   Stored in `onboarding_applications.profile`.
2. **Get paid.** Opens Stripe's own hosted page. Stripe collects the Social
   Security number or EIN, date of birth, bank account and, when it asks, an ID
   photo, and the tax details a W-9 asks for (Stripe can also file the 1099s
   once that is turned on in Stripe). BEASTY keeps the Stripe
   account id plus Stripe's yes/no answers and the last four digits.
3. **Agreement.** Opens DocuSeal. The affiliate signs; Glenn countersigns from
   the CRM. "Signed" is only ever what DocuSeal reports (webhook plus a
   re-check on page load), never a button press.
4. **Review & submit.** Locks the application for review.

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
| Stripe payouts step | Built, **not switched on**: needs Glenn's Stripe account activated and Connect enabled |
| DocuSeal agreement and countersign | Built, **not switched on**: needs a DocuSeal account and the agreement template |
| Agreement wording | **Needs Glenn and a lawyer.** Nothing here invents terms. |
| Commissions and payouts to affiliates | **Not built.** The dashboard says they aren't switched on yet. |
| Test mode (`AFFILIATE_PROVIDERS=mock`) | Local and audits only; refused in production. Every test screen is labelled. |

Until each service is configured, the portal says that step "opens soon" and
the CRM says what is waiting; nothing pretends to work.

## Switching it on

### Stripe (payouts)

1. Glenn activates his Stripe account and enables **Connect** (Express
   accounts) in the Stripe dashboard.
2. On the **site** service (beastypages.com) set `AFFILIATE_PAYOUTS=stripe`.
   `STRIPE_SECRET_KEY` is already there for memberships.
3. Optional: set the same two on the **CRM** service, so a person's page
   re-checks Stripe when Glenn opens it (otherwise it updates whenever the
   affiliate opens `/join`).
4. Optional: in Connect settings, brand the onboarding pages with the BEASTY
   logo and yellow.

### DocuSeal (agreement)

1. Create a DocuSeal account (cloud, or self-hosted and set `DOCUSEAL_URL`).
2. Make the affiliate agreement a template with two signer roles, named
   **Affiliate** and **BEASTY** (or set `DOCUSEAL_AFFILIATE_ROLE` and
   `DOCUSEAL_COMPANY_ROLE`). Fields named `Legal Name`, `Business Name`,
   `Email` and `Address` on the Affiliate role are filled in from step 1.
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
  or its database. The CRM shows Stripe's yes/no answers and the last four.
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
node tools/audit-onboarding.mjs
```

Set `ONBOARDING_SHOTS=<dir>` to save screenshots of each step. It needs the
local Postgres (`docker start beasty-pg`) and a fresh `npm run build`.
