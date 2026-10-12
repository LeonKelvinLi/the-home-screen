/*
  HOME: the state of BEASTY in about ten seconds, numbers first.

    1. The business right now: leads, customers, monthly plans, and what the
       open leads are worth. Not tied to any period, and labelled "Right now".
    2. What needs Glenn today.
    3. Users: people with a BEASTY account, over the period picked at the top.
    4. Leads and money over the same period.

  One period picker at the top scopes every number under it, and every
  heading and tile names its days; totals say "All time" or "Right now" so
  they are never mistaken for a month. A period is compared with the stretch
  just before it, of the same length, and the tile says which stretch.
*/
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ChartCard, HBars, Line, StackedColumns, StatTile } from './charts'
import { bucketKeys, bucketName, compare, daySpan, pacificDay } from './periods'
import type { Unit } from './periods'
import { BlockHead, UsersBlock } from './users'
import type { Scope, UsersData } from './users'
import type { FollowupItem } from './views'
import { Failure, endOfToday, money, pct, plural, useApi, useCrm } from './ui'
import { Icon } from './icons'

interface Series {
  bucket: string
  count: number
}

interface HomeData {
  period: string
  since: number
  from: number
  until: number
  prev: [number, number] | null
  unit: Unit
  listed: { total: number; needWebsite: number; added: number; addedBefore: number | null; series: Series[] }
  leads: {
    total: number
    added: number
    addedBefore: number | null
    reached: number
    reachedInPeriod: number
    reachedBefore: number | null
    customers: number
    customersInPeriod: number
    series: Series[]
    reachedSeries: Series[]
  }
  money: {
    earnedCents: number
    sales: number
    earnedBeforeCents: number | null
    mrrCents: number
    series: { bucket: string; onceCents: number; plansCents: number }[]
    sold: { label: string; cents: number; count: number }[]
  }
  sources: { key: string; label: string; count: number }[]
  stages: { stage: string; count: number }[]
  cities: { label: string; count: number }[]
  users: UsersData
}

interface OverviewData {
  counts: Record<string, number>
  money: { oneTimeCents: number; mrrCents: number; arrCents: number; pipelineCents: number }
  attention: { key: string; count: number; text: string }[]
}

const PERIOD_KEY = 'crm.home.period'
const CUSTOM_KEY = 'crm.home.custom'
const count = (n: number) => n.toLocaleString('en-US')
const day = (t: number) => new Date(t).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric', year: 'numeric' })
const DAY = 864e5

/* The phone names fit six to a row: "1 year" is the same twelve months. */
const CHOICES = [
  ['7d', '7 days', '7 days'],
  ['30d', '30 days', '30 days'],
  ['90d', '90 days', '90 days'],
  ['12m', '12 months', '1 year'],
  ['all', 'All time', 'All'],
  ['custom', 'Custom', 'Custom'],
] as const

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const remember = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* a private window: the choice just is not remembered */
  }
}
const recall = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** The words for a period: its name, its exact days, and what it is compared with. */
function scopeOf(h: HomeData): Scope {
  const range = daySpan(h.from, h.until - 1)
  const days = Math.round((h.until - h.since) / DAY)
  const words: Record<string, [string, string, string]> = {
    '7d': ['Last 7 days', 'in the last 7 days', 'the 7 days before'],
    '30d': ['Last 30 days', 'in the last 30 days', 'the 30 days before'],
    '90d': ['Last 90 days', 'in the last 90 days', 'the 90 days before'],
    '12m': ['Last 12 months', 'in the last 12 months', 'the 12 months before'],
    all: ['All time', 'since the start', ''],
    custom: ['Custom dates', `from ${range}`, `the ${days} days before`],
  }
  const [title, phrase, vs] = words[h.period] ?? words['30d']
  return { key: h.period, title, range, phrase, vs, unit: h.unit, since: h.since, until: h.until, from: h.from, prev: h.prev }
}

/** Named rows biggest first, then one grey row for the rest and one for "not listed", so unknowns come last. */
function namedAndRest(rows: { label: string; count: number }[], rest: string, unknown: string, isUnknown: (l: string) => boolean) {
  const named = rows.filter((r) => r.count > 0 && !isUnknown(r.label))
  const others = named.slice(7).reduce((n, r) => n + r.count, 0)
  const missing = rows.filter((r) => isUnknown(r.label)).reduce((n, r) => n + r.count, 0)
  return [
    ...named.slice(0, 7).map((r) => ({ label: r.label, value: r.count })),
    ...(others ? [{ label: rest, value: others, muted: true }] : []),
    ...(missing ? [{ label: unknown, value: missing, muted: true }] : []),
  ]
}

