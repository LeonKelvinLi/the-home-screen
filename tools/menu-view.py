#!/usr/bin/env python3
"""Compact view of a candidate menu: python3 tools/menu-view.py <id> [n-per-section] [--alt text]"""
import json, sys
id = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 6
d = json.load(open(f'research/menus/cand/{id}.json'))
items = d['items']
if '--alt' in sys.argv: items = d['alts'][sys.argv[sys.argv.index('--alt') + 1]]
print(f"== {id} [{d['source']}] {len(items)} items  alt={d.get('alt')}")
for p in d['pages'][:6]: print('   ', p[:110])
secs = {}
for it in items: secs.setdefault(it.get('section') or '', []).append(it)
for s, arr in secs.items():
    print(f"  -- {s or '(no section)'} ({len(arr)}, {sum(1 for i in arr if i.get('image'))} img)")
    for it in arr[:n]: print(f"     {'*' if it.get('image') else ' '} {it['name'][:46]:46} {it['cents']/100:7.2f} {('['+it['label']+']') if it.get('label') else ''} {it['desc'][:60]}")
    if len(arr) > n: print(f"     ... {len(arr)-n} more")
print(f"  site images: {len(d['images'])}; alts: {[i['alt'][:30] for i in d['images'] if i['alt']][:12]}")
