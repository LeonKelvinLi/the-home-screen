/*
  THE CRM SCREEN, IN A REAL BROWSER, ON A THROWAWAY DATABASE.

  The API audit proves the rules; this proves people can use them. It runs the
  brief's manual QA as written, through the screen:

    1  Jazz Braids, sent by Janelle: her count goes up by one
    2  handled by Leon: sent-by stays Janelle
    3  Contacted → Replied → Interested → Proposal Sent → Won, all in the history
    4  sell Website + 1 Year BEASTY, $199 + $30/month: $199 earned, $30 in
       monthly plans, $360 a year, and Janelle's numbers follow
    5  raise the price afterwards: the sold deal stays $199
    6  an overdue reminder shows first thing on To do, and in red on Home
    7  on a 393px phone: open a business, call/text, open Instagram, write a
       note, change the step, set a reminder, without fighting the UI

  plus what the BEASTY-book screen adds: "Owner" is the person who runs the
  business, a found phone moves a business on to Say hello, logging outreach
  moves it on by itself, and To do speaks plain words. And the import from
  Settings, Back returning to the same place in a list, a referral partner
  seeing only their own page, and no screen that scrolls sideways.

  Needs a current build (npm run build), like the other screen audits.

      node tools/audit-crm-ui.mjs
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, openSync, readFileSync, rmSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { freshTestDb } from './pgtest.mjs'

const TESTDB = await freshTestDb('crmui')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const LOG = `/tmp/audit-crm-ui-${port}.log`
const SHOTS = process.env.CRM_SHOTS || '/tmp/crm-ui-shots'
mkdirSync(SHOTS, { recursive: true })
try { rmSync(LOG, { force: true }) } catch {}
const out = openSync(LOG, 'a')
const TOKEN = `op_${randomBytes(20).toString('hex')}`
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['ignore', out, out],
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', ALLOW_MOCK_PAYMENTS: '1', OPERATOR_TOKEN: TOKEN, PASS_SECRET: `ps_${randomBytes(16).toString('hex')}`, RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = `http://localhost:${port}`
let up = false
for (let i = 0; i < 120; i++) { try { if ((await fetch(base + '/api/health')).ok) { up = true; break } } catch {} await new Promise((r) => setTimeout(r, 250)) }
let browser
const finish = async (code) => { try { await browser?.close() } catch {} srv.kill(); try { await TESTDB.drop?.() } catch {} process.exit(code) }
if (!up) { console.log('FAIL: server never came up'); console.log(readFileSync(LOG, 'utf8').slice(-2000)); await finish(1) }

const results = []
const check = (name, cond, detail = '') => {
  results.push(!!cond)
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}
const problems = []
const watch = (page, tag) => {
  page.on('pageerror', (e) => problems.push(`${tag} pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`${tag} console: ${m.text()}`) })
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`${tag} ${r.status()} ${r.url().replace(base, '')}`) })
}
/* The page itself must never scroll sideways; wide things (the board) scroll inside themselves. */
const sideways = (page) => page.evaluate(() => { const c = document.querySelector('.crm'); return c ? c.scrollWidth - c.clientWidth : -1 })
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` })
const go = async (page, hash, ready) => {
  await page.evaluate((h) => { window.location.hash = `#/${h}` }, hash)
  if (ready) await page.waitForSelector(ready)
}
const stat = (page, label) =>
  page.locator('.crm-stat', { has: page.locator('.crm-stat-label', { hasText: new RegExp(`^${label}$`) }) }).first().locator('.crm-stat-value').textContent()
const local = (t) => { const x = new Date(t); const z = (n) => String(n).padStart(2, '0'); return `${x.getFullYear()}-${z(x.getMonth() + 1)}-${z(x.getDate())}T${z(x.getHours())}:${z(x.getMinutes())}` }
const section = (page, title) => page.locator('.crm-section', { has: page.locator('h2', { hasText: new RegExp(`^${title}$`) }) })
/* The People card on a business: who sent it, who handles it, who made the sale. */
const sentName = async (page) => (await page.locator('.crm-sent-by .crm-person-name').first().textContent())?.trim()
const handledBy = (page) => page.locator('select[aria-label="Handled by"]')
const closedBy = (page) => page.locator('select[aria-label="Sale closed by"]')
const stageNow = (page) => page.textContent('.crm-stage-now .crm-stage')

browser = await chromium.launch()
const phone = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await phone.newPage()
watch(p, 'phone')

