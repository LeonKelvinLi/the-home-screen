import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { HomeScreen } from './HomeScreen'
import { StatusBar } from './StatusBar'
import { AppSwitcher } from './AppSwitcher'
import { collapsed, expanded, expandedFor, lerp } from './AppWindow'
import type { WindowTransform } from './AppWindow'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { ScreenSizeProvider, useMeasuredScreen } from './ScreenSize'
import { appById } from '../apps/registry'
import {
  CLOSE_MS,
  DISMISS_COMMIT_PX,
  DISMISS_VELOCITY,
  OPEN_MS,
  SWITCHER_VELOCITY,
  SWITCHER_COMMIT_PX,
} from './constants'

export interface ShellApi {
  openApp: (appId: string) => void
  closeApp: () => void
  /** Route inside the currently open app (menu -> item -> checkout). */
  currentAppId: string | null
}

type Phase = 'home' | 'opening' | 'open' | 'closing' | 'switcher'

interface Props {
  renderApp: (appId: string, api: ShellApi) => ReactNode
}

export function Device({ renderApp }: Props) {
  const [phase, setPhase] = useState<Phase>('home')
  const [appId, setAppId] = useState<string | null>(null)
  const [origin, setOrigin] = useState<IconRect | null>(null)
  const [style, setStyle] = useState<WindowTransform>(expanded)
  const [animating, setAnimating] = useState(false)
  const [recents, setRecents] = useState<string[]>([])

  const screenRef = useRef<HTMLDivElement>(null)
  const screen = useMeasuredScreen(screenRef)
  /*
    The page is always the device — never a phone drawn inside a desktop window.
    Narrow viewports get an iPhone home screen, wide ones get an iPad one. No
    bezel, no Dynamic Island, no painted status bar anywhere: a real device
    already has those, and a browser window has its own chrome.
  */
  const isPad = screen.device === 'pad'

  /** Where each app was last opened from, so it collapses back into its own icon. */
  const origins = useRef(new Map<string, IconRect>())
  const timers = useRef<number[]>([])
  /** Bumped on every transition; stale timer callbacks check it and bail. */
  const generation = useRef(0)

  const centre = useCallback(
    (): IconRect => ({ left: screen.w / 2 - 30, top: screen.h / 2 - 30, width: 60, height: 60 }),
    [screen.w, screen.h],
  )

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  /**
   * Schedule work that belongs to the CURRENT transition only.
   *
   * Without the generation check, closing an app and immediately opening
   * another let the close timer fire mid-open: it unmounted the new app and
   * left the home screen blurred and scaled with nothing on top of it, stuck
   * until another app was opened.
   */
  const after = useCallback((ms: number, fn: () => void) => {
    const gen = generation.current
    const t = window.setTimeout(() => {
      if (generation.current !== gen) return
      fn()
    }, ms)
    timers.current.push(t)
  }, [])

  /**
   * rAF tween through `lerp`, matching EASE_IOS. p=1 is collapsed onto the
   * icon, p=0 is fully open — the same parameterisation the drag uses.
   */
  const tweenTo = useCallback(
    (from: IconRect, toOpen: boolean, ms: number, done?: () => void) => {
      const gen = generation.current
      const startedAt = performance.now()
      // cubic-bezier(0.32, 0.72, 0, 1) sampled by Newton iteration on x.
      const ease = (t: number) => {
        const cx = 3 * 0.32
        const bx = 3 * (0 - 0.32) - cx
        const ax = 1 - cx - bx
        const cy = 3 * 0.72
        const by = 3 * (1 - 0.72) - cy
        const ay = 1 - cy - by
        let x = t
        for (let i = 0; i < 6; i++) {
          const fx = ((ax * x + bx) * x + cx) * x - t
          const d = (3 * ax * x + 2 * bx) * x + cx
          if (Math.abs(d) < 1e-6) break
          x -= fx / d
        }
        return ((ay * x + by) * x + cy) * x
      }

      let finished = false
      const finish = () => {
        if (finished || generation.current !== gen) return
        finished = true
        done?.()
      }

      const step = () => {
        if (finished || generation.current !== gen) return
        const raw = Math.min(1, (performance.now() - startedAt) / ms)
        const e = ease(raw)
        setStyle(lerp(from, screen, toOpen ? 1 - e : e))
        if (raw < 1) requestAnimationFrame(step)
        else finish()
      }
      requestAnimationFrame(step)

      // rAF does not fire in a background tab. Without this, backgrounding the
      // page mid-launch leaves the window frozen at whatever scale it reached
      // and the app never becomes usable. The timer still runs, so it lands the
      // final state even if not a single frame was painted.
      after(ms + 40, finish)
    },
    [screen, after],
  )

  const openApp = useCallback(
    (id: string, rect?: IconRect) => {
      generation.current++
      clearTimers()

      const from = rect ?? origins.current.get(id) ?? centre()
      origins.current.set(id, from)

      setAppId(id)
      setOrigin(from)
      setStyle(collapsed(from, screen))
      setAnimating(false)
      setPhase('opening')
      setRecents((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8))

      const land = () => {
        setStyle(expandedFor(screen))
        setPhase('open')
      }

      // Two frames: one to commit the collapsed style, one to start the tween.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => tweenTo(from, true, OPEN_MS, land)),
      )

      // Scheduled OUTSIDE the rAF on purpose. A hidden tab fires no animation
      // frames at all, so the callbacks above never run and the app was left
      // frozen at icon size, unusable, until something else opened. iOS Safari
      // hides the tab whenever the user switches apps, so this is an ordinary
      // path, not an edge case. `after` is generation-guarded, and `land` is
      // idempotent, so the normal case just lands the same state twice.
      after(OPEN_MS + 60, land)
    },
    [after, clearTimers, centre, screen, tweenTo],
  )

  const closeApp = useCallback(() => {
    if (!appId) return
    generation.current++
    clearTimers()

    const from = origin ?? origins.current.get(appId) ?? centre()
    setPhase('closing')
    tweenTo(from, false, CLOSE_MS, () => {
      setStyle({ ...collapsed(from, screen), opacity: 0 })
      setAppId(null)
      setPhase('home')
      setStyle(expandedFor(screen))
    })
  }, [appId, origin, clearTimers, centre, screen, tweenTo])

  const snapBack = useCallback(() => {
    generation.current++
    clearTimers()
    setAnimating(true)
    setStyle(expandedFor(screen))
    after(CLOSE_MS, () => setAnimating(false))
  }, [after, clearTimers])

  /** Home-indicator gesture: flick up closes, slow drag up opens the switcher. */
  const homeGesture = useDrag({
    threshold: 6,
    captureOnDown: true,
    // Deliberately NOT on start: a bare tap used to cancel the running open
    // animation, snapping the app from 85% to full size in a single frame.
    onFirstMove: () => setAnimating(false),
    onMove: ({ dy }) => {
      if (!appId || !origin) return
      const p = Math.max(0, Math.min(1, -dy / 420))
      setStyle(lerp(origin, screen, p))
    },
    onCancel: snapBack,
    onEnd: ({ dy, vy }) => {
      if (!appId) return
      const up = -dy
      const speed = -vy

      // Order matters, and so does the distance. The switcher used to be
      // tested first at up > 40 — less than half the 90px needed to go home —
      // so every slow drag between 40 and 90px opened the switcher and could
      // never reach the home screen. `speed > -0.3` also admitted a drag that
      // had reversed downward, i.e. a cancel. iOS wants the opposite: a short
      // swipe cancels, a long swipe goes home, and a long swipe you PAUSE on
      // opens the switcher. Require both the longer distance and a real dwell.
      const dwelling = Math.abs(speed) < SWITCHER_VELOCITY
      if (up > SWITCHER_COMMIT_PX && dwelling) {
        generation.current++
        clearTimers()
        setAnimating(false)
        setStyle(expandedFor(screen))
        setPhase('switcher')
        return
      }
      if (up > DISMISS_COMMIT_PX || speed > DISMISS_VELOCITY) {
        closeApp()
        return
      }
      snapBack()
    },
  })

  const api: ShellApi = {
    openApp: (id) => openApp(id),
    closeApp,
    currentAppId: appId,
  }

  const app = appId ? appById(appId) : null
  const inSwitcher = phase === 'switcher'
  const mounted = appId !== null
  // On close the home screen comes back forward as the app shrinks into it.
  const homeReceding = phase === 'opening' || phase === 'open'
  /*
    Once the app fully covers the screen the home screen is invisible but still
    composited — a blur filter, a drop-shadow per icon and two backdrop blurs,
    all recomputed behind every scroll. Taking it out of painting entirely is
    the single biggest scrolling win.
  */
  const homeHidden = phase === 'open'
  /*
    A transform on the scroll container's ancestor disables native momentum
    scrolling in iOS Safari. While the app is open and settled there is no
    animation to drive, so drop the transform and let the platform scroll.
  */
  const settled = phase === 'open' && !animating

  return (
    <ScreenSizeProvider value={screen}>
      <div className={`device is-${screen.device}`}>
        <div className="device-frame">
          <div className="screen" ref={screenRef}>
            <HomeScreen onOpen={openApp} receding={homeReceding} hidden={homeHidden} />

            {inSwitcher && (
              <AppSwitcher
                recents={recents}
                renderApp={renderApp}
                api={api}
                onPick={(id) => {
                  generation.current++
                  clearTimers()
                  setAppId(id)
                  // Without this the app collapsed into whichever icon was
                  // tapped most recently, which could be a different app.
                  setOrigin(origins.current.get(id) ?? centre())
                  setStyle(expandedFor(screen))
                  setAnimating(false)
                  setPhase('open')
                  setRecents((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8))
                }}
                onClose={(id) => setRecents((r) => r.filter((x) => x !== id))}
                onDismiss={() => {
                  generation.current++
                  clearTimers()
                  setAppId(null)
                  setPhase('home')
                  setStyle(expandedFor(screen))
                }}
              />
            )}

            {mounted && app && (
              /*
                Kept mounted (just hidden) while the switcher is up. Unmounting
                threw away the app's scroll position, route and half-filled
                checkout fields every time the switcher was opened.
              */
              <div
                className="app-window"
                aria-hidden={inSwitcher}
                style={{
                  width: screen.w,
                  height: screen.h,
                  transform: settled ? undefined : style.transform,
                  borderRadius: style.borderRadius,
                  // will-change only while a tween is actually running; holding
                  // it permanently pins a compositor layer for no benefit.
                  willChange: settled ? 'auto' : 'transform, border-radius',
                  visibility: inSwitcher ? 'hidden' : 'visible',
                  // No CSS transition on transform or border-radius: the rAF
                  // tween writes both every frame, correctly related to each
                  // other. Letting CSS interpolate them independently is what
                  // ballooned the corner through the middle of a launch.
                  transition: 'none',
                }}
              >
                <div
                  className="app-content"
                  style={{
                    opacity: style.opacity,
                    transition: 'none',
                  }}
                >
                  {renderApp(appId!, api)}
                </div>
              </div>
            )}

            {/*
              A status bar only makes sense on the wide layout, where the page
              is standing in for a tablet rather than sitting inside a real
              phone that already draws one.
            */}
            {isPad && (
              <div className="status-layer">
                <StatusBar dark={mounted && !inSwitcher ? app?.statusDark : false} />
              </div>
            )}

            <div
              className="home-indicator-zone"
              style={{ pointerEvents: mounted && !inSwitcher ? 'auto' : 'none' }}
              {...(mounted && !inSwitcher ? homeGesture : {})}
            >
              {isPad && <div className="home-indicator" />}
            </div>
          </div>
        </div>
      </div>
    </ScreenSizeProvider>
  )
}
