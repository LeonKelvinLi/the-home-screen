export interface IdentityStatus {
  googleEnabled: boolean
  codeEnabled: boolean
  member: null | {
    id: string
    name: string
    email: string | null
    phone?: string | null
    city?: string
    state?: string
  }
  googleLinked: boolean
}

/** Account callbacks stay on this website, including the Goods authorization path. */
export function safeIdentityReturn(value: string | null | undefined, fallback = '/account'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value))
    return fallback
  try {
    const url = new URL(value, window.location.origin)
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : fallback
  } catch {
    return fallback
  }
}

export async function identityStatus(): Promise<IdentityStatus> {
  const response = await fetch('/api/identity/status', { credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) throw new Error('Account sign-in options could not be checked. Please try again.')
  return response.json() as Promise<IdentityStatus>
}

export function googleSignInUrl(returnTo: string, mode: 'signin' | 'link' = 'signin'): string {
  return '/api/identity/google/start?' + new URLSearchParams({ returnTo: safeIdentityReturn(returnTo), mode })
}

export function identityErrorMessage(code: string | null): string {
  if (!code) return ''
  const messages: Record<string, string> = {
    google_unavailable: 'Google sign-in is unavailable right now. You can use a sign-in code instead.',
    google_cancelled: 'Google sign-in was canceled. Try again or use a sign-in code.',
    google_state_invalid: 'That sign-in request expired or could not be verified. Please start again.',
    google_token_invalid: 'Google could not verify this sign-in. Please try again.',
    google_email_required:
      'This Google account did not share an email address. Use another account or a sign-in code.',
    google_email_not_verified:
      'This Google email is not verified. Use another Google account or a sign-in code.',
    google_link_required:
      'A BEASTY account already uses this email. Sign in with your existing code first, then choose Link Google to connect it safely.',
    google_already_linked:
      'This Google account is already connected to another BEASTY account. Sign in with that account or use your existing code.',
    google_link_signin_required: 'Sign in to your existing BEASTY account first, then choose Link Google.',
    google_link_conflict:
      'These accounts could not be connected. Your existing BEASTY account has not changed.',
    google_failed: 'Google sign-in could not be completed. Try again or use a sign-in code.',
  }
  return messages[code] || 'Sign-in could not be completed. Please try again.'
}
