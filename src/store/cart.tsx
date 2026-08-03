import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { BRANDS, brandById } from '../data/brands'
import { taxForVendorSubtotals } from '../lib/tax'

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

const DELIVERY_FEE = 399
const SERVICE_BPS = 500
/** Mirrors the server's per-line clamp. */
export const MAX_QTY = 50

const STORAGE_KEY = 'fb.cart.v1'

/*
  No pre-selected tip on pickup. An 18% default turned a $9.25 counter-collection
  order into $12.19, with the tip row below the fold and only the inflated total
  on the sticky bar. Switching to delivery opts into 15%.
*/
const initialState: State = { lines: [], tipBps: 0, fulfilment: 'pickup' }

/**
 * Restore the saved cart, dropping anything that is no longer orderable.
 *
 * A persisted cart outlives the catalogue: an item removed from the menu would
 * otherwise sit in the cart forever and make every checkout fail server-side.
 * Also defends against a corrupted `lines` value, which used to crash the whole
 * app on every load with no way out but clearing site data.
 */
function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<State>

    const lines = Array.isArray(parsed.lines)
      ? parsed.lines.filter(
          (l): l is CartLine =>
            !!l &&
            typeof l.lineId === 'string' &&
            typeof l.itemId === 'string' &&
            typeof l.qty === 'number' &&
            l.qty > 0 &&
            Array.isArray(l.options) &&
            !!brandById(l.brandId),
        )
      : []

    return {
      lines,
      tipBps: typeof parsed.tipBps === 'number' ? parsed.tipBps : initialState.tipBps,
      fulfilment: parsed.fulfilment === 'delivery' ? 'delivery' : 'pickup',
    }
  } catch {
    return initialState
  }
}

/**
 * Same item + same options collapses into one line, like every real cart.
 * Keyed on brandId too: item ids are unique across the seed catalogue today,
 * but the moment two vendors both define `fries` the lines would merge and one
 * kitchen would get a ticket the other gets paid for.
 */
const signature = (l: Omit<CartLine, 'lineId'>) =>
  `${l.brandId}:${l.itemId}:${l.options.map((o) => o.choiceId).sort().join(',')}:${l.note ?? ''}`

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
      // Server clamps qty to 50; quoting 60 and ordering 50 would misprice.
      const next = state.lines
        .map((l) => (l.lineId === action.lineId ? { ...l, qty: Math.min(MAX_QTY, l.qty + action.delta) } : l))
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
      return {
        ...state,
        fulfilment: action.mode,
        // Only move the tip if the customer has not set one themselves.
        tipBps:
          state.tipBps === 0 && action.mode === 'delivery'
            ? 1500
            : action.mode === 'pickup' && state.tipBps === 1500
              ? 0
              : state.tipBps,
      }
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
  const tax = taxForVendorSubtotals(byVendor)
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
  /*
    Hydrating in the initializer rather than an effect. As an effect it raced
    the persist effect below: both ran in the same commit, so persist wrote the
    still-empty initial state over the saved cart before the hydrate dispatch
    was processed. Under StrictMode's double-invoke that wiped the cart on every
    single reload. An initializer is pure and runs before the first paint.
  */
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

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
