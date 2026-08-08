import type { ReactNode } from 'react'
import { BRANDS, brandById } from '../data/brands'
import { BrandLogo } from '../ios/BrandLogo'
import { CalendarIcon } from '../ios/CalendarIcon'
import { SystemIcon } from '../ios/SystemIcon'
import { SlotIcon } from '../ios/SlotIcon'
import { SQUIRCLE_100 } from '../ios/squircle'
import { GLYPHS } from '../data/glyphs'
import { categoriesFor } from '../data/slots'
import type { SystemGlyph } from '../ios/SystemIcon'

/**
 * The home screen is data. Adding a restaurant means adding a brand — no shell
 * changes — which is the property that lets vendors self-onboard later.
 */

export type SystemKey =
  | 'cart' | 'orders' | 'rewards' | 'help' | 'search' | 'account' | 'phone' | 'settings'
  | 'reserve' | 'designs' | 'share' | 'members' | 'calendar' | 'membercard'

export interface AppDef {
  id: string
  /** Full name, shown in the app switcher and in-app header. */
  name: string
  /** Home-screen label, as it appears on the operator's existing hub. */
  label: string
  icon: ReactNode
  kind: 'brand' | 'system'
  brandId?: string
  systemKey?: SystemKey
  /** Drives the app-switcher card background and the in-app status bar. */
  tint: string
  statusDark?: boolean
}

const SYSTEM: { key: SystemKey; name: string; label: string; glyph: SystemGlyph; tint: string }[] = [
  { key: 'cart', name: 'Cart', label: 'Cart', glyph: 'bag', tint: '#1B47D6' },
  { key: 'orders', name: 'Orders', label: 'Orders', glyph: 'receipt', tint: '#3A3EBD' },
  { key: 'rewards', name: 'Rewards', label: 'Rewards', glyph: 'star', tint: '#F06A00' },
  { key: 'help', name: 'Help', label: 'Help', glyph: 'help', tint: '#2C2C2E' },
  { key: 'search', name: 'Search', label: 'Search', glyph: 'search', tint: '#1DA345' },
  { key: 'account', name: 'Account', label: 'Account', glyph: 'person', tint: '#3F4A5A' },
  { key: 'settings', name: 'Settings', label: 'Settings', glyph: 'gear', tint: '#8E8E93' },
]

export const BRAND_APPS: AppDef[] = BRANDS.map((b) => ({
  id: b.id,
  name: b.name,
  label: b.iconLabel,
  icon: <BrandLogo logo={b.logo} fill />,
  kind: 'brand' as const,
  brandId: b.id,
  tint: b.logo.bg.split('|')[0],
}))

export const SYSTEM_APPS: AppDef[] = SYSTEM.map((s) => ({
  id: `sys.${s.key}`,
  name: s.name,
  label: s.label,
  icon: <SystemIcon glyph={s.glyph} fill />,
  kind: 'system' as const,
  systemKey: s.key,
  tint: s.tint,
}))

/**
 * Contact sits in the dock on the operator's existing hub as a `tel:` link, but
 * that link is `tel:+10000000000` — a placeholder. Rather than ship a dead dial
 * action it opens a screen that says the number is missing.
 */
const PHONE_APP: AppDef = {
  id: 'sys.phone',
  name: 'Phone',
  label: 'Phone',
  icon: <BrandLogo logo={{ imageUrl: '/icons/dock-phone.webp', bg: '#1FAF54', fg: '#fff' }} fill />,
  kind: 'system',
  systemKey: 'phone',
  tint: '#1FAF54',
}

/**
 * An empty slot: same silhouette as a real icon, unfilled, opening the reserve
 * screen. Every one is a live pitch to the next business — a food truck on a
 * goods page, a barber on a services one.
 */
export const makeSlot = (key: string | number): AppDef => {
  /*
    A slot id looks like `oakland-goods-5`: the city, WHICH of its two pages,
    and the position on it. Reading those back out is what lets a tile know it
    is the Italian spot without the page having to thread the category through
    — appById synthesises these on lookup, so there is nowhere else to carry it.

    The page word is not decoration. Both pages number their spots from zero, so
    a bare `oakland-5` is ambiguous the moment there are two lists, and the one
    it would resolve against is whichever happens to be first — a barber's spot
    labelled Italian. Read from the END, because a city slug has hyphens of its
    own (`san-jose-services-5`).
  */
  const parts = String(key).split('-')
  const n = Number(parts.pop())
  const cat = Number.isFinite(n) ? categoriesFor(parts.pop())?.[n] : undefined
  return {
    id: `slot.${key}`,
    name: cat ? `${cat.name} — spot available` : 'Reserve a Spot',
    label: cat ? cat.label : 'Available',
    icon: <SlotIcon fill />,
    kind: 'system',
    systemKey: 'reserve',
    tint: '#1C1C1E',
  }
}

/* Moved to data/cities.ts — plain data, so the landing page can read the count
   without dragging this file's icons and JSX into the first response. */
