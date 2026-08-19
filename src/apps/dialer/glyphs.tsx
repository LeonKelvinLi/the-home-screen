import { Diamond, PurpleRibbon } from './marks'
import type { MarkName, PanelPage } from './keys'

/**
 * The marks that head each panel the keypad opens.
 *
 * Two of them the operator specified by picture — the purple ribbon and the
 * diamond — and those live in marks.tsx, drawn in his colours. The rest are
 * monochrome and take the panel's own ink, so they sit on the frosted white
 * card without fighting it.
 *
 * All original artwork. The references he sent are licensed stock off image
 * sites and are not shipped or traced; these draw the same objects.
 */

interface MarkProps {
  size?: number
}

/**
 * About — Biggie, sitting in profile.
 *
 * A memorial, so: dignified, no cartoon eyes, one small cut-out for the eye.
 * Drawn against 26px renders rather than in the abstract — an earlier pass read
 * as a chess knight until the head came down and the tail lump came off.
 */
export function DogMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M2.4 10.4C2.5 8.2 4 6 7.3 4.9L9.2 2.4 10.8 5.6C11.6 6.2 12.2 7.2 12.6 8.4 14.4 9.2 16.6 9.4 18.4 10.4 19.8 11.2 20.6 12.8 20.8 14.6 21 16.8 20.6 19.2 20.4 20.4L12.4 20.4 11.5 17.6 10.6 20.4 6 20.4C6 18.4 6.6 15.4 7.4 13.8 7.9 12.4 8.3 11.6 8.8 11 7.4 11.2 6 11.1 5.2 10.9 4.2 10.8 3.2 10.7 2.4 10.4ZM7.4 7.4A.8.8 0 1 0 5.8 7.4.8.8 0 0 0 7.4 7.4Z"
      />
    </svg>
  )
}

/** Contacts — a Bell handset, mouthpiece low-left. */
export function PhoneMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path
        transform="translate(.5 .75) rotate(-35 12 12)"
        d="M5.4 6.6H18.6C19.8 6.6 20.6 7.4 20.6 8.6V13.2C20.6 14.6 19.5 15.6 18.1 15.6H16.5C15.1 15.6 14 14.6 14 13.2V11.4C14 10.9 13.6 10.5 13.1 10.5H10.9C10.4 10.5 10 10.9 10 11.4V13.2C10 14.6 8.9 15.6 7.5 15.6H5.9C4.5 15.6 3.4 14.6 3.4 13.2V8.6C3.4 7.4 4.2 6.6 5.4 6.6Z"
      />
    </svg>
  )
}

/**
 * Collabs — two links of a chain, interlocking.
 *
 * NOT a handshake. Two hands is the obvious drawing and it does not survive
 * 22px: fingers become noise and the silhouette turns into a blob, which is
 * exactly what the first two attempts at this produced. Interlocking rings hold
 * their shape at any size and say the same thing.
 */
export function CollabsMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M9.3 4.4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <path d="M14.7 7.4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  )
}

/**
 * Reviews — a speech bubble with a quote inside it.
 *
 * The tab it sits on used to be Voicemail; the operator wants it to carry what
 * customers say. A bubble is the one shape that reads as "somebody said this"
 * without needing a face or a star rating.
 */
export function ReviewsMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M3.4 3.2h17.2a2 2 0 0 1 2 2v10.2a2 2 0 0 1-2 2h-7.9l-4.6 3.6a.8.8 0 0 1-1.3-.65V17.4H3.4a2 2 0 0 1-2-2V5.2a2 2 0 0 1 2-2Zm3.5 4.4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm5.1 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm5.1 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  )
}

/**
 * The way in, once the screen stops pretending to be a phone.
 *
 * The green button keeps its position and its colour, but a handset means
 * "call" and this button enters an app. Drawn to the operator's reference: a
 * rounded doorway open on its left side, and a thick arrow going through the
 * gap. Heavier strokes than the first version, which read as thin at the size
 * it is actually used.
 */
