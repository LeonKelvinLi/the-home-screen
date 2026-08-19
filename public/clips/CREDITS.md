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

Both links came from the operator, who is working with both businesses —
Downtown Barbecue is a delivery customer of his and he showed them their page
in person. Neither business handed the file over directly, which is the
difference between this and a clip a partner emails us, and it is why this file
exists.

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

## The one thing to keep true

The hero film is decoration and is marked `aria-hidden`. It must never become
the only way to see a business's video, because it carries no sound, no caption
and no attribution of its own — the credited card below it is what does that
job, and it stays.
