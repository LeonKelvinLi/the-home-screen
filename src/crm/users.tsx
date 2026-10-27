/*
  USERS ON THE HOME SCREEN: the people with a BEASTY account. Never leads
  (businesses the team is selling to) and never the team.

  Every number answers three things on its face: what it counts, over which
  days, and what it is compared with. Anything that rests on activity
  tracking says when tracking began, and a stretch it did not cover reads
  "not tracked", never 0. Definitions live in server/crm/users.ts and
  server/analytics.ts; the words here repeat them.

  Names and contacts appear in one place, the sign-up list and a cohort's
  list, and only for an admin: the server refuses anybody else.
*/
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ChartCard, HBars, Line, StatTile } from './charts'
import { bucketKeys, bucketName, compare, daySpan, pacificDay } from './periods'
import type { Unit } from './periods'
import { api } from './api'
import { Empty, Failure, Loading, pct, plural, useApi, useCrm } from './ui'
import { Icon } from './icons'

export interface UsersData {
  trackingSince: number
  activation: string
  total: number
  leftOut: number
  first: number | null
  latest: number | null
  added: number
  addedBefore: number | null
  growth: { atStart: number; added: number; atEnd: number }
  series: { bucket: string; count: number }[]
  prevSeries: { bucket: string; count: number }[]
  active: { n: number; returning: number; fresh: number; since: number; whole: boolean } | null
  activeBefore: { n: number; returning: number } | null
  activated: { signedUp: number; n: number }
  sources: { key: string; label: string; count: number }[]
  /** Every member by "City, ST" (Glenn, 2026-10-19). Optional for an older server. */
  homes?: { key: string; label: string; count: number }[]
  funnel: { since: number; steps: { key: string; label: string; count: number }[] } | null
  engagement: { since: number; rows: { name: string; label: string; times: number; people: number }[] } | null
}

/** The period every number under the picker follows, in the words the screen uses. */
export interface Scope {
  key: string
  /** "Last 30 days" */
  title: string
  /** "Aug 24 – Sep 22, 2026" */
  range: string
  /** "in the last 30 days" */
  phrase: string
  /** What the stretch before is called ("the 30 days before"), or '' when there is none. */
  vs: string
  unit: Unit
  since: number
  until: number
  /** Where the charts start: the period's start, or the first record for all time. */
  from: number
  prev: [number, number] | null
}

const count = (n: number) => n.toLocaleString('en-US')
const day = (t: number) => new Date(t).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric' })
const clock = (t: number) => new Date(t).toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' })
const upper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** A section's heading, with the days it covers beside it. */
export function BlockHead({ id, title, scope, note }: { id: string; title: string; scope?: string; note?: ReactNode }) {
  return (
    <header className="crm-block-head">
      <div>
        <h2 id={id}>
          {title}
          {scope && <span>{scope}</span>}
        </h2>
        {note && <p>{note}</p>}
      </div>
    </header>
  )
}

/** A card's plain-words setup state, for something that fills in once tracking has run for a while. */
function Waiting({ children }: { children: ReactNode }) {
  return (
    <p className="crm-chart-empty is-waiting">
      <Icon name="clock" size={18} />
      <span>{children}</span>
    </p>
  )
}

