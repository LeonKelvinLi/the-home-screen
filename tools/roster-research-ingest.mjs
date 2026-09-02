#!/usr/bin/env node
/*
  Turn research JSON into src/data/rosterResearch.ts.

  Input: every *.json under the directory given (default /tmp/beasty-suite/
  research), each an array of objects in the shape the research prompt asks
  for — one per business, facts from the business's OWN website only.

  This script is where the catalogue's rules are enforced mechanically, so a
  researcher who slips does not put an invented fact on a page:

    - an item with no price, a zero price, or a silly price is dropped;
    - a "from" floor keeps its label and goes into a quoted group, never into
      an orderable menu;
    - hours are copied only when the researcher gave ONE line — a null with a
      flag is how a contradiction arrives, and it stays null;
    - a business that publishes no prices gets a sentence saying so;
    - names are NEVER overwritten from research. His roster spelling stands
      and the business's own spelling is written in the comment for a human,
      because "Ally Virtual, LLC" and "Ally Virtual" are the same business and
      an automatic rename would churn every page for nothing;
    - an entry marked `// hand-edited` in the existing file is preserved.

  The output is TypeScript, and every entry carries the date it was gathered
  and the researcher's flags — the self-contradictions found on the business's
  own site — as a comment above it, so a wrong fact is traceable.

      node tools/roster-research-ingest.mjs [dir] [--write]
*/
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '/tmp/beasty-suite/research'
const WRITE = process.argv.includes('--write')
const OUT = 'src/data/rosterResearch.ts'
const TODAY = new Date().toISOString().slice(0, 10)

