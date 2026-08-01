import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { BRANDS, brandById } from '../data/brands'

/**
 * One cart across every brand. This is the whole point of the product: a
 * customer can put wings, boba and a birria plate in the same order even though
 * three different businesses get paid.
 *
 * Money is cents everywhere. Never floats.
 */

export interface CartOption {
  groupId: string
  choiceId: string
  name: string
  price: number
}

export interface CartLine {
  lineId: string
  brandId: string
  itemId: string
  name: string
  unitPrice: number
  qty: number
  options: CartOption[]
  note?: string
}

interface State {
  lines: CartLine[]
  tipBps: number
  fulfilment: 'pickup' | 'delivery'
}

type Action =
  | { type: 'add'; line: Omit<CartLine, 'lineId'> }
  | { type: 'qty'; lineId: string; delta: number }
  | { type: 'remove'; lineId: string }
  | { type: 'clearBrand'; brandId: string }
  | { type: 'clear' }
  | { type: 'tip'; bps: number }
  | { type: 'fulfilment'; mode: 'pickup' | 'delivery' }
  | { type: 'hydrate'; state: State }

const TAX_BPS = 875 // 8.75%
const DELIVERY_FEE = 399
const SERVICE_BPS = 500

const STORAGE_KEY = 'fb.cart.v1'

const initialState: State = { lines: [], tipBps: 1800, fulfilment: 'pickup' }

/** Same item + same options collapses into one line, like every real cart. */
const signature = (l: Omit<CartLine, 'lineId'>) =>
  `${l.itemId}:${l.options.map((o) => o.choiceId).sort().join(',')}:${l.note ?? ''}`

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return action.state
    case 'add': {
      const sig = signature(action.line)
      const existing = state.lines.find((l) => signature(l) === sig)
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.lineId === existing.lineId ? { ...l, qty: l.qty + action.line.qty } : l,
          ),
        }
      }
      const lineId = `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
      return { ...state, lines: [...state.lines, { ...action.line, lineId }] }
    }
    case 'qty': {
      const next = state.lines
        .map((l) => (l.lineId === action.lineId ? { ...l, qty: l.qty + action.delta } : l))
        .filter((l) => l.qty > 0)
      return { ...state, lines: next }
    }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.lineId !== action.lineId) }
    case 'clearBrand':
      return { ...state, lines: state.lines.filter((l) => l.brandId !== action.brandId) }
    case 'clear':
      return { ...state, lines: [] }
    case 'tip':
      return { ...state, tipBps: action.bps }
    case 'fulfilment':
      return { ...state, fulfilment: action.mode }
  }
}

export const lineTotal = (l: CartLine) =>
  (l.unitPrice + l.options.reduce((s, o) => s + o.price, 0)) * l.qty

export interface VendorGroup {
  vendorId: string
  brandIds: string[]
  lines: CartLine[]
  subtotal: number
}

export interface Totals {
  subtotal: number
  tax: number
  serviceFee: number
  deliveryFee: number
  tip: number
  total: number
  /** What each vendor is owed before the platform cut. */
  byVendor: VendorGroup[]
}

function computeTotals(state: State): Totals {
  const byVendorMap = new Map<string, VendorGroup>()

  for (const line of state.lines) {
    const brand = brandById(line.brandId)
    if (!brand) continue
    let group = byVendorMap.get(brand.vendorId)
    if (!group) {
      group = { vendorId: brand.vendorId, brandIds: [], lines: [], subtotal: 0 }
      byVendorMap.set(brand.vendorId, group)
    }
    if (!group.brandIds.includes(brand.id)) group.brandIds.push(brand.id)
    group.lines.push(line)
    group.subtotal += lineTotal(line)
  }

  const byVendor = [...byVendorMap.values()]
  const subtotal = byVendor.reduce((s, g) => s + g.subtotal, 0)
  const tax = Math.round((subtotal * TAX_BPS) / 10000)
  const serviceFee = subtotal === 0 ? 0 : Math.round((subtotal * SERVICE_BPS) / 10000)
  const deliveryFee = subtotal === 0 || state.fulfilment === 'pickup' ? 0 : DELIVERY_FEE
  const tip = Math.round((subtotal * state.tipBps) / 10000)

  return {
    subtotal,
    tax,
    serviceFee,
    deliveryFee,
    tip,
    total: subtotal + tax + serviceFee + deliveryFee + tip,
    byVendor,
  }
}

interface CartApi extends State {
  totals: Totals
  count: number
  /** Distinct brands in the cart — drives the "3 kitchens" line at checkout. */
  brandCount: number
  countForBrand: (brandId: string) => number
  add: (line: Omit<CartLine, 'lineId'>) => void
  setQty: (lineId: string, delta: number) => void
  remove: (lineId: string) => void
  clearBrand: (brandId: string) => void
  clear: () => void
  setTip: (bps: number) => void
  setFulfilment: (mode: 'pickup' | 'delivery') => void
  /** Longest prep time across brands — they cook in parallel, not in series. */
  etaMinutes: number
}

const CartContext = createContext<CartApi | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'hydrate', state: { ...initialState, ...JSON.parse(raw) } })
    } catch {
      /* corrupted cart is not worth crashing over */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* private mode / quota — cart just won't survive a refresh */
    }
  }, [state])

  const value = useMemo<CartApi>(() => {
    const totals = computeTotals(state)
    const brandIds = new Set(state.lines.map((l) => l.brandId))
    const etaMinutes = state.lines.length
      ? Math.max(...[...brandIds].map((id) => brandById(id)?.prepMinutes ?? 10)) +
        (state.fulfilment === 'delivery' ? 12 : 0)
      : 0

    return {
      ...state,
      totals,
      count: state.lines.reduce((s, l) => s + l.qty, 0),
      brandCount: brandIds.size,
      countForBrand: (brandId) =>
        state.lines.filter((l) => l.brandId === brandId).reduce((s, l) => s + l.qty, 0),
      add: (line) => dispatch({ type: 'add', line }),
      setQty: (lineId, delta) => dispatch({ type: 'qty', lineId, delta }),
      remove: (lineId) => dispatch({ type: 'remove', lineId }),
      clearBrand: (brandId) => dispatch({ type: 'clearBrand', brandId }),
      clear: () => dispatch({ type: 'clear' }),
      setTip: (bps) => dispatch({ type: 'tip', bps }),
      setFulfilment: (mode) => dispatch({ type: 'fulfilment', mode }),
      etaMinutes,
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

export const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const BRAND_COUNT = BRANDS.length
