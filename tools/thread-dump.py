#!/usr/bin/env python3
"""
Glenn's thread, as text, so a batch of his asks can be re-read in one go.

Reads the Messages database the same way tools/gap-check.py does — read-only,
straight from ~/Library/Messages/chat.db — and prints one line per message
with the date, who sent it and the text. Newer macOS keeps the text of most
messages in a binary attributedBody rather than the text column; both are
read.

NEEDS FULL DISK ACCESS. macOS refuses this file to any app without it, and
the refusal reads as "unable to open database file" or "authorization
denied", not as a permission prompt. Run it from a terminal that has been
granted Full Disk Access (System Settings > Privacy & Security > Full Disk
Access), or grant it to the app you are running it from.

    python3 tools/thread-dump.py                       # the whole thread
    python3 tools/thread-dump.py --since 2026-09-01    # from a date
    python3 tools/thread-dump.py --grep "supply|yearly|raffle|qr"
    python3 tools/thread-dump.py --his                 # only Glenn's messages
    python3 tools/thread-dump.py > /tmp/thread.txt     # keep a copy to search
"""
import argparse
import datetime
import os
import re
import sqlite3
import sys

CHAT = 2366  # the same conversation gap-check.py reads
EPOCH = datetime.datetime(2001, 1, 1)


def decode_attributed(blob):
    """The string inside an NSAttributedString typedstream, or None."""
    if not blob:
        return None
    i = blob.find(b'NSString')
    if i == -1:
        return None
    i = blob.find(b'+', i)
    if i == -1:
        return None
    i += 1
    n = blob[i]
    if n == 0x81:
        n = int.from_bytes(blob[i + 1:i + 3], 'little')
        i += 3
    elif n == 0x82:
        n = int.from_bytes(blob[i + 1:i + 4], 'little')
        i += 4
    else:
        i += 1
    return blob[i:i + n].decode('utf-8', errors='replace')


# Things the thread carries that must never land in a transcript, a log or a
# tool result: bank routing and account numbers (he pasted his on 2026-09-08),
# card numbers, and live keys. The message still prints, the digits do not.
SECRET = re.compile(
    r'((?:routing|account|acct|card)\s*(?:#|no\.?|number)?\s*:?\s*)(\d[\d -]{5,}\d)'
    r'|(sk_(?:live|test)_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+|rk_(?:live|test)_[A-Za-z0-9]+)'
    r'|(?<!\d)(\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4})(?!\d)',
    re.I,
)


def redact(text):
    return SECRET.sub(lambda m: (m.group(1) or '') + '[redacted]', text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--since', help='YYYY-MM-DD')
    ap.add_argument('--grep', help='case-insensitive regex on the text')
    ap.add_argument('--his', action='store_true', help="only Glenn's messages")
    ap.add_argument('--chat', type=int, default=CHAT)
    a = ap.parse_args()

    path = os.path.expanduser('~/Library/Messages/chat.db')
    try:
        db = sqlite3.connect(f'file:{path}?mode=ro', uri=True)
        db.execute('select 1 from message limit 1').fetchone()
    except Exception as e:  # noqa: BLE001
        print(f'Cannot read {path}: {e}', file=sys.stderr)
        print('This needs Full Disk Access — see the note at the top of this file.', file=sys.stderr)
        return 2

    since = EPOCH
    if a.since:
        since = datetime.datetime.strptime(a.since, '%Y-%m-%d')
    pattern = re.compile(a.grep, re.I) if a.grep else None

    rows = db.execute(
        """select m.date, m.is_from_me, m.text, m.attributedBody from message m
           join chat_message_join j on j.message_id = m.ROWID
           where j.chat_id = ? order by m.date""",
        (a.chat,),
    ).fetchall()
    n = 0
    for date, from_me, text, body in rows:
        t = text or decode_attributed(body)
        if not t:
            continue
        when = EPOCH + datetime.timedelta(seconds=date / 1e9)
        if when < since:
            continue
        if a.his and from_me:
            continue
        if pattern and not pattern.search(t):
            continue
        who = 'LEON ' if from_me else 'GLENN'
        print(f"{when:%Y-%m-%d %H:%M} {who}: {redact(t).replace(chr(10), ' ⏎ ')}")
        n += 1
    print(f'-- {n} message(s)', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
