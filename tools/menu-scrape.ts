/*
  Read each food business's OWN site with a real browser and save what it
  publishes: page text, every JSON the page loaded (ordering platforms ship
  their menus as JSON), schema.org blocks, and every picture with its alt text
  and the text around it. Nothing here decides what a menu item is — that is
  tools/menu-extract.ts, over these files, so a bad guess can be re-run without
  another crawl.

    npx tsx tools/menu-scrape.ts [--ids b_x,b_y] [--concurrency 4] [--force]

  Output: research/menus/raw/<id>/{pages.json,page-N.txt,net-N.json,images.json}
*/
import { chromium, type Page, type BrowserContext } from 'playwright'
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BRANDS } from '../src/data/brands'

const FOOD = /coffee|caf[eé]|\btea\b|boba|chicken|wing|burger|pizza|taco|taquer|thai|ramen|pho\b|sushi|bakery|bake|pastr|dessert|ice cream|grill|kitchen|restaurant|\bfood|bbq|barbecue|brunch|breakfast|lunch|dinner|deli|sandwich|catering|winery|\bwine|beer|brew|bar\b|lounge|juice|smoothie|yogurt|cookie|donut|pie\b|noodle|dumpling|seafood|steak|meat|butcher|mexican|italian|indian|asian|vietnamese|filipino|hibachi|hawaiian|burrito|sausage|hot dog|lumpia|dairy|vegan|soup|tamale|peruvian|korean|japanese|chinese|mediterranean|halal|kabab|kebab|chocolate|cannoli|gelato|crawfish|cajun|bistro|smoked|steakhouse|soul/i
const args = process.argv.slice(2)
const opt = (k: string, d: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d }
const onlyIds = opt('--ids', '').split(',').filter(Boolean)
const CONC = Number(opt('--concurrency', '4'))
const FORCE = args.includes('--force')
const OUT = 'research/menus/raw'

type Target = { id: string; name: string; urls: string[] }
const targets: Target[] = []
/* --adhoc id=url[,id=url]: a site for a business not in the catalogue yet. */
for (const pair of (opt('--adhoc', '')).split(',').filter(Boolean)) { const at = pair.indexOf('='); targets.push({ id: pair.slice(0, at), name: pair.slice(0, at), urls: [pair.slice(at + 1)] }) }
for (const b of BRANDS as any[]) {
  if (args.includes('--adhoc')) break
  if (!FOOD.test(`${b.cuisine} ${b.name}`)) continue
  if (onlyIds.length && !onlyIds.includes(b.id)) continue
  const urls = [b.site, b.orderUrl].filter((u: string) => u && !/instagram\.com|linktr\.ee|gofundme|facebook\.com|yelp\.(com|to)|tiktok/.test(u))
  if (!urls.length) continue
  targets.push({ id: b.id, name: b.name, urls: [...new Set(urls)] })
}
console.log(`${targets.length} targets`)

const MENUISH = /menu|order|food|eat|drink|dessert|catering|pizza|breakfast|lunch|dinner|brunch|shop|store|our-?(dishes|kitchen)|carte|pricing/i
const PLATFORM = /toasttab\.com|square\.site|order\.online|cloveronline\.com|chownow\.com|slicelife\.com|menufy\.com|popmenu|getbento|squareup\.com|clover\.com|ordering|owner\.com|hungerrush|olo\.com|bbot|grubhub\.com|doordash\.com|ubereats\.com|revelup|gloriafood|zuppler|ordereze|spoton|upserve|smartonlineorder|foodbooking|beyondmenu|eatstreet|menudrive/i
// Platform marketing and legal pages, never a menu.
const DENY = /squareup\.com|pos\.toasttab\.com|\/(privacy|terms|careers|blog|about-toast|egiftcards|gift-?cards?|legal|cookie|accessibility|login|sign-?in|account|cart|checkout|reviews?)(\b|\/|$)|doordash\.com\/(about|careers|dasher)|mailto:|tel:/i
const SKIP_IMG = /logo|icon|sprite|pixel|badge|arrow|button|social|facebook|instagram|yelp|payment|visa|master|paypal|apple|google|doordash|grubhub|ubereats|avatar|favicon|spacer|blank|loading|placeholder|map|qr/i

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((res) => {
      let y = 0; const step = 700
      const t = setInterval(() => {
        window.scrollBy(0, step); y += step
        if (y >= document.body.scrollHeight + 1400 || y > 60000) { clearInterval(t); res() }
      }, 120)
    })
  })
  await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
}

