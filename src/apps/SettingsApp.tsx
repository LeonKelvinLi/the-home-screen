import { useState } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'
import { ListRow, ListSection } from '../ios/ui/List'
import { BRANDS } from '../data/brands'
import { useSettings } from '../store/settings'
import { useCart } from '../store/cart'
import { IS_LOCAL_ONLY, ORDERING_LIVE, PAYMENTS_LIVE } from '../lib/api'
import type { ShellApi } from '../ios/Device'

/**
 * Settings, built the way iOS builds it: inset-grouped lists, rounded-square
 * glyph tiles, a collapsing large title, explanatory section footers.
 *
 * Every control changes real behaviour. A Settings screen full of decorative
 * toggles teaches the customer that nothing in this app does anything.
 */

const TIPS = [0, 1000, 1500, 1800, 2000, 2500]

export function SettingsApp({ api }: { api: ShellApi }) {
  const s = useSettings()
  const cart = useCart()
  const [page, setPage] = useState<'root' | 'orders' | 'tip' | 'privacy' | 'about'>('root')

  if (page === 'tip') {
    return (
      <NavScreen title="Default Tip" backTitle="Ordering" onBack={() => setPage('orders')}>
        <ListSection footer="Applied to a new cart. You can still change it on any order.">
          {TIPS.map((bps) => (
            <ListRow
              key={bps}
              label={bps === 0 ? 'No tip' : `${bps / 100}%`}
              chevron={false}
              onClick={() => s.set('defaultTipBps', bps)}
              accessory={
                s.defaultTipBps === bps ? <span className="ios-row-check">✓</span> : undefined
              }
            />
          ))}
        </ListSection>
      </NavScreen>
    )
  }

  if (page === 'orders') {
    return (
      <NavScreen title="Ordering" backTitle="Settings" onBack={() => setPage('root')}>
        <ListSection
          header="Fulfilment"
          footer="Applied to a new cart. Delivery adds a fee and about twelve minutes."
        >
          {(['pickup', 'delivery'] as const).map((m) => (
            <ListRow
              key={m}
              label={m === 'pickup' ? 'Pickup' : 'Delivery'}
              chevron={false}
              onClick={() => s.set('defaultFulfilment', m)}
              accessory={
                s.defaultFulfilment === m ? <span className="ios-row-check">✓</span> : undefined
              }
            />
          ))}
        </ListSection>

        <ListSection header="Tip">
          <ListRow
            label="Default Tip"
            value={s.defaultTipBps === 0 ? 'None' : `${s.defaultTipBps / 100}%`}
            onClick={() => setPage('tip')}
          />
        </ListSection>

      </NavScreen>
    )
  }

  if (page === 'privacy') {
    return (
      <NavScreen title="Privacy" backTitle="Settings" onBack={() => setPage('root')}>
        <ListSection
          footer={
            IS_LOCAL_ONLY
              ? 'Your cart and order history are stored on this device only. Nothing is sent anywhere.'
              : 'Your cart is stored on this device. When you place an order, the name, phone number and any delivery address you enter are sent to our server and kept with that order so the kitchen can fulfil it.'
          }
        >
          <ListRow label="Cart" value={`${cart.count} item${cart.count === 1 ? '' : 's'}`} chevron={false} />
          <ListRow
            label="Clear Cart"
            destructive
            chevron={false}
            onClick={() => cart.clear()}
            disabled={cart.count === 0}
          />
        </ListSection>

        <ListSection footer="Removes every saved order from this device. It cannot be undone.">
          <ListRow
            label="Clear Order History"
            destructive
            chevron={false}
            onClick={() => {
              try {
                localStorage.removeItem('fb.orders.v2')
                localStorage.removeItem('fb.orderIds.v1')
              } catch {
                /* private mode */
              }
            }}
          />
        </ListSection>

        <ListSection>
          <ListRow label="Reset All Settings" destructive chevron={false} onClick={s.reset} />
        </ListSection>
      </NavScreen>
    )
  }

  if (page === 'about') {
    const items = BRANDS.reduce((n, b) => n + b.menu.reduce((m, c) => m + c.items.length, 0), 0)
    return (
      <NavScreen title="About" backTitle="Settings" onBack={() => setPage('root')}>
        <ListSection>
          <ListRow label="Kitchens" value={String(BRANDS.length)} chevron={false} />
          <ListRow label="Menu Items" value={String(items)} chevron={false} />
          <ListRow label="Version" value="0.1.0" chevron={false} />
        </ListSection>
        <ListSection
          header="Status"
          footer={
            IS_LOCAL_ONLY
              ? 'Ordering is not connected. Orders are saved on this device and no kitchen receives them.'
              : 'Orders are sent to our server and recorded. No kitchen display is connected yet, so confirm with the kitchen directly. Nothing is charged here.'
          }
        >
          <ListRow label="Ordering" value={ORDERING_LIVE ? 'Live' : 'Preview'} chevron={false} />
          <ListRow
            label="Payments"
            value={PAYMENTS_LIVE ? 'Live' : 'Not connected'}
            chevron={false}
          />
        </ListSection>
      </NavScreen>
    )
  }

  return (
    <NavScreen title="Settings" onBack={api.closeApp} backTitle="Home">
      <ListSection>
        <ListRow
          icon="person.crop.circle.fill"
          iconBg="#8E8E93"
          label="Sign In"
          detail="Keep your orders across devices"
          onClick={() => api.openApp('sys.account')}
        />
      </ListSection>

      <ListSection>
        <ListRow
          icon="bag.fill"
          iconBg="#007AFF"
          label="Ordering"
          value={s.defaultFulfilment === 'pickup' ? 'Pickup' : 'Delivery'}
          onClick={() => setPage('orders')}
        />
        <ListRow
          icon="creditcard.fill"
          iconBg="#34C759"
          label="Payment"
          value="Not connected"
          onClick={() => api.openApp('sys.help')}
        />
        <ListRow
          icon="star.fill"
          iconBg="#FF9500"
          label="Rewards"
          value="0 points"
          onClick={() => api.openApp('sys.rewards')}
        />
      </ListSection>

      <ListSection>
        <ListRow
          icon="hand.raised.fill"
          iconBg="#007AFF"
          label="Privacy"
          onClick={() => setPage('privacy')}
        />
        <ListRow
          icon="questionmark.circle.fill"
          iconBg="#8E8E93"
          label="Help"
          onClick={() => api.openApp('sys.help')}
        />
        <ListRow
          icon="info.circle.fill"
          iconBg="#8E8E93"
          label="About"
          onClick={() => setPage('about')}
        />
      </ListSection>
    </NavScreen>
  )
}
