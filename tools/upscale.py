"""Super-resolve one of the operator's linked images up to wallpaper size.

He sends a link per city and the rule is to use it. The catch is that every
link he sends is a small landscape thumbnail — 454x604 for Orinda, 1200x630 for
Lafayette — and a portrait crop out of one of those is a few hundred pixels
across, against the 1320x2868 a phone wants. Plain resampling that far turns
edges to porridge.

So this runs a real super-resolution network over it first: EDSR x4, via
OpenCV's dnn_superres. Not a sharpen and not a Lanczos resize — a model trained
to invent plausible detail, which is the only thing that survives 4x.

    python3 tools/upscale.py <in> <out> [--times 4]

EDSR is the slow one of the three OpenCV ships and the best; a 454x604 frame
takes a minute or so on this machine. That is fine for something run once per
city. ESPCN and LapSRN are here as fallbacks because EDSR needs the whole image
in memory at once and a large input will exhaust it — see the tiling note below.
"""

import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, "sr-models")

# name -> (file, model key, scale). Ordered best-first.
LADDER = [
    ("EDSR_x4.pb", "edsr", 4),
    ("LapSRN_x4.pb", "lapsrn", 4),
    ("ESPCN_x4.pb", "espcn", 4),
]

"""
Tiled, because EDSR allocates on the whole frame.

A 1200x630 input at x4 is 12 million output pixels and the intermediate feature
maps are far larger than that; run whole, it either swaps for minutes or dies.
Tiles of 256 with a 16px overlap keep each pass small, and the overlap is what
stops the seams — a tile boundary in a gradient sky is visible for exactly the
same reason a JPEG block is.
"""
TILE = 256
OVERLAP = 16


def upscale_once(img, sr, scale):
    h, w = img.shape[:2]
    if h <= TILE and w <= TILE:
        return sr.upsample(img)

    out = np.zeros((h * scale, w * scale, 3), dtype=img.dtype)
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            y0, x0 = max(0, y - OVERLAP), max(0, x - OVERLAP)
            y1, x1 = min(h, y + TILE + OVERLAP), min(w, x + TILE + OVERLAP)
            tile = sr.upsample(img[y0:y1, x0:x1])
            # Trim the overlap back off in output space, so each tile writes
            # only the region it owns and neighbours never disagree on a pixel.
            ty, tx = (y - y0) * scale, (x - x0) * scale
            ph, pw = min(TILE, h - y) * scale, min(TILE, w - x) * scale
            out[y * scale : y * scale + ph, x * scale : x * scale + pw] = tile[
                ty : ty + ph, tx : tx + pw
            ]
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    times = 4
    if "--times" in sys.argv:
        times = int(sys.argv[sys.argv.index("--times") + 1])

    img = cv2.imread(src, cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f"could not read {src}")
    print(f"in  {img.shape[1]}x{img.shape[0]}")

    for fname, key, scale in LADDER:
        path = os.path.join(MODELS, fname)
        if not os.path.exists(path):
            continue
        try:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            sr.readModel(path)
            sr.setModel(key, scale)
            big = upscale_once(img, sr, scale)
            print(f"{key} x{scale} -> {big.shape[1]}x{big.shape[0]}")
            img = big
            break
        except Exception as e:  # noqa: BLE001 — fall down the ladder on any failure
            print(f"{key} failed ({e}); trying next")
    else:
        raise SystemExit("no super-resolution model available")

    """
    Anything still needed after the network is done with a plain resample, and
    that is deliberate: the model has already invented the detail, so a second
    model pass on its own output amplifies its guesses rather than adding
    information. Lanczos from here is honest.
    """
    if times != 4:
        want = (int(img.shape[1] * times / 4), int(img.shape[0] * times / 4))
        img = cv2.resize(img, want, interpolation=cv2.INTER_LANCZOS4)
        print(f"resampled -> {img.shape[1]}x{img.shape[0]}")

    cv2.imwrite(dst, img, [cv2.IMWRITE_PNG_COMPRESSION, 3])
    print(f"out {dst}")


if __name__ == "__main__":
    main()
