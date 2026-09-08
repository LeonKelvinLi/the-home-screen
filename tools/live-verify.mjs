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

// ---- the roster research, on the pages it filled ------------------------
/*
  Eighty-eight roster seats were filled from the businesses' own sites on
  2026-09-01 — hours, menus, quote lists, contact-only notes. A title check
  proves the page exists; this proves the facts reached it: hours under the
  address, a priced menu or a quote group, or the contact card with a number.
  And the quote note is styled — it ran edge to edge, unstyled, from Aug 5.
*/
for (const [id, want, expect] of [
  ['b_soltaqueria', 'Sol Taqueria', { hours: 'Mon-Thu 10am-9pm', rows: 4 }],
  ['b_jdiautodetailing', 'JDI Auto Detailing', { hours: 'Mon-Sat 8am-6pm', rows: 8, quote: true }],
  ['b_kababburger', 'Kabab Burger', { hours: 'Mon-Thu 11am-8pm', rows: 4 }],
  ['b_eaglepetgrooming', 'Eagle Pet Grooming', { call: '(650) 278-3611' }],
  ['b_shakashack', 'Shaka Shack', { hours: 'Mon-Tue, Thu-Sun 8:30am-3pm', rows: 4 }],
  ['b_baysidefencing', 'Bay Side Fencing Co', { hours: 'Mon-Fri 9am-4pm', call: '925-420-6268' }],
  ['b_sincitypits', 'Sin City Pits', { photos: 2 }],
  /* The 2026-09-02 sweep of the whole thread: two he sent and nobody seated. */
  ['b_houseofwings', 'House of Wings California', { hours: 'Daily 11am-10pm' }],
  ['b_empirestatepizza', 'Empire State Pizza', { hours: 'Daily 11am-9pm', rows: 4, photos: 1 }],
  /* 2026-09-03 overnight batch */
  ['b_rubenhibachigrill', 'Ruben Hibachi Grill', { hours: 'Wed-Fri 3pm-10pm' }],
  ['b_gourmetburritos', 'Gourmet Burritos', { hours: 'Open 24 hours' }],
  ['b_thetoxalamo', 'The Tox Alamo', {}],
  ['b_loveburn', 'Love Burn Hot Chicken', { hours: 'Mon-Fri 11:30am-7pm' }],
  ['b_phonationnewark', 'Pho Nation', { hours: 'Daily 11am-9pm', call: '(510) 894-2584' }],
  ['b_phonationalameda', 'Pho Nation', { hours: 'Daily 5pm-2am', rows: 4 }],
  ['b_chikindripunioncity', 'Chikin Drip', { hours: 'Sun-Thu 11am-1am', rows: 4 }],
  ['b_calipartybus', 'Cali Party Bus', { hours: 'Mon-Fri 8am-7pm', rows: 8, quote: true }],
  ['b_pijjaparadiselivermore', 'Pijja Paradise', {}],
  ['b_elranchogrande', 'Rancho Grande Taqueria', { hours: 'Mon-Thu and Sat 8am-9pm', call: '(925) 600-8620' }],
  /* 2026-09-05: the four from the thread, and the full menus with their own
     photos — a row count well under what each publishes, so a trimmed offer
     cannot pass for the menu. */
  ['b_dadsbbq', "Dad's BBQ", { hours: 'Every day 11am-8:30pm', rows: 20 }],
  ['b_tonysstyle', "Tony's Style", { call: '917-244-4797' }],
  ['b_caitlynssweets', "Caitlyn's Sweets", {}],
  ['b_armentalandscape', 'Armenta Landscape Co.', { call: '(925) 481-0609' }],
  ['b_phonationnewark', 'Pho Nation', { rows: 40 }],
  ['b_greatimpasta', 'Great Impasta', { rows: 80 }],
  ['b_pippal', 'Pipp\u0101l', { rows: 60 }],
  ['b_jackiesplace', "Jackie's Place", { rows: 60 }],
  ['b_kaisendon', 'Kaisen Don', { rows: 150 }],
  ['b_1upretro', '1-Up Retro', { rows: 4 }],
  ['b_walkfree', 'Walk Free', { photos: 3 }],
  ['b_lushspaw', 'Lush Spaw', { rows: 8, quote: true, call: '(833) 279-5874' }],
  ['b_russfamkitchen', 'Russ Fam Kitchen', { hours: 'Tue-Sun 8:30am-12pm', rows: 20, call: '510-691-3658' }],
  ['b_tastinpeachy', 'Tastin Peachy', { call: '510-685-7876' }],
  /* 2026-09-08: the batch he sent on the night of the 7th and the weekend's
     five. Row counts sit under what each publishes, as above. */
  ['b_sushinaloa', 'Sushinaloa', { hours: 'Wed-Mon 10am-10pm', rows: 40, call: '(650) 771-1620' }],
  ['b_kusanbazaarmilpitas', 'Kusan Bazaar', { hours: 'Mon-Thu 11am-2:30pm', rows: 40, call: '(408) 549-2078' }],
  ['b_kusanuyghurcuisinesanjose', 'Kusan Uyghur Cuisine', { call: '(650) 899-0210' }],
  ['b_varnishnailboutiquewalnutcreek', 'Varnish Nail Boutique', { hours: 'Mon-Sat 9:30am-7pm', rows: 40, quote: true, call: '(925) 506-3101' }],
  ['b_bodyrokberkeley', 'BODYROK East Bay', { rows: 20, quote: true }],
  ['b_bhanmaevane', 'Bhan Mae Vane', { hours: 'Tue-Sun 11am-3pm', rows: 38, call: '510-227-5197' }],
  ['b_jollyrogerland', 'Jolly Roger Land', { hours: 'Mon-Wed 10am-7:30pm', rows: 25, quote: true, call: '510-362-7996' }],
  ['b_paradanewperu', 'Parada New Peru', { hours: 'Mon-Thu 11am-9pm', call: '925-448-8118' }],
  ['b_goodcompenny', 'Good Compenny', {}],
  ['b_bobaclub', 'Boba Club', {}],
  ['b_doodlecakes', 'Doodle Cakes', { hours: 'Wed-Sat 11am-3pm', rows: 20 }],
  ['b_housingauthority', 'Housing Authority', {}],
  ['b_chipcookies', 'Chip Cookies', { hours: 'Sun-Thu 10am-10pm' }],
]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle', timeout: 45000 })
  await p.waitForTimeout(600)
  const got = await p.evaluate(() => {
    const txt = (sel) => document.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const q = document.querySelector('.brand-quote-note')
    return {
      title: txt('h1'),
      hours: txt('.brand-hours'),
      rows: document.querySelectorAll('.menu-row').length,
      quotePad: q ? Math.round(q.getBoundingClientRect().left) : null,
      /* A page with a full menu draws no contact block — the number sits in
         its own row under the address — so the check reads the whole page. */
      call: txt('.brand-contact') + ' ' + (document.body?.innerText || '').replace(/\s+/g, ' '),
      photos: document.querySelectorAll('.brand-photos-track img').length,
    }
  })
  console.log(`${id.padEnd(22)}: ${got.title} | ${got.hours || '-'} | ${got.rows} rows${got.quotePad !== null ? ` | note at x=${got.quotePad}` : ''}`)
  if (got.title !== want) fails.push(`${id} shows "${got.title}", expected "${want}"`)
  if (expect.hours && !got.hours.startsWith(expect.hours)) fails.push(`${id} hours read "${got.hours}", expected "${expect.hours}…"`)
  if (expect.rows && got.rows < expect.rows) fails.push(`${id} shows ${got.rows} rows, expected ${expect.rows}`)
  if (expect.quote && (got.quotePad === null || got.quotePad < 12)) fails.push(`${id}: the quote note is ${got.quotePad === null ? 'missing' : 'unstyled, at x=' + got.quotePad}`)
  if (expect.call && !got.call.includes(expect.call)) fails.push(`${id}: the contact card does not carry ${expect.call}`)
  if (expect.photos && got.photos < expect.photos) fails.push(`${id}: ${got.photos} pictures in the strip, expected ${expect.photos}`)
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

// ---- the way in, which was dead for two days -----------------------------
/*
  READ-ONLY ON PURPOSE. Nothing here submits the form: a real submission on
  beastypages.com creates a member row and sends a real person's address a real
  code. So this asks the server which channels work and checks the form is
  asking for the one that does — which is exactly the mismatch that stranded
  Glenn's nephew.
*/
const chans = await (await fetch(base + '/api/members/channels')).json().catch(() => null)
console.log('channels      :', JSON.stringify(chans))
if (!chans) fails.push('/api/members/channels did not answer — the form cannot know what works')
else if (!chans.sms && !chans.email) fails.push('NEITHER texting nor email is configured live — nobody can sign in at all')

await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 })
const enter = p.locator('[aria-label="Enter BEASTY"]').first()
try { await enter.waitFor({ state: 'visible', timeout: 15000 }); await enter.click(); await p.waitForTimeout(2600) } catch { await p.waitForTimeout(1200) }
if (await p.locator('[aria-label="Enter BEASTY"]').count()) { await enter.click().catch(() => {}); await p.waitForTimeout(2600) }
await p.evaluate(() => window.dispatchEvent(new CustomEvent('beasty:join')))
await p.waitForSelector('.join', { timeout: 20000 }).catch(() => {})
const form = await p.evaluate(() => ({
  tel: document.querySelector('.join input[type=tel]')?.required ?? null,
  email: document.querySelector('.join input[type=email]')?.required ?? null,
  lead: document.querySelector('.join-lead')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 90) ?? '',
}))
console.log('join form     :', JSON.stringify(form))
if (form.tel === null) fails.push('the sign-in form did not render')
else if (chans) {
  if (chans.sms && form.tel !== true) fails.push('texting works live but the form does not require a number')
  if (!chans.sms && form.email !== true) fails.push('texting does NOT work live and the form does not require an email — this is the bug that stranded Glenn’s nephew')
  if (!chans.sms && form.tel === true) fails.push('the form still insists on a number that nothing can text')
  const promises = form.lead.includes('We text you')
  if (promises !== !!chans.sms) fails.push(`the form promises ${promises ? 'a text' : 'an email'} and the server can only send ${chans.sms ? 'a text' : 'an email'}`)
}

