import { useEffect, useState } from 'react'
import { AppChrome } from './AppChrome'
import { BrandLogo } from '../ios/BrandLogo'
import { brandById } from '../data/brands'
import { IS_LOCAL_ONLY, OrderRejected, canCancel, cancelOrder, listOrders } from '../lib/api'
import type { PlacedOrder } from '../lib/api'
import { useGate } from '../lib/gate'
import { money } from '../store/cart'
import type { ShellApi } from '../ios/Device'

const STATES = ['queued', 'cooking', 'ready', 'collected'] as const

export function OrdersApp({ api }: { api: ShellApi }) {
  const { account } = useGate()
  const signedIn = !!account
  const [orders, setOrders] = useState<PlacedOrder[] | null>(null)
  const [stale, setStale] = useState(false)
  /** The order whose cancel is being confirmed, and what the server said. */
  const [confirming, setConfirming] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<{ id: string; message: string } | null>(null)

  useEffect(() => {
    let alive = true
    let timer = 0

    /*
      Self-chaining rather than setInterval: a poll slower than the interval
      used to overlap, and an older response landing after a newer one made
      tickets visibly regress from `ready` back to `cooking`.

      Restarted when the account changes, so signing in brings the account's
      orders from every other phone straight onto this list.
    */
    const tick = async () => {
      let result
      try {
        result = await listOrders({ signedIn })
      } catch {
        if (alive) setStale(true)
        if (alive) timer = window.setTimeout(tick, 6000)
        return
      }
      if (!alive) return
      // Never let a failed lookup overwrite good data with an empty list.
      if (!result.degraded || result.orders.length > 0) setOrders(result.orders)
      else setOrders((prev) => prev ?? [])
      setStale(result.degraded)
      timer = window.setTimeout(tick, 6000)
    }

    tick()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [signedIn])

  const cancel = async (o: PlacedOrder) => {
    setCancelling(o.id)
    setCancelError(null)
    try {
      const fresh = await cancelOrder(o)
      setOrders((prev) => (prev ?? []).map((x) => (x.id === o.id ? fresh : x)))
      setConfirming(null)
    } catch (err) {
      /* A refusal is shown as the server worded it: "a kitchen has already
         started" is the thing the customer needs to read, not a generic fail. */
      const message =
        err instanceof OrderRejected ? err.message : 'Could not reach the server. Try again in a moment.'
      setCancelError({ id: o.id, message })
    } finally {
      setCancelling(null)
    }
  }

  if (orders === null) {
    return (
      <AppChrome title="Orders" onBack={api.closeApp} tint="#3A3EBD">
        <div className="empty">
          <p>Loading…</p>
        </div>
      </AppChrome>
    )
  }

  if (orders.length === 0) {
    return (
      <AppChrome title="Orders" onBack={api.closeApp} tint="#3A3EBD">
        <div className="empty">
          <div className="empty-mark">🧾</div>
          <h2>No orders yet</h2>
          <p>
            {signedIn
              ? 'Orders you place while signed in show here on every phone you use.'
              : 'Your past and active orders live here.'}
          </p>
          <button className="btn-secondary" onClick={api.closeApp}>
            Browse kitchens
          </button>
        </div>
      </AppChrome>
    )
  }

  return (
    <AppChrome title="Orders" onBack={api.closeApp} tint="#3A3EBD">
      <div className="orders-body">
        {stale && <p className="orders-stale">Reconnecting — statuses may be out of date.</p>}
        {IS_LOCAL_ONLY && orders.length > 0 && (
          <p className="local-notice">
            These are saved on this device only. No kitchen has received them yet.
          </p>
        )}
        {/*
          NOT gated on IS_LOCAL_ONLY. That was the bug: in production ordering is
          live, so the notice above never rendered, while the server was still
          advancing tickets on a timer — the bar below reached "ready" a minute
          after ordering and nobody had told the customer it was a demo. This
          reads the flag off the order itself, so it appears exactly when the
          statuses are not real.
        */}
        {!IS_LOCAL_ONLY && orders.some((o) => o.simulated) && (
          <p className="local-notice">
            Order statuses on this screen are a demonstration and move on a timer. Do not set
            out to collect until the kitchen has confirmed with you directly.
          </p>
        )}
        {orders.map((o) => {
          const open = o.tickets.filter((t) => t.state !== 'cancelled')
          const allCancelled = open.length === 0 && o.tickets.length > 0
          const done = !allCancelled && open.every((t) => t.state === 'collected')
          const cancellable = canCancel(o, signedIn)
          return (
            <section className={`order-card${allCancelled ? ' is-cancelled' : ''}`} key={o.id}>
              <header className="order-head">
                <div>
                  <strong>{o.code}</strong>
                  <span className="order-when">
                    {new Date(o.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="order-right">
                  {allCancelled ? (
                    <span className="order-cancelled-chip">Cancelled</span>
                  ) : (
                    <span className="order-total">{money(o.total)}</span>
                  )}
                </div>
              </header>

              {!done && !allCancelled && !o.local && (
                <div className="progress">
                  {STATES.map((s, i) => {
                    // Drive off the SLOWEST kitchen. Using `some` lit the whole
                    // bar as soon as one of three kitchens was ready, telling
                    // the customer to collect food nobody had started. A
                    // cancelled ticket is out of the race, not the slowest in it.
                    const slowest = Math.min(
                      ...open.map((t) => STATES.indexOf(t.state as (typeof STATES)[number])),
                    )
                    return (
                      <span key={s} className={`progress-step${i <= slowest ? ' is-on' : ''}`}>
                        {s}
                      </span>
                    )
                  })}
                </div>
              )}

              {o.tickets.map((t) => (
                <div className={`order-ticket${t.state === 'cancelled' ? ' is-cancelled' : ''}`} key={t.vendorId}>
                  <div className="order-ticket-marks">
                    {t.brandIds.map((bid) => {
                      const b = brandById(bid)
                      return b ? <BrandLogo key={bid} logo={b.logo} size={24} /> : null
                    })}
                  </div>
                  <div className="order-ticket-body">
                    <div className="order-ticket-name">
                      {t.brandIds.map((b) => brandById(b)?.name).filter(Boolean).join(' + ')}
                    </div>
                    <div className="order-ticket-lines">
                      {t.lines.map((l, i) => (
                        <span key={i}>
                          {l.qty}× {l.name}
                        </span>
                      ))}
                    </div>
                    {/*
                      Who cancelled, in the kitchen's own words when it was the
                      kitchen. A ticket that silently went grey would leave the
                      customer ringing to ask why.
                    */}
                    {t.state === 'cancelled' && t.cancelledBy === 'kitchen' && (
                      <div className="order-ticket-cancel">
                        The kitchen could not take this{t.cancelReason ? `: ${t.cancelReason}` : '.'}
                      </div>
                    )}
                    {/*
                      Checkout tells a pickup customer "your order screen lists
                      the address for each" — and it did not. These are separate
                      businesses in seven different cities, so without this the
                      customer has nowhere to go. The data was already there;
                      nothing rendered it. Phone too, where the business
                      publishes one, since that is how you chase a late order.
                    */}
                    {o.fulfilment === 'pickup' &&
                      t.state !== 'cancelled' &&
                      t.brandIds.map((bid) => {
                        const b = brandById(bid)
                        if (!b?.address) return null
                        return (
                          <div className="order-ticket-where" key={`w-${bid}`}>
                            <span>{b.address}</span>
                            {b.phone && (
                              <a href={`tel:${b.phone.replace(/[^0-9+]/g, '')}`}>{b.phone}</a>
                            )}
                          </div>
                        )
                      })}
                  </div>
                  {/*
                    Announced when it changes, not only drawn.

                    These march queued -> cooking -> ready on a six-second poll.
                    Nothing told a screen-reader user their food was ready; they
                    would have had to keep re-reading the page to find out.
                  */}
                  <span className={`ticket-state is-${t.state}`} aria-live="polite">
                    {t.state}
                  </span>
                </div>
              ))}

              {/*
                CANCEL, while no kitchen has started — and only from the device
                that placed the order or the account that owns it. Two steps,
                because a stray tap on a phone should not throw away lunch.
              */}
              {cancellable && confirming !== o.id && (
                <button className="order-cancel" onClick={() => setConfirming(o.id)}>
                  Cancel order
                </button>
              )}
              {cancellable && confirming === o.id && (
                <div className="order-cancel-confirm" role="group" aria-label="Cancel this order">
                  <p>Cancel this order? No kitchen has started on it yet.</p>
                  <div className="order-cancel-actions">
                    <button className="btn-secondary" onClick={() => setConfirming(null)} disabled={cancelling === o.id}>
                      Keep it
                    </button>
                    <button className="order-cancel-go" onClick={() => void cancel(o)} disabled={cancelling === o.id}>
                      {cancelling === o.id ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  </div>
                </div>
              )}
              {cancelError?.id === o.id && (
                <p className="order-cancel-error" role="alert">
                  {cancelError.message}
                </p>
              )}
            </section>
          )
        })}
      </div>
    </AppChrome>
  )
}
