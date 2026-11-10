import { useEffect, useState } from 'react'
import { JoinApp } from './JoinApp'
import { GoogleAccountMark, GoogleAccountSignIn } from './AccountIdentity'
import {
  googleSignInUrl,
  identityErrorMessage,
  identityStatus,
  safeIdentityReturn,
  type IdentityStatus,
} from '../lib/identity'
import { useGate } from '../lib/gate'
import type { ShellApi } from '../ios/Device'
import '../account-login.css'

export default function AccountLogin() {
  const { account, setAccount } = useGate()
  const [status, setStatus] = useState<IdentityStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [version, setVersion] = useState(0)
  const params = new URLSearchParams(location.search)
  const returnTo = safeIdentityReturn(params.get('returnTo'))
  const callbackCode = params.get('identityError')
  const callbackError = identityErrorMessage(callbackCode)
  const needsGoogleLink = ['google_link_required', 'google_link_signin_required'].includes(callbackCode || '')
  const member =
    status?.member ||
    (account ? { id: account.id, name: account.name, email: account.email, phone: account.phone } : null)
  useEffect(() => {
    let current = true
    setLoading(true)
    setError('')
    identityStatus()
      .then((value) => {
        if (current) setStatus(value)
      })
      .catch((cause) => {
        if (current) setError((cause as Error).message)
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
  }, [version, account?.id])
  const onDone = () => {
    if (needsGoogleLink) setVersion((v) => v + 1)
    else window.location.assign(returnTo)
  }
  const shellApi: ShellApi = {
    currentAppId: 'sys.join',
    openApp: () => {},
    closeApp: () => {},
    goToCity: () => {},
  }
  const linkReturn = '/login?' + new URLSearchParams({ manage: '1', returnTo })
  const signOut = async () => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/members/signout', { method: 'POST', credentials: 'same-origin' })
      if (!response.ok) throw new Error('You could not be signed out. Please try again.')
      setAccount(null)
      setStatus(null)
      setVersion((v) => v + 1)
    } catch (cause) {
      setError((cause as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="beasty-login-page">
      <header className="beasty-login-header">
        <a href="/" className="beasty-login-wordmark">
          BEASTY<span>PAGES</span>
        </a>
        <a href="/goods/">
          Explore BSTY Goods <span aria-hidden="true">↗</span>
        </a>
      </header>
      <div className="beasty-login-layout">
        <aside className="beasty-login-story">
          <img src="/biggie.webp" alt="BEASTY" />
          <span className="beasty-login-eyebrow">BEASTY Pages + BSTY Goods</span>
          <h1>
            One account.
            <br /> More of
            <br /> your community.
          </h1>
          <p>
            Discover local businesses on Pages. Find your next good exchange on Goods. Use the same BEASTY
            account across both websites.
          </p>
          <a href="/">
            Back to BEASTY Pages <span aria-hidden="true">↗</span>
          </a>
        </aside>
        <section className="beasty-login-card">
          <span className="beasty-login-eyebrow">Your BEASTY account</span>
          <h2>{member ? 'You’re signed in.' : 'Sign in or join.'}</h2>
          <p className="beasty-login-lead">
            {member
              ? 'Your shared identity connects Pages and Goods. Marketplace details, inventory and trades are managed in Goods.'
              : 'Continue with Google or use your existing BEASTY sign-in code. A new Google sign-in creates a free BEASTY account.'}
          </p>
          {callbackError && (
            <p className="beasty-login-error" role="alert">
              {callbackError}
            </p>
          )}
          {error && (
            <div className="beasty-login-error" role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => setVersion((v) => v + 1)}>
                Try again
              </button>
            </div>
          )}
          {loading && !member ? (
            <p className="beasty-login-loading" role="status">
              Checking your account…
            </p>
          ) : member ? (
            <div className="beasty-account-summary">
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{member.name}</dd>
                </div>
                {member.email && (
                  <div>
                    <dt>Email</dt>
                    <dd>{member.email}</dd>
                  </div>
                )}
                {member.phone && (
                  <div>
                    <dt>Phone</dt>
                    <dd>{member.phone}</dd>
                  </div>
                )}
              </dl>
              <section className="beasty-google-connection">
                <strong>Google sign-in</strong>
                {status?.googleLinked ? (
                  <p className="beasty-connected">✓ Google is connected to this BEASTY account.</p>
                ) : (
                  <>
                    <p>
                      Link Google while signed in to connect it to this account. Existing accounts are not
                      combined just because they use the same email.
                    </p>
                    <button
                      type="button"
                      className="beasty-google-button"
                      disabled={!status?.googleEnabled || loading}
                      onClick={() => window.location.assign(googleSignInUrl(linkReturn, 'link'))}
                    >
                      <GoogleAccountMark />
                      Link Google
                    </button>
                    {!loading && !status?.googleEnabled && (
                      <p>Google account linking is unavailable right now.</p>
                    )}
                  </>
                )}
              </section>
              <a className="beasty-account-continue" href={returnTo}>
                {returnTo.startsWith('/api/identity/authorize')
                  ? 'Continue to BSTY Goods'
                  : returnTo.startsWith('/goods')
                    ? 'Continue to Goods'
                    : 'Continue to BEASTY Pages'}{' '}
                <span aria-hidden="true">→</span>
              </a>
              <div className="beasty-account-links">
                <a href="/account">Open your Pages profile</a>
                <a href="/goods/settings">Goods account settings</a>
              </div>
              <button
                className="beasty-account-signout"
                type="button"
                disabled={busy}
                onClick={() => void signOut()}
              >
                {busy ? 'Signing out…' : 'Sign out of BEASTY Pages'}
              </button>
              <p className="beasty-session-note">
                Signing out here ends your Pages session. Your Goods session is managed in Goods.
              </p>
            </div>
          ) : status ? (
            <>
              <GoogleAccountSignIn returnTo={returnTo} codeAvailable={status.codeEnabled} />
              {status.codeEnabled ? (
                <JoinApp api={shellApi} onDone={onDone} standalone hideGoogle returnTo={returnTo} />
              ) : (
                <p className="beasty-login-unavailable">
                  Sign-in codes are unavailable right now.
                  {status.googleEnabled ? ' You can continue with Google above.' : ' Please try again later.'}
                </p>
              )}
            </>
          ) : null}
        </section>
      </div>
      <footer className="beasty-login-footer">
        BEASTY · Local businesses. Good people. Better exchanges.
      </footer>
    </main>
  )
}
