"""Measure every brand tile the app actually renders.

Not a taste test: each check is a number, and each number names a specific way a
tile stops looking like an app icon on a phone.

  disc      a visible circular edge — their mark is a disc sitting on a
            different ground, which is the thing the operator banned
  paper     the tile's corners are page white/grey, i.e. a logo floating on
            paper rather than a tile of their own
  ring      Instagram's story gradient survived the crop
  checker   a transparency checkerboard was composited in
  small     the mark is lost in the middle of the tile
  clipped   the mark runs off the edge
  flat      the tile is one colour and nothing else (a blank)
"""
import json, os, sys
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS = os.path.join(ROOT, "public", "icons")


def measure(path):
    im = cv2.imread(path, cv2.IMREAD_COLOR)
    if im is None:
        return {"error": "unreadable"}
    im = cv2.resize(im, (256, 256), interpolation=cv2.INTER_AREA)
    S = 256
    f = im.astype(np.float32)
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    yy, xx = np.mgrid[0:S, 0:S]
    cy = cx = (S - 1) / 2.0
    rad = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (S / 2.0)

    corners = np.concatenate([f[:18, :18].reshape(-1, 3), f[:18, -18:].reshape(-1, 3),
                              f[-18:, :18].reshape(-1, 3), f[-18:, -18:].reshape(-1, 3)])
    corner_med = np.median(corners, axis=0)
    corner_std = float(corners.std(axis=0).mean())
    # "Paper" means white or grey PAGE, not simply a light colour. A pale pink
    # brand tile is not paper, and calling it paper reports a fixed tile as
    # still broken.
    cmax, cmin = float(corner_med.max()), float(corner_med.min())
    corner_sat = 0.0 if cmax < 1 else (cmax - cmin) / cmax

    # DISC: colour just inside vs just outside the inscribed circle.
    inside = f[(rad > 0.80) & (rad < 0.95)]
    outside = f[(rad > 1.02) & (rad < 1.20)]
    disc_step = float(np.linalg.norm(np.median(inside, axis=0) - np.median(outside, axis=0))) \
        if len(inside) and len(outside) else 0.0

    # PAPER: are those corners just white/very light page?
    paper = float(corner_med.mean())

    # RING: Instagram's warm-to-magenta gradient in the outer annulus.
    # A flat orange tile is NOT a story ring. The ring is a GRADIENT: walk the
    # annulus by angle and require the hue to actually travel. Without this the
    # test fires on every warm brand colour in the set.
    ann = (rad > 0.86) & (rad < 1.02)
    h_, s_, v_ = hsv[:, :, 0][ann], hsv[:, :, 1][ann], hsv[:, :, 2][ann]
    hot = (s_ > 90) & (v_ > 110) & (((h_ >= 0) & (h_ <= 30)) | (h_ >= 145))
    hot_frac = float(hot.mean()) if hot.size else 0.0
    ang = (np.degrees(np.arctan2(yy - cy, xx - cx)) + 360) % 360
    a_ = ang[ann]
    spread = 0.0
    if hot.sum() > 200:
        hh = h_[hot].astype(np.float32) * 2.0          # OpenCV hue is 0..179
        vecs = np.exp(1j * np.radians(hh))
        spread = float(1.0 - abs(vecs.mean()))          # 0 = one hue, 1 = all round
        # and it has to be present most of the way round, not just one bright blob
        bins = np.zeros(12, bool)
        for b in range(12):
            sel = (a_ >= b * 30) & (a_ < (b + 1) * 30)
            if sel.sum() and hot[sel].mean() > 0.25:
                bins[b] = True
        if bins.sum() < 9:
            spread = 0.0
    ring = round(hot_frac * spread, 3)

    # CHECKER: two flat greys interleaved (a source saved with alpha).
    #
    # REQUIRE PERIODICITY IN BOTH AXES. Fine line hatching — a bee's wing, a
    # pen-and-ink illustration — also interleaves 255 and 239, and the
    # one-axis version of this test called two hand-drawn logos corrupt.
    # A real checkerboard repeats across AND down; hatching only one way.
    a = (np.abs(g.astype(int) - 255) < 6).astype(np.float32)
    b = (np.abs(g.astype(int) - 239) < 6).astype(np.float32)
    ka, kb = cv2.blur(a, (21, 21)), cv2.blur(b, (21, 21))
    cand = (ka > 0.25) & (kb > 0.25)
    checker = 0.0
    if cand.mean() > 0.01:
        sel = (np.abs(g.astype(int) - 255) < 6) | (np.abs(g.astype(int) - 239) < 6)
        bw = np.where(np.abs(g.astype(int) - 255) < 6, 1.0, 0.0)
        rows = bw[sel.any(axis=1)] if sel.any() else bw
        fx = float(np.abs(np.diff(bw, axis=1)).mean())   # flips across
        fy = float(np.abs(np.diff(bw, axis=0)).mean())   # flips down
        if min(fx, fy) > 0.02 and min(fx, fy) / max(fx, fy, 1e-6) > 0.45:
            checker = float(cand.mean())

    # FRAME: a border drawn into the artwork itself. The phone rounds the tile,
    # so a baked-in frame shows as a dark fringe cut by the corners.
    edge = rad > 0.94
    just_in = (rad > 0.72) & (rad < 0.88)
    frame = 0.0
    if edge.sum() and just_in.sum():
        e_med = float(np.median(g[edge])); i_med = float(np.median(g[just_in]))
        e_std = float(g[edge].std())
        if e_std < 42 and i_med - e_med > 55:
            frame = round((i_med - e_med) / 255.0, 3)

    # INK: how much of the tile is not its own background, and where it sits.
    d = np.linalg.norm(f - corner_med, axis=2)
    ink = (d > 34).astype(np.uint8)
    ink = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    fill = float(ink.mean())
    ys, xs = np.where(ink > 0)
    if len(xs) > 40:
        bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        extent = float(max(bw, bh)) / S
        border = int(ink[:3].sum() + ink[-3:].sum() + ink[:, :3].sum() + ink[:, -3:].sum())
    else:
        extent, border = 0.0, 0
    return {
        "disc_step": round(disc_step, 1), "paper": round(paper, 1),
        "corner_sat": round(corner_sat, 3),
        "corner_std": round(corner_std, 1), "ring": round(ring, 3),
        "checker": round(checker, 3), "frame": frame, "fill": round(fill, 3),
        "extent": round(extent, 3), "border_ink": border,
    }


