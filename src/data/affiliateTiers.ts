import type { Perk } from './membership'

/**
 * BEASTY Affiliate Membership Tiers — what a BUSINESS pays for its spot.
 *
 * THE WORDS ARE THEIRS. Glenn wrote the three tiers on 2026-09-02 ("please
 * let me know what you think and revise it as needed"), Leon sent back a
 * reworked version within the hour, and Glenn liked it. Leon then proposed
 * $59–$69 for tier two; Glenn kept $69 on purpose — "I based the prices
 * comparable to buying popcorn at the theater. When you price tier 2 closer
 * to tier 3 it gives tier 3 more of a value" — and Leon answered "Got it".
 * So the copy is the rework and the prices are Glenn's: free, $69, $99, and
 * $6 for the icon glow.
 *
 * REVISED BY GLENN'S "BEASTY TIERS" NOTE, 2026-09-03 ("can you revise the
 * member page?"): Biggie's Member is $39 per month and BEASTY Member $69 per
 * month (+$6 for the glow), and BOTH carry the same fee schedule — a $99
 * initiation fee in the first year, a $69 annual fee in years two and three,
 * $39 a year from year four. His footnote on the annual fee: "This is a
 * maintenance fee that covers all QR code generation and icon design
 * creation for all Affiliates." That replaces the $69 / $99 figures from the
 * night before, and the per-year reading of them.
 *
 * NOTHING HERE CHARGES A CARD. The free tier begins with a reserved spot and
 * the paid tiers are arranged with the operator once the spot is confirmed;
 * the page says so under the cards. `id` is stable so a checkout can be
 * attached later without renaming anything a member has already read.
 *
 * "Biggie'sPass" in their text is the app's BIGGIE PASS and "BEASTY (gem)
 * Pass" is BEASTY PASS, so the labels use the app's spacing; the mark in the
 * middle of a name is drawn, as it is on the customer passes, never an emoji.
 */
export interface AffiliateTier {
  id: 'affiliate' | 'biggies' | 'beasty'
  n: 1 | 2 | 3
  /** Plain text, for aria and anywhere a drawn mark cannot go. */
  name: string
  nameLead: string
  nameTail: string
  mark?: 'ribbon' | 'gem'
  /** Exactly as written by him: 'Free', '$69', '$99'. */
  price: string
  priceNote?: string
  /** The sentence under the price — what this tier is for. */
  lead: string
  perks: Perk[]
}

/** The two sentences that open the business side of the Members page. */
export const AFFILIATE_INTRO = [
  'BEASTY pages is built to recognize, support, and promote small businesses in local communities.',
  'Any person or business can submit a small business to the page for its corresponding city and reserve a spot on BEASTY pages.',
]

export const AFFILIATE_TIERS: AffiliateTier[] = [
  {
    id: 'affiliate',
    n: 1,
    name: 'BEASTY Affiliate Member',
    nameLead: 'BEASTY Affiliate',
    nameTail: 'Member',
    price: 'Free',
    lead:
      'Get your business listed on its local city page at no cost. A simple way for any small business to establish a presence on BEASTY pages.',
    perks: [
      {
        label: 'Name and reserved spot on the city page',
        detail: 'Your business name and a reserved spot on the page for your city.',
      },
      {
        label: 'Business address and contact information',
        detail: 'Your business address and contact information on your page.',
      },
      { label: 'Link to the business website', detail: 'A link to your business website.' },
      { label: 'Choice of tile color', detail: 'You choose the color of your tile.' },
      {
        label: 'Business acronym displayed on the tile',
        detail: 'Your business acronym displayed on the tile.',
      },
    ],
  },
  {
    id: 'biggies',
    n: 2,
    name: "Biggie's Member",
    nameLead: "Biggie's",
    nameTail: 'Member',
    mark: 'ribbon',
    price: '$39',
    priceNote: 'per month',
    lead:
      "Includes everything in Tier 1, plus additional ways to promote your business and connect with Biggie's Pass Members.",
    perks: [
      {
        label: "Loyalty Offer for Biggie's Pass Members",
        detail:
          "Create a recurring Loyalty Offer exclusively for Biggie's Pass Members. Customers may redeem the offer repeatedly on qualifying visits. The business determines the offer, and it may be changed once per week.",
      },
      { label: 'Custom-designed icon button', detail: 'A custom-designed icon button for your tile.' },
      { label: 'Business bio', detail: 'A business bio on your page.' },
      {
        label: 'Up to three featured menu items',
        detail: 'Showcase up to three featured or favorite menu items on your page.',
      },
      { label: 'Directions button', detail: 'A directions button on your page.' },
      {
        label: 'Post business news and events',
        detail: 'Access to post business news and events on the BEASTY News and Calendar pages.',
      },
    ],
  },
  {
    id: 'beasty',
    n: 3,
    name: 'BEASTY Member',
    nameLead: 'BEASTY',
    nameTail: 'Member',
    mark: 'gem',
    price: '$69',
    priceNote: 'per month. Add $6 for the icon glow',
    lead:
      'Includes everything in Tier 2, plus BEASTY’s highest level of business-page customization and customer engagement.',
    perks: [
      {
        label: 'Welcome Offer for BEASTY Pass Members',
        detail:
          'Create an exclusive Welcome Offer for BEASTY Pass Members. Designed for a customer’s first visit, redeemable once per customer and automatically deactivated after being honored. The business determines the offer, and it may be changed once per week.',
      },
      {
        label: 'A featured video on your page',
        detail:
          'Upload a promotional or featured video to your business page and change it once per week. The video may also appear on the BEASTY Affiliate Video page.',
      },
      { label: 'Direct-call phone button', detail: 'A direct-call phone button on your page.' },
      {
        label: 'Social media links',
        detail: 'Add social media links, including Instagram, Facebook, TikTok and X.',
      },
      {
        label: 'Optional glowing icon button, +$6',
        detail: 'A glowing icon button for an additional $6.',
      },
    ],
  },
]

/**
 * The fee schedule under the two paid tiers, his note verbatim in shape:
 * initiation once, then an annual fee that steps down for staying.
 */
export const AFFILIATE_FEES = {
  head: 'Initiation and annual fees, Tier 2 and Tier 3',
  lines: [
    '$99 initiation fee in the first year',
    '$69 annual fee in years two and three',
    '$39 annual fee from year four on',
  ],
  note: 'The annual fee is a maintenance fee that covers all QR code generation and icon design creation for all Affiliates.',
}

export const AFFILIATE_CLOSE =
  'BEASTY Membership gives businesses the most complete presence on BEASTY pages, with additional tools to attract new customers, reward existing customers, and showcase what makes their business unique.'

/* Labels are rows on a phone: the customer passes are audited at 44
   characters a label, and these hold to the same line. */
for (const t of AFFILIATE_TIERS) {
  for (const p of t.perks) {
    if (p.label.length > 44) throw new Error(`${t.name}: perk label too long to sit on one line: "${p.label}"`)
  }
}
