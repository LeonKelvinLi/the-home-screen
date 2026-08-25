/**
 * Copy for five BEASTY pages.
 *
 * Every factual claim below traces to something already in the app: the
 * founder's story in apps/IntroScreen.tsx, the membership and charity claim in
 * data/membership.ts, the pitch to a prospective business in apps/ReserveApp.tsx,
 * and the city list in data/cities.ts. Nothing here was invented to fill a gap.
 *
 * `needsGlenn` is the gap itself, stated in one line. A page carrying that field
 * is not finished — it is honest about what it cannot say yet, which is a
 * different thing. Delete the field when he supplies the detail, not before.
 *
 * The three hard rules, because each has a specific way of going wrong:
 *
 *  - THE FOUNDATION. No cause, no registration, no percentage, no tax status.
 *    Nobody has supplied any of them. A sentence about where a customer's money
 *    ends up is a factual claim about a payment, and getting it wrong is a legal
 *    problem rather than a copy problem.
 *  - MONEY. Card payments are not connected. No page may read as though it can
 *    take a payment or a donation.
 *  - REFERRALS. A finder's fee has been floated and nothing has been agreed, so
 *    no page promises one.
 *
 * No counts are printed here. The screen prints two — "9 cities" is derived from
 * CITY_PAGES.length and is always right; "10 businesses" is PARTNER_COUNT, a
 * literal, because reading the real list would drag the whole catalogue into the
 * landing page's bundle. Shell compares the two on mount, but behind
 * import.meta.env.DEV, so that check is stripped from the production build and a
 * drift would ship silently. Either way, a count frozen into a PARAGRAPH is
 * worse: nothing checks it at all.
 */

interface Page {
  title: string
  /** Paragraphs. Two to four — this is read on a phone. */
  body: string[]
  /** What the operator still has to supply. Absent means nothing is missing. */
  needsGlenn?: string
  /**
   * Collapsed chapters, shown under `body` as tap-to-open rows.
   *
   * His instruction, and the reason for it: the About text runs to seven
   * chapters and "it doesn't completely fill the whole page with all these
   * paragraphs". Each bold heading he wrote becomes a closed row; the reader
   * opens the ones they want. The intro above stays open, so the page still
   * says what it is before anybody taps anything.
   */
  sections?: AboutSection[]
  /** A last line under everything, set apart. His sign-off. */
  signoff?: string
  /** His closing pull quote, laid out as he laid it out. */
  quote?: string[]
}

export interface AboutSection {
  /** The bold heading, exactly as he wrote it. */
  head: string
  /** His parenthetical under a heading, where he wrote one. */
  sub?: string
  body: string[]
  /** A block of short lines rather than prose — Biggie's pedigree. */
  facts?: string[]
  /** One line after the facts, standing alone. */
  after?: string
  /** A picture inside the chapter, with whose it is and what it shows. */
  figure?: { src: string; alt: string; caption: string }
}

type PageKey = 'about' | 'bprf' | 'collabs' | 'donations' | 'careers' | 'reviews' | 'supply' | 'camera'

