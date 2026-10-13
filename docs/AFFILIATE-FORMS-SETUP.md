# BEASTY affiliate forms setup — 13 October 2026

The workflow remains `/join` → details → DocuSeal packet → affiliate signature → CRM review → BEASTY countersignature → approval. Taxpayer IDs, bank numbers and ID images stay in DocuSeal. Stripe affiliate payouts remain off.

## Uploaded artifact

Glenn Malicdem's account, `glenn@beastypages.com`, owns template **6399497**, [BEASTY-Affiliate-Packet-DRAFT](https://docuseal.com/templates/6399497).

It contains 11 pages: a tax-ID selection cover, the current IRS W-9 and its five instruction pages, direct-deposit authorization, ID upload, and a two-page draft affiliate agreement. The PDF has 32 canonical fields. In DocuSeal, the bank proof is a File field and ID front/back are Image fields. The signer roles are **Affiliate** and **BEASTY**. BEASTY owns only its representative, countersignature and countersigning date. All four date fields use DocuSeal's actual signing date.

The original auto-detected draft (6399448) is superseded by 6399497. Neither has submissions and neither should be sent while the agreement is a draft.

## Required before live activation

Leon chose **free** on 13 October and will discuss the agreement with Glenn.
Do not purchase Pro or activate the draft packet. A free cloud account can
create signing requests through its dashboard and collect ID/file uploads;
production API/embedding is paid. A manual CRM handoff or a different provider
must be selected before implementing a free production signing integration.
The choice is pending; a sandbox API is not a production substitute.

### Fillable agreement for review

`tools/build-affiliate-agreement-review.py` creates
`output/pdf/BEASTY-Affiliate-Agreement-Fillable-DRAFT.pdf`: four pages and 24
interactive fields for company identity, reward/payment terms, eligibility,
privacy/retention and legal details. All values are blank, and the signature
areas are reserved for a separate finalized request. The builder checks the
canonical fields, widget appearances, and a saved/reopened synthetic fill.
All four pages were rendered and visually checked.

The same review draft is uploaded in Glenn's account as template **6399923**,
[BEASTY-Affiliate-Agreement-Fillable-DRAFT](https://docuseal.com/templates/6399923).
DocuSeal retained all 24 fields. It is saved, has no submissions, and is not
configured as the portal's applicant signing template.

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

Build the blank PDFs with the bundled Python runtime (reportlab and pypdf): `python3 tools/build-affiliate-forms.py`. First download `https://www.irs.gov/pub/irs-pdf/fw9.pdf` into `out/affiliate-forms/irs-w9.pdf`. The script emits draft PDFs, field manifests and an interactive native-upload packet in that ignored directory. These files contain blank forms only.

Sources: [IRS W-9](https://www.irs.gov/forms-pubs/about-form-w-9), [DocuSeal API](https://www.docuseal.com/docs/api), [conditional fields](https://www.docuseal.com/resources/add-conditional-fields), [FTC disclosure guide](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers). LOQOL's integration was read only for the provider/status/prefill pattern; its account, templates and keys were not reused.

The release audit found an existing critical `proxy-addr` advisory
(GHSA-jqcg-44mw-7w3h). This branch updates it to 2.0.8, also patches the
development `source-map-js` dependency and overrides vulnerable `shell-quote`
without changing concurrently's major version. `tools/audit-dependency-security.mjs`
checks the proxy trust regression and rejection of shell-comment newline input
without executing shell payloads. The notification configuration redeploy runs
the already-deployed main revision; the dependency fixes are not live yet.

Chrome QA of the isolated CRM confirmed an invite survives missing mail configuration and shows “Email was not sent; copy the link below.” Production signing remains disabled; this code branch has not been deployed.
