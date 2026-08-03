import type { ReactNode } from 'react'
import { BRANDS } from '../data/brands'
import { OPEN_SLOTS } from '../lib/api'
import { BrandLogo } from '../ios/BrandLogo'
import { SystemIcon } from '../ios/SystemIcon'
import { SlotIcon } from '../ios/SlotIcon'
import type { SystemGlyph } from '../ios/SystemIcon'

/**
 * The home screen is data. Adding a restaurant means adding a brand — no shell
 * changes — which is the property that lets vendors self-onboard later.
 */

export type SystemKey =
  | 'cart' | 'orders' | 'rewards' | 'help' | 'search' | 'account' | 'phone' | 'settings'
  | 'reserve'

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
  icon: <BrandLogo logo={{ imageUrl: '/icons/dock-phone.png', bg: '#1FAF54', fg: '#fff' }} fill />,
  kind: 'system',
  systemKey: 'phone',
  tint: '#1FAF54',
}

/**
 * Empty slots close the last page. Every one is a live pitch to the next food
 * truck: same silhouette as a real icon, unfilled, opening the reserve screen.
 * They sit last so a customer never wades through them to reach a kitchen.
 */
export const SLOT_APPS: AppDef[] = Array.from({ length: OPEN_SLOTS }, (_, i) => ({
  id: `slot.${i}`,
  name: 'Reserve a Spot',
  label: 'Available',
  icon: <SlotIcon fill />,
  kind: 'system' as const,
  systemKey: 'reserve' as const,
  tint: '#1C1C1E',
}))

export const ALL_APPS: AppDef[] = [...BRAND_APPS, ...SYSTEM_APPS, PHONE_APP, ...SLOT_APPS]

export const appById = (id: string) => ALL_APPS.find((a) => a.id === id)

const brand = (slug: string) => BRAND_APPS.find((a) => a.id === `b_${slug}`)

/**
 * One ordered list. The home screen paginates it against the real grid, so a
 * phone gets 4x6 across two pages and an iPad-width window gets 8 columns on
 * one — rather than a fixed 16-per-page that leaves a desktop half empty.
 */
export const ORDERED_APPS: AppDef[] = [...BRAND_APPS, ...SYSTEM_APPS, ...SLOT_APPS]

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
    icon: <BrandLogo logo={{ imageUrl: '/icons/dock-water.png', bg: '#2C8ED6', fg: '#fff' }} fill />,
  },
  {
    ...brand('sharescan')!,
    label: 'Info',
    icon: <BrandLogo logo={{ imageUrl: '/icons/dock-info.png', bg: '#111111', fg: '#fff' }} fill />,
  },
]
