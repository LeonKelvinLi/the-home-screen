/*
  THE BUSINESSES, AS THE CRM SEES THEM.

  Read from the same modules the app renders (BRANDS, CITY_PLACEMENTS, the
  page category lists), once, at import. The CRM never keeps its own copy of a
  business: an opportunity holds a brand id, and everything shown about the
  business comes from here, so an edit to src/data is what the CRM shows after
  the next deploy.
*/
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BRANDS } from '../../src/data/brands'
import { CITY_PLACEMENTS } from '../../src/data/placements'
import { BEASTY_SHEETS, SLOT_PAGES } from '../../src/data/slots'
import { CITY_PAGES } from '../../src/data/cities'
import { channelsOf, familyKey, websiteStatusOf } from '../../src/crm/model'
import type { Channels, WebsiteStatus } from '../../src/crm/model'

export interface Seat {
  key: string
  city: string
  page: string
  spot: number
  category: string | null
  yellow: boolean
}

export interface Business {
  id: string
  name: string
  familyKey: string
  cuisine: string
  tagline: string
  /** The first city page it sits on; "BEASTY pages" when it is only on the flagship sheets. */
  city: string
  category: string
  seats: Seat[]
  freeListing: boolean
  site: string | null
  websiteStatus: WebsiteStatus
  address: string | null
  hours: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  channels: Channels
  isIndividual: boolean
  beastyOwner: boolean
  pageUrl: string
}

const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const CITY_BY_SLUG = new Map<string, string>([['beasty', 'BEASTY']])
for (const c of CITY_PAGES) CITY_BY_SLUG.set(slug(c), c)
const PAGES = [...BEASTY_SHEETS, ...SLOT_PAGES]
const SEAT_RE = /^(.*)-(goods2|services2|goods|services|online|individuals)-(\d+)$/

const seatsById = new Map<string, Seat[]>()
for (const [key, id] of Object.entries(CITY_PLACEMENTS)) {
  const m = SEAT_RE.exec(key)
  if (!m) continue
  const [, citySlug, kind, idx] = m
  const page = PAGES.find((p) => p.kind === kind)
  const city = CITY_BY_SLUG.get(citySlug) ?? citySlug
  const cat = page?.categories[Number(idx)]
  const seat: Seat = {
    key,
    city,
    page: page?.heading ?? kind,
    spot: Number(idx) + 1,
    /* On the flagship sheets and the yellow pages the category list is not
       the business's trade (Dr. Comics sat in "Veterinary clinic"). */
    category: city !== 'BEASTY' && !page?.yellow && cat ? cat.name : null,
    yellow: !!page?.yellow,
  }
  const list = seatsById.get(id) ?? []
  list.push(seat)
  seatsById.set(id, list)
}

interface BrandLike {
  id: string
  name: string
  cuisine?: string
  tagline?: string
  site?: string
  needsSite?: boolean
  beastyOwner?: boolean
  tier?: number
  address?: string
  hours?: string
  phone?: string
  email?: string
  instagram?: string
}

function toBusiness(b: BrandLike): Business {
  const seats = (seatsById.get(b.id) ?? []).slice().sort((x, y) => Number(x.city === 'BEASTY') - Number(y.city === 'BEASTY'))
  const citySeat = seats.find((s) => s.city !== 'BEASTY')
  return {
    id: b.id,
    name: b.name,
    familyKey: familyKey(b.name),
    cuisine: b.cuisine ?? '',
    tagline: b.tagline ?? '',
    city: citySeat?.city ?? 'BEASTY pages',
    category: citySeat?.category ?? b.cuisine ?? '',
    seats,
    freeListing: b.tier === 1,
    site: b.site ?? null,
    websiteStatus: b.beastyOwner ? 'has_site' : websiteStatusOf(b),
    address: b.address ?? null,
    hours: b.hours ?? null,
    phone: b.phone ?? null,
    email: b.email ?? null,
    instagram: b.instagram ?? null,
    channels: channelsOf(b),
    isIndividual: seats.some((s) => s.page === 'Individuals'),
    beastyOwner: !!b.beastyOwner,
    pageUrl: `/?b=${b.id}`,
  }
}

const BY_ID = new Map<string, Business>()
for (const b of BRANDS as unknown as BrandLike[]) BY_ID.set(b.id, toBusiness(b))

export const businessById = (id: string | null | undefined): Business | null => (id ? BY_ID.get(id) ?? null : null)

/** Every business that sits somewhere on the pages, once each. */
export const seatedBusinesses = (): Business[] => [...BY_ID.values()].filter((b) => b.seats.length > 0)

/* ---------------------------------------------------------- research notes */

const here = dirname(fileURLToPath(import.meta.url))
let notes: Map<string, string[]> | null = null

/**
 * What the research recorded about a business: the `flags` of its last batch
 * record. Internal notes; the CRM shows them to the team only. Read lazily and
 * once, because the files are large and only a detail view needs them.
 */
export function researchNotes(id: string): string[] {
  if (!notes) {
    notes = new Map()
    try {
      const dir = join(here, '..', '..', 'research', 'roster')
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
        const rows = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { id?: string; flags?: string[] }[]
        for (const r of rows) if (r.id) notes.set(r.id, Array.isArray(r.flags) ? r.flags : [])
      }
    } catch {
      /* No research folder in this deployment: the detail view shows none. */
    }
  }
  return notes.get(id) ?? []
}
