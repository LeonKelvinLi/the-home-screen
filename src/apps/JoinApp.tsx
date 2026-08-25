import { useState } from 'react'
import { AppChrome } from './AppChrome'
import { startSignUp, verifyCode, pendingReferral, type Account } from '../lib/account'
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
 * NO PASSWORD, AND NONE NEEDED: the address is proved with a six-digit code.
 * That is what makes a second device safe — an email-only "sign in" with no
 * proof would hand anybody an account, with its referral credit and its raffle
 * tickets, for the price of guessing an address. A code costs the real owner
 * ten seconds and costs an impostor the whole attack.
 *
 * SO THIS SCREEN IS BOTH SIGN-UP AND SIGN-IN and never says which. The server
 * knows; the form does not, because a screen that said "welcome back" would be
 * a membership oracle for anybody typing addresses into it.
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
  /* Two steps on one screen: details, then the code. */
  const [step, setStep] = useState<'details' | 'code'>('details')
  const [code, setCode] = useState('')
  const [undelivered, setUndelivered] = useState(false)
  const ref = pendingReferral()

  const ready = name.trim().length >= 2 && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.trim())

  async function askForCode(e: React.FormEvent) {
    e.preventDefault()
    if (!ready || busy) return
    setBusy(true)
    setError(null)
    const r = await startSignUp({
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
    setUndelivered(!r.delivered)
    setStep('code')
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault()
    if (code.replace(/\D/g, '').length !== 6 || busy) return
    setBusy(true)
    setError(null)
    const r = await verifyCode(email.trim(), code)
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
      {step === 'details' ? (
        <form className="join" onSubmit={askForCode}>
          <p className="join-lead">
            Free, and it opens the whole directory — every city, the reels, the gallery and search.
          </p>

          {/* Said where it matters. A referred sign-up is the referrer's credit. */}
          {ref && (
            <p className="join-ref" role="status">
              You were invited with code <strong>{ref}</strong>. Signing up credits whoever shared
              it.
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
            <span>
              Instagram <em>optional</em>
            </span>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourhandle"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </label>

          <label className="join-field">
            <span>
              Phone <em>optional</em>
            </span>
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
            {busy ? 'Sending your code…' : 'Send me a code'}
          </button>

          <p className="join-fine">
            We email a six-digit code to check the address is yours. It is also how you sign back
            in on another phone.
          </p>
        </form>
      ) : (
        <form className="join" onSubmit={submitCode}>
          <p className="join-lead">
            We sent a six-digit code to <strong>{email.trim()}</strong>. It is good for 10 minutes.
          </p>

          {/*
            SAID OUT LOUD WHEN NOTHING WAS SENT. The server has no email
            provider configured, so the code exists and nobody has it. A code
            box that can never be satisfied, with no explanation, is the worst
            version of this screen.
          */}
          {undelivered && (
            <p className="join-error" role="alert">
              Email is not connected on the server yet, so the code could not be delivered. The
              operator needs to set RESEND_API_KEY and OTP_FROM_EMAIL.
            </p>
          )}

          <label className="join-field">
            <span>Your code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              enterKeyHint="done"
              placeholder="000000"
              className="join-code"
              autoFocus
              required
            />
          </label>

          {error && (
            <p className="join-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={code.replace(/\D/g, '').length !== 6 || busy}
          >
            {busy ? 'Checking…' : 'Confirm'}
          </button>

          <button
            className="gate-later"
            type="button"
            onClick={() => {
              setStep('details')
              setError(null)
              setCode('')
            }}
          >
            Use a different email
          </button>
        </form>
      )}
    </AppChrome>
  )
}
