/* Dinner With Ike: source facts, seats, artwork, News → Calendar → event. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const batch = JSON.parse(readFileSync('research/roster/batch102.json'))
const prior = JSON.parse(readFileSync('research/roster/b86-b101-coverage.json'))
const ledger = JSON.parse(readFileSync('research/roster/b86-b102-coverage.json'))
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const { brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
const { currentNews, upcoming } = await tsImport('../src/data/news.ts', import.meta.url)
assert.deepEqual(ledger.posts, prior.posts)
assert.equal(batch.listings.length, 1)
assert.equal(batch.posts.length, 0)
for (const [seat, id] of Object.entries(batch.placements)) assert.equal(ALL_PLACEMENTS[seat], id)
const id = 'b_dinnerwithike', brand = brandById(id)
assert.equal(brand.site, 'https://dinnerwithike.com/')
assert.equal(brand.phone, undefined)
assert.equal(brand.email, undefined)
const event = upcoming(new Date('2026-11-06T12:00:00-08:00').getTime()).find(n => n.authorId === id)
assert.equal(event.eventDate, '2026-11-17')
assert.equal(event.eventTime, '5:30–8:30 p.m. Pacific')
assert(currentNews(new Date('2026-11-06T12:00:00-08:00').getTime()).includes(event))

const live = process.env.BASE, db = live ? null : await freshTestDb('batch102')
const port = live ? 0 : await new Promise(resolve => {
  const listener = createServer()
  listener.listen(0, '127.0.0.1', () => { const { port } = listener.address(); listener.close(() => resolve(port)) })
})
const server = live ? null : spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: 'ignore', env: { ...process.env, PORT: String(port), DATABASE_URL: db.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = live || 'http://127.0.0.1:' + port
const iphone = process.env.BROWSER === 'webkit'
const browser = await (iphone ? webkit : chromium).launch(iphone ? {} : { args: ['--mute-audio', '--disable-quic'] })
const page = await browser.newPage({ ...(iphone ? devices['iPhone 13'] : {}), viewport: { width: 393, height: 852 } })
const errors = []
page.on('pageerror', e => errors.push(String(e)))
page.on('crash', () => errors.push('browser process crashed'))
await page.clock.install({ time: new Date('2026-11-06T12:00:00-08:00') })
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const icon = () => page.getByRole('button', { name: 'Dinner With Ike', exact: true })
const fits = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
async function panel() {
  const button = page.getByRole('button', { name: 'November 17 dinner and tickets', exact: true })
  await button.scrollIntoViewIfNeeded()
  if (await button.getAttribute('aria-expanded') !== 'true') await button.click()
  await page.getByRole('link', { name: 'Tickets from the organizer · $395', exact: true }).waitFor()
  for (const link of batch.listings[0].panels[0].links) assert.equal(await page.getByRole('link', { name: link.label, exact: true }).getAttribute('href'), link.href)
  assert.match(await page.locator('.brand-body').innerText(), /5:30–8:30 p\.m\. Pacific/)
  assert.match(await page.locator('.brand-body').innerText(), /all ticket sales are final/)
  await fits()
}
try {
  if (server) for (let i = 0; i < 120; i++) {
    if (await fetch(base + '/api/health').then(r => r.ok).catch(() => false)) break
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  for (const path of batch.updatedIcons) {
    const response = await fetch(base + path)
    assert(response.ok)
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(readFileSync('public' + path)))
  }
  await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByRole('heading', { name: brand.name, exact: true }).waitFor()
  await page.locator('.brand-logo-zoom-trigger image[href="/icons/dinner-with-ike.webp"]').waitFor()
  await panel()
  console.log('ok event facts, organizer links and exact portrait')
  await page.getByRole('button', { name: 'Go to the San Francisco More services page', exact: true }).click()
  await page.locator('.brand-body').waitFor({ state: 'hidden' })
  await icon().waitFor()
  await fits()
  console.log('ok San Francisco More services seat')
  await page.goto(base + '/search', { waitUntil: 'domcontentloaded' })
  await page.getByRole('textbox', { name: 'Dishes, businesses, categories, cities' }).fill('Events')
  await page.locator('.search-brand.is-cat').filter({ has: page.getByText('BEASTY • Events', { exact: true }) }).click()
  await icon().waitFor()
  await fits()
  console.log('ok BEASTY Events seat')
  await page.getByRole('button', { name: 'News', exact: true }).click()
  await page.getByRole('heading', { name: event.headline, exact: true }).waitFor()
  await page.getByRole('button', { name: 'Open the calendar', exact: true }).click()
  await page.getByRole('button', { name: '17 November, 1 event', exact: true }).click()
  const card = page.locator('.cal-event').filter({ hasText: event.headline })
  assert.equal(await card.locator('.cal-event-when').innerText(), event.eventTime)
  assert.match(await card.innerText(), /Dinner With Ike/)
  await fits()
  await card.click()
  await page.getByRole('heading', { name: brand.name, exact: true }).waitFor()
  await panel()
  console.log('ok News → November 17 calendar with exact time → event page')
  await page.setViewportSize({ width: 320, height: 740 })
  await fits()
  assert.deepEqual(errors, [])
  console.log(`PASS Batch 102 on ${base} (${iphone ? 'iPhone WebKit' : 'Chrome'}): event page, two seats, portrait, ticket links and News/Calendar navigation.`)
} catch (error) {
  console.error('Page:', page.url(), '\n', (await page.locator('body').innerText()).slice(0, 3000), '\nErrors:', errors)
  throw error
} finally {
  await browser.close()
  server?.kill()
  await db?.drop()
}
