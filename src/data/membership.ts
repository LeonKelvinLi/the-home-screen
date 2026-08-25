/**
 * BEASTY membership — the operator's own programme, in two tiers.
 *
 * EVERY NUMBER AND EVERY LINE OF COPY HERE IS HIS, quoted from the brief of
 * 2026-08-24. The arithmetic is checked rather than trusted, because a reward
 * that does not add up is the first thing a member notices:
 *
 *   Biggie's PASS  — "up to $30 off … up to 9 friends", "$10 off per 3".
 *                    9 / 3 = 3 milestones, 3 x $10 = $30. Agrees.
 *   BEASTY DIAMOND — "up to $40 off … up to 12 friends", "$10 off per 3".
 *                    12 / 3 = 4 milestones, 4 x $10 = $40. Agrees.
 *
 * THE DISCOUNT IS CAPPED AND THE RAFFLE TICKETS ARE NOT, and that distinction
 * is the whole reason both are computed separately from one referral count. His
 * words: "There is no limit on referrals. (Example: refer 30 newly signed
 * members and receive 10 Raffle tickets.)" — 30 / 3 = 10, uncapped, while the
 * money stops at 9 or 12 referrals.
 *
 * NOTHING HERE CHARGES A CARD. A tier is a choice recorded against a member;
 * `tier_status` on the server stays 'pending' until a payment provider says
 * otherwise. A signup flow that looks like it takes payment while it cannot is
 * worse than no flow at all.
 */

export interface Tier {
  id: 'pass' | 'diamond'
  name: string
  monthly: number
  /** What the member's card honours at an affiliate. */
  honours: string
  /** Ceiling on the referral discount, in dollars. */
  discountCap: number
  /** How many sign-ups reach that ceiling. */
  discountCapReferrals: number
  perks: string[]
}

/** $10 off for every 3 sign-ups, and 1 raffle ticket for every 3. His numbers. */
export const PER_MILESTONE_REFERRALS = 3
export const DISCOUNT_PER_MILESTONE = 10

export const TIERS: Tier[] = [
  {
    id: 'pass',
    name: "Biggie's PASS",
    monthly: 39,
    honours: "Biggie's PASS offer",
    discountCap: 30,
    discountCapReferrals: 9,
    perks: [
      "Unlimited use of your membership to honour Biggie's PASS offers from any BEASTY affiliate.",
      'One BEASTY raffle ticket for every 3 membership referrals. No limit on referrals — refer 30 and receive 10 tickets.',
      'Raffle tickets can be saved and used to enter any monthly raffle event.',
    ],
  },
  {
    id: 'diamond',
    name: 'BEASTY DIAMOND PASS',
    monthly: 59,
    honours: "both the DIAMOND and Biggie's PASS offers",
    discountCap: 40,
    discountCapReferrals: 12,
    perks: [
      'Unlimited use of your membership to honour both DIAMOND and PASS offers from any BEASTY affiliate.',
      'One BEASTY raffle ticket for every 3 membership referrals. No limit on referrals — refer 30 and receive 10 tickets.',
      'Raffle tickets can be saved and used to enter any monthly raffle event.',
      /*
        HIS WORDS, AND THE HEDGE IS HIS TOO: "20% discount on any BEASTY Goods
        purchase from our up-and-coming website." The site does not exist yet,
        so the perk is printed as the future thing he described rather than as
        something a member can use on the day they pay.
      */
      '20% off any BEASTY Goods purchase from the up-and-coming BEASTY website.',
    ],
  },
]

export const tierById = (id: string): Tier | undefined => TIERS.find((t) => t.id === id)

/**
 * What a member has earned from `referrals` sign-ups, on a given tier.
 *
 * One function so the badge on the profile, the line on the membership screen
 * and the server all answer the same way. Two of those disagreeing about
 * somebody's money is the kind of bug that gets noticed from the outside.
 */
export function rewardsFor(referrals: number, tier: Tier | undefined) {
  const milestones = Math.floor(Math.max(0, referrals) / PER_MILESTONE_REFERRALS)
  // Tickets are uncapped by his instruction; only the money stops.
  const raffleTickets = milestones
  const uncappedDiscount = milestones * DISCOUNT_PER_MILESTONE
  const discount = tier ? Math.min(uncappedDiscount, tier.discountCap) : 0
  return {
    milestones,
    raffleTickets,
    discount,
    /** Referrals still needed for the next ticket. */
    toNextTicket: PER_MILESTONE_REFERRALS - (Math.max(0, referrals) % PER_MILESTONE_REFERRALS),
    discountCapped: !!tier && uncappedDiscount > tier.discountCap,
  }
}

/**
 * WHAT A SIGNED-OUT VISITOR MAY SEE, from his "New Users" note.
 *
 * "They are free to explore any Affiliate's page on the 1st - 48; BEASTY GOODS
 * & BEASTY SERVICES. But when they tap the right arrow to view more city's or
 * the video reel tab, gallery tab, 1, 2, 3 or any of them lower 4 buttons or
 * the search bar, a quick prompt will pop up to direct them to the sign up
 * page."
 *
 * Listed here rather than checked at each button, so that the gate and the
 * prompt copy can never disagree about what is behind it.
 */
export const GATED = {
  cities: 'See every city',
  watch: 'Watch the reels',
  gallery: "Open Biggie's gallery",
  dock: 'Switch the dock',
  search: 'Search the directory',
  profile: 'Open your profile',
} as const

export type GateKey = keyof typeof GATED

export const MEMBERSHIP = {
  name: 'BEASTY members',
  lead:
    'One membership, honoured at every participating BEASTY affiliate. ' +
    'Sign up free to explore the whole directory.',
  /*
    A CHARITY CLAIM, and it is the operator's to substantiate. The brief says
    proceeds go to "Biggie's Purple Ribbon Foundation*" — with an asterisk whose
    footnote was never supplied. Saying money goes to a named foundation is a
    factual statement about where a customer's payment ends up, so it is quoted
    as his words and marked as needing the detail.
  */
  charity: {
    name: "Biggie's Purple Ribbon Foundation",
    claim: "Proceeds from your sign-up go towards Biggie's Purple Ribbon Foundation.",
    needsDetail: true,
  },
} as const
