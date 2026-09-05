/*
  Take a reviewed candidate file and make it real: filter, cut the photos,
  and write the research batch entry the ingest reads.

    npx tsx tools/menu-accept.ts <id> [--drop rx] [--keep rx] [--sections "A,B"]
        [--rename "Old=New;Old2=New2"] [--max N] [--no-photos] [--note "..."]
        [--from text|json|square|jsonld|pdf] [--desc-max 160]

  Alcohol never passes (no age check in the app). Writes
  research/menus/accepted/<id>.json and upserts research/roster/batch14-menus.json,
  carrying the business's existing facts from the earlier batches. An id that
  is not on the roster (a hand-written seed in localBrands.ts) gets a tuple
  block printed instead, to paste.
*/
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { ROSTER_SEED } from '../src/data/roster'

const args = process.argv.slice(2)
const id = args[0]
const opt = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const drop = opt('--drop') ? new RegExp(opt('--drop')!, 'i') : null
const keep = opt('--keep') ? new RegExp(opt('--keep')!, 'i') : null
const sections = opt('--sections')?.split(',').map((s) => s.trim()).filter(Boolean)
const rename = Object.fromEntries((opt('--rename') || '').split(';').filter(Boolean).map((p) => p.split('=').map((x) => x.trim())))
const max = Number(opt('--max') || 200)
const descMax = Number(opt('--desc-max') || 160)
const noPhotos = args.includes('--no-photos')

const cand = JSON.parse(readFileSync(`research/menus/cand/${id}.json`, 'utf8'))
const ALC = /\b(beer|cerveza|lager|ale|wine|cocktail|margarita|mimosa|sake|soju|ipa|lager|pilsner|stout|tequila|vodka|whiskey|whisky|bourbon|rum|gin|mezcal|champagne|prosecco|sangria|seltzer|michelada|bloody mary|spritz|negroni|old fashioned|mule|paloma|cider|bottle|draft|draught|shots?)\b/i
const ALCSEC = /beer|wine|cocktail|sake|spirits|liquor|bar\b|drinks? menu|happy hour|alcohol|bottles/i
const MOD = /^(add|extra|substitute|sub\b|upgrade|make it|choice of|choose)/i

let items = (opt('--use') ? cand.alts?.[opt('--use')!] || [] : cand.items) as any[]
/* An alternate source has no pictures of its own; the page's item cards do.
   Same name, same dish: the card's photo comes across. */
