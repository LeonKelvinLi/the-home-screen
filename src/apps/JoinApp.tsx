import { useEffect, useRef, useState } from 'react'
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
  /*
    A code that never arrives used to be a dead end.

    The only way to get another was Back, then retype four fields, because
    nothing on the code step could ask for one. Mail is late, it lands in spam,
    an address gets a typo — and every one of those ended the sign-up. So the
    code step can send another, on a cooldown so it cannot be leant on.
  */
  const [cooldown, setCooldown] = useState(0)
  const [resent, setResent] = useState(false)
  /* Counts down the 10 minutes the server gives the code, so "it expired" is
     something the screen says before the server has to. */
  const [expiresIn, setExpiresIn] = useState(0)
  const timer = useRef<number | null>(null)
  const ref = pendingReferral()

  /* One interval drives both counters. Cleared on unmount, so leaving the
     screen mid-countdown does not leave it running. */
  useEffect(() => {
    if (step !== 'code') return
    timer.current = window.setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0))
      setExpiresIn((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
      timer.current = null
    }
  }, [step])

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const ready = name.trim().length >= 2 && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.trim())

  /* The one send, called by the details form and by Resend. Both need the same
     handling of a failure, and two copies of it drift. */
  async function send(): Promise<boolean> {
    setError(null)
    const r = await startSignUp({
      name: name.trim(),
      email: email.trim(),
      instagram: instagram.trim() || undefined,
      phone: phone.trim() || undefined,
    })
    if (!r.ok) {
      setError(r.error)
      return false
    }
    setUndelivered(!r.delivered)
    setCooldown(30)
    setExpiresIn(600)
    return true
  }

  async function askForCode(e: React.FormEvent) {
    e.preventDefault()
    if (!ready || busy) return
    setBusy(true)
    const ok = await send()
    setBusy(false)
    if (ok) setStep('code')
  }

  async function resend() {
    if (busy || cooldown > 0) return
    setBusy(true)
    setResent(false)
    const ok = await send()
    setBusy(false)
    if (ok) {
      setResent(true)
      setCode('')
    }
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

  /* Titled for both. This screen is sign-up and sign-in and the server decides
     which; a title that named one would be wrong half the time. */
  return (
    <AppChrome title="Sign in or join" onBack={api.closeApp} tint="#141416">
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
            We sent a six-digit code to <strong>{email.trim()}</strong>.{' '}
            {expiresIn > 0 ? (
              <>
                It expires in <strong>{mmss(expiresIn)}</strong>.
              </>
            ) : (
              'That code has expired — send another below.'
            )}
          </p>

          {/* Said once, then it stops nagging. */}
          {resent && !error && (
            <p className="join-ref" role="status">
              A new code is on its way. The older one no longer works.
            </p>
          )}

          {/*
            SAID OUT LOUD WHEN NOTHING WAS SENT. The server has no email
            provider configured, so the code exists and nobody has it. A code
            box that can never be satisfied, with no explanation, is the worst
            version of this screen.
          */}
          {undelivered && (
            <p className="join-error" role="alert">
              We could not send it — email is not connected on this site yet, so nothing has
              arrived and nothing is wrong with your address.
              {/*
                THE ENV VAR NAMES ARE FOR THE OPERATOR AND ONLY IN DEV.

                This paragraph used to name RESEND_API_KEY and OTP_FROM_EMAIL to
                whoever was signing up. A customer cannot act on a server
                variable, and printing internal configuration at somebody trying
                to make an account is both useless to them and a detail about
                the deployment they have no reason to be handed.
              */}
              {import.meta.env.DEV && (
                <em className="join-dev"> Set RESEND_API_KEY and OTP_FROM_EMAIL.</em>
              )}
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

          {/*
            The way out of a code that never came, and the reason this screen
            is not a dead end any more. Disabled on a cooldown rather than
            hidden — a button that vanishes reads as a bug, and one that says
            how long is a button somebody waits for.
          */}
          <button
            className="gate-later"
            type="button"
            onClick={resend}
            disabled={busy || cooldown > 0}
          >
            {cooldown > 0 ? `Send another code in ${cooldown}s` : 'Send another code'}
          </button>

          <button
            className="gate-later"
            type="button"
            onClick={() => {
              setStep('details')
              setError(null)
              setCode('')
              setResent(false)
            }}
          >
            Use a different email
          </button>
        </form>
      )}
    </AppChrome>
  )
}
