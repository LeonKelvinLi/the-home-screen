import { useState } from 'react'
import { useGate } from '../lib/gate'
import { shareLink } from '../lib/account'
import { tierById } from '../data/membership'

/**
 * The member's own panel: their QR, their code, and what their referrals have
 * earned so far.
 *
 * HIS BRIEF PUTS THIS ON THE PROFILE PAGE — "the User gets their own
 * personalized QR code assigned to their profile page. They can use this QR
 * code to share the website link to anyone and this will keep track of newly
 * enrolled member sign ups recruited by that user."
 *
 * THE QR IS SERVED, NOT DRAWN HERE. /api/members/qr.svg needs the session to
 * know whose code to encode, so it is an <img> against an endpoint rather than
 * a canvas: the browser caches it, it stays crisp when somebody holds a phone up
 * to the screen, and there is no way for the client to render a code for a
 * member it is not signed in as.
 *
 * THE LINK IS SHOWN BESIDE IT because most people will SEND their code rather
 * than have it scanned. A QR alone is useless in a text message.
 */
export function MemberPanel({ businessLink }: { businessLink?: string } = {}) {
  const { account } = useGate()
  const [copied, setCopied] = useState<'friend' | 'business' | null>(null)
  /* Since 2026-09-30 it lives on Profile's Earn tab, with a second code: the
     business link (/r/<code>), for a business asking for a spot. */
  const [qr, setQr] = useState<'friend' | 'business'>('friend')
  if (!account) return null

  const tier = tierById(account.tier)
  const link = shareLink(account.referralCode)
  const { referrals, rewards, raffleTickets } = account

  async function share(which: 'friend' | 'business') {
    const url = which === 'business' && businessLink ? businessLink : link
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BEASTY', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(which)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      /* sheet dismissed — not an error worth a message */
    }
  }

  return (
    <section className="mp">
      <h2 className="prof-h">Your code</h2>

      <div className="mp-qr">
        <img
          src={qr === 'business' ? '/api/members/qr.svg?for=business' : '/api/members/qr.svg'}
          alt={`QR code for ${qr === 'business' ? 'your business link' : `referral ${account.referralCode}`}`}
        />
        <div className="mp-qr-side">
          <span className="mp-code">{account.referralCode}</span>
          <button className="btn-secondary" onClick={() => void share('friend')}>
            {copied === 'friend' ? 'Link copied' : 'Share friend link'}
          </button>
          {businessLink && (
            <button className="btn-secondary" onClick={() => void share('business')}>
              {copied === 'business' ? 'Link copied' : 'Share business link'}
            </button>
          )}
        </div>
      </div>
      {businessLink && (
        <div className="aff-seg aff-seg-small mp-qr-switch" role="tablist" aria-label="Which QR code">
          <button role="tab" aria-selected={qr === 'friend'} className={qr === 'friend' ? 'on' : ''} onClick={() => setQr('friend')}>
            QR for friends
          </button>
          <button role="tab" aria-selected={qr === 'business'} className={qr === 'business' ? 'on' : ''} onClick={() => setQr('business')}>
            QR for businesses
          </button>
        </div>
      )}

      <h2 className="prof-h">What it has earned</h2>
      <div className="mp-stats">
        <div className="mp-stat">
          <span className="mp-stat-n">{referrals}</span>
          <span className="mp-stat-l">sign-ups</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat-n">{raffleTickets.unused}</span>
          <span className="mp-stat-l">raffle tickets</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat-n">${rewards.discount}</span>
          <span className="mp-stat-l">off next month</span>
        </div>
      </div>

      {/*
        SAY WHERE THEY ARE, not just what they have. "Two more sign-ups for your
        next ticket" is the line that makes somebody send the link again; a bare
        count is a scoreboard nobody acts on.
      */}
      <p className="mp-next">
        {`${rewards.toNextTicket} more ${rewards.toNextTicket === 1 ? 'sign-up' : 'sign-ups'} for your next raffle ticket.`}
      </p>

      {/*
        THE TWO REWARDS STOP IN DIFFERENT PLACES and the difference only matters
        once somebody reaches it, so it is said exactly then rather than as
        standing small print nobody reads.
      */}
      {rewards.discountCapped && tier && (
        <p className="mp-note">Your discount is at its ${tier.discountCap} maximum.</p>
      )}
    </section>
  )
}
