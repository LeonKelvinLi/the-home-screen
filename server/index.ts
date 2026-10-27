import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join, sep } from 'node:path'
import { db, migrate } from './db/schema'
import { crmOnApplication, mountCrm } from './crm/routes'
import { mountOnboarding, openRecruiterApplication } from './onboarding'
import { creditPaidInvoice, creditWaiting, recordRecruiter, voidForCharge, mountBark } from './bark'
import { mountAffiliateTerms } from './affiliate-terms'
import { sendEmail as sendLeadEmail } from './email'
import { bioOf, mountFriends, petsFor, profileExtras, waitingCount } from './friends'
import { cleanCity, cleanState, placeLine } from '../src/data/usStates'
import { businessSlug, flagReferral, isOwnDevice, mountAffiliate } from './affiliate'
import { crmOpenMode } from './crm/open'
import { autoImport, syncListedAt, syncSnapshots } from './crm/backfill'
import { fillGlennDefaults } from './crm/core'
import { cleanAttribution, isBot, isTestDestination, shortHash, track } from './analytics'
import { ingest, linkVisitor, markInternal, prune, snapshotDirectory, teamToken } from './intel'
import { BRANDS, VENDORS } from '../src/data/brands'
import { TIERS, rewardsFor } from '../src/data/membership'
import { FALLBACK_TAX_BPS, addedTaxFor, embeddedTaxFor } from '../src/lib/tax'

const here = dirname(fileURLToPath(import.meta.url))
const app = express()

/*
  AN ASYNC ROUTE THAT THROWS ANSWERS 500. IT DOES NOT END THE PROCESS.

  Express 4 calls a handler and ignores what it returns, so a rejected promise
  never reaches the error handler at the bottom of this file: Node sees an
  unhandled rejection and exits. Found on 13 September 2026, when an order for
  any of 71 businesses that had a menu but no vendor row hit a foreign-key
  error and took the whole service down, for every customer, until the host
  restarted it. Every handler registered through app.get/post/put/patch/
  delete/all is wrapped so a rejection goes to next(err) instead.

  Left exactly as they are: app.get with one argument, which is Express reading
  a setting, and four-argument functions, which are error handlers.
*/
type AnyFn = (...a: unknown[]) => unknown
const settled = (h: unknown) =>
  typeof h === 'function' && h.length < 4
    ? (req: Request, res: Response, next: NextFunction) => {
        try {
          const out = (h as AnyFn)(req, res, next) as { catch?: unknown } | undefined
          if (out && typeof out.catch === 'function') (out as Promise<unknown>).catch(next)
        } catch (err) {
          next(err)
        }
      }
    : h
for (const method of ['get', 'post', 'put', 'patch', 'delete', 'all'] as const) {
  const register = (app[method] as unknown as AnyFn).bind(app)
  ;(app as unknown as Record<string, AnyFn>)[method] = (...args: unknown[]) =>
    args.length < 2 ? register(...args) : register(args[0], ...args.slice(1).map(settled))
}

const PORT = Number(process.env.PORT ?? 8787)
const PROD = process.env.NODE_ENV === 'production'

/*
  THE CRM AT AN ADDRESS OF ITS OWN. Leon, 2026-09-22: "CRM dashboard will be
  another url in render". The same code runs as a second Render service with
  CRM_ONLY=1, on the same database: it answers /crm, the API the CRM calls and
  the sign-in it needs, and sends every other page to the public site, so a
  stray link never opens a second copy of beastypages.com there. PUBLIC_URL is
  that site. CRM_URL, set on the public service, is where its /crm now lives.
  The two services are written up in docs/CRM.md.
*/
const CRM_ONLY = process.env.CRM_ONLY === '1'
const originOf = (v: string | undefined) => {
  const s = String(v ?? '').trim().replace(/\/+$/, '')
  return /^https?:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(s) ? s : ''
}
const PUBLIC_URL = originOf(process.env.PUBLIC_URL) || (CRM_ONLY ? 'https://beastypages.com' : '')
const CRM_URL = CRM_ONLY ? '' : originOf(process.env.CRM_URL)
/* Off: the operator key is the only way into the CRM. See server/crm/auth.ts. */
const CRM_MEMBER_SIGNIN = process.env.CRM_MEMBER_SIGNIN === '1'

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

    camera=(self) for the same reason. The landing page's Scan tab and the
    kitchen screen's pass check both read QR codes, and both start the camera
    only on a tap. With camera=() the browser refuses before it ever asks, and
    the screen can only say "blocked" to a customer who never said no.
  */
  res.setHeader(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()',
  )
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  if (PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})

if (CRM_ONLY) {
  /* The API the CRM screen calls and, only when member sign-in is on, the
     code sign-in it offers; nothing else. */
  const CRM_API = CRM_MEMBER_SIGNIN
    ? /^\/api\/(crm\/|health$|members\/(start|verify|signout|channels)$)/
    : /^\/api\/(crm\/|health$)/
  app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    const p = req.path
    if (p === '/robots.txt') return res.type('text/plain').send('User-agent: *\nDisallow: /\n')
    if (p.startsWith('/api/')) return CRM_API.test(p) ? next() : res.status(404).json({ error: 'Not on this address.' })
    if (p === '/') return res.redirect(302, '/crm')
    if (p === '/crm' || p === '/crm/') return next()
    /* Files: the CRM's scripts, styles and fonts, and the businesses' icons. */
    if (/\.[A-Za-z0-9]{2,11}$/.test(p)) return next()
    /* Every other page is the public site's, a referral link included, so the
       visit is credited there, on the cookie the sign-up will read. */
    if (req.method === 'GET' || req.method === 'HEAD') return res.redirect(302, `${PUBLIC_URL}${req.originalUrl}`)
    res.status(404).json({ error: 'Not on this address.' })
  })
}

/*
  THE DEVICE COOKIE ON THE FIRST PAGE, not on the first beacon. It used to be
  minted on the reply to the visit beacon, and whether a browser keeps a
  cookie set on a sendBeacon reply is not something to bet a visitor count on.
  Pages only (no API call, no file), never for a bot, and never for a browser
  sending Global Privacy Control. The CRM's own address sets none.
*/
if (!CRM_ONLY) {
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api/') &&
      !/\.[A-Za-z0-9]{2,11}$/.test(req.path) &&
      req.get('sec-gpc') !== '1' &&
      !isBot(req.get('user-agent'))
    ) {
      visitorOf(req, res)
    }
    next()
  })
}

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
/* Never on the CRM's own service: one timer on the shared database is enough. */
const SIMULATE_KITCHEN = process.env.SIMULATE_KITCHEN === '1' && !CRM_ONLY

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

/**
 * A kitchen's key, as issued by the operator: `kt_` and 32 random bytes.
 *
 * The prefix is what tells the two kinds of vendor credential apart at a
 * glance, in a log line or in a support message, without either one being
 * readable from the other.
 */
const KITCHEN_TOKEN_PREFIX = 'kt_'

/**
 * Which kitchens are real: those holding at least one key that has not been
 * turned off. The simulator leaves their tickets alone and the customer's
 * screen stops calling their statuses a demonstration. Small table, read whole.
 */
async function liveKitchens(): Promise<Set<string>> {
  const rows = await db
    .prepare('SELECT DISTINCT vendor_id FROM vendor_tokens WHERE revoked_at IS NULL')
    .all() as { vendor_id: string }[]
  return new Set(rows.map((r) => r.vendor_id))
}

/**
 * Who is calling from a kitchen.
 *
 * TWO KINDS OF KEY. An issued kitchen key is found by its SHA-256 hash, so the
 * database never holds one in the clear and a leaked backup opens no kitchen;
 * turning it off is one row. The boot-seeded vendors.api_token came first,
 * was never handed to any kitchen, and is printed to stdout in development for
 * the audits — so it is honoured there and nowhere else. In production a
 * kitchen gets in with an issued key or not at all.
 */
