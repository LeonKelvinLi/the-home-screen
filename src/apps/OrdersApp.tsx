import { useEffect, useState } from 'react'
import { AppChrome } from './AppChrome'
import { BrandLogo } from '../ios/BrandLogo'
import { brandById } from '../data/brands'
import { listOrders } from '../lib/api'
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

              {!done && (
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
