import type { ReactNode } from 'react'
import { BRANDS, brandById } from '../data/brands'
import { BrandLogo } from '../ios/BrandLogo'
import { SystemIcon } from '../ios/SystemIcon'
import { SlotIcon } from '../ios/SlotIcon'
import { SQUIRCLE_100 } from '../ios/squircle'
import { GLYPHS } from '../data/glyphs'
import type { SystemGlyph } from '../ios/SystemIcon'

/**
 * The home screen is data. Adding a restaurant means adding a brand — no shell
 * changes — which is the property that lets vendors self-onboard later.
 */

export type SystemKey =
  | 'cart' | 'orders' | 'rewards' | 'help' | 'search' | 'account' | 'phone' | 'settings'
  | 'reserve' | 'designs'

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
 * screen. Every one is a live pitch to the next food truck.
 */
export const makeSlot = (key: string | number): AppDef => ({
  id: `slot.${key}`,
  name: 'Reserve a Spot',
  label: 'Available',
  icon: <SlotIcon fill />,
  kind: 'system',
  systemKey: 'reserve',
  tint: '#1C1C1E',
})

/**
 * Blank pages after the last app, by the operator's instruction.
 *
 * A COUNT of pages, not of tiles, because a page holds however many icons the
 * device's grid fits — four columns on a phone, eight on a wide window. The
 * grid is measured at runtime, so HomeScreen fills these; the registry only
 * says how many there are.
 */
export const BLANK_PAGES = 4

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

export const ALL_APPS: AppDef[] = [...BRAND_APPS, ...SYSTEM_APPS, PHONE_APP, DESIGNS_APP]

/*
  Slot ids are generated per page at render time, so they cannot all be listed
  here. Synthesising one on lookup keeps a blank tile tappable no matter how
  many pages the grid ends up drawing — without it, tapping a tile on a blank
  page would resolve to nothing and the reserve screen would never open.
*/
export const appById = (id: string) =>
  ALL_APPS.find((a) => a.id === id) ?? (id.startsWith('slot.') ? makeSlot(id.slice(5)) : undefined)

const brand = (slug: string) => BRAND_APPS.find((a) => a.id === `b_${slug}`)

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
  [...OTHER_BRANDS, DESIGNS_APP, ...SYSTEM_APPS, ...CURIO],
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
 * Three icons, not four: the old site's fourth was "Gig Work" pointing at
 * Sharetasking, which has been removed as a non-food business. Restoring it
 * means restoring that brand — these lookups use a non-null assertion, so a
 * dock entry naming a slug that no longer exists crashes the home screen.
 */
export const DOCK_APPS: AppDef[] = [
  PHONE_APP,
  {
    ...brand('beastyh20')!,
    label: 'Water',
    icon: <BrandLogo logo={{ imageUrl: '/icons/dock-water.webp', bg: '#2C8ED6', fg: '#fff' }} fill />,
  },
  {
    ...brand('sharescan')!,
    label: 'Info',
    icon: <BrandLogo logo={{ imageUrl: '/icons/dock-info.webp', bg: '#111111', fg: '#fff' }} fill />,
  },
]
