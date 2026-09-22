/*
  /crm — BEASTY's internal growth screen.

  Chosen in main.tsx before the app mounts, like /kitchen: no landing, no
  catalogue, nothing a customer loads. Routes live in the hash (#/leads,
  #/lead/<id>, ...), so the back button, a refresh and a pasted link all land
  where they were. Everything it shows comes from /api/crm, which checks the
  role on every request.
*/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './crm.css'
import { api } from './api'
import type { Actor, LeadSummary, Meta } from './api'
import { Crm, Failure, Loading, StagePill, useApi } from './ui'
import { Analytics, Businesses, Followups, Overview, Pipeline, Revenue } from './views'
import { Leads } from './leads'
import { LeadDetail } from './lead'
import { PartnerHome, ReferrerDetail, Referrers, Settings } from './people'

interface Route {
  name: string
  id: string | null
  params: URLSearchParams
}

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  const [path, query = ''] = h.split('?')
  const [name, id] = path.split('/')
  return { name: name || 'overview', id: id ? decodeURIComponent(id) : null, params: new URLSearchParams(query) }
}

const NAV = [
  ['overview', 'Overview'],
  ['leads', 'Leads'],
  ['pipeline', 'Pipeline'],
  ['businesses', 'Businesses'],
  ['referrers', 'Referrers'],
  ['followups', 'Follow-ups'],
  ['revenue', 'Revenue'],
  ['analytics', 'Analytics'],
] as const

export default function CrmScreen() {
  const [route, setRoute] = useState<Route>(parseHash)
  const [me, setMe] = useState<{ actor: Actor | null; member: { name: string } | null } | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [metaError, setMetaError] = useState<string | null>(null)
  /* Hash moves made inside the CRM: a back link only uses history.back() when there is one. */
  const moves = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* Internal: never in a search index. The server sends X-Robots-Tag too. */
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'robots'
      document.head.appendChild(tag)
    }
    tag.content = 'noindex, nofollow'
    document.title = 'BEASTY CRM'
    const onHash = () => {
      moves.current++
      setRoute(parseHash())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const loadMe = useCallback(async () => {
    try {
      setMe(await api('/api/crm/me'))
    } catch {
      setMe({ actor: null, member: null })
    }
  }, [])
  useEffect(() => {
    void loadMe()
  }, [loadMe])

  const loadMeta = useCallback(async () => {
    try {
      setMeta(await api<Meta>('/api/crm/meta'))
      setMetaError(null)
    } catch (e) {
      setMetaError((e as Error).message)
    }
  }, [])
  useEffect(() => {
    if (me?.actor && me.actor.role !== 'partner') void loadMeta()
  }, [me, loadMeta])

  const go = useCallback((hash: string) => {
    window.location.hash = hash.startsWith('#') ? hash : `#/${hash.replace(/^\//, '')}`
  }, [])

  /*
    The screen scrolls inside .crm, not the window, so the browser cannot
    restore it. Each history entry keeps its own scroll position in its state:
    Back lands where the list was, a new page starts at the top.
  */
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    let t = 0
    const save = () => {
      window.clearTimeout(t)
      const at = window.location.hash
      t = window.setTimeout(() => {
        if (window.location.hash === at) window.history.replaceState({ ...(window.history.state ?? {}), crmScroll: el.scrollTop }, '')
      }, 150)
    }
    el.addEventListener('scroll', save, { passive: true })
    return () => {
      el.removeEventListener('scroll', save)
      window.clearTimeout(t)
    }
  }, [meta])

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollTop = 0
    document.querySelector('.crm-nav a.is-on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const want = Number(window.history.state?.crmScroll ?? 0)
    if (!(want > 0)) return
    /* The page's data arrives after this runs: keep trying until it is tall enough. */
    let tries = 0
    const t = window.setInterval(() => {
      el.scrollTop = want
      if (Math.abs(el.scrollTop - want) < 2 || ++tries > 40) window.clearInterval(t)
    }, 50)
    return () => window.clearInterval(t)
  }, [route, meta])

  if (!me) return <div className="crm"><Loading /></div>
  if (!me.actor) return <SignIn member={me.member} onDone={loadMe} />
  if (me.actor.role === 'partner') {
    return (
      <div className="crm">
        <Header actor={me.actor} onSignOut={loadMe} />
        <main className="crm-main is-solo">
          <PartnerHome personId={me.actor.personId} />
        </main>
      </div>
    )
  }
  if (metaError) return <div className="crm"><Failure error={metaError} retry={loadMeta} /></div>
  if (!meta) return <div className="crm"><Loading /></div>

  const back = (fallback: string) => (moves.current > 0 ? window.history.back() : go(fallback))
  const ctx = { meta, actor: me.actor, reloadMeta: () => void loadMeta(), go, back }
  let view
  switch (route.name) {
    case 'leads':
      view = <Leads key={route.params.toString()} params={route.params} />
      break
    case 'lead':
      view = route.id ? <LeadDetail key={route.id} id={route.id} /> : null
      break
    case 'pipeline':
      view = <Pipeline />
      break
    case 'businesses':
      view = <Businesses />
      break
    case 'referrers':
      view = <Referrers />
      break
    case 'referrer':
      view = route.id ? <ReferrerDetail key={route.id} id={route.id} /> : null
      break
    case 'followups':
      view = <Followups key={route.params.get('view') ?? 'overdue'} view={route.params.get('view') ?? 'overdue'} />
      break
    case 'revenue':
      view = <Revenue />
      break
    case 'analytics':
      view = <Analytics />
      break
    case 'settings':
      view = <Settings />
      break
    default:
      view = <Overview />
  }
  const active = route.name === 'lead' ? 'leads' : route.name === 'referrer' ? 'referrers' : route.name

  return (
    <Crm.Provider value={ctx}>
      <div className="crm" ref={scroller}>
        <Header actor={me.actor} onSignOut={loadMe} search />
        <div className="crm-body">
          <nav className="crm-nav" aria-label="CRM sections">
            {NAV.map(([key, label]) => (
              <a key={key} href={`#/${key}`} className={active === key ? 'is-on' : undefined} aria-current={active === key ? 'page' : undefined}>
                {label}
              </a>
            ))}
            {me.actor.role === 'admin' && (
              <a href="#/settings" className={active === 'settings' ? 'is-on' : undefined}>
                Settings
              </a>
            )}
          </nav>
          <main className="crm-main">{view}</main>
        </div>
      </div>
    </Crm.Provider>
  )
}

