/*
  SCHEDULE A — the money terms of the affiliate agreement, as an interview.

  Leon, 22 October 2026: the agreement's money terms should fill the way his
  TDS app fills the California disclosure (Noctilucenty/loqol-tds): one
  question at a time, tap for the long-but-simple fields, explain-and-talk for
  the clauses nobody can answer as written, contradictions queued for a review
  screen, then a filled PDF. docs/AFFILIATE-TERMS-FORM.md is the long form.

  Every figure here is a DEFAULT an admin edits in the CRM. They come from
  docs/AFFILIATE-PRICING.md (Glenn's thread, 29 Aug – 3 Sep 2026); Glenn's own
  draft of the terms (an iMessage of 21 Oct, 1:34 pm) has not reached the Mac,
  so nothing is treated as final. Each field says where its default came from
  and whether it was actually agreed.

  Shared by the server (validation, the PDF), the CRM (the interview and live
  previews) and tools/audit-affiliate-terms.ts. No imports, no I/O: the same
  arithmetic everywhere, so the preview can never disagree with the PDF.
*/

/* ---------------------------------------------------------------- values */

export type FoundationApplies = 'every_payment' | 'initiation_only'
export type CommissionBase = 'after_foundation' | 'full_price'
export type CommissionDuration = 'while_active' | 'first_months'
export type CapScope = 'per_city' | 'overall'
export type BonusRepeat = 'once' | 'each_time'
export type PayoutFrequency = 'monthly' | 'quarterly' | 'on_request'
export type PayoutMethod = 'direct_deposit' | 'check'

export interface Terms {
  initiationFee: number
  monthlyFee: number
  foundationAmount: number
  foundationApplies: FoundationApplies
  promoCode: string
  promoPaidMonths: number
  promoFreeMonths: number
  promoCap: number
  promoCapScope: CapScope
  commissionRate: number
  commissionBase: CommissionBase
  commissionDuration: CommissionDuration
  commissionMonths: number
  otherShareRate: number
  otherShareLabel: string
  pointsPerUser: number
  pointsPerBusiness: number
  pointValue: number
  minRedemption: number
  promoDays: boolean
  promoDayMultiplier: number
  promoDaysWhen: string
  bonusThreshold: number
  bonusMultiplier: number
  bonusRepeat: BonusRepeat
  qualifying: string
  payoutFrequency: PayoutFrequency
  payoutDays: number
  payoutMethod: PayoutMethod
  clawback: string
  /** Only ever set for one affiliate, on their CRM page. */
  specialTerms: string
}

export type TermId = keyof Terms

/** What the Members page prints today for both paid tiers (src/data/affiliateTiers.ts,
 *  AFFILIATE_FEES). The audit checks the two stay in step. */
export const PUBLISHED_INITIATION = 99

export const DEFAULT_TERMS: Terms = {
  initiationFee: 69,
  monthlyFee: 39,
  foundationAmount: 9,
  foundationApplies: 'every_payment',
  promoCode: 'FIRST48',
  promoPaidMonths: 3,
  promoFreeMonths: 9,
  promoCap: 48,
  promoCapScope: 'per_city',
  commissionRate: 10,
  commissionBase: 'after_foundation',
  commissionDuration: 'while_active',
  commissionMonths: 12,
  otherShareRate: 0,
  otherShareLabel: '',
  pointsPerUser: 3,
  pointsPerBusiness: 6,
  pointValue: 1,
  minRedemption: 100,
  promoDays: true,
  promoDayMultiplier: 3,
  promoDaysWhen: 'Slow days and holidays that BEASTY announces in the app at least 3 days ahead. Each promotion day says whether it is double (2x) or triple (3x).',
  bonusThreshold: 300,
  bonusMultiplier: 2,
  bonusRepeat: 'once',
  qualifying:
    'A referred user counts when they make a new BEASTY account with the affiliate’s code and become active (like, save or share a business, order, use their pass, or bring a friend). A referred business counts when it pays its initiation fee after opening the affiliate’s business link. The first code or link wins; nobody earns for themselves.',
  payoutFrequency: 'monthly',
  payoutDays: 15,
  payoutMethod: 'direct_deposit',
  clawback:
    'If a payment is refunded or charged back within 60 days, the points it earned are removed. If they were already paid out, they come off the next statement. A points balance never goes below zero because of this.',
  specialTerms: '',
}

/* ----------------------------------------------------------- the questions */

export type Kind = 'money' | 'percent' | 'count' | 'points' | 'multiplier' | 'choice' | 'bool' | 'text' | 'longtext'
/** Same split as the TDS: talk when the bottleneck is understanding, tap when it is entry. */
export type Lane = 'tap' | 'talk'
export type Why = 'precision' | 'enumeration' | 'gate' | 'comprehension' | 'narrative'

export const RATIONALE: Record<Why, string> = {
  precision: 'A figure. The work is getting the number exactly right, and it prints on a contract, so it is typed, never dictated.',
  enumeration: 'One of a few fixed choices. Seeing them side by side is faster than hearing them read out.',
  gate: 'A yes or no that opens or closes the questions after it. Easier to follow when you see them appear.',
  comprehension: 'The figure is easy; knowing what it means is not. It gets the plain-English version and an example first, then the contract wording.',
  narrative: 'A clause, not a number. It is easier to say what you mean and tidy the words than to fill a box, so it can be dictated.',
}

export interface Option<V extends string = string> {
  id: V
  label: string
}

export interface Chapter {
  id: string
  title: string
  blurb: string
  minutes: number
}

export const CHAPTERS: Chapter[] = [
  { id: 'prices', title: 'What a business pays', blurb: 'The two fees everything else is a share of.', minutes: 0.5 },
  { id: 'foundation', title: 'The foundation’s $9', blurb: 'What comes off the top before anyone is paid.', minutes: 1 },
  { id: 'promo', title: 'FIRST48', blurb: 'The founding-business offer.', minutes: 1 },
  { id: 'commission', title: 'Commission', blurb: 'The affiliate’s share and how long it lasts.', minutes: 1.5 },
  { id: 'bark', title: 'BARK points', blurb: 'Points per referral, what a point is worth, bonuses.', minutes: 2 },
  { id: 'payout', title: 'Getting paid', blurb: 'When and how points become money, and what undoes them.', minutes: 2.5 },
  { id: 'review', title: 'Review', blurb: 'Contradictions, open questions, the filled schedule.', minutes: 1 },
]

export interface TermField {
  id: TermId
  chapter: string
  prompt: string
  kind: Kind
  lane: Lane
  why: Why
  min?: number
  max?: number
  /** Decimal places a value may carry. */
  places?: number
  options?: Option[]
  /** "What does this mean?": plain English, then an example, then the contract wording. */
  explain: string
  example?: string
  /** The sentence that prints in Schedule A, with this field's current value. */
  legal: (t: Terms) => string
  /** Where the default came from. */
  source: string
  /** True only when the thread actually agreed it. Unsettled fields are listed at review. */
  settled: boolean
  /** May an admin change it for one affiliate on their CRM page? */
  perAffiliate: boolean
  /** Asked only when this holds. */
  shownWhen?: (t: Terms) => boolean
  /** The live line under the control: "10% of $30.00 = $3.00 per member per month". */
  preview?: (t: Terms) => string
}

