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
  Quality 92, not 82. These are night photographs: almost all of every frame is
  a smooth dark gradient, which is the hardest thing for a lossy codec and the
  first place banding shows. 82 put visible steps in the sky.
*/
const QUALITY = 92

async function fetchAndEncode(slug, url) {
  const res = await fetch(url)
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
    `from PIL import Image
Image.open("${tmp}.big.png").convert("RGB").save(
    "${path.join(OUT, `${slug}.webp`)}", "WEBP", quality=${QUALITY}, method=6
)`,
  ])
  await run('/bin/rm', ['-f', tmp, `${tmp}.png`, `${tmp}.big.png`])
}

/* Rewrite the Set in Wallpaper.tsx from what is actually on disk, so the code
   and the folder can never disagree. */
async function writeManifest() {
  const files = (await readdir(OUT)).filter((f) => f.endsWith('.webp')).sort()
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
  console.log('encoded', args[i])
}
const slugs = await writeManifest()
console.log(`manifest: ${slugs.length} cities — ${slugs.join(', ')}`)