export function EnterMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      {/* The doorway: a rounded square with its left wall cut away, so the
          arrow has somewhere to enter. */}
      <path d="M12.9 1.7h5.6a3.8 3.8 0 0 1 3.8 3.8v13a3.8 3.8 0 0 1-3.8 3.8h-5.6a1.55 1.55 0 0 1 0-3.1h5.2a1.3 1.3 0 0 0 1.3-1.3V6.1a1.3 1.3 0 0 0-1.3-1.3h-5.2a1.55 1.55 0 0 1 0-3.1Z" />
      {/* The arrow. */}
      <path d="M10.55 5.9a1.55 1.55 0 0 1 2.2 0l5 5a1.55 1.55 0 0 1 0 2.2l-5 5a1.55 1.55 0 1 1-2.2-2.2l2.35-2.35H3.3a1.55 1.55 0 0 1 0-3.1h9.6L10.55 8.1a1.55 1.55 0 0 1 0-2.2Z" />
    </svg>
  )
}

/** Donations — a heart cupped in an open hand. */
export function DonateMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M12 15.2C12 15.2 6.6 11.2 6.6 8 6.6 6.2 8 5 9.6 5 10.8 5 11.6 5.8 12 6.6 12.4 5.8 13.2 5 14.4 5 16 5 17.4 6.2 17.4 8 17.4 11.2 12 15.2 12 15.2Z" />
      <path d="M2.6 13A1.6 1.6 0 0 1 5.8 13C5.8 16.2 8.6 18.4 12 18.4 15.4 18.4 18.2 16.2 18.2 13A1.6 1.6 0 0 1 21.4 13C21.4 18 17.2 21.6 12 21.6 6.8 21.6 2.6 18 2.6 13Z" />
    </svg>
  )
}

/** Careers — three rising bars with a pennant on the tallest. */
export function CareersMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M3.8 15.6H6C6.7 15.6 7.2 16.1 7.2 16.8V21.6H2.6V16.8C2.6 16.1 3.1 15.6 3.8 15.6Z" />
      <path d="M9.9 11.8H12.1C12.8 11.8 13.3 12.3 13.3 13V21.6H8.7V13C8.7 12.3 9.2 11.8 9.9 11.8Z" />
      <path d="M15.9 2.4H17.3V9H15.9Z" />
      <path d="M17.3 2.9 21.4 4.7 17.3 6.5Z" />
      <path d="M16 8H18.2C18.9 8 19.4 8.5 19.4 9.2V21.6H14.8V9.2C14.8 8.5 15.3 8 16 8Z" />
    </svg>
  )
}

/**
 * Which mark heads which panel.
 *
 * A map rather than a switch so the panel component stays generic — adding a
 * page is a line here and a line in copy.ts, and nothing else changes.
 */
/** Favorites — the same star the tab carries, solid and slightly squat. */
export function StarMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M12 2.4 15 8.9l7.1.85-5.25 4.85 1.4 7-6.25-3.5-6.25 3.5 1.4-7L1.9 9.75 9 8.9Z" />
    </svg>
  )
}

/** Supply — a stacked crate, for the goods side rather than the kitchens. */
export function SupplyMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M2.6 7.4 12 3.1l9.4 4.3v9.2L12 20.9 2.6 16.6Zm9.4 2.2 5.9-2.7L12 4.5 6.1 6.9Zm1.2 2.1v6.6l6-2.7V9Zm-2.4 0L4.8 9v6.6l6 2.7Z" />
    </svg>
  )
}

/** Recent — a clock, matching the tab it heads. */
export function ClockMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M12 1.4a10.6 10.6 0 1 1 0 21.2 10.6 10.6 0 0 1 0-21.2Zm0 3a7.6 7.6 0 1 0 0 15.2 7.6 7.6 0 0 0 0-15.2Z" />
      <path d="M10.9 6.3a1.1 1.1 0 0 1 2.2 0v5.2l3.4 2a1.1 1.1 0 0 1-1.1 1.9l-4-2.3a1.1 1.1 0 0 1-.5-1Z" />
    </svg>
  )
}

/** Scan — a camera with the framing corners that say "point this at a code". */
export function CameraMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M9.1 2.6h5.8a2 2 0 0 1 1.7 1l.8 1.3h3.2a2.8 2.8 0 0 1 2.8 2.8v10a2.8 2.8 0 0 1-2.8 2.8H3.4a2.8 2.8 0 0 1-2.8-2.8v-10a2.8 2.8 0 0 1 2.8-2.8h3.2l.8-1.3a2 2 0 0 1 1.7-1Zm2.9 5.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Z" />
    </svg>
  )
}

