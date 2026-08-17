"""Bring the icons that were already here up to the size the app actually draws.

Every pre-existing tile is 256x256. A brand page draws its logo at 78pt, which
is 234 physical pixels on a 3x phone, and the hero on a tablet is larger still —
so 256 was being displayed at very close to 1:1 and sometimes past it. That is
where a logo starts to look soft.

EDSR x4 to 1024 and a clean resample back to 512. The network runs once, on the
original, rather than twice on its own output: a second pass amplifies what it
guessed the first time instead of adding anything. Files already at 512 or above
are left alone — re-running this over the marks just downloaded would sharpen
artefacts into them for no gain.
"""

import glob
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logo_build import upscale  # noqa: E402

TARGET = 512
ICONS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public/icons")


def main():
    done, skipped = 0, 0
    for path in sorted(glob.glob(os.path.join(ICONS, "*.webp"))):
        name = os.path.basename(path)
        im = Image.open(path)
        if min(im.size) >= TARGET:
            skipped += 1
            continue
        before = os.path.getsize(path) // 1024
        """
        Square first if it is not already. None of these are off-square today,
        but a non-square input would silently become a stretched one, and that
        is the single most visible way to ruin a logo.
        """
        if im.width != im.height:
            side = max(im.size)
            pad = Image.new("RGB", (side, side), im.convert("RGB").getpixel((0, 0)))
            pad.paste(im.convert("RGB"), ((side - im.width) // 2, (side - im.height) // 2))
            im = pad
        big = upscale(im.convert("RGB"), TARGET)
        big.save(path, "WEBP", quality=93, method=6)
        after = os.path.getsize(path) // 1024
        print(f"  {name:28} {im.size[0]}px -> {TARGET}px   {before}KB -> {after}KB")
        done += 1
    print(f"\n{done} upscaled, {skipped} already at {TARGET}px or larger")


if __name__ == "__main__":
    main()
