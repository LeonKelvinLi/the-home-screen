/* Free dashboard handoff. These URLs are never fetched by the BEASTY server. */
export function approvedManualTemplate(): string | null {
  const id = (process.env.DOCUSEAL_MANUAL_TEMPLATE_ID ?? '').trim()
  return /^\d{1,15}$/.test(id) ? id : null
}

export function docusealLink(value: unknown, kind: 'signer' | 'submission'): string | null {
  if (typeof value !== 'string' || value.length > 400) return null
  try {
    const url = new URL(value.trim())
    const path = kind === 'signer' ? /^\/s\/[A-Za-z0-9_-]{10,200}$/ : /^\/submissions\/\d{1,15}$/
    if (url.origin !== 'https://docuseal.com' || url.username || url.password || url.search || url.hash || !path.test(url.pathname)) return null
    return url.href
  } catch {
    return null
  }
}

export interface ManualEvidence {
  affiliateSigned: boolean
  companySigned: boolean
  taxComplete: boolean
  bankComplete: boolean
  idUploaded: boolean
  auditReviewed: boolean
}

export function manualEvidence(raw: Record<string, unknown>): ManualEvidence | null {
  if (raw.affiliateSigned !== true || typeof raw.companySigned !== 'boolean' ||
      raw.taxComplete !== true || raw.bankComplete !== true ||
      raw.idUploaded !== true || raw.auditReviewed !== true) return null
  return { affiliateSigned: true, companySigned: raw.companySigned, taxComplete: true,
    bankComplete: true, idUploaded: true, auditReviewed: true }
}
