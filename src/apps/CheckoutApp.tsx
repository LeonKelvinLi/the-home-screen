import { useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { brandById } from '../data/brands'
import { money, useCart } from '../store/cart'
import { IS_LOCAL_ONLY, PAYMENTS_LIVE, newIdempotencyKey, placeOrder } from '../lib/api'
import type { PlacedOrder } from '../lib/api'
import type { ShellApi } from '../ios/Device'

/**
 * Checkout. One card charge, N kitchens paid.
 *
 * Deliberately absent: the per-vendor payout breakdown. That existed here and
 * showed the customer exactly what the platform takes from each kitchen, on top
 * of the service fee they had already paid — and handed every vendor a
 * screenshot to renegotiate with. It belongs on a vendor dashboard.
 */

export function CheckoutApp({ api, onBack }: { api: ShellApi; onBack: () => void }) {
  const cart = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState<PlacedOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const idemKey = useRef(newIdempotencyKey())

  const t = cart.totals
  const delivering = cart.fulfilment === 'delivery'
  const valid =
    name.trim().length > 1 &&
    phone.replace(/\D/g, '').length >= 10 &&
    (!delivering || address.trim().length > 6)

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
        address: delivering ? address.trim() : undefined,
        // Stable for the life of this checkout screen, so a retry after a
        // timeout cannot print a second set of kitchen tickets.
        idempotencyKey: idemKey.current,
      })
      // placeOrder records the id locally before returning, so the order is
      // recoverable in Orders even if this screen is torn down mid-flight
      // (swiping home during the request unmounts the whole app window).
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

          {/* Never let a local-only order look like a real one. */}
          {order.local ? (
            <p className="local-notice">
              <strong>Saved on this device only.</strong> No kitchen has received this order —
              ordering goes live once the backend is connected.
            </p>
          ) : !PAYMENTS_LIVE ? (
            <p className="local-notice">
              <strong>Nothing has been charged.</strong> The kitchen has your order — pay at the
              counter when you collect.
            </p>
          ) : null}

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
          <h3>{delivering ? 'Deliver to' : 'Pickup from'}</h3>
          {delivering ? (
            <>
              <input
                className="co-input"
                placeholder="Street address, unit"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                maxLength={160}
              />
              <p className="co-hint">Delivery radius is 4 miles from the commissary.</p>
            </>
          ) : (
            <div className="co-address">
              <strong>Hall Street Commissary</strong>
              <span>Each kitchen has its own counter — your order screen shows which.</span>
            </div>
          )}
        </section>

        <section className="co-block">
          <h3>Contact</h3>
          <input
            className="co-input"
            placeholder="Name for the order"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={100}
          />
          <input
            className="co-input"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
          />
          <p className="co-hint">Texted when each kitchen finishes its part.</p>
        </section>

        <section className="co-block">
          <h3>Payment</h3>
          {!PAYMENTS_LIVE ? (
            <p className="local-notice">
              <strong>Nothing is charged.</strong>{' '}
              {IS_LOCAL_ONLY
                ? 'Payments are not connected, so this order is saved on your device and no kitchen receives it.'
                : 'Card payments are not connected yet. Your order does reach the kitchen — settle up at the counter.'}
            </p>
          ) : (
            <>
              <button className="pay-row is-on">
                <span className="pay-mark">VISA</span>
                <span>•••• 4242</span>
                <span className="pay-check">✓</span>
              </button>
              <p className="co-hint">
                One charge of {money(t.total)} covering all {cart.brandCount} kitchen
                {cart.brandCount === 1 ? '' : 's'}.
              </p>
            </>
          )}
        </section>

        <section className="co-block">
          <h3>Total</h3>
          <div className="totals">
            <Row label="Subtotal" value={money(t.subtotal)} />
            <Row label="Service fee" value={money(t.serviceFee)} />
            {delivering && <Row label="Delivery" value={money(t.deliveryFee)} />}
            <Row label="Tax" value={money(t.tax)} />
            <Row label="Tip" value={money(t.tip)} />
            <Row label="Total" value={money(t.total)} strong />
          </div>
        </section>

        {error && <p className="co-error">{error}</p>}
      </div>
    </AppChrome>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`totals-row${strong ? ' is-strong' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
