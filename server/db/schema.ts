import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
export const db = new Database(join(here, '..', '..', 'data.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

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
