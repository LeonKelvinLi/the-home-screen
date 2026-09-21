import { GateProvider } from './lib/gate'
import { Suspense, lazy, useEffect, useState } from 'react'
import { IntroScreen } from './apps/IntroScreen'
import type { PanelPage } from './apps/dialer/keys'
import { savedCity } from './lib/place'
import { wallpaperFor } from './ios/Wallpaper'

/*
  The shell — the fake OS, twelve apps and the whole catalogue — is loaded on
  its own rather than bundled into the first response.

  It is 270KB of JavaScript that a customer used to download before they had
  seen anything, while looking at a landing page that needs none of it. It is
  fetched in the background the moment the landing page appears, so it is
  almost always ready before anyone taps Enter; splitting it costs nothing at
  the moment of the tap and saves the wait before the first paint.
*/
const Shell = lazy(() => import('./Shell'))

/** Resolve which brand the Water button opens without pulling in the catalogue. */
const BEASTY_H20 = 'b_beastyh20'
const RESERVE = 'slot.join'

/*
  The paths Glenn shares (see lib/share.ts): two open a landing panel, and the
  membership one opens the app's own screen, the way a shared business link
  does. Anything else here would be a page nobody can share.
*/
/* MAKE $ (key 9) opens the panel keyed `careers` — "Make some money with
   BEASTY", his instructions for bringing a business in. */
const LINKED_PANEL: Record<string, PanelPage | undefined> = { '/collab': 'collabs', '/money': 'careers' }
const LINKED_APP: Record<string, string | undefined> = { '/members': 'sys.members' }
const path = () =>
  typeof window === 'undefined' ? '' : window.location.pathname.replace(/\/+$/, '') || '/'

/** How long the dialer and the home screen overlap during the cross-fade. */
const HANDOFF_MS = 620

