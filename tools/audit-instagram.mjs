/*
  THE INSTAGRAM BUTTON, WHICH IS A THING HE SELLS.

  His ask, 2026-08-29: "do you think these pages should have a direct Instagram
  link? If so, we can make it an extra feature on a higher tier membership...
  You don't have to do it to all of them. We just need to put it on a few good
  ones as an example."

  A paid feature that opens a dead profile is worse than no feature, and this
  one is a link to somebody else's account: nobody finds out it is wrong except
  the partner whose page it is on. So every handle is checked against
  Instagram's own rule for what a handle may contain, every page that carries
  one is opened, and the href is compared against the handle character for
  character rather than merely being present.

  It also guards the bug this feature replaced. Eight seeds carried
  `siteNote: 'Instagram at <handle>'`, and the footer renders siteNote's text
  inside a link to the business's WEBSITE — so eight pages said Instagram and
  went somewhere else. No seed may carry that shape again.
*/
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { readFileSync } from 'node:fs'
import { freshTestDb } from './pgtest.mjs'

const fails = []
const src = readFileSync('src/data/localBrands.ts', 'utf8')

/* Instagram's own rule: letters, digits, full stops and underscores, up to 30.
   Anything else is a typo, and a typo here is a link to nobody. */
const HANDLE = /^[A-Za-z0-9._]{1,30}$/

const seeds = []
for (const block of src.split(/\n  \{\n/)) {
  const slug = block.match(/slug: '([^']+)'/)?.[1]
  const ig = block.match(/instagram: '([^']*)'/)?.[1]
  const name = block.match(/\n    name: '([^']+)'/)?.[1]
  if (slug && ig !== undefined) seeds.push({ slug, ig, name, id: `b_${slug.replace(/-/g, '')}` })
}
console.log(`handles       : ${seeds.length}`)
for (const s of seeds) {
  console.log(`  ${s.id.padEnd(24)} @${s.ig}`)
  if (!HANDLE.test(s.ig)) fails.push(`${s.slug}: "${s.ig}" is not a usable Instagram handle`)
}
if (!seeds.length) fails.push('no seed carries an Instagram handle — the feature is wired to nothing')

/* The shape that lied. */
for (const file of ['src/data/localBrands.ts', 'src/data/roster.ts', 'src/data/brands.ts']) {
  const bad = readFileSync(file, 'utf8').match(/siteNote: '[^']*Instagram at [^']*'/g)
  if (bad) fails.push(`${file} still routes an Instagram note through siteNote, which links to the website: ${bad.join(' | ')}`)
}

const TESTDB = await freshTestDb('instagram')
const freePort = () => new Promise((r) => { const s = createServer(); s.listen(0, () => { const { port } = s.address(); s.close(() => r(port)) }) })
const port = await freePort()
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: 'ignore', env: { ...process.env, PORT: String(port), DATABASE_URL: TESTDB.url, NODE_ENV: 'development' } })
const base = `http://localhost:${port}`
for (let i = 0; i < 80; i++) { try { if ((await fetch(base + '/api/health')).ok) break } catch { await new Promise((r) => setTimeout(r, 250)) } }

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })
const bad = []
p.on('response', (r) => { const l = `${r.status()} ${r.url().replace(base, '')}`; if (r.status() >= 400 && l !== '401 /api/members/me') bad.push(l) })

for (const s of seeds) {
  await p.goto(`${base}/?b=${s.id}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(400)
  const row = await p.evaluate(() => {
    const a = document.querySelector('.brand-ig')
    if (!a) return null
    const r = a.getBoundingClientRect()
    a.scrollIntoView({ block: 'center' })
    const r2 = a.getBoundingClientRect()
    const hit = document.elementFromPoint(r2.left + r2.width / 2, r2.top + r2.height / 2)
    return {
      href: a.getAttribute('href'),
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel'),
      text: a.textContent.replace(/\s+/g, ' ').trim(),
      h: Math.round(r.height),
      onTop: a.contains(hit) || a === hit,
      count: document.querySelectorAll('.brand-ig').length,
      title: document.querySelector('h1')?.textContent?.trim() ?? null,
    }
  })
  if (!row) { fails.push(`${s.id} carries @${s.ig} and renders no Instagram button`); continue }
  const want = `https://www.instagram.com/${s.ig}/`
  console.log(`${s.id.padEnd(24)} ${row.h}px  ${row.href === want ? 'href ok' : 'HREF ' + row.href}  ${row.onTop ? 'hittable' : 'COVERED'}`)
  if (row.href !== want) fails.push(`${s.id}: href is ${row.href}, expected ${want}`)
  if (row.count !== 1) fails.push(`${s.id}: ${row.count} Instagram buttons on one page`)
  if (row.h < 44) fails.push(`${s.id}: the button is ${row.h}px, under the 44px minimum`)
  if (!row.onTop) fails.push(`${s.id}: something is painted over the Instagram button`)
  if (row.target !== '_blank' || !/noreferrer/.test(row.rel ?? '')) fails.push(`${s.id}: the link does not open safely in a new tab`)
  if (!row.text.includes(`@${s.ig}`)) fails.push(`${s.id}: the button does not show the handle it links to`)
}

/* A page with no handle must not grow one. */
await p.goto(`${base}/?b=b_magicjuans`, { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
const stray = await p.evaluate(() => document.querySelectorAll('.brand-ig').length)
console.log(`no-handle page: ${stray} buttons`)
if (stray !== 0) fails.push(`a brand with no handle rendered ${stray} Instagram buttons`)
if (bad.length) fails.push('failed requests: ' + [...new Set(bad)].join(', '))

await b.close(); srv.kill(); await TESTDB.drop?.()
if (fails.length) { console.log('\nFAIL: ' + fails.join('; ')); process.exit(1) }
console.log(`\nPASS: ${seeds.length} pages carry a checked handle, each linking to the account it names.`)
