"""Lay every chosen mark out on one sheet so a human can veto the picker.

The scoring is a heuristic over shape and provenance. It cannot tell a logo
from a photograph of a storefront, and og:image supplies plenty of the latter.
Nothing here goes near a customer's page until it has been looked at, so this
draws all of them at once, on a checkerboard that shows transparent and white
marks equally well.
"""

import json
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from logo_pick import ink_box, load  # noqa: E402

CELL, PAD, LABEL, COLS = 210, 10, 26, 8
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"


def checker(size, a=(214, 214, 218), b=(190, 190, 196), step=12):
    im = Image.new("RGB", (size, size), a)
    d = ImageDraw.Draw(im)
    for y in range(0, size, step):
        for x in range(0, size, step):
            if (x // step + y // step) % 2:
                d.rectangle([x, y, x + step, y + step], fill=b)
    return im


def main():
    picked = [s for s in json.load(open(sys.argv[1])) if s.get("picked")]
    cols = COLS
    rows = (len(picked) + cols - 1) // cols
    cw, ch = CELL + PAD * 2, CELL + LABEL + PAD * 2
    sheet = Image.new("RGB", (cols * cw, rows * ch), (250, 250, 252))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(FONT, 15)

    for i, s in enumerate(picked):
        cx, cy = (i % cols) * cw, (i // cols) * ch
        im = load(s["picked"]["file"], s["picked"].get("ctype", ""))
        if im is None:
            continue
        box = ink_box(im)
        if box:
            im = im.crop(box)
        im.thumbnail((CELL, CELL), Image.LANCZOS)
        tile = checker(CELL)
        tile.paste(im, ((CELL - im.width) // 2, (CELL - im.height) // 2), im)
        sheet.paste(tile, (cx + PAD, cy + PAD))
        draw.text((cx + PAD, cy + PAD + CELL + 5), s["slug"][:26], font=font, fill=(20, 20, 24))

    sheet.save(sys.argv[2])
    print(f"{len(picked)} marks -> {sys.argv[2]}  {sheet.width}x{sheet.height}")


if __name__ == "__main__":
    main()
