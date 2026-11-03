/*
  Who reviewed what, from the two sources in foodies.ts: every film on a
  business page made by a creator (`clip.by`), and OTHER_REVIEWS. One list per
  creator (their BEASTY • Foodies page) and one per business (the "Foodie
  reviews" drop-down on its page: "If someone search that restaurant, will they
  be able to see the five different foodies that reviewed that restaurant on a
  list?").
*/
import { BRANDS } from './brands'
import type { Brand } from './brands'
import { FOODIE_PAGES, OTHER_REVIEWS, reviewPostCode } from './foodies'

export interface Review {
  /** The creator's Instagram handle, no @. */
  by: string
  /** The creator's own name for themselves, where BEASTY knows it. */
  byName?: string
  place: string
  city?: string
  /** The business on BEASTY it is about, when it is one. */
  brand?: Brand
  /** The post on Instagram. */
  href: string
  /** A copy BEASTY plays, when the review is the film on that business's page. */
  src?: string
  poster?: string
  /** Original reviewer and posting-account credit for a repost. */
  credit?: string
}

/* Accounts that posted a business's own film: they are the business, not a reviewer. */
const NOT_A_REVIEWER = new Set(['bollywoodpizzausa', 'marketing_kings'])

const byId = new Map(BRANDS.map((b) => [b.id, b]))
const nameOf = new Map(FOODIE_PAGES.flatMap((f) => [[f.handle, f.name] as const, ...(f.instagram ? [[f.instagram, f.name] as const] : [])]))
const stableHandle = (handle: string) => FOODIE_PAGES.find((f) => f.handle === handle || f.instagram === handle)?.handle ?? handle
const cityOf = (b: Brand) => (b.address?.match(/,\s*([^,]+),\s*CA\b/)?.[1] ?? undefined)

const ALL: Review[] = [
  ...BRANDS.filter((b) => b.clip?.by && !NOT_A_REVIEWER.has(b.clip.by) && b.clip.href).map((b) => ({
    by: b.clip!.by!,
    byName: nameOf.get(b.clip!.by!),
    place: b.name,
    city: cityOf(b),
    brand: b,
    href: b.clip!.href!,
    src: b.clip!.src,
    poster: b.clip!.poster,
  })),
  ...OTHER_REVIEWS.map((r) => ({
    by: r.by,
    byName: nameOf.get(r.by),
    place: r.place,
    city: r.city,
    brand: r.brand ? byId.get(r.brand) : undefined,
    href: r.reel,
    credit: r.credit,
    ...(r.clip
      ? (() => {
          const code = reviewPostCode(r.reel)
          return code ? { src: `/clips/review-${code}.mp4`, poster: `/clips/review-${code}-poster.webp` } : {}
        })()
      : {}),
  })),
]

/** A creator's reviews, newest business pages first, then the linked ones. */
export const reviewsBy = (handle: string): Review[] => ALL.filter((r) => stableHandle(r.by) === stableHandle(handle))

/** Every creator's review of one business. */
export const reviewsOf = (brandId: string): Review[] => ALL.filter((r) => r.brand?.id === brandId)

/** The handle whose BEASTY page this is, if it is a foodie's. */
export const foodieOfBrand = (brandId: string): string | undefined =>
  FOODIE_PAGES.find((f) => (f.brand ?? `b_foodie${f.handle.replace(/[^a-z0-9]/g, '')}`) === brandId)?.handle

/** The BEASTY page of a creator, when they have one. */
export const pageOfFoodie = (handle: string): string | undefined => {
  const f = FOODIE_PAGES.find((x) => x.handle === handle || x.instagram === handle)
  return f ? (f.brand ?? `b_foodie${f.handle.replace(/[^a-z0-9]/g, '')}`) : undefined
}
