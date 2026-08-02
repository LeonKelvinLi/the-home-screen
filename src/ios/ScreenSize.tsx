import { createContext, useContext, useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { SCREEN_H, SCREEN_W } from './constants'

/**
 * The live pixel size of the fake screen.
 *
 * On desktop the device renders at exactly SCREEN_W x SCREEN_H, but on a real
 * phone the CSS switches to 100vw/100dvh — 430x932 on a Pro Max, 375x812 on a
 * mini. Anything that hard-codes the constants (pager offsets, the app-open
 * scale, switcher card width) is then wrong by the difference: on a Pro Max
 * that left 68px of dead space and let page 2's icons bleed into page 1.
 */

export type DeviceClass = 'phone' | 'pad'

export interface ScreenSize {
  w: number
  h: number
  /** Drives grid density, icon size and whether a device frame is drawn. */
  device: DeviceClass
  /** Icon tile edge in px. iPad icons are noticeably larger than iPhone ones. */
  iconSize: number
  /** Home-screen grid columns. */
  columns: number
}

/**
 * iPadOS packs more columns as the display widens rather than scaling one
 * layout up, so a 1440px window shows a genuine tablet home screen instead of a
 * blown-up phone.
 */
function metricsFor(w: number): Pick<ScreenSize, 'device' | 'iconSize' | 'columns'> {
  if (w < 700) return { device: 'phone', iconSize: 60, columns: 4 }
  if (w < 900) return { device: 'pad', iconSize: 72, columns: 5 }
  if (w < 1180) return { device: 'pad', iconSize: 76, columns: 6 }
  return { device: 'pad', iconSize: 78, columns: 8 }
}

const ScreenSizeContext = createContext<ScreenSize>({
  w: SCREEN_W,
  h: SCREEN_H,
  ...metricsFor(SCREEN_W),
})

export const useScreenSize = () => useContext(ScreenSizeContext)

export function useMeasuredScreen(ref: RefObject<HTMLElement | null>): ScreenSize {
  const [size, setSize] = useState<ScreenSize>({ w: SCREEN_W, h: SCREEN_H, ...metricsFor(SCREEN_W) })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const read = () => {
      // offsetWidth, not getBoundingClientRect: the whole device may be
      // CSS-scaled to fit a short window, and layout geometry must stay in
      // unscaled units or every measurement compounds the scale.
      const w = el.offsetWidth || SCREEN_W
      const h = el.offsetHeight || SCREEN_H
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h, ...metricsFor(w) }))
    }

    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])

  return size
}

export const ScreenSizeProvider = ScreenSizeContext.Provider
