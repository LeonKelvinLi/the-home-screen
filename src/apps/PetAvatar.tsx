import type { PetAvatar as Pet } from '../lib/profile'

/**
 * The cartoon pet, drawn in code rather than generated or licensed.
 *
 * The operator asked whether a customisable cartoon pet was possible or too
 * difficult. It is the EASY option, and the better one: as SVG it recolours
 * instantly, stays crisp at any size, weighs nothing, needs no licence and no
 * image model, and every combination exists without anybody storing a file. An
 * image-model avatar would have cost a generation per change, a licence
 * question per asset, and a round trip before a customer saw their own face.
 *
 * Deliberately a SET rather than six unrelated drawings: same head geometry,
 * same eye placement, same line weight, so a rabbit and an ostrich look like
 * they came from the same hand.
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

/** Ears and any species-specific shape, drawn behind the face. */
function Behind({ species, coat }: { species: string; coat: string }) {
  const dark = 'rgba(0,0,0,0.16)'
  switch (species) {
    case 'dog':
      return (
        <>
          <ellipse cx="26" cy="52" rx="11" ry="18" fill={coat} />
          <ellipse cx="74" cy="52" rx="11" ry="18" fill={coat} />
          <ellipse cx="26" cy="54" rx="6" ry="11" fill={dark} />
          <ellipse cx="74" cy="54" rx="6" ry="11" fill={dark} />
        </>
      )
    case 'cat':
      return (
        <>
          <path d="M28 44 26 20l20 12Z" fill={coat} />
          <path d="M72 44 74 20 54 32Z" fill={coat} />
          <path d="M30 40 29 27l11 7Z" fill={dark} />
          <path d="M70 40 71 27 60 34Z" fill={dark} />
        </>
      )
    case 'rabbit':
      return (
        <>
          <ellipse cx="38" cy="20" rx="8" ry="22" fill={coat} />
          <ellipse cx="62" cy="20" rx="8" ry="22" fill={coat} />
          <ellipse cx="38" cy="21" rx="4" ry="15" fill={dark} />
          <ellipse cx="62" cy="21" rx="4" ry="15" fill={dark} />
        </>
      )
    case 'hamster':
      return (
        <>
          <circle cx="28" cy="34" r="11" fill={coat} />
          <circle cx="72" cy="34" r="11" fill={coat} />
          <circle cx="28" cy="34" r="6" fill={dark} />
          <circle cx="72" cy="34" r="6" fill={dark} />
        </>
      )
    case 'bird':
      return <path d="M50 18c8 0 14 6 14 6H36s6-6 14-6Z" fill={dark} />
    case 'ostrich':
      // Long neck, because the joke only works if it actually reads as one.
      return (
        <>
          <rect x="44" y="46" width="12" height="52" rx="6" fill={coat} />
          <ellipse cx="50" cy="96" rx="26" ry="18" fill={coat} />
        </>
      )
    default:
      return null
  }
}

function Accessory({ kind }: { kind: string }) {
  switch (kind) {
    case 'collar':
      return (
        <>
          <rect x="30" y="84" width="40" height="9" rx="4.5" fill="#D7263D" />
          <circle cx="50" cy="96" r="5" fill="#FFC53D" />
        </>
      )
    case 'bow':
      return (
        <>
          <path d="M62 30 76 22v16Z" fill="#E8467C" />
          <path d="M76 30 62 22v16Z" fill="#E8467C" opacity=".7" />
          <circle cx="69" cy="30" r="3.5" fill="#FFC53D" />
        </>
      )
    case 'cap':
      return (
        <>
          <path d="M26 40a24 24 0 0 1 48 0Z" fill="#2B59C3" />
          <rect x="20" y="38" width="34" height="7" rx="3.5" fill="#1E3F8F" />
          <circle cx="50" cy="20" r="4" fill="#FFC53D" />
        </>
      )
    case 'shades':
      return (
        <>
          <rect x="26" y="52" width="20" height="14" rx="6" fill="#141416" />
          <rect x="54" y="52" width="20" height="14" rx="6" fill="#141416" />
          <rect x="44" y="57" width="12" height="4" rx="2" fill="#141416" />
        </>
      )
    default:
      return null
  }
}

export function PetAvatarArt({ pet, size = 96 }: { pet: Pet; size?: number }) {
  const { species, coat, backdrop, accessory } = pet
  const isOstrich = species === 'ostrich'
  const headY = isOstrich ? -22 : 0
  const eyesHidden = accessory === 'shades'

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="pet-art">
      <circle cx="50" cy="50" r="50" fill={backdrop} />
      <g transform={`translate(0 ${headY})`}>
        <Behind species={species} coat={coat} />
        {/* The head. One shape for every species so the set holds together. */}
        <ellipse cx="50" cy="58" rx={isOstrich ? 17 : 27} ry={isOstrich ? 15 : 25} fill={coat} />
        {!eyesHidden && (
          <>
            <circle cx={isOstrich ? 44 : 40} cy="54" r="4" fill="#141416" />
            <circle cx={isOstrich ? 56 : 60} cy="54" r="4" fill="#141416" />
            {/* A catchlight is most of what makes a dot read as an eye. */}
            <circle cx={isOstrich ? 45.4 : 41.4} cy="52.6" r="1.4" fill="#fff" />
            <circle cx={isOstrich ? 57.4 : 61.4} cy="52.6" r="1.4" fill="#fff" />
          </>
        )}
        {species === 'bird' || isOstrich ? (
          <path d="M50 62l10 6-10 6-10-6Z" fill="#F2A63B" />
        ) : (
          <>
            <ellipse cx="50" cy="68" rx="6" ry="4.5" fill="#141416" />
            <path
              d="M50 72v4M50 76c-3 0-5-2-5-2M50 76c3 0 5-2 5-2"
              stroke="#141416"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
        <Accessory kind={accessory} />
      </g>
    </svg>
  )
}
