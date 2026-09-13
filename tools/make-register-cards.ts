/*
  REGISTER CARDS: a 4 x 6 inch card for each business's counter.

      npx tsx --tsconfig tsconfig.app.json tools/make-register-cards.ts
      npx tsx --tsconfig tsconfig.app.json tools/make-register-cards.ts --only b_theyard,b_belly
      npx tsx --tsconfig tsconfig.app.json tools/make-register-cards.ts --only b_theyard --no-png
      ... --out /some/folder     somewhere other than out/register-cards

  Writes to out/register-cards/ (gitignored):
      <brandId>.pdf   one card, 4 x 6 in, for a print shop or a home printer
      <brandId>.png   the same card at 1200 x 1800 (300 dpi), for a text or an email
      all-cards.pdf   every card in this run, one per page

  Every card carries the business's own tile as the app draws it, its name, and
  a QR for https://beastypages.com/?b=<id>&via=qr. Scanning opens that
  business's page, and `via=qr` is how a sign-up that starts there is counted
  as theirs: it lands in members.joined_via, the kitchen screen shows the
  business its own number, and `node tools/issue-kitchen-token.mjs signups`
  shows the operator everyone's.

  Only businesses that are seated somewhere (src/data/placements.ts) get a
  card: a card for a business with no page would open nothing. The card makes
  no offer and states no price. It says the page opens and that joining is
  free, and both of those are true of every seated business today.
*/
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { chromium } from 'playwright'
import QRCode from 'qrcode'
import { BRANDS } from '../src/data/brands'
import { CITY_PLACEMENTS } from '../src/data/placements'
import { BrandLogo } from '../src/ios/BrandLogo'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const outArg = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : ''
const OUT = outArg ? outArg : join(ROOT, 'out', 'register-cards')
const SITE = 'https://beastypages.com'

const args = process.argv.slice(2)
const onlyArg = args.includes('--only') ? args[args.indexOf('--only') + 1] ?? '' : ''
const only = new Set(onlyArg.split(',').map((s) => s.trim()).filter(Boolean))
const wantPng = !args.includes('--no-png')

const seated = new Set(Object.values(CITY_PLACEMENTS))
const brands = BRANDS.filter((b) => seated.has(b.id) && (only.size === 0 || only.has(b.id)))
for (const id of only) {
  if (!BRANDS.some((b) => b.id === id)) console.error(`skipped ${id}: no business has that id`)
  else if (!seated.has(id)) console.error(`skipped ${id}: not seated on any page, so a card would open nothing`)
}
if (brands.length === 0) {
  console.error('No cards to make.')
  process.exit(1)
}

const dataUri = (file: string, type: string) => `data:${type};base64,${readFileSync(file).toString('base64')}`
const TYPES: Record<string, string> = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml' }

/** The tile, inlined, so the page needs no server and prints the same anywhere. */
function tile(b: (typeof BRANDS)[number]) {
  let imageUrl = b.logo.imageUrl
  if (imageUrl?.startsWith('/')) {
    const ext = imageUrl.split('.').pop()!.toLowerCase()
    imageUrl = dataUri(join(ROOT, 'public', imageUrl), TYPES[ext] ?? 'application/octet-stream')
  }
  return renderToStaticMarkup(createElement(BrandLogo, { logo: { ...b.logo, imageUrl }, size: 112 }))
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

const FONTS = `
@font-face { font-family: 'Inter'; font-weight: 100 900; src: url('${dataUri(join(ROOT, 'public/fonts/inter-latin.woff2'), 'font/woff2')}') format('woff2'); }
@font-face { font-family: 'Oswald'; font-weight: 200 700; src: url('${dataUri(join(ROOT, 'public/fonts/oswald-latin.woff2'), 'font/woff2')}') format('woff2'); }
`
const MARK = dataUri(join(ROOT, 'public/icon-512.png'), 'image/png')

const CSS = `
${FONTS}
@page { size: 4in 6in; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Inter, 'Helvetica Neue', Arial, sans-serif; color: #141416; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.card { width: 4in; height: 6in; display: flex; flex-direction: column; overflow: hidden; background: #fff; page-break-after: always; break-after: page; }
.card:last-child { page-break-after: auto; break-after: auto; }
.top { display: flex; align-items: center; justify-content: center; gap: 12px; height: 1.05in; background: #FFD500; border-bottom: 3px solid #141416; }
.top img { width: 0.62in; height: 0.62in; border-radius: 21%; }
.top span { font-family: Oswald, Impact, sans-serif; font-weight: 700; font-size: 34px; letter-spacing: 0.02em; line-height: 1; }
.body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 18px 22px 14px; text-align: center; }
.who { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.who svg { display: block; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.18)); }
.name { font-size: 22px; font-weight: 800; line-height: 1.15; letter-spacing: -0.01em; max-width: 3.4in; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.qr { width: 1.95in; height: 1.95in; padding: 8px; border: 3px solid #141416; border-radius: 14px; background: #fff; }
.qr svg { display: block; width: 100%; height: 100%; }
.say { margin: 0; font-size: 19px; font-weight: 800; line-height: 1.2; }
.say small { display: block; margin-top: 3px; font-size: 15px; font-weight: 600; color: #3a3a40; }
.site { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: #55555b; }
`

async function cardHtml(b: (typeof BRANDS)[number]) {
  const url = `${SITE}/?b=${encodeURIComponent(b.id)}&via=qr`
  const qr = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#141416', light: '#ffffff' } })
  return `<section class="card">
  <div class="top"><img src="${MARK}" alt=""><span>BEASTY PAGES</span></div>
  <div class="body">
    <div class="who">${tile(b)}<div class="name">${esc(b.name)}</div></div>
    <div class="qr">${qr}</div>
    <p class="say">Scan to open our BEASTY page<small>and join free</small></p>
    <div class="site">beastypages.com</div>
  </div>
</section>`
}

const page = (cards: string[]) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${cards.join('\n')}</body></html>`

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 384, height: 576 }, deviceScaleFactor: 1200 / 384 })
const tab = await ctx.newPage()

const all: string[] = []
let n = 0
for (const b of brands) {
  const html = await cardHtml(b)
  all.push(html)
  await tab.setContent(page([html]), { waitUntil: 'load' })
  await tab.evaluate(() => document.fonts.ready)
  await tab.pdf({ path: join(OUT, `${b.id}.pdf`), width: '4in', height: '6in', printBackground: true })
  if (wantPng) await tab.screenshot({ path: join(OUT, `${b.id}.png`), clip: { x: 0, y: 0, width: 384, height: 576 } })
  n++
  if (n % 25 === 0) console.log(`${n} of ${brands.length}`)
}

await tab.setContent(page(all), { waitUntil: 'load' })
await tab.evaluate(() => document.fonts.ready)
await tab.pdf({ path: join(OUT, 'all-cards.pdf'), width: '4in', height: '6in', printBackground: true })
writeFileSync(join(OUT, 'README.txt'), `Register cards, made ${new Date().toISOString().slice(0, 10)} by tools/make-register-cards.ts.\n${brands.length} cards. Each QR opens ${SITE}/?b=<id>&via=qr.\n`)
await browser.close()
console.log(`${brands.length} card${brands.length === 1 ? '' : 's'} in ${OUT.startsWith(ROOT + '/') ? OUT.slice(ROOT.length + 1) : OUT}`)
