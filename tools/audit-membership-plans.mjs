/*
  THE TWO PASSES, SIDE BY SIDE, WITHOUT SCROLLING PAST ONE TO SEE THE OTHER.

  The whole point of putting BIGGIE PASS and BEASTY PASS on one screen is that
  somebody compares them. Four full sentences of perks under each price meant
  the second card's list started below the fold, so nobody did. Leon's fix, in
  his words: "make it into a collapsible too for both the biggie and beastypass
  so user scrolls the least and all shows already."

  So this measures the thing he asked for rather than the markup that
  implements it:

    - every perk on both cards is visible with nothing opened,
    - the block of plans is short enough to read without a long scroll,
    - opening one tells you more and does not open the other card's rows,
    - and an opened row is STILL open after the screen re-renders.

  That last one is Glenn's About-page glitch, which passed every audit for
  weeks because they all read aria-expanded in the same breath as the click.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { rmSync, openSync, readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const LOG = '/tmp/beasty-plans-audit.log'
try { rmSync(LOG) } catch {}
const TESTDB = await freshTestDb('plans')
const out = openSync(LOG, 'a')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: ['ignore', out, out], env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development' } })
const base = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
const bad = []
p.on('response', (r) => { const l = `${r.status()} ${r.url().replace(base, '')}`; if (r.status() >= 400 && l !== '401 /api/members/me') bad.push(l) })

const fails = []
const done = async (code) => { await b.close(); srv.kill(); await TESTDB.drop?.(); process.exit(code) }

await p.goto(base, { waitUntil: 'domcontentloaded' })
const phone = `+1510555${String(Date.now()).slice(-4)}`
const started = await p.evaluate(async (f) => (await fetch('/api/members/start', {
  method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
  body: JSON.stringify(f),
})).status, { name: 'Plan Reader', phone })
if (started !== 202) { console.log(`FAIL: sign-in start returned ${started}`); await done(1) }
const code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${phone} `)).pop()?.match(/ (\d{6}) /)?.[1]
if (!code) { console.log('FAIL: no login code was logged'); await done(1) }
await p.evaluate(async ({ phone, code }) => fetch('/api/members/verify', {
  method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
  body: JSON.stringify({ phone, code }),
}), { phone, code })

await p.goto(base, { waitUntil: 'networkidle' })
/* WAIT FOR THE DOOR, DON'T ASK IF IT IS THERE. The landing counts down before
   the button appears, and a press mid-animation cancels the animation instead
   of acting — so this waits for it, presses, and presses again if the home
   screen has not arrived. Every earlier audit learned this the same way. */
const enterBtn = p.locator('[aria-label="Enter BEASTY"]').first()
try {
  await enterBtn.waitFor({ state: 'visible', timeout: 15000 })
  await enterBtn.click()
  await p.waitForTimeout(2600)
} catch { await p.waitForTimeout(1200) }
if (await p.locator('[aria-label="Enter BEASTY"]').count()) {
  await enterBtn.click().catch(() => {})
  await p.waitForTimeout(2600)
}
const profile = p.locator('[aria-label="Profile"]').first()
await profile.click({ timeout: 15000 }).catch(() => {})
await p.waitForTimeout(1400)
const become = p.locator('text=/become a member/i').first()
await become.click({ timeout: 15000 }).catch(() => {})
await p.waitForSelector('.members-plan', { timeout: 15000 }).catch(() => {})

/*
  MEASURE IT AFTER IT HAS STOPPED MOVING.

  The app opens on a scale transform, so getBoundingClientRect during the
  animation returns the animating size, not the laid-out one. The first version
  of this audit read 158px for two whole plan cards and called two 44px rows
  35px and 39px — all three numbers were the animation, not the page. So wait
  until the measurement stops changing rather than sleeping a guessed amount.
*/
await p.waitForFunction(() => {
  const el = document.querySelector('.members-plans')
  if (!el) return false
  const h = Math.round(el.getBoundingClientRect().height)
  const stable = h > 0 && h === window.__lastH
  window.__lastH = h
  return stable
}, null, { timeout: 15000, polling: 250 }).catch(() => {})

