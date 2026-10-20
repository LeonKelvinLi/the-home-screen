import { Device } from './ios/Device'
import { GalleryApp } from './apps/GalleryApp'
import { VideoApp } from './apps/VideoApp'
import type { ShellApi } from './ios/Device'
import { CartProvider } from './store/cart'
import { SettingsProvider } from './store/settings'
import { appById } from './apps/registry'
import { BrandApp } from './apps/BrandApp'
import { CartApp } from './apps/CartApp'
import { OrdersApp } from './apps/OrdersApp'
import { SearchApp } from './apps/SearchApp'
import { NewsApp } from './apps/NewsApp'
import { AccountApp, HelpApp, RewardsApp, SupplyApp } from './apps/SimpleApps'
import { SettingsApp } from './apps/SettingsApp'
import { PhoneApp } from './apps/PhoneApp'
import { ReserveApp } from './apps/ReserveApp'
import { DesignsApp } from './apps/DesignsApp'
import { ShareApp } from './apps/ShareApp'
import { JoinApp } from './apps/JoinApp'
import { AffiliateApp } from './apps/AffiliateApp'
import { MembersApp } from './apps/MembersApp'
import { CalendarApp } from './apps/CalendarApp'
import { MemberCardApp } from './apps/MemberCardApp'
import { ProfileApp } from './apps/ProfileApp'
import { FindFriendsApp } from './apps/FindFriends'

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
    case 'news':
      return <NewsApp api={api} />
    case 'help':
      return <HelpApp api={api} />
    case 'account':
      return <AccountApp api={api} />
    case 'phone':
      return <PhoneApp api={api} />
    case 'settings':
      return <SettingsApp api={api} />
    case 'reserve':
      return <ReserveApp api={api} seat={appId.startsWith('slot.') ? appId.slice(5) : undefined} />
    case 'designs':
      return <DesignsApp api={api} />
    case 'share':
      return <ShareApp api={api} />
    case 'join':
      return <JoinApp api={api} />
    case 'friends':
      return <FindFriendsApp api={api} />
    case 'members':
      return <MembersApp api={api} />
    case 'calendar':
      return <CalendarApp api={api} />
    case 'membercard':
      return <MemberCardApp api={api} />
    case 'profile':
      return <ProfileApp api={api} />
    case 'affiliate':
      return <AffiliateApp api={api} />
    case 'supply':
      return <SupplyApp api={api} />
    case 'gallery':
      return <GalleryApp api={api} />
    case 'watch':
      return <VideoApp api={api} />
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
