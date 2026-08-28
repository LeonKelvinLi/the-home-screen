import { AppChrome } from './AppChrome'
import { BrandLogo } from '../ios/BrandLogo'
import { NEWS, newsDate } from '../data/news'
import { brandById } from '../data/brands'
import type { ShellApi } from '../ios/Device'

/**
 * BEASTY news.
 *
 * A directory's news is the directory changing — a city opening, businesses
 * joining, the page getting its own address — so every item here names
 * something a reader can go and look at. There is no editorial voice and there
 * are no announcements of things that have not happened yet; the Rewards
 * screen is the standing example of what that costs.
 *
 * TAPPING A LOGO OPENS THAT BUSINESS, which is the point of showing them: the
 * item says fourteen joined, and the icons are the fourteen.
 */
export function NewsApp({ api }: { api: ShellApi }) {
  return (
    <AppChrome title="News" onBack={api.closeApp} tint="#E8C800">
      <div className="news">
        {NEWS.map((item) => {
          /* A brand that has since been removed is dropped rather than drawn as
             a hole — the feed is history, and history keeps naming things that
             have moved on. */
          const brands = (item.brands ?? []).map(brandById).filter(Boolean)
          return (
            <article className="news-item" key={item.date + item.headline}>
              <p className="news-date">{newsDate(item.date)}</p>
              <h2 className="news-headline">{item.headline}</h2>
              <p className="news-body">{item.body}</p>
              {brands.length > 0 && (
                <div className="news-brands">
                  {brands.map((b) => (
                    <button
                      key={b!.id}
                      className="news-brand"
                      onClick={() => api.openApp(b!.id)}
                      aria-label={b!.name}
                    >
                      <BrandLogo logo={b!.logo} size={46} />
                      <span>{b!.iconLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </article>
          )
        })}

        <p className="brand-foot">
          Everything here has already happened. Nothing on this screen is a plan.
        </p>
      </div>
    </AppChrome>
  )
}
