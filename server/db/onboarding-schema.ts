/*
  The affiliate onboarding tables (server/onboarding.ts). Additive only, like
  the CRM's: CREATE ... IF NOT EXISTS, run by migrate() after everything they
  reference (members). Nothing here holds an SSN, a bank number or an ID image:
  Stripe Connect and DocuSeal keep those, and these rows keep their answers.
*/
export const ONBOARDING_SCHEMA = `
CREATE TABLE IF NOT EXISTS onboarding_invites (
  id           TEXT PRIMARY KEY,
  token_hash   TEXT NOT NULL UNIQUE,
  email        TEXT NOT NULL,
  name         TEXT NOT NULL DEFAULT '',
  note         TEXT NOT NULL DEFAULT '',
  created_by   TEXT NOT NULL,
  created_at   BIGINT NOT NULL,
  expires_at   BIGINT NOT NULL,
  redeemed_at  BIGINT,
  redeemed_by  TEXT REFERENCES members(id) ON DELETE SET NULL,
  revoked_at   BIGINT,
  sent_count   INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS onboarding_applications (
  id              TEXT PRIMARY KEY,
  member_id       TEXT NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  invite_id       TEXT REFERENCES onboarding_invites(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'in_progress',
  revision        INTEGER NOT NULL DEFAULT 0,
  profile         JSONB NOT NULL DEFAULT '{}'::jsonb,
  payout_ref      TEXT,
  payout_state    JSONB,
  payout_checked  BIGINT,
  submitted_at    BIGINT,
  decided_at      BIGINT,
  decided_by      TEXT,
  decision_note   TEXT NOT NULL DEFAULT '',
  created_at      BIGINT NOT NULL,
  updated_at      BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS onboarding_documents (
  id               TEXT PRIMARY KEY,
  application_id   TEXT NOT NULL REFERENCES onboarding_applications(id) ON DELETE CASCADE,
  category         TEXT NOT NULL,
  template_version TEXT NOT NULL DEFAULT '',
  provider         TEXT NOT NULL,
  provider_ref     TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending_signature',
  affiliate_url    TEXT NOT NULL DEFAULT '',
  company_url      TEXT NOT NULL DEFAULT '',
  affiliate_signed_at BIGINT,
  company_signed_at   BIGINT,
  completed_at     BIGINT,
  checked_at       BIGINT,
  created_at       BIGINT NOT NULL,
  updated_at       BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS onboarding_documents_app ON onboarding_documents (application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS onboarding_documents_ref ON onboarding_documents (provider, provider_ref);
-- Free DocuSeal dashboard requests: references and review flags only.
ALTER TABLE onboarding_documents ADD COLUMN IF NOT EXISTS submission_url TEXT NOT NULL DEFAULT '';
ALTER TABLE onboarding_documents ADD COLUMN IF NOT EXISTS manual_revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE onboarding_documents ADD COLUMN IF NOT EXISTS manual_evidence JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE onboarding_documents ADD COLUMN IF NOT EXISTS verified_by TEXT;
ALTER TABLE onboarding_documents ADD COLUMN IF NOT EXISTS review_requested_at BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_manual_submission ON onboarding_documents (provider_ref) WHERE provider = 'manual' AND provider_ref <> '';
CREATE TABLE IF NOT EXISTS onboarding_events (
  id              BIGSERIAL PRIMARY KEY,
  application_id  TEXT REFERENCES onboarding_applications(id) ON DELETE CASCADE,
  invite_id       TEXT,
  actor           TEXT NOT NULL,
  kind            TEXT NOT NULL,
  detail          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS onboarding_events_app ON onboarding_events (application_id, created_at);
CREATE TABLE IF NOT EXISTS onboarding_webhook_events (
  provider     TEXT NOT NULL,
  event_key    TEXT NOT NULL,
  received_at  BIGINT NOT NULL,
  PRIMARY KEY (provider, event_key)
);
-- Schedule A, the affiliate money terms (server/affiliate-terms.ts). One
-- working draft of the standard schedule, numbered versions once published,
-- every change on the record, and per-affiliate changes on their application.
CREATE TABLE IF NOT EXISTS affiliate_terms_versions (
  number      INTEGER PRIMARY KEY,
  terms       JSONB NOT NULL,
  code        TEXT NOT NULL,
  note        TEXT NOT NULL DEFAULT '',
  created_by  TEXT NOT NULL,
  created_at  BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS affiliate_terms_draft (
  id            TEXT PRIMARY KEY,
  terms         JSONB NOT NULL,
  acknowledged  JSONB NOT NULL DEFAULT '{}'::jsonb,
  revision      INTEGER NOT NULL DEFAULT 0,
  updated_by    TEXT NOT NULL DEFAULT '',
  updated_at    BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS affiliate_terms_events (
  id          BIGSERIAL PRIMARY KEY,
  scope       TEXT NOT NULL,
  field       TEXT NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  channel     TEXT NOT NULL DEFAULT 'tap',
  actor       TEXT NOT NULL,
  created_at  BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS affiliate_terms_events_scope ON affiliate_terms_events (scope, created_at);
ALTER TABLE onboarding_applications ADD COLUMN IF NOT EXISTS terms_overrides JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE onboarding_applications ADD COLUMN IF NOT EXISTS terms_acknowledged JSONB NOT NULL DEFAULT '{}'::jsonb;
-- The Schedule A in force when a manual packet was attached: { version, code }.
ALTER TABLE onboarding_documents ADD COLUMN IF NOT EXISTS terms_snapshot JSONB;
`
