/** Reuse application details only. Never infer tax, bank, ID or signature data. */
export interface PrefillProfile {
  legalFirst?: string
  legalLast?: string
  kind?: string
  businessName?: string
  email?: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
}

export function onboardingPrefill(p: PrefillProfile): Record<string, string> {
  const name = `${p.legalFirst ?? ''} ${p.legalLast ?? ''}`.trim()
  return {
    'Legal Name': name,
    'ID Legal Name': name,
    'Affiliate Legal Name': p.kind === 'business' ? p.businessName ?? '' : name,
    'Taxpayer Legal Name': p.kind === 'individual' ? name : '',
    'Business Name': p.kind === 'business' ? p.businessName ?? '' : '',
    Email: p.email ?? '',
    Address: [p.line1, p.line2, p.city, `${p.state ?? ''} ${p.zip ?? ''}`.trim()].filter(Boolean).join(', '),
    'Street Address': [p.line1, p.line2].filter(Boolean).join(', '),
    'City State ZIP': [p.city, `${(p.state ?? '').toUpperCase()} ${p.zip ?? ''}`.trim()].filter(Boolean).join(', '),
    City: p.city ?? '',
    State: (p.state ?? '').toUpperCase(),
    ZIP: p.zip ?? '',
    Phone: p.phone ?? '',
  }
}
