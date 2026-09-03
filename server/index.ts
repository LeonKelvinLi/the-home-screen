import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join, sep } from 'node:path'
import { db, migrate } from './db/schema'
import { BRANDS, VENDORS } from '../src/data/brands'
import { TIERS, rewardsFor } from '../src/data/membership'
import { FALLBACK_TAX_BPS, addedTaxFor, embeddedTaxFor } from '../src/lib/tax'

const here = dirname(fileURLToPath(import.meta.url))
const app = express()

const PORT = Number(process.env.PORT ?? 8787)
const PROD = process.env.NODE_ENV === 'production'

/*
 * Render terminates TLS upstream and forwards over http, so without this
 * req.ip is the proxy's address, req.protocol is always 'http', and every
 * visitor shares one rate-limit bucket. `1` — not `true` — because trusting
 * the whole chain lets a caller spoof their own address in X-Forwarded-For
 * and evade the limiter entirely.
 */
app.set('trust proxy', 1)

// Advertising the framework and version only helps someone pick an exploit.
app.disable('x-powered-by')

/** Force HTTPS in production. Render redirects too; this closes the gap if a
 *  custom domain is ever attached without that setting. */
app.use((req, res, next) => {
  if (PROD && req.protocol !== 'https') {
    return res.redirect(308, `https://${req.get('host')}${req.originalUrl}`)
  }
  next()
})

/**
 * Security headers.
 *
 * Written out rather than pulled from a package: it is a dozen headers, each
 * one needs a reason recorded next to it, and this is a payment-adjacent
 * service where a new dependency is its own risk.
 */
const CSP = [
  // Nothing loads from anywhere but this origin unless listed below.
  "default-src 'self'",
  // No inline <script> exists in the built index.html, so scripts need no
  // unsafe-inline — the one exception that actually matters for XSS.
  "script-src 'self'",
  // React writes ~20 style={{}} props as inline style attributes, which do
  // need unsafe-inline. Far less dangerous than allowing it for scripts.
  "style-src 'self' 'unsafe-inline'",
  // data: covers the generated SVG marks.
  "img-src 'self' data:",
  "font-src 'self'",
  // The API is same-origin, so nothing should ever call out.
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Clickjacking: nobody frames a checkout page for a good reason.
  "frame-ancestors 'none'",
].join('; ')

app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  // Do not leak which brand page a customer came from to a partner's site.
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  /*
    geolocation=(self), not (). The home screen's city label can resolve where
    the customer actually is, but only when they TAP it — never on load. The
    header has to allow the origin or that tap fails with a policy violation
    rather than a permission prompt. Everything else stays denied.
  */
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()',
  )
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  if (PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})

/*
  JSON EVERYWHERE EXCEPT THE STRIPE WEBHOOK.

  Stripe signs the exact bytes it sent, so verification needs the raw body — and
  a global express.json() consumes the stream before any route-level raw parser
  can see it. The webhook then fails signature checks forever with "payload must
  be a string or Buffer", which looks like a Stripe misconfiguration and is not:
  every real payment would sit at 'pending' and nobody would ever go active.

  Found by sending a CORRECTLY signed event, not by checking that a forged one
  was refused. A rejection test passes just as happily when nothing can ever be
  accepted.
*/
const parseJson = express.json({ limit: '256kb' })
app.use((req, res, next) => {
  if (req.path === '/api/stripe/webhook') return next()
  parseJson(req, res, next)
})
/**
 * Fallback only. Real tax is per-vendor (`vendor.taxBps`) because California
 * charges prepared-food tax at the seller's location — a cart spanning two
 * cities is genuinely taxed at two rates. This is used only if a vendor row
 * somehow predates that column.
 */
/* Imported, not re-declared — this is the copy that charges a card. */
const SERVICE_BPS = 500
const DELIVERY_FEE = 399

/**
 * Per-IP token bucket for the two anonymous write routes.
 *
 * Measured before this existed: a single connection sustained 127 orders/sec
 * (19k kitchen tickets) and 2,765 applications/sec, growing the database at
 * ~2.5 MB/s. Render's disk is 1 GB, so one laptop filled it in about seven
 * minutes, after which no real order could be written at all. Nothing else in
 * the stack would have caught it: the health check reads in-memory constants
 * and never touches the database, so the service reports healthy straight
 * through a total order-intake outage.
 *
 * In-process and therefore per-instance — fine at one instance, and the thing
 * to replace first if this ever scales out.
 */
function rateLimiter(perMinute: number, burst: number) {
  const buckets = new Map<string, { tokens: number; last: number }>()
  const RATE = perMinute / 60000

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    // `trust proxy` is set to 1, so req.ip is the real client and cannot be
    // spoofed by stuffing extra hops into X-Forwarded-For.
    const key = req.ip || 'unknown'

    /*
      Bound the map itself, or the limiter becomes the memory leak — but shed
      the RIGHT entries.

      `buckets.clear()` discarded every bucket including those currently being
      throttled, handing them back a full burst. That made the limiter fail
      OPEN under exactly the pressure it exists for: an attacker with an IPv6
      /64 keeps the map above the cap with entries younger than the 120s sweep,
      forcing a clear that resets their own throttle. Evict oldest-first
      instead, and never evict a bucket that is still in deficit.
    */
    if (buckets.size > 10000) {
      for (const [k, v] of buckets) if (now - v.last > 120000) buckets.delete(k)
      if (buckets.size > 10000) {
        let excess = buckets.size - 9000
        // Insertion order is oldest-first; a throttled bucket is kept whatever
        // its age, because forgetting it is what the attacker wants.
        for (const [k, v] of buckets) {
          if (excess <= 0) break
          if (v.tokens >= 1) {
            buckets.delete(k)
            excess--
          }
        }
      }
    }

    const b = buckets.get(key) ?? { tokens: burst, last: now }
    b.tokens = Math.min(burst, b.tokens + (now - b.last) * RATE)
    b.last = now

    if (b.tokens < 1) {
      buckets.set(key, b)
      res.setHeader('Retry-After', '60')
      return res.status(429).json({ error: 'Too many requests. Try again shortly.' })
    }
    b.tokens -= 1
    buckets.set(key, b)
    next()
  }
}

/** Hard ceilings. Every one of these is reachable by an anonymous POST. */
const MAX_LINES = 60
const MAX_QTY = 50
const MAX_NAME = 100
const MAX_PHONE = 30
const MAX_NOTE = 240
const MAX_ADDRESS = 160
/*
  Every other collection on this route is capped; this one was not, and was
  bounded only by the 256kb body limit — about 14,000 entries per line, each
  costing a linear scan of the item's option groups. Not reachable today only
  because nothing in the catalogue defines options yet, so the first choice id
  400s. That is an accident, not a defence, and it stops being true the moment
  one option group is added.
*/
const MAX_OPTIONS = 20
const MAX_ORDER_TOTAL = 200_000 // $2,000

/** A fat-fingered PLATFORM_FEE_BPS must not be able to mint negative payouts. */
const rawFee = Number(process.env.PLATFORM_FEE_BPS ?? 1000)
if (!Number.isFinite(rawFee) || rawFee < 0 || rawFee > 10000) {
  throw new Error(`PLATFORM_FEE_BPS must be 0..10000, got ${process.env.PLATFORM_FEE_BPS}`)
}
const FEE_BPS = Math.round(rawFee)

/**
 * Real payments are not wired up. Nothing here creates a PaymentIntent and
 * `stripe` is never imported, so every order is recorded `payment_state=mock`.
 *
 * PAYMENTS_WIRED is a source-level constant, NOT an env var, and that is the
 * whole point. The previous guard keyed off the mere presence of
 * STRIPE_SECRET_KEY, so an operator following render.yaml's own instruction
 * ("set STRIPE_SECRET_KEY when payments are wired") satisfied the check,
 * silenced the mock-payments warning, and still charged nobody — while the
 * client showed "One charge of $X". The safety net failed open at exactly the
 * moment it was needed. A key cannot prove a charge path exists; only code
 * can, so this flips when the charge code lands and not before.
 */
const PAYMENTS_WIRED = false
const ALLOW_MOCK = process.env.ALLOW_MOCK_PAYMENTS === '1'
if (PROD && !PAYMENTS_WIRED && !ALLOW_MOCK) {
  throw new Error(
    'Refusing to start in production: payments are not implemented.\n' +
      'Orders would reach kitchens with nothing charged.\n' +
      'For a demo deploy set ALLOW_MOCK_PAYMENTS=1 to acknowledge this.',
  )
}
if (process.env.STRIPE_SECRET_KEY && !PAYMENTS_WIRED) {
  console.warn(
    'STRIPE_SECRET_KEY is set but no charge path exists. It is being ignored.',
  )
}

/**
 * The kitchen simulator must never run where real vendors are working.
 *
 * render.yaml sets SIMULATE_KITCHEN=1, which was a no-op under the old
 * `&& !PROD`: in production every ticket stayed `queued` forever, so the
 * customer's progress bar never moved and the confirmation screen's claim
 * that the kitchen had the order was false. Honour the flag, and shout about
 * it, so a demo deploy can show real movement and nobody mistakes it for a
 * kitchen actually working the ticket.
 */
const SIMULATE_KITCHEN = process.env.SIMULATE_KITCHEN === '1'

/* ---------- vendor bootstrap ---------- */

const upsertVendor = db.prepare(
  `INSERT INTO vendors (id, name, fee_bps, api_token, created_at) VALUES (?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET
     name      = excluded.name,
     fee_bps   = excluded.fee_bps,
     -- COALESCE, not a plain assignment: the token must survive restarts, but
     -- rows that predate the api_token column still have NULL and need one.
     api_token = COALESCE(vendors.api_token, excluded.api_token)`,
)
/*
  SEEDED AT BOOT, NOT AT IMPORT — and after the schema exists.

  With SQLite the tables were built by a side effect of importing the schema
  module, so a top-level upsert was safe. Postgres cannot do that: creating
  tables is async, an import cannot be awaited, and this loop would have run
  against a database with no `vendors` table on the very first deploy. It is
  now part of `start()` below, in order, behind `await migrate()`.
*/
async function seedVendors() {
  for (const v of VENDORS) {
    // fee_bps DOES follow the env var, so changing the take rate is not a
    // silent no-op on an existing database.
    await upsertVendor.run(
      v.id, v.name, FEE_BPS, `vt_${randomBytes(24).toString('hex')}`, Date.now(),
    )
  }
}

/** Constant-time bearer check, scoped to one vendor row. */
async function authVendor(req: express.Request): Promise<string | null> {
  const header = req.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token.length < 8) return null

  const rows = await db.prepare('SELECT id, api_token FROM vendors WHERE api_token IS NOT NULL').all() as {
    id: string
    api_token: string
  }[]
  const given = Buffer.from(token)
  for (const r of rows) {
    const known = Buffer.from(r.api_token)
    if (known.length === given.length && timingSafeEqual(known, given)) return r.id
  }
  return null
}

/* ---------- catalogue ---------- */

/**
 * Flat price index. The client sends item ids and option ids only — every
 * amount is recomputed here. A cart that posts `price: 1` must not become a
 * one-cent burger.
 */
interface IndexedItem {
  brandId: string
  vendorId: string
  name: string
  price: number
  /** choiceId -> price */
  options: Map<string, number>
  /** groupId -> { max, required, choiceIds } */
  groups: Map<string, { max: number; required: boolean; choices: Set<string> }>
}

const priceIndex = new Map<string, IndexedItem>()

for (const brand of BRANDS) {
  /*
    Quoted work is not for sale, and the client saying so is not enough.

    A `quoteOnly` brand's prices are RANGES ("$650-3,000+") flattened to their
    low bound for display. BrandApp suppresses add-to-cart, but the server built
    its index from the same menu, so a hand-written POST bought a $650 website
    outright — an order and a vendor ticket for work whose price does not exist
    yet. Anything not orderable in the UI must not be orderable at all.
  */
  if (brand.quoteOnly) continue
  /*
    contactOnly too, and not only because those menus are empty today.

    The roster seeds are name-only by design and the operator's stated plan is
    to fill their details in later — the first time an item lands on one of
    them it would enter the price index and become orderable, from a business
    that has agreed nothing and has no way to receive the order. The UI has
    always refused to sell these; the server never checked.
  */
  if (brand.contactOnly) continue

  for (const cat of brand.menu) {
    for (const item of cat.items) {
      const options = new Map<string, number>()
      const groups = new Map<string, { max: number; required: boolean; choices: Set<string> }>()
      for (const g of item.options ?? []) {
        const choices = new Set<string>()
        for (const c of g.choices) {
          options.set(c.id, c.price)
          choices.add(c.id)
        }
        groups.set(g.id, { max: g.max ?? 1, required: !!g.required, choices })
      }
      priceIndex.set(item.id, {
        brandId: brand.id,
        vendorId: brand.vendorId,
        name: item.name,
        price: item.price,
        options,
        groups,
      })
    }
  }
}

