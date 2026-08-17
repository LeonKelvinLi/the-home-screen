import { useEffect, useState } from 'react'

/**
 * How to put this on the home screen, shown rather than described.
 *
 * The prompt this replaces said "tap the share icon below, then Add to Home
 * Screen", and the operator caught that it is wrong on his own phone: "that
 * button is only on old iOS. Those that updated have a … on the right." He is
 * right, and the fix is not a better sentence. Safari has moved this control
 * twice and will move it again, and a customer who cannot find the button does
 * not read harder — they leave.
 *
 * So the guide DRAWS the toolbar and points at the thing. A picture of a
 * toolbar survives a version bump that breaks a sentence, because the customer
 * matches what they see rather than parsing what they read.
 *
 * Three steps, on a loop, because this is watched rather than studied.
 */

/**
 * Which control this iOS shows, from the OS version in the user agent.
 *
 * iOS 18 moved the page menu into the address bar as a three-dot button and
 * left the share sheet where it was; before that, share was the only route. The
 * guide names the one that is actually on screen and draws the other as the
 * fallback, rather than asserting either.
 */
function iosMajor(): number | null {
  const m = /OS (\d+)[_.]/.exec(navigator.userAgent)
  return m ? Number(m[1]) : null
}

const STEP_MS = 2600

export function InstallGuide({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const major = iosMajor()
  /* Unknown version is treated as new: a customer on 18 who is shown the old
     route finds nothing, where a customer on 16 shown the new route still has
     the share button drawn beside it. The failure is asymmetric. */
  const dots = major === null || major >= 18

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const t = window.setInterval(() => setStep((s) => (s + 1) % 3), STEP_MS)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="ig-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-label="How to install">
      <div className="ig" onClick={(e) => e.stopPropagation()}>
        <h2 className="ig-title">Keep BEASTY on your home screen</h2>
        <p className="ig-sub">Three taps, and it opens like an app — full screen, no address bar.</p>

        {/*
          A drawn phone rather than a screenshot. A screenshot of Safari ages the
          moment Apple ships a new one, and it would also be a picture of
          somebody else's interface sitting inside ours.
        */}
        <div className="ig-stage" aria-hidden="true">
          <div className="ig-phone">
            <div className="ig-screen">
              {/* Step three: the icon lands on a home screen. */}
              <div className={`ig-grid${step === 2 ? ' is-in' : ''}`}>
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i} className="ig-app" />
                ))}
                <span className="ig-app is-ours" />
              </div>

              {/* Step two: the menu, with the row we care about lit. */}
              <div className={`ig-sheet${step === 1 ? ' is-up' : ''}`}>
                <span className="ig-row" />
                <span className="ig-row is-target">
                  <span className="ig-row-mark" />
                  Add to Home Screen
                </span>
                <span className="ig-row" />
              </div>
            </div>

            {/* The toolbar, always drawn, with the tap ring on step one. */}
            <div className="ig-bar">
              <span className="ig-bar-url" />
              <span className={`ig-bar-btn${step === 0 ? ' is-tapped' : ''}`}>
                {dots ? (
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <circle cx="5" cy="12" r="1.9" />
                    <circle cx="12" cy="12" r="1.9" />
                    <circle cx="19" cy="12" r="1.9" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15V3M12 3 8 7M12 3l4 4" />
                    <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                  </svg>
                )}
              </span>
            </div>
          </div>
        </div>

        <ol className="ig-steps">
          <li className={step === 0 ? 'is-on' : ''}>
            Tap the {dots ? <strong>•••</strong> : <strong>share</strong>} button
            {dots ? ' in the address bar' : ' at the bottom'}
            {/*
              Both are named, always. Whichever one this phone actually has, the
              other sentence is the one that rescues somebody the detection got
              wrong — and it costs six words.
            */}
            <em>{dots ? ' — or the share arrow, on older iPhones' : ' — or ••• in the address bar, if you see that instead'}</em>
          </li>
          <li className={step === 1 ? 'is-on' : ''}>
            Scroll down and choose <strong>Add to Home Screen</strong>
          </li>
          <li className={step === 2 ? 'is-on' : ''}>
            Tap <strong>Add</strong>. The icon appears with your other apps.
          </li>
        </ol>

        <button className="ig-done" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
