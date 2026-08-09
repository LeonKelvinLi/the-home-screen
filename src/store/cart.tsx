import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { BRANDS, brandById } from '../data/brands'
import { feeBaseFor, taxForVendorSubtotals } from '../lib/tax'
import { SETTINGS_KEY } from './settings'

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
  /** True once the customer has chosen a tip themselves, including None. */
  tipTouched: boolean
  fulfilment: 'pickup' | 'delivery'
  /**
   * The idempotency key for THIS cart's submission, persisted with it.
   *
   * It used to be a `useRef` inside CheckoutApp, which mints a new one every
   * mount — and checkout is mounted conditionally, so backing out or swiping
   * home destroyed it. That is exactly the moment it is needed: a request that
   * times out at 15s may still have reached the server, the client never
   * learned the order id, and the customer retries with a full cart. A fresh
   * key made that a second order, a second set of kitchen tickets, and (once
   * cards are wired) a second charge. Cleared with the cart, because a new cart
   * genuinely is a new order.
   */
  submitKey: string
}

/** Fresh key for a fresh cart. Same shape as the server's 8-80 char rule. */
const newSubmitKey = () =>
  `ik_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`

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
const initialState: State = {
  lines: [],
  tipBps: 0,
  tipTouched: false,
  fulfilment: 'pickup',
  submitKey: newSubmitKey(),
}

/**
 * Restore the saved cart, dropping anything that is no longer orderable.
 *
 * A persisted cart outlives the catalogue: an item removed from the menu would
 * otherwise sit in the cart forever and make every checkout fail server-side.
 * Also defends against a corrupted `lines` value, which used to crash the whole
 * app on every load with no way out but clearing site data.
 */
/**
 * Seed a fresh cart from Settings.
 *
 * "Default Tip" and default fulfilment were read only by the screen that drew
 * them, so the footer's promise that they are "applied when you open the cart"
 * was false and the cart always started at pickup with no tip. Read the same
 * localStorage key the settings store writes, rather than threading a provider
 * — the cart's reducer is initialised before any provider tree is available.
 */
