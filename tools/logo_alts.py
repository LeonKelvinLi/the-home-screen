"""Two things the scoring could not do for itself: spot shared art, and show its
runners-up.

The contact sheet caught one black house glyph standing in for three different
businesses. That is a theme default, and the giveaway is that it is IDENTICAL
across unrelated companies — something no real logo ever is. A perceptual hash
over every pick finds the rest of that class automatically, rather than relying
on my noticing a repeat in a grid of fifty-four.

The second half draws the alternates for whichever picks were vetoed, because a
wrong first choice usually has a right second one sitting behind it.
"""

import json
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from logo_pick import ink_box, load  # noqa: E402
from logo_sheet import checker  # noqa: E402

CELL, PAD, LABEL = 190, 9, 24
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"


def phash(im, n=12):
    """Coarse average-hash. Exact equality is what matters here — two firms
    sharing a theme serve byte-identical art — so this only needs to be stable,
    not perceptually clever."""
    g = im.convert("L").resize((n, n), Image.LANCZOS)
    px = list(g.getdata())
    avg = sum(px) / len(px)
    return "".join("1" if p > avg else "0" for p in px)


def main():
    picked = json.load(open(sys.argv[1]))
    veto = set(open(sys.argv[2]).read().split()) if len(sys.argv) > 2 else set()

    # --- shared art across unrelated businesses = a theme default ------------
    seen = {}
    for s in picked:
        if not s.get("picked"):
            continue
        im = load(s["picked"]["file"], s["picked"].get("ctype", ""))
        if im is None:
            continue
        seen.setdefault(phash(im), []).append(s["slug"])
    shared = {h: v for h, v in seen.items() if len(v) > 1}
    if shared:
        print("IDENTICAL art on unrelated businesses — theme defaults:")
        for v in shared.values():
            print("   ", ", ".join(v))
    else:
        print("no duplicate art among the picks")

    # --- alternates for everything vetoed ------------------------------------
    rows = []
    for s in picked:
        if s["slug"] not in veto:
            continue
        for a in ([s["picked"]] if s.get("picked") else []) + s.get("alts", []):
            rows.append((s["slug"], a))
    if not rows:
        return

    cols = 6
    nrows = (len(rows) + cols - 1) // cols
    cw, ch = CELL + PAD * 2, CELL + LABEL + PAD * 2
    sheet = Image.new("RGB", (cols * cw, nrows * ch), (250, 250, 252))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(FONT, 13)

    for i, (slug, a) in enumerate(rows):
        cx, cy = (i % cols) * cw, (i // cols) * ch
        im = load(a["file"], a.get("ctype", ""))
        if im is None:
            continue
        box = ink_box(im)
        if box:
            im = im.crop(box)
        im.thumbnail((CELL, CELL), Image.LANCZOS)
        tile = checker(CELL)
        tile.paste(im, ((CELL - im.width) // 2, (CELL - im.height) // 2), im)
        sheet.paste(tile, (cx + PAD, cy + PAD))
        draw.text((cx + PAD, cy + PAD + CELL + 4), f"{slug} | {a['why'][:18]}", font=font, fill=(20, 20, 24))

    sheet.save(sys.argv[3])
    print(f"\n{len(rows)} alternates for {len(veto)} vetoed picks -> {sys.argv[3]}")


if __name__ == "__main__":
    main()
