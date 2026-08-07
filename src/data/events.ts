/**
 * What the businesses on the home screen have on, by date.
 *
 * EMPTY, AND IT STAYS EMPTY UNTIL A BUSINESS POSTS SOMETHING.
 *
 * This is the file it would be most tempting to fill. A calendar with a few
 * plausible specials on it looks finished, demos well, and would be entirely
 * invented trading information about real, named businesses on specific dates —
 * a customer could read "half-price wings, Friday" and drive to a shop that has
 * never heard of it. Every other unsourced thing in this app is a price on a
 * menu; this would be an appointment.
 *
 * There is also no way to post one yet. No partner-facing screen exists, so
 * nothing could have been posted even in principle. The calendar says so on
 * every empty day rather than letting a customer conclude that ten businesses
 * simply have nothing on.
 *
 * When it is time: an event needs the business to have agreed it, the same way
 * `offers` on a partner does — see the note in data/localBrands.ts. `brandId`
 * links it to a tile so tapping through goes to their menu.
 */

export interface CalendarEvent {
  id: string
  /** Local date, YYYY-MM-DD. */
  date: string
  title: string
  /** The business's name as it appears on their tile. */
  business: string
  /** Their brand id, so the row can open their page. Omit for a BEASTY event. */
  brandId?: string
  /** Free text like "5-9pm". Omitted means all day. */
  time?: string
  detail?: string
}

export const EVENTS: CalendarEvent[] = []
