"""Build a landing photograph from a screenshot of one of Biggie's posts.

    /opt/homebrew/bin/python3 tools/make-landing-photo.py --all
    /opt/homebrew/bin/python3 tools/make-landing-photo.py ~/Desktop/IMG_2205.png 1

THE WHOLE INSTAGRAM POST, not a crop of the picture inside it. His instruction:
"keep the entire Instagram background with it. Basically put it on there exactly
like as you see with the dates and BEASTY_pages above." So the handle, the
avatar, the likes, his caption and the date all stay — that context is the point,
because half these posts have people in them he wants recognised.

TWO STRIPS COME OUT, and neither is Instagram.

  * The iOS status bar. His clock, his carrier and his battery percentage are
    not part of the post and have no business on a customer's screen. Found by
    the dynamic island, which is the one reliably dark thing up there.

  * "View insights" / "Boost post". That row is Instagram's CREATOR UI and is
    visible only to whoever owns the account. A customer seeing "Boost post"
    under a photograph would reasonably think the button was theirs to press.
    Found by the solid blue pill on an otherwise pale row — a test that has to
    include the pale row, because one of these posts is a photograph of a blue
    dog and the button hunt found it instead.

WHY THIS BEATS THE CROP IT REPLACES. The previous version cut a 0.46-aspect
slice out of the square post, which no source could fill: every one of them gave
554 pixels for a screen that paints 1179, a 2.13x enlargement. A screenshot is
1320 wide to begin with, so the card DOWNSCALES to 1179 and paints sharp.

The page is drawn with `background-size: contain` rather than `cover`, so the
whole card is always on screen whatever the viewport — "the entire Instagram
background" is not kept by cropping it. The letterbox uses the chrome colour
sampled from the file itself.

Prints the foot brightness of each, which decides whether that picture wants the
light tab bar or the dark one. See LANDING_PHOTOS in src/apps/IntroScreen.tsx.
"""

import argparse
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "landing")

W = 1179                      # an iPhone 15's real pixel grid, 393pt at 3x

# His picks, in the order they rotate. 2205 is first because he sent it after
# the other three with "This one is better".
#
# 2200 IS NOT IN HERE AND THAT IS THE POINT. He sent 2200, 2205 and 2209 as
# three separate pictures; they are three screenshots of THE SAME POST — same
# caption, same 19 likes, same 24 January 2019. Taking him at his word would
# have put one post in two of four slots and made the rotation look broken. 2201
# takes the seat, which was his own fourth pick anyway.
SLOTS = {
    1: "1956_IMG_2205.png",
    2: "1907_IMG_2199.png",
    3: "1907_IMG_2202.png",
    4: "1907_IMG_2201.png",
    # 2026-09-06, "Maybe add these to the landing page reel?" — HBD Richmond
    # (@rtbrothas, 30 November 2018) and the white-brick wall (11 November
    # 2018). Sent to the thread as IMG_3669 and IMG_3670, not to the msgs
    # folder above, so --all needs them copied in beside the first four.
    5: "IMG_3669.png",
    6: "IMG_3670.png",
}
POSTS = os.environ.get(
    "BEASTY_POSTS",
    "/private/tmp/claude-501/-Users-leon/65b00703-f0ad-4535-98e3-27d8a7170959/scratchpad/msgs",
)


def status_bar_height(im):
    """Bottom of the dynamic island, plus the gap under it.

    THE FIRST CONTIGUOUS DARK BLOCK, not the last dark row. Taking the last one
    worked on posts whose picture starts low and failed on the rest: a dark
    photograph beginning at y=330 is also "a row with lots of dark pixels", so
    the cut landed in the middle of the account row and beheaded the handle this
    whole exercise exists to keep.
    """
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    rows = np.where((g[:400] < 60).sum(axis=1) > 300)[0]
    if not len(rows):
        return 0
    end = rows[0]
    for y in rows:
        if y - end <= 5:
            end = y
        else:
            break
    return int(end) + 14


def _blue(im):
    return cv2.inRange(cv2.cvtColor(im, cv2.COLOR_BGR2HSV), (100, 140, 140), (125, 255, 255))