/**
 * Health check. Deliberately touches the database: the catalogue alone is
 * served from memory, so it reported healthy while order intake was dead.
 */
/*
  Two changes from the obvious version, both because better-sqlite3 is
  SYNCHRONOUS and shares the one Node thread with order intake.

  `SELECT count(*) FROM orders` scans the whole table and grows with lifetime
  order count, and this route had no rate limit at all — so a flood here stalled
  the event loop and took down the thing it exists to report on. It is also
  Render's health-check path, so it cannot simply be removed or limited into
  failing. Instead: a probe that is O(1) whatever the table size, and a cached
  result so a burst costs one query per second rather than one per request.
*/
let healthAt = 0
let healthOk = true

app.get('/api/health', async (_req, res) => {
  const now = Date.now()
  if (now - healthAt > 1000) {
    try {
      // Reads the schema and touches the file; does not scan the table.
      await db.prepare('SELECT id FROM orders LIMIT 1').get()
      healthOk = true
    } catch (err) {
      console.error('health: database unreadable', err)
      healthOk = false
    }
    healthAt = now
  }
  if (!healthOk) return res.status(503).json({ ok: false })
  res.json({ ok: true })
})

app.get('/api/catalogue', rateLimiter(60, 20), (_req, res) => {
  res.json({ vendors: VENDORS, brands: BRANDS })
})

/*
  Turn a coordinate into a city name, for the home screen's location label.

  Relayed through here rather than called from the browser, for two reasons:

  1. CSP stays `connect-src 'self'`. Letting the page call a third party
     directly would mean widening that for every script on the page, which is a
     real loss on a service that takes card details, in exchange for a label.
  2. The customer's browser never talks to the geocoder, so their IP, headers
     and coordinates are not handed to a company they did not choose.

  Coordinates are rounded to three decimals — about 110 metres. Two decimals
  was a kilometre, which sounds safer and is not: it put a Dublin coordinate
  over the line into Pleasanton and named the wrong city with full confidence.
  What actually protects the customer here is the relay, not the rounding —
  their IP and headers never reach the geocoder, so the coordinate arrives
  attached to nobody.

  Free and keyless. If it is ever down or rate-limited the client keeps the
  city it already had; nothing here is load-bearing.
*/
/*
  Pull the MUNICIPALITY out of the geocoder's answer.

  Neither obvious field works on its own, and both fail in ways that look
  right:

  - `city` is the metro area. It calls Oakland, Berkeley, Fremont and Richmond
    all "San Francisco", which is worse than saying nothing.
  - `locality` is the real place almost everywhere, but inside San Francisco it
    returns a neighbourhood ("Mission-Bernal") and in New York a borough.

  The administrative hierarchy is the reliable one. OSM adminLevel 8 is the
  municipality, so that wins. San Francisco has no level 8 at all — it is a
  consolidated city and county, which sits at level 6 — so a level 6 that
  describes itself as a city is the fallback. That fallback is only ever
  reached when there is no level 8, which is why it does not turn Oakland into
  San Francisco.
*/
interface AdminArea {
  name?: unknown
  description?: unknown
  adminLevel?: unknown
}

function pickCity(j: Record<string, unknown>): string | null {
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

  const info = j.localityInfo as { administrative?: AdminArea[] } | undefined
  const admin = Array.isArray(info?.administrative) ? info!.administrative : []

  const level = (n: number) => admin.filter((a) => a.adminLevel === n)

  /*
    A point near a boundary lists EVERY neighbouring municipality at level 8 —
    Dublin's civic centre comes back as [Pleasanton, Dublin], in that order, so
    taking the first named the wrong city. `locality` is the geocoder's own
    answer for the specific point, so it breaks the tie.
  */
  const municipalities = level(8)
    .map((a) => str(a.name))
    .filter((n): n is string => Boolean(n))
  if (municipalities.length) {
    const locality = str(j.locality)
    return municipalities.find((n) => n === locality) ?? municipalities[0]
  }

  const consolidated = level(6)
    .filter((a) => /\bcity\b/i.test(String(a.description ?? '')))
    .map((a) => str(a.name))
    .find(Boolean)
  if (consolidated) return consolidated

  return str(j.locality) ?? str(j.city) ?? str(j.principalSubdivision)
}

/* Rounded coordinate -> city. The free geocoder rate-limits a burst hard, and
   neighbours share a rounded coordinate, so this absorbs most of the traffic. */
const cityCache = new Map<string, { city: string; at: number }>()
const CITY_TTL = 24 * 60 * 60 * 1000
/*
  Bound the cache, the same way the rate limiter bounds its own map.

  Keys are 3-decimal coordinate pairs, so the space is effectively unbounded and
  the only eviction was a per-entry TTL nothing ever swept. The Bay Area needs a
  few thousand entries at most; anything past this is somebody walking the
  coordinate space, and each miss also costs an outbound call to a keyless
  geocoder that will ban this server's IP long before memory becomes the
  problem. Evict oldest-first rather than clearing, so a flood cannot wipe the
  warm entries real customers are hitting.
*/
const CITY_CACHE_MAX = 5000

function rememberCity(key: string, city: string) {
  if (cityCache.size >= CITY_CACHE_MAX) {
    const now = Date.now()
    for (const [k, v] of cityCache) if (now - v.at > CITY_TTL) cityCache.delete(k)
    let excess = cityCache.size - Math.floor(CITY_CACHE_MAX * 0.9)
    // Map iterates in insertion order, so this is oldest-first.
    for (const k of cityCache.keys()) {
      if (excess-- <= 0) break
      cityCache.delete(k)
    }
  }
  cityCache.set(key, { city, at: Date.now() })
}

/*
  Turn a coordinate into a city name, for the home screen's location label.

  Relayed through here rather than called from the browser, for two reasons:

  1. CSP stays `connect-src 'self'`. Letting the page call a third party
     directly would mean widening that for every script on the page, which is a
     real loss on a service that takes card details, in exchange for a label.
  2. The customer's browser never talks to the geocoder, so their IP, headers
     and coordinates are not handed to a company they did not choose.

  Coordinates are rounded to three decimals — about 110 metres. Two decimals
  was a kilometre, which sounds safer and is not: it put a Dublin coordinate
  over the line into Pleasanton and named the wrong city with full confidence.
  What actually protects the customer here is the relay, not the rounding —
  their IP and headers never reach the geocoder, so the coordinate arrives
  attached to nobody.

  Free and keyless. If it is ever down or rate-limited the client keeps the
  city it already had; nothing here is load-bearing.
*/
app.get('/api/city', rateLimiter(30, 10), async (req, res) => {
  /*
    Reject an ABSENT or empty parameter before parsing it. Number('') is 0, not
    NaN, so `?lat=&lon=` used to sail through validation as (0, 0) — Null
    Island, in the Atlantic — and the label would confidently read
    "ATLANTIC OCEAN".
  */
  const raw = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const latRaw = raw(req.query.lat)
  const lonRaw = raw(req.query.lon)
  if (!latRaw || !lonRaw) return res.status(400).json({ error: 'bad coordinates' })

  const lat = Number(latRaw)
  const lon = Number(lonRaw)
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(400).json({ error: 'bad coordinates' })
  }

  const round = (n: number) => Math.round(n * 1000) / 1000
  const key = `${round(lat)},${round(lon)}`

  const hit = cityCache.get(key)
  if (hit && Date.now() - hit.at < CITY_TTL) {
    res.setHeader('Cache-Control', 'private, max-age=86400')
    return res.json({ city: hit.city })
  }

  const url =
    'https://api-bdc.net/data/reverse-geocode-client' +
    `?latitude=${round(lat)}&longitude=${round(lon)}&localityLanguage=en`

  try {
    // Never let a slow third party hold a request open.
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 4000)
    const r = await fetch(url, { signal: ctl.signal })
    clearTimeout(timer)
    if (!r.ok) throw new Error(`geocoder returned ${r.status}`)

    const j = (await r.json()) as Record<string, unknown>

    /*
      REJECT an IP-derived answer. Given parameters it does not like, this
      endpoint does not fail — it silently geolocates the CALLER and returns
      that with the same shape. Called from a server, the caller is the server,
      so every customer in the country would be confidently told they are in
      whatever city the host sits in.
    */
    if (j.lookupSource !== 'coordinates') {
      throw new Error(`geocoder fell back to ${String(j.lookupSource)}`)
    }

    const city = pickCity(j)
    if (!city) throw new Error('geocoder named no place')

    const trimmed = city.slice(0, 40)
    rememberCity(key, trimmed)
    res.setHeader('Cache-Control', 'private, max-age=86400')
    res.json({ city: trimmed })
  } catch (err) {
    console.error('city: reverse geocode failed', err)
    res.status(502).json({ error: 'lookup failed' })
  }
})

/* ---------- money helpers ---------- */

/**
 * Split `total` across `weights` so the parts sum to exactly `total`.
 *
 * Rounding each share independently does not do this: three vendors at
 * 333/333/334 cents give an order tax of round(1000*0.0875)=88 but per-vendor
 * shares of 29+29+29=87, and the missing cent has to come from somewhere.
 * Largest-remainder assigns the leftovers deterministically.
 */