/* ------------------------------------------------------------- arithmetic */

const cents = (n: number) => Math.round(n * 100) / 100

export function usd(n: number): string {
  const v = cents(n)
  const neg = v < 0
  const s = Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${neg ? '−' : ''}$${s.endsWith('.00') && Math.abs(v) >= 1000 ? s.slice(0, -3) : s}`
}
export const pctText = (n: number) => `${Number.isInteger(n) ? n : cents(n)}%`
export const ptsText = (n: number) => `${Number.isInteger(n) ? n : cents(n)} ${n === 1 ? 'point' : 'points'}`

export interface Derived {
  foundationOnMonthly: number
  foundationOnInitiation: number
  netMonthly: number
  netInitiation: number
  baseMonthly: number
  baseInitiation: number
  commissionMonthly: number
  commissionInitiation: number
  otherMonthly: number
  otherInitiation: number
  /** Commission plus the other share, as a share of what is left after the foundation. */
  sharesOfNetMonthly: number
  sharesOfNetInitiation: number
  /** Points the commission arithmetic implies, at the point value. */
  impliedPointsUser: number
  impliedPointsBusiness: number
  userReward: number
  businessReward: number
  minRedemptionValue: number
  usersToMinimum: number
  businessesToMinimum: number
  promoYearPaid: number
  promoSaving: number
  promoEffectiveMonthly: number
  promoMonths: number
  promoFoundation: number
  promoCommission: number
  listYear: number
  bonusPoints: number
  bonusValue: number
  promoDayUserReward: number
  promoDayBusinessReward: number
}

export function derive(t: Terms): Derived {
  const foundationOnMonthly = t.foundationApplies === 'every_payment' ? t.foundationAmount : 0
  const foundationOnInitiation = t.foundationAmount
  const netMonthly = cents(t.monthlyFee - foundationOnMonthly)
  const netInitiation = cents(t.initiationFee - foundationOnInitiation)
  const after = t.commissionBase === 'after_foundation'
  const baseMonthly = after ? netMonthly : t.monthlyFee
  const baseInitiation = after ? netInitiation : t.initiationFee
  const commissionMonthly = cents((baseMonthly * t.commissionRate) / 100)
  const commissionInitiation = cents((baseInitiation * t.commissionRate) / 100)
  const otherMonthly = cents((baseMonthly * t.otherShareRate) / 100)
  const otherInitiation = cents((baseInitiation * t.otherShareRate) / 100)
  const share = (paid: number, net: number) => (net > 0 ? (paid / net) * 100 : paid > 0 ? Infinity : 0)
  const promoMonths = t.promoPaidMonths + t.promoFreeMonths
  const promoYearPaid = cents(t.initiationFee + t.promoPaidMonths * t.monthlyFee)
  const paidCommissionMonths = t.commissionDuration === 'first_months' ? Math.min(t.promoPaidMonths, t.commissionMonths) : t.promoPaidMonths
  const bonusPoints = t.bonusThreshold * (t.bonusMultiplier - 1)
  return {
    foundationOnMonthly,
    foundationOnInitiation,
    netMonthly,
    netInitiation,
    baseMonthly,
    baseInitiation,
    commissionMonthly,
    commissionInitiation,
    otherMonthly,
    otherInitiation,
    sharesOfNetMonthly: share(commissionMonthly + otherMonthly, netMonthly),
    sharesOfNetInitiation: share(commissionInitiation + otherInitiation, netInitiation),
    impliedPointsUser: t.pointValue > 0 ? cents(commissionMonthly / t.pointValue) : 0,
    impliedPointsBusiness: t.pointValue > 0 ? cents(commissionInitiation / t.pointValue) : 0,
    userReward: cents(t.pointsPerUser * t.pointValue),
    businessReward: cents(t.pointsPerBusiness * t.pointValue),
    minRedemptionValue: cents(t.minRedemption * t.pointValue),
    usersToMinimum: t.pointsPerUser > 0 ? Math.ceil(t.minRedemption / t.pointsPerUser) : Infinity,
    businessesToMinimum: t.pointsPerBusiness > 0 ? Math.ceil(t.minRedemption / t.pointsPerBusiness) : Infinity,
    promoYearPaid,
    promoSaving: cents(t.promoFreeMonths * t.monthlyFee),
    promoEffectiveMonthly: promoMonths > 0 ? cents(promoYearPaid / promoMonths) : 0,
    promoMonths,
    promoFoundation: cents(foundationOnInitiation + t.promoPaidMonths * foundationOnMonthly),
    promoCommission: cents(commissionInitiation + paidCommissionMonths * commissionMonthly),
    listYear: cents(t.initiationFee + 12 * t.monthlyFee),
    bonusPoints,
    bonusValue: cents(bonusPoints * t.pointValue),
    promoDayUserReward: cents(t.pointsPerUser * t.promoDayMultiplier * t.pointValue),
    promoDayBusinessReward: cents(t.pointsPerBusiness * t.promoDayMultiplier * t.pointValue),
  }
}

const baseWords = (t: Terms) => (t.commissionBase === 'after_foundation' ? 'after the Foundation contribution' : 'of the full price')
const durationWords = (t: Terms) =>
  t.commissionDuration === 'while_active' ? 'for as long as the business keeps paying' : `for the business’s first ${t.commissionMonths} paid months`

/* ------------------------------------------------------------- the fields */

const DECIMALS = { money: 2, percent: 2, count: 0, points: 0, multiplier: 1 } as const

export const FIELDS: TermField[] = [
  {
    id: 'initiationFee',
    chapter: 'prices',
    prompt: 'Initiation fee a business pays once',
    kind: 'money',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 5000,
    explain: 'The one-time fee when a business takes a paid spot. The business-referral reward is worked out from it.',
    example: 'Glenn’s FIRST48 arithmetic: $69 initiation + 3 × $39 = $186 for the first year.',
    legal: (t) => `Each Member Business pays a one-time initiation fee of ${usd(t.initiationFee)}.`,
    source: 'FIRST48 proposal, 29 Aug. The Members page has printed a $99 initiation since 3 Sep — confirm which one the commission uses.',
    settled: false,
    perAffiliate: false,
    preview: (t) => `A full year at list: ${usd(t.initiationFee)} + 12 × ${usd(t.monthlyFee)} = ${usd(derive(t).listYear)}`,
  },
  {
    id: 'monthlyFee',
    chapter: 'prices',
    prompt: 'Membership fee per month',
    kind: 'money',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 5000,
    explain: 'What a paying business pays each month. The user-referral reward is worked out from it.',
    example: 'Nine free months save $351 only if a month is $39 — so $39 is monthly, not annual.',
    legal: (t) => `Each Member Business pays a membership fee of ${usd(t.monthlyFee)} per month.`,
    source: 'FIRST48 proposal, 29 Aug; Glenn’s BEASTY Tiers note, 3 Sep (Biggie’s Member, $39 per month).',
    settled: true,
    perAffiliate: false,
  },
  {
    id: 'foundationAmount',
    chapter: 'foundation',
    prompt: 'Amount that goes to the foundation',
    kind: 'money',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 1000,
    explain: 'Taken off the top of a payment before any share is worked out. Nobody earns commission on it.',
    example: '$39 − $9 = $30 left; 10% of $30 is $3.',
    legal: (t) => `${usd(t.foundationAmount)} of each payment is contributed to the BEASTY Foundation before any commission is calculated (the “Foundation contribution”).`,
    source: 'Glenn, 2 Sep: “$9 from every membership activation is deducted for the foundation”.',
    settled: true,
    perAffiliate: false,
    preview: (t) => {
      const d = derive(t)
      return `Left after the foundation: ${usd(d.netMonthly)} a month, ${usd(d.netInitiation)} of the initiation`
    },
  },
  {
    id: 'foundationApplies',
    chapter: 'foundation',
    prompt: 'Which payments does the $9 come out of?',
    kind: 'choice',
    lane: 'talk',
    why: 'comprehension',
    options: [
      { id: 'every_payment', label: 'Every payment — the initiation and each month' },
      { id: 'initiation_only', label: 'Only the initiation (the activation)' },
    ],
    explain:
      'Glenn wrote “every membership activation”, which could mean once, when a business joins, or every time a business pays. It decides how much is left to share each month.',
    example: 'Every payment: $9 of the $69 and $9 of each $39. Initiation only: $9 of the $69, and the full $39 each month.',
    legal: (t) =>
      t.foundationApplies === 'every_payment'
        ? 'The Foundation contribution is taken from the initiation fee and from every monthly payment.'
        : 'The Foundation contribution is taken from the initiation fee only; monthly payments carry none.',
    source: 'His words say “activation”; the arithmetic for 3 points (10% of $39 − $9) assumes every month.',
    settled: false,
    perAffiliate: false,
  },
  {
    id: 'promoCode',
    chapter: 'promo',
    prompt: 'Promo code',
    kind: 'text',
    lane: 'tap',
    why: 'precision',
    explain: 'The code a founding business types to get the offer.',
    legal: (t) => `Founding businesses that use promo code ${t.promoCode || '(none)'} receive the introductory offer below.`,
    source: 'Glenn, 29 Aug.',
    settled: true,
    perAffiliate: false,
  },
  {
    id: 'promoPaidMonths',
    chapter: 'promo',
    prompt: 'Months the business pays for up front',
    kind: 'count',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 24,
    explain: 'The paid months that unlock the free ones.',
    legal: (t) => `The business pays the initiation fee and ${t.promoPaidMonths} monthly payments`,
    source: 'Glenn, 29 Aug: “9 months free when they purchase the first 3”.',
    settled: true,
    perAffiliate: false,
    preview: (t) => `${usd(t.initiationFee)} + ${t.promoPaidMonths} × ${usd(t.monthlyFee)} = ${usd(derive(t).promoYearPaid)} paid`,
  },
  {
    id: 'promoFreeMonths',
    chapter: 'promo',
    prompt: 'Free months after that',
    kind: 'count',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 24,
    explain: 'Months the business pays nothing. Nothing is paid, so no commission and no foundation contribution is due on them.',
    legal: (t) => `and then receives ${t.promoFreeMonths} months free. No commission is earned on free months.`,
    source: 'Glenn, 29 Aug.',
    settled: true,
    perAffiliate: false,
    preview: (t) => {
      const d = derive(t)
      return `Saves ${usd(d.promoSaving)}; ${usd(d.promoYearPaid)} ÷ ${d.promoMonths} = ${usd(d.promoEffectiveMonthly)} a month`
    },
  },
  {
    id: 'promoCap',
    chapter: 'promo',
    prompt: 'How many businesses get it',
    kind: 'count',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 10000,
    explain: 'The offer closes after this many businesses.',
    legal: (t) => `The offer is limited to the first ${t.promoCap} businesses ${t.promoCapScope === 'per_city' ? 'in each city' : 'across all cities'}.`,
    source: 'Glenn, 29 Aug: “the first 48 for each city”.',
    settled: true,
    perAffiliate: false,
  },
  {
    id: 'promoCapScope',
    chapter: 'promo',
    prompt: 'Is that per city, or across all of them?',
    kind: 'choice',
    lane: 'tap',
    why: 'enumeration',
    options: [
      { id: 'per_city', label: 'Per city' },
      { id: 'overall', label: 'Across all cities' },
    ],
    explain: '“The first 48 for each city” is 48 times the number of cities.',
    legal: () => '',
    source: 'His words say per city; AFFILIATE-PRICING.md lists it as not settled.',
    settled: false,
    perAffiliate: false,
  },
  {
    id: 'commissionRate',
    chapter: 'commission',
    prompt: 'Commission rate',
    kind: 'percent',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 100,
    explain: 'The affiliate’s share of each eligible payment from someone they referred.',
    example: '10% of ($39 − $9) = $3.00 a month — the 3 BARK points.',
    legal: (t) => `The Affiliate earns ${pctText(t.commissionRate)} of each eligible payment ${baseWords(t)}, ${durationWords(t)}.`,
    source: 'Glenn, early Sep: “It was always initially 10%”.',
    settled: true,
    perAffiliate: true,
    preview: (t) => {
      const d = derive(t)
      return `${pctText(t.commissionRate)} of ${usd(d.baseMonthly)} = ${usd(d.commissionMonthly)}/member/month · ${pctText(t.commissionRate)} of ${usd(d.baseInitiation)} = ${usd(d.commissionInitiation)} per initiation`
    },
  },
  {
    id: 'commissionBase',
    chapter: 'commission',
    prompt: 'Is the percentage taken before or after the foundation’s $9?',
    kind: 'choice',
    lane: 'talk',
    why: 'comprehension',
    options: [
      { id: 'after_foundation', label: 'After — a share of what is left' },
      { id: 'full_price', label: 'Before — a share of the full price' },
    ],
    explain: 'The same 10% pays differently depending on what it is 10% of. Glenn’s own arithmetic for the BARK points takes it after the $9.',
    example: 'After: 10% of $30 = $3.00. Before: 10% of $39 = $3.90.',
    legal: () => '',
    source: 'Glenn’s arithmetic: 3 points is 10% of ($39 − $9), 6 points is 10% of ($69 − $9).',
    settled: true,
    perAffiliate: false,
    preview: (t) => {
      const d = derive(t)
      return `${pctText(t.commissionRate)} of ${usd(d.baseMonthly)} = ${usd(d.commissionMonthly)}/member/month`
    },
  },
  {
    id: 'commissionDuration',
    chapter: 'commission',
    prompt: 'How long does the affiliate keep earning on one business?',
    kind: 'choice',
    lane: 'talk',
    why: 'comprehension',
    options: [
      { id: 'while_active', label: 'As long as the business keeps paying' },
      { id: 'first_months', label: 'A set number of months' },
    ],
    explain: 'Recurring commission is the single biggest number in the programme over time. The thread never said how long it lasts.',
    example: 'At $3 a month, one business kept for three years pays the affiliate $108.',
    legal: () => '',
    source: 'Not discussed in the thread.',
    settled: false,
    perAffiliate: true,
  },
  {
    id: 'commissionMonths',
    chapter: 'commission',
    prompt: 'For how many paid months?',
    kind: 'count',
    lane: 'tap',
    why: 'precision',
    min: 1,
    max: 120,
    explain: 'Counted in months the business actually pays; free months do not count.',
    legal: () => '',
    source: 'No figure in the thread.',
    settled: false,
    perAffiliate: true,
    shownWhen: (t) => t.commissionDuration === 'first_months',
    preview: (t) => `Up to ${t.commissionMonths} × ${usd(derive(t).commissionMonthly)} = ${usd(t.commissionMonths * derive(t).commissionMonthly)} per business`,
  },
  {
    id: 'otherShareRate',
    chapter: 'commission',
    prompt: 'Anyone else paid a share of the same payment?',
    kind: 'percent',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 100,
    explain: 'A food reviewer, a recruiting partner — anyone else whose cut comes out of the same money. Leave it at 0% if there is no one.',
    example: 'Glenn on food reviews: “so then their girl makes her money from that recruitment as well”.',
    legal: (t) => (t.otherShareRate > 0 ? `A further ${pctText(t.otherShareRate)} of the same amount is paid to ${t.otherShareLabel || 'another partner'}.` : ''),
    source: 'An idea in the thread (food-review add-on); no figure.',
    settled: false,
    perAffiliate: false,
    preview: (t) => {
      const d = derive(t)
      return `All shares: ${pctText(cents(d.sharesOfNetMonthly))} of what is left after the foundation (must stay at or under 100%)`
    },
  },
  {
    id: 'otherShareLabel',
    chapter: 'commission',
    prompt: 'Who is that share for?',
    kind: 'text',
    lane: 'tap',
    why: 'precision',
    explain: 'Printed in the schedule so the affiliate knows the other share is not theirs.',
    legal: () => '',
    source: '',
    settled: false,
    perAffiliate: false,
    shownWhen: (t) => t.otherShareRate > 0,
  },
  {
    id: 'pointsPerUser',
    chapter: 'bark',
    prompt: 'Points for each referred user',
    kind: 'points',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 1000,
    explain: 'Credited when a referred user qualifies.',
    legal: (t) => `${ptsText(t.pointsPerUser)} for each qualifying referred user`,
    source: 'Careers page (MAKE $) and the BARK note, 2 Sep.',
    settled: true,
    perAffiliate: true,
    preview: (t) => {
      const d = derive(t)
      return `${ptsText(t.pointsPerUser)} × ${usd(t.pointValue)} = ${usd(d.userReward)} · commission arithmetic gives ${usd(d.commissionMonthly)}`
    },
  },
  {
    id: 'pointsPerBusiness',
    chapter: 'bark',
    prompt: 'Points for each referred business',
    kind: 'points',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 1000,
    explain: 'Credited when a referred business qualifies.',
    legal: (t) => `and ${ptsText(t.pointsPerBusiness)} for each qualifying referred business.`,
    source: 'Careers page (MAKE $) and the BARK note, 2 Sep.',
    settled: true,
    perAffiliate: true,
    preview: (t) => {
      const d = derive(t)
      return `${ptsText(t.pointsPerBusiness)} × ${usd(t.pointValue)} = ${usd(d.businessReward)} · commission arithmetic gives ${usd(d.commissionInitiation)}`
    },
  },
  {
    id: 'pointValue',
    chapter: 'bark',
    prompt: 'What one point is worth',
    kind: 'money',
    lane: 'tap',
    why: 'precision',
    min: 0.01,
    max: 100,
    explain: 'The cash value of a point when it is redeemed.',
    legal: (t) => `Each point is worth ${usd(t.pointValue)} when redeemed.`,
    source: 'Careers page: 1 point = $1.',
    settled: true,
    perAffiliate: false,
  },
  {
    id: 'minRedemption',
    chapter: 'bark',
    prompt: 'Fewest points that can be redeemed',
    kind: 'points',
    lane: 'tap',
    why: 'precision',
    min: 100,
    max: 100000,
    explain: 'Below this, points wait. The published minimum is 100, and the form will not go lower.',
    legal: (t) => `Points may be redeemed once the balance reaches ${ptsText(t.minRedemption)}.`,
    source: 'Careers page: redeemable from 100.',
    settled: true,
    perAffiliate: true,
    preview: (t) => {
      const d = derive(t)
      return `${usd(d.minRedemptionValue)} — about ${d.usersToMinimum} users or ${d.businessesToMinimum} businesses`
    },
  },
  {
    id: 'promoDays',
    chapter: 'bark',
    prompt: 'Double- and triple-point days?',
    kind: 'bool',
    lane: 'tap',
    why: 'gate',
    explain: 'Days when each referral earns a multiple of its usual points.',
    legal: (t) => (t.promoDays ? 'On promotion days announced by BEASTY, points earned are multiplied as announced, up to the maximum below.' : 'There are no promotion-day multipliers.'),
    source: 'Settled in the thread, not yet on any page.',
    settled: true,
    perAffiliate: false,
  },
  {
    id: 'promoDayMultiplier',
    chapter: 'bark',
    prompt: 'Highest multiplier on a promotion day',
    kind: 'multiplier',
    lane: 'tap',
    why: 'precision',
    min: 1,
    max: 10,
    explain: 'Double is 2, triple is 3.',
    legal: (t) => `The maximum multiplier is ${t.promoDayMultiplier}x.`,
    source: 'Thread: “double- or triple-point days”.',
    settled: true,
    perAffiliate: false,
    shownWhen: (t) => t.promoDays,
    preview: (t) => {
      const d = derive(t)
      return `At ${t.promoDayMultiplier}x: ${usd(d.promoDayUserReward)} per user, ${usd(d.promoDayBusinessReward)} per business`
    },
  },
  {
    id: 'promoDaysWhen',
    chapter: 'bark',
    prompt: 'Which days, and how does an affiliate find out?',
    kind: 'longtext',
    lane: 'talk',
    why: 'narrative',
    explain: 'The contract has to say how a promotion day is announced, or an affiliate can claim any day was one.',
    example: '“Slow Tuesdays and public holidays. We post it in the app the Friday before.”',
    legal: (t) => t.promoDaysWhen,
    source: 'Thread: “on slow days and holidays”. The wording is a draft.',
    settled: false,
    perAffiliate: false,
    shownWhen: (t) => t.promoDays,
  },
  {
    id: 'bonusThreshold',
    chapter: 'bark',
    prompt: 'Saved-points goal for the bonus',
    kind: 'points',
    lane: 'tap',
    why: 'precision',
    min: 0,
    max: 100000,
    explain: 'An affiliate who saves this many points without redeeming gets the bonus. 0 turns the bonus off.',
    legal: (t) => (t.bonusThreshold > 0 ? `An Affiliate whose unredeemed balance reaches ${ptsText(t.bonusThreshold)}` : 'There is no saved-points bonus.'),
    source: 'Glenn: “if they managed to save 300 points, we would double it”.',
    settled: true,
    perAffiliate: true,
  },
  {
    id: 'bonusMultiplier',
    chapter: 'bark',
    prompt: 'What does hitting the goal do to it?',
    kind: 'multiplier',
    lane: 'talk',
    why: 'comprehension',
    min: 1,
    max: 10,
    explain: '“Double it” means 2: the goal’s points are matched once more. It is a real cost, so the preview prints it in dollars.',
    example: 'Save 300 points ($300) and receive 300 more: $600 in all.',
    legal: (t) => (t.bonusThreshold > 0 ? `receives a further ${ptsText(t.bonusThreshold * (t.bonusMultiplier - 1))} (the balance at the goal multiplied by ${t.bonusMultiplier}).` : ''),
    source: 'Glenn, early Sep.',
    settled: true,
    perAffiliate: false,
    shownWhen: (t) => t.bonusThreshold > 0,
    preview: (t) => {
      const d = derive(t)
      return `Bonus: ${ptsText(d.bonusPoints)} = ${usd(d.bonusValue)} on top of the ${usd(t.bonusThreshold * t.pointValue)} saved`
    },
  },
  {
    id: 'bonusRepeat',
    chapter: 'bark',
    prompt: 'Once per affiliate, or every time they reach it?',
    kind: 'choice',
    lane: 'tap',
    why: 'enumeration',
    options: [
      { id: 'once', label: 'Once per affiliate' },
      { id: 'each_time', label: 'Every time the balance reaches it' },
    ],
    explain: 'Every time could pay the bonus again after each redemption.',
    legal: (t) => (t.bonusThreshold > 0 ? (t.bonusRepeat === 'once' ? 'The bonus is paid once per Affiliate.' : 'The bonus is paid each time the balance reaches the goal.') : ''),
    source: 'Not said in the thread.',
    settled: false,
    perAffiliate: false,
    shownWhen: (t) => t.bonusThreshold > 0,
  },
  {
    id: 'qualifying',
    chapter: 'payout',
    prompt: 'What counts as a qualifying referral?',
    kind: 'longtext',
    lane: 'talk',
    why: 'narrative',
    explain: 'The rule that decides whether a referral earns anything. The dashboard already has definitions for “active” and “signed” (docs/AFFILIATE.md); the draft below uses them.',
    example: '“A user counts once they have liked or saved a business. A business counts once it has paid.”',
    legal: (t) => t.qualifying,
    source: 'Draft wording from the dashboard’s definitions; not agreed.',
    settled: false,
    perAffiliate: false,
  },
  {
    id: 'payoutFrequency',
    chapter: 'payout',
    prompt: 'How often are redeemed points paid?',
    kind: 'choice',
    lane: 'tap',
    why: 'enumeration',
    options: [
      { id: 'monthly', label: 'Monthly' },
      { id: 'quarterly', label: 'Quarterly' },
      { id: 'on_request', label: 'When the affiliate asks' },
    ],
    explain: 'Glenn pays affiliates himself from the signed packet, so this is how often he sits down to do it.',
    legal: (t) =>
      t.payoutFrequency === 'on_request'
        ? `Redeemed points are paid within ${t.payoutDays} days of the Affiliate’s request`
        : `Redeemed points are paid ${t.payoutFrequency}, within ${t.payoutDays} days after the end of each ${t.payoutFrequency === 'monthly' ? 'month' : 'quarter'}`,
    source: 'Not said in the thread.',
    settled: false,
    perAffiliate: true,
  },
  {
    id: 'payoutDays',
    chapter: 'payout',
    prompt: 'Paid within how many days?',
    kind: 'count',
    lane: 'tap',
    why: 'precision',
    min: 1,
    max: 90,
    explain: 'The deadline the affiliate can hold BEASTY to.',
    legal: () => '',
    source: 'Not said in the thread.',
    settled: false,
    perAffiliate: true,
  },
  {
    id: 'payoutMethod',
    chapter: 'payout',
    prompt: 'Paid how?',
    kind: 'choice',
    lane: 'tap',
    why: 'enumeration',
    options: [
      { id: 'direct_deposit', label: 'Direct deposit to the account in the signed packet' },
      { id: 'check', label: 'Check to the address in the signed packet' },
    ],
    explain: 'The DocuSeal packet already collects a direct-deposit authorization.',
    legal: (t) => (t.payoutMethod === 'direct_deposit' ? 'by direct deposit to the account in the Affiliate’s signed authorization.' : 'by check to the address in the Affiliate’s signed forms.'),
    source: 'The packet (template 6402995) carries a direct-deposit page.',
    settled: true,
    perAffiliate: false,
  },
  {
    id: 'clawback',
    chapter: 'payout',
    prompt: 'What happens when a payment is refunded or charged back?',
    kind: 'longtext',
    lane: 'talk',
    why: 'narrative',
    explain: 'If a business gets its money back, the affiliate’s points for that payment should not stand. The clause says how they are taken back and when.',
    example: '“If they get a refund within two months, the points come off. If we already paid, it comes off next time.”',
    legal: (t) => t.clawback,
    source: 'Draft wording; not discussed.',
    settled: false,
    perAffiliate: false,
  },
]

export const FIELDS_BY_ID = Object.fromEntries(FIELDS.map((f) => [f.id, f])) as Record<TermId, TermField>

/** Per-affiliate only: never part of the standard schedule. */
export const SPECIAL_TERMS_FIELD: TermField = {
  id: 'specialTerms',
  chapter: 'payout',
  prompt: 'Anything agreed only with this affiliate',
  kind: 'longtext',
  lane: 'talk',
  why: 'narrative',
  explain: 'Printed as the last section of their Schedule A. Leave it empty if there is nothing.',
  legal: (t) => t.specialTerms,
  source: '',
  settled: true,
  perAffiliate: true,
}

export const PER_AFFILIATE: TermField[] = [...FIELDS.filter((f) => f.perAffiliate), SPECIAL_TERMS_FIELD]

export const isShown = (f: TermField, t: Terms) => !f.shownWhen || f.shownWhen(t)

/* ------------------------------------------------------------- cleaning */

/**
 * Coerce untrusted input into Terms. Unknown keys are dropped; a value of the
 * wrong type falls back to `fallback`. Range problems are NOT clamped here —
 * they are reported by fieldProblems, so the admin sees what they typed.
 */
export function cleanTerms(raw: unknown, fallback: Terms = DEFAULT_TERMS): Terms {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const out = { ...fallback } as Record<string, unknown>
  for (const f of [...FIELDS, SPECIAL_TERMS_FIELD]) {
    if (!(f.id in src)) continue
    const v = coerce(f, src[f.id])
    if (v !== undefined) out[f.id] = v
  }
  return out as unknown as Terms
}

/** One field's value, or undefined when it cannot be that field's type. */
export function coerce(f: TermField, v: unknown): Terms[TermId] | undefined {
  switch (f.kind) {
    case 'bool':
      return typeof v === 'boolean' ? v : undefined
    case 'choice':
      return typeof v === 'string' && f.options!.some((o) => o.id === v) ? (v as Terms[TermId]) : undefined
    case 'text':
      return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, 80) : undefined
    case 'longtext':
      return typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').trim().slice(0, 1200) : undefined
    default: {
      const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v.replace(/[$,%\s]/g, '')) : NaN
      return Number.isFinite(n) ? n : undefined
    }
  }
}

/** Per-field problems: ranges, decimals, empties. Keyed by field id. */
export function fieldProblems(t: Terms): Partial<Record<TermId, string>> {
  const out: Partial<Record<TermId, string>> = {}
  for (const f of FIELDS) {
    if (!isShown(f, t)) continue
    const v = t[f.id]
    if (typeof v === 'number') {
      const places = DECIMALS[f.kind as keyof typeof DECIMALS] ?? 2
      if (f.min !== undefined && v < f.min) out[f.id] = f.id === 'minRedemption' ? `At least ${f.min} points — the published minimum.` : `At least ${f.min}.`
      else if (f.max !== undefined && v > f.max) out[f.id] = `At most ${f.max}.`
      else if (Math.abs(v * 10 ** places - Math.round(v * 10 ** places)) > 1e-6) out[f.id] = places === 0 ? 'A whole number.' : `At most ${places} decimal places.`
    } else if (f.kind === 'text' && f.id === 'promoCode' && !String(v).trim()) out[f.id] = 'A code, please.'
    else if (f.kind === 'longtext' && !String(v).trim()) out[f.id] = 'The agreement needs this clause.'
  }
  return out
}

/* ------------------------------------------------------- contradictions */

export interface Rule {
  id: string
  severity: 'hard' | 'soft'
  fields: TermId[]
  /** Asked at review, in plain words, with both numbers in it. */
  prompt: (t: Terms, d: Derived) => string
  when: (t: Terms, d: Derived) => boolean
}

const near = (a: number, b: number) => Math.abs(a - b) < 0.005

export const RULES: Rule[] = [
  {
    id: 'shares_over_net',
    severity: 'hard',
    fields: ['commissionRate', 'otherShareRate', 'commissionBase', 'foundationAmount'],
    when: (_t, d) => d.sharesOfNetMonthly > 100 + 1e-9 || d.sharesOfNetInitiation > 100 + 1e-9,
    prompt: (t, d) =>
      `The shares add up to more than what is left after the foundation’s ${usd(t.foundationAmount)}: ${usd(d.commissionMonthly + d.otherMonthly)} of ${usd(d.netMonthly)} a month (${pctText(cents(d.sharesOfNetMonthly))}). BEASTY would pay out more than it keeps. Lower a rate.`,
  },
  {
    id: 'foundation_over_payment',
    severity: 'hard',
    fields: ['foundationAmount', 'monthlyFee', 'initiationFee', 'foundationApplies'],
    when: (_t, d) => d.netMonthly < 0 || d.netInitiation < 0,
    prompt: (t) =>
      `The foundation’s ${usd(t.foundationAmount)} is more than a payment it comes out of (${usd(t.foundationApplies === 'every_payment' ? Math.min(t.monthlyFee, t.initiationFee) : t.initiationFee)}). Which figure is wrong?`,
  },
  {
    id: 'user_points_over_net',
    severity: 'hard',
    fields: ['pointsPerUser', 'pointValue', 'monthlyFee'],
    when: (_t, d) => d.userReward > d.netMonthly && d.netMonthly >= 0,
    prompt: (t, d) => `${ptsText(t.pointsPerUser)} per user is ${usd(d.userReward)}, more than the ${usd(d.netMonthly)} a month BEASTY keeps after the foundation.`,
  },
  {
    id: 'business_points_over_net',
    severity: 'hard',
    fields: ['pointsPerBusiness', 'pointValue', 'initiationFee'],
    when: (_t, d) => d.businessReward > d.netInitiation && d.netInitiation >= 0,
    prompt: (t, d) => `${ptsText(t.pointsPerBusiness)} per business is ${usd(d.businessReward)}, more than the ${usd(d.netInitiation)} of the initiation BEASTY keeps after the foundation.`,
  },
  {
    id: 'user_points_vs_commission',
    severity: 'soft',
    fields: ['pointsPerUser', 'commissionRate', 'commissionBase', 'pointValue'],
    when: (_t, d) => !near(d.userReward, d.commissionMonthly),
    prompt: (t, d) =>
      `The commission arithmetic gives ${usd(d.commissionMonthly)} per user (${pctText(t.commissionRate)} of ${usd(d.baseMonthly)}), but ${ptsText(t.pointsPerUser)} pays ${usd(d.userReward)}. Glenn’s 3 points matched it exactly. Which is right?`,
  },
  {
    id: 'business_points_vs_commission',
    severity: 'soft',
    fields: ['pointsPerBusiness', 'commissionRate', 'commissionBase', 'pointValue'],
    when: (_t, d) => !near(d.businessReward, d.commissionInitiation),
    prompt: (t, d) =>
      `The commission arithmetic gives ${usd(d.commissionInitiation)} per business (${pctText(t.commissionRate)} of ${usd(d.baseInitiation)}), but ${ptsText(t.pointsPerBusiness)} pays ${usd(d.businessReward)}. Which is right?`,
  },
  {
    id: 'initiation_vs_members_page',
    severity: 'soft',
    fields: ['initiationFee'],
    when: (t) => t.initiationFee !== PUBLISHED_INITIATION,
    prompt: (t) =>
      `The Members page prints a ${usd(PUBLISHED_INITIATION)} initiation for both paid tiers (Glenn’s note of 3 Sep), and this schedule uses ${usd(t.initiationFee)} — the FIRST48 figure. Glenn’s 6 points was worked out from $69. Is the commission on ${usd(t.initiationFee)}?`,
  },
  {
    id: 'promo_not_a_year',
    severity: 'soft',
    fields: ['promoPaidMonths', 'promoFreeMonths'],
    when: (t) => t.promoPaidMonths + t.promoFreeMonths !== 12,
    prompt: (t, d) => `FIRST48 now covers ${d.promoMonths} months (${t.promoPaidMonths} paid + ${t.promoFreeMonths} free), not a year, so “${usd(d.promoEffectiveMonthly)} a month for the first year” no longer holds.`,
  },
  {
    id: 'bonus_below_minimum',
    severity: 'soft',
    fields: ['bonusThreshold', 'minRedemption'],
    when: (t) => t.bonusThreshold > 0 && t.bonusThreshold < t.minRedemption,
    prompt: (t) => `The saved-points goal (${ptsText(t.bonusThreshold)}) is below the redemption minimum (${ptsText(t.minRedemption)}), so every affiliate who can redeem has already had the bonus.`,
  },
  {
    id: 'promo_day_over_net',
    severity: 'soft',
    fields: ['promoDayMultiplier', 'pointsPerBusiness', 'pointsPerUser'],
    when: (t, d) => t.promoDays && (d.promoDayUserReward > d.netMonthly || d.promoDayBusinessReward > d.netInitiation),
    prompt: (t, d) => `On a ${t.promoDayMultiplier}x day a referral pays ${usd(d.promoDayUserReward)} per user and ${usd(d.promoDayBusinessReward)} per business — more than BEASTY keeps from that payment. Fine as a promotion, if meant.`,
  },
  {
    id: 'other_share_unnamed',
    severity: 'hard',
    fields: ['otherShareRate', 'otherShareLabel'],
    when: (t) => t.otherShareRate > 0 && !t.otherShareLabel.trim(),
    prompt: (t) => `${pctText(t.otherShareRate)} goes to someone else, but the schedule does not say who.`,
  },
]

export interface Flag {
  rule: string
  severity: 'hard' | 'soft'
  fields: TermId[]
  message: string
  /** The values the flag was raised on. A dismissal holds only while these are unchanged. */
  signature: string
}

export function signatureOf(rule: Rule, t: Terms) {
  return rule.fields.map((f) => `${f}=${JSON.stringify(t[f])}`).join('&')
}

/** Contradictions in these terms. A soft flag the admin accepted stays accepted
 *  until one of its figures changes; a hard flag cannot be accepted. */
export function flagsFor(t: Terms, acknowledged: Record<string, string> = {}): Flag[] {
  const d = derive(t)
  return RULES.filter((r) => r.when(t, d))
    .map((r) => ({ rule: r.id, severity: r.severity, fields: r.fields, message: r.prompt(t, d), signature: signatureOf(r, t) }))
    .filter((f) => f.severity === 'hard' || acknowledged[f.rule] !== f.signature)
}

export interface Check {
  problems: Partial<Record<TermId, string>>
  flags: Flag[]
  /** Hard flags or field problems: the schedule cannot be published or printed as final. */
  blocked: boolean
  unsettled: TermId[]
}

export function check(t: Terms, acknowledged: Record<string, string> = {}): Check {
  const problems = fieldProblems(t)
  const flags = flagsFor(t, acknowledged)
  return {
    problems,
    flags,
    blocked: Object.keys(problems).length > 0 || flags.some((f) => f.severity === 'hard'),
    unsettled: FIELDS.filter((f) => !f.settled && isShown(f, t)).map((f) => f.id),
  }
}

/* ------------------------------------------------- overrides per affiliate */

export type Overrides = Partial<Terms>

/** Keep only per-affiliate fields whose value actually differs from the standard. */
export function cleanOverrides(raw: unknown, standard: Terms): Overrides {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const f of PER_AFFILIATE) {
    if (!(f.id in src) || src[f.id] === null || src[f.id] === '') continue
    const v = coerce(f, src[f.id])
    if (v !== undefined && v !== standard[f.id]) out[f.id] = v
  }
  return out as Overrides
}

export const effectiveTerms = (standard: Terms, overrides: Overrides): Terms => ({ ...standard, ...overrides })

/* ---------------------------------------------------- the printed schedule */

/** A short, stable code for a set of terms, printed on every page and pasted
 *  into the DocuSeal packet, so a signed copy can be matched to its figures. */
export function termsCode(t: Terms): string {
  const canonical = JSON.stringify([...FIELDS, SPECIAL_TERMS_FIELD].map((f) => [f.id, t[f.id]]))
  let h = 0x811c9dc5
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).toUpperCase().padStart(7, '0')
}

export interface ScheduleRow {
  label: string
  value: string
  detail?: string
}

export interface ScheduleSection {
  title: string
  rows: ScheduleRow[]
  /** The clause wording, as printed. */
  text: string
}

const joinLegal = (t: Terms, ids: TermId[]) =>
  ids
    .map((id) => (FIELDS_BY_ID[id] ?? SPECIAL_TERMS_FIELD).legal(t))
    .filter(Boolean)
    .join(' ')
    .replace(/ ([,.])/g, '$1')

export function schedule(t: Terms, overrides: Overrides = {}): ScheduleSection[] {
  const d = derive(t)
  const changed = new Set(Object.keys(overrides))
  const mark = (id: TermId, v: string) => (changed.has(id) ? `${v} *` : v)
  const sections: ScheduleSection[] = [
    {
      title: 'Prices and the Foundation contribution',
      rows: [
        { label: 'Initiation fee', value: usd(t.initiationFee), detail: 'once' },
        { label: 'Membership fee', value: `${usd(t.monthlyFee)} / month` },
        {
          label: 'Foundation contribution',
          value: usd(t.foundationAmount),
          detail: t.foundationApplies === 'every_payment' ? 'from the initiation and every monthly payment' : 'from the initiation only',
        },
        { label: 'Left after the Foundation', value: `${usd(d.netMonthly)} / month`, detail: `${usd(d.netInitiation)} of the initiation` },
      ],
      text: joinLegal(t, ['initiationFee', 'monthlyFee', 'foundationAmount', 'foundationApplies']),
    },
    {
      title: `${t.promoCode || 'Introductory'} offer`,
      rows: [
        { label: 'Paid in the offer period', value: usd(d.promoYearPaid), detail: `${usd(t.initiationFee)} + ${t.promoPaidMonths} × ${usd(t.monthlyFee)}` },
        { label: 'Free months', value: String(t.promoFreeMonths), detail: `saves ${usd(d.promoSaving)}` },
        { label: 'Effective monthly', value: usd(d.promoEffectiveMonthly), detail: `over ${d.promoMonths} months` },
        { label: 'Available to', value: `first ${t.promoCap}`, detail: t.promoCapScope === 'per_city' ? 'businesses in each city' : 'businesses across all cities' },
        { label: 'Affiliate earns on one offer business', value: usd(d.promoCommission), detail: 'no commission on free months' },
      ],
      text: joinLegal(t, ['promoCode', 'promoPaidMonths', 'promoFreeMonths', 'promoCap']),
    },
    {
      title: 'Commission',
      rows: [
        { label: 'Rate', value: mark('commissionRate', pctText(t.commissionRate)), detail: baseWords(t) },
        { label: 'Per member per month', value: usd(d.commissionMonthly), detail: `${pctText(t.commissionRate)} of ${usd(d.baseMonthly)}` },
        { label: 'Per initiation', value: usd(d.commissionInitiation), detail: `${pctText(t.commissionRate)} of ${usd(d.baseInitiation)}` },
        {
          label: 'Paid for',
          value: mark(t.commissionDuration === 'first_months' ? 'commissionMonths' : 'commissionDuration', t.commissionDuration === 'while_active' ? 'while the business pays' : `${t.commissionMonths} paid months`),
        },
        ...(t.otherShareRate > 0 ? [{ label: `Share to ${t.otherShareLabel || 'another partner'}`, value: pctText(t.otherShareRate), detail: `${usd(d.otherMonthly)} / month` }] : []),
      ],
      text: joinLegal(t, ['commissionRate', 'otherShareRate']),
    },
    {
      title: 'BARK points',
      rows: [
        { label: 'Per qualifying user', value: mark('pointsPerUser', ptsText(t.pointsPerUser)), detail: usd(d.userReward) },
        { label: 'Per qualifying business', value: mark('pointsPerBusiness', ptsText(t.pointsPerBusiness)), detail: usd(d.businessReward) },
        { label: 'Value of a point', value: usd(t.pointValue) },
        { label: 'Redeemable from', value: mark('minRedemption', ptsText(t.minRedemption)), detail: usd(d.minRedemptionValue) },
        ...(t.promoDays ? [{ label: 'Promotion days', value: `up to ${t.promoDayMultiplier}x`, detail: 'as announced by BEASTY' }] : []),
        ...(t.bonusThreshold > 0
          ? [{ label: 'Saved-points bonus', value: mark('bonusThreshold', `at ${ptsText(t.bonusThreshold)}`), detail: `+${ptsText(d.bonusPoints)} (${usd(d.bonusValue)}), ${t.bonusRepeat === 'once' ? 'once' : 'each time'}` }]
          : []),
      ],
      text: joinLegal(t, ['pointsPerUser', 'pointsPerBusiness', 'pointValue', 'minRedemption', 'promoDays', 'promoDayMultiplier', 'promoDaysWhen', 'bonusThreshold', 'bonusMultiplier', 'bonusRepeat']),
    },
    {
      title: 'Qualifying referrals',
      rows: [],
      text: t.qualifying,
    },
    {
      title: 'Payment, refunds and chargebacks',
      rows: [
        { label: 'Paid', value: mark('payoutFrequency', t.payoutFrequency === 'on_request' ? 'on request' : t.payoutFrequency), detail: mark('payoutDays', `within ${t.payoutDays} days`) },
        { label: 'Method', value: t.payoutMethod === 'direct_deposit' ? 'direct deposit' : 'check' },
      ],
      text: `${joinLegal(t, ['payoutFrequency', 'payoutMethod'])} ${t.clawback}`.trim(),
    },
  ]
  if (t.specialTerms.trim()) sections.push({ title: 'Terms agreed with this Affiliate', rows: [], text: t.specialTerms })
  return sections
}

/** The whole schedule as plain text: what goes into the DocuSeal packet's
 *  sender-prepared "Schedule A" field on the free plan. */
export function scheduleText(t: Terms, opts: { version: string; code: string; overrides?: Overrides; affiliate?: string }): string {
  const lines = [`SCHEDULE A — COMMISSION AND FEE SCHEDULE (${opts.version}, code ${opts.code})`]
  if (opts.affiliate) lines.push(`Affiliate: ${opts.affiliate}`)
  schedule(t, opts.overrides).forEach((s, i) => {
    lines.push('', `${i + 1}. ${s.title.toUpperCase()}`)
    for (const r of s.rows) lines.push(`- ${r.label}: ${r.value}${r.detail ? ` (${r.detail})` : ''}`)
    if (s.text) lines.push(s.text)
  })
  if (opts.overrides && Object.keys(opts.overrides).length) lines.push('', '* Agreed for this Affiliate in place of the standard schedule.')
  return lines.join('\n')
}

/** Short values for the existing review agreement's fields
 *  (tools/build-affiliate-agreement-review.py), so they can be filled from here. */
export function agreementFields(t: Terms): Record<string, string> {
  const d = derive(t)
  return {
    'User reward': `${ptsText(t.pointsPerUser)} (${usd(d.userReward)})`,
    'Business reward': `${ptsText(t.pointsPerBusiness)} (${usd(d.businessReward)})`,
    'Reward basis': `${pctText(t.commissionRate)} of each eligible payment ${baseWords(t)}, ${durationWords(t)}. ${usd(t.foundationAmount)} Foundation contribution first.`,
    'Point value': `${usd(t.pointValue)} per point`,
    'Minimum payout': `${ptsText(t.minRedemption)} (${usd(d.minRedemptionValue)})`,
    'Payout schedule': joinLegal(t, ['payoutFrequency', 'payoutMethod']),
  }
}

/* ------------------------------------------------- the DocuSeal Schedule A */

export interface DocusealField {
  /** The field's name in the PDF and in DocuSeal. Never rename one in use. */
  name: string
  label: string
  value: (t: Terms, code: string) => string
  multiline?: boolean
}

/**
 * The Schedule A page of the DocuSeal packet (tools/build-affiliate-schedule-a.ts).
 * On the free plan these are sender fields: the template carries the standard
 * figures as defaults, and for an affiliate with their own terms the sender
 * pastes each value from the CRM before sending. DocuSeal cannot do the
 * arithmetic on the free plan, so every worked figure is its own field,
 * filled from here, never typed by hand.
 */
export const DOCUSEAL_FIELDS: DocusealField[] = [
  { name: 'Schedule A Code', label: 'Schedule A code', value: (_t, code) => code },
  { name: 'Initiation Fee', label: 'Initiation fee (once)', value: (t) => usd(t.initiationFee) },
  { name: 'Monthly Fee', label: 'Membership fee', value: (t) => `${usd(t.monthlyFee)} per month` },
  {
    name: 'Foundation Contribution',
    label: 'Foundation contribution',
    value: (t) => `${usd(t.foundationAmount)} from ${t.foundationApplies === 'every_payment' ? 'the initiation and every monthly payment' : 'the initiation only'}`,
  },
  { name: 'Commission Rate', label: 'Commission rate', value: (t) => `${pctText(t.commissionRate)} ${baseWords(t)}` },
  { name: 'Commission Term', label: 'Commission paid', value: (t) => durationWords(t) },
  {
    name: 'Commission Per Member',
    label: 'Per member per month',
    value: (t) => {
      const d = derive(t)
      return `${usd(d.commissionMonthly)} (${pctText(t.commissionRate)} of ${usd(d.baseMonthly)})`
    },
  },
  {
    name: 'Commission Per Initiation',
    label: 'Per initiation',
    value: (t) => {
      const d = derive(t)
      return `${usd(d.commissionInitiation)} (${pctText(t.commissionRate)} of ${usd(d.baseInitiation)})`
    },
  },
  {
    name: 'Promo Offer',
    label: 'Introductory offer',
    value: (t) => {
      const d = derive(t)
      return `${t.promoCode}: ${usd(t.initiationFee)} + ${t.promoPaidMonths} x ${usd(t.monthlyFee)} = ${usd(d.promoYearPaid)}, then ${t.promoFreeMonths} months free; first ${t.promoCap} ${t.promoCapScope === 'per_city' ? 'per city' : 'overall'}`
    },
  },
  { name: 'Points Per User', label: 'BARK points per qualifying user', value: (t) => `${ptsText(t.pointsPerUser)} (${usd(derive(t).userReward)})` },
  { name: 'Points Per Business', label: 'BARK points per qualifying business', value: (t) => `${ptsText(t.pointsPerBusiness)} (${usd(derive(t).businessReward)})` },
  { name: 'Point Value', label: 'Value of one point', value: (t) => usd(t.pointValue) },
  { name: 'Minimum Redemption', label: 'Redeemable from', value: (t) => `${ptsText(t.minRedemption)} (${usd(derive(t).minRedemptionValue)})` },
  { name: 'Promotion Days', label: 'Promotion days', value: (t) => (t.promoDays ? `up to ${t.promoDayMultiplier}x on days BEASTY announces` : 'none') },
  {
    name: 'Savings Bonus',
    label: 'Saved-points bonus',
    value: (t) => {
      const d = derive(t)
      return t.bonusThreshold > 0 ? `at ${ptsText(t.bonusThreshold)}: +${ptsText(d.bonusPoints)} (${usd(d.bonusValue)}), ${t.bonusRepeat === 'once' ? 'once' : 'each time'}` : 'none'
    },
  },
  { name: 'Payout Schedule', label: 'Payment', value: (t) => joinLegal(t, ['payoutFrequency', 'payoutMethod']), multiline: true },
  { name: 'Special Terms', label: 'Terms agreed with this Affiliate (if any)', value: (t) => t.specialTerms || 'None', multiline: true },
]

export function docusealValues(t: Terms): Record<string, string> {
  const code = termsCode(t)
  return Object.fromEntries(DOCUSEAL_FIELDS.map((f) => [f.name, f.value(t, code)]))
}
