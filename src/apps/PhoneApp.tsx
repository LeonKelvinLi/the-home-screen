import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NavScreen } from '../ios/ui/NavScreen'
import { ListRow, ListSection } from '../ios/ui/List'
import { FriendFace } from './FriendFace'
import { FriendButton, TopThreeRow } from './Friends'
import { takeMemberLink } from '../lib/friends'
import { readableOn } from '../ios/contrast'
import { TabBar } from '../ios/ui/TabBar'
import type { TabItem } from '../ios/ui/TabBar'
import { Symbol } from '../ios/ui/Symbol'
import { BrandLogo } from '../ios/BrandLogo'
import { BRANDS, brandById } from '../data/brands'
import type { ShellApi } from '../ios/Device'
import { OPERATOR, OWNERS, hasOperatorContact } from '../lib/operator'
import { CallOrTextSheet } from '../ios/ui/CallOrText'
import { fetchDirectory, fetchMemberCount, fetchMemberProfile, type DirectoryMember, type MemberProfile } from '../lib/account'
import { SHARE_CONTACTS, shareOrCopy, shareUrl } from '../lib/share'
import { ShareMark } from './dialer/glyphs'

const SINCE = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

/*
  ONE DROP-DOWN PER LETTER. Glenn, 2026-09-22: "for every letter on the
  contacts. Can you have a drop-down for all the names under each letter?
  Just to minimize the page." Each letter starts closed and says how many
  names are under it; a tap opens it and another closes it.
*/
function LetterGroup({ letter, count, children }: { letter: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = `contacts-letter-${letter}`
  return (
    <section className="ios-section contacts-letter">
      <div className="ios-list">
        <button
          type="button"
          className={`ios-row is-tappable contacts-letter-head${open ? ' is-open' : ''}`}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="contacts-letter-mark">{letter}</span>
          <span className="ios-row-body">
            <span className="ios-row-label">
              {count} {count === 1 ? 'member' : 'members'}
            </span>
          </span>
          <span className="ios-row-chevron contacts-letter-chevron">
            <Symbol name="chevron.right" size={13} color="rgba(60,60,67,0.3)" weight={2.8} />
          </span>
        </button>
        {open && <div id={id}>{children}</div>}
      </div>
    </section>
  )
}

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
  /* The owner whose number was tapped: the Call or Text sheet is open for them. */
  const [dial, setDial] = useState<{ name: string; phone: string } | null>(null)
  /*
    A REAL MEMBER'S PAGE. Glenn, 2026-09-06: "make sure people on contact list
    we can go into their profile and see what they liked". The row is what the
    directory already gave us; the page is fetched when it is opened, and it
    holds what that member starred and liked on business pages — nothing else
    about them leaves the server.
  */
  const [open, setOpen] = useState<{ row: DirectoryMember; profile: MemberProfile | null | 'loading' } | null>(null)
  const openMember = (row: DirectoryMember) => {
    setOpen({ row, profile: 'loading' })
    void fetchMemberProfile(row.id).then((p) =>
      setOpen((cur) => (cur && cur.row.id === row.id ? { row, profile: p } : cur)),
    )
  }
  /* A member named by id (a Top 3 face, a shared page link): their row from
     the list if it is there, else enough of one for the page to load. */
  const openMemberId = (id: string) =>
    openMember(dir?.members.find((m) => m.id === id) ?? { id, name: 'Member', since: 0, me: false })
  /* After a button on their page, read it again: the count and Top 3 follow. */
  const reloadOpen = () => {
    const row = open?.row
    if (row) void fetchMemberProfile(row.id).then((p) => setOpen((cur) => (cur && cur.row.id === row.id ? { row, profile: p } : cur)))
  }
  /*
    THE REAL LIST. Glenn, 2026-09-02: "how soon can we have the contact list
    update every time a user signs up?" Fetched once when the app opens; null
    means signed out or unreachable.
  */
  const [dir, setDir] = useState<{ count: number; members: DirectoryMember[] } | null>(null)
  /*
    THE NUMBER, for somebody who is not signed in. The sample profiles that
    stood here were asked for "until account creation is wired", and it is:
    so a visitor now sees how many real members there are — Glenn's "see how
    big our users are growing" — and is asked in to see who they are.
  */
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    let on = true
    fetchDirectory().then((d) => {
      if (!on) return
      setDir(d)
      if (!d) void fetchMemberCount().then((n) => on && setCount(n))
    })
    return () => {
      on = false
    }
  }, [])
  /* "Share my page", or a Top 3 face on Profile: open that member once the list is in. */
  useEffect(() => {
    if (!dir) return
    const id = takeMemberLink()
    if (id) openMemberId(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir])
  const [digits, setDigits] = useState('')
  /*
    SHARE, TOP RIGHT. Glenn, 2026-09-22: "Would you mind including a share
    button on the top right corner again for this page?" The same pill the
    membership page carries, handing out beastypages.com/contacts, which opens
    straight onto this screen (App.tsx) with its own link preview.
  */
  const [said, setSaid] = useState<string | null>(null)
  const share = async () => {
    const how = await shareOrCopy(SHARE_CONTACTS)
    if (how === 'shared') return
    setSaid(how === 'copied' ? 'Link copied' : `Copy this link: ${shareUrl(SHARE_CONTACTS).replace(/^https?:\/\//, '')}`)
    window.setTimeout(() => setSaid(null), 3000)
  }

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

  if (tab === 'contacts' && open) {
    const prof = open.profile
    const loaded = prof && prof !== 'loading' ? prof : null
    const favs = (loaded?.favourites ?? []).map((id) => brandById(id)).filter(Boolean)
    const liked = (loaded?.likes ?? []).map((id) => brandById(id)).filter(Boolean)
    const who = open.row.me ? 'you' : 'they'
    return (
      <NavScreen title={open.row.name} onBack={() => setOpen(null)} backTitle="Contacts" footer={tabBar}>
        <div className="prof member-page">
          <header className="prof-head">
            <span className="prof-avatar" aria-hidden="true">
              <FriendFace id={open.row.id} pet={loaded?.pet ?? open.row.pet} size={96} />
            </span>
            <div className="prof-id">
              <span className="prof-name">
                {loaded?.name ?? open.row.name}
                {open.row.me ? ' (you)' : ''}
              </span>
              <p className="prof-spread">Member since {SINCE.format(new Date(loaded?.since ?? open.row.since))}</p>
              {loaded && typeof loaded.friendCount === 'number' && (
                <p className="prof-spread member-friends">
                  {loaded.friendCount} {loaded.friendCount === 1 ? 'friend' : 'friends'}
                </p>
              )}
            </div>
          </header>

          {loaded?.relation && (
            <FriendButton
              id={open.row.id}
              name={loaded.name}
              relation={loaded.relation}
              onChange={(relation) => {
                setOpen((cur) => (cur && cur.profile && cur.profile !== 'loading' ? { ...cur, profile: { ...cur.profile, relation } } : cur))
                reloadOpen()
              }}
            />
          )}

          {loaded?.top3 && (
            <section className="prof-top3">
              <h2 className="prof-h">{open.row.me ? 'Your Top 3 friends' : `${loaded.name.split(' ')[0]}\u2019s Top 3 friends`}</h2>
              {loaded.top3.length ? (
                <TopThreeRow people={loaded.top3} onOpen={openMemberId} />
              ) : (
                <p className="prof-empty">{open.row.me ? 'You have' : 'They have'} not picked a Top 3 yet.</p>
              )}
            </section>
          )}

          {prof === 'loading' && <p className="prof-empty">Loading…</p>}
          {prof === null && <p className="prof-empty">Could not load this member just now.</p>}

          {loaded && (
            <>
              <section>
                <h2 className="prof-h">Top favourites</h2>
                {favs.length === 0 ? (
                  <p className="prof-empty">Nothing starred yet.</p>
                ) : (
                  <div className="prof-grid">
                    {favs.slice(0, 9).map((b) => {
                      const bg = b!.logo.bg.split('|')[0]
                      return (
                        <button
                          className="prof-tile"
                          key={b!.id}
                          style={{ background: bg }}
                          onClick={() => api.openApp(b!.id)}
                          aria-label={b!.name}
                        >
                          <span className="prof-tile-name" style={{ color: readableOn(bg).fg }}>
                            {b!.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              <section>
                <h2 className="prof-h">Liked</h2>
                {liked.length === 0 ? (
                  <p className="prof-empty">Nothing liked yet.</p>
                ) : (
                  <div className="prof-chiprow">
                    {liked.map((b) => (
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
                )}
              </section>

              <p className="prof-fineprint">
                {open.row.me ? 'Your' : 'Their'} friends and Top 3, what {who} starred and liked on business
                pages, and when {who} joined. Nothing else — no number, no address, no handle. Every
                business here is real and opens.
              </p>
            </>
          )}
        </div>
      </NavScreen>
    )
  }

  if (tab === 'contacts') {
    const live = hasOperatorContact()

    return (
      <NavScreen
        title="Contacts"
        onBack={api.closeApp}
        backTitle="Home"
        footer={tabBar}
        right={
          <button type="button" className="chrome-pill is-share" onClick={share}>
            <ShareMark size={15} />
            Share
          </button>
        }
      >
        {said && (
          <p className="contacts-said" role="status">
            {said}
          </p>
        )}
        {/*
          The operator's own card, above the list — iOS puts My Card there and
          it is who someone tapping Phone in the dock is trying to reach.
        */}
        <div className="operator-card">
          <span className="operator-avatar">
            <img src="/biggie.webp" alt="" draggable={false} />
          </span>
          <span className="operator-name">{OPERATOR.name}</span>
          <span className="operator-note">
            {OPERATOR.note}
            <strong className="operator-note-preferred">{OPERATOR.preferred}</strong>
          </span>
        </div>

        {/*
          THE OWNERS, one section each, under the role he wrote for them —
          his revision of 2026-09-19 crossed out the single Phone and Email
          rows and put both owners here. A number asks "call or text?"
          (see ios/ui/CallOrText): the card above says text is preferred.
        */}
        {live ? (
          OWNERS.map((o) => (
            <ListSection key={o.name} header={o.role}>
              {o.phone ? (
                <ListRow
                  label={o.name}
                  value={o.phone}
                  onClick={() => setDial({ name: o.name, phone: o.phone })}
                />
              ) : (
                <ListRow label={o.name} chevron={false} />
              )}
              {o.email && <ListRow label="Email" value={o.email} href={`mailto:${o.email}`} />}
            </ListSection>
          ))
        ) : (
          <ListSection footer="The phone line and email are not connected yet. Every kitchen below can still be opened.">
            <ListRow label="Phone" value="Not connected yet" chevron={false} />
          </ListSection>
        )}
        {dial && <CallOrTextSheet name={dial.name} phone={dial.phone} onClose={() => setDial(null)} />}

        {/*
          PEOPLE, not businesses.

          The operator's reasoning is right: the home screen is already how you
          find a business, so a second alphabetical list of the same kitchens
          earned nothing. This is who else is using it.

          REAL MEMBERS ONLY. The stated purpose of this list is to show how the
          community is growing, so the count is the message — and an invented
          count would mislead the customer and every business owner it is shown
          to. The sample profiles that stood in before accounts existed are
          gone; a visitor who is not signed in sees the real number and is
          asked in to see the names.
        */}
        {dir && dir.members.length > 0 ? (
          <>
            {/*
              THE COUNT IS THE MESSAGE — "the stated purpose of this list is
              to show how the community is growing" — so it sits at the top,
              not in a footer nobody scrolls to.
            */}
            {/* "members & growing" over "on BEASTY": his markup of 2026-09-22. */}
            <p className="contacts-count">
              <strong>{dir.count}</strong> {dir.count === 1 ? 'member' : 'members'} &amp; growing
            </p>
            {[...dir.members
              .reduce((m, mem) => {
                const letter = (mem.name[0] || '#').toUpperCase()
                m.set(letter, [...(m.get(letter) ?? []), mem])
                return m
              }, new Map<string, DirectoryMember[]>())
              .entries()].map(([letter, members]) => (
              <LetterGroup key={letter} letter={letter} count={members.length}>
                {members.map((mem) => (
                  <ListRow
                    key={mem.id}
                    label={
                      <span className="contact-row">
                        <span className="contact-mark">
                          <FriendFace id={mem.id} pet={mem.pet} size={30} />
                        </span>
                        {mem.name}
                        {mem.me ? ' (you)' : ''}
                      </span>
                    }
                    detail={`Member since ${SINCE.format(new Date(mem.since))}`}
                    onClick={() => openMember(mem)}
                  />
                ))}
              </LetterGroup>
            ))}
            <p className="ios-section-footer">
              {dir.count === 1 ? '1 member so far.' : `${dir.count} members so far.`} Everyone who signs
              up appears here the moment they do. Tap a letter to see its names, and open one to see
              what they have starred and liked.
            </p>
          </>
        ) : (
          <div className="contacts-join">
            {count !== null && count > 0 && (
              <p className="contacts-count">
                <strong>{count}</strong> {count === 1 ? 'member' : 'members'} &amp; growing
              </p>
            )}
            <p className="contacts-join-copy">
              Sign in to see who else is on BEASTY and what they have starred and liked. It is free,
              and your own name joins the list the moment you do.
            </p>
            <button className="btn-primary" onClick={() => api.openApp('sys.join')}>
              Sign in or join free
            </button>
          </div>
        )}
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
