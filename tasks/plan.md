# Affiliate onboarding release

User scope: work on forms and emails; verify CRM invitation, registration,
document uploads, affiliate signing, company countersigning and approval;
deploy after verification. Use Glenn's BEASTY DocuSeal account. No paid upgrade.
Leon will discuss commercial/legal terms with Glenn using a fillable draft.

## Slices

1. Preserve delivered email configuration and already tested invite reporting.
2. Deliver a genuinely interactive agreement draft with blank company,
   commercial, privacy and legal terms. Do not activate a draft contract.
3. Patch the existing production proxy-addr vulnerability in an isolated install.
4. Resolve free signing architecture: cloud free supports manual requests,
   signing and uploads, but production API/embedding requires Pro. Ask whether
   the user prefers a manual CRM handoff or another provider; do not bypass fees.
5. Implement the selected signing workflow with explicit status evidence,
   ownership checks and approval guards. Keep bank/TIN/ID data in DocuSeal.
6. Verify real Chrome journeys and API failure cases using synthetic data.
   Distinguish mock checks from actual DocuSeal signing and actual inbox delivery.
7. Review, merge and deploy ready code, then check live services. Activate a
   signing packet only after Glenn and Leon supply approved agreement terms.

## Validation

Interactive PDF canonical fields and rendering; meaningful provider/email/API
audits; typecheck/build/dependency audit; Chrome CRM-to-portal journey; actual
DocuSeal upload/signing evidence when available; Render live status and Gmail
delivery. Never sign a real agreement on another person's behalf.

## Dependencies

No paid services authorized. Final contract terms remain with Glenn and Leon.
Free signing handoff choice is pending. Existing DocuSeal draft 6399497 is
review material and must not be selected as the live applicant agreement.
