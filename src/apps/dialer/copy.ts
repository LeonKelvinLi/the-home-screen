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
    body: [
      'BEASTY is Glenn Malicdem, working out of Richmond, California. The line under the name — Supply of Goods, Services and awesome Company — is his own, and he means all three parts of it.',
      'He had a dog called Biggie. Walking Biggie is how he got to know this place: the same streets every day, the same people, the small businesses you only ever find on foot. Biggie is gone now. The way Glenn says it, Biggie is in heaven, watching him work hard for him. The dog on the front screen is Biggie. He is a memorial, not a mascot.',
      /*
        Scoped, because the unscoped version was false four different ways.

        Not every icon is a business — the grid also carries Cart, Orders,
        Search, Settings and nine pages of empty tiles. Not all of them are
        local: Alli's Dog Walking says in its own data that it works in
        Philadelphia and southern New Jersey. Four have no menu at all
        (contactOnly, items: []), so they open on a contact card. And one cart
        does not span all of them: Noctilucente is quoteOnly and suppresses
        add-to-cart everywhere. ReserveApp states this correctly as "across
        every kitchen here"; that qualifier is what was missing.
      */
      'The app is that walk, put on a phone. Most of the icons are kitchens, and opening one puts you in their menu at their prices — they set those themselves, and nobody else edits them. One cart runs across every kitchen on the screen, so ordering from three of them is one checkout instead of three. A few icons are not kitchens and open on a contact card instead.',
      'It opens on a dial pad because BEASTY is what the keys spell: 2-3-2-7-8-9. Behind it are pages for Oakland, Richmond, Berkeley and the rest of Glenn’s list — nine Bay Area cities and, now, Las Vegas. Most of them start empty. An empty page is the honest version — it means nobody there has signed up yet, and it is what he shows a business owner to say the space is theirs.',
    ],
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
