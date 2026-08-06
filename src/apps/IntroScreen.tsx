import { useEffect, useRef, useState } from 'react'
import { CITY_PAGES, PARTNER_COUNT } from '../data/cities'
import { OPERATOR, telHref } from '../lib/operator'
import { BEASTY_DIGITS, DIALER_KEYS } from './dialer/keys'
import type { KeyAction, PanelPage } from './dialer/keys'
import { PAGES } from './dialer/copy'
import { EnterMark, PANEL_MARKS, ReviewsMark } from './dialer/glyphs'
import { useScramble } from './dialer/useScramble'
import { KeypadGrid, PersonCircleFill, PhoneFill, RecentsClock, StarFill, VoicemailFill } from './dialer/ios'

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
}

/**
 * How long the stock keypad holds before it is taken over.
 *
 * Three seconds, which is the operator's number and is about right: long enough
 * to stop reading it as a loading state and start wondering why the link opened
 * a dial pad, short enough that nobody taps away.
 */
const HOLD_MS = 3000
/** One key lights per step while BEASTY is spelled across the pad. */
const SPELL_STEP_MS = 95
/** Total length of the takeover, after which the screen is simply ours. */
const CONVERT_MS = 1500

type Stage = 'stock' | 'converting' | 'beasty'

/** The tab bar, in both of its lives. Index-matched. */
const STOCK_TAB_LABELS = ['Favorites', 'Recents', 'Contacts', 'Keypad', 'Voicemail']
const TAB_LABELS = ['About', 'Careers', 'Contact', 'BEASTY', 'Reviews']

