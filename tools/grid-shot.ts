/* Screenshot the home grid of a city: npx tsx tools/grid-shot.ts "Antioch" "Albany" ... (SHOT_DIR for output) */
import { chromium } from 'playwright'
const cities = process.argv.slice(2)
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 })
await ctx.addInitScript('window.__name = (f) => f')
for (const city of cities) {
  const p = await ctx.newPage()
  await p.addInitScript((c) => { try { localStorage.setItem('ths.city', c) } catch {} }, city)
  await p.goto('http://localhost:8799/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  await p.screenshot({ path: `${process.env.SHOT_DIR || '.'}/grid-${city.toLowerCase().replace(/\s+/g, '-')}.png` })
  const labels = await p.$$eval('.icon-label, .app-label, [class*=label]', (els) => els.map((e) => e.textContent?.trim()).filter(Boolean).slice(0, 60))
  console.log(city, labels.join(' | ').slice(0, 300))
  await p.close()
}
await b.close()
