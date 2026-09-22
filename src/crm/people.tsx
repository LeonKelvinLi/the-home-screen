/*
  People: the referrer leaderboard, one referrer's page (their link, QR code,
  funnel and every business they sent), the admin's Settings (people, offers,
  the import) and the only screen a referral partner ever sees.
*/
import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './api'
import type { LeadSummary, Offer, Person, ReferrerMetrics } from './api'
import { Empty, Failure, Loading, Section, StagePill, Stat, dateTime, money, pct, useApi, useCrm } from './ui'
import { opportunityLabel } from './model'
import { NewLead } from './leads'
import { PeriodPicker } from './views'

const linkFor = (slug: string) => `${window.location.origin}/r/${slug}`

function CopyLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = linkFor(slug)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link', url)
    }
  }
  return (
    <div className="crm-reflink">
      <code>{url.replace(/^https?:\/\//, '')}</code>
      <button type="button" className="crm-btn" onClick={() => void copy()}>
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}

function Qr({ personId, slug }: { personId: string; slug: string }) {
  const src = `/api/crm/people/${encodeURIComponent(personId)}/qr.svg`
  return (
    <figure className="crm-qr">
      <img src={src} alt={`QR code for ${linkFor(slug)}`} width={160} height={160} />
      <figcaption>
        <a href={src} download={`beasty-${slug}-qr.svg`}>
          Download the QR code
        </a>
      </figcaption>
    </figure>
  )
}

function FunnelBars({ m }: { m: Pick<ReferrerMetrics, 'leads' | 'contacted' | 'replied' | 'interested' | 'proposals' | 'won'> }) {
  const rows: [string, number][] = [
    ['Referred', m.leads],
    ['Contacted', m.contacted],
    ['Replied', m.replied],
    ['Interested', m.interested],
    ['Proposal sent', m.proposals],
    ['Won', m.won],
  ]
  const top = m.leads || 1
  return (
    <div className="crm-funnel">
      {rows.map(([label, n]) => (
        <div key={label} className="crm-funnel-row">
          <span className="crm-funnel-label">{label}</span>
          <span className="crm-funnel-bar">
            <span style={{ width: `${Math.max(2, (n / top) * 100)}%` }} />
          </span>
          <span className="crm-funnel-n">{n}</span>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- referrers */

export function Referrers() {
  const { go, meta } = useCrm()
  const [period, setPeriod] = useState('all')
  const [showAll, setShowAll] = useState(false)
  const { data, error, reload } = useApi<{ referrers: ReferrerMetrics[] }>(`/api/crm/referrers?period=${period}`)
  const rows = (data?.referrers ?? []).filter((r) => showAll || r.leads > 0 || r.visits > 0)
  const sourceLabel = (k: string) => meta.sources.find((s) => s.key === k)?.label ?? k
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Referrers</h1>
      <p className="crm-lede">
        Who brings businesses in, and how far those businesses get. A lead counts for the person who referred it first; a later change needs an admin and a reason.
      </p>
      <PeriodPicker value={period} onChange={setPeriod} />
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Type</th>
                  <th className="num">Leads</th>
                  <th className="num">Contacted</th>
                  <th className="num">Replied</th>
                  <th className="num">Interested</th>
                  <th className="num">Proposals</th>
                  <th className="num">Won</th>
                  <th className="num">Conversion</th>
                  <th className="num">Revenue</th>
                  <th className="num">MRR</th>
                  <th className="num">Link visits</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="is-link" onClick={() => go(`referrer/${r.id}`)}>
                    <td data-label="Person">
                      <a href={`#/referrer/${r.id}`} onClick={(e) => e.stopPropagation()}>
                        <strong>{r.name}</strong>
                      </a>
                      {!r.active && <span className="crm-muted"> (inactive)</span>}
                    </td>
                    <td data-label="Type">{sourceLabel(r.sourceType)}</td>
                    <td data-label="Leads" className="num">{r.leads}</td>
                    <td data-label="Contacted" className="num">{r.contacted}</td>
                    <td data-label="Replied" className="num">{r.replied}</td>
                    <td data-label="Interested" className="num">{r.interested}</td>
                    <td data-label="Proposals" className="num">{r.proposals}</td>
                    <td data-label="Won" className="num">{r.won}</td>
                    <td data-label="Conversion" className="num">{r.leads ? pct(r.conversion) : '—'}</td>
                    <td data-label="Revenue" className="num">{money(r.oneTimeCents)}</td>
                    <td data-label="MRR" className="num">{r.mrrCents ? money(r.mrrCents) : '—'}</td>
                    <td data-label="Link visits" className="num">{r.visits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <Empty>No referrals in this period.</Empty>}
          <button type="button" className="crm-link" onClick={() => setShowAll((s) => !s)}>
            {showAll ? 'Hide people with no referrals' : `Show everyone (${data.referrers.length})`}
          </button>
        </>
      )}
    </div>
  )
}

type ReferredBusiness = LeadSummary & {
  deal: { offer_name: string; quoted_cents: number; sold_cents: number | null; monthly_cents: number; status: string; recurring_active: boolean } | null
}

export function ReferrerDetail({ id }: { id: string }) {
  const { back, meta } = useCrm()
  const [period, setPeriod] = useState('all')
  const [adding, setAdding] = useState(false)
  const { data, error, reload } = useApi<{ person: ReferrerMetrics; businesses: ReferredBusiness[] }>(
    `/api/crm/referrers/${encodeURIComponent(id)}?period=${period}`,
  )
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const p = data.person
  return (
    <div className="crm-view">
      <a className="crm-back" href="#/referrers" onClick={(e) => { e.preventDefault(); back('referrers') }}>
        ‹ Referrers
      </a>
      <div className="crm-view-head">
        <div>
          <h1 className="crm-h1">{p.name}</h1>
          <div className="crm-sub">
            {meta.sources.find((s) => s.key === p.sourceType)?.label ?? p.sourceType}
            {p.role !== 'none' ? ` · CRM ${p.role}` : ''}
            {p.linked ? ' · signs in with their BEASTY account' : ''}
            {!p.active ? ' · inactive' : ''}
          </div>
        </div>
        <button type="button" className="crm-btn crm-btn-primary" onClick={() => setAdding(true)}>
          Add a business they referred
        </button>
      </div>
      {adding && <NewLead onClose={() => setAdding(false)} initial={{ referrerId: p.id }} />}

      <div className="crm-grid2">
        <Section title="Their referral link">
          <div className="crm-card">
            <CopyLink slug={p.slug} />
            <p className="crm-lede">
              Anyone who opens this link and then asks for a spot on BEASTY within 90 days is credited to {p.name}. Add <code>?via=qr</code> for print, or <code>?c=name</code> for a campaign.
            </p>
            <Qr personId={p.id} slug={p.slug} />
          </div>
        </Section>
        <Section title="Funnel">
          <PeriodPicker value={period} onChange={setPeriod} />
          <FunnelBars m={p} />
        </Section>
      </div>

      <div className="crm-stats">
        <Stat label="Businesses referred" value={p.leads} />
        <Stat label="Won" value={p.won} sub={p.leads ? `${pct(p.conversion)} conversion` : undefined} tone={p.won ? 'good' : undefined} />
        <Stat label="Revenue" value={money(p.oneTimeCents)} />
        <Stat label="MRR" value={money(p.mrrCents)} />
        <Stat label="Link visits" value={p.visits} />
      </div>

      <Section title={`Businesses (${data.businesses.length})`}>
        {data.businesses.length ? (
          <ul className="crm-list">
            {data.businesses.map((b) => (
              <li key={b.id} className="crm-row">
                <a className="crm-row-main" href={`#/lead/${b.id}`}>
                  <strong>{b.name}</strong>
                  <span>
                    {[b.city, opportunityLabel(b.opportunityType)].filter(Boolean).join(' · ')}
                    {b.deal
                      ? ` · ${b.deal.offer_name}: ${b.deal.status === 'won' ? `sold ${money(b.deal.sold_cents)}` : `${b.deal.status === 'lost' ? 'lost' : 'quoted'} ${money(b.deal.quoted_cents)}`}${b.deal.monthly_cents ? ` + ${money(b.deal.monthly_cents)}/mo` : ''}`
                      : ''}
                  </span>
                </a>
                <StagePill stage={b.stage} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nobody credited to {p.name} in this period.</Empty>
        )}
      </Section>
    </div>
  )
}

/* ----------------------------------------------------------------- partner */

interface PartnerData {
  person: {
    name: string
    slug: string
    leads: number
    contacted: number
    replied: number
    interested: number
    proposals: number
    won: number
    conversion: number
    oneTimeCents: number
    mrrCents: number
    visits: number
  }
  businesses: { name: string; city: string | null; status: string }[]
}

/** A referral partner's whole CRM: their link, their numbers, and where each business they sent stands. */
export function PartnerHome({ personId }: { personId: string | null }) {
  const { data, error, reload } = useApi<PartnerData>('/api/crm/partner/me')
  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  const p = data.person
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Hi {p.name.split(' ')[0]}</h1>
      <p className="crm-lede">Businesses you send to BEASTY, and how they are doing.</p>
      <Section title="Your link">
        <div className="crm-card">
          <CopyLink slug={p.slug} />
          <p className="crm-lede">Share it with a business. When they ask for a spot on BEASTY after opening it, they are credited to you.</p>
          {personId && <Qr personId={personId} slug={p.slug} />}
        </div>
      </Section>
      <div className="crm-stats">
        <Stat label="Businesses referred" value={p.leads} />
        <Stat label="Contacted" value={p.contacted} />
        <Stat label="Interested" value={p.interested} />
        <Stat label="Customers" value={p.won} tone={p.won ? 'good' : undefined} />
        <Stat label="Link visits" value={p.visits} />
      </div>
      <Section title="Your businesses">
        {data.businesses.length ? (
          <ul className="crm-list">
            {data.businesses.map((b, i) => (
              <li key={`${b.name}-${i}`} className="crm-row">
                <div className="crm-row-main">
                  <strong>{b.name}</strong>
                  <span>{b.city ?? ''}</span>
                </div>
                <span className={`crm-stage crm-partner-${b.status === 'Customer' ? 'won' : b.status === 'Closed' ? 'closed' : 'open'}`}>{b.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>None yet. Share your link to get started.</Empty>
        )}
      </Section>
    </div>
  )
}

/* ---------------------------------------------------------------- settings */

export function Settings() {
  const { actor } = useCrm()
  if (actor.role !== 'admin') return <Failure error="Settings are for admins." />
  return (
    <div className="crm-view">
      <h1 className="crm-h1">Settings</h1>
      <PeopleSettings />
      <OfferSettings />
      <ImportSettings />
    </div>
  )
}

const ROLES: [Person['role'], string][] = [
  ['none', 'No CRM access (referrer only)'],
  ['partner', 'Partner: sees only their own referrals'],
  ['team', 'Team: works leads'],
  ['admin', 'Admin: everything'],
]

function PeopleSettings() {
  const { meta, reloadMeta } = useCrm()
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  return (
    <Section title="People" action={!adding ? <button type="button" className="crm-link" onClick={() => setAdding(true)}>Add a person</button> : undefined}>
      <p className="crm-lede">
        Referrers, team and partners. To let someone sign in, link the email of their BEASTY account and give them a role; they then open /crm while signed in.
      </p>
      {adding && (
        <PersonForm
          onDone={() => {
            setAdding(false)
            reloadMeta()
          }}
          onCancel={() => setAdding(false)}
        />
      )}
      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Link</th>
              <th>Type</th>
              <th>Role</th>
              <th>Account</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {meta.people.map((p) =>
              editing === p.id ? (
                <tr key={p.id}>
                  <td colSpan={6}>
                    <PersonForm
                      person={p}
                      onDone={() => {
                        setEditing(null)
                        reloadMeta()
                      }}
                      onCancel={() => setEditing(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className={p.active ? undefined : 'is-muted'}>
                  <td data-label="Name">
                    <a href={`#/referrer/${p.id}`}>
                      <strong>{p.name}</strong>
                    </a>
                    {!p.active && ' (inactive)'}
                  </td>
                  <td data-label="Link">/r/{p.slug}</td>
                  <td data-label="Type">{meta.sources.find((s) => s.key === p.sourceType)?.label ?? p.sourceType}</td>
                  <td data-label="Role">{p.role === 'none' ? '—' : p.role}</td>
                  <td data-label="Account">{p.linked ? 'Linked' : '—'}</td>
                  <td>
                    <button type="button" className="crm-link" onClick={() => setEditing(p.id)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function PersonForm({ person, onDone, onCancel }: { person?: Person; onDone: () => void; onCancel: () => void }) {
  const { meta } = useCrm()
  const [f, setF] = useState({
    name: person?.name ?? '',
    slug: person?.slug ?? '',
    sourceType: person?.sourceType ?? 'individual',
    role: person?.role ?? 'none',
    memberEmail: '',
    brandId: person?.brandId ?? '',
    active: person?.active ?? true,
  })
  const [unlink, setUnlink] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        name: f.name,
        slug: f.slug || undefined,
        sourceType: f.sourceType,
        role: f.role,
        brandId: f.brandId || null,
        active: f.active,
      }
      if (f.memberEmail.trim()) body.memberEmail = f.memberEmail.trim()
      else if (unlink) body.memberEmail = ''
      if (person) await api(`/api/crm/people/${person.id}`, { method: 'PATCH', body })
      else await api('/api/crm/people', { method: 'POST', body })
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="crm-card crm-person-form" onSubmit={submit}>
      <div className="crm-form-grid">
        <label className="crm-field">
          <span>Name</span>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} />
        </label>
        <label className="crm-field">
          <span>Link name (beastypages.com/r/…)</span>
          <input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value.toLowerCase() })} placeholder="from the name" pattern="[a-z0-9-]{2,60}" />
        </label>
        <label className="crm-field">
          <span>Type</span>
          <select value={f.sourceType} onChange={(e) => setF({ ...f, sourceType: e.target.value })}>
            {meta.sources
              .filter((s) => s.isPerson)
              .map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
          </select>
        </label>
        <label className="crm-field">
          <span>CRM role</span>
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Person['role'] })}>
            {ROLES.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="crm-field">
          <span>{person?.linked ? 'BEASTY account (linked; enter an email to relink)' : 'BEASTY account email (to let them sign in)'}</span>
          <input type="email" value={f.memberEmail} onChange={(e) => setF({ ...f, memberEmail: e.target.value })} placeholder="their sign-up email" />
        </label>
        <label className="crm-field">
          <span>Their BEASTY page id (optional)</span>
          <input value={f.brandId} onChange={(e) => setF({ ...f, brandId: e.target.value })} placeholder="e.g. b_nanacasas" />
        </label>
        {person && (
          <label className="crm-check">
            <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
            Active (an inactive person's link stops crediting new visitors)
          </label>
        )}
        {person?.linked && (
          <label className="crm-check">
            <input type="checkbox" checked={unlink} onChange={(e) => setUnlink(e.target.checked)} />
            Unlink their BEASTY account
          </label>
        )}
      </div>
      {error && <div className="crm-error">{error}</div>}
      <div className="crm-row-actions">
        <button type="submit" className="crm-btn crm-btn-primary" disabled={busy}>
          {busy ? 'Saving…' : person ? 'Save' : 'Add person'}
        </button>
        <button type="button" className="crm-link" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function OfferSettings() {
  const { meta, reloadMeta } = useCrm()
  const [adding, setAdding] = useState(false)
  return (
    <Section title="Offers" action={!adding ? <button type="button" className="crm-link" onClick={() => setAdding(true)}>Add an offer</button> : undefined}>
      <p className="crm-lede">What a deal can be quoted from. A deal copies the name and prices when it is created, so changing a price here never rewrites what an earlier customer paid.</p>
      {adding && (
        <OfferForm
          onDone={() => {
            setAdding(false)
            reloadMeta()
          }}
          onCancel={() => setAdding(false)}
        />
      )}
      <ul className="crm-list">
        {meta.offers.map((o) => (
          <OfferRow key={o.id} o={o} onDone={reloadMeta} />
        ))}
      </ul>
    </Section>
  )
}

function OfferRow({ o, onDone }: { o: Offer; onDone: () => void }) {
  const [editing, setEditing] = useState(false)
  if (editing)
    return (
      <li className="crm-row is-form">
        <OfferForm
          offer={o}
          onDone={() => {
            setEditing(false)
            onDone()
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  return (
    <li className={`crm-row${o.active ? '' : ' is-muted'}`}>
      <div className="crm-row-main">
        <strong>{o.name}</strong>
        <span>
          {opportunityLabel(o.opportunityType)} · {money(o.oneTimeCents)}
          {o.monthlyCents ? ` + ${money(o.monthlyCents)}/mo` : ''}
          {o.active ? '' : ' · retired'}
        </span>
      </div>
      <button type="button" className="crm-link" onClick={() => setEditing(true)}>
        Edit
      </button>
    </li>
  )
}

function OfferForm({ offer, onDone, onCancel }: { offer?: Offer; onDone: () => void; onCancel: () => void }) {
  const { meta } = useCrm()
  const [f, setF] = useState({
    name: offer?.name ?? '',
    opportunityType: offer?.opportunityType ?? 'website',
    oneTime: offer ? String(offer.oneTimeCents / 100) : '',
    monthly: offer ? String(offer.monthlyCents / 100) : '',
    active: offer?.active ?? true,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const oneTimeCents = Math.round(Number(f.oneTime || 0) * 100)
      const monthlyCents = Math.round(Number(f.monthly || 0) * 100)
      if (offer) await api(`/api/crm/offers/${offer.id}`, { method: 'PATCH', body: { name: f.name, oneTimeCents, monthlyCents, active: f.active } })
      else await api('/api/crm/offers', { method: 'POST', body: { name: f.name, opportunityType: f.opportunityType, oneTimeCents, monthlyCents } })
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="crm-card" onSubmit={submit}>
      <div className="crm-form-grid">
        <label className="crm-field is-wide">
          <span>Name</span>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} />
        </label>
        {!offer && (
          <label className="crm-field">
            <span>Opportunity</span>
            <select value={f.opportunityType} onChange={(e) => setF({ ...f, opportunityType: e.target.value })}>
              {meta.opportunityTypes.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="crm-field">
          <span>One-time ($)</span>
          <input inputMode="decimal" value={f.oneTime} onChange={(e) => setF({ ...f, oneTime: e.target.value.replace(/[^0-9.]/g, '') })} />
        </label>
        <label className="crm-field">
          <span>Monthly ($)</span>
          <input inputMode="decimal" value={f.monthly} onChange={(e) => setF({ ...f, monthly: e.target.value.replace(/[^0-9.]/g, '') })} />
        </label>
        {offer && (
          <label className="crm-check">
            <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
            Offered to new deals
          </label>
        )}
      </div>
      {offer && <p className="crm-lede">Existing deals keep the name and prices they were quoted at.</p>}
      {error && <div className="crm-error">{error}</div>}
      <div className="crm-row-actions">
        <button type="submit" className="crm-btn crm-btn-primary" disabled={busy}>
          {busy ? 'Saving…' : offer ? 'Save' : 'Add offer'}
        </button>
        <button type="button" className="crm-link" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

interface BackfillReport {
  runId: string
  dryRun: boolean
  scanned: number
  qualifying: number
  created: number
  skippedExisting: number
  skippedHasSite: number
  skippedOwner: number
  applications: { scanned: number; created: number; skippedExisting: number; skippedCollab: number }
  duplicates: { key: string; value: string; businesses: { id: string; name: string }[] }[]
  manualReview: { id: string; name: string; reason: string }[]
  errors: { id: string; error: string }[]
}

function ImportSettings() {
  const { reloadMeta } = useCrm()
  const [report, setReport] = useState<BackfillReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const runs = useApi<{ runs: { id: string; actor: string; started_at: number; finished_at: number | null; report: (BackfillReport & { createdIds: number }) | null }[] }>(
    '/api/crm/backfill/runs',
  )
  const go = async (dryRun: boolean) => {
    if (!dryRun && !window.confirm('Create the leads this preview lists? Existing leads are never changed, and running it again creates nothing new.')) return
    setBusy(true)
    setError(null)
    try {
      setReport(await api<BackfillReport>('/api/crm/backfill', { method: 'POST', body: { dryRun } }))
      if (!dryRun) {
        void runs.reload()
        reloadMeta()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Section title="Import from BEASTY">
      <div className="crm-card">
        <p className="crm-lede">
          Creates a website lead for every listed business whose listing shows no real website (none, Instagram only, a Linktree, an ordering page...), plus a lead for each Reserve-a-spot request. It only adds: a business that already has a lead is skipped, and people on the Individuals sheet are listed for review instead.
        </p>
        <div className="crm-row-actions">
          <button type="button" className="crm-btn" disabled={busy} onClick={() => void go(true)}>
            {busy ? 'Working…' : 'Preview'}
          </button>
          <button type="button" className="crm-btn crm-btn-primary" disabled={busy || !report?.dryRun} onClick={() => void go(false)} title={report?.dryRun ? undefined : 'Preview first'}>
            Run the import
          </button>
        </div>
        {error && <div className="crm-error">{error}</div>}
        {report && <ReportView r={report} />}
      </div>
      {runs.data && runs.data.runs.length > 0 && (
        <details className="crm-details">
          <summary>Past imports ({runs.data.runs.length})</summary>
          <ul className="crm-list is-quiet">
            {runs.data.runs.map((r) => (
              <li key={r.id} className="crm-row">
                <div className="crm-row-main">
                  <strong>{dateTime(Number(r.started_at))}</strong>
                  <span>
                    {r.report ? `${r.report.created} business leads, ${r.report.applications.created} from requests, ${r.report.skippedExisting} already there` : 'Did not finish'} · {r.id}
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

function ReportView({ r }: { r: BackfillReport }) {
  return (
    <div className="crm-report">
      <h3>{r.dryRun ? 'Preview: nothing has been written' : `Done: run ${r.runId}`}</h3>
      <div className="crm-stats">
        <Stat label="Businesses scanned" value={r.scanned} />
        <Stat label="Need a website" value={r.qualifying} />
        <Stat label={r.dryRun ? 'Would create' : 'Created'} value={r.created} tone="good" />
        <Stat label="Already had a lead" value={r.skippedExisting} />
        <Stat label="Have a real site" value={r.skippedHasSite} />
        <Stat label="Requests to import" value={r.applications.created} sub={`${r.applications.scanned} requests, ${r.applications.skippedCollab} creator requests left out`} />
      </div>
      {r.manualReview.length > 0 && (
        <details className="crm-details" open>
          <summary>For a person to decide ({r.manualReview.length})</summary>
          <ul className="crm-notes">
            {r.manualReview.map((m) => (
              <li key={m.id}>
                <strong>{m.name}</strong>: {m.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
      {r.duplicates.length > 0 && (
        <details className="crm-details">
          <summary>Possible duplicates, not merged ({r.duplicates.length})</summary>
          <ul className="crm-notes">
            {r.duplicates.map((d) => (
              <li key={`${d.key}|${d.value}`}>
                Same {d.key} on {d.businesses.map((b) => b.name).join(', ')}
              </li>
            ))}
          </ul>
        </details>
      )}
      {r.errors.length > 0 && (
        <details className="crm-details" open>
          <summary>Errors ({r.errors.length})</summary>
          <ul className="crm-notes">
            {r.errors.map((e) => (
              <li key={e.id}>
                {e.id}: {e.error}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