export { CITY_PAGES } from '../data/cities'

/*
  The Reserve screen as a destination, for anything that wants to open it
  without a blank tile being tapped — the landing page's join section does.

  Not in ALL_APPS and not on the grid: it must not become a home-screen icon.
  appById resolves any slot.* id, so this opens the same screen a blank tile
  does.
*/
export const RESERVE_APP_ID = 'slot.join'

/*
  BEASTY Designs — an app on the grid, not a button on the landing page.

  The mark is the drawn monitor-and-pencil glyph on the brand yellow, matching
  every other tile's squircle rather than being a system symbol in disguise.
*/
const DesignsIcon = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
    <defs>
      <clipPath id="clip-designs">
        <path d={SQUIRCLE_100} />
      </clipPath>
    </defs>
    <g clipPath="url(#clip-designs)">
      <rect width="100" height="100" fill="#f6d800" />
      <g transform="translate(50 50) scale(0.66) translate(-50 -50)">
        <path d={GLYPHS.design} fill="#141414" fillRule="evenodd" />
      </g>
      <path d={SQUIRCLE_100} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />
    </g>
  </svg>
)

export const DESIGNS_APP: AppDef = {
  id: 'sys.designs',
  name: 'BEASTY Designs',
  label: 'BEASTY Designs',
  icon: <DesignsIcon />,
  kind: 'system',
  systemKey: 'designs',
  tint: '#f6d800',
}
export const DESIGNS_APP_ID = DESIGNS_APP.id

/*
  Share & Scan. Lives in the dock, so it is not in the grid list either.
*/
/*
  A scan mark, not the "i" it borrowed.

  It shared the Info tile while it stood in that slot. Now that Info is back in
  its own place, two docked icons carrying the same picture would be a coin
  toss — so this draws what it does: framing corners around a code.
*/
const ScanIcon = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
    <defs>
      <clipPath id="clip-scan">
        <path d={SQUIRCLE_100} />
      </clipPath>
    </defs>
    <g clipPath="url(#clip-scan)">
      <rect width="100" height="100" fill="#141414" />
      {/* Framing corners — the universal "point a camera here" shape. */}
      <g fill="none" stroke="#f6d800" strokeWidth="6" strokeLinecap="round">
        <path d="M22 36V26a4 4 0 0 1 4-4h10" />
        <path d="M64 22h10a4 4 0 0 1 4 4v10" />
        <path d="M78 64v10a4 4 0 0 1-4 4H64" />
        <path d="M36 78H26a4 4 0 0 1-4-4V64" />
      </g>
      {/* A few modules, enough to read as a code without pretending to be one. */}
      <g fill="#ffffff">
        <rect x="36" y="36" width="11" height="11" rx="2" />
        <rect x="53" y="36" width="11" height="11" rx="2" />
        <rect x="36" y="53" width="11" height="11" rx="2" />
        <rect x="53" y="53" width="5" height="5" rx="1.5" />
        <rect x="59" y="59" width="5" height="5" rx="1.5" />
      </g>
      <path d={SQUIRCLE_100} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
    </g>
  </svg>
)

/*
  BEASTY members. On the grid, because a customer has to be able to find it —
  it is the operator's own product, not a business listed on the marketplace.
*/
const GemIcon = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
    <defs>
      <clipPath id="clip-members">
        <path d={SQUIRCLE_100} />
      </clipPath>
    </defs>
    <g clipPath="url(#clip-members)">
      <rect width="100" height="100" fill="#141414" />
      <g transform="translate(50 50) scale(2.4) translate(-12 -12)">
        <path d="M6.2 3h11.6l4.2 5.4-10 12.4L2 8.4Z" fill="#5AC8FA" />
        <path d="M6.2 3 2 8.4h20l-4.2-5.4Z" fill="#7FD9FF" />
        <path d="M12 20.8 2 8.4h20Z" fill="#39B3F0" />
      </g>
      <path d={SQUIRCLE_100} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
    </g>
  </svg>
)

export const MEMBERS_APP: AppDef = {
  id: 'sys.members',
  name: 'BEASTY members',
  label: 'Members',
  icon: <GemIcon />,
  kind: 'system',
  systemKey: 'members',
  tint: '#141414',
}

export const SHARE_APP: AppDef = {
  id: 'sys.share',
  name: 'Share & Scan',
  label: 'Share & Scan',
  icon: <ScanIcon />,
  kind: 'system',
  systemKey: 'share',
  tint: '#141414',
}

/**
 * The calendar, in the dock where the water droplet was.
 *
 * Water moved to key 6 of the landing dialer and to its own tile on the grid, so
 * the dock slot was carrying a second route to a page that already has two. The
 * calendar is what the operator wants there: the partners run one-day things —
 * a special, a pop-up, a market stall — and until now there was nowhere on the
 * app to say so, which meant the only way to find out was to walk past.
 */
