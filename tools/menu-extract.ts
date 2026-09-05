/*
  Turn a crawl (research/menus/raw/<id>/) into candidate menu items for review:
  research/menus/cand/<id>.json — never into the catalogue directly. A human
  reads each candidate file against the business's page before it becomes a
  research batch, because a heuristic that finds "items" in a page also finds
  gift cards, catering deposits and the odd cookie banner.

    npx tsx tools/menu-extract.ts [--ids a,b]

  Sources, best first: Square Online products JSON; any JSON object shaped like
  a menu item (Toast, Clover, ChowNow, Popmenu, Wix...); schema.org Menu; and
  finally the rendered page text, read as "name / description / $price" runs.
*/
import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
/* A PDF menu, fetched once and read with pdftotext -layout so a price stays on
   its item's line. Returns the text, or '' when the file is not a PDF. */
function pdfText(dir: string, url: string, n: number): string {
  const pdf = join(dir, `pdf-${n}.pdf`), txt = join(dir, `pdf-${n}.txt`)
  if (existsSync(txt)) return readFileSync(txt, 'utf8')
  try {
    if (!existsSync(pdf)) execFileSync('/usr/bin/curl', ['-sL', '-A', UA, '--max-time', '60', '-o', pdf, url], { stdio: 'ignore' })
    const head = readFileSync(pdf).subarray(0, 5).toString()
    if (!head.startsWith('%PDF')) { writeFileSync(txt, ''); return '' }
    execFileSync('pdftotext', ['-layout', pdf, txt], { stdio: 'ignore' })
    return readFileSync(txt, 'utf8')
  } catch { writeFileSync(txt, ''); return '' }
}

const args = process.argv.slice(2)
const onlyIds = (args[args.indexOf('--ids') + 1] || '').split(',').filter((x) => args.includes('--ids') && x)
const RAW = 'research/menus/raw', OUT = 'research/menus/cand'
mkdirSync(OUT, { recursive: true })