export function IntroScreen({ onEnter, onWater, onJoin, onOpen }: Props) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [stage, setStage] = useState<Stage>(reduced ? 'beasty' : 'stock')
  /** How many of the six BEASTY keys have lit so far. */
  const [spelled, setSpelled] = useState(reduced ? BEASTY_DIGITS.length : 0)
  const [panel, setPanel] = useState<PanelPage | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<number[]>([])

  /** Every timer goes through here so unmount can clear all of them. */
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

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
    if (stage !== 'converting') return
    for (let i = 1; i <= BEASTY_DIGITS.length; i++) {
      later(() => setSpelled(i), i * SPELL_STEP_MS)
    }
    later(() => setStage('beasty'), CONVERT_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  /** The scheduled opening. A touch can pre-empt it; see `skip`. */
  useEffect(() => {
    if (reduced) return
    later(() => setStage((s) => (s === 'stock' ? 'converting' : s)), HOLD_MS)
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
    later(then, 300)
  }

  const say = (message: string) => {
    setToast(message)
    later(() => setToast(null), 2000)
  }

  const share = async () => {
    const url = window.location.origin
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BEASTY', url })
        return
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
    } catch {
      setPanel('contacts')
    }
  }

  const run = (action: KeyAction) => {
    if (leaving) return
    switch (action.kind) {
      case 'panel':
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
    stage === 'stock' ? '' : stage === 'converting' ? BEASTY_DIGITS.slice(0, spelled) : 'BEASTY'

  /*
    The takeover itself: every label under every digit resolves out of noise,
    staggered across the pad, while the keys spelling BEASTY light underneath.
    The tab bar goes last so the eye finishes at the bottom of the screen.
  */
  const taking = stage === 'converting'
  const keyLabels = useScramble(
    DIALER_KEYS.map((k) => k.label),
    taking,
    { stagger: 38, duration: 420, delay: 180 },
  )
  const tabLabels = useScramble(TAB_LABELS, taking, { stagger: 46, duration: 380, delay: 620 })

  /*
    During the takeover, show the resolving text; before and after, the truth.

    A label that has not started resolving keeps its OLD text rather than going
    blank. The first build blanked them and the whole pad lost its letters at
    once, which looks like a bug rather than like something being overwritten
    key by key.
  */
  const keyText = (i: number) => {
    if (stage === 'beasty') return DIALER_KEYS[i].label
    if (!taking) return DIALER_KEYS[i].letters
    return keyLabels[i] || DIALER_KEYS[i].letters
  }
  const tabText = (i: number) => {
    if (stage === 'beasty') return TAB_LABELS[i]
    if (!taking) return STOCK_TAB_LABELS[i]
    return tabLabels[i] || STOCK_TAB_LABELS[i]
  }

  return (
    <div className={`dialer is-${stage}${leaving ? ' is-leaving' : ''}`}>
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
      {taking && <div className="dialer-glitch" aria-hidden="true" />}

      <div className="dialer-display">
        {/* Biggie has died; the dog on this screen is a memorial, not a mascot,
            which is worth knowing before anyone edits that artwork. */}
        <img src="/biggie.webp" alt="" className="dialer-biggie" draggable={false} />
        {/*
          aria-live only once the screen has settled. While it is converting the
          field changes seven times in 1.5s, which queued seven announcements —
          "2", "2 3", "2 3 2"… — at a screen-reader user for a decorative effect.
        */}
        <div className="dialer-number" aria-live={stage === 'beasty' ? 'polite' : 'off'}>
          {display}
        </div>
        <p className="dialer-sub">Supply of Goods, Services &amp; awesome Company</p>
      </div>

      <div className="dialer-keys">
        {DIALER_KEYS.map((k, i) => (
          <button
            key={k.digit}
            className={`dialer-key${isLit(stage, spelled, i) ? ' is-lit' : ''}`}
            onClick={() => press(k.action)}
            aria-label={stage === 'beasty' ? `${k.digit}. ${k.label}` : k.digit}
          >
            <span className="dialer-key-digit">
              {k.digit === '*' ? <Asterisk /> : k.digit}
            </span>
            {/* One element, whose text is rewritten as it resolves. Reserving
                the row's height means no key moves while it does. */}
            <span className="dialer-key-sub">{keyText(i)}</span>
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
            <EnterMark size={33} />
          ) : (
            <PhoneFill size={34} color="#fff" />
          )}
        </button>
      </div>

      {panel && (
        <Panel
          page={panel}
          onShare={share}
          onJoin={() => leave(onJoin)}
          onWater={() => leave(onWater)}
          onClose={() => setPanel(null)}
        />
      )}

      {/*
        Five tabs, because that is what the screen it imitates has. They keep
        their stock labels through the performance and pick up ours after.
      */}
      <nav className="dialer-tabs" aria-label="BEASTY">
        <Tab icon={<StarFill />} label={tabText(0)} name={TAB_LABELS[0]} onClick={() => press({ kind: 'panel', page: 'about' })} />
        <Tab icon={<RecentsClock />} label={tabText(1)} name={TAB_LABELS[1]} onClick={() => press({ kind: 'panel', page: 'careers' })} />
        <Tab icon={<PersonCircleFill />} label={tabText(2)} name={TAB_LABELS[2]} onClick={() => press({ kind: 'panel', page: 'contacts' })} />
        <Tab icon={<KeypadGrid />} label={tabText(3)} name={TAB_LABELS[3]} selected onClick={() => press()} />
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
          icon={stage === 'beasty' ? <ReviewsMark /> : <VoicemailFill />}
          label={tabText(4)}
          name={TAB_LABELS[4]}
          badge={stage === 'beasty' ? undefined : 38}
          onClick={() => press({ kind: 'panel', page: 'reviews' })}
        />
      </nav>

      <p className="dialer-foot">
        {PARTNER_COUNT} local businesses. Open tiles in {CITY_PAGES.length} cities.
      </p>
      <div className="dialer-home" aria-hidden="true" />

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
  if (stage !== 'converting' || spelled === 0) return false
  const digit = BEASTY_DIGITS[spelled - 1]
  return DIALER_KEYS[index]?.digit === digit
}

function Panel({
  page,
  onShare,
  onJoin,
  onWater,
  onClose,
}: {
  page: PanelPage
  onShare: () => void
  onJoin: () => void
  onWater: () => void
  onClose: () => void
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
    const first = el.querySelector<HTMLElement>('button, a[href]')
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
    const focusable = [...el.querySelectorAll<HTMLElement>('button, a[href]')].filter(
      (n) => n.offsetParent !== null,
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // Contacts is the one page with no written copy: the operator has not
  // connected a line yet, and inventing one would be the worst kind of filler.
  const body =
    page === 'contacts' ? (
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
        {PAGES[page].body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {/* Shown, not hidden in a comment. A page that needs the operator's
            detail before it is true says so where he will see it. */}
        {PAGES[page].needsGlenn && <p className="dialer-panel-flag">{PAGES[page].needsGlenn}</p>}
        {/* Careers and Collabs both send people to the same form, so both need
            the button. Collabs used to name it and give no way to reach it. */}
        {(page === 'careers' || page === 'collabs') && (
          <button className="dialer-panel-action" onClick={onJoin}>
            {page === 'collabs' ? 'Open Reserve a Spot' : 'Claim a tile'}
          </button>
        )}
        {page === 'donations' && (
          <button className="dialer-panel-action" onClick={onWater}>
            See BEASTY H20
          </button>
        )}
      </>
    )

  const title = page === 'contacts' ? 'Contacts' : PAGES[page].title

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
