/*
  Render the app icon set from the mark the landing page ACTUALLY DRAWS.

  The previous version of this script rebuilt the SVG from constants it scraped
  out of PagesMark.tsx with a regex. That worked while the geometry was four
  literals and broke the moment the mark became a stack and those constants
  became expressions — a silent break, because a regex that matches nothing
  yields NaN and still renders something.

  So it no longer reproduces the mark: it lifts the real one out of the page and
  photographs it. Same component, same renderer, no second copy of the geometry
  to fall out of step. Run against a served build:

    npx vite preview --port 5214
    node tools/icons.mjs http://localhost:5214 public
*/
import { webkit } from 'playwright'
import { writeFileSync } from 'node:fs'

const [origin, out] = process.argv.slice(2)

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
