/*
  One lead. Ordered for a phone in someone's hand: reach them, write down what
  happened, move the stage, set the next step. Money, attribution, details and
  the full timeline follow. Every change goes through the server, which writes
  the history; the page just reloads what the server now says.
*/
import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api } from './api'
import type { LeadSummary, Ref } from './api'
import {
  Avatar,
  ContactActions,
  Failure,
  Loading,
  PersonChip,
  Section,
  StagePill,
  WebsitePill,
  ago,
  dateTime,
  dayLabel,
  durationLabel,
  fromLocalInput,
  money,
  toLocalInput,
  useApi,
  useCrm,
} from './ui'
import type { ContactKind } from './ui'
import { Icon } from './icons'
import type { IconName } from './icons'
import { ACTIVITY_LABELS, fmtPhone, opportunityLabel, stageLabel, websiteStatusLabel } from './model'

interface Detail {
  lead: LeadSummary & {
    contactName: string | null
    preferredChannel: string | null
    campaign: string | null
    referredAt: number | null
    referralNote: string | null
    sourceLabel: string | null
    closedBy: Ref | null
    wonAt: number | null
    lostAt: number | null
    createdBy: string
  }
  business: {
    id: string
    name: string
    tagline: string
    cuisine: string
    city: string
    category: string
    address: string | null
    hours: string | null
    site: string | null
    websiteStatus: string
    freeListing: boolean
    seats: { key: string; city: string; page: string; spot: number; category: string | null; yellow: boolean }[]
    pageUrl: string
    phone: string | null
    email: string | null
    instagram: string | null
    isIndividual: boolean
    notes: string[]
  } | null
  application: { id: string; business: string; cuisine: string | null; contact: string; city: string | null; social: string | null; created_at: number } | null
  history: { id: string; from_stage: string | null; to_stage: string; changed_at: number; changedBy: string; note: string | null }[]
  activities: { id: string; type: string; body: string | null; data: Record<string, unknown> | null; actor: string; occurredAt: number }[]
  followups: { id: string; dueAt: number; owner: Ref | null; priority: string; type: string; notes: string | null; completedAt: number | null; completedBy: string | null }[]
  deals: {
    id: string
    offerId: string
    offerName: string
    quotedCents: number
    soldCents: number | null
    monthlyCents: number
    status: 'open' | 'won' | 'lost'
    recurringActive: boolean
    wonAt: number | null
    lostAt: number | null
    lossReason: string | null
    closedBy: Ref | null
    createdAt: number
  }[]
  family: { id: string; business_name: string; city: string | null; stage: string }[]
}

/** The stage a lead usually goes to next, offered as one button. */
const NEXT: Record<string, string> = {
  new_lead: 'ready_to_contact',
  need_contact_info: 'ready_to_contact',
  ready_to_contact: 'contacted',
  contacted: 'replied',
  no_response: 'contacted',
  replied: 'interested',
  interested: 'meeting',
  meeting: 'proposal_sent',
}

/** The main road, drawn as the stage bar. Side exits (no response, lost) show as a tag. */
const PATH: [string, string][] = [
  ['ready_to_contact', 'Ready'],
  ['contacted', 'Contacted'],
  ['replied', 'Replied'],
  ['interested', 'Interested'],
  ['meeting', 'Meeting'],
  ['proposal_sent', 'Proposal'],
  ['won', 'Won'],
]
const PATH_RANK: Record<string, number> = {
  new_lead: -1,
  need_contact_info: -1,
  ready_to_contact: 0,
  contacted: 1,
  no_response: 1,
  replied: 2,
  interested: 3,
  meeting: 4,
  proposal_sent: 5,
  won: 6,
  onboarding: 6,
  active_customer: 6,
}