export function UsersBlock({ u, scope, busy }: { u: UsersData; scope: Scope; busy: boolean }) {
  const { actor } = useCrm()
  const admin = actor.role === 'admin'
  const tracked = day(u.trackingSince)
  const keys = bucketKeys(scope.from, scope.until, scope.unit)
  const prevKeys = scope.prev ? bucketKeys(scope.prev[0], scope.prev[1], scope.unit) : []
  const by = (s: { bucket: string; count: number }[]) => new Map(s.map((x) => [x.bucket, x.count]))
  const now = by(u.series)
  const was = by(u.prevSeries)
  const signups = keys.map((k) => ({ label: bucketName(k, scope.unit), value: now.get(k) ?? 0 }))
  const before = prevKeys.map((k) => ({ label: bucketName(k, scope.unit), value: was.get(k) ?? 0 }))
  const sources = u.sources.map((s) => ({ label: s.label, value: s.count, muted: s.key === 'unknown' }))

  return (
    <section className="crm-block" aria-labelledby="users-h">
      <BlockHead
        id="users-h"
        title="Users"
        scope={`${scope.title}, ${scope.range}`}
        note={u.leftOut > 0 ? `${plural(u.leftOut, 'test account is', 'test accounts are')} left out.` : undefined}
      />

      <div className={`crm-kpi-row${busy ? ' is-busy' : ''}`}>
        <StatTile
          label="New sign-ups"
          scope={scope.title}
          value={count(u.added)}
          change={compare(u.added, u.addedBefore, scope.vs)}
          trend={signups.map((x) => x.value)}
        />
        <StatTile
          label="Active users"
          scope={scope.title}
          value={u.active ? count(u.active.n) : 'Not tracked'}
          pending={!u.active}
          change={u.active?.whole && u.activeBefore ? compare(u.active.n, u.activeBefore.n, scope.vs) : null}
          note={u.active && !u.active.whole ? `since tracking began ${tracked}` : undefined}
        />
        <StatTile
          label="Returning users"
          scope={scope.title}
          value={u.active && scope.key !== 'all' ? count(u.active.returning) : u.active ? '—' : 'Not tracked'}
          pending={!u.active || scope.key === 'all'}
          change={u.active?.whole && u.activeBefore ? compare(u.active.returning, u.activeBefore.returning, scope.vs) : null}
        />
        <StatTile
          label="Activated"
          scope={scope.title}
          value={u.activated.signedUp ? pct(u.activated.n / u.activated.signedUp) : '—'}
          pending={!u.activated.signedUp}
          note={u.activated.signedUp ? `${count(u.activated.n)} of the ${count(u.activated.signedUp)} who signed up` : undefined}
        />
      </div>

      <div className="crm-dash-row is-main-side">
        <ChartCard
          title="New sign-ups"
          table={{
            head: [scope.unit === 'day' ? 'Day' : scope.unit === 'week' ? 'Week of' : 'Month', 'Sign-ups', ...(before.length ? [upper(scope.vs)] : [])],
            rows: signups.map((x, i) => [x.label, x.value, ...(before.length ? [before[i] ? `${before[i].label}: ${before[i].value}` : '—'] : [])]),
          }}
        >
          <Line
            points={signups}
            color="var(--viz-1)"
            unit="new sign-ups"
            name={scope.title}
            compare={before.length ? { label: upper(scope.vs), points: before } : undefined}
            empty={`No sign-ups ${scope.phrase}.`}
          />
        </ChartCard>
        <section className="crm-card-chart crm-growth" aria-labelledby="growth-h">
          <header>
            <div>
              <h3 id="growth-h">How the total grew</h3>
            </div>
          </header>
          <dl>
            <div>
              <dt>Before {daySpan(scope.from, scope.from)}</dt>
              <dd>{count(u.growth.atStart)}</dd>
            </div>
            <div>
              <dt>Signed up {scope.phrase}</dt>
              <dd className="is-up">+{count(u.growth.added)}</dd>
            </div>
            <div className="is-total">
              <dt>{scope.key === 'custom' ? `At the end of ${daySpan(scope.until - 1, scope.until - 1)}` : 'Now'}</dt>
              <dd>{count(u.growth.atEnd)}</dd>
            </div>
          </dl>
          {u.latest && (
            <p className="crm-fine">
              Latest sign-up: {day(u.latest)}, {clock(u.latest)} Pacific.
            </p>
          )}
        </section>
      </div>

      <div className="crm-dash-row">
        <ChartCard
          title="Where users came from"
          table={{ head: ['Source', 'Sign-ups', 'Share'], rows: sources.map((s) => [s.label, s.value, u.added ? pct(s.value / u.added) : '—']) }}
        >
          <HBars rows={sources} total={u.added} empty={`No sign-ups ${scope.phrase}.`} />
        </ChartCard>
        <Funnel f={u.funnel} />
      </div>

      {u.homes && u.homes.length > 0 && (
        <div className="crm-dash-row">
          <ChartCard
            title="Where members live"
            table={{ head: ['City', 'Members', 'Share'], rows: u.homes.map((h) => [h.label, h.count, u.total ? pct(h.count / u.total) : '—']) }}
          >
            <HBars
              rows={u.homes.map((h) => ({ label: h.label, value: h.count, muted: h.key === 'unknown' }))}
              total={u.total}
              empty="No member has given a city yet."
            />
          </ChartCard>
        </div>
      )}

      <Cohorts admin={admin} tracked={tracked} />

      {admin && <RecentSignups scope={scope} />}

      <Engagement e={u.engagement} />
    </section>
  )
}