function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum <= 0 || total === 0) return weights.map(() => 0)

  const exact = weights.map((w) => (total * w) / sum)
  const out = exact.map(Math.floor)
  let left = total - out.reduce((a, b) => a + b, 0)

  const byFrac = exact
    .map((e, i) => ({ i, frac: e - Math.floor(e) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)

  for (let k = 0; left > 0 && k < byFrac.length; k++, left--) out[byFrac[k].i]++
  return out
}

/* ---------- orders ---------- */

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Strict integer read — `Math.min(5000, NaN)` is NaN, which reaches the DB. */
function intOr(value: unknown, fallback: number, lo: number, hi: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.max(lo, Math.min(hi, Math.floor(n)))
}

app.post('/api/orders', rateLimiter(30, 10), async (req, res) => {
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const body = req.body

  const lines = Array.isArray(body.lines) ? body.lines : []
  const name = typeof body.customer === 'object' && body.customer !== null
    ? String((body.customer as Record<string, unknown>).name ?? '').trim()
    : ''
  const phone = typeof body.customer === 'object' && body.customer !== null
    ? String((body.customer as Record<string, unknown>).phone ?? '').trim()
    : ''
  const fulfilment = body.fulfilment === 'delivery' ? 'delivery' : 'pickup'
  const address = typeof body.address === 'string' ? body.address.trim().slice(0, MAX_ADDRESS) : ''
  const tipBps = intOr(body.tipBps, 0, 0, 5000)
  // A caller who sends a key believes replays are protected. Silently
  // dropping a malformed one (too long, empty, a number) turned that belief
  // into two real orders, so a bad key is now an error rather than a no-op.
  let idemKey: string | null = null
  if (body.idempotencyKey !== undefined && body.idempotencyKey !== null) {
    if (typeof body.idempotencyKey !== 'string' || body.idempotencyKey.length < 8 || body.idempotencyKey.length > 80) {
      return res.status(400).json({ error: 'idempotencyKey must be a string of 8 to 80 characters.' })
    }
    idemKey = body.idempotencyKey
  }

  if (lines.length === 0) return res.status(400).json({ error: 'Cart is empty.' })
  if (lines.length > MAX_LINES) return res.status(400).json({ error: `Too many lines (max ${MAX_LINES}).` })
  if (name.length < 2 || name.length > MAX_NAME) return res.status(400).json({ error: 'Name is required.' })
  if (phone.replace(/\D/g, '').length < 10 || phone.length > MAX_PHONE) {
    return res.status(400).json({ error: 'Valid phone required.' })
  }
  // A delivery order with no address is a paid ticket nobody can fulfil.
  if (fulfilment === 'delivery' && address.length < 6) {
    return res.status(400).json({ error: 'Delivery address required.' })
  }

  // Replaying the same submission must not print a second set of tickets —
  // but a key reused with a DIFFERENT cart is not a replay, it is a new order.
  // Returning the first order for it made the client show a green tick and
  // clear the cart, destroying the second order with nothing sent to any
  // kitchen. Bind the key to a digest of what was actually ordered.
  const requestDigest = createHash('sha256')
    .update(JSON.stringify({ lines, fulfilment, tipBps, address, name, phone }))
    .digest('hex')

  if (idemKey) {
    const prior = await db
      .prepare('SELECT id, request_digest FROM orders WHERE idempotency_key = ?')
      .get(idemKey) as { id: string; request_digest: string | null } | undefined
    if (prior) {
      if (prior.request_digest && prior.request_digest !== requestDigest) {
        return res.status(409).json({
          error: 'This idempotency key was already used for a different order.',
        })
      }
      return res.status(200).json(await readOrder(prior.id, { forCustomer: true }))
    }
  }

  type Priced = {
    vendorId: string
    brandId: string
    itemId: string
    name: string
    qty: number
    unit: number
    options: string[]
    note?: string
  }

  const priced: Priced[] = []
  for (const raw of lines) {
    if (!isObj(raw)) return res.status(400).json({ error: 'Each line must be an object.' })
    const item = priceIndex.get(String(raw.itemId))
    if (!item) return res.status(400).json({ error: `Unknown item: ${String(raw.itemId).slice(0, 60)}` })

    const qty = intOr(raw.qty, 1, 1, MAX_QTY)
    const rawOptions = Array.isArray(raw.options) ? raw.options : []
    if (rawOptions.length > MAX_OPTIONS) {
      return res.status(400).json({ error: `Too many options (max ${MAX_OPTIONS}).` })
    }

    // Group choices so `max` and `required` can actually be enforced. Without
    // this you can send `size_large` five times and be charged five times.
    const perGroup = new Map<string, Set<string>>()
    let optTotal = 0
    for (const o of rawOptions) {
      if (!isObj(o)) return res.status(400).json({ error: 'Bad option.' })
      const choiceId = String(o.choiceId)
      const price = item.options.get(choiceId)
      if (price === undefined) {
        return res.status(400).json({ error: `Unknown option: ${choiceId.slice(0, 60)}` })
      }
      const groupId = [...item.groups.entries()].find(([, g]) => g.choices.has(choiceId))?.[0]
      if (!groupId) return res.status(400).json({ error: `Orphan option: ${choiceId.slice(0, 60)}` })

      const set = perGroup.get(groupId) ?? new Set<string>()
      if (!set.has(choiceId)) {
        set.add(choiceId)
        optTotal += price
      }
      perGroup.set(groupId, set)
    }

    for (const [groupId, g] of item.groups) {
      const chosen = perGroup.get(groupId)?.size ?? 0
      if (g.required && chosen === 0) {
        return res.status(400).json({ error: `Missing required choice for ${item.name}.` })
      }
      if (chosen > g.max) {
        return res.status(400).json({ error: `Too many choices for ${item.name}.` })
      }
    }

    priced.push({
      vendorId: item.vendorId,
      brandId: item.brandId,
      itemId: String(raw.itemId),
      name: item.name,
      qty,
      unit: item.price + optTotal,
      options: [...perGroup.values()].flatMap((s) => [...s]),
      note: typeof raw.note === 'string' ? raw.note.slice(0, MAX_NOTE) : undefined,
    })
  }

  const groups = new Map<string, Priced[]>()
  for (const p of priced) {
    const list = groups.get(p.vendorId) ?? []
    list.push(p)
    groups.set(p.vendorId, list)
  }

  const subtotal = priced.reduce((s, p) => s + p.unit * p.qty, 0)

  // Each vendor is taxed at its own city's rate, so the order-level tax is the
  // sum of the per-vendor amounts rather than a rate applied to the whole cart.
  // That also makes the split exact by construction — no allocation needed.
  const vendorIds = [...groups.keys()]
  const vendorSubtotals = vendorIds.map((id) =>
    groups.get(id)!.reduce((s, p) => s + p.unit * p.qty, 0),
  )
  // Two kinds of tax. `added` is charged on top; `embedded` is already inside
  // a tax-inclusive vendor's price and is recorded, not charged. Charging the
  // second kind would overcharge every line that vendor sells.
  const addedTax = vendorIds.map((id, i) => addedTaxFor(id, vendorSubtotals[i]))
  const embeddedTax = vendorIds.map((id, i) => embeddedTaxFor(id, vendorSubtotals[i]))
  const taxShare = vendorIds.map((_, i) => addedTax[i] + embeddedTax[i])
  const tax = addedTax.reduce((a, b) => a + b, 0)

  // Charged on food, not on a tax-inclusive vendor's embedded sales tax — the
  // same base the platform fee already uses. Equal to `subtotal` unless such a
  // vendor is in the cart. The client computes this identically.
  const feeBase = subtotal - embeddedTax.reduce((a, b) => a + b, 0)
  const serviceFee = Math.round((feeBase * SERVICE_BPS) / 10000)
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0
  const tip = Math.round((feeBase * tipBps) / 10000)
  const total = subtotal + tax + serviceFee + deliveryFee + tip

  if (total > MAX_ORDER_TOTAL) {
    return res.status(400).json({ error: 'Order exceeds the maximum value.' })
  }

  // Tip is one figure entered by the customer against the whole cart, so it
  // still has to be split by subtotal with the parts summing back exactly.
  const tipShare = allocate(tip, vendorSubtotals)

  const brandPrep = new Map(BRANDS.map((b) => [b.id, b.prepMinutes]))
  const etaMinutes =
    Math.max(...priced.map((p) => brandPrep.get(p.brandId) ?? 10)) + (fulfilment === 'delivery' ? 12 : 0)

  const now = Date.now()
  const orderId = `o_${now.toString(36)}${randomBytes(6).toString('hex')}`
  // A counter code only has to be unique among orders still being worked, so
  // reuse an old number freely but never one that is live right now. Purely
  // random over 8,999 values collides with even odds after ~112 orders.
  /*
    Bounded by TIME, not by ticket state.

    The old query was `WHERE t.state != 'collected'` — an inequality on the
    leading index column, so a scan of tickets joined to orders, run
    synchronously on every order placement. With SIMULATE_KITCHEN off (which is
    where this goes the moment a real kitchen display exists) tickets never
    leave `queued`, so the set never shrinks: the scan grows with lifetime order
    count, and once distinct active codes approach 8,999 the retry loop below
    gives up and two live orders share a counter code.

    A counter code only has to be unique among orders being worked NOW, and
    nobody is working a two-day-old ticket. Bounding on created_at keeps the
    working set small forever and uses the range index.
  */
  const CODE_WINDOW_MS = 48 * 60 * 60 * 1000
  const activeCodes = new Set(
    (
      await db
        .prepare(
          `SELECT DISTINCT o.code AS code FROM orders o
           JOIN tickets t ON t.order_id = o.id
           WHERE o.created_at > ? AND t.state != 'collected'`,
        )
        .all(now - CODE_WINDOW_MS) as { code: string }[]
    ).map((r) => r.code),
  )
  let code = `#${1000 + Math.floor(Math.random() * 8999)}`
  for (let i = 0; i < 40 && activeCodes.has(code); i++) {
    code = `#${1000 + Math.floor(Math.random() * 8999)}`
  }

  const write = db.transaction(async () => {
    await db.prepare(
      `INSERT INTO orders (id, code, customer_name, customer_phone, fulfilment, subtotal, tax,
        service_fee, delivery_fee, tip, total, eta_minutes, payment_state, idempotency_key,
        address, request_digest, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      orderId, code, name, phone, fulfilment, subtotal, tax,
      serviceFee, deliveryFee, tip, total, etaMinutes, 'mock', idemKey,
      address || null, requestDigest, now,
    )

    /*
      A for-of, not forEach. forEach discards whatever its callback returns, so
      an async callback would leave every ticket insert running unawaited after
      COMMIT — the order written and its kitchen tickets missing, intermittently.
    */
    for (const [vi, vendorId] of vendorIds.entries()) {
      const list = groups.get(vendorId)!
      const vSubtotal = vendorSubtotals[vi]
      const feeBps =
        (await db.prepare('SELECT fee_bps FROM vendors WHERE id = ?').get(vendorId) as { fee_bps: number } | undefined)
          ?.fee_bps ?? FEE_BPS
      /*
        Charge the fee on FOOD, which is what the comment below has always
        claimed and what the vendor agreement is.

        For a normal vendor `vSubtotal` is pre-tax, so the two are the same
        thing. For a tax-inclusive vendor the sales tax is travelling inside
        vSubtotal, and taking 10% of that billed the kitchen for a cut of money
        it merely collects and remits to CDTFA — on a $9.00 order, 90c instead
        of 82c, an effective take of 11.03%. The embedded figure was already
        computed a few lines up and simply was not subtracted here.
      */
      const feeBase = vSubtotal - embeddedTax[vi]
      const platformFee = Math.round((feeBase * feeBps) / 10000)
      const ticketId = `t_${randomBytes(8).toString('hex')}`
      const brandIds = [...new Set(list.map((p) => p.brandId))]
      // The tip belongs to the kitchen, not the platform. The fee is taken on
      // food only, never on tax or tip.
      //
      // Only ADDED tax is handed over. A tax-inclusive vendor's tax already
      // travelled inside vSubtotal, so adding its share again here would pay
      // them the same money twice — 894 instead of 810 on a $9.00 order.
      const payout = vSubtotal - platformFee + addedTax[vi] + tipShare[vi]

      await db.prepare(
        `INSERT INTO tickets (id, order_id, vendor_id, brand_ids, subtotal, platform_fee,
          vendor_payout, tax, tip, state, state_changed_at, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,'queued',?,?)`,
      ).run(
        ticketId, orderId, vendorId, JSON.stringify(brandIds), vSubtotal, platformFee,
        payout, taxShare[vi], tipShare[vi], now, now,
      )

      for (const p of list) {
        await db.prepare(
          `INSERT INTO ticket_lines (id, ticket_id, brand_id, item_id, name, qty, unit, options, note)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        ).run(
          `tl_${randomBytes(8).toString('hex')}`,
          ticketId, p.brandId, p.itemId, p.name, p.qty, p.unit,
          JSON.stringify(p.options), p.note ?? null,
        )
      }
    }
  })

  /*
    SQLite needed IMMEDIATE here: this transaction reads fee_bps before it
    writes, which is the classic deferred-transaction upgrade deadlock once
    there is a second writer. Postgres has no such mode and no such upgrade —
    a transaction takes its snapshot at the first statement — so the plain
    BEGIN it already runs inside is the stronger guarantee.
  */
  await write()
  res.status(201).json(await readOrder(orderId, { forCustomer: true }))
})

/**
 * Vendor-scoped queue. Previously this returned every order on the platform to
 * anyone, which handed each vendor their competitors' revenue and the
 * commission rate the platform charges them.
 */
app.get('/api/orders', rateLimiter(120, 30), async (req, res) => {
  const vendorId = await authVendor(req)
  if (!vendorId) return res.status(401).json({ error: 'Vendor token required.' })

  const ids = await db
    .prepare(
      `SELECT DISTINCT o.id FROM orders o
       JOIN tickets t ON t.order_id = o.id
       WHERE t.vendor_id = ? ORDER BY o.created_at DESC LIMIT 50`,
    )
    .all(vendorId) as { id: string }[]

  /* Promise.all, not map alone: each readOrder is async now and an unresolved
     promise would serialise as {} to every vendor polling their queue. */
  res.json((await Promise.all(ids.map((r) => readOrder(r.id, { vendorId })))).filter(Boolean))
})

/**
 * Customer-facing lookup. The unguessable order id is the capability.
 *
 * A vendor also holds order ids for any cart they were part of, and this route
 * takes no auth — so before scoping, a kitchen could replay an id from its own
 * queue here and read every competitor's line items on that order. Cross-
 * referenced against the public catalogue that is the competitor's exact
 * revenue on every shared cart, which is the product's whole premise. An
 * authenticated vendor now sees only its own ticket; an anonymous caller (the
 * customer, who already knows what they ordered) still sees the whole order.
 */
app.get('/api/orders/:id', rateLimiter(120, 40), async (req, res) => {
  const vendorId = await authVendor(req)
  const orderId = String(req.params.id)
  const order = await readOrder(orderId, { forCustomer: true, ...(vendorId ? { vendorId } : {}) })
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json(order)
})

const NEXT_STATE: Record<string, string[]> = {
  queued: ['cooking'],
  cooking: ['ready'],
  ready: ['collected'],
  collected: [],
}

