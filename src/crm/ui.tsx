/*
  The pieces every CRM screen is built from. The one that carries the look is
  the Tile: a business's own BEASTY tile inside a ring that fills as the
  business moves along, and glows once they are a customer, the way a paid
  tile glows on beastypages.com. The rest stays quiet: grouped lists, plain
  words, and buttons that are real tel:/sms:/mailto:/Instagram links.
*/
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from './api'
import type { Actor, Channels, Meta } from './api'
import { Icon } from './icons'
import type { IconName } from './icons'
import { fmtMoney, fmtPhone } from './model'
import { PROGRESS, STEPS, isClosed, isCustomer, stageName, stepOf } from './steps'

/* ------------------------------------------------------------- context */

export interface CrmCtx {
  meta: Meta
  actor: Actor
  reloadMeta(): void
  go(hash: string): void
  /** Back within the CRM when there is somewhere to go back to; otherwise to the fallback. */
  back(fallback: string): void
  /** Open the search. */
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

/** True while a media query matches; follows the window as it resizes. */
export function useMedia(query: string) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const f = () => setOn(m.matches)
    f()
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [query])
  return on
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

const clock = (t: number) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()

/** "today, 10:00 am", "tomorrow, 10:00 am", "yesterday, 4:15 pm", or "Sep 21, 10:08 am". */
export function whenLabel(t: number | null | undefined): string {
  if (!t) return '—'
  const day = (x: number) => {
    const d = new Date(x)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  const diff = Math.round((day(t) - day(Date.now())) / 86_400_000)
  const name = diff === 0 ? 'today' : diff === 1 ? 'tomorrow' : diff === -1 ? 'yesterday' : new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${name}, ${clock(t)}`
}

export const durationLabel = (ms: number | null | undefined) => {
  if (ms == null) return '—'
  const h = ms / 3_600_000
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))} min`
  if (h < 48) return `${Math.round(h)} hours`
  return `${Math.round(h / 24)} days`
}

export const pct = (v: number) => `${Math.round(v * 100)}%`
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

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

/* ---------------------------------------------------------- tiles, faces */

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

/**
 * A business: its BEASTY tile (or its initials) inside a ring that shows how
 * far along it is. Customers glow; closed businesses fade.
 */
export function Tile({ name, icon, stage, size = 48, badge }: { name: string; icon?: string | null; stage?: string; size?: number; badge?: number | null }) {
  const [broken, setBroken] = useState(false)
  const sw = size >= 80 ? 5 : size >= 44 ? 3 : 2.5
  const gap = size >= 80 ? 5 : size >= 40 ? 3 : 2
  const inset = sw + gap
  const box = size - sw
  const rx = box * 0.3
  const p = stage ? PROGRESS[stage] ?? 0 : 0
  const state = stage && isCustomer(stage) ? 'is-customer' : stage && isClosed(stage) ? 'is-closed' : ''
  const face = size - inset * 2
  /* The rounded square, drawn from 12 o'clock clockwise so the ring fills like a clock hand. */
  const o = sw / 2
  const e = o + box
  const ring = `M${size / 2} ${o}H${e - rx}A${rx} ${rx} 0 0 1 ${e} ${o + rx}V${e - rx}A${rx} ${rx} 0 0 1 ${e - rx} ${e}H${o + rx}A${rx} ${rx} 0 0 1 ${o} ${e - rx}V${o + rx}A${rx} ${rx} 0 0 1 ${o + rx} ${o}Z`
  return (
    <span className={`crm-tile ${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <path className="crm-ring-track" d={ring} strokeWidth={sw} />
        {p > 0 && <path className="crm-ring-fill" d={ring} strokeWidth={sw} pathLength={100} strokeDasharray={`${p * 100} 100`} />}
      </svg>
      {icon && !broken ? (
        <img className="crm-tile-face" src={`/icons/${icon}.webp`} alt="" loading="lazy" style={{ inset, width: face, height: face }} onError={() => setBroken(true)} />
      ) : (
        <span className={`crm-tile-face is-initials crm-hue-${hueOf(name)}`} style={{ inset, width: face, height: face, fontSize: Math.max(10, Math.round(face * 0.36)) }}>
          {initials(name)}
        </span>
      )}
      {!!badge && <span className="crm-tile-badge">{badge}</span>}
    </span>
  )
}

/** A person: their page's tile if they have one, else their initials, in a circle. */
export function Avatar({ name, icon, size = 28 }: { name: string; icon?: string | null; size?: number }) {
  const [broken, setBroken] = useState(false)
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.4)) }
  if (icon && !broken) return <img className="crm-avatar" src={`/icons/${icon}.webp`} alt="" loading="lazy" style={style} onError={() => setBroken(true)} />
  return (
    <span className={`crm-avatar is-initials crm-hue-${hueOf(name)}`} style={style} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/** A person, as a face and a name; their tile comes from meta.people. */
export function PersonChip({ id, name, size = 22 }: { id?: string | null; name: string; size?: number }) {
  const { meta } = useCrm()
  const icon = id ? meta.people.find((p) => p.id === id)?.icon ?? null : null
  return (
    <span className="crm-person">
      <Avatar name={name} icon={icon} size={size} />
      <span className="crm-person-name">{name}</span>
    </span>
  )
}

/* ------------------------------------------------------------ where it is */

const TONE: Record<string, string> = {
  new_lead: 'gray',
  need_contact_info: 'orange',
  ready_to_contact: 'blue',
  contacted: 'blue',
  replied: 'violet',
  interested: 'violet',
  meeting: 'violet',
  proposal_sent: 'pink',
  won: 'green',
  onboarding: 'green',
  active_customer: 'green',
  closed_lost: 'red',
}
export const stageTone = (stage: string) => TONE[stage] ?? 'gray'

/** Where a business is, in plain words. */
export function StagePill({ stage }: { stage: string }) {
  return <span className={`crm-stage is-${stageTone(stage)}`}>{stageName(stage)}</span>
}

/** The five steps, with the ones done filled in and the current one marked. */
export function StepTrack({ stage }: { stage: string }) {
  const at = stepOf(stage)
  const customer = isCustomer(stage)
  return (
    <ol className={`crm-steps${at === null ? ' is-closed' : ''}`} aria-label={at === null ? `Closed: ${stageName(stage)}` : `Step ${at + 1} of 5: ${STEPS[at]}`}>
      {STEPS.map((label, i) => {
        const state = at === null ? '' : customer || i < at ? 'is-done' : i === at ? 'is-now' : ''
        return (
          <li key={label} className={state} aria-current={state === 'is-now' ? 'step' : undefined}>
            <span className="crm-steps-bar" />
            <span className="crm-steps-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

/* -------------------------------------------------------------- contact */

export type ContactKind = 'CALL' | 'TEXT' | 'EMAIL' | 'INSTAGRAM_DM'

const dial = (d: string) => `${d.length === 10 ? '+1' : '+'}${d}`

export const hasReach = (c: Channels) => !!(c.phone || c.email || c.instagram)

/** The link for one way to reach them. */
export function reachLink(c: Channels, kind: ContactKind): { href: string; external: boolean } | null {
  if (kind === 'CALL' && c.phone) return { href: `tel:${dial(c.phone)}`, external: false }
  if (kind === 'TEXT' && c.phone) return { href: `sms:${dial(c.phone)}`, external: false }
  if (kind === 'EMAIL' && c.email) return { href: `mailto:${c.email}`, external: false }
  if (kind === 'INSTAGRAM_DM' && c.instagram) return { href: `https://www.instagram.com/${c.instagram}/`, external: true }
  return null
}

/** The best first way to reach a business: a call, then Instagram, then email. */
export const bestReach = (c: Channels): ContactKind | null => (c.phone ? 'CALL' : c.instagram ? 'INSTAGRAM_DM' : c.email ? 'EMAIL' : null)

export const REACH_LABEL: Record<ContactKind, string> = { CALL: 'Call', TEXT: 'Text', EMAIL: 'Email', INSTAGRAM_DM: 'DM' }
const REACH_ICON: Record<ContactKind, IconName> = { CALL: 'phone', TEXT: 'message', EMAIL: 'mail', INSTAGRAM_DM: 'instagram' }
const REACH_CLASS: Record<ContactKind, string> = { CALL: 'crm-act-call', TEXT: 'crm-act-text', EMAIL: 'crm-act-email', INSTAGRAM_DM: 'crm-act-ig' }

/** One reach button: a real link, which also tells the page which kind it was. */
export function ReachLink({ c, kind, onUse, className = '', children }: { c: Channels; kind: ContactKind; onUse?: (k: ContactKind) => void; className?: string; children?: ReactNode }) {
  const l = reachLink(c, kind)
  if (!l) return null
  const title =
    kind === 'CALL' ? `Call ${fmtPhone(c.phone)}` : kind === 'TEXT' ? `Text ${fmtPhone(c.phone)}` : kind === 'EMAIL' ? `Email ${c.email}` : `@${c.instagram} on Instagram`
  return (
    <a className={`crm-act ${REACH_CLASS[kind]} ${className}`} href={l.href} title={title} aria-label={title} onClick={() => onUse?.(kind)} {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <Icon name={REACH_ICON[kind]} size={18} stroke={2} />
      {children ?? <span>{REACH_LABEL[kind] === 'DM' ? 'Instagram' : REACH_LABEL[kind]}</span>}
    </a>
  )
}

/** Every way to reach them, side by side, like the buttons under a name in Contacts. */
export function ReachRow({ c, onUse }: { c: Channels; onUse?: (k: ContactKind) => void }) {
  if (!hasReach(c)) return null
  return (
    <div className="crm-reach">
      {(['CALL', 'TEXT', 'EMAIL', 'INSTAGRAM_DM'] as ContactKind[]).map((k) => (
        <ReachLink key={k} c={c} kind={k} onUse={onUse} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- blocks */

/** A number with what it means. Keeps .crm-stat-label/.crm-stat-value for the audits. */
export function Stat({ label, value, sub, onClick, tone }: { label: string; value: ReactNode; sub?: ReactNode; onClick?: () => void; tone?: 'good' | 'warn' }) {
  const body = (
    <>
      <span className="crm-stat-value">{value}</span>
      <span className="crm-stat-label">{label}</span>
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

/** A page's big condensed title, a line saying what the page is for, and its buttons. */
export function PageTitle({ title, sub, actions, count }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; count?: number | null }) {
  return (
    <header className="crm-title">
      <div className="crm-title-text">
        <h1>
          {title}
          {count != null && <span className="crm-title-count">{count}</span>}
        </h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div className="crm-title-actions">{actions}</div>}
    </header>
  )
}

/** A row of choices where one is on (a period, a view). */
export function Segmented({ value, options, onChange, label }: { value: string; options: readonly (readonly [string, string])[]; onChange: (v: string) => void; label: string }) {
  return (
    <div className="crm-seg" role="tablist" aria-label={label}>
      {options.map(([k, text]) => (
        <button type="button" key={k} role="tab" aria-selected={value === k} className={value === k ? 'is-on' : undefined} onClick={() => onChange(k)}>
          {text}
        </button>
      ))}
    </div>
  )
}

export const Loading = () => (
  <div className="crm-loading" role="status">
    <span className="crm-spinner" aria-hidden="true" />
    Loading
  </div>
)

export const Empty = ({ children, icon = 'inbox' }: { children: ReactNode; icon?: IconName }) => (
  <div className="crm-empty">
    <Icon name={icon} size={20} />
    <span>{children}</span>
  </div>
)

export const Failure = ({ error, retry }: { error: string; retry?: () => void }) => (
  <div className="crm-error" role="alert">
    <Icon name="alert" size={16} />
    <span>{error}</span>
    {retry && (
      <button type="button" onClick={retry}>
        Try again
      </button>
    )}
  </div>
)

export const personName = (meta: Meta, id: string | null | undefined) => (id ? meta.people.find((p) => p.id === id)?.name ?? '—' : '—')
