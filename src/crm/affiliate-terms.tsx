/*
  Affiliate terms — Schedule A, the money terms of the affiliate agreement.

  Built the way Leon's TDS app fills a disclosure (Noctilucenty/loqol-tds):
  one chapter at a time, every answer saved as it changes, figures tapped,
  the clauses nobody can answer as written explained first and talked
  through (dictated, where the browser can), contradictions held back for a
  review screen, then a filled PDF. The arithmetic is shared with the server
  (shared/affiliate-terms.ts), so the preview here is the PDF's own numbers.
  docs/AFFILIATE-TERMS-FORM.md is the long form.
*/
import { useEffect, useRef, useState } from 'react'
import { api, ApiError } from './api'
import { Empty, Failure, Loading, PageTitle, Section, dateTime, useApi, useCrm } from './ui'
import { Icon } from './icons'
import {
  CHAPTERS,
  FIELDS,
  FIELDS_BY_ID,
  PER_AFFILIATE,
  RATIONALE,
  SPECIAL_TERMS_FIELD,
  check,
  effectiveTerms,
  cleanOverrides,
  isShown,
  schedule,
  type Check,
  type Flag,
  type Overrides,
  type TermField,
  type TermId,
  type Terms,
} from '../../shared/affiliate-terms'
import './affiliate-terms.css'

interface StandardState {
  draft: { terms: Terms; revision: number; acknowledged: Record<string, string>; updatedBy: string; updatedAt: number; code: string }
  check: Check
  published: { number: number; code: string; createdBy: string; createdAt: number; note: string } | null
  unpublishedChanges: boolean
  versions: { number: number; code: string; note: string; createdBy: string; createdAt: number }[]
}

interface AffiliateState {
  standard: { number: number; code: string; terms: Terms } | null
  overrides?: Overrides
  terms?: Terms
  code?: string
  version?: string
  check?: Check
  text?: string
  agreementFields?: Record<string, string>
  docusealFields?: Record<string, string>
  packet: { version: number; code: string } | null
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/* --------------------------------------------------------------- controls */

const UNIT: Partial<Record<TermField['kind'], [string, string]>> = {
  money: ['$', ''],
  percent: ['', '%'],
  points: ['', 'pts'],
  multiplier: ['', '×'],
  count: ['', ''],
}

/** A figure typed as text, so "$39.00" and "10%" read the way they print. */
function NumberInput({ f, value, onChange, disabled, placeholder }: { f: TermField; value: number | undefined; onChange: (v: number | undefined) => void; disabled?: boolean; placeholder?: string }) {
  const [text, setText] = useState(value === undefined ? '' : String(value))
  const focused = useRef(false)
  useEffect(() => {
    if (!focused.current) setText(value === undefined ? '' : String(value))
  }, [value])
  const [pre, post] = UNIT[f.kind] ?? ['', '']
  return (
    <span className="crm-terms-num">
      {pre && <span aria-hidden>{pre}</span>}
      <input
        type="text"
        inputMode="decimal"
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={f.prompt}
        onFocus={() => (focused.current = true)}
        onBlur={() => {
          focused.current = false
          setText(value === undefined ? '' : String(value))
        }}
        onChange={(e) => {
          setText(e.target.value)
          const raw = e.target.value.replace(/[$,%\s]/g, '')
          if (raw === '') return onChange(undefined)
          const n = Number(raw)
          if (Number.isFinite(n)) onChange(n)
        }}
      />
      {post && <span aria-hidden>{post}</span>}
    </span>
  )
}

type SpeechCtor = new () => { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: (e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void; onend: () => void; onerror: () => void }
const Speech = (window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }).SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition

/** Say the clause instead of typing it. The browser's own dictation: free, and
 *  only offered where the browser has it. The words land in the box to tidy. */
function Dictate({ onText }: { onText: (t: string) => void }) {
  const [on, setOn] = useState(false)
  const rec = useRef<InstanceType<SpeechCtor> | null>(null)
  useEffect(() => () => rec.current?.stop(), [])
  if (!Speech) return null
  const toggle = () => {
    if (on) return rec.current?.stop()
    const r = new Speech()
    r.lang = 'en-US'
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) onText(e.results[i][0].transcript.trim())
    }
    r.onend = () => setOn(false)
    r.onerror = () => setOn(false)
    rec.current = r
    r.start()
    setOn(true)
  }
  return (
    <button type="button" className={`crm-btn${on ? ' is-dark' : ''}`} onClick={toggle} aria-pressed={on}>
      <span className={`crm-terms-mic${on ? ' is-on' : ''}`} aria-hidden />
      {on ? 'Stop' : 'Say it'}
    </button>
  )
}

