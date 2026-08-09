import { BRANDS } from '../data/brands'
import { taxForVendorSubtotals, feeBaseFor } from './tax'
import type { CartLine } from '../store/cart'

/**
 * Order client.
 *
 * This build ships FRONT-END ONLY: there is no server, so an order cannot reach
 * a kitchen. Rather than pretend otherwise, local mode marks every order
 * `local: true` and the UI says plainly that nobody has received it. A silent
 * green tick for an order that goes nowhere is the one failure mode that costs
 * a real customer a real lunch.
 *
 * Set VITE_API_BASE at build time to point at a real backend; every call below
 * then goes over the wire and `local` disappears. The server in /server is
 * written and tested but not deployed.
 */

const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

/**
 * Two independent switches, because they fail differently.
 *
 * ORDERING_LIVE  — the order reaches a kitchen. Off means it lives only in this
 *                  browser, and every surface has to say so.
 * PAYMENTS_LIVE  — a card is actually charged. Off while ordering is on is a
 *                  real state (the kitchen cooks, nothing is billed) and the
 *                  customer must be told that too, not shown a fake card row.
 *
 * Inferred from an explicit flag rather than from an empty API_BASE, because
 * same-origin is a legitimate base and would otherwise read as "no backend".
 */
export const ORDERING_LIVE = import.meta.env.VITE_ORDERING === 'live'
export const PAYMENTS_LIVE = import.meta.env.VITE_PAYMENTS === 'live'
export const IS_LOCAL_ONLY = !ORDERING_LIVE

export class OrderRejected extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'OrderRejected'
  }
}

export class NetworkDown extends Error {
  constructor() {
    super('Could not reach the server. Check your connection and try again.')
    this.name = 'NetworkDown'
  }
}

export interface TicketLine {
  name: string
  qty: number
  options: string[]
  note?: string
}

export interface Ticket {
  id?: string
  vendorId: string
  brandIds: string[]
  lines: TicketLine[]
  state: 'queued' | 'cooking' | 'ready' | 'collected'
}

export interface PlacedOrder {
  id: string
  code: string
  createdAt: number
  fulfilment: 'pickup' | 'delivery'
  etaMinutes: number
  total: number
  tickets: Ticket[]
  /** True when this order exists only on this device. */
  local?: boolean
  /**
   * True when the server is advancing ticket states on a timer rather than a
   * kitchen doing it. The screens must say so: a progress bar that reaches
   * "ready" on its own, with nothing said, sends someone out for food nobody
   * has started cooking.
   */
  simulated?: boolean
}

export interface PlaceOrderInput {
  lines: CartLine[]
  fulfilment: 'pickup' | 'delivery'
  tipBps: number
  customer: { name: string; phone: string }
  address?: string
  idempotencyKey: string
}

const TIMEOUT_MS = 15000

async function request(path: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(`${API_BASE}${path}`, { ...init, signal: ctrl.signal })
  } catch {
    // fetch only rejects on transport failure or abort — never on 4xx/5xx.
    throw new NetworkDown()
  } finally {
    clearTimeout(timer)
  }
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string }
    if (body?.error) return body.error
  } catch {
    /* not JSON */
  }
  return `Request failed (${res.status}).`
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  if (IS_LOCAL_ONLY) return placeLocalOrder(input)

  const res = await request('/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      fulfilment: input.fulfilment,
      tipBps: input.tipBps,
      customer: input.customer,
      address: input.address,
      idempotencyKey: input.idempotencyKey,
      // Send ids only. Every amount is recomputed server-side.
      lines: input.lines.map((l) => ({
        itemId: l.itemId,
        qty: l.qty,
        options: l.options.map((o) => ({ choiceId: o.choiceId })),
        note: l.note,
      })),
    }),
  })

  // A rejection is never treated as a network failure: a 400 from a stale saved
  // cart must surface, not silently become a fabricated success.
  if (!res.ok) throw new OrderRejected(res.status, await errorMessage(res))

  const order = (await res.json()) as PlacedOrder
  if (!order?.id) throw new OrderRejected(res.status, 'Server returned an unrecognised order.')

  rememberOrder(order)
  return order
}

