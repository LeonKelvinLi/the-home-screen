# Batch 71 — 27 October 2026

Glenn's sends of 7:21–7:32 am on 27 October: Cali K9 and Legend Hotpot & Grill, read off the Mac's Messages. Sources are in `research/roster/batch71.json`.

| Business | Seats | Notes |
|---|---|---|
| Cali K9 (Jas Leverette's dog training) | San Jose More services 4 | "San Jose • Services / BEASTY • Pets". As seen on Netflix's Canine Intervention; Bay Area, LA, Miami, New York and online. Contact page: (510) 890-0298, Training@calik9.com, "Book an evaluation" (their 30-minute phone evaluation). Training is not priced on their site. **Film:** their own story from an Instagram highlight (Glenn's "Clip this video plz"), a mentee on six years of the "Cali K9 system", 2.55–25.9 s, starting after he names his own kennel. **Gallery:** Glenn's five "VIP Clients" story screenshots, cropped to the photos, Instagram's badges painted out, under the title "VIP clients" (`photosTitle`, new). Icon: their dog-over-California mark over CALI K9. San Jose's Services sheet has no dog-trainer spot (Grooming is taken). **BEASTY • Pets is full (24):** its type line "Dog training & behavior" passes, so it takes the next Pets spot that opens, or Glenn can give it one by hand. |
| Legend Hotpot & Grill, Newark | Newark More goods 3; BEASTY • AYCE 13 | "Newark • Eats / BEASTY • AYCE / Need website pilot". 35233 Newark Blvd, Ste A. All-you-can-eat hot pot and Korean BBQ; type line "AYCE hot pot & Korean BBQ" fills AYCE. Needs a website (Glenn). The AYCE price is not published online, so the page lists their Uber Eats takeout menu (19 items: pots, appetizers, drinks) as a price list, marked as delivery-app prices, with Uber Eats' hours. Newark's Asian and Korean spots are taken. **Films:** @drooling.bae (page film, whole), @bestbayareafood (2nd, 4–19 s), @victoria.pham17 (3rd, 8–22 s, before her criticisms). Icon: their logo from their Instagram picture. |

## How the story film was fetched

Instagram stories need a login, so yt-dlp could not get it. In Leon's signed-in Chrome the story page saved its own video and audio tracks, which ffmpeg joined. Chrome is signed in to Instagram as scenara.app; the highlight is 20 weeks old, so no viewer list shows that view.

## Verification

- `npm run build`; the data audit (0 errors).
- Seat diff against the last release: 3 additions (San Jose More services 4, Newark More goods 3, AYCE 13); nothing moved.
- `tools/audit-batch71.mjs` (25 checks) passes on a local build.
