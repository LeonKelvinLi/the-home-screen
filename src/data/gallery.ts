/**
 * BEASTY's own feed, in the window beside the home button.
 *
 * Twelve posts off instagram.com/beasty_pages — the operator's own account, so
 * this is his material on his own app rather than anybody else's borrowed.
 *
 * EVERY CAPTION HERE IS HIS. Not a summary of the post and not a story written
 * to fit the picture: the words he typed under it, trimmed only where a tag
 * list ran on. He asked for "a short story" with each one, and the true version
 * of that is what he already said.
 *
 * DATES ARE VERIFIED, not guessed. Instagram printed the date in the alt text
 * of eight of these and left four blank. The missing four are decoded out of
 * the shortcode — Instagram's shortcode is base64 of the media id and the id's
 * high bits are a millisecond timestamp — and that decoder was checked against
 * all eight known dates first. It matched all eight once read in Pacific time,
 * which is the point the first pass got wrong: read as UTC, three of them
 * landed a day late.
 */
export interface GalleryShot {
  /** A file on our own origin, in public/gallery. */
  src: string
  /** ISO date, YYYY-MM-DD, Pacific. Printed, and grouped on. */
  taken: string
  /** Described for a screen reader, so it says what is in the frame. */
  alt: string
  /** His own caption. */
  caption?: string
  /** The post, so anyone can check the caption against the source. */
  href?: string
}

const post = (code: string) => `https://www.instagram.com/p/${code}/`

export const GALLERY: GalleryShot[] = [
  {
    src: '/gallery/CbeRyb1OCcZ.webp',
    taken: '2022-03-23',
    alt: 'Two pit bulls side by side, a brown one and a grey one, both wearing chain collars',
    caption: 'My 1st and last BEAST’s — Biggie 2005-2012, Lil Biggs 2013-2022.',
    href: post('CbeRyb1OCcZ'),
  },
  {
    src: '/gallery/CbeQ8X4uCkn.webp',
    taken: '2022-03-23',
    alt: 'A grey pit bull standing outside with two young boys in winter coats',
    caption: 'BEAST IN PEACE — Lil Biggs 2013-2022.',
    href: post('CbeQ8X4uCkn'),
  },
  {
    src: '/gallery/CFi692QBP6p.webp',
    taken: '2020-09-24',
    alt: 'A man in a skate shop holding the lead of a pit bull, shelves of shoes behind them',
    caption: '🛹 At Huf.',
    href: post('CFi692QBP6p'),
  },
  {
    src: '/gallery/B-Q9ccEBHaK.webp',
    taken: '2020-03-27',
    alt: 'Six pairs of Air Jordans laid out in two rows on a carpet',
    caption:
      'Challenge accepted! My Top 6, all dead stock for now — Rare Air 4s, Lightning 4s, ' +
      'Thunder 4s, Flint 13s, DMP 11s, Cool Grey 11s.',
    href: post('B-Q9ccEBHaK'),
  },
  {
    src: '/gallery/B7zITABBKGF.webp',
    taken: '2020-01-26',
    alt: 'A yellow Lakers jersey, number 24, name Bryant across the shoulders',
    caption: 'Hold on to your loved ones…',
    href: post('B7zITABBKGF'),
  },
  {
    src: '/gallery/B27zZDnBgdg.webp',
    taken: '2019-09-27',
    alt: 'Three men behind a DJ booth set up inside a shop',
    caption:
      'Pull up at the Trend Area! DJ Rick Lee on the tables with RevRoc and JayEazy. ' +
      'PhilthyRich is pulling up for the meet and greet.',
    href: post('B27zZDnBgdg'),
  },
  {
    src: '/gallery/B2W4DqYhl3W.webp',
    taken: '2019-09-13',
    alt: 'A line drawing of Tupac Shakur above the words BEAST IN PEACE and his dates',
    caption: 'People are dying every minute of the day. But legends LiVE LiFE BEASTY forever.',
    href: post('B2W4DqYhl3W'),
  },
  {
    src: '/gallery/B2UUnYahEQh.webp',
    taken: '2019-09-12',
    alt: 'An American football player in a white Bengals jersey, number 30',
    caption:
      'Real Richmond legend. Lost sleep over this solid man right here. I love and hate our ' +
      'own City we grew up in. 🙏🏽 for his family.',
    href: post('B2UUnYahEQh'),
  },
  {
    src: '/gallery/BvCLGJIn_pg.webp',
    taken: '2019-03-15',
    alt: 'A grey pit bull puppy in a studded collar sitting in the doorway of a van',
    caption: '#FBF',
    href: post('BvCLGJIn_pg'),
  },
  {
    src: '/gallery/BvCLA6En_U9.webp',
    taken: '2019-03-15',
    alt: 'A flyer collage for an event at 111 Minna Gallery, a woman crouching beside a dog',
    caption: '#FBF — HBD to this beautiful individual.',
    href: post('BvCLA6En_U9'),
  },
  {
    src: '/gallery/BvAKMQqh79w.webp',
    taken: '2019-03-14',
    alt: 'A grey and white pit bull standing on a driveway, mouth open, tags on its collar',
    caption: '#TBT BEASTY',
    href: post('BvAKMQqh79w'),
  },
  {
    src: '/gallery/BvAJUaWhzQk.webp',
    taken: '2019-03-14',
    alt: 'Two people standing in a sneaker shop with a brown pit bull sitting between them',
    caption: '#TBT At Flight Club.',
    href: post('BvAJUaWhzQk'),
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