type Item = { name: string; desc: string; cents: number; section?: string; image?: string; label?: string; alcohol?: boolean; src: string }
const strip = (h: any) => String(h ?? '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
const ALC = /\b(beer|cerveza|lager|ale|wine|cocktail|margarita|mimosa|sake|soju|ipa|lager|pilsner|stout|tequila|vodka|whiskey|whisky|bourbon|rum|gin|mezcal|champagne|prosecco|sangria|hard seltzer|michelada|bloody mary|spritz|negroni|old fashioned|mule|paloma|cider)\b/i

function square(dir: string, files: string[]): Item[] {
  const cats: Record<string, string> = {}
  let items: Item[] = []
  for (const f of files) {
    const [head, ...rest] = readFileSync(join(dir, f), 'utf8').split('\n')
    if (!/editmysite\.com|square\.site|weeblycloud/.test(head)) continue
    let d: any; try { d = JSON.parse(rest.join('\n')) } catch { continue }
    if (/\/categories\?/.test(head) && d?.data) {
      const walk = (arr: any[]) => { for (const c of arr) { if (c?.id && c?.name) cats[c.id] = strip(c.name); if (c?.children?.data) walk(c.children.data); if (Array.isArray(c?.children)) walk(c.children) } }
      walk(d.data)
    }
    if (/\/products\?/.test(head) && Array.isArray(d?.data) && d.data.length > items.length) {
      items = d.data.filter((p: any) => p.visibility !== 'hidden').map((p: any) => {
        const low = p.price?.low_subunits ?? Math.round((p.price?.low ?? 0) * 100), high = p.price?.high_subunits ?? low
        const img = p.images?.data?.[0]?.absolute_url || p.thumbnail?.absolute_url
        return { name: strip(p.name), desc: strip(p.short_description || p.description || ''), cents: low, label: high > low ? `from $${(low / 100).toFixed(2)}` : undefined, section: (p.categoryIds || []).map((c: string) => cats[c]).filter(Boolean)[0], image: img, alcohol: !!p.is_alcoholic || ALC.test(p.name), src: 'square' }
      })
    }
  }
  // categories can arrive after products; resolve again
  for (const it of items) if (!it.section) it.section = undefined
  return items
}

/* Any JSON object that looks like a menu item. Walks every JSON body and
   every inline state blob, keeping the parent-with-a-name as the section. */
const NAME_KEYS = ['name', 'title', 'displayName', 'itemName']
const PRICE_KEYS = ['price', 'basePrice', 'priceCents', 'price_cents', 'unitPrice', 'amount', 'defaultPrice', 'minPrice', 'startingPrice', 'displayPrice']
const DESC_KEYS = ['description', 'desc', 'shortDescription', 'short_description', 'details', 'subtitle']
const IMG_KEYS = ['imageUrl', 'image', 'imageURL', 'img', 'photo', 'photoUrl', 'thumbnail', 'image_url', 'imagePath', 'images', 'media']
const toCents = (v: any): number | null => {
  if (v == null) return null
  if (typeof v === 'number') return v > 0 && v < 5000 ? Math.round(v * 100) : v >= 5000 && v < 500000 && Number.isInteger(v) ? v : null
  if (typeof v === 'string') { const m = v.replace(/,/g, '').match(/\$?\s*(\d+(?:\.\d{1,2})?)/); return m ? Math.round(parseFloat(m[1]) * 100) : null }
  if (typeof v === 'object') { for (const k of ['amount', 'value', 'cents', 'displayPrice', 'price', 'unit_amount', 'formatted']) { const c = toCents(v[k]); if (c) return c } }
  return null
}
const imgOf = (v: any): string | undefined => {
  if (!v) return
  if (typeof v === 'string') return /^https?:\/\//.test(v) && /\.(jpe?g|png|webp|gif)|image|photo|cloudfront|cdn|imgix|cloudinary/i.test(v) ? v : undefined
  if (Array.isArray(v)) { for (const x of v) { const u = imgOf(x); if (u) return u } return }
  if (typeof v === 'object') { for (const k of ['url', 'src', 'absolute_url', 'imageUrl', 'large', 'original', 'medium', 'small', 'path', 'href']) { const u = imgOf(v[k]); if (u) return u } }
}
function generic(root: any, src: string): Item[] {
  const out: Item[] = []
  const seen = new Set<string>()
  const walk = (node: any, section: string | undefined, depth: number) => {
    if (!node || typeof node !== 'object' || depth > 14) return
    if (Array.isArray(node)) { for (const x of node) walk(x, section, depth + 1); return }
    const nameK = NAME_KEYS.find((k) => typeof node[k] === 'string' && node[k].trim().length > 1 && node[k].length < 90)
    const priceK = PRICE_KEYS.find((k) => k in node && toCents(node[k]))
    if (nameK && priceK && !/^(Query|Restaurant|RestaurantLocation)$/.test(node.__typename || '')) {
      const cents = toCents(node[priceK])!
      const desc = strip(DESC_KEYS.map((k) => node[k]).find((v) => typeof v === 'string') || '')
      const image = imgOf(IMG_KEYS.map((k) => node[k]).find(Boolean))
      const name = strip(node[nameK])
      const key = `${name}|${cents}`
      if (!seen.has(key) && cents > 50 && cents < 100000) { seen.add(key); out.push({ name, desc, cents, section, image, alcohol: ALC.test(name) || (typeof node.__typename === 'string' && /alcohol/i.test(node.__typename)), src }) }
      return
    }
    const sec = nameK && typeof node[nameK] === 'string' && node[nameK].length < 60 ? strip(node[nameK]) : section
    for (const k of Object.keys(node)) walk(node[k], sec, depth + 1)
  }
  walk(root, undefined, 0)
  return out
}

function jsonld(pages: any[]): Item[] {
  const out: Item[] = []
  for (const p of pages) for (const j of p.jsonld || []) {
    const d = j.data; if (!d) continue
    const walk = (n: any, section?: string) => {
      if (!n || typeof n !== 'object') return
      if (Array.isArray(n)) { n.forEach((x) => walk(x, section)); return }
      const t = String(n['@type'] || '')
      if (/MenuItem/.test(t) && n.name) { const c = toCents(n.offers?.price ?? n.offers?.[0]?.price ?? n.price); if (c) out.push({ name: strip(n.name), desc: strip(n.description || ''), cents: c, section, image: imgOf(n.image), alcohol: ALC.test(n.name), src: 'jsonld' }); return }
      const sec = /MenuSection/.test(t) && n.name ? strip(n.name) : section
      for (const k of Object.keys(n)) if (k !== '@context') walk(n[k], sec)
    }
    walk(d)
  }
  return out
}

/* Rendered text: an item is 1-3 short lines followed by a price line, or a
   "name  $price" line. Sections are found afterwards: a short line that no
   item consumed, sitting above a run of items, is the heading of that run.
   Ordering pages also repeat the headings as a nav block at the top; a
   "Featured"/"Popular" carousel duplicates items, and loses to the real
   section on de-dupe. */
function fromText(text: string, pdf = false): Item[] {
  const lines = text.split('\n').map((l) => l.replace(/\s{2,}/g, pdf ? '  ' : ' ').trim()).filter(Boolean)
  const PRICE = /^\$\s?(\d{1,3}(?:\.\d{2})?)(?:\s*[-–+]\s*\$?\s?(\d{1,3}(?:\.\d{2})?))?\s*(?:\+|each|ea\.?)?$/i
  const INLINE = pdf
    ? /^(.{2,80}?)\s*[.…\-–—]*\s{1,}\$?\s?(\d{1,3}(?:\.\d{2})?)(?:\s*[-–\/]\s*\$?\s?(\d{1,3}(?:\.\d{2})?))?\s*\+?$/
    : /^(.{2,80}?)\s*[.…\-–—]*\s*\$\s?(\d{1,3}(?:\.\d{2})?)(?:\s*[-–\/]\s*\$?\s?(\d{1,3}(?:\.\d{2})?))?\s*\+?$/
  const raw: (Item & { at: number })[] = []
  const used = new Set<number>()
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    let m = l.match(PRICE)
    if (m) {
      /* The block above the price: up to three unconsumed lines. The last of
         them is the name unless it reads like a description (long, has a
         comma, ends in a full stop, starts lower-case), in which case the line
         before it is the name and it is the description. What is left above
         the name stays unconsumed and can become a section heading. */
      const block: number[] = []
      for (let j = i - 1; j >= 0 && j >= i - 3 && !used.has(j) && !PRICE.test(lines[j]) && !INLINE.test(lines[j]); j--) block.unshift(j)
      const descLike = (t: string) => t.length > 45 || /, /.test(t) || /[.!]$/.test(t) || /^[a-z]/.test(t) || /\b(served|with|topped|choice of|comes)\b/i.test(t)
      const junkName = (t: string) => /out of stock|add to cart|^\d+$|^(add|choose|select|includes)\b/i.test(t)
      let nameAt = -1, descAt = -1
      if (block.length) {
        const last = block[block.length - 1]
        if (junkName(lines[last])) { block.pop() }
        if (block.length) {
          const l2 = block[block.length - 1]
          if (descLike(lines[l2]) && block.length >= 2 && !descLike(lines[block[block.length - 2]]) && !junkName(lines[block[block.length - 2]])) { nameAt = block[block.length - 2]; descAt = l2 }
          else if (!junkName(lines[l2]) && lines[l2].length <= 80) { nameAt = l2 }
        }
      }
      if (nameAt >= 0) {
        used.add(i); used.add(nameAt); if (descAt >= 0) used.add(descAt)
        raw.push({ name: lines[nameAt], desc: descAt >= 0 ? lines[descAt].slice(0, 220) : '', cents: Math.round(parseFloat(m[1]) * 100), label: m[2] ? `from $${m[1]}` : undefined, alcohol: ALC.test(lines[nameAt]), src: 'text', at: nameAt })
      }
      continue
    }
    m = l.match(INLINE)
    if (m && !/total|subtotal|tax|tip|delivery|fee|minimum|gift|deposit|per person|pp\b/i.test(m[1])) {
      const next = lines[i + 1]
      const desc = next && !PRICE.test(next) && !INLINE.test(next) && next.length > 25 && /[a-z]/.test(next) && !/^[A-Z][A-Za-z&' ]{1,30}$/.test(next) ? next.slice(0, 220) : ''
      used.add(i); if (desc) used.add(i + 1)
      raw.push({ name: m[1].trim(), desc, cents: Math.round(parseFloat(m[2]) * 100), label: m[3] ? `from $${m[2]}` : undefined, alcohol: ALC.test(m[1]), src: 'text', at: i })
    }
  }
  const JUNK = /add to cart|popular|featured|out of stock|see more|search|rewards|earn|apply|skip|cookie|consent|^order|menu$|^\d+$|©|http|sign|log ?in|pickup|delivery|checkout|cart|subtotal|^\$|^(mon|tue|wed|thu|fri|sat|sun)|^(home|about|contact|catering|gallery|location|hours|reviews?|careers|jobs|faq|press|blog|events?|reservations?|shop|store|gift)/i
  const headingLike = (l: string) => l.length <= 40 && !/\$/.test(l) && !/[.!?]$/.test(l) && l.split(/\s+/).length <= 6 && !JUNK.test(l) && /[A-Za-z]/.test(l)
  /* A heading stands alone between items. A run of adjacent heading-like lines
     is the page's nav or category strip, not a heading over anything. */
  const isNav = (j: number) => (j > 0 && !used.has(j - 1) && headingLike(lines[j - 1])) || (j + 1 < lines.length && !used.has(j + 1) && headingLike(lines[j + 1]))
  const sectionAt: (string | undefined)[] = []
  let cur: string | undefined
  for (let j = 0; j < lines.length; j++) { if (!used.has(j) && headingLike(lines[j]) && !isNav(j)) cur = lines[j].replace(/\s+/g, ' '); sectionAt[j] = cur }
  const out: Item[] = raw.map(({ at, ...rest }) => ({ ...rest, section: sectionAt[at] }))
  const FEAT = /^(featured( items?)?|most popular|popular( items?)?|top picks?|best ?sellers?)$/i
  const byName = new Map<string, Item>()
  for (const it of out) { const k = `${it.name.toLowerCase()}|${it.cents}`; const prev = byName.get(k); if (!prev || (prev.section && FEAT.test(prev.section) && !(it.section && FEAT.test(it.section)))) byName.set(k, it) }
  return [...byName.values()].map((it) => (it.section && FEAT.test(it.section) ? { ...it, section: undefined } : it))
}

/* An ordering page's item card, read off the text around its picture:
   "Name / description / $price". Exact names for everything that has a photo,
   which is what the menu wants most. */
function fromCards(imgs: any[]): Item[] {
  const out: Item[] = []
  for (const im of imgs) {
    const ls = String(im.near || '').split('\n').map((x: string) => x.trim()).filter(Boolean)
    if (ls.length < 2 || ls.length > 6) continue
    const pi = ls.findIndex((x: string) => /^\$\s?\d{1,3}(\.\d{2})?(\s*[-–+]\s*\$?\d{1,3}(\.\d{2})?)?\s*\+?$/.test(x))
    if (pi < 1) continue
    const name = ls[0]; if (name.length > 70 || /out of stock|add to cart|^\d+$/i.test(name)) continue
    const desc = ls.slice(1, pi).filter((x: string) => !/out of stock|popular|^\d+$/i.test(x)).join(' ').slice(0, 220)
    const m = ls[pi].match(/(\d{1,3}(?:\.\d{2})?)/)!
    out.push({ name, desc, cents: Math.round(parseFloat(m[1]) * 100), image: im.src, alcohol: ALC.test(name), src: 'card' })
  }
  return out
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
function attachImages(items: Item[], imgs: any[]) {
  for (const it of items) {
    if (it.image) continue
    const n = norm(it.name); if (n.length < 4) continue
    const hit = imgs.find((im) => norm(im.alt).includes(n) || norm(im.title).includes(n)) || imgs.find((im) => norm(im.near).startsWith(n) || norm(im.near).includes(n))
    if (hit) it.image = hit.src
  }
}

const ids = readdirSync(RAW).filter((d) => d.startsWith('b_') && existsSync(join(RAW, d, 'pages.json'))).filter((d) => !onlyIds.length || onlyIds.includes(d))
const summary: any[] = []
for (const id of ids) {
  const dir = join(RAW, id)
  const pages = JSON.parse(readFileSync(join(dir, 'pages.json'), 'utf8')).pages
  const imgs = existsSync(join(dir, 'images.json')) ? JSON.parse(readFileSync(join(dir, 'images.json'), 'utf8')) : []
  const files = readdirSync(dir).filter((f) => f.startsWith('net-'))
  /* Every source is read; the richest wins, with structured JSON preferred
     over text when it is anywhere near as complete — a Toast page's schema.org
     block lists six dishes while its rendered text lists forty-five. */
  const cands: { source: string; items: Item[] }[] = []
  const dedupe = (arr: Item[]) => { const seen = new Set<string>(); return arr.filter((it) => { const k = `${it.name.toLowerCase()}|${it.cents}`; if (seen.has(k)) return false; seen.add(k); return true }) }
  cands.push({ source: 'square', items: square(dir, files) })
  {
    const g: Item[] = []
    for (const f of files) {
      const [head, ...rest] = readFileSync(join(dir, f), 'utf8').split('\n')
      if (/citation-map|page-data|ninetailed|analytics|gtm|segment|sentry|hotjar|klaviyo|fonts|recaptcha|consent|cookie|editmysite|square\.site/i.test(head)) continue
      let d: any; try { d = JSON.parse(rest.join('\n')) } catch { continue }
      g.push(...generic(d, 'json:' + head.slice(8, 80)))
    }
    for (const p of pages) for (const [k, v] of Object.entries(p.globals || {})) g.push(...generic(v, 'global:' + k))
    cands.push({ source: 'json', items: dedupe(g) })
  }
  cands.push({ source: 'jsonld', items: dedupe(jsonld(pages)) })
  {
    const all: Item[] = []
    for (const p of pages) if (p.textFile && existsSync(join(dir, p.textFile))) all.push(...fromText(readFileSync(join(dir, p.textFile), 'utf8')))
    const cards = fromCards(imgs)
    const byName = new Map(cards.map((c) => [norm(c.name), c]))
    const byDesc = new Map(cards.filter((c) => c.desc).map((c) => [norm(c.desc), c]))
    const merged = all.map((it) => { const c = byName.get(norm(it.name)) || byDesc.get(norm(it.name)); return c ? { ...c, section: it.section, src: 'text+card' } : it })
    for (const c of cards) if (!merged.some((it) => norm(it.name) === norm(c.name))) merged.push(c)
    cands.push({ source: 'text', items: dedupe(merged) })
    const pdfs = [...new Set(pages.flatMap((p: any) => p.pdfs || []))].slice(0, 4) as string[]
    const pd: Item[] = []
    pdfs.forEach((u, n) => { const t = pdfText(dir, u, n + 1); if (t) pd.push(...fromText(t, true).map((it) => ({ ...it, src: 'pdf' }))) })
    cands.push({ source: 'pdf', items: dedupe(pd) })
  }
  const W: Record<string, number> = { square: 1.6, json: 1.4, jsonld: 1.2, text: 1, pdf: 1 }
  for (const c of cands) c.items = c.items.filter((it) => !/^\d+$|add to cart|out of stock/i.test(it.name) && !/^add to cart$/i.test(it.desc)).filter((it) => !/gift ?card|deposit|\bfee\b|\btip\b|donation|utensil|napkin|cutlery|bag\b|merch|t-shirt|hoodie|hat\b|sticker/i.test(it.name) && it.cents >= 100)
  const best = cands.filter((c) => c.items.length >= 3).sort((a, b) => b.items.length * W[b.source] - a.items.length * W[a.source])[0]
  let items: Item[] = best ? best.items : []
  let source = best ? best.source : ''
  const alt = Object.fromEntries(cands.filter((c) => c.items.length >= 3 && c.source !== source).map((c) => [c.source, c.items.length]))
  attachImages(items, imgs)
  const withImg = items.filter((i) => i.image).length
  const foodImgs = imgs.filter((im: any) => im.w >= 300 && im.h >= 200).slice(0, 60).map((im: any) => ({ src: im.src, alt: im.alt, near: (im.near || '').slice(0, 100), w: im.w, h: im.h, page: im.page }))
  writeFileSync(join(OUT, `${id}.json`), JSON.stringify({ id, source, alt, pages: pages.map((p: any) => p.final || p.url), pdfs: pages.flatMap((p: any) => p.pdfs || []), items, alts: Object.fromEntries(cands.filter((c) => c.source !== source && c.items.length >= 3).map((c) => [c.source, c.items])), images: foodImgs }, null, 1))
  summary.push({ id, source: source + (Object.keys(alt).length ? '+' + Object.entries(alt).map(([k, v]) => `${k[0]}${v}`).join('') : ''), items: items.length, withImg, sections: new Set(items.map((i) => i.section).filter(Boolean)).size, imgs: foodImgs.length, pdfs: pages.flatMap((p: any) => p.pdfs || []).length })
}
console.log('id'.padEnd(26), 'source', 'items', 'img', 'sec', 'siteimgs', 'pdfs')
for (const s of summary) console.log(s.id.padEnd(26), (s.source || '-').padEnd(6), String(s.items).padStart(5), String(s.withImg).padStart(3), String(s.sections).padStart(3), String(s.imgs).padStart(8), String(s.pdfs).padStart(4))
