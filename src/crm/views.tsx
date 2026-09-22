/*
  The dashboards: Overview (with the attention queue), Pipeline, Businesses,
  Follow-ups, Revenue and Analytics. Every number is a button when there is a
  list behind it, so a count is always one tap from the leads it counts.
*/
import { useState } from 'react'
import { api } from './api'
import type { LeadSummary } from './api'
import {
  ContactActions,
  Empty,
  Failure,
  Loading,
  Section,
  StagePill,
  Stat,
  ago,
  dateTime,
  durationLabel,
  endOfToday,
  money,
  pct,
  useApi,
  useCrm,
} from './ui'
import { STAGES, opportunityLabel, stageLabel } from './model'

/* ---------------------------------------------------------------- overview */

interface OverviewData {
  counts: Record<string, number>
  money: { oneTimeCents: number; mrrCents: number; arrCents: number; pipelineCents: number }
  attention: { key: string; count: number; text: string }[]
}

export function Overview() {
  const { go } = useCrm()
  const { data, error, reload } = useApi<OverviewData>('/api/crm/overview')
  const today = useApi<{ followups: FollowupItem[] }>(`/api/crm/followups?view=due_today&end=${endOfToday()}`)
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const c = data.counts
  const attention = data.attention.filter((a) => a.count > 0)
  const openAttention = (key: string) => (key === 'overdue' ? go('followups?view=overdue') : go(`leads?attention=${key}`))
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Overview</h1>
      <Section title="Needs attention">
        {attention.length ? (
          <div className="crm-attention">
            {attention.map((a) => (
              <button type="button" key={a.key} className={`crm-attn crm-attn-${a.key}`} onClick={() => openAttention(a.key)}>
                <strong>{a.count}</strong> {a.text}
              </button>
            ))}
          </div>
        ) : (
          <Empty>Nothing is waiting on anyone.</Empty>
        )}
      </Section>
      <Section title="Pipeline">
        <div className="crm-stats">
          <Stat label="CRM leads" value={c.total} onClick={() => go('leads')} />
          <Stat label="New this week" value={c.newThisWeek} sub="not counting imports" onClick={() => go(`leads?since=${Date.now() - 7 * 864e5}&imported=0&sort=created`)} />
          <Stat label="Need contact info" value={c.needContactInfo} onClick={() => go('leads?stage=need_contact_info')} tone={c.needContactInfo ? 'warn' : undefined} />
          <Stat label="Ready to contact" value={c.readyToContact} onClick={() => go('leads?stage=ready_to_contact')} />
          <Stat label="Contacted" value={c.contacted} onClick={() => go('leads?stage=contacted,replied')} />
          <Stat label="Interested" value={c.interested} onClick={() => go('leads?stage=interested,meeting')} />
          <Stat label="Proposals out" value={c.proposalsOutstanding} onClick={() => go('leads?stage=proposal_sent')} />
          <Stat label="Deals won" value={c.dealsWon} onClick={() => go('leads?stage=won,onboarding,active_customer')} tone="good" />
          <Stat label="Need a website" value={c.needWebsites} onClick={() => go('leads?type=website')} />
        </div>
      </Section>
      <Section title="Money">
        <div className="crm-stats">
          <Stat label="One-time revenue" value={money(data.money.oneTimeCents)} onClick={() => go('revenue')} />
          <Stat label="MRR" value={money(data.money.mrrCents)} sub={`${money(data.money.arrCents)} a year`} onClick={() => go('revenue')} />
          <Stat label="Pipeline value" value={money(data.money.pipelineCents)} sub="open leads, at their quote" onClick={() => go('pipeline')} />
        </div>
      </Section>
      <Section title="Due today" action={<a href="#/followups?view=due_today">All follow-ups</a>}>
        {today.data?.followups.length ? (
          <FollowupList items={today.data.followups.slice(0, 6)} onChange={() => { void today.reload(); void reload() }} />
        ) : (
          <Empty>No follow-ups due for the rest of today.</Empty>
        )}
      </Section>
    </div>
  )
}

/* ---------------------------------------------------------------- pipeline */

const BOARD = ['need_contact_info', 'ready_to_contact', 'contacted', 'replied', 'interested', 'meeting', 'proposal_sent', 'won']

