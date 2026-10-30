/** Shared mark; importing it must not load the membership app or catalogue. */
export function Gem({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="gem">
      <path d="M6.2 3h11.6l4.2 5.4-10 12.4L2 8.4Z" fill="#5AC8FA" />
      <path d="M6.2 3 2 8.4h20l-4.2-5.4Z" fill="#7FD9FF" />
      <path d="M12 20.8 2 8.4h20Z" fill="#39B3F0" />
      <path d="M6.2 3 9 8.4 12 20.8 15 8.4 17.8 3Z" fill="#9FE4FF" opacity=".55" />
    </svg>
  )
}
