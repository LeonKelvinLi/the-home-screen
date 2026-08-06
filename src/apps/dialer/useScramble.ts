import { useEffect, useRef, useState } from 'react'

/**
 * The decrypt effect: a set of strings that resolve out of noise, together.
 *
 * Used for the moment the phone's own keypad is taken over — every label under
 * every digit scrambles and locks into the operator's menu. It is the one
 * flourish on this screen, so it is worth doing properly rather than with a
 * cross-fade.
 *
 * ONE requestAnimationFrame loop owns every string. The obvious build is a
 * timer per label, which is seventeen timers writing seventeen pieces of state
 * — that is what made the page pager stutter earlier in this project, and it
 * would be worse here because each write re-renders the whole keypad.
 *
 * The loop also throttles its own writes to ~28fps. Scrambled glyphs read as
 * noise either way, and a text swap does not benefit from 120Hz; the keys
 * animate on the compositor at full rate regardless.
 */

/** Reads as a phone rather than as the Matrix: keypad characters only. */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*#+'

const FRAME_MS = 36

export interface ScrambleOptions {
  /** Delay between one string starting and the next, in ms. */
  stagger?: number
  /** How long a single string takes to resolve, in ms. */
  duration?: number
  /** Delay before the whole set starts, in ms. */
  delay?: number
  /**
   * False to scramble WITHOUT ever landing on the target.
   *
   * The corruption phase runs on the phone's own white keypad, before the
   * screen blacks out — so if the labels resolved there, the customer would
   * read the whole menu before the reveal and the blackout would be paying off
   * something already spent. They churn instead, and the answer arrives on the
   * other side of the dark.
   */
  resolve?: boolean
}

/**
 * @param targets the strings to resolve to
 * @param active  false holds every string empty; flipping to true starts the run
 * @returns       the current text of each string, in the order given
 */
export function useScramble(
  targets: string[],
  active: boolean,
  { stagger = 34, duration = 460, delay = 0, resolve = true }: ScrambleOptions = {},
): string[] {
  const [out, setOut] = useState<string[]>(() => targets.map(() => ''))
  /*
    The targets are rebuilt on every render by the caller, so depending on the
    array itself would restart the animation each frame it causes. Hold them in
    a ref and depend only on `active`.
  */
  const latest = useRef(targets)
  latest.current = targets

  useEffect(() => {
    if (!active) {
      setOut(latest.current.map(() => ''))
      return
    }

    let raf = 0
    let lastWrite = 0
    const t0 = performance.now()

    const tick = (now: number) => {
      const elapsed = now - t0 - delay
      const list = latest.current
      let allDone = true

      if (now - lastWrite >= FRAME_MS) {
        lastWrite = now
        const next = list.map((target, i) => {
          const p = (elapsed - i * stagger) / duration
          if (p >= 1 && resolve) return target
          if (!resolve) {
            // Churn every character, forever, at the target's own length so
            // nothing reflows.
            if (elapsed - i * stagger <= 0) return ''
            let noise = ''
            for (let c = 0; c < target.length; c++) {
              noise += CHARS[(Math.random() * CHARS.length) | 0]
            }
            return noise
          }
          allDone = false
          if (p <= 0) return ''
          // Lock characters left to right; the rest is noise, kept to the
          // target's own length so nothing reflows while it resolves.
          const locked = Math.floor(p * target.length)
          let s = target.slice(0, locked)
          for (let c = locked; c < target.length; c++) {
            s += CHARS[(Math.random() * CHARS.length) | 0]
          }
          return s
        })
        setOut(next)
      } else {
        allDone = resolve && list.every((_, i) => elapsed - i * stagger >= duration)
      }

      if (allDone && resolve) {
        setOut(latest.current)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, stagger, duration, delay, resolve])

  return out
}
