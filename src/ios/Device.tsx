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
import { rememberVisit } from '../lib/recents'
import { brandById } from '../data/brands'
import { motionMs } from './motion'
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
  /**
   * Close whatever is open and move the home screen to a city's page.
   *
   * Search uses it: typing "Oakland" should take you to Oakland, which is the
   * thing a customer means by searching for a place. The shell owns the page
   * because the home screen is behind the app window, not inside it.
   *
   * With an app id, the page of that city its tile is on — a business page's
   * city button lands on the page with the business, Services or a yellow
   * sheet included, rather than the city's first page.
   */
  goToCity: (city: string, appId?: string) => void
}

type Phase = 'home' | 'opening' | 'open' | 'closing' | 'switcher'

interface Props {
  /** Open this app as soon as the shell mounts, e.g. straight from the intro. */
  openOnMount?: string | null
  renderApp: (appId: string, api: ShellApi) => ReactNode
}

export function Device({ renderApp, openOnMount }: Props) {
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

      /*
        Remember BUSINESSES only. A customer's recents list is not improved by
        Settings or the cart turning up in it, and this is the one choke point
        every open goes through — the grid, the dock, the switcher, the landing
        keypad and Search all end here.
      */
      const opened = appById(id)
      if (opened?.kind === 'brand') {
        const b = brandById(id)
        if (b) {
          rememberVisit({
            id: b.id,
            name: b.name,
            cuisine: b.cuisine,
            color: b.logo.bg.split('|')[0],
          })
        }
      }

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
      const openMs = motionMs(OPEN_MS)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => tweenTo(from, true, openMs, land)),
      )

      // Scheduled OUTSIDE the rAF on purpose. A hidden tab fires no animation
      // frames at all, so the callbacks above never run and the app was left
      // frozen at icon size, unusable, until something else opened. iOS Safari
      // hides the tab whenever the user switches apps, so this is an ordinary
      // path, not an edge case. `after` is generation-guarded, and `land` is
      // idempotent, so the normal case just lands the same state twice.
      after(openMs + 60, land)
    },
    [after, clearTimers, centre, screen, tweenTo],
  )

  /* Held in a ref so the edge gesture below can call it without taking it as
     a dependency, which would reorder half the component. */
  const closeAppRef = useRef<(() => void) | null>(null)

  const closeApp = useCallback(() => {
    if (!appId) return
    generation.current++
    clearTimers()

    const from = origin ?? origins.current.get(appId) ?? centre()
    setPhase('closing')
    tweenTo(from, false, motionMs(CLOSE_MS), () => {
      setStyle({ ...collapsed(from, screen), opacity: 0 })
      setAppId(null)
      setPhase('home')
      setStyle(expandedFor(screen))
    })
  }, [appId, origin, clearTimers, centre, screen, tweenTo])

  closeAppRef.current = closeApp

  const snapBack = useCallback(() => {
    generation.current++
    clearTimers()
    setAnimating(true)
    setStyle(expandedFor(screen))
    after(motionMs(CLOSE_MS), () => setAnimating(false))
  }, [after, clearTimers])

  /*
    Open straight into an app when the intro asked for one — "Water" on the
    landing screen goes to the home screen AND opens Beasty H20, rather than
    dropping the customer on the grid to find it themselves.

    Guarded on a measured screen: the launch animation computes its geometry
    from the screen size, and running it against the pre-measurement default
    makes the window fly in from the wrong place.
  */
  const launched = useRef(false)
  useEffect(() => {
    if (!openOnMount || launched.current || screen.w <= 0) return
    launched.current = true
    openApp(openOnMount)
  }, [openOnMount, screen.w, openApp])

  /*
    The gate's "Sign up free" button, which lives outside this tree.

    An event rather than a prop: the prompt is rendered by GateProvider at the
    very top of the app, above the device frame, so there is no path to pass a
    callback down — and threading `openApp` back up through App would tie the
    two together for one button.
  */
  useEffect(() => {
    const join = () => openApp('sys.join')
    window.addEventListener('beasty:join', join)
    return () => window.removeEventListener('beasty:join', join)
  }, [openApp])

  /** Home-indicator gesture: flick up closes, slow drag up opens the switcher. */
  /*
    Back-swipe from the left edge.

    There was none: the only way out of an app was the Back button in the bar,
    a target at the very top of the screen that a thumb has to stretch for. iOS
    has trained everyone that dragging in from the left edge goes back, and in
    the bottom-left corner the swipe hit the home-indicator strip instead,
    which has touch-action: none and swallowed it entirely.

    The window follows the finger with resistance, then either snaps back or
    runs the normal close-to-icon animation.
  */
  const [backDx, setBackDx] = useState(0)
  const [backDragging, setBackDragging] = useState(false)

  const backGesture = useDrag({
    threshold: 8,
    onStart: () => setBackDragging(true),
    onMove: ({ dx }) => {
      // Rightward only; pulling left resists rather than tearing the window
      // off the other edge.
      setBackDx(dx > 0 ? dx : dx * 0.15)
    },
    onCancel: () => {
      setBackDragging(false)
      setBackDx(0)
    },
    onEnd: ({ dx, vx }) => {
      setBackDragging(false)
      setBackDx(0)
      if (dx > 70 || vx > 0.3) closeAppRef.current?.()
    },
  })

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

  /*
    A city the home screen has been asked to move to, held here rather than in
    HomeScreen because the request comes from an app on top of it.
  */
  const [jumpCity, setJumpCity] = useState<{ city: string; appId?: string } | null>(null)

  const api: ShellApi = {
    openApp: (id) => openApp(id),
    closeApp,
    currentAppId: appId,
    goToCity: (city, appId) => {
      setJumpCity({ city, appId })
      closeApp()
    },
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
            <HomeScreen
              onOpen={openApp}
              receding={homeReceding}
              hidden={homeHidden}
              inert={inSwitcher}
              jumpToCity={jumpCity?.city}
              jumpToApp={jumpCity?.appId}
              onJumped={() => setJumpCity(null)}
            />

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
                  transform: settled
                    ? backDx
                      ? `translate3d(${backDx}px,0,0)`
                      : undefined
                    : style.transform,
                  borderRadius: style.borderRadius,
                  // will-change only while a tween is actually running; holding
                  // it permanently pins a compositor layer for no benefit.
                  willChange: settled && !backDx ? 'auto' : 'transform, border-radius',
                  visibility: inSwitcher ? 'hidden' : 'visible',
                  /*
                    No CSS transition while a tween is running: the rAF tween
                    writes transform and radius every frame, correctly related
                    to each other, and letting CSS interpolate them
                    independently is what ballooned the corner through the
                    middle of a launch.

                    A settled window is not being tweened, so an incomplete
                    back-swipe can spring home on a transition instead of
                    snapping there in one frame.
                  */
                  transition:
                    settled && !backDragging
                      ? 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)'
                      : 'none',
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

            {/* Above the indicator strip in the corner they overlap, or the
                strip's touch-action: none eats the swipe. */}
            {mounted && app && !inSwitcher && phase === 'open' && (
              <div className="back-edge-zone" {...backGesture} />
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
