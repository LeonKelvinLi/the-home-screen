import type { Reel } from './clips'

export interface Promotion {
  id: string
  eyebrow: string
  title: string[]
  price: string
  sub: string
  points: string[]
  note: string
  action: string
  href: string
  app?: string
  accent: string
}

/** Current published pilot terms, checked October 31. These are promotions,
 * not creator reviews; no fictional discount, testimonial or engagement count. */
export const PROMOTIONS: Promotion[] = [
  {
    id: 'website-pilot', eyebrow: 'BEASTY PAGES · WEBSITE PILOT',
    title: ['Your business.', 'Your own website.'], price: '$299',
    sub: 'For projects accepted into the pilot.',
    points: ['Custom design for your business', 'Made for phones and desktop', 'Contact flow, search foundations & launch support'],
    note: 'Limited capacity. Scope, exclusions and timeline agreed in writing before payment. Down payment available. Domain and paid hosting costs are separate. Stores and advanced features are quoted separately.',
    action: 'Request a website', href: 'https://bstypilotprogram.onrender.com/', accent: '#f5d928',
  },
  {
    id: 'beasty-designs', eyebrow: 'BEASTY DESIGNS · FOR BEASTY PASS MEMBERS',
    title: ['Built for your', 'next step.'], price: 'Websites from $650',
    sub: 'Work with Leon on your business’s next project.',
    points: ['Websites, apps & online ordering', 'Branding and logo design', 'Customer tools, automation & integrations'],
    note: 'Standard starting price for a starter site, outside the pilot. Other services are quoted by scope. Ask Leon about your project before committing.',
    action: 'Explore BEASTY Designs', href: 'https://beastypages.com/designs', app: 'sys.designs', accent: '#c7c5fb',
  },
]

export type FeedItem = { kind: 'film'; reel: Reel } | { kind: 'promotion'; promo: Promotion; key: string }
/** Exactly every ninth page is our ad; organic films retain the caller's
 * shuffled order and appear once. The two offers alternate. */
export function withPromotions(reels: Reel[]): FeedItem[] {
  const out: FeedItem[] = []
  let ads = 0
  for (const reel of reels) {
    out.push({ kind: 'film', reel })
    if ((out.length + 1) % 9 === 0) {
      out.push({ kind: 'promotion', promo: PROMOTIONS[ads % PROMOTIONS.length], key: 'promotion-' + ads++ })
    }
  }
  return out
}
