/*
  /crm — BEASTY's own sales book.

  Chosen in main.tsx before the app mounts, like /kitchen: no landing, no
  catalogue, nothing a customer loads. Routes live in the hash (#/leads,
  #/lead/<id>, ...), so the back button, a refresh and a pasted link all land
  where they were. Everything it shows comes from /api/crm, which checks the
  role on every request.

  Five places, named the way the team talks: Home (the numbers and charts),
  To do (who to reach now), Businesses (every business being worked, with the
  board), Money, and People (who sends businesses in). A phone gets them as a
  tab bar; a computer as a top bar, with the business list and the open
  business side by side.
*/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './crm.css'
import { api, site } from './api'
import type { Actor, LeadSummary, Meta } from './api'
import { Avatar, Crm, Failure, Loading, StagePill, Tile, useApi, useCrm, useMedia } from './ui'
import { Icon } from './icons'
import type { IconName } from './icons'
import { Analytics, Businesses, Followups, Pipeline, Revenue, Today } from './views'
import { Home } from './home'
import { Leads } from './leads'
import { LeadDetail } from './lead'
import { PartnerHome, ReferrerDetail, Referrers, Settings } from './people'
import { AffiliateDetail, Affiliates } from './affiliates'
import { placeLine } from './steps'

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

interface Place {
  key: string
  label: string
  icon: IconName
}

const TABS: Place[] = [
  { key: 'overview', label: 'Home', icon: 'home' },
  { key: 'today', label: 'To do', icon: 'checkCircle' },
  { key: 'leads', label: 'Businesses', icon: 'store' },
  { key: 'revenue', label: 'Money', icon: 'dollar' },
  { key: 'referrers', label: 'People', icon: 'users' },
]

/** Which tab a page belongs to. */
const TAB_OF: Record<string, string> = {
  overview: 'overview',
  today: 'today',
  followups: 'today',
  leads: 'leads',
  lead: 'leads',
  pipeline: 'leads',
  businesses: 'leads',
  revenue: 'revenue',
  analytics: 'revenue',
  referrers: 'referrers',
  referrer: 'referrers',
  settings: 'referrers',
  affiliates: 'referrers',
  affiliate: 'referrers',
}

