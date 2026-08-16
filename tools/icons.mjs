/*
  Render the app icon set from the mark the landing page ACTUALLY DRAWS.

  The previous version of this script rebuilt the SVG from constants it scraped
  out of PagesMark.tsx with a regex. That worked while the geometry was four
  literals and broke the moment the mark became a stack and those constants
  became expressions — a silent break, because a regex that matches nothing
  yields NaN and still renders something.

  So it no longer reproduces the mark: it lifts the real one out of the page and
  photographs it. Same component, same renderer, no second copy of the geometry
  to fall out of step.

    npm run icons

  It serves the build itself on a port it has just confirmed is free, rather
  than being handed one. The first version of this wanted a preview server
  started separately and a port passed in, which failed twice in a row the only
  time anyone ran it: the port was already taken so vite silently moved to the
  next one, and backgrounding the server meant the render started before it was
  listening. A tool run once every few months should not need either of those
  to go right.
*/
import { webkit } from 'playwright'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public')

/** A port the OS has just told us is free, rather than one we hoped was. */
const freePort = () =>
  new Promise((resolve, reject) => {
    const s = createServer()
    s.on('error', reject)
    s.listen(0, () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })

const port = await freePort()
const preview = spawn(
  'npx',
  ['vite', 'preview', '--port', String(port), '--strictPort'],
  { cwd: ROOT, stdio: 'ignore' },
)
/* --strictPort so it fails loudly rather than drifting to another port and
   leaving this script talking to nothing. */
process.on('exit', () => preview.kill())

const origin = `http://localhost:${port}`
for (let i = 0; ; i++) {
  try {
    const r = await fetch(origin + '/')
    if (r.ok) break
  } catch {
    /* not listening yet */
  }
  if (i > 60) throw new Error(`vite preview never came up on ${port}`)
  await new Promise((r) => setTimeout(r, 250))
}
const out = OUT

/*
  `pad` is the margin of bare yellow around the mark, as a percentage.

  Zero for the browser icons: they are shown at the size they are given. The
  maskable one gets 11% on every side, because Android crops it to whatever
  shape the launcher fancies — circle, squircle, teardrop — and only the middle
  80% is guaranteed to survive. Full bleed there would cut the turned corner
  off, which is the one part of the mark carrying the brand.
*/
const SIZES = [
  ['apple-touch-icon.png', 180, 0],
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['icon-maskable-512.png', 512, 11],
]

const browser = await webkit.launch()
const ctx = await browser.newContext({ viewport: { width: 600, height: 900 } })
const page = await ctx.newPage()
await page.goto(origin + '/', { waitUntil: 'load' })

/* The mark only exists once the screen is ours — before that the dialer shows
   a bare cut-out, deliberately, since a stock iPhone has no business wearing
   the brand. Wait for the real thing rather than for a timeout. */
await page.waitForFunction(() => !!document.querySelector('.dialer-biggie-mark'), null, {
  timeout: 40000,
})
const svg = await page.evaluate(() => {
  const el = document.querySelector('.dialer-biggie-mark')
  el.removeAttribute('class')
  return el.outerHTML
})

for (const [name, size, pad] of SIZES) {
  const c = await browser.newContext({ viewport: { width: size, height: size } })
  const p = await c.newPage()
  /*
    Navigated to the app's own origin, not about:blank, before the body is
    replaced. The mark references /biggie.webp by absolute path; on a blank
    page that resolves to nothing and the icon renders as an empty sheet.
  */
  await p.goto(origin + '/', { waitUntil: 'load' })
  await p.evaluate(
    ({ svg, pad }) => {
      document.head.querySelectorAll('style,link[rel=stylesheet]').forEach((n) => n.remove())
      document.body.innerHTML = `
        <div style="position:fixed;inset:0;background:linear-gradient(180deg,#F3DB40,#E9C825)">
          <div style="position:absolute;inset:${pad}%">${svg}</div>
        </div>`
      const s = document.querySelector('svg')
      s.setAttribute('width', '100%')
      s.setAttribute('height', '100%')
      s.style.display = 'block'
    },
    { svg, pad },
  )
  await p.waitForTimeout(350)
  writeFileSync(`${out}/${name}`, await p.screenshot())
  console.log(`${name.padEnd(24)} ${size}x${size}${pad ? `  (inset ${pad}%)` : ''}`)
  await c.close()
}
await browser.close()
preview.kill()

/*
  STAMP THE ICON URLS WITH THE PICTURE'S OWN HASH.

  iOS snapshots apple-touch-icon at the moment a shortcut is added to the home
  screen and never looks at it again, and browsers cache it hard besides. So the
  operator was still looking at a three-layer stack on his phone days after the
  mark became one page — the file on the server was right the whole time, and
  nothing about it had changed identity, so nothing went and got it.

  A hash of the rendered icon in the query string fixes the half that can be
  fixed: the URL changes exactly when the picture changes, never otherwise, so
  caches refetch and a re-add picks up the new art. An already-installed
  shortcut still has to be removed and re-added — that part is iOS and there is
  no trick for it.

  Written by the tool rather than bumped by hand, because a version anyone has
  to remember is a version that will be forgotten on the run that matters.
*/
const stamp = createHash('sha256')
  .update(readFileSync(`${OUT}/apple-touch-icon.png`))
  .digest('hex')
  .slice(0, 8)

for (const file of [`${ROOT}/index.html`, `${OUT}/manifest.webmanifest`]) {
  const before = readFileSync(file, 'utf8')
  const after = before.replace(
    /(\/(?:apple-touch-icon|icon-192|icon-512|icon-maskable-512)\.png)(\?v=[a-f0-9]+)?/g,
    `$1?v=${stamp}`,
  )
  if (after !== before) {
    writeFileSync(file, after)
    console.log(`stamped ${file.split('/').pop()} v=${stamp}`)
  }
}