if (opt('--use')) {
  const n = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const withImg = new Map((cand.items as any[]).filter((i) => i.image).map((i) => [n(i.name), i.image]))
  for (const i of items) if (!i.image && withImg.has(n(i.name))) i.image = withImg.get(n(i.name))
}
/* Unsectioned items get the name given with --nosec, or drop when told to. */
const nosec = opt('--nosec')
for (const i of items) if (!i.section && nosec) i.section = nosec === 'drop' ? '__drop__' : nosec
items = items.filter((i) => i.section !== '__drop__')
/* Shouted headings read as shouting in a list of quiet rows. */
const titleCase = (t: string) => t.replace(/\w\S*/g, (w, at) => (at > 0 && /^(and|or|the|of|a|an|with|by|de|la|el|y)$/i.test(w) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
for (const i of items) {
  if (i.section) i.section = i.section.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim()
  if (i.section && /^[^a-z]*$/.test(i.section) && /[A-Z]{3}/.test(i.section)) i.section = titleCase(i.section)
  if (/^[^a-z]*$/.test(i.name) && /[A-Z]{3}/.test(i.name)) i.name = titleCase(i.name)
  i.name = i.name.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s*[>*]+\s*$/, '').replace(/\s+/g, ' ').trim()
  if (i.section) i.section = i.section.replace(/\s*[>*]+\s*$/, '').trim()
}
if (opt('--from')) items = items.filter((i) => i.src === opt('--from') || (i.src || '').startsWith(opt('--from')!))
if (args.includes('--cards-only')) items = items.filter((i) => i.image)
items = items.filter((i) => /[A-Za-z]{2}/.test(i.name) && !/\$/.test(i.name) && !/^(half|full|small|medium|large|glass|bottle|pint|single|double|regular|with |in a |in an )/i.test(i.name))
items = items.filter((i) => !i.alcohol && !ALC.test(i.name) && !ALCSEC.test(i.section || '') && !MOD.test(i.name))
if (drop) items = items.filter((i) => !drop.test(i.name) && !drop.test(i.section || ''))
if (keep) items = items.filter((i) => keep.test(i.name) || keep.test(i.section || ''))
if (sections) items = items.filter((i) => sections.some((s) => (i.section || '').toLowerCase() === s.toLowerCase()))
/* --rename-rx "nigiri=Nigiri;roll|maki=Rolls": a pattern over the section
   name, for pages that made every dish its own heading. Exact renames win. */
const renameRx = (opt('--rename-rx') || '').split(';').filter(Boolean).map((p) => { const at = p.lastIndexOf('='); return [new RegExp(p.slice(0, at), 'i'), p.slice(at + 1)] as const })
const renameLC = Object.fromEntries(Object.entries(rename).map(([k, v]) => [k.toLowerCase().replace(/\s+/g, ' '), v]))
for (const i of items) {
  const k = (i.section || '').toLowerCase().replace(/\s+/g, ' ')
  if (i.section && renameLC[k]) i.section = renameLC[k]
  else if (i.section) { const hit = renameRx.find(([rx]) => rx.test(i.section)); if (hit) i.section = hit[1] }
  if (i.section === '') i.section = undefined
}
/* Toast pages print each dish's name once as a heading and once in its card,
   so a dish becomes a one-item section of itself. Such a section is not a
   section: the dish belongs to the last real heading above it. */
{
  const n = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const count = new Map<string, number>()
  for (const i of items) if (i.section) count.set(i.section, (count.get(i.section) || 0) + 1)
  /* A one-item "section" with a proper-noun name over a bare descriptive
     line — "Tocilog" over "Sweet pork tocino" — is a dish whose name the
     page set as a heading. The heading is the name; the line is its
     description. Generic headings (Sides, Drinks...) are left alone. */
  const GENERIC = /appetizer|starter|entree|entrée|main|side|dessert|sweet|drink|beverage|salad|soup|special|kid|combo|plate|bowl|burrito|taco|pizza|pasta|sandwich|noodle|rice|roll|sushi|nigiri|sashimi|tea|coffee|smoothie|breakfast|lunch|dinner|brunch|menu|snack|wing|chicken|meat|bbq|catering|family|pack|box|tray|extra|add|topping|sauce|dip|bread|shake|juice|water|soda|other|misc|new|feature|popular|favorite/i
  for (const i of items) if (i.section && count.get(i.section) === 1 && !i.desc && !GENERIC.test(i.section) && n(i.section) !== n(i.name) && i.section.length <= 40) { i.desc = i.name; i.name = i.section; i.section = '__collapse__' }
  let last: string | undefined
  for (const i of items) {
    if (i.section === '__collapse__') i.section = last
    else if (i.section && (n(i.section) === n(i.name) || (count.get(i.section) === 1 && n(i.desc || '').includes(n(i.section))))) i.section = last
    else if (i.section && count.get(i.section)! <= 2 && items.some((o) => o !== i && n(o.name) === n(i.section!))) i.section = last
    else last = i.section
  }
}
const seen = new Set<string>()
items = items.filter((i) => { const k = i.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true }).slice(0, max)
const trim = (d: string) => { d = (d || '').replace(/\s+/g, ' ').trim(); if (d.length <= descMax) return d; const cut = d.slice(0, descMax); const at = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(', ')); return (at > 60 ? cut.slice(0, at) : cut.replace(/\s\S*$/, '')).replace(/[,;:]$/, '') }

