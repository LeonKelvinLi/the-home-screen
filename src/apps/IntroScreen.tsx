import { useEffect, useRef, useState } from 'react'
import { CITY_PAGES, PARTNER_COUNT } from '../data/cities'
import { OPERATOR, telHref } from '../lib/operator'
import { BEASTY_DIGITS, DIALER_KEYS } from './dialer/keys'
import type { KeyAction, PanelPage } from './dialer/keys'
import { PAGES, type AboutSection } from './dialer/copy'
import { recentVisits, whenLabel } from '../lib/recents'
import { favorites, isFavorite, toggleFavorite } from '../lib/favorites'
import { CameraMark, EnterMark, KEY_MARKS, PANEL_MARKS, ReviewsMark, ShareMark } from './dialer/glyphs'
import { Gem } from './MembersApp'
import { QrScanner, beastyPathFrom } from './QrScanner'
import { CollabForm } from './CollabForm'
import { PagesMark } from './dialer/PagesMark'
import { useScramble } from './dialer/useScramble'
import { KeypadGrid, PersonCircleFill, PhoneFill, RecentsClock, StarFill, VoicemailFill } from './dialer/ios'
/**
 * Biggie's posts, WHOLE — the Instagram card, not a crop of the picture in it.
 *
 * His idea: "make the landing page flip from a Biggie picture to yellow every
 * two seconds… Have at least 3 different pictures rotating." Then, once he saw
 * it: "keep the entire Instagram background with it. Basically put it on there
 * exactly like as you see with the dates and BEASTY_pages above."
 *
 * So the handle, the avatar, the likes, his caption and the date all stay. That
 * context is the point — "there are a lot of prominent people in these
 * pictures", and a bare crop threw away the part that proves it.
 *
 * `bg` is the letterbox. These are drawn with `background-size: contain`, since
 * "the entire Instagram background" is not kept by cropping it, and the colour
 * is sampled from the file so the fill is invisible against the card.
 *
 * `light` is MEASURED, not judged: tools/make-landing-photo.py prints the mean
 * brightness of the bottom fifth of each card, which is the strip the tab bar
 * sits on. Instagram's chrome is near-white, and the tab bar inverts to white
 * ink when a picture is up — the treatment written for dark photographs of
 * dogs, which on these would be white-on-white. See .dialer.is-lightphoto.
 */
const LANDING_PHOTOS = [
  { src: '/landing/biggie-1.webp', bg: '#f5f6f5', light: true },
  { src: '/landing/biggie-2.webp', bg: '#f5f6f5', light: true },
  { src: '/landing/biggie-3.webp', bg: '#f5f6f5', light: true },
  { src: '/landing/biggie-4.webp', bg: '#f5f6f5', light: true },
  /* "Maybe add these to the landing page reel?" — 2026-09-06, two more of his
     own @beasty_pages posts with Biggie, and "They're the hottest they've ever
     been since the Michael movie release." Leon said yes that night; they are
     slots 5 and 6. Both measured light at the foot, like the four before. */
  { src: '/landing/biggie-5.webp', bg: '#f5f6f5', light: true },
  { src: '/landing/biggie-6.webp', bg: '#f5f6f5', light: true },
]


/**
 * The landing screen: a dialer that starts as the phone's own and becomes ours.
 *
 * For the first three seconds this is the stock iOS Phone keypad, as faithfully
 * as a web page can manage — white, grey keys, green call button, five standard
 * tabs. That is deliberate and it is the operator's idea: someone opening the
 * link should wonder for a moment why they are looking at a dial pad. Then it is
 * taken over. The keys spelling BEASTY light in order (2-3-2-7-8-9) and the
 * small letters under every digit resolve into his menu — ABC becomes CONTACTS,
 * DEF becomes BPRF, and so on down the pad.
 *
 * That substitution is the whole design. A telephone keypad has carried a
 * twelve-item menu under its digits since the 1960s, so a customer already
 * knows how to read it; the screen only has to change the words.
 *
 * Nothing is hidden behind the delay: no data is collected during it, and any
 * touch skips the performance and lands on the finished screen immediately.
 * Reduced motion never sees it at all.
 */

interface Props {
  onEnter: () => void
  onWater: () => void
  /** Enter and land straight on the Reserve screen. */
  onJoin: () => void
  /** Enter and land on a named app — the keypad opens several directly. */
  onOpen: (appId: string) => void
  /**
   * Start on the finished screen, with no takeover.
   *
   * Coming BACK from the app is the ordinary case and it should be instant —
   * sitting through seven seconds every time you tap back is a toll, not a
   * treat. The sequence still plays on a first visit, and Settings has a row
   * that replays it deliberately.
   */
  skipIntro?: boolean
  /**
   * A panel to open on arrival. The Collab link (beastypages.com/collab) lands
   * on the invitation rather than on a keypad the creator has never seen.
   */
  openPanel?: PanelPage
}

/**
 * How long the stock keypad holds before it is taken over.
 *
 * Long enough to stop reading as a loading state and start reading as "why has
 * this link opened a dial pad", short enough that nobody taps away first. Three
 * seconds was the original brief and proved too long once the takeover itself
 * grew to 2.6s — the whole sequence ran to nearly six seconds before anyone
 * could do anything.
 */
const HOLD_MS = 1800
/*
  The takeover, in four acts.

  The whole point of the shape is that the corruption happens to the PHONE'S OWN
  white keypad, and then the screen dies before anything is revealed — so the
  answer arrives out of the dark rather than fading up underneath the noise. An
  earlier version washed to yellow while the labels were still resolving, which
  showed the customer the menu and the brand at the same time as the glitch, and
  spent the surprise before the blackout could pay it off.

    corrupt  the white keypad is attacked; something dials 2-3-2-7-8-9 on its
             own; every label churns but NEVER settles
    down     the screen collapses the way a CRT powers off — to a bright line,
             then a dot
    black    nothing. This is the longest silence in the sequence and it is
             doing the most work
    up       the picture opens back out, and it is ours
*/
const CORRUPT_MS = 2400
const DOWN_MS = 750
/* 2800. The operator asked for another second of dark "to build more distress
   and confusion" — and he is right that the silence is the part doing the work.
   Any touch still skips the whole thing. */
