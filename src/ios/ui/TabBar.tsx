import { Symbol } from './Symbol'
import type { SymbolName } from './Symbol'

/**
 * iOS tab bar.
 *
 * Sits over the content on a translucent material with a hairline top border,
 * icon above a 10pt label, systemBlue when selected and secondaryLabel grey
 * otherwise. Items are equal-width and the whole column is the hit target, so
 * every tab clears 44pt regardless of label length.
 */

export interface TabItem<T extends string = string> {
  key: T
  label: string
  icon: SymbolName
  /** Red badge, as on Phone's voicemail tab. */
  badge?: number
}

interface Props<T extends string> {
  items: TabItem<T>[]
  active: T
  onSelect: (key: T) => void
}

export function TabBar<T extends string>({ items, active, onSelect }: Props<T>) {
  return (
    <nav className="ios-tabbar" role="tablist">
      {items.map((it) => {
        const on = it.key === active
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={on}
            className={`ios-tab${on ? ' is-on' : ''}`}
            onClick={() => onSelect(it.key)}
          >
            <span className="ios-tab-icon">
              <Symbol name={it.icon} size={24} color={on ? '#007AFF' : 'rgba(60,60,67,0.6)'} />
              {it.badge ? <span className="ios-tab-badge">{it.badge > 99 ? '99+' : it.badge}</span> : null}
            </span>
            <span className="ios-tab-label">{it.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
