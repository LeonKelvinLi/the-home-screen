ALTER TABLE photos ADD COLUMN thumbnail_storage_key text UNIQUE;
ALTER TABLE photos ADD CONSTRAINT photo_thumbnail_key_check
  CHECK(thumbnail_storage_key IS NULL OR thumbnail_storage_key ~ '^[a-f0-9-]{36}\.webp$');
