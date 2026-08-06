import { VENDORS } from '../data/brands'

/**
 * Sales tax for a cart, charged at each SELLER's rate.
 *
 * California taxes prepared food at the seller's location, so a cart spanning
 * Berkeley and Vallejo is genuinely taxed at two rates and the order-level
 * figure is a sum, not a percentage of the whole. Both the client display and
 * the server charge call this, because a customer shown one number and billed
 * another is the worst version of this bug.
 */
export const FALLBACK_TAX_BPS = 725

export function taxForVendorSubtotals(byVendor: { vendorId: string; subtotal: number }[]): number {
  return byVendor.reduce((sum, g) => sum + addedTaxFor(g.vendorId, g.subtotal), 0)
}

/**
 * Tax to ADD to a vendor's line total at checkout.
 *
 * Zero for a vendor whose posted prices already contain it. top dog's board
 * states its prices include tax, so adding Berkeley's 10.25% on top would
 * overcharge every customer on every sausage.
 */
export function addedTaxFor(vendorId: string, subtotal: number): number {
  const v = VENDORS.find((x) => x.id === vendorId)
  if (v?.taxIncluded) return 0
  return Math.round((subtotal * (v?.taxBps ?? FALLBACK_TAX_BPS)) / 10000)
}

/**
 * Tax already sitting INSIDE a tax-inclusive vendor's price.
 *
 * Nothing is charged for this — it is recorded on the ticket because the
 * vendor still owes it, it just travelled in the price the customer saw.
 * subtotal - subtotal/(1+rate), which is not the same as subtotal x rate.
 */
export function embeddedTaxFor(vendorId: string, subtotal: number): number {
  const v = VENDORS.find((x) => x.id === vendorId)
  if (!v?.taxIncluded) return 0
  const rate = (v.taxBps ?? FALLBACK_TAX_BPS) / 10000
  return subtotal - Math.round(subtotal / (1 + rate))
}

/**
 * The base the service fee and the tip are charged on.
 *
 * FOOD, not food-plus-embedded-tax. For every ordinary vendor the subtotal is
 * already pre-tax and this changes nothing. For a tax-inclusive vendor the
 * sales tax is travelling inside the posted price, so charging 5% service and a
 * percentage tip on the raw subtotal billed the customer a service fee and a
 * tip on money that is simply passed to CDTFA. Small — 4c and 13c on a $23
 * order — but it is charged on every order that vendor is in, and the platform
 * fee already excludes the same amount for the same reason.
 */
export function feeBaseFor(byVendor: { vendorId: string; subtotal: number }[]): number {
  return byVendor.reduce((sum, g) => sum + g.subtotal - embeddedTaxFor(g.vendorId, g.subtotal), 0)
}
