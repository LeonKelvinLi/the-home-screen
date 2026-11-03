/**
 * The reels the video window plays. VideoApp shuffles them on every opening.
 *
 * Read from the BRANDS themselves rather than kept as a second list: a clip is
 * already a property of a business, and a separate list would be a second thing
 * to forget and would disagree with the brand page the day one was pulled.
 *
 * Only clips with `src` qualify. A clip that is only an `href` lives on
 * somebody else's platform and cannot be played here — it opens out from the
 * business's own page instead, which is what that card is for.
 */
import { BRANDS } from './brands'
import type { Logo } from './brands'
import { FOODIE_PAGES, OTHER_REVIEWS, reviewPostCode } from './foodies'

export interface Reel {
  brandId: string
  name: string
  /** One line under the name — what the business is. */
  line: string
  src: string
  poster?: string
  credit: string
  /** The reviewer's handle when the film is theirs. See apps/BrandClip.tsx. */
  by?: string
  /** The original post, where there is one. */
  href?: string
  /** The mark of whatever the name opens, for the avatar beside it. */
  logo?: Logo
}

/* A business with several locations has one film on each page; it plays here once. */
const seen = new Set<string>()
const BUSINESS_REELS: Reel[] = BRANDS.flatMap((b) => [b.clip, ...(b.clips ?? [])]
  .flatMap((c) => {
    if (!c?.src || seen.has(c.src)) return []
    seen.add(c.src)
    return [{ brandId: b.id, name: b.name, line: b.cuisine, src: c.src,
      poster: c.poster, credit: c.credit, by: c.by, href: c.href, logo: b.logo }]
  }))

/*
  THE FOODIES' OWN CUTS, TOO. Leon, 2026-10-11: "add all those clips in the
  scrolling reel part". A creator's review of a place that is not on BEASTY
  (OTHER_REVIEWS) is cut and played on their Foodies page but had no business
  film to ride in on, so the feed never showed it. Each one is credited to the
  creator, and its name opens the business when it is on BEASTY, or the
  creator's own page when it is not.
*/
const foodiePage = (handle: string) => {
  const f = FOODIE_PAGES.find((x) => x.handle === handle || x.instagram === handle)
  return f ? (f.brand ?? `b_foodie${f.handle.replace(/[^a-z0-9]/g, '')}`) : undefined
}
const REVIEW_REELS: Reel[] = OTHER_REVIEWS.flatMap((r) => {
  const code = r.clip ? reviewPostCode(r.reel) : undefined
  const opens = r.brand ?? foodiePage(r.by)
  if (!code || !opens) return []
  const who = FOODIE_PAGES.find((f) => f.handle === r.by || f.instagram === r.by)?.name ?? `@${r.by}`
  return [{
    brandId: opens,
    name: r.place,
    line: r.city ? `A Foodie review, ${r.city}` : 'A Foodie review',
    src: `/clips/review-${code}.mp4`,
    poster: `/clips/review-${code}-poster.webp`,
    credit: r.credit ?? `Filmed by ${who}`,
    by: r.by,
    href: r.reel,
    logo: BRANDS.find((b) => b.id === opens)?.logo,
  }]
})

/* One review after every few businesses, so they run through the whole feed
   instead of waiting at the bottom of it. */
const EVERY = Math.max(2, Math.floor(BUSINESS_REELS.length / Math.max(1, REVIEW_REELS.length)))
export const REELS: Reel[] = BUSINESS_REELS.flatMap((r, i) => {
  const review = (i + 1) % EVERY === 0 ? REVIEW_REELS[(i + 1) / EVERY - 1] : undefined
  return review ? [r, review] : [r]
}).concat(REVIEW_REELS.slice(Math.floor(BUSINESS_REELS.length / EVERY)))
