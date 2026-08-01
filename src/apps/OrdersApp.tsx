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

  useEffect(() => {
    let alive = true
    listOrders().then((o) => alive && setOrders(o))
    // Kitchens advance tickets on their own; poll so the customer sees it.
    const t = window.setInterval(() => listOrders().then((o) => alive && setOrders(o)), 6000)
    return () => {
      alive = false
      clearInterval(t)
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
                  {o.offline && <em className="order-offline">local</em>}
                </div>
              </header>

              {!done && (
                <div className="progress">
                  {STATES.map((s) => {
                    const reached = o.tickets.some((t) => STATES.indexOf(t.state) >= STATES.indexOf(s))
                    return (
                      <span key={s} className={`progress-step${reached ? ' is-on' : ''}`}>
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
