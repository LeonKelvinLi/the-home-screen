#!/usr/bin/env node
/*
  Walk the whole app and report what is actually broken on screen.

  The other nineteen audits each prove one thing deeply — that a code verifies,
  that a tile is not a logo in a circle, that ink survives a wallpaper. None of
  them opens every screen in turn and asks the flat question: does this page
  render, does anything fall off the side of it, is anything too small to
  press, and did the console fill up while it drew.

  WHAT IT CHECKS, and why each one is here rather than assumed:

  - PAGE AND CONSOLE ERRORS. An uncaught error inside a React subtree blanks
    that subtree and leaves the rest of the app looking fine, so nothing else
    in the suite would notice.
  - FAILED REQUESTS. A missing icon or wallpaper 404s silently and draws as
    nothing; every asset this app serves is one it put there itself, so a 404
    is always a bug and never a fact of life.
  - HORIZONTAL OVERFLOW. This is a phone-shaped app. A page that scrolls
    sideways is the single most visible layout defect there is.
  - ELEMENTS WIDER THAN THE VIEWPORT, which is the usual cause of the above and
    names the culprit rather than the symptom.
  - TAP TARGETS UNDER 40px. Apple's guidance is 44pt; 40 is the line below
    which a thumb misses often enough to notice. Only visible, enabled,
    genuinely interactive elements count.
  - CLIPPED TEXT: a box whose content is taller than it is, with the overflow
    hidden and no ellipsis to say so. That is a sentence that stops mid-word.
  - BLANK SCREENS. A screen that renders under twenty characters of text has
    almost certainly failed to load something.

  It is deliberately loud about nothing being fine: every screen it visits is
  named in the output, so a screen that silently stopped being reachable shows
  up as a missing line rather than as a pass.

    node tools/audit-ux.mjs              # phone
    node tools/audit-ux.mjs --wide       # tablet width as well
    SHOTS=/tmp/ux node tools/audit-ux.mjs   # write a screenshot per screen
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'
import { openSync, readFileSync } from 'node:fs'

const SHOTS = process.env.SHOTS
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const freePort = () =>
  new Promise((r) => {
    const s = createServer()
    s.listen(0, () => {
      const { port } = s.address()
      s.close(() => r(port))
    })
  })

/*
  THE REAL SERVER, not `vite preview`.

  The first run of this reported sixteen failed requests and sixteen console
  errors, every one of them /api/members/me or /api/brands/:id/signals coming
  back 404. Nothing was broken: `vite preview` serves the built client and has
  no API behind it, so every screen that asks the server a question fails by
  construction. An audit whose loudest finding is its own harness teaches you
  to ignore it.
*/
const port = await freePort()
const TESTDB = await freshTestDb('ux')
const LOG = `/tmp/audit-ux-${process.pid}.log`
const logFd = openSync(LOG, 'w')
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', logFd, logFd],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', ALLOW_MOCK_PAYMENTS: '1' },
})
/* The one-time code is only ever printed to the server log — see the OTP
   audit. Signing in through the screens is the only way to see the screens
   behind the gate, and this is how the other audits do it. */
const codeFor = (email) => {
  const line = readFileSync(LOG, 'utf8').split('\n').filter((x) => x.includes(`[login-code] ${email} `)).pop()
  return line && line.match(/ (\d{6}) /)?.[1]
}
const base = `http://localhost:${port}`

const problems = []
const fail = (screen, kind, detail) => problems.push({ screen, kind, detail })

/*
  Elements that are allowed to be wider than the viewport.

  The home screen's page strip IS wider than the screen on purpose — that is
  how the pages sit side by side to be swiped between — and so is any element
  inside it. Flagging those would bury the real findings under the app working
  correctly.
*/
const OVERFLOW_OK = [
  '.home-pager', // the pages sit side by side inside it, which is the swipe
  '.is-receding', // the home screen sliding away behind an app that just opened
]

