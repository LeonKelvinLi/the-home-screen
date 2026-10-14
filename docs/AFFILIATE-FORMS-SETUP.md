# BEASTY affiliate forms setup — 13 October 2026

The workflow remains `/join` → details → DocuSeal packet → affiliate signature → CRM review → BEASTY countersignature → approval. Taxpayer IDs, bank numbers and ID images stay in DocuSeal. Stripe affiliate payouts remain off.

## Uploaded artifact

Glenn Malicdem's account, `glenn@beastypages.com`, owns the complete template **6402995**, [BEASTY-Affiliate-Packet-and-Disclosures-DRAFT](https://docuseal.com/templates/6402995).

It contains 13 pages: a tax-ID selection cover, the current IRS W-9 and its five instruction pages, direct-deposit authorization, ID upload, two pages of written disclosures, and a two-page draft affiliate agreement. The PDF has 35 canonical fields. Taxpayer, account-holder, ID-holder and affiliate names are separate so a business's details do not overwrite the individual's identity. In DocuSeal, the bank proof is a File field and ID front/back are Image fields. The signer roles are **Affiliate** and **BEASTY**. Glenn's representative name is prepared in the PDF and imports as fixed page content, leaving 32 Affiliate fields and two BEASTY fields (countersignature/date). All four date fields use DocuSeal's actual signing date.

The earlier drafts (6399448, 6399497 and 6402583) are preserved. Use 6402995 for packet review; do not send any draft packet to applicants.

The redesign follows the spacing, heading hierarchy, fine rules and consistent
folios of LOQOL's local report layout, while using BEASTY's existing Inter and
Oswald font assets and restrained yellow accents. All six original IRS pages
were rendered and compared pixel-for-pixel with the source; all match. Native
PDF fields remain editable, and saved/reopened synthetic text, select and radio
values have visible appearances. Custom pages were rendered and inspected.

## Required before live activation

Leon chose **free** on 13 October and will discuss the agreement with Glenn.
Do not purchase Pro or activate the draft packet. A free cloud account can
create signing requests through its dashboard and collect ID/file uploads;
production API/embedding is paid. Leon selected the free manual CRM handoff.
See `docs/AFFILIATE-ONBOARDING.md` for its setup and operating instructions.
A sandbox API is not a production substitute.

The manual handoff uses `AFFILIATE_SIGNING=manual` on both services. An approved
`DOCUSEAL_MANUAL_TEMPLATE_ID` is required before CRM accepts signing links.
It remains unset until Glenn and Leon finalize the agreement, so drafts stay
out of applicant signing. Admin review flags and signer roles are explicit;
the affiliate can request review but cannot assert a verified signature.

### Fillable agreement for review

`tools/build-affiliate-agreement-review.py` creates
`output/pdf/BEASTY-Affiliate-Agreement-Fillable-DRAFT.pdf`: six pages and 24
interactive fields for company identity, reward/payment terms, eligibility,
privacy/retention and legal details, followed by the written disclosures. Known
representative/contact details and published BARK references are prepared for
review. Unconfirmed company/payment terms remain blank, and the signature
areas are reserved for a separate finalized request. The builder checks the
canonical fields, widget appearances, and a saved/reopened synthetic fill.
All six pages were rendered and visually checked.

