/*
  THE CRM SCREEN, IN A REAL BROWSER, ON A THROWAWAY DATABASE.

  The API audit proves the rules; this proves people can use them. It runs the
  brief's manual QA as written, through the screen:

    1  Jazz Braids, referrer = Janelle: her count goes up by one
    2  salesperson = Leon: referred-by stays Janelle
    3  Contacted → Replied → Interested → Proposal Sent → Won, all in the history
    4  sell Website + 1 Year BEASTY, $199 + $30/month: $199 one-time, $30 MRR,
       $360 ARR, and Janelle's numbers follow
    5  raise the offer's price afterwards: the sold deal stays $199
    6  an overdue follow-up shows under Needs Attention
    7  on a 393px phone: open a lead, call/text, open Instagram, write a note,
       change the stage, schedule a follow-up, without fighting the UI

  plus the import from Settings, Back returning to the same place in a list, a
  referral partner seeing only their own page, and no screen that scrolls
  sideways at phone or desktop width.

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
/* The page itself must never scroll sideways; wide things (the board, a table) scroll inside themselves. */
const sideways = (page) => page.evaluate(() => { const c = document.querySelector('.crm'); return c ? c.scrollWidth - c.clientWidth : -1 })
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` })
const go = async (page, hash, ready) => {
  await page.evaluate((h) => { window.location.hash = `#/${h}` }, hash)
  if (ready) await page.waitForSelector(ready)
}
const stat = (page, label) =>
  page.locator('.crm-stat', { has: page.locator('.crm-stat-label', { hasText: new RegExp(`^${label}$`) }) }).locator('.crm-stat-value').textContent()
const local = (t) => { const x = new Date(t); const z = (n) => String(n).padStart(2, '0'); return `${x.getFullYear()}-${z(x.getMonth() + 1)}-${z(x.getDate())}T${z(x.getHours())}:${z(x.getMinutes())}` }
/* A person chip is an avatar (initials or their tile) and a name: read the name. */
const chipName = (loc) => loc.locator('.crm-person > span:not(.crm-avatar)').first().textContent()
const section = (page, title) => page.locator('.crm-section', { has: page.locator('h2', { hasText: new RegExp(`^${title}$`) }) })

browser = await chromium.launch()
const phone = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await phone.newPage()
watch(p, 'phone')

/* ================================================================ sign in */
await p.goto(`${base}/crm`, { waitUntil: 'networkidle' })
check('signed out, /crm asks for a key', await p.locator('.crm-signin-card').isVisible())
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
check('the key opens the CRM, as Glenn', await p.waitForSelector('h1:has-text("Glenn")').then(() => true, () => false))
/* The phone gets a bottom tab bar and a More sheet instead of the sidebar. */
const tab = async (page, name) => {
  if (await page.locator(`.crm-tabbar a:has-text("${name}")`).count()) return page.click(`.crm-tabbar a:has-text("${name}")`)
  await page.click('.crm-tabbar button:has-text("More")')
  await page.click(`.crm-more-grid a:has-text("${name}")`)
}

/* ============================================================ the import */
await tab(p, 'Settings')
await p.click('button:has-text("Preview")')
await p.waitForSelector('text=Preview: nothing has been written')
const wouldCreate = Number(await p.locator('.crm-report .crm-stat:has-text("Would create") .crm-stat-value').textContent())
check('the import preview lists what it would create', wouldCreate > 40, `${wouldCreate} leads`)
p.once('dialog', (dlg) => dlg.accept())
await p.click('button:has-text("Run the import")')
await p.waitForSelector('text=/Done: run/')
const created = Number(await p.locator('.crm-report .crm-stat:has-text("Created") .crm-stat-value').textContent())
check('running it creates exactly what the preview said', created === wouldCreate)
check('settings fit the phone', (await sideways(p)) <= 1)

/* ================================================ manual QA 1-6, desktop */
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: await phone.storageState() })
const d = await desk.newPage()
watch(d, 'desktop')
await d.goto(`${base}/crm#/referrer/p_janelle`, { waitUntil: 'networkidle' })
check('the session carries to a desktop browser', await d.locator('.crm-nav').isVisible())
await d.waitForSelector('.crm-stat')
const janelleBefore = Number(await stat(d, 'Businesses referred'))

