import { useEffect, useMemo, useRef, useState } from 'react'
import { useDrag } from '../ios/useDrag'
import type { Brand, MenuItem } from '../data/brands'
import { money, useCart } from '../store/cart'
import type { CartOption } from '../store/cart'

/**
 * Bottom sheet for one menu item. Required option groups block "Add" until
 * chosen, the same way every real ordering flow does it — otherwise the kitchen
 * gets a ticket that says "wings" and nothing else.
 */

export function ItemSheet({
  brand,
  item,
  onClose,
}: {
  brand: Brand
  item: MenuItem
  onClose: () => void
}) {
  const cart = useCart()
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [picked, setPicked] = useState<Record<string, string[]>>({})
  const [closing, setClosing] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const closeTimer = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  /*
    Keyboard and screen-reader handling for the sheet.

    Without this the sheet was reachable but not escapable: it had no keyboard
    exit, nothing behind it was hidden, and focus was never moved in — so Tab
    walked straight past it into the menu rows under the scrim and could open a
    second sheet on top of the first. Anyone not using a touchscreen was stuck,
    and if the item had a required option group the only button was disabled
    until a choice they could not reach was made.

    Three parts: move focus in on open, hide the rest of the app from assistive
    tech while it is up, and put it back where it came from on close.
  */
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    const returnTo = document.activeElement as HTMLElement | null

    const app = sheet.closest('.app-window') ?? document.getElementById('root')
    const siblings = app
      ? ([...app.children].filter((c) => !c.contains(sheet)) as HTMLElement[])
      : []
    for (const el of siblings) el.setAttribute('inert', '')

    const first = sheet.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], input, textarea, [tabindex]:not([tabindex="-1"])',
    )
    ;(first ?? sheet).focus({ preventScroll: true })

    return () => {
      for (const el of siblings) el.removeAttribute('inert')
      returnTo?.focus?.({ preventScroll: true })
    }
  }, [])

  /** Escape closes; Tab cycles inside rather than escaping to the menu behind. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      dismiss()
      return
    }
    if (e.key !== 'Tab') return
    const sheet = sheetRef.current
    if (!sheet) return
    const focusable = [
      ...sheet.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((el) => el.offsetParent !== null)
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const groups = item.options ?? []

  const toggle = (groupId: string, choiceId: string, max: number) => {
    setPicked((p) => {
      const cur = p[groupId] ?? []
      if (cur.includes(choiceId)) return { ...p, [groupId]: cur.filter((c) => c !== choiceId) }
      const next = max === 1 ? [choiceId] : [...cur, choiceId].slice(-max)
      return { ...p, [groupId]: next }
    })
  }

  const chosen = useMemo<CartOption[]>(() => {
    const out: CartOption[] = []
    for (const g of groups) {
      for (const id of picked[g.id] ?? []) {
        const c = g.choices.find((x) => x.id === id)
        if (c) out.push({ groupId: g.id, choiceId: c.id, name: c.name, price: c.price })
      }
    }
    return out
  }, [groups, picked])

  const missing = groups.filter((g) => g.required && (picked[g.id] ?? []).length === 0)
  const unit = item.price + chosen.reduce((s, o) => s + o.price, 0)

  const dismiss = () => {
    if (closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(onClose, 260)
  }

  /*
    Drag-to-dismiss. The grabber was decorative — it only had an onClick, so
    dragging it 200px did nothing, which is the first thing anyone tries on a
    sheet. Downward only, with resistance if you pull up.
  */
  const sheetDrag = useDrag({
    threshold: 6,
    captureOnDown: true,
    onStart: () => setDragging(true),
    onMove: ({ dy }) => setDragY(dy > 0 ? dy : dy * 0.2),
    onCancel: () => {
      setDragging(false)
      setDragY(0)
    },
    onEnd: ({ dy, vy }) => {
      setDragging(false)
      /*
        Keep the drag offset when dismissing. Resetting it first put the sheet
        back at rest in the SAME commit that added .is-closing, so a sheet
        dragged 200px down snapped up to its resting position and only then
        slid away. `sheet-down` declares only a `to`, so its implicit `from` is
        whatever transform is on the element — leaving dragY in place makes the
        close continue from exactly where the finger let go.
      */
      if (dy > 110 || vy > 0.6) return dismiss()
      setDragY(0)
    },
  })

  const add = () => {
    // The sheet stays mounted for a 260ms slide-out, so without this guard a
    // fast double-tap on Add silently doubles the quantity.
    if (closing || missing.length > 0) return
    cart.add({
      brandId: brand.id,
      itemId: item.id,
      name: item.name,
      unitPrice: item.price,
      qty,
      options: chosen,
      note: note.trim() || undefined,
    })
    dismiss()
  }

  return (
    <div className={`sheet-layer${closing ? ' is-closing' : ''}`}>
      <div
        className="sheet-scrim"
        onClick={dismiss}
        style={dragging ? { opacity: Math.max(0.15, 0.4 - dragY / 900) } : undefined}
      />
      <div
        className="sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        onKeyDown={onKeyDown}
        // Focus target of last resort, for a sheet whose only button is
        // disabled because a required option has not been chosen yet.
        tabIndex={-1}
        style={{
          transform: dragY ? `translate3d(0, ${dragY}px, 0)` : undefined,
          transition: dragging ? 'none' : undefined,
        }}
      >
        <div className="sheet-grab-area" {...sheetDrag}>
          <div className="sheet-grabber" />
        </div>
        <div className="sheet-scroll">
          {/* The dish, at the moment the customer decides. A -lg variant is
              fetched here rather than the 256px thumbnail from the menu row,
              which would be soft blown up to sheet width. It loads only when
              the sheet opens, so it never touches first paint. */}
          {item.imageUrl && (
            <div className="sheet-hero">
              <img
                src={item.imageUrl.replace(/\.webp$/, '-lg.webp')}
                alt=""
                loading="eager"
                decoding="async"
                draggable={false}
              />
              {item.imageIsIllustration && (
                <span className="sheet-hero-illus">Illustration, not their photo</span>
              )}
            </div>
          )}

          <h2 className="sheet-title">{item.name}</h2>
          <p className="sheet-desc">{item.desc}</p>
          <p className="sheet-price">{money(item.price)}</p>

          {/* This is where the price is accepted, so the caveat has to be here
              and not only at the bottom of the menu page behind it. */}
          {brand.pricesEstimated && (
            <p className="sheet-flag">Needs confirming — {brand.pricesEstimated}</p>
          )}

          {groups.map((g) => (
            <section className="opt-group" key={g.id}>
              <div className="opt-head">
                <h3>{g.name}</h3>
                <span className={g.required ? 'opt-req' : 'opt-opt'}>
                  {g.required ? 'Required' : `Optional${g.max && g.max > 1 ? ` · up to ${g.max}` : ''}`}
                </span>
              </div>
              {g.choices.map((c) => {
                const on = (picked[g.id] ?? []).includes(c.id)
                return (
                  <button
                    key={c.id}
                    className={`opt-row${on ? ' is-on' : ''}`}
                    onClick={() => toggle(g.id, c.id, g.max ?? 1)}
                  >
                    <span className={`opt-mark${(g.max ?? 1) === 1 ? ' is-radio' : ''}`} />
                    <span className="opt-name">{c.name}</span>
                    {c.price > 0 && <span className="opt-price">+{money(c.price)}</span>}
                  </button>
                )
              })}
            </section>
          ))}

          <section className="opt-group">
            <div className="opt-head">
              <h3>Special instructions</h3>
              <span className="opt-opt">Optional</span>
            </div>
            <textarea
              className="sheet-note"
              rows={2}
              maxLength={240}
              placeholder="Allergies, no onion, extra sauce…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>
        </div>

        <div className="sheet-foot">
          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
              −
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase">
              +
            </button>
          </div>
          <button className="btn-primary" onClick={add} disabled={missing.length > 0}>
            {missing.length > 0 ? `Choose ${missing[0].name.toLowerCase()}` : `Add · ${money(unit * qty)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
