# Batch 58 — 21 October 2026

Glenn's 21 October sends, 5:18 to 6:33 pm: Empire State Pizza onto BEASTY • Eats, and four businesses, each with a reel to clip. Research and sources are in `research/roster/batch58.json`.

**Read off the iPhone, not the Mac.** The Mac that ran every batch until 57 died. The thread came off the phone through iMazing on Windows (`tools/messages_db.py`; see "Reading Glenn's thread" in `tools/README.md`). The phone held only 21 October from 1:14 pm, so anything Glenn sent between his 7:04 pm send of 19 October (Batch 57) and then has not been read.

## Empire State Pizza on BEASTY • Eats

"Hey bro, can you put this on the open spots on BEASTY • Eats page?", 5:18 pm, with Empire State's own page. Pizza is King's and Italian is The Great Impasta's; the two spots nobody filled were Udon and Jamaican. Empire State takes the first, `beasty-eats-10`, seated by hand in `BEASTY_EATS_ROSTER`. Its tile shows its own name; Jamaican stays open. `tools/audit-categories.mjs` now expects Jamaican as the open spot and Empire State on the page.

## Businesses

| Business | Seats | Notes |
|---|---|---|
| Funky Elephant, Berkeley | Berkeley second sheet; BEASTY More eats | Glenn wrote "Berkeley • Eats / San Francisco • Eats". Their San Francisco room on Valencia served its last day on 21 June 2026 (their own post; their bio says "SF 86′"), so Berkeley only, where the Asian spot is Praaw Thai's. 55 items, priced, from the Smile Dining ordering page their site links to; their merchandise (a pin, a menthol inhaler, a mat) is left off. Site and Instagram disagree on weekend lunch, so no hours. Film: @sophiaxbayarea's, credited, shot at the San Francisco room in 2024. |
| Kemuri Japanese Barú, Redwood City | Redwood City Asian spot; BEASTY More eats | Their own spelling, with the accent; Glenn and the domain say "Kemuri Baru". 33 items from the Toast page their site links to (Toast's "(To Go) " prefix dropped); the dine-in menu is not online. Hours from their site, written as lunch and dinner to fit one line. Film: their own reel. |
| The Breakfast Club at Midtown, San Francisco | San Francisco second sheet; BEASTY More eats | Glenn sent bcmidtown.com without a name. The Haight Street room (1428 Haight St) is **not open yet**: "Coming Soon", fall 2026. Their menu is the brand's, one for all eleven rooms, so it is shown as a price list under `quoteOnly`, as Hey Yogurt's was before it opened: ordering is live and a priced menu would take orders for a room that is not trading. No hours. Film: their own reel, **cut silent**: Instagram tags its song explicit. |
| Home Thai Cafe, Martinez | Martinez Asian spot; BEASTY More eats | 107 items from the Toast page their site links to; base prices only (Toast was closed for the night, so option upcharges were not readable). Their site gives two weekly schedules, so no hours. Icon is the wordmark from their site's footer; their Instagram picture is a photo of a phone. Film: their own happy-hour reel. |

BEASTY • Eats has no Thai, izakaya or breakfast spot, so all four take More eats, 33 to 36, in the order he sent them. A before-and-after diff of every seat in the app shows only these eight and Empire State's.

**The "Foodie" reel** (5:54 pm, `DPnNRYQjL2s`) is @sophiaxbayarea at Narisawa in Tokyo, not a second review of Funky Elephant. Not the Bay Area and not on BEASTY, so it is in `docs/FOODIES.md` and nowhere in the app.

**Not acted on:** his 1:34 pm screenshot of the affiliate terms ("This is what I have so far … I'll finish it later today"), and the Boba X pin, which was a meeting place.

## Verification

- `npm run build` (`tsc -b` and Vite) and the data audit (0 errors; Kemuri's week is written as lunch and dinner to stay under the 120-character limit).
- A before-and-after diff of every seat in the app: nine changes, the eight new seats and `beasty-eats-10`.
- `tools/audit-batch58.mjs`: 32 checks on a local build. Each page, image, film and credit; each city seat; all 55, 33, 182 and 107 menu items; The Breakfast Club's rows are a price list that cannot start an order; Empire State on BEASTY • Eats with Jamaican still open; all four on More eats.
- `tools/audit-categories.mjs`, `tools/audit-foodies.mjs` and `tools/audit-hero-ink.mjs` pass. The icon audit flags none of the four new tiles (its twenty are older ones).
- `tools/gap-check.py` against the phone: four business sites sent, none missing.

Run on Windows. Docker Desktop was not running, so the audits used PGlite on the test port (`npx -p @electric-sql/pglite-socket pglite-server -p 55432 -m 20`). Most audits start their server with a bare `spawn('npx', …)`, which is ENOENT on Windows, and `audit-hero-ink` calls Homebrew's python3; those were run through a local preload that rewrites both, rather than edited. `audit-categories` now starts its server as `node --import tsx`, as the batch audits do.