/** Everything the search can jump to, in the words the pages use. */
const PAGES: Place[] = [
  { key: 'overview', label: 'Home', icon: 'home' },
  { key: 'today', label: 'To do', icon: 'checkCircle' },
  { key: 'leads', label: 'Businesses', icon: 'store' },
  { key: 'pipeline', label: 'Board', icon: 'kanban' },
  { key: 'followups?view=upcoming', label: 'Reminders', icon: 'bell' },
  { key: 'businesses', label: 'Grouped businesses', icon: 'building' },
  { key: 'revenue', label: 'Money', icon: 'dollar' },
  { key: 'analytics', label: "How it's going", icon: 'chart' },
  { key: 'referrers', label: 'People', icon: 'users' },
  { key: 'affiliates', label: 'Affiliates', icon: 'file' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

export default function CrmScreen() {
  const [route, setRoute] = useState<Route>(parseHash)
  const [me, setMe] = useState<{ actor: Actor | null; member: { name: string } | null; memberSignin?: boolean } | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [metaError, setMetaError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [menu, setMenu] = useState(false)
  const wide = useMedia('(min-width: 1100px)')
  /* Hash moves made inside the CRM: a back link only uses history.back() when there is one. */
  const moves = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)
  /* The list's filters, kept while a business is open beside it. */
  const listParams = useRef<URLSearchParams>(route.name === 'leads' ? route.params : new URLSearchParams())
  if (route.name === 'leads') listParams.current = route.params

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
      setMenu(false)
      setRoute(parseHash())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  /* ⌘K / Ctrl+K anywhere, and "/" when not typing, open the search. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearching(true)
      }
      if (e.key === 'Escape') setMenu(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const loadMe = useCallback(async () => {
    try {
      const m = await api<{ actor: Actor | null; member: { name: string } | null; publicUrl: string | null; memberSignin?: boolean }>('/api/crm/me')
      if (m.publicUrl) site.origin = m.publicUrl
      setMe(m)
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

  const split = wide && (route.name === 'leads' || route.name === 'lead')

  /*
    The screen scrolls inside .crm, not the window, so the browser cannot
    restore it. Each history entry keeps its own scroll position in its state:
    Back lands where the list was, a new page starts at the top.
  */
  useEffect(() => {
    const el = scroller.current
    if (!el || split) return
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
  }, [meta, split])

  useEffect(() => {
    const el = scroller.current
    if (!el || split) return
    el.scrollTop = 0
    const want = Number(window.history.state?.crmScroll ?? 0)
    if (!(want > 0)) return
    /* The page's data arrives after this runs: keep trying until it is tall enough. */
    let tries = 0
    const t = window.setInterval(() => {
      el.scrollTop = want
      if (Math.abs(el.scrollTop - want) < 2 || ++tries > 40) window.clearInterval(t)
    }, 50)
    return () => window.clearInterval(t)
  }, [route, meta, split])

  /* Live counts for the tab bar, refreshed as you move around. */
  const badges = useApi<{ counts: Record<string, number>; attention: { key: string; count: number }[] }>(meta ? `/api/crm/overview?_=${route.name}` : null)

  if (!me) return <div className="crm"><Loading /></div>
  if (!me.actor) return <SignIn member={me.member} memberSignin={!!me.memberSignin} onDone={loadMe} />
  if (me.actor.role === 'partner') {
    return (
      <div className="crm crm-partner" ref={scroller}>
        <header className="crm-bar">
          <Brand />
          <Account actor={me.actor} onSignOut={loadMe} partner />
        </header>
        <main className="crm-main is-solo">
          <PartnerHome personId={me.actor.personId} />
        </main>
      </div>
    )
  }
  if (metaError) return <div className="crm"><Failure error={metaError} retry={loadMeta} /></div>
  if (!meta) return <div className="crm"><Loading /></div>

  const back = (fallback: string) => (moves.current > 0 ? window.history.back() : go(fallback))
  const ctx = { meta, actor: me.actor, reloadMeta: () => void loadMeta(), go, back, openSearch: () => setSearching(true) }
  const overdue = badges.data?.attention.find((a) => a.key === 'overdue')?.count ?? 0

  let view: ReactNode
  if (split) {
    view = (
      <div className="crm-split">
        <div className="crm-split-list">
          <Leads key={listParams.current.toString()} params={listParams.current} selected={route.name === 'lead' ? route.id : null} />
        </div>
        <SplitDetail id={route.name === 'lead' ? route.id : null} total={badges.data?.counts.total} />
      </div>
    )
  } else {
    switch (route.name) {
      case 'leads':
        view = <Leads key={route.params.toString()} params={route.params} />
        break
      case 'lead':
        view = route.id ? <LeadDetail key={route.id} id={route.id} params={route.params} /> : null
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
      case 'affiliates':
        view = <Affiliates />
        break
      case 'affiliate':
        view = route.id ? <AffiliateDetail key={route.id} id={route.id} /> : null
        break
      case 'today':
        view = <Today />
        break
      default:
        view = <Home />
    }
  }
  const tabOn = TAB_OF[route.name] ?? 'overview'

  return (
    <Crm.Provider value={ctx}>
      <div className={`crm${split ? ' is-split' : ''}`} ref={scroller}>
        <header className="crm-bar">
          <Brand />
          <nav className="crm-tabs-top" aria-label="Sections">
            {TABS.map((t) => (
              <a key={t.key} href={`#/${t.key}`} className={tabOn === t.key ? 'is-on' : undefined} aria-current={tabOn === t.key ? 'page' : undefined}>
                {t.label}
                {t.key === 'today' && overdue > 0 && <em className="crm-dot-count">{overdue}</em>}
              </a>
            ))}
          </nav>
          <div className="crm-bar-end">
            <button type="button" className="crm-search-btn" onClick={() => setSearching(true)} aria-label="Search the CRM">
              <Icon name="search" size={17} stroke={2} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
            <a className="crm-btn is-primary crm-add-btn" href="#/leads?new=1">
              <Icon name="plus" size={16} stroke={2.4} />
              <span>Add a business</span>
            </a>
            <a className="crm-add-icon" href="#/leads?new=1" aria-label="Add a business">
              <Icon name="plus" size={20} stroke={2.6} />
            </a>
            <Account actor={me.actor} onSignOut={loadMe} open={menu} setOpen={setMenu} />
          </div>
        </header>

        <main className={`crm-main${split ? ' is-split' : ''}`}>{view}</main>

        <nav className="crm-tabbar" aria-label="Sections">
          {TABS.map((t) => (
            <a key={t.key} href={`#/${t.key}`} className={tabOn === t.key ? 'is-on' : undefined} aria-current={tabOn === t.key ? 'page' : undefined}>
              <span className="crm-tabbar-icon">
                <Icon name={t.icon} size={24} stroke={tabOn === t.key ? 2.2 : 1.8} />
                {t.key === 'today' && overdue > 0 && <em className="crm-tabbar-badge">{overdue}</em>}
              </span>
              <span>{t.label}</span>
            </a>
          ))}
        </nav>

        {searching && <Search onClose={() => setSearching(false)} admin={me.actor.role === 'admin'} />}
      </div>
    </Crm.Provider>
  )
}

/* ------------------------------------------------------------- chrome */

function Brand() {
  return (
    <a className="crm-brand" href="#/overview" aria-label="BEASTY CRM, home">
      <span className="crm-brand-left">BEASTY</span>
      <span className="crm-brand-right">CRM</span>
    </a>
  )
}

/** The right-hand pane on a wide screen: the open business, or a word on what to do. */
function SplitDetail({ id, total }: { id: string | null; total?: number }) {
  const pane = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (pane.current) pane.current.scrollTop = 0
  }, [id])
  return (
    <div className="crm-split-detail" ref={pane}>
      {id ? (
        <LeadDetail key={id} id={id} params={new URLSearchParams(window.location.hash.split('?')[1] ?? '')} />
      ) : (
        <div className="crm-split-empty">
          <Icon name="store" size={30} />
          <p>Pick a business to see where it is and what happens next.</p>
          {total != null && <span>{total} businesses in the book</span>}
        </div>
      )}
    </div>
  )
}

