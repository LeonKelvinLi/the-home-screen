/*
  BARK POINTS IN THE CRM (server/bark.ts). On one affiliate's page: their balance, every credit (with a
  way to remove one, with a reason), the businesses they referred with a button to record each month the
  business pays, and their cash-out requests to mark paid or decline. On the Affiliates list: every
  open cash-out request, oldest first, since Schedule A gives BEASTY 15 days to pay one.

  Members' months are credited by Stripe on their own; businesses pay BEASTY outside Stripe, so the team
  records each month here and the rules (recruiting when it asked, initiation paid, months left) are the
  server's.
*/
import { useState } from 'react'
import { api } from './api'
import { dateTime, Empty, Section, ago, useApi } from './ui'
import { Icon } from './icons'

interface CrmBark {
  recruiter: 'none' | 'pending' | 'active' | 'paused' | 'cancelled'
  recruiterSince: number | null
  paperwork: string
  balance: { earned: number; cashedOut: number; available: number; owed: number }
  pointValue: number
  payoutDays: number
  pointsPerBusiness: number
  cashouts: { id: string; points: number; cents: number; status: 'requested' | 'paid' | 'declined'; requestedAt: number; decidedAt: number | null; note: string }[]
  ledger: { id: string; kind: 'user' | 'business'; who: string; month: number; points: number; status: 'earned' | 'void'; note: string; voidNote: string; at: number }[]
  businesses: { dealId: string; name: string; wonAt: number | null; months: number; of: number; blocked: string }[]
}