export function LeadDetail({ id }: { id: string }) {
  const { back } = useCrm()
  const { data, error, reload } = useApi<Detail>(`/api/crm/leads/${encodeURIComponent(id)}`)
  const [logKind, setLogKind] = useState<ContactKind | null>(null)
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const { lead } = data
  const done = () => void reload()
  const last = data.activities.find((a) => a.type !== 'SYSTEM' && a.type !== 'FOLLOW_UP')
  return (
    <div className="crm-view crm-lead">
      <a className="crm-back" href="#/leads" onClick={(e) => { e.preventDefault(); back('leads') }}>
        <Icon name="chevronLeft" size={16} />
        Leads
      </a>
      <header className="crm-lead-head">
        <div className="crm-lead-hero">
          <Avatar name={lead.name} icon={lead.icon} size={64} />
          <div className="crm-lead-id">
            <h1 className="crm-h1">{lead.name}</h1>
            <div className="crm-sub">
              {[lead.city, lead.category, opportunityLabel(lead.opportunityType), lead.contactName ? `Contact: ${lead.contactName}` : null].filter(Boolean).join(' · ')}
            </div>
            <div className="crm-pills">
              <StagePill stage={lead.stage} />
              <WebsitePill status={lead.websiteStatus} />
              {lead.priority === 'high' && <span className="crm-flag">High priority</span>}
              {lead.referrer && !lead.referralDefault && <span className="crm-tag">Referred by {lead.referrer.name}</span>}
            </div>
          </div>
        </div>
        <div className="crm-reach">
          <ContactActions c={lead.channels} onUse={setLogKind} />
          {(lead.channels.phone || lead.channels.email || lead.channels.instagram) && (
            <div className="crm-reach-lines">
              {lead.channels.phone && (
                <span>
                  <Icon name="phone" size={13} />
                  {fmtPhone(lead.channels.phone)}
                </span>
              )}
              {lead.channels.email && (
                <span>
                  <Icon name="mail" size={13} />
                  {lead.channels.email}
                </span>
              )}
              {lead.channels.instagram && (
                <span>
                  <Icon name="instagram" size={13} />@{lead.channels.instagram}
                </span>
              )}
              {lead.preferredChannel && <span className="crm-muted">Prefers {lead.preferredChannel}</span>}
            </div>
          )}
        </div>
        {last && (
          <div className="crm-last">
            <Icon name="activity" size={13} />
            <span>
              Last: <strong>{ACTIVITY_LABELS[last.type] ?? last.type}</strong> {ago(last.occurredAt)} by {last.actor}
              {last.body && last.type !== 'STAGE_CHANGE' ? ` · “${last.body.length > 70 ? `${last.body.slice(0, 70)}…` : last.body}”` : ''}
            </span>
          </div>
        )}
      </header>

      <div className="crm-lead-grid">
        <div className="crm-lead-main">
          <LogActivity id={lead.id} kind={logKind} onKindUsed={() => setLogKind(null)} onDone={done} />
          <StageControl id={lead.id} stage={lead.stage} hasOpenDeal={data.deals.some((d) => d.status === 'open')} onDone={done} />
          <Followups id={lead.id} items={data.followups} onDone={done} />
          <Deals id={lead.id} deals={data.deals} onDone={done} />
          <Timeline detail={data} />
        </div>
        <aside className="crm-lead-side">
          <Attribution detail={data} onDone={done} />
          <People detail={data} onDone={done} />
          <Details detail={data} onDone={done} />
          <Business detail={data} />
        </aside>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ small parts */

function useAction(onDone: () => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      onDone()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run, setError }
}

const Err = ({ error }: { error: string | null }) =>
  error ? (
    <div className="crm-error">
      <Icon name="alert" size={15} />
      <span>{error}</span>
    </div>
  ) : null

/* ------------------------------------------------------------ log activity */

const LOG_TYPES: [string, string, IconName][] = [
  ['NOTE', 'Note', 'pencil'],
  ['CALL', 'Call', 'phone'],
  ['TEXT', 'Text', 'message'],
  ['EMAIL', 'Email', 'mail'],
  ['INSTAGRAM_DM', 'Instagram DM', 'instagram'],
  ['PROPOSAL', 'Proposal', 'file'],
]

function LogActivity({ id, kind, onKindUsed, onDone }: { id: string; kind: ContactKind | null; onKindUsed: () => void; onDone: () => void }) {
  const [type, setType] = useState('NOTE')
  const [body, setBody] = useState('')
  const [when, setWhen] = useState('')
  const [earlier, setEarlier] = useState(false)
  const [saved, setSaved] = useState(false)
  const { busy, error, run } = useAction(onDone)

  /* Tapping Call / Text / Email / Instagram pre-picks that type, so logging it is one more tap. */
  useEffect(() => {
    if (!kind) return
    setType(kind)
    setSaved(false)
    onKindUsed()
  }, [kind, onKindUsed])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const at = when ? fromLocalInput(when) : undefined
    const ok = await run(() => api(`/api/crm/leads/${id}/activities`, { method: 'POST', body: { type, body: body.trim() || null, occurredAt: at } }))
    if (ok) {
      setBody('')
      setWhen('')
      setEarlier(false)
      setSaved(true)
      setType('NOTE')
    }
  }
  const needsText = type === 'NOTE'
  return (
    <Section title="Log what happened">
      <form className="crm-card crm-log" onSubmit={submit}>
        <div className="crm-seg is-types" role="radiogroup" aria-label="Activity type">
          {LOG_TYPES.map(([k, l, icon]) => (
            <button type="button" key={k} role="radio" aria-checked={type === k} className={type === k ? 'is-on' : undefined} onClick={() => { setType(k); setSaved(false) }}>
              <Icon name={icon} size={14} />
              {l}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={body}
          onChange={(e) => { setBody(e.target.value); setSaved(false) }}
          placeholder={needsText ? 'What happened, what they said, what is next…' : 'Optional: how it went'}
          aria-label="Activity details"
        />
        <div className="crm-log-foot">
          {earlier ? (
            <label className="crm-inline">
              When
              <input type="datetime-local" value={when} max={toLocalInput(Date.now())} onChange={(e) => setWhen(e.target.value)} aria-label="When it happened" />
            </label>
          ) : (
            <button type="button" className="crm-link" onClick={() => setEarlier(true)}>
              <Icon name="clock" size={13} />
              It happened earlier?
            </button>
          )}
          <button type="submit" className="crm-btn crm-btn-primary" disabled={busy || (needsText && !body.trim())}>
            {busy ? 'Saving…' : `Save ${ACTIVITY_LABELS[type]?.toLowerCase() ?? 'activity'}`}
          </button>
        </div>
        {saved && (
          <div className="crm-ok">
            <Icon name="checkCircle" size={14} />
            Saved to the timeline.
          </div>
        )}
        <Err error={error} />
      </form>
    </Section>
  )
}

/* ------------------------------------------------------------------ stage */

function StageControl({ id, stage, hasOpenDeal, onDone }: { id: string; stage: string; hasOpenDeal: boolean; onDone: () => void }) {
  const { meta } = useCrm()
  const [to, setTo] = useState(stage)
  const [note, setNote] = useState('')
  const { busy, error, run } = useAction(onDone)
  const move = (target: string) => {
    if (target === stage) return
    if (target === 'won' && !window.confirm(hasOpenDeal ? 'Mark won without closing the deal? Revenue is counted from deals: use "Mark won" on the deal instead.' : 'Mark won with no deal? Revenue is counted from deals: add the deal below to record what they paid.')) return
    void run(() => api(`/api/crm/leads/${id}/stage`, { method: 'POST', body: { stage: target, note: note.trim() || null } })).then((ok) => ok && setNote(''))
  }
  const next = NEXT[stage]
  const rank = PATH_RANK[stage]
  const off = rank === undefined || ['no_response', 'not_interested', 'bad_lead', 'closed_lost'].includes(stage)
  return (
    <Section title="Stage">
      <div className="crm-card crm-stage-ctl">
        <ol className="crm-stepper" aria-label="Stages">
          {PATH.map(([key, short], i) => {
            const state = rank !== undefined && rank >= 0 && i < rank ? 'is-done' : key === stage || (rank === 6 && i === 6) ? 'is-now' : ''
            return (
              <li key={key} className={state}>
                <button type="button" onClick={() => move(key)} disabled={busy} title={`Move to ${stageLabel(key)}`}>
                  <span className="crm-step-dot">{state === 'is-done' ? <Icon name="check" size={11} stroke={2.5} /> : null}</span>
                  <span className="crm-step-label">{short}</span>
                </button>
              </li>
            )
          })}
        </ol>
        <div className="crm-stage-now">
          Now <StagePill stage={stage} />
          {off && <span className="crm-muted">off the main road</span>}
        </div>
        <div className="crm-stage-actions">
          {next && (
            <button type="button" className="crm-btn crm-btn-primary" disabled={busy} onClick={() => move(next)}>
              Move to {stageLabel(next)}
              <Icon name="arrowRight" size={15} />
            </button>
          )}
          <div className="crm-stage-pick">
            <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Move to stage">
              {meta.stages.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <button type="button" className="crm-btn" disabled={busy || to === stage} onClick={() => move(to)}>
              Move
            </button>
          </div>
        </div>
        <input className="crm-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the history" aria-label="Stage change note" />
        <Err error={error} />
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- follow-ups */

function presets(): [string, number][] {
  const at = (days: number, hour: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    d.setHours(hour, 0, 0, 0)
    return d.getTime()
  }
  const later = new Date()
  later.setHours(later.getHours() + 3, 0, 0, 0)
  return [
    ['In 3 hours', later.getTime()],
    ['Tomorrow 10am', at(1, 10)],
    ['In 3 days', at(3, 10)],
    ['Next week', at(7, 10)],
  ]
}

function Followups({ id, items, onDone }: { id: string; items: Detail['followups']; onDone: () => void }) {
  const { meta, actor } = useCrm()
  const [due, setDue] = useState('')
  const [type, setType] = useState('call')
  const [priority, setPriority] = useState('normal')
  const [owner, setOwner] = useState(actor.personId ?? 'p_glenn')
  const [notes, setNotes] = useState('')
  const { busy, error, run, setError } = useAction(onDone)
  const open = items.filter((f) => !f.completedAt)
  const doneItems = items.filter((f) => f.completedAt).slice(0, 5)

  const schedule = async (e: FormEvent) => {
    e.preventDefault()
    const dueAt = fromLocalInput(due)
    if (!Number.isFinite(dueAt)) return setError('Pick when.')
    const ok = await run(() =>
      api(`/api/crm/leads/${id}/followups`, { method: 'POST', body: { dueAt, type, priority, ownerId: owner || null, notes: notes.trim() || null } }),
    )
    if (ok) {
      setDue('')
      setNotes('')
    }
  }
  const complete = (fid: string) => {
    const outcome = window.prompt('What happened? (optional)')
    if (outcome === null) return
    void run(() => api(`/api/crm/followups/${fid}/complete`, { method: 'POST', body: { outcome: outcome.trim() || null } }))
  }
  return (
    <Section title="Next step">
      {open.length > 0 && (
        <ul className="crm-card crm-list">
          {open.map((f) => (
            <li key={f.id} className={`crm-row${f.dueAt < Date.now() ? ' is-late' : ''}`}>
              <span className={`crm-row-icon${f.dueAt < Date.now() ? ' is-late' : ''}`}>
                <Icon name="calendar" size={16} />
              </span>
              <div className="crm-row-main">
                <strong>
                  {f.type} {ago(f.dueAt)}
                </strong>
                <span>
                  {dateTime(f.dueAt)}
                  {f.priority !== 'normal' ? ` · ${f.priority} priority` : ''}
                </span>
                {f.notes && <em>{f.notes}</em>}
              </div>
              {f.owner && <PersonChip id={f.owner.id} name={f.owner.name} muted />}
              <button type="button" className="crm-btn crm-btn-sm" disabled={busy} onClick={() => complete(f.id)}>
                <Icon name="check" size={14} />
                Done
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="crm-card crm-fu-form" onSubmit={schedule}>
        {!open.length && <p className="crm-lede">Nothing scheduled. Every open lead should have a next step.</p>}
        <div className="crm-chips">
          {presets().map(([label, t]) => (
            <button type="button" key={label} className={`crm-chip${due === toLocalInput(t) ? ' is-on' : ''}`} onClick={() => setDue(toLocalInput(t))}>
              {label}
            </button>
          ))}
        </div>
        <div className="crm-form-grid crm-fu-grid">
          <label className="crm-field crm-fu-when">
            <span>When</span>
            <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} required />
          </label>
          <label className="crm-field">
            <span>How</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {meta.followupTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-field">
            <span>Who</span>
            <select value={owner} onChange={(e) => setOwner(e.target.value)}>
              {meta.people
                .filter((p) => p.active && p.isTeam)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field">
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {meta.priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-field is-wide">
            <span>Note</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. send the $199 package" />
          </label>
        </div>
        <button type="submit" className="crm-btn crm-btn-primary" disabled={busy || !due}>
          <Icon name="calendar" size={15} />
          {busy ? 'Saving…' : 'Schedule follow-up'}
        </button>
        <Err error={error} />
      </form>
      {doneItems.length > 0 && (
        <details className="crm-details">
          <summary>Recently done ({doneItems.length})</summary>
          <ul className="crm-list is-quiet">
            {doneItems.map((f) => (
              <li key={f.id} className="crm-row">
                <div className="crm-row-main">
                  <span>
                    {f.type} due {dayLabel(f.dueAt)}, done {ago(f.completedAt)}
                    {f.completedBy ? ` by ${f.completedBy}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Section>
  )
}

/* ------------------------------------------------------------------ deals */

const dollars = (cents: number | null | undefined) => (cents == null ? '' : String(cents / 100))
const toCents = (v: string) => (v.trim() === '' ? null : Math.round(Number(v) * 100))

function Deals({ id, deals, onDone }: { id: string; deals: Detail['deals']; onDone: () => void }) {
  const { meta } = useCrm()
  const offers = meta.offers.filter((o) => o.active)
  const [offerId, setOfferId] = useState(offers[0]?.id ?? '')
  const offer = meta.offers.find((o) => o.id === offerId)
  const [quoted, setQuoted] = useState(dollars(offer?.oneTimeCents))
  const [monthly, setMonthly] = useState(dollars(offer?.monthlyCents))
  const [adding, setAdding] = useState(false)
  const { busy, error, run } = useAction(onDone)

  const pick = (oid: string) => {
    setOfferId(oid)
    const o = meta.offers.find((x) => x.id === oid)
    setQuoted(dollars(o?.oneTimeCents))
    setMonthly(dollars(o?.monthlyCents))
  }
  const create = async (e: FormEvent) => {
    e.preventDefault()
    const q = toCents(quoted)
    const m = toCents(monthly)
    if ((q !== null && !Number.isFinite(q)) || (m !== null && !Number.isFinite(m))) return
    const ok = await run(() => api(`/api/crm/leads/${id}/deals`, { method: 'POST', body: { offerId, quotedCents: q, monthlyCents: m } }))
    if (ok) setAdding(false)
  }
  return (
    <Section
      title="Deal"
      action={
        !adding && offers.length > 0 ? (
          <button type="button" className="crm-link" onClick={() => setAdding(true)}>
            <Icon name="plus" size={14} />
            Quote an offer
          </button>
        ) : undefined
      }
    >
      {!deals.length && !adding && (
        <div className="crm-empty">
          <span className="crm-empty-icon">
            <Icon name="dollar" size={18} />
          </span>
          <span>No deal yet. Quote an offer when they are ready for a price.</span>
        </div>
      )}
      {deals.map((d) => (
        <DealCard key={d.id} d={d} onDone={onDone} />
      ))}
      {adding && (
        <form className="crm-card crm-deal-form" onSubmit={create}>
          {!offers.length ? (
            <p className="crm-lede">No active offers. An admin can add them in Settings.</p>
          ) : (
            <>
              <div className="crm-offers" role="radiogroup" aria-label="Offer">
                {offers.map((o) => (
                  <button type="button" role="radio" aria-checked={offerId === o.id} key={o.id} className={`crm-offer${offerId === o.id ? ' is-on' : ''}`} onClick={() => pick(o.id)}>
                    <strong>{o.name}</strong>
                    <span>
                      {money(o.oneTimeCents)}
                      {o.monthlyCents ? ` + ${money(o.monthlyCents)}/mo` : ''}
                    </span>
                  </button>
                ))}
              </div>
              <div className="crm-form-grid">
                <label className="crm-field">
                  <span>Quoted, one-time ($)</span>
                  <input inputMode="decimal" value={quoted} onChange={(e) => setQuoted(e.target.value.replace(/[^0-9.]/g, ''))} />
                </label>
                <label className="crm-field">
                  <span>Monthly ($)</span>
                  <input inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value.replace(/[^0-9.]/g, ''))} />
                </label>
              </div>
              <p className="crm-lede">The offer's name and these prices are saved on the deal. Changing the offer later never changes this deal.</p>
              <div className="crm-row-actions">
                <button type="submit" className="crm-btn crm-btn-primary" disabled={busy || !offerId}>
                  {busy ? 'Saving…' : 'Save quote'}
                </button>
                <button type="button" className="crm-link" onClick={() => setAdding(false)}>
                  Cancel
                </button>
              </div>
            </>
          )}
          <Err error={error} />
        </form>
      )}
    </Section>
  )
}

function DealCard({ d, onDone }: { d: Detail['deals'][number]; onDone: () => void }) {
  const { meta, actor } = useCrm()
  const [mode, setMode] = useState<'won' | 'lost' | null>(null)
  const [sold, setSold] = useState(dollars(d.quotedCents))
  const [closer, setCloser] = useState(actor.personId ?? 'p_glenn')
  const [recurring, setRecurring] = useState(d.monthlyCents > 0)
  const [reason, setReason] = useState('')
  const { busy, error, run } = useAction(onDone)

  const win = (e: FormEvent) => {
    e.preventDefault()
    void run(() => api(`/api/crm/deals/${d.id}/won`, { method: 'POST', body: { soldCents: toCents(sold), closedBy: closer || null, recurring } }))
  }
  const lose = (e: FormEvent) => {
    e.preventDefault()
    void run(() => api(`/api/crm/deals/${d.id}/lost`, { method: 'POST', body: { reason } }))
  }
  return (
    <div className={`crm-card crm-deal is-${d.status}`}>
      <div className="crm-deal-head">
        <span className="crm-deal-icon">
          <Icon name={d.status === 'won' ? 'trophy' : d.status === 'lost' ? 'x' : 'file'} size={16} />
        </span>
        <strong>{d.offerName}</strong>
        <span className={`crm-deal-status is-${d.status}`}>{d.status === 'open' ? 'Quoted' : d.status === 'won' ? 'Won' : 'Lost'}</span>
      </div>
      <div className="crm-deal-money">
        {d.status === 'won' ? (
          <>
            Sold for <strong>{money(d.soldCents)}</strong>
            {d.soldCents !== d.quotedCents && <span className="crm-muted"> (quoted {money(d.quotedCents)})</span>}
          </>
        ) : (
          <>
            Quoted <strong>{money(d.quotedCents)}</strong>
          </>
        )}
        {d.monthlyCents > 0 && (
          <>
            {' '}
            + <strong>{money(d.monthlyCents)}/mo</strong>
            {d.status === 'won' && <span className={d.recurringActive ? 'crm-good' : 'crm-muted'}>{d.recurringActive ? ' active' : ' stopped'}</span>}
          </>
        )}
      </div>
      <div className="crm-sub">
        {d.status === 'won' && `Won ${dayLabel(d.wonAt)}${d.closedBy ? ` by ${d.closedBy.name}` : ''}`}
        {d.status === 'lost' && `Lost ${dayLabel(d.lostAt)}: ${d.lossReason ?? ''}`}
        {d.status === 'open' && `Quoted ${dayLabel(d.createdAt)}`}
      </div>
      {d.status === 'open' && !mode && (
        <div className="crm-row-actions">
          <button type="button" className="crm-btn crm-btn-good" onClick={() => setMode('won')}>
            <Icon name="trophy" size={15} />
            Mark won
          </button>
          <button type="button" className="crm-btn" onClick={() => setMode('lost')}>
            Mark lost
          </button>
        </div>
      )}
      {mode === 'won' && (
        <form className="crm-inline-form" onSubmit={win}>
          <div className="crm-form-grid">
            <label className="crm-field">
              <span>Sold for ($)</span>
              <input inputMode="decimal" value={sold} onChange={(e) => setSold(e.target.value.replace(/[^0-9.]/g, ''))} />
            </label>
            <label className="crm-field">
              <span>Closed by</span>
              <select value={closer} onChange={(e) => setCloser(e.target.value)}>
                {meta.people
                  .filter((p) => p.active && p.isTeam)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          {d.monthlyCents > 0 && (
            <label className="crm-check">
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
              {money(d.monthlyCents)}/mo is active now
            </label>
          )}
          <div className="crm-row-actions">
            <button type="submit" className="crm-btn crm-btn-good" disabled={busy}>
              {busy ? 'Saving…' : 'Confirm won'}
            </button>
            <button type="button" className="crm-link" onClick={() => setMode(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {mode === 'lost' && (
        <form className="crm-inline-form" onSubmit={lose}>
          <label className="crm-field is-wide">
            <span>Why was it lost?</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} required minLength={2} />
          </label>
          <div className="crm-row-actions">
            <button type="submit" className="crm-btn" disabled={busy || reason.trim().length < 2}>
              {busy ? 'Saving…' : 'Confirm lost'}
            </button>
            <button type="button" className="crm-link" onClick={() => setMode(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {d.status === 'won' && d.monthlyCents > 0 && (
        <button
          type="button"
          className="crm-link"
          disabled={busy}
          onClick={() => {
            if (d.recurringActive && !window.confirm(`Stop the ${money(d.monthlyCents)}/mo? MRR drops by that amount.`)) return
            void run(() => api(`/api/crm/deals/${d.id}/recurring`, { method: 'POST', body: { active: !d.recurringActive } }))
          }}
        >
          {d.recurringActive ? 'Stop monthly' : 'Restart monthly'}
        </button>
      )}
      <Err error={error} />
    </div>
  )
}

/* ------------------------------------------------------------ attribution */

function Attribution({ detail, onDone }: { detail: Detail; onDone: () => void }) {
  const { meta, actor } = useCrm()
  const { lead } = detail
  /* A Glenn default is a placeholder: anyone can set the real referrer once. */
  const locked = !!(lead.referrer || lead.sourceType) && !lead.referralDefault
  const [editing, setEditing] = useState(false)
  const [referrerId, setReferrerId] = useState(lead.referralDefault ? '' : lead.referrer?.id ?? '')
  const [sourceType, setSourceType] = useState(lead.referralDefault ? '' : lead.sourceType ?? '')
  const [campaign, setCampaign] = useState(lead.campaign ?? '')
  const [note, setNote] = useState(lead.referralNote ?? '')
  const [reason, setReason] = useState('')
  const { busy, error, run } = useAction(() => {
    setEditing(false)
    setReason('')
    onDone()
  })
  const save = (e: FormEvent) => {
    e.preventDefault()
    void run(() =>
      api(`/api/crm/leads/${lead.id}/referral`, {
        method: 'POST',
        body: { referrerId: referrerId || null, sourceType: sourceType || null, campaign: campaign || null, note: note || null, override: locked, reason: locked ? reason : undefined },
      }),
    )
  }
  const canEdit = !locked || actor.role === 'admin'
  return (
    <Section
      title="Where it came from"
      action={
        canEdit && !editing ? (
          <button type="button" className="crm-link" onClick={() => setEditing(true)}>
            {locked ? 'Change' : 'Set'}
          </button>
        ) : undefined
      }
    >
      <div className="crm-card">
        {!editing && (
          <dl className="crm-dl">
            <dt>Referred by</dt>
            <dd>
              {lead.referrer ? (
                <a href={`#/referrer/${lead.referrer.id}`}>
                  <PersonChip id={lead.referrer.id} name={lead.referrer.name} />
                </a>
              ) : (
                'Nobody'
              )}
              {lead.referralDefault && <span className="crm-default">default</span>}
            </dd>
            <dt>Source</dt>
            <dd>{lead.sourceLabel ?? lead.sourceType ?? 'Not set'}</dd>
            {lead.campaign && (
              <>
                <dt>Campaign</dt>
                <dd>{lead.campaign}</dd>
              </>
            )}
            {lead.referredAt && (
              <>
                <dt>Since</dt>
                <dd>{dayLabel(lead.referredAt)}</dd>
              </>
            )}
            {lead.referralNote && (
              <>
                <dt>Note</dt>
                <dd>{lead.referralNote}</dd>
              </>
            )}
          </dl>
        )}
        {!editing && lead.referralDefault && <p className="crm-lede">Glenn by default: nobody recorded who brought them. Set the real referrer and it takes over.</p>}
        {!editing && locked && actor.role !== 'admin' && <p className="crm-lede">The original source stays. Only an admin can change it, with a reason.</p>}
        {editing && (
          <form onSubmit={save}>
            <div className="crm-form-grid is-single">
              <label className="crm-field">
                <span>Referred by</span>
                <select value={referrerId} onChange={(e) => setReferrerId(e.target.value)}>
                  <option value="">Nobody</option>
                  {meta.people
                    .filter((p) => p.active || p.id === lead.referrer?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="crm-field">
                <span>Source</span>
                <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
                  <option value="">{referrerId ? "The referrer's type" : 'Pick one'}</option>
                  {meta.sources.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span>Campaign</span>
                <input value={campaign} onChange={(e) => setCampaign(e.target.value)} />
              </label>
              <label className="crm-field">
                <span>Note</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              {locked && (
                <label className="crm-field">
                  <span>Why is the original source changing? (kept in the log)</span>
                  <input value={reason} onChange={(e) => setReason(e.target.value)} required minLength={3} />
                </label>
              )}
            </div>
            <div className="crm-row-actions">
              <button type="submit" className="crm-btn crm-btn-primary" disabled={busy || (!referrerId && !sourceType) || (locked && reason.trim().length < 3)}>
                {busy ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="crm-link" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <Err error={error} />
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ people */

function People({ detail, onDone }: { detail: Detail; onDone: () => void }) {
  const { meta } = useCrm()
  const { lead } = detail
  const { busy, error, run } = useAction(onDone)
  const team = meta.people.filter((p) => (p.active && p.isTeam) || p.id === lead.assignee?.id || p.id === lead.closedBy?.id)
  const patch = (body: Record<string, unknown>) => void run(() => api(`/api/crm/leads/${lead.id}`, { method: 'PATCH', body }))
  return (
    <Section title="Who works it">
      <div className="crm-card crm-form-grid is-single">
        <label className="crm-field">
          <span>Owner</span>
          <select value={lead.assignee?.id ?? ''} disabled={busy} onChange={(e) => patch({ assignedTo: e.target.value || null })}>
            {!lead.assignee && <option value="">Nobody</option>}
            {team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="crm-field">
          <span>Closed by</span>
          <select value={lead.closedBy?.id ?? ''} disabled={busy} onChange={(e) => patch({ closedBy: e.target.value || null })}>
            <option value="">Nobody yet</option>
            {team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <p className="crm-lede">Referred by, owner and closed by are separate: changing one never changes the others.</p>
        <Err error={error} />
      </div>
    </Section>
  )
}

/* ----------------------------------------------------------------- details */

function Details({ detail, onDone }: { detail: Detail; onDone: () => void }) {
  const { meta } = useCrm()
  const { lead } = detail
  const [f, setF] = useState({
    contactName: lead.contactName ?? '',
    preferredChannel: lead.preferredChannel ?? '',
    priority: lead.priority,
    potential: dollars(lead.potentialCents),
    opportunityType: lead.opportunityType,
  })
  const { busy, error, run } = useAction(onDone)
  const dirty =
    f.contactName !== (lead.contactName ?? '') ||
    f.preferredChannel !== (lead.preferredChannel ?? '') ||
    f.priority !== lead.priority ||
    f.potential !== dollars(lead.potentialCents) ||
    f.opportunityType !== lead.opportunityType
  const save = (e: FormEvent) => {
    e.preventDefault()
    void run(() =>
      api(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        body: {
          contactName: f.contactName || null,
          preferredChannel: f.preferredChannel || null,
          priority: f.priority,
          potentialCents: toCents(f.potential) ?? 0,
          opportunityType: f.opportunityType,
        },
      }),
    )
  }
  return (
    <Section title="Details">
      <form className="crm-card" onSubmit={save}>
        <div className="crm-props">
          <label className="crm-prop">
            <span>Contact</span>
            <input value={f.contactName} onChange={(e) => setF({ ...f, contactName: e.target.value })} placeholder="Name" />
          </label>
          <label className="crm-prop">
            <span>Prefers</span>
            <select value={f.preferredChannel} onChange={(e) => setF({ ...f, preferredChannel: e.target.value })}>
              <option value="">No preference</option>
              <option value="phone">Phone call</option>
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
          <label className="crm-prop">
            <span>Priority</span>
            <select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>
              {meta.priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-prop">
            <span>Value ($)</span>
            <input inputMode="decimal" value={f.potential} onChange={(e) => setF({ ...f, potential: e.target.value.replace(/[^0-9.]/g, '') })} />
          </label>
          <label className="crm-prop">
            <span>Opportunity</span>
            <select value={f.opportunityType} onChange={(e) => setF({ ...f, opportunityType: e.target.value })}>
              {meta.opportunityTypes.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {dirty && (
          <button type="submit" className="crm-btn crm-btn-primary crm-btn-block" disabled={busy}>
            {busy ? 'Saving…' : 'Save details'}
          </button>
        )}
        <div className="crm-sub crm-meta-line">
          Added {dayLabel(lead.createdAt)} by {lead.createdBy}
          {lead.firstContactedAt ? ` · first contacted ${dayLabel(lead.firstContactedAt)}` : ' · not contacted yet'}
          {lead.wonAt ? ` · won ${dayLabel(lead.wonAt)}` : ''}
        </div>
        <Err error={error} />
      </form>
    </Section>
  )
}

/* ---------------------------------------------------------------- business */

function Business({ detail }: { detail: Detail }) {
  const { business: b, application: a, family, lead } = detail
  return (
    <Section title="The business">
      <div className="crm-card">
        {b ? (
          <dl className="crm-dl">
            {b.tagline && (
              <>
                <dt>About</dt>
                <dd>{b.tagline}</dd>
              </>
            )}
            <dt>Website</dt>
            <dd>
              {b.site ? (
                <a href={b.site} target="_blank" rel="noreferrer">
                  {b.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  <Icon name="arrowUpRight" size={12} />
                </a>
              ) : (
                'None'
              )}
              <span className="crm-muted crm-block">{websiteStatusLabel(b.websiteStatus)}</span>
            </dd>
            {b.address && (
              <>
                <dt>Address</dt>
                <dd>
                  <a href={`https://maps.apple.com/?q=${encodeURIComponent(`${b.name} ${b.address}`)}`} target="_blank" rel="noreferrer">
                    {b.address}
                  </a>
                </dd>
              </>
            )}
            {b.hours && (
              <>
                <dt>Hours</dt>
                <dd>{b.hours}</dd>
              </>
            )}
            <dt>On BEASTY</dt>
            <dd>
              <a href={b.pageUrl} target="_blank" rel="noreferrer">
                Open the listing
                <Icon name="arrowUpRight" size={12} />
              </a>
              {b.freeListing && <span className="crm-muted crm-block">Free listing</span>}
              {b.isIndividual && <span className="crm-muted crm-block">BEASTY Individual</span>}
            </dd>
            {b.seats.length > 0 && (
              <>
                <dt>Seats</dt>
                <dd>{b.seats.map((s) => `${s.city} ${s.page} #${s.spot}${s.category ? ` (${s.category})` : ''}`).join('; ')}</dd>
              </>
            )}
            {b.notes.length > 0 && (
              <>
                <dt>Research</dt>
                <dd>
                  <ul className="crm-notes">
                    {b.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>
        ) : (
          <p className="crm-lede">Not listed on BEASTY yet. Contacts above are the ones saved on this lead.</p>
        )}
        {a && (
          <div className="crm-application">
            <h3>Reserve-a-spot request</h3>
            <dl className="crm-dl">
              <dt>Sent</dt>
              <dd>{dateTime(a.created_at)}</dd>
              <dt>Contact</dt>
              <dd>{a.contact}</dd>
              {a.cuisine && (
                <>
                  <dt>Type</dt>
                  <dd>{a.cuisine}</dd>
                </>
              )}
              {a.city && (
                <>
                  <dt>City</dt>
                  <dd>{a.city}</dd>
                </>
              )}
              {a.social && (
                <>
                  <dt>Social</dt>
                  <dd>{a.social}</dd>
                </>
              )}
            </dl>
          </div>
        )}
        {family.length > 0 && (
          <div className="crm-family">
            <h3>Other locations and deals for {lead.name}</h3>
            <ul className="crm-list is-quiet">
              {family.map((x) => (
                <li key={x.id} className="crm-row">
                  <a className="crm-row-main" href={`#/lead/${x.id}`}>
                    <strong>{x.business_name}</strong>
                    <span>{x.city ?? ''}</span>
                  </a>
                  <StagePill stage={x.stage} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  )
}

/* ---------------------------------------------------------------- timeline */

const TL_ICON: Record<string, IconName> = {
  NOTE: 'pencil',
  CALL: 'phone',
  TEXT: 'message',
  EMAIL: 'mail',
  INSTAGRAM_DM: 'instagram',
  PROPOSAL: 'file',
  REFERRAL: 'share',
  STAGE_CHANGE: 'arrowRight',
  FOLLOW_UP: 'calendar',
  DEAL_WON: 'trophy',
  DEAL_LOST: 'x',
  ASSIGNMENT: 'user',
  SYSTEM: 'sparkles',
}

function describe(a: Detail['activities'][number]): ReactNode {
  const d = a.data ?? {}
  switch (a.type) {
    case 'STAGE_CHANGE':
      return (
        <>
          {stageLabel(String(d.from ?? ''))} → <strong>{stageLabel(String(d.to ?? ''))}</strong>
          {a.body ? `: ${a.body}` : ''}
        </>
      )
    case 'FOLLOW_UP':
      return d.completed ? (
        <>Follow-up done{a.body ? `: ${a.body}` : ''}</>
      ) : (
        <>
          {String(d.type ?? 'Follow-up')} scheduled for {dateTime(Number(d.dueAt))}
          {d.owner ? ` (${String(d.owner)})` : ''}
          {a.body ? `: ${a.body}` : ''}
        </>
      )
    case 'DEAL_WON':
      return (
        <>
          {a.body} for <strong>{money(Number(d.soldCents))}</strong>
          {Number(d.monthlyCents) ? ` + ${money(Number(d.monthlyCents))}/mo` : ''}
        </>
      )
    case 'REFERRAL':
      return (
        <>
          {a.body}
          {d.campaign ? ` (campaign ${String(d.campaign)})` : ''}
          {d.replacedDefault ? <em> Replaced Glenn, who was the default.</em> : null}
          {d.override ? <em> Changed from the original: {String(d.reason ?? '')}</em> : null}
        </>
      )
    default:
      return a.body ?? ''
  }
}

function Timeline({ detail }: { detail: Detail }) {
  const [all, setAll] = useState(false)
  const items = all ? detail.activities : detail.activities.slice(0, 15)
  const stays = detail.history.map((h, i) => ({ ...h, until: detail.history[i + 1]?.changed_at ?? null }))
  return (
    <>
      <Section title="Timeline" className="crm-lead-timeline">
        <ol className="crm-card crm-timeline">
          {items.map((a) => (
            <li key={a.id} className={`crm-tl crm-tl-${a.type.toLowerCase()}`}>
              <span className="crm-tl-icon" aria-hidden="true">
                <Icon name={TL_ICON[a.type] ?? 'circle'} size={14} />
              </span>
              <div className="crm-tl-content">
                <div className="crm-tl-head">
                  <span className="crm-tl-type">{ACTIVITY_LABELS[a.type] ?? a.type}</span>
                  <span className="crm-tl-meta">
                    {a.actor} · <time dateTime={new Date(a.occurredAt).toISOString()} title={dateTime(a.occurredAt)}>{ago(a.occurredAt)}</time>
                  </span>
                </div>
                <div className="crm-tl-body">{describe(a)}</div>
              </div>
            </li>
          ))}
        </ol>
        {detail.activities.length > 15 && !all && (
          <button type="button" className="crm-link" onClick={() => setAll(true)}>
            Show all {detail.activities.length}
          </button>
        )}
      </Section>
      <Section title="Stage history" className="crm-lead-history">
        <table className="crm-table is-compact">
          <tbody>
            {stays.map((h) => (
              <tr key={h.id}>
                <td>{h.from_stage ? `${stageLabel(h.from_stage)} → ${stageLabel(h.to_stage)}` : `Started at ${stageLabel(h.to_stage)}`}</td>
                <td className="crm-muted">{dateTime(h.changed_at)}</td>
                <td className="crm-muted">{h.changedBy}</td>
                <td className="num">{durationLabel((h.until ?? Date.now()) - h.changed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  )
}