/** Kitchen-facing: advance a ticket. Vendor-scoped, forward-only. */
app.post('/api/tickets/:id/state', rateLimiter(120, 30), async (req, res) => {
  const vendorId = await authVendor(req)
  if (!vendorId) return res.status(401).json({ error: 'Vendor token required.' })

  const body = isObj(req.body) ? req.body : {}
  const state = typeof body.state === 'string' ? body.state : ''
  if (!['queued', 'cooking', 'ready', 'collected'].includes(state)) {
    return res.status(400).json({ error: 'Bad state' })
  }

  const ticket = await db.prepare('SELECT vendor_id, state FROM tickets WHERE id = ?').get(req.params.id) as
    | { vendor_id: string; state: string }
    | undefined
  if (!ticket) return res.status(404).json({ error: 'Not found' })
  if (ticket.vendor_id !== vendorId) return res.status(403).json({ error: 'Not your ticket.' })
  if (!NEXT_STATE[ticket.state]?.includes(state)) {
    return res.status(409).json({ error: `Cannot move ${ticket.state} -> ${state}` })
  }

  // Compare-and-swap on the observed state so two terminals cannot both advance.
  const info = await db
    .prepare('UPDATE tickets SET state = ?, state_changed_at = ? WHERE id = ? AND vendor_id = ? AND state = ?')
    .run(state, Date.now(), req.params.id, vendorId, ticket.state)
  if (info.changes === 0) return res.status(409).json({ error: 'Ticket changed underneath you.' })

  res.json({ ok: true, state })
})

interface ReadOpts {
  /** Customers must not see the platform's cut or the vendor's payout. */
  forCustomer?: boolean
  vendorId?: string
}

async function readOrder(id: string, opts: ReadOpts = {}) {
  const o = await db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!o) return null

  const tickets = (
    opts.vendorId
      ? await db.prepare('SELECT * FROM tickets WHERE order_id = ? AND vendor_id = ?').all(id, opts.vendorId)
      : await db.prepare('SELECT * FROM tickets WHERE order_id = ?').all(id)
  ) as Record<string, unknown>[]

  return {
    id: o.id,
    code: o.code,
    createdAt: o.created_at,
    fulfilment: o.fulfilment,
    etaMinutes: o.eta_minutes,
    /*
      The WHOLE-ORDER total goes to the customer only.

      /api/orders/:id was scoped so a kitchen replaying an id from its own queue
      could not read a competitor's lines, but this field sat above that branch
      and went out on the vendor queue unconditionally. A vendor holding its own
      subtotal, tax, tip, fee and payout plus the order total can bound what the
      other kitchens on a shared cart sold to within a few percent. Same leak
      the id route closed, one field higher up.
    */
    ...(opts.vendorId ? {} : { total: o.total }),
    /*
      Say it on the order itself, not just in a build flag.

      With SIMULATE_KITCHEN on, tickets march queued -> cooking -> ready on a
      timer. The client's only caveat was gated on IS_LOCAL_ONLY, which is false
      in production, so a live customer watched the bar reach "ready" about a
      minute after ordering and could drive out for food nobody had started.
      The screen can only tell the truth if the server tells it which it is.
    */
    simulated: SIMULATE_KITCHEN,
    /*
      The customer is told the phone number is "so the kitchen can reach you",
      and a delivery order is refused without an address — then neither was ever
      returned to anyone, including the authenticated vendor working the ticket.
      PII kept with no reader is the worst of both. The vendor queue gets it;
      the customer's own view still does not need it echoed back.
    */
    ...(opts.forCustomer
      ? {}
      : {
          customer: { name: o.customer_name, phone: o.customer_phone },
          address: o.address || undefined,
        }),
    tickets: await Promise.all(tickets.map(async (t) => {
      const lines = await db
        .prepare('SELECT * FROM ticket_lines WHERE ticket_id = ?')
        .all(t.id) as Record<string, unknown>[]
      return {
        id: t.id,
        vendorId: t.vendor_id,
        brandIds: JSON.parse(String(t.brand_ids)) as string[],
        state: t.state,
        ...(opts.forCustomer
          ? {}
          : {
              subtotal: t.subtotal,
              platformFee: t.platform_fee,
              vendorPayout: t.vendor_payout,
              tax: t.tax,
              tip: t.tip,
            }),
        lines: lines.map((l) => ({
          name: l.name,
          qty: l.qty,
          options: JSON.parse(String(l.options)) as string[],
          note: l.note ?? undefined,
        })),
      }
    })),
  }
}

/* ---------- kitchen simulation ---------- */

/**
 * Advances tickets on a timer so the customer's order screen has something
 * truthful to show in a demo. Measured from the LAST transition, not from order
 * creation — otherwise every stage of an old order is immediately "due" and the
 * simulator stampedes over whatever a real kitchen just entered.
 */
if (SIMULATE_KITCHEN) {
  setInterval(async () => {
    try {
      const due: Record<string, number> = { queued: 12, cooking: 45, ready: 120 }
      const rows = await db
        .prepare(
          `SELECT id, state, state_changed_at FROM tickets
           WHERE state IN ('queued','cooking','ready')`,
        )
        .all() as { id: string; state: string; state_changed_at: number }[]

      const now = Date.now()
      for (const r of rows) {
        if ((now - r.state_changed_at) / 1000 <= due[r.state]) continue
        const next = NEXT_STATE[r.state]?.[0]
        if (!next) continue
        await db.prepare(
          'UPDATE tickets SET state = ?, state_changed_at = ? WHERE id = ? AND state = ?',
        ).run(next, now, r.id, r.state)
      }
    } catch (err) {
      // An uncaught throw here is outside any request and would kill the process.
      console.error('kitchen simulator:', err)
    }
  }, 5000)
}

/* ---------- vendor applications ---------- */

const MAX_APP_FIELD = 120

/**
 * From the reserve slots on the last home-screen page. Kept permissive on
 * purpose — a half-filled lead from a food truck is still a lead — but bounded,
 * because this is an unauthenticated write like the order endpoint.
 */
app.post('/api/applications', rateLimiter(6, 3), async (req, res) => {
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const b = req.body
  const str = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MAX_APP_FIELD) : '')

  const business = str(b.business)
  const contact = str(b.contact)
  if (business.length < 2) return res.status(400).json({ error: 'Business name is required.' })
  if (contact.length < 5) return res.status(400).json({ error: 'A phone or email is required.' })

  await db.prepare(
    `INSERT INTO applications (id, business, cuisine, contact, city, social, created_at)
     VALUES (?,?,?,?,?,?,?)`,
  ).run(
    `ap_${randomBytes(8).toString('hex')}`,
    business,
    str(b.cuisine) || null,
    contact,
    str(b.city) || null,
    str(b.social) || null,
    Date.now(),
  )

  notifyLead({
    business,
    contact,
    cuisine: str(b.cuisine),
    city: str(b.city),
    social: str(b.social),
  })

  res.status(201).json({ ok: true })
})

/**
 * Deliver a new lead to a human.
 *
 * Without this the form wrote a database row and stopped. Nothing emailed,
 * nothing alerted, and the only read route needs a token — so a food truck
 * could apply and the operator would never find out. A lead nobody sees is
 * the same as no form at all.
 *
 * LEAD_WEBHOOK_URL takes a Slack or Discord incoming webhook, or any
 * automation endpoint (Zapier, Make, an email relay). Unset, this falls back
 * to the server log, which the operator can at least read in Render.
 * Delivery is best-effort and deliberately never fails the request: the lead
 * is already committed to disk, and a webhook outage must not tell a
 * prospective vendor their application was rejected.
 */
/*
  Neutralise Slack/Discord markup in a field that came off a public form.

  Every field here is attacker-supplied and goes into the `text` of a message
  the operator trusts. Slack parses mrkdwn in `text` by default, so an
  application submitted as `<!channel> URGENT` pinged the whole workspace, and
  `<https://evil.example/|Approve this vendor>` rendered as a clickable link
  with attacker-chosen anchor text. `<`, `>` and `&` are the whole grammar for
  both of Slack's link forms and its broadcast tokens; entity-escaping them is
  what Slack's own docs prescribe, and Discord renders them literally.
*/
const slackSafe = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * A lead by email, on the Resend key the login codes already use.
 *
 * The webhook above has never been set on the live service, so every lead
 * since the form shipped landed in a log nobody reads. Email is the channel
 * the operator actually has: LEAD_EMAIL (vendor leads, for Glenn) and
 * DESIGNS_LEAD_EMAIL (Get in touch on the Designs page, for Leon) are
 * comma-separated lists; unset means no email, which is the state before
 * this existed. Best-effort on purpose — the row is on disk before this runs,
 * and a mail failure must never tell the person their message was refused.
 */
async function sendLeadEmail(toRaw: string | undefined, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.OTP_FROM_EMAIL
  const to = String(toRaw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s))
  if (!key || !from || !to.length) return
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(8000),
    })
    // The status, never the body: a provider error can echo the payload back.
    if (!r.ok) console.error('lead email failed (lead is saved):', r.status)
  } catch (err) {
    console.error('lead email failed (lead is saved):', String(err))
  }
}

function notifyLead(lead: Record<string, string>) {
  const f = (v: string) => slackSafe(v)
  const line = `NEW VENDOR LEAD  ${f(lead.business)} | ${f(lead.contact)}` +
    `${lead.cuisine ? ` | ${f(lead.cuisine)}` : ''}${lead.city ? ` | ${f(lead.city)}` : ''}` +
    `${lead.social ? ` | ${f(lead.social)}` : ''}`
  console.log(line)

  void sendLeadEmail(
    process.env.LEAD_EMAIL,
    `BEASTY: new spot request from ${lead.business}`,
    `${lead.business} asked for a spot on BEASTY pages.\n\n` +
      `Contact: ${lead.contact}\n` +
      `${lead.cuisine ? `What they do: ${lead.cuisine}\n` : ''}` +
      `${lead.city ? `City: ${lead.city}\n` : ''}` +
      `${lead.social ? `Social: ${lead.social}\n` : ''}` +
      `\nSent from the Reserve a Spot form. Nothing is committed until you reply to them.`,
  )

  const url = process.env.LEAD_WEBHOOK_URL
  if (!url) return

  const timeout = AbortSignal.timeout(8000)
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // `text` is what Slack and Discord both read; the fields are there for
    // anything that wants structure. `mrkdwn: false` is belt-and-braces on top
    // of the escaping above — Slack honours it, other consumers ignore it.
    body: JSON.stringify({ text: line, mrkdwn: false, ...lead }),
    signal: timeout,
  }).catch((err) => console.error('lead webhook failed (lead is saved):', String(err)))
}

/* ---------- BEASTY Designs: get in touch ---------- */

/**
 * A name and a number from the Designs page, for Leon to call back.
 *
 * Glenn's suggestion and Leon's "Yupp that works" (2026-09-02) took Leon's
 * phone number off the page and put a Get in touch button there instead. The
 * row goes into `applications` like a vendor lead — the name in `business`,
 * `cuisine` marking it as a Designs enquiry — so the operator list shows it,
 * it is logged, and it is emailed to DESIGNS_LEAD_EMAIL. Unauthenticated and
 * bounded like the application route, for the same reasons.
 */
app.post('/api/designs/contact', rateLimiter(6, 3), async (req, res) => {
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const str = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MAX_APP_FIELD) : '')
  const name = str(req.body.name)
  const phone = str(req.body.phone)
  const digits = phone.replace(/\D/g, '')
  const phoneOk = phone.startsWith('+')
    ? digits.length >= 8
    : digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
  if (name.length < 2) return res.status(400).json({ error: 'Your name is required.' })
  if (!phoneOk) return res.status(400).json({ error: 'A phone number that can be called back is required.' })

  await db.prepare(
    `INSERT INTO applications (id, business, cuisine, contact, city, social, created_at)
     VALUES (?,?,?,?,?,?,?)`,
  ).run(
    `ap_${randomBytes(8).toString('hex')}`,
    name,
    'BEASTY Designs — get in touch',
    phone,
    null,
    null,
    Date.now(),
  )

  console.log(`NEW DESIGNS LEAD  ${slackSafe(name)} | ${slackSafe(phone)}`)
  void sendLeadEmail(
    process.env.DESIGNS_LEAD_EMAIL,
    `BEASTY Designs: ${name} asked for a call`,
    `${name} asked to be called or texted about BEASTY Designs.\n\nPhone: ${phone}\n\n` +
      'Sent from the Get in touch button on the BEASTY Designs page.',
  )

  res.status(201).json({ ok: true })
})

/**
 * Operator-facing lead list.
 *
 * This used to accept any vendor bearer token. Applications belong to the
 * operator, not to vendors, and the table has no owner column to scope by —
 * so every one of the 32 competing kitchens could read every prospective
 * vendor's name, city, phone and email and poach the pipeline. It now takes a
 * separate operator token, and if none is configured the route does not exist
 * rather than falling back to something weaker.
 */