/* slug <- id, from the roster itself. */
const roster = readFileSync('src/data/roster.ts', 'utf8')
const slugs = [...roster.matchAll(/seed\('([a-z0-9-]+)'/g)].map((m) => m[1])
/* Researchers copy from rendered HTML and bring entities with them. */
const ENT = { '&amp;': '&', '&#38;': '&', '&quot;': '"', '&#34;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&#8217;': '’', '&#8216;': '‘', '&#8220;': '“', '&#8221;': '”' }
const clean = (v) => (typeof v === 'string' ? v.replace(/&(amp|#38|quot|#34|#39|apos|lt|gt|nbsp|#8217|#8216|#8220|#8221);/g, (m) => ENT[m] ?? m).replace(/\s+/g, ' ').trim() : v)
const deep = (v) => (Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : clean(v))

const slugById = Object.fromEntries(slugs.map((s) => [`b_${s.replace(/-/g, '')}`, s]))
const rosterName = Object.fromEntries([...roster.matchAll(/seed\('([a-z0-9-]+)',\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => [m[1], m[2]]))

/* Preserve hand-edited entries verbatim. */
const keep = {}
if (existsSync(OUT)) {
  const cur = readFileSync(OUT, 'utf8')
  for (const m of cur.matchAll(/\n  \/\/ hand-edited[^\n]*\n([\s\S]*?)\n  '([a-z0-9-]+)': (\{[\s\S]*?\n  \}),/g)) keep[m[2]] = m[0]
}

/* Word-bounded where a token is short enough to hide inside another word —
   "tow" sat inside "Downtown" and filed a barbecue menu as quoted services. */
const SERVICE = /detail|repair|groom|\bspa\b|salon|\bgym\b|fitness|yoga|rental|photo|booth|\btow(ing)?\b|\bwash|\bpaint|\blaw\b|attorney|\bmedia\b|production|advertis|virtual|\bturf|paver|charter|\bbus(es)?\b|balloon|\bevent|\bgolf|paintball|trampoline|\bpark\b|wiring|proposal|\bdesign|studio|\bclean|\btint|coating|muffler|mechanic|\btires?\b|hauling|landscap|lighting|contractor|barber|\bnails?\b|massage|\bdance|tutor|\bcoach|daycare|kennel|walking|sitting|electronics|planning|\bcrm\b|automation|marketing/i

const entries = {}
const report = { files: 0, businesses: 0, priced: 0, quoted: 0, unpriced: 0, blocked: 0, unknownId: [], droppedItems: 0 }

for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  let arr
  try { arr = JSON.parse(readFileSync(join(dir, f), 'utf8')) } catch (e) { console.error(`skip ${f}: ${e.message}`); continue }
  report.files++
  for (const r0 of arr) {
    const r = deep(r0)
    report.businesses++
    const slug = slugById[r.id]
    if (!slug) { report.unknownId.push(r.id); continue }
    if (keep[slug]) continue
    const e = {}
    const notes = []
    notes.push(`${rosterName[slug] ?? slug} — gathered ${TODAY} from ${(r.site_kind || 'site')}${r.blocked ? ` — BLOCKED: ${r.blocked}` : ''}`)
    if (r.name_exact && r.name_exact.trim() && r.name_exact.trim() !== (rosterName[slug] ?? '')) notes.push(`their spelling: "${r.name_exact.trim()}" (roster keeps "${rosterName[slug] ?? slug}")`)
    if (r.cuisine) notes.push(`they are: ${r.cuisine}`)
    if (r.logo_url) notes.push(`logo: ${r.logo_url}${r.logo_px ? ` (${r.logo_px})` : ''} — not cut into a tile yet`)
    for (const fl of r.flags ?? []) notes.push(`flag: ${fl}`)

    if (r.address) e.address = String(r.address).trim()
    if (r.phone) e.phone = String(r.phone).trim()
    if (r.email) e.email = String(r.email).trim()
    if (r.hours) e.hours = String(r.hours).trim()
    if (r.instagram) e.instagram = String(r.instagram).replace(/^@/, '').trim()
    /* The roster's descriptor line was "lifted from the name" — his words —
       so a researched one is better informed. Kept short: it is a line under
       a name, not a sentence. */
    if (r.cuisine && String(r.cuisine).trim().length <= 28) e.cuisine = String(r.cuisine).trim()
    if (r.site_kind === 'stopgap') e.needsSite = true
    const line = (r.one_line || '').trim()
    if (line && line.length <= 72 && !/[.!?]$/.test(line.slice(0, -1))) e.tagline = line

    /* Items. */
    const items = []
    for (const it of r.items ?? []) {
      const cents = Number(it.cents)
      if (!it.name || !Number.isFinite(cents) || cents <= 0 || cents > 5_000_000) { report.droppedItems++; continue }
      items.push([String(it.name).trim(), String(it.desc || '').trim(), Math.round(cents), it.label ? String(it.label).trim() : null])
    }
    const anyFloor = items.some((i) => i[3])
    const isService = SERVICE.test(r.cuisine || '') || SERVICE.test(rosterName[slug] || '')
    /* A line that already ends in a full stop — including one tucked inside a
       closing quote, as in `...your driveway.'` — gets no second one. And a
       researcher's price note is a clause; it starts a sentence here. */
    const endStop = (t) => (/[.!?]['"\u2019\u201d]?$/.test(t) ? t : t + '.')
    const capital = (t) => t.replace(/^./, (c) => c.toUpperCase())
    const sentence = line ? endStop(line) : ''
    const noteSentence = r.price_note ? capital(endStop(String(r.price_note).trim())) : ''
    const hardFact = !!(e.address || e.phone || e.hours || items.length)

    if (r.blocked && !hardFact) {
      /* Nothing readable. The roster note stays; only the notes are kept. */
      report.blocked++
      if (!Object.keys(e).length) { entries[slug] = { e: {}, notes }; continue }
    } else if (items.length && isService) {
      /* A service's prices are quoted, not ordered: a group, and a sentence.
         A floor keeps its label in the fourth slot. */
      report.quoted++
      e.groups = [{ name: anyFloor ? 'Prices, from' : 'Prices', items: items.map(([n, d, c, l]) => (l ? [n, d, c, l] : [n, d, c])) }]
      e.quoteOnly = `${sentence} ${noteSentence || 'Prices are theirs, from their own site.'}`.trim()
    } else if (items.length) {
      /* Food and retail: a menu. A "from" item keeps its label — the menu row
         renders priceLabel over the number — so a floor is never shown as a
         fixed price. */
      report.priced++
      e.items = items.map(([n, d, c, l]) => (l ? [n, d, c, l] : [n, d, c]))
      e.offer = items.slice(0, 4).map((i) => i[0])
      /* The researcher's note on the prices — "from their catering PDF",
         "private dining only until they open" — belongs under the menu, where
         siteNote renders as the line that links to their own site. */
      if (noteSentence) e.siteNote = noteSentence
    } else if (hardFact) {
      /* An address or a number and no prices: say what they are and that
         they publish none. */
      report.unpriced++
      const why = noteSentence || 'They publish no prices.'
      e.contactOnly = `${sentence} ${why}`.trim()
    } else {
      /* Only soft facts (a handle, a stopgap flag). The roster note stays. */
      report.unpriced++
    }
    entries[slug] = { e, notes }
  }
}

const q = (v) => JSON.stringify(v)
const fmtItems = (arr, ind) => '[\n' + arr.map((i) => `${ind}  ${q(i)},`).join('\n') + `\n${ind}]`
let body = ''
for (const slug of Object.keys(entries).sort()) {
  const { e, notes } = entries[slug]
  body += `\n  /*\n${notes.map((n) => '     ' + n.replace(/\*\//g, '* /')).join('\n')}\n  */\n  '${slug}': {\n`
  for (const [k, v] of Object.entries(e)) {
    if (k === 'items') body += `    items: ${fmtItems(v, '    ')},\n`
    else if (k === 'groups') body += `    groups: [\n      { name: ${q(v[0].name)}, items: ${fmtItems(v[0].items, '      ')} },\n    ],\n`
    else body += `    ${k}: ${q(v)},\n`
  }
  body += '  },\n'
}
for (const k of Object.keys(keep)) body += keep[k] + '\n'

const header = existsSync(OUT) ? readFileSync(OUT, 'utf8').split('export const ROSTER_RESEARCH')[0] : ''
const out = header + `export const ROSTER_RESEARCH: Record<string, Partial<LocalSeed>> = {${body}}\n`
console.log(JSON.stringify(report, null, 1))
if (WRITE) { writeFileSync(OUT, out); console.log(`wrote ${OUT}: ${Object.keys(entries).length} entries`) }
else console.log(`(dry run — ${Object.keys(entries).length} entries would be written; pass --write)`)
