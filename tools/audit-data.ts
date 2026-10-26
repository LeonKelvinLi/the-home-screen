/*
  Data audit. Everything here is a claim the app makes that could be false
  without anything crashing or failing to build.

  The bugs this class has already produced in this repo: a brand seated on a key
  that resolved to nothing because its city had no page; `address` missing from
  one of two seed mappings so a published street address never reached a page;
  `siteCta` missing from the same mapping so a button read the wrong words; a
  duplicate slug quietly forking a business into two; icons referenced that were
  never written. None of those fail a typecheck.

  RUN IT WITH THE APP'S TSCONFIG:

      npx tsx --tsconfig tsconfig.app.json tools/audit-data.ts

  Plain `npx tsx tools/audit-data.ts` dies on "React is not defined" — it picks
  up the root tsconfig, which does not carry the `react-jsx` runtime, and this
  audit imports the registry, which is full of JSX. The flag is the whole fix.
*/
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BRANDS, VENDORS, brandById } from '../src/data/brands'
import { CITY_PLACEMENTS } from '../src/data/placements'
import { CITY_PAGES } from '../src/data/cities'
import { BEASTY_CATEGORIES, CATEGORY_KINDS, CATEGORY_SPOTS } from '../src/data/categories'
import { CATEGORY_PLACEMENTS } from '../src/data/categorySeats'
import { PAGE_KINDS, HOME_PAGES, categoriesFor } from '../src/data/slots'
import { ARCHIVE_DAYS, currentNews, archivedNews, dayLabel, upcoming } from '../src/data/news'
import {
  GOODS_CATEGORIES,
  SERVICE_CATEGORIES,
  OPEN_SPOTS,
  ONLINE_CATEGORIES,
  INDIVIDUAL_SPOTS, BOUTIQUE_SPOTS, EATS_CATEGORIES, SWEETS_CATEGORIES,
} from '../src/data/slots'
import { BEASTY_EATS_ROSTER, BEASTY_SERVICES_ROSTER, ROSTER_SEED } from '../src/data/roster'
import { OTHER_REVIEWS } from '../src/data/foodies'
import { ONLINE_FILLS } from '../src/data/onlineFills'
import { LOCAL_SEED } from '../src/data/localBrands'
import { ALL_APPS, DOCK_SETS, APP_GROUPS } from '../src/apps/registry'

type Finding = { level: 'ERROR' | 'WARN' | 'NOTE'; what: string }
const out: Finding[] = []
const err = (w: string) => out.push({ level: 'ERROR', what: w })
const warn = (w: string) => out.push({ level: 'WARN', what: w })
const note = (w: string) => out.push({ level: 'NOTE', what: w })

const slug = (c: string) =>
  c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')
const citySlugs = new Set((CITY_PAGES as readonly string[]).map(slug))
const ids = new Set(BRANDS.map((b) => b.id))

// ---- 1. one brand, one id ------------------------------------------------
const seen = new Map<string, number>()
for (const b of BRANDS) seen.set(b.id, (seen.get(b.id) ?? 0) + 1)
for (const [id, n] of seen) if (n > 1) err(`brand id ${id} appears ${n}× — two seeds share a slug`)

