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
import { BRANDS, brandById } from '../src/data/brands'
import { CITY_PLACEMENTS } from '../src/data/placements'
import { CITY_PAGES } from '../src/data/cities'
import { ARCHIVE_DAYS, currentNews, archivedNews, dayLabel, upcoming } from '../src/data/news'
import {
  GOODS_CATEGORIES,
  SERVICE_CATEGORIES,
  OPEN_SPOTS,
  ONLINE_CATEGORIES,
  INDIVIDUAL_SPOTS,
} from '../src/data/slots'
import { BEASTY_GOODS_ROSTER, BEASTY_SERVICES_ROSTER } from '../src/data/roster'
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
const KINDS: Record<string, number> = {
  goods: GOODS_CATEGORIES.length,
  services: SERVICE_CATEGORIES.length,
  goods2: OPEN_SPOTS.length,
  services2: OPEN_SPOTS.length,
  online: ONLINE_CATEGORIES.length,
  individuals: INDIVIDUAL_SPOTS.length,
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
  ['BEASTY goods', BEASTY_GOODS_ROSTER],
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
for (const f of out) console.log(`${f.level.padEnd(5)} ${f.what}`)
const errors = out.filter((f) => f.level === 'ERROR').length
console.log(
  `\n${errors} error(s), ${out.filter((f) => f.level === 'WARN').length} warning(s), ` +
    `${out.filter((f) => f.level === 'NOTE').length} note(s)`,
)
process.exit(errors ? 1 : 0)
