/** These supplied tiles already contain rounded paper corners. Fill only the
 * empty upper fold window with their measured paper colour; never redraw the
 * mark or cover artwork elsewhere. Checked against the originals, Batch 83. */
const PAPER: Record<string, string> = {
  'butter-pecan': '#fefefe',
  'baked-blooms': '#fefefe',
  'dingdongtogo': '#fefefe',
  'ding-dong': '#fefefe',
  'share-scan': '#fefefe',
  'free-kangen': '#fefefe',
  'lol-catering-featured': '#fefefe',
  'lol-catering': '#fefefe',
  'wildfork': '#fefefe',
  'beasty-h20': '#fefefe',
  'winky-dinky': '#fefefd',
}
export const pagePaper = (url?: string): string | undefined =>
  url ? PAPER[url.split('/').pop()?.replace(/\.webp$/, '') ?? ''] : undefined
