import { useEffect, useState } from 'react'

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
      Retire untouched WITHOUT writing the key. Ignored is not declined: an
      unnoticed bubble gets another chance on a later visit, where an
      explicitly dismissed one never comes back.
    */
    const t = window.setTimeout(() => setShown(false), HIDE_MS)
    return () => window.clearTimeout(t)
  }, [shown])

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
        <div className="a2hs-coach" onClick={dismiss}>
          <img className="a2hs-icon" src="/apple-touch-icon.png" alt="" />
          <p className="a2hs-text">
            Tap the{' '}
            <svg
              className="a2hs-share"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 8.5H6.75A1.75 1.75 0 0 0 5 10.25v8A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25v-8A1.75 1.75 0 0 0 17.25 8.5H16" />
              <path d="M12 14.5V3.8M8.6 6.9 12 3.5l3.4 3.4" />
            </svg>
            {/* The glyph carries the meaning for eyes; this carries it for a reader. */}
            <span className="a2hs-sr">share icon</span> below, then{' '}
            <strong>“Add to Home Screen.”</strong>
          </p>
          <button className="a2hs-close" aria-label="Dismiss" onClick={dismiss}>
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
    </div>
  )
}
