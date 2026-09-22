/*
  The CRM's charts, drawn by hand so they take the screen's own colours in
  light and dark. The rules they follow: one colour for bars that only name
  things (sources, cities), grey for "the rest", a light-to-dark ramp for
  ordered steps, thin marks, hairline grid, values at the tips, a readout on
  hover and on keyboard focus for charts over time, and a plain table behind
  every chart for anyone who would rather read rows.
  Every chart says in its subtitle exactly what it counts and over what time.
*/
import { useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import type { Change } from './periods'

const fmt = (n: number) => n.toLocaleString('en-US')
const pct = (v: number) => `${Math.round(v * 100)}%`

/* ------------------------------------------------------------------ card */

export interface TableView {
  head: string[]
  rows: (string | number)[][]
}

/** A chart's frame: what it shows, over what time, and a switch to a table. */
export function ChartCard({ title, sub, table, children, busy = false }: { title: string; sub: string; table: TableView; children: ReactNode; busy?: boolean }) {
  const [rows, setRows] = useState(false)
  return (
    <section className={`crm-card-chart${busy ? ' is-busy' : ''}`} aria-busy={busy}>
      <header>
        <div>
          <h3>{title}</h3>
          <p>{sub}</p>
        </div>
        <button type="button" className="crm-chart-switch" onClick={() => setRows((v) => !v)}>
          {rows ? 'Chart' : 'Table'}
        </button>
      </header>
      {rows ? (
        <div className="crm-chart-table-wrap">
          <table className="crm-chart-table">
            <thead>
              <tr>
                {table.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{typeof c === 'number' ? fmt(c) : c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  )
}

/* ------------------------------------------------------------ stat tiles */

/**
 * One headline number, answering three things on its face: what it is (the
 * label), over which days (the scope), and compared with what (the change
 * line). `good` says whether a rise is good news; `pending` greys the value
 * for a number that is not tracked yet.
 */
export function StatTile({
  label,
  scope,
  value,
  change,
  note,
  trend,
  good = true,
  pending = false,
}: {
  label: string
  scope?: string
  value: string
  change?: Change | null
  note?: string
  trend?: number[]
  good?: boolean
  pending?: boolean
}) {
  const tone = !change || change.way === 'same' ? '' : (change.way === 'up') === good ? ' is-good' : ' is-bad'
  return (
    <div className="crm-tile-stat">
      <span className="crm-tile-stat-top">
        <span className="crm-tile-stat-label">{label}</span>
        {scope && <span className="crm-tile-stat-scope">{scope}</span>}
      </span>
      <span className={`crm-tile-stat-value${pending ? ' is-pending' : ''}`}>{value}</span>
      {change && <span className={`crm-tile-stat-change${tone}`}>{change.text}</span>}
      {note && <span className="crm-tile-stat-note">{note}</span>}
      {trend && trend.length > 1 && <Spark points={trend} />}
    </div>
  )
}

function Spark({ points }: { points: number[] }) {
  const max = Math.max(...points, 1)
  const xy = points.map((v, i) => [(i / (points.length - 1)) * 100, 100 - (v / max) * 88 - 6] as const)
  const last = xy[xy.length - 1]
  return (
    <span className="crm-spark" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={xy.map(([x, y]) => `${x},${y}`).join(' ')} />
      </svg>
      <i style={{ left: `${last[0]}%`, top: `${last[1]}%` }} />
    </span>
  )
}

/* ----------------------------------------------------- horizontal bars */

export interface BarRow {
  label: string
  value: number
  /** A step's shade on the ordered ramp; bars that only name things keep the one colour. */
  shade?: string
  /** "Everywhere else" or "Not listed": grey, so the named rows lead. */
  muted?: boolean
}

/**
 * Things compared by size, one bar each, the value at the tip. Rows with
 * nothing are dropped unless `all` is set (the steps, where a zero is news).
 */
export function HBars({ rows, total, empty, format = fmt, all = false }: { rows: BarRow[]; total?: number; empty: string; format?: (n: number) => string; all?: boolean }) {
  const shown = all ? rows : rows.filter((r) => r.value > 0)
  if (!shown.some((r) => r.value > 0)) return <p className="crm-chart-empty">{empty}</p>
  const max = Math.max(...shown.map((r) => r.value), 1)
  return (
    <ul className="crm-hbars">
      {shown.map((r) => (
        <li key={r.label} className={r.muted ? 'is-muted' : undefined}>
          <span className="crm-hbars-label">{r.label}</span>
          <span className="crm-hbars-plot">
            {r.value > 0 && <span className="crm-hbars-bar" style={{ width: `calc((100% - 76px) * ${r.value / max})`, background: r.muted ? undefined : r.shade }} />}
            <span className="crm-hbars-val">
              {format(r.value)}
              {total ? <small>{pct(r.value / total)}</small> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/* -------------------------------------------------------------- stacked */

export interface StackSeries {
  key: string
  label: string
  color: string
}

/** Two parts of one total per column (sales and monthly plans), with a key, a total on each cap and a readout. */
export function StackedColumns({ series, cols, money, empty }: { series: StackSeries[]; cols: { label: string; values: number[] }[]; money: (n: number) => string; empty: string }) {
  const [on, setOn] = useState<number | null>(null)
  const totals = cols.map((c) => c.values.reduce((a, b) => a + b, 0))
  if (!totals.some((t) => t > 0)) return <p className="crm-chart-empty">{empty}</p>
  const top = niceTicks(Math.max(...totals, 1))
  const cap = top[top.length - 1]
  const n = cols.length
  const shown = xLabels(n, 7)
  const mid = (i: number) => ((i + 0.5) / n) * 100
  return (
    <div className="crm-cols">
      <div className="crm-legend">
        {series.map((s) => (
          <span key={s.key}>
            <i style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="crm-cols-plot">
        {top.map((t) => (
          <span key={t} className="crm-grid-y" style={{ bottom: `${(t / cap) * 100}%` }}>
            <em>{money(t)}</em>
          </span>
        ))}
        {cols.map((c, i) => (
          <div
            key={c.label}
            className={`crm-cols-band${on === i ? ' is-on' : ''}`}
            tabIndex={0}
            onPointerEnter={() => setOn(i)}
            onPointerLeave={() => setOn(null)}
            onFocus={() => setOn(i)}
            onBlur={() => setOn(null)}
            aria-label={`${c.label}: ${series.map((s, j) => `${s.label} ${money(c.values[j])}`).join(', ')}`}
          >
            {totals[i] > 0 && n <= 12 && (
              <span className="crm-cols-val" style={{ bottom: `calc(${(totals[i] / cap) * 100}% + 4px)` }}>
                {money(totals[i])}
              </span>
            )}
            <span className="crm-cols-stack" style={{ height: `${(totals[i] / cap) * 100}%` }}>
              {c.values.map((v, j) => (v > 0 ? <span key={j} style={{ flexGrow: v, background: series[j].color }} /> : null))}
            </span>
            {on === i && (
              <span className={`crm-tip${edge(mid(i))}`} role="status">
                <b>{c.label}</b>
                {series.map((s, j) => (
                  <span key={s.key}>
                    <i style={{ background: s.color }} />
                    <strong>{money(c.values[j])}</strong> {s.label}
                  </span>
                ))}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="crm-cols-x" aria-hidden="true">
        {cols.map((c, i) =>
          shown[i] ? (
            <span key={c.label} style={{ left: `${mid(i)}%` }} className={shown[i] === 'alt' ? 'is-alt' : undefined}>
              {c.label}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ line */

export interface LineCompare {
  /** What the dashed line is, for the key and the readout: "The 30 days before". */
  label: string
  /** The earlier stretch, bucket for bucket with the main line (day 1 against day 1). */
  points: { label: string; value: number }[]
}

/**
 * One series over time: a 2px line over a faint wash, the latest value named
 * at the end, and a crosshair that finds the nearest day or month under the
 * pointer (or the arrow keys) and reads it out. With `compare`, the stretch
 * before is a thin dashed grey line on the same scale, and the readout gives
 * both: the chart then needs its key, so it draws one.
 */
export function Line({ points, color, unit, empty, compare, name = 'This period' }: { points: { label: string; value: number }[]; color: string; unit: string; empty: string; compare?: LineCompare; name?: string }) {
  const [on, setOn] = useState<number | null>(null)
  const before = compare ? compare.points.slice(0, points.length) : []
  if (!points.some((p) => p.value > 0) && !before.some((p) => p.value > 0)) return <p className="crm-chart-empty">{empty}</p>
  const ticks = niceTicks(Math.max(...points.map((p) => p.value), ...before.map((p) => p.value), 1))
  const cap = ticks[ticks.length - 1]
  const n = points.length
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100)
  const y = (v: number) => 100 - (v / cap) * 100
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')
  const area = `0,100 ${line} 100,100`
  const last = points[n - 1]
  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    setOn(Math.round(f * (n - 1)))
  }
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') setOn((i) => Math.min(n - 1, (i ?? n - 1) + 1))
    if (e.key === 'ArrowLeft') setOn((i) => Math.max(0, (i ?? n - 1) - 1))
  }
  const sel = on === null ? null : points[on]
  const was = on === null ? null : before[on]
  const shown = xLabels(n)
  const said = (v: number) => `${fmt(v)} ${v === 1 ? unit.replace(/s$/, '') : unit}`
  return (
    <div className="crm-line">
      {compare && (
        <div className="crm-legend">
          <span>
            <i style={{ background: color }} />
            {name}
          </span>
          <span>
            <i className="is-dashed" />
            {compare.label}
          </span>
        </div>
      )}
      <div
        className="crm-line-plot"
        tabIndex={0}
        role="img"
        aria-label={`${unit}: ${points.map((p, i) => `${p.label} ${p.value}${before[i] ? ` (before: ${before[i].value})` : ''}`).join(', ')}`}
        onPointerMove={pick}
        onPointerLeave={() => setOn(null)}
        onFocus={() => setOn(n - 1)}
        onBlur={() => setOn(null)}
        onKeyDown={keys}
      >
        {ticks.map((t) => (
          <span key={t} className="crm-grid-y" style={{ bottom: `${(t / cap) * 100}%` }}>
            <em>{fmt(t)}</em>
          </span>
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {before.length > 1 && (
            <polyline
              className="crm-line-before"
              points={before.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          )}
          <polygon points={area} fill={color} fillOpacity="0.1" />
          <polyline points={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <i className="crm-line-dot" style={{ left: `${x(n - 1)}%`, top: `${y(last.value)}%`, background: color }} />
        <span className="crm-line-end" style={{ top: `${y(last.value)}%` }}>
          {fmt(last.value)}
        </span>
        {sel && on !== null && (
          <>
            <span className="crm-line-cross" style={{ left: `${x(on)}%` }} />
            <i className="crm-line-dot is-hover" style={{ left: `${x(on)}%`, top: `${y(sel.value)}%`, background: color }} />
            <span className={`crm-tip${edge(x(on))}`} style={{ left: `${x(on)}%` }} role="status">
              <b>{sel.label}</b>
              <span>
                <i style={{ background: color }} />
                <strong>{said(sel.value)}</strong>
              </span>
              {was && compare && (
                <span>
                  <i className="is-dashed" />
                  {was.label}: {said(was.value)}
                </span>
              )}
            </span>
          </>
        )}
      </div>
      <div className="crm-line-x">
        {points.map((p, i) =>
          shown[i] ? (
            <span key={p.label} style={{ left: `${x(i)}%` }} className={shown[i] === 'alt' ? 'is-alt' : undefined}>
              {p.label}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- ticks */

/**
 * Which x labels to print: every `step`th, counted back from the last so the
 * newest is always named and never crowded; 'alt' marks every other printed
 * one, which a narrow card hides (crm.css).
 */
export function xLabels(n: number, target = 6): ('show' | 'alt' | null)[] {
  const step = Math.max(1, Math.ceil(n / target))
  return Array.from({ length: n }, (_, i) => {
    const back = n - 1 - i
    if (back % step) return null
    return (back / step) % 2 ? 'alt' : 'show'
  })
}

/** A readout near either end of a chart opens inward, so it never leaves the card. */
const edge = (x: number) => (x > 70 ? ' is-left' : x < 30 ? ' is-right' : '')

/** 0 and one or two clean steps above the largest value (1, 2, 5 × 10ⁿ). */
export function niceTicks(max: number): number[] {
  const raw = max / 2
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
  const clean = Math.max(1, Math.round(step))
  const out = [0, clean]
  if (clean < max) out.push(clean * 2)
  return out
}
