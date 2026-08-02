import { ICON_SIZE } from './constants'

/**
 * Icons for the platform's own apps (cart, orders, rewards, help).
 * Deliberately drawn like iOS system apps — flat gradient tile, one white
 * glyph — so they read as part of the OS rather than as another restaurant.
 */

export type SystemGlyph = 'bag' | 'receipt' | 'star' | 'help' | 'search' | 'person' | 'gear'

const PATHS: Record<SystemGlyph, string> = {
  bag: 'M30 26h40a4 4 0 0 1 4 3.6l5 42A6 6 0 0 1 73 78H27a6 6 0 0 1-6-6.4l5-42A4 4 0 0 1 30 26Zm5 8-4 36h38l-4-36ZM38 22a12 12 0 0 1 24 0v10a3 3 0 0 1-6 0V22a6 6 0 0 0-12 0v10a3 3 0 0 1-6 0Z',
  receipt:
    'M28 14h44a3 3 0 0 1 3 3v68a3 3 0 0 1-4.5 2.6L60 80l-10 6-10-6-10.5 7.6A3 3 0 0 1 25 85V17a3 3 0 0 1 3-3Zm3 6v59l7-5a3 3 0 0 1 3 0l9 5 9-5a3 3 0 0 1 3 0l7 5V20Zm7 11h24a3 3 0 0 1 0 6H38a3 3 0 0 1 0-6Zm0 14h24a3 3 0 0 1 0 6H38a3 3 0 0 1 0-6Zm0 14h16a3 3 0 0 1 0 6H38a3 3 0 0 1 0-6Z',
  star: 'm50 16 10.3 21.4 23.2 3.2-16.9 16.3 4.1 23.3L50 69.2 29.3 80.2l4.1-23.3L16.5 40.6l23.2-3.2Z',
  help: 'M50 12a38 38 0 1 1 0 76 38 38 0 0 1 0-76Zm0 8a30 30 0 1 0 0 60 30 30 0 0 0 0-60Zm0 44a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0-32c7.7 0 14 5.6 14 12.6 0 5.2-2.6 7.9-6.6 10.6-3 2-3.9 3-3.9 5.3a3.5 3.5 0 0 1-7 0c0-5 2.4-7.6 6.6-10.4 3.2-2.2 3.9-3.3 3.9-5.5 0-3-3.1-5.6-7-5.6s-7 2.6-7 5.6a3.5 3.5 0 0 1-7 0C36 37.6 42.3 32 50 32Z',
  search:
    'M44 16a28 28 0 0 1 22 45.3l17.4 17.4a4.5 4.5 0 0 1-6.4 6.4L59.6 67.7A28 28 0 1 1 44 16Zm0 9a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z',
  person:
    'M50 18a17 17 0 1 1 0 34 17 17 0 0 1 0-34Zm0 8a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 32c16 0 29 9.5 29 21.2A2.8 2.8 0 0 1 76 82H24a2.8 2.8 0 0 1-3-2.8C21 67.5 34 58 50 58Zm0 8c-11 0-19.5 5.4-21 10h42c-1.5-4.6-10-10-21-10Z',
  gear:
    'M44.4 12h11.2a3 3 0 0 1 2.9 2.3l1.4 5.7a31 31 0 0 1 5.6 3.3l5.6-1.8a3 3 0 0 1 3.5 1.4l5.6 9.7a3 3 0 0 1-.6 3.7l-4.3 4a31 31 0 0 1 0 6.5l4.3 4a3 3 0 0 1 .6 3.7l-5.6 9.7a3 3 0 0 1-3.5 1.4l-5.6-1.8a31 31 0 0 1-5.6 3.3l-1.4 5.7a3 3 0 0 1-2.9 2.3H44.4a3 3 0 0 1-2.9-2.3l-1.4-5.7a31 31 0 0 1-5.6-3.3l-5.6 1.8a3 3 0 0 1-3.5-1.4l-5.6-9.7a3 3 0 0 1 .6-3.7l4.3-4a31 31 0 0 1 0-6.5l-4.3-4a3 3 0 0 1-.6-3.7l5.6-9.7a3 3 0 0 1 3.5-1.4l5.6 1.8a31 31 0 0 1 5.6-3.3l1.4-5.7A3 3 0 0 1 44.4 12ZM50 36a14 14 0 1 0 0 28 14 14 0 0 0 0-28Z',
}

const TILES: Record<SystemGlyph, [string, string]> = {
  bag: ['#2F6BFF', '#1B47D6'],
  receipt: ['#5B5FE8', '#3A3EBD'],
  star: ['#FF9F0A', '#F06A00'],
  help: ['#48484A', '#2C2C2E'],
  search: ['#30D158', '#1DA345'],
  person: ['#64748B', '#3F4A5A'],
  gear: ['#9AA0A6', '#6E7378'],
}

export function SystemIcon({ glyph, size = ICON_SIZE }: { glyph: SystemGlyph; size?: number }) {
  const [a, b] = TILES[glyph]
  const gid = `sys-${glyph}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', borderRadius: size * 0.2237, width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <path d={PATHS[glyph]} fill="#fff" />
      <rect width="100" height="50" fill="#fff" opacity="0.07" />
    </svg>
  )
}
