#!/usr/bin/env python3
"""
Backgrounds for the BEASTY category pages (src/data/categories.ts).

Glenn, 2026-09-30: "Feel free to choose an appropriate background for each
category." Drawn here rather than taken from stock, so there is nothing to
license: a dark gradient per category with one motif that says what the page is
(a road for Whips, a record for DJ's, barber-pole stripes for Barbershops).
Swap any of them for a photograph later by writing the same file name.

Kept DARK on purpose. The tile labels on a home page are white with a shadow,
and a category page gets no scrim (Wallpaper.tsx gives an explicit `src` none),
so each image is pulled down until its average brightness sits under the
threshold the city photographs are scrimmed to.

    python3 tools/make-category-walls.py            # every category
    python3 tools/make-category-walls.py tattoo     # just one

Writes public/wallpapers/cat-<kind>.webp at 1320x2868 and a 132px
cat-<kind>-thumb.webp for Search's Categories list, plus the two thumbs for
BEASTY's own sheets (its photograph and the yellow paper).
"""
import math
import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "wallpapers"
W, H = 1320, 2868
THUMB = 132
# Mean relative luminance a page may have. White labels on the city photos are
# read comfortably at a scrimmed luma of about 0.23 (Wallpaper.tsx wallpaperScrim).
MAX_LUMA = 0.16


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def gradient(top, bottom):
    t = np.linspace(0, 1, H)[:, None, None]
    a = np.array(hexrgb(top), dtype=np.float32)[None, None, :]
    b = np.array(hexrgb(bottom), dtype=np.float32)[None, None, :]
    img = a * (1 - t) + b * t
    return np.broadcast_to(img, (H, W, 3)).copy()


def glow(img, cx, cy, r, color, strength):
    y, x = np.ogrid[:H, :W]
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r
    f = np.clip(1 - d, 0, 1) ** 2 * strength
    c = np.array(hexrgb(color), dtype=np.float32)
    return img * (1 - f[..., None]) + c * f[..., None]


def layer():
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def rgba(h, a):
    return hexrgb(h) + (int(a * 255),)


def composite(base, over, blur=0):
    if blur:
        over = over.filter(ImageFilter.GaussianBlur(blur))
    b = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert("RGBA")
    return np.asarray(Image.alpha_composite(b, over).convert("RGB"), dtype=np.float32)


def curve(d, pts, color, width):
    d.line(pts, fill=color, width=width, joint="curve")


def sine_path(y0, amp, wl, phase, x_from=-100, x_to=W + 100, step=12):
    return [(x, y0 + amp * math.sin((x / wl) * 2 * math.pi + phase)) for x in range(x_from, x_to, step)]


# ---------------------------------------------------------------- the motifs


def m_tattoo(rng):
    img = gradient("#0b0b0d", "#2a0710")
    img = glow(img, W * 0.8, H * 0.25, 900, "#7a0f22", 0.55)
    over, d = layer()
    for i in range(9):
        y0 = rng.uniform(200, H - 200)
        pts = sine_path(y0, rng.uniform(80, 260), rng.uniform(700, 1500), rng.uniform(0, 6))
        curve(d, pts, rgba("#c8102e", rng.uniform(0.18, 0.35)), int(rng.uniform(10, 34)))
    for i in range(14):
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(40, 160)
        d.arc([cx - r, cy - r, cx + r, cy + r], rng.uniform(0, 180), rng.uniform(200, 340), fill=rgba("#e8e1d9", 0.10), width=6)
    return composite(img, over, blur=3)


def m_athletes(rng):
    img = gradient("#1a0a04", "#3d1406")
    img = glow(img, W * 0.5, H * 0.9, 1300, "#c2410c", 0.5)
    over, d = layer()
    cx, cy = W * 0.5, H * 1.05
    for i in range(8):
        r = 700 + i * 150
        d.arc([cx - r * 1.4, cy - r, cx + r * 1.4, cy + r], 180, 360, fill=rgba("#fb923c", 0.22), width=10)
    for i in range(8):
        r = 700 + i * 150 + 75
        d.arc([cx - r * 1.4, cy - r, cx + r * 1.4, cy + r], 200, 340, fill=rgba("#ffffff", 0.07), width=3)
    return composite(img, over, blur=2)