const OPERATOR_TOKEN = process.env.OPERATOR_TOKEN ?? ''
app.get('/api/applications', rateLimiter(20, 10), async (req, res) => {
  if (OPERATOR_TOKEN.length < 16) {
    return res.status(503).json({ error: 'No operator token configured.' })
  }
  const sent = String(req.get('authorization') ?? '').replace(/^Bearer /, '')
  const a = Buffer.from(sent)
  const b = Buffer.from(OPERATOR_TOKEN)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Operator token required.' })
  }
  res.json(await db.prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT 200').all())
})

/* ---------- calendar ---------- */

/** Reused by the two operator-only routes below. */
function isOperator(req: Request): boolean {
  if (OPERATOR_TOKEN.length < 16) return false
  const sent = String(req.get('authorization') ?? '').replace(/^Bearer /, '')
  const a = Buffer.from(sent)
  const b = Buffer.from(OPERATOR_TOKEN)
  return a.length === b.length && timingSafeEqual(a, b)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MAX_EVENT_TITLE = 70
const MAX_EVENT_DETAIL = 200
const MAX_EVENT_TIME = 40

/**
 * What the businesses have on, for a month at a time.
 *
 * Public and unauthenticated, because it is what the calendar screen draws. The
 * range is required and clamped: without it the first thing anyone would do is
 * ask for every event ever posted, and the calendar never needs more than the
 * month it is showing.
 */
app.get('/api/events', rateLimiter(120, 40), async (req, res) => {
  const from = String(req.query.from ?? '')
  const to = String(req.query.to ?? '')
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return res.status(400).json({ error: 'from and to must be YYYY-MM-DD.' })
  }
  if (to < from) return res.status(400).json({ error: 'to must not precede from.' })

  const rows = await db
    .prepare(
      `SELECT id, date, brand_id, title, detail, time_text, posted_by
       FROM events WHERE date >= ? AND date <= ? ORDER BY date, created_at LIMIT 400`,
    )
    .all(from, to) as Record<string, unknown>[]

  res.setHeader('Cache-Control', 'public, max-age=60')
  res.json(
    rows.map((r) => ({
      id: r.id,
      date: r.date,
      brandId: r.brand_id,
      title: r.title,
      detail: r.detail ?? undefined,
      time: r.time_text ?? undefined,
      postedBy: r.posted_by,
    })),
  )
})

/**
 * Post one. OPERATOR ONLY.
 *
 * An event is a claim made in a named business's name, on a specific date, that
 * a customer can act on — somebody reads it and drives there. So it is not an
 * anonymous write like an order or an application: until each partner has a
 * login of their own, the only person who can put words in their mouth is the
 * operator, relaying what they told him.
 *
 * `brandId` must name a real brand. Without that check the calendar would
 * happily carry an event for a business that does not exist on the app, which
 * is a listing nobody can verify and nobody can take down.
 */
app.post('/api/events', rateLimiter(30, 10), async (req, res) => {
  if (OPERATOR_TOKEN.length < 16) {
    return res.status(503).json({ error: 'No operator token configured.' })
  }
  if (!isOperator(req)) return res.status(401).json({ error: 'Operator token required.' })
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })

  const b = req.body
  const date = String(b.date ?? '')
  const brandId = String(b.brandId ?? '')
  const title = String(b.title ?? '').trim().slice(0, MAX_EVENT_TITLE)
  const detail = String(b.detail ?? '').trim().slice(0, MAX_EVENT_DETAIL)
  const time = String(b.time ?? '').trim().slice(0, MAX_EVENT_TIME)

  if (!DATE_RE.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD.' })
  if (title.length < 2) return res.status(400).json({ error: 'A title is required.' })
  if (!BRANDS.some((x) => x.id === brandId)) {
    return res.status(400).json({ error: 'Unknown business.' })
  }

  const id = `ev_${randomBytes(8).toString('hex')}`
  await db.prepare(
    `INSERT INTO events (id, date, brand_id, title, detail, time_text, posted_by, created_at)
     VALUES (?,?,?,?,?,?,'operator',?)`,
  ).run(id, date, brandId, title, detail || null, time || null, Date.now())

  res.status(201).json({ id, date, brandId, title, detail: detail || undefined, time: time || undefined })
})

/** Take one down. Operator only, and deliberately easy — a wrong date on a real
 *  business's special needs removing in one action, not a support ticket. */
app.delete('/api/events/:id', rateLimiter(30, 10), async (req, res) => {
  if (OPERATOR_TOKEN.length < 16) {
    return res.status(503).json({ error: 'No operator token configured.' })
  }
  if (!isOperator(req)) return res.status(401).json({ error: 'Operator token required.' })
  const info = await db.prepare('DELETE FROM events WHERE id = ?').run(String(req.params.id))
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.status(204).end()
})

/* ---------- static ---------- */

app.use(
  express.static(join(here, '..', 'dist'), {
    // Vite fingerprints everything under /assets, so those can be cached hard.
    // index.html must never be, or a client keeps calling a deployed-away API.
    setHeaders: (res, path) => {
      if (path.includes(`${sep}assets${sep}`)) {
        // Vite fingerprints these, so they can never go stale.
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store')
      } else if (/\.(webp|png|jpe?g|svg|woff2?)$/i.test(path)) {
        // Images and fonts are NOT fingerprinted — the filename is the dish or
        // the brand — so they cannot be immutable. They were being served
        // max-age=0, which made every repeat visit re-request all 74 of them.
        // A day of caching plus a week of stale-while-revalidate means a
        // returning customer paints instantly and still picks up a changed
        // photo on the next load.
        res.setHeader(
          'Cache-Control',
          'public, max-age=86400, stale-while-revalidate=604800',
        )
      }
    },
  }),
)

/* ------------------------------------------------------------------ members */

/**
 * ACCOUNTS, MEMBERSHIP TIERS, REFERRALS AND RAFFLE TICKETS.
 *
 * From the operator's brief of 2026-08-24. The shape of it: signing up is free
 * and unlocks the app; a paid tier on top of that is what an affiliate honours.
 * Every member carries a referral code, and referrals pay out in two different
 * currencies that stop at different points — see src/data/membership.ts, which
 * owns that arithmetic for both the client and this file.
 *
 * NO PASSWORDS, BECAUSE HE ASKED FOR NONE: "sign up for free by entering their
 * basic information like name, email, Instagram account name and phone number
 * as optional". So the session cookie set at sign-up IS the credential.
 *
 * THAT HAS A CONSEQUENCE WORTH STATING PLAINLY: there is no way to sign in from
 * a second device, and there must not be one until email verification exists.
 * "Type your email to sign in" with no password would let anybody take over any
 * member's account — including their referral credit and their raffle tickets —
 * by guessing an address. A missing feature is recoverable; that is not.
 */

const MEMBER_FIELD_MAX = 120
const SESSION_DAYS = 180
const SESSION_COOKIE = 'beasty_member'

/** Their sharable code. No vowels or lookalikes: it gets read off a screen. */
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
async function newReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const bytes = randomBytes(8)
    let code = ''
    for (let i = 0; i < 8; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
    const taken = await db.prepare('SELECT 1 FROM members WHERE referral_code = ?').get(code)
    if (!taken) return code
  }
  throw new Error('could not allocate a referral code')
}

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex')

/*
  Set on the response directly rather than pulling in cookie-parser: it is two
  headers and this service takes payment details nowhere near it, so a new
  dependency is its own risk. httpOnly keeps it away from any script; SameSite
  Lax still sends it on the top-level navigation a shared referral link is.
*/
async function startSession(res: Response, memberId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  const now = Date.now()
  await db.prepare(
    'INSERT INTO member_sessions (token_hash, member_id, created_at, expires_at) VALUES (?,?,?,?)',
  ).run(hashToken(token), memberId, now, now + SESSION_DAYS * 864e5)
  res.cookie?.(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: PROD,
    maxAge: SESSION_DAYS * 864e5,
    path: '/',
  })
  if (!res.cookie) {
    const bits = [
      `${SESSION_COOKIE}=${token}`,
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${SESSION_DAYS * 86400}`,
      'Path=/',
    ]
    if (PROD) bits.push('Secure')
    res.setHeader('Set-Cookie', bits.join('; '))
  }
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie
  if (!raw) return null
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim())
  }
  return null
}

interface MemberRow {
  id: string
  name: string
  email: string
  instagram: string | null
  phone: string | null
  referral_code: string
  referred_by: string | null
  tier: string
  tier_status: string
  tier_since: number | null
  created_at: number
}

async function memberFromRequest(req: Request): Promise<MemberRow | null> {
  const token = readCookie(req, SESSION_COOKIE)
  if (!token) return null
  const row = await db
    .prepare(
      `SELECT m.* FROM member_sessions s
       JOIN members m ON m.id = s.member_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), Date.now()) as MemberRow | undefined
  return row ?? null
}

/**
 * Mint any raffle tickets the member has earned but not been given.
 *
 * Driven off the referral COUNT rather than off an increment at sign-up time,
 * so it is idempotent: the UNIQUE (member_id, earned_at_referral) means running
 * this twice cannot mint the same milestone twice, and a referral that arrives
 * while the server is restarting is still counted the next time anyone looks.
 */
async function syncRaffleTickets(memberId: string): Promise<void> {
  const { n } = await db
    .prepare('SELECT COUNT(*) AS n FROM members WHERE referred_by = ?')
    .get(memberId) as { n: number }
  const earned = Math.floor(n / 3)
  const insert = db.prepare(
    /* ON CONFLICT DO NOTHING is Postgres's INSERT OR IGNORE. The UNIQUE
       (member_id, earned_at_referral) is what stops a milestone minting a
       second ticket, and it is what lets this loop re-run harmlessly. */
    `INSERT INTO raffle_tickets (id, member_id, earned_at_referral, created_at)
     VALUES (?,?,?,?)
     ON CONFLICT (member_id, earned_at_referral) DO NOTHING`,
  )
  const run = db.transaction(async () => {
    for (let m = 1; m <= earned; m++) {
      await insert.run(`rt_${randomBytes(8).toString('hex')}`, memberId, m * 3, Date.now())
    }
  })
  await run()
}

/** Everything the client needs about the signed-in member, in one shape. */
/**
 * The Payment Link for a tier, with the member stitched into it.
 *
 * `client_reference_id` is the entire join between a payment and a row here —
 * without it a completed checkout is an anonymous amount of money and
 * tier_status could never leave 'pending'.
 *
 * `prefilled_email` is not decoration. The member has already proved this
 * address with a code; making them retype it at Stripe is both a step to drop
 * out at and a chance to pay under a DIFFERENT address, which is how a receipt
 * ends up somewhere the account cannot be matched to.
 *
 * Built with URL rather than string concatenation because a Payment Link may
 * already carry a query string, and `?a=b?c=d` silently loses the second one.
 */
function paymentLinkFor(tierId: string, member: { id: string; email: string }): string | null {
  const base =
    tierId === 'pass'
      ? process.env.STRIPE_PAYMENT_LINK_PASS
      : tierId === 'diamond'
        ? process.env.STRIPE_PAYMENT_LINK_DIAMOND
        : undefined
  if (!base) return null
  try {
    const u = new URL(base)
    u.searchParams.set('client_reference_id', member.id)
    /*
      ONLY WHEN THERE IS ONE. Since sign-in moved to SMS a member can have no
      email at all, and `searchParams.set` would have written the string "null"
      into the checkout — Stripe would show it in the field, the customer would
      have to clear it, and any receipt sent to it goes nowhere.

      client_reference_id above is what actually matches the payment back to
      the account, so dropping this costs a prefilled field and nothing else.
    */
    if (member.email) u.searchParams.set('prefilled_email', member.email)
    return u.toString()
  } catch {
    /* A malformed link in the environment must not take the endpoint down with
       it. Treated as unconfigured, which is the state the UI already handles. */
    return null
  }
}

/** Whether a checkout can be opened at all. Both tiers need their own link. */
const paymentsLive = () =>
  !!process.env.STRIPE_PAYMENT_LINK_PASS || !!process.env.STRIPE_PAYMENT_LINK_DIAMOND

