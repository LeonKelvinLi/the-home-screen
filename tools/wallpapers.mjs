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
  1206x2622 is an iPhone 16 Pro Max at 1x logical, which every smaller phone
  downsamples cleanly from. Going larger costs bytes nothing can display.
*/
const W = 1206
const H = 2622

async function fetchAndEncode(slug, url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${slug}: download failed ${res.status}`)
  const raw = Buffer.from(await res.arrayBuffer())

  const tmp = path.join(OUT, `${slug}.src`)
  await writeFile(tmp, raw)

  // sips ships with macOS and handles HEIC/PNG/JPEG without a dependency.
  await run('/usr/bin/sips', ['-s', 'format', 'png', tmp, '--out', `${tmp}.png`])
  await run('/usr/bin/python3', [
    '-c',
    `
import sys
from PIL import Image
im = Image.open("${tmp}.png").convert("RGB")
# Cover-crop to the phone ratio rather than squashing: a stretched skyline is
# instantly obvious and a cropped one is not.
tw, th = ${W}, ${H}
scale = max(tw / im.width, th / im.height)
im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
left = (im.width - tw) // 2
top = (im.height - th) // 2
im.crop((left, top, left + tw, top + th)).save(
    "${path.join(OUT, `${slug}.webp`)}", "WEBP", quality=82, method=6
)
`,
  ])
  await run('/bin/rm', ['-f', tmp, `${tmp}.png`])
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
