import type { PetAvatar } from '../lib/profile'

/**
 * Sample profiles, so the people directory can be seen before accounts exist.
 *
 * The operator asked for the Contacts tab to list PEOPLE rather than businesses
 * — his reasoning is sound, the home screen is already how you find a business
 * — and asked for placeholder accounts until account creation is wired.
 *
 * THESE ARE MARKED AS SAMPLES ON SCREEN, and that is not negotiable dressing.
 * The stated purpose of the list is to show "how big our users are growing", so
 * the count IS the message — and an invented count does not just mislead a
 * customer, it misleads the business owners he is pitching with it. A directory
 * of fictional people presented as members is the one thing on this screen that
 * could not be walked back later.
 *
 * So: the design is fully visible, every row says what it is, and no total is
 * printed anywhere. The moment real accounts exist this file is deleted and the
 * same screen renders them instead — nothing about the layout changes.
 *
 * The favourites and visits below point at REAL brand ids on purpose, so tapping
 * through a sample profile opens a real business page and the whole flow can be
 * walked end to end.
 */

export interface Person {
  id: string
  name: string
  /** Where they are, shown under the name. */
  city: string
  pet: PetAvatar
  /** Brand ids they have checked into. Drives the gem count. */
  visited: string[]
  /** Brand ids, in order, for their nine. */
  favourites: string[]
  /** Brand id of their number one. */
  topSpotId: string
  /** Year they joined, for the member line. */
  memberSince: number
}

/**
 * Every one of these is invented and every one is labelled as invented in the
 * UI that renders it. See PhoneApp.
 */
export const SAMPLE_PEOPLE: Person[] = [
  {
    id: 'sample-1',
    name: 'Marisol R.',
    city: 'Oakland',
    pet: { species: 'dog', coat: '#3B3B3F', backdrop: '#FFE9A8', accessory: 'collar' },
    visited: ['b_topdog', 'b_tequilastaqueria', 'b_lumpiacompany', 'b_bulapies'],
    favourites: ['b_tequilastaqueria', 'b_topdog', 'b_lumpiacompany'],
    topSpotId: 'b_tequilastaqueria',
    memberSince: 2026,
  },
  {
    id: 'sample-2',
    name: 'Devon A.',
    city: 'Richmond',
    pet: { species: 'cat', coat: '#E7A33E', backdrop: '#CDE8FF', accessory: 'shades' },
    visited: ['b_jojoshotchicken', 'b_topdog', 'b_paulosausage'],
    favourites: ['b_jojoshotchicken', 'b_paulosausage'],
    topSpotId: 'b_jojoshotchicken',
    memberSince: 2026,
  },
  {
    id: 'sample-3',
    name: 'Priya N.',
    city: 'Berkeley',
    pet: { species: 'rabbit', coat: '#F2F2F4', backdrop: '#FFD9E0', accessory: 'bow' },
    visited: ['b_pippal', 'b_topdog', 'b_glasshouzz', 'b_bulapies', 'b_tequilastaqueria'],
    favourites: ['b_pippal', 'b_glasshouzz', 'b_topdog'],
    topSpotId: 'b_pippal',
    memberSince: 2026,
  },
  {
    id: 'sample-4',
    name: 'Terrell B.',
    city: 'Brentwood',
    pet: { species: 'hamster', coat: '#C98A4B', backdrop: '#D8F5D0', accessory: 'cap' },
    visited: ['b_theyardbrentwood', 'b_topdog'],
    favourites: ['b_theyardbrentwood'],
    topSpotId: 'b_theyardbrentwood',
    memberSince: 2026,
  },
  {
    id: 'sample-5',
    name: 'Jo K.',
    city: 'Las Vegas',
    pet: { species: 'ostrich', coat: '#B9C3CC', backdrop: '#E8E0FF', accessory: '' },
    visited: ['b_sincitypits'],
    favourites: ['b_sincitypits'],
    topSpotId: 'b_sincitypits',
    memberSince: 2026,
  },
]
