import { Device } from './ios/Device'
import type { ShellApi } from './ios/Device'
import { CartProvider } from './store/cart'
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
import { DesignsApp } from './apps/DesignsApp'
import { ShareApp } from './apps/ShareApp'
import { MembersApp } from './apps/MembersApp'
import { CalendarApp } from './apps/CalendarApp'
import { MemberCardApp } from './apps/MemberCardApp'
import { ProfileApp } from './apps/ProfileApp'
import { LISTED_KITCHENS } from './data/brands'
import { PARTNER_COUNT } from './data/cities'

/*
  The landing page quotes PARTNER_COUNT rather than reading this list, because
  reading it would cost the first response the whole catalogue. This is the only
  place that has both, so it is where they get compared — a wrong number in the
  pitch to a prospective business is exactly the kind of stale constant nobody
  notices.
*/
/*
  Not DEV-only any more. This drifted to 13 against a real 12 and shipped that
  way, because the only thing watching was a warning nobody runs a dev server to
  see. One integer comparison at module load is worth a wrong number in the
  pitch showing up in a production log.
*/
if (LISTED_KITCHENS.length !== PARTNER_COUNT) {
  console.warn(
    `PARTNER_COUNT is ${PARTNER_COUNT} but there are ${LISTED_KITCHENS.length} listed partners. ` +
      'Update PARTNER_COUNT in src/data/cities.ts.',
  )
}

/**
 * Everything behind the landing page: the fake OS, every app, and the whole
 * catalogue.
 *
 * Split out of App so it can be loaded on its own. This file pulls in the
 * shell, twelve apps, the brand data and the glyph set — 270KB of JavaScript
 * that a customer used to download before they had seen anything, while
 * looking at a page that needs none of it.
 */

/** Routing table for the fake OS. An app id is either a brand id or `sys.*`. */
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
    case 'designs':
      return <DesignsApp api={api} />
    case 'share':
      return <ShareApp api={api} />
    case 'members':
      return <MembersApp api={api} />
    case 'calendar':
      return <CalendarApp api={api} />
    case 'membercard':
      return <MemberCardApp api={api} />
    case 'profile':
      return <ProfileApp api={api} />
    default:
      return null
  }
}

export default function Shell({ openOn }: { openOn: string | null }) {
  return (
    <SettingsProvider>
      <CartProvider>
        <Device renderApp={renderApp} openOnMount={openOn} />
      </CartProvider>
    </SettingsProvider>
  )
}
