import { useEffect, useMemo, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { Symbol } from '../ios/ui/Symbol'
import { BrandLogo } from '../ios/BrandLogo'
import { HalalMark, isHalal } from '../ios/HalalMark'
import { BRANDS } from '../data/brands'
import { CITY_PAGES } from '../data/cities'
import { money } from '../store/cart'
import type { ShellApi } from '../ios/Device'
import { OPEN_MS } from '../ios/constants'
import { noteOrigin, track } from '../lib/track'
import { useInPreview } from '../ios/preview'

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
  /**
   * What the brand page prints instead of the number, where the number alone
   * would lie. Quoted work carries a RANGE ("$650-3,000+") flattened to its low
   * bound for sorting; search rendered the low bound as a fixed fee and
   * understated the job by a factor of five.
   */
  priceLabel?: string
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
  const preview = useInPreview()

  const { cityHits, brandHits, itemHits } = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return { cityHits: [], brandHits: [], itemHits: [] as Hit[] }

    /*
      Cities first, because a place is a different KIND of answer.

      Typing "Oakland" almost never means "find me a business with Oakland in
      its name" — it means take me to Oakland. So a city match jumps the home
      screen to that city's page rather than returning a list, which is what the
      operator asked for and what the pages were built to be.
    */
    const cityHits = CITY_PAGES.filter((c) => c.toLowerCase().includes(term))

    const brandHits = BRANDS.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.cuisine.toLowerCase().includes(term) ||
        b.tagline.toLowerCase().includes(term) ||
        /* "Also make it searchable" — halal, and any other dietary line a
           business gives about itself, finds it. */
        !!b.dietary?.some((d) => d.toLowerCase().includes(term)),
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
              priceLabel: it.priceLabel,
              logo: b.logo,
              flagged: Boolean(b.pricesEstimated || b.needsOwnerReview),
            })
          }
        }
      }
    }
    return { cityHits, brandHits, itemHits: itemHits.slice(0, 30) }
  }, [q])

  /*
    WHAT WAS SEARCHED FOR, reported once typing settles (1.2s) rather than per
    keystroke, and at once if a result is tapped first. The same words twice in
    a row are one search.
  */
  const sent = useRef('')
  const count = cityHits.length + brandHits.length + itemHits.length
  const submit = (term: string, n: number) => {
    if (preview || term.length < 2 || term === sent.current) return
    sent.current = term
    track('search_submitted', { query: term, count: n })
  }
  useEffect(() => {
    if (!preview) track('search_started')
  }, [preview])
  useEffect(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return
    const t = window.setTimeout(() => submit(term, count), 1200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, count])

  /* A tapped result: the search that found it, then which answer it was. */
  const picked = (kind: 'city' | 'brand' | 'item', position: number, target: { brand?: string; city?: string }) => {
    const term = q.trim().toLowerCase()
    submit(term, count)
    if (preview) return
    track('search_result_clicked', { query: term, position, kind, ...target })
    if (target.brand) noteOrigin({ brand: target.brand, surface: 'search_result', query: term, position })
  }

  /* A city among the suggestions, so the behaviour is discoverable rather than
     something you have to already know about. */
  const suggestions = ['tacos', 'wings', 'Oakland', 'vegan', 'boba', 'Berkeley', 'coffee']

  return (
    <AppChrome title="Search" onBack={api.closeApp} tint="#1DA345">
      <div className="search-body">
        <div className="search-field">
          <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor">
            <path d="M44 16a28 28 0 0 1 22 45.3l17.4 17.4a4.5 4.5 0 0 1-6.4 6.4L59.6 67.7A28 28 0 1 1 44 16Zm0 9a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z" />
          </svg>
          <input
            ref={field}
            placeholder="Dishes, kitchens, cities"
          aria-label="Dishes, kitchens, cities"
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
            {/* Not all kitchens: the list includes a software studio, a dog walker and
                a breeder. */}
            <h3 className="search-h">All businesses</h3>
            {BRANDS.map((b, i) => (
              <button
                className="search-brand"
                key={b.id}
                onClick={() => {
                  if (!preview) noteOrigin({ brand: b.id, surface: 'search_list', position: i + 1 })
                  api.openApp(b.id)
                }}
              >
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
            {cityHits.length > 0 && (
              <>
                <h3 className="search-h">Cities</h3>
                {cityHits.map((c, i) => (
                  <button
                    className="search-brand is-city"
                    key={c}
                    onClick={() => {
                      picked('city', i + 1, { city: c })
                      api.goToCity(c)
                    }}
                  >
                    <span className="search-city-mark" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M12 2.2a7.2 7.2 0 0 1 7.2 7.2c0 4.9-5.4 11-6.6 12.3a.8.8 0 0 1-1.2 0C10.2 20.4 4.8 14.3 4.8 9.4A7.2 7.2 0 0 1 12 2.2Zm0 4.4a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" />
                      </svg>
                    </span>
                    <span>
                      <strong>{c}</strong>
                      <em>Go to the {c} page</em>
                    </span>
                    <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
                  </button>
                ))}
              </>
            )}

            {brandHits.length > 0 && (
              <>
                {/* Not "Kitchens": the catalogue now includes an injury
                    attorney, a chiropractor, a barbershop, a contractor and a
                    dog breeder. The other two headings in this file were fixed
                    for exactly this and this one was missed. */}
                <h3 className="search-h">Businesses</h3>
                {brandHits.map((b, i) => (
                  <button
                    className="search-brand"
                    key={b.id}
                    onClick={() => {
                      picked('brand', i + 1, { brand: b.id })
                      api.openApp(b.id)
                    }}
                  >
                    <BrandLogo logo={b.logo} size={44} />
                    <span>
                      <strong>{b.name}</strong>
                      {/* The idle "All kitchens" list below appends this and the
                          search results did not, so searching for a brand hid a
                          flag that browsing to it showed. */}
                      <em>
                        {b.cuisine}
                        {b.needsOwnerReview && ' · unconfirmed'}
                        {isHalal(b.dietary) && (
                          <span className="search-halal">
                            {' · '}
                            <HalalMark size={13} /> Halal
                          </span>
                        )}
                      </em>
                    </span>
                    <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
                  </button>
                ))}
              </>
            )}

            {itemHits.length > 0 && (
              <>
                {/* Not "Dishes": Noctilucente's quoted services land in this
                    list too, and "Business website · $650-3,000+" filed under
                    Dishes is a category error on a food app. */}
                <h3 className="search-h">Items</h3>
                {itemHits.map((h, i) => (
                  <button
                    className="search-item"
                    key={i}
                    onClick={() => {
                      picked('item', i + 1, { brand: h.brandId })
                      api.openApp(h.brandId)
                    }}
                  >
                    <BrandLogo logo={h.logo} size={36} />
                    <span className="search-item-text">
                      <strong>{h.itemName}</strong>
                      <em>{h.brandName}</em>
                      <span>{h.desc}</span>
                    </span>
                    <span className="search-item-price">
                      {h.priceLabel ?? money(h.price)}
                      {h.flagged && <em className="search-item-flag">to confirm</em>}
                    </span>
                    <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
                  </button>
                ))}
              </>
            )}

            {cityHits.length === 0 && brandHits.length === 0 && itemHits.length === 0 && (
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