export default function App() {
  /*
    The landing screen sits in front of the shell, not inside it — the home
    screen is the product, and it should not be paying to mount a page the
    customer is about to dismiss.

    `openOn` is how "Water" reaches past the intro: entering and opening Beasty
    H20 is one tap, not two.
  */
  /*
    Seeded FROM HISTORY, not from false.

    A reload inside the app used to come back on the landing page while the
    browser was still sitting on the app's history entry — so Back did not
    leave, it replayed the animation, and the next Enter pushed yet another
    entry. Three cycles of enter/reload/enter measured five Back presses to
    escape the site, four of which did nothing but restart a three-second
    animation. That is a trap, and it is the one thing this must not be.
  */
  const [entered, setEntered] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.history.state?.hs === 'app' ||
        /^b_[a-z0-9]{2,40}$/.test(new URLSearchParams(window.location.search).get('b') ?? '') ||
        !!LINKED_APP[path()]),
  )
  /*
    A shared business link, honoured on arrival.

    Every business page has a Share button and it hands out `/?b=<brandId>` —
    which nothing read, so someone who was sent "look at The Yard" landed on the
    generic intro and had to go find it. A share button whose link does not open
    the thing you shared is worse than no share button.

    Arriving this way skips the takeover on purpose: the animation is for
    someone meeting BEASTY, not for someone a friend just sent to a menu.

    Validated by SHAPE, not against the catalogue. Importing brandById here
    would pull the whole catalogue into the first response, which is the exact
    cost the landing page is built to avoid — so the id is pattern-checked and the
    Shell resolves it, falling back to the home screen if it names nothing.
  */
  const shared = (() => {
    if (typeof window === 'undefined') return null
    const id = new URLSearchParams(window.location.search).get('b')
    return id && /^b_[a-z0-9]{2,40}$/.test(id) ? id : null
  })()

  const [openOn, setOpenOn] = useState<string | null>(shared ?? LINKED_APP[path()] ?? null)
  /*
    Bumped on every return from the app, and used as IntroScreen's key.

    Without it React can reconcile the returning screen against the one it
    remembers and preserve its state, which would drop someone straight onto the
    finished BEASTY screen with no takeover. The key guarantees a fresh mount.
  */
  const [visit, setVisit] = useState(0)
  /*
    The shared pages: /collab, /money and /members.

    Glenn sends these in DMs — the Collab invitation on 2026-09-16, then "add a
    share button to each one of these pages" over the membership page and MAKE $
    the next morning — so each link opens the page he is talking about rather
    than the front door, with the takeover skipped, the same courtesy as a
    shared business link. Only on arrival: coming back from the app is an
    ordinary return, and nothing reopens.
  */
  const linkedPanel = visit === 0 ? LINKED_PANEL[path()] : undefined
  /*
    True while the dialer is still on screen, fading, with the home screen
    already mounted and coming up underneath it.

    The handoff used to be a swap: the dialer faded to nothing over 300ms, THEN
    unmounted, and only then did the shell mount and start its own entrance —
    so there was a hole in the middle where neither screen was really there. A
    cross-fade needs both alive at once, which means the shell has to mount at
    the START of the fade rather than at the end of it.
  */
  const [handoff, setHandoff] = useState(false)
  /*
    True when the landing screen should open already-settled.

    Set on every return from the app, and cleared only by the Settings row that
    exists to replay the opening — that row leaves a marker in sessionStorage
    before calling history.back(), which is the one signal that distinguishes
    "show me that again" from "take me back".
  */
  const [skipIntro, setSkipIntro] = useState(false)

  /*
    Warm the two things the home screen needs, while the landing page is on
    screen and the connection is otherwise idle: the shell's own chunk, and the
    wallpaper for whichever city this device settled on.

    The wallpaper is the single largest asset in the app and it used to be
    fetched only once the home screen mounted, which is the worst possible
    moment — the customer is already looking at a black rectangle. Fetching it
    during the seconds they spend reading the landing page moves that wait to
    where nobody is waiting.
  */
  useEffect(() => {
    if (entered) return
    const warm = () => {
      import('./Shell')
      new Image().src = wallpaperFor(savedCity())
    }
    // requestIdleCallback where it exists, so this never competes with the
    // landing page's own paint. Safari still lacks it.
    const ric = (window as { requestIdleCallback?: (cb: () => void) => number })
      .requestIdleCallback
    if (ric) {
      const handle = ric(warm)
      return () => (window as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback?.(handle)
    }
    const t = window.setTimeout(warm, 400)
    return () => window.clearTimeout(t)
  }, [entered])

  /*
    Entering pushes a history entry, so the phone's own back gesture comes back
    here rather than leaving the site.

    That is also how the takeover replays: IntroScreen is unmounted while the
    app is open, so returning mounts a fresh one and it runs from the top. No
    replay flag, no reset — the animation is a property of the screen existing,
    which is the whole reason it can be trusted to look the same every time.
  */
  const enter = (appId: string | null = null) => {
    setOpenOn(appId)
    setEntered(true)
    setHandoff(true)
    window.setTimeout(() => setHandoff(false), HANDOFF_MS)
    try {
      // Idempotent. Pushing unconditionally grew the stack by one entry every
      // time somebody entered, went back and entered again.
      if (window.history.state?.hs !== 'app') window.history.pushState({ hs: 'app' }, '')
    } catch {
      /* history unavailable — back simply leaves, as it did before */
    }
  }

  /*
    Read the entry the browser actually landed on, rather than assuming any
    traversal means "leaving".

    Assuming it broke Forward: after Back, pressing Forward put the browser on
    the app's entry while this handler had already dropped us to the landing
    page — so the two disagreed, and from there Back replayed the animation
    instead of leaving.
  */
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const inApp = ((e.state ?? window.history.state) as { hs?: string } | null)?.hs === 'app'
      setEntered(inApp)
      if (!inApp) {
        setOpenOn(null)
        let replay = false
        try {
          replay = sessionStorage.getItem('hs.replay') === '1'
          sessionStorage.removeItem('hs.replay')
        } catch {
          /* private mode — default to the fast path */
        }
        setSkipIntro(!replay)
        // Fresh mount either way, so a replay genuinely starts from the top.
        setVisit((v) => v + 1)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])



  /*
    The fallback is the brand yellow, not a spinner. By the time anyone reaches
    it the chunk is normally already warm, so this is a single frame on a slow
    connection — and a flash of the brand colour reads as the app opening,
    where a spinner reads as a wait.
  */
  return (
    <GateProvider>
      {entered && (
        <Suspense fallback={<div className="shell-loading" />}>
          {/* `is-arriving` scales it up from just under full size while the
              dialer dissolves off the top of it. */}
          <div className={handoff ? 'shell-enter is-arriving' : 'shell-enter'}>
            <Shell openOn={openOn} />
          </div>
        </Suspense>
      )}
      {(!entered || handoff) && (
        <IntroScreen
          key={visit}
          onEnter={() => enter()}
          onWater={() => enter(BEASTY_H20)}
          onJoin={() => enter(RESERVE)}
          /* The keypad opens several apps directly — Designs, the membership
             and the account screen are all one key rather than a tap into the
             grid. */
          onOpen={(appId) => enter(appId)}
          skipIntro={skipIntro || !!linkedPanel}
          openPanel={linkedPanel}
        />
      )}
    </GateProvider>
  )
}
