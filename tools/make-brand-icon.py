"""Cut a business's own mark out of a screenshot of their Instagram profile.

    /opt/homebrew/bin/python3 tools/make-brand-icon.py ~/shot.png slug
    /opt/homebrew/bin/python3 tools/make-brand-icon.py ~/shot.png slug --square

The operator sends these constantly — a tapped-open profile picture, sometimes
with Instagram's story ring round it, sometimes a plain image. This is the same
job done by hand four times before it became a script.

INSTAGRAM'S STORY RING IS NOT THEIR LOGO. That yellow-to-magenta gradient is
Meta's UI and it has no business on a tile next to forty other brands' marks.
Where a ring is found, the crop goes INSIDE it and the corners are filled with
the disc's own paper so a rounded tile reads as one mark rather than a disc
floating on page grey. The ring test covers the whole gradient — an early
version only matched its pink half, measured a disc smaller than it really was,
and clipped the wordmark off a circular logo.

--square skips the ring hunt and crops tight to the ink instead, for marks that
are not in a circle at all — a logo lifted off a website, say.

THE "SHARE PROFILE" SHEET IS A THIRD SHAPE. Tapping the picture on a profile
opens a big disc on a blurred copy of their grid, with no ring at all. The ring
hunt has nothing to find, and "find the ink" finds the whole blurred frame —
which is what shipped as Shaka Shack's tile for a minute on 2026-09-01, and
Mrs. Ramen's red bowl was mistaken for a ring and clipped. --disc looks for the
disc itself (one big circle in the frame), crops inside it and fills the
corners with the disc's own edge colour. It is also what runs on its own when
the ink crop would keep more than four fifths of the frame.

Writes public/icons/<slug>.webp at 512x512. Never redraws anything: every pixel
is theirs, resampled once.
"""

import argparse
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "icons")


def story_ring(im):
    """(cx, cy, r) of Instagram's gradient ring, or None."""
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    ring = cv2.inRange(hsv, (0, 80, 110), (35, 255, 255)) | cv2.inRange(hsv, (140, 80, 110), (180, 255, 255))
    ring = cv2.morphologyEx(ring, cv2.MORPH_CLOSE, np.ones((31, 31), np.uint8))
    cnts, _ = cv2.findContours(ring, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return None
    c = max(cnts, key=cv2.contourArea)
    (x, y), r = cv2.minEnclosingCircle(c)
    h, w = im.shape[:2]
    # A ring is big, round, and not hard against an edge.
    if r < w * 0.18 or r > w * 0.60:
        return None
    if cv2.contourArea(c) < np.pi * r * r * 0.35:
        return None
    # A ring is hollow: the picture sits inside it. A red bowl on a white disc
    # (Mrs. Ramen, 2026-09-01) matched the hue test and was cropped as a ring,
    # so anything ring-coloured through its own middle is a mark, not a ring.
    inner = np.zeros(ring.shape, np.uint8)
    cv2.circle(inner, (int(x), int(y)), int(r * 0.5), 255, -1)
    if ring[inner == 255].mean() > 255 * 0.2:
        return None
    return int(x), int(y), int(r)


def from_ring(im, cx, cy, r):
    r = int(r * 0.915)                       # inside the ring, outside nothing of theirs
    y0, x0 = max(0, cy - r), max(0, cx - r)
    crop = im[y0:y0 + 2 * r, x0:x0 + 2 * r].copy()
    s = min(crop.shape[:2])
    crop = crop[:s, :s]
    rr = s // 2
    yy, xx = np.mgrid[0:s, 0:s]
    inner = ((xx - rr) ** 2 + (yy - rr) ** 2) < (rr * 0.7) ** 2
    lit = crop[inner & (crop.mean(axis=2) > 170)]
    paper = np.median(lit, axis=0) if len(lit) else np.median(crop.reshape(-1, 3), axis=0)
    mask = np.zeros((s, s), np.uint8)
    cv2.circle(mask, (rr, rr), rr - 2, 255, -1)
    crop[mask == 0] = paper
    return crop


def profile_disc(im):
    """(cx, cy, r) of the big disc on a share-profile sheet, or None."""
    h, w = im.shape[:2]
    scale = 480 / w
    small = cv2.resize(im, (480, int(h * scale)), interpolation=cv2.INTER_AREA)
    g = cv2.GaussianBlur(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY), (7, 7), 0)
    found = cv2.HoughCircles(g, cv2.HOUGH_GRADIENT, dp=1.2, minDist=200, param1=120, param2=40,
                             minRadius=int(480 * 0.22), maxRadius=int(480 * 0.46))
    if found is None:
        return None
    x, y, r = found[0][0]
    # The disc sits centred on the sheet; anything hard against a side is not it.
    if abs(x - 240) > 40:
        return None
    return int(x / scale), int(y / scale), int(r / scale)