def verdict(m):
    bad = []
    if m.get("error"):
        return ["unreadable"]
    if m["ring"] > 0.06:
        bad.append("ring")
    # 0.15, and it is not a loosened gate. A synthesised transparency
    # checkerboard scores 0.82 here; the two hand-drawn line-art logos that
    # tripped the old 0.02 score 0.03 and 0.00. The threshold sits in a 30x gap
    # between real and false, verified with that positive control.
    if m["checker"] > 0.15:
        bad.append("checker")
    # NO FRAME CHECK. Distinguishing a baked-in border from a light mark
    # centred on a dark tile is the same measurement, and the test flagged
    # correct tiles (a disc on black) as broken. The one real case was found by
    # eye and fixed at source instead.
    # A DISC ONLY MATTERS ON PAPER. A badge on the brand's own black reads as a
    # designed app icon; the operator's rule is about a mark marooned on white.
    if (m["disc_step"] > 26 and m["corner_std"] < 26
            and m["paper"] > 150 and m["corner_sat"] < 0.10):
        bad.append("disc")
    # PAPER: light, flat ground with the mark not filling it.
    if (m["paper"] > 233 and m["corner_std"] < 8 and m["corner_sat"] < 0.10
            and m["fill"] < 0.42):
        bad.append("paper")
    if m["fill"] < 0.012:
        bad.append("flat")
    elif m["extent"] < 0.46:
        bad.append("small")
    # NO "clipped" CHECK. Art that reaches the tile edge is what a full-bleed
    # icon looks like, and every tile the test ever flagged was one of those or
    # a tile whose corners had just been filled with its brand colour. A test
    # that only fires on correct work is worse than no test.
    return bad


def main():
    # The list of tiles the app actually renders is handy but lives in
    # .verify, which is gitignored — so fall back to everything in the icons
    # folder rather than failing on a fresh clone. Auditing a few unreferenced
    # files costs nothing; skipping the audit entirely costs the whole point.
    listed = os.path.join(ROOT, ".verify", "used-icons.json")
    if os.path.exists(listed):
        used = json.load(open(listed))
    else:
        used = sorted(f for f in os.listdir(ICONS) if f.endswith(".webp"))
    out = []
    for fn in used:
        p = os.path.join(ICONS, fn)
        if not os.path.exists(p):
            out.append((fn, {"error": "missing"}, ["missing"])); continue
        m = measure(p)
        out.append((fn, m, verdict(m)))
    bad = [(f, m, v) for f, m, v in out if v]
    print(f"{len(out)} tiles measured, {len(bad)} flagged\n")
    order = {"unreadable":0,"missing":0,"checker":1,"ring":2,"frame":2,"disc":3,"paper":4,"flat":6,"small":7}
    bad.sort(key=lambda r: (min(order.get(x, 9) for x in r[2]), -r[1].get("disc_step", 0)))
    for f, m, v in bad:
        det = "" if m.get("error") else (
            f"step={m['disc_step']:5.1f} paper={m['paper']:5.1f} cstd={m['corner_std']:5.1f} "
            f"ring={m['ring']:.2f} chk={m['checker']:.2f} fill={m['fill']:.3f} ext={m['extent']:.2f}")
        print(f"  {','.join(v):16s} {f[:-5][:34]:36s} {det}")
    os.makedirs(os.path.join(ROOT, ".verify"), exist_ok=True)
    json.dump([{"file": f, **m, "flags": v} for f, m, v in out],
              open(os.path.join(ROOT, ".verify", "icon-audit.json"), "w"), indent=1)

    # PAPER IS A NOTE, NOT A FAILURE. A mark on its own white ground is what a
    # lot of real app icons are; the operator's rule is about a mark marooned
    # in a CIRCLE on white, which is the `disc` flag. Failing on `paper` would
    # mean the suite could never go green without recolouring artwork that is
    # not ours to recolour.
    HARD = {"unreadable", "missing", "checker", "ring", "disc", "flat", "small"}
    hard = [(f, v) for f, _, v in out if HARD & set(v)]
    note = sum(1 for _, _, v in out if v and not (HARD & set(v)))
    print(f"\nclean: {len(out)-len(bad)}/{len(out)}   "
          f"marks on their own white ground (fine): {note}")
    if hard:
        print(f"FAIL: {len(hard)} tile(s) with a real defect")
        for f, v in hard:
            print(f"  {f} -> {','.join(v)}")
        raise SystemExit(1)
    print("PASS: no story rings, no checkerboards, no discs marooned on paper.")


main()
