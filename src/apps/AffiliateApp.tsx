import { useCallback, useEffect, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import type { ShellApi } from '../ios/Device'
import { useGate } from '../lib/gate'
import { shareOrCopy } from '../lib/share'
import {
  WINDOW_TABS,
  dateOf,
  fetchAffiliate,
  fetchBark,
  requestCashout,
  type Bark,
  money,
  pct,
  when,
  type Affiliate,
  type Bucket,
  type WindowKey,
} from '../lib/affiliate'

/*
  THE AFFILIATE DASHBOARD. Glenn's "user/affiliate dashboard" for the meeting of
  the week of 29 September 2026, opened from Profile: what a member has brought
  to BEASTY, people and businesses, and how their links perform.

  Every figure comes from /api/affiliate/me (server/affiliate.ts). What BEASTY
  does not pay yet is shown as not paying yet, never as a made-up amount; the
  definitions are at the bottom of the page and in docs/AFFILIATE.md.
*/

type Metric = 'clicks' | 'joined' | 'qualified' | 'businesses'
const METRICS: { key: Metric; label: string; title: string }[] = [
  { key: 'clicks', label: 'Clicks', title: 'Link clicks' },
  { key: 'joined', label: 'Joined', title: 'People who joined' },
  { key: 'qualified', label: 'Active', title: 'People who became active' },
  { key: 'businesses', label: 'Businesses', title: 'Businesses referred' },
]

export function AffiliateApp({ api }: { api: ShellApi }) {
  const { account, loading: signingIn } = useGate()
  const [data, setData] = useState<Affiliate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [win, setWin] = useState<WindowKey>('30d')
  const [metric, setMetric] = useState<Metric>('clicks')

  const load = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      setData(await fetchAffiliate())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (account) void load()
  }, [account, load])

  return (
    <AppChrome title="Affiliate dashboard" backLabel="Profile" onBack={() => api.openApp('sys.profile')}>
      <div className="aff">
        {!account ? (
          signingIn ? (
            <Skeleton />
          ) : (
            <div className="aff-empty-page">
              <h2>Your affiliate dashboard</h2>
              <button className="btn-primary" onClick={() => api.openApp('sys.account')}>
                Sign in
              </button>
            </div>
          )
        ) : error && !data ? (
          <div className="aff-empty-page" role="alert">
            <h2>Your dashboard did not load</h2>
            <p>{error}</p>
            <button className="btn-secondary" onClick={() => void load()} disabled={busy}>
              {busy ? 'Trying again…' : 'Try again'}
            </button>
          </div>
        ) : !data ? (
          <Skeleton />
        ) : (
          <Dashboard data={data} win={win} setWin={setWin} metric={metric} setMetric={setMetric} api={api} />
        )}
      </div>
    </AppChrome>
  )
}

function Skeleton() {
  return (
    <div className="aff-skeleton" aria-busy="true" aria-label="Loading your dashboard">
      <div className="aff-sk aff-sk-hero" />
      <div className="aff-sk-row">
        <div className="aff-sk" />
        <div className="aff-sk" />
        <div className="aff-sk" />
        <div className="aff-sk" />
      </div>
      <div className="aff-sk aff-sk-chart" />
    </div>
  )
}