export function Pipeline() {
  const [bump, setBump] = useState(0)
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Pipeline</h1>
      <p className="crm-lede">Open leads by stage. Move one with its menu; every move is recorded in the lead's history.</p>
      <div className="crm-board">
        {BOARD.map((s) => (
          <Column key={`${s}-${bump}`} stage={s} onMoved={() => setBump((b) => b + 1)} />
        ))}
      </div>
    </div>
  )
}

function Column({ stage, onMoved }: { stage: string; onMoved: () => void }) {
  const { go } = useCrm()
  const { data, error } = useApi<{ total: number; leads: LeadSummary[] }>(`/api/crm/leads?stage=${stage}&limit=25&sort=next`)
  const move = async (id: string, to: string) => {
    if (to === 'won' && !window.confirm('Mark won with no deal? Revenue is counted from deals: open the lead to record what they paid.')) return
    try {
      await api(`/api/crm/leads/${id}/stage`, { method: 'POST', body: { stage: to } })
      onMoved()
    } catch (e) {
      window.alert((e as Error).message)
    }
  }
  return (
    <div className="crm-col">
      <div className="crm-col-head">
        <span>{stageLabel(stage)}</span>
        <button type="button" className="crm-link" onClick={() => go(`leads?stage=${stage}`)}>
          {data ? data.total : '…'}
        </button>
      </div>
      {error && <Failure error={error} />}
      {data?.leads.map((l) => (
        <div className="crm-card crm-pcard" key={l.id}>
          <a href={`#/lead/${l.id}`} className="crm-pcard-name">
            {l.name}
          </a>
          <div className="crm-pcard-meta">
            {l.city} · {opportunityLabel(l.opportunityType)}
            {l.potentialCents ? ` · ${money(l.potentialCents)}` : ''}
          </div>
          {l.nextFollowupAt && <div className={`crm-pcard-due${l.nextFollowupAt < Date.now() ? ' is-late' : ''}`}>Next: {ago(l.nextFollowupAt)}</div>}
          <select aria-label={`Move ${l.name}`} value={l.stage} onChange={(e) => void move(l.id, e.target.value)}>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {data && data.total > data.leads.length && (
        <button type="button" className="crm-link" onClick={() => go(`leads?stage=${stage}`)}>
          {data.total - data.leads.length} more
        </button>
      )}
      {data && !data.total && <div className="crm-col-empty">None</div>}
    </div>
  )
}

/* -------------------------------------------------------------- businesses */

interface Family {
  familyKey: string
  name: string
  opportunities: number
  locations: number
  cities: string
  open: number
  won: number
  pipelineCents: number
  oneTimeCents: number
  mrrCents: number
}

export function Businesses() {
  const { go } = useCrm()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const { data, error, reload } = useApi<{ total: number; families: Family[] }>(
    `/api/crm/businesses?limit=50&offset=${page * 50}${q.trim().length >= 2 ? `&q=${encodeURIComponent(q.trim())}` : ''}`,
  )
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Businesses</h1>
      <p className="crm-lede">One line per business; locations of the same business roll up. Open one to see each location's lead.</p>
      <input className="crm-input" type="search" placeholder="Filter businesses" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} />
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Locations</th>
                <th>Cities</th>
                <th>Open</th>
                <th>Won</th>
                <th>Pipeline</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.families.map((f) => (
                <tr key={f.familyKey} className="is-link" onClick={() => go(`leads?family=${encodeURIComponent(f.familyKey)}`)}>
                  <td data-label="Business"><strong>{f.name}</strong></td>
                  <td data-label="Locations">{f.locations}</td>
                  <td data-label="Cities">{f.cities}</td>
                  <td data-label="Open">{f.open}</td>
                  <td data-label="Won">{f.won}</td>
                  <td data-label="Pipeline">{money(f.pipelineCents)}</td>
                  <td data-label="Revenue">
                    {money(f.oneTimeCents)}
                    {f.mrrCents ? ` + ${money(f.mrrCents)}/mo` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager total={data.total} page={page} size={50} onPage={setPage} />
        </div>
      )}
    </div>
  )
}

export function Pager({ total, page, size, onPage }: { total: number; page: number; size: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / size)
  if (pages <= 1) return <div className="crm-pager">{total} total</div>
  return (
    <div className="crm-pager">
      <button type="button" disabled={page === 0} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span>
        {page * size + 1}–{Math.min(total, (page + 1) * size)} of {total}
      </span>
      <button type="button" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  )
}

/* -------------------------------------------------------------- follow-ups */

export interface FollowupItem {
  id: string
  leadId: string
  name: string
  city: string | null
  stage: string
  channels: { phone: string; email: string; instagram: string }
  dueAt: number
  priority: string
  type: string
  notes: string | null
  owner: { id: string; name: string } | null
  completedAt: number | null
  completedBy: string | null
}

const FU_TABS = [
  ['overdue', 'Overdue'],
  ['due_today', 'Due today'],
  ['upcoming', 'Upcoming'],
  ['no_next_action', 'No next action'],
  ['recent', 'Recently completed'],
] as const

export function Followups({ view }: { view: string }) {
  const { data, error, reload } = useApi<{ kind: 'followups'; followups: FollowupItem[] } | { kind: 'leads'; total: number; leads: LeadSummary[] }>(
    `/api/crm/followups?view=${view}&end=${endOfToday()}`,
  )
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Follow-ups</h1>
      <div className="crm-tabs" role="tablist">
        {FU_TABS.map(([k, label]) => (
          <a key={k} href={`#/followups?view=${k}`} className={view === k ? 'is-on' : undefined} role="tab" aria-selected={view === k}>
            {label}
          </a>
        ))}
      </div>
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : data.kind === 'leads' ? (
        data.leads.length ? (
          <>
            <p className="crm-lede">Open leads with nothing scheduled. Interested ones first thing: a warm lead with no next step goes cold.</p>
            <ul className="crm-list">
              {data.leads
                .slice()
                .sort((a, b) => Number(['interested', 'meeting', 'proposal_sent'].includes(b.stage)) - Number(['interested', 'meeting', 'proposal_sent'].includes(a.stage)))
                .map((l) => (
                  <li key={l.id} className="crm-row">
                    <a href={`#/lead/${l.id}`} className="crm-row-main">
                      <strong>{l.name}</strong>
                      <span>{l.city}</span>
                    </a>
                    <StagePill stage={l.stage} />
                    <ContactActions c={l.channels} compact />
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <Empty>Every open lead has a next step.</Empty>
        )
      ) : data.followups.length ? (
        <FollowupList items={data.followups} onChange={reload} />
      ) : (
        <Empty>Nothing here.</Empty>
      )}
    </div>
  )
}

export function FollowupList({ items, onChange }: { items: FollowupItem[]; onChange: () => void }) {
  const complete = async (f: FollowupItem) => {
    const outcome = window.prompt(`What happened with ${f.name}? (optional)`)
    if (outcome === null) return
    try {
      await api(`/api/crm/followups/${f.id}/complete`, { method: 'POST', body: { outcome: outcome.trim() || null } })
      onChange()
    } catch (e) {
      window.alert((e as Error).message)
    }
  }
  return (
    <ul className="crm-list">
      {items.map((f) => (
        <li key={f.id} className={`crm-row${!f.completedAt && f.dueAt < Date.now() ? ' is-late' : ''}`}>
          <a href={`#/lead/${f.leadId}`} className="crm-row-main">
            <strong>{f.name}</strong>
            <span>
              {f.type} · {f.completedAt ? `done ${ago(f.completedAt)}` : `due ${dateTime(f.dueAt)}`}
              {f.owner ? ` · ${f.owner.name}` : ''}
              {f.priority === 'high' ? ' · high priority' : ''}
            </span>
            {f.notes && <em>{f.notes}</em>}
          </a>
          <ContactActions c={f.channels} compact />
          {!f.completedAt && (
            <button type="button" className="crm-btn" onClick={() => void complete(f)}>
              Done
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ---------------------------------------------------------------- revenue */

interface Slice {
  key: string
  label: string
  deals: number
  oneTimeCents: number
  mrrCents: number
}

interface RevenueData {
  oneTimeCents: number
  dealsWon: number
  mrrCents: number
  arrCents: number
  pipelineCents: number
  openLeads: number
  byReferrer: Slice[]
  bySalesperson: Slice[]
  byCity: Slice[]
  byCategory: Slice[]
  byOffer: Slice[]
  byMonth: Slice[]
}

export const PERIODS = [
  ['7d', '7 days'],
  ['30d', '30 days'],
  ['month', 'This month'],
  ['year', 'This year'],
  ['all', 'All time'],
] as const

export function PeriodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="crm-tabs is-small" role="tablist">
      {PERIODS.map(([k, label]) => (
        <button type="button" key={k} className={value === k ? 'is-on' : undefined} onClick={() => onChange(k)} role="tab" aria-selected={value === k}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function Revenue() {
  const [period, setPeriod] = useState('all')
  const { data, error, reload } = useApi<RevenueData>(`/api/crm/revenue?period=${period}`)
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Revenue</h1>
      <p className="crm-lede">From deals as they were sold: a later price change never rewrites these. MRR is what is active today.</p>
      <PeriodPicker value={period} onChange={setPeriod} />
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="crm-stats">
            <Stat label="One-time revenue" value={money(data.oneTimeCents)} sub={`${data.dealsWon} deal${data.dealsWon === 1 ? '' : 's'} won`} />
            <Stat label="MRR" value={money(data.mrrCents)} />
            <Stat label="ARR" value={money(data.arrCents)} />
            <Stat label="Pipeline value" value={money(data.pipelineCents)} sub={`${data.openLeads} open leads`} />
          </div>
          <div className="crm-grid2">
            <Breakdown title="By referrer" rows={data.byReferrer} />
            <Breakdown title="By salesperson" rows={data.bySalesperson} />
            <Breakdown title="By offer" rows={data.byOffer} />
            <Breakdown title="By month" rows={data.byMonth} />
            <Breakdown title="By city" rows={data.byCity} />
            <Breakdown title="By category" rows={data.byCategory} />
          </div>
        </>
      )}
    </div>
  )
}

function Breakdown({ title, rows }: { title: string; rows: Slice[] }) {
  return (
    <Section title={title}>
      {rows.length ? (
        <table className="crm-table is-compact">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td>{r.label}</td>
                <td className="num">{r.deals}</td>
                <td className="num">{money(r.oneTimeCents)}</td>
                <td className="num">{r.mrrCents ? `${money(r.mrrCents)}/mo` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Empty>No won deals in this period.</Empty>
      )}
    </Section>
  )
}

/* -------------------------------------------------------------- analytics */

interface AnalyticsData {
  funnel: { key: string; label: string; count: number }[]
  avgMsToFirstContact: number | null
  firstContactSample: number
  avgMsToClose: number | null
  closeSample: number
  timeInStage: { stage: string; avgMs: number | null; samples: number }[]
  last30: { newLeads: number; won: number; wonCents: number }
}

export function Analytics() {
  const { data, error, reload } = useApi<AnalyticsData>('/api/crm/analytics')
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const top = data.funnel[0]?.count || 1
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Analytics</h1>
      <Section title="Funnel">
        <p className="crm-lede">How many leads ever reached each stage, from the stage history.</p>
        <div className="crm-funnel">
          {data.funnel.map((f, i) => (
            <div key={f.key} className="crm-funnel-row">
              <span className="crm-funnel-label">{f.label}</span>
              <span className="crm-funnel-bar">
                <span style={{ width: `${Math.max(2, (f.count / top) * 100)}%` }} />
              </span>
              <span className="crm-funnel-n">
                {f.count}
                {i > 0 && data.funnel[i - 1].count ? <em> {pct(f.count / data.funnel[i - 1].count)}</em> : null}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <div className="crm-stats">
        <Stat label="Time to first contact" value={durationLabel(data.avgMsToFirstContact)} sub={`average of ${data.firstContactSample}`} />
        <Stat label="Time to close" value={durationLabel(data.avgMsToClose)} sub={`average of ${data.closeSample}`} />
        <Stat label="New leads, 30 days" value={data.last30.newLeads} sub="not counting imports" />
        <Stat label="Won, 30 days" value={data.last30.won} sub={money(data.last30.wonCents)} />
      </div>
      <Section title="Time in each stage">
        <table className="crm-table is-compact">
          <tbody>
            {data.timeInStage
              .filter((s) => s.samples)
              .map((s) => (
                <tr key={s.stage}>
                  <td>{stageLabel(s.stage)}</td>
                  <td className="num">{durationLabel(s.avgMs)}</td>
                  <td className="num">{s.samples} stays</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}