const shape = await p.evaluate(() => {
  const plans = [...document.querySelectorAll('.members-plans .members-plan')]
  const scroller = document.querySelector('.members')?.parentElement ?? document.scrollingElement
  return {
    plans: plans.length,
    names: plans.map((c) => c.querySelector('.members-plan-name')?.textContent?.replace(/\s+/g, ' ').trim()),
    perkCounts: plans.map((c) => c.querySelectorAll('.members-perk').length),
    labels: plans.map((c) => [...c.querySelectorAll('.members-perk-label')].map((n) => n.textContent.trim())),
    /* Nothing opened: no detail may be rendered. A row that ships open is a
       row that is not a collapsible. */
    bodiesClosed: document.querySelectorAll('.members-perk-body').length,
    expandedClosed: [...document.querySelectorAll('.members-perk-head')].filter((h) => h.getAttribute('aria-expanded') === 'true').length,
    /* How tall the whole comparison is, against the phone it is read on. */
    /* offsetHeight is the laid-out height; the rect is the painted one, which
       a scale transform on an ancestor changes. This question is about layout. */
    plansHeight: document.querySelector('.members-plans')?.offsetHeight ?? 0,
    viewport: window.innerHeight,
    scrollHeight: scroller?.scrollHeight ?? 0,
  }
})
console.log('plans         :', JSON.stringify({ n: shape.plans, names: shape.names, perks: shape.perkCounts }))
console.log('labels        :', JSON.stringify(shape.labels))
console.log('closed state  :', JSON.stringify({ bodies: shape.bodiesClosed, expanded: shape.expandedClosed }))
console.log('plans block   :', shape.plansHeight + 'px in a ' + shape.viewport + 'px viewport')

/* EVERY LABEL HAS TO BE REACHABLE AND HIT-TESTABLE, not merely in the DOM.
   A row painted over by the next card is a row nobody can open. */
const rows = await p.evaluate(async () => {
  const heads = [...document.querySelectorAll('.members-perk-head')]
  const res = []
  for (const h of heads) {
    h.scrollIntoView({ block: 'center' })
    await new Promise((r) => setTimeout(r, 120))
    const r = h.getBoundingClientRect()
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    res.push({
      label: h.querySelector('.members-perk-label')?.textContent?.trim(),
      h: h.offsetHeight,
      onTop: h.contains(el) || h === el,
      wraps: h.offsetHeight > 60,
    })
  }
  return res
})
const unreachable = rows.filter((r) => !r.onTop)
const short = rows.filter((r) => r.h < 40)
const wrapping = rows.filter((r) => r.wraps)
console.log('rows          :', JSON.stringify({ n: rows.length, unreachable: unreachable.length, under40: short.length, wrapping: wrapping.length }))

/* Open the first row of the FIRST card and confirm it explains itself without
   opening anything on the second. */
await p.evaluate(() => { document.querySelector('.members-plan .members-perk-head')?.click() })
await p.waitForTimeout(250)
const opened = await p.evaluate(() => ({
  bodies: document.querySelectorAll('.members-perk-body').length,
  expanded: [...document.querySelectorAll('.members-perk-head')].filter((h) => h.getAttribute('aria-expanded') === 'true').length,
  text: document.querySelector('.members-perk-body')?.textContent?.trim() ?? null,
  onSecondCard: [...document.querySelectorAll('.members-plans .members-plan')][1]?.querySelectorAll('.members-perk-body').length ?? -1,
}))
console.log('after one tap :', JSON.stringify({ ...opened, text: (opened.text ?? '').slice(0, 48) + '…' }))

/* Two rows at once — somebody comparing the cards reads across them, so
   opening the second must not shut the first. */
