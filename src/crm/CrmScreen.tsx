/*
  /crm — BEASTY's internal growth screen.

  Chosen in main.tsx before the app mounts, like /kitchen: no landing, no
  catalogue, nothing a customer loads. Routes live in the hash (#/leads,
  #/lead/<id>, ...), so the back button, a refresh and a pasted link all land
  where they were. Everything it shows comes from /api/crm, which checks the
  role on every request.

  The frame: a sidebar on a wide screen, a top bar and a bottom tab bar on a
  phone, and a ⌘K palette on both that finds any business, number, @handle or
  person and jumps to any page.
*/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './crm.css'
import { api } from './api'
import type { Actor, LeadSummary, Meta } from './api'
import { Avatar, Crm, Failure, Loading, StagePill, useApi } from './ui'
import { Icon } from './icons'
import type { IconName } from './icons'
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

interface NavItem {
  key: string
  label: string
  icon: IconName
  group: 'main' | 'insights' | 'admin'
}

const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: 'home', group: 'main' },
  { key: 'leads', label: 'Leads', icon: 'users', group: 'main' },
  { key: 'pipeline', label: 'Pipeline', icon: 'kanban', group: 'main' },
  { key: 'followups', label: 'Follow-ups', icon: 'calendar', group: 'main' },
  { key: 'businesses', label: 'Businesses', icon: 'building', group: 'main' },
  { key: 'referrers', label: 'Referrers', icon: 'share', group: 'insights' },
  { key: 'revenue', label: 'Revenue', icon: 'dollar', group: 'insights' },
  { key: 'analytics', label: 'Analytics', icon: 'chart', group: 'insights' },
  { key: 'settings', label: 'Settings', icon: 'settings', group: 'admin' },
]

const TABS: { key: string; label: string; icon: IconName }[] = [
  { key: 'overview', label: 'Home', icon: 'home' },
  { key: 'leads', label: 'Leads', icon: 'users' },
  { key: 'pipeline', label: 'Pipeline', icon: 'kanban' },
  { key: 'followups', label: 'Follow-ups', icon: 'calendar' },
]

