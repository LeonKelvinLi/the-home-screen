import { useEffect, useState } from 'react'
import { FriendFace } from './FriendFace'
import { useGate } from '../lib/gate'
import {
  answerFriendRequest,
  cancelFriendRequest,
  fetchMyFriends,
  rememberMemberLink,
  removeFriend,
  saveTopFriends,
  sendFriendRequest,
  TOP_SIZE,
  type FriendPerson,
  type MyFriends,
  type Relation,
} from '../lib/friends'
import type { ShellApi } from '../ios/Device'

/*
  FRIENDS, THE MYSPACE WAY, on screen. Glenn, 2026-09-24: "top 3 friends",
  "exactly like myspace concept". The Top 3 row is his Top 8 cut to three,
  numbered, with each friend's face; the rules are the server's
  (server/friends.ts).
*/

/** Open a member's page in Contacts, from anywhere. */
export function openMemberPage(api: ShellApi, id: string): void {
  rememberMemberLink(id)
  api.openApp('sys.phone')
}

/** Three numbered places, filled in order; an empty place says so. */
export function TopThreeRow({
  people,
  onOpen,
  onEmpty,
  emptyLabel,
}: {
  people: FriendPerson[]
  onOpen: (id: string) => void
  onEmpty?: () => void
  emptyLabel?: string
}) {
  return (
    <ol className="top3">
      {Array.from({ length: TOP_SIZE }).map((_, i) => {
        const f = people[i]
        if (!f) {
          return (
            <li className="top3-slot is-empty" key={i}>
              {onEmpty ? (
                <button type="button" className="top3-face top3-add" onClick={onEmpty} aria-label={emptyLabel ?? 'Add friends'}>
                  +
                </button>
              ) : (
                <span className="top3-face top3-add" aria-hidden="true" />
              )}
              <span className="top3-rank">#{i + 1}</span>
            </li>
          )
        }
        return (
          <li className="top3-slot" key={f.id}>
            <button type="button" className="top3-face" onClick={() => onOpen(f.id)} aria-label={`#${i + 1}, ${f.name}. Open their page.`}>
              <FriendFace id={f.id} pet={f.pet} size={68} />
            </button>
            <span className="top3-rank">#{i + 1}</span>
            <span className="top3-name">{f.name}</span>
          </li>
        )
      })}
    </ol>
  )
}

const LABEL: Record<Exclude<Relation, 'me'>, string> = {
  none: 'Add friend',
  sent: 'Request sent',
  received: 'Accept',
  friends: 'Friends ✓',
}

