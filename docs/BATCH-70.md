# Batch 70 — 26 and 27 October 2026

Glenn's 10:13 pm send of 26 October, Innena's Kitchen, read off the Mac's Messages on the morning of 27 October. Sources are in `research/roster/batch70.json`.

| Business | Seats | Notes |
|---|---|---|
| Innena's Kitchen, Oakland | Oakland More goods 34; BEASTY More eats 78 | "Oakland • Eats / BEASTY • Eats". 954 Fruitvale Ave, (510) 988-7913, Fri 11am–8pm and Sat–Sun 9am–8pm (closed 3–4pm), all from their Instagram bio. Type line "Cambodian kathiew noodle soup", from their banner ("Authentic Cambodian 'Kathiew' noodle soup with a twist of Nena's flavor"). Spelled "Innena's Kitchen" as NBC Bay Area does; Glenn and their sign write "Innenas". No website, ordering page or delivery-app menu, so contact only, needs-a-website, with their Instagram linked. Oakland's Asian spot is Cambodian Street Food's, so More goods; no category page matches noodle soup. No reel. |

**The icon, as Glenn asked** ("isolate 'Innenas' & 'Kitchen' and put them on top of each other to better fit the icon"): cut from his photo of their neon banner (IMG_8124). The wall under the glow was filled in, the neon taken as the light added to it, and each word given only its own tubes' glow. The short tube that joins the s to the K was left out so "Kitchen" starts on its own stroke. "Innenas" sits over "Kitchen" on the wall's own colour (#241C1D). Every lit pixel is theirs.

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff against the last release: 2 additions; nothing moved.
- `tools/audit-batch70.mjs` (9 checks) passes on a local build.

## Live

Production release `0e8f0f8`, live by 4:38 am on 27 October 2026. `BASE=https://beastypages.com node tools/audit-batch70.mjs` passed all 9 checks against the live site.
