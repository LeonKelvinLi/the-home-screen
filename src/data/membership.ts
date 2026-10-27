/**
 * BEASTY membership — the operator's own programme, in two tiers.
 *
 * EVERY NUMBER AND EVERY LINE OF COPY HERE IS HIS, quoted from the brief of
 * 2026-08-24 and revised by his marked-up screenshot of 2026-08-27. The
 * arithmetic is checked rather than trusted, because a reward that does not add
 * up is the first thing a member notices:
 *
 *   BIGGIE PASS — "up to $30 off … up to 9 friends", "$10 off per 3".
 *                 9 / 3 = 3 milestones, 3 x $10 = $30. Agrees.
 *   BEASTY PASS — "up to $40 off … up to 12 friends", "$10 off per 3".
 *                 12 / 3 = 4 milestones, 4 x $10 = $40. Agrees.
 *
 * THE $9 AND $19 ON HIS MARKUP ARE WHAT YOU PAY AFTER REFERRALS, NOT THE PRICE.
 *
 * They were read as new monthly prices once and shipped that way for a few
 * hours. His follow-up spells it out — "ONLY $9/next month when you refer 9 new
 * member sign ups" — and the arithmetic settles it either way:
 *
 *   $39 - (9 / 3) x $10 = $9    exactly the number he wrote on the BIGGIE card
 *   $59 - (12 / 3) x $10 = $19  exactly the number he wrote on the BEASTY card
 *
 * (Both prices have since moved: BIGGIE PASS to $29.99 on 23 October and BEASTY PASS to
 * $39.99 on 26 October, so a full set of referrals now makes either month free.)
 *
 * So `monthly` stays his real price and the discounted figure is DERIVED below
 * rather than typed, because two numbers that must agree and are entered twice
 * are two numbers that will disagree.
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
  /** Plain text, for anywhere a drawn mark cannot go: the account record, aria. */
  name: string
  /*
    HIS NAMES CARRY A MARK IN THE MIDDLE — a purple ribbon on one, the diamond
    on the other — so the two halves are stored either side of it. Drawn, never
    an emoji, for the same reason the diamond beside the hero always was.
  */
  nameLead: string
  nameTail: string
  mark: 'ribbon' | 'gem'
  monthly: number
  /*
    THE YEARLY PRICE, ONCE HE NAMES ONE. Leon asked for a yearly option on
    2026-09-06 ("add yearly if you can"); the number is Glenn's to give, and
    a price typed here without him is a promise made on his behalf. So the
    field exists, the screen grows a Monthly / Yearly switch the moment a
    tier carries one, and the server, Stripe setup and audit all understand
    'year' already. Nothing shows a yearly price until this is set.
  */
  yearly?: number
  /** What the member's card honours at an affiliate. */
  honours: string
  /** Ceiling on the referral discount, in dollars. */
  discountCap: number
  /** How many sign-ups reach that ceiling. */
  discountCapReferrals: number
  perks: Perk[]
}

/**
 * One thing the card gets you: a line you can read at a glance, and the whole
 * sentence underneath it.
 *
 * The perks were four long sentences stacked under a price, so the second plan
 * started below the fold and nobody compared them — which is the only reason
 * the two are next to each other. The label is what shows; the detail is one
 * tap away. Both are his words; the label is his sentence cut to its point,
 * never a new promise.
 */
export type Perk = {
  /** The line that is always visible. Short enough not to wrap on a phone. */
  label: string
  /** His full sentence, shown when the row is opened. */
  detail: string
  /** A link after the sentence, where his markup puts one. */
  link?: { label: string; href: string }
}

/** $10 off for every 3 sign-ups, and 1 raffle ticket for every 3. His numbers. */
export const PER_MILESTONE_REFERRALS = 3
export const DISCOUNT_PER_MILESTONE = 10

/*
  💎 POINTS, his rate of 2026-09-02: "3 points is basically 10% of the $39
  membership fee minus the $9 donation for the foundation." Counted from real
  referrals only, so nobody's number is invented. Shown beside each member on
  the Find friends screen (his Beli idea of 2026-10-19, "change it to something
  referring to the 💎 points"). Promotional doubling, also his idea, is not
  built: nothing here multiplies.
*/
export const POINTS_PER_REFERRAL = 3

