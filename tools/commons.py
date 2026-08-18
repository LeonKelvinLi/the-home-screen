"""Find a licensed landmark photograph on Wikimedia Commons.

Used for the cities the operator did NOT send a link for. His own links go
through tools/wallpapers.mjs untouched — that instruction stands — but where he
says "choose any wallpaper you see fit", the choice has to be one that can
actually ship in a commercial product.

EVERY FIELD BELOW IS READ FROM THE API, never from memory. A previous wallpaper
was credited to the wrong photographer under the wrong licence because the
attribution was written from recall; the artist was MARELBU and the licence was
CC BY, not what had been typed. So the licence, the author and the URL all come
from `extmetadata` on the file itself, and anything whose licence does not
permit commercial use with attribution is dropped before it is ever offered.

    python3 tools/commons.py "Marin County Civic Center" [n]
"""

import json
import re
import sys
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "BeastyPages-wallpapers/1.0 (contact via repo owner)"

"""
Licences that permit commercial use with attribution. Anything else — the
non-commercial variants, the no-derivatives ones, "fair use" — cannot ship,
and a crop is a derivative so ND is out even for a wallpaper.
"""
OK = re.compile(r"^(cc0|cc[- ]by([- ]sa)?([- ]\d(\.\d)?)?|public domain|pd([- ]|$))", re.I)
BAD = re.compile(r"\bnc\b|noncommercial|\bnd\b|noderiv|fair use", re.I)


def get(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def strip(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


def search(term, limit=14):
    data = get(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": f"{term} filetype:bitmap",
            "gsrnamespace": "6",
            "gsrlimit": str(limit),
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata",
        }
    )
    out = []
    for page in (data.get("query", {}).get("pages") or {}).values():
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {}) or {}
        lic = strip(meta.get("LicenseShortName", {}).get("value", ""))
        author = strip(meta.get("Artist", {}).get("value", ""))
        w, h = info.get("width", 0), info.get("height", 0)
        if not w or not h:
            continue
        if BAD.search(lic) or not OK.match(lic):
            continue
        """
        A phone wallpaper is 1320x2868 — very tall. A landscape source has to
        be wide enough that a portrait slice out of its middle is still real
        pixels rather than an upscale of a postage stamp.
        """
        if min(w, h) < 700:
            continue
        out.append(
            {
                "title": page["title"],
                "url": info.get("url"),
                "w": w,
                "h": h,
                "license": lic,
                "author": author[:90],
                "page": info.get("descriptionurl"),
            }
        )
    # Biggest first — more to crop from.
    return sorted(out, key=lambda r: -(r["w"] * r["h"]))


if __name__ == "__main__":
    rows = search(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 14)
    if not rows:
        print("  no commercially usable file found")
    for r in rows[:8]:
        print(f"  {r['w']}x{r['h']:<6} {r['license']:<16} {r['author'][:40]:<40} {r['title'][:60]}")
        print(f"      {r['url']}")
