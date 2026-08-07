import { useState } from 'react'
import { AppChrome } from './AppChrome'
import type { ShellApi } from '../ios/Device'

/**
 * Share & Scan — a code to point a camera at, not a menu.
 *
 * The dock slot this replaced opened a deli's brand page, which is not what
 * either word in its name means. This is the literal thing: a QR that opens
 * the site, and a button that hands the link on.
 *
 * The code is a build-time asset (tools/qr.py), not generated in the browser.
 * A code built from window.location would encode localhost in development and
 * whatever host it happened to be served from anywhere else — useless the
 * moment someone actually points a camera at it. It has to be the live URL.
 */

/** Must match the URL baked into public/qr.svg by tools/qr.py. */
const SITE = 'https://the-home-screen.onrender.com'

export function ShareApp({ api }: { api: ShellApi }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    // Web Share is the native sheet on iOS; clipboard is the fallback on a
    // desktop browser, where the sheet does not exist.
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BEASTY', url: SITE })
        return
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(SITE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Nothing to do: the URL is printed on screen either way. */
    }
  }

  return (
    <AppChrome title="Share & Scan" onBack={api.closeApp} className="is-beasty">
      <div className="share">
        <p className="share-lead">Point a phone camera at this to open BEASTY.</p>

        {/*
          White card, and a generous margin around the code.

          A QR needs a quiet zone to be found at all. The generator emits none
          — border=0 — because this padding is more clear space than the four
          modules the spec asks for, and it keeps the card looking deliberate
          rather than like an image with a white edge.
        */}
        <div className="share-card">
          <div className="share-qr">
            <img src="/qr.svg" alt={`QR code linking to ${SITE}`} />
            {/*
              Biggie over the middle. The code is error-correction H, so about
              a third of it can be obscured and still read; the mark covers far
              less than that. Verified by decoding a screenshot of this screen,
              not by assuming.
            */}
            <span className="share-qr-mark">
              <img src="/biggie.webp" alt="" draggable={false} />
            </span>
          </div>
        </div>

        <p className="share-url">{SITE.replace(/^https?:\/\//, '')}</p>

        <div className="share-actions">
          <button className="btn-primary" onClick={share}>
            {copied ? 'Link copied' : 'Share link'}
          </button>
        </div>

        <p className="brand-foot">
          Anyone who scans this lands on the same home screen you are looking at. No app to
          install.
        </p>
      </div>
    </AppChrome>
  )
}
