import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
/*
  Configurable so a host with a mounted disk can keep the database outside the
  deploy directory. On a host with an ephemeral filesystem (Render free tier)
  every redeploy starts an empty database — fine for a demo, not for real orders.
*/
const DB_PATH = process.env.DATABASE_PATH ?? join(here, '..', '..', 'data.db')
export const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.pragma('busy_timeout = 5000')

/**
 * Multi-tenant from the first migration. `vendor_id` on every row that carries
 * money is the difference between opening the platform to other trucks later
 * and rewriting the schema later.
 */
db.exec(`
CREATE TABLE IF NOT EXISTS vendors (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  stripe_account_id TEXT,
  payouts_enabled   INTEGER NOT NULL DEFAULT 0,
  fee_bps           INTEGER NOT NULL DEFAULT 1000,
  api_token         TEXT,
  created_at        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  code           TEXT NOT NULL,
  customer_name  TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  fulfilment     TEXT NOT NULL CHECK (fulfilment IN ('pickup','delivery')),
  subtotal       INTEGER NOT NULL,
  tax            INTEGER NOT NULL,
  service_fee    INTEGER NOT NULL,
  delivery_fee   INTEGER NOT NULL,
  tip            INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  eta_minutes    INTEGER NOT NULL,
  payment_intent TEXT,
  payment_state  TEXT NOT NULL DEFAULT 'mock',
  idempotency_key TEXT,
  created_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vendor_id     TEXT NOT NULL REFERENCES vendors(id),
  brand_ids     TEXT NOT NULL,
  state         TEXT NOT NULL DEFAULT 'queued'
                CHECK (state IN ('queued','cooking','ready','collected')),
  subtotal      INTEGER NOT NULL,
  platform_fee  INTEGER NOT NULL,
  vendor_payout INTEGER NOT NULL,
  transfer_id   TEXT,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_lines (
  id        TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  brand_id  TEXT NOT NULL,
  item_id   TEXT NOT NULL,
  name      TEXT NOT NULL,
  qty       INTEGER NOT NULL,
  unit      INTEGER NOT NULL,
  options   TEXT NOT NULL DEFAULT '[]',
  note      TEXT
);

CREATE INDEX IF NOT EXISTS idx_tickets_order  ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_vendor ON tickets(vendor_id, state);
CREATE INDEX IF NOT EXISTS idx_lines_ticket   ON ticket_lines(ticket_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Vendor applications from the empty slots on the last home-screen page.
-- A lead is worth more than an order, so this is deliberately forgiving:
-- only a name and a contact are required.
CREATE TABLE IF NOT EXISTS applications (
  id         TEXT PRIMARY KEY,
  business   TEXT NOT NULL,
  cuisine    TEXT,
  contact    TEXT NOT NULL,
  city       TEXT,
  social     TEXT,
  state      TEXT NOT NULL DEFAULT 'new'
             CHECK (state IN ('new','contacted','accepted','declined')),
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_new ON applications(state, created_at DESC);

/*
  What a business has on, on a given day.

  The date column is a plain local YYYY-MM-DD rather than a timestamp, on
  purpose: a
  special that runs "Friday" runs on the shop's Friday, and storing an instant
  would make it start at a different hour for anyone reading it from a different
  timezone. A day is not a moment.

  posted_by records who put it there. Partners cannot post yet — there is no
  per-business login — so today every row is the operator relaying what a
  business told him. When self-serve exists this is what distinguishes the two,
  and it matters: an event is a claim made in a business's name.
*/
/**
 * MEMBERS, and the three things that hang off a referral.
 *
 * "referral_code" is on the member row rather than a table of its own because
 * it is one per member for life — it is printed into their QR and shared, so it
 * must never be reissued.
 *
 * "referred_by" is the whole referral graph. Counting a member's referrals is
 * one indexed COUNT against this column, which is why there is no separate
 * referrals table to drift out of step with it.
 *
 * TIER IS NOT PROOF OF PAYMENT. It records which membership they chose; nothing
 * here charges a card. "tier_status" stays 'pending' until a payment provider
 * says otherwise, so the app can never show somebody a paid perk on the
 * strength of them having clicked a button.
 */
CREATE TABLE IF NOT EXISTS members (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  instagram     TEXT,
  phone         TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by   TEXT REFERENCES members(id),
  tier          TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pass','diamond')),
  tier_status   TEXT NOT NULL DEFAULT 'none' CHECK (tier_status IN ('none','pending','active','lapsed')),
  tier_since    INTEGER,
  -- Set when a checkout completes. The durable link for subscription events,
  -- which carry no client_reference_id of their own.
  stripe_customer TEXT,
  created_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_members_referred_by ON members(referred_by);
CREATE INDEX IF NOT EXISTS idx_members_code ON members(referral_code);

/*
  A session is a hashed token, never the token itself — the same treatment the
  vendor api_token gets. A stolen database read must not hand somebody a working
  login.
*/
/**
 * ONE-TIME CODES, for both signing up and signing back in.
 *
 * Emailing a code is what makes a SECOND DEVICE safe. Before this, the session
 * cookie was the only credential, so signing in anywhere else was impossible and
 * had to be refused — "type your email to sign in" with no proof of ownership
 * would hand anybody an account, with its referral credit and its raffle
 * tickets, for the price of guessing an address. A code proves the address.
 *
 * THE CODE IS STORED HASHED, like every other credential here. A stolen
 * database read must not hand somebody a working login.
 *
 * The pending_* columns hold what a NEW member typed while they wait for their
 * code. Nothing is written to members until the address is proven, so an
 * abandoned sign-up leaves no half-account and no email address squatting on a
 * UNIQUE index that the real owner might later need.
 *
 * attempts is a lockout, not a counter. Five wrong guesses kills the code —
 * six digits is a million combinations, which is plenty against a human and
 * nothing at all against a script left running overnight.
 */
CREATE TABLE IF NOT EXISTS login_codes (
  email             TEXT PRIMARY KEY,
  code_hash         TEXT NOT NULL,
  purpose           TEXT NOT NULL CHECK (purpose IN ('signup','signin')),
  pending_name      TEXT,
  pending_instagram TEXT,
  pending_phone     TEXT,
  pending_ref       TEXT,
  attempts          INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL,
  expires_at        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS member_sessions (
  token_hash TEXT PRIMARY KEY,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_member ON member_sessions(member_id);

/**
 * Raffle tickets, one row each.
 *
 * Rows rather than a counter on the member, because "these may be saved and
 * used to enter anytime for our monthly raffle event" means a ticket is a thing
 * with a life: earned, then later spent on a named draw. A counter cannot say
 * which draw a ticket went into.
 *
 * "earned_at_referral" is the referral count that triggered it — 3, 6, 9 — so
 * the same milestone can never mint two tickets.
 */
CREATE TABLE IF NOT EXISTS raffle_tickets (
  id                 TEXT PRIMARY KEY,
  member_id          TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  earned_at_referral INTEGER NOT NULL,
  created_at         INTEGER NOT NULL,
  used_at            INTEGER,
  used_for           TEXT,
  UNIQUE (member_id, earned_at_referral)
);

CREATE INDEX IF NOT EXISTS idx_tickets_member ON raffle_tickets(member_id);

CREATE TABLE IF NOT EXISTS events (
  id         TEXT PRIMARY KEY,
  date       TEXT NOT NULL,
  brand_id   TEXT NOT NULL,
  title      TEXT NOT NULL,
  detail     TEXT,
  time_text  TEXT,
  posted_by  TEXT NOT NULL DEFAULT 'operator'
             CHECK (posted_by IN ('operator','partner')),
  created_at INTEGER NOT NULL
);

-- The calendar always reads a date range, never the whole table.
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
`)