export default function CrmScreen() {
  const [route, setRoute] = useState<Route>(parseHash)
  const [me, setMe] = useState<{ actor: Actor | null; member: { name: string } | null } | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [metaError, setMetaError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [more, setMore] = useState(false)
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
      setMore(false)
      setRoute(parseHash())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  /* ⌘K / Ctrl+K anywhere, and "/" when not typing, open the palette. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearching(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

  /* Live counts for the sidebar and the tab bar, refreshed as you move around. */
  const badges = useApi<{ counts: Record<string, number>; attention: { key: string; count: number }[] }>(meta ? `/api/crm/overview?_=${route.name}` : null)

  if (!me) return <div className="crm"><Loading /></div>
  if (!me.actor) return <SignIn member={me.member} onDone={loadMe} />
  if (me.actor.role === 'partner') {
    return (
      <div className="crm crm-partner" ref={scroller}>
        <header className="crm-mtop is-always">
          <Brand />
          <UserChip actor={me.actor} onSignOut={loadMe} compact />
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
  const nav = NAV.filter((n) => n.group !== 'admin' || me.actor?.role === 'admin')
  const count = (key: string) => {
    const c = badges.data
    if (!c) return null
    if (key === 'leads') return { n: c.counts.total, tone: 'muted' }
    if (key === 'followups') {
      const n = c.attention.find((a) => a.key === 'overdue')?.count ?? 0
      return n ? { n, tone: 'red' } : null
    }
    return null
  }
  const title = NAV.find((n) => n.key === active)?.label ?? 'Overview'

  return (
    <Crm.Provider value={ctx}>
      <div className="crm" ref={scroller}>
        <div className="crm-app">
          <aside className="crm-side" aria-label="CRM">
            <div className="crm-side-top">
              <Brand />
            </div>
            <button type="button" className="crm-search-trigger" onClick={() => setSearching(true)}>
              <Icon name="search" size={15} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
            <nav className="crm-nav" aria-label="CRM sections">
              {(['main', 'insights', 'admin'] as const).map((g) => {
                const items = nav.filter((n) => n.group === g)
                if (!items.length) return null
                return (
                  <div className="crm-nav-group" key={g}>
                    {g !== 'main' && <div className="crm-nav-label">{g === 'insights' ? 'Insights' : 'Workspace'}</div>}
                    {items.map((n) => {
                      const b = count(n.key)
                      return (
                        <a key={n.key} href={`#/${n.key}`} className={active === n.key ? 'is-on' : undefined} aria-current={active === n.key ? 'page' : undefined}>
                          <Icon name={n.icon} size={16} />
                          <span>{n.label}</span>
                          {b && <em className={`crm-count is-${b.tone}`}>{b.n}</em>}
                        </a>
                      )
                    })}
                  </div>
                )
              })}
            </nav>
            <div className="crm-side-foot">
              <UserChip actor={me.actor} onSignOut={loadMe} />
            </div>
          </aside>

          <div className="crm-body">
            <header className="crm-mtop">
              <Brand small />
              <span className="crm-mtop-title">{title}</span>
              <button type="button" className="crm-iconbtn" aria-label="Search the CRM" onClick={() => setSearching(true)}>
                <Icon name="search" size={19} />
              </button>
            </header>
            <main className="crm-main">{view}</main>
          </div>
        </div>

        <nav className="crm-tabbar" aria-label="Sections">
          {TABS.map((t) => {
            const b = count(t.key)
            return (
              <a key={t.key} href={`#/${t.key}`} className={active === t.key ? 'is-on' : undefined} aria-current={active === t.key ? 'page' : undefined}>
                <span className="crm-tabbar-icon">
                  <Icon name={t.icon} size={22} stroke={active === t.key ? 2.1 : 1.75} />
                  {b && b.tone === 'red' && <em className="crm-tabbar-badge">{b.n}</em>}
                </span>
                <span>{t.label}</span>
              </a>
            )
          })}
          <button type="button" className={!TABS.some((t) => t.key === active) || more ? 'is-on' : undefined} onClick={() => setMore(true)} aria-haspopup="dialog">
            <span className="crm-tabbar-icon">
              <Icon name="grid" size={22} />
            </span>
            <span>More</span>
          </button>
        </nav>

        {more && (
          <div className="crm-sheet" role="dialog" aria-modal="true" aria-label="More" onClick={() => setMore(false)}>
            <div className="crm-sheet-card crm-more" onClick={(e) => e.stopPropagation()}>
              <div className="crm-sheet-grip" aria-hidden="true" />
              <div className="crm-more-grid">
                {nav
                  .filter((n) => !TABS.some((t) => t.key === n.key))
                  .map((n) => (
                    <a key={n.key} href={`#/${n.key}`} className={active === n.key ? 'is-on' : undefined}>
                      <span className="crm-more-icon">
                        <Icon name={n.icon} size={20} />
                      </span>
                      {n.label}
                    </a>
                  ))}
              </div>
              <div className="crm-more-foot">
                <UserChip actor={me.actor} onSignOut={loadMe} />
              </div>
            </div>
          </div>
        )}

        {searching && <Palette onClose={() => setSearching(false)} nav={nav} />}
      </div>
    </Crm.Provider>
  )
}

/* ------------------------------------------------------------- chrome */

function Brand({ small = false }: { small?: boolean }) {
  return (
    <a className={`crm-brand${small ? ' is-small' : ''}`} href="#/overview" aria-label="BEASTY CRM, overview">
      <span className="crm-brand-mark" aria-hidden="true">
        B
      </span>
      <span className="crm-brand-name">
        BEASTY <span>CRM</span>
      </span>
    </a>
  )
}

function UserChip({ actor, onSignOut, compact = false }: { actor: Actor; onSignOut: () => void; compact?: boolean }) {
  const signOut = async () => {
    await api('/api/crm/session', { method: 'DELETE' }).catch(() => {})
    onSignOut()
  }
  return (
    <div className={`crm-user${compact ? ' is-compact' : ''}`}>
      <Avatar name={actor.name} size={30} kind="person" />
      <span className="crm-user-text">
        <strong>{actor.name}</strong>
        <span className="crm-role">{actor.role}</span>
      </span>
      {actor.via === 'operator' && (
        <button type="button" className="crm-iconbtn" onClick={signOut} aria-label="Sign out" title="Sign out">
          <Icon name="logout" size={16} />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- ⌘K palette */

function Palette({ onClose, nav }: { onClose: () => void; nav: NavItem[] }) {
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
  const pages = useMemo(() => nav.filter((n) => !q.trim() || n.label.toLowerCase().includes(q.trim().toLowerCase())), [nav, q])
  const items: { key: string; hash: string; node: JSX.Element }[] = []
  if (debounced.length >= 2 && data) {
    for (const l of data.leads)
      items.push({
        key: `l-${l.id}`,
        hash: `#/lead/${l.id}`,
        node: (
          <>
            <Avatar name={l.name} icon={l.icon} size={28} />
            <span className="crm-pal-text">
              <strong>{l.name}</strong>
              <span>{[l.city, l.category].filter(Boolean).join(' · ')}</span>
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
            <Avatar name={p.name} size={28} kind="person" />
            <span className="crm-pal-text">
              <strong>{p.name}</strong>
              <span>
                Referrer · {p.leads} lead{p.leads === 1 ? '' : 's'}
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
          <span className="crm-pal-icon">
            <Icon name={n.icon} size={16} />
          </span>
          <span className="crm-pal-text">
            <strong>{n.label}</strong>
            <span>Go to page</span>
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
    else if (q.trim()) pick(`#/leads?q=${encodeURIComponent(q.trim())}`)
  }
  return (
    <div className="crm-palette-wrap" role="dialog" aria-modal="true" aria-label="Search" onClick={onClose}>
      <form className="crm-palette" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="crm-search">
          <Icon name="search" size={18} />
          <input
            ref={input}
            type="search"
            placeholder="Search businesses, phones, emails, @handles, people"
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
          <kbd onClick={onClose}>Esc</kbd>
        </div>
        <div className="crm-search-results" role="listbox">
          {debounced.length >= 2 && data && !data.leads.length && !data.people.length && <div className="crm-search-none">No businesses or people match “{debounced}”.</div>}
          {items.map((it, i) => (
            <button type="button" key={it.key} role="option" aria-selected={i === sel} className={i === sel ? 'is-sel' : undefined} onMouseEnter={() => setSel(i)} onClick={() => pick(it.hash)}>
              {it.node}
            </button>
          ))}
        </div>
        <div className="crm-palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>↵</kbd> to open
          </span>
          <span>
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </form>
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
        <Brand />
        <h1>Welcome back</h1>
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
