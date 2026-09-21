# Clip provenance

Each file here is a business's own Instagram reel, re-encoded to play muted and
looping behind their mark on their own page.

**These are not ours.** The footage belongs to the business that shot it, and it
is used to show that business on that business's own listing — the narrowest
possible use, and still one that needs a record.

| File | Business | Taken from |
|---|---|---|
| `downtown-bbq.mp4` | Downtown Barbecue, Santa Rosa | instagram.com/reel/DYvfsi_TWcd |
| `sin-city-pits.mp4` | Sin City Pits, Las Vegas | instagram.com/reel/DbYsH_viR_a |
| `rywire.mp4` | Rywire, motorsport wiring | youtu.be/YVkl1zTsnxQ — **an excerpt**, 194s–218s of 6m16s |
| `lucky-three-seven.mp4` | Lucky Three Seven, Oakland | instagram.com/reel/DBw6bNGv2nD — **an excerpt**, 6s–22s of 49s |
| `frank2artistic.mp4` | Frank2Artistic, murals | instagram.com/p/DbHaTU6suQw — whole, 15s |

**LUCKY THREE SEVEN IS THE ODD ONE AND IT MATTERS.** The other three are films
by, or with, the business they sit on. This one is @thetastebud's — a food
writer's round-up, "Filipino Food Finds Bay Area, East Bay Edition" — and the
operator sent the link with no relationship stated to either party. It is used
the same narrow way and credited to the film-maker rather than the restaurant,
but it is the one clip here nobody has told us we may use. Worth him confirming.

**AND IT COULD NOT RUN WHOLE.** That reel visits several restaurants: at 23
seconds it is Toppings Too, and later Parekoy. Running it entire would have put
two other Filipino restaurants on Lucky Three Seven's own listing, which is the
single thing a business owner being shown their page must never see. Six seconds
to twenty-two is theirs end to end — the storefront and their menu board, their
kitchen, their wings — checked frame by frame rather than trusted, because the
cost of getting that wrong lands on the operator in person.

The other three links came from the operator, who has a relationship with each —
Downtown Barbecue is a delivery customer of his and he showed them their page in
person, and he painted Rywire's owner's car years before either of them was
known. None of the three handed the file over directly, which is the difference
between this and a clip a partner emails us, and it is why this file exists.

**To remove one:** delete the mp4 and its poster, and drop `src` and `poster`
from that brand's `clip` in the seed. The card that opens the real post on
Instagram keeps working with `href` alone, exactly as it did before — that is
the state the app was in until 19 Aug 2026.

## What was changed from the original

Downscaled to 540px wide, H.264 at CRF 28, `faststart`, **and the audio kept**,
AAC at 96k.

IT USED TO BE STRIPPED, and that was wrong. The argument was that the hero band
plays muted — no mobile browser autoplays otherwise — so a soundtrack nobody can
hear is bytes on every page view. True of the hero. But the same files feed the
WATCH WINDOW, which is a full-screen player somebody opened on purpose, and
there a silent reel is just a worse reel. The files had no audio track at all,
so there was nothing to turn on: "audio is not working" was exactly right.

Now they carry sound and the window works the way every app it imitates does —
**silent until tapped, then it stays on**. Autoplay is still only permitted
while muted, so a reel has to START silent whatever anyone prefers; a tap is a
user gesture and that is what unlocks it. The preference is per-visit, not
per-clip.

**The hero band stays silent** and did not change. It is `aria-hidden`
decoration behind a logo, and a strip of colour that started talking would be a
fault. About 200KB per clip for the audio, which is the price of the window
being worth opening.

Posters are the first frame, encoded as WebP.

**Rywire is an excerpt and the choice was deliberate.** The film is 6m16s of
behind-the-scenes documentary — mostly interviews and end credits, and a talking
head with the sound off is a still photograph that happens to blink. The 24
seconds kept are the car on a desert road with the camera rigged to it: moving,
and about what they actually build. Picked off a frame sweep of the whole film
rather than by taking the opening. The full video is one tap away on the card.

It also needed a newer yt-dlp than the released one — the stable build returned
403 and no-format on every client strategy; the nightly pulls it.

## The one thing to keep true

The hero film is decoration and is marked `aria-hidden`. It must never become
the only way to see a business's video, because it carries no sound, no caption
and no attribution of its own — the credited card below it is what does that
job, and it stays.

## Two reels arrived the same week and only one plays here

