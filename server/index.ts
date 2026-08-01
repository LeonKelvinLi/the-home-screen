import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { db } from './db/schema'
import { BRANDS, VENDORS } from '../src/data/brands'

const here = dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '256kb' }))

const PORT = Number(process.env.PORT ?? 8787)
const FEE_BPS = Number(process.env.PLATFORM_FEE_BPS ?? 1000)
const TAX_BPS = 875
const SERVICE_BPS = 500
const DELIVERY_FEE = 399

/* ---------- vendor bootstrap ---------- */

const upsertVendor = db.prepare(
  `INSERT INTO vendors (id, name, fee_bps, created_at) VALUES (?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
)
for (const v of VENDORS) upsertVendor.run(v.id, v.name, FEE_BPS, Date.now())

/* ---------- catalogue ---------- */

/**
 * Flat price index. The client sends item ids and option ids only — every
 * amount is recomputed here. A cart that posts `price: 1` must not become a
 * one-cent burger.
 */
const priceIndex = new Map<
  string,
  { brandId: string; vendorId: string; name: string; price: number; options: Map<string, number> }
>()

for (const brand of BRANDS) {
  for (const cat of brand.menu) {
    for (const item of cat.items) {
      const options = new Map<string, number>()
      for (const g of item.options ?? []) for (const c of g.choices) options.set(c.id, c.price)
      priceIndex.set(item.id, {
        brandId: brand.id,
        vendorId: brand.vendorId,
        name: item.name,
        price: item.price,
        options,
      })
    }
  }
}

app.get('/api/catalogue', (_req, res) => {
  res.json({ vendors: VENDORS, brands: BRANDS })
})

/* ---------- orders ---------- */

interface IncomingLine {
  itemId: string
  qty: number
  options?: { choiceId: string }[]
  note?: string
}

app.post('/api/orders', (req, res) => {
  const body = req.body as {
    lines?: IncomingLine[]
    fulfilment?: 'pickup' | 'delivery'
    tipBps?: number
    customer?: { name?: string; phone?: string }
  }

  const lines = Array.isArray(body.lines) ? body.lines : []
  const name = (body.customer?.name ?? '').trim()
  const phone = (body.customer?.phone ?? '').trim()
  const fulfilment = body.fulfilment === 'delivery' ? 'delivery' : 'pickup'
  const tipBps = Math.max(0, Math.min(5000, Number(body.tipBps ?? 0)))

  if (lines.length === 0) return res.status(400).json({ error: 'Cart is empty.' })
  if (name.length < 2) return res.status(400).json({ error: 'Name is required.' })
  if (phone.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Valid phone required.' })

  type Priced = {
    vendorId: string
    brandId: string
    itemId: string
    name: string
    qty: number
    unit: number
    options: { choiceId: string; price: number }[]
    note?: string
  }

  const priced: Priced[] = []
  for (const raw of lines) {
    const item = priceIndex.get(String(raw.itemId))
    if (!item) return res.status(400).json({ error: `Unknown item: ${raw.itemId}` })
    const qty = Math.max(1, Math.min(50, Math.floor(Number(raw.qty) || 1)))

    const options: { choiceId: string; price: number }[] = []
    for (const o of raw.options ?? []) {
      const price = item.options.get(String(o.choiceId))
      if (price === undefined) return res.status(400).json({ error: `Unknown option: ${o.choiceId}` })
      options.push({ choiceId: String(o.choiceId), price })
    }

    priced.push({
      vendorId: item.vendorId,
      brandId: item.brandId,
      itemId: String(raw.itemId),
      name: item.name,
      qty,
      unit: item.price + options.reduce((s, o) => s + o.price, 0),
      options,
      note: raw.note ? String(raw.note).slice(0, 240) : undefined,
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

  const brandPrep = new Map(BRANDS.map((b) => [b.id, b.prepMinutes]))
  const etaMinutes =
    Math.max(...priced.map((p) => brandPrep.get(p.brandId) ?? 10)) + (fulfilment === 'delivery' ? 12 : 0)

  const now = Date.now()
  const orderId = `o_${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`
  const code = `#${1000 + Math.floor(Math.random() * 8999)}`

  const write = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, code, customer_name, customer_phone, fulfilment, subtotal, tax,
        service_fee, delivery_fee, tip, total, eta_minutes, payment_state, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      orderId, code, name, phone, fulfilment, subtotal, tax,
      serviceFee, deliveryFee, tip, total, etaMinutes, 'mock', now,
    )

    for (const [vendorId, list] of groups) {
      const vSubtotal = list.reduce((s, p) => s + p.unit * p.qty, 0)
      const feeBps =
        (db.prepare('SELECT fee_bps FROM vendors WHERE id = ?').get(vendorId) as { fee_bps: number } | undefined)
          ?.fee_bps ?? FEE_BPS
      const platformFee = Math.round((vSubtotal * feeBps) / 10000)
      const ticketId = `t_${Math.random().toString(36).slice(2, 10)}`
      const brandIds = [...new Set(list.map((p) => p.brandId))]

      db.prepare(
        `INSERT INTO tickets (id, order_id, vendor_id, brand_ids, subtotal, platform_fee,
          vendor_payout, created_at) VALUES (?,?,?,?,?,?,?,?)`,
      ).run(ticketId, orderId, vendorId, JSON.stringify(brandIds), vSubtotal, platformFee, vSubtotal - platformFee, now)

      for (const p of list) {
        db.prepare(
          `INSERT INTO ticket_lines (id, ticket_id, brand_id, item_id, name, qty, unit, options, note)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        ).run(
          `tl_${Math.random().toString(36).slice(2, 10)}`,
          ticketId, p.brandId, p.itemId, p.name, p.qty, p.unit,
          JSON.stringify(p.options.map((o) => o.choiceId)), p.note ?? null,
        )
      }
    }
  })

  write()
  res.status(201).json(readOrder(orderId))
})

app.get('/api/orders', (_req, res) => {
  const ids = db
    .prepare('SELECT id FROM orders ORDER BY created_at DESC LIMIT 20')
    .all() as { id: string }[]
  res.json(ids.map((r) => readOrder(r.id)).filter(Boolean))
})

app.get('/api/orders/:id', (req, res) => {
  const order = readOrder(req.params.id)
  if (!order) return res.status(404).json({ error: 'Not found' })
  res.json(order)
})

/** Kitchen-facing: advance a ticket. This is the whole KDS API for now. */
app.post('/api/tickets/:id/state', (req, res) => {
  const state = String((req.body as { state?: string }).state ?? '')
  if (!['queued', 'cooking', 'ready', 'collected'].includes(state)) {
    return res.status(400).json({ error: 'Bad state' })
  }
  const info = db.prepare('UPDATE tickets SET state = ? WHERE id = ?').run(state, req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

function readOrder(id: string) {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!o) return null

  const tickets = db.prepare('SELECT * FROM tickets WHERE order_id = ?').all(id) as Record<string, unknown>[]

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
        subtotal: t.subtotal,
        platformFee: t.platform_fee,
        vendorPayout: t.vendor_payout,
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
 * truthful to show. Replaced by real kitchen input the moment a KDS exists.
 */
setInterval(() => {
  const next: Record<string, string> = { queued: 'cooking', cooking: 'ready', ready: 'collected' }
  const rows = db
    .prepare(`SELECT id, state, created_at FROM tickets WHERE state != 'collected'`)
    .all() as { id: string; state: string; created_at: number }[]

  for (const r of rows) {
    const age = (Date.now() - r.created_at) / 1000
    const due = r.state === 'queued' ? 12 : r.state === 'cooking' ? 45 : 120
    if (age > due) db.prepare('UPDATE tickets SET state = ? WHERE id = ?').run(next[r.state], r.id)
  }
}, 5000)

/* ---------- static ---------- */

app.use(express.static(join(here, '..', 'dist')))
app.get('*', (_req, res) => res.sendFile(join(here, '..', 'dist', 'index.html')))

app.listen(PORT, () => {
  console.log(`api + static on http://localhost:${PORT}`)
})
