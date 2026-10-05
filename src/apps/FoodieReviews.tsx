import { useState } from 'react'
import type { Review } from '../data/foodieIndex'
import { pageOfFoodie } from '../data/foodieIndex'
import type { ShellApi } from '../ios/Device'
import { track } from '../lib/track'
import { useInPreview } from '../ios/preview'

/*
  A list of reviews as drop-downs, one row each. Glenn, 2026-10-03: "a
  drop-down list of Restaurant names with video clips of that restaurant on
  their BEASTY page". Two uses: on a foodie's page the rows are the places
  they reviewed; on a business's page they are the foodies who reviewed it.
  A row opens to the film when BEASTY plays a copy of it, else to a link to
  the post; and to the other page, the business's or the foodie's.
*/
export function FoodieReviews({ title, reviews, side, api, here }: {
  title: string
  reviews: Review[]
  /** What each row is named by: the place reviewed, or who reviewed it. */
  side: 'place' | 'foodie'
  api: ShellApi
  /** The page this list is on, so a row never offers to open it again. */
  here: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  const preview = useInPreview()
  if (!reviews.length) return null
  return (
    <section className="foodie-reviews" aria-label={title}>
      <h3 className="foodie-reviews-h">{title}</h3>
      {reviews.map((r, i) => {
        const isOpen = open === i
        const head = side === 'place' ? r.place : r.byName ?? `@${r.by}`
        const sub = side === 'place' ? r.city : `@${r.by}`
        const other = side === 'place' ? r.brand?.id : pageOfFoodie(r.by)
        return (
          <div className={`foodie-review${isOpen ? ' is-open' : ''}`} key={`${r.by}-${r.href}`}>
            <button
              type="button"
              className="foodie-review-head"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>
                <strong>{head}</strong>
                {sub && <em>{sub}</em>}
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="foodie-review-chev">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div className="foodie-review-body">
                {r.src ? (
                  <video
                    className="foodie-review-video"
                    src={r.src}
                    poster={r.poster}
                    controls
                    playsInline
                    preload="none"
                    onPlay={() => {
                      if (!preview) track('clip_played', r.brand ? { brand: r.brand.id } : {})
                    }}
                  />
                ) : null}
                <div className="foodie-review-links">
                  <a href={r.href} target="_blank" rel="noopener noreferrer">
                    {r.src ? 'See the post on Instagram' : `Watch ${side === 'place' ? 'the review' : `@${r.by}’s review`} on Instagram`}
                  </a>
                  {other && other !== here && (
                    <button type="button" onClick={() => api.openApp(other)}>
                      {side === 'place' ? `Open ${r.place} on BEASTY` : `See ${r.byName ?? '@' + r.by}’s page`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
