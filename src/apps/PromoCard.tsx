import type { Promotion } from '../data/promotions'
import type { ShellApi } from '../ios/Device'

export function PromoCard({ promo, api }: { promo: Promotion; api: ShellApi }) {
  return (
    <div className="reel-promo" style={{ background: promo.accent }}>
      <span className="reel-promo-label">BEASTY promotion</span>
      <p className="reel-promo-eyebrow">{promo.eyebrow}</p>
      <h2>{promo.title.map(line => <span key={line}>{line}</span>)}</h2>
      <p className="reel-promo-price">{promo.price}</p>
      <p className="reel-promo-sub">{promo.sub}</p>
      <ul>{promo.points.map(point => <li key={point}>{point}</li>)}</ul>
      <p className="reel-promo-note">{promo.note}</p>
      <div className="reel-promo-actions">
        {promo.app
          ? <button className="reel-promo-cta" onClick={() => api.openApp(promo.app!)}>{promo.action} ↗</button>
          : <a className="reel-promo-cta" href={promo.href} target="_blank" rel="noopener noreferrer">{promo.action} ↗</a>}
        <a className="reel-promo-download" href={`/promos/${promo.id}.pdf`} download>Save the flyer (PDF)</a>
      </div>
    </div>
  )
}
