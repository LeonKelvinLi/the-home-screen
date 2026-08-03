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
}

/*
 * Removed rather than left on screen: orderUpdates (no notification or SMS
 * code exists), haptics (no haptics code, and iOS Safari has no vibrate),
 * showDietary (no item in either data file sets tags, so it toggled nothing)
 * and roundUp (never implemented). Each was read only by the screen that drew
 * it. A toggle that does nothing teaches the customer that controls here are
 * decorative, which is exactly what the note above says not to do.
 */

const DEFAULTS: Settings = {
  defaultFulfilment: 'pickup',
  defaultTipBps: 0,
}

/** Also read by the cart, which seeds itself from these. */
export const SETTINGS_KEY = 'fb.settings.v1'
const KEY = SETTINGS_KEY

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const p = JSON.parse(raw) as Partial<Settings>
    return {
      defaultFulfilment: p.defaultFulfilment === 'delivery' ? 'delivery' : 'pickup',
      defaultTipBps: typeof p.defaultTipBps === 'number' ? p.defaultTipBps : DEFAULTS.defaultTipBps,
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
