/*
  THE CRM'S TABLES. Additive only: every statement is IF NOT EXISTS or ON
  CONFLICT DO NOTHING, run by migrate() after the main schema, so a boot on an
  existing database creates what is missing and changes nothing else. Nothing
  here alters a table the rest of the app owns; the only references out are to
  members and applications, both with ON DELETE SET NULL.

  brand_id is NOT a foreign key, for the same reason as brand_signals: the
  businesses live in the repo (src/data), not in this database. It is their
  stable id string, checked against BRANDS by the server on every write.

  Timestamps are BIGINT milliseconds and money is INTEGER cents, like the rest
  of the schema.
*/
const NOW_MS = `(EXTRACT(EPOCH FROM now()) * 1000)::BIGINT`

export const CRM_SCHEMA = `
CREATE TABLE IF NOT EXISTS crm_source_types (
  key        TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  is_person  BOOLEAN NOT NULL DEFAULT FALSE,
  sort       INTEGER NOT NULL DEFAULT 100,
  created_at BIGINT NOT NULL
);

INSERT INTO crm_source_types (key, label, is_person, sort, created_at) VALUES
  ('celebrity', 'Celebrity', TRUE, 10, ${NOW_MS}),
  ('individual', 'BEASTY Individual', TRUE, 20, ${NOW_MS}),
  ('influencer', 'Influencer', TRUE, 30, ${NOW_MS}),
  ('glenn', 'Glenn', TRUE, 40, ${NOW_MS}),
  ('leon', 'Leon', TRUE, 50, ${NOW_MS}),
  ('team', 'Team member', TRUE, 60, ${NOW_MS}),
  ('business', 'Existing business', TRUE, 70, ${NOW_MS}),
  ('organic', 'Organic', FALSE, 80, ${NOW_MS}),
  ('instagram', 'Instagram', FALSE, 90, ${NOW_MS}),
  ('cold_outreach', 'Cold outreach', FALSE, 100, ${NOW_MS}),
  ('referral_link', 'Referral link', FALSE, 110, ${NOW_MS}),
  ('qr_code', 'QR code', FALSE, 120, ${NOW_MS}),
  ('other', 'Other', FALSE, 130, ${NOW_MS})
ON CONFLICT (key) DO NOTHING;

/*
  Referrers and team in one table: Janelle refers businesses AND works them,
  and a second row for the same person is exactly the duplicate this avoids.
  role decides what the CRM screen lets them do; is_team decides whether they
  can be assigned a lead or close a deal.
*/
CREATE TABLE IF NOT EXISTS crm_people (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  source_type TEXT NOT NULL REFERENCES crm_source_types(key),
  role        TEXT NOT NULL DEFAULT 'none' CHECK (role IN ('admin','team','partner','none')),
  is_team     BOOLEAN NOT NULL DEFAULT FALSE,
  brand_id    TEXT,
  member_id   TEXT REFERENCES members(id) ON DELETE SET NULL,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  BIGINT NOT NULL,
  updated_at  BIGINT NOT NULL,
  created_by  TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_people_member ON crm_people(member_id) WHERE member_id IS NOT NULL;

INSERT INTO crm_people (id, slug, name, source_type, role, is_team, brand_id, created_at, updated_at, created_by) VALUES
  ('p_glenn', 'glenn', 'Glenn', 'glenn', 'admin', TRUE, NULL, ${NOW_MS}, ${NOW_MS}, 'system:seed'),
  ('p_leon', 'leon', 'Leon', 'leon', 'admin', TRUE, NULL, ${NOW_MS}, ${NOW_MS}, 'system:seed'),
  ('p_janelle', 'janelle', 'Janelle', 'individual', 'team', TRUE, 'b_nanacasas', ${NOW_MS}, ${NOW_MS}, 'system:seed')
ON CONFLICT (id) DO NOTHING;

/*
  One row per sales opportunity. A listed business (brand_id) can hold one of
  each type; an inbound Reserve-a-spot request (application_id) holds one; and
  a prospect that is not on BEASTY yet (a business Janelle is recruiting) has
  neither until it is listed, when brand_id is filled in.

  For a listed business the columns from business_name to search_text are
  SNAPSHOTS of the listing, refreshed from BRANDS at boot, so lists can filter
  and search in SQL; the listing in src/data stays the source of truth and is
  never written from here. For a prospect they are the only record.
*/
CREATE TABLE IF NOT EXISTS crm_opportunities (
  id                 TEXT PRIMARY KEY,
  brand_id           TEXT,
  application_id     TEXT REFERENCES applications(id) ON DELETE SET NULL,
  business_name      TEXT NOT NULL,
  family_key         TEXT NOT NULL,
  city               TEXT,
  category           TEXT,
  website_status     TEXT,
  phone              TEXT,
  email              TEXT,
  instagram          TEXT,
  opportunity_type   TEXT NOT NULL,
  stage              TEXT NOT NULL,
  stage_changed_at   BIGINT NOT NULL,
  referrer_id        TEXT REFERENCES crm_people(id),
  source_type        TEXT REFERENCES crm_source_types(key),
  campaign           TEXT,
  referred_at        BIGINT,
  referral_note      TEXT,
  assigned_to        TEXT REFERENCES crm_people(id),
  closed_by          TEXT REFERENCES crm_people(id),
  contact_name       TEXT,
  preferred_channel  TEXT,
  priority           TEXT NOT NULL DEFAULT 'normal',
  potential_cents    INTEGER NOT NULL DEFAULT 0 CHECK (potential_cents >= 0),
  next_followup_at   BIGINT,
  last_activity_at   BIGINT,
  first_contacted_at BIGINT,
  won_at             BIGINT,
  lost_at            BIGINT,
  search_text        TEXT NOT NULL DEFAULT '',
  backfill_run_id    TEXT,
  created_at         BIGINT NOT NULL,
  updated_at         BIGINT NOT NULL,
  created_by         TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_opp_brand_type ON crm_opportunities(brand_id, opportunity_type) WHERE brand_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_opp_application ON crm_opportunities(application_id) WHERE application_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_opp_stage ON crm_opportunities(stage, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_opp_assigned ON crm_opportunities(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_opp_referrer ON crm_opportunities(referrer_id) WHERE referrer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_opp_followup ON crm_opportunities(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_opp_family ON crm_opportunities(family_key);
CREATE INDEX IF NOT EXISTS idx_crm_opp_created ON crm_opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_opp_won ON crm_opportunities(won_at) WHERE won_at IS NOT NULL;
/* 2026-09-22: Glenn fills every blank "referred by". A referral he got only by
   default is marked, so the real first referrer can still replace it once
   without an override. Additive, and FALSE for every row that existed. */
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS referral_default BOOLEAN NOT NULL DEFAULT FALSE;
-- Contact details found while working the lead. The phone/email/instagram
-- columns above are refreshed from the listing at every boot, so what the team
-- finds lives here and only ever fills a gap the listing leaves.
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS found_phone TEXT;
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS found_email TEXT;
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS found_instagram TEXT;

CREATE TABLE IF NOT EXISTS crm_stage_history (
  id             TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES crm_opportunities(id) ON DELETE CASCADE,
  from_stage     TEXT,
  to_stage       TEXT NOT NULL,
  changed_at     BIGINT NOT NULL,
  changed_by     TEXT NOT NULL,
  note           TEXT
);

CREATE INDEX IF NOT EXISTS idx_crm_stage_hist_opp ON crm_stage_history(opportunity_id, changed_at);
CREATE INDEX IF NOT EXISTS idx_crm_stage_hist_to ON crm_stage_history(to_stage, changed_at);

CREATE TABLE IF NOT EXISTS crm_activities (
  id             TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES crm_opportunities(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  body           TEXT,
  data           JSONB,
  actor          TEXT NOT NULL,
  occurred_at    BIGINT NOT NULL,
  created_at     BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_act_opp ON crm_activities(opportunity_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS crm_followups (
  id             TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES crm_opportunities(id) ON DELETE CASCADE,
  due_at         BIGINT NOT NULL,
  owner_id       TEXT REFERENCES crm_people(id),
  priority       TEXT NOT NULL DEFAULT 'normal',
  type           TEXT NOT NULL DEFAULT 'other',
  notes          TEXT,
  completed_at   BIGINT,
  completed_by   TEXT,
  created_at     BIGINT NOT NULL,
  created_by     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_fu_open ON crm_followups(due_at) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_fu_opp ON crm_followups(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_fu_done ON crm_followups(completed_at DESC) WHERE completed_at IS NOT NULL;

/*
  The price list. Editable, because prices change; deals copy what they need
  at the moment of quoting and sale, so an edit here never rewrites history.
*/
CREATE TABLE IF NOT EXISTS crm_offers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  opportunity_type TEXT NOT NULL,
  one_time_cents   INTEGER NOT NULL CHECK (one_time_cents >= 0),
  monthly_cents    INTEGER NOT NULL DEFAULT 0 CHECK (monthly_cents >= 0),
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  sort             INTEGER NOT NULL DEFAULT 100,
  created_at       BIGINT NOT NULL,
  updated_at       BIGINT NOT NULL
);

INSERT INTO crm_offers (id, name, opportunity_type, one_time_cents, monthly_cents, active, sort, created_at, updated_at) VALUES
  ('website_build', 'Website Build', 'website', 14900, 3000, TRUE, 10, ${NOW_MS}, ${NOW_MS}),
  ('seo', 'SEO', 'seo', 15000, 3000, TRUE, 20, ${NOW_MS}, ${NOW_MS}),
  ('website_beasty_year', 'Website Build + 1 Year BEASTY Program', 'website', 19900, 3000, TRUE, 30, ${NOW_MS}, ${NOW_MS})
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS crm_deals (
  id               TEXT PRIMARY KEY,
  opportunity_id   TEXT NOT NULL REFERENCES crm_opportunities(id) ON DELETE CASCADE,
  offer_id         TEXT REFERENCES crm_offers(id),
  offer_name       TEXT NOT NULL,
  quoted_cents     INTEGER NOT NULL CHECK (quoted_cents >= 0),
  sold_cents       INTEGER CHECK (sold_cents >= 0),
  monthly_cents    INTEGER NOT NULL DEFAULT 0 CHECK (monthly_cents >= 0),
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','won','lost')),
  recurring_active BOOLEAN NOT NULL DEFAULT FALSE,
  won_at           BIGINT,
  lost_at          BIGINT,
  loss_reason      TEXT,
  closed_by        TEXT REFERENCES crm_people(id),
  created_at       BIGINT NOT NULL,
  updated_at       BIGINT NOT NULL,
  created_by       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_opp ON crm_deals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_won ON crm_deals(won_at) WHERE status = 'won';

CREATE TABLE IF NOT EXISTS crm_referral_visits (
  id         TEXT PRIMARY KEY,
  person_id  TEXT NOT NULL REFERENCES crm_people(id) ON DELETE CASCADE,
  via        TEXT NOT NULL,
  campaign   TEXT,
  visitor    TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_visits_person ON crm_referral_visits(person_id, created_at);

CREATE TABLE IF NOT EXISTS crm_sessions (
  token_hash TEXT PRIMARY KEY,
  actor      TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS crm_backfill_runs (
  id          TEXT PRIMARY KEY,
  actor       TEXT NOT NULL,
  dry_run     BOOLEAN NOT NULL,
  started_at  BIGINT NOT NULL,
  finished_at BIGINT,
  report      JSONB
);
`
