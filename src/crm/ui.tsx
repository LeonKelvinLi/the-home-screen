/*
  Small pieces every CRM view uses: data loading, avatars (the business's own
  tile where it has one), stage pills, contact buttons that are real
  tel:/sms:/mailto:/Instagram links, stat cards, money and time.
*/
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from './api'
import type { Actor, Channels, Meta } from './api'
import { Icon } from './icons'
import type { IconName } from './icons'
import { fmtMoney, fmtPhone, stageLabel, websiteStatusLabel } from './model'

/* ------------------------------------------------------------- context */

export interface CrmCtx {
  meta: Meta
  actor: Actor
  reloadMeta(): void
  go(hash: string): void
  /** Back within the CRM when there is somewhere to go back to; otherwise to the fallback. */
  back(fallback: string): void
  /** Open the ⌘K palette. */
  openSearch(): void
}

export const Crm = createContext<CrmCtx | null>(null)
export const useCrm = () => {
  const c = useContext(Crm)
  if (!c) throw new Error('CRM context missing')
  return c
}

/* -------------------------------------------------------------- loading */

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const seq = useRef(0)
  const load = useCallback(async () => {
    if (!path) return
    const n = ++seq.current
    setLoading(true)
    try {
      const d = await api<T>(path)
      if (n === seq.current) {
        setData(d)
        setError(null)
      }
    } catch (e) {
      if (n === seq.current) setError((e as Error).message)
    } finally {
      if (n === seq.current) setLoading(false)
    }
  }, [path])
  useEffect(() => {
    void load()
  }, [load])
  return { data, error, loading, reload: load }
}

/* -------------------------------------------------------------- format */

export const money = fmtMoney

export function ago(t: number | null | undefined): string {
  if (!t) return '—'
  const d = Date.now() - t
  const past = d >= 0
  const a = Math.abs(d)
  const m = Math.round(a / 60000)
  const s = m < 1 ? 'now' : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`
  return s === 'now' ? 'just now' : past ? `${s} ago` : `in ${s}`
}

export const dayLabel = (t: number | null | undefined) =>
  t ? new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: new Date(t).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }) : '—'

export const dateTime = (t: number | null | undefined) =>
  t ? new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'

export const durationLabel = (ms: number | null | undefined) => {
  if (ms == null) return '—'
  const h = ms / 3_600_000
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))}m`
  if (h < 48) return `${Math.round(h)}h`
  return `${Math.round(h / 24)}d`
}

export const pct = (v: number) => `${Math.round(v * 100)}%`

