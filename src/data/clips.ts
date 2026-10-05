/**
 * The reels the video window plays, newest first.
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
import { REVIEW_LINKS } from './reviewLinks'

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
}

const primarySources = new Set<string>()
export const REELS: Reel[] = BRANDS.filter((b) => {
  if (!b.clip?.src || primarySources.has(b.clip.src)) return false
  primarySources.add(b.clip.src)
  return true
}).map((b) => ({
  brandId: b.id,
  name: b.name,
  line: b.cuisine,
  src: b.clip!.src!,
  poster: b.clip!.poster,
  credit: b.clip!.credit,
  by: b.clip!.by,
  href: b.clip!.href,
}))

// Additional supplied reviews also belong in Watch, once per source video.
const seenSources = new Set(REELS.map((r) => r.src))
for (const review of REVIEW_LINKS) {
  if (!review.clip.src || seenSources.has(review.clip.src)) continue
  const brand = BRANDS.find((b) => b.id === (review.businessId ?? review.creatorId))
  if (!brand) continue
  REELS.push({ brandId: brand.id, name: brand.name, line: review.title, src: review.clip.src,
    poster: review.clip.poster, credit: review.clip.credit, by: review.clip.by, href: review.clip.href })
  seenSources.add(review.clip.src)
}
