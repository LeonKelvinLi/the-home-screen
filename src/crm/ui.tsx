/*
  Small pieces every CRM view uses: data loading, the stage pill, contact
  buttons that are real tel:/sms:/mailto:/Instagram links, money and time.
*/
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from './api'
import type { Actor, Channels, Meta } from './api'
import { fmtMoney, fmtPhone, stageLabel, stageOf, websiteStatusLabel } from './model'

/* ------------------------------------------------------------- context */

export interface CrmCtx {
  meta: Meta
  actor: Actor
  reloadMeta(): void
  go(hash: string): void
  /** Back within the CRM when there is somewhere to go back to; otherwise to the fallback. */
  back(fallback: string): void
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

/* -------------------------------------------------------------- pieces */

export function StagePill({ stage }: { stage: string }) {
  const g = stageOf(stage)?.group ?? 'open'
  return <span className={`crm-stage crm-stage-${g} crm-stage-${stage}`}>{stageLabel(stage)}</span>
}

export function WebsitePill({ status }: { status: string | null }) {
  if (!status) return null
  return <span className={`crm-web crm-web-${status}`}>{websiteStatusLabel(status)}</span>
}

export type ContactKind = 'CALL' | 'TEXT' | 'EMAIL' | 'INSTAGRAM_DM'

/**
 * The four ways to reach a business, each a real link, or a clear "none".
 * onUse fires as the link opens, so the lead page can offer to log it.
 */
export function ContactActions({ c, compact = false, onUse }: { c: Channels; compact?: boolean; onUse?: (kind: ContactKind) => void }) {
  if (!c.phone && !c.email && !c.instagram) return <span className="crm-needs-contact">Needs contact info</span>
  return (
    <span className={`crm-actions${compact ? ' is-compact' : ''}`}>
      {c.phone && (
        <>
          <a className="crm-act crm-act-call" href={`tel:${c.phone.length === 10 ? '+1' : '+'}${c.phone}`} title={`Call ${fmtPhone(c.phone)}`} onClick={() => onUse?.('CALL')}>
            Call
          </a>
          <a className="crm-act crm-act-text" href={`sms:${c.phone.length === 10 ? '+1' : '+'}${c.phone}`} title={`Text ${fmtPhone(c.phone)}`} onClick={() => onUse?.('TEXT')}>
            Text
          </a>
        </>
      )}
      {c.email && (
        <a className="crm-act crm-act-email" href={`mailto:${c.email}`} title={c.email} onClick={() => onUse?.('EMAIL')}>
          Email
        </a>
      )}
      {c.instagram && (
        <a className="crm-act crm-act-ig" href={`https://www.instagram.com/${c.instagram}/`} target="_blank" rel="noreferrer" title={`@${c.instagram}`} onClick={() => onUse?.('INSTAGRAM_DM')}>
          {compact ? 'IG' : 'Instagram'}
        </a>
      )}
    </span>
  )
}

export function Stat({ label, value, sub, onClick, tone }: { label: string; value: ReactNode; sub?: ReactNode; onClick?: () => void; tone?: 'warn' | 'good' }) {
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

export const Loading = () => <div className="crm-loading">Loading…</div>
export const Empty = ({ children }: { children: ReactNode }) => <div className="crm-empty">{children}</div>
export const Failure = ({ error, retry }: { error: string; retry?: () => void }) => (
  <div className="crm-error">
    {error}
    {retry && (
      <button type="button" onClick={retry}>
        Try again
      </button>
    )}
  </div>
)

export const personName = (meta: Meta, id: string | null | undefined) => (id ? meta.people.find((p) => p.id === id)?.name ?? '—' : '—')