/* ---------- local-only mode ---------- */

const ORDERS_KEY = 'fb.orders.v2'

function readLocal(): PlacedOrder[] {
  try {
    const v = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
    return Array.isArray(v) ? (v as PlacedOrder[]).filter((o) => o && typeof o.id === 'string') : []
  } catch {
    return []
  }
}

function rememberOrder(order: PlacedOrder) {
  try {
    const next = [order, ...readLocal().filter((o) => o.id !== order.id)].slice(0, 25)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(next))
  } catch {
    /* private mode / quota — history just won't survive a reload */
  }
}

const SERVICE_BPS = 500
const DELIVERY_FEE = 399

/** Mirrors the server's pricing exactly, so switching to a backend changes no totals. */
function placeLocalOrder(input: PlaceOrderInput): PlacedOrder {
  const byVendor = new Map<string, Ticket>()

  for (const line of input.lines) {
    const brand = BRANDS.find((b) => b.id === line.brandId)
    if (!brand) continue
    let t = byVendor.get(brand.vendorId)
    if (!t) {
      t = { vendorId: brand.vendorId, brandIds: [], lines: [], state: 'queued' }
      byVendor.set(brand.vendorId, t)
    }
    if (!t.brandIds.includes(brand.id)) t.brandIds.push(brand.id)
    t.lines.push({
      name: line.name,
      qty: line.qty,
      options: line.options.map((o) => o.name),
      note: line.note,
    })
  }

  const lineTotal = (l: (typeof input.lines)[number]) =>
    (l.unitPrice + l.options.reduce((a, o) => a + o.price, 0)) * l.qty
  const subtotal = input.lines.reduce((s, l) => s + lineTotal(l), 0)

  // Tax is per seller, so it needs subtotals grouped by vendor, which the
  // ticket shape does not carry.
  const vendorSubtotals = new Map<string, number>()
  for (const l of input.lines) {
    const brand = BRANDS.find((b) => b.id === l.brandId)
    if (!brand) continue
    vendorSubtotals.set(brand.vendorId, (vendorSubtotals.get(brand.vendorId) ?? 0) + lineTotal(l))
  }
  const prep = new Map(BRANDS.map((b) => [b.id, b.prepMinutes]))
  const eta =
    Math.max(...input.lines.map((l) => prep.get(l.brandId) ?? 10)) +
    (input.fulfilment === 'delivery' ? 12 : 0)

  const localFeeBase = feeBaseFor(
    [...vendorSubtotals].map(([vendorId, subtotal]) => ({ vendorId, subtotal })),
  )

  const order: PlacedOrder = {
    id: `o_local_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    code: `#${1000 + Math.floor(Math.random() * 8999)}`,
    createdAt: Date.now(),
    fulfilment: input.fulfilment,
    etaMinutes: eta,
    /*
      Fee and tip come off feeBase, NOT off subtotal.

      This function's docstring says it mirrors the server's pricing exactly and
      it had stopped doing so. A vendor with taxIncluded prices already has tax
      inside its subtotal; the cart, the checkout screen and the server all back
      that out before charging a percentage on top, and this did not. On a real
      cart with top dog in it the customer approved $27.46 and the order was
      recorded as $27.90 — 44c apart, on the screen that tells them what they
      paid.

      Local mode is dev-only (o_local is tree-shaken out of the live build), so
      no customer was charged this. It is still the number a preview build shows
      the operator when he checks the maths.
    */
    total:
      subtotal +
      taxForVendorSubtotals(
        [...vendorSubtotals].map(([vendorId, subtotal]) => ({ vendorId, subtotal })),
      ) +
      Math.round((localFeeBase * SERVICE_BPS) / 10000) +
      Math.round((localFeeBase * input.tipBps) / 10000) +
      (input.fulfilment === 'delivery' ? DELIVERY_FEE : 0),
    tickets: [...byVendor.values()],
    local: true,
  }

  rememberOrder(order)
  return order
}

/* ---------- reading orders back ---------- */

