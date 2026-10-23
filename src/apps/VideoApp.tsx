import { useEffect, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { REELS } from '../data/clips'
import type { Reel } from '../data/clips'
import { BrandLogo } from '../ios/BrandLogo'
import type { ShellApi } from '../ios/Device'

/**
 * The video window: businesses' own reels, full bleed, one at a time.
 *
 * His brief was two sentences — "I want the videos to autoplay behind… autoplay
 * when open" and, from the operator, "is there a way you can grab the video
 * from Instagram and let it play instantly rather than it logging into
 * Instagram and taking all that time". Plus the reason: "most people have a
 * short attention span."
 *
 * WHY THIS SHAPE. A grid of tiles all playing at once is the obvious
 * alternative and it is the wrong one: every mobile browser throttles
 * simultaneous video, so half the tiles would sit on a frozen first frame — a
 * wall of stills pretending to be a wall of video. One clip filling the screen
 * plays reliably, costs one decode, and is the shape everybody already knows
 * from every other app on the phone it is imitating.
 *
 * ONLY THE VISIBLE ONE PLAYS. An IntersectionObserver starts the clip that is
 * on screen and pauses the rest, which is what keeps a long list cheap and what
 * makes "autoplay when open" true rather than aspirational.
 */
const SPEAKER_OFF = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
)

/*
  The window's heading. Glenn, 2026-10-19, 8:16 pm, with a mock-up of this
  screen headed "Explore hidden gems 💎": "What do you think bro? … Instead of
  Watch". The button on the home screen and the app's name stay "Watch"; only
  the heading the reels sit under changes.
*/
const HEADING = 'Explore hidden gems 💎'

const SPEAKER_ON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
)

const HEART = (filled: boolean) => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
       strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.5 0 5.7 3.4 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
  </svg>
)

const PLANE = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.5 3 10.2 14.3M21.5 3l-7 18.3-4.3-7-7-4.3L21.5 3Z" />
  </svg>
)

/*
  A FRESH ORDER EVERY TIME THE WINDOW OPENS. Leon, 2026-10-22: "randomize the
  video feed scroll". The feed had always opened on the same clip, newest
  business first, so whoever was added last got every first view and the rest
  waited further down than most people scroll. Fisher-Yates over a copy, once
  per opening (a useState initialiser), so the order holds while somebody is
  scrolling and changes the next time they come in.
*/
function shuffled(list: Reel[]): Reel[] {
  const out = list.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/*
  LIKES ARE THIS PHONE'S OWN. The heart is Instagram's gesture, so it is here,
  but there is no account behind it yet and no count: a number would have to be
  made up, and a made-up number on a business's film is a claim about them.
  What the heart does today is remember, on this device, which films somebody
  liked. Storage can be missing or refuse (private mode), so every read and
  write is guarded and the heart still works for the visit.
*/
const LIKES_KEY = 'beasty.reelLikes'
function readLikes(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}
function writeLikes(likes: Set<string>) {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify([...likes]))
  } catch {
    /* Not kept past this visit. */
  }
}

/* Two taps inside this window are a like; one tap is the sound toggle. */
const DOUBLE_TAP_MS = 260

