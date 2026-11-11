CREATE TABLE managed_resale_requests (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_key text NOT NULL,
  request_hash text NOT NULL,
  contact_email text NOT NULL,
  collection_size integer NOT NULL CHECK(collection_size BETWEEN 1 AND 100000),
  goal text NOT NULL CHECK(goal IN ('consign', 'fundraiser')),
  organization text NOT NULL DEFAULT '',
  details text NOT NULL,
  state text NOT NULL DEFAULT 'submitted' CHECK(state IN ('submitted', 'reviewed', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE(owner_id, client_key)
);
CREATE UNIQUE INDEX managed_resale_one_pending ON managed_resale_requests(owner_id) WHERE state='submitted';
CREATE INDEX managed_resale_queue ON managed_resale_requests(state, created_at, id);