const STEP_BARS: { label: string; stages: string[]; shade: string }[] = [
  { label: 'Find info', stages: ['new_lead', 'need_contact_info'], shade: 'var(--viz-o1)' },
  { label: 'Say hello', stages: ['ready_to_contact'], shade: 'var(--viz-o2)' },
  { label: 'Talking', stages: ['contacted', 'replied', 'interested', 'meeting'], shade: 'var(--viz-o3)' },
  { label: 'Quote sent', stages: ['proposal_sent'], shade: 'var(--viz-o4)' },
  { label: 'Customers', stages: ['won', 'onboarding', 'active_customer'], shade: 'var(--viz-o5)' },
  { label: 'Closed', stages: ['no_response', 'not_interested', 'bad_lead', 'closed_lost'], shade: 'var(--viz-other)' },
]

export function Home() {
  const { actor } = useCrm()
  const [period, setPeriodState] = useState(() => recall(PERIOD_KEY) ?? '30d')
  const [custom, setCustomState] = useState<{ start: string; end: string }>(() => {
    try {
      const c = JSON.parse(recall(CUSTOM_KEY) ?? 'null') as { start: string; end: string } | null
      if (c?.start && c?.end) return c
    } catch {
      /* a bad value is the same as none */
    }
    const today = pacificDay(Date.now())
    return { start: pacificDay(Date.now() - 13 * DAY), end: today }
  })
  const setPeriod = (p: string) => {
    setPeriodState(p)
    remember(PERIOD_KEY, p)
  }
  const setCustom = (c: { start: string; end: string }) => {
    setCustomState(c)
    remember(CUSTOM_KEY, JSON.stringify(c))
  }
  const query = period === 'custom' ? `period=custom&start=${custom.start}&end=${custom.end}` : `period=${period}`
  const home = useApi<HomeData>(`/api/crm/home?${query}`)
  const ov = useApi<OverviewData>('/api/crm/overview')
  const dueToday = useApi<{ followups: FollowupItem[] }>(`/api/crm/followups?view=due_today&end=${endOfToday()}`)
  const first = actor.name.split(' ')[0]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const head = (
    <header className="crm-home-head">
      <div>
        <h1>
          {greeting()}, {first}
        </h1>
        <p>{today}</p>
      </div>
      <PeriodBar period={period} setPeriod={setPeriod} custom={custom} setCustom={setCustom} h={home.data} />
    </header>
  )

  if (!home.data) {
    return (
      <div className="crm-view crm-home">
        {head}
        {home.error ? <Failure error={home.error} retry={home.reload} /> : <HomeSkeleton />}
      </div>
    )
  }

  const h = home.data
  const scope = scopeOf(h)
  const busy = home.loading
  const late = ov.data?.attention.find((a) => a.key === 'overdue')?.count ?? 0
  const c: Record<string, number> = ov.data?.counts ?? {}
  const keys = bucketKeys(h.from, h.until, h.unit)
  const perKey = (s: Series[]) => {
    const by = new Map(s.map((x) => [x.bucket, x.count]))
    return keys.map((k) => ({ label: bucketName(k, h.unit), value: by.get(k) ?? 0 }))
  }
  const added = perKey(h.leads.series)
  const listedAdded = perKey(h.listed.series)
  const reached = perKey(h.leads.reachedSeries)
  const cashBy = new Map(h.money.series.map((x) => [x.bucket, x]))
  const cash = keys.map((k) => ({ label: bucketName(k, h.unit), values: [cashBy.get(k)?.onceCents ?? 0, cashBy.get(k)?.plansCents ?? 0] }))
  const per = h.unit === 'day' ? 'per day' : h.unit === 'week' ? 'per week' : 'per month'
  const steps = STEP_BARS.map((b) => ({ label: b.label, shade: b.shade, value: h.stages.filter((x) => b.stages.includes(x.stage)).reduce((n, x) => n + x.count, 0) }))
  const sources = h.sources.map((x) => ({ label: x.label, value: x.count }))
  const cities = namedAndRest(h.cities, 'Everywhere else', 'No city listed', (l) => !l || l === 'BEASTY pages')
  const sold = h.money.sold.map((o) => ({ label: o.label, value: o.cents }))
  const needs = [
    { n: late, text: late === 1 ? 'late reminder' : 'late reminders', href: '#/followups?view=overdue', late: true },
    { n: dueToday.data?.followups.length ?? 0, text: 'reminders due today', href: '#/followups?view=due_today', late: false },
    { n: c.readyToContact ?? 0, text: 'ready for a first hello', href: '#/leads?step=hello', late: false },
    { n: c.needContactInfo ?? 0, text: 'need a phone or Instagram', href: '#/leads?step=info', late: false },
  ]
  const asOf = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const noSales = !h.money.sales && !h.money.series.some((x) => x.plansCents) && !h.money.sold.length
  return (
    <div className="crm-view crm-home">
      {head}
      <JumpTo admin={actor.role === 'admin'} />

      <section className="crm-block" aria-labelledby="now-h">
        <BlockHead id="now-h" title="Right now" scope={`as of ${asOf}`} note="Totals so far. The period picked above does not change them." />
        <div className="crm-kpi-row">
          <StatTile
            label="Users"
            scope="All time"
            value={count(h.users.total)}
            note={h.users.first ? `people with a BEASTY account, since ${day(h.users.first)}` : 'nobody has signed up yet'}
          />
          <StatTile label="Leads" scope="All time" value={count(h.leads.total)} note={`businesses to sell a website to, out of ${count(h.listed.total)} on BEASTY`} />
          <StatTile label="Customers" scope="All time" value={count(h.leads.customers)} note={h.leads.total ? `${pct(h.leads.customers / h.leads.total)} of all leads said yes` : 'no leads yet'} />
          <StatTile label="Monthly plans" scope="Right now" value={`${money(h.money.mrrCents)}/mo`} note={`${money(h.money.mrrCents * 12)} a year, from the plans running now`} />
        </div>
        <div className="crm-needs" aria-labelledby="needs-h">
          <h3 id="needs-h">Needs you today</h3>
          <div className="crm-needs-row">
            {needs.map((x) => (
              <a key={x.text} href={x.href} className={x.n ? (x.late ? 'is-late' : undefined) : 'is-zero'}>
                <b>{count(x.n)}</b>
                <span>{x.text}</span>
                <Icon name="chevronRight" size={16} />
              </a>
            ))}
            <a href="#/today" className="crm-btn is-dark">
              Open To do
            </a>
          </div>
        </div>
      </section>

      <UsersBlock u={h.users} scope={scope} busy={busy} />

      <ButtonsBlock query={query} scope={scope} />

      <section className={`crm-block${busy ? ' is-busy' : ''}`} aria-labelledby="leads-h">
        <BlockHead id="leads-h" title="Leads and money" scope={`${scope.title}, ${scope.range}`} note="Leads are businesses the team is selling a website to. They are not users." />
        <div className="crm-kpi-row">
          <StatTile
            label="Leads added"
            scope={scope.title}
            value={count(h.leads.added)}
            change={compare(h.leads.added, h.leads.addedBefore, scope.vs)}
            note="businesses added to the book"
            trend={added.map((x) => x.value)}
          />
          <StatTile
            label="Reached for the first time"
            scope={scope.title}
            value={count(h.leads.reachedInPeriod)}
            change={compare(h.leads.reachedInPeriod, h.leads.reachedBefore, scope.vs)}
            note="leads called, texted or messaged"
            trend={reached.map((x) => x.value)}
          />
          <StatTile label="New customers" scope={scope.title} value={count(h.leads.customersInPeriod)} note="leads that said yes" />
          <StatTile
            label="Earned"
            scope={scope.title}
            value={money(h.money.earnedCents)}
            change={compare(h.money.earnedCents, h.money.earnedBeforeCents, scope.vs, money)}
            note={`from ${plural(h.money.sales, 'sale', 'sales')}`}
            trend={cash.map((x) => x.values[0])}
          />
        </div>

        <div className="crm-dash-row">
          <ChartCard
            title="Where leads came from"
            sub={`${plural(h.leads.added, 'lead', 'leads')} added ${scope.phrase}, by where they came from.`}
            table={{ head: ['Where from', 'Leads', 'Share'], rows: sources.map((x) => [x.label, x.value, h.leads.added ? pct(x.value / h.leads.added) : '—']) }}
          >
            <HBars rows={sources} total={h.leads.added} empty={`No leads were added ${scope.phrase}.`} />
          </ChartCard>
          <ChartCard
            title="Where those leads are now"
            sub={`The same ${plural(h.leads.added, 'lead', 'leads')}, by the step each is on today.`}
            table={{ head: ['Step', 'Leads', 'Share'], rows: steps.map((x) => [x.label, x.value, h.leads.added ? pct(x.value / h.leads.added) : '—']) }}
          >
            <HBars rows={steps} total={h.leads.added} all empty={`No leads were added ${scope.phrase}.`} />
          </ChartCard>
        </div>

        {/* Leon, 2026-10-11: the leads chart was "not right with what I'm adding".
            This one is what he adds: every business put on BEASTY, by the day it went up. */}
        <ChartCard
          title="Businesses added to BEASTY"
          sub={`Every business put on BEASTY ${per}, ${scope.phrase}, website or not: ${count(h.listed.added)} in all. The ones without a website also become leads, below.`}
          table={{ head: [h.unit === 'day' ? 'Day' : h.unit === 'week' ? 'Week of' : 'Month', 'Businesses added'], rows: listedAdded.map((x) => [x.label, x.value]) }}
        >
          <Line points={listedAdded} color="var(--viz-1)" unit="businesses" name="Added" empty={`No businesses were added ${scope.phrase}.`} />
        </ChartCard>

        <div className="crm-dash-row">
          <ChartCard
            title="Leads added"
            sub={`New leads ${per}, ${scope.phrase}. A business from BEASTY's listings counts on the day it went onto BEASTY.`}
            table={{ head: [h.unit === 'day' ? 'Day' : h.unit === 'week' ? 'Week of' : 'Month', 'Leads added'], rows: added.map((x) => [x.label, x.value]) }}
          >
            <Line points={added} color="var(--viz-1)" unit="leads" empty={`No leads were added ${scope.phrase}.`} />
          </ChartCard>
          <ChartCard title="Top cities" sub={`Leads added ${scope.phrase}, by city.`} table={{ head: ['City', 'Leads'], rows: cities.map((x) => [x.label, x.value]) }}>
            <HBars rows={cities} total={h.leads.added} empty={`No leads were added ${scope.phrase}.`} />
          </ChartCard>
        </div>

        {noSales ? (
          <section className="crm-card-chart" aria-labelledby="money-h">
            <header>
              <div>
                <h3 id="money-h">Money earned</h3>
                <p>Website sales and new monthly plans, {scope.phrase}.</p>
              </div>
            </header>
            <p className="crm-chart-empty">No sales and no new monthly plans {scope.phrase}. Money shows here, day by day, from the first sale.</p>
          </section>
        ) : (
          <div className="crm-dash-row">
            <ChartCard
              title="Money earned"
              sub={`Website sales and new monthly plans ${per}, ${scope.phrase}, on the day each was sold.`}
              table={{ head: [h.unit === 'day' ? 'Day' : h.unit === 'week' ? 'Week of' : 'Month', 'Sales', 'New monthly plans'], rows: cash.map((x) => [x.label, money(x.values[0]), money(x.values[1])]) }}
            >
              <StackedColumns
                series={[
                  { key: 'once', label: 'Sales', color: 'var(--viz-1)' },
                  { key: 'plans', label: 'New monthly plans', color: 'var(--viz-2)' },
                ]}
                cols={cash}
                money={money}
                empty={`No sales ${scope.phrase}.`}
              />
            </ChartCard>
            <ChartCard title="What sold" sub={`Money from each price, ${scope.phrase}.`} table={{ head: ['Price', 'Earned', 'Sales'], rows: h.money.sold.map((x) => [x.label, money(x.cents), x.count]) }}>
              <HBars rows={sold} format={money} empty={`No sales ${scope.phrase}.`} />
            </ChartCard>
          </div>
        )}
      </section>
    </div>
  )
}

