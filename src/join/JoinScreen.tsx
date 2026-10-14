/*
  /join: the BEASTY affiliate onboarding portal (server/onboarding.ts).

  One connected journey, phone first: invite link -> sign in with the usual
  BEASTY code -> three steps (your information, forms & agreement, review)
  -> a dashboard that says where the application stands. The forms (W-9,
  direct deposit, a photo of their ID) and the agreement are one DocuSeal
  packet, opened on DocuSeal's own page; the step tells you before it sends you
  there and checks again when you come back. A Get paid step with Stripe
  Connect sits between the first two only when payouts are switched on, which
  they are not for now (server/onboarding.ts).

  Nothing on these screens claims more than is true: a step that is not set up
  yet says so, "saved" appears only after the server confirms it, and signing
  is read back from DocuSeal, never inferred from a button press.
*/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './join.css'

/* ------------------------------------------------------------------ api ---- */

class ApiErr extends Error {
  constructor(public status: number, public body: Record<string, unknown>) {
    super(String(body.error ?? `HTTP ${status}`))
  }
}

async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const r = await fetch(path, {
    method: opts.method ?? 'GET',
    credentials: 'same-origin',
    headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const body = (await r.json().catch(() => ({}))) as Record<string, unknown>
  if (!r.ok) throw new ApiErr(r.status, body)
  return body as T
}

/* ---------------------------------------------------------------- types ---- */

interface Profile {
  legalFirst?: string
  legalLast?: string
  preferredName?: string
  email?: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  kind?: 'individual' | 'business'
  businessName?: string
  website?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  promote?: string[]
  promoteNote?: string
}
type Tri = 'needed' | 'pending' | 'complete'
interface Bundle {
  id: string
  status: 'in_progress' | 'submitted' | 'changes_requested' | 'approved' | 'rejected' | 'suspended'
  revision: number
  profile: Profile
  steps: {
    profile: { complete: boolean; problems: Record<string, string> }
    payouts: { available: boolean; started: boolean; complete: boolean; identity: Tri; tax: Tri; bank: 'needed' | 'complete'; bankLast4: string | null }
    agreement: { available: boolean; mode: 'off' | 'mock' | 'live' | 'manual'; status: string; linkReady: boolean; reviewRequested: boolean; affiliateSigned: boolean; countersigned: boolean; completedAt: number | null }
  }
  submittedAt: number | null
  decidedAt: number | null
  decisionNote: string
  testMode: boolean
}

/* Same rules as server/onboarding.ts profileProblems, so the form can say
   what's missing before a round trip; the server stays the judge. */
const STATES = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR'.split(' '))
function problems(p: Profile): Record<string, string> {
  const e: Record<string, string> = {}
  const t = (s?: string) => (s ?? '').trim()
  if (!t(p.legalFirst)) e.legalFirst = 'Your legal first name, as on your ID.'
  if (!t(p.legalLast)) e.legalLast = 'Your legal last name, as on your ID.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t(p.email))) e.email = 'An email address we can reach you at.'
  const d = t(p.phone).replace(/\D/g, '')
  if (d.length < 10 || d.length > 15) e.phone = 'A phone number with area code.'
  if (!t(p.line1)) e.line1 = 'Street address.'
  if (!t(p.city)) e.city = 'City.'
  if (!STATES.has(t(p.state).toUpperCase())) e.state = 'Two-letter state, like CA.'
  if (!/^\d{5}(-?\d{4})?$/.test(t(p.zip))) e.zip = 'Five-digit ZIP code.'
  if (p.kind !== 'individual' && p.kind !== 'business') e.kind = 'Choose individual or business.'
  if (p.kind === 'business' && !t(p.businessName)) e.businessName = 'The business’s legal name.'
  if (!p.promote?.length) e.promote = 'Pick at least one way you’ll share BEASTY.'
  return e
}

const PROMOTE: [string, string][] = [
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
  ['facebook', 'Facebook'],
  ['website', 'My website'],
  ['in_person', 'In person'],
  ['email', 'Email or text'],
  ['other', 'Something else'],
]

/* The steps by number. Get paid (1) is Stripe Connect and is shown only when payouts
   are switched on; without it the journey is 0, 2, 3 and step 2 carries the forms. */
const STEPS = ['Your information', 'Get paid', 'Forms & agreement', 'Review & submit'] as const
const orderOf = (payouts: boolean) => (payouts ? [0, 1, 2, 3] : [0, 2, 3])
const COUNT = ['', 'One', 'Two', 'Three', 'Four']

/* ---------------------------------------------------------------- icons ---- */

const Lock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

/* ---------------------------------------------------------------- shell ---- */

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function Bar({ save, test }: { save?: SaveState; test?: boolean }) {
  const label = save === 'saving' ? 'Saving…' : save === 'saved' ? 'All changes saved' : save === 'error' ? 'Not saved — retrying' : ''
  return (
    <header className="onb-bar">
      <a className="onb-mark" href="/" aria-label="BEASTY Pages home">
        <span className="onb-pill-mark" aria-hidden="true">
          <span>BEASTY</span>
          <span>PAGES</span>
        </span>
        <span className="onb-mark-sub">Affiliates</span>
      </a>
      <div className="onb-bar-right">
        {test && <span className="onb-test">Test mode</span>}
        {label && (
          <span className="onb-save" data-state={save} role="status" aria-live="polite">
            {label}
          </span>
        )}
      </div>
    </header>
  )
}

/* Yellow head with the step's name, the white sheet under it, the buttons docked at the bottom. */
function Page({ save, test, head, children, dock }: { save?: SaveState; test?: boolean; head: React.ReactNode; children: React.ReactNode; dock?: React.ReactNode }) {
  return (
    <div className="onb">
      <Bar save={save} test={test} />
      <div className="onb-stage">
        <header className="onb-head">{head}</header>
        <main className="onb-sheet">
          {children}
          {dock && <div className="onb-dock">{dock}</div>}
        </main>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <Page head={<div className="onb-skeleton" style={{ width: '60%', height: 44, background: 'rgba(0,0,0,.12)' }} />}>
      <div aria-busy="true">
        <div className="onb-skeleton" style={{ width: '45%', height: 26 }} />
        <div className="onb-skeleton" style={{ width: '80%' }} />
        <div className="onb-skeleton" style={{ width: '70%' }} />
      </div>
    </Page>
  )
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Page head={<h1 className="onb-title">{title}</h1>}>
      <p className="onb-copy">{children}</p>
    </Page>
  )
}

/* -------------------------------------------------------------- welcome ---- */