// ---- 2. every placement resolves, and lands in range ----------------------
/*
  Every page kind, and how many spots it has.

  `online` was missing, so the two businesses seated on BEASTY - Online were
  reported as malformed keys — the audit calling a real, rendering page a typo.
  The alternation below is BUILT from these keys rather than written out again,
  so adding the next page kind here is the only edit needed.
*/
const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')
const KINDS: Record<string, number> = {
  goods: GOODS_CATEGORIES.length,
  services: SERVICE_CATEGORIES.length,
  goods2: OPEN_SPOTS.length,
  services2: OPEN_SPOTS.length,
  online: ONLINE_CATEGORIES.length,
  individuals: INDIVIDUAL_SPOTS.length,
  boutiques: BOUTIQUE_SPOTS.length,
  eats: EATS_CATEGORIES.length,
  sweets: SWEETS_CATEGORIES.length,
  /* The BEASTY category pages, twenty-four each (src/data/categories.ts). */
  ...Object.fromEntries(CATEGORY_KINDS.map((k) => [k, CATEGORY_SPOTS])),
}
/* Longest first, so `goods2` is not eaten by `goods`. */
const KEY_RE = new RegExp(
  `^(.+)-(${Object.keys(KINDS).sort((a, b) => b.length - a.length).join('|')})-(\\d+)$`,
)
const seatOf = new Map<string, string[]>()
for (const [key, id] of Object.entries(CITY_PLACEMENTS)) {
  const m = KEY_RE.exec(key)
  if (!m) {
    err(`placement key is not <city>-<kind>-<n>: ${key}`)
    continue
  }
  const [, city, kind, nRaw] = m
  const n = Number(nRaw)
  if (city !== 'beasty' && !citySlugs.has(city)) err(`placement ${key} names a city with no page`)
  if (n >= KINDS[kind]) err(`placement ${key} is index ${n}, past the ${KINDS[kind]} spots on that page`)
  if (!ids.has(id)) err(`placement ${key} points at ${id}, which is not a brand`)
  seatOf.set(id, [...(seatOf.get(id) ?? []), key])
}
for (const [id, keys] of seatOf) {
  if (keys.length < 2) continue
  /* Built from KINDS for the same reason KEY_RE is: a hand-written copy of the
     page kinds here went stale the moment `individuals` was added, and would
     have derived the "city" as `beasty-individuals` and reported a business as
     seated in two cities. */
  const CITY_RE = new RegExp(
    `-(${Object.keys(KINDS).sort((a, b) => b.length - a.length).join('|')})-\\d+$`,
  )
  const cities = new Set(keys.map((k) => k.replace(CITY_RE, '')))
  /*
    A business on a BEASTY flagship sheet AND in its own city is intended — the
    flagship is the operator's showcase and the city page is where it lives.
    Two different CITIES is the one worth looking at, because a business is
    usually only in one, and that is the shape that would be a mistake.
  */
  const realCities = [...cities].filter((c) => c !== 'beasty')
  if (realCities.length > 1)
    warn(`${brandById(id)?.name ?? id} is seated in ${realCities.length} cities: ${keys.join(', ')} — check it really has that many locations`)
  else note(`${brandById(id)?.name ?? id} sits on the BEASTY sheet and in its city (intended): ${keys.join(', ')}`)
}

// ---- 2a. the BEASTY category pages ---------------------------------------
/*
  Glenn, 2026-09-30: nine category pages on the home screen, every other one in
  Search, each holding its best twenty-four. The list of page kinds is read by
  the server and the CRM too, so a kind missing from it is a seat nobody counts.
*/
for (const k of Object.keys(KINDS)) if (!PAGE_KINDS.includes(k)) err(`page kind ${k} is not in slots.ts PAGE_KINDS`)
/* Every kind names its blanks: a city's blank tile reads "Burgers — spot
   available", not "Reserve a Spot" (lost for a deploy's worth of testing on
   2026-10-05 when BEASTY's first sheet stopped being a city kind). */
for (const k of Object.keys(KINDS)) if (!categoriesFor(k)?.length) err(`page kind ${k} has no spot names (categoriesFor)`)
if (HOME_PAGES.filter((p) => !p.yellow).length !== 9) err(`the home screen has ${HOME_PAGES.filter((p) => !p.yellow).length} category pages, not 9`)
for (const c of BEASTY_CATEGORIES) {
  if (!/^[a-z]+$/.test(c.kind)) err(`category kind ${c.kind} is not plain lower-case letters`)
  if (!existsSync(join(ROOT_DIR, 'public', c.wall))) err(`category ${c.heading} has no background at public${c.wall}`)
  if (!existsSync(join(ROOT_DIR, 'public', c.wall.replace(/\.webp$/, '-thumb.webp')))) err(`category ${c.heading} has no Search thumbnail`)
  const seats = Object.entries(CATEGORY_PLACEMENTS).filter(([s]) => s.startsWith(`beasty-${c.kind}-`))
  const held = new Set<string>()
  for (const [seat, id] of seats) {
    if (!ids.has(id)) err(`category seat ${seat} points at ${id}, which is not a brand`)
    if (held.has(id)) err(`${brandById(id)?.name ?? id} holds two spots on BEASTY · ${c.heading}`)
    held.add(id)
  }
  const matching = c.test ? BRANDS.filter((b) => c.test!.test(b.cuisine) && !c.not?.test(b.cuisine)).length : 0
  if (matching > CATEGORY_SPOTS) warn(`${matching} businesses fit BEASTY · ${c.heading}; only ${CATEGORY_SPOTS} show — pick the best by seating them by hand`)
  note(`BEASTY · ${c.heading}: ${seats.length} of ${CATEGORY_SPOTS} spots filled`)
}