export interface OrdersResult {
  orders: PlacedOrder[]
  /** True when at least one lookup failed, so the caller can avoid clobbering good data. */
  degraded: boolean
}

/**
 * Orders that can still change state. A collected order is finished, so
 * re-fetching it every six seconds forever buys nothing.
 */
const isSettled = (o: PlacedOrder) =>
  o.tickets.length > 0 && o.tickets.every((t) => t.state === 'collected')

/*
  How many live lookups one poll may spend.

  The route allows 120/min burst 40, which is 12 tokens per 6-second poll — and
  this fanned out one request per stored order, up to 25. Any repeat customer
  with more than 12 saved orders was in permanent deficit: from the third poll
  on, roughly half the lookups 429'd, `degraded` latched, and the "Reconnecting"
  banner never cleared while stale copies were shown as if live. No attacker
  needed, just arithmetic against a good customer.
*/
const POLL_BUDGET = 8

export async function listOrders(): Promise<OrdersResult> {
  const stored = readLocal()
  if (IS_LOCAL_ONLY) return { orders: stored, degraded: false }

  // With a backend, the stored ids are capabilities — re-fetch for live state.
  // Newest first, and only the ones that can still move, so the budget is spent
  // on the order the customer is actually watching.
  const live = stored
    .filter((o) => !isSettled(o))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, POLL_BUDGET)
  const liveIds = new Set(live.map((o) => o.id))

  const settled = await Promise.allSettled(
    live.map(async (o) => {
      const res = await request(`/api/orders/${encodeURIComponent(o.id)}`)
      if (res.status === 404) return null
      if (!res.ok) throw new Error(String(res.status))
      return (await res.json()) as PlacedOrder
    }),
  )

  // Everything not re-fetched is either finished or older than the budget —
  // its last known copy is still correct, so show it rather than hiding it.
  const orders: PlacedOrder[] = stored.filter((o) => !liveIds.has(o.id))
  let degraded = false
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      if (r.value) orders.push(r.value)
    } else {
      degraded = true
      orders.push(live[i]) // keep the last known copy rather than dropping it
    }
  })

  orders.sort((a, b) => b.createdAt - a.createdAt)
  return { orders, degraded }
}

/* ---------- vendor applications ---------- */

export interface ApplicationInput {
  business: string
  cuisine: string
  contact: string
  city: string
  social: string
}

export async function submitApplication(input: ApplicationInput): Promise<void> {
  if (IS_LOCAL_ONLY) {
    // Keep it rather than drop it — a lead is worth more than an order.
    try {
      const key = 'fb.applications.v1'
      const prev = JSON.parse(localStorage.getItem(key) ?? '[]')
      localStorage.setItem(key, JSON.stringify([{ ...input, at: Date.now() }, ...prev].slice(0, 50)))
    } catch {
      /* private mode */
    }
    return
  }

  const res = await request('/api/applications', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new OrderRejected(res.status, await errorMessage(res))
}

export const newIdempotencyKey = () =>
  `ik_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`

/* ---------- calendar ---------- */

export interface PartnerEvent {
  id: string
  /** Local YYYY-MM-DD. A day, not a moment — see the note in db/schema.ts. */
  date: string
  brandId: string
  title: string
  detail?: string
  time?: string
  postedBy: 'operator' | 'partner'
}

/**
 * What the businesses have on, for one month.
 *
 * Returns an empty list rather than throwing when the backend is not there:
 * the calendar is a secondary surface and a customer who opened it should get a
 * month they can read, not an error. The screen distinguishes "nothing posted"
 * from "could not reach the server" using `ok`.
 */
export async function listEvents(
  from: string,
  to: string,
): Promise<{ events: PartnerEvent[]; ok: boolean }> {
  if (IS_LOCAL_ONLY) return { events: [], ok: true }
  try {
    const res = await request(`/api/events?from=${from}&to=${to}`)
    if (!res.ok) return { events: [], ok: false }
    return { events: (await res.json()) as PartnerEvent[], ok: true }
  } catch {
    return { events: [], ok: false }
  }
}
