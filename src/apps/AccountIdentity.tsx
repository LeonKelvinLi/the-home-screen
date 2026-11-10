import { useEffect, useState } from 'react'
import { googleSignInUrl, identityStatus } from '../lib/identity'
import '../account-login.css'

export function GoogleAccountMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.614Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.837.859-3.047.859-2.344 0-4.328-1.584-5.036-3.713H.957v2.332A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A9 9 0 0 0 0 9c0 1.452.347 2.827.957 4.039l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.507.454 3.44 1.346l2.58-2.58C13.464.893 11.426 0 9 0A9 9 0 0 0 .957 4.961l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58Z"
      />
    </svg>
  )
}

export function GoogleAccountSignIn({
  returnTo = '/account',
  codeAvailable = true,
}: {
  returnTo?: string
  codeAvailable?: boolean
}) {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let current = true
    setLoading(true)
    setError('')
    identityStatus()
      .then((status) => {
        if (current) setEnabled(status.googleEnabled)
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
  }, [retry])
  return (
    <section className="beasty-google-option" aria-label="Google sign-in">
      <button
        type="button"
        className="beasty-google-button"
        disabled={!enabled || loading}
        onClick={() => window.location.assign(googleSignInUrl(returnTo))}
      >
        <GoogleAccountMark />
        Continue with Google
      </button>
      {loading ? (
        <p role="status">Checking Google sign-in…</p>
      ) : error ? (
        <p role="status">
          {error}{' '}
          <button type="button" onClick={() => setRetry((v) => v + 1)}>
            Try again
          </button>
        </p>
      ) : !enabled ? (
        <p>
          {codeAvailable
            ? 'Google sign-in is unavailable right now. You can use a code below.'
            : 'Sign-in is unavailable right now. Please try again later.'}
        </p>
      ) : (
        <p>One BEASTY account for Pages and BSTY Goods.</p>
      )}
      {codeAvailable && (
        <div className="beasty-code-divider">
          <span>or use a sign-in code</span>
        </div>
      )}
    </section>
  )
}

export function SharedAccountConnection() {
  return (
    <section className="beasty-account-connection">
      <strong>Your BEASTY account</strong>
      <p>
        Use this account on BEASTY Pages and BSTY Goods. Manage your Google connection and sign-in methods in
        one place.
      </p>
      <a href="/login?manage=1">
        Manage BEASTY account <span aria-hidden="true">↗</span>
      </a>
    </section>
  )
}
