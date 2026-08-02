import type { ReactNode } from 'react'
import { Symbol } from './Symbol'
import type { SymbolName } from './Symbol'

/**
 * iOS inset-grouped list.
 *
 * The details that make it read as iOS rather than "a rounded card":
 *  - separators start at the label, not the card edge, so they align under the
 *    text and clear the icon;
 *  - the whole row is the hit target, minimum 44pt tall;
 *  - the disclosure chevron is tertiary grey, never the tint colour;
 *  - section headers are uppercase footnote grey, footers are explanatory
 *    sentences in the same grey.
 */

export function ListSection({
  header,
  footer,
  children,
}: {
  header?: string
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="ios-section">
      {header && <h3 className="ios-section-header">{header}</h3>}
      <div className="ios-list">{children}</div>
      {footer && <p className="ios-section-footer">{footer}</p>}
    </section>
  )
}

interface RowProps {
  /** Rounded-square glyph tile, as Settings uses. */
  icon?: SymbolName
  iconBg?: string
  label: ReactNode
  /** Grey text at the trailing edge, before any chevron. */
  value?: ReactNode
  /** Second line under the label. */
  detail?: ReactNode
  onClick?: () => void
  /** Show a disclosure chevron. Implied by onClick unless explicitly false. */
  chevron?: boolean
  /** Trailing control (switch, etc). Suppresses the chevron. */
  accessory?: ReactNode
  /** Destructive rows use systemRed for the label. */
  destructive?: boolean
  disabled?: boolean
}

export function ListRow({
  icon,
  iconBg = '#8E8E93',
  label,
  value,
  detail,
  onClick,
  chevron,
  accessory,
  destructive,
  disabled,
}: RowProps) {
  const showChevron = chevron ?? (!!onClick && !accessory)
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      className={`ios-row${onClick ? ' is-tappable' : ''}${destructive ? ' is-destructive' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={onClick && disabled ? true : undefined}
      type={onClick ? 'button' : undefined}
    >
      {icon && (
        <span className="ios-row-icon" style={{ background: iconBg }}>
          <Symbol name={icon} size={15} color="#fff" />
        </span>
      )}
      <span className="ios-row-body">
        <span className="ios-row-label">{label}</span>
        {detail && <span className="ios-row-detail">{detail}</span>}
      </span>
      {value !== undefined && <span className="ios-row-value">{value}</span>}
      {accessory}
      {showChevron && (
        <span className="ios-row-chevron">
          <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
        </span>
      )}
    </Tag>
  )
}

/** iOS switch. 51x31pt with a 27pt knob — the proportions are load-bearing. */
export function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`ios-switch${on ? ' is-on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className="ios-switch-knob" />
    </button>
  )
}
