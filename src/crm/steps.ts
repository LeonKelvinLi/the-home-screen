/*
  HOW A BUSINESS MOVES, IN THE TEAM'S OWN WORDS.

  The server keeps fifteen stages, because the history and the funnel need
  them. A person needs less: five steps (find their info, say hello, talk,
  send a quote, customer), a plain name for where a business is, and one
  thing to do next. This file turns a stage into those. Pure data, no React.
*/
import type { Channels } from './api'

export const STEPS = ['Find info', 'Say hello', 'Talk', 'Quote', 'Customer'] as const

/** Which of the five steps a stage is on; null once it has closed. */
export function stepOf(stage: string): number | null {
  switch (stage) {
    case 'new_lead':
    case 'need_contact_info':
      return 0
    case 'ready_to_contact':
      return 1
    case 'contacted':
    case 'replied':
    case 'interested':
    case 'meeting':
      return 2
    case 'proposal_sent':
      return 3
    case 'won':
    case 'onboarding':
    case 'active_customer':
      return 4
    default:
      return null
  }
}

const CUSTOMER = ['won', 'onboarding', 'active_customer']
const CLOSED = ['no_response', 'not_interested', 'bad_lead', 'closed_lost']
export const isCustomer = (stage: string) => CUSTOMER.includes(stage)
export const isClosed = (stage: string) => CLOSED.includes(stage)

/** How much of a business's ring is filled: nothing before the first step is done, all of it for a customer. */
export const PROGRESS: Record<string, number> = {
  new_lead: 0,
  need_contact_info: 0,
  ready_to_contact: 0.2,
  contacted: 0.4,
  replied: 0.5,
  interested: 0.6,
  meeting: 0.7,
  proposal_sent: 0.8,
  won: 1,
  onboarding: 1,
  active_customer: 1,
}

/** Where a business is, said the way the team says it. */
export const STAGE_NAMES: Record<string, string> = {
  new_lead: 'New',
  need_contact_info: 'Needs contact info',
  ready_to_contact: 'Ready to say hello',
  contacted: 'Waiting to hear back',
  replied: 'They replied',
  interested: 'Interested',
  meeting: 'Meeting set',
  proposal_sent: 'Quote sent',
  won: 'Said yes',
  onboarding: 'Setting up',
  active_customer: 'Live customer',
  no_response: 'No response',
  not_interested: 'Not interested',
  bad_lead: 'Not a fit',
  closed_lost: 'Lost',
}
export const stageName = (stage: string | null | undefined) => (stage ? STAGE_NAMES[stage] ?? stage : '')

/** The step filters on the Businesses list, as the stages each one covers. */
export const STEP_FILTERS: { key: string; label: string; stages: string[] }[] = [
  { key: 'info', label: 'Find info', stages: ['new_lead', 'need_contact_info'] },
  { key: 'hello', label: 'Say hello', stages: ['ready_to_contact'] },
  { key: 'talk', label: 'Talking', stages: ['contacted', 'replied', 'interested', 'meeting'] },
  { key: 'quote', label: 'Quote sent', stages: ['proposal_sent'] },
  { key: 'customer', label: 'Customers', stages: CUSTOMER },
  { key: 'closed', label: 'Closed', stages: CLOSED },
]

/** Outreach a person logs; logging one on a business nobody has reached yet means it has been reached. */
export const OUTREACH = ['CALL', 'TEXT', 'EMAIL', 'INSTAGRAM_DM']
export const NOT_REACHED = ['new_lead', 'need_contact_info', 'ready_to_contact']

export interface Move {
  to: string
  label: string
}

export interface Next {
  title: string
  body: string
  /** Offer the ways to reach them as the main action. */
  reach: boolean
  /** Buttons that move the business on, in the order they are likely. */
  moves: Move[]
  /** Ask for a phone, email or Instagram. */
  addInfo?: boolean
  /** Point at the quote. */
  quote?: boolean
}

const howToReach = (c: Channels) =>
  c.phone ? 'They have a phone number.' : c.instagram ? 'They are on Instagram.' : c.email ? 'They have an email address.' : ''

