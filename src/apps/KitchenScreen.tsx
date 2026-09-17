import { useCallback, useEffect, useRef, useState } from 'react'
import { QrScanner } from './QrScanner'
import { drain } from '../lib/http'

/**
 * THE KITCHEN SCREEN, at /kitchen.
 *
 * The README's gap for as long as ordering has been live: "No kitchen display
 * exists and no vendor has been issued a token, so in production tickets stay
 * queued." This is the display. It runs on whatever the counter already has —
 * a tablet, a phone, the laptop by the till — and needs nothing installed.
 *
 * SIGNED IN BY A LINK. The operator issues a kitchen a key (POST
 * /api/vendors/:id/tokens) and sends the link it comes with. The key rides in
 * the #fragment, which a browser never sends to a server, is stored on this
 * device, and is wiped from the address bar at once so it is not left on
 * screen or in a shared screenshot. Turning the key off on the server signs
 * the device out on its next poll.
 *
 * ONE KITCHEN'S TICKETS ONLY. The queue the server returns is scoped to this
 * key's vendor: other kitchens on a shared cart, and the platform's fee, never
 * reach this screen.
 *
 * AND THE MEMBER PASS. Glenn's ask of 8 August — a QR code the business scans
 * when a member wants their offer honoured, then deactivated on the business's
 * end — needs a scanner at the counter, and this is the counter's screen. A
 * pass scans once; the server records it, so there is no separate deactivate
 * step to forget.
 */

const KEY_STORE = 'fb.kitchen.v1'
const POLL_MS = 5000
const KEY_SHAPE = /^kt_[A-Za-z0-9_-]{20,80}$/
const TURNED_OFF = 'This kitchen link has been turned off. Ask BEASTY for a new one.'

type TicketState = 'queued' | 'cooking' | 'ready' | 'collected' | 'cancelled'

interface KitchenTicket {
  id: string
  vendorId: string
  brandIds: string[]
  state: TicketState
  cancelledBy?: 'customer' | 'kitchen'
  cancelReason?: string
  lines: { name: string; qty: number; options: string[]; note?: string }[]
}

interface KitchenOrder {
  id: string
  code: string
  createdAt: number
  fulfilment: 'pickup' | 'delivery'
  etaMinutes: number
  customer?: { name: string; phone: string }
  address?: string
  tickets: KitchenTicket[]
}

interface Me {
  vendorId: string
  name: string
  brands: { id: string; name: string }[]
  signupsFromRegisterCode: number
}

type PassResult =
  | { kind: 'ok'; name: string; honours: string | null }
  | { kind: 'error'; message: string }

const NEXT: Partial<Record<TicketState, { to: TicketState; label: string }>> = {
  queued: { to: 'cooking', label: 'Start' },
  cooking: { to: 'ready', label: 'Ready' },
  ready: { to: 'collected', label: 'Picked up' },
}

const REASONS = ['Sold out', 'Closing early', 'Too busy right now']

function readKey(): string | null {
  try {
    const k = localStorage.getItem(KEY_STORE)
    return k && KEY_SHAPE.test(k) ? k : null
  } catch {
    return null
  }
}

function writeKey(key: string | null) {
  try {
    if (key) localStorage.setItem(KEY_STORE, key)
    else localStorage.removeItem(KEY_STORE)
  } catch {
    /* private mode: the key lasts as long as the tab */
  }
}

/**
 * Take the key out of the link's fragment, keep it, and clear the address bar.
 * Stored here rather than in an effect so that calling this twice — React's
 * strict mode runs state initialisers twice — finds the same key both times.
 */
function keyFromLink(): string | null {
  const m = /[#&]k=(kt_[A-Za-z0-9_-]{20,80})/.exec(window.location.hash)
  if (!m) return null
  writeKey(m[1])
  window.history.replaceState(null, '', window.location.pathname)
  return m[1]
}

const minutesSince = (t: number, now: number) => Math.max(0, Math.floor((now - t) / 60000))

/**
 * Two short tones, so a new ticket is heard across a kitchen.
 *
 * On one AudioContext made when sound is switched on. Safari only lets a
 * context play if it was started by a tap, so a context made later, from a
 * poll, would stay silent on exactly the iPad most counters have.
 */
function chime(ctx: AudioContext | null) {
  if (!ctx) return
  try {
    void ctx.resume()
    ;[0, 0.22].forEach((at) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + at)
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.16)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + at)
      osc.stop(ctx.currentTime + at + 0.18)
    })
  } catch {
    /* no audio on this device; the banner and the tab title still show */
  }
}