def m_ai(rng):
    img = gradient("#030712", "#0b1a3a")
    img = glow(img, W * 0.3, H * 0.35, 1000, "#0e7490", 0.45)
    over, d = layer()
    step = 110
    for gx in range(0, W + step, step):
        for gy in range(0, H + step, step):
            if rng.random() < 0.55:
                d.ellipse([gx - 6, gy - 6, gx + 6, gy + 6], fill=rgba("#22d3ee", 0.35))
            if rng.random() < 0.3:
                nx, ny = (gx + step, gy) if rng.random() < 0.5 else (gx, gy + step)
                d.line([(gx, gy), (nx, ny)], fill=rgba("#22d3ee", 0.22), width=4)
    return composite(img, over, blur=1)


def m_artists(rng):
    img = gradient("#101014", "#1d1a24")
    over, d = layer()
    colors = ["#f6d800", "#ef4444", "#3b82f6", "#22c55e", "#ec4899", "#f97316", "#a855f7"]
    for i in range(70):
        c = rng.choice(colors)
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(20, 170)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=rgba(c, rng.uniform(0.12, 0.3)))
        for k in range(rng.randint(3, 9)):
            a = rng.uniform(0, 2 * math.pi)
            dist = r * rng.uniform(1.2, 2.6)
            rr = r * rng.uniform(0.06, 0.18)
            x, y = cx + math.cos(a) * dist, cy + math.sin(a) * dist
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=rgba(c, 0.3))
    return composite(img, over, blur=2)


def m_dancers(rng):
    img = gradient("#14061f", "#3b0a2e")
    img = glow(img, W * 0.2, H * 0.6, 1100, "#be185d", 0.45)
    over, d = layer()
    for i in range(7):
        y0 = H * (0.15 + i * 0.12)
        pts = sine_path(y0, 320, 1800, i * 0.9)
        curve(d, pts, rgba(["#f472b6", "#fb923c", "#c084fc"][i % 3], 0.22), 60 - i * 5)
    return composite(img, over, blur=10)


def spline(pts, n=24):
    """Catmull-Rom through the points, so a hand-placed path draws smooth."""
    out = []
    p = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in (0, 1)))
    out.append(pts[-1])
    return out


def m_donations(rng):
    img = gradient("#12061f", "#2e1065")
    img = glow(img, W * 0.5, H * 0.45, 1100, "#7c3aed", 0.5)
    over, d = layer()
    # An awareness ribbon, drawn large: a loop at the top, the two ends crossing
    # under it and falling away to either side.
    cx, cy = W * 0.5, H * 0.36
    path = [
        (cx - 330, cy + 900),
        (cx - 120, cy + 420),
        (cx + 60, cy + 60),
        (cx + 210, cy - 250),
        (cx, cy - 470),
        (cx - 210, cy - 250),
        (cx - 60, cy + 60),
        (cx + 120, cy + 420),
        (cx + 330, cy + 900),
    ]
    # Drawn solid and faded afterwards, with a round cap at every point, so the
    # thick stroke has no notches where its segments meet.
    pts = spline(path)
    curve(d, pts, rgba("#c4b5fd", 1), 110)
    for x, y in pts:
        d.ellipse([x - 55, y - 55, x + 55, y + 55], fill=rgba("#c4b5fd", 1))
    alpha = over.getchannel("A").point(lambda v: int(v * 0.34))
    over.putalpha(alpha)
    return composite(img, over, blur=6)


def m_djs(rng):
    img = gradient("#07030f", "#1e0b3a")
    img = glow(img, W * 0.95, H * 0.3, 1200, "#9333ea", 0.45)
    over, d = layer()
    cx, cy = W * 0.95, H * 0.3
    for r in range(80, 1500, 14):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=rgba("#e9d5ff", 0.05 + 0.04 * (r % 3 == 0)), width=2)
    d.ellipse([cx - 260, cy - 260, cx + 260, cy + 260], fill=rgba("#db2777", 0.35))
    d.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], fill=rgba("#000000", 0.8))
    return composite(img, over, blur=1)


def m_cooks(rng):
    img = gradient("#140a05", "#3a1d0a")
    img = glow(img, W * 0.5, H * 1.0, 1300, "#d97706", 0.55)
    over, d = layer()
    for i in range(10):
        x0 = W * (0.05 + i * 0.1)
        pts = [(x0 + 60 * math.sin(y / 260 + i), y) for y in range(H, 0, -12)]
        curve(d, pts, rgba("#fde68a", 0.11), 26)
    return composite(img, over, blur=14)


