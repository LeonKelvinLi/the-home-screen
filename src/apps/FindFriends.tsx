import { useEffect, useState } from 'react'
import { AppChrome } from './AppChrome'
import { FriendFace } from './FriendFace'
import { Gem } from './MembersApp'
import { useGate } from '../lib/gate'
import { fetchSuggested, sendFriendRequest, type Suggested } from '../lib/friends'
import type { ShellApi } from '../ios/Device'

/*
  FIND FRIENDS, Glenn's Beli idea of 2026-10-19: "I just got this message from
  one of those apps Beli. We should do something very similar but change it to
  something referring to the 💎 points." His screenshot was Beli's "Get recs
  from people you trust": a list of suggested people, each with a count beside
  their name, five ticked already, Select all, and one button to add them.

  Here the count is each member's 💎 points, from their real referrals at his
  rate (src/data/membership.ts), and people in your own city come first
  (server/friends.ts). Shown once to a new member right after joining, and from
  Contacts any time.
*/

/* Beli ticks the first five for you; so does this. */
const PRESELECT = 5

const pts = (n: number) => `${n} ${n === 1 ? 'point' : 'points'}`

export function FindFriendsApp({ api }: { api: ShellApi }) {
  const { account } = useGate()
  const [data, setData] = useState<{ myPoints: number; people: Suggested[] } | null | 'error'>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!account) return
    let on = true
    fetchSuggested()
      .then((d) => {
        if (!on) return
        setData(d)
        setPicked(new Set(d.people.slice(0, PRESELECT).map((p) => p.id)))
      })
      .catch(() => on && setData('error'))
    return () => {
      on = false
    }
  }, [account])

  const toggle = (id: string) =>
    setPicked((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const people = data && data !== 'error' ? data.people : []
  const allOn = people.length > 0 && people.every((p) => picked.has(p.id))

  const add = async () => {
    if (busy || picked.size === 0) return
    setBusy(true)
    setError(null)
    let ok = 0
    let last: string | null = null
    /* One at a time: the server counts requests per day, and a refusal on
       one (they asked you first, a cool-down) should not lose the rest. */
    for (const id of picked) {
      try {
        await sendFriendRequest(id)
        ok += 1
      } catch (e) {
        last = e instanceof Error ? e.message : 'That did not go through.'
      }
    }
    setBusy(false)
    setSent(ok)
    if (ok === 0 && last) setError(last)
  }

  if (!account) {
    return (
      <AppChrome title="Find friends" onBack={api.closeApp}>
        <div className="ff">
          <button className="btn-primary" onClick={() => api.openApp('sys.join')}>
            Sign in or join free
          </button>
        </div>
      </AppChrome>
    )
  }

  if (sent !== null && sent > 0) {
    return (
      <AppChrome title="Find friends" onBack={api.closeApp}>
        <div className="ff ff-done">
          <p className="ff-title">Requests sent</p>
          <p className="ff-lead">
            {sent === 1 ? 'One friend request is' : `${sent} friend requests are`} on the way.
          </p>
          <button className="btn-primary" onClick={api.closeApp}>
            Done
          </button>
        </div>
      </AppChrome>
    )
  }

  return (
    <AppChrome title="Find friends" onBack={api.closeApp}>
      <div className="ff">
        <h2 className="ff-title">Earn points with people you trust</h2>
        {data && data !== 'error' && (
          <p className="ff-mine">
            <Gem size={16} /> You have <strong>{pts(data.myPoints)}</strong>
          </p>
        )}

        {data === null && <p className="ff-lead">Loading…</p>}
        {data === 'error' && <p className="ff-lead">Could not load suggestions just now. Try again in a moment.</p>}
        {data && data !== 'error' && people.length === 0 && (
          <p className="ff-lead">You are already friends with, or have asked, everyone on BEASTY so far.</p>
        )}

        {people.length > 0 && (
          <>
            <div className="ff-head">
              <span>Suggested friends</span>
              <button
                type="button"
                className="ff-all"
                onClick={() => setPicked(allOn ? new Set() : new Set(people.map((p) => p.id)))}
              >
                {allOn ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <ul className="ff-list">
              {people.map((p) => {
                const on = picked.has(p.id)
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`ff-row${on ? ' is-on' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggle(p.id)}
                    >
                      <span className="ff-face">
                        <FriendFace id={p.id} pet={p.pet} size={44} />
                      </span>
                      <span className="ff-who">
                        <span className="ff-name">{p.name}</span>
                        <span className="ff-meta">
                          <Gem size={12} /> {pts(p.points)}
                          {p.place && <span className="ff-place"> · {p.place}</span>}
                          {p.sameCity && <span className="ff-near">Near you</span>}
                        </span>
                      </span>
                      <span className="ff-check" aria-hidden="true">
                        {on && (
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M5 12.5 10 17.5 19 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {error && (
          <p className="friend-note is-error" role="alert">
            {error}
          </p>
        )}

        {people.length > 0 && (
          <div className="ff-foot">
            <button className="btn-primary ff-add" disabled={busy || picked.size === 0} onClick={add}>
              {busy ? 'Sending…' : picked.size === 0 ? 'Pick someone to add' : `Add ${picked.size} ${picked.size === 1 ? 'friend' : 'friends'}`}
            </button>
            <button type="button" className="gate-later" onClick={api.closeApp}>
              Not now
            </button>
          </div>
        )}
      </div>
    </AppChrome>
  )
}