/**
 * Additive migrations. SQLite has no `ADD COLUMN IF NOT EXISTS`, so check
 * pragma first — this file runs on every boot against an existing data.db.
 */
function addColumn(table: string, column: string, decl: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`)
  }
}

// Tax and tip are collected per order but owed per vendor. Without these the
// platform silently keeps both — see the allocation in index.ts.
addColumn('tickets', 'tax', 'INTEGER NOT NULL DEFAULT 0')
addColumn('tickets', 'tip', 'INTEGER NOT NULL DEFAULT 0')
// The kitchen simulator must measure from the last transition, not from order
// creation, or it stampedes over whatever a real kitchen just entered.
addColumn('tickets', 'state_changed_at', 'INTEGER NOT NULL DEFAULT 0')
addColumn('orders', 'idempotency_key', 'TEXT')
addColumn('vendors', 'api_token', 'TEXT')
// Delivery was selectable and billable with nowhere to send the food.
addColumn('orders', 'address', 'TEXT')
// Binds an idempotency key to the cart it was used for, so reusing a key with
// a different order is a 409 rather than a silently discarded order.
addColumn('orders', 'request_digest', 'TEXT')
/*
  The live database already has `members` from the deploy before this one, and
  CREATE TABLE IF NOT EXISTS does not add columns to a table that exists. Without
  this line the webhook's UPDATE ... WHERE stripe_customer would throw on every
  subscription event in production while passing perfectly on a fresh local db —
  the exact shape of bug that only appears after deploying.
*/
addColumn('members', 'stripe_customer', 'TEXT')

/*
  Indexes on migrated columns must be created AFTER the ALTERs above. On an
  existing data.db the CREATE TABLE is a no-op, so an index declared alongside
  it would reference a column that does not exist yet.
*/
db.exec(`
  UPDATE tickets SET state_changed_at = created_at WHERE state_changed_at = 0;
  CREATE INDEX IF NOT EXISTS idx_tickets_open ON tickets(state, state_changed_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idem ON orders(idempotency_key)
    WHERE idempotency_key IS NOT NULL;
`)
