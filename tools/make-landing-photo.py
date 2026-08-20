"""Build a landing photograph from one of Biggie's posts.

    /opt/homebrew/bin/python3 tools/make-landing-photo.py CbeQ8X4uCkn 4
    /opt/homebrew/bin/python3 tools/make-landing-photo.py --all

THE OPERATOR SWAPS THESE EVERY WEEK OR TWO, which is why this is a tool and not
something done by hand once. Give it a gallery shortcode and a slot number and
it produces `public/landing/biggie-N.webp` at the size the phone actually asks
for.

WHAT LIMITS THIS, and it is worth knowing before anyone tries to improve it.
The landing photo is full-bleed and the screen wants a 0.46-aspect slice. Every
one of these posts is about 1200 tall and square-ish, so the tallest slice of
that shape is 554 pixels wide — from ALL of them, regardless of their stated
width. A 3x phone paints 1179. So every landing photo is a 2.13x enlargement and
NOTHING DOWNSTREAM CAN CHANGE THAT: the first attempt at fixing this shipped
1290px files and they were measurably softer on screen than the 900px ones they
replaced, because both carry the same 554 pixels of real information and the
bigger file simply spends more bytes saying so.

The one real fix is more pixels in the SOURCE — original camera files from the
operator, rather than what Instagram serves back. Worth asking for.

So what this does is make the most of 554: EDSR x4, a clean area downsample to
the device's exact pixel grid, and a light unsharp mask to put back the acutance
any enlargement costs. Landing on 1179x2556 exactly means an iPhone 15 at 3x
paints it 1:1 with no resampling at all, which is the crispest presentation the
available information allows.

EDSR is doing less work here than it looks. On sources this soft it measures
level with bicubic; it is kept because it costs nothing at build time and does
no harm, not because it is rescuing anything. The gallery thumbnails are a
different case again and are deliberately left alone — see
public/gallery/CREDITS.md.

Tiled at 256px with 16px of overlap because EDSR on a 554x1200 plate at once
needs more memory than it is worth, and the seams show without the overlap.
"""

import argparse
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = os.path.join(ROOT, "tools", "sr-models", "EDSR_x4.pb")
GALLERY = os.path.join(ROOT, "public", "gallery")
OUT = os.path.join(ROOT, "public", "landing")

# 393pt x 3 is an iPhone 15's real pixel grid. Matching it exactly means the
# common case paints 1:1; a Pro Max stretches this by 9%, which is nothing next
# to the 2.13x already baked in, and is not worth 40% more bytes on every phone.
W, H = 1179, 2556

# From the top, not the middle. These are portraits of a dog and the centre of a
# square post is his chest; a third down puts his head in the upper half of the
# screen, which is where the wordmark is not.
ANCHOR = 0.32

# Which post each slot came from, so `--all` can rebuild the set as it stands.
SLOTS = {1: "CbeRyb1OCcZ", 2: "BvAKMQqh79w", 3: "BvCLGJIn_pg", 4: "CbeQ8X4uCkn"}

TILE, OVERLAP, SCALE = 256, 16, 4


def upscale(img, sr):
    h, w = img.shape[:2]
    out = np.zeros((h * SCALE, w * SCALE, 3), np.uint8)
    for y in range(0, h, TILE):
        for x in range(0, w, TILE):
            y0, x0 = max(0, y - OVERLAP), max(0, x - OVERLAP)
            y1, x1 = min(h, y + TILE + OVERLAP), min(w, x + TILE + OVERLAP)
            big = sr.upsample(img[y0:y1, x0:x1])
            # Trim the overlap back off in destination coordinates.
            ty, tx = (y - y0) * SCALE, (x - x0) * SCALE
            th = min(TILE, h - y) * SCALE
            tw = min(TILE, w - x) * SCALE
            out[y * SCALE:y * SCALE + th, x * SCALE:x * SCALE + tw] = big[ty:ty + th, tx:tx + tw]
    return out


def build(code, slot, sr):
    src = os.path.join(GALLERY, f"{code}.webp")
    if not os.path.exists(src):
        sys.exit(f"no such post: {src}")
    im = cv2.imread(src, cv2.IMREAD_COLOR)
    sh, sw = im.shape[:2]

    # The tallest crop of the right shape this source can give, anchored high.
    cw = min(sw, int(round(sh * W / H)))
    ch = int(round(cw * H / W))
    if ch > sh:
        ch, cw = sh, int(round(sh * W / H))
    x = (sw - cw) // 2
    y = int(round((sh - ch) * ANCHOR))
    crop = im[y:y + ch, x:x + cw]

    big = upscale(crop, sr)
    final = cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA)

    # Gentle, and gentle on purpose. Any enlargement costs acutance and a light
    # unsharp mask puts it back; a heavy one draws bright rims round the dog
    # against the sky, which is worse than the softness it set out to cure.
    blur = cv2.GaussianBlur(final, (0, 0), 1.2)
    final = cv2.addWeighted(final, 1.55, blur, -0.55, 0)

    dst = os.path.join(OUT, f"biggie-{slot}.webp")
    before = os.path.getsize(dst) if os.path.exists(dst) else 0
    cv2.imwrite(dst, final, [cv2.IMWRITE_WEBP_QUALITY, 82])

    sharp = lambda a: cv2.Laplacian(cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.CV_32F).var()
    direct = cv2.resize(crop, (W, H), interpolation=cv2.INTER_CUBIC)
    print(f"  biggie-{slot}  <- {code}  crop {cw}x{ch} -> {W}x{H}  "
          f"{before // 1024}KB -> {os.path.getsize(dst) // 1024}KB  "
          f"sharpness {sharp(direct):.0f} (bicubic) -> {sharp(final):.0f} (EDSR)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("code", nargs="?", help="gallery shortcode, e.g. CbeQ8X4uCkn")
    ap.add_argument("slot", nargs="?", type=int, help="landing slot, 1-4")
    ap.add_argument("--all", action="store_true", help="rebuild every slot from SLOTS")
    a = ap.parse_args()

    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(MODEL)
    sr.setModel("edsr", SCALE)
    os.makedirs(OUT, exist_ok=True)

    if a.all:
        for slot, code in sorted(SLOTS.items()):
            build(code, slot, sr)
    elif a.code and a.slot:
        build(a.code, a.slot, sr)
    else:
        ap.error("give a shortcode and a slot, or --all")


if __name__ == "__main__":
    main()
