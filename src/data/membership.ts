/**
 * BEASTY membership — the operator's loyalty programme.
 *
 * Every number and every line of copy here is his, quoted from the brief. The
 * arithmetic checks out and is worth stating because a discount that does not
 * add up is the first thing a member notices: $20 a month is $240 a year, 25%
 * off that is $60, and $240 - $60 is the $180 annual price.
 *
 * NOTHING HERE IS CHARGED. Card payments are not connected, so the screen shows
 * the offer and says plainly that no money moves yet. A signup flow that looks
 * like it takes payment while it cannot is worse than no flow at all.
 */

export const MEMBERSHIP = {
  name: 'BEASTY members',
  monthly: 20,
  yearly: 180,
  yearlySaving: 60,
  yearlyPercent: 25,

  /*
    "One membership, every business on this home screen" was not true and could
    not be made true by us — an offer is the business's to agree, and one has.
    "Participating" is the whole qualifier, so it has to survive the second
    sentence too.
  */
  lead:
    'One membership, good at every participating business on this home screen. ' +
    'More are being signed up.',

  benefits: [
    'Loyalty offers at every participating business.',
    'A welcome offer the first time you visit each one.',
    'Discover new places and back a growing community of small businesses.',
  ],

  /*
    A CHARITY CLAIM, and it is the operator's to substantiate.

    The brief says proceeds go to "Biggie's Purple Ribbon Foundation*" — with an
    asterisk whose footnote was never supplied. Saying money goes to a named
    foundation is a factual statement about where a customer's payment ends up,
    so it is quoted as his words and marked as needing the detail, rather than
    printed as though the app had verified it.
  */
  charity: {
    name: "Biggie's Purple Ribbon Foundation",
    claim: "Proceeds from your sign-up go towards Biggie's Purple Ribbon Foundation.",
    needsDetail: true,
  },
} as const