/* --------------------------------------------------------------- funnel */

function Funnel({ f }: { f: UsersData['funnel'] }) {
  const top = f ? Math.max(...f.steps.map((s) => s.count), 1) : 1
  return (
    <section className="crm-card-chart crm-funnel" aria-labelledby="funnel-h">
      <header>
        <div>
          <h3 id="funnel-h">Sign-up funnel</h3>
        </div>
      </header>
      {!f ? (
        <Waiting>Not tracked for these days.</Waiting>
      ) : !f.steps.some((s) => s.count) ? (
        <Waiting>Nothing yet.</Waiting>
      ) : (
        <ol>
          {f.steps.map((s, i) => (
            <li key={s.key}>
              <span className="crm-funnel-label">{s.label}</span>
              <span className="crm-funnel-bar">
                <i style={{ width: `${(s.count / top) * 100}%` }} />
              </span>
              <b>{count(s.count)}</b>
              <small>{i > 0 && f.steps[i - 1].count ? pct(s.count / f.steps[i - 1].count) : ''}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/* ------------------------------------------------------------ engagement */

function Engagement({ e }: { e: UsersData['engagement'] }) {
  return (
    <section className="crm-card-chart" aria-labelledby="eng-h">
      <header>
        <div>
          <h3 id="eng-h">What users did</h3>
        </div>
      </header>
      {!e || !e.rows.length ? (
        <Waiting>Nothing tracked yet.</Waiting>
      ) : (
        <table className="crm-chart-table crm-engage">
          <thead>
            <tr>
              <th>Action</th>
              <th>People</th>
              <th>Times</th>
            </tr>
          </thead>
          <tbody>
            {e.rows.map((r) => (
              <tr key={r.name}>
                <td>{r.label}</td>
                <td>{count(r.people)}</td>
                <td>{count(r.times)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

/* -------------------------------------------------------------- cohorts */

interface CohortData {
  unit: 'week' | 'month'
  trackingSince: number
  columns: number[]
  rows: { key: string; size: number; activated: number; cells: { k: number; state: 'ok' | 'waiting' | 'untracked'; n: number | null; share: number | null }[] }[]
}

const cohortName = (key: string, unit: 'week' | 'month') => {
  if (unit === 'month') return new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })
  const [y, m, d] = key.split('-').map(Number)
  const end = new Date(Date.UTC(y, m - 1, d + 6)).toISOString().slice(0, 10)
  const a = bucketName(key, 'day')
  const b = bucketName(end, 'day')
  return a.slice(0, 3) === b.slice(0, 3) ? `${a} – ${b.slice(4)}` : `${a} – ${b}`
}

function Cohorts({ admin, tracked }: { admin: boolean; tracked: string }) {
  const [unit, setUnit] = useState<'week' | 'month'>('week')
  const [open, setOpen] = useState<string | null>(null)
  const { data, error, reload } = useApi<CohortData>(`/api/crm/users/cohorts?unit=${unit}`)
  const word = unit === 'week' ? 'Week' : 'Month'
  return (
    <section className="crm-card-chart crm-cohorts is-wrap" aria-labelledby="cohort-h">
      <header>
        <div>
          {/* Plain words, not "cohorts": Glenn, 2026-09-23, "I just had to google
              that word". */}
          <h3 id="cohort-h">Do they come back?</h3>
        </div>
        <div className="crm-seg" role="tablist" aria-label="Group sign-ups by">
          {(['week', 'month'] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={unit === k} className={unit === k ? 'is-on' : undefined} onClick={() => { setUnit(k); setOpen(null) }}>
              {k === 'week' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </header>
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : !data.rows.length ? (
        <p className="crm-chart-empty">No sign-ups yet.</p>
      ) : (
        <>
          <div className="crm-cohort-wrap">
            <table className="crm-cohort-table">
              <thead>
                <tr>
                  <th scope="col">{unit === 'week' ? 'Week of' : 'Month of'}</th>
                  <th scope="col">Signed up</th>
                  <th scope="col">Activated</th>
                  {data.columns.map((k) => (
                    <th key={k} scope="col">
                      {word} {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.key} className={open === r.key ? 'is-open' : undefined}>
                    <th scope="row">
                      {admin ? (
                        <button type="button" onClick={() => setOpen(open === r.key ? null : r.key)} aria-expanded={open === r.key}>
                          {cohortName(r.key, data.unit)}
                          <Icon name="chevronRight" size={14} />
                        </button>
                      ) : (
                        cohortName(r.key, data.unit)
                      )}
                    </th>
                    <td>{count(r.size)}</td>
                    <td>
                      {count(r.activated)} <small>{r.size ? pct(r.activated / r.size) : ''}</small>
                    </td>
                    {r.cells.map((c) =>
                      c.state === 'ok' ? (
                        <td key={c.k} className="is-cell" style={{ ['--share' as string]: String(c.share ?? 0) }} title={`${c.n} of ${r.size}`}>
                          {pct(c.share ?? 0)}
                        </td>
                      ) : (
                        <td key={c.k} className={`is-cell is-${c.state}`} title={c.state === 'waiting' ? 'Not over yet' : 'Before tracking began'}>
                          {c.state === 'waiting' ? '' : '—'}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="crm-cohort-key">
            <span>
              <i className="is-untracked" /> — before tracking began ({tracked})
            </span>
            <span>
              <i className="is-waiting" /> blank: not over yet
            </span>
          </p>
          {admin && open && <CohortPeople cohort={open} unit={data.unit} onClose={() => setOpen(null)} />}
        </>
      )}
    </section>
  )
}

/* ------------------------------------------------------- the people list */

interface UserRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  signedUpAt: number
  tier: string
  tierStatus: string
  source: string
  sourceLabel: string
  referrerName: string | null
  joinedVia: string | null
  activated: boolean
  lastActiveAt: number | null
  actions: number
  firstAction: { at: number; label: string } | null
}

interface UserPage {
  total: number
  trackingSince: number
  users: UserRow[]
}

const status = (u: UserRow) => {
  const tier = u.tier === 'free' ? 'Free' : u.tier === 'pass' ? 'Pass' : 'Diamond'
  const pay = u.tier === 'free' ? '' : u.tierStatus === 'active' ? ', paid' : u.tierStatus === 'pending' ? ', not paid yet' : u.tierStatus === 'lapsed' ? ', lapsed' : ''
  return `${tier}${pay}`
}

const weekOf = (t: number) => {
  const k = pacificDay(t)
  const [y, m, d] = k.split('-').map(Number)
  const back = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
  return cohortName(new Date(Date.UTC(y, m - 1, d - back)).toISOString().slice(0, 10), 'week')
}

/** One cohort's people, with what each has done: the drilldown. */
function CohortPeople({ cohort, unit, onClose }: { cohort: string; unit: 'week' | 'month'; onClose: () => void }) {
  const { data, error, reload } = useApi<UserPage>(`/api/crm/users?cohort=${cohort}&unit=${unit}&limit=100`)
  return (
    <div className="crm-drill" role="region" aria-label={`People who signed up ${cohortName(cohort, unit)}`}>
      <header>
        <h4>
          {cohortName(cohort, unit)} cohort
          {data && <span>{plural(data.total, 'person', 'people')} signed up</span>}
        </h4>
        <button type="button" className="crm-chart-switch" onClick={onClose}>
          Close
        </button>
      </header>
      {error && <Failure error={error} retry={reload} />}
      {!data ? <Loading /> : <PeopleTable rows={data.users} showFirst onChange={reload} />}
    </div>
  )
}

function PeopleTable({ rows, showFirst = false, sort, onSort, onChange }: { rows: UserRow[]; showFirst?: boolean; sort?: { by: string; dir: string }; onSort?: (by: string) => void; onChange?: () => void }) {
  const head = (by: string, text: string) =>
    onSort ? (
      <th scope="col" aria-sort={sort?.by === by ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
        <button type="button" onClick={() => onSort(by)}>
          {text}
          {sort?.by === by && <Icon name={sort.dir === 'asc' ? 'chevronUp' : 'chevronDown'} size={12} />}
        </button>
      </th>
    ) : (
      <th scope="col">{text}</th>
    )
  if (!rows.length) return <Empty icon="users">Nobody matches.</Empty>
  return (
    <div className="crm-people-wrap">
      <table className="crm-people">
        <thead>
          <tr>
            {head('name', 'User')}
            {head('signup', 'Signed up (Pacific)')}
            {head('source', 'Source')}
            <th scope="col">Status</th>
            {head('active', 'Last active')}
            {showFirst ? <th scope="col">First thing they did</th> : <th scope="col">Signed up in</th>}
            <th scope="col">
              <span className="crm-sr">Count this account</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td data-label="User">
                <strong title={u.name}>{u.name}</strong>
                <span title={u.email ?? u.phone ?? ''}>{u.email ?? u.phone ?? 'No contact on file'}</span>
              </td>
              <td data-label="Signed up">
                {day(u.signedUpAt)}
                <span>{clock(u.signedUpAt)}</span>
              </td>
              <td data-label="Source">
                {u.source === 'unknown' ? 'Unknown' : u.sourceLabel}
                {u.referrerName && <span>from {u.referrerName}</span>}
              </td>
              <td data-label="Status">
                {status(u)}
                {u.activated && <span className="is-good">Activated</span>}
              </td>
              <td data-label="Last active">
                {u.lastActiveAt ? day(u.lastActiveAt) : <span title="Nothing tracked since signing up">—</span>}
                {u.actions > 0 && <span>{plural(u.actions, 'action', 'actions')}</span>}
              </td>
              {showFirst ? (
                <td data-label="First thing" className="is-first">
                  {u.firstAction ? (
                    <>
                      {u.firstAction.label}
                      <span>{day(u.firstAction.at)}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              ) : (
                <td data-label="Signed up in" className="is-cohort">
                  Week of {weekOf(u.signedUpAt).split(' – ')[0]}
                </td>
              )}
              <td className="is-act">
                <LeaveOut id={u.id} name={u.name} onDone={onChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Take an account out of the numbers (Glenn's own test sign-up, say), after a confirm. It can be put back from "Left out". */
function LeaveOut({ id, name, onDone }: { id: string; name: string; onDone?: () => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const go = async () => {
    if (!window.confirm(`Leave ${name} out of every user number? Use this for a test account or one of the team's own. You can put it back.`)) return
    setBusy(true)
    try {
      await api(`/api/crm/users/${id}/test`, { method: 'POST', body: { test: true } })
      onDone?.()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <button type="button" className="crm-leave" onClick={go} disabled={busy} title={err ?? 'Leave out of the numbers'}>
      {busy ? '…' : 'Test account?'}
    </button>
  )
}

function LeftOutList({ onChange }: { onChange: () => void }) {
  const { data, error, reload } = useApi<{ users: { id: string; name: string; signedUpAt: number; marked: boolean }[] }>('/api/crm/users/left-out')
  const back = async (id: string) => {
    await api(`/api/crm/users/${id}/test`, { method: 'POST', body: { test: false } })
    void reload()
    onChange()
  }
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  if (!data.users.length) return <p className="crm-fine">No accounts are left out.</p>
  return (
    <ul className="crm-leftout">
      {data.users.map((u) => (
        <li key={u.id}>
          <span>
            <strong>{u.name}</strong> signed up {day(u.signedUpAt)}
            <small>{u.marked ? 'Marked as a test account' : 'A reserved test address or number'}</small>
          </span>
          {u.marked && (
            <button type="button" className="crm-chart-switch" onClick={() => void back(u.id)}>
              Count again
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Everyone who signed up in the period, newest first, searchable and a page at a time. */
function RecentSignups({ scope }: { scope: Scope }) {
  const [q, setQ] = useState('')
  const [typed, setTyped] = useState('')
  const [source, setSource] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState({ by: 'signup', dir: 'desc' })
  const [page, setPage] = useState(0)
  const [showLeft, setShowLeft] = useState(false)
  const size = 10
  // The period above sets the dates; they can be changed or cleared here.
  useEffect(() => {
    setFrom(pacificDay(scope.from))
    setTo(pacificDay(scope.until - 1))
    setPage(0)
  }, [scope.from, scope.until])
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(typed.trim())
      setPage(0)
    }, 250)
    return () => clearTimeout(t)
  }, [typed])
  const path = useMemo(() => {
    const p = new URLSearchParams({ limit: String(size), offset: String(page * size), sort: sort.by, dir: sort.dir })
    if (q) p.set('q', q)
    if (source) p.set('source', source)
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    return `/api/crm/users?${p}`
  }, [q, source, from, to, sort, page])
  const { data, error, loading, reload } = useApi<UserPage>(path)
  const onSort = (by: string) => {
    setSort((s) => ({ by, dir: s.by === by && s.dir === 'desc' ? 'asc' : 'desc' }))
    setPage(0)
  }
  const shown = data ? `${data.total ? page * size + 1 : 0}–${Math.min((page + 1) * size, data.total)} of ${count(data.total)}` : ''
  return (
    <section className={`crm-card-chart crm-signups${loading && data ? ' is-busy' : ''}`} aria-labelledby="signups-h">
      <header>
        <div>
          <h3 id="signups-h">Recent sign-ups</h3>
        </div>
      </header>
      <div className="crm-filters" role="search">
        <label className="crm-filter-q">
          <span className="crm-sr">Search</span>
          <Icon name="search" size={16} />
          <input type="search" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Name, email or phone" />
        </label>
        <label>
          <span>Source</span>
          <select value={source} onChange={(e) => { setSource(e.target.value); setPage(0) }}>
            <option value="">Any source</option>
            <option value="friend">A friend’s invite</option>
            <option value="register">A register code</option>
            <option value="social">Social media</option>
            <option value="search">Search</option>
            <option value="paid">Paid ads</option>
            <option value="email">Email or text</option>
            <option value="campaign">Another campaign link</option>
            <option value="website">Another website</option>
            <option value="direct">Came straight to BEASTY</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label>
          <span>From</span>
          <input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(0) }} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(0) }} />
        </label>
        {(from || to) && (
          <button type="button" className="crm-chart-switch" onClick={() => { setFrom(''); setTo(''); setPage(0) }}>
            Any date
          </button>
        )}
      </div>
      {error && <Failure error={error} retry={reload} />}
      {!data ? <Loading /> : <PeopleTable rows={data.users} sort={sort} onSort={onSort} onChange={reload} />}
      {data && (
        <footer className="crm-pager">
          <span>{shown}</span>
          <span>
            <button type="button" className="crm-chart-switch" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button type="button" className="crm-chart-switch" disabled={(page + 1) * size >= data.total} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </span>
        </footer>
      )}
      <details className="crm-define" open={showLeft} onToggle={(e) => setShowLeft((e.target as HTMLDetailsElement).open)}>
        <summary>Accounts left out of the numbers</summary>
        {showLeft && <LeftOutList onChange={reload} />}
      </details>
    </section>
  )
}
