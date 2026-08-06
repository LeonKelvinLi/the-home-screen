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
 *   7 Collabs    8 Donations   9 Careers
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

export type PanelPage =
  | 'about'
  | 'contacts'
  | 'bprf'
  | 'collabs'
  | 'donations'
  | 'careers'
  | 'reviews'
  | 'favorites'

export interface DialerKey {
  digit: string
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
  { digit: '1', label: 'ABOUT', action: { kind: 'panel', page: 'about' } },
  { digit: '2', letters: 'ABC', label: 'INSTAGRAM', action: { kind: 'external', url: INSTAGRAM_URL } },
  { digit: '3', letters: 'DEF', label: 'BPRF', action: { kind: 'panel', page: 'bprf' } },
  // Goods is the marketplace itself — every business on the home screen.
  { digit: '4', letters: 'GHI', label: 'GOODS', action: { kind: 'enter' } },
  { digit: '5', letters: 'JKL', label: 'DESIGNS', action: { kind: 'enter', app: DESIGNS } },
  { digit: '6', letters: 'MNO', label: 'WATER', action: { kind: 'external', url: WATER_URL } },
  { digit: '7', letters: 'PQRS', label: 'COLLABS', action: { kind: 'panel', page: 'collabs' } },
  { digit: '8', letters: 'TUV', label: 'DONATE', action: { kind: 'panel', page: 'donations' } },
  { digit: '9', letters: 'WXYZ', label: 'CAREERS', action: { kind: 'panel', page: 'careers' } },
  // The operator calls this one "Biggie's Diamond membership".
  { digit: '*', label: 'DIAMOND', action: { kind: 'enter', app: MEMBERS } },
  { digit: '0', letters: '+', label: 'SIGN IN', action: { kind: 'enter', app: ACCOUNT } },
  { digit: '#', label: 'SHARE', action: { kind: 'share' } },
]

/*
  B-E-A-S-T-Y on a telephone keypad, which is the joke the screen is built
  around: 2=ABC, 3=DEF, 7=PQRS, 8=TUV, 9=WXYZ. These light in order while the
  stock keypad converts into this one.
*/
export const BEASTY_DIGITS = '232789'