await p.evaluate(() => { const h = [...document.querySelectorAll('.members-plans .members-plan')][1]?.querySelector('.members-perk-head'); h?.click() })
await p.waitForTimeout(250)
const both = await p.evaluate(() => document.querySelectorAll('.members-perk-body').length)
console.log('both cards    :', both + ' open')

/*
  AND IT STAYS OPEN. The landing screen swaps its photo every three seconds;
  that re-render is what closed the About chapters. Wait for a real re-render
  rather than a fixed sleep, so a page that never moved fails loudly instead of
  passing on a screen that was never tested.
*/
await p.evaluate(() => { window.__t0 = performance.now() })
await p.waitForTimeout(3600)
const survived = await p.evaluate(() => ({
  bodies: document.querySelectorAll('.members-perk-body').length,
  expanded: [...document.querySelectorAll('.members-perk-head')].filter((h) => h.getAttribute('aria-expanded') === 'true').length,
}))
console.log('3.6s later    :', JSON.stringify(survived))

if (shape.plans !== 2) fails.push(`${shape.plans} plan cards, expected 2`)
if (!shape.names.some((n) => /BIGGIE\s*PASS/.test(n || ''))) fails.push('BIGGIE PASS is not one of the cards')
if (!shape.names.some((n) => /BEASTY\s*PASS/.test(n || ''))) fails.push('BEASTY PASS is not one of the cards')
if (shape.perkCounts.some((c) => c === 0)) fails.push(`a card has no perk rows: ${JSON.stringify(shape.perkCounts)}`)
if (shape.bodiesClosed !== 0) fails.push(`${shape.bodiesClosed} perk details render before anything is tapped — they are not collapsed`)
if (shape.expandedClosed !== 0) fails.push('a perk row starts open')
if (shape.labels.flat().some((l) => !l || l.length > 44)) fails.push('a perk label is empty or too long to sit on one line: ' + JSON.stringify(shape.labels.flat().filter((l) => !l || l.length > 44)))
if (unreachable.length) fails.push(`${unreachable.length} perk rows are not what you hit at their own centre: ${unreachable.map((r) => r.label).join(', ')}`)
if (short.length) fails.push(`${short.length} perk rows are under 40px tall: ${short.map((r) => `${r.label} ${r.h}px`).join(', ')}`)
if (wrapping.length) fails.push(`${wrapping.length} perk labels wrap to more than two lines — shorten them: ${wrapping.map((r) => r.label).join(', ')}`)
/*
  HIS ASK WAS LESS SCROLLING, so this measures scrolling.

  Measured on the 393x852 phone: 1208px with every perk spelled out, which is
  what shipped before, against 823px folded — both cards inside one screen.
  The ceiling is a screen and a tenth, which leaves room for a longer perk or a
  bigger system font but not for the folding quietly coming undone.
*/
if (shape.plansHeight > shape.viewport * 1.1) fails.push(`the two plans are ${shape.plansHeight}px in a ${shape.viewport}px screen — they no longer fit on one, which is the whole reason the perks fold`)
if (opened.bodies !== 1) fails.push(`tapping one perk rendered ${opened.bodies} details, expected 1`)
if (opened.expanded !== 1) fails.push(`tapping one perk left ${opened.expanded} rows marked open, expected 1`)
if (opened.onSecondCard !== 0) fails.push('opening a perk on the first card opened one on the second')
if (!opened.text || opened.text.length < 40) fails.push('the opened perk shows no sentence under it')
if (both !== 2) fails.push(`opening a row on the second card left ${both} open, expected both`)
if (survived.bodies !== 2 || survived.expanded !== 2) fails.push(`a perk closed itself on re-render — ${survived.expanded} open after 3.6s, expected 2. This is the About-page glitch again: a component declared inside a render body.`)
if (bad.length) fails.push('failed requests: ' + [...new Set(bad)].join(', '))

