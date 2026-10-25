import { useState } from 'react'
import type { MouseEvent } from 'react'
import { AppChrome } from './AppChrome'
import { ShareMark } from './dialer/glyphs'
import { SHARE_MEMBERS, shareOrCopy, shareUrl } from '../lib/share'
import { useGate } from '../lib/gate'
import { chooseTier } from '../lib/account'
import {
  MEMBERSHIP,
  TIERS,
  fullyReferredPrice,
  PER_MILESTONE_REFERRALS,
  DISCOUNT_PER_MILESTONE,
} from '../data/membership'
import { LISTED_KITCHENS } from '../data/brands'
import { AFFILIATE_INTRO, AFFILIATE_TIERS, AFFILIATE_CLOSE, AFFILIATE_FEES } from '../data/affiliateTiers'
import type { Perk } from '../data/membership'
import type { ShellApi } from '../ios/Device'

/** A yearly switch exists only when a tier has a yearly price to show. */
const HAS_YEARLY = TIERS.some((t) => !!t.yearly)

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

/*
  The purple awareness ribbon he put in the middle of the BIGGIE name, drawn
  for the same reason the diamond is: an emoji is somebody else's typeface and
  renders differently on every device the operator shows this on.

  Purple on purpose and not decoration — it is Biggie's Purple Ribbon
  Foundation, the charity the membership's proceeds are said to go to. His
  words on the revision: "the purple will stand out and coincides with our
  foundation."
*/
export function Ribbon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="ribbon">
      {/* the two tails, crossing below the loop */}
      <path d="M10.1 13.4 6.2 21.2l3-.5 1.6 2.4 3.1-6.2Z" fill="#7B4BC4" />
      <path d="M13.9 13.4 17.8 21.2l-3-.5-1.6 2.4-3.1-6.2Z" fill="#8E5BD8" />
      {/* the loop itself */}
      <path
        d="M12 1.6c2.6 0 4.6 2 4.6 4.4 0 2.1-1.2 3.7-2.6 5.6l-2 2.7-2-2.7C8.6 9.7 7.4 8.1 7.4 6 7.4 3.6 9.4 1.6 12 1.6Zm0 2.2c-1.4 0-2.4 1-2.4 2.2 0 1.3.8 2.4 2.4 4.6 1.6-2.2 2.4-3.3 2.4-4.6 0-1.2-1-2.2-2.4-2.2Z"
        fill="#8E5BD8"
      />
    </svg>
  )
}

/** Businesses that have actually agreed a member offer. */
/*
  AGREED offers only. `mock` means the operator asked to see the design and the
  business agreed nothing, and this filter did not exclude them — so a mocked-up
  offer was counted on the one screen that asks someone for $20 a month. The
  comment below already said to count agreed ones; the code did not.
*/
const WITH_OFFERS = LISTED_KITCHENS.filter(
  (b) => !b.offers?.mock && (b.offers?.welcome || b.offers?.loyalty),
)
const OFFER_COUNT = WITH_OFFERS.length
const OFFER_PARTNER = WITH_OFFERS[0]?.name ?? ''

/**
 * A perk: its point, always readable, and his full sentence one tap away.
 *
 * The two plans only mean something side by side — the whole difference
 * between $39 and $59 is in these lists — and four long sentences under each
 * price pushed the second plan off the bottom of the phone. Now every point on
 * both cards is on screen at once and you open the one you want explained.
 *
 * Each row owns its own open state, so several can be open together: someone
 * comparing the two cards is reading across them, not down one.
 *
 * DECLARED HERE, AT MODULE SCOPE, AND NOT INSIDE MembersApp. A component
 * declared in a render body is a new function every render, so React remounts
 * it and its state resets. That is the About page glitch Glenn reported, and
 * tools/audit-nested-components.mjs now fails the build over it.
 */
