"""How bright each icon is, and how the wallpaper's brightness runs down a page.

The operator's ask: "can you switch around those icons, so the dark icons are
in the lighter space of the wallpaper." A black tile on the dark water at the
bottom of the Golden Gate photograph disappears; the same tile against the sky
at the top does not.

That is a measurement, not a preference, so both halves are measured here and
written into the app as data:

  ICON_LUMA      mean relative luminance of each tile, 0 to 1
  WALLPAPER_TILT how much brighter the TOP of a wallpaper is than its bottom,
                 signed — positive means the light space is up top

The home screen then orders a page's icons against that tilt. Doing it at build
time rather than in the browser keeps it off the critical path: a phone would
have to decode fifty images to work this out for itself.

    python3 tools/icon_luma.py
"""

import glob
import os
import re

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src/data/luma.ts")


def rel_lum(arr):
    """WCAG relative luminance over an RGB array in 0-255."""
    a = arr.astype(np.float64) / 255
    a = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def icon_luma(path):
    im = Image.open(path).convert("RGB").resize((64, 64), Image.LANCZOS)
    return float(rel_lum(np.asarray(im)).mean())


def wallpaper_tilt(path):
    """
    Top third against bottom third, over the band the GRID occupies.

    Not the whole image: the very top is behind the status bar and the very
    bottom is behind the dock, and neither has an icon on it. Measuring those
    would have the dock's dark glass voting on where the dark icons go.
    """
    im = Image.open(path).convert("RGB")
    w, h = im.size
    grid = np.asarray(im.crop((0, int(h * 0.12), w, int(h * 0.80))))
    lum = rel_lum(grid)
    third = lum.shape[0] // 3
    return float(lum[:third].mean() - lum[-third:].mean())


def main():
    icons = {}
    for p in sorted(glob.glob(os.path.join(ROOT, "public/icons/*.webp"))):
        icons[os.path.basename(p)[: -len(".webp")]] = round(icon_luma(p), 4)

    walls = {}
    for p in sorted(glob.glob(os.path.join(ROOT, "public/wallpapers/*.webp"))):
        name = os.path.basename(p)[: -len(".webp")]
        walls[name] = round(wallpaper_tilt(p), 4)

    body = [
        "/**",
        " * Measured brightness, written by tools/icon_luma.py. Do not edit by hand.",
        " *",
        " * ICON_LUMA is each tile's mean relative luminance, 0 (black) to 1 (white).",
        " * WALLPAPER_TILT is how much brighter a wallpaper's top third is than its",
        " * bottom third, across the band the icon grid actually covers. Positive means",
        " * the light space is at the top, which is where the dark icons should go.",
        " *",
        " * See the operator's note: \"can you switch around those icons, so the dark",
        " * icons are in the lighter space of the wallpaper.\"",
        " */",
        "",
        "export const ICON_LUMA: Record<string, number> = {",
    ]
    for k, v in icons.items():
        body.append(f"  {k!r}: {v},".replace("'", "'"))
    body.append("}")
    body.append("")
    body.append("export const WALLPAPER_TILT: Record<string, number> = {")
    for k, v in walls.items():
        body.append(f"  {k!r}: {v},")
    body.append("}")
    body.append("")

    text = "\n".join(body).replace("'", "'")
    open(OUT, "w").write(text)
    tilts = sorted(walls.items(), key=lambda kv: -kv[1])
    print(f"{len(icons)} icons, {len(walls)} wallpapers -> {os.path.relpath(OUT, ROOT)}")
    print(f"  brightest-topped: {', '.join(f'{k} {v:+.3f}' for k, v in tilts[:3])}")
    print(f"  darkest-topped:   {', '.join(f'{k} {v:+.3f}' for k, v in tilts[-3:])}")


if __name__ == "__main__":
    main()
