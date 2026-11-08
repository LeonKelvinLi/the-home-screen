/* Evening/morning intake: exact seats, menus, artwork, credited films and front foodies. */
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
  const read = f => JSON.parse(readFileSync(f))
  const batch = read(`research/roster/batch${number}.json`)
  const prior = read(`research/roster/b86-b${number - 1}-coverage.json`)
  const ledger = read(`research/roster/b86-b${number}-coverage.json`)
  assert.deepEqual(ledger.posts, [...prior.posts, ...batch.posts])
  const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
  const { brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
  const { FOODIE_PAGES } = await tsImport('../src/data/foodies.ts', import.meta.url)
  const { reviewsBy, reviewsOf, pageOfFoodie } = await tsImport('../src/data/foodieIndex.ts', import.meta.url)
  const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
  for (const [seat, id] of Object.entries(batch.placements)) assert.equal(ALL_PLACEMENTS[seat], id, seat)
  const active = batch.posts.filter(p => p.slug)
  for (const p of active) assert.equal(REELS.filter(r => r.href === p.source).length, 1, p.code)
  assert.equal(REELS.filter(r => r.href?.includes('DTnoBTMES1u')).length, 0)
  for (const id of new Set(active.map(p => p.brand))) {
    const b = brandById(id)
    const files = new Set([...([b.clip, ...(b.clips ?? [])].map(c => c?.src)), ...reviewsOf(id).map(r => r.src)].filter(Boolean))
    assert(files.size <= 4, id)
  }
  if (number === 103) {
    assert.equal(ALL_PLACEMENTS['beasty-foodies-0'], 'b_foodieronniebanks')
    assert.equal(ALL_PLACEMENTS['beasty-foodies-1'], 'b_foodiemsashleyvee')
    for (const [i, f] of batch.foodieOrder.entries()) assert.equal(ALL_PLACEMENTS[i < 24 ? 'beasty-foodies-' + i : 'beasty-foodies2-' + (i - 24)], f.brand)
    const shared = reviewsBy('msashleyvee')
    assert.equal(shared.length, 2)
    assert(shared.every(r => r.by === 'mr.gaoviet' && r.src && r.credit.includes('@msashleyvee')))
    assert.equal(brandById('b_cajuncrackn').logo.imageUrl, '/icons/cajun-crackn-v103.webp')
    assert(reviewsOf('b_seriousdumpling').some(r => r.href.includes('DKue7toxsdq')))
    assert(!reviewsOf('b_seriousdumpling').some(r => r.href.includes('DQKo2NEEipZ')))
  }
  const live = process.env.BASE, db = live ? null : await freshTestDb('batch' + number)
  const port = live ? 0 : await new Promise(resolve => {
    const s = createServer(); s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)) })
  })
  const server = live ? null : spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
    stdio: 'ignore', env: { ...process.env, PORT: String(port), DATABASE_URL: db.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
  })
  const base = live || 'http://127.0.0.1:' + port, iphone = process.env.BROWSER === 'webkit'
  const browser = await (iphone ? webkit : chromium).launch(iphone ? {} : { args: ['--mute-audio', '--disable-quic'] })
  const page = await browser.newPage({ ...(iphone ? devices['iPhone 13'] : {}), viewport: { width: 393, height: 852 } })
  const errors = []
  page.on('pageerror', e => errors.push(String(e))); page.on('crash', () => errors.push('browser process crashed'))
  const hash = b => createHash('sha256').update(b).digest('hex')
  async function fits() { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)) }
  async function open(id) {
    await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.getByRole('heading', { name: brandById(id).name, exact: true }).waitFor(); await fits()
  }
  async function expand(button) {
    await button.scrollIntoViewIfNeeded()
    if (await button.getAttribute('aria-expanded') !== 'true') await button.click()
    if (await button.getAttribute('aria-expanded') === 'false') await button.click()
    assert.equal(await button.getAttribute('aria-expanded'), 'true')
  }
  const icon = name => page.getByRole('button', { name: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:,|$)') })
  async function category(name, target) {
    await page.goto(base + '/search', { waitUntil: 'domcontentloaded' })
    await page.getByRole('textbox', { name: 'Dishes, businesses, categories, cities' }).fill(name)
    await page.locator('.search-brand.is-cat').filter({ has: page.getByText('BEASTY • ' + name, { exact: true }) }).click()
    if (target) await icon(target).waitFor()
    await fits(); console.log('ok category', name)
  }
  try {
    if (server) for (let i = 0; i < 120; i++) {
      if (await fetch(base + '/api/health').then(r => r.ok).catch(() => false)) break
      await new Promise(r => setTimeout(r, 250))
    }
    for (const path of batch.updatedIcons) {
      const r = await fetch(base + path); assert(r.ok, path)
      assert.equal(hash(Buffer.from(await r.arrayBuffer())), hash(readFileSync('public' + path)), path)
    }
    for (const listing of batch.listings) {
      const id = 'b_' + listing.slug.replace(/[^a-z0-9]/g, '')
      await open(id)
      await page.locator('.brand-logo-zoom-trigger image[href="/icons/' + listing.icon + '.webp"]').waitFor()
      const count = (listing.sections ?? []).reduce((n, s) => n + s.items.length, 0)
      if (count) {
        await expand(page.getByRole('button', { name: (listing.quoteOnly ? 'Price list' : 'Menu') + ' · ' + count + ' items', exact: true }))
        assert.equal(await page.locator('.menu-row').count(), count)
        assert.equal(await page.locator('.menu-row-price').filter({ hasText: '$0.00' }).count(), 0)
        for (const section of listing.sections) assert(await page.locator('.menu-row').filter({ hasText: section.items[0][0] }).count() > 0)
      } else assert.match(await page.locator('.brand-body').innerText(), /current menu|full current menu/i)
      for (const panel of listing.panels ?? []) {
        await expand(page.getByRole('button', { name: panel.head, exact: true }))
        for (const link of panel.links ?? []) assert.equal(await page.getByRole('link', { name: link.label, exact: true }).getAttribute('href'), link.href)
      }
      const seat = Object.entries(batch.placements).find(([s, b]) => b === id && !s.startsWith('beasty-'))?.[0]
      assert(seat, id)
      const city = seat.replace(/-goods2?-\d+$/, '').split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')
      await page.getByRole('button', { name: 'Go to the ' + city + (seat.includes('-goods2-') ? ' More goods' : ' Goods') + ' page', exact: true }).click()
      await page.locator('.brand-body').waitFor({ state: 'hidden' }); await icon(listing.name).waitFor()
      console.log('ok listing, menu and city', id, count)
    }
    for (const post of active) {
      let owner = post.brand, index = reviewsOf(owner).findIndex(r => r.href === post.source)
      const review = index >= 0 ? reviewsOf(owner)[index] : null
      if (review && !review.src) {
        const handle = post.by === 'mr.gaoviet' ? 'msashleyvee' : post.by
        owner = pageOfFoodie(handle); assert(owner, post.code)
        index = reviewsBy(handle).findIndex(r => r.href === post.source)
      }
      await open(owner)
      if (index >= 0) await expand(page.locator('.foodie-review-head').nth(index))
      else await expand(page.getByRole('button', { name: 'Watch their video', exact: true }))
      const video = page.locator((index < 0 ? '.brand-clip-drop ' : '') + 'video[src="/clips/' + post.slug + '.mp4"]')
      await video.waitFor(); await video.evaluate(v => { v.muted = true; void v.play() })
      await page.waitForFunction(v => v.muted && v.currentTime > .1 && !v.error, await video.elementHandle(), { timeout: 20000 })
      await video.evaluate(v => v.pause())
      const r = await fetch(base + '/clips/' + post.slug + '-poster.webp'); assert(r.ok)
      assert.equal(hash(Buffer.from(await r.arrayBuffer())), hash(readFileSync('public/clips/' + post.slug + '-poster.webp')))
      console.log('ok silent clip', post.code, owner)
    }
    for (const f of FOODIE_PAGES.filter(f => batch.updatedIcons.includes('/icons/' + f.icon + '.webp'))) {
      await open(f.brand ?? 'b_foodie' + f.handle.replace(/[^a-z0-9]/g, ''))
      await page.locator('.brand-logo-zoom-trigger image[href="/icons/' + f.icon + '.webp"]').waitFor()
      assert(await page.locator('.foodie-review-head').count() > 0, f.handle)
    }
    if (number === 103) {
      await category('Fried Chicken', 'Aburaya'); await category('Pizza', 'Via Mia Pizza'); await category('Dumplings', 'Serious Dumpling')
      await category('Foodies', 'Ronnie Banks'); await icon('MsAshleyVee').waitFor()
    } else {
      await category('Sandwiches', 'Oink & Oscar')
      await category('Breakfast/Diner')
      // The original 24 stay on page one; the new chain is on the linked overflow.
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon('Sweet Maple').waitFor()
    }
    await page.setViewportSize({ width: 320, height: 740 }); await fits()
    const paths = process.env.ALL_REELS ? [...new Set(REELS.map(r => r.src))] : active.map(p => '/clips/' + p.slug + '.mp4')
    for (let i = 0; i < paths.length; i += 6) await Promise.all(paths.slice(i, i + 6).map(async path => {
      const r = await fetch(base + path, { headers: { Range: 'bytes=0-31' } }); assert.equal(r.status, 206, path)
      const b = Buffer.from(await r.arrayBuffer()); assert.equal(b.length, 32); assert.equal(b.subarray(4, 8).toString(), 'ftyp')
    }))
    assert.deepEqual(errors, [])
    console.log(`PASS Batch ${number} on ${base} (${iphone ? 'iPhone WebKit' : 'Chrome'}): ${batch.listings.length} listings, ${active.length} silent films, artwork, menus, seats, categories and ${paths.length} Watch files.`)
  } catch (error) {
    console.error(page.url(), (await page.locator('body').innerText()).slice(0, 2500), errors)
    throw error
  } finally { await browser.close(); server?.kill(); await db?.drop() }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await auditBatch(103)
