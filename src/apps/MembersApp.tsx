import { AppChrome } from './AppChrome'
import { MEMBERSHIP } from '../data/membership'
import { LISTED_KITCHENS } from '../data/brands'
import type { ShellApi } from '../ios/Device'

/**
 * BEASTY members — the loyalty programme.
 *
 * On the brand yellow, because this is the operator's own product rather than
 * one of the businesses listed on the grid.
 */

/** The diamond the operator uses beside the name, drawn rather than an emoji. */
export function Gem({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="gem">
      <path d="M6.2 3h11.6l4.2 5.4-10 12.4L2 8.4Z" fill="#5AC8FA" />
      <path d="M6.2 3 2 8.4h20l-4.2-5.4Z" fill="#7FD9FF" />
      <path d="M12 20.8 2 8.4h20Z" fill="#39B3F0" />
      <path d="M6.2 3 9 8.4 12 20.8 15 8.4 17.8 3Z" fill="#9FE4FF" opacity=".55" />
    </svg>
  )
}

/** Businesses that have actually agreed a member offer. */
const WITH_OFFERS = LISTED_KITCHENS.filter((b) => b.offers?.welcome || b.offers?.loyalty)
const OFFER_COUNT = WITH_OFFERS.length
const OFFER_PARTNER = WITH_OFFERS[0]?.name ?? ''

export function MembersApp({ api }: { api: ShellApi }) {
  const m = MEMBERSHIP

  return (
    <AppChrome title="BEASTY members" onBack={api.closeApp} className="is-beasty">
      <div className="members">
        <div className="members-hero">
          <span className="members-gem">
            <Gem size={44} />
          </span>
          <p className="members-lead">{m.lead}</p>
        </div>

        {/*
          Two prices, side by side, with the saving stated as a number rather
          than a percentage — "$60 off" is the thing a member can check.
        */}
        <div className="members-plans">
          <div className="members-plan">
            <span className="members-plan-price">
              ${m.monthly}
              <em>/month</em>
            </span>
            <span className="members-plan-note">Autopay, cancel any time</span>
          </div>
          <div className="members-plan is-best">
            <span className="members-plan-tag">Save ${m.yearlySaving}</span>
            <span className="members-plan-price">
              ${m.yearly}
              <em>/year</em>
            </span>
            <span className="members-plan-note">
              {m.yearlyPercent}% off paying monthly
            </span>
          </div>
        </div>

        <h2 className="members-h">What you get</h2>
        <ul className="members-list">
          {m.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {/*
          Count the businesses that have AGREED an offer, not the ones listed.

          LISTED_KITCHENS.length is 10; exactly one partner has set `offers`,
          because an offer on a partner's page is a promise made in their name
          and none of the others have agreed one. "Good at 10 businesses" sold a
          membership against nine promises nobody had made.
        */}
        <p className="members-note">
          {OFFER_COUNT === 0
            ? 'No business has agreed an offer yet. This is what the programme will look like once they do.'
            : OFFER_COUNT === 1
              ? `Good at ${OFFER_PARTNER} today, with more partners being signed up.`
              : `Good at ${OFFER_COUNT} businesses today, and at every one that joins after.`}
        </p>

        <h2 className="members-h">Where the money goes</h2>
        <div className="members-charity">
          <p>{m.charity.claim}</p>
          {/*
            Shown as the operator's statement and flagged, not printed as though
            the app had checked it. See data/membership.ts.
          */}
          {m.charity.needsDetail && (
            <p className="members-charity-flag">
              Needs the operator&rsquo;s detail before this goes in front of customers — how much
              of each payment, and the foundation&rsquo;s registration.
            </p>
          )}
        </div>

        <div className="members-cta">
          <button className="btn-primary" disabled>
            Sign-ups not open yet
          </button>
          <p className="members-cta-note">
            Card payments are not connected, so nothing can be charged and no membership can start
            yet. Every term above would be shown again, and confirmed, before any money moved.
          </p>
        </div>
      </div>
    </AppChrome>
  )
}
