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
