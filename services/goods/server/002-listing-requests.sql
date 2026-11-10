CREATE TABLE listing_commands (
  actor_id text NOT NULL REFERENCES profiles(id),
  client_request_id text NOT NULL,
  listing_id uuid NOT NULL REFERENCES listings(id),
  request_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(actor_id,client_request_id)
);