/* Jazz Braids, found the way a person would: ⌘K, then its name. */
await d.keyboard.press('Meta+k')
check('⌘K opens the search palette', await d.waitForSelector('.crm-palette .crm-search input').then(() => true, () => false))
await d.fill('.crm-search input', 'Jazz Braids')
await d.waitForSelector('.crm-search-results button:has-text("Jazz Braids")')
await d.click('.crm-search-results button:has-text("Jazz Braids")')
await d.waitForSelector('.crm-lead-head h1:has-text("Jazz Braids")')
check('global search opens Jazz Braids', true)
const jazzId = await d.evaluate(() => window.location.hash.split('/')[2])
const where = section(d, 'Where it came from')
const who = section(d, 'Who works it')

check('before anyone says otherwise, Jazz Braids is referred by Glenn by default', (await chipName(where.locator('dd a').first())) === 'Glenn' && (await where.locator('.crm-default').count()) === 1)
check('and owned by Glenn', (await who.locator('select').first().inputValue()) === 'p_glenn')
// TEST 1
await where.locator('button:has-text("Set")').click()
await where.locator('select').first().selectOption('p_janelle')
await where.locator('button:has-text("Save")').click()
await where.locator('dd a:has-text("Janelle")').waitFor()
await go(d, 'referrer/p_janelle', '.crm-stat')
const janelleAfter = Number(await stat(d, 'Businesses referred'))
check('TEST 1: Janelle is credited and her dashboard goes up by one', janelleAfter === janelleBefore + 1, `${janelleBefore} → ${janelleAfter}`)

// TEST 2
await go(d, `lead/${jazzId}`, '.crm-lead-head')
await Promise.all([
  d.waitForResponse((r) => r.request().method() === 'PATCH' && r.url().includes(`/api/crm/leads/${jazzId}`)),
  who.locator('select').first().selectOption('p_leon'),
])
await d.reload({ waitUntil: 'networkidle' })
await d.waitForSelector('.crm-lead-head')
check('TEST 2: Leon is the salesperson', (await who.locator('select').first().inputValue()) === 'p_leon')
check('TEST 2: and referred-by is still Janelle', (await chipName(where.locator('dd a').first())) === 'Janelle')

// TEST 3
for (const [key, label] of [['contacted', 'Contacted'], ['replied', 'Replied'], ['interested', 'Interested'], ['proposal_sent', 'Proposal sent']]) {
  await d.selectOption('select[aria-label="Move to stage"]', key)
  await d.click('.crm-stage-pick button:has-text("Move")')
  await d.waitForFunction((l) => document.querySelector('.crm-stage-now .crm-stage')?.textContent === l, label)
}
check('TEST 3: moved to Proposal sent one stage at a time', (await d.textContent('.crm-stage-now .crm-stage')) === 'Proposal sent')

