import { AppChrome } from './AppChrome'
import { WaterIcon } from '../ios/WaterIcon'
import type { WaterGlyph } from '../ios/WaterIcon'
import type { ShellApi } from '../ios/Device'

/**
 * The water business that owns this home screen. These four sit in the dock,
 * so they are the only icons visible on every page — treat them as the
 * operator's own storefront rather than as another vendor.
 *
 * Copy is placeholder. Real product names, prices and the actual QR payload
 * come from the customer.
 */

const COPY: Record<WaterGlyph, { title: string; tint: string; body: () => JSX.Element }> = {
  kangen: {
    title: 'FREE Kangen',
    tint: '#0C7FC4',
    body: () => (
      <>
        <p className="water-lead">
          Ionised alkaline water, produced on a Kangen machine and delivered with the food order.
        </p>
        <ul className="plain-list">
          <li>
            <strong>Free 1-gallon trial</strong>
            Added to any food order at checkout. One per customer.
          </li>
          <li>
            <strong>5-gallon refill</strong>
            Swap an empty at pickup. Bring the bottle back for the credit.
          </li>
          <li>
            <strong>Machine demo</strong>
            Book a walkthrough at the commissary.
          </li>
        </ul>
        <button className="btn-primary water-cta">Claim the free gallon</button>
        <p className="plain-note">
          Not wired to the cart yet — needs the water SKUs added as a vendor.
        </p>
      </>
    ),
  },
  beasty: {
    title: 'Beasty H2O Co',
    tint: '#22B8E6',
    body: () => (
      <>
        <p className="water-lead">
          The parent business. Water delivery, machine sales, and the host of this ordering app.
        </p>
        <ul className="plain-list">
          <li>
            <strong>Delivery area</strong>
            Same radius as food delivery — 4 miles from the commissary.
          </li>
          <li>
            <strong>Subscriptions</strong>
            Weekly or fortnightly drop-off, billed monthly.
          </li>
          <li>
            <strong>Wholesale</strong>
            Kitchens on this platform buy at cost.
          </li>
        </ul>
        <p className="plain-note">Placeholder copy. Real details to come from the owner.</p>
      </>
    ),
  },
  scan: {
    title: 'Share & Scan',
    tint: '#111111',
    body: () => (
      <>
        <p className="water-lead">
          Point a camera at this to open the app. This is how the home screen spreads without an
          App Store listing.
        </p>
        <div className="qr-frame">
          <WaterIcon glyph="scan" size={190} />
        </div>
        <p className="qr-caption">getfreekangenwater.com</p>
        <button className="btn-secondary water-cta">Share link</button>
        <p className="plain-note">
          The QR is decorative until the live domain is set — it encodes nothing yet.
        </p>
      </>
    ),
  },
  info: {
    title: 'Info',
    tint: '#0B0B0D',
    body: () => (
      <>
        <p className="water-lead">
          What this app is: one home screen for every kitchen running out of the commissary, plus
          the water business that operates it.
        </p>
        <ul className="plain-list">
          <li>
            <strong>Add to Home Screen</strong>
            Share icon, then “Add to Home Screen”. It then opens without a browser bar.
          </li>
          <li>
            <strong>One cart, many kitchens</strong>
            Order from several brands and pay once.
          </li>
          <li>
            <strong>Contact</strong>
            Phone and hours go here.
          </li>
        </ul>
        <p className="plain-note">Placeholder copy.</p>
      </>
    ),
  },
}

export function WaterApp({ glyph, api }: { glyph: WaterGlyph; api: ShellApi }) {
  const c = COPY[glyph]
  return (
    <AppChrome title={c.title} onBack={api.closeApp} tint={c.tint}>
      <div className="plain water-app">
        <div className="water-hero">
          <WaterIcon glyph={glyph} size={76} />
        </div>
        {c.body()}
      </div>
    </AppChrome>
  )
}
