/* Free dashboard handoff. These URLs are never fetched by the BEASTY server. */

/*
  THE AFFILIATE FORMS LINK. Leon, 2026-10-26: "https://docuseal.com/d/PEgA3FohHQ4VMz also make this built in
  inside beasty for affiliates link so they get this link on their email when they want to sign up and sign
  all docs". DocuSeal's shared link for the packet template (6566603): anyone with it fills in and signs the
  whole packet, with no request made for them by hand first. DOCUSEAL_FORMS_LINK replaces it; "off" turns it
  off and puts the old flow back (BEASTY attaches a private request per applicant).
*/
const DEFAULT_FORMS_LINK = 'https://docuseal.com/d/PEgA3FohHQ4VMz'

export function formsLink(): string | null {
  const raw = (process.env.DOCUSEAL_FORMS_LINK || DEFAULT_FORMS_LINK).trim()
  if (raw === 'off') return null
  try {
    const url = new URL(raw)
    return url.origin === 'https://docuseal.com' && /^\/d\/[A-Za-z0-9_-]{6,100}$/.test(url.pathname) && !url.search ? url.href : null
  } catch {
    return null
  }
}

/** Their own copy of the link: DocuSeal opens it with their email filled in, so their submission is findable by it. */
export function formsLinkFor(email: string): string | null {
  const link = formsLink()
  if (!link) return null
  return email ? `${link}?email=${encodeURIComponent(email)}` : link
}

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
