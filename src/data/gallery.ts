/**
 * BEASTY's own feed, in the window beside the home button.
 *
 * Twenty-nine posts off instagram.com/beasty_pages — the operator's own account,
 * so this is his material on his own app rather than anybody else's borrowed.
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
  /*
    NOT HIS POST — an affiliate's, and the first one. Glenn, 2026-09-02:
    "can you post this on Sin City Pits page? Also, the gallery. I'm starting
    to contact a lot of the affiliates on the pages to get in a legit offer to
    post." The caption is the flyer's own words, trimmed; the post itself was
    sent as a screenshot, so there is no shortcode and no link back. Dated the
    day he sent it, which is the day their Instagram showed it as an hour old.
  */
  {
    src: '/gallery/2026-09-02-sin-city-pits-breeder.webp',
    taken: '2026-09-02',
    alt: 'Sin City Pits flyer, Breeder Opportunity: three pit bull puppies, two grey and one tan, above the words available females plus breeding unit.',
    caption:
      'Sin City Pits: Breeder opportunity. Purchase one of these select females and receive one breeding unit from a select list of Sin City Pits studs. Only available with first or second pick.',
  },
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

  /*
    SEVENTEEN MORE, from the batch he sent on 2026-08-20 — "Can you go ahead and
    put all these pictures in the gallery as well." He sent twenty; 2205 and
    2209 are the same post as 2200, and one of the Berkeley shots was sent
    twice. Three duplicates, deduplicated by caption, date and like count.

    THESE HAVE NO `href` AND THAT IS A REAL LOSS, not an oversight. The twelve
    above were downloaded from Instagram, so each carries its shortcode and its
    caption can be checked against the source. These arrived as SCREENSHOTS,
    which carry no shortcode, so the captions below were transcribed off the
    picture by eye. They are his words and they were read carefully — but they
    are the only ones here that nobody can verify with a tap, so they are the
    ones worth re-reading if anything ever looks wrong.

    "There are a lot of prominent people in these pictures", which is why the
    alt text names who is in frame where Instagram's own tags name them.
  */
  {
    src: '/gallery/2019-03-15-minna-gallery.webp',
    taken: '2019-03-15',
    alt: 'A wall of photographs and posters at 111 Minna Gallery, a woman in red in front of them',
    caption: '#FBF HBD to this beautiful individual! @laovegan',
  },
  {
    src: '/gallery/2019-03-14-flight-club.webp',
    taken: '2019-03-14',
    alt: 'Two people in a sneaker shop with a pit bull on a lead between them, tagged @chrisbrownofficial and @badgalriri',
    caption: '#TBT @chrisbrownofficial @badgalriri',
  },
  {
    src: '/gallery/2019-02-07-tbt-biggie.webp',
    taken: '2019-02-07',
    alt: 'Biggie sitting on concrete in a blue collar and lead, head turned to one side',
    caption: '#TBT #BEASTY #BIGGIE #GOTTI #BIGGIEGOTTI #RIP #BIP',
  },
  {
    src: '/gallery/2019-02-03-beauty-and-beasty.webp',
    taken: '2019-02-03',
    alt: 'A woman sitting on a step beside a pit bull, both facing the camera',
    caption: '#BEAUTY & #BEASTY #BFF',
  },
  {
    src: '/gallery/2019-01-24-hollywood-hills.webp',
    taken: '2019-01-24',
    alt: 'A man in a red and white track jacket sitting on a rail with a pit bull on a chain lead, the frame mirrored',
    caption: '2 BEASTY Individuals #beasty #BEASTY #xxlbully #gotti #hollywood #legends',
  },
  {
    src: '/gallery/2019-01-24-blue-nose.webp',
    taken: '2019-01-24',
    alt: 'Two blue-nose pit bulls nose to nose, the frame mirrored and tinted blue',
    caption: '#bluenose to nose #BEASTY #BIGGIEGOTTI #RIP #BIP',
  },
  {
    src: '/gallery/2019-01-24-telegraph-berkeley.webp',
    taken: '2019-01-24',
    alt: 'A man crouching beside a pit bull on Telegraph Avenue in Berkeley',
    caption: '#TBT #filthydripped #BEASTY #BIGGIE #BIGGIEGOTTI #GOTTI #GOTTILINE',
  },
  {
    src: '/gallery/2019-01-24-huf.webp',
    taken: '2019-01-24',
    alt: 'A man in a hoodie inside the Huf skate shop, shelves of shoes behind him, a pit bull at his feet',
    caption: '#TBT #HUF #BEASTY #BIGGIE #GOTTI #BIGGIEGOTTI #GOTTILINE',
  },
  {
    src: '/gallery/2019-01-24-live-beasty.webp',
    taken: '2019-01-24',
    alt: 'A yellow LIVE BEASTY BiGGiE GOTTi wordmark on black, a dog silhouette inside the letters',
  },
  {
    src: '/gallery/2019-01-18-biggie-gotti.webp',
    taken: '2019-01-18',
    alt: 'Biggie standing up against a balcony rail in a harness and chain lead',
    caption: '#FBF Biggie Gotti',
  },
  {
    src: '/gallery/2019-01-18-flight-club-2008.webp',
    taken: '2019-01-18',
    alt: 'Two men in red T-shirts holding two pit bulls on chain leads inside Flight Club, the frame mirrored',
    caption: '#FBF 2008',
  },
  {
    src: '/gallery/2019-01-18-lacma.webp',
    taken: '2019-01-18',
    alt: 'Two people with pit bulls in front of the lamp posts at LACMA, the frame mirrored',
    caption: '#FBF 2008',
  },
  {
    src: '/gallery/2019-01-18-melrose.webp',
    taken: '2019-01-18',
    alt: 'A man in a baseball cap crouching beside a pit bull on Melrose Avenue',
    caption: '#FBF 2008',
  },
  {
    src: '/gallery/2019-01-18-sportie-la.webp',
    taken: '2019-01-18',
    alt: 'A black and white photograph of a woman kneeling beside a pit bull in a shoe shop',
    caption: '#FBF',
  },
  {
    src: '/gallery/2019-01-17-nicky-diamonds.webp',
    taken: '2019-01-17',
    alt: 'A group at a restaurant table with a pit bull lying on the floor in front of them',
    caption: '#TBT Nicky Diamonds',
  },
  {
    src: '/gallery/2019-01-16-ten-year-challenge.webp',
    taken: '2019-01-16',
    alt: 'A four-panel collage of people and pit bulls, a ten-year comparison',
    caption: '#10yearchallenge Why the fuck not… Here’s my entry.',
  },
  {
    src: '/gallery/2018-11-30-hbd-richmond.webp',
    taken: '2018-11-30',
    alt: 'A man in a white T-shirt holding a pit bull on a chain lead, the frame mirrored',
    caption: 'HBD to my boy Richmond!!! @rtbrothas',
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