/*
  A PERK'S LINK OPENS ITS PAGE EVERY TIME, not only the first. Glenn,
  2026-09-24: "I found a glitch when you press tap here. It only works the
  first time". TAP HERE goes to /money, whose MAKE $ panel opens on the landing
  screen. After that first visit, closing the panel and opening Members from
  the dialer leaves the address on /money with its history entry marked "in
  the app", so the second tap was a link to the address already showing: the
  browser reloaded it, the app saw "in the app" and went straight to the home
  screen, and MAKE $ never opened. Clearing that mark before the reload makes
  the second tap a first arrival, like the first. A link to any other address
  is left to the browser.
*/
const openLinkedPage = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
  if (new URL(href, window.location.href).pathname !== window.location.pathname) return
  e.preventDefault()
  try {
    window.history.replaceState(null, '', window.location.href)
  } catch {
    /* no history API: the reload below still opens the page */
  }
  window.location.reload()
}

function PerkRow({ perk }: { perk: Perk }) {
  const [open, setOpen] = useState(false)
  return (
    <li className={`members-perk${open ? ' is-open' : ''}${perk.link ? ' has-link' : ''}`}>
      <button
        type="button"
        className="members-perk-head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="members-perk-label">{perk.label}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="members-perk-chev">
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <p className="members-perk-body">
          {perk.detail}
          {perk.link && (
            <>
              {' '}
              <a className="members-perk-link" href={perk.link.href} onClick={(e) => openLinkedPage(e, perk.link!.href)}>
                {perk.link.label}
              </a>
            </>
          )}
        </p>
      )}
    </li>
  )
}

/**
 * One of the two dropdown heads: User on the left, Business on the right.
 *
 * Module scope for the same reason PerkRow is — a component declared inside
 * the render body remounts on every render and loses its state.
 */
