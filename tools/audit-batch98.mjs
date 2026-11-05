import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const read = path => JSON.parse(readFileSync(path))
const batch = read('research/roster/batch98.json')
const prior = read('research/roster/b86-b97-coverage.json')
const ledger = read('research/roster/b86-b98-coverage.json')
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
const { reviewsOf, pageOfFoodie } = await tsImport('../src/data/foodieIndex.ts', import.meta.url)
const { brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
const slugId = slug => 'b_' + slug.replace(/[^a-z0-9]/g, '')
assert.deepEqual(ledger.posts, [...prior.posts, ...batch.posts])
assert.equal(new Set(ledger.posts.map(post => post.code)).size, ledger.posts.length)
assert.equal(batch.posts.length, 25)
for (const [seat, id] of Object.entries(batch.placements)) assert.equal(ALL_PLACEMENTS[seat], id, seat)
const films = batch.posts.filter(post => post.disposition !== 'disregarded')
for (const post of films) {
  const matches = REELS.filter(reel => reel.href === post.source && reel.brandId === post.brand)
  assert.equal(matches.length, 1, post.code)
  assert.equal(matches[0].src, '/clips/' + post.slug + '.mp4')
  assert(reviewsOf(post.brand).some(review => review.href === post.source), post.code)
}
assert(!REELS.some(reel => reel.href === 'https://www.instagram.com/reel/DdAZclrNJu-/'))
assert.equal(brandById('b_sushiumamimilpitas').needsSite, true)
assert.equal(brandById('b_ushiyagrill').needsSite, true)

const live = process.env.BASE
const db = live ? null : await freshTestDb('batch98')
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
  await video.evaluate(video => {
    video.muted = true
    void video.play()
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
    ['Hot Pot', 'Q-Pot Korean BBQ & Hot Pot'],
    ['Korean', 'Q-Pot Korean BBQ & Hot Pot'],
    ['More sushi', 'Sushi Umami'],
    ['AYCE', 'Ushiya Grill'],
  ]) {
    await page.goto(base + '/search', { waitUntil: 'domcontentloaded' })
    await page.getByRole('textbox', { name: 'Dishes, businesses, categories, cities' }).fill(heading)
    await page.locator('.search-brand.is-cat').filter({ has: page.getByText('BEASTY • ' + heading, { exact: true }) }).click()
    await page.getByRole('button', { name: new RegExp('^' + name + '(, no website)?$') }).waitFor()
    console.log('ok category', heading)
  }
  for (const code of ['DfSs3-RyNHj', 'DfV75JatiuT', 'DfVqeDTsnUX', 'DfFp0KcAv0E']) {
    const post = batch.posts.find(post => post.code === code)
    await openBrand(post.brand)
    const index = reviewsOf(post.brand).findIndex(review => review.href === post.source)
    await expand(page.locator('.foodie-review-head').nth(index))
    await play(code)
    console.log('ok silent playback', code)
  }
  const overflow = batch.posts.find(post => post.code === 'Dctq7K_t7yi')
  await openBrand(overflow.brand)
  await expand(page.locator('.foodie-review-head', { hasText: '@' + overflow.by }))
  await page.locator('a[href="' + overflow.source + '"]').waitFor()
  await openBrand(pageOfFoodie(overflow.by))
  await expand(page.locator('.foodie-review-head', { hasText: 'Q-Pot Korean BBQ & Hot Pot' }))
  await play(overflow.code)

  for (const id of ['b_bibimgrill', 'b_ushiyagrill', 'b_foodieedmunchthefoodie']) {
    await openBrand(id)
    const hero = page.locator('.brand-logo-zoom-trigger')
    assert.equal(await hero.locator('.beasty-page-fold').count(), 0, id)
    const heroClip = await hero.locator('clipPath').getAttribute('id')
    assert(heroClip.endsWith('-rounded'), id)
    const outline = await hero.locator('clipPath path').getAttribute('d')
    assert(outline.startsWith('M24 0H76C94 0 100 6'), id)
    assert(await page.locator('.home .beasty-page-fold').count() > 0, 'grid folded corners')
    await hero.click()
    await page.locator('dialog[open]').waitFor()
    assert.equal(await page.locator('.brand-logo-dialog .beasty-page-fold').count(), 0)
    const image = page.locator('.brand-logo-large img')
    await image.waitFor()
    const radius = await page.locator('.brand-logo-large').evaluate(element => getComputedStyle(element).borderRadius)
    assert.notEqual(radius, '0px')
    if (id === 'b_bibimgrill') {
      assert((await image.getAttribute('src')).includes('/icons/bibim-grill-v98.webp'))
      if (process.env.BATCH_SHOT) await page.screenshot({ path: process.env.BATCH_SHOT })
    }
    await page.locator('.brand-logo-close').click()
    await page.locator('dialog[open]').waitFor({ state: 'hidden' })
  }
  await openBrand('b_pizzeriacardamomo')
  await page.locator('.brand-logo-zoom-trigger').click()
  await page.locator('dialog[open]').waitFor()
  assert.equal(await page.locator('.brand-logo-large svg').count(), 1)
  assert.equal(await page.locator('.brand-logo-large .beasty-page-fold').count(), 0)
  await page.locator('.brand-logo-close').click()

  const files = process.env.ALL_REELS
    ? REELS.map(reel => reel.src)
    : films.map(post => '/clips/' + post.slug + '.mp4')
  for (let i = 0; i < files.length; i += 6) {
    await Promise.all(files.slice(i, i + 6).map(async film => {
      const response = await fetch(base + film, { headers: { Range: 'bytes=0-31' } })
      assert.equal(response.status, 206, film)
      const header = Buffer.from(await response.arrayBuffer())
      assert.equal(header.length, 32, film)
      assert.equal(header.subarray(4, 8).toString(), 'ftyp', film)
    }))
  }
  assert.deepEqual(errors, [])
  console.log(`PASS Batch 98 on ${iphone ? 'iPhone WebKit' : 'Chrome'}: 3 listings, 4 category routes, rounded logos, silent playback, ${files.length} verified Watch files`)
} finally {
  await browser.close()
  server?.kill()
  await db?.drop()
}
