#!/usr/bin/env node
/*
  Pull generated city wallpapers down, size them for a phone, and write the
  manifest the app reads.

  Run:  node tools/wallpapers.mjs <slug> <url> [<slug> <url> ...]

  Why a script rather than doing it by hand: the wallpaper is the largest asset
  on the home screen and there will be one per city, so the encode settings have
  to be identical for every one of them. A 2K generation is about 1.5MB of PNG;
  at phone size and quality 82 it lands around 120KB, and the difference is not
  visible behind a scrim and thirty icons.
*/

import { execFile } from 'node:child_process'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import path from 'node:path'

const run = promisify(execFile)
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, 'public/wallpapers')

/*
  1320x2868 is an iPhone 16 Pro Max in DEVICE pixels — 440 points at 3x.

  The first pass shipped 1206x2622, which was the Pro Max in LOGICAL points and
  therefore a third of the pixels the screen actually has. Every large iPhone
  was upscaling it in the browser, which is exactly what "looks bad" looks
  like. Nothing on sale needs more than this.
*/
const W = 1320
const H = 2868

/*
  A SIZE BUDGET, not a fixed quality.

  One quality setting across nineteen photographs produced a 4.5x spread — 241KB
  for the Golden Gate against 1.1MB for Walnut Creek — because complexity, not
  quality, is what decides the size. Most of those extra bytes were spent
  encoding film grain in a night sky, which nobody looks at and which costs the
  same as real detail.

  Binary-searching the highest quality that fits the budget spends bits where
  they are needed and stops everywhere else, so no city is four times slower to
  load than another. 62 is the floor: below it, dark gradients start to band.
*/
const TARGET_BYTES = 230 * 1024
const FLOOR_QUALITY = 62

async function fetchAndEncode(slug, url) {
  /*
    Wikimedia's user-agent policy refuses anonymous clients, and most of these
    now come from Commons — a bare fetch() gets a 403 with an HTML body, which
    then fails further down as "not an image" and looks like a bad URL.
  */
  /*
    Retry with backoff, because Commons rate-limits a run of these.

    Fetching seven wallpapers in a row earns a 429 about three in, and the
    whole run then dies on the fourth — having already written the first three,
    so a rerun re-downloads what it has. Waiting and retrying is the difference
    between "one command does the set" and babysitting it.
  */
  let res
  for (let attempt = 0; ; attempt++) {
    res = await fetch(url, {
      headers: {
        'User-Agent':
          'the-home-screen/1.0 (city wallpapers; contact via github.com/Noctilucenty/the-home-screen)',
        Accept: 'image/*',
      },
    })
    if (res.status !== 429 || attempt >= 5) break
    const wait = 2000 * 2 ** attempt
    console.log(`  ${slug}: rate limited, waiting ${wait / 1000}s`)
    await new Promise((r) => setTimeout(r, wait))
  }
  if (!res.ok) throw new Error(`${slug}: download failed ${res.status}`)
  const raw = Buffer.from(await res.arrayBuffer())

  const tmp = path.join(OUT, `${slug}.src`)
  await writeFile(tmp, raw)

  // sips ships with macOS and handles HEIC/PNG/JPEG without a dependency.
  await run('/usr/bin/sips', ['-s', 'format', 'png', tmp, '--out', `${tmp}.png`])

  /*
    ffmpeg rather than a plain PIL resize.

    Two things it does that a straight Lanczos does not: `scale` with the
    accurate_rnd and full_chroma flags resamples without the rounding crush
    that shows up in dark gradients, and `cas` — Contrast Adaptive Sharpen —
    puts back the micro-contrast any resample takes out, without the halo an
    unsharp mask leaves around a bridge cable against a night sky.

    force_original_aspect_ratio=increase then crop is a cover-crop: the picture
    fills the frame and the overhang is cut, rather than being squashed. A
    stretched skyline is instantly obvious; a cropped one is not.
  */
  // This ffmpeg build has no WebP encoder, so it does the resample and the
  // sharpen and hands a PNG to Pillow for the encode.
  await run('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-i', `${tmp}.png`,
    '-vf',
    `scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos+accurate_rnd+full_chroma_int,` +
      `crop=${W}:${H},cas=strength=0.4`,
    `${tmp}.big.png`,
  ])
  await run('/usr/bin/python3', [
    '-c',
    `import io
from PIL import Image
im = Image.open("${tmp}.big.png").convert("RGB")

def encode(q):
    b = io.BytesIO()
    im.save(b, "WEBP", quality=q, method=6)
    return b.getvalue()

lo, hi, best = ${FLOOR_QUALITY}, 92, None
while lo <= hi:
    mid = (lo + hi) // 2
    data = encode(mid)
    if len(data) <= ${TARGET_BYTES}:
        best = data
        lo = mid + 1
    else:
        hi = mid - 1
open("${path.join(OUT, `${slug}.webp`)}", "wb").write(best or encode(${FLOOR_QUALITY}))`,
  ])
  await run('/bin/rm', ['-f', tmp, `${tmp}.png`, `${tmp}.big.png`])
}

/* Rewrite the Set in Wallpaper.tsx from what is actually on disk, so the code
   and the folder can never disagree. */
async function writeManifest() {
  /*
    Underscore-prefixed files are not cities. _placeholder.webp is the neutral
    background a paged city gets before it has been shot, and the manifest
    listing it as a city meant wallpaperFor('_placeholder') would have resolved
    — harmless today, wrong the moment anything iterates the set as a city list.
  */
  const files = (await readdir(OUT))
    .filter((f) => f.endsWith('.webp') && !f.startsWith('_'))
    .sort()
  const slugs = files.map((f) => f.replace(/\.webp$/, ''))
  const src = path.join(ROOT, 'src/ios/Wallpaper.tsx')
  const text = await import('node:fs/promises').then((m) => m.readFile(src, 'utf8'))
  const list = slugs.map((s) => `  '${s}',`).join('\n')
  const next = text.replace(
    /const CITY_WALLPAPERS = new Set<string>\(\[[\s\S]*?\]\)/,
    `const CITY_WALLPAPERS = new Set<string>([\n${list}\n])`,
  )
  await writeFile(src, next)
  return slugs
}

const args = process.argv.slice(2)
if (args.length % 2 !== 0) {
  console.error('usage: node tools/wallpapers.mjs <slug> <url> [<slug> <url> ...]')
  process.exit(1)
}

await mkdir(OUT, { recursive: true })
for (let i = 0; i < args.length; i += 2) {
  await fetchAndEncode(args[i], args[i + 1])
  // Courtesy gap so a whole set does not trip the limiter in the first place.
  if (i + 2 < args.length) await new Promise((r) => setTimeout(r, 1500))
  console.log('encoded', args[i])
}
const slugs = await writeManifest()
console.log(`manifest: ${slugs.length} cities — ${slugs.join(', ')}`)
