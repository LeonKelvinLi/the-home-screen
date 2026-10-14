/*
  THE TWO OUTSIDE SERVICES THE AFFILIATE ONBOARDING LEANS ON.

  Payouts: Stripe Connect (Express). Stripe's own hosted pages collect the
  affiliate's Social Security number or tax ID, date of birth, bank account
  and, when Stripe asks for it, a photo of their ID. None of it ever reaches
  this server: we keep the Stripe account id and the yes/no answers Stripe
  gives back (identity verified, tax details in, bank added, last four digits).
  That is the whole reason for the choice. Glenn asked for "Social Security #,
  checking routing and account number, a picture of their ID"; a hosted payout
  provider takes all of that, and BEASTY's database never holds it.

  Signing: DocuSeal. The affiliate agreement is a DocuSeal template with two
  roles, the affiliate and BEASTY (the countersignature). We create a
  submission, send the affiliate to their signing link, and read the outcome
  back from DocuSeal itself (webhook plus a reconcile whenever the page loads),
  never from a button the user pressed.

  Each has three modes, chosen by env and reported on boot:
    off   nothing configured: the portal says the step opens soon. Production
          default until Glenn's Stripe and DocuSeal accounts are ready.
    mock  AFFILIATE_PROVIDERS=mock, refused in production: a clearly labelled
          test flow so the whole journey can be walked and audited locally.
    live  Stripe: AFFILIATE_PAYOUTS=stripe + STRIPE_SECRET_KEY.
          DocuSeal: DOCUSEAL_API_KEY + DOCUSEAL_AFFILIATE_TEMPLATE_ID.
*/
import { randomBytes } from 'node:crypto'

export type ProviderMode = 'off' | 'mock' | 'live'
export type SigningMode = ProviderMode | 'manual'

/** Requirement-level view of a payout account. Nothing in here is sensitive. */
export interface PayoutState {
  accountRef: string
  /** 'needed' until Stripe has what it asks for; 'pending' while it checks. */
  identity: 'needed' | 'pending' | 'complete'
  tax: 'needed' | 'pending' | 'complete'
  bank: 'needed' | 'complete'
  /** Last four digits of the payout account, when Stripe returns them. */
  bankLast4: string | null
  detailsSubmitted: boolean
  payoutsEnabled: boolean
  /** Stripe's own "currently due" list, field names only (no values). */
  due: string[]
}

export interface SigningState {
  submissionRef: string
  affiliateSigned: boolean
  companySigned: boolean
  declined: boolean
  expired: boolean
  /** Short-lived links to the executed PDF, once both have signed. */
  documentUrls: string[]
}

export interface Providers {
  payouts: ProviderMode
  signing: SigningMode
  /** Create (or reuse) the payout account and return the hosted onboarding link. */
  payoutLink(input: { accountRef: string | null; email: string; returnUrl: string; refreshUrl: string; business: boolean }): Promise<{ accountRef: string; url: string }>
  payoutState(accountRef: string): Promise<PayoutState>
  /** Create the agreement submission; returns links for both signers. */
  createAgreement(input: { applicationId: string; name: string; email: string; returnUrl: string; prefill: Record<string, string> }): Promise<{ submissionRef: string; affiliateUrl: string; companyUrl: string }>
  signingState(submissionRef: string): Promise<SigningState>
}

const env = (k: string) => (process.env[k] ?? '').trim()

export function providerModes(prod: boolean): { payouts: ProviderMode; signing: SigningMode; refusedMock: boolean } {
  const wantsMock = env('AFFILIATE_PROVIDERS') === 'mock'
  const mock = wantsMock && !prod
  const payouts: ProviderMode = mock ? 'mock' : env('AFFILIATE_PAYOUTS') === 'stripe' && env('STRIPE_SECRET_KEY') ? 'live' : 'off'
  const signing: SigningMode = mock ? 'mock' : env('AFFILIATE_SIGNING') === 'manual' ? 'manual' : env('DOCUSEAL_API_KEY') && env('DOCUSEAL_AFFILIATE_TEMPLATE_ID') ? 'live' : 'off'
  return { payouts, signing, refusedMock: wantsMock && prod }
}

export class ProviderOff extends Error {
  constructor(public what: 'payouts' | 'signing') {
    super(`${what} not configured`)
  }
}

/* ---------------------------------------------------------------- mock ---- */

/* In-memory, because mock mode only ever runs locally and in audits; a restart
   resets it, which is fine for a test flow and impossible to mistake for real. */