/* ---------------------------------------------------------------- header */

function Header({ actor, onSignOut, search = false }: { actor: Actor; onSignOut: () => void; search?: boolean }) {
  const signOut = async () => {
    await api('/api/crm/session', { method: 'DELETE' }).catch(() => {})
    onSignOut()
  }
  return (
    <header className="crm-top">
      <a className="crm-brand" href="#/overview">
        <span className="crm-brand-pill">BEASTY</span> CRM
      </a>
      {search && <GlobalSearch />}
      <span className="crm-who">
        {actor.name}
        <span className="crm-role">{actor.role}</span>
        {actor.actor === 'operator' && (
          <button type="button" className="crm-link" onClick={signOut}>
            Sign out
          </button>
        )}
      </span>
    </header>
  )
}

function GlobalSearch() {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 220)
    return () => clearTimeout(t)
  }, [q])
  const { data } = useApi<{ leads: LeadSummary[]; people: { id: string; name: string; slug: string; leads: number }[] }>(
    debounced.length >= 2 ? `/api/crm/search?q=${encodeURIComponent(debounced)}` : null,
  )
  const open = focused && debounced.length >= 2 && !!data
  const pick = (hash: string) => {
    setQ('')
    setDebounced('')
    window.location.hash = hash
  }
  return (
    <div className="crm-search">
      <input
        type="search"
        placeholder="Search businesses, phones, emails, @handles, people"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        /* Late enough that a tap on a result lands before the list closes. */
        onBlur={() => setTimeout(() => setFocused(false), 180)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && q.trim()) pick(`#/leads?q=${encodeURIComponent(q.trim())}`)
          if (e.key === 'Escape') setQ('')
        }}
        aria-label="Search the CRM"
      />
      {open && (
        <div className="crm-search-results" role="listbox">
          {data.people.map((p) => (
            <button type="button" key={p.id} onClick={() => pick(`#/referrer/${p.id}`)}>
              <strong>{p.name}</strong>
              <span>Referrer · {p.leads} lead{p.leads === 1 ? '' : 's'}</span>
            </button>
          ))}
          {data.leads.map((l) => (
            <button type="button" key={l.id} onClick={() => pick(`#/lead/${l.id}`)}>
              <strong>{l.name}</strong>
              <span>
                {l.city ?? ''} <StagePill stage={l.stage} />
              </span>
            </button>
          ))}
          {!data.people.length && !data.leads.length && <div className="crm-search-none">Nothing matches.</div>}
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- sign in */

function SignIn({ member, onDone }: { member: { name: string } | null; onDone: () => void }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api('/api/crm/session', { method: 'POST', body: { token } })
      setToken('')
      onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const note = useMemo(
    () =>
      member
        ? `You are signed in to BEASTY as ${member.name}, but your account has no CRM role yet. An admin can add you in CRM Settings.`
        : 'Team members and referral partners: sign in to beastypages.com on this device first, then open /crm again.',
    [member],
  )
  return (
    <div className="crm crm-signin">
      <form className="crm-card crm-signin-card" onSubmit={submit}>
        <h1>
          <span className="crm-brand-pill">BEASTY</span> CRM
        </h1>
        <p>{note}</p>
        <label>
          Operator key
          <input type="password" autoComplete="current-password" value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        {error && <div className="crm-error">{error}</div>}
        <button type="submit" className="crm-btn crm-btn-primary" disabled={busy || token.length < 8}>
          {busy ? 'Checking…' : 'Open the CRM'}
        </button>
        <a className="crm-link" href="/">
          Go to beastypages.com
        </a>
      </form>
    </div>
  )
}
