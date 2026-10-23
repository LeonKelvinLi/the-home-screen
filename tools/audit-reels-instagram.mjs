/* The reels window, Instagram's way (Leon, 2026-10-22: "like instagram", "randomize the video feed scroll").
   The order changes from one opening to the next; every reel has the rail (like, share) and the avatar row;
   a double tap likes without touching the sound; a like survives the next opening; the heading is Glenn's. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
const port = await new Promise((r) => { const s = createServer(); s.listen(0, '127.0.0.1', () => { const n = s.address().port; s.close(() => r(n)) }) })
const srv = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--strictPort', '--port', String(port)], { stdio: 'ignore' })
const base = `http://localhost:${port}`
for (let i = 0; i < 60; i++) { try { if ((await fetch(base)).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 } })
const fails = []
const check = (name, ok) => { console.log(`${ok ? 'ok' : 'FAIL'} ${name}`); if (!ok) fails.push(name) }
const openReels = async () => {
  await p.goto(base, { waitUntil: 'networkidle' })
  await p.locator('[aria-label="Enter BEASTY"], [aria-label*="Watch"]').first().waitFor({ timeout: 20000 })
  const enter = p.locator('[aria-label="Enter BEASTY"]')
  if (await enter.count()) await enter.click()
  await p.locator('[aria-label*="Watch"]').first().click()
  await p.locator('.reel').first().waitFor({ timeout: 15000 })
  await p.waitForTimeout(1200)
  return p.locator('.reel').evaluateAll((a) => a.map((s) => s.getAttribute('aria-label').split(', video')[0]))
}
try {
  const first = await openReels()
  check(`the reels window is headed "Explore hidden gems 💎"`, (await p.locator('.nav-title, h1').allInnerTexts()).some((t) => t.includes('Explore hidden gems')))
  const counts = await p.evaluate(() => ({
    reels: document.querySelectorAll('.reel').length,
    likes: document.querySelectorAll('.reel-rail .reel-like').length,
    shares: document.querySelectorAll('.reel-rail .reel-share').length,
    names: document.querySelectorAll('.reel-who .reel-name').length,
    progress: document.querySelectorAll('.reel-progress').length,
  }))
  check(`every reel has a like and a share in the rail, a name row and a progress line (${counts.reels})`,
    counts.reels > 1 && counts.likes === counts.reels && counts.shares === counts.reels && counts.names === counts.reels && counts.progress === counts.reels)
  const muted = () => p.evaluate(() => document.querySelector('.reel video').muted)
  const before = await muted()
  const box = await p.locator('.reel').first().boundingBox()
  await p.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2)
  await p.waitForTimeout(150)
  check('a double tap shows the heart', (await p.locator('.reel-burst').count()) === 1)
  await p.waitForTimeout(500)
  check('a double tap likes the reel', (await p.locator('.reel').first().locator('.reel-like.is-on').count()) === 1)
  check('a double tap leaves the sound alone', (await muted()) === before)
  const liked = await p.locator('.reel').first().getAttribute('aria-label')
  /* Three more openings: the chance a fresh shuffle repeats the first four of 200 is nil. */
  let changed = false
  for (let i = 0; i < 3 && !changed; i++) changed = (await openReels()).slice(0, 4).join('|') !== first.slice(0, 4).join('|')
  check('the feed comes in a new order on the next opening', changed)
  const again = await openReels()
  check('the same reels, only reordered', again.length === first.length && [...again].sort().join('|') === [...first].sort().join('|'))
  const name = liked.split(', video')[0]
  const isLiked = await p.locator('.reel', { has: p.locator(`.reel-name:text-is(${JSON.stringify(name)})`) }).first().locator('.reel-like.is-on').count()
  check('a like is still there on the next opening', isLiked === 1)
} catch (e) { fails.push(e.message); console.log('FAIL', e.stack) } finally { await b.close(); srv.kill() }
if (fails.length) { console.log(`FAIL: ${fails.length} reels checks`); process.exit(1) }
console.log('PASS: the reels window is Instagram-shaped, shuffles each opening, and double-tap likes stick.')