const mockAccounts = new Map<string, { completed: boolean }>()
const mockSubmissions = new Map<string, { affiliate: boolean; company: boolean }>()

export const mockControls = {
  completePayouts(accountRef: string) {
    const a = mockAccounts.get(accountRef)
    if (!a) return false
    a.completed = true
    return true
  },
  sign(submissionRef: string, who: 'affiliate' | 'company') {
    const s = mockSubmissions.get(submissionRef)
    if (!s) return false
    s[who] = true
    return true
  },
}

/* ---------------------------------------------------------------- live ---- */

async function stripeClient() {
  const { default: Stripe } = await import('stripe')
  return new Stripe(env('STRIPE_SECRET_KEY'))
}

const docusealBase = () => (env('DOCUSEAL_URL') || 'https://api.docuseal.com').replace(/\/+$/, '')

async function docuseal<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${docusealBase()}${path}`, {
    method,
    headers: { 'X-Auth-Token': env('DOCUSEAL_API_KEY'), 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  })
  // The status only: a provider error can echo personal details back.
  if (!r.ok) throw new Error(`docuseal ${method} ${path.split('?')[0]} ${r.status}`)
  return (await r.json()) as T
}

interface DsSubmitter { id: number; submission_id: number; role: string; status: string; completed_at: string | null; declined_at?: string | null; embed_src?: string; slug?: string }
interface DsSubmission { id: number; status: string; submitters: DsSubmitter[]; documents?: { name: string; url: string }[]; expire_at?: string | null }

const AFFILIATE_ROLE = () => env('DOCUSEAL_AFFILIATE_ROLE') || 'Affiliate'
const COMPANY_ROLE = () => env('DOCUSEAL_COMPANY_ROLE') || 'BEASTY'

export function makeProviders(prod: boolean): Providers {
  const modes = providerModes(prod)
  return {
    payouts: modes.payouts,
    signing: modes.signing,

    async payoutLink({ accountRef, email, returnUrl, refreshUrl, business }) {
      if (modes.payouts === 'off') throw new ProviderOff('payouts')
      if (modes.payouts === 'mock') {
        const ref = accountRef && mockAccounts.has(accountRef) ? accountRef : `acct_test_${randomBytes(6).toString('hex')}`
        if (!mockAccounts.has(ref)) mockAccounts.set(ref, { completed: false })
        return { accountRef: ref, url: `${returnUrl.split('?')[0]}?mock=payouts` }
      }
      const stripe = await stripeClient()
      let ref = accountRef
      if (!ref) {
        const acct = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          email,
          business_type: business ? 'company' : 'individual',
          capabilities: { transfers: { requested: true } },
          metadata: { source: 'beasty-affiliate-onboarding' },
        })
        ref = acct.id
      }
      const link = await stripe.accountLinks.create({ account: ref, refresh_url: refreshUrl, return_url: returnUrl, type: 'account_onboarding' })
      return { accountRef: ref, url: link.url }
    },

    async payoutState(accountRef) {
      if (modes.payouts === 'mock') {
        const done = !!mockAccounts.get(accountRef)?.completed
        return {
          accountRef,
          identity: done ? 'complete' : 'needed',
          tax: done ? 'complete' : 'needed',
          bank: done ? 'complete' : 'needed',
          bankLast4: done ? '0000' : null,
          detailsSubmitted: done,
          payoutsEnabled: done,
          due: done ? [] : ['individual.id_number', 'external_account'],
        }
      }
      if (modes.payouts === 'off') throw new ProviderOff('payouts')
      const stripe = await stripeClient()
      const a = await stripe.accounts.retrieve(accountRef, { expand: ['external_accounts'] })
      const due = [...(a.requirements?.currently_due ?? []), ...(a.requirements?.past_due ?? [])]
      const pendingCheck = a.requirements?.pending_verification ?? []
      const has = (re: RegExp) => due.some((f) => re.test(f))
      const checking = (re: RegExp) => pendingCheck.some((f) => re.test(f))
      const idRe = /verification\.(document|additional_document)|\.dob|first_name|last_name|address/
      const taxRe = /ssn_last_4|id_number|tax_id/
      const ext = a.external_accounts?.data?.[0] as { last4?: string } | undefined
      return {
        accountRef,
        identity: has(idRe) ? 'needed' : checking(idRe) ? 'pending' : a.details_submitted ? 'complete' : 'needed',
        tax: has(taxRe) ? 'needed' : checking(taxRe) ? 'pending' : a.details_submitted ? 'complete' : 'needed',
        bank: has(/external_account/) || !ext ? 'needed' : 'complete',
        bankLast4: ext?.last4 ?? null,
        detailsSubmitted: !!a.details_submitted,
        payoutsEnabled: !!a.payouts_enabled,
        due: [...new Set(due)].slice(0, 20),
      }
    },

    async createAgreement({ applicationId, name, email, returnUrl, prefill }) {
      if (modes.signing === 'off' || modes.signing === 'manual') throw new ProviderOff('signing')
      if (modes.signing === 'mock') {
        const ref = `sub_test_${randomBytes(6).toString('hex')}`
        mockSubmissions.set(ref, { affiliate: false, company: false })
        return { submissionRef: ref, affiliateUrl: `${returnUrl.split('?')[0]}?mock=sign`, companyUrl: '' }
      }
      const templateId = Number(env('DOCUSEAL_AFFILIATE_TEMPLATE_ID'))
      // Refuse a wrong or unreadable template instead of creating a partial packet.
      const template = await docuseal<{ submitters?: { name: string; uuid: string }[]; fields?: { name: string; submitter_uuid: string }[] }>('GET', `/templates/${templateId}`)
      const affiliate = template.submitters?.find((s) => s.name === AFFILIATE_ROLE())
      const companyRole = template.submitters?.find((s) => s.name === COMPANY_ROLE())
      if (!affiliate || !companyRole || affiliate.uuid === companyRole.uuid) throw new Error('docuseal template signer roles are not configured')
      const names = new Set((template.fields ?? []).filter((f) => f.submitter_uuid === affiliate.uuid).map((f) => f.name))
      const values = Object.fromEntries(Object.entries(prefill).filter(([k, v]) => names.has(k) && v))
      const submitters = await docuseal<DsSubmitter[]>('POST', '/submissions', {
        template_id: templateId,
        send_email: false,
        order: 'preserved',
        completed_redirect_url: returnUrl,
        submitters: [
          {
            role: AFFILIATE_ROLE(),
            name,
            email,
            external_id: applicationId,
            values,
          },
          {
            role: COMPANY_ROLE(),
            name: env('DOCUSEAL_COMPANY_NAME') || 'BEASTY Pages',
            email: env('DOCUSEAL_COMPANY_EMAIL') || env('LEAD_EMAIL').split(',')[0] || 'team@beastypages.com',
            send_email: false,
          },
        ],
      })
      const mine = submitters.find((s) => s.role === AFFILIATE_ROLE())
      const company = submitters.find((s) => s.role === COMPANY_ROLE())
      if (!mine?.submission_id || !company || mine.submission_id !== company.submission_id || (!mine.embed_src && !mine.slug) || (!company.embed_src && !company.slug)) throw new Error('docuseal submission signer roles are not configured')
      return {
        submissionRef: String(mine.submission_id),
        affiliateUrl: mine.embed_src ?? `${docusealBase().replace('api.', '')}/s/${mine.slug}`,
        companyUrl: company?.embed_src ?? (company?.slug ? `${docusealBase().replace('api.', '')}/s/${company.slug}` : ''),
      }
    },

    async signingState(submissionRef) {
      if (modes.signing === 'mock') {
        const s = mockSubmissions.get(submissionRef)
        return {
          submissionRef,
          affiliateSigned: !!s?.affiliate,
          companySigned: !!s?.company,
          declined: false,
          expired: false,
          documentUrls: s?.affiliate && s?.company ? ['about:blank#test-agreement'] : [],
        }
      }
      if (modes.signing === 'off' || modes.signing === 'manual') throw new ProviderOff('signing')
      const sub = await docuseal<DsSubmission>('GET', `/submissions/${encodeURIComponent(submissionRef)}`)
      const role = (r: string) => sub.submitters.find((s) => s.role === r)
      const aff = role(AFFILIATE_ROLE())
      const co = role(COMPANY_ROLE())
      return {
        submissionRef,
        affiliateSigned: aff?.status === 'completed',
        companySigned: co?.status === 'completed',
        declined: sub.submitters.some((s) => s.status === 'declined' || !!s.declined_at),
        expired: sub.status === 'expired' || (!!sub.expire_at && Date.parse(sub.expire_at) < Date.now()),
        documentUrls: sub.status === 'completed' ? (sub.documents ?? []).map((d) => d.url) : [],
      }
    },
  }
}
