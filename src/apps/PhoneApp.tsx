import { useState } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'
import { ListRow, ListSection } from '../ios/ui/List'
import { PetAvatarArt } from './PetAvatar'
import { SAMPLE_PEOPLE, type Person } from '../data/community'
import { Gem } from './MembersApp'
import { readableOn } from '../ios/contrast'
import { TabBar } from '../ios/ui/TabBar'
import type { TabItem } from '../ios/ui/TabBar'
import { Symbol } from '../ios/ui/Symbol'
import { BrandLogo } from '../ios/BrandLogo'
import { BRANDS, brandById } from '../data/brands'
import type { ShellApi } from '../ios/Device'
import { OPERATOR, hasOperatorContact, telHref } from '../lib/operator'

/**
 * Phone, laid out the way iOS lays it out: a five-item tab bar, a keypad with
 * letters under the digits, and a contact list grouped alphabetically.
 *
 * It opens on CONTACTS, with the operator's own card at the top, the way iOS
 * Contacts puts My Card above the list. Someone tapping Phone in the dock wants
 * to reach BEASTY, not a keypad.
 *
 * The operator's existing hub dials `tel:+10000000000` from that dock — a
 * placeholder that was never replaced. Rather than ship a button that reaches
 * nobody, every call action here is disabled while lib/operator.ts is blank and
 * says so. Fill that file in and the card, the tap-to-call and the mailto all
 * come alive together.
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
  const [tab, setTab] = useState<Tab>('contacts')
  /** A sample profile being read. Null is the directory itself. */
  const [person, setPerson] = useState<Person | null>(null)
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

  if (tab === 'contacts' && person) {
    /*
      Somebody else's profile, read-only.

      Same shape as your own page so the two are recognisably the same thing,
      minus every control that edits — you cannot rename a stranger or restyle
      their pet. The businesses on it are real ids, so tapping one leaves this
      screen and opens that kitchen, which is the entire point of the page.
    */
    const visited = person.visited.map((id) => brandById(id)).filter(Boolean)
    const favs = person.favourites.map((id) => brandById(id)).filter(Boolean)
    const top = brandById(person.topSpotId)

    return (
      <NavScreen
        title={person.name}
        onBack={() => setPerson(null)}
        backTitle="Contacts"
        footer={tabBar}
      >
        <div className="prof">
          <header className="prof-head">
            <span className="prof-avatar" aria-hidden="true">
              <PetAvatarArt pet={person.pet} size={96} />
            </span>
            <div className="prof-id">
              <span className="prof-name">{person.name}</span>
              <span className="prof-count">
                <Gem size={18} />
                <span>[{visited.length}]</span>
              </span>
              <p className="prof-spread">{person.city}</p>
            </div>
          </header>

          {/* Said once, at the top, where it cannot be missed. */}
          <p className="prof-fineprint">
            An example profile, not a real member. There are no accounts in the app yet. The
            businesses below are real and open.
          </p>

          {top && (
            <section className="prof-top">
              <h2 className="prof-h">Number one spot</h2>
              <button className="prof-top-card" onClick={() => api.openApp(top.id)}>
                <span
                  className="prof-top-mark"
                  style={{ background: top.logo.bg.split('|')[0] }}
                  aria-hidden="true"
                />
                <span className="prof-top-text">
                  <strong>{top.name}</strong>
                  <em>{top.cuisine}</em>
                </span>
              </button>
            </section>
          )}

          <section>
            <h2 className="prof-h">Top 9 favourites</h2>
            <div className="prof-grid">
              {Array.from({ length: 9 }).map((_, i) => {
                const b = favs[i]
                if (!b)
                  return (
                    <span className="prof-tile is-empty" key={i} aria-hidden="true">
                      {i + 1}
                    </span>
                  )
                const bg = b.logo.bg.split('|')[0]
                return (
                  <button
                    className="prof-tile"
                    key={b.id}
                    style={{ background: bg }}
                    onClick={() => api.openApp(b.id)}
                    aria-label={b.name}
                  >
                    <span className="prof-tile-name" style={{ color: readableOn(bg).fg }}>
                      {b.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="prof-h">Places visited</h2>
            <div className="prof-chiprow">
              {visited.map((b) => (
                <button className="prof-chip" key={b!.id} onClick={() => api.openApp(b!.id)}>
                  <span
                    className="prof-chip-dot"
                    style={{ background: b!.logo.bg.split('|')[0] }}
                    aria-hidden="true"
                  />
                  {b!.name}
                </button>
              ))}
            </div>
          </section>

          <div className="prof-member">
            <p className="prof-member-line">
              <Gem size={16} /> Member since {person.memberSince}
            </p>
          </div>
        </div>
      </NavScreen>
    )
  }

  if (tab === 'contacts') {
    const peopleByLetter = new Map<string, Person[]>()
    for (const p of [...SAMPLE_PEOPLE].sort((x, y) => x.name.localeCompare(y.name))) {
      const letter = p.name[0].toUpperCase()
      peopleByLetter.set(letter, [...(peopleByLetter.get(letter) ?? []), p])
    }
    const live = hasOperatorContact()

    return (
      <NavScreen title="Contacts" onBack={api.closeApp} backTitle="Home" footer={tabBar}>
        {/*
          The operator's own card, above the list — iOS puts My Card there and
          it is who someone tapping Phone in the dock is trying to reach.
        */}
        <div className="operator-card">
          <span className="operator-avatar">
            <img src="/biggie.webp" alt="" draggable={false} />
          </span>
          <span className="operator-name">{OPERATOR.name}</span>
          <span className="operator-where">{OPERATOR.city}</span>
        </div>

        <ListSection
          footer={
            live
              ? undefined
              : 'The phone line and email are not connected yet. Every kitchen below can still be opened.'
          }
        >
          {OPERATOR.phone ? (
            <ListRow label="Phone" value={OPERATOR.phone} href={telHref(OPERATOR.phone)} />
          ) : (
            <ListRow label="Phone" value="Not connected yet" chevron={false} />
          )}
          {OPERATOR.email ? (
            <ListRow label="Email" value={OPERATOR.email} href={`mailto:${OPERATOR.email}`} />
          ) : (
            <ListRow label="Email" value="Not connected yet" chevron={false} />
          )}
        </ListSection>

        {/*
          PEOPLE, not businesses.

          The operator's reasoning is right: the home screen is already how you
          find a business, so a second alphabetical list of the same kitchens
          earned nothing. This is who else is using it.

          EVERY ROW BELOW IS A SAMPLE and says so, because the stated purpose of
          this list is to show how the community is growing — so the count is
          the message, and an invented count would mislead the customer AND the
          business owners it gets shown to. When account creation is wired,
          data/community.ts is deleted and real members render here with no
          other change.
        */}
        {[...peopleByLetter.entries()].map(([letter, people]) => (
          <ListSection key={letter} header={letter}>
            {people.map((person) => (
              <ListRow
                key={person.id}
                label={
                  <span className="contact-row">
                    <span className="contact-mark">
                      <PetAvatarArt pet={person.pet} size={30} />
                    </span>
                    {person.name}
                  </span>
                }
                detail={`${person.city} · sample profile`}
                onClick={() => setPerson(person)}
              />
            ))}
          </ListSection>
        ))}

        <p className="ios-section-footer">
          These are example profiles, not real members — there are no accounts in the app yet, so
          nobody has signed up and no total is shown. Open one to see what a member&rsquo;s page
          looks like; every business on it is real and opens.
        </p>
      </NavScreen>
    )
  }

  if (tab === 'favourites') {
    /*
      The first six ORDERABLE businesses, not the first six of everything.

      This was BRANDS.slice(0, 6), which is catalogue order, so the list headed
      "the kitchens the operator features" opened with a Las Vegas pit bull
      kennel and a shop with no menu. Nothing is curated here and calling it
      featured was a claim about the operator and about those businesses; the
      footer now says what it actually is.
    */
    const favourites = BRANDS.filter(
      (b) => !b.contactOnly && !b.quoteOnly && b.menu.some((c) => c.items.length > 0),
    ).slice(0, 6)
    return (
      <NavScreen title="Favourites" onBack={api.closeApp} backTitle="Home" footer={tabBar}>
        <ListSection footer="The first few businesses on the home screen, not a curated list. Tap one to open its menu.">
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