// TEST 4
await d.click('button:has-text("Quote an offer")')
await d.click('.crm-offer:has-text("1 Year BEASTY")')
check('TEST 4: the $199 package quotes at $199 + $30/mo', (await d.inputValue('.crm-deal-form input >> nth=0')) === '199' && (await d.inputValue('.crm-deal-form input >> nth=1')) === '30')
await d.click('button:has-text("Save quote")')
await d.waitForSelector('.crm-deal .crm-deal-status.is-open')
await d.click('button:has-text("Mark won")')
await d.selectOption('.crm-inline-form select', 'p_glenn')
await d.click('button:has-text("Confirm won")')
await d.waitForSelector('.crm-deal .crm-deal-status.is-won')
const dealText = await d.textContent('.crm-deal')
check('TEST 4: the deal is won at $199 + $30/mo', /Sold for \$199/.test(dealText) && /\$30\/mo active/.test(dealText), dealText.replace(/\s+/g, ' ').slice(0, 90))
check('TEST 3: winning it moves the lead to Won', (await d.textContent('.crm-stage-now .crm-stage')) === 'Won')
const hist = await d.$$eval('.crm-lead-history tr td:first-child', (tds) => tds.map((t) => t.textContent))
const tos = hist.map((h) => h.split('→').pop().replace('Started at', '').trim())
check('TEST 3: every transition is in the stage history', JSON.stringify(tos.slice(1)) === JSON.stringify(['Contacted', 'Replied', 'Interested', 'Proposal sent', 'Won']), hist.join(' | '))
check(
  'referred by, assigned to and closed by are three different people',
  (await chipName(where.locator('dd a').first())) === 'Janelle' && (await who.locator('select').first().inputValue()) === 'p_leon' && (await who.locator('select').nth(1).inputValue()) === 'p_glenn',
)
await shot(d, 'd-jazz-won')
await go(d, 'revenue', '.crm-stat')
check('TEST 4: one-time revenue is $199', (await stat(d, 'One-time revenue')) === '$199')
check('TEST 4: MRR is $30', (await stat(d, 'MRR')) === '$30')
check('TEST 4: ARR is $360', (await stat(d, 'ARR')) === '$360')
check(
  'TEST 4: the revenue is credited to Janelle and closed by Glenn',
  /Janelle[\s\S]*\$199/.test(await section(d, 'By referrer').textContent()) && /Glenn/.test(await section(d, 'By salesperson').textContent()),
)
await go(d, 'referrer/p_janelle', '.crm-stat')
check("TEST 4: Janelle's numbers follow the sale", (await stat(d, 'Won')) === '1' && (await stat(d, 'Revenue')) === '$199' && (await stat(d, 'MRR')) === '$30')
check('and her funnel counts Jazz Braids at every step', (await d.$$eval('.crm-funnel-n', (n) => n.map((x) => x.textContent))).every((v) => v === '1'))

// TEST 5
await go(d, 'settings', '.crm-section')
await d.locator('.crm-row', { hasText: 'Website Build + 1 Year BEASTY Program' }).locator('button:has-text("Edit")').click()
await d.getByLabel('One-time ($)').fill('249')
await d.click('.crm-row.is-form button:has-text("Save")')
await d.waitForSelector('.crm-row:has-text("Website Build + 1 Year BEASTY Program"):has-text("$249")')
check('TEST 5: the offer now costs $249', true)
await go(d, 'revenue', '.crm-stat')
check('TEST 5: revenue still counts the $199 that was paid', (await stat(d, 'One-time revenue')) === '$199')
await go(d, `lead/${jazzId}`, '.crm-deal')
const after5 = await d.textContent('.crm-deal')
check('TEST 5: and the deal itself still says $199', /Sold for \$199/.test(after5) && !/249/.test(after5))

// TEST 6
await d.fill('.crm-fu-form input[type="datetime-local"]', local(Date.now() - 26 * 3600e3))
await d.fill('.crm-fu-form input[placeholder^="e.g."]', 'Send the onboarding form')
await d.click('button:has-text("Schedule follow-up")')
await d.waitForSelector('.crm-section .crm-row.is-late')
await go(d, 'overview', '.crm-attention')
const attn = d.locator('.crm-attn-overdue')
const attnText = (await attn.textContent().catch(() => '')) ?? ''
check('TEST 6: the overdue follow-up shows under Needs Attention', /^1\s+follow-up is overdue/.test(attnText.trim()), attnText.trim())
await attn.click()
await d.waitForSelector(`.crm-row a[href="#/lead/${jazzId}"]`)
check('TEST 6: and one tap lists it', true)
await shot(d, 'd-overdue')

/* ======================================================== TEST 7, phone */
const target = await p.evaluate(async () => {
  const r = await fetch('/api/crm/leads?hasPhone=1&hasInstagram=1&stage=ready_to_contact&limit=1&sort=name', { credentials: 'same-origin' })
  return (await r.json()).leads[0]
})
check('there is a lead with a phone and Instagram to work', !!target, target?.name)

