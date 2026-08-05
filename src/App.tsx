import { useState } from 'react'
import { IntroScreen } from './apps/IntroScreen'
import { Device } from './ios/Device'
import type { ShellApi } from './ios/Device'
import { CartProvider } from './store/cart'
import { brandIdBySlug } from './data/brands'
import { SettingsProvider } from './store/settings'
import { appById } from './apps/registry'
import { BrandApp } from './apps/BrandApp'
import { CartApp } from './apps/CartApp'
import { OrdersApp } from './apps/OrdersApp'
import { SearchApp } from './apps/SearchApp'
import { AccountApp, HelpApp, RewardsApp } from './apps/SimpleApps'
import { SettingsApp } from './apps/SettingsApp'
import { PhoneApp } from './apps/PhoneApp'
import { ReserveApp } from './apps/ReserveApp'

/**
 * Routing table for the fake OS. An app id is either a brand id or `sys.*`.
 */
function renderApp(appId: string, api: ShellApi) {
  const app = appById(appId)
  if (!app) return null

  if (app.kind === 'brand') return <BrandApp brandId={app.brandId!} api={api} />

  switch (app.systemKey) {
    case 'cart':
      return <CartApp api={api} />
    case 'orders':
      return <OrdersApp api={api} />
    case 'search':
      return <SearchApp api={api} />
    case 'rewards':
      return <RewardsApp api={api} />
    case 'help':
      return <HelpApp api={api} />
    case 'account':
      return <AccountApp api={api} />
    case 'phone':
      return <PhoneApp api={api} />
    case 'settings':
      return <SettingsApp api={api} />
    case 'reserve':
      return <ReserveApp api={api} />
    default:
      return null
  }
}

export default function App() {
  /*
    The landing screen sits in front of the shell, not inside it — the home
    screen is the product, and it should not be paying to mount a page the
    customer is about to dismiss.

    `openOn` is how "Water" reaches past the intro: entering and opening Beasty
    H20 is one tap, not two.
  */
  const [entered, setEntered] = useState(false)
  const [openOn, setOpenOn] = useState<string | null>(null)

  if (!entered) {
    return (
      <IntroScreen
        onEnter={() => setEntered(true)}
        onWater={() => {
          setOpenOn(brandIdBySlug('beasty-h20'))
          setEntered(true)
        }}
      />
    )
  }

  return (
    <SettingsProvider>
      <CartProvider>
        <Device renderApp={renderApp} openOnMount={openOn} />
      </CartProvider>
    </SettingsProvider>
  )
}
