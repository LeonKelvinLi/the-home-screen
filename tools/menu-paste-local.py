#!/usr/bin/env python3
"""Write an accepted menu into a hand-written seed in src/data/localBrands.ts as `sections`.
    python3 tools/menu-paste-local.py <slug> <id>
Idempotent: a previous sections block and the stale `offer` list are replaced."""
import json, re, sys
slug, id = sys.argv[1], sys.argv[2]
p = 'src/data/localBrands.ts'; s = open(p).read()
def find_array(s, start):
    i = s.index('[', start); depth = 0; j = i; instr = None
    while j < len(s):
        c = s[j]
        if instr:
            if c == '\\': j += 2; continue
            if c == instr: instr = None
        elif c in "'\"`": instr = c
        elif c == '[': depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0: return i, j + 1
        j += 1
    raise ValueError
d = json.load(open(f'research/menus/accepted/{id}.json'))
secs = {}
for i in d['items']: secs.setdefault(i.get('section') or 'Menu', []).append(i)
def tup(i):
    t = [i['name'], i['desc'], i['cents']]
    if i.get('label'): t += [i.get('photo') or None, i['label']]
    elif i.get('photo'): t.append(i['photo'])
    return json.dumps(t, ensure_ascii=False)
block = '' if not d['items'] else '    items: [],\n    /* Their whole published menu, read from ' + d['pages'][0] + ' on 2026-09-04 with their own photos; sections as they publish them. */\n    sections: [\n' + ''.join(f"      {{ name: {json.dumps(n, ensure_ascii=False)}, items: [\n" + ''.join(f"        {tup(i)},\n" for i in arr) + "      ] },\n" for n, arr in secs.items()) + '    ],'
start = s.index(f"slug: '{slug}'"); end = s.index('\n  },\n', start); seg = s[start:end]
for key in (('offer', 'sections', 'groups') if d['items'] else ()):
    m = re.search(r'\n\s*' + key + r': \[', seg)
    if m:
        a, b = find_array(seg, m.start()); rest = seg[b:]; rest = rest[1:] if rest.startswith(',') else rest
        seg = seg[:m.start()] + rest
# A full menu retires the stand-ins that were written for its absence: the
# quoted price list's sentence, the "nothing published" paragraph, and the
# "a few of theirs" bar over four items.
for key in (('quoteOnly', 'contactOnly', 'menuNote') if d['items'] else ()):
    m = re.search(r'\n    ' + key + r':', seg)
    if m:
        rest = seg[m.end():]
        e = re.search(r'\n(    [a-zA-Z]+\??:|    /\*|    //)', rest)
        seg = seg[:m.start()] + (rest[e.start():] if e else '')
seg = re.sub(r'\n\s*/\* Their whole published menu[^\n]*\n', '\n', seg)
if d['items']:
    m = re.search(r'\n(\s*)items: \[', seg); a, b = find_array(seg, m.start()); rest = seg[b:]; rest = rest[1:] if rest.startswith(',') else rest
    seg = seg[:m.start() + 1] + block + rest
if d.get('photos'):
    m2 = re.search(r'\n\s*photos: \[', seg)
    if m2:
        a, b = find_array(seg, m2.start()); rest2 = seg[b:]; rest2 = rest2[1:] if rest2.startswith(',') else rest2
        seg = seg[:m2.start()] + rest2
    ph = '    photos: [\n' + ''.join(f"      {{ src: '/food/{x['photo']}-lg.webp', alt: {json.dumps(x.get('alt',''), ensure_ascii=False)}, credit: {json.dumps(x.get('credit',''), ensure_ascii=False)} }},\n" for x in d['photos']) + '    ],'
    m3 = re.search(r'\n    sections: \[', seg) or re.search(r'\n    groups: \[', seg) or re.search(r'\n    items: \[', seg)
    a3, b3 = find_array(seg, m3.start()); rest3 = seg[b3:]; rest3 = rest3[1:] if rest3.startswith(',') else rest3
    seg = seg[:b3] + ',\n' + ph + rest3
s = s[:start] + seg + s[end:]
open(p, 'w').write(s)
print(slug, sum(len(v) for v in secs.values()), 'items', list(secs))
