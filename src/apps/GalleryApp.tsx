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
    <AppChrome title="Biggie" onBack={api.closeApp} tint="#141416">
      <div className="gal">
        {months.map(([key, shots]) => (
          <section className="gal-month" key={key}>
            <h2 className="gal-month-head">{MONTH.format(new Date(key + '-01T00:00:00Z'))}</h2>
            <div className="gal-grid">
              {shots.map((s) => (
                <figure className="gal-item" key={s.src}>
                  <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                  <figcaption>
                    <time dateTime={s.taken}>{DAY.format(new Date(s.taken + 'T00:00:00Z'))}</time>
                    {s.caption && <span>{s.caption}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}

        {/*
          SAYS WHAT IS MISSING AND WHY. An almost-empty gallery with no
          explanation reads as broken; this one is short because Instagram would
          not hand the pictures over, which is a fact worth printing rather than
          hiding behind a spinner.
        */}
        <p className="gal-note">
          More of these live on Instagram. They are not pulled in automatically — Instagram does
          not allow it — so they are added here by hand.
        </p>
        <a className="gal-link" href="https://www.instagram.com/beasty_pages/" target="_blank" rel="noreferrer">
          See them all on Instagram
        </a>
      </div>
    </AppChrome>
  )
}
