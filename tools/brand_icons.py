#!/usr/bin/env python3
"""
Build the BEASTY EATS icon set.

    /usr/bin/python3 tools/brand_icons.py

Reads the dog from brand/v2/beasty-biggie-icon-1024.png and writes a fresh set
into brand/v3/ plus the app-icon sizes into public/.

WHAT WAS WRONG WITH THE OLD SET

- The wordmark tile put Biggie ON TOP of the letters, so it read "BE?STY E?TS".
  A logo you cannot read is not a logo. He sits above the words now.
- The dog sat low and right of centre. A silhouette has to be balanced on its
  visual mass, not its bounding box — its legs are thin and its head is heavy,
  so a box-centred dog always looks like it is falling backwards.
- Everything was drawn at one size and never checked at sixty pixels, which is
  how large an app icon actually is on a phone.

TYPEFACE: Oswald, under the SIL Open Font License, which permits commercial use
including logos. The retro face that was suggested for this (Super Retro M54)
is licensed "free for personal use" and its own terms forbid hosting it online,
so it cannot ship in a commercial web app without a licence from its author.
"""

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "brand/v2/beasty-biggie-icon-1024.png"
OUT = ROOT / "brand/v3"
FONT = Path("/private/tmp/claude-501/-Users-leon/65b00703-f0ad-4535-98e3-27d8a7170959/scratchpad/oswald.ttf")

YELLOW_TOP = (255, 230, 61)
YELLOW_BOT = (242, 207, 0)
INK = (17, 17, 17)


def dog_mask() -> Image.Image:
    """The silhouette, cropped to its own ink, as an alpha mask."""
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    px = im.load()
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 128 and r + g + b < 300:
                mp[x, y] = 255
                minx, maxx = min(minx, x), max(maxx, x)
                miny, maxy = min(miny, y), max(maxy, y)
    return mask.crop((minx, miny, maxx + 1, maxy + 1))


DOG = dog_mask()


def centre_of_mass(mask: Image.Image) -> tuple[float, float]:
    """
    Where the shape actually LOOKS centred.

    A dog silhouette has a heavy head and thin legs, so its bounding-box centre
    sits well below and behind its visual centre. Centring on the ink instead is
    the difference between a mark that stands and one that looks like it is
    toppling backwards.
    """
    px = mask.load()
    w, h = mask.size
    sx = sy = n = 0
    for y in range(h):
        for x in range(w):
            if px[x, y] > 128:
                sx += x
                sy += y
                n += 1
    return sx / n, sy / n


def ground(size: int) -> Image.Image:
    """Brand yellow with a slight vertical fall, so the tile is not flat."""
    g = Image.new("RGB", (size, size), YELLOW_TOP)
    d = ImageDraw.Draw(g)
    for y in range(size):
        t = y / max(1, size - 1)
        d.line(
            [(0, y), (size, y)],
            fill=tuple(round(a + (b - a) * t) for a, b in zip(YELLOW_TOP, YELLOW_BOT)),
        )
    return g


def place_dog(canvas: Image.Image, target_h: int, cx: float, cy: float, ink=INK) -> None:
    """Paste the dog at target_h tall, with its INK centre landing on (cx, cy)."""
    scale = target_h / DOG.height
    d = DOG.resize((max(1, round(DOG.width * scale)), target_h), Image.LANCZOS)
    mx, my = centre_of_mass(d)
    layer = Image.new("RGB", d.size, ink)
    canvas.paste(layer, (round(cx - mx), round(cy - my)), d)


def app_icon(size: int = 1024) -> Image.Image:
    """
    Biggie alone.

    One idea, because an app icon is sixty pixels on a phone and two ideas at
    sixty pixels is mush. This is the mark that has to survive that size, so it
    carries nothing else.
    """
    img = ground(size)
    place_dog(img, round(size * 0.70), size / 2, size * 0.50)
    return img


