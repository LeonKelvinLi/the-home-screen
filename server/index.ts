import express from 'express'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { db } from './db/schema'
import { BRANDS, VENDORS } from '../src/data/brands'

const here = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '256kb' }))

const PORT = Number(process.env.PORT ?? 8787)
const PROD = process.env.NODE_ENV === 'production'
const TAX_BPS = 875
const SERVICE_BPS = 500
const DELIVERY_FEE = 399

/** Hard ceilings. Every one of these is reachable by an anonymous POST. */
const MAX_LINES = 60
const MAX_QTY = 50
const MAX_NAME = 100
const MAX_PHONE = 30
const MAX_NOTE = 240
const MAX_ORDER_TOTAL = 200_000 // $2,000

/** A fat-fingered PLATFORM_FEE_BPS must not be able to mint negative payouts. */
const rawFee = Number(process.env.PLATFORM_FEE_BPS ?? 1000)
if (!Number.isFinite(rawFee) || rawFee < 0 || rawFee > 10000) {
  throw new Error(`PLATFORM_FEE_BPS must be 0..10000, got ${process.env.PLATFORM_FEE_BPS}`)
}
const FEE_BPS = Math.round(rawFee)

/**
 * Real payments are not wired up. Refuse to run in production rather than
 * quietly dispatching food against no authorization.
 */
if (PROD && !process.env.STRIPE_SECRET_KEY) {
  throw new Error('Refusing to start in production without STRIPE_SECRET_KEY: payments are mocked.')
}

/** The kitchen simulator must never run where real vendors are working. */
const SIMULATE_KITCHEN = process.env.SIMULATE_KITCHEN !== '0' && !PROD

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

app.post('/api/orders', (req, res) => {
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
  const tipBps = intOr(body.tipBps, 0, 0, 5000)
  const idemKey =
    typeof body.idempotencyKey === 'string' && body.idempotencyKey.length <= 80
      ? body.idempotencyKey
      : null

  if (lines.length === 0) return res.status(400).json({ error: 'Cart is empty.' })
  if (lines.length > MAX_LINES) return res.status(400).json({ error: `Too many lines (max ${MAX_LINES}).` })
  if (name.length < 2 || name.length > MAX_NAME) return res.status(400).json({ error: 'Name is required.' })
  if (phone.replace(/\D/g, '').length < 10 || phone.length > MAX_PHONE) {
    return res.status(400).json({ error: 'Valid phone required.' })
  }

  // Replaying the same submission must not print a second set of tickets.
  if (idemKey) {
    const prior = db.prepare('SELECT id FROM orders WHERE idempotency_key = ?').get(idemKey) as
      | { id: string }
      | undefined
    if (prior) return res.status(200).json(readOrder(prior.id, { forCustomer: true }))
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
  const tax = Math.round((subtotal * TAX_BPS) / 10000)
  const serviceFee = Math.round((subtotal * SERVICE_BPS) / 10000)
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0
  const tip = Math.round((subtotal * tipBps) / 10000)
  const total = subtotal + tax + serviceFee + deliveryFee + tip

  if (total > MAX_ORDER_TOTAL) {
    return res.status(400).json({ error: 'Order exceeds the maximum value.' })
  }

  // Tax and tip are collected once on the order but owed per vendor. Allocate
  // by vendor subtotal so the parts sum back to the order-level figure exactly.
  const vendorIds = [...groups.keys()]
  const vendorSubtotals = vendorIds.map((id) => groups.get(id)!.reduce((s, p) => s + p.unit * p.qty, 0))
  const taxShare = allocate(tax, vendorSubtotals)
  const tipShare = allocate(tip, vendorSubtotals)

  const brandPrep = new Map(BRANDS.map((b) => [b.id, b.prepMinutes]))
  const etaMinutes =
    Math.max(...priced.map((p) => brandPrep.get(p.brandId) ?? 10)) + (fulfilment === 'delivery' ? 12 : 0)

  const now = Date.now()
  const orderId = `o_${now.toString(36)}${randomBytes(6).toString('hex')}`
  const code = `#${1000 + Math.floor(Math.random() * 8999)}`

  const write = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, code, customer_name, customer_phone, fulfilment, subtotal, tax,
        service_fee, delivery_fee, tip, total, eta_minutes, payment_state, idempotency_key, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      orderId, code, name, phone, fulfilment, subtotal, tax,
      serviceFee, deliveryFee, tip, total, etaMinutes, 'mock', idemKey, now,
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

/** Customer-facing lookup. The unguessable order id is the capability. */
app.get('/api/orders/:id', (req, res) => {
  const order = readOrder(req.params.id, { forCustomer: true })
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

/* ---------- static ---------- */

app.use(express.static(join(here, '..', 'dist')))
app.get('*', (_req, res) => res.sendFile(join(here, '..', 'dist', 'index.html')))

/** Never return a stack trace: it leaks absolute paths and the dependency tree. */
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('unhandled:', err)
  res.status(500).json({ error: 'Internal error' })
})

app.listen(PORT, () => {
  console.log(`api + static on http://localhost:${PORT}`)
  if (SIMULATE_KITCHEN) console.log('kitchen simulator: ON (set SIMULATE_KITCHEN=0 to disable)')
  if (!PROD) {
    const rows = db.prepare('SELECT id, api_token FROM vendors').all() as { id: string; api_token: string }[]
    console.log('vendor tokens (dev only):')
    for (const r of rows) console.log(`  ${r.id}  ${r.api_token}`)
  }
})
