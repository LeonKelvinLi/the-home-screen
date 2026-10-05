import type { ReactNode } from 'react'
import { BRANDS, brandById } from '../data/brands'
import { BrandLogo } from '../ios/BrandLogo'
import { CategoryIcon } from '../ios/CategoryIcon'
import { CalendarIcon } from '../ios/CalendarIcon'
import { SystemIcon } from '../ios/SystemIcon'
import { SlotIcon } from '../ios/SlotIcon'
import { SQUIRCLE_100 } from '../ios/squircle'
import { GLYPHS } from '../data/glyphs'
import { ALL_PLACEMENTS } from '../data/categorySeats'
import { ALL_BEASTY_PAGES, PORTAL_KINDS, categoriesFor } from '../data/slots'
import type { SystemGlyph } from '../ios/SystemIcon'

/**
 * The home screen is data. Adding a restaurant means adding a brand — no shell
 * changes — which is the property that lets vendors self-onboard later.
 */

export type SystemKey =
  | 'cart' | 'orders' | 'rewards' | 'help' | 'search' | 'account' | 'phone' | 'settings'
  | 'reserve' | 'designs' | 'share' | 'members' | 'calendar' | 'membercard' | 'profile'
  | 'supply' | 'gallery' | 'watch' | 'join' | 'news' | 'affiliate'

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
  /** A business that travels to the customer. See MOBILE below. */
  mobile?: true
  /**
   * This business publishes no website at all.
   *
   * The operator's own words about them: "the ones without a web presence are
   * our 1st potential clients." So the grid marks them — a red ring, beside the
   * aqua one that means mobile — and he can read his prospect list straight off
   * the home screen instead of opening forty-five pages to find it.
   *
   * Derived from `site` rather than kept as a list. A second list would be a
   * second thing to forget, and it would disagree with the visible Website
   * button the day somebody added one.
   */
  noSite?: true
  /** The paid icon glow, Tier 3, or the Scan button's sweep. See LocalSeed.glow. */
  glow?: true | 'pink' | 'blue' | 'green' | 'white' | 'sweep'
  /**
   * Jump to a home-screen PAGE rather than open a window.
   *
   * The dock's BEASTY set points at the flagship sheets, and those are pages of
   * the home screen itself — there is no window to open. Named by the city a
   * Page carries, which is what HomeScreen already matches on for Search.
   */
  page?: string
  pageKind?: string
}

/**
 * Does this business come to you?
 *
 * The operator's problem, in his words: "I've seen a lot of Mobile businesses
 * but not sure what city to list them in." A mobile groomer has no city, so
 * whichever page it lands on is slightly a lie — and a customer scanning a
 * grid has no way to tell it apart from the shop next to it.
 *
 * READ FROM THE DESCRIPTOR rather than kept as a hand-maintained list. Every
 * one of these already says so in its own one-liner, because that line is
 * quoted from what the business calls itself: "Mobile dog grooming", "Mobile
 * car wash", "Mobile mini golf events". A second list would be a second thing
 * to forget to update, and it would disagree with the visible text the day
 * somebody did.
 */
const MOBILE = /\bmobile\b/i

const SYSTEM: { key: SystemKey; name: string; label: string; glyph: SystemGlyph; tint: string }[] = [
  { key: 'cart', name: 'Cart', label: 'Cart', glyph: 'bag', tint: '#1B47D6' },
  { key: 'orders', name: 'Orders', label: 'Orders', glyph: 'receipt', tint: '#3A3EBD' },
  { key: 'rewards', name: 'Rewards', label: 'Rewards', glyph: 'star', tint: '#F06A00' },
  { key: 'help', name: 'Help', label: 'Help', glyph: 'help', tint: '#2C2C2E' },
  { key: 'search', name: 'Search', label: 'Search', glyph: 'search', tint: '#1DA345' },
  { key: 'account', name: 'Account', label: 'Account', glyph: 'person', tint: '#3F4A5A' },
  { key: 'settings', name: 'Settings', label: 'Settings', glyph: 'gear', tint: '#8E8E93' },
  /* His idea of 2026-08-28. What a directory has news about is the directory
     changing — see data/news.ts, which is where an entry gets added. */
  { key: 'news', name: 'News', label: 'News', glyph: 'news', tint: '#141416' },
]