const PAD: [string, string][] = [
  ['Your information', 'Name, contact details and how you’ll share BEASTY.'],
  ['Get paid', 'Verify your identity, add tax details and a bank account with Stripe.'],
  ['Forms & agreement', 'Your W-9, where to send your pay, a photo of your ID, and the affiliate agreement, signed in one go.'],
  ['Review & submit', 'Check everything and send it to BEASTY.'],
]
const PAD_WITH_STRIPE: Record<number, [string, string]> = { 2: ['Agreement', 'Read and sign the BEASTY affiliate agreement.'] }

function Welcome({ name, payouts, onStart }: { name: string; payouts: boolean; onStart: () => void }) {
  const first = name.trim().split(/\s+/)[0]
  const steps = orderOf(payouts).map((i) => (payouts && PAD_WITH_STRIPE[i]) || PAD[i])
  return (
    <div className="onb onb-welcome">
      <Bar />
      <main className="onb-hero">
        <div className="onb-hero-grid">
          <div>
            {first && <p className="onb-hello">Hi {first},</p>}
            <h1>Join the BEASTY affiliate program</h1>
            <p className="onb-lede">Share BEASTY with your people and get paid for the members and businesses you bring in. {COUNT[steps.length]} steps, about ten minutes, and you can stop and pick it up later.</p>
          </div>
          <ol className="onb-pad" aria-label={`The ${COUNT[steps.length].toLowerCase()} steps`}>
            {steps.map(([t, d], i) => (
              <li key={t}>
                <span className="onb-key" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <b>{t}</b>
                  <span>{d}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="onb-hero-cta">
          <button className="onb-btn onb-btn-primary" onClick={onStart}>
            Get started
          </button>
          <span className="onb-quiet">Your progress saves as you go.</span>
        </div>
        <div className="onb-trust">
          <Lock />
          <p>
            {payouts
              ? 'Your Social Security number, bank account and ID go straight to Stripe, BEASTY’s payments partner. BEASTY never sees or stores them.'
              : 'Your Social Security number, bank details and ID photo go on DocuSeal’s secure forms, never into the BEASTY app. BEASTY uses them only to pay you and to file your 1099.'}
          </p>
        </div>
      </main>
    </div>
  )
}

/* -------------------------------------------------------------- sign in ---- */

function SignIn({ defaultName, onSignedIn }: { defaultName: string; onSignedIn: () => void }) {
  const [by, setBy] = useState<'phone' | 'email'>('phone')
  const [name, setName] = useState(defaultName)
  const [dest, setDest] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await api('/api/members/start', { method: 'POST', body: { name: name.trim(), [by]: dest.trim() } })
      setSent(true)
    } catch (x) {
      setErr(x instanceof ApiErr ? x.message : 'Couldn’t reach BEASTY. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }
  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await api('/api/members/verify', { method: 'POST', body: { [by]: dest.trim(), code: code.trim() } })
      onSignedIn()
    } catch (x) {
      setErr(x instanceof ApiErr ? x.message : 'Couldn’t reach BEASTY. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      head={
        <>
          <h1 className="onb-title">{sent ? 'Enter your code' : 'Sign in'}</h1>
          <p className="onb-lede">
            {sent ? `We sent a 6-digit code to ${dest}.` : 'Use your BEASTY account if you have one. If you don’t, this makes one; there’s no password, just a code.'}
          </p>
        </>
      }
    >
      {!sent ? (
        <form onSubmit={send}>
          <div className="onb-fields">
            <div className="onb-field">
              <label htmlFor="j-name">Your name</label>
              <input id="j-name" className="onb-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div className="onb-choice" role="group" aria-label="Send my code by">
              <button type="button" aria-pressed={by === 'phone'} onClick={() => setBy('phone')}>
                Text me
              </button>
              <button type="button" aria-pressed={by === 'email'} onClick={() => setBy('email')}>
                Email me
              </button>
            </div>
            <div className="onb-field">
              <label htmlFor="j-dest">{by === 'phone' ? 'Mobile number' : 'Email'}</label>
              <input
                id="j-dest"
                className="onb-input"
                type={by === 'phone' ? 'tel' : 'email'}
                inputMode={by === 'phone' ? 'tel' : 'email'}
                autoComplete={by === 'phone' ? 'tel' : 'email'}
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                required
              />
            </div>
          </div>
          {err && (
            <p className="onb-err" role="alert" style={{ marginTop: 14 }}>
              {err}
            </p>
          )}
          <div className="onb-dock">
            <button className="onb-btn onb-btn-primary" disabled={busy || name.trim().length < 2 || !dest.trim()}>
              {busy ? 'Sending…' : 'Send my code'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={verify}>
          <div className="onb-field">
            <label htmlFor="j-code">6-digit code</label>
            <input
              id="j-code"
              className="onb-input onb-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>
          {err && (
            <p className="onb-err" role="alert" style={{ marginTop: 14 }}>
              {err}
            </p>
          )}
          <p style={{ marginTop: 18 }}>
            <button type="button" className="onb-link" onClick={() => { setSent(false); setCode(''); setErr('') }}>
              Use a different {by === 'phone' ? 'number' : 'email'}
            </button>
          </p>
          <div className="onb-dock">
            <button className="onb-btn onb-btn-primary" disabled={busy || code.length !== 6}>
              {busy ? 'Checking…' : 'Continue'}
            </button>
          </div>
        </form>
      )}
    </Page>
  )
}

/* ---------------------------------------------------------- onboarding ---- */

function useAutosave(bundle: Bundle, onConflict: (p: Profile, rev: number) => void) {
  const [save, setSave] = useState<SaveState>('idle')
  const rev = useRef(bundle.revision)
  const pending = useRef<Profile | null>(null)
  const inflight = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  const flush = useCallback(async (): Promise<boolean> => {
    if (inflight.current) return false
    const next = pending.current
    if (!next) return true
    pending.current = null
    inflight.current = true
    setSave('saving')
    try {
      const r = await api<{ revision: number }>('/api/onboarding/me/profile', { method: 'PUT', body: { revision: rev.current, profile: next } })
      rev.current = r.revision
      inflight.current = false
      if (pending.current) return flush()
      setSave('saved')
      return true
    } catch (x) {
      inflight.current = false
      if (x instanceof ApiErr && x.status === 409 && typeof x.body.revision === 'number') {
        rev.current = x.body.revision as number
        if (x.body.profile) onConflict(x.body.profile as Profile, rev.current)
        setSave('saved')
        return true
      }
      /* Keep the unsaved change and try again shortly; never drop typing. */
      pending.current = pending.current ?? next
      setSave('error')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => void flush(), 3000)
      return false
    }
  }, [onConflict])

  const queue = useCallback(
    (p: Profile) => {
      pending.current = p
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => void flush(), 700)
    },
    [flush],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])
  return { save, queue, flush }
}

function Field({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="onb-field">
      <label htmlFor={id}>
        {label}
        {optional && <small>Optional</small>}
      </label>
      {children}
      {error ? <p className="onb-err" id={`${id}-err`}>{error}</p> : hint ? <p className="onb-hint">{hint}</p> : null}
    </div>
  )
}

function ManualForms({ bundle, reload, beforeAction }: { bundle: Bundle; reload: (refresh?: boolean) => Promise<void>; beforeAction?: () => Promise<boolean> }) {
  const a = bundle.steps.agreement
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const run = async (action: 'open' | 'review' | 'refresh') => {
    setBusy(true); setError('')
    try {
      if (beforeAction && !await beforeAction()) throw new Error('Wait for your details to save, then try again.')
      if (action === 'open') {
        const r = await api<{ url?: string; requested?: boolean }>('/api/onboarding/me/agreement/sign', { method: 'POST' })
        if (r.url) { window.location.assign(r.url); return }
      } else if (action === 'review') {
        await api('/api/onboarding/me/agreement/review', { method: 'POST' })
      }
      await reload(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t reach BEASTY. Try again.')
    } finally { setBusy(false) }
  }
  return <div className="onb-manual">
    <p className="onb-copy">{a.affiliateSigned
      ? a.countersigned ? 'BEASTY checked your forms and both signatures in DocuSeal.' : 'BEASTY checked your signed forms. Your packet is waiting for BEASTY’s countersignature.'
      : a.reviewRequested ? 'You reported finishing your packet. BEASTY will check the forms, ID upload and signature in DocuSeal.'
      : a.linkReady ? 'Your private packet is ready. Fill it in and upload your ID on DocuSeal. After signing, return to this page and request review.'
      : a.status === 'requested' ? 'BEASTY is preparing your packet using the approved agreement. We will email you when it is ready. You can send your application details now.'
      : 'Request your forms and BEASTY will prepare your private DocuSeal packet. You can send your application details while it is being prepared.'}</p>
    {!a.affiliateSigned && (a.linkReady || a.status === 'not_started') && <button className="onb-btn onb-btn-primary onb-btn-block" disabled={busy || !bundle.steps.profile.complete} onClick={()=>void run('open')}>
      {busy ? 'Opening…' : a.linkReady ? 'Open forms in DocuSeal' : 'Request my forms'}
    </button>}
    {a.linkReady && !a.affiliateSigned && !a.reviewRequested && <button className="onb-btn onb-btn-block" disabled={busy} onClick={()=>void run('review')}>I finished — request review</button>}
    <button className="onb-link" disabled={busy} onClick={()=>void run('refresh')}>Refresh forms status</button>
    {!a.affiliateSigned && <p className="onb-quiet">Requesting review does not mark the packet as signed. BEASTY checks it in DocuSeal first.</p>}
    {error && <p className="onb-err" role="alert">{error}</p>}
  </div>
}

function Onboarding({ bundle, setBundle, reload }: { bundle: Bundle; setBundle: (b: Bundle) => void; reload: (refresh?: boolean) => Promise<void> }) {
  const forms = !bundle.steps.payouts.available
  const order = orderOf(!forms)
  const firstOpen = !bundle.steps.profile.complete ? 0 : !forms && !bundle.steps.payouts.complete ? 1 : !bundle.steps.agreement.affiliateSigned ? 2 : 3
  const [step, setStep] = useState(firstOpen)
  const [profile, setProfile] = useState<Profile>(bundle.profile)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showAll, setShowAll] = useState(false)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const top = useRef<HTMLDivElement>(null)

  const onConflict = useCallback((p: Profile) => {
    setProfile(p)
    setNotice('Your information was updated on another device, so this page now shows that version.')
  }, [])
  const { save, queue, flush } = useAutosave(bundle, onConflict)
  const errs = useMemo(() => problems(profile), [profile])
  const profileDone = Object.keys(errs).length === 0
  const done = [profileDone, bundle.steps.payouts.complete, bundle.steps.agreement.affiliateSigned, false]

  const set = (k: keyof Profile, v: string | string[]) => {
    const next = { ...profile, [k]: v }
    setProfile(next)
    queue(next)
  }
  const show = (k: string) => (showAll || touched[k] ? errs[k] : undefined)
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))
  const input = (k: keyof Profile, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => ({
    id: `p-${k}`,
    className: 'onb-input',
    value: (profile[k] as string | undefined) ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value),
    onBlur: blur(k),
    'aria-invalid': show(k) ? true : undefined,
    'aria-describedby': show(k) ? `p-${k}-err` : undefined,
    ...extra,
  })

  const go = async (n: number) => {
    await flush()
    setErr('')
    setStep(n)
    /* .onb is the scroller (join.css): back to the top, title and step keys in view. */
    document.querySelector('.onb')?.scrollTo({ top: 0 })
    if (n > 0) void reload()
  }

  const nextFromProfile = async () => {
    if (!profileDone) {
      setShowAll(true)
      const first = Object.keys(errs)[0]
      document.getElementById(`p-${first}`)?.focus()
      return
    }
    await go(order[1])
  }

  const openProvider = async (path: string) => {
    setBusy(true)
    setErr('')
    try {
      await flush()
      const r = await api<{ url: string }>(path, { method: 'POST' })
      window.location.assign(r.url)
    } catch (x) {
      setErr(x instanceof ApiErr ? x.message : 'Couldn’t reach BEASTY. Check your connection and try again.')
      setBusy(false)
    }
  }

  const submit = async () => {
    setBusy(true)
    setErr('')
    try {
      await flush()
      const b = await api<Bundle>('/api/onboarding/me/submit', { method: 'POST' })
      setBundle(b)
    } catch (x) {
      setErr(x instanceof ApiErr ? x.message : 'Couldn’t reach BEASTY. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const p = bundle.steps.payouts
  const a = bundle.steps.agreement
  const tri = (s: Tri | 'needed' | 'complete'): [string, string] =>
    s === 'complete' ? ['Done', 'good'] : s === 'pending' ? ['Stripe is checking', 'warn'] : [p.started ? 'Still needed' : 'Not started', '']
  /* A step BEASTY has not switched on yet does not hold the application back (server/onboarding.ts). */
  const canSubmit = profileDone && (p.complete || !p.available) && (a.affiliateSigned || !a.available || a.mode === 'manual')
  const later = [!a.affiliateSigned && (!a.available || a.mode === 'manual') && (forms ? 'your forms and agreement' : 'the agreement')].filter(Boolean) as string[]
  const copy = (i: number) => copyOf(i, forms)

  const prev = order[order.indexOf(step) - 1]
  const back =
    prev !== undefined ? (
      <button className="onb-btn onb-back" onClick={() => void go(prev)} aria-label={`Back to ${copy(prev).title}`}>
        Back
      </button>
    ) : null

  const head = (
    <>
      <p className="onb-kicker">
        Step {order.indexOf(step) + 1} of {order.length}
      </p>
      <h1 className="onb-title" id={`s${step}`}>
        {copy(step).title}
      </h1>
      <p className="onb-lede">{copy(step).lede}</p>
      <nav className="onb-keys" aria-label="Steps">
        <ol>
          {order.map((i, k) => (
            <li key={STEPS[i]}>
              <button type="button" aria-current={i === step ? 'step' : undefined} aria-label={`Step ${k + 1}, ${copy(i).title}${done[i] ? ', done' : ''}`} onClick={() => void go(i)}>
                <span className="onb-key" data-state={i === step ? 'on' : done[i] ? 'done' : undefined} aria-hidden="true">
                  {done[i] && i !== step ? <Check /> : k + 1}
                </span>
                <span className="onb-key-label" aria-hidden="true">
                  {copy(i).short}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <p className="onb-head-note">Saved as you go. Close this page any time and come back to beastypages.com/join.</p>
    </>
  )

  let body: React.ReactNode = null
  let dock: React.ReactNode = null

  if (step === 0) {
    body = (
      <>
        <div className="onb-section">
          <h3>About you</h3>
          <div className="onb-fields two">
            <Field id="p-legalFirst" label="Legal first name" error={show('legalFirst')}>
              <input {...input('legalFirst', { autoComplete: 'given-name' })} />
            </Field>
            <Field id="p-legalLast" label="Legal last name" error={show('legalLast')}>
              <input {...input('legalLast', { autoComplete: 'family-name' })} />
            </Field>
            <Field id="p-preferredName" label="What should we call you?" optional>
              <input {...input('preferredName', { autoComplete: 'nickname' })} />
            </Field>
            <Field id="p-phone" label="Mobile number" error={show('phone')}>
              <input {...input('phone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel' })} />
            </Field>
            <Field id="p-email" label="Email" error={show('email')}>
              <input {...input('email', { type: 'email', inputMode: 'email', autoComplete: 'email' })} />
            </Field>
          </div>
        </div>

        <div className="onb-section">
          <h3>Address</h3>
          <div className="onb-fields">
            <Field id="p-line1" label="Street address" error={show('line1')}>
              <input {...input('line1', { autoComplete: 'address-line1' })} />
            </Field>
            <Field id="p-line2" label="Apartment, suite, unit" optional>
              <input {...input('line2', { autoComplete: 'address-line2' })} />
            </Field>
          </div>
          <div className="onb-fields addr">
            <Field id="p-city" label="City" error={show('city')}>
              <input {...input('city', { autoComplete: 'address-level2' })} />
            </Field>
            <Field id="p-state" label="State" error={show('state')}>
              <input {...input('state', { autoComplete: 'address-level1', maxLength: 2, style: { textTransform: 'uppercase' } })} />
            </Field>
            <Field id="p-zip" label="ZIP" error={show('zip')}>
              <input {...input('zip', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 10 })} />
            </Field>
          </div>
        </div>

        <div className="onb-section">
          <h3>Joining as</h3>
          <div className="onb-choice" role="group" aria-label="Joining as" id="p-kind">
            <button type="button" aria-pressed={profile.kind === 'individual'} onClick={() => { set('kind', 'individual'); setTouched((t) => ({ ...t, kind: true })) }}>
              An individual
            </button>
            <button type="button" aria-pressed={profile.kind === 'business'} onClick={() => { set('kind', 'business'); setTouched((t) => ({ ...t, kind: true })) }}>
              A business
            </button>
          </div>
          {show('kind') && <p className="onb-err">{show('kind')}</p>}
          {profile.kind === 'business' && (
            <div className="onb-fields" style={{ marginTop: 16 }}>
              <Field id="p-businessName" label="Business legal name" error={show('businessName')} hint={forms ? 'As registered. Your EIN goes on your W-9 in the next step, not here.' : 'As registered. Your EIN goes to Stripe in the next step, not here.'}>
                <input {...input('businessName', { autoComplete: 'organization' })} />
              </Field>
            </div>
          )}
        </div>

        <div className="onb-section">
          <h3>How you’ll share BEASTY</h3>
          <div className="onb-chip-row" role="group" aria-label="How you’ll share BEASTY" id="p-promote">
            {PROMOTE.map(([k, l]) => {
              const on = !!profile.promote?.includes(k)
              return (
                <button
                  key={k}
                  type="button"
                  className="onb-chip"
                  aria-pressed={on}
                  onClick={() => {
                    const cur = profile.promote ?? []
                    set('promote', on ? cur.filter((x) => x !== k) : [...cur, k])
                    setTouched((t) => ({ ...t, promote: true }))
                  }}
                >
                  {l}
                </button>
              )
            })}
          </div>
          {show('promote') && <p className="onb-err">{show('promote')}</p>}
          <div className="onb-fields two" style={{ marginTop: 16 }}>
            <Field id="p-instagram" label="Instagram" optional>
              <input {...input('instagram', { placeholder: '@yourhandle', autoCapitalize: 'none' })} />
            </Field>
            <Field id="p-tiktok" label="TikTok" optional>
              <input {...input('tiktok', { placeholder: '@yourhandle', autoCapitalize: 'none' })} />
            </Field>
            <Field id="p-youtube" label="YouTube" optional>
              <input {...input('youtube', { autoCapitalize: 'none' })} />
            </Field>
            <Field id="p-website" label="Website" optional>
              <input {...input('website', { type: 'url', inputMode: 'url', placeholder: 'https://', autoCapitalize: 'none' })} />
            </Field>
          </div>
          <div className="onb-fields">
            <div className="onb-field">
              <label htmlFor="p-promoteNote">
                Anything else about how you’ll share BEASTY? <small>Optional</small>
              </label>
              <textarea id="p-promoteNote" className="onb-input" rows={3} value={profile.promoteNote ?? ''} maxLength={300} onChange={(e) => set('promoteNote', e.target.value)} />
            </div>
          </div>
        </div>
        {showAll && !profileDone && (
          <p className="onb-err" role="alert" style={{ marginTop: 20 }}>
            A few things above still need filling in.
          </p>
        )}
      </>
    )
    dock = (
      <button className="onb-btn onb-btn-primary" onClick={() => void nextFromProfile()}>
        Continue
      </button>
    )
  }

  if (step === 1) {
    body = (
      <>
        <ul className="onb-rows">
          {(
            [
              ['Identity check', 'Your legal name, date of birth and, if Stripe asks, a photo of your ID.', p.identity],
              ['Tax details', p_kind(bundle) === 'business' ? 'Your business’s EIN, for your 1099.' : 'Your Social Security number, for your 1099.', p.tax],
              ['Bank account', p.bankLast4 ? `Account ending ${p.bankLast4}.` : 'Where your commissions are deposited.', p.bank],
            ] as [string, string, Tri][]
          ).map(([t, d, st]) => {
            const [label, tone] = tri(st)
            return (
              <li key={t}>
                <div className="onb-row-text">
                  <b>{t}</b>
                  <span>{d}</span>
                </div>
                <span className="onb-tag" data-tone={(p.available && tone) || undefined}>
                  {p.available ? label : 'Opens soon'}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="onb-section">
          {p.available && !p.complete ? (
            <>
              <button className="onb-btn onb-btn-primary onb-btn-block" disabled={busy} onClick={() => void openProvider('/api/onboarding/me/payouts/link')}>
                {busy ? 'Opening Stripe…' : p.started ? 'Continue with Stripe' : 'Set up payouts with Stripe'}
              </button>
              <p className="onb-quiet" style={{ marginTop: 10 }}>
                You’ll leave BEASTY for Stripe’s secure page, then come straight back here.
              </p>
            </>
          ) : !p.available ? (
            <div className="onb-note" role="status">
              <b>Payout setup opens soon.</b> BEASTY is finishing its Stripe setup. You can send your application without it and finish this step when it opens.
            </div>
          ) : null}
        </div>
        <div className="onb-section">
          <div className="onb-trust">
            <Lock />
            <p>These details go straight to Stripe on Stripe’s own page. BEASTY never sees or stores your SSN, bank account or ID; we only see whether each step is done.</p>
          </div>
        </div>
        {err && (
          <p className="onb-err" role="alert" style={{ marginTop: 16 }}>
            {err}
          </p>
        )}
      </>
    )
    dock = (
      <>
        {back}
        <button className={`onb-btn ${p.available && !p.complete ? '' : 'onb-btn-primary'}`} onClick={() => void go(2)}>
          {p.available && !p.complete ? 'Skip for now' : 'Continue'}
        </button>
      </>
    )
  }

  if (step === 2) {
    body = (
      <>
        <div className="onb-section">
          <h3>{forms ? 'What’s in it' : 'What it covers'}</h3>
          <ul className="onb-list">
            {(forms ? PACKET : COVERS).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="onb-section">
          <ul className="onb-rows">
            <li>
              <div className="onb-row-text">
                <b>{forms ? 'Your forms and signature' : 'Your signature'}</b>
                <span>{a.affiliateSigned ? (forms ? 'Filled in and signed. Thank you.' : 'Signed. Thank you.') : a.mode === 'manual' && a.reviewRequested ? 'Waiting for BEASTY to check your packet.' : a.mode === 'manual' && a.status === 'requested' ? 'BEASTY is preparing your forms.' : a.status === 'declined' ? 'You declined to sign.' : a.status === 'expired' ? 'The signing link expired. Open it again.' : forms ? 'Not filled in yet.' : 'Not signed yet.'}</span>
              </div>
              <span className="onb-tag" data-tone={a.affiliateSigned ? 'good' : a.status === 'declined' || a.status === 'expired' ? 'bad' : undefined}>
                {!a.available ? 'Opens soon' : a.affiliateSigned ? 'Signed' : a.mode === 'manual' && a.reviewRequested ? 'In review' : a.mode === 'manual' && a.status === 'requested' ? 'Preparing' : 'To do'}
              </span>
            </li>
            <li>
              <div className="onb-row-text">
                <b>BEASTY’s countersignature</b>
                <span>{a.countersigned ? 'Countersigned.' : 'Added by BEASTY after you sign.'}</span>
              </div>
              <span className="onb-tag" data-tone={a.countersigned ? 'good' : undefined}>
                {a.countersigned ? 'Done' : 'After you'}
              </span>
            </li>
          </ul>
        </div>
        <div className="onb-section">
          {a.mode === 'manual' ? <ManualForms bundle={bundle} reload={reload} beforeAction={flush} /> : a.available && !a.affiliateSigned ? (
            <>
              <button className="onb-btn onb-btn-primary onb-btn-block" disabled={busy || !profileDone} onClick={() => void openProvider('/api/onboarding/me/agreement/sign')}>
                {busy ? 'Opening…' : forms ? 'Fill in and sign' : 'Review and sign'}
              </button>
              <p className="onb-quiet" style={{ marginTop: 10 }}>
                {!profileDone
                  ? `Finish your information first; the ${forms ? 'forms are' : 'agreement is'} filled in from it.`
                  : forms
                    ? 'The packet opens on DocuSeal, our e-signature service, with your name and address already filled in. You’ll come back here after signing.'
                    : 'The agreement opens on DocuSeal, our e-signature service, already filled in with your details. You’ll come back here after signing.'}
              </p>
            </>
          ) : !a.available ? (
            <div className="onb-note" role="status">
              {forms ? (
                <>
                  <b>The forms are being finalized.</b> You can send your application now and fill them in here when they’re ready.
                </>
              ) : (
                <>
                  <b>The agreement is being finalized.</b> You can send your application without it and sign here when it’s ready.
                </>
              )}
            </div>
          ) : null}
        </div>
        {forms && (
          <div className="onb-section">
            <div className="onb-trust">
              <Lock />
              <p>You type your Social Security number, bank details and ID photo into DocuSeal’s secure page, never into the BEASTY app. BEASTY uses them only to pay you and to file your 1099.</p>
            </div>
          </div>
        )}
        {err && (
          <p className="onb-err" role="alert" style={{ marginTop: 16 }}>
            {err}
          </p>
        )}
      </>
    )
    dock = (
      <>
        {back}
        <button className={`onb-btn ${a.available && !a.affiliateSigned ? '' : 'onb-btn-primary'}`} onClick={() => void go(3)}>
          {a.available && !a.affiliateSigned ? 'Skip for now' : 'Continue'}
        </button>
      </>
    )
  }

  if (step === 3) {
    body = (
      <>
        <ul className="onb-rows">
          {(
            [
              ['Your information', profileDone, true, 0, profileDone ? 'Complete' : 'Needs a few details'],
              ...(forms ? [] : [['Payout setup', p.complete, p.available, 1, p.complete ? `Complete${p.bankLast4 ? `, bank ending ${p.bankLast4}` : ''}` : 'Not finished']]),
              [forms ? 'Forms & agreement' : 'Affiliate agreement', a.affiliateSigned, a.available, 2, a.affiliateSigned ? 'Signed' : a.mode === 'manual' ? a.reviewRequested ? 'Waiting for BEASTY’s review' : a.linkReady ? 'Ready in DocuSeal' : 'BEASTY will prepare your packet' : a.available ? 'Not signed yet' : `Opens soon. You’ll ${forms ? 'fill them in' : 'sign it'} after you send this.`],
            ] as [string, boolean, boolean, number, string][]
          ).map(([t, ok, open, n, d]) => (
            <li key={t}>
              <div className="onb-row-text">
                <b>{t}</b>
                <span>{d}</span>
              </div>
              {ok ? (
                <span className="onb-tag" data-tone="good">
                  Done
                </span>
              ) : !open ? (
                <span className="onb-tag">Later</span>
              ) : (
                <button className="onb-link" onClick={() => void go(n)}>
                  {a.mode === 'manual' && n === 2 ? 'View status' : 'Finish'}
                </button>
              )}
            </li>
          ))}
        </ul>
        {canSubmit && later.length > 0 && (
          <p className="onb-quiet" style={{ marginTop: 16 }}>
            {a.mode === 'manual' ? 'You can send your details now. Complete the forms on DocuSeal and request review when BEASTY prepares your packet.' : <>BEASTY gets your application now; {later.join(' and ')} open{later.length > 1 || forms ? '' : 's'} soon and you’ll finish {later.length > 1 || forms ? 'them' : 'it'} from this page.</>}
          </p>
        )}
        {!canSubmit && (
          <p className="onb-quiet" style={{ marginTop: 16 }}>
            Submit opens once every part above that’s open is done.
          </p>
        )}
        {err && (
          <p className="onb-err" role="alert" style={{ marginTop: 16 }}>
            {err}
          </p>
        )}
      </>
    )
    dock = (
      <>
        {back}
        <button className="onb-btn onb-btn-primary" disabled={busy || !canSubmit} onClick={() => void submit()}>
          {busy ? 'Sending…' : 'Submit application'}
        </button>
      </>
    )
  }

  return (
    <Page save={save} test={bundle.testMode} head={head} dock={dock}>
      <div ref={top} />
      {bundle.status === 'changes_requested' && (
        <div className="onb-note" data-tone="warn" role="status" style={{ marginBottom: 20 }}>
          <b>BEASTY asked for a change.</b> {bundle.decisionNote}
        </div>
      )}
      {notice && (
        <div className="onb-note" role="status" style={{ marginBottom: 20 }}>
          {notice}
        </div>
      )}
      <section aria-labelledby={`s${step}`}>{body}</section>
    </Page>
  )
}

const TITLES = ['Your information', 'Get paid', 'Your forms and agreement', 'You’re almost there'] as const
const LEDES = [
  'Use your legal name, the one on your ID. It goes on your forms and your agreement.',
  'BEASTY pays affiliates through Stripe. Stripe checks who you are, takes your tax details for your 1099, and adds the bank account your commissions go to.',
  'One secure packet on DocuSeal: your W-9, where to deposit your pay, a photo of your ID, and the affiliate agreement. BEASTY countersigns after you.',
  'Check each part, then send your application to BEASTY.',
] as const
const SHORT = ['Details', 'Get paid', 'Forms', 'Review'] as const
/* With Stripe on, the tax, bank and ID details went to Stripe in step 1, so step 2 is the agreement alone. */
const WITH_STRIPE: Record<number, [string, string, string]> = {
  0: ['Your information', 'Use your legal name, the one on your ID. It goes on your agreement and your tax form.', 'Details'],
  2: ['Your affiliate agreement', 'Read the terms of the partnership and sign. BEASTY countersigns after you, and the signed copy appears on your dashboard.', 'Agreement'],
}
const PACKET = [
  'Form W-9: your legal name, address, and Social Security number or EIN, for your 1099',
  'Direct deposit: the bank account your commissions are paid into',
  'A photo of your driver’s license, state ID or passport',
  'The affiliate agreement: how you earn and are paid, how you can promote BEASTY, and that you’re an independent contractor',
]
const COVERS = [
  'How you earn commission, and what counts as a qualified referral',
  'When and how you’re paid',
  'Refunds and chargebacks',
  'How you can promote BEASTY',
  'Confidentiality, ending the agreement, and that you’re an independent contractor',
]
function copyOf(i: number, forms: boolean): { title: string; lede: string; short: string } {
  const [title, lede, short] = (!forms && WITH_STRIPE[i]) || [TITLES[i], LEDES[i], SHORT[i]]
  return { title, lede, short }
}

const p_kind = (b: Bundle) => b.profile.kind ?? 'individual'

/* ------------------------------------------------------------ dashboard ---- */

const STATUS_COPY: Record<Bundle['status'], [string, string, string]> = {
  in_progress: ['In progress', '', ''],
  changes_requested: ['Action needed', 'warn', ''],
  submitted: ['Under review', 'warn', 'Thanks for applying. BEASTY has your application and will email you when it’s reviewed.'],
  approved: ['Approved', 'good', 'You’re a BEASTY affiliate. Share your code and link from the Earn tab in the BEASTY app.'],
  rejected: ['Not approved', 'bad', 'BEASTY isn’t able to approve your application right now.'],
  suspended: ['Paused', 'bad', 'Your affiliate account is paused. Message BEASTY if you have questions.'],
}

function Dashboard({ bundle, reload }: { bundle: Bundle; reload: (refresh?: boolean) => Promise<void> }) {
  const [label, , copy] = STATUS_COPY[bundle.status]
  const pr = bundle.profile
  const p = bundle.steps.payouts
  const a = bundle.steps.agreement
  const first = pr.preferredName || pr.legalFirst || ''
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const open = async (path: string) => {
    setBusy(true)
    setErr('')
    try {
      const r = await api<{ url: string }>(path, { method: 'POST' })
      window.location.assign(r.url)
    } catch (x) {
      setErr(x instanceof ApiErr ? x.message : 'Couldn’t reach BEASTY. Check your connection and try again.')
      setBusy(false)
    }
  }
  /* Sent in before payouts or signing opened: those are finished from here. With
     payouts off there is no payout step; the forms travel with the agreement. */
  const forms = !p.available
  const active = bundle.status === 'submitted' || bundle.status === 'approved'
  const todo = active && ((!forms && !p.complete) || !a.affiliateSigned)
  return (
    <Page
      test={bundle.testMode}
      head={
        <div className="onb-status">
          <p className="onb-kicker">{bundle.status === 'approved' ? `Welcome to BEASTY${first ? `, ${first}` : ''}` : `${first ? `${first}, your` : 'Your'} application`}</p>
          <h1 className="onb-title">{label}</h1>
          {copy && <p className="onb-lede">{copy}</p>}
        </div>
      }
    >
      {bundle.decisionNote && (
        <div className="onb-note" style={{ marginBottom: 24 }}>
          {bundle.decisionNote}
        </div>
      )}

      {todo && (
        <div className="onb-section">
          <h3>Still to do</h3>
          <ul className="onb-rows">
            {!forms && !p.complete && (
              <li>
                <div className="onb-row-text">
                  <b>Payout setup</b>
                  <span>Add your identity, tax details and bank account with Stripe.</span>
                </div>
                <button className="onb-btn onb-btn-primary" style={{ minHeight: 44, padding: '0 18px' }} disabled={busy} onClick={() => void open('/api/onboarding/me/payouts/link')}>
                  {p.started ? 'Continue' : 'Set up'}
                </button>
              </li>
            )}
            {!a.affiliateSigned && (
              <li>
                <div className="onb-row-text">
                  <b>{forms ? 'Forms & agreement' : 'Affiliate agreement'}</b>
                  <span>{!a.available ? 'Opens soon. BEASTY will let you know.' : forms ? 'Fill in your W-9, direct deposit and ID, and sign, on DocuSeal.' : 'Read and sign it on DocuSeal, filled in with your details.'}</span>
                </div>
                {a.mode === 'manual' ? <span className="onb-tag">{a.reviewRequested ? 'In review' : a.linkReady ? 'Ready' : 'Preparing'}</span> : a.available && bundle.status === 'submitted' ? (
                  <button className="onb-btn onb-btn-primary" style={{ minHeight: 44, padding: '0 18px' }} disabled={busy} onClick={() => void open('/api/onboarding/me/agreement/sign')}>
                    {forms ? 'Fill in' : 'Sign'}
                  </button>
                ) : (
                  <span className="onb-tag">Opens soon</span>
                )}
              </li>
            )}
          </ul>
          {a.mode === 'manual' && bundle.status === 'submitted' && <ManualForms bundle={bundle} reload={reload} />}
          {err && (
            <p className="onb-err" role="alert" style={{ marginTop: 12 }}>
              {err}
            </p>
          )}
        </div>
      )}

      <div className="onb-section">
        <h3>Documents</h3>
        <ul className="onb-rows">
          <li>
            <div className="onb-row-text">
              <b>{forms ? 'Forms & agreement' : 'Affiliate agreement'}</b>
              <span>{a.countersigned ? 'Signed by you and BEASTY.' : a.affiliateSigned ? 'Signed by you; waiting for BEASTY’s countersignature.' : 'Not signed yet.'}</span>
            </div>
            {a.countersigned && !bundle.testMode ? (
              <a className="onb-link" href="/api/onboarding/me/agreement.pdf">
                {a.mode === 'manual' ? 'View in DocuSeal' : 'Download'}
              </a>
            ) : (
              <span className="onb-tag" data-tone={a.countersigned ? 'good' : a.affiliateSigned ? 'warn' : undefined}>
                {a.countersigned ? 'Complete' : a.affiliateSigned ? 'Countersigning' : 'Not yet'}
              </span>
            )}
          </li>
          {forms ? (
            <li>
              <div className="onb-row-text">
                <b>Tax form (W-9)</b>
                <span>In your signed packet, for your 1099.</span>
              </div>
              <span className="onb-tag" data-tone={a.affiliateSigned ? 'good' : undefined}>
                {a.affiliateSigned ? 'Complete' : 'Not yet'}
              </span>
            </li>
          ) : (
            <li>
              <div className="onb-row-text">
                <b>Tax details</b>
                <span>Held by Stripe, which files your 1099.</span>
              </div>
              <span className="onb-tag" data-tone={p.tax === 'complete' ? 'good' : undefined}>
                {p.tax === 'complete' ? 'Complete' : 'Not yet'}
              </span>
            </li>
          )}
        </ul>
      </div>

      <div className="onb-section">
        <h3>Payouts</h3>
        <dl className="onb-kv">
          <div>
            <dt>Paid by</dt>
            <dd>{forms ? 'BEASTY, by direct deposit' : 'Stripe'}</dd>
          </div>
          <div>
            <dt>Bank account</dt>
            <dd>{forms ? (a.affiliateSigned ? 'On your direct deposit form' : 'Not added') : p.bankLast4 ? `Ending ${p.bankLast4}` : 'Not added'}</dd>
          </div>
        </dl>
      </div>

      <div className="onb-section">
        <h3>Commissions</h3>
        <p className="onb-copy">Commission payments aren’t switched on yet. When they are, what you’ve earned and when it’s paid will show here.</p>
      </div>

      <div className="onb-section" style={{ paddingBottom: 40 }}>
        <h3>Your details</h3>
        <dl className="onb-kv">
          <div>
            <dt>Name</dt>
            <dd>{`${pr.legalFirst ?? ''} ${pr.legalLast ?? ''}`.trim()}</dd>
          </div>
          {pr.kind === 'business' && (
            <div>
              <dt>Business</dt>
              <dd>{pr.businessName}</dd>
            </div>
          )}
          <div>
            <dt>Email</dt>
            <dd>{pr.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{pr.phone}</dd>
          </div>
        </dl>
        <p className="onb-quiet" style={{ marginTop: 14 }}>
          Need to change something? Message BEASTY and we’ll update it with you.
        </p>
      </div>
    </Page>
  )
}

/* -------------------------------------------------- test-mode stand-ins ---- */

function StandIn({ kind, onDone }: { kind: 'payouts' | 'sign'; onDone: () => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const finish = async () => {
    setBusy(true)
    try {
      await api(`/api/onboarding/me/mock/${kind}`, { method: 'POST' })
      onDone()
    } catch (x) {
      setErr(x instanceof ApiErr ? x.message : 'Failed.')
      setBusy(false)
    }
  }
  return (
    <Page test head={<h1 className="onb-title">{kind === 'payouts' ? 'Stripe stand-in' : 'DocuSeal stand-in'}</h1>}>
      <div className="onb-standin">
        <span className="onb-test">Test mode</span>
        <h2>{kind === 'payouts' ? 'Stripe’s payout setup would open here' : 'DocuSeal’s signing page would open here'}</h2>
        <p className="onb-copy">
          {kind === 'payouts'
            ? 'On the live site this is Stripe’s own page, where the affiliate enters their SSN, bank account and ID. In test mode nothing is collected; finishing marks the test account as set up.'
            : 'On the live site this is the DocuSeal agreement, filled in with the affiliate’s details. In test mode nothing is signed for real; finishing marks the test agreement as signed by the affiliate.'}
        </p>
        {err && <p className="onb-err">{err}</p>}
        <button className="onb-btn onb-btn-primary" disabled={busy} onClick={() => void finish()}>
          {kind === 'payouts' ? 'Finish test payout setup' : 'Sign test agreement'}
        </button>
      </div>
    </Page>
  )
}

/* ----------------------------------------------------------------- root ---- */

type Phase =
  | { k: 'loading' }
  | { k: 'invite-bad'; state: string }
  | { k: 'welcome'; name: string }
  | { k: 'signin'; name: string }
  | { k: 'no-app' }
  | { k: 'app'; bundle: Bundle }
  | { k: 'error'; msg: string }

export default function JoinScreen() {
  const path = window.location.pathname
  const tokenRef = useRef<string | null>((path.match(/^\/join\/([A-Za-z0-9_-]{20,80})\/?$/) ?? [])[1] ?? null)
  const params = new URLSearchParams(window.location.search)
  const [mock, setMock] = useState(params.get('mock'))
  const [phase, setPhase] = useState<Phase>({ k: 'loading' })
  const inviteName = useRef('')
  /* Whether the Get paid step is switched on, for the welcome page's step count. Off unless the server says so. */
  const [payoutsOn, setPayoutsOn] = useState(false)
  useEffect(() => {
    api<{ payouts: boolean }>('/api/onboarding/setup')
      .then((r) => setPayoutsOn(r.payouts))
      .catch(() => {})
  }, [])

  const load = useCallback(async (refresh = false) => {
    try {
      const b = await api<Bundle>(`/api/onboarding/me${refresh ? '?refresh=1' : ''}`)
      setPhase({ k: 'app', bundle: b })
    } catch (x) {
      if (x instanceof ApiErr && x.status === 404) return setPhase({ k: 'no-app' })
      if (x instanceof ApiErr && x.status === 401) return setPhase({ k: 'welcome', name: inviteName.current })
      setPhase({ k: 'error', msg: 'Couldn’t reach BEASTY. Check your connection and refresh.' })
    }
  }, [])

  const afterSignIn = useCallback(async () => {
    const token = tokenRef.current
    if (token) {
      try {
        const b = await api<Bundle>(`/api/onboarding/invite/${token}/redeem`, { method: 'POST' })
        tokenRef.current = null
        window.history.replaceState(null, '', '/join')
        return setPhase({ k: 'app', bundle: b })
      } catch (x) {
        if (x instanceof ApiErr && (x.status === 409 || x.status === 410)) {
          /* Their own invite, already used: their application is still here. */
          try {
            const b = await api<Bundle>('/api/onboarding/me')
            tokenRef.current = null
            window.history.replaceState(null, '', '/join')
            return setPhase({ k: 'app', bundle: b })
          } catch {
            return setPhase({ k: 'invite-bad', state: x.status === 409 ? 'redeemed' : 'expired' })
          }
        }
        return setPhase({ k: 'error', msg: x instanceof ApiErr ? x.message : 'Couldn’t reach BEASTY.' })
      }
    }
    await load(params.has('payouts') || params.has('agreement'))
    if (params.has('payouts') || params.has('agreement')) window.history.replaceState(null, '', '/join')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  useEffect(() => {
    void (async () => {
      const token = tokenRef.current
      if (token) {
        try {
          const inv = await api<{ state: string; name: string }>(`/api/onboarding/invite/${token}`)
          inviteName.current = inv.name
          if (inv.state === 'expired' || inv.state === 'revoked') return setPhase({ k: 'invite-bad', state: inv.state })
        } catch {
          return setPhase({ k: 'invite-bad', state: 'unknown' })
        }
      }
      const signedIn = await fetch('/api/members/me', { credentials: 'same-origin' }).then((r) => r.ok).catch(() => false)
      if (signedIn) return afterSignIn()
      setPhase({ k: 'welcome', name: inviteName.current })
    })()
  }, [afterSignIn])

  if (phase.k === 'loading') return <Loading />
  if (phase.k === 'error') return <Message title="Something went wrong">{phase.msg}</Message>
  if (phase.k === 'invite-bad') {
    const copy: Record<string, string> = {
      expired: 'This invite link has expired. Ask BEASTY to send you a new one.',
      revoked: 'This invite was cancelled. Ask BEASTY if you think that’s a mistake.',
      redeemed: 'This invite has already been used. If it was you, sign in with the same phone or email you used before.',
      unknown: 'This link isn’t valid. Check you copied all of it, or ask BEASTY for a new one.',
    }
    return <Message title="This invite can’t be used">{copy[phase.state] ?? copy.unknown}</Message>
  }
  if (phase.k === 'welcome') return <Welcome name={phase.name} payouts={payoutsOn} onStart={() => setPhase({ k: 'signin', name: phase.name })} />
  if (phase.k === 'signin') return <SignIn defaultName={phase.name} onSignedIn={() => void afterSignIn()} />
  if (phase.k === 'no-app')
    return (
      <Message title="Affiliate sign-ups are by invitation">
        BEASTY invites affiliates personally. If you’d like to join, message BEASTY and ask for your invite link; it brings you straight back here.
      </Message>
    )

  const b = phase.bundle
  if (mock && b.testMode && (mock === 'payouts' || mock === 'sign')) {
    return (
      <StandIn
        kind={mock}
        onDone={() => {
          setMock(null)
          window.history.replaceState(null, '', '/join')
          void load(true)
        }}
      />
    )
  }
  if (b.status === 'in_progress' || b.status === 'changes_requested') {
    return <Onboarding key={b.id} bundle={b} setBundle={(nb) => setPhase({ k: 'app', bundle: nb })} reload={(r) => load(r)} />
  }
  return <Dashboard bundle={b} reload={load} />
}
