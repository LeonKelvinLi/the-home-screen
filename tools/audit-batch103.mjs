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
  for (const [seat, id] of Object.entries(batch.removedPlacements ?? {})) assert.notEqual(ALL_PLACEMENTS[seat], id, seat)
  for (const id of batch.removedBrands ?? []) assert.equal(brandById(id), undefined, id)
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
    // Later batches may promote newly tagged heavy hitters within the overflow.
    for (const [i, f] of batch.foodieOrder.slice(0, 24).entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
    for (const f of batch.foodieOrder) assert(brandById(f.brand), f.handle)
    const shared = reviewsBy('msashleyvee')
    assert.equal(shared.length, 2)
    assert(shared.every(r => r.by === 'mr.gaoviet' && r.src && r.credit.includes('@msashleyvee')))
    assert.equal(brandById('b_cajuncrackn').logo.imageUrl, '/icons/cajun-crackn-v103.webp')
    assert(reviewsOf('b_seriousdumpling').some(r => r.href.includes('DKue7toxsdq')))
    assert(!reviewsOf('b_seriousdumpling').some(r => r.href.includes('DQKo2NEEipZ')))
  }
  if (number === 105) {
    assert(reviewsOf('b_nokaramen').some(r => r.href.includes('Dfcqyhzxh_9') && r.src))
    assert.equal(brandById('b_pakusf').needsSite, true)
    assert.equal(brandById('b_saladmakers').logo.imageUrl, '/icons/salad-makers-v105.webp')
    assert.equal(brandById('b_classycanines').logo.imageUrl, '/icons/classy-canines-v105.webp')
    for (const [i, f] of batch.foodieOrder.slice(0, 24).entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
    for (const f of batch.foodieOrder) assert(brandById(f.brand), f.handle)
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
  if (number === 105) await page.clock.install({ time: new Date('2026-11-07T12:00:00-08:00') })
  const errors = []
  page.on('pageerror', e => errors.push(String(e))); page.on('crash', () => errors.push('browser process crashed'))
  const hash = b => createHash('sha256').update(b).digest('hex')
  async function fits() { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)) }
  async function open(id) {
    await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.getByRole('heading', { name: brandById(id).name, exact: true }).waitFor()
    await page.waitForFunction(() => {
      const window = document.querySelector('.app-window')
      return window && getComputedStyle(window).willChange === 'auto'
    })
    await fits()
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
    for (const id of batch.updatedBrands ?? []) {
      await open(id)
      await page.locator('.brand-logo-zoom-trigger image[href="' + brandById(id).logo.imageUrl + '"]').waitFor()
    }
    for (const listing of batch.listings) {
      const id = 'b_' + listing.slug.replace(/[^a-z0-9]/g, '')
      await open(id)
      await page.locator('.brand-logo-zoom-trigger image[href="/icons/' + listing.icon + '.webp"]').waitFor()
      const count = (listing.sections ?? []).reduce((n, s) => n + s.items.length, 0)
      if (count) {
        await expand(page.getByRole('button', { name: (listing.quoteOnly ? 'Price list' : 'Menu') + ' · ' + count + ' items', exact: true }))
        assert.equal(await page.locator('.menu-row').count(), count)
        if (listing.quoteOnly) assert.equal(await page.locator('button.menu-row').count(), 0, id + ' price list cannot order')
        assert.equal(await page.locator('.menu-row-price').filter({ hasText: '$0.00' }).count(), 0)
        for (const section of listing.sections) assert(await page.locator('.menu-row').filter({ hasText: section.items[0][0] }).count() > 0)
      } else assert((await page.locator('.brand-body').innerText()).replace(/\s+/g, ' ').includes(listing.contactOnly.replace(/\s+/g, ' ')))
      for (const panel of listing.panels ?? []) {
        await expand(page.getByRole('button', { name: panel.head, exact: true }))
        for (const link of panel.links ?? []) assert.equal(await page.getByRole('link', { name: link.label, exact: true }).getAttribute('href'), link.href)
      }
      const seat = Object.entries(batch.placements).find(([s, b]) => b === id && !s.startsWith('beasty-'))?.[0]
      if (batch.categoryOnly?.includes(id)) {
        assert(!seat && Object.entries(batch.placements).some(([s, b]) => b === id && s.startsWith('beasty-')), id)
        console.log('ok category-only listing', id)
        continue
      }
      assert(seat, id)
      const city = seat.replace(/-(?:goods|services)2?-\d+$/, '').split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')
      const kind = seat.includes('-services') ? 'services' : 'goods'
      const cityPage = seat.includes('-' + kind + '2-') ? 'More ' + kind : kind[0].toUpperCase() + kind.slice(1)
      await page.getByRole('button', { name: 'Go to the ' + city + ' ' + cityPage + ' page', exact: true }).click()
      await page.locator('.brand-body').waitFor({ state: 'hidden' })
      const cityIcon = icon(listing.name)
      if (await cityIcon.count() > 1) await cityIcon.filter({ hasText: listing.label }).waitFor()
      else await cityIcon.waitFor()
      console.log('ok listing, menu and city', id, count)
    }
    for (const post of active) {
      let owner = post.brand, index = reviewsOf(owner).findIndex(r => r.href === post.source)
      if (post.featured) index = -1
      if (post.playOn) { owner = post.playOn; index = reviewsBy(post.by).findIndex(r => r.href === post.source) }
      const review = index >= 0 ? reviewsOf(owner)[index] : null
      if (review && !review.src) {
        const handle = post.by === 'mr.gaoviet' ? 'msashleyvee' : post.by
        owner = pageOfFoodie(handle); assert(owner, post.code)
        index = reviewsBy(handle).findIndex(r => r.href === post.source)
      }
      await open(owner)
      if (index >= 0) await expand(page.locator('.foodie-review-head').nth(index))
      else await expand(page.locator('.brand-clip-drop > button'))
      const video = page.locator((index < 0 ? '.brand-clip-drop ' : '') + 'video[src="/clips/' + post.slug + '.mp4"]')
      await video.waitFor(); await video.scrollIntoViewIfNeeded()
      await video.evaluate(async v => { v.muted = true; await v.play().catch(e => { if (e.name !== 'AbortError') throw e }) })
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
    } else if (number === 104) {
      await category('Sandwiches', 'Oink & Oscar')
      await category('Breakfast/Diner')
      // The original 24 stay on page one; the new chain is on the linked overflow.
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon('Sweet Maple').waitFor()
    } else if (number === 106) {
      await category('Ceviche', 'Waterfall Cevicheria')
      await category('BIP')
      await page.getByText('BEASTY · BEAST IN PEACE', { exact: true }).waitFor()
      await page.goto(base + '/search', { waitUntil: 'domcontentloaded' })
      await page.getByRole('textbox', { name: 'Dishes, businesses, categories, cities' }).fill('Home of Chicken and Waffles')
      assert.equal(await page.locator('.search-brand').count(), 0)
      for (const id of ['b_plazacafepleasanthill', 'b_hansangtofumilpitas']) {
        await open(id)
        const hero = page.locator('.brand-film video')
        await hero.waitFor()
        assert.equal(await hero.evaluate(v => v.muted), true)
      }
    } else if (number === 108) {
      assert.equal(ALL_PLACEMENTS['beasty-sweets-16'], 'b_scoopnchill')
      const reviews = reviewsOf('b_scoopnchill')
      assert.equal(reviews.length, 4)
      for (const [handle, code] of [['almightyalondra', 'DfakL3GvOwL'], ['bayareafoodz', 'DcM5vOUM5Uo']]) {
        const review = reviews.find(r => r.by === handle && r.href.includes(code))
        assert(review?.src && review.credit.includes('Posted by @scoopnchillberkeley.'))
        assert(reviewsBy(handle).some(r => r.href.includes(code) && r.src))
      }
      assert.equal(brandById('b_scoopnchill').clip, undefined, 'Reviews are not owner hero films')
      await category('Ice Cream', 'Scoop N Chill')
      await icon('Meadowlark Dairy').waitFor()
      await icon('Scoop N Chill').click()
      await page.getByRole('heading', { name: 'Scoop N Chill', exact: true }).waitFor()
      assert.equal(await page.locator('.foodie-review-head').count(), 4)
      await page.getByRole('button', { name: 'Go to the Berkeley Goods page', exact: true }).click()
      await page.locator('.brand-body').waitFor({ state: 'hidden' })
      await icon('Scoop N Chill').waitFor()
    } else if (number === 118) {
      const update = batch.updates[0], b = brandById(update.brand)
      assert.equal(b.hours, update.hours)
      assert.equal(b.orderUrl, update.orderUrl)
      assert.deepEqual(new Set(batch.sourceMessages.flatMap(m => m.attachments)), new Set(batch.artworkDispositions.map(a => a.source)))
      for (const film of update.retainedFilms) {
        assert(REELS.some(r => r.href?.includes(film.code) && r.credit === film.credit && r.src), film.code)
      }
      const displayedHours = page.locator('.brand-hours')
      assert.equal((await displayedHours.innerText()).trim(), update.hours)
      await page.locator('.brand-foot a[href="' + update.site + '"]').waitFor()
      await page.getByRole('button', { name: 'Go to the Berkeley More goods page', exact: true }).click()
      await page.locator('.brand-body').waitFor({ state: 'hidden' })
      await icon(update.name).waitFor()
      await category('BBQ', update.name)
      await icon(update.name).click()
      await page.getByRole('heading', { name: update.name, exact: true }).waitFor()
      await page.setViewportSize({ width: 320, height: 740 })
      assert.equal((await displayedHours.innerText()).trim(), update.hours)
    } else if (number === 117) {
      await category('Wings', 'Wing Bros')
      await icon("Tony's Style").waitFor()
      await category('Seafood/Crab Boil', 'Wing Bros')
      await category('AI', 'Mystery Skool AI')
      assert.equal(ALL_PLACEMENTS['beasty-wings-0'], 'b_wingbros')
      assert.equal(ALL_PLACEMENTS['antioch-goods-8'], 'b_wingbros')
      assert.equal(ALL_PLACEMENTS['beasty-seafood-7'], 'b_wingbros')
      assert.equal(brandById('b_wingbros').orderUrl, 'https://order.toasttab.com/online/wing-bros-8610-brentwood-blvd')
      assert.equal(reviewsOf('b_wingbros').filter(r => r.src).length, 2)
      assert.equal(batch.held.length, 1)
      assert.deepEqual(new Set(batch.sourceMessages.flatMap(m => m.attachments)), new Set(batch.artworkDispositions.map(a => a.source)))
    } else if (number === 116) {
      await category('Filipino Food', 'Ox & Tiger')
      await icon('The Lumpia Company').waitFor()
      await category('Donuts', 'Bun Appétit Donuts')
      await category('Artists', 'Life of Kaiya')
      await category('Pizza')
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon('June’s Pizza').waitFor()
      await category('Sweets')
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon('Bun Appétit Donuts').waitFor()
      assert.equal(ALL_PLACEMENTS['beasty-filipino-0'], 'b_oxandtiger')
      assert.equal(ALL_PLACEMENTS['san-ramon-goods2-0'], 'b_theshishgrill')
      assert.equal(reviewsOf('b_theshishgrill').filter(r => r.src).length, 4)
      assert.deepEqual(new Set(batch.sourceMessages.flatMap(m => m.attachments)), new Set(batch.artworkDispositions.filter(a => (a.reference ?? a.source).startsWith('IMG_')).map(a => a.reference ?? a.source)))
      for (const [i, f] of read('research/roster/batch109.json').foodieOrder.slice(0, 24).entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
    } else if (number === 115) {
      const onPageTwo = async (name, names) => {
        await category(name)
        await page.getByRole('button', { name: 'Next page', exact: true }).click()
        for (const target of names) await icon(target).waitFor()
      }
      await category('Italian', 'Bella Trattoria')
      await category('Adopt/Foster', 'Joybound People & Pets')
      await open('b_joybound')
      await expand(page.getByRole('button', { name: 'Adopt or foster', exact: true }))
      assert.equal(await page.getByRole('link', { name: 'Foster with Joybound' }).getAttribute('href'), 'https://joybound.org/get-involved/foster/')
      await category('Massage/Therapy', 'Sabrina Soto')
      await category('Models', 'Sabrina Soto')
      await category('Korean', 'Um.Ma')
      await icon('Bay Pocha').waitFor()
      await category('Bakery', 'Butter & Crumble')
      await category('Cakes', 'Meowvelous Bakes')
      await icon('Butter & Crumble').waitFor()
      await category('Ice Cream', 'Salt & Straw Bishop Ranch')
      await category('Steakhouse', 'STK Steakhouse San Francisco')
      await category('Ramen', 'Wrap & Slurp Co.')
      await category('Dim Sum', 'Palette Tea House')
      await onPageTwo('Coffee/teas', ['Bonbon Matcha Cupertino', 'Bonbon Matcha Palo Alto'])
      await onPageTwo('Breakfast/Diner', ['Miracle Mile Cafe'])
      await onPageTwo('Burgers/Hot Dogs', ['Beep’s Burgers', 'Ben’s Burger Bay Point'])
      assert.equal(brandById('b_bensburgerbaypoint').needsSite, true)
      assert(brandById('b_frymazing').clip.href.includes('DddBcq1CT-B'))
      assert(reviewsOf('b_frymazing').some(r => r.href.includes('DeiHhp3uzRo') && r.src && r.credit.includes('@carlacharisse_')))
      assert.equal(hash(readFileSync('public/clips/review-DeiHhp3uzRo.mp4')), hash(readFileSync('public/clips/frymazing.mp4')))
      assert(reviewsOf('b_woogakoreanbbq').some(r => r.href.includes('Dfn1kQZhPaP') && r.creatorClip && !r.src))
      assert(reviewsOf('b_wrapnslurp').some(r => r.href.includes('Da_C3sQqfFO') && !r.src))
      assert.equal(REELS.filter(r => r.href?.includes('Dfn-jWPNq8o')).length, 0)
      assert.equal(REELS.filter(r => r.href?.includes('DfThSHUtrVK')).length, 1)
      assert.deepEqual(Object.values(batch.placements).filter(id => id.startsWith('b_saltandstraw')).length, 9)
      assert.deepEqual(new Set(batch.sourceMessages.flatMap(m => m.attachments)), new Set(batch.artworkDispositions.filter(a => (a.reference ?? a.source).startsWith('IMG_')).map(a => a.reference ?? a.source)))
      for (const [i, f] of read('research/roster/batch109.json').foodieOrder.slice(0, 24).entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
    } else if (number === 114) {
      await category('Sweets')
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon('Cinnaholic Berkeley').waitFor()
      for (const name of ['Boba', 'Ice Cream']) {
        await category(name)
        await icon('Devil & Angel Desserts').first().waitFor()
        await page.getByText('Devil & Angel Daly', { exact: true }).waitFor()
        assert.equal(await icon('Devil & Angel Desserts').count(), 2)
      }
      await category('Hot Pot', 'Dragon Beaux')
      await category('Dim Sum', 'Dragon Beaux')
      assert.equal(brandById('b_gregorysgourmetdessertssanramon').clip.href, 'https://www.instagram.com/reel/DfiYI4Ou_SB/')
      assert(reviewsOf('b_gregorysgourmetdessertssanramon').some(r => r.by === 'goutclout' && r.src))
      assert(reviewsOf('b_gregorysgourmetdesserts').some(r => r.by === 'naeemahtravels' && r.src))
      assert(brandById('b_dragonbeaux').clip.credit.includes('@meggyeatz and reposted by @dragonbeaux'))
    } else if (number === 113) {
      await category('Dumplings', 'Dumpling Kitchen')
      await icon('Serious Dumpling').waitFor()
      await category('Burgers/Hot Dogs')
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon('Flats Burgers').waitFor()
      assert.equal(brandById('b_flatsburgers').logo.imageUrl, '/icons/flats-burgers-v113.webp')
      assert.equal(brandById('b_deliboard').logo.imageUrl, '/icons/deli-board-v113.webp')
      assert(reviewsOf('b_deliboard').some(r => r.href.includes('Dfi6sPbRZHy') && r.src))
      assert(reviewsBy('iamnikkieg').some(r => r.href.includes('DflV2movJep') && r.src))
      assert(reviewsOf('b_flatsburgers').some(r => r.href.includes('DflV2movJep') && r.creatorClip && !r.src))
      assert.equal(brandById('b_dumplingkitchenmillbrae').clip.by, undefined)
      assert(brandById('b_dumplingkitchenmillbrae').clip.credit.includes('Original by @dumplingkitchenca'))
    } else if (number === 112) {
      for (const [i, f] of read('research/roster/batch111.json').foodieOrder.slice(0, 24).entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
      for (const f of batch.foodieOrder) assert(brandById(f.brand), f.handle)
      assert.equal(reviewsOf('b_newenglandlobster')[0].by, 'grubwitmike', 'Mike leads the restaurant list')
      assert(reviewsOf('b_newenglandlobster')[0].credit.includes('Home recipe'))
      assert(reviewsOf('b_popbarberkeley').some(r => r.creatorClip && !r.src && r.credit.includes('Anaheim')))
      assert(reviewsOf('b_mikiyasantaclara').some(r => r.creatorClip && !r.src && r.credit.includes('Cerritos')))
      assert(reviewsOf('b_myomyberkeley').some(r => r.by === 'carlaylayyy' && r.credit.includes('@carlacharisse_')))
      assert.equal(brandById('b_onescafebakery').address, '3483 Castro Valley Blvd, Castro Valley, CA')
      assert.equal(brandById('b_onescafealameda').phone, '(510) 501-7946')
      assert.equal(brandById('b_popbarberkeley').hours, undefined)
      for (const id of ['b_popbarberkeley', 'b_shabuclubsanfrancisco', 'b_shabuclubburlingame']) assert(brandById(id).quoteOnly)
      await category('Greek', 'Fork It Pasta To Go')
      await category('Hot Pot', 'Shabu Club')
      await icon('Mikiya Wagyu Shabu House').waitFor()
      await category('Ice Cream', 'Popbar')
      await category('AYCE', 'Hinata Sushi Kitchen')
      await category('Seafood/Crab Boil', 'New England Lobster Market & Eatery')
    } else if (number === 111) {
      for (const [i, f] of read('research/roster/batch109.json').foodieOrder.slice(0, 24).entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
      assert.equal(ALL_PLACEMENTS['beasty-foodies2-0'], 'b_foodiekeyanajoooon')
      assert.equal(ALL_PLACEMENTS['beasty-foodies2-1'], 'b_foodietakeoutwithtuck')
      assert.equal(ALL_PLACEMENTS['beasty-foodies2-2'], 'b_foodiemacmadame')
      assert.equal(brandById('b_fowlfare').clip, undefined)
      assert.equal(brandById('b_almondandoak').clip, undefined)
      assert.equal(brandById('b_fowlfare').hours, undefined, 'conflicting owner hours stay in the panel')
      assert.equal(brandById('b_almondandoak').address, '3311 Grand Ave, Oakland, CA 94610')
      assert.equal(brandById('b_barkandmanewalnutcreek').address, undefined, 'mobile service has no walk-in address')
      assert.equal(brandById('b_acekingbbq').clip.href, 'https://www.instagram.com/reel/DeNbo-hynOi/')
      assert.equal(brandById('b_chronictacosdanville').clip.href, 'https://www.instagram.com/reel/DaJR0QuSWm0/')
      assert(reviewsOf('b_acekingbbq').some(r => r.by === '_whatarethechances_' && r.creatorClip && !r.src))
      assert.equal(reviewsOf('b_penelopescoffeeberkeley').length, 5)
      assert.equal(reviewsOf('b_penelopescoffeeberkeley').filter(r => r.src).length, 4)
      assert(reviewsOf('b_penelopescoffeeberkeley').some(r => r.by === 'rose_buds' && r.creatorClip && !r.src))
      assert(reviewsBy('rose_buds').some(r => r.src === '/clips/review-DaW7vLHJbnZ.mp4'))
      assert(reviewsOf('b_penelopescoffeeberkeley').some(r => r.by === 'echen_eats' && r.credit.includes('Hosted visit') && r.credit.includes('@heykaytea')))
      await category('Chicken Sandwich', 'Fowl + Fare')
      await category('Pets')
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon('Bark & Mane of Walnut Creek').waitFor()
      await open('b_foodiemacmadame')
      await page.getByRole('button', { name: 'Go to the BEASTY More foodies page', exact: true }).click()
      await page.locator('.brand-body').waitFor({ state: 'hidden' })
      await icon('Christy Mac').waitFor()
    } else if (number === 110) {
      const b = brandById('b_simplycakebakery')
      assert.equal(b.clip.src, '/clips/simply-cake-bakery.mp4')
      assert.equal(b.clip.href, 'https://www.instagram.com/reel/De2YbEdSe3w/')
      const reviews = reviewsOf(b.id)
      assert.equal(reviews.length, 6)
      assert.equal(reviews.filter(r => r.src).length, 3)
      const linked = reviews.find(r => r.by === 'bvddiebri')
      assert(linked.creatorClip && !linked.src && linked.credit.includes('Gifted collaboration'))
      assert(reviewsBy('bvddiebri').some(r => r.src === '/clips/review-Dffgm_FBlGk.mp4'))
      for (const [i, f] of read('research/roster/batch107.json').foodieOrder.slice(0, 24).entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
      await open(b.id)
      await expand(page.locator('.foodie-review-head').filter({ hasText: '@bvddiebri' }))
      await page.getByText(linked.credit, { exact: true }).waitFor()
      assert.equal(await page.locator('video[src="/clips/review-Dffgm_FBlGk.mp4"]').count(), 0)
      await open('b_foodiebvddiebri')
      await page.getByRole('button', { name: 'Go to the BEASTY More foodies page', exact: true }).click()
      await page.locator('.brand-body').waitFor({ state: 'hidden' })
      await icon('Bri').waitFor()
    } else if (number === 109) {
      const before = read('research/roster/batch107.json').foodieOrder.slice(0, 24)
      for (const [i, f] of before.entries()) assert.equal(ALL_PLACEMENTS['beasty-foodies-' + i], f.brand)
      assert.equal(ALL_PLACEMENTS['beasty-foodies2-0'], 'b_foodiekeyanajoooon')
      assert.equal(brandById('b_scoopnchill').logo.imageUrl, '/icons/scoop-n-chill-v109.webp')
      assert.equal(brandById('b_scoopnchill').clip.href, 'https://www.instagram.com/reel/DOfOJVwkRC_/')
      assert.equal(brandById('b_arsicaultbakery').clip.href, 'https://www.instagram.com/reel/CtjxpYdM2Ro/')
      assert.equal(reviewsOf('b_scoopnchill').length, 4)
      assert.equal(reviewsOf('b_scoopnchill').filter(r => r.src).length, 3)
      assert(reviewsBy('sisicooksandeats').some(r => r.href.includes('DbKVDKcyf-l') && r.src))
      assert.equal(reviewsOf('b_arsicaultbakery').length, 6)
      assert.equal(reviewsOf('b_arsicaultbakery').filter(r => r.src).length, 3)
      const context = reviewsBy('charlikestoeat').find(r => r.href.includes('DTJ7UZ4Fz_4'))
      assert(context.src && context.credit.includes('Atelier Crenn') && context.credit.includes('not filmed at Arsicault'))
      assert(reviewsBy('charlikestoeat').some(r => r.href.includes('DN9ZjY0AWdD') && r.src && r.credit.includes('b.patisserie and Spruce')))
      assert(reviewsBy('eatswithkath').some(r => r.href.includes('DRi4rO9EXOT') && r.src && r.credit.includes('Mission Bay')))
      assert(reviewsOf('b_thebakedbear').some(r => r.by === 'thesnacksensei' && r.credit.includes('Chase Center')))
      await category('Ice Cream', 'Scoop N Chill')
      await icon('Meadowlark Dairy').waitFor(); await icon('The Baked Bear').waitFor()
      await category('Bakery', 'Arsicault Bakery')
      for (const id of ['b_scoopnchill', 'b_arsicaultbakery']) {
        await open(id)
        const hero = page.locator('.brand-film video')
        await hero.waitFor()
        assert.equal(await hero.evaluate(v => v.muted), true)
      }
    } else if (number === 107) {
      await category('Massage/Therapy', 'Siam Orchid Traditional Thai Massage')
      await category('Meats', 'The Meat Wagon')
      await category('Food Trucks', 'Creole Caviar')
      await category('Catering', 'Creole Caviar')
      await category('Pizza')
      await page.getByRole('button', { name: 'Next page', exact: true }).click()
      await icon("Lo Coco's").waitFor()
      await open('b_thehangoutbreakfast')
      await expand(page.getByRole('button', { name: 'Menu · 104 items', exact: true }))
      assert.equal(await page.locator('.menu-row').count(), 104)
      await open('b_brunchandbloom')
      await expand(page.getByRole('button', { name: 'Menu · 60 items', exact: true }))
      assert.equal(await page.locator('.menu-row').count(), 60)
      for (const id of ['b_qpotsanjose', 'b_lococos', 'b_themeatwagon', 'b_thehangoutbreakfast', 'b_thehangoutpleasanthill', 'b_brunchandbloom']) {
        await open(id)
        const hero = page.locator('.brand-film video')
        await hero.waitFor()
        assert.equal(await hero.evaluate(v => v.muted), true)
      }
    } else if (number === 105) {
      await category('Poke', 'Paku'); await category('Cupcakes', 'Batter ’N Icing')
      await category('Peruvian', 'Lucuma Kitchen & Bar'); await category('Jamaican', 'Sweet Fingers Jamaican Restaurant & Bar')
      await category('Donuts', 'Nono’s Doughnuts & Cafe')
      await category('Food Trucks', 'Vegan Mob')
      await open('b_nonosdoughnutsberkeley')
      await page.getByRole('button', { name: 'Home', exact: true }).click()
      await page.locator('.app-window').waitFor({ state: 'hidden' })
      await page.getByRole('button', { name: 'News', exact: true }).click()
      await page.getByRole('heading', { name: 'Nono’s Doughnuts announces November 12 grand opening', exact: true }).waitFor()
      await page.getByRole('button', { name: 'Open the calendar', exact: true }).click()
      await page.getByRole('button', { name: /^12 November(?:,|$)/ }).click()
      await page.locator('.cal-event').filter({ hasText: 'Nono’s Doughnuts announces' }).click()
      await page.getByRole('heading', { name: 'Nono’s Doughnuts & Cafe', exact: true }).waitFor()
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
