import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, openSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const read = path => JSON.parse(readFileSync(path))
const batch = read('research/roster/batch93.json')
const ledger = read('research/roster/b86-b93-coverage.json')
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
const { OTHER_REVIEWS } = await tsImport('../src/data/foodies.ts', import.meta.url)
const prior = read('research/roster/b86-b92-coverage.json')
assert.deepEqual(ledger.posts.slice(0, prior.posts.length), prior.posts)
assert.equal(new Set(ledger.posts.map(p => p.code)).size, 119)
assert.equal(batch.posts.length, 5)
for (const [seat, id] of Object.entries({ ...batch.baseline.seats, ...batch.placements })) {
  assert.equal(ALL_PLACEMENTS[seat], id, seat)
}
for (const src of batch.baseline.watch) assert(REELS.some(r => r.src === src), src)
for (const post of batch.posts) {
  if (post.slug) {
    const copies = REELS.filter(r => r.src === `/clips/${post.slug}.mp4`)
    assert.equal(copies.length, 1, post.code)
    assert.equal(copies[0].href, post.source)
  } else {
    assert(post.reason, post.code)
    assert(OTHER_REVIEWS.some(r => r.reel === post.source && !r.clip), post.code)
  }
}

const live = process.env.BASE
const db = live ? null : await freshTestDb('batch93')
const port = live ? 0 : await new Promise(resolve => {
  const server = createServer()
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address()
    server.close(() => resolve(port))
  })
})
mkdirSync('.verify', { recursive: true })
const server = live ? null : spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: ['ignore', openSync('.verify/batch93-server.log', 'a'), openSync('.verify/batch93-server.log', 'a')],
  env: { ...process.env, PORT: String(port), DATABASE_URL: db.url, NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
})
const base = live || `http://127.0.0.1:${port}`
const iphone = process.env.BROWSER === 'webkit'
const browser = await (iphone ? webkit : chromium).launch()
const page = await browser.newPage({ ...(iphone ? devices['iPhone 13'] : {}), viewport: { width: 393, height: 852 } })
const errors = []
page.on('pageerror', e => errors.push(String(e)))
try {
  if (server) {
    for (let i = 0; i < 120; i++) {
      if (await fetch(base + '/api/health').then(r => r.ok).catch(() => false)) break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
  const opens = new Set([
    ...Object.values(batch.placements).filter(id => !id.startsWith('b_foodie')),
    ...batch.posts.map(p => p.brand).filter(Boolean),
  ])
  for (const id of opens) {
    await page.goto(base + '/?b=' + id, { waitUntil: 'domcontentloaded' })
    await page.locator('.brand-body').waitFor()
    assert(await page.locator('h1').first().textContent(), id)
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), id)
    if (id === 'b_woogakoreanbbq') {
      for (const { code, by } of batch.posts.filter(post => post.brand === id)) {
        const review = page.locator('.foodie-review-head', { hasText: '@' + by })
        await review.scrollIntoViewIfNeeded()
        await review.click()
        const expanded = review.and(page.locator('[aria-expanded="true"]'))
        // WebKit can consume the first tap while the phone sheet finishes opening.
        if (!await expanded.waitFor({ state: 'visible', timeout: 1500 }).then(() => true, () => false)) {
          if (await review.getAttribute('aria-expanded') === 'false') await review.click()
          await expanded.waitFor({ state: 'visible' })
        }
        const video = page.locator(`video[src$="review-${code}.mp4"]`).first()
        await video.scrollIntoViewIfNeeded()
        await video.evaluate(v => { v.preload = 'metadata'; v.load() })
        const handle = await video.elementHandle()
        await page.waitForFunction(v => v.readyState >= 1, handle, { polling: 100 })
        if (iphone) await video.click()
        else await video.press('Space')
        await page.waitForFunction(v => v.currentTime > 0.1, handle, { polling: 100 })
        await video.evaluate(v => v.pause())
      }
    }
    if (id === 'b_rywire') {
      await page.locator('.brand-clip-drop > .menu-picks-bar').click()
      const video = page.locator('video.brand-clip-video[src$="rywire-charis-sema.mp4"]')
      await video.scrollIntoViewIfNeeded()
      await video.locator('xpath=ancestor::figure').getByRole('button', { name: 'Turn the sound on' }).click()
      await page.waitForFunction(v => v.currentTime > 0.1, await video.elementHandle(), { polling: 100 })
    }
    console.log('ok phone page', id)
  }
  for (const post of batch.posts.filter(p => p.slug)) {
    const response = await fetch(base + `/clips/${post.slug}.mp4`, { headers: { Range: 'bytes=0-31' } })
    assert.equal(response.status, 206, post.code)
    assert.match(response.headers.get('content-type'), /video\/mp4/, post.code)
    assert.equal((await response.arrayBuffer()).byteLength, 32, post.code)
  }
  await page.goto(base + '/?b=b_foodiesiliconvalleyfoodies', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /^Enlarge .* logo$/ }).click()
  const artwork = page.locator('.brand-logo-dialog img[src$="foodie-siliconvalley-foodies-v93.webp"]')
  await artwork.waitFor()
  assert(await artwork.evaluate(img => img.complete && img.naturalWidth === 512))
  await page.getByRole('button', { name: /^Restore .* logo size$/ }).click()
  assert.equal(await artwork.count(), 0)
  assert.deepEqual(errors, [])
  console.log(`PASS Batch 93 on ${iphone ? 'WebKit' : 'Chromium'}: ${opens.size} pages, 5 posts, and all local films`)
} finally {
  await browser.close()
  server?.kill()
  await db?.drop()
}
