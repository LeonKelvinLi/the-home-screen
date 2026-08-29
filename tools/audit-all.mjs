/*
  Run every audit and grade on what actually happened.

  GRADED ON EXIT CODES, NOT ON GREP. The previous way of running these was
  `... | grep FAIL || echo "ALL PASS"`, which reported ALL PASS twice for a
  suite that had been killed — no output means no FAIL line, and a pipeline
  that treats silence as success is worse than no check. Here an audit passes
  only by exiting 0 AND printing its own PASS line; a crash, a timeout and an
  empty log all count as failures.

  Three at a time. These each spawn a server, a database and a browser, and
  past runs at six wide pushed animations past their own timeouts and produced
  failures that were the machine, not the app.
*/
import { spawn } from 'node:child_process'
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs'

/*
  NOT EVERY AUDIT SAYS "PASS", and the answer is to learn each one's own word
  rather than to accept silence from any of them. These three sign off in their
  own wording; an audit not listed here has to print PASS. Loosening the check
  to "exit 0 is enough" would let a tool that ran and did nothing through, which
  is the exact failure this file exists to stop.
*/
const SAYS = {
  'audit-auth.mjs': /^auth: all good$/m,
  /* It prints one line per measurement and nothing else, so "an ok appeared"
     is too weak — a run that measured one thing and stopped would match. Every
     line must be an ok, and there must be a page's worth of them. */
  'audit-contrast.mjs': (out) => {
    const lines = out.trim().split('\n').filter(Boolean)
    /* Every line an ok, and all three of the things it measures present — a
       count would just be this run's number written down. */
    return (
      lines.length > 0 &&
      lines.every((l) => l.startsWith('ok')) &&
      ['.brand-offer-head', '.brand-offer-body', '.brand-offer-when'].every((sel) => out.includes(sel))
    )
  },
  /* These three end on a count, and the count is the verdict — NOTE lines
     above it are observations, not failures. */
  'audit-design.mjs': /^0 error\(s\), 0 warning\(s\)$/m,
  'audit-run.mjs': /^0 error\(s\), 0 warning\(s\)$/m,
  'audit-ux.mjs': /^UX: nothing found\.$/m,
}
const passLine = (file, out) => {
  const rule = SAYS[file] ?? /\bPASS\b/
  return typeof rule === 'function' ? rule(out) : rule.test(out)
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const all = readdirSync('tools').filter((f) => f.startsWith('audit-') && f.endsWith('.mjs') && f !== 'audit-all.mjs')
const list = only.length ? all.filter((f) => only.some((o) => f.includes(o))) : all
const dir = '/tmp/beasty-suite'
mkdirSync(dir, { recursive: true })

const run = (file) => new Promise((res) => {
  const started = Date.now()
  const c = spawn('node', [`tools/${file}`], { env: { ...process.env, FORCE_COLOR: '0' } })
  let out = ''
  const cap = (d) => { out += d.toString() }
  c.stdout.on('data', cap)
  c.stderr.on('data', cap)
  const t = setTimeout(() => { c.kill('SIGKILL'); out += '\n[suite] killed after 600s\n' }, 600000)
  c.on('close', (code) => {
    clearTimeout(t)
    writeFileSync(`${dir}/${file}.log`, out)
    const said = passLine(file, out)
    res({ file, code, said, out, secs: Math.round((Date.now() - started) / 1000) })
  })
})

const results = []
const queue = [...list]
const workers = Array.from({ length: 3 }, async () => {
  for (let f = queue.shift(); f; f = queue.shift()) {
    const r = await run(f)
    const ok = r.code === 0 && r.said
    results.push({ ...r, ok })
    console.log(`${ok ? 'pass' : 'FAIL'}  ${r.file.padEnd(30)} ${String(r.secs).padStart(4)}s  exit ${r.code}${r.said ? '' : '  (no PASS line)'}`)
  }
})
await Promise.all(workers)

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`)
for (const f of failed) {
  console.log(`\n--- ${f.file} (${dir}/${f.file}.log)`)
  console.log(f.out.trim().split('\n').slice(-14).join('\n'))
}
process.exit(failed.length ? 1 : 0)
