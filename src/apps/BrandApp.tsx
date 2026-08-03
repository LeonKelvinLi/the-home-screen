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
            <div className="brand-chips">
              <span className="chip is-open">Open now</span>
              <span
                className="chip"
                style={{
                  background: ink.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                  color: ink.fg,
                }}
              >
                {brand.prepMinutes} min
              </span>
            </div>
          </div>

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
              {cat.items.map((item) => (
                <button className="menu-row" key={item.id} onClick={() => setSheetItem(item)}>
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
                    <span className="menu-row-price">{money(item.price)}</span>
                  </span>
                  <span className="menu-row-thumb">
                    <ItemThumb
                      name={item.name}
                      desc={item.desc}
                      bg={brand.logo.bg}
                      fg={brand.logo.fg}
                    />
                    <span className="menu-row-add">+</span>
                  </span>
                </button>
              ))}
            </section>
          ))}

          {/* No published menu: show how to actually reach them instead of an
              empty list or an invented one. */}
          {brand.contactOnly && (
            <div className="brand-contact">
              <p>{brand.contactOnly}</p>
              {brand.phone && (
                <a className="btn-primary" href={`tel:${brand.phone.replace(/[^0-9+]/g, '')}`}>
                  Call {brand.phone}
                </a>
              )}
              {brand.site && (
                <a className="btn-secondary" href={brand.site} target="_blank" rel="noreferrer">
                  Open their page
                </a>
              )}
            </div>
          )}

          {brand.pricesEstimated && (
            <p className="brand-review-flag">Prices need confirming — {brand.pricesEstimated}</p>
          )}

          {brand.orderUrl && !brand.contactOnly && (
            <p className="brand-foot">
              <a href={brand.orderUrl} target="_blank" rel="noreferrer">
                They also take orders on their own site
              </a>
            </p>
          )}

          {brand.needsOwnerReview && (
            <p className="brand-review-flag">
              Menu needs owner confirmation — {brand.needsOwnerReview}
            </p>
          )}

          <p className="brand-foot">
            {brand.name} is operated independently. Prices set by the kitchen.
          </p>
        </div>
      </AppChrome>

      {sheetItem && <ItemSheet brand={brand} item={sheetItem} onClose={() => setSheetItem(null)} />}
    </>
  )
}

/** Hero uses the logo's own colours so every brand page feels like its own app. */
function heroBg(bg: string): string {
  const [a, b] = bg.split('|')
  return `linear-gradient(160deg, ${a}, ${b ?? a})`
}
