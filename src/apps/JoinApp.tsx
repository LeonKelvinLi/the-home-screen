import { useState } from 'react'
import { AppChrome } from './AppChrome'
import { signUp, pendingReferral, type Account } from '../lib/account'
import { useGate } from '../lib/gate'
import type { ShellApi } from '../ios/Device'

/**
 * Sign up. Free, and it is what unlocks the rest of the app.
 *
 * HIS FIELDS, IN HIS ORDER: "name, email, Instagram account name and phone
 * number as optional". Only the first two are required, which is why only
 * those two carry a required mark — asking for a phone number and then not
 * needing it is the fastest way to lose somebody at a form.
 *
 * NO PASSWORD, because he asked for none. The session cookie the server sets is
 * the credential, which means this device stays signed in and another device
 * cannot. That is stated on the screen rather than discovered later: a member
 * who signs up on their phone and then opens the app on an iPad should know
 * why they are being asked again, and should not be offered an email-only
 * "sign in" that would let anyone else do the same with their address.
 */
export function JoinApp({ api, onDone }: { api: ShellApi; onDone?: (a: Account) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [phone, setPhone] = useState('')
  /*
    THE PROVIDER HAS TO BE TOLD, or the gate keeps firing after a successful
    sign-up. It loads the account once on boot and holds it; nothing else
    invalidates that, so a member created afterwards is invisible to every gate
    on the screen until a reload. Found by walking the journey rather than by
    reading it — signing up and being asked to sign up again looks identical to
    a broken form.
  */
  const { setAccount } = useGate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ref = pendingReferral()

  const ready = name.trim().length >= 2 && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.trim())

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready || busy) return
    setBusy(true)
    setError(null)
    const r = await signUp({
      name: name.trim(),
      email: email.trim(),
      instagram: instagram.trim() || undefined,
      phone: phone.trim() || undefined,
    })
    setBusy(false)
    if (!r.ok) {
      setError(r.error)
      return
    }
    setAccount(r.account)
    onDone?.(r.account)
    api.closeApp()
  }

  return (
    <AppChrome title="Sign up" onBack={api.closeApp} tint="#141416">
      <form className="join" onSubmit={submit}>
        <p className="join-lead">
          Free, and it opens the whole directory — every city, the reels, the gallery and search.
        </p>

        {/* Said where it matters. A referred sign-up is the referrer's credit. */}
        {ref && (
          <p className="join-ref" role="status">
            You were invited with code <strong>{ref}</strong>. Signing up credits whoever shared it.
          </p>
        )}

        <label className="join-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            enterKeyHint="next"
            required
          />
        </label>

        <label className="join-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            enterKeyHint="next"
            required
          />
        </label>

        <label className="join-field">
          <span>Instagram <em>optional</em></span>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@yourhandle"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </label>

        <label className="join-field">
          <span>Phone <em>optional</em></span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
        </label>

        {error && (
          <p className="join-error" role="alert">
            {error}
          </p>
        )}

        <button className="btn-primary" type="submit" disabled={!ready || busy}>
          {busy ? 'Signing you up…' : 'Sign up free'}
        </button>

        <p className="join-fine">
          Signing up keeps you signed in on this device. There is no password yet, so opening the
          app somewhere else means signing up again with a different email — we will not let an
          email alone unlock an account that has referral credit on it.
        </p>
      </form>
    </AppChrome>
  )
}
