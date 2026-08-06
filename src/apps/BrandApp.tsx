import { useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { ItemSheet } from './ItemSheet'
import { BrandLogo } from '../ios/BrandLogo'
import { ItemThumb } from '../ios/ItemThumb'
import { brandById } from '../data/brands'
import { readableOn } from '../ios/contrast'
import type { MenuItem } from '../data/brands'
import { money, useCart } from '../store/cart'
import type { ShellApi } from '../ios/Device'
import { Gem } from './MembersApp'

/** One restaurant's menu — the screen an icon tap actually lands on. */
export function BrandApp({ brandId, api }: { brandId: string; api: ShellApi }) {
  const brand = brandById(brandId)
  const cart = useCart()
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null)
  const [activeCat, setActiveCat] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  if (!brand) return null

  const inCart = cart.countForBrand(brand.id)
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

          {/* Says plainly that this is a selection, not their whole menu —
              which it is not, for every partner but top dog. */}
          {brand.menuNote && <p className="menu-note">{brand.menuNote}</p>}

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
            <div className="brand-offers">
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
              <button className="brand-offer-cta" onClick={() => api.openApp('sys.members')}>
                About BEASTY members
              </button>
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
