import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const read = path => JSON.parse(readFileSync(path))
const batch = read('research/roster/batch97.json')
const prior = read('research/roster/b86-b96-coverage.json')
const ledger = read('research/roster/b86-b97-coverage.json')
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
const { reviewsOf } = await tsImport('../src/data/foodieIndex.ts', import.meta.url)
const { brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
const slugId = slug => 'b_' + slug.replace(/[^a-z0-9]/g, '')
assert.deepEqual(ledger.posts, [...prior.posts, ...batch.posts])
assert.equal(new Set(ledger.posts.map(post => post.code)).size, ledger.posts.length)
assert.equal(batch.posts.length, 29)
for (const [seat, id] of Object.entries(batch.placements)) assert.equal(ALL_PLACEMENTS[seat], id, seat)
for (const post of batch.posts) {
  const matches = REELS.filter(reel => reel.href === post.source && reel.brandId === post.brand)
  assert.equal(matches.length, 1, post.code)
  assert.equal(matches[0].src, '/clips/' + post.slug + '.mp4')
  const review = reviewsOf(post.brand).find(review => review.href === post.source)
  assert(review, post.code)
  assert.equal(Boolean(review.src), post.disposition === 'local film', post.code)
}
assert.equal(brandById('b_arirangtofubbq').needsSite, true)
assert.deepEqual(brandById('b_fikscuealameda').dietary, ['Halal'])

const live = process.env.BASE
const db = live ? null : await freshTestDb('batch97')
const port = live ? 0 : await new Promise(resolve => {
  const listener = createServer()
  listener.listen(0, '127.0.0.1', () => {
    const { port } = listener.address()
    listener.close(() => resolve(port))
  })
})
const server = live ? null : spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: 'ignore',
  env: { ...process.env, PORT: String(port), DATABASE_URL: db.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = live || `http://127.0.0.1:${port}`
const iphone = process.env.BROWSER === 'webkit'
const browser = await (iphone ? webkit : chromium).launch(iphone ? {} : {
  args: ['--mute-audio', '--disable-quic'],
  ...(process.env.CHROME ? { channel: 'chrome' } : {}),
})
const page = await browser.newPage({ ...(iphone ? devices['iPhone 13'] : {}), viewport: { width: 393, height: 852 } })
const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on('crash', () => errors.push('browser process crashed'))
const hash = data => createHash('sha256').update(data).digest('hex')
const normalizeAddress = value => value.replaceAll(',', '').replace(/\s+/g, ' ')

async function openBrand(id) {
  await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded' })
  await page.locator('.brand-body').waitFor({ timeout: 20000 })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), id)
}

async function expand(button) {
  await button.scrollIntoViewIfNeeded()
  if (await button.getAttribute('aria-expanded') === 'true') return
  await button.click()
  if (await button.getAttribute('aria-expanded') === 'false') await button.click()
  assert.equal(await button.getAttribute('aria-expanded'), 'true')
}

async function play(code) {
  const video = page.locator(`video[src="/clips/review-${code}.mp4"]`)
  await video.waitFor()
  await video.evaluate(async video => {
    video.muted = true
    await video.play()
  })
  await page.waitForFunction(video => video.muted && video.currentTime > 0.1, await video.elementHandle())
  await video.evaluate(video => video.pause())
}

try {
  if (server) {
    for (let i = 0; i < 120; i++) {
      if (await fetch(base + '/api/health').then(r => r.ok).catch(() => false)) break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
  const health = await fetch(base + '/api/health')
  assert(health.ok, `health HTTP ${health.status}`)
  for (const listing of batch.listings) {
    await openBrand(slugId(listing.slug))
    await page.getByRole('heading', { name: listing.name, exact: true }).waitFor()
    assert.equal(normalizeAddress(await page.locator('.brand-address').textContent()), normalizeAddress(listing.address))
    const artwork = '/icons/' + listing.icon + '.webp'
    await page.locator(`.brand-body image[href="${artwork}"]`).first().waitFor()
    const response = await fetch(base + artwork)
    assert(response.ok, artwork)
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(readFileSync('public' + artwork)), artwork)
    await expand(page.getByRole('button', { name: listing.panels[0].head, exact: true }))
    for (const { label, href } of listing.panels[0].links) {
      assert.equal(await page.getByRole('link', { name: label, exact: true }).getAttribute('href'), href)
    }
    console.log('ok listing', listing.slug)
  }
  for (const [heading, name] of [
    ['Seafood/Crab Boil', 'Lemon Crab'],
    ['Burgers/Hot Dogs', 'Broderick Roadhouse'],
    ['Korean BBQ', 'Arirang Tofu & BBQ'],
    ['More BBQ', 'Fikscue Craft Barbecue'],
  ]) {
    await page.goto(base + '/search', { waitUntil: 'domcontentloaded' })
    await page.getByRole('textbox', { name: 'Dishes, businesses, categories, cities' }).fill(heading)
    await page.locator('.search-brand.is-cat').filter({ has: page.getByText('BEASTY • ' + heading, { exact: true }) }).click()
    await page.getByRole('button', { name: new RegExp('^' + name + '(, no website)?$') }).waitFor()
    console.log('ok category', heading)
  }
  await openBrand('b_fikscuealameda')
  await expand(page.locator('.foodie-review-head', { hasText: '@aliasharrief' }))
  await play('De72TEoP0t9')
  await openBrand('b_doloresdeluxe')
  await expand(page.locator('.foodie-review-head', { hasText: '@sfstandard' }))
  await play('DPtgAR7D9YZ')
  await openBrand('b_chezmaeju')
  await expand(page.locator('.foodie-review-head', { hasText: '@lisaaaaletseat' }))
  await page.locator('a[href="https://www.instagram.com/reel/DfRHf08tRQA/"]').waitFor()
  await page.getByRole('button', { name: 'See @lisaaaaletseat’s page' }).click()
  await page.getByRole('heading', { name: '@lisaaaaletseat', exact: true }).waitFor()
  await expand(page.locator('.foodie-review-head', { hasText: 'Chez Maeju' }))
  await play('DfRHf08tRQA')

  const films = process.env.ALL_REELS
    ? REELS.map(reel => reel.src)
    : batch.posts.map(post => '/clips/' + post.slug + '.mp4')
  for (let i = 0; i < films.length; i += 6) {
    await Promise.all(films.slice(i, i + 6).map(async film => {
      const response = await fetch(base + film, { headers: { Range: 'bytes=0-31' } })
      assert.equal(response.status, 206, film)
      const header = Buffer.from(await response.arrayBuffer())
      assert.equal(header.length, 32, film)
      assert.equal(header.subarray(4, 8).toString(), 'ftyp', film)
    }))
  }
  assert.deepEqual(errors, [])
  console.log(`PASS Batch 97 on ${iphone ? 'iPhone WebKit' : 'Chrome'}: 6 listings, 4 category routes, silent playback, ${films.length} verified Watch files`)
} finally {
  await browser.close()
  server?.kill()
  await db?.drop()
}
