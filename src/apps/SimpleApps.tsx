import { AppChrome } from './AppChrome'
import { VENDORS } from '../data/brands'
import type { ShellApi } from '../ios/Device'

/**
 * Placeholder surfaces so every icon on the home screen leads somewhere real.
 * Each states plainly what it will do rather than faking data.
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
          One balance across every kitchen. Earn on any order, spend on any other — the part a
          single-restaurant app cannot do.
        </p>
        <ul className="plain-list">
          <li>1 point per dollar, platform-funded</li>
          <li>Kitchens opt in to bonus multipliers</li>
          <li>Redemption is settled against the platform, not the vendor</li>
        </ul>
        <p className="plain-note">Not built yet. Needs the accounts system first.</p>
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
          <li>
            <strong>Can I order from more than one kitchen?</strong>
            Yes — that is the point. One cart, one payment, one pickup.
          </li>
          <li>
            <strong>Will everything be ready at once?</strong>
            Kitchens cook in parallel. The quoted time is the slowest one.
          </li>
          <li>
            <strong>Who do I contact about a wrong item?</strong>
            The platform. Refunds are issued centrally and clawed back from the kitchen.
          </li>
        </ul>
        <p className="plain-note">Support routing is not wired up yet.</p>
      </div>
    </AppChrome>
  )
}

export function AccountApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="Account" onBack={api.closeApp} tint="#3F4A5A">
      <div className="plain">
        <h3>Signed out</h3>
        <p>Orders on this device are kept locally until an account exists.</p>
        <button className="btn-secondary">Sign in with phone</button>

        <h3>Vendors on the platform</h3>
        <ul className="vendor-list">
          {VENDORS.map((v) => (
            <li key={v.id}>
              <span>{v.name}</span>
              <em className={v.payoutsEnabled ? 'is-ok' : 'is-pending'}>
                {v.payoutsEnabled ? 'payouts active' : 'onboarding incomplete'}
              </em>
            </li>
          ))}
        </ul>
        <p className="plain-note">
          Vendor self-onboarding (Stripe Connect) is stubbed — accounts are created server-side but
          no vendor can complete KYC yet.
        </p>
      </div>
    </AppChrome>
  )
}
