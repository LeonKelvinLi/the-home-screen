"""
Where Glenn's thread lives, on whichever machine this runs.

THE MAC IS NOT THE ONLY SOURCE ANY MORE. Until 2026-10-21 both readers opened
~/Library/Messages/chat.db and chat 2366 directly. The Mac died; on Windows the
same thread comes off the iPhone through iMazing, whose cached partial backup
holds the phone's own copy, sms.db. That file has the same tables (message,
chat, chat_message_join, attachment) but its own ROWIDs, so 2366 means nothing
there. The thread is found by Glenn's handle instead, which is the same
everywhere.

    MESSAGES_DB=/path/to/sms.db python3 tools/thread-dump.py
    python3 tools/thread-dump.py --db /path/to/sms.db

With neither set, the Mac's chat.db is tried first, then the newest sms.db in
iMazing's cache (Windows: %APPDATA%\\iMazing\\Caches\\<udid>\\PartialBackup).
iMazing refreshes that cache whenever its Messages view is opened with the
phone connected; the backup it writes is unencrypted only because backup
encryption is off on the phone.

A PHONE BACKUP HOLDS ONLY WHAT THE PHONE HOLDS. On 2026-10-21 that was one
afternoon: the phone had been set up that day and Messages in iCloud had not
brought the history down. Read the first date `thread-dump.py` prints before
assuming a quiet day was quiet.
"""
from __future__ import annotations

import glob
import os
import sqlite3

# His number, from src/lib/operator.ts. The Mac's chat 2366 is this handle.
GLENN = ('+15107893205',)
MAC_CHAT_DB = os.path.expanduser('~/Library/Messages/chat.db')
# sms.db's file name inside any iOS backup: SHA-1 of "HomeDomain-Library/SMS/sms.db".
SMS_DB_ID = '3d0d7e5fb2ce288813306e4d4636395e047a3d28'


def imazing_dbs() -> list[str]:
    root = os.path.join(os.environ.get('APPDATA', ''), 'iMazing', 'Caches')
    found = glob.glob(os.path.join(root, '*', 'PartialBackup', '*', SMS_DB_ID[:2], SMS_DB_ID))
    return sorted(found, key=os.path.getmtime, reverse=True)


def db_path(explicit: str | None = None) -> str:
    if explicit:
        return explicit
    if os.environ.get('MESSAGES_DB'):
        return os.environ['MESSAGES_DB']
    if os.path.exists(MAC_CHAT_DB):
        return MAC_CHAT_DB
    phones = imazing_dbs()
    return phones[0] if phones else MAC_CHAT_DB


def open_db(explicit: str | None = None) -> sqlite3.Connection:
    """Read-only, so a reader can never write to the phone's copy or the Mac's."""
    path = db_path(explicit)
    db = sqlite3.connect(f'file:{path}?mode=ro', uri=True)
    db.execute('select 1 from message limit 1').fetchone()
    return db


def glenn_chats(db: sqlite3.Connection) -> list[int]:
    """Every chat with his handle: iMessage and SMS are separate rows for one person."""
    marks = ','.join('?' * len(GLENN))
    return [r[0] for r in db.execute(
        f'select ROWID from chat where chat_identifier in ({marks})', GLENN)]
