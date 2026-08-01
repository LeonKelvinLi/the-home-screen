import type { ReactNode } from 'react'
import { BRANDS } from '../data/brands'
import { BrandLogo } from '../ios/BrandLogo'
import { SystemIcon } from '../ios/SystemIcon'
import type { SystemGlyph } from '../ios/SystemIcon'
import { WaterIcon } from '../ios/WaterIcon'
import type { WaterGlyph } from '../ios/WaterIcon'

/**
 * The home screen is data. Adding a restaurant means adding a brand — no shell
 * changes — which is the property that lets vendors self-onboard later.
 */

export type SystemKey = 'cart' | 'orders' | 'rewards' | 'help' | 'search' | 'account'

export interface AppDef {
  id: string
  /** Full name, shown in the app switcher and in-app header. */
  name: string
  /** Home-screen label, already truncated the way iOS truncates. */
  label: string
  icon: ReactNode
  kind: 'brand' | 'system' | 'water'
  brandId?: string
  systemKey?: SystemKey
  waterGlyph?: WaterGlyph
  /** Drives the app-switcher card background and the in-app status bar. */
  tint: string
  /** True when the app's header is light and needs dark status-bar glyphs. */
  statusDark?: boolean
}

const SYSTEM: { key: SystemKey; name: string; label: string; glyph: SystemGlyph; tint: string }[] = [
  { key: 'cart', name: 'Cart', label: 'Cart', glyph: 'bag', tint: '#1B47D6' },
  { key: 'orders', name: 'Orders', label: 'Orders', glyph: 'receipt', tint: '#3A3EBD' },
  { key: 'rewards', name: 'Rewards', label: 'Rewards', glyph: 'star', tint: '#F06A00' },
  { key: 'help', name: 'Help', label: 'Help', glyph: 'help', tint: '#2C2C2E' },
  { key: 'search', name: 'Search', label: 'Search', glyph: 'search', tint: '#1DA345' },
  { key: 'account', name: 'Account', label: 'Account', glyph: 'person', tint: '#3F4A5A' },
]

export const BRAND_APPS: AppDef[] = BRANDS.map((b) => ({
  id: b.id,
  name: b.name,
  label: b.iconLabel,
  icon: <BrandLogo logo={b.logo} />,
  kind: 'brand' as const,
  brandId: b.id,
  tint: b.logo.bg.split('|')[0],
}))

export const SYSTEM_APPS: AppDef[] = SYSTEM.map((s) => ({
  id: `sys.${s.key}`,
  name: s.name,
  label: s.label,
  icon: <SystemIcon glyph={s.glyph} />,
  kind: 'system' as const,
  systemKey: s.key,
  tint: s.tint,
}))

/**
 * The dock belongs to the water business that operates this home screen — it is
 * the one row visible on every page, so it advertises the owner rather than the
 * platform. Cart and Orders move to page 2; the cart stays reachable from the
 * bar pinned inside every brand app, so nothing becomes unreachable.
 */
const WATER: { glyph: WaterGlyph; name: string; label: string; tint: string }[] = [
  { glyph: 'kangen', name: 'FREE Kangen', label: 'FREE Kangen', tint: '#0C7FC4' },
  { glyph: 'beasty', name: 'Beasty H2O Co', label: 'Beasty H2O', tint: '#22B8E6' },
  { glyph: 'scan', name: 'Share & Scan', label: 'Share & Scan', tint: '#111111' },
  { glyph: 'info', name: 'Info', label: 'Info', tint: '#0B0B0D' },
]

export const WATER_APPS: AppDef[] = WATER.map((w) => ({
  id: `h2o.${w.glyph}`,
  name: w.name,
  label: w.label,
  icon: <WaterIcon glyph={w.glyph} />,
  kind: 'water' as const,
  waterGlyph: w.glyph,
  tint: w.tint,
}))

export const ALL_APPS: AppDef[] = [...BRAND_APPS, ...SYSTEM_APPS, ...WATER_APPS]

export const appById = (id: string) => ALL_APPS.find((a) => a.id === id)

/** Page 1 is the restaurants. Page 2 is everything the platform itself owns. */
export const HOME_PAGES: AppDef[][] = [
  BRAND_APPS.slice(0, 16),
  [...BRAND_APPS.slice(16), ...SYSTEM_APPS],
]

export const DOCK_APPS: AppDef[] = WATER_APPS
