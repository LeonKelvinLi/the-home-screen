import { useEffect, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { MemberPanel } from './MemberPanel'
import { PetAvatarArt, SPECIES, COATS, BACKDROPS, ACCESSORIES } from './PetAvatar'
import { Gem } from './MembersApp'
import { member, isMember } from '../lib/member'
import { useGate } from '../lib/gate'
import { favorites } from '../lib/favorites'
import { recentVisits, whenLabel } from '../lib/recents'
import { brandById } from '../data/brands'
import { CITY_PAGES } from '../data/cities'
import { readableOn } from '../ios/contrast'
import {
  profile as readProfile,
  saveProfile,
  downscalePhoto,
  placesVisited,
  cityOf,
  DEFAULT_PET,
  type Profile,
} from '../lib/profile'
import type { ShellApi } from '../ios/Device'
import { MyFriendsSection } from './Friends'
import { myPageLink, syncMyPet } from '../lib/friends'
import { shareOrCopy } from '../lib/share'

/**
 * Someone's profile: where they have been, and what they liked.
 *
 * The operator's first brief was explicit about what this is NOT — no
 * followers, no following, no counts that measure popularity. On 2026-09-24
 * Glenn asked for "top 3 friends", "exactly like myspace concept": friend
 * requests, a friend count and a numbered Top 3 (apps/Friends.tsx). The rest
 * is still places you can tap through to.
 *
 * WHAT IS SHARED. Signed in, the pet a member built, their friends and their
 * Top 3 are on the account, so other members see them from Contacts. A photo,
 * the name typed here and the places visited stay on this device. The page
 * says so in its fine print, because filling in a profile believing strangers
 * can or cannot see it is a bad surprise to hand somebody later.
 */

type Sheet = null | 'avatar' | 'visited' | 'recent' | 'top'

export function ProfileApp({ api }: { api: ShellApi }) {
  const [p, setP] = useState<Profile>(() => readProfile())
  const [sheet, setSheet] = useState<Sheet>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(() => readProfile().name)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const m = member()
  /*
    THE ACCOUNT FIRST, THE DEVICE SECOND.

    This read a year out of a store that predates accounts, so a real member
    signing in on a new phone was told they had joined this year — or offered
    the "become a member" button they had already pressed. The server knows
    when they joined; the device store is the fallback for a visitor who has
    made a local card and never signed in.
  */
  const { account } = useGate()
  /*
    SIGNED IN IS NOT THE SAME AS BEING A MEMBER, and the first cut of this
    treated them as one — so anybody with a free account lost the "become a
    member" button, which is the only route from this page to the two passes.
    tools/audit-membership-plans.mjs walks exactly that route and caught it.

    A member is somebody holding a paid tier. `pending` counts: they have
    chosen one and the operator is arranging it, and telling them to become a
    member again would be the same forgetfulness this commit is fixing.
  */
  const memberTier =
    account && account.tier !== 'free' && account.tierStatus !== 'none'
      ? account
      : null
  const joined = memberTier
    ? new Date(memberTier.joinedAt).getFullYear()
    : isMember()
      ? new Date(m.joinedAt).getFullYear()
      : null

  /*
    The diamond count is PLACES, not visits and not points. Someone who went to
    the same taqueria nine times has been to one place, and the number beside
    their name is a claim about how much of the map they have seen.
  */
  const visitedIds = placesVisited(m.checkIns)
  const visited = visitedIds.map((id) => brandById(id)).filter(Boolean)

  /*
    Places AND cities, because one number does not say the same thing as two.

    Nine places in one town and nine places across five is a different kind of
    exploring, and the second is the one that makes somebody want to beat it.
    Costs the customer nothing to produce — it is read off addresses we already
    hold. A business whose city cannot be resolved honestly is left out of the
    city count rather than counted as its own, so this can undercount and can
    never overcount.
  */
  const cities = new Set(
    visited.map((b) => cityOf((b as { address?: string }).address, CITY_PAGES)).filter(Boolean),
  )

  const favs = favorites()
  const topNine = favs.slice(0, 9)
  const recents = recentVisits()
  const topSpot = p.topSpotId ? brandById(p.topSpotId) : undefined

  /*
    THE PET GOES TO THE ACCOUNT, so friends see it (lib/friends.ts). A photo
    never does: choosing one clears what other members see back to the pet
    Contacts draws from the member's id. Once on opening too, so a pet built
    before this existed reaches the account.
  */
  const update = (next: Partial<Profile>) => {
    const saved = saveProfile(next)
    setP(saved)
    if (account && ('kind' in next || 'pet' in next)) syncMyPet(saved.kind, saved.pet ?? DEFAULT_PET)
  }
  useEffect(() => {
    if (account) syncMyPet(p.kind, p.pet ?? DEFAULT_PET)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id])
  const setPet = (patch: Partial<Profile['pet']>) =>
    update({ kind: 'pet', pet: { ...(p.pet ?? DEFAULT_PET), ...patch } })

  const pickPhoto = async (file?: File) => {
    if (!file) return
    setPhotoError(null)
    try {
      const dataUrl = await downscalePhoto(file)
      update({ kind: 'photo', photo: dataUrl })
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'That image could not be read.')
    }
  }

  const openBrand = (id: string) => {
    setSheet(null)
    api.openApp(id)
  }

  /*
    Shares the APP, and says so on the button.

    It used to share `/?p=me`, a URL nothing reads — so "Share" on a profile
    handed someone a link that opened the generic intro. There is no account
    system, so a profile has no address to send anyone to; pretending otherwise
    with a button labelled Share is a small lie told at the exact moment
    somebody is trying to show a friend their page. When profiles have real
    URLs this becomes the real thing and the label goes back.
  */
  /*
    SIGNED IN, IT IS THEIR PAGE NOW. Profiles have an address for members
    (Contacts, opened on them), so the button says Share my page and sends it,
    carrying their referral code: a stranger who joins through it is theirs.
  */
  const [shareSaid, setShareSaid] = useState<string | null>(null)
  const shareMine = async () => {
    if (!account) return
    const how = await shareOrCopy(myPageLink(account.id, account.referralCode))
    if (how === 'shared') return
    setShareSaid(how === 'copied' ? 'Link copied' : 'Could not share just now')
    window.setTimeout(() => setShareSaid(null), 3000)
  }
  const shareApp = async () => {
    const url = location.origin
    try {
      if (navigator.share) await navigator.share({ title: 'BEASTY', url })
      else await navigator.clipboard.writeText(url)
    } catch {
      /* Dismissed the sheet. Not an error worth a message. */
    }
  }

  return (
    <AppChrome title="Profile" onBack={api.closeApp}>
      <div className="prof">
        <header className="prof-head">
          <button
            className="prof-avatar"
            onClick={() => setSheet('avatar')}
            aria-label="Edit profile picture"
          >
            {p.kind === 'photo' && p.photo ? (
              <img src={p.photo} alt="" className="prof-photo" />
            ) : p.kind === 'pet' ? (
              <PetAvatarArt pet={p.pet} size={96} />
            ) : (
              <span className="prof-avatar-empty" aria-hidden="true">
                <PetAvatarArt pet={DEFAULT_PET} size={96} />
              </span>
            )}
            <span className="prof-avatar-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M9 3l-1.6 2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.4L15 3H9Zm3 5.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5Zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5Z" />
              </svg>
            </span>
          </button>

          <div className="prof-id">
            {editingName ? (
              <input
                className="co-input prof-name-input"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => {
                  update({ name: nameDraft.trim().slice(0, 40) })
                  setEditingName(false)
                }}
                placeholder="Your name"
                aria-label="Your name"
                maxLength={40}
                autoFocus
              />
            ) : (
              <button className="prof-name" onClick={() => setEditingName(true)}>
                {p.name || 'Add your name'}
              </button>
            )}

            {/*
              The count, tappable, exactly as the operator drew it. It opens the
              list of places rather than a number going up — the whole point is
              that someone else can tap through and go there themselves.
            */}
            <button
              className="prof-count"
              onClick={() => setSheet(sheet === 'visited' ? null : 'visited')}
              aria-expanded={sheet === 'visited'}
              aria-label={`${visited.length} places visited. Show the list.`}
            >
              <Gem size={18} />
              <span>[{visited.length}]</span>
            </button>

            {cities.size > 0 && (
              <p className="prof-spread">
                {visited.length} {visited.length === 1 ? 'place' : 'places'} across {cities.size}{' '}
                {cities.size === 1 ? 'city' : 'cities'}
              </p>
            )}
          </div>
        </header>

        <div className="prof-actions">
          <button className="btn-primary prof-action" onClick={() => setSheet('avatar')}>
            Edit profile
          </button>
          {account ? (
            <button className="btn-secondary prof-action" onClick={shareMine}>
              {shareSaid ?? 'Share my page'}
            </button>
          ) : (
            <button className="btn-secondary prof-action" onClick={shareApp}>
              Share the app
            </button>
          )}
        </div>

        {/* Where they have been, opened from the count above. */}
        {sheet === 'visited' && (
          <section className="prof-drop">
            <h2 className="prof-h">Places visited</h2>
            {visited.length === 0 ? (
              <p className="prof-empty">
                No check-ins yet. Scanning a business&rsquo;s code on a visit is what fills this in.
              </p>
            ) : (
              <div className="prof-chiprow">
                {visited.map((b) => (
                  <button className="prof-chip" key={b!.id} onClick={() => openBrand(b!.id)}>
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
        )}

        {/*
          THE ORDER, Leon for Glenn, 2026-09-27: "put qr code last and top 3
          friend and top restaurants first". The people first, then the places
          (the Number one spot and the Top 9), then Recent visits and the member
          line, and the code with what it has earned at the end.
        */}
        {/* His Top 8, cut to three: signed-in members only. */}
        <MyFriendsSection api={api} />

        {/* The single favourite, top billing, edited in one tap. */}
        <section className="prof-top">
          <div className="prof-top-head">
            <h2 className="prof-h">Number one spot</h2>
            <button className="prof-edit" onClick={() => setSheet(sheet === 'top' ? null : 'top')}>
              {topSpot ? 'Change' : 'Choose'}
            </button>
          </div>
          {topSpot ? (
            <button className="prof-top-card" onClick={() => openBrand(topSpot.id)}>
              <span
                className="prof-top-mark"
                style={{ background: topSpot.logo.bg.split('|')[0] }}
                aria-hidden="true"
              />
              <span className="prof-top-text">
                <strong>{topSpot.name}</strong>
                <em>{topSpot.cuisine}</em>
              </span>
            </button>
          ) : (
            <p className="prof-empty">Nothing picked yet.</p>
          )}

          {sheet === 'top' && (
            <div className="prof-picker">
              {(favs.length ? favs : recents).map((f) => {
                const id = 'brandId' in f ? f.brandId : (f as { brandId: string }).brandId
                return (
                  <button
                    key={id}
                    className="prof-picker-row"
                    onClick={() => {
                      update({ topSpotId: id })
                      setSheet(null)
                    }}
                  >
                    <span
                      className="prof-chip-dot"
                      style={{ background: f.color }}
                      aria-hidden="true"
                    />
                    {f.name}
                  </button>
                )
              })}
              {favs.length === 0 && recents.length === 0 && (
                <p className="prof-empty">
                  Star a business, or open one, and it becomes pickable here.
                </p>
              )}
            </div>
          )}
        </section>

        {/* The nine, as drawn: a 3x3 of tiles other people can tap through. */}
        <section>
          <h2 className="prof-h">Top 9 favourites</h2>
          <div className="prof-grid">
            {Array.from({ length: 9 }).map((_, i) => {
              const f = topNine[i]
              if (!f)
                return (
                  <span className="prof-tile is-empty" key={i} aria-hidden="true">
                    {i + 1}
                  </span>
                )
              return (
                <button
                  className="prof-tile"
                  key={f.brandId}
                  style={{ background: f.color }}
                  onClick={() => openBrand(f.brandId)}
                  aria-label={f.name}
                >
                  {/*
                    Ink chosen from the tile's own colour, not always white.
                    top dog's yellow is #FFF33E and white on it is unreadable —
                    the same helper the brand hero uses picks near-black there
                    and white on the dark ones.
                  */}
                  <span
                    className="prof-tile-name"
                    style={{ color: readableOn(f.color).fg }}
                  >
                    {f.name}
                  </span>
                </button>
              )
            })}
          </div>
          {favs.length === 0 && (
            <p className="prof-empty">
              The star on a business&rsquo;s page puts it here.
            </p>
          )}
        </section>

        {/* Recent, as a drop-down rather than a permanent list. */}
        <section>
          <button
            className="prof-recent-toggle"
            onClick={() => setSheet(sheet === 'recent' ? null : 'recent')}
            aria-expanded={sheet === 'recent'}
          >
            Recent visits
            <span className="prof-recent-count">{recents.length}</span>
          </button>
          {sheet === 'recent' && (
            <div className="prof-drop">
              {recents.length === 0 ? (
                <p className="prof-empty">Nothing opened yet.</p>
              ) : (
                recents.map((r) => (
                  <button
                    className="prof-picker-row"
                    key={r.brandId + r.at}
                    onClick={() => openBrand(r.brandId)}
                  >
                    <span className="prof-chip-dot" style={{ background: r.color }} aria-hidden="true" />
                    <span className="prof-picker-name">{r.name}</span>
                    <span className="prof-when">{whenLabel(r.at)}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        {/*
          The member line. It states what is TRUE of this device — joined, or
          not — rather than printing a badge nobody has earned. The prompt below
          it is the operator's idea and it goes to the page that already says
          paid sign-ups are not open, so it cannot promise a membership that
          cannot be bought yet.
        */}
        <div className="prof-member">
          {joined ? (
            <p className="prof-member-line">
              <Gem size={16} /> Member since {joined}
            </p>
          ) : (
            <button className="prof-member-cta" onClick={() => api.openApp('sys.members')}>
              <Gem size={16} />
              <span>Tap here to become a member</span>
            </button>
          )}
        </div>

        {/*
          THEIR CODE AND WHAT IT HAS EARNED — his "the User gets their own
          personalized QR code assigned to their profile page". Last since
          2026-09-27, as asked; it renders nothing for a visitor who has not
          signed up.
        */}
        <MemberPanel />

        {/* Signed in, the first sentence was simply false: accounts exist and
            the member list in Contacts is built from them. */}
        {/* Friends changed what other members see (Glenn, 2026-09-24, "exactly
            like myspace"): a built pet, the friend count and the Top 3 are on
            the account now. A photo still never leaves this phone. */}
        <p className="prof-fineprint">
          {account
            ? 'Other members can open you from Contacts and see your name, the month you joined, the pet you built, how many friends you have, your Top 3, and the businesses you have starred or liked. A photo and the places you have visited stay on this phone and are sent nowhere.'
            : 'This profile is on this phone only. You are not signed in, so nothing here has been sent anywhere and nobody else can see it.'}
        </p>

        {sheet === 'avatar' && (
          <section className="prof-editor">
            <h2 className="prof-h">Profile picture</h2>

            <div className="prof-editor-modes">
              <button
                className={`prof-mode${p.kind === 'photo' ? ' is-on' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                A photo of your pet
              </button>
              <button
                className={`prof-mode${p.kind === 'pet' ? ' is-on' : ''}`}
                onClick={() => update({ kind: 'pet' })}
              >
                Build a cartoon pet
              </button>
            </div>

            {/*
              Never uploaded. The file is read, drawn to a canvas at 256px and
              kept as a data URL on this device — see lib/profile.ts for why the
              downscale is not optional.
            */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="prof-file"
              aria-label="Choose a photo of your pet"
              onChange={(e) => void pickPhoto(e.target.files?.[0])}
            />
            {photoError && (
              <p className="co-error" role="alert">
                {photoError}
              </p>
            )}

            {p.kind === 'pet' && (
              <div className="prof-pet-editor">
                <div className="prof-pet-preview">
                  <PetAvatarArt pet={p.pet} size={112} />
                </div>

                <h3 className="prof-sub">Animal</h3>
                <div className="prof-opts">
                  {SPECIES.map((s) => (
                    <button
                      key={s.key}
                      className={`prof-opt${p.pet.species === s.key ? ' is-on' : ''}`}
                      onClick={() => setPet({ species: s.key })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <h3 className="prof-sub">Coat</h3>
                <div className="prof-swatches">
                  {COATS.map((c) => (
                    <button
                      key={c}
                      className={`prof-sw${p.pet.coat === c ? ' is-on' : ''}`}
                      style={{ background: c }}
                      onClick={() => setPet({ coat: c })}
                      aria-label={`Coat ${c}`}
                    />
                  ))}
                </div>

                <h3 className="prof-sub">Background</h3>
                <div className="prof-swatches">
                  {BACKDROPS.map((c) => (
                    <button
                      key={c}
                      className={`prof-sw${p.pet.backdrop === c ? ' is-on' : ''}`}
                      style={{ background: c }}
                      onClick={() => setPet({ backdrop: c })}
                      aria-label={`Background ${c}`}
                    />
                  ))}
                </div>

                <h3 className="prof-sub">Extra</h3>
                <div className="prof-opts">
                  {ACCESSORIES.map((a) => (
                    <button
                      key={a.key || 'none'}
                      className={`prof-opt${p.pet.accessory === a.key ? ' is-on' : ''}`}
                      onClick={() => setPet({ accessory: a.key })}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="btn-primary" onClick={() => setSheet(null)}>
              Done
            </button>
          </section>
        )}
      </div>
    </AppChrome>
  )
}
