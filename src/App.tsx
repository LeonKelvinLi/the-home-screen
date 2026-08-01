import { Device } from './ios/Device'
import type { ShellApi } from './ios/Device'
import { CartProvider } from './store/cart'
import { appById } from './apps/registry'
import { BrandApp } from './apps/BrandApp'
import { CartApp } from './apps/CartApp'
import { OrdersApp } from './apps/OrdersApp'
import { SearchApp } from './apps/SearchApp'
import { AccountApp, ContactApp, HelpApp, RewardsApp } from './apps/SimpleApps'

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
    case 'contact':
      return <ContactApp api={api} />
    default:
      return null
  }
}

export default function App() {
  return (
    <CartProvider>
      <Device renderApp={renderApp} />
    </CartProvider>
  )
}
