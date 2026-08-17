"""Turn an accepted mark into the 512px tile the home screen draws.

Three jobs, and each one has a wrong obvious answer.

BACKGROUND. Half these logos are dark ink on transparency and half are white
ink on transparency, and a white mark flattened onto white is an empty tile. So
the plate is chosen from the ink's own brightness, and the brand colour already
in the seed is used when it actually contrasts — measured, not assumed, because
a mid-grey brand colour under white ink fails exactly as badly as white on
white. Anything already opaque keeps the background its designer gave it.

SIZE. The mark is fitted to ~82% of the tile by its LONGEST side, so a 6:1
wordmark stays 6:1. Stretching a logo square is the one thing that makes a real
mark look fake.

RESOLUTION. Existing art is 256px and the tile is 512, so most of this needs
genuine upscaling rather than a resample — EDSR, the same network the wallpapers
use. It runs on the finished opaque tile rather than on the logo's alpha,
because a super-resolution model trained on photographs does strange things to
a hard alpha edge and nothing at all useful.
"""

import json
import os
import re
import subprocess
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logo_pick import ink_box, load  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILE = 512
FILL = 0.82
MODELS = os.path.join(ROOT, "tools/sr-models")


def brand_colours():
    """slug -> the colour the seed already assigns this business."""
    out = {}
    for rel in ("src/data/localBrands.ts", "src/data/brands.ts", "src/data/roster.ts"):
        src = open(os.path.join(ROOT, rel)).read()
        marks = sorted(
            [(m.start(), m.group(1)) for m in re.finditer(r"slug: '([a-z0-9-]+)'", src)]
            + [(m.start(), m.group(1)) for m in re.finditer(r"seed\('([a-z0-9-]+)'", src)]
        )
        for i, (at, slug) in enumerate(marks):
            end = marks[i + 1][0] if i + 1 < len(marks) else len(src)
            m = re.search(r"#([0-9a-fA-F]{6})", src[at:end])
            if m and slug not in out:
                out[slug] = tuple(int(m.group(1)[j : j + 2], 16) for j in (0, 2, 4))
    return out


def rel_lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2])


def contrast(a, b):
    la, lb = rel_lum(a), rel_lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def ink_colour(im):
    """Average colour of the pixels that are actually the mark."""
    a = np.asarray(im).astype(np.float32)
    solid = a[..., 3] > 128
    if not solid.any():
        return (128, 128, 128)
    return tuple(a[..., i][solid].mean() for i in range(3))


def ink_extremes(im):
    """The darkest and lightest tones the mark actually contains.

    Averaging the ink was the first attempt and it ranks these backwards. The
    Sandwich Monkey badge averages to a mid-gold that scores 2.8 against white,
    yet it reads perfectly because it is drawn with black outlines. Poof of
    Alchemy averages to a browner tone that scores BETTER, 3.9, and is barely
    visible — because that average is the whole story there, with no dark tone
    anywhere in the mark.

    What decides legibility is whether the logo contains ANY tone that separates
    from the plate. So this returns both ends, at the 5th and 95th percentile to
    stay clear of stray antialiasing, and the caller keeps whichever end wins.
    """
    a = np.asarray(im).astype(np.float32)
    solid = a[..., 3] > 128
    if not solid.any():
        return (128, 128, 128), (128, 128, 128)
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    vals = lum[solid]
    lo_at, hi_at = np.percentile(vals, 5), np.percentile(vals, 95)
    out = []
    for target in (lo_at, hi_at):
        near = solid & (np.abs(lum - target) < 12)
        if not near.any():
            near = solid
        out.append(tuple(a[..., i][near].mean() for i in range(3)))
    return out[0], out[1]


def legibility(im, plate):
    """How well the most contrasting part of this mark stands off that plate."""
    dark, light = ink_extremes(im)
    return max(contrast(dark, plate), contrast(light, plate))


def upscale(img, want):
    """EDSR x4 then resample down — real detail first, honest resize after."""
    import cv2

    arr = cv2.cvtColor(np.asarray(img.convert("RGB")), cv2.COLOR_RGB2BGR)
    for fname, key, scale in (("EDSR_x4.pb", "edsr", 4), ("LapSRN_x4.pb", "lapsrn", 4),
                              ("ESPCN_x4.pb", "espcn", 4)):
        path = os.path.join(MODELS, fname)
        if not os.path.exists(path):
            continue
        try:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            sr.readModel(path)
            sr.setModel(key, scale)
            h, w = arr.shape[:2]
            if h <= 256 and w <= 256:
                big = sr.upsample(arr)
            else:  # tiled, or EDSR allocates on the whole frame and dies
                big = np.zeros((h * scale, w * scale, 3), arr.dtype)
                for y in range(0, h, 256):
                    for x in range(0, w, 256):
                        y0, x0 = max(0, y - 16), max(0, x - 16)
                        y1, x1 = min(h, y + 272), min(w, x + 272)
                        t = sr.upsample(arr[y0:y1, x0:x1])
                        ty, tx = (y - y0) * scale, (x - x0) * scale
                        ph, pw = min(256, h - y) * scale, min(256, w - x) * scale
                        big[y * scale : y * scale + ph, x * scale : x * scale + pw] = t[
                            ty : ty + ph, tx : tx + pw
                        ]
            arr = big
            break
        except Exception:  # noqa: BLE001 — fall down the ladder
            continue
    out = Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))
    return out.resize((want, want), Image.LANCZOS)