export const BRAND_APPS: AppDef[] = BRANDS.map((b) => ({
  id: b.id,
  name: b.name,
  label: b.iconLabel,
  icon: <BrandLogo logo={b.logo} fill />,
  kind: 'brand' as const,
  brandId: b.id,
  tint: b.logo.bg.split('|')[0],
  ...(MOBILE.test(b.cuisine) ? { mobile: true as const } : {}),
  /*
    No link at all, OR a link that is only a placeholder — both belong on his
    prospect list. See Brand.needsSite.

    THIS OUTLINE IS ONLY EVER AS GOOD AS THE `site` FIELD, which is a record of
    what we have LOOKED UP, not of what exists. On 2026-08-21 twenty-four of the
    outlined businesses were checked by hand and FIFTEEN of them had a perfectly
    good website — Vegan Mob, HotBoys, Gay Nineties, WinkyDinkyDogs and eleven
    more. The operator uses this outline to decide who to pitch, so every one of
    those was a wasted call waiting to happen, and any mail-merge opening with
    "I noticed you don't have a website" would have been wrong three times in
    five.

    All fifteen now carry a verified site and have dropped off. The ones left
    are either checked-and-genuinely-siteless or NOT YET CHECKED — and the
    honest thing is that the tile cannot tell those two apart. Check before
    pitching.

    An owner's own page is never outlined (Janelle's, since its one link came
    off on 2026-09-21): the list is who to pitch. See LocalSeed.beastyOwner.
  */
  ...((b.site && !b.needsSite) || b.beastyOwner ? {} : { noSite: true as const }),
  ...(b.glow ? { glow: b.glow } : {}),
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

/**
 * The app for a slot: the business that has taken it, or the empty outline.
 *
 * City pages call this instead of makeSlot so that a claimed spot draws the
 * real business — its logo, its name, opening its real page — while every
 * unclaimed one stays a dashed outline. An id in the placements map that
 * matches no known brand falls back to the empty tile rather than throwing:
 * a typo should leave a spot looking unsold, not take the home screen down.
 */
export const appForSlot = (key: string | number): AppDef => {
  const claimed = ALL_PLACEMENTS[String(key)]
  if (claimed) {
    const app = ALL_APPS.find((a) => a.id === claimed)
    if (app) return app
    if (import.meta.env.DEV) {
      console.warn(`[placements] ${key} points at unknown brand ${claimed}; drawing an empty spot`)
    }
  }
  return makeSlot(key)
}

/*
  The Reserve screen as a destination, for anything that wants to open it
  without a blank tile being tapped — the landing page's join section does.

  Not in ALL_APPS and not on the grid: it must not become a home-screen icon.
  appById resolves any slot.* id, so this opens the same screen a blank tile
  does.
*/
export const RESERVE_APP_ID = 'slot.join'

/*
  BEASTY Designs — in the dock, at the operator's instruction.

  BLACK TILE, YELLOW MARK, his ask, and it is the right way round for the dock:
  the yellow-on-black inverts the old black-on-yellow, which read as a bright
  slab next to Phone's white and the Scan tile's black. The glyph is the drawn
  monitor-and-pencil, clipped to the same squircle as every other tile.

  The hairline edge flips too. A 10%-black stroke was drawn to keep a yellow
  tile off a light wallpaper; on a black tile it is invisible, so it becomes a
  low white one for the same job.
*/
const DesignsIcon = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
    <defs>
      <clipPath id="clip-designs">
        <path d={SQUIRCLE_100} />
      </clipPath>
      <linearGradient id="designs-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1E1E22" />
        <stop offset="1" stopColor="#0C0C0E" />
      </linearGradient>
    </defs>
    <g clipPath="url(#clip-designs)">
      <rect width="100" height="100" fill="url(#designs-bg)" />
      <g transform="translate(50 50) scale(0.66) translate(-50 -50)">
        <path d={GLYPHS.design} fill="#f6d800" fillRule="evenodd" />
      </g>
      <path d={SQUIRCLE_100} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
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

/**
 * The sign-up screen.
 *
 * Not on the home grid and not in the dock: it is reached from the gate prompt
 * and from the members screen. A visitor who has not hit a locked door has no
 * reason to be asked for their email, and an icon that says "sign up" on a
 * screen they are free to browse reads as a wall.
 */
export const JOIN_APP: AppDef = {
  id: 'sys.join',
  /* One screen does both, so it cannot be called after only one of them.
     Named "Sign up" it told a returning member the app had no way back in. */
  name: 'Sign in or join',
  label: 'Sign in',
  icon: <GemIcon />,
  kind: 'system',
  systemKey: 'join',
  tint: '#141416',
}

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
/** A head and shoulders on the tile, in the app's flat icon language. */
/*
  Sized and clipped like every other tile, which it was not.

  It carried width="100" height="100" as attributes, so it rendered at a fixed
  100px whatever size the grid asked for — on the system page it stood visibly
  larger than its neighbours and broke the row. And it used rx="22", a plain
  rounded rectangle, in an app where every single other tile is the superellipse
  in squircle.ts. One wrong corner among forty right ones is exactly the kind
  of thing that reads as generic.
*/
function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="profg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E1E22" />
          <stop offset="1" stopColor="#0C0C0E" />
        </linearGradient>
        <clipPath id="clip-profile">
          <path d={SQUIRCLE_100} />
        </clipPath>
      </defs>
      {/*
        Black and brand yellow, matching Designs and Scan.

        It was the last stock-iOS blue in the app — a borrowed system colour
        sitting among tiles that are otherwise either a real business's own
        mark or drawn in this product's language, which is exactly what makes
        a set look assembled rather than designed. Yellow on this black is
        about 15:1.
      */}
      <g clipPath="url(#clip-profile)">
        <rect width="100" height="100" fill="url(#profg)" />
        <circle cx="50" cy="41" r="14" fill="#F6D800" />
        <path d="M24 80a26 26 0 0 1 52 0Z" fill="#F6D800" />
        <path d={SQUIRCLE_100} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      </g>
    </svg>
  )
}

export const MEMBER_CARD_APP: AppDef = {
  id: 'sys.membercard',
  name: 'Member card',
  label: 'Card',
  icon: <GemIcon />,
  kind: 'system',
  systemKey: 'membercard',
  tint: '#f6d800',
}

/*
  Someone's own profile — where they have been and what they liked.

  On the grid rather than buried in Settings, because the operator's whole idea
  for it is that it is a page OTHER people look at. A profile you have to go
  hunting for is a profile nobody fills in.
*/
export const PROFILE_APP: AppDef = {
  id: 'sys.profile',
  name: 'Profile',
  label: 'Profile',
  icon: <ProfileIcon />,
  kind: 'system',
  systemKey: 'profile',
  tint: '#141416',
}

/*
  THE AFFILIATE DASHBOARD, opened from Profile (Glenn's "user/affiliate
  dashboard", September 2026). On no grid: it is a member's own page, reached
  from their Profile, like the sign-up screen is reached from the gate.
*/
const AffiliateIcon = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
    <rect width="100" height="100" fill="#141416" />
    <rect x="22" y="56" width="12" height="22" rx="3" fill="#fff" />
    <rect x="44" y="42" width="12" height="36" rx="3" fill="#fff" />
    <rect x="66" y="26" width="12" height="52" rx="3" fill="#F6D800" />
  </svg>
)

