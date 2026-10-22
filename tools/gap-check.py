#!/usr/bin/env python3
"""
Every link Glenn ever sent, against everything the app actually lists.

He sends a business as a screenshot and a link, in a thread that is now several
thousand messages long, and a batch gets processed by reading the tail. Anything
he sent while a previous batch was being built can fall through the gap silently
— nothing errors, the business simply never appears. This is the check that
finds those, and it is worth running after every batch.

MATCHING IS DELIBERATELY LOOSE. A domain is rarely spelled the way the business
is: houseofthaisf.com is "House of Thai", thefrenchspotsf.com is "The French
Spot", banhmiovenus.com is "Banh Mi Oven". So both sides are reduced to
lowercase letters and digits, common decorations are stripped off the front and
back, and a prefix that leaves at most three characters unmatched counts. It over-
matches rather than under-matches on purpose: a false "already listed" is one
line to check by hand, a false "missing" wastes a research agent.

    python3 tools/gap-check.py
    python3 tools/gap-check.py path/to/sms.db    # a phone backup, via iMazing

A PHONE BACKUP ONLY SEES WHAT THE PHONE STILL HOLDS. Run against a short
history it reports only that history's gaps; it cannot clear anything older.
"""
from __future__ import annotations

import os
import re
import sys

from messages_db import glenn_chats, open_db

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

# Link shorteners, social profiles, map pins, and the tools we use ourselves.
# None of these is a business's own site, so none of them can be "missing".
NOT_A_SITE = {
    'youtu.be', 'youtube.com', 'm.youtube.com', 'instagram.com', 'l.instagram.com',
    'linktr.ee', 'link.me', 'bio.site', 'buy.stripe.com', 'facebook.com', 'tiktok.com',
    'vm.tiktok.com', 'maps.app.goo.gl', 'goo.gl', 'g.co', 'maps.google.com', 'apple.co',
    'music.apple.com', 'open.spotify.com', 'docs.google.com', 'forms.gle', 'a.co',
    'amazon.com', 'yelp.com', 'yelp.to', 'm.yelp.com', 'photos.app.goo.gl', 'share.google',
    'x.com', 'twitter.com', 'link.clover.com', 'duckduckgo.com', 'dafont.com',
    'distrokid.com', 'gofundme.com', 'booksy.com', 'bau.edu', 'brandingcompass.com',
    'icloud.com', 'app.vidiq.com', 'sites.leadconnectorhq.com', 'order.spoton.com',
    # Coding classes for his son, 2026-08-20 — he sent one, Leon sent the other.
    # A conversation, not a listing. Kept named rather than silently dropped, so
    # a future run does not rediscover them as a gap.
    'hackingtons.com', 'thecoderschool.com',
    # A bike route he sent while the two of them were planning a ride on
    # 2026-08-30. A route planner, not a business he wants listed.
    'komoot.com',
    # Leon's own pilot-program page, not a business he sent to be listed.
    'bstypilotprogram.onrender.com',
    # Booking and payment platforms a business sits behind, not the business.
    'book.peek.com', 'link.com',
    'order.online', 'beastypages.com', 'the-home-screen.onrender.com',
    'leonkelvinli.onrender.com', 'allis-dog-walking.onrender.com',
    # Link-in-bio pages. The business behind each is listed under its own
    # site: linkin.bio/thetoxalamo is The Tox Alamo, solo.to/gumbosocial is
    # Gumbo Social (gumbosocial.com).
    'linkin.bio', 'solo.to',
    # Apple Maps pins, sent for meeting spots on rides and dinners.
    'maps.apple', 'maps.apple.com',
    # 2026-08-06, "💧 = trykangenwaterfree.com / Button on the page", then the
    # same minute: "Don't worry about the link my host in the Philippines is
    # fixing it … Put this instead for now" with the leadconnectorhq preview.
    'trykangenwaterfree.com',
    # 2026-08-12, his launch timeline: "Order thru Alibaba" for the QR
    # pedestals. A supplier, not a listing.
    'alibaba.com',
    # 2026-09-12, an e-bike product page in the middle of a ride conversation.
    'citygrounds.com',
    # Listed under their main domains: winterwhiteproducts.com is Winter White
    # Car Wash's product shop (the tile links winterwhitecarwash.com), and
    # traballosbbq.framer.website is Traballo's Backyard BBQ's old page
    # (listed at traballosbackyardbbq.com).
    'winterwhiteproducts.com', 'traballosbbq.framer.website',
}

# He spent an evening pricing domain names for the brand itself — dozens of
# beasty*/bsty* variants in a row. They are not businesses.
BRAND_SHOPPING = re.compile(r'^(beasty|bsty|beausty)[a-z]*$')

# EVERY file that holds a business, and the reason this is a named constant.
# The first version of this listed three of them by hand and left out roster.ts,
# which holds a third of the catalogue — so it reported Kaisen Don and JDI Auto
# Detailing as never added when both had been seated for weeks. A gap check that
# reads only some of the data invents gaps.
SEED_FILES = ('localBrands.ts', 'brands.ts', 'roster.ts', 'placements.ts')

norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())


