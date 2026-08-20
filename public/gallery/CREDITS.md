# Gallery provenance

Twelve posts from **instagram.com/beasty_pages** — the operator's own account,
so unlike the wallpapers and the business logos this is his material on his own
app. Nothing here belongs to a third party except the people and places in the
frames.

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
These are re-encoded to WebP, capped at 1200px, 1.3MB for all twelve.

## To add more

Drop the file in this folder and add a row to `src/data/gallery.ts`. `taken` is
the date the photograph was POSTED, in Pacific — the window groups on it.
