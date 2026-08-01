import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { appById } from '../apps/registry'
import type { ShellApi } from './Device'
import { useDrag } from './useDrag'
import { EASE_IOS, SCREEN_H, SCREEN_W } from './constants'

/**
 * Card stack. The cards hold the real app, rendered small and inert, rather
 * than a static placeholder — a screenshot-looking card is the thing people
 * notice is fake.
 */

const CARD_SCALE = 0.72
const CARD_W = SCREEN_W * CARD_SCALE
const CARD_GAP = 14

interface Props {
  recents: string[]
  renderApp: (appId: string, api: ShellApi) => ReactNode
  api: ShellApi
  onPick: (appId: string) => void
  onClose: (appId: string) => void
  onDismiss: () => void
}

export function AppSwitcher({ recents, renderApp, api, onPick, onClose, onDismiss }: Props) {
  const [index, setIndex] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [flungUp, setFlungUp] = useState<string | null>(null)
  const idxRef = useRef(0)
  idxRef.current = index

  const axis = useRef<'x' | 'y' | null>(null)
  const [cardDy, setCardDy] = useState(0)

  const drag = useDrag({
    threshold: 8,
    onStart: () => {
      setDragging(true)
      axis.current = null
    },
    onMove: ({ dx, dy }) => {
      if (!axis.current) axis.current = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x'
      if (axis.current === 'y') setCardDy(Math.min(0, dy))
      else setDx(dx)
    },
    onEnd: ({ dx, dy, vx, vy }) => {
      setDragging(false)
      if (axis.current === 'y') {
        const id = recents[idxRef.current]
        if (id && (-dy > 110 || -vy > 0.6)) {
          setFlungUp(id)
          window.setTimeout(() => {
            onClose(id)
            setFlungUp(null)
            setIndex((i) => Math.max(0, Math.min(i, recents.length - 2)))
          }, 220)
        }
        setCardDy(0)
        return
      }
      const committed = Math.abs(dx) > 60 || Math.abs(vx) > 0.35
      if (committed) {
        setIndex((i) => Math.max(0, Math.min(recents.length - 1, dx < 0 ? i + 1 : i - 1)))
      }
      setDx(0)
    },
  })

  if (recents.length === 0) {
    return (
      <div className="switcher is-empty" onClick={onDismiss}>
        <p>No recent apps</p>
      </div>
    )
  }

  return (
    <div className="switcher" {...drag}>
      <div className="switcher-backdrop" onClick={onDismiss} />
      <div
        className="switcher-track"
        style={{
          transform: `translate3d(${-index * (CARD_W + CARD_GAP) + dx}px,0,0)`,
          transition: dragging ? 'none' : `transform 320ms ${EASE_IOS}`,
        }}
      >
        {recents.map((id, i) => {
          const app = appById(id)
          if (!app) return null
          const active = i === index
          const leaving = flungUp === id
          return (
            <div
              className={`switcher-card${active ? ' is-active' : ''}${leaving ? ' is-leaving' : ''}`}
              key={id}
              style={{
                width: CARD_W,
                height: SCREEN_H * CARD_SCALE,
                transform: `translate3d(0, ${active ? cardDy : 0}px, 0)`,
                transition: dragging ? 'none' : `transform 260ms ${EASE_IOS}, opacity 200ms linear`,
              }}
              onClick={() => (active ? onPick(id) : setIndex(i))}
            >
              <div className="switcher-card-label">
                <span className="switcher-card-icon">{app.icon}</span>
                <span>{app.name}</span>
              </div>
              <div className="switcher-card-shot">
                <div
                  className="switcher-card-inner"
                  style={{
                    width: SCREEN_W,
                    height: SCREEN_H,
                    transform: `scale(${CARD_SCALE})`,
                  }}
                >
                  {renderApp(id, api)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
