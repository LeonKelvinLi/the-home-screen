#!/usr/bin/env node
/*
 * Is a string actually live on the deployed site?
 *
 * WHY THIS EXISTS. Vite code-splits: the landing screen is in index-*.js and
 * everything behind the home screen — JoinApp, AccountApp, MembersApp — is in
 * Shell-*.js. index.html only references the entry, so the obvious check,
 *
 *     curl site/ | grep -o 'assets/index-.*\.js' | xargs curl | grep 'my string'
 *
 * greps a file that was never going to contain it, and reports a deploy as
 * missing when it landed minutes ago. That happened twice in one afternoon,
 * and the second time it was mid-poll, so it read as a stalled deploy.
 *
 * So this follows the entry to every chunk it names and greps all of them.
 *
 *     node tools/live-check.mjs "Send another code" "Sign in or join"
 *     node tools/live-check.mjs --url https://staging.example.com "some string"
 *
 * Exits non-zero if any string is missing, so it can gate a wait-loop.
 */
const args = process.argv.slice(2)
let base = 'https://the-home-screen.onrender.com'
const i = args.indexOf('--url')
if (i !== -1) { base = args[i + 1]; args.splice(i, 2) }
if (!args.length) { console.error('usage: live-check.mjs [--url URL] <string>...'); process.exit(2) }

const get = async (u) => {
  const r = await fetch(u)
  if (!r.ok) throw new Error(`${r.status} ${u}`)
  return r.text()
}

const html = await get(base + '/')
const entries = [...new Set([...html.matchAll(/assets\/[A-Za-z0-9_-]+\.js/g)].map((m) => m[0]))]
if (!entries.length) { console.error('no /assets/*.js referenced by index.html'); process.exit(2) }

/*
  Follow the WHOLE import graph, not one hop.

  This used to fetch the chunks the entry names and stop — it scanned those for
  further imports only in the sense that it never looked at them. Vite splits
  more than once: the entry imports Shell, Shell imports the screens, and a
  string that only exists inside JoinApp is two hops down. On 2026-08-28 that
  reported "Sign in or join" MISSING from a deploy that was serving it, which
  is the exact false negative this file was written to prevent, one level
  deeper than the version that prevented it.

  A worklist rather than a loop over `entries`, so the depth stops mattering.
*/
const seen = new Set(entries)
const bodies = []
const queue = [...entries]
while (queue.length) {
  const path = queue.shift()
  let src
  try { src = await get(`${base}/${path}`) } catch { continue }
  bodies.push(src)
  for (const m of src.matchAll(/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8}\.js/g)) {
    const name = `assets/${m[0]}`
    if (seen.has(name)) continue
    seen.add(name)
    queue.push(name)
  }
}
const all = bodies.join('\n')
console.log(`${base} — ${seen.size} chunk(s), ${Math.round(all.length / 1024)}kB`)

let missing = 0
for (const s of args) {
  const hit = all.includes(s)
  if (!hit) missing++
  console.log(`${hit ? 'present' : 'MISSING'}  ${s}`)
}
process.exit(missing ? 1 : 0)