const seed = ROSTER_SEED.find((s) => `b_${s.slug.replace(/-/g, '')}` === id)
const slug = seed?.slug || id.replace(/^b_/, '')
const keyOf = (n: string) => `${slug}-${n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}`

mkdirSync('research/menus/accepted', { recursive: true })
const out = items.map((i) => ({ name: i.name.replace(/\s+/g, ' ').trim(), desc: trim(i.desc), cents: i.cents, label: i.label, section: i.section, image: noPhotos ? undefined : i.image, photo: !noPhotos && i.image ? keyOf(i.name) : undefined }))

// Photos: the business's own pictures, cut to the two sizes the menu reads.
async function cut(url: string, key: string) {
  if (existsSync(`public/food/${key}.webp`)) return true
  return new Promise<boolean>((res) => { const p = spawn('python3', ['tools/food-photo.py', url, key], { stdio: ['ignore', 'ignore', 'pipe'] }); let err = ''; p.stderr.on('data', (d) => (err += d)); p.on('close', (c) => { if (c !== 0) console.log(`  photo skipped ${key}: ${err.trim().slice(0, 80)}`); res(c === 0) }) })
}
const todo = out.filter((i) => i.image && i.photo)
let n = 0, ok = 0
await Promise.all(Array.from({ length: 6 }, async () => { while (n < todo.length) { const i = todo[n++]; if (await cut(i.image!, i.photo!)) ok++; else i.photo = undefined } }))
for (const i of out) delete (i as any).image
console.log(`${id}: ${out.length} items, ${ok} photos cut, sections: ${[...new Set(out.map((i) => i.section).filter(Boolean))].join(' | ') || '(one list)'}`)
writeFileSync(`research/menus/accepted/${id}.json`, JSON.stringify({ id, source: cand.source, pages: cand.pages, items: out }, null, 1))

if (!seed) {
  const tuple = out.map((i) => JSON.stringify(i.label ? [i.name, i.desc, i.cents, i.photo || null, i.label] : i.photo ? [i.name, i.desc, i.cents, i.photo] : [i.name, i.desc, i.cents]))
  console.log(`(not a roster id — paste into localBrands.ts)\n` + tuple.map((t) => '      ' + t + ',').join('\n'))
  process.exit(0)
}
// Upsert into batch14, carrying the facts already researched for this business.
const dir = 'research/roster'
let base: any = null
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json') && !x.startsWith('batch14')).sort()) { for (const r of JSON.parse(readFileSync(join(dir, f), 'utf8'))) if (r.id === id) base = r }
const platform = /toasttab/.test(cand.pages[0]) ? 'Toast' : /square\.site/.test(cand.pages[0]) ? 'Square' : /cloveronline/.test(cand.pages[0]) ? 'Clover' : ''
const src = cand.pages.find((p: string) => /order|menu/i.test(p)) || cand.pages[0]
const note = opt('--note') || (platform ? `prices and photos are from their own ${platform} ordering page` : out.some((i) => i.photo) ? 'prices and photos are from their own site' : 'prices are from their own site')
const rec = { ...(base || { id, name_exact: seed.name, site_kind: 'own-domain', flags: [] }), prices_published: true, items: out.map(({ name, desc, cents, label, section, photo }) => ({ name, desc, cents, ...(label ? { label } : {}), ...(section ? { section } : {}), ...(photo ? { photo } : {}) })), price_note: note, menu_source: src, menu_gathered: new Date().toISOString().slice(0, 10) }
rec.flags = [...(base?.flags || []).filter((f: string) => !/^menu:/.test(f)), `menu: ${out.length} items read from ${src} on ${rec.menu_gathered}`]
const bf = join(dir, 'batch14-menus.json')
const arr = existsSync(bf) ? JSON.parse(readFileSync(bf, 'utf8')) : []
const at = arr.findIndex((r: any) => r.id === id); if (at >= 0) arr[at] = rec; else arr.push(rec)
writeFileSync(bf, JSON.stringify(arr, null, 1))
console.log(`batch14-menus.json: ${arr.length} businesses`)
