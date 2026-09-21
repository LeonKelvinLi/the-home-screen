import { useEffect, useRef, useState } from 'react'
import { smsHref, telHref } from '../../lib/operator'

/**
 * A phone number that asks "call or text?" when tapped.
 *
 * His ask of 2026-09-19, over a screenshot of the plain `tel:` sheet that only
 * offers Call: "Is there a way when you tap the phone number it gives you a
 * call or text option? Call or SMS." The owners' card says text or email is
 * preferred, so a number that could only be dialled argued with its own line.
 *
 * Both are real links — `tel:` and `sms:` — because the phone app and the
 * messages app open from an anchor, not from script. The sheet is small and
 * modal: Escape or the scrim closes it, and focus starts on Call.
 */
export function CallOrText({
  phone,
  name,
  className,
  children,
}: {
  phone: string
  /** Who is being reached, for the sheet's title and its accessible name. */
  name?: string
  className?: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        className={className ?? 'calltext-number'}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {children ?? phone}
      </button>
      {open && <CallOrTextSheet phone={phone} name={name} onClose={() => setOpen(false)} />}
    </>
  )
}

export function CallOrTextSheet({
  phone,
  name,
  onClose,
}: {
  phone: string
  name?: string
  onClose: () => void
}) {
  const first = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    first.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])
  const who = name ? `${name}, ${phone}` : phone
  return (
    <div className="calltext-scrim" onClick={onClose}>
      <div
        className="calltext-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Call or text ${who}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="calltext-title">{who}</p>
        <a ref={first} className="calltext-btn" href={telHref(phone)} onClick={onClose}>
          Call
        </a>
        <a className="calltext-btn" href={smsHref(phone)} onClick={onClose}>
          Text
        </a>
        <button type="button" className="calltext-cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
