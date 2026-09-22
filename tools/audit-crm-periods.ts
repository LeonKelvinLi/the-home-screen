/*
  THE HOME SCREEN'S PERIOD ARITHMETIC, tested directly: no server, no
  database. Every number on the CRM's Home rests on these, so a wrong
  boundary here would be a wrong number everywhere.

  Pacific day boundaries (including both daylight-saving changes), the
  stretch each period is compared with (same length, so today's unfinished
  day is weighed against an equally unfinished stretch), custom ranges and
  their refusals, the wording of a change (no percentage from zero), and the
  buckets the charts draw.

      npx tsx tools/audit-crm-periods.ts
*/
import { PeriodError, bucketKeys, bucketName, compare, daySpan, pacificDay, periodRange, ptMidnight, unitFor } from '../src/crm/periods'

let passed = 0
let failed = 0
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) passed++
  else failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}
const iso = (t: number) => new Date(t).toISOString()
const throws = (f: () => unknown, match: RegExp) => {
  try {
    f()
    return false
  } catch (e) {
    return e instanceof PeriodError && match.test((e as Error).message)
  }
}

/* midnight, both sides of daylight saving */
check('midnight in summer is 07:00 UTC', iso(ptMidnight(2026, 9, 22)) === '2026-09-22T07:00:00.000Z')
check('midnight in winter is 08:00 UTC', iso(ptMidnight(2026, 12, 1)) === '2026-12-01T08:00:00.000Z')
check('the fall-back Sunday starts at a summer midnight', iso(ptMidnight(2026, 11, 1)) === '2026-11-01T07:00:00.000Z')
check('the spring-forward Sunday starts at a winter midnight', iso(ptMidnight(2026, 3, 8)) === '2026-03-08T08:00:00.000Z')
check('a day past the month rolls over', iso(ptMidnight(2026, 9, 31)) === '2026-10-01T07:00:00.000Z')
check('a day before the month rolls back', iso(ptMidnight(2026, 9, -6)) === '2026-08-25T07:00:00.000Z')

/* rolling periods: whole Pacific days, compared with the same length before */
const t = Date.UTC(2026, 8, 22, 21, 0) // Tue Sep 22 2026, 2:00 pm Pacific
const d7 = periodRange('7d', t)
check('7 days is today and the six before', iso(d7.since) === '2026-09-16T07:00:00.000Z' && d7.until === t && d7.unit === 'day')
check('and is compared with the same length just before', d7.prev![1] === d7.since && d7.since - d7.prev![0] === t - d7.since, `${iso(d7.prev![0])}`)
const d30 = periodRange('30d', t)
check('30 days starts Aug 24', iso(d30.since) === '2026-08-24T07:00:00.000Z' && bucketKeys(d30.since, d30.until, 'day').length === 30)
check('its comparison covers Jul 25 to Aug 23', daySpan(d30.prev![0], d30.prev![1] - 1) === 'Jul 25 – Aug 23, 2026', daySpan(d30.prev![0], d30.prev![1] - 1))
const d90 = periodRange('90d', t)
check('90 days is counted by week', iso(d90.since) === '2026-06-25T07:00:00.000Z' && d90.unit === 'week')
const y12 = periodRange('12m', t)
check('12 months is this month and the eleven before, by month', iso(y12.since) === '2025-10-01T07:00:00.000Z' && y12.unit === 'month')
check('compared with the same stretch a year earlier', iso(y12.prev![0]) === '2024-10-01T07:00:00.000Z' && y12.prev![1] - y12.prev![0] === t - y12.since)
check('all time has nothing to compare with', periodRange('all', t).prev === null && periodRange('all', t).since === 0)

/* across the clock changes */
const afterFallBack = Date.UTC(2026, 10, 3, 20) // Tue Nov 3 2026, noon Pacific (winter)
check('7 days reaching back across fall-back starts at a summer midnight', iso(periodRange('7d', afterFallBack).since) === '2026-10-28T07:00:00.000Z')
const afterSpring = Date.UTC(2026, 2, 10, 20) // Tue Mar 10 2026, 1:00 pm Pacific (summer)
check('7 days reaching back across spring-forward starts at a winter midnight', iso(periodRange('7d', afterSpring).since) === '2026-03-04T08:00:00.000Z')
check('a day list across fall-back has no gap and no repeat', bucketKeys(ptMidnight(2026, 10, 30), ptMidnight(2026, 11, 3), 'day').join() === '2026-10-30,2026-10-31,2026-11-01,2026-11-02')

