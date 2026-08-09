import { useRef, useState } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'
import { ListRow, ListSection } from '../ios/ui/List'
import { BrandLogo } from '../ios/BrandLogo'
import { LISTED_KITCHENS } from '../data/brands'
import { submitApplication } from '../lib/api'
import { CITY_PAGES } from './registry'
import type { ShellApi } from '../ios/Device'

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

export function ReserveApp({ api }: { api: ShellApi }) {
  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [contact, setContact] = useState('')
  const [city, setCity] = useState('')
  const [social, setSocial] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentOnce = useRef(false)

  const valid = name.trim().length > 1 && contact.trim().length > 5

  const submit = async () => {
    if (!valid || sending || sentOnce.current) return
    setSending(true)
    setError(null)
    try {
      await submitApplication({
        business: name.trim(),
        cuisine: cuisine.trim(),
        contact: contact.trim(),
        city: city.trim(),
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

      {/* Proof before pitch: their real logos, not a claim about them. */}
      <div className="reserve-proof">
        {KITCHENS.slice(0, 12).map((b) => (
          <span className="reserve-proof-mark" key={b.id}>
            <BrandLogo logo={b.logo} size={34} />
          </span>
        ))}
        {/* Only when there are actually more. There are 10 listed partners and
            room for 12 marks, so this printed a literal "+-2" on the screen a
            prospective business is shown. */}
        {KITCHEN_COUNT > 12 && <span className="reserve-proof-more">+{KITCHEN_COUNT - 12}</span>}
      </div>

      <ListSection header="What you get">
        <ListRow
          icon="bag.fill"
          iconBg="#007AFF"
          label="Your own icon"
          detail="Your logo, your name, opening straight into your menu"
          chevron={false}
        />
        <ListRow
          icon="creditcard.fill"
          iconBg="#34C759"
          label="Your prices, your menu"
          detail="You set your own items and prices. Nobody else edits them"
          chevron={false}
        />
        <ListRow
          icon="star.fill"
          iconBg="#FF9500"
          label="A shared cart"
          detail="One cart and one checkout across every kitchen here"
          chevron={false}
        />
      </ListSection>

      <ListSection
        header="Availability"
        footer={`Two pages of open tiles for each of ${CITY_PAGES.length} cities, goods and services. There is no queue and no cap.`}
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
        <input
          className="co-input"
          placeholder="What you cook"
          aria-label="What you cook"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          maxLength={60}
        />
        <input
          className="co-input"
          placeholder="Phone or email"
          aria-label="Phone or email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={100}
        />
        <input
          className="co-input"
          placeholder="City"
          aria-label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={60}
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
