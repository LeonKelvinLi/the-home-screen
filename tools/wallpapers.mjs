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
  /*
    A LOCAL PATH is accepted as well as a URL. Some of the hosts the operator
    links to — CDNs in front of magazines and booking sites — refuse this
    script's user agent outright, and arguing with them one at a time is not
    the job. Downloading by hand and passing the file is the escape hatch.
  */
  if (!/^https?:\/\//.test(url)) {
    const local = path.resolve(url)
    const tmp0 = path.join(OUT, `${slug}.src`)
    await run('/bin/cp', [local, tmp0])
    return finishEncode(slug, tmp0)
  }

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

  return finishEncode(slug, tmp)
}

/* Everything after the bytes are on disk, shared by the URL and local paths. */
async function finishEncode(slug, tmp) {
  // sips ships with macOS and handles HEIC/PNG/JPEG without a dependency.
  await run('/usr/bin/sips', ['-s', 'format', 'png', tmp, '--out', `${tmp}.png`])

  /*
    SUPER-RESOLVE FIRST, when the source is too small to fill the frame.

    The operator's rule is to use the wallpaper from the link he sends, and
    every link he sends is a small landscape thumbnail — 454x604 for Orinda,
    1200x630 for Lafayette. This frame is 1320x2868 PORTRAIT, so the usable
    part of a wide thumbnail is a narrow vertical slice of it: a 1200x630 image
    yields 289 pixels across. Resampling that up four or five times is what
    "blown up" looks like, and it was the reason his links were being replaced
    rather than used.

    So anything that would need more than a light stretch goes through EDSR x4
    first — a network trained to invent plausible detail, not a sharpen and not
    a better resize. Compared side by side at 4x on his Orinda frame it holds
    the neon tubing as edges where Lanczos turns it to a glow.

    The threshold is deliberately not 1.0. Every photograph here is downscaled
    from something larger, and a few per cent of stretch is invisible; running
    the network on a frame that barely needs it costs a minute and changes
    nothing. 1.15 is where a resample starts to show on a phone.
  */
  const srcW = Number(
    (await run('/usr/bin/sips', ['-g', 'pixelWidth', `${tmp}.png`])).stdout.match(/pixelWidth: (\d+)/)?.[1],
  )
  const srcH = Number(
    (await run('/usr/bin/sips', ['-g', 'pixelHeight', `${tmp}.png`])).stdout.match(/pixelHeight: (\d+)/)?.[1],
  )
  /* The cover-crop below fills by whichever axis falls short, so the stretch
     this frame will actually suffer is the larger of the two ratios. */
  const stretch = Math.max(W / srcW, H / srcH)
  /*
    EDSR IS FOR SMALL SOURCES, AND ONLY FOR SMALL SOURCES.

    The threshold above was set against what the operator sends: 454x604
    thumbnails off a search page, where a network genuinely invents detail that
    a resample cannot. Pointed at a 2592x1944 Commons original needing 1.48x it
    ran for over twenty CPU-minutes without finishing, twice, and had to be
    killed — EDSR x4 is quadratic in pixels and this frame is thirty times the
    area it was tuned on.

    A source already close to frame size does not need a trained network to
    gain half again; a cubic resample at that ratio is not visible behind a
    scrim and twenty-four icons. So the gate is BOTH conditions now: enough
    stretch to show, AND a source small enough that the model has something to
    add. Neither has been relaxed — a 454x604 frame still goes through EDSR.
  */
  const SMALL_ENOUGH_FOR_SR = 1600 // px on the short side
  if (stretch > 1.15 && Math.min(srcW, srcH) < SMALL_ENOUGH_FOR_SR) {
    console.log(`  ${slug}: ${srcW}x${srcH} needs ${stretch.toFixed(2)}x — super-resolving`)
    /*
      The HOMEBREW python, not /usr/bin/python3 which every other call here
      uses. Only one of them has OpenCV: the system one ships Pillow, which is
      all the encode below needs, and cv2 lives in the Homebrew tree. Calling
      the wrong one fails with ModuleNotFoundError halfway through a run, after
      the download and before anything is written.
    */
    await run('/opt/homebrew/bin/python3', [
      path.join(ROOT, 'tools/upscale.py'),
      `${tmp}.png`,
      `${tmp}.sr.png`,
    ])
    await run('/bin/mv', [`${tmp}.sr.png`, `${tmp}.png`])
  }

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

  /*
    Which of these are LIGHT, measured rather than eyeballed.

    The legibility scrim in styles.css was tuned on night cityscapes, where the
    sky behind the grid is already dark. Every daytime photograph that has been
    added since fails under it: measured per label with the glyphs hidden, the
    Golden Gate flagship's worst label sits at 7.29:1 while Sunnyvale's is
    1.56:1 with twenty of twenty-four under the 4.5 floor. That is not a fact
    about any one picture, it is what happens when white text meets a midday
    sky, so the page needs to know which kind of photograph it is showing.

    The measurement is a percentile of the luminance in the BAND THE ICON GRID
    SITS IN — 12% to 82% of the height — not of the whole frame. A night skyline
    with a strip of headlights along the very bottom is still a dark page to
    read against, and averaging the whole image would call it light.

    97th percentile, not the 90th it started at, and the change was forced by
    measurement rather than taste. At the 90th, San Leandro scored 0.26 — solidly
    "dark" — and still had six of its twenty-four labels under the floor, because
    the failures are LOCAL: a lit sign, a white building, a patch of sky between
    the towers. A label does not land on the average of a photograph, it lands on
    one spot, so the number has to describe the bright spots rather than the bulk.
    Moving to the 97th took San Leandro to zero, Richmond from two to zero and
    Oakland from three to one.

    It costs vibrancy on the night photographs, which now carry a real scrim
    where they used to carry almost none. That trade is deliberate: ten labels
    nobody could read across three cities, against pictures that are dimmer but
    still plainly pictures.
  */
  const brightness = JSON.parse(
    (
      await run('/usr/bin/python3', [
        '-c',
        `import json
from PIL import Image

def srgb(v):
    v /= 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

out = {}
for slug in ${JSON.stringify(slugs)}:
    im = Image.open("${OUT}/%s.webp" % slug).convert("RGB")
    w, h = im.size
    band = im.crop((0, int(h * 0.12), w, int(h * 0.82))).resize((60, 120))
    px = sorted(
        0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
        for r, g, b in band.getdata()
    )
    out[slug] = round(px[int(len(px) * 0.97)], 4)
print(json.dumps(out))`,
      ])
    ).stdout,
  )

  /*
    The NUMBER is published, not a light/dark verdict.

    A threshold was written here first and thrown away, because the measured
    set does not have two populations to separate. It is a continuum: 0.058 for
    Alameda at night, through Las Vegas at 0.245 and Fremont at 0.293, up to
    Benicia's 0.735 in full sun. The widest gap anywhere in the middle is 0.028,
    so any cut line is arbitrary, and a page either side of it would get either
    no help or the full treatment for a hair's difference in encoding.

    So the app scales the scrim from the value instead. See wallpaperScrim in
    ios/Wallpaper.tsx for the arithmetic, which is the same one used to derive
    these: how much extra black it takes to bring THIS picture under the
    luminance white text needs.
  */
  const src = path.join(ROOT, 'src/ios/Wallpaper.tsx')
  const text = await import('node:fs/promises').then((m) => m.readFile(src, 'utf8'))
  const list = slugs.map((s) => `  '${s}',`).join('\n')
  const lumaList = slugs.map((s) => `  '${s}': ${brightness[s]},`).join('\n')
  const next = text
    .replace(
      /const CITY_WALLPAPERS = new Set<string>\(\[[\s\S]*?\]\)/,
      `const CITY_WALLPAPERS = new Set<string>([\n${list}\n])`,
    )
    .replace(
      /const WALLPAPER_LUMA: Record<string, number> = \{[\s\S]*?\n\}/,
      `const WALLPAPER_LUMA: Record<string, number> = {\n${lumaList}\n}`,
    )
  await writeFile(src, next)
  const bright = slugs.filter((s) => brightness[s] > 0.3).length
  console.log(`luma: ${slugs.length} measured, ${bright} above 0.30`)
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