/** The one button on someone else's page, following where you stand with them. */
export function FriendButton({ id, name, relation, onChange }: { id: string; name: string; relation: Relation; onChange: (r: Relation) => void }) {
  const { refresh } = useGate()
  const [busy, setBusy] = useState(false)
  const [menu, setMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (relation === 'me') return null

  const run = async (fn: () => Promise<Relation>) => {
    setBusy(true)
    setError(null)
    try {
      onChange(await fn())
      setMenu(false)
      void refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not go through.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="friend-act">
      {relation === 'received' ? (
        <div className="friend-act-row">
          <button type="button" className="btn-primary friend-btn" disabled={busy} onClick={() => run(() => answerFriendRequest(id, true))}>
            Accept
          </button>
          <button type="button" className="btn-secondary friend-btn" disabled={busy} onClick={() => run(() => answerFriendRequest(id, false))}>
            Decline
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`${relation === 'none' ? 'btn-primary' : 'btn-secondary'} friend-btn`}
          disabled={busy}
          aria-expanded={relation === 'sent' || relation === 'friends' ? menu : undefined}
          onClick={() => {
            if (relation === 'none') void run(() => sendFriendRequest(id))
            else setMenu((m) => !m)
          }}
        >
          {LABEL[relation]}
        </button>
      )}
      {relation === 'received' && <p className="friend-note">{name} wants to be your friend.</p>}
      {menu && relation === 'sent' && (
        <button type="button" className="friend-menu" disabled={busy} onClick={() => run(() => cancelFriendRequest(id))}>
          Cancel request
        </button>
      )}
      {menu && relation === 'friends' && (
        <button type="button" className="friend-menu is-danger" disabled={busy} onClick={() => run(() => removeFriend(id))}>
          Remove friend
        </button>
      )}
      {error && (
        <p className="friend-note is-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Your own friends, on your Profile: the Top 3 you picked, the requests
 * waiting for you, and the whole list. Signed-in members only; the Profile
 * shows nothing here for anyone else.
 */
export function MyFriendsSection({ api }: { api: ShellApi }) {
  const { account, refresh } = useGate()
  const [data, setData] = useState<MyFriends | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sheet, setSheet] = useState<null | 'edit' | 'all'>(null)
  const [pick, setPick] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const load = () =>
    fetchMyFriends().then(
      (d) => {
        setData(d)
        setError(null)
      },
      (e) => setError(e instanceof Error ? e.message : 'Could not load your friends.'),
    )
  useEffect(() => {
    if (account) void load()
  }, [account?.id])

  if (!account) return null

  const byId = new Map((data?.friends ?? []).map((f) => [f.id, f]))
  /* While picking, the row shows the picks as they are made. */
  const top = (sheet === 'edit' ? pick : data?.top ?? []).map((id) => byId.get(id)).filter(Boolean) as FriendPerson[]
  const open = (id: string) => openMemberPage(api, id)
  const toContacts = () => api.openApp('sys.phone')

  const answer = async (from: string, accept: boolean) => {
    setBusy(true)
    try {
      await answerFriendRequest(from, accept)
      await load()
      void refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not go through.')
    } finally {
      setBusy(false)
    }
  }

  const saveTop = async () => {
    setBusy(true)
    try {
      await saveTopFriends(pick)
      await load()
      setSheet(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That did not save.')
    } finally {
      setBusy(false)
    }
  }

  const friends = data?.friends ?? []

  return (
    <>
      {data && data.requests.length > 0 && (
        <section className="friend-requests">
          <h2 className="prof-h">
            Friend requests <span className="friend-count-badge">{data.requests.length}</span>
          </h2>
          <ul className="friend-list">
            {data.requests.map((r) => (
              <li className="friend-row" key={r.id}>
                <button type="button" className="friend-who" onClick={() => open(r.id)}>
                  <FriendFace id={r.id} pet={r.pet} size={40} />
                  <span>{r.name}</span>
                </button>
                <span className="friend-row-acts">
                  <button type="button" className="btn-primary friend-mini" disabled={busy} onClick={() => answer(r.id, true)}>
                    Accept
                  </button>
                  <button type="button" className="btn-secondary friend-mini" disabled={busy} onClick={() => answer(r.id, false)}>
                    Decline
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="prof-top3">
        <div className="prof-top-head">
          <h2 className="prof-h">Top 3 friends</h2>
          {friends.length > 0 && (
            <button
              type="button"
              className="prof-edit"
              onClick={() => {
                setPick(data?.top ?? [])
                setSheet(sheet === 'edit' ? null : 'edit')
              }}
            >
              {sheet === 'edit' ? 'Close' : 'Edit'}
            </button>
          )}
        </div>
        <TopThreeRow
          people={top}
          onOpen={open}
          onEmpty={friends.length > top.length ? () => {
            setPick(data?.top ?? [])
            setSheet('edit')
          } : toContacts}
          emptyLabel={friends.length > top.length ? 'Pick a friend for this spot' : 'Find friends in Contacts'}
        />
        {friends.length === 0 && data && (
          <p className="prof-empty">No friends yet.</p>
        )}

        {sheet === 'edit' && (
          <div className="prof-picker top3-picker">
            {friends.map((f) => {
              const at = pick.indexOf(f.id)
              return (
                <button
                  type="button"
                  key={f.id}
                  className={`prof-picker-row top3-pick${at >= 0 ? ' is-on' : ''}`}
                  aria-pressed={at >= 0}
                  onClick={() =>
                    setPick((cur) =>
                      cur.includes(f.id) ? cur.filter((x) => x !== f.id) : cur.length < TOP_SIZE ? [...cur, f.id] : cur,
                    )
                  }
                >
                  <FriendFace id={f.id} pet={f.pet} size={32} />
                  <span className="top3-pick-name">{f.name}</span>
                  <span className="top3-pick-rank">{at >= 0 ? `#${at + 1}` : ''}</span>
                </button>
              )
            })}
            <div className="friend-act-row">
              <button type="button" className="btn-primary friend-btn" disabled={busy} onClick={saveTop}>
                Save Top 3
              </button>
              <button type="button" className="btn-secondary friend-btn" disabled={busy} onClick={() => setPick([])}>
                Clear
              </button>
            </div>
          </div>
        )}

        <button type="button" className="friend-all" onClick={() => setSheet(sheet === 'all' ? null : 'all')} aria-expanded={sheet === 'all'}>
          Friends ({friends.length})
        </button>
        {sheet === 'all' && (
          <ul className="friend-list">
            {friends.map((f) => (
              <li className="friend-row" key={f.id}>
                <button type="button" className="friend-who" onClick={() => open(f.id)}>
                  <FriendFace id={f.id} pet={f.pet} size={40} />
                  <span>{f.name}</span>
                </button>
                <button
                  type="button"
                  className="friend-menu is-danger"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true)
                    try {
                      await removeFriend(f.id)
                      await load()
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
            {friends.length === 0 && <li className="prof-empty">No friends yet.</li>}
          </ul>
        )}
        {error && (
          <p className="friend-note is-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  )
}