/*
  HIS MARKUP OF 2026-09-23: "Eligible to earn money" on the BEASTY PASS card,
  and TAP HERE in it opening MAKE $ at /money ("can you create a link to the
  MAKE $ page ... when they press TAP HERE?").
*/
const earn = await p.evaluate(async () => {
  const card = [...document.querySelectorAll('.members-plans .members-plan')].find((c) => /BEASTY\s*PASS/.test(c.querySelector('.members-plan-name')?.textContent || ''))
  const head = [...(card?.querySelectorAll('.members-perk-head') ?? [])].find((h) => /Eligible to earn money/.test(h.textContent || ''))
  head?.click()
  await new Promise((r) => setTimeout(r, 250))
  const a = card?.querySelector('.members-perk-link')
  return { row: !!head, text: a?.textContent?.trim() ?? null, href: a?.getAttribute('href') ?? null }
})
console.log('earn money    :', JSON.stringify(earn))
if (!earn.row) fails.push('the BEASTY PASS card has no "Eligible to earn money" row')
if (earn.text !== 'TAP HERE' || earn.href !== '/money') fails.push(`TAP HERE should open MAKE $ at /money, found ${JSON.stringify(earn)}`)

/* His markup of 2026-09-24: the row in yellow capitals, TAP HERE yellow. */
const look = await p.evaluate(() => {
  const card = [...document.querySelectorAll('.members-plans .members-plan')].find((c) => /BEASTY\s*PASS/.test(c.querySelector('.members-plan-name')?.textContent || ''))
  const label = [...(card?.querySelectorAll('.members-perk-label') ?? [])].find((l) => /Eligible to earn money/i.test(l.textContent || ''))
  const a = card?.querySelector('.members-perk-link')
  const cs = label && getComputedStyle(label)
  return { labelColor: cs?.color, upper: cs?.textTransform, linkColor: a && getComputedStyle(a).color }
})
console.log('earn look     :', JSON.stringify(look))
if (look.labelColor !== 'rgb(246, 216, 0)' || look.upper !== 'uppercase' || look.linkColor !== 'rgb(246, 216, 0)') fails.push(`the earning row should be yellow capitals with TAP HERE yellow, found ${JSON.stringify(look)}`)

/*
  AND IT WORKS THE SECOND TIME. Glenn, 2026-09-24: "It only works the first
  time you do it". His path: TAP HERE, close MAKE $, open Members from the
  dialer (the address stays /money, marked "in the app"), TAP HERE again.
*/
const makeOpen = () => p.evaluate(() => /Make some money|MAKE \$/i.test(document.querySelector('.dialer-panel, [role="dialog"]')?.textContent || ''))
const tapEarn = async () => {
  if (!(await p.locator('.members-perk-link').first().isVisible().catch(() => false))) {
    await p.locator('.members-perk-head', { hasText: /Eligible to earn money/i }).first().click()
    await p.waitForTimeout(300)
  }
  await p.locator('.members-perk-link').first().click()
  for (let i = 0; i < 40 && !(await makeOpen().catch(() => false)); i++) await p.waitForTimeout(250)
  return makeOpen().catch(() => false)
}
const first = await tapEarn()
await p.locator('[aria-label="Close"], .dialer-panel-close').first().click({ timeout: 4000 }).catch(() => p.keyboard.press('Escape'))
await p.waitForTimeout(1000)
await p.click('[aria-label="8"]').catch(() => {})
await p.waitForTimeout(400)
await p.locator('text=MEMBERS').first().click({ timeout: 5000 }).catch(() => {})
await p.waitForSelector('.members-plan', { timeout: 15000 }).catch(() => {})
const second = await tapEarn()
console.log('tap here twice:', JSON.stringify({ first, second, url: p.url().replace(/^https?:\/\/[^/]+/, '') }))
if (!first) fails.push('TAP HERE did not open MAKE $')
if (!second) fails.push('TAP HERE opened MAKE $ once, but not the second time, from Members opened in the app')

if (fails.length) { console.log('\nFAIL: ' + fails.join('; ')); await done(1) }
console.log('\nPASS: two passes, every perk on one line, opening one explains it and it stays open.')
await done(0)
