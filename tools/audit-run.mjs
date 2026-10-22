/*
  Runtime audit — the things only a real browser can answer.

  Everything here has already shipped broken in this repo at least once: icons
  that 404 while the page carries on, chrome whose ink is inherited onto a plate
  it cannot be read against, controls with no accessible name, and a grid that
  fits on the viewport the test used and not the one Safari gives a phone.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
/*
  Sign a page in through the real two-step flow.

  The code is scraped from the server's own log, which is where it goes when no
  email provider is configured — it is never in an HTTP response, and an audit
  that could read it from one would be proving the opposite of what it should.
*/
/*
  SIGNING IN BY PHONE, because the screens do — "we want only SMS", 2026-08-29.
  555-01xx is the reserved fictional exchange: right in a test, wrong in
  production. audit-auth still covers the email path, which the server keeps
  open for the accounts that predate the change.
*/
async function signIn(page, fields, logPath) {
  const { readFileSync } = await import('node:fs')
  const started = await page.evaluate(async (f) => {
    const r = await fetch('/api/members/start', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      credentials: 'same-origin', body: JSON.stringify(f),
    })
    return r.status
  }, fields)
  if (started !== 202) throw new Error(`start returned ${started}`)
  const line = readFileSync(logPath, 'utf8').split('\n')
    .filter((l) => l.includes(`[login-code] ${fields.phone} `)).pop()
  const code = line && line.match(/ (\d{6}) /)?.[1]
  if (!code) throw new Error('no login code was logged')
  return page.evaluate(async ({ phone, code }) => {
    const r = await fetch('/api/members/verify', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      credentials: 'same-origin', body: JSON.stringify({ phone, code }),
    })
    return r.ok ? await r.json() : null
  }, { phone: fields.phone, code })
}

import { createServer } from 'node:net'
import { freshTestDb } from './pgtest.mjs'

/* NINETY SECONDS ON THE DOOR, not the default thirty.

   The landing screen counts down before it draws its Enter button, and under
   the suite's parallelism on a loaded machine that countdown outruns a 30s
   auto-wait. Both of these passed standalone and failed inside audit-all.sh,
   which is the signature of a timeout rather than a defect. */
const TESTDB = await freshTestDb('run')

const freePort = () =>
  new Promise((r) => {
    const s = createServer()
    s.listen(0, () => {
      const { port } = s.address()
      s.close(() => r(port))
    })
  })

const port = await freePort()
/*
  THE REAL SERVER, NOT `vite preview`.

  It used to be the preview, which serves ./dist and nothing else — no API at
  all. That was fine until the app started asking who is signed in on boot:
  every page load then logged a 500 for /api/members/me, and this audit
  correctly flagged seven failed requests that do not exist in production.

  The fix is the environment, not the check. Express serves the same ./dist AND
  the API on one origin, which is exactly the shape that deploys, so auditing
  against it tests the thing that ships. Its own scratch database keeps the run
  out of any real data.
*/
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  env: {
    ...process.env,
    PORT: String(port),
    DATABASE_URL: TESTDB.url,
    ALLOW_MOCK_PAYMENTS: '1',
    NODE_ENV: 'development',
  },
  stdio: ['ignore', (await import('node:fs')).openSync('/tmp/audit-run.log','a'),
          (await import('node:fs')).openSync('/tmp/audit-run.log','a')],
})
const base = `http://localhost:${port}`
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break
  } catch {
    await new Promise((r) => setTimeout(r, 250))
  }
}

const findings = []
const err = (w) => findings.push(['ERROR', w])
const warn = (w) => findings.push(['WARN', w])
const note = (w) => findings.push(['NOTE', w])

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })

// ---- console and network health -----------------------------------------
const consoleErrors = []
const bad = []
p.on('console', (m) => {
  // The browser logs the expected 401 above as a console error too. Same
  // reasoning, same precision: only that one line is allowed through.
  const t = m.text()
  if (m.type() === 'error' && !/401 \(Unauthorized\)/.test(t)) consoleErrors.push(t.slice(0, 140))
})
p.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 140)))
/*
  ONE EXPECTED FAILURE, NAMED EXACTLY.

  The app asks who is signed in on first boot, and for a visitor who is not, the
  answer IS 401 — that is the documented reply, not a fault. Every other status
  on that path, and every 4xx anywhere else, still fails this audit. Written as
  one precise pair rather than "ignore /api errors", which would have hidden the
  500s that sent this audit at the real server in the first place.
*/
const EXPECTED = new Set(['401 /api/members/me'])
p.on('response', (r) => {
  const line = `${r.status()} ${r.url().replace(base, '')}`
  if (r.status() >= 400 && !EXPECTED.has(line)) bad.push(line)
})

