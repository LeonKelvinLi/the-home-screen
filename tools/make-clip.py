#!/usr/bin/env python3
"""
Cut a business's own reel into the clip the video window plays:
  public/clips/<slug>.mp4          540x960 H.264 + AAC, faststart, up to --seconds long
  public/clips/<slug>-poster.webp  the first frame of the chosen window

    python3 tools/make-clip.py <reel.mp4> <slug> [--seconds 24] [--start S]

Which seconds: a one-frame-per-second sweep of the whole reel scores each
second by how much the picture moves (mean absolute difference from the
previous second's frame), and the window with the most movement wins — never
simply the top, which on a reel is usually a title card or a face talking.
A reel shorter than the window runs whole. --start overrides the sweep.
Prints "<slug>: <start>s-<end>s of <total>s" so CREDITS.md can say so.
"""
import subprocess, sys, os, json, tempfile
from PIL import Image, ImageChops, ImageStat

src, slug = sys.argv[1], sys.argv[2]
opt = lambda k, d: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
SECS = float(opt('--seconds', '24')); start_override = opt('--start', None)
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', src], capture_output=True, text=True).stdout)
total = float(probe['format']['duration'])
with tempfile.TemporaryDirectory() as td:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'fps=1,scale=96:-1', f'{td}/f%04d.png'], check=True)
    frames = sorted(os.listdir(td))
    ims = [Image.open(f'{td}/{f}').convert('L') for f in frames]
    motion = [0.0] + [ImageStat.Stat(ImageChops.difference(ims[i], ims[i - 1])).mean[0] for i in range(1, len(ims))]
n = len(motion); win = int(min(SECS, total))
if start_override is not None: start = float(start_override)
elif total <= SECS: start = 0.0
else:
    best, start = -1.0, 0
    for s in range(0, max(1, n - win + 1)):
        sc = sum(motion[s:s + win])
        if sc > best: best, start = sc, s
    start = float(start)
end = min(total, start + SECS)
os.makedirs('public/clips', exist_ok=True)
out = f'public/clips/{slug}.mp4'; poster = f'public/clips/{slug}-poster.webp'
vf = 'scale=540:960:force_original_aspect_ratio=increase,crop=540:960,format=yuv420p'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.2f}', '-t', f'{end - start:.2f}', '-i', src, '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-profile:v', 'main', '-level', '4.0', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart', out], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.2f}', '-i', src, '-frames:v', '1', '-vf', vf, f'{poster}.png'], check=True)
Image.open(f'{poster}.png').convert('RGB').save(poster, 'WEBP', quality=80, method=6); os.remove(f'{poster}.png')
print(f'{slug}: {start:.0f}s-{end:.0f}s of {total:.0f}s -> {os.path.getsize(out) // 1024}KB')
