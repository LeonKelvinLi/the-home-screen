/**
 * Biggie's gallery — the pictures behind the window button on the home screen.
 *
 * WHERE THESE COME FROM. The operator asked for the photographs on
 * instagram.com/beasty_pages. Instagram will not hand them over to anything
 * automated: the account API returned a validation error and yt-dlp cannot
 * extract a profile listing without a logged-in session. So this list is the
 * shape, filled with what the app actually has, and it is deliberately short
 * rather than padded — a gallery of stand-ins pretending to be his dog would be
 * worse than a gallery of one real picture.
 *
 * TO FILL IT: drop files into public/gallery/ and add a row each. `taken` is
 * the date printed under the picture and the key the window groups by, so it
 * has to be the date the photograph was TAKEN — not the date it was added
 * here, which is a fact about us rather than about Biggie.
 */
export interface GalleryShot {
  /** A file on our own origin, in public/gallery. */
  src: string
  /** ISO date, YYYY-MM-DD. Printed, and grouped on. */
  taken: string
  /** Said aloud by a screen reader, so it describes rather than titles. */
  alt: string
  /** Optional line under the picture. His words where there are any. */
  caption?: string
}

export const GALLERY: GalleryShot[] = [
  {
    src: '/biggie.webp',
    taken: '2026-08-04',
    alt: 'Biggie, the pit bull the BEASTY mark is drawn from, in profile',
    caption: 'The dog the whole thing is named after.',
  },
]

/** Newest first, grouped by month — how the window lays them out. */
export function byMonth(shots: GalleryShot[]) {
  const out = new Map<string, GalleryShot[]>()
  for (const s of [...shots].sort((a, b) => b.taken.localeCompare(a.taken))) {
    const key = s.taken.slice(0, 7)
    out.set(key, [...(out.get(key) ?? []), s])
  }
  return [...out.entries()]
}
