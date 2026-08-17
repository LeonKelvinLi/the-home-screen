import { useEffect, useState } from 'react'
import { InstallGuide } from './InstallGuide'

/**
 * The nudge to install — the coach mark the operator's old site showed: a
 * bubble a few seconds into the home screen, tail aimed down at Safari's
 * toolbar, naming the two taps that put this app on the real home screen.
 *
 * Advice, not a gate. It takes pointer events on its own box and nothing
 * else — no scrim, the screen behind stays fully usable — and it answers to
 * every way of saying no: a tap dismisses it for good, being ignored lets it
 * retire quietly and try again some other visit.
 */

/**
 * Once per device, same shape as the other fb.* keys. Written on a tap — an
 * ANSWER — and deliberately never on the timeout: a bubble nobody noticed has
 * not been declined, so it keeps one more chance on a later visit.
 */
const KEY = 'fb.a2hs.v1'

/**
 * "After a few seconds of entry" — the operator's timing. Late enough that
 * the customer is looking at the screen they would be installing rather than
 * the tail of the dialer handoff, early enough to still catch a first visit.
 */
const SHOW_MS = 4000

/** Untouched this long means unnoticed or unwanted. Either way it leaves on
 * its own, before a helpful bubble hardens into furniture. */
const HIDE_MS = 12000

/** Is the one sentence this bubble says actually true on this device? */
function shouldCoach(): boolean {
  const ua = navigator.userAgent

  /*
    iPhone/iPad Safari only. The instruction names Safari's share button and
    the tail points at Safari's bottom bar — on Android, on desktop, in any
    other browser, that flow does not exist in that form, so showing the
    bubble would be directions to a control that is not there.
  */
  if (!/iPhone|iPad/.test(ua)) return false
  /*
    Every browser on iOS wears the iPhone UA. The ones that are not Safari
    either brand themselves (CriOS/FxiOS/EdgiOS) or drop the Safari token the
    real one always carries (the in-app webviews) — and none of them draw the
    share button where the tail points.
  */
  if (!/Safari\//.test(ua) || /CriOS|FxiOS|EdgiOS/.test(ua)) return false

  /*
    Already installed: the bubble would be asking for what has been done.
    navigator.standalone is Safari's own flag; display-mode is the standard
    one the manifest requests. Either alone is enough to bail.
  */
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return false
  if (window.matchMedia('(display-mode: standalone)').matches) return false

  /*
    Answered once before. try/catch because Safari in private mode throws on
    localStorage rather than returning null — there the answer cannot be
    remembered, and offering again some visit is the lesser harm than a read
    error taking the whole home screen down with it.
  */
  try {
    if (localStorage.getItem(KEY) !== null) return false
  } catch {
    /* nothing saved that could say no */
  }
  return true
}

/** The answer, remembered — this is what "once per device" hangs on. */
function markSeen(): void {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    /* private mode — it will simply offer once more on another visit */
  }
}

export function AddToHomeCoach() {
  /* Decided once, at mount. Nothing in the verdict changes mid-session except
     the key this component writes itself, and it only writes on the way out. */
  const [eligible] = useState(shouldCoach)
  const [shown, setShown] = useState(false)
  /** Someone is on it — focus inside, or a pointer over it. Pauses the clock. */
  const [held, setHeld] = useState(false)
  /** The full guide, opened from the bubble rather than shown unasked. */
  const [guide, setGuide] = useState(false)

  useEffect(() => {
    if (!eligible) return
    /*
      The clock starts HERE, at the home screen's mount — this component is
      rendered by HomeScreen precisely so "a few seconds of entry" cannot be
      measured from the dialer or the landing page, which do not mount it.
      Cleared on unmount: StrictMode's double-invoked mount would otherwise
      leak a timer that shows the bubble on a screen that left.
    */
    const t = window.setTimeout(() => setShown(true), SHOW_MS)
    return () => window.clearTimeout(t)
  }, [eligible])

  useEffect(() => {
    if (!shown) return
    /*
      The bubble sits ON the Spotlight line — see .a2hs-layer for why that is
      the only band on a full page that is chrome rather than content — so that
      row stands down while it is up. Without this they occupy the same strip
      and the Search pill reads through the card.

      A class on the root rather than a `:has()` selector or a prop threaded up
      into HomeScreen: `:has()` is iOS 15.4+, and while this bubble only ever
      shows in Safari, a layout that silently reverts to overlapping on an older
      phone is exactly the kind of regression nobody would see reported.
    */
    const root = document.documentElement
    root.classList.add('a2hs-open')
    return () => root.classList.remove('a2hs-open')
  }, [shown])

  useEffect(() => {
    if (!shown || held) return
    /*
      Retire untouched WITHOUT writing the key. Ignored is not declined: an
      unnoticed bubble gets another chance on a later visit, where an
      explicitly dismissed one never comes back.

      `held` stops the clock the moment anyone is actually dealing with this —
      focus inside it or a pointer over it. A fixed twelve seconds with no way
      to pause is WCAG 2.2.1, and the real cost was measured rather than
      theoretical: this component mounts LAST on the home screen, so its
      Dismiss button is the 116th of 117 screen-reader stops. A VoiceOver user
      swiping toward it needs roughly thirty-five seconds to arrive at a bubble
      that disappears in twelve — meaning they could never answer it, never
      write the key, and would be shown the same prompt on every single visit,
      while a sighted user silences it with one tap.
    */
    const t = window.setTimeout(() => setShown(false), HIDE_MS)
    return () => window.clearTimeout(t)
  }, [shown, held])

  if (!eligible) return null

  const dismiss = () => {
    markSeen()
    setShown(false)
  }

  return (
    /*
      The wrapper is the live region, mounted EMPTY from the home screen's
      first commit: a status node that appears in the same moment as its text
      is not reliably announced — the lesson .home-live already records. It
      never paints and never takes a pointer; only the bubble inside it does.
    */
    <div className="a2hs-layer" role="status">
      {shown && (
        /* Any tap on the bubble is an answer: remembered, closed. */
        <div
          className="a2hs-coach"
          /*
            Tapping the bubble now OPENS THE GUIDE rather than only dismissing
            it. The bubble named a button that has since moved — the operator
            spotted it on his own phone — and a one-line prompt cannot both name
            a control accurately across iOS versions and stay one line. So the
            bubble asks, and the guide shows.

            It is still remembered as answered either way: somebody who opens
            the guide has engaged with the offer, and being asked again on the
            next visit would be the same nag.
          */
          onClick={() => {
            markSeen()
            setGuide(true)
          }}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={(e) => {
            // Only release when focus has actually left the bubble, not when
            // it moves between the text and the close button inside it.
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false)
          }}
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
        >
          <img className="a2hs-icon" src="/apple-touch-icon.png" alt="" />
          <p className="a2hs-text">
            Keep BEASTY on your home screen. <strong>Tap to see how</strong> — three taps and it
            opens like an app.
          </p>
          {/* stopPropagation, or closing the bubble would bubble up to the card
              behind it and open the guide — the one control whose whole job is
              "no thanks" would have done the opposite. */}
          <button
            className="a2hs-close"
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation()
              dismiss()
            }}
          >
            <svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true">
              <circle cx="13" cy="13" r="13" fill="rgba(120, 120, 128, 0.14)" />
              <path
                d="M9 9l8 8M17 9l-8 8"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      )}
      {guide && <InstallGuide onClose={() => setGuide(false)} />}
    </div>
  )
}