async function collect(page: Page) {
  return page.evaluate((skipSrc) => {
    const skip = new RegExp(skipSrc, 'i')
    const text = (document.body?.innerText || '').slice(0, 300_000)
    const jsonld: any[] = []
    for (const s of Array.from(document.querySelectorAll('script[type="application/ld+json"], script[type="application/json"], script#__NEXT_DATA__'))) {
      const raw = s.textContent || ''
      if (raw.length > 5 && raw.length < 3_000_000) { try { jsonld.push({ id: (s as HTMLElement).id || null, type: s.getAttribute('type'), data: JSON.parse(raw) }) } catch { jsonld.push({ id: (s as HTMLElement).id || null, type: s.getAttribute('type'), raw: raw.slice(0, 200_000) }) } }
    }
    // Inline state blobs that ordering platforms leave on window.
    const globals: Record<string, any> = {}
    for (const k of ['__PRELOADED_STATE__', '__INITIAL_STATE__', '__NUXT__', '__APOLLO_STATE__', 'warmupData', '__WEEBLY_STORE__', '__data', 'INITIAL_STATE', '__STORE__']) {
      try { const v = (window as any)[k]; if (v && typeof v === 'object') { const s = JSON.stringify(v); if (s.length < 3_000_000) globals[k] = JSON.parse(s) } } catch {}
    }
    const imgs: any[] = []
    const seen = new Set<string>()
    const near = (el: Element) => {
      let n: Element | null = el
      for (let i = 0; i < 6 && n; i++) {
        const t = (n as HTMLElement).innerText?.trim()
        if (t && t.length > 3) return t.slice(0, 240)
        n = n.parentElement
      }
      return ''
    }
    for (const im of Array.from(document.images)) {
      const src = im.currentSrc || im.src
      if (!src || src.startsWith('data:') || seen.has(src)) continue
      const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height
      if (w < 140 || h < 140) continue
      if (skip.test(src) && !/menu|food|dish|item|product|photo/i.test(src)) continue
      seen.add(src)
      imgs.push({ src, alt: (im.alt || '').trim(), title: (im.title || '').trim(), w, h, near: near(im), srcset: im.srcset?.slice(0, 600) || '' })
    }
    // CSS background images on large boxes (galleries, hero grids).
    for (const el of Array.from(document.querySelectorAll('*')).slice(0, 4000)) {
      const bg = getComputedStyle(el).backgroundImage
      if (!bg || bg === 'none') continue
      const m = bg.match(/url\("?([^")]+)"?\)/); if (!m) continue
      const src = m[1]; if (src.startsWith('data:') || seen.has(src) || skip.test(src)) continue
      const r = (el as HTMLElement).getBoundingClientRect(); if (r.width < 160 || r.height < 120) continue
      seen.add(src); imgs.push({ src, alt: '', title: '', w: Math.round(r.width), h: Math.round(r.height), near: near(el), bg: true })
    }
    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => ({ href: (a as HTMLAnchorElement).href, text: (a as HTMLElement).innerText?.trim().slice(0, 80) || '' }))
    return { text, jsonld, globals, imgs, links, title: document.title }
  }, SKIP_IMG.source)
}