const AUDIT = `(() => {
  const out = { overflow: [], small: [], clipped: [], text: 0 }
  const vw = window.innerWidth
  out.scrollWidth = document.documentElement.scrollWidth
  const okParents = ${JSON.stringify(OVERFLOW_OK)}
  const inSwiper = (el) => okParents.some((sel) => el.closest(sel))
  const named = (el) => {
    const id = el.id ? '#' + el.id : ''
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : ''
    return el.tagName.toLowerCase() + id + cls
  }
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue

    /*
      An element wider than the screen is only a defect if something can SEE
      it. .glitch-band is deliberately left:-6%/right:-6% so its inverted band
      runs past both edges, and an ancestor clips it — reporting that is
      reporting the effect working. What matters is whether the page can be
      scrolled sideways to reach the overhang, which is checked separately, and
      whether anything is hanging out unclipped.
    */
    const clipped = (() => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs2 = getComputedStyle(a)
        if (cs2.overflow !== 'visible' || cs2.overflowX !== 'visible') return true
      }
      return false
    })()
    if (!inSwiper(el) && !clipped && (r.width > vw + 1 || r.right > vw + 1 || r.left < -1)) {
      out.overflow.push({ el: named(el), w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right) })
    }

    const tappable = el.matches('button, a[href], [role="button"], input, select, summary')
    if (tappable && !el.hasAttribute('disabled') && r.top < window.innerHeight && r.bottom > 0) {
      /*
        A TRANSPARENT ::after IS HOW THIS APP GROWS A HIT REGION without moving
        the artwork — .dot and .spotlight both do it, and the page dots are a
        7px circle inside a region reasoned about at length in styles.css.
        Measuring the element's own box called all thirty-nine of them a defect.
      */
      let grow = { t: 0, r: 0, b: 0, l: 0 }
      for (const pseudo of ['::after', '::before']) {
        const ps = getComputedStyle(el, pseudo)
        if (!ps || ps.content === 'none' || ps.position !== 'absolute') continue
        const px = (v) => (v && v.endsWith('px') ? -parseFloat(v) : 0)
        grow = {
          t: Math.max(grow.t, px(ps.top)), r: Math.max(grow.r, px(ps.right)),
          b: Math.max(grow.b, px(ps.bottom)), l: Math.max(grow.l, px(ps.left)),
        }
      }
      const w = r.width + grow.l + grow.r
      const h = r.height + grow.t + grow.b
      /*
        BOTH dimensions, not either.

        44pt square is the guideline, and a control that misses it in one axis
        is not automatically a defect: the page dots are 15x44 because there
        are thirty-nine pages on a ten-pixel pitch, and styles.css works
        through why a 44-wide region there would put a tap on the third dot
        onto the seventh. A thumb cannot miss a 44px-tall strip vertically, and
        the regions tile edge to edge so there is no dead ground between them.

        What genuinely cannot be hit is a control that is small in BOTH
        directions — a bare 24x24 icon button floating on its own. That is what
        this flags.
      */
      if (w < 40 && h < 40) {
        out.small.push({ el: named(el), w: Math.round(w), h: Math.round(h), text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30) })
      }
    }

    // A box shorter than its own text, clipped, and not saying so.
    if ((cs.overflow === 'hidden' || cs.overflowY === 'hidden') &&
        cs.textOverflow !== 'ellipsis' &&
        !cs.webkitLineClamp?.match(/^[1-9]/) &&
        el.scrollHeight > el.clientHeight + 4 &&
        el.clientHeight > 0 && el.children.length === 0 &&
        (el.textContent || '').trim().length > 0) {
      out.clipped.push({ el: named(el), need: el.scrollHeight, has: el.clientHeight, text: el.textContent.trim().slice(0, 40) })
    }
  }
  out.text = (document.body.innerText || '').replace(/\\s+/g, ' ').trim().length
  return out
})()`

