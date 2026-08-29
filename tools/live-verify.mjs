/*
  Is it actually working on beastypages.com?

  Not "did the string ship" — tools/live-check.mjs answers that, and it is not
  the same question. Glenn's drop-down bug would have passed a string check
  every day it was broken: the code was all there, it just remounted itself.

  So this drives the real site in a real browser and checks the behaviour he
  reported, plus the pages added with it. It creates NOTHING: no sign-in, no
  member row, no SMS. Everything here is reachable signed out, which is why the
  membership screen is checked by the strings in its bundle rather than by
  opening it — the alternative is a real account and a real text message.

      node tools/live-verify.mjs [--url https://...]
*/
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const i = args.indexOf('--url')
const base = i !== -1 ? args[i + 1] : 'https://beastypages.com'

const fails = []
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })

// ---- Glenn's bug, on the live site --------------------------------------
await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 })
await p.click('[aria-label="1"]').catch(() => {})
await p.waitForSelector('[aria-label="1. ABOUT"]', { timeout: 20000 }).catch(() => {})
await p.click('[aria-label="1. ABOUT"]').catch(() => {})
const chapters = await p.waitForSelector('.panel-chapter-head', { timeout: 20000 }).then(() => true).catch(() => false)
if (!chapters) fails.push('the About panel never opened')
else {
  await p.evaluate(() => document.querySelector('.panel-chapter-head')?.click())
  await p.waitForTimeout(300)
  const opened = await p.evaluate(() => document.querySelectorAll('.panel-chapter-body').length)
  const was = await p.evaluate(() => document.querySelector('.dialer')?.className ?? '')
  /* Wait for the photo to actually swap — that re-render is what used to close
     the chapter. If it never comes, say so rather than calling it a pass. */
  const moved = await p.waitForFunction(
    (w) => ((document.querySelector('.dialer')?.className ?? '').includes('is-photo')) !== w.includes('is-photo'),
    was, { timeout: 12000 },
  ).then(() => true).catch(() => false)
  const still = await p.evaluate(() => ({
    bodies: document.querySelectorAll('.panel-chapter-body').length,
    expanded: [...document.querySelectorAll('.panel-chapter-head')].filter((h) => h.getAttribute('aria-expanded') === 'true').length,
  }))
  console.log('about         : opened', opened, '| re-rendered', moved, '| still open', still.expanded)
  if (opened !== 1) fails.push(`tapping a chapter opened ${opened} bodies, expected 1`)
  if (!moved) fails.push('the landing photo never swapped, so the stays-open check proved nothing')
  else if (still.expanded !== 1 || still.bodies !== 1) fails.push('A CHAPTER CLOSED ITSELF ON RE-RENDER — Glenn’s glitch is still live')
}

// ---- the pages added with it --------------------------------------------
for (const [id, want] of [
  ['b_pinkonion', 'Pink Onion'],
  ['b_alorasocial', 'Alora Social'],
  ['b_napapedalcrusher', 'Napa Pedal Crusher'],
]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle', timeout: 45000 })
  await p.waitForTimeout(600)
  const title = await p.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? null)
  console.log(`${id.padEnd(22)}: ${title}`)
  if (title !== want) fails.push(`${id} shows "${title}", expected "${want}"`)
}

// ---- the Instagram button ------------------------------------------------
await p.goto(`${base}/?b=b_baymemoriesbooth`, { waitUntil: 'networkidle', timeout: 45000 })
await p.waitForTimeout(600)
const ig = await p.evaluate(() => {
  const a = document.querySelector('.brand-ig')
  return a ? { href: a.getAttribute('href'), h: Math.round(a.getBoundingClientRect().height) } : null
})
console.log('instagram     :', JSON.stringify(ig))
if (!ig) fails.push('the Instagram button is not on the live Bay Memories page')
else if (ig.href !== 'https://www.instagram.com/baymemories_booth/') fails.push(`the Instagram button points at ${ig.href}`)

// ---- the membership copy, in whichever chunk carries it ------------------
const html = await (await fetch(base + '/')).text()
const seen = new Set()
const queue = [...new Set([...html.matchAll(/assets\/[A-Za-z0-9_-]+\.js/g)].map((m) => m[0]))]
let bundles = ''
while (queue.length) {
  const f = queue.shift()
  if (seen.has(f)) continue
  seen.add(f)
  const t = await (await fetch(`${base}/${f}`)).text()
  bundles += t
  for (const m of t.matchAll(/assets\/[A-Za-z0-9_-]+\.js/g)) if (!seen.has(m[0])) queue.push(m[0])
}
console.log(`bundles       : ${seen.size} chunk(s), ${Math.round(bundles.length / 1024)}kb`)
for (const s of ['Unlimited Loyalty and Welcome offers', 'members-perk-head', 'Tickets keep for any monthly raffle']) {
  if (!bundles.includes(s)) fails.push(`"${s}" is not in any deployed chunk`)
}

await b.close()
if (fails.length) { console.log('\nFAIL: ' + fails.join('; ')); process.exit(1) }
console.log(`\nPASS on ${base}: the chapter stays open, three new pages render, the button links, the folded perks shipped.`)