/** The one period picker, with the exact days it resolved to and what it is compared with. */
function PeriodBar({
  period,
  setPeriod,
  custom,
  setCustom,
  h,
}: {
  period: string
  setPeriod: (p: string) => void
  custom: { start: string; end: string }
  setCustom: (c: { start: string; end: string }) => void
  h: HomeData | null
}) {
  const [draft, setDraft] = useState(custom)
  const today = pacificDay(Date.now())
  const apply = (e: FormEvent) => {
    e.preventDefault()
    setCustom(draft)
  }
  const s = h && h.period === period ? scopeOf(h) : null
  return (
    <div className="crm-period-bar">
      <div className="crm-seg crm-period-pick" role="tablist" aria-label="Period for everything below">
        {CHOICES.map(([k, text, short]) => (
          <button key={k} type="button" role="tab" aria-selected={period === k} aria-label={text} className={period === k ? 'is-on' : undefined} onClick={() => setPeriod(k)}>
            <span className="is-long">{text}</span>
            <span className="is-short">{short}</span>
          </button>
        ))}
      </div>
      {period === 'custom' && (
        <form className="crm-custom-range" onSubmit={apply}>
          <label>
            <span>From</span>
            <input type="date" required value={draft.start} max={draft.end || today} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
          </label>
          <label>
            <span>To</span>
            <input type="date" required value={draft.end} min={draft.start} max={today} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
          </label>
          <button type="submit" className="crm-btn is-dark" disabled={draft.start === custom.start && draft.end === custom.end}>
            Show
          </button>
        </form>
      )}
      <p className="crm-period-says" aria-live="polite">
        {s ? (
          <>
            <b>{s.title}</b> {s.range}
            {s.prev && <span>compared with {daySpan(s.prev[0], s.prev[1] - 1)}</span>}
          </>
        ) : (
          'Loading…'
        )}
      </p>
    </div>
  )
}

