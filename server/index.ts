import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { db } from './db/schema'
import { BRANDS, VENDORS } from '../src/data/brands'

const here = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '256kb' }))

const PORT = Number(process.env.PORT ?? 8787)
const PROD = process.env.NODE_ENV === 'production'
/**
 * Fallback only. Real tax is per-vendor (`vendor.taxBps`) because California
 * charges prepared-food tax at the seller's location — a cart spanning two
 * cities is genuinely taxed at two rates. This is used only if a vendor row
 * somehow predates that column.
 */
const FALLBACK_TAX_BPS = 725
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
    // Render terminates TLS upstream, so req.ip is the proxy without this.
    const key = String(req.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.ip || 'unknown'

    // Bound the map itself, or the limiter becomes the memory leak.
    if (buckets.size > 10000) {
      for (const [k, v] of buckets) if (now - v.last > 120000) buckets.delete(k)
      if (buckets.size > 10000) buckets.clear()
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
for (const v of VENDORS) {
  // fee_bps DOES follow the env var, so changing the take rate is not a silent
  // no-op on an existing database.
  upsertVendor.run(v.id, v.name, FEE_BPS, `vt_${randomBytes(24).toString('hex')}`, Date.now())
}

/** Constant-time bearer check, scoped to one vendor row. */
function authVendor(req: express.Request): string | null {
  const header = req.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token.length < 8) return null

  const rows = db.prepare('SELECT id, api_token FROM vendors WHERE api_token IS NOT NULL').all() as {
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
app.get('/api/health', (_req, res) => {
  try {
    db.prepare('SELECT count(*) AS n FROM orders').get()
    res.json({ ok: true })
  } catch (err) {
    console.error('health: database unreadable', err)
    res.status(503).json({ ok: false })
  }
})

app.get('/api/catalogue', (_req, res) => {
  res.json({ vendors: VENDORS, brands: BRANDS })
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

app.post('/api/orders', rateLimiter(30, 10), (req, res) => {
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
    const prior = db
      .prepare('SELECT id, request_digest FROM orders WHERE idempotency_key = ?')
      .get(idemKey) as { id: string; request_digest: string | null } | undefined
    if (prior) {
      if (prior.request_digest && prior.request_digest !== requestDigest) {
        return res.status(409).json({
          error: 'This idempotency key was already used for a different order.',
        })
      }
      return res.status(200).json(readOrder(prior.id, { forCustomer: true }))
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
  const taxShare = vendorIds.map((id, i) => {
    const bps = VENDORS.find((v) => v.id === id)?.taxBps ?? FALLBACK_TAX_BPS
    return Math.round((vendorSubtotals[i] * bps) / 10000)
  })
  const tax = taxShare.reduce((a, b) => a + b, 0)

  const serviceFee = Math.round((subtotal * SERVICE_BPS) / 10000)
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0
  const tip = Math.round((subtotal * tipBps) / 10000)
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
  const activeCodes = new Set(
    (
      db
        .prepare("SELECT DISTINCT o.code AS code FROM orders o JOIN tickets t ON t.order_id = o.id WHERE t.state != 'collected'")
        .all() as { code: string }[]
    ).map((r) => r.code),
  )
  let code = `#${1000 + Math.floor(Math.random() * 8999)}`
  for (let i = 0; i < 40 && activeCodes.has(code); i++) {
    code = `#${1000 + Math.floor(Math.random() * 8999)}`
  }

  const write = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, code, customer_name, customer_phone, fulfilment, subtotal, tax,
        service_fee, delivery_fee, tip, total, eta_minutes, payment_state, idempotency_key,
        address, request_digest, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      orderId, code, name, phone, fulfilment, subtotal, tax,
      serviceFee, deliveryFee, tip, total, etaMinutes, 'mock', idemKey,
      address || null, requestDigest, now,
    )

    vendorIds.forEach((vendorId, vi) => {
      const list = groups.get(vendorId)!
      const vSubtotal = vendorSubtotals[vi]
      const feeBps =
        (db.prepare('SELECT fee_bps FROM vendors WHERE id = ?').get(vendorId) as { fee_bps: number } | undefined)
          ?.fee_bps ?? FEE_BPS
      const platformFee = Math.round((vSubtotal * feeBps) / 10000)
      const ticketId = `t_${randomBytes(8).toString('hex')}`
      const brandIds = [...new Set(list.map((p) => p.brandId))]
      // The tip belongs to the kitchen, not the platform. The fee is taken on
      // food only, never on tax or tip.
      const payout = vSubtotal - platformFee + taxShare[vi] + tipShare[vi]

      db.prepare(
        `INSERT INTO tickets (id, order_id, vendor_id, brand_ids, subtotal, platform_fee,
          vendor_payout, tax, tip, state, state_changed_at, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,'queued',?,?)`,
      ).run(
        ticketId, orderId, vendorId, JSON.stringify(brandIds), vSubtotal, platformFee,
        payout, taxShare[vi], tipShare[vi], now, now,
      )

      for (const p of list) {
        db.prepare(
          `INSERT INTO ticket_lines (id, ticket_id, brand_id, item_id, name, qty, unit, options, note)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        ).run(
          `tl_${randomBytes(8).toString('hex')}`,
          ticketId, p.brandId, p.itemId, p.name, p.qty, p.unit,
          JSON.stringify(p.options), p.note ?? null,
        )
      }
    })
  })

  // IMMEDIATE: this transaction reads (fee_bps) before it writes, which is the
  // classic deferred-transaction upgrade deadlock once there is a second writer.
  write.immediate()
  res.status(201).json(readOrder(orderId, { forCustomer: true }))
})

/**
 * Vendor-scoped queue. Previously this returned every order on the platform to
 * anyone, which handed each vendor their competitors' revenue and the
 * commission rate the platform charges them.
 */
app.get('/api/orders', (req, res) => {
  const vendorId = authVendor(req)
  if (!vendorId) return res.status(401).json({ error: 'Vendor token required.' })

  const ids = db
    .prepare(
      `SELECT DISTINCT o.id FROM orders o
       JOIN tickets t ON t.order_id = o.id
       WHERE t.vendor_id = ? ORDER BY o.created_at DESC LIMIT 50`,
    )
    .all(vendorId) as { id: string }[]

  res.json(ids.map((r) => readOrder(r.id, { vendorId })).filter(Boolean))
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
app.get('/api/orders/:id', (req, res) => {
  const vendorId = authVendor(req)
  const order = readOrder(req.params.id, { forCustomer: true, ...(vendorId ? { vendorId } : {}) })
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
app.post('/api/tickets/:id/state', (req, res) => {
  const vendorId = authVendor(req)
  if (!vendorId) return res.status(401).json({ error: 'Vendor token required.' })

  const body = isObj(req.body) ? req.body : {}
  const state = typeof body.state === 'string' ? body.state : ''
  if (!['queued', 'cooking', 'ready', 'collected'].includes(state)) {
    return res.status(400).json({ error: 'Bad state' })
  }

  const ticket = db.prepare('SELECT vendor_id, state FROM tickets WHERE id = ?').get(req.params.id) as
    | { vendor_id: string; state: string }
    | undefined
  if (!ticket) return res.status(404).json({ error: 'Not found' })
  if (ticket.vendor_id !== vendorId) return res.status(403).json({ error: 'Not your ticket.' })
  if (!NEXT_STATE[ticket.state]?.includes(state)) {
    return res.status(409).json({ error: `Cannot move ${ticket.state} -> ${state}` })
  }

  // Compare-and-swap on the observed state so two terminals cannot both advance.
  const info = db
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

function readOrder(id: string, opts: ReadOpts = {}) {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!o) return null

  const tickets = (
    opts.vendorId
      ? db.prepare('SELECT * FROM tickets WHERE order_id = ? AND vendor_id = ?').all(id, opts.vendorId)
      : db.prepare('SELECT * FROM tickets WHERE order_id = ?').all(id)
  ) as Record<string, unknown>[]

  return {
    id: o.id,
    code: o.code,
    createdAt: o.created_at,
    fulfilment: o.fulfilment,
    etaMinutes: o.eta_minutes,
    total: o.total,
    tickets: tickets.map((t) => {
      const lines = db
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
    }),
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
  setInterval(() => {
    try {
      const due: Record<string, number> = { queued: 12, cooking: 45, ready: 120 }
      const rows = db
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
        db.prepare(
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
app.post('/api/applications', rateLimiter(6, 3), (req, res) => {
  if (!isObj(req.body)) return res.status(400).json({ error: 'Body must be an object.' })
  const b = req.body
  const str = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MAX_APP_FIELD) : '')

  const business = str(b.business)
  const contact = str(b.contact)
  if (business.length < 2) return res.status(400).json({ error: 'Business name is required.' })
  if (contact.length < 5) return res.status(400).json({ error: 'A phone or email is required.' })

  db.prepare(
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
function notifyLead(lead: Record<string, string>) {
  const line = `NEW VENDOR LEAD  ${lead.business} | ${lead.contact}` +
    `${lead.cuisine ? ` | ${lead.cuisine}` : ''}${lead.city ? ` | ${lead.city}` : ''}` +
    `${lead.social ? ` | ${lead.social}` : ''}`
  console.log(line)

  const url = process.env.LEAD_WEBHOOK_URL
  if (!url) return

  const timeout = AbortSignal.timeout(8000)
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // `text` is what Slack and Discord both read; the fields are there for
    // anything that wants structure.
    body: JSON.stringify({ text: line, ...lead }),
    signal: timeout,
  }).catch((err) => console.error('lead webhook failed (lead is saved):', String(err)))
}

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
app.get('/api/applications', (req, res) => {
  if (OPERATOR_TOKEN.length < 16) {
    return res.status(503).json({ error: 'No operator token configured.' })
  }
  const sent = String(req.get('authorization') ?? '').replace(/^Bearer /, '')
  const a = Buffer.from(sent)
  const b = Buffer.from(OPERATOR_TOKEN)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Operator token required.' })
  }
  res.json(db.prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT 200').all())
})

/* ---------- static ---------- */

app.use(express.static(join(here, '..', 'dist')))
app.get('*', (_req, res) => res.sendFile(join(here, '..', 'dist', 'index.html')))

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

app.listen(PORT, () => {
  console.log(`api + static on http://localhost:${PORT}`)
  if (!PAYMENTS_WIRED) {
    console.warn('*** MOCK PAYMENTS: orders are accepted and NOTHING is charged. ***')
  }
  if (SIMULATE_KITCHEN) {
    console.warn('*** KITCHEN SIMULATOR ON: ticket states advance on a timer, not by a kitchen. ***')
  } else if (PROD) {
    console.warn('*** No kitchen display exists. Tickets will stay queued until one does. ***')
  }
  if (!PROD) {
    const rows = db.prepare('SELECT id, api_token FROM vendors').all() as { id: string; api_token: string }[]
    console.log('vendor tokens (dev only):')
    for (const r of rows) console.log(`  ${r.id}  ${r.api_token}`)
  }
})
