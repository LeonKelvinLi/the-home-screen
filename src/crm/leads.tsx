/*
  Every business being worked, as a list you can search and narrow by step.
  Every filter lives in the URL, so a filtered list is a link someone can
  send, and the back button undoes a filter. On a wide screen the list sits
  beside the open business (CrmScreen's split); `selected` marks it.
*/
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, api } from './api'
import type { LeadSummary } from './api'
import { Failure, Loading, PageTitle, Tile, money, useApi, useCrm } from './ui'
import { Icon } from './icons'
import { opportunityLabel } from './model'
import { NextShort, Pager } from './views'
import { STEP_FILTERS, placeLine, stageName } from './steps'

const PAGE = 50

const ATTENTION: [string, string][] = [
  ['overdue', 'A reminder is late'],
  ['uncontacted_referrals', 'Sent by someone, never reached'],
  ['interested_no_next', 'Interested, no reminder'],
  ['stale_proposals', 'Quote sent, no word for days'],
  ['missing_contact', 'No phone, email or Instagram'],
  ['no_next_action', 'No reminder at all'],
]

export function Leads({ params, selected }: { params: URLSearchParams; selected?: string | null }) {
  const { meta, go } = useCrm()
  const pane = selected !== undefined
  const [q, setQ] = useState(params.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(false)
  const [creating, setCreating] = useState(params.get('new') === '1')
  const page = Number(params.get('page') ?? 0) || 0
  const step = STEP_FILTERS.find((s) => s.key === params.get('step'))

  /* Changing a filter rewrites the hash, which remounts this view with the new params. */
  const set = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    next.delete('new')
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (!('page' in changes)) next.delete('page')
    const s = next.toString()
    go(`leads${s ? `?${s}` : ''}`)
  }

  const apiPath = useMemo(() => {
    const p = new URLSearchParams(params)
    p.delete('page')
    p.delete('new')
    p.delete('step')
    if (step) p.set('stage', step.stages.join(','))
    p.set('limit', String(PAGE))
    p.set('offset', String(page * PAGE))
    return `/api/crm/leads?${p.toString()}`
  }, [params, page, step])
  const { data, error, reload } = useApi<{ total: number; leads: LeadSummary[] }>(apiPath)
  const pipe = useApi<{ stages: { stage: string; count: number }[] }>('/api/crm/pipeline')
  const count = (stages: string[]) => pipe.data?.stages.filter((s) => stages.includes(s.stage)).reduce((n, s) => n + s.count, 0)
  const all = pipe.data?.stages.reduce((n, s) => n + s.count, 0)

  const active = [...params.entries()].filter(([k]) => !['page', 'sort', 'q', 'new', 'step'].includes(k))
  const label = (k: string, v: string) => {
    switch (k) {
      case 'stage':
        return v.split(',').map(stageName).join(' or ')
      case 'referrer':
        return `Sent by ${v === 'none' ? 'nobody' : meta.people.find((p) => p.id === v)?.name ?? v}`
      case 'assigned':
        return `Handled by ${v === 'none' ? 'nobody' : meta.people.find((p) => p.id === v)?.name ?? v}`
      case 'websiteStatus':
        return v
          .split(',')
          .map((s) => meta.websiteStatuses.find((x) => x.key === s)?.label ?? s)
          .join(' or ')
      case 'type':
        return `Selling ${opportunityLabel(v).toLowerCase()}`
      case 'source':
        return meta.sources.find((s) => s.key === v)?.label ?? v
      case 'since':
        return `Added since ${new Date(Number(v)).toLocaleDateString()}`
      case 'family':
        return `All locations of ${v.replace(/-/g, ' ')}`
      case 'hasPhone':
        return v === '1' ? 'Has a phone' : 'No phone'
      case 'hasEmail':
        return v === '1' ? 'Has an email' : 'No email'
      case 'hasInstagram':
        return v === '1' ? 'On Instagram' : 'Not on Instagram'
      case 'uncontacted':
        return 'Never reached'
      case 'overdue':
        return 'Reminder late'
      case 'attention':
        return ATTENTION.find(([a]) => a === v)?.[1] ?? v
      case 'imported':
        return v === '1' ? 'From BEASTY listings' : 'Added by hand'
      default:
        return v
    }
  }

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    set({ q: q.trim() || null })
  }

  return (
    <div className={`crm-view crm-list-view${pane ? ' is-pane' : ''}`}>
      <PageTitle
        title="Businesses"
        count={data?.total ?? null}
        sub={pane ? undefined : 'Every business BEASTY is working with, and what happens next with each.'}
      />
      {creating && <NewLead onClose={() => setCreating(false)} />}

      <form className="crm-find-bar" onSubmit={submitSearch}>
        <label className="crm-find">
          <Icon name="search" size={17} stroke={2} />
          <input type="search" placeholder="Name, phone, @instagram or city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search businesses" />
        </label>
        <button type="button" className={`crm-btn${showFilters || active.length ? ' is-on' : ''}`} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} aria-label="More filters">
          <Icon name="filter" size={16} />
          {active.length ? active.length : ''}
        </button>
      </form>

      <div className="crm-chips" role="group" aria-label="Step">
        <button type="button" className={!step && !params.get('stage') ? 'is-on' : undefined} onClick={() => set({ step: null, stage: null })}>
          All{all != null ? <em>{all}</em> : null}
        </button>
        {STEP_FILTERS.map((s) => {
          const n = count(s.stages)
          return (
            <button type="button" key={s.key} className={step?.key === s.key ? 'is-on' : undefined} onClick={() => set({ step: s.key, stage: null })}>
              {s.label}
              {n != null ? <em>{n}</em> : null}
            </button>
          )
        })}
      </div>

      <div className="crm-list-tools">
        <label className="crm-sort">
          <span>Sort by</span>
          <select value={params.get('sort') ?? 'next'} onChange={(e) => set({ sort: e.target.value === 'next' ? null : e.target.value })}>
            <option value="next">Next reminder</option>
            <option value="updated">Recently changed</option>
            <option value="created">Newest</option>
            <option value="stage">How far along</option>
            <option value="value">Quote size</option>
            <option value="name">Name</option>
          </select>
        </label>
        <a href="#/pipeline" className="crm-link">
          <Icon name="kanban" size={16} />
          Board
        </a>
      </div>

      {showFilters && <FilterPanel params={params} set={set} />}

      {active.length > 0 && (
        <div className="crm-active">
          {active.map(([k, v]) => (
            <button type="button" key={k} className="crm-active-chip" onClick={() => set({ [k]: null })} aria-label={`Remove filter ${label(k, v)}`}>
              {label(k, v)}
              <Icon name="x" size={13} stroke={2.2} />
            </button>
          ))}
          <button type="button" className="crm-link" onClick={() => go(params.get('q') ? `leads?q=${encodeURIComponent(params.get('q') ?? '')}` : 'leads')}>
            Clear
          </button>
        </div>
      )}

      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : data.leads.length === 0 ? (
        <div className="crm-empty">
          <Icon name="search" size={20} />
          <span>No businesses match. {active.length || params.get('q') || step ? 'Try removing a filter.' : ''}</span>
        </div>
      ) : (
        <>
          <ul className="crm-group crm-leads">
            {data.leads.map((l) => {
              const late = !!l.nextFollowupAt && l.nextFollowupAt < Date.now()
              const sentBy = l.referrer && !l.referralDefault ? l.referrer.name : null
              return (
                <li key={l.id} className={selected === l.id ? 'is-selected' : undefined}>
                  <a className="crm-row" href={`#/lead/${l.id}`} aria-current={selected === l.id ? 'true' : undefined}>
                    <Tile name={l.name} icon={l.icon} stage={l.stage} size={50} badge={late ? 1 : null} />
                    <span className="crm-row-text">
                      <strong>{l.name}</strong>
                      <span>{placeLine(l.category, l.city)}</span>
                      <span className="crm-row-meta">
                        <NextShort l={l} />
                        {sentBy && <span className="crm-sent">Sent by {sentBy}</span>}
                      </span>
                    </span>
                    {!pane && l.potentialCents > 0 && <span className="crm-row-end">{money(l.potentialCents)}</span>}
                  </a>
                </li>
              )
            })}
          </ul>
          <Pager total={data.total} page={page} size={PAGE} onPage={(p) => set({ page: p ? String(p) : null })} />
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ filter panel */

function FilterPanel({ params, set }: { params: URLSearchParams; set: (c: Record<string, string | null>) => void }) {
  const { meta } = useCrm()
  const sel = (name: string, title: string, options: [string, string][], all = 'Any') => (
    <label className="crm-field">
      <span>{title}</span>
      <select value={params.get(name) ?? ''} onChange={(e) => set({ [name]: e.target.value || null })}>
        <option value="">{all}</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
  const people = meta.people.filter((p) => p.active).map((p) => [p.id, p.name] as [string, string])
  const team = meta.people.filter((p) => p.active && p.isTeam).map((p) => [p.id, p.name] as [string, string])
  return (
    <div className="crm-panel crm-filters">
      {sel('attention', 'Needs attention', ATTENTION)}
      {sel('stage', 'Where they are', meta.stages.map((s) => [s.key, stageName(s.key)]))}
      {sel('websiteStatus', 'Their website now', meta.websiteStatuses.map((w) => [w.key, w.label]))}
      {sel('city', 'City', meta.cities.map((c) => [c.value, `${c.value} (${c.count})`]))}
      {sel('category', 'Kind of business', meta.categories.map((c) => [c.value, `${c.value} (${c.count})`]))}
      {sel('referrer', 'Sent by', [['none', 'Nobody'], ...people])}
      {sel('assigned', 'Handled by', [['none', 'Nobody'], ...team])}
      {sel('type', 'Selling', meta.opportunityTypes.map((o) => [o.key, o.label]))}
      {sel('source', 'How they came in', meta.sources.map((s) => [s.key, s.label]))}
      {sel('hasPhone', 'Phone', [['1', 'Has a phone'], ['0', 'No phone']])}
      {sel('hasInstagram', 'Instagram', [['1', 'On Instagram'], ['0', 'Not on Instagram']])}
      {sel('hasEmail', 'Email', [['1', 'Has an email'], ['0', 'No email']])}
      <label className="crm-field">
        <span>Added since</span>
        <input
          type="date"
          value={params.get('since') ? new Date(Number(params.get('since'))).toISOString().slice(0, 10) : ''}
          onChange={(e) => set({ since: e.target.value ? String(new Date(`${e.target.value}T00:00:00`).getTime()) : null })}
        />
      </label>
      <label className="crm-check">
        <input type="checkbox" checked={params.get('uncontacted') === '1'} onChange={(e) => set({ uncontacted: e.target.checked ? '1' : null })} />
        Never reached
      </label>
      <a className="crm-link" href="#/businesses">
        <Icon name="building" size={16} />
        See every location grouped
      </a>
    </div>
  )
}

/* ---------------------------------------------------------- add a business */

type NewLeadField =
  | 'businessName'
  | 'city'
  | 'category'
  | 'phone'
  | 'email'
  | 'instagram'
  | 'contactName'
  | 'opportunityType'
  | 'referrerId'
  | 'sourceType'
  | 'campaign'
  | 'referralNote'
  | 'assignedTo'
  | 'note'

interface Candidates {
  listed: { brandId: string; name: string; city: string }[]
  leads: { id: string; name: string; city: string | null }[]
}

export function NewLead({ onClose, initial = {} }: { onClose: () => void; initial?: Partial<Record<NewLeadField, string>> }) {
  const { meta, go } = useCrm()
  const [f, setF] = useState<Record<NewLeadField, string>>({
    businessName: '',
    city: '',
    category: '',
    phone: '',
    email: '',
    instagram: '',
    contactName: '',
    opportunityType: 'website',
    referrerId: '',
    sourceType: '',
    campaign: '',
    referralNote: '',
    assignedTo: '',
    note: '',
    ...initial,
  })
  const [more, setMore] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<Candidates | null>(null)
  const up = (k: NewLeadField) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  const create = async (body: Record<string, unknown>) => {
    setBusy(true)
    setError(null)
    try {
      const r = await api<{ id: string }>('/api/crm/leads', { method: 'POST', body })
      onClose()
      go(`lead/${r.id}`)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.body.candidates) {
        setCandidates(e.body.candidates as Candidates)
        setError(e.message)
      } else setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const payload = (extra: Record<string, unknown> = {}) => {
    const body: Record<string, unknown> = { ...extra }
    for (const [k, v] of Object.entries(f)) if (v.trim()) body[k] = v.trim()
    if (f.referrerId && !f.sourceType) {
      body.sourceType = meta.people.find((p) => p.id === f.referrerId)?.sourceType
    }
    return body
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (f.businessName.trim().length < 2) return setError('Give the business a name.')
    void create(payload())
  }

  return (
    <div className="crm-overlay is-sheet" role="dialog" aria-modal="true" aria-label="Add a business" onClick={onClose}>
      <form className="crm-sheet" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="crm-sheet-head">
          <button type="button" className="crm-link" onClick={onClose}>
            Cancel
          </button>
          <h2>Add a business</h2>
          <button type="submit" className="crm-link is-strong" disabled={busy}>
            {busy ? 'Adding…' : 'Add'}
          </button>
        </div>
        <p className="crm-note">Already on BEASTY? Search for it first: every listed business without a real website is already here.</p>
        <div className="crm-form">
          <label className="crm-field is-wide">
            <span>Business name</span>
            <input value={f.businessName} onChange={up('businessName')} required autoFocus />
          </label>
          <label className="crm-field">
            <span>City</span>
            <input value={f.city} onChange={up('city')} list="crm-cities" />
            <datalist id="crm-cities">
              {meta.cities.map((c) => (
                <option key={c.value} value={c.value} />
              ))}
            </datalist>
          </label>
          <label className="crm-field">
            <span>Kind of business</span>
            <input value={f.category} onChange={up('category')} list="crm-categories" placeholder="e.g. Tacos" />
            <datalist id="crm-categories">
              {meta.categories.map((c) => (
                <option key={c.value} value={c.value} />
              ))}
            </datalist>
          </label>
          <label className="crm-field">
            <span>Phone</span>
            <input type="tel" value={f.phone} onChange={up('phone')} />
          </label>
          <label className="crm-field">
            <span>Instagram</span>
            <input value={f.instagram} onChange={up('instagram')} placeholder="@handle" />
          </label>
          <label className="crm-field">
            <span>Email</span>
            <input type="email" value={f.email} onChange={up('email')} />
          </label>
          <label className="crm-field">
            <span>Owner's name</span>
            <input value={f.contactName} onChange={up('contactName')} placeholder="Who runs it" />
          </label>
          <label className="crm-field">
            <span>Sent by</span>
            <select value={f.referrerId} onChange={up('referrerId')}>
              <option value="">Glenn (BEASTY's own list)</option>
              {meta.people
                .filter((p) => p.active && p.id !== 'p_glenn')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field">
            <span>Handled by</span>
            <select value={f.assignedTo} onChange={up('assignedTo')}>
              <option value="">Glenn</option>
              {meta.people
                .filter((p) => p.active && p.isTeam && p.id !== 'p_glenn')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field is-wide">
            <span>First note</span>
            <textarea value={f.note} onChange={up('note')} rows={3} placeholder="How you found them, what they need" />
          </label>
          {!more ? (
            <button type="button" className="crm-link is-wide" onClick={() => setMore(true)}>
              More: what you are selling, how they came in, a campaign
            </button>
          ) : (
            <>
              <label className="crm-field">
                <span>Selling</span>
                <select value={f.opportunityType} onChange={up('opportunityType')}>
                  {meta.opportunityTypes.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span>How they came in</span>
                <select value={f.sourceType} onChange={up('sourceType')}>
                  <option value="">{f.referrerId ? 'Same as the sender' : 'Not set'}</option>
                  {meta.sources.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span>Campaign</span>
                <input value={f.campaign} onChange={up('campaign')} />
              </label>
              <label className="crm-field">
                <span>How the sender knows them</span>
                <input value={f.referralNote} onChange={up('referralNote')} />
              </label>
            </>
          )}
        </div>
        {error && <div className="crm-error">{error}</div>}
        {candidates && (
          <div className="crm-candidates">
            {candidates.leads.length > 0 && (
              <>
                <h3>Already here</h3>
                {candidates.leads.map((c) => (
                  <button type="button" key={c.id} className="crm-choice" onClick={() => { onClose(); go(`lead/${c.id}`) }}>
                    Open {c.name}
                    {c.city ? `, ${c.city}` : ''}
                    <Icon name="chevronRight" size={16} />
                  </button>
                ))}
              </>
            )}
            {candidates.listed.length > 0 && (
              <>
                <h3>Listed on BEASTY</h3>
                {candidates.listed.map((c) => (
                  <button type="button" key={c.brandId} className="crm-choice" disabled={busy} onClick={() => void create(payload({ brandId: c.brandId, force: true }))}>
                    Add {c.name}, {c.city}, from its listing
                    <Icon name="chevronRight" size={16} />
                  </button>
                ))}
              </>
            )}
            <button type="button" className="crm-btn" disabled={busy} onClick={() => void create(payload({ force: true }))}>
              It is a different business: add it anyway
            </button>
          </div>
        )}
        <button type="submit" className="crm-btn is-primary is-big" disabled={busy}>
          {busy ? 'Adding…' : 'Add the business'}
        </button>
      </form>
    </div>
  )
}
