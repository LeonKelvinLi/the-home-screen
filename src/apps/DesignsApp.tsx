import { useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { GLYPHS } from '../data/glyphs'
import { submitDesignsContact } from '../lib/api'
import type { ShellApi } from '../ios/Device'

/**
 * "Get in touch": a name and a number, and Leon calls back.
 *
 * Glenn, 2026-09-02, on the Call button that used to sit here: "do you prefer
 * to leave your phone number here? Or leave a 'Get in touch' button where
 * they leave their name and phone number for you to contact them at your
 * convenience?" Leon: "Yupp that works." So the number comes off the page and
 * the button collects theirs instead.
 *
 * Module scope, not inside DesignsApp: a component declared in a render body
 * is a new function every render, so React remounts it and the half-typed
 * form empties itself. tools/audit-nested-components.mjs fails the build on
 * exactly that.
 */
function GetInTouch() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentOnce = useRef(false)

  /* The same loose test the join form and the server use: ten digits, or
     eleven starting with 1, or a + number with at least eight. */
  const digits = phone.replace(/\D/g, '')
  const phoneOk = phone.trim().startsWith('+')
    ? digits.length >= 8
    : digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
  const ready = name.trim().length >= 2 && phoneOk

  const submit = async () => {
    if (!ready || sending || sentOnce.current) return
    setSending(true)
    setError(null)
    try {
      await submitDesignsContact({ name: name.trim(), phone: phone.trim() })
      sentOnce.current = true
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send that. Try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <p className="designs-touch-done" role="status">
        Thanks, {name.trim()}. Leon will call or text you at {phone.trim()}.
      </p>
    )
  }

  if (!open) {
    return (
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
        Get in touch
      </button>
    )
  }

  return (
    <form
      className="designs-touch"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <label className="join-field">
        <span>Your name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Your name"
          enterKeyHint="next"
          required
        />
      </label>
      <label className="join-field">
        <span>Phone number</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          placeholder="(510) 555-0123"
          enterKeyHint="send"
          required
        />
      </label>
      <button type="submit" className="btn-primary" disabled={!ready || sending}>
        {sending ? 'Sending…' : 'Send'}
      </button>
      {error && (
        <p className="designs-touch-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

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
    name: 'beastypages.com',
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
            Websites, apps and online ordering for local businesses.
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
          <strong>Half off all of it</strong> for BEASTY Affiliates.
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

        <h2 className="designs-h">Your spot on the home screen</h2>
        {/*
          WAS THE $20/MONTH "HOLDING YOUR SPOT" CARD. Glenn, 2026-09-02, on a
          screenshot of it: "right here you can update this and just put a
          link to the members page." A spot is held through the affiliate
          tiers on the Members page now — free, Biggie's Member, BEASTY Member
          — so one page carries those prices and this one points at it rather
          than quoting a second set that could drift from the first.
        */}
        <div className="designs-plan">
          <button type="button" className="btn-primary" onClick={() => api.openApp('sys.members')}>
            See the membership tiers
          </button>
        </div>

        <h2 className="designs-h">Start</h2>
        <div className="brand-contact">
          <GetInTouch />
          {/* designs@beastypages.com on his ask: "change your email address here". */}
          <a className="btn-secondary" href="mailto:designs@beastypages.com">
            Email designs@beastypages.com
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
      </div>
    </AppChrome>
  )
}
