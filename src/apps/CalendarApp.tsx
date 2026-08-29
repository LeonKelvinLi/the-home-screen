import { useEffect, useMemo, useState } from 'react'
import { upcoming } from '../data/news'
import { AppChrome } from './AppChrome'
import { LISTED_KITCHENS, brandById } from '../data/brands'
import { listEvents } from '../lib/api'
import type { PartnerEvent } from '../lib/api'
import type { ShellApi } from '../ios/Device'

/**
 * The calendar. A month at a time, with what the businesses on this home screen
 * have on.
 *
 * The operator's idea and a good one: the partners already run one-day things —
 * a special, a pop-up, a market stall — and there is nowhere on the app to say
 * so, which means the only way a customer finds out is by walking past.
 *
 * IT IS EMPTY, AND IT SAYS SO. `data/events.ts` is an empty list because nobody
 * has posted anything: there is no way for a partner to post yet. A calendar
 * seeded with plausible-looking specials would be inventing trading information
 * about real businesses, on specific dates, which is the worst kind of thing on
 * this app to make up — a customer could act on it and turn up to a shop that
 * knows nothing about it.
 */

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Local midnight, so a date compares by day rather than by instant. */
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function CalendarApp({ api }: { api: ShellApi }) {
  const today = useMemo(() => new Date(), [])
  const [offset, setOffset] = useState(0)
  const [picked, setPicked] = useState<string | null>(dayKey(today))

  const shown = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1)
    return d
  }, [today, offset])

  /*
    The grid. Leading blanks so the first of the month lands on its real
    weekday, then the days, then nothing — a trailing row of next month's dates
    is a nice touch on a real calendar and pure noise on one with no events.
  */
  const cells = useMemo(() => {
    const first = new Date(shown.getFullYear(), shown.getMonth(), 1)
    const days = new Date(shown.getFullYear(), shown.getMonth() + 1, 0).getDate()
    const lead = first.getDay()
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: days }, (_, i) => new Date(shown.getFullYear(), shown.getMonth(), i + 1)),
    ]
  }, [shown])

  /*
    Loaded per month, not all at once. `reachable` separates "nobody has posted
    anything" from "we could not ask" — telling a customer the month is empty
    when the server was simply unreachable is a different and worse thing to be
    wrong about.
  */
  const [events, setEvents] = useState<PartnerEvent[]>([])
  const [reachable, setReachable] = useState(true)

  useEffect(() => {
    let alive = true
    const first = dayKey(new Date(shown.getFullYear(), shown.getMonth(), 1))
    const last = dayKey(new Date(shown.getFullYear(), shown.getMonth() + 1, 0))
    void listEvents(first, last).then((r) => {
      if (!alive) return
      /*
        NEWS WITH A DATE ON IT LANDS HERE TOO.

        His spec: "when an affiliate posts news about an upcoming future event,
        that event will be posted on the calendar." A post carrying an
        eventDate is that event, so the two screens cannot disagree — the news
        page says something is happening and this is where you come to see when.

        Merged rather than written into the events table, because a news post
        and a calendar entry are one fact: copying it would let them drift the
        moment a post is edited. Ids are prefixed so nothing can collide with a
        real event, and anything outside the month on screen is dropped.
      */
      const fromNews = upcoming()
        .filter((n) => n.eventDate! >= first && n.eventDate! <= last)
        .map((n) => ({
          id: `news:${n.date}:${n.headline}`,
          date: n.eventDate!,
          brandId: n.authorId ?? '',
          title: n.headline,
          detail: n.body,
          postedBy: 'partner' as const,
        }))
      const seen = new Set(r.events.map((e) => e.id))
      setEvents([...r.events, ...fromNews.filter((e) => !seen.has(e.id))])
      setReachable(r.ok)
    })
    return () => {
      alive = false
    }
  }, [shown])

  const eventsOn = (key: string) => events.filter((e) => e.date === key)
  const pickedEvents = picked ? eventsOn(picked) : []
  const todayKey = dayKey(today)

  return (
    <AppChrome title={MONTHS[shown.getMonth()]} onBack={api.closeApp} tint="#E5433B">
      <div className="cal">
        <div className="cal-head">
          <button className="cal-nav" onClick={() => setOffset((o) => o - 1)} aria-label="Previous month">
            <Chevron dir="left" />
          </button>
          <span className="cal-title">
            {MONTHS[shown.getMonth()]} {shown.getFullYear()}
          </span>
          <button className="cal-nav" onClick={() => setOffset((o) => o + 1)} aria-label="Next month">
            <Chevron dir="right" />
          </button>
        </div>

        <div className="cal-weekdays" aria-hidden="true">
          {WEEKDAYS.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>

        <div className="cal-grid" role="grid">
          {cells.map((d, i) => {
            if (!d) return <span className="cal-cell is-blank" key={`b${i}`} />
            const key = dayKey(d)
            const count = eventsOn(key).length
            return (
              <button
                key={key}
                className={`cal-cell${key === todayKey ? ' is-today' : ''}${key === picked ? ' is-picked' : ''}`}
                onClick={() => setPicked(key)}
                aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]}${count ? `, ${count} event${count === 1 ? '' : 's'}` : ''}`}
                aria-current={key === todayKey ? 'date' : undefined}
              >
                <span className="cal-num">{d.getDate()}</span>
                {/* A dot only where something is genuinely posted. */}
                {count > 0 && <span className="cal-dot" aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        <div className="cal-day">
          {pickedEvents.length > 0 ? (
            pickedEvents.map((e) => (
              <button className="cal-event" key={e.id} onClick={() => api.openApp(e.brandId)}>
                <span className="cal-event-when">{e.time ?? 'All day'}</span>
                <span className="cal-event-text">
                  <strong>{e.title}</strong>
                  <em>{brandById(e.brandId)?.name ?? 'A business on this screen'}</em>
                  {e.detail && <span>{e.detail}</span>}
                </span>
              </button>
            ))
          ) : (
            <div className="cal-empty">
              <p>{reachable ? 'Nothing posted for this day.' : 'Could not load the calendar.'}</p>
              {/*
                Says why it is empty rather than leaving a customer to assume the
                businesses have nothing on. They may well have — there is simply
                no way for them to tell us yet.
              */}
              {reachable ? (
                <p className="cal-empty-note">
                  This is where the {LISTED_KITCHENS.length} businesses on the home screen post a
                  special, a pop-up or a one-day menu. Nothing has been posted for this day.
                </p>
              ) : (
                <p className="cal-empty-note">
                  The connection failed, so this month could not be checked. It does not mean the
                  businesses have nothing on.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AppChrome>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}
