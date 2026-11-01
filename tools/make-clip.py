#!/usr/bin/env python3
"""
Cut a business's own reel into the clip its BEASTY page plays.

    python3 tools/make-clip.py <reel.mp4> <slug> [--seconds 24] [--start S]

Writes, relative to where it is run (the repo root):
  public/clips/<slug>.mp4          540x960 H.264 + AAC, faststart, up to --seconds long
  public/clips/<slug>-poster.webp  the first frame of that excerpt

and prints "<slug>: <start>s-<end>s of <total>s -> <size>KB", which is the
"Excerpt" column of public/clips/CREDITS.md.

WHICH SECONDS. A reel usually opens on a title card or a face talking, so the
excerpt is not simply the first 24 seconds. Instead:

  1. take one small greyscale frame per second of the reel;
  2. score each second by how much the picture changed since the second
     before (mean absolute pixel difference): a cut or a pan scores high, a
     still title card scores near zero;
  3. slide a --seconds-long window along those scores and keep the window
     with the highest total (the earliest one, on a tie).

A reel no longer than the window runs whole. --start skips the search and
uses that second instead, for when a person has picked a better moment.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import tempfile

from PIL import Image, ImageChops, ImageStat

CLIPS = 'public/clips'

# The page's video window is a 9:16 phone frame. Fill it, then crop the
# overflow, so a landscape or square reel is never letterboxed.
FRAME = 'scale=540:960:force_original_aspect_ratio=increase,crop=540:960,setsar=1,format=yuv420p'

# H.264 Main 4.0 + AAC plays on every phone browser; faststart puts the index
# at the front so the clip starts before it has finished downloading.
ENCODE = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-profile:v', 'main', '-level', '4.0',
          '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart']


def reel_length(reel: str) -> float:
    """The reel's duration in seconds, as ffprobe reports it."""
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', reel],
        capture_output=True, text=True,
    ).stdout
    return float(json.loads(out)['format']['duration'])


def movement_per_second(reel: str) -> list[float]:
    """How much the picture changes at each second; the first second scores 0."""
    with tempfile.TemporaryDirectory() as tmp:
        # One frame a second, 96 px wide: enough to see movement, cheap to compare.
        subprocess.run(['ffmpeg', '-v', 'error', '-i', reel, '-vf', 'fps=1,scale=96:-1', f'{tmp}/f%04d.png'], check=True)
        frames = [Image.open(f'{tmp}/{name}').convert('L') for name in sorted(os.listdir(tmp))]
    scores = [0.0]
    for before, after in zip(frames, frames[1:]):
        scores.append(ImageStat.Stat(ImageChops.difference(after, before)).mean[0])
    return scores


def busiest_window(scores: list[float], width: int) -> int:
    """The first second of the `width`-second run with the most movement."""
    best_start, best_total = 0, -1.0
    for start in range(max(1, len(scores) - width + 1)):
        total = sum(scores[start:start + width])
        if total > best_total:
            best_start, best_total = start, total
    return best_start


def choose_start(reel: str, total: float, seconds: float, start: float | None) -> float:
    if start is not None:
        return start
    if total <= seconds:
        return 0.0
    return float(busiest_window(movement_per_second(reel), int(min(seconds, total))))


def cut_clip(reel: str, start: float, end: float, out: str) -> None:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.2f}', '-t', f'{end - start:.2f}',
                    '-i', reel, '-vf', FRAME, *ENCODE, out], check=True)


def write_poster(reel: str, start: float, poster: str) -> None:
    """The excerpt's first frame, shown before the clip loads."""
    png = f'{poster}.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.2f}', '-i', reel,
                    '-frames:v', '1', '-vf', FRAME, png], check=True)
    Image.open(png).convert('RGB').save(poster, 'WEBP', quality=80, method=6)
    os.remove(png)


def main() -> None:
    args = argparse.ArgumentParser(description='Cut a reel into public/clips/<slug>.mp4 and its poster.')
    args.add_argument('reel', help='the downloaded reel')
    args.add_argument('slug', help="the business's slug; names the output files")
    args.add_argument('--seconds', type=float, default=24.0, help='longest excerpt (default 24)')
    args.add_argument('--start', type=float, help='start here instead of searching for the busiest window')
    a = args.parse_args()

    total = reel_length(a.reel)
    start = choose_start(a.reel, total, a.seconds, a.start)
    end = min(total, start + a.seconds)

    os.makedirs(CLIPS, exist_ok=True)
    out = f'{CLIPS}/{a.slug}.mp4'
    cut_clip(a.reel, start, end, out)
    write_poster(a.reel, start, f'{CLIPS}/{a.slug}-poster.webp')
    print(f'{a.slug}: {start:.0f}s-{end:.0f}s of {total:.0f}s -> {os.path.getsize(out) // 1024}KB')


if __name__ == '__main__':
    main()
