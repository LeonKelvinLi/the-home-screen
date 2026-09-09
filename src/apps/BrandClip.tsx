import { useEffect, useRef, useState } from 'react'
import { BrandLogo } from '../ios/BrandLogo'
import type { Logo } from '../data/brands'

/**
 * A business's own video on their page.
 *
 * TWO MODES, and the difference is who is hosting the pixels.
 *
 * `src` is footage the business gave us, sitting on our own origin. That plays
 * inline, muted and looping, the way a clip on a menu page should.
 *
 * `href` alone is a post on somebody else's platform — an Instagram reel,
 * usually. We cannot embed those: there is no public embed that works without a
 * token, the iframe route is blocked, and pointing an <img> or <video> at
 * Instagram's CDN is both fragile and not ours to do.
 *
 * SO THE PREVIEW IS BUILT FROM WHAT WE OWN. The thumbnail is the business's own
 * colours and their own mark, in reel shape. That is deliberate on two counts:
 * it reads as video instantly because the SHAPE carries the meaning, and it can
 * never be mistaken for a still from a video we do not have. A scraped frame
 * under a play triangle would look better and would be a small lie — this tile
 * is obviously a plate, and the label says where it goes before it is tapped.
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
  /**
   * The reviewer's handle, without the @, when the film is theirs rather
   * than the business's. The bar then says "Watch a review by @handle" and
   * the credit opens their profile — his 2026-09-09 protocol for "other
   * food reviewers' videos on an Affiliate's page": "This way they get the
   * credit & views and hopefully a follow directly to their ig page."
   */
  by?: string
}

/** Where a credit points when the film is a reviewer's. */
export function reviewerHref(clip: Clip): string | undefined {
  if (!clip.by) return undefined
  const p = (clip.platform ?? 'Instagram').toLowerCase()
  if (p === 'tiktok') return `https://www.tiktok.com/@${clip.by}`
  if (p === 'youtube') return `https://www.youtube.com/@${clip.by}`
  return `https://www.instagram.com/${clip.by}/`
}

/** Multiply a hex towards black. Used to give a one-colour brand a gradient. */
function darken(hex: string, amount: number): string {
  const m = /^#?([\da-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  const n = parseInt(m[1], 16)
  const f = 1 - amount
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

/** The play triangle, in the same frosted glass as the Spotlight pill. */
function PlayMark({ size = 40 }: { size?: number }) {
  return (
    <span className="clip-play" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.42} height={size * 0.42} aria-hidden="true">
        {/* Nudged right by a point: a triangle centred on its bounding box
            reads as sitting left of centre inside a circle. */}
        <path d="M9 5.5v13l10.5-6.5Z" fill="currentColor" />
      </svg>
    </span>
  )
}

export function BrandClip({ clip, logo }: { clip: Clip; logo: Logo }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [reduced, setReduced] = useState(false)
  /*
    SOUND, ON A TAP. It starts muted because nothing else starts a phone
    talking without being asked, and his ask of 2026-09-09 — "are you able to
    add sound onto the downloaded video for that page?" — is answered by the
    button: one tap unmutes, and the tap is the gesture a browser needs before
    it will play audio at all. The files carry a sound track (make-clip.py
    keeps it; tools/audit-reel-sound.mjs checks it).
  */
  const [sound, setSound] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  /*
    Play only while it is on screen. preload="none" and an observer rather than
    autoplay, so scrolling past a brand page does not pull a video down a phone
    connection nobody watched — and a looping clip left running above the fold
    is a battery drain nobody asked for.
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
    const link = reviewerHref(clip)
    return (
      <figure className="brand-clip">
        <div className="brand-clip-frame">
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
          <button
            type="button"
            className="brand-clip-sound"
            aria-label={sound ? 'Turn the sound off' : 'Turn the sound on'}
            aria-pressed={sound}
            onClick={() => {
              const el = ref.current
              if (!el) return
              const next = !sound
              el.muted = !next
              setSound(next)
              if (next) void el.play().catch(() => {})
            }}
          >
            {sound ? 'Sound on' : 'Sound off'}
          </button>
        </div>
        <figcaption className="brand-clip-credit">
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              {clip.credit}
            </a>
          ) : (
            clip.credit
          )}
        </figcaption>
      </figure>
    )
  }

  if (!clip.href) return null

  const platform = clip.platform ?? 'Instagram'
  const [from, to] = logo.bg.split('|')
  /*
    Depth even when the brand only has ONE colour.

    Half the partners define a single flat hex, so `linear-gradient(a, a)` gave
    a dead swatch — and on Tequila's that swatch was the same green as the hero
    forty pixels above it, so the tile read as a hole in the page rather than as
    a poster. Deriving a darker end means every tile has a light source.
  */
  const deep = to ?? darken(from, 0.42)

  return (
    /*
      A POSTER, not a list row.

      The first pass was a thumbnail with two lines of text and a chevron beside
      it, which is the exact shape of every other row in this app and of every
      generated card on the internet — it read as a component rather than as
      something belonging to this business. This is full width, in their own
      colours, with the type laid over the image the way a video card actually
      works. Nothing else on a brand page looks like it.
    */
    <a
      className="clip-card"
      href={clip.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ background: `linear-gradient(152deg, ${from}, ${deep})` }}
    >
      {/* Their mark, oversized and running off two edges, as a poster crops one
          rather than centring it on a plate. */}
      <span className="clip-mark" aria-hidden="true">
        <BrandLogo logo={logo} size={230} />
      </span>

      {/* The only thing here that says "video" without pretending to be a frame
          of one: a still tile reads as an image, a moving highlight does not. */}
      <span className="clip-sheen" aria-hidden="true" />

      {/* The bottom-up scrim every video poster has — it is what the type sits
          on, so the words stay legible whatever colour the business chose. */}
      <span className="clip-scrim" aria-hidden="true" />

      <span className="clip-body">
        <PlayMark />
        <span className="clip-text">
          <strong>{clip.by ? `Watch a review by @${clip.by}` : 'Watch their clip'}</strong>
          {/* Says it leaves, before the tap rather than after. */}
          <em>
            {clip.credit} · opens {platform}
          </em>
        </span>
      </span>

      {/* The shape of the thing on the other end, stated rather than mimicked. */}
      <span className="clip-tag" aria-hidden="true">
        REEL
      </span>
    </a>
  )
}