// ---- 2b. menus nobody has confirmed -----------------------------------
/*
  The first version of this guessed, by testing the cuisine against a list of
  food words: it flagged Pippal for saying "Regional Indian", a butcher for
  saying "Butcher" and a Vietnamese kitchen for saying "Vietnamese", and found
  nothing real. The signal was already in the data — `needsOwnerReview` is set
  deliberately wherever a ported menu has never been confirmed with the
  business, so that is what gets counted.

  It is a standing risk rather than a bug: these are PRICES shown for real
  businesses that nobody has checked with them.
*/
const unverified = BRANDS.filter((b) => b.needsOwnerReview && b.menu.some((c) => c.items.length))
if (unverified.length)
  warn(
    `${unverified.length} businesses show priced menus that have never been confirmed with them: ` +
      unverified.map((b) => b.name).join(', '),
  )

// ---- 3. the flagship rosters ---------------------------------------------
for (const [name, roster] of [
  ['BEASTY eats', BEASTY_EATS_ROSTER],
  ['BEASTY services', BEASTY_SERVICES_ROSTER],
] as [string, (string | null)[]][]) {
  if (roster.length !== 24) err(`${name} roster has ${roster.length} seats, expected 24`)
  roster.forEach((id, i) => {
    if (id && !ids.has(id)) err(`${name} #${i + 1} points at ${id}, which is not a brand`)
  })
  const dup = roster.filter((v, i, a) => v && a.indexOf(v) !== i)
  for (const d of new Set(dup)) warn(`${name} seats ${brandById(d!)?.name ?? d} more than once`)
}

// ---- 4. artwork ----------------------------------------------------------
for (const b of BRANDS) {
  const url = b.logo.imageUrl
  if (url && !/^\/icons\/[a-z0-9-]+\.webp$/.test(url)) err(`${b.name} has an odd icon path: ${url}`)
  if (b.photo && !/^\/photos\/[a-z0-9-]+\.webp$/.test(b.photo.src))
    err(`${b.name} has an odd photo path: ${b.photo.src}`)
  if (b.photo && !b.photo.alt) err(`${b.name}'s photo has no alt text`)
  if (b.photo && !b.photo.credit) err(`${b.name}'s photo has no credit`)
}

// ---- 5. links ------------------------------------------------------------
for (const b of BRANDS) {
  for (const [field, v] of [['site', b.site], ['orderUrl', b.orderUrl]] as [string, string?][]) {
    if (!v) continue
    try {
      const u = new URL(v)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') err(`${b.name} ${field} is not http(s): ${v}`)
      if (u.protocol === 'http:') note(`${b.name} ${field} is plain http: ${v}`)
    } catch {
      err(`${b.name} ${field} is not a URL: ${v}`)
    }
  }
}

// ---- 6. claims about businesses ------------------------------------------
const real = BRANDS.filter((b) => b.offers && !b.offers.mock)
if (real.length) note(`offers presented as AGREED (not mock): ${real.map((b) => b.name).join(', ')}`)
for (const b of BRANDS) {
  if (b.offers && !b.offers.welcome && !b.offers.loyalty) err(`${b.name} has an empty offers block`)
  if (b.contactOnly && b.menu.some((c) => c.items.length))
    warn(`${b.name} is contactOnly but still carries ${b.menu.flatMap((c) => c.items).length} priced items`)
}

// ---- 7. the registry -----------------------------------------------------
const appIds = new Set(ALL_APPS.map((a) => a.id))
for (const set of DOCK_SETS) {
  if (set.apps.length !== 4) err(`dock set "${set.name}" has ${set.apps.length} tiles, expected 4`)
  for (const a of set.apps)
    if (!appIds.has(a.id) && !a.page) err(`dock tile ${a.name} (${a.id}) cannot be resolved by appById`)
}
const onGrid = new Set(APP_GROUPS.flat().map((a) => a.id))
for (const id of onGrid) if (seatOf.has(id)) err(`${brandById(id)?.name ?? id} is on the grid AND seated — it will draw twice`)

// ---- 8. coverage ---------------------------------------------------------
const filled = Object.keys(CITY_PLACEMENTS).length
const spots = ((CITY_PAGES as readonly string[]).length + 1) * 48
const emptyCities = (CITY_PAGES as readonly string[]).filter(
  (c) => !Object.keys(CITY_PLACEMENTS).some((k) => k.startsWith(slug(c) + '-')),
)
note(`${filled} of ${spots} numbered spots filled (${((filled / spots) * 100).toFixed(1)}%)`)
note(`${emptyCities.length} of ${(CITY_PAGES as readonly string[]).length} cities have nothing on them`)

