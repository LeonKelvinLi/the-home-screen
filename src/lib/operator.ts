/**
 * The operator's own contact details.
 *
 * ONE source. The Phone app's contact card and the intro screen's Phone panel
 * both read this, so there is exactly one place to fill in and no way for two
 * screens to show different numbers.
 *
 * DELIBERATELY BLANK. The hub this replaced shipped `tel:+10000000000` in its
 * dock — a dead dial that looks live. A customer who taps a number and reaches
 * nobody is worse off than one who is told the line is not connected yet, so
 * every surface reads these and says so plainly rather than inventing
 * something plausible.
 *
 * TO GO LIVE: fill in `phone` and `email`. Nothing else needs touching — the
 * card, the tap-to-call, the mailto and the intro panel all switch on together
 * the moment these are non-empty.
 */
export const OPERATOR = {
  name: 'BEASTY',
  /** Richmond, California. The city is public; the street address is not. */
  city: 'Richmond, California',
  /** e.g. '(510) 555-0134' */
  phone: '',
  /** e.g. 'hello@beastyeats.com' */
  email: '',
} as const

/** True once there is anything a customer could actually reach. */
export const hasOperatorContact = (): boolean =>
  OPERATOR.phone.trim().length > 0 || OPERATOR.email.trim().length > 0

/** `tel:` needs the digits alone; a formatted number will not dial on some Androids. */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^0-9+]/g, '')}`
