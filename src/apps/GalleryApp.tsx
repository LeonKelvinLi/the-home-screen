import { AppChrome } from './AppChrome'
import { GALLERY, byMonth } from '../data/gallery'
import type { ShellApi } from '../ios/Device'

/**
 * Biggie's pictures, in a window over the home screen.
 *
 * The operator's ask: a window icon beside the home button that opens "another
 * window within the web" for the photographs on @beasty_pages, with dates, and
 * modern.
 *
 * Grouped by month rather than listed flat, because a date under every tile in
 * a long strip is noise — the month is the thing you scan for, and the exact
 * day belongs on the picture you have stopped at.
 */
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const DAY = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' })

export function GalleryApp({ api }: { api: ShellApi }) {
  const months = byMonth(GALLERY)

  return (
    <AppChrome title="BEASTY" onBack={api.closeApp} tint="#141416">
      <div className="gal">
        {months.map(([key, shots]) => (
          <section className="gal-month" key={key}>
            <h2 className="gal-month-head">{MONTH.format(new Date(key + '-01T00:00:00Z'))}</h2>
            <div className="gal-grid">
              {shots.map((s) => (
                <figure className="gal-item" key={s.src}>
                  {/*
                    The picture links to its own post, so his caption can always
                    be checked against the thing he actually wrote — WHERE THERE
                    IS ONE. The seventeen that arrived as screenshots carry no
                    shortcode and therefore no link, and an anchor with no href
                    is not a link: it looks identical, takes the tap and does
                    nothing. A plain image says what it is.
                  */}
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noreferrer">
                      <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                    </a>
                  ) : (
                    <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                  )}
                  <figcaption>
                    <time dateTime={s.taken}>{DAY.format(new Date(s.taken + 'T00:00:00Z'))}</time>
                    {s.caption && <span>{s.caption}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}

        <a className="gal-link" href="https://www.instagram.com/beasty_pages/" target="_blank" rel="noreferrer">
          See them all on Instagram
        </a>
      </div>
    </AppChrome>
  )
}
