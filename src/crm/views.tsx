/*
  The dashboards: Overview (with the attention queue), Pipeline, Businesses,
  Follow-ups, Revenue and Analytics. Every number is a button when there is a
  list behind it, so a count is always one tap from the leads it counts.
*/
import { useState } from 'react'
import type { DragEvent } from 'react'
import { api } from './api'
import type { LeadSummary, ReferrerMetrics } from './api'
import {
  Avatar,
  ContactActions,
  Empty,
  Failure,
  Loading,
  PageHead,
  PersonChip,
  Section,
  StagePill,
  Stat,
  ago,
  dateTime,
  durationLabel,
  endOfToday,
  money,
  pct,
  stageTone,
  useApi,
  useCrm,
} from './ui'
import { Icon } from './icons'
import type { IconName } from './icons'
import { STAGES, opportunityLabel, stageLabel } from './model'

/* ---------------------------------------------------------------- overview */

interface OverviewData {
  counts: Record<string, number>
  money: { oneTimeCents: number; mrrCents: number; arrCents: number; pipelineCents: number }
  attention: { key: string; count: number; text: string }[]
}

const ATTN_ICON: Record<string, IconName> = {
  uncontacted_referrals: 'share',
  overdue: 'clock',
  interested_no_next: 'flame',
  stale_proposals: 'file',
  missing_contact: 'alert',
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function Overview() {
  const { go, actor } = useCrm()
  const { data, error, reload } = useApi<OverviewData>('/api/crm/overview')
  const today = useApi<{ followups: FollowupItem[] }>(`/api/crm/followups?view=due_today&end=${endOfToday()}`)
  const pipe = useApi<{ stages: { stage: string; count: number; valueCents: number }[] }>('/api/crm/pipeline')
  const refs = useApi<{ referrers: ReferrerMetrics[] }>('/api/crm/referrers?period=all')
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const c = data.counts
  const attention = data.attention.filter((a) => a.count > 0)
  const openAttention = (key: string) => (key === 'overdue' ? go('followups?view=overdue') : go(`leads?attention=${key}`))
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const first = actor.name.split(' ')[0]
  const bar = (pipe.data?.stages ?? []).filter((s) => s.count > 0 && stageTone(s.stage) !== 'gray' && s.stage !== 'onboarding' && s.stage !== 'active_customer')
  const barTotal = bar.reduce((n, s) => n + s.count, 0) || 1
  const top = (refs.data?.referrers ?? []).filter((r) => r.leads > 0).slice(0, 5)
  return (
    <div className="crm-view">
      <PageHead
        title={`${greeting()}, ${first}`}
        sub={`${date} · here is what needs you today.`}
        actions={
          <button type="button" className="crm-btn crm-btn-primary" onClick={() => go('leads?new=1')}>
            <Icon name="plus" size={16} />
            New lead
          </button>
        }
      />
      <div className="crm-kpis">
        <Stat label="Pipeline value" value={money(data.money.pipelineCents)} sub="open leads, at their quote" icon="target" onClick={() => go('pipeline')} />
        <Stat label="One-time revenue" value={money(data.money.oneTimeCents)} sub={`${c.dealsWon} deal${c.dealsWon === 1 ? '' : 's'} won`} icon="dollar" onClick={() => go('revenue')} />
        <Stat label="MRR" value={money(data.money.mrrCents)} sub={`${money(data.money.arrCents)} a year`} icon="trending" onClick={() => go('revenue')} />
        <Stat label="CRM leads" value={c.total} sub={`${c.newThisWeek} new this week, not counting imports`} icon="users" onClick={() => go('leads')} />
      </div>

      <div className="crm-dash">
        <div className="crm-dash-main">
          <Section title="Needs attention">
            {attention.length ? (
              <div className="crm-card crm-attention">
                {attention.map((a) => (
                  <button type="button" key={a.key} className={`crm-attn crm-attn-${a.key}`} onClick={() => openAttention(a.key)}>
                    <span className="crm-attn-icon">
                      <Icon name={ATTN_ICON[a.key] ?? 'alert'} size={16} />
                    </span>
                    <span className="crm-attn-text">
                      <strong>{a.count}</strong> {a.text}
                    </span>
                    <Icon name="chevronRight" size={16} className="crm-attn-go" />
                  </button>
                ))}
              </div>
            ) : (
              <Empty icon="checkCircle">Nothing is waiting on anyone.</Empty>
            )}
          </Section>

          <Section title="Pipeline" action={<a href="#/pipeline">Open the board</a>}>
            <div className="crm-card crm-pipe">
              {bar.length > 0 && (
                <div className="crm-pipe-bar" aria-hidden="true">
                  {bar.map((s) => (
                    <span key={s.stage} className={`crm-tone-${stageTone(s.stage)}`} style={{ flexGrow: s.count / barTotal }} title={`${stageLabel(s.stage)}: ${s.count}`} />
                  ))}
                </div>
              )}
              <div className="crm-stats">
                <Stat label="Need contact info" value={c.needContactInfo} onClick={() => go('leads?stage=need_contact_info')} tone={c.needContactInfo ? 'warn' : undefined} />
                <Stat label="Ready to contact" value={c.readyToContact} onClick={() => go('leads?stage=ready_to_contact')} />
                <Stat label="Contacted" value={c.contacted} onClick={() => go('leads?stage=contacted,replied')} />
                <Stat label="Interested" value={c.interested} onClick={() => go('leads?stage=interested,meeting')} />
                <Stat label="Proposals out" value={c.proposalsOutstanding} onClick={() => go('leads?stage=proposal_sent')} />
                <Stat label="Deals won" value={c.dealsWon} onClick={() => go('leads?stage=won,onboarding,active_customer')} tone="good" />
                <Stat label="Need a website" value={c.needWebsites} onClick={() => go('leads?type=website')} />
                <Stat label="New this week" value={c.newThisWeek} onClick={() => go(`leads?since=${Date.now() - 7 * 864e5}&imported=0&sort=created`)} />
              </div>
            </div>
          </Section>
        </div>

        <div className="crm-dash-side">
          <Section title="Due today" action={<a href="#/followups?view=due_today">All follow-ups</a>}>
            {!today.data ? (
              <Loading />
            ) : today.data.followups.length ? (
              <FollowupList
                items={today.data.followups.slice(0, 6)}
                onChange={() => {
                  void today.reload()
                  void reload()
                }}
              />
            ) : (
              <Empty icon="calendar">No follow-ups due for the rest of today.</Empty>
            )}
          </Section>
          <Section title="Top referrers" action={<a href="#/referrers">Leaderboard</a>}>
            {!refs.data ? (
              <Loading />
            ) : top.length ? (
              <ul className="crm-card crm-list crm-toprefs">
                {top.map((r, i) => (
                  <li key={r.id} className="crm-row">
                    <span className="crm-rank">{i + 1}</span>
                    <a className="crm-row-main is-inline" href={`#/referrer/${r.id}`}>
                      <PersonChip id={r.id} name={r.name} />
                    </a>
                    <span className="crm-row-num">
                      {r.leads}
                      <small> leads</small>
                    </span>
                    <span className="crm-row-num is-good">
                      {r.won}
                      <small> won</small>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon="share">Nobody has referred a business yet.</Empty>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- pipeline */

const BOARD = ['need_contact_info', 'ready_to_contact', 'contacted', 'replied', 'interested', 'meeting', 'proposal_sent', 'won']

export function Pipeline() {
  const [bump, setBump] = useState(0)
  const [dragging, setDragging] = useState<{ id: string; from: string } | null>(null)
  const summary = useApi<{ stages: { stage: string; count: number; valueCents: number }[] }>(`/api/crm/pipeline?_=${bump}`)
  const move = async (id: string, from: string, to: string, name: string) => {
    if (from === to) return
    if (to === 'won' && !window.confirm(`Mark ${name} won with no deal? Revenue is counted from deals: open the lead to record what they paid.`)) return
    try {
      await api(`/api/crm/leads/${id}/stage`, { method: 'POST', body: { stage: to } })
      setBump((b) => b + 1)
    } catch (e) {
      window.alert((e as Error).message)
    }
  }
  const total = summary.data?.stages.filter((s) => BOARD.includes(s.stage) && s.stage !== 'won').reduce((n, s) => n + s.valueCents, 0) ?? 0
  return (
    <div className="crm-view is-wide">
      <PageHead
        title="Pipeline"
        sub={
          <>
            Drag a card to move it; every move is recorded in the lead&rsquo;s history. <strong>{money(total)}</strong> open.
          </>
        }
      />
      <div className="crm-board">
        {BOARD.map((s) => (
          <Column
            key={`${s}-${bump}`}
            stage={s}
            summary={summary.data?.stages.find((x) => x.stage === s)}
            dragging={dragging}
            onDrag={setDragging}
            onMove={move}
          />
        ))}
      </div>
    </div>
  )
}

function Column({
  stage,
  summary,
  dragging,
  onDrag,
  onMove,
}: {
  stage: string
  summary?: { count: number; valueCents: number }
  dragging: { id: string; from: string } | null
  onDrag: (d: { id: string; from: string } | null) => void
  onMove: (id: string, from: string, to: string, name: string) => void
}) {
  const { go } = useCrm()
  const [over, setOver] = useState(false)
  const { data, error } = useApi<{ total: number; leads: LeadSummary[] }>(`/api/crm/leads?stage=${stage}&limit=30&sort=next`)
  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const id = e.dataTransfer.getData('text/plain')
    const lead = data?.leads.find((l) => l.id === id)
    if (dragging && id) onMove(id, dragging.from, stage, lead?.name ?? 'this lead')
    onDrag(null)
  }
  return (
    <div
      className={`crm-col${over && dragging?.from !== stage ? ' is-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <div className="crm-col-head">
        <span className={`crm-col-dot crm-tone-${stageTone(stage)}`} aria-hidden="true" />
        <span className="crm-col-name">{stageLabel(stage)}</span>
        <button type="button" className="crm-col-count" onClick={() => go(`leads?stage=${stage}`)} aria-label={`All ${stageLabel(stage)} leads`}>
          {summary?.count ?? data?.total ?? '…'}
        </button>
        {!!summary?.valueCents && <span className="crm-col-value">{money(summary.valueCents)}</span>}
      </div>
      <div className="crm-col-body">
        {error && <Failure error={error} />}
        {data?.leads.map((l) => (
          <div
            className="crm-pcard"
            key={l.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', l.id)
              e.dataTransfer.effectAllowed = 'move'
              onDrag({ id: l.id, from: stage })
            }}
            onDragEnd={() => onDrag(null)}
          >
            <div className="crm-pcard-top">
              <Avatar name={l.name} icon={l.icon} size={28} />
              <a href={`#/lead/${l.id}`} className="crm-pcard-name">
                {l.name}
              </a>
            </div>
            <div className="crm-pcard-meta">
              {[l.city, opportunityLabel(l.opportunityType)].filter(Boolean).join(' · ')}
            </div>
            <div className="crm-pcard-foot">
              {l.potentialCents ? <span className="crm-pcard-value">{money(l.potentialCents)}</span> : <span />}
              {l.nextFollowupAt ? (
                <span className={`crm-due${l.nextFollowupAt < Date.now() ? ' is-late' : ''}`}>
                  <Icon name="clock" size={12} />
                  {ago(l.nextFollowupAt)}
                </span>
              ) : null}
              {l.assignee && <Avatar name={l.assignee.name} size={20} kind="person" />}
            </div>
            <select aria-label={`Move ${l.name}`} value={l.stage} onChange={(e) => onMove(l.id, stage, e.target.value, l.name)}>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        {data && data.total > data.leads.length && (
          <button type="button" className="crm-col-more" onClick={() => go(`leads?stage=${stage}`)}>
            {data.total - data.leads.length} more
            <Icon name="arrowRight" size={14} />
          </button>
        )}
        {data && !data.total && <div className="crm-col-empty">Drop a lead here</div>}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- businesses */

interface Family {
  familyKey: string
  name: string
  icon: string | null
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
      <PageHead title="Businesses" sub="One row per business: locations of the same business roll up. Open one to see each location's lead." />
      <div className="crm-toolbar">
        <label className="crm-searchbox">
          <Icon name="search" size={15} />
          <input type="search" placeholder="Filter businesses" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} aria-label="Filter businesses" />
        </label>
      </div>
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Business</th>
                <th className="num">Locations</th>
                <th>Cities</th>
                <th className="num">Open</th>
                <th className="num">Won</th>
                <th className="num">Pipeline</th>
                <th className="num">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.families.map((f) => (
                <tr key={f.familyKey} className="is-link" onClick={() => go(`leads?family=${encodeURIComponent(f.familyKey)}`)}>
                  <td data-label="Business">
                    <span className="crm-cell-org">
                      <Avatar name={f.name} icon={f.icon} size={28} />
                      <strong>{f.name}</strong>
                    </span>
                  </td>
                  <td data-label="Locations" className="num">{f.locations}</td>
                  <td data-label="Cities" className="crm-muted">{f.cities}</td>
                  <td data-label="Open" className="num">{f.open}</td>
                  <td data-label="Won" className="num">{f.won}</td>
                  <td data-label="Pipeline" className="num">{money(f.pipelineCents)}</td>
                  <td data-label="Revenue" className="num">
                    {money(f.oneTimeCents)}
                    {f.mrrCents ? <small> + {money(f.mrrCents)}/mo</small> : null}
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
      <button type="button" className="crm-btn crm-btn-sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
        <Icon name="chevronLeft" size={14} />
        Previous
      </button>
      <span>
        {page * size + 1}–{Math.min(total, (page + 1) * size)} of {total}
      </span>
      <button type="button" className="crm-btn crm-btn-sm" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Next
        <Icon name="chevronRight" size={14} />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------- follow-ups */

export interface FollowupItem {
  id: string
  leadId: string
  name: string
  icon: string | null
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

const FU_TABS: [string, string, IconName][] = [
  ['overdue', 'Overdue', 'alert'],
  ['due_today', 'Due today', 'clock'],
  ['upcoming', 'Upcoming', 'calendar'],
  ['no_next_action', 'No next action', 'inbox'],
  ['recent', 'Recently completed', 'checkCircle'],
]

export function Followups({ view }: { view: string }) {
  const { data, error, reload } = useApi<{ kind: 'followups'; followups: FollowupItem[] } | { kind: 'leads'; total: number; leads: LeadSummary[] }>(
    `/api/crm/followups?view=${view}&end=${endOfToday()}`,
  )
  return (
    <div className="crm-view">
      <PageHead title="Follow-ups" sub="Every open lead should have a next step, with a person and a time." />
      <div className="crm-tabs" role="tablist">
        {FU_TABS.map(([k, label, icon]) => (
          <a key={k} href={`#/followups?view=${k}`} className={view === k ? 'is-on' : undefined} role="tab" aria-selected={view === k}>
            <Icon name={icon} size={14} />
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
            <p className="crm-lede">Open leads with nothing scheduled. Warm ones first: an interested lead with no next step goes cold.</p>
            <ul className="crm-card crm-list">
              {data.leads
                .slice()
                .sort((a, b) => Number(['interested', 'meeting', 'proposal_sent'].includes(b.stage)) - Number(['interested', 'meeting', 'proposal_sent'].includes(a.stage)))
                .map((l) => (
                  <li key={l.id} className="crm-row">
                    <Avatar name={l.name} icon={l.icon} size={32} />
                    <a href={`#/lead/${l.id}`} className="crm-row-main">
                      <strong>{l.name}</strong>
                      <span>{[l.city, l.category].filter(Boolean).join(' · ')}</span>
                    </a>
                    <StagePill stage={l.stage} />
                    <ContactActions c={l.channels} compact />
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <Empty icon="checkCircle">Every open lead has a next step.</Empty>
        )
      ) : data.followups.length ? (
        <FollowupList items={data.followups} onChange={reload} />
      ) : (
        <Empty icon="calendar">Nothing here.</Empty>
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
    <ul className="crm-card crm-list">
      {items.map((f) => {
        const late = !f.completedAt && f.dueAt < Date.now()
        return (
          <li key={f.id} className={`crm-row${late ? ' is-late' : ''}`}>
            <Avatar name={f.name} icon={f.icon} size={32} />
            <a href={`#/lead/${f.leadId}`} className="crm-row-main">
              <strong>{f.name}</strong>
              <span>
                {f.type} · {f.completedAt ? `done ${ago(f.completedAt)}` : `due ${dateTime(f.dueAt)}`}
                {f.priority === 'high' ? ' · high priority' : ''}
              </span>
              {f.notes && <em>{f.notes}</em>}
            </a>
            {f.owner && <PersonChip id={f.owner.id} name={f.owner.name} muted />}
            <ContactActions c={f.channels} compact />
            {!f.completedAt && (
              <button type="button" className="crm-btn crm-btn-sm" onClick={() => void complete(f)}>
                <Icon name="check" size={14} />
                Done
              </button>
            )}
          </li>
        )
      })}
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
    <div className="crm-seg" role="tablist" aria-label="Period">
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
      <PageHead title="Revenue" sub="From deals as they were sold: a later price change never rewrites these. MRR is what is active today." actions={<PeriodPicker value={period} onChange={setPeriod} />} />
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="crm-kpis">
            <Stat label="One-time revenue" value={money(data.oneTimeCents)} sub={`${data.dealsWon} deal${data.dealsWon === 1 ? '' : 's'} won`} icon="dollar" />
            <Stat label="MRR" value={money(data.mrrCents)} sub="active monthly plans" icon="trending" />
            <Stat label="ARR" value={money(data.arrCents)} sub="MRR × 12" icon="chart" />
            <Stat label="Pipeline value" value={money(data.pipelineCents)} sub={`${data.openLeads} open leads`} icon="target" />
          </div>
          <Section title="By month">
            {data.byMonth.length ? (
              <div className="crm-card">
                <MonthChart rows={data.byMonth} period={period} />
              </div>
            ) : (
              <Empty icon="chart">No won deals yet: the months fill in as deals close.</Empty>
            )}
          </Section>
          <div className="crm-grid2">
            <Breakdown title="By referrer" rows={data.byReferrer} />
            <Breakdown title="By salesperson" rows={data.bySalesperson} />
            <Breakdown title="By offer" rows={data.byOffer} />
            <Breakdown title="By city" rows={data.byCity} />
            <Breakdown title="By category" rows={data.byCategory} />
          </div>
        </>
      )}
    </div>
  )
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

/** Every month from the first to this one, so quiet months show as gaps
    instead of the bars sitting side by side. "All time" shows at least six
    months and "This year" starts in January; the short periods only pad
    between the months they have. */
function monthWindow(rows: Slice[], period: string): Slice[] {
  const now = new Date()
  const keys = rows.map((r) => r.key).sort()
  const [fy, fm] = (keys[0] ?? monthKey(now)).split('-').map(Number)
  let start = new Date(fy, fm - 1, 1)
  if (period === 'year') start = new Date(now.getFullYear(), 0, 1)
  if (period === 'all') start = new Date(Math.min(start.getTime(), new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime()))
  const byKey = new Map(rows.map((r) => [r.key, r]))
  const out: Slice[] = []
  for (let d = start; d <= now || byKey.has(monthKey(d)); d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const k = monthKey(d)
    out.push(byKey.get(k) ?? { key: k, label: k, deals: 0, oneTimeCents: 0, mrrCents: 0 })
  }
  return out
}

function MonthChart({ rows: data, period }: { rows: Slice[]; period: string }) {
  const rows = monthWindow(data, period)
  const max = Math.max(...rows.map((r) => r.oneTimeCents + r.mrrCents), 1)
  const label = (k: string) => {
    const [y, m] = k.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }
  return (
    <div className="crm-chart" role="img" aria-label="Revenue by month">
      {rows.map((r) => (
        <div key={r.key} className={`crm-chart-col${r.oneTimeCents + r.mrrCents ? '' : ' is-empty'}`}>
          <span className="crm-chart-val">{r.oneTimeCents ? money(r.oneTimeCents) : ''}</span>
          <span className="crm-chart-bar">
            <span className="is-mrr" style={{ height: `${(r.mrrCents / max) * 100}%` }} />
            <span className="is-once" style={{ height: `${(r.oneTimeCents / max) * 100}%` }} />
          </span>
          <span className="crm-chart-x">{label(r.key)}</span>
        </div>
      ))}
      <div className="crm-chart-legend">
        <span>
          <i className="is-once" /> One-time
        </span>
        <span>
          <i className="is-mrr" /> Monthly
        </span>
      </div>
    </div>
  )
}

function Breakdown({ title, rows }: { title: string; rows: Slice[] }) {
  const max = Math.max(...rows.map((r) => r.oneTimeCents), 1)
  return (
    <Section title={title}>
      {rows.length ? (
        <div className="crm-card crm-rank-list">
          {rows.map((r) => (
            <div key={r.key} className="crm-rank-row">
              <span className="crm-rank-label">{r.label}</span>
              <span className="crm-rank-bar">
                <span style={{ width: `${Math.max(3, (r.oneTimeCents / max) * 100)}%` }} />
              </span>
              <span className="crm-rank-val">
                {money(r.oneTimeCents)}
                <small>
                  {r.deals} deal{r.deals === 1 ? '' : 's'}
                  {r.mrrCents ? ` · ${money(r.mrrCents)}/mo` : ''}
                </small>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon="dollar">No won deals in this period.</Empty>
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

/** Funnel steps whose key is not the stage's own, so each bar takes its stage's colour. */
const FUNNEL_STAGE: Record<string, string> = { ready: 'ready_to_contact', proposals: 'proposal_sent' }

export function Analytics() {
  const { data, error, reload } = useApi<AnalyticsData>('/api/crm/analytics')
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const top = data.funnel[0]?.count || 1
  return (
    <div className="crm-view">
      <PageHead title="Analytics" sub="How leads move: the funnel from every stage change ever recorded, and how long each step takes." />
      <div className="crm-kpis">
        <Stat label="Time to first contact" value={durationLabel(data.avgMsToFirstContact)} sub={`average of ${data.firstContactSample}`} icon="clock" />
        <Stat label="Time to close" value={durationLabel(data.avgMsToClose)} sub={`average of ${data.closeSample}`} icon="trophy" />
        <Stat label="New leads, 30 days" value={data.last30.newLeads} sub="not counting imports" icon="users" />
        <Stat label="Won, 30 days" value={data.last30.won} sub={money(data.last30.wonCents)} icon="checkCircle" />
      </div>
      <Section title="Funnel">
        <div className="crm-card crm-funnel">
          {data.funnel.map((f, i) => (
            <div key={f.key} className="crm-funnel-row">
              <span className="crm-funnel-label">{f.label}</span>
              <span className="crm-funnel-bar">
                <span className={i ? `crm-tone-${stageTone(FUNNEL_STAGE[f.key] ?? f.key)}` : undefined} style={{ width: `${Math.max(2, (f.count / top) * 100)}%` }} />
              </span>
              <span className="crm-funnel-n">
                {f.count}
                {i > 0 && data.funnel[i - 1].count ? <em>{pct(f.count / data.funnel[i - 1].count)}</em> : null}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Time in each stage">
        <div className="crm-card crm-rank-list">
          {data.timeInStage
            .filter((s) => s.samples)
            .map((s) => (
              <div key={s.stage} className="crm-rank-row">
                <span className="crm-rank-label">
                  <StagePill stage={s.stage} />
                </span>
                <span className="crm-rank-val">
                  {durationLabel(s.avgMs)}
                  <small>
                    {s.samples} stay{s.samples === 1 ? '' : 's'}
                  </small>
                </span>
              </div>
            ))}
        </div>
      </Section>
    </div>
  )
}