await tab(p, 'Leads')
await p.waitForSelector('.crm-leads')
check('the leads list fits the phone', (await sideways(p)) <= 1)
await shot(p, 'm-leads')
/* Back from a lead returns to the same place in the list, not the top. */
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

await p.fill('input[aria-label="Search leads"]', target.name)
await p.press('input[aria-label="Search leads"]', 'Enter')
await p.waitForSelector(`a[href="#/lead/${target.id}"]`)
await p.click(`a[href="#/lead/${target.id}"]`)
await p.waitForSelector('.crm-lead-head')
check('TEST 7: open a lead', (await p.textContent('.crm-lead-head h1'))?.trim() === target.name, target.name)
await shot(p, 'm-lead-top')
check('the lead page fits the phone', (await sideways(p)) <= 1)

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
  p.waitForFunction((l) => [...document.querySelectorAll('.crm-seg button')].find((b) => b.textContent === l)?.getAttribute('aria-checked') === 'true', label, { timeout: 3000 }).then(() => true, () => false)
const topType = () => p.locator('.crm-timeline .crm-tl .crm-tl-type').first().textContent()
await text.tap()
check('tapping Text gets a Text log ready', await ready('Text'))
await p.fill('textarea[aria-label="Activity details"]', 'Texted about the $149 website build')
await p.click('.crm-log button[type="submit"]')
await p.waitForSelector('.crm-ok')
check('TEST 7: the text is logged as a text', (await topType()) === 'Text', await topType())

await ig.tap()
check('tapping Instagram gets a DM log ready', await ready('Instagram DM'))
await p.fill('textarea[aria-label="Activity details"]', 'Sent a DM with the demo link')
await p.click('.crm-log button[type="submit"]')
await p.waitForFunction(() => /demo link/.test(document.querySelector('.crm-timeline .crm-tl')?.textContent ?? ''))
check('TEST 7: the DM is logged as an Instagram DM', (await topType()) === 'Instagram DM', await topType())

await p.click('.crm-seg button:has-text("Note")')
check('an empty note cannot be saved', await p.locator('.crm-log button[type="submit"]').isDisabled())
await p.fill('textarea[aria-label="Activity details"]', 'Owner prefers texts after 3pm')
await p.click('.crm-log button[type="submit"]')
await p.waitForFunction(() => /after 3pm/.test(document.querySelector('.crm-timeline .crm-tl')?.textContent ?? ''))
check('TEST 7: write a note', (await topType()) === 'Note')
check('the lead head shows the latest activity', /Note/.test(await p.textContent('.crm-last')))

await p.click('button:has-text("Move to Contacted")')
await p.waitForFunction(() => document.querySelector('.crm-stage-now .crm-stage')?.textContent === 'Contacted')
check('TEST 7: change the stage in one tap', true)
check('the move is in the stage history', (await p.locator('.crm-lead-history tr').count()) === 2)

await p.click('.crm-fu-form button:has-text("Tomorrow 10am")')
await p.click('button:has-text("Schedule follow-up")')
const nextStep = section(p, 'Next step').locator('.crm-list .crm-row').first()
await nextStep.waitFor()
const fu = await nextStep.textContent()
check('TEST 7: schedule a follow-up for tomorrow', /call in \d+h/.test(fu), fu.replace(/\s+/g, ' ').slice(0, 60))
await shot(p, 'm-lead-worked')

/* A second sale, on the phone this time: the $149 build. */
await p.click('button:has-text("Quote an offer")')
await p.locator('.crm-offer', { has: p.locator('strong', { hasText: /^Website Build$/ }) }).click()
check('picking the offer fills its price', (await p.inputValue('.crm-deal-form input >> nth=0')) === '149')
await p.click('button:has-text("Save quote")')
await p.waitForSelector('.crm-deal .crm-deal-status.is-open')
await p.click('button:has-text("Mark won")')
await p.click('button:has-text("Confirm won")')
await p.waitForSelector('.crm-deal .crm-deal-status.is-won')
check('the deal is won on the phone', /Sold for \$149/.test(await p.textContent('.crm-deal')))
const whereP = section(p, 'Where it came from')
await whereP.locator('button:has-text("Set")').click()
await whereP.locator('select').first().selectOption('p_janelle')
await whereP.locator('button:has-text("Save")').click()
await whereP.locator('dd a:has-text("Janelle")').waitFor()
check('and credited to Janelle', true)
check('after all that the lead still fits the phone', (await sideways(p)) <= 1)

