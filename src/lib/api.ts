import { BRANDS } from '../data/brands'
import type { CartLine } from '../store/cart'

/**
 * API client. Falls back to a local simulation when the server isn't running so
 * the shell is always demoable — `offline: true` marks orders that never left
 * the browser, and nothing else in the UI has to care.
 */

export interface TicketLine {
  name: string
  qty: number
  options: string[]
  note?: string
}

export interface Ticket {
  vendorId: string
  brandIds: string[]
  lines: TicketLine[]
  state: 'queued' | 'cooking' | 'ready' | 'collected'
  subtotal: number
  vendorPayout: number
  platformFee: number
}

export interface PlacedOrder {
  id: string
  code: string
  createdAt: number
  fulfilment: 'pickup' | 'delivery'
  etaMinutes: number
  total: number
  tickets: Ticket[]
  offline?: boolean
}

export interface PlaceOrderInput {
  lines: CartLine[]
  fulfilment: 'pickup' | 'delivery'
  tipBps: number
  customer: { name: string; phone: string }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  try {
    return await post<PlacedOrder>('/api/orders', input)
  } catch {
    return simulateOrder(input)
  }
}

export async function listOrders(): Promise<PlacedOrder[]> {
  try {
    const res = await fetch('/api/orders')
    if (!res.ok) throw new Error(String(res.status))
    return (await res.json()) as PlacedOrder[]
  } catch {
    return readLocal()
  }
}

/* ---------- offline fallback ---------- */

const LOCAL_KEY = 'fb.orders.v1'

function readLocal(): PlacedOrder[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as PlacedOrder[]
  } catch {
    return []
  }
}

function writeLocal(orders: PlacedOrder[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(orders.slice(0, 20)))
  } catch {
    /* quota — order still shows for this session */
  }
}

async function simulateOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  const byVendor = new Map<string, Ticket>()

  for (const line of input.lines) {
    const brand = BRANDS.find((b) => b.id === line.brandId)
    if (!brand) continue
    let t = byVendor.get(brand.vendorId)
    if (!t) {
      t = {
        vendorId: brand.vendorId,
        brandIds: [],
        lines: [],
        state: 'queued',
        subtotal: 0,
        vendorPayout: 0,
        platformFee: 0,
      }
      byVendor.set(brand.vendorId, t)
    }
    if (!t.brandIds.includes(brand.id)) t.brandIds.push(brand.id)
    t.lines.push({
      name: line.name,
      qty: line.qty,
      options: line.options.map((o) => o.name),
      note: line.note,
    })
    t.subtotal += (line.unitPrice + line.options.reduce((s, o) => s + o.price, 0)) * line.qty
  }

  const tickets = [...byVendor.values()].map((t) => {
    const platformFee = Math.round(t.subtotal * 0.1)
    return { ...t, platformFee, vendorPayout: t.subtotal - platformFee }
  })

  const subtotal = tickets.reduce((s, t) => s + t.subtotal, 0)
  const eta = Math.max(
    ...input.lines.map((l) => BRANDS.find((b) => b.id === l.brandId)?.prepMinutes ?? 10),
  )

  const order: PlacedOrder = {
    id: `o_local_${Date.now().toString(36)}`,
    code: `#${Math.floor(1000 + Math.random() * 8999)}`,
    createdAt: Date.now(),
    fulfilment: input.fulfilment,
    etaMinutes: eta + (input.fulfilment === 'delivery' ? 12 : 0),
    total:
      subtotal +
      Math.round(subtotal * 0.0875) +
      Math.round(subtotal * 0.05) +
      Math.round((subtotal * input.tipBps) / 10000) +
      (input.fulfilment === 'delivery' ? 399 : 0),
    tickets,
    offline: true,
  }

  writeLocal([order, ...readLocal()])
  return order
}
