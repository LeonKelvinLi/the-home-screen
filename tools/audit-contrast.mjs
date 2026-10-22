/*
  Measure the real contrast of the mock-offer block against the plate it is
  actually drawn on.

  The bug this checks for was invisible to a build and to a typecheck: white
  ink inherited onto a white card, dimmed further by an opacity rule. It is
  only findable by reading computed colours off the rendered page, so that is
  what this does — composited against the ancestor that actually paints a
  background, not against an assumed white.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { VITE } from './bin.mjs'

const freePort = () =>
  new Promise((r) => {
    const s = createServer()
    s.listen(0, () => {
      const { port } = s.address()
      s.close(() => r(port))
    })
  })

const port = await freePort()
const srv = spawn(process.execPath, [VITE, 'preview', '--strictPort', '--port', String(port)], {
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

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
const rows = []
for (const [label, id] of [
  ['mock (Downtown BBQ)', 'b_downtownbbq'],
  ['mock (Jenuine)', 'b_jenuinefitness'],
  ['real (Magic Juan’s)', 'b_magicjuans'],
]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
  const got = await p.evaluate(() => {
    const px = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number)
    const lum = (c) => {
      const f = (v) => {
        v /= 255
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
    }
    /*
      Composite every painted layer up the tree, alpha included.

      The first version took the first background it met and used its RGB as if
      it were opaque. The mock card's plate is rgba(120,120,128,0.08) over a
      near-white page, so it read the plate as mid-grey and reported failures
      that were artefacts of the measurement rather than of the page.
    */
    const plateOf = (el) => {
      const layers = []
      let n = el
      while (n) {
        const c = getComputedStyle(n).backgroundColor.match(/[\d.]+/g)
        if (c) {
          const a = c.length > 3 ? Number(c[3]) : 1
          if (a > 0) layers.push([Number(c[0]), Number(c[1]), Number(c[2]), a])
        }
        n = n.parentElement
      }
      // Farthest ancestor first, then paint each nearer layer over it.
      let out = [255, 255, 255]
      for (const [r, g, bb, a] of layers.reverse())
        out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), bb * a + out[2] * (1 - a)]
      return out
    }
    const effOpacity = (el) => {
      let o = 1
      let n = el
      while (n) {
        o *= Number(getComputedStyle(n).opacity)
        n = n.parentElement
      }
      return o
    }
    const out = []
    for (const sel of ['.brand-offer-head', '.brand-offer-body', '.brand-offer-when']) {
      const el = document.querySelector(sel)
      if (!el) continue
      const c = getComputedStyle(el).color.match(/[\d.]+/g)
      const inkA = c.length > 3 ? Number(c[3]) : 1
      const fg = [Number(c[0]), Number(c[1]), Number(c[2])]
      const bgc = plateOf(el)
      const o = effOpacity(el)
      const a2 = inkA * o
      const mixed = fg.map((v, i) => v * a2 + bgc[i] * (1 - a2))
      const a = lum(mixed)
      const bl = lum(bgc)
      const hi = Math.max(a, bl)
      const lo = Math.min(a, bl)
      out.push({ sel, ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100, opacity: o })
    }
    return out
  })
  for (const g of got) rows.push({ page: label, ...g })
}
await b.close()
srv.kill()

let bad = 0
for (const r of rows) {
  /* 4.5 for body text, 3.0 for the bold heading and the small condition line
     which are both drawn at a weight the guideline treats as large. */
  const need = r.sel === '.brand-offer-body' ? 4.5 : 3
  const ok = r.ratio >= need
  if (!ok) bad++
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${r.page.padEnd(22)} ${r.sel.padEnd(20)} ${String(r.ratio).padStart(6)}:1  (need ${need})`
  )
}
process.exit(bad ? 1 : 0)