/** "What does this mean?": plain English, an example, then the exact words that print. */
function Explain({ f, terms, open: startOpen }: { f: TermField; terms: Terms; open: boolean }) {
  const [open, setOpen] = useState(startOpen)
  const [legal, setLegal] = useState(false)
  const wording = f.legal(terms)
  if (!open)
    return (
      <button type="button" className="crm-terms-link" onClick={() => setOpen(true)}>
        <span className="crm-terms-q" aria-hidden>?</span>
        What does this mean?
      </button>
    )
  return (
    <div className="crm-terms-explain">
      <p>{f.explain}</p>
      {f.example && (
        <p className="crm-terms-example">
          <b>For example</b> {f.example}
        </p>
      )}
      {wording &&
        (legal ? (
          <p className="crm-terms-legal">
            <b>What prints in Schedule A</b> {wording}
          </p>
        ) : (
          <button type="button" className="crm-terms-link" onClick={() => setLegal(true)}>
            Show the agreement’s wording
          </button>
        ))}
      {!startOpen && (
        <button type="button" className="crm-terms-link" onClick={() => setOpen(false)}>
          Close
        </button>
      )}
    </div>
  )
}

function Control({ f, value, onChange, disabled, placeholder }: { f: TermField; value: Terms[TermId] | undefined; onChange: (v: Terms[TermId] | undefined, channel?: 'tap' | 'talk') => void; disabled?: boolean; placeholder?: string }) {
  if (f.kind === 'choice')
    return (
      <div className={`crm-terms-choices${f.lane === 'talk' ? ' is-stacked' : ''}`} role="radiogroup" aria-label={f.prompt}>
        {f.options!.map((o) => (
          <button type="button" key={o.id} role="radio" aria-checked={value === o.id} className={value === o.id ? 'is-on' : undefined} disabled={disabled} onClick={() => onChange(o.id as Terms[TermId])}>
            {o.label}
          </button>
        ))}
      </div>
    )
  if (f.kind === 'bool')
    return (
      <div className="crm-terms-choices" role="radiogroup" aria-label={f.prompt}>
        {[[true, 'Yes'] as const, [false, 'No'] as const].map(([v, label]) => (
          <button type="button" key={label} role="radio" aria-checked={value === v} className={value === v ? 'is-on' : undefined} disabled={disabled} onClick={() => onChange(v)}>
            {label}
          </button>
        ))}
      </div>
    )
  if (f.kind === 'text')
    return <input type="text" value={String(value ?? '')} disabled={disabled} placeholder={placeholder} aria-label={f.prompt} maxLength={80} onChange={(e) => onChange(e.target.value)} />
  if (f.kind === 'longtext')
    return (
      <div className="crm-terms-talk">
        <textarea rows={5} value={String(value ?? '')} disabled={disabled} placeholder={placeholder} aria-label={f.prompt} maxLength={1200} onChange={(e) => onChange(e.target.value, 'tap')} />
        {!disabled && <Dictate onText={(t) => onChange(`${String(value ?? '').trim()} ${t}`.trim(), 'talk')} />}
      </div>
    )
  return <NumberInput f={f} value={value as number | undefined} disabled={disabled} placeholder={placeholder} onChange={(v) => onChange(v)} />
}

