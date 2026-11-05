import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const read = path => JSON.parse(readFileSync(path))
const batch = read('research/roster/batch99.json')
const ledger = read('research/roster/b86-b99-coverage.json')
const prior = read('research/roster/b86-b98-coverage.json')
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const { BRANDS, brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
const { reviewsOf } = await tsImport('../src/data/foodieIndex.ts', import.meta.url)
const { ALL_APPS, DOCK_SETS } = await tsImport('../src/apps/registry.tsx', { parentURL: import.meta.url, tsconfig: 'tsconfig.app.json' })
assert.deepEqual(ledger.posts, [...prior.posts, ...batch.posts])
assert.equal(batch.posts.length, 6)
for (const [seat, id] of Object.entries({ ...batch.placements, ...batch.preservedPlacements })) assert.equal(ALL_PLACEMENTS[seat], id, seat)
for (const { id } of batch.removals) {
  assert.equal(brandById(id), undefined, id)
  assert(!Object.values(ALL_PLACEMENTS).includes(id), id)
  assert(!ALL_APPS.some(app => app.id === id), id)
  assert(!REELS.some(reel => reel.brandId === id), id)
}
assert.equal(DOCK_SETS.find(set => set.key === 'beasty').apps.length, 3)
const healthy = brandById('b_healthyspotberkeley')
assert.equal(healthy.site, 'https://linktr.ee/healthyspotberkeley')
assert.equal(healthy.instagram, 'healthyspot_berkeley')
for (const post of batch.posts) {
  assert.equal(REELS.filter(reel => reel.href === post.source && reel.brandId === post.brand).length, 1, post.code)
}
assert.equal(brandById('b_bayareacrumbs').menu.reduce((count, section) => count + section.items.length, 0), 24)

const live = process.env.BASE
const db = live ? null : await freshTestDb('batch99')
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
const base = live || 'http://127.0.0.1:' + port
const iphone = process.env.BROWSER === 'webkit'
const browser = await (iphone ? webkit : chromium).launch(iphone ? {} : {
  args: ['--mute-audio', '--disable-quic'],
  ...(process.env.CHROME ? { channel: 'chrome' } : {}),
})
const page = await browser.newPage({ ...(iphone ? devices['iPhone 13'] : {}), viewport: { width: 393, height: 852 } })
const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on('crash', () => errors.push('browser process crashed'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')

async function open(id) {
  await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.locator('.brand-body').waitFor()
  await page.getByRole('heading', { name: brandById(id).name, exact: true }).waitFor()
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), id)
}
async function expand(button) {
  await button.scrollIntoViewIfNeeded()
  if (await button.getAttribute('aria-expanded') === 'true') return
  await button.click()
  if (await button.getAttribute('aria-expanded') === 'false') await button.click()
  assert.equal(await button.getAttribute('aria-expanded'), 'true')
}

try {
  if (server) {
    for (let i = 0; i < 120; i++) {
      if (await fetch(base + '/api/health').then(response => response.ok).catch(() => false)) break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
  assert((await fetch(base + '/api/health')).ok)
  const artwork = [...batch.updatedIcons, '/icons/bay-area-crumbs.webp']
  for (const path of artwork) {
    const matching = BRANDS.filter(brand => brand.logo.imageUrl === path)
    assert(matching.length > 0, path)
    const response = await fetch(base + path)
    assert(response.ok, path)
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(readFileSync('public' + path)), path)
    for (const brand of matching) {
      await open(brand.id)
      await page.locator('.brand-logo-zoom-trigger image[href="' + path + '"]').waitFor()
      console.log('ok artwork', brand.id)
    }
  }
  for (const post of batch.posts) {
    await open(post.brand)
    const index = reviewsOf(post.brand).findIndex(review => review.href === post.source)
    assert(index >= 0, post.code)
    await expand(page.locator('.foodie-review-head').nth(index))
    const video = page.locator('video[src="/clips/' + post.slug + '.mp4"]')
    await video.waitFor()
    await video.evaluate(video => { video.muted = true; void video.play() })
    await page.waitForFunction(video => video.muted && video.currentTime > 0.1, await video.elementHandle(), { timeout: 20000 })
    await video.evaluate(video => video.pause())
    console.log('ok silent clip', post.code)
  }
  await open('b_bayareacrumbs')
  await expand(page.getByRole('button', { name: 'Price list · 24 items', exact: true }))
  assert.equal(await page.locator('.menu-row').count(), 24)
  await expand(page.getByRole('button', { name: 'Ordering and pickup', exact: true }))
  assert.equal(await page.getByRole('link', { name: 'Bay Area Crumbs online shop', exact: true }).getAttribute('href'), 'https://bayareacrumbs.com/collections/all')
  await page.getByRole('button', { name: 'Go to the Bay Area More goods page', exact: true }).click()
  await page.locator('.brand-body').waitFor({ state: 'hidden' })
  await page.getByRole('button', { name: 'Bay Area Crumbs', exact: true }).click()
  await page.getByRole('heading', { name: 'Bay Area Crumbs', exact: true }).waitFor()
  await page.goto(base + '/search', { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByRole('textbox', { name: 'Dishes, businesses, categories, cities' }).fill('Cookies')
  await page.locator('.search-brand.is-cat').filter({ has: page.getByText('BEASTY • Cookies', { exact: true }) }).click()
  await page.getByRole('button', { name: 'Bay Area Crumbs', exact: true }).waitFor()
  for (const { id } of batch.removals) {
    await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.getByRole('button', { name: 'BEASTY • Eats', exact: true }).waitFor()
    assert.equal(await page.locator('.brand-body').count(), 0, id)
    console.log('ok removed link returns home', id)
  }
  const clips = process.env.ALL_REELS ? REELS.map(reel => reel.src) : batch.posts.map(post => '/clips/' + post.slug + '.mp4')
  for (let i = 0; i < clips.length; i += 6) {
    await Promise.all(clips.slice(i, i + 6).map(async path => {
      const response = await fetch(base + path, { headers: { Range: 'bytes=0-31' } })
      assert.equal(response.status, 206, path)
      const bytes = Buffer.from(await response.arrayBuffer())
      assert.equal(bytes.length, 32, path)
      assert.equal(bytes.subarray(4, 8).toString(), 'ftyp', path)
    }))
  }
  assert.deepEqual(errors, [])
  console.log('PASS Batch 99 on ' + (iphone ? 'iPhone WebKit' : 'Chrome') + ': artwork, six silent clips, cookie menu and seats, seven removed links, ' + clips.length + ' Watch files')
} finally {
  await browser.close()
  server?.kill()
  await db?.drop()
}
