/**
 * Whether this app can be installed to the home screen, and whether it already
 * has been.
 *
 * ONE SOURCE OF TRUTH, because there are now two places that ask: the bubble
 * that offers it a few seconds in, and the row in Help that lets somebody go
 * looking for it on purpose. When that logic lived inside the bubble, the
 * bubble was the only door — and the operator's own question is what exposed
 * the cost of that: "when does the 'add to homescreen' thing pop up? I've seen
 * it once but when does it pop up?"
 *
 * He had seen it, tapped it to read the guide, and that tap retired it forever.
 * He could not summon it again to show anybody, and neither could a customer
 * who was interested but busy. Installing is the most valuable thing anyone can
 * do here — installed, the page gets the whole screen and all 24 tiles fit,
 * which is what makes "the first 48 spots are the first two pages" literally
 * true — so having exactly one door to it, open for twelve seconds, once ever,
 * was the wrong shape.
 */

/** Answered with a real no. Never offered again. */
const DISMISSED = 'fb.a2hs.v1'
/** Looked at the guide but did not install. Worth one more mention. */
const LOOKED = 'fb.a2hs.looked'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    /* Safari private mode throws rather than returning null. Nothing can be
       remembered there, and offering once more is the lesser harm. */
    return null
  }
}

function write(key: string, v: string): void {
  try {
    localStorage.setItem(key, v)
  } catch {
    /* see read() */
  }
}

/** Already running from the home screen, so there is nothing left to offer. */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return true
  return window.matchMedia('(display-mode: standalone)').matches
}

/**
 * Can this device actually follow the guide?
 *
 * iPhone and iPad Safari only. The guide draws Safari's own toolbar and names
 * its controls; on Android, on desktop, or in an in-app webview that flow does
 * not exist in that form, so showing it would be directions to a button that is
 * not there. Every browser on iOS wears the iPhone UA, so the ones that are not
 * Safari are excluded by their own token.
 */
export function canInstall(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (!/iPhone|iPad/.test(ua)) return false
  if (!/Safari\//.test(ua) || /CriOS|FxiOS|EdgiOS/.test(ua)) return false
  return !isInstalled()
}

/** Should the unprompted bubble appear on this visit? */
export function shouldOffer(): boolean {
  if (!canInstall()) return false
  if (read(DISMISSED) !== null) return false
  /*
    Opening the guide is INTEREST, not completion. It used to write the same
    key a dismissal writes, so reading the instructions and deciding to do it
    later retired the offer for good. It now buys exactly one more mention on a
    later visit — after that the silence is the answer.
  */
  const looked = Number(read(LOOKED) ?? '0')
  return looked < 2
}

/** They said no. */
export function markDismissed(): void {
  write(DISMISSED, '1')
}

/** They opened the guide. Counted, not final. */
export function markLooked(): void {
  write(LOOKED, String(Number(read(LOOKED) ?? '0') + 1))
}
