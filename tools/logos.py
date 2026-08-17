"""Collect each business's real logo from the site the business itself publishes.

Every icon on the home screen is somebody's actual mark or it is a monogram we
drew. There is no third option here: an image model asked for "the Kabab Burger
logo" will produce something confident and wrong, and shipping that puts an
invented brand identity on a real business's page. So this only ever DOWNLOADS —
it never draws.

Where a site puts its logo, best first:

  manifest icons   a site.webmanifest often declares 512x512 — the largest
                   square mark a site publishes, and already meant to be an app
                   icon, which is exactly the job here
  apple-touch-icon 180x180 as a rule, square, designed for a home screen. The
                   single most reliable source on the open web
  <img> logo       usually the header wordmark. Frequently SVG, so effectively
                   unlimited resolution, but often wide rather than square
  og:image         a share card. Sometimes the logo, often a storefront photo,
                   so it is taken only when nothing above exists
  favicon.ico      last resort; 32px is below what any tile can use

Scoring prefers square and large. Wordmarks are kept in their own aspect and
centred on a transparent square later rather than squashed — a stretched logo
reads as a broken site, not a logo.
"""

import concurrent.futures
import gzip
import io
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

OUT = sys.argv[2] if len(sys.argv) > 2 else "/tmp/logos"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15"

"""
Platform defaults. Squarespace, Shopify, Wix and friends all serve a house
favicon when the owner never uploaded one, and a page that "has an icon" is not
the same as a page that has THEIR icon. Shipping Shopify's bag glyph as a
restaurant's logo is worse than the monogram it would replace, because it looks
deliberate.
"""
JUNK = re.compile(
    r"squarespace\.com/universal|shopify.*favicon|wix.*favicon|"
    r"godaddy|wordpress\.(?:com|org)/favicon|default[-_]?(?:logo|icon|favicon)|"
    r"placeholder|no[-_]image|sample|dummy",
    re.I,
)


