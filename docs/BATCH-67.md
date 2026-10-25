# Batch 67 — 25 October 2026

Glenn's sends of 12:10 pm and 2:05 pm on 25 October, read off the Mac's Messages. Sources are in `research/roster/batch67.json` (Yume Mori) and `src/data/rosterResearch.ts` (Favorite Indian Restaurant).

| Business | Seats | Notes |
|---|---|---|
| Yume Mori, Berkeley | Berkeley More goods 16; BEASTY • Cafe 19 | "Berkeley • Goods / BEASTY • Cafe". Matcha bar at 2319 Shattuck Ave. Type line "Matcha cafe & crepes". No website of their own and no published prices, so needs-a-website and contact only; hours from their Instagram (daily 10:30am–6pm, crepes Fri–Sun 12–5pm). Icon is their wordmark from Glenn's crop. **BEASTY • Cafe's test is coffee, espresso or roaster**, which a matcha cafe does not pass, so Cafe 19 is seated by hand; Berkeley's Coffee spot is taken, so its yellow sheet. Film @eatwithsie, 5s–29s; second film @erinlovesfun ("2nd video / Foodie also"), its whole 7 s. |
| Favorite Indian Restaurant, Hayward (already listed, Hayward Indian 3) | adds BEASTY • AYCE 10 | "Hayward • Eats / BEASTY • AYCE". Their site, behind a bot check in September, now loads: an all-you-can-eat buffet, Saturday lunch 11:30am–2:30pm $19.95 and Friday–Saturday dinner 5–9:30pm $24.95. AYCE is seated by hand and the type line stays "Indian", so no older seat moves. The page now carries their own online menu, 86 items with the buffet first, hours (daily 11am–2:30pm, 5–10pm) and their site's email, replacing the contact-only entry. Glenn's logo screenshot matches the icon already on the page. |

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff against the last release: 3 additions (AYCE 10, Cafe 19, Berkeley More goods 16); nothing moved.
- `tools/audit-batch67.mjs` (15 checks), `tools/audit-categories.mjs` and `tools/audit-foodies.mjs` pass on a local build.

## Live

Production release `fbf8211`, pushed at about 4:47 pm on 25 October 2026, live by 4:53 pm (`tools/live-check.mjs` found yume-mori and the buffet). `BASE=https://beastypages.com node tools/audit-batch67.mjs` passed all 15 checks against the live site.
