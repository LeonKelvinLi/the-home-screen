import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GATED, type GateKey } from '../data/membership'
import { captureReferral, fetchAccount, type Account, type AccountState } from './account'

/**
 * WHAT A SIGNED-OUT VISITOR MAY DO, and the prompt when they may not.
 *
 * His "New Users" note: "After new users enter the BEASTY page to explore the
 * website they will have a limited access… they are free to explore any
 * Affiliate's page on the 1st - 48; BEASTY GOODS & BEASTY SERVICES. But when
 * they tap the right arrow to view more city's or the video reel tab, gallery
 * tab, 1, 2, 3 or any of them lower 4 buttons or the search bar, a quick prompt
 * will pop up to direct them to the sign up page."
 *
 * SO THE DEFAULT IS OPEN, NOT SHUT. Everything a visitor lands on works —
 * the first two flagship pages and every business page on them. The gate is a
 * short list of doors, not a wall around the app, and it is written as a list of
 * doors here so it cannot quietly grow into one.
 *
 * The account is loaded ONCE at the top and shared, because a gate that asks
 * the server on every tap would put a network round trip in front of a button
 * press — and would let a slow connection show the sign-up prompt to somebody
 * who is already a member.
 */

interface GateValue {
  account: Account | null
  loading: boolean
  /** Run `go` if they may, otherwise raise the prompt. Returns whether it ran. */
  gate: (key: GateKey, go: () => void) => boolean
  setAccount: (a: Account | null) => void
  refresh: () => Promise<void>
}

const Ctx = createContext<GateValue | null>(null)

export function GateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccountState>('offline')
  const [loading, setLoading] = useState(true)
  const account = state === 'offline' ? null : state
  const reachable = state !== 'offline'
  const [asking, setAsking] = useState<GateKey | null>(null)

  const refresh = useCallback(async () => {
    setState(await fetchAccount())
    setLoading(false)
  }, [])

  const setAccount = useCallback((a: Account | null) => setState(a), [])

  useEffect(() => {
    // A shared QR lands here first; the code has to be kept before anything
    // rewrites the URL or the referrer loses their credit.
    captureReferral()
    void refresh()
  }, [refresh])

  const gate = useCallback(
    (key: GateKey, go: () => void) => {
      /*
        WHILE LOADING, LET THEM THROUGH. The alternative is showing a sign-up
        prompt to a paying member because their session lookup had not landed
        yet, which is a far worse failure than a signed-out visitor seeing one
        extra screen for a moment.
      */
      /*
        LET THEM THROUGH WHILE LOADING, AND WHENEVER THE SERVER CANNOT BE ASKED.

        Showing a sign-up prompt to a paying member because their session lookup
        had not landed yet is a worse failure than a signed-out visitor seeing
        one extra screen. And an API that is down must not lock the directory:
        the gate is a sales prompt, not a security boundary — nothing behind it
        is private, so failing open costs nothing and failing shut costs every
        visitor for as long as the outage lasts.
      */
      if (loading || account || !reachable) {
        go()
        return true
      }
      setAsking(key)
      return false
    },
    [loading, account],
  )

  const value = useMemo<GateValue>(
    () => ({ account, loading, gate, setAccount, refresh }),
    [account, loading, gate, setAccount, refresh],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      {asking && (
        <GatePrompt
          what={GATED[asking]}
          onClose={() => setAsking(null)}
          onJoin={() => {
            setAsking(null)
            window.dispatchEvent(new CustomEvent('beasty:join'))
          }}
        />
      )}
    </Ctx.Provider>
  )
}

export function useGate(): GateValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useGate outside GateProvider')
  return v
}

/**
 * The prompt. "A quick prompt" — his words — so it names the one thing they
 * tapped rather than listing everything behind the gate, and it offers a way
 * back to looking around. A dead end here is a closed tab.
 */
function GatePrompt({
  what,
  onClose,
  onJoin,
}: {
  what: string
  onClose: () => void
  onJoin: () => void
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div className="gate" role="dialog" aria-modal="true" aria-label="Sign up to continue">
      <button className="gate-scrim" onClick={onClose} aria-label="Not now" />
      <div className="gate-card">
        <p className="gate-what">{what}</p>
        <p className="gate-lead">
          Sign up free to open the whole directory — every city, the reels, the gallery and search.
        </p>
        <button className="btn-primary" onClick={onJoin}>
          Sign up free
        </button>
        <button className="gate-later" onClick={onClose}>
          Keep looking around
        </button>
      </div>
    </div>
  )
}
