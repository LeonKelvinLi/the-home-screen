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

Downscaled to 540px wide, H.264 at CRF 28, `faststart`, **and the audio track
removed entirely**. The hero plays muted because no mobile browser will autoplay
otherwise, so shipping a soundtrack nobody can hear would be bytes on every page
view. A viewer who wants the sound, the caption and the follower count still
gets them from the card below the hero, which opens the real post.

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
