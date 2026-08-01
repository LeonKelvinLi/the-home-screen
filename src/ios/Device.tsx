import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { HomeScreen } from './HomeScreen'
import { StatusBar } from './StatusBar'
import { AppSwitcher } from './AppSwitcher'
import { collapsed, expanded, lerp } from './AppWindow'
import type { WindowTransform } from './AppWindow'
import type { IconRect } from './AppIcon'
import { useDrag } from './useDrag'
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

/** Centre of the screen, used when an app is opened without a tapped icon. */
const CENTER: IconRect = { left: SCREEN_W / 2 - 30, top: SCREEN_H / 2 - 30, size: 60 }

export function Device({ renderApp }: Props) {
  const [phase, setPhase] = useState<Phase>('home')
  const [appId, setAppId] = useState<string | null>(null)
  const [origin, setOrigin] = useState<IconRect>(CENTER)
  const [style, setStyle] = useState<WindowTransform>(expanded)
  const [animating, setAnimating] = useState(false)
  const [recents, setRecents] = useState<string[]>([])

  const dragging = useRef(false)
  const timers = useRef<number[]>([])

  const after = useCallback((ms: number, fn: () => void) => {
    const t = window.setTimeout(fn, ms)
    timers.current.push(t)
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const openApp = useCallback(
    (id: string, rect: IconRect = CENTER) => {
      setAppId(id)
      setOrigin(rect)
      setStyle(collapsed(rect))
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
    [after],
  )

  const closeApp = useCallback(() => {
    if (!appId) return
    setPhase('closing')
    setAnimating(true)
    setStyle({ ...collapsed(origin), opacity: 0 })
    after(CLOSE_MS, () => {
      setAnimating(false)
      setAppId(null)
      setPhase('home')
      setStyle(expanded)
    })
  }, [appId, origin, after])

  const toSwitcher = useCallback(() => {
    setAnimating(false)
    setPhase('switcher')
  }, [])

  /** Home-indicator gesture: flick up closes, slow drag up opens the switcher. */
  const homeGesture = useDrag({
    threshold: 6,
    captureOnDown: true,
    onStart: () => {
      dragging.current = true
      setAnimating(false)
    },
    onMove: ({ dy }) => {
      if (!dragging.current || !appId) return
      const p = Math.max(0, Math.min(1, -dy / 420))
      setStyle(lerp(origin, p))
    },
    onEnd: ({ dy, vy }) => {
      dragging.current = false
      if (!appId) return
      const up = -dy
      const speed = -vy

      if (up > 40 && speed < SWITCHER_VELOCITY && speed > -0.3) {
        setStyle(expanded)
        toSwitcher()
        return
      }
      if (up > DISMISS_COMMIT_PX || speed > DISMISS_VELOCITY) {
        closeApp()
        return
      }
      setAnimating(true)
      setStyle(expanded)
      after(CLOSE_MS, () => setAnimating(false))
    },
  })

  const api: ShellApi = {
    openApp: (id) => openApp(id, CENTER),
    closeApp,
    currentAppId: appId,
  }

  const app = appId ? appById(appId) : null
  const showApp = appId !== null && phase !== 'switcher'
  // On close the home screen comes back forward as the app shrinks into it.
  const homeReceding = phase === 'opening' || phase === 'open'

  return (
    <div className="device">
      <div className="device-frame">
        <div className="screen" style={{ width: SCREEN_W, height: SCREEN_H }}>
          <HomeScreen onOpen={openApp} receding={homeReceding} />

          {phase === 'switcher' && (
            <AppSwitcher
              recents={recents}
              renderApp={renderApp}
              api={api}
              onPick={(id) => {
                const a = appById(id)
                if (!a) return
                setPhase('open')
                setAppId(id)
                setStyle(expanded)
                setRecents((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8))
              }}
              onClose={(id) => setRecents((r) => r.filter((x) => x !== id))}
              onDismiss={() => {
                setAppId(null)
                setPhase('home')
                setStyle(expanded)
              }}
            />
          )}

          {showApp && app && (
            <div
              className="app-window"
              style={{
                transform: style.transform,
                borderRadius: style.borderRadius,
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

          <div className="status-layer">
            <StatusBar dark={showApp ? app?.statusDark : false} />
          </div>

          {/*
            No onClick here: a drag that starts and ends on this strip also
            fires a click, which would instantly dismiss the switcher the drag
            just opened. The switcher is dismissed by its own backdrop.
          */}
          <div
            className="home-indicator-zone"
            style={{ pointerEvents: showApp ? 'auto' : 'none' }}
            {...(showApp ? homeGesture : {})}
          >
            <div className="home-indicator" />
          </div>
        </div>
      </div>
    </div>
  )
}
