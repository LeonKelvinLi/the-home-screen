#!/usr/bin/env python3
"""
Cut one of a business's OWN dish photos into the two files the menu reads:
  public/food/<key>.webp      256x256, the menu-row thumbnail
  public/food/<key>-lg.webp   720x720, the item sheet hero

    python3 tools/food-photo.py <url-or-path> <key> [--crop x0,y0,x1,y1]

Square centre crop by default. Exits 2 when the source is too small to be
worth showing (under 200px on a side) so a caller can skip it cleanly.
"""
import sys, io, os, urllib.request
from PIL import Image, ImageOps

src, key = sys.argv[1], sys.argv[2]
crop = None
if '--crop' in sys.argv:
    crop = [float(x) for x in sys.argv[sys.argv.index('--crop') + 1].split(',')]
if src.startswith('http'):
    req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36', 'Accept': 'image/avif,image/webp,image/*,*/*'})
    data = urllib.request.urlopen(req, timeout=40).read()
    im = Image.open(io.BytesIO(data))
else:
    im = Image.open(src)
im = ImageOps.exif_transpose(im)
if im.mode in ('P', 'LA', 'RGBA'):
    bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im.convert('RGBA'), mask=im.convert('RGBA').split()[-1]); im = bg
else:
    im = im.convert('RGB')
w, h = im.size
if min(w, h) < 200:
    print(f'too small: {w}x{h}', file=sys.stderr); sys.exit(2)
if crop:
    x0, y0, x1, y1 = crop
    if x1 <= 1 and y1 <= 1: x0, y0, x1, y1 = x0 * w, y0 * h, x1 * w, y1 * h
    im = im.crop((int(x0), int(y0), int(x1), int(y1))); w, h = im.size
side = min(w, h)
im = im.crop(((w - side) // 2, (h - side) // 2, (w - side) // 2 + side, (h - side) // 2 + side))
os.makedirs('public/food', exist_ok=True)
im.resize((720, 720), Image.LANCZOS).save(f'public/food/{key}-lg.webp', 'WEBP', quality=82, method=6)
im.resize((256, 256), Image.LANCZOS).save(f'public/food/{key}.webp', 'WEBP', quality=82, method=6)
print(f'{key}: {w}x{h} -> 256 + 720')