const CALENDAR_APP: AppDef = {
  id: 'sys.calendar',
  name: 'Calendar',
  label: 'Calendar',
  icon: <CalendarIcon />,
  kind: 'system' as const,
  systemKey: 'calendar' as const,
  tint: '#E5433B',
}

/*
  Everything `appById` can resolve.

  A dock entry that is not in here renders as nothing: the home screen recedes,
  an empty window opens, and the customer is looking at a blank screen with no
  error anywhere. That is exactly what the calendar did until it was added —
  being in DOCK_APPS is what draws the icon, being in here is what makes it open.
*/
/*
  The member card. Reached from the membership screen rather than the grid —
  it is a thing you show, not a place you browse, and it only means anything
  once you have one.
*/
export const MEMBER_CARD_APP: AppDef = {
  id: 'sys.membercard',
  name: 'Member card',
  label: 'Card',
  icon: <GemIcon />,
  kind: 'system',
  systemKey: 'membercard',
  tint: '#f6d800',
}

export const ALL_APPS: AppDef[] = [
  ...BRAND_APPS,
  ...SYSTEM_APPS,
  PHONE_APP,
  DESIGNS_APP,
  SHARE_APP,
  MEMBERS_APP,
  MEMBER_CARD_APP,
  CALENDAR_APP,
]

/*
  Slot ids are generated per page at render time, so they cannot all be listed
  here. Synthesising one on lookup keeps a blank tile tappable no matter how
  many pages the grid ends up drawing — without it, tapping a tile on a blank
  page would resolve to nothing and the reserve screen would never open.
*/
export const appById = (id: string) =>
  ALL_APPS.find((a) => a.id === id) ?? (id.startsWith('slot.') ? makeSlot(id.slice(5)) : undefined)

/**
 * Page groups. Each group STARTS a new page; a long group spills onto further
 * pages of its own. This replaced one flat list because ordering alone could
 * not hold the split — page size is computed from the real grid, so on a wide
 * window the non-food entries simply flowed up onto page one.
 *
 * Page 1 is everything you can order food or drink from. Page 2 is everything
 * else. The cost is that a wide display no longer packs all 39 icons onto one
 * page: page one now ends after the last kitchen even if there is room left.
 * That is the point of the split, not a regression.
 */
/*
  Page 1 is what you can order food and drink from.

  `quoteOnly` has to be excluded as well as `contactOnly`: a software studio has
  a priced list and no contactOnly flag, so it read as orderable and landed on
  page one among the kitchens.
*/
const isOrderable = (a: AppDef) => {
  const b = brandById(a.id)
  return a.kind === 'brand' && !b?.contactOnly && !b?.quoteOnly
}

const CURIO = BRAND_APPS.filter((a) => a.id === 'b_curio')
const KITCHENS = BRAND_APPS.filter(isOrderable)
const OTHER_BRANDS = BRAND_APPS.filter((a) => !isOrderable(a) && a.id !== 'b_curio')

export const APP_GROUPS: AppDef[][] = [
  KITCHENS,
  // Curio is the LAST app, by the operator's instruction. The reserve slots
  // used to sit between it and the system apps, which buried it behind eight
  // blank tiles; they now live on the blank pages that follow instead.
  [MEMBERS_APP, ...OTHER_BRANDS, DESIGNS_APP, ...SYSTEM_APPS, ...CURIO],
]

/** Flat order, kept for anything that just wants every home-screen app. */
export const ORDERED_APPS: AppDef[] = APP_GROUPS.flat()

/**
 * Dock, carried over from the operator's hub: Phone, Water, Info, Gig Work.
 * It is the one row visible on every page, so it advertises the operator's own
 * businesses rather than the platform.
 *
 * The dock art is theirs; the destinations are the same ones the old site used.
 * "Info" pointing at the Share & Scan deli is the old site's own mapping, kept
 * deliberately — worth querying with the owner rather than silently changing.
 *
 * Four icons: Phone, Water, Info, Share & Scan. The old site's fourth was "Gig
 * Work" pointing at Sharetasking, which was removed as a non-food business;
 * Share & Scan takes that slot instead. These lookups use a non-null assertion,
 * so a dock entry naming a slug that no longer exists crashes the home screen.
 */
export const DOCK_APPS: AppDef[] = [
  PHONE_APP,
  CALENDAR_APP,
  /*
    Orders, not the old "Info" slot.

    Info pointed at the Share & Scan DELI, and putting it back next to the real
    Share & Scan gave the dock two buttons whose screens are both titled
    "Share & Scan" — the deli genuinely has that name. Worse, that deli is one
    of the ported entries whose menu nobody sourced, and the tile it used is
    Beasty H20's own marketing QR rather than a deli's logo.

    Orders is real, useful to a returning customer, and collides with nothing.
    The deli is untouched and still on the grid.
  */
  SYSTEM_APPS.find((a) => a.systemKey === 'orders')!,
  /*
    Share & Scan in the fourth slot, and it now IS share and scan: a QR code
    that takes anyone who scans it to the site, rather than the deli menu that
    used to sit under this name.
  */
  SHARE_APP,
]
