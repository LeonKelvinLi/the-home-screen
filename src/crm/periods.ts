/*
  PERIODS AND COMPARISONS, the same on the server and the screen, with no
  database or browser in them so tools/audit-crm-periods.ts can test the
  arithmetic directly: day boundaries in Pacific time across daylight saving,
  the stretch each period is compared with, and how a change is worded.
*/

export type Unit = 'day' | 'week' | 'month'

export interface PeriodRange {
  since: number
  /** Exclusive: now, or the end of a custom range's last day. */
  until: number
  /** The stretch just before, of the same length, to compare with; none for all time. */
  prev: [number, number] | null
  unit: Unit
}

/** Thrown for a custom range that cannot be read; the server answers 400 with the message. */
export class PeriodError extends Error {}

export const PERIOD_KEYS = ['7d', '30d', '90d', '12m', 'month', 'year', 'all', 'custom'] as const

const TZ = 'America/Los_Angeles'
const DAY = 864e5
const PT_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const PT_HOUR = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' })

/** The Pacific calendar day of a moment, as "2026-09-22". */
export const pacificDay = (t: number) => PT_DAY.format(new Date(t))

/** Midnight Pacific at the start of a day; a day or month past either end rolls over, as in Date.UTC. */
export function ptMidnight(y: number, m: number, d: number): number {
  const winter = Date.UTC(y, m - 1, d, 8)
  // 08:00 UTC is midnight in winter and 1am in summer, when midnight is an hour earlier.
  return Number(PT_HOUR.format(new Date(winter))) === 1 ? winter - 36e5 : winter
}

/** Short spans by day, a season by week, anything longer by month. */
export const unitFor = (span: number): Unit => (span <= 45 * DAY ? 'day' : span <= 200 * DAY ? 'week' : 'month')

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const realDate = (x: RegExpExecArray) => {
  const dt = new Date(Date.UTC(+x[1], +x[2] - 1, +x[3]))
  return dt.getUTCFullYear() === +x[1] && dt.getUTCMonth() === +x[2] - 1 && dt.getUTCDate() === +x[3]
}

/**
 * A period as exact times, in whole Pacific days: "7 days" is today and the
 * six before, "12 months" is this month and the eleven before. The stretch it
 * is compared with has the same length, so today's unfinished day is weighed
 * against an equally unfinished stretch rather than a whole day. A custom
 * range is two dates, both included, ending no later than now.
 */
export function periodRange(period: unknown, t: number, custom: { start?: unknown; end?: unknown } = {}): PeriodRange {
  const [y, m, d] = pacificDay(t).split('-').map(Number)
  const rolling = (days: number, unit: Unit): PeriodRange => {
    const since = ptMidnight(y, m, d - (days - 1))
    return { since, until: t, prev: [since - (t - since), since], unit }
  }
  const sameDaysBefore = (since: number, before: number, unit: Unit): PeriodRange => ({
    since,
    until: t,
    prev: [before, Math.min(since, before + (t - since))],
    unit,
  })
  switch (period) {
    case '7d':
      return rolling(7, 'day')
    case '30d':
      return rolling(30, 'day')
    case '90d':
      return rolling(90, 'week')
    case '12m':
      return sameDaysBefore(ptMidnight(y, m - 11, 1), ptMidnight(y, m - 23, 1), 'month')
    case 'month':
      return sameDaysBefore(ptMidnight(y, m, 1), ptMidnight(y, m - 1, 1), 'day')
    case 'year':
      return sameDaysBefore(ptMidnight(y, 1, 1), ptMidnight(y - 1, 1, 1), 'month')
    case 'custom': {
      const a = DATE.exec(typeof custom.start === 'string' ? custom.start : '')
      const b = DATE.exec(typeof custom.end === 'string' ? custom.end : '')
      if (!a || !b) throw new PeriodError('A custom range needs a start and an end date, like 2026-09-01.')
      if (!realDate(a) || !realDate(b)) throw new PeriodError('That is not a real date.')
      if (+a[1] < 2020) throw new PeriodError('Pick a start date in 2020 or later.')
      const since = ptMidnight(+a[1], +a[2], +a[3])
      const until = Math.min(ptMidnight(+b[1], +b[2], +b[3] + 1), t)
      if (since >= until) throw new PeriodError('The start has to be before the end, and not in the future.')
      if (until - since > 5 * 366 * DAY) throw new PeriodError('Pick a range of five years or less.')
      return { since, until, prev: [since - (until - since), since], unit: unitFor(until - since) }
    }
    default:
      return { since: 0, until: t, prev: null, unit: 'month' }
  }
}

