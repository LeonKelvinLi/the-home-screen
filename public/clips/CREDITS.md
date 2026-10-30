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
| `jazz-braids.mp4` | Jazz Braids, Newark and the BEASTY first page (sent as "This is Janelle folks") | instagram.com/reel/Cw6TATXPOkB — whole, 9s — birthday braids for @ludacris ("When your braids are on vacation"); her own post, @jazz_braids_styles — "Can you also clip this video and add it to her page" (2026-09-20) |
| `jonnys-italian-ice.mp4` | Jonny's Italian Ice, Sunnyvale | instagram.com/reel/DdT5OWxhEBz — **an excerpt**, 11s–35s of 63s — the soft serve over Italian ice, from the counter to the table; posted by @peggy_shoo, a food creator, not the shop — sent on 2026-09-20 with "Foodie", and it goes on the page because the shop is on BEASTY |
| `cravingz.mp4` | Cravingz, Redwood City | instagram.com/reel/DAmWXRISz7P — **an excerpt**, 16s–40s of 89s — the shop's neon bear under his "ICE CREAM SANDWICH / PEACH COBBLER MILKSHAKE / REDWOOD CITY, CA" title, then the peach cobbler milkshake tasted outside; posted by @grubwitmike, a food reviewer, not the shop — sent on 2026-09-22 beside Cravingz's listing, downloaded on 2026-09-23 when Leon said to |
| `yank-sing.mp4` | Yank Sing, San Francisco | instagram.com/reel/DdqF3P3P67w — **an excerpt**, 0s–24s of 33s — her "San Francisco's most iconic dim sum spot" title, the dining room, the carts and the dim sum; posted by @sherryeatworld (Sherry Shi), a food creator, not the restaurant — sent on 2026-09-24 beside Yank Sing's listing with "Can we use this link for their page?", downloaded the same day on Leon's standing OK |
| `carlyles-chicken-wings.mp4` | Carlyle's Chicken Wings, Oakland | instagram.com/reel/Dd1606uB7cK — **an excerpt**, 3s–27s of 51s — her "Trying a new Black Owned Wing Spot in Jack London Oakland" title outside the shop, the owner in his Carlyle's apron, the wings on the grill, the sauces and a basket of wings; posted by @booziebrunch (Novi Mitchell), a food creator, not the restaurant — sent on 2026-09-28 beside Carlyle's listing with "Clip video for page plz", downloaded the same day on Leon's standing OK |
| `king-katsu-land.mp4` | King Katsu Land, Newark | instagram.com/reel/DalLO65pHLY — **an excerpt**, 1s–25s of 34s — her "King Katsu Land, Newark" opening and the katsu; posted by @kimjsseats (Where Jess at), a food creator, not the restaurant — sent on 2026-09-29 with "Clip this video and give their page the whole tier 3 treatment. I'm going to use this page as a way to recruit her.", downloaded the same day on Leon's standing OK |
| `bollywood-pizza-sf.mp4` | Bollywood Pizza, San Francisco | instagram.com/p/Dd3AYRzseyv — **an excerpt**, 83s–107s of 108s — the pizza; their own post, @bollywoodpizzausa — sent on 2026-09-29 with "Clip this video plz" |
| `basq-haus.mp4` | Basq Haus, Santa Clara | instagram.com/reel/Dczd9jQxFes — the whole reel, 1s–25s of 25s — his "best basque cheesecake in the Bay Area" and the slices; posted by @hungrydanz (Dan), a food creator, not the bakery — sent on 2026-09-30 with "Clip this video please" |
| `house-of-silog.mp4` | House of Silog, Brentwood | instagram.com/reel/Dd5HDT4zZQJ — **an excerpt**, 3s–27s of 68s — the silog bento box and the sisig; posted by @justmostie (Mostie), a food creator, not the restaurant — sent on 2026-09-30 with "Please add this to the house of silog's page" |
| `little-sheep-newark.mp4` | Little Sheep, Newark | instagram.com/reel/DdftkVVTK7h — **an excerpt**, 26s–50s of 101s — the hot pot bar and the pots; posted by @iamnikkieg (Nikkie G), a food creator, not the restaurant — sent on 2026-09-30 as a "Foodie", and it goes on the page because Little Sheep went on BEASTY the same morning |
| `chef-jeffs-smash-burger.mp4` | Chef Jeff's Smash Burger, Antioch | instagram.com/reel/DQe8tiVkpCK — **an excerpt**, 2s–26s of 68s — his "Top burger spots in the 925" title, the burgers and the loaded fries; posted by @takeoutwithtuck (The Honest Reviewer), a food creator, not the restaurant — sent on 2026-09-30 with "clip this video to add on the page within the next hour" |
| `7-mile-house.mp4` | 7 Mile House, Brisbane | instagram.com/reel/DXUviEUj9i8 (@7milehouse) |
| `hungry-cow.mp4` | Hungry Cow, Fremont | instagram.com/reel/DSEaJrgkZe6 (@thesnacksensei) |
| `daughter-thai.mp4` | Daughter Thai Kitchen, Oakland | instagram.com/reel/Ddptshixa3e (@bayareamunchies510) |
| `nosso-oakland.mp4` | Nosso, Oakland | instagram.com/reel/Ddh94RIgaxM (@festusfeasts) |
| `bread-winners.mp4` | Bread Winners, Oakland | instagram.com/reel/DeBPEB8uDJ4 (@marketing_kings) |
| `metersf.mp4` | MeterSF (BEASTY • Whips) | instagram.com/reel/DdeeJsApfBw (@metersf) |
| `mrcheeze408.mp4` | MrCheeze408 (BEASTY • Whips) | instagram.com/reel/DeGQ1-2t3hG — **an excerpt**, 18s–42s of 59s — his 1992 CRX in a full Mugen kit; posted by @theshedbuilt, not the owner — sent on 2026-10-05 with "Clip this video plz" |
| `kan-kiin.mp4` | Kan Kiin, Daly City | instagram.com/reel/DdfKJIgPDzm (@foodieberrie) |
| `rob-bens-restaurant.mp4` | Rob Ben's Restaurant & Lounge, Emeryville | instagram.com/reel/DEgHeK_yfL- (@bayarea_fooddreamz) |
| `understory.mp4` | Understory, Oakland | instagram.com/reel/Dd7Gag4NaBV (@festusfeasts) |
| `brundo-spices.mp4` | Brundo Spice Company | instagram.com/reel/DeAygs_vTtd (@bayareafoodz) |
| `four-forty-four-events.mp4` | Four Forty Four Events, Oakland | instagram.com/reel/Dd70LCuMMsD (@four_forty_four_events) |
| `pakaoma.mp4` | Pakaoma, El Cerrito | instagram.com/reel/Dd7cwHQv9lo (@foodandsachi) |
| `cali-alley.mp4` | Cali Alley, Berkeley | instagram.com/reel/Dd4ydyFto4G (@festusfeasts) |
| `praaw-thai.mp4` | Praaw Thai, Berkeley | instagram.com/reel/DdhPdjsPH71 (@foodandsachi) |
| `rose-pizzeria-san-francisco.mp4` | Rose Pizzeria, San Francisco | instagram.com/reel/DdEjNGpqKm9 (@seekeasyeats) |
| `hinodeya-ramen-berkeley.mp4` | HINODEYA Ramen & Bar, Berkeley | instagram.com/reel/DdohRAlvwjj (@hungere.for.diy) |
| `yuanbao-jiaozi-san-francisco.mp4` | Yuanbao Jiaozi, San Francisco | instagram.com/reel/Dd78almhYaR (@allie.eats) |
| `pineapple-king-bakery-san-francisco.mp4` | Pineapple King Bakery, San Francisco | instagram.com/reel/DdX5Vztgv0A (@allie.eats) |
| `tonys-pizza-napoletana.mp4` | Tony's Pizza Napoletana, San Francisco | instagram.com/reel/DYyHYXRI202 (@thesnacksensei) |
| `alhambra-irish-house.mp4` | Alhambra Irish House, Redwood City | instagram.com/reel/DaWWDv1hXvH (@singlecatm0m) |
| `absolute-volleyball-club.mp4` | Absolute Volleyball Club, San Rafael | instagram.com/reel/Dd91dqSMBDg (@absolutevolleyball) |
| `sticky-rice-thai.mp4` | Sticky Rice Thai, San Jose | instagram.com/reel/Dd1o8N_tB5C (@orangeginger) |
| `blue-pagoda.mp4` | Blue Pagoda, San Jose | instagram.com/reel/Dd4J1SRq4UA (@janeethefoodie) |
| `tempura-kaneko-hannosuke.mp4` | Tempura Kaneko Hannosuke, San Jose | instagram.com/reel/Dd9emqGs0zV (@bestbayareafood) |
| `master-oh.mp4` | Master Oh, Santa Clara | instagram.com/reel/DcSP10VN8uz (@annna_eats) |
| `calikid-burgers-livermore.mp4` | CaliKid Burgers ’n Shakes, Livermore | instagram.com/reel/DdW5SubguQ1 (@capturedbysado) |
| `golden-donkatsu-dublin.mp4` | Golden Donkatsu, Dublin | instagram.com/reel/DdOwOeePuNJ (@hungere.for.diy) |
| `katsu-factory.mp4` | Katsu Factory, Fremont | instagram.com/reel/Dcr493rMTD5 (@ugc.with.frances) |
| `handels-brentwood.mp4` | Handel's Homemade Ice Cream, Brentwood | instagram.com/reel/DaT3xX1u9PY (@jantrinanicole) |
| `the-burger-spot-co.mp4` | The Burger Spot Co., Richmond | instagram.com/reel/Dd-GqUFPqH4 (@foodandsachi) |
| `gregorys-gourmet-desserts.mp4` | Gregory's Gourmet Desserts, Oakland | instagram.com/reel/DJ5UW0ySv_n (@takeoutwithtuck) |
| `souva-mobile-pet-grooming.mp4` | Souva Mobile Pet Grooming | instagram.com/reel/DeA2Mz4oQwx (@souvagrooming) |
| `omer-ariely-ai.mp4` | omer.ariely.ai (BEASTY • AI) | instagram.com/reel/Dd6QL95jdjr (@thisaintcanon) |
| `kory-chester.mp4` | Kory Chester (BEASTY • AI) | instagram.com/reel/Dd7CQPYsSnu (@thesessionca) |
| `stgdesignz.mp4` | STGDesignz (BEASTY • AI) | instagram.com/reel/Dd9xqwsJsYS (@stgdesignz) |
| `dauren-altynbek.mp4` | Dauren Altynbek (BEASTY • AI) | instagram.com/reel/DeB4M74RM6d (@downey.ai) |
| `tue-twaydabae.mp4` | Tuệ (BEASTY • Cooks) | instagram.com/reel/Dd_0C1OtZUJ (@twaydabae) |
| `review-DduKTl4hokY.mp4` | Terracotta Warriors (a BEASTY • Foodies review, 15s) | instagram.com/reel/DduKTl4hokY (@festusfeasts) |
| `review-DdrCC5YhN2z.mp4` | Cavaña (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdrCC5YhN2z (@hungere.for.diy) |
| `review-DLi7ChcvhbM.mp4` | Whiz Burger (a BEASTY • Foodies review, 15s) | instagram.com/reel/DLi7ChcvhbM (@seekeasyeats) |
| `review-DRGFltxkklB.mp4` | Champ Onigiri (a BEASTY • Foodies review, 15s) | instagram.com/reel/DRGFltxkklB (@orangeginger) |
| `review-DdapLKiATum.mp4` | Pier 39 (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdapLKiATum (@capturedbysado) |
| `review-DWwiNxYCSiI.mp4` | El 2 Carnales Taqueria and Pizzeria (a BEASTY • Foodies review, 15s) | instagram.com/reel/DWwiNxYCSiI (@singlecatm0m) |
| `review-Dcw6WX7zN-Q.mp4` | Slice House (a BEASTY • Foodies review, 15s) | instagram.com/reel/Dcw6WX7zN-Q (@justmostie) |
| `review-DdCZTx7Ppei.mp4` | A corner slice shop (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdCZTx7Ppei (@capturedbysado) |
| `review-DdFgh8TvwdA.mp4` | Ruby King (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdFgh8TvwdA (@chefmelissaking) |
| `review-DdU9R3Myj9x.mp4` | Lana’s (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdU9R3Myj9x (@chefmelissaking) |
| `review-Dc2abz8C7CU.mp4` | Souled Out Pastries at Signal Coffee Roasters (a BEASTY • Foodies review, 15s) | instagram.com/reel/Dc2abz8C7CU (@celineeats) |
| `review-DdXmljSpM-M.mp4` | Froyo Park, Krispy Joe’s and Kingpin Donuts (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdXmljSpM-M (@celineeats) |
| `review-DdIUO2Jxj1s.mp4` | Donut Savant (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdIUO2Jxj1s (@grubwitmike) |
| `review-DdVGXn4NxbO.mp4` | Deli Board (a BEASTY • Foodies review, 15s) | instagram.com/reel/DdVGXn4NxbO (@thesauceboss_) |
| `review-Ddo0xf9MplM.mp4` | The Burger Spot Co. (a BEASTY • Foodies review, 15s) | instagram.com/reel/Ddo0xf9MplM (@hella._local.mo) |
| `sandiwa.mp4` | Sandiwa Collection (BEASTY • Online) | instagram.com/reel/DeCy8c_vxCy (@sandiwacollection) |
| `kiyomi-ca-phe.mp4` | Kiyomi Cà Phê, San Francisco | instagram.com/reel/DeJOlPgvkkA (@kiyomi_ca_phe) |
| `tacos-don-chai.mp4` | Tacos Don Chai, Martinez | instagram.com/reel/DeH-BvAyDIb (@tacodonchai) |
| `the-tastebud.mp4` | The Tastebud (BEASTY • Cooks) | instagram.com/reel/DL8fMMXSqFB (@thetastebud) — **an excerpt**, 8s–32s of 32s |
| `gada.mp4` | GADA, San Francisco | instagram.com/reel/Dc1ueO_SL7j — **an excerpt**, 1s–25s of 72s; posted by @seekeasyeats (Seekeasy), a food creator, not the restaurant — sent on 2026-10-06 with "Clip this video plz" |
| `sanaa-cafe-hayward.mp4` | Sana'a Cafe, Hayward | instagram.com/reel/DYfd8rOvQUd — **an excerpt**, 2s–26s of 61s; posted by @bayareafoodz, a food creator, not the cafe — sent on 2026-10-06 with "Clip this video plz" |
| `brendas-french-soul-food.mp4` | Brenda's French Soul Food, San Francisco | instagram.com/reel/DdDE5PzhqIK — **an excerpt**, 3s–27s of 58s; posted by @dariananthony_ (Darian Gemora), a food creator, not the restaurant — sent on 2026-10-08 with "Clip this video plz" and "Foodie too" |
| `karilagan.mp4` | Karilagan, South San Francisco | instagram.com/reel/DeQQO6hgT8y — **an excerpt**, 3s–27s of 89s; posted by @charweeezy (Charlene Louie), a food creator, not the restaurant — sent on 2026-10-08 with "Clip this video plz" |
| `zut-on-fourth.mp4` | Zut! on Fourth, Berkeley | instagram.com/reel/DHuRXQdyynn (@zutonfourth) — **an excerpt**, 3s–27s of 29s |
| `clear-vision-headlights.mp4` | Clear Vision Headlight Restoration (BEASTY • Automotive) | instagram.com/reel/DdOMkTSqMkx (@cvheadlightrestorations) — **an excerpt**, 7s–31s of 35s |
| `mi-jalisco-taquizas.mp4` | Mi Jalisco Taquizas, Vallejo (BEASTY • Food Trucks) | instagram.com/reel/DagxDrOgACz — the whole 20s; posted by @larussell, not the truck: his free-taco day there on 7/07 — sent on 2026-10-09 with "Clip this video plz" |
| `mamas-boy-pizza.mp4` | Mama's Boy Pizza, Oakland | instagram.com/reel/DeSvZDoP80N — **an excerpt**, 4s–28s of 84s; posted by @grubwitmike, a food creator, not the restaurant — sent on 2026-10-10 with "Clip this video plz" |
| `lil-hawaii.mp4` | Lil Hawaii (BEASTY • Dancers) | instagram.com/reel/DeF5bRzO6fp (@yungphil_) — **an excerpt**, 28s–42s of 42s |
| `sea-wagyu-house.mp4` | Sea Wagyu House, Milpitas | instagram.com/reel/DeUyUB4ijyf — **an excerpt**, 3s–17s of 43s; posted by @mukbangyourmama, a food creator — sent on 2026-10-10 with "Clip this video plz" |
| `vesta-rwc.mp4` | Vesta, Redwood City | instagram.com/reel/Ddohbb-RQTU — **an excerpt**, 22s–36s of 38s; posted by @wanderingstefany, a creator — sent on 2026-10-10 as a Foodie review |
| `wise-up-n-shine.mp4` | Wise Up N Shine Mobile Detailing (BEASTY • Automotive) | instagram.com/reel/DeQCkqfvODO — their own post, **an excerpt**, 2s–16s of 43s |
| `shattuck-and-butter.mp4` | Shattuck & Butter, Berkeley | instagram.com/reel/DeUpZZQShva — their own post, **an excerpt**, 2s–16s of 28s |
| `kodawari-sushi.mp4` | Kodawari Japanese Cuisine, San Mateo | instagram.com/reel/DZqcuQaM3Df — **an excerpt**, 18s–32s of 32s; posted by @lifebyvivien, a creator — sent on 2026-10-10 as a Foodie review |
| `com-tam-thien-huong.mp4` | Com Tam Thien Huong, San Jose | instagram.com/reel/DeSIpvIJLSF — **an excerpt**, 1s–15s of 119s; posted by @singlecatm0m, a food creator — sent on 2026-10-10 as a Foodie review |
| `hella-good-burger.mp4` | HELLA GOOD BURGER, San Jose | instagram.com/reel/DeP9DjuSkl9 — **an excerpt**, 10s–24s of 24s; posted by @bayarea_fooddreamz, a food creator — sent on 2026-10-10 with "Clip this video plz" |
| `fusion-dumpling.mp4` | Fusion Dumpling, San Francisco | instagram.com/reel/DeS16TbyyNT — **an excerpt**, 44s–58s of 128s; posted by @andre___lucas, a creator — sent on 2026-10-11 with "Clip this video plz" |
| `chef-mike.mp4` | Chef Mike, Oakland Athletic Club (BEASTY • Chefs) | instagram.com/reel/DeNh1hENlQ_ — **an excerpt**, 40s–54s of 130s; posted by @festusfeasts (Festus Ezeli), a food creator — sent on 2026-10-10 with "BEASTY • Cooks" |
| `macs-by-icky.mp4` | Macs by Icky, Union City (BEASTY • Sweets) | instagram.com/reel/DeXPVS5M9jz — **an excerpt**, 0s–14s of 50s; posted by @siusvision (Siu Poloai), a creator, with @p_lo — sent on 2026-10-11 with "Clip this video plz for Mac'sbyIcky" |
| `good-pizzza-podcast.mp4` | That's Good PizzZa Podcast (BEASTY • Podcast) | instagram.com/reel/DeX_u-0pR07 — **an excerpt**, 11s–25s of 136s; posted by @hotslicez.psn (Hot Slicez) — sent on 2026-10-12 with "Clip this video plz" |
| `kickin-flavors.mp4` | Kickin Flavors, Fremont and Milpitas | instagram.com/reel/DeYuExEs2Tb — **an excerpt**, 6s–20s of 40s; posted by @ugc.with.frances (Frances), a food creator — sent on 2026-10-12 with "Clip this video plz", "Foodie" |
| `felix-prime-cleaning.mp4` | Felix Prime Cleaning (BEASTY • Services) | instagram.com/p/DZt1S2wgPOz — **an excerpt**, 0s–14s of 53s; their own post — sent on 2026-10-12 with "Clip this video plz" |
| `pizzeria-cardamomo.mp4` | Pizzeria Cardamomo, Redwood City | instagram.com/reel/DeXPu11oz2S — **an excerpt**, 7s–21s of 81s; posted by @acoupleofcooks (Sara + Andrew), creators — sent on 2026-10-12 with "Clip this video plz for @pizzeriacardamomo" |
| `da-good-vibes.mp4` | Da Good Vibes, Union City | instagram.com/reel/DeZOJ2hgYM4 — **an excerpt**, 0s–14s of 81s; posted by @shrimpfriedroice (Roice), a food creator — sent on 2026-10-12 with "Clip this video plz" |
| `cafe-napolina.mp4` | Cafe Napolina, Concord | instagram.com/reel/DNWN4OFSla9 — **an excerpt**, 1.5s–15.5s of 16s; their own post — sent on 2026-10-12 with "Clip this video plz" |
| `cal-burger.mp4` | Cal Burger & More, Berkeley | instagram.com/reel/DccevdIRc0g — **an excerpt**, 0s–14s of 77s; posted by @bayareamunchies510, a food creator — sent on 2026-10-12 with "Clip this video plz / For CalBurger" |
| `review-DeUm0sfx2dO.mp4` | Hungry Cow, Fremont (a Foodie review) | instagram.com/reel/DeUm0sfx2dO — **an excerpt**, 20s–34s of 80s; posted by @foodieberrie, a food creator — sent on 2026-10-12 with "Add to BEASTY • AYCE" |
| `cafe-86.mp4` | Café 86, Daly City | instagram.com/reel/Deae3YFvyCX — **an excerpt**, 3s–17s of 30s; posted by @iamnikkieg (Nikkie G), a food creator — sent on 2026-10-12 with "Clip this video plz", "Foodie" |
| `arena-of-kleos.mp4` | Arena of Kleos (BEASTY • Gyms) | instagram.com/reel/DeaMPj7yJvM — **an excerpt**, 5s–19s of 54s; their founder's post (@kleosfitness) — sent on 2026-10-13 with "Clip this video plz" |
| `ocean-oyster-bar.mp4` | Ocean Oyster Bar & Grill, Union City and Redwood City | instagram.com/reel/DVPR8vWEr9U — **an excerpt**, 0s–14s of 40s; posted by @bayarea_fooddreamz, a food creator — sent on 2026-10-13 with "Clip this video plz" |
| `shift-arcade.mp4` | Shift Arcade, San Ramon | instagram.com/reel/DK2FhrxSmHH — **an excerpt**, 0s–14s of 24s; their own post — sent on 2026-10-13 with "Clip this video plz" |
| `dinos-greek-food-truck.mp4` | Dino's Greek Food Truck (BEASTY • Food Trucks) | instagram.com/reel/DeGUGyWgKcN — the whole 8s; their own post — sent on 2026-10-13 with "Clip this video plz" |
| `nikuya-stone-grill.mp4` | Niku-Ya Stone Grill & Bar, Pleasanton (BEASTY • AYCE) | instagram.com/reel/DbFQ4-OSBk- — **an excerpt**, 62s–76s of 131s; posted by @_cynlacson, a food creator — sent on 2026-10-13 with "Clip this video plz" |
| `review-DeW73CTSLlN.mp4` | Honolulu Sushi Taco at the 626 Night Market (a Foodie review) | instagram.com/reel/DeW73CTSLlN — **an excerpt**, 0s–14s of 99s; posted by @_cynlacson — sent on 2026-10-13 with "Foodie" |
| `rise-woodfire.mp4` | Rise Woodfire Pizza & Rotisserie, San Mateo and Santa Clara | instagram.com/reel/DecZfHUiGT2 — **an excerpt**, 4s–18s of 42s; posted by @mukbangyourmama, a food creator — sent on 2026-10-13 with "Clip this video plz" |
| `sweet-pipers.mp4` | Sweet Pipers, Pinole | instagram.com/reel/DecMBslTErN — **an excerpt**, 5s–19s of 82s; posted by @chris.corpz, a food creator — sent on 2026-10-13 with "Clip this video plz" |
| `katsu-burger.mp4` | Katsu Burger, Santa Clara | instagram.com/reel/DeIconCRmx- — **an excerpt**, 0s–14s of 89s; posted by @grubwitmike, a food creator — sent on 2026-10-13 with "Clip this video plz" |
| `soh-pizza.mp4` | Slice of Homage Pizza, Sunnyvale | instagram.com/reel/DecUOyRzdMQ — **an excerpt**, 0s–14s of 19s; their own post — sent on 2026-10-13 with "Clip this video plz" |
| `romana-pizzeria.mp4` | Romana Pizzeria, Danville | instagram.com/reel/DbgPHc4p_SJ — **an excerpt**, 0s–14s of 51s; posted by @alexytravels (Alexy), a food creator — sent on 2026-10-13 with "Clip this video plz", "Foodie" |
| `tono-coffee-project.mp4` | tōno coffee project, San Jose | instagram.com/reel/DecpsH_yJHC — **an excerpt**, 0s–14s of 58s; posted by @andygravs (Andrew), a food creator — sent on 2026-10-13 with "Clip this video plz" |
| `addis-oakland.mp4` | Addis Restaurant, Oakland | instagram.com/reel/DedHA3BRwqh — **an excerpt**, 12s–26s of 87s; posted by @grubwitmike, a food creator — sent on 2026-10-13 with "Clip this video plz" |
| `endless-summer-sweets.mp4` | Endless Summer Sweets, Berkeley (BEASTY • Sweets, Food Trucks) | instagram.com/reel/DecS6_ghYNK — **an excerpt**, 0s–14s of 20s; posted by @livingvivalakillah (Krissy), a food creator — sent on 2026-10-14 with "Clip this video plz", "Foodie" |
| `cafe-carrusel.mp4` | Café Carrusel, Santa Rosa (BEASTY • Eats) | instagram.com/reel/Dee2mFcoxRl — **an excerpt**, 91s–115s of 118s; posted by @thesnacksensei (Grand-O), a food creator — sent on 2026-10-14 with "Clip this video plz" |
| `the-olive-market.mp4` | The Olive Market, Pleasanton | instagram.com/reel/DcMvPCJBeqC — **an excerpt**, 1s–25s of 87s; posted by @grubwitmike, a food creator — sent on 2026-10-14 with "Clip this video plz" |
| `sasa-walnut-creek.mp4` | Sasa, Walnut Creek | instagram.com/reel/DeSvFGCBgWp — **an excerpt**, 4s–28s of 30s (their closing black card left off); their own post — sent on 2026-10-14 with "Clip this video plz" |
| `sundrip-events.mp4` | Sundrip Events (BEASTY • Food Trucks, Events) | instagram.com/reel/DeezVC-hRpM — **an excerpt**, 37s–61s of 62s; their own post — sent on 2026-10-14 with "Clip this video plz" |
| `harumi-ayce.mp4` | Harumi, Livermore (BEASTY • Eats, AYCE) | instagram.com/reel/DNYa_Wlx1G2 — **an excerpt**, 2s–26s of 40s; posted by @zarina.nawabi, a food creator — sent on 2026-10-15 with "Clip this video plz", "Please update icon for this place" |
| `supreme-crab-ayce.mp4` | Supreme Crab AYCE, San Jose (BEASTY • AYCE) | instagram.com/reel/DefiHqVPl3W — **an excerpt**, 2s–26s of 44s; posted by @eighty6ix_, a food creator — sent on 2026-10-15 with "Clip this video plz", "Foodie" |
| `6th-street-burger.mp4` | Sixth Street Burger, San Jose | instagram.com/reel/DehFfrNgtmW — **an excerpt**, 23s–47s of 98s; posted by @shrimpfriedroice, a food creator — sent on 2026-10-15 with "Clip this video plz" |
| `tarts-de-feybesse.mp4` | Tarts de Feybesse, Oakland (BEASTY • Sweets) | instagram.com/reel/Dee3vLyBHeD — **an excerpt**, 1s–25s of 33s; posted by @livingvivalakillah (Krissy), a food creator — sent on 2026-10-15 with "Clip this video plz", "Foodie" |
| `isla-filipino.mp4` | Isla Filipino Restaurant, Pleasant Hill (BEASTY • AYCE) | instagram.com/reel/Def-2mSlJDF — **an excerpt**, 29s–53s of 59s; their own post — sent on 2026-10-15 with "Clip this video plz", "Please update page & icon" |

**Filmed by someone other than the business, credited to the film-maker on the card,
and used the same narrow way as Lucky Three Seven — nobody has told us we may:**
The Yard and Jojo's Hot Chicken (@thesnacksensei), Glasshouzz (@volha_creative),
Ofie's Kitchen (@itsmeloslab), Phosho Dough (@grubwitmike), Paulo Sausage Co
(@justmostie), House of Raha (@smackinfood), Cambodian Street Food (Jay Chan,
@JayChanMuzik on YouTube — a 24-second excerpt of a 23-minute vlog, 845s–869s), Belly and Deli Board (@antoinetterzz), The Local (@thespoonlist), Golden Gate Market & Deli (@thesnacksensei), Lovely's Burgers (@samserved), Jonny's Italian Ice (@peggy_shoo), Cravingz (@grubwitmike), Yank Sing (@sherryeatworld), Carlyle's Chicken Wings (@booziebrunch), King Katsu Land (@kimjsseats), Basq Haus (@hungrydanz), House of Silog (@justmostie), Little Sheep (@iamnikkieg), Chef Jeff's Smash Burger (@takeoutwithtuck), Sea Wagyu House (@mukbangyourmama), Vesta (@wanderingstefany), Kodawari (@lifebyvivien), Com Tam Thien Huong (@singlecatm0m), HELLA GOOD BURGER (@bayarea_fooddreamz), Fusion Dumpling (@andre___lucas), Chef Mike (@festusfeasts), Macs by Icky (@siusvision), Kickin Flavors (@ugc.with.frances), Pizzeria Cardamomo (@acoupleofcooks), Da Good Vibes (@shrimpfriedroice), Cal Burger (@bayareamunchies510), Café 86 (@iamnikkieg), Ocean Oyster Bar (@bayarea_fooddreamz), Niku-Ya (@_cynlacson), Rise Woodfire (@mukbangyourmama), Sweet Pipers (@chris.corpz) and Katsu Burger (@grubwitmike). Bollywood Pizza's is their own. Real Cutie Pies' film is their own post of a KTVU FOX 2 news segment about them.
Worth him confirming with each. The rest are the businesses' own posts.


## Batch 52 — 16 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `manakish-oven.mp4` | Manakish Oven & Grill | [DdaVo6WMaMH](https://www.instagram.com/reel/DdaVo6WMaMH/) | 8s-32s of 58s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @bayarea.maganda.eats. |
| `poesia-sf.mp4` | Poesia Osteria Italiana | [DeFbH0cSKzU](https://www.instagram.com/reel/DeFbH0cSKzU/) | 6s-30s of 30s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @forkmeetsfood. |
| `wilfreds-lounge.mp4` | Wilfred’s Lounge | [DcMhOfJSaEP](https://www.instagram.com/reel/DcMhOfJSaEP/) | 16s-40s of 41s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @foodiesnflightss. |
| `fun-cloud-events.mp4` | Fun Cloud Events | [DLdf9WHBejy](https://www.instagram.com/reel/DLdf9WHBejy/) | 1s-6s of 6s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Posted by @funcloud_kidsevents. |
| `yo-sushi.mp4` | Yo Sushi & Ramen, Vacaville | [DeiOoYbxiut](https://www.instagram.com/reel/DeiOoYbxiut/) | 6s-30s of 85s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @grubwitmike. |
| `frymazing.mp4` | Frymazing | [DeiHhp3uzRo](https://www.instagram.com/reel/DeiHhp3uzRo/) | 1s-25s of 69s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @carlaylayyy. |
| `d-monaghans.mp4` | D. Monaghans On The Hill | [Deh-8JOB_cx](https://www.instagram.com/reel/Deh-8JOB_cx/) | 4s-28s of 39s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @bayarea_fooddreamz. |
| `benicia-grill.mp4` | Benicia Grill | [DZ8VTQuS-XB](https://www.instagram.com/reel/DZ8VTQuS-XB/) | 1s-25s of 102s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @jbrenes_. |
| `maymays-cravings.mp4` | Maymay’s Cravings | [DeiOY86oJv1](https://www.instagram.com/reel/DeiOY86oJv1/) | 17s-41s of 41s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Posted by @maymayscravings. |
| `crazy-block-cheesecakes.mp4` | Crazy Block Cheesecakes | [Ddnfmh-O9-w](https://www.instagram.com/reel/Ddnfmh-O9-w/) | 1s-25s of 77s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @shua.tangco. |
| `lucys-crepes.mp4` | Lucy’s Crepes | [DeZwwd4IIQN](https://www.instagram.com/reel/DeZwwd4IIQN/) | 0s-8s of 8s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Posted by @lucys_crepes. |
| `ace-king-bbq.mp4` | Ace King BBQ | [DeNbo-hynOi](https://www.instagram.com/reel/DeNbo-hynOi/) | 19s-43s of 68s | Glenn, 15–16 Oct 2026: “Clip this video plz”; Filmed by @victoria.pham17. |

## Batch 53 — 18 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `hironori-santa-clara.mp4` | HiroNori Craft Ramen, Santa Clara | [DeiknWIOpzu](https://www.instagram.com/reel/DeiknWIOpzu/) | 0s-10s of 10s | Glenn, 17 Oct 2026: “Clip this video plz”; Posted by @hironoriramen_bayarea (the reel shows their San Mateo shop). |
| `slicehouse-brentwood.mp4` | Slice House, Brentwood | [DeiQQI0zMBg](https://www.instagram.com/reel/DeiQQI0zMBg/) | 3s-27s of 42s | Glenn, 17 Oct 2026: “Clip this video plz”; Filmed by @justmostie. |
| `boxing-dept.mp4` | Boxing Dept, San Jose | [Def01WGP-1z](https://www.instagram.com/reel/Def01WGP-1z/) | 0s-23s of 27s | Glenn, 17 Oct 2026: “Clip this video plz”; Posted by @boxing.dept. |
| `baekjeong-san-jose.mp4` | Baekjeong, San Jose | [DemffCtgpmV](https://www.instagram.com/reel/DemffCtgpmV/) | 5s-29s of 37s | Glenn, 17 Oct 2026: “Clip this video plz”; Filmed by @jenny.home.loans. |
| `un-stripped-salon.mp4` | Un-Stripped, Martinez | [DeiVpmasbPm](https://www.instagram.com/reel/DeiVpmasbPm/) | 0s-6s of 6s | Glenn, 17 Oct 2026: “Clip this video plz” (no link sent; their most recent reel); Posted by @un_stripped.academy. |
| `cheesecake-lab-sf.mp4` | The Cheesecake Lab SF, Hayward | [DehwZctgf4L](https://www.instagram.com/reel/DehwZctgf4L/) | 0s-7s of 7s | Glenn, 17 Oct 2026: “Clip this video plz”; Posted by @thecheesecakelabsf. |

Not used: `DelACp9h8Xf` (sent as “Foodie” with One’s Cafe) reviews Big Taco in Oakland, not One’s Cafe.

## Batch 54 — 18 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `world-of-hoagies.mp4` | Hoagie's World of Hoagies, Berkeley | [DehQKFyt6xs](https://www.instagram.com/reel/DehQKFyt6xs/) | 19s-43s of 43s | Glenn, 18 Oct 2026: “Clip this video plz”; Filmed by @wthellydanyelly. |
| `norman-rose-tavern.mp4` | Norman Rose Tavern, Napa | [DelXdIOi0Zl](https://www.instagram.com/reel/DelXdIOi0Zl/) | 0s-18s of 18s | Glenn, 18 Oct 2026: “Clip this video plz”; Filmed by @thekhaysie. |
| `radiant-med-spa.mp4` | Radiant Med Spas, Fremont | [DedNsn3AGGP](https://www.instagram.com/p/DedNsn3AGGP/) | 12s-36s of 117s | Glenn, 18 Oct 2026: “Clip this video plz”; Posted by @radiantmedspas. |
| `cuppayo-danville.mp4` | Cuppayo, Danville | [Deo3aDjplnw](https://www.instagram.com/reel/Deo3aDjplnw/) | 7s-31s of 31s | Glenn, 18 Oct 2026: “Clip this video plz”; Filmed by @hungere.for.diy. |
| `jackies-place-review.mp4` | Jackie's Place | [DdrbZx1s5mo](https://www.instagram.com/reel/DdrbZx1s5mo/) | 21s-45s of 108s | Glenn, 18 Oct 2026: “Foodie”; Filmed by @daeatzwitbri. |

## Batch 55 — 19 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `dps-hauling.mp4` | DP's Hauling, Oakland | [DYDwnUxJLvA](https://www.instagram.com/reel/DYDwnUxJLvA/) | 10.35s-35.95s of 64s | Glenn, 19 Oct 2026: “Clip this video plz”; Posted by @dps.hauling (shot by @shotbyadamkg). |

## Batch 56 — 19 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `molinari-delicatessen.mp4` | Molinari Delicatessen, San Francisco | [DeIZ4S2qyuI](https://www.instagram.com/reel/DeIZ4S2qyuI/) | 13s-37s of 107s | Glenn, 19 Oct 2026: “Clip this video plz”; Filmed by @festusfeasts. |
| `dope-pho.mp4` | Dope Pho, Fremont | [DY8MzCwBEp8](https://www.instagram.com/reel/DY8MzCwBEp8/) | 35s-59s of 59s | Glenn, 19 Oct 2026: “Clip this video plz”; Posted by @dope_pho. |

## Batch 58 — 21 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `funky-elephant.mp4` | Funky Elephant, Berkeley | [C8BJwc2REwu](https://www.instagram.com/reel/C8BJwc2REwu/) | 4s-28s of 34s | Glenn, 21 Oct 2026: “Clip this video plz”; Filmed by @sophiaxbayarea, in June 2024 at their San Francisco room, which closed on 21 June 2026. |
| `kemuri-japanese-baru.mp4` | Kemuri Japanese Barú, Redwood City | [Dep69EZBSlI](https://www.instagram.com/reel/Dep69EZBSlI/) | 7s-31s of 33s | Glenn, 21 Oct 2026: “Clip this video plz”; Posted by @kemurirwc. |
| `the-breakfast-club-sf.mp4` | The Breakfast Club at Midtown, San Francisco | [DZ6Qh9uJB4j](https://www.instagram.com/reel/DZ6Qh9uJB4j/) | 0s-8s of 12s | Glenn, 21 Oct 2026: “Clip this video plz”; Posted by @thebreakfastclubsf. **Cut silent (`-an`) on purpose:** Instagram tags its song explicit and nobody had listened to it. The last 4 s are Instagram's end card. |
| `home-thai-cafe.mp4` | Home Thai Cafe, Martinez | [DeEM7DWvcEK](https://www.instagram.com/reel/DeEM7DWvcEK/) | 3s-27s of 27s | Glenn, 21 Oct 2026: “Clip this video plz”; Posted by @homethai_martinez. Their happy-hour promo; beer is on screen. |

## Batch 59 — 19 and 20 October 2026, read on 22 October

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `acre-kitchen-and-bar.mp4` | ACRE Kitchen & Bar, Oakland | [DesuWKFT5-4](https://www.instagram.com/reel/DesuWKFT5-4/) | 27s-51s of 72s | Glenn, 19 Oct 2026: “Clip this video plz” (and asked whether the whole video could run; at 72 s it is over the cap); Filmed by @antoinetterzz. The pizza oven, a Margherita and the meatballs; the full reel's martinis are left out. |
| `broc-cellars.mp4` | Broc Cellars, Berkeley | [DeaiHKCzqPn](https://www.instagram.com/reel/DeaiHKCzqPn/) | 0s-12s of 39s | Glenn, 19 Oct 2026: “Clip this video plz”; Filmed by @antoinetterzz. **An excerpt on purpose:** from 12 s the reel visits the Manitas pop-up and SoDo donuts on their patio, other businesses. Wine is poured on screen. |
| `hama-film-x-kono-karaoke-serramonte.mp4` | Hama Film x Kono Karaoke Serramonte, Daly City | [Ddh6pXTJrhG](https://www.instagram.com/reel/Ddh6pXTJrhG/) | 2s-26s of 59s | Glenn, 19 Oct 2026: “Clip this video plz”; Filmed by @aynakoitsjilly, who was invited by @hamakono_serramonte (her caption). The mall entrance, the photo studio, the karaoke corridor and rooms; only this shop is in the excerpt. |
| `wing-bros.mp4` | Wing Bros, Antioch | [DXh-ac_AXrd](https://www.instagram.com/reel/DXh-ac_AXrd/) | 3s-27s of 94s | Glenn, 19 Oct 2026: “Clip this video plz”; Filmed by @justmostie, at their Antioch shop on Lone Tree Way. |
| `mitchells-ice-cream.mp4` | Mitchell's Ice Cream, San Francisco | [DTRYLHlkd6M](https://www.instagram.com/reel/DTRYLHlkd6M/) | 4s-28s of 64s | Glenn, 19 Oct 2026: “Clip this video plz”; Filmed by @grubwitmike, outside and inside the shop on San Jose Ave (mango scoop, espresso toffee crunch milkshake). |
| `smoking-pig-bbq-san-jose.mp4` | Smoking Pig BBQ, San Jose | [DZwJUuPon0k](https://www.instagram.com/reel/DZwJUuPon0k/) | 13.5s-29.5s of 62s | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @sierra.eats.8. **Kitchen and pit footage only, on purpose:** the reel was shot at their Fremont room and advertises a free-item promo that ended 2 July 2026; the excerpt keeps neither the dining room nor any promo caption. |
| `outta-sight-pizza.mp4` | Outta Sight Pizza, San Francisco | [C10gZdBRlxe](https://www.instagram.com/reel/C10gZdBRlxe/) | 6s-30s of 88s | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @grubwitmike at 422 Larkin St in January 2024. Starts after his “GRUB WIT MIKE” title card. |
| `gama-ride.mp4` | GAMA Ride, San Mateo | [DeS85iMIMQ1](https://www.instagram.com/reel/DeS85iMIMQ1/) | 16s-40s of 42s | Glenn, 20 Oct 2026: “Clip this video plz”; Posted by @playgamaride. Their walk-through with burned-in captions: bumper cars, arcade, darts, shuffleboard, pool, the beer and wine bar, the party room, ending on their sign outside. Beer taps are on screen. |
| `hickry-pit.mp4` | Hick'ry Pit, Walnut Creek | [C9yNxhUSEFt](https://www.instagram.com/reel/C9yNxhUSEFt/) | 12s-36s of 90s | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @bayareafoodz, July 2024. **Cut to keep the mimosas out:** the reel's hook is “$15 bottomless mimosas” (toast and caption at 10-11 s, mimosa glasses again from about 80 s); 12-36 s is ribs, brisket and the table eating. Their bar shelves are in the background. |
| `le-nocturne.mp4` | Le Nocturne, Livermore | [DbCWn3vv2yh](https://www.instagram.com/reel/DbCWn3vv2yh/) | 0s-20s of 20s (whole) | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @yo_siiii_foodie, July 2026. A bar and lounge: wine, cocktails and champagne flutes are on screen in most shots. |
| `birria-lokaa.mp4` | Birria Lokaa, Concord | [DcgmBhZOcTm](https://www.instagram.com/reel/DcgmBhZOcTm/) | 19s-43s of 98s | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @ivkicks, August 2026, at the truck in Concord. Burned-in captions are his. |
| `champa-garden.mp4` | Champa Garden, San Francisco | [Der8PCvvT62](https://www.instagram.com/reel/Der8PCvvT62/) | 1s-25s of 33s | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @forkmeetsfood, October 2026, at 613 Faxon Ave. Burned-in captions are hers. |
| `pattys-diner.mp4` | Patty's Diner, Burlingame | [DYgHBXjSuUy](https://www.instagram.com/reel/DYgHBXjSuUy/) | 24s-48s of 48s | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @itsslydiia. |
| `laughing-monk-nopa.mp4` | Laughing Monk NOPA, San Francisco | [Defo2sWSjXA](https://www.instagram.com/reel/Defo2sWSjXA/) | 1s-25s of 40s | Glenn, 20 Oct 2026: “Clip this video plz” (also sent at 8:35 pm as “Foodie”); Filmed by @itsslydiia. Food only; no beer on screen. |
| `pink-element-cafe.mp4` | Pink Element Cafe, San Jose | [DerhfubhE5z](https://www.instagram.com/reel/DerhfubhE5z/) | 70s-94s of 152s | Glenn, 20 Oct 2026: “Clip this video plz”; Filmed by @bylizettexo (marked #gifted). **An excerpt:** the first 68 s walk through Pink Lab's gym, not the cafe. |
| `stans-donut-shop.mp4` | Stan's Donut Shop, Santa Clara | [DPSWoFEASXx](https://www.instagram.com/reel/DPSWoFEASXx/) | 8s-32s of 77s | Glenn, 20 Oct 2026: “Clip this video plz” (with “Please update icon”); Filmed by @grubwitmike, posted 2 Oct 2025. |
| `house-of-wings.mp4` | House of Wings California, Pittsburg | [DXlQA7ljkwk](https://www.instagram.com/reel/DXlQA7ljkwk/) | 24s-48s of 88s | Glenn, 19 Oct 2026: “Clip this video plz / House of Wings”; Filmed by @jantrinanicole, at their soft opening in April 2026. |
| `u-dessert-story.mp4` | U Dessert Story, Berkeley (and San Francisco) | [DciKBxnt2o-](https://www.instagram.com/reel/DciKBxnt2o-/) | 4s-28s of 67s | Glenn, 20 Oct 2026: “Clip this video plz / Foodie”; Filmed by @simply_dorothy_, at their Berkeley shop on Shattuck Ave. |
| `moxie-steak-house.mp4` | Moxie Steak House, Alameda | [DdAZBPgIoAt](https://www.instagram.com/reel/DdAZBPgIoAt/) | 2s-26s of 97s | Glenn, 20 Oct 2026: “Clip this video plz / Foodie”; Filmed by @thealamedapulse, with their Executive Chef Donna Meadows. |
| `review-DYnTayxSVKT.mp4` | Wing Bros (a Foodie review) | [DYnTayxSVKT](https://www.instagram.com/reel/DYnTayxSVKT/) | 0s-14s of 143s | Glenn, 19 Oct 2026: “Foodie”; Filmed by @takeoutwithtuck (The Honest Reviewer), with @10piecetone. A second review: the page plays @justmostie's film. |
| `fresh-fuel-juicery.mp4` | Fresh Fuel Juicery, Hayward | [DeF5pXEh2C_](https://www.instagram.com/reel/DeF5pXEh2C_/) | 2s-26s of 33s | Glenn, 22 Oct 2026: “Clip this video plz” (also sent as “Foodie”); Filmed by @aztec.ed. Their acai bowl and a smoothie being made, the spread on a table inside, and the shop's lit sign. |
| `kaleia-olivia.mp4` | Kaleia Olivia, dancer | [DeVblLMuNp-](https://www.instagram.com/reel/DeVblLMuNp-/) | 40s-64s of 80s | Glenn, 19 Oct 2026: “Clip this video plz”; Filmed by @shotbyry_510, dancer @ko_rising, turfing on a footbridge. **Cut silent (`-an`) on purpose:** the soundtrack is Mac Dre's 'Feelin Myself' (the caption names it), whose lyrics are not clean. |
| `pho-now.mp4` | Pho Now, San Jose | [DayFVEbJF9D](https://www.instagram.com/reel/DayFVEbJF9D/) | 0s-21s of 21s | Glenn, 22 Oct 2026: “Clip this video plz”; Posted by @phonowsj, their own reel. The owner at the counter, their menu, a salted lemon soda poured into a Pho Now cup and a bowl of beef pho brought to the table. |

## Batch 61 — 22 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `sugar-plum-coffee-shop.mp4` | Sugar Plum Coffee Shop, Concord | [DJ5rRTqxvmj](https://www.instagram.com/reel/DJ5rRTqxvmj/) | 0s-24s of 136s | Glenn, 22 Oct 2026: “Clip this video plz”; Filmed by @festusfeasts. The 'This Diner Has Been Open Since The 1950's' and 'Sugar Plum Coffee Shop, Concord, CA' titles over the diner's counter and dining room, the owner telling its story, then blueberry waffles, an avocado plate and a breakfast burrito brought to the table. |

## Batch 62 — 22 and 23 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `pezcow.mp4` | Pezcow, Santa Rosa | [DezpY7YPSuk](https://www.instagram.com/reel/DezpY7YPSuk/) | 71s-95s of 131s | Glenn, 22 Oct 2026: “Clip this video plz”; Filmed by @brianthebarber. The truck's own stretch of a five-truck Mitote Food Park reel: 'next up Pezcow Food truck' over the truck and its chalkboard menu, its seafood tostadas and an avocado-topped ceviche, then the creator eating a seafood taco ('I think this is my favorite', 'the shrimp and the octopus in here is hella flavorful') and his 9/10. |
| `carabao.mp4` | Carabao, Napa | [De1tDgtTaW2](https://www.instagram.com/reel/De1tDgtTaW2/) | 7s-31s of 40s | Glenn, 23 Oct 2026: “Clip this video plz” (with “Please update icon”); Filmed by @thetastebud. All Carabao; the excerpt leaves out the two shots of his children. |

## Batch 64 — 23 and 24 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `north-beach-pizza-berkeley.mp4` | North Beach Pizza, Berkeley | [De4kPEKA5GY](https://www.instagram.com/reel/De4kPEKA5GY/) | 5.8s-15.5s of 165s | Glenn, 23 Oct 2026: “Clip this video plz”; Filmed by @ni.ckk_. **Shot at their Mission Street room in San Francisco, cut to the food:** a pepperoni pie, a veggie pie and a platter of wings, the creator presenting a pepperoni pie, then a cheese pull from a pesto pie; none of the four people eating is kept. His burned-in 'North Beach Pizza / 4787 Mission St, San Francisco, CA' title runs over the first 7 seconds. |
| `pho-hoa.mp4` | Pho Hoa (Tully), San Jose | [De2Jr6CxEER](https://www.instagram.com/reel/De2Jr6CxEER/) | 16s-40s of 88s | Glenn, 23 Oct 2026: “Clip this video plz”; Filmed by @moniica.michelle. The '1834 PHO HOA' door at Lion Plaza, their roundel sign on the wall, then her birria pho brought to the table, close-ups of the red broth, and the herbs and lime going in. The opening parking-lot intro and the closing outro outside are left out. |
| `wasabi-udon-and-katsu-bar.mp4` | Wasabi Udon & Katsu Bar, Fairfield | [Da3xXLFBsaC](https://www.instagram.com/reel/Da3xXLFBsaC/) | 30s-54s of 63s | Glenn, 23 Oct 2026: “Clip this video plz”; Filmed by @eatwithsie. All Wasabi: bluefin tuna rolls, the mentaiko cream udon, soy garlic Korean fried chicken, tuna tartare, the miso black cod and the sashimi sampler, with her tasting. |
| `don-julios-latin-grill.mp4` | Don Julio's Latin Grill, Rohnert Park | [De0WfnvtKvS](https://www.instagram.com/reel/De0WfnvtKvS/) | 8s-31s of 62s | Glenn, 23 Oct 2026: “Clip this video plz / Foodie”; Filmed by @shesvibinhigh. Their dining room and patio, the owner Cesar with a plate of pupusas, the Abuelita chocolate and cinnamon behind the mole, and the creator eating on their patio. **The excerpt starts after the reel's 'limited time only' and 'Now until October 30, 2026!!' titles and her 'only available for two weeks', and ends before 'before October 30th'**, so it promises nothing that ends on 30 October. |
| `gotta-eatta-pita.mp4` | Gotta Eatta Pita, Pleasant Hill | [DGcG9Bhpm5F](https://www.instagram.com/reel/DGcG9Bhpm5F/) | 0s-24s of 117s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @thesnacksensei (Grand-O). Their patio table, a chicken shawarma pita, the shop front with its gotta eatta pita sign, the to-go box and his 'The best shawarma I've had / Gotta Eatta Pita in Pleasant Hill CA' title. |
| `el-sazon.mp4` | El Sazon, Oakland | [DOyweHIASiO](https://www.instagram.com/reel/DOyweHIASiO/) | 5s-28s of 36s | Glenn, 24 Oct 2026: “Clip this video plz / Foodie”; Filmed by @mayakay.official (Maya). Their quesatacos in close-up, the creators eating the surf n turf tacos, a torta, a burrito and aguas frescas in the car, then the truck's menu board. **Ends at 28.5 s on purpose:** the reel's last eight seconds are a song with explicit lyrics. |
| `monterey-pizza-and-asian-zap.mp4` | Monterey Pizza & Asian Zap, San Francisco | [DXifUEUDeDM](https://www.instagram.com/reel/DXifUEUDeDM/) | 30s-54s of 130s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @imadoniseats. All theirs: outside on Monterey Blvd ('We're going to try the Thai green curry pizza'), their storefront and its banner, then the green curry pizza on the table and the first bites ('That is hella unique bro'). |
| `inda-and-mely.mp4` | Inda + Mely, San Bruno | [DcnVcm4tXpv](https://www.instagram.com/reel/DcnVcm4tXpv/) | 0s-24s of 151s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @mzz.juxtaposition. The okoy salad, Cebuchon belly with wrong buro, garlic butter sugpo and bistek tagalog brought to the table, the creator outside their INDA+MELY / Flavors That Carry Us Home sign, and their dining room with its 'Kumain ka na ba?' neon. Includes, at 9-12 s, her inset photo with the friend who asked for the visit (@ajcorrales.mira). |
| `spinning-dough.mp4` | Spinning Dough, Millbrae | [DZ3fnpgPbQ4](https://www.instagram.com/reel/DZ3fnpgPbQ4/) | 0s-24s of 78s | Glenn, 24 Oct 2026: “Clip this video plz / Foodie”; Filmed by @yourglobalfoodiebff (Tony Nguyen) with @venturewithkelly. Their durian pizza ('the only spot you could get the durian pizza in the bay'), the Modern Eats dining room they cook in, the dough tossed and the durian dolloped on, and the first bites. |
| `review-DYGJe5pPj3q.mp4` | Spinning Dough (a Foodie review) | [DYGJe5pPj3q](https://www.instagram.com/reel/DYGJe5pPj3q/) | 12s-26s of 29s | Glenn, 24 Oct 2026: “Clip this video plz / 2nd video for their page”; Filmed by @cookwithhenny (Rita). The bulgogi, longanisa (dipped in vinegar) and ube pizzas. A second review: the page plays @yourglobalfoodiebff's film. |
| `pho-daily.mp4` | Pho Daily, San Jose | [DesHvJDD21e](https://www.instagram.com/reel/DesHvJDD21e/) | 14s-38s of 65s | Glenn, 24 Oct 2026: “Clip this video plz” with “Foodie”; Posted by @phodailysj (their own account, a skit with Mimi, @love_me_some_mimi). Their dining room: the PHO DAILY sign by the entrance, the thatched market-stall decor, and the low red stools a guest struggles to sit on; their own 'PHO DAILY 1739 Berryessa Rd San Jose CA' tag in the corner throughout. No food is on screen in this reel. |
| `mini-pirate-donuts.mp4` | Mini Pirate Donuts, Pittsburg | [DezsCkVPO-e](https://www.instagram.com/reel/DezsCkVPO-e/) | 28s-52s of 60s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @justmostie. Her boxes of their mini donuts by the trailer: the blueberry, the Cookie Monster (cookie butter, Oreo, Biscoff), the churro ('These donuts are so fresh', 'gooey and fluffy on the inside'). Leaves out the shots of Ben's Burger, where she found them. |
| `little-plearn-thai-kitchen.mp4` | Little Plearn Thai Kitchen, Berkeley | [DeJHH1JTF4g](https://www.instagram.com/reel/DeJHH1JTF4g/) | 5s-29s of 29s | Glenn, 24 Oct 2026: “Clip this video plz / Foodie”; Filmed by @dchangshangry. The dining room dressed for Halloween, a table of fresh spring rolls, potstickers, green curry and pad thai, their 'Halloween Specials' drinks and Spooky Graveyard Dessert, then the dishes one by one and mango sticky rice. |
| `izumi-revolving-sushi.mp4` | Izumi Revolving Sushi, San Jose | [De2MeBKMNBR](https://www.instagram.com/reel/De2MeBKMNBR/) | whole, 18s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @bayarea.foodie.san. The conveyor belt with domed plates going by, nigiri and sashimi boards, a torched roll, the bullet-train tray bringing an order, niku udon and a mille crêpe cake. |
| `timog.mp4` | Timog, Newark | [DbyrQToh8OK](https://www.instagram.com/reel/DbyrQToh8OK/) | whole, 15s | Glenn, 24 Oct 2026: “Clip this video plz”; Posted by @timogrestaurant (their own account). Their Sunday buffet: 'AYCE Filipino Buffet Newark, CA' over a lechon belly, lumpia, longganisa, fried eggs and a beef stew in chafing dishes, then the 'Timog Restaurant, Newark, CA' dining room. |
| `bula-pies.mp4` | Bula Pies Fiji, Vallejo | [DL5vMoUJ1_Q](https://www.instagram.com/reel/DL5vMoUJ1_Q/) | 2s-26s of 59s | Glenn, 23 Oct 2026: “Clip this video plz” (with “Please update icon on a black background.”); Filmed by @eatwithsie (Sienna), July 2025. In her car outside the shop: their storefront sign, then two pies, the mince & cheese and the smoked brisket, opened and eaten. |
| `ruay-mitr.mp4` | Ruay Mitr Chicken & Rice, San Francisco | [DckkSuosnoA](https://www.instagram.com/p/DckkSuosnoA/) | 4s-28s of 77s | Glenn, 24 Oct 2026: “Clip this video plz” (with “Please update page and icon”); Posted by @ruaymitr_sf, their own post, 28 Aug 2026. Their shopfront at 1059 Powell St, khao mun gai with its broth, the khao moo dang moo krob plate, the appetizers, the chicken chopped and plated, presented by a creator in their dining room. |
| `east-bay-buffet.mp4` | East Bay Buffet, Dublin | [DRLjGB_kbgj](https://www.instagram.com/reel/DRLjGB_kbgj/) | 5s-29s of 96s | Glenn, 24 Oct 2026: “Clip this video plz” (after “BEASTY • AYCE / Dublin • Eats”); Filmed by @thesnacksensei (Grand-O), November 2025. Their stone sign on San Ramon Rd, the buffet line (soup dumplings, sushi rolls, the malatang sauce bar) and his first plate at the table. |
| `empire-state-pizza.mp4` | Empire State Pizza, San Ramon | [DekrW5dh7Ss](https://www.instagram.com/reel/DekrW5dh7Ss/) | 0s-10s of 10s (whole) | Glenn, 23 Oct 2026: “Clip this video plz”; Posted by @empirestatepizza, their own reel, 16 Oct 2026: “8 PIZZAS. 8 FLAVORS. ONE EMPIRE!”, their pizzas one after another, ending on their Order Now card (9130 Alcosta Blvd #C, San Ramon, (925) 421-1111). **Poster is the 5.3 s frame**, not the first: the excerpt opens on a small pizza on black. |

## Batch 65 — 24 and 25 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `sofra-grill.mp4` | Sofra Grill, South San Francisco | [C4LjabcROxT](https://www.instagram.com/reel/C4LjabcROxT/) | 12s-36s of 43s | Glenn, 24 Oct 2026: “Clip this video plz” (with “Halal”); Filmed by @imadoniseats (Adonis Eats), March 2024. Their fresh-baked Sofra bread, pomegranate sesame wings, steak fries, the tawa, the lamb shank baked in dough and the kunafa, food only, with his captions naming each dish. |
| `flour-and-water-pizzeria.mp4` | Flour + Water Pizzeria (page at North Beach, San Francisco) | [De5nT9kB_hd](https://www.instagram.com/reel/De5nT9kB_hd/) | 30s-50s of 60s | Glenn, 24 Oct 2026: “Clip this video plz / Foodie”; Filmed by @felicitythefoodie (Felicity), 25 Oct 2026, at their uptown Oakland shop, 271 24th St. Dough pressed and topped, the deck oven and the finished pie, then the first slices. **An excerpt on purpose:** the reel promotes their Eat. Learn. Play. collaboration pizza “from now until October 31st”; the dated lines, the cause title and a “$1 sticks or spritz” screen are left out. |
| `eat-learn-play.mp4` | Eat. Learn. Play. Foundation, Oakland | [DOenlZXkk8f](https://www.instagram.com/reel/DOenlZXkk8f/) | 9s-21s of 55s | Glenn, 24 Oct 2026: “Clip this video plz”; Posted by @eatlearnplay, their own post, 11 Sep 2025, of PBS NewsHour's segment at Martin Luther King Jr. Elementary in Oakland. **B-roll only:** Oakland schoolchildren on the schoolyard and at the gate, carrying the foundation's backpacks, wide shots and backs only; the interview with Stephen and Ayesha Curry is left out. |
| `devil-and-angel-desserts.mp4` | Devil & Angel Desserts, Concord | [DObfZ0AD0UQ](https://www.instagram.com/reel/DObfZ0AD0UQ/) | 18s-42s of 64s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @trinhdoesthings (Trinh Carreon), September 2025, in her car with their cups: a strawberry mango boba, the Dubai strawberry cup (her on-screen 'Dubai strawberry: 10/10') and the start of a mangonada. |
| `review-DN6sK0JElGo.mp4` | Devil & Angel Desserts, Concord (a second review, 15s) | [DN6sK0JElGo](https://www.instagram.com/reel/DN6sK0JElGo/) | 5s-20s of 103s (from 5.4 s, past a fade to black) | Glenn, 24 Oct 2026: “Clip this video plz (3rd) limit 3 per affiliate”; Filmed by @_aemeriee.dance (Aemerie Somvilay), August 2025: their storefront (suite F145) under her 'Devil n Angels location in Concord, CA' caption, the menu boards, the pink neon room, then her on The Veranda's patio with a table of their soft serve and drinks. |
| `heads-and-tails-barbecue.mp4` | Heads & Tails Barbecue, Berkeley | [DPC1u5EgXUe](https://www.instagram.com/reel/DPC1u5EgXUe/) | 84s-108s of 178s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @thesnacksensei (Grand-O), September 2025, in their dining room: a fried chicken sandwich and a sandwich bitten open, then the tray of brisket, hot links and the dino rib pulled off the bone. **An excerpt on purpose:** his cocktails (20-43 s) and frozen drinks are left out. |
| `review-DUBxC2xEnTG.mp4` | Heads & Tails Barbecue, Berkeley (a second review, 15s) | [DUBxC2xEnTG](https://www.instagram.com/reel/DUBxC2xEnTG/) | 0s-15s of 166s | Glenn, 24 Oct 2026: “Clip this video plz (2nd video)”; Filmed by @festusfeasts (Festus Ezeli), January 2026: 'Texas Level BBQ in the Bay?!' over a tray of brisket, pulled pork and hot links, ribs, burnt ends on shells and cheese, cornbread fritters under his 'Heads and Tails BBQ, Berkeley, CA' tag. |
| `shell-shock-seafood-house.mp4` | Shell Shock Seafood House, Hayward | [C4ZSLP3pPUO](https://www.instagram.com/reel/C4ZSLP3pPUO/) | 3s-27s of 58s | Glenn, 24 Oct 2026: “Clip this video plz”; Filmed by @charweeezy (Charlene Louie), March 2024. Their storefront title card at 20413 Hesperian Blvd, the dining room, gumbo and clam chowder in their cups, garlic noodles, raw oysters, the seafood bucket and two whole lobsters. **An excerpt on purpose:** the reel's later “so freaking fresh!” caption is left out. |
| `korean-papis-kitchen.mp4` | Korean Papi's Kitchen, San Francisco | [DbJMF3FpSBS](https://www.instagram.com/reel/DbJMF3FpSBS/) | 4s-28s of 40s | Glenn, 25 Oct 2026: “Clip this video plz” (after “BEASTY • Catering” and “BEASTY • Food Truck”); Filmed by @eatwithsie (Sienna), July 2026, at Spark Social SF. Their wrapped trailer and logo, a Q-dilla with its cheese skirt, kimchi fried rice, a burrito and a cheesesteak on a picnic table, and her eating them by the truck (its GRAND OPENING banner is behind her). |
| `review-De5RI99T-dW.mp4` | Korean Papi's Kitchen (a second review) | [De5RI99T-dW](https://www.instagram.com/reel/De5RI99T-dW/) | 2s-17s of 20s | Glenn, 25 Oct 2026: “Clip this 2 & 3 video plz”; Filmed by @eatwithsie (Sienna) at her own wedding, October 2026. Their kimchi fried rice scooped from the tray into boats as the late-night snack, the bride eating it, the couple with Chef Korean Papi. Her caption mentions an open bar; no drink is on screen in the excerpt. The page plays her Spark Social film. |
| `review-DR5QMgBkrUT.mp4` | Korean Papi's Kitchen (a second review) | [DR5QMgBkrUT](https://www.instagram.com/reel/DR5QMgBkrUT/) | 22s-37s of 124s | Glenn, 25 Oct 2026: “Clip this 2 & 3 video plz”; Filmed by @festusfeasts (Festus Ezeli), December 2025, at NBC's studios. Korean Papi showing his catering trays: the kimchi fried rice with spam, dried seaweed, scallions and sesame, then the tacos with cabbage, kimchi and their orange sauce. Leaves out the later line that the truck was still to come. The page plays @eatwithsie's film. |
| `ocean-subs.mp4` | Ocean Subs, San Francisco | [De5xBB8hH5T](https://www.instagram.com/reel/De5xBB8hH5T/) | whole, 24s | Glenn, 25 Oct 2026 (with “San Francisco • Eats / BEASTY • Eats”); Filmed by @sherryeatworld (Sherry Shi), October 2026. “Best subs in San Francisco?”: their shopfront on Ocean Ave, the framed press on their wall, the menu board, subs built at the counter (the original and the Italian on Dutch crunch), eaten in her car. |
| `review-DaEOA0WBDh9.mp4` | Ocean Subs (a second review) | [DaEOA0WBDh9](https://www.instagram.com/reel/DaEOA0WBDh9/) | 3s-18s of 25s | Glenn, 25 Oct 2026; Filmed by @venturewithkelly (Kelly), June 2026, for her 'Lunch Under $15 in SF' series. The counter ('Ocean Subs, Excelsior, SF'), the owner Lee making her sandwich, the menu board, the roast beef and salami sub cut open. The page plays @sherryeatworld's film. |
| `review-DBzuzNdSpm0.mp4` | Ocean Subs (a second review) | [DBzuzNdSpm0](https://www.instagram.com/reel/DBzuzNdSpm0/) | 3s-18s of 29s | Glenn, 25 Oct 2026; Filmed by @imadoniseats (Adonis Eats), November 2024. A stacked sub cut open, then Adonis on Ocean Ave: “I just left Ocean Subs on the corner of Ocean Avenue and Mission ... one of the best sandwiches in San Francisco”. Leaves out the opening 'NEW gem' caption from their first weeks. The page plays @sherryeatworld's film. |
| `dimond-halal-eatery.mp4` | Dimond Halal Eatery, Oakland | [DbrfgpuJGs-](https://www.instagram.com/reel/DbrfgpuJGs-/) | 3s-27s of 67s | Glenn, 25 Oct 2026: “Clip this video plz”; Filmed by @bayareamunchies510, August 2026, on the sidewalk outside the shop on MacArthur Blvd: their smash burger opened up, then the steak hoagie. **Starts at 3 s by hand:** the opening seconds caption the shop's 'reopening' (a dated event) and mis-hear its name as 'Diamond Hallow'. |
| `review-DeckUbYSiRS.mp4` | Dimond Halal Eatery (a Foodie review) | [DeckUbYSiRS](https://www.instagram.com/reel/DeckUbYSiRS/) | 4s-19s of 102s | Glenn, 25 Oct 2026: second video for their page; Filmed by @greatonezfoodreview (H Tha Great), October 2026. Their storefront, the DIMOND HALAL EATERY logo wall, murals and pool table, smash burgers with fries, then wings. A second review: the page plays @bayareamunchies510's film. |
| `review-Dd-fvDmNwBY.mp4` | Dimond Halal Eatery (a Foodie review) | [Dd-fvDmNwBY](https://www.instagram.com/reel/Dd-fvDmNwBY/) | 3s-18s of 177s | Glenn, 25 Oct 2026: third video (limit 3 per affiliate); Filmed by @mr.smackreviews (Marquel Nelson), October 2026. Their logo wall, the painted menu wall, their printed menu on the counter, the MacArthur's mural, a screen recording of their Instagram, then the chicken sandwich. A second review: the page plays @bayareamunchies510's film. |
| `fast-times-burgers.mp4` | Fast Times Burgers, Oakland | [DbuI1kuxk1c](https://www.instagram.com/reel/DbuI1kuxk1c/) | 7s-31s of 72s | Glenn, 25 Oct 2026: “Clip this video plz”; Filmed by @bayareamunchies510, August 2026, at their counter inside Prescott Market: ordering at their kiosk, the Western Baller triple with onion rings opened up, and first bites. **Starts at 7 s by hand:** the opening seconds are Prescott Market's sign, which lists its other businesses. The market hall (Fatto a Mano's sign) is behind them in the last seconds. |
| `review-DYAPtgxosEf.mp4` | Crazy Block Cheesecakes, Oakland (a Foodie review) | [DYAPtgxosEf](https://www.instagram.com/reel/DYAPtgxosEf/) | 9s-24s of 49s | Glenn, 25 Oct 2026: “Clip this video plz (2nd video)”; Filmed by @booziebrunch (Novi Mitchell), May 2026. Their dining room's cartoon mural, the cheesecake case ('Crazy Block cheesecake in Oakland', 'serving up 190 flavors of cheesecake and barbecue'), the French toast cheesecake, then their 4 x 4 meat platter with the dino rib and sausages. A second review: the page plays @shua.tangco's film. **Ends at 24 s**, before her 'the sides were just okay' and the drink at the end. |
| `review-Dd7i6jHzCBv.mp4` | Don Julio's Latin Grill, Rohnert Park (a Foodie review) | [Dd7i6jHzCBv](https://www.instagram.com/reel/Dd7i6jHzCBv/) | 0s-15s of 156s | Glenn, 25 Oct 2026: “Clip this video plz (2nd video) / Foodie also”; Filmed by @bp__eats (Brandon Phan), 30 Sep 2026. His 'DON JULIO'S LATIN GRILL & PUPUSAS, ROHNERT PARK, CA' title over a pupusa cheese pull, the tropical beef burrito in its spinach tortilla, their storefront and painted patio sign, their Instagram page, and the Al Pastor Pupusa Burger. A second review: the page plays @shesvibinhigh's film. **Ends at 15 s on purpose:** from 16 s the reel turns to mimosas and micheladas. |

## Batch 66 — 25 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `spicy-jois-banh-mi-and-lao-street-food.mp4` | Spicy Joi’s Banh Mi & Lao Street Food, Concord | [De5noCZJ8Ih](https://www.instagram.com/reel/De5noCZJ8Ih/) | 7s-31s of 32s | Glenn, 25 Oct 2026: “Clip this video plz”; Posted by @spicyjoibanhmixlaostreetfood, their own post. The King’s Platter carried across the Concord dining room past the mural and set down for a table of visitors from Sacramento. |

## Batch 67 — 25 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `yume-mori.mp4` | Yume Mori, Berkeley | [DedXErOJkOp](https://www.instagram.com/reel/DedXErOJkOp/) | 5s-29s of 66s | Glenn, 25 Oct 2026: “Clip this video plz”; Filmed by @eatwithsie (Sienna). The 2319 Shattuck storefront, their menu wall of classics and specialties, the room and its ordering screen, then a layered mango matcha. |
| `review-DVgoxRdgbdp.mp4` | Yume Mori (a Foodie review) | [DVgoxRdgbdp](https://www.instagram.com/reel/DVgoxRdgbdp/) | 0s-7s of 7s | Glenn, 25 Oct 2026: “Clip this video plz (2nd video) / Foodie also”; Filmed by @erinlovesfun. The whole reel: the 2319A door, lychee rose matcha at the counter, friends toasting, a matcha topped with flowers. A second film: the page plays @eatwithsie's. |

## Batch 68 — 26 October 2026

| File | Business/page | Original reel | Excerpt | Request & credit |
|---|---|---|---|---|
| `west-coast-sips.mp4` | West Coast Sips, Fairfield | [Da_JqXJP0WW](https://www.instagram.com/reel/Da_JqXJP0WW/) | 0s-12s of 12s | Glenn, 26 Oct 2026: “Clip this video plz”; Posted by @westcoastsips707, their own post. The whole reel: Red Bull poured over red syrup and ice in their logo cup, stirred, lidded, then the finished drink on a white table. |
| `review-DaWytebp89X.mp4` | West Coast Sips (a second film) | [DaWytebp89X](https://www.instagram.com/reel/DaWytebp89X/) | 32s-47s of 49s | Glenn, 26 Oct 2026: “Clip this video plz”; Posted by @westcoastsips707, their own post. A blue and a pink dirty soda stirred and lidded in their logo cups, then six in a row on the counter. A second film: the page plays Da_JqXJP0WW. |
| `meadowlark-dairy-livermore.mp4` | Meadowlark Dairy Livermore | [DY4sErlvjJe](https://www.instagram.com/reel/DY4sErlvjJe/) | whole, 7s (6.6 s) | Glenn, 26 Oct 2026: “Clip this video plz / For Livermore location”; Filmed by @truly_athi (Athi), May 2026. The MEADOWLARK DAIRY storefront on Second Street, two cones held up against the brick, a child with a strawberry-vanilla twist, their 'Greetings LIVERMORE from Cowifornia' mural, then the downtown fountain and a street mural nearby. Her overlay 'Newly Opened $3 Softserve Spot' runs over the first 3 s. |
| `review-De8Vue6v7mj.mp4` | Meadowlark Dairy Livermore (a Foodie review) | [De8Vue6v7mj](https://www.instagram.com/reel/De8Vue6v7mj/) | 1s-16s of 33s | Glenn, 26 Oct 2026: “Clip this video plz”; Filmed by @eighty6ix_ (What's Going On, Bay Area & Beyond), 26 Oct 2026. The milk fridges and grocery shelves inside, a pumpkin spice with maple twist in front of their mural, the MEADOWLARK DAIRY building and patio ('This is their second location / And Livermore'), then him with the cone. A second review: the page plays @truly_athi's film. **Starts at 1 s and ends at 16 s on purpose:** his talking-head intro is before, and an on-screen 'Damn' caption at 19 s is after. |
| `review-DT356WhgcFT.mp4` | Meadowlark Dairy Livermore (a Foodie review) | [DT356WhgcFT](https://www.instagram.com/reel/DT356WhgcFT/) | 11s-26s of 36s | Glenn, 26 Oct 2026: “Clip this video plz”; Filmed by @lovelivermore (Love Livermore), January 2026. Through the 2287 door with the LIVERMORE, COWIFORNIA mark, the counter, a twist pulled at the machine and handed over, the family's cones and cups, the old vault door, then the MILK sign on Second Street. A second review: the page plays @truly_athi's film. Their hosts' intro and sign-off are left out. |
| `chubby-cattle-bbq-pleasanton.mp4` | Chubby Cattle BBQ, Pleasanton | [DevfMX2isDa](https://www.instagram.com/reel/DevfMX2isDa/) | 6s-30s of 34s | Glenn, 26 Oct 2026: “Clip this video plz / Foodie”; Filmed by @createwithcv (Christine), an invited visit, 21 Oct 2026. Gold-tier trays of A5 wagyu, her first bite, the A5 Miyazaki short rib and finger meat on the grill, wagyu nigiri, the A5 foie gras, their side-dish and fresh bars, and more wagyu on the grill. **Starts at 6 s on purpose:** 1–5 s are the storefront and their 'Chubby Club Plus' membership-price signs ($68 a year, 'instant savings'). |
| `review-DesxHR2pcRs.mp4` | Chubby Cattle BBQ, Pleasanton (a Foodie review) | [DesxHR2pcRs](https://www.instagram.com/reel/DesxHR2pcRs/) | 0s-15s of 15s | Glenn, 26 Oct 2026: “2nd”; Filmed by @bayarea.foodie.adventures (Anna), 20 Oct 2026. The whole reel: 'best ayce wagyu spot in the bay area', the line outside ('chubby cattle bbq pleasanton, ca'), ordering on their screen, wagyu on the grill ('from only $58/pp', their standing Silver price), fresh nigiri, the cheese bar, slushies and soft serve. A second film: the page plays @createwithcv's. |
| `la-mar-cebicheria.mp4` | La Mar Cebichería, Pier 1½, San Francisco | [DbE2Qmzt9UF](https://www.instagram.com/reel/DbE2Qmzt9UF/) | 0s-24s of 114s | Glenn, 26 Oct 2026: “Clip this video plz”; Filmed by @festusfeasts (Festus Ezeli), July 2026. Their chef with a whole fish under his 'You NEED to visit this Seafood spot in the Bay Area / La Mar, Embarcadero' title, then the cebiche, nigiri, a fried whole fish, causa and rice at his table with a guest. The interviews later in the reel are left out. |
| `clean-sips-mocktails.mp4` | Clean Sips Mocktails, San Jose | [DObjbUTAZoF](https://www.instagram.com/reel/DObjbUTAZoF/) | 4s-28s of 43s | Glenn, 26 Oct 2026: “Clip this video plz”; Posted by @cleansipsmocktails, their own post. Asmaa and Hiba pouring and garnishing mocktails at their white Clean Sips cart at an outdoor event, guests taking drinks, and the row of colours on the bar. |
| `bourbon-steak-san-francisco.mp4` | Bourbon Steak San Francisco | [DUtdoDXktzc](https://www.instagram.com/reel/DUtdoDXktzc/) | 0s-22s of 58s | Glenn, 26 Oct 2026: “Clip this video plz but make it the 1st top one”; Posted by @chefmichaelmina (Michael Mina, their chef and founder), 13 Feb 2026, from the restaurant's Super Bowl LX pre-party with Roc Nation. Mina at the door, the dining room and bar, the Bourbon Steak card, the sushi and dessert spread, a sushi chef and a chef presenting a dish. **An excerpt on purpose:** the bartender, the sponsor walls and the drinking are left out; the party's lit Ace of Spades champagne logo and a tray of flutes remain in the first seconds, and 11-20 s is guests dancing. |
| `review-De8FsQPCn0O.mp4` | Bourbon Steak San Francisco (a Foodie review) | [De8FsQPCn0O](https://www.instagram.com/reel/De8FsQPCn0O/) | 20s-35s of 63s | Glenn, 26 Oct 2026: “Clip this video plz”; Filmed by @celineeats (celine), 26 Oct 2026. Their pre-theater dinner: steak tartare “pizza”, burrata, morel agnolotti, short rib with whipped potatoes and Dungeness crab spaghetti. A second film: the page plays @chefmichaelmina's. The $89 title card, the wine and the theater playbill are left out. |
| `review-DeaZOeNPwdn.mp4` | Bourbon Steak San Francisco (a Foodie review) | [DeaZOeNPwdn](https://www.instagram.com/reel/DeaZOeNPwdn/) | 24s-39s of 41s | Glenn, 26 Oct 2026: “2nd / Foodie”; Filmed by @explorewithtaka (Taka Iida), 12 Oct 2026. Steak tartare and appetizers, the salt-baked wagyu tomahawk bourbon-flamed tableside, a ribeye. A second film: the page plays @chefmichaelmina's. His DJ-residency title and the bar shots are left out. |
| `the-eighth-rule.mp4` | The Eighth Rule, San Francisco | [DWz-3YfgIB8](https://www.instagram.com/reel/DWz-3YfgIB8/) | 38s-62s of 156s | Glenn, 26 Oct 2026: “Clip this video plz”; Filmed by @festusfeasts (Festus Ezeli), 7 Apr 2026, on the night Stephen Curry sent him to The Eighth Rule and Bourbon Steak. Chef Mina's caviar parfait, Festus tasting it, then Stephen's chicken bites topped with caviar, with his captions. **An excerpt on purpose:** Curry's intro, the cocktail-making and the reel's Bourbon Steak half are left out. |
| `harris-restaurant.mp4` | Harris' Restaurant, San Francisco | [DYGUBaxBlR_](https://www.instagram.com/reel/DYGUBaxBlR_/) | 0s-24s of 52s | Glenn, 26 Oct 2026: “Clip this video plz / Foodie”; Filmed by @smackinfood (Nisa), May 2026. Her steak plates and the 22 oz prime rib, their Harris' menu cover, the chandeliered dining room, the butcher case and dry-aging window, the jazz trio, oysters, the Caesar and the wagyu duo. Desserts at the end left out. |
| `review-DSYs6AgD3Ks.mp4` | Harris' Restaurant, San Francisco (a second review, 15s) | [DSYs6AgD3Ks](https://www.instagram.com/reel/DSYs6AgD3Ks/) | 6s-21s of 91s | Glenn, 26 Oct 2026: “2nd”; Filmed by @yourglobalfoodiebff (Tony Nguyen), December 2025. At their front doors, the white-tablecloth booths and brass chandeliers (Christmas tree up), the jazz musicians, the dry-aging case and the prime rib. **An excerpt on purpose:** his Old Fashioned, martini and Manhattan come later. The page plays @smackinfood's film. |
| `blind-butcher.mp4` | Blind Butcher, San Francisco | [DZaNr5eC9KV](https://www.instagram.com/reel/DZaNr5eC9KV/) | 0s-21s of 24s (20.8 s) | Glenn, 26 Oct 2026: “Clip this video plz”; Filmed by @jetsetjanine (Janine Lee), June 2026 (hosted). The $365 Butcher's Board, a birthday table in the red booth, their 18th Street storefront in the Castro, the prime rib steak, filet mignon, truffle lobster mac & cheese and lamb. **Ends at 20.8 s on purpose:** then a guest raises a cocktail. |
| `review-DdXobJ8JpiU.mp4` | Blind Butcher, San Francisco (a second review) | [DdXobJ8JpiU](https://www.instagram.com/reel/DdXobJ8JpiU/) | 4.5s-13.4s of 58s | Glenn, 26 Oct 2026: “2nd”; Filmed by @thehautesheet (The HauteSheet with Tara Polley), September 2026, an interview with Festus Ezeli (@festusfeasts). Festus under their red awnings, Tara's introduction, the Blind Butcher storefront, the dining room and the show's title over their menu and place settings. **Short on purpose:** the rest is the interview over wine glasses, a back-bar shot and a dated Facebook screenshot. The page plays @jetsetjanine's film. |
| `meadowlark-dairy.mp4` | Meadowlark Dairy, Pleasanton | [C8vSXSDPZGq](https://www.instagram.com/reel/C8vSXSDPZGq/) | 27s-51s of 81s | Glenn, 26 Oct 2026: “Clip this video plz / For Pleasanton location”; Filmed by @grubwitmike (Mike), June 2024, at 57 W Neal St. The drive-thru lane under the canopy and MILK sign, a staffer walking a cone out to his car window, then the chocolate-and-vanilla cone and a mango soft serve in a cup at a table, under his own captions. **An excerpt on purpose:** his title cards and the drive over (0-26 s) are left out. |
| `review-DO1dIS1gTTz.mp4` | Meadowlark Dairy, Pleasanton (a Foodie review) | [DO1dIS1gTTz](https://www.instagram.com/reel/DO1dIS1gTTz/) | whole, 9s | Glenn, 26 Oct 2026: “Clip this video plz (2nd video)”; Filmed by @humminglion (Henry Wu), September 2025. 'BEST SOFT SERVE SF BAY AREA' over two twists by the MILK sign, 'For only $4!', the WALK UP LINE STARTS HERE sign, 'Pick up to two flavors', their FROSTY CONES sign, then a selfie with cones under 'Meadowlark Dairy, Pleasanton, CA'. A second review: the page plays @grubwitmike's film. |
| `review-DNE34tbROif.mp4` | Meadowlark Dairy, Pleasanton (a Foodie review) | [DNE34tbROif](https://www.instagram.com/reel/DNE34tbROif/) | whole, 8s | Glenn, 26 Oct 2026: “Clip this video plz / Foodie”; Filmed by @siliconvalley.foodies (Rachel Ahn), August 2025. Giant strawberry and chocolate twists, the yellow drive-thru building at dusk under 'Meadowlark Dairy, Pleasanton, CA', the walk-up line, their chalk menu board, then the cones held up. A second review: the page plays @grubwitmike's film. |
| `wagyu-master-san-jose.mp4` | Wagyu Master, San Jose | [Dd3_6PuPZ5b](https://www.instagram.com/reel/Dd3_6PuPZ5b/) | 0s-19s of 19s | Glenn, 26 Oct 2026: “2nd” (his first, @biteswithcorey's, is their Arizona shop and was not cut); Filmed by @areweeatingyet (Michelle), 29 Sep 2026. The whole reel: 'Wagyu Master in San Jose is where you can have all you can eat', A5 wagyu shabu in the sukiyaki pot, wagyu and unagi hand rolls, a tray of A5 for her husband's birthday, the counter with its list of cuts, and the A5 ribeye sukiyaki dipped in yolk. |
| `review-DeVbmGxFHUx.mp4` | Wagyu Master, San Jose (their own film) | [DeVbmGxFHUx](https://www.instagram.com/reel/DeVbmGxFHUx/) | 1.3s-12.9s of 17s | Glenn, 26 Oct 2026: “3rd”; Posted by @wagyumastersukiyaki, their own post, 11 Oct 2026. 'Unlimited A5 Wagyu', 'Wagyu Master San Jose', the room, A5 wagyu shabu, hand rolls, tempura, rice bowls and matcha crepe cake, 'Grab your lunch crew and come hungry'. **Cut on purpose** to leave out the '$35.99' card (0–1.2 s) and 'MON – THU 11:30AM to 3PM' (13 s on), a lunch price. A second film: the page plays @areweeatingyet's. |
| `gold-bean-durant.mp4` | Gold Bean, Durant Ave, Berkeley | [De9ozyhB0gx](https://www.instagram.com/reel/De9ozyhB0gx/) | 1.5s-25.5s of 25.5s | Glenn, 26 Oct 2026: “Clip this video plz / for Goldbean coffee”; Filmed by @arianasade (Ari), 26 Oct 2026. Her 'Gold Bean Cafe' bacon, egg and cheese bagel, outside at their yellow tables, ordering at the kiosk, the banana cream iced coffee and banana cream matcha, the BLT on a jalapeño cheddar bagel with cream cheese, her first bites, and their GOLD BEAN CAFÉ storefront. |
| `review-Ddk28qRIsGZ.mp4` | Gold Bean, Durant Ave, Berkeley (a Foodie review) | [Ddk28qRIsGZ](https://www.instagram.com/reel/Ddk28qRIsGZ/) | 0s-15s of 29s | Glenn, 26 Oct 2026: “Clip this video plz 2nd / Foodie”; Filmed by @_whatarethechances_ (Chance Hui), 22 Sep 2026. 'What are the chances' at the 2131 Durant door, the counter, 'Today we're at ... in Berkeley', iced drinks, 'a student friendly neighborhood coffee shop' by campus, and a stacked sandwich. A second film: the page plays @arianasade's. **Ends at 15 s**, before a second person's segment in another part of the shop. |
| `cali-k9.mp4` | Cali K9 (their own story) | [@calik9 highlight](https://www.instagram.com/calik9/) | 2.55s-25.9s of 54s | Glenn, 27 Oct 2026: “Clip this video plz”; Posted by @calik9, a story in their highlight: a mentee on the Cali K9 system. Starts after he names his own kennel. |
| `legend-hotpot-grill.mp4` | Legend Hotpot & Grill, Newark | [DUaFKh6jpBf](https://www.instagram.com/reel/DUaFKh6jpBf/) | 0s-23s of 23s | Glenn, 27 Oct 2026: “Clip this video plz / Foodie”; Filmed by @drooling.bae, 6 Feb 2026. |
| `review-De2J1F7PYQR.mp4` | Legend Hotpot & Grill, Newark (a review) | [De2J1F7PYQR](https://www.instagram.com/reel/De2J1F7PYQR/) | 4s-19s of 43s | Glenn, 27 Oct 2026: “2nd”; Filmed by @bestbayareafood, 23 Oct 2026. After the title card. |
| `review-DeruAsHMWIZ.mp4` | Legend Hotpot & Grill, Newark (a review) | [DeruAsHMWIZ](https://www.instagram.com/reel/DeruAsHMWIZ/) | 8s-22s of 112s | Glenn, 27 Oct 2026: “3rd”; Filmed by @victoria.pham17, 19 Oct 2026. Stops before her critical remarks. |
| `daly-buffet.mp4` | Daly Buffet, Daly City (their own reel) | [Dex2dAxDPal](https://www.instagram.com/reel/Dex2dAxDPal/) | 0s-24s of 31s | Glenn, 27 Oct 2026: “Clip this video plz / No reviews on this place that I can find”; Posted by @daly_buffet, 22 Oct 2026: the storefront, the hot line, sushi, crab legs, the grill and the hot pot bar. |
| `gao-viet-kitchen.mp4` | Gao Viet Kitchen, San Francisco | [DQzrjKrkuTe](https://www.instagram.com/reel/DQzrjKrkuTe/) | 7s-31s of 31s | Glenn, 27 Oct 2026: “Clip this video plz 2nd”, then “as 1st video”; Posted by @mr.gaoviet (Viet Linh Nguyen, Mr. Gao), 8 Nov 2025: the giant beef rib pho. |
| `review-DdX5Vztgv0A.mp4` | Gao Viet Kitchen, San Francisco (a review) | [DdX5Vztgv0A](https://www.instagram.com/reel/DdX5Vztgv0A/) | 41s-56s of 72s | Glenn, 27 Oct 2026: “Clip this video plz for Gao”; Filmed by @allie.eats with @festusfeasts, 17 Sep 2026. Only the Gao half of their Outer Sunset crawl; the Pineapple King half is that page's film. |
| `nawah-market.mp4` | Nawah Market & Deli, Oakland | [DfAZqKEM2fX](https://www.instagram.com/reel/DfAZqKEM2fX/) | 1s-25s of 44s | Glenn, 27 Oct 2026: “Clip this video plz / Foodie”; Filmed by @mayakay.official (Maya), 27 Oct 2026: chopped cheese, a burger and wings. |
| `jay-the-cheesecake-queen.mp4` | Jay The Cheesecake Queen (their own reel) | [DeGEiCAAeGD](https://www.instagram.com/reel/DeGEiCAAeGD/) | 0s-14s of 14s | Glenn, 27 Oct 2026: “Clip this video plz”; Posted by @jaythecheesecakequeen, 5 Oct 2026: their variety cheesecake platters restocked at Nawah Market, East Oakland. |
| `epic-steak.mp4` | EPIC Steak, San Francisco (their own reel) | [Cv5AXy7g0ma](https://www.instagram.com/reel/Cv5AXy7g0ma/) | 0s-9s of 9s | Glenn, 27 Oct 2026: “Watch their video clip”; Posted by @epicsteak, 13 Aug 2023. |
| `garlic-high-sunnyvale.mp4` | Garlic High, Sunnyvale | [DW2mdUEBWzv](https://www.instagram.com/reel/DW2mdUEBWzv/) | 1s-25s of 27s | Glenn, 27 Oct 2026: “Watch this video reel”; Filmed by @kvbitesandgo, 7 Apr 2026. |
| `tacos-oscar.mp4` | Tacos Oscar, Oakland | [DfBPV_UTQ7Q](https://www.instagram.com/reel/DfBPV_UTQ7Q/) | 4s-28s of 72s | Glenn, 27 Oct 2026: “Clip this video plz / Newbie”; Filmed by @antoinetterzz, 28 Oct 2026. Only the Tacos Oscar stop of her girls-night-out itinerary (the storefront, the menu board, the patio, the tacos); **cut at 28 s**, before Two Pitchers. |
| `lunette-cambodia.mp4` | Lunette Cambodia, San Francisco | [DfBSCCyTsMx](https://www.instagram.com/reel/DfBSCCyTsMx/) | 3s-27s of 28s | Glenn, 27 Oct 2026: “Clip this video plz / Heavyweight”; Filmed by @thetastebud, 28 Oct 2026. |
| `square-pie-guys.mp4` | Square Pie Guys | [DeikmKLTGkv](https://www.instagram.com/reel/DeikmKLTGkv/) | 5s-29s of 31s | Glenn, 27 Oct 2026: “Watch this video clip”; Filmed by @stunnaman02, 16 Oct 2026. |
| `fresca-sf.mp4` | Fresca, San Francisco (their own reel) | [DeKwuUdSxhO](https://www.instagram.com/reel/DeKwuUdSxhO/) | 0s-8s of 8s | Glenn, 27 Oct 2026: “Watch their video clip”; Posted by @fresca_sf, 6 Oct 2026. |
| `early-to-rise-sf.mp4` | Early to Rise, San Francisco | [DWEjWglk1Mk](https://www.instagram.com/reel/DWEjWglk1Mk/) | 2s-26s of 77s | Glenn, 27 Oct 2026: “Clip this video plz”; Filmed by @savorwithcoral, 19 Mar 2026. |
| `brunch-and-bloom.mp4` | Brunch & Bloom, Brentwood (their own reel) | [De4jwJIT1yf](https://www.instagram.com/reel/De4jwJIT1yf/) | 0s-7s of 7s | Glenn, 27 Oct 2026: “Please update icon and add clip”, “Watch this video clip”; Posted by @brunchandbloomcafe, 24 Oct 2026. |
| `the-sweet-spot.mp4` | The Sweet Spot, Walnut Creek (their own reel) | [De2eTakJcwz](https://www.instagram.com/reel/De2eTakJcwz/) | 0s-19s of 19s | Glenn, 27 Oct 2026: “Watch this video clip”; Posted by @thesweetspotwc, 23 Oct 2026. |
| `review-Co8T0FtAwBY.mp4` | EPIC Steak (a Foodie review) | [Co8T0FtAwBY](https://www.instagram.com/reel/Co8T0FtAwBY/) | 5s-20s of 38s | Glenn, 27 Oct 2026: “Foodie heavy hitter”; Filmed by @jacksdiningroom, 21 Feb 2023. |
| `review-DHCbSEYSFsN.mp4` | EPIC Steak (a Foodie review) | [DHCbSEYSFsN](https://www.instagram.com/reel/DHCbSEYSFsN/) | 5s-20s of 24s | Glenn, 27 Oct 2026: “Foodie mediocre”; Filmed by @katwalksf, 10 Mar 2025. |
| `review-Cf-UwSdgG8o.mp4` | EPIC Steak (a Foodie review) | [Cf-UwSdgG8o](https://www.instagram.com/reel/Cf-UwSdgG8o/) | 3s-18s of 60s | Glenn, 27 Oct 2026: “3rd”; Filmed by @charweeezy, 14 Jul 2022. |
| `review-De-gzy8snrZ.mp4` | Garlic High, Sunnyvale (a Foodie review) | [De-gzy8snrZ](https://www.instagram.com/reel/De-gzy8snrZ/) | 1s-16s of 21s | Glenn, 27 Oct 2026: “Mediocre”; Filmed by @bayarea.foodie.san, 26 Oct 2026. |
| `review-DcoUarDtU2I.mp4` | Garlic High, Sunnyvale (a Foodie review) | [DcoUarDtU2I](https://www.instagram.com/reel/DcoUarDtU2I/) | 8s-23s of 44s | Glenn, 27 Oct 2026: “Newbie”; Filmed by @yulmoo_l, 29 Aug 2026. |
| `review-CxrN-55P8Nl.mp4` | Square Pie Guys (a Foodie review) | [CxrN-55P8Nl](https://www.instagram.com/reel/CxrN-55P8Nl/) | 3s-18s of 82s | Glenn, 27 Oct 2026: “Medium”; Filmed by @grubwitmike, 27 Sep 2023. |
| `review-DUeW5F6EREw.mp4` | Square Pie Guys (a Foodie review) | [DUeW5F6EREw](https://www.instagram.com/reel/DUeW5F6EREw/) | 27s-42s of 89s | Glenn, 27 Oct 2026: “Heavy heavy weight”; Filmed by @barstoolsports, 7 Feb 2026. |
| `review-DT8dMM3Aem3.mp4` | Square Pie Guys (a Foodie review) | [DT8dMM3Aem3](https://www.instagram.com/reel/DT8dMM3Aem3/) | 1s-16s of 75s | Glenn, 27 Oct 2026: “Newbie”; Filmed by @takeoutwithtuck, 25 Jan 2026. |
| `review-De-iRunR54w.mp4` | Fresca, San Francisco (a Foodie review) | [De-iRunR54w](https://www.instagram.com/reel/De-iRunR54w/) | 12s-27s of 28s | Glenn, 27 Oct 2026: “Clip this video plz”; Filmed by @hungrydanz, 27 Oct 2026. |
| `review-DecI_svxxwC.mp4` | Fresca, San Francisco (a Foodie review) | [DecI_svxxwC](https://www.instagram.com/reel/DecI_svxxwC/) | 9s-24s of 24s | Glenn, 27 Oct 2026: “2nd”; Filmed by @xo.pinsta, 13 Oct 2026. |
| `review-DeQA76lh1PD.mp4` | Fresca, San Francisco (a Foodie review) | [DeQA76lh1PD](https://www.instagram.com/reel/DeQA76lh1PD/) | 17s-32s of 36s | Glenn, 27 Oct 2026: “Heavyweight”; Filmed by @andreweatsinsf, 8 Oct 2026. |
| `review-De29bZ_OXDu.mp4` | Brunch & Bloom, Brentwood (a Foodie review) | [De29bZ_OXDu](https://www.instagram.com/reel/De29bZ_OXDu/) | 33s-48s of 48s | Glenn, 27 Oct 2026: “Newbie”; Filmed by @lovemissfit, 24 Oct 2026. |
| `review-DbunZC5uSFX.mp4` | Brunch & Bloom, Brentwood (a Foodie review) | [DbunZC5uSFX](https://www.instagram.com/reel/DbunZC5uSFX/) | 31s-46s of 47s | Glenn, 27 Oct 2026: “Medium”; Filmed by @jantrinanicole, 7 Aug 2026. |
| `review-De2rMJPP9IC.mp4` | Early to Rise, San Francisco (a Foodie review) | [De2rMJPP9IC](https://www.instagram.com/reel/De2rMJPP9IC/) | 1s-16s of 17s | Glenn, 27 Oct 2026: “Newbie”; Filmed by @chloe_chomps, 23 Oct 2026. |
| `review-DcT6BBStbAk.mp4` | The Sweet Spot, Walnut Creek (a Foodie review) | [DcT6BBStbAk](https://www.instagram.com/reel/DcT6BBStbAk/) | 0s-10s of 10s | Glenn, 27 Oct 2026: “Clip this video plz”; Filmed by @wthellydanyelly, 21 Aug 2026. |
| `review-DbldkkFqBA2.mp4` | The Sweet Spot, Walnut Creek (a Foodie review) | [DbldkkFqBA2](https://www.instagram.com/reel/DbldkkFqBA2/) | 3s-18s of 75s | Glenn, 27 Oct 2026: “Heavyweight”; Filmed by @realtorandreviewer, 3 Aug 2026. |
| `review-Dbd5kXthhrw.mp4` | The Sweet Spot, Walnut Creek (a Foodie review) | [Dbd5kXthhrw](https://www.instagram.com/reel/Dbd5kXthhrw/) | 2s-17s of 128s | Glenn, 27 Oct 2026: “Newbie”; Filmed by @xoaramarie, 31 Jul 2026. |
| `thien-ly-house.mp4` | Thiên Lý House, South San Francisco | [DblRvB7x1I4](https://www.instagram.com/reel/DblRvB7x1I4/) | 0s–24s of 99s | Glenn, 28 Oct 2026: “Clip this video plz”; their South San Francisco room, exterior, dining room and pho. Filmed by @yourglobalfoodiebff, posted 3 Aug 2026 (Pacific). |
| `kajiken-san-mateo.mp4` | Kajiken, San Mateo | [DfD7T6YT7Cy](https://www.instagram.com/reel/DfD7T6YT7Cy/) | 5s–29s of 56s | Glenn, 28 Oct 2026: “Clip this video plz”; **only the Kajiken stop** of her San Mateo dinner-and-dessert itinerary. Stops before SomiSomi. Filmed by @antoinetterzz, posted 28 Oct 2026 (Pacific). |
| `taste-of-shaxian.mp4` | Taste of Shaxian, San Mateo | [DU9GimFkmVj](https://www.instagram.com/reel/DU9GimFkmVj/) | 0s–24s of 24s | Glenn, 28 Oct 2026: “Watch this video clip”, resent as “Foodie”; their storefront, room and dishes. Thanked the business for having them. Filmed by @firstdibs.bayarea, posted 19 Feb 2026 (Pacific). |
| `review-DYNeXe3SB9U.mp4` | Din Ding Dumpling House, Fremont | [DYNeXe3SB9U](https://www.instagram.com/reel/DYNeXe3SB9U/) | 0s–15s of 83s | Glenn, 28 Oct 2026: “Clip this video plz”; Fremont, potstickers and salt-and-pepper pork chops. Filmed by @thesnacksensei, posted 11 May 2026 (Pacific). |
| `review-DBvMxORRkM7.mp4` | Kajiken, San Mateo | [DBvMxORRkM7](https://www.instagram.com/reel/DBvMxORRkM7/) | 0s–15s of 15s | Glenn, 28 Oct 2026: “Heavy / Clip this video plz”; Kajiken San Mateo. Filmed by @eatswithkath, posted 29 Oct 2024 (Pacific). |
| `review-DZHBRMYvzav.mp4` | Kajiken, San Mateo | [DZHBRMYvzav](https://www.instagram.com/reel/DZHBRMYvzav/) | 0s–15s of 22s | Glenn, 28 Oct 2026: “Clip this video plz / Foodie”; Kajiken San Mateo. Filmed by @eatswithfoodie, posted 2 Jun 2026 (Pacific). |
| `review-DcXXO44osnK.mp4` | Taste of Shaxian, San Mateo | [DcXXO44osnK](https://www.instagram.com/reel/DcXXO44osnK/) | 0s–15s of 88s | Glenn, 28 Oct 2026: “Clip this video plz”; Taste of Shaxian, first additional review. Filmed by @thesnacksensei, posted 22 Aug 2026 (Pacific). |
| `review-Dcmwqxlp0WR.mp4` | Taste of Shaxian, San Mateo | [Dcmwqxlp0WR](https://www.instagram.com/reel/Dcmwqxlp0WR/) | 4s–19s of 45s | Glenn, 28 Oct 2026: “Clip this video plz 2nd”; Taste of Shaxian, crab roe noodles. Filmed by @jensintec, posted 28 Aug 2026 (Pacific). |
| `review-DbUmGGDyMF3.mp4` | Taste of Shaxian, San Mateo | [DbUmGGDyMF3](https://www.instagram.com/reel/DbUmGGDyMF3/) | 0s–15s of 28s | Glenn, 28 Oct 2026: “Clip this video plz 3rd”; Taste of Shaxian, Fujian snacks and steamed pots. Filmed by @snackateriansf, posted 27 Jul 2026 (Pacific). |
| `review-DPM1flUEqkS.mp4` | Din Ding Dumpling House, Fremont | [DPM1flUEqkS](https://www.instagram.com/reel/DPM1flUEqkS/) | 15s–30s of 42s | Glenn, 28 Oct 2026: “Clip this video plz 2nd”; Din Ding Fremont. **Original post marked #ad.** Filmed by @apoorva_sharma1, posted 29 Sep 2025 (Pacific). |
| `din-ding-dumpling-house-fremont.mp4` | Din Ding Dumpling House, Fremont (their own film) | [DBFuIT3vF3j](https://www.instagram.com/reel/DBFuIT3vF3j/) | 0s–24s of 49s | Glenn, 28 Oct 2026, 8:39 pm: “Watch this video clip”; Posted by @dindingdumplingbayarea, 13 Oct 2024 (Pacific), their Fremont opening film: buns, shao mai, noodles, fried rice and wok footage. No expired offer is shown. |
| `origin-lab-coffee-matcha.mp4` | Batch 75, origin-lab-coffee-matcha | [DaT-h7hO6UK](https://www.instagram.com/reel/DaT-h7hO6UK/) | 0s–15.1s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @originlabcoffeematcha. Originally posted 02 Jul 2026 (Pacific). |
| `review-DXsa0XQj9lg.mp4` | Batch 75, review-DXsa0XQj9lg | [DXsa0XQj9lg](https://www.instagram.com/reel/DXsa0XQj9lg/) | 0s–14s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @andreweatsinsf. Originally posted 28 Apr 2026 (Pacific). |
| `parekoy-lutong-pinoy.mp4` | Batch 75, parekoy-lutong-pinoy | [DICDnlYS968](https://www.instagram.com/reel/DICDnlYS968/) | 0s–24s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @margs.out. Originally posted 04 Apr 2025 (Pacific). |
| `review-De-Tlz7SnXg.mp4` | Batch 75, review-De-Tlz7SnXg | [De-Tlz7SnXg](https://www.instagram.com/reel/De-Tlz7SnXg/) | 0s–19.7s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @bayarea_fooddreamz. Originally posted 26 Oct 2026 (Pacific). |
| `pizza-casamia.mp4` | Batch 75, pizza-casamia | [De3TqRvOWos](https://www.instagram.com/reel/De3TqRvOWos/) | 24s–48s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @pizzacasamiasanjose. Originally posted 23 Oct 2026 (Pacific). |
| `yami-bowl.mp4` | Batch 75, yami-bowl | [De3dn2GpbjB](https://www.instagram.com/reel/De3dn2GpbjB/) | 1s–10.9s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @yamibowlbbq. Originally posted 23 Oct 2026 (Pacific). |
| `review-Dd7oiAFo-s-.mp4` | Batch 75, review-Dd7oiAFo-s- | [Dd7oiAFo-s-](https://www.instagram.com/reel/Dd7oiAFo-s-/) | 0s–15s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @volha_creative. Originally posted 30 Sep 2026 (Pacific). |
| `review-Dep7JcOREof.mp4` | Batch 75, review-Dep7JcOREof | [Dep7JcOREof](https://www.instagram.com/reel/Dep7JcOREof/) | 5s–20s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @yourglobalfoodiebff. Originally posted 18 Oct 2026 (Pacific). |
| `review-DewyciVBPO8.mp4` | Batch 75, review-DewyciVBPO8 | [DewyciVBPO8](https://www.instagram.com/reel/DewyciVBPO8/) | 0s–15s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @boba._.addict. Original caption thanks the restaurant for hosting. Originally posted 21 Oct 2026 (Pacific). |
| `wikiwiki-hawaiian-bbq.mp4` | Batch 75, wikiwiki-hawaiian-bbq | [DdIXcNQhIcm](https://www.instagram.com/reel/DdIXcNQhIcm/) | 0s–24s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @yogetasworld. Originally posted 10 Sep 2026 (Pacific). |
| `review-DcOpenPtXTm.mp4` | Batch 75, review-DcOpenPtXTm | [DcOpenPtXTm](https://www.instagram.com/reel/DcOpenPtXTm/) | 0s–15s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @wthellydanyelly. Originally posted 19 Aug 2026 (Pacific). |
| `review-DYT0xwFS2RV.mp4` | Batch 75, review-DYT0xwFS2RV | [DYT0xwFS2RV](https://www.instagram.com/reel/DYT0xwFS2RV/) | 17s–32s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @feed_happiness_. Excerpt excludes the dated 20-year anniversary claim. Originally posted 13 May 2026 (Pacific). |
| `ocean-oyster-bar-redwood-city.mp4` | Batch 75, ocean-oyster-bar-redwood-city | [DWIGk2_j-fX](https://www.instagram.com/reel/DWIGk2_j-fX/) | 4s–18s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Filmed by @indigosmedia; posted by @oceanoysterbar. Originally posted 20 Mar 2026 (Pacific). |
| `review-DfDb-kFSieE.mp4` | Batch 75, review-DfDb-kFSieE | [DfDb-kFSieE](https://www.instagram.com/reel/DfDb-kFSieE/) | 0s–15s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @booziebrunch. Originally posted 28 Oct 2026 (Pacific). |
| `review-DdaEd-tvxIk.mp4` | Batch 75, review-DdaEd-tvxIk | [DdaEd-tvxIk](https://www.instagram.com/reel/DdaEd-tvxIk/) | 9s–24s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @ruthannesturman. Food excerpt excludes the opening and closing $1.95 oyster/happy-hour offer. Originally posted 17 Sep 2026 (Pacific). |
| `mumu-hot-pot-sunnyvale.mp4` | Batch 75, mumu-hot-pot-sunnyvale | [DfEOxAYSUDd](https://www.instagram.com/reel/DfEOxAYSUDd/) | 0s–24s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @itsmayrazambrano. Originally posted 28 Oct 2026 (Pacific). |
| `lucky-three-seven-b75.mp4` | Batch 75, lucky-three-seven-b75 | [DevbNctK0uP](https://www.instagram.com/reel/DevbNctK0uP/) | 0s–24s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @hungry4munchies. Originally posted 20 Oct 2026 (Pacific). |
| `review-DfDGWfQPoFv.mp4` | Batch 75, review-DfDGWfQPoFv | [DfDGWfQPoFv](https://www.instagram.com/reel/DfDGWfQPoFv/) | 0s–15s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @mayakay.official. Originally posted 28 Oct 2026 (Pacific). |
| `review-DUg0QAHEgY4.mp4` | Batch 75, review-DUg0QAHEgY4 | [DUg0QAHEgY4](https://www.instagram.com/reel/DUg0QAHEgY4/) | 0s–16s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @lucky777oakland. Featuring @larryjunetfm and @tommybogo tasting Lucky’s wings at Family Style Fest; camera operator not identified. Originally posted 08 Feb 2026 (Pacific). |
| `house-of-phin.mp4` | Batch 75, house-of-phin | [DEXqp6JRA7r](https://www.instagram.com/reel/DEXqp6JRA7r/) | 0s–5.4s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @houseofphin_. Originally posted 03 Jan 2025 (Pacific). |
| `review-DWCrai9EjCQ.mp4` | Batch 75, review-DWCrai9EjCQ | [DWCrai9EjCQ](https://www.instagram.com/reel/DWCrai9EjCQ/) | 0s–15s | Glenn, 28–29 Oct 2026: Watch this video clip / Clip this video plz; Batch 75. Posted by @eileenhuynher. Originally posted 18 Mar 2026 (Pacific). |
| `review-DBw6bNGv2nD.mp4` | Lucky Three Seven, Oakland | [DBw6bNGv2nD](https://www.instagram.com/reel/DBw6bNGv2nD/) | 6s–22s of 49s | Existing verified @thetastebud excerpt, copied without recutting; retained as an additional review in Batch 75. No Toppings Too or Parekoy footage. |
| `chubby-cattle-bbq-pleasanton-b76.mp4` | Batch 76 | [DfFnfKgvdwi](https://www.instagram.com/reel/DfFnfKgvdwi/) | 0s–24s | Glenn, 29 Oct 2026: Chubby Cattle BBQ, Pleasanton; “Watch this video clip / Heavy hitter”. Filmed by @trinhdoesthings. Original post 29 Oct 2026 (Pacific). |
| `review-DbY-GatSDXj.mp4` | Batch 76 | [DbY-GatSDXj](https://www.instagram.com/reel/DbY-GatSDXj/) | 0s–15s | Glenn, 29 Oct 2026: Chubby Cattle BBQ, Pleasanton; “Clip this video plz / Newbie”. Filmed by @aloha_stephanie. Original post 29 Jul 2026 (Pacific). |
| `the-sea-by-ash.mp4` | Batch 76 | [Dexogd1g-UR](https://www.instagram.com/p/Dexogd1g-UR/) | 0s–5.32s | Glenn, 29 Oct 2026: The Sea by Alexander’s Steakhouse, Palo Alto; “Watch this video clip”. Posted by @theseabyash; their own kitchen, plating and caviar footage. Original post 21 Oct 2026 (Pacific). |
| `review-DevfMX2isDa.mp4` | Chubby Cattle BBQ, Pleasanton | [DevfMX2isDa](https://www.instagram.com/reel/DevfMX2isDa/) | 6s–30s of 34s | Existing @createwithcv invited-visit excerpt, originally posted 21 Oct 2026. Copied without recutting from the Batch 68 main film; retained as an additional review in Batch 76. Starts after membership-price signs. |
| `hotpot-bay.mp4` | Hotpot Bay, San Francisco | [DbmW4BoD9bf](https://www.instagram.com/reel/DbmW4BoD9bf/) | 0s–24s | Glenn, 29 Oct 2026: Watch this video clip; posted by @hotpotbay. Original post 03 Aug 2026 (Pacific). |
| `review-DdQBcwLT8Iy.mp4` | Hotpot Bay, San Francisco | [DdQBcwLT8Iy](https://www.instagram.com/reel/DdQBcwLT8Iy/) | 0s–15s | Glenn, 29 Oct 2026: Clip this video plz / Mediocre; filmed by @martiwantsmore. Original post 13 Sep 2026 (Pacific). |
| `review-DZbrqbWT98E.mp4` | Hotpot Bay, San Francisco | [DZbrqbWT98E](https://www.instagram.com/reel/DZbrqbWT98E/) | 0s–15s | Glenn, 29 Oct 2026: Clip this video plz / Newbie; filmed by @dchangshangry. Original post 10 Jun 2026 (Pacific). |
| `review-DXr9m1JEt1A.mp4` | Hotpot Bay, San Francisco | [DXr9m1JEt1A](https://www.instagram.com/reel/DXr9m1JEt1A/) | 10s–25s | Glenn, 29 Oct 2026: Clip this video plz / Heavy Hitter; filmed by @foodandsachi. Excludes later $19.99 offer and review screenshot. Original post 28 Apr 2026 (Pacific). |

<!-- Batch 77, Glenn 29 October 2026 -->
| `urban-matcha-castro-valley.mp4` | [@urbanmatcha.castrovalley](https://www.instagram.com/reel/DdzzWXtiYsE/) | 27 Sep 2026 | 0–10.82s; Glenn’s Batch 77 Watch/review request. |
| `review-DcUGJ9NPYjO.mp4` | [@byhillaryn](https://www.instagram.com/reel/DcUGJ9NPYjO/) | 21 Aug 2026 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `review-DaqhXYDh5xl.mp4` | [@eatwithsie](https://www.instagram.com/reel/DaqhXYDh5xl/) | 11 Jul 2026 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `review-DfFqZBQCj1S.mp4` | [@mukbangyourmama](https://www.instagram.com/reel/DfFqZBQCj1S/) | 29 Oct 2026 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `tleafgreen-san-jose.mp4` | [@tleafgreensj](https://www.instagram.com/reel/De3VXvPT9m8/); ends before the dated promotion graphic | 23 Oct 2026 | 0–18s; Glenn’s Batch 77 Watch/review request. |
| `review-DeahroUhP1L.mp4` | [@aly_eats_cali](https://www.instagram.com/reel/DeahroUhP1L/) | 12 Oct 2026 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `review-De059eHyBFq.mp4` | [@feed_happiness_](https://www.instagram.com/reel/De059eHyBFq/) | 22 Oct 2026 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `review-DbekpvnJljy.mp4` | [@bestbayareafood](https://www.instagram.com/reel/DbekpvnJljy/) | 31 Jul 2026 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `raizes-do-brasil.mp4` | [@raizesdobrasilus](https://www.instagram.com/p/DeznhqSAX8j/) | 22 Oct 2026 | 0–24s; Glenn’s Batch 77 Watch/review request. |
| `house-of-prime-rib.mp4` | [@your_travel_daddy](https://www.instagram.com/reel/DeeoxAoOLeK/) | 14 Oct 2026 | 0–17.58s; Glenn’s Batch 77 Watch/review request. |
| `review-C3Gtd_CvrpR.mp4` | [@jacksdiningroom](https://www.instagram.com/reel/C3Gtd_CvrpR/) | 08 Feb 2024 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `review-DEeM01jxsBT.mp4` | [@thesnacksensei](https://www.instagram.com/reel/DEeM01jxsBT/) | 05 Jan 2025 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `review-Db1zs7kNPv_.mp4` | [@thesauceboss_](https://www.instagram.com/reel/Db1zs7kNPv_/) | 09 Aug 2026 | 28–43s; Glenn’s Batch 77 Watch/review request. |
| `laughing-monk-nopa-b77.mp4` | [@startingfiresevrywhere](https://www.instagram.com/reel/Def_2PqRcyz/) | 14 Oct 2026 | 0–24s; Glenn’s Batch 77 Watch/review request. |
| `review-DfFq35OzQqk.mp4` | [@thelaughingmonksf](https://www.instagram.com/reel/DfFq35OzQqk/); review by TikTok @bsgmoments, reposted by the restaurant | 29 Oct 2026 | 0–15s; Glenn’s Batch 77 Watch/review request. |
| `review-Defo2sWSjXA.mp4` | [@itsslydiia](https://www.instagram.com/reel/Defo2sWSjXA/) | Retained from original Laughing Monk main | Same original excerpt, copied without recutting for Batch 77. |
| `scp-argos.mp4` and `scp-argos-poster.webp` | [@scp_argos](https://www.instagram.com/reel/DfGEub9ou_5/), posted 2026-10-29 PDT | Glenn, Batch 79: Clip. Excerpt 0–7.734s; main b_scpargos. |
| `gem-city-kennels.mp4` and `gem-city-kennels-poster.webp` | [@gemcity_kennels](https://www.instagram.com/reel/DBriyqevail/), posted 2024-10-28 PDT | Glenn, Batch 79: Clip. Excerpt 0–8.709s; main b_gemcitykennels. |
| `sin-city-pits-vogue.mp4` and `sin-city-pits-vogue-poster.webp` | [@sincitypits_mama](https://www.instagram.com/reel/DdTBdW7iuoN/), posted 2026-09-14 PDT | Glenn, Batch 79: Clip. Excerpt 0–4.994s; additional b_sincitypits. |
| `kiyomi-ca-phe-own-20261030.mp4` and `kiyomi-ca-phe-own-20261030-poster.webp` | [@kiyomi_ca_phe](https://www.instagram.com/reel/Db4lW0mPuf3/), posted 2026-08-10 PDT | Glenn, Batch 79: Newbie; posting business itself. Excerpt 0–15s; additional b_kiyomicaphe. |
| `kiyomi-ca-phe-coffee.mp4` and `kiyomi-ca-phe-coffee-poster.webp` | [@bkwa](https://www.instagram.com/reel/DXLdUcUkgWv/), posted 2026-04-15 PDT | Glenn, Batch 79: Watch; @bkwa with Kiyomi. Excerpt 0–24s; additional b_kiyomicaphe. |
| `review-DfGVIPXRo28.mp4` and `review-DfGVIPXRo28-poster.webp` | [@hungrydanz](https://www.instagram.com/reel/DfGVIPXRo28/), posted 2026-10-29 PDT | Glenn, Batch 79: Mediocre. Excerpt 0–15s; review b_wasabiudonandkatsubar. |
| `pho-hoa-jamesbaylife.mp4` and `pho-hoa-jamesbaylife-poster.webp` | [@jamesbaylife](https://www.instagram.com/reel/DeX4WuZRIa1/), posted 2026-10-11 PDT | Glenn, Batch 79: Watch; For Pho Hoa. Excerpt 0–14.282s; main b_phohoa. |
| `review-DfGNmCAowHQ.mp4` and `review-DfGNmCAowHQ-poster.webp` | [@thesnacksensei](https://www.instagram.com/reel/DfGNmCAowHQ/), posted 2026-10-29 PDT | Glenn, Batch 79: Heavy Hitter. Excerpt 0–15s; review b_tapsilogexpress. |
| `review-DVoRfaOjo8q.mp4` and `review-DVoRfaOjo8q-poster.webp` | [@ivkicks](https://www.instagram.com/reel/DVoRfaOjo8q/), posted 2026-03-08 PDT | Glenn, Batch 79: Mediocre. Excerpt 20–35s; review b_tapsilogexpress. |
| `tapsilog-express.mp4` and `tapsilog-express-poster.webp` | [@grubwitmike](https://www.instagram.com/reel/CzclnWPx0z4/), posted 2023-11-09 PDT | Glenn, Batch 79: Heavy Hitter #2; Watch afterward with no new URL. Excerpt 0–24s; main b_tapsilogexpress. |
| `royal-root-cafe.mp4` and `royal-root-cafe-poster.webp` | [@royalrootcafe](https://www.instagram.com/reel/De-AecpSF7k/), posted 2026-10-26 PDT | Glenn, Batch 79: Watch. Excerpt 0–12.967s; main b_royalrootcafe. |
| `united-mexican-bar-and-grill.mp4` and `united-mexican-bar-and-grill-poster.webp` | [@unitedmexicanrestaurant](https://www.instagram.com/reel/De0JUkJvxNE/), posted 2026-10-22 PDT | Glenn, Batch 79: Watch; exclude opening expired offer. Excerpt 4–16.372s; main b_unitedmexicanbarandgrill. |
| `review-Def33KkR7R_.mp4` and `review-Def33KkR7R_-poster.webp` | [@bayareamunchies510](https://www.instagram.com/reel/Def33KkR7R_/), posted 2026-10-14 PDT | Glenn, Batch 79: Newbie. Excerpt 5–20s; review b_acekingbbq. |
| `review-DV7dhE8CeFT.mp4` and `review-DV7dhE8CeFT-poster.webp` | [@bayarea.foodie.adventures](https://www.instagram.com/reel/DV7dhE8CeFT/), posted 2026-03-15 PDT | Glenn, Batch 79: Heavy Hitter. Excerpt 0–9.313s; review b_acekingbbq. |
| `review-DSJIdTWAQnq.mp4` and `review-DSJIdTWAQnq-poster.webp` | [@cestalmoco](https://www.instagram.com/reel/DSJIdTWAQnq/), posted 2025-12-11 PDT | Glenn, Batch 79: Mediocre; Ace King BBQ visible in signage and hats. Excerpt 0–6.295s; review b_acekingbbq. |
| `ramen-shop.mp4` and `ramen-shop-poster.webp` | [@festusfeasts](https://www.instagram.com/reel/DfGwYh5gSIi/), posted 2026-10-29 PDT | Glenn, Batch 79: Heavy Hitter. Excerpt 0–24s; main b_ramenshop. |
| `review-DE221k6SUbK.mp4` and `review-DE221k6SUbK-poster.webp` | [@foodandsachi](https://www.instagram.com/reel/DE221k6SUbK/), posted 2025-01-15 PDT | Glenn, Batch 79: Mediocre. Excerpt 0–15s; review b_ramenshop. |
| `review-DH9_OWiRznc.mp4` and `review-DH9_OWiRznc-poster.webp` | [@bayarea.foodie.adventures](https://www.instagram.com/reel/DH9_OWiRznc/), posted 2025-04-02 PDT | Glenn, Batch 79: Mediocre. Excerpt 0–15s; review b_nokaramen. DH9_OWiRznc source copy has no exposed audio track. |
| `noka-ramen.mp4` and `noka-ramen-poster.webp` | [@grubwitmike](https://www.instagram.com/reel/C0X_JoGtESz/), posted 2023-12-02 PDT | Glenn, Batch 79: Heavy Hitter. Excerpt 0–24s; main b_nokaramen. |
| `review-DeNzH3MB3Lu.mp4` and `review-DeNzH3MB3Lu-poster.webp` | [@hangrypotato](https://www.instagram.com/reel/DeNzH3MB3Lu/), posted 2026-10-07 PDT | Glenn, Batch 79: Newbie. Excerpt 8–23s; review b_nokaramen. |
| `review-De2Jr6CxEER.mp4` and poster | [@moniica.michelle](https://www.instagram.com/reel/De2Jr6CxEER/) | Batch 79: existing Pho Hoa excerpt copied without recutting; its earlier credit and original date remain in this file. |
| `san-san-tea-house.mp4` and `san-san-tea-house-poster.webp` | [@sanleandroeats](https://www.instagram.com/reel/DW4iaEQkmUI/), posted 2026-04-08 Pacific | Glenn, Batch 80: Watch this video clip. Excerpt 0–10.985s. Main Watch; April 13 discount expired and is not offered on BEASTY; no promotion overlay in the film. Original audio retained. |
| `review-DfHBbcgSlPy.mp4` and `review-DfHBbcgSlPy-poster.webp` | [@feed_happiness_](https://www.instagram.com/reel/DfHBbcgSlPy/), posted 2026-10-30 Pacific | Glenn, Batch 80: Clip this video plz / Heavy Hitter. Excerpt 31–46s. Heavy Hitter; additional review of San San Tea House. Original audio retained. |
| `review-DGMZVoJywEB.mp4` and `review-DGMZVoJywEB-poster.webp` | [@eatswithkath](https://www.instagram.com/reel/DGMZVoJywEB/), posted 2025-02-17 Pacific | Glenn, Batch 80: Heavy Hitter. Excerpt 6.2–10.381s. Berkeley; start after the misleading Michelin headline. Original audio retained. |
| `review-DeORBvOI6mJ.mp4` and `review-DeORBvOI6mJ-poster.webp` | [@sierra.eats.8](https://www.instagram.com/reel/DeORBvOI6mJ/), posted 2026-10-07 Pacific | Glenn, Batch 80: Newbie. Excerpt 0–6.852s. Fremont archival October 8 BOGO; expired offer disclosed before playback. Original audio retained. |
| `review-DeCRPNNJrCa.mp4` and `review-DeCRPNNJrCa-poster.webp` | [@hungere.for.diy](https://www.instagram.com/reel/DeCRPNNJrCa/), posted 2026-10-03 Pacific | Glenn, Batch 80: Mediocre. Excerpt 18–33s. Pleasanton location disclosed before playback. Original audio retained. |
| `chicha-san-chen-berkeley.mp4` and `chicha-san-chen-berkeley-poster.webp` | [@chichasanchen.norcal](https://www.instagram.com/reel/De5q0XZq-D5/), posted 2026-10-24 Pacific | Glenn, Batch 80: Watch. Excerpt 0–9.313s. Own regional mocktail post; posted-by credit, not an independent review. Original audio retained. |
