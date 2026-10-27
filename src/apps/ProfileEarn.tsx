import { useEffect, useState } from 'react'
import type { ShellApi } from '../ios/Device'
import { useGate } from '../lib/gate'
import { fetchAffiliate, money, type Affiliate } from '../lib/affiliate'
import { MemberPanel } from './MemberPanel'

/*
  PROFILE'S EARN TAB. Leon, 2026-09-30: Profile split in two, "My page" for
  what friends see and "Earn" for what a member brings to BEASTY. Four of the
  dashboard's numbers, what their people raise for the foundation, their code
  and QR with what it has earned, and the way into the full dashboard. The
  numbers are the dashboard's own (/api/affiliate/me); nothing is added here.
*/
export function ProfileEarn({ api }: { api: ShellApi }) {
  const { account } = useGate()
  const [data, setData] = useState<Affiliate | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!account) return
    let live = true
    setFailed(false)
    fetchAffiliate()
      .then((d) => live && setData(d))
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [account])

  if (!account) {
    return (
      <div className="earn-out">
        <h2 className="prof-h">Earn with BEASTY</h2>
        <button className="btn-primary" onClick={() => api.openApp('sys.account')}>
          Sign in
        </button>
      </div>
    )
  }

  const life = data?.lifetime
  const f = data?.foundation
  const stats = [
    [life?.users, 'person', 'people'],
    [life?.businesses, 'business', 'businesses'],
    [life?.clicks, 'link click', 'link clicks'],
    [life?.conversions, 'conversion', 'conversions'],
  ] as const

  return (
    <div className="earn">
      <button type="button" className="earn-numbers" onClick={() => api.openApp('sys.affiliate')} aria-label="Open your affiliate dashboard">
        {stats.map(([n, one, many]) => (
          <span key={many} className="earn-num">
            <b>{n ?? '–'}</b>
            <span>{n === 1 ? one : many}</span>
          </span>
        ))}
      </button>
      {failed && <p className="aff-note">Your numbers did not load. They are on the dashboard too.</p>}

      {/*
        THE FOUNDATION. Glenn, 2026-09-30: "$9 from each user and affiliate
        monthly membership fee towards the foundation", so affiliates "can see
        this money being raised". Real statuses only (server/affiliate.ts).
      */}
      {f && (
        <section className="earn-foundation">
          <span className="earn-foundation-name">{f.name}</span>
          <p className="earn-foundation-line">
            {f.monthlyCents > 0 ? (
              <>
                Your people are raising <b>{money(f.monthlyCents)} a month</b>
              </>
            ) : (
              <>
                Raising <b>$0 a month</b> so far
              </>
            )}
          </p>
        </section>
      )}

      <MemberPanel businessLink={data?.affiliate.links.business} />

      <button className="btn-secondary earn-open" onClick={() => api.openApp('sys.affiliate')}>
        Open the full dashboard ›
      </button>
    </div>
  )
}
