/*
  Runtime audit — the things only a real browser can answer.

  Everything here has already shipped broken in this repo at least once: icons
  that 404 while the page carries on, chrome whose ink is inherited onto a plate
  it cannot be read against, controls with no accessible name, and a grid that
  fits on the viewport the test used and not the one Safari gives a phone.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'

const freePort = () =>
  new Promise((r) => {
    const s = createServer()
    s.listen(0, () => {
      const { port } = s.address()
      s.close(() => r(port))
    })
  })

const port = await freePort()
const srv = spawn('npx', ['vite', 'preview', '--strictPort', '--port', String(port)], {
  stdio: 'ignore',
})
const base = `http://localhost:${port}`
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break
  } catch {
    await new Promise((r) => setTimeout(r, 250))
  }
}

const findings = []
const err = (w) => findings.push(['ERROR', w])
const warn = (w) => findings.push(['WARN', w])
const note = (w) => findings.push(['NOTE', w])

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })

// ---- console and network health -----------------------------------------
const consoleErrors = []
const bad = []
p.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 140))
})
p.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 140)))
p.on('response', (r) => {
  if (r.status() >= 400) bad.push(`${r.status()} ${r.url().replace(base, '')}`)
})

await p.goto(base, { waitUntil: 'networkidle' })
await p.click('[aria-label="Enter BEASTY"]')
await p.waitForTimeout(2800)

// ---- walk every page with the new arrows --------------------------------
const total = await p.evaluate(() => {
  const m = document.querySelector('.page-dots .dot')?.getAttribute('aria-label')?.match(/of (\d+)/)
  return m ? Number(m[1]) : 0
})
note(`${total} pages in the pager`)

const seenHeads = new Set()
for (let i = 0; i < 24; i++) {
  const h = await p.evaluate(
    () => document.querySelector('.home-page-city')?.textContent.trim().replace(/\s+/g, ' ') ?? '',
  )
  if (h) seenHeads.add(h)
  if (await p.isDisabled('.page-step.is-next')) break
  await p.click('.page-step.is-next')
  await p.waitForTimeout(230)
}
note(`stepped through ${seenHeads.size} distinct headings with the arrows`)

// ---- accessible names on every control ----------------------------------
const nameless = await p.evaluate(() =>
  [...document.querySelectorAll('button, a[href], [role="button"]')]
    .filter((n) => n.offsetParent !== null)
    .filter((n) => {
      const name =
        n.getAttribute('aria-label') ||
        n.getAttribute('title') ||
        (n.textContent || '').trim() ||
        n.querySelector('img[alt]')?.getAttribute('alt')
      return !name
    })
    .map((n) => `${n.tagName.toLowerCase()}.${String(n.className).slice(0, 40)}`)
    .slice(0, 12),
)
if (nameless.length) err(`${nameless.length} visible controls have no accessible name: ${nameless.join(', ')}`)

// ---- images that resolved to nothing ------------------------------------
const broken = await p.evaluate(() =>
  [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src).slice(0, 8),
)
if (broken.length) err(`${broken.length} images decoded to nothing: ${broken.join(', ')}`)

// ---- brand pages: a sample across the shapes ----------------------------
const SAMPLE = [
  ['b_magicjuans', 'real offer + booking'],
  ['b_downtownbbq', 'mock offer + clip'],
  ['b_jenuinefitness', 'mock offer + photo'],
  ['b_salathai', 'brand new, contact only'],
  ['b_siacollective', 'online only'],
  ['b_allyvirtual', 'the de-duplicated one'],
]
for (const [id, what] of SAMPLE) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  const st = await p.evaluate(() => ({
    title: document.querySelector('h1, .brand-title, [class*="title"]')?.textContent?.trim() ?? '',
    priced: document.body.innerText.match(/\$\d/g)?.length ?? 0,
    hasMock: !!document.querySelector('.brand-offer-mock'),
    hasOffer: !!document.querySelector('.brand-offer'),
  }))
  if (!st.title) err(`brand page ${id} (${what}) rendered no title`)
  if (st.hasOffer && !st.hasMock) note(`${id} (${what}) shows an offer with NO example-only caveat — verify that is agreed`)
}

await b.close()
srv.kill()

if (consoleErrors.length) err(`${consoleErrors.length} console error(s): ${consoleErrors.slice(0, 3).join(' | ')}`)
if (bad.length) err(`${bad.length} request(s) returned >=400: ${bad.slice(0, 6).join(', ')}`)

const rank = { ERROR: 0, WARN: 1, NOTE: 2 }
findings.sort((a, c) => rank[a[0]] - rank[c[0]])
for (const [lvl, w] of findings) console.log(`${lvl.padEnd(5)} ${w}`)
const errors = findings.filter((f) => f[0] === 'ERROR').length
console.log(`\n${errors} error(s), ${findings.filter((f) => f[0] === 'WARN').length} warning(s)`)
process.exit(errors ? 1 : 0)
