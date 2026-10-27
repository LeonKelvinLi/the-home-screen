/*
  Affiliates — the team's side of /join.

  Glenn invites someone, they fill in their details, then fill in and sign one
  DocuSeal packet (W-9, direct deposit, a photo of their ID and the agreement),
  then send it in. This is where he sees where each person is, countersigns,
  and approves (or asks for a change). He pays affiliates himself from the
  forms in the signed packet; the Stripe Connect payout step shows here only
  when AFFILIATE_PAYOUTS switches it on (server/onboarding.ts).

  Nothing sensitive shows here because nothing sensitive is kept: the Social
  Security number, bank account and ID photo stay in DocuSeal (or with Stripe,
  when payouts are on, which shows only its yes/no answers and the last four
  digits of the account).
*/
import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api } from './api'
import { Avatar, dateTime, Empty, Failure, Loading, PageTitle, Section, ago, personName, plural, useApi, useCrm } from './ui'
import { Icon } from './icons'
import { onboardingPrefill } from '../../shared/onboarding-prefill'
import { AffiliateTermsPanel } from './affiliate-terms'
import { BarkPanel, OpenCashouts } from './bark'
import './affiliate-prefill.css'

type EmailStatus = 'accepted' | 'failed' | 'not_configured'
type Mode = 'off' | 'mock' | 'live' | 'manual'
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
    agreement: { available: boolean; mode: Mode; status: string; affiliateSigned: boolean; countersigned: boolean; completedAt: number | null }
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
  manualPacket: {
    revision: number
    submissionUrl: string
    affiliateUrl: string
    companyUrl: string
    approvedTemplateUrl: string | null
    /** Signed through BEASTY's shared DocuSeal forms link, emailed to them (server/onboarding.ts issueFormsLink). */
    formsLink?: boolean
    formsLinkSentAt?: number | null
    verifiedBy: string | null
    checkedAt: number | null
    evidence: Partial<Record<'affiliateSigned' | 'companySigned' | 'taxComplete' | 'bankComplete' | 'idUploaded' | 'auditReviewed', boolean>>
  } | null
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
  requested: 'Prepare their DocuSeal packet',
  pending_review: 'They reported completion; check DocuSeal',
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
  forms_link_sent: 'Emailed their DocuSeal forms link',
  opened_by_recruiter: 'Paid the recruiter upgrade, which opened their paperwork',
  profile_completed: 'Finished their details',
  payouts_started: 'Started payout setup with Stripe',
  payouts_completed: 'Stripe finished their payout setup',
  agreement_sent: 'Agreement ready to sign',
  agreement_signed: 'Signed the agreement',
  agreement_countersigned: 'Agreement countersigned',
  agreement_declined: 'Declined the agreement',
  agreement_expired: 'Agreement expired',
  packet_requested: 'Requested their forms',
  packet_linked: 'DocuSeal request attached by the admin',
  packet_review_requested: 'Reported finishing; requested a DocuSeal review',
  packet_verified: 'Packet checked in DocuSeal by the admin',
  submitted: 'Sent it in for review',
  resubmitted: 'Sent it in again',
  approved: 'Approved',
  changes_requested: 'Asked for a change',
  rejected: 'Not approved',
  suspended: 'Paused',
  reinstated: 'Reinstated',
  admin_viewed: 'Opened by the team',
  terms_changed: 'Money terms changed for them',
}

function StatusPill({ status }: { status: Status }) {
  const s = STATUS[status] ?? { label: status, tone: 'gray' }
  return <span className={`crm-stage is-${s.tone}`}>{s.label}</span>
}

/** One line of where each of the three steps stands. */
function progressLine(a: AppRow, payoutsOn: boolean) {
  const parts = [
    a.profileComplete ? 'Details done' : 'Details not finished',
    payoutsOn && (a.payouts === 'complete' ? 'payouts set up' : a.payouts === 'started' ? 'payouts started' : 'no payouts yet'),
    a.agreement === 'requested' ? 'forms requested' : a.agreement === 'pending_review' ? 'packet needs your review' : a.agreement === 'completed' ? 'agreement signed by both' : a.agreement === 'pending_countersignature' ? 'agreement needs your signature' : a.agreement === 'pending_signature' ? 'agreement not signed' : 'no agreement yet',
  ].filter(Boolean)
  return parts.join(', ')
}

