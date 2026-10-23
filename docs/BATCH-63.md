# Batch 63 — 23 October 2026

Glenn's 7:50 am send: "Berkeley • Eats / BEASTY • Eats / Halal / Needs website pilot", My O My Berkeley. Sources are in `research/roster/batch63.json`.

| Business | Seats | Notes |
|---|---|---|
| My O My Berkeley | Berkeley More goods 12; BEASTY More eats 48 | 100% halal shawarma at 1866 Euclid Ave (their Instagram, @myomyeuclidberkeley). No website, so the needs-a-website outline; 44 items, hours and phone from their own DoorDash storefront (order.online), which nothing of theirs links (the Patty's precedent). `dietary: ['Halal']`. **Not** the My-O-My at 2431 Telegraph Ave (myomyrestaurant.com, @my.o.my.shawarma), a separate shop. Berkeley's Mediterranean spot is Mile Limit's; no BEASTY • Eats kind fits shawarma (Greek is Demitri's, only Jamaican is open). No reel was sent. |

## More eats past 48

BEASTY's More eats had seated all forty-eight (Sugar Plum was 46, Powder Keg Pub 47), so My O My is the forty-ninth. `OPEN_SPOTS` in `src/data/slots.ts` goes from 48 to 72, as it went from 24 to 48 when More services filled on 24 September. Blanks still stop at one page's worth, so no city gains an empty page; a yellow sheet only grows when businesses sit past spot 48. San Francisco's More goods, full since Batch 59, has room again.

## Verification

- `npm run build`, the data audit (0 errors; it had refused spot 48 before the change).
- Seat diff: 2 additions; nothing moved.
- `tools/audit-batch63.mjs`, `tools/audit-categories.mjs` and `tools/audit-design.mjs` pass on a local build.
