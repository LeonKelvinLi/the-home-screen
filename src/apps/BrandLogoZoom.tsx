import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BrandLogo } from '../ios/BrandLogo'
import type { Logo } from '../data/brands'

/** Glenn, October 31: tap the logo inside a business page to inspect it,
 * then tap again to return. Grid icons keep opening their pages normally. */
export function BrandLogoZoom({ name, logo, pageMark }: { name: string; logo: Logo; pageMark?: string }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!open) return
    const element = dialog.current
    const opener = trigger.current
    element?.showModal()
    return () => {
      element?.close()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])
  return <>
    <button type="button" ref={trigger} className="brand-logo-zoom-trigger"
      aria-label={`Enlarge ${name} logo`} aria-haspopup="dialog" aria-expanded={open}
      onClick={() => setOpen(true)}>
      {pageMark
        ? <img className="brand-hero-wordmark" src={pageMark} alt={name} />
        : <BrandLogo logo={logo} size={78} />}
    </button>
    {open && createPortal(
      <dialog ref={dialog} className="brand-logo-dialog" aria-label={`${name} logo`}
        onCancel={event => { event.preventDefault(); setOpen(false) }}
        onClick={event => { if (event.target === event.currentTarget) setOpen(false) }}>
        <button type="button" className="brand-logo-close" aria-label={`Close enlarged ${name} logo`} onClick={() => setOpen(false)}>×</button>
        <button type="button" className="brand-logo-large" style={{ background: logo.bg.includes('|') ? `linear-gradient(135deg, ${logo.bg.split('|').join(',')})` : logo.bg }} aria-label={`Restore ${name} logo size`} onClick={() => setOpen(false)}>
          {pageMark || logo.imageUrl
            ? <img src={pageMark ?? logo.imageUrl} alt={name} />
            : <BrandLogo logo={logo} size={280} masked={false} />}
        </button>
        <p>Tap the logo to return</p>
      </dialog>, document.body)}
  </>
}
