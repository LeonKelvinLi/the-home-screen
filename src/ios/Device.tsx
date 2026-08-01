import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { HomeScreen } from './HomeScreen'
import { StatusBar } from './StatusBar'
import { AppSwitcher } from './AppSwitcher'
import { collapsed, expanded, lerp } from './AppWindow'
import type { WindowTransform } from './AppWindow'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
import { ScreenSizeProvider, useMeasuredScreen } from './ScreenSize'
import { appById } from '../apps/registry'
import {
  CLOSE_MS,
  DISMISS_COMMIT_PX,
  DISMISS_VELOCITY,
  EASE_IOS,
  OPEN_MS,
  SCREEN_H,
  SCREEN_W,
  SWITCHER_VELOCITY,
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

/**
 * True when the page IS the phone rather than a phone drawn inside a desktop
 * window. In that mode every piece of fake hardware is dropped — no bezel, no
 * Dynamic Island, no painted status bar — because the device already has real
 * ones and drawing a second set on top looks like a toy.
 */
function useIsPhone(): boolean {
  const [phone, setPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)')
    const on = () => setPhone(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
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
  const isPhone = useIsPhone()

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

      // Two frames: one to commit the collapsed style, one to start the tween.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimating(true)
          setStyle(expanded)
          after(OPEN_MS, () => {
            setAnimating(false)
            setPhase('open')
          })
        }),
      )
    },
    [after, clearTimers, centre, screen],
  )

  const closeApp = useCallback(() => {
    if (!appId) return
    generation.current++
    clearTimers()

    const from = origin ?? origins.current.get(appId) ?? centre()
    setPhase('closing')
    setAnimating(true)
    setStyle({ ...collapsed(from, screen), opacity: 0 })
    after(CLOSE_MS, () => {
      setAnimating(false)
      setAppId(null)
      setPhase('home')
      setStyle(expanded)
    })
  }, [appId, origin, after, clearTimers, centre, screen])

  const snapBack = useCallback(() => {
    generation.current++
    clearTimers()
    setAnimating(true)
    setStyle(expanded)
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

      if (up > 40 && speed < SWITCHER_VELOCITY && speed > -0.3) {
        generation.current++
        clearTimers()
        setAnimating(false)
        setStyle(expanded)
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

  return (
    <ScreenSizeProvider value={screen}>
      <div className={`device${isPhone ? ' is-phone' : ''}`}>
        <div className="device-frame">
          <div
            className="screen"
            ref={screenRef}
            style={isPhone ? undefined : { width: SCREEN_W, height: SCREEN_H }}
          >
            <HomeScreen onOpen={openApp} receding={homeReceding} />

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
                  setStyle(expanded)
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
                  setStyle(expanded)
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
                  transform: style.transform,
                  borderRadius: style.borderRadius,
                  visibility: inSwitcher ? 'hidden' : 'visible',
                  transition: animating
                    ? `transform ${phase === 'closing' ? CLOSE_MS : OPEN_MS}ms ${EASE_IOS}, border-radius ${
                        phase === 'closing' ? CLOSE_MS : OPEN_MS
                      }ms ${EASE_IOS}`
                    : 'none',
                }}
              >
                <div
                  className="app-content"
                  style={{
                    opacity: style.opacity,
                    transition: animating ? `opacity ${OPEN_MS * 0.5}ms linear` : 'none',
                  }}
                >
                  {renderApp(appId!, api)}
                </div>
              </div>
            )}

            {/* Real phones already have a status bar. Drawing a second one on
                top of it is the fastest way to look like a mockup. */}
            {!isPhone && (
              <div className="status-layer">
                <StatusBar dark={mounted && !inSwitcher ? app?.statusDark : false} />
              </div>
            )}

            <div
              className="home-indicator-zone"
              style={{ pointerEvents: mounted && !inSwitcher ? 'auto' : 'none' }}
              {...(mounted && !inSwitcher ? homeGesture : {})}
            >
              {!isPhone && <div className="home-indicator" />}
            </div>
          </div>
        </div>
      </div>
    </ScreenSizeProvider>
  )
}
