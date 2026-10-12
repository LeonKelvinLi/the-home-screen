/*
  Affiliates — the team's side of /join.

  Glenn invites someone, they fill in their details, set up payouts with Stripe
  and sign the agreement in DocuSeal, then send it in. This is where he sees
  where each person is, countersigns, and approves (or asks for a change).

  Nothing sensitive shows here because nothing sensitive is kept: Stripe holds
  the Social Security number, bank account and ID photo, and this page only
  shows Stripe's yes/no answers and the last four digits of the account.
*/
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api } from './api'
import { Avatar, dateTime, Empty, Failure, Loading, PageTitle, Section, ago, personName, plural, useApi, useCrm } from './ui'
import { Icon } from './icons'

type Mode = 'off' | 'mock' | 'live'
type Status = 'in_progress' | 'submitted' | 'changes_requested' | 'approved' | 'rejected' | 'suspended'

interface AppRow {
  id: string
  name: string
  email: string
  business: string
  status: Status
  profileComplete: boolean
  payouts: 'complete' | 'started' | 'not_started'
  agreement: string
  submittedAt: number | null
  updatedAt: number
}

interface InviteRow {
  id: string
  email: string
  name: string
  created_at: number
  expires_at: number
  redeemed_at: number | null
  revoked_at: number | null
  sent_count: number
  state: 'open' | 'expired' | 'revoked' | 'redeemed'
}

interface ListData {
  providers: { payouts: Mode; signing: Mode }
  counts: Partial<Record<Status, number>>
  total: number
  applications: AppRow[]
  invites: InviteRow[]
}

interface Detail {
  id: string
  status: Status
  profile: Record<string, string | string[] | undefined>
  steps: {
    profile: { complete: boolean; problems: Record<string, string> }
    payouts: { available: boolean; started: boolean; complete: boolean; identity: string; tax: string; bank: string; bankLast4: string | null }
    agreement: { available: boolean; status: string; affiliateSigned: boolean; countersigned: boolean; completedAt: number | null }
  }
  submittedAt: number | null
  decidedAt: number | null
  decisionNote: string
  testMode: boolean
  updatedAt: number
  member: { name: string; code: string; joinedAt: number } | null
  payoutState: { detailsSubmitted: boolean; payoutsEnabled: boolean; due: string[] } | null
  events: { actor: string; kind: string; detail: Record<string, unknown>; created_at: number }[]
  countersignAvailable: boolean
}

const STATUS: Record<Status, { label: string; tone: string }> = {
  in_progress: { label: 'Filling it in', tone: 'gray' },
  submitted: { label: 'Waiting for you', tone: 'orange' },
  changes_requested: { label: 'Asked to change', tone: 'violet' },
  approved: { label: 'Approved', tone: 'green' },
  rejected: { label: 'Not approved', tone: 'red' },
  suspended: { label: 'Paused', tone: 'pink' },
}

const FILTERS: [Status | '', string][] = [
  ['', 'All'],
  ['submitted', 'Waiting for you'],
  ['in_progress', 'Filling it in'],
  ['changes_requested', 'Asked to change'],
  ['approved', 'Approved'],
  ['suspended', 'Paused'],
  ['rejected', 'Not approved'],
]

const AGREEMENT: Record<string, string> = {
  not_started: 'Not sent yet',
  pending_signature: 'Waiting for their signature',
  pending_countersignature: 'Signed by them, needs yours',
  completed: 'Signed by both',
  declined: 'They declined it',
  expired: 'Expired',
}

const EVENT: Record<string, string> = {
  invited: 'Invited',
  invite_resent: 'Invite sent again',
  invite_revoked: 'Invite cancelled',
  started: 'Opened their invite and started',
  profile_completed: 'Finished their details',
  payouts_started: 'Started payout setup with Stripe',
  payouts_completed: 'Stripe finished their payout setup',
  agreement_sent: 'Agreement ready to sign',
  agreement_signed: 'Signed the agreement',
  agreement_countersigned: 'Agreement countersigned',
  agreement_declined: 'Declined the agreement',
  agreement_expired: 'Agreement expired',
  submitted: 'Sent it in for review',
  resubmitted: 'Sent it in again',
  approved: 'Approved',
  changes_requested: 'Asked for a change',
  rejected: 'Not approved',
  suspended: 'Paused',
  reinstated: 'Reinstated',
  admin_viewed: 'Opened by the team',
}