function Question({ f, terms, problem, onChange, disabled }: { f: TermField; terms: Terms; problem?: string; onChange: (v: Terms[TermId] | undefined, channel?: 'tap' | 'talk') => void; disabled?: boolean }) {
  const preview = f.preview && !problem ? f.preview(terms) : ''
  return (
    <div className={`crm-terms-card${f.lane === 'talk' ? ' is-talk' : ''}`} id={`term-${f.id}`}>
      <div className="crm-terms-card-head">
        <h3>{f.prompt}</h3>
        <span className="crm-terms-lane" title={RATIONALE[f.why]}>
          {f.lane === 'talk' ? 'Talk it through' : 'Tap'}
        </span>
      </div>
      {f.lane === 'talk' && <Explain f={f} terms={terms} open />}
      <Control f={f} value={terms[f.id]} onChange={onChange} disabled={disabled} />
      {problem && <p className="crm-terms-problem" role="alert">{problem}</p>}
      {preview && <p className="crm-terms-preview">{preview}</p>}
      <div className="crm-terms-foot">
        {f.lane === 'tap' && <Explain f={f} terms={terms} open={false} />}
        <span className={`crm-terms-source${f.settled ? '' : ' is-open'}`}>{f.settled ? 'Agreed' : 'Not settled'}{f.source ? `: ${f.source}` : ''}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ the schedule */

function ScheduleView({ terms, overrides }: { terms: Terms; overrides?: Overrides }) {
  return (
    <div className="crm-terms-schedule">
      {schedule(terms, overrides).map((s, i) => (
        <section key={s.title}>
          <h3>
            <span>{i + 1}</span>
            {s.title}
          </h3>
          {s.rows.length > 0 && (
            <dl>
              {s.rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>
                    <b>{r.value}</b>
                    {r.detail && <small>{r.detail}</small>}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {s.text && <p>{s.text}</p>}
        </section>
      ))}
    </div>
  )
}

function FlagCard({ flag, terms, onChange, onAccept, admin }: { flag: Flag; terms: Terms; onChange: (id: TermId, v: Terms[TermId] | undefined) => void; onAccept?: () => void; admin: boolean }) {
  const [fixing, setFixing] = useState(flag.severity === 'hard')
  const fields = flag.fields.map((id) => FIELDS_BY_ID[id]).filter((f) => f && isShown(f, terms))
  return (
    <div className={`crm-terms-flag is-${flag.severity}`}>
      <p>
        <b>{flag.severity === 'hard' ? 'Has to be fixed' : 'Check this'}</b>
        {flag.message}
      </p>
      {fixing ? (
        <div className="crm-terms-flag-fix">
          {fields.map((f) => (
            <label key={f.id} className="crm-field">
              <span>{f.prompt}</span>
              <Control f={f} value={terms[f.id]} disabled={!admin} onChange={(v) => onChange(f.id, v)} />
            </label>
          ))}
        </div>
      ) : null}
      {admin && flag.severity === 'soft' && (
        <div className="crm-terms-actions">
          {onAccept && (
            <button type="button" className="crm-btn" onClick={onAccept}>
              Both are right, leave them
            </button>
          )}
          {!fixing && (
            <button type="button" className="crm-btn" onClick={() => setFixing(true)}>
              Change a figure
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------- the standard page */

export function AffiliateTerms() {
  const { actor } = useCrm()
  const admin = actor.role === 'admin'
  const [state, setState] = useState<StandardState | null>(null)
  const [terms, setTerms] = useState<Terms | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [chapter, setChapter] = useState(CHAPTERS[0].id)
  const [note, setNote] = useState('')
  const queue = useRef<{ changes: Partial<Terms>; channel: 'tap' | 'talk' }>({ changes: {}, channel: 'tap' })
  const inflight = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const latest = useRef<StandardState | null>(null)

  const adopt = (s: StandardState) => {
    latest.current = s
    setState(s)
    setTerms({ ...s.draft.terms, ...queue.current.changes })
  }

  const load = async () => {
    try {
      adopt(await api<StandardState>('/api/crm/affiliate-terms'))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }
  useEffect(() => {
    void load()
    return () => window.clearTimeout(timer.current)
  }, [])

  /* Every answer saves the moment it changes, one request at a time. */
  const flush = async () => {
    if (inflight.current || !latest.current) return
    const { changes, channel } = queue.current
    if (!Object.keys(changes).length) return
    queue.current = { changes: {}, channel: 'tap' }
    inflight.current = true
    setSaving(true)
    try {
      adopt(await api<StandardState>('/api/crm/affiliate-terms/draft', { method: 'PUT', body: { revision: latest.current.draft.revision, changes, channel } }))
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && 'draft' in e.body) {
        adopt(e.body as unknown as StandardState)
        setNotice(e.message)
      } else {
        queue.current = { changes: { ...changes, ...queue.current.changes }, channel }
        setNotice(`Not saved: ${(e as Error).message}`)
      }
    } finally {
      inflight.current = false
      setSaving(false)
      if (Object.keys(queue.current.changes).length) void flush()
    }
  }

  const change = (id: TermId, v: Terms[TermId] | undefined, channel: 'tap' | 'talk' = 'tap') => {
    if (v === undefined || !terms) return
    setTerms({ ...terms, [id]: v })
    queue.current = { changes: { ...queue.current.changes, [id]: v }, channel: channel === 'talk' ? 'talk' : queue.current.channel }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void flush(), 450)
  }

  const act = async (path: string, body: unknown = {}) => {
    try {
      adopt(await api<StandardState>(path, { method: 'POST', body }))
      setNotice(null)
      return true
    } catch (e) {
      if (e instanceof ApiError && 'draft' in e.body) adopt(e.body as unknown as StandardState)
      setNotice((e as Error).message)
      return false
    }
  }

  if (error) return <Failure error={error} retry={load} />
  if (!state || !terms) return <Loading />

  const local = check(terms, state.draft.acknowledged)
  const idx = CHAPTERS.findIndex((c) => c.id === chapter)
  const left = CHAPTERS.slice(idx).reduce((n, c) => n + c.minutes, 0)
  const questions = FIELDS.filter((f) => f.chapter === chapter && isShown(f, terms))
  const hard = local.flags.filter((f) => f.severity === 'hard')
  const soft = local.flags.filter((f) => f.severity === 'soft')
  const problems = Object.entries(local.problems) as [TermId, string][]
  const unsaved = saving || Object.keys(queue.current.changes).length > 0
  const go = (id: string) => {
    setChapter(id)
    document.querySelector('.crm')?.scrollTo({ top: 0 })
  }
  const jump = (id: TermId) => {
    go(FIELDS_BY_ID[id].chapter)
    window.setTimeout(() => document.getElementById(`term-${id}`)?.scrollIntoView({ block: 'center' }), 60)
  }

  return (
    <div className="crm-view crm-terms">
      <a className="crm-back" href="#/affiliates">
        <Icon name="chevronLeft" size={20} stroke={2.2} />
        Affiliates
      </a>
      <PageTitle
        title="Affiliate terms"
        sub="Schedule A: the commission and fee figures printed into the affiliate agreement. Every figure is a default until Glenn agrees it."
        actions={
          <a className="crm-btn" href="/api/crm/affiliate-terms/schedule.pdf" target="_blank" rel="noreferrer">
            <Icon name="file" size={16} />
            Open filled PDF
          </a>
        }
      />
      <p className="crm-terms-status">
        {state.published ? `Version ${state.published.number} published ${dateTime(state.published.createdAt)}.` : 'Nothing published yet.'}{' '}
        {state.unpublishedChanges ? 'The draft below has changes that are not published.' : 'The draft matches it.'}{' '}
        <span className="crm-quiet">{unsaved ? 'Saving…' : state.draft.updatedAt ? `Saved ${dateTime(state.draft.updatedAt)}.` : ''}</span>
      </p>
      {!admin && <p className="crm-aff-notice">Only an admin can change the terms.</p>}
      {notice && (
        <p className="crm-aff-notice" role="status">
          {notice}
        </p>
      )}

      <nav className="crm-terms-chapters" aria-label="Chapters">
        {CHAPTERS.map((c, i) => {
          const n = c.id === 'review' ? hard.length + soft.length + problems.length : 0
          return (
            <button type="button" key={c.id} className={c.id === chapter ? 'is-on' : undefined} aria-current={c.id === chapter ? 'step' : undefined} onClick={() => go(c.id)}>
              <span>{i + 1}</span>
              {c.title}
              {n > 0 && <em>{n}</em>}
            </button>
          )
        })}
      </nav>
      <p className="crm-note is-quiet">
        {CHAPTERS[idx].blurb} Chapter {idx + 1} of {CHAPTERS.length}, about {Math.max(1, Math.round(left))} min left.
      </p>

      {chapter !== 'review' ? (
        <>
          {questions.map((f) => (
            <Question key={f.id} f={f} terms={terms} problem={local.problems[f.id]} disabled={!admin} onChange={(v, ch) => change(f.id, v, ch)} />
          ))}
          <div className="crm-terms-next">
            {idx > 0 && (
              <button type="button" className="crm-btn" onClick={() => go(CHAPTERS[idx - 1].id)}>
                Back
              </button>
            )}
            <button type="button" className="crm-btn is-primary" onClick={() => go(CHAPTERS[idx + 1].id)}>
              {CHAPTERS[idx + 1].id === 'review' ? 'Review' : `Next: ${CHAPTERS[idx + 1].title}`}
            </button>
          </div>
        </>
      ) : (
        <>
          {problems.length > 0 && (
            <Section title="Figures out of range">
              <ul className="crm-group">
                {problems.map(([id, p]) => (
                  <li key={id}>
                    <button type="button" className="crm-row crm-terms-jump" onClick={() => jump(id)}>
                      <span className="crm-row-text">
                        <strong>{FIELDS_BY_ID[id].prompt}</strong>
                        <span>{p}</span>
                      </span>
                      <Icon name="chevronRight" size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          <Section title={hard.length + soft.length ? 'Things that don’t add up' : 'Contradictions'}>
            {hard.length + soft.length === 0 ? (
              <Empty icon="checkCircle">Nothing contradicts anything else.</Empty>
            ) : (
              [...hard, ...soft].map((f) => (
                <FlagCard key={f.rule} flag={f} terms={terms} admin={admin} onChange={(id, v) => change(id, v)} onAccept={f.severity === 'soft' ? () => void act('/api/crm/affiliate-terms/acknowledge', { rule: f.rule }) : undefined} />
              ))
            )}
          </Section>
          <Section title={`Not settled with Glenn (${local.unsettled.length})`}>
            <p className="crm-note is-quiet">These are defaults nobody has agreed yet. They can be published, but Glenn should see each one. His draft of 21 October has not reached the Mac.</p>
            <ul className="crm-group">
              {local.unsettled.map((id) => (
                <li key={id}>
                  <button type="button" className="crm-row crm-terms-jump" onClick={() => jump(id)}>
                    <span className="crm-row-text">
                      <strong>{FIELDS_BY_ID[id].prompt}</strong>
                      <span>{FIELDS_BY_ID[id].source}</span>
                    </span>
                    <Icon name="chevronRight" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
          <Section
            title="The schedule as it prints"
            action={
              <a className="crm-btn" href="/api/crm/affiliate-terms/schedule.pdf" target="_blank" rel="noreferrer">
                <Icon name="file" size={16} />
                PDF
              </a>
            }
          >
            <ScheduleView terms={terms} />
            <p className="crm-note is-quiet">Code {state.draft.code}. The code changes whenever a figure does; it prints on every page and goes into the DocuSeal packet.</p>
          </Section>
          {admin && (
            <Section title="Publish">
              <label className="crm-field">
                <span>What changed (optional)</span>
                <input type="text" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Glenn’s draft of 21 Oct" />
              </label>
              <div className="crm-terms-actions">
                <button
                  type="button"
                  className="crm-btn is-primary"
                  disabled={local.blocked || unsaved || !state.unpublishedChanges}
                  onClick={async () => {
                    if (await act('/api/crm/affiliate-terms/publish', { revision: state.draft.revision, note })) setNote('')
                  }}
                >
                  Publish as version {(state.published?.number ?? 0) + 1}
                </button>
                {state.published && state.unpublishedChanges && (
                  <button type="button" className="crm-btn" disabled={unsaved} onClick={() => void act('/api/crm/affiliate-terms/discard')}>
                    Go back to version {state.published.number}
                  </button>
                )}
              </div>
              <p className="crm-note is-quiet">
                {local.blocked
                  ? 'Fix what has to be fixed first.'
                  : !state.unpublishedChanges
                    ? 'Nothing new to publish.'
                    : 'Publishing makes these the standard terms for new affiliates. It sends nothing to anyone: the packet is updated by hand in DocuSeal.'}
              </p>
            </Section>
          )}
          {state.versions.length > 0 && (
            <Section title="Versions">
              <ul className="crm-group">
                {state.versions.map((v) => (
                  <li key={v.number}>
                    <a className="crm-row" href={`/api/crm/affiliate-terms/schedule.pdf?version=${v.number}`} target="_blank" rel="noreferrer">
                      <span className="crm-row-text">
                        <strong>
                          Version {v.number} · {v.code}
                        </strong>
                        <span>
                          {dateTime(v.createdAt)}
                          {v.note ? `: ${v.note}` : ''}
                        </span>
                      </span>
                      <Icon name="file" size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------- one affiliate's terms */

export function AffiliateTermsPanel({ id, admin }: { id: string; admin: boolean }) {
  const path = `/api/crm/onboarding/${encodeURIComponent(id)}/terms`
  const { data, error, reload } = useApi<AffiliateState>(path)
  const [draft, setDraft] = useState<Overrides | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  useEffect(() => {
    if (data?.overrides) setDraft(data.overrides)
  }, [data])

  if (error) return <Failure error={error} retry={reload} />
  if (!data) return <Loading />
  if (!data.standard)
    return (
      <Section title="Money terms">
        <p className="crm-note">
          No standard schedule is published yet. <a href="#/affiliate-terms">Fill in and publish the affiliate terms</a> first; this affiliate starts on them and any change for them is made here.
        </p>
      </Section>
    )

  const standard = data.standard.terms
  const overrides = cleanOverrides(draft ?? {}, standard)
  const terms = effectiveTerms(standard, overrides)
  const local = check(terms)
  const dirty = JSON.stringify(overrides) !== JSON.stringify(data.overrides ?? {})
  const flags = (dirty ? local : data.check!).flags
  const packetStale = data.packet && data.packet.code !== data.code

  const save = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await api(path, { method: 'PUT', body: { overrides } })
      reload()
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const doCopy = async (key: string, text: string) => {
    const done = await copy(text)
    setCopied(done ? key : null)
    if (!done) setMessage('Copy was unavailable. Select the text and copy it.')
  }

  return (
    <Section title="Money terms">
      <div className="crm-panel crm-terms-aff">
        <p>
          <b>{data.version}</b> · code {data.code}
        </p>
        {data.packet ? (
          <p className={packetStale ? 'crm-terms-problem' : 'crm-quiet'}>
            {packetStale
              ? `The DocuSeal packet went out with code ${data.packet.code} (standard v${data.packet.version}). Their terms are now ${data.code}: send a new packet, or change them back.`
              : `Matches the DocuSeal packet attached for them (code ${data.packet.code}).`}
          </p>
        ) : (
          <p className="crm-quiet">No packet attached yet. When one is, the CRM records which code it went out with.</p>
        )}
        <div className="crm-terms-actions">
          <a className="crm-btn" href={`/api/crm/onboarding/${encodeURIComponent(id)}/schedule.pdf`} target="_blank" rel="noreferrer">
            <Icon name="file" size={16} />
            Their Schedule A
          </a>
          <button type="button" className="crm-btn" onClick={() => void doCopy('text', data.text!)}>
            <Icon name={copied === 'text' ? 'check' : 'copy'} size={16} />
            Copy schedule text
          </button>
          <button type="button" className="crm-btn" onClick={() => void doCopy('code', data.code!)}>
            <Icon name={copied === 'code' ? 'check' : 'copy'} size={16} />
            Copy code
          </button>
        </div>
        <p className="crm-note is-quiet">On the free DocuSeal plan the packet’s Schedule A fields carry the standard figures. For an affiliate with their own terms, paste each value below into the field of the same name when creating their request.</p>
      </div>

      <details className="crm-aff-prefill crm-terms-override" open={Object.keys(data.overrides ?? {}).length > 0}>
        <summary>Change terms for this affiliate only</summary>
        <p className="crm-note is-quiet">Leave a box empty to use the standard figure. Fees, the foundation’s share and FIRST48 are the same for everyone.</p>
        {PER_AFFILIATE.filter((f) => isShown(f, terms) || f.id === 'commissionMonths').map((f) => {
          const own = (draft ?? {})[f.id]
          const value = own === undefined ? (f.kind === 'longtext' || f.kind === 'choice' ? undefined : undefined) : own
          const problem = local.problems[f.id]
          return (
            <div key={f.id} className="crm-terms-override-row">
              <div>
                <b>{f.prompt}</b>
                <span className="crm-quiet">Standard: {f.id === SPECIAL_TERMS_FIELD.id ? 'none' : String(standard[f.id])}</span>
              </div>
              <Control
                f={f}
                value={value ?? (f.kind === 'choice' ? standard[f.id] : undefined)}
                disabled={!admin}
                placeholder={f.kind === 'longtext' ? '' : String(standard[f.id])}
                onChange={(v) => setDraft({ ...(draft ?? {}), [f.id]: v === '' ? undefined : v })}
              />
              {problem && <p className="crm-terms-problem">{problem}</p>}
              {!problem && f.preview && overrides[f.id] !== undefined && <p className="crm-terms-preview">{f.preview(terms)}</p>}
            </div>
          )
        })}
        {flags.map((f) => (
          <div key={f.rule} className={`crm-terms-flag is-${f.severity}`}>
            <p>
              <b>{f.severity === 'hard' ? 'Has to be fixed' : 'Check this'}</b>
              {f.message}
            </p>
            {admin && f.severity === 'soft' && !dirty && (
              <button type="button" className="crm-btn" onClick={async () => { await api(`${path}/acknowledge`, { method: 'POST', body: { rule: f.rule } }); reload() }}>
                Both are right, leave them
              </button>
            )}
          </div>
        ))}
        {message && <p className="crm-error">{message}</p>}
        {admin && (
          <div className="crm-terms-actions">
            <button type="button" className="crm-btn is-primary" disabled={!dirty || busy || local.blocked} onClick={() => void save()}>
              Save their terms
            </button>
            {dirty && (
              <button type="button" className="crm-btn" onClick={() => setDraft(data.overrides ?? {})}>
                Undo
              </button>
            )}
            {Object.keys(overrides).length > 0 && (
              <button type="button" className="crm-btn" onClick={() => setDraft({})}>
                Use the standard terms
              </button>
            )}
          </div>
        )}
      </details>

      <details className="crm-aff-prefill" open={Object.keys(data.overrides ?? {}).length > 0}>
        <summary>DocuSeal Schedule A fields</summary>
        <p className="crm-note is-quiet">Same names as the fields on the packet’s Schedule A pages. The template carries the standard values; paste these only for an affiliate with their own terms.</p>
        {Object.entries(data.docusealFields ?? {}).map(([name, value]) => (
          <div key={name} className="crm-aff-prefill-row">
            <div>
              <b>{name}</b>
              <span>{value}</span>
            </div>
            <button type="button" className="crm-btn" onClick={() => void doCopy(`ds:${name}`, value)}>
              {copied === `ds:${name}` ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </details>

      <details className="crm-aff-prefill">
        <summary>Values for the review agreement’s reward fields</summary>
        {Object.entries(data.agreementFields ?? {}).map(([name, value]) => (
          <div key={name} className="crm-aff-prefill-row">
            <div>
              <b>{name}</b>
              <span>{value}</span>
            </div>
            <button type="button" className="crm-btn" onClick={() => void doCopy(name, value)}>
              {copied === name ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </details>
    </Section>
  )
}