def m_foodies(rng):
    img = gradient("#1a0505", "#3b0d06")
    img = glow(img, W * 0.3, H * 0.2, 1000, "#dc2626", 0.4)
    over, d = layer()
    for i in range(22):
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(90, 260)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=rgba("#fef3c7", 0.14), width=10)
        d.ellipse([cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7], outline=rgba("#fbbf24", 0.12), width=4)
    return composite(img, over, blur=2)


def m_realtors(rng):
    img = gradient("#04130f", "#0b2e2a")
    img = glow(img, W * 0.7, H * 0.2, 1000, "#0f766e", 0.45)
    over, d = layer()
    sx, sy = 220, 230
    for row in range(-1, H // sy + 2):
        for col in range(-1, W // sx + 2):
            x = col * sx + (sx // 2 if row % 2 else 0)
            y = row * sy
            d.line([(x - 70, y + 60), (x, y), (x + 70, y + 60)], fill=rgba("#5eead4", 0.2), width=8)
            d.rectangle([x - 50, y + 60, x + 50, y + 140], outline=rgba("#5eead4", 0.12), width=5)
    return composite(img, over, blur=1)


def m_media(rng):
    img = gradient("#02040a", "#0a1a33")
    img = glow(img, W * 0.1, H * 0.75, 1200, "#1d4ed8", 0.5)
    over, d = layer()
    cx, cy = W * 0.05, H * 0.75
    for i in range(14):
        r = 180 + i * 150
        d.arc([cx - r, cy - r, cx + r, cy + r], -70, 70, fill=rgba("#60a5fa", 0.28 - i * 0.015), width=14)
    return composite(img, over, blur=3)


def m_photographers(rng):
    img = gradient("#050505", "#17120b")
    over, d = layer()
    for i in range(40):
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(40, 200)
        pts = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 7)[:-1] + 0.3]
        d.polygon(pts, fill=rgba(rng.choice(["#fcd34d", "#fde68a", "#fb923c", "#ffffff"]), rng.uniform(0.07, 0.2)))
    return composite(img, over, blur=10)


def m_automotive(rng):
    img = gradient("#0a0a0b", "#1f2023")
    img = glow(img, W * 0.5, H * 0.33, 800, "#f59e0b", 0.25)
    over, d = layer()
    vx, vy = W * 0.5, H * 0.33  # vanishing point
    d.polygon([(vx - 20, vy), (vx + 20, vy), (W * 1.3, H), (-W * 0.3, H)], fill=rgba("#2b2c30", 0.9))
    for k in range(18):
        t0 = (k / 18) ** 1.8
        t1 = ((k + 0.5) / 18) ** 1.8
        y0, y1 = vy + (H - vy) * t0, vy + (H - vy) * t1
        w0, w1 = 4 + 40 * t0, 4 + 40 * t1
        d.polygon([(vx - w0, y0), (vx + w0, y0), (vx + w1, y1), (vx - w1, y1)], fill=rgba("#f6d800", 0.55))
    for side in (-1, 1):
        d.line([(vx + side * 18, vy), (W * 0.5 + side * W * 0.72, H)], fill=rgba("#ffffff", 0.35), width=10)
    return composite(img, over, blur=1)


def m_pits(rng):
    img = gradient("#0b0d10", "#1c2230")
    img = glow(img, W * 0.6, H * 0.5, 1100, "#334155", 0.5)
    over, d = layer()
    for i in range(26):
        cx, cy = rng.uniform(0, W), rng.uniform(0, H)
        s = rng.uniform(40, 90)
        rot = rng.uniform(-0.6, 0.6)
        c = rgba("#94a3b8", 0.16)
        d.ellipse([cx - s, cy - s * 0.8, cx + s, cy + s * 0.8], fill=c)
        for k, (dx, dy) in enumerate([(-1.1, -1.3), (-0.4, -1.8), (0.4, -1.8), (1.1, -1.3)]):
            x = cx + (dx * math.cos(rot) - dy * math.sin(rot)) * s
            y = cy + (dx * math.sin(rot) + dy * math.cos(rot)) * s
            d.ellipse([x - s * 0.33, y - s * 0.42, x + s * 0.33, y + s * 0.42], fill=c)
    return composite(img, over, blur=2)


def m_pets(rng):
    img = gradient("#071a1f", "#0f2f36")
    img = glow(img, W * 0.35, H * 0.3, 1100, "#0891b2", 0.4)
    over, d = layer()
    # Scattered bones, at an angle each.
    for i in range(22):
        cx, cy = rng.uniform(0, W), rng.uniform(0, H)
        s = rng.uniform(60, 120)
        rot = rng.uniform(0, math.pi)
        c = rgba("#a5f3fc", rng.uniform(0.08, 0.15))
        ca, sa = math.cos(rot), math.sin(rot)
        x0, y0, x1, y1 = cx - ca * s, cy - sa * s, cx + ca * s, cy + sa * s
        d.line([(x0, y0), (x1, y1)], fill=c, width=int(s * 0.35))
        for (bx, by) in ((x0, y0), (x1, y1)):
            for k in (-1, 1):
                ox, oy = -sa * s * 0.22 * k, ca * s * 0.22 * k
                r = s * 0.24
                d.ellipse([bx + ox - r, by + oy - r, bx + ox + r, by + oy + r], fill=c)
    return composite(img, over, blur=3)


def m_models(rng):
    img = gradient("#050505", "#15110a")
    over, d = layer()
    for i in range(9):
        x = W * (0.08 + i * 0.105)
        top_w = rng.uniform(10, 30)
        d.polygon([(x - top_w, 0), (x + top_w, 0), (x + 220, H), (x - 220, H)], fill=rgba("#fcd34d", rng.uniform(0.04, 0.09)))
    img = glow(img, W * 0.5, H * 0.08, 900, "#b45309", 0.35)
    return composite(img, over, blur=18)


def m_meats(rng):
    img = gradient("#140604", "#2d0c07")
    img = glow(img, W * 0.8, H * 0.15, 900, "#9a3412", 0.45)
    over, d = layer()
    for band in range(4):
        y = H * (0.45 + band * 0.14)
        pts = sine_path(y, 90, 2600, band) + [(W + 100, H), (-100, H)]
        d.polygon(pts, fill=rgba("#1a0703", 0.35))
        for x in range(-40, W + 80, 260):
            yy = y + 90 * math.sin((x / 2600) * 2 * math.pi + band) - 170
            d.rectangle([x, yy, x + 22, yy + 190], fill=rgba("#fdba74", 0.14))
        for off in (-120, -50):
            rail = [(x, y + 90 * math.sin((x / 2600) * 2 * math.pi + band) + off) for x in range(-100, W + 100, 20)]
            curve(d, rail, rgba("#fdba74", 0.12), 9)
    return composite(img, over, blur=2)


def m_gyms(rng):
    img = gradient("#0c0c0e", "#241214")
    img = glow(img, W * 0.2, H * 0.8, 1200, "#b91c1c", 0.4)
    over, d = layer()
    for i in range(-6, 16):
        x = i * 200
        d.polygon([(x, 0), (x + 70, 0), (x + 70 + H * 0.45, H), (x + H * 0.45, H)], fill=rgba("#ef4444" if i % 3 else "#f6d800", 0.1))
    return composite(img, over, blur=3)


def m_barbershops(rng):
    img = gradient("#060a18", "#0f1a3d")
    over, d = layer()
    colors = ["#dc2626", "#f8fafc", "#2563eb", "#f8fafc"]
    for i in range(-20, 30):
        x = i * 120
        d.polygon([(x, 0), (x + 60, 0), (x + 60 - H * 0.5, H), (x - H * 0.5, H)], fill=rgba(colors[i % 4], 0.09))
    img = glow(img, W * 0.5, H * 0.5, 1300, "#0b1224", 0.6)
    return composite(img, over, blur=4)


def m_salons(rng):
    img = gradient("#170611", "#3a0d2a")
    img = glow(img, W * 0.75, H * 0.3, 1100, "#be185d", 0.45)
    over, d = layer()
    for i in range(45):
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(30, 190)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=rgba(rng.choice(["#f9a8d4", "#fbcfe8", "#f0abfc", "#fda4af"]), rng.uniform(0.06, 0.16)))
    return composite(img, over, blur=14)