function ProviderNote({ providers }: { providers: ListData['providers'] }) {
  if (providers.payouts === 'mock' || providers.signing === 'mock')
    return <p className="crm-aff-notice is-test">Test mode. Payouts and signing are pretend here.</p>
  const off: string[] = []
  /* Payouts off is the plan for now, not something waiting: Glenn pays from the forms. */
  if (providers.signing === 'off') off.push('the forms and agreement open once the DocuSeal packet is set up')
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
function LinkBox({ link, emailStatus, onDone }: { link: string; emailStatus?: EmailStatus; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="crm-aff-link" role="status">
      <strong>{emailStatus === 'accepted' ? 'Invite ready. Email accepted for delivery.' : 'Invite ready. Email was not sent; copy the link below.'}</strong>
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
  const [emailStatus, setEmailStatus] = useState<EmailStatus>()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const r = await api<{ link: string; emailStatus: EmailStatus }>('/api/crm/onboarding/invites', { method: 'POST', body: { name, email, note } })
      setLink(r.link)
      setEmailStatus(r.emailStatus)
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
  if (link) return <LinkBox link={link} emailStatus={emailStatus} onDone={() => setLink(null)} />
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
  const [fresh, setFresh] = useState<{ id: string; link: string; emailStatus?: EmailStatus } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const open = invites.filter((i) => i.state !== 'redeemed')
  if (!open.length) return null
  const act = async (i: InviteRow, what: 'resend' | 'revoke') => {
    if (what === 'revoke' && !window.confirm(`Cancel the invite for ${i.email}? Their link stops working.`)) return
    setErr(null)
    try {
      const r = await api<{ link?: string; emailStatus?: EmailStatus }>(`/api/crm/onboarding/invites/${i.id}/${what}`, { method: 'POST' })
      if (r.link) setFresh({ id: i.id, link: r.link, emailStatus: r.emailStatus })
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
                  {i.state === 'open' ? `Created ${ago(i.created_at)}, works until ${dateTime(i.expires_at)}` : i.state === 'expired' ? 'Expired' : 'Cancelled'}
                  {i.sent_count > 1 ? `, link renewed ${i.sent_count - 1} times` : ''}
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
                <LinkBox link={fresh.link} emailStatus={fresh.emailStatus} onDone={() => setFresh(null)} />
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
        actions={
          <>
            <a className="crm-btn" href="#/affiliate-terms">
              Money terms
            </a>
            {admin && (
              <button type="button" className={`crm-btn${inviting ? '' : ' is-primary'}`} onClick={() => setInviting((v) => !v)} aria-expanded={inviting}>
                <Icon name={inviting ? 'x' : 'plus'} size={16} stroke={2.4} />
                {inviting ? 'Close' : 'Invite someone'}
              </button>
            )}
          </>
        }
      />
      {inviting && admin && <InviteForm onSent={reload} />}
      {data && <ProviderNote providers={data.providers} />}
      <OpenCashouts />
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
                      <span className="crm-row-meta">{progressLine(a, data.providers.payouts !== 'off')}</span>
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
            <Empty icon="users">{data.total ? 'Nobody matches that.' : 'No applications yet.'}</Empty>
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
        {children && <span>{children}</span>}
      </span>
    </li>
  )
}

const CHECK: Record<string, string> = { complete: 'Done', pending: 'Stripe is checking', needed: 'Not yet' }

const REVIEW_CHECKS = [
  ['affiliateSigned', 'The affiliate signed their own fields'],
  ['taxComplete', 'The W-9 is completed and signed'],
  ['bankComplete', 'The bank authorization is completed and signed'],
  ['idUploaded', 'The required ID image is uploaded and legible'],
  ['auditReviewed', 'The DocuSeal audit trail matches this applicant and request'],
  ['companySigned', 'BEASTY has countersigned (check after signing in DocuSeal)'],
] as const
type ReviewKey = typeof REVIEW_CHECKS[number][0]

function ManualPacket({ d, packet, reload }: { d: Detail; packet: NonNullable<Detail['manualPacket']>; reload: () => void }) {
  const [submissionUrl, setSubmissionUrl] = useState(packet.submissionUrl)
  const [affiliateUrl, setAffiliateUrl] = useState(packet.affiliateUrl)
  const [companyUrl, setCompanyUrl] = useState(packet.companyUrl)
  const [confirmed, setConfirmed] = useState(false)
  const [replaceVerified, setReplaceVerified] = useState(false)
  const [checks, setChecks] = useState(packet.evidence)
  const [found, setFound] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const closed = ['approved', 'rejected', 'suspended'].includes(d.status)
  const prefill = onboardingPrefill(Object.fromEntries(Object.entries(d.profile).filter((entry): entry is [string, string] => typeof entry[1] === 'string')))
  const copyPrefill = async (name: string, value: string) => {
    setError(''); setNotice('')
    try { await navigator.clipboard.writeText(value); setNotice(`${name} copied. Paste it into this applicant’s DocuSeal request.`) }
    catch { setError('Copy was unavailable. Select the displayed value and copy it.') }
  }
  useEffect(() => {
    setSubmissionUrl(packet.submissionUrl); setAffiliateUrl(packet.affiliateUrl); setCompanyUrl(packet.companyUrl)
    setConfirmed(false); setReplaceVerified(false); setChecks(packet.evidence); setFound('')
  }, [packet.revision, packet.submissionUrl, packet.affiliateUrl, packet.companyUrl, packet.evidence])

  const save = async (path: string, body: Record<string, unknown>) => {
    setBusy(true); setError(''); setNotice('')
    try {
      const r = await api<{ emailStatus?: EmailStatus }>(`/api/crm/onboarding/${d.id}${path}`, { method: 'POST', body: { ...body, revision: packet.revision } })
      setNotice(r.emailStatus === 'accepted' ? 'Saved. Notification email accepted for delivery.' : r.emailStatus ? 'Saved. Email was not sent; the applicant can still open their dashboard.' : 'Saved.')
      reload()
    } catch (e) {
      setError((e as Error).message)
    } finally { setBusy(false) }
  }

  return <Section title="DocuSeal packet">
    <div className="crm-aff-manual">
      {!packet.formsLink && <details className="crm-aff-prefill">
        <summary>Prepare saved details for this applicant</summary>
        {['ID Legal Name', 'Affiliate Legal Name', 'Taxpayer Legal Name', 'Business Name', 'Street Address', 'City State ZIP'].filter(name => prefill[name]).map(name => <div className="crm-aff-prefill-row" key={name}>
          <div><b>{name}</b><span>{prefill[name]}</span></div>
          <button className="crm-btn" disabled={busy} onClick={() => void copyPrefill(name, prefill[name])}>Copy {name.toLowerCase()}</button>
        </div>)}
      </details>}
      {packet.formsLink ? (!closed && !d.steps.agreement.affiliateSigned && <form className="crm-aff-manual" onSubmit={(e) => {
        e.preventDefault()
        void save('/packet/submission', { submissionUrl: found })
      }}>
        <p className="crm-note">
          {packet.formsLinkSentAt ? `${dateTime(packet.formsLinkSentAt)}: ` : ''}BEASTY’s shared DocuSeal forms link went to <strong>{String(d.profile.email || 'them')}</strong>.
        </p>
        <label className="crm-field"><span>{packet.submissionUrl ? 'A different submission (only if the one below is wrong)' : 'Their DocuSeal submission address'}</span><input type="url" required value={found} onChange={e=>setFound(e.target.value)} placeholder="https://docuseal.com/submissions/…" /></label>
        <button className="crm-btn is-dark" disabled={busy || !found.trim()}>{packet.submissionUrl ? 'Replace submission' : 'Attach their submission'}</button>
      </form>) : !packet.approvedTemplateUrl ? <p className="crm-aff-notice">The agreement needs Glenn and Leon’s approved terms. Signing links stay locked until the approved template is configured.</p> : (
        <>
          <a className="crm-btn" href={packet.approvedTemplateUrl} target="_blank" rel="noopener noreferrer">Open approved template in DocuSeal</a>
          {!closed && <form className="crm-aff-manual" onSubmit={(e) => {
            e.preventDefault()
            void save('/packet', { submissionUrl, affiliateUrl, companyUrl, templateVersion: packet.approvedTemplateUrl!.split('/').pop(), termsApproved: confirmed, recipientConfirmed: confirmed, replaceVerified })
          }}>
            <label className="crm-field"><span>DocuSeal request dashboard URL</span><input type="url" required value={submissionUrl} onChange={e=>setSubmissionUrl(e.target.value)} placeholder="https://docuseal.com/submissions/…" /></label>
            <label className="crm-field"><span>Affiliate’s private signing link</span><input type="url" required value={affiliateUrl} onChange={e=>setAffiliateUrl(e.target.value)} placeholder="https://docuseal.com/s/…" /></label>
            <label className="crm-field"><span>BEASTY’s private signing link (optional)</span><input type="url" value={companyUrl} onChange={e=>setCompanyUrl(e.target.value)} placeholder="https://docuseal.com/s/…" /></label>
            <label className="crm-aff-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} /><span>I checked the approved terms, this applicant’s recipient details, both signer roles, and the W-9, bank and ID fields.</span></label>
            {d.steps.agreement.affiliateSigned && <label className="crm-aff-check"><input type="checkbox" checked={replaceVerified} onChange={e=>setReplaceVerified(e.target.checked)} /><span>Replacing this packet requires new signatures and review before approval.</span></label>}
            <button className="crm-btn is-dark" disabled={busy || !confirmed || !d.steps.profile.complete || (d.steps.agreement.affiliateSigned && !replaceVerified)}>{packet.submissionUrl ? 'Replace signing request' : 'Attach signing request'}</button>
          </form>}
        </>
      )}
      {packet.submissionUrl && <>
        <a className="crm-btn" href={packet.submissionUrl} target="_blank" rel="noopener noreferrer">Open this request in DocuSeal</a>
        {REVIEW_CHECKS.map(([key,label])=><label className="crm-aff-check" key={key}>
          <input type="checkbox" checked={!!checks[key]} disabled={closed || busy || (key==='companySigned' && !!packet.evidence.companySigned)} onChange={e=>setChecks({...checks,[key as ReviewKey]:e.target.checked})} />
          <span>{label}</span>
        </label>)}
        {!closed && <button className="crm-btn is-dark" disabled={busy || REVIEW_CHECKS.slice(0,5).some(([k])=>!checks[k])} onClick={()=>void save('/packet/verify',{...checks,companySigned:!!checks.companySigned})}>Record DocuSeal review</button>}
        {packet.checkedAt && <p className="crm-note is-quiet">Admin review recorded {dateTime(packet.checkedAt)}. {packet.evidence.companySigned ? 'Both signatures checked.' : 'BEASTY’s countersignature still needs checking.'}</p>}
      </>}
      {notice && <p className="crm-aff-notice" role="status">{notice}</p>}
      {error && <p className="crm-error" role="alert">{error}</p>}
    </div>
  </Section>
}

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
            ? `${name} finished every step.`
            : d.countersignAvailable
              ? `${name} signed the agreement.`
              : !d.steps.agreement.available
                ? `${name} sent in their details.`
                : `${name} sent it in.`}
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
        <p className="crm-note">You asked {name} to change something.</p>
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
        <p className="crm-note">{name} is still filling it in.</p>
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
                {s.profile.complete ? null : `Still missing: ${Object.keys(s.profile.problems).length} ${Object.keys(s.profile.problems).length === 1 ? 'field' : 'fields'}.`}
              </StepRow>
              {s.payouts.available && (
              <StepRow done={s.payouts.complete} title="Payouts with Stripe">
                {s.payouts.complete
                    ? `Identity, tax details and bank account done${s.payouts.bankLast4 ? `, paid to the account ending ${s.payouts.bankLast4}` : ''}.`
                    : s.payouts.started
                      ? `Started. ID: ${CHECK[s.payouts.identity] ?? s.payouts.identity}. Tax: ${CHECK[s.payouts.tax] ?? s.payouts.tax}. Bank: ${CHECK[s.payouts.bank] ?? s.payouts.bank}.`
                      : 'Not started.'}
              </StepRow>
              )}
              <StepRow done={s.agreement.status === 'completed'} title={s.payouts.available ? 'Affiliate agreement' : 'Forms & agreement'}>
                {!s.agreement.available ? 'Opens once the DocuSeal packet is set up.' : `${AGREEMENT[s.agreement.status] ?? s.agreement.status}${s.agreement.completedAt ? `, ${dateTime(s.agreement.completedAt)}` : ''}.`}
              </StepRow>
            </ul>
          </Section>

          {d.manualPacket && <ManualPacket d={d} packet={d.manualPacket} reload={reload} />}
          <AffiliateTermsPanel id={d.id} admin={actor.role === 'admin'} />
          <BarkPanel id={d.id} admin={actor.role === 'admin'} />

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
          </Section>
        </div>

        <div className="crm-aff-side">
          {actor.role === 'admin' && <Decide d={d} reload={reload} />}
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
      <p className="crm-note is-quiet">{plural(d.events.length, 'thing', 'things')} on the record.</p>
    </div>
  )
}