export default function KitchenScreen() {
  const [key, setKey] = useState<string | null>(() => keyFromLink() ?? readKey())
  const [me, setMe] = useState<Me | null>(null)
  const [signedOut, setSignedOut] = useState<string | null>(null)
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [offline, setOffline] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [sound, setSound] = useState(false)
  const [fresh, setFresh] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [refusing, setRefusing] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [pass, setPass] = useState<PassResult | null>(null)
  const [pasted, setPasted] = useState('')
  /** Every ticket id on the last board, so a new one can be told apart. */
  const seen = useRef<Set<string> | null>(null)
  const audio = useRef<AudioContext | null>(null)
  const soundRef = useRef(sound)
  soundRef.current = sound

  /* Not a page for search engines, and a tab that says what it is. */
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex, nofollow'
  }, [])
  useEffect(() => {
    const base = me ? `${me.name} · BEASTY kitchen` : 'BEASTY kitchen'
    document.title = fresh ? `New order ${fresh} · ${base}` : base
  }, [me, fresh])

  const auth = useCallback(
    (init: RequestInit = {}): RequestInit => ({
      ...init,
      headers: { ...(init.headers ?? {}), authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    }),
    [key],
  )

  const signOut = useCallback((why: string | null) => {
    writeKey(null)
    setKey(null)
    setMe(null)
    setOrders([])
    seen.current = null
    setSignedOut(why)
  }, [])

  /* Who this key belongs to. */
  useEffect(() => {
    if (!key) return
    let alive = true
    void (async () => {
      try {
        const r = await fetch('/api/kitchen/me', auth())
        if (!alive) return
        if (r.status === 401) {
          await drain(r)
          return signOut(TURNED_OFF)
        }
        if (!r.ok) return drain(r)
        setMe((await r.json()) as Me)
      } catch {
        if (alive) setOffline(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [key, auth, signOut])

  /* The board: this kitchen's orders, every few seconds, one request at a time. */
  useEffect(() => {
    if (!key) return
    let alive = true
    let timer = 0
    const tick = async () => {
      try {
        const r = await fetch('/api/orders', auth())
        if (!alive) return
        if (r.status === 401) {
          await drain(r)
          return signOut(TURNED_OFF)
        }
        if (!r.ok) {
          /* Drained before throwing: this runs every few seconds, and an
             unread body per failed poll is a connection leaked per failed
             poll on a screen that stays open all service. */
          await drain(r)
          throw new Error(String(r.status))
        }
        const list = (await r.json()) as KitchenOrder[]
        const prev = seen.current
        if (prev) {
          const arrived = list.find((o) => o.tickets.some((t) => t.state === 'queued' && !prev.has(t.id)))
          if (arrived) {
            setFresh(arrived.code)
            if (soundRef.current) chime(audio.current)
          }
        }
        seen.current = new Set(list.flatMap((o) => o.tickets.map((t) => t.id)))
        setOrders(list)
        setOffline(false)
      } catch {
        if (alive) setOffline(true)
      }
      if (alive) timer = window.setTimeout(tick, POLL_MS)
    }
    void tick()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [key, auth, signOut])

  /*
    Keep the screen awake while signed in. A tablet that dims and locks stops
    polling, and the first anyone knows of an order is the customer at the
    counter asking where it is. Taken again whenever the tab comes back, since
    the browser drops it when the tab is hidden.
  */
  useEffect(() => {
    if (!key) return
    type Lock = { release: () => Promise<void> }
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<Lock> } }
    if (!nav.wakeLock) return
    let lock: Lock | null = null
    let alive = true
    const take = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const l = await nav.wakeLock!.request('screen')
        if (alive) lock = l
        else void l.release()
      } catch {
        /* refused (low battery, or not allowed here); the board still works */
      }
    }
    void take()
    document.addEventListener('visibilitychange', take)
    return () => {
      alive = false
      document.removeEventListener('visibilitychange', take)
      void lock?.release()
    }
  }, [key])

  /* The clock on each ticket, and the new-order banner's own time out. */
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (!fresh) return
    const t = window.setTimeout(() => setFresh(null), 15000)
    return () => clearTimeout(t)
  }, [fresh])

  const toggleSound = () => {
    if (sound) {
      setSound(false)
      return
    }
    try {
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AC && !audio.current) audio.current = new AC()
    } catch {
      audio.current = null
    }
    setSound(true)
    chime(audio.current)
  }

  const refresh = async () => {
    const list = await fetch('/api/orders', auth())
    if (!list.ok) return drain(list)
    setOrders((await list.json()) as KitchenOrder[])
  }

  const move = async (ticket: KitchenTicket, to: TicketState, why?: string) => {
    setBusy(ticket.id)
    setActionError(null)
    try {
      const r = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.id)}/state`,
        auth({ method: 'POST', body: JSON.stringify({ state: to, ...(why ? { reason: why } : {}) }) }),
      )
      if (r.status === 401) {
        await drain(r)
        return signOut(TURNED_OFF)
      }
      if (!r.ok) {
        const b = (await r.json().catch(() => ({}))) as { error?: string }
        /* 409 is the customer cancelling first, or another screen moving the
           ticket first. Either way the board is re-read rather than left wrong. */
        setActionError(
          r.status === 409
            ? 'That ticket had already changed (the customer may have cancelled it). The board is up to date now.'
            : b.error ?? 'Could not update that ticket.',
        )
      } else {
        setRefusing(null)
        setReason('')
      }
      await refresh()
    } catch {
      setActionError('No connection. Try again in a moment.')
    } finally {
      setBusy(null)
    }
  }

  const verifyPass = async (text: string) => {
    setScanning(false)
    if (!text.startsWith('bp1.')) {
      setPass({ kind: 'error', message: 'That is not a BEASTY member pass. Ask them to open their card in the app.' })
      return
    }
    try {
      const r = await fetch('/api/pass/verify', auth({ method: 'POST', body: JSON.stringify({ token: text }) }))
      if (r.status === 401) {
        await drain(r)
        return signOut(TURNED_OFF)
      }
      const b = (await r.json().catch(() => ({}))) as {
        error?: string
        member?: { name: string }
        honours?: string | null
      }
      if (r.ok && b.member) setPass({ kind: 'ok', name: b.member.name, honours: b.honours ?? null })
      else setPass({ kind: 'error', message: b.error ?? 'That pass could not be checked.' })
    } catch {
      setPass({ kind: 'error', message: 'No connection. The pass was not checked.' })
    }
  }

  if (!key) {
    return (
      <div className="kitchen-screen">
        <div className="kitchen-signin">
          <h1>BEASTY kitchen</h1>
          {signedOut && (
            <p className="kitchen-warn" role="alert">
              {signedOut}
            </p>
          )}
          <p>
            Open the kitchen link BEASTY sent you on this device, or paste the link or key below. It is
            kept on this device only.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const k = pasted.trim().replace(/^.*#k=/, '')
              if (KEY_SHAPE.test(k)) {
                writeKey(k)
                setPasted('')
                setSignedOut(null)
                setKey(k)
              } else {
                setSignedOut('That does not look like a kitchen key. A key starts with kt_.')
              }
            }}
          >
            <input
              aria-label="Kitchen link or key"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="kt_…"
            />
            <button type="submit" className="is-go">
              Open the kitchen
            </button>
          </form>
        </div>
      </div>
    )
  }

  const tickets = orders.flatMap((o) => o.tickets.map((t) => ({ order: o, ticket: t })))
  const column = (state: TicketState) =>
    tickets.filter((x) => x.ticket.state === state).sort((a, b) => a.order.createdAt - b.order.createdAt)
  const recent = tickets.filter(
    (x) => (x.ticket.state === 'collected' || x.ticket.state === 'cancelled') && now - x.order.createdAt < 12 * 3600_000,
  )

  const card = ({ order, ticket }: { order: KitchenOrder; ticket: KitchenTicket }) => {
    const next = NEXT[ticket.state]
    const age = minutesSince(order.createdAt, now)
    const isBusy = busy === ticket.id
    return (
      <article className={`kitchen-ticket is-${ticket.state}`} key={ticket.id}>
        <header>
          <strong className="kitchen-code">{order.code}</strong>
          <span className={`kitchen-age${age >= 20 && ticket.state !== 'ready' ? ' is-late' : ''}`}>
            {age === 0 ? 'just now' : `${age} min`}
          </span>
        </header>
        <p className="kitchen-who">
          {order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}
          {order.customer?.name ? ` · ${order.customer.name}` : ''}
          {order.customer?.phone && (
            <>
              {' · '}
              <a href={`tel:${order.customer.phone.replace(/[^0-9+]/g, '')}`}>{order.customer.phone}</a>
            </>
          )}
        </p>
        {order.fulfilment === 'delivery' && order.address && <p className="kitchen-address">{order.address}</p>}
        <ul className="kitchen-lines">
          {ticket.lines.map((l, i) => (
            <li key={i}>
              <span className="kitchen-qty">{l.qty}×</span> {l.name}
              {l.options.length > 0 && <span className="kitchen-options">{l.options.join(', ')}</span>}
              {l.note && <span className="kitchen-note">“{l.note}”</span>}
            </li>
          ))}
        </ul>
        {refusing === ticket.id ? (
          <div className="kitchen-refuse">
            <p>Tell the customer why:</p>
            <div className="kitchen-reasons">
              {REASONS.map((r) => (
                <button key={r} className={reason === r ? 'is-on' : ''} onClick={() => setReason(r)}>
                  {r}
                </button>
              ))}
            </div>
            <input
              aria-label="Reason"
              maxLength={140}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Or type a short reason"
            />
            <div className="kitchen-actions">
              <button
                onClick={() => {
                  setRefusing(null)
                  setReason('')
                }}
                disabled={isBusy}
              >
                Back
              </button>
              <button
                className="is-danger"
                onClick={() => void move(ticket, 'cancelled', reason.trim() || undefined)}
                disabled={isBusy}
              >
                Cancel ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="kitchen-actions">
            {(ticket.state === 'queued' || ticket.state === 'cooking') && (
              <button
                onClick={() => {
                  setRefusing(ticket.id)
                  setReason('')
                }}
                disabled={isBusy}
              >
                Can’t make it
              </button>
            )}
            {next && (
              <button className="is-go" onClick={() => void move(ticket, next.to)} disabled={isBusy}>
                {next.label}
              </button>
            )}
          </div>
        )}
      </article>
    )
  }

  return (
    <div className="kitchen-screen">
      <header className="kitchen-bar">
        <div>
          <h1>{me?.name ?? 'Kitchen'}</h1>
          {me && (
            <p className="kitchen-sub">
              {me.signupsFromRegisterCode === 1
                ? '1 member has joined from your register code'
                : `${me.signupsFromRegisterCode} members have joined from your register code`}
            </p>
          )}
        </div>
        <div className="kitchen-bar-actions">
          <button
            onClick={() => {
              setPass(null)
              setScanning(true)
            }}
          >
            Scan a member pass
          </button>
          <button onClick={toggleSound} aria-pressed={sound}>
            {sound ? 'Sound on' : 'Sound off'}
          </button>
          <button onClick={() => signOut(null)}>Sign out</button>
        </div>
      </header>

      {offline && <p className="kitchen-warn">Reconnecting. The board may be out of date.</p>}
      {fresh && (
        <p className="kitchen-new" role="alert">
          New order {fresh}
        </p>
      )}
      {actionError && (
        <p className="kitchen-warn" role="alert">
          {actionError}
        </p>
      )}

      <main className="kitchen-board">
        {(
          [
            ['queued', 'New'],
            ['cooking', 'Cooking'],
            ['ready', 'Ready'],
          ] as [TicketState, string][]
        ).map(([state, label]) => {
          const list = column(state)
          return (
            <section className="kitchen-column" key={state} aria-label={label}>
              <h2>
                {label} <span>{list.length}</span>
              </h2>
              {list.length === 0 ? <p className="kitchen-empty">Nothing here.</p> : list.map(card)}
            </section>
          )
        })}
      </main>

      {recent.length > 0 && (
        <p className="kitchen-done">
          In the last 12 hours: {recent.filter((x) => x.ticket.state === 'collected').length} picked up,{' '}
          {recent.filter((x) => x.ticket.state === 'cancelled').length} cancelled.
        </p>
      )}

      {(scanning || pass) && (
        <div className="kitchen-modal" role="dialog" aria-modal="true" aria-label="Member pass">
          <div className="kitchen-modal-card">
            {scanning ? (
              <>
                <h2>Scan a member pass</h2>
                <QrScanner hint="Hold the member’s BEASTY card inside the square." onCode={(t) => void verifyPass(t)} />
                <button onClick={() => setScanning(false)}>Close</button>
              </>
            ) : pass?.kind === 'ok' ? (
              <>
                <h2 className={pass.honours ? 'kitchen-pass-ok' : 'kitchen-pass-none'}>
                  {pass.honours ? 'Valid pass' : 'No paid membership'}
                </h2>
                <p className="kitchen-pass-name">{pass.name}</p>
                <p>
                  {pass.honours
                    ? `Honour ${pass.honours}. This code is now used and cannot be scanned again.`
                    : 'They are a BEASTY member, but no paid membership is active on their account, so there is no member offer to honour.'}
                </p>
                <button onClick={() => setPass(null)}>Done</button>
              </>
            ) : (
              <>
                <h2 className="kitchen-pass-none">Not accepted</h2>
                <p>{pass?.kind === 'error' ? pass.message : ''}</p>
                <div className="kitchen-actions">
                  <button onClick={() => setPass(null)}>Close</button>
                  <button
                    className="is-go"
                    onClick={() => {
                      setPass(null)
                      setScanning(true)
                    }}
                  >
                    Scan again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