def m_whips(rng):
    # Tail lights streaking past at night: long red and amber trails.
    img = gradient("#05050a", "#140812")
    img = glow(img, W * 0.5, H * 0.62, 900, "#7f1d1d", 0.4)
    over, d = layer()
    for i in range(16):
        y = H * rng.uniform(0.35, 0.9)
        x0 = rng.uniform(-W * 0.3, W * 0.4)
        length = rng.uniform(W * 0.6, W * 1.4)
        c = rng.choice(["#ef4444", "#f97316", "#dc2626", "#fbbf24"])
        d.line([(x0, y), (x0 + length, y - length * 0.18)], fill=rgba(c, rng.uniform(0.25, 0.5)), width=int(rng.uniform(6, 16)))
    return composite(img, over, blur=5)


def m_sweets(rng):
    img = gradient("#1a0614", "#3b0b2c")
    img = glow(img, W * 0.7, H * 0.25, 1000, "#db2777", 0.45)
    over, d = layer()
    colors = ["#f9a8d4", "#fde68a", "#a5f3fc", "#c4b5fd", "#fdba74"]
    for i in range(140):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        a = rng.uniform(0, math.pi)
        L, w = rng.uniform(20, 46), 12
        d.line([(x - L * math.cos(a), y - L * math.sin(a)), (x + L * math.cos(a), y + L * math.sin(a))], fill=rgba(rng.choice(colors), 0.32), width=w)
    return composite(img, over, blur=1)