/** Your name, and a menu with the places that are not tabs. */
function Account({ actor, onSignOut, open = false, setOpen, partner = false }: { actor: Actor; onSignOut: () => void; open?: boolean; setOpen?: (v: boolean) => void; partner?: boolean }) {
  const signOut = async () => {
    await api('/api/crm/session', { method: 'DELETE' }).catch(() => {})
    onSignOut()
  }
  if (partner) {
    return (
      <div className="crm-account is-static">
        <Avatar name={actor.name} size={34} />
        <span className="crm-account-name">
          <strong>{actor.name}</strong>
          <span>Partner</span>
        </span>
      </div>
    )
  }
  const links: [string, string, IconName][] = [
    ['#/pipeline', 'Board', 'kanban'],
    ['#/followups?view=upcoming', 'Reminders', 'bell'],
    ['#/businesses', 'Grouped businesses', 'building'],
    ['#/analytics', "How it's going", 'chart'],
  ]
  if (actor.role === 'admin') links.push(['#/settings', 'Settings', 'settings'])
  return (
    <div className="crm-account">
      <button type="button" className="crm-account-btn" onClick={() => setOpen?.(!open)} aria-expanded={open} aria-haspopup="menu" aria-label={`${actor.name}'s menu`}>
        <Avatar name={actor.name} size={36} />
      </button>
      {open && (
        <>
          <div className="crm-menu-scrim" onClick={() => setOpen?.(false)} />
          <div className="crm-menu" role="menu">
            <div className="crm-menu-who">
              <Avatar name={actor.name} size={40} />
              <span>
                <strong>{actor.name}</strong>
                <span>{actor.role === 'admin' ? 'Admin' : 'Team'}</span>
              </span>
            </div>
            {links.map(([href, label, icon]) => (
              <a key={href} href={href} role="menuitem" onClick={() => setOpen?.(false)}>
                <Icon name={icon} size={18} />
                {label}
              </a>
            ))}
            {actor.via === 'operator' && (
              <button type="button" role="menuitem" onClick={() => void signOut()}>
                <Icon name="logout" size={18} />
                Sign out
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- search */

function Search({ onClose, admin }: { onClose: () => void; admin: boolean }) {
  const { go } = useCrm()
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    input.current?.focus()
  }, [])
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 180)
    return () => clearTimeout(t)
  }, [q])
  const { data } = useApi<{ leads: LeadSummary[]; people: { id: string; name: string; slug: string; leads: number }[] }>(
    debounced.length >= 2 ? `/api/crm/search?q=${encodeURIComponent(debounced)}` : null,
  )
  const pages = useMemo(
    () => PAGES.filter((n) => (admin || n.key !== 'settings') && (!q.trim() || n.label.toLowerCase().includes(q.trim().toLowerCase()))),
    [q, admin],
  )
  const items: { key: string; hash: string; node: JSX.Element }[] = []
  if (debounced.length >= 2 && data) {
    for (const l of data.leads)
      items.push({
        key: `l-${l.id}`,
        hash: `#/lead/${l.id}`,
        node: (
          <>
            <Tile name={l.name} icon={l.icon} stage={l.stage} size={40} />
            <span className="crm-found-text">
              <strong>{l.name}</strong>
              <span>{placeLine(l.category, l.city)}</span>
            </span>
            <StagePill stage={l.stage} />
          </>
        ),
      })
    for (const p of data.people)
      items.push({
        key: `p-${p.id}`,
        hash: `#/referrer/${p.id}`,
        node: (
          <>
            <Avatar name={p.name} size={36} />
            <span className="crm-found-text">
              <strong>{p.name}</strong>
              <span>
                Sent {p.leads} business{p.leads === 1 ? '' : 'es'}
              </span>
            </span>
          </>
        ),
      })
  }
  for (const n of pages)
    items.push({
      key: `n-${n.key}`,
      hash: `#/${n.key}`,
      node: (
        <>
          <span className="crm-found-icon">
            <Icon name={n.icon} size={18} />
          </span>
          <span className="crm-found-text">
            <strong>{n.label}</strong>
          </span>
        </>
      ),
    })
  const pick = (hash: string) => {
    onClose()
    window.location.hash = hash
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const it = items[sel]
    if (it) pick(it.hash)
    else if (q.trim()) go(`leads?q=${encodeURIComponent(q.trim())}`)
  }
  return (
    <div className="crm-overlay" role="dialog" aria-modal="true" aria-label="Search" onClick={onClose}>
      <form className="crm-palette" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="crm-search">
          <Icon name="search" size={20} stroke={2} />
          <input
            ref={input}
            type="search"
            placeholder="A business, phone number, @instagram or person"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setSel(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSel((s) => Math.min(items.length - 1, s + 1))
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSel((s) => Math.max(0, s - 1))
              }
            }}
            aria-label="Search the CRM"
          />
          <button type="button" className="crm-search-close" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div className="crm-search-results" role="listbox">
          {debounced.length >= 2 && data && !data.leads.length && !data.people.length && <div className="crm-search-none">Nothing matches “{debounced}”.</div>}
          {items.map((it, i) => (
            <button type="button" key={it.key} role="option" aria-selected={i === sel} className={i === sel ? 'is-sel' : undefined} onMouseEnter={() => setSel(i)} onClick={() => pick(it.hash)}>
              {it.node}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}

/* --------------------------------------------------------------- sign in */

/*
  THE OPERATOR KEY, AND ONLY THAT FOR NOW. Leon, 2026-09-23: "only login
  throguh operator key remove email login now". The card is the key form and
  nothing else, unless the server says member sign-in is on
  (CRM_MEMBER_SIGNIN=1): then the team and referral partners get a code to the
  BEASTY account they already have, only ever a sign-in, never a new account
  (signinOnly on the server), with the key one tap away. The session is set on
  whichever address serves the CRM.
*/
function SignIn({ member, memberSignin, onDone }: { member: { name: string } | null; memberSignin: boolean; onDone: () => void }) {
  const [useKey, setUseKey] = useState(false)
  if (!memberSignin) {
    return (
      <div className="crm crm-signin">
        <div className="crm-signin-card">
          <Brand />
          <h1>The BEASTY book</h1>
          <p>Sign in with the operator key.</p>
          <KeyForm onDone={onDone} />
          <a className="crm-link" href={site.origin}>
            Go to beastypages.com
          </a>
        </div>
      </div>
    )
  }
  return (
    <div className="crm crm-signin">
      <div className="crm-signin-card">
        <Brand />
        <h1>The BEASTY book</h1>
        {member && (
          <p>
            You are signed in to BEASTY as {member.name}, but your account has no CRM role yet. An admin can add you in CRM
            Settings.
          </p>
        )}
        {useKey ? <KeyForm onDone={onDone} /> : !member && <CodeForm onDone={onDone} />}
        <button type="button" className="crm-link" onClick={() => setUseKey(!useKey)}>
          {useKey ? (member ? 'Back' : 'Sign in with your BEASTY account instead') : 'Have the operator key?'}
        </button>
        <a className="crm-link" href={site.origin}>
          Go to beastypages.com
        </a>
      </div>
    </div>
  )
}

function CodeForm({ onDone }: { onDone: () => void }) {
  /* Which way a code can arrive, as the site's own sign-in asks: a text when
     texting works, an email otherwise, or the choice when both do. */
  const [channels, setChannels] = useState<{ sms: boolean; email: boolean } | null>(null)
  const [preferEmail, setPreferEmail] = useState(false)
  const [to, setTo] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    api<{ sms: boolean; email: boolean }>('/api/members/channels').then(setChannels, () => setChannels({ sms: false, email: true }))
  }, [])
  const byPhone = !!channels?.sms && !(preferEmail && channels.email)
  const where = (v: string) => (byPhone ? { phone: v } : { email: v })
  const ready = byPhone ? to.replace(/\D/g, '').length >= 10 : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())

  const send = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      /* The name is only ever kept for a new account, which this never makes. */
      await api('/api/members/start', { method: 'POST', body: { name: 'BEASTY team', ...where(to.trim()), signinOnly: true } })
      setSentTo(to.trim())
      setCode('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const verify = async (e: FormEvent) => {
    e.preventDefault()
    if (!sentTo) return
    setBusy(true)
    setError(null)
    try {
      await api('/api/members/verify', { method: 'POST', body: { ...where(sentTo), code, signinOnly: true } })
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  if (!channels) return <Loading />
  if (sentTo) {
    return (
      <form className="crm-signin-step" onSubmit={verify}>
        <p>
          If {sentTo} has a BEASTY account, a 6-digit code is on its way {byPhone ? 'by text' : 'by email'}.
        </p>
        <label className="crm-field">
          <span>Code</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
        </label>
        {error && <div className="crm-error">{error}</div>}
        <button type="submit" className="crm-btn is-primary is-big" disabled={busy || code.length !== 6}>
          {busy ? 'Checking…' : 'Sign in'}
        </button>
        <button type="button" className="crm-link" onClick={() => setSentTo(null)}>
          {byPhone ? 'Use a different number' : 'Use a different email'}
        </button>
      </form>
    )
  }
  return (
    <form className="crm-signin-step" onSubmit={send}>
      <p>Team members and referral partners: sign in with your BEASTY account. We will send you a code.</p>
      <label className="crm-field">
        <span>{byPhone ? 'Mobile number' : 'Email'}</span>
        <input
          type={byPhone ? 'tel' : 'email'}
          inputMode={byPhone ? 'tel' : 'email'}
          autoComplete={byPhone ? 'tel' : 'email'}
          autoCapitalize="none"
          spellCheck={false}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>
      {error && <div className="crm-error">{error}</div>}
      <button type="submit" className="crm-btn is-primary is-big" disabled={busy || !ready}>
        {busy ? 'Sending…' : 'Send me a code'}
      </button>
      {channels.sms && channels.email && (
        <button
          type="button"
          className="crm-link"
          onClick={() => {
            setPreferEmail(!preferEmail)
            setTo('')
          }}
        >
          {byPhone ? 'Use my email instead' : 'Use my mobile number instead'}
        </button>
      )}
    </form>
  )
}

function KeyForm({ onDone }: { onDone: () => void }) {
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
  return (
    <form className="crm-signin-step" onSubmit={submit}>
      <label className="crm-field">
        <span>Operator key</span>
        <input type="password" autoComplete="current-password" value={token} onChange={(e) => setToken(e.target.value)} autoFocus />
      </label>
      {error && <div className="crm-error">{error}</div>}
      <button type="submit" className="crm-btn is-primary is-big" disabled={busy || token.length < 8}>
        {busy ? 'Checking…' : 'Open the CRM'}
      </button>
    </form>
  )
}
