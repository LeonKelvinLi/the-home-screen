/*
  Design audit. The things that are wrong on screen rather than wrong in data.

  Everything here has shipped broken in this repo at least once and passed every
  other check while doing it: ink inherited onto a plate it cannot be read
  against, a control whose tap target is smaller than a fingertip, a row whose
  content outgrew its space and slid under a neighbour, text clipped by a box
  sized for shorter text, and a grid that fits the viewport the test used and
  not the one Safari gives a phone.

  Measured on the rendered page, because none of it is visible in the source.
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

const out = []
const err = (w) => out.push(['ERROR', w])
const warn = (w) => out.push(['WARN', w])
const note = (w) => out.push(['NOTE', w])

/* Injected once per page: the measuring kit. Composites real backgrounds and
   real opacity, which is the only way these numbers mean anything. */
const KIT = `
window.__audit = (() => {
  const px = c => (c.match(/[\\d.]+/g) || [0,0,0]).map(Number)
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055) ** 2.4 }
    return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2])
  }
  const plate = el => {
    const layers = []
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n)
      let c = cs.backgroundColor.match(/[\\d.]+/g)
      let a = c && c.length > 3 ? +c[3] : c ? 1 : 0
      /*
        GRADIENTS COUNT. A hero painted with a linear-gradient has a
        backgroundColor of transparent, so reading only that colour walked
        straight past it to the white page behind — and reported a tagline on a
        near-black hero at 1.1:1. The first colour stop is a fair stand-in: it
        is what sits behind the top of the box, which is where the text is.
      */
      if (a === 0 && cs.backgroundImage && cs.backgroundImage !== 'none') {
        const g = cs.backgroundImage.match(/rgba?\\([^)]+\\)/)
        if (g) { c = g[0].match(/[\\d.]+/g); a = c.length > 3 ? +c[3] : 1 }
      }
      if (c && a > 0) layers.push([+c[0], +c[1], +c[2], a])
    }
    let o = [255,255,255]
    for (const [r,g,b,a] of layers.reverse()) o = [r*a+o[0]*(1-a), g*a+o[1]*(1-a), b*a+o[2]*(1-a)]
    return o
  }
  const opacity = el => { let o = 1; for (let n = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o }
  return {
    contrast(sel) {
      /*
        Two exclusions, both because the number would otherwise be a lie.

        EMPTY NODES: the page arrows are buttons whose content is an SVG, so
        their text is "". The contrast of no text is not a fact, and it was
        reporting 2.56:1 on every viewport.

        TEXT OVER MEDIA: a tagline sitting on a business's own reel composites
        against video pixels this walker cannot see, so it read 1.1:1 while
        being perfectly legible over the scrim. Flagged as unmeasurable rather
        than passed or failed — it is a real risk, and the honest thing is to
        say a static check cannot settle it.
      */
      const overMedia = e => {
        for (let n = e; n && n !== document.body; n = n.parentElement)
          if (n.querySelector(':scope > video, :scope > img, :scope > .brand-film, :scope > .reel-scrim')) return true
        return false
      }
      return [...document.querySelectorAll(sel)]
        .filter(e => e.offsetParent !== null)
        .filter(e => (e.textContent || '').trim().length > 0)
        .filter(e => !overMedia(e))
        .map(e => {
        const cs = getComputedStyle(e)
        const c = cs.color.match(/[\\d.]+/g) || [0,0,0]
        const a = (c.length > 3 ? +c[3] : 1) * opacity(e)
        const bg = plate(e)
        const fg = [+c[0]*a + bg[0]*(1-a), +c[1]*a + bg[1]*(1-a), +c[2]*a + bg[2]*(1-a)]
        const hi = Math.max(lum(fg), lum(bg)), lo = Math.min(lum(fg), lum(bg))
        return {
          text: (e.textContent||'').trim().slice(0,26),
          ratio: Math.round(((hi+0.05)/(lo+0.05))*100)/100,
          size: parseFloat(cs.fontSize),
          weight: +cs.fontWeight || 400,
        }
      })
    },
    /* A control's real hit area, pseudo-elements included — several here are a
       small circle with a 44px ::before doing the catching. */
    targets() {
      return [...document.querySelectorAll('button, a[href], [role="button"]')]
        .filter(e => e.offsetParent !== null)
        .map(e => {
          const r = e.getBoundingClientRect()
          let w = r.width, h = r.height
          for (const p of ['::before','::after']) {
            const s = getComputedStyle(e, p)
            if (s.content && s.content !== 'none' && s.position === 'absolute') {
              w = Math.max(w, parseFloat(s.width) || 0)
              h = Math.max(h, parseFloat(s.height) || 0)
            }
          }
          return { name: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0,26),
                   cls: String(e.className).slice(0,26), w: Math.round(w), h: Math.round(h) }
        })
    },
    /* Text cut off by a box built for shorter text. */
    clipped() {
      return [...document.querySelectorAll('*')].filter(e => {
        if (!e.offsetParent || e.children.length) return false
        const cs = getComputedStyle(e)
        if (cs.overflow === 'visible' && cs.textOverflow !== 'ellipsis') return false
        return e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2
      }).map(e => ({ text: (e.textContent||'').trim().slice(0,30), cls: String(e.className).slice(0,26) }))
    },
    /* Two controls drawing on the same pixels. */
    overlaps() {
      const hits = [...document.querySelectorAll('button, a[href]')].filter(e => e.offsetParent !== null)
      const bad = []
      for (let i = 0; i < hits.length; i++) for (let j = i+1; j < hits.length; j++) {
        const a = hits[i].getBoundingClientRect(), b = hits[j].getBoundingClientRect()
        if (a.width < 4 || b.width < 4) continue
        if (hits[i].contains(hits[j]) || hits[j].contains(hits[i])) continue
        const ox = Math.min(a.right,b.right) - Math.max(a.left,b.left)
        const oy = Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top)
        if (ox > 6 && oy > 6) bad.push({
          a: (hits[i].getAttribute('aria-label')||hits[i].textContent||'').trim().slice(0,20),
          b: (hits[j].getAttribute('aria-label')||hits[j].textContent||'').trim().slice(0,20),
          by: Math.round(Math.min(ox,oy)) })
      }
      return bad
    },
    /* The page must never scroll sideways. */
    sideways() {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    },
  }
})()
`