const RECRUITER: Record<CrmBark['recruiter'], string> = {
  none: 'Not a recruiter',
  pending: 'Recruiter checkout not paid yet',
  active: 'Recruiting',
  paused: 'Recruiting paused',
  cancelled: 'Recruiter upgrade cancelled',
}

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`

export function BarkPanel({ id, admin }: { id: string; admin: boolean }) {
  const { data, error } = useApi<CrmBark>(`/api/crm/onboarding/${encodeURIComponent(id)}/bark`)
  const [shown, setShown] = useState<CrmBark | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const d = shown ?? data
  if (error) return null
  if (!d) return null

  const post = async (key: string, path: string, body: unknown) => {
    setBusy(key)
    setErr(null)
    try {
      setShown(await api<CrmBark>(`/api/crm/onboarding/${encodeURIComponent(id)}/bark/${path}`, { method: 'POST', body }))
      setNote('')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(null)
    }
  }
  const open = d.cashouts.filter((c) => c.status === 'requested')
  const done = d.cashouts.filter((c) => c.status !== 'requested')
  const b = d.balance

  return (
    <Section title="BARK points">
      <div className="crm-panel crm-bark">
        <div className="crm-bark-head">
          <div>
            <strong className="crm-bark-n">{b.available}</strong> points to cash out <span className="crm-bark-usd">{usd(Math.round(b.available * d.pointValue * 100))}</span>
          </div>
          <span className={`crm-bark-status is-${d.recruiter}`}>{RECRUITER[d.recruiter]}</span>
        </div>
        <p className="crm-note is-quiet">
          {b.earned} earned · {b.cashedOut} cashed out{b.owed > 0 ? ` · ${b.owed} taken back after they were paid, off the next cash-out` : ''}
          {d.recruiterSince ? ` · recruiting since ${dateTime(d.recruiterSince)}` : ''}. Cash-outs need this packet approved
          {d.paperwork === 'approved' ? ' (it is).' : '.'}
        </p>

        {open.map((c) => (
          <div key={c.id} className="crm-bark-cashout">
            <p className="crm-note">
              <b>
                Cash-out asked for: {c.points} points, {usd(c.cents)}
              </b>{' '}
              on {dateTime(c.requestedAt)} ({ago(c.requestedAt)}). Pay it by direct deposit to the account on their signed packet within {d.payoutDays}{' '}
              days, then mark it paid.
            </p>
            {admin && (
              <>
                <div className="crm-bark-actions">
                  <button
                    type="button"
                    className="crm-btn is-good"
                    disabled={!!busy}
                    onClick={() => window.confirm(`Mark ${usd(c.cents)} as paid to them?`) && void post(`paid-${c.id}`, `cashouts/${c.id}`, { decision: 'paid', note })}
                  >
                    <Icon name="check" size={16} stroke={2.6} />
                    {busy === `paid-${c.id}` ? 'Saving' : 'Mark paid'}
                  </button>
                  <button
                    type="button"
                    className="crm-btn"
                    disabled={!!busy || !note.trim()}
                    onClick={() => void post(`declined-${c.id}`, `cashouts/${c.id}`, { decision: 'declined', note })}
                  >
                    {busy === `declined-${c.id}` ? 'Saving' : 'Decline'}
                  </button>
                </div>
                <label className="crm-field">
                  <span>Note (they see it if you decline)</span>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid by direct deposit, ref 1234" />
                </label>
              </>
            )}
          </div>
        ))}

        {d.businesses.length > 0 && (
          <>
            <h4 className="crm-bark-h">Businesses they referred</h4>
            <ul className="crm-bark-list">
              {d.businesses.map((x) => (
                <li key={x.dealId}>
                  <span className="crm-bark-what">
                    <strong>{x.name}</strong>
                    <small>
                      {x.months} of {x.of} paid months credited{x.wonAt ? `, signed ${dateTime(x.wonAt)}` : ''}
                      {x.blocked ? `. ${x.blocked}` : ''}
                    </small>
                  </span>
                  {admin && !x.blocked && (
                    <button
                      type="button"
                      className="crm-btn"
                      disabled={!!busy}
                      onClick={() =>
                        window.confirm(`${x.name} paid month ${x.months + 1}? This credits ${d.pointsPerBusiness} points.`) &&
                        void post(`biz-${x.dealId}`, 'business-month', { dealId: x.dealId })
                      }
                    >
                      {busy === `biz-${x.dealId}` ? 'Saving' : `Paid month ${x.months + 1}`}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <h4 className="crm-bark-h">Credits</h4>
        {d.ledger.length ? (
          <ul className="crm-bark-list">
            {d.ledger.map((r) => (
              <li key={r.id} className={r.status === 'void' ? 'is-void' : undefined}>
                <span className="crm-bark-what">
                  <strong>
                    +{r.points} · {r.kind === 'user' ? `${r.who || 'A member'}: ${r.note}` : r.note}
                  </strong>
                  <small>
                    {dateTime(r.at)}
                    {r.status === 'void' ? ` · removed: ${r.voidNote}` : ''}
                  </small>
                </span>
                {admin && r.status === 'earned' && (
                  <button
                    type="button"
                    className="crm-btn"
                    disabled={!!busy}
                    onClick={() => {
                      const why = window.prompt('Why are these points removed? (a refund, a mistake)')
                      if (why && why.trim()) void post(`void-${r.id}`, `points/${r.id}/void`, { note: why.trim() })
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty icon="clock">No points yet. They are credited each month a person or business they brought while recruiting pays.</Empty>
        )}

        {done.length > 0 && (
          <p className="crm-note is-quiet">
            Past cash-outs:{' '}
            {done
              .map((c) => `${c.points} points ${c.status === 'paid' ? `paid ${dateTime(c.decidedAt ?? c.requestedAt)}` : `declined (${c.note})`}`)
              .join('; ')}
            .
          </p>
        )}
        {err && <p className="crm-error">{err}</p>}
      </div>
    </Section>
  )
}

/** Every open cash-out request, for the top of the Affiliates list. */
export function OpenCashouts() {
  const { data } = useApi<{ open: { id: string; applicationId: string | null; name: string; points: number; cents: number; requestedAt: number }[] }>('/api/crm/bark/cashouts')
  if (!data?.open.length) return null
  return (
    <div className="crm-panel crm-bark-due">
      <strong>
        {data.open.length} cash-out {data.open.length === 1 ? 'request' : 'requests'} to pay
      </strong>
      <ul>
        {data.open.map((c) => (
          <li key={c.id}>
            {c.applicationId ? <a href={`#/affiliate/${c.applicationId}`}>{c.name}</a> : c.name}: {c.points} points, {usd(c.cents)}, asked {ago(c.requestedAt)}
          </li>
        ))}
      </ul>
    </div>
  )
}
