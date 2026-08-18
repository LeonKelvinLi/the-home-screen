import { AppChrome } from './AppChrome'
import type { ShellApi } from '../ios/Device'

/**
 * Small platform surfaces.
 *
 * Copy here is customer-facing, so it says what the screen does and nothing
 * else. An earlier version leaked build notes into production — including a
 * list of vendors marked "onboarding incomplete", which told customers the
 * kitchens might not get paid. Anything unfinished belongs in the README.
 */

export function RewardsApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="Rewards" onBack={api.closeApp} tint="#F06A00">
      <div className="plain">
        <div className="reward-card">
          <span className="reward-points">0</span>
          <span className="reward-label">points</span>
        </div>
        {/*
          THIS PROGRAMME DOES NOT EXIST YET.

          The screen used to state an earn rate ("one point per dollar"), a
          redemption rule ("points come off the total at checkout") and a
          balance. There is no points field in the data model, no accrual
          anywhere in the cart, and no redemption line in the checkout totals —
          so all three were descriptions of software nobody has written, sitting
          over a permanent zero. Describe the intent, and say it is the intent.
        */}
        <p>
          The idea is one balance across every kitchen on this home screen — earn on any order,
          spend on any other. That is the part a single-restaurant app cannot do.
        </p>
        <p className="plain-note">
          It is not built yet. Nothing is earning, this balance will stay at zero, and no rate or
          redemption has been set. Ordering is unaffected.
        </p>
      </div>
    </AppChrome>
  )
}

export function HelpApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="Help" onBack={api.closeApp} tint="#2C2C2E">
      <div className="plain">
        <h3>Common questions</h3>
        <ul className="plain-list">
          {/*
            These four answers described an app that does not exist: "one
            pickup" (they are separate businesses in seven cities), a "counter
            for each kitchen" (no counter is in the schema or the UI), and
            "Contact in the dock" (ContactApp is written but never routed; the
            dock is Phone, Water, Orders, Share). Answer for the app as built.
          */}
          <li>
            <strong>Can I order from more than one kitchen?</strong>
            Yes — that is the point. One cart, one checkout, however many kitchens.
          </li>
          <li>
            <strong>Will everything be ready at once?</strong>
            Kitchens cook in parallel, so the quoted time is the slowest one.
          </li>
          <li>
            <strong>Where do I collect?</strong>
            From each kitchen directly — these are separate businesses in different cities, not
            one building. Your order screen lists an address and a number wherever the business
            publishes them; not all of them do yet.
          </li>
          <li>
            <strong>Something is wrong with my order</strong>
            Where the kitchen publishes a number it is shown against your order — call them
            directly. Nothing is charged in the app yet, so there is nothing to refund.
          </li>
        </ul>
      </div>
    </AppChrome>
  )
}

export function AccountApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="Account" onBack={api.closeApp} tint="#3F4A5A">
      <div className="plain">
        <h3>Signed out</h3>
        <p>
          Orders placed on this device are saved here. Sign in to keep them across phones and to
          start earning rewards.
        </p>
        {/* Disabled, not silent. It had no handler at all, so Settings' first
            row led to a button that did nothing when pressed. */}
        <button className="btn-secondary" disabled>
          Sign in with phone — not connected yet
        </button>

        <h3>Add to Home Screen</h3>
        <ul className="plain-list">
          <li>
            <strong>iPhone</strong>
            Share, then “Add to Home Screen”. It then opens without a browser bar.
          </li>
          <li>
            <strong>Android</strong>
            Menu, then “Install app”.
          </li>
        </ul>
      </div>
    </AppChrome>
  )
}

/**
 * The dock's Phone slot. The operator's existing hub dials
 * `tel:+10000000000` — a placeholder that was never replaced — so this screen
 * exists rather than shipping a dial button that reaches nobody.
 */
export function ContactApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="Contact" onBack={api.closeApp} tint="#1FAF54">
      <div className="plain">
        <h3>Get in touch</h3>
        <p>
          For anything about a live order — a missing item, a wrong item, a refund — contact the
          platform rather than the individual kitchen.
        </p>
        <ul className="plain-list">
          <li>
            <strong>Phone</strong>
            Not published yet.
          </li>
          <li>
            <strong>Hours</strong>
            Not published yet.
          </li>
          <li>
            <strong>Pickup</strong>
            Your order screen lists each kitchen, with an address where they publish one.
          </li>
        </ul>
        <p className="plain-note">
          The owner needs to supply a phone number before this goes live.
        </p>
      </div>
    </AppChrome>
  )
}

/**
 * BEASTY Supply Co — his Shopify store, in the dock's BEASTY set.
 *
 * THE STORE URL HAS NOT BEEN SENT. He named the tile "BEASTYSupplyCo (Shopify)"
 * and nothing else, and there is no Shopify address anywhere in this repo. So
 * this says so rather than guessing one: a plausible-looking myshopify link
 * that 404s is worse than an honest empty screen, because a customer who taps a
 * dead store blames the store.
 *
 * Same treatment PhoneApp gives the unpublished phone number. Send the link and
 * this screen becomes a redirect with no other change.
 */
export function SupplyApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="BEASTY Supply Co" onBack={api.closeApp} tint="#111111">
      <div className="plain">
        <p>
          BEASTY Supply Co is the operator&rsquo;s own shop &mdash; merch and supplies, run on
          Shopify, separate from the kitchens and services on the home screen.
        </p>
        <p className="plain-note">
          The store link has not been published yet, so there is nothing to open from here. Every
          other tile in this dock set works.
        </p>
      </div>
    </AppChrome>
  )
}
