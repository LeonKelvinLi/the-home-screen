/** Provider acceptance is distinct from delivery to the recipient's inbox. */
export type EmailResult = 'accepted' | 'failed' | 'not_configured'
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export async function sendEmail(toRaw: string | undefined, subject: string, text: string, replyTo?: string): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.OTP_FROM_EMAIL
  const to = String(toRaw ?? '').split(',').map((s) => s.trim()).filter((s) => EMAIL.test(s))
  if (!key || !from || !to.length) return 'not_configured'
  /* Audits point this at a local stand-in to read what would have been sent. Never in production. */
  const endpoint = process.env.NODE_ENV !== 'production' && process.env.RESEND_API_URL ? process.env.RESEND_API_URL : 'https://api.resend.com/emails'
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text, ...(replyTo && EMAIL.test(replyTo) ? { reply_to: replyTo } : {}) }),
      signal: AbortSignal.timeout(8000),
    })
    // Never log the provider body: it can echo names, private links and addresses.
    if (!r.ok) {
      console.error('lead email failed (lead is saved):', r.status)
      return 'failed'
    }
    return 'accepted'
  } catch {
    console.error('lead email failed (lead is saved): network error')
    return 'failed'
  }
}
