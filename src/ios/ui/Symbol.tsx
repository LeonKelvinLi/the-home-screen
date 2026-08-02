/**
 * SF Symbols stand-ins.
 *
 * SF Symbols is a licensed Apple font that cannot be shipped on the web, so
 * these are hand-drawn approximations on a 24x24 grid at SF's weight and
 * optical size. Naming follows Apple's so a swap to a licensed set is a
 * one-file change.
 */

export type SymbolName =
  | 'chevron.right'
  | 'chevron.left'
  | 'phone.fill'
  | 'star.fill'
  | 'clock.fill'
  | 'person.crop.circle.fill'
  | 'circle.grid.3x3.fill'
  | 'recordingtape'
  | 'bell.badge.fill'
  | 'speaker.wave.2.fill'
  | 'moon.fill'
  | 'hand.raised.fill'
  | 'creditcard.fill'
  | 'bag.fill'
  | 'location.fill'
  | 'globe'
  | 'info.circle.fill'
  | 'trash.fill'
  | 'arrow.clockwise'
  | 'square.and.arrow.up'
  | 'delete.left.fill'
  | 'plus.circle.fill'
  | 'checkmark'
  | 'magnifyingglass'
  | 'text.badge.star'
  | 'questionmark.circle.fill'
  | 'building.2.fill'
  | 'paintbrush.fill'

