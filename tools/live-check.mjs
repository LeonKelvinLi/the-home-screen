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

/* Follow the entry to the chunks it imports. One hop is enough here — Shell is
   imported by the entry — but the set is deduped so a deeper graph is safe. */
const seen = new Set(entries)
const bodies = []
for (const path of entries) {
  const src = await get(`${base}/${path}`)
  bodies.push(src)
  for (const m of src.matchAll(/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8}\.js/g)) {
    const name = `assets/${m[0]}`
    if (seen.has(name)) continue
    seen.add(name)
    try { bodies.push(await get(`${base}/${name}`)) } catch { /* not a real chunk */ }
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