def eat_icon(size: int = 1024, inverted: bool = False) -> Image.Image:
    """
    E-dog-T, the dog standing in for the A.

    The old one let the dog's legs run into the E and the T. Both letters are
    pulled clear and set on a shared baseline, so the joke reads instead of
    looking like a collision.
    """
    ink = YELLOW_TOP if inverted else INK
    img = Image.new("RGB", (size, size), INK) if inverted else ground(size)
    d = ImageDraw.Draw(img)

    f = ImageFont.truetype(str(FONT), round(size * 0.40))
    try:
        f.set_variation_by_axes([700])
    except Exception:
        pass

    gap = size * 0.055
    dog_h = round(size * 0.50)
    dog_w = round(DOG.width * dog_h / DOG.height)

    we = d.textbbox((0, 0), "E", font=f)
    wt = d.textbbox((0, 0), "T", font=f)
    ew, tw = we[2] - we[0], wt[2] - wt[0]
    total = ew + gap + dog_w + gap + tw
    x = (size - total) / 2
    baseline = size * 0.62

    d.text((x - we[0], baseline - we[3]), "E", font=f, fill=ink)
    place_dog(img, dog_h, x + ew + gap + dog_w / 2, baseline - dog_h * 0.5, ink=ink)
    d.text((x + ew + gap + dog_w + gap - wt[0], baseline - wt[3]), "T", font=f, fill=ink)
    return img


def wordmark_tile(size: int = 1024) -> Image.Image:
    """
    Dog above, words below, nothing overlapping.

    The old tile printed the wordmark and then dropped the dog on top of it,
    which cost the A of BEASTY and the A of EATS. Stacked, both survive.
    """
    img = ground(size)
    d = ImageDraw.Draw(img)

    place_dog(img, round(size * 0.42), size / 2, size * 0.34)

    def fitted(word: str, target_w: float) -> ImageFont.FreeTypeFont:
        s = round(size * 0.20)
        while s > 8:
            f = ImageFont.truetype(str(FONT), s)
            try:
                f.set_variation_by_axes([700])
            except Exception:
                pass
            b = d.textbbox((0, 0), word, font=f)
            if b[2] - b[0] <= target_w:
                return f
            s -= 2
        return ImageFont.truetype(str(FONT), 8)

    inner = size * 0.74
    for word, cy in (("BEASTY", size * 0.685), ("EATS", size * 0.845)):
        f = fitted(word, inner)
        b = d.textbbox((0, 0), word, font=f)
        d.text(((size - (b[2] - b[0])) / 2 - b[0], cy - (b[3] - b[1]) / 2 - b[1]),
               word, font=f, fill=INK)
    return img


def save(img: Image.Image, name: str, sizes=(1024,)) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for s in sizes:
        out = img if s == img.width else img.resize((s, s), Image.LANCZOS)
        suffix = "" if s == 1024 else f"-{s}"
        p = OUT / f"{name}{suffix}.png"
        out.save(p, "PNG", optimize=True)
        print(f"  {p.relative_to(ROOT)}  {os.path.getsize(p) // 1024} KB")


print("brand/v3:")
icon = app_icon()
save(icon, "beasty-app-icon", (1024, 512, 192, 180))
save(eat_icon(), "beasty-eat-icon", (1024, 512))
save(eat_icon(inverted=True), "beasty-eat-icon-black", (1024, 512))
save(wordmark_tile(), "beasty-eats-tile", (1024, 512))

# ---- the live app icons ----
#
# ALL FOUR the manifest declares, not just the two that were obviously wrong.
# Regenerating half a set leaves an app whose icon changes depending on which
# surface asked for it.
#
# iOS applies its own mask, so the square ones stay square.
for name, s in (("apple-touch-icon", 180), ("icon-192", 192), ("icon-512", 512)):
    icon.resize((s, s), Image.LANCZOS).save(ROOT / f"public/{name}.png", "PNG", optimize=True)
    print(f"  public/{name}.png  {s}x{s}")

# The MASKABLE icon is different and the difference matters.
#
# Android crops it to whatever shape the launcher likes — circle, squircle,
# teardrop — and only the middle 80% of the width is guaranteed to survive. An
# icon drawn edge to edge loses its feet to a circular mask. So the dog is
# drawn smaller inside the same tile, sitting entirely within the safe zone.
maskable = ground(512)
place_dog(maskable, round(512 * 0.50), 256, 256)
maskable.save(ROOT / "public/icon-maskable-512.png", "PNG", optimize=True)
print("  public/icon-maskable-512.png  512x512 (dog inside the 80% safe zone)")