const P: Record<SymbolName, string> = {
  'chevron.right': 'M9 5.5 15.5 12 9 18.5',
  'chevron.left': 'M15 5.5 8.5 12 15 18.5',
  'phone.fill':
    'M6.6 3.2c.8-.5 1.8-.3 2.3.5l1.9 2.9c.5.7.3 1.7-.4 2.2l-1.2.9c-.3.2-.4.6-.2.9a14 14 0 0 0 4.4 4.4c.3.2.7.1.9-.2l.9-1.2c.5-.7 1.5-.9 2.2-.4l2.9 1.9c.8.5 1 1.5.5 2.3l-1.1 1.6c-.7 1-2 1.4-3.1 1A21 21 0 0 1 4 7.9c-.4-1.1 0-2.4 1-3.1Z',
  'star.fill': 'm12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8Z',
  'clock.fill':
    'M12 2.6a9.4 9.4 0 1 1 0 18.8 9.4 9.4 0 0 1 0-18.8Zm0 3.6a1 1 0 0 0-1 1V12c0 .3.1.6.4.8l3.4 2.6a1 1 0 0 0 1.2-1.6L13 11.5V7.2a1 1 0 0 0-1-1Z',
  'person.crop.circle.fill':
    'M12 2.6a9.4 9.4 0 0 1 6.9 15.8c-.9-2.3-3.6-3.6-6.9-3.6s-6 1.3-6.9 3.6A9.4 9.4 0 0 1 12 2.6Zm0 3.9a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z',
  'circle.grid.3x3.fill':
    'M6 4.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm6 0a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm6 0a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM6 10.1a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm6 0a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm6 0a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM6 15.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm6 0a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm6 0a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Z',
  recordingtape:
    'M3 6.5h18a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm3.5 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm11 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z',
  'bell.badge.fill':
    'M12 2.4c3.6 0 6 2.6 6 6.2 0 4 .8 5 1.8 6.2.5.6.1 1.6-.8 1.6H5c-.9 0-1.3-1-.8-1.6C5.2 13.6 6 12.6 6 8.6c0-3.6 2.4-6.2 6-6.2Zm0 19a2.7 2.7 0 0 1-2.6-2h5.2a2.7 2.7 0 0 1-2.6 2Z',
  'speaker.wave.2.fill':
    'M11 4.3v15.4c0 .8-1 1.2-1.6.6L5.6 16.6H3a1 1 0 0 1-1-1V8.4a1 1 0 0 1 1-1h2.6l3.8-3.7c.6-.6 1.6-.2 1.6.6Zm3.6 3.1a1 1 0 0 1 1.4.1 7 7 0 0 1 0 9 1 1 0 0 1-1.5-1.3 5 5 0 0 0 0-6.4 1 1 0 0 1 .1-1.4Zm3.3-2.9a1 1 0 0 1 1.4.1 11 11 0 0 1 0 14.8 1 1 0 1 1-1.5-1.3 9 9 0 0 0 0-12.2 1 1 0 0 1 .1-1.4Z',
  'moon.fill':
    'M12.4 2.2c.5-.1.9.4.7.9a8.2 8.2 0 0 0 9.4 11c.5-.1.9.4.7.9A10.4 10.4 0 1 1 12.4 2.2Z',
  'hand.raised.fill':
    'M8.4 2.6a1.4 1.4 0 0 1 1.4 1.4v6.2h.9V2.9a1.4 1.4 0 1 1 2.8 0v7.3h.9V4.4a1.4 1.4 0 1 1 2.8 0v6.9h.9V7.2a1.4 1.4 0 1 1 2.8 0v7.4c0 4-2.8 6.9-6.9 6.9-3.1 0-5-1.2-6.6-3.9l-2.3-4a1.4 1.4 0 0 1 2.3-1.5l1.6 2.2V4a1.4 1.4 0 0 1 1.4-1.4Z',
  'creditcard.fill':
    'M3.5 4.5h17A2.5 2.5 0 0 1 23 7v1H1V7a2.5 2.5 0 0 1 2.5-2.5ZM1 10.5h22V17a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 1 17Zm3.5 4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2Z',
  'bag.fill':
    'M7 6.5h10a2 2 0 0 1 2 1.8l.9 10a2 2 0 0 1-2 2.2H6.1a2 2 0 0 1-2-2.2l.9-10A2 2 0 0 1 7 6.5Zm1.5-.9a3.5 3.5 0 1 1 7 0v.9h-2v-.9a1.5 1.5 0 1 0-3 0v.9h-2Z',
  'location.fill': 'M20.7 3.3a1 1 0 0 1 .2 1.1l-7.4 16.5c-.4.9-1.7.7-1.9-.2l-1.4-6.4-6.4-1.4c-.9-.2-1.1-1.5-.2-1.9L20.1 3.6a1 1 0 0 1 .6-.3Z',
  globe:
    'M12 2.6a9.4 9.4 0 1 1 0 18.8 9.4 9.4 0 0 1 0-18.8Zm0 1.8c-1 0-2.3 1.4-3 3.8h6c-.7-2.4-2-3.8-3-3.8ZM8.6 10a19 19 0 0 0 0 4h6.8a19 19 0 0 0 0-4Zm-1.8 0H4.6a7.6 7.6 0 0 0 0 4h2.2a21 21 0 0 1 0-4Zm10.4 0a21 21 0 0 1 0 4h2.2a7.6 7.6 0 0 0 0-4Zm-8.2 5.8c.7 2.4 2 3.8 3 3.8s2.3-1.4 3-3.8Z',
  'info.circle.fill':
    'M12 2.6a9.4 9.4 0 1 1 0 18.8 9.4 9.4 0 0 1 0-18.8Zm0 7.2a1.1 1.1 0 0 0-1.1 1.1v5.6a1.1 1.1 0 0 0 2.2 0v-5.6A1.1 1.1 0 0 0 12 9.8Zm0-3.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z',
  'trash.fill':
    'M9.5 2.8h5a1 1 0 0 1 1 1v.9h4a1 1 0 0 1 0 2H4.5a1 1 0 0 1 0-2h4v-.9a1 1 0 0 1 1-1ZM6 8.7h12l-.8 10.5a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8Z',
  'arrow.clockwise':
    'M12 3.6a8.4 8.4 0 1 1-8.3 9.6 1.1 1.1 0 0 1 2.2-.3A6.2 6.2 0 1 0 12 5.8c-1.6 0-3 .6-4.1 1.6l1.9.1a1.1 1.1 0 0 1-.1 2.2l-4.4-.2a1.1 1.1 0 0 1-1-1.1l.1-4.4a1.1 1.1 0 0 1 2.2.1l-.1 1.6A8.3 8.3 0 0 1 12 3.6Z',
  'square.and.arrow.up':
    'M12 2.4c.3 0 .5.1.7.3l3.2 3.2a1 1 0 0 1-1.4 1.4L13 5.8v8.4a1 1 0 0 1-2 0V5.8L9.5 7.3a1 1 0 0 1-1.4-1.4l3.2-3.2c.2-.2.4-.3.7-.3ZM5.5 9.5h2.8a1 1 0 0 1 0 2H6.5v8h11v-8h-1.8a1 1 0 0 1 0-2h2.8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z',
  'delete.left.fill':
    'M8.6 4.5h11.9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8.6a2 2 0 0 1-1.5-.7l-5.2-6a1.2 1.2 0 0 1 0-1.6l5.2-6a2 2 0 0 1 1.5-.7Zm2.9 4a1 1 0 0 0-.7 1.7l2.3 2.3-2.3 2.3a1 1 0 0 0 1.4 1.4l2.3-2.3 2.3 2.3a1 1 0 0 0 1.4-1.4L15.9 12.5l2.3-2.3a1 1 0 0 0-1.4-1.4l-2.3 2.3-2.3-2.3a1 1 0 0 0-.7-.3Z',
  'plus.circle.fill':
    'M12 2.6a9.4 9.4 0 1 1 0 18.8 9.4 9.4 0 0 1 0-18.8Zm0 4.3a1.1 1.1 0 0 0-1.1 1.1v3h-3a1.1 1.1 0 0 0 0 2.2h3v3a1.1 1.1 0 0 0 2.2 0v-3h3a1.1 1.1 0 0 0 0-2.2h-3v-3A1.1 1.1 0 0 0 12 6.9Z',
  checkmark: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  magnifyingglass:
    'M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3a1.1 1.1 0 0 1-1.6 1.6l-4.3-4.3A7.5 7.5 0 1 1 10.5 3Zm0 2.2a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6Z',
  'text.badge.star':
    'M3 5.5h13a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2Zm0 5h10a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2Zm0 5h13a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2Zm16.5-11 1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4Z',
  'questionmark.circle.fill':
    'M12 2.6a9.4 9.4 0 1 1 0 18.8 9.4 9.4 0 0 1 0-18.8Zm0 13.4a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm.2-9.6c-2.1 0-3.7 1.4-3.7 3.3a1 1 0 0 0 2 0c0-.7.8-1.3 1.7-1.3s1.7.6 1.7 1.3c0 .5-.2.8-1 1.3-1.1.7-1.7 1.4-1.7 2.7a1 1 0 0 0 2 0c0-.5.2-.8 1-1.3 1.1-.7 1.7-1.4 1.7-2.7 0-1.9-1.6-3.3-3.7-3.3Z',
  'building.2.fill':
    'M3 8.5h6a1 1 0 0 1 1 1V21H3a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Zm2 3v2h2v-2Zm0 4v2h2v-2ZM12 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-8Zm2.5 2.5v2h2v-2Zm0 4.5v2h2v-2Zm0 4.5v2h2v-2Z',
  'paintbrush.fill':
    'M19.8 2.6a2.6 2.6 0 0 1 1.8 4.4l-7.5 7.5-3.6-3.6L18 3.4a2.6 2.6 0 0 1 1.8-.8ZM8.6 12.4l3 3c-.5 2.6-2.6 4.6-5.4 4.6-.6 0-1.3-.1-1.9-.3.8-.6 1.3-1.5 1.3-2.6a1.6 1.6 0 1 0-3.2 0c0-2.6 2.4-4.5 6.2-4.7Z',
}

/** Symbols drawn as strokes rather than fills. */
const STROKED: SymbolName[] = ['chevron.right', 'chevron.left', 'checkmark']

interface Props {
  name: SymbolName
  size?: number
  color?: string
  /** Stroke weight for stroked symbols. iOS chevrons are semibold. */
  weight?: number
}

export function Symbol({ name, size = 17, color = 'currentColor', weight = 2.4 }: Props) {
  const stroked = STROKED.includes(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block', flex: '0 0 auto' }}
      fill={stroked ? 'none' : color}
      stroke={stroked ? color : 'none'}
      strokeWidth={stroked ? weight : undefined}
      strokeLinecap={stroked ? 'round' : undefined}
      strokeLinejoin={stroked ? 'round' : undefined}
    >
      <path d={P[name]} />
    </svg>
  )
}
