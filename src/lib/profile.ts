/**
 * The bits of a profile that are not already derived from somewhere else.
 *
 * Almost everything on the profile page is READ from data this app already
 * keeps: places visited comes from the member's check-ins, the favourites grid
 * from favorites.ts, the recent list from recents.ts, and the member year from
 * joinedAt. Only three things have nowhere to live yet — the avatar, the one
 * favourite spot that gets top billing, and a display name — so only those are
 * stored here.
 *
 * ON THIS DEVICE ONLY, and that is not a detail. There is no account system and
 * no server-side profile in this app, so nothing written here is visible to
 * anybody else — the page is a working preview of what a shared profile would
 * look like, not a shared profile. The screen says so rather than letting
 * someone fill in a profile believing strangers can already see it.
 */

const KEY = 'ths.profile.v1'

/** How the avatar was made. */
export type AvatarKind = 'photo' | 'pet' | 'none'

export interface PetAvatar {
  /** Which animal. See apps/PetAvatar.tsx for what each draws. */
  species: string
  /** Coat colour, a hex. */
  coat: string
  /** Background disc colour, a hex. */
  backdrop: string
  /** Optional accessory key, or '' for none. */
  accessory: string
}

export interface Profile {
  /** What they call themselves. Not verified, not unique, not an account. */
  name: string
  kind: AvatarKind
  /**
   * A downscaled JPEG data URL of their own pet photo.
   *
   * Capped hard at 256px and re-encoded before it is ever stored: localStorage
   * is about 5MB for the WHOLE origin, and one modern phone photo is bigger
   * than that on its own. Writing a full-size image here would blow the quota
   * and take the cart, the member card and the order history down with it.
   */
  photo: string
  pet: PetAvatar
  /** Brand id of the one spot that gets top billing. */
  topSpotId: string
}

export const DEFAULT_PET: PetAvatar = {
  species: 'dog',
  coat: '#C98A4B',
  backdrop: '#FFE9A8',
  accessory: '',
}

const EMPTY: Profile = {
  name: '',
  kind: 'none',
  photo: '',
  pet: DEFAULT_PET,
  topSpotId: '',
}

function read(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const p = JSON.parse(raw)
    if (!p || typeof p !== 'object') return EMPTY
    const pet = p.pet && typeof p.pet === 'object' ? p.pet : {}
    return {
      name: typeof p.name === 'string' ? p.name.slice(0, 40) : '',
      kind: p.kind === 'photo' || p.kind === 'pet' ? p.kind : 'none',
      photo: typeof p.photo === 'string' && p.photo.startsWith('data:image/') ? p.photo : '',
      pet: {
        species: typeof pet.species === 'string' ? pet.species : DEFAULT_PET.species,
        coat: typeof pet.coat === 'string' ? pet.coat : DEFAULT_PET.coat,
        backdrop: typeof pet.backdrop === 'string' ? pet.backdrop : DEFAULT_PET.backdrop,
        accessory: typeof pet.accessory === 'string' ? pet.accessory : '',
      },
      topSpotId: typeof p.topSpotId === 'string' ? p.topSpotId : '',
    }
  } catch {
    /* Corrupt or hand-edited storage must not white-screen the app. */
    return EMPTY
  }
}

export function profile(): Profile {
  return read()
}

export function saveProfile(next: Partial<Profile>): Profile {
  const merged = { ...read(), ...next }
  try {
    localStorage.setItem(KEY, JSON.stringify(merged))
  } catch {
    /*
      Quota, almost always from the photo. Better to keep the rest of the
      profile than to lose the write entirely, so retry without the image.
    */
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...merged, photo: '', kind: 'pet' }))
    } catch {
      /* Storage is unavailable (private mode). The page still works in memory. */
    }
  }
  return read()
}

/**
 * Shrink a chosen photo to something that fits in localStorage.
 *
 * 256px square and JPEG at 0.72 lands around 12-20KB, against the several
 * megabytes a phone camera produces. Cropped to a centre square rather than
 * squashed, because a stretched pet is worse than a cropped one.
 */
export function downscalePhoto(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('no canvas'))
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    img.src = url
  })
}

/** Unique businesses visited, from the member's check-in log. */
export function placesVisited(checkIns: string[]): string[] {
  const ids = new Set<string>()
  for (const key of checkIns) {
    const id = key.split(':')[0]
    if (id) ids.add(id)
  }
  return [...ids]
}

/**
 * The city an address is in, or '' when it cannot be told honestly.
 *
 * The addresses in this catalogue are not one format. Some end in the city
 * ("2534 Durant Ave, Berkeley"), some end in a state and a ZIP ("Las Vegas, NV
 * 89141", "Industrial Pl, Fremont, CA 94538"), one is a bare city ("Pinole")
 * and one is a region rather than a city at all ("Philadelphia and southern New
 * Jersey"). Taking the last comma segment — the obvious approach — returns
 * "NV 89141" for Las Vegas, which would then be counted as its own city.
 *
 * So a KNOWN city wins first, matched against the list the app already has
 * pages for. The fallback only accepts a segment with no digits that is not a
 * two-letter state code, and returns nothing rather than guessing — a place
 * that cannot be resolved is left out of the count instead of inflating it.
 */
export function cityOf(address: string | undefined, known: readonly string[]): string {
  if (!address) return ''
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean)
  for (const part of parts) {
    const hit = known.find((c) => part.toLowerCase() === c.toLowerCase())
    if (hit) return hit
  }
  /*
    Not one of ours, so read it from the END rather than the start.

    Scanning forwards returns "Industrial Pl" for "Industrial Pl, Fremont, CA
    94538" — a street, counted as a city. US addresses put the city last or
    second-to-last, so drop a trailing state-and-ZIP and take what is before it.
  */
  const tail = [...parts].reverse()
  for (const part of tail) {
    if (/^[A-Z]{2}\s+\d{4,5}(-\d{4})?$/.test(part)) continue
    if (/^[A-Z]{2}$/.test(part)) continue
    if (/\d/.test(part)) continue
    return part
  }
  return ''
}