/* ================================================================ sign in */
await p.goto(`${base}/crm`, { waitUntil: 'networkidle' })
check('signed out, /crm asks who you are', await p.locator('.crm-signin-card').isVisible())
check('with a code to your BEASTY account first', await p.locator('.crm-signin-card button:has-text("Send me a code")').isVisible())
await p.click('button:has-text("Have the operator key?")')
const robots = await p.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute('content'))
check('the screen tells search engines to stay out', /noindex/.test(robots ?? ''))
await p.fill('input[type="password"]', 'not-the-key-not-the-key')
await p.click('button:has-text("Open the CRM")')
await p.waitForSelector('.crm-signin-card .crm-error')
check('a wrong key is refused on screen', /not right/i.test(await p.textContent('.crm-signin-card .crm-error')))
problems.length = 0 // that 401 was the point
await p.fill('input[type="password"]', TOKEN)
await p.click('button:has-text("Open the CRM")')
await p.waitForSelector('.crm-tabbar')
await p.waitForSelector('.crm-home-head h1')
check('the key opens the CRM on Home, as Glenn', /Glenn/.test(await p.textContent('.crm-home-head h1')))
/* The phone has four tabs; the rest is in the menu behind Glenn's face. */
const nav = async (page, name) => {
  if (await page.locator(`.crm-tabbar a:has-text("${name}")`).count()) return page.click(`.crm-tabbar a:has-text("${name}")`)
  await page.click('.crm-account-btn')
  await page.click(`.crm-menu a:has-text("${name}")`)
}

/* ============================================================ the import */
await nav(p, 'Settings')
await p.click('button:has-text("Preview")')
await p.waitForSelector('text=Preview: nothing has been written')
const wouldCreate = Number(await p.locator('.crm-report .crm-stat:has-text("Would create") .crm-stat-value').textContent())
check('the import preview lists what it would create', wouldCreate > 40, `${wouldCreate} businesses`)
p.once('dialog', (dlg) => dlg.accept())
await p.click('button:has-text("Run the import")')
await p.waitForSelector('text=/Done: run/')
const created = Number(await p.locator('.crm-report .crm-stat:has-text("Created") .crm-stat-value').textContent())
check('running it creates exactly what the preview said', created === wouldCreate)
check('settings fit the phone', (await sideways(p)) <= 1)

/* ============================================ To do speaks plain words */
await nav(p, 'To do')
await p.waitForSelector('.crm-today .crm-group')
const todayText = await p.textContent('.crm-view')
check('To do names what to do, not CRM jargon', !/\b(MRR|ARR|pipeline|leads?|referr(al|er)s?|conversion)\b/i.test(todayText), (todayText.match(/\b(MRR|ARR|pipeline|leads?|referr(al|er)s?|conversion)\b/gi) ?? []).join(', '))
check('and every business on it comes with the button to reach it', (await p.locator('.crm-today .crm-row .crm-pill-act').count()) >= 5)
await shot(p, 'm-today')

