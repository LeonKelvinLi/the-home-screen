ALTER TABLE profiles ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
-- Separate from moderation: switching the sample catalog off must not erase
-- an administrator's is_hidden/status decisions when it is enabled again.
ALTER TABLE listings ADD COLUMN demo_disabled boolean NOT NULL DEFAULT false;
CREATE TABLE goods_demo_catalog_records (
  entity_kind text NOT NULL CHECK(entity_kind IN ('seller','listing','photo')),
  entity_id text NOT NULL,
  catalog_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(entity_kind,entity_id)
);
CREATE INDEX goods_demo_catalog_key_idx ON goods_demo_catalog_records(catalog_key);
