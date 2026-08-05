#!/usr/bin/env python3
"""
Generate the Share & Scan code.

    /usr/bin/python3 tools/qr.py [url]

Baked at build time rather than generated in the browser, for two reasons:

1. The code has to point at the LIVE site. A code generated from
   window.location would encode localhost during development and whatever
   staging host it happened to be served from — useless the moment anyone
   points a camera at it.
2. No runtime dependency and nothing for the CSP to allow. It is one SVG.

Error correction H (~30% recoverable) because the app draws Biggie over the
middle. Anything less and the mark eats the data.

RUN THIS AGAIN IF THE DOMAIN CHANGES. The URL is baked in; nothing detects a
move on its own.
"""

import sys
from pathlib import Path

import segno

URL = sys.argv[1] if len(sys.argv) > 1 else "https://the-home-screen.onrender.com"
OUT = Path(__file__).resolve().parent.parent / "public" / "qr.svg"

code = segno.make(URL, error="h")

# border=0: the quiet zone is drawn by the app's own white card, which gives it
# more clear space than the spec's four modules rather than less.
code.save(
    str(OUT),
    kind="svg",
    scale=1,
    border=0,
    dark="#141414",
    light=None,          # transparent, so the card behind it shows through
    svgclass=None,
    lineclass=None,
    omitsize=True,       # no width/height, so CSS can size it freely
)

size = code.symbol_size(scale=1, border=0)[0]
print(f"{OUT.name}: {URL}")
print(f"  version {code.version}, ecc {code.error.upper()}, {size}x{size} modules")