/** Local end of today, for "due today". */
export const endOfToday = () => {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/** A <input type="datetime-local"> value for a time, and back. */
export const toLocalInput = (t: number) => {
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
export const fromLocalInput = (v: string) => (v ? new Date(v).getTime() : NaN)

/* -------------------------------------------------------------- avatars */

const HUES = ['amber', 'blue', 'green', 'violet', 'pink', 'teal', 'orange', 'indigo']
const hueOf = (s: string) => {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return HUES[h % HUES.length]
}
export const initials = (name: string) =>
  name
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

/** A business shows its own BEASTY tile; a person, their page's tile or initials. */
export function Avatar({ name, icon, size = 28, kind = 'org' }: { name: string; icon?: string | null; size?: number; kind?: 'org' | 'person' }) {
  const [broken, setBroken] = useState(false)
  const style = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.38)) }
  if (icon && !broken) {
    return <img className={`crm-avatar is-${kind}`} src={`/icons/${icon}.webp`} alt="" loading="lazy" style={style} onError={() => setBroken(true)} />
  }
  return (
    <span className={`crm-avatar is-${kind} is-initials crm-hue-${hueOf(name)}`} style={style} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/** A person, as an avatar and a name; their tile comes from meta.people. */
export function PersonChip({ id, name, muted = false }: { id?: string | null; name: string; muted?: boolean }) {
  const { meta } = useCrm()
  const icon = id ? meta.people.find((p) => p.id === id)?.icon ?? null : null
  return (
    <span className={`crm-person${muted ? ' is-muted' : ''}`}>
      <Avatar name={name} icon={icon} size={20} kind="person" />
      <span>{name}</span>
    </span>
  )
}

/* -------------------------------------------------------------- pills */

const STAGE_TONE: Record<string, string> = {
  new_lead: 'gray',
  need_contact_info: 'amber',
  ready_to_contact: 'blue',
  contacted: 'sky',
  replied: 'teal',
  interested: 'violet',
  meeting: 'indigo',
  proposal_sent: 'pink',
  won: 'green',
  onboarding: 'green',
  active_customer: 'green',
  no_response: 'gray',
  not_interested: 'gray',
  bad_lead: 'gray',
  closed_lost: 'red',
}
export const stageTone = (stage: string) => STAGE_TONE[stage] ?? 'gray'

export function StagePill({ stage }: { stage: string }) {
  return (
    <span className={`crm-stage crm-tone-${stageTone(stage)} crm-stage-${stage}`}>
      <i className="crm-dot" aria-hidden="true" />
      {stageLabel(stage)}
    </span>
  )
}

export function WebsitePill({ status }: { status: string | null }) {
  if (!status) return null
  const tone = status === 'none' ? 'red' : status === 'has_site' ? 'green' : status === 'needs_work' ? 'violet' : 'amber'
  return (
    <span className={`crm-web crm-tone-${tone} crm-web-${status}`}>
      <Icon name="globe" size={12} />
      {websiteStatusLabel(status)}
    </span>
  )
}

/* -------------------------------------------------------------- contact */

export type ContactKind = 'CALL' | 'TEXT' | 'EMAIL' | 'INSTAGRAM_DM'

const dial = (d: string) => `${d.length === 10 ? '+1' : '+'}${d}`

/**
 * The four ways to reach a business, each a real link, or a clear "none".
 * onUse fires as the link opens, so the lead page can offer to log it.
 */
export function ContactActions({ c, compact = false, onUse }: { c: Channels; compact?: boolean; onUse?: (kind: ContactKind) => void }) {
  if (!c.phone && !c.email && !c.instagram) {
    return (
      <span className="crm-needs-contact">
        <Icon name="alert" size={13} />
        Needs contact info
      </span>
    )
  }
  const item = (cls: string, href: string, icon: IconName, label: string, title: string, kind: ContactKind, external = false) => (
    <a
      className={`crm-act ${cls}`}
      href={href}
      title={title}
      aria-label={title}
      onClick={() => onUse?.(kind)}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <Icon name={icon} size={compact ? 15 : 17} />
      {!compact && <span>{label}</span>}
    </a>
  )
  return (
    <span className={`crm-actions${compact ? ' is-compact' : ''}`}>
      {c.phone && item('crm-act-call', `tel:${dial(c.phone)}`, 'phone', 'Call', `Call ${fmtPhone(c.phone)}`, 'CALL')}
      {c.phone && item('crm-act-text', `sms:${dial(c.phone)}`, 'message', 'Text', `Text ${fmtPhone(c.phone)}`, 'TEXT')}
      {c.email && item('crm-act-email', `mailto:${c.email}`, 'mail', 'Email', c.email, 'EMAIL')}
      {c.instagram && item('crm-act-ig', `https://www.instagram.com/${c.instagram}/`, 'instagram', 'Instagram', `@${c.instagram} on Instagram`, 'INSTAGRAM_DM', true)}
    </span>
  )
}

/* -------------------------------------------------------------- blocks */

export function Stat({
  label,
  value,
  sub,
  onClick,
  tone,
  icon,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  onClick?: () => void
  tone?: 'warn' | 'good'
  icon?: IconName
}) {
  const body = (
    <>
      <span className="crm-stat-top">
        <span className="crm-stat-label">{label}</span>
        {icon && (
          <span className="crm-stat-icon">
            <Icon name={icon} size={15} />
          </span>
        )}
      </span>
      <span className="crm-stat-value">{value}</span>
      {sub && <span className="crm-stat-sub">{sub}</span>}
    </>
  )
  return onClick ? (
    <button type="button" className={`crm-stat is-link${tone ? ` is-${tone}` : ''}`} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={`crm-stat${tone ? ` is-${tone}` : ''}`}>{body}</div>
  )
}

export function Section({ title, action, className, children }: { title: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={`crm-section${className ? ` ${className}` : ''}`}>
      <div className="crm-section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function PageHead({ title, sub, actions, above }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; above?: ReactNode }) {
  return (
    <header className="crm-page-head">
      {above}
      <div className="crm-page-row">
        <div className="crm-page-title">
          <h1 className="crm-h1">{title}</h1>
          {sub && <p className="crm-page-sub">{sub}</p>}
        </div>
        {actions && <div className="crm-page-actions">{actions}</div>}
      </div>
    </header>
  )
}

export const Loading = () => (
  <div className="crm-loading" role="status">
    <span className="crm-spinner" aria-hidden="true" />
    Loading…
  </div>
)
export const Empty = ({ children, icon = 'inbox' }: { children: ReactNode; icon?: IconName }) => (
  <div className="crm-empty">
    <span className="crm-empty-icon">
      <Icon name={icon} size={18} />
    </span>
    <span>{children}</span>
  </div>
)
export const Failure = ({ error, retry }: { error: string; retry?: () => void }) => (
  <div className="crm-error" role="alert">
    <Icon name="alert" size={15} />
    <span>{error}</span>
    {retry && (
      <button type="button" onClick={retry}>
        Try again
      </button>
    )}
  </div>
)

export const personName = (meta: Meta, id: string | null | undefined) => (id ? meta.people.find((p) => p.id === id)?.name ?? '—' : '—')