async function memberPayload(m: MemberRow) {
  await syncRaffleTickets(m.id)
  const { referrals } = await db
    .prepare('SELECT COUNT(*) AS referrals FROM members WHERE referred_by = ?')
    .get(m.id) as { referrals: number }
  const tickets = await db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN used_at IS NULL THEN 1 ELSE 0 END) AS unused
       FROM raffle_tickets WHERE member_id = ?`,
    )
    .get(m.id) as { total: number; unused: number | null }
  const tier = TIERS.find((t) => t.id === m.tier)
  const rewards = rewardsFor(referrals, tier)
  return {
    id: m.id,
    name: m.name,
    /* BOTH, AND EITHER MAY BE NULL. Since sign-in moved to SMS a member can
       have a number and no address, or — if they joined before the change — an
       address and no number. Every screen that says who is signed in has to
       cope with that, so it is given both rather than one. */
    email: m.email,
    phone: m.phone,
    instagram: m.instagram,
    /*
      Carried on EVERY member response, not just the one that hands out a link.
      The membership screen has to say whether it can take a payment before
      anybody taps — it used to learn that only from the reply to a tap, so it
      rendered "not connected yet" even when both links were live.
    */
    paymentsConfigured: paymentsLive(),
    referralCode: m.referral_code,
    tier: m.tier,
    tierStatus: m.tier_status,
    referrals,
    raffleTickets: { total: tickets.total ?? 0, unused: tickets.unused ?? 0 },
    rewards,
  }
}

/**
 * EMAIL, for one-time codes.
 *
 * Sent with fetch against a provider's HTTP API rather than by adding an SMTP
 * client: it is one request, and this service already writes its own security
 * headers rather than pulling a package for them. RESEND_API_KEY is what the
 * operator sets; anything else with a JSON send endpoint is a two-line change.
 *
 * WITH NO KEY CONFIGURED THE CODE IS LOGGED TO THE SERVER AND NOWHERE ELSE.
 * It is never returned to the client, not even in development. A response
 * carrying the code would be a complete authentication bypass for anybody who
 * can read a network tab, and "it is only in dev" is exactly how that ships.
 */
/**
 * A US phone number, in the one shape everything downstream agrees on.
 *
 * E.164 — a plus, a country code, then digits. Everything the customer types is
 * normalised to it before it is looked up, stored or sent to, because the same
 * person will type (510) 789-3205, 510-789-3205 and 5107893205 on three
 * different days and all three have to be one account. The uniqueness index on
 * members.phone is only worth anything if what goes into it is canonical.
 *
 * TEN DIGITS IS ASSUMED TO BE +1, which is a decision and not a law: this is a
 * Bay Area directory and every number in it so far is American. Anything with
 * a leading + is taken as already international and only cleaned up.
 */
export function toE164(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '')
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null
  }
  const d = trimmed.replace(/\D/g, '')
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return null
}

/** How a code is shown back to somebody: the last four, never the whole thing. */
export function maskPhone(e164: string): string {
  return e164.length > 4 ? `\u2022\u2022\u2022 ${e164.slice(-4)}` : e164
}

/**
 * Why the sign-in email cannot reach a customer, or null if it can.
 *
 * RESEND'S SHARED SENDER ONLY DELIVERS TO THE ACCOUNT OWNER. `onboarding@resend.dev`
 * is their testing address: mail to the address that owns the Resend account
 * goes through, and mail to anybody else is refused. Configured that way in
 * production, the operator can sign in, every customer is told to check an
 * email that will never arrive, and nothing anywhere says why — the key is
 * valid, the API answers 200, and the only symptom is silence.
 *
 * Found in production on 2026-08-28 with a valid key, a from-address of
 * "BEASTY <onboarding@resend.dev>", and no verified domain on the account.
 *
 * The fix is not code: verify a domain in Resend (beastypages.com), add the
 * DNS records it prints, and point OTP_FROM_EMAIL at an address on it.
 */
export function loginEmailProblem(): string | null {
  const key = process.env.RESEND_API_KEY
  const from = process.env.OTP_FROM_EMAIL
  if (!key || !from) return 'RESEND_API_KEY or OTP_FROM_EMAIL is unset — no login email can be sent.'
  if (/@resend\.dev\b/i.test(from)) {
    return `OTP_FROM_EMAIL sends from resend.dev, which only delivers to the Resend account owner. Every other customer will be told to check an email that never arrives. Verify a domain in Resend and send from it.`
  }
  return null
}

/**
 * The code, by SMS.
 *
 * Twilio's plain Messages API rather than their Verify service, deliberately.
 * Verify would generate, send and check the code for us and skip the carrier
 * registration — but it would also take ownership of the properties this
 * codebase already proves in tools/audit-otp.mjs and tools/audit-auth.mjs: five
 * wrong guesses locks it, a resend kills the previous code, a used code cannot
 * be replayed, an expired one is refused, and no reply anywhere tells an
 * attacker whether a number is a member. Those are ours and they are tested.
 *
 * IT WILL NOT DELIVER UNTIL A2P 10DLC IS REGISTERED. Since February 2025 the US
 * carriers block unregistered application-to-person traffic on ten-digit
 * numbers outright — the API returns success and the message is dropped, which
 * is the same silent failure the resend.dev sender had. loginSmsProblem() says
 * so at boot, and there is nothing in code that can fix it.
 */
/**
 * Twilio Verify: the bridge that works before the carriers say yes.
 *
 * WHY THERE ARE TWO WAYS TO SEND. Raw SMS keeps the one-time code ours — five
 * wrong guesses locks it, a resend kills the last one, a used code cannot be
 * replayed — all of which tools/audit-otp.mjs proves on every run. But it does
 * not deliver at all until A2P 10DLC is registered, and Twilio's own guidance
 * is that campaign vetting now takes one to three weeks.
 *
 * Verify needs none of that: "Verify does not require A2P registration or
 * sender provisioning" is Twilio's wording. The cost is that Twilio generates
 * and checks the code, so the properties above become theirs rather than ours
 * and cannot be tested from here. They implement the same ones.
 *
 * So: Verify while the campaign is pending, raw SMS after it clears. Setting
 * TWILIO_VERIFY_SERVICE_SID chooses Verify; clearing it goes back. Nothing
 * else in the app knows which was used.
 */
const VERIFY_SID = () => process.env.TWILIO_VERIFY_SERVICE_SID ?? ''

async function twilioVerifyStart(phone: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || !VERIFY_SID()) return false
  try {
    const r = await fetch(`https://verify.twilio.com/v2/Services/${VERIFY_SID()}/Verifications`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, Channel: 'sms' }).toString(),
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) { console.error('verify start failed:', r.status); return false }
    return true
  } catch (err) {
    console.error('verify start failed:', String(err).slice(0, 160))
    return false
  }
}