/* ================================ Home: numbers first, every one scoped */
{
  // One real person signs up on BEASTY, in a browser of their own.
  const uctx = await browser.newContext()
  const up = await uctx.newPage()
  await up.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
  const uEmail = `uma-${port}@audit.beastypages.dev`
  await up.evaluate(async (e) => fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Uma User', email: e, attribution: { utm_source: 'instagram', utm_medium: 'social', landing: '/' } }) }), uEmail)
  let ucode
  for (let i = 0; i < 20 && !ucode; i++) {
    await new Promise((r) => setTimeout(r, 250))
    ucode = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${uEmail} `)).pop()?.match(/ (\d{6}) /)?.[1]
  }
  const uv = await up.evaluate(async ({ e, c }) => (await fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: e, code: c }) })).status, { e: uEmail, c: ucode })
  check('a person signs up on BEASTY', uv < 300, `verify ${uv}`)
  await uctx.close()

  await nav(p, 'Home')
  await p.waitForSelector('.crm-kpi-row .crm-tile-stat')
  const tile = (label) => p.locator('.crm-tile-stat', { has: p.locator('.crm-tile-stat-label', { hasText: new RegExp(`^${label}$`) }) }).first()
  check('the first number on Home is how many users BEASTY has, marked all time', (await p.locator('.crm-tile-stat').first().locator('.crm-tile-stat-label').textContent()) === 'Users' && (await tile('Users').locator('.crm-tile-stat-value').textContent()) === '1' && (await tile('Users').locator('.crm-tile-stat-scope').textContent()) === 'All time')
  check('users and leads are separate numbers', (await tile('Leads').locator('.crm-tile-stat-value').textContent()) !== '1' && /businesses/.test(await tile('Leads').textContent()))
  check('new sign-ups say which days they count', (await tile('New sign-ups').locator('.crm-tile-stat-scope').textContent()) === 'Last 30 days' && (await tile('New sign-ups').locator('.crm-tile-stat-value').textContent()) === '1')
  check('and what they are compared with', /vs 0 in the 30 days before/.test(await tile('New sign-ups').textContent()))
  check('the period bar names its exact days and the stretch it is compared with', /Last 30 days/.test(await p.textContent('.crm-period-says')) && /compared with/.test(await p.textContent('.crm-period-says')))
  check('active users are counted from when tracking began, and say so', /since tracking began/.test(await tile('Active users').textContent()))
  check('Home fits the phone', (await sideways(p)) <= 1)
  await shot(p, 'm-home')
  await p.click('.crm-period-pick button[aria-label="7 days"]')
  await p.waitForFunction(() => /Last 7 days/.test(document.querySelector('.crm-period-says')?.textContent ?? ''))
  check('picking 7 days rescopes every period number', (await tile('New sign-ups').locator('.crm-tile-stat-scope').textContent()) === 'Last 7 days' && /the 7 days before/.test(await tile('New sign-ups').textContent()))
  check('but not the totals', (await tile('Users').locator('.crm-tile-stat-scope').textContent()) === 'All time')
  await p.click('.crm-period-pick button[aria-label="Custom"]')
  await p.waitForSelector('.crm-custom-range')
  const today = await p.evaluate(() => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }))
  await p.fill('.crm-custom-range input >> nth=0', '2026-01-01')
  await p.fill('.crm-custom-range input >> nth=1', today)
  await p.click('.crm-custom-range button:has-text("Show")')
  const shown = await p.waitForFunction(() => /Custom dates\s*Jan 1 – /.test(document.querySelector('.crm-period-says')?.textContent ?? ''), null, { timeout: 8000 }).then(() => true, () => false)
  check('a custom range shows its own dates', shown, await p.textContent('.crm-period-says'))
  await p.click('.crm-period-pick button[aria-label="30 days"]')
  await p.waitForFunction(() => /Last 30 days/.test(document.querySelector('.crm-period-says')?.textContent ?? ''))
  const card = p.locator('.crm-card-chart', { has: p.locator('h3', { hasText: /^New sign-ups$/ }) })
  await card.locator('.crm-chart-switch').click()
  check('every chart has a table behind it', (await card.locator('table.crm-chart-table tbody tr').count()) === 30)
  await card.locator('.crm-chart-switch').click()
  check('sign-up cohorts are there, with week 0 as the sign-up itself', await p.locator('.crm-cohort-table td.is-cell').first().textContent().then((x) => x === '100%', () => false))
  check('the admin sees who signed up, and from where', await p.locator('.crm-people td', { hasText: 'Uma User' }).count().then((n) => n === 1) && /Social media/.test(await p.textContent('.crm-signups')))
  await p.click('.crm-jump button:has-text("Leads and money")')
  await p.waitForTimeout(600)
  check('the jump buttons reach the leads', await p.locator('#leads-h').isVisible())
  check('Home still fits the phone', (await sideways(p)) <= 1)
}

/* ================================================ manual QA 1-6, desktop */
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: await phone.storageState() })
const d = await desk.newPage()
watch(d, 'desktop')
await d.goto(`${base}/crm#/referrer/p_janelle`, { waitUntil: 'networkidle' })
check('the session carries to a desktop browser, with the top bar', await d.locator('.crm-tabs-top').isVisible())
await d.waitForSelector('.crm-stat')
const janelleBefore = Number(await stat(d, 'Businesses sent'))

/* Jazz Braids, found the way a person would: ⌘K, then its name. */
await d.keyboard.press('Meta+k')
check('⌘K opens the search', await d.waitForSelector('.crm-palette .crm-search input').then(() => true, () => false))
await d.fill('.crm-search input', 'Jazz Braids')
await d.waitForSelector('.crm-search-results button:has-text("Jazz Braids")')
await d.click('.crm-search-results button:has-text("Jazz Braids")')
await d.waitForSelector('.crm-lead-head h1:has-text("Jazz Braids")')
check('search opens Jazz Braids beside the list', await d.waitForSelector('.crm-split-list .crm-leads').then(() => true, () => false))
const jazzId = await d.evaluate(() => window.location.hash.split('/')[2])

check('before anyone says otherwise, Jazz Braids was sent by Glenn, from BEASTY\'s own list', (await sentName(d)) === 'Glenn' && (await d.locator('.crm-sent-by .crm-default').count()) === 1)
check('and is handled by Glenn', (await handledBy(d).inputValue()) === 'p_glenn')

/* "Owner" is the person who runs the business, not anyone at BEASTY. */
await d.click('.crm-prop-owner button:has-text("Add the owner\'s name")')
await d.fill('input[aria-label="Owner\'s name"]', 'Dana Owner')
await d.click('.crm-prop-owner button:has-text("Save")')
await d.waitForSelector('.crm-lead-head p:has-text("Owner: Dana Owner")')
check('the owner is the person who runs the business, shown under its name', true)
check('and writing it down changes nobody at BEASTY', (await handledBy(d).inputValue()) === 'p_glenn' && (await sentName(d)) === 'Glenn')

// TEST 1
await d.click('.crm-sent-by button:has-text("Set")')
await d.locator('.crm-sent-by select').first().selectOption('p_janelle')
await d.click('.crm-sent-by button:has-text("Save")')
await d.waitForSelector('.crm-sent-by .crm-person-name:has-text("Janelle")')
await go(d, 'referrer/p_janelle', '.crm-stat')
const janelleAfter = Number(await stat(d, 'Businesses sent'))
check('TEST 1: Janelle is credited and her count goes up by one', janelleAfter === janelleBefore + 1, `${janelleBefore} → ${janelleAfter}`)

// TEST 2
await go(d, `lead/${jazzId}`, '.crm-lead-head')
await Promise.all([
  d.waitForResponse((r) => r.request().method() === 'PATCH' && r.url().includes(`/api/crm/leads/${jazzId}`)),
  handledBy(d).selectOption('p_leon'),
])
await d.reload({ waitUntil: 'networkidle' })
await d.waitForSelector('.crm-lead-head')
check('TEST 2: Leon handles it', (await handledBy(d).inputValue()) === 'p_leon')
check('TEST 2: and it is still sent by Janelle', (await sentName(d)) === 'Janelle')

// TEST 3
await d.click('.crm-change-step summary')
for (const [key, label] of [['contacted', 'Waiting to hear back'], ['replied', 'They replied'], ['interested', 'Interested'], ['proposal_sent', 'Quote sent']]) {
  await d.selectOption('select[aria-label="Move to stage"]', key)
  await d.click('.crm-stage-pick button:has-text("Move")')
  await d.waitForFunction((l) => document.querySelector('.crm-stage-now .crm-stage')?.textContent === l, label)
}
check('TEST 3: moved to Quote sent one step at a time', (await stageNow(d)) === 'Quote sent')
check('and the step track shows step 4 of 5', (await d.getAttribute('.crm-lead-head .crm-steps', 'aria-label')) === 'Step 4 of 5: Quote')

// TEST 4
await d.click('button:has-text("Add a quote")')
await d.click('.crm-offer:has-text("1 Year BEASTY")')
check('TEST 4: the $199 package quotes at $199 + $30/mo', (await d.inputValue('.crm-deal-form input >> nth=0')) === '199' && (await d.inputValue('.crm-deal-form input >> nth=1')) === '30')
await d.click('button:has-text("Save quote")')
await d.waitForSelector('.crm-deal .crm-deal-status.is-open')
await d.click('button:has-text("Mark as sold")')
await d.selectOption('.crm-inline-form select', 'p_glenn')
await d.click('button:has-text("Confirm the sale")')
await d.waitForSelector('.crm-deal .crm-deal-status.is-won')
const dealText = await d.textContent('.crm-deal')
check('TEST 4: sold at $199 + $30/mo', /Sold for \$199/.test(dealText) && /\$30\/mo active/.test(dealText), dealText.replace(/\s+/g, ' ').slice(0, 90))
check('TEST 3: the sale moves it to Said yes', (await stageNow(d)) === 'Said yes')
check('and its tile glows like a paid BEASTY tile', (await d.locator('.crm-lead-head .crm-tile.is-customer').count()) === 1)
const hist = await d.$$eval('.crm-lead-history tr td:first-child', (tds) => tds.map((t) => t.textContent))
const tos = hist.map((h) => h.split('→').pop().replace('Started at', '').trim())
check('TEST 3: every move is in the history', JSON.stringify(tos.slice(1)) === JSON.stringify(['Waiting to hear back', 'They replied', 'Interested', 'Quote sent', 'Said yes']), hist.join(' | '))
check('sent by, handled by and made the sale are three different people', (await sentName(d)) === 'Janelle' && (await handledBy(d).inputValue()) === 'p_leon' && (await closedBy(d).inputValue()) === 'p_glenn')
await shot(d, 'd-jazz-won')
await go(d, 'revenue', '.crm-stat')
check('TEST 4: $199 earned', (await stat(d, 'Earned')) === '$199')
check('TEST 4: $30 in monthly plans', (await stat(d, 'Monthly plans')) === '$30')
check('TEST 4: $360 a year', (await stat(d, 'A year of plans')) === '$360')
check('TEST 4: credited to Janelle and sold by Glenn', /Janelle[\s\S]*\$199/.test(await section(d, 'Who sent them').textContent()) && /Glenn/.test(await section(d, 'Who made the sale').textContent()))
await go(d, 'referrer/p_janelle', '.crm-stat')
check("TEST 4: Janelle's numbers follow the sale", (await stat(d, 'Customers')) === '1' && (await stat(d, 'Earned')) === '$199' && (await stat(d, 'Monthly plans')) === '$30')
check('and her funnel counts Jazz Braids at every step', (await d.$$eval('.crm-funnel-n', (n) => n.map((x) => x.textContent))).every((v) => v === '1'))

// TEST 5
await go(d, 'settings', '.crm-section')
await d.locator('.crm-row', { hasText: 'Website Build + 1 Year BEASTY Program' }).locator('button:has-text("Edit")').click()
await d.getByLabel('One-time ($)').fill('249')
await d.click('.crm-row.is-form button:has-text("Save")')
await d.waitForSelector('.crm-row:has-text("Website Build + 1 Year BEASTY Program"):has-text("$249")')
check('TEST 5: the price is now $249', true)
await go(d, 'revenue', '.crm-stat')
check('TEST 5: Money still counts the $199 that was paid', (await stat(d, 'Earned')) === '$199')
await go(d, `lead/${jazzId}`, '.crm-deal')
const after5 = await d.textContent('.crm-deal')
check('TEST 5: and the sale itself still says $199', /Sold for \$199/.test(after5) && !/249/.test(after5))

// TEST 6
await d.fill('.crm-fu-form input[type="datetime-local"]', local(Date.now() - 26 * 3600e3))
await d.fill('.crm-fu-form input[placeholder^="e.g."]', 'Send the onboarding form')
await d.click('button:has-text("Set reminder")')
await d.waitForSelector('.crm-reminders .crm-row.is-late')
await go(d, 'today', '.crm-today')
const first = d.locator('.crm-due-now .crm-row.is-late', { has: d.locator(`a[href="#/lead/${jazzId}"]`) })
const firstOk = await first.waitFor().then(() => true, () => false)
check('TEST 6: the late reminder is the first thing on To do', firstOk && /Send the onboarding form/.test(await first.textContent()))
check('and To do says it is late', /late/.test(await d.textContent('.crm-title p')))
await first.locator(`a[href="#/lead/${jazzId}"]`).click()
await d.waitForSelector('.crm-lead-head h1:has-text("Jazz Braids")')
check('TEST 6: and one tap opens it', true)
await go(d, 'today', '.crm-today')
await shot(d, 'd-overdue')
await go(d, 'overview', '.crm-needs-row')
check('Home counts the late reminder in red', await d.locator('.crm-needs-row a.is-late b').textContent().then((x) => Number(x) >= 1, () => false))

/* ======================================== a phone the team found */
const lost = await p.evaluate(async () => (await (await fetch('/api/crm/leads?stage=need_contact_info&limit=1&sort=name', { credentials: 'same-origin' })).json()).leads[0])
await go(p, `lead/${lost.id}?info=1`, '.crm-found')
check('a business with no way to reach it asks for one', /find their phone or Instagram/i.test(await p.textContent('.crm-next-card h2')))
await p.fill('.crm-found input[type="tel"]', '(510) 555-0199')
await p.click('.crm-found button:has-text("Save")')
await p.waitForFunction(() => document.querySelector('.crm-stage-now .crm-stage')?.textContent === 'Ready to say hello')
check('saving a found phone moves it on to Say hello', true)
check('and it can be called straight away', (await p.getAttribute('.crm-reach a.crm-act-call', 'href')) === 'tel:+15105550199')

/* ======================================================== TEST 7, phone */
const target = await p.evaluate(async () => {
  const r = await fetch('/api/crm/leads?hasPhone=1&hasInstagram=1&stage=ready_to_contact&limit=1&sort=name', { credentials: 'same-origin' })
  return (await r.json()).leads[0]
})
check('there is a business with a phone and Instagram to work', !!target, target?.name)

await nav(p, 'Businesses')
await p.waitForSelector('.crm-leads')
check('the business list fits the phone', (await sideways(p)) <= 1)
await shot(p, 'm-leads')
/* Back from a business returns to the same place in the list, not the top. */
await p.evaluate(() => { document.querySelector('.crm').scrollTop = 1400 })
await p.waitForTimeout(400)
const mid = await p.evaluate(() => [...document.querySelectorAll('.crm-leads a[href^="#/lead/"]')].find((a) => a.getBoundingClientRect().top > 200)?.getAttribute('href'))
await p.click(`.crm-leads a[href="${mid}"]`)
await p.waitForSelector('.crm-lead-head')
check('a new page opens at the top', (await p.evaluate(() => document.querySelector('.crm').scrollTop)) === 0)
await p.click('.crm-back')
await p.waitForSelector('.crm-leads')
const restored = await p.waitForFunction(() => Math.abs(document.querySelector('.crm').scrollTop - 1400) < 3, null, { timeout: 3000 }).then(() => true, () => false)
check('Back returns to the same place in the list', restored, String(await p.evaluate(() => document.querySelector('.crm').scrollTop)))

await p.fill('input[aria-label="Search businesses"]', target.name)
await p.press('input[aria-label="Search businesses"]', 'Enter')
await p.waitForSelector(`a[href="#/lead/${target.id}"]`)
await p.click(`a[href="#/lead/${target.id}"]`)
await p.waitForSelector('.crm-lead-head')
check('TEST 7: open a business', (await p.textContent('.crm-lead-head h1'))?.trim() === target.name, target.name)
await shot(p, 'm-lead-top')
check('the business page fits the phone', (await sideways(p)) <= 1)

const call = p.locator('.crm-reach a.crm-act-call')
const text = p.locator('.crm-reach a.crm-act-text')
const ig = p.locator('.crm-reach a.crm-act-ig')
check('TEST 7: Call is a real tel: link', /^tel:\+1\d{10}$/.test((await call.getAttribute('href')) ?? ''), await call.getAttribute('href'))
check('TEST 7: Text is a real sms: link', /^sms:\+1\d{10}$/.test((await text.getAttribute('href')) ?? ''))
check('TEST 7: Instagram opens their profile in a new tab', /^https:\/\/www\.instagram\.com\/[\w.]+\/$/.test((await ig.getAttribute('href')) ?? '') && (await ig.getAttribute('target')) === '_blank')
const sizes = await p.$$eval('.crm-reach a.crm-act', (as) => as.map((a) => Math.round(a.getBoundingClientRect().height)))
check('every contact button is thumb-sized', sizes.length >= 3 && sizes.every((h) => h >= 44), sizes.join(', '))
/* Keep the test on this page: the links are proven above, the taps below only need their click handlers. */
await p.evaluate(() => document.addEventListener('click', (e) => { if (e.target.closest?.('a[href^="tel:"],a[href^="sms:"],a[href^="mailto:"],a[href*="instagram.com"]')) e.preventDefault() }, true))

const ready = (label) =>
  p.waitForFunction((l) => [...document.querySelectorAll('.crm-kinds button')].find((b) => b.textContent === l)?.getAttribute('aria-checked') === 'true', label, { timeout: 3000 }).then(() => true, () => false)
const topType = () => p.locator('.crm-timeline .crm-tl:not(.is-system) .crm-tl-type').first().textContent()
await text.tap()
check('tapping Text gets a Text ready to write down', await ready('Text'))
await p.fill('textarea[aria-label="Activity details"]', 'Texted about the $149 website build')
await p.click('.crm-log button[type="submit"]')
await p.waitForSelector('.crm-ok')
check('TEST 7: the text goes in the story as a text', (await topType()) === 'Text', await topType())
await p.waitForFunction(() => document.querySelector('.crm-stage-now .crm-stage')?.textContent === 'Waiting to hear back')
check('and reaching out moved it on by itself', /moved to Waiting to hear back/.test(await p.textContent('.crm-ok')))

await ig.tap()
check('tapping Instagram gets a DM ready to write down', await ready('Instagram DM'))
await p.fill('textarea[aria-label="Activity details"]', 'Sent a DM with the demo link')
await p.click('.crm-log button[type="submit"]')
await p.waitForFunction(() => /demo link/.test(document.querySelector('.crm-timeline .crm-tl:not(.is-system)')?.textContent ?? ''))
check('TEST 7: the DM goes in as an Instagram DM', (await topType()) === 'Instagram DM', await topType())

await p.click('.crm-kinds button:has-text("Note")')
check('an empty note cannot be saved', await p.locator('.crm-log button[type="submit"]').isDisabled())
await p.fill('textarea[aria-label="Activity details"]', 'Owner prefers texts after 3pm')
await p.click('.crm-log button[type="submit"]')
await p.waitForFunction(() => /after 3pm/.test(document.querySelector('.crm-timeline .crm-tl:not(.is-system)')?.textContent ?? ''))
check('TEST 7: write a note', (await topType()) === 'Note')
check('the top of the page shows the latest thing that happened', /Note/.test(await p.textContent('.crm-last')))

await p.click('.crm-next-acts button:has-text("They replied")')
await p.waitForFunction(() => document.querySelector('.crm-stage-now .crm-stage')?.textContent === 'They replied')
check('TEST 7: change the step in one tap', true)
check('both moves are in the history', (await p.locator('.crm-lead-history tr').count()) === 3)

await p.click('.crm-fu-form button:has-text("Tomorrow 10am")')
await p.click('button:has-text("Set reminder")')
const nextStep = p.locator('.crm-reminders .crm-row').first()
await nextStep.waitFor()
const fu = await nextStep.textContent()
check('TEST 7: set a reminder for tomorrow', /Call tomorrow/.test(fu), fu.replace(/\s+/g, ' ').slice(0, 60))
await shot(p, 'm-lead-worked')

/* A second sale, on the phone this time: the $149 build. */
await p.click('button:has-text("Add a quote")')
await p.locator('.crm-offer', { has: p.locator('strong', { hasText: /^Website Build$/ }) }).click()
check('picking a price fills it in', (await p.inputValue('.crm-deal-form input >> nth=0')) === '149')
await p.click('button:has-text("Save quote")')
await p.waitForSelector('.crm-deal .crm-deal-status.is-open')
await p.click('button:has-text("Mark as sold")')
await p.click('button:has-text("Confirm the sale")')
await p.waitForSelector('.crm-deal .crm-deal-status.is-won')
check('the sale is made on the phone', /Sold for \$149/.test(await p.textContent('.crm-deal')))
await p.click('.crm-sent-by button:has-text("Set")')
await p.locator('.crm-sent-by select').first().selectOption('p_janelle')
await p.click('.crm-sent-by button:has-text("Save")')
await p.waitForSelector('.crm-sent-by .crm-person-name:has-text("Janelle")')
check('and credited to Janelle', true)
check('after all that the page still fits the phone', (await sideways(p)) <= 1)

await p.click('.crm-back')
await nav(p, 'Money')
await p.waitForSelector('.crm-stat')
check('Money adds the $149 to the $199', (await stat(p, 'Earned')) === '$348' && (await stat(p, 'Monthly plans')) === '$60' && (await stat(p, 'A year of plans')) === '$720')
await nav(p, 'People')
await p.waitForSelector('.crm-people a:has-text("Janelle")')
await p.click('.crm-people a:has-text("Janelle")')
await p.waitForSelector('.crm-qr img')
await p.waitForFunction(() => { const i = document.querySelector('.crm-qr img'); return i && i.complete && i.naturalWidth > 0 })
check("Janelle's page shows her link and a QR code that loads", /\/r\/janelle/.test(await p.textContent('.crm-reflink code')))
check('and both businesses she sent', (await p.locator(`a[href="#/lead/${target.id}"]`).count()) === 1 && (await p.locator(`a[href="#/lead/${jazzId}"]`).count()) === 1)

for (const [hash, name] of [['overview', 'Glenn'], ['today', 'To do'], ['pipeline', 'Board'], ['businesses', 'Grouped businesses'], ['followups?view=upcoming', 'Reminders'], ['revenue', 'Money'], ['analytics', "How it's going"], ['referrers', 'People']]) {
  await go(p, hash, `h1:has-text("${name}")`)
  await p.waitForTimeout(400)
  check(`${name} fits the phone`, (await sideways(p)) <= 1)
  await shot(p, `m-${hash.split('?')[0]}`)
}
await go(p, 'followups?view=upcoming', '.crm-seg button.is-on:has-text("Coming up")')
check('the phone reminder waits under Coming up', await p.waitForSelector(`.crm-row:has(a[href="#/lead/${target.id}"])`).then(() => true, () => false))

/* ============================================ a referral partner's view */
const partner = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true })
const pp = await partner.newPage()
watch(pp, 'partner')
await pp.goto(`${base}/crm`, { waitUntil: 'networkidle' })
const email = `pat-${port}@example.invalid`
const started = await pp.evaluate(async (e) => (await fetch('/api/members/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Pat Partner', email: e }) })).status, email)
let code
for (let i = 0; i < 20 && !code; i++) {
  await new Promise((r) => setTimeout(r, 250))
  code = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).pop()?.match(/ (\d{6}) /)?.[1]
}
const verified = await pp.evaluate(async ({ e, c }) => (await fetch('/api/members/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: e, code: c }) })).status, { e: email, c: code })
check('a partner signs in to BEASTY the usual way', started < 300 && verified < 300, `${started}, ${verified}`)
await pp.reload({ waitUntil: 'networkidle' })
check('with no CRM role yet, /crm says so', /no CRM role yet/.test(await pp.textContent('.crm-signin-card')))
/* The CRM's own card: a code to the account they have, on a phone that has
   never signed in, which is how it works where the CRM has its own address. */
{
  const cardCtx = await browser.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true })
  const cp = await cardCtx.newPage()
  watch(cp, 'card')
  await cp.goto(`${base}/crm`, { waitUntil: 'networkidle' })
  const codesBefore = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `)).length
  await cp.fill('.crm-signin-card input[type="email"]', email)
  await cp.click('button:has-text("Send me a code")')
  await cp.waitForSelector('.crm-signin-card >> text=code is on its way')
  let cardCode
  for (let i = 0; i < 20 && !cardCode; i++) {
    await new Promise((r) => setTimeout(r, 250))
    const lines = readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes(`[login-code] ${email} `))
    if (lines.length > codesBefore) cardCode = lines.pop()?.match(/ (\d{6}) /)?.[1]
  }
  await cp.fill('.crm-signin-card input[autocomplete="one-time-code"]', cardCode ?? '')
  await cp.click('.crm-signin-card button:has-text("Sign in")')
  const inByCard = await cp.waitForSelector('.crm-signin-card >> text=no CRM role yet', { timeout: 10000 }).then(() => true, () => false)
  check('the card signs a member in with a code sent to their account', !!cardCode && inByCard)
  await cardCtx.close()
}
const pid = await d.evaluate(async (e) => {
  const r = await fetch('/api/crm/people', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Pat Partner', slug: 'pat', sourceType: 'influencer', role: 'partner', memberEmail: e }) })
  return (await r.json()).id
}, email)
const shaka = await d.evaluate(async () => (await (await fetch('/api/crm/leads?q=shaka%20shack&limit=1')).json()).leads[0].id)
await d.evaluate(async ({ id, who }) => fetch(`/api/crm/leads/${id}/referral`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ referrerId: who }) }), { id: shaka, who: pid })
await pp.reload({ waitUntil: 'networkidle' })
await pp.waitForSelector('h1:has-text("Hi Pat")')
check('linked as a partner, they see their own page', true)
check('with no way into the businesses', (await pp.locator('.crm-tabbar a, .crm-tabs-top a').count()) === 0)
const qrOk = await pp.waitForFunction(() => { const i = document.querySelector('.crm-qr img'); return i && i.complete && i.naturalWidth > 0 }).then(() => true, () => false)
check('their link and a QR code that loads', /\/r\/pat$/.test((await pp.textContent('.crm-reflink code')).trim()) && qrOk)
const theirs = await pp.textContent('.crm-list')
check('and the business they sent, with only its name, city and status', /Shaka Shack/.test(theirs) && /In progress/.test(theirs) && !/\d{3}\)?[ -]?\d{3}-?\d{4}|@/.test(theirs))
check("the partner's page fits the phone", (await sideways(pp)) <= 1)
await shot(pp, 'm-partner')

/* ========================================================== desktop sweep */
for (const hash of ['overview', 'today', 'leads', `lead/${jazzId}`, 'pipeline', 'businesses', 'referrers', 'followups?view=overdue', 'revenue', 'analytics', 'settings']) {
  await go(d, hash)
  await d.waitForTimeout(700)
  const name = hash.split(/[/?]/)[0]
  check(`desktop ${name} has no sideways scroll`, (await sideways(d)) <= 1)
  await shot(d, `d-${name}`)
}

check('no errors and no failed requests along the way', problems.length === 0, problems.slice(0, 6).join(' | '))

const failed = results.filter((x) => !x).length
console.log(`\n${results.length - failed}/${results.length} checks passed; screenshots in ${SHOTS}`)
if (failed) { console.log('FAIL'); console.log(readFileSync(LOG, 'utf8').split('\n').filter((l) => /error|Error/.test(l)).slice(-10).join('\n')); await finish(1) }
console.log('\nPASS: manual QA 1-7 hold on screen, the BEASTY book works on a phone, the partner view is private, and nothing scrolls sideways.')
await finish(0)
