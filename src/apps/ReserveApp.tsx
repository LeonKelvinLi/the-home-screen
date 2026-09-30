import { useEffect, useRef, useState } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'
import { ListRow, ListSection } from '../ios/ui/List'
import { BrandLogo } from '../ios/BrandLogo'
import { LISTED_KITCHENS } from '../data/brands'
import { submitApplication } from '../lib/api'
import { CITY_PAGES } from './registry'
import type { ShellApi } from '../ios/Device'
import { track } from '../lib/track'
import { useInPreview } from '../ios/preview'

/**
 * The empty slots on the last page are the platform's own sales pitch.
 *
 * A food truck seeing this screen wants three questions answered fast: what do
 * I actually get, what does it cost me, and is anyone already here. So the
 * order is proof first (25 kitchens, their real logos), then the offer, then
 * the form — not a form on an empty page.
 *
 * No scarcity claim. There are four full pages of blank tiles now, so a count
 * of "open slots" would be both wrong and a pressure tactic — and the number
 * would change with the device's grid anyway. Room available is the honest
 * framing.
 */

/**
 * Researched partners only, and "businesses" rather than "kitchens" — the set
 * includes an apparel label and a drinkware maker. BRANDS also includes
 * counting all of them called them Bay Area kitchens on a page pitching to a
 * food truck — and put their logos up as proof of participating kitchens.
 */
const KITCHENS = LISTED_KITCHENS
const KITCHEN_COUNT = KITCHENS.length
/** Those with real vendor artwork — the only ones the proof row may show. */
const WITH_ART = KITCHENS.filter((b) => b.logo.imageUrl)

