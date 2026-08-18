import { useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { ItemSheet } from './ItemSheet'
import { BrandLogo } from '../ios/BrandLogo'
import { BrandClip } from './BrandClip'
import { ItemThumb } from '../ios/ItemThumb'
import { brandById } from '../data/brands'
import { readableOn } from '../ios/contrast'
import { isFavorite, toggleFavorite } from '../lib/favorites'
import type { MenuItem } from '../data/brands'
import { money, useCart } from '../store/cart'
import type { ShellApi } from '../ios/Device'
import { Gem } from './MembersApp'

/** One restaurant's menu — the screen an icon tap actually lands on. */
export function BrandApp({ brandId, api }: { brandId: string; api: ShellApi }) {
  const brand = brandById(brandId)
  const cart = useCart()
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null)
  const [shared, setShared] = useState(false)
  /*
    Read once at mount rather than on every render: localStorage is synchronous
    and this screen re-renders on every scroll of the menu below it.
  */
  /* brand?.id, not brand.id — brandById can return undefined and the guard for
     that is below these hooks, which cannot move above them. */
  const [starred, setStarred] = useState(() => isFavorite(brand?.id ?? ''))
  /** The week's picks, collapsed by default. See the bar below. */
  const [picksOpen, setPicksOpen] = useState(false)
  const [activeCat, setActiveCat] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  if (!brand) return null

  const inCart = cart.countForBrand(brand.id)
  /*
    The week's three, taken from the MENU rather than from a new field.

    `offer` on a seed is already the operator's stocked subset — it is the
    filter that decides which of a partner's items are carried at all, which is
    exactly the list he means by "top 3 favorites of the week". Reading the
    built menu means the bar can never disagree with the prices under it, and
    his lists (Bula's mince, pot roast and brisket; any 3 cookies) need no
    second place to live.
  */
  const picks = brand.menu.flatMap((c) => c.items).slice(0, 3)
  // Header text must be chosen from the tint, not assumed white — several
  // brands use light plates and were rendering white-on-white.
  const ink = readableOn(brand.logo.bg)

  const jump = (i: number) => {
    setActiveCat(i)
    const el = bodyRef.current?.querySelector(`#cat-${brand.menu[i].id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <AppChrome
        title={brand.name}
        onBack={api.closeApp}
        tint={brand.logo.bg.split('|')[0]}
        right={
          inCart > 0 ? (
            <button className="chrome-pill" onClick={() => api.openApp('sys.cart')}>
              {inCart}
            </button>
          ) : null
        }
        footer={
          cart.count > 0 ? (
            <button className="cartbar" onClick={() => api.openApp('sys.cart')}>
              <span className="cartbar-count">{cart.count}</span>
              <span className="cartbar-label">
                View cart
                {cart.brandCount > 1 && <em> · {cart.brandCount} kitchens</em>}
              </span>
              <span className="cartbar-total">{money(cart.totals.subtotal)}</span>
            </button>
          ) : null
        }
      >
        <div className="brand-body" ref={bodyRef}>
          <div
            className="brand-hero"
            style={{ background: heroBg(brand.logo.bg), color: ink.fg }}
          >
            {/*
              STAR, beside Share — the operator's ask, and it closes a loop that
              already half existed: Recent fills itself from what you open and a
              star promotes a place into Favorites, which is how the two tabs on
              the landing screen differ. Until now the only way to star anything
              was from a Recent row, so a business you opened from search could
              not be kept at all.
            */}
            <button
              className={`brand-star${starred ? ' is-on' : ''}`}
              onClick={() =>
                setStarred(
                  toggleFavorite({
                    brandId: brand.id,
                    name: brand.name,
                    cuisine: brand.cuisine,
                    /* The snapshot stores a COLOUR, not the logo object — see
                       favorites.ts: the landing screen draws this list and
                       pulling brand art in there would drag the whole catalogue
                       into the first chunk a customer downloads. */
                    color: brand.logo.bg.split('|')[0],
                  }),
                )
              }
              aria-pressed={starred}
              aria-label={starred ? `Remove ${brand.name} from favourites` : `Save ${brand.name} to favourites`}
              style={{ color: ink.fg }}
            >
              <svg viewBox="0 0 24 24" width="19" height="19" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8Z" />
              </svg>
            </button>
            {/*
              Share, where a customer already is when they decide someone else
              needs to see this. Top-right of the hero rather than the foot of
              the menu: the moment you want to send a place to somebody is the
              moment you arrive, not after scrolling past nine prices.

              Web Share gives the real iOS sheet; the clipboard is the fallback
              on a desktop browser that has none.
            */}
            <button
              className="brand-share"
              onClick={async () => {
                const url = `${location.origin}/?b=${encodeURIComponent(brand.id)}`
                try {
                  if (navigator.share) await navigator.share({ title: brand.name, url })
                  else {
                    await navigator.clipboard.writeText(url)
                    setShared(true)
                    window.setTimeout(() => setShared(false), 2000)
                  }
                } catch {
                  /* Sheet dismissed. Not an error worth a message. */
                }
              }}
              aria-label={`Share ${brand.name}`}
              style={{ color: ink.fg }}
            >
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 15V3M12 3 8 7M12 3l4 4" />
                <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
              </svg>
            </button>
            {shared && (
              <span className="brand-share-toast" role="status">
                Link copied
              </span>
            )}
            <div className="brand-hero-mark">
              <BrandLogo logo={brand.logo} size={78} />
            </div>
            {/* No <h1> here: the nav large title already states the name, and
                two headings is the thing that reads as a web page. */}
            <p className="brand-tagline" style={{ color: ink.dim }}>
              {brand.tagline}
            </p>
            <div className="brand-meta" style={{ color: ink.dim }}>
              <span>{brand.cuisine}</span>
            </div>
            {/* prepMinutes is an estimate by category, not sourced, so it is
                hedged — and suppressed entirely where there is nothing to cook. */}
            {((brand.prepMinutes > 0 && !brand.contactOnly) || brand.dietary?.length) && (
              <div className="brand-chips">
                {brand.dietary?.map((d) => (
                  <span
                    className="chip"
                    key={d}
                    style={{
                      background: ink.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                      color: ink.fg,
                    }}
                  >
                    {d}
                  </span>
                ))}
                {brand.prepMinutes > 0 && !brand.contactOnly && (
                <span
                  className="chip"
                  style={{
                    background: ink.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                    color: ink.fg,
                  }}
                >
                  usually ~{brand.prepMinutes} min
                </span>
                )}
              </div>
            )}
          </div>

          {/*
            Where they are, and one tap to get there — the operator's ask, and
            the address was not on this page at all before it.

            Only when there IS a published address. A mobile business has no
            fixed place to be, and sending someone to navigate to a groomer who
            drives to them would be worse than showing nothing: the button is
            absent rather than disabled, because a greyed-out Directions button
            reads as a bug in the app rather than a fact about the business.
          */}
          {/*
            The other half of the mobile ring on the home screen: the ring says
            "this one is different", this says how. It stands in for the address
            block below rather than sitting beside it — a business that travels
            has no address to show and no directions to give, and saying so is
            more useful than an empty space where other pages have a map link.
          */}
          {!brand.address && /\bmobile\b/i.test(brand.cuisine) && (
            <p className="brand-mobile">
              <span className="brand-mobile-dot" aria-hidden="true" />
              Mobile — they come to you, so there is no shop to visit.
            </p>
          )}

          {brand.address && (
            <div className="brand-where">
              <p className="brand-address">{brand.address}</p>
              <a
                className="btn-secondary brand-directions"
                href={mapsHref(brand.address, brand.name)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Directions to ${brand.name}`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
                Directions
              </a>
            </div>
          )}

          {brand.pricesEstimated && (
            <p className="brand-review-flag">Prices need confirming — {brand.pricesEstimated}</p>
          )}
          {/*
            Above the menu, not below it.

            This flag used to render after the entire item list, so on the one
            brand whose menu is admittedly invented a customer read four prices
            first and the warning last. A caveat that arrives after the decision
            is decoration.
          */}
          {brand.needsOwnerReview && (
            <p className="brand-review-flag">
              Menu needs owner confirmation — {brand.needsOwnerReview}
            </p>
          )}

          {/*
            Their clip sits above the menu, under the caveats.

            It is the business showing you their own room and their own food,
            which is the thing a list of names and prices cannot do — but it
            goes after anything that qualifies the prices, because a caveat that
            arrives after the video is a caveat nobody read.
          */}
          {brand.clip && <BrandClip clip={brand.clip} logo={brand.logo} />}

          {/*
            One photograph of the place, same slot and same reasoning as the
            clip: it shows the room, which a name and a price list cannot, and
            it sits after anything that qualifies what is above it.

            The credit is drawn, not hidden in a title attribute — it is their
            photograph. `alt` is real text rather than an empty decorative one,
            because this picture is carrying information about the business.
          */}
          {brand.photo && (
            <figure className="brand-photo">
              <img src={brand.photo.src} alt={brand.photo.alt} loading="lazy" decoding="async" />
              <figcaption>{brand.photo.credit}</figcaption>
            </figure>
          )}

          {/* Says plainly that this is a selection, not their whole menu —
              which it is not, for every partner but top dog. */}
          {/*
            A BAR THAT DROPS DOWN, not a line of text — "make that 'Choose
            from…' a bar that drops down the top 3 favorites, so it can be out
            of the way." What it is getting out of the way OF is the offers
            below it, which are the reason a member opened this page.

            Collapsed by default and it names the count, so the bar says what is
            behind it rather than making anyone open it to find out. When a
            brand has no picks listed it stays the plain line it always was —
            there is nothing to drop down.
          */}
          {brand.menuNote &&
            (picks.length ? (
              <div className="menu-picks">
                <button
                  className={`menu-picks-bar${picksOpen ? ' is-open' : ''}`}
                  onClick={() => setPicksOpen((o) => !o)}
                  aria-expanded={picksOpen}
                >
                  <span>{brand.menuNote}</span>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {picksOpen && (
                  <ul className="menu-picks-list">
                    {picks.map((it) => (
                      <li key={it.id}>{it.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="menu-note">{brand.menuNote}</p>
            ))}

          {/* How to actually start, stated before the prices rather than under
              them, because "these are quotes" changes how the list is read. */}
          {brand.quoteOnly && <p className="brand-quote-note">{brand.quoteOnly}</p>}

          {/* A single-category menu needs no tab bar — one lone pill that
              repeats the section heading below it is pure noise. */}
          {brand.menu.length > 1 && (
          <nav className="cat-tabs">
            {brand.menu.map((c, i) => (
              <button
                key={c.id}
                className={`cat-tab${i === activeCat ? ' is-on' : ''}`}
                onClick={() => jump(i)}
              >
                {c.name}
              </button>
            ))}
          </nav>
          )}

          {brand.menu.map((cat) => (
            <section className="menu-cat" id={`cat-${cat.id}`} key={cat.id}>
              {brand.menu.length > 1 && <h2>{cat.name}</h2>}
              {cat.items.map((item) => {
                /*
                  Quoted work is a PRICE LIST, not a menu. No add button, no
                  item sheet, and nothing that could put a $650 website in a
                  cart next to a hot dog.
                */
                const Row = brand.quoteOnly ? 'div' : 'button'
                return (
                <Row
                  className={`menu-row${brand.quoteOnly ? ' is-quote' : ''}`}
                  key={item.id}
                  {...(brand.quoteOnly ? {} : { onClick: () => setSheetItem(item) })}
                >
                  <span className="menu-row-text">
                    <span className="menu-row-name">
                      {item.name}
                      {item.popular && <em className="tag-pop">Popular</em>}
                      {item.tags?.map((t) => (
                        <em className="tag-diet" key={t}>
                          {t}
                        </em>
                      ))}
                    </span>
                    <span className="menu-row-desc">{item.desc}</span>
                    {item.imageIsIllustration && (
                      <span className="menu-row-illus">Illustration, not their photo</span>
                    )}
                    {/* A range, where a range is what is actually quoted. */}
                    <span className="menu-row-price">{item.priceLabel ?? money(item.price)}</span>
                  </span>
                  {!brand.quoteOnly && (
                    <span className="menu-row-thumb">
                      <ItemThumb
                        name={item.name}
                        desc={item.desc}
                        bg={brand.logo.bg}
                        fg={brand.logo.fg}
                        cuisine={brand.cuisine}
                        imageUrl={item.imageUrl}
                      />
                      <span className="menu-row-add">+</span>
                    </span>
                  )}
                </Row>
                )
              })}
            </section>
          ))}

          {/*
            What this business gives BEASTY members.

            Under the menu, not over it: someone who opened a kitchen came for
            the food, and an offer they cannot use without a membership should
            not be the first thing between them and it.
          */}
          {(brand.offers?.welcome || brand.offers?.loyalty) && (
            <div className={`brand-offers${brand.offers.mock ? ' is-mock' : ''}`}>
              {/*
                A mockup says so, at the top, before the terms it is mocking.

                The operator asks to see what an offer would look like on a new
                partner's page. Rendered identically to an agreed one, that
                design is how a customer ends up asking a counter to honour
                something the business never promised — so it is labelled, and
                the label is the first thing in the block rather than a footnote
                under it.
              */}
              {brand.offers.mock && (
                <p className="brand-offer-mock">
                  Example only — {brand.name} has not agreed these. This is what an offer would
                  look like here.
                </p>
              )}
              {brand.offers.welcome && (
                <div className="brand-offer">
                  <span className="brand-offer-head">
                    <Gem size={15} />
                    Welcome offer
                  </span>
                  <span className="brand-offer-body">{brand.offers.welcome}</span>
                  <span className="brand-offer-when">First visit, once.</span>
                </div>
              )}
              {brand.offers.loyalty && (
                <div className="brand-offer">
                  <span className="brand-offer-head">
                    <Gem size={15} />
                    Loyalty offer
                  </span>
                  <span className="brand-offer-body">{brand.offers.loyalty}</span>
                  <span className="brand-offer-when">
                    Active BEASTY members only, every visit.
                  </span>
                </div>
              )}
              {!brand.offers.mock && (
                <button className="brand-offer-cta" onClick={() => api.openApp('sys.members')}>
                  About BEASTY members
                </button>
              )}
            </div>
          )}

          {/* A discount the partner honours at their own counter. Sits above
              the contact block because for a service partner it is the whole
              reason the tile was opened. */}
          {brand.perk && (
            <div className="brand-perk">
              <strong>{brand.perk.headline}</strong>
              <span>{brand.perk.detail}</span>
            </div>
          )}

          {/*
            How to actually reach them.

            Two cases, not one: a business with no published menu, and a
            business whose work is quoted rather than ordered. Both need a real
            route out of the app, and the quoted one needs it MOST — the whole
            screen is a price list with no way to buy anything.
          */}
          {(brand.contactOnly || brand.quoteOnly) && (
            <div className="brand-contact">
              {brand.contactOnly && <p>{brand.contactOnly}</p>}
              {brand.quoteOnly && <p>Start with a free consultation.</p>}
              {brand.phone && (
                <a className="btn-primary" href={`tel:${brand.phone.replace(/[^0-9+]/g, '')}`}>
                  Call {brand.phone}
                </a>
              )}
              {brand.email && (
                <a className="btn-secondary" href={`mailto:${brand.email}`}>
                  Email {brand.email}
                </a>
              )}
              {brand.site && (
                <a className="btn-secondary" href={brand.site} target="_blank" rel="noreferrer">
                  {brand.siteCta ?? 'Open their page'}
                </a>
              )}
            </div>
          )}

          {/* A partner-specific reason to visit their own site. Falls back to
              naming the destination honestly when there is nothing to add. */}
          {brand.siteNote && !brand.contactOnly ? (
            <p className="brand-foot">
              <a href={brand.site ?? brand.orderUrl} target="_blank" rel="noreferrer">
                {brand.siteNote}
              </a>
            </p>
          ) : brand.orderUrl && !brand.contactOnly ? (
            <p className="brand-foot">
              <a href={brand.orderUrl} target="_blank" rel="noreferrer">
                They also take orders on {orderHost(brand.orderUrl)}
              </a>
            </p>
          ) : null}

          {/* Do not claim the kitchen set these prices on the brands whose own
              data says they came off a delivery platform with a markup. */}
          <p className="brand-foot">
            {brand.name} is operated independently.{' '}
            {/* Four of these are not kitchens and have no prices at all — a dog
                walker, a garage, a print shop and an iOS app. "Prices set by the
                kitchen" sat two sentences under "there is nothing to order
                here". */}
            {brand.contactOnly
              ? 'Contact them directly.'
              : brand.quoteOnly
                ? 'Ranges are indicative; the quote is what counts.'
                : brand.pricesEstimated || brand.needsOwnerReview
                  ? 'Prices here still need confirming with them.'
                  : 'Prices set by the kitchen.'}
          </p>
        </div>
      </AppChrome>

      {sheetItem && <ItemSheet brand={brand} item={sheetItem} onClose={() => setSheetItem(null)} />}
    </>
  )
}

/**
 * A directions link the customer's own phone will open in its own map.
 *
 * The operator asked for Apple Maps, and on an iPhone that is exactly what
 * maps.apple.com does — the OS hands the URL straight to the Maps app rather
 * than opening a web page. It is the RIGHT answer only on Apple platforms
 * though: the same link on Android renders Apple's web map, which cannot hand
 * off to the navigation app that phone actually has. So the platform picks.
 *
 * The name rides along with the address because an address alone can land on
 * the wrong side of a building; with the business name attached, Maps resolves
 * to the business's own pin where it knows it. Both are encoded — an
 * unencoded "2190 Contra Costa Blvd, Pleasant Hill" breaks on its comma.
 */
function mapsHref(address: string, name: string): string {
  const q = encodeURIComponent(`${name}, ${address}`)
  const apple =
    typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
  return apple ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`
}

/** Name the destination honestly — a DoorDash link is not "their own site". */
function orderHost(url: string): string {
  const host = url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
  const known: Record<string, string> = {
    'doordash.com': 'DoorDash',
    'order.toasttab.com': 'Toast',
    'ubereats.com': 'Uber Eats',
    'postmates.com': 'Postmates',
    'instagram.com': 'Instagram',
  }
  return known[host] ?? `their own site (${host})`
}

/** Hero uses the logo's own colours so every brand page feels like its own app. */
function heroBg(bg: string): string {
  const [a, b] = bg.split('|')
  return `linear-gradient(160deg, ${a}, ${b ?? a})`
}
