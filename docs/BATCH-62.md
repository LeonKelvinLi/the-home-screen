# Batch 62 — 22 and 23 October 2026

Glenn's 9:16 pm send of 22 October, Pezcow, and his 5:20 am send of 23 October, Powder Keg Pub. Read off the Mac's Messages. Sources are in `research/roster/batch62.json`.

| Business | Seats | Notes |
|---|---|---|
| Pezcow, Santa Rosa | BEASTY • Food Trucks 8 | A family Mexican seafood truck at Mitote Food Park, 665 Sebastopol Rd. Sent for "BEASTY • Food Truck" only, so no city seat. Their site names about 21 dishes with no prices, so contact only. Two different schedules on their own site, so no hours. Their site is plain http; its https certificate is broken. Film: @brianthebarber's tour of the food park, 71–95 s, the Pezcow stretch only (one caption has mild profanity). |
| Powder Keg Pub, Hercules | Hercules More goods 0; BEASTY More eats 47 | 2132 Railroad Ave. "Hercules • Bar/Lounge/Pub / BEASTY • Bar/Lounge/Pub / BEASTY • Eats (add to home page) / I deliver to this restaurant so I will get a offer soon". 68 food items from their own site; no drinks. Hours from their hours page, marked current. A city page has no pub category, so Hercules' yellow sheet. No open BEASTY • Eats kind fits a seafood pub (only Jamaican is open), so More eats. **BEASTY • Bar/Lounge/Pub is full** (24, Vinnie's took the last spot on 22 October): its type line "Seafood pub" passes, so it takes the next spot that opens, or Glenn can sell it one by hand once his offer comes through. No offer is recorded. |

**Bar/Lounge is now Bar/Lounge/Pub**, as Glenn wrote it twice. The kind stays `bars`, so no seat id changed; `tools/audit-batch60.mjs` now looks for the new heading.

## Verification

- `npm run build`, the data audit (0 errors).
- Seat diff: 3 additions (Food Trucks 8, More eats 47, Hercules More goods 0); nothing moved.
- `tools/audit-batch62.mjs` (12 checks), `tools/audit-categories.mjs` and `tools/audit-batch60.mjs` pass on a local build.
