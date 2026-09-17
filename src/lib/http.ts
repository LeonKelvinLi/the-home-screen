/**
 * One rule about answers we do not want: READ THE BODY ANYWAY.
 *
 * `fetch` hands back the headers as soon as they arrive; the body is a stream
 * that is still open. A handler that sees `if (!r.ok) return null` and walks
 * away leaves that stream unread, and the browser counts the request as still
 * in flight — so the page never reaches network-idle, and a real visit holds a
 * connection open for an answer nobody is going to look at.
 *
 * It surfaced on 2026-09-17 as six of this project's own landing-page checks
 * waiting thirty seconds each for a page that had finished drawing: under
 * `vite preview` there is no API, every /api/… call 404s, and two of them —
 * the sign-in check and a business page's like counts — dropped the body. The
 * checks were the symptom. The held connections were the bug, and the kitchen
 * screen, which polls every few seconds, was leaking one per failed poll.
 *
 * So: any early return from a response whose body has not been parsed goes
 * through here first. It never throws — a body that cannot be read is already
 * finished with.
 */
export async function drain(r: Response): Promise<void> {
  await r.text().catch(() => '')
}

/** The same, shaped for the commonest handler: `if (!r.ok) return drainNull(r)`. */
export async function drainNull(r: Response): Promise<null> {
  await drain(r)
  return null
}
