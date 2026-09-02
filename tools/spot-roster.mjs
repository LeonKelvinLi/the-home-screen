// Renders roster pages from a running server and prints what a visitor sees:
// the brand's own name in the heading, hours, menu rows, the note. A page
// that shows some other site (a stray port) or no name FAILS — the first
// version of this passed eight pages that were all another agent's viewer.
//
//   BASE=http://localhost:8797 node tools/spot-roster.mjs [id,id,...]
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const base = process.env.BASE ?? 'http://localhost:8787'
const roster = readFileSync(new URL('../src/data/roster.ts', import.meta.url), 'utf8')
// seed('kabab-burger', 'Kabab Burger', ...) — the id is b_ + the slug without hyphens.
const nameOf = (id) => {
  const slug = id.replace(/^b_/, '')
  for (const m of roster.matchAll(/seed\('([a-z0-9-]+)',\s*'((?:[^'\\]|\\.)+)'/g)) if (m[1].replace(/-/g, '') === slug) return m[2].replace(/\\'/g, "'")
  return null
}
const ids = (process.argv[2] ?? 'b_kababburger,b_houseofthai,b_diabloautodetailing,b_soltaqueria,b_eaglepetgrooming,b_jdiautodetailing,b_perfectnineevents,b_alpastorpapi').split(',')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
let bad = 0
for (const id of ids) {
  const res = await page.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const t = await page.evaluate(() => {
    const q = (s) => Array.from(document.querySelectorAll(s)).map((e) => e.textContent.trim()).filter(Boolean)
    return {
      heading: q('h1, h2').slice(0, 3).join(' / '),
      hours: q('.brand-hours').join(' | '),
      rows: q('.menu-item, .menu-row, .brand-item, .svc-item, [class*="item"]').length,
      text: document.body.innerText,
    }
  })
  const want = nameOf(id)
  const first = (want ?? '').split(/[^A-Za-z0-9]+/).filter((w) => w.length > 2)[0] ?? ''
  const ok = res.ok() && want && t.text.includes(first)
  if (!ok) bad++
  console.log(`${ok ? 'ok  ' : 'BAD '} ${id.padEnd(22)} want=${String(want).slice(0, 26).padEnd(26)} hours=${(t.hours || '-').slice(0, 34).padEnd(34)} rows=${String(t.rows).padStart(3)}  ${t.heading.slice(0, 60)}`)
}
await browser.close()
if (!ids.length || bad) { console.log(`FAIL: ${bad} of ${ids.length} pages`); process.exit(1) }
console.log(`PASS: ${ids.length} roster pages render under their own names`)
