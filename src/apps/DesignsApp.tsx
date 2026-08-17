import { AppChrome } from './AppChrome'
import { GLYPHS } from '../data/glyphs'
import type { ShellApi } from '../ios/Device'

/**
 * BEASTY Designs — the pitch to a business the operator is recruiting.
 *
 * Separate from Noctilucente, which is the full studio catalogue. This screen
 * has one job: a business owner standing in front of Glenn should understand,
 * in under a minute, what they get and what it costs.
 *
 * WORK SHOWN HERE IS REAL AND ITS PROVENANCE IS STATED. The brief asked for
 * "website examples you have done for previous clients", and there is exactly
 * one external client project besides this app. Dressing personal products up
 * as client work is the easiest lie to tell on a page like this and the easiest
 * one to be caught in — a business owner who clicks through to trycurio.app and
 * finds no client behind it has learned something worse than "he has one
 * client". So each item says whose it is.
 */

/*
  PRICES BACK UP, with the discount doing the work instead — his suggestion and
  a better one than mine: "keep them the way they were before so businesses
  understand the value of your skill set, then put 1/2 off when they sign up as
  a Affiliate. That way they feel like they're getting a deal."

  Halving the list price to win customers taught a business owner that the work
  is worth half. The same money changes hands either way; only what it says
  about the work is different.

  "Starting at" on every line, also his: it leaves room to negotiate for a job
  "as crazy as mine", and it is honest — every one of these is a floor rather
  than a fixed number.
*/
const TIERS = [
  {
    name: 'Starter site',
    price: 'from $650',
    detail:
      'One page, built for a phone first. Hours, map, your menu or services, and a button that dials you. Live in about two weeks.',
  },
  {
    name: 'Full site',
    price: 'from $1,500',
    detail:
      'Several pages on your own domain, your photos, contact forms, and set up properly so Google can find you.',
  },
  {
    name: 'Site and online ordering',
    price: 'from $2,500',
    detail:
      'Everything above, plus customers order and pay on your site. If you are a restaurant not set up for pickup or delivery orders yet, that is what this does.',
  },
  {
    name: 'Your own app',
    price: 'from $5,000',
    detail: 'iOS and Android. Your icon on a customer’s home screen, not a website in a wrapper.',
  },
  {
    name: 'Branding and logo',
    price: 'from $400',
    detail:
      'A mark, colours and type that hold together everywhere they are used — on a sign, on a shirt, and on a tile the size of your thumbnail.',
  },
]

/*
  Add-ons rather than tiers, on his read: "maybe put SEO as add-ons or
  something like that." They are bought alongside a site rather than instead of
  one, and a business owner reading a price list wants the four shapes of job
  first.

  Each says what it is FOR in plain words. His note on why: some people do not
  know what these letters mean and "think I might be scamming them".
*/
const ADDONS = [
  {
    name: 'SEO',
    price: 'from $150',
    detail: 'So people searching for what you do actually find you.',
  },
  {
    name: 'GEO',
    price: 'from $75',
    detail: 'So the AI assistants people now ask for recommendations know you exist.',
  },
  {
    name: 'CRM setup',
    price: 'from $250',
    detail: 'Enquiries, bookings and customers in one place instead of across three phones.',
  },
]

const WORK = [
  {
    name: 'The Home Screen',
    whose: 'Built for BEASTY — this app',
    detail:
      /*
      Was "one checkout pays them all. Live, with real orders." Nothing pays
      anyone: PAYMENTS_WIRED is false, every order is written payment_state
      'mock', all 32 vendors are minted with payoutsEnabled false, and no
      kitchen display exists. This is the screen a business owner is recruited
      on, and it was the only place in the app claiming otherwise — the same
      file says "nothing is charged through this app" twice.
    */
    'The thing you are holding. Every local business gets an icon, one cart spans all of them, one checkout. Orders are recorded; card payments are not connected yet.',
    href: null,
  },
  {
    name: 'Curio',
    whose: 'His own product',
    detail:
      'A reading app on the App Store and Google Play, built and shipped solo — iOS, Android and web from one codebase, with payments and an AI content engine behind it.',
    href: 'https://trycurio.app',
  },
  {
    name: 'FirstCPR.com',
    whose: 'Built at GOSVEA, where he works as a software engineer',
    detail:
      'A live site for a CPR training company, plus their iOS app and an internal AI assistant answering staff questions.',
    href: 'https://firstcpr.com',
  },
]

