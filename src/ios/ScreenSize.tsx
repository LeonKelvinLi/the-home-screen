import { createContext, useContext, useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { PHONE_MAX, SCREEN_H, SCREEN_RADIUS, SCREEN_W } from './constants'

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
  /** The display's own corner radius. The app window rests at this. */
  radius: number
}

/**
 * iPadOS packs more columns as the display widens rather than scaling one
 * layout up, so a 1440px window shows a genuine tablet home screen instead of a
 * blown-up phone.
 */
function metricsFor(w: number): Pick<ScreenSize, 'device' | 'iconSize' | 'columns' | 'radius'> {
  // 480 is where the phone stylesheet takes over and the frame goes full-bleed
  // and square. It used to be 700 here, so 481-699px got a 4-column phone grid
  // with tablet chrome and an invisible 34px tap-swallowing strip at the
  // bottom. The two numbers have to be the same one.
  /*
    64 — LARGER than the iOS standard 60, on purpose.

    Every icon here is a small business's logo, most of them wordmarks with fine
    lettering, and they have to be recognised rather than merely located. Apple
    sizes for apps whose marks were drawn for 60px; these were drawn for a shop
    front. 66 fitted, but only with the rows squeezed to a 13px gap, and the
    grid read as one solid block. 64 with a 16px gap keeps most of the size and
    lets the rows breathe. Still twenty-four a page, still six rows.
  */
  if (w < PHONE_MAX) return { device: 'phone', iconSize: 64, columns: 4, radius: 0 }
  if (w < 900) return { device: 'pad', iconSize: 72, columns: 5, radius: SCREEN_RADIUS }
  if (w < 1180) return { device: 'pad', iconSize: 76, columns: 6, radius: SCREEN_RADIUS }
  return { device: 'pad', iconSize: 78, columns: 8, radius: SCREEN_RADIUS }
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
