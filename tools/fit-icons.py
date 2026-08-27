"""Make every brand tile read as an app icon on a phone.

Two jobs, and nothing is redrawn in either — every pixel stays the business's
own, resampled once.

BLEED  A mark that is a disc marooned on paper gets its OWN ground carried out
       to the tile's edges. The circle stops being a sticker on white and
       becomes the tile, which is the operator's rule.

FIT    A mark adrift in a big empty field gets scaled so it occupies a
       consistent share of the tile. Nothing is stretched: one scale factor,
       both axes, centred on the ink's optical box.
"""
import argparse, os, sys
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS = os.path.join(ROOT, "public", "icons")
S = 512


def ink_mask(im, ground):
    d = np.linalg.norm(im.astype(np.float32) - ground, axis=2)
    # NO OPENING. A 3x3 open erases thin script, and then the "fit" crops the
    # lighter half of a wordmark clean off the tile — Cafe Noir lost the word
    # "Cafe" to exactly this. Close only, and keep every component that is not
    # obviously speckle.
    m = (d > 26).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return m
    big = st[1:, cv2.CC_STAT_AREA].max()
    keep = [k for k in range(1, n) if st[k, cv2.CC_STAT_AREA] > max(24, big * 0.0015)]
    return np.isin(lab, keep).astype(np.uint8)


BRAND_BG = {}