/* Loose, like the server's: something@something.tld. The mail provider is the
   real judge; this only keeps the button from lighting up for "gmail". */
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function ReserveApp({ api, seat }: { api: ShellApi; seat?: string }) {
  /* Which blank tile was tapped, when it was one: `oakland-goods-5` names the
     city and the page. Reserve opened from elsewhere (`join`) has no seat. */
  const preview = useInPreview()
  useEffect(() => {
    if (preview) return
    const m = seat?.match(/^(.+)-(goods2?|services2?|online|individuals|boutiques)-\d{1,2}$/)
    if (!m) return track('reserve_started')
    const city = [...CITY_PAGES, 'BEASTY'].find((c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === m[1])
    track('reserve_started', { seat, page_kind: m[2], ...(city ? { city } : {}) })
  }, [preview, seat])
  const [name, setName] = useState('')
  const [hours, setHours] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [social, setSocial] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentOnce = useRef(false)

  /* "Name and a way to reach you are enough to start": a phone with at least
     seven digits or an email, whichever they have. */
  const valid =
    name.trim().length > 1 &&
    (phone.replace(/\D/g, '').length >= 7 || EMAIL_SHAPE.test(email.trim()))

  const submit = async () => {
    if (!valid || sending || sentOnce.current) return
    setSending(true)
    setError(null)
    try {
      await submitApplication({
        business: name.trim(),
        hours: hours.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        social: social.trim(),
      })
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
      <NavScreen title="Request sent" onBack={api.closeApp} backTitle="Home">
        <div className="confirm">
          <div className="confirm-tick">
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#34C759" strokeWidth="3" />
              <path
                d="m19 33 9 9 17-19"
                fill="none"
                stroke="#34C759"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>{name.trim()}</h2>
          {/*
            "the operator has been sent them" was a claim about a delivery this
            screen cannot see. The alert goes out over LEAD_WEBHOOK_URL, which
            is set by hand and is very likely unset — in which case the lead
            lands in a server log nobody reads. Saved is something we know;
            delivered is not, so only claim the first.
          */}
          <p className="confirm-sub">
            Your details are saved. Nothing is committed yet — a slot is confirmed only once the
            operator replies to you directly.
          </p>
          <button className="btn-secondary" onClick={api.closeApp}>
            Back to home
          </button>
        </div>
      </NavScreen>
    )
  }

  return (
    <NavScreen
      title="Reserve a Spot"
      onBack={api.closeApp}
      backTitle="Home"
      footer={
        <button className="cartbar is-solid" onClick={submit} disabled={!valid || sending}>
          <span className="cartbar-label">{sending ? 'Sending…' : 'Request a slot'}</span>
        </button>
      }
    >
      <p className="reserve-lead">
        Put your business on this home screen. One tap from a customer's phone, alongside{' '}
        {KITCHEN_COUNT} other local businesses.
      </p>

      {/*
        Proof before pitch — but NOT "their real logos", which this comment used
        to say and which was never true of all of them. Several of these twelve
        have no artwork and render the app's own generated mark, so a row sold
        as evidence of who has joined was partly the app drawing its own
        pictures. Filtered to businesses that actually supplied artwork: fewer
        marks, all of them real.
      */}
      <div className="reserve-proof">
        {KITCHENS.filter((b) => b.logo.imageUrl).slice(0, 12).map((b) => (
          <span className="reserve-proof-mark" key={b.id}>
            <BrandLogo logo={b.logo} size={34} />
          </span>
        ))}
        {/* Only when there are actually more. There are 10 listed partners and
            room for 12 marks, so this printed a literal "+-2" on the screen a
            prospective business is shown. */}
        {WITH_ART.length > 12 && (
          <span className="reserve-proof-more">+{WITH_ART.length - 12}</span>
        )}
      </div>

      {/*
        GLENN'S WORDING, 2026-09-22, over his markup of this list: every kind
        of business, not only kitchens, so no menu, prices or shared cart. The
        middle row wears the info mark he drew in, on a lighter blue than the
        bag above it so the two tiles stay apart.
      */}
      <ListSection header="What you get">
        <ListRow
          icon="bag.fill"
          iconBg="#007AFF"
          label="Your own icon"
          detail="Your logo and name opening straight into your page"
          chevron={false}
        />
        <ListRow
          icon="info.circle.fill"
          iconBg="#32ADE6"
          label="Business information"
          detail="List your hours, address and contacts"
          chevron={false}
        />
        <ListRow
          icon="star.fill"
          iconBg="#FF9500"
          label="Business description"
          detail="Describe what goods or services your business provides. Add a web link and/or IG handle"
          chevron={false}
        />
      </ListSection>

      <ListSection
        header="Availability"
        footer={`Goods and services pages for each of ${CITY_PAGES.length} cities, and the yellow BEASTY pages behind them for everyone after the first twenty-four. There is no queue and no cap.`}
      >
        <ListRow label="Businesses on the platform" value={String(KITCHEN_COUNT)} chevron={false} />
        <ListRow label="Open slots" value="Room available" chevron={false} />
      </ListSection>

      <ListSection header="Your details" footer="Name and a way to reach you are enough to start.">
        <input
          className="co-input"
          placeholder="Business name"
          aria-label="Business name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
        {/*
          His revision of the boxes, 2026-09-22: "What you cook" became his
          hours, an address box went in, and "Phone or email" split in two,
          email taking the place of City. The address is left to them rather
          than autofilled: a browser would offer a home address, and this one
          goes on a public page.
        */}
        <input
          className="co-input"
          placeholder="List your hours"
          aria-label="List your hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          maxLength={120}
        />
        <input
          className="co-input"
          placeholder="Address"
          aria-label="Address"
          autoComplete="off"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          maxLength={120}
        />
        <input
          className="co-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone"
          aria-label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={40}
        />
        <input
          className="co-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={120}
        />
        <input
          className="co-input"
          placeholder="Instagram (optional)"
          aria-label="Instagram (optional)"
          value={social}
          onChange={(e) => setSocial(e.target.value)}
          maxLength={80}
        />
      </ListSection>

      {/* Spoken, not just drawn — see CheckoutApp. */}
      {error && (
        <p className="co-error" role="alert">
          {error}
        </p>
      )}
    </NavScreen>
  )
}
