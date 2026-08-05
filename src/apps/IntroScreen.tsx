import { useState } from 'react'
import { BLANK_PAGES } from './registry'
import { LISTED_KITCHENS } from '../data/brands'
import { GLYPHS } from '../data/glyphs'

/**
 * The landing screen, shown before the home screen.
 *
 * Four ways in, laid out the way the dock is: Phone, EATS, Water, Share.
 * EATS is the one that opens the home screen; the other three are the
 * operator's own — their number, their water company, and a way to pass the
 * link on.
 */

/*
 * OPERATOR CONTACT — FILL THESE IN.
 *
 * Deliberately empty rather than filled with a plausible-looking number. The
 * old hub shipped `tel:+10000000000`, which is a dead dial that looks live,
 * and a customer who taps a fake number and reaches nobody is worse off than
 * one who is told the line is not connected yet. The Phone panel below reads
 * whichever of these is set and says so plainly when neither is.
 */
export const OPERATOR_PHONE: string = ''
export const OPERATOR_EMAIL: string = ''

interface Props {
  onEnter: () => void
  onWater: () => void
  /** Enter and land straight on the Reserve screen. */
  onJoin: () => void
  /** Enter and land straight on BEASTY Designs. */
  onDesigns: () => void
}

export function IntroScreen({ onEnter, onWater, onJoin, onDesigns }: Props) {
  const [panel, setPanel] = useState<'none' | 'phone' | 'share'>('none')
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.origin
    // Web Share is the native sheet on iOS; the clipboard is the fallback
    // everywhere else, and on a desktop browser where the sheet does not exist.
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BEASTY EATS', url })
        return
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setPanel('share')
    }
  }

  return (
    <div className="intro">
      <div className="intro-mark">
        <img src="/biggie.webp" alt="" className="intro-biggie" draggable={false} />
        <p className="intro-word">
          <span>BEASTY</span>
          <span>EATS</span>
        </p>
        <p className="intro-where">Richmond, California</p>
      </div>

      {/*
        Open, not behind a tap. This is why the business exists, and a landing
        page that makes you hunt for that is just a splash screen.

        Written in Glenn's own voice and kept close to how he tells it. The tone
        stays plain deliberately — no eulogy, no adjectives doing the feeling
        for the reader. Biggie has died; the dog on this screen is a memorial,
        not a mascot, which is worth knowing before anyone edits that artwork.
      */}
      <div className="intro-story">
        <p>I&rsquo;m Glenn Malicdem, and I built this in Richmond.</p>
        <p>
          I had a dog called Biggie. Walking him is how I got to know this place. The same
          streets every day, the same people, the small businesses you only ever find on foot.
        </p>
        <p>Biggie is in heaven now, watching me work hard for him.</p>
        <p>
          This is for the places we walked past. One screen to find them, one cart to order
          from all of them.
        </p>
      </div>

      {/*
        The pitch to the next business, on the front door rather than eight
        pages deep.

        Every claim here is one the Reserve screen already makes and the app can
        actually keep: your own icon, your own prices, and however many blank
        tiles genuinely exist. NOTHING about cost — no fee has ever been agreed,
        and "free to list" is a commercial term, not a design decision.
      */}
      <button className="intro-join" onClick={onJoin}>
        <span className="intro-join-head">Run a local business?</span>
        <span className="intro-join-body">
          Your own icon on this home screen, your own menu, your own prices, alongside{' '}
          {LISTED_KITCHENS.length} local businesses. {BLANK_PAGES} pages of blank tiles are waiting.
        </span>
        <span className="intro-join-cta">
          Claim a tile
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h13M12 6l6 6-6 6" />
          </svg>
        </span>
      </button>

      {/*
        BEASTY Designs. Its own button rather than a line in the join section:
        the two pitch different things to the same person — a tile on this
        screen, and a website of their own — and folding them together makes
        both vaguer.

        The mark is drawn in glyphs.ts, not imported. The reference for it was
        a Vecteezy stock file, which is licensed artwork and not ours to ship.
      */}
      <button className="intro-designs" onClick={onDesigns}>
        <span className="intro-designs-mark">
          <svg viewBox="0 0 100 100" width="34" height="34" aria-hidden="true">
            <path d={GLYPHS.design} fill="currentColor" fillRule="evenodd" />
          </svg>
        </span>
        <span className="intro-designs-text">
          <span className="intro-designs-name">BEASTY Designs</span>
          <span className="intro-designs-sub">Websites, apps and online ordering</span>
        </span>
        <svg className="intro-designs-go" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h13M12 6l6 6-6 6" />
        </svg>
      </button>

      <div className="intro-dock">
        <button className="intro-btn" onClick={() => setPanel(panel === 'phone' ? 'none' : 'phone')}>
          <Glyph kind="phone" />
          <em>Phone</em>
        </button>

        {/* The primary. Sized and coloured so it is obviously the way in. */}
        <button className="intro-btn is-primary" onClick={onEnter}>
          <Glyph kind="eats" />
          <em>EATS</em>
        </button>

        <button className="intro-btn" onClick={onWater}>
          <Glyph kind="water" />
          <em>Water</em>
        </button>

        <button className="intro-btn" onClick={share}>
          <Glyph kind="share" />
          <em>{copied ? 'Copied' : 'Share'}</em>
        </button>
      </div>

      {panel === 'phone' && (
        <div className="intro-panel">
          {OPERATOR_PHONE || OPERATOR_EMAIL ? (
            <>
              {OPERATOR_PHONE && (
                <a href={`tel:${OPERATOR_PHONE.replace(/[^0-9+]/g, '')}`}>{OPERATOR_PHONE}</a>
              )}
              {OPERATOR_EMAIL && <a href={`mailto:${OPERATOR_EMAIL}`}>{OPERATOR_EMAIL}</a>}
            </>
          ) : (
            <p>
              The phone line and email are not connected yet. Everything on the home screen
              lists each kitchen&rsquo;s own number.
            </p>
          )}
        </div>
      )}

      {panel === 'share' && (
        <div className="intro-panel">
          <p>{window.location.origin}</p>
        </div>
      )}

      <button className="intro-enter" onClick={onEnter}>
        Enter
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  )
}

/** Small flat glyphs, drawn rather than imported, so the intro adds no weight. */
function Glyph({ kind }: { kind: 'phone' | 'eats' | 'water' | 'share' }) {
  const common = { viewBox: '0 0 24 24', 'aria-hidden': true, width: 26, height: 26 }
  if (kind === 'phone')
    return (
      <svg {...common} fill="currentColor">
        <path d="M6.6 2.9c.5-.2 1.1 0 1.4.5l1.7 3a1.2 1.2 0 0 1-.3 1.5l-1.3 1a11 11 0 0 0 5 5l1-1.3c.4-.4 1-.5 1.5-.3l3 1.7c.5.3.7.9.5 1.4l-.8 2c-.2.6-.8 1-1.5 1A15.6 15.6 0 0 1 2.7 5.2c0-.7.4-1.3 1-1.5z" />
      </svg>
    )
  if (kind === 'water')
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M12 3.2c3.4 4 5.4 6.7 5.4 9.2a5.4 5.4 0 0 1-10.8 0c0-2.5 2-5.2 5.4-9.2Z" />
      </svg>
    )
  if (kind === 'share')
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <path d="M12 15V3.6M8.4 7.2 12 3.6l3.6 3.6" />
        <path d="M5.5 12v7.4h13V12" />
      </svg>
    )
  // EATS: Biggie himself, matching the app icon.
  return <img src="/biggie.webp" alt="" className="intro-btn-dog" />
}