async function authVendor(req: express.Request): Promise<string | null> {
  const header = req.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (token.length < 8) return null

  if (token.startsWith(KITCHEN_TOKEN_PREFIX)) {
    const row = await db
      .prepare('SELECT id, vendor_id, last_used_at FROM vendor_tokens WHERE token_hash = ? AND revoked_at IS NULL')
      .get(hashToken(token)) as { id: string; vendor_id: string; last_used_at: string | number | null } | undefined
    if (!row) return null
    const now = Date.now()
    /* At most once a minute: a board polling every few seconds should not turn
       every read into a write. */
    if (row.last_used_at === null || now - Number(row.last_used_at) > 60_000) {
      await db.prepare('UPDATE vendor_tokens SET last_used_at = ? WHERE id = ?').run(now, row.id)
    }
    return row.vendor_id
  }

  if (PROD) return null

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
const VENDOR_IDS = new Set(VENDORS.map((v) => v.id))

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
  /*
    Nor a Tier 1 or Tier 2 page. The menu list is a Tier 3 feature (his note of
    9 September, data/affiliateTiers.ts), so those pages show no menu and
    nothing on them can reach a cart. Alive Kitchen and Daughter Thai carry
    researched menus on free Tier 1 listings; the rule above applies to them.
  */
  if ((brand.tier ?? 3) < 3) continue
  /*
    And never an item whose kitchen has no vendor row: its ticket cannot be
    written, and before the async guard above that failure ended the process.
    VENDORS now covers every seed, so this should never fire; it is here so a
    future seed list that forgets one is a loud line at boot, not an outage.
  */
  if (!VENDOR_IDS.has(brand.vendorId)) {
    console.error(`not orderable: ${brand.id} has a menu but no vendor ${brand.vendorId}`)
    continue
  }

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
      return res.status(200).json({ ...(await readOrder(prior.id, { forCustomer: true })), cancelKey: cancelKeyFor(prior.id) })
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
           WHERE o.created_at > ? AND t.state NOT IN ('collected', 'cancelled')`,
        )
        .all(now - CODE_WINDOW_MS) as { code: string }[]
    ).map((r) => r.code),
  )
  let code = `#${1000 + Math.floor(Math.random() * 8999)}`
  for (let i = 0; i < 40 && activeCodes.has(code); i++) {
    code = `#${1000 + Math.floor(Math.random() * 8999)}`
  }

  /* The order joins the account of whoever is signed in, so it follows them to
     every phone they sign in on. A signed-out order is unchanged. */
  const member = await memberFromRequest(req)

  const write = db.transaction(async () => {
    await db.prepare(
      `INSERT INTO orders (id, code, customer_name, customer_phone, fulfilment, subtotal, tax,
        service_fee, delivery_fee, tip, total, eta_minutes, payment_state, idempotency_key,
        address, request_digest, member_id, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      orderId, code, name, phone, fulfilment, subtotal, tax,
      serviceFee, deliveryFee, tip, total, etaMinutes, 'mock', idemKey,
      address || null, requestDigest, member?.id ?? null, now,
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
  /* After COMMIT, never inside it: see the note in analytics.ts. */
  if (member) await track('order_placed', { memberId: member.id, entityType: 'order', entityId: orderId, metadata: { lines: lines.length, fulfilment } })
  else await track('guest_order_placed', { actor: deviceOf(req, res), entityType: 'order', entityId: orderId, metadata: { lines: lines.length, fulfilment } })
  res.status(201).json({ ...(await readOrder(orderId, { forCustomer: true })), cancelKey: cancelKeyFor(orderId) })
})

/**
 * Vendor-scoped queue. Previously this returned every order on the platform to
 * anyone, which handed each vendor their competitors' revenue and the
 * commission rate the platform charges them.
 */
app.get('/api/orders', rateLimiter(120, 30), async (req, res) => {
  const vendorId = await authVendor(req)
  if (!vendorId) return res.status(401).json({ error: 'Vendor token required.' })

  /*
    Every order this kitchen still has to work, however many there are, and the
    thirty most recent besides.

    It was `SELECT DISTINCT o.id ... ORDER BY o.created_at`, written for SQLite.
    Postgres refuses to order a DISTINCT by a column it did not select, so the
    queue failed on every call — unnoticed only because no kitchen had ever
    held a key, and before async errors were caught, fatal to the whole server
    on a kitchen's first poll. A flat "latest fifty" would also have let a
    busy kitchen's oldest open ticket slide off its own board.
  */
  const ids = await db
    .prepare(
      `SELECT id FROM (
         SELECT o.id, o.created_at FROM orders o
         WHERE EXISTS (SELECT 1 FROM tickets t WHERE t.order_id = o.id AND t.vendor_id = ?
                       AND t.state IN ('queued', 'cooking', 'ready'))
         UNION
         SELECT recent.id, recent.created_at FROM (
           SELECT o.id, o.created_at FROM orders o
           WHERE EXISTS (SELECT 1 FROM tickets t WHERE t.order_id = o.id AND t.vendor_id = ?)
           ORDER BY o.created_at DESC LIMIT 30
         ) recent
       ) board ORDER BY created_at DESC LIMIT 200`,
    )
    .all(vendorId, vendorId) as { id: string }[]

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

/**
 * THE CUSTOMER'S RIGHT TO CANCEL, as a key only the customer ever holds.
 *
 * The order id alone cannot be it: every kitchen on a shared cart holds that id
 * too, and a competitor must not be able to cancel another kitchen's ticket by
 * replaying it. So the key is derived from the id with the server's secret and
 * handed out only in the response to the request that placed the order — never
 * on a vendor queue and never on a lookup. Nothing is stored; the server can
 * always recompute it. A signed-in member who placed the order needs no key.
 */
const cancelKeyFor = (orderId: string) =>
  createHmac('sha256', PASS_SECRET).update(`order-cancel.${orderId}`).digest('base64url').slice(0, 32)

/**
 * Cancel an order, whole, before any kitchen has started on it.
 *
 * All or nothing, and under a row lock: every ticket on the order is read FOR
 * UPDATE, so a kitchen pressing Start at the same moment either lands first
 * (and the cancel is refused) or waits and finds the ticket already cancelled.
 * Half an order cancelled and half cooking is the one outcome this must not
 * produce. Nothing is charged today, so there is nothing to refund; when
 * payments exist, the refund belongs here.
 */
app.post('/api/orders/:id/cancel', rateLimiter(30, 10), async (req, res) => {
  const orderId = String(req.params.id)
  const order = await db.prepare('SELECT id, member_id FROM orders WHERE id = ?').get(orderId) as
    | { id: string; member_id: string | null }
    | undefined
  if (!order) return res.status(404).json({ error: 'Not found' })

  const body = isObj(req.body) ? req.body : {}
  const given = Buffer.from(typeof body.cancelKey === 'string' ? body.cancelKey : '')
  const want = Buffer.from(cancelKeyFor(orderId))
  const byKey = given.length === want.length && timingSafeEqual(given, want)
  const member = byKey ? null : await memberFromRequest(req)
  const byOwner = !!member && !!order.member_id && member.id === order.member_id
  if (!byKey && !byOwner) {
    return res.status(403).json({ error: 'Only the customer who placed this order can cancel it.' })
  }

  const outcome = await db.transaction(async () => {
    const tickets = await db
      .prepare('SELECT id, state FROM tickets WHERE order_id = ? FOR UPDATE')
      .all(orderId) as { id: string; state: string }[]
    if (tickets.some((t) => t.state !== 'queued' && t.state !== 'cancelled')) return 'started'
    await db.prepare(
      `UPDATE tickets SET state = 'cancelled', cancelled_by = 'customer', state_changed_at = ?
       WHERE order_id = ? AND state = 'queued'`,
    ).run(Date.now(), orderId)
    return 'cancelled'
  })()
  if (outcome === 'started') {
    return res.status(409).json({ error: 'A kitchen has already started on this order. Call them to change it.' })
  }
  res.json(await readOrder(orderId, { forCustomer: true }))
})

const NEXT_STATE: Record<string, string[]> = {
  /* A kitchen may turn a ticket down before or while cooking — sold out, closed
     early — and says why. Once it is ready, it is the customer's food. */
  queued: ['cooking', 'cancelled'],
  cooking: ['ready', 'cancelled'],
  ready: ['collected'],
  collected: [],
  cancelled: [],
}

const MAX_CANCEL_REASON = 140

/** Kitchen-facing: advance a ticket. Vendor-scoped, forward-only. */
app.post('/api/tickets/:id/state', rateLimiter(120, 30), async (req, res) => {
  const vendorId = await authVendor(req)
  if (!vendorId) return res.status(401).json({ error: 'Vendor token required.' })

  const body = isObj(req.body) ? req.body : {}
  const state = typeof body.state === 'string' ? body.state : ''
  if (!['queued', 'cooking', 'ready', 'collected', 'cancelled'].includes(state)) {
    return res.status(400).json({ error: 'Bad state' })
  }
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, MAX_CANCEL_REASON) : ''

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
    .prepare(
      `UPDATE tickets SET state = ?, state_changed_at = ?,
         cancelled_by = CASE WHEN ? = 'cancelled' THEN 'kitchen' ELSE cancelled_by END,
         cancel_reason = CASE WHEN ? = 'cancelled' THEN ? ELSE cancel_reason END
       WHERE id = ? AND vendor_id = ? AND state = ?`,
    )
    .run(state, Date.now(), state, state, reason || null, req.params.id, vendorId, ticket.state)
  if (info.changes === 0) return res.status(409).json({ error: 'Ticket changed underneath you.' })

  res.json({ ok: true, state })
})

/**
 * The kitchen screen's own card: who this key belongs to, and what its
 * register code has brought in. Everything else on the board comes from the
 * vendor queue it already polls.
 */
app.get('/api/kitchen/me', rateLimiter(60, 20), async (req, res) => {
  const vendorId = await authVendor(req)
  if (!vendorId) return res.status(401).json({ error: 'This kitchen link is not valid any more.' })
  const vendor = VENDORS.find((v) => v.id === vendorId)
  const brands = BRANDS.filter((b) => b.vendorId === vendorId)
  let signups = 0
  for (const b of brands) {
    const r = await db.prepare('SELECT COUNT(*) AS n FROM members WHERE joined_via = ?').get(b.id) as { n: string | number }
    signups += Number(r.n)
  }
  res.set('Cache-Control', 'no-store').json({
    vendorId,
    name: vendor?.name ?? brands[0]?.name ?? vendorId,
    brands: brands.map((b) => ({ id: b.id, name: b.name })),
    signupsFromRegisterCode: signups,
  })
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
  const live = await liveKitchens()

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
    /* Only while at least one kitchen on the order is still the simulator's. A
       kitchen with its own screen is moving its own tickets. */
    simulated: SIMULATE_KITCHEN && tickets.some((t) => !live.has(String(t.vendor_id))),
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
        /* Whether this kitchen works its own screen. The customer is told "call
           them before you travel" only where nobody is watching for the order. */
        kitchenLive: live.has(String(t.vendor_id)),
        ...(t.state === 'cancelled'
          ? { cancelledBy: t.cancelled_by ?? undefined, cancelReason: t.cancel_reason ?? undefined }
          : {}),
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
          /* Never a real kitchen's ticket: one with a live key is working its
             own board, and the timer moving it would lie to both sides. */
          `SELECT t.id, t.state, t.state_changed_at FROM tickets t
           WHERE t.state IN ('queued','cooking','ready')
             AND NOT EXISTS (
               SELECT 1 FROM vendor_tokens k WHERE k.vendor_id = t.vendor_id AND k.revoked_at IS NULL
             )`,
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
  if (business.length < 2) return res.status(400).json({ error: 'Business name is required.' })

  /*
    A PHONE AND AN EMAIL, EACH IN ITS OWN BOX, since Glenn's revision of the
    form on 2026-09-22 (with the hours and the address, which took the places
    of "What you cook" and "City"). One of the two is enough, and it has to be
    one somebody can use: seven digits or more, or an address shaped like one.

    `contact` is the single "Phone or email" box the form used to have. A page
    opened before the change still sends it, so it is still taken; for a new
    request it is filled with whichever of the two they gave, so anything that
    reads the old column keeps working.
  */
  const phone = str(b.phone)
  const email = str(b.email).toLowerCase()
  const phoneOk = phone.replace(/\D/g, '').length >= 7
  const emailOk = EMAIL_SHAPE.test(email)
  const contact = [phoneOk ? phone : '', emailOk ? email : ''].filter(Boolean).join(' · ') || str(b.contact)
  if (contact.length < 5) {
    return res.status(400).json({
      error: phone || email ? 'That phone number or email does not look right.' : 'A phone number or email is required.',
    })
  }
  const lead = {
    business,
    contact,
    phone,
    email,
    hours: str(b.hours),
    address: str(b.address),
    cuisine: str(b.cuisine),
    city: str(b.city),
    social: str(b.social),
  }

  const application = {
    id: `ap_${randomBytes(8).toString('hex')}`,
    business,
    cuisine: lead.cuisine || null,
    contact,
    city: lead.city || null,
    social: lead.social || null,
    hours: lead.hours || null,
    address: lead.address || null,
    phone: phone || null,
    email: email || null,
    created_at: Date.now(),
  }
  await db.prepare(
    `INSERT INTO applications (id, business, cuisine, contact, city, social, hours, address, phone, email, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    application.id,
    application.business,
    application.cuisine,
    application.contact,
    application.city,
    application.social,
    application.hours,
    application.address,
    application.phone,
    application.email,
    application.created_at,
  )
  /* The device that asked, so a Reserve a Spot request joins the visit it came from. */
  await track('lead_submitted', { actor: deviceOf(req, res), entityType: 'application', entityId: application.id })
  /* Into the CRM as a lead, credited to the referral link that brought them
     if there was one. Never awaited into the response: it cannot fail this. */
  void crmOnApplication(req, application)

  notifyLead(lead)

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

/* Loose on purpose, like the phone test: something@something.tld, no spaces
   (so no line breaks either). The mail provider is the real judge. */
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

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

function notifyLead(lead: Record<string, string>) {
  const f = (v: string) => slackSafe(v)
  /* The hours and the address are left out of the log: the email and the
     webhook carry them, and an address can be somebody's home. */
  const line = `NEW VENDOR LEAD  ${f(lead.business)} | ${f(lead.contact)}` +
    `${lead.cuisine ? ` | ${f(lead.cuisine)}` : ''}${lead.city ? ` | ${f(lead.city)}` : ''}` +
    `${lead.social ? ` | ${f(lead.social)}` : ''}`
  console.log(line)

  /*
    One line per box they filled, the ways to reach them first. A request from
    a page opened before Glenn's revision has the old single contact box, what
    they do and a city instead of the phone, email, hours and address.
  */
  const rows: [string, string][] = [
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Contact', lead.phone || lead.email ? '' : lead.contact],
    ['Hours', lead.hours],
    ['Address', lead.address],
    ['What they do', lead.cuisine],
    ['City', lead.city],
    ['Instagram', lead.social],
  ]
  void sendLeadEmail(
    process.env.LEAD_EMAIL,
    `BEASTY: new spot request from ${lead.business}`,
    `${lead.business} asked for a spot on BEASTY pages.\n\n` +
      rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}\n`).join('') +
      `\nSent from the Reserve a Spot form. Nothing is committed until you reply to them.`,
    /* Reply goes straight to the business when they gave an email. */
    lead.email || (EMAIL_SHAPE.test(lead.contact) ? lead.contact : undefined),
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

/* ---------- BEASTY Collab: food creators ---------- */

/**
 * An Instagram handle from whatever a person types for one: `@name`, `name`,
 * or a pasted profile link. Instagram allows letters, numbers, full stops and
 * underscores, up to 30. Anything else is not a handle, and null.
 */
function instagramHandle(raw: string): string | null {
  let s = raw.trim()
  const link = s.match(/instagram\.com\/([^/?#\s]+)/i)
  if (link) s = link[1]
  s = s.replace(/^@+/, '')
  return /^[A-Za-z0-9._]{1,30}$/.test(s) && /[A-Za-z0-9]/.test(s) ? s : null
}

/**
 * A food creator asking to collaborate, from the Collab key on the landing
 * page.
 *
 * Glenn, 2026-09-16, with the invitation the panel now carries: "I want to add
 * this on the Collab button on the landing page. Keep it really simple and ask
 * for their basic information like name, phone number, email address [and] IG
 * handle." Four fields, all four required: setting up a meal takes a number to
 * call, an address to write to and the account the review goes out on. The
 * row goes into `applications` like the other two forms (the name in
 * `business`, `cuisine` marking it as a Collab, the handle in `social`), so the
 * operator list shows it, and it is emailed to LEAD_EMAIL, the inbox for
 * leads, with Reply set to the creator. Unauthenticated and bounded like the
 * other two.
 */
app.post('/api/collabs', rateLimiter(6, 3), async (req, res) => {
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const str = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MAX_APP_FIELD) : '')
  const name = str(req.body.name)
  const phone = str(req.body.phone)
  const email = str(req.body.email)
  const handle = instagramHandle(str(req.body.instagram))
  const digits = phone.replace(/\D/g, '')
  const phoneOk = phone.startsWith('+')
    ? digits.length >= 8
    : digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
  if (name.length < 2) return res.status(400).json({ error: 'Your name is required.' })
  if (!phoneOk) return res.status(400).json({ error: 'A phone number we can call or text is required.' })
  if (!EMAIL_SHAPE.test(email)) return res.status(400).json({ error: 'An email address is required.' })
  if (!handle) return res.status(400).json({ error: 'Your Instagram handle is required.' })

  await db.prepare(
    `INSERT INTO applications (id, business, cuisine, contact, city, social, created_at)
     VALUES (?,?,?,?,?,?,?)`,
  ).run(
    `ap_${randomBytes(8).toString('hex')}`,
    name,
    'BEASTY Collab — food creator',
    `${phone} · ${email}`,
    null,
    `@${handle}`,
    Date.now(),
  )

  // The name and the public handle only: the number and address stay out of the log.
  console.log(`NEW COLLAB LEAD  ${slackSafe(name)} | @${handle}`)
  void sendLeadEmail(
    process.env.LEAD_EMAIL,
    `BEASTY Collab: @${handle} wants to collaborate`,
    `${name} wants to collaborate with BEASTY pages as a food creator.\n\n` +
      `Instagram: @${handle} (https://www.instagram.com/${handle}/)\n` +
      `Phone: ${phone}\n` +
      `Email: ${email}\n\n` +
      'Sent from the Collab button on the landing page. Replying to this email reaches them. ' +
      'Nothing is arranged until you get in touch.',
    email,
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

/** The operator token typed into the CRM screen, compared in constant time. */
function isOperatorToken(sent: string): boolean {
  if (OPERATOR_TOKEN.length < 16) return false
  const a = Buffer.from(sent)
  const b = Buffer.from(OPERATOR_TOKEN)
  return a.length === b.length && timingSafeEqual(a, b)
}

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

/* ---------- kitchens: issuing and turning off their keys ---------- */

const MAX_TOKEN_LABEL = 60
const MAX_LIVE_TOKENS_PER_VENDOR = 10

/** v_x and b_x name the same kitchen; accept either. */
const vendorIdFrom = (raw: string) => (raw.startsWith('b_') ? `v_${raw.slice(2)}` : raw)

function operatorGuard(req: Request, res: Response): boolean {
  if (OPERATOR_TOKEN.length < 16) {
    res.status(503).json({ error: 'No operator token configured.' })
    return false
  }
  if (!isOperator(req)) {
    res.status(401).json({ error: 'Operator token required.' })
    return false
  }
  return true
}

/**
 * Issue a kitchen a key, one per device. The key is in the response ONCE and
 * never again: only its hash is kept. The link it comes with opens the kitchen
 * screen already signed in, with the key in the fragment so it is never sent
 * to the server in a request line or written to an access log.
 */
app.post('/api/vendors/:id/tokens', rateLimiter(20, 10), async (req, res) => {
  if (!operatorGuard(req, res)) return
  const vendorId = vendorIdFrom(String(req.params.id))
  const vendor = await db.prepare('SELECT id, name FROM vendors WHERE id = ?').get(vendorId) as
    | { id: string; name: string }
    | undefined
  if (!vendor) return res.status(404).json({ error: 'No such kitchen.' })
  const live = await db
    .prepare('SELECT COUNT(*) AS n FROM vendor_tokens WHERE vendor_id = ? AND revoked_at IS NULL')
    .get(vendorId) as { n: string | number }
  if (Number(live.n) >= MAX_LIVE_TOKENS_PER_VENDOR) {
    return res.status(409).json({ error: `This kitchen already has ${MAX_LIVE_TOKENS_PER_VENDOR} live keys. Turn one off first.` })
  }
  const body = isObj(req.body) ? req.body : {}
  const label = typeof body.label === 'string' ? body.label.trim().slice(0, MAX_TOKEN_LABEL) : ''
  const token = `${KITCHEN_TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`
  const id = `vk_${randomBytes(8).toString('hex')}`
  await db
    .prepare('INSERT INTO vendor_tokens (id, vendor_id, token_hash, label, created_at) VALUES (?,?,?,?,?)')
    .run(id, vendorId, hashToken(token), label || null, Date.now())
  const origin = PROD ? `https://${req.get('host')}` : `${req.protocol}://${req.get('host')}`
  res.status(201).set('Cache-Control', 'no-store').json({
    id,
    vendorId,
    name: vendor.name,
    label: label || undefined,
    token,
    kitchenUrl: `${origin}/kitchen#k=${token}`,
  })
})

/** A kitchen's keys: when each was issued and last used. Never the key itself. */
app.get('/api/vendors/:id/tokens', rateLimiter(30, 15), async (req, res) => {
  if (!operatorGuard(req, res)) return
  const vendorId = vendorIdFrom(String(req.params.id))
  const rows = await db
    .prepare('SELECT id, label, created_at, last_used_at, revoked_at FROM vendor_tokens WHERE vendor_id = ? ORDER BY created_at DESC')
    .all(vendorId) as { id: string; label: string | null; created_at: string; last_used_at: string | null; revoked_at: string | null }[]
  const num = (v: string | null) => (v === null ? null : Number(v))
  res.json(rows.map((r) => ({
    id: r.id,
    label: r.label ?? undefined,
    createdAt: Number(r.created_at),
    lastUsedAt: num(r.last_used_at),
    revokedAt: num(r.revoked_at),
  })))
})

/** Turn one key off — a lost or replaced tablet. The row stays, stamped. */
app.delete('/api/vendor-tokens/:id', rateLimiter(30, 15), async (req, res) => {
  if (!operatorGuard(req, res)) return
  const info = await db
    .prepare('UPDATE vendor_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
    .run(Date.now(), String(req.params.id))
  if (info.changes === 0) return res.status(404).json({ error: 'No live key with that id.' })
  res.status(204).end()
})

/** What every register code has brought in, busiest first. */
app.get('/api/register-signups', rateLimiter(30, 15), async (req, res) => {
  if (!operatorGuard(req, res)) return
  const rows = await db
    .prepare('SELECT joined_via, COUNT(*) AS n FROM members WHERE joined_via IS NOT NULL GROUP BY joined_via ORDER BY COUNT(*) DESC')
    .all() as { joined_via: string; n: string }[]
  res.json(rows.map((r) => ({
    brandId: r.joined_via,
    name: BRANDS.find((b) => b.id === r.joined_via)?.name ?? r.joined_via,
    signups: Number(r.n),
  })))
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
async function startSession(res: Response, memberId: string): Promise<string> {
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
  return shortHash(token)
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
  tier_interval: string
  recruiter_status?: string
  stripe_customer?: string | null
  city?: string | null
  state?: string | null
  created_at: number
}

/**
 * A first name and a last initial — all another member ever sees of a name.
 * Shared by Contacts, a member's page, and what a shop is told at a scan.
 */
const shortName = (full: string) => {
  const parts = String(full || 'Member').trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return parts[0] || 'Member'
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
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
  if (earned === 0) return
  /*
    ONLY THE MILESTONES THAT ARE MISSING. This used to attempt every milestone
    on every read and let ON CONFLICT drop the duplicates — correct, and it
    burned a serial each time: Postgres draws the next number before it finds
    the conflict, so a member's ticket count sat still while the numbers on
    new tickets climbed with every page load. Tickets carry their serial on
    screen now, so the sequence is only touched for a ticket that will exist.
  */
  const have = new Set(
    (await db
      .prepare('SELECT earned_at_referral FROM raffle_tickets WHERE member_id = ?')
      .all(memberId) as { earned_at_referral: number }[]).map((r) => Number(r.earned_at_referral)),
  )
  const missing: number[] = []
  for (let m = 1; m <= earned; m++) if (!have.has(m * 3)) missing.push(m * 3)
  if (!missing.length) return
  const insert = db.prepare(
    /* ON CONFLICT DO NOTHING is Postgres's INSERT OR IGNORE. The UNIQUE
       (member_id, earned_at_referral) is what stops a milestone minting a
       second ticket when two requests race past the check above. */
    `INSERT INTO raffle_tickets (id, member_id, earned_at_referral, created_at)
     VALUES (?,?,?,?)
     ON CONFLICT (member_id, earned_at_referral) DO NOTHING`,
  )
  const run = db.transaction(async () => {
    for (const at of missing) {
      await insert.run(`rt_${randomBytes(8).toString('hex')}`, memberId, at, Date.now())
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
function paymentLinkFor(
  tierId: string,
  interval: 'month' | 'year',
  member: { id: string; email: string },
): string | null {
  /* One link per tier per interval. The yearly ones exist only once a tier
     carries a yearly price and tools/stripe-setup.mjs has made them. */
  const key =
    tierId === 'pass'
      ? 'STRIPE_PAYMENT_LINK_PASS'
      : tierId === 'diamond'
        ? 'STRIPE_PAYMENT_LINK_DIAMOND'
        : tierId === 'recruiter'
          ? 'STRIPE_PAYMENT_LINK_RECRUITER'
          : null
  const base = key ? process.env[interval === 'year' ? `${key}_YEARLY` : key] : undefined
  if (!base) return null
  try {
    const u = new URL(base)
    /* The recruiter upgrade is its own subscription, so its checkout says so in the one field
       Stripe hands back: `rc_` + the member id. The webhook reads the prefix. */
    u.searchParams.set('client_reference_id', tierId === 'recruiter' ? `${RECRUITER_REF}${member.id}` : member.id)
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

/** The prefix on a recruiter checkout's client_reference_id. */
const RECRUITER_REF = 'rc_'

/**
 * WHERE A PAYING MEMBER MANAGES WHAT THEY PAY FOR: Stripe's customer portal, through its no-code
 * login link (STRIPE_PORTAL_URL). They prove their email to Stripe there, then switch between the
 * passes (prorated), cancel at the end of the period, or change their card. Prefilling the email
 * they already proved here saves a step; the portal still sends Stripe's own code.
 */
function manageLinkFor(member: { email: string | null }): string | null {
  const base = process.env.STRIPE_PORTAL_URL
  if (!base) return null
  try {
    const u = new URL(base)
    if (member.email) u.searchParams.set('prefilled_email', member.email)
    return u.toString()
  } catch {
    return null
  }
}

/** A Stripe price id to the tier it pays for, from the environment (not secrets). */
function tierOfPrice(price: string | undefined): 'pass' | 'diamond' | 'recruiter' | null {
  if (!price) return null
  if (price === process.env.STRIPE_PRICE_PASS) return 'pass'
  if (price === process.env.STRIPE_PRICE_DIAMOND) return 'diamond'
  if (price === process.env.STRIPE_PRICE_RECRUITER) return 'recruiter'
  return null
}

/** The price a subscription or invoice event is for, wherever that API version keeps it. */
function priceOfEvent(obj: Record<string, unknown>): string | undefined {
  const pick = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)
  const items = (obj.items as { data?: { price?: { id?: unknown } }[] } | undefined)?.data
  const lines = (obj.lines as { data?: { price?: { id?: unknown }; pricing?: { price_details?: { price?: unknown } } }[] } | undefined)?.data
  return (
    pick(items?.[0]?.price?.id) ??
    pick((obj.plan as { id?: unknown } | undefined)?.id) ??
    pick(lines?.[0]?.price?.id) ??
    /* API 2025-03-31 and later keep an invoice line's price here. */
    pick(lines?.[0]?.pricing?.price_details?.price)
  )
}

/* ---------- the pass: a QR that changes every minute ---------- */

/*
  GLENN, 2026-09-06: "make sure QR code is changing every 1 or 5 min so the QR
  code on every user cannot be redeemed offers."

  The card used to show the referral code, which is meant to be shared and so
  is worthless as proof of who is standing at the counter: a screenshot of
  anybody's card would redeem their offer. So the member card now shows a
  TOKEN — this member, this minute, signed with a secret only the server
  holds — and a shop verifies it through /api/pass/verify.

  Three properties, and tools/audit-pass.mjs holds the server to all of them:

    - it ROTATES: the token is different every PASS_WINDOW_MS;
    - it EXPIRES: a scanner accepts the current window and the one before it,
      so a screen that was already held up still verifies, and nothing older;
    - it is ONE-SHOT: the first scan is written to pass_scans and the second
      scan of the same token is refused, however fresh it is. That is what
      makes a screenshot worthless even inside the minute.

  Every minute rather than every five: a token that is good for one scan and
  dies within two minutes is the tighter of the two he offered, and the card
  refetches on its own so the person holding it up never sees a dead one.

  The secret comes from PASS_SECRET. Without it one is minted per boot, which
  works but kills every pass in the air on each restart — loud at boot.
*/
const PASS_WINDOW_MS = Math.max(1000, Number(process.env.PASS_WINDOW_MS ?? 60_000))
const PASS_SECRET_SET = !!process.env.PASS_SECRET
const PASS_SECRET = process.env.PASS_SECRET || randomBytes(32).toString('base64url')

const passWindow = (now = Date.now()) => Math.floor(now / PASS_WINDOW_MS)
const signPass = (memberId: string, win: number) =>
  createHmac('sha256', PASS_SECRET).update(`${memberId}.${win}`).digest('base64url').slice(0, 27)

function passTokenFor(memberId: string, now = Date.now()) {
  const win = passWindow(now)
  return { token: `bp1.${memberId}.${win}.${signPass(memberId, win)}`, expiresAt: (win + 1) * PASS_WINDOW_MS }
}

type PassCheck = { ok: true; memberId: string } | { ok: false; status: 400 | 410; error: string }

/** Format, signature, then age — and the signature before the age, so an
    attacker cannot learn from the error which windows are live. */
function checkPass(token: string, now = Date.now()): PassCheck {
  const bad: PassCheck = { ok: false, status: 400, error: 'That is not a valid BEASTY pass.' }
  const parts = String(token ?? '').split('.')
  if (parts.length !== 4 || parts[0] !== 'bp1') return bad
  const [, memberId, winStr, sig] = parts
  const win = Number(winStr)
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(memberId) || !Number.isInteger(win) || win < 0) return bad
  const want = Buffer.from(signPass(memberId, win))
  const got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return bad
  const cur = passWindow(now)
  if (win > cur) return bad
  if (win < cur - 1) {
    return { ok: false, status: 410, error: 'That pass has expired. Ask them to show the screen again.' }
  }
  return { ok: true, memberId }
}

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
    /* When they actually joined. The profile printed a year from a device-local
       store that predates accounts, so a member signing in on a new phone was
       told they had joined today. */
    joinedAt: m.created_at,
    referralCode: m.referral_code,
    tier: m.tier,
    tierStatus: m.tier_status,
    tierInterval: m.tier_interval === 'year' ? 'year' : 'month',
    /* Recruiter status, and whether its checkout and the manage page exist yet. */
    recruiterStatus: m.recruiter_status ?? 'none',
    recruiterConfigured: !!process.env.STRIPE_PAYMENT_LINK_RECRUITER,
    /* Their /join paperwork: 'none' until the $60 is paid opens it (server/onboarding.ts). */
    paperworkStatus:
      (await db.prepare('SELECT status FROM onboarding_applications WHERE member_id = ?').get<{ status: string }>(m.id))?.status ?? 'none',
    manageLink: manageLinkFor(m),
    referrals,
    raffleTickets: { total: tickets.total ?? 0, unused: tickets.unused ?? 0 },
    rewards,
    /* So the member card can count a pass down without guessing the window. */
    passWindowMs: PASS_WINDOW_MS,
    /* Friend requests waiting for an answer: the red number on Profile. */
    friendRequests: await waitingCount(m.id),
    /* Their one line, under their name (server/friends.ts). */
    bio: await bioOf(m.id),
    /* Where they live, editable on Profile (Glenn, 2026-10-19). */
    city: m.city ?? '',
    state: m.state ?? '',
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
    /* The audits' local stand-in (server/email.ts); never in production. */
    const endpoint = !PROD && process.env.RESEND_API_URL ? process.env.RESEND_API_URL : 'https://api.resend.com/emails'
    const r = await fetch(endpoint, {
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
 * The business a register code named, kept only if it is a real one. A code
 * printed for a business that later leaves still signs somebody up; it simply
 * credits nobody.
 */
const viaFrom = (v: unknown): string | null => {
  const s = typeof v === 'string' ? v.trim() : ''
  return /^b_[a-z0-9]{2,40}$/.test(s) && BRANDS.some((x) => x.id === s) ? s : null
}

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
  /* Where they live (Glenn, 2026-10-19), checked for everyone like the name.
     Blank is allowed here; the form asks for both. */
  const city = cleanCity(b.city)
  if (city === null) return res.status(400).json({ error: 'Enter your city by name, with no numbers.' })
  const state = cleanState(b.state)
  if (state === null) return res.status(400).json({ error: 'Pick your state from the list.' })
  /* What brought them here, reduced to what is safe to keep (analytics.ts). */
  const attribution = cleanAttribution(b.attribution, OWN_HOSTS)

  const existing = await db
    .prepare(
      channel === 'sms'
        ? 'SELECT id FROM members WHERE phone = ?'
        : 'SELECT id FROM members WHERE email = ?',
    )
    .get(destination) as { id: string } | undefined
  const purpose = existing ? 'signin' : 'signup'

  /*
    SIGN-IN ONLY, for the CRM's own sign-in card (2026-09-22): the team uses
    the account they already have, and an address with none is not made into
    one there. The answer is the same either way, so the card cannot be used
    to learn who is a member; only a real member is sent a code, and the pause
    stands in for the send so the reply takes about as long. The CRM at its own
    address is always sign-in only.
  */
  if (!existing && (CRM_ONLY || b.signinOnly === true)) {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500))
    return res.status(202).json({ sent: true, delivered: true, channel, minutes: CODE_TTL_MS / 60000 })
  }

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
         pending_name = ?, pending_instagram = ?, pending_phone = ?, pending_ref = ?, pending_via = ?,
         pending_attribution = COALESCE(?::jsonb, pending_attribution),
         pending_city = ?, pending_state = ?
       WHERE destination = ?`,
    ).run(
      name || null,
      str(b.instagram).replace(/^@+/, '') || null,
      channel === 'sms' ? destination : str(b.phone) || null,
      str(b.ref).toUpperCase() || null,
      viaFrom(b.via),
      attribution ? JSON.stringify(attribution) : null,
      city || null,
      state || null,
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
        pending_via, pending_attribution, pending_city, pending_state, attempts, created_at, expires_at)
     VALUES (?,?,?,?,?,?,?,?,?,?::jsonb,?,?,0,?,?)
     ON CONFLICT(destination) DO UPDATE SET
       channel = excluded.channel,
       code_hash = excluded.code_hash,
       purpose = excluded.purpose,
       pending_name = excluded.pending_name,
       pending_instagram = excluded.pending_instagram,
       pending_phone = excluded.pending_phone,
       pending_ref = excluded.pending_ref,
       pending_via = excluded.pending_via,
       pending_attribution = excluded.pending_attribution,
       pending_city = excluded.pending_city,
       pending_state = excluded.pending_state,
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
    viaFrom(b.via),
    attribution ? JSON.stringify(attribution) : null,
    city || null,
    state || null,
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
  /* A sign-up asked for, by this device: the funnel's second step. Never the
     number or address itself. */
  if (purpose === 'signup' && !isTestDestination(destination)) {
    await track('signup_started', { actor: visitorOf(req, res), metadata: { channel, delivered } })
  }
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
        pending_via: string | null
        pending_attribution: Record<string, unknown> | null
        pending_city: string | null
        pending_state: string | null
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

  const existing = await db
    .prepare(byPhone ? 'SELECT * FROM members WHERE phone = ?' : 'SELECT * FROM members WHERE email = ?')
    .get(destination) as MemberRow | undefined

  /* Sign-in only (see the start route): a code that would make an account is
     left unspent, so its owner can still finish joining on the site. Only the
     holder of a right code ever reads this answer. */
  if (!existing && (CRM_ONLY || req.body.signinOnly === true)) {
    return res.status(403).json({ error: 'That has no BEASTY account yet. Join on beastypages.com first, then sign in here.' })
  }

  await db.prepare('DELETE FROM login_codes WHERE destination = ?').run(destination)

  if (existing) {
    /* A member from before 2026-10-19 has no city yet: the sign-in form now
       asks, so what they typed fills it. One already set is never changed
       from here; Profile is where they edit it. */
    if (!existing.city && row.pending_city) {
      await db.prepare('UPDATE members SET city = ?, state = ? WHERE id = ? AND city IS NULL').run(row.pending_city, row.pending_state, existing.id)
      existing.city = row.pending_city
      existing.state = row.pending_state
    }
    const sessionId = await startSession(res, existing.id)
    /* The device they signed in on is theirs from now on; see server/intel.ts. */
    const anon = req.get('sec-gpc') === '1' ? null : visitorOf(req, res)
    await linkVisitor(anon, existing.id)
    await track('user_signed_in', { memberId: existing.id, actor: anon, sessionId, metadata: { channel: byPhone ? 'sms' : 'email' } })
    return res.json(await memberPayload(existing))
  }

  const refCode = row.pending_ref ?? ''
  let referrer = refCode
    ? (await db.prepare('SELECT id FROM members WHERE referral_code = ?').get(refCode) as
        | { id: string }
        | undefined)
    : undefined
  /* A sign-up on the referrer's own device earns the referrer nothing
     (server/affiliate.ts), and the attempt is kept for the admin. Only READ
     the device here: a phone with no device cookie has never been anyone's,
     and minting one now would put it ahead of the session cookie. */
  if (referrer && (await isOwnDevice(knownVisitor(req), referrer.id))) {
    await flagReferral(referrer.id, 'self_signup', { code: refCode, channel: byPhone ? 'sms' : 'email' })
    referrer = undefined
  }

  const id = `mb_${randomBytes(8).toString('hex')}`
  await db.prepare(
    `INSERT INTO members (id, name, email, instagram, phone, referral_code, referred_by, joined_via, signup_attribution, city, state, created_at)
     VALUES (?,?,?,?,?,?,?,?,?::jsonb,?,?,?)`,
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
    viaFrom(row.pending_via),
    row.pending_attribution ? JSON.stringify(row.pending_attribution) : null,
    row.pending_city,
    row.pending_state,
    Date.now(),
  )
  // Their referrer may have just crossed a milestone.
  if (referrer) await syncRaffleTickets(referrer.id)

  const sessionId = await startSession(res, id)
  /* The device they joined on, so their browsing before joining reads as their
     history; the anon id goes on the event itself too. */
  const joinedOn = req.get('sec-gpc') === '1' ? null : visitorOf(req, res)
  await linkVisitor(joinedOn, id)
  await track('user_signed_up', {
    memberId: id,
    actor: joinedOn,
    sessionId,
    metadata: {
      channel: byPhone ? 'sms' : 'email',
      utm_source: String(row.pending_attribution?.utm_source ?? ''),
      utm_campaign: String(row.pending_attribution?.utm_campaign ?? ''),
      /* "It is also good to add to our analytics" — Glenn, 2026-10-19. */
      city: row.pending_city ?? '',
      state: row.pending_state ?? '',
    },
  })
  if (referrer) await track('friend_joined', { memberId: referrer.id, entityType: 'member', entityId: id })
  const fresh = await db.prepare('SELECT * FROM members WHERE id = ?').get(id) as MemberRow
  res.status(201).json(await memberPayload(fresh))
})

/** Who am I. The client calls this on boot to decide whether to gate. */
app.get('/api/members/me', rateLimiter(60, 20), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  void track('app_opened', { memberId: m.id, source: 'web' })
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
    .prepare('SELECT id, name, city, state, created_at FROM members ORDER BY LOWER(name) ASC, created_at ASC LIMIT 1000')
    .all() as { id: string; name: string; city: string | null; state: string | null; created_at: number }[]
  /* The pet each member built, so the list shows it (server/friends.ts). */
  const pets = await petsFor(rows.map((r) => r.id))
  res.json({
    count: rows.length,
    /* Their town and state, "Concord, CA", on Glenn's markup of 2026-10-19,
       so members can find people in their own city. A town, never a street. */
    members: rows.map((r) => ({ id: r.id, name: shortName(r.name), since: r.created_at, me: r.id === me.id, pet: pets.get(r.id) ?? null, place: placeLine(r.city, r.state) })),
  })
})

/**
 * THE MEMBER'S OWN ORDERS, from whichever phone they are signed in on.
 *
 * Order history used to be the set of ids one browser had kept, so the same
 * member on a second phone had none. These are the orders placed while signed
 * in, newest first, in the customer's view — no platform fee, no payout.
 */
app.get('/api/members/orders', rateLimiter(60, 20), async (req, res) => {
  const me = await memberFromRequest(req)
  if (!me) return res.status(401).json({ error: 'Not signed in.' })
  const ids = await db
    .prepare('SELECT id FROM orders WHERE member_id = ? ORDER BY created_at DESC LIMIT 25')
    .all(me.id) as { id: string }[]
  const orders = (await Promise.all(ids.map((r) => readOrder(r.id, { forCustomer: true })))).filter(Boolean)
  res.set('Cache-Control', 'no-store').json({ orders })
})

/**
 * HOW MANY MEMBERS THERE ARE, for anybody.
 *
 * Glenn's purpose for Contacts, 9 August: "users can see other users and see how
 * big our users are growing." The names stay behind sign-in; the number is the
 * part he wants seen, and it is only ever the real one.
 */
app.get('/api/members/count', rateLimiter(60, 20), async (_req, res) => {
  const r = await db.prepare('SELECT COUNT(*) AS n FROM members').get() as { n: string | number }
  res.set('Cache-Control', 'no-store').json({ count: Number(r.n) })
})

/**
 * Another member's page — what they starred and liked.
 *
 * Glenn, 2026-09-06: "make sure people on contact list we can go into their
 * profile and see what they liked." Members only, like the directory, and the
 * answer is built from brand_signals rows that carry this member's id — the
 * hearts and stars they tapped while signed in. A name, the month they joined
 * and two lists of businesses; never a number, an address or a handle.
 */
app.get('/api/members/:id/profile', rateLimiter(60, 20), async (req, res) => {
  const me = await memberFromRequest(req)
  if (!me) return res.status(401).json({ error: 'Not signed in.' })
  const id = String(req.params.id)
  const m = await db
    .prepare('SELECT id, name, created_at FROM members WHERE id = ?')
    .get(id) as { id: string; name: string; created_at: number } | undefined
  if (!m) return res.status(404).json({ error: 'No such member.' })
  const rows = await db
    .prepare(
      `SELECT brand_id, kind FROM brand_signals
       WHERE member_id = ? AND kind IN ('like','favourite')
       ORDER BY created_at DESC LIMIT 200`,
    )
    .all(id) as { brand_id: string; kind: string }[]
  res.json({
    id: m.id,
    name: shortName(m.name),
    since: m.created_at,
    likes: rows.filter((r) => r.kind === 'like').map((r) => r.brand_id),
    favourites: rows.filter((r) => r.kind === 'favourite').map((r) => r.brand_id),
    me: m.id === me.id,
    /* Friends, the MySpace way: their pet, their count, their Top 3, and the
       viewer's button (server/friends.ts). */
    ...(await profileExtras(me.id, m.id, shortName)),
  })
})

/**
 * The member's own raffle tickets, one row each, numbered.
 *
 * Glenn, 2026-09-06: "make sure they have their own digital raffle for every
 * user." A count was already on the account; this is the tickets themselves —
 * each with its serial, when it was earned and for which sign-up, and whether
 * it has been spent on a named draw. Nobody else's are ever listed.
 */
app.get('/api/members/tickets', rateLimiter(60, 20), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  await syncRaffleTickets(m.id)
  const rows = await db
    .prepare(
      `SELECT id, serial, earned_at_referral, created_at, used_at, used_for
       FROM raffle_tickets WHERE member_id = ? ORDER BY serial ASC`,
    )
    .all(m.id) as {
      id: string; serial: number; earned_at_referral: number; created_at: number
      used_at: number | null; used_for: string | null
    }[]
  res.json({
    tickets: rows.map((r) => ({
      id: r.id,
      serial: Number(r.serial),
      earnedAtReferral: r.earned_at_referral,
      earnedAt: r.created_at,
      usedAt: r.used_at,
      usedFor: r.used_for,
    })),
  })
})

/** The pass for this minute. Never cached: the whole point is that it moves. */
app.get('/api/members/pass', rateLimiter(60, 20), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  void track('pass_opened', { memberId: m.id, source: 'web' })
  res.set('Cache-Control', 'no-store').json({ ...passTokenFor(m.id), windowMs: PASS_WINDOW_MS })
})

/** The same pass, drawn, for anything that wants an <img>. */
app.get('/api/members/pass.svg', rateLimiter(60, 20), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  const { token } = passTokenFor(m.id)
  try {
    const { toString } = await import('qrcode')
    const svg = await toString(token, { type: 'svg', margin: 1, width: 512, errorCorrectionLevel: 'M' })
    res.type('image/svg+xml').set('Cache-Control', 'no-store').send(svg)
  } catch {
    res.status(500).json({ error: 'Could not draw the pass.' })
  }
})

/**
 * THE SCAN. A shop's till, or the operator, hands in what the camera read.
 *
 * Takes a vendor bearer token or the operator token: a member must never be
 * able to verify their own pass, or the one-shot property could be burned
 * from the customer side. The answer says who is standing there — first name
 * and initial — and what their membership honours, if it is paid and active.
 * Nothing here charges, credits or redeems anything; that is the shop's
 * decision, made with a true answer in front of it.
 */
app.post('/api/pass/verify', rateLimiter(120, 40), async (req, res) => {
  const vendorId = await authVendor(req)
  const operator = !vendorId && isOperator(req)
  if (!vendorId && !operator) return res.status(401).json({ error: 'A vendor or operator token is required.' })
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const token = typeof req.body.token === 'string' ? req.body.token.trim() : ''
  const c = checkPass(token)
  if (!c.ok) return res.status(c.status).json({ error: c.error })
  const m = await db.prepare('SELECT * FROM members WHERE id = ?').get(c.memberId) as MemberRow | undefined
  if (!m) return res.status(400).json({ error: 'That is not a valid BEASTY pass.' })
  try {
    await db
      .prepare('INSERT INTO pass_scans (id, token_hash, member_id, scanned_by, created_at) VALUES (?,?,?,?,?)')
      .run(`ps_${randomBytes(8).toString('hex')}`, hashToken(token), m.id, vendorId ?? 'operator', Date.now())
  } catch (err) {
    /* 23505 is Postgres for "that UNIQUE already has this" — the token was
       scanned before. Anything else is a real failure and stays one. */
    if ((err as { code?: string })?.code === '23505') {
      return res.status(409).json({ error: 'That pass was already scanned. Ask them to show the screen again.' })
    }
    throw err
  }
  await track('pass_scanned', { memberId: m.id, entityType: 'vendor', entityId: vendorId ?? 'operator', metadata: { by: vendorId ? 'shop' : 'operator' } })
  const tier = TIERS.find((t) => t.id === m.tier)
  const active = !!tier && m.tier_status === 'active'
  res.json({
    ok: true,
    member: { id: m.id, name: shortName(m.name), tier: m.tier, tierStatus: m.tier_status },
    honours: active ? tier.honours : null,
  })
})

/** Sign out on this device. */
app.post('/api/members/signout', rateLimiter(20, 10), async (req, res) => {
  const token = readCookie(req, SESSION_COOKIE)
  const m = token ? await memberFromRequest(req) : null
  if (token) await db.prepare('DELETE FROM member_sessions WHERE token_hash = ?').run(hashToken(token))
  if (m) await track('user_signed_out', { memberId: m.id, sessionId: shortHash(token!) })
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
  /*
    MONTH OR YEAR. Absent means month, which is what every choice was before
    a yearly price existed. A year is only accepted for a tier that actually
    carries a yearly price — the screen never offers one otherwise, and this
    is the guard for anything that is not the screen.
  */
  const rawInterval = req.body.interval
  const interval: 'month' | 'year' | null =
    rawInterval === undefined || rawInterval === 'month' ? 'month' : rawInterval === 'year' ? 'year' : null
  if (!interval) return res.status(400).json({ error: 'Billing is monthly or yearly.' })
  if (interval === 'year' && !tier.yearly) {
    return res.status(400).json({ error: `${tier.name} has no yearly price yet.` })
  }

  /*
    A SWITCH IS NOT A SECOND SUBSCRIPTION. A member already paying for one pass who taps the other
    used to be sent to a fresh checkout — a second subscription on top of the first. While a pass
    is active the switch happens in Stripe's portal, which moves the one subscription (prorated),
    and the webhook updates the tier when Stripe confirms it. Nothing changes here until then.
  */
  if (m.tier_status === 'active' && m.tier !== tier.id && m.tier !== 'free') {
    const manageLink = manageLinkFor(m)
    if (manageLink) {
      await track('membership_switch_opened', { memberId: m.id, metadata: { from: m.tier, to: tier.id } })
      return res.json({ ...(await memberPayload(m)), manageLink, switching: true })
    }
  }

  await db
    .prepare('UPDATE members SET tier = ?, tier_status = ?, tier_since = ?, tier_interval = ? WHERE id = ?')
    .run(tier.id, 'pending', Date.now(), interval, m.id)
  await track('membership_chosen', { memberId: m.id, metadata: { tier: tier.id, interval } })

  const row = await db.prepare('SELECT * FROM members WHERE id = ?').get(m.id) as MemberRow
  res.json({
    ...(await memberPayload(row)),
    paymentLink: paymentLinkFor(tier.id, interval, { id: m.id, email: row.email }),
  })
})

/**
 * BECOME A RECRUITER: the $60-a-month upgrade (Glenn, 2026-10-26). Records the wish as pending and
 * hands back its checkout; only the webhook makes it active. Already active or paused: nothing to buy.
 */
app.post('/api/members/recruiter', rateLimiter(12, 6), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  const status = m.recruiter_status ?? 'none'
  if (status === 'active' || status === 'paused') {
    return res.json({ ...(await memberPayload(m)), paymentLink: null })
  }
  const paymentLink = paymentLinkFor('recruiter', 'month', { id: m.id, email: m.email })
  if (!paymentLink) return res.status(503).json({ error: 'Recruiter sign-up is not open yet.' })
  await db.prepare("UPDATE members SET recruiter_status = 'pending' WHERE id = ?").run(m.id)
  await track('recruiter_chosen', { memberId: m.id })
  const row = (await db.prepare('SELECT * FROM members WHERE id = ?').get(m.id)) as MemberRow
  res.json({ ...(await memberPayload(row)), paymentLink })
})

/**
 * PAUSE OR RESUME RECRUITING ("they can cancel any time or pause their recruitment status").
 * A paused recruiter's new referrals are not credited; what they already earned stays. Billing is
 * Stripe's: cancelling the $60 is in the manage page, and this says so on the screen.
 */
app.post('/api/members/recruiter/pause', rateLimiter(20, 10), async (req, res) => {
  const m = await memberFromRequest(req)
  if (!m) return res.status(401).json({ error: 'Not signed in.' })
  if (!isObj(req.body) || typeof req.body.paused !== 'boolean') return res.status(400).json({ error: 'paused must be true or false.' })
  const status = m.recruiter_status ?? 'none'
  if (status !== 'active' && status !== 'paused') return res.status(409).json({ error: 'Only an active recruiter can pause.' })
  const next = req.body.paused ? 'paused' : 'active'
  await db.prepare('UPDATE members SET recruiter_status = ? WHERE id = ?').run(next, m.id)
  await recordRecruiter(m.id, next)
  await track(req.body.paused ? 'recruiter_paused' : 'recruiter_resumed', { memberId: m.id })
  const row = (await db.prepare('SELECT * FROM members WHERE id = ?').get(m.id)) as MemberRow
  res.json(await memberPayload(row))
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

/** Hosts that are BEASTY itself, so a click from one page to another is not a referral. */
const OWN_HOSTS = ['beastypages.com', 'onrender.com', 'localhost']

/** This server's own address as the browser reached it, for links it hands out. */
function originFor(req: Request): string {
  return PROD ? `https://${req.get('host')}` : `${req.protocol}://${req.get('host')}`
}

/** A visitor for analytics: a short hash of the device cookie (set here when missing). */
function visitorOf(req: Request, res: Response): string {
  return shortHash(actorFor(req, res, null))
}

/** The device this request already carries, without giving it one: null for a new device. */
function knownVisitor(req: Request): string | null {
  if (req.get('sec-gpc') === '1') return null
  const device = readCookie(req, DEVICE_COOKIE)
  return device ? shortHash(`d:${hashToken(device)}`) : null
}

/** The visitor's device for an event, or none under Global Privacy Control or for a crawler. */
function deviceOf(req: Request, res: Response): string | null {
  return req.get('sec-gpc') === '1' || isBot(req.get('user-agent')) ? null : visitorOf(req, res)
}

/*
  A VISIT, from the page itself: navigator.sendBeacon on the first load of the
  day, carrying what brought the visitor (UTM fields, the referring host, the
  landing path). One row per device per day, none for crawlers or for signed-in
  members (their visits are app_opened). It is the funnel's first step and the
  only record of where a future member first came from.
*/
app.post('/api/t/visit', rateLimiter(30, 10), express.text({ type: '*/*', limit: '4kb' }), async (req, res) => {
  if (isBot(req.get('user-agent')) || (await memberFromRequest(req))) return res.status(204).end()
  // Before the reply goes out: this may set the device cookie.
  const visitor = visitorOf(req, res)
  res.status(204).end()
  let body: unknown = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return
    }
  }
  const a = cleanAttribution(isObj(body) ? body.attribution : null, OWN_HOSTS)
  await track('site_visited', {
    actor: visitor,
    source: 'web',
    metadata: {
      landing: a?.landing,
      referrer: a?.referrer,
      utm_source: a?.utm_source,
      utm_medium: a?.utm_medium,
      utm_campaign: a?.utm_campaign,
    },
  })
})

/*
  WHAT THE PAGE REPORTS ABOUT ITSELF: batches of named events from
  src/lib/track.ts, checked and stored by server/intel.ts. Answered before
  anything is written, so a slow database never slows the page. A browser
  sending Global Privacy Control is counted without a visitor, session or
  member. Outside production, ?wait=1 returns what was kept, for the audits.
*/
app.post('/api/t/events', rateLimiter(120, 60), express.text({ type: '*/*', limit: '32kb' }), async (req, res) => {
  const gpc = req.get('sec-gpc') === '1'
  const anon = gpc ? null : visitorOf(req, res)
  const member = await memberFromRequest(req).catch(() => null)
  const who = { anon, memberId: member?.id ?? null, ua: req.get('user-agent') ?? '', gpc }
  if (!PROD && req.query.wait === '1') return res.json(await ingest(req.body, who))
  res.status(204).end()
  await ingest(req.body, who)
})

/*
  THE TEAM'S OWN PHONES: opening this private link marks the device as the
  team's, and everything it does after is left out of the numbers (the link
  is shown to admins in the CRM). A wrong token just goes home.
*/
app.get('/t/team/:token', async (req, res) => {
  if (req.params.token === teamToken(PASS_SECRET)) {
    await markInternal(visitorOf(req, res)).catch(() => {})
    return res.redirect(302, '/?team=1')
  }
  res.redirect(302, '/')
})

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
  /* Only the business page asks for these counts, so this is a page opened —
     kept once a day per business, and only for members. */
  if (m && BRANDS.some((b) => b.id === brandId)) void track('business_viewed', { memberId: m.id, entityType: 'business', entityId: brandId, source: 'web' })
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
    if (m) await track(kind === 'like' ? 'business_unliked' : 'business_unsaved', { memberId: m.id, entityType: 'business', entityId: brandId })
  } else if (!existing) {
    await db
      .prepare(
        `INSERT INTO brand_signals (id, brand_id, kind, actor, member_id, created_at)
         VALUES (?,?,?,?,?,?)
         ON CONFLICT (brand_id, kind, actor) DO NOTHING`,
      )
      .run(`bs_${randomBytes(8).toString('hex')}`, brandId, kind, actor, m?.id ?? null, Date.now())
    if (m) {
      await track(kind === 'like' ? 'business_liked' : kind === 'share' ? 'business_shared' : 'business_saved', {
        memberId: m.id,
        entityType: 'business',
        entityId: brandId,
      })
    }
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
      let event: { id?: string; type: string; data: { object: Record<string, unknown> } }
      try {
        const { default: Stripe } = await import('stripe')
        /* Never used to call Stripe. See the note above the mount. */
        /* `||`, not `??`: an empty STRIPE_SECRET_KEY in the environment made the SDK throw and every
           webhook bounce as a bad signature. */
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_unused_webhook_verification_only')
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
      if (event.type === 'checkout.session.completed' && memberId.startsWith(RECRUITER_REF)) {
        /* The recruiter upgrade: its own subscription and customer (see /api/members/recruiter). */
        const id = memberId.slice(RECRUITER_REF.length)
        const customer = typeof obj.customer === 'string' ? obj.customer : null
        const was = await db.prepare('SELECT recruiter_status FROM members WHERE id = ?').get<{ recruiter_status: string }>(id)
        await db.prepare(
          "UPDATE members SET recruiter_status = 'active', recruiter_since = ?, recruiter_customer = COALESCE(?, recruiter_customer) WHERE id = ?",
        ).run(Date.now(), customer, id)
        if (was && was.recruiter_status !== 'active') {
          await recordRecruiter(id, 'active')
          /* Paying is the invitation: their /join paperwork opens now (server/onboarding.ts). */
          await openRecruiterApplication(id)
        }
        await track('recruiter_activated', { memberId: id, entityType: 'stripe_event', entityId: String(event.id ?? ''), source: 'server' })
        console.log('recruiter active:', id)
      } else if (event.type === 'invoice.paid') {
        /*
          A PAID MONTH. If it is a referred member's pass, their referrer may be owed this month's
          BARK points (server/bark.ts says when). The recruiter's own $60 earns nobody points.
        */
        const transitions = (obj.status_transitions ?? {}) as { paid_at?: unknown }
        const result = await creditPaidInvoice({
          invoiceId: typeof obj.id === 'string' ? obj.id : '',
          customer: typeof obj.customer === 'string' ? obj.customer : '',
          tier: tierOfPrice(priceOfEvent(obj)),
          amountPaid: Number(obj.amount_paid ?? 0),
          billingReason: typeof obj.billing_reason === 'string' ? obj.billing_reason : '',
          paidAt: typeof transitions.paid_at === 'number' ? transitions.paid_at * 1000 : Date.now(),
          paymentIntent: typeof obj.payment_intent === 'string' ? obj.payment_intent : null,
        })
        if (result.credited) {
          await track('bark_points_credited', { memberId: result.memberId, entityType: 'stripe_event', entityId: String(event.id ?? ''), source: 'server', metadata: { points: result.points, month: result.month } })
          console.log('bark points:', result.memberId, result.points)
        }
      } else if ((event.type === 'charge.refunded' && obj.refunded === true) || event.type === 'charge.dispute.created') {
        /* Schedule A: a refund or chargeback within 60 days takes back the points that payment earned. */
        const voided = await voidForCharge({
          invoiceId: typeof obj.invoice === 'string' ? obj.invoice : null,
          paymentIntent: typeof obj.payment_intent === 'string' ? obj.payment_intent : null,
          why: event.type === 'charge.refunded' ? 'Payment refunded' : 'Payment disputed',
        })
        if (voided) console.log('bark points voided:', voided)
      } else if (event.type === 'checkout.session.completed' && memberId) {
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
        await track('membership_activated', { memberId, entityType: 'stripe_event', entityId: String(event.id ?? ''), source: 'server' })
        console.log('membership active:', memberId)
        /* Their first invoice may have come first and be waiting for this link (server/bark.ts). */
        if (customer) {
          for (const r of await creditWaiting(customer)) {
            if (r.credited) await track('bark_points_credited', { memberId: r.memberId, entityType: 'stripe_event', entityId: String(event.id ?? ''), source: 'server', metadata: { points: r.points, month: r.month } })
          }
        }
      } else if (
        event.type === 'customer.subscription.deleted' ||
        event.type === 'customer.subscription.updated' ||
        event.type === 'invoice.payment_failed'
      ) {
        /*
          These events carry no client_reference_id — it belongs to the checkout
          session, not the subscription. The customer id is the durable link, so
          it is stored on activation and matched here. The PRICE says which
          subscription it is: a pass or the recruiter upgrade, so cancelling one
          never stops the other even if Stripe kept one customer for both.
        */
        const customer = typeof obj.customer === 'string' ? obj.customer : ''
        const kind = tierOfPrice(priceOfEvent(obj))
        const subStatus = typeof obj.status === 'string' ? obj.status : ''
        const stopping =
          event.type === 'customer.subscription.deleted' ||
          event.type === 'invoice.payment_failed' ||
          (event.type === 'customer.subscription.updated' && ['canceled', 'unpaid', 'incomplete_expired'].includes(subStatus))
        if (customer && kind === 'recruiter') {
          if (stopping) {
            const ending = await db
              .prepare("SELECT id FROM members WHERE recruiter_customer = ? AND recruiter_status IN ('active','paused')")
              .all<{ id: string }>(customer)
            await db.prepare("UPDATE members SET recruiter_status = 'cancelled' WHERE recruiter_customer = ? AND recruiter_status IN ('active','paused')").run(customer)
            for (const r of ending) await recordRecruiter(r.id, 'cancelled')
            console.log('recruiter stopped:', customer)
          }
        } else if (customer && event.type === 'customer.subscription.updated' && !stopping) {
          /* A switch made in the portal: the one subscription now pays for the other pass. */
          if (kind === 'pass' || kind === 'diamond') {
            const moved = await db
              .prepare("SELECT id, tier FROM members WHERE stripe_customer = ? AND tier_status = 'active'")
              .all<{ id: string; tier: string }>(customer)
            await db.prepare("UPDATE members SET tier = ? WHERE stripe_customer = ? AND tier_status = 'active'").run(kind, customer)
            for (const m of moved) {
              if (m.tier !== kind) await track('membership_switched', { memberId: m.id, entityType: 'stripe_event', entityId: String(event.id ?? ''), source: 'server', metadata: { from: m.tier, to: kind } })
            }
          }
        } else if (customer && stopping) {
          /* Only a membership that was running can stop: a second failed
             invoice on an already-lapsed one is not a second lapse. */
          const stoppingRows = await db
            .prepare("SELECT id FROM members WHERE stripe_customer = ? AND tier_status = 'active'")
            .all<{ id: string }>(customer)
          await db.prepare("UPDATE members SET tier_status = 'lapsed' WHERE stripe_customer = ?").run(
            customer,
          )
          for (const m of stoppingRows) {
            await track('membership_lapsed', { memberId: m.id, entityType: 'stripe_event', entityId: String(event.id ?? ''), source: 'server', metadata: { why: event.type === 'invoice.payment_failed' ? 'payment_failed' : 'cancelled' } })
          }
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
  const origin = originFor(req)
  /* ?for=business draws their business link (/r/<slug>) instead of the friend link. */
  const url = req.query.for === 'business' ? `${origin}/r/${await businessSlug(m)}` : `${origin}/?ref=${m.referral_code}`
  try {
    const { toString } = await import('qrcode')
    const svg = await toString(url, { type: 'svg', margin: 1, width: 512 })
    res.type('image/svg+xml').set('Cache-Control', 'private, max-age=3600').send(svg)
  } catch {
    res.status(500).json({ error: 'Could not draw the code.' })
  }
})

/*
  THE CRM: /api/crm/*, the /r/<slug> referral link and the /crm screen's
  headers. Mounted here, after every other API route and before the /api 404
  and the page catch-alls, so none of its paths can be swallowed by them.
*/
const crmDeps = {
  isOperator,
  isOperatorToken,
  memberFromRequest: (req: Request) => memberFromRequest(req),
  readCookie,
  secret: PASS_SECRET,
  prod: PROD,
  /* CRM_OPEN=1 opens /crm without the key, as Glenn. Never in production. */
  open: crmOpenMode(process.env, PROD),
  /* Where a referral link or its QR code has to open: the public site. */
  publicUrl: PUBLIC_URL,
  memberSignin: CRM_MEMBER_SIGNIN,
}
mountCrm(app, crmDeps, rateLimiter)
if (process.env.CRM_OPEN === '1') {
  console.log(PROD ? 'crm: CRM_OPEN is set but ignored in production; the key is still required' : 'crm: open mode, /crm needs no key and everyone is Glenn (not production)')
}
app.get('/crm', (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  /* Its own address, once it has one: the old one keeps working as a door. */
  if (CRM_URL) return res.redirect(302, `${CRM_URL}${req.originalUrl}`)
  next()
})

/**
 * An unmatched /api path is an error, not a page. The SPA catch-all below used
 * to answer it with index.html and a 200, so a client calling a typo'd or
 * removed endpoint got HTML and a success code and could not tell.
 */
mountFriends(app, { memberFromRequest, rateLimiter, shortName })
/* The affiliate dashboard: what a member has brought to BEASTY (server/affiliate.ts). */
mountAffiliate(app, { memberFromRequest, rateLimiter, deviceOf, isOperator, origin: originFor })
/* Affiliate onboarding: invite, get paid, sign, submit, review (server/onboarding.ts). */
mountOnboarding(app, {
  memberFromRequest,
  rateLimiter,
  origin: originFor,
  publicUrl: PUBLIC_URL,
  sendEmail: sendLeadEmail,
  leadEmail: process.env.LEAD_EMAIL,
  crm: crmDeps,
  prod: PROD,
})
/* Schedule A, the agreement's money terms, filled in from the CRM (server/affiliate-terms.ts). */
mountAffiliateTerms(app, { rateLimiter, crm: crmDeps })
/* BARK points: monthly credits for recruiters, cash-outs once their packet is approved (server/bark.ts). */
mountBark(app, { memberFromRequest, rateLimiter, crm: crmDeps, sendEmail: sendLeadEmail, leadEmail: process.env.LEAD_EMAIL })

app.all('/api/*', (_req, res) => res.status(404).json({ error: 'Unknown endpoint.' }))

/*
  THE SHAREABLE PAGES: beastypages.com/collab, /money and /members.

  Glenn sends these in food creators' and business owners' Instagram DMs
  (2026-09-16 for Collab, "add a share button to each one of these pages" for
  the other two the next morning), and a DM shows the page's title, text and
  picture before anyone taps. The app is one page whose title is BEASTY PAGES,
  so each of these paths gets its own head; the client opens the matching page
  when it arrives there (see App.tsx and lib/share.ts).
*/
const SHARE_PAGES: Record<string, { title: string; blurb: string }> = {
  collab: {
    title: 'BEASTY Collab',
    blurb:
      'BEASTY pages is looking for Bay Area foodies to collaborate with. We cover the bill; you present the food review.',
  },
  money: {
    title: 'Make money with BEASTY',
    blurb:
      'Earn points for bringing new members and businesses onto BEASTY pages, and get rewarded as the directory grows.',
  },
  members: {
    title: 'BEASTY membership',
    blurb:
      'One membership, honoured at every participating BEASTY affiliate. Signing up is free; the pass is the paid part.',
  },
  search: {
    title: 'Search BEASTY pages',
    blurb: 'Every category and every city on BEASTY pages, and the exclusive offers from the businesses in them.',
  },
  contacts: {
    title: 'BEASTY contacts',
    blurb:
      'Reach the owners of beastypages.com directly (text or email is preferred), and see who is on BEASTY.',
  },
}
/* One segment, and unknown ones fall through to the SPA below. */
app.get('/:page', async (req, res, next) => {
  const slug = String(req.params.page)
  const page = SHARE_PAGES[slug]
  if (!page) return next()
  res.setHeader('Cache-Control', 'no-store')
  // The Host header goes into an attribute, so it is held to hostname characters.
  const host = String(req.get('host') ?? '').replace(/[^A-Za-z0-9.:-]/g, '') || 'beastypages.com'
  const origin = PROD ? `https://${host}` : `${req.protocol}://${host}`
  const head = [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${page.blurb}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="BEASTY PAGES" />',
    `<meta property="og:title" content="${page.title}" />`,
    `<meta property="og:description" content="${page.blurb}" />`,
    `<meta property="og:url" content="${origin}/${slug}" />`,
    `<meta property="og:image" content="${origin}/icon-512.png" />`,
  ].join('\n    ')
  try {
    const { readFile } = await import('node:fs/promises')
    const html = await readFile(join(here, '..', 'dist', 'index.html'), 'utf8')
    res.type('html').send(html.replace('<title>BEASTY PAGES</title>', head))
  } catch {
    res.sendFile(join(here, '..', 'dist', 'index.html'))
  }
})

app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.sendFile(join(here, '..', 'dist', 'index.html'))
})

/** Never return a stack trace: it leaks absolute paths and the dependency tree. */
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Half an answer already went out: Express's own handler closes the socket.
  if (res.headersSent) return next(err)
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
  /* The CRM's copies of each listing's name, city and contacts, refreshed from
     the repo's data. Failing here must not keep the site down. */
  try {
    const sync = await syncSnapshots()
    if (sync.updated || sync.missing.length) {
      console.log(`crm: refreshed ${sync.updated} of ${sync.checked} lead snapshots; ${sync.missing.length} point at a business no longer listed`)
    }
    /* Every blank "who" is Glenn (Leon's rule, 2026-09-22). Only fills blanks. */
    const filled = await fillGlennDefaults()
    if (filled.referrals || filled.owners) console.log(`crm: Glenn filled ${filled.referrals} blank referrals and ${filled.owners} blank owners`)
    /* Leads from the listings dated by the day their business went onto BEASTY. */
    const dated = await syncListedAt()
    if (dated) console.log(`crm: dated ${dated} imported leads by the day their business was added`)
  } catch (err) {
    console.error('crm: snapshot refresh failed:', String((err as Error).message ?? err).slice(0, 200))
  }
    app.listen(PORT, async () => {
    console.log(`api + static on http://localhost:${PORT}`)
    /* New businesses without a website become leads the day they go live: the
       CRM service imports them at every boot. One service only, so two boots
       after the same deploy never race each other into duplicates. */
    if (CRM_ONLY || process.env.CRM_AUTO_IMPORT === '1') {
      autoImport()
        .then((r) => r && console.log(`crm: auto-import brought in ${r.created} businesses and ${r.applications.created} spot requests`))
        .catch((err) => console.error('crm: auto-import failed:', String((err as Error)?.message ?? err).slice(0, 200)))
    }
    /* The directory's day and any seats that changed hands, then the raw-event
       retention window (ANALYTICS_RETENTION_DAYS, 395 by default), daily. The
       public service does both; the CRM's own copy of the server does not. */
    if (!CRM_ONLY) {
      snapshotDirectory()
        .then((r) => console.log(`intel: ${r.brands} businesses snapshot, ${r.opened} seats opened, ${r.closed} closed`))
        .catch((err) => console.warn('intel: snapshot failed:', String((err as Error)?.message ?? err).slice(0, 160)))
      const keep = Number(process.env.ANALYTICS_RETENTION_DAYS ?? 395)
      const pruneOld = () => prune(keep).catch(() => 0)
      void pruneOld()
      setInterval(pruneOld, 864e5).unref()
    }
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
    if (!PASS_SECRET_SET) {
      console.warn(
        PROD
          ? '*** PASS_SECRET IS UNSET: member passes are signed per boot and die on every restart. Set it on the service. ***'
          : 'PASS_SECRET unset — passes are signed with a per-boot secret, which is fine for development.',
      )
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
