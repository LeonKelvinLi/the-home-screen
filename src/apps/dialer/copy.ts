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
  /**
   * Said in place of a body he has not written yet.
   *
   * A chapter with an empty body and no explanation renders as a heading that
   * opens onto nothing, which reads as broken. This says whose it is and that
   * it is coming.
   */
  pending?: string
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

    BUILT, 2026-09-13, alongside the register cards that give it something to
    read. Nothing is captured, nothing is uploaded, and the camera is never
    switched on until someone taps to start it. See apps/QrScanner.tsx.
  */
  camera: {
    title: 'Scan',
    body: [],
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
        - The closing quote swore. He censored it himself on the 26th and
          it is set exactly as he censored it.
    */
    /*
      ONE paragraph stays open. His instruction, 2026-08-26: "you can leave the
      universe the way it is, but can you please drop down the BEASTY & the
      prayer too?" So the Universe is the page's open line and the two that
      followed it are the first two chapters, in his order.
    */
    body: [
      'The Universe, it\u2019s such a mysterious thing. Once you understand how it all works, life is much more of a beautiful place to live with the ones you love.',
    ],
    sections: [
      {
        head: 'The BEASTY Brand',
        body: [
          'The BEASTY brand is the brainchild of a dog owner who came to fully understand the true laws of attraction and placed a wish to the Universe on the beginning days of 2005.',
        ],
      },
      {
        head: 'The Prayer',
        body: [
          '\u201cI wish for the biggest male Pitbull with a big head, a brindle coat like his mother and the most calm and gentle demeanor from a BEAST a family would grow with love.\u201d',
        ],
      },
      {
        head: 'The Story',
        sub: '(It began with Luna\u2026.)',
        /*
          HIS TO WRITE, AND NOT WRITTEN YET.

          His email gave this chapter a heading and a parenthetical and no
          body, and on 2026-08-25 he said so: "I have to write this one out
          another time and we can fill it in when it's done."

          The sentence that was here was MINE — a plausible bridge about Luna
          and the litter, in his voice, on his own life. That is the one thing
          this file must not contain. It is gone, and the chapter says it is
          coming rather than pretending to be finished.
        */
        body: [],
        pending: 'Glenn is writing this chapter.',
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
        /* His revision, 2026-08-25: "miracle" not "blessing", "his legend"
           not "his presence", and "others & animals" not "other animals". */
        body: [
          'The Mission was now set into play. How does one thank God and the universe for such a miracle? It was quite simple, share him to the world and use his legend to give back to others & animals in need.',
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
    /* Revised by him, 2026-08-26: "in hindsight, I think we should keep this
       thing PG lol". The word is his censoring, character for character, and
       the block is centred because he asked for that in the same message. */
    quote: ['The Universe, ain\u2019t', 'it a motherf\u2014\u2014-', 'God is good.', 'All the time.'],
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
  },

  /*
    BEASTY Collab: the invitation to food creators, in Glenn's words.

    He sent it on 2026-09-16 ("can you run this through your AI agent and proof
    read it? I want to add this on the Collab button on the landing page") and
    the offer is his own: BEASTY pays for the meal, the creator presents the
    review for BEASTY pages. Proofread only: "Xollab" to "Collab", "Ali we
    ask" to "All we ask", "Small business" to "small businesses", "front the
    entire bill" to "cover the entire bill", and the punctuation.

    The form under it (apps/CollabForm.tsx) is the inbox he asked for: name,
    phone, email and Instagram, emailed to the leads address. It replaces the
    old general-purpose page, which pointed at the Reserve a Spot form because
    there was no other way in.
  */
  collabs: {
    title: 'BEASTY Collab',
    body: [
      'BEASTY pages is looking for foodies to collaborate with and support small businesses anywhere in the Bay Area.',
      'We hope to find hidden gems with you and share the content you create. All we ask is that you present the food review on behalf of BEASTY pages, and we will cover the entire bill!',
      'We meet at the restaurant, speak with the owners and take a few pictures with our BEASTY pages brand ambassadors and mascots, Sade & Munchy. It’s as simple as that. We enjoy the meal together and support the local business. A win-win for all!',
    ],
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
  },

  /*
    Not a jobs page. It is instructions for a customer bringing a business in, so
    it answers the four questions that stop a referral: who fits, what the owner
    has to have ready, where to send it, and what happens next.

    NO FEE, NO COMMISSION, NO REWARD. He has floated the idea. Nothing is agreed,
    and a promise made on this page would be his to honor.
  */
  /*
    CAREERS, revamped on his instruction 2026-08-25.

    His words: "Can you just put looking for affiliates for Website referrals
    like you told me. Keep it simple to the point and put your contact." Then:
    "what you wrote there right now just have it drop down. And then create
    another drop down for make some money now." And: "Maybe you can put they
    get a bonus of some kind if they refer 3 referrals within the same month
    or something. It's to your discretion."

    SO THE PAGE LEADS WITH THE PAID OFFER and the old text — bringing a
    business onto the app, which is a different ask and pays nothing — is now
    a chapter under it rather than the whole page.

    THE MONEY HERE IS LEON'S, NOT BEASTY'S, and the page says so in the first
    line of the chapter. A commission paid by the person building the site is
    not a BEASTY programme, and a reader who assumes it is would be owed it by
    the wrong person.

    The numbers are his to honour and mine to state exactly: 15% of $349 is
    $52.35, and it is written as $52 because that is the figure quoted. The
    three-in-a-month bonus was left to my discretion and is set at $100, which
    is a round number on top of $157 in commission rather than a share of
    anything that needs its own arithmetic.
  */
  /*
    THE APPROVED TEXT, 2026-09-01, PUBLISHED AS APPROVED.

    Glenn wrote the programme, asked for a proofread, Leon sent back the
    reworked version, and Glenn answered "That's better to publish." What is
    below is that version, verbatim — the reworked one, not the draft, because
    the rework is the one that survived their exchange: it says "approved
    increments according to the program's current payout terms" where the
    draft hard-coded $50-or-$100, and "where available and legally permitted"
    on the XRP line.

    THE OLD "MAKE SOME MONEY NOW" SECTION IS GONE, NOT MERGED. It promised a
    flat 15% and about $52 a sale on a $349 website with a $100 three-in-a-
    month bonus; the approved text says 10%-15% on qualifying referred
    projects. Both on one page would be the site quoting two different
    commission terms for the same work, so the approved one stands alone.

    HIS DIAMOND IS NOT AN EMOJI HERE. The approved text reads "BEASTY (gem)
    Member"; this file is plain strings, and the app's own convention — the
    drawn Gem in MembersApp, in its words "an emoji is somebody else's
    typeface" — is why the membership screen draws the mark instead. The word
    "Member" carries the sentence; the mark lives where it can be drawn.

    RENAMED 2026-09-02: BARP became BARK, "BEASTY Affiliate Referral Klub".
    Glenn: "Lmk what you think of this new acronym I came up with" / "You know
    me and my K's"; Leon: "that works perfectly". His note restated the same
    3 / 6 / $1 lines under the new name, so only the name moved. The key that
    opens this page reads MAKE $ now, not CAREERS — see keys.ts.
  */
  careers: {
    title: 'Make some money with BEASTY',
    body: [
      'BEASTY is built around supporting small businesses and the communities they serve. As the platform grows, we want our members to have the opportunity to help expand the BEASTY community — and get rewarded for it.',
      'Through the BEASTY Affiliate Referral Klub (BARK), members can earn points by referring new active users and businesses to the BEASTY platform.',
    ],
    sections: [
      {
        head: 'BARK points system',
        body: [
          'Rewards may be redeemed once you accumulate at least 100 points, in increments of 50 points, whenever you ask. Eligible rewards are paid according to the program\u2019s current payout terms, and any remaining eligible points will be paid out when the program officially ends, subject to the program terms.',
          'Eligible rewards may be paid by direct deposit or, where available and legally permitted, converted into XRP for digital payment.',
          'To participate in BARK, individuals must meet the program\u2019s eligibility requirements, become a BEASTY Member, and complete the required tax documentation.',
          'BARK is a limited promotional program and may be modified or discontinued in accordance with its official terms.',
          'By growing an ecosystem that connects small businesses with their customers and communities, BEASTY aims to create value for participating members while also supporting the mission of Biggie\u2019s Foundation.',
        ],
        facts: [
          /* Glenn, 2026-10-26: 10 points a month per referral, for 2 or 3 months per member
             (BIGGIE or BEASTY PASS) and 6 per business; cash out from 100 in steps of 50.
             It was 3 per user and 9 per business, once (shared/affiliate-terms.ts). */
          '10 points a month for each new member you refer: 2 months on a BIGGIE PASS, 3 on a BEASTY PASS',
          '10 points a month for each new business you refer, for its first 6 paid months ($60)',
          '1 point = $1',
          'No limit to the points you can earn',
          'Points are non-transferable',
          'Cash out from 100 points, in steps of 50; save them as long as you like',
        ],
      },
      {
        head: 'BEASTY Designs Referral Program',
        body: [
          'In addition to BARK, BEASTY offers direct referral commissions for eligible BEASTY Design services.',
          'Members may earn 10%\u201315% commission on qualifying referred projects after the work has been completed and payment has been received.',
          'BEASTY Design services are provided by the same independent creator and developer behind the BEASTY platform.',
          'Help businesses discover BEASTY, grow the community, and get rewarded for the value you help create.',
        ],
        /* designs@beastypages.com, not the Gmail: Glenn, 2026-09-02, "replacing
           your email address on the BEASTY designs referral program with your
           beastypages.com email address ... won't get mixed up with your
           current emails." The address is the one he proposed for the Designs
           side when the Workspace was set up. */
        after: 'Leon Kelvin Li \u2014 designs@beastypages.com',
      },
      {
        head: 'Bring a business onto the app',
        sub: '(no commission)',
        body: [
          'This one is for a customer who knows a business that belongs on the home screen. The ones that fit are small and run by the people who own them, in one of the cities with a page waiting — Oakland, Richmond, Berkeley, the rest of the Bay Area list, and Las Vegas. Food is most of it: kitchens, food trucks, small counters. It is not only food. There is an apparel label and a drinkware maker on there already.',
          'Three things make an icon possible. Their own menu or product list with their own prices, which they set and nobody else edits. A logo, or any clean image of their mark. And one person who answers a phone or an email.',
          'To send one, open Reserve a Spot and fill it in: the business name, what they make, a phone or email, their city, and an Instagram handle if they have one. A name and a way to reach them is enough to start. There is no queue and no cap, so a good business is not competing with anyone else for a place.',
          'After that it goes to Glenn and he contacts them himself. Nothing is committed until he has — a spot is real only once he has spoken to the owner. Worth telling them a referral is on the way, so the call is not a cold one.',
        ],
      },
    ],
  },
}
