import { useState } from 'react'
import { BrandClip } from './BrandClip'
import type { Clip } from './BrandClip'
import { REVIEW_LINKS } from '../data/reviewLinks'
import type { Brand } from '../data/brands'

export function BrandReviews({ brand }: { brand: Brand }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const reviews: { title: string; clip: Clip }[] = []
  // Keep the existing hosted clip when its post also appears in the relationship table.
  if (brand.clip) reviews.push({ title: brand.clip.by ? `Review by @${brand.clip.by}` : 'Their video', clip: brand.clip })
  for (const review of REVIEW_LINKS) {
    if (review.businessId !== brand.id && review.creatorId !== brand.id) continue
    const title = review.creatorId === brand.id ? review.title : review.clip.by ? `@${review.clip.by} · ${review.title}` : review.title
    const found = reviews.find((r) => r.clip.href === review.clip.href)
    if (found) {
      found.title = title
      if (!found.clip.src) found.clip = review.clip
    }
    else reviews.push({ title, clip: review.clip })
  }
  if (!reviews.length) return null
  const current = reviews[Math.min(selected, reviews.length - 1)]
  return <div className="menu-picks brand-clip-drop">
    <button className={`menu-picks-bar${open ? ' is-open' : ''}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
      <span>{reviews.length > 1 ? `Watch videos (${reviews.length})` : current.clip.by && current.clip.by !== brand.instagram ? `Watch a review by @${current.clip.by}` : 'Watch their video'}</span>
      <span aria-hidden="true">{open ? '⌃' : '⌄'}</span>
    </button>
    {open && <>
      {reviews.length > 1 && <label className="review-choice">Choose a video
        <select value={selected} onChange={(e) => setSelected(Number(e.target.value))}>
          {reviews.map((review, i) => <option key={review.clip.href ?? review.clip.src} value={i}>{review.title}</option>)}
        </select>
      </label>}
      <BrandClip key={current.clip.href ?? current.clip.src} clip={current.clip} logo={brand.logo} brand={brand.id} />
    </>}
  </div>
}
