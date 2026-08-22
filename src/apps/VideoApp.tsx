import { useEffect, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { REELS } from '../data/clips'
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

const SPEAKER_ON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
)

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

  if (!REELS.length) {
    return (
      <AppChrome title="Watch" onBack={api.closeApp} tint="#0b0b0d">
        <div className="plain">
          <p>No clips yet. A business's video shows up here as soon as one is added to them.</p>
        </div>
      </AppChrome>
    )
  }

  return (
    <AppChrome title="Watch" onBack={api.closeApp} tint="#0b0b0d">
      {/*
        The scroller is the pager. Scroll-snap does the paging natively, which
        is smoother than any handler and keeps a flung scroll landing on a clip
        rather than between two.
      */}
      <div className="reels" ref={wrap}>
        {REELS.map((r, i) => (
          <section className="reel" key={r.src} aria-label={`${r.name}, video ${i + 1} of ${REELS.length}`}>
            <video
              src={r.src}
              poster={r.poster}
              muted
              loop
              playsInline
              preload={i === 0 ? 'auto' : 'metadata'}
              autoPlay={i === 0}
            />
            {/*
              THE WHOLE FRAME IS THE BUTTON, which is what a thumb expects here
              and what every app this one is imitating does. It sits above the
              scrim and below the caption, so tapping the business's name still
              opens their page rather than toggling the sound.
            */}
            <button
              className="reel-sound"
              onClick={() => setSound((on) => !on)}
              aria-pressed={sound}
              aria-label={sound ? `Mute ${r.name}` : `Play sound for ${r.name}`}
            >
              <span className="reel-sound-badge" aria-hidden="true">
                {sound ? SPEAKER_ON : SPEAKER_OFF}
              </span>
            </button>
            {/* The scrim is a separate layer so the film is never dimmed toward
                the page behind it — only toward black, predictably. */}
            <span className="reel-scrim" aria-hidden="true" />
            <div className="reel-meta">
              <button className="reel-name" onClick={() => api.openApp(r.brandId)}>
                {r.name}
              </button>
              <p className="reel-line">{r.line}</p>
              <p className="reel-credit">{r.credit}</p>
            </div>
            {i === live && REELS.length > 1 && i === 0 && (
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
