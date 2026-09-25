import { PetAvatarArt } from './PetAvatar'
import type { PetAvatar } from '../lib/profile'
import type { FriendPet } from '../lib/friends'

/*
  A PET FOR EVERY MEMBER, DRAWN FROM THEIR ID, for a member who has not built
  one: a list of identical grey circles reads as a placeholder. The same id
  always gets the same animal, so a row looks the same tomorrow.
*/
/* Light coats only: a dark coat fills the whole animal and the row reads as a
   black disc, which is what the first cut of this looked like. */
const DIR_SPECIES = ['dog', 'cat', 'rabbit', 'hamster']
const DIR_COATS = ['#B5651D', '#C9A66B', '#E0C9A6', '#9A9A9A', '#F2F2F2', '#D98C5F']
const DIR_BACKDROPS = ['#FFE9A8', '#DCEBFF', '#FFD9D9', '#DFF5E1', '#EEE0FF', '#FFE6C7']
const DIR_ACCESSORIES = ['', 'collar', 'bow', 'cap', 'shades', '']
export function petFor(id: string): PetAvatar {
  let h = 7
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return {
    species: DIR_SPECIES[h % DIR_SPECIES.length],
    /* >>> not >>: h is unsigned, and a signed shift of a hash past 2^31 is
       negative, so half of all ids read an index below zero, got no colour,
       and drew as a black disc. */
    coat: DIR_COATS[(h >>> 3) % DIR_COATS.length],
    backdrop: DIR_BACKDROPS[(h >>> 6) % DIR_BACKDROPS.length],
    accessory: DIR_ACCESSORIES[(h >>> 9) % DIR_ACCESSORIES.length],
  }
}

/**
 * A member's face as other members see it: the pet they built, or, if they
 * built none (or use a photo, which never leaves their phone), the pet drawn
 * from their id that Contacts has always shown.
 */
export function FriendFace({ id, pet, size }: { id: string; pet?: FriendPet | null; size: number }) {
  return <PetAvatarArt pet={pet ?? petFor(id)} size={size} />
}