def build(path, ctype, brand=None):
    im = load(path, ctype)
    if im is None:
        return None, "undecodable"
    box = ink_box(im)
    if box is None:
        return None, "blank"
    im = im.crop(box)

    """
    Transparent or not decides everything downstream. A logo with real
    transparency needs a plate chosen for it; an opaque JPEG already has a
    background its designer picked, and replacing that is a redesign.
    """
    alpha = np.asarray(im)[..., 3]
    transparent = (alpha < 200).mean() > 0.06

    if transparent:
        """
        Take the FIRST plate that reads clearly, in order of preference — not
        the one that scores highest.

        Maximising contrast was the previous rule and it looked wrong: it put
        Mimi's pink script and the Model Bakery's wheat sheaf on black, because
        black scored higher than white for both. Those logos were drawn for
        white paper. Contrast is a bar to clear, and once a plate clears it,
        more contrast buys nothing and costs the designer's intent.

        White first because it is what most marks were drawn against; the
        business's own colour next, since a branded tile beats a plain one; black
        last, kept for the white-ink wordmarks that genuinely need it.
        """
        white, black = (255, 255, 255), (26, 26, 30)
        CLEAR = 4.5
        order = [("white", white), ("brand", brand), ("black", black)]
        scored = [(name, p, legibility(im, p)) for name, p in order if p]
        name, plate, best = next(
            (s for s in scored if s[2] >= CLEAR),
            max(scored, key=lambda s: s[2]),  # nothing clears it — take the best there is
        )
        note_plate = f"plate {name} {best:.1f}:1"
        tile = Image.new("RGB", (TILE, TILE), plate)
    else:
        """Square it with the colour already at its edges, so an opaque logo
        gains room without gaining a visible border."""
        a = np.asarray(im.convert("RGB"))
        edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
        tile = Image.new("RGB", (TILE, TILE), tuple(int(v) for v in np.median(edge, axis=0)))
        note_plate = "own bg"

    inner = round(TILE * FILL)
    w, h = im.size
    scale = inner / max(w, h)
    tw, th = max(1, round(w * scale)), max(1, round(h * scale))

    """
    Upscale only when the source really is smaller than what it must fill.
    Running a super-resolution net over art that is already large invents
    detail on top of detail and looks worse than a clean downsample.
    """
    if max(w, h) < inner * 0.95:
        flat = Image.new("RGB", (max(w, h), max(w, h)), tile.getpixel((0, 0)))
        flat.paste(im.convert("RGB"), ((max(w, h) - w) // 2, (max(w, h) - h) // 2),
                   im.split()[3])
        big = upscale(flat, TILE)
        s = inner / max(w, h)
        crop = big.crop((
            round((max(w, h) - w) / 2 * TILE / max(w, h)),
            round((max(w, h) - h) / 2 * TILE / max(w, h)),
            round(((max(w, h) - w) / 2 + w) * TILE / max(w, h)),
            round(((max(w, h) - h) / 2 + h) * TILE / max(w, h)),
        )).resize((tw, th), Image.LANCZOS)
        tile.paste(crop, ((TILE - tw) // 2, (TILE - th) // 2))
        note = f"upscaled {max(w,h)}->{inner}, {note_plate}"
        _ = s
    else:
        small = im.resize((tw, th), Image.LANCZOS)
        tile.paste(small.convert("RGB"), ((TILE - tw) // 2, (TILE - th) // 2),
                   small.split()[3])
        note = f"resampled {max(w,h)}->{inner}, {note_plate}"
    return tile, note


def main():
    picked = {s["slug"]: s for s in json.load(open(sys.argv[1]))}
    plan = json.load(open(sys.argv[2]))  # {slug: alt-index}
    colours = brand_colours()
    outdir = os.path.join(ROOT, "public/icons")
    done = []
    for slug, idx in plan.items():
        s = picked[slug]
        chain = ([s["picked"]] if s.get("picked") else []) + s.get("alts", [])
        if idx >= len(chain):
            print(f"  --  {slug:26} no alt {idx}")
            continue
        c = chain[idx]
        tile, note = build(c["file"], c.get("ctype", ""), colours.get(slug))
        if tile is None:
            print(f"  --  {slug:26} {note}")
            continue
        out = os.path.join(outdir, f"{slug}.webp")
        tile.save(out, "WEBP", quality=93, method=6)
        done.append(slug)
        print(f"  ok  {slug:26} {note:44} {os.path.getsize(out)//1024}KB")
    json.dump(done, open(sys.argv[3], "w"), indent=1)
    print(f"\n{len(done)} tiles written to public/icons")


if __name__ == "__main__":
    main()