function SideHead({
  label,
  sub,
  open,
  onClick,
}: {
  label: string
  sub: string
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`members-side${open ? ' is-open' : ''}`}
      aria-expanded={open}
      onClick={onClick}
    >
      <span className="members-side-text">
        {label}
        <span className="members-side-sub">{sub}</span>
      </span>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="members-side-chev">
        <path
          d="M7 10l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function MembersApp({ api }: { api: ShellApi }) {
  const [billing, setBilling] = useState<'month' | 'year'>('month')
  /*
    SHARE THIS PAGE. Glenn, 2026-09-17, over a screenshot of this screen and of
    MAKE $: "would you mind adding a share button to each one of these pages?"
    The link is beastypages.com/members, which opens this screen (App.tsx), and
    a DM shows it as BEASTY membership rather than as the front door.
  */
  const [said, setSaid] = useState<string | null>(null)
  const share = async () => {
    const how = await shareOrCopy(SHARE_MEMBERS)
    if (how === 'shared') return
    setSaid(how === 'copied' ? 'Link copied' : `Copy this link: ${shareUrl(SHARE_MEMBERS).replace(/^https?:\/\//, '')}`)
    window.setTimeout(() => setSaid(null), 3000)
  }
  const m = MEMBERSHIP
  /*
    THE TWO DROPDOWNS. Glenn, 2026-09-02, on a screenshot of this page with
    "User" and "Business" drawn across the top of it: "you can reconfigure
    this page. Have two separate drop-down's for each side. User & business.
    That way it consolidates membership choice on this page."

    User opens by default because most people arriving here are customers and
    the two passes are what the page has always led with; Business starts
    folded so the three affiliate tiers do not push the passes off the screen.

    ONE AT A TIME. They used to open independently, on the reasoning that
    somebody who owns a shop is also a customer — and with both open the page
    ran the two passes and the three affiliate tiers together into one column
    of black cards with no telling which prices belonged to which side. "Fix
    where both could be selected", 2026-09-10. Opening one folds the other,
    which is what "consolidates membership choice on this page" asked for.
    Tapping the open one still folds it, so neither header is a dead control.
  */
  const [side, setSide] = useState({ user: true, business: false })
  const toggle = (k: 'user' | 'business') =>
    setSide((v) => ({ user: k === 'user' && !v.user, business: k === 'business' && !v.business }))

  return (
    <AppChrome
      title={m.name}
      onBack={api.closeApp}
      className="is-beasty"
      right={
        <button type="button" className="chrome-pill is-share" onClick={share}>
          <ShareMark size={15} />
          Share
        </button>
      }
    >
      <div className="members">
        <div className="members-hero">
          <span className="members-gem">
            <Gem size={44} />
          </span>
          <p className="members-lead">{m.lead}</p>
          {said && (
            <p className="members-said" role="status">
              {said}
            </p>
          )}
        </div>

        <div className="members-sides" role="group" aria-label="Membership for">
          <SideHead
            label="User"
            sub="Passes for customers"
            open={side.user}
            onClick={() => toggle('user')}
          />
          <SideHead
            label="Business"
            sub="Affiliate tiers"
            open={side.business}
            onClick={() => toggle('business')}
          />
        </div>

        {side.user && (
        <>
        {/*
          TWO TIERS, HIS. Price, then what the card honours, then the referral
          reward — in that order because that is the order somebody decides in:
          what it costs, what it gets me, what it gets me back.

          The perks are per tier rather than one shared list, because the whole
          difference between $39 and $59 lives in them.
        */}
        {/*
          MONTHLY / YEARLY — only once a tier carries a yearly price. Leon asked
          for yearly on 2026-09-06; the number is Glenn's, so until membership.ts
          holds one this switch does not render and nothing yearly is shown.
        */}
        {HAS_YEARLY && (
          <div className="members-interval" role="group" aria-label="Billing">
            <button
              className={`members-interval-btn${billing === 'month' ? ' is-on' : ''}`}
              onClick={() => setBilling('month')}
              aria-pressed={billing === 'month'}
            >
              Monthly
            </button>
            <button
              className={`members-interval-btn${billing === 'year' ? ' is-on' : ''}`}
              onClick={() => setBilling('year')}
              aria-pressed={billing === 'year'}
            >
              Yearly
            </button>
          </div>
        )}
        <div className="members-plans">
          {TIERS.map((t) => (
            <div key={t.id} className={`members-plan${t.id === 'diamond' ? ' is-best' : ''}`}>
              {t.id === 'diamond' && (
                <span className="members-plan-tag">
                  <Gem size={13} /> Both offers
                </span>
              )}
              {/* His mark sits INSIDE the name, between the two words. */}
              <span className="members-plan-name">
                {t.nameLead} {t.mark === 'gem' ? <Gem size={20} /> : <Ribbon size={20} />}{' '}
                {t.nameTail}
              </span>
              <span className="members-plan-price">
                ${billing === 'year' && t.yearly ? t.yearly : t.monthly}
                <em>{billing === 'year' && t.yearly ? '/year' : '/month'}</em>
              </span>
              <span className="members-plan-note">
                Honours {t.honours} at any affiliate, with no limit each month.
              </span>
              {/*
                HIS REVISION OF 2026-08-27, near enough word for word:

                  "ONLY $9/next month when you refer 9 new member sign ups for
                   each month. - $10 credit for each 3 new members that sign up.
                   Kindly share to $AVE!"

                Bold on the headline because he asked for it — "Maybe in bold so
                they really read it". The $9 is DERIVED from the price and the
                cap, never typed, so the offer and the arithmetic cannot drift.
              */}
              <span className="members-plan-note">
                <strong>
                  {fullyReferredPrice(t) === 0
                    ? `FREE next month when you refer ${t.discountCapReferrals} `
                    : `ONLY $${fullyReferredPrice(t)} next month when you refer ${t.discountCapReferrals} `}
                  new member sign-ups.
                </strong>{' '}
                ${DISCOUNT_PER_MILESTONE} credit for each {PER_MILESTONE_REFERRALS} new members
                that sign up. Kindly share to $AVE!
              </span>
              <ul className="members-plan-perks">
                {t.perks.map((perk) => (
                  <PerkRow key={perk.label} perk={perk} />
                ))}
              </ul>
              <ChooseTier interval={billing} id={t.id} name={t.name} />
            </div>
          ))}
        </div>

        {/*
          SAID ONCE, PLAINLY, RATHER THAN PER TIER. Raffle tickets are the one
          reward with no ceiling and it is easy to miss that beside a capped
          discount, so it gets its own line in his own numbers.
        */}
        <p className="members-note">
          Raffle tickets have no limit: one for every {PER_MILESTONE_REFERRALS} sign-ups, so 30
          referrals is 10 tickets. Save them and enter any monthly raffle.
        </p>

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
        </>
        )}

        {side.business && <BusinessTiers api={api} />}

        <h2 className="members-h">Where the money goes</h2>
        <div className="members-charity">
          <p>{m.charity.claim}</p>
          {/*
            Shown as the operator's statement and flagged, not printed as though
            the app had checked it. See data/membership.ts.
          */}
          {m.charity.needsDetail && (
            <p className="members-charity-flag">
              Needs the foundation&rsquo;s registration before this goes in front of customers.
            </p>
          )}
        </div>

        <MembersFooterCta api={api} />
      </div>
    </AppChrome>
  )
}

