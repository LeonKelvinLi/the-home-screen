/*
  One business. Read top to bottom on a phone: who they are and how to reach
  them, the one thing to do next, then write down what happened, set a
  reminder, the quote, and the story so far. Beside it (below it on a phone):
  the people around it, the details, and its BEASTY listing.

  "Owner" here means the person who runs the business. The BEASTY side is
  "Handled by", and whoever sent the business in is "Sent by": three
  different people, changed separately.
*/
import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api } from './api'
import type { Channels, LeadSummary, Ref } from './api'
import {
  PersonChip,
  REACH_LABEL,
  ReachLink,
  ReachRow,
  Section,
  StagePill,
  StepTrack,
  Tile,
  ago,
  bestReach,
  dateTime,
  dayLabel,
  durationLabel,
  fromLocalInput,
  money,
  toLocalInput,
  useApi,
  useCrm,
  whenLabel,
  Failure,
  Loading,
} from './ui'
import type { ContactKind } from './ui'
import { Icon } from './icons'
import { ACTIVITY_LABELS, fmtPhone, websiteStatusLabel } from './model'
import { NOT_REACHED, OUTREACH, isCustomer, nextFor, placeLine, stageName, stepOf } from './steps'

interface Detail {
  lead: LeadSummary & {
    found: Channels
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
  application: {
    id: string
    business: string
    cuisine: string | null
    contact: string
    city: string | null
    social: string | null
    /* The boxes of Glenn's revision of the form, 2026-09-22; null before it. */
    phone: string | null
    email: string | null
    address: string | null
    hours: string | null
    created_at: number
  } | null
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

/** The words for each kind of entry in a business's story. */
const KIND_WORD: Record<string, string> = { ...ACTIVITY_LABELS, PROPOSAL: 'Quote', REFERRAL: 'Sent in', STAGE_CHANGE: 'Moved', FOLLOW_UP: 'Reminder', DEAL_WON: 'Sold', DEAL_LOST: 'Lost', ASSIGNMENT: 'Handled by', SYSTEM: 'Update' }

export function LeadDetail({ id, params }: { id: string; params?: URLSearchParams }) {
  const { back } = useCrm()
  const { data, error, reload } = useApi<Detail>(`/api/crm/leads/${encodeURIComponent(id)}`)
  const [logKind, setLogKind] = useState<ContactKind | null>(null)
  const [adding, setAdding] = useState(params?.get('info') === '1')
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const { lead } = data
  const done = () => void reload()
  const last = data.activities.find((a) => !['SYSTEM', 'FOLLOW_UP', 'STAGE_CHANGE', 'REFERRAL', 'ASSIGNMENT'].includes(a.type))
  const sentBy = lead.referrer && !lead.referralDefault ? lead.referrer.name : null
  return (
    <div className="crm-view crm-biz">
      <a className="crm-back" href="#/leads" onClick={(e) => { e.preventDefault(); back('leads') }}>
        <Icon name="chevronLeft" size={20} stroke={2.2} />
        Businesses
      </a>
      <header className="crm-lead-head">
        <Tile name={lead.name} icon={lead.icon} stage={lead.stage} size={104} />
        <div className="crm-lead-id">
          <h1>{lead.name}</h1>
          <p>
            {placeLine(lead.category, lead.city)}
            {lead.contactName ? `. Owner: ${lead.contactName}` : ''}
          </p>
          <div className="crm-tags">
            {lead.websiteStatus && lead.websiteStatus !== 'has_site' && <span className="crm-tag">{websiteStatusLabel(lead.websiteStatus)}</span>}
            {sentBy && <span className="crm-tag is-sent">Sent by {sentBy}</span>}
            {lead.priority === 'high' && <span className="crm-tag is-hot">High priority</span>}
          </div>
        </div>
        <StepTrack stage={lead.stage} />
        <ReachRow c={lead.channels} onUse={setLogKind} />
        {last && (
          <p className="crm-last">
            Last: {KIND_WORD[last.type] ?? last.type} {ago(last.occurredAt)} by {last.actor}
            {last.body ? `: “${last.body.length > 80 ? `${last.body.slice(0, 80)}…` : last.body}”` : ''}
          </p>
        )}
      </header>

      <div className="crm-biz-grid">
        <div className="crm-biz-main">
          <NextCard detail={data} onDone={done} onUse={setLogKind} adding={adding} setAdding={setAdding} />
          <LogActivity lead={lead} kind={logKind} onKindUsed={() => setLogKind(null)} onDone={done} />
          <Reminders id={lead.id} items={data.followups} onDone={done} />
          <Quote id={lead.id} deals={data.deals} onDone={done} />
          <Story detail={data} />
        </div>
        <aside className="crm-biz-side">
          <PeopleCard detail={data} onDone={done} />
          <Details detail={data} onDone={done} />
          <OnBeasty detail={data} />
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
      <Icon name="alert" size={16} />
      <span>{error}</span>
    </div>
  ) : null

/* --------------------------------------------------------------- next step */

function NextCard({
  detail,
  onDone,
  onUse,
  adding,
  setAdding,
}: {
  detail: Detail
  onDone: () => void
  onUse: (k: ContactKind) => void
  adding: boolean
  setAdding: (v: boolean) => void
}) {
  const { meta } = useCrm()
  const { lead, deals } = detail
  const hasOpen = deals.some((d) => d.status === 'open')
  const n = nextFor(lead.stage)
  const [to, setTo] = useState(lead.stage)
  const [note, setNote] = useState('')
  const { busy, error, run } = useAction(onDone)
  const move = (target: string) => {
    if (target === lead.stage) return
    if (target === 'won' && !window.confirm(hasOpen ? 'Mark them a customer without the sale? Money is counted from sales: use "Mark as sold" on the quote instead.' : 'Mark them a customer with no sale? Money is counted from sales: add the quote below to record what they paid.')) return
    void run(() => api(`/api/crm/leads/${lead.id}/stage`, { method: 'POST', body: { stage: target, note: note.trim() || null } })).then((ok) => ok && setNote(''))
  }
  const kind = bestReach(lead.channels)
  return (
    <section className="crm-section crm-next">
      <div className="crm-next-card">
        <div className="crm-stage-now">
          <span>Now</span>
          <StagePill stage={lead.stage} />
        </div>
        <h2>{stepOf(lead.stage) === null ? n.title : `Next: ${n.title.charAt(0).toLowerCase()}${n.title.slice(1)}`}</h2>
        <div className="crm-next-acts">
          {n.addInfo && !adding && (
            <button type="button" className="crm-btn is-primary" onClick={() => setAdding(true)}>
              <Icon name="plus" size={16} stroke={2.4} />
              Add their info
            </button>
          )}
          {n.reach && kind && (
            <ReachLink c={lead.channels} kind={kind} onUse={onUse} className="crm-btn is-primary">
              <span>{kind === 'INSTAGRAM_DM' ? 'Message on Instagram' : REACH_LABEL[kind]}</span>
            </ReachLink>
          )}
          {n.moves.map((m) => (
            <button type="button" key={m.to} className="crm-btn" disabled={busy} onClick={() => move(m.to)}>
              {m.label}
            </button>
          ))}
        </div>
        {adding && <FoundForm lead={lead} onDone={onDone} onClose={() => setAdding(false)} />}
        <details className="crm-change-step">
          <summary>Change the step</summary>
          <div className="crm-stage-pick">
            <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Move to stage">
              {meta.stages.map((s) => (
                <option key={s.key} value={s.key}>
                  {stageName(s.key)}
                </option>
              ))}
            </select>
            <button type="button" className="crm-btn" disabled={busy || to === lead.stage} onClick={() => move(to)}>
              Move
            </button>
          </div>
          <input className="crm-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why (optional, kept in the story)" aria-label="Stage change note" />
        </details>
        <Err error={error} />
      </div>
    </section>
  )
}

/** A phone, email or Instagram the team found. Kept in the CRM; their BEASTY page does not change. */
function FoundForm({ lead, onDone, onClose }: { lead: Detail['lead']; onDone: () => void; onClose: () => void }) {
  const [f, setF] = useState({
    phone: lead.found.phone ? fmtPhone(lead.found.phone) : '',
    instagram: lead.found.instagram ? `@${lead.found.instagram}` : '',
    email: lead.found.email,
  })
  const { busy, error, run } = useAction(() => {
    onClose()
    onDone()
  })
  const listed = {
    phone: lead.channels.phone && lead.channels.phone !== lead.found.phone ? lead.channels.phone : '',
    email: lead.channels.email && lead.channels.email !== lead.found.email ? lead.channels.email : '',
    instagram: lead.channels.instagram && lead.channels.instagram !== lead.found.instagram ? lead.channels.instagram : '',
  }
  const save = (e: FormEvent) => {
    e.preventDefault()
    void run(() => api(`/api/crm/leads/${lead.id}`, { method: 'PATCH', body: { phone: f.phone.trim(), instagram: f.instagram.trim(), email: f.email.trim() } }))
  }
  return (
    <form className="crm-found" onSubmit={save}>
      <div className="crm-form">
        <label className="crm-field">
          <span>Phone</span>
          <input type="tel" value={listed.phone ? fmtPhone(listed.phone) : f.phone} disabled={!!listed.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoFocus={!listed.phone} />
        </label>
        <label className="crm-field">
          <span>Instagram</span>
          <input value={listed.instagram ? `@${listed.instagram}` : f.instagram} disabled={!!listed.instagram} onChange={(e) => setF({ ...f, instagram: e.target.value })} placeholder="@handle" />
        </label>
        <label className="crm-field is-wide">
          <span>Email</span>
          <input type="email" value={listed.email || f.email} disabled={!!listed.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </label>
      </div>
      <div className="crm-row-btns">
        <button type="submit" className="crm-btn is-primary" disabled={busy || (!f.phone.trim() && !f.instagram.trim() && !f.email.trim() && !lead.found.phone && !lead.found.email && !lead.found.instagram)}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="crm-link" onClick={onClose}>
          Cancel
        </button>
      </div>
      <Err error={error} />
    </form>
  )
}

/* ------------------------------------------------------------ what happened */

const LOG_TYPES: [string, string][] = [
  ['NOTE', 'Note'],
  ['CALL', 'Call'],
  ['TEXT', 'Text'],
  ['INSTAGRAM_DM', 'Instagram DM'],
  ['EMAIL', 'Email'],
  ['PROPOSAL', 'Quote'],
]

function LogActivity({ lead, kind, onKindUsed, onDone }: { lead: Detail['lead']; kind: ContactKind | null; onKindUsed: () => void; onDone: () => void }) {
  const [type, setType] = useState('NOTE')
  const [body, setBody] = useState('')
  const [when, setWhen] = useState('')
  const [earlier, setEarlier] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const { busy, error, run } = useAction(onDone)

  /* Tapping Call / Text / Email / Instagram up top gets that kind ready here, so logging it is one more tap. */
  useEffect(() => {
    if (!kind) return
    setType(kind)
    setSaved(null)
    onKindUsed()
  }, [kind, onKindUsed])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const at = when ? fromLocalInput(when) : undefined
    /* Reaching out to a business nobody had reached moves it on: the person only says what happened. */
    const moves = OUTREACH.includes(type) && NOT_REACHED.includes(lead.stage)
    const label = LOG_TYPES.find(([k]) => k === type)?.[1] ?? 'note'
    const ok = await run(async () => {
      await api(`/api/crm/leads/${lead.id}/activities`, { method: 'POST', body: { type, body: body.trim() || null, occurredAt: at } })
      if (moves) await api(`/api/crm/leads/${lead.id}/stage`, { method: 'POST', body: { stage: 'contacted', note: `Logged a ${label.toLowerCase()}` } })
    })
    if (ok) {
      setBody('')
      setWhen('')
      setEarlier(false)
      setSaved(moves ? `Saved. ${lead.name} moved to ${stageName('contacted')}.` : 'Saved to the story.')
      setType('NOTE')
    }
  }
  const needsText = type === 'NOTE'
  return (
    <Section title="What happened?">
      <form className="crm-panel crm-log" onSubmit={submit}>
        <div className="crm-kinds" role="radiogroup" aria-label="What kind">
          {LOG_TYPES.map(([k, l]) => (
            <button type="button" key={k} role="radio" aria-checked={type === k} className={type === k ? 'is-on' : undefined} onClick={() => { setType(k); setSaved(null) }}>
              {l}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={body}
          onChange={(e) => { setBody(e.target.value); setSaved(null) }}
          placeholder={needsText ? 'What happened, what they said' : 'How it went (you can leave this empty)'}
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
              It happened earlier?
            </button>
          )}
          <button type="submit" className="crm-btn is-dark" disabled={busy || (needsText && !body.trim())}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
        {saved && (
          <div className="crm-ok" role="status">
            <Icon name="checkCircle" size={16} />
            {saved}
          </div>
        )}
        <Err error={error} />
      </form>
    </Section>
  )
}

/* -------------------------------------------------------------- reminders */

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

const FU_WORD: Record<string, string> = { call: 'Call', text: 'Text', email: 'Email', instagram: 'DM', meeting: 'Meet', other: 'Follow up' }

function Reminders({ id, items, onDone }: { id: string; items: Detail['followups']; onDone: () => void }) {
  const { meta, actor } = useCrm()
  const [due, setDue] = useState('')
  const [type, setType] = useState('call')
  const [priority, setPriority] = useState('normal')
  const [owner, setOwner] = useState(actor.personId ?? 'p_glenn')
  const [notes, setNotes] = useState('')
  const [more, setMore] = useState(false)
  const { busy, error, run, setError } = useAction(onDone)
  const open = items.filter((f) => !f.completedAt)
  const doneItems = items.filter((f) => f.completedAt).slice(0, 5)

  const schedule = async (e: FormEvent) => {
    e.preventDefault()
    const dueAt = fromLocalInput(due)
    if (!Number.isFinite(dueAt)) return setError('Pick when.')
    const ok = await run(() => api(`/api/crm/leads/${id}/followups`, { method: 'POST', body: { dueAt, type, priority, ownerId: owner || null, notes: notes.trim() || null } }))
    if (ok) {
      setDue('')
      setNotes('')
    }
  }
  const complete = (fid: string) => {
    const outcome = window.prompt('What happened? (you can leave this empty)')
    if (outcome === null) return
    void run(() => api(`/api/crm/followups/${fid}/complete`, { method: 'POST', body: { outcome: outcome.trim() || null } }))
  }
  return (
    <Section title="Reminders">
      {open.length > 0 && (
        <ul className="crm-group crm-reminders">
          {open.map((f) => {
            const late = f.dueAt < Date.now()
            return (
              <li key={f.id} className={`crm-row${late ? ' is-late' : ''}`}>
                <span className={`crm-row-icon${late ? ' is-late' : ''}`}>
                  <Icon name="bell" size={18} />
                </span>
                <span className="crm-row-text">
                  <strong>
                    {FU_WORD[f.type] ?? 'Follow up'} {whenLabel(f.dueAt)}
                  </strong>
                  <span>
                    {late ? 'Late. ' : ''}
                    {f.owner ? `For ${f.owner.name}` : ''}
                    {f.priority === 'high' ? ', high priority' : ''}
                  </span>
                  {f.notes && <em>{f.notes}</em>}
                </span>
                <button type="button" className="crm-pill-act is-done" disabled={busy} onClick={() => complete(f.id)}>
                  <Icon name="check" size={16} stroke={2.4} />
                  Done
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <form className="crm-panel crm-fu-form" onSubmit={schedule}>
        {!open.length && <p className="crm-note">No reminder yet.</p>}
        <div className="crm-kinds is-when">
          {presets().map(([label, t]) => (
            <button type="button" key={label} className={due === toLocalInput(t) ? 'is-on' : undefined} onClick={() => setDue(toLocalInput(t))}>
              {label}
            </button>
          ))}
        </div>
        <div className="crm-form">
          <label className="crm-field">
            <span>When</span>
            <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} required />
          </label>
          <label className="crm-field">
            <span>How</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {meta.followupTypes.map((t) => (
                <option key={t} value={t}>
                  {FU_WORD[t] ?? t}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-field is-wide">
            <span>What to say</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. send the $199 package" />
          </label>
          {more ? (
            <>
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
                <span>How urgent</span>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </label>
            </>
          ) : (
            <button type="button" className="crm-link is-wide" onClick={() => setMore(true)}>
              For someone else, or urgent?
            </button>
          )}
        </div>
        <button type="submit" className="crm-btn is-dark" disabled={busy || !due}>
          <Icon name="bell" size={16} />
          {busy ? 'Saving…' : 'Set reminder'}
        </button>
        <Err error={error} />
      </form>
      {doneItems.length > 0 && (
        <details className="crm-more">
          <summary>Done ({doneItems.length})</summary>
          <ul className="crm-plain">
            {doneItems.map((f) => (
              <li key={f.id}>
                {FU_WORD[f.type] ?? 'Follow up'} due {dayLabel(f.dueAt)}, done {ago(f.completedAt)}
                {f.completedBy ? ` by ${f.completedBy}` : ''}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Section>
  )
}

/* ------------------------------------------------------------------ quote */

const dollars = (cents: number | null | undefined) => (cents == null ? '' : String(cents / 100))
const toCents = (v: string) => (v.trim() === '' ? null : Math.round(Number(v) * 100))

function Quote({ id, deals, onDone }: { id: string; deals: Detail['deals']; onDone: () => void }) {
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
      title="Quote"
      action={
        !adding && offers.length > 0 ? (
          <button type="button" className="crm-link" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} stroke={2.2} />
            Add a quote
          </button>
        ) : undefined
      }
    >
      {!deals.length && !adding && <p className="crm-note is-quiet">No quote yet.</p>}
      {deals.map((d) => (
        <DealCard key={d.id} d={d} onDone={onDone} />
      ))}
      {adding && (
        <form className="crm-panel crm-deal-form" onSubmit={create}>
          {!offers.length ? (
            <p className="crm-note">No prices are set up.</p>
          ) : (
            <>
              <div className="crm-offers" role="radiogroup" aria-label="What you are quoting">
                {offers.map((o) => (
                  <button type="button" role="radio" aria-checked={offerId === o.id} key={o.id} className={`crm-offer${offerId === o.id ? ' is-on' : ''}`} onClick={() => pick(o.id)}>
                    <strong>{o.name}</strong>
                    <span>
                      {money(o.oneTimeCents)}
                      {o.monthlyCents ? `, then ${money(o.monthlyCents)} a month` : ''}
                    </span>
                  </button>
                ))}
              </div>
              <div className="crm-form">
                <label className="crm-field">
                  <span>Price, one time ($)</span>
                  <input inputMode="decimal" value={quoted} onChange={(e) => setQuoted(e.target.value.replace(/[^0-9.]/g, ''))} />
                </label>
                <label className="crm-field">
                  <span>Monthly ($)</span>
                  <input inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value.replace(/[^0-9.]/g, ''))} />
                </label>
              </div>
              <div className="crm-row-btns">
                <button type="submit" className="crm-btn is-dark" disabled={busy || !offerId}>
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
  const { busy, error, run } = useAction(() => {
    setMode(null)
    onDone()
  })

  const win = (e: FormEvent) => {
    e.preventDefault()
    void run(() => api(`/api/crm/deals/${d.id}/won`, { method: 'POST', body: { soldCents: toCents(sold), closedBy: closer || null, recurring } }))
  }
  const lose = (e: FormEvent) => {
    e.preventDefault()
    void run(() => api(`/api/crm/deals/${d.id}/lost`, { method: 'POST', body: { reason } }))
  }
  return (
    <div className={`crm-panel crm-deal is-${d.status}`}>
      <div className="crm-deal-head">
        <strong>{d.offerName}</strong>
        <span className={`crm-deal-status is-${d.status}`}>{d.status === 'open' ? 'Quoted' : d.status === 'won' ? 'Sold' : 'Lost'}</span>
      </div>
      <div className="crm-deal-money">
        {d.status === 'won' ? (
          <>
            Sold for <strong>{money(d.soldCents)}</strong>
            {d.soldCents !== d.quotedCents && <span className="crm-quiet"> (quoted {money(d.quotedCents)})</span>}
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
            {d.status === 'won' && <span className={d.recurringActive ? 'crm-good' : 'crm-quiet'}>{d.recurringActive ? ' active' : ' stopped'}</span>}
          </>
        )}
      </div>
      <div className="crm-quiet">
        {d.status === 'won' && `Sold ${dayLabel(d.wonAt)}${d.closedBy ? ` by ${d.closedBy.name}` : ''}`}
        {d.status === 'lost' && `Lost ${dayLabel(d.lostAt)}: ${d.lossReason ?? ''}`}
        {d.status === 'open' && `Quoted ${dayLabel(d.createdAt)}`}
      </div>
      {d.status === 'open' && !mode && (
        <div className="crm-row-btns">
          <button type="button" className="crm-btn is-good" onClick={() => setMode('won')}>
            <Icon name="check" size={16} stroke={2.4} />
            Mark as sold
          </button>
          <button type="button" className="crm-btn" onClick={() => setMode('lost')}>
            They said no
          </button>
        </div>
      )}
      {d.status === 'open' && mode === 'won' && (
        <form className="crm-inline-form" onSubmit={win}>
          <div className="crm-form">
            <label className="crm-field">
              <span>Sold for ($)</span>
              <input inputMode="decimal" value={sold} onChange={(e) => setSold(e.target.value.replace(/[^0-9.]/g, ''))} />
            </label>
            <label className="crm-field">
              <span>Who made the sale</span>
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
              {money(d.monthlyCents)} a month starts now
            </label>
          )}
          <div className="crm-row-btns">
            <button type="submit" className="crm-btn is-good" disabled={busy}>
              {busy ? 'Saving…' : 'Confirm the sale'}
            </button>
            <button type="button" className="crm-link" onClick={() => setMode(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {d.status === 'open' && mode === 'lost' && (
        <form className="crm-inline-form" onSubmit={lose}>
          <label className="crm-field is-wide">
            <span>Why not?</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} required minLength={2} />
          </label>
          <div className="crm-row-btns">
            <button type="submit" className="crm-btn" disabled={busy || reason.trim().length < 2}>
              {busy ? 'Saving…' : 'Mark as lost'}
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
            if (d.recurringActive && !window.confirm(`Stop the ${money(d.monthlyCents)} a month? Monthly plans drop by that much.`)) return
            void run(() => api(`/api/crm/deals/${d.id}/recurring`, { method: 'POST', body: { active: !d.recurringActive } }))
          }}
        >
          {d.recurringActive ? 'Stop the monthly plan' : 'Restart the monthly plan'}
        </button>
      )}
      <Err error={error} />
    </div>
  )
}

/* ------------------------------------------------------------------ people */

function PeopleCard({ detail, onDone }: { detail: Detail; onDone: () => void }) {
  const { meta, actor } = useCrm()
  const { lead, deals } = detail
  const { busy, error, run } = useAction(onDone)
  const [owner, setOwner] = useState<string | null>(null)
  const team = meta.people.filter((p) => (p.active && p.isTeam) || p.id === lead.assignee?.id || p.id === lead.closedBy?.id)
  const patch = (body: Record<string, unknown>) => void run(() => api(`/api/crm/leads/${lead.id}`, { method: 'PATCH', body }))
  const showCloser = isCustomer(lead.stage) || !!lead.closedBy || deals.some((d) => d.status === 'won')
  return (
    <Section title="People" className="crm-people-card">
      <div className="crm-group">
        <div className="crm-prop crm-prop-owner">
          <span className="crm-prop-k">Owner</span>
          {owner === null ? (
            lead.contactName ? (
              <span className="crm-prop-v">
                {lead.contactName}
                <button type="button" className="crm-link" onClick={() => setOwner(lead.contactName ?? '')}>
                  Change
                </button>
              </span>
            ) : (
              <button type="button" className="crm-link crm-prop-v" onClick={() => setOwner('')}>
                Add the owner's name
              </button>
            )
          ) : (
            <form
              className="crm-prop-edit"
              onSubmit={(e) => {
                e.preventDefault()
                void run(() => api(`/api/crm/leads/${lead.id}`, { method: 'PATCH', body: { contactName: owner.trim() || null } })).then((ok) => ok && setOwner(null))
              }}
            >
              <input value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Owner's name" placeholder="Who runs the business" autoFocus />
              <button type="submit" className="crm-btn is-dark" disabled={busy}>
                Save
              </button>
            </form>
          )}
        </div>
        <SentBy detail={detail} onDone={onDone} canChange={!(lead.referrer || lead.sourceType) || lead.referralDefault || actor.role === 'admin'} />
        <label className="crm-prop">
          <span className="crm-prop-k">Handled by</span>
          <select value={lead.assignee?.id ?? ''} disabled={busy} onChange={(e) => patch({ assignedTo: e.target.value || null })} aria-label="Handled by">
            {!lead.assignee && <option value="">Nobody</option>}
            {team.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {showCloser && (
          <label className="crm-prop">
            <span className="crm-prop-k">Made the sale</span>
            <select value={lead.closedBy?.id ?? ''} disabled={busy} onChange={(e) => patch({ closedBy: e.target.value || null })} aria-label="Sale closed by">
              <option value="">Nobody yet</option>
              {team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <Err error={error} />
    </Section>
  )
}

function SentBy({ detail, onDone, canChange }: { detail: Detail; onDone: () => void; canChange: boolean }) {
  const { meta } = useCrm()
  const { lead } = detail
  /* A Glenn default is a placeholder: anyone can set the real sender once. */
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
  return (
    <div className="crm-prop crm-sent-by">
      <span className="crm-prop-k">Sent by</span>
      {!editing ? (
        <span className="crm-prop-v">
          {lead.referrer ? (
            <a className="crm-person-link" href={`#/referrer/${lead.referrer.id}`}>
              <PersonChip id={lead.referrer.id} name={lead.referrer.name} />
            </a>
          ) : (
            <span>{lead.sourceLabel ?? 'Nobody recorded'}</span>
          )}
          {lead.referralDefault && <span className="crm-default">BEASTY's own list</span>}
          {canChange && (
            <button type="button" className="crm-link" onClick={() => setEditing(true)}>
              {locked ? 'Change' : 'Set'}
            </button>
          )}
        </span>
      ) : (
        <form className="crm-sent-form" onSubmit={save}>
          <div className="crm-form">
            <label className="crm-field">
              <span>Sent by</span>
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
              <span>How they came in</span>
              <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
                <option value="">{referrerId ? 'Same as the sender' : 'Pick one'}</option>
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
              <span>How they know them</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            {locked && (
              <label className="crm-field is-wide">
                <span>Why is this changing? (kept in the story)</span>
                <input value={reason} onChange={(e) => setReason(e.target.value)} required minLength={3} />
              </label>
            )}
          </div>
          <div className="crm-row-btns">
            <button type="submit" className="crm-btn is-dark" disabled={busy || (!referrerId && !sourceType) || (locked && reason.trim().length < 3)}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="crm-link" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
          <Err error={error} />
        </form>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- details */

function Details({ detail, onDone }: { detail: Detail; onDone: () => void }) {
  const { meta } = useCrm()
  const { lead } = detail
  const [f, setF] = useState({
    preferredChannel: lead.preferredChannel ?? '',
    priority: lead.priority,
    potential: dollars(lead.potentialCents),
    opportunityType: lead.opportunityType,
  })
  const { busy, error, run } = useAction(onDone)
  const dirty =
    f.preferredChannel !== (lead.preferredChannel ?? '') || f.priority !== lead.priority || f.potential !== dollars(lead.potentialCents) || f.opportunityType !== lead.opportunityType
  const save = (e: FormEvent) => {
    e.preventDefault()
    void run(() =>
      api(`/api/crm/leads/${lead.id}`, {
        method: 'PATCH',
        body: { preferredChannel: f.preferredChannel || null, priority: f.priority, potentialCents: toCents(f.potential) ?? 0, opportunityType: f.opportunityType },
      }),
    )
  }
  return (
    <Section title="Details">
      <form onSubmit={save}>
        <div className="crm-group">
          <label className="crm-prop">
            <span className="crm-prop-k">Likes to hear by</span>
            <select value={f.preferredChannel} onChange={(e) => setF({ ...f, preferredChannel: e.target.value })}>
              <option value="">No preference</option>
              <option value="phone">Phone call</option>
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
          <label className="crm-prop">
            <span className="crm-prop-k">Selling</span>
            <select value={f.opportunityType} onChange={(e) => setF({ ...f, opportunityType: e.target.value })}>
              {meta.opportunityTypes.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-prop">
            <span className="crm-prop-k">Quote size ($)</span>
            <input inputMode="decimal" value={f.potential} onChange={(e) => setF({ ...f, potential: e.target.value.replace(/[^0-9.]/g, '') })} />
          </label>
          <label className="crm-prop">
            <span className="crm-prop-k">How urgent</span>
            <select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        {dirty && (
          <button type="submit" className="crm-btn is-dark is-block" disabled={busy}>
            {busy ? 'Saving…' : 'Save details'}
          </button>
        )}
        <p className="crm-note is-quiet">
          Added {dayLabel(lead.createdAt)} {lead.createdBy === 'Import' ? "from BEASTY's listings" : `by ${lead.createdBy}`}. {lead.firstContactedAt ? `First reached ${dayLabel(lead.firstContactedAt)}.` : 'Not reached yet.'}
          {lead.wonAt ? ` Said yes ${dayLabel(lead.wonAt)}.` : ''}
        </p>
        <Err error={error} />
      </form>
    </Section>
  )
}

/* ---------------------------------------------------------------- on beasty */

function OnBeasty({ detail }: { detail: Detail }) {
  const { business: b, application: a, family, lead } = detail
  const rows: [string, ReactNode][] = []
  if (b) {
    if (b.tagline) rows.push(['About', b.tagline])
    rows.push([
      'Their website',
      <>
        {b.site ? (
          <a href={b.site} target="_blank" rel="noreferrer">
            {b.site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
          </a>
        ) : (
          'None'
        )}
        <span className="crm-quiet crm-block">{websiteStatusLabel(b.websiteStatus)}</span>
      </>,
    ])
    if (b.address)
      rows.push([
        'Address',
        <a href={`https://maps.apple.com/?q=${encodeURIComponent(`${b.name} ${b.address}`)}`} target="_blank" rel="noreferrer">
          {b.address}
        </a>,
      ])
    if (b.hours) rows.push(['Hours', b.hours])
    if (b.seats.length) rows.push(['Listed on', b.seats.map((s) => `${s.city} ${s.page}, spot ${s.spot}${s.category ? ` (${s.category})` : ''}`).join('; ')])
  }
  return (
    <Section title="On BEASTY">
      <div className="crm-panel crm-onbeasty">
        {b ? (
          <>
            <a className="crm-btn is-block" href={b.pageUrl} target="_blank" rel="noreferrer">
              Open their BEASTY page
              <Icon name="arrowUpRight" size={16} />
            </a>
            {(b.freeListing || b.isIndividual) && <p className="crm-quiet">{[b.freeListing ? 'Free listing' : null, b.isIndividual ? 'BEASTY Individual' : null].filter(Boolean).join('. ')}</p>}
            <dl className="crm-dl">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {b.notes.length > 0 && (
              <details className="crm-more">
                <summary>Research notes ({b.notes.length})</summary>
                <ul className="crm-plain">
                  {b.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </details>
            )}
          </>
        ) : (
          <p className="crm-note">Not on BEASTY yet.</p>
        )}
        {a && (
          <div className="crm-application">
            <h3>They asked for a spot</h3>
            <dl className="crm-dl">
              <div>
                <dt>Sent</dt>
                <dd>{dateTime(a.created_at)}</dd>
              </div>
              {/* One box for both on a request sent before the form's revision. */}
              {!a.phone && !a.email && (
                <div>
                  <dt>Contact</dt>
                  <dd>{a.contact}</dd>
                </div>
              )}
              {a.phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>{a.phone}</dd>
                </div>
              )}
              {a.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{a.email}</dd>
                </div>
              )}
              {a.hours && (
                <div>
                  <dt>Hours</dt>
                  <dd>{a.hours}</dd>
                </div>
              )}
              {a.address && (
                <div>
                  <dt>Address</dt>
                  <dd>{a.address}</dd>
                </div>
              )}
              {a.cuisine && (
                <div>
                  <dt>Kind</dt>
                  <dd>{a.cuisine}</dd>
                </div>
              )}
              {a.city && (
                <div>
                  <dt>City</dt>
                  <dd>{a.city}</dd>
                </div>
              )}
              {a.social && (
                <div>
                  <dt>Instagram</dt>
                  <dd>{a.social}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
        {family.length > 0 && (
          <div className="crm-family">
            <h3>Other locations of {lead.name}</h3>
            <ul className="crm-plain">
              {family.map((x) => (
                <li key={x.id}>
                  <a href={`#/lead/${x.id}`}>
                    {x.business_name}
                    {x.city ? `, ${x.city}` : ''}
                  </a>{' '}
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

/* ------------------------------------------------------------------ story */

const QUIET = ['STAGE_CHANGE', 'FOLLOW_UP', 'REFERRAL', 'ASSIGNMENT', 'SYSTEM', 'DEAL_WON', 'DEAL_LOST']

function describe(a: Detail['activities'][number]): ReactNode {
  const d = a.data ?? {}
  switch (a.type) {
    case 'STAGE_CHANGE':
      return (
        <>
          Step: <strong>{stageName(String(d.to ?? ''))}</strong>
          {a.body ? `: ${a.body}` : ''}
        </>
      )
    case 'FOLLOW_UP':
      return d.completed ? (
        <>Reminder done{a.body ? `: ${a.body}` : ''}</>
      ) : (
        <>
          Reminder set for {whenLabel(Number(d.dueAt))}
          {d.owner ? `, for ${String(d.owner)}` : ''}
          {a.body ? `: ${a.body}` : ''}
        </>
      )
    case 'DEAL_WON':
      return (
        <>
          {a.body} for <strong>{money(Number(d.soldCents))}</strong>
          {Number(d.monthlyCents) ? `, then ${money(Number(d.monthlyCents))} a month` : ''}
        </>
      )
    case 'REFERRAL':
      return (
        <>
          {a.body}
          {d.campaign ? ` (campaign ${String(d.campaign)})` : ''}
          {d.replacedDefault ? ' Replaced Glenn, who was only the default.' : ''}
          {d.override ? ` Changed from the first credit: ${String(d.reason ?? '')}` : ''}
        </>
      )
    case 'SYSTEM': {
      /* The import's own note names the website status by its key; say it in words. */
      const m = /^Imported from the BEASTY listing \(website status: ([a-z_]+)\)$/.exec(a.body ?? '')
      return m ? `Added from their BEASTY listing. Their website: ${websiteStatusLabel(m[1]).toLowerCase()}.` : a.body ?? ''
    }
    default:
      return a.body ?? ''
  }
}

function Story({ detail }: { detail: Detail }) {
  const [all, setAll] = useState(false)
  const items = all ? detail.activities : detail.activities.slice(0, 15)
  const stays = detail.history.map((h, i) => ({ ...h, until: detail.history[i + 1]?.changed_at ?? null }))
  return (
    <Section title="The story so far" className="crm-story">
      <ol className="crm-timeline">
        {items.map((a) => {
          const quiet = QUIET.includes(a.type)
          return (
            <li key={a.id} className={`crm-tl${quiet ? ' is-system' : ''} crm-tl-${a.type.toLowerCase()}`}>
              {!quiet && <span className="crm-tl-type">{KIND_WORD[a.type] ?? a.type}</span>}
              <div className="crm-tl-body">{describe(a)}</div>
              <div className="crm-tl-meta">
                {a.actor}, <time dateTime={new Date(a.occurredAt).toISOString()} title={dateTime(a.occurredAt)}>{ago(a.occurredAt)}</time>
              </div>
            </li>
          )
        })}
      </ol>
      {detail.activities.length > 15 && !all && (
        <button type="button" className="crm-link" onClick={() => setAll(true)}>
          Show all {detail.activities.length}
        </button>
      )}
      <details className="crm-more crm-lead-history">
        <summary>Every move ({stays.length})</summary>
        <table>
          <tbody>
            {stays.map((h) => (
              <tr key={h.id}>
                <td>{h.from_stage ? `${stageName(h.from_stage)} → ${stageName(h.to_stage)}` : `Started at ${stageName(h.to_stage)}`}</td>
                <td>{dateTime(h.changed_at)}</td>
                <td>{h.changedBy}</td>
                <td>{durationLabel((h.until ?? Date.now()) - h.changed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Section>
  )
}