def links(path: str | None = None) -> list[str]:
    db = open_db(path)
    chats = glenn_chats(db)
    marks = ','.join('?' * len(chats))
    blob = []
    for text, filename in db.execute(
        f"""SELECT m.text, a.filename FROM message m
            JOIN chat_message_join c ON c.message_id = m.ROWID
            LEFT JOIN message_attachment_join maj ON maj.message_id = m.ROWID
            LEFT JOIN attachment a ON a.ROWID = maj.attachment_id
            WHERE c.chat_id IN ({marks})""", chats):
        blob.append((text or '') + ' ' + (filename or ''))
    # A link he sends as a rich preview has no `text` at all; the URL is inside
    # the archived NSAttributedString, which is where most of them live.
    for (body,) in db.execute(
        f"""SELECT attributedBody FROM message m
            JOIN chat_message_join c ON c.message_id = m.ROWID
            WHERE c.chat_id IN ({marks}) AND attributedBody IS NOT NULL""", chats):
        blob.append(body.decode('utf-8', 'ignore'))
    return re.findall(r'https?://[^\s\)\]"\'<>\x00-\x1f]+', ' '.join(blob))


# A booking widget carries the business's own domain in its query string.
# peek.com uses ?dh=, and the pattern is general enough that any host-shaped
# parameter value is worth preferring over the widget's own host.
EMBEDDED_HOST = re.compile(
    r'[?&](?:dh|domain|host|site|url|shop|merchant)=(?:https?%3A%2F%2F|https?://)?'
    r'(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)', re.I)


def host_of(url: str) -> str:
    """
    The business's own host, looking THROUGH a booking widget when there is one.

    THIS IS THE HOLE NAPA PEDAL CRUSHER FELL THROUGH. He sent them as a
    book.peek.com link, book.peek.com is on NOT_A_SITE because a booking widget
    is not a business, and so the check dropped the URL and reported no gap
    while the business sat unlisted for a day. The widget's own URL named the
    business the whole time: ...&dh=www.napapedalcrusher.com. So read that
    first, and only fall back to the host in front of the slash.

    Everything a booking host hides is a business he asked for, so a check that
    cannot see through one is not a check.
    """
    h = re.sub(r'^https?://', '', url).split('/')[0].lower()
    if h.startswith('www.'):
        h = h[4:]
    if h in NOT_A_SITE:
        inner = EMBEDDED_HOST.search(url)
        if inner:
            found = inner.group(1).lower()
            if found not in NOT_A_SITE and found != h:
                return found
    return h


def raw_data() -> str:
    return ' '.join(
        open(os.path.join(ROOT, 'src/data', n), encoding='utf-8').read()
        for n in SEED_FILES
    ).lower()


def haystack() -> str:
    # NOT the icons folder. It used to be listed here too, and an icon is cut
    # before its seed is written: on 2026-09-13 Daughter Thai and MexiHibachi
    # read as "listed" for the hour between their tiles landing in public/icons
    # and anything seating them. An icon a seed uses is already in the seed
    # text as `icon: '...'`, so the folder only ever added the unused ones.
    parts = []
    for name in SEED_FILES:
        parts.append(open(os.path.join(ROOT, 'src/data', name), encoding='utf-8').read())
    return norm(' '.join(parts))


def listed(host: str, pool: str, raw: str) -> bool:
    # STRONGEST SIGNAL FIRST: a seed that records `site:` carries the host
    # verbatim, so a plain substring test settles it. This is what catches the
    # short names — "p-lo" and "sips" are too short for the prefix rule below
    # and were reported missing while sitting in the file.
    if host in raw:
        return True
    base = host.rsplit('.', 1)[0]
    base = re.sub(r'\.(framer\.website|square\.site|myshopify|onrender)$', '', base)
    base = norm(base)
    # A domain decorates the name at both ends: "the"/"eat"/"its"/"try"/"order"
    # in front, a city or state behind. Try the bare stem as well as the whole.
    stems = {base}
    stems.add(re.sub(r'^(the|eat|its|try|order|new|shop|store|my|go)', '', base))
    for s in list(stems):
        stems.add(re.sub(r'(sf|ca|sj|oakland|berkeley|danville|norcal|bayarea|restaurants?|store|shop|online)$', '', s))
    # A PREFIX IS ONLY A MATCH IF IT IS NEARLY THE WHOLE STEM.
    #
    # The rule used to walk every prefix down to seven characters, which made
    # any two businesses sharing an opening word the same business:
    # bayareaeventlights.com matched Bay Area Charters on "bayarea" and was
    # reported as listed for the twelve days it was actually missing. So the
    # prefix must now leave no more than three characters unaccounted for —
    # enough for the "us" in banhmiovenus or a trailing "co", not enough to
    # swallow a second word.
    for s in stems:
        floor = max(7, len(s) - 3)
        for length in range(len(s), floor - 1, -1):
            if s[:length] in pool:
                return True
    return False


def main() -> int:
    pool, raw = haystack(), raw_data()
    seen, hosts = set(), []
    for url in links(sys.argv[1] if len(sys.argv) > 1 else None):
        h = host_of(url)
        if h in NOT_A_SITE or h.endswith(('.google.com', '.apple.com', '.icloud.com', '.gstatic.com')):
            continue
        if BRAND_SHOPPING.match(h.rsplit('.', 1)[0]) or 'beastypapers' in h:
            continue
        # Typed-URL fragments and truncations from the message archive.
        if h in {'company.com', 'co.com', 'pages.com'} or 'whttpurl' in h:
            continue
        if h in seen:
            continue
        seen.add(h)
        hosts.append(h)

    missing = [h for h in hosts if not listed(h, pool, raw)]
    print(f'{len(hosts)} business sites sent in the thread; {len(missing)} not represented in the data.')
    for h in missing:
        print('  -', h)
    return 0


if __name__ == '__main__':
    sys.exit(main())
