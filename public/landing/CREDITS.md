# Landing photographs

The four posts the landing page flips to, from **instagram.com/beasty_pages** —
the operator's own account, so this is his material on his own app.

Built by `tools/make-landing-photo.py`, which is the thing to run when he swaps
them:

    /opt/homebrew/bin/python3 tools/make-landing-photo.py --all
    /opt/homebrew/bin/python3 tools/make-landing-photo.py ~/Desktop/IMG_2205.png 1

| Slot | From | What it is |
|---|---|---|
| 1 | `IMG_2205` | Hollywood Hills, mirrored — the one he picked out with "This one is better" |
| 2 | `IMG_2199` | Biggie on a blue lead, 7 February 2019 |
| 3 | `IMG_2202` | Biggie against a balcony rail, 18 January 2019 |
| 4 | `IMG_2201` | Blue-nose to nose, mirrored and tinted |

## The whole card, not a crop of the picture in it

His instruction, once he had seen the first version: *"keep the entire Instagram
background with it. Basically put it on there exactly like as you see with the
dates and BEASTY_pages above."* So the avatar, the handle, the location, the
likes, his caption and the date all stay. That context is the point — *"there
are a lot of prominent people in these pictures"* — and a bare crop of the
photograph threw away the part that proves it.

**Two strips come out, and neither of them is Instagram.** The iOS status bar,
because his clock, carrier and battery percentage are not part of the post; and
the "View insights / Boost post" row, because that is Instagram's creator UI and
is visible only to whoever owns the account. A customer seeing "Boost post"
under a photograph would reasonably think the button was theirs to press.

The nav above the account row goes too. It repeats the handle, and being pale it
showed straight through the translucent mark that sits over that exact spot.

## What this replaced, and why

The first version cut a 0.46-aspect slice out of the square post. No source
could fill it: every one gave 554 pixels for a screen that paints 1179, a 2.13x
enlargement of the largest image in the app. A screenshot is 1320 wide to begin
with, so the card **downscales** to 1179 and paints sharp.

Drawn with `background-size: contain`, not `cover` — "the entire Instagram
background" is not kept by cropping it. The letterbox uses the chrome colour
sampled from the file, so the fill is invisible against the card.

## The tab bar had to be told about this

The landing's tab bar inverts to white ink while a picture is up. That treatment
was written when every landing photograph was a dog against foliage; Instagram's
chrome is near-white, and white ink on it is not a treatment, it is an erasure.
Each file's `light` flag in `LANDING_PHOTOS` comes from the mean brightness of
its bottom fifth, which the tool prints. **If a swapped-in picture is dark at the
foot, set `light: false` for it** and the white tab bar comes back.

## Duplicates

He sent 2200, 2205 and 2209 as three pictures. They are three screenshots of the
same post — same caption, same 19 likes, same 24 January 2019. Slot 4 is 2201
instead, which was his own fourth pick anyway. Worth checking on any future
batch: the fastest tell is the like count.

## Weight

620KB for the four, loaded **one step ahead** rather than all at once — the
landing fetches the current picture and the next, so the first flip costs two
files instead of four.
