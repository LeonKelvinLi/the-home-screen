import { useState } from 'react'
import { AppChrome } from './AppChrome'
import { CheckoutApp } from './CheckoutApp'
import { NavStack } from '../ios/ui/NavStack'
import { useScreenSize } from '../ios/ScreenSize'
import { BrandLogo } from '../ios/BrandLogo'
import { brandById, vendorById } from '../data/brands'
import { lineTotal, money, useCart } from '../store/cart'
import type { ShellApi } from '../ios/Device'

/**
 * One cart, grouped by kitchen. The grouping is not cosmetic — each group
 * becomes its own ticket and its own payout, so the customer needs to see that
 * three kitchens are cooking before they commit.
 */

export function CartApp({ api }: { api: ShellApi }) {
  const cart = useCart()
  const screen = useScreenSize()
  const [checkout, setCheckout] = useState(false)

  /*
    Checkout is PUSHED, not swapped. Returning <CheckoutApp/> from state made
    the transition instant — one screen replaced by another with no motion and
    no way back except a button. NavStack gives it the iOS push and the
    left-edge back-swipe.
  */
  if (checkout || cart.lines.length > 0) {
    return (
      <NavStack
        width={screen.w}
        onPop={() => setCheckout(false)}
        pushed={checkout ? <CheckoutApp api={api} onBack={() => setCheckout(false)} /> : null}
        root={<CartRoot api={api} onCheckout={() => setCheckout(true)} />}
      />
    )
  }

  return <CartRoot api={api} onCheckout={() => setCheckout(true)} />
}

function CartRoot({ api, onCheckout }: { api: ShellApi; onCheckout: () => void }) {
  const cart = useCart()

  if (cart.lines.length === 0) {
    return (
      <AppChrome title="Cart" onBack={api.closeApp} tint="#1B47D6">
        <div className="empty">
          <div className="empty-mark">🛍</div>
          <h2>Your cart is empty</h2>
          <button className="btn-secondary" onClick={api.closeApp}>
            Browse kitchens
          </button>
        </div>
      </AppChrome>
    )
  }

  const t = cart.totals

  return (
    <AppChrome
      title="Cart"
      subtitle={`${cart.count} item${cart.count === 1 ? '' : 's'} from ${cart.brandCount} kitchen${
        cart.brandCount === 1 ? '' : 's'
      }`}
      onBack={api.closeApp}
      tint="#1B47D6"
      footer={
        <button className="cartbar is-solid" onClick={onCheckout}>
          <span className="cartbar-label">Checkout</span>
          <span className="cartbar-total">{money(t.total)}</span>
        </button>
      }
    >
      <div className="cart-body">
        <div className="mode-toggle">
          {(['pickup', 'delivery'] as const).map((m) => (
            <button
              key={m}
              className={cart.fulfilment === m ? 'is-on' : ''}
              onClick={() => cart.setFulfilment(m)}
            >
              {m === 'pickup' ? 'Pickup' : 'Delivery'}
            </button>
          ))}
        </div>

        <p className="eta">
          {/* "usually" — prepMinutes is an estimate by category that no kitchen
              supplied, and no kitchen has seen this order yet. BrandApp hedges
              it; the screens where someone decides when to leave did not. */}
          Usually ready in about <strong>{cart.etaMinutes} min</strong>
        </p>

        {t.byVendor.map((group) => {
          const vendor = vendorById(group.vendorId)
          return (
            <section className="cart-group" key={group.vendorId}>
              <header className="cart-group-head">
                <div className="cart-group-marks">
                  {group.brandIds.map((bid) => {
                    const b = brandById(bid)
                    return b ? (
                      <span key={bid} className="cart-group-mark">
                        <BrandLogo logo={b.logo} size={26} />
                      </span>
                    ) : null
                  })}
                </div>
                <div className="cart-group-name">
                  {group.brandIds.map((bid) => brandById(bid)?.name).filter(Boolean).join(' + ')}
                  <em>{vendor?.name}</em>
                </div>
              </header>

              {group.lines.map((line) => (
                <div className="cart-line" key={line.lineId}>
                  <div className="cart-line-text">
                    <span className="cart-line-name">{line.name}</span>
                    {line.options.length > 0 && (
                      <span className="cart-line-opts">
                        {line.options.map((o) => o.name).join(', ')}
                      </span>
                    )}
                    {line.note && <span className="cart-line-note">“{line.note}”</span>}
                  </div>
                  <div className="cart-line-right">
                    <div className="qty is-small">
                      <button onClick={() => cart.setQty(line.lineId, -1)} aria-label="Decrease">
                        −
                      </button>
                      <span>{line.qty}</span>
                      <button onClick={() => cart.setQty(line.lineId, 1)} aria-label="Increase">
                        +
                      </button>
                    </div>
                    <span className="cart-line-price">{money(lineTotal(line))}</span>
                  </div>
                </div>
              ))}

              <button className="cart-group-add" onClick={() => api.openApp(group.brandIds[0])}>
                Add more from this kitchen
              </button>
            </section>
          )
        })}

        <section className="tip-block">
          <h3>Tip</h3>
          <div className="tip-row">
            {[0, 1500, 1800, 2200].map((bps) => (
              <button
                key={bps}
                className={cart.tipBps === bps ? 'is-on' : ''}
                onClick={() => cart.setTip(bps)}
              >
                {bps === 0 ? 'None' : `${bps / 100}%`}
              </button>
            ))}
          </div>
        </section>

        <section className="totals">
          <Row label="Subtotal" value={money(t.subtotal)} />
          <Row label="Service fee" value={money(t.serviceFee)} />
          {cart.fulfilment === 'delivery' && <Row label="Delivery" value={money(t.deliveryFee)} />}
          <Row label="Tax" value={money(t.tax)} />
          <Row label="Tip" value={money(t.tip)} />
          <Row label="Total" value={money(t.total)} strong />
        </section>

        <button className="cart-clear" onClick={cart.clear}>
          Empty cart
        </button>
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
