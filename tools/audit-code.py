"""Code audit. The things that rot rather than break.

There is no linter in this project, so nothing has ever swept for the faults
that do not fail a build: a file nobody imports any more, an export nobody
reads, a `!` that will throw the day the data changes, a console.log left in
front of a customer, a CSS class that survived the component it was written for.

None of it stops the app today. All of it is why a codebase gets slower to
change, and this one is changing several times a day.

    python3 tools/audit-code.py
"""

import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

findings = []


def add(level, what):
    findings.append((level, what))


def rel(p):
    return os.path.relpath(p, ROOT)


# ---- gather ---------------------------------------------------------------
files = {}
for base, _, names in os.walk(SRC):
    for n in names:
        if n.endswith((".ts", ".tsx")):
            p = os.path.join(base, n)
            files[p] = open(p).read()

server = os.path.join(ROOT, "server")
if os.path.isdir(server):
    for base, _, names in os.walk(server):
        for n in names:
            if n.endswith(".ts"):
                p = os.path.join(base, n)
                files[p] = open(p).read()

all_src = "\n".join(files.values())

# ---- 1. files nobody imports ----------------------------------------------
"""
Resolved by MODULE NAME rather than by path, because the imports here are a mix
of relative depths — '../data/brands' and './brands' name the same file — and
matching on the tail is what makes the two comparable.
"""
imported = set()
for src in files.values():
    # A lazy import() counts. The kitchen screen is loaded only on /kitchen, by
    # main.tsx's `lazy(() => import('./apps/KitchenScreen'))`, and was reported
    # dead on the day it was written because only `from '...'` was read.
    for m in re.finditer(r"""(?:from\s+|import\(\s*)['"]([^'"]+)['"]""", src):
        spec = m.group(1)
        if spec.startswith("."):
            imported.add(os.path.basename(spec))

# vite-env.d.ts is an ambient declaration: TypeScript reads it, nothing
# imports it, and that is what a .d.ts IS. Matched on the full name because the
# double extension makes its stem "vite-env.d".
ENTRY = {"main", "App", "Shell", "vite-env", "vite-env.d"}
for p in sorted(files):
    stem = os.path.basename(p).rsplit(".", 1)[0]
    if stem in ENTRY or "/server/" in p.replace(os.sep, "/"):
        continue
    if stem not in imported:
        add("WARN", f"{rel(p)} is never imported — dead file?")

# ---- 2. exports nobody reads ----------------------------------------------
exports = {}
for p, src in files.items():
    for m in re.finditer(r"^export (?:const|function|class|interface|type) (\w+)", src, re.M):
        exports.setdefault(m.group(1), []).append(p)

for name, where in sorted(exports.items()):
    if len(where) > 1:
        add("WARN", f"`{name}` is exported from {len(where)} files: {', '.join(rel(w) for w in where)}")
        continue
    # Used anywhere other than its own declaration?
    uses = len(re.findall(rf"\b{re.escape(name)}\b", all_src))
    if uses <= 1:
        add("NOTE", f"`{name}` in {rel(where[0])} is exported but never used")

# ---- 3. assertions that will throw one day --------------------------------
for p, src in files.items():
    for i, line in enumerate(src.split("\n"), 1):
        if "//" in line and line.strip().startswith("//"):
            continue
        # `foo!.bar` and `foo!` in an expression — a promise the type system
        # cannot keep, and the data here changes several times a day.
        for m in re.finditer(r"(\w+)!\.", line):
            add("NOTE", f"{rel(p)}:{i} non-null assertion on `{m.group(1)}`")
        if re.search(r"\bas any\b|: any\b", line):
            add("WARN", f"{rel(p)}:{i} uses `any`")

