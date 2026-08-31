import { useEffect, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import {
  startSignUp,
  verifyCode,
  pendingReferral,
  loginChannels,
  type Account,
  type LoginChannels,
} from '../lib/account'
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
/**
 * The top of the sign-in screen.
 *
 * It was a bare form on a grey field. This is the door to the whole thing —
 * the gate sends people here from six places — so it now looks like BEASTY's
 * door and says which of the two steps you are on. Two steps with no marker
 * is the version where somebody types a code and wonders what else is coming.
 */
function JoinHead({ step }: { step: 'details' | 'code' }) {
  return (
    <div className="join-head">
      <span className="join-mark" aria-hidden="true">
        <img src="/biggie.webp" alt="" />
      </span>
      <ol className="join-steps" aria-label={`Step ${step === 'details' ? 1 : 2} of 2`}>
        <li className={step === 'details' ? 'is-on' : 'is-done'}>
          <b>1</b> Your details
        </li>
        <li className={step === 'code' ? 'is-on' : ''}>
          <b>2</b> Your code
        </li>
      </ol>
    </div>
  )
}

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
    WHICH WAY IN THIS DEPLOYMENT CAN ACTUALLY USE.

    Sign-in moved to SMS while the server had no SMS provider, so this form
    asked everyone for a phone number and nothing was ever sent — Glenn's
    nephew on 2026-08-31, and every other new sign-up since the change. Email
    was configured the whole time and the server would have used it; the form
    just never offered it. So the form asks the server first and requests
    whatever can be delivered, rather than assuming.
  */
  const [channels, setChannels] = useState<LoginChannels>({ sms: false, email: true })
  /* The channel the code ACTUALLY took, so the next screen can name the right
     destination instead of printing whichever field it felt like. */
  const [sentTo, setSentTo] = useState<'sms' | 'email'>('email')
  useEffect(() => {
    let alive = true
    loginChannels().then((c) => alive && setChannels(c))
    return () => {
      alive = false
    }
  }, [])
  /* Text if it works, otherwise mail. */
  const byText = channels.sms
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

  /*
    ENABLED ON A NUMBER, NOT AN ADDRESS. This still gated on the email regex
    after the field changed, which left the button permanently dead: nothing on
    the screen asks for an email any more, so nothing could ever satisfy it.

    The test is deliberately loose and matches the server's: ten digits, or
    eleven starting with a one, or anything with a leading plus. A stricter
    pattern here would refuse numbers the server would have accepted, and the
    customer would have no idea which part it disliked.
  */
  const digits = phone.replace(/\D/g, '')
  const phoneLooksRight =
    phone.trim().startsWith('+') ? digits.length >= 8 : digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
  /* An address good enough to be worth a round trip; the server checks it
     properly. Only the field that will actually be used is required. */
  const emailLooksRight = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
  const ready = name.trim().length >= 2 && (byText ? phoneLooksRight : emailLooksRight)

  /* The one send, called by the details form and by Resend. Both need the same
     handling of a failure, and two copies of it drift. */
  async function send(): Promise<boolean> {
    setError(null)
    const r = await startSignUp({
      name: name.trim(),
      /* Both are sent when both are filled — the server picks the channel and
         keeps the other as the member's detail. What must never happen again
         is sending only the one this form guessed at. */
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      instagram: instagram.trim() || undefined,
    })
    if (!r.ok) {
      setError(r.error)
      return false
    }
    setUndelivered(!r.delivered)
    setSentTo(r.channel)
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
    const r = await verifyCode(phone.trim(), code)
    setBusy(false)
    if (!r.ok) {
      setError(r.error)
      return
    }
    setAccount(r.account)
    onDone?.(r.account)
    api.closeApp()
  }

  /*
    THE TITLE IS THE PAGE HEADING, not a nav label — AppChrome renders it as
    iOS's 34pt large title that collapses on scroll. So this screen had two
    headlines stacked: its own and the chrome's. The chrome's carries the step
    now, which is also what iOS does when a screen changes what it is for.

    "Join BEASTY" rather than "Sign up": the screen is sign-up AND sign-in and
    the server deliberately never tells it which, so a title naming one would
    be wrong half the time. Joining covers both without leaking whether an
    address is already a member.
  */
  return (
    <AppChrome
      title={step === 'details' ? 'Sign in or join' : sentTo === 'sms' ? 'Check your texts' : 'Check your email'}
      onBack={api.closeApp}
      tint="#141416"
    >
      <JoinHead step={step} />
      {step === 'details' ? (
        <form className="join" onSubmit={askForCode}>
          <p className="join-lead">
            Free, and it opens the whole directory — every city, the reels, the gallery and search.
            <strong> Already a member? This is also how you sign in.</strong>{' '}
            {byText ? 'We text you' : 'We email you'} a six-digit code either way; there is no
            password.
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
            {/*
              WHY A SIGN-IN ASKS FOR A NAME, said rather than left to be
              wondered at. The server requires it whether or not the address is
              already a member, on purpose: when it was required only for new
              accounts, a short name came back 400 for a stranger and 202 for a
              member, and that difference was a membership oracle anybody could
              have typed addresses into. An existing member's stored name is
              never overwritten by what is typed here.
            */}
            <small className="join-hint">
              Asked of everyone. If you are already a member, yours stays as it is.
            </small>
          </label>

          {/*
            THE MOBILE NUMBER IS THE ACCOUNT — "we want only SMS", 2026-08-29.

            `autoComplete="tel"` and `inputMode="tel"` together are what make
            this one tap on a phone: iOS offers the number it knows and puts up
            the keypad rather than the alphabet.
          */}
          <label className="join-field">
            <span>
              Mobile number {!byText && <em>optional</em>}
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="(510) 555-0123"
              enterKeyHint="next"
              required={byText}
            />
            <small className="join-hint">
              {byText
                ? 'We text you a six-digit code. Standard message rates apply.'
                : 'Kept on your account. The code goes to your email.'}
            </small>
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

          {/*
            REQUIRED OR NOT DEPENDING ON WHAT CAN ACTUALLY SEND. With texting
            configured this is where a receipt goes and nothing more; without
            it, this is the way in and asking for it as an afterthought is what
            left everybody stranded on the code screen.
          */}
          <label className="join-field">
            <span>
              Email {byText && <em>optional</em>}
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              required={!byText}
            />
            {!byText && (
              <small className="join-hint">We email you a six-digit code. No password.</small>
            )}
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
            We sent a six-digit code to{' '}
            <strong>{sentTo === 'sms' ? phone.trim() : email.trim()}</strong>.{' '}
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
              {sentTo === 'sms'
                ? 'We could not send it — texting is not connected on this site yet, so nothing has arrived and nothing is wrong with your number.'
                : 'We could not send it — email is not connected on this site yet, so nothing has arrived and nothing is wrong with your address.'}
              {/*
                THE ENV VAR NAMES ARE FOR THE OPERATOR AND ONLY IN DEV.

                This paragraph used to name RESEND_API_KEY and OTP_FROM_EMAIL to
                whoever was signing up. A customer cannot act on a server
                variable, and printing internal configuration at somebody trying
                to make an account is both useless to them and a detail about
                the deployment they have no reason to be handed.
              */}
              {import.meta.env.DEV && (
                <em className="join-dev">
                  {' '}
                  {sentTo === 'sms'
                    ? 'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER.'
                    : 'Set RESEND_API_KEY and OTP_FROM_EMAIL.'}
                </em>
              )}
            </p>
          )}

          {/*
            SIX BOXES, ONE INPUT.

            Six separate inputs is the usual way and it breaks the two things
            that matter most on a phone: iOS autofill puts the whole code into
            one field, and pasting a code from the mail app does the same. So
            there is a single real input carrying autocomplete="one-time-code",
            drawn transparent, and the boxes underneath render its value. The
            keyboard, the autofill and the paste all land on the real field.
          */}
          <div className="join-otp" data-filled={code.length}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              enterKeyHint="done"
              className="join-code"
              aria-label="The six-digit code we emailed you"
              maxLength={6}
              autoFocus
              required
            />
            <div className="join-otp-boxes" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`join-otp-box${i === code.length ? ' is-next' : ''}${code[i] ? ' is-set' : ''}`}
                >
                  {code[i] ?? ''}
                </span>
              ))}
            </div>
          </div>

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
            {byText ? 'Use a different number' : 'Use a different email'}
          </button>
        </form>
      )}
    </AppChrome>
  )
}