async function scrape(ctx: BrowserContext, t: Target) {
  const dir = join(OUT, t.id)
  if (!FORCE && existsSync(join(dir, 'pages.json'))) { console.log(`skip ${t.id} (have it)`); return }
  mkdirSync(dir, { recursive: true })
  const page = await ctx.newPage()
  const net: any[] = []
  page.on('response', async (r) => {
    try {
      const ct = r.headers()['content-type'] || ''
      if (!/json|javascript|graphql/i.test(ct) && !/\.json(\?|$)|graphql|api\//i.test(r.url())) return
      if (!/json|graphql/i.test(ct) && !/\.json(\?|$)|graphql/i.test(r.url())) return
      const len = Number(r.headers()['content-length'] || 0); if (len > 4_000_000) return
      const body = await r.text(); if (!body || body.length > 4_000_000 || body.length < 40) return
      net.push({ url: r.url(), status: r.status(), body })
    } catch {}
  })
  const pages: any[] = []
  const queue = [...t.urls]
  const visited = new Set<string>()
  const started = Date.now()
  while (queue.length && pages.length < 7 && Date.now() - started < 150_000) {
    const url = queue.shift()!
    const key = url.replace(/[#?].*$/, '').replace(/\/$/, '')
    if (visited.has(key)) continue
    visited.add(key)
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35_000 })
      await page.waitForTimeout(2500)
      try { await page.waitForLoadState('networkidle', { timeout: 8000 }) } catch {}
      await autoScroll(page)
      // Menus behind a "Menu" tab or accordion: click things that look like it.
      try {
        const btns = await page.$$('button, [role=tab], [role=button], summary')
        let clicked = 0
        for (const b of btns) {
          const tx = ((await b.innerText().catch(() => '')) || '').trim()
          if (clicked < 12 && /^(menu|full menu|view menu|see menu|food|drinks|order|our menu|dinner|lunch|breakfast|brunch|dessert|show more|load more|view all|see all)$/i.test(tx)) { await b.click({ timeout: 1500 }).catch(() => {}); clicked++; await page.waitForTimeout(600) }
        }
        if (clicked) await autoScroll(page)
      } catch {}
      const c = await collect(page)
      const final = page.url()
      pages.push({ url, final, status: resp?.status() ?? null, title: c.title, textFile: `page-${pages.length + 1}.txt`, jsonld: c.jsonld, globals: c.globals, imgs: c.imgs, links: c.links.length })
      writeFileSync(join(dir, `page-${pages.length}.txt`), c.text)
      // Follow menu-ish links: same host, or a known ordering platform.
      const host = new URL(final).host.replace(/^www\./, '')
      const cands = c.links
        .filter((l) => /^https?:/.test(l.href))
        .filter((l) => { try { const h = new URL(l.href).host.replace(/^www\./, ''); return h === host || PLATFORM.test(l.href) } catch { return false } })
        .filter((l) => MENUISH.test(l.text) || MENUISH.test(l.href) || PLATFORM.test(l.href))
        .filter((l) => !/\.(jpg|jpeg|png|gif|webp|svg|mp4|zip)(\?|$)/i.test(l.href))
        .filter((l) => !DENY.test(l.href))
        .map((l) => l.href)
      for (const h of cands) { const k = h.replace(/[#?].*$/, '').replace(/\/$/, ''); if (!visited.has(k) && !queue.includes(h)) queue.push(h) }
      // PDF menus: note them; extraction reads them later.
      const pdfs = c.links.filter((l) => /\.pdf(\?|$)/i.test(l.href) && (MENUISH.test(l.text) || MENUISH.test(l.href))).map((l) => l.href)
      if (pdfs.length) pages[pages.length - 1].pdfs = [...new Set(pdfs)]
    } catch (e: any) {
      pages.push({ url, error: String(e?.message || e).slice(0, 300) })
    }
  }
  const imgs = pages.flatMap((p) => (p.imgs || []).map((i: any) => ({ ...i, page: p.final })))
  for (const p of pages) delete p.imgs
  writeFileSync(join(dir, 'pages.json'), JSON.stringify({ id: t.id, name: t.name, at: new Date().toISOString(), pages }, null, 1))
  writeFileSync(join(dir, 'images.json'), JSON.stringify(imgs, null, 1))
  net.forEach((n, i) => writeFileSync(join(dir, `net-${i + 1}.json`), JSON.stringify({ url: n.url, status: n.status }) + '\n' + n.body))
  await page.close().catch(() => {})
  console.log(`${t.id}: ${pages.length} pages, ${imgs.length} images, ${net.length} json responses${pages.some((p) => p.error) ? ' (some errors)' : ''}`)
}

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 900 }, locale: 'en-US',
})
// tsx compiles helper calls to `__name(...)` into the functions page.evaluate
// ships to the browser, where no such helper exists.
await ctx.addInitScript('window.__name = (f) => f')
let i = 0
await Promise.all(Array.from({ length: CONC }, async () => {
  while (i < targets.length) { const t = targets[i++]; await Promise.race([scrape(ctx, t), new Promise((r) => setTimeout(r, 200_000))]).catch((e) => console.log(`${t.id}: FAILED ${e?.message}`)) }
}))
await browser.close()
console.log('done')