/** Short cuts down a long page. Buttons, not links: the CRM's routes live in the URL's #. */
function JumpTo({ admin }: { admin: boolean }) {
  const go = (id: string) => {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
  }
  const spots: [string, string][] = [
    ['users-h', 'Users'],
    ['cohort-h', 'Coming back'],
    ...(admin ? ([['signups-h', 'Sign-ups']] as [string, string][]) : []),
    ['leads-h', 'Leads and money'],
  ]
  return (
    <nav className="crm-jump" aria-label="Jump to">
      {spots.map(([id, text]) => (
        <button key={id} type="button" onClick={() => go(id)}>
          {text}
        </button>
      ))}
    </nav>
  )
}

/** Grey shapes where the numbers go, while the first answer is on its way. */
/*
  THE HOME-SCREEN BUTTONS: how often each was opened, and by how many people.
  Glenn, 2026-10-03, asking for the gallery, video reel, newsfeed and calendar
  buttons, then "the QR code button and the contact button".
*/
const BUTTON_NAMES: [string, string][] = [
  ['watch', 'Video reels'],
  ['gallery', 'Gallery'],
  ['news', 'News'],
  ['calendar', 'Calendar'],
  ['scan', 'Share & Scan (QR code)'],
  ['contacts', 'Contacts'],
  ['search', 'Search'],
]
function ButtonsBlock({ query, scope }: { query: string; scope: Scope }) {
  const b = useApi<{ countingSince: number | null; buttons: { kind: string; taps: number; people: number }[] }>(`/api/crm/buttons?${query}`)
  const by = new Map((b.data?.buttons ?? []).map((x) => [x.kind, x]))
  const rows = BUTTON_NAMES.map(([k, label]) => ({ label, value: by.get(k)?.taps ?? 0, people: by.get(k)?.people ?? 0 }))
  const total = rows.reduce((n, r) => n + r.value, 0)
  return (
    <section className={`crm-block${b.loading ? ' is-busy' : ''}`} aria-labelledby="buttons-h">
      <BlockHead
        id="buttons-h"
        title="Home-screen buttons"
        scope={`${scope.title}, ${scope.range}`}
        note={
          b.data?.countingSince
            ? `Counted since ${new Date(b.data.countingSince).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. The team's own phones are left out.`
            : 'Counting starts with the next visit. The team\u2019s own phones are left out.'
        }
      />
      {b.error ? (
        <Failure error={b.error} retry={b.reload} />
      ) : (
        <div className="crm-dash-row">
          <ChartCard
            title="Times opened"
            sub={`${plural(total, 'open', 'opens')} ${scope.phrase}, by button.`}
            table={{ head: ['Button', 'Opens', 'People'], rows: rows.map((r) => [r.label, r.value, r.people]) }}
          >
            <HBars rows={rows} total={total} empty={`Nobody opened these ${scope.phrase}.`} />
          </ChartCard>
        </div>
      )}
    </section>
  )
}

function HomeSkeleton() {
  return (
    <div className="crm-skeleton" aria-hidden="true">
      {[0, 1].map((r) => (
        <div key={r} className="crm-kpi-row">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="crm-skel crm-skel-tile" />
          ))}
        </div>
      ))}
      <div className="crm-dash-row">
        <span className="crm-skel crm-skel-card" />
        <span className="crm-skel crm-skel-card" />
      </div>
    </div>
  )
}
