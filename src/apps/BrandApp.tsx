import { useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { ItemSheet } from './ItemSheet'
import { BrandLogo } from '../ios/BrandLogo'
import { ItemThumb } from '../ios/ItemThumb'
import { brandById } from '../data/brands'
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
          <div className="brand-hero" style={{ background: heroBg(brand.logo.bg) }}>
            <div className="brand-hero-mark">
              <BrandLogo logo={brand.logo} size={78} />
            </div>
            <h1>{brand.name}</h1>
            <p className="brand-tagline">{brand.tagline}</p>
            <div className="brand-meta">
              <span>★ {brand.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{brand.ratingCount.toLocaleString()} ratings</span>
              <span>·</span>
              <span>{brand.cuisine}</span>
            </div>
            <div className="brand-chips">
              <span className="chip is-open">Open now</span>
              <span className="chip">{brand.prepMinutes} min</span>
              <span className="chip">Pickup &amp; delivery</span>
            </div>
          </div>

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

          {brand.menu.map((cat) => (
            <section className="menu-cat" id={`cat-${cat.id}`} key={cat.id}>
              <h2>{cat.name}</h2>
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
