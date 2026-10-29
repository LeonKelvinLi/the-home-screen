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
import { ALL_BEASTY_PAGES } from '../data/slots'
import { ALL_PLACEMENTS } from '../data/categorySeats'
import { CategoryIcon, thumbFor } from '../ios/CategoryIcon'
import { SHARE_SEARCH, shareOrCopy, shareUrl } from '../lib/share'
import { ShareMark } from './dialer/glyphs'

/*
  THE CATEGORIES LIST. Glenn, 2026-09-30: "Once all these extra BEASTY pages
  are made, create a category button on the search page to list them all."
  Leon: "A dropdown for categories". Every BEASTY page, A to Z, each opening its
  page; nine of them are also on the home screen, the rest only open from here.
*/
const SHEET_ABOUT: Record<string, string> = {
  goods: 'Restaurants and food',
  boutiques: 'Small boutiques',
  services: 'Local services',
  online: 'Brands that ship',
  individuals: 'People, not shops',
  goods2: 'Free listings for food',
  services2: 'Free listings for services',
}
interface CategoryRow {
  kind: string
  heading: string
  about: string
  /** A small copy of the page's background, or null for BEASTY's own photograph. */
  thumb: string | null
  count: number
}
const CATEGORY_ROWS: CategoryRow[] = ALL_BEASTY_PAGES.map((p) => ({
  kind: p.kind,
  heading: p.heading,
  about: p.about ?? SHEET_ABOUT[p.kind] ?? '',
  thumb: thumbFor(p),
  count: Object.keys(ALL_PLACEMENTS).filter((seat) => seat.startsWith(`beasty-${p.kind}-`)).length,
})).sort((a, b) => a.heading.localeCompare(b.heading))
const CITIES_AZ = [...CITY_PAGES].sort((a, b) => a.localeCompare(b))

