import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { appById } from '../apps/registry'
import type { ShellApi } from './Device'
import { useDrag } from './useDrag'
import { useScreenSize } from './ScreenSize'
import { EASE_IOS } from './constants'
import { InPreview } from './preview'

/**
 * Card stack. The cards hold the real app, rendered small and inert, rather
 * than a static placeholder — a screenshot-looking card is the thing people
 * notice is fake.
 */

const CARD_SCALE = 0.72
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
  const screen = useScreenSize()
  const [index, setIndex] = useState(0)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  /*
    A LIST, not one id. Flinging a second card before the first one's 220ms
    close had run overwrote the single slot: the first timer still fired, its
    setFlungUp(null) cleared the SECOND card's flung state mid-flight, and that
    card popped back into the rail before disappearing a moment later.
  */
  const [flungUp, setFlungUp] = useState<string[]>([])
  /* Same list, readable synchronously from inside a gesture handler. */
  const flungRef = useRef<string[]>([])
  const [cardDy, setCardDy] = useState(0)
  const idxRef = useRef(0)
  idxRef.current = index
  const axis = useRef<'x' | 'y' | null>(null)
  const flingTimers = useRef<number[]>([])

  useEffect(() => () => flingTimers.current.forEach((t) => clearTimeout(t)), [])

  /*
    Keep the selected card in range whenever the rail shrinks.

    This used to be clamped inside the fling handler against `recents.length`
    captured when the fling started — already stale by the time the timer ran,
    and wrong by more than one after two flings. Reacting to the real length
    is correct however many cards leave.
  */
  useEffect(() => {
    setIndex((i) => Math.max(0, Math.min(i, recents.length - 1)))
  }, [recents.length])

  const cardW = screen.w * CARD_SCALE
  const cardH = screen.h * CARD_SCALE
  /** Centre the active card; the gap sits between cards, not before the first. */
  const railPad = (screen.w - cardW) / 2

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
    onCancel: () => {
      setDragging(false)
      setDx(0)
      setCardDy(0)
      axis.current = null
    },
    onEnd: ({ dx, dy, vx, vy }) => {
      setDragging(false)
      // Moves can be coalesced away, leaving the axis unlatched; derive it from
      // the final delta so a fast vertical flick still closes the card.
      const a = axis.current ?? (Math.abs(dy) > Math.abs(dx) ? 'y' : 'x')
      axis.current = null

      if (a === 'y') {
        /*
          Target the first card that is NOT already on its way out.

          A flung card is not removed for 220ms while it animates, so a second
          fling inside that window resolved to the same id and threw the same
          card away twice — two flicks, one app closed. Skipping the leavers
          means the card that visually slid under the thumb is the one that
          goes, which is what the gesture looks like it is doing.
        */
        const id = recents.filter((r) => !flungRef.current.includes(r))[idxRef.current]
        if (id && (-dy > 110 || -vy > 0.6)) {
          flungRef.current = [...flungRef.current, id]
          setFlungUp(flungRef.current)
          const t = window.setTimeout(() => {
            onClose(id)
            flungRef.current = flungRef.current.filter((x) => x !== id)
            setFlungUp(flungRef.current)
            flingTimers.current = flingTimers.current.filter((x) => x !== t)
          }, 220)
          flingTimers.current.push(t)
        }
        setCardDy(0)
        return
      }

      if (Math.abs(dx) > 60 || Math.abs(vx) > 0.35) {
        const dir = Math.abs(vx) > 0.35 ? (vx < 0 ? 1 : -1) : dx < 0 ? 1 : -1
        setIndex((i) => Math.max(0, Math.min(recents.length - 1, i + dir)))
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
          paddingLeft: railPad,
          gap: CARD_GAP,
          transform: `translate3d(${-index * (cardW + CARD_GAP) + dx}px,0,0)`,
          transition: dragging ? 'none' : `transform 320ms ${EASE_IOS}`,
        }}
      >
        {recents.map((id, i) => {
          const app = appById(id)
          if (!app) return null
          const active = i === index
          const leaving = flungUp.includes(id)
          return (
            <div
              className={`switcher-card${active ? ' is-active' : ''}${leaving ? ' is-leaving' : ''}`}
              key={id}
              style={{
                width: cardW,
                height: cardH,
                transform: `translate3d(0, ${active ? cardDy : 0}px, 0)`,
                transition: dragging ? 'none' : `transform 260ms ${EASE_IOS}, opacity 200ms linear`,
              }}
              onClick={() => (active ? onPick(id) : setIndex(i))}
            >
              <div className="switcher-card-label">
                <span className="switcher-card-icon">{app.icon}</span>
                <span>{app.name}</span>
              </div>
              {/*
                A card is a PICTURE of an app, not a working copy of it. Every
                card renders the real screen, so without this a Tab key walked
                into the buttons and fields of every recent app behind the
                switcher — and a tap that landed on one of them acted on that
                app instead of selecting the card.
              */}
              <div className="switcher-card-shot" {...{ inert: '' }}>
                <div
                  className="switcher-card-inner"
                  style={{ width: screen.w, height: screen.h, transform: `scale(${CARD_SCALE})` }}
                >
                  <InPreview.Provider value={true}>{renderApp(id, api)}</InPreview.Provider>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
