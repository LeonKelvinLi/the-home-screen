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
