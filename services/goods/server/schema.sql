CREATE TABLE IF NOT EXISTS goods_migrations (
  version integer PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id text PRIMARY KEY REFERENCES "user"(id) ON DELETE RESTRICT,
  username text UNIQUE NOT NULL CHECK(username ~ '^[a-z0-9_]{3,32}$'),
  name text NOT NULL CHECK(char_length(name) BETWEEN 1 AND 80),
  bio text NOT NULL DEFAULT '' CHECK(char_length(bio)<=500),
  location text NOT NULL DEFAULT '' CHECK(char_length(location)<=80),
  avatar_photo_id uuid,
  role text NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin')),
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','restricted','deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE inventory_slots (
  owner_id text NOT NULL REFERENCES profiles(id),
  code text NOT NULL CHECK(code ~ '^[A-Z]-[1-3]$'),
  PRIMARY KEY(owner_id,code)
);
CREATE TABLE photos (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL REFERENCES profiles(id),
  storage_key text UNIQUE NOT NULL,
  width integer NOT NULL CHECK(width>0),
  height integer NOT NULL CHECK(height>0),
  bytes integer NOT NULL CHECK(bytes>0),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ADD CONSTRAINT profile_avatar_photo_fk FOREIGN KEY(avatar_photo_id) REFERENCES photos(id);
CREATE INDEX photos_owner_idx ON photos(owner_id);
CREATE TABLE listings (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL REFERENCES profiles(id),
  code text NOT NULL,
  title text NOT NULL DEFAULT '' CHECK(char_length(title)<=80),
  description text NOT NULL DEFAULT '' CHECK(char_length(description)<=2000),
  category text NOT NULL DEFAULT '',
  condition text NOT NULL DEFAULT '',
  price_cents integer CHECK(price_cents BETWEEN 1 AND 100000000),
  trade_enabled boolean NOT NULL DEFAULT true,
  trade_preferences text NOT NULL DEFAULT '' CHECK(char_length(trade_preferences)<=500),
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','reserved','traded','archived','hidden')),
  is_hidden boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1 CHECK(version>0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(owner_id,code) REFERENCES inventory_slots(owner_id,code),
  CHECK(status<>'active' OR (char_length(title)>0 AND char_length(description)>0 AND category<>'' AND condition<>''))
);
CREATE UNIQUE INDEX listing_occupied_slot_idx ON listings(owner_id,code) WHERE status IN ('draft','active','reserved');
CREATE INDEX listing_feed_idx ON listings(created_at DESC,id DESC) WHERE status IN ('active','reserved');
CREATE INDEX listing_seller_idx ON listings(owner_id,status,code);
CREATE INDEX listing_filter_idx ON listings(category,condition,status,price_cents);
CREATE INDEX listing_search_idx ON listings USING gin(to_tsvector('simple',title || ' ' || description));
CREATE TABLE listing_photos (
  listing_id uuid NOT NULL REFERENCES listings(id),
  photo_id uuid NOT NULL REFERENCES photos(id),
  position smallint NOT NULL CHECK(position BETWEEN 0 AND 5),
  PRIMARY KEY(listing_id,photo_id),
  UNIQUE(listing_id,position)
);
CREATE TABLE favorites (
  user_id text NOT NULL REFERENCES profiles(id),
  listing_id uuid NOT NULL REFERENCES listings(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,listing_id)
);
CREATE TABLE trade_offers (
  id uuid PRIMARY KEY,
  sender_id text NOT NULL REFERENCES profiles(id),
  recipient_id text NOT NULL REFERENCES profiles(id),
  offered_id uuid NOT NULL REFERENCES listings(id),
  requested_id uuid NOT NULL REFERENCES listings(id),
  offered_version integer NOT NULL,
  requested_version integer NOT NULL,
  offered_snapshot jsonb NOT NULL,
  requested_snapshot jsonb NOT NULL,
  state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','accepted','declined','withdrawn','expired','invalidated','canceled','completed','disputed')),
  client_request_id text NOT NULL,
  request_hash text NOT NULL,
  confirmed_by text[] NOT NULL DEFAULT '{}',
  cancel_requested_by text[] NOT NULL DEFAULT '{}',
  expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sender_id,client_request_id),
  CHECK(sender_id<>recipient_id),
  CHECK(offered_id<>requested_id),
  CHECK(confirmed_by <@ ARRAY[sender_id,recipient_id]),
  CHECK(cancel_requested_by <@ ARRAY[sender_id,recipient_id])
);
CREATE INDEX trade_sender_idx ON trade_offers(sender_id,created_at DESC);
CREATE INDEX trade_recipient_idx ON trade_offers(recipient_id,created_at DESC);
CREATE INDEX trade_offered_pending_idx ON trade_offers(offered_id) WHERE state='pending';
CREATE INDEX trade_requested_pending_idx ON trade_offers(requested_id) WHERE state='pending';
CREATE TABLE reservations (
  listing_id uuid PRIMARY KEY REFERENCES listings(id),
  trade_id uuid NOT NULL REFERENCES trade_offers(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reservation_trade_idx ON reservations(trade_id);
CREATE TABLE trade_events (
  id uuid PRIMARY KEY,
  trade_id uuid NOT NULL REFERENCES trade_offers(id),
  actor_id text REFERENCES profiles(id),
  action text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX trade_events_idx ON trade_events(trade_id,created_at,id);
CREATE TABLE trade_commands (
  actor_id text NOT NULL REFERENCES profiles(id),
  client_request_id text NOT NULL,
  trade_id uuid NOT NULL REFERENCES trade_offers(id),
  request_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(actor_id,client_request_id)
);
CREATE TABLE conversations (
  id uuid PRIMARY KEY,
  participant_a text NOT NULL REFERENCES profiles(id),
  participant_b text NOT NULL REFERENCES profiles(id),
  listing_id uuid REFERENCES listings(id),
  trade_id uuid REFERENCES trade_offers(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(participant_a<participant_b),
  CHECK((listing_id IS NOT NULL)::integer + (trade_id IS NOT NULL)::integer = 1)
);
CREATE UNIQUE INDEX conversation_inquiry_idx ON conversations(participant_a,participant_b,listing_id) WHERE listing_id IS NOT NULL;
CREATE UNIQUE INDEX conversation_trade_idx ON conversations(trade_id) WHERE trade_id IS NOT NULL;
CREATE INDEX conversation_a_idx ON conversations(participant_a,updated_at DESC);
CREATE INDEX conversation_b_idx ON conversations(participant_b,updated_at DESC);
CREATE TABLE messages (
  id uuid PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  sender_id text NOT NULL REFERENCES profiles(id),
  body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 2000),
  client_request_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sender_id,client_request_id)
);
CREATE INDEX messages_thread_idx ON messages(conversation_id,created_at DESC,id DESC);
CREATE TABLE conversation_reads (
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  user_id text NOT NULL REFERENCES profiles(id),
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(conversation_id,user_id)
);
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES profiles(id),
  title text NOT NULL,
  body text NOT NULL,
  href text NOT NULL CHECK(href LIKE '/%'),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX notifications_user_idx ON notifications(user_id,created_at DESC,id DESC);
CREATE TABLE blocks (
  user_id text NOT NULL REFERENCES profiles(id),
  target_id text NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,target_id),
  CHECK(user_id<>target_id)
);
CREATE TABLE reports (
  id uuid PRIMARY KEY,
  reporter_id text NOT NULL REFERENCES profiles(id),
  target_type text NOT NULL CHECK(target_type IN ('listing','user','message','trade')),
  target_id text NOT NULL,
  reason text NOT NULL CHECK(char_length(reason) BETWEEN 3 AND 2000),
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX reports_open_idx ON reports(status,created_at DESC);
CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  actor_id text REFERENCES profiles(id),
  action text NOT NULL,
  target_id text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  reset_at timestamptz NOT NULL
);
