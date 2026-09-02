/*
  Runs tools/audit-data.ts under the app tsconfig, so the suite runner — which
  only picks up audit-*.mjs — covers the data audit too. It had been living
  outside the suite, which is how a data-level claim can be wrong for a week
  while every browser audit stays green.

  Grades ERRORs only. Warnings are things a human should look at, and they are
  printed; a warning is not a red run, or every verified multi-location brand
  would fail the suite forever.
*/
import { spawnSync } from 'node:child_process'
const r = spawnSync('npx', ['tsx', '--tsconfig', 'tsconfig.app.json', 'tools/audit-data.ts'], { encoding: 'utf8' })
process.stdout.write(r.stdout)
process.stderr.write(r.stderr)
const m = r.stdout.match(/(\d+) error\(s\), (\d+) warning\(s\)/)
if (!m) { console.log('\nFAIL: the data audit printed no summary line'); process.exit(1) }
if (Number(m[1]) > 0) { console.log(`\nFAIL: ${m[1]} data error(s)`); process.exit(1) }
console.log(`\nPASS: data audit — 0 errors, ${m[2]} warning(s) for a human`)