// ---- 9. the news rules, checked on their boundaries ----------------------
/*
  BOTH OF THESE ARE ONLY EVER WRONG ON A BOUNDARY, which is the day nobody
  happens to run the app. One of them already shipped wrong: dayLabel collapsed
  every date that was not in the past to "Today", so a closure on the 31st read
  as Today on the 29th — on the one card whose whole job is to say when.

  Fixed clocks, not Date.now(), for the same reason `currentNews` takes one.
*/
{
  const day = 86_400_000
  const now = Date.UTC(2026, 7, 29) // 29 August 2026

  for (const [iso, want] of [
    ['2026-08-29', 'Today'],
    ['2026-08-28', 'Yesterday'],
    ['2026-08-30', 'Tomorrow'],
    ['2026-08-31', '31 August'],
    ['2026-08-20', '20 August'],
  ] as const) {
    const got = dayLabel(iso, now)
    if (got !== want) err(`dayLabel(${iso}) said "${got}", expected "${want}"`)
  }

  /* Thirty days on the front page, and the thirtieth day is still on it. */
  const onTheEdge = new Date(now - ARCHIVE_DAYS * day).toISOString().slice(0, 10)
  const justOver = new Date(now - (ARCHIVE_DAYS + 1) * day).toISOString().slice(0, 10)
  const live = currentNews(now).map((n) => n.date)
  const old = archivedNews(now).map((n) => n.date)
  if (live.some((d) => d < onTheEdge)) err(`a post older than ${ARCHIVE_DAYS} days is still on the front page`)
  if (old.some((d) => d >= onTheEdge)) err('a post inside the archive window was archived early')
  if (currentNews(now).length + archivedNews(now).length === 0) err('the news feed has nothing in it at all')
  note(`news: ${live.length} live, ${old.length} archived, cut at ${onTheEdge} (${justOver} would be archived)`)

  /* An event dated in the past must not sit on the calendar as upcoming. */
  const stale = upcoming(now).filter((n) => n.eventDate! < new Date(now - day).toISOString().slice(0, 10))
  if (stale.length) err(`${stale.length} news event(s) dated in the past are still listed as upcoming`)
  note(`news: ${upcoming(now).length} dated event(s) reach the calendar`)
}

// ---- report --------------------------------------------------------------
const order = { ERROR: 0, WARN: 1, NOTE: 2 }
out.sort((a, b) => order[a.level] - order[b.level])
/*
  HOURS ARE ONE LINE OR NOTHING. The field exists so a page can say when a
  place is open; a paragraph, a second schedule, or a "see website" is not
  hours and is the kind of thing that arrives from careless research.
*/
for (const b of BRANDS) {
  const h = (b as { hours?: string }).hours
  if (!h) continue
  if (h.length > 120) err(`${b.name}: hours is ${h.length} chars — that is prose, not a schedule: "${h.slice(0, 60)}…"`)
  if (/\n/.test(h)) err(`${b.name}: hours contains a line break`)
  /* Anchored at the start: "Mon–Sun 9–5:30 (Sunday varies)" is a schedule
     with the business's own caveat on it; "Varies" alone is not a schedule. */
  if (/^\s*(see (website|site)|call for|varies|tbd|coming soon)/i.test(h)) err(`${b.name}: hours says "${h}" — not a schedule, leave it unset`)
}

/*
  A ROSTER NAME WITH RESEARCH MUST NOT STILL SAY HE IS GATHERING DETAILS.
  The overlay drops the note when research arrives; this holds that.
*/
for (const b of BRANDS) {
  const hasFacts = (b.menu ?? []).some((c) => c.items.length) || (b.groups ?? []).length || b.address || b.phone
  if (b.rosterOnly && hasFacts && /nothing is listed yet/.test(b.contactOnly ?? '')) {
    err(`${b.name}: carries a published address/menu AND the "still gathering details" roster note`)
  }
}

