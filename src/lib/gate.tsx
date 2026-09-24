import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GATED, type GateKey } from '../data/membership'
import { captureReferral, captureVia, fetchAccount, type Account, type AccountState } from './account'
import { captureAttribution, sendVisit } from './attribution'
import { startTracking } from './track'

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
  gate: (key: GateKey, go: () => void, what?: string) => boolean
  setAccount: (a: Account | null) => void
  refresh: () => Promise<void>
}

const Ctx = createContext<GateValue | null>(null)

export function GateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccountState>('offline')
  const [loading, setLoading] = useState(true)
  const account = state === 'offline' ? null : state
  const reachable = state !== 'offline'
  const [asking, setAsking] = useState<{ key: GateKey; what?: string } | null>(null)

  const refresh = useCallback(async () => {
    setState(await fetchAccount())
    setLoading(false)
  }, [])

  const setAccount = useCallback((a: Account | null) => setState(a), [])

  useEffect(() => {
    // How this visit arrived, read before anything below tidies the address.
    startTracking()
    // A shared QR lands here first; the code has to be kept before anything
    // rewrites the URL or the referrer loses their credit.
    captureReferral()
    captureVia()
    // What brought this visit, for the sign-up, and one visit a day for the numbers.
    captureAttribution()
    sendVisit()
    void refresh()
  }, [refresh])

  /*
    RE-ASK WHEN THE TAB COMES BACK, which is what makes checkout finish.

    Paying happens in Stripe's tab, and the thing that marks a member active is
    a webhook the browser never sees. So the member paid, came back, and the
    screen still read "chosen, not yet paid" until they reloaded by hand —
    which looks exactly like a payment that failed, on the screen where that is
    the most expensive thing it could look like.

    Only when the account is already loaded and only on becoming visible, so
    this is not a poll: a signed-out visitor switching tabs asks nothing.
  */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && state !== 'offline' && state) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [refresh, state])

  const gate = useCallback(
    /*
      `what` NAMES THE THING THAT WAS TAPPED, for the cases where one key
      covers several destinations.

      The dock is the only one: his note gates "any of them lower 4 buttons" as
      a group, so all four shared the `profile` key — and therefore all four
      said "Open your profile". Tapping BEASTY Designs, Share & Scan, or (once
      it existed) News was answered with a prompt about somebody's profile.

      It does not weaken the reason GATED exists. The copy for a key still
      lives in one place; this is the app's OWN name for itself, the same
      string the tile is labelled with, so the prompt cannot drift from the
      thing it is about.
    */
    (key: GateKey, go: () => void, what?: string) => {
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
      setAsking({ key, what })
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
          what={asking.what ?? GATED[asking.key]}
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
    <div className="gate" role="dialog" aria-modal="true" aria-label="Sign in or sign up to continue">
      <button className="gate-scrim" onClick={onClose} aria-label="Not now" />
      <div className="gate-card">
        <p className="gate-what">{what}</p>
        <p className="gate-lead">
          Free, and it opens the whole directory — every city, the reels, the gallery and search.
        </p>
        {/*
          ONE BUTTON, NAMED FOR BOTH THINGS IT DOES.

          It said "Sign up free" and nothing else, so a member who already had
          an account and was looking for a way back in was shown a wall that
          only offered to make them a second one. The screen behind it has
          always been sign-in as well as sign-up — the server decides which
          from the address, deliberately without telling anyone — but nothing
          on the way in said so.

          Still one button rather than two, because two would need to know
          which one you are, and finding that out is exactly the membership
          oracle the server refuses to be.
        */}
        <button className="btn-primary" onClick={onJoin}>
          Sign in or sign up free
        </button>
        <p className="gate-fine">
          Already a member? Same button. We email you a six-digit code; there is no password.
        </p>
        <button className="gate-later" onClick={onClose}>
          Keep looking around
        </button>
      </div>
    </div>
  )
}
