CREATE TABLE shared_identity_profiles (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  member_id text UNIQUE NOT NULL,
  name text NOT NULL,
  verified_email text,
  synced_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX goods_pages_subject_unique ON account("providerId","accountId") WHERE "providerId"='beastypages';
CREATE UNIQUE INDEX goods_pages_user_unique ON account("userId") WHERE "providerId"='beastypages';
