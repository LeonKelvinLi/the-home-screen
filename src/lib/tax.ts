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
  return byVendor.reduce((sum, g) => {
    const bps = VENDORS.find((v) => v.id === g.vendorId)?.taxBps ?? FALLBACK_TAX_BPS
    return sum + Math.round((g.subtotal * bps) / 10000)
  }, 0)
}
