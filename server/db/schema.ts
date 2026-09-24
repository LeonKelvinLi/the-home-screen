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
import { CRM_SCHEMA } from './crm-schema'

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
                CHECK (state IN ('queued','cooking','ready','collected','cancelled')),
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

/*
  EVERY PASS SCAN, ONCE. The member card shows a signed token that rotates
  every minute; a shop verifies it through /api/pass/verify. The UNIQUE on
  token_hash is what makes a screenshot worthless: the first scan of a token
  is recorded here and the second is refused, however fresh it still looks.
  Hashed like every other token in the database.
*/
CREATE TABLE IF NOT EXISTS pass_scans (
  id         TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  scanned_by TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pass_scans_member ON pass_scans(member_id, created_at);

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
  A KITCHEN'S KEY TO ITS OWN SCREEN.

  The boot-seeded vendors.api_token was one plaintext secret per vendor that
  nobody had ever been handed, so no kitchen could sign in. These are issued by
  the operator, one per device, stored only as a SHA-256 hash, and turned off by
  stamping revoked_at rather than deleting the row, so a lost tablet's key can
  be killed and the record of it kept.
*/
CREATE TABLE IF NOT EXISTS vendor_tokens (
  id           TEXT PRIMARY KEY,
  vendor_id    TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,
  label        TEXT,
  created_at   BIGINT NOT NULL,
  last_used_at BIGINT,
  revoked_at   BIGINT
);

CREATE INDEX IF NOT EXISTS idx_vendor_tokens_vendor ON vendor_tokens(vendor_id);

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

/*
  Whether the last send of this code actually left the building, kept so that a
  rapid second request can answer honestly without sending again. See the reuse
  window in /api/members/start.
*/
ALTER TABLE login_codes ADD COLUMN IF NOT EXISTS delivered BOOLEAN NOT NULL DEFAULT TRUE;

/*
  A TICKET HAS A NUMBER ON IT. Glenn's raffle is per member — every user holds
  their own tickets — and a ticket somebody can show has to be identifiable
  by something shorter than a sixteen-hex id. BIGSERIAL numbers the rows that
  already exist in the order they were minted and every new one after them,
  so no two members can ever hold the same number.
*/
ALTER TABLE raffle_tickets ADD COLUMN IF NOT EXISTS serial BIGSERIAL;

/*
  MONTH OR YEAR. A membership can be taken yearly once Glenn names the price;
  until then every row says month, which is what every existing one is.
*/
ALTER TABLE members ADD COLUMN IF NOT EXISTS tier_interval TEXT NOT NULL DEFAULT 'month';

/*
  ORDERS BELONG TO THE MEMBER WHO PLACED THEM, when one was signed in. Order
  history used to be whichever ids this browser had kept, so a member's second
  phone showed nothing. Nullable: a signed-out order stays exactly what it was,
  and deleting a member leaves their past orders standing for the kitchens.
*/
ALTER TABLE orders ADD COLUMN IF NOT EXISTS member_id TEXT REFERENCES members(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_member ON orders(member_id, created_at) WHERE member_id IS NOT NULL;

/*
  A TICKET CAN BE CANCELLED — by the customer before any kitchen starts, or by
  the kitchen that cannot make it. The CHECK is widened in place, and only when
  it still lacks the new state, so this is safe on every boot and a no-op on a
  database created from the SCHEMA above.

  Found by what the constraint SAYS, not by its name. Postgres names an inline
  CHECK itself (tickets_state_check today), and a database created by an older
  schema could carry another name; matching on the name alone would leave that
  one in place, and every cancel would then fail the old CHECK in production
  while passing every audit, which all start from a fresh database.
*/
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS cancelled_by TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'tickets'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%collected%'
      AND pg_get_constraintdef(oid) NOT LIKE '%cancelled%'
  LOOP
    EXECUTE format('ALTER TABLE tickets DROP CONSTRAINT %I', c.conname);
  END LOOP;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'tickets'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%cancelled%'
  ) THEN
    ALTER TABLE tickets ADD CONSTRAINT tickets_state_check
      CHECK (state IN ('queued','cooking','ready','collected','cancelled'));
  END IF;
END $$;

/*
  WHICH BUSINESS'S REGISTER CODE BROUGHT A MEMBER IN. Glenn's model from 4
  August: a code at every affiliate's register, every customer who scans it a
  potential sign-up, the maintenance fee paying for the codes. The code carries
  the business; the sign-up keeps it, so each affiliate can be shown what its
  counter produced.
*/
ALTER TABLE members ADD COLUMN IF NOT EXISTS joined_via TEXT;
ALTER TABLE login_codes ADD COLUMN IF NOT EXISTS pending_via TEXT;
CREATE INDEX IF NOT EXISTS idx_members_joined_via ON members(joined_via) WHERE joined_via IS NOT NULL;

/*
  WHAT PEOPLE DO, 2026-09-22. Glenn's Home screen asked how many people use
  BEASTY and whether they come back, and nothing recorded a member doing
  anything after signing up except a like, a save, a share, an order or a pass
  scan, and a sign-in only until they signed out. So: one append-only row per
  action, named from the list in server/analytics.ts.

  member_id when a member did it (deleting a member deletes their events);
  actor for a visitor's hashed device or a CRM person. dedupe_key is set only
  for events where a repeat means nothing (opening the app twice in a day), and
  its UNIQUE index makes the second one a no-op. No names, contacts, IPs or full
  URLs, ever: see the privacy note in server/analytics.ts.
*/
CREATE TABLE IF NOT EXISTS analytics_events (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  actor_type  TEXT NOT NULL CHECK (actor_type IN ('member','visitor','team','system')),
  member_id   TEXT REFERENCES members(id) ON DELETE CASCADE,
  actor       TEXT,
  entity_type TEXT,
  entity_id   TEXT,
  session_id  TEXT,
  source      TEXT NOT NULL DEFAULT 'server',
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key  TEXT UNIQUE,
  occurred_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_aevents_member ON analytics_events(member_id, occurred_at) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aevents_name ON analytics_events(name, occurred_at);
CREATE INDEX IF NOT EXISTS idx_aevents_time ON analytics_events(occurred_at);

/* The moment tracking began, once: nothing before it was recorded, and the
   screen says so instead of reading the silence as nobody doing anything. */
INSERT INTO analytics_events (id, name, actor_type, source, dedupe_key, occurred_at)
VALUES ('ev_tracking_started', 'tracking_started', 'system', 'server', 'tracking_started',
        (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint)
ON CONFLICT DO NOTHING;

/* WHAT BROUGHT A MEMBER IN, from the visit that led to their sign-up: UTM
   fields, the referring host, the landing path. Null for everyone who signed
   up before this was kept, which the screen shows as "Unknown". */
ALTER TABLE members ADD COLUMN IF NOT EXISTS signup_attribution JSONB;
ALTER TABLE login_codes ADD COLUMN IF NOT EXISTS pending_attribution JSONB;
CREATE INDEX IF NOT EXISTS idx_members_created ON members(created_at);

/*
  RESERVE A SPOT, AS GLENN REWROTE IT ON 2026-09-22: hours, an address, and a
  phone and an email in boxes of their own, in place of "What you cook", the
  single "Phone or email" box and the city. The old columns stay for the
  requests already made, and contact is still filled for every new one.
*/
ALTER TABLE applications ADD COLUMN IF NOT EXISTS hours TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS email TEXT;

/*
  THE INTELLIGENCE LAYER'S FOUNDATION, 2026-09-24 (docs/INTELLIGENCE.md).

  VISITORS: one row per device, keyed by the same anon id the events carry (a
  hash of the httpOnly device cookie). First touch is written once and never
  overwritten; member_id is set when that device signs in or up, which is how
  a member's browsing from before they joined is joined to their account
  without rewriting a single earlier event.
*/
CREATE TABLE IF NOT EXISTS analytics_visitors (
  anon_id     TEXT PRIMARY KEY,
  first_seen  BIGINT NOT NULL,
  last_seen   BIGINT NOT NULL,
  first_touch JSONB NOT NULL DEFAULT '{}'::jsonb,
  member_id   TEXT REFERENCES members(id) ON DELETE SET NULL,
  linked_at   BIGINT,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_avisitors_member ON analytics_visitors(member_id) WHERE member_id IS NOT NULL;

/*
  SESSIONS: a visit, minted in the browser and ended by 30 idle minutes or a
  new campaign link. What brought THIS visit (last touch) lives here, next to
  the visitor's first touch, so neither overwrites the other.
*/
CREATE TABLE IF NOT EXISTS analytics_sessions (
  session_id   TEXT PRIMARY KEY,
  anon_id      TEXT,
  member_id    TEXT REFERENCES members(id) ON DELETE SET NULL,
  started_at   BIGINT NOT NULL,
  last_at      BIGINT NOT NULL,
  entry_type   TEXT,
  landing      TEXT,
  referrer     TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  device       TEXT,
  platform     TEXT,
  app_version  TEXT,
  events       INTEGER NOT NULL DEFAULT 0,
  is_bot       BOOLEAN NOT NULL DEFAULT FALSE,
  is_internal  BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_asessions_anon ON analytics_sessions(anon_id, started_at);
CREATE INDEX IF NOT EXISTS idx_asessions_started ON analytics_sessions(started_at);

/*
  EVENTS GAIN THEIR CONTEXT AS COLUMNS: who (anon id), which business, where
  (city, page kind, seat), how it was reached (surface, position), a search's
  normalized words, the device, and whether it was the team or a bot. Stored
  at the moment it happens, because seats, names and page breaks change.
*/
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS anon_id TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS brand_id TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS page_kind TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS seat TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS surface TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS query_norm TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS device TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS app_version TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS client_at BIGINT;
CREATE INDEX IF NOT EXISTS idx_aevents_brand ON analytics_events(brand_id, occurred_at) WHERE brand_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aevents_anon ON analytics_events(anon_id, occurred_at) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aevents_session ON analytics_events(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_aevents_city ON analytics_events(city, occurred_at) WHERE city IS NOT NULL;

/*
  DELETING A MEMBER NO LONGER DELETES WHAT THEY DID (Leon's call, 2026-09-24):
  their events stay, with the member link cleared, so last month's totals do
  not change when somebody leaves. Nothing personal is in an event to keep.
*/
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.referential_constraints
    WHERE constraint_name = 'analytics_events_member_id_fkey' AND delete_rule = 'CASCADE'
  ) THEN
    ALTER TABLE analytics_events DROP CONSTRAINT analytics_events_member_id_fkey;
    ALTER TABLE analytics_events ADD CONSTRAINT analytics_events_member_id_fkey
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
  END IF;
END $$;

/*
  WHAT A BUSINESS WAS, DAY BY DAY, and WHICH BUSINESS HELD WHICH SEAT WHEN.
  Both live in the repo and change with every deploy; these keep the history
  the repo overwrites, so an event can be grouped by what the business was
  that day and a seat's numbers read by who sat in it.
*/
CREATE TABLE IF NOT EXISTS analytics_brand_days (
  pt_date  TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  name     TEXT NOT NULL,
  tier     INTEGER,
  category TEXT,
  city     TEXT,
  seats    JSONB NOT NULL DEFAULT '[]'::jsonb,
  has_site BOOLEAN,
  PRIMARY KEY (pt_date, brand_id)
);
CREATE TABLE IF NOT EXISTS analytics_placements (
  seat     TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  from_at  BIGINT NOT NULL,
  to_at    BIGINT,
  PRIMARY KEY (seat, brand_id, from_at)
);
CREATE INDEX IF NOT EXISTS idx_aplacements_open ON analytics_placements(seat) WHERE to_at IS NULL;

/* When each kind of measurement began, beside tracking_started: a number is
   never shown for a time before its own tracking existed. */
INSERT INTO analytics_events (id, name, actor_type, source, metadata, dedupe_key, occurred_at)
VALUES ('ev_tracking_sessions', 'tracking_started', 'system', 'server', '{"what":"sessions, impressions, search and outbound clicks"}'::jsonb,
        'tracking_started|sessions', (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint)
ON CONFLICT DO NOTHING;
`

/**
 * Create everything, once, before the server serves anything.
 *
 * Awaited at boot rather than run at import: an import cannot be awaited, so a
 * top-level schema build would race the first request and fail intermittently
 * on a cold start — the worst kind of bug to reproduce.
 */
/*
  ONE BOOT AT A TIME. beastypages.com and the CRM's own service share this
  database and deploy from the same push, so two boots can run this at once,
  and two CREATE ... IF NOT EXISTS for the same table collide in Postgres's
  catalog: two migrate() calls on a fresh database failed three runs out of
  three ("duplicate key value violates unique constraint
  pg_type_typname_nsp_index"). A session lock makes the second wait for the
  first, after which every statement in it is a no-op. A crash mid-way ends
  the session, and the lock with it.
*/
const MIGRATE_LOCK = 72409222

export async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATE_LOCK])
    await client.query(SCHEMA)
    await client.query(MIGRATIONS)
    // The CRM's tables, after everything they reference (members, applications).
    await client.query(CRM_SCHEMA)
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATE_LOCK]).catch(() => {})
    client.release()
  }
}
