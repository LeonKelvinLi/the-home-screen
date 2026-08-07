import { useMemo, useState } from 'react'
import { AppChrome } from './AppChrome'
import { LISTED_KITCHENS } from '../data/brands'
import { EVENTS } from '../data/events'
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

  const eventsOn = (key: string) => EVENTS.filter((e) => e.date === key)
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
              <button className="cal-event" key={e.id} onClick={() => e.brandId && api.openApp(e.brandId)}>
                <span className="cal-event-when">{e.time ?? 'All day'}</span>
                <span className="cal-event-text">
                  <strong>{e.title}</strong>
                  <em>{e.business}</em>
                  {e.detail && <span>{e.detail}</span>}
                </span>
              </button>
            ))
          ) : (
            <div className="cal-empty">
              <p>Nothing posted for this day.</p>
              {/*
                Says why it is empty rather than leaving a customer to assume the
                businesses have nothing on. They may well have — there is simply
                no way for them to tell us yet.
              */}
              <p className="cal-empty-note">
                This is where the {LISTED_KITCHENS.length} businesses on the home screen will post a
                special, a pop-up or a one-day menu. None of them can post yet, so the calendar is
                empty everywhere — not just today.
              </p>
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