await p.click('.crm-back')
await tab(p, 'Revenue')
await p.waitForSelector('.crm-stat')
check('revenue adds the $149 to the $199', (await stat(p, 'One-time revenue')) === '$348' && (await stat(p, 'MRR')) === '$60' && (await stat(p, 'ARR')) === '$720')
await tab(p, 'Referrers')
await p.waitForSelector('.crm-table a:has-text("Janelle")')
await p.click('.crm-table a:has-text("Janelle")')
await p.waitForSelector('.crm-qr img')
await p.waitForFunction(() => { const i = document.querySelector('.crm-qr img'); return i && i.complete && i.naturalWidth > 0 })
check("Janelle's page shows her link and a QR code that loads", /\/r\/janelle/.test(await p.textContent('.crm-reflink code')))
check('and both businesses she sent', (await p.locator(`a[href="#/lead/${target.id}"]`).count()) === 1 && (await p.locator(`a[href="#/lead/${jazzId}"]`).count()) === 1)

for (const [hash, name] of [['overview', 'Glenn'], ['pipeline', 'Pipeline'], ['businesses', 'Businesses'], ['followups?view=upcoming', 'Follow-ups'], ['revenue', 'Revenue'], ['analytics', 'Analytics'], ['referrers', 'Referrers']]) {
  await go(p, hash, `h1:has-text("${name}")`)
  await p.waitForTimeout(400)
  check(`${name === 'Glenn' ? 'Overview' : name} fits the phone`, (await sideways(p)) <= 1)
  await shot(p, `m-${hash.split('?')[0]}`)
}
await go(p, 'followups?view=upcoming', '.crm-tabs a.is-on:has-text("Upcoming")')
check('the phone follow-up waits under Upcoming', await p.waitForSelector(`.crm-row:has(a[href="#/lead/${target.id}"])`).then(() => true, () => false))

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
const pid = await d.evaluate(async (e) => {
  const r = await fetch('/api/crm/people', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Pat Partner', slug: 'pat', sourceType: 'influencer', role: 'partner', memberEmail: e }) })
  return (await r.json()).id
}, email)
const shaka = await d.evaluate(async () => (await (await fetch('/api/crm/leads?q=shaka%20shack&limit=1')).json()).leads[0].id)
await d.evaluate(async ({ id, who }) => fetch(`/api/crm/leads/${id}/referral`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ referrerId: who }) }), { id: shaka, who: pid })
await pp.reload({ waitUntil: 'networkidle' })
await pp.waitForSelector('h1:has-text("Hi Pat")')
check('linked as a partner, they see their own page', true)
check('with no way into the leads', (await pp.locator('.crm-nav').count()) === 0)
const qrOk = await pp.waitForFunction(() => { const i = document.querySelector('.crm-qr img'); return i && i.complete && i.naturalWidth > 0 }).then(() => true, () => false)
check('their link and a QR code that loads', /\/r\/pat$/.test((await pp.textContent('.crm-reflink code')).trim()) && qrOk)
const theirs = await pp.textContent('.crm-list')
check('and the business they sent, with only its name, city and status', /Shaka Shack/.test(theirs) && /In progress/.test(theirs) && !/\d{3}\)?[ -]?\d{3}-?\d{4}|@/.test(theirs))
check("the partner's page fits the phone", (await sideways(pp)) <= 1)
await shot(pp, 'm-partner')

/* ========================================================== desktop sweep */
for (const hash of ['overview', 'leads', `lead/${jazzId}`, 'pipeline', 'businesses', 'referrers', 'followups?view=overdue', 'revenue', 'analytics', 'settings']) {
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
console.log('\nPASS: manual QA 1-7 hold on screen, the partner view is private, and nothing scrolls sideways.')
await finish(0)
