import { useEffect, useMemo, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { Symbol } from '../ios/ui/Symbol'
import { BrandLogo } from '../ios/BrandLogo'
import { BRANDS } from '../data/brands'
import { money } from '../store/cart'
import type { ShellApi } from '../ios/Device'
import { OPEN_MS } from '../ios/constants'

/**
 * Search across every kitchen at once. This is the argument for the whole
 * product: "tacos" should not mean opening four different apps.
 */

interface Hit {
  brandId: string
  brandName: string
  itemName: string
  desc: string
  price: number
  logo: (typeof BRANDS)[number]['logo']
  /** Price still needs confirming with the business. */
  flagged: boolean
}

export function SearchApp({ api }: { api: ShellApi }) {
  /*
    Focus AFTER the launch animation, not on mount.

    `autoFocus` fires while the window is still scaling up out of the icon. iOS
    raises the keyboard on focus, which resizes the visual viewport mid-flight
    and makes the open stutter — and on a phone the keyboard covering the
    results is the wrong first frame anyway.
  */
  const field = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => field.current?.focus(), reduced ? 0 : OPEN_MS + 60)
    return () => window.clearTimeout(t)
  }, [])

  const [q, setQ] = useState('')

  const { brandHits, itemHits } = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return { brandHits: [], itemHits: [] as Hit[] }

    const brandHits = BRANDS.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.cuisine.toLowerCase().includes(term) ||
        b.tagline.toLowerCase().includes(term),
    )

    const itemHits: Hit[] = []
    for (const b of BRANDS) {
      for (const cat of b.menu) {
        for (const it of cat.items) {
          if (it.name.toLowerCase().includes(term) || it.desc.toLowerCase().includes(term)) {
            itemHits.push({
              brandId: b.id,
              brandName: b.name,
              itemName: it.name,
              desc: it.desc,
              price: it.price,
              logo: b.logo,
              flagged: Boolean(b.pricesEstimated || b.needsOwnerReview),
            })
          }
        }
      }
    }
    return { brandHits, itemHits: itemHits.slice(0, 30) }
  }, [q])

  const suggestions = ['tacos', 'wings', 'vegan', 'boba', 'burger', 'coffee', 'ramen']

  return (
    <AppChrome title="Search" onBack={api.closeApp} tint="#1DA345">
      <div className="search-body">
        <div className="search-field">
          <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor">
            <path d="M44 16a28 28 0 0 1 22 45.3l17.4 17.4a4.5 4.5 0 0 1-6.4 6.4L59.6 67.7A28 28 0 1 1 44 16Zm0 9a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z" />
          </svg>
          <input
            ref={field}
            placeholder="Dishes, cuisines, kitchens"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button className="search-clear" onClick={() => setQ('')} aria-label="Clear">
              ×
            </button>
          )}
        </div>

        {q.trim().length < 2 ? (
          <>
            <h3 className="search-h">Try</h3>
            <div className="search-sugg">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
            <h3 className="search-h">All kitchens</h3>
            {BRANDS.map((b) => (
              <button className="search-brand" key={b.id} onClick={() => api.openApp(b.id)}>
                <BrandLogo logo={b.logo} size={44} />
                <span>
                  <strong>{b.name}</strong>
                  <em>
                    {b.cuisine}
                    {b.prepMinutes > 0 && !b.contactOnly && ` · ~${b.prepMinutes} min`}
                    {b.needsOwnerReview && ' · unconfirmed'}
                  </em>
                </span>
                <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
              </button>
            ))}
          </>
        ) : (
          <>
            {brandHits.length > 0 && (
              <>
                <h3 className="search-h">Kitchens</h3>
                {brandHits.map((b) => (
                  <button className="search-brand" key={b.id} onClick={() => api.openApp(b.id)}>
                    <BrandLogo logo={b.logo} size={44} />
                    <span>
                      <strong>{b.name}</strong>
                      <em>{b.cuisine}</em>
                    </span>
                    <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
                  </button>
                ))}
              </>
            )}

            {itemHits.length > 0 && (
              <>
                <h3 className="search-h">Dishes</h3>
                {itemHits.map((h, i) => (
                  <button className="search-item" key={i} onClick={() => api.openApp(h.brandId)}>
                    <BrandLogo logo={h.logo} size={36} />
                    <span className="search-item-text">
                      <strong>{h.itemName}</strong>
                      <em>{h.brandName}</em>
                      <span>{h.desc}</span>
                    </span>
                    <span className="search-item-price">
                      {money(h.price)}
                      {h.flagged && <em className="search-item-flag">to confirm</em>}
                    </span>
                    <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
                  </button>
                ))}
              </>
            )}

            {brandHits.length === 0 && itemHits.length === 0 && (
              <div className="empty">
                <h2>Nothing for “{q}”</h2>
                <p>Try a dish, a cuisine, or a kitchen name.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppChrome>
  )
}
