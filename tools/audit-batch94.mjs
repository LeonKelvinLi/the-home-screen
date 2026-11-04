import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, openSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const read = file => JSON.parse(readFileSync(file))
const hash = data => createHash('sha256').update(data).digest('hex')
const batch = read('research/roster/batch94.json')
const prior = read('research/roster/b86-b93-coverage.json')
const ledger = read('research/roster/b86-b94-coverage.json')
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
const { pageOfFoodie, reviewsOf } = await tsImport('../src/data/foodieIndex.ts', import.meta.url)
const { brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
assert.deepEqual(ledger.posts, [...prior.posts, ...batch.posts])
assert.equal(new Set(ledger.posts.map(post => post.code)).size, ledger.posts.length)
for (const [seat, id] of Object.entries(batch.placements)) assert.equal(ALL_PLACEMENTS[seat], id, seat)
for (const post of batch.posts) {
  const reel = REELS.filter(reel => reel.href === post.source)
  assert.equal(reel.length, 1, post.code)
  assert.equal(reel[0].brandId, post.brand, post.code)
}
assert.equal(ALL_PLACEMENTS['san-francisco-goods-8'], 'b_brasabros')
assert.equal(reviewsOf('b_brasabros').filter(review => review.src).length, 3)
assert.equal(reviewsOf('b_brasabros').length, 5)
assert.match(brandById('b_brasabros').orderUrl, /\/brasa-bros$/)

const live = process.env.BASE
const db = live ? null : await freshTestDb('batch94')
const port = live ? 0 : await new Promise(resolve => {
  const server = createServer()
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address()
    server.close(() => resolve(port))
  })
})
mkdirSync('.verify', { recursive: true })
const log = live ? null : openSync('.verify/batch94-server.log', 'a')
const server = live ? null : spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: ['ignore', log, log],
  env: { ...process.env, PORT: String(port), DATABASE_URL: db.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = live || `http://127.0.0.1:${port}`
const iphone = process.env.BROWSER === 'webkit'
const browser = await (iphone ? webkit : chromium).launch(iphone ? {} : {
  args: ['--mute-audio', '--disable-quic'],
  ...(process.env.CHROME ? { channel: 'chrome' } : {}),
})
const page = await browser.newPage({
  ...(iphone ? devices['iPhone 13'] : {}),
  viewport: { width: 393, height: 852 },
  reducedMotion: 'reduce',
})
const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on('crash', () => errors.push('browser process crashed'))
// Only the browser sees this member fixture. The audit creates no live account.
await page.route('**/api/members/me', route => route.fulfill({ status: 200, json: {
  id: 'batch94-browser-fixture', name: 'Batch 94 QA', email: null, phone: null, instagram: null,
  joinedAt: 0, referralCode: '', tier: 'pass', tierStatus: 'active', tierInterval: 'month',
  referrals: 0, raffleTickets: { total: 0, unused: 0 },
  rewards: { milestones: 0, raffleTickets: 0, discount: 0, toNextTicket: 1, discountCapped: false },
  paymentsConfigured: false, passWindowMs: 60000,
} }))

async function openBrand(id) {
  for (let attempt = 0; ; attempt++) {
    try {
      await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded' })
      await page.locator('.brand-body').waitFor({ timeout: 12000 })
      break
    } catch (error) {
      if (attempt >= 2 || page.isClosed()) throw error
    }
  }
  assert.equal(await page.locator('h1').first().textContent(), brandById(id).name)
}
async function expand(button) {
  await button.scrollIntoViewIfNeeded()
  if (await button.getAttribute('aria-expanded') === 'true') return
  await button.click()
  if (await button.getAttribute('aria-expanded') === 'false') await button.click()
}
async function playSilently(video, code) {
  await video.waitFor({ state: 'visible', timeout: 10000 })
  await video.scrollIntoViewIfNeeded()
  const handle = await video.elementHandle()
  await video.evaluate(video => { video.muted = true; video.preload = 'metadata'; video.load() })
  await page.waitForFunction(v => v.readyState >= 1, handle, { timeout: 20000 })
  await video.evaluate(video => video.play())
  await page.waitForFunction(v => v.muted && v.currentTime > 0.1, handle, { timeout: 12000 })
  const response = await fetch(base + '/clips/review-' + code + '.mp4', { headers: { Range: 'bytes=0-31' } })
  assert.equal(response.status, 206, code)
  assert.equal(Buffer.from(await response.arrayBuffer()).subarray(4, 8).toString(), 'ftyp', code)
  await video.evaluate(video => video.pause())
  console.log('played silently', code)
}

try {
  if (server) {
    for (let i = 0; i < 120; i++) {
      if (await fetch(base + '/api/health').then(r => r.ok).catch(() => false)) break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
  const ids = new Set(batch.posts.map(p => p.disposition === 'creator and Watch film' ? pageOfFoodie(p.by) : p.brand))
  for (const id of ids) {
    await openBrand(id)
    if (id === 'b_brasabros') {
      await expand(page.getByRole('button', { name: 'Order online', exact: true }))
      assert.equal(await page.getByRole('link', { name: 'Order from Brasa Bros on Toast' }).getAttribute('href'), brandById(id).orderUrl)
    }
    let ownOpened = false
    for (const post of batch.posts.filter(p => (p.disposition === 'creator and Watch film' ? pageOfFoodie(p.by) : p.brand) === id)) {
      console.log('checking', id, post.code)
      const source = `video:is(.brand-clip-video, .foodie-review-video)[src$="/${post.slug}.mp4"]`
      const isOwn = [brandById(id).clip, ...(brandById(id).clips ?? [])].some(c => c?.href === post.source)
      if (isOwn && !ownOpened) {
        await expand(page.locator('.brand-clip-drop > .menu-picks-bar'))
        ownOpened = true
      } else if (!isOwn) {
        const review = page.locator('.foodie-review-head', { hasText: id === post.brand ? '@' + post.by : post.place })
        await expand(review.first())
      }
      await playSilently(page.locator(source).first(), post.code)
    }
  }

  const icons = ['meso-customs', 'jessica-domingo', 'netta-brielle', 'p-lo', 'brasa-bros',
    'foodie-celineeats', 'foodie-kat-dazzzle', 'foodie-queen-food-e', 'foodie-cindydreamtravel',
    'foodie-yummylouey', 'foodie-agnespittioni', 'foodie-j00diefoodie', 'foodie-erica-sorelle',
    'foodie-bayarea-kulture']
  for (const icon of icons) {
    const path = `/icons/${icon}-v94.webp`
    const response = await fetch(base + path)
    assert(response.ok, path)
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(readFileSync('public' + path)), path)
  }

  await page.setViewportSize({ width: 320, height: 568 })
  await openBrand('b_empirestatepizza')
  assert.equal(await page.locator('.brand-address').textContent(), '9130 Alcosta Blvd Suite C\nSan Ramon, CA 94583')
  assert.equal(await page.locator('.brand-offer-sponsor').count(), 2)
  assert.equal(await page.getByText('Proposed sponsorship', { exact: true }).count(), 1)
  const offer = await page.locator('.brand-offers').evaluate(el => ({
    headingRows: Array.from(el.querySelectorAll('.brand-offer-head'), head => {
      const title = head.querySelector('.brand-offer-title').getBoundingClientRect()
      const sponsor = head.querySelector('.brand-offer-sponsor').getBoundingClientRect()
      return Math.abs(title.top - sponsor.top) < 1 && sponsor.left >= title.right
    }),
    overflow: el.scrollWidth - el.clientWidth,
  }))
  assert.deepEqual(offer.headingRows, [true, true])
  assert(offer.overflow <= 1, JSON.stringify(offer))

  await page.setViewportSize({ width: 393, height: 852 })
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Enter BEASTY', exact: true }).click()
  const visibleSheet = page.locator('.home-page:not([inert])')
  const foodieTile = visibleSheet.getByRole('button', { name: 'BEASTY • Foodies', exact: true })
  await foodieTile.waitFor({ timeout: 20000 })
  assert.equal(await foodieTile.locator('.icon-tile.is-glow').count(), 1)
  assert.equal(await foodieTile.evaluate(el => [...el.parentElement.children].indexOf(el)), 10)
  await foodieTile.click()
  const featured = visibleSheet.getByRole('button', { name: 'Bay Area Kulture', exact: true })
  await featured.waitFor({ timeout: 20000 })
  assert.equal(await featured.locator('.icon-tile.is-glow').count(), 1)
  assert.equal(await visibleSheet.locator('.icon-tile.is-nosite').count(), 0)
  assert.equal(await featured.evaluate(el => [...el.parentElement.children].indexOf(el)), 10)
  await featured.click()
  await page.getByRole('heading', { name: 'Bay Area Kulture', exact: true }).waitFor()
  assert.equal(await page.locator('a[href="https://www.instagram.com/bayarea.kulture/"]').count(), 1)
  await page.goto(base + '/members', { waitUntil: 'domcontentloaded' })
  await page.locator('.members-plans').waitFor({ timeout: 20000 })
  const prices = await page.locator('.members-plans .members-plan-price').allTextContents()
  assert.deepEqual(prices.map(price => price.trim()), ['$39/month', '$59/month'])
  assert.deepEqual(errors, [])
  console.log(`PASS Batch 94 on ${iphone ? 'iPhone WebKit' : process.env.CHROME ? 'Chrome phone viewport' : 'Chromium phone viewport'}: ${batch.posts.length} silent films, ${icons.length} icon files, 320px offers and the Foodies layout`)
} finally {
  await browser.close()
  server?.kill()
  await db?.drop()
}