export const TIERS: Tier[] = [
  {
    id: 'pass',
    name: 'BIGGIE PASS',
    nameLead: 'BIGGIE',
    nameTail: 'PASS',
    mark: 'ribbon',
    /* $29.99 from 2026-10-23 (Leon: "change price to $29.99 for user instead
       of 39.99"). It was Glenn's $39. The referral cap stays $30, so a member
       who refers 9 pays nothing next month rather than being owed money. */
    monthly: 29.99,
    honours: 'the Loyalty offer',
    discountCap: 30,
    discountCapReferrals: 9,
    perks: [
      {
        label: 'Unlimited Loyalty offers',
        detail:
          'Unlimited use of your membership to honour Loyalty offers from any BEASTY affiliate.',
      },
      {
        label: 'A raffle ticket per 3 referrals',
        detail:
          'One BEASTY raffle ticket for every 3 membership referrals. No limit on referrals — refer 30 and receive 10 tickets.',
      },
      {
        label: 'Tickets keep for any monthly raffle',
        detail:
          'Raffle tickets can be saved and used to enter any monthly raffle event.',
      },
    ],
  },
  {
    id: 'diamond',
    name: 'BEASTY PASS',
    nameLead: 'BEASTY',
    nameTail: 'PASS',
    mark: 'gem',
    /* $39.99 from 2026-10-26 (Glenn: "Since the membership fee is now 29 and 39"; Leon: "change
       the $59"), as BIGGIE PASS went from his $29 to $29.99. It was his $59. The referral cap stays
       $40, so a member who refers 12 pays nothing next month. */
    monthly: 39.99,
    honours: 'both the Loyalty and Welcome offers',
    discountCap: 40,
    discountCapReferrals: 12,
    perks: [
      {
        label: 'Unlimited Loyalty and Welcome offers',
        detail:
          'Unlimited use of your membership to honour both Loyalty and Welcome offers from any BEASTY affiliate.',
      },
      {
        label: 'A raffle ticket per 3 referrals',
        detail:
          'One BEASTY raffle ticket for every 3 membership referrals. No limit on referrals — refer 30 and receive 10 tickets.',
      },
      {
        label: 'Tickets keep for any monthly raffle',
        detail:
          'Raffle tickets can be saved and used to enter any monthly raffle event.',
      },

      /*
        HIS WORDS, AND THE HEDGE IS HIS TOO: "20% discount on any BEASTY Goods
        purchase from our up-and-coming website." The site does not exist yet,
        so the perk is printed as the future thing he described rather than as
        something a member can use on the day they pay.
      */
      {
        label: '20% off BEASTY Goods',
        detail:
          '20% off any BEASTY Goods purchase from the up-and-coming BEASTY website.',
      },
      /*
        HIS MARKUP OF THIS CARD, 2026-09-23: a row of its own under the last
        one, in his words, and "hey bro, can you create a link to the MAKE $
        page from the landing page so they can read the information from there
        when they press TAP HERE?" TAP HERE opens beastypages.com/money, the
        address he already shares for MAKE $, which lands on that panel.
      */
      {
        label: 'Eligible to earn money',
        detail: 'Eligible to earn extra money through our limited time BARK rewards program.',
        link: { label: 'TAP HERE', href: '/money' },
      },
    ],
  },
]

/**
 * What a member pays next month having earned the whole referral discount.
 *
 * His headline: "ONLY $9/next month when you refer 9 new member sign ups for
 * each month." Derived from the price and the cap, so it cannot drift from
 * them, and asserted below because a wrong number here is a wrong price on a
 * page that asks for money.
 */
export const fullyReferredPrice = (t: Tier) => Math.max(0, Math.round((t.monthly - t.discountCap) * 100) / 100)

/*
  A full set of referrals can now cover the whole month: at $29.99 the $30 cap
  makes 9 referrals a free month. The floor above is what stops that ever
  reading as BEASTY owing the member money; the check below keeps the floor
  honest, so a cap set far past the price is still caught.
*/
for (const t of TIERS) {
  if (t.discountCap - t.monthly >= 1) {
    throw new Error(
      `${t.name}: the referral cap ($${t.discountCap}) is a dollar or more past what a month costs ` +
        `($${t.monthly}) — fewer referrals would already make it free`,
    )
  }
}

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
  name: 'Become a Member',
  /*
    A CHARITY CLAIM, and it is the operator's to substantiate. The brief says
    proceeds go to "Biggie's Purple Ribbon Foundation*" — with an asterisk whose
    footnote was never supplied. Saying money goes to a named foundation is a
    factual statement about where a customer's payment ends up, so it is quoted
    as his words and marked as needing the detail.
  */
  /*
    THE AMOUNT IS NOW HIS TOO. "$9 from every membership activation is
    deducted for the foundation" (2026-09-02), and the same $9 sits under his
    BARK arithmetic the night before. What is still missing is the
    foundation's registration, so the flag stays for that.
  */
  charity: {
    name: "Biggie's Purple Ribbon Foundation",
    claim:
      "Proceeds from your sign-up go towards Biggie's Purple Ribbon Foundation: $9 from every membership activation.",
  },
} as const