function Dashboard({
  data,
  win,
  setWin,
  metric,
  setMetric,
  api,
}: {
  data: Affiliate
  win: WindowKey
  setWin: (w: WindowKey) => void
  metric: Metric
  setMetric: (m: Metric) => void
  api: ShellApi
}) {
  const w = data.windows[win]
  const life = data.lifetime
  const brandNew = life.users === 0 && life.businesses === 0 && life.clicks === 0
  const m = METRICS.find((x) => x.key === metric)!

  return (
    <>
      {/* ---- overview ---- */}
      <header className="aff-hero">
        <p className="aff-kicker">
          {data.affiliate.status} affiliate · since {dateOf(data.affiliate.since)}
        </p>
        <h2 className="aff-hero-line">
          {brandNew ? (
            'Share your link to start bringing people to BEASTY.'
          ) : (
            <>
              You have brought <b>{life.users}</b> {life.users === 1 ? 'person' : 'people'} and <b>{life.businesses}</b>{' '}
              {life.businesses === 1 ? 'business' : 'businesses'} to BEASTY.
            </>
          )}
        </h2>
        <div className="aff-hero-stats">
          <span>
            <b>{life.conversions}</b> conversions
          </span>
          <span>
            <b>{life.clicks}</b> link clicks
          </span>
          <span>
            <b>{data.rewards.tickets.earned}</b> raffle {data.rewards.tickets.earned === 1 ? 'ticket' : 'tickets'}
          </span>
          <span>
            <b>{money(data.foundation.monthlyCents)}</b> a month for the foundation
          </span>
        </div>
      </header>

      {/* ---- BARK points: what recruiting has earned, and cashing it out ---- */}
      <BarkPoints api={api} />

      {/* ---- performance ---- */}
      <div className="aff-seg" role="tablist" aria-label="Time range">
        {WINDOW_TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={win === t.key} className={win === t.key ? 'on' : ''} onClick={() => setWin(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="aff-kpis">
        <Kpi label="People joined" value={w.users.joined} sub={`${w.users.qualified} became active`} />
        <Kpi label="Businesses referred" value={w.businesses.referred} sub={`${w.businesses.wonInWindow} signed`} />
        <Kpi label="Link clicks" value={w.clicks.total} sub={`${w.clicks.user} friend · ${w.clicks.business} business`} />
        <Kpi label="Conversions" value={w.conversions} sub="active people + signed businesses" />
        <Kpi label="Sign-up rate" value={pct(w.userConversion)} sub="of friend-link clicks" />
        <Kpi label="Business win rate" value={pct(w.businessConversion)} sub="of businesses referred" />
        <Kpi label="Waiting" value={life.pendingUsers + life.pendingBusinesses} sub={`${life.pendingUsers} not active yet · ${life.pendingBusinesses} in progress`} />
        <Kpi
          label="Rewards earned"
          value={data.rewards.tickets.earned}
          sub={data.rewards.discountDollars > 0 ? `tickets · $${data.rewards.discountDollars} off` : 'raffle tickets'}
        />
      </div>

      <section className="aff-card">
        <div className="aff-card-head">
          <h3>{m.title}</h3>
          <span className="aff-card-sub">{WINDOW_TABS.find((t) => t.key === win)!.label}</span>
        </div>
        <div className="aff-seg aff-seg-small" role="tablist" aria-label="What to chart">
          {METRICS.map((x) => (
            <button key={x.key} role="tab" aria-selected={metric === x.key} className={metric === x.key ? 'on' : ''} onClick={() => setMetric(x.key)}>
              {x.label}
            </button>
          ))}
        </div>
        <Columns buckets={w.series} metric={metric} title={m.title} />
      </section>

      {/* ---- share ---- */}
      <Share data={data} />

      {/* ---- businesses ---- */}
      <section className="aff-section">
        <h3 className="prof-h">Businesses you referred</h3>
        {data.businesses.length === 0 ? (
          <p className="aff-empty">None yet.</p>
        ) : (
          <ul className="aff-list">
            {data.businesses.map((b, i) => (
              <li key={`${b.name}-${i}`} className="aff-row">
                <div className="aff-row-main">
                  <span className="aff-row-title">{b.name}</span>
                  <span className="aff-row-sub">
                    {[b.city, `referred ${dateOf(b.referredAt)}`].filter(Boolean).join(' · ')}
                  </span>
                  <span className="aff-row-sub">
                    {b.page}
                    {b.listing ? ` · ${b.listing}` : ''}
                  </span>
                </div>
                <span className={`aff-chip aff-chip-${b.bucket}`}>{b.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- people ---- */}
      <section className="aff-section">
        <h3 className="prof-h">People you brought</h3>
        {data.users.length === 0 ? (
          <p className="aff-empty">Nobody yet.</p>
        ) : (
          <ul className="aff-list">
            {data.users.map((u, i) => (
              <li key={`${u.joinedAt}-${i}`} className="aff-row">
                <span className="aff-avatar" aria-hidden="true">
                  {u.label.charAt(0)}
                </span>
                <div className="aff-row-main">
                  <span className="aff-row-title">{u.label}</span>
                  <span className="aff-row-sub">Joined {dateOf(u.joinedAt)}</span>
                  <span className="aff-row-sub">{u.reward}</span>
                </div>
                <span className={`aff-chip ${u.qualified ? 'aff-chip-converted' : 'aff-chip-pending'}`}>{u.qualified ? 'Active' : 'Joined'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---- rewards ---- */}
      <section className="aff-section">
        <h3 className="prof-h">Rewards</h3>
        <div className="aff-rewards">
          <div className="aff-reward">
            <span className="aff-reward-n">{data.rewards.tickets.earned}</span>
            <span className="aff-reward-l">raffle tickets earned</span>
            <span className="aff-reward-s">{data.rewards.tickets.unused} not used yet</span>
          </div>
          <div className="aff-reward">
            <span className="aff-reward-n">${data.rewards.discountDollars}</span>
            <span className="aff-reward-l">off your membership</span>
            {data.program.tierName && (
              <span className="aff-reward-s">{`up to $${data.program.discountCap} on ${data.program.tierName}`}</span>
            )}
          </div>
        </div>
        {/* Glenn, 2026-09-30: $9 of every paying member's and business's monthly fee goes to the foundation. */}
        <div className="earn-foundation aff-foundation">
          <span className="earn-foundation-name">{data.foundation.name}</span>
          <p className="earn-foundation-line">
            {data.foundation.monthlyCents > 0 ? (
              <>
                Your people are raising <b>{money(data.foundation.monthlyCents)} a month</b>
              </>
            ) : (
              <>
                Raising <b>$0 a month</b> so far
              </>
            )}
          </p>
        </div>
        <p className="aff-note">
          {data.rewards.toNextTicket} more {data.rewards.toNextTicket === 1 ? 'person' : 'people'} for your next raffle ticket.
        </p>
      </section>

      {/* ---- activity ---- */}
      <section className="aff-section">
        <h3 className="prof-h">Recent activity</h3>
        {data.activity.length === 0 ? (
          <p className="aff-empty">Nothing yet.</p>
        ) : (
          <ol className="aff-feed">
            {data.activity.map((a, i) => (
              <li key={`${a.at}-${i}`} className={`aff-feed-item aff-feed-${a.kind}`}>
                <span className="aff-feed-dot" aria-hidden="true" />
                <span className="aff-feed-text">{a.text}</span>
                <time className="aff-feed-when" dateTime={new Date(a.at).toISOString()}>
                  {when(a.at)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ---- status ---- */}
      <section className="aff-section">
        <h3 className="prof-h">Your affiliate account</h3>
        <dl className="aff-facts">
          <div>
            <dt>Affiliate since</dt>
            <dd>{dateOf(data.affiliate.since)}</dd>
          </div>
          <div>
            <dt>Code</dt>
            <dd className="aff-mono">{data.affiliate.code}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{data.affiliate.status}</dd>
          </div>
          <div>
            <dt>Lifetime referrals</dt>
            <dd>
              {life.users} {life.users === 1 ? 'person' : 'people'} · {life.businesses} {life.businesses === 1 ? 'business' : 'businesses'}
            </dd>
          </div>
          <div>
            <dt>Lifetime rewards</dt>
            <dd>
              {data.rewards.tickets.earned} raffle {data.rewards.tickets.earned === 1 ? 'ticket' : 'tickets'} · ${data.rewards.discountDollars} off
            </dd>
          </div>
          <div>
            <dt>How you earn</dt>
            <dd>
              1 raffle ticket and ${data.program.discountPerMilestone} off per {data.program.perTicket} people who join. As a recruiter, BARK
              points for each month a person or business you bring pays.
            </dd>
          </div>
        </dl>
      </section>

      <details className="aff-how">
        <summary>How we count</summary>
        <ul>
          <li>
            <b>Click:</b> one phone or computer opening your link, once a day. Your own devices, members already signed in and search
            robots never count.
          </li>
          <li>
            <b>Person you brought:</b> a new account made through your friend link or QR code. The first code wins and it never
            changes; an account made on your own phone does not count.
          </li>
          <li>
            <b>Active:</b> someone you brought who liked, saved or shared a business, ordered, used their pass at a shop, or brought a
            friend of their own.
          </li>
          <li>
            <b>Business you referred:</b> a business that asked for a spot after opening your business link (the first link it opened
            in 90 days wins). <b>Signed</b> means it became a BEASTY customer.
          </li>
          <li>
            <b>BARK points:</b> while you are a recruiter, each month a person or business you brought pays earns you points, for the
            number of months in your Schedule A. Only people and businesses you bring while recruiting count; a pause stops new ones, not
            the months still owed. 1 point is $1, cashed out once BEASTY approves your signed paperwork.
          </li>
          <li>
            <b>Conversions:</b> people who became active plus businesses that signed. <b>Sign-up rate:</b> new accounts ÷ clicks on your
            friend link.
          </li>
        </ul>
      </details>
    </>
  )
}

/*
  BARK POINTS. Leon, 2026-10-26: "paying the $60 opens the /join paperwork, points credit monthly while
  recruiting is active, and cash-outs only after Glenn approves the packet." One card that says where the
  member stands and the one thing to do next: become a recruiter, finish the paperwork, or cash out.
*/
const PAPERWORK: Record<Bark['paperwork'], string> = {
  none: 'Your paperwork opens once your recruiter upgrade is paid.',
  in_progress: 'Cash-outs open once BEASTY approves your signed paperwork.',
  changes_requested: 'BEASTY asked for a change to your paperwork.',
  submitted: 'Your paperwork is with BEASTY for review.',
  approved: '',
  rejected: 'Cash-outs are closed on your account.',
  suspended: 'Cash-outs are paused on your account.',
}

function BarkPoints({ api }: { api: ShellApi }) {
  const [bark, setBark] = useState<Bark | null>(null)
  const [failed, setFailed] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [said, setSaid] = useState<string | null>(null)
  useEffect(() => {
    fetchBark().then(setBark).catch(() => setFailed(true))
  }, [])
  if (failed) return null
  if (!bark) return <div className="aff-sk aff-bark-sk" aria-hidden="true" />

  const b = bark.balance
  const dollars = (points: number) => money(Math.round(points * bark.pointValue * 100))
  const recruiting = bark.recruiter === 'active' || bark.recruiter === 'paused'
  const pick = amount != null && bark.choices.includes(amount) ? amount : bark.choices[bark.choices.length - 1] ?? null

  async function cashOut() {
    if (pick == null || busy) return
    setBusy(true)
    setSaid(null)
    try {
      /* The card's own "You asked for…" line confirms it; only a refusal needs saying here. */
      setBark(await requestCashout(pick))
    } catch (e) {
      setSaid((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  /* Not a recruiter and nothing earned: the card is the way in. */
  if (!recruiting && b.earned === 0 && bark.cashouts.length === 0) {
    return (
      <section className="aff-card aff-bark is-invite">
        <div className="aff-card-head">
          <h3>BARK points</h3>
          <span className="aff-card-sub">1 point = $1</span>
        </div>
        {(bark.recruiter === 'pending' || bark.recruiter === 'cancelled') && (
          <p className="aff-bark-line">
            {bark.recruiter === 'pending' ? 'Your recruiter checkout is waiting.' : 'Your recruiter upgrade has ended.'}
          </p>
        )}
        <button className="btn-primary" onClick={() => api.openApp('sys.members')}>
          {bark.recruiter === 'pending' ? 'Finish the checkout' : bark.recruiter === 'cancelled' ? 'Become a recruiter again' : 'Become a recruiter'}
        </button>
      </section>
    )
  }

  const toGo = Math.max(0, bark.minRedemption - b.available)
  return (
    <section className="aff-card aff-bark">
      <div className="aff-card-head">
        <h3>BARK points</h3>
        <span className="aff-card-sub">
          {bark.recruiter === 'active' ? 'Recruiting' : bark.recruiter === 'paused' ? 'Recruiting paused' : 'Not recruiting'}
        </span>
      </div>
      <div className="aff-bark-balance">
        <span className="aff-bark-n">{b.available}</span>
        <span className="aff-bark-l">
          points to cash out · <b>{dollars(b.available)}</b>
        </span>
        <span className="aff-bark-s">
          {b.earned} earned · {b.cashedOut} cashed out{b.owed > 0 ? ` · ${b.owed} taken back after a refund, off your next cash-out` : ''}
        </span>
      </div>

      {bark.openCashout ? (
        <p className="aff-bark-line is-good">
          You asked for {bark.openCashout.points} points ({money(bark.openCashout.cents)}) on {dateOf(bark.openCashout.requestedAt)}.
        </p>
      ) : bark.paperwork !== 'approved' ? (
        <div className="aff-bark-next">
          <p className="aff-bark-line">{PAPERWORK[bark.paperwork]}</p>
          {(bark.paperwork === 'in_progress' || bark.paperwork === 'changes_requested') && (
            <a className="btn-primary" href="/join">
              Finish your paperwork
            </a>
          )}
        </div>
      ) : bark.choices.length ? (
        <div className="aff-bark-cash">
          <label className="aff-bark-pick">
            <span>Cash out</span>
            <select value={pick ?? ''} onChange={(e) => setAmount(Number(e.target.value))} disabled={busy}>
              {bark.choices.map((p) => (
                <option key={p} value={p}>
                  {p} points ({dollars(p)})
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary" onClick={() => void cashOut()} disabled={busy || pick == null}>
            {busy ? 'One moment…' : `Cash out ${pick} points`}
          </button>
        </div>
      ) : (
        <p className="aff-bark-line">
          Cash out from {bark.minRedemption} points, in steps of {bark.redemptionStep}: {toGo} to go.
        </p>
      )}
      {said && (
        <p className="aff-bark-line" role="alert">
          {said}
        </p>
      )}

      {bark.ledger.length > 0 && (
        <ul className="aff-list aff-bark-ledger">
          {bark.ledger.slice(0, 8).map((r) => (
            <li key={r.id} className={`aff-row${r.status === 'void' ? ' is-void' : ''}`}>
              <div className="aff-row-main">
                <span className="aff-row-title">{r.text}</span>
                <span className="aff-row-sub">
                  {dateOf(r.at)}
                  {r.status === 'void' ? ` · removed: ${r.voidNote || 'refunded'}` : ''}
                </span>
              </div>
              <span className="aff-bark-plus">+{r.points}</span>
            </li>
          ))}
        </ul>
      )}
      {bark.cashouts.filter((c) => c.status !== 'requested').length > 0 && (
        <p className="aff-note">
          {bark.cashouts
            .filter((c) => c.status !== 'requested')
            .slice(0, 3)
            .map((c) => `${c.points} points ${c.status === 'paid' ? `paid ${dateOf(c.decidedAt ?? c.requestedAt)}` : `declined${c.note ? `: ${c.note}` : ''}`}`)
            .join(' · ')}
        </p>
      )}
    </section>
  )
}

function Kpi({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div className="aff-kpi">
      <span className="aff-kpi-l">{label}</span>
      <span className="aff-kpi-n">{value}</span>
      <span className="aff-kpi-s">{sub}</span>
    </div>
  )
}

/**
 * One series, one hue, columns from a single baseline (the dataviz rules):
 * no legend, the card's title names it; each column is tappable for its exact
 * number; a hidden table reads the same numbers to a screen reader.
 */
function Columns({ buckets, metric, title }: { buckets: Bucket[]; metric: Metric; title: string }) {
  const [active, setActive] = useState<number | null>(null)
  /* Drawn at the width it is shown at, so its text stays text-sized on a wide
     screen instead of growing with the window. */
  const box = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(320)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const values = buckets.map((b) => b[metric])
  const max = Math.max(0, ...values)
  const total = values.reduce((a, v) => a + v, 0)
  const H = 140
  const top = 12
  const n = Math.max(1, buckets.length)
  const band = W / n
  const bar = Math.max(2, Math.min(24, band - 2))
  const ceil = max <= 4 ? Math.max(1, max) : Math.ceil(max / 4) * 4
  const y = (v: number) => H - (v / ceil) * (H - top)
  const ticks = max === 0 ? [0] : [0, ceil / 2, ceil]

  const shown = active != null ? buckets[active] : null
  return (
    <div className="aff-chart" ref={box} onMouseLeave={() => setActive(null)}>
      {total === 0 ? (
        <p className="aff-chart-empty">Nothing in this range yet.</p>
      ) : (
        <>
      <div className="aff-chart-tip" aria-live="polite">
        {shown ? (
          <>
            <b>{shown[metric]}</b> {shown.label}
          </>
        ) : (
          <>
            <b>{total}</b> in this range
          </>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="aff-chart-svg" role="img" aria-label={`${title}: ${total} in this range`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={0} x2={W} y1={y(t)} y2={y(t)} className="aff-grid" />
            {t > 0 && (
              <text x={W} y={y(t) - 3} textAnchor="end" className="aff-axis">
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </text>
            )}
          </g>
        ))}
        {buckets.map((b, i) => {
          const v = b[metric]
          const x = i * band + (band - bar) / 2
          const h = Math.max(0, H - y(v))
          const r = Math.min(4, bar / 2, h)
          return (
            <g key={b.key} onMouseEnter={() => setActive(i)} onClick={() => setActive(active === i ? null : i)}>
              <rect x={i * band} y={0} width={band} height={H} fill="transparent" />
              {v > 0 && (
                <path
                  className={`aff-bar${active === i ? ' on' : ''}`}
                  d={`M${x},${H} V${H - h + r} Q${x},${H - h} ${x + r},${H - h} H${x + bar - r} Q${x + bar},${H - h} ${x + bar},${H - h + r} V${H} Z`}
                />
              )}
            </g>
          )
        })}
        {[0, Math.floor((n - 1) / 2), n - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((i) => (
            <text key={i} x={i * band + band / 2} y={H + 14} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="aff-axis">
              {buckets[i]?.label}
            </text>
          ))}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.key}>
              <th scope="row">{b.label}</th>
              <td>{b[metric]}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}
    </div>
  )
}

function Share({ data }: { data: Affiliate }) {
  const [said, setSaid] = useState<string | null>(null)
  const [qr, setQr] = useState<'user' | 'business'>('user')
  const tell = (s: string) => {
    setSaid(s)
    window.setTimeout(() => setSaid(null), 2000)
  }
  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      tell('Link copied')
    } catch {
      tell('Copy did not work: hold the link to copy it')
    }
  }
  async function share(url: string, title: string) {
    /* shareOrCopy builds the address from a path on this site. */
    const u = new URL(url)
    const r = await shareOrCopy({ title, slug: `${u.pathname.slice(1)}${u.search}` })
    if (r === 'copied') tell('Link copied')
    if (r === 'failed') tell('Sharing did not work: use Copy')
  }
  const links = [
    { key: 'user' as const, title: 'Friend link', url: data.affiliate.links.user },
    { key: 'business' as const, title: 'Business link', url: data.affiliate.links.business },
  ]
  return (
    <section className="aff-section">
      <h3 className="prof-h">Your links</h3>
      <div className="aff-share">
        <div className="aff-qr">
          <img
            src={qr === 'business' ? '/api/members/qr.svg?for=business' : '/api/members/qr.svg'}
            alt={`QR code for your ${qr === 'business' ? 'business' : 'friend'} link`}
          />
          <div className="aff-seg aff-seg-small" role="tablist" aria-label="Which QR code">
            <button role="tab" aria-selected={qr === 'user'} className={qr === 'user' ? 'on' : ''} onClick={() => setQr('user')}>
              Friends
            </button>
            <button role="tab" aria-selected={qr === 'business'} className={qr === 'business' ? 'on' : ''} onClick={() => setQr('business')}>
              Businesses
            </button>
          </div>
        </div>
        <div className="aff-links">
          <p className="aff-code">
            Your code <span className="aff-mono">{data.affiliate.code}</span>
          </p>
          {links.map((l) => (
            <div key={l.key} className="aff-link">
              <span className="aff-link-title">{l.title}</span>
              <span className="aff-link-url">{l.url.replace(/^https?:\/\//, '')}</span>
              <div className="aff-link-actions">
                <button className="btn-secondary" onClick={() => void copy(l.url)}>
                  Copy
                </button>
                <button className="btn-secondary" onClick={() => void share(l.url, 'BEASTY')}>
                  Share
                </button>
              </div>
            </div>
          ))}
          {said && (
            <p className="aff-said" role="status">
              {said}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
