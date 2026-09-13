import { useEffect, useRef, useState } from 'react'

/**
 * A camera that reads QR codes, for the Scan tab and the kitchen's pass check.
 *
 * THE CAMERA STARTS WHEN THIS MOUNTS AND STOPS WHEN IT UNMOUNTS, and a caller
 * only mounts it after a tap. Nothing is recorded and no frame leaves the
 * device: each frame is read in memory, the text of a code is handed to
 * `onCode`, and the frame is dropped.
 *
 * TWO READERS. The browser's own BarcodeDetector where it has one (Chrome on
 * Android), and jsQR everywhere else — iPhone and iPad Safari have no detector,
 * and a till is most likely an iPad. jsQR is loaded only when it is needed, so
 * nobody who never taps Scan downloads it.
 *
 * `onCode` returns true once it has what it wanted; the same text is not handed
 * over again for two seconds either way, so a code held in frame is one read,
 * not thirty.
 */

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> }
type JsQr = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' },
) => { data: string } | null

type Status = 'starting' | 'running' | 'denied' | 'unavailable'

/** How often a frame is read. Every animation frame would drain a phone for nothing. */
const READ_EVERY_MS = 140
/** Longest side of the frame jsQR reads. Big enough for a code at arm's length. */
const READ_SIDE = 720

export function QrScanner({ onCode, hint }: { onCode: (text: string) => boolean | void; hint?: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const handler = useRef(onCode)
  handler.current = onCode
  const [status, setStatus] = useState<Status>('starting')

  useEffect(() => {
    let alive = true
    let stream: MediaStream | null = null
    let timer = 0
    let detector: Detector | null = null
    let jsqr: JsQr | null = null
    let last = { text: '', at: 0 }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const read = async () => {
      if (!alive) return
      const v = video.current
      try {
        if (v && v.readyState >= 2 && v.videoWidth > 0) {
          let text: string | null = null
          if (detector) {
            text = (await detector.detect(v))[0]?.rawValue ?? null
          } else if (jsqr && ctx) {
            const scale = Math.min(1, READ_SIDE / Math.max(v.videoWidth, v.videoHeight))
            canvas.width = Math.round(v.videoWidth * scale)
            canvas.height = Math.round(v.videoHeight * scale)
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            text = jsqr(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })?.data ?? null
          }
          const now = Date.now()
          if (text && !(text === last.text && now - last.at < 2000)) {
            last = { text, at: now }
            handler.current(text)
          }
        }
      } catch {
        /* one unreadable frame is not a failure; the next one is tried */
      }
      if (alive) timer = window.setTimeout(read, READ_EVERY_MS)
    }

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unavailable')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      } catch {
        if (alive) setStatus('denied')
        return
      }
      if (!alive) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      const v = video.current
      if (!v) return
      v.srcObject = stream
      await v.play().catch(() => {})

      const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector })
        .BarcodeDetector
      if (BD) {
        try {
          detector = new BD({ formats: ['qr_code'] })
        } catch {
          detector = null
        }
      }
      if (!detector) {
        try {
          jsqr = ((await import('jsqr')) as unknown as { default: JsQr }).default
        } catch {
          if (alive) setStatus('unavailable')
          return
        }
      }
      if (!alive) return
      setStatus('running')
      timer = window.setTimeout(read, READ_EVERY_MS)
    }

    void start()
    return () => {
      alive = false
      clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className={`qr-scanner is-${status}`}>
      <video ref={video} className="qr-scanner-video" muted playsInline aria-label="Camera" />
      <span className="qr-scanner-frame" aria-hidden="true" />
      {status === 'starting' && <p className="qr-scanner-note">Starting the camera…</p>}
      {status === 'denied' && (
        <p className="qr-scanner-note">
          The camera is blocked for this site. Allow it in the browser&rsquo;s settings, then try again.
        </p>
      )}
      {status === 'unavailable' && (
        <p className="qr-scanner-note">This browser cannot use the camera here.</p>
      )}
      {status === 'running' && hint && <p className="qr-scanner-hint">{hint}</p>}
    </div>
  )
}

/**
 * Where a scanned code should take a customer, or null when it is not ours.
 *
 * ONLY BEASTY LINKS. A code on a counter could say anything, and a scanner that
 * followed any URL would be a way to send people to any site with this app's
 * trust attached. So a code is followed only when it points at beastypages.com
 * (or this very origin, for a preview build) and names a business or carries a
 * member's referral — and even then it is followed as a path on this origin.
 */
export function beastyPathFrom(text: string): string | null {
  let url: URL
  try {
    url = new URL(text.trim())
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  const ours = host === 'beastypages.com' || host === 'www.beastypages.com' || url.host === window.location.host
  if (!ours || (url.protocol !== 'https:' && url.protocol !== 'http:')) return null
  const q = url.searchParams
  const keep = new URLSearchParams()
  const b = q.get('b')
  const ref = q.get('ref')
  if (b && /^b_[a-z0-9]{2,40}$/.test(b)) {
    keep.set('b', b)
    if (q.get('via') === 'qr') keep.set('via', 'qr')
  }
  if (ref && /^[0-9A-Z]{4,16}$/i.test(ref)) keep.set('ref', ref)
  if ([...keep.keys()].length === 0) return null
  return `/?${keep.toString()}`
}
