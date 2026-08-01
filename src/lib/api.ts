import type { CartLine } from '../store/cart'

/**
 * API client.
 *
 * The important rule here: a *rejection* is never treated as a *network
 * failure*. An earlier version caught both in one `catch` and fabricated a
 * local order whenever anything went wrong, so a 400 ("Unknown item" — which a
 * stale saved cart produces the moment a menu changes) showed the customer a
 * green tick for an order no kitchen ever received.
 */

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
}

export interface PlaceOrderInput {
  lines: CartLine[]
  fulfilment: 'pickup' | 'delivery'
  tipBps: number
  customer: { name: string; phone: string }
  /** Stable across retries of the same submission. */
  idempotencyKey: string
}

const TIMEOUT_MS = 15000

async function request(path: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(path, { ...init, signal: ctrl.signal })
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
  const res = await request('/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      fulfilment: input.fulfilment,
      tipBps: input.tipBps,
      customer: input.customer,
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

  if (!res.ok) throw new OrderRejected(res.status, await errorMessage(res))

  const order = (await res.json()) as PlacedOrder
  if (!order?.id) throw new OrderRejected(res.status, 'Server returned an unrecognised order.')

  rememberOrderId(order.id)
  return order
}

/* ---------- the customer's own order list ---------- */

/**
 * `GET /api/orders` is vendor-scoped now (it used to hand every order on the
 * platform to anyone). Without accounts, the customer's own history is the set
 * of order ids this device has placed; each id is an unguessable capability.
 */
const IDS_KEY = 'fb.orderIds.v1'

function readIds(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(IDS_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 25) : []
  } catch {
    return []
  }
}

function rememberOrderId(id: string) {
  try {
    localStorage.setItem(IDS_KEY, JSON.stringify([id, ...readIds().filter((x) => x !== id)].slice(0, 25)))
  } catch {
    /* private mode — history just won't survive a reload */
  }
}

export interface OrdersResult {
  orders: PlacedOrder[]
  /** True when at least one lookup failed, so the caller can avoid clobbering good data. */
  degraded: boolean
}

export async function listOrders(): Promise<OrdersResult> {
  const ids = readIds()
  if (ids.length === 0) return { orders: [], degraded: false }

  const settled = await Promise.allSettled(
    ids.map(async (id) => {
      const res = await request(`/api/orders/${encodeURIComponent(id)}`)
      if (res.status === 404) return null // genuinely gone; drop it
      if (!res.ok) throw new Error(String(res.status))
      return (await res.json()) as PlacedOrder
    }),
  )

  const orders: PlacedOrder[] = []
  let degraded = false
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      if (r.value) orders.push(r.value)
    } else {
      degraded = true
    }
  }

  orders.sort((a, b) => b.createdAt - a.createdAt)
  return { orders, degraded }
}

export const newIdempotencyKey = () =>
  `ik_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
