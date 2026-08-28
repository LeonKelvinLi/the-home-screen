/*
  THE LIKE / SAVE / SHARE COUNTS, AND THE ONE PROPERTY THAT MATTERS.

  These numbers get shown to a business owner — the operator's reason for asking
  for them was "It would definitely tell our Affiliates how much users see them
  and like, add to favorites and share their page". So the count has to be how
  many PEOPLE, not how many taps. A number a bored thumb can run up is not
  evidence of anything, and showing it to an affiliate would be a lie with a
  named victim.

  This asserts exactly that: a second tap by the same person removes their like
  rather than adding another, and a genuinely separate visitor adds one.
*/
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { chromium } from 'playwright'
import { freshTestDb } from './pgtest.mjs'

const fail = []
const ok = (c, m) => (c ? console.log(`  PASS  ${m}`) : (fail.push(m), console.log(`  FAIL  ${m}`)))
const free = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })

const port = await free()
const TESTDB = await freshTestDb('signals')
const srv = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'ignore',
  env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development', ALLOW_MOCK_PAYMENTS: '1' },
})
const base = `http://localhost:${port}`
for (let i = 0; i < 100; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const b = await chromium.launch()
const nums = (p) => p.evaluate(() => [...document.querySelectorAll('.brand-act-n')].map((e) => e.textContent))
try {
  const visitor = async () => {
    const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true })
    const p = await ctx.newPage()
    await p.goto(`${base}/?b=b_pawddle`, { waitUntil: 'networkidle' })
    await p.waitForSelector('.brand-acts', { timeout: 15000 })
    await p.waitForTimeout(500)
    return p
  }
  const p1 = await visitor()
  ok(JSON.stringify(await nums(p1)) === '["0","0","0"]', 'a brand nobody has touched shows 0, 0, 0')

  await p1.click('.brand-like'); await p1.waitForTimeout(500)
  ok((await nums(p1))[0] === '1', 'the heart counts a like')

  await p1.click('.brand-like'); await p1.waitForTimeout(500)
  ok((await nums(p1))[0] === '0', 'the SAME person tapping again UNLIKES — it does not count twice')

  await p1.click('.brand-like'); await p1.waitForTimeout(500)
  await p1.click('.brand-star'); await p1.waitForTimeout(500)
  const after = await nums(p1)
  ok(after[0] === '1' && after[1] === '1', 'the star counts a save, independently of the heart')

  const p2 = await visitor()
  ok((await nums(p2))[0] === '1', 'a second visitor SEES the first one’s like — the count is server-side')
  await p2.click('.brand-like'); await p2.waitForTimeout(500)
  ok((await nums(p2))[0] === '2', 'and a genuinely separate person adds exactly one')

  // the tap targets an affiliate's customer has to hit
  const box = await p1.locator('.brand-like').boundingBox()
  ok(box.height >= 44 && box.width >= 44, `the controls stay finger-sized (${Math.round(box.width)}x${Math.round(box.height)})`)
} finally {
  await b.close(); srv.kill()
}

console.log(fail.length ? `\n${fail.length} failed` : '\nPASS: counts are people, not taps.')
process.exit(fail.length ? 1 : 0)
