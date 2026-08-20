# Landing photographs

The four pictures the landing page flips to, from **instagram.com/beasty_pages**
— the operator's own account, so this is his material on his own app.

Built by `tools/make-landing-photo.py`, which is the thing to run when he swaps
them. It takes a gallery shortcode and a slot:

    /opt/homebrew/bin/python3 tools/make-landing-photo.py CbeQ8X4uCkn 4
    /opt/homebrew/bin/python3 tools/make-landing-photo.py --all

| Slot | From the post | Why this one |
|---|---|---|
| 1 | `CbeRyb1OCcZ` | Biggie head-on, close |
| 2 | `BvAKMQqh79w` | Two dogs, full body |
| 3 | `BvCLGJIn_pg` | Profile, outdoors |
| 4 | `CbeQ8X4uCkn` | The sharpest file on the account |

All four are shots where the DOG is the subject. The rest of that account is
sneakers, a Lakers jersey and film crews, which say nothing behind a wordmark
about him.

## The resolution ceiling, which is the thing worth knowing

The landing is full-bleed and wants a 0.46-aspect slice. Every one of these
posts is about 1200 tall and square-ish, so the tallest slice of that shape is
**554 pixels wide — from all of them**, whatever their stated width says. A 3x
phone paints 1179. So every landing photograph is a 2.13x enlargement and no
amount of processing changes that.

An attempt at fixing it by shipping 1290px files was **measurably worse**: they
carried the same 554 pixels of information and painted softer than the 900px
files they replaced. What helped instead was landing on 1179x2556 exactly — an
iPhone 15 at 3x then paints 1:1 with no resampling at all — plus a light unsharp
mask for the acutance any enlargement costs. Measured on what the browser
actually paints, that is 1.35x to 1.92x sharper than the first version.

**The one real fix is more pixels in the source.** Original camera files from
the operator, rather than what Instagram serves back, would lift all four.
Worth asking him for.

EDSR x4 is in the pipeline and is doing less than it looks: on sources this soft
it measures level with bicubic. It is kept because it costs nothing at build
time and does no harm, not because it is rescuing anything.

## Weight

669KB for the four, against 465KB before. Paid for by loading them **one step
ahead** instead of all at once — the landing now fetches the current picture and
the next one, so the first flip costs two files rather than four.

## Not the same case as the gallery

`public/gallery/CREDITS.md` explains why those twelve are deliberately NOT
upscaled: they are 148px thumbnails and are already downscaled ~2x by the
browser. Half of them carry only about 600px of real detail. Enlarging them
would quadruple the page weight and change nothing anybody can see.
