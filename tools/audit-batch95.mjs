import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium, webkit, devices } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { freshTestDb } from './pgtest.mjs'

const read = file => JSON.parse(readFileSync(file))
const hash = data => createHash('sha256').update(data).digest('hex')
const batch = read('research/roster/batch95.json')
const prior = read('research/roster/b86-b94-coverage.json')
const ledger = read('research/roster/b86-b95-coverage.json')
const { ALL_PLACEMENTS } = await tsImport('../src/data/categorySeats.ts', import.meta.url)
const { REELS } = await tsImport('../src/data/clips.ts', import.meta.url)
const { brandById } = await tsImport('../src/data/brands.ts', import.meta.url)
assert.deepEqual(ledger.posts, [...prior.posts, ...batch.posts])
for (const [seat, id] of Object.entries(batch.placements)) assert.equal(ALL_PLACEMENTS[seat], id, seat)
const [post] = batch.posts
const clip = '/clips/' + post.slug + '.mp4'
assert.equal(REELS.filter(r => r.src === clip && r.href === post.source && r.brandId === post.brand).length, 1)
assert.equal(brandById(post.brand).needsSite, true)

const live = process.env.BASE
const db = live ? null : await freshTestDb('batch95')
const port = live ? 0 : await new Promise(resolve => {
  const s = createServer()
  s.listen(0, '127.0.0.1', () => {
    const { port } = s.address()
    s.close(() => resolve(port))
  })
})
const server = live ? null : spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
  stdio: 'ignore',
  env: { ...process.env, DATABASE_URL: db.url, PORT: String(port), NODE_ENV: 'development', RESEND_API_KEY: '', LEAD_EMAIL: '' },
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

async function checkArtwork(path) {
  await page.locator(`.brand-body image[href="${path}"]`).first().waitFor()
  const response = await fetch(base + path)
  assert(response.ok, path)
  assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(readFileSync('public' + path)), path)
}

try {
  if (server) {
    for (let i = 0; i < 120; i++) {
      if (await fetch(base + '/api/health').then(r => r.ok).catch(() => false)) break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
  }
  await page.goto(base + '/?b=' + post.brand, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: post.place, exact: true }).waitFor({ timeout: 20000 })
  assert.equal(await page.locator('.brand-address').textContent(), '408 Barber Lane\nMilpitas, CA 95035')
  await checkArtwork('/icons/uncle-cha-fusion-cafe.webp')
  await page.getByRole('button', { name: 'Menu and ordering', exact: true }).click()
  assert.equal(await page.getByRole('link', { name: /menu on Uber Eats/ }).getAttribute('href'), batch.listings[0].menu)
  const review = page.locator('.foodie-review-head', { hasText: '@foodieberrie' })
  await review.click()
  const video = page.locator(`video.foodie-review-video[src="${clip}"]`)
  await video.waitFor()
  await video.evaluate(async v => { v.muted = true; await v.play() })
  await page.waitForFunction(v => v.muted && v.currentTime > 0.1, await video.elementHandle(), { timeout: 12000 })
  await video.evaluate(v => v.pause())
  await page.getByRole('button', { name: 'See @foodieberrie’s page', exact: true }).click()
  await page.getByRole('heading', { name: '@foodieberrie', exact: true }).waitFor()
  await checkArtwork('/icons/foodie-foodieberrie-v95.webp')
  await page.locator('.foodie-review-head', { hasText: post.place }).click()
  assert(await page.getByRole('button', { name: `Open ${post.place} on BEASTY` }).isVisible())
  assert.deepEqual(errors, [])
  console.log(`PASS Batch 95 on ${iphone ? 'iPhone WebKit' : 'Chrome'}: both seats, menu, artwork, creator link and silent playback`)
} finally {
  await browser.close()
  server?.kill()
  await db?.drop()
}