/*
  A NOTE IS PROSE A VISITOR READS. Two sentences glued by a generator show
  their seams: a full stop doubled through a closing quote (`driveway.'.`) and
  a sentence that starts lowercase after one. JDI Auto Detailing shipped both
  to the local build on 2026-09-01 before anyone looked at the page.
*/
for (const b of BRANDS) {
  for (const [field, text] of [['contactOnly', b.contactOnly], ['quoteOnly', b.quoteOnly], ['siteNote', b.siteNote]] as const) {
    if (!text) continue
    if (/[.!?]['"\u2019\u201d]\./.test(text) || /\.\s*\./.test(text)) err(`${b.name}: ${field} has a doubled full stop: "${text.slice(0, 80)}"`)
    /* A full stop only: `doorstep!' — delivering` is a quoted exclamation
       mid-sentence, not a seam. */
    if (/\.['"\u2019\u201d]?\s+[a-z]/.test(text)) err(`${b.name}: ${field} starts a sentence in lowercase: "${text.slice(0, 80)}"`)
  }
}

/*
  PRICES ARE MONEY. Anything under a dollar on a menu is almost always a
  units slip (dollars typed where cents were meant); anything over $5,000 on a
  small-business menu is a floor that lost its label or a typo.
*/
for (const b of BRANDS) {
  for (const c of b.menu ?? []) for (const it of c.items) {
    if (it.price > 0 && it.price < 100) warn(`${b.name}: "${it.name}" is priced ${it.price} cents — units slip?`)
    if (it.price > 500_000) warn(`${b.name}: "${it.name}" is $${(it.price / 100).toFixed(0)} — a floor that lost its label, or a typo?`)
  }
}

/*
  A MENU THAT CAN BE ORDERED HAS A KITCHEN TO SEND IT TO.

  On 13 September 2026 71 roster businesses had researched menus and no vendor,
  because VENDORS was built from two of the three seed lists. Every order for
  one wrote a ticket for a vendor with no row, failed a foreign key, and took
  the server down. The server now refuses to index such an item and survives
  the error, but a business that shows a menu and cannot take an order is still
  wrong, and this is where it is caught before it ships.
*/
{
  const vendorIds = new Set(VENDORS.map((v) => v.id))
  for (const b of BRANDS) {
    if (b.quoteOnly || b.contactOnly || !b.menu.some((c) => c.items.length > 0)) continue
    if (!vendorIds.has(b.vendorId)) err(`${b.name}: orderable menu but no vendor ${b.vendorId} — its orders cannot be written`)
  }
}

/*
  THREE FILMS A PAGE AT MOST. Glenn, 2026-10-24: "Clip this video plz (3rd)
  limit 3 per affiliate". A page's films are its own (`clip`) and the second
  reviews played under it (OTHER_REVIEWS with that brand and a cut copy), each
  of which must exist on disk.
*/
{
  const films = new Map<string, number>()
  for (const b of BRANDS) if (b.clip?.src) films.set(b.id, 1)
  for (const r of OTHER_REVIEWS) {
    if (!r.clip) continue
    const code = /\/reel\/([^/]+)\//.exec(r.reel)?.[1]
    if (!code) { err(`OTHER_REVIEWS ${r.place}: clip: true but no reel code in ${r.reel}`); continue }
    if (!existsSync(join(ROOT_DIR, 'public', 'clips', `review-${code}.mp4`))) err(`OTHER_REVIEWS ${r.place}: public/clips/review-${code}.mp4 is missing`)
    if (!r.brand) continue
    if (!brandById(r.brand)) err(`OTHER_REVIEWS ${r.place}: brand ${r.brand} does not exist`)
    films.set(r.brand, (films.get(r.brand) ?? 0) + 1)
  }
  for (const [id, n] of films) if (n > 3) err(`${brandById(id)?.name ?? id}: ${n} films — Glenn's limit is 3 a page`)
}

/* A FILL FROM A SEARCH LANDS ON A REAL PAGE (onlineFills.ts), and an estimated menu says so. */
{
  const slugs = new Set([...ROSTER_SEED, ...LOCAL_SEED].map((s) => s.slug))
  for (const [slug, f] of Object.entries(ONLINE_FILLS)) {
    if (!slugs.has(slug)) err(`ONLINE_FILLS ${slug}: no seed has this slug`)
    if (f.hours && f.hours.length >= 120) err(`ONLINE_FILLS ${slug}: hours line is ${f.hours.length} characters`)
  }
}

for (const f of out) console.log(`${f.level.padEnd(5)} ${f.what}`)
const errors = out.filter((f) => f.level === 'ERROR').length
console.log(
  `\n${errors} error(s), ${out.filter((f) => f.level === 'WARN').length} warning(s), ` +
    `${out.filter((f) => f.level === 'NOTE').length} note(s)`,
)
process.exit(errors ? 1 : 0)