def insights_band(im):
    """(top, bottom) of the creator-only row, or None if this is not a post.

    Found as a CONNECTED BLOB rather than by counting blue per row. Row-counting
    found the button and then lost it again wherever the "View insights" text on
    the left broke the pale-row test, so the band came out 31px of a 96px row and
    left most of "Boost post" on screen. A blob has one set of bounds.
    """
    h, w = im.shape[:2]
    n, lab, stats, _ = cv2.connectedComponentsWithStats(_blue(im), 8)
    best = None
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        # A solid pill on the right-hand side, roughly a row tall.
        if bw > 250 and 55 < bh < 140 and x > w * 0.45 and area > bw * bh * 0.6:
            if best is None or y < best[0]:
                best = (y, y + bh)
    if best is None:
        return None
    pad = 26                       # the row's own padding, above and below
    return max(0, best[0] - pad), min(h, best[1] + pad)


def account_row_top(im, after=0):
    """Row where a post's own header starts — its avatar, less the row padding.

    Their avatar is a saturated yellow disc at the far left and appears once per
    post, which makes it both the top of this card and the top of the next one.
    """
    h, w = im.shape[:2]
    hsv = cv2.cvtColor(im[:, : int(w * 0.12)], cv2.COLOR_BGR2HSV)
    yellow = cv2.inRange(hsv, (20, 120, 150), (35, 255, 255))
    rows = [int(y) for y in np.where(yellow.sum(axis=1) // 255 > 30)[0] if y > after]
    return max(0, rows[0] - 30) if rows else None


def next_post_top(im, after):
    """Row where the FOLLOWING post's header starts, so the card ends at the date.

    Their avatar is a saturated yellow disc at the far left, and it appears once
    per post. The first one belongs to this post; the second is where the next
    begins, and everything from there down is somebody else's picture.
    """
    h, w = im.shape[:2]
    hsv = cv2.cvtColor(im[:, : int(w * 0.12)], cv2.COLOR_BGR2HSV)
    yellow = cv2.inRange(hsv, (20, 120, 150), (35, 255, 255))
    rows = np.where(yellow.sum(axis=1) // 255 > 30)[0]
    rows = [int(y) for y in rows if y > after]
    if not rows:
        return h
    return max(0, rows[0] - 30)


def build(src, slot):
    im = cv2.imread(src, cv2.IMREAD_COLOR)
    if im is None:
        sys.exit(f"cannot read {src}")
    """
    THE CARD STARTS AT THE ACCOUNT ROW, not at the top of the screenshot.

    Above it sits Instagram's own "< Posts / beasty_pages" nav, which says the
    handle a second time and, being pale, showed straight through the
    translucent mark that sits over this exact spot. Dropping it loses nothing
    he asked to keep — "BEASTY_pages above" is the account row, avatar and all —
    and it takes the clutter out from behind the wordmark.
    """
    top = account_row_top(im, status_bar_height(im)) or status_bar_height(im)
    band = insights_band(im)
    if band is None:
        print(f"  slot {slot}: no Boost-post row found — is this a post screenshot?")
        card = im[top:next_post_top(im, top + 400)]
    else:
        end = next_post_top(im, band[1])
        card = np.vstack([im[top:band[0]], im[band[1]:end]])

    h = int(round(card.shape[0] * W / card.shape[1]))
    card = cv2.resize(card, (W, h), interpolation=cv2.INTER_AREA)

    dst = os.path.join(OUT, f"biggie-{slot}.webp")
    before = os.path.getsize(dst) if os.path.exists(dst) else 0
    cv2.imwrite(dst, card, [cv2.IMWRITE_WEBP_QUALITY, 86])

    chrome = np.median(card[:6, :6].reshape(-1, 3), axis=0).astype(int)
    foot = cv2.cvtColor(card[int(h * 0.82):], cv2.COLOR_BGR2GRAY).mean()
    print(f"  biggie-{slot}  <- {os.path.basename(src)}  {W}x{h}  "
          f"{before // 1024}KB -> {os.path.getsize(dst) // 1024}KB  "
          f"chrome #{chrome[2]:02x}{chrome[1]:02x}{chrome[0]:02x}  "
          f"foot {foot:5.1f} -> {'LIGHT (dark tab bar)' if foot > 140 else 'dark (light tab bar)'}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src", nargs="?", help="path to a post screenshot")
    ap.add_argument("slot", nargs="?", type=int)
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    if a.all:
        for slot, name in sorted(SLOTS.items()):
            build(os.path.join(POSTS, name), slot)
    elif a.src and a.slot:
        build(os.path.expanduser(a.src), a.slot)
    else:
        ap.error("give a screenshot and a slot, or --all")


if __name__ == "__main__":
    main()