# ---- 4. things left in by accident ----------------------------------------
for p, src in files.items():
    for i, line in enumerate(src.split("\n"), 1):
        """
        console.log and console.debug only, and only outside a DEV guard.

        The first version flagged every console.* and was wrong on both of its
        hits in src: one is a deliberate production warning with a comment
        explaining why it is no longer DEV-only, and the other sits inside
        `if (import.meta.env.DEV)`. warn and error are how software reports a
        real problem; log and debug are what somebody forgot to delete.
        """
        # The SERVER is exempt. Logging is part of what a server does — a startup
        # banner and a request trace are features there, not leftovers. This
        # check is about what ships to a customer's browser.
        if (re.search(r"\bconsole\.(log|debug)\(", line)
                and "audit" not in p and "/server/" not in p.replace(os.sep, "/")):
            near = "\n".join(src.split("\n")[max(0, i - 4):i])
            if "import.meta.env.DEV" not in near:
                add("WARN", f"{rel(p)}:{i} leaves a console.log in")
        if re.search(r"\b(TODO|FIXME|XXX|HACK)\b", line):
            add("NOTE", f"{rel(p)}:{i} {re.search(r'(TODO|FIXME|XXX|HACK).{0,60}', line).group(0)}")

# ---- 5. CSS classes with no component ------------------------------------
css_path = os.path.join(SRC, "styles.css")
if os.path.exists(css_path):
    css = open(css_path).read()
    declared = set(re.findall(r"\.([a-z][a-z0-9-]{2,})(?=[\s,:.{\[])", css))
    used = set()
    for src in files.values():
        for m in re.finditer(r"""className=[{"']([^"'}]*)""", src):
            used.update(re.findall(r"[a-z][a-z0-9-]{2,}", m.group(1)))
        for m in re.finditer(r"""['"`]([a-z][a-z0-9-]{2,})['"`]""", src):
            used.add(m.group(1))
    """
    A class NAMED IN A COMMENT is kept on purpose.

    This codebase records a deliberate retention by writing it down — ".home-
    page-domain-y rule kept in styles.css" sits in HomeScreen next to the
    explanation of why the treatment was removed from the page but not from the
    stylesheet. Two of the first ten orphans checked turned out to be exactly
    that, so a sweep that deleted them all would have destroyed the record eight
    more times. Anything mentioned anywhere in the source is left alone.
    """
    mentioned = set()
    for src in files.values():
        mentioned.update(re.findall(r"[.\s]([a-z][a-z0-9-]{2,})", src))
    orphan = sorted(
        c for c in declared - used - mentioned if not c.startswith(("is-", "has-"))
    )
    if orphan:
        add("NOTE", f"{len(orphan)} CSS classes declared but not found in any component: "
                    + ", ".join(orphan[:12]) + ("…" if len(orphan) > 12 else ""))
    add("NOTE", f"styles.css is {len(css.splitlines())} lines, {len(declared)} classes")

# ---- 6. files that have outgrown themselves -------------------------------
for p, src in sorted(files.items(), key=lambda kv: -len(kv[1].split("\n"))):
    n = len(src.split("\n"))
    if n > 900:
        add("WARN", f"{rel(p)} is {n} lines — hard to hold in one head")

# ---- 7. duplicated magic numbers -----------------------------------------
"""
Only geometry, and only where the SAME number appears in both the stylesheet and
a component: that is the shape that silently drifts, and it has cost this repo a
row of icons before — a padding in CSS and a constant in TS that had to agree
and did not.
"""
if os.path.exists(css_path):
    ts_nums = defaultdict(list)
    for p, src in files.items():
        if not p.endswith(".tsx") and "constants" not in p:
            continue
        for m in re.finditer(r"=\s*(\d{2,3})\b", src):
            ts_nums[m.group(1)].append(rel(p))
    css_nums = set(re.findall(r":\s*(\d{2,3})px", open(css_path).read()))
    shared = sorted(set(ts_nums) & css_nums, key=int)
    risky = [n for n in shared if int(n) >= 20 and len(set(ts_nums[n])) == 1]
    if risky:
        add("NOTE", f"{len(risky)} geometry values appear in BOTH styles.css and a component "
                    f"and must agree by hand: {', '.join(risky[:10])}")

# ---- report ---------------------------------------------------------------
rank = {"ERROR": 0, "WARN": 1, "NOTE": 2}
findings.sort(key=lambda f: (rank[f[0]], f[1]))
for level, what in findings:
    print(f"{level:<5} {what}")

errors = sum(1 for f in findings if f[0] == "ERROR")
warns = sum(1 for f in findings if f[0] == "WARN")
print(f"\n{errors} error(s), {warns} warning(s), {len(findings) - errors - warns} note(s)")
print(f"scanned {len(files)} files, {sum(len(s.splitlines()) for s in files.values())} lines")
sys.exit(1 if errors else 0)
