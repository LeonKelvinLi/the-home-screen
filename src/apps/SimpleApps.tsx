import { useEffect, useState } from 'react'
import { AppChrome } from './AppChrome'
import { InstallGuide } from '../ios/InstallGuide'
import { canInstall } from '../lib/install'
import { useGate } from '../lib/gate'
import { signOut as apiSignOut, fetchTickets, type RaffleTicket } from '../lib/account'
import type { ShellApi } from '../ios/Device'

/**
 * Small platform surfaces.
 *
 * Copy here is customer-facing, so it says what the screen does and nothing
 * else. An earlier version leaked build notes into production — including a
 * list of vendors marked "onboarding incomplete", which told customers the
 * kitchens might not get paid. Anything unfinished belongs in the README.
 */

const TICKET_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function RewardsApp({ api }: { api: ShellApi }) {
  /*
    THE BIG NUMBER WAS A HARDCODED ZERO under a paragraph explaining that the
    points programme does not exist. Two things were wrong with that: a member
    who has actually earned raffle tickets was shown nothing, and the one
    number on the screen described software nobody has written.

    So the card now counts what the server really keeps — raffle tickets, one
    per three referrals, uncapped, which is the reward that exists — and the
    note below still says plainly that points are not built.
  */
  const { account } = useGate()
  const tickets = account?.raffleTickets.total ?? 0
  const unused = account?.raffleTickets.unused ?? 0
  const referrals = account?.referrals ?? 0
  /*
    THE TICKETS THEMSELVES, not just how many. Glenn, 2026-09-06: "make sure
    they have their own digital raffle for every user." Each one is a row on
    the server with its own serial, so a member can point at ticket 000123
    and it is theirs and nobody else's. Fetched when the screen opens and
    again when the count on the account moves.
  */
  const [stubs, setStubs] = useState<RaffleTicket[] | null>(null)
  useEffect(() => {
    if (!account) {
      setStubs(null)
      return
    }
    let on = true
    void fetchTickets().then((t) => {
      if (on) setStubs(t)
    })
    return () => {
      on = false
    }
  }, [account?.id, tickets])
  return (
    <AppChrome title="Rewards" onBack={api.closeApp} tint="#F06A00">
      <div className="plain">
        <div className="reward-card">
          <span className="reward-points">{tickets}</span>
          <span className="reward-label">{tickets === 1 ? 'raffle ticket' : 'raffle tickets'}</span>
        </div>
        {account && stubs && stubs.length > 0 && (
          <section className="tickets" aria-label="Your raffle tickets">
            <h2 className="tickets-h">Your tickets</h2>
            <ul className="ticket-list">
              {stubs.map((t) => (
                <li key={t.id} className={`ticket-stub${t.usedAt ? ' is-used' : ''}`}>
                  <span className="ticket-no">No. {String(t.serial).padStart(6, '0')}</span>
                  <span className="ticket-state">
                    {t.usedAt ? `Entered${t.usedFor ? ` in ${t.usedFor}` : ''}` : 'Unused'}
                  </span>
                  <span className="ticket-meta">
                    Earned when sign-up {t.earnedAtReferral} joined on your code ·{' '}
                    {TICKET_DATE.format(new Date(t.earnedAt))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {account ? (
          referrals > 0 && (
            <p>
              {`${referrals} ${referrals === 1 ? 'person has' : 'people have'} joined on your code, which is ${tickets} ${tickets === 1 ? 'ticket' : 'tickets'}${unused ? `, ${unused} still unused` : ''}.`}
            </p>
          )
        ) : (
          <p>Sign in to see your tickets.</p>
        )}
      </div>
    </AppChrome>
  )
}

export function HelpApp({ api }: { api: ShellApi }) {
  const [guide, setGuide] = useState(false)
  const offer = canInstall()

  return (
    <AppChrome title="Help" onBack={api.closeApp} tint="#2C2C2E">
      <div className="plain">
        {/*
          THE PERMANENT DOOR TO INSTALLING.

          The bubble on the home screen is a nudge and it is the right shape for
          one — quiet, once, gone if ignored. What it should never have been is
          the ONLY route. The operator asked "when does the add to homescreen
          thing pop up? I've seen it once but when does it pop up?", which is
          the question of somebody who wants to show it to a business owner on
          demand and cannot make it come back.

          So it lives here too, permanently, where a person goes when they want
          to know how something works. First on the page because installing is
          the most valuable thing anyone can do in this app: installed, the page
          gets the whole screen and all 24 tiles fit, which is what makes "the
          first 48 spots are the first two pages" literally true.

          It disappears entirely once the app IS installed, so it can never nag
          somebody who has already done it, and it is hidden where the guide
          would be wrong — it draws Safari's own toolbar, and that flow does not
          exist on Android, on desktop, or in an in-app browser.
        */}
        {offer && (
          <button className="install-row" onClick={() => setGuide(true)}>
            <span className="install-row-text">
              <strong>Add BEASTY to your home screen</strong>
            </span>
            <span className="install-row-go" aria-hidden="true">
              ›
            </span>
          </button>
        )}
        {guide && <InstallGuide onClose={() => setGuide(false)} />}

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

/** Shown signed in or out — the instructions do not depend on who they are. */
function AddToHomeScreen() {
  return (
    <>
      <h3>Add to Home Screen</h3>
      <ul className="plain-list">
        <li>
          <strong>iPhone</strong>
          Share, then “Add to Home Screen”.
        </li>
        <li>
          <strong>Android</strong>
          Menu, then “Install app”.
        </li>
      </ul>
    </>
  )
}

function useAccountActions() {
  const { account, setAccount } = useGate()
  return {
    account,
    signOut: async () => {
      await apiSignOut()
      setAccount(null)
    },
  }
}

/**
 * The account screen — and the one place somebody looks when they want to sign
 * in, which is why the dead button that used to live here mattered.
 *
 * It said "sign in with phone — not connected yet" and was disabled, which was
 * honest right up until sign-in existed. Then it became the app telling a
 * member there is no way in, on the very screen built to let them in. A code
 * emailed to their address is now the way, and it works on a phone they have
 * never opened this on.
 */
export function AccountApp({ api }: { api: ShellApi }) {
  const { account, signOut } = useAccountActions()

  if (account) {
    return (
      <AppChrome title="Account" onBack={api.closeApp} tint="#3F4A5A">
        <div className="plain">
          <h3>Signed in</h3>
          <p>
            {/* Whichever they are known by. This showed account.email, which is
                null for anybody who signed up by SMS — the row read
                "Rae Solis — " with nothing after the dash. */}
            {account.name} — {account.phone ?? account.email}
          </p>
          <p>
            Your referral code is <strong>{account.referralCode}</strong>.
          </p>
          <button className="btn-secondary" onClick={signOut}>
            Sign out on this device
          </button>
          <AddToHomeScreen />
        </div>
      </AppChrome>
    )
  }

  return (
    <AppChrome title="Account" onBack={api.closeApp} tint="#3F4A5A">
      <div className="plain">
        <h3>Signed out</h3>
        <button className="btn-primary" onClick={() => api.openApp('sys.join')}>
          Sign in or sign up
        </button>

        <AddToHomeScreen />
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
        <ul className="plain-list">
          <li>
            <strong>Phone</strong>
            Not published yet.
          </li>
          <li>
            <strong>Hours</strong>
            Not published yet.
          </li>
        </ul>
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
        <p className="plain-note">The store link has not been published yet.</p>
      </div>
    </AppChrome>
  )
}
