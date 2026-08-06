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

/** About — Biggie, in profile. A memorial, so: dignified, no cartoon eyes. */
export function DogMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M4.6 8.1c0-1.2.5-2.3 1.4-3.1l.5-.5a.6.6 0 0 1 1 .3l.3 1.7 2.1-.5a7.6 7.6 0 0 1 3.4 0l1.6.4a4.4 4.4 0 0 1 3.3 3.4l.5 2.6a3 3 0 0 1-.6 2.4l-1.2 1.5v3a.7.7 0 0 1-.7.7h-1.4a.7.7 0 0 1-.7-.7v-1.9l-3.4.4-.6 2.2a.7.7 0 0 1-.7.5H8.1a.7.7 0 0 1-.7-.9l.8-2.8-1.6-2.2a5.6 5.6 0 0 1-1-3.2Zm3.1.4a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" />
    </svg>
  )
}

/** Contacts — the classic handset. */
export function PhoneMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M6.3 2.4c.7-.3 1.5 0 1.9.6l2.3 4a1.6 1.6 0 0 1-.4 2l-1.8 1.5a14.6 14.6 0 0 0 5.2 5.2l1.5-1.8c.5-.6 1.3-.7 2-.4l4 2.3c.7.4.9 1.2.6 1.9l-1.1 2.6c-.3.8-1.1 1.3-2 1.2A20.8 20.8 0 0 1 2.5 5.5c-.1-.9.4-1.7 1.2-2Z" />
    </svg>
  )
}

/** Collabs — two hands meeting. Simplified hard: this has to read at 22px. */
export function CollabsMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M1.6 8.6 5.2 6a1 1 0 0 1 1.3.1l4 3.7a1.5 1.5 0 0 1-.1 2.3 1.6 1.6 0 0 1-2 0L6.6 10.7 5.4 12l4.2 3.9a1.4 1.4 0 0 0 1.9 0l.7-.6 2.6 2.4a1.4 1.4 0 0 0 2-.1l3.6-4 1.9 1.3a.9.9 0 0 0 1.1-.2V8.4L18.7 6a1 1 0 0 0-1 0l-3.1 1.6a2 2 0 0 1-1.7 0L11 6.8a2.6 2.6 0 0 0-2.4.1L6.4 8.2 5.6 7 3.1 8.5a.9.9 0 0 1-1.1-.1Z" />
    </svg>
  )
}

/** Donations — a heart held in an open palm. */
export function DonateMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M12 3.1c1.5-1.5 3.9-1.4 5.3.1a3.9 3.9 0 0 1 0 5.4L12 14.2 6.7 8.6a3.9 3.9 0 0 1 0-5.4c1.4-1.5 3.8-1.6 5.3-.1Z" />
      <path d="M2.4 14.9a1.3 1.3 0 0 1 1.8-.3l3.5 2.5h4.1a1.2 1.2 0 0 1 0 2.4H9.2v1.3h3.2c.6 0 1.2-.2 1.7-.5l5.4-3.3a1.4 1.4 0 0 1 1.9.5 1.5 1.5 0 0 1-.5 2l-5.4 3.4a5.4 5.4 0 0 1-2.9.8H2.6a.7.7 0 0 1-.7-.7v-7a1.3 1.3 0 0 1 .5-1.1Z" />
    </svg>
  )
}

/** Careers — rising bars with a flag at the top of them. */
export function CareersMark({ size = 24 }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <rect x="1.8" y="15.4" width="5.2" height="6.8" rx="1.1" />
      <rect x="9.4" y="11.2" width="5.2" height="11" rx="1.1" />
      <rect x="17" y="6.6" width="5.2" height="15.6" rx="1.1" />
      <path d="M17.9 1.6a.8.8 0 0 1 .8-.8h.6a.8.8 0 0 1 .8.8v3.4h-2.2Z" />
      <path d="M20.1 1.9h3.3a.4.4 0 0 1 .3.7l-1 1.1 1 1.1a.4.4 0 0 1-.3.7h-3.3Z" />
    </svg>
  )
}

/**
 * Which mark heads which panel.
 *
 * A map rather than a switch so the panel component stays generic — adding a
 * page is a line here and a line in copy.ts, and nothing else changes.
 */
export const PANEL_MARKS: Record<PanelPage, (props: MarkProps) => JSX.Element> = {
  about: DogMark,
  contacts: PhoneMark,
  bprf: PurpleRibbon,
  collabs: CollabsMark,
  donations: DonateMark,
  careers: CareersMark,
}

export { Diamond, PurpleRibbon }