The complete review draft is uploaded in Glenn's account as **6403162**,
[BEASTY-Affiliate-Agreement-and-Disclosures-DRAFT](https://docuseal.com/templates/6403162),
with all 24 fields assigned to **BEASTY Review**. The earlier template 6399923
has an opened review request and was preserved, as was 6402572. No review template is
configured as the portal's applicant signing template.

### Reduce applicant typing on the free plan

Template 6402995 has four sender form fields: **ID Legal Name**, **Affiliate Legal
Name**, **Street Address** and **City State ZIP**. The CRM's admin-only packet
panel offers copy controls for the known application details. The sender prepares
these four fields for each separate request; they remain editable so the signer
can correct them before signing. Glenn's company recipient email is preset, and
the recipients' order is enforced. Do not put an applicant's defaults into the
shared master template, where another applicant could receive them.

Applicants read the prepared agreement/disclosures; they do not write company
terms or disclosure text. Tax classification, the applicable taxpayer number,
bank/account-holder details, ID images and signatures require their own input.
The helper does not infer a business taxpayer name from the application type.
Automatic API prefilling and spreadsheet bulk sending remain paid features;
the selected workflow uses the free dashboard's sender preparation fields.

`src/join/disclosures.json` is the shared text for the applicant page and PDFs.
It covers electronic records/copies/withdrawal, W-9 accuracy, credit-only bank
authorization, ID review, document access/corrections/retention, affiliate
promotion disclosures, truthful claims/reward terms, and application contact.
It is proposed company policy for Glenn's approval with the final agreement.
The standalone two-page copy is `output/pdf/BEASTY-Affiliate-Disclosures-DRAFT.pdf`.

1. Glenn's account remains free. The API-based path below requires Pro and is reference only unless Leon changes the free-only requirement. No paid upgrade was purchased.
2. Finalize the agreement: BEASTY's legal entity/address, governing law, privacy/retention notice, and the complete referral reward/payment schedule. Published BARK figures are included as references for review, not treated as a complete approved commission contract.
3. After Pro is active, apply the four conditional fields: SSN required only when Tax ID Type is SSN; EIN required only when it is EIN; LLC classification required only for LLC; Other classification required only for Other. DocuSeal's free-plan editor refused to save these conditions. Set SSN/EIN validation and a nine-digit routing-number validation. Verify their rendered locations on the W-9 and direct-deposit page.
4. Use Glenn's live API key on both the site and CRM services, set `DOCUSEAL_AFFILIATE_TEMPLATE_ID` to the finalized template, `DOCUSEAL_COMPANY_EMAIL=glenn@beastypages.com`, and `DOCUSEAL_COMPANY_NAME=Glenn Malicdem`. Keep drafts out of production configuration.
5. Add the webhook to `https://beastypages.com/api/onboarding/webhooks/docuseal`, header `x-beasty-webhook-secret`, with a random secret of at least 16 characters. Set the same `DOCUSEAL_WEBHOOK_SECRET` on both services. No secrets belong in this repository.
6. Deploy, then verify the actual hosted flow with a clearly identified test application. Confirm prefills, uploads, signer ownership, callback status, countersigning and the executed packet. No agent should sign or countersign on a person's behalf.

## Email correction

Previously both services had `LEAD_EMAIL=glenn@beastypages.com`. It is now `glenn@beastypages.com,leondragon3798@gmail.com` on both, preserving Glenn's notifications. Both environment deployments were verified live. Environment updates require a Render deploy to reach the running process. Deploy and delivery results are kept in the ignored `out/affiliate-forms/email-setup.json`.

The existing sender is `BEASTY <hello@beastypages.com>` on the verified domain. Resend reports the 13 October invitation and the new delivery-check email delivered. The invitation was visible in Leon's Gmail inbox, and the notification check was also visible with an Inbox label.

The invite API now returns `emailStatus` (`accepted`, `failed` or `not_configured`). The CRM reports provider acceptance accurately and offers the saved private link when email sending fails. Acceptance alone is not inbox delivery.

## Validation and reproduction

- `node --import tsx tools/audit-email-delivery.ts` checks accepted sends, rejected sends, network failure and missing configuration.
- `node --import tsx tools/audit-docuseal-provider.ts` checks role-scoped prefills, signer order, no automatic sending, and invalid/unreadable templates being refused.
- `node tools/audit-onboarding.mjs --api-only` passes against a fresh local database. Browser portions require the user's Chrome extension; do not launch a separate Playwright Chromium.
- `npm run build` passes. No real contract was signed, no applicant bank/ID data was entered, and no hosted signing result is claimed.

Install the document-builder dependencies in an isolated environment using
`tools/requirements-affiliate-forms.txt`, then run
`python3 tools/build-affiliate-forms.py` and
`python3 tools/build-affiliate-agreement-review.py`. The builders use the
existing font files in `public/fonts`; static PDF fonts are cached in the ignored
output directory. First download `https://www.irs.gov/pub/irs-pdf/fw9.pdf` into
`out/affiliate-forms/irs-w9.pdf`. The scripts emit field manifests and blank
drafts, including the three deliverables in `output/pdf/`:
`BEASTY-Affiliate-Packet-Professional-DRAFT.pdf` and
`BEASTY-Affiliate-Agreement-Fillable-DRAFT.pdf`, plus
`BEASTY-Affiliate-Disclosures-DRAFT.pdf`. In DocuSeal, choose **Keep** on
native-field import, then set the roles, Image/File types and signing dates
described above; native PDF signatures do not encode upload-field types.
For the review agreement, upload the builder's empty-widget intermediate
`out/affiliate-forms/beasty-affiliate-review-cloud-import-DRAFT.pdf`, choose
**Keep**, name the role **BEASTY Review**, and set its seven prepared values as
editable field defaults. This preserves all 24 fields instead of flattening
filled widgets during import.

Sources: [IRS W-9](https://www.irs.gov/forms-pubs/about-form-w-9), [DocuSeal API](https://www.docuseal.com/docs/api), [conditional fields](https://www.docuseal.com/resources/add-conditional-fields), [FTC disclosure guide](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers). LOQOL's integration was read only for the provider/status/prefill pattern; its account, templates and keys were not reused.

The release audit found an existing critical `proxy-addr` advisory
(GHSA-jqcg-44mw-7w3h). This branch updates it to 2.0.8, also patches the
development `source-map-js` dependency and overrides vulnerable `shell-quote`
without changing concurrently's major version. `tools/audit-dependency-security.mjs`
checks the proxy trust regression and rejection of shell-comment newline input
without executing shell payloads. These dependency fixes and the free manual
handoff were merged in PR #4 and deployed to both Render services at revision
`522fd58147684330ca1154dc7120fe2503955955`. Both were healthy, with manual
signing enabled and the approved-template setting unset, on release verification.

Chrome QA of the isolated CRM confirmed an invite survives missing mail configuration and shows “Email was not sent; copy the link below.” Live deployment evidence is stored separately in the ignored `out/affiliate-forms/production-release.json`; do not infer deployment from passing local checks.

Free handoff validation: 50 isolated manual API checks plus the existing 53
onboarding API checks pass. Chrome verified a fresh CRM invitation, email-code
registration, profile autosave, packet request, submission, link attachment,
opening the actual DocuSeal request, real image/file uploads, and the review
request returning to a blocked approval state. The portal fit a 390px phone
viewport without horizontal overflow. DocuSeal QA template 6402084 and request
12264021 are explicitly synthetic, non-contract upload tests. No real contract
was signed and no real taxpayer, bank or ID data was entered. Signature,
countersignature and approval transitions were exercised using synthetic API
review flags, not represented as a real executed DocuSeal agreement.

The disclosure/page update also passes `tools/audit-affiliate-prefill.ts`, the
role-scoped provider audit, and the existing onboarding API audit. Chrome
verified the CRM invitation, email-code signup, business profile autosave,
packet request, application submission, the redesigned submitted dashboard,
admin copy controls and readable disclosures at 390px without horizontal
overflow. A mutation that inferred a business taxpayer name was caught by the
prefill audit. Production evidence for this update is recorded separately from
the local checks.
