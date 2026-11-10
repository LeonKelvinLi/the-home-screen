/** Additive first-party identity state. Existing membership tables stay authoritative. */
export const IDENTITY_SCHEMA = `
CREATE TABLE IF NOT EXISTS beasty_identity_codes (
  code_hash text PRIMARY KEY,
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  redirect_uri text NOT NULL,
  code_challenge text NOT NULL,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  consumed_at bigint
);
CREATE INDEX IF NOT EXISTS beasty_identity_codes_expiry_idx ON beasty_identity_codes(expires_at);

CREATE TABLE IF NOT EXISTS beasty_identity_tokens (
  token_hash text PRIMARY KEY,
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  revoked_at bigint
);
CREATE INDEX IF NOT EXISTS beasty_identity_tokens_expiry_idx ON beasty_identity_tokens(expires_at);

CREATE TABLE IF NOT EXISTS beasty_identity_google_attempts (
  state_hash text PRIMARY KEY,
  browser_hash text NOT NULL,
  nonce_hash text NOT NULL,
  verifier_ciphertext text NOT NULL,
  mode text NOT NULL CHECK(mode IN ('signin','link')),
  member_id text REFERENCES members(id) ON DELETE CASCADE,
  return_path text NOT NULL,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  consumed_at bigint,
  CHECK((mode='link' AND member_id IS NOT NULL) OR (mode='signin' AND member_id IS NULL))
);
CREATE INDEX IF NOT EXISTS beasty_identity_google_expiry_idx ON beasty_identity_google_attempts(expires_at);

CREATE TABLE IF NOT EXISTS beasty_identity_email_proofs (
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  email_normalized text NOT NULL,
  proof text NOT NULL CHECK(proof IN ('email_code','google')),
  provider_subject text,
  verified_at bigint NOT NULL,
  PRIMARY KEY(member_id,email_normalized,proof),
  CHECK((proof='google' AND provider_subject IS NOT NULL) OR (proof='email_code' AND provider_subject IS NULL))
);

CREATE TABLE IF NOT EXISTS beasty_identity_rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL,
  reset_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS beasty_identity_rate_expiry_idx ON beasty_identity_rate_limits(reset_at);

CREATE TABLE IF NOT EXISTS beasty_identity_audit (
  id bigserial PRIMARY KEY,
  member_id text REFERENCES members(id) ON DELETE SET NULL,
  action text NOT NULL,
  created_at bigint NOT NULL
);
`
