#!/usr/bin/env python3
"""Contact sheet of a business's own site pictures, numbered, for picking a photo strip.
    python3 tools/menu-sheet.py <id> [out-dir]     -> <out-dir>/sheet_<id>.jpg"""
import json, sys, os, subprocess, io
from PIL import Image, ImageDraw
id = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else '.'
d = json.load(open(f'research/menus/cand/{id}.json'))
imgs = [i for i in d['images'] if i['w'] >= 400 and i['h'] >= 300 and not any(k in (i.get('alt','') + i['src']).lower() for k in ('logo','avatar','icon','map','instagram','facebook','arrow','badge'))]
seen = set(); picks = []
for i in imgs:
    key = i['src'].split('?')[0]
    if key in seen: continue
    seen.add(key); picks.append(i)
picks = picks[:16]
tiles = []
for n, i in enumerate(picks):
    try:
        raw = subprocess.run(['/usr/bin/curl', '-sL', '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0 Safari/537.36', '--max-time', '25', i['src']], capture_output=True).stdout
        im = Image.open(io.BytesIO(raw)).convert('RGB')
    except Exception:
        continue
    im.thumbnail((300, 300)); t = Image.new('RGB', (300, 320), 'white'); t.paste(im, ((300 - im.width) // 2, 0))
    ImageDraw.Draw(t).text((4, 302), f"{n}  {i.get('alt','')[:40]}", fill='black'); tiles.append((n, t))
if not tiles: print(id, 'no usable images'); sys.exit(0)
cols = 4; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 304, rows * 324), '#ddd')
for k, (n, t) in enumerate(tiles): sheet.paste(t, ((k % cols) * 304, (k // cols) * 324))
sheet.save(f'{out}/sheet_{id}.jpg', quality=80)
json.dump([{'n': n, 'src': i['src'], 'alt': i.get('alt',''), 'page': i.get('page','')} for n, i in enumerate(picks)], open(f'{out}/picks_{id}.json', 'w'))
print(id, len(tiles), 'tiles')
