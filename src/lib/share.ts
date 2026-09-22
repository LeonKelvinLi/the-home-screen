/**
 * The pages worth sending to somebody, and how to send them.
 *
 * Glenn shares BEASTY in Instagram DMs, so the thing he needs is a link that
 * opens the page he is talking about rather than the front door: the Collab
 * invitation (2026-09-16) and then, the next morning, "would you mind adding a
 * share button to each one of these pages?" over the membership page and MAKE $.
 *
 * Each slug is a real path. The server gives it its own title and preview text
 * so a DM shows what the link is (server/index.ts), and the client opens that
 * page when it arrives there (App.tsx).
 */
export interface SharePage {
  /** The path, without a slash: beastypages.com/<slug>. */
  slug: string
  /** What a DM shows as the link's name, and the share sheet's title. */
  title: string
  /** One line of context, where a share sheet takes it. */
  text?: string
}

export const SHARE_COLLAB: SharePage = {
  slug: 'collab',
  title: 'BEASTY Collab',
  text: 'BEASTY pages is looking for Bay Area foodies to collaborate with.',
}

export const SHARE_MONEY: SharePage = {
  slug: 'money',
  title: 'Make money with BEASTY',
  text: 'Earn points for bringing new members and businesses onto BEASTY pages.',
}

export const SHARE_MEMBERS: SharePage = {
  slug: 'members',
  title: 'BEASTY membership',
  text: 'One membership, honoured at every participating BEASTY affiliate.',
}

/* The Contacts screen: the owners' numbers and emails, and who is on BEASTY.
   Glenn, 2026-09-22, asking for its share button back. */
export const SHARE_CONTACTS: SharePage = {
  slug: 'contacts',
  title: 'BEASTY contacts',
  text: 'Reach the owners of beastypages.com directly, and see who is on BEASTY.',
}

export const shareUrl = (page: SharePage): string => `${window.location.origin}/${page.slug}`

/**
 * The phone's share sheet where there is one, else the clipboard.
 *
 * Returns what actually happened so the caller can say so: a desktop browser
 * has no sheet, and a copy nobody is told about reads as a dead button. A
 * dismissed sheet falls through to the clipboard, which is the same behaviour
 * the landing page's SHARE key has always had.
 */
export async function shareOrCopy(page: SharePage): Promise<'shared' | 'copied' | 'failed'> {
  const url = shareUrl(page)
  if (navigator.share) {
    try {
      await navigator.share(page.text ? { title: page.title, text: page.text, url } : { title: page.title, url })
      return 'shared'
    } catch {
      /* dismissed — fall through to copy */
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
