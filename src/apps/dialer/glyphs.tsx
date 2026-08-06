import { Diamond, PurpleRibbon } from './marks'
import type { PanelPage } from './keys'

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
 * "call" and this button enters an app. An arrow going through a doorway is
 * what it actually does.
 */
export function EnterMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M13.4 2.6h5.2a2.8 2.8 0 0 1 2.8 2.8v13.2a2.8 2.8 0 0 1-2.8 2.8h-5.2a1.4 1.4 0 0 1 0-2.8h4.4a.8.8 0 0 0 .8-.8V6.2a.8.8 0 0 0-.8-.8h-4.4a1.4 1.4 0 0 1 0-2.8Z" />
      <path d="M9.5 6.6a1.4 1.4 0 0 1 2 0l4.4 4.4a1.4 1.4 0 0 1 0 2l-4.4 4.4a1.4 1.4 0 1 1-2-2l2-2H3.6a1.4 1.4 0 0 1 0-2.8h7.9l-2-2a1.4 1.4 0 0 1 0-2Z" />
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

export const PANEL_MARKS: Record<PanelPage, (props: MarkProps) => JSX.Element> = {
  favorites: StarMark,
  supply: SupplyMark,
  about: DogMark,
  contacts: PhoneMark,
  bprf: PurpleRibbon,
  collabs: CollabsMark,
  donations: DonateMark,
  careers: CareersMark,
  reviews: ReviewsMark,
}

export { Diamond, PurpleRibbon }