/**
 * The bottom of the membership page.
 *
 * IT USED TO CONTRADICT THE BUTTONS ABOVE IT. This block carried a disabled
 * "Paid sign-ups not open yet" and a paragraph stating card payments were not
 * connected — both written before checkout existed, and neither aware that the
 * two Choose buttons further up the same screen now open a real Stripe
 * checkout. A page that offers to take $39 at the top and says it cannot at
 * the bottom is a page nobody trusts with a card.
 *
 * So the claim is no longer written down. `paymentsConfigured` comes from the
 * server on every member response and says whether a Payment Link exists, and
 * this reads it. Signed out it says neither thing, because it does not know.
 */
function MembersFooterCta({ api }: { api: ShellApi }) {
  const { account } = useGate()
  const live = account && account.paymentsConfigured
  return (
    <div className="members-cta">
      {/* Reachable whatever the payment state — it is a preview of the card,
          not a purchase. */}
      <button className="btn-primary" onClick={() => api.openApp('sys.membercard')}>
        See the member card
      </button>
      <p className="members-cta-note">
        {live
          ? 'Checkout is Stripe. Your card details are entered on Stripe\u2019s own page and never reach this app. A membership starts when Stripe confirms the payment, not when you tap.'
          : account
            ? 'Card payments are not connected yet, so nothing can be charged and no membership can start. Choosing a tier records it and the operator will be in touch.'
            : 'Sign up free first. Every term above is shown again, and confirmed, before any money moves.'}
      </p>
    </div>
  )
}

/**
 * The business side: the three affiliate tiers, in their words and at his
 * prices. See data/affiliateTiers.ts for whose words and which prices.
 *
 * The rows reuse PerkRow, so a tier reads the way a pass does: every point on
 * one line, his sentence one tap away. The cards are their own class rather
 * than `.members-plan` because that class is the two customer passes, which
 * tools/audit-membership-plans.mjs counts by name.
 *
 * NO CHOOSE BUTTON. Nothing in the app sells an affiliate spot yet; the free
 * tier starts from the reserve form and the paid ones are arranged with the
 * operator, and the note under the cards says exactly that rather than
 * offering a button that would take nothing.
 */
