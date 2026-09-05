/*
  A photo strip of a business's OWN pictures, picked by eye from the contact
  sheet tools/menu-sheet.py drew (numbers are its tile numbers):

    SHEET_DIR=/path/to/sheets npx tsx tools/menu-strip.ts <id> --pick 0,3,4 [--credit "..."]

  Cuts each pick to /food/<slug>-site-<n>.webp (+ -lg) and writes `photos` into
  the record that wins the research merge (research/roster/batch14-menus.json),
  carrying the business's other facts. A hand-written seed gets its accepted
  file updated for tools/menu-paste-local.py to write `photos` into the seed.
*/
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { ROSTER_SEED } from '../src/data/roster'

const args = process.argv.slice(2)
const id = args[0]
const opt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const picks = (opt('--pick') || '').split(',').map((x) => x.trim()).filter(Boolean).map(Number)
const dir = process.env.SHEET_DIR || '.'
const cands = JSON.parse(readFileSync(join(dir, `picks_${id}.json`), 'utf8')) as { n: number; src: string; alt: string; page: string }[]
const seed = ROSTER_SEED.find((s) => `b_${s.slug.replace(/-/g, '')}` === id)
let slug = seed?.slug
if (!slug) { const m = readFileSync('src/data/localBrands.ts', 'utf8').match(/slug: '([a-z0-9-]+)'/g)?.map((x) => x.slice(7, -1)).find((s) => `b_${s.replace(/-/g, '')}` === id); slug = m || id.replace(/^b_/, '') }
const host = (u: string) => { try { return new URL(u).host.replace(/^www\./, '') } catch { return '' } }
const photos: { photo: string; alt: string; credit: string }[] = []
for (const n of picks) {
  const c = cands.find((x) => x.n === n); if (!c) { console.log(`no tile ${n}`); continue }
  const key = `${slug}-site-${n}`
  if (!existsSync(`public/food/${key}.webp`)) {
    const r = spawnSync('python3', ['tools/food-photo.py', c.src, key], { encoding: 'utf8' })
    if (r.status !== 0) { console.log(`  skipped ${n}: ${r.stderr.trim().slice(0, 80)}`); continue }
  }
  photos.push({ photo: key, alt: (c.alt || '').replace(/\s+/g, ' ').trim().slice(0, 120), credit: opt('--credit') || `Their own photo, from ${host(c.page || c.src)}` })
}
console.log(`${id}: ${photos.length} photos`)
if (!photos.length) process.exit(1)
const accPath = `research/menus/accepted/${id}.json`
const acc = existsSync(accPath) ? JSON.parse(readFileSync(accPath, 'utf8')) : { id, items: [] }
acc.photos = photos; writeFileSync(accPath, JSON.stringify(acc, null, 1))
if (!seed) { console.log(`(hand-written seed: python3 tools/menu-paste-local.py ${slug} ${id} writes the photos)`); process.exit(0) }
const rdir = 'research/roster'
let base: any = null
for (const f of readdirSync(rdir).filter((x) => x.endsWith('.json')).sort()) for (const r of JSON.parse(readFileSync(join(rdir, f), 'utf8'))) if (r.id === id) base = r
const rec = { ...(base || { id, name_exact: seed.name, site_kind: 'own-domain', prices_published: false, items: [], flags: [] }), photos }
const bf = join(rdir, 'batch14-menus.json')
const arr = JSON.parse(readFileSync(bf, 'utf8'))
const at = arr.findIndex((r: any) => r.id === id); if (at >= 0) arr[at] = rec; else arr.push(rec)
writeFileSync(bf, JSON.stringify(arr, null, 1))
console.log(`batch14-menus.json: ${arr.length} businesses`)
