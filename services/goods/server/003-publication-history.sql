ALTER TABLE listings ADD COLUMN published_at timestamptz;
UPDATE listings SET published_at=created_at WHERE status IN ('active','reserved','traded');