def _load_brand_bg():
    import json
    try:
        rows = json.load(open(os.path.join(ROOT, ".verify", "brands.json")))
    except Exception:
        return
    for r in rows:
        if not r.get("url"):
            continue
        slug = os.path.basename(r["url"]).rsplit(".", 1)[0]
        hexes = (r.get("bg") or "").split("|")
        if hexes and hexes[0].startswith("#") and len(hexes[0]) == 7:
            h = hexes[0][1:]
            BRAND_BG[slug] = np.array(
                [int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.uint8)  # BGR


def _mark_mask(im, paper):
    h, w = im.shape[:2]
    d = np.linalg.norm(im.astype(np.float32) - paper, axis=2)
    m = (d > 26).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((13, 13), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n < 2:
        return None
    i = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    return (lab == i)


def bleed(im, slug):
    """Give the mark a tile of the brand's own colour instead of white paper.

    THE GROUND IS NOT SAMPLED FROM PIXELS and the repaint is NOT a flood fill.
    Sampling near the mark's edge lands on its antialiasing halo — a black ring
    against white averages to grey — and a flood fill leaks through that same
    halo and eats the artwork. Both were tried and both wrecked tiles.

    Instead: the colour comes from the brand's authored value in the data, and
    the repaint is GEOMETRIC — everything outside a circle that fully encloses
    the mark's bounding box. That circle contains the whole mark by
    construction, so no pixel of theirs can be touched, whatever the mask got
    wrong.
    """
    h, w = im.shape[:2]
    brand = BRAND_BG.get(slug)
    if brand is None:
        return im, None, "no authored colour"
    paper = np.median(np.concatenate([
        im[:10, :10].reshape(-1, 3), im[:10, -10:].reshape(-1, 3),
        im[-10:, :10].reshape(-1, 3), im[-10:, -10:].reshape(-1, 3)]), axis=0)
    mask = _mark_mask(im, paper)
    if mask is None:
        return im, None, "no mark found"
    # A tile saved as a white card with the page grey at its corners: the
    # biggest non-paper shape is the card. Treat the card as paper, look again.
    if mask.mean() > 0.85:
        inner = im[mask].reshape(-1, 3)
        q = (inner // 24).astype(np.int32)
        k = q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2]
        v, c = np.unique(k, return_counts=True)
        card = np.median(inner[k == v[int(np.argmax(c))]], axis=0)
        m2 = _mark_mask(im, card)
        if m2 is not None and 0.05 < m2.mean() < 0.88:
            mask = m2
    ys, xs = np.where(mask)
    cx, cy = (xs.min() + xs.max()) / 2.0, (ys.min() + ys.max()) / 2.0
    R = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2.0 + 3

    # NOTHING OF THEIRS MAY FALL OUTSIDE THE CIRCLE. The mask that sized R uses
    # a confident threshold and can miss faint ink — a thin ring of wordmark
    # around a badge. Re-measure with a permissive threshold and grow R to
    # cover the farthest pixel that is not paper. Polly Ann lost the words
    # "PollyAnn Ice Cream" and Jump & Roll lost its whole outer ring to exactly
    # this before the guard existed.
    faint = np.linalg.norm(im.astype(np.float32) - paper, axis=2) > 10
    fy, fx = np.where(faint)
    if len(fx):
        reach = np.sqrt((fx - cx) ** 2 + (fy - cy) ** 2).max()
        R = max(R, float(reach) + 2)
    if R >= 0.72 * h:
        return im, None, "mark already reaches the edge"
    # A brand whose authored colour is itself near-white gives a bleed that
    # changes nothing — the circle stays marooned on paper. Fall back to the
    # strongest colour the mark actually uses.
    note = f"r={R:.0f}"
    if float(np.mean(brand)) > 232 and float(brand.max()) - float(brand.min()) < 18:
        hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
        strong = (hsv[:, :, 1] > 70) & (hsv[:, :, 2] > 40) & mask
        if strong.sum() < 400:
            strong = (cv2.cvtColor(im, cv2.COLOR_BGR2GRAY) < 120) & mask
        if strong.sum() > 200:
            px = im[strong].reshape(-1, 3)
            q = (px // 24).astype(np.int32)
            k = q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2]
            v, c = np.unique(k, return_counts=True)
            brand = np.median(px[k == v[int(np.argmax(c))]], axis=0).astype(np.uint8)
            note += " (from the mark; authored colour was white)"
        else:
            return im, None, "authored colour is white and the mark has none"
    yy, xx = np.mgrid[0:h, 0:w]
    outside = ((xx - cx) ** 2 + (yy - cy) ** 2) > R * R
    out = im.copy()
    out[outside] = brand
    return out, brand, note


def fit(im, target=0.84):
    """Scale the mark so its longest side is `target` of the tile."""
    h, w = im.shape[:2]
    ground = np.median(np.concatenate([
        im[:14, :14].reshape(-1, 3), im[:14, -14:].reshape(-1, 3),
        im[-14:, :14].reshape(-1, 3), im[-14:, -14:].reshape(-1, 3)]), axis=0)
    m = ink_mask(im, ground)
    ys, xs = np.where(m > 0)
    if len(xs) < 50:
        return im, 0.0
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    mw, mh = x1 - x0 + 1, y1 - y0 + 1
    cur = max(mw, mh) / float(h)
    if abs(cur - target) < 0.05:
        return im, cur
    crop = im[y0:y1 + 1, x0:x1 + 1]
    sc = (S * target) / max(mw, mh)
    nw, nh = max(1, int(round(mw * sc))), max(1, int(round(mh * sc)))
    interp = cv2.INTER_AREA if sc < 1 else cv2.INTER_CUBIC
    crop = cv2.resize(crop, (nw, nh), interpolation=interp)
    out = np.full((S, S, 3), ground, np.uint8)
    oy, ox = (S - nh) // 2, (S - nw) // 2
    # a mark can be wider than the target box only if it was already near-square
    ys0, xs0 = max(0, oy), max(0, ox)
    ye, xe = min(S, oy + nh), min(S, ox + nw)
    out[ys0:ye, xs0:xe] = crop[ys0 - oy:ye - oy, xs0 - ox:xe - ox]
    return out, cur


def main():
    _load_brand_bg()
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["bleed", "fit"])
    ap.add_argument("slugs", nargs="+")
    ap.add_argument("--target", type=float, default=0.84)
    a = ap.parse_args()
    for slug in a.slugs:
        p = os.path.join(ICONS, f"{slug}.webp")
        if not os.path.exists(p):
            print(f"  {slug:30s} MISSING"); continue
        im = cv2.imread(p, cv2.IMREAD_COLOR)
        im = cv2.resize(im, (S, S), interpolation=cv2.INTER_AREA)
        if a.mode == "bleed":
            im, g, why = bleed(im, slug)
            note = f"skipped: {why}" if g is None else f"brand BGR {[int(v) for v in g]} {why}"
        else:
            im, cur = fit(im, a.target)
            note = f"was {cur:.2f} -> {a.target:.2f}"
        cv2.imwrite(p, im, [cv2.IMWRITE_WEBP_QUALITY, 95])
        print(f"  {slug:30s} {a.mode:6s} {note}")


main()