/*
  SIGN IN FIRST, because this audit checks the app a MEMBER sees.

  Most of what it walks — other cities, the reels, the gallery, search — now
  sits behind the sign-up gate, so a signed-out run cannot reach it and would
  quietly stop testing the majority of the app. Creating a member through the
  real endpoint is also a free check that sign-up works on every run.
*/
await p.goto(base, { waitUntil: 'domcontentloaded' })
const account = await signIn(p, { name: 'Audit Runner', phone: `+1510555${String(Date.now()).slice(-4)}` },
  '/tmp/audit-run.log')
if (!account) console.log('ERROR sign-in failed; the rest of this audit cannot run signed in')
await p.goto(base, { waitUntil: 'networkidle' })
await p.click('[aria-label="Enter BEASTY"]', { timeout: 90000 })
await p.waitForTimeout(2800)

// ---- walk every page with the new arrows --------------------------------
const total = await p.evaluate(() => {
  const m = document.querySelector('.page-dots .dot')?.getAttribute('aria-label')?.match(/of (\d+)/)
  return m ? Number(m[1]) : 0
})
note(`${total} pages in the pager`)

const seenHeads = new Set()
for (let i = 0; i < 24; i++) {
  const h = await p.evaluate(
    () => document.querySelector('.home-page-city')?.textContent.trim().replace(/\s+/g, ' ') ?? '',
  )
  if (h) seenHeads.add(h)
  if (await p.isDisabled('.page-step.is-next')) break
  await p.click('.page-step.is-next')
  await p.waitForTimeout(230)
}
note(`stepped through ${seenHeads.size} distinct headings with the arrows`)

// ---- accessible names on every control ----------------------------------
const nameless = await p.evaluate(() =>
  [...document.querySelectorAll('button, a[href], [role="button"]')]
    .filter((n) => n.offsetParent !== null)
    .filter((n) => {
      const name =
        n.getAttribute('aria-label') ||
        n.getAttribute('title') ||
        (n.textContent || '').trim() ||
        n.querySelector('img[alt]')?.getAttribute('alt')
      return !name
    })
    .map((n) => `${n.tagName.toLowerCase()}.${String(n.className).slice(0, 40)}`)
    .slice(0, 12),
)
if (nameless.length) err(`${nameless.length} visible controls have no accessible name: ${nameless.join(', ')}`)

// ---- images that resolved to nothing ------------------------------------
const broken = await p.evaluate(() =>
  [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src).slice(0, 8),
)
if (broken.length) err(`${broken.length} images decoded to nothing: ${broken.join(', ')}`)

// ---- brand pages: a sample across the shapes ----------------------------
const SAMPLE = [
  ['b_magicjuans', 'real offer + booking'],
  ['b_downtownbbq', 'mock offer + clip'],
  ['b_jenuinefitness', 'mock offer + photo'],
  ['b_salathai', 'brand new, contact only'],
  ['b_siacollective', 'online only'],
  ['b_allyvirtual', 'the de-duplicated one'],
]
for (const [id, what] of SAMPLE) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  const st = await p.evaluate(() => ({
    title: document.querySelector('h1, .brand-title, [class*="title"]')?.textContent?.trim() ?? '',
    priced: document.body.innerText.match(/\$\d/g)?.length ?? 0,
    hasMock: !!document.querySelector('.brand-offer-mock'),
    hasOffer: !!document.querySelector('.brand-offer'),
  }))
  if (!st.title) err(`brand page ${id} (${what}) rendered no title`)
  if (st.hasOffer && !st.hasMock) note(`${id} (${what}) shows an offer with NO example-only caveat — verify that is agreed`)
}

await b.close()
srv.kill()

if (consoleErrors.length) err(`${consoleErrors.length} console error(s): ${consoleErrors.slice(0, 3).join(' | ')}`)
if (bad.length) err(`${bad.length} request(s) returned >=400: ${bad.slice(0, 6).join(', ')}`)

const rank = { ERROR: 0, WARN: 1, NOTE: 2 }
findings.sort((a, c) => rank[a[0]] - rank[c[0]])
for (const [lvl, w] of findings) console.log(`${lvl.padEnd(5)} ${w}`)
const errors = findings.filter((f) => f[0] === 'ERROR').length
console.log(`\n${errors} error(s), ${findings.filter((f) => f[0] === 'WARN').length} warning(s)`)
process.exit(errors ? 1 : 0)
