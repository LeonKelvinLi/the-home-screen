# Gallery provenance

**2026-09-02: the first affiliate post.** `2026-09-02-sin-city-pits-breeder.webp`
is Sin City Pits' own flyer, cropped out of the screenshot Glenn sent with
"post this on Sin City Pits page? Also, the gallery." It is theirs, not his,
and it is named by date because it arrived as a screenshot with no shortcode.
The same picture and the post's second slide sit on their brand page.

Twenty-nine posts from **instagram.com/beasty_pages** — the operator's own
account, so unlike the wallpapers and the business logos this is his material on
his own app. Nothing here belongs to a third party except the people and places
in the frames.

## Two batches, and they are not equally checkable

**Twelve were downloaded** from Instagram and are named by shortcode. Each one
links back to its post, so its caption can be checked against the source.

**Seventeen arrived as SCREENSHOTS** on 2026-08-20 — "Can you go ahead and put
all these pictures in the gallery as well" — and are named by date. A screenshot
carries no shortcode, so these have no link back and their captions were
transcribed off the picture by eye. That is the one thing to know about them: if
a caption ever looks wrong, it is one of these seventeen, and the screenshots
are the only record.

He sent twenty. Three were duplicates — 2205 and 2209 are the same post as 2200,
and one Berkeley shot was sent twice — caught on caption, date and like count.

`tools/make-gallery-post.py` cuts the photograph out of a screenshot. The
account header and the creator-only "View insights / Boost post" row are found
and dropped; see the comment on `photo_top`, which records the four detectors
that failed before the working one, because every one of them looked correct
until a particular post proved otherwise.

Captions are **his own words**, trimmed only where a tag list ran on. He asked
for "a short story" with each picture; the true version of that is the thing he
already wrote, and every tile links back to its post so the two can be compared.

## Dates

Instagram printed the date in the alt text of eight of these and left four
blank. The four were decoded from the shortcode — it is base64 of the media id,
and the id's high bits are a millisecond timestamp — and that decoder was
**checked against all eight known dates before any of it was used**. It agreed
with all eight, but only once read in Pacific time: read as UTC, three of the
eight came out a day late, which is exactly the kind of error that would have
gone unnoticed if the check had been skipped.

## Not upscaled

Every file arrived between 1080 and 1440 pixels wide. That is already more than
a 148px grid cell or a full-width phone view can use, so running a
super-resolution net over them would have quadrupled the weight of the page and
added nothing anybody could see. Upscaling is for sources that come in small.
These are re-encoded to WebP, capped at 1200px.

The landing photographs are the OPPOSITE case and are handled by a different
tool — see `public/landing/CREDITS.md`. There the whole Instagram card is kept,
because he asked for it there specifically, and the file has to fill a phone
rather than a 148px cell.

## To add more

Drop the file in this folder and add a row to `src/data/gallery.ts`. `taken` is
the date the photograph was POSTED, in Pacific — the window groups on it.