/** What to do next with a business, and the buttons to do it. */
export function nextFor(stage: string, channels: Channels, hasOpenQuote: boolean): Next {
  switch (stage) {
    case 'new_lead':
    case 'need_contact_info':
      return {
        title: 'Find their phone or Instagram',
        body: 'Nobody can reach them yet. Look them up, add what you find, and they move on to Say hello.',
        reach: false,
        moves: [],
        addInfo: true,
      }
    case 'ready_to_contact':
      return {
        title: 'Say hello',
        body: `${howToReach(channels)} Reach out, then write down what happened below.`.trim(),
        reach: true,
        moves: [{ to: 'contacted', label: 'I reached out' }],
      }
    case 'contacted':
      return {
        title: 'Wait to hear back',
        body: 'Give them a couple of days. If nothing comes back, try again another way.',
        reach: true,
        moves: [
          { to: 'replied', label: 'They replied' },
          { to: 'no_response', label: 'No response' },
        ],
      }
    case 'replied':
      return {
        title: 'Ask if they want a website',
        body: 'They answered. Find out whether a website would help them.',
        reach: true,
        moves: [
          { to: 'interested', label: "They're interested" },
          { to: 'not_interested', label: 'Not interested' },
        ],
      }
    case 'interested':
      return {
        title: 'Send them a quote',
        body: 'They want to hear more. Pick a price below and send it, or set a meeting first.',
        reach: true,
        moves: [
          { to: 'proposal_sent', label: 'Quote sent' },
          { to: 'meeting', label: 'Meeting set' },
        ],
        quote: true,
      }
    case 'meeting':
      return {
        title: 'Meet, then send the quote',
        body: 'Write down how the meeting went, then send the price.',
        reach: true,
        moves: [{ to: 'proposal_sent', label: 'Quote sent' }],
        quote: true,
      }
    case 'proposal_sent':
      return {
        title: 'Ask if they are ready',
        body: hasOpenQuote
          ? 'The quote is with them. When they say yes, mark it sold below.'
          : 'The quote is with them. Add it below, so the sale counts when they say yes.',
        reach: true,
        moves: [{ to: 'closed_lost', label: 'They said no' }],
        quote: true,
      }
    case 'won':
      return { title: 'Start their website', body: 'They said yes. Get their site started.', reach: true, moves: [{ to: 'onboarding', label: 'Started' }] }
    case 'onboarding':
      return { title: 'Finish their website', body: 'When their site is live, mark them as a live customer.', reach: true, moves: [{ to: 'active_customer', label: 'Their site is live' }] }
    case 'active_customer':
      return { title: 'Keep in touch', body: 'A live customer. Check in now and then.', reach: true, moves: [] }
    default:
      return {
        title: `Closed: ${stageName(stage).toLowerCase()}`,
        body: 'Nothing to do unless something changes.',
        reach: false,
        moves: [{ to: 'ready_to_contact', label: 'Try again' }],
      }
  }
}

/** A short line for lists: the next thing to do, in a few words. */
export function nextShort(stage: string): string {
  switch (stage) {
    case 'new_lead':
    case 'need_contact_info':
      return 'Find their info'
    case 'ready_to_contact':
      return 'Say hello'
    case 'contacted':
      return 'Waiting to hear back'
    case 'replied':
      return 'They replied'
    case 'interested':
      return 'Send a quote'
    case 'meeting':
      return 'Meeting set'
    case 'proposal_sent':
      return 'Quote sent'
    default:
      return stageName(stage)
  }
}

/** "Chicken wings in Oakland", or "DJ on the BEASTY pages" for a business with no city seat. */
export function placeLine(category: string | null | undefined, city: string | null | undefined): string {
  const cat = (category ?? '').trim()
  const where = (city ?? '').trim()
  if (!where) return cat
  if (where === 'BEASTY pages') return cat ? `${cat} on the BEASTY pages` : 'On the BEASTY pages'
  return cat ? `${cat} in ${where}` : where
}
