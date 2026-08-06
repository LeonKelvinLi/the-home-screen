import { useEffect, useRef, useState } from 'react'
import { CITY_PAGES, PARTNER_COUNT } from '../data/cities'
import { OPERATOR, telHref } from '../lib/operator'
import { StatusBar } from '../ios/StatusBar'
import { BEASTY_DIGITS, DIALER_KEYS } from './dialer/keys'
import type { KeyAction, PanelPage } from './dialer/keys'
import { PAGES } from './dialer/copy'
import { PANEL_MARKS } from './dialer/glyphs'
import { useScramble } from './dialer/useScramble'
import { KeypadGrid, PersonCircleFill, PhoneFill, RecentsClock, StarFill, VoicemailFill } from './dialer/ios'

/**
 * The landing screen: a dialer that starts as the phone's own and becomes ours.
 *
 * For the first few seconds this is the stock iOS Phone keypad, as faithfully
 * as a web page can manage — white, grey keys, green call button, five standard
 * tabs. That is deliberate and it is the operator's idea: someone opening the
 * link should wonder for a moment why they are looking at a dial pad. Then it
 * converts. The keys spelling BEASTY light in order (2-3-2-7-8-9) and the small
 * letters under every digit turn into his menu — ABC becomes CONTACTS, DEF
 * becomes BPRF, and so on down the pad.
 *
 * That substitution is the whole design. A telephone keypad has carried a
 * twelve-item menu under its digits since the 1960s, so a customer already
 * knows how to read it; the screen only has to change the words.
 *
 * Nothing is hidden behind the delay: no data is collected during it, every
 * control works throughout, and touching anything skips straight to the end.
 * Reduced motion skips the performance entirely — someone who asked for less
 * movement should not be made to sit through a set piece.
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
const STOCK_TAB_LABELS = ['Favorites', 'Recents', 'Keypad', 'Contacts', 'Voicemail']
const TAB_LABELS = ['About', 'Careers', 'BEASTY', 'Contact', 'Join']

export function IntroScreen({ onEnter, onWater, onJoin, onOpen }: Props) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [stage, setStage] = useState<Stage>(reduced ? 'beasty' : 'stock')
  /** How many of the six BEASTY keys have lit so far. */
  const [spelled, setSpelled] = useState(reduced ? BEASTY_DIGITS.length : 0)
  const [panel, setPanel] = useState<PanelPage | null>(null)
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<number[]>([])

  /** Every timer goes through here so unmount can clear all of them. */
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /*
    Run the conversion. Guarded, so the scheduled hold and an impatient tap
    cannot both start it and land two overlapping transitions.
  */
  const convert = () => {
    setStage((s) => {
      if (s !== 'stock') return s
      for (let i = 1; i <= BEASTY_DIGITS.length; i++) {
        later(() => setSpelled(i), i * SPELL_STEP_MS)
      }
      later(() => setStage('beasty'), CONVERT_MS)
      return 'converting'
    })
  }

  useEffect(() => {
    if (reduced) return
    later(convert, HOLD_MS)
    // Once, on mount: this is the screen's own opening, not a reaction to
    // anything the customer does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*
    Play the screen out before handing over, the way a call ends rather than
    blinking away. Guarded so a double tap cannot queue two exits.
  */
  const leave = (then: () => void) => {
    if (leaving) return
    if (reduced) return then()
    setLeaving(true)
    later(then, 300)
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
      setCopied(true)
      later(() => setCopied(false), 1800)
    } catch {
      setPanel('contacts')
    }
  }

  const run = (action: KeyAction) => {
    switch (action.kind) {
      case 'panel':
        setPanel((p) => (p === action.page ? null : action.page))
        return
      case 'enter':
        return leave(() => (action.app ? onOpen(action.app) : onEnter()))
      case 'external':
        // noopener/noreferrer: this leaves for a site on someone else's
        // platform, and it must not get a handle back to this window.
        window.open(action.url, '_blank', 'noopener,noreferrer')
        return
      case 'share':
        void share()
    }
  }

  /** Any deliberate touch during the stock phase ends it early. */
  const press = (action?: KeyAction) => {
    if (stage === 'stock') {
      convert()
      return
    }
    if (stage === 'converting') return
    if (action) run(action)
  }

  /*
    The number field. Empty while it is pretending — a real keypad shows nothing
    until you dial — then it types BEASTY out as the keys light, and keeps it.
  */
  const display =
    stage === 'stock' ? '' : stage === 'converting' ? BEASTY_DIGITS.slice(0, spelled) : 'BEASTY'

  /*
    The takeover itself.

    Every label under every digit resolves out of noise, staggered across the
    pad, while the keys spelling BEASTY light in order underneath. The tab bar
    goes last so the eye finishes at the bottom of the screen rather than in the
    middle of it.

    `taking` gates all of it, and is false under reduced motion — where the
    labels are simply correct from the first frame.
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

    A label that has not started resolving yet keeps its OLD text rather than
    going blank. The first build blanked them, and the whole pad lost its
    letters at once while the wave crossed it — which looks like a bug rather
    than like something being overwritten key by key.
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
      <StatusBar dark />
      {/* Hardware, so it never reacts to anything. */}
      <div className="dialer-island" aria-hidden="true" />
      {/*
        The takeover's own layer: a scanline sweep and a colour-split flicker,
        over the top of everything for the length of the conversion. Purely
        decorative, mounted only while it runs, and never in the way of a tap.
      */}
      {taking && <div className="dialer-glitch" aria-hidden="true" />}

      <div className="dialer-display">
        {/* Biggie has died; the dog on this screen is a memorial, not a mascot,
            which is worth knowing before anyone edits that artwork. */}
        <img src="/biggie.webp" alt="" className="dialer-biggie" draggable={false} />
        <div className="dialer-number" aria-live="polite">
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
            <span className="dialer-key-digit">{k.digit}</span>
            {/* One element, whose text is rewritten as it resolves. Reserving
                the row's height means no key moves while it does. */}
            <span className="dialer-key-sub">{keyText(i)}</span>
          </button>
        ))}
      </div>

      <div className="dialer-call-row">
        {/*
          The way in. Green while this is pretending to be the phone's own
          keypad, ours once it is not — but the same button in the same place,
          so nobody has to find it again after the screen changes under them.
        */}
        <button
          className="dialer-call"
          onClick={() => press({ kind: 'enter' })}
          aria-label={stage === 'beasty' ? 'Enter BEASTY' : 'Call'}
        >
          <PhoneFill size={34} color="#fff" />
        </button>
      </div>

      {panel && (
        <Panel
          page={panel}
          copied={copied}
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
        <Tab icon={<StarFill />} label={tabText(0)} onClick={() => press({ kind: 'panel', page: 'about' })} />
        <Tab icon={<RecentsClock />} label={tabText(1)} onClick={() => press({ kind: 'panel', page: 'careers' })} />
        <Tab icon={<KeypadGrid />} label={tabText(2)} selected onClick={() => press()} />
        <Tab icon={<PersonCircleFill />} label={tabText(3)} onClick={() => press({ kind: 'panel', page: 'contacts' })} />
        {/*
          The badge is the stock screen's unread count while it is pretending,
          and the number of cities with tiles still open once it is not. A made
          up "38" that stayed put would be the one dishonest thing on screen.
        */}
        <Tab
          icon={<VoicemailFill />}
          label={tabText(4)}
          badge={stage === 'beasty' ? CITY_PAGES.length : 38}
          onClick={() => press({ kind: 'panel', page: 'careers' })}
        />
      </nav>

      <p className="dialer-foot">
        {PARTNER_COUNT} local businesses. Open tiles in {CITY_PAGES.length} cities.
      </p>
      <div className="dialer-home" aria-hidden="true" />
    </div>
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
  copied,
  onShare,
  onJoin,
  onWater,
  onClose,
}: {
  page: PanelPage
  copied: boolean
  onShare: () => void
  onJoin: () => void
  onWater: () => void
  onClose: () => void
}) {
  const Mark = PANEL_MARKS[page]

  // Contacts is the one page with no written copy: the operator has not
  // connected a line yet, and inventing one would be the worst kind of filler.
  if (page === 'contacts') {
    return (
      <Shell title="Contacts" mark={<Mark size={22} />} onClose={onClose}>
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
          {copied ? 'Link copied' : 'Share BEASTY'}
        </button>
      </Shell>
    )
  }

  const copy = PAGES[page]
  return (
    <Shell title={copy.title} mark={<Mark size={22} />} onClose={onClose}>
      {copy.body.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {/* Shown, not hidden in a comment. A page that needs the operator's
          detail before it is true says so where he will see it. */}
      {copy.needsGlenn && <p className="dialer-panel-flag">{copy.needsGlenn}</p>}
      {page === 'careers' && (
        <button className="dialer-panel-action" onClick={onJoin}>
          Claim a tile
        </button>
      )}
      {page === 'donations' && (
        <button className="dialer-panel-action" onClick={onWater}>
          See BEASTY H20
        </button>
      )}
    </Shell>
  )
}

function Shell({
  title,
  mark,
  onClose,
  children,
}: {
  title: string
  mark: React.ReactNode
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="dialer-panel" role="dialog" aria-label={title}>
      <div className="dialer-panel-head">
        <span className="dialer-panel-mark">{mark}</span>
        <h2>{title}</h2>
        <button className="dialer-panel-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="dialer-panel-body">{children}</div>
    </div>
  )
}

function Tab({
  icon,
  label,
  selected,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  selected?: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button className={`dialer-tab${selected ? ' is-selected' : ''}`} onClick={onClick}>
      <span className="dialer-tab-icon">
        {icon}
        {badge !== undefined && <span className="dialer-badge">{badge}</span>}
      </span>
      <span className="dialer-tab-label">{label}</span>
    </button>
  )
}
