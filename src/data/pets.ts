/*
  THE CHOICES A BUILT PET IS MADE FROM, in one place for the drawing
  (apps/PetAvatar.tsx) and the server, which checks a saved pet against them
  (server/friends.ts) so an account can only hold a pet that can be drawn.
*/
export const SPECIES: { key: string; label: string }[] = [
  { key: 'dog', label: 'Dog' },
  { key: 'cat', label: 'Cat' },
  { key: 'rabbit', label: 'Rabbit' },
  { key: 'hamster', label: 'Hamster' },
  { key: 'bird', label: 'Bird' },
  // He said "dog, hamster or even ostrich", so there is an ostrich.
  { key: 'ostrich', label: 'Ostrich' },
]

export const COATS = ['#C98A4B', '#3B3B3F', '#F2F2F4', '#E7A33E', '#8C6239', '#B9C3CC', '#E86F5B', '#7FB069']

export const BACKDROPS = ['#FFE9A8', '#CDE8FF', '#FFD9E0', '#D8F5D0', '#E8E0FF', '#FFE3CC', '#E9ECEF', '#141416']

export const ACCESSORIES: { key: string; label: string }[] = [
  { key: '', label: 'None' },
  { key: 'collar', label: 'Collar' },
  { key: 'bow', label: 'Bow' },
  { key: 'cap', label: 'Cap' },
  { key: 'shades', label: 'Shades' },
]
