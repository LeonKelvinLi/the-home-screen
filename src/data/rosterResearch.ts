import type { LocalSeed } from './localBrands'

/**
 * What the roster businesses publish about themselves, keyed by roster slug.
 *
 * GENERATED, then reviewed. tools/roster-research-ingest.mjs reads the
 * research JSON (one object per business, produced by reading each business's
 * OWN website and nothing else) and writes this file. Every entry carries the
 * date it was gathered and any self-contradictions found on the business's own
 * site, so a wrong fact can be traced to the page it came from.
 *
 * THE RULES THE GENERATOR HOLDS TO, which are the same rules as everywhere
 * else in this catalogue:
 *   - nothing here came from Yelp, Google, a delivery app or a search snippet;
 *   - a "starting at" price is carried as a floor with its label, never
 *     flattened into a fixed price;
 *   - hours are set only when the business publishes ONE schedule; two that
 *     disagree mean no hours and a note;
 *   - a business that publishes no prices gets a sentence saying so, not a
 *     guessed menu.
 *
 * Merged into the roster by seed() in roster.ts. Edit by hand if a business
 * corrects something; the ingest script refuses to overwrite an entry marked
 * `// hand-edited`.
 */
export const ROSTER_RESEARCH: Record<string, Partial<LocalSeed>> = {}
