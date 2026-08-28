import { useMemo, useState } from 'react'
import { AppChrome } from './AppChrome'
import { BrandLogo } from '../ios/BrandLogo'
import { currentNews, archivedNews, dayLabel, KIND_LABEL, type NewsItem } from '../data/news'
import { brandById } from '../data/brands'
import type { ShellApi } from '../ios/Device'

/**
 * BEASTY News.
 *
 * A feed people are meant to open daily, so it is built as a feed and not as a
 * changelog: one card per post, the kind of news it is said before the
 * headline, the day it landed carried by a divider rather than repeated on
 * every entry, and the businesses it is about tappable underneath.
 *
 * THE CALENDAR SITS AT THE TOP because he asked for it there — "within this
 * news page, there will be a direct calendar button to access the calendar" —
 * and because the two halves are one idea: an affiliate posts that something is
 * happening, and the calendar is where you go to see when.
 *
 * ARCHIVED POSTS ARE REACHABLE, NOT GONE. His rule is thirty days on the front
 * page. Deleting them at thirty days would make the page lie about a business
 * that did hold the event it announced.
 */
export function NewsApp({ api }: { api: ShellApi }) {
  const now = Date.now()
  const live = useMemo(() => currentNews(now), [now])
  const archive = useMemo(() => archivedNews(now), [now])
  const [showArchive, setShowArchive] = useState(false)

  return (
    <AppChrome title="News" onBack={api.closeApp} tint="#141416">
      <div className="news">
        <p className="news-intro">
          What is happening across the directory — new affiliates, events, sales and openings.
          Anyone can read it; BEASTY affiliates post it.
        </p>

        <button className="news-calendar" onClick={() => api.openApp('sys.calendar')}>
          <CalendarGlyph />
          <span>
            <strong>Open the calendar</strong>
            <small>Everything with a date on it, in one month view</small>
          </span>
          <Chevron />
        </button>

        <Feed items={live} now={now} api={api} />

        {live.length === 0 && (
          <p className="news-empty">Nothing in the last thirty days. Check the archive below.</p>
        )}

        {archive.length > 0 && (
          <>
            <button
              className="news-archive-toggle"
              onClick={() => setShowArchive((v) => !v)}
              aria-expanded={showArchive}
            >
              {showArchive ? 'Hide the archive' : `Archive — ${archive.length} older ${archive.length === 1 ? 'post' : 'posts'}`}
            </button>
            {showArchive && <Feed items={archive} now={now} api={api} archived />}
          </>
        )}

        <p className="brand-foot">
          Posts drop off the front page after thirty days and stay in the archive. Everything here
          has already been announced by the business it is about.
        </p>
      </div>
    </AppChrome>
  )
}

function Feed({
  items,
  now,
  api,
  archived,
}: {
  items: NewsItem[]
  now: number
  api: ShellApi
  archived?: boolean
}) {
  let lastDay = ''
  return (
    <div className={`news-feed${archived ? ' is-archived' : ''}`}>
      {items.map((item) => {
        /* The day is a divider, not a line on every card — a run of posts from
           one day should read as one day. */
        const day = dayLabel(item.date, now)
        const newDay = day !== lastDay
        lastDay = day
        const author = item.authorId ? brandById(item.authorId) : undefined
        const brands = (item.brands ?? []).map(brandById).filter(Boolean)
        return (
          <section key={item.date + item.headline}>
            {newDay && <p className="news-day">{day}</p>}
            <article className="news-card">
              <header className="news-card-head">
                <span className={`news-kind is-${item.kind}`}>{KIND_LABEL[item.kind]}</span>
                {/*
                  THE AUTHOR IS ONLY WORTH SAYING WHEN IT IS NOT US. A BEASTY
                  post rendered "BEASTY  BEASTY" — the kind chip and the author
                  saying the same word side by side. Whose page this is, is the
                  default; an affiliate posting on it is the thing that needs
                  naming, and it names them with their own mark.
                */}
                {author && (
                  <button className="news-author" onClick={() => api.openApp(author.id)}>
                    <BrandLogo logo={author.logo} size={20} />
                    <span>{author.name}</span>
                  </button>
                )}
              </header>
              <h2 className="news-headline">{item.headline}</h2>
              <p className="news-body">{item.body}</p>
              {item.eventDate && (
                <p className="news-when">
                  <CalendarGlyph small /> {dayLabel(item.eventDate, now)}
                </p>
              )}
              {brands.length > 0 && (
                <div className="news-brands">
                  {brands.map((b) => (
                    <button
                      key={b!.id}
                      className="news-brand"
                      onClick={() => api.openApp(b!.id)}
                      aria-label={b!.name}
                    >
                      <BrandLogo logo={b!.logo} size={44} />
                      <span>{b!.iconLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </article>
          </section>
        )
      })}
    </div>
  )
}

/* Drawn, like every other mark in this app. */
function CalendarGlyph({ small }: { small?: boolean }) {
  const s = small ? 13 : 22
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg className="news-chev" width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true">
      <path d="M1.5 1.5 7 7.5l-5.5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