const BLACK_MS = 2800
/* 1800. It was already slower than the 750ms power-down on purpose; at nearly
   two and a half times it, the return reads as a tube warming rather than a
   screen switching on — which is the whole difference the operator is asking
   for when he says it opens too quick. */
const UP_MS = 1800

/** One key lights per step while something dials BEASTY across the pad. */
const SPELL_STEP_MS = 150
/** How long the pad is corrupted before the dialling starts. */
const SPELL_DELAY_MS = 420

type Stage = 'stock' | 'corrupt' | 'down' | 'black' | 'up' | 'beasty'

/** The tab bar, in both of its lives. Index-matched. */
const STOCK_TAB_LABELS = ['Favorites', 'Recents', 'Contacts', 'Keypad', 'Voicemail']
/*
  Recent and Scan, not Careers and Contact.

  Careers was already key 9 — the operator spotted it on the landing page twice
  — and a tab slot is for something opened every visit rather than once. Recent
  keeps the stock clock doing the stock thing, and Scan is the camera.
*/
/*
  Slot four was BEASTY, and BEASTY is the screen you are already looking at — a
  tab that selects the current page, doing nothing when tapped. The operator
  spotted it as wasted space and he was right, so it is the profile now.

  It only becomes the profile AFTER the takeover. While the screen is still
  pretending to be the phone's own dialer it stays the keypad tab, selected,
  because a stock iOS dialer has a Keypad tab that is lit and that illusion is
  the whole opening.
*/
const TAB_LABELS = ['Favorites', 'Recent', 'Scan', 'Profile', 'Reviews']

