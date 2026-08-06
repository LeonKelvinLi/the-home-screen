/**
 * The two marks the operator specified by picture rather than by name.
 *
 * Both are drawn here rather than imported: the images he sent are stock assets
 * off image sites, and this project does not ship other people's artwork. These
 * are original drawings of the same two objects — an awareness ribbon and a cut
 * diamond — in his colours, which is the part that actually carried the intent.
 */

/**
 * Biggie's Purple Ribbon Foundation.
 *
 * An awareness ribbon: two tails crossing, the near one darker so the loop
 * reads at 22px. The purples are sampled off the reference he sent.
 */
export function PurpleRibbon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {/* Far tail, and the top of the loop. */}
      <path
        d="M12 2.4c2.5 0 4.4 1.6 4.4 3.9 0 1.5-.7 2.7-1.9 4.2l-1.6 2.1 4.3 8.2a.7.7 0 0 1-.7 1.1l-2.7-.4a.8.8 0 0 1-.6-.4l-3.3-6.4 1.7-2.6c1.2-1.8 1.8-2.9 1.8-4.1 0-1.3-1-2.2-2.4-2.2Z"
        fill="#8C5EC4"
      />
      {/* Near tail, crossing in front. */}
      <path
        d="M12 2.4C9.5 2.4 7.6 4 7.6 6.3c0 1.5.7 2.7 1.9 4.2l1.6 2.1-4.3 8.2a.7.7 0 0 0 .7 1.1l2.7-.4a.8.8 0 0 0 .6-.4l3.3-6.4-1.7-2.6C11.2 10.3 10.6 9.2 10.6 8c0-1.3 1-2.2 2.4-2.2Z"
        fill="#68299B"
      />
    </svg>
  )
}

/**
 * Biggie's Diamond membership.
 *
 * A brilliant cut seen from above: crown facets over a table, teals rather than
 * the usual icy blue, again from the reference. Faceted with flat planes and no
 * gradients, so it survives being 22px in a keypad panel.
 */
export function Diamond({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {/* Pavilion — the point below the girdle. */}
      <path d="M1.6 9.4h20.8L12 22.4Z" fill="#12667A" />
      <path d="M12 22.4 1.6 9.4h6.9Z" fill="#1B8299" />
      <path d="M12 22.4 22.4 9.4h-6.9Z" fill="#0E4F60" />
      {/* Crown — the facets above it. */}
      <path d="M6.3 3.1h11.4l4.7 6.3H1.6Z" fill="#2AA9C0" />
      <path d="M6.3 3.1 1.6 9.4h6.9Z" fill="#1B8299" />
      <path d="M17.7 3.1l4.7 6.3h-6.9Z" fill="#1B8299" />
      {/* Table, and the highlight that makes it read as cut glass. */}
      <path d="M8.5 9.4 6.3 3.1h11.4l-2.2 6.3Z" fill="#7FDCEA" />
      <path d="M8.5 9.4h7l-3.5 4.6Z" fill="#CFF3F8" opacity=".85" />
    </svg>
  )
}