Both were the artist or owner talking to camera. **Frank2Artistic's plays** — it
is fifteen seconds and a mural he painted for Tato's Cantina fills the middle of
it, so there is work on screen and not only somebody describing work. **The
Grind Café's does not** — two and a half minutes of two people announcing an
event, ending on a flyer, with no b-roll anywhere in it to cut to instead. A
hero film here is muted, and a talking head with the sound off is a still
photograph that happens to blink.

The Grind's is a card that opens the real post; what went on their page instead
was the event itself, with the date and the price off their own flyer. See
`src/data/localBrands.ts`.

That is the test for the next one: **is there anything in it but a face?**

## p-lo.mp4 — added 2026-08-28

His instruction on 2026-08-27 was two lines and the second was read as noise:
"Can you isolate P-Lo for his icon logo please? Also, if you can play this video
below, but clip the video." The icon was done; the clip was not, and the page
carried a card that opened Instagram instead of footage that plays on it.

Source: the reel at instagram.com/reel/DcBzdqRteQZ, P-Lo's own post, credited
on the card. Twenty-four seconds of thirty, and which twenty-four was measured:
a one-frame-per-second sweep of the whole reel, taking the window with the most
movement in it. It starts one second in.

**yt-dlp needs no format filter here.** `-f "best[height<=1080]"` came back
"requested format is not available" against a 1440x1080 VP9 reel that plain
yt-dlp merged without complaint. That failure looks like the post being
unavailable and is not.


## Added 2026-09-05, on his word: "remember to add those videos and links to the swipeable feed too"

Every reel he had sent for a business that sat on its page as a card only. Cut by
`tools/make-clip.py` — a one-frame-per-second motion sweep picks the 24 seconds with
the most movement — to 540x960 with sound.