/** Returns true only when Twilio says the code was right. */
async function twilioVerifyCheck(phone: string, code: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || !VERIFY_SID()) return false
  try {
    const r = await fetch(`https://verify.twilio.com/v2/Services/${VERIFY_SID()}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, Code: code }).toString(),
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) return false
    const body = (await r.json()) as { status?: string }
    return body.status === 'approved'
  } catch (err) {
    console.error('verify check failed:', String(err).slice(0, 160))
    return false
  }
}

async function sendLoginCodeSms(phone: string, code: string, purpose: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  const line =
    purpose === 'signup'
      ? `${code} is your BEASTY code. Enter it to finish signing up.`
      : `${code} is your BEASTY code. Enter it to sign in.`
  const body = `${line} It expires in 10 minutes. If you did not ask for it, ignore this.`

  if (!sid || !token || !from) {
    console.log(`[login-code] ${phone} ${code} (${purpose}) — SMS not configured, not delivered`)
    return false
  }
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, From: from, Body: body }).toString(),
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) {
      // The number is never logged with the code beside it on a failure path.
      console.error('login-code sms failed:', r.status)
      return false
    }
    return true
  } catch (err) {
    console.error('login-code sms failed:', String(err).slice(0, 160))
    return false
  }
}

/**
 * Why an SMS code cannot reach a customer, or null if it can.
 *
 * The same shape as loginEmailProblem, and for the same reason: this class of
 * failure is invisible from the outside until somebody cannot get in.
 */
export function loginSmsProblem(): string | null {
  const account = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  if (!account) return 'TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is unset — no sign-in SMS can be sent.'
  if (!process.env.TWILIO_VERIFY_SERVICE_SID && !process.env.TWILIO_FROM_NUMBER) {
    return 'Neither TWILIO_VERIFY_SERVICE_SID nor TWILIO_FROM_NUMBER is set — there is no way to send a code.'
  }
  if (process.env.TWILIO_VERIFY_SERVICE_SID) return null // Verify needs no registration
  if (process.env.A2P_10DLC_REGISTERED !== '1') {
    return 'A2P_10DLC_REGISTERED is not 1. US carriers drop unregistered app-to-person SMS silently, so codes may never arrive. Set it once the campaign is approved.'
  }
  return null
}

async function sendLoginCode(email: string, code: string, purpose: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.OTP_FROM_EMAIL
  const subject = `${code} is your BEASTY code`
  const line =
    purpose === 'signup'
      ? 'Enter this code to finish signing up for BEASTY.'
      : 'Enter this code to sign in to BEASTY on this device.'
  const text = `${line}\n\n${code}\n\nIt expires in 10 minutes. If you did not ask for it, ignore this email.`

  if (!key || !from) {
    console.log(`[login-code] ${email} ${code} (${purpose}) — email not configured, not delivered`)
    return false
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: [email], subject, text }),
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) {
      // The status, never the body: a provider error can echo the payload back.
      console.error('login-code email failed:', r.status)
      devCode(email, code, purpose)
      return false
    }
    return true
  } catch (err) {
    console.error('login-code email failed:', String(err))
    devCode(email, code, purpose)
    return false
  }
}

/**
 * The code, in the log, ONLY when the send failed and ONLY outside production.
 *
 * A provider that rejects a send leaves a valid code in the database that
 * nobody can reach, which in development means sign-in is simply impossible
 * and every test that walks the real form dies at the code box. The unconfigured
 * branch above has always printed it for that reason; a FAILED send is the same
 * predicament and was silent.
 *
 * PROD IS EXCLUDED and that is the whole point. A login code in a production
 * log is a credential sitting in a log aggregator, readable by anybody who can
 * read logs, for ten minutes at a time. Never there.
 */
function devCode(dest: string, code: string, purpose: string) {
  if (PROD) return
  console.log(`[login-code] ${dest} ${code} (${purpose}) — send failed, printed for development only`)
}

/** Six digits. Read aloud, typed on a phone keypad, and never a word. */
function newLoginCode(): string {
  // randomInt over a modulo of randomBytes: 256 does not divide 1e6, so the
  // modulo would make low codes very slightly likelier.
  const n = randomInt(0, 1_000_000)
  return String(n).padStart(6, '0')
}

const CODE_TTL_MS = 10 * 60 * 1000
/* Starts closer together than this reuse the outstanding code. Under the
   client's 30s resend cooldown on purpose — see the note in /start. Tunable
   from the environment so a test can hold the window open or shut; production
   never sets it. */
const RESEND_REUSE_MS = Number(process.env.RESEND_REUSE_MS ?? 25_000)
const MAX_CODE_ATTEMPTS = 5

/**
 * WHICH WAY IN ACTUALLY WORKS, asked before anybody types anything.
 *
 * Sign-in moved to SMS and this deployment has no SMS provider, so the form
 * asked every visitor for a phone number, sent nothing, and told them texting
 * was not connected. Glenn's nephew hit it on 2026-08-31; it had been that way
 * for every new sign-up since the change went out. Email was configured the
 * whole time and the server would have used it — the form simply never offered
 * it.
 *
 * So the client asks first and requests whatever can be delivered. Booleans
 * only: which vendor, which key and why not are the operator's business and
 * are already shouted into the log at boot.
 */
app.get('/api/members/channels', (_req, res) => {
  res.json({ sms: !loginSmsProblem(), email: !loginEmailProblem() })
})


/**
 * Step one: ask for a code.
 *
 * ONE ENDPOINT FOR SIGN-UP AND SIGN-IN, and the response is identical for both.
 * Telling the caller which one this was would be a membership oracle — anybody
 * could type addresses in and learn who is a BEASTY member. The server knows
 * the difference and records it; the answer does not.
 */
app.post('/api/members/start', rateLimiter(8, 4), async (req, res) => {
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const b = req.body
  const str = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MEMBER_FIELD_MAX) : '')

  /*
    A PHONE NUMBER IS THE IDENTITY NOW — "we want only SMS", 2026-08-29.

    Email is still accepted, and it has to be: the accounts that existed before
    today were created with one and no phone, and refusing it would lock those
    people out of their own membership. What changed is which one the sign-up
    screen offers, and that is the client's business rather than this route's.
  */
  const rawPhone = str(b.phone)
  const rawEmail = str(b.email).toLowerCase()
  let destination = ''
  let channel: 'sms' | 'email' = 'sms'

  const e164 = rawPhone ? toE164(rawPhone) : null
  if (rawPhone && !e164) return res.status(400).json({ error: 'Enter a mobile number we can text.' })
  // Deliberately loose. Strict-looking patterns reject real addresses.
  const emailOk = !!rawEmail && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(rawEmail)
  if (rawEmail && !emailOk) return res.status(400).json({ error: 'A valid email is required.' })
  if (!e164 && !emailOk) return res.status(400).json({ error: 'Enter a mobile number.' })

  /*
    SEND IT THE WAY THAT CAN ACTUALLY ARRIVE.

    This used to be "a phone number means SMS", with no thought about whether
    SMS worked. Sign-in moved to SMS on a deployment with no SMS provider and a
    working email one, so every sign-up that gave a number — which the form
    then insisted on — chose a channel that could not deliver, while the
    address that could sat in the same request being ignored. Nobody could join
    for two days. Glenn's nephew is who reported it, and he had given both.

    So a number is still preferred when texting works, and otherwise the code
    goes to the address that does. A number with nothing else still takes the
    SMS road, because failing there is at least honest about the only way in
    the visitor offered.
  */
  const canText = !loginSmsProblem()
  const canMail = !loginEmailProblem()
  if (e164 && (canText || !emailOk || !canMail)) {
    destination = e164
  } else {
    destination = rawEmail
    channel = 'email'
  }

  /*
    THE NAME IS VALIDATED BEFORE ANYBODY IS LOOKED UP, and that ordering is the
    whole point.

    It used to be required only for a sign-up, which meant a one-character name
    came back 400 for an unknown destination and 202 for a registered one — a
    membership oracle in a status code. Anybody could have typed numbers in and
    learned who is a BEASTY member.

    So the rule is the same for both, and the client sends a name either way.
    An existing member's stored name is not overwritten by it.
  */
  const name = str(b.name)
  if (name.length < 2) return res.status(400).json({ error: 'Your name is required.' })

  const existing = await db
    .prepare(
      channel === 'sms'
        ? 'SELECT id FROM members WHERE phone = ?'
        : 'SELECT id FROM members WHERE email = ?',
    )
    .get(destination) as { id: string } | undefined
  const purpose = existing ? 'signin' : 'signup'

  const now = Date.now()

  /*
    A CODE THAT IS STILL GOOD IS NOT REPLACED BY A RAPID RETRY.

    Every request here used to mint a fresh code, which silently killed the one
    before it. The production logs of 2026-09-01 show what that does: fifty-six
    starts in fifteen minutes from two frustrated people, each one invalidating
    the code already in their inbox — so every email that arrived was dead by
    the time it was opened, which from the chair reads as "we are not receiving
    any codes". The rapid repeats came from double-taps and from a code screen
    whose layout shifted under the finger, but the server letting each of them
    poison the last is what turned a UI stumble into a lockout.

    So a start within RESEND_REUSE_MS of the previous one, for the same
    destination and purpose, updates the pending details and sends NOTHING —
    the email already in flight carries a code that still works, and the reply
    reports the delivery result of that send. The window is under the client's
    30-second resend cooldown, so a deliberate "Send another code" still mints
    a fresh one; only the machine-gun path is absorbed.

    The code cannot be re-sent inside the window even if that were wanted:
    only its hash is stored.
  */
  const prior = await db
    .prepare('SELECT purpose, created_at, expires_at, delivered FROM login_codes WHERE destination = ?')
    .get(destination) as
    | { purpose: string; created_at: number; expires_at: number; delivered: boolean }
    | undefined
  if (
    prior &&
    prior.purpose === purpose &&
    prior.expires_at > now &&
    now - prior.created_at < RESEND_REUSE_MS
  ) {
    await db.prepare(
      `UPDATE login_codes SET
         pending_name = ?, pending_instagram = ?, pending_phone = ?, pending_ref = ?
       WHERE destination = ?`,
    ).run(
      name || null,
      str(b.instagram).replace(/^@+/, '') || null,
      channel === 'sms' ? destination : str(b.phone) || null,
      str(b.ref).toUpperCase() || null,
      destination,
    )
    return res.status(202).json({
      sent: true,
      delivered: prior.delivered,
      channel,
      minutes: Math.max(1, Math.round((prior.expires_at - now) / 60000)),
      reused: true,
    })
  }

  const code = newLoginCode()
  await db.prepare(
    `INSERT INTO login_codes
       (destination, channel, code_hash, purpose, pending_name, pending_instagram, pending_phone, pending_ref,
        attempts, created_at, expires_at)
     VALUES (?,?,?,?,?,?,?,?,0,?,?)
     ON CONFLICT(destination) DO UPDATE SET
       channel = excluded.channel,
       code_hash = excluded.code_hash,
       purpose = excluded.purpose,
       pending_name = excluded.pending_name,
       pending_instagram = excluded.pending_instagram,
       pending_phone = excluded.pending_phone,
       pending_ref = excluded.pending_ref,
       attempts = 0,
       created_at = excluded.created_at,
       expires_at = excluded.expires_at`,
  ).run(
    destination,
    channel,
    hashToken(code),
    purpose,
    name || null,
    str(b.instagram).replace(/^@+/, '') || null,
    channel === 'sms' ? destination : str(b.phone) || null,
    str(b.ref).toUpperCase() || null,
    now,
    now + CODE_TTL_MS,
  )

  const delivered =
    channel !== 'sms'
      ? await sendLoginCode(destination, code, purpose)
      : VERIFY_SID()
        /* Twilio made and sent its own code; ours stays in the row unused, so
           a later switch back to raw SMS needs no migration. */
        ? await twilioVerifyStart(destination)
        : await sendLoginCodeSms(destination, code, purpose)
  /* Recorded so a reused start inside the window can answer honestly. */
  await db.prepare('UPDATE login_codes SET delivered = ? WHERE destination = ?').run(delivered, destination)
  res.status(202).json({ sent: true, delivered, channel, minutes: CODE_TTL_MS / 60000 })
})

/**
 * Step two: prove the address, and be signed in.
 *
 * This is the only path that creates a member. Nothing exists until the code
 * comes back, so an abandoned sign-up leaves no half-account and no address
 * squatting on the UNIQUE index that its real owner might need later.
 */
app.post('/api/members/verify', rateLimiter(12, 6), async (req, res) => {
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  /*
    THE SAME DESTINATION THE CODE WENT TO. A phone number is normalised to E.164
    on the way in exactly as it was on the way out, so the row is found whether
    the customer retyped it with brackets, dashes or neither.
  */
  const rawPhone = typeof req.body.phone === 'string' ? req.body.phone : ''
  const rawEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const destination = rawPhone ? (toE164(rawPhone) ?? '') : rawEmail
  const byPhone = !!rawPhone
  const code = typeof req.body.code === 'string' ? req.body.code.replace(/\D/g, '') : ''
  if (!destination || code.length !== 6) return res.status(400).json({ error: 'Enter the 6-digit code.' })

  const row = await db.prepare('SELECT * FROM login_codes WHERE destination = ?').get(destination) as
    | {
        email: string
        code_hash: string
        purpose: string
        pending_name: string | null
        pending_instagram: string | null
        pending_phone: string | null
        pending_ref: string | null
        attempts: number
        expires_at: number
      }
    | undefined

  // One message for missing, expired and exhausted alike. Distinguishing them
  // tells an attacker which addresses have a code outstanding.
  const dead = () => res.status(400).json({ error: 'That code is wrong or has expired.' })
  if (!row) return dead()
  if (row.expires_at < Date.now() || row.attempts >= MAX_CODE_ATTEMPTS) {
    await db.prepare('DELETE FROM login_codes WHERE destination = ?').run(destination)
    return dead()
  }

  /*
    timingSafeEqual over the HASHES, not the codes. Comparing hashes keeps both
    sides a fixed 64 bytes, so the length check that timingSafeEqual demands can
    never itself leak anything about the real code.
  */
  /*
    WHO OWNS THE CODE DEPENDS ON WHICH ROAD IT TOOK. With Verify configured
    Twilio generated it and only Twilio can say whether it is right; the row
    here still carries our own unused code and its attempt counter, so the
    lockout below applies either way and a switch back needs no migration.
  */
  const okByVerify = byPhone && VERIFY_SID() ? await twilioVerifyCheck(destination, code) : null
  const want = Buffer.from(row.code_hash, 'hex')
  const got = Buffer.from(hashToken(code), 'hex')
  const matches = okByVerify === null ? want.length === got.length && timingSafeEqual(want, got) : okByVerify
  if (!matches) {
    await db.prepare('UPDATE login_codes SET attempts = attempts + 1 WHERE destination = ?').run(destination)
    return dead()
  }

  await db.prepare('DELETE FROM login_codes WHERE destination = ?').run(destination)

  const existing = await db
    .prepare(byPhone ? 'SELECT * FROM members WHERE phone = ?' : 'SELECT * FROM members WHERE email = ?')
    .get(destination) as MemberRow | undefined

  if (existing) {
    await startSession(res, existing.id)
    return res.json(await memberPayload(existing))
  }

  const refCode = row.pending_ref ?? ''
  const referrer = refCode
    ? (await db.prepare('SELECT id FROM members WHERE referral_code = ?').get(refCode) as
        | { id: string }
        | undefined)
    : undefined

  const id = `mb_${randomBytes(8).toString('hex')}`
  await db.prepare(
    `INSERT INTO members (id, name, email, instagram, phone, referral_code, referred_by, created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).run(
    id,
    row.pending_name ?? 'Member',
    /* Whichever one they proved. The other stays null until they give it —
       an account keyed by a phone number has no email to invent. */
    byPhone ? null : destination,
    row.pending_instagram,
    byPhone ? destination : row.pending_phone,
    await newReferralCode(),
    referrer?.id ?? null,
    Date.now(),
  )
  // Their referrer may have just crossed a milestone.
  if (referrer) await syncRaffleTickets(referrer.id)

  await startSession(res, id)
  const fresh = await db.prepare('SELECT * FROM members WHERE id = ?').get(id) as MemberRow
  res.status(201).json(await memberPayload(fresh))
})

/** Who am I. The client calls this on boot to decide whether to gate. */
app.get('/api/members/me', rateLimiter(60, 20), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  res.json(await memberPayload(m))
})

/**
 * Who else is here — the Contacts list in the Phone app.
 *
 * Glenn, 2026-09-02: "how soon can we have the contact list update every time
 * a user signs up?" Members only: a stranger cannot see who joined. And what
 * a member sees of another member is a first name, a last initial and the
 * month they joined — never a number, an address or a handle, which is the
 * difference between a community list and a leak.
 */
app.get('/api/members/directory', rateLimiter(60, 20), async (req, res) => {
  const me = await memberFromRequest(req)
  if (!me) return res.status(401).json({ error: 'Not signed in.' })
  const rows = await db
    .prepare('SELECT id, name, created_at FROM members ORDER BY LOWER(name) ASC, created_at ASC LIMIT 1000')
    .all() as { id: string; name: string; created_at: number }[]
  const shorten = (full: string) => {
    const parts = String(full || 'Member').trim().split(/\s+/).filter(Boolean)
    if (parts.length < 2) return parts[0] || 'Member'
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
  }
  res.json({
    count: rows.length,
    members: rows.map((r) => ({ id: r.id, name: shorten(r.name), since: r.created_at, me: r.id === me.id })),
  })
})

