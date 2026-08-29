/*
  POSTGRES, NOT A FILE ON A DISK.

  Every account lived in a SQLite file on one Render disk. That is a single
  machine, no point-in-time restore, and a redeploy onto a host without that
  disk starts an empty database with every member gone. Accounts are the one
  thing here that cannot be rebuilt from the repo, so they belong in a managed
  database with backups.

  The call sites keep their shape — `db.prepare(sql).get(...)` — because
  rewriting thirty-five queries into a new query builder at the same time as
  changing databases would make any resulting bug impossible to attribute. What
  changed is that they are async now, so they are awaited.
*/
import { AsyncLocalStorage } from 'node:async_hooks'
import pg from 'pg'

/*
  BIGINT COMES BACK AS A STRING BY DEFAULT, and every timestamp here is
  `Date.now()`. Left alone, `created_at` arrives as "1787812345678", string
  comparison decides which session is expired, and arithmetic on referral
  milestones silently concatenates. node-postgres does this because an int8 can
  exceed IEEE-754's exact range; ours are milliseconds since 1970, which stays
  exact until the year 287396.
*/
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => (v === null ? null : Number(v)))

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error(
    'DATABASE_URL is not set. Accounts live in Postgres now; there is no file to fall back to.',
  )
}

export const pool = new pg.Pool({
  connectionString: url,
  /*
    Render's managed Postgres terminates TLS with its own certificate chain.
    Verification is off for that host and only that host, and never when a CA
    bundle is supplied — an unverified connection to somebody else's database
    is not something to leave switchable by accident.
  */
  ssl: /\brender\.com\b/.test(url) && !process.env.PGSSLROOTCERT
    ? { rejectUnauthorized: false }
    : undefined,
  max: Number(process.env.PGPOOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

pool.on('error', (err) => {
  // An idle client dying is normal on a managed host; it must not take the
  // process with it.
  console.error('postgres idle client error:', String(err).slice(0, 200))
})

/*
  Which client a query runs on. Inside `db.transaction` every query has to go to
  the ONE checked-out client that holds the open transaction — a query that
  wandered back to the pool would run outside it and commit on its own, which is
  the bug that makes a "transaction" a decoration.
*/
const current = new AsyncLocalStorage<pg.PoolClient>()

/*
  `?` to `$1`. The queries were written for SQLite's positional placeholders and
  are left that way, because rewriting every one by hand is a chance to
  misnumber one. There is no `?` inside a string literal in any query here; if
  one is ever added, it needs quoting-aware substitution instead.
*/
const toPg = (sql: string) => {
  let n = 0
  return sql.replace(/\?/g, () => `$${++n}`)
}

export interface Stmt {
  get<T = any>(...args: unknown[]): Promise<T | undefined>
  all<T = any>(...args: unknown[]): Promise<T[]>
  run(...args: unknown[]): Promise<{ changes: number }>
}

const exec = async (text: string, args: unknown[]) => {
  const client = current.getStore()
  return client ? client.query(text, args) : pool.query(text, args)
}

export const db = {
  prepare(sql: string): Stmt {
    const text = toPg(sql)
    return {
      async get<T>(...args: unknown[]) {
        return (await exec(text, args)).rows[0] as T | undefined
      },
      async all<T>(...args: unknown[]) {
        return (await exec(text, args)).rows as T[]
      },
      async run(...args: unknown[]) {
        const r = await exec(text, args)
        return { changes: r.rowCount ?? 0 }
      },
    }
  },

  /** Run raw SQL, for schema work only. */
  async exec(sql: string) {
    await exec(sql, [])
  },

  /**
   * Everything inside runs on one client, inside one transaction, and rolls
   * back together. The returned function is async — better-sqlite3's was not,
   * and every caller had to change.
   */
  transaction<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
    return async (...args: A): Promise<R> => {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const out = await current.run(client, () => fn(...args))
        await client.query('COMMIT')
        return out
      } catch (err) {
        try {
          await client.query('ROLLBACK')
        } catch {
          /* the client is already broken; the original error is the useful one */
        }
        throw err
      } finally {
        client.release()
      }
    }
  },
}

/**
 * Multi-tenant from the first migration. `vendor_id` on every row that carries
 * money is the difference between opening the platform to other trucks later
 * and rewriting the schema later.
 *
 * EVERY TIMESTAMP IS BIGINT. They are `Date.now()` milliseconds — about 1.79e12
 * — and Postgres `integer` stops at 2.15e9, so `integer` would have thrown on
 * the first insert. Money stays `integer`: it is in cents and nobody is taking
 * a twenty-billion-dollar order.
 */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS vendors (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  stripe_account_id TEXT,
  payouts_enabled   INTEGER NOT NULL DEFAULT 0,
  fee_bps           INTEGER NOT NULL DEFAULT 1000,
  api_token         TEXT,
  created_at        BIGINT NOT NULL
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
  address        TEXT,
  request_digest TEXT,
  created_at     BIGINT NOT NULL
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
  tax           INTEGER NOT NULL DEFAULT 0,
  tip           INTEGER NOT NULL DEFAULT 0,
  state_changed_at BIGINT NOT NULL DEFAULT 0,
  created_at    BIGINT NOT NULL
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

CREATE TABLE IF NOT EXISTS applications (
  id         TEXT PRIMARY KEY,
  business   TEXT NOT NULL,
  cuisine    TEXT,
  contact    TEXT NOT NULL,
  city       TEXT,
  social     TEXT,
  state      TEXT NOT NULL DEFAULT 'new',
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_new ON applications(state, created_at DESC);

CREATE TABLE IF NOT EXISTS members (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  instagram     TEXT,
  phone         TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by   TEXT REFERENCES members(id),
  tier          TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pass','diamond')),
  tier_status   TEXT NOT NULL DEFAULT 'none'
                CHECK (tier_status IN ('none','pending','active','lapsed')),
  tier_since    BIGINT,
  stripe_customer TEXT,
  created_at    BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_members_referred_by ON members(referred_by);
CREATE INDEX IF NOT EXISTS idx_members_code ON members(referral_code);

/*
  ONE-TIME CODES, for both signing up and signing back in. Stored HASHED, like
  every other credential here: a stolen database read must not hand somebody a
  working login. The pending_* columns hold what a new member typed while they
  wait, so an abandoned sign-up leaves no half-account squatting on the UNIQUE
  email index. attempts is a lockout, not a counter.
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
  created_at        BIGINT NOT NULL,
  expires_at        BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS member_sessions (
  token_hash TEXT PRIMARY KEY,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_member ON member_sessions(member_id);

/*
  A LINKED SIGN-IN PROVIDER — Google, Facebook or Apple.

  Its own table rather than columns on members, because one person may link
  more than one, and because the provider's id for them is the only durable
  key: an email can change at the provider and must not silently orphan or,
  worse, merge two accounts.

  UNIQUE (provider, subject) is the whole safety property. subject is the
  provider's own stable id for that user — Google's sub, Apple's sub,
  Facebook's id — never the email.
*/
CREATE TABLE IF NOT EXISTS member_identities (
  id          TEXT PRIMARY KEY,
  member_id   TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL CHECK (provider IN ('google','facebook','apple')),
  subject     TEXT NOT NULL,
  email       TEXT,
  created_at  BIGINT NOT NULL,
  UNIQUE (provider, subject)
);

CREATE INDEX IF NOT EXISTS idx_identities_member ON member_identities(member_id);

/*
  Raffle tickets, one row each — a ticket is a thing with a life: earned, then
  later spent on a named draw. earned_at_referral is the referral count that
  triggered it, so the same milestone can never mint two tickets.
*/
CREATE TABLE IF NOT EXISTS raffle_tickets (
  id                 TEXT PRIMARY KEY,
  member_id          TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  earned_at_referral INTEGER NOT NULL,
  created_at         BIGINT NOT NULL,
  used_at            BIGINT,
  used_for           TEXT,
  UNIQUE (member_id, earned_at_referral)
);

CREATE INDEX IF NOT EXISTS idx_tickets_member ON raffle_tickets(member_id);

/*
  LIKES, SAVES AND SHARES — the counts the operator asked for three times.

  His reason, in his words: "It would definitely tell our Affiliates how much
  users see them and like, add to favorites and share their page." So these are
  numbers a business owner will be shown, which decides two things about how
  they are counted.

  ONE ROW PER ACTOR PER BRAND PER KIND, enforced by the UNIQUE below. A count is
  "how many people", never "how many taps" — a number a bored thumb can inflate
  is not evidence of anything, and showing it to an affiliate would be a lie
  with a specific victim.

  brand_id is NOT a foreign key: brands live in the repo, not in this database,
  so there is no table to point at. It is their stable id string.

  actor is a member id when somebody is signed in, and otherwise a hash of a
  random per-device token the client stores. Hashed because it is written on
  every tap and never needs to be read back — the same treatment sessions and
  login codes get.
*/
CREATE TABLE IF NOT EXISTS brand_signals (
  id         TEXT PRIMARY KEY,
  brand_id   TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('like','favourite','share')),
  actor      TEXT NOT NULL,
  member_id  TEXT REFERENCES members(id) ON DELETE SET NULL,
  created_at BIGINT NOT NULL,
  UNIQUE (brand_id, kind, actor)
);

CREATE INDEX IF NOT EXISTS idx_signals_brand ON brand_signals(brand_id, kind);

CREATE TABLE IF NOT EXISTS events (
  id         TEXT PRIMARY KEY,
  date       TEXT NOT NULL,
  brand_id   TEXT NOT NULL,
  title      TEXT NOT NULL,
  detail     TEXT,
  time_text  TEXT,
  posted_by  TEXT NOT NULL DEFAULT 'operator'
             CHECK (posted_by IN ('operator','partner')),
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

/*
  Additive migrations. Postgres has ADD COLUMN IF NOT EXISTS, so unlike the
  SQLite version this needs no pragma inspection — but it still has to run
  after the CREATEs, because on an existing database CREATE TABLE IF NOT EXISTS
  is a no-op and adds nothing.
*/
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tax INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tip INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS state_changed_at BIGINT NOT NULL DEFAULT 0;
ALTER TABLE orders  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE orders  ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders  ADD COLUMN IF NOT EXISTS request_digest TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS api_token TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_customer TEXT;

UPDATE tickets SET state_changed_at = created_at WHERE state_changed_at = 0;

CREATE INDEX IF NOT EXISTS idx_tickets_open ON tickets(state, state_changed_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idem ON orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
`

/**
 * Create everything, once, before the server serves anything.
 *
 * Awaited at boot rather than run at import: an import cannot be awaited, so a
 * top-level schema build would race the first request and fail intermittently
 * on a cold start — the worst kind of bug to reproduce.
 */
/**
 * Changes to tables that already exist, in the order they were made.
 *
 * SCHEMA above only ever CREATEs, so it cannot alter a table that is already
 * out there with rows in it. Everything here has to be safe to run on every
 * boot, because it does: `IF NOT EXISTS`, or a guard that checks the current
 * shape first. Nothing here drops a column or a table — a migration that can
 * lose data is one bad deploy away from losing it.
 */
const MIGRATIONS = `
/*
  A PHONE NUMBER IS AN IDENTITY NOW, 2026-08-29, by the operator's decision:
  "we want only SMS".

  Both columns stay and both are optional. Email is not dropped, because the
  accounts that exist were created with one and no phone, and a NOT NULL phone
  would orphan them; phone is not required either, because a member who signed
  up by email before today still has to be able to get in. What changed is that
  either one can now be the thing you are known by, and the sign-up screen only
  offers the phone.

  The uniqueness is a PARTIAL index rather than a UNIQUE constraint, because a
  plain UNIQUE on a nullable column would still be right in Postgres — NULLs do
  not collide — but says less about the intent. This one says: at most one
  member per phone number, and any number of members without one.
*/
ALTER TABLE members ALTER COLUMN email DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_phone
  ON members (phone) WHERE phone IS NOT NULL;

/*
  A CODE IS KEYED BY WHATEVER IT WAS SENT TO, not by an email address.

  Renamed rather than added-and-copied: login_codes holds nothing but
  in-flight one-time codes, every row expires within ten minutes, and the
  column is its primary key. A rename keeps the key and the index; adding a
  second column would leave two ways to find a row and a choice to get wrong.
*/
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'login_codes' AND column_name = 'email'
  ) THEN
    ALTER TABLE login_codes RENAME COLUMN email TO destination;
  END IF;
END $$;

/* Which way it went out, so a resend uses the same road and the audit can tell
   an SMS code from an emailed one. */
ALTER TABLE login_codes ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'sms';
`

/**
 * Create everything, once, before the server serves anything.
 *
 * Awaited at boot rather than run at import: an import cannot be awaited, so a
 * top-level schema build would race the first request and fail intermittently
 * on a cold start — the worst kind of bug to reproduce.
 */
export async function migrate() {
  await pool.query(SCHEMA)
  await pool.query(MIGRATIONS)
}
