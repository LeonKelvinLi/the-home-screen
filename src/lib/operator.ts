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
  /* "beastypages.com" over the old "BEASTY" — his revision of the Contacts
     page, 2026-09-19. */
  name: 'beastypages.com',
  /*
    WHERE "RICHMOND, CALIFORNIA" USED TO BE. His ask, 2026-09-02: "remove
    Richmond California and replace it with 'Get in touch directly with the
    owner of beastypages.com if you have any questions, text or email is
    preferred'." His words, split at the comma so it reads as two sentences.
  */
  /*
    "Get in touch directly with the owners for any questions. Text or email is
    preferred" — his wording in the same revision, now that there are two of
    them. The old line said "the owner of beastypages.com", which the title
    above it now says on its own.

    SPLIT IN TWO on 2026-09-21, evening: "Would you mind revising it with
    the bold & centered?" over his red markup of the card — the first
    sentence as it was, then "Text or email is preferred" in bold on a line
    of its own, centered, and with no full stop, as he wrote it.
  */
  note: 'Get in touch directly with the owners for any questions.',
  preferred: 'Text or email is preferred',
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

/** The same digits for a text. `sms:` opens the phone's own messages app. */
export const smsHref = (phone: string): string => `sms:${phone.replace(/[^0-9+]/g, '')}`

export interface Owner {
  name: string
  /** His wording, as he wrote it: "CEO/Founder", "Co-CEO/Co-Founder". */
  role: string
  /** Blank for someone not reached by phone: the row is then just the name. */
  phone: string
  /** Blank until the mailbox exists — an address that bounces is worse than none. */
  email: string
}

/*
  THE OWNERS, from his revision of the Contacts page on 2026-09-19: "CEO/Founder
  - Glenn, Co-CEO/Co-Founder - Janelle", each with a number and a domain email.
  First names only, as on the rest of the site.

  JANELLE'S EMAIL, 2026-09-22: the address she chose is
  janellenicole@beastypages.com (Glenn in the thread, 3:14 pm), and Leon made
  the mailbox in the Workspace the same afternoon, so it no longer bounces.
*/
/*
  LEON, 2026-09-22. Glenn: "I think under contacts you should include your
  information. At least an email and your title. Right below, Janelle's."
  Leon chose Co-Founder/CTO and no email for now; that evening Glenn asked to
  "flip your title? CTO/CO-FOUNDER", the role first like his own and
  Janelle's. An address goes in here when Leon has one to show.
*/
export const OWNERS: Owner[] = [
  { name: 'Glenn', role: 'CEO/Founder', phone: OPERATOR.phone, email: OPERATOR.email },
  { name: 'Janelle', role: 'Co-CEO/Co-Founder', phone: '510-674-8011', email: 'janellenicole@beastypages.com' },
  { name: 'Leon', role: 'CTO/Co-Founder', phone: '', email: '' },
]
