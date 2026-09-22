/*
  Today (what to do now), the Board, grouped businesses, Reminders, and Money
  with How it's going. Every row that names a business opens it, and every
  number says what it counts in words.
*/
import { useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import { api } from './api'
import type { LeadSummary, ReferrerMetrics } from './api'
import {
  Empty,
  Failure,
  Loading,
  PageTitle,
  PersonChip,
  ReachLink,
  Section,
  Segmented,
  StagePill,
  Stat,
  Tile,
  bestReach,
  durationLabel,
  endOfToday,
  money,
  pct,
  plural,
  stageTone,
  useApi,
  useCrm,
  whenLabel,
} from './ui'
import type { ContactKind } from './ui'
import { Icon } from './icons'
import { STAGES } from './model'
import { nextShort, placeLine, stageName } from './steps'

/* ------------------------------------------------------------------ today */

interface OverviewData {
  counts: Record<string, number>
  money: { oneTimeCents: number; mrrCents: number; arrCents: number; pipelineCents: number }
  attention: { key: string; count: number; text: string }[]
}

type LeadList = { total: number; leads: LeadSummary[] }

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function Overview() {
  const { actor } = useCrm()
  const end = endOfToday()
  const ov = useApi<OverviewData>('/api/crm/overview')
  const late = useApi<{ followups: FollowupItem[] }>(`/api/crm/followups?view=overdue&end=${end}`)
  const today = useApi<{ followups: FollowupItem[] }>(`/api/crm/followups?view=due_today&end=${end}`)
  const sent = useApi<LeadList>('/api/crm/leads?attention=uncontacted_referrals&limit=5')
  const warm = useApi<LeadList>('/api/crm/leads?attention=interested_no_next&limit=5')
  const stale = useApi<LeadList>('/api/crm/leads?attention=stale_proposals&limit=5')
  const ready = useApi<LeadList>('/api/crm/leads?stage=ready_to_contact&limit=5&sort=updated')
  const info = useApi<LeadList>('/api/crm/leads?stage=need_contact_info,new_lead&limit=4&sort=updated')
  const refs = useApi<{ referrers: ReferrerMetrics[] }>('/api/crm/referrers?period=all')
  const reload = () => {
    for (const x of [ov, late, today, sent, warm, stale, ready, info]) void x.reload()
  }
  if (ov.error) return <Failure error={ov.error} retry={ov.reload} />
  if (!ov.data) return <Loading />
  const c = ov.data.counts
  const due = [...(late.data?.followups ?? []), ...(today.data?.followups ?? [])]
  const lateN = late.data?.followups.length ?? 0
  const warmLeads = [...(warm.data?.leads ?? []), ...(stale.data?.leads ?? [])]
  const first = actor.name.split(' ')[0]

  const said: string[] = []
  if (due.length) said.push(`${due.length === 1 ? 'One reminder is' : `${due.length} reminders are`} due${lateN ? `, ${lateN === due.length ? (lateN === 1 ? 'and it is late' : 'all late') : `${lateN} late`}` : ''}`)
  if (sent.data?.total) said.push(`${plural(sent.data.total, 'business someone sent is', 'businesses someone sent are')} waiting for a first hello`)
  if (c.readyToContact) said.push(`${plural(c.readyToContact, 'business is', 'businesses are')} ready for a first hello`)
  if (!said.length) said.push('Nothing is waiting on you')

  const top = (refs.data?.referrers ?? []).filter((r) => r.id !== 'p_glenn' && r.leads > 0).slice(0, 4)

  return (
    <div className="crm-view crm-today">
      <PageTitle title="Today" sub={`${greeting()}, ${first}. ${said.join('. ')}.`} />
      <div className="crm-today-grid">
        <div className="crm-today-main">
          {due.length > 0 && (
            <Section title="Do these first" className="crm-due-now">
              <FollowupList items={due} onChange={reload} />
            </Section>
          )}
          {!!sent.data?.leads.length && (
            <Section title="Sent by someone, waiting for a hello" action={sent.data.total > 5 ? <a href="#/leads?attention=uncontacted_referrals">See all {sent.data.total}</a> : undefined}>
              <LeadRows leads={sent.data.leads} why={(l) => `Sent by ${l.referrer?.name ?? 'someone'}. ${placeLine(l.category, l.city)}`} />
            </Section>
          )}
          {warmLeads.length > 0 && (
            <Section title="Keep these warm">
              <LeadRows leads={warmLeads} why={(l) => (l.stage === 'proposal_sent' ? 'Quote sent, and no word for days' : 'Interested, with no reminder set')} />
            </Section>
          )}
          <Section title="Ready for a first hello" action={c.readyToContact > 5 ? <a href="#/leads?step=hello">See all {c.readyToContact}</a> : undefined}>
            {!ready.data ? <Loading /> : ready.data.leads.length ? <LeadRows leads={ready.data.leads} /> : <Empty icon="checkCircle">Everyone ready has been reached.</Empty>}
          </Section>
          <Section title="Find their phone or Instagram" action={(c.needContactInfo ?? 0) > 4 ? <a href="#/leads?step=info">See all {c.needContactInfo}</a> : undefined}>
            {!info.data ? (
              <Loading />
            ) : info.data.leads.length ? (
              <LeadRows leads={info.data.leads} why={(l) => `${placeLine(l.category, l.city)}. No phone, email or Instagram yet`} />
            ) : (
              <Empty icon="checkCircle">Every business has a way to reach it.</Empty>
            )}
          </Section>
        </div>

        <aside className="crm-today-side">
          <Section title="So far">
            <div className="crm-glance">
              <Stat label="Earned" value={money(ov.data.money.oneTimeCents)} sub={plural(c.dealsWon ?? 0, 'sale', 'sales')} />
              <Stat label="Monthly plans" value={money(ov.data.money.mrrCents)} sub={`${money(ov.data.money.arrCents)} a year`} />
              <Stat label="Open quotes" value={money(ov.data.money.pipelineCents)} sub="if every open business says yes" />
            </div>
          </Section>
          <Section title="Who's sending businesses" action={<a href="#/referrers">People</a>}>
            {!refs.data ? (
              <Loading />
            ) : top.length ? (
              <ul className="crm-group">
                {top.map((r) => (
                  <li key={r.id}>
                    <a className="crm-row" href={`#/referrer/${r.id}`}>
                      <PersonChip id={r.id} name={r.name} size={32} />
                      <span className="crm-row-end">
                        {plural(r.leads, 'sent', 'sent')}
                        {r.won ? `, ${r.won} bought` : ''}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon="share">Nobody else has sent a business yet. Their link is on their page under People.</Empty>
            )}
          </Section>
        </aside>
      </div>
    </div>
  )
}

/** Businesses, each with the one button that moves it along. */
function LeadRows({ leads, why }: { leads: LeadSummary[]; why?: (l: LeadSummary) => string }) {
  return (
    <ul className="crm-group">
      {leads.map((l) => {
        const kind = bestReach(l.channels)
        return (
          <li key={l.id} className="crm-row">
            <a className="crm-row-main" href={`#/lead/${l.id}`}>
              <Tile name={l.name} icon={l.icon} stage={l.stage} size={52} />
              <span className="crm-row-text">
                <strong>{l.name}</strong>
                <span>{why ? why(l) : placeLine(l.category, l.city)}</span>
              </span>
            </a>
            {kind ? (
              <ReachLink c={l.channels} kind={kind} className="crm-pill-act">
                <span>{kind === 'CALL' ? 'Call' : kind === 'INSTAGRAM_DM' ? 'DM' : 'Email'}</span>
              </ReachLink>
            ) : (
              <a className="crm-pill-act" href={`#/lead/${l.id}?info=1`}>
                Add info
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------ board */

const BOARD = ['need_contact_info', 'ready_to_contact', 'contacted', 'replied', 'interested', 'meeting', 'proposal_sent', 'won']

export function Pipeline() {
  const [bump, setBump] = useState(0)
  const [dragging, setDragging] = useState<{ id: string; from: string } | null>(null)
  const summary = useApi<{ stages: { stage: string; count: number; valueCents: number }[] }>(`/api/crm/pipeline?_=${bump}`)
  const move = async (id: string, from: string, to: string, name: string) => {
    if (from === to) return
    if (to === 'won' && !window.confirm(`Mark ${name} as a customer with no sale? Money is counted from sales: open the business to record what they paid.`)) return
    try {
      await api(`/api/crm/leads/${id}/stage`, { method: 'POST', body: { stage: to } })
      setBump((b) => b + 1)
    } catch (e) {
      window.alert((e as Error).message)
    }
  }
  const open = summary.data?.stages.filter((s) => BOARD.includes(s.stage) && s.stage !== 'won').reduce((n, s) => n + s.valueCents, 0) ?? 0
  return (
    <div className="crm-view is-wide">
      <PageTitle title="Board" sub={`Drag a business to move it; every move goes in its story. ${money(open)} in open quotes.`} />
      <div className="crm-board">
        {BOARD.map((s) => (
          <Column key={`${s}-${bump}`} stage={s} summary={summary.data?.stages.find((x) => x.stage === s)} dragging={dragging} onDrag={setDragging} onMove={move} />
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
  const [over, setOver] = useState(false)
  const { data, error } = useApi<LeadList>(`/api/crm/leads?stage=${stage}&limit=30&sort=next`)
  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const id = e.dataTransfer.getData('text/plain')
    const lead = data?.leads.find((l) => l.id === id)
    if (dragging && id) onMove(id, dragging.from, stage, lead?.name ?? 'this business')
    onDrag(null)
  }
  return (
    <div
      className={`crm-col is-${stageTone(stage)}${over && dragging?.from !== stage ? ' is-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <div className="crm-col-head">
        <a className="crm-col-name" href={`#/leads?stage=${stage}`}>
          {stageName(stage)}
        </a>
        <span className="crm-col-count">{summary?.count ?? data?.total ?? '…'}</span>
      </div>
      {!!summary?.valueCents && <div className="crm-col-value">{money(summary.valueCents)} quoted</div>}
      <div className="crm-col-body">
        {error && <Failure error={error} />}
        {data?.leads.map((l) => (
          <div
            className="crm-card-biz"
            key={l.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', l.id)
              e.dataTransfer.effectAllowed = 'move'
              onDrag({ id: l.id, from: stage })
            }}
            onDragEnd={() => onDrag(null)}
          >
            <a className="crm-card-biz-top" href={`#/lead/${l.id}`}>
              <Tile name={l.name} icon={l.icon} stage={l.stage} size={40} />
              <span>
                <strong>{l.name}</strong>
                <span>{l.city === 'BEASTY pages' ? 'BEASTY pages' : l.city}</span>
              </span>
            </a>
            {l.nextFollowupAt ? <span className={`crm-when${l.nextFollowupAt < Date.now() ? ' is-late' : ''}`}>{whenLabel(l.nextFollowupAt)}</span> : null}
            <select aria-label={`Move ${l.name}`} value={l.stage} onChange={(e) => onMove(l.id, stage, e.target.value, l.name)}>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {stageName(s.key)}
                </option>
              ))}
            </select>
          </div>
        ))}
        {data && data.total > data.leads.length && (
          <a className="crm-col-more" href={`#/leads?stage=${stage}`}>
            {data.total - data.leads.length} more
          </a>
        )}
        {data && !data.total && <div className="crm-col-empty">Nobody here yet</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------ grouped businesses */

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
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const { data, error, reload } = useApi<{ total: number; families: Family[] }>(
    `/api/crm/businesses?limit=50&offset=${page * 50}${q.trim().length >= 2 ? `&q=${encodeURIComponent(q.trim())}` : ''}`,
  )
  return (
    <div className="crm-view">
      <PageTitle title="Grouped businesses" sub="Every location of the same business together. Open one to see each location." />
      <label className="crm-find">
        <Icon name="search" size={17} stroke={2} />
        <input
          type="search"
          placeholder="Find a business"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(0)
          }}
          aria-label="Find a business"
        />
      </label>
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <>
          <ul className="crm-group">
            {data.families.map((f) => (
              <li key={f.familyKey}>
                <a className="crm-row" href={`#/leads?family=${encodeURIComponent(f.familyKey)}`}>
                  <Tile name={f.name} icon={f.icon} size={48} stage={f.won ? 'won' : undefined} />
                  <span className="crm-row-text">
                    <strong>{f.name}</strong>
                    <span>
                      {f.locations > 1 ? `${f.locations} locations: ${f.cities}` : f.cities}
                    </span>
                  </span>
                  <span className="crm-row-end">
                    {f.oneTimeCents ? `${money(f.oneTimeCents)} earned` : f.pipelineCents ? `${money(f.pipelineCents)} quoted` : ''}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Pager total={data.total} page={page} size={50} onPage={setPage} />
        </>
      )}
    </div>
  )
}

export function Pager({ total, page, size, onPage }: { total: number; page: number; size: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / size)
  if (pages <= 1) return <div className="crm-pager">{plural(total, 'business', 'businesses')}</div>
  return (
    <div className="crm-pager">
      <button type="button" className="crm-btn" disabled={page === 0} onClick={() => onPage(page - 1)}>
        <Icon name="chevronLeft" size={16} />
        Previous
      </button>
      <span>
        {page * size + 1}–{Math.min(total, (page + 1) * size)} of {total}
      </span>
      <button type="button" className="crm-btn" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        Next
        <Icon name="chevronRight" size={16} />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------- reminders */

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

const FU_VIEWS = [
  ['overdue', 'Late'],
  ['due_today', 'Today'],
  ['upcoming', 'Coming up'],
  ['no_next_action', 'No reminder'],
  ['recent', 'Done'],
] as const

export function Followups({ view }: { view: string }) {
  const { go } = useCrm()
  const { data, error, reload } = useApi<{ kind: 'followups'; followups: FollowupItem[] } | { kind: 'leads'; total: number; leads: LeadSummary[] }>(
    `/api/crm/followups?view=${view}&end=${endOfToday()}`,
  )
  return (
    <div className="crm-view">
      <PageTitle title="Reminders" sub="Every business being worked should have a next time someone gets in touch." />
      <Segmented value={view} options={FU_VIEWS} onChange={(v) => go(`followups?view=${v}`)} label="Which reminders" />
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : data.kind === 'leads' ? (
        data.leads.length ? (
          <>
            <p className="crm-note">Businesses being worked with nothing scheduled. The warm ones come first: an interested business with no reminder goes cold.</p>
            <LeadRows
              leads={data.leads
                .slice()
                .sort((a, b) => Number(['interested', 'meeting', 'proposal_sent'].includes(b.stage)) - Number(['interested', 'meeting', 'proposal_sent'].includes(a.stage)))}
              why={(l) => `${stageName(l.stage)}. ${placeLine(l.category, l.city)}`}
            />
          </>
        ) : (
          <Empty icon="checkCircle">Every business being worked has a reminder.</Empty>
        )
      ) : data.followups.length ? (
        <FollowupList items={data.followups} onChange={reload} />
      ) : (
        <Empty icon="bell">{view === 'overdue' ? 'Nothing is late.' : view === 'due_today' ? 'Nothing else today.' : 'Nothing here.'}</Empty>
      )}
    </div>
  )
}

const FU_KIND: Record<string, ContactKind | null> = { call: 'CALL', text: 'TEXT', email: 'EMAIL', instagram: 'INSTAGRAM_DM', meeting: null, other: null }
const FU_WORD: Record<string, string> = { call: 'Call', text: 'Text', email: 'Email', instagram: 'DM', meeting: 'Meet', other: 'Follow up with' }

/** Reminders, each with its business, when, what to say, and the button to do it. */
export function FollowupList({ items, onChange }: { items: FollowupItem[]; onChange: () => void }) {
  const { actor } = useCrm()
  const complete = async (f: FollowupItem) => {
    const outcome = window.prompt(`What happened with ${f.name}? (you can leave this empty)`)
    if (outcome === null) return
    try {
      await api(`/api/crm/followups/${f.id}/complete`, { method: 'POST', body: { outcome: outcome.trim() || null } })
      onChange()
    } catch (e) {
      window.alert((e as Error).message)
    }
  }
  return (
    <ul className="crm-group">
      {items.map((f) => {
        const late = !f.completedAt && f.dueAt < Date.now()
        const kind = FU_KIND[f.type] ?? null
        const mine = !f.owner || f.owner.id === actor.personId
        return (
          <li key={f.id} className={`crm-row${late ? ' is-late' : ''}`}>
            <a className="crm-row-main" href={`#/lead/${f.leadId}`}>
              <Tile name={f.name} icon={f.icon} stage={f.stage} size={52} badge={late ? 1 : null} />
              <span className="crm-row-text">
                <strong>{f.name}</strong>
                <span className={late ? 'is-late' : undefined}>
                  {FU_WORD[f.type] ?? 'Follow up'} {f.completedAt ? `was done ${whenLabel(f.completedAt)}` : `${late ? 'was due' : 'due'} ${whenLabel(f.dueAt)}`}
                  {!mine && f.owner ? `, for ${f.owner.name}` : ''}
                </span>
                {f.notes && <em>{f.notes}</em>}
              </span>
            </a>
            {!f.completedAt && (
              <span className="crm-row-acts">
                {kind && (
                  <ReachLink c={f.channels} kind={kind} className="crm-pill-act">
                    <span>{FU_WORD[f.type]}</span>
                  </ReachLink>
                )}
                <button type="button" className="crm-pill-act is-done" onClick={() => void complete(f)}>
                  <Icon name="check" size={16} stroke={2.4} />
                  Done
                </button>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------ money */

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
  return <Segmented value={value} options={PERIODS} onChange={onChange} label="Period" />
}

function MoneyTabs({ on }: { on: 'revenue' | 'analytics' }) {
  return (
    <nav className="crm-seg is-links" aria-label="Money">
      <a href="#/revenue" className={on === 'revenue' ? 'is-on' : undefined} aria-current={on === 'revenue' ? 'page' : undefined}>
        Earned
      </a>
      <a href="#/analytics" className={on === 'analytics' ? 'is-on' : undefined} aria-current={on === 'analytics' ? 'page' : undefined}>
        How it's going
      </a>
    </nav>
  )
}

export function Revenue() {
  const [period, setPeriod] = useState('all')
  const { data, error, reload } = useApi<RevenueData>(`/api/crm/revenue?period=${period}`)
  return (
    <div className="crm-view">
      <PageTitle title="Money" sub="What BEASTY earned, as each sale was made: changing a price later never rewrites a sale." />
      <div className="crm-toolbar">
        <MoneyTabs on="revenue" />
        <PeriodPicker value={period} onChange={setPeriod} />
      </div>
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="crm-glance is-row">
            <Stat label="Earned" value={money(data.oneTimeCents)} sub={plural(data.dealsWon, 'sale', 'sales')} />
            <Stat label="Monthly plans" value={money(data.mrrCents)} sub="coming in every month" />
            <Stat label="A year of plans" value={money(data.arrCents)} sub="monthly plans for twelve months" />
            <Stat label="Open quotes" value={money(data.pipelineCents)} sub={`across ${plural(data.openLeads, 'business', 'businesses')}`} />
          </div>
          <Section title="By month">
            {data.byMonth.length ? (
              <div className="crm-panel">
                <MonthChart rows={data.byMonth} period={period} />
              </div>
            ) : (
              <Empty icon="chart">No sales yet. The months fill in as businesses say yes.</Empty>
            )}
          </Section>
          <div className="crm-two">
            <Breakdown title="Who sent them" rows={data.byReferrer} />
            <Breakdown title="Who made the sale" rows={data.bySalesperson} />
            <Breakdown title="What sold" rows={data.byOffer} />
            <Breakdown title="Where" rows={data.byCity} />
            <Breakdown title="What kind of business" rows={data.byCategory} />
          </div>
        </>
      )}
    </div>
  )
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

/** Every month from the first to this one, so quiet months show as gaps. */
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
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' })
  }
  return (
    <div className="crm-chart" role="img" aria-label="Money by month">
      <div className="crm-chart-bars">
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
      </div>
      <div className="crm-chart-legend">
        <span>
          <i className="is-once" /> Sales
        </span>
        <span>
          <i className="is-mrr" /> Monthly plans
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
        <div className="crm-panel crm-bars">
          {rows.map((r) => (
            <div key={r.key} className="crm-bars-row">
              <span className="crm-bars-label">{r.label}</span>
              <span className="crm-bars-track">
                <span style={{ width: `${Math.max(3, (r.oneTimeCents / max) * 100)}%` }} />
              </span>
              <span className="crm-bars-val">
                {money(r.oneTimeCents)}
                <small>
                  {plural(r.deals, 'sale', 'sales')}
                  {r.mrrCents ? `, ${money(r.mrrCents)} a month` : ''}
                </small>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon="dollar">No sales in this period.</Empty>
      )}
    </Section>
  )
}

/* -------------------------------------------------------- how it's going */

interface AnalyticsData {
  funnel: { key: string; label: string; count: number }[]
  avgMsToFirstContact: number | null
  firstContactSample: number
  avgMsToClose: number | null
  closeSample: number
  timeInStage: { stage: string; avgMs: number | null; samples: number }[]
  last30: { newLeads: number; won: number; wonCents: number }
}

/** The funnel's steps, named like the rest of the screen, and the stage each one's colour comes from. */
const FUNNEL_WORDS: Record<string, [string, string | null]> = {
  leads: ['In the book', null],
  ready: ['Could be reached', 'ready_to_contact'],
  contacted: ['Reached', 'contacted'],
  replied: ['Replied', 'replied'],
  interested: ['Interested', 'interested'],
  proposals: ['Got a quote', 'proposal_sent'],
  won: ['Said yes', 'won'],
}

export function Analytics() {
  const { data, error, reload } = useApi<AnalyticsData>('/api/crm/analytics')
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const top = data.funnel[0]?.count || 1
  return (
    <div className="crm-view">
      <PageTitle title="How it's going" sub="How far businesses get, counted from every move ever made, and how long each step takes." />
      <div className="crm-toolbar">
        <MoneyTabs on="analytics" />
      </div>
      <div className="crm-glance is-row">
        <Stat label="First hello" value={durationLabel(data.avgMsToFirstContact)} sub={`on average, from ${plural(data.firstContactSample, 'business', 'businesses')}`} />
        <Stat label="To a yes" value={durationLabel(data.avgMsToClose)} sub={`on average, from ${plural(data.closeSample, 'sale', 'sales')}`} />
        <Stat label="New, last 30 days" value={data.last30.newLeads} sub="added by hand or sent in" />
        <Stat label="Sales, last 30 days" value={data.last30.won} sub={money(data.last30.wonCents)} />
      </div>
      <Section title="How far businesses get">
        <div className="crm-panel crm-funnel">
          {data.funnel.map((f, i) => {
            const [word, stage] = FUNNEL_WORDS[f.key] ?? [f.label, null]
            return (
              <div key={f.key} className="crm-funnel-row">
                <span className="crm-funnel-label">{word}</span>
                <span className="crm-funnel-bar">
                  <span className={stage ? `is-${stageTone(stage)}` : undefined} style={{ width: `${Math.max(2, (f.count / top) * 100)}%` }} />
                </span>
                <span className="crm-funnel-n">{f.count}</span>
                <span className="crm-funnel-pct">{i > 0 && data.funnel[i - 1].count ? pct(f.count / data.funnel[i - 1].count) : ''}</span>
              </div>
            )
          })}
        </div>
      </Section>
      <Section title="Time on each step">
        <ul className="crm-group">
          {data.timeInStage
            .filter((s) => s.samples)
            .map((s) => (
              <li key={s.stage} className="crm-row">
                <StagePill stage={s.stage} />
                <span className="crm-row-end">
                  {durationLabel(s.avgMs)}
                  <small>{plural(s.samples, 'time', 'times')}</small>
                </span>
              </li>
            ))}
        </ul>
      </Section>
    </div>
  )
}

/** Next step, in a few words, for list rows. */
export function NextShort({ l }: { l: LeadSummary }): ReactNode {
  if (l.nextFollowupAt) return <span className={`crm-when${l.nextFollowupAt < Date.now() ? ' is-late' : ''}`}>{whenLabel(l.nextFollowupAt)}</span>
  return <span className="crm-next-word">{nextShort(l.stage)}</span>
}