def from_disc(im, cx, cy, r):
    r = int(r * 0.985)
    y0, x0 = max(0, cy - r), max(0, cx - r)
    crop = im[y0:y0 + 2 * r, x0:x0 + 2 * r].copy()
    s = min(crop.shape[:2])
    crop = crop[:s, :s]
    rr = s // 2
    yy, xx = np.mgrid[0:s, 0:s]
    d2 = (xx - rr) ** 2 + (yy - rr) ** 2
    band = crop[(d2 > (rr * 0.86) ** 2) & (d2 < (rr * 0.96) ** 2)]
    paper = np.median(band, axis=0)
    mask = np.zeros((s, s), np.uint8)
    cv2.circle(mask, (rr, rr), rr - 2, 255, -1)
    crop[mask == 0] = paper
    return crop


def from_ink(im, pad=0.10):
    """Tight to the darkest / most saturated content, padded out to a square."""
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    sat = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)[:, :, 1]
    ink = ((g < 225) | (sat > 60)).astype(np.uint8) * 255
    ink = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    cnts, _ = cv2.findContours(ink, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = [c for c in cnts if cv2.contourArea(c) > im.shape[0] * im.shape[1] * 0.004]
    if not cnts:
        return im
    xs = [cv2.boundingRect(c) for c in cnts]
    x0 = min(x for x, _, _, _ in xs); y0 = min(y for _, y, _, _ in xs)
    x1 = max(x + w for x, _, w, _ in xs); y1 = max(y + h for _, y, _, h in xs)
    mw, mh = x1 - x0, y1 - y0
    side = int(max(mw, mh) * (1 + pad * 2))
    paper = np.median(im[:6, :6].reshape(-1, 3), axis=0)
    canvas = np.full((side, side, 3), paper, np.uint8)
    oy, ox = (side - mh) // 2, (side - mw) // 2
    canvas[oy:oy + mh, ox:ox + mw] = im[y0:y1, x0:x1]
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("slug")
    ap.add_argument("--square", action="store_true", help="skip the ring hunt; crop to the ink")
    ap.add_argument("--disc", action="store_true", help="a share-profile sheet: crop the big disc")
    ap.add_argument("--asis", action="store_true",
                    help="the --crop region IS the icon; pad it square and stop")
    ap.add_argument("--crop", help="pre-crop as x0,y0,x1,y1 fractions of the frame")
    a = ap.parse_args()

    im = cv2.imread(os.path.expanduser(a.src), cv2.IMREAD_COLOR)
    if im is None:
        raise SystemExit(f"cannot read {a.src}")
    if a.crop:
        x0, y0, x1, y1 = [float(v) for v in a.crop.split(",")]
        h, w = im.shape[:2]
        im = im[int(h * y0):int(h * y1), int(w * x0):int(w * x1)]

    how = "ink"
    if a.asis:
        # Some marks sit on a blurred photograph or a coloured panel, where
        # "find the ink" finds the whole frame. When the crop is already right,
        # squaring it is the entire job.
        h, w = im.shape[:2]
        side = max(h, w)
        paper = np.median(im[:6, :6].reshape(-1, 3), axis=0)
        canvas = np.full((side, side, 3), paper, np.uint8)
        oy, ox = (side - h) // 2, (side - w) // 2
        canvas[oy:oy + h, ox:ox + w] = im
        im = canvas
        how = "as-is"
    elif a.disc:
        disc = profile_disc(im)
        if not disc:
            raise SystemExit("no disc found — is this the share-profile sheet?")
        im = from_disc(im, *disc)
        how = f"disc r={disc[2]}"
    elif not a.square:
        ring = story_ring(im)
        if ring:
            im = from_ring(im, *ring)
            how = f"ring r={ring[2]}"
        else:
            cut = from_ink(im)
            disc = profile_disc(im) if cut.shape[0] * cut.shape[1] > im.shape[0] * im.shape[1] * 0.8 else None
            if disc:
                im = from_disc(im, *disc)
                how = f"disc r={disc[2]}"
            else:
                im = cut
    elif not a.asis:
        im = from_ink(im)

    os.makedirs(OUT, exist_ok=True)
    dst = os.path.join(OUT, f"{a.slug}.webp")
    cv2.imwrite(dst, cv2.resize(im, (512, 512), interpolation=cv2.INTER_AREA),
                [cv2.IMWRITE_WEBP_QUALITY, 92])
    print(f"  {a.slug:28s} via {how:14s} -> {os.path.getsize(dst) // 1024}KB")


if __name__ == "__main__":
    main()
