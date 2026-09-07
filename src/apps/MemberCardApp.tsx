import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { AppChrome } from './AppChrome'
import {
  canJoin,
  checkIn,
  isMember,
  join,
  leave,
  makeCode,
  member,
  useWelcome,
  welcomeAvailable,
} from '../lib/member'
import { LISTED_KITCHENS } from '../data/brands'
import { useGate } from '../lib/gate'
import { fetchPass, type Pass } from '../lib/account'
import type { ShellApi } from '../ios/Device'

/**
 * The member card: the code a business scans, and what it is worth.
 *
 * A SIMULATION, and the screen says so in the one place a customer will read
 * it. There is no account, no server, and no business-facing app — so nothing
 * here has been scanned by anybody, and the buttons that stand in for a till
 * are labelled as exactly that.
 *
 * The QR encodes the same string the card prints. That is deliberate: if the
 * camera fails, the shop reads six characters off the screen instead, and both
 * paths hand the till the identical code. See lib/member.ts.
 */

/** 0:42 — what is left on the pass, read at a glance while it is held up. */
const countdown = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function MemberCardApp({ api }: { api: ShellApi }) {
  /*
    SIGNED IN, THE CARD IS THE ACCOUNT'S.

    This screen was written before accounts existed and read a code minted on
    the device, so a real member — with a real referral code the server hands
    out and credits — was shown a different code that means nothing to anybody.
    Signed in, the card now prints and encodes `referralCode`, and the two
    numbers under it are the server's: people who joined on that code, and the
    raffle tickets those earned.

    The visit simulation below stays device-local, because that is honestly
    what it is: there is still no business-facing app scanning anything.
  */
  const { account } = useGate()
  const [m, setM] = useState(() => member())
  const [initials, setInitials] = useState('')
  const [phone, setPhone] = useState('')
  const [qr, setQr] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  /*
    THE PASS ROTATES. Signed in, the QR is no longer the referral code — that
    one is meant to be shared and lives on the profile — but a token the
    server signs for this member and this minute (/api/members/pass). Glenn,
    2026-09-06: a screenshot of somebody's code must not redeem their offer.
    Each token is good for one scan and dies within two minutes; the card
    fetches the next one the moment this one expires, and again whenever the
    screen comes back into view, so what is held up is never a dead code.
  */
  const [pass, setPass] = useState<Pass | null>(null)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!account) {
      setPass(null)
      return
    }
    let alive = true
    let timer: number | undefined
    const load = async () => {
      if (timer) window.clearTimeout(timer)
      const p = await fetchPass()
      if (!alive) return
      setPass(p)
      /* A little after expiry rather than a little before: the server's clock
         decides the window, and asking early would hand back the same token. */
      const wait = p ? Math.max(1000, p.expiresAt - Date.now() + 250) : 15000
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(load, wait)
    }
    void load()
    const onShow = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onShow)
    return () => {
      alive = false
      if (timer) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [account?.id])
  useEffect(() => {
    if (!account) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [account?.id])

  /*
    The QR is drawn from the code, not stored with it. Error correction M and a
    zero quiet zone: the card supplies its own white margin, and a doubled one
    only makes the modules smaller for a scanner to find.
  */
  useEffect(() => {
    const code = account ? pass?.token : m.code
    if (!code) return setQr(null)
    let alive = true
    void QRCode.toString(code, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 0,
      color: { dark: '#141416', light: '#00000000' },
    }).then((svg) => {
      if (alive) setQr(svg)
    })
    return () => {
      alive = false
    }
  }, [m.code, account?.id, pass?.token])

  const say = (s: string) => {
    setNote(s)
    window.setTimeout(() => setNote(null), 2600)
  }

  /* A signed-in member HAS a card — the account is the card. The local
     "make my card" form is only for a visitor with no account. */
  if (!account && !isMember()) {
    const preview = canJoin(initials, phone) ? makeCode(initials, phone) : null
    return (
      <AppChrome title="Member card" onBack={api.closeApp} className="is-beasty">
        <div className="member-card">
          <p className="member-lead">
            Your card is two letters and four numbers — your initials and the last four digits of
            your phone. A shop can scan it, or read it off the screen if the camera will not play.
          </p>

          <input
            className="co-input"
            placeholder="Your initials"
          aria-label="Your initials"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            maxLength={4}
            autoComplete="off"
          />
          <input
            className="co-input"
            placeholder="Last 4 of your phone"
          aria-label="Last 4 of your phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            maxLength={12}
            autoComplete="off"
          />

          <p className="member-preview">{preview ?? 'BEASTY-••-••••'}</p>

          <button
            className="btn-primary"
            disabled={!canJoin(initials, phone)}
            onClick={() => setM(join(initials, phone))}
          >
            Make my card
          </button>

          {/*
            Said before anyone types anything, not after. A code built from a
            phone number sounds like it is doing more than it is.
          */}
          {/* Signed in there IS an account, and saying otherwise was true only
              before sign-in shipped. Each branch says what is actually so. */}
          <p className="member-fineprint">
            {account
              ? 'Your card carries your own referral code, and the numbers on it come from your account. The scan buttons below are a simulation: there is no business-facing app yet, so nothing has been scanned by a shop.'
              : 'This is a working preview. The card is made on this phone and stays on it — nothing is sent anywhere, no account is created, and this code is a name badge rather than a password. Nothing that costs money is ever authorised by it.'}
          </p>
        </div>
      </AppChrome>
    )
  }

  return (
    <AppChrome title="Member card" onBack={api.closeApp} className="is-beasty">
      <div className="member-card">
        <div className="member-qr">
          {qr ? (
            <div className="member-qr-img" dangerouslySetInnerHTML={{ __html: qr }} />
          ) : (
            <div className="member-qr-img" />
          )}
          {account ? (
            <>
              <p className="member-code member-code-name">{account.name}</p>
              <p className="member-refresh" aria-live="polite">
                {pass
                  ? `Refreshes in ${countdown(Math.max(0, pass.expiresAt - now))}`
                  : 'Getting your pass…'}
              </p>
            </>
          ) : (
            <p className="member-code">{m.code}</p>
          )}
        </div>

        <div className="member-stats">
          {account ? (
            <>
              <div>
                <strong>{account.referrals}</strong>
                <span>introduced</span>
              </div>
              <div>
                <strong>{account.raffleTickets.total}</strong>
                <span>{account.raffleTickets.total === 1 ? 'raffle ticket' : 'raffle tickets'}</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <strong>{m.points}</strong>
                <span>{m.points === 1 ? 'point' : 'points'}</span>
              </div>
              <div>
                <strong>{m.referrals.length}</strong>
                <span>introduced</span>
              </div>
            </>
          )}
        </div>

        <p className="member-lead">
          {account
            ? 'Show this at the counter. It changes every minute and each one is good for a single scan, so a screenshot cannot be used by anyone else.'
            : 'Show this when you arrive. One point a day per business — scanning the same shop twice in an afternoon does not count twice.'}
        </p>

        {/*
          THE TILL, SIMULATED.

          There is no business-facing app, so these buttons stand in for a shop
          scanning the card. They are labelled as a simulation rather than
          dressed up as the real thing, because a customer who believes they
          have earned a point they have not is the one failure this programme
          cannot afford.
        */}
        {isMember() && (
        <>
        <h2 className="member-h">Simulate a shop scanning you</h2>
        {/*
          EVERY listed business, not the first four.

          slice(0, 4) meant a visit could only ever be recorded at four of the
          thirteen, so the places-visited count on the profile — the number that
          whole page is built around — could not go above four however much
          somebody used the app. An arbitrary cap on the only thing that feeds
          the headline figure.
        */}
        <div className="member-sim">
          {LISTED_KITCHENS.map((b) => {
            const offer = b.offers?.welcome && !b.offers?.mock ? b.offers.welcome : null
            const canWelcome = offer ? welcomeAvailable(b.id) : false
            return (
              <button
                key={b.id}
                className="member-sim-row"
                onClick={() => {
                  const r = checkIn(b.id)
                  /*
                    The welcome offer is spent on the FIRST visit and never
                    again — which is what "welcome" means, and is the half of
                    the operator's design that existed in lib/member.ts with
                    nothing anywhere calling it.
                  */
                  const used = canWelcome ? useWelcome(b.id) : false
                  setM(member())
                  if (used) say(`Welcome offer honoured at ${b.name}`)
                  else say(r.ok ? `+1 point at ${b.name}` : `Already counted at ${b.name} today`)
                }}
              >
                <span className="member-sim-mark" style={{ background: b.logo.bg.split('|')[0] }} />
                <span>{b.name}</span>
                {/* Inline rather than a class: a workflow is editing styles.css
                    concurrently and one small badge is not worth the collision. */}
                {canWelcome && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '2px 8px',
                      borderRadius: 8,
                      background: 'rgba(48, 209, 88, 0.18)',
                      color: '#1a6b2e',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    WELCOME
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          className="btn-secondary"
          onClick={() => {
            leave()
            setM(member())
            setInitials('')
            setPhone('')
          }}
        >
          Forget this card
        </button>

        <p className="member-fineprint">
          Points are counted on this phone only and are not worth anything yet — no rate has been
          set and nothing can be redeemed. When a shop can really scan this, that is what changes.
        </p>
        </>
        )}

        {account && (
          <p className="member-fineprint">
            {account.tierStatus === 'active'
              ? 'A shop that scans this sees your first name and what your membership honours, and nothing else.'
              : 'A shop that scans this sees your first name. Offers are honoured once a membership is paid and active.'}
          </p>
        )}

        {note && (
          <div className="dialer-toast" role="status">
            {note}
          </div>
        )}
      </div>
    </AppChrome>
  )
}
