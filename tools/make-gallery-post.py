"""Cut the photograph out of a screenshot of one of Biggie's posts.

    /opt/homebrew/bin/python3 tools/make-gallery-post.py --all

For the GALLERY, which is the opposite job to tools/make-landing-photo.py. The
landing keeps the whole Instagram card because he asked for it there; the
gallery is a grid of square thumbnails that already prints the date and his
caption underneath in our own type, so what it wants is the picture on its own.

The photograph is the block between the account row and the creator-only row.
Its top is found by variance rather than by a fixed offset: Instagram's chrome
is near-uniform across a row and a photograph is not, so the first row with real
spread across it is the top of the picture. A fixed offset breaks the moment a
post carries a location line and the account row grows.

SHORTCODES ARE NOT AVAILABLE FROM A SCREENSHOT, so these carry no `href` back to
the post — unlike the twelve that were downloaded properly. That is a real loss:
those twelve can have their captions checked against the source and these cannot.
The captions here were transcribed off the screenshots by eye instead, which is
why they are worth re-reading if anything ever looks off.
"""

import argparse
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "gallery")
POSTS = os.environ.get(
    "BEASTY_POSTS",
    "/private/tmp/claude-501/-Users-leon/65b00703-f0ad-4535-98e3-27d8a7170959/scratchpad/msgs",
)
MAX = 1200

# The seventeen distinct posts in the batch he sent on 2026-08-20. He sent
# twenty; 2205 and 2209 repeat 2200, and 2007_IMG_2216 repeats 2004_IMG_2216.
POSTS_MANIFEST = [
    ("1907_IMG_2199.png", "2019-02-07-tbt-biggie"),
    ("1907_IMG_2200.png", "2019-01-24-hollywood-hills"),
    ("1907_IMG_2201.png", "2019-01-24-blue-nose"),
    ("1907_IMG_2202.png", "2019-01-18-biggie-gotti"),
    ("1958_IMG_2206.png", "2019-01-18-lacma"),
    ("1958_IMG_2207.png", "2019-01-17-nicky-diamonds"),
    ("1958_IMG_2208.png", "2019-03-14-flight-club"),
    ("1958_IMG_2210.png", "2019-01-18-flight-club-2008"),
    ("2000_IMG_2211.png", "2019-01-18-sportie-la"),
    ("2001_IMG_2212.png", "2019-01-16-ten-year-challenge"),
    ("2001_IMG_2213.png", "2018-11-30-hbd-richmond"),
    ("2002_IMG_2214.png", "2019-01-18-melrose"),
    ("2002_IMG_2215.png", "2019-01-24-live-beasty"),
    ("2004_IMG_2216.png", "2019-01-24-telegraph-berkeley"),
    ("2004_IMG_2217.png", "2019-01-24-huf"),
    ("2005_IMG_2219.png", "2019-02-03-beauty-and-beasty"),
    ("2005_IMG_2220.png", "2019-03-15-minna-gallery"),
]


def _mod():
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "landing", os.path.join(ROOT, "tools", "make-landing-photo.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def photo_top(im, after, before):
    """Top of the photograph: the hard horizontal edge under the account row.

    Instagram puts the picture flush against the header, so the boundary is a
    single row where every column changes at once. Searching for the STRONGEST
    such row inside a narrow window under the header finds it whatever the
    picture happens to look like.

    Four earlier tests all failed on some post, and each failure is worth
    keeping: the first busy row put the header into every crop (their avatar is
    a black dog on a yellow disc, busier than most photographs); the longest busy
    run beheaded a dim restaurant shot where shadow split the run; walking back
    on spread emptied a black graphic and a flat blue tint entirely; and walking
    back on a pale left edge cut a cream-walled museum shot and a photo with a
    bright edge in half. A boundary is a property of the JOIN, not of either side
    of it, which is why looking for the join works where reading the picture did
    not.
    """
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    lo = min(after + 100, before - 1)
    hi = min(after + 340, before)
    if hi - lo < 2:
        return after
    step = np.abs(g[lo + 1:hi] - g[lo:hi - 1]).mean(axis=1)
    return lo + 1 + int(np.argmax(step))


def build(name, slug, m):
    src = os.path.join(POSTS, name)
    im = cv2.imread(src, cv2.IMREAD_COLOR)
    if im is None:
        print(f"  MISSING {name}")
        return
    band = m.insights_band(im)
    if band is None:
        print(f"  {slug}: no Boost-post row — skipped")
        return
    # Both ends use the SAME row. Passing the unpadded band start let the walk
    # begin inside the 26px of chrome above it, which read as an instant run of
    # blank and returned a top below the bottom — an empty crop.
    bottom = band[0] - 26
    top = photo_top(im, m.account_row_top(im, m.status_bar_height(im)) or 0, bottom)
    photo = im[top:bottom]
    h, w = photo.shape[:2]
    if max(h, w) > MAX:
        s = MAX / max(h, w)
        photo = cv2.resize(photo, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
    dst = os.path.join(OUT, f"{slug}.webp")
    cv2.imwrite(dst, photo, [cv2.IMWRITE_WEBP_QUALITY, 84])
    print(f"  {slug:34s} {w}x{h} -> {photo.shape[1]}x{photo.shape[0]}  "
          f"{os.path.getsize(dst) // 1024}KB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    m = _mod()
    for name, slug in POSTS_MANIFEST:
        build(name, slug, m)


if __name__ == "__main__":
    main()
