import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * User preferences.
 *
 * Every switch here changes real behaviour — a Settings screen full of toggles
 * that do nothing is worse than no Settings screen, because it teaches the
 * customer that controls in this app are decorative.
 */

export interface Settings {
  /** Preselected on the cart. */
  defaultFulfilment: 'pickup' | 'delivery'
  /** Preselected tip in basis points. */
  defaultTipBps: number
  /** Text me when each kitchen finishes. */
  orderUpdates: boolean
  /** Haptic feedback on supported devices. */
  haptics: boolean
  /** Show dietary tags on menu rows. */
  showDietary: boolean
  /** Round every order up to the nearest dollar for the tip. */
  roundUp: boolean
}

const DEFAULTS: Settings = {
  defaultFulfilment: 'pickup',
  defaultTipBps: 0,
  orderUpdates: true,
  haptics: true,
  showDietary: true,
  roundUp: false,
}

const KEY = 'fb.settings.v1'

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const p = JSON.parse(raw) as Partial<Settings>
    return {
      defaultFulfilment: p.defaultFulfilment === 'delivery' ? 'delivery' : 'pickup',
      defaultTipBps: typeof p.defaultTipBps === 'number' ? p.defaultTipBps : DEFAULTS.defaultTipBps,
      orderUpdates: p.orderUpdates ?? DEFAULTS.orderUpdates,
      haptics: p.haptics ?? DEFAULTS.haptics,
      showDietary: p.showDietary ?? DEFAULTS.showDietary,
      roundUp: p.roundUp ?? DEFAULTS.roundUp,
    }
  } catch {
    return DEFAULTS
  }
}

interface Api extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
}

const Ctx = createContext<Api | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Settings>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* private mode — preferences just won't survive a reload */
    }
  }, [state])

  const value = useMemo<Api>(
    () => ({
      ...state,
      set: (key, v) => setState((s) => ({ ...s, [key]: v })),
      reset: () => setState(DEFAULTS),
    }),
    [state],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSettings must be used inside <SettingsProvider>')
  return c
}
