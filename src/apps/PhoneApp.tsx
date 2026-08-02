import { useState } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'
import { ListRow, ListSection } from '../ios/ui/List'
import { TabBar } from '../ios/ui/TabBar'
import type { TabItem } from '../ios/ui/TabBar'
import { Symbol } from '../ios/ui/Symbol'
import { BrandLogo } from '../ios/BrandLogo'
import { BRANDS } from '../data/brands'
import type { ShellApi } from '../ios/Device'

/**
 * Phone, laid out the way iOS lays it out: a five-item tab bar, a keypad with
 * letters under the digits, and a contact list grouped alphabetically.
 *
 * The operator's existing hub dials `tel:+10000000000` from the dock — a
 * placeholder that was never replaced. Rather than ship a button that reaches
 * nobody, the call action is disabled and says the number is not published.
 */

type Tab = 'favourites' | 'recents' | 'contacts' | 'keypad' | 'voicemail'

const TABS: TabItem<Tab>[] = [
  { key: 'favourites', label: 'Favourites', icon: 'star.fill' },
  { key: 'recents', label: 'Recents', icon: 'clock.fill' },
  { key: 'contacts', label: 'Contacts', icon: 'person.crop.circle.fill' },
  { key: 'keypad', label: 'Keypad', icon: 'circle.grid.3x3.fill' },
  { key: 'voicemail', label: 'Voicemail', icon: 'recordingtape' },
]

const KEYS: [string, string][] = [
  ['1', ''],
  ['2', 'ABC'],
  ['3', 'DEF'],
  ['4', 'GHI'],
  ['5', 'JKL'],
  ['6', 'MNO'],
  ['7', 'PQRS'],
  ['8', 'TUV'],
  ['9', 'WXYZ'],
  ['*', ''],
  ['0', '+'],
  ['#', ''],
]

/** Formats as you type, the way the iOS keypad does. */
function formatNumber(d: string): string {
  const n = d.replace(/\D/g, '')
  if (n.length <= 3) return n
  if (n.length <= 6) return `(${n.slice(0, 3)}) ${n.slice(3)}`
  if (n.length <= 10) return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`
  return `+${n.slice(0, n.length - 10)} (${n.slice(-10, -7)}) ${n.slice(-7, -4)}-${n.slice(-4)}`
}

export function PhoneApp({ api }: { api: ShellApi }) {
  const [tab, setTab] = useState<Tab>('keypad')
  const [digits, setDigits] = useState('')

  const tabBar = <TabBar items={TABS} active={tab} onSelect={setTab} />

  if (tab === 'keypad') {
    return (
      <div className="nav-screen phone-keypad-screen">
        <div className="keypad-display">{formatNumber(digits) || ' '}</div>

        <div className="keypad">
          {KEYS.map(([d, letters]) => (
            <button
              key={d}
              className="keypad-key"
              onClick={() => setDigits((v) => (v.length < 15 ? v + d : v))}
            >
              <span className="keypad-digit">{d}</span>
              {letters && <span className="keypad-letters">{letters}</span>}
            </button>
          ))}
        </div>

        <div className="keypad-actions">
          <span className="keypad-spacer" />
          <button
            className="keypad-call"
            disabled
            aria-label="Call — number not published yet"
            title="The commissary number has not been published yet"
          >
            <Symbol name="phone.fill" size={30} color="#fff" />
          </button>
          <span className="keypad-spacer">
            {digits && (
              <button
                className="keypad-delete"
                onClick={() => setDigits((v) => v.slice(0, -1))}
                aria-label="Delete"
              >
                <Symbol name="delete.left.fill" size={26} color="rgba(60,60,67,0.6)" />
              </button>
            )}
          </span>
        </div>

        <p className="keypad-note">Calling is not connected yet — no number has been published.</p>
        {tabBar}
      </div>
    )
  }

  if (tab === 'contacts') {
    const groups = new Map<string, typeof BRANDS>()
    for (const b of [...BRANDS].sort((a, b) => a.name.localeCompare(b.name))) {
      const letter = b.name[0].toUpperCase()
      groups.set(letter, [...(groups.get(letter) ?? []), b])
    }

    return (
      <NavScreen title="Contacts" onBack={api.closeApp} backTitle="Home" footer={tabBar}>
        {[...groups.entries()].map(([letter, brands]) => (
          <ListSection key={letter} header={letter}>
            {brands.map((b) => (
              <ListRow
                key={b.id}
                label={
                  <span className="contact-row">
                    <span className="contact-mark">
                      <BrandLogo logo={b.logo} size={30} />
                    </span>
                    {b.name}
                  </span>
                }
                detail={b.cuisine}
                onClick={() => api.openApp(b.id)}
              />
            ))}
          </ListSection>
        ))}
        <p className="ios-section-footer">
          Numbers are not published. Tapping a kitchen opens its menu.
        </p>
      </NavScreen>
    )
  }

  if (tab === 'favourites') {
    const favourites = BRANDS.slice(0, 6)
    return (
      <NavScreen title="Favourites" onBack={api.closeApp} backTitle="Home" footer={tabBar}>
        <ListSection footer="Favourites are the kitchens the operator features. Tap one to open its menu.">
          {favourites.map((b) => (
            <ListRow
              key={b.id}
              label={
                <span className="contact-row">
                  <span className="contact-mark">
                    <BrandLogo logo={b.logo} size={30} />
                  </span>
                  {b.name}
                </span>
              }
              detail={b.cuisine}
              onClick={() => api.openApp(b.id)}
            />
          ))}
        </ListSection>
      </NavScreen>
    )
  }

  const empty =
    tab === 'recents'
      ? { title: 'Recents', icon: 'clock.fill' as const, line: 'No calls yet.' }
      : { title: 'Voicemail', icon: 'recordingtape' as const, line: 'No voicemail.' }

  return (
    <NavScreen title={empty.title} onBack={api.closeApp} backTitle="Home" footer={tabBar}>
      <div className="phone-empty">
        <Symbol name={empty.icon} size={44} color="rgba(60,60,67,0.25)" />
        <p>{empty.line}</p>
        <p className="phone-empty-sub">Calling is not connected yet.</p>
      </div>
    </NavScreen>
  )
}
