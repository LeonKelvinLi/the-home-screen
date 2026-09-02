/**
 * The operator's own contact details.
 *
 * FILLED IN 2026-08-25, by him, in the thread: "510-789-3205 /
 * Glennmalicdem78@gmail.com — can you put my information here?" Everything
 * that reads this switched on at the same moment, which is what the note
 * below promised. The email moved to glenn@beastypages.com on 2026-09-02.
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
  /*
    WHERE "RICHMOND, CALIFORNIA" USED TO BE. His ask, 2026-09-02: "remove
    Richmond California and replace it with 'Get in touch directly with the
    owner of beastypages.com if you have any questions, text or email is
    preferred'." His words, split at the comma so it reads as two sentences.
  */
  note:
    'Get in touch directly with the owner of beastypages.com if you have any questions. ' +
    'Text or email is preferred.',
  phone: '510-789-3205',
  /* The domain address, on his ask of 2026-09-02 ("change my email address
     to the domain one"). The mailbox exists: Leon set up the Workspace and
     Glenn has been signing in to it. */
  email: 'glenn@beastypages.com',
} as const

/** True once there is anything a customer could actually reach. */
export const hasOperatorContact = (): boolean =>
  OPERATOR.phone.trim().length > 0 || OPERATOR.email.trim().length > 0

/** `tel:` needs the digits alone; a formatted number will not dial on some Androids. */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^0-9+]/g, '')}`