export function VideoApp({ api }: { api: ShellApi }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(0)
  /*
    SILENT UNTIL TAPPED, then it stays on — Instagram's behaviour, and the only
    one browsers allow. Autoplay is permitted ONLY while muted, so a reel has to
    start silent whatever we would prefer; sound can then be turned on because a
    tap is a user gesture and that is what unlocks it.

    The preference is per-visit, not per-clip. Turning the sound on for one reel
    and having the next one arrive silent is the thing that makes people give up
    and put the phone down.
  */
  const [sound, setSound] = useState(false)
  /** Which reel just had its link copied, for the toast. Null when none. */
  const [shared, setShared] = useState<string | null>(null)
  const [reels] = useState(() => shuffled(REELS))
  const [likes, setLikes] = useState(readLikes)
  /** The reel whose heart is bursting from a double tap, for the animation. */
  const [burst, setBurst] = useState<string | null>(null)
  const tapTimer = useRef<number | null>(null)

  const like = (src: string, on?: boolean) =>
    setLikes((prev) => {
      const next = new Set(prev)
      if (on ?? !next.has(src)) next.add(src)
      else next.delete(src)
      writeLikes(next)
      return next
    })

  /*
    ONE TAP IS SOUND, TWO ARE A LIKE, as on Instagram. The single tap waits out
    the double-tap window before it toggles, so a like does not also flip the
    sound on the way. A double tap only ever likes (never unlikes), which is
    the platform's rule too; the heart in the rail is the way to take it back.
  */
  const tap = (src: string) => {
    if (tapTimer.current !== null) {
      window.clearTimeout(tapTimer.current)
      tapTimer.current = null
      like(src, true)
      setBurst(src)
      window.setTimeout(() => setBurst((b) => (b === src ? null : b)), 900)
      return
    }
    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null
      setSound((on) => !on)
    }, DOUBLE_TAP_MS)
  }
  useEffect(() => () => {
    if (tapTimer.current !== null) window.clearTimeout(tapTimer.current)
  }, [])

  useEffect(() => {
    const root = wrap.current
    if (!root) return
    const items = [...root.querySelectorAll<HTMLElement>('.reel')]
    /*
      A high threshold on purpose. At 0.5 two clips can both qualify mid-scroll
      and the pair fight over which is playing; at 0.8 exactly one ever wins.
    */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target.querySelector('video')
          if (!v) continue
          if (e.isIntersecting) {
            setLive(items.indexOf(e.target as HTMLElement))
            void v.play().catch(() => {
              /* A browser that refuses autoplay leaves the poster up rather
                 than throwing — the tap-to-play control below still works. */
            })
          } else {
            v.pause()
            v.currentTime = 0
          }
        }
      },
      { threshold: 0.8 },
    )
    items.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  /*
    Applied in an effect rather than as a `muted` prop.

    React sets `muted` as a PROPERTY on first mount and then leaves it alone —
    it is one of the attributes it does not reliably re-apply — so a re-render
    with muted={false} can leave a video silently muted. Writing it to every
    element directly is the version that actually works.

    If a browser refuses to play unmuted, the clip drops back to silent instead
    of freezing on a paused frame.
  */
  useEffect(() => {
    const root = wrap.current
    if (!root) return
    for (const v of root.querySelectorAll('video')) {
      v.muted = !sound
      if (!v.paused) {
        void v.play().catch(() => {
          v.muted = true
          setSound(false)
        })
      }
    }
  }, [sound, live])

  if (!reels.length) {
    return (
      <AppChrome title={HEADING} onBack={api.closeApp} tint="#0b0b0d">
        <div className="plain">
          <p>No clips yet. A business's video shows up here as soon as one is added to them.</p>
        </div>
      </AppChrome>
    )
  }

  return (
    <AppChrome title={HEADING} onBack={api.closeApp} tint="#0b0b0d">
      {/*
        The scroller is the pager. Scroll-snap does the paging natively, which
        is smoother than any handler and keeps a flung scroll landing on a clip
        rather than between two.
      */}
      <div className="reels" ref={wrap}>
        {reels.map((r, i) => (
          <section className="reel" key={r.src} aria-label={`${r.name}, video ${i + 1} of ${reels.length}`}>
            <video
              src={r.src}
              poster={r.poster}
              muted
              loop
              playsInline
              preload={i === 0 ? 'auto' : 'metadata'}
              autoPlay={i === 0}
              /* Drives the progress line at the foot, as on Instagram. A CSS
                 variable on the reel rather than state: four updates a second
                 on every visible clip would re-render the whole feed. */
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.duration) v.parentElement?.style.setProperty('--reel-progress', String(v.currentTime / v.duration))
              }}
            />
            {/*
              THE WHOLE FRAME IS THE BUTTON, which is what a thumb expects here
              and what every app this one is imitating does: one tap for sound,
              two for a like. It sits above the scrim and below the caption and
              the rail, so their controls still do their own thing.
            */}
            <button
              className="reel-sound"
              onClick={() => tap(r.src)}
              aria-pressed={sound}
              aria-label={sound ? `Mute ${r.name}` : `Play sound for ${r.name}`}
            >
              <span className="reel-sound-badge" aria-hidden="true">
                {sound ? SPEAKER_ON : SPEAKER_OFF}
              </span>
            </button>
            {burst === r.src && (
              <span className="reel-burst" aria-hidden="true">
                {HEART(true)}
              </span>
            )}
            {/* The scrim is a separate layer so the film is never dimmed toward
                the page behind it — only toward black, predictably. */}
            <span className="reel-scrim" aria-hidden="true" />
            {/*
              THE RAIL, down the right-hand side where Instagram keeps it: like,
              then share.

              SHARE SENDS THEM TO THE BUSINESS, not to a video player. "Is it
              possible to add a share button to these all the video pages?" —
              the link is the brand's own `?b=` deep link, which opens their
              page with their film playing on it, the thing worth sending.
              Web Share gives the real iOS sheet; clipboard is the fallback.
            */}
            <div className="reel-rail">
              <button
                className={`reel-like${likes.has(r.src) ? ' is-on' : ''}`}
                onClick={() => like(r.src)}
                aria-pressed={likes.has(r.src)}
                aria-label={likes.has(r.src) ? `Unlike ${r.name}` : `Like ${r.name}`}
              >
                {HEART(likes.has(r.src))}
              </button>
              <button
                className="reel-share"
                onClick={async () => {
                  const url = `${location.origin}/?b=${encodeURIComponent(r.brandId)}`
                  try {
                    if (navigator.share) await navigator.share({ title: r.name, url })
                    else {
                      await navigator.clipboard.writeText(url)
                      setShared(r.src)
                      window.setTimeout(() => setShared(null), 2000)
                    }
                  } catch {
                    /* Sheet dismissed. Not an error worth a message. */
                  }
                }}
                aria-label={`Share ${r.name}`}
              >
                {PLANE}
              </button>
            </div>
            {shared === r.src && (
              <span className="reel-share-toast" role="status">
                Link copied
              </span>
            )}
            <div className="reel-meta">
              {/* Avatar, name, and a pill to their page: Instagram's
                  profile-and-Follow row. There is nothing to follow yet, so
                  the pill says what it does. */}
              <div className="reel-who">
                {r.logo && (
                  <button className="reel-avatar" onClick={() => api.openApp(r.brandId)} aria-hidden="true" tabIndex={-1}>
                    <BrandLogo logo={r.logo} size={34} masked={false} />
                  </button>
                )}
                <button className="reel-name" onClick={() => api.openApp(r.brandId)}>
                  {r.name}
                </button>
                <button className="reel-visit" onClick={() => api.openApp(r.brandId)} tabIndex={-1} aria-hidden="true">
                  Visit
                </button>
              </div>
              <p className="reel-line">{r.line}</p>
              {/* A reviewer's credit opens their profile — the same protocol
                  as on the business's page. The note is Instagram's audio line. */}
              <p className="reel-credit">
                <span className="reel-note" aria-hidden="true">♪</span>
                {r.by ? (
                  <a href={`https://www.instagram.com/${r.by}/`} target="_blank" rel="noopener noreferrer">
                    {r.credit}
                  </a>
                ) : (
                  r.credit
                )}
              </p>
            </div>
            <span className="reel-progress" aria-hidden="true" />
            {i === live && reels.length > 1 && i === 0 && (
              <span className="reel-hint" aria-hidden="true">
                Scroll for more
              </span>
            )}
          </section>
        ))}
      </div>
    </AppChrome>
  )
}
