import { useEffect, useRef, useState } from 'react'

/**
 * A business's own video on their page.
 *
 * TWO MODES, and the difference is who is hosting the pixels.
 *
 * `src` is footage the business gave us, sitting on our own origin. That plays
 * inline, muted and looping, the way a clip on a menu page should.
 *
 * `href` alone is a link to a post on somebody else's platform — an Instagram
 * reel, usually. We cannot embed those: there is no public embed that works
 * without a token, the iframe route is blocked, and pointing an <img> or
 * <video> at Instagram's CDN is both fragile and not ours to do. So that mode
 * draws a card that says where it goes and goes there. It deliberately does NOT
 * imitate a video thumbnail with a play triangle over a still, because a
 * control that looks like it plays here and instead leaves the app is a small
 * lie told to every customer who taps it.
 *
 * `credit` is required in both modes. It is their footage, and whose it is gets
 * said on screen rather than assumed.
 */

export interface Clip {
  /** An MP4 on our own origin, supplied by the business. Plays inline. */
  src?: string
  /** Poster frame for `src`. Also our own file. */
  poster?: string
  /** Their post, when that is all we have. Opens out. */
  href?: string
  /** Whose footage this is. Always shown. */
  credit: string
  /** Where `href` goes, for the label: 'Instagram', 'TikTok', 'YouTube'. */
  platform?: string
}

export function BrandClip({ clip, tint }: { clip: Clip; tint: string }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [reduced, setReduced] = useState(false)

  /*
    Autoplay is a preference, not a default. Someone who has asked their phone
    for less movement gets a still frame and a real play button instead — the
    element keeps its controls in that case so there is a way to start it.
  */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  /*
    Play only while it is on screen.

    preload="none" and an observer rather than autoplay, so scrolling past a
    brand page does not pull a video down a phone connection that nobody
    watched. Pausing off-screen matters as much as starting on-screen: a looping
    clip left running above the fold is a battery drain nobody asked for.
  */
  useEffect(() => {
    const el = ref.current
    if (!el || reduced || !clip.src) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, clip.src])

  if (clip.src) {
    return (
      <figure className="brand-clip">
        <video
          ref={ref}
          className="brand-clip-video"
          src={clip.src}
          poster={clip.poster}
          muted
          loop
          playsInline
          preload="none"
          controls={reduced}
        />
        <figcaption className="brand-clip-credit">{clip.credit}</figcaption>
      </figure>
    )
  }

  if (!clip.href) return null

  const platform = clip.platform ?? 'Instagram'
  return (
    <a
      className="brand-clip-link"
      href={clip.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ background: tint }}
    >
      <span className="brand-clip-link-glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M17 7H8M17 7v9" />
        </svg>
      </span>
      <span className="brand-clip-link-text">
        <strong>Watch their clip on {platform}</strong>
        {/* Says it leaves, before the tap, not after. */}
        <em>{clip.credit} — opens {platform}</em>
      </span>
    </a>
  )
}
