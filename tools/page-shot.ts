import { chromium } from 'playwright'
const ids = process.argv.slice(2)
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 })
await ctx.addInitScript('window.__name = (f) => f')
for (const id of ids) {
  const p = await ctx.newPage(); await p.goto(`http://localhost:8799/?b=${id}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200)
  // scroll to the first menu row so the shot shows sections + thumbs
  await p.evaluate(() => { const el = document.querySelector('.cat-tabs, .menu-cat'); el?.scrollIntoView({ block: 'start' }) }); await p.waitForTimeout(500)
  await p.screenshot({ path: `${process.env.SHOT_DIR || '.'}/${id}.png` })
  const rows = await p.$$eval('.menu-row', (r) => r.length); const tabs = await p.$$eval('.cat-tab', (r) => r.map((x) => x.textContent))
  const broken = await p.$$eval('img', (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src).slice(0, 5))
  console.log(id, 'rows', rows, 'tabs', tabs.length, tabs.slice(0, 6).join('|'), broken.length ? 'BROKEN ' + broken.join(',') : 'imgs ok')
  await p.close()
}
await b.close()
