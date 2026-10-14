import type { ReactNode } from 'react'
import disclosures from './disclosures.json'
import './forms.css'

interface AgreementProgress {
  available: boolean
  mode: string
  status: string
  linkReady: boolean
  reviewRequested: boolean
  affiliateSigned: boolean
  countersigned: boolean
}

const DOCUMENTS = [
  ['Tax information', 'Review the official Form W-9 and provide the taxpayer details that apply to you.'],
  ['Direct deposit', 'Confirm the account where you want to receive payments. The authorization covers credits only.'],
  ['Identity document', 'Upload a clear image of your current license, state ID or passport directly to DocuSeal.'],
  ['Affiliate agreement', 'Read BEASTY’s prepared terms and written disclosures, then apply your own signature.'],
] as const

function packetStatus(a: AgreementProgress) {
  if (a.affiliateSigned) return ['Signed', 'Your signature has been recorded.']
  if (a.mode === 'manual' && a.reviewRequested) return ['In review', 'BEASTY is checking the packet you reported completing.']
  if (a.status === 'declined') return ['Declined', 'You declined to sign this request.']
  if (a.status === 'expired') return ['Expired', 'Your signing link needs to be replaced.']
  if (!a.available) return ['Being finalized', 'You can submit your application details while BEASTY finalizes the packet.']
  if (a.mode === 'manual' && a.status === 'requested') return ['Preparing', 'BEASTY will email you when your private packet is ready.']
  if (a.linkReady) return ['Ready to sign', 'Open your private packet, check the details, upload your ID and sign.']
  return ['Not started', 'Request your packet when your application details are complete.']
}

export function FormsOverview({ forms, agreement, action }: { forms: boolean; agreement: AgreementProgress; action: ReactNode }) {
  const [status, description] = packetStatus(agreement)
  return <div className="onb-documents">
    <div className="onb-document-intro">
      <h2>{forms ? 'Your onboarding packet' : 'Your prepared agreement'}</h2>
      <p>BEASTY prepares the program terms and disclosures. You review the documents, confirm your information and sign.</p>
    </div>
    <div className="onb-document-grid">
      <section className="onb-document-contents" aria-label="Documents to complete">
        <ul>
          {(forms ? DOCUMENTS : DOCUMENTS.slice(3)).map(([title, text]) => <li key={title}>
            <svg aria-hidden="true" width="23" height="27" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 2h10l6 6v18H4z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 21h5"/></svg>
            <div><h3>{title}</h3><p>{text}</p></div>
          </li>)}
        </ul>
        {forms && <p className="onb-document-privacy">Your taxpayer number, bank details and ID image go directly to DocuSeal. BEASTY’s application database stores your application details and review status.</p>}
      </section>
      <aside className="onb-document-action" aria-label="Next signing step">
        <h3>{agreement.affiliateSigned ? 'Your signing step is complete' : agreement.reviewRequested ? 'Waiting for review' : !agreement.available ? 'The packet is being finalized' : agreement.linkReady ? 'Your packet is ready' : agreement.status === 'requested' ? 'Your packet has been requested' : 'Prepare your packet'}</h3>
        {action}
      </aside>
    </div>
    <section className="onb-signing-progress" aria-labelledby="onb-signing-progress-title">
      <h3 id="onb-signing-progress-title">Signing progress</h3>
      <ol>
        <li><span className="onb-progress-number" aria-hidden="true">1</span><div><b>Your documents and signature</b><p>{description}</p></div><span className="onb-tag" data-tone={agreement.affiliateSigned ? 'good' : ['declined', 'expired'].includes(agreement.status) ? 'bad' : undefined}>{status}</span></li>
        <li><span className="onb-progress-number" aria-hidden="true">2</span><div><b>BEASTY’s countersignature</b><p>{agreement.countersigned ? 'BEASTY’s signature has been checked.' : 'BEASTY reviews the packet and signs after you.'}</p></div><span className="onb-tag" data-tone={agreement.countersigned ? 'good' : undefined}>{agreement.countersigned ? 'Complete' : 'After you'}</span></li>
      </ol>
    </section>
    <section className="onb-disclosures" aria-labelledby="onb-disclosures-title">
      <h3 id="onb-disclosures-title">Before you sign</h3>
      <p>The packet includes these written disclosures. Read them with the final agreement; you do not need to write disclosure text.</p>
      {(forms ? disclosures : disclosures.filter((_, i) => [0, 5, 6, 7].includes(i))).map(item => <details key={item.title}><summary>{item.title}</summary><p>{item.text}</p></details>)}
    </section>
  </div>
}
