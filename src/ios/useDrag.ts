import { useCallback, useRef } from 'react'

/**
 * Pointer-drag helper with velocity tracking.
 *
 * Velocity is what separates a real-feeling iOS gesture from a bad one: a short
 * flick and a long slow drag must resolve differently even though the distance
 * is identical. We keep a small sample window so a pause right before release
 * correctly reads as velocity ~0 (that is the app-switcher gesture).
 */

export interface DragState {
  dx: number
  dy: number
  /** px per ms, positive = right / down. */
  vx: number
  vy: number
  /** ms since pointerdown. */
  elapsed: number
}

interface Options {
  onStart?: (e: React.PointerEvent) => void
  /** Fired once, on the first move that passes the threshold. */
  onFirstMove?: () => void
  onMove?: (s: DragState) => void
  onEnd?: (s: DragState) => void
  /**
   * The gesture was taken away (pointercancel). Callers must snap back, not
   * commit — see the note on `finish` below.
   */
  onCancel?: () => void
  /** Ignore drags that start as a tap and never pass this many px. */
  threshold?: number
  captureOnDown?: boolean
}

const SAMPLE_MS = 90
/**
 * A finger held still emits no pointermove events, so the newest sample keeps
 * describing the motion that happened *before* the pause. Anything older than
 * this at release is treated as stopped — that is what makes "swipe up and
 * hold" (app switcher) distinguishable from "flick up" (go home).
 */
const STALE_MS = 60

export function useDrag({
  onStart,
  onFirstMove,
  onMove,
  onEnd,
  onCancel,
  threshold = 0,
  captureOnDown = false,
}: Options) {
  const active = useRef(false)
  const passed = useRef(false)
  const captured = useRef(false)
  /**
   * Latching the pointer id is what stops a second finger from hijacking a
   * live drag. Without it a second touch overwrites `start`, and the first
   * finger's next move lurches by the distance between the two fingers.
   */
  const pointerId = useRef<number | null>(null)
  const start = useRef({ x: 0, y: 0, t: 0 })
  const samples = useRef<{ x: number; y: number; t: number }[]>([])

  const velocity = useCallback((now?: number): { vx: number; vy: number } => {
    const s = samples.current
    if (s.length < 2) return { vx: 0, vy: 0 }
    const last = s[s.length - 1]
    if (now !== undefined && now - last.t > STALE_MS) return { vx: 0, vy: 0 }
    // Walk back to the oldest sample still inside the window.
    let first = s[0]
    for (let i = s.length - 1; i >= 0; i--) {
      if (last.t - s[i].t > SAMPLE_MS) break
      first = s[i]
    }
    const dt = last.t - first.t
    if (dt <= 0) return { vx: 0, vy: 0 }
    return { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt }
  }, [])

  const reset = useCallback(() => {
    active.current = false
    passed.current = false
    captured.current = false
    pointerId.current = null
    samples.current = []
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Ignore additional fingers while a drag is in flight.
      if (active.current) return

      active.current = true
      passed.current = threshold === 0
      captured.current = false
      pointerId.current = e.pointerId
      const t = performance.now()
      start.current = { x: e.clientX, y: e.clientY, t }
      samples.current = [{ x: e.clientX, y: e.clientY, t }]

      // Default is NOT to capture yet: capturing here would retarget pointerup
      // to this element, and a tap on a child (an app icon) would never fire
      // its own handler. Small strips opt in via captureOnDown.
      if (captureOnDown) {
        captured.current = true
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      }
      onStart?.(e)
    },
    [onStart, threshold, captureOnDown],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current || e.pointerId !== pointerId.current) return
      const t = performance.now()
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y

      samples.current.push({ x: e.clientX, y: e.clientY, t })
      if (samples.current.length > 12) samples.current.shift()

      const wasPassed = passed.current
      if (!passed.current) {
        if (Math.hypot(dx, dy) < threshold) return
        passed.current = true
      }
      if (!wasPassed) onFirstMove?.()

      if (!captured.current) {
        captured.current = true
        // Now it is unambiguously a drag, so take the pointer. Children stop
        // receiving events, which is what cancels a half-started icon tap.
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      }

      const { vx, vy } = velocity()
      onMove?.({ dx, dy, vx, vy, elapsed: t - start.current.t })
    },
    [onMove, onFirstMove, velocity, threshold],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current || e.pointerId !== pointerId.current) return
      const t = performance.now()
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y
      const { vx, vy } = velocity(t)
      // Also resolve when moves were coalesced away and `passed` never flipped
      // but the pointer clearly travelled — otherwise a fast flick does nothing.
      const travelled = Math.hypot(dx, dy) >= threshold
      const shouldEnd = passed.current || travelled
      const elapsed = t - start.current.t
      reset()
      if (shouldEnd) onEnd?.({ dx, dy, vx, vy, elapsed })
    },
    [onEnd, velocity, threshold, reset],
  )

  /**
   * pointercancel is NOT a release. iOS fires it routinely — most importantly
   * when a touch starting near the bottom edge gets claimed by the system home
   * gesture. Treating it as a release meant an interrupted swipe committed:
   * the app force-closed, or the home screen turned a page, on a gesture the
   * user never finished.
   */
  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current || e.pointerId !== pointerId.current) return
      reset()
      onCancel?.()
    },
    [onCancel, reset],
  )

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
}
