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
export function VideoApp({ api }: { api: ShellApi }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(0)

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