export const AFFILIATE_APP: AppDef = {
  id: 'sys.affiliate',
  name: 'Affiliate dashboard',
  label: 'Affiliate',
  icon: <AffiliateIcon />,
  kind: 'system',
  systemKey: 'affiliate',
  tint: '#141416',
}

/** The BEASTY Supply Co tile: his Shopify store, in the dock's BEASTY set. */
const SupplyIcon = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
    <rect width="100" height="100" fill="#111" />
    <path
      d="M28 36h44l4 40H24l4-40Z"
      fill="none"
      stroke="#FFE63D"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path d="M39 43V32a11 11 0 0 1 22 0v11" fill="none" stroke="#FFE63D" strokeWidth="6" strokeLinecap="round" />
  </svg>
)

export const SUPPLY_APP: AppDef = {
  id: 'sys.supply',
  name: 'BEASTY Supply Co',
  label: 'Supply Co',
  icon: <SupplyIcon />,
  kind: 'system',
  systemKey: 'supply',
  tint: '#111111',
}

/**
 * BEASTY · Goods, the flagship sheet — a PAGE, not a window.
 *
 * It carries `page` rather than a systemKey because there is nothing to open:
 * the destination is the first page of the home screen the dock is sitting on.
 */
/**
 * Biggie's gallery — the window beside the home button.
 *
 * Drawn rather than taken from the stock sheet he sent: a frame with a horizon
 * and a sun, which is the picture-gallery convention he pointed at, in the flat
 * single-weight language the rest of this app's chrome already speaks.
 */
const GalleryIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.6" y="4.2" width="18.8" height="15.6" rx="3.2" />
    <circle cx="16.1" cy="9.4" r="1.9" fill="currentColor" stroke="none" />
    <path d="M3.4 16.6l4.9-5.2 4.4 4.6 2.6-2.4 4.6 4.4" strokeLinecap="round" />
  </svg>
)

export const GALLERY_APP: AppDef = {
  id: 'sys.gallery',
  name: 'Biggie',
  label: 'Biggie',
  icon: <GalleryIcon />,
  kind: 'system',
  systemKey: 'gallery',
  tint: '#141416',
}

/** Watch — a play head in a frame, beside the gallery. */
const WatchIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
       strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.6" y="4.6" width="18.8" height="14.8" rx="3.2" />
    <path d="M10.2 9.4l5.2 3.1-5.2 3.1V9.4Z" fill="currentColor" stroke="none" />
  </svg>
)

export const WATCH_APP: AppDef = {
  id: 'sys.watch',
  name: 'Watch',
  label: 'Watch',
  icon: <WatchIcon />,
  kind: 'system',
  systemKey: 'watch',
  tint: '#0b0b0d',
}

export const GOODS_APP: AppDef = {
  id: 'sys.goods',
  name: 'BEASTY Goods',
  label: 'BSTY Goods',
  icon: <BrandLogo logo={{ imageUrl: '/apple-touch-icon.png', bg: '#FFE63D', fg: '#111' }} fill />,
  kind: 'system',
  tint: '#FFE63D',
  statusDark: true,
  page: 'BEASTY',
}

/** Twenty-four category doors on BEASTY · Pages; every other page remains in Search. */
export const CATEGORY_PORTAL_APPS: AppDef[] = PORTAL_KINDS.map((kind) => {
  const page = ALL_BEASTY_PAGES.find((p) => p.kind === kind)!
  return {
    id: `page.${kind}`, name: `BEASTY · ${page.heading}`, label: page.heading,
    kind: 'system', pageKind: kind, tint: '#18212C',
    icon: <CategoryIcon kind={kind} />,
  }
})