/* this month, with a short month before it */
const m31 = Date.UTC(2026, 2, 31, 19) // Mar 31 2026, noon Pacific
const month = periodRange('month', m31)
check('this month starts on the 1st', iso(month.since) === '2026-03-01T08:00:00.000Z')
check('its comparison stops at the end of February, never runs into March', month.prev![1] === month.since, iso(month.prev![1]))

/* custom ranges */
const c = periodRange('custom', t, { start: '2026-09-01', end: '2026-09-15' })
check('a custom range includes both dates', iso(c.since) === '2026-09-01T07:00:00.000Z' && iso(c.until) === '2026-09-16T07:00:00.000Z' && c.unit === 'day')
check('and is compared with the 15 days before it', iso(c.prev![0]) === '2026-08-17T07:00:00.000Z' && c.prev![1] === c.since)
check('an end in the future stops at now', periodRange('custom', t, { start: '2026-09-01', end: '2026-12-31' }).until === t)
check('a long custom range is counted by month', periodRange('custom', t, { start: '2025-01-01', end: '2026-09-22' }).unit === 'month')
check('a missing date is refused', throws(() => periodRange('custom', t, { start: '2026-09-01' }), /start and an end/))
check('a date that does not exist is refused', throws(() => periodRange('custom', t, { start: '2026-02-30', end: '2026-03-02' }), /real date/))
check('a start after the end is refused', throws(() => periodRange('custom', t, { start: '2026-09-15', end: '2026-09-01' }), /before the end/))
check('a start in the future is refused', throws(() => periodRange('custom', t, { start: '2026-12-01', end: '2026-12-05' }), /before the end/))
check('a start before 2020 is refused', throws(() => periodRange('custom', t, { start: '2019-12-31', end: '2020-01-05' }), /2020/))
check('more than five years is refused', throws(() => periodRange('custom', t, { start: '2020-01-01', end: '2026-09-01' }), /five years/))
check('the unit follows the length', unitFor(30 * 864e5) === 'day' && unitFor(90 * 864e5) === 'week' && unitFor(365 * 864e5) === 'month')

/* how a change is worded */
const vs = 'the 30 days before'
check('a rise shows a whole percentage and the earlier number', compare(24, 19, vs)?.text === '+26% vs the 30 days before (19)' && compare(24, 19, vs)?.way === 'up', compare(24, 19, vs)?.text)
check('a small change keeps one decimal', compare(1033, 1000, vs)?.text === '+3.3% vs the 30 days before (1,000)', compare(1033, 1000, vs)?.text)
check('a fall is a minus sign, not a hyphen', compare(0, 5, vs)?.text === '−100% vs the 30 days before (5)' && compare(0, 5, vs)?.way === 'down')
check('up from zero shows no percentage', compare(24, 0, vs)?.text === '24 vs 0 in the 30 days before')
check('zero and zero says so', compare(0, 0, vs)?.text === 'None in the 30 days before either' && compare(0, 0, vs)?.way === 'same')
check('no change says so', compare(5, 5, vs)?.text === 'Same as the 30 days before (5)')
check('nothing to compare with shows nothing', compare(5, null, vs) === null && compare(5, 3, '') === null)
check('money is worded in money', compare(14900, 0, vs, (n) => `$${n / 100}`)?.text === '$149 vs 0 in the 30 days before')

/* buckets and dates */
check('weeks start on the Monday', bucketKeys(ptMidnight(2026, 9, 16), t, 'week').join() === '2026-09-14,2026-09-21')
check('months start on the 1st', bucketKeys(y12.since, t, 'month').length === 12 && bucketKeys(y12.since, t, 'month')[0] === '2025-10-01')
check('a bucket in another year says which', bucketName('2025-10-01', 'month', 2026) === 'Oct ’25' && bucketName('2026-09-01', 'month', 2026) === 'Sep')
check('a span in one month names it once', daySpan(ptMidnight(2026, 9, 16), t) === 'Sep 16 – 22, 2026', daySpan(ptMidnight(2026, 9, 16), t))
check('a span across years names both', daySpan(ptMidnight(2025, 12, 28), ptMidnight(2026, 1, 3)) === 'Dec 28, 2025 – Jan 3, 2026')
check('one second before midnight is still the day before', pacificDay(ptMidnight(2026, 9, 22) - 1000) === '2026-09-21' && pacificDay(ptMidnight(2026, 9, 22)) === '2026-09-22')

console.log(`\n${passed}/${passed + failed} checks passed`)
if (failed) {
  console.log('FAIL')
  process.exit(1)
}
console.log('\nPASS: periods, comparisons and buckets are right across time zones and clock changes.')