function StatusPill({ status }: { status: Status }) {
  const s = STATUS[status] ?? { label: status, tone: 'gray' }
  return <span className={`crm-stage is-${s.tone}`}>{s.label}</span>
}

/** One line of where each of the three steps stands. */
function progressLine(a: AppRow) {
  const parts = [
    a.profileComplete ? 'Details done' : 'Details not finished',
    a.payouts === 'complete' ? 'payouts set up' : a.payouts === 'started' ? 'payouts started' : 'no payouts yet',
    a.agreement === 'completed' ? 'agreement signed by both' : a.agreement === 'pending_countersignature' ? 'agreement needs your signature' : a.agreement === 'pending_signature' ? 'agreement not signed' : 'no agreement yet',
  ]
  return parts.join(', ')
}

function ProviderNote({ providers }: { providers: ListData['providers'] }) {
  if (providers.payouts === 'mock' || providers.signing === 'mock')
    return <p className="crm-aff-notice is-test">Test mode. Payouts and signing are pretend here, so nobody is paid and nothing is legally signed.</p>
  const off: string[] = []
  if (providers.payouts === 'off') off.push('payouts open once Stripe Connect is switched on')
  if (providers.signing === 'off') off.push('signing opens once the DocuSeal agreement is set up')
  if (!off.length) return null
  return <p className="crm-aff-notice">People can fill in their details now; {off.join(', and ')}.</p>
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** The link a new invite makes, ready to text or paste. */
function LinkBox({ link, onDone }: { link: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="crm-aff-link" role="status">
      <strong>Invite ready. We emailed it too.</strong>
      <span className="crm-aff-link-url">{link}</span>
      <div className="crm-aff-actions">
        <button type="button" className="crm-btn is-dark" onClick={async () => setCopied(await copy(link))}>
          <Icon name={copied ? 'check' : 'copy'} size={16} />
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button type="button" className="crm-btn" onClick={onDone}>
          Done
        </button>
      </div>
      <span className="crm-quiet">The link works once, for 14 days. Text it if the email doesn't arrive.</span>
    </div>
  )
}

function InviteForm({ onSent }: { onSent: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const r = await api<{ link: string }>('/api/crm/onboarding/invites', { method: 'POST', body: { name, email, note } })
      setLink(r.link)
      setName('')
      setEmail('')
      setNote('')
      onSent()
    } catch (e2) {
      setErr((e2 as Error).message)
    } finally {
      setBusy(false)
    }
  }
  if (link) return <LinkBox link={link} onDone={() => setLink(null)} />
  return (
    <form className="crm-panel crm-aff-invite" onSubmit={submit}>
      <div className="crm-form">
        <label className="crm-field">
          <span>Their name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" maxLength={80} />
        </label>
        <label className="crm-field">
          <span>Their email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required maxLength={120} />
        </label>
        <label className="crm-field is-wide">
          <span>Note for the team (they don't see it)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} autoComplete="off" maxLength={300} />
        </label>
      </div>
      {err && <Failure error={err} />}
      <button type="submit" className="crm-btn is-primary" disabled={busy || !email}>
        <Icon name="mail" size={16} />
        {busy ? 'Sending' : 'Send invite'}
      </button>
    </form>
  )
}

function InviteList({ invites, admin, reload }: { invites: InviteRow[]; admin: boolean; reload: () => void }) {
  const [fresh, setFresh] = useState<{ id: string; link: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const open = invites.filter((i) => i.state !== 'redeemed')
  if (!open.length) return null
  const act = async (i: InviteRow, what: 'resend' | 'revoke') => {
    if (what === 'revoke' && !window.confirm(`Cancel the invite for ${i.email}? Their link stops working.`)) return
    setErr(null)
    try {
      const r = await api<{ link?: string }>(`/api/crm/onboarding/invites/${i.id}/${what}`, { method: 'POST' })
      if (r.link) setFresh({ id: i.id, link: r.link })
      reload()
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  return (
    <Section title="Invites not used yet">
      {err && <Failure error={err} />}
      <ul className="crm-group">
        {open.map((i) => (
          <li key={i.id}>
            <div className="crm-row">
              <Avatar name={i.name || i.email} size={40} />
              <span className="crm-row-text">
                <strong>{i.name || i.email}</strong>
                <span>{i.name ? i.email : ''}</span>
                <span className="crm-row-meta">
                  {i.state === 'open' ? `Sent ${ago(i.created_at)}, works until ${dateTime(i.expires_at)}` : i.state === 'expired' ? 'Expired' : 'Cancelled'}
                  {i.sent_count > 1 ? `, sent ${i.sent_count} times` : ''}
                </span>
              </span>
              {admin && (
                <span className="crm-aff-actions">
                  <button type="button" className="crm-btn" onClick={() => act(i, 'resend')}>
                    {i.state === 'open' ? 'Send again' : 'Send a new link'}
                  </button>
                  {i.state === 'open' && (
                    <button type="button" className="crm-btn" onClick={() => act(i, 'revoke')}>
                      Cancel
                    </button>
                  )}
                </span>
              )}
            </div>
            {fresh?.id === i.id && (
              <div className="crm-aff-inline">
                <LinkBox link={fresh.link} onDone={() => setFresh(null)} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function Affiliates() {
  const { actor } = useCrm()
  const admin = actor.role === 'admin'
  const [status, setStatus] = useState<Status | ''>('')
  const [q, setQ] = useState('')
  const [inviting, setInviting] = useState(false)
  const qs = new URLSearchParams()
  if (status) qs.set('status', status)
  if (q.trim()) qs.set('q', q.trim())
  const { data, error, reload } = useApi<ListData>(`/api/crm/onboarding${qs.toString() ? `?${qs}` : ''}`)
  return (
    <div className="crm-view">
      <PageTitle
        title="Affiliates"
        sub="People who sign up to earn with BEASTY. Invite them here, see how far each one got, then countersign and approve."
        actions={
          admin ? (
            <button type="button" className={`crm-btn${inviting ? '' : ' is-primary'}`} onClick={() => setInviting((v) => !v)} aria-expanded={inviting}>
              <Icon name={inviting ? 'x' : 'plus'} size={16} stroke={2.4} />
              {inviting ? 'Close' : 'Invite someone'}
            </button>
          ) : undefined
        }
      />
      {inviting && admin && <InviteForm onSent={reload} />}
      {data && <ProviderNote providers={data.providers} />}
      <div className="crm-chips" role="tablist" aria-label="Show">
        {FILTERS.map(([k, label]) => {
          const n = k ? data?.counts[k] ?? 0 : data?.total ?? 0
          return (
            <button type="button" key={k || 'all'} role="tab" aria-selected={status === k} className={status === k ? 'is-on' : undefined} onClick={() => setStatus(k)}>
              {label}
              {data ? <em>{n}</em> : null}
            </button>
          )
        })}
      </div>
      <label className="crm-aff-search">
        <Icon name="search" size={16} />
        <input type="search" placeholder="Search by name, email or business" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search affiliates" />
      </label>
      {error && <Failure error={error} retry={reload} />}
      {!data ? (
        <Loading />
      ) : (
        <>
          {data.applications.length ? (
            <ul className="crm-group">
              {data.applications.map((a) => (
                <li key={a.id}>
                  <a className="crm-row crm-aff-row" href={`#/affiliate/${a.id}`}>
                    <Avatar name={a.name} size={44} />
                    <span className="crm-row-text">
                      <strong>{a.name}</strong>
                      <span>{[a.business, a.email].filter(Boolean).join(', ')}</span>
                      <span className="crm-row-meta">{progressLine(a)}</span>
                    </span>
                    <span className="crm-row-end">
                      <StatusPill status={a.status} />
                      <small>{a.submittedAt ? `Sent in ${ago(a.submittedAt)}` : `Updated ${ago(a.updatedAt)}`}</small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon="users">{data.total ? 'Nobody matches that.' : admin ? 'No applications yet. Invite someone to start.' : 'No applications yet.'}</Empty>
          )}
          <InviteList invites={data.invites} admin={admin} reload={reload} />
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- one person */

function StepRow({ done, title, children }: { done: boolean; title: string; children: ReactNode }) {
  return (
    <li className={`crm-aff-step${done ? ' is-done' : ''}`}>
      <span className="crm-aff-step-mark" aria-hidden="true">
        {done ? <Icon name="check" size={14} stroke={3} /> : null}
      </span>
      <span className="crm-row-text">
        <strong>
          {title}
          <span className="crm-sr">{done ? ' (done)' : ' (not done)'}</span>
        </strong>
        <span>{children}</span>
      </span>
    </li>
  )
}

const CHECK: Record<string, string> = { complete: 'Done', pending: 'Stripe is checking', needed: 'Not yet' }

function Decide({ d, reload }: { d: Detail; reload: () => void }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const signed = d.steps.agreement.status === 'completed'
  const run = async (action: string, confirmText: string) => {
    if (!window.confirm(confirmText)) return
    setBusy(action)
    setErr(null)
    try {
      await api(`/api/crm/onboarding/${d.id}/decision`, { method: 'POST', body: { action, note } })
      setNote('')
      reload()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(null)
    }
  }
  const countersign = async () => {
    setBusy('countersign')
    setErr(null)
    try {
      const r = await api<{ ok?: boolean; url?: string }>(`/api/crm/onboarding/${d.id}/countersign`, { method: 'POST' })
      if (r.url) window.location.assign(r.url)
      else reload()
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(null)
    }
  }
  const name = String(d.profile.preferredName || d.profile.legalFirst || 'them')

  let body: ReactNode = null
  if (d.status === 'submitted') {
    body = (
      <>
        <p className="crm-note">
          {signed
            ? `${name} finished every step. Approve to make them an affiliate, or ask for a change.`
            : d.countersignAvailable
              ? `${name} signed the agreement. Countersign it, then approve.`
              : !d.steps.agreement.available
                ? `${name} sent in their details. Payouts and the agreement open once Stripe Connect and DocuSeal are set up; they finish those then, and you approve after the agreement is signed by both.`
                : `${name} sent it in. The agreement still needs both signatures before you can approve.`}
        </p>
        {d.countersignAvailable && (
          <button type="button" className="crm-btn is-dark is-block" disabled={!!busy} onClick={countersign}>
            <Icon name="pencil" size={16} />
            {busy === 'countersign' ? 'Opening' : d.testMode ? 'Countersign (test)' : 'Countersign in DocuSeal'}
          </button>
        )}
        <button type="button" className="crm-btn is-good is-block" disabled={!!busy || !signed} onClick={() => run('approve', `Approve ${name} as a BEASTY affiliate? We email them.`)}>
          <Icon name="check" size={16} stroke={2.6} />
          Approve
        </button>
        <label className="crm-field">
          <span>Note for {name} (needed to ask for a change or say no)</span>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} />
        </label>
        <div className="crm-aff-actions">
          <button type="button" className="crm-btn" disabled={!!busy || !note.trim()} onClick={() => run('request_changes', `Send ${name} back to change something? We email them your note.`)}>
            Ask for a change
          </button>
          <button type="button" className="crm-btn" disabled={!!busy || !note.trim()} onClick={() => run('reject', `Turn down ${name}'s application? We email them your note.`)}>
            Don't approve
          </button>
        </div>
      </>
    )
  } else if (d.status === 'changes_requested') {
    body = (
      <>
        <p className="crm-note">You asked {name} to change something. They can edit and send it in again.</p>
        {d.decisionNote && <blockquote className="crm-aff-quote">{d.decisionNote}</blockquote>}
        <label className="crm-field">
          <span>Note (needed to turn it down)</span>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} />
        </label>
        <button type="button" className="crm-btn" disabled={!!busy || !note.trim()} onClick={() => run('reject', `Turn down ${name}'s application? We email them your note.`)}>
          Don't approve
        </button>
      </>
    )
  } else if (d.status === 'approved') {
    body = (
      <>
        <p className="crm-note">{name} is an approved affiliate{d.decidedAt ? ` since ${dateTime(d.decidedAt)}` : ''}.</p>
        <button type="button" className="crm-btn" disabled={!!busy} onClick={() => run('suspend', `Pause ${name}? They stay on file and you can reinstate them.`)}>
          Pause them
        </button>
      </>
    )
  } else if (d.status === 'suspended') {
    body = (
      <>
        <p className="crm-note">{name} is paused.</p>
        <button type="button" className="crm-btn is-good" disabled={!!busy} onClick={() => run('reinstate', `Reinstate ${name} as an affiliate?`)}>
          Reinstate
        </button>
      </>
    )
  } else if (d.status === 'rejected') {
    body = (
      <>
        <p className="crm-note">Not approved{d.decidedAt ? ` on ${dateTime(d.decidedAt)}` : ''}.</p>
        {d.decisionNote && <blockquote className="crm-aff-quote">{d.decisionNote}</blockquote>}
      </>
    )
  } else {
    body = (
      <>
        <p className="crm-note">{name} is still filling it in. You can act once they send it in.</p>
        {d.countersignAvailable && (
          <button type="button" className="crm-btn is-dark is-block" disabled={!!busy} onClick={countersign}>
            <Icon name="pencil" size={16} />
            {busy === 'countersign' ? 'Opening' : d.testMode ? 'Countersign (test)' : 'Countersign in DocuSeal'}
          </button>
        )}
      </>
    )
  }
  return (
    <section className="crm-panel crm-aff-decide" aria-label="What to do">
      {body}
      {err && <Failure error={err} />}
    </section>
  )
}

const PROMOTE_LABEL: Record<string, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook', website: 'Website', in_person: 'In person', email: 'Email', other: 'Other',
}

export function AffiliateDetail({ id }: { id: string }) {
  const { actor, back, meta } = useCrm()
  const { data: d, error, reload } = useApi<Detail>(`/api/crm/onboarding/${encodeURIComponent(id)}`)
  if (error) return <Failure error={error} retry={reload} />
  if (!d) return <Loading />
  const p = d.profile
  const str = (k: string) => (typeof p[k] === 'string' ? (p[k] as string) : '')
  const name = `${str('legalFirst')} ${str('legalLast')}`.trim() || d.member?.name || 'New applicant'
  const address = [str('line1'), str('line2'), [str('city'), str('state')].filter(Boolean).join(', '), str('zip')].filter(Boolean).join(', ')
  const promote = Array.isArray(p.promote) ? p.promote.map((k) => PROMOTE_LABEL[k] ?? k).join(', ') : ''
  const rows: [string, string][] = [
    ['Legal name', `${str('legalFirst')} ${str('legalLast')}`.trim()],
    ['Goes by', str('preferredName')],
    ['Email', str('email')],
    ['Phone', str('phone')],
    ['Address', address],
    ['Signing up as', str('kind') === 'business' ? `A business${str('businessName') ? `: ${str('businessName')}` : ''}` : str('kind') ? 'An individual' : ''],
    ['Website', str('website')],
    ['Instagram', str('instagram')],
    ['TikTok', str('tiktok')],
    ['YouTube', str('youtube')],
    ['Will promote on', promote],
    ['About their audience', str('promoteNote')],
  ].filter(([, v]) => v) as [string, string][]
  const s = d.steps
  const events = d.events.filter((e) => e.kind !== 'admin_viewed' || actor.role === 'admin')
  const whoDid = (a: string) =>
    a === 'stripe' ? 'Stripe' : a === 'docuseal' ? 'DocuSeal' : a.startsWith('member:') ? name : a.startsWith('person:') ? personName(meta, a.slice(7)) : 'BEASTY'
  return (
    <div className="crm-view">
      <a className="crm-back" href="#/affiliates" onClick={(e) => { e.preventDefault(); back('affiliates') }}>
        <Icon name="chevronLeft" size={20} stroke={2.2} />
        Affiliates
      </a>
      <header className="crm-lead-head is-person">
        <Avatar name={name} size={80} />
        <div className="crm-lead-id">
          <h1>{name}</h1>
          <p>
            <StatusPill status={d.status} />
            {d.submittedAt ? ` Sent in ${dateTime(d.submittedAt)}.` : ` Last saved ${ago(d.updatedAt)}.`}
            {d.member ? ` BEASTY member since ${dateTime(d.member.joinedAt)}.` : ''}
          </p>
        </div>
      </header>
      {d.testMode && <p className="crm-aff-notice is-test">Test mode. Payouts and signing here are pretend.</p>}

      <div className="crm-aff-grid">
        <div className="crm-aff-main">
          <Section title="Steps">
            <ul className="crm-group crm-aff-steps">
              <StepRow done={s.profile.complete} title="Their details">
                {s.profile.complete ? 'Name, contact, address and how they will promote BEASTY.' : `Still missing: ${Object.keys(s.profile.problems).length} ${Object.keys(s.profile.problems).length === 1 ? 'field' : 'fields'}.`}
              </StepRow>
              <StepRow done={s.payouts.complete} title="Payouts with Stripe">
                {!s.payouts.available
                  ? 'Opens once Stripe Connect is switched on.'
                  : s.payouts.complete
                    ? `Identity, tax details and bank account done${s.payouts.bankLast4 ? `, paid to the account ending ${s.payouts.bankLast4}` : ''}.`
                    : s.payouts.started
                      ? `Started. ID: ${CHECK[s.payouts.identity] ?? s.payouts.identity}. Tax: ${CHECK[s.payouts.tax] ?? s.payouts.tax}. Bank: ${CHECK[s.payouts.bank] ?? s.payouts.bank}.`
                      : 'Not started.'}
              </StepRow>
              <StepRow done={s.agreement.status === 'completed'} title="Affiliate agreement">
                {!s.agreement.available ? 'Opens once the DocuSeal agreement is set up.' : `${AGREEMENT[s.agreement.status] ?? s.agreement.status}${s.agreement.completedAt ? `, ${dateTime(s.agreement.completedAt)}` : ''}.`}
              </StepRow>
            </ul>
            {s.agreement.status === 'completed' && (
              <p className="crm-note is-quiet">{d.testMode ? 'Test mode: there is no real signed copy.' : 'The signed copy is in DocuSeal, with both signatures and its audit trail.'}</p>
            )}
          </Section>

          <Section title="Their details">
            {rows.length ? (
              <div className="crm-panel">
                <dl className="crm-dl">
                  {rows.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <Empty icon="user">Nothing filled in yet.</Empty>
            )}
            <p className="crm-note is-quiet">Social Security number, bank account and ID photo go straight to Stripe; BEASTY never sees or keeps them.</p>
          </Section>
        </div>

        <div className="crm-aff-side">
          {actor.role === 'admin' ? <Decide d={d} reload={reload} /> : <p className="crm-note is-quiet">Only an admin can countersign or approve.</p>}
          <Section title="History">
            <ol className="crm-timeline">
              {events.map((e, i) => (
                <li key={i} className="crm-tl is-system">
                  <div className="crm-tl-body">
                    {EVENT[e.kind] ?? e.kind.replace(/_/g, ' ')}
                    {typeof e.detail?.note === 'string' && e.detail.note ? `: “${e.detail.note}”` : ''}
                  </div>
                  <div className="crm-tl-meta">
                    {dateTime(e.created_at)}, {whoDid(e.actor)}
                  </div>
                </li>
              ))}
            </ol>
            {!events.length && <Empty icon="clock">Nothing yet.</Empty>}
          </Section>
        </div>
      </div>
      <p className="crm-note is-quiet">{plural(d.events.length, 'thing', 'things')} on the record. Every view by the team is logged too.</p>
    </div>
  )
}
