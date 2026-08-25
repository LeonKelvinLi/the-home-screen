import { useState } from 'react'
import { useGate } from '../lib/gate'
import { shareLink } from '../lib/account'
import { tierById, PER_MILESTONE_REFERRALS, DISCOUNT_PER_MILESTONE } from '../data/membership'

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
export function MemberPanel() {
  const { account } = useGate()
  const [copied, setCopied] = useState(false)
  if (!account) return null

  const tier = tierById(account.tier)
  const link = shareLink(account.referralCode)
  const { referrals, rewards, raffleTickets } = account

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BEASTY', url: link })
        return
      }
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* sheet dismissed — not an error worth a message */
    }
  }

  return (
    <section className="mp">
      <h2 className="prof-h">Your code</h2>

      <div className="mp-qr">
        <img src="/api/members/qr.svg" alt={`QR code for referral ${account.referralCode}`} />
        <div className="mp-qr-side">
          <span className="mp-code">{account.referralCode}</span>
          <p className="mp-lead">
            Anyone who signs up through this counts as your referral.
          </p>
          <button className="btn-secondary" onClick={share}>
            {copied ? 'Link copied' : 'Share your link'}
          </button>
        </div>
      </div>

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
        {rewards.toNextTicket === PER_MILESTONE_REFERRALS && referrals === 0
          ? `Your first ${PER_MILESTONE_REFERRALS} sign-ups earn a raffle ticket.`
          : `${rewards.toNextTicket} more ${rewards.toNextTicket === 1 ? 'sign-up' : 'sign-ups'} for your next raffle ticket.`}
      </p>

      {/*
        THE TWO REWARDS STOP IN DIFFERENT PLACES and the difference only matters
        once somebody reaches it, so it is said exactly then rather than as
        standing small print nobody reads.
      */}
      {rewards.discountCapped && tier && (
        <p className="mp-note">
          Your discount is at its ${tier.discountCap} maximum. Raffle tickets keep coming — one
          for every {PER_MILESTONE_REFERRALS} sign-ups, with no limit.
        </p>
      )}

      {!tier && referrals > 0 && (
        <p className="mp-note">
          Referral credit comes off a membership fee, so ${DISCOUNT_PER_MILESTONE} per{' '}
          {PER_MILESTONE_REFERRALS} sign-ups starts counting once you take a membership. Your
          raffle tickets are yours either way.
        </p>
      )}
    </section>
  )
}
