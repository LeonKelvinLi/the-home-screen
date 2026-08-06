import { Suspense, lazy, useEffect, useState } from 'react'
import { IntroScreen } from './apps/IntroScreen'
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

export default function App() {
  /*
    The landing screen sits in front of the shell, not inside it — the home
    screen is the product, and it should not be paying to mount a page the
    customer is about to dismiss.

    `openOn` is how "Water" reaches past the intro: entering and opening Beasty
    H20 is one tap, not two.
  */
  const [entered, setEntered] = useState(false)
  const [openOn, setOpenOn] = useState<string | null>(null)
  /*
    Bumped on every return from the app, and used as IntroScreen's key.

    Without it React can reconcile the returning screen against the one it
    remembers and preserve its state, which would drop someone straight onto the
    finished BEASTY screen with no takeover. The key guarantees a fresh mount.
  */
  const [visit, setVisit] = useState(0)

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
    try {
      window.history.pushState({ hs: 'app' }, '')
    } catch {
      /* history unavailable — back simply leaves, as it did before */
    }
  }

  useEffect(() => {
    const back = () => {
      setEntered(false)
      setOpenOn(null)
      setVisit((v) => v + 1)
    }
    window.addEventListener('popstate', back)
    return () => window.removeEventListener('popstate', back)
  }, [])

  if (!entered) {
    return (
      <IntroScreen
        key={visit}
        onEnter={() => enter()}
        onWater={() => enter(BEASTY_H20)}
        onJoin={() => enter(RESERVE)}
        /* The keypad opens several apps directly — Designs, the membership and
           the account screen are all one key rather than a tap into the grid. */
        onOpen={(appId) => enter(appId)}
      />
    )
  }

  /*
    The fallback is the brand yellow, not a spinner. By the time anyone reaches
    it the chunk is normally already warm, so this is a single frame on a slow
    connection — and a flash of the brand colour reads as the app opening,
    where a spinner reads as a wait.
  */
  return (
    <Suspense fallback={<div className="shell-loading" />}>
      <Shell openOn={openOn} />
    </Suspense>
  )
}
