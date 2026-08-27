/*
  A private Postgres database per audit run.

  The audits used to point at their own SQLite file, which made isolation free:
  a path nobody else used was a database nobody else could see. Postgres has no
  equivalent, and audit-all.sh runs six of these at once — sharing one database
  would have them truncating each other's members mid-assertion and failing in
  ways that look like real bugs.

  So each run creates its own database, named for the audit and a random suffix,
  and drops it on the way out. The suffix matters as much as the name: a rerun
  while a previous one is still finishing must not collide either.

  ADMIN_URL points at a server, not at a database. Locally that is the throwaway
  Postgres in Docker; in CI it is whatever the runner provides. Nothing here
  ever touches the production database, and it refuses to try.
*/
import pg from 'pg'
import { randomBytes } from 'node:crypto'

const ADMIN_URL =
  process.env.TEST_DATABASE_URL ??
  process.env.PGTEST_URL ??
  'postgres://beasty:beasty@localhost:55432/postgres'

/*
  A production URL must never be handed to something whose job is to CREATE and
  DROP databases. Render's hostnames are the ones that could plausibly be pasted
  in by accident.
*/
if (/\brender\.com\b|\bamazonaws\.com\b/.test(ADMIN_URL)) {
  throw new Error('pgtest refuses to run against a managed host: ' + ADMIN_URL.replace(/:[^:@/]*@/, ':***@'))
}

const base = new URL(ADMIN_URL)

/** A fresh, empty database. Returns the URL to hand the server under test. */
export async function freshTestDb(label = 'audit') {
  const safe = String(label).toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)
  const name = `bt_${safe}_${randomBytes(4).toString('hex')}`
  const admin = new pg.Client({ connectionString: ADMIN_URL })
  await admin.connect()
  try {
    // Identifiers cannot be parameterised; `name` is built from a hex suffix
    // and a slug that has had everything but [a-z0-9_] stripped.
    await admin.query(`CREATE DATABASE "${name}"`)
  } finally {
    await admin.end()
  }
  const url = new URL(base.toString())
  url.pathname = '/' + name

  const drop = async () => {
    const a = new pg.Client({ connectionString: ADMIN_URL })
    try {
      await a.connect()
      await a.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [name],
      )
      await a.query(`DROP DATABASE IF EXISTS "${name}"`)
    } catch {
      /* a leftover test database is untidy, never a failure */
    } finally {
      try { await a.end() } catch {}
    }
  }
  // Covers the ordinary exit and the ctrl-c; a killed process leaks one
  // database, which the name makes obvious and harmless.
  process.once('exit', () => { void drop() })
  process.once('SIGINT', () => { void drop().then(() => process.exit(130)) })

  return { url: url.toString(), name, drop }
}