export const ALL_APPS: AppDef[] = [
  ...BRAND_APPS,
  ...SYSTEM_APPS,
  ...CATEGORY_PORTAL_APPS,
  PHONE_APP,
  DESIGNS_APP,
  SHARE_APP,
  MEMBERS_APP,
  MEMBER_CARD_APP,
  CALENDAR_APP,
  PROFILE_APP,
  SUPPLY_APP,
  GOODS_APP,
  GALLERY_APP,
  WATCH_APP,
  /* Reachable by id even though it is on no grid: the gate prompt opens it. */
  JOIN_APP,
  /* Likewise: Profile opens it. */
  AFFILIATE_APP,
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
  The old page one — every orderable kitchen in catalogue order — is gone, by
  the operator's instruction: "the home screen will have just BEASTY • GOODS
  (1st 24) … BEASTY • SERVICES (1st 24)", each with a yellow page behind it.
  Those flagship pages are built in HomeScreen from his numbered roster via
  the placements map, so a brand seated there (or on a city page) would show
  twice if it also stayed here.

  What remains on this page is everything WITHOUT a seat: the system apps,
  and the few brands neither on his roster nor placed in a city. Roster-only
  name seeds are excluded outright — their tile IS their seat.
*/
const SEATED = new Set(Object.values(ALL_PLACEMENTS))
const OTHER_BRANDS = BRAND_APPS.filter((a) => {
  if (SEATED.has(a.id)) return false
  return !brandById(a.id)?.rosterOnly
})

/*
  THE SYSTEM PAGE IS BEING EMPTIED, on his 2026-08-18 instruction: "I'm slowly
  trying to get rid of this page." He sent it back with red crosses on thirteen
  tiles, and they leave by three different routes.

  MOVED TO THE DOCK — Profile, Help, Account and Settings. Not deleted: the dock
  is on every page and a grid tile is on one, so these are more reachable now
  than they were. See DOCK_SETS.

  MOVED TO A CITY — Hybrid Workz, Baked Blooms, Boba, Waffles & Cream, LOL
  Catering, Noctilucente and Alli's Dog Walking, each to the page he named.
  Nothing here excludes them: this page draws every brand WITHOUT a seat, so
  giving them one in data/placements.ts is what takes them off it.

  RETIRED — the four in RETIRED below, crossed out with nowhere to go.

  Cart, Orders, Rewards and Search are gone from the grid outright. Cart and
  Orders still OPEN — checkout pushes you to Orders, and the cart bar appears
  when there is something in it — they simply no longer hold a tile of their
  own. Search is the pill above the dock and always was.
*/
const RETIRED = new Set([
  'b_wildforkfoods',
  'b_bossburgers',
  /* The brand keeps its page and its dock tile in the BEASTY set; only the
     grid tile goes. */
  'b_beastyh20',
  'b_sharescan',
])

/*
  Curio's standing "stays LAST" instruction is moot now: it has a seat on the
  BEASTY services sheet, so it is not on this page at all. The special case that
  held it back from OTHER_BRANDS goes with it — a seated brand belongs to its
  seat, and keeping the exception would have drawn Curio twice.
*/
export const APP_GROUPS: AppDef[][] = [
  [...OTHER_BRANDS.filter((a) => !RETIRED.has(a.id))],
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
const byId = (id: string): AppDef => {
  const found = BRAND_APPS.find((a) => a.id === id)
  /* Loud rather than blank: a dock entry naming a brand that no longer exists
     would otherwise draw an empty square and open nothing. */
  if (!found) throw new Error(`DOCK_SETS names a brand that does not exist: ${id}`)
  return found
}

/** The News tile, by id — SYSTEM_APPS is built from a list, not named exports. */
const newsApp = (): AppDef => {
  const found = SYSTEM_APPS.find((a) => a.id === 'sys.news')
  if (!found) throw new Error('DOCK_SETS names sys.news and it is not registered')
  return found
}

/**
 * The dock, in three sets of four, switched by the round buttons beside Search.
 *
 * His design, sent 2026-08-18: "Add 3 round buttons to the right of Search bar
 * on Home Screen. Default is 1. When 2 or 3 is pressed it will flip to that set
 * of 4 icons."
 *
 * This is what empties the system page. Profile, Help, Account and Settings all
 * used to be tiles on it and he crossed every one of them out — not because
 * they are going away, but because the dock is on EVERY page and a grid tile is
 * only on one. Twelve slots that follow the customer around are worth more than
 * twelve that have to be found.
 *
 * A set is four, always. The row is a fixed piece of furniture at the bottom of
 * the screen, and a set of three or five would resize the thing that is meant
 * to be the one constant on the page.
 */
export const DOCK_SETS: { key: string; name: string; apps: AppDef[] }[] = [
  /*
    HIS ORDER, 2026-08-25: "move the BEASTY designs to 2. Contact to 1."

    Contact takes the first slot and Designs keeps the second. Profile and
    Calendar shift right behind them; Share & Scan comes off, because the dock
    holds four and this is the set he looks at most. Sharing is still on the
    keypad's # key and on every business page's own Share button, so nothing
    became unreachable — it stopped being one of the four he sells from.

    Contact first is also the change that matters now that it works: until
    today it read "Not connected yet" on both rows, and a first slot pointing
    at a dead line is worse than not having it there.
  */
  /*
    HIS ORDER, in two messages on 2026-08-25.

    "move the BEASTY designs to 2. Contact to 1." then, seeing the result,
    "you can put the share button back where it was before" — before being
    slot 4, which is where it sat until Contact arrived and pushed the row
    along.

    The dock holds four, so putting Share back costs one. CALENDAR GOES, not
    Profile: Profile is where a member's QR and referral code live and the
    whole membership is sold on sharing that code, while the calendar is the
    least load-bearing of the four. It is still on the home grid.
  */
  /*
    HIS ORDER, WRITTEN OUT, 2026-08-28:

      "1. News, profile, calendar, QR share
       2. Leave as is
       3. Leave as is"

    Left to right, in that order. Two earlier passes at this put News third and
    then kept Designs in the row, neither of which is what he asked for.

    DESIGNS LEAVES SET 1 and Calendar takes the third slot. Designs is still in
    set 2, where he put it himself ("you can put BEASTY designs in place of the
    BEASTY pages icon"), and still on the home grid; it is the dock slot it
    loses. Calendar comes back for a reason he gave: the News page has a button
    through to the calendar, and an affiliate posting about a future event puts
    that event on it, so the two belong next to each other.

    Phone is back in set 3, where it was before any of this.
  */
  { key: 'you', name: 'Your stuff', apps: [newsApp(), PROFILE_APP, CALENDAR_APP, SHARE_APP] },
  {
    key: 'beasty',
    name: 'BEASTY',
    /* His four: BSTY Goods, BEASTYh2o, EAT (coming soon), BEASTYSupplyCo.
       EAT carries no "coming soon" on the tile because the dock hides labels —
       its own page already says he is still gathering the details. */
    /*
      DESIGNS TAKES THE FIRST SLOT, his instruction on 2026-08-25: "you can put
      BEASTY designs in place of the BEASTY pages icon."

      The icon that was there is BEASTY Goods, drawn on the app's own
      apple-touch-icon — which is why he read it as the BEASTY PAGES mark: it
      is literally the site's own icon, sitting in his product dock among four
      of his brands and looking like the app rather than like a product.

      BEASTY Goods keeps its place in ALL_APPS and on the home grid; it is the
      dock slot it loses, and Designs is a thing he sells.
    */
    apps: [DESIGNS_APP, byId('b_beastyh20'), byId('b_eat'), SUPPLY_APP],
  },
  { key: 'help', name: 'Help', apps: [PHONE_APP, ...SYSTEM_APPS.filter((a) =>
      ['sys.account', 'sys.help', 'sys.settings'].includes(a.id))
      .sort((a, b) => ['sys.account', 'sys.help', 'sys.settings'].indexOf(a.id) -
        ['sys.account', 'sys.help', 'sys.settings'].indexOf(b.id))] },
]

/** The set the home screen opens on — his "Default is 1". */
export const DOCK_APPS: AppDef[] = DOCK_SETS[0].apps

