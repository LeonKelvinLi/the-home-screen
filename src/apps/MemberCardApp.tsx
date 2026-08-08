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
} from '../lib/member'
import { LISTED_KITCHENS } from '../data/brands'
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

export function MemberCardApp({ api }: { api: ShellApi }) {
  const [m, setM] = useState(() => member())
  const [initials, setInitials] = useState('')
  const [phone, setPhone] = useState('')
  const [qr, setQr] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  /*
    The QR is drawn from the code, not stored with it. Error correction M and a
    zero quiet zone: the card supplies its own white margin, and a doubled one
    only makes the modules smaller for a scanner to find.
  */
  useEffect(() => {
    if (!m.code) return setQr(null)
    let alive = true
    void QRCode.toString(m.code, {
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
  }, [m.code])

  const say = (s: string) => {
    setNote(s)
    window.setTimeout(() => setNote(null), 2600)
  }

  if (!isMember()) {
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
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            maxLength={4}
            autoComplete="off"
          />
          <input
            className="co-input"
            placeholder="Last 4 of your phone"
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
          <p className="member-fineprint">
            This is a working preview. The card is made on this phone and stays on it — nothing is
            sent anywhere, no account is created, and this code is a name badge rather than a
            password. Nothing that costs money is ever authorised by it.
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
          <p className="member-code">{m.code}</p>
        </div>

        <div className="member-stats">
          <div>
            <strong>{m.points}</strong>
            <span>{m.points === 1 ? 'point' : 'points'}</span>
          </div>
          <div>
            <strong>{m.referrals.length}</strong>
            <span>introduced</span>
          </div>
        </div>

        <p className="member-lead">
          Show this when you arrive. One point a day per business — scanning the same shop twice in
          an afternoon does not count twice.
        </p>

        {/*
          THE TILL, SIMULATED.

          There is no business-facing app, so these buttons stand in for a shop
          scanning the card. They are labelled as a simulation rather than
          dressed up as the real thing, because a customer who believes they
          have earned a point they have not is the one failure this programme
          cannot afford.
        */}
        <h2 className="member-h">Simulate a shop scanning you</h2>
        <div className="member-sim">
          {LISTED_KITCHENS.slice(0, 4).map((b) => (
            <button
              key={b.id}
              className="member-sim-row"
              onClick={() => {
                const r = checkIn(b.id)
                setM(member())
                say(r.ok ? `+1 point at ${b.name}` : `Already counted at ${b.name} today`)
              }}
            >
              <span className="member-sim-mark" style={{ background: b.logo.bg.split('|')[0] }} />
              <span>{b.name}</span>
            </button>
          ))}
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

        {note && (
          <div className="dialer-toast" role="status">
            {note}
          </div>
        )}
      </div>
    </AppChrome>
  )
}
