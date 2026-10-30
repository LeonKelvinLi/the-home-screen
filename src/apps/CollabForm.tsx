import { useRef, useState } from 'react'

/**
 * The Collab key's form: a food creator's name, number, email and Instagram.
 *
 * Glenn, 2026-09-16: "Keep it really simple and ask for their basic
 * information like name, phone number, email address [and] IG handle." Four
 * fields and a Send button, nothing else. The server applies the same tests
 * (server/index.ts, /api/collabs); these only decide when Send lights up.
 *
 * Module scope, like GetInTouch on the Designs page: a component declared in a
 * render body remounts on every render and empties a half-typed form.
 */

/* What a person types for a handle: `@name`, `name`, or a profile link. */
function handleFrom(raw: string): string | null {
  let s = raw.trim()
  const link = s.match(/instagram\.com\/([^/?#\s]+)/i)
  if (link) s = link[1]
  s = s.replace(/^@+/, '')
  return /^[A-Za-z0-9._]{1,30}$/.test(s) && /[A-Za-z0-9]/.test(s) ? s : null
}

export function CollabForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentOnce = useRef(false)

  /* The loose tests the other forms use: ten digits, or eleven starting with
     1, or a + number with at least eight; something@something.tld. */
  const digits = phone.replace(/\D/g, '')
  const phoneOk = phone.trim().startsWith('+')
    ? digits.length >= 8
    : digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
  const handle = handleFrom(instagram)
  const ready = name.trim().length >= 2 && phoneOk && emailOk && handle !== null

  const submit = async () => {
    if (!ready || sending || sentOnce.current) return
    setSending(true)
    setError(null)
    try {
      const { submitCollab } = await import('../lib/api')
      await submitCollab({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        instagram: handle ?? '',
      })
      sentOnce.current = true
      setSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send that. Try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <p className="collab-done" role="status">
        Thanks, {name.trim()}. We have your details and will reach out to @{handle} to set
        something up.
      </p>
    )
  }

  return (
    <form
      className="collab-form"
      aria-label="Collab with BEASTY pages"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <label className="join-field">
        <span>Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Your name"
          enterKeyHint="next"
          required
        />
      </label>
      <label className="join-field">
        <span>Phone number</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          placeholder="(510) 555-0123"
          enterKeyHint="next"
          required
        />
      </label>
      <label className="join-field">
        <span>Email address</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          enterKeyHint="next"
          required
        />
      </label>
      <label className="join-field">
        <span>Instagram handle</span>
        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="@yourhandle"
          enterKeyHint="send"
          required
        />
      </label>
      <button type="submit" className="btn-primary" disabled={!ready || sending}>
        {sending ? 'Sending…' : 'Send'}
      </button>
      {error && (
        <p className="collab-error" role="alert">
          {error}
        </p>
      )}
      <p className="collab-fine">
        Your details go to the BEASTY pages team and are used only to set up a collab.
      </p>
    </form>
  )
}