/** "DJ's" is found by "djs" and "dj", "Pit's" by "pits", "HŌM" by "hom" and "Café" by "cafe". */
const fold = (t: string) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’]/g, '')
const countLine = (n: number) => (n === 0 ? '24 spots open' : n === 1 ? '1 business' : `${n} businesses`)

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
  /* What the Share button did, where a phone has no share sheet. */
  const [said, setSaid] = useState<string | null>(null)
  const share = async () => {
    const how = await shareOrCopy(SHARE_SEARCH)
    if (how === 'shared') return
    setSaid(how === 'copied' ? 'Link copied' : `Copy this link: ${shareUrl(SHARE_SEARCH).replace(/^https?:\/\//, '')}`)
  }
  const preview = useInPreview()

  /* Which drop-down is open under the field: Categories, Cities, or neither. */
  const [drop, setDrop] = useState<'categories' | 'cities' | null>(null)

  const { categoryHits, cityHits, brandHits, itemHits } = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return { categoryHits: [] as CategoryRow[], cityHits: [], brandHits: [], itemHits: [] as Hit[] }

    /* A category first of all: "tattoo" means BEASTY · Tattoo. */
    // Glenn considered both names; Dim Sum is the agreed heading, with Dumplings searchable too.
    const categoryHits = CATEGORY_ROWS.filter((c) =>
      fold(c.heading).includes(fold(term)) ||
      fold(c.kind).includes(fold(term).replace(/\s+/g, '')) ||
      (c.kind === 'dimsum' && fold('dumplings').includes(fold(term)))
    )

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
        fold(b.name).includes(fold(term)) ||
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
    return { categoryHits, cityHits, brandHits, itemHits: itemHits.slice(0, 30) }
  }, [q])

  /*
    WHAT WAS SEARCHED FOR, reported once typing settles (1.2s) rather than per
    keystroke, and at once if a result is tapped first. The same words twice in
    a row are one search.
  */
  const sent = useRef('')
  const count = categoryHits.length + cityHits.length + brandHits.length + itemHits.length
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
  const picked = (kind: 'category' | 'city' | 'brand' | 'item', position: number, target: { brand?: string; city?: string }) => {
    const term = q.trim().toLowerCase()
    submit(term, count)
    if (preview) return
    track('search_result_clicked', { query: term, position, kind, ...target })
    if (target.brand) noteOrigin({ brand: target.brand, surface: 'search_result', query: term, position })
  }

  const openCategory = (c: CategoryRow, surface: 'search_list' | 'search_result') => {
    if (!preview) track('category_opened', { page_kind: c.kind, surface })
    api.goToCity('BEASTY', undefined, c.kind)
  }
  const categoryRow = (c: CategoryRow, onPick: () => void) => (
    <button className="search-brand is-cat" key={c.kind} onClick={onPick}>
      <span className="search-cat-thumb" aria-hidden="true">
        <CategoryIcon kind={c.kind} thumb={c.thumb} />
      </span>
      <span>
        <strong>BEASTY • {c.heading}</strong>
        <em>
          {c.about} · {countLine(c.count)}
        </em>
      </span>
      <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
    </button>
  )
  const cityRow = (c: string, onPick: () => void) => (
    <button className="search-brand is-city" key={c} onClick={onPick}>
      <span className="search-city-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 2.2a7.2 7.2 0 0 1 7.2 7.2c0 4.9-5.4 11-6.6 12.3a.8.8 0 0 1-1.2 0C10.2 20.4 4.8 14.3 4.8 9.4A7.2 7.2 0 0 1 12 2.2Zm0 4.4a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" />
        </svg>
      </span>
      <span>
        <strong>{c}</strong>
      </span>
      <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
    </button>
  )

  /* A city among the suggestions, so the behaviour is discoverable rather than
     something you have to already know about. */
  const suggestions = ['tacos', 'wings', 'Oakland', 'vegan', 'boba', 'Berkeley', 'coffee']

  return (
    <AppChrome
      title="Search"
      onBack={api.closeApp}
      tint="#1DA345"
      right={
        <button type="button" className="chrome-pill is-share" onClick={share}>
          <ShareMark size={15} />
          Share
        </button>
      }
    >
      {said && (
        <p className="search-said" role="status">
          {said}
        </p>
      )}
      <div className="search-body">
        <div className="search-field">
          <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor">
            <path d="M44 16a28 28 0 0 1 22 45.3l17.4 17.4a4.5 4.5 0 0 1-6.4 6.4L59.6 67.7A28 28 0 1 1 44 16Zm0 9a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z" />
          </svg>
          <input
            ref={field}
            placeholder="Dishes, businesses, categories, cities"
            aria-label="Dishes, businesses, categories, cities"
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
            {/* The two drop-downs. Cities left the home screen's swipe on
                2026-09-30, so this is where the whole list of them lives. */}
            <div className="search-drops">
              <button
                type="button"
                className={`search-drop-btn${drop === 'categories' ? ' is-open' : ''}`}
                aria-expanded={drop === 'categories'}
                aria-controls="search-drop-categories"
                onClick={() => setDrop(drop === 'categories' ? null : 'categories')}
              >
                Categories
                <Symbol name="chevron.down" size={12} weight={2.8} />
              </button>
              <button
                type="button"
                className={`search-drop-btn${drop === 'cities' ? ' is-open' : ''}`}
                aria-expanded={drop === 'cities'}
                aria-controls="search-drop-cities"
                onClick={() => setDrop(drop === 'cities' ? null : 'cities')}
              >
                Cities
                <Symbol name="chevron.down" size={12} weight={2.8} />
              </button>
            </div>
            {drop === 'categories' && (
              <div className="search-drop-list" id="search-drop-categories">
                {CATEGORY_ROWS.map((c) => categoryRow(c, () => openCategory(c, 'search_list')))}
              </div>
            )}
            {drop === 'cities' && (
              <div className="search-drop-list" id="search-drop-cities">
                {CITIES_AZ.map((c) => cityRow(c, () => api.goToCity(c)))}
              </div>
            )}
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
            {categoryHits.length > 0 && (
              <>
                <h3 className="search-h">Categories</h3>
                {categoryHits.map((c, i) =>
                  categoryRow(c, () => {
                    picked('category', i + 1, {})
                    openCategory(c, 'search_result')
                  }),
                )}
              </>
            )}

            {cityHits.length > 0 && (
              <>
                <h3 className="search-h">Cities</h3>
                {cityHits.map((c, i) =>
                  cityRow(c, () => {
                    picked('city', i + 1, { city: c })
                    api.goToCity(c)
                  }),
                )}
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

            {count === 0 && (
              <div className="empty">
                <h2>Nothing for “{q}”</h2>
              </div>
            )}
          </>
        )}
      </div>
    </AppChrome>
  )
}