/** Sign out on this device. */
app.post('/api/members/signout', rateLimiter(20, 10), async (req, res) => {
  const token = readCookie(req, SESSION_COOKIE)
  if (token) await db.prepare('DELETE FROM member_sessions WHERE token_hash = ?').run(hashToken(token))
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`)
  res.json({ ok: true })
})

/**
 * Choose a tier.
 *
 * RECORDS THE CHOICE AND HANDS BACK A PAYMENT LINK. It does not charge and it
 * does not mark anybody paid: `tier_status` goes to 'pending' and only a
 * payment provider may move it to 'active'. Until STRIPE_PAYMENT_LINK_* are
 * configured the response says so, and the client shows that rather than
 * pretending a checkout exists.
 */
app.post('/api/members/tier', rateLimiter(12, 6), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const id = typeof req.body.tier === 'string' ? req.body.tier : ''
  const tier = TIERS.find((t) => t.id === id)
  if (!tier) return res.status(400).json({ error: 'Unknown membership.' })

  await db.prepare('UPDATE members SET tier = ?, tier_status = ?, tier_since = ? WHERE id = ?').run(
    tier.id,
    'pending',
    Date.now(),
    m.id,
  )

  const row = await db.prepare('SELECT * FROM members WHERE id = ?').get(m.id) as MemberRow
  res.json({
    ...(await memberPayload(row)),
    paymentLink: paymentLinkFor(tier.id, { id: m.id, email: row.email }),
  })
})


/* ---------- likes, saves and shares ---------- */

/*
  THE COUNTS THE OPERATOR ASKED FOR, and the reason they are computed here
  rather than in the browser.

  His ask: a heart, and a number on the heart, the star and the share — "It
  would definitely tell our Affiliates how much users see them and like, add to
  favorites and share their page." Favourites were localStorage until now, which
  is per-device and per-browser: there was no honest number to show anybody.

  ONE ROW PER ACTOR PER BRAND PER KIND. The count is how many PEOPLE, never how
  many taps. A business owner is going to be shown these numbers, and a figure
  that a bored thumb can run up is not evidence of anything.
*/
const DEVICE_COOKIE = 'beasty_device'
const SIGNAL_KINDS = new Set(['like', 'favourite', 'share'])

/**
 * Who is doing this — the member if signed in, otherwise the device.
 *
 * The device token is minted here and set httpOnly: the client never needs to
 * read it, and a value the page cannot see is a value a page cannot forge into
 * somebody else's. Stored hashed, like every other token in this file.
 */
function actorFor(req: Request, res: Response, memberId: string | null): string {
  if (memberId) return `m:${memberId}`
  let device = readCookie(req, DEVICE_COOKIE)
  if (!device) {
    device = randomBytes(16).toString('base64url')
    res.cookie?.(DEVICE_COOKIE, device, {
      httpOnly: true,
      sameSite: 'lax',
      secure: PROD,
      maxAge: 365 * 864e5,
      path: '/',
    })
  }
  return `d:${hashToken(device)}`
}

async function signalCounts(brandId: string, actor: string) {
  const rows = await db
    .prepare('SELECT kind, COUNT(*) AS n FROM brand_signals WHERE brand_id = ? GROUP BY kind')
    .all(brandId) as { kind: string; n: number }[]
  const mine = await db
    .prepare('SELECT kind FROM brand_signals WHERE brand_id = ? AND actor = ?')
    .all(brandId, actor) as { kind: string }[]
  const count = { like: 0, favourite: 0, share: 0 }
  for (const r of rows) if (r.kind in count) (count as any)[r.kind] = Number(r.n)
  return {
    counts: count,
    mine: {
      like: mine.some((m) => m.kind === 'like'),
      favourite: mine.some((m) => m.kind === 'favourite'),
      share: mine.some((m) => m.kind === 'share'),
    },
  }
}

app.get('/api/brands/:id/signals', rateLimiter(240, 60), async (req, res) => {
  const brandId = String(req.params.id)
  const m = await memberFromRequest(req)
  const actor = actorFor(req, res, m?.id ?? null)
  res.json(await signalCounts(brandId, actor))
})

/*
  Toggle for a heart or a star; a share is recorded once and stays.

  Un-sharing is not a thing that happened — the page did go out — so the row is
  left alone rather than letting a second tap of Share decrement a number an
  affiliate is being shown.
*/
app.post('/api/brands/:id/signals/:kind', rateLimiter(60, 20), async (req, res) => {
  const brandId = String(req.params.id)
  const kind = String(req.params.kind)
  if (!SIGNAL_KINDS.has(kind)) return res.status(400).json({ error: 'Unknown signal.' })

  const m = await memberFromRequest(req)
  const actor = actorFor(req, res, m?.id ?? null)
  const existing = await db
    .prepare('SELECT id FROM brand_signals WHERE brand_id = ? AND kind = ? AND actor = ?')
    .get(brandId, kind, actor) as { id: string } | undefined

  if (existing && kind !== 'share') {
    await db.prepare('DELETE FROM brand_signals WHERE id = ?').run(existing.id)
  } else if (!existing) {
    await db
      .prepare(
        `INSERT INTO brand_signals (id, brand_id, kind, actor, member_id, created_at)
         VALUES (?,?,?,?,?,?)
         ON CONFLICT (brand_id, kind, actor) DO NOTHING`,
      )
      .run(`bs_${randomBytes(8).toString('hex')}`, brandId, kind, actor, m?.id ?? null, Date.now())
  }
  res.json(await signalCounts(brandId, actor))
})

/**
 * STRIPE WEBHOOK — the only thing in this codebase that may mark a member paid.
 *
 * A Payment Link is handed out by /api/members/tier with
 * `client_reference_id=<member id>` appended, and that parameter is the entire
 * join: it is how a completed checkout is matched back to a row here. Without
 * it a payment is an anonymous amount of money and tier_status could never
 * leave 'pending'.
 *
 * THE SIGNATURE IS VERIFIED AND THE ROUTE DOES NOT EXIST WITHOUT A SECRET.
 * An unverified webhook is a public endpoint that grants paid memberships to
 * anybody who can POST JSON — so if STRIPE_WEBHOOK_SECRET is unset this is
 * never registered at all, rather than falling back to trusting the body.
 *
 * express.raw, not express.json: the signature is computed over the exact bytes
 * Stripe sent, and a parsed-then-restringified body will not match.
 */
/*
  THE SIGNING SECRET IS ENOUGH, AND AN API KEY IS NOT WANTED HERE.

  This used to demand STRIPE_SECRET_KEY as well, which meant a full-access live
  key had to sit in the environment of a public web service that never makes a
  single Stripe API call. Verifying a webhook is an HMAC over the raw body
  against STRIPE_WEBHOOK_SECRET; the SDK instance below is a namespace for that
  function and nothing else — checked, not assumed: constructEvent verifies
  correctly with a placeholder key and a real signing secret.

  So the key is optional, and when it is absent the placeholder is used. Less
  in the environment to leak, and one fewer thing to rotate.
*/
if (process.env.STRIPE_WEBHOOK_SECRET) {
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json', limit: '1mb' }),
    async (req, res) => {
      let event: { type: string; data: { object: Record<string, unknown> } }
      try {
        const { default: Stripe } = await import('stripe')
        /* Never used to call Stripe. See the note above the mount. */
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_unused_webhook_verification_only')
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          req.get('stripe-signature') ?? '',
          process.env.STRIPE_WEBHOOK_SECRET as string,
        ) as unknown as typeof event
      } catch (err) {
        // A bad signature is the normal shape of an attack, not an outage.
        console.error('stripe webhook rejected:', String(err).slice(0, 120))
        return res.status(400).json({ error: 'Bad signature.' })
      }

      const obj = event.data?.object ?? {}
      const memberId = typeof obj.client_reference_id === 'string' ? obj.client_reference_id : ''

      /*
        ACTIVATE ON PAYMENT, LAPSE ON FAILURE OR CANCELLATION. Subscriptions
        stop for dull reasons — an expired card, a bank decline — and a
        membership that stays 'active' after the money stops is the app telling
        an affiliate to honour an offer nobody is paying for.
      */
      if (event.type === 'checkout.session.completed' && memberId) {
        /*
          THE CUSTOMER ID IS STORED HERE OR THE LAPSE PATH IS DEAD. Subscription
          events carry no client_reference_id — that belongs to the checkout
          session — so `customer` is the only durable link back to this row. Set
          it on the way in and a cancellation months later still finds them;
          forget it and memberships silently stay 'active' forever after the
          money stops, which is the app telling an affiliate to honour an offer
          nobody is paying for.
        */
        const customer = typeof obj.customer === 'string' ? obj.customer : null
        await db.prepare(
          "UPDATE members SET tier_status = 'active', tier_since = ?, stripe_customer = COALESCE(?, stripe_customer) WHERE id = ?",
        ).run(Date.now(), customer, memberId)
        console.log('membership active:', memberId)
      } else if (
        event.type === 'customer.subscription.deleted' ||
        event.type === 'invoice.payment_failed'
      ) {
        /*
          These events carry no client_reference_id — it belongs to the checkout
          session, not the subscription. The customer id is the durable link, so
          it is stored on activation and matched here.
        */
        const customer = typeof obj.customer === 'string' ? obj.customer : ''
        if (customer) {
          await db.prepare("UPDATE members SET tier_status = 'lapsed' WHERE stripe_customer = ?").run(
            customer,
          )
          console.log('membership lapsed:', customer)
        }
      }

      // 200 quickly whatever happened: Stripe retries anything else, and a
      // retry storm over an event we do not act on helps nobody.
      res.json({ received: true })
    },
  )
  console.log('stripe webhook mounted')
} else if (process.env.STRIPE_PAYMENT_LINK_PASS || process.env.STRIPE_PAYMENT_LINK_DIAMOND) {
  console.warn(
    'Payment links are configured but STRIPE_WEBHOOK_SECRET is not, so nothing can mark a ' +
      'member paid. They will stay pending after checkout.',
  )
}

/**
 * Their QR, as an SVG.
 *
 * SVG rather than a PNG data URL: it is a fraction of the bytes, it stays crisp
 * when somebody holds a phone up to a screen to scan it, and it needs no
 * canvas. The encoded value is the app's own origin with ?ref= — a normal link
 * that works when tapped as well as when scanned, because most people will send
 * it rather than show it.
 */
app.get('/api/members/qr.svg', rateLimiter(30, 15), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  const origin = PROD ? `https://${req.get('host')}` : `${req.protocol}://${req.get('host')}`
  const url = `${origin}/?ref=${m.referral_code}`
  try {
    const { toString } = await import('qrcode')
    const svg = await toString(url, { type: 'svg', margin: 1, width: 512 })
    res.type('image/svg+xml').set('Cache-Control', 'private, max-age=3600').send(svg)
  } catch {
    res.status(500).json({ error: 'Could not draw the code.' })
  }
})

/**
 * An unmatched /api path is an error, not a page. The SPA catch-all below used
 * to answer it with index.html and a 200, so a client calling a typo'd or
 * removed endpoint got HTML and a success code and could not tell.
 */
app.all('/api/*', (_req, res) => res.status(404).json({ error: 'Unknown endpoint.' }))

app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.sendFile(join(here, '..', 'dist', 'index.html'))
})

/** Never return a stack trace: it leaks absolute paths and the dependency tree. */
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // body-parser marks its own failures. Reporting them as 500 told the customer
  // the server had broken when in fact their request was malformed or too
  // large, and left them unable to tell whether an order had been created.
  const e = err as { status?: number; type?: string; message?: string }
  if (e?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That request is too large.' })
  }
  if (e?.status === 400 || e?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'That request could not be read.' })
  }
  // Log the error only, never the request: the body carries the customer's
  // name, phone and address, and this goes to the hosting provider's log.
  console.error('unhandled:', e?.message ?? err)
  res.status(500).json({ error: 'Internal error' })
})

/*
  Nothing serves until the schema is there and the vendors are seeded. Listening
  first would answer requests against missing tables for the first few hundred
  milliseconds of every cold start — the kind of failure that only ever shows up
  in production, and only sometimes.
*/
async function start() {
  await migrate()
  await seedVendors()
    app.listen(PORT, async () => {
    console.log(`api + static on http://localhost:${PORT}`)
    if (!PAYMENTS_WIRED) {
      console.warn('*** MOCK PAYMENTS: orders are accepted and NOTHING is charged. ***')
    }
    /* SMS is the way in now, so its problems are the loud ones. */
    const sms = loginSmsProblem()
    if (sms) {
      console.warn(`*** SIGN-IN SMS WILL NOT REACH CUSTOMERS: ${sms} ***`)
    }
    const mail = loginEmailProblem()
    if (mail) {
      // Loud, and loudest in production: this one is invisible from the outside
      // until a customer cannot get in, and then it looks like a broken form.
      console.warn(`*** SIGN-IN EMAIL WILL NOT REACH CUSTOMERS: ${mail} ***`)
    }
    if (SIMULATE_KITCHEN) {
      console.warn('*** KITCHEN SIMULATOR ON: ticket states advance on a timer, not by a kitchen. ***')
    } else if (PROD) {
      console.warn('*** No kitchen display exists. Tickets will stay queued until one does. ***')
    }
    if (!PROD) {
      const rows = await db.prepare('SELECT id, api_token FROM vendors').all() as { id: string; api_token: string }[]
      console.log('vendor tokens (dev only):')
      for (const r of rows) console.log(`  ${r.id}  ${r.api_token}`)
    }
  })
}

/* Any failure here is fatal and must be loud: a server that came up without
   its schema would answer every request with a database error. */
start().catch((err) => {
  console.error('failed to start:', err)
  process.exit(1)
})