const b = await chromium.launch()

const SIZES = [
  ['iPhone 15 installed', 393, 852],
  ['iPhone 15 in Safari', 393, 690],
  ['iPhone SE in Safari', 375, 553],
  ['iPad', 744, 1133],
]

for (const [label, w, h] of SIZES) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  await p.addInitScript(KIT)
  await p.goto(base, { waitUntil: 'networkidle' })
  await p.click('[aria-label="Enter BEASTY"]')
  await p.waitForTimeout(2900)
  await p.evaluate(KIT)

  const side = await p.evaluate(() => window.__audit.sideways())
  if (side) err(`${label}: the page scrolls sideways`)

  const ov = await p.evaluate(() => window.__audit.overlaps())
  for (const o of ov.slice(0, 4)) err(`${label}: "${o.a}" and "${o.b}" overlap by ${o.by}px`)

  const t = await p.evaluate(() => window.__audit.targets())
  const small = t.filter((x) => Math.min(x.w, x.h) > 0 && Math.min(x.w, x.h) < 44)
  const worst = [...new Map(small.map((x) => [x.cls, x])).values()].sort((a, c) => Math.min(a.w, a.h) - Math.min(c.w, c.h))
  for (const x of worst.slice(0, 4))
    warn(`${label}: "${x.name || x.cls}" hit area ${x.w}x${x.h} — under the 44px minimum`)

  const c = await p.evaluate(() => window.__audit.contrast('.home-page-city, .icon-label, .spotlight, .dock-switch-btn, .page-step'))
  const dim = c.filter((x) => x.ratio < (x.size >= 18 || (x.size >= 14 && x.weight >= 700) ? 3 : 4.5))
  for (const x of dim.slice(0, 4))
    err(`${label}: "${x.text}" at ${x.ratio}:1 (${Math.round(x.size)}px/${x.weight})`)

  const cl = await p.evaluate(() => window.__audit.clipped())
  const uniq = [...new Map(cl.map((x) => [x.cls, x])).values()]
  for (const x of uniq.slice(0, 3)) warn(`${label}: "${x.text}" is clipped (.${x.cls})`)

  note(`${label}: ${t.length} controls, ${small.length} under 44px, ${ov.length} overlaps`)
  await p.close()
}

/* The in-app screens, where most of the reading happens. */
const SCREENS = [
  ['brand page', '/?b=b_downtownbbq', '.brand-body'],
  ['contact-only page', '/?b=b_rywire', '.brand-body'],
]
for (const [label, path, sel] of SCREENS) {
  const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
  await p.addInitScript(KIT)
  await p.goto(base + path, { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  await p.evaluate(KIT)
  if (!(await p.$(sel))) { err(`${label}: did not render`); await p.close(); continue }
  if (await p.evaluate(() => window.__audit.sideways())) err(`${label}: scrolls sideways`)
  /*
    SCOPED TO THE OPEN SCREEN. Measuring every visible text node reported
    fourteen failures at exactly 1:1 — all of them icon labels on the home
    screen BEHIND the brand page, which stays in the DOM while an app is open.
    Text on a screen nobody is looking at is not a contrast bug, and a check
    that cannot tell the difference is a check nobody will trust twice.
  */
  const c = await p.evaluate((root) => window.__audit.contrast(
    `${root} p, ${root} span, ${root} strong, ${root} em, ${root} h1, ${root} h2, ${root} h3, ${root} button, ${root} a`), sel)
  const dim = c.filter((x) => x.text && x.ratio < (x.size >= 18 || (x.size >= 14 && x.weight >= 700) ? 3 : 4.5))
  for (const x of [...new Map(dim.map((x) => [x.text, x])).values()].slice(0, 5))
    err(`${label}: "${x.text}" at ${x.ratio}:1 (${Math.round(x.size)}px/${x.weight})`)
  note(`${label}: ${c.length} text nodes measured, ${dim.length} under threshold`)
  await p.close()
}

await b.close()
srv.kill()

const rank = { ERROR: 0, WARN: 1, NOTE: 2 }
out.sort((a, c) => rank[a[0]] - rank[c[0]])
for (const [lvl, w] of out) console.log(`${lvl.padEnd(5)} ${w}`)
const e = out.filter((x) => x[0] === 'ERROR').length
console.log(`\n${e} error(s), ${out.filter((x) => x[0] === 'WARN').length} warning(s)`)
process.exit(e ? 1 : 0)