/* ------------------------------------------------------------ comparing */

export interface Change {
  /** up and down say which way it moved; whether that is good is the caller's call. */
  way: 'up' | 'down' | 'same'
  text: string
}

/**
 * How a number compares with the stretch before, in words. A percentage only
 * when the earlier number is not zero, because "up from nothing" has no
 * honest percentage: 24 against 0 reads "24 vs 0 in the 30 days before".
 * Nothing at all when there is nothing to compare with (all time, or a
 * stretch that was not tracked).
 */
export function compare(now: number, before: number | null | undefined, vs: string, show: (n: number) => string = (n) => n.toLocaleString('en-US')): Change | null {
  if (before === null || before === undefined || !vs) return null
  if (now === before) return { way: 'same', text: before === 0 ? `None in ${vs} either` : `Same as ${vs} (${show(before)})` }
  if (before === 0) return { way: 'up', text: `${show(now)} vs 0 in ${vs}` }
  const p = ((now - before) / before) * 100
  const rounded = Math.abs(p) < 10 ? Math.round(Math.abs(p) * 10) / 10 : Math.round(Math.abs(p))
  return { way: p > 0 ? 'up' : 'down', text: `${p > 0 ? '+' : '−'}${rounded}% vs ${vs} (${show(before)})` }
}

/* -------------------------------------------------------------- buckets */

/**
 * The buckets of a stretch, oldest first, named the way the server names
 * them: each day, the Monday of each week, or the 1st of each month.
 * Calendar arithmetic only, so no time zone can shift a key.
 */
export function bucketKeys(since: number, until: number, unit: Unit): string[] {
  const last = pacificDay(Math.max(since, until - 1))
  let [y, m, d] = pacificDay(since).split('-').map(Number)
  if (unit === 'week') d -= (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
  if (unit === 'month') d = 1
  const keys: string[] = []
  for (let i = 0; i < 400; i++) {
    const k = new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10)
    if (k > last) break
    keys.push(k)
    if (unit === 'day') d += 1
    else if (unit === 'week') d += 7
    else m += 1
  }
  return keys
}

const onDate = (k: string, o: Intl.DateTimeFormatOptions) => new Date(`${k}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...o })

/** A bucket as a chart labels it: "Sep 18", "Sep 14" (the Monday), or "Sep" ("Sep ’25" in another year). */
export function bucketName(k: string, unit: Unit, thisYear = new Date().getFullYear()): string {
  if (unit !== 'month') return onDate(k, { month: 'short', day: 'numeric' })
  const other = Number(k.slice(0, 4)) !== thisYear
  return `${onDate(k, { month: 'short' })}${other ? ` ’${k.slice(2, 4)}` : ''}`
}

/** Two moments as the days they fall on, both included: "Sep 16 – 22, 2026", "Aug 24 – Sep 22, 2026". */
export function daySpan(from: number, to: number): string {
  const a = pacificDay(from)
  const b = pacificDay(to)
  const year = (k: string) => k.slice(0, 4)
  if (a === b) return onDate(a, { month: 'short', day: 'numeric', year: 'numeric' })
  if (year(a) !== year(b)) return `${onDate(a, { month: 'short', day: 'numeric', year: 'numeric' })} – ${onDate(b, { month: 'short', day: 'numeric', year: 'numeric' })}`
  if (a.slice(0, 7) === b.slice(0, 7)) return `${onDate(a, { month: 'short', day: 'numeric' })} – ${Number(b.slice(8))}, ${year(b)}`
  return `${onDate(a, { month: 'short', day: 'numeric' })} – ${onDate(b, { month: 'short', day: 'numeric' })}, ${year(b)}`
}
