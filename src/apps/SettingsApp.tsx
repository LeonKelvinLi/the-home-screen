import { useState } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'
import { ListRow, ListSection, Switch } from '../ios/ui/List'
import { BRANDS } from '../data/brands'
import { useSettings } from '../store/settings'
import { useCart, money } from '../store/cart'
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
        <ListSection footer="Applied when you open the cart. You can still change it on any order.">
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
          footer="Delivery adds a fee and about twelve minutes. Pickup counters are listed on your order."
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
          <ListRow
            label="Round Up"
            detail="Round the total to the next dollar"
            accessory={
              <Switch on={s.roundUp} onChange={(v) => s.set('roundUp', v)} label="Round up" />
            }
          />
        </ListSection>

        <ListSection footer="Dietary tags come from each kitchen and are not verified. Always tell them about an allergy.">
          <ListRow
            label="Show Dietary Tags"
            accessory={
              <Switch
                on={s.showDietary}
                onChange={(v) => s.set('showDietary', v)}
                label="Show dietary tags"
              />
            }
          />
        </ListSection>
      </NavScreen>
    )
  }

  if (page === 'privacy') {
    return (
      <NavScreen title="Privacy" backTitle="Settings" onBack={() => setPage('root')}>
        <ListSection footer="Your cart and order history are stored on this device only. Nothing is sent anywhere until ordering goes live.">
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
          footer="Ordering is not connected yet. Orders you place are saved on this device and no kitchen receives them."
        >
          <ListRow label="Ordering" value="Preview" chevron={false} />
          <ListRow label="Payments" value="Not connected" chevron={false} />
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
          icon="bell.badge.fill"
          iconBg="#FF3B30"
          label="Order Updates"
          accessory={
            <Switch
              on={s.orderUpdates}
              onChange={(v) => s.set('orderUpdates', v)}
              label="Order updates"
            />
          }
        />
        <ListRow
          icon="speaker.wave.2.fill"
          iconBg="#FF2D55"
          label="Haptics"
          accessory={
            <Switch on={s.haptics} onChange={(v) => s.set('haptics', v)} label="Haptics" />
          }
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
          value={cart.count > 0 ? money(cart.totals.subtotal) : '0 points'}
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
