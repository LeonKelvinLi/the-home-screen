import { useEffect, useState } from 'react'
import { AppChrome } from './AppChrome'
import { BrandLogo } from '../ios/BrandLogo'
import { brandById } from '../data/brands'
import { IS_LOCAL_ONLY, listOrders } from '../lib/api'
import type { PlacedOrder } from '../lib/api'
import { money } from '../store/cart'
import type { ShellApi } from '../ios/Device'

const STATES = ['queued', 'cooking', 'ready', 'collected'] as const

export function OrdersApp({ api }: { api: ShellApi }) {
  const [orders, setOrders] = useState<PlacedOrder[] | null>(null)
  const [stale, setStale] = useState(false)

  useEffect(() => {
    let alive = true
    let timer = 0

    /*
      Self-chaining rather than setInterval: a poll slower than the interval
      used to overlap, and an older response landing after a newer one made
      tickets visibly regress from `ready` back to `cooking`.
    */
    const tick = async () => {
      let result
      try {
        result = await listOrders()
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
  }, [])

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
          <p>Your past and active orders live here.</p>
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
          const done = o.tickets.every((t) => t.state === 'collected')
          return (
            <section className="order-card" key={o.id}>
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
                  <span className="order-total">{money(o.total)}</span>
                </div>
              </header>

              {!done && !o.local && (
                <div className="progress">
                  {STATES.map((s, i) => {
                    // Drive off the SLOWEST kitchen. Using `some` lit the whole
                    // bar as soon as one of three kitchens was ready, telling
                    // the customer to collect food nobody had started.
                    const slowest = Math.min(...o.tickets.map((t) => STATES.indexOf(t.state)))
                    return (
                      <span key={s} className={`progress-step${i <= slowest ? ' is-on' : ''}`}>
                        {s}
                      </span>
                    )
                  })}
                </div>
              )}

              {o.tickets.map((t) => (
                <div className="order-ticket" key={t.vendorId}>
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
                      Checkout tells a pickup customer "your order screen lists
                      the address for each" — and it did not. These are separate
                      businesses in seven different cities, so without this the
                      customer has nowhere to go. The data was already there;
                      nothing rendered it. Phone too, where the business
                      publishes one, since that is how you chase a late order.
                    */}
                    {o.fulfilment === 'pickup' &&
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
                  <span className={`ticket-state is-${t.state}`}>{t.state}</span>
                </div>
              ))}
            </section>
          )
        })}
      </div>
    </AppChrome>
  )
}