export function DesignsApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="BEASTY Designs" onBack={api.closeApp}>
      <div className="designs">
        <div className="designs-hero">
          <span className="designs-mark">
            <svg viewBox="0 0 100 100" width="52" height="52" aria-hidden="true">
              <path d={GLYPHS.design} fill="#141414" fillRule="evenodd" />
            </svg>
          </span>
          <p className="designs-lead">
            Websites, apps and online ordering for local businesses. Built by the same person who
            built this home screen.
          </p>
        </div>

        <h2 className="designs-h">What it costs</h2>
        <div className="designs-tiers">
          {TIERS.map((t) => (
            <div className="designs-tier" key={t.name}>
              <span className="designs-tier-top">
                <span className="designs-tier-name">{t.name}</span>
                <span className="designs-tier-price">{t.price}</span>
              </span>
              <span className="designs-tier-detail">{t.detail}</span>
            </div>
          ))}
        </div>
        <h2 className="designs-h">Add-ons</h2>
        <div className="designs-tiers">
          {ADDONS.map((t) => (
            <div className="designs-tier" key={t.name}>
              <span className="designs-tier-top">
                <span className="designs-tier-name">{t.name}</span>
                <span className="designs-tier-price">{t.price}</span>
              </span>
              <span className="designs-tier-detail">{t.detail}</span>
            </div>
          ))}
        </div>

        {/*
          The affiliate discount, which is the whole reason the prices went back
          up. Stated as a rule rather than shown as a struck-through number on
          every line: a price list that prints two figures for everything reads
          as a sale, and this is a membership perk.
        */}
        <p className="designs-offer">
          <strong>Half off all of it</strong> for BEASTY Affiliates. Every price above is the
          standard rate; members pay 50%.
        </p>

        <p className="designs-note">
          Fixed quote before anything starts, and nothing is charged through this app. If your job
          does not look like one of these, say so and it gets priced on its own. No design is out of
          reach or too crazy — look at the website you are on.
        </p>

        <h2 className="designs-h">Work</h2>
        <div className="designs-work">
          {WORK.map((w) => (
            <div className="designs-item" key={w.name}>
              <span className="designs-item-name">{w.name}</span>
              <span className="designs-item-whose">{w.whose}</span>
              <span className="designs-item-detail">{w.detail}</span>
              {w.href && (
                <a className="designs-item-link" href={w.href} target="_blank" rel="noreferrer">
                  {w.href.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          ))}
        </div>

        <h2 className="designs-h">Holding your spot</h2>
        {/*
          Every term stated up front, including the ones a customer would rather
          not read. An auto-renewing subscription sold to a California business
          has to disclose the renewal, the price and how to cancel BEFORE it
          charges — burying the month-seven charge under "six months free" is
          exactly what that rule exists to stop. It also happens to be the term
          most likely to cause an argument later, which is its own reason.
        */}
        <div className="designs-plan">
          <span className="designs-plan-price">
            $20<em>/month</em>
          </span>
          <ul>
            <li>Holds your tile on the home screen and your Welcome discount.</li>
            <li>
              <strong>The first six months are free.</strong> The first $20 comes out in month
              seven, then monthly after that.
            </li>
            <li>$180 for a year up front instead, which saves you $60.</li>
            <li>Cancel any time.</li>
            <li>Coming back after cancelling costs $20 to reactivate.</li>
          </ul>
          <p className="designs-plan-foot">
            Nothing is charged yet. Card payments are not connected, so this is the offer, not a
            bill — you would be asked to confirm these terms before any money moved.
          </p>
        </div>

        <h2 className="designs-h">Start</h2>
        <div className="brand-contact">
          <p>A first conversation costs nothing and usually settles the scope in one call.</p>
          <a className="btn-primary" href="tel:5108267735">
            Call (510) 826-7735
          </a>
          <a className="btn-secondary" href="mailto:leondragon3798@gmail.com">
            Email leondragon3798@gmail.com
          </a>
          <a
            className="btn-secondary"
            href="https://noctilucenty.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            See the full portfolio
          </a>
        </div>

        <p className="brand-foot">
          BEASTY Designs is the design and software side of BEASTY. Prices above are fixed
          tiers; anything custom is quoted on its own.
        </p>
      </div>
    </AppChrome>
  )
}
