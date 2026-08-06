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
        <p>
          One balance across every kitchen on this home screen. Earn on any order, spend on any
          other — the part a single-restaurant app cannot do.
        </p>
        <ul className="plain-list">
          <li>
            <strong>Earning</strong>
            One point per dollar, on every kitchen here.
          </li>
          <li>
            <strong>Spending</strong>
            Points come off the total at checkout, not off one kitchen's bill.
          </li>
        </ul>
        <p className="plain-note">Rewards start once you have an account.</p>
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
            one building. Your order screen lists the address and number for each.
          </li>
          <li>
            <strong>Something is wrong with my order</strong>
            Call the kitchen on the number shown against it on your order screen. Nothing is
            charged in the app yet, so there is nothing for us to refund.
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
        <button className="btn-secondary">Sign in with phone</button>

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
            Each order screen shows the counter for that kitchen.
          </li>
        </ul>
        <p className="plain-note">
          The owner needs to supply a phone number before this goes live.
        </p>
      </div>
    </AppChrome>
  )
}