function settingsSeed(): { tipBps: number; fulfilment: 'pickup' | 'delivery' } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { tipBps: 0, fulfilment: 'pickup' }
    const p = JSON.parse(raw) as { defaultTipBps?: unknown; defaultFulfilment?: unknown }
    return {
      tipBps:
        typeof p.defaultTipBps === 'number' && p.defaultTipBps >= 0 && p.defaultTipBps <= 5000
          ? Math.floor(p.defaultTipBps)
          : 0,
      fulfilment: p.defaultFulfilment === 'delivery' ? 'delivery' : 'pickup',
    }
  } catch {
    return { tipBps: 0, fulfilment: 'pickup' }
  }
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // No saved cart: this is a fresh one, so the customer's defaults apply.
    if (!raw) {
      const seed = settingsSeed()
      return { ...initialState, tipBps: seed.tipBps, fulfilment: seed.fulfilment }
    }
    const parsed = JSON.parse(raw) as Partial<State>

    /*
      Revalidate against the CURRENT catalogue, not just the brand.

      Checking `brandById` alone left two ways to poison a saved cart. An item
      withdrawn from a menu (narrowing a brand's stocked `offer` is a one-line
      change and happens often) kept its line, and the server rejects the whole
      order with "Unknown item: ..." — every checkout attempt fails, and nothing
      in the cart UI removes the bad line, so the only escape is wiping the cart
      from Settings. And a corrected price kept the OLD one, so the customer was
      quoted a total the server would not honour.

      So: drop lines whose item no longer exists, and reprice the rest from the
      catalogue. Repricing rather than dropping is deliberate — the customer
      still wants the food, and they see the real number before paying.
    */
    const priced = new Map<string, { name: string; price: number }>()
    for (const b of BRANDS) {
      for (const cat of b.menu) {
        for (const it of cat.items) priced.set(it.id, { name: it.name, price: it.price })
      }
    }

    const lines = Array.isArray(parsed.lines)
      ? parsed.lines
          .filter(
            (l): l is CartLine =>
              !!l &&
              typeof l.lineId === 'string' &&
              typeof l.itemId === 'string' &&
              typeof l.qty === 'number' &&
              l.qty > 0 &&
              Array.isArray(l.options) &&
              !!brandById(l.brandId) &&
              priced.has(l.itemId),
          )
          .map((l) => {
            const now = priced.get(l.itemId)!
            return now.price === l.unitPrice ? l : { ...l, name: now.name, unitPrice: now.price }
          })
      : []

    return {
      lines,
      tipBps: typeof parsed.tipBps === 'number' ? parsed.tipBps : initialState.tipBps,
      tipTouched: parsed.tipTouched === true,
      fulfilment: parsed.fulfilment === 'delivery' ? 'delivery' : 'pickup',
      // Keep the saved key so a retry after a timeout is still a retry. A cart
      // that lost its key gets a new one rather than an empty string.
      submitKey: typeof parsed.submitKey === 'string' && parsed.submitKey.length >= 8
        ? parsed.submitKey
        : newSubmitKey(),
    }
  } catch {
    const seed = settingsSeed()
    return { ...initialState, tipBps: seed.tipBps, fulfilment: seed.fulfilment }
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

/*
  Actions that change WHAT IS BEING ORDERED, and therefore make it a different
  order as far as the server's idempotency digest is concerned.

  The digest is over {lines, fulfilment, tipBps, address, name, phone}. The key
  only rotated on `clear`, so this sequence wedged checkout permanently: submit
  times out (the order may well have committed server-side) -> customer goes
  back, bumps a quantity or switches the tip from none to 18% -> retry -> 409
  "already used for a different order", and every attempt after it 409s too. The
  only escape was emptying the cart, which the error text does not suggest and
  which costs them the cart.

  Rotating the key on exactly these actions keeps idempotency doing its job — a
  true retry, with nothing touched, still sends the same key and is still
  deduped — while a genuinely edited order gets a key of its own.
*/
const REORDERS: Action['type'][] = ['add', 'qty', 'remove', 'clearBrand', 'tip', 'fulfilment']

function reducer(state: State, action: Action): State {
  if (REORDERS.includes(action.type)) {
    const next = baseReducer(state, action)
    return next === state ? state : { ...next, submitKey: newSubmitKey() }
  }
  return baseReducer(state, action)
}

function baseReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const sig = signature(action.line)
      const existing = state.lines.find((l) => signature(l) === sig)
      if (existing) {
        // Clamp on add too, not just on the stepper. Three taps of "Add · 20"
        // built a line of 60 and quoted $345.75; the server clamped to 50 and
        // charged $288.13, and the gap only showed up at the counter.
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.lineId === existing.lineId
              ? { ...l, qty: Math.min(MAX_QTY, l.qty + action.line.qty) }
              : l,
          ),
        }
      }
      const lineId = `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
      return {
        ...state,
        lines: [...state.lines, { ...action.line, qty: Math.min(MAX_QTY, action.line.qty), lineId }],
      }
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
      // New cart, new key — otherwise the next order would be deduplicated
      // against the one just placed and silently return the old receipt.
      return { ...state, lines: [], submitKey: newSubmitKey() }
    case 'tip':
      return { ...state, tipBps: action.bps, tipTouched: true }
    case 'fulfilment':
      return {
        ...state,
        fulfilment: action.mode,
        // Only move the tip if the customer has not chosen one themselves.
        // Testing `tipBps === 0` could not tell "never set" from "tapped None"
        // — which is a real button — so declining a tip and then switching to
        // delivery silently added 15% back. The mirror case removed a tip the
        // customer had chosen. Track the choice explicitly instead.
        tipBps: state.tipTouched
          ? state.tipBps
          : action.mode === 'delivery'
            ? 1500
            : 0,
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
  // Charged on food, not on a tax-inclusive vendor's embedded sales tax. See
  // feeBaseFor. Identical to `subtotal` unless such a vendor is in the cart.
  const feeBase = feeBaseFor(byVendor)
  const serviceFee = subtotal === 0 ? 0 : Math.round((feeBase * SERVICE_BPS) / 10000)
  const deliveryFee = subtotal === 0 || state.fulfilment === 'pickup' ? 0 : DELIVERY_FEE
  const tip = Math.round((feeBase * state.tipBps) / 10000)

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