/*
  ────────────────────────────────────────────────────────────────────────────
  KEY MARKS — the twelve that fill the keypad circles once the phone stops
  pretending to be a phone.

  Same rule as everything above: he sent stock references off freepik, pluspng,
  vecteezy and icons8 for what each one should DEPICT. None is shipped or
  traced. These draw the same objects in the language the rest of this file
  already speaks — one weight, one 24px box, filled paths that survive being
  rendered at 26px inside a circle.
*/

/** About — the universal i, because that is the one he sent. */
export function InfoMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M12 1.6a10.4 10.4 0 1 0 0 20.8 10.4 10.4 0 0 0 0-20.8Zm0 2.4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z" />
      <circle cx="12" cy="7.4" r="1.5" />
      <path d="M10.6 10.4h2.8v7.2h-2.8z" />
    </svg>
  )
}

/** Instagram — the rounded square, lens and flash. */
export function InstagramMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M7.6 2.4h8.8A5.2 5.2 0 0 1 21.6 7.6v8.8a5.2 5.2 0 0 1-5.2 5.2H7.6a5.2 5.2 0 0 1-5.2-5.2V7.6A5.2 5.2 0 0 1 7.6 2.4Zm0 2.4A2.8 2.8 0 0 0 4.8 7.6v8.8a2.8 2.8 0 0 0 2.8 2.8h8.8a2.8 2.8 0 0 0 2.8-2.8V7.6a2.8 2.8 0 0 0-2.8-2.8Z" />
      <path d="M12 6.9a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 2.4a2.7 2.7 0 1 1 0 5.4 2.7 2.7 0 0 1 0-5.4Z" />
      <circle cx="17.3" cy="6.7" r="1.25" />
    </svg>
  )
}

/** Water — a droplet. His own H20 mark puts the dog inside one; at 26px the dog
    is mud, so the key takes the droplet alone and the tile keeps the dog. */
export function DropletMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M12 2.2c3.6 4.2 6.6 7.9 6.6 11.4A6.6 6.6 0 0 1 5.4 13.6C5.4 10.1 8.4 6.4 12 2.2Z" />
    </svg>
  )
}

/** Services — a screen with a pencil, which is what BEASTY Designs sells. */
export function DesignMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M2.6 4.2h14.2v2.4H5v8.2h11.8v2.4H2.6Z" />
      <path d="M6.8 8.4h7.4v1.7H6.8zm0 3.2h5.2v1.7H6.8z" />
      <path d="M19.4 5.2l2.2 1.6-.9 1.3-2.2-1.6zM18 7.4l2.2 1.6-3.6 5-2.6.9.5-2.7z" />
    </svg>
  )
}

/** Share — a box with an arrow leaving it. */
export function ShareMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" fillRule="evenodd">
      <path d="M3.6 9.2h4.2v2.4H6v8h12v-8h-1.8V9.2h4.2v12.8H3.6Z" />
      <path d="M12 1.6l5.2 5.2-1.7 1.7-2.3-2.3v9.2h-2.4V6.2L8.5 8.5 6.8 6.8Z" />
    </svg>
  )
}

/** Sign in — a person, distinct from the ENTER arrow on the green button. */
export function SignInMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="7.6" r="4.2" />
      <path d="M12 13.4c4.4 0 7.8 2.6 7.8 5.9v1.3H4.2v-1.3c0-3.3 3.4-5.9 7.8-5.9Z" />
    </svg>
  )
}

export const PANEL_MARKS: Record<PanelPage, (props: MarkProps) => JSX.Element> = {
  favorites: StarMark,
  supply: SupplyMark,
  recent: ClockMark,
  camera: CameraMark,
  about: DogMark,
  contacts: PhoneMark,
  bprf: PurpleRibbon,
  collabs: CollabsMark,
  donations: DonateMark,
  careers: CareersMark,
  reviews: ReviewsMark,
}

export { Diamond, PurpleRibbon }

/**
 * The twelve key marks, by name. Keyed off DialerKey.mark so keys.ts can stay
 * data and never import artwork.
 */
export const KEY_MARKS: Record<MarkName, (props: MarkProps) => JSX.Element> = {
  info: InfoMark,
  instagram: InstagramMark,
  ribbon: PurpleRibbon,
  supply: SupplyMark,
  design: DesignMark,
  droplet: DropletMark,
  collabs: CollabsMark,
  donate: DonateMark,
  careers: CareersMark,
  diamond: Diamond,
  signin: SignInMark,
  share: ShareMark,
}
