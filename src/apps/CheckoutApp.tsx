import { useState } from 'react'
import { AppChrome } from './AppChrome'
import { brandById, vendorById } from '../data/brands'
import { money, useCart } from '../store/cart'
import { placeOrder } from '../lib/api'
import type { PlacedOrder } from '../lib/api'
import type { ShellApi } from '../ios/Device'

/**
 * Checkout. One card charge, N kitchens paid.
 *
 * The split shown here is the real one the server computes — platform fee comes
 * off each vendor's slice, not off the customer's total, which is how Connect
 * destination charges actually behave.
 */

export function CheckoutApp({ api, onBack }: { api: ShellApi; onBack: () => void }) {
  const cart = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState<PlacedOrder | null>(null)
  const [error, setError] = useState<string | null>(null)

  const t = cart.totals
  const valid = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 10

  const submit = async () => {
    if (!valid || placing) return
    setPlacing(true)
    setError(null)
    try {
      const placed = await placeOrder({
        lines: cart.lines,
        fulfilment: cart.fulfilment,
        tipBps: cart.tipBps,
        customer: { name: name.trim(), phone: phone.trim() },
      })
      setOrder(placed)
      cart.clear()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place the order.')
    } finally {
      setPlacing(false)
    }
  }

  if (order) {
    return (
      <AppChrome title="Order placed" tint="#1DA345">
        <div className="confirm">
          <div className="confirm-tick">
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#30D158" strokeWidth="3" />
              <path
                d="m19 33 9 9 17-19"
                fill="none"
                stroke="#30D158"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>{order.code}</h2>
          <p className="confirm-sub">
            Ready in about {order.etaMinutes} minutes · {order.fulfilment}
          </p>

          {order.tickets.map((ticket) => {
            const brands = ticket.brandIds.map((b) => brandById(b)?.name).filter(Boolean)
            return (
              <div className="ticket" key={ticket.vendorId}>
                <div className="ticket-head">
                  <strong>{brands.join(' + ')}</strong>
                  <span className={`ticket-state is-${ticket.state}`}>{ticket.state}</span>
                </div>
                <div className="ticket-lines">
                  {ticket.lines.map((l, i) => (
                    <div key={i}>
                      {l.qty}× {l.name}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <button className="btn-primary" onClick={() => api.openApp('sys.orders')}>
            Track order
          </button>
          <button className="btn-secondary" onClick={api.closeApp}>
            Back to home
          </button>
        </div>
      </AppChrome>
    )
  }

  return (
    <AppChrome
      title="Checkout"
      onBack={onBack}
      backLabel="Cart"
      tint="#1B47D6"
      footer={
        <button className="cartbar is-solid" onClick={submit} disabled={!valid || placing}>
          <span className="cartbar-label">{placing ? 'Placing…' : 'Place order'}</span>
          <span className="cartbar-total">{money(t.total)}</span>
        </button>
      }
    >
      <div className="checkout-body">
        <section className="co-block">
          <h3>{cart.fulfilment === 'pickup' ? 'Pickup from' : 'Deliver to'}</h3>
          <div className="co-address">
            {cart.fulfilment === 'pickup' ? (
              <>
                <strong>Hall Street Commissary</strong>
                <span>1180 Hall St, Unit 4 · 0.8 mi away</span>
              </>
            ) : (
              <>
                <strong>Add an address</strong>
                <span>Delivery radius 4 mi from the commissary</span>
              </>
            )}
          </div>
        </section>

        <section className="co-block">
          <h3>Contact</h3>
          <input
            className="co-input"
            placeholder="Name for the order"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            className="co-input"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
          <p className="co-hint">Texted when each kitchen finishes its part.</p>
        </section>

        <section className="co-block">
          <h3>Payment</h3>
          <button className="pay-row is-on">
            <span className="pay-mark">VISA</span>
            <span>•••• 4242</span>
            <span className="pay-check">✓</span>
          </button>
          <p className="co-hint">
            One charge of {money(t.total)}. Kitchens are paid out separately.
          </p>
        </section>

        <section className="co-block">
          <h3>Where the money goes</h3>
          {t.byVendor.map((g) => {
            const vendor = vendorById(g.vendorId)
            const fee = Math.round(g.subtotal * 0.1)
            return (
              <div className="split-row" key={g.vendorId}>
                <div className="split-name">
                  {g.brandIds.map((b) => brandById(b)?.name).filter(Boolean).join(' + ')}
                  <em>{vendor?.name}</em>
                </div>
                <div className="split-nums">
                  <span>{money(g.subtotal - fee)}</span>
                  <em>after {money(fee)} platform fee</em>
                </div>
              </div>
            )
          })}
          <p className="co-hint">
            Vendors without completed payout onboarding are held until they finish it.
          </p>
        </section>

        {error && <p className="co-error">{error}</p>}
      </div>
    </AppChrome>
  )
}
