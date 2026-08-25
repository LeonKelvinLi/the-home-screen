/*
 * Production, read-only.
 *
 * Deliberately creates NOTHING. The live database is the operator's real member
 * list, and a signed-up "test" person in it is a row he has to notice and
 * delete. So this checks what a signed-out stranger sees and what the API says
 * about itself, and stops there.
 *
 *   node tools/live-smoke.mjs [--url https://…]
 */
import { chromium } from 'playwright'
const args = process.argv.slice(2)
const i = args.indexOf('--url')
const base = i !== -1 ? args[i + 1] : 'https://the-home-screen.onrender.com'

const fails = []
const step = (n, ok, d = '') => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${n}${d ? '   ' + d : ''}`); if (!ok) fails.push(n) }

/*
  Get the keypad into its BEASTY state.

  The first press only cancels the takeover animation, and until that has run
  the keys still print a real phone's letters — so the labelled keys do not
  exist yet. But a RELOAD inside the app skips the takeover entirely (the
  entered flag seeds from history), and then the unlabelled key does not exist
  either. Either way this ends with the labelled keys present.
*/
const reveal = async (page) => {
  if (await page.$('[aria-label="0. SIGN IN"]')) return
  const raw = await page.$('[aria-label="1"]')
  if (raw) { await raw.click(); await page.waitForTimeout(3400) }
  await page.waitForSelector('[aria-label="0. SIGN IN"]', { timeout: 15000 })
}

const health = await fetch(base + '/api/health')
step('server is up', health.ok, `${health.status}`)
const me = await fetch(base + '/api/members/me')
step('members API answers signed out', me.status === 401, `${me.status}`)
const qr = await fetch(base + '/api/members/qr.svg')
step('the QR endpoint is protected', qr.status === 401, `${qr.status}`)
/* With no signing secret the webhook must not be registered at all. If this
   ever answers, an unverified endpoint is handing out paid memberships. */
const wh = await fetch(base + '/api/stripe/webhook', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
step('the webhook is absent or verifying', wh.status === 404 || wh.status === 400, `${wh.status}`)
console.log(`     (${wh.status === 404 ? 'not registered — Stripe secrets unset' : 'registered and rejecting unsigned calls'})`)

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
const bad = []
p.on('response', (r) => { const l = `${r.status()} ${r.url().replace(base, '')}`; if (r.status() >= 400 && l !== '401 /api/members/me') bad.push(l) })
p.on('pageerror', (e) => bad.push('pageerror: ' + String(e).slice(0, 100)))

await p.goto(base, { waitUntil: 'networkidle' })
await reveal(p)
step('the takeover resolves', !!(await p.$('[aria-label="0. SIGN IN"]')))

// About: his text, in chapters.
await p.click('[aria-label="1. ABOUT"]')
await p.waitForTimeout(1000)
const about = await p.evaluate(() => ({
  chapters: [...document.querySelectorAll('.panel-chapter-head')].length,
  open: [...document.querySelectorAll('.panel-chapter-head')].filter((h) => h.getAttribute('aria-expanded') === 'true').length,
  signoff: !!document.querySelector('.panel-signoff'),
}))
step('About has his chapters, closed', about.chapters === 8 && about.open === 0, `${about.chapters} chapters`)
step('About carries the sign-off', about.signoff)
await p.keyboard.press('Escape'); await p.waitForTimeout(400)

// The way in.
await p.click('[aria-label="0. SIGN IN"]')
await p.waitForTimeout(2600)
const acct = await p.evaluate(() => {
  const btns = [...document.querySelectorAll('.plain button')].map((b) => ({ t: (b.textContent || '').trim(), d: b.disabled }))
  return { btns, dead: btns.some((b) => b.d), wayIn: btns.some((b) => /Sign in or sign up/i.test(b.t) && !b.d) }
})
step('Account offers a working way in', acct.wayIn)
step('Account has no dead buttons', !acct.dead, JSON.stringify(acct.btns))

await p.evaluate(() => { const x = [...document.querySelectorAll('.plain button')].find((n) => /Sign in or sign up/i.test(n.textContent || '')); x?.click() })
await p.waitForTimeout(1400)
const form = await p.evaluate(() => ({
  onForm: !!document.querySelector('form.join'),
  fields: [...document.querySelectorAll('.join-field input')].length,
  text: document.body.innerText,
}))
step('it reaches the sign-in form', form.onForm, `${form.fields} fields`)
step('no server variable names on screen', !/RESEND_API_KEY|OTP_FROM_EMAIL|STRIPE_/.test(form.text))

// The directory a signed-out stranger can still browse.
/*
  Reloading INSIDE the app comes back inside it — the entered flag seeds from
  history so the takeover does not replay. So this asks where it landed rather
  than assuming the dial pad: there may be no keypad and no Enter button, and
  waiting for either is a timeout on a screen that is already correct.
*/
await p.goto(base, { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
if (!(await p.$('.app-icon, [data-brand]'))) {
  await reveal(p)
  await p.click('[aria-label="Enter BEASTY"]')
  await p.waitForTimeout(2800)
}
const tiles = await p.evaluate(() => document.querySelectorAll('.app-icon, [data-brand]').length)
step('the directory is open signed out', tiles > 10, `${tiles} tiles`)

await b.close()
if (bad.length) { console.log('\nfailed requests / page errors:'); for (const l of [...new Set(bad)]) console.log('  ' + l); fails.push('clean console') }
if (fails.length) { console.log(`\nFAIL: ${fails.join('; ')}`); process.exit(1) }
console.log('\nPASS: production is up, honest signed out, and nothing was created.')