async function inspect(p, screen) {
  const r = await p.evaluate(AUDIT)
  if (r.scrollWidth > (await p.evaluate('window.innerWidth')) + 1) {
    fail(screen, 'scrolls sideways', `document is ${r.scrollWidth}px wide`)
  }
  for (const o of r.overflow.slice(0, 4)) fail(screen, 'off the side', `${o.el} w=${o.w} left=${o.left} right=${o.right}`)
  const seen = new Set()
  for (const s of r.small) {
    const k = s.el + s.text
    if (seen.has(k)) continue
    seen.add(k)
    if (seen.size > 4) break
    fail(screen, 'tap target', `${s.el} ${s.w}x${s.h} "${s.text}"`)
  }
  for (const c of r.clipped.slice(0, 3)) fail(screen, 'clipped text', `${c.el} needs ${c.need}px has ${c.has}px: "${c.text}"`)
  if (r.text < 20) fail(screen, 'blank screen', `only ${r.text} characters of text`)
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/${screen.replace(/[^a-z0-9]+/gi, '-')}.png` })
  return r
}

/*
  Once someone is signed in the landing screen lets them straight through, so
  the Enter button is simply not there any more. Clicking it unconditionally
  worked exactly until the walk started signing in first.
*/
/*
  Wait for it, then say whether it came.

  `locator.count()` resolves immediately. Used as an is-it-there test it reports
  "not on the home screen" for anything that has not finished animating in,
  which under the suite's parallelism is most things — the standalone run was
  clean and the same code inside audit-all.sh called Gallery and Watch missing.
  Every presence check in this file goes through here.
*/
async function present(p, sel, ms = 8000) {
  try {
    await p.locator(sel).first().waitFor({ state: 'visible', timeout: ms })
    return true
  } catch {
    return false
  }
}

async function enter(p) {
  /*
    WAIT FOR IT, do not ask whether it is there yet.

    `locator.count()` resolves immediately; `click()` auto-waits. The first
    version used count(), so on a slow load it found nothing, skipped the
    button and walked the rest of the app against a landing screen that was
    still counting down — every gated screen then reported itself unreachable
    and the sign-in reported itself impossible. Half a minute of waiting is
    cheaper than a run's worth of invented findings.
  */
  const btn = p.locator('[aria-label="Enter BEASTY"]').first()
  try {
    await btn.waitFor({ state: 'visible', timeout: 15000 })
  } catch {
    // Already through the door: a signed-in visitor is not shown the landing.
    await p.waitForTimeout(1200)
    return
  }
  await btn.click()
  await p.waitForTimeout(2600)
}

const viewports = process.argv.includes('--wide')
  ? [{ name: 'phone', width: 393, height: 852 }, { name: 'tablet', width: 834, height: 1112 }]
  : [{ name: 'phone', width: 393, height: 852 }]

try {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(base); if (r.ok) break } catch {}
    await new Promise((r) => setTimeout(r, 300))
  }
  const browser = await chromium.launch()

  for (const vp of viewports) {
    const p = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 })
    const tag = (s) => `${vp.name}/${s}`

    p.on('pageerror', (e) => fail(tag('any'), 'page error', String(e).slice(0, 160)))
    p.on('console', (m) => {
      if (m.type() !== 'error') return
      const t = m.text()
      // A cancelled fetch during teardown is noise, not a defect; so is the
      // browser narrating the expected 401 above.
      if (/Failed to load resource.*favicon|net::ERR_ABORTED/.test(t)) return
      if (/status of 401/.test(t)) return
      fail(tag('any'), 'console error', t.slice(0, 160))
    })
    p.on('response', (res) => {
      if (res.status() < 400) return
      /* A signed-out visitor asking who they are gets a 401, correctly, on
         every page load until they sign in. That is the app working. */
      if (res.status() === 401 && res.url().endsWith('/api/members/me')) return
      fail(tag('any'), 'failed request', `${res.status()} ${res.url().replace(base, '')}`)
    })

    await p.goto(base, { waitUntil: 'networkidle' })
    await inspect(p, tag('landing'))
    await enter(p)
    await inspect(p, tag('home-signed-out'))

    /*
      SIGN IN BEFORE WALKING. A signed-out visitor keeps the two flagship pages
      and every business on them, and six controls raise the sign-up prompt —
      which is the app working, and which makes most of these screens
      unreachable. audit-gate proves the gate; this audit is about what the
      screens look like once someone is through it.
    */
    /*
      NOTHING HERE THROWS.

      The first version called p.fill on the name field and crashed the whole
      audit when the join form was not up — which reported one Playwright
      timeout and nothing at all about the fifty screens it had already walked.
      An audit that dies tells you less than one that says "I could not sign in"
      and keeps going.
    */
    const email = `+1510564${String(Date.now()).slice(-4)}`
    let signedIn = false
    for (let attempt = 0; attempt < 2 && !signedIn; attempt++) {
      await p.keyboard.press('Escape')
      await p.waitForTimeout(400)
      await p.evaluate(() => window.dispatchEvent(new CustomEvent('beasty:join')))
      await p.waitForTimeout(1400)
      const name = p.locator('.join-field input[autocomplete="name"]').first()
      if (!(await present(p, '.join-field input[autocomplete=\"name\"]', 6000))) {
        // Second time round, from a clean load rather than from whatever screen
        // the last step happened to leave open.
        await p.goto(base, { waitUntil: 'networkidle' })
        await enter(p)
        continue
      }
      await inspect(p, tag('join'))
      await name.fill('Rae UX')
      await p.locator('.join-field input[type="tel"]').first().fill(email)
      /* Both: which is required depends on the channel the server can use. */
      await p.locator('.join-field input[type="email"]').first()
        .fill(`${email.replace(/\D/g, '')}@example.invalid`)
      await p.locator('form.join button[type="submit"]').first().click()
      await p.waitForTimeout(1500)
      const code = codeFor(email)
      if (!code) { fail(tag('join'), 'no login code', 'the server never printed one'); break }
      await p.locator('.join-code').first().fill(code)
      await p.locator('form.join button[type="submit"]').first().click()
      await p.waitForTimeout(1900)
      signedIn = await p.evaluate(async () => {
        const r = await fetch('/api/members/me', { credentials: 'same-origin' })
        return r.ok
      })
    }
    if (!signedIn) fail(tag('join'), 'could not sign in', 'the rest of this walk is a signed-out visitor, so gated screens are missing')
    await p.keyboard.press('Escape')
    await p.waitForTimeout(700)
    await inspect(p, tag('home'))

    /* Every dock set, and every app in it. The set buttons are the round 1/2/3
       beside Search; the apps are whatever that set happens to hold, so this
       does not go stale when he reorders them. */
    for (const set of ['1', '2', '3']) {
      const btn = p.locator('button', { hasText: new RegExp(`^${set}$`) }).first()
      if (await btn.count()) { await btn.click(); await p.waitForTimeout(600) }
      await inspect(p, tag(`dock-${set}`))
      const dock = p.locator('.dock button, .dock [role="button"], .dock a')
      const n = Math.min(await dock.count(), 4)
      for (let i = 0; i < n; i++) {
        const label = (await dock.nth(i).getAttribute('aria-label')) || `slot${i}`
        await dock.nth(i).click()
        await p.waitForTimeout(1000)
        await inspect(p, tag(`dock${set}-${label}`))
        const back = p.locator('button:has-text("Home"), [aria-label="Back"]').first()
        if (await back.count()) { await back.click(); await p.waitForTimeout(700) }
        else { await p.goto(base, { waitUntil: 'networkidle' }); await enter(p) }
        if (await btn.count()) { await btn.click(); await p.waitForTimeout(400) }
      }
    }

    /* A handful of brand pages, chosen to span the shapes a brand page can
       take: a full priced menu, a quote-only service, one with a video, and
       one deliberately carrying no icon. */
    for (const id of ['b_topdog', 'b_veganmob', 'b_rywire', 'b_mbnel', 'b_underdogscantina', 'b_sinmexautobody']) {
      await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle' })
      await p.waitForTimeout(900)
      await inspect(p, tag(`brand-${id}`))
    }

    /*
      THE SCREENS THE DOCK CANNOT REACH.

      Gallery, Watch and Search hang off the Spotlight row rather than the
      dock, Members is two taps inside Profile, and a blank spot is only
      reachable by finding one on a page. Every one of them is a screen a
      customer sees, so leaving them out would make a clean run mean less than
      it looks like it means.
    */
    await p.goto(base, { waitUntil: 'networkidle' })
    await enter(p)

    const goHome = async () => {
      const back = p.locator('button:has-text("Home"), [aria-label="Back"]').first()
      if (await back.count()) await back.click()
      else await p.keyboard.press('Escape')
      await p.waitForTimeout(800)
    }

    for (const [sel, name] of [['.spotlight-glass.is-gallery', 'gallery'], ['.spotlight-glass.is-watch', 'watch']]) {
      if (!(await present(p, sel))) { fail(tag(name), 'unreachable', sel + ' never became visible on the home screen'); continue }
      const el = p.locator(sel).first()
      await el.click()
      await p.waitForTimeout(1100)
      await inspect(p, tag(name))
      await goHome()
    }

    /* Search empty, then with something in it: a list of nothing and a list of
       a hundred rows lay out differently, and the long one is the risky one. */
    if (await present(p, '.spotlight')) {
      const spot = p.locator('.spotlight').first()
      await spot.click()
      await p.waitForTimeout(1000)
      await inspect(p, tag('search'))
      const field = p.locator('input').first()
      if (await present(p, 'input', 4000)) {
        await field.fill('pizza')
        await p.waitForTimeout(1000)
        await inspect(p, tag('search-results'))
      }
      await goHome()
    }

    /* Profile, then the membership screen it opens — the tiers, the offers and
       the referral arithmetic all live there. */
    if (await present(p, '[aria-label="Profile"]')) {
      const profile = p.locator('[aria-label="Profile"]').first()
      await profile.click()
      await p.waitForTimeout(1200)
      await inspect(p, tag('profile'))
      const become = p.locator('text=Tap here to become a member').first()
      if (await present(p, 'text=Tap here to become a member', 4000)) {
        await become.click()
        await p.waitForTimeout(1300)
        await inspect(p, tag('members'))
      }
      await goHome()
    }

    /* A blank spot, which is the thing an affiliate is pitched with. */
    await p.goto(base, { waitUntil: 'networkidle' })
    await enter(p)
    const blank = p.locator('[aria-label*="Available"], [aria-label*="Open spot"]').first()
    if (await present(p, '[aria-label*="Available"], [aria-label*="Open spot"]', 6000)) {
      await blank.click(); await p.waitForTimeout(900)
      await inspect(p, tag('blank-spot'))
    }

    await p.close()
  }

  await browser.close()
} finally {
  srv.kill()
  await TESTDB.drop()
}

const byKind = new Map()
for (const pr of problems) byKind.set(pr.kind, (byKind.get(pr.kind) ?? 0) + 1)

if (!problems.length) {
  console.log('UX: nothing found.')
  process.exit(0)
}
console.log(`UX: ${problems.length} finding(s) — ${[...byKind].map(([k, n]) => `${k} x${n}`).join(', ')}\n`)
const seen = new Set()
for (const pr of problems) {
  const k = `${pr.kind}|${pr.detail}`
  if (seen.has(k)) continue
  seen.add(k)
  console.log(`  [${pr.kind}] ${pr.screen}`)
  console.log(`      ${pr.detail}`)
}
process.exit(1)