| File | Business | Taken from |
|---|---|---|
| `cambodian-street-food.mp4` | Cambodian Street Food | youtube.com/watch?v=6xSaVABbB9s — **an excerpt**, 845s–869s of 1385s; posted by @@JayChanMuzik |
| `tiny-wheels.mp4` | Tiny Wheels | instagram.com/reel/Dcg6A7npkpj — whole, 12s; posted by @38330280417 |
| `grind-cafe-707.mp4` | The Grind Café | instagram.com/reel/DcRs0cKSUwJ — **an excerpt**, 18s–42s of 153s; posted by @17803922980 |
| `puppiepack.mp4` | PuppiePack | instagram.com/reel/DbtLc7eROjF — whole, 14s; posted by @14925299718 |
| `drypup.mp4` | DryPup | instagram.com/reel/DcZdfdTQLhX — whole, 11s; posted by @39051952116 |
| `pawddle.mp4` | Pawddle | instagram.com/reel/Dccj3_ZRmkr — whole, 8s; posted by @74558811466 |
| `kings-wc-pizza.mp4` | Kings West Coast Pizzeria | instagram.com/reel/DH4_CuVuxm9 — **an excerpt**, 4s–28s of 48s; posted by @52872264122 |
| `paulo-sausage.mp4` | Paulo Sausage Co | instagram.com/reel/DaboslhTtv9 — **an excerpt**, 3s–27s of 56s; posted by @50849876993 |
| `house-of-raha.mp4` | House of Raha | instagram.com/reel/Dbq3kjRPWEg — whole, 24s; posted by @ Food & Lifestyle |
| `russ-fam-kitchen.mp4` | Russ Fam Kitchen, Daly City | instagram.com/reel/Dc68gg9SJhY — **an excerpt**, 2s–26s of 136s; their own post, @russfamkitchen_ |
| `belly.mp4` | Belly, Oakland | instagram.com/reel/DdDEq35z2g5 — **an excerpt**, 8s–32s of 99s — the room, the menu board, the street and the wrap being unwrapped, chosen over the sweep's 5s start, which opened on her face; posted by @antoinetterzz, a food creator, not the restaurant — her chicken caesar wrap post, sent with "Can you play on their page without it going onto Instagram?" |
| `emys-cannoli.mp4` | Emy’s Cannoli, Fairfield | instagram.com/reel/DdFKK1RSPBd — **an excerpt**, 9s–33s of 95s; posted by @oaktowngrubhub ("NowThatLooksGooD"), a food reviewer, not the shop — sent on 2026-09-09 with the single word "Foodie" |
| `the-local-petaluma.mp4` | The Local, Petaluma | instagram.com/reel/DdXV9jQveok — **an excerpt**, 13s–37s of 47s — the sandwich held up in the shop, the room, the drinks, the cut halves, Chef Chris and the kitchen; the first eleven seconds are her talking to camera in a car and are left out; posted by @thespoonlist, a food creator, not the shop — Glenn asked for this reel on the page and for her credit to link her Instagram |
| `mile-limit-berkeley.mp4` | Mile Limit, Berkeley | instagram.com/p/DdSQMLZAXta — **an excerpt**, 0s–24s of 53s — their own title card, the tapas, the bottle shop and the room; their own post, @milelimit ("It is an ad placed by them", Glenn, 2026-09-17) |
| `deli-board.mp4` | Deli Board, San Francisco | instagram.com/reel/DdVGzARTQiS — **an excerpt**, 2s–26s of 74s — her "Finally trying Deli Board in SF" title over the cut sandwich, then the Tenenbaum, chosen over a 1s start that opened on her face; re-encoded at CRF 29 (4.2 MB) because the windy, sunlit picture came out at 6.3 MB at the tool's CRF 26; posted by @antoinetterzz, a food creator, not the shop — sent on 2026-09-16 beside Deli Board's listing ("San Francisco • Goods") |
| `real-cutie-pies.mp4` | Real Cutie Pies, Oakland | instagram.com/reel/DU889WWkn8j — **an excerpt**, 94s–118s of 281s — the cutie pies close up in their cups, from the middle of the segment, not the studio chat around it; their own post of KTVU FOX 2's feature on them ("A Special 'Thank You' to @ktvu2 for featuring us"), sent on 2026-09-17 straight after their listing |
| `lovelys-burgers-sf.mp4` | Lovely's Burgers, San Francisco (Cole Valley) | instagram.com/reel/DWCwnqWgQh9 — **an excerpt**, 31s–55s of 60s — the bags opened and the burgers and fries out of their boxes; filmed by @samserved (Sam Smith's food account), reposted by Lovely's — sent on 2026-09-17 straight after their listing |
| `golden-gate-market-deli.mp4` | Golden Gate Market & Deli, San Francisco | instagram.com/reel/DX7W6WiIU8a — **an excerpt**, 15s–39s of 90s — "The Fatty" on Dutch crunch, cut and held up; posted by @thesnacksensei — "Can you please clip this video for their page?" (2026-09-18) |
| `yummy-yummy-hibachi.mp4` | Yummy Yummy Hibachi — all three pages (San Leandro, 73rd Ave, Piedmont Ave) | instagram.com/reel/DdeeVxNzQe4 — **an excerpt**, 0s–24s of 38s — the comedian @mojobrookzz with their bag; their own post ("We had the honor to serve @mojobrookzz"), sent with "Please clip this video for each of the locations pages" (2026-09-19) |
| `jazz-braids.mp4` | Jazz Braids (Janelle), Newark and BEASTY · Services | instagram.com/reel/Cw6TATXPOkB — whole, 9s — birthday braids for @ludacris ("When your braids are on vacation"); her own post, @jazz_braids_styles — "Can you also clip this video and add it to her page" (2026-09-20) |
| `jonnys-italian-ice.mp4` | Jonny's Italian Ice, Sunnyvale | instagram.com/reel/DdT5OWxhEBz — **an excerpt**, 11s–35s of 63s — the soft serve over Italian ice, from the counter to the table; posted by @peggy_shoo, a food creator, not the shop — sent on 2026-09-20 with "Foodie", and it goes on the page because the shop is on BEASTY |

**Filmed by someone other than the business, credited to the film-maker on the card,
and used the same narrow way as Lucky Three Seven — nobody has told us we may:**
The Yard and Jojo's Hot Chicken (@thesnacksensei), Glasshouzz (@volha_creative),
Ofie's Kitchen (@itsmeloslab), Phosho Dough (@grubwitmike), Paulo Sausage Co
(@justmostie), House of Raha (@smackinfood), Cambodian Street Food (Jay Chan,
@JayChanMuzik on YouTube — a 24-second excerpt of a 23-minute vlog, 845s–869s), Belly and Deli Board (@antoinetterzz), The Local (@thespoonlist), Golden Gate Market & Deli (@thesnacksensei), Lovely's Burgers (@samserved) and Jonny's Italian Ice (@peggy_shoo). Real Cutie Pies' film is their own post of a KTVU FOX 2 news segment about them.
Worth him confirming with each. The rest are the businesses' own posts.
