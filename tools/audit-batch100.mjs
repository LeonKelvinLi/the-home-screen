import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { pathToFileURL } from 'node:url'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

export async function auditBatch(number) {
  const read = path => JSON.parse(readFileSync(path))
  const batch = read(`research/roster/batch${number}.json`)
  const ledger = read(`research/roster/b86-b${number}-coverage.json`)
  const prior = read(`research/roster/b86-b${number - 1}-coverage.json`)
  const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
  const { brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
  const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
  const { reviewsOf } = await tsImport('../src/data/foodieIndex.ts', import.meta.url)
  assert.deepEqual(ledger.posts, [...prior.posts, ...batch.posts])
  assert.equal(batch.listings.length, 6)
  assert.equal(batch.posts.length, number === 100 ? 13 : 6)
  for (const [seat, id] of Object.entries(batch.placements)) assert.equal(ALL_PLACEMENTS[seat], id, seat)
  for (const post of batch.posts) assert.equal(REELS.filter(reel => reel.href === post.source && reel.brandId === post.brand).length, 1, post.code)
  if (number === 100) {
    assert.equal(ALL_PLACEMENTS['beasty-hotpot-1'], 'b_littlesheepnewark')
    assert.equal(ALL_PLACEMENTS['beasty-yakitori-2'], 'b_littlesheepnewark')
    assert.equal(brandById('b_masteroh').cuisine, 'Korean seafood restaurant')
    assert.equal(brandById('b_halalstreetnewark').needsSite, true)
    assert.equal(reviewsOf('b_maillards').filter(r => r.src).length, 4)
  } else {
    assert.equal(brandById('b_innenaskitchen').clip.href, 'https://www.instagram.com/reel/DfQnRl2hg3t/')
    assert.equal(reviewsOf('b_innenaskitchen').filter(r => r.src).length, 3)
    assert.match(brandById('b_worldwrappsstanford').address, /Palo Alto/)
  }
  const live = process.env.BASE
  const db = live ? null : await freshTestDb('batch' + number)
  const port = live ? 0 : await new Promise(resolve => {
    const listener = createServer()
    listener.listen(0, '127.0.0.1', () => { const { port } = listener.address(); listener.close(() => resolve(port)) })
  })
  const server = live ? null : spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
    stdio: 'ignore', env: { ...process.env, PORT: String(port), DATABASE_URL: db.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
  })
  const base = live || 'http://127.0.0.1:' + port
  const iphone = process.env.BROWSER === 'webkit'
  const browser = await (iphone ? webkit : chromium).launch(iphone ? {} : { args: ['--mute-audio', '--disable-quic'], ...(process.env.CHROME ? { channel: 'chrome' } : {}) })
  const page = await browser.newPage({ ...(iphone ? devices['iPhone 13'] : {}), viewport: { width: 393, height: 852 } })
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  page.on('crash', () => errors.push('browser process crashed'))
  const hash = bytes => createHash('sha256').update(bytes).digest('hex')
  // Directory buttons announce extra website/mobile status after the name.
  const iconButton = name => page.getByRole('button', { name: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:,|$)') })
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
  async function category(name, brandName) {
    await page.goto(base + '/search', { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.getByRole('textbox', { name: 'Dishes, businesses, categories, cities' }).fill(name)
    await page.locator('.search-brand.is-cat').filter({ has: page.getByText('BEASTY • ' + name, { exact: true }) }).click()
    await iconButton(brandName).waitFor()
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name)
    console.log('ok category', name)
  }
  try {
    if (server) {
      for (let i = 0; i < 120; i++) {
        if (await fetch(base + '/api/health').then(r => r.ok).catch(() => false)) break
        await new Promise(resolve => setTimeout(resolve, 250))
      }
    }
    assert((await fetch(base + '/api/health')).ok)
    const artwork = [...new Set([...batch.updatedIcons, ...batch.listings.map(l => '/icons/' + l.icon + '.webp')])]
    for (const path of artwork) {
      const response = await fetch(base + path)
      assert(response.ok, path)
      assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(readFileSync('public' + path)), path)
    }
    for (const listing of batch.listings) {
      const id = 'b_' + listing.slug.replace(/[^a-z0-9]/g, '')
      await open(id)
      await page.locator('.brand-logo-zoom-trigger image[href="/icons/' + listing.icon + '.webp"]').waitFor()
      const count = (listing.sections ?? []).reduce((n, s) => n + s.items.length, 0)
      if (count) {
        await expand(page.getByRole('button', { name: 'Price list · ' + count + ' items', exact: true }))
        assert.equal(await page.locator('.menu-row').count(), count, id)
        if (listing.sections.some(s => s.items.some(i => i[4] === 'Ask shop'))) {
          assert.equal(await page.locator('.menu-row-price').filter({ hasText: '$0.00' }).count(), 0, id)
          assert.equal(await page.locator('.menu-row-price').filter({ hasText: 'Ask shop' }).count(), count, id)
        }
      }
      for (const panel of listing.panels ?? []) {
        await expand(page.getByRole('button', { name: panel.head, exact: true }))
        for (const link of panel.links ?? []) assert.equal(await page.getByRole('link', { name: link.label, exact: true }).getAttribute('href'), link.href)
      }
      const citySeat = Object.entries(batch.placements).find(([s, bid]) => bid === id && !s.startsWith('beasty-'))?.[0]
      assert(citySeat, id)
      const city = citySeat.replace(/-goods2?-\d+$/, '').split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
      await page.getByRole('button', { name: 'Go to the ' + city + (citySeat.includes('-goods2-') ? ' More goods' : ' Goods') + ' page', exact: true }).click()
      await page.locator('.brand-body').waitFor({ state: 'hidden' })
      await iconButton(listing.name).waitFor()
      console.log('ok listing, menu and city', id, count)
    }
    for (const post of batch.posts) {
      await open(post.brand)
      const index = reviewsOf(post.brand).findIndex(review => review.href === post.source)
      if (index >= 0) await expand(page.locator('.foodie-review-head').nth(index))
      else await expand(page.getByRole('button', { name: 'Watch their video', exact: true }))
      const video = page.locator((index < 0 ? '.brand-clip-drop ' : '') + 'video[src="/clips/' + post.slug + '.mp4"]')
      await video.waitFor()
      await video.evaluate(video => { video.muted = true; void video.play() })
      await page.waitForFunction(video => video.muted && video.currentTime > 0.1 && !video.error, await video.elementHandle(), { timeout: 20000 })
      await video.evaluate(video => video.pause())
      const response = await fetch(base + '/clips/' + post.slug + '-poster.webp')
      assert(response.ok)
      assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(readFileSync('public/clips/' + post.slug + '-poster.webp')), post.code)
      console.log('ok silent clip', post.code)
    }
    for (const creator of batch.creators) {
      await open('b_foodie' + creator.handle.replace(/[^a-z0-9]/g, ''))
      await page.locator('.brand-logo-zoom-trigger image[href="/icons/' + creator.icon + '.webp"]').waitFor()
      assert(await page.locator('.foodie-review-head').count() > 0, creator.handle)
    }
    if (number === 100) {
      await category('Pho', 'V Pho')
      await category('Onigiri', 'Riceful')
      await category('Burgers/Hot Dogs', 'Smack Burgers')
    } else {
      await category('Donuts', 'JK Cafe & Boba Donuts')
      await category('Boba', 'JK Cafe & Boba Donuts')
    }
    const clips = process.env.ALL_REELS ? REELS.map(reel => reel.src) : batch.posts.map(post => '/clips/' + post.slug + '.mp4')
    for (let i = 0; i < clips.length; i += 6) await Promise.all(clips.slice(i, i + 6).map(async path => {
      const response = await fetch(base + path, { headers: { Range: 'bytes=0-31' } })
      assert.equal(response.status, 206, path)
      const bytes = Buffer.from(await response.arrayBuffer())
      assert.equal(bytes.length, 32, path)
      assert.equal(bytes.subarray(4, 8).toString(), 'ftyp', path)
    }))
    assert.deepEqual(errors, [])
    console.log('PASS Batch ' + number + ' on ' + (iphone ? 'iPhone WebKit' : 'Chrome') + ': six listings, ' + batch.posts.length + ' muted films, menus, city seats, categories, artwork and ' + clips.length + ' Watch files')
  } finally {
    await browser.close()
    server?.kill()
    await db?.drop()
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await auditBatch(100)
