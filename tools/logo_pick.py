"""Judge the downloaded candidates and choose one mark per business.

Downloading was the easy half. Every site returned something, and most of what
came back is not a logo: a hero photograph, a share card with a phone number
burnt into it, a 32px favicon, a theme's default glyph. Picking the highest
score off the probe would have shipped those.

So each file is decoded, trimmed to its actual ink, and measured. Three things
disqualify a candidate outright, and each is here because a real candidate in
this batch failed it:

  won't decode      several .ico files are HTML error pages with an image
                    content-type, and one "png" is a 404 body
  no ink            padding-only images, and a 1px lazy-load spacer that
                    downloaded perfectly and contains nothing
  too small         under 96px of actual content cannot fill a 512 tile even
                    with super-resolution; a monogram beats a blurred favicon

What survives is scored on how much like an app icon it already is. Square and
large wins, because that is the shape the grid draws.
"""

import io
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = 80_000_000
CHROME = os.path.expanduser(
    "~/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/"
    "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
)


def rasterise_svg(path, px=1024):
    """SVG through headless Chrome — the one renderer already on this machine.

    Rendered on a transparent background at a large size, so a vector wordmark
    arrives with more resolution than any raster candidate can offer.
    """
    svg = open(path, "rb").read().decode("utf-8", "replace")
    if "<svg" not in svg:
        return None
    with tempfile.TemporaryDirectory() as tmp:
        page = os.path.join(tmp, "p.html")
        shot = os.path.join(tmp, "s.png")
        open(page, "w").write(
            "<style>html,body{margin:0;background:none}"
            f"svg{{width:{px}px;height:auto;display:block}}</style>{svg}"
        )
        subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--default-background-color=00000000",
             f"--screenshot={shot}", f"--window-size={px},{px}", f"file://{page}"],
            capture_output=True, timeout=60,
        )
        if not os.path.exists(shot):
            return None
        return Image.open(shot).convert("RGBA")


def load(path, ctype):
    if "svg" in ctype or path.endswith(".svg"):
        return rasterise_svg(path)
    try:
        im = Image.open(path)
        if getattr(im, "n_frames", 1) > 1:  # .ico holds a stack; take the largest
            best, area = None, -1
            for i in range(im.n_frames):
                im.seek(i)
                if im.size[0] * im.size[1] > area:
                    area, best = im.size[0] * im.size[1], im.convert("RGBA")
            return best
        return im.convert("RGBA")
    except Exception:  # noqa: BLE001 — an undecodable candidate is simply out
        return None


def ink_box(im):
    """The bounding box of actual content, ignoring transparent OR flat padding.

    getbbox() only handles the transparent case. Half of these logos are opaque
    JPEGs on a white field, where the mark occupies a third of the frame — and
    scoring those on their full size overrates them badly against a tight PNG.
    """
    a = np.asarray(im).astype(np.int16)
    alpha = a[..., 3]
    if alpha.max() == 0:
        return None
    solid = alpha > 24
    if not solid.any():
        return None

    rgb = a[..., :3]
    """The padding colour is whatever sits in the corners — white on most, but
    black and brand-coloured frames both appear in this batch."""
    corners = np.stack([rgb[0, 0], rgb[0, -1], rgb[-1, 0], rgb[-1, -1]])
    bg = np.median(corners, axis=0)
    differs = (np.abs(rgb - bg).sum(axis=2) > 40) & solid

    mask = differs if differs.sum() > 24 else solid
    ys, xs = np.where(mask)
    if not len(ys):
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def judge(c):
    im = load(c["file"], c.get("ctype", ""))
    if im is None:
        return {**c, "verdict": "undecodable"}
    box = ink_box(im)
    if box is None:
        return {**c, "verdict": "blank"}

    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    if min(w, h) < 96:
        return {**c, "verdict": f"too small ({w}x{h} of ink)"}

    """
    A candidate is only useful in proportion to how square it is: the grid
    draws a square tile, and a 6:1 wordmark placed in one is mostly empty. It
    is still usable — centred, not stretched — so this is a penalty, not a
    disqualification.
    """
    aspect = max(w, h) / min(w, h)
    fill = min(1.0, min(w, h) / 512)
    kind = 0.0
    if "manifest" in c["why"] or "apple-touch" in c["why"]:
        kind = 0.35  # already square, already meant to be an app icon
    elif "img[logo]" in c["why"]:
        kind = 0.20  # the real mark, usually, but usually wide
    elif "og:" in c["why"] or "twitter:" in c["why"]:
        kind = -0.15  # frequently a photograph rather than a mark

    score = fill + kind - min(0.55, (aspect - 1) * 0.22)
    return {
        **c, "verdict": "ok", "px": [im.size[0], im.size[1]], "ink": [w, h],
        "aspect": round(aspect, 2), "rank": round(score, 3),
    }


def main():
    probe = json.load(open(sys.argv[1]))
    out = []
    for site in probe:
        if not site.get("cands"):
            out.append({"slug": site["slug"], "site": site["site"], "picked": None,
                        "reason": site.get("error", "no candidates")})
            continue
        judged = [judge(c) for c in site["cands"]]
        good = sorted([j for j in judged if j["verdict"] == "ok"], key=lambda j: -j["rank"])
        out.append({
            "slug": site["slug"], "site": site["site"],
            "picked": good[0] if good else None,
            "alts": good[1:],
            "rejected": [{"why": j["why"], "verdict": j["verdict"]} for j in judged if j["verdict"] != "ok"],
        })
        s = out[-1]
        if s["picked"]:
            p = s["picked"]
            print(f"  ok  {s['slug']:26} {p['ink'][0]}x{p['ink'][1]} ink  ar {p['aspect']}  via {p['why']}")
        else:
            bad = ", ".join(sorted({r["verdict"].split(" (")[0] for r in s["rejected"]})) or "none"
            print(f"  --  {s['slug']:26} nothing usable ({bad})")

    json.dump(out, open(sys.argv[2], "w"), indent=1)
    ok = sum(1 for s in out if s["picked"])
    print(f"\n{ok}/{len(out)} businesses have a usable real mark")


if __name__ == "__main__":
    main()