export const PAGES: Record<PageKey, Page> = {
  /*
    The camera.

    It is a QR scanner, and that is the surprise: on a food app the camera is
    normally for photographing your dinner. Here it points at the code in a
    partner's window, on a flyer, or on somebody else's phone, and opens that
    business — which is what makes the Share & Scan code the app already
    generates worth printing.

    NOT BUILT. Nothing is captured, nothing is uploaded, and the camera is never
    switched on until someone taps to start it.
  */
  camera: {
    title: 'Scan',
    body: [
      'Point the camera at a BEASTY code — in a shop window, on a flyer, on somebody else’s screen — and it opens that business straight away. No app to install and nothing to type.',
      'It is not switched on yet. When it is, the camera only runs while this screen is open, nothing is recorded, and no picture leaves the phone: a code is read and the app moves on.',
    ],
    needsGlenn:
      'Window stickers or cards carrying each partner’s code — the scanner is worth nothing until there is something out there to scan.',
  },

  /*
    Key 4. The operator renamed it from GOODS to SUPPLY and said he would add
    the contact for it when he can — so there is a name and an intent and no
    detail whatsoever. Do not invent a product list, a minimum order or a lead
    time to fill the page out.
  */
  supply: {
    title: 'Supply',
    body: [
      'The supply side of the business — goods rather than the kitchens on the home screen.',
      'There is nothing to show here yet. Glenn is adding a contact for it, and until he does this page has no way to reach anyone and nothing to order.',
    ],
    needsGlenn:
      'What Supply covers and a way to reach it — a phone, an email or a form. Nothing here can be written until one of those exists.',
  },

  /*
    What the Voicemail tab becomes: customers' own words about the businesses on
    the screen.

    EMPTY, and it says so. Nobody has left one. A reviews page seeded with
    anything at all — samples, placeholders, a rating out of five — is the
    single most tempting thing on this app to fake and the single worst thing to
    be caught faking, because every review is a claim about a real business that
    the business did not make.
  */
  reviews: {
    title: 'Reviews',
    body: [
      'This is where customers say what they thought — of a kitchen, of an order, of the whole thing. Like a voicemail, left for whoever comes next.',
      'There are none yet. Nobody has left one, so there is nothing here to read, and nothing has been written in to fill the space. When a review appears on this page it will be because a customer left it.',
    ],
    needsGlenn:
      'How a customer leaves one, and whether reviews are attached to a business or to BEASTY as a whole — there is no way to submit one yet.',
  },

  /*
    The long version of the story panel on the intro screen. Same facts, told
    with room: Richmond, the walks, the dog, and why any of that produced an app.
    Biggie has died. He is a memorial, not a mascot, and the copy has to carry
    that or the artwork stops making sense.
  */
  about: {
    title: 'About BEASTY',
    /*
      HIS WORDS, not a retelling of them. He emailed this on 2026-08-25 as the
      About for the landing page and asked for it to be proofread and
      published; only unambiguous spelling was touched (set fourth -> set
      forth, have past -> have passed). The opening line carries the revision
      he sent separately over iMessage the same morning: "live with the ones
      you love", not "be with".

      TWO THINGS IN HERE ARE HIS TO SETTLE, and neither is a typo to quietly
      fix, because both are claims about his own life and his own brand:
        - The dates disagree. He gives his birthday as the 9th of March, says
          the litter came on the 7th, calls that "2 days before", and then
          calls it "just one day before".
        - The closing quote swears. He wrote it that way and framed it as a
          pull quote, so it is set as one.
    */
    body: [
      'The Universe, it\u2019s such a mysterious thing. Once you understand how it all works, life is much more of a beautiful place to live with the ones you love.',
      'The BEASTY brand is the brainchild of a dog owner who came to fully understand the true laws of attraction and placed a wish to the Universe on the beginning days of 2005.',
      'The prayer, \u201cI wish for the biggest male Pitbull with a big head, a brindle coat like his mother and the most calm and gentle demeanor from a BEAST a family would grow with love.\u201d',
    ],
    sections: [
      {
        head: 'The Story',
        sub: '(It began with Luna\u2026.)',
        body: [
          'Luna is where it starts. What follows is the litter she carried, and the one puppy out of twelve that the whole of BEASTY is named for.',
        ],
      },
      {
        head: 'The Blessing',
        body: [
          'The Blessing came to be just 2 days before the dog owner\u2019s birthday which was on the 9th of March. (Ironically the day of Biggie Smalls passing in 97\u2019 which was the inspiration for Biggie\u2019s name to be). A healthy litter of 12 puppies was birthed by Luna on the same day as her owner\u2019s birthday on the 7th of March. 10 healthy puppies were born that day & after midnight the last 2 were born of which the last one just happened to be the 2nd runt of her litter which ultimately became the Beast named Biggie \u201cillah-than-most\u201d Gotti. 3/8/05',
        ],
      },
      {
        head: 'The Gratitude',
        body: [
          'The Gratitude at that point was immense and surreal. The odds of months & months of prayers answered and delivered to you just one day before your birthday truly strengthens your faith in God and the Universe.',
        ],
      },
      {
        head: 'The Mission',
        body: [
          'The Mission was now set into play. How does one thank God and the universe for such a blessing? It was quite simple, share him to the world and use his presence to give back to other animals in need.',
        ],
      },
      {
        head: 'The Plan',
        body: [
          'The Plan was to raise money from proceeds from Calendar sales. So in the summer of 2008 the owner set forth on a mission to create a Tribute to Hip Hop Calendar with the help of over 24 small business sponsors which watched Biggie grow from the runt of his litter to the Beast of his siblings by 20-25lbs. As the saying goes, the best things come in small packages.',
        ],
        facts: [
          'Biggie 3/8/05',
          'Direct son of \u201cNotorious Juan Gotti\u201d',
          '3 x UKC Purple Ribbon bred',
          'XL Bully APBT',
          '110 lbs, Brindle Coat & 24\u201d Head',
          'with the personality of a cool & calm demeanor reminiscent of the late and great Notorious Biggie Smalls.',
        ],
        after: 'God is Good all the time.',
      },
      {
        head: 'The Future',
        body: [
          'The Future is now, 18 years have passed with many ups and downs from what life is expected. All it took was the burning desire to execute a dream that was once placed many years ago. From the memorable quote from an old time favorite film, Field of Dreams, \u201cif you build it, they will come\u2026\u201d.',
        ],
      },
      {
        head: 'The Build',
        body: [
          'The Build was destined from how it began. A Facebook page dedicated to a dog named Biggie Gotti is where it started. Decades later a Facebook marketplace ad was placed,',
        ],
        figure: {
          src: '/photos/beasty-marketplace.webp',
          alt: 'A Facebook Marketplace conversation headed "Leon \u00b7 I build websites for small businesses that bring more customers", with two members listed: Leon Kelvin Li and Biggie Gotti.',
          caption: 'The Marketplace ad, and the two names on the thread it started.',
        },
      },
      {
        head: 'BEASTY PAGES',
        sub: '(8/1/26)',
        body: [
          '8/1/26, BEASTY PAGES was born. A BEASTY idea is met by a BEASTY individual named Leon and what you see here is how BEASTY PAGES has come to be. Crazy far-fetched ideas make the world what they are today. Electric cars, Ai robots, Cryptocurrency and now a uniquely designed platform envisioned by a dog owner of a BEAST and built by Leon, a \u201cwebsite for small businesses that bring more customers.\u201d',
        ],
      },
    ],
    signoff: 'BEASTYPAGES.com \u00b7 Just a tap away \u2122',
    quote: ['The Universe, ain\u2019t', 'it a motherfucker.', 'God is good.', 'All the time.'],
  },

  /*
    THE CAREFUL ONE.

    Known: the name comes from his dog, and he has said proceeds from membership
    sign-ups are intended to go to it. That is the entire supplied record. The
    cause, the registration, the share of a payment and the tax treatment are all
    unsupplied, so this page names them as missing rather than guessing at any of
    them. Do not soften the third paragraph into an implied cause.
  */
  bprf: {
    title: 'Biggie’s Purple Ribbon Foundation',
    body: [
      'The foundation is named after Biggie, Glenn’s dog. That much is settled, and it is most of what can honestly be said today.',
      'What Glenn has stated is the intention: proceeds from BEASTY membership sign-ups are meant to go toward the foundation. No membership has been sold. Card payments are not connected to this app, so nothing has been charged and no money has reached the foundation or anywhere else.',
      'The rest is not written yet — what the foundation supports, how it is set up, and how much of a payment would reach it. Those are Glenn’s to state, and none of them belong on this page until he does. If the foundation is the reason you were going to join, wait for this page to fill in.',
    ],
    needsGlenn:
      'The foundation’s legal name and registration, the cause it supports, and what share of each membership payment reaches it — none of the three can be printed until he supplies it.',
  },

  /*
    An invitation, not an offer. No rates, splits or exclusivity have been agreed
    with anyone, so the page cannot imply a standing arrangement. The only working
    inbox is the Reserve a Spot form, which saves details and nothing more.
  */
  collabs: {
    title: 'Collaborations',
    body: [
      'The home screen is not only restaurants. Kitchens and food trucks are most of it, but there is an apparel label on there and someone making drinkware. If you run something local, or you make things about local places, there is probably a shape of this that fits.',
      'Nothing is set. No rates, no split, no exclusivity, no minimum — none of that has been agreed with anyone, so treat this as an invitation to talk rather than an offer. Terms get agreed with Glenn directly, before anything runs.',
      'Worth raising: two businesses on the screen running something together, a creator who wants to shoot the places on it, an event with a few of them on one bill. Come with what you have in mind and what you would want out of it.',
      /*
        The form has five fixed fields — business name, what you cook, phone or
        email, city, Instagram — and no free-text box, so it cannot take "what
        you are proposing". Ask for what it can actually hold, and say the rest
        happens on the call. The panel now carries a button that opens it; it
        used to name the form and give no way to reach it.
      */
      'There is no published phone line or email yet. The one inbox that works today is the Reserve a Spot screen. It asks for a business name, what you make, a phone or email, and your city — there is nowhere to type the proposal itself, so put the short version in the "what you make" line and save the rest for when Glenn calls. He replies himself.',
    ],
    needsGlenn:
      'A published phone number or email for collaboration inquiries, and what he is actually prepared to offer a collaborator, before this can be more than a conversation.',
  },

  /*
    There is no payment path. This page therefore says so first, redirects to the
    support that costs nothing, and does not carry a button. The line about people
    asking for money in BEASTY's name is deliberate: a charity name with no
    published details is exactly what someone else would collect against.
  */
  donations: {
    title: 'Donations',
    body: [
      'There is no way to give money yet, and this page is not a collection. Card payments are not connected to the app, nothing can be charged, and there is no account set up to receive a donation. If someone asks you for money in BEASTY’s name right now, it is not coming from here.',
      'The support that is worth something is free anyway. Order from the businesses on the home screen — they set their own prices and you pick up from them directly. Send Glenn a business worth adding. Share the link; the front screen has a button that does it.',
      'When there is somewhere for money to go, this page will say who receives it and what it pays for, in plain terms, before it asks anyone for anything.',
    ],
    needsGlenn:
      'Where a donation would actually go — the foundation or BEASTY itself — plus an account able to receive it, before this page can ask for money.',
  },

  /*
    Not a jobs page. It is instructions for a customer bringing a business in, so
    it answers the four questions that stop a referral: who fits, what the owner
    has to have ready, where to send it, and what happens next.

    NO FEE, NO COMMISSION, NO REWARD. He has floated the idea. Nothing is agreed,
    and a promise made on this page would be his to honor.
  */
  careers: {
    title: 'Bring a business onto the app',
    body: [
      'This page is for a customer who knows a business that belongs on the home screen. The ones that fit are small and run by the people who own them, in one of the cities with a page waiting — Oakland, Richmond, Berkeley, the rest of the Bay Area list, and Las Vegas. Food is most of it: kitchens, food trucks, small counters. It is not only food. There is an apparel label and a drinkware maker on there already.',
      'Three things make an icon possible. Their own menu or product list with their own prices, which they set and nobody else edits. A logo, or any clean image of their mark. And one person who answers a phone or an email.',
      'To send one, open Reserve a Spot and fill it in: the business name, what they make, a phone or email, their city, and an Instagram handle if they have one. A name and a way to reach them is enough to start. There is no queue and no cap, so a good business is not competing with anyone else for a place.',
      'After that it goes to Glenn and he contacts them himself. Nothing is committed until he has — a spot is real only once he has spoken to the owner. Worth telling them a referral is on the way, so the call is not a cold one.',
    ],
    needsGlenn:
      'Whether the person sending a referral gets anything for it — he has floated the idea and nothing is agreed — and where referrals should go if the Reserve a Spot form is not the right inbox.',
  },
}
