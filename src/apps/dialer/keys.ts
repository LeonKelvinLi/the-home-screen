/**
 * The twelve keys, and what each one is in both of the screen's two lives.
 *
 * This is the operator's own numbered list, straight off his note, mapped onto
 * a telephone keypad. It is the reason a dial pad is the right front door for
 * this business rather than a gimmick: the small letters under each digit are
 * already a menu on every phone ever made, so replacing ABC with CONTACTS is a
 * substitution the eye accepts instantly.
 *
 *   1 About      2 Contacts    3 BPRF
 *   4 Goods      5 Designs     6 Water
 *   7 Collabs    8 Donations   9 Make $
 *   * Member     0 Sign in     # Share
 *
 * `letters` is what a real phone prints. `label` is what this one prints once
 * it stops pretending. Both are uppercase and short on purpose — they occupy
 * the same few pixels under a 78px circle, and "BEASTY DESIGNS" does not fit
 * there. The full name lives on the page the key opens.
 */

export type KeyAction =
  /** Opens a panel over the keypad. */
  | { kind: 'panel'; page: PanelPage }
  /** Enters the home screen, optionally landing on one app. */
  | { kind: 'enter'; app?: string }
  /** Leaves for a site the operator runs elsewhere. */
  | { kind: 'external'; url: string }
  /** The share sheet, or a clipboard copy where there is no sheet. */
  | { kind: 'share' }

/** A drawn mark in dialer/glyphs. Kept as a name so this file stays data. */
export type MarkName =
  | 'info' | 'instagram' | 'ribbon' | 'supply' | 'design' | 'droplet'
  | 'collabs' | 'donate' | 'money' | 'diamond' | 'signin' | 'share'

export type PanelPage =
  | 'about'
  | 'contacts'
  | 'bprf'
  | 'collabs'
  | 'donations'
  | 'careers'
  | 'reviews'
  | 'favorites'
  | 'supply'
  | 'recent'
  | 'camera'

export interface DialerKey {
  digit: string
  /**
   * Which drawn mark fills the circle once the keypad stops pretending.
   *
   * His ask: "fill these circles rather the numbers." The digit still shows
   * while the screen is a telephone — that pretence is the whole opening — and
   * the mark replaces it at the moment the labels resolve, so the reveal now
   * changes the key as well as the word under it. Named here rather than in
   * IntroScreen so the twelve keys and their twelve pictures stay in one list.
   */
  mark?: MarkName
  /** What a real phone prints under the digit. Blank on 1, * and #. */
  letters?: string
  /** What this phone prints instead. */
  label: string
  action: KeyAction
}

/*
  The water business is a site the operator runs on someone else's platform, so
  key 6 leaves rather than opening the in-app page for it.

  Recorded here rather than inline because it is a `/preview/` URL from a site
  builder — those are not always permanent, and when it dies this is the one
  line to change.
*/
export const WATER_URL = 'https://sites.leadconnectorhq.com/preview/55t9dqsHgip4EweddfjR'

/*
  Key 2 was CONTACTS and the operator cut it as redundant — the tab bar already
  carries a Contact tab. It goes to the water company's Instagram instead.
*/
export const INSTAGRAM_URL = 'https://www.instagram.com/beastyh2oco'

/** App ids the keypad can open directly, without going via the grid. */
const DESIGNS = 'sys.designs'
const MEMBERS = 'sys.members'
const ACCOUNT = 'sys.account'

export const DIALER_KEYS: DialerKey[] = [
  { digit: '1', label: 'ABOUT', mark: 'info', action: { kind: 'panel', page: 'about' } },
  { digit: '2', letters: 'ABC', label: 'INSTAGRAM', mark: 'instagram', action: { kind: 'external', url: INSTAGRAM_URL } },
  // FOUNDATION, not BPRF — an initialism nobody outside the business can read.
  { digit: '3', letters: 'DEF', label: 'FOUNDATION', mark: 'ribbon', action: { kind: 'panel', page: 'bprf' } },
  /*
    SUPPLY, not GOODS, and it is not the marketplace — the operator is adding a
    contact for it and has not supplied one yet. The marketplace is the green
    button, which is where every dialer puts "go".
  */
  { digit: '4', letters: 'GHI', label: 'SUPPLY', mark: 'supply', action: { kind: 'panel', page: 'supply' } },
  // SERVICES rather than DESIGNS: the page behind it covers more than design.
  { digit: '5', letters: 'JKL', label: 'SERVICES', mark: 'design', action: { kind: 'enter', app: DESIGNS } },
  { digit: '6', letters: 'MNO', label: 'WATER', mark: 'droplet', action: { kind: 'external', url: WATER_URL } },
  { digit: '7', letters: 'PQRS', label: 'COLLABS', mark: 'collabs', action: { kind: 'panel', page: 'collabs' } },
  { digit: '8', letters: 'TUV', label: 'DONATE', mark: 'donate', action: { kind: 'panel', page: 'donations' } },
  /*
    MAKE $, not CAREERS. Glenn, 2026-09-02: "It's not like we are offering a
    career opportunity but instead a way to make $ sooner than later." The key
    is a dollar in a gear and the word under it is his phrase, cut to fit. The
    page it opens keeps its `careers` key in code; only what people see moved.
  */
  { digit: '9', letters: 'WXYZ', label: 'MAKE $', mark: 'money', action: { kind: 'panel', page: 'careers' } },
  // Biggie's Diamond membership. MEMBERS, not MEMBERSHIP — seven characters
  // instead of ten, so it sits comfortably in the key at any size.
  { digit: '*', label: 'MEMBERS', mark: 'diamond', action: { kind: 'enter', app: MEMBERS } },
  { digit: '0', letters: '+', label: 'SIGN IN', mark: 'signin', action: { kind: 'enter', app: ACCOUNT } },
  { digit: '#', label: 'SHARE', mark: 'share', action: { kind: 'share' } },
]

/*
  B-E-A-S-T-Y on a telephone keypad, which is the joke the screen is built
  around: 2=ABC, 3=DEF, 7=PQRS, 8=TUV, 9=WXYZ. These light in order while the
  stock keypad converts into this one.
*/
export const BEASTY_DIGITS = '232789'
