/*
  The leads table: every filter lives in the URL, so a filtered list is a link
  someone can send, and the back button undoes a filter. On a phone each row
  folds into a card with its call / text / Instagram buttons still one tap away.
*/
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, api } from './api'
import type { LeadSummary } from './api'
import { ContactActions, Failure, Loading, StagePill, WebsitePill, ago, money, useApi, useCrm } from './ui'
import { opportunityLabel } from './model'
import { Pager } from './views'

const PAGE = 50

const QUICK = [
  ['', 'All'],
  ['uncontacted_referrals', 'Uncontacted referrals'],
  ['overdue', 'Overdue'],
  ['interested_no_next', 'Interested, no next step'],
  ['stale_proposals', 'Stale proposals'],
  ['missing_contact', 'Missing contact info'],
  ['no_next_action', 'No next action'],
] as const

const ATTENTION_LABEL: Record<string, string> = Object.fromEntries(QUICK)

export function Leads({ params }: { params: URLSearchParams }) {
  const { meta, go } = useCrm()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(false)
  const [creating, setCreating] = useState(false)
  const page = Number(params.get('page') ?? 0) || 0

  /* Changing a filter rewrites the hash, which remounts this view with the new params. */
  const set = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
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
    p.set('limit', String(PAGE))
    p.set('offset', String(page * PAGE))
    return `/api/crm/leads?${p.toString()}`
  }, [params, page])
  const { data, error, reload } = useApi<{ total: number; leads: LeadSummary[] }>(apiPath)

  const active = [...params.entries()].filter(([k]) => !['page', 'sort', 'q'].includes(k))
  const label = (k: string, v: string) => {
    switch (k) {
      case 'stage':
        return v
          .split(',')
          .map((s) => meta.stages.find((x) => x.key === s)?.label ?? s)
          .join(' or ')
      case 'referrer':
      case 'assigned':
        return `${k === 'referrer' ? 'Referred by' : 'Assigned to'} ${v === 'none' ? 'nobody' : meta.people.find((p) => p.id === v)?.name ?? v}`
      case 'websiteStatus':
        return v
          .split(',')
          .map((s) => meta.websiteStatuses.find((x) => x.key === s)?.label ?? s)
          .join(' or ')
      case 'type':
        return opportunityLabel(v)
      case 'source':
        return meta.sources.find((s) => s.key === v)?.label ?? v
      case 'attention':
        return ATTENTION_LABEL[v] ?? v
      case 'since':
        return `Since ${new Date(Number(v)).toLocaleDateString()}`
      case 'family':
        return `Business: ${v}`
      case 'hasPhone':
        return v === '1' ? 'Has phone' : 'No phone'
      case 'hasEmail':
        return v === '1' ? 'Has email' : 'No email'
      case 'hasInstagram':
        return v === '1' ? 'Has Instagram' : 'No Instagram'
      case 'uncontacted':
        return 'Never contacted'
      case 'overdue':
        return 'Overdue'
      case 'imported':
        return v === '1' ? 'Imported from listings' : 'Not imported'
      default:
        return `${k}: ${v}`
    }
  }

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    set({ q: q.trim() || null })
  }

  return (
    <div className="crm-view">
      <div className="crm-view-head">
        <h1 className="crm-h1">Leads</h1>
        <button type="button" className="crm-btn crm-btn-primary" onClick={() => setCreating(true)}>
          New lead
        </button>
      </div>
      {creating && <NewLead onClose={() => setCreating(false)} />}

      <form className="crm-leads-search" onSubmit={submitSearch}>
        <input
          className="crm-input"
          type="search"
          placeholder="Name, phone, email, @handle, city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search leads"
        />
        <button type="button" className={`crm-btn${showFilters ? ' is-on' : ''}`} onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
          Filters{active.length ? ` (${active.length})` : ''}
        </button>
      </form>

      <div className="crm-chips" role="group" aria-label="Quick filters">
        {QUICK.map(([k, text]) => (
          <button
            type="button"
            key={k || 'all'}
            className={`crm-chip${(params.get('attention') ?? '') === k ? ' is-on' : ''}`}
            onClick={() => set({ attention: k || null })}
          >
            {text}
          </button>
        ))}
      </div>

      {showFilters && <FilterPanel params={params} set={set} />}

      {active.length > 0 && (
        <div className="crm-active-filters">
          {active.map(([k, v]) => (
            <button type="button" key={k} className="crm-chip is-on is-removable" onClick={() => set({ [k]: null })} aria-label={`Remove filter ${label(k, v)}`}>
              {label(k, v)} ×
            </button>
          ))}
          <button type="button" className="crm-link" onClick={() => go(params.get('q') ? `leads?q=${encodeURIComponent(params.get('q') ?? '')}` : 'leads')}>
            Clear all
          </button>
        </div>
      )}

      <div className="crm-list-head">
        <span>{data ? `${data.total} lead${data.total === 1 ? '' : 's'}` : ' '}</span>
        <label>
          Sort{' '}
          <select value={params.get('sort') ?? 'next'} onChange={(e) => set({ sort: e.target.value === 'next' ? null : e.target.value })}>
            <option value="next">Next follow-up</option>
            <option value="updated">Recently updated</option>
            <option value="created">Newest</option>
            <option value="stage">Stage</option>
            <option value="value">Potential value</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : data.leads.length === 0 ? (
        <div className="crm-empty">No leads match. {active.length || params.get('q') ? 'Try removing a filter.' : ''}</div>
      ) : (
        <>
          <div className="crm-table-wrap">
            <table className="crm-table crm-leads">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Stage</th>
                  <th>Website</th>
                  <th>Referred by</th>
                  <th>Assigned</th>
                  <th>Last activity</th>
                  <th>Next follow-up</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {data.leads.map((l) => (
                  <tr key={l.id}>
                    <td className="crm-lead-name">
                      <a href={`#/lead/${l.id}`}>
                        <strong>{l.name}</strong>
                      </a>
                      <span className="crm-sub">
                        {[l.city, l.category, opportunityLabel(l.opportunityType), l.potentialCents ? money(l.potentialCents) : null].filter(Boolean).join(' · ')}
                      </span>
                    </td>
                    <td data-label="Stage">
                      <StagePill stage={l.stage} />
                      {l.priority === 'high' && <span className="crm-flag">High</span>}
                    </td>
                    <td data-label="Website">
                      <WebsitePill status={l.websiteStatus} />
                    </td>
                    <td data-label="Referred by" className={l.referrer || l.sourceType ? undefined : 'is-empty'}>{l.referrer ? <a href={`#/referrer/${l.referrer.id}`}>{l.referrer.name}</a> : <span className="crm-muted">{l.sourceType ? meta.sources.find((s) => s.key === l.sourceType)?.label ?? l.sourceType : '—'}</span>}</td>
                    <td data-label="Assigned">{l.assignee?.name ?? <span className="crm-muted">—</span>}</td>
                    <td data-label="Last activity">{ago(l.lastActivityAt)}</td>
                    <td data-label="Next follow-up" className={!l.nextFollowupAt ? 'is-empty' : l.nextFollowupAt < Date.now() ? 'is-late' : undefined}>
                      {l.nextFollowupAt ? ago(l.nextFollowupAt) : <span className="crm-muted">None</span>}
                    </td>
                    <td data-label="Contact">
                      <ContactActions c={l.channels} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager total={data.total} page={page} size={PAGE} onPage={(p) => set({ page: p ? String(p) : null })} />
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ filter panel */

function FilterPanel({ params, set }: { params: URLSearchParams; set: (c: Record<string, string | null>) => void }) {
  const { meta } = useCrm()
  const sel = (name: string, options: [string, string][], all = 'Any') => (
    <label className="crm-field">
      <span>{FIELD_LABELS[name] ?? name}</span>
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
    <div className="crm-card crm-filters">
      {sel('stage', meta.stages.map((s) => [s.key, s.label]))}
      {sel('websiteStatus', meta.websiteStatuses.map((w) => [w.key, w.label]))}
      {sel('type', meta.opportunityTypes.map((o) => [o.key, o.label]))}
      {sel('city', meta.cities.map((c) => [c.value, `${c.value} (${c.count})`]))}
      {sel('category', meta.categories.map((c) => [c.value, `${c.value} (${c.count})`]))}
      {sel('referrer', [['none', 'No referrer'], ...people])}
      {sel('assigned', [['none', 'Unassigned'], ...team])}
      {sel('source', meta.sources.map((s) => [s.key, s.label]))}
      {sel('hasPhone', [['1', 'Has a phone'], ['0', 'No phone']])}
      {sel('hasEmail', [['1', 'Has an email'], ['0', 'No email']])}
      {sel('hasInstagram', [['1', 'Has Instagram'], ['0', 'No Instagram']])}
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
        Never contacted
      </label>
      <label className="crm-check">
        <input type="checkbox" checked={params.get('overdue') === '1'} onChange={(e) => set({ overdue: e.target.checked ? '1' : null })} />
        Follow-up overdue
      </label>
    </div>
  )
}

const FIELD_LABELS: Record<string, string> = {
  stage: 'Stage',
  websiteStatus: 'Website',
  type: 'Opportunity',
  city: 'City',
  category: 'Category',
  referrer: 'Referred by',
  assigned: 'Assigned to',
  source: 'Source',
  hasPhone: 'Phone',
  hasEmail: 'Email',
  hasInstagram: 'Instagram',
}

/* ---------------------------------------------------------------- new lead */

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
    if (f.businessName.trim().length < 2) return setError('A business name is required.')
    void create(payload())
  }

  return (
    <div className="crm-sheet" role="dialog" aria-modal="true" aria-label="New lead">
      <form className="crm-card crm-sheet-card" onSubmit={submit}>
        <div className="crm-sheet-head">
          <h2>New lead</h2>
          <button type="button" className="crm-link" onClick={onClose}>
            Cancel
          </button>
        </div>
        <p className="crm-lede">For a business already on BEASTY, search the leads list first: every listed business without a real website already has a lead.</p>
        <div className="crm-form-grid">
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
            <span>Category</span>
            <input value={f.category} onChange={up('category')} list="crm-categories" />
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
            <span>Email</span>
            <input type="email" value={f.email} onChange={up('email')} />
          </label>
          <label className="crm-field">
            <span>Instagram</span>
            <input value={f.instagram} onChange={up('instagram')} placeholder="@handle" />
          </label>
          <label className="crm-field">
            <span>Contact name</span>
            <input value={f.contactName} onChange={up('contactName')} />
          </label>
          <label className="crm-field">
            <span>Opportunity</span>
            <select value={f.opportunityType} onChange={up('opportunityType')}>
              {meta.opportunityTypes.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-field">
            <span>Referred by</span>
            <select value={f.referrerId} onChange={up('referrerId')}>
              <option value="">Nobody</option>
              {meta.people
                .filter((p) => p.active)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field">
            <span>Source</span>
            <select value={f.sourceType} onChange={up('sourceType')}>
              <option value="">{f.referrerId ? "The referrer's type" : 'Not set'}</option>
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
            <span>Assigned to</span>
            <select value={f.assignedTo} onChange={up('assignedTo')}>
              <option value="">Nobody yet</option>
              {meta.people
                .filter((p) => p.active && p.isTeam)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="crm-field is-wide">
            <span>Referral note</span>
            <input value={f.referralNote} onChange={up('referralNote')} placeholder="How the referrer knows them" />
          </label>
          <label className="crm-field is-wide">
            <span>First note</span>
            <textarea value={f.note} onChange={up('note')} rows={2} />
          </label>
        </div>
        {error && <div className="crm-error">{error}</div>}
        {candidates && (
          <div className="crm-candidates">
            {candidates.leads.length > 0 && (
              <>
                <h3>Already in the CRM</h3>
                {candidates.leads.map((c) => (
                  <button type="button" key={c.id} className="crm-row-btn" onClick={() => { onClose(); go(`lead/${c.id}`) }}>
                    Open {c.name}
                    {c.city ? `, ${c.city}` : ''}
                  </button>
                ))}
              </>
            )}
            {candidates.listed.length > 0 && (
              <>
                <h3>Listed on BEASTY</h3>
                {candidates.listed.map((c) => (
                  <button
                    type="button"
                    key={c.brandId}
                    className="crm-row-btn"
                    disabled={busy}
                    onClick={() => void create(payload({ brandId: c.brandId, force: true }))}
                  >
                    Create the lead for {c.name}, {c.city}
                  </button>
                ))}
              </>
            )}
            <button type="button" className="crm-btn" disabled={busy} onClick={() => void create(payload({ force: true }))}>
              It is a different business: create it anyway
            </button>
          </div>
        )}
        <div className="crm-sheet-actions">
          <button type="submit" className="crm-btn crm-btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Create lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