function BusinessTiers({ api }: { api: ShellApi }) {
  return (
    <div className="members-biz">
      {AFFILIATE_INTRO.map((line) => (
        <p key={line} className="members-biz-intro">
          {line}
        </p>
      ))}
      {AFFILIATE_TIERS.map((t) => (
        <div key={t.id} className={`members-biz-plan${t.id === 'beasty' ? ' is-best' : ''}`}>
          <span className="members-biz-tier">Tier {t.n}</span>
          <span className="members-biz-name">
            {t.nameLead}{' '}
            {t.mark === 'gem' ? <Gem size={18} /> : t.mark === 'ribbon' ? <Ribbon size={18} /> : null}{' '}
            {t.nameTail}
          </span>
          <span className="members-biz-price">
            {t.price}
            {t.priceNote && <em>{t.priceNote}</em>}
          </span>
          <span className="members-biz-lead">{t.lead}</span>
          <ul className="members-plan-perks">
            {t.perks.map((perk) => (
              <PerkRow key={perk.label} perk={perk} />
            ))}
          </ul>
          {t.note && <p className="members-biz-note">{t.note}</p>}
        </div>
      ))}
      <div className="members-biz-fees">
        <h3>{AFFILIATE_FEES.head}</h3>
        <ul>
          {AFFILIATE_FEES.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p>{AFFILIATE_FEES.note}</p>
      </div>
      <p className="members-biz-close">{AFFILIATE_CLOSE}</p>
      <div className="members-biz-cta">
        <button className="btn-primary" onClick={() => api.openApp('slot.join')}>
          Reserve a spot
        </button>
        <p className="members-biz-cta-note">
          Tier 1 begins with a reserved spot, which is free. Tier 2 and Tier 3 are arranged with
          the operator once your spot is confirmed. Nothing is charged through this app.
        </p>
      </div>
    </div>
  )
}

/**
 * Take a membership.
 *
 * WHAT THIS DOES NOT DO IS THE POINT. It records the choice and asks the server
 * for a payment link; it never says anybody has paid. `tier_status` comes back
 * 'pending' and stays there until a payment provider moves it, so a member who
 * taps this sees "chosen, not yet paid" rather than a perk they have not bought.
 *
 * WHEN NO LINK IS CONFIGURED it says so plainly instead of opening nothing.
 * Silence on a button that should have taken $39 reads as a broken app, and the
 * honest version — "not connected yet" — is also the version that does not
 * take money the operator cannot yet receive.
 */
function ChooseTier({
  id,
  name,
  interval,
}: {
  id: 'pass' | 'diamond'
  name: string
  interval: 'month' | 'year'
}) {
  const { account, setAccount } = useGate()
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  /* Set only when window.open was refused, so the link can be offered. */
  const [link, setLink] = useState<string | null>(null)

  if (!account) {
    return <p className="members-signedout">Sign up free first, then choose a membership.</p>
  }

  const mine = account.tier === id
  const pending = mine && account.tierStatus === 'pending'
  const active = mine && account.tierStatus === 'active'
  const lapsed = mine && account.tierStatus === 'lapsed'

  async function choose() {
    if (busy) return
    setBusy(true)
    const r = await chooseTier(id, interval)
    setBusy(false)
    if (!r) {
      setNote('Could not do that just now. Try again in a moment.')
      return
    }
    setAccount(r.account)
    if (r.paymentLink) {
      /*
        Their own tab, and the app keeps the session they just proved.

        `noopener` because the opened page must not get a handle on this one.
        The window may also be blocked — a popup blocker, or a browser that
        refuses window.open outside a direct gesture — and a blocked checkout
        used to be silent, indistinguishable from one that worked. So the
        return value is checked and the link is offered instead.
      */
      const w = window.open(r.paymentLink, '_blank', 'noopener')
      setLink(w ? null : r.paymentLink)
      setNote(
        w
          ? 'Checkout is open in another tab. Come back here when Stripe is done and this page will catch up on its own.'
          : null,
      )
      return
    }
    setNote(
      `${name} is on your account. Payments are not connected yet, so nothing has been charged — ` +
        'the operator will be in touch to arrange it.',
    )
  }

  const label = active
    ? `${name} active`
    : lapsed
      ? `Restart ${name}`
      : mine
        ? `${name} chosen`
        : `Choose ${name}`

  return (
    <>
      <button
        className="btn-primary members-choose"
        onClick={choose}
        disabled={busy || active}
        aria-live="polite"
      >
        {busy ? 'One moment…' : label}
      </button>
      {/*
        Each state says a different true thing. Before, every one of them read
        "chosen, not yet paid" — including a membership Stripe had confirmed,
        which told a paying member their payment had not landed.
      */}
      {active && !note && (
        <p className="members-pending is-active">Paid and active. Thank you.</p>
      )}
      {lapsed && !note && (
        <p className="members-pending">
          This lapsed — Stripe reported the subscription ended. Restarting opens checkout again.
        </p>
      )}
      {pending && !note && (
        <p className="members-pending">
          {account.paymentsConfigured
            ? 'Chosen, not yet paid. Nothing has been charged until you finish checkout.'
            : 'Chosen, not yet paid. Nothing has been charged.'}
        </p>
      )}
      {note && <p className="members-pending">{note}</p>}
      {/* The fallback when the tab was blocked. A real link, because that is
          the one thing a popup blocker cannot stop. */}
      {link && (
        <p className="members-pending">
          Your browser blocked the checkout tab.{' '}
          <a href={link} target="_blank" rel="noopener noreferrer">
            Open checkout
          </a>
          .
        </p>
      )}
    </>
  )
}