def m_ayce(rng):
    img = gradient("#0d0806", "#2a1306")
    img = glow(img, W * 0.5, H * 0.45, 1100, "#b45309", 0.4)
    over, d = layer()
    step = 330
    for row in range(-1, H // step + 2):
        for col in range(-1, W // step + 2):
            cx = col * step + (step // 2 if row % 2 else 0)
            cy = row * step
            d.ellipse([cx - 120, cy - 120, cx + 120, cy + 120], outline=rgba("#fde68a", 0.16), width=8)
            d.ellipse([cx - 80, cy - 80, cx + 80, cy + 80], outline=rgba("#fde68a", 0.09), width=4)
    return composite(img, over, blur=2)


def m_foodtrucks(rng):
    img = gradient("#0a0f1a", "#1e293b")
    img = glow(img, W * 0.5, H * 0.15, 1000, "#ca8a04", 0.35)
    over, d = layer()
    # A striped awning across the top and string lights below it.
    for i in range(0, W + 160, 160):
        d.polygon([(i, 0), (i + 80, 0), (i + 80, 360), (i, 360)], fill=rgba("#f6d800", 0.16))
        d.pieslice([i, 290, i + 160, 450], 0, 180, fill=rgba("#f6d800" if (i // 160) % 2 == 0 else "#ffffff", 0.14))
    for row in range(3):
        y0 = 620 + row * 520
        pts = [(x, y0 + 90 * math.sin(x / W * math.pi)) for x in range(-40, W + 40, 20)]
        curve(d, pts, rgba("#fef3c7", 0.12), 4)
        for x in range(30, W, 110):
            y = y0 + 90 * math.sin(x / W * math.pi)
            d.ellipse([x - 14, y + 6, x + 14, y + 34], fill=rgba("#fde68a", 0.35))
    return composite(img, over, blur=3)


def m_coffee(rng):
    img = gradient("#0c0705", "#2b170c")
    img = glow(img, W * 0.3, H * 0.7, 1100, "#92400e", 0.45)
    over, d = layer()
    for i in range(14):
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(120, 260)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=rgba("#d6a76c", 0.16), width=int(rng.uniform(10, 22)))
    for i in range(6):
        x0 = W * (0.1 + i * 0.16)
        pts = [(x0 + 50 * math.sin(y / 220 + i), y) for y in range(H, int(H * 0.2), -12)]
        curve(d, pts, rgba("#fef3c7", 0.08), 22)
    return composite(img, over, blur=6)


def m_bakery(rng):
    # Glenn, 2026-10-11: "add a New category for BEASTY • Bakery". Oven light from
    # below, loaves scored across the top, flour dusting the dark.
    img = gradient("#120a04", "#2e1a08")
    img = glow(img, W * 0.5, H * 0.95, 1300, "#c2410c", 0.5)
    over, d = layer()
    for i in range(16):
        cx, cy = rng.uniform(80, W - 80), rng.uniform(0, H)
        rx, ry = rng.uniform(150, 240), rng.uniform(70, 110)
        tilt = rng.uniform(-0.3, 0.3)
        pts = [(cx + rx * math.cos(t) * math.cos(tilt) - ry * math.sin(t) * math.sin(tilt),
                cy + rx * math.cos(t) * math.sin(tilt) + ry * math.sin(t) * math.cos(tilt))
               for t in np.linspace(0, 2 * math.pi, 48)]
        d.polygon(pts, outline=rgba("#f5c27a", 0.18), width=10)
        for k in (-1, 0, 1):
            sx = cx + k * rx * 0.42
            d.line([(sx - 40 * math.cos(tilt + 0.9), cy - 40 * math.sin(tilt + 0.9) + k * rx * 0.42 * math.sin(tilt)),
                    (sx + 40 * math.cos(tilt + 0.9), cy + 40 * math.sin(tilt + 0.9) + k * rx * 0.42 * math.sin(tilt))],
                   fill=rgba("#fde7c2", 0.14), width=7)
    for i in range(420):
        x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(2, 5)
        d.ellipse([x - r, y - r, x + r, y + r], fill=rgba("#fff7ed", 0.18))
    return composite(img, over, blur=3)


def m_podcast(rng):
    # Glenn, 2026-10-12: "BEASTY • PODCAST". A studio mic in red light, its sound
    # rings spreading out, and the level bars of a recording along the bottom.
    img = gradient("#0b0610", "#1f0b1a")
    img = glow(img, W * 0.5, H * 0.4, 1100, "#be123c", 0.42)
    over, d = layer()
    cx, cy = W * 0.5, H * 0.4
    for k in range(1, 9):
        r = 180 + k * 120
        d.arc([cx - r, cy - r, cx + r, cy + r], 200, 340, fill=rgba("#fda4af", 0.16 - k * 0.012), width=10)
        d.arc([cx - r, cy - r, cx + r, cy + r], 20, 160, fill=rgba("#fda4af", 0.16 - k * 0.012), width=10)
    d.rounded_rectangle([cx - 110, cy - 260, cx + 110, cy + 120], radius=110, outline=rgba("#fecdd3", 0.3), width=14)
    for y in range(int(cy - 200), int(cy + 80), 46):
        d.line([(cx - 80, y), (cx + 80, y)], fill=rgba("#fecdd3", 0.12), width=6)
    d.line([(cx, cy + 120), (cx, cy + 300)], fill=rgba("#fecdd3", 0.3), width=14)
    d.line([(cx - 130, cy + 300), (cx + 130, cy + 300)], fill=rgba("#fecdd3", 0.3), width=14)
    for i, x in enumerate(range(40, W, 36)):
        h = 60 + 220 * abs(math.sin(i * 0.45)) * rng.uniform(0.5, 1)
        d.rounded_rectangle([x, H - 260 - h, x + 18, H - 260], radius=9, fill=rgba("#fb7185", 0.2))
    return composite(img, over, blur=3)


def m_juice(rng):
    # Glenn, 2026-10-14: "New category BEASTY • Juice", with Go Fresh. Citrus slices
    # drifting in green and orange light, and a tall cup with its straw.
    img = gradient("#04110a", "#0d1f0a")
    img = glow(img, W * 0.45, H * 0.38, 1100, "#16a34a", 0.36)
    img = glow(img, W * 0.7, H * 0.7, 800, "#f97316", 0.22)
    over, d = layer()
    for _ in range(14):
        cx, cy, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(70, 170)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=rgba("#fdba74", 0.16), width=10)
        for k in range(8):
            a = k * math.pi / 4
            d.line([(cx, cy), (cx + r * 0.85 * math.cos(a), cy + r * 0.85 * math.sin(a))], fill=rgba("#fdba74", 0.1), width=6)
    cx, cy = W * 0.5, H * 0.42
    d.polygon([(cx - 220, cy - 300), (cx + 220, cy - 300), (cx + 170, cy + 320), (cx - 170, cy + 320)], outline=rgba("#bbf7d0", 0.3), width=14)
    d.line([(cx - 205, cy - 120), (cx + 205, cy - 120)], fill=rgba("#bbf7d0", 0.2), width=10)
    d.line([(cx + 40, cy - 300), (cx + 140, cy - 560), (cx + 260, cy - 560)], fill=rgba("#bbf7d0", 0.3), width=16)
    return composite(img, over, blur=3)


def m_bars(rng):
    # Glenn, 2026-10-14: "New Category BEASTY • Bar/lounge", with J&A Lounge. A coupe
    # glass in amber light over a row of bottles, the bokeh of a dim room behind.
    img = gradient("#0c0704", "#1c0f05")
    img = glow(img, W * 0.5, H * 0.4, 1100, "#b45309", 0.4)
    over, d = layer()
    for _ in range(40):
        x, y, r = rng.uniform(0, W), rng.uniform(0, H * 0.7), rng.uniform(20, 70)
        d.ellipse([x - r, y - r, x + r, y + r], fill=rgba("#fcd34d", rng.uniform(0.03, 0.08)))
    cx, cy = W * 0.5, H * 0.38
    d.polygon([(cx - 300, cy - 200), (cx + 300, cy - 200), (cx, cy + 120)], outline=rgba("#fde68a", 0.32), width=14)
    d.line([(cx - 230, cy - 120), (cx + 230, cy - 120)], fill=rgba("#fde68a", 0.18), width=10)
    d.line([(cx, cy + 120), (cx, cy + 480)], fill=rgba("#fde68a", 0.32), width=14)
    d.line([(cx - 180, cy + 480), (cx + 180, cy + 480)], fill=rgba("#fde68a", 0.32), width=14)
    base = H - 300
    x = 60
    while x < W - 60:
        w, h = rng.uniform(70, 110), rng.uniform(260, 460)
        d.rounded_rectangle([x, base - h, x + w, base], radius=18, outline=rgba("#fbbf24", 0.16), width=8)
        d.rectangle([x + w * 0.35, base - h - 90, x + w * 0.65, base - h], outline=rgba("#fbbf24", 0.16), width=8)
        x += w + rng.uniform(30, 60)
    d.line([(0, base + 8), (W, base + 8)], fill=rgba("#fbbf24", 0.2), width=10)
    return composite(img, over, blur=3)


def m_events(rng):
    # Glenn, 2026-10-14: "New Category BEASTY • Events". Confetti and string lights
    # over a night sky in violet, the way a party looks from across the room.
    img = gradient("#08051a", "#1a0b2e")
    img = glow(img, W * 0.5, H * 0.35, 1100, "#7c3aed", 0.38)
    img = glow(img, W * 0.25, H * 0.75, 700, "#db2777", 0.2)
    over, d = layer()
    for row in range(3):
        y0 = 260 + row * 420
        pts = [(x, y0 + 120 * math.sin(x / W * math.pi)) for x in range(-40, W + 60, 40)]
        d.line(pts, fill=rgba("#e9d5ff", 0.14), width=6)
        for i in range(2, len(pts), 3):
            x, y = pts[i]
            d.ellipse([x - 16, y + 6, x + 16, y + 38], fill=rgba("#fde68a", 0.22))
    cols = ["#f9a8d4", "#fde68a", "#a5f3fc", "#c4b5fd", "#86efac"]
    for _ in range(170):
        x, y = rng.uniform(0, W), rng.uniform(H * 0.25, H)
        w, h, a = rng.uniform(14, 34), rng.uniform(6, 14), rng.uniform(0, math.pi)
        c, s = math.cos(a), math.sin(a)
        pts = [(x + dx * c - dy * s, y + dx * s + dy * c) for dx, dy in ((-w, -h), (w, -h), (w, h), (-w, h))]
        d.polygon(pts, fill=rgba(rng.choice(cols), rng.uniform(0.1, 0.22)))
    return composite(img, over, blur=2)


def m_youth(rng):
    # Glenn, 2026-10-15: "New category BEASTY • Youth", with a picture of two kids,
    # arms up. Two of them here in sky-blue light, a ball and chalk stars around them.
    img = gradient("#03101c", "#071a2e")
    img = glow(img, W * 0.5, H * 0.4, 1100, "#0284c7", 0.4)
    over, d = layer()
    for cx in (W * 0.33, W * 0.67):
        cy = H * 0.36
        d.ellipse([cx - 90, cy - 330, cx + 90, cy - 150], outline=rgba("#bae6fd", 0.32), width=16)
        d.line([(cx, cy - 150), (cx, cy + 150)], fill=rgba("#bae6fd", 0.32), width=18)
        d.line([(cx - 200, cy - 280), (cx, cy - 60), (cx + 200, cy - 280)], fill=rgba("#bae6fd", 0.32), width=18, joint="curve")
        d.line([(cx - 120, cy + 420), (cx, cy + 150), (cx + 120, cy + 420)], fill=rgba("#bae6fd", 0.32), width=18, joint="curve")
    bx, by = W * 0.5, H * 0.72
    d.ellipse([bx - 120, by - 120, bx + 120, by + 120], outline=rgba("#fde68a", 0.24), width=12)
    d.arc([bx - 220, by - 120, bx + 20, by + 120], -60, 60, fill=rgba("#fde68a", 0.18), width=10)
    d.arc([bx - 20, by - 120, bx + 220, by + 120], 120, 240, fill=rgba("#fde68a", 0.18), width=10)
    for _ in range(26):
        x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(22, 48)
        pts = []
        for k in range(10):
            a = -math.pi / 2 + k * math.pi / 5
            rr = r if k % 2 == 0 else r * 0.45
            pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
        d.polygon(pts, outline=rgba("#e0f2fe", 0.14), width=5)
    return composite(img, over, blur=3)


def m_health(rng):
    img = gradient('#3b1f2b', '#1f2d3a')
    over = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for x, y, s in [(W * .5, H * .30, 1.1), (W * .25, H * .64, .75), (W * .76, H * .82, .65)]:
        r = 120 * s
        d.ellipse((x - 2 * r, y - r * 1.4, x, y + r * .6), outline=rgba('#fbcfe8', .22), width=12)
        d.ellipse((x, y - r * 1.4, x + 2 * r, y + r * .6), outline=rgba('#fbcfe8', .22), width=12)
        d.line((x, y - r * .3, x, y + r * .9), fill=rgba('#99f6e4', .3), width=12)
        d.line((x - r * .6, y + r * .3, x + r * .6, y + r * .3), fill=rgba('#99f6e4', .3), width=12)
    return composite(img, over, blur=3)


def m_games(rng):
    img = gradient('#17213e', '#211139')
    over = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for x, y, scale in [(W * .5, H * .30, 1.2), (W * .28, H * .66, .8), (W * .76, H * .83, .7)]:
        w, h = 300 * scale, 150 * scale
        d.rounded_rectangle((x-w, y-h, x+w, y+h), radius=80 * scale, outline=rgba('#a5b4fc', .24), width=12)
        d.line((x-w*.65, y, x-w*.18, y), fill=rgba('#a5b4fc', .3), width=12)
        d.line((x-w*.42, y-h*.47, x-w*.42, y+h*.47), fill=rgba('#a5b4fc', .3), width=12)
        for dx, dy in [(.35, -.25), (.65, .25)]:
            cx, cy = x+w*dx, y+h*dy
            d.ellipse((cx-16, cy-16, cx+16, cy+16), fill=rgba('#f9a8d4', .3))
    return composite(img, over, blur=3)


MOTIFS = {
    "health": m_health,
    "games": m_games,
    "tattoo": m_tattoo,
    "athletes": m_athletes,
    "ai": m_ai,
    "artists": m_artists,
    "dancers": m_dancers,
    "donations": m_donations,
    "djs": m_djs,
    "cooks": m_cooks,
    "foodies": m_foodies,
    "realtors": m_realtors,
    "media": m_media,
    "photographers": m_photographers,
    "automotive": m_automotive,
    "whips": m_whips,
    "sweets": m_sweets,
    "ayce": m_ayce,
    "foodtrucks": m_foodtrucks,
    "coffee": m_coffee,
    "bakery": m_bakery,
    "podcast": m_podcast,
    "juice": m_juice,
    "bars": m_bars,
    "events": m_events,
    "youth": m_youth,
    "pits": m_pits,
    "pets": m_pets,
    "models": m_models,
    "meats": m_meats,
    "gyms": m_gyms,
    "barbershops": m_barbershops,
    "salons": m_salons,
}


def luma(arr):
    x = arr / 255.0
    lin = np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
    return float((0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]).mean())


def finish(arr, rng):
    # Film grain, so the gradients do not band on a phone.
    noise = np.random.default_rng(rng.randint(0, 1 << 30)).normal(0, 3.2, (H, W, 1))
    arr = np.clip(arr + noise, 0, 255)
    # Pull it down until white labels read on every part of it.
    for _ in range(12):
        if luma(arr) <= MAX_LUMA:
            break
        arr = arr * 0.9
    return arr


def save(arr, name):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im.save(OUT / f"{name}.webp", "WEBP", quality=80, method=6)
    thumb(im, f"{name}-thumb")
    return im


def thumb(im, name):
    # The middle of the page, square, where the tiles sit.
    side = W
    top = int(H * 0.3)
    t = im.crop((0, top, side, top + side)).resize((THUMB, THUMB), Image.LANCZOS)
    t.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6)


def main():
    only = set(sys.argv[1:])
    for kind, fn in MOTIFS.items():
        if only and kind not in only:
            continue
        rng = random.Random(f"beasty-{kind}")
        arr = finish(fn(rng), rng)
        save(arr, f"cat-{kind}")
        print(f"cat-{kind}.webp  luma {luma(arr):.3f}  {(OUT / f'cat-{kind}.webp').stat().st_size // 1024} KB")
    if not only:
        thumb(Image.open(OUT / "san-francisco.webp").convert("RGB"), "cat-beasty-thumb")
        thumb(Image.open(OUT / "_beasty-pages.webp").convert("RGB"), "cat-yellow-thumb")
        print("cat-beasty-thumb.webp, cat-yellow-thumb.webp")


if __name__ == "__main__":
    main()
