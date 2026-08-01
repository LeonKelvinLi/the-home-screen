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
  onStart?: (e: PointerEvent | React.PointerEvent) => void
  onMove?: (s: DragState) => void
  onEnd?: (s: DragState) => void
  /** Ignore drags that start as a tap and never pass this many px. */
  threshold?: number
  /**
   * Capture the pointer on pointerdown instead of on first move.
   *
   * Needed for small strips (the home indicator) where the pointer leaves the
   * element immediately — no pointermove would ever reach it, so lazy capture
   * would never arm and the gesture would die on pointerdown. Only safe on
   * elements with no tappable children, since capture retargets pointerup.
   */
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

export function useDrag({ onStart, onMove, onEnd, threshold = 0, captureOnDown = false }: Options) {
  const active = useRef(false)
  const passed = useRef(false)
  const captured = useRef(false)
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

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      active.current = true
      passed.current = threshold === 0
      captured.current = false
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
      if (!active.current) return
      const t = performance.now()
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y

      samples.current.push({ x: e.clientX, y: e.clientY, t })
      if (samples.current.length > 12) samples.current.shift()

      if (!passed.current) {
        if (Math.hypot(dx, dy) < threshold) return
        passed.current = true
      }

      if (!captured.current) {
        captured.current = true
        // Now it is unambiguously a drag, so take the pointer. Children stop
        // receiving events, which is what cancels a half-started icon tap.
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      }

      const { vx, vy } = velocity()
      onMove?.({ dx, dy, vx, vy, elapsed: t - start.current.t })
    },
    [onMove, velocity],
  )

  const finish = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current) return
      active.current = false
      const t = performance.now()
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y
      const { vx, vy } = velocity(t)
      // Also resolve when moves were coalesced away and `passed` never flipped
      // but the pointer clearly travelled — otherwise a fast flick does nothing.
      const travelled = Math.hypot(dx, dy) >= threshold
      if (passed.current || travelled) onEnd?.({ dx, dy, vx, vy, elapsed: t - start.current.t })
    },
    [onEnd, velocity, threshold],
  )

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
    onPointerCancel: finish,
  }
}