// ---- the membership copy, in whichever chunk carries it ------------------
const html = await (await fetch(base + '/')).text()
const seen = new Set()
/*
  THE STYLESHEET COUNTS TOO. This crawled only .js, so a rule that ships
  purely in CSS — a keyframe name, a class that nothing in JS spells out —
  read as "not in any deployed chunk" on a deploy that was serving it. That
  is the same blind spot as the relative-import one below, one file type
  further along.
*/
const queue = [...new Set([...html.matchAll(/assets\/[A-Za-z0-9_-]+\.(?:js|css)/g)].map((m) => m[0]))]
let bundles = ''
while (queue.length) {
  const f = queue.shift()
  if (seen.has(f)) continue
  seen.add(f)
  const t = await (await fetch(`${base}/${f}`)).text()
  bundles += t
  for (const m of t.matchAll(/assets\/[A-Za-z0-9_-]+\.(?:js|css)/g)) if (!seen.has(m[0])) queue.push(m[0])
  /*
    A CHUNK IMPORTS ITS SIBLINGS RELATIVELY — `import("./Shell-IfFj92Yv.js")`,
    no "assets/" in front — so the crawl above stopped at the entry chunk and
    every string that lives in the Shell (the whole app UI) read as "not in
    any deployed chunk". That is the false negative tools/live-check.mjs was
    written about; this follows the relative form too.
  */
  for (const m of t.matchAll(/["'`]\.\/([A-Za-z0-9_-]+\.js)["'`]/g)) { const f2 = `assets/${m[1]}`; if (!seen.has(f2)) queue.push(f2) }
}
console.log(`bundles       : ${seen.size} file(s), ${Math.round(bundles.length / 1024)}kb`)
for (const s of [
  'Unlimited Loyalty and Welcome offers', 'members-perk-head', 'Tickets keep for any monthly raffle',
  /* 2026-09-02: his domain address on Contacts, Leon's on Designs and MAKE $, his
     sentence where Richmond was, the two-sided Members page, the Designs form. */
  'glenn@beastypages.com', 'designs@beastypages.com', 'Get in touch directly with the owner of beastypages.com',
  'BEASTY Affiliate Member', 'Affiliate tiers', 'Get in touch', 'Referral Klub (BARK)',
  'sin-city-pits-breeder', 'brand-photos-track',
  /* The four reels the sweep found never attached. */
  'DaBs4utDZXb', 'DYI6AJgIFII', 'DYlU7BcoAMi', 'DcHlbGcBBX2',
  /* The Contacts list reads real members (2026-09-02). */
  'api/members/directory', 'members so far',
  'san-lorenzo', 'Initiation and annual fees', 'point-richmond', 'hercules',
  'is-glow', 'icon-glow',
  /* The screens that were showing account data without reading the account. */
  'joinedAt', 'raffle tickets', 'Open the whole directory and earn rewards',
  /* 2026-09-06: the rotating pass on the member card, a member's page from
     Contacts, the numbered tickets on Rewards, and the yearly switch's style
     (the switch itself stays hidden until a yearly price exists). */
  'api/members/pass', 'Refreshes in', 'single scan', 'api/members/', '/profile', 'Nothing liked yet',
  'api/members/tickets', 'ticket-stub', 'members-interval',
]) {
  if (!bundles.includes(s)) fails.push(`"${s}" is not in any deployed chunk`)
}
/* And what he asked to have taken off: the old addresses, the city line, the
   $20 holding card, Leon's number, the old acronym. A deploy that still ships
   one of these is the old build. */
for (const s of ['Glennmalicdem78', 'leondragon3798', 'splk3798', 'Richmond, California', 'Holding your spot', '5108267735', 'BARP']) {
  if (bundles.includes(s)) fails.push(`"${s}" is still in a deployed chunk`)
}

/* The pass and the till, from outside: no session means no pass, and no vendor
   or operator token means no scan. Both are the doors that must be shut on the
   live site; neither creates anything. */
const passOut = await fetch(base + '/api/members/pass').then((r) => r.status).catch(() => 0)
const scanOut = await fetch(base + '/api/pass/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"token":"bp1.x.1.y"}' }).then((r) => r.status).catch(() => 0)
console.log(`pass          : signed out ${passOut} | scan without a token ${scanOut}`)
if (passOut !== 401) fails.push(`/api/members/pass answered ${passOut} signed out, expected 401`)
if (scanOut !== 401) fails.push(`/api/pass/verify answered ${scanOut} with no vendor or operator token, expected 401`)

await b.close()
if (fails.length) { console.log('\nFAIL: ' + fails.join('; ')); process.exit(1) }
console.log(`\nPASS on ${base}: the chapter stays open, the pages render, the roster facts show, the button links, the folded perks shipped.`)
