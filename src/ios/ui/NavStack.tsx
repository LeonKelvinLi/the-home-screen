import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useDrag } from '../useDrag'
import { EASE_IOS } from '../constants'

/**
 * Horizontal push/pop between two screens, with the interactive back-swipe.
 *
 * iOS pushes the incoming screen in from the right while the outgoing one
 * parallaxes left at about 30% of the distance and dims, with a shadow on the
 * incoming edge. Swapping the component outright — which is what Cart did to
 * reach Checkout — loses all of that and reads as a page load.
 *
 * The back-swipe starts from the left edge only, matching UIKit, so a
 * horizontal drag in the middle of a list is never stolen from the content.
 */

const PUSH_MS = 380
const EDGE_PX = 28
const COMMIT_FRACTION = 0.32

interface Props {
  /** The screen underneath. */
  root: ReactNode
  /** When present, pushed on top of `root`. */
  pushed?: ReactNode | null
  onPop: () => void
  width: number
}

export function NavStack({ root, pushed, onPop, width }: Props) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const fromEdge = useRef(false)

  const drag = useDrag({
    threshold: 8,
    onStart: (e) => {
      // Only an edge grab starts a pop; anything else belongs to the content.
      const host = e.currentTarget as HTMLElement
      fromEdge.current = e.clientX - host.getBoundingClientRect().left <= EDGE_PX
      if (fromEdge.current) setDragging(true)
    },
    onMove: ({ dx }) => {
      if (!fromEdge.current) return
      setDragX(Math.max(0, dx))
    },
    onCancel: () => {
      setDragging(false)
      setDragX(0)
    },
    onEnd: ({ dx, vx }) => {
      if (!fromEdge.current) return
      setDragging(false)
      setDragX(0)
      if (dx > width * COMMIT_FRACTION || vx > 0.5) onPop()
    },
  })

  const open = !!pushed
  const progress = open ? Math.min(1, dragX / width) : 1
  const ease = dragging ? 'none' : `transform ${PUSH_MS}ms ${EASE_IOS}, opacity ${PUSH_MS}ms ${EASE_IOS}`

  return (
    <div className="navstack" {...(open ? drag : {})}>
      <div
        className="navstack-layer"
        aria-hidden={open && progress < 0.5}
        style={{
          // Parallax: the outgoing screen travels ~30% of the distance.
          transform: `translate3d(${open ? -width * 0.3 * (1 - progress) : 0}px,0,0)`,
          opacity: open ? 0.6 + 0.4 * progress : 1,
          transition: ease,
        }}
      >
        {root}
      </div>

      {open && (
        <div
          className="navstack-layer is-pushed"
          style={{ transform: `translate3d(${dragX}px,0,0)`, transition: ease }}
        >
          {pushed}
        </div>
      )}
    </div>
  )
}