export function IntroScreen({ onEnter, onWater, onJoin, onOpen, skipIntro, openPanel }: Props) {
  const reduced =
    skipIntro ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const [stage, setStage] = useState<Stage>(reduced ? 'beasty' : 'stock')
  /** How many of the six BEASTY keys have lit so far. */
  const [spelled, setSpelled] = useState(reduced ? BEASTY_DIGITS.length : 0)
  const [panel, setPanel] = useState<PanelPage | null>(openPanel ?? null)
  /* The panel the link opened, until someone closes or changes it. */
  const arrivedOn = useRef<PanelPage | null>(openPanel ?? null)
  const closePanel = () => {
    arrivedOn.current = null
    setPanel(null)
  }
  /** The BEASTY PAGES bar's dropdown. Closed on every fresh arrival. */
  const [domainOpen, setDomainOpen] = useState(false)
  /*
    THE LANDING FLIP, his idea: "make the landing page flip from a Biggie
    picture to yellow every two seconds… every time it flips into a picture just
    use a different picture. Have at least 3 different pictures rotating."

    Four, cropped from his own Instagram to the phone's shape. `photo` is null
    while the yellow is showing and an index while a picture is, so one piece of
    state carries both halves of the alternation and they cannot disagree.
  */
  const [photo, setPhoto] = useState<number | null>(null)
  /*
    The highest picture reached, so the ones after it are not fetched yet.

    All four used to be given a background-image at mount. A hidden element is
    still a rendered one, so the browser pulled every file at once — and once
    these were rebuilt at the phone's real pixel grid that became 669KB
    arriving before the first flip, on a screen whose entire job is the first
    few seconds. Now it holds the current picture and the NEXT one, which is
    two seconds of warning: far more than a decode needs, and the flip has
    never been seen to arrive empty.
  */
  const [reached, setReached] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  /** True when a touch cut the sequence short, so nothing animates in after. */
  const [skipped, setSkipped] = useState(false)
  const timers = useRef<number[]>([])

  /** Every timer goes through here so unmount can clear all of them. */
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /*
    The takeover's own timers, tracked separately so a skip can cancel exactly
    those and nothing else.

    Without this, tapping during the blackout set the stage to 'beasty' and then
    a still-pending timer fired setStage('up') on top of it — so the screen went
    BACKWARDS into the power-up it had just been told to skip. Clearing every
    timer instead would also kill the handoff and the toast.
  */
  const seqTimers = useRef<number[]>([])
  const seq = (fn: () => void, ms: number) => {
    seqTimers.current.push(window.setTimeout(fn, ms))
  }
  const cancelSeq = () => {
    seqTimers.current.forEach(clearTimeout)
    seqTimers.current = []
  }
  useEffect(() => cancelSeq, [])

  /*
    The takeover is driven from an EFFECT keyed on the stage, not from inside a
    setState updater.

    Scheduling those seven timers inside the updater looked tidy and was wrong:
    React deliberately calls updater functions twice under StrictMode to surface
    impurity, and both calls saw `stage === 'stock'`, so the guard did not stop
    the second run and fourteen timers were queued. It survived only because
    every one of them happened to be idempotent. An effect runs once per real
    transition, which is what this actually wants.
  */
  useEffect(() => {
    /*
      Only once the screen is BEASTY's. Flipping during the takeover would fight
      the animation that is the whole opening, and there is nothing to flip
      to before the yellow exists.

      Held on yellow for anyone who asked for less motion: a full-screen change
      every two seconds is precisely what that setting is about, and the
      wordmark reads on the yellow, which is its designed state.
    */
    if (stage !== 'beasty') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = 0
    const t = window.setInterval(() => {
      n += 1
      // Odd beats show a picture, even beats the yellow — so each picture gets
      // its own turn and no two in a row are the same.
      //
      // Three seconds a beat, on his note. Two was a touch quick to read a
      // caption and a date before it moved on, which is most of why the whole
      // Instagram card is there.
      if (n % 2) {
        const i = Math.floor(n / 2) % LANDING_PHOTOS.length
        setPhoto(i)
        setReached((r) => Math.max(r, i))
      } else {
        setPhoto(null)
      }
    }, 3000)
    return () => window.clearInterval(t)
  }, [stage])

  useEffect(() => {
    if (stage !== 'corrupt') return
    for (let i = 1; i <= BEASTY_DIGITS.length; i++) {
      seq(() => setSpelled(i), SPELL_DELAY_MS + i * SPELL_STEP_MS)
    }
    seq(() => setStage('down'), CORRUPT_MS)
    seq(() => setStage('black'), CORRUPT_MS + DOWN_MS)
    seq(() => setStage('up'), CORRUPT_MS + DOWN_MS + BLACK_MS)
    seq(() => setStage('beasty'), CORRUPT_MS + DOWN_MS + BLACK_MS + UP_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  /*
    NO AUTO-ENTER.

    This screen used to walk into the app on its own after five idle seconds.
    The operator's call to remove it, and it is the right one: this is a menu
    with twelve destinations on it, and a menu that navigates itself is deciding
    for someone who is still reading. The only thing that enters is a tap.
  */

  /** The scheduled opening. A touch can pre-empt it; see `skip`. */
  useEffect(() => {
    if (reduced) return
    later(() => setStage((s) => (s === 'stock' ? 'corrupt' : s)), HOLD_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*
    Any touch before the screen has settled skips to the settled screen.

    The first build ran the takeover instead, which left the most obvious target
    on the page — a pixel-perfect replica of the green Call button — doing
    nothing for 1.5s when someone pressed it, and then nothing again when they
    pressed it a second time. A person who has decided to act should not be made
    to sit through an animation they did not ask for. Returns true when it
    handled the press, so the caller knows not to also run the action: the
    screen has just changed under their finger and the next press is theirs.
  */
  const skip = (): boolean => {
    if (stage === 'beasty') return false
    cancelSeq()
    /*
      Mark it, so the boot-in is suppressed too.

      Setting the settled stage also fires every arrival animation — the keys
      boot in row by row, the call button and tab bar follow, the wordmark lands
      and a flare blows out. A tap 160ms in showed three olive半-transparent
      keys, no tab bar, half a wordmark and a white flare: an animation the
      person had just asked not to see.
    */
    setSkipped(true)
    setStage('beasty')
    setSpelled(BEASTY_DIGITS.length)
    return true
  }

  /*
    Play the screen out before handing over, the way a call ends rather than
    blinking away. `leaving` also turns off pointer events in CSS — without that
    the screen stayed hit-testable while invisible, so a second tap during the
    fade could open the water site in a new tab while the app entered behind it.
  */
  const leave = (then: () => void) => {
    if (leaving) return
    if (reduced) return then()
    setLeaving(true)
    /*
      Hand over IMMEDIATELY and let this screen fade over the top.

      Waiting 300ms first meant the home screen only began mounting once the
      dialer was already gone, so the two never overlapped and the join was a
      cut. App keeps this component alive for the length of the fade.
    */
    then()
  }

  const say = (message: string) => {
    setToast(message)
    later(() => setToast(null), 2000)
  }

  /** The phone's share sheet where there is one, else the clipboard. */
  const shareLink = async (url: string, title: string, text?: string): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share(text ? { title, text, url } : { title, url })
        return true
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      // Say so. This used to set a flag rendered only inside the Contacts
      // panel, so pressing # SHARE from the keypad copied the link and showed
      // nothing — which on desktop is every visitor, since navigator.share is
      // not there to take over.
      say('Link copied')
      return true
    } catch {
      return false
    }
  }

  const share = async () => {
    if (!(await shareLink(window.location.origin, 'BEASTY'))) setPanel('contacts')
  }

  /*
    Glenn, 2026-09-16, on the Collab panel: "can you add a share button here?
    This will make it a lot easier for me to share to the DM's of Instagram
    foodies." The link opens straight onto this invitation.
  */
  const shareCollab = async () => {
    const url = `${window.location.origin}/collab`
    const shared = await shareLink(
      url,
      'BEASTY Collab',
      'BEASTY pages is looking for Bay Area foodies to collaborate with.',
    )
    if (!shared) say(`Copy this link: ${url.replace(/^https?:\/\//, '')}`)
  }

  const run = (action: KeyAction) => {
    if (leaving) return
    switch (action.kind) {
      case 'panel':
        arrivedOn.current = null
        setPanel((p) => (p === action.page ? null : action.page))
        return
      case 'enter':
        return leave(() => (action.app ? onOpen(action.app) : onEnter()))
      case 'external':
        /*
          A real anchor click, not window.open.

          window.open is what a popup blocker blocks, and blocked it returned
          silently — key 2 and key 6 simply did nothing, with no message. Worse,
          the obvious guard does not work: with `noopener` the spec says
          window.open returns null even on SUCCESS, so there is nothing to test.
          A synthesised click on an <a target="_blank"> is treated as the user
          navigating and is not blocked, and rel carries the same protection —
          this leaves for a site on someone else's platform and must not hand
          it a handle back to this window.
        */
        openExternally(action.url)
        return
      case 'share':
        void share()
    }
  }

  const press = (action?: KeyAction) => {
    if (skip()) return
    if (action) run(action)
  }

  /*
    The number field. Empty while it is pretending — a real keypad shows nothing
    until you dial — then it types BEASTY out as the keys light, and keeps it.
  */
  const display =
    stage === 'stock'
      ? ''
      : stage === 'corrupt'
        ? BEASTY_DIGITS.slice(0, spelled)
        : stage === 'beasty' || stage === 'up'
          ? 'BEASTY'
          : ''

  /*
    The takeover itself: every label under every digit resolves out of noise,
    staggered across the pad, while the keys spelling BEASTY light underneath.
    The tab bar goes last so the eye finishes at the bottom of the screen.
  */
  const taking = stage === 'corrupt'
  /* resolve: false — they churn and never land. The answer is on the far side
     of the blackout, not before it. */
  const keyLabels = useScramble(DIALER_KEYS.map((k) => k.label), taking, {
    stagger: 55,
    duration: 500,
    delay: 180,
    resolve: false,
  })
  const tabLabels = useScramble(TAB_LABELS, taking, {
    stagger: 60,
    duration: 420,
    delay: 700,
    resolve: false,
  })

  /*
    During the takeover, show the resolving text; before and after, the truth.

    A label that has not started resolving keeps its OLD text rather than going
    blank. The first build blanked them and the whole pad lost its letters at
    once, which looks like a bug rather than like something being overwritten
    key by key.
  */
  const ours = stage === 'up' || stage === 'beasty'
  const keyText = (i: number) => {
    if (ours) return DIALER_KEYS[i].label
    if (!taking) return DIALER_KEYS[i].letters
    return keyLabels[i] || DIALER_KEYS[i].letters
  }
  const tabText = (i: number) => {
    if (ours) return TAB_LABELS[i]
    if (!taking) return STOCK_TAB_LABELS[i]
    return tabLabels[i] || STOCK_TAB_LABELS[i]
  }

  return (
    <div
      className={`dialer is-${stage}${photo !== null ? ' is-photo' : ''}${
        photo !== null && LANDING_PHOTOS[photo].light ? ' is-lightphoto' : ''
      }${leaving ? ' is-leaving' : ''}${
        skipped || reduced ? ' is-instant' : ''
      }`}
    >
      {/*
        NO FAKE STATUS BAR, AND NO DYNAMIC ISLAND.

        Both were here and both were wrong the moment this ran on a real phone:
        the device already draws a status bar and a notch above the browser, so
        the page drew a second clock and a second island directly underneath the
        real ones. Two status bars is the thing that breaks the illusion, not
        the thing that creates it — and they were costing ~90px of height on the
        one screen that has none to spare.

        The shell behind this keeps its own StatusBar, and that is right: there
        the app IS the phone screen. Here it is a page in a browser.
      */}
      {/*
        The takeover's own layer: a scanline sweep and a colour-split flicker,
        over the top of everything for the length of it. Decorative, mounted
        only while it runs, and never in the way of a tap.
      */}
      {/*
        The phosphor.

        1.8 seconds of absolutely flat black on a web page does not read as
        drama, it reads as a bug — the page looks like it failed. A real tube
        does not go dark instantly either: the dot the picture collapsed into
        keeps glowing and decays. This is that glow, and it is the difference
        between "the screen died" and "the site is broken".
      */}
      {(stage === 'down' || stage === 'black') && (
        <span className="dialer-phosphor" aria-hidden="true" />
      )}

      {taking && (
        <div className="dialer-glitch" aria-hidden="true">
          {/*
            Three bands that invert and shove what is behind them sideways.

            backdrop-filter, so they corrupt the real pixels underneath rather
            than drawing a picture of corruption on top — that is the difference
            between reading as a broken signal and reading as a decoration. They
            are composited, so they cost no layout and no repaint of the keypad.
          */}
          <span className="glitch-band" />
          <span className="glitch-band" />
          <span className="glitch-band" />
        </div>
      )}

      {/*
        The picture itself, so it can be collapsed and reopened as one thing.

        The root behind it is BLACK — it is the screen being off. Everything
        that is "the display" lives in here and carries its own background, so
        the power-down reveals black rather than fading to it, and the power-up
        opens onto yellow that was never visible before.
      */}
      <div className="dialer-crt">
        {/*
          The picture, over the yellow rather than instead of it: the yellow
          stays painted underneath, so the cross-fade has something to fade to
          and there is never a frame of bare page between the two.
        */}
        {LANDING_PHOTOS.map((p, i) => (
          <span
            key={p.src}
            className={`dialer-photo${photo === i ? ' is-on' : ''}`}
            style={
              i <= reached + 1
                ? { backgroundImage: `url(${p.src})`, backgroundColor: p.bg }
                : undefined
            }
            aria-hidden="true"
          />
        ))}
        <div className="dialer-display">
          {/*
            Biggie has died; the dog on this screen is a memorial, not a mascot,
            which is worth knowing before anyone edits that artwork.

            THE TILE IS AN OUTLINE, NOT A FILL — his correction, twice: "make
            beasty pages background all transparent", then "the app outline must
            stay i was just talking about the background… just outline and
            transparent inside thats all."

            I read the first one as the whole mark and took the tile away
            entirely. It is not the mark he wanted gone, it is the yellow behind
            it: the sheet is transparent now and the drawn edge, the turned
            corner and the dog all stay, so the photograph shows through the
            tile instead of being covered by it.

            He wears it once the screen is OURS and is a bare cut-out before
            that. A stock iPhone dialer has no business showing the brand.
          */}
          {ours ? (
            <PagesMark className="dialer-biggie dialer-biggie-mark" />
          ) : (
            <img src="/biggie.webp" alt="" className="dialer-biggie" draggable={false} />
          )}
          {/*
            aria-live only once the screen has settled. While it is converting the
            field changes seven times in 1.5s, which queued seven announcements —
            "2", "2 3", "2 3 2"… — at a screen-reader user for a decorative effect.
          */}
          {/*
            The word lands letter by letter when the picture comes back, rather
            than simply being there. It is the first thing on the other side of
            the blackout, so it gets to arrive.
          */}
          {/* One pulse of light behind the word as it lands, gone in half a
            second. The screen has just come back from dead, so it gets one
            moment of being a bit too bright. */}
        {stage === 'beasty' && !skipped && <span className="dialer-bloom" aria-hidden="true" />}
          {/*
            The wordmark is GONE once the screen is ours, on the operator's
            note: "there are already two BEASTY there and it can come across as
            redundant." He is right — the mark above it is the brand and the bar
            below it says BEASTY PAGES, so the word between them was the third
            time of asking in a column three items tall.

            The element stays for the stages before the takeover, because that
            is a dialled number and not a wordmark. What it loses with it is the
            letter-by-letter landing, which was the beat the takeover turned on;
            the mark now carries that moment instead, fading and lifting in on
            the same cue.
          */}
          {!ours && (
            <div className="dialer-number" aria-live="off">
              {display}
            </div>
          )}
          {/*
            The domain, below the wordmark, exactly where the operator drew it —
            and only once the screen is OURS. A stock dialer has no branded bar,
            and the takeover is the whole opening.

            His copy, lightly repaired for grammar and closed with the line he
            picked as the motto.
          */}
          {ours && (
            <div className="dialer-domain">
              <button
                className="dialer-domain-bar"
                onClick={() => setDomainOpen((o) => !o)}
                onKeyDown={(e) => {
                  // Escape is what everything else in this app closes with.
                  if (e.key === 'Escape' && domainOpen) {
                    e.stopPropagation()
                    setDomainOpen(false)
                  }
                }}
                aria-expanded={domainOpen}
                aria-controls="beasty-pages-note"
              >
                {/*
                  Split down the middle, his design: "the left side is a yellow
                  bar with BEASTY in black font and the right side just the way
                  it is. Basically like a yellow black pill."

                  Two spans rather than one string with a background trick, so
                  each half owns its own colours and the seam lands exactly
                  between the words at any font size.
                */}
                <span className="dialer-domain-half is-light">BEASTY</span>
                <span className="dialer-domain-half is-dark">PAGES</span>
              </button>
              {domainOpen && (
                <>
                  {/*
                    A scrim, because the panel sits over the keypad with nothing
                    behind it to catch a tap. Opened once, it could not be
                    closed: tapping away did nothing, Escape did nothing, and
                    the panel swallowed taps meant for 1 ABOUT and 2 INSTAGRAM
                    underneath it. Transparent, so the keypad stays visible —
                    this is a dismiss target, not a dimmer.
                  */}
                  <div
                    className="dialer-domain-scrim"
                    onClick={() => setDomainOpen(false)}
                    aria-hidden="true"
                  />
                  {/*
                    His revision, 2026-08-14, near enough verbatim — and the
                    domain moved in here with it. It used to print on every
                    city's yellow sheet; his call was "eliminate it completely
                    on the yellow pages for each city... as long as it's on the
                    landing page somewhere I think that will do", then "put it
                    in the centre of the drop-down bubble".

                    The gem is the drawn one rather than the emoji character he
                    typed, for the same reason the member card uses it: an emoji
                    renders as a different object on every platform, and this one
                    means a membership tier.
                  */}
                  <div className="dialer-domain-drop" role="note" id="beasty-pages-note">
                    A familiar screen filled with local gems and viral eats await your discovery.
                    Explore growing pages of BEASTY{' '}
                    <Gem size={13} /> affiliates and save money with your support.
                    <span className="dialer-domain-domain">
                      BEASTYPAGES.com{' '}
                      <span className="dialer-domain-tagline">
                        • Just a tap away<sup>™</sup>
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="dialer-keys">
          {DIALER_KEYS.map((k, i) => (
            <button
              key={k.digit}
              className={`dialer-key${isLit(stage, spelled, i) ? ' is-lit' : ''}`}
              onClick={() => press(k.action)}
              aria-label={stage === 'beasty' ? `${k.digit}. ${k.label}` : k.digit}
            >
              {/*
                DIGIT WHILE IT IS A PHONE, MARK ONCE IT IS NOT — "fill these
                circles rather the numbers."

                The swap happens at the same moment the labels resolve, so the
                opening still works: it has to be a believable keypad first for
                the turn into BEASTY to land at all. Both are rendered and one
                is faded out, rather than swapped, so no key changes size mid
                transition.
              */}
              {/*
                THE SPIN. His ask: "make each number starting from #1 to spin a
                few times until it settles into the icon you created. Maybe do
                it all at once with all the numbers?"

                All at once, but not in lockstep — each key is delayed by its
                own index, so the row reads as a departure board rolling over
                rather than twelve things doing one thing. `--spin-i` carries
                that index to CSS; the keyframes are there.

                The digit and the mark are BOTH mounted and the card is flipped,
                which is what lets a number turn into a picture without either
                the key or the label moving a pixel while it happens.
              */}
              <span
                className="dialer-key-digit"
                style={{ '--spin-i': i } as React.CSSProperties}
              >
                {stage === 'beasty' && k.mark ? (
                  (() => {
                    const Mark = KEY_MARKS[k.mark]
                    return <Mark size={30} />
                  })()
                ) : k.digit === '*' ? (
                  <Asterisk />
                ) : (
                  k.digit
                )}
              </span>
              {/* One element, whose text is rewritten as it resolves. Reserving
                  the row's height means no key moves while it does.

                  --sub-len is how long the label currently is, handed to CSS so
                  the type can be sized to fit the KEY rather than to a fixed
                  number. A key is a circle, so the room a label actually has is
                  the chord where it sits, which is narrower than the diameter —
                  and the labels grew from ABC and DEF to FOUNDATION without the
                  size ever being revisited. */}
              <span
                className="dialer-key-sub"
                style={{ '--sub-len': (keyText(i) ?? '').length || 1 } as React.CSSProperties}
              >
                {keyText(i)}
              </span>
            </button>
          ))}
        </div>

        <div className="dialer-call-row">
          {/*
            The way in. Green in both lives — the operator's own mock keeps it
            green, and it is the same button in the same place, so nobody has to
            find it again after the screen changes under them.
          */}
          <button
            className="dialer-call"
            onClick={() => press({ kind: 'enter' })}
            aria-label={stage === 'beasty' ? 'Enter BEASTY' : 'Call'}
          >
            {/* Same button, same place, same green — but a handset means "call"
                and this one enters an app, so once the pretence is over it says
                what it does. */}
            {stage === 'beasty' ? (
              /*
                THE ICON, THEN THE WORD, THEN THE ICON AGAIN.

                His problem, in his words: "I've been seeing people stare at
                this paging not knowing that green stands for enter. Some people
                are slow and don't get it." His fix, and Leon's confirmation of
                the face: "maybe make it flip to say ENTER then flip back to the
                icon" / "same fonts of BEASTY PAGES".

                A flip rather than a glow because a glow says LOOK and this
                needs to say WHAT. The arrow alone is a guess; the word is not.

                Both faces are rendered and rotated as one card, so the button
                never resizes and the green disc stays exactly where it is.
              */
              <span className="dialer-call-flip">
                <span className="dialer-call-face is-icon">
                  <EnterMark size={39} />
                </span>
                <span className="dialer-call-face is-word">ENTER</span>
              </span>
            ) : (
              <PhoneFill size={34} color="#fff" />
            )}
          </button>
        </div>

        {/*
          The other half of the centring.

          `.dialer-display` above the keypad is a growing flex item, so on its own
          it swallowed every spare pixel and the pad rode high with a hole beneath
          it. This grows at the same rate, so the slack splits evenly and the
          keypad sits centred between the top of the viewport and the tab bar.
        */}
        <div className="dialer-spacer" aria-hidden="true" />

        {panel && (
          <>
            {/* Tapping outside was a no-op: there was no backdrop element at all,
                so the only exits were the close button and the tab bar. */}
            <div className="dialer-scrim" onClick={closePanel} aria-hidden="true" />
          </>
        )}
        {panel && (
          <Panel
            page={panel}
            onShare={share}
            onShareCollab={shareCollab}
            onJoin={() => leave(onJoin)}
            onWater={() => leave(onWater)}
            onClose={closePanel}
            onOpenBrand={(id) => leave(() => onOpen(id))}
            focusDialog={panel === arrivedOn.current}
          />
        )}

        {/*
          Five tabs, because that is what the screen it imitates has. They keep
          their stock labels through the performance and pick up ours after.
        */}
        <nav className="dialer-tabs" aria-label="BEASTY">
          {/* Keeps the stock name because it is going to do the stock thing — a star
              on each partner's page, tapped as you visit. About is still one tap
              away on key 1, so nothing is lost by giving this tab back. */}
          <Tab icon={<StarFill />} label={tabText(0)} name={TAB_LABELS[0]} onClick={() => press({ kind: 'panel', page: 'favorites' })} />
          {/* Recent, not Careers — Careers is already key 9, and the clock keeps
              doing what a clock on a phone's second tab does. */}
          <Tab
            icon={<RecentsClock />}
            label={tabText(1)}
            name={TAB_LABELS[1]}
            onClick={() => press({ kind: 'panel', page: 'recent' })}
          />
          {/* The camera. A code scanner rather than a photo app: point it at a
              partner's code and it opens that business. */}
          <Tab
            icon={ours ? <CameraMark /> : <PersonCircleFill />}
            label={tabText(2)}
            name={TAB_LABELS[2]}
            onClick={() => press({ kind: 'panel', page: 'camera' })}
          />
          <Tab
            icon={ours ? <PersonCircleFill /> : <KeypadGrid />}
            label={tabText(3)}
            name={TAB_LABELS[3]}
            /* Lit only while it is still the stock keypad tab. Once it is the
               profile it is a place to go, not a statement of where you are. */
            selected={!ours}
            onClick={() => (ours ? leave(() => onOpen('sys.profile')) : press())}
          />
          {/*
            The badge is the stock screen's unread count while it is pretending,
            and the number of cities with tiles still open once it is not. A made
            up "38" that stayed put would be the one dishonest thing on screen.
          */}
          {/*
            Voicemail becomes Reviews: what customers say, left for whoever comes
            next. The 38 badge is the stock screen's unread count and it belongs
            to the pretence — it goes when the pretence does, because there are no
            reviews yet and a number over an empty page is a lie about the page.
          */}
          <Tab
            icon={ours ? <ReviewsMark /> : <VoicemailFill />}
            label={tabText(4)}
            name={TAB_LABELS[4]}
            /* `ours`, not `beasty`. Keyed on the settled stage the invented "38"
             survived the whole 950ms power-up, sitting on the fully branded
             screen over a tab already labelled Reviews — the one thing on it
             that was not true. */
          badge={ours ? undefined : 38}
            onClick={() => press({ kind: 'panel', page: 'reviews' })}
          />
        </nav>

        <p className="dialer-foot">
          {PARTNER_COUNT} local businesses. Open tiles in {CITY_PAGES.length} cities.
        </p>
        <div className="dialer-home" aria-hidden="true" />
      </div>

      {toast && (
        <div className="dialer-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

/** Open a link the way a person clicking one would, so nothing blocks it. */
function openExternally(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/**
 * The keypad asterisk.
 *
 * Not the ASCII one. U+002A is a five-armed glyph that sits high in the em box,
 * against the cap line — on a 88pt key it measured half the size of the digits
 * beside it and 13pt above the centre. A phone keypad draws a six-armed star,
 * optically centred, the same visual weight as a numeral.
 */
function Asterisk() {
  return (
    <svg viewBox="0 0 24 24" width="0.55em" height="0.55em" fill="currentColor" aria-hidden="true">
      <path d="M12 1.6a1.9 1.9 0 0 1 1.9 1.9v5.24l4.54-2.62a1.9 1.9 0 1 1 1.9 3.3L15.8 12l4.54 2.62a1.9 1.9 0 1 1-1.9 3.3L13.9 15.3v5.24a1.9 1.9 0 1 1-3.8 0V15.3l-4.54 2.62a1.9 1.9 0 1 1-1.9-3.3L8.2 12 3.66 9.38a1.9 1.9 0 1 1 1.9-3.3L10.1 8.7V3.5A1.9 1.9 0 0 1 12 1.6Z" />
    </svg>
  )
}

/**
 * Which key is lit right now.
 *
 * BEASTY contains two 2s, so matching on the digit alone lights both at once.
 * Match on the pad INDEX of the letter currently being spelled instead.
 */
function isLit(stage: Stage, spelled: number, index: number): boolean {
  if (stage !== 'corrupt' || spelled === 0) return false
  const digit = BEASTY_DIGITS[spelled - 1]
  return DIALER_KEYS[index]?.digit === digit
}

/**
 * One business, with the star that promotes it to Favorites.
 *
 * The star is a separate button INSIDE the row rather than a swipe or a long
 * press, because both of those are invisible — a customer has to be told they
 * exist. A visible outline that fills when tapped needs no explaining.
 */
function BrandRow({
  brand,
  onOpen,
  onStarred,
}: {
  /* The stored snapshot, NOT a catalogue lookup — see lib/recents.ts. */
  brand: { brandId: string; name: string; cuisine: string; color: string }
  onOpen: (brandId: string) => void
  onStarred?: () => void
}) {
  const [starred, setStarred] = useState(() => isFavorite(brand.brandId))
  return (
    <div className="explore-row-wrap">
      <button className="explore-row" onClick={() => onOpen(brand.brandId)}>
        <span className="explore-mark" style={{ background: brand.color }} />
        <span className="explore-text">
          <strong>{brand.name}</strong>
          <em>{brand.cuisine}</em>
        </span>
      </button>
      <button
        className={`explore-star${starred ? ' is-on' : ''}`}
        aria-label={starred ? `Remove ${brand.name} from Favorites` : `Add ${brand.name} to Favorites`}
        aria-pressed={starred}
        onClick={() => {
          setStarred(toggleFavorite(brand))
          onStarred?.()
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M12 2.6 15 8.9l7 .85-5.2 4.85 1.4 7L12 18.15 5.8 21.6l1.4-7L2 9.75l7-.85Z"
            fill={starred ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

/**
 * Favorites — the ones starred from Recent or from a business's own page.
 */
function FavoritesPanel({ onOpen }: { onOpen: (brandId: string) => void }) {
  const [ids, setIds] = useState(() => favorites())
  if (ids.length === 0) {
    return (
      <>
        <p>No favourites yet.</p>
        <p className="dialer-panel-quiet">
          Open a business, and if it was worth going back to, tap its star — on the Recent tab or
          on the business itself. Kept on this phone only, so it will not follow you to another
          one.
        </p>
      </>
    )
  }
  return (
    <>
      {ids.map((f) => (
        <BrandRow key={f.brandId} brand={f} onOpen={onOpen} onStarred={() => setIds(favorites())} />
      ))}
    </>
  )
}

/**
 * Scan — the camera, reading BEASTY codes.
 *
 * Off until tapped, and the copy above it says so before the tap. A code that
 * names a business opens that business, through the same `/?b=` link a shared
 * page uses, so the app, the register credit and the back button all behave
 * as they do for any other arrival. Anything that is not a BEASTY code is
 * refused on screen and never followed.
 */
function ScanPanel({ copy }: { copy: string[] }) {
  const [on, setOn] = useState(false)
  const [refused, setRefused] = useState(false)
  return (
    <>
      {/* Read before the tap; once the camera is on, the panel is the camera,
          or the square and its off button sit below the fold on a phone. */}
      {!on &&
        copy.map((p) => (
          <p key={p}>{p}</p>
        ))}
      {on ? (
        <>
          <QrScanner
            hint="Hold a BEASTY code inside the square."
            onCode={(text) => {
              const path = beastyPathFrom(text)
              if (!path) {
                setRefused(true)
                return false
              }
              window.location.assign(path)
              return true
            }}
          />
          {refused && (
            <p className="dialer-panel-flag" role="status">
              That code is not a BEASTY code, so it was not opened.
            </p>
          )}
          <button className="dialer-panel-action" onClick={() => setOn(false)}>
            Turn the camera off
          </button>
        </>
      ) : (
        <button className="dialer-panel-action" onClick={() => setOn(true)}>
          Start the camera
        </button>
      )}
    </>
  )
}

/**
 * Recent — the businesses this device has actually opened.
 *
 * Grouped by day rather than listed flat, because "Today" and "Yesterday" are
 * what a person is looking for when they open a recents list. Reads
 * localStorage only; see lib/recents.ts for why that is worth saying out loud.
 */
function RecentPanel({ onOpen }: { onOpen: (brandId: string) => void }) {
  const visits = recentVisits()

  if (visits.length === 0) {
    return (
      <>
        <p>Nothing here yet.</p>
        <p className="dialer-panel-quiet">
          The businesses you open show up here, newest first, so you can get back to one without
          hunting the grid for it. Kept on this phone only — nothing is sent anywhere.
        </p>
      </>
    )
  }

  /* One heading per day, in order, rather than a heading on every row. */
  let lastLabel = ''
  return (
    <>
      {visits.map((v) => {
        const label = whenLabel(v.at)
        const heading = label === lastLabel ? null : ((lastLabel = label), label)
        return (
          <div key={v.brandId}>
            {heading && <h3 className="dialer-panel-h">{heading}</h3>}
            <BrandRow brand={v} onOpen={onOpen} />
          </div>
        )
      })}
    </>
  )
}

/**
 * The About page's chapters, closed until tapped.
 *
 * His instruction: the bold headings in his text should "drop down" so the
 * page is not a wall of paragraphs. So every chapter starts closed and the
 * reader opens what they want to read.
 *
 * A real <button> per row rather than a div with a click handler, and the open
 * state on aria-expanded — the panel already traps Tab across
 * `button, a[href]`, so these join that cycle for free and a screen reader is
 * told whether a row is open instead of having to guess from the arrow.
 *
 * The closed rows are not display:none'd away; they are unmounted. A phone
 * reading this has no reason to lay out seven chapters it is not showing.
 *
 * WHY THIS LIVES AT MODULE SCOPE, AND MUST STAY HERE.
 *
 * It used to be declared inside Panel. That reads fine and is broken: a
 * function declared in a render body is a NEW function on every render, so
 * React treats it as a different component, throws the old one away and mounts
 * a fresh one -- with fresh state. The landing screen swaps its photo on a
 * three-second interval, which re-renders Panel, which wiped `open`. So a
 * chapter opened on tap and shut itself within three seconds. That is exactly
 * the glitch Glenn reported. The audit missed it because it read aria-expanded
 *  straight after the click, inside the three seconds.
 */
function PanelSections({ sections }: { sections?: AboutSection[] }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!sections?.length) return null
  return (
    <div className="panel-chapters">
      {sections.map((sec) => {
        const isOpen = open === sec.head
        return (
          <div className={`panel-chapter${isOpen ? ' is-open' : ''}`} key={sec.head}>
            <button
              type="button"
              className="panel-chapter-head"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : sec.head)}
            >
              <span className="panel-chapter-name">
                {sec.head}
                {sec.sub && <em>{sec.sub}</em>}
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="panel-chapter-chev">
                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div className="panel-chapter-body">
                {sec.body.map((t) => (
                  <p key={t}>{t}</p>
                ))}
                {/* A chapter he has not written yet says so, rather than
                    opening onto nothing or onto something written for him. */}
                {sec.pending && <p className="panel-chapter-pending">{sec.pending}</p>}
                {sec.figure && (
                  <figure className="panel-figure">
                    <img src={sec.figure.src} alt={sec.figure.alt} loading="lazy" />
                    <figcaption>{sec.figure.caption}</figcaption>
                  </figure>
                )}
                {sec.facts && (
                  <ul className="panel-facts">
                    {sec.facts.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                {sec.after && <p className="panel-chapter-after">{sec.after}</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


/* What Tab can land on inside a panel. The Collab page carries a form, so
   fields count as well as buttons and links. */
const FOCUSABLE = 'button, a[href], input, select, textarea'

function Panel({
  page,
  onShare,
  onShareCollab,
  focusDialog,
  onJoin,
  onWater,
  onClose,
  onOpenBrand,
}: {
  page: PanelPage
  onShare: () => void
  onShareCollab: () => void
  /**
   * Focus the dialog itself rather than its close button. A panel that a link
   * opened has had no tap yet, and a ring round the close button is the first
   * thing a creator arriving from a DM would see.
   */
  focusDialog?: boolean
  onJoin: () => void
  onWater: () => void
  onClose: () => void
  /** Enter the app on a business's page, from the Recent list. */
  onOpenBrand: (brandId: string) => void
}) {
  const Mark = PANEL_MARKS[page]
  const card = useRef<HTMLDivElement>(null)

  /*
    Make it behave like the dialog it claims to be.

    It carried role="dialog" and none of the behaviour: focus was never moved
    in, Escape did nothing, and it renders after the twelve keys in DOM order —
    so activating "1 ABOUT" put content on screen that a keyboard user then had
    to tab past thirteen controls to reach, while the panel visually covered the
    keys they were tabbing through.
  */
  useEffect(() => {
    const el = card.current
    if (!el) return
    const returnTo = document.activeElement as HTMLElement | null
    const first = focusDialog ? null : el.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? el).focus({ preventScroll: true })
    return () => returnTo?.focus?.({ preventScroll: true })
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const el = card.current
    if (!el) return
    /* A disabled control is skipped by the browser's own Tab, so it cannot be
       the end of the loop: the Collab form's Send is disabled until the form
       is filled, and Tab past the last field would have left the panel. */
    const focusable = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (n) => n.offsetParent !== null && !n.matches(':disabled'),
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === el)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  /* Recent is a LIST of this device's own visits, not prose, so it renders a
     component rather than paragraphs from copy.ts. */
  const listBody =
    page === 'recent' ? (
      <RecentPanel onOpen={onOpenBrand} />
    ) : page === 'favorites' ? (
      <FavoritesPanel onOpen={onOpenBrand} />
    ) : page === 'camera' ? (
      <ScanPanel copy={PAGES.camera.body} />
    ) : null

  // Contacts is the one page with no written copy: the operator has not
  // connected a line yet, and inventing one would be the worst kind of filler.
  const body =
    listBody ??
    (page === 'contacts' ? (
      <>
        {OPERATOR.phone || OPERATOR.email ? (
          <>
            {OPERATOR.phone && <a href={telHref(OPERATOR.phone)}>{OPERATOR.phone}</a>}
            {OPERATOR.email && <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>}
          </>
        ) : (
          <p>
            The phone line and email are not connected yet. Every business on the home screen
            lists its own number.
          </p>
        )}
        <button className="dialer-panel-action" onClick={onShare}>
          Share BEASTY
        </button>
      </>
    ) : (
      <>
        {PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <PanelSections
          sections={PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].sections}
        />
        {/* Shown, not hidden in a comment. A page that needs the operator's
            detail before it is true says so where he will see it. */}
        {PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].needsGlenn && (
          <p className="dialer-panel-flag">
            {PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].needsGlenn}
          </p>
        )}
        {PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].signoff && (
          <p className="panel-signoff">
            {PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].signoff}
          </p>
        )}
        {PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].quote && (
          <blockquote className="panel-quote">
            {PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].quote!.map(
              (line) => (
                <span key={line}>{line}</span>
              ),
            )}
          </blockquote>
        )}
        {/* Careers sends people to Reserve a Spot. Collabs has its own form
            now: the food creators Glenn is inviting, 2026-09-16. */}
        {page === 'careers' && (
          <button className="dialer-panel-action" onClick={onJoin}>
            Claim a tile
          </button>
        )}
        {page === 'collabs' && (
          <button type="button" className="dialer-panel-action collab-share" onClick={onShareCollab}>
            <ShareMark size={16} />
            Share this invitation
          </button>
        )}
        {page === 'collabs' && <CollabForm />}
        {page === 'donations' && (
          <button className="dialer-panel-action" onClick={onWater}>
            See BEASTY H20
          </button>
        )}
      </>
    ))

  const title =
    page === 'contacts'
      ? 'Contacts'
      : page === 'recent'
        ? 'Recent'
        : page === 'favorites'
          ? 'Favorites'
        : PAGES[page as Exclude<PanelPage, 'contacts' | 'recent' | 'favorites'>].title

  return (
    <div
      className="dialer-panel"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      ref={card}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="dialer-panel-head">
        <span className="dialer-panel-mark">
          <Mark size={22} />
        </span>
        <h2>{title}</h2>
        <button className="dialer-panel-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="dialer-panel-body">{body}</div>
    </div>
  )
}

function Tab({
  icon,
  label,
  name,
  selected,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  /** The settled name, so the accessible name is never a scrambled string. */
  name: string
  selected?: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      className={`dialer-tab${selected ? ' is-selected' : ''}`}
      onClick={onClick}
      aria-label={name}
      aria-current={selected ? 'page' : undefined}
    >
      <span className="dialer-tab-icon">
        {icon}
        {badge !== undefined && <span className="dialer-badge">{badge}</span>}
      </span>
      <span className="dialer-tab-label" aria-hidden="true">
        {label}
      </span>
    </button>
  )
}