def get(url, timeout=20, limit=6_000_000):
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Accept": "*/*", "Accept-Encoding": "gzip"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read(limit)
        if r.headers.get("Content-Encoding") == "gzip":
            try:
                raw = gzip.decompress(raw)
            except Exception:  # noqa: BLE001 — truncated gzip, take what decoded
                pass
        return raw, r.headers.get("Content-Type", ""), r.geturl()


def attrs(tag):
    """Parse an HTML tag's attributes without a parser dependency."""
    return {
        m.group(1).lower(): (m.group(2) or m.group(3) or m.group(4) or "")
        for m in re.finditer(
            r"""([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", tag
        )
    }


def biggest(sizes):
    """'16x16 32x32 180x180' -> 180. 'any' (an SVG) sorts above every raster."""
    if not sizes:
        return 0
    if "any" in sizes.lower():
        return 1024
    got = [int(n) for n in re.findall(r"(\d+)x\d+", sizes)]
    return max(got) if got else 0


def candidates(site):
    """Every plausible logo URL on this site, each with a score and a reason."""
    html, ctype, final = get(site)
    if "html" not in ctype and b"<" not in html[:400]:
        return [], final
    doc = html.decode("utf-8", "replace")
    head = doc[:200_000]
    out = []

    def add(url, score, why, hint=0):
        if not url or url.startswith("data:"):
            return
        full = urllib.parse.urljoin(final, url.strip())
        if not full.startswith("http") or JUNK.search(full):
            return
        out.append({"url": full, "score": score, "why": why, "hint": hint})

    # --- web manifest: the only place a site declares a 512px app icon --------
    for m in re.finditer(r"<link\b[^>]*>", head, re.I):
        a = attrs(m.group(0))
        rel = a.get("rel", "").lower()
        if "manifest" in rel and a.get("href"):
            try:
                raw, _, murl = get(urllib.parse.urljoin(final, a["href"]), timeout=12)
                for icon in json.loads(raw).get("icons", []):
                    px = biggest(icon.get("sizes", ""))
                    if px >= 128:
                        add(urllib.parse.urljoin(murl, icon.get("src", "")), 900 + px, f"manifest {px}px", px)
            except Exception:  # noqa: BLE001 — no manifest is the normal case
                pass

    # --- declared icons ------------------------------------------------------
    for m in re.finditer(r"<link\b[^>]*>", head, re.I):
        a = attrs(m.group(0))
        rel, href = a.get("rel", "").lower(), a.get("href", "")
        px = biggest(a.get("sizes", ""))
        if "apple-touch-icon" in rel:
            add(href, 800 + px, f"apple-touch-icon {px or '?'}", px)
        elif "icon" in rel and "mask" not in rel:
            add(href, 400 + px, f"link icon {px or '?'}", px)

    # --- an <img> that calls itself a logo -----------------------------------
    for m in re.finditer(r"<img\b[^>]*>", doc[:400_000], re.I):
        a = attrs(m.group(0))
        blob = " ".join([a.get("src", ""), a.get("alt", ""), a.get("class", ""), a.get("id", "")])
        if not re.search(r"logo|brand[-_]?mark|wordmark", blob, re.I):
            continue
        src = a.get("src") or a.get("data-src") or ""
        """
        Lazy-loading themes park a 1px spacer in src and the real file in
        srcset. Taking src blindly downloads a transparent pixel that passes
        every 'did it download' check and fails only when someone looks at it.
        """
        if a.get("srcset"):
            best, bestw = None, 0
            for part in a["srcset"].split(","):
                bits = part.strip().split()
                if not bits:
                    continue
                w = int(re.sub(r"\D", "", bits[-1]) or 0) if len(bits) > 1 else 1
                if w >= bestw:
                    best, bestw = bits[0], w
            src = best or src
        add(src, 600, "img[logo]")

    # --- share card, then the ancient fallback -------------------------------
    for prop in ("og:image", "twitter:image"):
        m = re.search(
            r'<meta\b[^>]*(?:property|name)\s*=\s*["\']%s["\'][^>]*>' % re.escape(prop), head, re.I
        )
        if m:
            add(attrs(m.group(0)).get("content", ""), 300, prop)
    add(urllib.parse.urljoin(final, "/favicon.ico"), 100, "favicon.ico")

    seen, uniq = set(), []
    for c in sorted(out, key=lambda c: -c["score"]):
        if c["url"] not in seen:
            seen.add(c["url"])
            uniq.append(c)
    return uniq, final


def probe(target):
    slug, site = target["slug"], target["site"]
    try:
        cands, final = candidates(site)
    except Exception as e:  # noqa: BLE001 — dead domains are a finding, not a crash
        return {"slug": slug, "site": site, "error": f"{type(e).__name__}: {e}"[:120]}

    got = []
    for c in cands[:8]:
        try:
            raw, ctype, _ = get(c["url"], timeout=15)
        except Exception:
            continue
        if len(raw) < 300:
            continue
        path = os.path.join(OUT, f"{slug}__{len(got)}")
        with open(path, "wb") as f:
            f.write(raw)
        got.append({**c, "file": path, "bytes": len(raw), "ctype": ctype.split(";")[0]})
        if len(got) >= 5:
            break
    return {"slug": slug, "site": site, "final": final, "cands": got}


def main():
    targets = json.load(open(sys.argv[1]))
    os.makedirs(OUT, exist_ok=True)
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for r in pool.map(probe, targets):
            results.append(r)
            if r.get("error"):
                print(f"  --  {r['slug']:26} {r['error']}")
            else:
                n = len(r["cands"])
                top = r["cands"][0]["why"] if n else "nothing"
                print(f"  {'ok' if n else '--'}  {r['slug']:26} {n} candidate(s), best: {top}")
    json.dump(results, open(os.path.join(OUT, "probe.json"), "w"), indent=1)
    print(f"\n{sum(1 for r in results if r.get('cands'))}/{len(targets)} sites yielded something")


if __name__ == "__main__":
    main()
